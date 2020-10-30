import { IToolbarConfig } from '../../common/toolbar/toolbar';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
    UniTableColumn,
    UniTableConfig,
    UniTableColumnType,
    ITableFilter,
    ICellClickEvent
} from '../../../../framework/ui/unitable/index';
import { AgGridWrapper } from '@uni-framework/ui/ag-grid/ag-grid-wrapper';
import {
    TransqueryDetailsCalculationsSummary
} from '../../../models/accounting/TransqueryDetailsCalculationsSummary';
import { HttpParams } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { JournalEntry, JournalEntryLine, FinancialYear } from '../../../unientities';
import { TabService, UniModules } from '../../layout/navbar/tabstrip/tabService';
import { ToastService, ToastType, ToastTime } from '../../../../framework/uniToast/toastService';
import { UniForm, FieldType } from '../../../../framework/ui/uniform/index';
import { ImageModal } from '../../common/modals/ImageModal';
import { ISummaryConfig } from '../../common/summary/summary';
import {
    ErrorService,
    NumberFormat,
    StatisticsService,
    FinancialYearService,
    BrowserStorageService,
    PageStateService
} from '../../../services/services';

import {
    UniModalService,
    ConfirmActions,
} from '../../../../framework/uni-modal';

import { BehaviorSubject, Subject } from 'rxjs';
import * as moment from 'moment';
import * as _ from 'lodash';

@Component({
    selector: 'balance-search',
    templateUrl: './balanceSearch.html'
})
export class BalanceSearch implements OnInit {
    @ViewChild(AgGridWrapper, { static: true })
    private table: AgGridWrapper;

    @ViewChild(UniForm)
    private uniForm: UniForm;

    summaryData: TransqueryDetailsCalculationsSummary;
    uniTableConfig: UniTableConfig;
    lookupFunction: (urlParams: HttpParams) => any;
    columnSumResolver: (urlParams: HttpParams) => Observable<{ [field: string]: number }>;
    summary: ISummaryConfig[] = [];
    showCredited: boolean = false;

    loading$: Subject<boolean> = new Subject();
    private lastFilterString: string;
    private searchTimeout;
    private configuredFilter: string = '';
    // searchParams$: BehaviorSubject<ISearchParams> = new BehaviorSubject({});

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
    // fields$: BehaviorSubject<any[]> = new BehaviorSubject([]);

    financialYears: Array<FinancialYear> = null;
    private activeFinancialYear: FinancialYear;

    toolbarconfig: IToolbarConfig = {
        title: 'Søk på saldo'
    };

    private COLUMN_VISIBILITY_LOCALSTORAGE_KEY: string = 'BalanceSearchColumnVisibility';

