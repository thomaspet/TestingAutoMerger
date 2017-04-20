import {Component, Input, SimpleChange, ViewChild, OnInit, OnChanges, Output, EventEmitter} from '@angular/core';
import {JournalEntryProfessional} from '../components/journalentryprofessional/journalentryprofessional';
import {SupplierInvoice, Dimensions, FinancialYear, ValidationLevel, VatDeduction, CompanySettings} from '../../../../unientities';
import {ValidationMessage, ValidationResult} from '../../../../models/validationResult';
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
    Payment
}

@Component({
    selector: 'journal-entry-manual',
    host: { '[class.runassubcomponent]': 'runAsSubComponent' },
    templateUrl: './journalentrymanual.html'
})
export class JournalEntryManual implements OnChanges, OnInit {
    @Input() public journalEntryID: number = 0;
    @Input() public runAsSubComponent: boolean = false;
    @Input() public mode: number;
    @Input() public disabled: boolean = false;
    @Input() public editmode: boolean = false;

    @Output() public dataCleared: EventEmitter<any> = new EventEmitter<any>();

    @ViewChild(UniConfirmModal) private confirmModal: UniConfirmModal;
    @ViewChild(JournalEntryProfessional) private journalEntryProfessional: JournalEntryProfessional;

    private hasLoadedData: boolean = false;
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
        this.journalEntrySettings = this.journalEntryService.getJournalEntrySettings(this.mode);

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

                if (!this.hasLoadedData) {
                    this.loadData();
                }

