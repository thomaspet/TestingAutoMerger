import {IToolbarConfig} from '../../../../components/common/toolbar/toolbar';
import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {
    UniTable,
    UniTableColumn,
    UniTableConfig,
    UniTableColumnType,
    ITableFilter,
    ICellClickEvent
} from '../../../../../framework/ui/unitable/index';
import {
    TransqueryDetailsCalculationsSummary
} from '../../../../models/accounting/TransqueryDetailsCalculationsSummary';
import {URLSearchParams, Response} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import {JournalEntry, Account, FinancialYear} from '../../../../unientities';
import {TabService, UniModules} from '../../../layout/navbar/tabstrip/tabService';
import {ToastService, ToastType, ToastTime} from '../../../../../framework/uniToast/toastService';
import {ImageModal} from '../../../common/modals/ImageModal';
import {ISummaryConfig} from '../../../common/summary/summary';
import {
    JournalEntryLineService,
    JournalEntryService,
    ErrorService,
    NumberFormat,
    StatisticsService,
    AccountService,
    FinancialYearService,
    BrowserStorageService
} from '../../../../services/services';

import {
    UniModalService,
    ConfirmActions,
} from '../../../../../framework/uniModal/barrel';
import {ConfirmCreditedJournalEntryWithDate} from '../../modals/confirmCreditedJournalEntryWithDate';

import {FieldType} from '../../../../../framework/ui/uniform/index';
import * as moment from 'moment';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';

const PAPERCLIP = '📎'; // It might look empty in your editor, but this is the unicode paperclip

interface ISearchParams {
    JournalEntryNumberNumeric?: number;
    AccountID?: number;
    AccountNumber?: number;
    AccountYear?: number;
}

@Component({
    selector: 'transquery-details',
    templateUrl: './transqueryDetails.html',
})
export class TransqueryDetails implements OnInit {
    @ViewChild(UniTable)
    private table: UniTable;

    private summaryData: TransqueryDetailsCalculationsSummary;
    private uniTableConfig: UniTableConfig;
    private lookupFunction: (urlParams: URLSearchParams) => any;
    private configuredFilter: string;
    private allowManualSearch: boolean = true;
    public summary: ISummaryConfig[] = [];
    private lastFilterString: string;

    private searchParams$: BehaviorSubject<ISearchParams> = new BehaviorSubject({});
    public config$: BehaviorSubject<any> = new BehaviorSubject({autofocus: true});
    private fields$: BehaviorSubject<any[]> = new BehaviorSubject([]);

    private financialYears: Array<FinancialYear> = null;
    private activeFinancialYear: FinancialYear;

    public toolbarconfig: IToolbarConfig = {
        title: 'Forespørsel på bilag'
    };

    private COLUMN_VISIBILITY_LOCALSTORAGE_KEY: string = 'TransqueryDetailsColumnVisibility';

    constructor(
        private route: ActivatedRoute,
        private journalEntryLineService: JournalEntryLineService,
        private tabService: TabService,
        private statisticsService: StatisticsService,
        private toastService: ToastService,
        private numberFormat: NumberFormat,
        private errorService: ErrorService,
        private journalEntryService: JournalEntryService,
        private accountService: AccountService,
        private financialYearService: FinancialYearService,
        private storageService: BrowserStorageService,
        private router: Router,
        private modalService: UniModalService
    ) {
        this.tabService.addTab({
            'name': 'Forespørsel bilag',
            url: '/accounting/transquery/details',
            moduleID: UniModules.TransqueryDetails,
            active: true
        });
    }

