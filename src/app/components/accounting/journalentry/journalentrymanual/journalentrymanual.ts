import {Component, Input, SimpleChange, ViewChild, OnInit, OnChanges, Output, EventEmitter, HostListener} from '@angular/core';
import {JournalEntryProfessional} from '../components/journalentryprofessional/journalentryprofessional';
import {
    Dimensions,
    FinancialYear,
    ValidationLevel,
    VatDeduction,
    CompanySettings,
    JournalEntryLine,
    NumberSeriesTask,
    VatType,
    NumberSeries,
    LocalDate,
    JournalEntryLineDraft,
    CostAllocation,
} from '../../../../unientities';
import {ValidationResult} from '../../../../models/validationResult';
import {JournalEntryData, FieldAndJournalEntryData, CostAllocationData} from '@app/models';
import {JournalEntrySimpleCalculationSummary} from '../../../../models/accounting/JournalEntrySimpleCalculationSummary';
import {JournalEntryAccountCalculationSummary} from '../../../../models/accounting/JournalEntryAccountCalculationSummary';
import {AccountBalanceInfo} from '../../../../models/accounting/AccountBalanceInfo';
import {IUniSaveAction} from '../../../../../framework/save/save';
import {ISummaryConfig} from '../../../common/summary/summary';
import {Observable, forkJoin} from 'rxjs';
import {ConfirmCreditedJournalEntryWithDate} from '../../modals/confirmCreditedJournalEntryWithDate';
import {
    ToastService,
    ToastType,
    ToastTime
} from '../../../../../framework/uniToast/toastService';
import {
    UniTable,
    UniTableColumn,
    UniTableColumnType,
    UniTableConfig
} from '../../../../../framework/ui/unitable/index';
import {
    JournalEntrySettings,
    NumberFormat,
    ErrorService,
    JournalEntryService,
    FinancialYearService,
    VatDeductionService,
    CompanySettingsService,
    JournalEntryLineService,
    NumberSeriesTaskService,
    NumberSeriesService,
    VatTypeService,
    CostAllocationService,
    AccountService,
    AccountMandatoryDimensionService,
    SupplierService,
    DimensionService,
    StatisticsService
} from '../../../../services/services';
import {JournalEntryMode} from '../../../../services/accounting/journalEntryService';
import {
    UniModalService,
    UniConfirmModalV2,
    ConfirmActions
} from '../../../../../framework/uni-modal';
import * as _ from 'lodash';
import { FileFromInboxModal } from '../../modals/file-from-inbox-modal/file-from-inbox-modal';
import { fork } from 'child_process';

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
    @Input() public creditDate: LocalDate = null;
    @Input() public singleRowMode: boolean = false; // used if you dont want debit/credit, just rows
    @Input() public doValidateBalance: boolean = true;
    @Input() public defaultRowData: JournalEntryData;
    @Input() public selectedNumberSeries: NumberSeries;
    @Input() public orgNumber: string;
    @Input() public costAllocationData: CostAllocationData = new CostAllocationData();

    @Output() public dataCleared: EventEmitter<any> = new EventEmitter<any>();
    @Output() public componentInitialized: EventEmitter<any> = new EventEmitter<any>();
    @Output() public dataChanged: EventEmitter<any> = new EventEmitter<any>();
    @Output() public dataLoaded: EventEmitter<any> = new EventEmitter<any>();

    @ViewChild(UniTable) private openPostsTable: UniTable;
    @ViewChild(JournalEntryProfessional)

    public journalEntryProfessional: JournalEntryProfessional;

    private hasLoadedData: boolean = false;
    private showImagesForJournalEntryNo: string = '';
    public currentJournalEntryImages: number[] = [];
    public currentJournalEntryData: JournalEntryData;
    public currentJournalEntryID: string;

    private companySettings: CompanySettings;
    public financialYears: Array<FinancialYear>;
    public currentFinancialYear: FinancialYear;
    public vatDeductions: Array<VatDeduction>;
    public vatTypes: Array<VatType>;

    public itemsSummaryData: JournalEntrySimpleCalculationSummary = new JournalEntrySimpleCalculationSummary();
    private itemAccountInfoData: JournalEntryAccountCalculationSummary = new JournalEntryAccountCalculationSummary();
    private accountBalanceInfoData: Array<AccountBalanceInfo> = new Array<AccountBalanceInfo>();

    private lastRetrievedOpenPostsRowIndex: number = null;
    private lastRetrievedOpenPostsExpectedPositive: boolean = null;
    private openPostsForSelectedRow: Array<JournalEntryLine> = null;
    private openPostTableConfig: UniTableConfig = null;
    private openPostRetrievingDataInProgress: boolean = false;
    private numberOfAccountsWithMandatoryDimensions: number = 0;
    public validationResult: ValidationResult;
    public summary: ISummaryConfig[] = [];
    public journalEntrySettings: JournalEntrySettings;

    public numberSeriesTasks: Array<NumberSeriesTask>;
    public numberSeries: Array<NumberSeries>;

    public saveactions: IUniSaveAction[];
    public isDirty: boolean = false;
    public attachmentsMinimized: boolean;
    public attachmentsStacked: boolean;

    @HostListener('keydown', ['$event'])
    public onKeyDown(event: KeyboardEvent) {
        const key = event.which || event.keyCode;

        if (key === 73 && (navigator.platform.match('Mac') ? event.metaKey : event.ctrlKey)) {
            event.preventDefault();

            // Give components a chance to update disabled state
            // because there might be changes triggered by ctrl+s (table blur etc)
            setTimeout(() => {
                this.openAddFileModal();
            });
        }
    }

    constructor(
        private journalEntryService: JournalEntryService,
        private financialYearService: FinancialYearService,
        private numberFormat: NumberFormat,
        private errorService: ErrorService,
        private toastService: ToastService,
        private vatDeductionService: VatDeductionService,
        private vatTypeService: VatTypeService,
        private companySettingsService: CompanySettingsService,
        private journalEntryLineService: JournalEntryLineService,
        private numberSeriesService: NumberSeriesService,
        private numberSeriesTaskService: NumberSeriesTaskService,
        private modalService: UniModalService,
        private costAllocationService: CostAllocationService,
        private accountService: AccountService,
        private supplierService: SupplierService,
        private dimensionService: DimensionService,
        private accountMandatoryDimensionService: AccountMandatoryDimensionService,
        private statisticsService: StatisticsService
    ) {}

    public ngOnInit() {
        this.journalEntrySettings = this.journalEntryService.getJournalEntrySettings(this.mode);
        this.currentFinancialYear = this.financialYearService.getActiveFinancialYear();

        Observable.forkJoin(
            this.financialYearService.GetAll(null),
            this.vatDeductionService.GetAll(null),
            this.companySettingsService.Get(1),
            this.vatTypeService.GetAll('orderby=VatCode'),
            this.numberSeriesService.getActiveNumberSeries('JournalEntry', this.currentFinancialYear.Year),
            this.accountMandatoryDimensionService.GetNumberOfAccountsWithMandatoryDimensions()
        ).subscribe(data => {
                this.financialYears = data[0];
                this.vatDeductions = data[1];
                this.companySettings = data[2];
                this.vatTypes = data[3];

                const series = data[4];
                this.numberSeries = this.numberSeriesService.CreateAndSet_DisplayNameAttributeOnSeries(series);
                this.numberOfAccountsWithMandatoryDimensions = data[5];
                if (!this.hasLoadedData) {
                    this.loadData();
                }
                this.setSums();
                this.setupSubscriptions();

                setTimeout(() => {
                    this.componentInitialized.emit();
                });
            },
            err => this.errorService.handle(err)
        );

        this.setupOpenPostUniTable();
    }

    public ngOnChanges(changes: { [propName: string]: SimpleChange }) {
        if (this.vatTypes && changes['journalEntryID'] || changes['editmode']) {
            this.loadData();
        }

        if (changes['editmode'] || changes['runAsSubComponent']) {
            setTimeout(() => {
                this.setupSaveConfig();
            });
        }

        this.setupSubscriptions();
    }

    public clear() {
        this.disabled = false;
        this.editmode = false;
        this.journalEntryID = 0;
        this.clearJournalEntryInfo();
        this.dataCleared.emit();
    }

    public clearJournalEntryInfo() {
        this.showImagesForJournalEntryNo = null;
        this.currentJournalEntryImages = [];
        this.validationResult = null;
        this.creditDate = null;
        this.itemsSummaryData = new JournalEntrySimpleCalculationSummary();
        this.currentJournalEntryData = null;
        this.accountBalanceInfoData = new Array<AccountBalanceInfo>();
        this.itemAccountInfoData = new JournalEntryAccountCalculationSummary();
        this.openPostsForSelectedRow = null;
        this.lastRetrievedOpenPostsRowIndex = null;
        this.lastRetrievedOpenPostsExpectedPositive = null;
        this.isDirty = false;
    }

    private setupSaveConfig() {
        if (!this.runAsSubComponent) {
            const newActions = [
                {
                    label: 'Lagre og bokfør',
                    action: (completeEvent) => this.postJournalEntryData(completeEvent),
                    main: true,
                    disabled: !this.isDirty
                },
                {
                    label: 'Lagre som kladd',
                    action: (completeEvent) => {
                        this.saveJournalEntryDraft(completeEvent);
                    },
                    main: true,
                    disabled: !this.isDirty || this.editmode
                }
            ];

            this.saveactions = newActions;
        }
    }

    public loadData() {

        this.clearJournalEntryInfo();
        this.hasLoadedData = true;

        const data = this.journalEntryService.getSessionData(this.mode);

        // if data is present in the sessionStorage, but the journalEntryID is not set,
        // consider setting it. This will happen if the user starts editing a journalentry,
        // then leaves the view and reenters it through the menu
        if (!this.journalEntryID && data && data.length > 0) {
            if (data[0].JournalEntryID) {
                this.journalEntryID = data[0].JournalEntryID;
            }
        }

        if (this.journalEntryID > 0) {
            if (data && data.length > 0 && data[0].JournalEntryID
                && data[0].JournalEntryID.toString() === this.journalEntryID.toString()
            ) {
                // this means we have started adding data to this journalentry and then
                // navigated to another component and back again - so the data is already
                // dirty and we are in edit mode
                this.isDirty = true;
                this.disabled = false;
                this.setJournalEntryData(data);

                this.dataLoaded.emit(data);
            } else {
                // We have asked to show an existing journalentry, load it from the API and show it.
                // Assume the parent compont has set the disabled property and thereby specifies if
                // the component should be read only or not. If no existing lines has a statuscode,
                // the component should be in editmode, because this means that the journalentry has
                // not been booked yet
                this.journalEntryService.getJournalEntryDataByJournalEntryID(this.journalEntryID, this.singleRowMode)
                    .subscribe((serverLines: Array<JournalEntryData>) => {
                        this.isDirty = false;

                        if (serverLines.filter(x => x.StatusCode).length === 0) {
                            this.disabled = false;
                        } else {
                            this.disabled = !this.editmode;
                        }

                        this.setJournalEntryData(serverLines);

                        this.dataLoaded.emit(serverLines);
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

    public openAddFileModal() {
        this.modalService.open(FileFromInboxModal).onClose.subscribe(file => {
            if (file) {
                this.currentJournalEntryImages = [file.ID];
            }
        });
    }

    public onShowImageChanged(showImage: boolean) {
        this.journalEntrySettings.AttachmentsVisible = showImage;
        this.journalEntryService.setJournalEntrySettings(this.journalEntrySettings, this.mode);
    }

    public onShowImageForJournalEntry(journalEntry: JournalEntryData) {
        if (journalEntry) {
            if (this.showImagesForJournalEntryNo !== journalEntry.JournalEntryNo) {
                this.showImagesForJournalEntryNo = journalEntry.JournalEntryNo;
                this.currentJournalEntryImages = journalEntry.FileIDs || [];
            }
        } else {
            this.showImagesForJournalEntryNo = null;
            this.currentJournalEntryImages = [];
        }
    }

    public onFileListReady(files) {
        if (this.journalEntryID > 0) {
            // don't look for changes if this is a presaved journalentry - we wont
            // persist the changes anyway, it this analysis could cause incorrect
            // dirty checking if the API is slow or the user really fast
            return;
        }

        const fileIds: number[] = [];

        files.forEach(file => {
            fileIds.push(parseInt(file.ID, 10));
        });

        let didChangeAnything: boolean = false;
        let didFindJournalEntry: boolean = false;
        const data = this.getJournalEntryData();

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
            } else if (entry.FileIDs.length) {
                // Dont add duplicate lines
                if (JSON.stringify(entry.FileIDs) === JSON.stringify(fileIds)) {
                    didFindJournalEntry = true;
                }
            }
        });

        if (!didFindJournalEntry) {
            const newJournalEntry = new JournalEntryData();
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
            this.journalEntryService.setSessionData(this.mode, data, this.selectedNumberSeries ? this.selectedNumberSeries.ID : null);
        }
    }

    public addJournalEntryData(data: JournalEntryData) {
        data.SameOrNew = '1';
        this.isDirty = true;
        if (this.journalEntryProfessional) {
            this.journalEntryProfessional.addMaybeAgioJournalEntryLine(data);
        }
        this.setupSaveConfig();
    }

    public getJournalEntryData(): Array<JournalEntryData> {
        if (this.journalEntryProfessional) {
            return this.journalEntryProfessional.getTableData();
        }
        return null;
    }

    //
    // CostAllocation
    //

    private onRowFieldChanged(rowfield: FieldAndJournalEntryData) {
        var lines = this.getJournalEntryData();
        switch (rowfield.Field) {
            case 'AmountCurrency':
                if (!rowfield.JournalEntryData['_costAllocationTime']) {
                    var useAccount = rowfield.JournalEntryData.CreditAccount &&
                                     rowfield.JournalEntryData.CreditAccount.TopLevelAccountGroup &&
                                     rowfield.JournalEntryData.CreditAccount.TopLevelAccountGroup.GroupNumber == "3"
                                     ? rowfield.JournalEntryData.CreditAccountID
                                     : rowfield.JournalEntryData.DebitAccountID;
                    this.addCostAllocationForAccount(
                        useAccount,
                        rowfield.JournalEntryData.AmountCurrency,
                        this.costAllocationData ? this.costAllocationData.CurrencyCodeID : null,
                        this.costAllocationData ? this.costAllocationData.ExchangeRate : null,
                        this.costAllocationData ? this.costAllocationData.FinancialDate : null,
                        this.costAllocationData ? this.costAllocationData.VatDate : null,
                        rowfield.JournalEntryData.CreditAccountID == useAccount,
                        true);
                }
                break;
            case 'CostAllocation':
                this.currentJournalEntryData = rowfield.JournalEntryData;

                var useAccount = rowfield.JournalEntryData.CreditAccount &&
                                 rowfield.JournalEntryData.CreditAccount.TopLevelAccountGroup &&
                                 rowfield.JournalEntryData.CreditAccount.TopLevelAccountGroup.GroupNumber == "3"
                                 ? rowfield.JournalEntryData.CreditAccountID
                                 : rowfield.JournalEntryData.DebitAccountID;

                this.addCostAllocationForCostAllocation(
                    rowfield.JournalEntryData.CostAllocation.ID,
                    useAccount,
                    rowfield.JournalEntryData.AmountCurrency || (this.costAllocationData ? this.costAllocationData.CurrencyAmount : null),
                    this.costAllocationData ? this.costAllocationData.CurrencyCodeID : null,
                    this.costAllocationData ? this.costAllocationData.ExchangeRate : null,
                    this.costAllocationData ? this.costAllocationData.FinancialDate : null,
                    this.costAllocationData ? this.costAllocationData.VatDate : null,
                    rowfield.JournalEntryData.CreditAccountID == useAccount,
                    true);
                break;
            case 'DebitAccount':
                if (rowfield.JournalEntryData['_costAllocationTime']) {
                    lines.map(line => {
                        if (rowfield.JournalEntryData['_costAllocationTime'] == line['_costAllocationTime'] && !line.DebitAccountID) {
                            line.DebitAccountID = rowfield.JournalEntryData.DebitAccountID;
                            line.DebitAccount = rowfield.JournalEntryData.DebitAccount;
                            if (rowfield.JournalEntryData.DebitVatTypeID && !line.DebitVatTypeID) {
                                line.DebitVatTypeID = rowfield.JournalEntryData.DebitVatTypeID;
                                line.DebitVatType = rowfield.JournalEntryData.DebitVatType;
                            }
                        }
                    });
                    this.setJournalEntryData(lines);
                } else {
                    this.addCostAllocationForAccount(
                        rowfield.JournalEntryData.DebitAccountID,
                        rowfield.JournalEntryData.AmountCurrency || (this.costAllocationData ? this.costAllocationData.CurrencyAmount : null),
                        this.costAllocationData ? this.costAllocationData.CurrencyCodeID : null,
                        this.costAllocationData ? this.costAllocationData.ExchangeRate : null,
                        this.costAllocationData ? this.costAllocationData.FinancialDate : null,
                        this.costAllocationData ? this.costAllocationData.VatDate : null,
                        false,
                        true);
                }
                break;
            case 'CreditAccount':
                if (rowfield.JournalEntryData['_costAllocationTime']) {
                    lines.map(line => {
                        if (rowfield.JournalEntryData['_costAllocationTime'] == line['_costAllocationTime'] && !line.CreditAccountID) {
                            line.CreditAccountID = rowfield.JournalEntryData.CreditAccountID;
                            line.CreditAccount = rowfield.JournalEntryData.CreditAccount;
                        }
                    });
                    this.setJournalEntryData(lines);
                } else {
                    this.addCostAllocationForAccount(
                        rowfield.JournalEntryData.CreditAccountID,
                        rowfield.JournalEntryData.AmountCurrency || (this.costAllocationData ? this.costAllocationData.CurrencyAmount : null),
                        this.costAllocationData ? this.costAllocationData.CurrencyCodeID : null,
                        this.costAllocationData ? this.costAllocationData.ExchangeRate : null,
                        this.costAllocationData ? this.costAllocationData.FinancialDate : null,
                        this.costAllocationData ? this.costAllocationData.VatDate : null,
                        true,
                        true);
                }
        }
    }

    public addCostAllocationForCostAllocation(costAllocationID: number, useAccountID: number = null, currencyAmount: number, currencyCodeID: number, currencyExchangeRate: number, financialDate: LocalDate, vatDate: LocalDate, creditAllocation: boolean = false, keepCurrentLine: boolean = false) {
        if (!costAllocationID) return;
        this.costAllocationService.Get(costAllocationID).subscribe(costAllocation => {
            if (costAllocation) {
                this.toastService.addToast(
                    `Fordeler basert på fordelingsnøkkel`,
                    ToastType.good,
                    ToastTime.short,
                    `Fordelingsnøkkel ${costAllocation.ID} - ${costAllocation.Name}`
                );
                this.costAllocationService.getDraftLinesByCostAllocationID(costAllocationID, useAccountID, currencyAmount, currencyCodeID, currencyExchangeRate, financialDate, vatDate).subscribe(draftlines => {
                    this.addCostAllocationDraftLines(draftlines, keepCurrentLine, costAllocation, creditAllocation);
                });
            }
        });
    }

    public addCostAllocationForSupplier(
        supplierID: number,
        currencyAmount: number,
        currencyCodeID: number,
        currencyExchangeRate: number,
        financialDate: LocalDate,
        vatDate: LocalDate,
        keepCurrentLine: boolean = false
    ) {
        return new Promise((resolve, reject) => {
            if (!supplierID) {
                resolve(false);
            } else {
                this.supplierService.Get(supplierID, ['CostAllocation']).subscribe(supplier => {
                    if (supplier.CostAllocationID) {
                        this.toastService.addToast(
                            `Fordeler basert på fordelingsnøkkel for leverandør`,
                            ToastType.good,
                            ToastTime.short,
                            `Leverandør ${supplier.SupplierNumber} tilknyttet fordelingsnøkkel ` +
                            `${supplier.CostAllocation.ID} - ${supplier.CostAllocation.Name}`
                        );
                        this.costAllocationService.getDraftLinesBySupplierID(
                            supplierID,
                            null,
                            currencyAmount,
                            currencyCodeID,
                            currencyExchangeRate,
                            financialDate,
                            vatDate
                        ).subscribe(draftlines => {
                            this.addCostAllocationDraftLines(draftlines, keepCurrentLine, supplier.CostAllocation);
                            resolve(true);
                        }, err => resolve(false));
                    } else {
                        resolve(false);
                    }
                }, err => resolve(false) );
            }
        });
    }

    public addCostAllocationForAccount(accountID: number, currencyAmount: number, currencyCodeID: number, currencyExchangeRate: number, financialDate: LocalDate, vatDate: LocalDate, creditAllocation: boolean = false, keepCurrentLine: boolean = false) {
        if (!accountID || !currencyAmount) return;
        this.accountService.Get(accountID, ['CostAllocation']).subscribe(account => {
            if (account.CostAllocationID) {
                this.toastService.addToast(
                    `Fordeler basert på fordelingsnøkkel for konto`,
                    ToastType.good,
                    ToastTime.short,
                    `Konto ${account.AccountNumber} tilknyttet fordelingsnøkkel ${account.CostAllocation.ID} - ${account.CostAllocation.Name}`
                );
                this.costAllocationService.getDraftLinesByAccountID(accountID, accountID, currencyAmount, currencyCodeID, currencyExchangeRate, financialDate, vatDate).subscribe(draftlines => {
                    this.addCostAllocationDraftLines(draftlines, keepCurrentLine, account.CostAllocation, creditAllocation);
                });
            }
        });
    }

    private addCostAllocationDraftLines(draftlines: JournalEntryLineDraft[], keepCurrentLine?: boolean, costAllocation: CostAllocation = null, creditAllocation: boolean = false) {
        if (draftlines == null || draftlines.length == 0) return;

        var accounts = _.uniq(draftlines.map(draftline => draftline.AccountID).filter(Boolean));
        var dimensions = _.uniq(draftlines.map(draftline => draftline.DimensionsID).filter(Boolean));

        Observable.forkJoin(
            accounts.length > 0
                ? Observable.forkJoin(accounts.map(accountID => this.accountService.Get(accountID)))
                : Observable.of([]),
            dimensions.length > 0
                ? Observable.forkJoin(dimensions.map(dimensionID => this.dimensionService.Get(dimensionID, ['Project','Department','Dimension5','Dimension6','Dimension7','Dimension8','Dimension9','Dimension10'])))
                : Observable.of([])
        )
        .subscribe((res) => {
            let accounts = res[0];
            let dimensions = res[1];

            var first = true;
            var lines = this.getJournalEntryData();
            var currentIndex = lines.findIndex(line => line['_originalIndex'] === this.currentJournalEntryData['_originalIndex']);
            var currentLine = lines[currentIndex];
            var creditLine = _.clone(currentLine);

            draftlines.map((draftline, index) => {
                var newline = JSON.parse(JSON.stringify(draftline));
                newline.DebitAccount = accounts.find(account => account.ID == draftline.AccountID);
                newline.DebitAccountID = draftline.AccountID;
                draftline.VatTypeID = newline.VatTypeID || (newline.DebitAccount ? newline.DebitAccount.VatTypeID : null);
                newline.DebitVatType = this.vatTypes.find(vattype => vattype.ID == draftline.VatTypeID);
                newline.DebitVatTypeID = draftline.VatTypeID;
                newline.DimensionID = draftline.DimensionsID;
                newline.Dimensions = dimensions.find(dimension => dimension.ID == draftline.DimensionsID);
                newline.CostAllocation = costAllocation;
                newline.SameOrNew = "1";
                newline.isDirty = true;
                newline['_costAllocationTime'] = (new Date()).getTime();

                if (this.numberOfAccountsWithMandatoryDimensions > 0) {
                    if (!newline.MandatoryDimensionsValidation) {newline.MandatoryDimensionsValidation = {}; }
                    if (newline.DebitAccountID) {
                        this.accountMandatoryDimensionService
                        .getMandatoryDimensionsReportByDimension(newline.DebitAccountID, newline.Dimensions)
                        .subscribe((report) => {
                                newline.MandatoryDimensionsValidation['DebitReport'] = report;
                        });
                    }
                }

                if (this.mode == JournalEntryMode.Manual) {
                    this.switchDebetAndCredit(newline, creditAllocation);
                    this.setDebetOrCreditToNull(newline, creditAllocation);
                    newline.JournalEntryNo = currentLine.JournalEntryNo;
                    newline.FinancialDate = currentLine.FinancialDate;
                    newline.VatDate = currentLine.VatDate;

                    if (this.numberOfAccountsWithMandatoryDimensions > 0) {
                        if (!newline.MandatoryDimensionsValidation) {newline.MandatoryDimensionsValidation = {}; }
                        if (newline.CreditAccountID) {
                            this.accountMandatoryDimensionService
                            .getMandatoryDimensionsReportByDimension(newline.CreditAccountID, newline.Dimensions)
                            .subscribe((report) => {
                                    newline.MandatoryDimensionsValidation['CreditReport'] = report;
                            });
                        }
                    }

                }

                if (first && keepCurrentLine) {
                    currentLine.DebitAccount = newline.DebitAccount;
                    currentLine.DebitAccountID = newline.DebitAccountID;
                    currentLine.DebitVatType = newline.DebitVatType;
                    currentLine.DebitVatTypeID = newline.DebitVatTypeID;
                    currentLine.DimensionsID = newline.DimensionsID;
                    currentLine.Dimensions = newline.Dimensions;
                    currentLine.Description = newline.Description;
                    currentLine.AmountCurrency = newline.AmountCurrency;
                    currentLine.Amount = newline.Amount;
                    currentLine.CostAllocation = costAllocation;
                    currentLine['_costAllocationTime'] = newline['_costAllocationTime'];

                    if (this.mode == JournalEntryMode.Manual) {
                        currentLine.CreditAccount = newline.CreditAccount;
                        currentLine.CreditAccountID = newline.CreditAccountID;
                        currentLine.CreditVatType = newline.CreditVatType;
                        currentLine.CreditVatTypeID = newline.CreditVatTypeID;
                    }

                    this.currentJournalEntryData = currentLine;
                } else {
                    lines.splice(currentIndex + index, 0, newline);
                }

                first = false;
            });

            // Insert new line for journal entry manual
            if (this.mode == JournalEntryMode.Manual) {
                this.setDebetOrCreditToNull(creditLine, !creditAllocation);
                creditLine.CostAllocation = currentLine.CostAllocation;
                creditLine['_costAllocationTime'] = currentLine['_costAllocationTime'];
                lines.push(creditLine);
            }

            this.setJournalEntryData(lines);
            this.dataChanged.emit(lines);

            setTimeout(() => {
                this.journalEntryProfessional.focusLastRow();
            });
        });

    }

    private switchDebetAndCredit(line: JournalEntryData, creditAllocation: boolean) {
        if (creditAllocation) {
            line.CreditAccount = line.DebitAccount;
            line.CreditAccountID = line.DebitAccountID;
            line.CreditVatType = line.DebitVatType;
            line.CreditVatTypeID = line.DebitVatTypeID;
        }
    }

    private setDebetOrCreditToNull(line: JournalEntryData, creditAllocation: boolean) {
        if (creditAllocation) {
            line.DebitAccount = null;
            line.DebitAccountID = null;
            line.DebitVatType = null;
            line.DebitVatTypeID = null;
        } else {
            line.CreditAccount = null;
            line.CreditAccountID = null;
            line.CreditVatType = null;
            line.CreditVatTypeID = null;
        }
    }

    //

    public setJournalEntryData(lines: Array<JournalEntryData>, retryCount = 0) {
        if (this.editmode) {
            // copies lines from the original array and lets you edit them as a template
            // for the journalentry. Only copy lines that are not already credited
            lines = lines.filter(x => !x.JournalEntryDrafts.find(y => y.StatusCode === 34002));
            const copiedArray = [...lines];

            copiedArray.map(line => {
                line.StatusCode = null;

                line.JournalEntryDataAccrual = null;
                line['_editmode'] = true;
                return line;
            });

            lines = copiedArray;
        } else {
            // if the data has been saved to sessionStorage the binding for this.editmode
            // might not be correct when reentering the view, so check if any of the lines
            // has _editmode set - if so we are editing an existing journalentry, so update
            // the flag to make the other things work as expected
            if (lines.filter(x => x['_editmode']).length > 0) {
                this.editmode = true;
            }
        }

        this.journalEntryProfessional.setJournalEntryData(lines);

        // run this after the rest of the databinding is complete - if not it can cause multiple
        // changes in the same change detection cycle, and this makes angular really cranky
        setTimeout(() => {
            this.setupSaveConfig();
        });

        this.calculateItemSums(lines);

        if (!this.currentFinancialYear || !this.financialYears) {
            // wait a moment before trying to validate the data
            // because the currentyears have not been retrieved yet
            setTimeout(() => {
                if (this.currentFinancialYear && this.financialYears) {
                    this.validateJournalEntryData(lines);
                }
            }, 1000);
        } else {
            this.validateJournalEntryData(lines);
        }
    }

    public setupJournalEntryNumbers() {
        this.journalEntryProfessional.setupJournalEntryNumbers(true);
    }

    private setupSubscriptions() {
        setTimeout(() => {
            if (this.journalEntryProfessional) {
                if (this.journalEntryProfessional.dataChanged.observers.length === 0) {
                    this.journalEntryProfessional.dataChanged.debounceTime(300)
                    .subscribe((values) => this.onDataChanged(values));

                    this.journalEntryProfessional.rowFieldChanged.debounceTime(300)
                    .subscribe((rowfield) => this.onRowFieldChanged(rowfield));
                }
            }
        });
    }

    public onDataChanged(data: JournalEntryData[]) {
        this.dataChanged.emit(data);
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
            const updatedCurrentJournalEntryData =
                data.find(x => x['_originalIndex'] === this.currentJournalEntryData['_originalIndex']);

            this.currentJournalEntryData = updatedCurrentJournalEntryData;
        }

        setTimeout(() => {
            data.forEach((x) => {
                x.Amount = x.Amount || 0;
            });

            // save journalentries to sessionStorage - this is done in case the user switches tabs while entering
            this.journalEntryService.setSessionData(this.mode, data, this.selectedNumberSeries ? this.selectedNumberSeries.ID : null);

            this.validateJournalEntryData(data);

            this.calculateItemSums(data);

            this.getOpenPostsForRow();

            this.setupSaveConfig();
        });
    }

    public onDataLoaded(data: JournalEntryData[]) {
        this.calculateItemSums(data);
        this.dataLoaded.emit(data);
    }

    public onRowSelected(selectedRow: JournalEntryData) {
        this.currentJournalEntryData = selectedRow;

        if (this.journalEntryProfessional) {
            const data = this.journalEntryProfessional.getTableData();

            if (this.currentFinancialYear) {
                this.journalEntryService.getAccountBalanceInfo(
                    data,
                    this.accountBalanceInfoData,
                    this.currentFinancialYear)
                    .subscribe(accountBalanceData => {
                        this.accountBalanceInfoData = accountBalanceData;
                        this.itemAccountInfoData =
                            this.journalEntryService.calculateJournalEntryAccountSummaryLocal(
                                data,
                                this.accountBalanceInfoData,
                                this.vatDeductions,
                                this.currentJournalEntryData);
                    });
            }
        }

        this.getOpenPostsForRow();
    }

    public openPostSelected(selectedRow: any) {
        if (selectedRow) {
            const selectedLine: JournalEntryLine = selectedRow.rowModel;

            if (this.currentJournalEntryData) {
                if (selectedLine['_rowSelected']) {
                    this.currentJournalEntryData.AmountCurrency = Math.abs(selectedLine.RestAmountCurrency);
                    this.currentJournalEntryData.NetAmountCurrency = Math.abs(selectedLine.RestAmountCurrency);
                    this.currentJournalEntryData.Amount =
                        Math.abs(selectedLine.RestAmountCurrency * selectedLine.CurrencyExchangeRate);
                    this.currentJournalEntryData.NetAmount =
                        Math.abs(selectedLine.RestAmountCurrency * selectedLine.CurrencyExchangeRate);
                    this.currentJournalEntryData.CurrencyID = selectedLine.CurrencyCodeID;
                    this.currentJournalEntryData.CurrencyCode = selectedLine.CurrencyCode;
                    this.currentJournalEntryData.CurrencyExchangeRate = selectedLine.CurrencyExchangeRate;
                    this.currentJournalEntryData.PostPostJournalEntryLineID = selectedLine.ID;
                    this.currentJournalEntryData.PostPostJournalEntryLine = selectedLine;
                    this.currentJournalEntryData.InvoiceNumber = selectedLine.InvoiceNumber;

                    this.journalEntryProfessional.updateJournalEntryLine(this.currentJournalEntryData);

                    this.toastService.addToast(
                        `Linje markert mot ${selectedLine.JournalEntryNumber}`,
                        ToastType.good,
                        ToastTime.short,
                        `Beløp oppdatert til ${this.currentJournalEntryData.AmountCurrency}`
                    );

                    // unselect other rows if a new row is selected
                    const allrows = this.openPostsTable.getTableData();
                    allrows.forEach(row => {
                        if (row.ID !== selectedLine.ID && row['_rowSelected']) {
                            row['_rowSelected'] = false;
                            this.openPostsTable.updateRow(row._originalIndex, row);

                            this.toastService.addToast(
                                `Fjernet markering for annen linje`,
                                ToastType.good,
                                ToastTime.short,
                                `Fjernet markering på bilagsnr ${row.JournalEntryNumber}`
                            );
                        }
                    });

                    if (this.currentJournalEntryData.CurrencyID !== this.companySettings.BaseCurrencyCodeID) {
                        this.journalEntryProfessional.showAgioDialogPostPost(this.currentJournalEntryData);
                    }
                } else {
                    this.currentJournalEntryData.PostPostJournalEntryLineID = null;
                    this.journalEntryProfessional.updateJournalEntryLine(this.currentJournalEntryData);
                }
            }
        } else {
            this.toastService.addToast(
                'Du kan bare velge en rad',
                ToastType.warn,
                ToastTime.medium,
                'Det er ikke mulig å velge flere rader, '
                    + 'lag heller flere bilagslinjer og koble hver rad til en åpen post'
            );
        }
    }

    private getOpenPostsForRow() {
        if (this.currentJournalEntryData) {
            let ledgerAccountID = null;
            let expectPositiveAmount: boolean;

            if (this.currentJournalEntryData.StatusCode) {
                // this row is already saved, post post marking is not possible, so dont
                // get any data from the API
            } else {
                if (this.currentJournalEntryData.DebitAccount
                    && this.currentJournalEntryData.DebitAccount.AccountID) {
                    ledgerAccountID = this.currentJournalEntryData.DebitAccountID;
                    expectPositiveAmount = false;
                } else if (this.currentJournalEntryData.CreditAccount
                    && this.currentJournalEntryData.CreditAccount.AccountID) {
                    ledgerAccountID = this.currentJournalEntryData.CreditAccountID;
                    expectPositiveAmount = true;
                }
            }

            if (ledgerAccountID) {
                if (ledgerAccountID !== this.lastRetrievedOpenPostsRowIndex) {
                    this.openPostRetrievingDataInProgress = true;
                    this.lastRetrievedOpenPostsRowIndex = this.currentJournalEntryData['_originalIndex'];
                    this.lastRetrievedOpenPostsExpectedPositive = expectPositiveAmount;
                    this.openPostsForSelectedRow = null;

                    // if we are showing the postpost when doing corrections, the post isnt actually open, but
                    // include it in the results anyway because it will cause problems otherwise
                    let extraFilter = '';
                    if (this.currentJournalEntryData.PostPostJournalEntryLineID) {
                        extraFilter = ` or ID eq ${this.currentJournalEntryData.PostPostJournalEntryLineID}`;
                    }

                    this.journalEntryLineService.GetAll(
                        `expand=CurrencyCode&orderby=ID desc&filter=SubAccountID eq ${ledgerAccountID} `
                        + `and RestAmountCurrency ${expectPositiveAmount ? 'gt' : 'lt'} 0 `
                        + `and (StatusCode eq 31001 or StatusCode eq 31002)`
                        + `${extraFilter}`
                    ).subscribe(lines => {
                        let line: JournalEntryLine = null;
                        if (this.currentJournalEntryData) {
                            if (this.currentJournalEntryData.PostPostJournalEntryLineID) {
                                line = lines.find(x => x.ID === this.currentJournalEntryData.PostPostJournalEntryLineID);
                            } else if (this.currentJournalEntryData.CustomerInvoiceID) {
                                line = lines.find(
                                    x => x.CustomerInvoiceID === this.currentJournalEntryData.CustomerInvoiceID
                                );
                            } else if (this.currentJournalEntryData.SupplierInvoiceID) {
                                line = lines.find(
                                    x => x.SupplierInvoiceID === this.currentJournalEntryData.SupplierInvoiceID
                                );
                            }

                            if (line) {
                                line['_rowSelected'] = true;
                            }

                            if (line && line.CustomerInvoiceID) {
                                // Calculate reminderfee
                                forkJoin(lines.map(line => this.statisticsService.GetAllUnwrapped(`model=customerinvoicereminder&select=isnull(sum(reminderfee),0) as SumReminderFee,isnull(sum(reminderfeecurrency),0) as SumReminderFeeCurrency,isnull(sum(interestfee),0) as SumInterestFee,isnull(sum(interestfeecurrency),0) as SumInterestFeeCurrency&filter=customerinvoiceid eq ${line.CustomerInvoiceID} and statuscode eq 42101`)))
                                    .subscribe(res => {
                                        res.map(res => res[0]).map((sums, i: number) => {
                                            lines[i]['_SumReminderFee'] = sums.SumReminderFee;
                                            lines[i]['_SumReminderFeeCurrency'] = sums.SumReminderFeeCurrency;
                                            lines[i]['_SumInterestFee'] = sums.SumInterestFee;
                                            lines[i]['_SumInterestFeeCurrency'] = sums.SumInterestFeeCurrency;
                                            lines[i]['RestAmount'] += sums.SumReminderFee + sums.SumInterestFee;
                                            lines[i]['RestAmountCurrency'] += sums.SumReminderFeeCurrency + sums.SumInterestFeeCurrency;
                                        });

                                        this.openPostsForSelectedRow = lines;
                                        this.openPostRetrievingDataInProgress = false;
                                });
                            } else {
                                this.openPostsForSelectedRow = lines;
                                this.openPostRetrievingDataInProgress = false;
                            }
                        }
                    }, err => {
                        this.openPostRetrievingDataInProgress = false;
                        this.errorService.handle(err);
                    });
                }
            } else {
                this.openPostsForSelectedRow = null;
                this.lastRetrievedOpenPostsRowIndex = null;
                this.lastRetrievedOpenPostsExpectedPositive = null;
            }
        } else {
            this.openPostsForSelectedRow = null;
            this.lastRetrievedOpenPostsRowIndex = null;
            this.lastRetrievedOpenPostsExpectedPositive = null;
        }
    }

    private calculateItemSums(data: JournalEntryData[]) {
        this.itemsSummaryData = this.journalEntryService.calculateJournalEntrySummaryLocal(data, this.vatDeductions);

        if (this.currentJournalEntryData) {
            this.journalEntryService.getAccountBalanceInfo(
                data, this.accountBalanceInfoData, this.currentFinancialYear
            ).subscribe(accountBalanceData => {
                this.accountBalanceInfoData = accountBalanceData;
                this.itemAccountInfoData = this.journalEntryService.calculateJournalEntryAccountSummaryLocal(
                        data, this.accountBalanceInfoData, this.vatDeductions, this.currentJournalEntryData
                    );
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
         this.journalEntryService.validateJournalEntryDataLocal(
             data,
             this.currentFinancialYear,
             this.financialYears,
             this.companySettings,
             this.doValidateBalance,
             this.mode)
             .then(result => this.validationResult = result );

        /*
        KE 08.11.2016: Switch to running the validations locally.
        The serverside validation is executed when posting anyway
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

    private canPostData(): Observable<boolean> {
        let hasError, hasWarning;
        const validationMessages = this.validationResult && this.validationResult.Messages;
        if (validationMessages.length) {
            hasError = validationMessages.some(msg => msg.Level === ValidationLevel.Error);
            hasWarning = validationMessages.some(msg => msg.Level === ValidationLevel.Warning);
        }

        if (hasError) {
            this.toastService.addToast(
                'Lagring avbrutt',
                ToastType.bad,
                ToastTime.long,
                'Se feilmeldinger under, og korriger linjene som er feil før du lagrer på ny'
            );

            return Observable.of(false);
        }

        if (hasWarning) {
            return this.modalService.open(UniConfirmModalV2, {
                header: 'Bekreft bokføring med advarsler',
                message: 'Det finnes advarsler, men du kan likevel bokføre dersom dataene er riktige',
                buttonLabels: {
                    accept: 'Lagre og bokfør',
                    cancel: 'Avbryt'
                }
            }).onClose.map(response => {
                return response === ConfirmActions.ACCEPT;
            });
        }

        return Observable.of(true);
    }

    private saveJournalEntryDraft(completeCallback) {
        // allow events from UniTable to finish, e.g. if the focus was in a cell
        // when the user clicked the save button the unitable events should be allowed
        // to run first, to let it update its' datasource
        setTimeout(() => {
            if (this.journalEntryProfessional) {
                this.journalEntryProfessional.trySaveJournalEntryDrafts((result: string) => {
                    completeCallback(result);

                    if (result && result !== '') {
                        this.onDataChanged([]);
                        this.clear();
                    }
                });

                this.onShowImageForJournalEntry(null);
            } else {
                completeCallback('Lagring avbrutt');
            }
        });
    }

    private postJournalEntryData(completeCallback, id?: number | null) {
        // allow events from UniTable to finish, e.g. if the focus was in a cell
        // when the user clicked the save button the unitable events should be allowed
        // to run first, to let it update its' datasource
        setTimeout(() => {
            this.canPostData().subscribe((canPost: boolean) => {
                if (canPost && this.journalEntryProfessional) {
                    if (!this.editmode) {
                        // this is a new journalentry, just book it
                        this.journalEntryProfessional.postJournalEntryData((result: string) => {
                            completeCallback(result);

                            if (result && result !== '') {
                                this.onDataChanged([]);
                                this.clear();
                            }
                        });

                        this.onShowImageForJournalEntry(null);
                    } else {
                        // we are editing a journalentry, check what date the existing data will be credited
                        const modalParams = {
                            JournalEntryID: this.journalEntryID
                        };

                        this.modalService.open(ConfirmCreditedJournalEntryWithDate, {
                            header: `Opprinnelige bilagslinjer blir kreditert`,
                            message: 'Når du lagrer vil de opprinnelige bilagslinjene krediteres.',
                            buttonLabels: {
                                accept: 'Fortsett',
                                cancel: 'Avbryt'
                            },
                            data: modalParams
                        }).onClose.subscribe(response => {
                            if (response && response.action === ConfirmActions.ACCEPT) {
                                const creditDate = response.creditDate;

                                this.journalEntryProfessional.creditAndPostCorrectedJournalEntryData((result: string) => {
                                    completeCallback(result);

                                    if (result && result !== '') {
                                        this.onDataChanged([]);
                                        this.clear();
                                    }
                                }, this.journalEntryID, creditDate);

                                this.onShowImageForJournalEntry(null);
                            } else {
                                completeCallback('Lagring avbrutt');
                            }
                        });
                    }
                } else {
                    completeCallback('Lagring avbrutt');
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

    public unlockJournalEntry(completeCallback) {
        this.disabled = false;
        completeCallback('Låst opp bilag');
    }

    private setSums() {
        const showCurrencyCode = !this.itemsSummaryData.IsOnlyCompanyCurrencyCode;
        this.summary = <ISummaryConfig[]>[{
            value: this.itemsSummaryData ? this.numberFormat.asMoney(this.itemsSummaryData.SumDebet || 0) : null,
            title: 'Sum debet',
            description: showCurrencyCode && this.itemsSummaryData.BaseCurrencyCodeCode
        }, {
            value: this.itemsSummaryData ? this.numberFormat.asMoney(this.itemsSummaryData.SumCredit || 0) : null,
            title: 'Sum kredit',
            description: showCurrencyCode && this.itemsSummaryData.BaseCurrencyCodeCode
        }, {
            value: this.itemsSummaryData ? this.numberFormat.asMoney(this.itemsSummaryData.Differance || 0) : null,
            title: 'Differanse',
            description: showCurrencyCode && this.itemsSummaryData.BaseCurrencyCodeCode
        }, {
            value: this.itemsSummaryData ? this.numberFormat.asMoney(this.itemsSummaryData.IncomingVat || 0) : null,
            title: 'Inng.mva',
            description: showCurrencyCode && this.itemsSummaryData.BaseCurrencyCodeCode
        }, {
            value: this.itemsSummaryData ? this.numberFormat.asMoney(this.itemsSummaryData.OutgoingVat || 0) : null,
            title: 'Utg.mva',
            description: showCurrencyCode && this.itemsSummaryData.BaseCurrencyCodeCode
        }];
    }

    public getValidationLevelCss(validationLevel) {
        if (validationLevel === ValidationLevel.Error) {
            return 'error';
        } else if (validationLevel === ValidationLevel.Warning) {
            return 'warn';
        }
        return 'good';
    }

    public getValidationIcon(validationLevel: number): string {
        const type = this.getValidationLevelCss(validationLevel);
        if (type === 'good') {
            return 'check_circle';
        } else {
            return type === 'error' ? 'error' : 'warning';
        }
    }

    public getFormattedNumber(num): string {
        if (num) {
            return this.numberFormat.asMoney(num);
        }

        return '';
    }

    private setupOpenPostUniTable() {
        const columns = [
            new UniTableColumn('JournalEntryNumber', 'Bilagsnr', UniTableColumnType.Text)
                .setWidth('6rem'),
            new UniTableColumn('JournalEntryType.Name', 'Type', UniTableColumnType.Text)
                .setTemplate(x => x.JournalEntryTypeName)
                .setVisible(false),
            new UniTableColumn('FinancialDate', 'Dato', UniTableColumnType.LocalDate)
                .setWidth('6rem'),
            new UniTableColumn('InvoiceNumber', 'Fakturanr', UniTableColumnType.Text)
                .setWidth('6rem'),
            new UniTableColumn('DueDate', 'Forfall', UniTableColumnType.DateTime)
                .setWidth('6rem'),
            new UniTableColumn('Amount', 'Beløp', UniTableColumnType.Money)
                .setWidth('8rem'),
            new UniTableColumn('_SumReminderFee', 'Purregebyr', UniTableColumnType.Money)
                .setWidth('8rem'),
            new UniTableColumn('_SumReminderFeeCurrency', 'V-Purregebyr', UniTableColumnType.Money)
                .setWidth('8rem')
                .setVisible(false),
            new UniTableColumn('_SumInterestFee', 'Renter', UniTableColumnType.Money)
                .setWidth('8rem')
                .setVisible(false),
            new UniTableColumn('_SumInterestFeeCurrency', 'V-Renter', UniTableColumnType.Money)
                .setWidth('8rem')
                .setVisible(false),
            new UniTableColumn('AmountCurrency', 'V-Beløp', UniTableColumnType.Money)
                .setWidth('8rem')
                .setVisible(false),
            new UniTableColumn('CurrencyCodeCode', 'Valuta', UniTableColumnType.Text)
                .setVisible(false),
            new UniTableColumn('CurrencyExchangeRate', 'V-Kurs', UniTableColumnType.Number)
                .setVisible(false),
            new UniTableColumn('RestAmount', 'Restbeløp', UniTableColumnType.Money)
                .setWidth('8rem'),
            new UniTableColumn('RestAmountCurrency', 'V-Restbeløp', UniTableColumnType.Money)
                .setWidth('8rem')
                .setVisible(false),
            new UniTableColumn('Description', 'Beskrivelse', UniTableColumnType.Text),
            new UniTableColumn('StatusCode', 'Status', UniTableColumnType.Text)
                .setWidth('8rem')
                .setTemplate(x => this.journalEntryLineService.getStatusText(x.StatusCode))
        ];

        const tableConfigStoreKey = 'accounting.journalEntry.openPostTable';
        this.openPostTableConfig = new UniTableConfig(tableConfigStoreKey, false, false, 100)
            .setColumns(columns)
            .setMultiRowSelect(true)
            .setColumnMenuVisible(true);
    }

    public isEmpty(): boolean {
        var lines = this.getJournalEntryData();
        return lines == null || lines.length == 0;
    }
}
