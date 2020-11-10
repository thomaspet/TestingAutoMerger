import { Component, Input, ViewChild } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { PeriodFilter, PeriodFilterHelper } from '../periodFilter/periodFilter';
import {
    UniTableColumn,
    UniTableConfig,
    UniTableColumnType,
    ICellClickEvent
} from '../../../../../framework/ui/unitable/index';
import { UniSearch } from '@uni-framework/ui/unisearch/UniSearch';
import { JournalEntry } from '../../../../unientities';
import { ImageModal } from '../../../common/modals/ImageModal';
import { UniModalService } from '../../../../../framework/uni-modal';
import { IToolbarConfig } from './../../../common/toolbar/toolbar';
import { BehaviorSubject } from 'rxjs';
import { FinancialYear, Account } from '../../../../unientities';
import { ToastService, ToastType } from '../../../../../framework/uniToast/toastService';
import { UniSearchAccountConfig } from '../../../../services/common/uniSearchConfig/uniSearchAccountConfig';
import { TabService, UniModules } from '../../../layout/navbar/tabstrip/tabService';
import {
    StatisticsService,
    DimensionService,
    ErrorService,
    FinancialYearService,
    AccountService,
    PageStateService
} from '../../../../services/services';
import { YearModal, IChangeYear } from '../../../layout/navbar/company-dropdown/yearModal';
import { IUniTab } from '@uni-framework/uni-tabs';
import * as moment from 'moment';
import { ProjectService } from '@app/services/common/projectService';
import { DepartmentService } from '@app/services/common/departmentService';
import { resultBalanceFilter } from '@app/components/accounting/accountingreports/filter.form';

import { saveAs } from 'file-saver';

const PAPERCLIP = '📎'; // It might look empty in your editor, but this is the unicode paperclip