                this.setSums();
                this.setupSubscriptions();
            },
            err => this.errorService.handle(err)
        );
    }

    public ngOnChanges(changes: { [propName: string]: SimpleChange }) {
        if (changes['journalEntryID'] || changes['editmode']) {
            this.loadData();
        }

        if (changes['editmode'] || changes['runAsSubComponent']) {
            setTimeout(() => {
                this.setupSaveConfig();
            });
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
            let newActions = [
                {
                    label: 'Lagre og bokfør',
                    action: (completeEvent) => this.postJournalEntryData(completeEvent),
                    main: true,
                    disabled: !this.isDirty
                }
            ];

            this.saveactions = newActions;
        }
    }

    public loadData() {
        this.clearJournalEntryInfo();
        this.hasLoadedData = true;

        let data = this.journalEntryService.getSessionData(this.mode);

        // if data is present in the sessionStorage, but the journalEntryID is not set,
        // consider setting it. This will happen if the user starts editing a journalentry,
        // then leaves the view and reenters it through the menu
        if (!this.journalEntryID && data && data.length > 0) {
            if (data[0].JournalEntryID) {
                this.journalEntryID = data[0].JournalEntryID;
            }
        }

        if (this.journalEntryID > 0) {
            if (data && data.length > 0 && data[0].JournalEntryID && data[0].JournalEntryID.toString() === this.journalEntryID.toString()) {
                // this means we have started adding data to this journalentry and then
                // navigated to another component and back again - so the data is already
                // dirty and we are in edit mode
                this.isDirty = true;
                this.disabled = false;
                this.setJournalEntryData(data);
            } else {
                // We have asked to show an existing journalentry, load it from the API and show it.
                // Assume the parent compont has set the disabled property and thereby specifies if
                // the component should be read only or not
                this.journalEntryService.getJournalEntryDataByJournalEntryID(this.journalEntryID)
                    .subscribe((serverLines: Array<JournalEntryData>) => {
                        this.isDirty = false;
                        this.disabled = !this.editmode;
                        this.setJournalEntryData(serverLines);
                    },
                    err => this.errorService.handle(err)
                );
            }
        } else {
            // we have not asked for a specific journalentry, so just load the current data
            // if we have any in our sessionStorage
            if (data && data.length > 0) {
                // if we have any unsaved data in our sessionStorage, show that data.
                this.isDirty = true;
                this.disabled = false;
                this.setJournalEntryData(data);
            } else {
                this.disabled = false;
                this.setJournalEntryData([]);
            }
        }
    }

    private onShowImageChanged(showImage: boolean) {
        this.journalEntrySettings.AttachmentsVisible = showImage;
        this.journalEntryService.setJournalEntrySettings(this.journalEntrySettings, this.mode);
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
        this.journalEntryService.setJournalEntrySettings(this.journalEntrySettings, this.mode);
    }

    public addJournalEntryData(data: JournalEntryData) {
        data.SameOrNew = '1';
        this.isDirty = true;
        if (this.journalEntryProfessional) {
            this.journalEntryProfessional.addJournalEntryLine(data);
        }
        this.setupSaveConfig();
    }

    public getJournalEntryData(): Array<JournalEntryData> {
        if (this.journalEntryProfessional) {
            return this.journalEntryProfessional.getTableData();
        }
    }

    public setJournalEntryData(lines: Array<JournalEntryData>) {
        if (this.journalEntryProfessional) {
            this.journalEntryProfessional.setJournalEntryData(lines);
        } else {
            setTimeout(() => {
                if (this.journalEntryProfessional) {
                    this.journalEntryProfessional.setJournalEntryData(lines);
                } else {
                    console.error('Could not set data, journalentryprofessional not initialised');
                }
            });
        }

        // run this after the rest of the databinding is complete - if not it can cause multiple
        // changes in the same change detection cycle, and this makes angular really cranky
        setTimeout(() => {
            this.setupSaveConfig();
        });

        this.calculateItemSums(lines);

        if (!this.currentFinancialYear) {
            // wait a moment before trying to validate the data
            // because the currentyears have not been retrieved yet
            setTimeout(() => {
                if (this.currentFinancialYear) {
                    this.validateJournalEntryData(lines);
                }
            }, 1000);
        } else {
            this.validateJournalEntryData(lines);
        }
    }

    private setupSubscriptions() {
        setTimeout(() => {
            if (this.journalEntryProfessional) {
                if (this.journalEntryProfessional.dataChanged.observers.length === 0) {
                    this.journalEntryProfessional.dataChanged.debounceTime(300).subscribe((values) => this.onDataChanged(values));
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
            let updatedCurrentJournalEntryData =
                data.find(x => x['_originalIndex'] === this.currentJournalEntryData['_originalIndex']);

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

            this.setupSaveConfig();
        });
    }

    private onDataLoaded(data: JournalEntryData[]) {
        this.calculateItemSums(data);
    }

    private onRowSelected(selectedRow: JournalEntryData) {
        this.currentJournalEntryData = selectedRow;

        if (this.journalEntryProfessional) {
            let data = this.journalEntryProfessional.getTableData();

            if (this.currentFinancialYear){
                this.journalEntryService.getAccountBalanceInfo(data, this.accountBalanceInfoData, this.currentFinancialYear)
                    .subscribe(accountBalanceData => {
                        this.accountBalanceInfoData = accountBalanceData;
                        this.itemAccountInfoData =
                            this.journalEntryService.calculateJournalEntryAccountSummaryLocal(data, this.accountBalanceInfoData, this.vatDeductions, this.currentJournalEntryData);
                    });
            }
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
        // allow events from UniTable to finish, e.g. if the focus was in a cell
        // when the user clicked the save button the unitable events should be allowed
        // to run first, to let it update its' datasource
        setTimeout(() => {
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
                if (this.journalEntryProfessional) {

                    this.journalEntryProfessional.postJournalEntryData((result: string) => {
                        completeCallback(result);

                        if (result && result !== '') {
                            this.onDataChanged([]);
                            this.clearJournalEntryInfo();
                            this.dataCleared.emit();
                        }
                    });

                    this.onShowImageForJournalEntry(null);
                }
            });
        });
    }

    public removeJournalEntryData() {
        if (this.journalEntryProfessional) {
            this.journalEntryProfessional.removeJournalEntryData((msg: string) => {
                if (msg) {
                    this.clearJournalEntryInfo();
                    this.dataCleared.emit();

                    setTimeout(() => {
                        this.setupSaveConfig();
                    });
                }
            }, this.isDirty);
        }
    }

    private unlockJournalEntry(completeCallback) {
        this.disabled = false;
        completeCallback('Låst opp bilag');
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
