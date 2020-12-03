import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpParams } from '@angular/common/http';
import {
    UniTableColumn,
    UniTableConfig,
    UniTableColumnType,
    ITableFilter
} from '@uni-framework/ui/unitable/index';
import { AgGridWrapper } from '@uni-framework/ui/ag-grid/ag-grid-wrapper';
import { IToolbarConfig } from '@app/components/common/toolbar/toolbar';
import { Observable } from 'rxjs';
import { FinancialYear } from '@app/unientities';
import { TabService, UniModules } from '@app/components/layout/navbar/tabstrip/tabService';
import { UniForm } from '@uni-framework/ui/uniform';

import {
    ErrorService,
    StatisticsService,
    FinancialYearService,
    BrowserStorageService,
    PageStateService
} from '@app/services/services';

import { BehaviorSubject, Subject } from 'rxjs';
import * as moment from 'moment';
import * as _ from 'lodash';
import { saveAs } from 'file-saver';

@Component({
    selector: 'balance-search',
    templateUrl: './balanceSearch.html'
})
export class BalanceSearch implements OnInit {
    @ViewChild(AgGridWrapper, { static: true })
    private table: AgGridWrapper;

    @ViewChild(UniForm)
    private uniForm: UniForm;

    uniTableConfig: UniTableConfig;
    lookupFunction: (urlParams: HttpParams) => any;
    columnSumResolver: (urlParams: HttpParams) => Observable<{ [field: string]: number }>;

    loading$: Subject<boolean> = new Subject();
    private configuredFilter: string = '';

    toDate: any;
    fromDate: any;
    activeYear: number;
    selectYearConfig = {
        valueProperty: 'Year',
        debounceTime: 200,
        template: (item) => {
            return item ? item.Year.toString() : '';
        },
        searchable: false,
        hideDeleteButton: true
    };

    config$: BehaviorSubject<any> = new BehaviorSubject({ autofocus: false });

    financialYears: Array<FinancialYear> = null;
    private activeFinancialYear: FinancialYear;

    toolbarconfig: IToolbarConfig = {
        title: 'Saldobalanse hovedbok'
    };

    private COLUMN_VISIBILITY_LOCALSTORAGE_KEY: string = 'BalanceSearchColumnVisibility';

    constructor(
        private route: ActivatedRoute,
        private tabService: TabService,
        private statisticsService: StatisticsService,
        private errorService: ErrorService,
        private financialYearService: FinancialYearService,
        private storageService: BrowserStorageService,
        private pageStateService: PageStateService,
    ) { }

    public ngOnInit() {
        this.activeFinancialYear = this.financialYearService.getActiveFinancialYear();

        // setup unitable and router parameter subscriptions
        Observable.forkJoin([
            this.financialYearService.GetAll(null)]
        ).subscribe(data => {
            this.financialYears = data[0];

            if (this.activeFinancialYear) {
                this.activeYear = this.activeFinancialYear.Year;
            }

            this.route.queryParams.subscribe(routeParams => {
                this.fromDate = {
                    Date: moment(routeParams['fromDate'] ? routeParams['fromDate'] : this.activeYear + '-01-01')
                };
                this.toDate = {
                    Date: moment(routeParams['toDate'] ? routeParams['toDate'] : this.activeYear + '-12-31')
                };

                if (routeParams['AccountYear']) {
                    const yearFromParam = +routeParams['AccountYear'];
                    if (!isNaN(yearFromParam)) {
                        // Lets see if year is in financial years
                        const financialYear = this.financialYears.find(year => year.Year === yearFromParam);
                        if (financialYear) {
                            this.activeYear = financialYear.Year;
                        } else {
                            this.activeYear = this.activeFinancialYear.Year;
                        }
                    } else {
                        this.activeYear = this.activeFinancialYear.Year;
                    }
                }
                this.addTab();

                const unitableFilter: ITableFilter[] = [];
                this.uniTableConfig = this.generateUniTableConfig(unitableFilter, routeParams);
                this.setupFunction();

            });
        });
    }


    public periodChange(event) {
        this.fromDate = event.fromDate;
        this.toDate = event.toDate;

        // Set year to match period selected and update the year dropdown values..
        this.activeYear = moment(event.fromDate.Date).year();
        this.addTab();
        this.setupFunction();
    }

    private setupFunction() {
        this.lookupFunction = (urlParams: HttpParams) =>
            this.getTableData(urlParams)
                .finally(() => { this.loading$.next(false); })
                .catch((err, obs) => this.errorService.handleRxCatch(err, obs));
        this.columnSumResolver = (urlParams: HttpParams) =>
            this.getTableData(urlParams, true).catch((err, obs) => this.errorService.handleRxCatch(err, obs));
    }

