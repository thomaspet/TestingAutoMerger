import {
    Component,
    ViewChild,
    OnInit,
    OnChanges,
    SimpleChanges,
    Input,
    Output,
    EventEmitter,
} from '@angular/core';
import {Observable, forkJoin, from} from 'rxjs';
import {
    UniTable,
    UniTableColumn,
    UniTableColumnType,
    UniTableConfig,
    ICellClickEvent,
    IContextMenuItem,
    IColumnTooltip
} from '../../../../../../framework/ui/unitable/index';
import {IGroupConfig} from '@uni-framework/ui/unitable/controls/table-autocomplete';
import {UniHttp} from '../../../../../../framework/core/http/http';
import {
    Account,
    VatType,
    Project,
    Department,
    CustomerInvoice,
    JournalEntryLine,
    CompanySettings,
    FinancialYear,
    LocalDate,
    Payment,
    BusinessRelation,
    BankAccount,
    VatDeduction,
    InvoicePaymentData,
    NumberSeries,
    SupplierInvoice
} from '../../../../../unientities';
import {JournalEntryData, NumberSeriesTaskIds, FieldAndJournalEntryData, AccountingCostSuggestion} from '@app/models';
import {AccrualModal} from '../../../../common/modals/accrualModal';
import {NewAccountModal} from '../../../NewAccountModal';
import {ToastService, ToastType, ToastTime} from '../../../../../../framework/uniToast/toastService';
import {AddPaymentModal} from '../../../../common/modals/addPaymentModal';
import {StatusCode} from '../../../../sales/salesHelper/salesEnums';
import {
    AccountService,
    JournalEntryService,
    JournalEntryLineService,
    JournalEntryLineDraftService,
    DepartmentService,
    ProjectService,
    CustomDimensionService,
    CustomerInvoiceService,
    SupplierInvoiceService,
    CompanySettingsService,
    ErrorService,
    StatisticsService,
    NumberFormat,
    PredefinedDescriptionService,
    SupplierService,
    CustomerService,
    UserService,
    CostAllocationService,
    AccountMandatoryDimensionService,
} from '../../../../../services/services';
import {
    UniModalService,
    UniRegisterPaymentModal,
    UniConfirmModalV2,
    ConfirmActions,
    IModalOptions,
} from '../../../../../../framework/uni-modal';

import * as moment from 'moment';
import {CurrencyCodeService} from '../../../../../services/common/currencyCodeService';
import {CurrencyService} from '../../../../../services/common/currencyService';
import {SelectJournalEntryLineModal} from '../selectJournalEntryLineModal';
import {UniMath} from '../../../../../../framework/core/uniMath';
import {DraftLineDescriptionModal} from './draftLineDescriptionModal';
import { PaymentService } from '@app/services/accounting/paymentService';
import {JournalEntryMode} from '../../../../../services/accounting/journalEntryService';
import {RequestMethod} from '@uni-framework/core/http';
const PAPERCLIP = '📎'; // It might look empty in your editor, but this is the unicode paperclip
import * as _ from 'lodash';
import {theme, THEMES} from 'src/themes/theme';
import { CsvConverter } from './CsvConverter';
import { FeaturePermissionService } from '@app/featurePermissionService';

@Component({
    selector: 'journal-entry-professional',
    templateUrl: './journalentryprofessional.html',
})
export class JournalEntryProfessional implements OnInit, OnChanges {
    @Input() public journalEntryID: number = 0;
    @Input() public runAsSubComponent: boolean = false;
    @Input() public mode: number = JournalEntryMode.Manual;
    @Input() public disabled: boolean = false;
    @Input() public journalEntryLines: JournalEntryData[] = [];
    @Input() public doShowImage: boolean = false;
    @Input() public defaultVisibleColumns: Array<string> = [];
    @Input() public financialYears: Array<FinancialYear>;
    @Input() public currentFinancialYear: FinancialYear;
    @Input() public vatDeductions: Array<VatDeduction>;
    @Input() public defaultRowData: JournalEntryData;
    @Input() public vattypes: VatType[];
    @Input() public selectedNumberSeries: NumberSeries;
    @Input() public orgNumber: string;

    @ViewChild(UniTable) table: UniTable;

    private companySettings: CompanySettings;
    private columnsThatMustAlwaysShow: string[] = ['AmountCurrency'];
    public journalEntryTableConfig: UniTableConfig;
    public createdNewAccount: any;
    private selectedNumberSeriesTaskID: number;

    @Output() public dataChanged: EventEmitter<JournalEntryData[]> = new EventEmitter<JournalEntryData[]>();
    @Output() public dataLoaded: EventEmitter<JournalEntryData[]> = new EventEmitter<JournalEntryData[]>();
    @Output() public showImageChanged: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Output() public showImageForJournalEntry: EventEmitter<JournalEntryData> = new EventEmitter<JournalEntryData>();
    @Output() public rowSelected: EventEmitter<JournalEntryData> = new EventEmitter<JournalEntryData>();
    @Output() public rowFieldChanged: EventEmitter<FieldAndJournalEntryData> = new EventEmitter<FieldAndJournalEntryData>();
    @Output() public accountWithCostAllocationSelected: EventEmitter<any> = new EventEmitter();

    private predefinedDescriptions: Array<any>;
    private dimensionTypes: any[];
    private dimsReport: any[];

    private SAME_OR_NEW_NEW: string = '1';
    private newAlternative: any = {ID: this.SAME_OR_NEW_NEW, Name: 'Nytt bilag'};
    public journalEntryNumberAlternatives: Array<any> = [];

    private firstAvailableJournalEntryNumber: string = '';
    private lastUsedJournalEntryNumber: string = '';
    private maDimensions: any[] = [];
    private lastImageDisplayFor: string = '';
    private numberOfAccountsWithMandatoryDimensions: number = 0;
    private defaultAccountPayments: Account = null;
    private currentSavedFinancialDate;
    private currentSavedVatDate;
    private groupConfig: IGroupConfig = {
        groupKey: 'VatCodeGroupingValue',
        visibleValueKey: 'Visible',
        groups: [
            {
                key: 1,
                header: 'Kjøp/kostnader.'
            },
            {
                key: 2,
                header: 'Kjøp/Importfaktura'
            },
            {
                key: 3,
                header: 'Import/Mva-beregning'
            },
            {
                key: 4,
                header: 'Salg/inntekter'
            }
            ,
            {
                key: 5,
                header: 'Salg uten mva.'
            }
            ,
            {
                key: 6,
                header: 'Kjøpskoder, spesielle'
            }
            ,
            {
                key: 7,
                header: 'Egendefinerte koder'
            }

        ]
    };

    public currentRowIndex: number = 0;
    public currentFileIDs = [];
    private users: any[] = [];
    private mandatoryDimensions = [];

    constructor(
        private uniHttpService: UniHttp,
        private accountService: AccountService,
        private journalEntryService: JournalEntryService,
        private journalEntryLineDraftService: JournalEntryLineDraftService,
        private departmentService: DepartmentService,
        private projectService: ProjectService,
        private customDimensionService: CustomDimensionService,
        private supplierInvoiceService: SupplierInvoiceService,
        private customerInvoiceService: CustomerInvoiceService,
        private toastService: ToastService,
        private errorService: ErrorService,
        private statisticsService: StatisticsService,
        private numberFormatService: NumberFormat,
        private currencyCodeService: CurrencyCodeService,
        private currencyService: CurrencyService,
        private companySettingsService: CompanySettingsService,
        private journalEntryLineService: JournalEntryLineService,
        private predefinedDescriptionService: PredefinedDescriptionService,
        private modalService: UniModalService,
        private supplierService: SupplierService,
        private customerService: CustomerService,
        private userService: UserService,
        private paymentService: PaymentService,
        private costAllocationService: CostAllocationService,
        private accountMandatoryDimensionService: AccountMandatoryDimensionService,
        private featurePermissionService: FeaturePermissionService
    ) {
        this.accountMandatoryDimensionService.getMandatoryDimensions().subscribe(result => {
            this.mandatoryDimensions = result;
        });
    }

    public ngOnInit() {
        this.getCreatedByName();
        this.setupJournalEntryTable();
        this.selectedNumberSeriesTaskID = NumberSeriesTaskIds.Journal;
    }

    public ngOnChanges(changes: SimpleChanges) {
        if (changes['currentFinancialYear'] && this.currentFinancialYear) {
            this.setupJournalEntryNumbers(false);
        }

        if (changes['journalEntryLines'] && this.journalEntryLines && this.journalEntryLines.length > 0) {
            // when the journalEntryLines changes, we need to update the sameornew alternatives,
            // i.e. the items that it is possible to select in the journalentrynumber dropdown
            setTimeout(() => {
                this.setupSameNewAlternatives();
            });
        }

        // if the disabled input is changed and the table is loaded, reload it (should hide )
        if (changes['disabled'] && this.table) {
            this.setupUniTable();
        }

        if (changes['defaultRowData'] && this.defaultRowData && this.table) {
            this.journalEntryTableConfig.setDefaultRowData(this.defaultRowData);
            this.setupUniTable();
        }

        if (changes['defaultVisibleColumns']) {
            this.columnsThatMustAlwaysShow.forEach(col => {
                if (this.defaultVisibleColumns && !this.defaultVisibleColumns.some(def => def === col)) {
                    this.defaultVisibleColumns.push(col);
                }
            });
        }

        if (changes['selectedNumberSeries'] && this.selectedNumberSeries) {

            this.selectedNumberSeriesTaskID =  this.selectedNumberSeries.NumberSeriesTaskID;
            this.setupJournalEntryNumbers(true);
        }

        // Store currently saved financial year to avoid changes to it!
        if (this.journalEntryLines[0]?.FinancialDate && this.journalEntryLines[0]?.JournalEntryNo) {
            this.currentSavedFinancialDate = this.journalEntryLines[0].FinancialDate;
        }

        // Store currently saved VAT year to avoid changes to it!
        if (this.journalEntryLines[0]?.VatDate && this.journalEntryLines[0]?.JournalEntryNo) {
            this.currentSavedVatDate = this.journalEntryLines[0].VatDate;
        }
    }

    public getCsvData(divider = '\t'): string {
        return CsvConverter.getCsvData(this.table, divider);
    }

    public setCsvData(value: string, divider = '\t'): Promise<any> {
        const importer = new CsvConverter(this.uniHttpService, this.vattypes);
        return new Promise( (resolve, reject) =>
            importer.setCsvData(this.table, value, divider)
                ?.then( data => {
                    // Make sure currencies are calculated
                    data.forEach( row => {
                        if (row.CurrencyID) {
                            if (row.CurrencyExchangeRate && (row.CurrencyExchangeRate !== 1)) {
                                this.calculateAmount(row);
                            }
                            if (row.Amount !== row.AmountCurrency) {
                                this.calculateCurrencyExchangeRate(row);
                            }
                        }
                    });
                    this.setJournalEntryData(data);
                    this.setupJournalEntryNumbers(true);
                    resolve(data);
                })
                ?.catch( err => reject(err))
        );
    }

    public setJournalEntryData(data) {
        // if data is retrieved from the server, some properties needs to be updated to
        // simplify frontend logic
        if (data) {
            data.forEach(row => {
                if (!row.SameOrNewDetails && row.JournalEntryNo) {
                    row.SameOrNewDetails = { ID: row.JournalEntryNo, Name: row.JournalEntryNo };
                }

                if (row.DebitVatType && !row.DebitVatType.VatTypePercentages && this.vattypes) {
                    row.DebitVatType = this.vattypes.find(x => x.ID === row.DebitVatType.ID);
                }

                if (row.CreditVatType && !row.CreditVatType.VatTypePercentages && this.vattypes) {
                    row.CreditVatType = this.vattypes.find(x => x.ID === row.CreditVatType.ID);
                }

                if (!row.NetAmountCurrency) {
                    this.calculateNetAmountAndNetAmountCurrency(row);
                }

                if (this.numberOfAccountsWithMandatoryDimensions > 0) {

                    if (!row.MandatoryDimensionsValidation) {row.MandatoryDimensionsValidation = {}; }

                    const debitReport = this.accountMandatoryDimensionService.getReport(row.DebitAccount, row);
                    row.MandatoryDimensionsValidation['DebitReport'] = debitReport;
                    this.table.updateRow(row['_originalIndex'], row);

                    const creditReport = this.accountMandatoryDimensionService.getReport(row.CreditAccount, row);
                    row.MandatoryDimensionsValidation['CreditReport'] = creditReport;
                    this.table.updateRow(row['_originalIndex'], row);
                }
            });
        }

        // If SupplierInvoice don't set focus on table, and filter away credited lines!
        if (this.mode === JournalEntryMode.SupplierInvoice) {
            // Hide credited lines from Supplier Invoice view
            this.journalEntryLines = data.filter(line => line.StatusCode !== 34002);
            return;
        } else {
            this.journalEntryLines = data;
        }

        setTimeout(() => {
            if (this.currentRowIndex >= 0) {
                if (this.table && this.mode !== 2) {
                    this.table.blur();
                    this.table.focusRow(this.currentRowIndex);
                } else {
                    setTimeout(() => {
                        if (this.table && this.mode !== 2) {
                            this.table.blur();
                            this.table.focusRow(this.currentRowIndex);
                        }
                    }, 500);
                }
            }

            // when the journalEntryLines changes, we need to update the sameornew alternatives,
            // i.e. the items that it is possible to select in the journalentrynumber dropdown
            this.setupSameNewAlternatives();
        });

    }

    private setupJournalEntryTable() {
        Observable.forkJoin(
            this.accountService.GetAll('filter=AccountNumber eq 1920'),
            this.companySettingsService.Get(1),
            this.predefinedDescriptionService.GetAll('filter=Type eq 1'),
            this.customDimensionService.getMetadata(),
            this.accountMandatoryDimensionService.GetNumberOfAccountsWithMandatoryDimensions()
        ).subscribe(
            (data) => {
                this.companySettings = data[1];

                if (this.companySettings
                    && this.companySettings.CompanyBankAccount
                    && this.companySettings.CompanyBankAccount.Account) {
                    this.defaultAccountPayments = this.companySettings.CompanyBankAccount.Account;
                } else {
                    if (data[0] && data[0].length && data[0].length > 0) {
                        this.defaultAccountPayments = data[0][0];
                    }
                }

                this.predefinedDescriptions = data[2] || [];
                this.dimensionTypes = data[3];
                this.numberOfAccountsWithMandatoryDimensions = data[4];
                this.setupUniTable();
                this.dataLoaded.emit(this.journalEntryLines);
            },
            err => this.errorService.handle(err)
        );
    }

    private setJournalEntryNumberProperties(newRow: JournalEntryData) {
        const data = this.table.getTableData();

        if (newRow.SameOrNewDetails) {
            if (newRow.SameOrNewDetails.ID === this.SAME_OR_NEW_NEW) {
                newRow.JournalEntryNo = this.firstAvailableJournalEntryNumber;
            } else {
                newRow.JournalEntryNo = newRow.SameOrNewDetails.Name;
            }
        } else {
            if (data.length === 0 || data.filter(x => x.JournalEntryNo && x.JournalEntryNo !== '').length === 0) {
                // set New number as default if nothing is specified and no previous numbers have been used
                newRow.SameOrNewDetails = this.journalEntryNumberAlternatives[
                    this.journalEntryNumberAlternatives.length - 1
                ];
                newRow.JournalEntryNo = this.firstAvailableJournalEntryNumber;
            } else {
                newRow.JournalEntryNo = this.lastUsedJournalEntryNumber;
            }
        }

        if (newRow.JournalEntryID && newRow.JournalEntryID !== 0) {
            // if journalentryno was changed for an existing journalentry (saved as a draft),
            // we need to clear the JournalEntryID if any other items use the same JournalEntryID
            if (data.filter(x => x.JournalEntryID === newRow.JournalEntryID && x._originalIndex !== newRow['_originalIndex']).length > 0) {
                newRow.JournalEntryID = null;
            }
        }

        if (newRow.JournalEntryNo && newRow.JournalEntryNo !== '') {
            // check if we have another row with the same JournalEntryNo - if so, get the JournalEntryID from
            // that row and update it on the current row
            const otherJournalEntryData = data.filter(x => x.JournalEntryNo === newRow.JournalEntryNo
                && x.JournalEntryID && x._originalIndex !== newRow['_originalIndex']);
            if (otherJournalEntryData.length > 0) {
                newRow.JournalEntryID = otherJournalEntryData[0].JournalEntryID;
            }
        }

        newRow.SameOrNew = newRow.JournalEntryNo;
        newRow.SameOrNewDetails = {ID: newRow.JournalEntryNo, Name: newRow.JournalEntryNo};
        newRow.NumberSeriesTaskID = this.selectedNumberSeriesTaskID;

        setTimeout(() => {
            // update alternatives, this will change when new numbers are used.
            // Do this after datasource is updated, using setTimeout
            // because we need the updated alternatives to reuse the same method
            this.setupSameNewAlternatives();

            // if we are working with images and the journalentrynumber has changed we need to notify
            // the observers
            if (this.doShowImage) {
                this.showImageForJournalEntry.emit(newRow);
            }
        });
    }

