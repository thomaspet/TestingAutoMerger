import {Component, Input, SimpleChange, ViewChild, OnInit, OnChanges} from '@angular/core';
import {JournalEntrySimple} from '../components/journalentrysimple/journalentrysimple';
import {JournalEntryProfessional} from '../components/journalentryprofessional/journalentryprofessional';
import {SupplierInvoice, Dimensions, FinancialYear, ValidationResult, ValidationMessage, ValidationLevel, VatDeduction, CompanySettings} from '../../../../unientities';
import {JournalEntryData} from '../../../../models/models';
import {JournalEntrySimpleCalculationSummary} from '../../../../models/accounting/JournalEntrySimpleCalculationSummary';
import {JournalEntryAccountCalculationSummary} from '../../../../models/accounting/JournalEntryAccountCalculationSummary';
import {AccountBalanceInfo} from '../../../../models/accounting/AccountBalanceInfo';
import {IUniSaveAction} from '../../../../../framework/save/save';
import {ISummaryConfig} from '../../../common/summary/summary';
import {Observable} from 'rxjs/Observable';
import {ToastService, ToastType, ToastTime} from '../../../../../framework/uniToast/toastService';
import {UniConfirmModal, ConfirmActions} from '../../../../../framework/modals/confirm';
import {
    JournalEntrySettings,
    NumberFormat,
    ErrorService,
    JournalEntryService,
    FinancialYearService,
    VatDeductionService,
    CompanySettingsService
} from '../../../../services/services';

export enum JournalEntryMode {
    Manual,
    Supplier,
    Payment,
    JournalEntryView
}

@Component({
    selector: 'journal-entry-manual',
    host: { '[class.runassubcomponent]': 'runAsSubComponent' },
    templateUrl: 'app/components/accounting/journalentry/journalentrymanual/journalentrymanual.html'
})
export class JournalEntryManual implements OnChanges, OnInit {
    @Input() public supplierInvoice: SupplierInvoice;
    @Input() public journalEntryID: number = 0;
    @Input() public runAsSubComponent: boolean = false;
    @Input() public mode: number;
    @Input() public disabled: boolean = false;

    @ViewChild(UniConfirmModal) private confirmModal: UniConfirmModal;
    @ViewChild(JournalEntrySimple) private journalEntrySimple: JournalEntrySimple;
    @ViewChild(JournalEntryProfessional) private journalEntryProfessional: JournalEntryProfessional;

    private journalEntryMode: string;
    private showImagesForJournalEntryNo: string = '';
    private currentJournalEntryImages: number[] = [];
    private currentJournalEntryData: JournalEntryData;

    private companySettings: CompanySettings;
    private financialYears: Array<FinancialYear>;
    public currentFinancialYear: FinancialYear;
    private vatDeductions: Array<VatDeduction>;

    private itemsSummaryData: JournalEntrySimpleCalculationSummary = new JournalEntrySimpleCalculationSummary();
    private itemAccountInfoData: JournalEntryAccountCalculationSummary = new JournalEntryAccountCalculationSummary();
    private accountBalanceInfoData: Array<AccountBalanceInfo> = new Array<AccountBalanceInfo>();

    public validationResult: ValidationResult;
    public summary: ISummaryConfig[] = [];
    public journalEntrySettings: JournalEntrySettings;

    public saveactions: IUniSaveAction[];
    public isDirty: boolean = false;

    constructor(
        private journalEntryService: JournalEntryService,
        private financialYearService: FinancialYearService,
        private numberFormat: NumberFormat,
        private errorService: ErrorService,
        private toastService: ToastService,
        private vatDeductionService: VatDeductionService,
        private companySettingsService: CompanySettingsService
    ) {
    }

    public ngOnInit() {
        this.journalEntryMode = this.journalEntryService.getJournalEntryMode();
        this.journalEntrySettings = this.journalEntryService.getJournalEntrySettings();

        Observable.forkJoin(
            this.financialYearService.GetAll(null),
            this.financialYearService.getActiveFinancialYear(),
            this.vatDeductionService.GetAll(null),
            this.companySettingsService.Get(1)
        ).subscribe(data => {
                this.financialYears = data[0];
                this.currentFinancialYear = data[1];
                this.vatDeductions = data[2];
                this.companySettings = data[3];

                this.loadData();
                this.setupSaveConfig();

                this.setSums();
                this.setupSubscriptions();
            },
            err => this.errorService.handle(err)
        );
    }