    public onColumnsChange(event) {
        this.setupFunction();
    }

    private getTableData(urlParams: HttpParams, isSum: boolean = false) {
        const params = this.GetUrlParams(urlParams, isSum);

        if (isSum) {
            return this.statisticsService.GetAllByHttpParams(params)
                .map(res => res.body)
                .map(res => (res.Data && res.Data[0]) || []);
        } else {
            return this.statisticsService.GetAllByHttpParams(params);
        }
    }

    private GetUrlParams(urlParams: HttpParams, isSum: boolean = false): HttpParams {
        this.loading$.next(true);
        urlParams = urlParams || new HttpParams();

        const filtersFromUniTable = urlParams.get('filter');
        const filters = filtersFromUniTable ? [filtersFromUniTable] : [this.configuredFilter];

        const startYear = this.fromDate.Date.year();
        const endYear = this.toDate.Date.year();
        const fromDt = moment(this.fromDate.Date).format('YYYY-MM-DD');
        const toDt = moment(this.toDate.Date).format('YYYY-MM-DD');

        const Ibif = `casewhen(financialdate lt '${fromDt}',amount,0)`;
        const Ib_full = `casewhen((period.accountyear eq ${startYear}) and (financialdate lt '${fromDt}'),amount,0)`;
        const Ib_show = `sum(casewhen(account.accountnumber ge 3000 and account.accountnumber le 8999, ${Ib_full}, ${Ibif} ))`;
        const Debet = `sum(casewhen(financialdate ge '${fromDt}' and financialdate le '${toDt}' and amount ge 0,amount,0))`;
        const Credit = `sum(casewhen(financialdate ge '${fromDt}' and financialdate le '${toDt}' and amount lt 0,amount,0))`;
        const DebitCreditChange = `sum(casewhen(financialdate ge '${fromDt}' and financialdate le '${toDt}',amount,0))`;
        const Balance = `sum(casewhen((period.accountyear le ${endYear} and account.accountnumber lt 3000) or (financialdate le '${toDt}' and period.accountyear eq ${endYear}),amount,0))`;

        // Find the searchvalue
        const splitted = filters[0].split(`'`);

        let searchValue;
        if (splitted.length > 1 && splitted[1] !== undefined) {
            searchValue = splitted[1];
        }

        filters.push(`financialdate le '${moment(this.toDate.Date).format('YYYY-MM-DD')}'`);
        // remove empty first filter - this is done if we have multiple filters but the first one is
        // empty (this would generate an invalid filter clause otherwise)
        if (filters[0] === '') {
            filters.shift();
        }


        if (filters.length > 1) {
            filters[0] = '( ' + filters[0] + ' )';
        }

        let orderBy = urlParams.get('orderby');
        if (orderBy) {
            orderBy = orderBy.replace('Balance', Balance)
                .replace('DebitCreditChange', DebitCreditChange)
                .replace('Debet', Debet)
                .replace('Credit', Credit)
                .replace('Ib', Ib_show);
        }

        const selectString = 'Account.AccountNumber,Account.Accountname,'
            + `${Ib_show} as Ib,${Debet} as Debet,${Credit} as Credit,${Balance} as Balance`;

        urlParams = urlParams.set('model', 'JournalEntryLine');
        urlParams = urlParams.set(
            'expand',
            'account,period'
        );

        urlParams = urlParams.set(
            'filter',
            filters.join(' and ')
        );

        if (isSum) {
            urlParams = urlParams.set('select', `${Ib_show} as Ib,${Debet} as Debet,${Credit} as Credit,${Balance} as Balance,${DebitCreditChange} as DebitCreditChange`);
            urlParams = urlParams.delete('orderby');
        } else {
            urlParams = urlParams.set('select', selectString);
            urlParams = urlParams.set('orderby', orderBy || 'account.accountnumber');
        }
        return urlParams;
    }

    public onFormReady() {
        this.uniForm.field('AccountYear').focus();
    }

    public addTab() {
        // Set page state service to make sure browser navigatio works
        this.pageStateService.setPageState('AccountYear', this.activeYear + '');
        this.pageStateService.setPageState('fromDate', moment(this.fromDate.Date).format('YYYY-MM-DD'));
        this.pageStateService.setPageState('toDate', moment(this.toDate.Date).format('YYYY-MM-DD'));


        this.tabService.addTab({
            name: 'Saldobalanse hovedbok',
            url: this.pageStateService.getUrl(),
            moduleID: UniModules.BalanceSearch,
            active: true
        });
    }

    public setSearchParamsOnLinkClick(field, value) {
        this.addTab();
        this.setupFunction();
    }