    private clearPostPostMarking(rowModel: JournalEntryData): JournalEntryData {
        if (rowModel.PostPostJournalEntryLine) {
            if (rowModel.PostPostJournalEntryLine.AccountID !== rowModel.DebitAccountID
                && rowModel.PostPostJournalEntryLine.SubAccountID !== rowModel.DebitAccountID
                && rowModel.PostPostJournalEntryLine.AccountID !== rowModel.CreditAccountID
                && rowModel.PostPostJournalEntryLine.SubAccountID !== rowModel.CreditAccountID) {

                this.toastService.addToast(
                    'Postmarkering fjernet pga endret konto',
                    ToastType.warn,
                    ToastTime.short,
                    `Postmarkeringen mot bilag ${rowModel.PostPostJournalEntryLine.JournalEntryNumber} `
                    + `ble fjernet pga konto ble endret`
                );

                // if neither account is related to the PostPostJournalEntryLine, remove the connection
                rowModel.PostPostJournalEntryLineID = null;
                rowModel.PostPostJournalEntryLine = null;
            }
        }

        return rowModel;
    }

    private calculateNetAmountAndNetAmountCurrency(rowModel: JournalEntryData): JournalEntryData {
        if (rowModel.AmountCurrency && rowModel.AmountCurrency !== 0) {
            if (rowModel.DebitAccount && rowModel.DebitVatType && !rowModel.DebitVatType.DirectJournalEntryOnly) {
                const calc = this.journalEntryService.calculateJournalEntryData(
                    rowModel.DebitAccount,
                    rowModel.DebitVatType,
                    rowModel.AmountCurrency,
                    null,
                    rowModel
                );
                rowModel.NetAmountCurrency = calc.amountNetCurrency;
            } else if (rowModel.CreditAccount
                && rowModel.CreditVatType
                && !rowModel.CreditVatType.DirectJournalEntryOnly
            ) {
                const calc = this.journalEntryService.calculateJournalEntryData(
                    rowModel.CreditAccount,
                    rowModel.CreditVatType,
                    rowModel.AmountCurrency,
                    null,
                    rowModel
                );
                rowModel.NetAmountCurrency = calc.amountNetCurrency;
            } else {
                rowModel.NetAmountCurrency = rowModel.AmountCurrency;
            }
        } else {
            rowModel.NetAmountCurrency = null;
        }

        rowModel.NetAmountCurrency = UniMath.round(rowModel.NetAmountCurrency, 2);

        if (rowModel.NetAmountCurrency) {
            rowModel.NetAmount = UniMath.round(rowModel.NetAmountCurrency * rowModel.CurrencyExchangeRate);
        } else {
            rowModel.NetAmount = null;
        }
        return rowModel;
    }


    private calculateNetAmount(rowModel: JournalEntryData): JournalEntryData {
        if (rowModel.NetAmountCurrency) {
            rowModel.NetAmount = UniMath.round(rowModel.NetAmountCurrency * (rowModel.CurrencyExchangeRate || 1));
        } else {
            rowModel.NetAmount = null;
        }

        return rowModel;
    }

    private calculateAmount(rowModel: JournalEntryData): JournalEntryData {
        if (rowModel.AmountCurrency) {
            rowModel.Amount = UniMath.round(rowModel.AmountCurrency * (rowModel.CurrencyExchangeRate || 1));
        } else {
            rowModel.Amount = null;
        }

        return rowModel;
    }

    private calculateCurrencyExchangeRate(row: JournalEntryData): JournalEntryData {
        row.CurrencyExchangeRate = Math.abs(row.Amount / row.AmountCurrency);
        return row;
    }

    public startSmartBooking(orgNumber: any, showToastIfNotRan: boolean, amount: number = 0 ) {
        const returnValue: any = {
            type: ToastType.warn
        };

        return new Promise((resolve, reject) => {
            // Dont do anything if user has more lines!
            if (!orgNumber || (this.journalEntryLines && this.journalEntryLines.length > 1)) {
                if (showToastIfNotRan) {
                    returnValue.msg = !orgNumber
                    ? 'Mangler organisasjonsnummer for å finne kontoforslag'
                    : 'Det er allerede manuelle konteringslinjer. Slett disse for å kjøre smart bokføring';
                }
               resolve(returnValue);
               return;
            } else {
                this.journalEntryService.getLedgerSuggestions(orgNumber).subscribe(res => {
                    if (!res || !res.Suggestion) {
                        this.journalEntryLines = [].concat([]);
                        this.dataChanged.emit(this.journalEntryLines);
                        returnValue.msg = 'Ingen bokføringsforslag funnet på denne leverandøren. Vi vil huske din neste bokføring.';
                        resolve(returnValue);
                        return;
                    }

                    // Check for account to suggest
                    if (res.Suggestion.AccountNumber > 0) {
                        const msg = '';

                        // Minimum percentage criteria for using suggested account number.. Should/could be set in Company settings??
                        const LIMIT_PERCENTAGE = 70;

                        let percent = res.Suggestion.PercentWeight || 0;
                        const counter = res.Suggestion.Counter;

                        if ((counter < 15 && res.Source === 3) || (counter < 20 && res.Source === 2)) {
                            percent = percent > 45 ? 45 : percent;
                        }

                        // If the suggestion does not meet limit criteria, dont do anything, just return..
                        if (res.Source > 1 && percent < LIMIT_PERCENTAGE) {
                            returnValue.msg = 'Fant ikke en konto som tilfredstiller kravet for smart bokføring på denne leverandøren. ' +
                            '<br/>Vi vil huske din bokføring på neste faktura fra denne leverandøren.';
                            resolve(returnValue);

                            this.journalEntryLines = [].concat([]);
                            this.dataChanged.emit(this.journalEntryLines);
                            return;
                        }

                        this.journalEntryService.getAccountsFromSuggeestions(res.Suggestion.AccountNumber.toString().substr(0, 3))
                        .subscribe((accounts) => {

                            if (accounts.length) {
                                let match = accounts.find(acc => acc.AccountNumber === res.Suggestion.AccountNumber);
                                match = match ? match : accounts[0];

                                let newLine;

                                if (this.journalEntryLines && this.journalEntryLines.length === 1) {
                                    this.journalEntryLines[0].Amount = amount;
                                    this.journalEntryLines[0].AmountCurrency = amount;
                                    this.journalEntryLines[0].DebitAccount = match;
                                    this.journalEntryLines[0].DebitAccountID = match.ID;
                                    this.journalEntryLines[0]['_updateDescription'] = true;
                                    if (match.VatTypeID) {
                                        this.journalEntryLines[0].DebitVatTypeID = match.VatTypeID;
                                        this.journalEntryLines[0].DebitVatType = this.vattypes.find(x => x.ID === match.VatTypeID);
                                    }
                                } else {
                                    newLine = {
                                        Dimensions: {},
                                        DebitAccount: match,
                                        DebitAccountID: match.ID,
                                        CreditAccount: null,
                                        CreditAccountID: null,
                                        Description: '',
                                        FileIDs: [],
                                        Amount: amount,
                                        AmountCurrency: amount
                                    };
                                    if (match.VatTypeID) {
                                        newLine.DebitVatTypeID = match.VatTypeID;
                                        newLine.DebitVatType = this.vattypes.find(x => x.ID === match.VatTypeID);
                                    }

                                    this.journalEntryLines.push(newLine);
                                }

                                this.journalEntryLines[0] = this.setDebitAccountProperties(this.journalEntryLines[0]);

                                if (match.CostAllocationID) {
                                    this.accountWithCostAllocationSelected.emit(this.journalEntryLines[0]);
                                    returnValue.msg = 'Fant konto med fordelingsnøkkel. Sender videre.';
                                    returnValue.type = ToastType.good;
                                    returnValue.hasCostAllocation = true;
                                    resolve(returnValue);
                                    return;
                                }

                                returnValue.msg = res.Source === 1
                                    ? 'Kontoforslag på konteringslinje er lagt til basert på ditt firmas tidligere' +
                                        ' bokføringer på faktura fra denne leverandøren.'
                                    : res.Source === 2
                                    ? 'Kontoforslag på konteringslinje er lagt til basert på bokføringer gjort på' +
                                        ' denne leverandøren i UniEconomy'
                                    : 'Kontoforslag på konteringslinje er lagt til basert på bokføringer gjort i UniEconomy' +
                                        ' på levernadører i samme bransje som valgt leverandør på din faktura.';

                                this.journalEntryLines = [].concat(this.journalEntryLines);
                                this.dataChanged.emit(this.journalEntryLines);

                                returnValue.type = ToastType.good;
                                resolve(returnValue);
                                return;
                            } else {
                                returnValue.msg = `Smart bokføring foreslo konto ${res.Suggestion.AccountNumber} men denne kontoen` +
                                ` (og nærliggende kontoer) mangler i din kontoplan.`;
                                resolve(returnValue);
                            }
                        }, err => {
                            returnValue.msg = `Noe gikk galt da smart bokføring prøvde å hente konto ${res.Suggestion.AccountNumber}`;
                            resolve(returnValue);
                        });
                    } else {
                        returnValue.msg = `Noe gikk galt da smart bokføring prøvde å hente bokføringsforslag.`;
                        resolve(returnValue);
                    }
                }, err => {
                    returnValue.msg = `Noe gikk galt da smart bokføring prøvde å hente bokføringsforslag. ` +
                    `Prøv å start den manuelt igjen i menyen oppe til høyre.`;
                    resolve(returnValue);
                });
            }
        });
    }

    private getExternalCurrencyExchangeRate(rowModel: JournalEntryData): Promise<JournalEntryData> {
        const rowDate = rowModel.FinancialDate || new LocalDate();
        rowModel.CurrencyID = rowModel.CurrencyCode.ID;
        return new Promise(done => {
            if (rowModel.CurrencyCode.ID === this.companySettings.BaseCurrencyCodeID) {
                rowModel.CurrencyExchangeRate = 1;
                done(rowModel);
            } else {
                const currencyDate = moment(rowDate).isAfter(moment()) ? new LocalDate() : rowDate;
                this.currencyService.getCurrencyExchangeRate(
                    rowModel.CurrencyCode.ID,
                    this.companySettings.BaseCurrencyCodeID,
                    currencyDate
                )
                    .map(e => e.ExchangeRate)
                    .finally(() => done(rowModel))
                    .subscribe(
                        newExchangeRate => rowModel.CurrencyExchangeRate = newExchangeRate,
                        err => this.errorService.handle(err)
                    );
            }
        });
    }

    private calculateGrossAmount(rowModel: JournalEntryData): JournalEntryData {
        if (rowModel.NetAmountCurrency && rowModel.NetAmountCurrency !== 0) {
            if (rowModel.DebitAccount && rowModel.DebitVatType && !rowModel.DebitVatType.DirectJournalEntryOnly) {
                const calc = this.journalEntryService.calculateJournalEntryData(
                    rowModel.DebitAccount,
                    rowModel.DebitVatType,
                    null,
                    rowModel.NetAmountCurrency,
                    rowModel
                );
                rowModel.AmountCurrency = calc.amountGrossCurrency;
            } else if (rowModel.CreditAccount
                && rowModel.CreditVatType
                && !rowModel.CreditVatType.DirectJournalEntryOnly
            ) {
                const calc = this.journalEntryService.calculateJournalEntryData(
                    rowModel.CreditAccount,
                    rowModel.CreditVatType,
                    null,
                    rowModel.NetAmountCurrency,
                    rowModel
                );
                rowModel.AmountCurrency = calc.amountGrossCurrency;
            } else {
                rowModel.AmountCurrency = rowModel.NetAmountCurrency;
            }
        } else {
            rowModel.AmountCurrency = null;
            rowModel.Amount = null;
        }

        rowModel.AmountCurrency = UniMath.round(rowModel.AmountCurrency, 2);
        return rowModel;
    }

    private setAmount(rowModel: JournalEntryData): JournalEntryData {
        if (rowModel.AmountCurrency) { return rowModel; }

        rowModel.Amount = UniMath.round(rowModel.AmountCurrency * (rowModel.CurrencyExchangeRate || 1));
        return rowModel;
    }

    private setDebitAccountProperties(rowModel: JournalEntryData): JournalEntryData {
        const account = rowModel.DebitAccount;
        if (account) {
            rowModel.DebitAccountID = account.ID;

            if (this.companySettings.TaxMandatoryType === 3) {
                if (account.VatTypeID) {
                    const vatType = this.vattypes.find(x => x.ID === account.VatTypeID);
                    rowModel.DebitVatType = vatType;
                } else {
                    rowModel.DebitVatType = null;
                }
            } else if (this.companySettings.TaxMandatoryType === 2) {
                if (account.VatTypeID) {
                    const vatType = this.vattypes.find(x => x.ID === account.VatTypeID);
                    const overrideVatCodes = ['3', '31', '32', '33'];
                    const overrideVatCodesNone = ['1', '11', '12', '13'];
                    if (overrideVatCodes.indexOf(vatType.VatCode) !== -1) {
                        const vatType6 = this.vattypes.find(x => x.VatCode === '6');
                        rowModel.DebitVatType = vatType6;
                    } else if (overrideVatCodesNone.indexOf(vatType.VatCode) !== -1) {
                        rowModel.DebitVatType = null;
                    } else {
                        rowModel.DebitVatType = vatType;
                    }
                } else {
                    rowModel.DebitVatType = null;
                }
            } else {
                rowModel.DebitVatType = null;
            }

            this.setDebitVatTypeProperties(rowModel);
            this.setVatDeductionPercent(rowModel);
        } else {
            rowModel.DebitAccountID = null;
            rowModel.DebitVatType = null;
        }
        return rowModel;
    }

    private setCreditAccountProperties(rowModel: JournalEntryData): JournalEntryData {
        const account = rowModel.CreditAccount;
        if (account) {
            rowModel.CreditAccountID = account.ID;

            if (this.companySettings.TaxMandatoryType === 3) {
                if (account.VatTypeID) {
                    const vatType = this.vattypes.find(x => x.ID === account.VatTypeID);
                    rowModel.CreditVatType = vatType;
                } else {
                    rowModel.CreditVatType = null;
                }
            } else if (this.companySettings.TaxMandatoryType === 2) {
                if (account.VatTypeID) {
                    const vatType = this.vattypes.find(x => x.ID === account.VatTypeID);
                    const overrideVatCodes = ['3', '31', '32', '33'];
                    const overrideVatCodesNone = ['1', '11', '12', '13'];
                    if (overrideVatCodes.indexOf(vatType.VatCode) !== -1) {
                        const vatType6 = this.vattypes.find(x => x.VatCode === '6');
                        rowModel.CreditVatType = vatType6;
                    } else if (overrideVatCodesNone.indexOf(vatType.VatCode) !== -1) {
                        rowModel.DebitVatType = null;
                    } else {
                        rowModel.CreditVatType = vatType;
                    }
                } else {
                    rowModel.CreditVatType = null;
                }
            } else {
                rowModel.CreditVatType = null;
            }

            this.setCreditVatTypeProperties(rowModel);
            this.setVatDeductionPercent(rowModel);
        } else {
            rowModel.CreditAccountID = null;
            rowModel.CreditVatType = null;
        }
        return rowModel;
    }