    public ngOnInit() {
        // setup unitable and router parameter subscriptions
        Observable.forkJoin(
            this.financialYearService.GetAll(null),
            this.financialYearService.getActiveFinancialYear()
        ).subscribe(data => {
            this.financialYears = data[0];
            this.activeFinancialYear = data[1];

            // set default value for filtering
            let searchParams: ISearchParams = {
                JournalEntryNumberNumeric: null,
                AccountID: null,
                AccountNumber: null,
                AccountYear: null
            };

            if (this.activeFinancialYear) {
                searchParams.AccountYear = this.activeFinancialYear.Year;
            }

            this.searchParams$.next(searchParams);

            // setup uniform (filters in the top of the page)

            this.fields$.next(this.getLayout().Fields);

            this.route.params.subscribe(params => {
                const unitableFilter = this.generateUnitableFilters(params);
                this.uniTableConfig = this.generateUniTableConfig(unitableFilter, params);
                this.lookupFunction = (urlParams: URLSearchParams) =>
                    this.getTableData(urlParams).catch((err, obs) => this.errorService.handleRxCatch(err, obs));
            });
        });
    }

    private getTableData(urlParams: URLSearchParams): Observable<Response> {
        urlParams = urlParams || new URLSearchParams();
        const filtersFromUniTable = urlParams.get('filter');
        const filters = filtersFromUniTable ? [filtersFromUniTable] : [this.configuredFilter];
        let searchParams = this.searchParams$.getValue();

        if (filters && filters.length > 0) {
            let newFilters = [];
            let splitFilters = filters[0].split(' and ');

            splitFilters.forEach(x => {
                if (x.startsWith('Period.AccountYear eq ')) {
                    // get correct year in uniform accountyear filter
                    let year = parseInt(x.split("'")[1]);
                    searchParams.AccountYear = year;
                }

                if (!x.startsWith('Period.AccountYear eq ') &&
                    !x.startsWith('Account.ID eq ') &&
                    !x.startsWith('JournalEntryNumberNumeric eq ')) {
                    newFilters.push(x);
                }
            });

            filters[0] = newFilters.join(' and ');
        }

        if (this.allowManualSearch) {
            if (searchParams.AccountYear) {
                filters.push(`Period.AccountYear eq ${searchParams.AccountYear}`);
            }

            if (searchParams.AccountNumber) {
                filters.push(`Account.AccountNumber eq ${searchParams.AccountNumber}`);
            }

            if (searchParams.AccountID) {
                filters.push(`Account.ID eq ${searchParams.AccountID}`);
            }

            if (searchParams.JournalEntryNumberNumeric) {
                filters.push(`JournalEntryNumberNumeric eq ${searchParams.JournalEntryNumberNumeric}`);
            }
        }

        // remove empty first filter - this is done if we have multiple filters but the first one is
        // empty (this would generate an invalid filter clause otherwise)
        if (filters[0] === '') {
            filters.shift();
        }

        urlParams.set('model', 'JournalEntryLine');
        urlParams.set('select',
            'ID as ID,' +
            'JournalEntryNumberNumeric,' +
            'JournalEntryNumber,' +
            'Account.AccountNumber,' +
            'Account.AccountName,' +
            'SubAccount.AccountNumber,' +
            'SubAccount.AccountName,' +
            'FinancialDate,' +
            'VatDate,' +
            'Description,' +
            'VatType.VatCode,' +
            'Amount,' +
            'AmountCurrency,' +
            'CurrencyCode.Code,' +
            'CurrencyExchangeRate,' +
            'TaxBasisAmount,' +
            'TaxBasisAmountCurrency,' +
            'VatReportID,' +
            'RestAmount,' +
            'RestAmountCurrency,' +
            'StatusCode,' +
            'InvoiceNumber,' +
            'DueDate,' +
            'Department.Name,' +
            'Project.Name,' +
            'Department.DepartmentNumber,' +
            'Project.ProjectNumber,' +
            'TerminPeriod.No,' +
            'TerminPeriod.AccountYear,' +
            'Period.AccountYear,' +
            'JournalEntryID as JournalEntryID,' +
            'ReferenceCreditPostID as ReferenceCreditPostID,' +
            'OriginalReferencePostID as OriginalReferencePostID,' +
            'VatDeductionPercent as VatDeductionPercent,' +
            'JournalEntry.JournalEntryAccrualID,' +
            'sum(casewhen(FileEntityLink.EntityType eq \'JournalEntry\'\\,1\\,0)) as Attachments'
        );
        urlParams.set(
            'expand',
            'Account,SubAccount,JournalEntry,VatType,Dimensions.Department'
                + ',Dimensions.Project,Period,VatReport.TerminPeriod,CurrencyCode'
        );
        urlParams.set('join', 'JournalEntryLine.JournalEntryID eq FileEntityLink.EntityID');
        urlParams.set('filter', filters.join(' and '));
        urlParams.set('orderby', urlParams.get('orderby') || 'JournalEntryID desc');

        return this.statisticsService.GetAllByUrlSearchParams(urlParams);
    }

