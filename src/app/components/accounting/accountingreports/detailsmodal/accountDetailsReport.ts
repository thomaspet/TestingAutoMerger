import {Component, ViewChild, Input} from '@angular/core';
import {URLSearchParams, Response} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import {PeriodFilter, PeriodFilterHelper} from '../periodFilter/periodFilter';
import {UniTableColumn, UniTableConfig, UniTableColumnType, UniTable} from 'unitable-ng2/main';
import {DistributionPeriodReportPart} from '../reportparts/distributionPeriodReportPart';
import {JournalEntryLine, JournalEntry} from '../../../../unientities';
import {ImageModal} from '../../../common/modals/ImageModal';
import {IToolbarConfig} from './../../../common/toolbar/toolbar';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {FieldType} from 'uniform-ng2/main';
import {FinancialYear, Account} from '../../../../unientities';
import {ToastService, ToastType} from '../../../../../framework/uniToast/toastService';
import {
    StatisticsService,
    DimensionService,
    ErrorService,
    FinancialYearService,
    AccountService,
} from '../../../../services/services';
import * as moment from 'moment';

const PAPERCLIP = '📎'; // It might look empty in your editor, but this is the unicode paperclip

@Component({
    selector: 'accounting-details-report',
    templateUrl: './accountDetailsReport.html',
})
export class AccountDetailsReport {
    @Input() public config: { close: () => void, modalMode: boolean, accountID: number, accountNumber: number, accountName: string, dimensionType: number, dimensionId: number };
    @ViewChild(ImageModal) private imageModal: ImageModal;
    @ViewChild(UniTable) private transactionsTable: UniTable;
    @ViewChild(DistributionPeriodReportPart) private distributionPeriodReportPart: DistributionPeriodReportPart;

    private uniTableConfigTransactions$: BehaviorSubject<UniTableConfig> = new BehaviorSubject<UniTableConfig>(null);

    private searchParams$: BehaviorSubject<any> = new BehaviorSubject({});
    private config$: BehaviorSubject<any> = new BehaviorSubject({});
    private fields$: BehaviorSubject<any[]> = new BehaviorSubject([]);
    private financialYears: Array<FinancialYear> = null;
    private activeFinancialYear: FinancialYear;

    private periodFilter1$: BehaviorSubject<PeriodFilter> = new BehaviorSubject<PeriodFilter>(null);
    private periodFilter2$: BehaviorSubject<PeriodFilter> = new BehaviorSubject<PeriodFilter>(null);
    private accountIDs: Array<number> = [];
    private includeIncomingBalanceInDistributionReport$: BehaviorSubject<boolean> = new BehaviorSubject(false);

    private dimensionEntityName: string;

    private transactionsLookupFunction: (urlParams: URLSearchParams) => any;
    private doTurnDistributionAmounts$: BehaviorSubject<boolean> = new BehaviorSubject(false);

    private toolbarconfig: IToolbarConfig;

    constructor(private statisticsService: StatisticsService,
                private errorService: ErrorService,
                private financialYearService: FinancialYearService,
                private accountService: AccountService,
                private toastService: ToastService) {

       this.config = {
            close: () => {},
            modalMode: false,
            accountID: 0,
            accountNumber: 0,
            accountName: '',
            dimensionId: 0,
            dimensionType: 0
        };

        this.periodFilter1$.next(PeriodFilterHelper.getFilter(1, null));
        this.periodFilter2$.next(PeriodFilterHelper.getFilter(2, this.periodFilter1$.getValue()));

        this.fields$.next(this.getLayout().Fields);

        this.transactionsLookupFunction =
            (urlParams: URLSearchParams) => this.getTableData(urlParams)
                .catch((err, obs) => this.errorService.handleRxCatch(err, obs));

        this.setupTransactionsTable();

        Observable.forkJoin(
            this.financialYearService.GetAll('orderby=Year desc'),
            this.financialYearService.getActiveFinancialYear()
        ).subscribe(data => {
            this.financialYears = data[0];
            this.activeFinancialYear = data[1];

            // set default value for filtering
            let searchParams = {
                AccountID: null,
                AccountNumber: null,
                AccountYear: null
            };

            if (this.activeFinancialYear) {
                searchParams.AccountYear = this.activeFinancialYear.Year;
            }

            this.searchParams$.next(searchParams);
        });
    }

    public ngOnInit() {
        if (!this.config.modalMode) {
            this.updateToolbar();
            this.loadData();
        } else {
            this.doTurnAndInclude();
        }
    }

    public doTurnAndInclude() {
        // "turn" amounts for accountgroup 2 and 3, because it will be confusing for the users when these amounts are
        // displayed as negative numbers (which they will usually be)
        this.doTurnDistributionAmounts$.next(this.config.accountNumber.toString().substring(0, 1) === '2' || this.config.accountNumber.toString().substring(0, 1) === '3');

        // include incoming balance for balance accounts
        this.includeIncomingBalanceInDistributionReport$.next(this.config.accountNumber.toString().substring(0, 1) === '1' || this.config.accountNumber.toString().substring(0, 1) === '2');
    }