    private setVatDeductionPercent(rowModel: JournalEntryData, isPercentageChanged: boolean = false): JournalEntryData {
        let deductivePercent: number = 0;

        if (!rowModel.DebitVatTypeID && !rowModel.CreditVatTypeID) {
            return rowModel;
        }

        if (isPercentageChanged) {
            rowModel.VatDeductionPercent = rowModel.VatDeductionPercent || 0;
            return rowModel;
        }

        rowModel.VatDeductionPercent = null;

        if (rowModel.DebitAccount && rowModel.DebitAccount.UseVatDeductionGroupID) {
            deductivePercent = this.journalEntryService.getVatDeductionPercent(
                this.vatDeductions, rowModel.DebitAccount, (rowModel.VatDate ? rowModel.VatDate : rowModel.FinancialDate)
            );
        }

        if (deductivePercent === 0 && rowModel.CreditAccount && rowModel.CreditAccount.UseVatDeductionGroupID) {
            deductivePercent = this.journalEntryService.getVatDeductionPercent(
                this.vatDeductions, rowModel.CreditAccount, (rowModel.VatDate ? rowModel.VatDate : rowModel.FinancialDate)
            );
        }

        if (deductivePercent !== 0) {
            rowModel.VatDeductionPercent = deductivePercent;
        }
        return rowModel;
    }

    private setDebitVatTypeProperties(rowModel: JournalEntryData): JournalEntryData {
        let vattype: VatType = rowModel.DebitVatType;

        if (vattype) {
            this.journalEntryService.setCorrectVatPercent(vattype, rowModel);
        }

        if (vattype && vattype.DirectJournalEntryOnly) {
            if (rowModel.DebitAccountID && rowModel.DebitAccountID !== vattype.IncomingAccountID) {
                rowModel.DebitVatType = null;
                vattype = null;

                this.toastService.addToast(
                    'Ikke tillatt å bruke denne mvakoden',
                    ToastType.bad,
                    ToastTime.medium,
                    'Denne Mvakoden kan kun brukes ved direktepostering av MVA på tilhørende regnskapskonto');
            }
        }

        rowModel.DebitVatTypeID = vattype ? vattype.ID : null;
        return rowModel;
    }

    private setCreditVatTypeProperties(rowModel: JournalEntryData): JournalEntryData {
        let vattype = rowModel.CreditVatType;

        if (vattype) {
            this.journalEntryService.setCorrectVatPercent(vattype, rowModel);
        }

        if (vattype && vattype.DirectJournalEntryOnly) {
            if (rowModel.CreditAccountID && rowModel.CreditAccountID !== vattype.IncomingAccountID) {
                rowModel.CreditVatType = null;
                vattype = null;

                this.toastService.addToast(
                    'Ikke tillatt å bruke denne mvakoden',
                    ToastType.bad,
                    ToastTime.medium,
                    'Denne mvakoden kan kun brukes ved direktepostering av MVA på tilhørende regnskapskonto');
            }
        }

        rowModel.CreditVatTypeID = vattype ? vattype.ID : null;
        return rowModel;
    }

    private setVatDeductionProperties(newRow: JournalEntryData): JournalEntryData {
        if (newRow.VatDeductionPercent &&
            (newRow.VatDeductionPercent <= 0 || newRow.VatDeductionPercent > 100)) {
            this.toastService.addToast(
                'Ugyldig verdi angitt for Fradragprosent',
                ToastType.warn,
                ToastTime.short,
                'Verdien er erstattet med standardverdien'
            );
            this.setVatDeductionPercent(newRow);
        } else if (newRow.VatDeductionPercent &&
            !((newRow.DebitAccount && newRow.DebitAccount.UseVatDeductionGroupID)
            || (newRow.CreditAccount && newRow.CreditAccount.UseVatDeductionGroupID))
        ) {
            this.toastService.addToast(
                'Fradragsprosent kan ikke angis',
                ToastType.warn,
                ToastTime.short,
                'Ingen konto med forholdsvis mva er valgt, og fradragsprosent kan derfor ikke angis.'
            );
            this.setVatDeductionPercent(newRow);
        } else if (!newRow.VatDeductionPercent) {
            this.setVatDeductionPercent(newRow, true);
        }
        return newRow;
    }

    private setProjectProperties(rowModel: any): JournalEntryData {
        const project = rowModel['Dimensions.Project'];
        if (project) {
            if (!rowModel.Dimensions) {
                rowModel.Dimensions = {};
            }
            rowModel.Dimensions.Project = project;
            rowModel.Dimensions.ProjectID = project.ID;
        } else {
            if (!rowModel.Dimensions) {
                rowModel.Dimensions = {};
            }
            rowModel.Dimensions.Project = null;
            rowModel.Dimensions.ProjectID = null;
        }
        return rowModel;
    }

    private setDimensionProperties(rowModel: any, dimType: string) {
        const dimSplit = dimType.split('.');
        const dimension = rowModel[dimType];

        if (dimension) {
            if (!rowModel.Dimensions) {
                rowModel.Dimensions = {};
            }
            rowModel.Dimensions[dimSplit[1]] = dimension;
            rowModel.Dimensions[dimSplit[1] + 'ID'] = dimension.ID;
        } else {
            rowModel.Dimensions[dimSplit[1]] = null;
            rowModel.Dimensions[dimSplit[1] + 'ID'] = null;
        }
        return rowModel;
    }

    private getCreatedByName() {
        this.userService.GetAll('').subscribe(users => {
            users.forEach(user => {
                const data = {
                    globalIdentity: user.GlobalIdentity,
                    displayName: user.DisplayName
                };
                this.users.push(data);
            });
        });
    }

    private setDescriptionProperties(rowModel: JournalEntryData): JournalEntryData {
        let journalEntryLineDescription = rowModel.Description;
        if (journalEntryLineDescription === null) { return rowModel; }
        const macroCodesInDescription: Array<string> = [];

        for (let i = 0; i < journalEntryLineDescription.length; i++) {
            if (journalEntryLineDescription[i] === '[') {
                for (let i2 = i ; i2 < journalEntryLineDescription.length; i2 ++) {
                    if (journalEntryLineDescription[i2] === '[') { i = i2; }
                    if (journalEntryLineDescription[i2] === ']') {
                       macroCodesInDescription.push(journalEntryLineDescription.substring(i + 1, i2));
                       i = i2;
                       break;
                    }
                }
            }
        }

        if (macroCodesInDescription.length > 0) {

            macroCodesInDescription.forEach(macroCode => {

                const macroCodeObjectProperties = macroCode.split('.');
                let lastObjectProperty: any = null;

                if (macroCodeObjectProperties !== null) {
                    macroCodeObjectProperties.forEach(property => {
                        if (lastObjectProperty === null) {
                            lastObjectProperty = rowModel[property];
                        } else { lastObjectProperty = lastObjectProperty[property]; }
                    });

                    if (lastObjectProperty !== null) {
                        const replaceValue = lastObjectProperty.toString();
                        if (replaceValue) {
                            journalEntryLineDescription = journalEntryLineDescription.replace(
                                ('[' + macroCode + ']'), replaceValue
                            );
                            rowModel.Description = journalEntryLineDescription;
                        }
                    }
                }
            });
        }
        return rowModel;
    }

    private setDepartmentProperties(rowModel: any): JournalEntryData {
        const dep = rowModel['Dimensions.Department'];
        if (dep) {
            if (!rowModel.Dimensions) {
                rowModel.Dimensions = {};
            }
            rowModel.Dimensions.Department = dep;
            rowModel.Dimensions.DepartmentID = dep.ID;
        } else {
            if (!rowModel.Dimensions) {
                rowModel.Dimensions = {};
            }
            rowModel.Dimensions.Department = null;
            rowModel.Dimensions.DeparmentID = null;
        }
        return rowModel;
    }

    private setCustomerInvoiceProperties(rowModel: JournalEntryData): JournalEntryData {
        const invoice = <CustomerInvoice> rowModel['CustomerInvoice'];
        if (invoice) {
            rowModel.InvoiceNumber = invoice.InvoiceNumber;
            rowModel.CurrencyID = invoice.CurrencyCodeID;
            rowModel.CurrencyCode = invoice.CurrencyCode;
            rowModel.CurrencyExchangeRate = invoice.CurrencyExchangeRate;
        }

        if (invoice && invoice.JournalEntry && invoice.JournalEntry.Lines) {
            for (let i = 0; i < invoice.JournalEntry.Lines.length; i++) {
                const line = invoice.JournalEntry.Lines[i];

                if (line.Account.UsePostPost) {
                    rowModel.CustomerInvoiceID = invoice.ID;
                    rowModel.AmountCurrency = line.RestAmountCurrency;
                    rowModel.Amount = line.RestAmount;

                    if (line.SubAccount) {
                        rowModel.CreditAccountID = line.SubAccountID;
                        rowModel.CreditAccount = line.SubAccount;
                    } else {
                        rowModel.CreditAccountID = line.AccountID;
                        rowModel.CreditAccount = line.Account;
                    }

                    if (this.defaultAccountPayments) {
                        rowModel.DebitAccount = this.defaultAccountPayments;
                        rowModel.DebitAccountID = this.defaultAccountPayments.ID;
                    }

                    break;
                }
            }
        }
        return rowModel;
    }

    private setInvoiceNumberProperties(row: JournalEntryData) {
        // get journalentryline with restamount ne 0 and invoicenumber eq row.InvoiceNumber
        // (and if account is defined, filter on account)
        if (row.InvoiceNumber && row.InvoiceNumber !== '') {
            let filter = `expand=Account,SubAccount,CurrencyCode&filter=InvoiceNumber eq `
                + `'${row.InvoiceNumber}' and RestAmount ne 0 and (StatusCode eq 31001 or StatusCode eq 31002)`;

            if (row.DebitAccount || row.CreditAccount) {
                let accountFilter = '';
                if (row.DebitAccount && row.DebitAccount.UsePostPost) {
                    accountFilter += `AccountID eq ${row.DebitAccountID}`;
                }
                if (row.CreditAccount && row.CreditAccount.UsePostPost) {
                    accountFilter +=
                        (accountFilter !== '' ? ' or ' : '') + `AccountID eq ${row.CreditAccountID}`;
                }

                if (accountFilter !== '') {
                    filter += ` and (${accountFilter})`;
                }
            }

            this.journalEntryLineService.GetAll(filter)
                .subscribe(rows => {
                    // if no lines are found: dont do anything else
                    if (rows.length === 1) {
                        const copyFromJournalEntryLine = rows[0];
                        this.setRowValuesBasedOnExistingJournalEntryLine(row, copyFromJournalEntryLine).then(() => {
                            this.updateJournalEntryLine(row);

                            if (row.CurrencyID !== this.companySettings.BaseCurrencyCodeID) {
                                this.showAgioDialog(row)
                                    .then((res) => {
                                        // reset focus after modal closes
                                        this.table.focusRow(row['_originalIndex']);
                                    });
                            }
                        });
                    } else if (rows.length > 1) {
                        // if multiple lines are found: show modal with lines that can be selected

                        this.modalService.open(SelectJournalEntryLineModal, { data: { journalentrylines: rows } })
                        .onClose
                        .subscribe((selectedLine) => {
                            if (!selectedLine) {
                                return;
                            }
                            this.setRowValuesBasedOnExistingJournalEntryLine(row, selectedLine).then(() => {
                                this.updateJournalEntryLine(row);

                                if (row.CurrencyID !== this.companySettings.BaseCurrencyCodeID) {
                                    this.showAgioDialog(row)
                                        .then((res) => {
                                            // reset focus after modal closes
                                            this.table.focusRow(row['_originalIndex']);
                                        });
                                } else {
                                    // reset focus after modal closes
                                    this.table.focusRow(row['_originalIndex']);
                                }
                            });
                        });
                    }
                }, err => {
                    this.errorService.handle(err);
                });
        }

    }

    private setRowValuesBasedOnExistingJournalEntryLine(
        row: JournalEntryData, copyFromJournalEntryLine: JournalEntryLine
    ): Promise<void> {
        return new Promise((resolve) => {
            // if one line is found: update accounts, amount and text
            const account = copyFromJournalEntryLine.SubAccount
                ? copyFromJournalEntryLine.SubAccount
                : copyFromJournalEntryLine.Account;

            const restAmount = copyFromJournalEntryLine.RestAmount;
            if (restAmount > 0) {
                row.CreditAccountID = account.ID;
                row.CreditAccount = account;

                row.DebitAccountID = this.defaultAccountPayments.ID;
                row.DebitAccount = this.defaultAccountPayments;
            } else {
                row.DebitAccountID = account.ID;
                row.DebitAccount = account;

                row.CreditAccountID = this.defaultAccountPayments.ID;
                row.CreditAccount = this.defaultAccountPayments;
            }

            row.Amount = Math.abs(
                copyFromJournalEntryLine.RestAmountCurrency * copyFromJournalEntryLine.CurrencyExchangeRate
            );
            row.NetAmount = Math.abs(
                copyFromJournalEntryLine.RestAmountCurrency * copyFromJournalEntryLine.CurrencyExchangeRate
            );
            row.AmountCurrency = Math.abs(copyFromJournalEntryLine.RestAmountCurrency);
            row.NetAmountCurrency = Math.abs(copyFromJournalEntryLine.RestAmountCurrency);

            row.PostPostJournalEntryLineID = copyFromJournalEntryLine.ID;
            row.PostPostJournalEntryLine = copyFromJournalEntryLine;
            row.CurrencyID = copyFromJournalEntryLine.CurrencyCodeID;
            row.CurrencyCode = copyFromJournalEntryLine.CurrencyCode;
            row.CurrencyExchangeRate = copyFromJournalEntryLine.CurrencyExchangeRate;
            row.JournalEntryTypeID = copyFromJournalEntryLine.JournalEntryTypeID;
            row.JournalEntryType = copyFromJournalEntryLine.JournalEntryType;

            if (copyFromJournalEntryLine.CustomerInvoiceID) {
                this.statisticsService.GetAllUnwrapped(`model=customerinvoicereminder&select=isnull(sum(reminderfee),0) as SumReminderFee,isnull(sum(reminderfeecurrency),0) as SumReminderFeeCurrency,isnull(sum(interestfee),0) as SumInterestFee,isnull(sum(interestfeecurrency),0) as SumInterestFeeCurrency&filter=customerinvoiceid eq ${copyFromJournalEntryLine.CustomerInvoiceID} and statuscode eq 42101`)
                .map(res => res[0])
                .subscribe(sums => {
                    row.Amount += sums.SumReminderFee;
                    row.NetAmount += sums.SumReminderFee;
                    row.AmountCurrency += sums.SumReminderFeeCurrency + sums.SumInterestFee;
                    row.NetAmountCurrency += sums.SumReminderFeeCurrency + sums.SumInterestFeeCurrency;

                    setTimeout(() => this.table.triggerChange());
                    resolve();
                });
            }
            else {
                resolve();
            }
        });
    }