    public onFiltersChange(filter: string) {
        this.lastFilterString = filter;
        let f = this.configuredFilter || filter;
        if (f) {
            f = f.split('Dimensions.').join('');
            let urlParams = new URLSearchParams();
            urlParams.set('model', 'JournalEntryLine');
            urlParams.set('filter', f);
            urlParams.set(
                'select',
                'sum(casewhen(JournalEntryLine.Amount gt 0\\,JournalEntryLine.Amount\\,0)) as SumDebit,'
                    + 'sum(casewhen(JournalEntryLine.Amount lt 0\\,JournalEntryLine.Amount\\,0)) as SumCredit,'
                    + 'sum(casewhen(JournalEntryLine.AccountID gt 0\\,JournalEntryLine.Amount\\,0)) as SumLedger,'
                    + 'sum(JournalEntryLine.TaxBasisAmount) as SumTaxBasisAmount,'
                    + 'sum(JournalEntryLine.Amount) as SumBalance'
            );
            urlParams.set(
                'expand',
                'Account,SubAccount,JournalEntry,VatType,Dimensions.Department,'
                    + 'Dimensions.Project,Period,VatReport.TerminPeriod,CurrencyCode'
            );
            this.statisticsService.GetDataByUrlSearchParams(urlParams).subscribe(summary => {
                this.summaryData = summary.Data[0];
                this.summaryData.SumCredit *= -1;
                this.setSums();
            }, err => this.errorService.handle(err));
        } else {
            this.summaryData = null;
        }
    }

    private setSums() {
        let sumItems = [{
                value: this.summaryData ? this.numberFormat.asMoney(this.summaryData.SumDebit || 0) : null,
                title: 'Sum debet',
            }, {
                value: this.summaryData ? this.numberFormat.asMoney(this.summaryData.SumCredit || 0) : null,
                title: 'Sum kreditt',
            }, {
                value: this.summaryData ? this.numberFormat.asMoney(this.summaryData.SumLedger || 0) : null,
                title: 'Sum reskontro',
            }, {
                value: this.summaryData ? this.numberFormat.asMoney(this.summaryData.SumBalance || 0) : null,
                title: 'Saldo',
            }];

        this.summary = sumItems;
    }