    public ngOnChanges(changes: { [propName: string]: SimpleChange }) {
        if (changes['supplierInvoice'] || changes['journalEntryID']) {
            this.loadData();
            this.setupSaveConfig();
        } else if (changes['disabled'] || changes['journalEntryID'] || changes['runAsSubComponent']) {
            this.setupSaveConfig();
        }

        this.setupSubscriptions();
    }

    public clearJournalEntryInfo() {
        this.showImagesForJournalEntryNo = null;
        this.currentJournalEntryImages = [];
        this.validationResult = null;
        this.itemsSummaryData = new JournalEntrySimpleCalculationSummary();
        this.currentJournalEntryData = null;
        this.accountBalanceInfoData = new Array<AccountBalanceInfo>();
        this.itemAccountInfoData = new JournalEntryAccountCalculationSummary();
        this.isDirty = false;
    }

    private setupSaveConfig() {
        if (!this.runAsSubComponent) {
            this.saveactions = [
                {
                    label: 'Lagre og bokfør',
                    action: (completeEvent) => this.postJournalEntryData(completeEvent),
                    main: true,
                    disabled: this.disabled
                },
                {
                    label: 'Slett alle bilag i listen',
                    action: (completeEvent) => this.removeJournalEntryData(completeEvent),
                    main: false,
                    disabled: this.disabled
                }
            ];
        }
    }

    public loadData() {
        this.clearJournalEntryInfo();

        if (this.supplierInvoice) {
            this.mode = JournalEntryMode.Supplier;
            this.journalEntryService.getJournalEntryDataBySupplierInvoiceID(this.supplierInvoice.ID)
                .subscribe(data => {
                    this.setJournalEntryData(data);
                }, err => this.errorService.handle(err));
        } else if (this.journalEntryID > 0) {
            this.disabled = true;
            this.journalEntryService.getJournalEntryDataByJournalEntryID(this.journalEntryID)
                .subscribe((data: Array<JournalEntryData>) => {
                    this.setJournalEntryData(data);
                    this.calculateItemSums(data);
                }, err => this.errorService.handle(err));
        } else {
            this.disabled = false;

            let data = this.journalEntryService.getSessionData(this.mode);

            if (data && data.length > 0) {
                this.isDirty = true;

                // if we have any unsaved data in our sessionStorage, show this data. This needs to happen after a setTimeout
                // to let Angular create the child components first
                setTimeout(() => {
                    this.setJournalEntryData(data);

                    if (!this.currentFinancialYear) {
                        // wait a moment before trying to validate the data
                        // because the currentyears have not been retrieved yet
                        setTimeout(() => {
                            if (this.currentFinancialYear) {
                                this.validateJournalEntryData(data);
                            }
                        }, 1000);
                    } else {
                        this.validateJournalEntryData(data);
                    }
                });
            } else {
                this.setJournalEntryData([]);
            }
        }
    }

    public setJournalEntryMode(newMode: string) {
        let lines: Array<JournalEntryData>;

        // get existing data from the view that is visible now
        if (newMode === 'SIMPLE') {
            if (this.journalEntryProfessional) {
                lines = this.journalEntryProfessional.getTableData();
            }
        } else {
            if (this.journalEntrySimple) {
                lines = this.journalEntrySimple.journalEntryLines;
            }
        }

        // update localstorage with preference for what mode to use (simple/professional)
        this.journalEntryService.setJournalEntryMode(newMode);
        this.journalEntryMode = this.journalEntryService.getJournalEntryMode();

        // fix data to avoid problem with different formats/structures
        let data = JSON.parse(JSON.stringify(lines));
        data.forEach(line => {
            line.FinancialDate = new Date(line.FinancialDate);
        });

        // let angular setup the viewchild, it does not exist until a change cycle has been runAsSubComponent
        setTimeout(() => {
            if (newMode === 'SIMPLE') {
                if (this.journalEntrySimple) {
                    this.journalEntrySimple.journalEntryLines = data;
                }
            } else {
                if (this.journalEntryProfessional) {
                    this.journalEntryProfessional.setJournalEntryData(data);
                }
            }
        });
    }

