import {Component, Input, ViewChild} from '@angular/core';
import {URLSearchParams, Response} from '@angular/http';
import {ActivatedRoute, Router} from '@angular/router';
import {Observable} from 'rxjs';
import {PeriodFilter, PeriodFilterHelper} from '../periodFilter/periodFilter';
import {
    UniTableColumn,
    UniTableConfig,
    UniTableColumnType,
    ICellClickEvent
} from '../../../../../framework/ui/unitable/index';
import {UniSearch} from '@uni-framework/ui/unisearch/UniSearch';
import {JournalEntry} from '../../../../unientities';
import {ImageModal} from '../../../common/modals/ImageModal';
import {UniModalService} from '../../../../../framework/uni-modal';
import {IToolbarConfig} from './../../../common/toolbar/toolbar';
import {BehaviorSubject} from 'rxjs';
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
    @ViewChild(UniSearch) searchElement: UniSearch;
    @Input() config: {
        close: () => void,
        modalMode: boolean,
        accountID: number,
        accountNumber: number,
        accountName: string,
        dimensionType: number,
        dimensionId: number,
        isSubAccount: boolean,
        periodFilter1: PeriodFilter,
        periodFilter2: PeriodFilter
    };

    toolbarconfig: IToolbarConfig;
    searchConfig = this.uniSearchAccountConfig.generateAllAccountsConfig();
    uniTableConfigTransactions$: BehaviorSubject<UniTableConfig> = new BehaviorSubject<UniTableConfig>(null);

    periodFilter1$: BehaviorSubject<PeriodFilter> = new BehaviorSubject<PeriodFilter>(null);
    periodFilter2$: BehaviorSubject<PeriodFilter> = new BehaviorSubject<PeriodFilter>(null);
    periodFilter3$: BehaviorSubject<PeriodFilter> = new BehaviorSubject<PeriodFilter>(null);
    accountIDs: Array<number> = [];
    subAccountIDs: Array<number> = [];
    includeIncomingBalanceInDistributionReport$: BehaviorSubject<boolean> = new BehaviorSubject(false);

    transactionsLookupFunction: (urlParams: URLSearchParams) => any;
    columnSumResolver: (urlParams: URLSearchParams) => Observable<{[field: string]: number}>;
    doTurnDistributionAmounts$: BehaviorSubject<boolean> = new BehaviorSubject(false);

    private dimensionEntityName: string;
    private financialYears: Array<FinancialYear> = null;
    private activeFinancialYear: FinancialYear;

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
        private route: ActivatedRoute,
        private router: Router
    ) {

        this.config = {
            close: () => {},
            modalMode: false,
            accountID: 0,
            isSubAccount: false,
            accountNumber: 0,
            accountName: '',
            dimensionId: 0,
            dimensionType: 0,
            periodFilter1: null,
            periodFilter2: null
        };

        this.periodFilter1$.next(this.periodFilterHelper.getFilter(1, null));
        this.periodFilter2$.next(this.periodFilterHelper.getFilter(2, this.periodFilter1$.getValue()));
        this.periodFilter3$.next(this.periodFilterHelper.getFilter(1, null));

        this.transactionsLookupFunction = (urlParams: URLSearchParams) =>
            this.getTableData(urlParams).catch((err, obs) => this.errorService.handleRxCatch(err, obs));

        this.columnSumResolver = (urlParams: URLSearchParams) =>
            this.getTableData(urlParams, true).catch((err, obs) => this.errorService.handleRxCatch(err, obs));

        this.setupTransactionsTable();

        this.activeFinancialYear = this.financialYearService.getActiveFinancialYear();

        Observable.forkJoin(
            this.financialYearService.GetAll('orderby=Year desc')
        ).subscribe(data => {
            this.financialYears = data[0];
        });
    }

    public ngOnInit() {
        if (!this.config.modalMode) {
            this.route.queryParams.subscribe(params => {
                const accountParam = +params['account'];

                this.accountService.searchAccounts(accountParam ? 'AccountNumber eq ' + accountParam : 'Visible eq 1', 1)
                .subscribe(data => {
                    // Failcheck if routeparam is wrong / no account found. Just route to same view without params..
                    if ((!data || !data.length) && accountParam) {
                        this.router.navigateByUrl('/accounting/accountquery');
                        return;
                    }
                    const account = data[0];
                    this.setAccountConfig(account);
                    this.updateToolbar();
                    this.addTab(accountParam);

                    this.searchConfig.initialItem$.next(account);
                    if (this.searchElement) {
                        this.searchElement.focus();
                    }

                    this.loadData();
                });

            });
        } else {
            this.loadData();
        }
    }

    public onFilterAccountChange(account) {
        if (account && account.ID) {
            this.setAccountConfig(account);
            this.loadData();
            this.setupLookupTransactions();
            this.addTab(account.AccountNumber);
            setTimeout(() => {
                if (this.searchElement) {
                    this.searchElement.focus();
                }
            });
        }
    }

    public onPeriodFilterChanged(item) {
        if (item.fromPeriodNo === item.toPeriodNo) {
            this.periodSelected({periodNo: item.toPeriodNo, year: item.year});
        } else {
            const periode = (parseInt(item.fromPeriodNo, 10) * 100) + parseInt(item.toPeriodNo, 10);
            this.periodSelected({periodNo: periode, year: item.year});
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
        this.toolbarconfig = {
            title: 'Søk på konto',
            navigation: {
                prev: this.previous.bind(this),
                next: this.next.bind(this)
            }
        };
    }

    public addTab(number?: number) {
        this.tabService.addTab({
            name: 'Søk på konto',
            url: `/accounting/accountquery${ !!number ? '?account=' + number : '' }`,
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
                    this.searchConfig.initialItem$.next(account);

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
                    this.searchConfig.initialItem$.next(account);

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
        if (this.config.periodFilter1 !== null && this.config.periodFilter2 !== null) {
            this.periodFilter1$.next(this.config.periodFilter1);
            this.periodFilter2$.next(this.config.periodFilter2);
            this.periodFilter3$.next(this.config.periodFilter1);
        } else {
            // get default period filters
            this.periodFilter1$.next(this.periodFilterHelper.getFilter(1, null, null));
            this.periodFilter2$.next(this.periodFilterHelper.getFilter(2, this.periodFilter1$.getValue()));
            this.periodFilter3$.next(this.periodFilterHelper.getFilter(1, null, null));
        }

        this.accountIDs = this.config.isSubAccount === true ? null : [this.config.accountID];
        this.subAccountIDs = this.config.isSubAccount ? [this.config.accountID] : null;

        if (this.config.dimensionType && this.config.dimensionId) {
             this.dimensionEntityName = DimensionService.getEntityNameFromDimensionType(this.config.dimensionType);
        } else {
            this.dimensionEntityName = null;
        }

        this.doTurnAndInclude();
    }

    private getTableData(urlParams: URLSearchParams, isSum: boolean = false): Observable<Response> {
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
        urlParams.set('expand', 'Account,SubAccount,VatType,Dimensions.Department,Dimensions.Project,Period');
        urlParams.set('filter', filters.join(' and '));

        if (isSum) {
            urlParams.set('select', 'sum(Amount) as Amount');
            urlParams.delete('join');
            urlParams.delete('orderby');

            return this.statisticsService.GetAllByUrlSearchParams(urlParams)
                .map(res => res.json())
                .map(res => (res.Data && res.Data[0]) || []);
        } else {
            urlParams.set('select',
            'ID as ID,' +
            'JournalEntryNumber as JournalEntryNumber,' +
            'FinancialDate,' +
            'PaymentID as PaymentID,' +
            'AmountCurrency as AmountCurrency,' +
            'Description as Description,' +
            'VatType.VatCode,' +
            'Amount as Amount,' +
            'VatDeductionPercent as VatDeductionPercent,' +
            'Department.Name,' +
            'Project.Name,' +
            'Department.DepartmentNumber,' +
            'Project.ProjectNumber,' +
            'JournalEntryID as JournalEntryID,' +
            'ReferenceCreditPostID as ReferenceCreditPostID,' +
            'OriginalReferencePostID as OriginalReferencePostID,' +
            'sum(casewhen(FileEntityLink.EntityType eq \'JournalEntry\'\\,1\\,0)) as Attachments');
            urlParams.set('join', 'JournalEntryLine.JournalEntryID eq FileEntityLink.EntityID');
            urlParams.set('orderby', urlParams.get('orderby') || 'JournalEntryID desc');

            return this.statisticsService.GetAllByUrlSearchParams(urlParams);
        }
    }

    private setupLookupTransactions() {
        this.transactionsLookupFunction =
            (urlParams: URLSearchParams) => this.getTableData(urlParams)
                .catch((err, obs) => this.errorService.handleRxCatch(err, obs));

        this.columnSumResolver = (urlParams: URLSearchParams) =>
            this.getTableData(urlParams, true).catch((err, obs) => this.errorService.handleRxCatch(err, obs));
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
                entityID: event.row.JournalEntryID,
                singleImage: false
            };
            this.modalService.open(ImageModal, { data: data });
        }
    }

    private setupTransactionsTable() {
        const journalEntryNumberCol = new UniTableColumn('JournalEntryNumber', 'Bilagsnr')
            .setFilterOperator('contains');

        if (!this.config || !this.config.modalMode) {
            journalEntryNumberCol.setLinkResolver(row => {
                return `/accounting/transquery?JournalEntryNumber=${row.JournalEntryNumber}`;
            });
        }

        const columns = [
            journalEntryNumberCol,
            new UniTableColumn('FinancialDate', 'Regnskapsdato', UniTableColumnType.LocalDate)
                .setFilterOperator('contains')
                .setFormat('DD.MM.YYYY')
                .setTemplate(line => line.JournalEntryLineFinancialDate),
            new UniTableColumn('PaymentID', 'KID', UniTableColumnType.Text)
                .setFilterOperator('contains'),
            new UniTableColumn('Description', 'Beskrivelse', UniTableColumnType.Text)
                .setFilterOperator('contains'),
            new UniTableColumn('VatType.VatCode', 'Mvakode', UniTableColumnType.Text)
                .setFilterOperator('eq')
                .setTemplate(line => line.VatTypeVatCode),
            new UniTableColumn('Amount', 'Beløp', UniTableColumnType.Money)
                .setFilterOperator('eq')
                .setIsSumColumn(true),
            new UniTableColumn('AmountCurrency', 'Valutabeløp', UniTableColumnType.Money)
                .setFilterOperator('eq')
                .setVisible(false),
            new UniTableColumn('VatDeductionPercent', 'Fradrag %', UniTableColumnType.Number)
                .setFilterable(false)
                .setVisible(false),
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

        columns.forEach(x => {
            x.conditionalCls = (data) => this.getCssClasses(data, x.field);
        });

        const tableName = 'accounting.accountingreports.detailsmodal';
        this.uniTableConfigTransactions$.next(new UniTableConfig(tableName, false, false)
            .setPageable(true)
            .setPageSize(20)
            .setSearchable(true)
            .setConditionalRowCls(row => {
                if (!row) {
                    return '';
                }
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

    private getCssClasses(data, field) {
        let cssClasses = '';

        if (!data) {
            return '';
        }

        if (field === 'Amount') {
            cssClasses += ' ' + (parseInt(data.value, 10) >= 0 ? 'number-good' : 'number-bad');
        }

        return cssClasses.trim();
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

    onResourceChange($event) {
        console.log($event);
    }
}
