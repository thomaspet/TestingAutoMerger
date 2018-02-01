import {Component, Input} from '@angular/core';
import {URLSearchParams, Response} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import {PeriodFilter, PeriodFilterHelper} from '../periodFilter/periodFilter';
import {
    UniTableColumn,
    UniTableConfig,
    UniTableColumnType,
    ICellClickEvent
} from '../../../../../framework/ui/unitable/index';
import {JournalEntry} from '../../../../unientities';
import {ImageModal} from '../../../common/modals/ImageModal';
import {UniModalService} from '../../../../../framework/uniModal/barrel';
import {IToolbarConfig} from './../../../common/toolbar/toolbar';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {FieldType} from '../../../../../framework/ui/uniform/index';
import {FinancialYear, Account} from '../../../../unientities';
import {ToastService, ToastType} from '../../../../../framework/uniToast/toastService';
import {UniSearchAccountConfig} from '../../../../services/common/uniSearchConfig/uniSearchAccountConfig';
import {TabService, UniModules} from '../../../layout/navbar/tabstrip/tabService';
import {
    StatisticsService,
    DimensionService,
    ErrorService,
    FinancialYearService,
    AccountService,
} from '../../../../services/services';

const PAPERCLIP = '📎'; // It might look empty in your editor, but this is the unicode paperclip

declare var _;

@Component({
    selector: 'accounting-details-report',
    templateUrl: './accountDetailsReport.html',
})
export class AccountDetailsReport {
    @Input()
    public config: {
        close: () => void,
        modalMode: boolean,
        accountID: number,
        accountNumber: number,
        accountName: string,
        dimensionType: number,
        dimensionId: number,
        isSubAccount: boolean

    };

    private uniTableConfigTransactions$: BehaviorSubject<UniTableConfig> = new BehaviorSubject<UniTableConfig>(null);

    private searchParams$: BehaviorSubject<any> = new BehaviorSubject({});
    private config$: BehaviorSubject<any> = new BehaviorSubject({autofocus: true}); // tslint:disable-line
    private fields$: BehaviorSubject<any[]> = new BehaviorSubject([]);
    private financialYears: Array<FinancialYear> = null;
    private activeFinancialYear: FinancialYear;

    private periodFilter1$: BehaviorSubject<PeriodFilter> = new BehaviorSubject<PeriodFilter>(null);
    private periodFilter2$: BehaviorSubject<PeriodFilter> = new BehaviorSubject<PeriodFilter>(null);
    private periodFilter3$: BehaviorSubject<PeriodFilter> = new BehaviorSubject<PeriodFilter>(null);
    private accountIDs: Array<number> = [];
    private subAccountIDs: Array<number> = [];
    private includeIncomingBalanceInDistributionReport$: BehaviorSubject<boolean> = new BehaviorSubject(false);

    private dimensionEntityName: string;

    private transactionsLookupFunction: (urlParams: URLSearchParams) => any;
    private doTurnDistributionAmounts$: BehaviorSubject<boolean> = new BehaviorSubject(false);

    private toolbarconfig: IToolbarConfig;

