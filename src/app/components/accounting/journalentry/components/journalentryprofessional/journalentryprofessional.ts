import {
    Component,
    ViewChild,
    OnInit,
    OnChanges,
    SimpleChanges,
    Input,
    Output,
    EventEmitter,
    ChangeDetectorRef
} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {
    UniTable,
    UniTableColumn,
    UniTableColumnType,
    UniTableConfig,
    ICellClickEvent,
    IContextMenuItem
} from '../../../../../../framework/ui/unitable/index';
import {IGroupConfig} from '../../../../../../framework/ui/unitable/controls/autocomplete';
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
    NumberSeries
} from '../../../../../unientities';
import {JournalEntryData, NumberSeriesTaskIds} from '../../../../../models/models';
import {AccrualModal} from '../../../../common/modals/accrualModal';
import {NewAccountModal} from '../../../NewAccountModal';
import {ToastService, ToastType, ToastTime} from '../../../../../../framework/uniToast/toastService';
import {AddPaymentModal} from '../../../../common/modals/addPaymentModal';
import {
    AccountService,
    JournalEntryService,
    JournalEntryLineService,
    JournalEntryLineDraftService,
    DepartmentService,
    ProjectService,
    CustomerInvoiceService,
    CompanySettingsService,
    ErrorService,
    StatisticsService,
    NumberFormat,
    PredefinedDescriptionService,
    SupplierService
} from '../../../../../services/services';
import {
    UniModalService,
    UniRegisterPaymentModal,
    UniConfirmModalV2,
    ConfirmActions
} from '../../../../../../framework/uniModal/barrel';

import * as moment from 'moment';
import {CurrencyCodeService} from '../../../../../services/common/currencyCodeService';
import {CurrencyService} from '../../../../../services/common/currencyService';
import {SelectJournalEntryLineModal} from '../selectJournalEntryLineModal';
import {UniMath} from '../../../../../../framework/core/uniMath';
const PAPERCLIP = '📎'; // It might look empty in your editor, but this is the unicode paperclip
declare const _; // lodash