    private generateUniTableConfig(unitableFilter: ITableFilter[], routeParams: any): UniTableConfig {
        const visibleColumnsString = this.storageService.getItem(this.COLUMN_VISIBILITY_LOCALSTORAGE_KEY);

        let visibleColumns = [];
        if (visibleColumnsString) {
            visibleColumns = JSON.parse(visibleColumnsString);
        }

        const columns = [
            new UniTableColumn('Account.AccountNumber', 'Kontonr.', UniTableColumnType.Link)
                .setTemplate(line => line.AccountAccountNumber)
                .setWidth('85px')
                .setLinkResolver(row => {
                    const accountNo = row.AccountAccountNumber;
                    const fromDt = moment(this.fromDate.Date).format('YYYY-MM-DD');
                    const toDt = moment(this.toDate.Date).format('YYYY-MM-DD');
                    return `accounting/accountquery?tabIndex=1&fromDate=${fromDt}&toDate=${toDt}&year=${this.activeYear}&dateFieldIndex=0&account=${accountNo}`;
                })
                .setFilterable(true),
            new UniTableColumn('Account.AccountName', 'Kontonavn', UniTableColumnType.Text)
                .setTemplate(line => line.AccountAccountName)
                .setFilterable(true),
            new UniTableColumn('Ib', 'IB', UniTableColumnType.Money)
                .setFilterable(false)
                .setTemplate(line => line.Ib)
                .setIsSumColumn(true),
            new UniTableColumn('DebitCreditChange', 'Endring', UniTableColumnType.Money)
                .setFilterable(false)
                .setTemplate(line => line.Debet + line.Credit)
                .setIsSumColumn(true),
            new UniTableColumn('Debet', 'Debet', UniTableColumnType.Money)
                .setFilterable(false)
                .setTemplate(line => line.Debet)
                .setVisible(false)
                .setIsSumColumn(true),
            new UniTableColumn('Credit', 'Kredit', UniTableColumnType.Money)
                .setFilterable(false)
                .setVisible(false)
                .setTemplate(line => line.Credit)
                .setIsSumColumn(true),
            new UniTableColumn('Balance', 'Saldo', UniTableColumnType.Money)
                .setFilterable(false)
                .setTemplate(line => line.Balance)
                .setIsSumColumn(true)
        ];

        columns.forEach(x => {
            x.conditionalCls = (data) => this.getCssClasses(data, x.field);
        });

        if (visibleColumns && visibleColumns.length > 0) {
            columns.forEach(col => {
                if (visibleColumns.find(x => x === col.field)) {
                    col.visible = true;
                } else {
                    col.visible = false;
                }
            });
        }

        let pageSize = window.innerHeight // Window size
            - 144 // Form height
            - 20 // Body margin and padding
            - 32 // Application class margin
            - 64 // Unitable pagination
            - 91; // Unitable filter and thead

        pageSize = pageSize <= 33 ? 10 : Math.floor(pageSize / 34); // 34 = heigth of a single row

        return new UniTableConfig('accounting.balance.search', false, false)
            .setPageable(true)
            .setPageSize(pageSize)
            .setColumnMenuVisible(false)
            .setSearchable(false)
            .setEntityType('JournalEntryLine')
            .setFilters(unitableFilter)
            .setAllowGroupFilter(false)
            .setColumnMenuVisible(true)
            .setColumns(columns);
    }

    private getCssClasses(data, field) {
        let cssClasses = '';

        if (!data) {
            return '';
        }

        if (field === 'Balance' || field === 'Ib' || field === 'DebitCreditChange' || field === 'Credit' || field === 'Debit') {
            cssClasses += ' ' + (parseInt(data.value, 10) >= 0 ? 'number-good' : 'number-bad');
        }

        return cssClasses.trim();
    }

    public onFormFilterChange(event) {
        this.addTab();
        this.table.refreshTableData();
    }

    public onYearDropdownChange(value) {
        this.activeYear = value.Year;

        this.fromDate = {
            Date: moment(`${this.activeYear}-01-01`)
        };

        this.toDate = {
            Date: moment(`${this.activeYear}-12-31`)
        };
        this.addTab();
        this.table.refreshTableData();
    }

    public toExcel() {
        const params = this.GetUrlParams(null, false);
        this.statisticsService.GetExportedExcelFileFromUrlParams(params)
            .finally(() => this.loading$.next(false))
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
                    filename = 'export.xlsx';
                }

                const blob = new Blob([result.body], { type: 'text/csv' });
                // download file so the user can open it
                saveAs(blob, filename);
            }, err => this.errorService.handle(err));
    }
}