    private setupUniTable() {

        if (!this.defaultVisibleColumns) {
            this.defaultVisibleColumns = [];
        }

        const sameOrNewCol = new UniTableColumn(
            'SameOrNewDetails', 'Bilagsnr', UniTableColumnType.Lookup
        )
            .setPlaceholder('Neste ledige hvis tom')
            .setWidth('100px')
            .setOptions({
                displayField: 'Name',
                lookupFunction: (searchValue) => {
                    return Observable.from([this.journalEntryNumberAlternatives.filter(
                        (alternative) => alternative.Name.indexOf(searchValue.toLowerCase()) >= 0
                            || (alternative.ID === this.SAME_OR_NEW_NEW)
                    )]);
                },
                itemTemplate: (item) => {
                    return item ? item.Name : '';
                }
            })
            .setTemplate((item) => {
                return item.JournalEntryNo ? item.JournalEntryNo : '';
            });

        const vatDateCol = new UniTableColumn('VatDate', 'Dato', UniTableColumnType.LocalDate)
            .setWidth('110px')
            .setOptions({
                useSmartYear: true,
                useFinancialYear: true
            });

        const financialDateCol = new UniTableColumn('FinancialDate', 'Regnskapsdato', UniTableColumnType.LocalDate)
            .setWidth('110px')
            .setVisible(false)
            .setOptions({
                useSmartYear: true,
                useFinancialYear: true
            });

        const kidCol = new UniTableColumn('PaymentID', 'KID').setVisible(false);

        const invoiceNoCol = new UniTableColumn('CustomerInvoice', 'Faktura', UniTableColumnType.Lookup)
            .setDisplayField('InvoiceNumber')
            .setWidth('10%')
            .setVisible(false)
            .setOptions({
                itemTemplate: (selectedItem: CustomerInvoice) => {
                    return selectedItem
                    ? (`Fakturanr: ${selectedItem.InvoiceNumber}. `
                        + `Restbeløp: ${selectedItem.RestAmountCurrency} ${selectedItem.CurrencyCode.Code}`)
                    : '';
                },
                lookupFunction: (searchValue) => {
                    return this.customerInvoiceService.GetAll(
                        `filter=startswith(InvoiceNumber, '${searchValue}')&top=10`
                        + `&expand=JournalEntry,JournalEntry.Lines,`
                        + `JournalEntry.Lines.Account,JournalEntry.Lines.SubAccount,CurrencyCode`
                    );
                }
            });


        const invoiceNoTextCol = new UniTableColumn(
            'InvoiceNumber', 'Fakturanr', UniTableColumnType.Text
        )
            .setWidth('80px')
            .setVisible(false);

        const dueDateCol = new UniTableColumn('DueDate', 'Forfall', UniTableColumnType.LocalDate).setWidth('80px')
            .setVisible(false)
            .setOptions({defaultYear: this.currentFinancialYear ? this.currentFinancialYear.Year : new Date().getFullYear()});

        const debitAccountCol = new UniTableColumn(
            'DebitAccount',
            this.mode !== JournalEntryMode.SupplierInvoice ? 'Debet' : 'Konto',
            UniTableColumnType.Lookup
        )
            .setDisplayField('DebitAccount.AccountNumber')
            .setTemplate((rowModel) => {
                if (rowModel.DebitAccount) {
                    const account = rowModel.DebitAccount;
                    return account.AccountNumber
                        + ': '
                        + account.AccountName;
                }
                return '';
            })
            .setWidth('10%')
            .setOptions({
                itemTemplate: (selectedItem) => {
                    return (selectedItem.AccountNumber + ' - ' + selectedItem.AccountName);
                },
                lookupFunction: (searchValue) => {
                    return this.accountSearch(searchValue);
                },
                showResultAsTable: theme.theme === THEMES.SR,
                resultTableConfig: {
                    fields: [
                        {
                            header: 'Konto',
                            key: 'AccountNumber',
                            class: '',
                            width: '100px'
                        },
                        {
                            header: 'Navn',
                            key: 'AccountName',
                            class: '',
                            width: '250px'
                        },
                        {
                            header: 'Stikkord',
                            key: 'Keywords',
                            class: '',
                            width: '150px'
                        },
                        {
                            header: 'Beskrivelse',
                            key: 'Description',
                            class: '250px'
                        }
                    ],
                },
                addNewButton: {
                    label: 'Opprett ny reskontro',
                    action: text => this.openNewAccountModal(this.table.getCurrentRow(), text)
                },
            });

        const manDimReportCol = new UniTableColumn('', 'Påkrevde dimensjoner', UniTableColumnType.Text)
        .setVisible(false)
        .setTemplate(() => '')
        .setResizeable(false)
        .setEditable(() => false)
        .setWidth('40px')  // '5%') //Har ingen effekt
        .setTooltipResolver( (rowModel) => {
            if (rowModel.StatusCode) {
                return null;
            }
            let msgText = '';
            let iconType = 0;
            const debRep = rowModel.MandatoryDimensionsValidation && rowModel.MandatoryDimensionsValidation.DebitReport;
            const creRep = rowModel.MandatoryDimensionsValidation && rowModel.MandatoryDimensionsValidation.CreditReport;

            let showTooltip = false;

            if (
                rowModel.MandatoryDimensionsValidation
                && (rowModel.MandatoryDimensionsValidation.CreditReport
                || rowModel.MandatoryDimensionsValidation.DebitReport)
            ) {
                if (
                    (rowModel.MandatoryDimensionsValidation.CreditReport
                    && Object.keys(rowModel.MandatoryDimensionsValidation.CreditReport.RequiredDimensions).length)
                    || (rowModel.MandatoryDimensionsValidation.DebitReport
                    && Object.keys(rowModel.MandatoryDimensionsValidation.DebitReport.RequiredDimensions).length)
                ) {
                    showTooltip = true;
                }

                if (
                    (rowModel.MandatoryDimensionsValidation.CreditReport
                    && Object.keys(rowModel.MandatoryDimensionsValidation.CreditReport.WarningDimensions).length)
                    || (rowModel.MandatoryDimensionsValidation.DebitReport
                    && Object.keys(rowModel.MandatoryDimensionsValidation.DebitReport.WarningDimensions).length)
                ) {
                    showTooltip = true;
                }
            }

            if (debRep || creRep) {

                if (debRep && debRep.MissingRequiredDimensionsMessage) { msgText = debRep.MissingRequiredDimensionsMessage + '\n'; }
                if (creRep && creRep.MissingRequiredDimensionsMessage) { msgText += creRep.MissingRequiredDimensionsMessage + '\n'; }
                if (msgText !== '') { iconType = 1; }

                if (debRep && debRep.MissingOnlyWarningsDimensionsMessage) {
                    msgText += debRep.MissingOnlyWarningsDimensionsMessage + '\n';
                }
                if (creRep && creRep.MissingOnlyWarningsDimensionsMessage) {
                    msgText += creRep.MissingOnlyWarningsDimensionsMessage + '\n';
                }
                if (iconType !== 1 && msgText !== '') { iconType = 2; }

                const type = iconType === 1 ? 'bad' : iconType === 2 ? 'warn' : 'good';
                if (type === 'good') {
                    msgText = 'Påkrevde dimensjoner registrert ok';
                }
                if (!showTooltip) {
                    return null;
                }
                return {
                    type: type,
                    text: msgText,
                };
            }
        });
        const debitVatTypeCol = new UniTableColumn('DebitVatType', 'MVA', UniTableColumnType.Lookup)
            .setDisplayField('DebitVatType.VatCode')
            .setVisible(theme.theme === THEMES.EXT02 ? this.companySettings.TaxMandatoryType === 3 : true)
            .setWidth('8%')
            .setSkipOnEnterKeyNavigation(true)
            .setTemplate((rowModel) => {
                if (rowModel.DebitVatType) {
                    const vatType = rowModel.DebitVatType;
                    return `${vatType.VatCode}: ${vatType.VatPercent}%`;
                }
                return '';
            })
            .setOptions({
                itemTemplate: (item) => {
                    return `${item.VatCode}: ${item.Name} - ${item.VatPercent}%`;
                },
                lookupFunction: (searchValue) => {
                    return Observable.from([this.vattypes.filter(
                        (vattype) => vattype.VatCode === searchValue
                            || vattype.VatPercent === searchValue
                            || vattype.Name.toLowerCase().indexOf(searchValue.toLowerCase()) >= 0
                            || searchValue === `${vattype.VatCode}: ${vattype.Name} - ${vattype.VatPercent}%`
                            || searchValue === `${vattype.VatCode}: ${vattype.VatPercent}%`
                    )]);
                },
                groupConfig: this.groupConfig
            })
            .setEditable(this.companySettings.TaxMandatoryType === 3);

        const creditAccountCol = new UniTableColumn('CreditAccount', 'Kredit', UniTableColumnType.Lookup)
            .setDisplayField('CreditAccount.AccountNumber')
            .setTemplate((rowModel) => {
                if (rowModel.CreditAccount) {
                    const account = rowModel.CreditAccount;
                    return account.AccountNumber
                        + ': '
                        + account.AccountName;
                }
                return '';
            })
            .setWidth('10%')
            .setOptions({
                itemTemplate: (selectedItem) => {
                    return (selectedItem.AccountNumber + ' - ' + selectedItem.AccountName);
                },
                lookupFunction: (searchValue) => {
                    return this.accountSearch(searchValue);
                },
                addNewButton: {
                    label: 'Opprett ny reskontro',
                    action: text => this.openNewAccountModal(this.table.getCurrentRow(), text)
                },
            });

        const creditVatTypeCol = new UniTableColumn('CreditVatType', 'MVA', UniTableColumnType.Lookup)
            .setWidth('8%')
            .setVisible(theme.theme === THEMES.EXT02 ? this.companySettings.TaxMandatoryType === 3 : true)
            .setSkipOnEnterKeyNavigation(true)
            .setTemplate((rowModel) => {
                if (rowModel.CreditVatType) {
                    const vatType = rowModel.CreditVatType;
                    return `${vatType.VatCode}: ${vatType.VatPercent}%`;
                }
                return '';
            })
            .setOptions({
                itemTemplate: (item) => {
                    return `${item.VatCode}: ${item.Name} - ${item.VatPercent}%`;
                },
                lookupFunction: (searchValue) => {
                    return Observable.from([this.vattypes.filter(
                        (vattype) => vattype.VatCode === searchValue
                            || vattype.VatPercent === searchValue
                            || vattype.Name.toLowerCase().indexOf(searchValue.toLowerCase()) >= 0
                            || searchValue === `${vattype.VatCode}: ${vattype.Name} - ${vattype.VatPercent}%`
                            || searchValue === `${vattype.VatCode}: ${vattype.VatPercent}%`
                    )]);
                },
                groupConfig: this.groupConfig
            })
            .setEditable(this.companySettings.TaxMandatoryType === 3);

        const deductionPercentCol = new UniTableColumn('VatDeductionPercent', 'Fradrag %', UniTableColumnType.Number)
            .setWidth('90px')
            .setSkipOnEnterKeyNavigation(true)
            .setVisible(false);

        const amountCol = new UniTableColumn(
            'Amount', `Beløp (${this.companySettings.BaseCurrencyCode.Code})`, UniTableColumnType.Money
        )
            .setSkipOnEnterKeyNavigation(true)
            .setVisible(false)
            .setWidth('90px');
        const amountCurrencyCol = new UniTableColumn(
            'AmountCurrency', 'Beløp', UniTableColumnType.Money
        ).setWidth('90px');
        const netAmountCol = new UniTableColumn('NetAmountCurrency', 'Netto', UniTableColumnType.Money).setWidth('90px')
            .setSkipOnEnterKeyNavigation(true)
            /*  KE: We should display a tooltip if editing is not possible,
                but currently this causes problems, so ignore this for now
                .setTemplate((row: JournalEntryData) => {
                if (row['NetAmountCurrency'] && row.VatDeductionPercent && row.VatDeductionPercent !== 0
                    && ((row.DebitAccount && !!row.DebitAccount.UseVatDeductionGroupID)
                    || (row.CreditAccount && !!row.CreditAccount.UseVatDeductionGroupID))) {
                    return `<span title="Nettobeløp kan ikke settes når en konto med forholdsvis mva er brukt">
                    ${this.numberFormatService.asMoney(row['NetAmountCurrency'])}</span>`;
                } else if (row['NetAmountCurrency']) {
                    return this.numberFormatService.asMoney(row['NetAmountCurrency']);
                }
            })*/
            .setEditable((row: JournalEntryData) => {
                if (row.VatDeductionPercent && row.VatDeductionPercent !== 0
                    && ((row.DebitAccount && !!row.DebitAccount.UseVatDeductionGroupID)
                    || (row.CreditAccount && !!row.CreditAccount.UseVatDeductionGroupID))) {
                    return false;
                }

                return row.StatusCode ? false : true;
            });

        const currencyCodeCol = new UniTableColumn('CurrencyCode', 'Valuta', UniTableColumnType.Select)
            .setWidth('90px')
            .setTemplate(row => row && row.CurrencyCode && row.CurrencyCode.Code)
            .setVisible(false)
            .setSkipOnEnterKeyNavigation(true)
            .setOptions({
                itemTemplate: rowModel => rowModel.Code,
                resource: this.currencyCodeService.GetAll(null)
            });

        const currencyExchangeRate = new UniTableColumn('CurrencyExchangeRate', 'V-Kurs', UniTableColumnType.Number)
            .setNumberFormat({
                thousandSeparator: ' ',
                decimalSeparator: ',',
                decimalLength: 4
            })
            .setVisible(false)
            .setSkipOnEnterKeyNavigation(true)
            .setWidth('90px');


        const journalEntryTypeCol = new UniTableColumn('JournalEntryType', 'Bilagstype', UniTableColumnType.Lookup)
            .setDisplayField('JournalEntryType.DisplayName')
            .setVisible(false)
            .setWidth('12%')
            .setOptions({
                itemTemplate: (item) => {
                    return (item.Number  + ': ' + item.DisplayName);
                },
                lookupFunction: (query) => {
                    return this.statisticsService.GetAll(`model=JournalEntryType&select=Number as Number,DisplayName as DisplayName,ID as ID&orderby=Number&filter=startswith(Number, '${query}') or startswith(DisplayName,'${query}') and Number gt 0`)
                        .map(x => x.Data ? x.Data : []);
                    }
                });

        const projectCol = new UniTableColumn('Dimensions.Project', 'Prosjekt', UniTableColumnType.Lookup)
            .setDisplayField('Project.ProjectNumber')
            .setVisible(false)
            .setTemplate((rowModel) => {
                if (rowModel.Dimensions && rowModel.Dimensions.Project && rowModel.Dimensions.Project.Name) {
                    const project = rowModel.Dimensions.Project;
                    return project.ProjectNumber + ' - ' + project.Name;
                }
                return '';
            })
            .setWidth('12%')
            .setOptions({
                itemTemplate: (selectedItem) => {
                    return `${selectedItem.ProjectNumber} - ${selectedItem.Name}`;
                },
                lookupFunction: (searchValue) => {
                    return this.projectSearch(searchValue);
                }
            });

        const departmentCol = new UniTableColumn('Dimensions.Department', 'Avdeling', UniTableColumnType.Lookup)
            .setWidth('12%')
            .setVisible(false)
            .setTemplate((rowModel) => {
                if (rowModel.Dimensions && rowModel.Dimensions.Department && rowModel.Dimensions.Department.Name) {
                    const dep = rowModel.Dimensions.Department;
                    return dep.DepartmentNumber + ' - ' + dep.Name;
                }
                return '';
            })
            .setOptions({
                itemTemplate: (item) => {
                    return (item.DepartmentNumber + ' - ' + item.Name);
                },
                lookupFunction: (searchValue) => {
                    return this.departmentSearch(searchValue);
                }
            });

        const dimensionCols = [];
        this.dimensionTypes.forEach((type, index) => {
            const dimCol = new UniTableColumn('Dimensions.Dimension' + type.Dimension, type.Label, UniTableColumnType.Lookup)
            .setVisible(false)
            .setEditable(type.IsActive)
            .setTemplate((rowModel) => {
                if (!rowModel['_isEmpty'] && rowModel.Dimensions && rowModel.Dimensions['Dimension' + type.Dimension]) {
                    const dim = rowModel.Dimensions['Dimension' + type.Dimension];
                    return dim.Number + ': ' + dim.Name;
                }

                return '';
            })
            .setDisplayField('Dimensions.Dimension' + type.Dimension + '.Name')
            .setOptions({
                itemTemplate: (item) => {
                    return (item.Number + ': ' + item.Name);
                },
                lookupFunction: (query) => {
                    return this.customDimensionService.getCustomDimensionList(
                        type.Dimension,
                        `?filter=startswith(Number,'${query}') or contains(Name,'${query}')&top=30`
                    ).catch((err, obs) => this.errorService.handleRxCatch(err, obs));
                }
            }).setWidth('8%');

            dimensionCols.push(dimCol);
        });

        const descriptionCol = new UniTableColumn('Description', 'Beskrivelse', UniTableColumnType.Typeahead)
            .setOptions({
                lookupFunction: (query) => {
                    const results = (this.predefinedDescriptions || []).filter(item => {
                        const code = (item.Code || '').toString();
                        const description = (item.Description || '').toLowerCase();
                        query = query.toLowerCase();

                        return code.startsWith(query) || description.includes(query);
                    });

                    return Observable.of(results);
                },
                itemTemplate: (item) => {
                    return (item.Code + ': ' + item.Description);
                },
                itemValue: (item) => {
                    return item ? item.Description : '';
                }
            })
            .setWidth('200px');

        const addedPaymentCol = new UniTableColumn('JournalEntryPaymentData', '$', UniTableColumnType.Text, false)
            .setTemplate(line => line.JournalEntryPaymentData ? '$' : '')
            .setWidth('30px')
            .setVisible(false);

        const fileCol = new UniTableColumn(
            'ID', PAPERCLIP, UniTableColumnType.Text, false
        )
            .setFilterOperator('contains')
            .setTemplate(line => line.FileIDs && line.FileIDs.length > 0 ? PAPERCLIP : '')
            .setWidth('30px')
            .setFilterable(false)
            .setSkipOnEnterKeyNavigation(true);

        const createdAtCol = new UniTableColumn('CreatedAt', 'Reg dato', UniTableColumnType.DateTime, false)
            .setTemplate(line => line.JournalEntryDrafts ? line.JournalEntryDrafts[0].CreatedAt : null)
            .setWidth('100px')
            .setVisible(false);

        const createdByCol = new UniTableColumn('CreatedBy', 'Utført av', UniTableColumnType.Text, false)
            .setTemplate(line => line.JournalEntryDrafts
                ? this.users.find(f => f.globalIdentity === line.JournalEntryDrafts[0].CreatedBy).displayName
                : null
            )
            .setVisible(false);

        const costAllocationCol = new UniTableColumn('CostAllocation', 'Fordelingsnøkkel', UniTableColumnType.Lookup)
            .setTemplate((rowModel) => {
                if (rowModel.CostAllocation && rowModel.CostAllocation.Name) {
                    return rowModel.CostAllocation.ID + ' - ' + rowModel.CostAllocation.Name;
                }
                return '';
            })
            .setWidth('100px')
            .setOptions({
                itemTemplate: (item) => {
                    return (item.ID + ' - ' + item.Name);
                },
                lookupFunction: (searchValue) => {
                    return this.costAllocationService.search(searchValue);
                }
            })
            .setVisible(false);

        let defaultRowData = {
            Dimensions: {},
            DebitAccount: null,
            DebitAccountID: null,
            CreditAccount: null,
            CreditAccountID: null,
            // KE: We might want to set these as "Nytt bilag" for some entrymodes, but expected behaviour with
            //     UniTable is to copy value from the row above it you dont enter anything.
            //     Leave this for now, need to be considered

            // SameOrNew: this.journalEntryNumberAlternatives[this.journalEntryNumberAlternatives.length - 1].ID,
            // SameOrNewDetails: this.journalEntryNumberAlternatives[this.journalEntryNumberAlternatives.length - 1],
            Description: '',
            FileIDs: []
        };

        let columns: UniTableColumn[] = [];
        let contextMenuItems: IContextMenuItem[] = [];
        let tableName: string;

        if (this.mode === JournalEntryMode.Payment) {
            // Payment == "Innbetaling"
            tableName = 'accounting.journalEntry.payments';
            debitAccountCol.setSkipOnEnterKeyNavigation(true);
            debitVatTypeCol.setSkipOnEnterKeyNavigation(true);
            creditAccountCol.setSkipOnEnterKeyNavigation(true);
            creditVatTypeCol.setSkipOnEnterKeyNavigation(true);
            descriptionCol.setSkipOnEnterKeyNavigation(true);

            contextMenuItems = [
                {
                    action: (item) => this.deleteLine(item),
                    disabled: (item) => (this.disabled || item.StatusCode),
                    label: 'Slett linje'
                }
            ];


            defaultRowData.Description = 'Innbetaling';

            columns = [
                sameOrNewCol,
                invoiceNoCol,
                vatDateCol,
                financialDateCol,
                kidCol,
                debitAccountCol,
                creditAccountCol,
                currencyCodeCol,
                amountCurrencyCol,
                amountCol,
                currencyExchangeRate,
                descriptionCol,
                createdAtCol,
                createdByCol,
                manDimReportCol,
                addedPaymentCol,
                fileCol,
                journalEntryTypeCol
            ].map(col => {
                col = _.cloneDeep(col);
                if (col.field === invoiceNoCol.field ||
                    col.field === vatDateCol.field ||
                    col.field === amountCol.field ||
                    col.field === amountCurrencyCol.field) {
                    return col;
                }
                col.setEditable((row: JournalEntryData) => {
                    return !row.CustomerInvoice;
                });
                return col;
            });

        } else if (this.mode === JournalEntryMode.SupplierInvoice) {
            // SupplierInvoice == "Leverandørfaktura"
            tableName = 'accounting.journalEntry.supplierinvoice';

            if (this.defaultRowData) {
                defaultRowData = this.defaultRowData;
            }

            contextMenuItems = [
                {
                    action: (item) => this.deleteLine(item),
                    disabled: (item) => item.StatusCode,
                    label: 'Slett linje'
                },
                {
                    action: (item: JournalEntryData) => this.openAccrual(item),
                    disabled: (item) => this.disabled,
                    label: 'Periodisering'
                }
            ];

            projectCol.setVisible(false);
            departmentCol.setVisible(false);
            netAmountCol.setVisible(false);
            costAllocationCol.setVisible(false);
            debitAccountCol.setWidth('20%');
            debitAccountCol.setPlaceholder('Velg konto');

            columns = [
                debitAccountCol,
                debitVatTypeCol,
                deductionPercentCol,
                financialDateCol,
                descriptionCol,
                amountCol,
                netAmountCol,
                amountCurrencyCol,
                currencyExchangeRate,
                costAllocationCol,
                manDimReportCol,
                journalEntryTypeCol
            ];

            if (this.featurePermissionService.canShowUiFeature('ui.dimensions')) {

                columns.splice(4, 0, projectCol, departmentCol);

                if (dimensionCols.length) {
                    columns.splice(6, 0, ...dimensionCols);
                }
            }
        } else {
            // Manual == "Bilagsregistrering"
            tableName = 'accounting.journalEntry.manual';

            contextMenuItems = [
                {
                    action: (item) => this.deleteLine(item),
                    disabled: (item) => item.StatusCode,
                    label: 'Slett linje'
                },
                {
                    action: (item: JournalEntryData) => this.openAccrual(item),
                    disabled: (item) => this.disabled,
                    label: 'Periodisering'
                },
                {
                    action: (item) => this.addPayment(item),
                    disabled: (item) => !!item.StatusCode && !!item.JournalEntryPaymentData,
                    label: 'Registrer utbetaling'
                },
                {
                    action: (item: JournalEntryData) => this.showAgioDialog(item),
                    disabled: (item: JournalEntryData) => !item.CustomerInvoiceID,
                    label: 'Agio'
                }
            ];


            columns = [
                sameOrNewCol,
                vatDateCol,
                financialDateCol,
                kidCol,
                invoiceNoTextCol,
                dueDateCol,
                debitAccountCol,
                debitVatTypeCol,
                creditAccountCol,
                creditVatTypeCol,
                deductionPercentCol,
                currencyCodeCol,
                amountCurrencyCol,
                amountCol,
                netAmountCol,
                currencyExchangeRate,
                descriptionCol,
                createdAtCol,
                createdByCol,
                costAllocationCol,
                addedPaymentCol,
                fileCol,
                manDimReportCol,
                journalEntryTypeCol
            ];

            if (this.featurePermissionService.canShowUiFeature('ui.dimensions')) {

                columns.splice(15, 0, projectCol, departmentCol);

                if (dimensionCols.length) {
                    dimensionCols.forEach((col, index) => {
                        columns.splice(17 + index, 0, col);
                    });
                }
            }
        }

        if (this.defaultVisibleColumns.length > 0) {
            columns.forEach(col => {
                if (this.defaultVisibleColumns.find(x => x === col.field)) {
                    col.visible = true;
                } else {
                    col.visible = false;
                }
            });
        }

        this.journalEntryTableConfig = new UniTableConfig(tableName, true, false, 100)
            .setDefaultOrderBy('SameOrNewDetails', 0)
            .setColumns(columns)
            .setAutoAddNewRow(!this.disabled)
            .setMultiRowSelect(false)
            .setIsRowReadOnly((rowModel) => {
                return rowModel.StatusCode ? true : false;
            })
            .setContextMenu(contextMenuItems)
            .setDefaultRowData(defaultRowData)
            .setColumnMenuVisible(true)
            .setAutoScrollIfNewCellCloseToBottom(true)
            .setChangeCallback((event) => {
                const rowModel = <JournalEntryData> event.rowModel;

                // get row from table - it may have been updated after the editor got it
                // because some of the events sometimes are async. Therefore, get the row
                // from the table, and reapply the changes made by this event
                let row = this.table.getRow(rowModel['_originalIndex']);

                // keep the originalFieldValue, this is sometimes needed when comparing data
                const originalFieldValue = row[event.field];

                row[event.field] = rowModel[event.field];
                // for some reason unitable returns rows as empty, but it is not,
                // so just set it to false
                row['_isEmpty'] = false;

                if (this.journalEntryID && !row.JournalEntryID) {
                    row.JournalEntryID = this.journalEntryID;
                }

                if (event.field === 'SameOrNewDetails' || !row.JournalEntryNo) {
                    const originalJournalEntryNo = row.JournalEntryNo;

                    this.setJournalEntryNumberProperties(row);

                    // Set FileIDs based on journalentryno - if it is the same as an existing, use that,
                    // if it has files but the journalentryno changed, clear the FileIDs for this journalentry
                    if (originalJournalEntryNo
                        && originalJournalEntryNo !== row.JournalEntryNo
                        && row.FileIDs
                        && row.FileIDs.length > 0
                    ) {
                        // JournalEntryNo has changed and was previously set to something - clear FileIDs
                        row.FileIDs = null;
                    }

                    // if FileIDs is null, look if any other journalentrydata with the same number
                    // has any files attached and if so, attach those files to the journalentry
                    if (!originalJournalEntryNo || !row.FileIDs || row.FileIDs.length === 0) {
                        const data = this.table.getTableData();
                        let dataFound: boolean = false;
                        for (let i = 0; i < data.length && !dataFound; i++) {
                            if (row.JournalEntryNo === data[i].JournalEntryNo) {
                                if (!row.FileIDs || row.FileIDs.length === 0) {
                                    row.FileIDs = data[i].FileIDs;
                                } else if (data[i].FileIDs) {
                                    row.FileIDs =  data[i].FileIDs.concat(row.FileIDs);
                                }

                                dataFound = true;
                            }
                        }
                    }
                }

                let rowOrPromise: Promise<any> | any;
                if (event.field === 'AmountCurrency') {
                    row.AmountCurrency = UniMath.round(row.AmountCurrency, 2);
                    row = this.calculateNetAmountAndNetAmountCurrency(row);
                    row = this.calculateAmount(row);
                } else if (event.field === 'CurrencyCode') {
                    if (this.mode === JournalEntryMode.Manual && row.CurrencyCode) {
                        rowOrPromise = this.getExternalCurrencyExchangeRate(row)
                            .then(r => this.calculateAmount(r))
                            .then(r => this.calculateNetAmountAndNetAmountCurrency(r));
                    } else {
                        row = this.calculateAmount(row);
                        row = this.calculateNetAmountAndNetAmountCurrency(row);
                    }
                } else if (event.field === 'NetAmountCurrency') {
                    row.NetAmountCurrency = UniMath.round(row.NetAmountCurrency, 2);
                    row = this.calculateNetAmount(row);
                    row = this.calculateGrossAmount(row);
                    row = this.calculateAmount(row);
                } else if (event.field === 'CurrencyExchangeRate') {
                    row = this.calculateNetAmount(row);
                    row = this.calculateAmount(row);
                } else if (event.field === 'Amount') {
                    row = this.calculateCurrencyExchangeRate(row);
                } else if (event.field === 'FinancialDate') {
                    if (this.currentSavedFinancialDate) {
                        if (moment(this.currentSavedFinancialDate).year() !== moment(event.rowModel.FinancialDate).year()) {
                            row.FinancialDate = this.currentSavedFinancialDate;
                            this.toastService.addToast('Ugyldig endring.', ToastType.warn, 10,
                            'Du kan ikke korrigere bilaget til et annet regnskapsår. Hvis dette bilaget skal bokføres i annet regnskapsår må du kreditere bilaget og føre det på nytt i korrekt regnskapsår.');
                        }
                    }
                } else if (event.field === 'VatDate') {

                    if (this.currentSavedVatDate && moment(this.currentSavedVatDate).year() !== moment(event.rowModel.VatDate).year()) {
                        row.VatDate = this.currentSavedVatDate;
                        this.toastService.addToast('Ugyldig endring.', ToastType.warn, 10,
                        'Du kan ikke korrigere bilaget til et annet regnskapsår. Hvis dette bilaget skal bokføres i annet regnskapsår må du kreditere bilaget og føre det på nytt i korrekt regnskapsår.');
                    }

                    // set FinancialDate based on VatDate if FinancialDate has not been set, or
                    // if the FinancialDate was the same as the previous value for VatDate
                    if (!row.FinancialDate && row.VatDate ||
                        (originalFieldValue && row.FinancialDate
                            && row.FinancialDate.toString() === originalFieldValue.toString())
                    ) {
                        row.FinancialDate = row.VatDate;
                    }

                    if (row.DebitVatType) {
                        this.journalEntryService.setCorrectVatPercent(row.DebitVatType, row);
                    }
                    if (row.CreditVatType) {
                        this.journalEntryService.setCorrectVatPercent(row.CreditVatType, row);
                    }

                    if (this.mode === JournalEntryMode.Manual && row.CurrencyCode) {
                        rowOrPromise = this.getExternalCurrencyExchangeRate(row)
                            .then(r => this.setVatDeductionPercent(r))
                            .then(r => this.calculateNetAmountAndNetAmountCurrency(r))
                            .then(r => this.calculateAmount(r));
                    } else {
                        row = this.setVatDeductionPercent(row);
                        row = this.calculateNetAmountAndNetAmountCurrency(row);
                        row = this.calculateAmount(row);
                    }

                } else if (event.field === 'DebitAccount') {
                    row = this.setDebitAccountProperties(row);
                    row = this.setVatDeductionPercent(row);
                    row = this.setAmount(row);
                    row = this.calculateNetAmountAndNetAmountCurrency(row);
                    row = this.clearPostPostMarking(row);
                } else if (event.field === 'CreditAccount') {
                    row = this.setCreditAccountProperties(row);
                    row = this.setVatDeductionPercent(row);
                    row = this.calculateNetAmountAndNetAmountCurrency(row);
                    row = this.clearPostPostMarking(row);
                } else if (event.field === 'DebitVatType') {
                    row = this.setDebitVatTypeProperties(row);
                    row = this.calculateNetAmountAndNetAmountCurrency(row);
                } else if (event.field === 'CreditVatType') {
                    row = this.setCreditVatTypeProperties(row);
                    row = this.calculateNetAmountAndNetAmountCurrency(row);
                } else if (event.field === 'VatDeductionPercent') {
                    row = this.setVatDeductionProperties(row);
                    row = this.calculateNetAmountAndNetAmountCurrency(row);
                } else if (event.field === 'Dimensions.Department') {
                    row = this.setDepartmentProperties(row);
                } else if (event.field === 'Dimensions.Project') {
                    row = this.setProjectProperties(row);
                } else if (event.field.indexOf('Dimensions.Dimension') !== -1) {
                    row = this.setDimensionProperties(row, event.field);
                } else if (event.field === 'Description') {
                    row = this.setDescriptionProperties(row);
                } else if (event.field === 'CustomerInvoice') {
                    row = this.setCustomerInvoiceProperties(row);
                    if (row.CurrencyID !== this.companySettings.BaseCurrencyCodeID) {
                        rowOrPromise = this.showAgioDialog(row);
                    }
                } else if (event.field === 'InvoiceNumber') {
                    // this function runs some async lookups and updates the data directly
                    // if it needs to. It could use the promisestuff, but it doesnt work so well
                    // when it changes the accountnumbers (the editor is opened, but focus is
                    // lost, so it is really annoying in most cases)
                    this.setInvoiceNumberProperties(row);
                }

                // Return the updated row to the table
                return Promise.resolve(rowOrPromise || row)
                    .then(row => {
                        if (!row.CurrencyID) {
                            row.CurrencyCode = this.companySettings.BaseCurrencyCode;
                            row.CurrencyID = this.companySettings.BaseCurrencyCode.ID;
                            row.CurrencyExchangeRate = 1;
                        }

                        if (row.JournalEntryDataAccrual
                            && row.JournalEntryDataAccrual.AccrualAmount !== row.NetAmountCurrency
                        ) {
                            row.JournalEntryDataAccrual.AccrualAmount = row.NetAmountCurrency;
                        }

                        return row;
                    });
            });

        setTimeout(() => {
            this.setupSameNewAlternatives();

            if (this.table && this.mode !== 2) {
                this.table.focusRow(0);
            }
        });

    }

