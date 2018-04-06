import {IToolbarConfig} from '../../../components/common/toolbar/toolbar';
import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {
    UniTable,
    UniTableColumn,
    UniTableConfig,
    UniTableColumnType,
    ITableFilter,
    ICellClickEvent
} from '../../../../framework/ui/unitable/index';
import {
    TransqueryDetailsCalculationsSummary
} from '../../../models/accounting/TransqueryDetailsCalculationsSummary';
import {URLSearchParams, Response} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import {JournalEntry, Account, FinancialYear} from '../../../unientities';
import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';
import {ToastService, ToastType, ToastTime} from '../../../../framework/uniToast/toastService';
import {ImageModal} from '../../common/modals/ImageModal';
import {ISummaryConfig} from '../../common/summary/summary';
import {
    JournalEntryLineService,
    JournalEntryService,
    ErrorService,
    NumberFormat,
    StatisticsService,
    AccountService,
    FinancialYearService,
    BrowserStorageService,
    CustomDimensionService
} from '../../../services/services';

import {
    UniModalService,
    ConfirmActions,
} from '../../../../framework/uni-modal';
import {ConfirmCreditedJournalEntryWithDate} from '../modals/confirmCreditedJournalEntryWithDate';

import {FieldType} from '../../../../framework/ui/uniform/index';
import * as moment from 'moment';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import * as _ from 'lodash';

const PAPERCLIP = '📎'; // It might look empty in your editor, but this is the unicode paperclip