    constructor(
        private statisticsService: StatisticsService,
        private errorService: ErrorService,
        private financialYearService: FinancialYearService,
        private accountService: AccountService,
        private toastService: ToastService,
        private uniSearchAccountConfig: UniSearchAccountConfig,
        private tabService: TabService,
        private modalService: UniModalService,
        private periodFilterHelper: PeriodFilterHelper,
    ) {

        this.config = {
            close: () => {},
            modalMode: false,
            accountID: 0,
            isSubAccount: false,
            accountNumber: 0,
            accountName: '',
            dimensionId: 0,
            dimensionType: 0
        };

        this.periodFilter1$.next(this.periodFilterHelper.getFilter(1, null));
        this.periodFilter2$.next(this.periodFilterHelper.getFilter(2, this.periodFilter1$.getValue()));
        this.periodFilter3$.next(this.periodFilterHelper.getFilter(1, null));

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
            this.addTab();

            this.accountService.searchAccounts('Visible eq 1', 1).subscribe(data => {
                const account = data[0];
                this.setAccountConfig(account);

                const searchparams = this.searchParams$.getValue();
                searchparams.AccountID = account.ID;
                searchparams.AccountNumber = account.AccountNumber;
                this.searchParams$.next(searchparams);
                this.loadData();
            });
        } else {
            this.loadData();
        }
    }

    private setAccountConfig(account: Account) {
        this.config.accountID = account.ID;
        this.config.accountName = account.AccountName;
        this.config.accountNumber = account.AccountNumber;
        this.config.isSubAccount = account.AccountID > 0;
    }


    public doTurnAndInclude() {
        // "turn" amounts for accountgroup 2 and 3, because it will be confusing for the users when these amounts are
        // displayed as negative numbers (which they will usually be)
        this.doTurnDistributionAmounts$
            .next(this.config.accountNumber.toString().substring(0, 1) === '2'
                || this.config.accountNumber.toString().substring(0, 1) === '3');

        // include incoming balance for balance accounts
        this.includeIncomingBalanceInDistributionReport$
            .next(this.config.accountNumber.toString().substring(0, 1) === '1'
                || this.config.accountNumber.toString().substring(0, 1) === '2');
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

    public addTab() {
        this.tabService.addTab({
            name: 'Forespørsel konto',
            url: '/accounting/accountquery',
            moduleID: UniModules.AccountQuery,
            active: true
        });
    }

    public previous() {
        this.accountService
            .searchAccounts('Visible eq 1 and AccountNumber lt ' + this.config.accountNumber, 1, 'AccountNumber desc')
            .subscribe(data => {
                if (data.length > 0) {
                    const account = data[0];
                    this.setAccountConfig(account);

                    const searchParams = this.searchParams$.getValue();
                    searchParams.AccountID = account.ID;
                    searchParams.AccountNumber = account.AccountNumber;
                    this.searchParams$.next(searchParams);

                    this.loadData();
                    this.setupLookupTransactions();
                } else {
                    this.toastService.addToast('Første konto', ToastType.warn, 5, 'Du har nådd Første konto');
                }
            });
    }

    public next() {
        this.accountService
            .searchAccounts('Visible eq 1 and AccountNumber gt ' + this.config.accountNumber, 1)
            .subscribe(data => {
                if (data.length > 0) {
                    const account = data[0];
                    this.setAccountConfig(account);

                    const searchParams = this.searchParams$.getValue();
                    searchParams.AccountID = account.ID;
                    searchParams.AccountNumber = account.AccountNumber;
                    this.searchParams$.next(searchParams);

                    this.loadData();
                    this.setupLookupTransactions();
                } else {
                    this.toastService.addToast('Siste konto', ToastType.warn, 5, 'Du har nådd siste konto');
                }
            });
    }

    // modal is reused if multiple accounts are viewed, and the
    // loadData will be called from the accountDetailsReportModal when opening the modal
    public loadData() {
        // get default period filters
        this.periodFilter1$.next(this.periodFilterHelper.getFilter(1, null));
        this.periodFilter2$.next(this.periodFilterHelper.getFilter(2, this.periodFilter1$.getValue()));
        this.periodFilter3$.next(this.periodFilterHelper.getFilter(1, null));

        this.accountIDs = this.config.isSubAccount === true ? null : [this.config.accountID];
        this.subAccountIDs = this.config.isSubAccount ? [this.config.accountID] : null;

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


        if (this.config.isSubAccount) {
        filters.push(`JournalEntryLine.SubAccountID eq ${this.config.accountID}`);
        } else {
            filters.push(`JournalEntryLine.AccountID eq ${this.config.accountID}`);
        }

        filters.push(`Period.AccountYear eq ${this.periodFilter3$.getValue().year}`);
        filters.push(`Period.No ge ${this.periodFilter3$.getValue().fromPeriodNo}`);
        filters.push(`Period.No le ${this.periodFilter3$.getValue().toPeriodNo}`);

        if (this.dimensionEntityName) {
            filters.push(`isnull(Dimensions.${this.dimensionEntityName}ID,0) eq ${this.config.dimensionId}`);
        }

        urlParams.set('model', 'JournalEntryLine');

        urlParams.set('select',
            'ID as ID,' +
            'JournalEntryNumber as JournalEntryNumber,' +
            'FinancialDate,' +
            'AmountCurrency as AmountCurrency,' +
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

        urlParams.set('expand', 'Account,SubAccount,VatType,Dimensions.Department,Dimensions.Project,Period');
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

    public switchPeriods() {
        const tmp = this.periodFilter1$.getValue();
        this.periodFilter1$.next(this.periodFilter2$.getValue());
        this.periodFilter2$.next(tmp);
        this.periodFilter3$.next(this.periodFilter2$.getValue());
        this.setupLookupTransactions();
    }

    public onCellClick(event: ICellClickEvent) {
        if (event.column.field === 'ID') {
            const data = {
                entity: JournalEntry.EntityType,
                entityID: event.row.JournalEntryID

            };
            this.modalService.open(ImageModal, { data: data });
        }
    }

    private setupTransactionsTable() {
        const journalEntryNumberCol = new UniTableColumn('JournalEntryNumber', 'Bilagsnr')
            .setFilterOperator('contains');

        if (!this.config || !this.config.modalMode) {
            journalEntryNumberCol.setLinkResolver(row => {
                return `/accounting/transquery/details;JournalEntryNumber=${row.JournalEntryNumber}`;
            });
        }

        const columns = [
            journalEntryNumberCol,
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
            new UniTableColumn('AmountCurrency', 'Valutabeløp', UniTableColumnType.Money)
            .setCls('column-align-right')
            .setFilterOperator('eq'),
            new UniTableColumn('Department.Name', 'Avdeling', UniTableColumnType.Text)
                .setFilterOperator('contains')
                .setTemplate(line => { return line.DepartmentDepartmentNumber
                    ? line.DepartmentDepartmentNumber + ': ' + line.DepartmentName : ''; }),
            new UniTableColumn('Project.Name', 'Prosjekt', UniTableColumnType.Text)
                .setFilterOperator('contains')
                .setTemplate(line => { return line.ProjectProjectNumber
                    ? line.ProjectProjectNumber + ': ' + line.ProjectName : ''; }),
            new UniTableColumn('ID', PAPERCLIP, UniTableColumnType.Text)
                .setTemplate(line => line.Attachments ? PAPERCLIP : '')
                .setWidth('40px')
                .setFilterable(false)
        ];

        const tableName = 'accounting.accountingreports.detailsmodal';
        this.uniTableConfigTransactions$.next(new UniTableConfig(tableName, false, false)
            .setPageable(true)
            .setPageSize(20)
            .setSearchable(true)
            .setConditionalRowCls(row => {
                if (row.ReferenceCreditPostID || row.OriginalReferencePostID) {
                    return 'journal-entry-credited';
                }
            })
            .setDataMapper((data) => {
                const tmp = data !== null ? data.Data : [];
                return tmp;
            })
            .setColumns(columns));
    }

    public periodSelected(row) {
        const filter = new PeriodFilter();
        if (row.periodNo === 0) {
            this.toastService.addToast(
                'Ikke støttet',
                ToastType.warn,
                3,
                'Drilldown på inngående balanse ikke støttet');
            return;
        } else if (row.periodNo < 13) {
            filter.fromPeriodNo = row.periodNo;
            filter.toPeriodNo = row.periodNo;
        } else if (row.periodNo > 13 && row.periodNo <= 1113) {
            // FORMULA FOR PERIODE SELECTION:
            // (FROMMONTH * 100) + TOMONTH => Febuary till November = (2 * 100) + 11 = 211
            filter.toPeriodNo = row.periodNo % 100;
            filter.fromPeriodNo = (row.periodNo - filter.toPeriodNo) / 100;
        } else { // Default filter if clicking on total
            if (this.includeIncomingBalanceInDistributionReport$.getValue()) {
                this.toastService.addToast(
                    'Ikke støttet',
                    ToastType.warn,
                    3,
                    'Drilldown på utgående balanse ikke støttet');
                return;
            } else {
                filter.fromPeriodNo = 1;
                filter.toPeriodNo = 12;
            }
        }

        filter.year = row.year;
        filter.name = this.periodFilterHelper.getFilterName(filter);
        this.periodFilter3$.next(filter);

        this.setupLookupTransactions();
    }

    public onYearSelected(event) {
        const tmp = this.periodFilter1$.getValue();
        this.periodFilter1$.next(this.periodFilter2$.getValue());
        this.periodFilter2$.next(tmp);
        this.periodFilter3$.next(this.periodFilter2$.getValue());
        this.setupLookupTransactions();
    }

    public onFormFilterChange(event) {
        const search = this.searchParams$.getValue();
        if (search.AccountID) {
            this.accountService.Get(search.AccountID).subscribe((account: Account) => {
                this.setAccountConfig(account);
                this.loadData();
                this.setupLookupTransactions();
            });
        }
    }

    private getLayout() {
        return {
            Name: 'AccountqueryList',
            BaseEntity: 'Account',
            ID: 1,
            Fields: [
                {
                    Property: 'AccountID',
                    Placement: 4,
                    FieldType: FieldType.UNI_SEARCH,
                    Label: 'Konto',
                    Options: {
                        valueProperty: 'ID',
                        uniSearchConfig: this.uniSearchAccountConfig.generateAllAccountsConfig()
                    }
                }
            ]
        };
    }
}