    private isEmpty(obj) {
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                return false;
            }
        }
        return true;
    }

    private generateUnitableFilters(routeParams: any): ITableFilter[] {
        this.allowManualSearch = true;
        this.configuredFilter = '';
        const filter: ITableFilter[] = [];
        let searchParams = this.searchParams$.getValue();
        if (this.isEmpty(routeParams)) {
            if (searchParams.AccountID || searchParams.AccountNumber) {
                searchParams.AccountID = null;
                searchParams.AccountNumber = null;
                this.searchParams$.next(searchParams);
            }
        } else if (
            routeParams['Account_AccountNumber']
            && routeParams['year']
            && routeParams['period']
            && routeParams['isIncomingBalance']
        ) {
            const accountYear = `01.01.${routeParams['year']}`;
            const nextAccountYear = `01.01.${parseInt(routeParams['year']) + 1}`;
            filter.push({
                field: 'Account.AccountNumber',
                operator: 'eq',
                searchValue: routeParams['Account_AccountNumber'],
                value: routeParams['Account_AccountNumber'],
                group: 0,
                selectConfig: null
            });

            if (+routeParams['period'] === 0) {
                filter.push({
                    field: 'FinancialDate',
                    operator: 'lt',
                    searchValue: accountYear,
                    value: accountYear,
                    group: 0,
                    selectConfig: null
                });
            } else if (+routeParams['period'] === 13) {
                if (routeParams['isIncomingBalance'] === 'true') {
                    filter.push({
                        field: 'FinancialDate',
                        operator: 'lt',
                        searchValue: nextAccountYear,
                        value: nextAccountYear,
                        group: 0,
                        selectConfig: null
                    });
                } else {
                    filter.push({
                        field: 'FinancialDate',
                        operator: 'ge',
                        searchValue: accountYear,
                        value: accountYear,
                        group: 0,
                        selectConfig: null
                    });

                    filter.push({
                        field: 'FinancialDate',
                        operator: 'lt',
                        searchValue: nextAccountYear,
                        value: nextAccountYear,
                        group: 0,
                        selectConfig: null
                    });
                }
            } else {
                const periodDates = this.journalEntryLineService
                    .periodNumberToPeriodDates(routeParams['period'], routeParams['year']);
                filter.push({
                    field: 'FinancialDate',
                    operator: 'ge',
                    searchValue: periodDates.firstDayOfPeriod,
                    value: periodDates.firstDayOfPeriod,
                    group: 0,
                    selectConfig: null
                });

                filter.push({
                    field: 'FinancialDate',
                    operator: 'le',
                    searchValue: periodDates.lastDayOfPeriod,
                    value: periodDates.lastDayOfPeriod,
                    group: 0, selectConfig: null
                });
            }
        } else if (routeParams['Account_AccountNumber']) {
            searchParams.AccountID = null;
            searchParams.AccountNumber = routeParams['Account_AccountNumber'];
            this.searchParams$.next(searchParams);
        } else if (
            routeParams['vatCodesAndAccountNumbers']
            && routeParams['vatFromDate']
            && routeParams['vatToDate']
            && routeParams['showTaxBasisAmount']
        ) {
            // this is a two-dimensional array, "vatcode1|accountno1,vatcode2|accountno2,etc"
            const vatCodesAndAccountNumbers: Array<string> = routeParams['vatCodesAndAccountNumbers'].split(',');


            this.configuredFilter = '';

            if (routeParams['vatReportID'] && routeParams['vatReportID'] !== '0') {
                this.configuredFilter += `VatReportID eq '${routeParams['vatReportID']}' `
                    + `and TaxBasisAmount ne 0 `;
            } else if (routeParams['vatReportID'] === '0') {
                const threeYearsAgo = moment(routeParams['vatFromDate']).subtract(3, 'year');
                const vatFromDate = threeYearsAgo.format('YYYY.MM.DD');

                this.configuredFilter += `VatDate le '${routeParams['vatToDate']}' `
                    + `and VatDate ge '${vatFromDate}' `
                    + `and isnull(VatReportID,0) eq 0 `
                    + `and TaxBasisAmount ne 0 `;
            } else {
                this.configuredFilter += `VatDate ge '${routeParams['vatFromDate']}' `
                    + `and VatDate le '${routeParams['vatToDate']}' `
                    + `and TaxBasisAmount ne 0 `;
            }

            if (vatCodesAndAccountNumbers && vatCodesAndAccountNumbers.length > 0) {
                if (vatCodesAndAccountNumbers.length > 1) {
                    this.configuredFilter += ' and (';
                } else {
                    this.configuredFilter += ' and ';
                }

                for (let index = 0; index < vatCodesAndAccountNumbers.length; index++) {
                    const vatCodeAndAccountNumber = vatCodesAndAccountNumbers[index].split('|');

                    const vatCode = vatCodeAndAccountNumber[0];
                    const accountNo = vatCodeAndAccountNumber[1];
                    if (index > 0) {
                        this.configuredFilter += ' or ';
                    }
                    this.configuredFilter += `( VatType.VatCode eq '${vatCode}' `
                        + `and Account.AccountNumber eq ${accountNo} )`;
                }

                if (vatCodesAndAccountNumbers.length > 1) { this.configuredFilter += ') '; }

                this.allowManualSearch = false;
            }
        } else if (routeParams['journalEntryNumber']) {
            filter.push({
                field: 'JournalEntryNumber',
                operator: 'eq',
                value: routeParams['journalEntryNumber'],
                searchValue: routeParams['journalEntryNumber'],
                group: 0,
                selectConfig: null
            });

            this.allowManualSearch = false;
        } else {
            for (const field of Object.keys(routeParams)) {
                filter.push({
                    field: field.replace('_', '.'),
                    operator: 'eq',
                    value: routeParams[field],
                    searchValue: routeParams[field],
                    group: 0,
                    selectConfig: null
                });
            }
        }
        return filter;
    }

    private creditJournalEntry(item: any) {
        this.modalService.open(ConfirmCreditedJournalEntryWithDate, {
            header: `Kreditere bilag ${item.JournalEntryLineJournalEntryNumber}?`,
            message: 'Vil du kreditere hele dette bilaget?',
            buttonLabels: {
                accept: 'Krediter',
                cancel: 'Avbryt'
            },
            data: {VatDate: item.JournalEntryLineVatDate.split('T')[0]}
        }).onClose.subscribe(response => {
            if (response.action === ConfirmActions.ACCEPT) {
                this.journalEntryService.creditJournalEntry(item.JournalEntryLineJournalEntryNumber, response.input)
                    .subscribe(
                        res => {
                            this.toastService.addToast(
                                'Kreditering utført',
                                ToastType.good,
                                ToastTime.short
                            );

                            this.table.refreshTableData();

                            // Force summary recalc
                            if (this.lastFilterString) {
                                this.onFiltersChange(this.lastFilterString);
                            }
                        },
                        err => this.errorService.handle(err)
                    );
            }
        });
    }

    private editJournalEntry(journalEntryID, journalEntryNumber) {
        let data = this.journalEntryService.getSessionData(0);
        let url = '/accounting/journalentry/manual'
                + `;journalEntryNumber=${journalEntryNumber}`
                + `;journalEntryID=${journalEntryID};editmode=true`;

        if (data && data.length > 0
            && (!data[0].JournalEntryID || data[0].JournalEntryID.toString() !== journalEntryID.toString())) {
                this.modalService.openRejectChangesModal()
                    .onClose
                    .subscribe(result => {
                        if (result === ConfirmActions.REJECT) {
                            this.journalEntryService.setSessionData(0, []);
                            this.router.navigateByUrl(url);
                        }
                    });
        } else {
            this.router.navigateByUrl(url);
        }
    }

    private generateUniTableConfig(unitableFilter: ITableFilter[], routeParams: any): UniTableConfig {
        const showTaxBasisAmount = routeParams && routeParams['showTaxBasisAmount'] === 'true';
        const visibleColumnsString = this.storageService.getItem(this.COLUMN_VISIBILITY_LOCALSTORAGE_KEY);

        let visibleColumns = [];
        if (visibleColumnsString) {
            visibleColumns = JSON.parse(visibleColumnsString);
        }

        const columns = [
            new UniTableColumn('JournalEntryNumberNumeric', 'Bnr.', UniTableColumnType.Link)
                .setTemplate(row => row.JournalEntryLineJournalEntryNumberNumeric || 'null')
                .setLinkResolver(row => `/accounting/transquery/details;journalEntryNumber=${row.JournalEntryLineJournalEntryNumber}`)
                .setFilterOperator('startswith')
                .setWidth('65px'),
                new UniTableColumn('JournalEntryNumber', 'Bnr. med år', UniTableColumnType.Link)
                .setDisplayField('JournalEntryLineJournalEntryNumber')
                .setLinkResolver(row => `/accounting/transquery/details;journalEntryNumber=${row.JournalEntryLineJournalEntryNumber}`)
                .setFilterOperator('startswith')
                .setVisible(false),
            new UniTableColumn('Account.AccountNumber', 'Kontonr.', UniTableColumnType.Link)
                .setDisplayField('AccountAccountNumber')
                .setLinkResolver(row => `/accounting/transquery/details;Account_AccountNumber=${row.AccountAccountNumber}`)
                .setWidth('85px')
                .setFilterOperator('startswith'),
            new UniTableColumn('Account.AccountName', 'Kontonavn', UniTableColumnType.Text)
                .setFilterOperator('contains')
                .setTemplate(line => line.AccountAccountName),
            new UniTableColumn('SubAccount.AccountNumber', 'Reskontronr.', UniTableColumnType.Link)
                .setDisplayField('SubAccountAccountNumber')
                .setLinkResolver(row => `/accounting/transquery/details;SubAccount_AccountNumber=${row.SubAccountAccountNumber}`)
                .setVisible(false)
                .setWidth('90px')
                .setFilterOperator('startswith'),
            new UniTableColumn('SubAccount.AccountName', 'Reskontro', UniTableColumnType.Text)
                .setFilterOperator('contains')
                .setTemplate(line => line.SubAccountAccountName)
                .setVisible(false),
            new UniTableColumn('FinancialDate', 'Regnskapsdato', UniTableColumnType.LocalDate)
                .setFilterOperator('contains')
                .setFormat('DD.MM.YYYY')
                .setWidth('110px')
                .setTemplate(line => line.JournalEntryLineFinancialDate),
            new UniTableColumn('VatDate', 'Mva-dato', UniTableColumnType.LocalDate)
                .setFilterOperator('contains')
                .setFormat('DD.MM.YYYY')
                .setWidth('110px')
                .setTemplate(line => line.JournalEntryLineVatDate),
            new UniTableColumn('Description', 'Beskrivelse', UniTableColumnType.Text)
                .setWidth('20%')
                .setFilterOperator('contains')
                .setDisplayField('JournalEntryLineDescription'),
            new UniTableColumn('VatType.VatCode', 'Mva-kode', UniTableColumnType.Text)
                .setFilterOperator('startswith')
                .setWidth('60px')
                .setDisplayField('VatTypeVatCode'),
            new UniTableColumn('VatDeductionPercent', 'Fradrag %', UniTableColumnType.Number)
                .setFilterOperator('startswith')
                .setDisplayField('VatDeductionPercent')
                .setVisible(false),
            new UniTableColumn('Amount', 'Beløp', UniTableColumnType.Money)
                .setFilterOperator('eq')
                .setTemplate(line => line.JournalEntryLineAmount),
            new UniTableColumn('AmountCurrency', 'V-beløp', UniTableColumnType.Money)
                .setFilterOperator('eq')
                .setDisplayField('JournalEntryLineAmountCurrency')
                .setVisible(false),
            new UniTableColumn('CurrencyCode.Code', 'Valuta', UniTableColumnType.Text)
                .setFilterOperator('contains')
                .setDisplayField('CurrencyCodeCode')
                .setVisible(false),
            new UniTableColumn('CurrencyExchangeRate', 'V-kurs', UniTableColumnType.Number)
                .setFilterOperator('startswith')
                .setDisplayField('JournalEntryLineCurrencyExchangeRate')
                .setVisible(false),
            new UniTableColumn('TaxBasisAmount', 'Grunnlag mva', UniTableColumnType.Money)
                .setFilterOperator('eq')
                .setVisible(showTaxBasisAmount)
                .setDisplayField('JournalEntryLineTaxBasisAmount'),
            new UniTableColumn('TaxBasisAmountCurrency', 'V-grunnlag mva', UniTableColumnType.Money)
                .setFilterOperator('eq')
                .setVisible(showTaxBasisAmount)
                .setTemplate(line => line.JournalEntryLineTaxBasisAmountCurrency),
            new UniTableColumn('TerminPeriod.No', 'MVA rapportert', UniTableColumnType.Text)
                .setTemplate(line => line.JournalEntryLineVatReportID ? line.JournalEntryLineVatReportID : 'Nei')
                .setFilterable(false)
                .setVisible(false),
            new UniTableColumn('InvoiceNumber', 'Fakturanr.', UniTableColumnType.Text)
                .setCls('column-align-right')
                .setFilterOperator('startswith')
                .setVisible(false)
                .setDisplayField('JournalEntryLineInvoiceNumber'),
            new UniTableColumn('DueDate', 'Forfall', UniTableColumnType.LocalDate)
                .setDisplayField('JournalEntryLineDueDate')
                .setFilterOperator('contains')
                .setVisible(false),
            new UniTableColumn('RestAmount', 'Restbeløp', UniTableColumnType.Money)
                .setFilterOperator('eq')
                .setDisplayField('JournalEntryLineRestAmount')
                .setVisible(false),
            new UniTableColumn('RestAmountCurrency', 'V-restbeløp', UniTableColumnType.Money)
                .setFilterOperator('eq')
                .setDisplayField('JournalEntryLineRestAmountCurrency')
                .setVisible(false),
            new UniTableColumn('StatusCode', 'Status', UniTableColumnType.Text)
                .setFilterable(false)
                .setTemplate(line => this.journalEntryLineService.getStatusText(line.JournalEntryLineStatusCode))
                .setVisible(false),
            new UniTableColumn('Department.Name', 'Avdeling', UniTableColumnType.Text)
                .setFilterOperator('contains')
                .setTemplate(line => {
                    return line.DepartmentDepartmentNumber
                        ? line.DepartmentDepartmentNumber + ': ' + line.DepartmentName
                        : '';
                })
                .setVisible(false),
            new UniTableColumn('Project.Name', 'Prosjekt', UniTableColumnType.Text)
                .setFilterOperator('contains')
                .setTemplate(line => {
                    return line.ProjectProjectNumber ? line.ProjectProjectNumber + ': ' + line.ProjectName : '';
                })
                .setVisible(false),
            new UniTableColumn('JournalEntry.JournalEntryAccrualID', 'Periodisering', UniTableColumnType.Link)
                .setFilterOperator('eq')
                .setWidth('60px')
                .setVisible(false)
                .setDisplayField('JournalEntryJournalEntryAccrualID')
                .setLinkResolver(row => `/accounting/transquery/details;`
                    + `JournalEntry_JournalEntryAccrualID=${row.JournalEntryJournalEntryAccrualID}`
                ),
            new UniTableColumn('ID', PAPERCLIP, UniTableColumnType.Text)
                .setFilterOperator('contains')
                .setTemplate(line => line.Attachments ? PAPERCLIP : '')
                .setWidth('40px')
                .setFilterable(false)
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

        return new UniTableConfig('accounting.transquery.details', false, false)
            .setPageable(true)
            .setPageSize(pageSize)
            .setColumnMenuVisible(false)
            .setSearchable(this.allowManualSearch)
            .setFilters(unitableFilter)
            .setAllowGroupFilter(true)
            .setColumnMenuVisible(true)
            .setDataMapper((data) => {
                let tmp = data !== null ? data.Data : [];

                if (data !== null && data.Message !== null && data.Message !== '') {
                    this.toastService.addToast('Feil ved henting av data, ' + data.Message, ToastType.bad);
                }

                return tmp;
            })
            .setContextMenu([
                {
                    action: (item) => this.creditJournalEntry(item),
                    disabled: (item) => false,
                    label: 'Krediter bilag'
                },
                {
                    action: (item) => this.editJournalEntry(
                        item.JournalEntryID,
                        item.JournalEntryLineJournalEntryNumber
                    ),
                    disabled: (item) => false,
                    label: 'Korriger bilag'
                }
            ])
            .setColumns(columns);
    }

    public onCellClick(event: ICellClickEvent) {
        if (event.column.field === 'ID') {
            let data = {
                entity: JournalEntry.EntityType,
                entityID: event.row.JournalEntryID

            };
            this.modalService.open(ImageModal, { data: data });
        }
    }

    private getCssClasses(data, field) {
        let cssClasses = '';

        if (data.ReferenceCreditPostID || data.OriginalReferencePostID) {
            cssClasses += 'journal-entry-credited';
        } else {
            if (field === 'Amount') {
                cssClasses += ' ' + (data.JournalEntryLineAmount >= 0 ? 'number-good' : 'number-bad');
            }

            if (field === 'AmountCurrency') {
                cssClasses += ' ' + (data.JournalEntryLineAmountCurrency >= 0 ? 'number-good' : 'number-bad');
            }
            if (field === 'RestAmount') {
                cssClasses += ' ' + (data.JournalEntryLineRestAmount >= 0 ? 'number-good' : 'number-bad');
            }
            if (field === 'RestAmountCurrency') {
                cssClasses += ' ' + (data.JournalEntryLineRestAmountCurrency >= 0 ? 'number-good' : 'number-bad');
            }
        }

        return cssClasses.trim();
    }

    public onFormFilterChange(event) {
        this.table.refreshTableData();
    }

    private getLayout() {
        return {
            Name: 'TransqueryList',
            BaseEntity: 'Account',
            Fields: [
                {
                    EntityType: 'JournalEntryLine',
                    Property: 'JournalEntryNumberNumeric',
                    FieldType: FieldType.AUTOCOMPLETE,
                    Label: 'Bnr.',
                    Placeholder: 'Bnr.',
                    Options: {
                        search: (query: string) => {
                            const searchParams = this.searchParams$.getValue();
                            const isNumber = !isNaN(<any>query);
                            if (!query) {
                                return this.journalEntryService.GetAll('top=20')
                                    .catch((err, obs) => this.errorService.handleRxCatch(err, obs));
                            } else if (isNumber) {
                                return this.journalEntryService.GetAll(
                                    `filter=startswith(JournalEntryNumberNumeric, '${query}') `
                                    + `and FinancialYear.Year eq '${searchParams.AccountYear}'&top=20`,
                                    ['FinancialYear']
                                ).catch((err, obs) => this.errorService.handleRxCatch(err, obs));
                            } else {
                                return Observable.of([]);
                            }
                        },
                        displayProperty: 'JournalEntryNumberNumeric',
                        valueProperty: 'JournalEntryNumberNumeric',
                        minLength: 1,
                        debounceTime: 200
                    }
                },
                {
                    EntityType: 'JournalEntryLine',
                    Property: 'AccountID',
                    FieldType: FieldType.AUTOCOMPLETE,
                    Label: 'Kontonr.',
                    Placeholder: 'Kontonr.',
                    Options: {
                        getDefaultData: () => {
                            let searchParams = this.searchParams$.getValue();
                            if (searchParams.AccountID) {
                                return this.accountService.searchAccounts(`ID eq ${searchParams.AccountID}`);
                            } else if (searchParams.AccountNumber) {
                                return this.accountService.searchAccounts(
                                    `AccountNumber eq ${searchParams.AccountNumber}`
                                );
                            }
                            return Observable.of([]);
                        },
                        search: (query: string) => {
                            const isNumber = !isNaN(parseInt(query, 10));

                            if (isNumber) {
                                return this.accountService.searchAccounts(
                                    `( ( AccountNumber eq '${+query}') or (Visible eq 'true' `
                                    + `and (startswith(AccountNumber,'${+query}') ) ) ) `
                                    + `and isnull(AccountID,0) eq 0`
                                );
                            } else {
                                return this.accountService.searchAccounts(
                                    `( Visible eq 'true' `
                                    + `and contains(AccountName,'${query || ''}') ) `
                                    + `and isnull(AccountID,0) eq 0`
                                );
                            }
                        },
                        displayProperty: 'AccountName',
                        valueProperty: 'ID',
                        template: (account: Account) => {
                            return account ? `${account.AccountNumber}: ${account.AccountName}` : '';
                        },
                        minLength: 0,
                        debounceTime: 200
                    }
                },
                {
                    EntityType: 'JournalEntryLine',
                    Property: 'AccountYear',
                    FieldType: FieldType.DROPDOWN,
                    Label: 'Regnskapsår',
                    Placeholder: 'Regnskapsår',
                    Options: {
                        source: this.financialYears,
                        valueProperty: 'Year',
                        debounceTime: 200,
                        template: (item) => {
                            return item ? item.Year.toString() : '';
                        },
                        searchable: false,
                        hideDeleteButton: true
                    }
                }
            ]
        };
    }
}