    private onShowImageChanged(showImage: boolean) {
        this.journalEntrySettings.AttachmentsVisible = showImage;
        this.journalEntryService.setJournalEntrySettings(this.journalEntrySettings);
    }

    private onShowImageForJournalEntry(journalEntry: JournalEntryData) {
        if (journalEntry) {
            if (this.showImagesForJournalEntryNo !== journalEntry.JournalEntryNo) {
                this.showImagesForJournalEntryNo = journalEntry.JournalEntryNo;
                this.currentJournalEntryImages = journalEntry.FileIDs;
            }
        } else {
            this.showImagesForJournalEntryNo = null;
            this.currentJournalEntryImages = [];
        }
    }

    private onFileListReady(files) {
        if (this.journalEntryID > 0) {
            // don't look for changes if this is a presaved journalentry - we wont
            // persist the changes anyway, it this analysis could cause incorrect
            // dirty checking if the API is slow or the user really fast
            return;
        }

        let fileIds: number[] = [];

        files.forEach(file => {
            fileIds.push(parseInt(file.ID));
        });

        let didChangeAnything: boolean = false;
        let didFindJournalEntry: boolean = false;
        let data = this.getJournalEntryData();

        data.forEach(entry => {
            if (entry.JournalEntryNo === this.showImagesForJournalEntryNo) {
                if (!entry.FileIDs) {
                    entry.FileIDs = fileIds;
                    didChangeAnything = true;
                } else {
                    fileIds.forEach(id => {
                        if (!entry.FileIDs.find(x => x === id)) {
                            entry.FileIDs.push(id);
                            didChangeAnything = true;
                        }
                    });
                }

                didFindJournalEntry = true;
            }
        });

        if (!didFindJournalEntry) {
            let newJournalEntry = new JournalEntryData();
            newJournalEntry.FileIDs = fileIds;
            newJournalEntry.Dimensions = new Dimensions();
            data.push(JSON.parse(JSON.stringify(newJournalEntry)));

            didChangeAnything = true;
        }

        if (didChangeAnything) {
            this.isDirty = true;

            // something was updated, update datasource for unitable
            this.setJournalEntryData(data);

            // save journalentries to sessionStorage - this is done in case the user switches tabs while entering
            this.journalEntryService.setSessionData(this.mode, data);
        }
    }

    public onColumnVisibilityChange(visibleColumns: Array<string>) {
        this.journalEntrySettings.DefaultVisibleFields = visibleColumns;
        this.journalEntryService.setJournalEntrySettings(this.journalEntrySettings);
    }

    public addJournalEntryData(data: JournalEntryData) {
        data.SameOrNew = '1';
        this.isDirty = true;

        if (this.journalEntryProfessional) {
            this.journalEntryProfessional.addJournalEntryLine(data);
        } else if (this.journalEntrySimple) {

            this.journalEntrySimple.journalEntryLines.push(data);
            this.onDataChanged(this.journalEntrySimple.journalEntryLines);
        }
    }

    public getJournalEntryData(): Array<JournalEntryData> {
        if (this.journalEntrySimple) {
            return this.journalEntrySimple.journalEntryLines;
        } else if (this.journalEntryProfessional) {
            return this.journalEntryProfessional.getTableData();
        }
    }

    public setJournalEntryData(lines: Array<JournalEntryData>) {
        if (this.journalEntrySimple) {
            this.journalEntrySimple.journalEntryLines = lines;
        } else if (this.journalEntryProfessional) {
            this.journalEntryProfessional.setJournalEntryData(lines);
        }
    }