    constructor(
        private route: ActivatedRoute,
        private tabService: TabService,
        private statisticsService: StatisticsService,
        private toastService: ToastService,
        private numberFormat: NumberFormat,
        private errorService: ErrorService,
        private financialYearService: FinancialYearService,
        private storageService: BrowserStorageService,
        private router: Router,
        private modalService: UniModalService,
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
        this.loading$.next(true);
        urlParams = urlParams || new HttpParams();

        const filtersFromUniTable = urlParams.get('filter');
        const filters = filtersFromUniTable ? [filtersFromUniTable] : [this.configuredFilter];

        const startPeriod = this.fromDate.Date.month() + 1;
        const startYear = this.fromDate.Date.year();
        const endPeriod = this.toDate.Date.month() + 1;
        const endYear = this.toDate.Date.year();
        const fromD = moment(this.fromDate.Date).format('YYYY-MM-DD');
        const toD = moment(this.toDate.Date).format('YYYY-MM-DD');

        const Ib = `sum(casewhen((period.accountyear lt ${startYear}) or (period.accountyear eq ${startYear} and period.no lt ${startPeriod}),amount,0))`;
        const Debet = `sum(casewhen(period.fromdate ge '${fromD}' and period.todate le '${toD}' and amount ge 0,amount,0))`;
        const Credit = `sum(casewhen(period.fromdate ge '${fromD}' and period.todate le '${toD}' and amount lt 0,amount,0))`;
        const Balance = `sum(casewhen((period.accountyear lt ${endYear} and account.accountnumber lt 3000) or (period.accountyear eq ${endYear} and period.no le ${endPeriod}),amount,0))`;


        // Find the searchvalue
        const splitted = filters[0].split(`'`);

        let searchValue;
        if (splitted.length > 1 && splitted[1] !== undefined) {
            searchValue = splitted[1];
        }

        // account.accountnumber ge 1000 and account.accountnumber le 9999 ?
        filters.push(`period.todate le '${moment(this.toDate.Date).format('YYYY-MM-DD')}'`);
        // remove empty first filter - this is done if we have multiple filters but the first one is
        // empty (this would generate an invalid filter clause otherwise)
        if (filters[0] === '') {
            filters.shift();
        }

        // Hack to be able to filter
        if (filters && filters[0]) {
            filters[0] = filters[0].replace('Balance', Balance);
            filters[0] = filters[0].replace('Debet', Debet);
            filters[0] = filters[0].replace('Credit', Credit);
            filters[0] = filters[0].replace('Ib', Ib);
        }


        if (filters.length > 1) {
            filters[0] = '( ' + filters[0] + ' )';
        }

        urlParams.get('orderby');


        const selectString = 'Account.AccountNumber,Account.Accountname,'
            + `${Ib} as Ib,${Debet} as Debet,${Credit} as Credit,${Balance} as Balance`;


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
            urlParams = urlParams.set('select', 'sum(Amount) as Balance');
            urlParams = urlParams.delete('orderby');
            return this.statisticsService.GetAllByHttpParams(urlParams)
                .map(res => res.body)
                .map(res => (res.Data && res.Data[0]) || []);
        } else {
            urlParams = urlParams.set('select', selectString);
            urlParams = urlParams.set('orderby', urlParams.get('orderby') || 'account.accountnumber');
            return this.statisticsService.GetAllByHttpParams(urlParams);
        }
    }

    public onFormReady() {
        this.uniForm.field('AccountYear').focus();
    }

    public addTab() {
        // const form = this.searchParams$.getValue();

        // Set page state service to make sure browser navigatio works
        this.pageStateService.setPageState('AccountYear', this.activeYear + '');
        this.pageStateService.setPageState('fromDate', moment(this.fromDate.Date).format('YYYY-MM-DD'));
        this.pageStateService.setPageState('toDate', moment(this.toDate.Date).format('YYYY-MM-DD'));


        this.tabService.addTab({
            name: 'Søk på bilag',
            url: this.pageStateService.getUrl(),
            moduleID: UniModules.TransqueryDetails,
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
                .setLinkClick(row => this.setSearchParamsOnLinkClick('AccountNumber', row.AccountAccountNumber))
                .setWidth('85px')
                .setFilterable(true),
            new UniTableColumn('Account.AccountName', 'Kontonavn', UniTableColumnType.Text)
                .setTemplate(line => line.AccountAccountName)
                .setFilterable(true),
            new UniTableColumn('Ib', 'IB', UniTableColumnType.Money)
                .setFilterable(false)
                .setTemplate(line => line.Ib)
                .setIsSumColumn(true),
            new UniTableColumn('Endring', 'Endring', UniTableColumnType.Money)
                .setFilterable(false)
                .setTemplate(line => line.Debet + line.Credit)
                .setIsSumColumn(true),
            new UniTableColumn('Debet', 'Debet', UniTableColumnType.Money)
                .setFilterable(false)
                .setTemplate(line => line.Debet)
                .setIsSumColumn(true),
            new UniTableColumn('Credit', 'Kredit', UniTableColumnType.Money)
                .setFilterable(false)
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
            .setSearchable(true)
            .setEntityType('JournalEntryLine')
            .setFilters(unitableFilter)
            .setAllowGroupFilter(true)
            .setColumnMenuVisible(true)
            .setColumns(columns);
    }

    public onCellClick(event: ICellClickEvent) {
        if (event.column.field === 'ID') {
            const modalOptions = {
                entity: JournalEntry.EntityType,
                entityID: event.row.JournalEntryID,
                singleImage: false,
                fileIDs: []
            };

            this.modalService.open(ImageModal, { data: modalOptions });
        }
    }

    private getCssClasses(data, field) {
        let cssClasses = '';

        if (!data) {
            return '';
        }

        if (field === 'Balance' || field === 'Ib' || field === 'Endring' || field === 'Credit' || field === 'Debit') {
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

        // this.setupFunction();
    }

    public toExcel() {
        //     this.loading$.next(true);
        //     let urlParams = new HttpParams();
        //     const filtersFromUniTable = this.table.getFilterString();
        //     const filters = filtersFromUniTable ? [filtersFromUniTable] : [this.configuredFilter];
        //     const searchParams = _.cloneDeep(this.searchParams$.getValue());
        //     // Find the searchvalue
        //     const splitted = filters[0].split(`'`);
        //     let searchValue;
        //     if (splitted.length > 1 && splitted[1] !== undefined) {
        //         searchValue = splitted[1];
        //     }

        //     if (searchParams.AccountYear) {
        //         filters.push(`Period.AccountYear eq ${searchParams.AccountYear}`);
        //     }
        //     if (searchParams.AccountNumber && !isNaN(searchParams.AccountNumber)) {
        //         filters.push(`(Account.AccountNumber eq ${searchParams.AccountNumber} or SubAccount.AccountNumber eq ${searchParams.AccountNumber})`);
        //     }
        //     let amount = searchParams.Amount ? searchParams.Amount.toString() : '';
        //     amount = amount.replace(',', '.');
        //     if (amount && !isNaN(+amount)) {
        //         filters.push(`Amount eq ${amount}`);
        //     }

        //     // remove empty first filter - this is done if we have multiple filters but the first one is
        //     // empty (this would generate an invalid filter clause otherwise)
        //     if (filters[0] === '') {
        //         filters.shift();
        //     }

        //     // Fix filter from unitable! Uses displaynames, causes errors!
        //     if (filters && filters[0]) {
        //         filters[0] = filters[0].replace(/JournalEntryLine/g, '');
        //     }

        //     if (filters.length > 1) {
        //         filters[0] = '( ' + filters[0] + ' )';
        //     }
        //     const selectString = 'account.accountnumber as accountnumber,account.accountname as accountname,'
        //         + 'sum(casewhen((period.accountyear lt 2020) or (period.accountyear eq 2020 and period.no lt 1),amount,0)) as ib,sum(casewhen((period.accountyear eq 2020) and (period.no lt 1),amount,0)) as ib_full,sum(casewhen((period.accountyear lt 2020),amount,0)) as ib_ud,sum(casewhen(period.accountyear eq 2020 and period.no ge 1 and period.no le 12 and amount ge 0,amount,0)) as debet,sum(casewhen(period.accountyear eq 2020 and period.no ge 1 and period.no le 12 and amount lt 0,amount,0)) as credit,sum(casewhen((period.accountyear le 2020 and account.accountnumber lt 3000) or (period.accountyear eq 2020 and period.no le 12),amount,0)) as balance';


        //     // Loop the columns in unitable to only get the data for the once visible!
        //     // this.table.columns.forEach((col) => {
        //     //     selectString += col.visible ? ',' + col.field : '';
        //     //     if (col.field.indexOf('Dimension') !== -1 && col.visible) {
        //     //         selectString += ',Dimension' + parseInt(col.field.substr(9, 3), 10) + '.Number';
        //     //         expandString += ',Dimensions.Dimension' + parseInt(col.field.substr(9, 3), 10);
        //     //     } else if (col.field.indexOf('Department') !== -1 && col.visible) {
        //     //         selectString += ',Department.DepartmentNumber';
        //     //     } else if (col.field.indexOf('Project') !== -1 && col.visible) {
        //     //         selectString += ',Project.ProjectNumber';
        //     //     }
        //     // });

        //     urlParams = urlParams.set('model', 'JournalEntryLine');
        //     urlParams = urlParams.set(
        //         'expand',
        //         'Account,SubAccount,JournalEntry,VatType,Dimensions.Department'
        //         + ',Dimensions.Project,Period,VatReport.TerminPeriod,CurrencyCode,JournalEntryType'
        //     );
        //     urlParams = urlParams.set('filter', filters.join(' and '));
        //     urlParams = urlParams.set('select', selectString);
        //     urlParams = urlParams.set('join',
        //         'JournalEntryLine.JournalEntryID eq FileEntityLink.EntityID and Journalentryline.createdby eq user.globalidentity');
        //     urlParams = urlParams.set('orderby', urlParams.get('orderby') || 'JournalEntryID desc');
        //     this.statisticsService.GetExportedExcelFileFromUrlParams(urlParams)
        //         .finally(() => this.loading$.next(false))
        //         .subscribe((result) => {
        //             let filename = '';
        //             // Get filename with filetype from headers
        //             if (result.headers) {
        //                 const fromHeader = result.headers.get('content-disposition');
        //                 if (fromHeader) {
        //                     filename = fromHeader.split('=')[1];
        //                 }
        //             }

        //             if (!filename || filename === '') {
        //                 filename = 'export.xlsx';
        //             }

        //             const blob = new Blob([result.body], { type: 'text/csv' });
        //             // download file so the user can open it
        //             saveAs(blob, filename);
        //         }, err => this.errorService.handle(err));
    }

    // private getLayout() {
    //     return {
    //         Name: 'TransqueryList',
    //         BaseEntity: 'Account',
    //         Fields: [
    //             {
    //                 EntityType: 'JournalEntryLine',
    //                 Property: 'AccountYear',
    //                 FieldType: FieldType.DROPDOWN,
    //                 Label: 'Regnskapsår',
    //                 Placeholder: 'Regnskapsår',
    //                 Options: {
    //                     source: this.financialYears,
    //                     valueProperty: 'Year',
    //                     debounceTime: 200,
    //                     template: (item) => {
    //                         return item ? item.Year.toString() : '';
    //                     },
    //                     searchable: false,
    //                     hideDeleteButton: true
    //                 }
    //             },
    //             // {
    //             //     EntityType: 'JournalEntryLine',
    //             //     Property: 'AccountNumber',
    //             //     FieldType: FieldType.TEXT,
    //             //     Label: 'Kontonr',
    //             //     Placeholder: 'Kontonr'
    //             // },
    //             // {
    //             //     EntityType: 'JournalEntryLine',
    //             //     Property: 'Amount',
    //             //     FieldType: FieldType.TEXT,
    //             //     Label: 'Beløp',
    //             //     Placeholder: 'Beløp'
    //             // }
    //         ]
    //     };
    // }
}