    public onCellClick(event: ICellClickEvent) {
        if (event.column.field === 'ID') {
            this.toggleImageVisibility(event.row);
        }
    }


    public showAgioDialog(journalEntryRow: JournalEntryData): Promise<JournalEntryData> {

        const postPostJournalEntryLine = journalEntryRow.PostPostJournalEntryLine;
        const sign = postPostJournalEntryLine.CustomerInvoiceID > 0 ? 1 : -1; // we need to invert but not use abs!
        const customerInvoice = journalEntryRow.CustomerInvoice;

        if (sign === 1) {

            return new Promise(resolve => {
                const paymentData: Partial<InvoicePaymentData> = {
                    Amount: UniMath.round(postPostJournalEntryLine.RestAmount * sign, 2),
                    AmountCurrency: UniMath.round(postPostJournalEntryLine.RestAmountCurrency * sign, 2),
                    BankChargeAmount: 0,
                    CurrencyCodeID: postPostJournalEntryLine.CurrencyCodeID,
                    CurrencyExchangeRate: 0,
                    PaymentDate: journalEntryRow.FinancialDate || new LocalDate(),
                    AgioAccountID: 0,
                    BankChargeAccountID: 0,
                    AgioAmount: 0
                };

                const title = `Faktura nr: ${postPostJournalEntryLine.JournalEntryNumber},`
                    + ` ${postPostJournalEntryLine?.RestAmount} ${this.companySettings.BaseCurrencyCode.Code}`;

                const paymentModal = this.modalService.open(UniRegisterPaymentModal, {
                    header: title,
                    data: paymentData,
                    modalConfig: {
                        entityName: CustomerInvoice.EntityType,
                        customerID: customerInvoice?.CustomerID,
                        currencyCode: postPostJournalEntryLine?.CurrencyCode.Code,
                        currencyExchangeRate: postPostJournalEntryLine?.CurrencyExchangeRate,
                        hideBankCharges: false // temp fix until payInvoice endpoint support bankcharges
                    }
                });

                paymentModal.onClose.subscribe((payment) => {
                    if (payment) {

                        this.customerInvoiceService.ActionWithBody(postPostJournalEntryLine.CustomerInvoiceID, payment, 'payInvoice').subscribe(
                            res => {
                                this.toastService.addToast(
                                    'Faktura er betalt. Betalingsnummer: ' + res.JournalEntryNumber,
                                    ToastType.good,
                                    5
                        );
                        this.table.removeRow(this.currentRowIndex);
                        setTimeout(() => {
                        const tableData = this.table.getTableData();
                        this.dataChanged.emit(tableData);
                        });
                    },
                            err => {
                                this.errorService.handle(err);
                            }
                        );
                    }
                });
            });

        } else {

            return new Promise(resolve => {
                const paymentData: Partial<InvoicePaymentData> = {
                    Amount: UniMath.round(postPostJournalEntryLine.RestAmount * sign, 2),
                    AmountCurrency: UniMath.round(postPostJournalEntryLine.RestAmountCurrency * sign, 2),
                    BankChargeAmount: 0,
                    CurrencyCodeID: postPostJournalEntryLine.CurrencyCodeID,
                    CurrencyExchangeRate: 0,
                    PaymentDate: journalEntryRow.FinancialDate || new LocalDate(),
                    AgioAccountID: 0,
                    BankChargeAccountID: 0,
                    AgioAmount: 0
                };

                this.modalService.open(UniRegisterPaymentModal, {
                    header: 'Registrer betaling',
                    message: 'Regningen vil bli registrert som betalt i systemet. Husk å betale regningen i nettbanken dersom dette ikke allerede er gjort.',
                    data: paymentData,
                    modalConfig: {
                        entityName: 'SupplierInvoice',
                        currencyCode: postPostJournalEntryLine?.CurrencyCode.Code,
                        currencyExchangeRate: postPostJournalEntryLine?.CurrencyExchangeRate,
                        entityID: journalEntryRow.SupplierInvoiceID
                    },
                    buttonLabels: {
                        accept: 'Registrer betaling'
                    }
                }).onClose.subscribe((payment) => {
                    if (payment) {
                        this.supplierInvoiceService.payinvoice(postPostJournalEntryLine.SupplierInvoiceID, payment)
                            .subscribe(() => {
                            this.toastService.addToast(
                                'Faktura er betalt',
                                ToastType.good,
                                5
                                );
                                this.table.removeRow(this.currentRowIndex);
                                setTimeout(() => {
                                const tableData = this.table.getTableData();
                                this.dataChanged.emit(tableData);
                                });
                            }), err => {
                            this.errorService.handle(err);
                        }
                    }

                });
            });
        }
    }