    public updateToolbar() {
        let toolbarconfig: IToolbarConfig = {
            title: 'Forespørsel konto',
            subheads: [
            ],
            navigation: {
                prev: this.previous.bind(this),
                next: this.next.bind(this)
            }
        };

        this.toolbarconfig = toolbarconfig;
    }

    public previous() {
        this.accountService.searchAccounts('AccountNumber lt ' + this.config.accountNumber, 1, 'AccountNumber desc').subscribe(data => {
            if (data.length > 0) {
                let account = data[0];
                this.config.accountID = account.ID;
                this.config.accountName = account.AccountName;
                this.config.accountNumber = account.AccountNumber;
                this.loadData();
            } else {
                this.toastService.addToast('Første konto', ToastType.warn, 5, 'Du har nådd Første konto');
            }
        });
    }

    public next() {
        this.accountService.searchAccounts('AccountNumber gt ' + this.config.accountNumber, 1).subscribe(data => {
            if (data.length > 0) {
                let account = data[0];
                this.config.accountID = account.ID;
                this.config.accountName = account.AccountName;
                this.config.accountNumber = account.AccountNumber;
                this.loadData();
            } else {
                this.toastService.addToast('Siste konto', ToastType.warn, 5, 'Du har nådd siste konto');
            }
        });
    }

    // modal is reused if multiple accounts are viewed, and the loadData will be called from the accountDetailsReportModal
    // when opening the modal
    public loadData() {
        // get default period filters
        this.periodFilter1$.next(PeriodFilterHelper.getFilter(1, null));
        this.periodFilter2$.next(PeriodFilterHelper.getFilter(2, this.periodFilter1$.getValue()));
        this.accountIDs = [this.config.accountID];

        if (this.config.dimensionType && this.config.dimensionId) {
             this.dimensionEntityName = DimensionService.getEntityNameFromDimensionType(this.config.dimensionType);
        } else {
            this.dimensionEntityName = null;
        }

        this.doTurnAndInclude();
    }

    private getTableData(urlParams: URLSearchParams): Observable<Response> {
        urlParams = urlParams || new URLSearchParams();
        const filtersFromUniTable = urlParams.get('filter');
        const filters = filtersFromUniTable ? [filtersFromUniTable] : [];

        filters.push(`JournalEntryLine.AccountID eq ${this.config.accountID}`);
        filters.push(`Period.AccountYear eq ${this.periodFilter1$.getValue().year}`);
        filters.push(`Period.No ge ${this.periodFilter1$.getValue().fromPeriodNo}`);
        filters.push(`Period.No le ${this.periodFilter1$.getValue().toPeriodNo}`);

        if (this.dimensionEntityName) {
            filters.push(`isnull(Dimensions.${this.dimensionEntityName}ID,0) eq ${this.config.dimensionId}`);
        }

        urlParams.set('model', 'JournalEntryLine');

        urlParams.set('select',
            'ID as ID,' +
            'JournalEntryNumber as JournalEntryNumber,' +
            'FinancialDate,' +
            'Description as Description,' +
            'VatType.VatCode,' +
            'Amount as Amount,' +
            'Department.Name,' +
            'Project.Name,' +
            'Department.DepartmentNumber,' +
            'Project.ProjectNumber,' +
            'JournalEntryID as JournalEntryID,' +
            'ReferenceCreditPostID as ReferenceCreditPostID,' +
            'OriginalReferencePostID as OriginalReferencePostID,' +
            'sum(casewhen(FileEntityLink.EntityType eq \'JournalEntry\'\\,1\\,0)) as Attachments');

        urlParams.set('expand', 'Account,VatType,Dimensions.Department,Dimensions.Project,Period');
        urlParams.set('join', 'JournalEntryLine.JournalEntryID eq FileEntityLink.EntityID');
        urlParams.set('filter', filters.join(' and '));
        urlParams.set('orderby', urlParams.get('orderby') || 'JournalEntryID desc');

        return this.statisticsService.GetAllByUrlSearchParams(urlParams);
    }

    private setupLookupTransactions() {
        this.transactionsLookupFunction =
            (urlParams: URLSearchParams) => this.getTableData(urlParams)
                .catch((err, obs) => this.errorService.handleRxCatch(err, obs));
    }

    private switchPeriods() {
        let tmp = this.periodFilter1$.getValue();
        this.periodFilter1$.next(this.periodFilter2$.getValue());
        this.periodFilter2$.next(tmp);
        this.setupLookupTransactions();
    }

