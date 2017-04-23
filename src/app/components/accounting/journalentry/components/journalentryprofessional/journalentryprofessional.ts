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
import {UniTable, UniTableColumn, UniTableColumnType, UniTableConfig} from 'unitable-ng2/main';
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
    InvoicePaymentData
} from '../../../../../unientities';
import {JournalEntryData} from '../../../../../models/models';
import {JournalEntryMode} from '../../journalentrymanual/journalentrymanual';
import {AccrualModal} from '../../../../common/modals/accrualModal';
import {ToastService, ToastType, ToastTime} from '../../../../../../framework/uniToast/toastService';
import {AddPaymentModal} from '../../../../common/modals/addPaymentModal';
import {UniConfirmModal, ConfirmActions} from '../../../../../../framework/modals/confirm';
import {
    VatTypeService,
    AccountService,
    JournalEntryService,
    JournalEntryLineService,
    DepartmentService,
    ProjectService,
    CustomerInvoiceService,
    CompanySettingsService,
    ErrorService,
    StatisticsService,
    NumberFormat
} from '../../../../../services/services';
import * as moment from 'moment';
import {CurrencyCodeService} from '../../../../../services/common/currencyCodeService';
import {CurrencyService} from '../../../../../services/common/currencyService';
import {RegisterPaymentModal} from '../../../../common/modals/registerPaymentModal';
import {SelectJournalEntryLineModal} from '../selectJournalEntryLineModal';
import {INumberFormat} from 'unitable-ng2/src/unitable/config/unitableColumn';
import {UniMath} from '../../../../../../framework/core/uniMath';
const PAPERCLIP = '📎'; // It might look empty in your editor, but this is the unicode paperclip

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
    @ViewChild(UniTable) private table: UniTable;
    @ViewChild(AccrualModal) private accrualModal: AccrualModal;
    @ViewChild(AddPaymentModal) private addPaymentModal: AddPaymentModal;
    @ViewChild(UniConfirmModal) private confirmModal: UniConfirmModal;
    @ViewChild(RegisterPaymentModal) private registerPaymentModal: RegisterPaymentModal;
    @ViewChild(SelectJournalEntryLineModal) private selectJournalEntryLineModal: SelectJournalEntryLineModal;

    private companySettings: CompanySettings;
    private columnsThatMustAlwaysShow: string[] = ['AmountCurrency'];
    private journalEntryTableConfig: UniTableConfig;
    private paymentModalValueChanged: any;
    private accrualModalValueChanged: any;
    private accrualModalValueDeleted: any;

    @Output() public dataChanged: EventEmitter<JournalEntryData[]> = new EventEmitter<JournalEntryData[]>();
    @Output() public dataLoaded: EventEmitter<JournalEntryData[]> = new EventEmitter<JournalEntryData[]>();
    @Output() public showImageChanged: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Output() public showImageForJournalEntry: EventEmitter<JournalEntryData> = new EventEmitter<JournalEntryData>();
    @Output() public columnVisibilityChange: EventEmitter<Array<string>> = new EventEmitter<Array<string>>();
    @Output() public rowSelected: EventEmitter<JournalEntryData> = new EventEmitter<JournalEntryData>();

    private projects: Project[];
    private departments: Department[];
    private vattypes: VatType[];


    private SAME_OR_NEW_NEW: string = '1';
    private newAlternative: any = {ID: this.SAME_OR_NEW_NEW, Name: 'Nytt bilag'};
    public journalEntryNumberAlternatives: Array<any> = [];

    private firstAvailableJournalEntryNumber: string = '';
    private lastUsedJournalEntryNumber: string = '';

    private lastImageDisplayFor: string = '';

    private defaultAccountPayments: Account = null;

    constructor(
        private changeDetector: ChangeDetectorRef,
        private uniHttpService: UniHttp,
        private vatTypeService: VatTypeService,
        private accountService: AccountService,
        private journalEntryService: JournalEntryService,
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
        private journalEntryLineService: JournalEntryLineService
    ) {

    }

    public ngOnInit() {
        this.setupJournalEntryTable();
    }

    public ngOnChanges(changes: SimpleChanges) {
        if (changes['currentFinancialYear'] && this.currentFinancialYear) {
            let journalentrytoday: JournalEntryData = new JournalEntryData();
            journalentrytoday.FinancialDate = this.currentFinancialYear.ValidFrom;
            this.journalEntryService.getNextJournalEntryNumber(journalentrytoday)
                .subscribe(numberdata => {
                        this.firstAvailableJournalEntryNumber = numberdata;
                        this.setupSameNewAlternatives();
                    }, err => this.errorService.handle(err)
                );
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
                if (this.defaultVisibleColumns && !this.defaultVisibleColumns.some(def => def === col)){
                    this.defaultVisibleColumns.push(col);
                }
            });
        }
    }

    public setJournalEntryData(data) {
        // if data is retrieved from the server, the netamount needs to be recalculated
        if (data) {
            data.forEach(row => {
                if (!row.SameOrNewDetails && row.JournalEntryNo) {
                    row.SameOrNewDetails = { ID: row.JournalEntryNo, Name: row.JournalEntryNo };
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
                this.table.focusRow(0);
            } else {
                setTimeout(() => {
                    if (this.table) {
                        this.table.blur();
                        this.table.focusRow(0);
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
            this.vatTypeService.GetAll('orderby=VatCode'),
            this.accountService.GetAll('filter=AccountNumber eq 1920'),
            this.companySettingsService.Get(1)
        ).subscribe(
            (data) => {
                this.departments = data[0];
                this.projects = data[1];
                this.vattypes = data[2];

                if (this.companySettings
                    && this.companySettings.CompanyBankAccount
                    && this.companySettings.CompanyBankAccount.Account) {
                    this.defaultAccountPayments = this.companySettings.CompanyBankAccount.Account;
                } else {
                    if (data[3] && data[3].length && data[3].length > 0) {
                        this.defaultAccountPayments = data[3][0];
                    }
                }

                this.companySettings = data[4];

                this.setupUniTable();
                this.dataLoaded.emit(this.journalEntryLines);
            },
            err => this.errorService.handle(err)
        );
    }

    private setJournalEntryNumberProperties(newRow: JournalEntryData) {
        let data = this.table.getTableData();

        if (newRow.SameOrNewDetails) {
            if (newRow.SameOrNewDetails.ID === this.SAME_OR_NEW_NEW) {
                newRow.JournalEntryNo = this.firstAvailableJournalEntryNumber;
            } else {
                newRow.JournalEntryNo = newRow.SameOrNewDetails.Name;
            }
        } else {
            if (data.length === 0) {
                // set New number as default if nothing is specified and no previous numbers have been used
                newRow.SameOrNewDetails = this.journalEntryNumberAlternatives[this.journalEntryNumberAlternatives.length - 1];
                newRow.JournalEntryNo = this.firstAvailableJournalEntryNumber;
            } else {
                newRow.JournalEntryNo = this.lastUsedJournalEntryNumber;
            }
        }

        newRow.SameOrNew = newRow.JournalEntryNo;
        newRow.SameOrNewDetails = {ID: newRow.JournalEntryNo, Name: newRow.JournalEntryNo};

        setTimeout(() => {
            // update alternatives, this will change when new numbers are used. Do this after datasource is updated, using setTimeout
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
                    `Postmarkeringen mot bilag ${rowModel.PostPostJournalEntryLine.JournalEntryNumber} ble fjernet pga konto ble endret`
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
                let calc = this.journalEntryService.calculateJournalEntryData(
                    rowModel.DebitAccount,
                    rowModel.DebitVatType,
                    rowModel.AmountCurrency,
                    null,
                    rowModel
                );
                rowModel.NetAmountCurrency = calc.amountNetCurrency;
            } else if (rowModel.CreditAccount && rowModel.CreditVatType && !rowModel.CreditVatType.DirectJournalEntryOnly) {
                let calc = this.journalEntryService.calculateJournalEntryData(
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
        let rowDate = rowModel.FinancialDate || new LocalDate();
        rowModel.CurrencyID = rowModel.CurrencyCode.ID;
        return new Promise(done => {
            if (rowModel.CurrencyCode.ID == this.companySettings.BaseCurrencyCodeID) {
                rowModel.CurrencyExchangeRate = 1;
                done(rowModel);
            } else {
                let currencyDate = moment(rowDate).isAfter(moment()) ? new LocalDate() : rowDate;
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
                    )
            }
        });
    }

    private calculateGrossAmount(rowModel: JournalEntryData): JournalEntryData {
        if (rowModel.NetAmountCurrency && rowModel.NetAmountCurrency !== 0) {
            if (rowModel.DebitAccount && rowModel.DebitVatType && !rowModel.DebitVatType.DirectJournalEntryOnly) {
                let calc = this.journalEntryService.calculateJournalEntryData(
                    rowModel.DebitAccount,
                    rowModel.DebitVatType,
                    null,
                    rowModel.NetAmountCurrency,
                    rowModel
                );
                rowModel.AmountCurrency = calc.amountGrossCurrency;
            } else if (rowModel.CreditAccount && rowModel.CreditVatType && !rowModel.CreditVatType.DirectJournalEntryOnly) {
                let calc = this.journalEntryService.calculateJournalEntryData(
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
        let account = rowModel.DebitAccount;
        if (account) {
            rowModel.DebitAccountID = account.ID;
            rowModel.DebitVatType = account.VatType;
            rowModel.DebitVatTypeID = account.VatTypeID;

            this.setVatDeductionPercent(rowModel);
        } else {
            rowModel.DebitAccountID = null;
        }
        return rowModel;
    }

    private setCreditAccountProperties(rowModel: JournalEntryData): JournalEntryData {
        let account = rowModel.CreditAccount;
        if (account) {
            rowModel.CreditAccountID = account.ID;
            rowModel.CreditVatType = account.VatType;
            rowModel.CreditVatTypeID = account.VatTypeID;

        } else {
            rowModel.CreditAccountID = null;
        }
        return rowModel;
    }

    private setVatDeductionPercent(rowModel: JournalEntryData): JournalEntryData {
        let deductivePercent: number = 0;
        rowModel.VatDeductionPercent = null;

        if (rowModel.DebitAccount && rowModel.DebitAccount.UseDeductivePercent) {
            deductivePercent = this.journalEntryService.getVatDeductionPercent(this.vatDeductions, rowModel.DebitAccount, rowModel.FinancialDate);
        }

        if (deductivePercent === 0 && rowModel.CreditAccount && rowModel.CreditAccount.UseDeductivePercent) {
            deductivePercent = this.journalEntryService.getVatDeductionPercent(this.vatDeductions, rowModel.CreditAccount, rowModel.FinancialDate);
        }

        if (deductivePercent !== 0) {
            rowModel.VatDeductionPercent = deductivePercent;
        }
        return rowModel;
    }

    private setDebitVatTypeProperties(rowModel: JournalEntryData): JournalEntryData {
        let vattype: VatType = rowModel.DebitVatType;

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
            !((newRow.DebitAccount && newRow.DebitAccount.UseDeductivePercent) || (newRow.CreditAccount && newRow.CreditAccount.UseDeductivePercent))) {
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
        let project = rowModel['Dimensions.Project'];
        if (project) {
            rowModel.Dimensions.Project = project;
            rowModel.Dimensions.ProjectID = project.ID;
        }
        return rowModel;
    }

    private setDepartmentProperties(rowModel: JournalEntryData): JournalEntryData {
        let dep = rowModel['Dimensions.Department'];
        if (dep) {
            rowModel.Dimensions.Department = dep;
            rowModel.Dimensions.DepartmentID = dep.ID;
        }
        return rowModel;
    }

    private setCustomerInvoiceProperties(rowModel: JournalEntryData): JournalEntryData {
        let invoice = <CustomerInvoice> rowModel['CustomerInvoice'];
        if (invoice) {
            rowModel.InvoiceNumber = invoice.InvoiceNumber;
            rowModel.CurrencyID = invoice.CurrencyCodeID;
            rowModel.CurrencyCode = invoice.CurrencyCode;
            rowModel.CurrencyExchangeRate = invoice.CurrencyExchangeRate;
        }

        if (invoice && invoice.JournalEntry && invoice.JournalEntry.Lines) {
            for (let i = 0; i < invoice.JournalEntry.Lines.length; i++) {
                let line = invoice.JournalEntry.Lines[i];

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
            let filter = `expand=Account,SubAccount,CurrencyCode&filter=InvoiceNumber eq '${row.InvoiceNumber}' and RestAmount ne 0`;

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
                        let copyFromJournalEntryLine = rows[0];
                        this.setRowValuesBasedOnExistingJournalEntryLine(row, copyFromJournalEntryLine);

                        this.updateJournalEntryLine(row);
                    } else if (rows.length > 1) {
                        // if multiple lines are found: show modal with lines that can be selected
                        this.selectJournalEntryLineModal
                            .openModal(rows)
                            .then((selectedLine) => {
                                this.setRowValuesBasedOnExistingJournalEntryLine(row, selectedLine);
                                this.updateJournalEntryLine(row);

                                // reset focus after modal closes
                                this.table.focusRow(row['_originalIndex']);
                            });
                    }
                }, err => {
                    this.errorService.handle(err);
                });
        }

    }

    private setRowValuesBasedOnExistingJournalEntryLine(row: JournalEntryData, copyFromJournalEntryLine: JournalEntryLine) {
        // if one line is found: update accounts, amount and text
        let account = copyFromJournalEntryLine.SubAccount ? copyFromJournalEntryLine.SubAccount : copyFromJournalEntryLine.Account;

        let restAmount = copyFromJournalEntryLine.RestAmount;
        if (restAmount > 0) {
            row.CreditAccountID = account.ID;
            row.CreditAccount = account;
        } else {
            row.DebitAccountID = account.ID;
            row.DebitAccount = account;
        }

        row.Amount = Math.abs(copyFromJournalEntryLine.RestAmount);
        row.NetAmount = Math.abs(copyFromJournalEntryLine.RestAmount);
        row.AmountCurrency = Math.abs(copyFromJournalEntryLine.RestAmountCurrency);
        row.NetAmountCurrency = Math.abs(copyFromJournalEntryLine.RestAmountCurrency);

        row.PostPostJournalEntryLineID = copyFromJournalEntryLine.ID;
        row.PostPostJournalEntryLine = copyFromJournalEntryLine;
        row.CurrencyID = copyFromJournalEntryLine.CurrencyCodeID;
        row.CurrencyCode = copyFromJournalEntryLine.CurrencyCode;
    }

    private setupUniTable() {

        if (!this.defaultVisibleColumns) {
            this.defaultVisibleColumns = [];
        }

        let sameOrNewCol = new UniTableColumn('SameOrNewDetails', 'Bilagsnr', UniTableColumnType.Lookup).setWidth('100px')
            .setEditorOptions({
                displayField: 'Name',
                lookupFunction: (searchValue) => {
                    return Observable.from([this.journalEntryNumberAlternatives.filter((alternative) => alternative.Name.indexOf(searchValue.toLowerCase()) >= 0 || (alternative.ID === this.SAME_OR_NEW_NEW))]);
                },
                itemTemplate: (item) => {
                    return item ? item.Name : '';
                }
            })
            .setTemplate((item) => {
                return item.JournalEntryNo ? item.JournalEntryNo : '';
            });

        let financialDateCol = new UniTableColumn('FinancialDate', 'Dato', UniTableColumnType.LocalDate).setWidth('110px');

        let invoiceNoCol = new UniTableColumn('CustomerInvoice', 'Faktura', UniTableColumnType.Lookup)
            .setDisplayField('InvoiceNumber')
            .setWidth('10%')
            .setEditorOptions({
                itemTemplate: (selectedItem: CustomerInvoice) => {
                    return selectedItem ? (`Fakturanr: ${selectedItem.InvoiceNumber}. Restbeløp: ${selectedItem.RestAmountCurrency} ${selectedItem.CurrencyCode.Code}`) : '';
                },
                lookupFunction: (searchValue) => {
                    return this.customerInvoiceService.GetAll(`filter=startswith(InvoiceNumber, '${searchValue}')&top=10`
                        + `&expand=JournalEntry,JournalEntry.Lines,JournalEntry.Lines.Account,JournalEntry.Lines.SubAccount,CurrencyCode`);
                }
            });

        let invoiceNoTextCol = new UniTableColumn('InvoiceNumber', 'Fakturanr', UniTableColumnType.Text).setWidth('80px')
            .setVisible(false);

        let debitAccountCol = new UniTableColumn('DebitAccount', 'Debet', UniTableColumnType.Lookup)
            .setDisplayField('DebitAccount.AccountNumber')
            .setTemplate((rowModel) => {
                if (rowModel.DebitAccount) {
                    let account = rowModel.DebitAccount;
                    return account.AccountNumber
                        + ': '
                        + account.AccountName;
                }
                return '';
            })
            .setWidth('10%')
            .setEditorOptions({
                itemTemplate: (selectedItem) => {
                    return (selectedItem.AccountNumber + ' - ' + selectedItem.AccountName);
                },
                lookupFunction: (searchValue) => {
                    return this.accountSearch(searchValue);
                }
            });

        let debitVatTypeCol = new UniTableColumn('DebitVatType', 'MVA', UniTableColumnType.Lookup)
            .setDisplayField('DebitVatType.VatCode')
            .setWidth('8%')
            .setSkipOnEnterKeyNavigation(true)
            .setTemplate((rowModel) => {
                if (rowModel.DebitVatType) {
                    let vatType = rowModel.DebitVatType;
                    return `${vatType.VatCode}: ${vatType.VatPercent}%`;
                }
                return '';
            })
            .setEditorOptions({
                itemTemplate: (item) => {
                    return `${item.VatCode}: ${item.Name} - ${item.VatPercent}%`;
                },
                lookupFunction: (searchValue) => {
                    return Observable.from([this.vattypes.filter((vattype) => vattype.VatCode === searchValue || vattype.VatPercent == searchValue || vattype.Name.toLowerCase().indexOf(searchValue.toLowerCase()) >= 0 || searchValue === `${vattype.VatCode}: ${vattype.Name} - ${vattype.VatPercent}%` || searchValue === `${vattype.VatCode}: ${vattype.VatPercent}%`)]);
                }
            });

        let creditAccountCol = new UniTableColumn('CreditAccount', 'Kredit', UniTableColumnType.Lookup)
            .setDisplayField('CreditAccount.AccountNumber')
            .setTemplate((rowModel) => {
                if (rowModel.CreditAccount) {
                    let account = rowModel.CreditAccount;
                    return account.AccountNumber
                        + ': '
                        + account.AccountName;
                }
                return '';
            })
            .setWidth('10%')
            .setEditorOptions({
                itemTemplate: (selectedItem) => {
                    return (selectedItem.AccountNumber + ' - ' + selectedItem.AccountName);
                },
                lookupFunction: (searchValue) => {
                    return this.accountSearch(searchValue);
                }
            });

        let creditVatTypeCol = new UniTableColumn('CreditVatType', 'MVA', UniTableColumnType.Lookup)
            .setWidth('8%')
            .setSkipOnEnterKeyNavigation(true)
            .setTemplate((rowModel) => {
                if (rowModel.CreditVatType) {
                    let vatType = rowModel.CreditVatType;
                    return `${vatType.VatCode}: ${vatType.VatPercent}%`;
                }
                return '';
            })
            .setEditorOptions({
                itemTemplate: (item) => {
                    return `${item.VatCode}: ${item.Name} - ${item.VatPercent}%`;
                },
                lookupFunction: (searchValue) => {
                    return Observable.from([this.vattypes.filter((vattype) => vattype.VatCode === searchValue || vattype.VatPercent == searchValue || vattype.Name.toLowerCase().indexOf(searchValue.toLowerCase()) >= 0 || searchValue === `${vattype.VatCode}: ${vattype.Name} - ${vattype.VatPercent}%` || searchValue === `${vattype.VatCode}: ${vattype.VatPercent}%`)]);
                }
            });

        let deductionPercentCol = new UniTableColumn('VatDeductionPercent', 'Fradrag %', UniTableColumnType.Number)
            .setWidth('90px')
            .setSkipOnEnterKeyNavigation(true)
            .setVisible(false);

        let amountCol = new UniTableColumn('Amount', `Beløp (${this.companySettings.BaseCurrencyCode.Code})`, UniTableColumnType.Money)
            .setSkipOnEnterKeyNavigation(true)
            .setVisible(false)
            .setEditable(false)
            .setWidth('90px');
        let amountCurrencyCol = new UniTableColumn('AmountCurrency', 'Beløp', UniTableColumnType.Money).setWidth('90px');
        let netAmountCol = new UniTableColumn('NetAmountCurrency', 'Netto', UniTableColumnType.Money).setWidth('90px')
            .setSkipOnEnterKeyNavigation(true)
            /*  KE: We should display a tooltip if editing is not possible, but currently this causes problems, so ignore this for now
                .setTemplate((row: JournalEntryData) => {
                if (row['NetAmountCurrency'] && row.VatDeductionPercent && row.VatDeductionPercent !== 0
                    && ((row.DebitAccount && row.DebitAccount.UseDeductivePercent)
                    || (row.CreditAccount && row.CreditAccount.UseDeductivePercent))) {
                    return `<span title="Nettobeløp kan ikke settes når en konto med forholdsvis mva er brukt">${this.numberFormatService.asMoney(row['NetAmountCurrency'])}</span>`;
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

        let CurrencyCodeCol = new UniTableColumn('CurrencyCode', 'Valuta', UniTableColumnType.Select)
            .setWidth('90px')
            .setTemplate(row => row && row.CurrencyCode && row.CurrencyCode.Code)
            .setVisible(false)
            .setEditorOptions({
                itemTemplate: rowModel => rowModel.Code,
                resource: this.currencyCodeService.GetAll(null)
            });

        let CurrencyExchangeRate = new UniTableColumn('CurrencyExchangeRate', 'V-Kurs', UniTableColumnType.Number)
            .setNumberFormat({
                thousandSeparator: ' ',
                decimalSeparator: ',',
                decimalLength: 4
            })
            .setEditable(false)
            .setVisible(false)
            .setSkipOnEnterKeyNavigation(true)
            .setWidth('90px');

        let projectCol = new UniTableColumn('Dimensions.Project', 'Prosjekt', UniTableColumnType.Lookup)
            .setWidth('8%')
            .setTemplate((rowModel) => {
                if (rowModel.Dimensions && rowModel.Dimensions.Project && rowModel.Dimensions.Project.Name) {
                    let project = rowModel.Dimensions.Project;
                    return project.ProjectNumber + ' - ' + project.Name;
                }
                return '';
            })
            .setEditorOptions({
                itemTemplate: (item) => {
                    return (item.ProjectNumber + ' - ' + item.Name);
                },
                lookupFunction: (searchValue) => {
                    return Observable.from([this.projects.filter((project) => project.ProjectNumber.toString().startsWith(searchValue) || project.Name.toLowerCase().indexOf(searchValue) >= 0)]);
                }
            });

        let departmentCol = new UniTableColumn('Dimensions.Department', 'Avdeling', UniTableColumnType.Lookup)
            .setWidth('8%')
            .setTemplate((rowModel) => {
                if (rowModel.Dimensions && rowModel.Dimensions.Department && rowModel.Dimensions.Department.Name) {
                    let dep = rowModel.Dimensions.Department;
                    return dep.DepartmentNumber + ' - ' + dep.Name;
                }
                return '';
            })
            .setEditorOptions({
                itemTemplate: (item) => {
                    return (item.DepartmentNumber + ' - ' + item.Name);
                },
                lookupFunction: (searchValue) => {
                    return Observable.from([this.departments.filter((dep) => dep.DepartmentNumber.toString().startsWith(searchValue) || dep.Name.toLowerCase().indexOf(searchValue) >= 0)]);
                }
            });

        let descriptionCol = new UniTableColumn('Description', 'Beskrivelse', UniTableColumnType.Text);

        let fileCol = new UniTableColumn('ID', PAPERCLIP, UniTableColumnType.Text, false).setFilterOperator('contains')
            .setTemplate(line => line.FileIDs && line.FileIDs.length > 0 ? PAPERCLIP : '')
            .setWidth('30px')
            .setFilterable(false)
            .setSkipOnEnterKeyNavigation(true)
            .setOnCellClick(line => this.toggleImageVisibility(line));

        let defaultRowData = {
            Dimensions: {},
            DebitAccount: null,
            DebitAccountID: null,
            CreditAccount: null,
            CreditAccountID: null,
            // KE: We might want to set these as "Nytt bilag" for some entrymodes, but expected behaviour with
            //     UniTable is to copy value from the row above it you dont enter anything. Leave this for now, need to be considered

            // SameOrNew: this.journalEntryNumberAlternatives[this.journalEntryNumberAlternatives.length - 1].ID,
            // SameOrNewDetails: this.journalEntryNumberAlternatives[this.journalEntryNumberAlternatives.length - 1],
            Description: '',
            FileIDs: []
        };

        let columns: Array<UniTableColumn> = [];

        if (this.mode === JournalEntryMode.Payment) {
            // Payment == "Innbetaling"
            debitAccountCol.setSkipOnEnterKeyNavigation(true);
            debitVatTypeCol.setSkipOnEnterKeyNavigation(true);
            creditAccountCol.setSkipOnEnterKeyNavigation(true);
            creditVatTypeCol.setSkipOnEnterKeyNavigation(true);
            descriptionCol.setSkipOnEnterKeyNavigation(true);

            defaultRowData.Description = 'Innbetaling';

            columns = [
                sameOrNewCol,
                invoiceNoCol,
                financialDateCol,
                debitAccountCol,
                creditAccountCol,
                deductionPercentCol,
                CurrencyCodeCol,
                amountCurrencyCol,
                amountCol,
                CurrencyExchangeRate,
                descriptionCol,
                fileCol
            ];
        } else {
            // Manual == "Bilagsregistrering"
            columns = [
                sameOrNewCol,
                financialDateCol,
                invoiceNoTextCol,
                debitAccountCol,
                debitVatTypeCol,
                creditAccountCol,
                creditVatTypeCol,
                deductionPercentCol,
                CurrencyCodeCol,
                amountCurrencyCol,
                amountCol,
                netAmountCol,
                CurrencyExchangeRate,
                projectCol,
                departmentCol,
                descriptionCol,
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

        this.journalEntryTableConfig = new UniTableConfig(true, false, 100)
            .setDefaultOrderBy('SameOrNewDetails', 0)
            .setColumns(columns)
            .setAutoAddNewRow(!this.disabled)
            .setMultiRowSelect(false)
            .setIsRowReadOnly((rowModel) => rowModel.StatusCode)
            .setContextMenu([
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
                    label: 'Registrer utbetaling'
                },
                {
                    action: (item: JournalEntryData) => this.showAgioDialog(item),
                    disabled: (item: JournalEntryData) => !item.CustomerInvoiceID,
                    label: 'Agio'
                }
            ])
            .setDefaultRowData(defaultRowData)
            .setColumnMenuVisible(true)
            .setAutoScrollIfNewCellCloseToBottom(true)
            .setChangeCallback((event) => {
                let rowModel = <JournalEntryData> event.rowModel;

                // get row from table - it may have been updated after the editor got it
                // because some of the events sometimes are async. Therefore, get the row
                // from the table, and reapply the changes made by this event
                let row = this.table.getRow(rowModel['_originalIndex']);

                row[event.field] = rowModel[event.field];
                // for some reason unitable returns rows as empty, but it is not,
                // so just set it to false
                row['_isEmpty'] = false;

                if (this.journalEntryID && !row.JournalEntryID) {
                    row.JournalEntryID = this.journalEntryID;
                }

                if (event.field === 'SameOrNewDetails' || !row.JournalEntryNo) {
                    let originalJournalEntryNo = row.JournalEntryNo;

                    this.setJournalEntryNumberProperties(row);

                    // Set FileIDs based on journalentryno - if it is the same as an existing, use that,
                    // if it has files but the journalentryno changed, clear the FileIDs for this journalentry
                    if (originalJournalEntryNo && originalJournalEntryNo !== row.JournalEntryNo && row.FileIDs && row.FileIDs.length > 0) {
                        // JournalEntryNo has changed and was previously set to something - clear FileIDs
                        row.FileIDs = null;
                    }

                    // if FileIDs is null, look if any other journalentrydata with the same number has any files attached
                    // and if so, attach those files to the journalentry
                    if (!originalJournalEntryNo || !row.FileIDs || row.FileIDs.length === 0) {
                        let data = this.table.getTableData();
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
                            .then(row => this.calculateAmount(row))
                            .then(row => this.calculateNetAmountAndNetAmountCurrency(row));
                    } else {
                        row = this.calculateAmount(row);
                        row = this.calculateNetAmountAndNetAmountCurrency(row);
                    }
                } else if (event.field === 'NetAmountCurrency') {
                    row = this.calculateGrossAmount(row);
                    row = this.calculateAmount(row);
                } else if (event.field === 'FinancialDate') {
                    if (this.mode === JournalEntryMode.Manual && row.CurrencyCode) {
                        rowOrPromise = this.getExternalCurrencyExchangeRate(row)
                            .then(row => this.setVatDeductionPercent(row))
                            .then(row => this.calculateNetAmountAndNetAmountCurrency(row))
                            .then(row => this.calculateAmount(row));
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

                        if (row.JournalEntryDataAccrual && row.JournalEntryDataAccrual.AccrualAmount !== row.NetAmountCurrency) {
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

    private showAgioDialog(journalEntryRow: JournalEntryData): Promise<JournalEntryData> {
        const customerInvoice = journalEntryRow.CustomerInvoice;
        return new Promise(res => {
            const invoiceData: InvoicePaymentData = {
                Amount: customerInvoice.RestAmount,
                AmountCurrency: customerInvoice.RestAmountCurrency,
                BankChargeAmount: 0,
                CurrencyCodeID: customerInvoice.CurrencyCodeID,
                CurrencyExchangeRate: 0,
                PaymentDate: new LocalDate(),
                AgioAccountID: 0,
                BankChargeAccountID: 0,
                AgioAmount: 0
            };
            const title =
                `Faktura nr: ${customerInvoice.InvoiceNumber},`
                + ` ${customerInvoice.RestAmount} ${this.companySettings.BaseCurrencyCode.Code}`;


            const updatedRow = this.registerPaymentModal.confirm(
                customerInvoice.ID,
                title,
                customerInvoice.CurrencyCode,
                customerInvoice.CurrencyExchangeRate,
                CustomerInvoice.EntityType,
                invoiceData
            )
                .then(modalResult => {
                    if (modalResult.status === ConfirmActions.ACCEPT) {

                        journalEntryRow.FinancialDate = modalResult.model.PaymentDate;

                        journalEntryRow.Amount = UniMath.round(customerInvoice.RestAmountCurrency * customerInvoice.CurrencyExchangeRate);
                        journalEntryRow.AmountCurrency = customerInvoice.RestAmountCurrency;
                        journalEntryRow.CurrencyExchangeRate = customerInvoice.CurrencyExchangeRate;


                        if (modalResult.model.AgioAmount !== 0 && modalResult.model.AgioAccountID) {
                            const debRow = this.createDebitRow(journalEntryRow, modalResult.model);
                            journalEntryRow.DebitAccount = null;
                            journalEntryRow.DebitAccountID = null;
                            this.createAgioRow(journalEntryRow, modalResult.model)
                                .then(agioRow => {
                                    this.addJournalEntryLines([debRow, agioRow]);
                                });
                        }
                    }
                    return journalEntryRow;
                });

            res(updatedRow);
        });
    }

    private createDebitRow(journalEntryData: JournalEntryData, invoicePaymentData: InvoicePaymentData): JournalEntryData {
        const debRow = new JournalEntryData();
        const invoice = journalEntryData.CustomerInvoice;

        debRow.SameOrNewDetails = journalEntryData.SameOrNewDetails;
        debRow.CustomerInvoice = invoice;
        debRow.SameOrNew = journalEntryData.SameOrNew;
        debRow.JournalEntryNo = journalEntryData.JournalEntryNo;
        debRow.InvoiceNumber = journalEntryData.InvoiceNumber;
        debRow.CustomerInvoice = journalEntryData.CustomerInvoice;
        debRow.CustomerInvoiceID = journalEntryData.CustomerInvoiceID;
        debRow.FinancialDate = journalEntryData.FinancialDate;
        debRow.Dimensions = journalEntryData.Dimensions;
        debRow.Description = journalEntryData.Description;


        debRow.Amount = invoicePaymentData.Amount;
        debRow.AmountCurrency = invoicePaymentData.AmountCurrency;
        debRow.VatDeductionPercent = journalEntryData.VatDeductionPercent;
        debRow.CurrencyCode = journalEntryData.CurrencyCode;
        debRow.CurrencyID = journalEntryData.CurrencyID;
        debRow.CurrencyExchangeRate = invoicePaymentData.CurrencyExchangeRate;
        debRow.DebitAccountID = journalEntryData.DebitAccountID;
        debRow.DebitAccount = journalEntryData.DebitAccount;
        return debRow;
    }

    private createAgioRow(journalEntryData: JournalEntryData, invoicePaymentData: InvoicePaymentData): Promise<JournalEntryData> {
        const agioRow = new JournalEntryData();
        const isCredit = invoicePaymentData.AgioAmount < 0;

        agioRow.SameOrNewDetails = journalEntryData.SameOrNewDetails;
        agioRow.CustomerInvoice = journalEntryData.CustomerInvoice;
        agioRow.SameOrNew = journalEntryData.SameOrNew;
        agioRow.JournalEntryNo = journalEntryData.JournalEntryNo;
        agioRow.FinancialDate = journalEntryData.FinancialDate;
        agioRow.Dimensions = journalEntryData.Dimensions;
        agioRow.Description = journalEntryData.Description;

        agioRow.Amount = Math.abs(invoicePaymentData.AgioAmount);
        agioRow.AmountCurrency = Math.abs(invoicePaymentData.AgioAmount);
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
                let accountNumberPart = searchValue.split(':')[0].trim();
                let accountNamePart = searchValue.split(':')[1].trim();

                copyPasteFilter = ` or (AccountNumber eq '${accountNumberPart}' and AccountName eq '${accountNamePart}')`;
            }

            filter = `Visible eq 'true' and (startswith(AccountNumber\,'${searchValue}') or contains(AccountName\,'${searchValue}')${copyPasteFilter} )`;
        }

        return this.accountService.searchAccounts(filter, searchValue !== '' ? 100 : 500);
    }

    private deleteLine(line) {
        this.confirmModal.confirm(
            'Er du sikker på at du vil slette linjen?',
            'Bekreft sletting',
            false,
            {accept: 'Slett linjen', reject: 'Avbryt'}
        )
        .then((response: ConfirmActions) => {
            if (response === ConfirmActions.ACCEPT) {
                this.table.removeRow(line._originalIndex);

                setTimeout(() => {
                    var tableData = this.table.getTableData();
                    this.dataChanged.emit(tableData);
                });
            }
        });
    }

    private openAccrual(item: JournalEntryData) {

        let title: string = 'Periodisering av bilag ' + item.JournalEntryNo;
        if (item.Description) title = title + ' - ' + item.Description;

        let isDebitResultAccount = (item.DebitAccount && item.DebitAccount.TopLevelAccountGroup
            && item.DebitAccount.TopLevelAccountGroup.GroupNumber >= 3);
        let isCreditResultAccount = (item.CreditAccount && item.CreditAccount.TopLevelAccountGroup
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
                this.accrualModal.openModal(null, null, null, item.JournalEntryDataAccrual, title);
            } else if (item.AmountCurrency && item.AmountCurrency !== 0 && item.FinancialDate) {
                this.accrualModal.openModal(item['NetAmountCurrency'],
                    new LocalDate(item.FinancialDate.toString()), null, null, title);
            } else {
                this.toastService.addToast('Periodisering', ToastType.warn, 5,
                    'Mangler nødvendig informasjon om dato og beløp for å kunne periodisere.');
            }

            if (this.accrualModalValueChanged) {
                this.accrualModalValueChanged.unsubscribe();
            }

            if (this.accrualModalValueDeleted) {
                this.accrualModalValueDeleted.unsubscribe();
            }

            this.accrualModalValueChanged = this.accrualModal.Changed.subscribe(modalval => {
                item.JournalEntryDataAccrual = modalval;
                // if the item is already booked, just add the payment through the API now
                /* if (item.StatusCode) {
                    this.journalEntryService.LEGGTILBETALING()
                    DETTE GJØRES MÅ GJØRES I NESTE SPRINT, TAS SAMTIDIG SOM FUNKSJON FOR Å REGISTRERE MER PÅ ET EKSISTERENDE BILAG
                    https://github.com/unimicro/AppFrontend/issues/2432
                }
                */
                this.table.updateRow(item['_originalIndex'], item);
                setTimeout(() => {
                    var tableData = this.table.getTableData();
                    this.dataChanged.emit(tableData);
                });
            });

            this.accrualModalValueDeleted = this.accrualModal.Deleted.subscribe(modalval => {
                item.JournalEntryDataAccrual = null;
                this.table.updateRow(item['_originalIndex'], item);
                setTimeout(() => {
                    var tableData = this.table.getTableData();
                    this.dataChanged.emit(tableData);
                });
            });
        }
    }

    private addPayment(item: JournalEntryData) {
        let title: string = 'Legg til betaling';
        let payment: Payment = null;
        if (item.JournalEntryPaymentData && item.JournalEntryPaymentData.PaymentData) {
            payment = item.JournalEntryPaymentData.PaymentData;
            title = 'Endre betaling';
            this.addPaymentModal.openModal(payment, title);
        } else {
            // generate suggestion for payment based on accounts used in item
            payment = new Payment();
            payment.AmountCurrency = item.AmountCurrency;

            new Promise((resolve) => {
                // try to set businessrelation based on selected accounts
                if ((item.DebitAccount && item.DebitAccount.CustomerID)
                    || (item.CreditAccount && item.CreditAccount.CustomerID)) {

                    let customerID = item.DebitAccount && item.DebitAccount.CustomerID
                                        ? item.DebitAccount.CustomerID
                                        : item.CreditAccount.CustomerID;

                    // get businessrelation and default account based on customerid
                    this.statisticsService.GetAll(`model=Customer&expand=Info.DefaultBankAccount&filter=Customer.ID eq ${customerID}&select=DefaultBankAccount.ID as DefaultBankAccountID,DefaultBankAccount.AccountNumber as DefaultBankAccountAccountNumber,Info.Name as BusinessRelationName,Info.ID as BusinessRelationID`)
                        .map(data => data.Data ? data.Data : [])
                        .subscribe(brdata => {
                            if (brdata && brdata.length > 0) {
                                let br = brdata[0];
                                payment.BusinessRelationID = br.BusinessRelationID;
                                payment.BusinessRelation = this.getBusinessRelationDataFromStatisticsSearch(br);
                                resolve();
                            }
                        },
                        err => this.errorService.handle(err)
                    );
                } else if ((item.DebitAccount && item.DebitAccount.SupplierID)
                    || (item.CreditAccount && item.CreditAccount.SupplierID)) {
                    let supplierID = item.DebitAccount && item.DebitAccount.SupplierID
                                        ? item.DebitAccount.SupplierID
                                        : item.CreditAccount.SupplierID;

                    // get businessrelation and default account based on supplierid
                    this.statisticsService.GetAll(`model=Supplier&expand=Info.DefaultBankAccount&filter=Supplier.ID eq ${supplierID}&select=DefaultBankAccount.ID as DefaultBankAccountID,DefaultBankAccount.AccountNumber as DefaultBankAccountAccountNumber,Info.Name as BusinessRelationName,Info.ID as BusinessRelationID`)
                        .map(data => data.Data ? data.Data : [])
                        .subscribe(brdata => {
                            if (brdata && brdata.length > 0) {
                                let br = brdata[0];
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

                // we dont know what date to use, so just set the items financial date a suggestion
                payment.PaymentDate = item.FinancialDate;
                payment.DueDate = item.FinancialDate;

                this.addPaymentModal.openModal(payment, title);

                if (this.paymentModalValueChanged) {
                    this.paymentModalValueChanged.unsubscribe();
                }

                this.paymentModalValueChanged = this.addPaymentModal.Changed.subscribe(modalval => {
                    if (!item.JournalEntryPaymentData) {
                        item.JournalEntryPaymentData = {
                            PaymentData: modalval
                        };
                    } else {
                        item.JournalEntryPaymentData.PaymentData = modalval;
                    }

                    // if the item is already booked, just add the payment through the API now
                    /* if (item.StatusCode) {
                        this.journalEntryService.LEGGTILBETALING()
                        DETTE GJØRES MÅ GJØRES I NESTE SPRINT, TAS SAMTIDIG SOM FUNKSJON FOR Å REGISTRERE MER PÅ ET EKSISTERENDE BILAG
                        https://github.com/unimicro/AppFramework/issues/2536
                    }
                    */
                    this.table.updateRow(item['_originalIndex'], item);
                });
            });
        }
    }

    private getBusinessRelationDataFromStatisticsSearch(statisticsdata): BusinessRelation {
        let br = new BusinessRelation();
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

    private setupSameNewAlternatives() {

        if (this.journalEntryTableConfig
            && this.journalEntryTableConfig.columns
            && this.journalEntryTableConfig.columns.length > 0
            && this.journalEntryTableConfig.columns[0].field === 'SameOrNewDetails') {

            if (this.journalEntryID && this.journalEntryLines && this.journalEntryLines.length > 0) {
                // if this is an existing journalentry, dont allow selecting "new" as an option for journalentryno
                this.journalEntryNumberAlternatives = [];
                this.journalEntryNumberAlternatives.push({
                    ID: this.journalEntryLines[0].JournalEntryNo,
                    Name: this.journalEntryLines[0].JournalEntryNo
                });

            } else if (this.firstAvailableJournalEntryNumber
                && this.firstAvailableJournalEntryNumber !== '') {

                this.journalEntryNumberAlternatives = [];

                let currentRow: any;

                // add list of possible numbers from start to end if we have any table data
                if (this.table) {
                    currentRow = this.table.getCurrentRow();
                    let tableData = this.table.getTableData();

                    if (tableData.length > 0) {
                        let range = this.journalEntryService.findJournalNumbersFromLines(tableData);
                        if (range) {
                            this.lastUsedJournalEntryNumber = range.lastNumber;
                            this.firstAvailableJournalEntryNumber = range.nextNumber;

                            for (let i = 0; i <= (range.last - range.first); i++) {
                                let jn = `${i + range.first}-${range.year}`;
                                this.journalEntryNumberAlternatives.push({ID: jn, Name: jn});
                            }
                        }
                    }
                }

                // new always last one
                this.journalEntryNumberAlternatives.push(this.newAlternative);
            }

            // update editor with new options
            this.journalEntryTableConfig.columns[0].editorOptions.resource = this.journalEntryNumberAlternatives;
        }
    }

    public postJournalEntryData(completeCallback) {
        let tableData = this.table.getTableData();

        this.journalEntryService.postJournalEntryData(tableData)
            .subscribe(data => {
                var firstJournalEntry = data[0];
                var lastJournalEntry = data[data.length - 1];

                // Validate if journalEntry number has changed
                var numbers = this.journalEntryService.findJournalNumbersFromLines(tableData);

                if (firstJournalEntry.JournalEntryNumber !== numbers.firstNumber ||
                    lastJournalEntry.JournalEntryNumber !== numbers.lastNumber) {
                    this.toastService.addToast('Lagring var vellykket, men merk at tildelt bilagsnummer er ' + firstJournalEntry.JournalEntryNumber + ' - ' + lastJournalEntry.JournalEntryNumber, ToastType.warn);

                } else {
                    this.toastService.addToast('Lagring var vellykket. Bilagsnr: ' + firstJournalEntry.JournalEntryNumber + (firstJournalEntry.JournalEntryNumber !== lastJournalEntry.JournalEntryNumber ? ' - ' + lastJournalEntry.JournalEntryNumber : ''), ToastType.good, 10);
                }

                completeCallback('Lagret og bokført');

                // Empty list
                this.journalEntryLines = new Array<JournalEntryData>();

                let journalentrytoday: JournalEntryData = new JournalEntryData();
                journalentrytoday.FinancialDate = this.currentFinancialYear.ValidFrom;
                this.journalEntryService.getNextJournalEntryNumber(journalentrytoday)
                    .subscribe(numberdata => {
                        this.firstAvailableJournalEntryNumber = numberdata;
                        this.setupSameNewAlternatives();

                        if (this.table) {
                            this.table.focusRow(0);
                        }
                    },
                    err => this.errorService.handle(err)
                );

                this.dataChanged.emit(this.journalEntryLines);
            },
            err => {
                completeCallback('');
                this.errorService.handle(err);
            }
        );
    }

    public removeJournalEntryData(completeCallback, isDirty) {
        if (isDirty) {
            this.confirmModal.confirm(
                'Er du sikker på at du vil forkaste alle endringene dine?',
                'Forkaste endringer?',
                false,
                {accept: 'Forkast endringer', reject: 'Avbryt'})
            .then((response: ConfirmActions) => {
                if (response === ConfirmActions.ACCEPT) {
                    this.clearListInternal(completeCallback);
                } else {
                    completeCallback(null);
                }
            });
        } else {
            this.clearListInternal(completeCallback);
        }
    }

    private clearListInternal(completeCallback: (msg: string) => void) {
        this.journalEntryLines = new Array<JournalEntryData>();
        this.dataChanged.emit(this.journalEntryLines);

        let journalentrytoday: JournalEntryData = new JournalEntryData();
        journalentrytoday.FinancialDate = this.currentFinancialYear.ValidFrom;
        this.journalEntryService.getNextJournalEntryNumber(journalentrytoday)
            .subscribe(data => {
                this.firstAvailableJournalEntryNumber = data;
                this.setupSameNewAlternatives();

                if (this.table) {
                    this.table.focusRow(0);
                }
            },
            err => this.errorService.handle(err)
        );

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
        let newItems = this.table.getTableData();

        lines.forEach(line => {
            line.JournalEntryNo = this.lastUsedJournalEntryNumber ? this.lastUsedJournalEntryNumber : this.firstAvailableJournalEntryNumber;
            line.SameOrNew = line.JournalEntryNo;
            newItems.push(line);
        });

        // Use JSON parse/stringify because UniTable reacts to data in different formats (object vs JournalEntryData objects).
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

    private onColumnVisibilityChange(columns: UniTableColumn[]) {
        this.columnVisibilityChange.emit(columns.filter(c => c.visible).map(c => c.field));
    }

    private onRowSelected(event) {
        if (this.doShowImage) {
            this.showImageForJournalEntry.emit(event.rowModel);
        }

        this.rowSelected.emit(event.rowModel);
    }

    private rowChanged(event) {
        var tableData = this.table.getTableData();
        this.dataChanged.emit(tableData);
    }

    public getTableData() {
        return this.table.getTableData();
    }
}