    private createOppositeRow(
        journalEntryData: JournalEntryData, invoicePaymentData: InvoicePaymentData
    ): JournalEntryData {
        const oppositeRow = new JournalEntryData();
        const invoice = journalEntryData.CustomerInvoice;
        const bankChargesAmount = invoicePaymentData.BankChargeAccountID > 0 && invoicePaymentData.BankChargeAmount !== 0 ?
            invoicePaymentData.BankChargeAmount : 0;

        oppositeRow.SameOrNewDetails = journalEntryData.SameOrNewDetails;
        oppositeRow.CustomerInvoice = invoice;
        oppositeRow.SameOrNew = journalEntryData.SameOrNew;
        oppositeRow.JournalEntryNo = journalEntryData.JournalEntryNo;
        oppositeRow.InvoiceNumber = journalEntryData.InvoiceNumber;
        oppositeRow.CustomerInvoice = journalEntryData.CustomerInvoice;
        oppositeRow.CustomerInvoiceID = journalEntryData.CustomerInvoiceID;
        oppositeRow.VatDate = journalEntryData.VatDate;
        oppositeRow.FinancialDate = journalEntryData.FinancialDate;
        oppositeRow.Dimensions = journalEntryData.Dimensions;
        oppositeRow.Description = journalEntryData.Description;

        oppositeRow.Amount = invoicePaymentData.Amount + bankChargesAmount;
        oppositeRow.AmountCurrency = invoicePaymentData.AmountCurrency;
        oppositeRow.NetAmount = oppositeRow.Amount;
        oppositeRow.NetAmountCurrency = oppositeRow.AmountCurrency;
        oppositeRow.VatDeductionPercent = journalEntryData.VatDeductionPercent;
        oppositeRow.CurrencyCode = journalEntryData.CurrencyCode;
        oppositeRow.CurrencyID = journalEntryData.CurrencyID;
        oppositeRow.CurrencyExchangeRate = invoicePaymentData.CurrencyExchangeRate;
        oppositeRow.DebitAccountID = journalEntryData.DebitAccountID;
        oppositeRow.DebitAccount = journalEntryData.DebitAccount;

        return oppositeRow;
    }

    private createAgioRow(
        journalEntryData: JournalEntryData, invoicePaymentData: InvoicePaymentData
    ): Promise<JournalEntryData> {
        const agioRow = new JournalEntryData();
        agioRow.SameOrNewDetails = journalEntryData.SameOrNewDetails;
        agioRow.CustomerInvoice = journalEntryData.CustomerInvoice;
        agioRow.SameOrNew = journalEntryData.SameOrNew;
        agioRow.JournalEntryNo = journalEntryData.JournalEntryNo;
        agioRow.VatDate = journalEntryData.VatDate;
        agioRow.FinancialDate = journalEntryData.FinancialDate;
        agioRow.Dimensions = journalEntryData.Dimensions;
        agioRow.Description = journalEntryData.Description;
        agioRow.Amount = Math.abs(invoicePaymentData.AgioAmount);
        agioRow.AmountCurrency = Math.abs(invoicePaymentData.AgioAmount);
        agioRow.NetAmount = Math.abs(invoicePaymentData.AgioAmount);
        agioRow.NetAmountCurrency = Math.abs(invoicePaymentData.AgioAmount);
        agioRow.VatDeductionPercent = journalEntryData.VatDeductionPercent;
        agioRow.CurrencyCode = this.companySettings.BaseCurrencyCode;
        agioRow.CurrencyID = this.companySettings.BaseCurrencyCode.ID;
        agioRow.CurrencyExchangeRate = 1;

        return new Promise((resolve) => {
            this.accountService.Get(invoicePaymentData.AgioAccountID)
                .subscribe(
                    agioAccount => {
                        if (invoicePaymentData.AgioAmount < 0) {
                            agioRow.CreditAccountID = agioAccount.ID;
                            agioRow.CreditAccount = agioAccount;
                        } else {
                            agioRow.DebitAccountID = agioAccount.ID;
                            agioRow.DebitAccount = agioAccount;
                        }
                        resolve(agioRow);
                    },
                    err => this.errorService.handle(err)
                );
        });
    }


    private createBankChargesRow(
        journalEntryData: JournalEntryData, invoicePaymentData: InvoicePaymentData
    ): Promise<JournalEntryData> {
        const bankChargesRow = new JournalEntryData();
        const isCredit = journalEntryData.DebitAccountID > 0;

        bankChargesRow.SameOrNewDetails = journalEntryData.SameOrNewDetails;
        bankChargesRow.CustomerInvoice = journalEntryData.CustomerInvoice;
        bankChargesRow.SameOrNew = journalEntryData.SameOrNew;
        bankChargesRow.JournalEntryNo = journalEntryData.JournalEntryNo;
        bankChargesRow.VatDate = journalEntryData.VatDate;
        bankChargesRow.FinancialDate = journalEntryData.FinancialDate;
        bankChargesRow.Dimensions = journalEntryData.Dimensions;
        bankChargesRow.Description = journalEntryData.Description;
        bankChargesRow.Amount = Math.abs(invoicePaymentData.BankChargeAmount);
        bankChargesRow.AmountCurrency = Math.abs(invoicePaymentData.BankChargeAmount);
        bankChargesRow.NetAmount = Math.abs(invoicePaymentData.BankChargeAmount);
        bankChargesRow.NetAmountCurrency = Math.abs(invoicePaymentData.BankChargeAmount);
        bankChargesRow.NetAmountCurrency = Math.abs(invoicePaymentData.BankChargeAmount);
        bankChargesRow.NetAmountCurrency = Math.abs(invoicePaymentData.BankChargeAmount);
        bankChargesRow.VatDeductionPercent = journalEntryData.VatDeductionPercent;
        bankChargesRow.CurrencyCode = this.companySettings.BaseCurrencyCode;
        bankChargesRow.CurrencyID = this.companySettings.BaseCurrencyCode.ID;
        bankChargesRow.CurrencyExchangeRate = 1;

        return new Promise((resolve) => {
            this.accountService.Get(invoicePaymentData.BankChargeAccountID)
                .subscribe(
                    bankChargeAccount => {
                        if (isCredit) {
                            bankChargesRow.CreditAccountID = bankChargeAccount.ID;
                            bankChargesRow.CreditAccount = bankChargeAccount;
                            bankChargesRow.DebitAccountID = this.defaultAccountPayments.ID;
                            bankChargesRow.DebitAccount = this.defaultAccountPayments;
                        } else {
                            bankChargesRow.DebitAccountID = bankChargeAccount.ID;
                            bankChargesRow.DebitAccount = bankChargeAccount;
                            bankChargesRow.CreditAccountID = this.defaultAccountPayments.ID;
                            bankChargesRow.CreditAccount = this.defaultAccountPayments;
                        }
                        resolve(bankChargesRow);
                    },
                    err => this.errorService.handle(err)
                );
        });
    }

    private accountSearch(searchValue: string): Observable<any> {

        let filter = '';
        if (searchValue === '') {
            filter = `Visible eq 'true' and ( isnull(AccountID,0) eq 0 ) ` +
                `or ( ( isnull(AccountID,0) eq 0 ) ` +
                `and ((Customer.Statuscode ne ${StatusCode.InActive} and Customer.Statuscode ne ${StatusCode.Deleted} ) ` +
                `or ( Supplier.Statuscode ne ${StatusCode.InActive} and Supplier.Statuscode ne ${StatusCode.Error} and Supplier.Statuscode ne ${StatusCode.Deleted}) ))`;
        } else {
            filter = `( contains(keywords,'${searchValue}') ) or `;
            if (isNaN(parseInt(searchValue, 10))) {
                filter += `Visible eq 'true' and (contains(AccountName\,'${searchValue}') ` +
                `and isnull(account.customerid,0) eq 0 and isnull(account.supplierid,0) eq 0) ` +
                `or (contains(AccountName\,'${searchValue}') ` +
                `and ((Customer.Statuscode ne ${StatusCode.InActive} and Customer.Statuscode ne ${StatusCode.Deleted}) ` +
                `or (Supplier.Statuscode ne ${StatusCode.InActive} and Supplier.Statuscode ne ${StatusCode.Error} and Supplier.Statuscode ne ${StatusCode.Deleted}))) ` +
                `or (Account.AccountName eq '${searchValue}' ` +
                `and (Customer.Statuscode ne ${StatusCode.Deleted} or Supplier.Statuscode ne ${StatusCode.Deleted}))`;
            } else {
                filter += `Visible eq 'true' and ((startswith(AccountNumber\,'${parseInt(searchValue, 10)}') ` +
                `or contains(AccountName\,'${searchValue}')  ) ` +
                `and ( isnull(account.customerid,0) eq 0 and isnull(account.supplierid,0) eq 0 )) ` +
                `or ((startswith(AccountNumber\,'${parseInt(searchValue, 10)}') or contains(AccountName\,'${searchValue}') ) ` +
                `and ((Customer.Statuscode ne ${StatusCode.InActive} and Customer.Statuscode ne ${StatusCode.Deleted}) ` +
                `or (Supplier.Statuscode ne ${StatusCode.InActive} and Supplier.Statuscode ne ${StatusCode.Error} and Supplier.Statuscode ne ${StatusCode.Deleted}))) ` +
                `or (Account.AccountNumber eq '${parseInt(searchValue, 10)}' ` +
                `and (Customer.Statuscode ne ${StatusCode.Deleted} or Supplier.Statuscode ne ${StatusCode.Deleted}))`;
            }
        }

        const accs = this.accountService.searchAccounts(filter, searchValue !== '' ? 100 : 500);
        return accs;
    }

    private projectSearch(searchValue): Observable<any> {
        return this.statisticsService.GetAll(`model=Project&select=ProjectNumber as ProjectNumber,Name as Name,ID as ID&` +
        `filter=contains(ProjectNumber, '${searchValue}') or contains(Name, '${searchValue}')`).map(x => x.Data ? x.Data : []);
    }

    private departmentSearch(searchValue): Observable<any> {
        return this.statisticsService.GetAll(`model=Department&select=DepartmentNumber as DepartmentNumber,Name as Name,ID as ID&` +
        `filter=contains(DepartmentNumber, '${searchValue}') or contains(Name, '${searchValue}')`).map(x => x.Data ? x.Data : []);
    }

    private deleteLine(line) {
        this.modalService.open(UniConfirmModalV2, {
            header: 'Bekreft sletting',
            message: 'Er du sikker på at du vil slette linjen?',
            buttonLabels: {
                accept: 'Slett',
                cancel: 'Avbryt'
            }
        }).onClose.subscribe(response => {
            if (response === ConfirmActions.ACCEPT) {
                this.table.removeRow(line._originalIndex);
                setTimeout(() => {
                    const tableData = this.table.getTableData();
                    this.dataChanged.emit(tableData);
                });
            }
        });
    }


    private openNewAccountModal(item: any, searchCritera: string): Promise<Account> {
        return new Promise((resolve, reject) => {
            this.modalService.open(NewAccountModal, { data: { searchCritera: searchCritera } })
                .onClose
                .subscribe((account) => {
                    if (account) {
                        resolve(account);
                    }
                });
        });
    }

    private openAccrual(item: JournalEntryData) {

        let title: string = 'Periodisering av bilag ' + (item.JournalEntryNo || '');
        if (item.Description) {
            title = title + ' - ' + item.Description;
        }

        const isDebitResultAccount = (item.DebitAccount && item.DebitAccount.TopLevelAccountGroup
            && item.DebitAccount.TopLevelAccountGroup.GroupNumber >= 3);
        const isCreditResultAccount = (item.CreditAccount && item.CreditAccount.TopLevelAccountGroup
            && item.CreditAccount.TopLevelAccountGroup.GroupNumber >= 3);

        if (!item.JournalEntryDataAccrual
            && ((isDebitResultAccount && isCreditResultAccount) ||
                (!isDebitResultAccount && !isCreditResultAccount))) {

            if (isDebitResultAccount) {
                this.toastService.addToast('Periodisering',
                    ToastType.bad, 5, 'Bilaget har 2 resultatkontoer');
            } else {
                this.toastService.addToast('Periodisering',
                    ToastType.bad, 5, 'Bilaget har ingen resultatkontoer' );
            }
        } else {
            if (item.JournalEntryDataAccrual) {
                const data = {
                    item: item,
                    accrualAmount: null,
                    accrualStartDate: new LocalDate(item.FinancialDate.toString()),
                    journalEntryLineDraft: null,
                    accrual: item.JournalEntryDataAccrual,
                    title: title
                };
                this.openAccrualModal(data, item);
            } else if (item.AmountCurrency && item.AmountCurrency !== 0 && item.FinancialDate) {
                const data = {
                    item: item,
                    accrualAmount: item['NetAmountCurrency'],
                    accrualStartDate: new LocalDate(item.FinancialDate.toString()),
                    journalEntryLineDraft: null,
                    accrual: null,
                    title: title
                };
                this.openAccrualModal(data, item);
            } else {
                this.toastService.addToast('Periodisering', ToastType.warn, 5,
                    'Mangler nødvendig informasjon om dato og beløp for å kunne periodisere.');
            }
        }
    }