export enum JournalEntryMode {
    Manual,
    Payment
}

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
    @Input() public vattypes: VatType[];
    @Input() public selectedNumberSeries: NumberSeries;

    @ViewChild(UniTable) private table: UniTable;

    private companySettings: CompanySettings;
    private columnsThatMustAlwaysShow: string[] = ['AmountCurrency'];
    private journalEntryTableConfig: UniTableConfig;
    public createdNewAccount: any;
    private selectedNumberSeriesTaskID: number;

    @Output() public dataChanged: EventEmitter<JournalEntryData[]> = new EventEmitter<JournalEntryData[]>();
    @Output() public dataLoaded: EventEmitter<JournalEntryData[]> = new EventEmitter<JournalEntryData[]>();
    @Output() public showImageChanged: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Output() public showImageForJournalEntry: EventEmitter<JournalEntryData> = new EventEmitter<JournalEntryData>();
    @Output() public rowSelected: EventEmitter<JournalEntryData> = new EventEmitter<JournalEntryData>();

    private predefinedDescriptions: Array<any>;
    private projects: Project[];
    private departments: Department[];

    private SAME_OR_NEW_NEW: string = '1';
    private newAlternative: any = {ID: this.SAME_OR_NEW_NEW, Name: 'Nytt bilag'};
    public journalEntryNumberAlternatives: Array<any> = [];

    private firstAvailableJournalEntryNumber: string = '';
    private lastUsedJournalEntryNumber: string = '';

    private lastImageDisplayFor: string = '';

    private defaultAccountPayments: Account = null;
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

    private currentRowIndex: number = 0;
    private currentFileIDs = [];

    constructor(
        private changeDetector: ChangeDetectorRef,
        private uniHttpService: UniHttp,
        private accountService: AccountService,
        private journalEntryService: JournalEntryService,
        private journalEntryLineDraftService: JournalEntryLineDraftService,
        private departmentService: DepartmentService,
        private projectService: ProjectService,
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
        private supplierService: SupplierService
    ) {}

    public ngOnInit() {
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
            });
        }

        this.journalEntryLines = data;
        setTimeout(() => {
            if (this.table) {
                this.table.blur();
                this.table.focusRow(this.currentRowIndex);
            } else {
                setTimeout(() => {
                    if (this.table) {
                        this.table.blur();
                        this.table.focusRow(this.currentRowIndex);
                    }
                }, 500);
            }

            // when the journalEntryLines changes, we need to update the sameornew alternatives,
            // i.e. the items that it is possible to select in the journalentrynumber dropdown
            this.setupSameNewAlternatives();
        });

    }

    private setupJournalEntryTable() {

        Observable.forkJoin(
            this.departmentService.GetAll(null),
            this.projectService.GetAll(null),
            this.accountService.GetAll('filter=AccountNumber eq 1920'),
            this.companySettingsService.Get(1),
            this.predefinedDescriptionService.GetAll('filter=Type eq 1')
        ).subscribe(
            (data) => {
                this.departments = data[0];
                this.projects = data[1];

                if (this.companySettings
                    && this.companySettings.CompanyBankAccount
                    && this.companySettings.CompanyBankAccount.Account) {
                    this.defaultAccountPayments = this.companySettings.CompanyBankAccount.Account;
                } else {
                    if (data[2] && data[2].length && data[2].length > 0) {
                        this.defaultAccountPayments = data[2][0];
                    }
                }

                this.companySettings = data[3];

                if (data[4]) {
                        this.predefinedDescriptions = data[4];
                }

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
            if (data.length === 0) {
                // set New number as default if nothing is specified and no previous numbers have been used
                newRow.SameOrNewDetails = this.journalEntryNumberAlternatives[
                    this.journalEntryNumberAlternatives.length - 1
                ];
                newRow.JournalEntryNo = this.firstAvailableJournalEntryNumber;
            } else {
                newRow.JournalEntryNo = this.lastUsedJournalEntryNumber;
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

        if (rowModel.NetAmountCurrency) {
            rowModel.NetAmount = rowModel.NetAmountCurrency * rowModel.CurrencyExchangeRate;
        } else {
            rowModel.NetAmount = null;
        }
        return rowModel;
    }

    private calculateAmount(rowModel: JournalEntryData): JournalEntryData {
        if (rowModel.AmountCurrency) {
            rowModel.Amount = rowModel.AmountCurrency * rowModel.CurrencyExchangeRate;
        } else {
            rowModel.Amount = null;
        }

        return rowModel;
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

        return rowModel;
    }

    private setDebitAccountProperties(rowModel: JournalEntryData): JournalEntryData {
        const account = rowModel.DebitAccount;
        if (account) {
            rowModel.DebitAccountID = account.ID;

            if (account.VatTypeID) {
                let vatType = this.vattypes.find(x => x.ID == account.VatTypeID);
                rowModel.DebitVatType = vatType;
            } else {
                rowModel.CreditVatType = null;
            }

            this.setDebitVatTypeProperties(rowModel);
            this.setVatDeductionPercent(rowModel);
        } else {
            rowModel.DebitAccountID = null;
        }
        return rowModel;
    }

    private setCreditAccountProperties(rowModel: JournalEntryData): JournalEntryData {
        const account = rowModel.CreditAccount;
        if (account) {
            rowModel.CreditAccountID = account.ID;

            if (account.VatTypeID) {
                let vatType = this.vattypes.find(x => x.ID == account.VatTypeID);
                rowModel.CreditVatType = vatType;
            } else {
                rowModel.CreditVatType = null;
            }

            this.setCreditVatTypeProperties(rowModel);
            this.setVatDeductionPercent(rowModel);
        } else {
            rowModel.CreditAccountID = null;
        }
        return rowModel;
    }

    private setVatDeductionPercent(rowModel: JournalEntryData): JournalEntryData {
        let deductivePercent: number = 0;
        rowModel.VatDeductionPercent = null;

        if (rowModel.DebitAccount && rowModel.DebitAccount.UseDeductivePercent) {
            deductivePercent = this.journalEntryService.getVatDeductionPercent(
                this.vatDeductions, rowModel.DebitAccount, rowModel.FinancialDate
            );
        }

        if (deductivePercent === 0 && rowModel.CreditAccount && rowModel.CreditAccount.UseDeductivePercent) {
            deductivePercent = this.journalEntryService.getVatDeductionPercent(
                this.vatDeductions, rowModel.CreditAccount, rowModel.FinancialDate
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
            !((newRow.DebitAccount && newRow.DebitAccount.UseDeductivePercent)
            || (newRow.CreditAccount && newRow.CreditAccount.UseDeductivePercent))
        ) {
            this.toastService.addToast(
                'Fradragsprosent kan ikke angis',
                ToastType.warn,
                ToastTime.short,
                'Ingen konto med forholdsvis mva er valgt, og fradragsprosent kan derfor ikke angis.'
            );
            this.setVatDeductionPercent(newRow);
        } else if (!newRow.VatDeductionPercent) {
            this.setVatDeductionPercent(newRow);
        }
        return newRow;
    }

    private setProjectProperties(rowModel: JournalEntryData): JournalEntryData {
        const project = rowModel['Dimensions.Project'];
        if (project) {
            rowModel.Dimensions.Project = project;
            rowModel.Dimensions.ProjectID = project.ID;
        }
        return rowModel;
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

    private setDepartmentProperties(rowModel: JournalEntryData): JournalEntryData {
        const dep = rowModel['Dimensions.Department'];
        if (dep) {
            rowModel.Dimensions.Department = dep;
            rowModel.Dimensions.DepartmentID = dep.ID;
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
                + `'${row.InvoiceNumber}' and RestAmount ne 0`;

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
                        this.setRowValuesBasedOnExistingJournalEntryLine(row, copyFromJournalEntryLine);
                        this.updateJournalEntryLine(row);

                        if (row.CurrencyID !== this.companySettings.BaseCurrencyCodeID) {
                            this.showAgioDialogPostPost(row)
                                .then((res) => {
                                    // reset focus after modal closes
                                    this.table.focusRow(row['_originalIndex']);
                                });
                        }
                    } else if (rows.length > 1) {
                        // if multiple lines are found: show modal with lines that can be selected

                        this.modalService.open(SelectJournalEntryLineModal, { data: { journalentrylines: rows } })
                        .onClose
                        .subscribe((selectedLine) => {
                            if (!selectedLine) {
                                return;
                            }
                            this.setRowValuesBasedOnExistingJournalEntryLine(row, selectedLine);
                            this.updateJournalEntryLine(row);

                            if (row.CurrencyID !== this.companySettings.BaseCurrencyCodeID) {
                                this.showAgioDialogPostPost(row)
                                    .then((res) => {
                                        // reset focus after modal closes
                                        this.table.focusRow(row['_originalIndex']);
                                    });
                            } else {
                                // reset focus after modal closes
                                this.table.focusRow(row['_originalIndex']);
                            }
                        });
                    }
                }, err => {
                    this.errorService.handle(err);
                });
        }

    }

    private setRowValuesBasedOnExistingJournalEntryLine(
        row: JournalEntryData, copyFromJournalEntryLine: JournalEntryLine
    ) {
        // if one line is found: update accounts, amount and text
        const account = copyFromJournalEntryLine.SubAccount
            ? copyFromJournalEntryLine.SubAccount
            : copyFromJournalEntryLine.Account;

        const restAmount = copyFromJournalEntryLine.RestAmount;
        if (restAmount > 0) {
            row.CreditAccountID = account.ID;
            row.CreditAccount = account;
        } else {
            row.DebitAccountID = account.ID;
            row.DebitAccount = account;
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
    }

    private setupUniTable() {

        if (!this.defaultVisibleColumns) {
            this.defaultVisibleColumns = [];
        }

        const sameOrNewCol = new UniTableColumn(
            'SameOrNewDetails', 'Bilagsnr', UniTableColumnType.Lookup
        )
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
            .setWidth('110px');

        const financialDateCol = new UniTableColumn('FinancialDate', 'Regnskapsdato', UniTableColumnType.LocalDate)
            .setWidth('110px')
            .setVisible(false);

        const invoiceNoCol = new UniTableColumn('CustomerInvoice', 'Faktura', UniTableColumnType.Lookup)
            .setDisplayField('InvoiceNumber')
            .setWidth('10%')
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
            .setVisible(false);

        const debitAccountCol = new UniTableColumn('DebitAccount', 'Debet', UniTableColumnType.Lookup)
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
                addNewButtonVisible: true,
                addNewButtonText: 'Opprett ny reskontro',
                addNewButtonCallback: (text) => {
                    return this.openNewAccountModal(this.table.getCurrentRow(), text);
                }
            });

        const debitVatTypeCol = new UniTableColumn('DebitVatType', 'MVA', UniTableColumnType.Lookup)
            .setDisplayField('DebitVatType.VatCode')
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
            });

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
                addNewButtonVisible: true,
                addNewButtonText: 'Opprett ny reskontro',
                addNewButtonCallback: (text) => {
                    return this.openNewAccountModal(this.table.getCurrentRow(), text);
                }
            });

        const creditVatTypeCol = new UniTableColumn('CreditVatType', 'MVA', UniTableColumnType.Lookup)
            .setWidth('8%')
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
            });

        const deductionPercentCol = new UniTableColumn('VatDeductionPercent', 'Fradrag %', UniTableColumnType.Number)
            .setWidth('90px')
            .setSkipOnEnterKeyNavigation(true)
            .setVisible(false);

        const amountCol = new UniTableColumn(
            'Amount', `Beløp (${this.companySettings.BaseCurrencyCode.Code})`, UniTableColumnType.Money
        )
            .setSkipOnEnterKeyNavigation(true)
            .setVisible(false)
            .setEditable(false)
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
                    && ((row.DebitAccount && row.DebitAccount.UseDeductivePercent)
                    || (row.CreditAccount && row.CreditAccount.UseDeductivePercent))) {
                    return `<span title="Nettobeløp kan ikke settes når en konto med forholdsvis mva er brukt">
                    ${this.numberFormatService.asMoney(row['NetAmountCurrency'])}</span>`;
                } else if (row['NetAmountCurrency']) {
                    return this.numberFormatService.asMoney(row['NetAmountCurrency']);
                }
            })*/
            .setEditable((row: JournalEntryData) => {
                if (row.VatDeductionPercent && row.VatDeductionPercent !== 0
                    && ((row.DebitAccount && row.DebitAccount.UseDeductivePercent)
                    || (row.CreditAccount && row.CreditAccount.UseDeductivePercent))) {
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
            .setEditable(false)
            .setVisible(false)
            .setSkipOnEnterKeyNavigation(true)
            .setWidth('90px');

        const projectCol = new UniTableColumn('Dimensions.Project', 'Prosjekt', UniTableColumnType.Lookup)
            .setWidth('8%')
            .setTemplate((rowModel) => {
                if (rowModel.Dimensions && rowModel.Dimensions.Project && rowModel.Dimensions.Project.Name) {
                    const project = rowModel.Dimensions.Project;
                    return project.ProjectNumber + ' - ' + project.Name;
                }
                return '';
            })
            .setOptions({
                itemTemplate: (item) => {
                    return (item.ProjectNumber + ' - ' + item.Name);
                },
                lookupFunction: (searchValue) => {
                    return Observable.from([this.projects.filter(
                        (project) => project.ProjectNumber.toString().startsWith(searchValue)
                        || (project.Name || '').toLowerCase().indexOf(searchValue) >= 0
                    )]);
                }
            });

        const departmentCol = new UniTableColumn('Dimensions.Department', 'Avdeling', UniTableColumnType.Lookup)
            .setWidth('8%')
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
                    return Observable.from([this.departments.filter(
                        (dep) => dep.DepartmentNumber.toString().startsWith(searchValue)
                        || dep.Name.toLowerCase().indexOf(searchValue) >= 0
                    )]);
                }
            });

        const descriptionCol = new UniTableColumn('Description', 'Beskrivelse', UniTableColumnType.Typeahead)
            .setOptions({
                lookupFunction: (searchValue) => {
                    return Observable.of(this.predefinedDescriptions.filter(
                        x => x.Code.toString().indexOf(searchValue) === 0)
                    );
                },
                itemTemplate: (item) => {
                    return (item.Code + ': ' + item.Description);
                },
                itemValue: (item) => {
                    return item ? item.Description : '';
                }
            });

        const addedPaymentCol = new UniTableColumn('JournalEntryPaymentData', '$', UniTableColumnType.Text, false)
            .setTemplate(line => line.JournalEntryPaymentData ? '$' : '')
            .setWidth('30px');

        const fileCol = new UniTableColumn(
            'ID', PAPERCLIP, UniTableColumnType.Text, false
        )
            .setFilterOperator('contains')
            .setTemplate(line => line.FileIDs && line.FileIDs.length > 0 ? PAPERCLIP : '')
            .setWidth('30px')
            .setFilterable(false)
            .setSkipOnEnterKeyNavigation(true);

        const defaultRowData = {
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
                    disabled: (item) => { return (this.disabled || item.StatusCode); },
                    label: 'Slett linje'
                }
            ];


            defaultRowData.Description = 'Innbetaling';

            columns = [
                sameOrNewCol,
                invoiceNoCol,
                vatDateCol,
                financialDateCol,
                debitAccountCol,
                creditAccountCol,
                deductionPercentCol,
                currencyCodeCol,
                amountCurrencyCol,
                amountCol,
                currencyExchangeRate,
                descriptionCol,
                addedPaymentCol,
                fileCol
            ];
        } else {
            // Manual == "Bilagsregistrering"
            tableName = 'accounting.journalEntry.manual';

            contextMenuItems = [
                {
                    action: (item) => this.deleteLine(item),
                    disabled: (item) => { return (this.disabled || item.StatusCode); },
                    label: 'Slett linje'
                },
                {
                    action: (item: JournalEntryData) => this.openAccrual(item),
                    disabled: (item) => { return (this.disabled); },
                    label: 'Periodisering'
                },
                {
                    action: (item) => this.addPayment(item),
                    disabled: (item) => { return item.StatusCode ? true : false; },
                    label: 'Registrer utbetaling',

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
                projectCol,
                departmentCol,
                descriptionCol,
                addedPaymentCol,
                fileCol
            ];
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
            .setIsRowReadOnly((rowModel) => rowModel.StatusCode)
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
                    row = this.calculateGrossAmount(row);
                    row = this.calculateAmount(row);
                } else if (event.field === 'VatDate') {
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

            if (!this.table) {
                // if for some reason unitable has not loaded yet, wait 500 ms and try again one last time
                setTimeout(() => {
                    if (this.table) {
                        this.table.focusRow(0);
                    }
                }, 500);
            } else {
                this.table.focusRow(0);
            }
        });

    }

    public onCellClick(event: ICellClickEvent) {
        if (event.column.field === 'ID') {
            this.toggleImageVisibility(event.row);
        }
    }

    public showAgioDialogPostPost(journalEntryRow: JournalEntryData): Promise<JournalEntryData> {
        const postPostJournalEntryLine = journalEntryRow.PostPostJournalEntryLine;

        return new Promise(resolve => {
            const journalEntryPaymentData: InvoicePaymentData = {
                Amount: postPostJournalEntryLine.RestAmount,
                AmountCurrency: postPostJournalEntryLine.RestAmountCurrency,
                BankChargeAmount: 0,
                CurrencyCodeID: postPostJournalEntryLine.CurrencyCodeID,
                CurrencyExchangeRate: 0,
                PaymentDate: journalEntryRow.FinancialDate || new LocalDate(),
                AgioAccountID: 0,
                BankChargeAccountID: 0,
                AgioAmount: 0
            };

            const title = `Bilagsnr: ${postPostJournalEntryLine.JournalEntryNumber}, `
                + `${postPostJournalEntryLine.RestAmount} ${this.companySettings.BaseCurrencyCode.Code}`;

            const paymentModal = this.modalService.open(UniRegisterPaymentModal, {
                header: title,
                data: journalEntryPaymentData,
                modalConfig: {
                    entityName: JournalEntryLine.EntityType,
                    currencyCode: postPostJournalEntryLine.CurrencyCode.Code,
                    currencyExchangeRate: postPostJournalEntryLine.CurrencyExchangeRate
                }
            });

            paymentModal.onClose.subscribe((paymentData) => {
                if (!paymentData) {
                    resolve(journalEntryRow);
                }

                journalEntryRow.FinancialDate = paymentData.PaymentDate;

                // we use the amount paid * the original journalentryline's CurrencyExchangeRate to
                // calculate the Amount that was paid in the base currency - the diff between this and
                // what is registerred as a payment on the opposite account (normally a bankaccount)
                // will be balanced using an agio line
                journalEntryRow.Amount = UniMath.round(
                    paymentData.AmountCurrency * postPostJournalEntryLine.CurrencyExchangeRate
                );

                journalEntryRow.AmountCurrency = paymentData.AmountCurrency;
                journalEntryRow.NetAmount = journalEntryRow.Amount;
                journalEntryRow.NetAmountCurrency = journalEntryRow.AmountCurrency;
                journalEntryRow.CurrencyExchangeRate = postPostJournalEntryLine.CurrencyExchangeRate;

                if (paymentData.AgioAmount !== 0 && paymentData.AgioAccountID) {
                    const oppositeRow = this.createOppositeRow(journalEntryRow, paymentData);

                    if (journalEntryRow.DebitAccount && journalEntryRow.DebitAccount.UsePostPost) {
                        journalEntryRow.CreditAccount = null;
                        journalEntryRow.CreditAccountID = null;
                        oppositeRow.CreditAccount = this.defaultAccountPayments;
                        oppositeRow.CreditAccountID = this.defaultAccountPayments
                            ? this.defaultAccountPayments.ID
                            : null;
                    } else if (journalEntryRow.CreditAccount && journalEntryRow.CreditAccount.UsePostPost) {
                        journalEntryRow.DebitAccount = null;
                        journalEntryRow.DebitAccountID = null;
                        oppositeRow.DebitAccount = this.defaultAccountPayments;
                        oppositeRow.DebitAccountID = this.defaultAccountPayments
                            ? this.defaultAccountPayments.ID
                            : null;
                    }

                    this.createAgioRow(journalEntryRow, paymentData).then(agioRow => {
                        this.updateJournalEntryLine(journalEntryRow);
                        this.addJournalEntryLines([oppositeRow, agioRow]);
                        resolve(journalEntryRow);
                    });
                } else {
                    if (journalEntryRow.DebitAccount
                        && journalEntryRow.DebitAccount.UsePostPost
                        && !journalEntryRow.CreditAccount
                    ) {
                        journalEntryRow.CreditAccount = this.defaultAccountPayments;
                        journalEntryRow.CreditAccountID = this.defaultAccountPayments
                            ? this.defaultAccountPayments.ID
                            : null;
                    } else if (journalEntryRow.CreditAccount
                        && journalEntryRow.CreditAccount.UsePostPost
                        && !journalEntryRow.DebitAccount
                    ) {
                        journalEntryRow.DebitAccount = this.defaultAccountPayments;
                        journalEntryRow.DebitAccountID = this.defaultAccountPayments
                            ? this.defaultAccountPayments.ID
                            : null;
                    }

                    this.updateJournalEntryLine(journalEntryRow);
                    resolve(journalEntryRow);
                }
            });

            // const updatedRow = this.registerPaymentModal.confirm(
            //     postPostJournalEntryLine.ID,
            //     title,
            //     postPostJournalEntryLine.CurrencyCode,
            //     postPostJournalEntryLine.CurrencyExchangeRate,
            //     JournalEntryLine.EntityType,
            //     journalEntryPaymentData
            // )
            //     .then(modalResult => {
            //         if (modalResult.status === ConfirmActions.ACCEPT) {
            //             const paymentData = modalResult.model;

            //             journalEntryRow.FinancialDate = paymentData.PaymentDate;

            //             // we use the amount paid * the original journalentryline's CurrencyExchangeRate to
            //             // calculate the Amount that was paid in the base currency - the diff between this and
            //             // what is registerred as a payment on the opposite account (normally a bankaccount)
            //             // will be balanced using an agio line
            //             journalEntryRow.Amount =
            //                UniMath.round(paymentData.AmountCurrency
            //                * postPostJournalEntryLine.CurrencyExchangeRate);
            //             journalEntryRow.AmountCurrency = paymentData.AmountCurrency;
            //             journalEntryRow.NetAmount = journalEntryRow.Amount;
            //             journalEntryRow.NetAmountCurrency = journalEntryRow.AmountCurrency;
            //             journalEntryRow.CurrencyExchangeRate = postPostJournalEntryLine.CurrencyExchangeRate;

            //             if (paymentData.AgioAmount !== 0 && paymentData.AgioAccountID) {
            //                 const oppositeRow = this.createOppositeRow(journalEntryRow, paymentData);

            //                 if (journalEntryRow.DebitAccount && journalEntryRow.DebitAccount.UsePostPost) {
            //                     journalEntryRow.CreditAccount = null;
            //                     journalEntryRow.CreditAccountID = null;
            //                     oppositeRow.CreditAccount = this.defaultAccountPayments;
            //                     oppositeRow.CreditAccountID = this.defaultAccountPayments
            //                            ? this.defaultAccountPayments.ID : null;
            //                 } else if (journalEntryRow.CreditAccount
            //                     && journalEntryRow.CreditAccount.UsePostPost
            //                  ) {
            //                     journalEntryRow.DebitAccount = null;
            //                     journalEntryRow.DebitAccountID = null;
            //                     oppositeRow.DebitAccount = this.defaultAccountPayments;
            //                     oppositeRow.DebitAccountID = this.defaultAccountPayments
            //                        ? this.defaultAccountPayments.ID
            //                          : null;
            //                 }

            //                 this.createAgioRow(journalEntryRow, paymentData)
            //                     .then(agioRow => {
            //                         this.updateJournalEntryLine(journalEntryRow);
            //                         this.addJournalEntryLines([oppositeRow, agioRow]);
            //                     });
            //             } else {
            //                 if (journalEntryRow.DebitAccount && journalEntryRow.DebitAccount.UsePostPost
            //                     && !journalEntryRow.CreditAccount) {
            //                     journalEntryRow.CreditAccount = this.defaultAccountPayments;
            //                     journalEntryRow.CreditAccountID = this.defaultAccountPayments
            //                         ? this.defaultAccountPayments.ID : null;
            //                 } else if (journalEntryRow.CreditAccount && journalEntryRow.CreditAccount.UsePostPost
            //                     && !journalEntryRow.DebitAccount
            //                 ) {
            //                     journalEntryRow.DebitAccount = this.defaultAccountPayments;
            //                     journalEntryRow.DebitAccountID = this.defaultAccountPayments
            //                        ? this.defaultAccountPayments.ID : null;
            //                 }

            //                 this.updateJournalEntryLine(journalEntryRow);
            //             }
            //         }
            //         return journalEntryRow;
            //     });
        });
    }



    private showAgioDialog(journalEntryRow: JournalEntryData): Promise<JournalEntryData> {
        const customerInvoice = journalEntryRow.CustomerInvoice;
        return new Promise(resolve => {
            const paymentData: InvoicePaymentData = {
                Amount: customerInvoice.RestAmount,
                AmountCurrency: customerInvoice.RestAmountCurrency,
                BankChargeAmount: 0,
                CurrencyCodeID: customerInvoice.CurrencyCodeID,
                CurrencyExchangeRate: 0,
                PaymentDate: journalEntryRow.FinancialDate || new LocalDate(),
                AgioAccountID: 0,
                BankChargeAccountID: 0,
                AgioAmount: 0
            };

            const title = `Faktura nr: ${customerInvoice.InvoiceNumber},`
                + ` ${customerInvoice.RestAmount} ${this.companySettings.BaseCurrencyCode.Code}`;

            const paymentModal = this.modalService.open(UniRegisterPaymentModal, {
                header: title,
                data: paymentData,
                modalConfig: {
                    entityName: CustomerInvoice.EntityType,
                    currencyCode: customerInvoice.CurrencyCode.Code,
                    currencyExchangeRate: customerInvoice.CurrencyExchangeRate
                }
            });

            paymentModal.onClose.subscribe(payment => {
                if (!payment) {
                    resolve(journalEntryRow);
                }

                journalEntryRow.FinancialDate = paymentData.PaymentDate;

                // we use the amount paid * the original invoices CurrencyExchangeRate to calculate
                // the Amount that was paid in the base currency - the diff between this and what
                // is registerred as a payment on the opposite account (normally a bankaccount)
                // will be balanced using an agio line
                journalEntryRow.Amount = UniMath.round(
                    paymentData.AmountCurrency * customerInvoice.CurrencyExchangeRate
                );

                journalEntryRow.AmountCurrency = paymentData.AmountCurrency;
                journalEntryRow.NetAmount = journalEntryRow.Amount;
                journalEntryRow.NetAmountCurrency = journalEntryRow.AmountCurrency;
                journalEntryRow.CurrencyExchangeRate = customerInvoice.CurrencyExchangeRate;

                if (paymentData.AgioAmount !== 0 && paymentData.AgioAccountID) {
                    const oppositeRow = this.createOppositeRow(journalEntryRow, paymentData);
                    journalEntryRow.DebitAccount = null;
                    journalEntryRow.DebitAccountID = null;

                    this.createAgioRow(journalEntryRow, paymentData).then(agioRow => {
                        this.addJournalEntryLines([oppositeRow, agioRow]);
                        resolve(journalEntryRow);
                    });
                } else {
                    resolve(journalEntryRow);
                }
            });

            // const updatedRow = this.registerPaymentModal.confirm(
            //     customerInvoice.ID,
            //     title,
            //     customerInvoice.CurrencyCode,
            //     customerInvoice.CurrencyExchangeRate,
            //     CustomerInvoice.EntityType,
            //     invoiceData
            // )
            //     .then(modalResult => {
            //         if (modalResult.status === ConfirmActions.ACCEPT) {
            //             const paymentData = modalResult.model;
            //             journalEntryRow.FinancialDate = paymentData.PaymentDate;

            //             // we use the amount paid * the original invoices CurrencyExchangeRate to calculate
            //             // the Amount that was paid in the base currency - the diff between this and what
            //             // is registerred as a payment on the opposite account (normally a bankaccount)
            //             // will be balanced using an agio line
            //             journalEntryRow.Amount =
            //                 UniMath.round(paymentData.AmountCurrency * customerInvoice.CurrencyExchangeRate);
            //             journalEntryRow.AmountCurrency = paymentData.AmountCurrency;
            //             journalEntryRow.NetAmount = journalEntryRow.Amount;
            //             journalEntryRow.NetAmountCurrency = journalEntryRow.AmountCurrency;
            //             journalEntryRow.CurrencyExchangeRate = customerInvoice.CurrencyExchangeRate;

            //             if (paymentData.AgioAmount !== 0 && paymentData.AgioAccountID) {
            //                 const oppositeRow = this.createOppositeRow(journalEntryRow, paymentData);
            //                 journalEntryRow.DebitAccount = null;
            //                 journalEntryRow.DebitAccountID = null;
            //                 this.createAgioRow(journalEntryRow, paymentData)
            //                     .then(agioRow => {
            //                         this.addJournalEntryLines([oppositeRow, agioRow]);
            //                     });
            //             }
            //         }
            //         return journalEntryRow;
            //     });

            // res(updatedRow);
        });
    }

    private createOppositeRow(
        journalEntryData: JournalEntryData, invoicePaymentData: InvoicePaymentData
    ): JournalEntryData {
        const oppositeRow = new JournalEntryData();
        const invoice = journalEntryData.CustomerInvoice;

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

        oppositeRow.Amount = invoicePaymentData.Amount;
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
        const isCredit = invoicePaymentData.AgioAmount < 0;

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
                        if (isCredit) {
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

    private accountSearch(searchValue: string): Observable<any> {

        let filter = '';
        if (searchValue === '') {
            filter = `Visible eq 'true' and isnull(AccountID,0) eq 0`;
        } else {
            let copyPasteFilter = '';

            if (searchValue.indexOf(':') > 0) {
                const accountNumberPart = searchValue.split(':')[0].trim();
                const accountNamePart = searchValue.split(':')[1].trim();

                copyPasteFilter = ` or (AccountNumber eq '${accountNumberPart}' `
                    + `and AccountName eq '${accountNamePart}')`;
            }

            filter = `Visible eq 'true' and (startswith(AccountNumber\,'${searchValue}') `
                + `or contains(AccountName\,'${searchValue}')${copyPasteFilter} )`;
        }

        return this.accountService.searchAccounts(filter, searchValue !== '' ? 100 : 500);
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

        let title: string = 'Periodisering av bilag ' + item.JournalEntryNo;
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
                    accrualAmount: null,
                    accrualStartDate: null,
                    journalEntryLineDraft: null,
                    accrual: item.JournalEntryDataAccrual,
                    title: title
                };
                this.openAccrualModal(data, item);

            } else if (item.AmountCurrency && item.AmountCurrency !== 0 && item.FinancialDate) {
                const data = {
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
        this.modalService.open(AccrualModal, {data: data}).onClose.subscribe((res: any) => {
            if (res && res.action === 'ok') {
                this.onModalChanged(item, res.model);
            } else if (res && res.action === 'deleted') {
                this.onModalDeleted(item);
            }
        });
    }

    private onModalChanged(item, modalval) {
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

    private onModalDeleted(item) {
        item.JournalEntryDataAccrual = null;
        this.table.updateRow(item['_originalIndex'], item);
        setTimeout(() => {
            const tableData = this.table.getTableData();
            this.dataChanged.emit(tableData);
        });
    }

    private addPayment(item: JournalEntryData) {
        let title: string = 'Legg til betaling';
        let payment: Payment = null;
        if (item.JournalEntryPaymentData && item.JournalEntryPaymentData.PaymentData) {
            payment = item.JournalEntryPaymentData.PaymentData;
            title = 'Endre betaling';

            this.modalService.open(AddPaymentModal, { data: { payment: payment} }).onClose.subscribe((res: any) => {
                if (payment) {
                    item.JournalEntryPaymentData.PaymentData = res;
                    this.table.updateRow(item['_originalIndex'], item);
                    this.rowChanged();
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
                    this.statisticsService.GetAll(
                        `model=Customer&expand=Info.DefaultBankAccount&filter=Customer.ID eq
                        ${customerID}&select=DefaultBankAccount.ID as DefaultBankAccountID,
                        DefaultBankAccount.AccountNumber as DefaultBankAccountAccountNumber,Info.Name
                        as BusinessRelationName,Info.ID as BusinessRelationID`)
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

                this.modalService.open(AddPaymentModal, {data: { payment: payment }}).onClose.subscribe((res) => {
                    if (res) {
                        if (!item.JournalEntryPaymentData) {
                            item.JournalEntryPaymentData = {
                                PaymentData: res
                            };
                        } else {
                            item.JournalEntryPaymentData.PaymentData = res;
                        }

                        // if the item is already booked, just add the payment through the API now
                        /* if (item.StatusCode) {
                            this.journalEntryService.LEGGTILBETALING()
                            DETTE GJØRES MÅ GJØRES I NESTE SPRINT,
                            TAS SAMTIDIG SOM FUNKSJON FOR Å REGISTRERE MER PÅ ET EKSISTERENDE BILAG
                            https://github.com/unimicro/AppFramework/issues/2536
                        }
                        */
                        this.table.updateRow(item['_originalIndex'], item);
                        this.rowChanged();
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

    private setupJournalEntryNumbers(doUpdateExistingLines: boolean): Promise<any> {
        if (!this.currentFinancialYear) {
            return Promise.resolve();
        }

        return new Promise((resolve, reject) => {
            const journalentrytoday: JournalEntryData = new JournalEntryData();
            journalentrytoday.FinancialDate = this.currentFinancialYear.ValidFrom;
            journalentrytoday.NumberSeriesTaskID = this.selectedNumberSeriesTaskID;
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

                            // Check if readonly rows contains one or more lines with the wrong numberseries
                            const shouldUpdateData = editableRows.some(
                                row => row.NumberSeriesTaskID !== this.selectedNumberSeriesTaskID ||
                                row.NumberseriessID !== this.selectedNumberSeries.ID
                            );
                            if (shouldUpdateData) {
                                const uniQueNumbers = _.uniq(editableRows.map(item => item.JournalEntryNo));
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

                    if (this.table) {
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

    public postJournalEntryData(completeCallback, saveAsDraft?: boolean, id?: number) {
        const tableData = this.table.getTableData();
        tableData.forEach(data => {
            data.NumberSeriesID = this.selectedNumberSeries ? this.selectedNumberSeries.ID : null;
        });

        if (saveAsDraft) {
            this.journalEntryService.postJournalEntryData(tableData, saveAsDraft, id)
                .subscribe(data => {
                    completeCallback('Lagret som kladd');

                    // Empty list
                    this.journalEntryLines = new Array<JournalEntryData>();
                    this.setupJournalEntryNumbers(false);
                    this.dataChanged.emit(this.journalEntryLines);
                },
                err => {
                    completeCallback('Feil ved lagring av kladd');
                    this.errorService.handle(err);
                }
            );
        } else {
            this.journalEntryService.postJournalEntryData(tableData)
                .subscribe(data => {
                    const firstJournalEntry = data[0];
                    const lastJournalEntry = data[data.length - 1];

                    // Validate if journalEntry number has changed
                    const numbers = this.journalEntryService.findJournalNumbersFromLines(tableData);

                    if (firstJournalEntry.JournalEntryNumber !== numbers.firstNumber ||
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
                },
                err => {
                    completeCallback('Feil ved lagring av bilag');
                    this.errorService.handle(err);
                }
            );
        }
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

    private rowChanged(event?) {
        const tableData = this.table.getTableData();
        this.dataChanged.emit(tableData);
    }

    public getTableData() {
        return this.table.getTableData();
    }
}