interface ISearchParams {
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
    private dimensionTypes: any[];

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
        private modalService: UniModalService,
        private customDimensionService: CustomDimensionService
    ) {
        this.tabService.addTab({
            'name': 'Forespørsel bilag',
            url: '/accounting/transquery',
            moduleID: UniModules.TransqueryDetails,
            active: true
        });
    }

    public ngOnInit() {
        // setup unitable and router parameter subscriptions
        Observable.forkJoin(
            this.financialYearService.GetAll(null),
            this.financialYearService.getActiveFinancialYear(),
            this.customDimensionService.getMetadata()
        ).subscribe(data => {
            this.financialYears = data[0];
            this.activeFinancialYear = data[1];
            this.dimensionTypes = data[2];

            // set default value for filtering
            const searchParams: ISearchParams = {
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
        const searchParams = _.cloneDeep(this.searchParams$.getValue());

        // Find the searchvalue
        const splitted = filters[0].split(`'`);

        let searchValue;
        if (splitted.length > 1 && splitted[1] !== undefined) {
            searchValue = splitted[1];
        }

        // If JournalEntryNumber is specified as urlParams
        if (splitted[0].includes('JournalEntryNumber ')) {
            filters[0] = `JournalEntryNumber eq '${searchValue}'`;
        // If search in unitable filter is text
        } else if (isNaN(searchValue) && !!searchValue && this.allowManualSearch) {
            filters[0] = `contains(Description, '${searchValue}') or contains(Account.AccountName, '${searchValue}')`;
        } else {
            if (filters && filters.length > 0) {
                const newFilters = [];
                const splitFilters = filters[0].split(' and ');

                splitFilters.forEach(x => {
                    if (!x.includes('Period.AccountYear eq ')) {
                        newFilters.push(x);
                    }
                });

                filters[0] = newFilters.join(' and ');
            }
        }

        const formFilters = [];
        if (this.allowManualSearch) {
            if (searchParams.AccountYear) {
                formFilters.push(`Period.AccountYear eq ${searchParams.AccountYear}`);
            }
        }

        let filterString = '';
        if (formFilters.length > 0) {
            filterString += '( ' + formFilters.join(' and ') + ' )';
            filters.push(filterString);
        }

        // remove empty first filter - this is done if we have multiple filters but the first one is
        // empty (this would generate an invalid filter clause otherwise)
        if (filters[0] === '') {
            filters.shift();
        }

        // Fix filter from unitable! Uses displaynames, causes errors!
        if (filters && filters[0]) {
            filters[0] = filters[0].replace(/JournalEntryLine/g, '');
            filters[0] = filters[0].replace('AccountA', 'Account.A');
        }

        if (filters.length > 1) {
            filters[0] = '( ' + filters[0] + ' )';
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
            'CreatedAt,' +
            'User.DisplayName,' +
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
            'Dimension5.Number,' +
            'Dimension5.Name,' +
            'Dimension6.Number,' +
            'Dimension6.Name,' +
            'Dimension7.Number,' +
            'Dimension7.Name,' +
            'Dimension8.Number,' +
            'Dimension8.Name,' +
            'Dimension9.Number,' +
            'Dimension9.Name,' +
            'Dimension10.Number,' +
            'Dimension10.Name,' +
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
                + ',Dimensions.Dimension5,Dimensions.Dimension6,Dimensions.Dimension7,Dimensions.Dimension8'
                + ',Dimensions.Dimension9,Dimensions.Dimension10'
        );
        urlParams.set('join',
            'JournalEntryLine.JournalEntryID eq FileEntityLink.EntityID and Journalentryline.createdby eq user.globalidentity');
        urlParams.set('filter', filters.join(' and '));
        urlParams.set('orderby', urlParams.get('orderby') || 'JournalEntryID desc');

        return this.statisticsService.GetAllByUrlSearchParams(urlParams);
    }

    public onFiltersChange(filter: string) {
        this.lastFilterString = filter;
        let f = this.configuredFilter || filter;
        if (f) {
            f = f.split('Dimensions.').join('');
            const urlParams = new URLSearchParams();
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
        const sumItems = [{
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
        for (const key in obj) {
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
        const searchParams = this.searchParams$.getValue();
        if (
            routeParams['Account_AccountNumber']
            && routeParams['year']
            && routeParams['period']
            && routeParams['isIncomingBalance']
        ) {
            const accountYear = `01.01.${routeParams['year']}`;
            const nextAccountYear = `01.01.${parseInt(routeParams['year'], 10) + 1}`;
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
        } else if (routeParams['JournalEntryNumber']) {
            filter.push({
                field: 'JournalEntryNumber',
                operator: 'eq',
                value: routeParams['JournalEntryNumber'],
                searchValue: routeParams['JournalEntryNumber'],
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
        const data = this.journalEntryService.getSessionData(0);
        const url = '/accounting/journalentry/manual'
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
                .setLinkResolver(row => `/accounting/transquery;JournalEntryNumber=${row.JournalEntryLineJournalEntryNumber}`)
                .setFilterOperator('eq')
                .setWidth('100px'),
                new UniTableColumn('JournalEntryNumber', 'Bnr. med år', UniTableColumnType.Link)
                .setDisplayField('JournalEntryLineJournalEntryNumber')
                .setLinkResolver(row => `/accounting/transquery;JournalEntryNumber=${row.JournalEntryLineJournalEntryNumber}`)
                .setFilterOperator('eq')
                .setVisible(false),
            new UniTableColumn('Account.AccountNumber', 'Kontonr.', UniTableColumnType.Link)
                .setTemplate(line => line.AccountAccountNumber)
                .setLinkResolver(row => `/accounting/transquery;Account_AccountNumber=${row.AccountAccountNumber}`)
                .setWidth('85px')
                .setFilterOperator('eq'),
            new UniTableColumn('Account.AccountName', 'Kontonavn', UniTableColumnType.Text)
                .setTemplate(line => line.AccountAccountName),
            new UniTableColumn('SubAccount.AccountNumber', 'Reskontronr.', UniTableColumnType.Link)
                .setDisplayField('SubAccountAccountNumber')
                .setLinkResolver(row => `/accounting/transquery;SubAccount_AccountNumber=${row.SubAccountAccountNumber}`)
                .setVisible(false)
                .setWidth('90px')
                .setFilterable(false),
            new UniTableColumn('SubAccount.AccountName', 'Reskontro', UniTableColumnType.Text)
                .setFilterable(false)
                .setTemplate(line => line.SubAccountAccountName)
                .setVisible(false),
            new UniTableColumn('FinancialDate', 'Regnskapsdato', UniTableColumnType.LocalDate)
                .setFilterable(false)
                .setFormat('DD.MM.YYYY')
                .setWidth('110px')
                .setTemplate(line => line.JournalEntryLineFinancialDate),
            new UniTableColumn('VatDate', 'Mva-dato', UniTableColumnType.LocalDate)
                .setFilterable(false)
                .setFormat('DD.MM.YYYY')
                .setWidth('110px')
                .setTemplate(line => line.JournalEntryLineVatDate),
            new UniTableColumn('Description', 'Beskrivelse', UniTableColumnType.Text)
                .setWidth('20%')
                .setFilterable(false)
                .setTemplate(line => line.JournalEntryLineDescription),
            new UniTableColumn('VatType.VatCode', 'Mva-kode', UniTableColumnType.Text)
            .setFilterable(false)
                .setWidth('60px')
                .setTemplate(line => line.VatTypeVatCode),
            new UniTableColumn('VatDeductionPercent', 'Fradrag %', UniTableColumnType.Number)
            .setFilterable(false)
                .setTemplate(line => line.VatDeductionPercent)
                .setVisible(false),
            new UniTableColumn('Amount', 'Beløp', UniTableColumnType.Money)
                .setFilterable(false)
                .setTemplate(line => line.JournalEntryLineAmount),
            new UniTableColumn('AmountCurrency', 'V-beløp', UniTableColumnType.Money)
                .setFilterable(false)
                .setTemplate(line => line.JournalEntryLineAmountCurrency)
                .setVisible(false),
            new UniTableColumn('CurrencyCode.Code', 'Valuta', UniTableColumnType.Text)
            .setFilterable(false)
                .setTemplate(line => line.CurrencyCodeCode)
                .setVisible(false),
            new UniTableColumn('CurrencyExchangeRate', 'V-kurs', UniTableColumnType.Number)
            .setFilterable(false)
                .setTemplate(line => line.JournalEntryLineCurrencyExchangeRate)
                .setVisible(false),
            new UniTableColumn('TaxBasisAmount', 'Grunnlag mva', UniTableColumnType.Money)
            .setFilterable(false)
                .setVisible(showTaxBasisAmount)
                .setTemplate(line => line.JournalEntryLineTaxBasisAmount),
            new UniTableColumn('TaxBasisAmountCurrency', 'V-grunnlag mva', UniTableColumnType.Money)
            .setFilterable(false)
                .setVisible(showTaxBasisAmount)
                .setTemplate(line => line.JournalEntryLineTaxBasisAmountCurrency),
            new UniTableColumn('TerminPeriod.No', 'MVA rapportert', UniTableColumnType.Text)
                .setTemplate(line => line.JournalEntryLineVatReportID ? line.JournalEntryLineVatReportID : 'Nei')
                .setFilterable(false)
                .setVisible(false),
            new UniTableColumn('InvoiceNumber', 'Fakturanr.', UniTableColumnType.Text)
                .setCls('column-align-right')
                .setFilterable(false)
                .setVisible(false)
                .setTemplate(line => line.JournalEntryLineInvoiceNumber),
            new UniTableColumn('DueDate', 'Forfall', UniTableColumnType.LocalDate)
                .setTemplate(line => line.JournalEntryLineDueDate)
                .setFilterable(false)
                .setVisible(false),
            new UniTableColumn('RestAmount', 'Restbeløp', UniTableColumnType.Money)
                .setFilterable(false)
                .setTemplate(line => line.JournalEntryLineRestAmount)
                .setVisible(false),
            new UniTableColumn('RestAmountCurrency', 'V-restbeløp', UniTableColumnType.Money)
                .setFilterable(false)
                .setTemplate(line => line.JournalEntryLineRestAmountCurrency)
                .setVisible(false),
            new UniTableColumn('StatusCode', 'Status', UniTableColumnType.Text)
                .setFilterable(false)
                .setTemplate(line => this.journalEntryLineService.getStatusText(line.JournalEntryLineStatusCode))
                .setVisible(false),
            new UniTableColumn('Department.Name', 'Avdeling', UniTableColumnType.Text)
                .setFilterable(false)
                .setTemplate(line => {
                    return line.DepartmentDepartmentNumber
                        ? line.DepartmentDepartmentNumber + ': ' + line.DepartmentName
                        : '';
                })
                .setVisible(false),
            new UniTableColumn('Project.Name', 'Prosjekt', UniTableColumnType.Text)
            .setFilterable(false)
                .setTemplate(line => {
                    return line.ProjectProjectNumber ? line.ProjectProjectNumber + ': ' + line.ProjectName : '';
                })
                .setVisible(false),
            new UniTableColumn('CreatedAt', 'Reg dato', UniTableColumnType.DateTime, false)
                .setTemplate(line => line.JournalEntryLineCreatedAt || null)
                .setWidth('100px')
                .setVisible(false),
            new UniTableColumn('User.DisplayName', 'Utført av', UniTableColumnType.Text, false)
                .setTemplate(line => line.UserDisplayName || null)
                .setVisible(false),
            new UniTableColumn('JournalEntry.JournalEntryAccrualID', 'Periodisering', UniTableColumnType.Link)
                .setWidth('60px')
                .setFilterable(false)
                .setVisible(false)
                .setTemplate(line => line.JournalEntryJournalEntryAccrualID)
                .setLinkResolver(row => `/accounting/transquery`
                    + `;JournalEntry_JournalEntryAccrualID=${row.JournalEntryJournalEntryAccrualID}`
                ),
            new UniTableColumn('ID', PAPERCLIP, UniTableColumnType.Text)
                .setTemplate(line => line.Attachments ? PAPERCLIP : '')
                .setWidth('40px')
                .setFilterable(false)
        ];

        this.dimensionTypes.forEach((dim, index) => {
            columns.splice(25 + index, 0,
                new UniTableColumn('Dimension' + dim.Dimension + '.Name', dim.Label, UniTableColumnType.Text)
                .setFilterable(false)
                .setTemplate(line => {
                    const numberString = 'Dimension' + dim.Dimension + 'Number';
                    return line[numberString] ? line[numberString] + ': ' + line['Dimension' + dim.Dimension + 'Name'] : '';
                })
                .setVisible(false),
            );
        });

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
                const tmp = data !== null ? data.Data : [];

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
            const modalOptions = {
                entity: JournalEntry.EntityType,
                entityID: event.row.JournalEntryID,
                singleImage: false
            };

            this.modalService.open(ImageModal, {data: modalOptions});
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