    private openAccrualModal(data: any, item) {
        // Add the accounting lock date to the data object
        if (this.companySettings.AccountingLockedDate) {
            data.AccountingLockedDate = this.companySettings.AccountingLockedDate;
        }
        data.companySettings = this.companySettings;
        this.modalService.open(AccrualModal, {data: data}).onClose.subscribe((res: any) => {
            if (res && res.action === 'ok') {
                this.onModalChanged(item, res.model);
            } else if (res && res.action === 'remove') {
                this.onModalDeleted(item);
            }
        });
    }

    public onModalChanged(item, modalval) {
        if (modalval && !modalval.BalanceAccountID) {
            modalval.BalanceAccountID = 0;
        }
        if (modalval && !modalval.ResultAccountID) {
            modalval.ResultAccountID = 0;
        }
        item.JournalEntryDataAccrual = modalval;
        // if the item is already booked, just add the payment through the API now
        /* if (item.StatusCode) {
            this.journalEntryService.LEGGTILBETALING()
            DETTE GJØRES MÅ GJØRES I NESTE SPRINT,
            TAS SAMTIDIG SOM FUNKSJON FOR Å REGISTRERE MER PÅ ET EKSISTERENDE BILAG
            https://github.com/unimicro/AppFrontend/issues/2432
        }
        */
        this.table.updateRow(item['_originalIndex'], item);
        setTimeout(() => {
            const tableData = this.table.getTableData();
            this.dataChanged.emit(tableData);
        });
    }

    public onModalDeleted(item) {
        item.JournalEntryDataAccrual = null;
        this.table.updateRow(item['_originalIndex'], item);
        setTimeout(() => {
            const tableData = this.table.getTableData();
            this.dataChanged.emit(tableData);
        });
    }

    private addPayment(item: JournalEntryData) {
        let payment: Payment = null;
        if (item.JournalEntryPaymentData && item.JournalEntryPaymentData.PaymentData) {
            payment = item.JournalEntryPaymentData.PaymentData;
            this.modalService.open(AddPaymentModal, { data: { model: payment},
                header: 'Endre betaling',
                buttonLabels: {accept: 'Oppdater betaling'}
                }).onClose.subscribe((res: any) => {
                if (payment) {
                    item.JournalEntryPaymentData.PaymentData = res;
                    this.table.updateRow(item['_originalIndex'], item);
                }
            });

        } else {
            // generate suggestion for payment based on accounts used in item
            payment = new Payment();
            payment.AmountCurrency = item.AmountCurrency;

            new Promise((resolve) => {
                // try to set businessrelation based on selected accounts
                if ((item.DebitAccount && item.DebitAccount.CustomerID)
                    || (item.CreditAccount && item.CreditAccount.CustomerID)) {

                    const customerID = item.DebitAccount && item.DebitAccount.CustomerID
                                        ? item.DebitAccount.CustomerID
                                        : item.CreditAccount.CustomerID;

                    // get businessrelation and default account based on customerid

                   this.customerService.Get(customerID).subscribe(
                        custData => {
                            if (!custData.Info.DefaultBankAccountID) {
                                const br = new BusinessRelation();
                                br.ID = custData.Info.ID;
                                br.Name = custData.Info.Name;
                                payment.BusinessRelation = br;
                                payment.BusinessRelationID = custData.Info.ID;
                                resolve();
                            } else {
                                this.statisticsService.GetAllUnwrapped(`model=Customer&expand=Info.DefaultBankAccount&filter=Customer.ID eq
                                ${customerID}&select=DefaultBankAccount.ID as DefaultBankAccountID,
                                DefaultBankAccount.AccountNumber as DefaultBankAccountAccountNumber,Info.Name
                                as BusinessRelationName,Info.ID as BusinessRelationID`)
                                .subscribe(brdata => {
                                    if (brdata && brdata.length > 0) {
                                        const br = brdata[0];
                                        payment.BusinessRelationID = br.BusinessRelationID;
                                        payment.BusinessRelation = this.getBusinessRelationDataFromStatisticsSearch(br);
                                        resolve();
                                    }
                                });
                            }
                    });
                } else if ((item.DebitAccount && item.DebitAccount.SupplierID)
                    || (item.CreditAccount && item.CreditAccount.SupplierID)) {
                    const supplierID = item.DebitAccount && item.DebitAccount.SupplierID
                                        ? item.DebitAccount.SupplierID
                                        : item.CreditAccount.SupplierID;

                    // get businessrelation and default account based on supplierid
                    this.statisticsService.GetAll(
                        `model=Supplier&expand=Info.DefaultBankAccount&filter=Supplier.ID eq ${supplierID}`
                        + `&select=DefaultBankAccount.ID as DefaultBankAccountID,`
                        + `DefaultBankAccount.AccountNumber as DefaultBankAccountAccountNumber,`
                        + `Info.Name as BusinessRelationName,Info.ID as BusinessRelationID`
                    )
                        .map(data => data.Data ? data.Data : [])
                        .subscribe(brdata => {
                            if (brdata && brdata.length > 0) {
                                const br = brdata[0];
                                payment.BusinessRelationID = br.BusinessRelationID;
                                payment.BusinessRelation = this.getBusinessRelationDataFromStatisticsSearch(br);
                                resolve();
                            }

                        },
                        err => this.errorService.handle(err)
                    );
                } else {
                    // no businessrelation could be set based on account - continue to the other fields
                    resolve();
                }
            }).then(() => {
                // set default account if we found a businessrelation based on the accounts specified
                if (payment.BusinessRelation) {
                    payment.ToBankAccount = payment.BusinessRelation.DefaultBankAccount;
                    payment.ToBankAccountID = payment.BusinessRelation.DefaultBankAccountID;
                }

                // set default fromaccount based on companysettings
                if (this.companySettings) {
                    payment.FromBankAccount = this.companySettings.CompanyBankAccount;
                    payment.FromBankAccountID = this.companySettings.CompanyBankAccountID;
                }

                // if no customerCreditDays are set it adds 14 days to PaymentDate and DueDate
                let customerCreditDays = this.companySettings.CustomerCreditDays
                    ? this.companySettings.CustomerCreditDays
                    : 14;

                if (item.CreditAccount && item.CreditAccount.SupplierID) {
                    // some instances SupplierID was 0 and brought an error
                    this.supplierService.Get(item.CreditAccount.SupplierID).subscribe(
                        res => {
                        customerCreditDays =  res.CreditDays ? res.CreditDays : customerCreditDays;
                        },
                        err => this.errorService.handle(err)
                    );
                }

                // if journalentry has VatDate it sends it to the modal + supplier/companysettings creditdays
                payment.PaymentDate = item.VatDate ? this.addDaysToDates(item.VatDate, customerCreditDays) : null;
                payment.DueDate =  item.VatDate ? this.addDaysToDates(item.VatDate, customerCreditDays) : null;
                // if it has a duedate overwrite other dates
                if (item.DueDate) {
                    payment.DueDate = item.DueDate;
                    payment.PaymentDate = item.DueDate;
                }

                // passing in InvoiceNumber from journalentry if it has one
                payment.InvoiceNumber = item.InvoiceNumber ? item.InvoiceNumber : '';
                payment.AutoJournal = this.shouldAutoJournal(item);
                this.modalService.open(AddPaymentModal, {data: { model: payment }}).onClose.subscribe((res) => {
                    if (res) {
                        if (!item.JournalEntryPaymentData) {
                            item.JournalEntryPaymentData = {
                                PaymentData: res
                            };
                        } else {
                            item.JournalEntryPaymentData.PaymentData = res;
                        }

                        // if the item is already booked, just add the payment through the API
                        if (item.StatusCode) {
                            this.paymentService.ActionWithBody(null,
                                res,
                                'create-payment-with-tracelink',
                                RequestMethod.Post,
                                'journalEntryID=' + item.JournalEntryID
                            ).subscribe(paymentResponse => {
                                this.toastService.addToast('Betaling',
                                    ToastType.good, 5, 'Betaling registrert');
                                this.table.updateRow(item['_originalIndex'], item);
                            });
                        } else {
                            this.table.updateRow(item['_originalIndex'], item);
                        }
                    }
                });
            });
        }
    }

    public addDaysToDates(date: any, days: number) {
        const result = new Date(date);
        return new LocalDate(moment(result.setDate(result.getDate() + days)).toDate());
    }

    private getBusinessRelationDataFromStatisticsSearch(statisticsdata): BusinessRelation {
        const br = new BusinessRelation();
        br.ID = statisticsdata.BusinessRelationID;
        br.Name = statisticsdata.BusinessRelationName;
        br.DefaultBankAccountID = statisticsdata.DefaultBankAccountID;

        if (statisticsdata.DefaultBankAccountID) {
            br.DefaultBankAccount = new BankAccount();
            br.DefaultBankAccount.ID = statisticsdata.DefaultBankAccountID;
            br.DefaultBankAccount.AccountNumber = statisticsdata.DefaultBankAccountAccountNumber;
        }

        return br;
    }

    private shouldAutoJournal(journalEntry: JournalEntryData): boolean {
        let autojournal = false;
        if ((journalEntry.DebitAccount && journalEntry.DebitAccount.UsePostPost) ||
            (journalEntry.CreditAccount && journalEntry.CreditAccount.UsePostPost)) {
            autojournal = true;
        }
        // Stops double booking when the Camt054 file is registered and generates the exact same JournalEntry
        if (this.companySettings.BankAccounts.some(x => x.AccountID === journalEntry.CreditAccountID) &&
            journalEntry.DebitAccount.UsePostPost) {
            autojournal = false;
        }
        return autojournal;
    }

    public setupJournalEntryNumbers(doUpdateExistingLines: boolean): Promise<any> {
        if (!this.currentFinancialYear) {
            return Promise.resolve();
        }

        return new Promise((resolve, reject) => {
            const journalentrytoday: JournalEntryData = new JournalEntryData();
            journalentrytoday.FinancialDate = this.currentFinancialYear.ValidFrom;
            journalentrytoday.NumberSeriesTaskID = this.selectedNumberSeriesTaskID || null;
            journalentrytoday.NumberSeriesID = this.selectedNumberSeries ? this.selectedNumberSeries.ID : null;

            this.journalEntryService.getNextJournalEntryNumber(journalentrytoday)
                .subscribe(numberdata => {
                    this.firstAvailableJournalEntryNumber = numberdata;

                    if (doUpdateExistingLines && this.table) {
                        let tableData = this.table.getTableData();

                        if (tableData.length > 0) {
                            // Split readonly and editable rows (using the readonly check from table config (StatusCode))
                            // This is done because we don't want to update readonly rows here
                            const readonlyRows = tableData.filter(row => !!row.StatusCode);
                            const editableRows = tableData.filter(row => !row.StatusCode);

                            // Check if readonly rows contains one or more lines with the wrong numberseries.
                            // Rows where _editmode is set is journalentries that are being corrected, so they
                            // will already have a defined journalentrynumber. Dont update numbers for these
                            // even if the numberseries does not exist, because this will not have any effect
                            // when saving anyway (i.e. if a journalentry is corrected from 15.01.2018 to 15.01.2019
                            // the journalentrynumber will still be set to 2018-something)
                            const shouldUpdateData = editableRows.some(
                                row => (row.NumberSeriesTaskID !== this.selectedNumberSeriesTaskID ||
                                row.NumberseriesID !== this.selectedNumberSeries.ID) && !row._editmode
                            );

                            if (shouldUpdateData) {
                                const uniQueNumbers = _.uniq(editableRows.filter(x => !x._editmode).map(item => item.JournalEntryNo));
                                uniQueNumbers.forEach(uniQueNumber => {
                                    const lines = editableRows.filter(line => line.JournalEntryNo === uniQueNumber);

                                    lines.forEach(line => {
                                        line.JournalEntryNo = this.firstAvailableJournalEntryNumber;
                                        line.SameOrNew = line.JournalEntryNo;
                                        line.SameOrNewDetails = {ID: line.JournalEntryNo, Name: line.JournalEntryNo};
                                        line.NumberSeriesTaskID = this.selectedNumberSeriesTaskID;
                                        line.NumberSeriesID = this.selectedNumberSeries !== null ? this.selectedNumberSeries.ID : null;

                                    });

                                    // Update next available number
                                    const nextNumberData = this.firstAvailableJournalEntryNumber.split('-');
                                    this.firstAvailableJournalEntryNumber = nextNumberData.length > 1
                                        ? (+nextNumberData[0] + 1) + '-' + nextNumberData[1]
                                        : (+nextNumberData[0] + 1).toString();
                                });

                                // Join readonly and editable rows before updating table
                                tableData = readonlyRows.concat(editableRows);
                                this.setJournalEntryData(tableData);
                                this.dataChanged.emit(tableData);
                            }
                        }
                    }

                    this.setupSameNewAlternatives();

                    if (this.table && this.mode !== 2) {
                        this.table.focusRow(0);
                    }
                },
                err => {
                    this.errorService.handle(err);
                    reject(err);
                }
            );

            resolve();
        });
    }

    private setupSameNewAlternatives() {

        if (this.journalEntryTableConfig
            && this.journalEntryTableConfig.columns
            && this.journalEntryTableConfig.columns.length > 0
            && this.journalEntryTableConfig.columns[0].field === 'SameOrNewDetails') {

            if (this.journalEntryID && this.journalEntryLines && this.journalEntryLines.length > 0) {
                // if this is an existing journalentry, dont allow selecting "new" as an option for journalentryno
                this.journalEntryNumberAlternatives = [];
                if (this.journalEntryLines[0] && this.journalEntryLines[0].JournalEntryNo) {
                    this.journalEntryNumberAlternatives.push({
                        ID: this.journalEntryLines[0].JournalEntryNo,
                        Name: this.journalEntryLines[0].JournalEntryNo
                    });
                } else {
                    this.journalEntryNumberAlternatives = [];

                    if (this.table) {
                        const tableData = this.table.getTableData();
                        tableData.map(x => x.JournalEntryNo = this.firstAvailableJournalEntryNumber);
                        tableData.map(x => this.updateJournalEntryLine(x));
                    }

                    // new always last one
                    this.journalEntryNumberAlternatives.push(this.newAlternative);
                }

            } else if (this.firstAvailableJournalEntryNumber
                && this.firstAvailableJournalEntryNumber !== '') {

                this.journalEntryNumberAlternatives = [];

                // add list of possible numbers from start to end if we have any table data
                if (this.table) {
                    const tableData = this.table.getTableData();

                    if (tableData.length > 0) {
                        const range = this.journalEntryService.findJournalNumbersFromLines(tableData);
                        if (range) {
                            this.lastUsedJournalEntryNumber = range.lastNumber;
                            this.firstAvailableJournalEntryNumber = range.nextNumber;

                            for (let i = 0; i <= (range.last - range.first); i++) {
                                const jn = `${i + range.first}-${range.year}`;
                                this.journalEntryNumberAlternatives.push({ID: jn, Name: jn});
                            }
                        }
                    }
                }

                // new always last one
                this.journalEntryNumberAlternatives.push(this.newAlternative);
            }

            // update editor with new options
            this.journalEntryTableConfig.columns[0].options.resource = this.journalEntryNumberAlternatives;
        }
    }

    public trySaveJournalEntryDrafts(completeCallback) {
        const tableData = this.table.getTableData();

        // check if any of the data contains no account - this will cause problems when saving
        let hasInvalidData: boolean = false;
        tableData.forEach(x => {
            if ((!x.DebitAccount && !x.CreditAccount) || !x.AmountCurrency) {
                hasInvalidData = true;
            }
        });

        if (hasInvalidData) {
            const modal = this.modalService.open(UniConfirmModalV2, {
                    header: 'Ugyldige data',
                    message: 'Rader som ikke har beløp og debet og/eller kreditkonto vil ikke bli lagret',
                    buttonLabels: {
                        accept: 'Lagre kladd likevel',
                        cancel: 'Avbryt'
                    }
                });

                modal.onClose.subscribe(response => {
                    if (response === ConfirmActions.ACCEPT) {
                        this.saveJournalEntryDrafts(completeCallback);
                    } else {
                        completeCallback('');
                    }
                });
        } else {
            this.saveJournalEntryDrafts(completeCallback);
        }
    }