import * as _ from 'lodash';

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
        periodFilter2: PeriodFilter,
        filter: any
    };

    toolbarconfig: IToolbarConfig;
    searchConfig = this.uniSearchAccountConfig.generateAllAccountsConfig();
    tableConfig: UniTableConfig;

    accountIDs: Array<number> = [];
    subAccountIDs: Array<number> = [];
    includeIncomingBalanceInDistributionReport$: BehaviorSubject<boolean> = new BehaviorSubject(false);

    transactionsLookupFunction: (urlParams: HttpParams) => any;
    columnSumResolver: (urlParams: HttpParams) => Observable<{ [field: string]: number }>;
    doTurnDistributionAmounts$: BehaviorSubject<boolean> = new BehaviorSubject(false);
    accountNumber: number;
    tabIndex: number = 0;
    tabs: IUniTab[] = [
        { name: 'Periodetall', value: 0 },
        { name: 'Transaksjoner', value: 1 }
    ];
    selectYearConfig = {
        template: (item) => typeof item === 'number' ? item.toString() : item,
        searchable: false,
        hideDeleteButton: true
    };
    selectDateFieldConfig = {
        template: (item) => item.label,
        searchable: false,
        hideDeleteButton: true
    };
    selectYear: string[];
    activeYear: number;
    dateFields: any[] = [
        { label: 'Regnskapsdato', value: 'JournalEntryLine.FinancialDate' },
        { label: 'Mva-dato', value: 'JournalEntryLine.VatDate' }
    ];
    currentDateField: any;
    showCredited: boolean = false;
    filterVisible = false;
    toDate: any;
    fromDate: any;
    private dimensionEntityName: string;
    private financialYears: Array<FinancialYear> = null;
    private activeFinancialYear: FinancialYear;
    public config$: BehaviorSubject<any> = new BehaviorSubject({});
    public fields$: BehaviorSubject<any[]> = new BehaviorSubject([]);
    public filter$: BehaviorSubject<any> = new BehaviorSubject({
        ShowPreviousAccountYear: true,
        ShowBudget: true,
        Decimals: 0,
        ShowPercent: true,
        ShowPrecentOfLastYear: false,
        ShowPercentOfBudget: false
    });
    filter = this.filter$.getValue();
    periodFilter: PeriodFilter;
    constructor(
        private statisticsService: StatisticsService,
        private errorService: ErrorService,
        private financialYearService: FinancialYearService,
        private accountService: AccountService,
        private toastService: ToastService,
        private uniSearchAccountConfig: UniSearchAccountConfig,
        private tabService: TabService,
        private modalService: UniModalService,
        private route: ActivatedRoute,
        private router: Router,
        private pageStateService: PageStateService,
        private projectService: ProjectService,
        private departmentService: DepartmentService,
        private periodFilterHelper: PeriodFilterHelper
    ) {
        this.config = {
            close: () => { },
            modalMode: false,
            accountID: 0,
            isSubAccount: false,
            accountNumber: 0,
            accountName: '',
            dimensionId: 0,
            dimensionType: 0,
            periodFilter1: null,
            periodFilter2: null,
            filter: null
        };

        this.setupTransactionsTable();

        this.activeFinancialYear = this.financialYearService.getActiveFinancialYear();
        const subscription = this.route.queryParams.subscribe(params => {
            this.periodFilter = this.periodFilterHelper.getFilter(12, <PeriodFilter>{
                year: this.activeFinancialYear.Year + 1,
                fromPeriodNo: params.fromDate ? moment(params.fromDate, 'YYYY-MM-DD').month() + 1 : 1,
                toPeriodNo: params.toDate ? moment(params.toDate, 'YYYY-MM-DD').month() + 1 : 12,
                name: ''
            }, this.activeFinancialYear.Year, false);
        });

        Observable.forkJoin(
            this.financialYearService.GetAll('orderby=Year desc')
        ).subscribe(data => {
            this.financialYears = data[0];
        });

        // get filter data
        Observable.forkJoin(
            this.projectService.GetAll(null),
            this.departmentService.GetAll(null)
        ).subscribe((response: Array<any>) => {
            const [projects, departments] = response;
            this.fields$.next(resultBalanceFilter(projects, departments));
        });
    }

    public ngOnInit() {
        if (!this.config.modalMode) {
            this.route.queryParams.subscribe(params => {

                const accountParam = +params['account'];
                let dateFieldIndex: number = +params['dateFieldIndex'] || 0;
                this.tabIndex = +params['tabIndex'] || 0;
                this.showCredited = params['showCredited'] === 'true';
                this.accountNumber = accountParam;

                dateFieldIndex = dateFieldIndex < this.dateFields.length ? dateFieldIndex : 0;
                this.currentDateField = this.dateFields[dateFieldIndex];

                this.activeYear = +params['year'] || this.activeFinancialYear.Year;
                this.selectYear = this.getYearComboSelection(this.activeYear);

                this.fromDate = {
                    Date: moment(params['fromDate'] ? params['fromDate'] : this.activeYear + '-01-01')
                };
                this.toDate = {
                    Date: moment(params['toDate'] ? params['toDate'] : this.activeYear + '-12-31')
                };

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
                        this.addTab();

                        this.transactionsLookupFunction = (urlParams: HttpParams) =>
                            this.getTableData(urlParams).catch((err, obs) => this.errorService.handleRxCatch(err, obs));

                        this.columnSumResolver = (urlParams: HttpParams) =>
                            this.getTableData(urlParams, true).catch((err, obs) => this.errorService.handleRxCatch(err, obs));

                        this.searchConfig.initialItem$.next(account);
                        if (this.searchElement) {
                            this.searchElement.focus();
                        }

                        this.loadData();
                    });

            });
        } else {
            this.filter = this.config.filter;
            this.filter$.next(this.filter);
            this.activeYear = this.activeFinancialYear.Year;
            this.selectYear = this.getYearComboSelection(this.activeYear);
            this.currentDateField = this.dateFields[0];

            this.fromDate = {
                Date: moment(this.activeYear + '-01-01')
            };
            this.toDate = {
                Date: moment(this.activeYear + '-12-31')
            };

            this.transactionsLookupFunction = (urlParams: HttpParams) =>
                this.getTableData(urlParams).catch((err, obs) => this.errorService.handleRxCatch(err, obs));

            this.columnSumResolver = (urlParams: HttpParams) =>
                this.getTableData(urlParams, true).catch((err, obs) => this.errorService.handleRxCatch(err, obs));

            this.loadData();
        }
    }

    public onPeriodFilterChanged(event: PeriodFilter) {
        this.activeYear = event.year;
        this.selectYear = this.getYearComboSelection(this.activeYear);

        this.fromDate = {
            Date: moment(moment(`${this.activeYear}-${event.fromPeriodNo}-15`).startOf('month'))
        };

        this.toDate = {
            Date: moment(moment(`${this.activeYear}-${event.toPeriodNo}-15`).endOf('month'))
        };

        this.setupLookupTransactions();
        this.tabIndex = 0;
        this.addTab();
        this.periodFilter = Object.assign({}, event);
    }

    public showCreditedChange() {
        this.addTab();
        this.setupLookupTransactions();
    }

    public onFilterAccountChange(account: Account) {
        if (account && account.ID) {
            this.setAccountConfig(account);
            this.loadData();
            this.setupLookupTransactions();
            this.accountNumber = account.AccountNumber;
            this.addTab();
            setTimeout(() => {
                if (this.searchElement) {
                    this.searchElement.focus();
                }
            });
        }
    }

    private setAccountConfig(account: Account) {
        this.config.accountID = account.ID;
        this.config.accountName = account.AccountName;
        this.config.accountNumber = account.AccountNumber;
        this.config.isSubAccount = account.AccountID > 0;
    }

    public periodChange(event) {
        this.fromDate = event.fromDate;
        this.toDate = event.toDate;

        // Set year to match period selected and update the year dropdown values..
        this.activeYear = moment(event.fromDate.Date).year();
        this.selectYear = this.getYearComboSelection(this.activeYear);
        this.addTab();

        this.setupLookupTransactions();
    }

    public onDateForSelectionChange(event) {
        // Only run if another value is selected
        if (event.label !== this.currentDateField.label) {
            this.currentDateField = event;
            this.addTab();
            this.setupLookupTransactions();
        }
    }

    public doTurnAndInclude() {
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

    public addTab() {
        // Dont update if in modal, causes broken tabs
        if (this.config.modalMode) {
            return;
        }

        const dateFieldIndex = this.dateFields.findIndex(df => df.label === this.currentDateField.label);

        // Set page state service to make sure browser navigatio works
        this.pageStateService.setPageState('tabIndex', this.tabIndex + '');
        this.pageStateService.setPageState('fromDate', moment(this.fromDate.Date).format('YYYY-MM-DD'));
        this.pageStateService.setPageState('toDate', moment(this.toDate.Date).format('YYYY-MM-DD'));
        this.pageStateService.setPageState('year', this.activeYear + '');
        this.pageStateService.setPageState('showCredited', this.showCredited + '');
        this.pageStateService.setPageState('dateFieldIndex', dateFieldIndex !== -1 ? dateFieldIndex + '' : '0');

        if (!!this.accountNumber) {
            this.pageStateService.setPageState('account', this.accountNumber + '');
        }

        this.tabService.addTab({
            name: 'Søk på konto',
            url: this.pageStateService.getUrl(),
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
        this.accountIDs = this.config.isSubAccount === true ? null : [this.config.accountID];
        this.subAccountIDs = this.config.isSubAccount ? [this.config.accountID] : null;

        if (this.config.dimensionType && this.config.dimensionId) {
            this.dimensionEntityName = DimensionService.getEntityNameFromDimensionType(this.config.dimensionType);
        } else {
            this.dimensionEntityName = null;
        }

        this.doTurnAndInclude();
    }

    private getTableData(urlParams: HttpParams, isSum: boolean = false) {
        const params = this.getUrlParams(urlParams, isSum);
        if (isSum) {
            return this.statisticsService.GetAllByHttpParams(params)
                .map(res => res.body)
                .map(res => (res.Data && res.Data[0]) || []);
        } else {
            return this.statisticsService.GetAllByHttpParams(params);
        }
    }

    private getUrlParams(urlParams: HttpParams, isSum: boolean = false) {
        urlParams = urlParams || new HttpParams();
        const filtersFromUniTable = urlParams.get('filter');
        const filters = filtersFromUniTable ? [filtersFromUniTable] : [];


        if (this.config.isSubAccount) {
            filters.push(`JournalEntryLine.SubAccountID eq ${this.config.accountID}`);
        } else {
            filters.push(`JournalEntryLine.AccountID eq ${this.config.accountID}`);
        }

        filters.push(`${this.currentDateField.value} ge '${moment(this.fromDate.Date).format('YYYY-MM-DD')}'`);
        filters.push(`${this.currentDateField.value} le '${moment(this.toDate.Date).format('YYYY-MM-DD')}'`);

        if (this.dimensionEntityName) {
            filters.push(`isnull(Dimensions.${this.dimensionEntityName}ID,0) eq ${this.config.dimensionId}`);
        }

        if (!this.showCredited) {
            filters.push(`isnull(StatusCode,0) ne '31004'`);
        }

        urlParams = urlParams.set('model', 'JournalEntryLine');
        urlParams = urlParams.set('expand', 'Account,SubAccount,VatType,Dimensions.Department,Dimensions.Project,Period');
        urlParams = urlParams.set('filter', filters.join(' and '));

        if (isSum) {
            urlParams = urlParams.set('select', 'sum(Amount) as Amount');
            urlParams = urlParams.delete('join');
            urlParams = urlParams.delete('orderby');

            return urlParams;
        } else {
            const select = [
                'ID as ID',
                'JournalEntryNumber as JournalEntryNumber',
                'JournalEntryNumberNumeric as JournalEntryNumberNumeric',
                'FinancialDate',
                'PaymentID as PaymentID',
                'AmountCurrency as AmountCurrency',
                'Description as Description',
                'StatusCode as StatusCode',
                'VatDate as VatDate',
                'VatType.VatCode',
                'Amount as Amount',
                'VatDeductionPercent as VatDeductionPercent',
                'Department.Name',
                'Project.Name',
                'Department.DepartmentNumber',
                'Project.ProjectNumber',
                'JournalEntryID as JournalEntryID',
                'ReferenceCreditPostID as ReferenceCreditPostID',
                'OriginalReferencePostID as OriginalReferencePostID',
                'sum(casewhen(FileEntityLink.EntityType eq \'JournalEntry\'\\,1\\,0)) as Attachments'
            ].join(',');

            urlParams = urlParams.set('select', select);
            urlParams = urlParams.set('join', 'JournalEntryLine.JournalEntryID eq FileEntityLink.EntityID');
            urlParams = urlParams.set('orderby', urlParams.get('orderby') || 'JournalEntryID desc');
            return urlParams;
        }

    }

    private setupLookupTransactions() {
        this.transactionsLookupFunction =
            (urlParams: HttpParams) => this.getTableData(urlParams)
                .catch((err, obs) => this.errorService.handleRxCatch(err, obs));

        this.columnSumResolver = (urlParams: HttpParams) =>
            this.getTableData(urlParams, true).catch((err, obs) => this.errorService.handleRxCatch(err, obs));
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
            .setSortField('JournalEntryNumberNumeric')
            .setFilterOperator('contains');

        if (!this.config || !this.config.modalMode) {
            journalEntryNumberCol.setLinkResolver(row => {
                const isCredited = !!row.ReferenceCreditPostID || !!row.OriginalReferencePostID || row.StatusCode === 31004;
                const numberAndYear = row.JournalEntryNumber.split('-');
                let url = `/accounting/transquery?JournalEntryNumber=${numberAndYear[0]}&ShowCreditedLines=${isCredited}&AccountYear=`;
                if (numberAndYear.length > 1) {
                    return url += numberAndYear[1];
                } else {
                    const year = row.JournalEntryLineFinancialDate ? moment(row.JournalEntryLineFinancialDate).year() : moment().year();
                    return url += year;
                }
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
            new UniTableColumn('VatDate', 'Mva-dato', UniTableColumnType.LocalDate)
                .setFilterOperator('contains')
                .setFormat('DD.MM.YYYY')
                .setTemplate(line => line.JournalEntryLineFinancialDate),
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
                .setTemplate(line => {
                    return line.DepartmentDepartmentNumber
                        ? line.DepartmentDepartmentNumber + ': ' + line.DepartmentName : '';
                }),
            new UniTableColumn('Project.Name', 'Prosjekt', UniTableColumnType.Text)
                .setFilterOperator('contains')
                .setTemplate(line => {
                    return line.ProjectProjectNumber
                        ? line.ProjectProjectNumber + ': ' + line.ProjectName : '';
                }),
            new UniTableColumn('ID', PAPERCLIP, UniTableColumnType.Text)
                .setTemplate(line => line.Attachments ? PAPERCLIP : '')
                .setWidth('40px')
                .setFilterable(false)
        ];

        columns.forEach(x => {
            x.conditionalCls = (data) => this.getCssClasses(data, x.field);
        });

        const tableName = 'accounting.accountingreports.detailsmodal';
        this.tableConfig = new UniTableConfig(tableName, false, false, 8)
            .setPageable(true)
            .setSearchable(true)
            .setConditionalRowCls(row => {
                if (!row) {
                    return '';
                }
                if (row.ReferenceCreditPostID || row.OriginalReferencePostID || row.StatusCode === 31004) {
                    return 'journal-entry-credited';
                }
            })
            .setColumns(columns);
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

    public periodSelected(row, shouldGoToTransactions: boolean = false) {
        this.activeYear = row.year;
        this.selectYear = this.getYearComboSelection(this.activeYear);

        this.fromDate = {
            Date: moment(moment(`${this.activeYear}-${row.periodNo}-15`).startOf('month'))
        };

        this.toDate = {
            Date: moment(moment(`${this.activeYear}-${row.periodNo}-15`).endOf('month'))
        };

        this.setupLookupTransactions();
        this.tabIndex = 1;

        this.addTab();
    }

    private getYearComboSelection(curYear): string[] {
        curYear = parseInt(curYear, 10);
        return [
            `${curYear - 1}`,
            `${curYear + 1}`,
            '...'];
    }

    public onYearDropdownChange(value) {
        if (value === '...') {
            this.openYearModal();
        } else {
            this.activeYear = value;

            this.fromDate = {
                Date: moment(`${this.activeYear}-01-01`)
            };

            this.toDate = {
                Date: moment(`${this.activeYear}-12-31`)
            };

            this.selectYear = this.getYearComboSelection(value);
            this.setupLookupTransactions();
        }
    }

    public openYearModal() {
        this.modalService.open(YearModal, { data: { year: this.activeYear } }).onClose
            .subscribe((val: IChangeYear) => {
                if (val && val.year && (typeof val.year === 'number')) {
                    this.onYearDropdownChange(val.year);
                }
            }, (err) => this.errorService.handle(err));
    }

    public tabChange(event) {
        this.addTab();
    }

    public toggleFilter() {
        this.filterVisible = !this.filterVisible;
    }

    public onFilterChange(change) {
        this.filter = _.cloneDeep(this.filter$.getValue());
    }

    public toExcel(urlParams: HttpParams) {
        const params = this.getUrlParams(urlParams, false);
        this.statisticsService.GetExportedExcelFileFromUrlParams(params)
            .subscribe((result) => {
                let filename = '';
                // Get filename with filetype from headers
                if (result.headers) {
                    const fromHeader = result.headers.get('content-disposition');
                    if (fromHeader) {
                        filename = fromHeader.split('=')[1];
                    }
                }

                if (!filename || filename === '') {
                    filename = 'exportaccountdetails.xlsx';
                }

                const blob = new Blob([result.body], { type: 'text/csv' });
                // download file so the user can open it
                saveAs(blob, filename);
            }, err => this.errorService.handle(err));
    }
}
