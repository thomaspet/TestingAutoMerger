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
import {UniSearchAccountConfigGeneratorHelper} from '../../../../services/common/uniSearchConfig/uniSearchAccountConfigGeneratorHelper';
import {TabService, UniModules} from '../../../layout/navbar/tabstrip/tabService';
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
    @Input() public config: { close: () => void, modalMode: boolean, accountID: number, subaccountID, accountNumber: number, accountName: string, dimensionType: number, dimensionId: number };
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
    private periodFilter3$: BehaviorSubject<PeriodFilter> = new BehaviorSubject<PeriodFilter>(null);
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
                private toastService: ToastService,
                private uniSearchAccountConfig: UniSearchAccountConfigGeneratorHelper,
                private tabService: TabService) {

       this.config = {
            close: () => {},
            modalMode: false,
            accountID: 0,
            subaccountID: 0,
            accountNumber: 0,
            accountName: '',
            dimensionId: 0,
            dimensionType: 0
        };

        this.periodFilter1$.next(PeriodFilterHelper.getFilter(1, null));
        this.periodFilter2$.next(PeriodFilterHelper.getFilter(2, this.periodFilter1$.getValue()));
        this.periodFilter3$.next(PeriodFilterHelper.getFilter(1, null));

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
                let account = data[0];

                this.config.accountID = account.ID;
                this.config.accountName = account.AccountName;
                this.config.accountNumber = account.AccountNumber;
                this.config.subaccountID = account.AccountID;

                var searchparams = this.searchParams$.getValue();
                searchparams.AccountID = account.ID;
                searchparams.AccountNumber= account.AccountNumber;
                this.searchParams$.next(searchparams);
                this.loadData();
            });
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

    public addTab() {
        this.tabService.addTab({
            name: 'Forespørsel konto',
            url: '/accounting/accountquery',
            moduleID: UniModules.AccountQuery,
            active: true
        });
    }

    public previous() {
        this.accountService.searchAccounts('Visible eq 1 and AccountNumber lt ' + this.config.accountNumber, 1, 'AccountNumber desc').subscribe(data => {
            if (data.length > 0) {
                let account = data[0];
                this.config.accountID = account.ID;
                this.config.accountName = account.AccountName;
                this.config.accountNumber = account.AccountNumber;
                this.config.subaccountID = account.AccountID;

                var searchParams = this.searchParams$.getValue();
                searchParams.AccountID = account.ID;
                searchParams.AccountNumber = account.AccountNumber;
                this.searchParams$.next(searchParams);

                this.loadData();
            } else {
                this.toastService.addToast('Første konto', ToastType.warn, 5, 'Du har nådd Første konto');
            }
        });
    }

    public next() {
        this.accountService.searchAccounts('Visible eq 1 and AccountNumber gt ' + this.config.accountNumber, 1).subscribe(data => {
            if (data.length > 0) {
                let account = data[0];
                this.config.accountID = account.ID;
                this.config.accountName = account.AccountName;
                this.config.accountNumber = account.AccountNumber;
                this.config.subaccountID = account.AccountID;

                var searchParams = this.searchParams$.getValue();
                searchParams.AccountID = account.ID;
                searchParams.AccountNumber = account.AccountNumber;
                this.searchParams$.next(searchParams);
                //this.form.

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
        this.periodFilter3$.next(PeriodFilterHelper.getFilter(1, null));

        this.accountIDs = [this.config.subaccountID ? this.config.subaccountID : this.config.accountID];

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

        filters.push(`JournalEntryLine.AccountID eq ${this.config.subaccountID ? this.config.subaccountID : this.config.accountID}`);
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
        this.periodFilter3$.next(this.periodFilter2$.getValue());
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

    private periodSelected(row) {
        var filter = new PeriodFilter();
        if (row.periodNo == 0) {
            this.toastService.addToast('Ikke støttet', ToastType.warn, 3, 'Drilldown på inngående balanse ikke støttet');
            return;
        } else if (row.periodNo < 13) {
            filter.fromPeriodNo = row.periodNo;
            filter.toPeriodNo = row.periodNo;
        } else { // Default filter if clicking on total
            if (this.includeIncomingBalanceInDistributionReport$.getValue()) {
                this.toastService.addToast('Ikke støttet', ToastType.warn, 3, 'Drilldown på utgående balanse ikke støttet');
                return;
            } else {
                filter.fromPeriodNo = 1;
                filter.toPeriodNo = 12;
            }
        }

        filter.year = row.year;
        filter.name = PeriodFilterHelper.getFilterName(filter);
        this.periodFilter3$.next(filter);

        this.setupLookupTransactions();
    }

    private onFormFilterChange(event) {
        let search = this.searchParams$.getValue();
        if (search.AccountID) {
            this.accountService.Get(search.AccountID).subscribe((account: Account) => {
                this.config.accountID = account.ID;
                this.config.accountName = account.AccountName;
                this.config.accountNumber = account.AccountNumber;
                this.config.subaccountID = account.AccountID;

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
            ID: 1,
            Fields: [
                {
                    Property: 'AccountID',
                    Placement: 4,
                    FieldType: FieldType.UNI_SEARCH,
                    Label: 'Konto',
                    Options: {
                        valueProperty: 'ID',
                        source: model => this.accountService
                            .GetAll(``)
                            .map(results => results[0])
                            .catch((err, obs) => this.errorService.handleRxCatch(err, obs)),
                        uniSearchConfig: this.uniSearchAccountConfig.generateAllAccountsConfig()
                    }
                }
            ]
        };
    }
}