    private setupTransactionsTable() {

        let columns = [
            new UniTableColumn('JournalEntryNumber', 'Bilagsnr')
                    .setFilterOperator('contains'),
                new UniTableColumn('FinancialDate', 'Regnskapsdato', UniTableColumnType.LocalDate)
                    .setFilterOperator('contains')
                    .setFormat('DD.MM.YYYY')
                    .setTemplate(line => line.JournalEntryLineFinancialDate),
                new UniTableColumn('Description', 'Beskrivelse', UniTableColumnType.Text)
                    .setFilterOperator('contains'),
                new UniTableColumn('VatType.VatCode', 'Mvakode', UniTableColumnType.Text)
                    .setFilterOperator('eq')
                    .setTemplate(line => line.VatTypeVatCode),
                new UniTableColumn('Amount', 'Beløp', UniTableColumnType.Money)
                    .setCls('column-align-right')
                    .setFilterOperator('eq'),
                new UniTableColumn('Department.Name', 'Avdeling', UniTableColumnType.Text).setFilterOperator('contains')
                    .setTemplate(line => { return line.DepartmentDepartmentNumber ? line.DepartmentDepartmentNumber + ': ' + line.DepartmentName : ''; }),
                new UniTableColumn('Project.Name', 'Prosjekt', UniTableColumnType.Text).setFilterOperator('contains')
                    .setTemplate(line => { return line.ProjectProjectNumber ? line.ProjectProjectNumber + ': ' + line.ProjectName : ''; }),
                new UniTableColumn('ID', PAPERCLIP, UniTableColumnType.Text)
                    .setTemplate(line => line.Attachments ? PAPERCLIP : '')
                    .setWidth('40px')
                    .setFilterable(false)
                    .setOnCellClick(line => this.imageModal.open(JournalEntry.EntityType, line.JournalEntryID))
        ];

        columns.forEach(x => {
            x.conditionalCls = (data) => {
                return data.ReferenceCreditPostID || data.OriginalReferencePostID ? 'journal-entry-credited' : '';
            };
        });

        this.uniTableConfigTransactions$.next(new UniTableConfig(false, false)
            .setPageable(true)
            .setPageSize(20)
            .setSearchable(true)
            .setDataMapper((data) => {
                let tmp = data !== null ? data.Data : [];

                return tmp;
            })
            .setColumns(columns));
    }

    private rowSelected(row) {
        if (row.periodNo < 13) {
            let today = moment(new Date());
            var filter = this.periodFilter1$.getValue();
            var filter2 = this.periodFilter2$.getValue();
            filter.fromPeriodNo = row.periodNo;
            filter.toPeriodNo = row.periodNo;
            filter.year = today.year();
            filter.name = PeriodFilterHelper.getFilterName(filter);
            this.periodFilter1$.next(filter);
            this.periodFilter2$.next(PeriodFilterHelper.getFilter(row.periodNo, filter));
        } else { // Default filter if clicking on total
            this.periodFilter1$.next(PeriodFilterHelper.getFilter(1, null));
            this.periodFilter2$.next(PeriodFilterHelper.getFilter(12, this.periodFilter1$.getValue(), true));
        }

        this.setupLookupTransactions();
//        this.transactionsTable.refreshTableData();
    }

    private onFormFilterChange(event) {
        let search = this.searchParams$.getValue();
        if (search.AccountID) {
            this.accountService.Get(search.AccountID).subscribe((account: Account) => {
                this.config.accountID = account.ID;
                this.config.accountName = account.AccountName;
                this.config.accountNumber = account.AccountNumber;

                search.AccountID = 0;
                search.AccountNumber = 0;
                this.searchParams$.next(search);
                this.loadData();
            });
        }
    }

    private getLayout() {
        return {
            Name: 'AccountqueryList',
            BaseEntity: 'Account',
            StatusCode: 0,
            Deleted: false,
            ID: 1,
            CustomFields: null,
            Fields: [
                {
                    Property: 'AccountID',
                    Placement: 4,
                    FieldType: FieldType.AUTOCOMPLETE,
                    Label: 'Konto',
                    Deleted: false,
                    Options: {
                        getDefaultData: () => {
                            let searchParams = this.searchParams$.getValue();
                            if (searchParams.AccountID) {
                                return this.accountService.searchAccounts(`ID eq ${searchParams.AccountID}`);
                            } else if (searchParams.AccountNumber) {
                                return this.accountService.searchAccounts(`AccountNumber eq ${searchParams.AccountNumber}`);
                            }
                            return Observable.of([]);
                        },
                        search: (query: string) => this.accountService.searchAccounts(`( ( AccountNumber eq '${query}') or (Visible eq 'true' and (startswith(AccountNumber,'${query}') or contains(AccountName,'${query}') ) ) ) and isnull(AccountID,0) eq 0`),
                        valueProperty: 'ID',
                        template: (account: Account) => account ? `${account.AccountNumber}: ${account.AccountName}` : '',
                        minLength: 1,
                        debounceTime: 200
                    }
                }
            ]
        };
    }
}