    private setupSubscriptions() {
        setTimeout(() => {
            if (this.journalEntryProfessional) {
                if (this.journalEntryProfessional.dataChanged.observers.length === 0) {
                    this.journalEntryProfessional.dataChanged.debounceTime(300).subscribe((values) => this.onDataChanged(values));
                }
            }

            if (this.journalEntrySimple) {
                if (this.journalEntrySimple.dataChanged.observers.length === 0) {
                    this.journalEntrySimple.dataChanged.debounceTime(300).subscribe((values) => this.onDataChanged(values));
                }
            }
        });
    }

    private onDataChanged(data: JournalEntryData[]) {
        if (data.length <= 0) {
            this.itemsSummaryData = new JournalEntrySimpleCalculationSummary();
            this.setSums();

            this.itemAccountInfoData = new JournalEntryAccountCalculationSummary();
            this.accountBalanceInfoData = new Array<AccountBalanceInfo>();

            this.journalEntryService.setSessionData(this.mode, null);
            return;
        }

        this.isDirty = true;

        if (this.currentJournalEntryData) {
            let updatedCurrentJournalEntryData = data.find(x => x['_originalIndex'] === this.currentJournalEntryData['_originalIndex']);
            this.currentJournalEntryData = updatedCurrentJournalEntryData;
        }

        setTimeout(() => {
            data.forEach((x) => {
                x.Amount = x.Amount || 0;
            });

            // save journalentries to sessionStorage - this is done in case the user switches tabs while entering
            this.journalEntryService.setSessionData(this.mode, data);

            this.validateJournalEntryData(data);
            this.calculateItemSums(data);
        });
    }

    private onDataLoaded(data: JournalEntryData[]) {
        this.calculateItemSums(data);
    }

    private onRowSelected(selectedRow: JournalEntryData) {
        this.currentJournalEntryData = selectedRow;

        if (this.journalEntryProfessional) {
            let data = this.journalEntryProfessional.getTableData();

            this.journalEntryService.getAccountBalanceInfo(data, this.accountBalanceInfoData, this.currentFinancialYear)
                .subscribe(accountBalanceData => {
                    this.accountBalanceInfoData = accountBalanceData;
                    this.itemAccountInfoData =
                        this.journalEntryService.calculateJournalEntryAccountSummaryLocal(data, this.accountBalanceInfoData, this.vatDeductions, this.currentJournalEntryData);
                });
        }
    }

    private calculateItemSums(data: JournalEntryData[]) {
        this.itemsSummaryData = this.journalEntryService.calculateJournalEntrySummaryLocal(data, this.vatDeductions);

        if (this.currentJournalEntryData) {
            this.journalEntryService.getAccountBalanceInfo(data, this.accountBalanceInfoData, this.currentFinancialYear)
                .subscribe(accountBalanceData => {
                    this.accountBalanceInfoData = accountBalanceData;
                    this.itemAccountInfoData =
                        this.journalEntryService.calculateJournalEntryAccountSummaryLocal(data, this.accountBalanceInfoData, this.vatDeductions, this.currentJournalEntryData);
                });

        }

        this.setSums();

        /*
        KE 08.11.2016: Switch to running the summaries locally.
        this.journalEntryService.calculateJournalEntrySummary(data)
            .subscribe((sumdata) => {
                this.itemsSummaryData = sumdata;
            },
            (err) => {
                console.log('Error when recalculating journal entry summary:', err);
            }
        );
        */
    }

    private validateJournalEntryData(data: JournalEntryData[]) {
        this.validationResult = this.journalEntryService.validateJournalEntryDataLocal(data, this.currentFinancialYear, this.financialYears, this.companySettings);

        /*
        KE 08.11.2016: Switch to running the validations locally. The serverside validation is executed when posting anyway
        this.journalEntryService.validateJournalEntryData(data)
            .subscribe(
            result => {
                this.validationResult = result;
            },
            err => {
                console.log('error int validateJournalEntryData:', err);
            });
        */
    }