    public saveJournalEntryDrafts(completeCallback) {
        const tableData = this.table.getTableData();

        this.modalService.open(DraftLineDescriptionModal)
                .onClose
                .subscribe((text: string) => {
                    if (text === null) {
                        return completeCallback('');
                    }
                    this.journalEntryService.saveJournalEntryDataAsDrafts(tableData, text)
                        .subscribe(data => {
                            completeCallback('Lagret som kladd');

                            // Empty list
                            this.journalEntryLines = new Array<JournalEntryData>();
                            this.setupJournalEntryNumbers(false);
                            this.dataChanged.emit(this.journalEntryLines);
                        },
                        err => {
                            // use empty parameter so the parent knows something went wrong
                            completeCallback('');
                            this.errorService.handle(err);
                        }
                    );
                });
    }

    public postJournalEntryData(completeCallback, id?: number) {
        const tableData = this.table.getTableData();
        tableData.forEach(data => {
            data.NumberSeriesID = this.selectedNumberSeries ? this.selectedNumberSeries.ID : null;
            data.NumberSeriesTaskID = this.selectedNumberSeriesTaskID ? this.selectedNumberSeriesTaskID : null;
            data.JournalEntryTypeID = data.JournalEntryType ? data.JournalEntryType.ID : null;
            if (!data.VatDeductionPercent) {
                data.VatDeductionPercent = 100;
            }
        });
        this.journalEntryService.postJournalEntryData(tableData)
            .subscribe(data => {
                const firstJournalEntry = data[0];
                const lastJournalEntry = data[data.length - 1];

                // Validate if journalEntry number has changed
                const numbers = this.journalEntryService.findJournalNumbersFromLines(tableData);

                if (!numbers || firstJournalEntry.JournalEntryNumber !== numbers.firstNumber ||
                    lastJournalEntry.JournalEntryNumber !== numbers.lastNumber) {
                    this.toastService.addToast(
                        'Lagring var vellykket, men merk at tildelt bilagsnummer er '
                            + firstJournalEntry.JournalEntryNumber + ' - '
                            + lastJournalEntry.JournalEntryNumber,
                        ToastType.warn
                    );

                } else {
                    this.toastService.addToast(
                        'Lagring var vellykket. Bilagsnr: ' + firstJournalEntry.JournalEntryNumber
                            + (firstJournalEntry.JournalEntryNumber !== lastJournalEntry.JournalEntryNumber
                                ? ' - ' + lastJournalEntry.JournalEntryNumber
                                : ''
                            ),
                        ToastType.good, 10);
                }

                completeCallback('Lagret og bokført');

                // Empty list
                this.journalEntryLines = new Array<JournalEntryData>();

                this.setupJournalEntryNumbers(false);

                this.dataChanged.emit(this.journalEntryLines);

                this.lastUsedJournalEntryNumber = '';
            },
            err => {
                // call with empty string to avoid clearing the grid
                // if an error occurs
                completeCallback('');
                this.errorService.handle(err);
            }
        );

    }

    public creditAndPostCorrectedJournalEntryData(completeCallback, journalEntryID?: number) {
        const tableData = this.table.getTableData();

        tableData.forEach(data => {
            data.NumberSeriesID = this.selectedNumberSeries ? this.selectedNumberSeries.ID : null;
        });

        this.journalEntryService.creditAndPostCorrectedJournalEntryData(tableData, journalEntryID)
            .subscribe(data => {
                this.toastService.addToast(
                    'Lagring var vellykket.',
                    ToastType.good, 10);

                completeCallback('Lagret og bokført');

                // Empty list
                this.journalEntryLines = new Array<JournalEntryData>();

                this.setupJournalEntryNumbers(false);

                this.dataChanged.emit(this.journalEntryLines);
            },
            err => {
                // call with empty string to avoid clearing the grid
                // if an error occurs
                completeCallback('');
                this.errorService.handle(err);
            }
        );
    }

    public removeJournalEntryData(completeCallback, isDirty) {
        if (!isDirty) {
            this.clearListInternal(completeCallback);
            return;
        }

        this.modalService.openRejectChangesModal()
            .onClose
            .subscribe(result => {
                if (result === ConfirmActions.REJECT) {
                    this.clearListInternal(completeCallback);
                } else {
                    completeCallback(null);
                }
            });
    }

    private clearListInternal(completeCallback: (msg: string) => void) {
        this.journalEntryLines = new Array<JournalEntryData>();
        this.dataChanged.emit(this.journalEntryLines);

        this.setupJournalEntryNumbers(false);

        completeCallback('Listen er tømt');
    }

    public updateJournalEntryLine(data) {
        this.table.updateRow(data._originalIndex, data);

        setTimeout(() => {
            this.journalEntryLines = this.table.getTableData();
            this.dataChanged.emit(this.journalEntryLines);
        });
    }

    private addJournalEntryLines(lines: JournalEntryData[]) {
        const newItems = this.table.getTableData();
        lines.forEach(line => {
            line.JournalEntryNo = this.lastUsedJournalEntryNumber
                ? this.lastUsedJournalEntryNumber
                : this.firstAvailableJournalEntryNumber;
            line.SameOrNew = line.JournalEntryNo;
            newItems.push(line);
        });

        // Use JSON parse/stringify because UniTable reacts to
        // data in different formats (object vs JournalEntryData objects).
        // Not sure why this happens, but _.cloneDeep, concat ect does not solve the problem.
        this.journalEntryLines = JSON.parse(JSON.stringify(newItems));

        // run this in settimeout because we need to wait for the unitable to update it's datasource before
        // setting up the updated alternatives
        setTimeout(() => {
            this.setupSameNewAlternatives();
        });

        this.dataChanged.emit(this.journalEntryLines);
    }

    /*
    KE: This requires rewriting the paymentmodal, so for now, let the user fix his own agiostuff...
    public updateMaybeAgioJournalEntryDataLine(data: JournalEntryData) {
        const isBaseCurrency = data.CurrencyID === this.companySettings.BaseCurrencyCodeID;
        if ( isBaseCurrency ) {
            data.CurrencyExchangeRate = 1;
            this.updateJournalEntryLine(data);
        } else {
            this.showAgioDialog(data)
                .then(journalEntryData => {
                    this.updateJournalEntryLine(journalEntryData);
                });
        }
    }*/

    public addMaybeAgioJournalEntryLine(data: JournalEntryData) {
        const isBaseCurrency = data.CurrencyID === this.companySettings.BaseCurrencyCodeID;
        if ( isBaseCurrency ) {
            data.CurrencyExchangeRate = 1;
            this.addJournalEntryLines([data]);
        } else {
            this.showAgioDialog(data)
                .then(journalEntryData => this.addJournalEntryLines([journalEntryData]));
        }
    }

    private mapAccountingCostSuggestionLine(line: AccountingCostSuggestion) {
        return this.journalEntryService.getAccountsFromSuggeestions(line.konto).switchMap((accounts) => {
            if (accounts.length) {
                return forkJoin(
                    this.statisticsService.GetAllUnwrapped(`model=Project&select=ID as ID,Name as Name,ProjectNumber as ProjectNumber&filter=startswith(Name\,'${line.prosj}') or startswith(ProjectNumber\,'${line.prosj}')&top=1`),
                    this.statisticsService.GetAllUnwrapped(`model=Department&select=ID as ID,Name as Name,DepartmentNumber as DepartmentNumber&filter=startswith(Name\,'${line.avd}') or startswith(DepartmentNumber\,'${line.avd}')&top=1`),
                    this.statisticsService.GetAllUnwrapped(`model=VatType&select=ID as ID&filter=startswith(Name\,'${line.mvakode}') or startswith(VatCode\,'${line.mvakode}')&top=1`)
                ).map(res => {
                    const project = line.prosj.length && res[0][0] ? res[0][0] : null;
                    const department = line.avd.length && res[1][0] ? res[1][0] : null;
                    const vattype = line.mvakode.length && res[2][0] ? res[2][0] : null;

                    let match = accounts.find(acc => acc.AccountNumber === line.konto);
                    match = match ? match : accounts[0];

                    // Create the new line
                    let newLine;
                    newLine = {
                        Dimensions: {},
                        DebitAccount: match,
                        DebitAccountID: match.ID,
                        Description: line.Description,
                        Amount: line.Amount,
                        NetAmountCurrency: line.AmountCurrency,
                        FinancialDate: line.FinancialDate
                    };

                    // Add project/department/vattype
                    if (project) {
                        newLine.Dimensions.Project = project;
                        newLine.Dimensions.ProjectID = project.ID;
                    }

                    if (department) {
                        newLine.Dimensions.Department = department;
                        newLine.Dimensions.DepartmentID = department.ID;
                    }

                    if (vattype) {
                        newLine.DebitVatType = this.vattypes.find(x => x.ID === vattype.ID);
                        newLine.DebitVatTypeID = vattype.ID;
                    } else {
                        newLine.DebitVatType = this.vattypes.find(x => x.ID === match.VatTypeID);
                        newLine.DebitVatTypeID = match.VatTypeID;
                    }

                    const calc = this.journalEntryService.calculateJournalEntryData(
                        newLine.DebitAccount,
                        newLine.DebitVatType,
                        null,
                        newLine.NetAmountCurrency,
                        newLine
                    );
                    newLine.AmountCurrency = UniMath.round(calc.amountGrossCurrency, 2);

                    return newLine;
                }).take(1);
            } else {
                return Observable.empty();
            }
        });
    }

    public addCostAllocationJournalEntryDataLines(suggestionlines: AccountingCostSuggestion[]) {
        const returnValue: any = {
            type: ToastType.good
        };

        return new Promise((resolve,reject) => {
            from(suggestionlines)
            .map(line => this.mapAccountingCostSuggestionLine(line))
            .combineAll()
            .subscribe(
                (journalentrylines) => {
                    this.addJournalEntryLines(journalentrylines);
                    returnValue.msg = 'Konteringsforslag lagt til basert på EHF linjene sin konteringsstreng.';
                    resolve(returnValue);
                },
                (err) => {
                    console.log(err);
                    resolve();
                },
                () => resolve()
            );
        });
    }

    private toggleImageVisibility(journalEntry: JournalEntryData) {
        if (this.doShowImage && this.lastImageDisplayFor === journalEntry.JournalEntryNo) {
            this.doShowImage = false;
            this.showImageChanged.emit(this.doShowImage);
        } else if (this.doShowImage) {
            this.showImageForJournalEntry.emit(journalEntry);
        } else if (!this.doShowImage) {
            this.doShowImage = true;
            this.showImageChanged.emit(this.doShowImage);
            this.showImageForJournalEntry.emit(journalEntry);
        }

        this.lastImageDisplayFor = journalEntry.JournalEntryNo;
    }

    public onRowSelected(event) {
        this.rowSelected.emit(event.rowModel);
    }

    public onCellFocus(event) {
        this.currentRowIndex = event.rowIndex;

        if (this.doShowImage) {
            const rowFileIDs = event.rowModel.FileIDs;
            const updateImage = !this.isEqualArrays(rowFileIDs, this.currentFileIDs);

            if (updateImage) {
                this.currentFileIDs = rowFileIDs || [];
                this.showImageForJournalEntry.emit(event.rowModel);
            }
        }
    }

    private isEqualArrays(arr1: any[], arr2: any[]): boolean {
        if ((arr1 && !arr2) || (!arr1 && arr2)) {
            return false;
        }

        if (arr1.length !== arr2.length) {
            return false;
        }

        for (let i = 0 ; i < arr1.length; i++ ) {
            if (arr1[i] !== arr2[i]) {
                return false;
            }
        }

        return true;
    }



    rowChanged(event?) {
        if (!event) {
            return;
        }

        if (event.newValue && event.newValue.CustomerID && event.newValue.StatusCode === StatusCode.InActive) {
            const options: IModalOptions = {message: 'Vil du aktivere kunden?'};
            this.modalService.open(UniConfirmModalV2, options).onClose.subscribe(res => {
                if (res === ConfirmActions.ACCEPT) {
                    this.customerService.activateCustomer(event.newValue.CustomerID).subscribe(
                        response => {
                            const account = tableData[0].CreditAccount || tableData[0].DebitAccount;
                            account.StatusCode = StatusCode.Active;
                            this.toastService.addToast('Kunde aktivert', ToastType.good);
                        },
                        err => this.errorService.handle(err)
                    );
                }
                return;
            });
        }


        const strF = event.field + '';

        if ( ( event.field === 'DebitAccount' || event.field === 'CreditAccount' || strF.startsWith('Dimensions.'))
        && this.numberOfAccountsWithMandatoryDimensions > 0) {

            if (!event.rowModel.MandatoryDimensionsValidation) {
                event.rowModel.MandatoryDimensionsValidation = {};
            }


            if (!event.newValue || event.newValue === null) {
                if (event.field === 'DebitAccount') {event.rowModel.MandatoryDimensionsValidation['DebitReport'] = null; }
                if (event.field === 'CreditAccount') {event.rowModel.MandatoryDimensionsValidation['CreditReport'] = null; }
                this.table.updateRow(event.rowModel['_originalIndex'], event.rowModel);
                setTimeout(() => {
                    const data = this.table.getTableData();
                    this.dataChanged.emit(data);
                }, 0);
            }

            if ( event.newValue !== null || strF.startsWith('Dimensions.')) {

                if (strF === 'DebitAccount' ||  strF.startsWith('Dimensions.')) {
                    const debitReport = this.accountMandatoryDimensionService.getReport(event.rowModel.DebitAccount, event.rowModel);
                    event.rowModel.MandatoryDimensionsValidation['DebitReport'] = debitReport;
                    this.table.updateRow(event.rowModel['_originalIndex'], event.rowModel);
                    setTimeout(() => {
                        const data = this.table.getTableData();
                        let msg = '\n';
                        if (debitReport) {
                            msg = debitReport.MissingRequiredDimensionsMessage + '\n' + debitReport.MissingOnlyWarningsDimensionsMessage;
                        }
                        if (msg !== '\n') {
                            this.toastService.addToast(msg, ToastType.warn, 10);
                        }

                        this.dataChanged.emit(data);
                    }, 0);
                }

                if (strF === 'CreditAccount' ||  strF.startsWith('Dimensions.')) {
                    const creditReport = this.accountMandatoryDimensionService.getReport(event.rowModel.CreditAccount, event.rowModel);
                    event.rowModel.MandatoryDimensionsValidation['CreditReport'] = creditReport;
                    this.table.updateRow(event.rowModel['_originalIndex'], event.rowModel);
                    setTimeout(() => {
                        const data = this.table.getTableData();
                        let msg = '\n';
                        if (creditReport) {
                            msg = creditReport.MissingRequiredDimensionsMessage + '\n' + creditReport.MissingOnlyWarningsDimensionsMessage;
                        }
                        if (msg !== '\n') {
                            this.toastService.addToast(msg, ToastType.warn, 10);
                        }
                        this.dataChanged.emit(data);
                    }, 0);
                }
            }
        }

        if (event.newValue && event.newValue.SupplierID && event.newValue.StatusCode === StatusCode.InActive) {
            const options: IModalOptions = {message: 'Vil du aktivere leverandøren?'};
            this.modalService.open(UniConfirmModalV2, options).onClose.subscribe(res => {
                if (res === ConfirmActions.ACCEPT) {
                    this.supplierService.activateSupplier(event.newValue.SupplierID).subscribe(
                        response => {
                            const account = tableData[0].CreditAccount || tableData[0].DebitAccount;
                            account.StatusCode = StatusCode.Active;
                            this.toastService.addToast('Leverandør aktivert', ToastType.good);
                        },
                        err => this.errorService.handle(err)
                    );
                }
                return;
            });
        }

        const tableData = this.table.getTableData();
        this.dataChanged.emit(tableData);

        if (event.newValue && event.field) {
            this.rowFieldChanged.emit({
                Field: event.field,
                JournalEntryData: event.rowModel
            });
        }
    }

    public getTableData() {
        if (this.table) {
            return this.table.getTableData();
        }
        return null;
    }

    public focusLastRow() {
        const rows = this.getTableData() || [];
        this.currentRowIndex = rows.length;
        this.table.focusRow(this.currentRowIndex);
    }
}