    private postJournalEntryData(completeCallback) {
        new Promise((resolve, reject) => {
            if (this.validationResult && this.validationResult.Messages.length > 0) {
                let errorMessages = this.validationResult.Messages.filter(x => x.Level === ValidationLevel.Error);
                let warningMessages = this.validationResult.Messages.filter(x => x.Level === ValidationLevel.Warning);

                if (errorMessages.length > 0) {
                    this.toastService.addToast(
                        'Kan ikke lagre',
                        ToastType.bad,
                        ToastTime.long,
                        'Lagring avbrutt - se feilmeldinger under, og korriger linjene som er feil før du lagrer på ny'
                    );
                    completeCallback('Lagring avbrutt');
                } else if (warningMessages.length > 0) {
                    this.confirmModal.confirm(
                        'Det finnes advarsler, men du kan bokføre likevel hvis dataene dine er riktige',
                        'Lagre og bokfør likevel?',
                        false,
                        {accept: 'Lagre og bokfør', reject: 'Avbryt'}
                    ).then(confirmDialogResponse => {
                        if (confirmDialogResponse === ConfirmActions.ACCEPT) {
                            resolve();
                        } else {
                            completeCallback('Lagring avbrutt');
                        }
                    });
                } else {
                    resolve();
                }
            } else {
                resolve();
            }

        })
        .then(() => {
            if (this.journalEntrySimple) {
                if (this.journalEntrySimple.journalEntryLines.length === 0) {
                    this.toastService.addToast(
                        'Du har ikke lagt til noen bilag enda',
                        ToastType.bad,
                        ToastTime.medium,
                        'Trykk Legg til når du har registrert opplysningene dine, og trykk Lagre og bokfør igjen'
                    );
                    completeCallback('Lagring avbrutt');
                } else if (this.journalEntrySimple.checkIfFormsHaveChanges()) {
                    this.toastService.addToast(
                        'Du har gjort endringer uten å trykke Legg til / Oppdater',
                        ToastType.bad,
                        ToastTime.medium,
                        'Vennligst fullfør endringene før du trykker Lagre og bokfør igjen'
                    );
                    completeCallback('Lagring avbrutt');
                } else {
                    this.journalEntrySimple.postJournalEntryData((result: string) => {
                        completeCallback(result);
                        this.clearJournalEntryInfo();
                    });
                }
            } else if (this.journalEntryProfessional) {
                this.journalEntryProfessional.postJournalEntryData((result: string) => {
                    completeCallback(result);
                    this.clearJournalEntryInfo();
                });
                this.onShowImageForJournalEntry(null);
            }
        });
    }

    private removeJournalEntryData(completeCallback) {
        this.clearJournalEntryInfo();

        if (this.journalEntrySimple) {
            this.journalEntrySimple.removeJournalEntryData(completeCallback);
        } else if (this.journalEntryProfessional) {
            this.journalEntryProfessional.removeJournalEntryData(completeCallback);
        }

        this.onShowImageForJournalEntry(null);
    }

    private useSimpleMode() {
        this.journalEntryMode = 'SIMPLE';
        this.setupSubscriptions();
    }

    private useProMode() {
        this.journalEntryMode = 'PROFFESIONAL';
        this.setupSubscriptions();
    }

    private setSums() {
        this.summary = [{
                value: this.itemsSummaryData ? this.numberFormat.asMoney(this.itemsSummaryData.SumDebet || 0) : null,
                title: 'Sum debet',
            }, {
                value: this.itemsSummaryData ? this.numberFormat.asMoney(this.itemsSummaryData.SumCredit || 0) : null,
                title: 'Sum kreditt',
            }, {
                value: this.itemsSummaryData ? this.numberFormat.asMoney(this.itemsSummaryData.Differance || 0) : null,
                title: 'Differanse',
            }, {
                value: this.itemsSummaryData ? this.numberFormat.asMoney(this.itemsSummaryData.IncomingVat || 0) : null,
                title: 'Inng.mva',
            }, {
                value: this.itemsSummaryData ? this.numberFormat.asMoney(this.itemsSummaryData.OutgoingVat || 0) : null,
                title: 'Utg.mva',
            }];
    }

    private getValidationLevelCss(validationLevel) {
        if (validationLevel === ValidationLevel.Error) {
            return 'error';
        } else if (validationLevel === ValidationLevel.Warning) {
            return 'warn';
        }
        return 'good';
    }

    private getFormattedNumber(number): string {
        if (number) {
            return this.numberFormat.asMoney(number);
        }

        return '';
    }
}
