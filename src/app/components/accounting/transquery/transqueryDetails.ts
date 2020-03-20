import {IToolbarConfig} from '../../../components/common/toolbar/toolbar';
import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {
    UniTableColumn,
    UniTableConfig,
    UniTableColumnType,
    ITableFilter,
    ICellClickEvent
} from '../../../../framework/ui/unitable/index';
import {AgGridWrapper} from '@uni-framework/ui/ag-grid/ag-grid-wrapper';
import {
    TransqueryDetailsCalculationsSummary
} from '../../../models/accounting/TransqueryDetailsCalculationsSummary';
import {HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {JournalEntry, JournalEntryLine, FinancialYear} from '../../../unientities';
import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';
import {ToastService, ToastType, ToastTime} from '../../../../framework/uniToast/toastService';
import {UniForm, FieldType} from '../../../../framework/ui/uniform/index';
import {ImageModal} from '../../common/modals/ImageModal';
import {ISummaryConfig} from '../../common/summary/summary';
import {
    JournalEntryLineService,
    JournalEntryService,
    ErrorService,
    NumberFormat,
    StatisticsService,
    FinancialYearService,
    BrowserStorageService,
    CustomDimensionService,
    PageStateService
} from '../../../services/services';

import {
    UniModalService,
    ConfirmActions,
} from '../../../../framework/uni-modal';
import {ConfirmCreditedJournalEntryWithDate} from '../../common/modals/confirmCreditedJournalEntryWithDate';

import {BehaviorSubject, Subject} from 'rxjs';
import * as moment from 'moment';
import * as _ from 'lodash';
import { UniJournalEntryLineModal } from '@uni-framework/uni-modal/modals/JournalEntryLineModal';
import {saveAs} from 'file-saver';

const PAPERCLIP = '📎'; // It might look empty in your editor, but this is the unicode paperclip

interface ISearchParams {
    AccountYear?: number;
    JournalEntryNumber?: number;
    AccountNumber?: number;
    Amount?: number;
    ShowCreditedLines?: boolean;
    SubAccountNumber?: number;
    InvoiceNumber?: string;
}

@Component({
    selector: 'transquery-details',
    templateUrl: './transqueryDetails.html',
})
export class TransqueryDetails implements OnInit {
    @ViewChild(AgGridWrapper, { static: true })
    private table: AgGridWrapper;

    @ViewChild(UniForm, { static: false })
    private uniForm: UniForm;

    summaryData: TransqueryDetailsCalculationsSummary;
    uniTableConfig: UniTableConfig;
    lookupFunction: (urlParams: HttpParams) => any;
    columnSumResolver: (urlParams: HttpParams) => Observable<{[field: string]: number}>;
    summary: ISummaryConfig[] = [];
    showCredited: boolean = false;
    useConfiguredFilter: boolean = false;
    loading$: Subject<boolean> = new Subject();

    private currentRow: any;
    private journalEntryTypes: any[];
    private lastFilterString: string;
    private dimensionTypes: any[];
    private searchTimeout;
    private configuredFilter: string;
    private searchParams$: BehaviorSubject<ISearchParams> = new BehaviorSubject({});

    config$: BehaviorSubject<any> = new BehaviorSubject({autofocus: false});
    fields$: BehaviorSubject<any[]> = new BehaviorSubject([]);

    private financialYears: Array<FinancialYear> = null;
    private activeFinancialYear: FinancialYear;

    toolbarconfig: IToolbarConfig = {
        title: 'Søk på bilag'
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
        private financialYearService: FinancialYearService,
        private storageService: BrowserStorageService,
        private router: Router,
        private modalService: UniModalService,
        private customDimensionService: CustomDimensionService,
        private pageStateService: PageStateService
    ) { }

    public ngOnInit() {
        this.activeFinancialYear = this.financialYearService.getActiveFinancialYear();

        // setup unitable and router parameter subscriptions
        Observable.forkJoin(
            this.financialYearService.GetAll(null),
            this.customDimensionService.getMetadata()
        ).subscribe(data => {
            this.financialYears = data[0];
            this.dimensionTypes = data[1];

            // set default value for filtering
            const searchParams: ISearchParams = {
                AccountYear: null,
                ShowCreditedLines: false
            };

            if (this.activeFinancialYear) {
                searchParams.AccountYear = this.activeFinancialYear.Year;
            }

            this.route.queryParams.subscribe(routeParams => {
                if (routeParams['AccountNumber']) {
                    searchParams.AccountNumber = routeParams['AccountNumber'];
                }

                if (routeParams['SubAccountNumber']) {
                    searchParams.SubAccountNumber = routeParams['SubAccountNumber'];
                }

                if (routeParams['JournalEntryNumber']) {
                    searchParams.JournalEntryNumber = routeParams['JournalEntryNumber'];
                }

                if (routeParams['Amount']) {
                    searchParams.Amount = routeParams['Amount'];
                }

                if (routeParams['InvoiceNumber']) {
                    searchParams.InvoiceNumber = routeParams['InvoiceNumber'];
                }

                if (routeParams['ShowCreditedLines']) {
                    searchParams.ShowCreditedLines = routeParams['ShowCreditedLines'] === 'true';
                }

                if (routeParams['AccountYear']) {
                    const yearFromParam = +routeParams['AccountYear'];
                    if (!isNaN(yearFromParam)) {
                        // Lets see if year is in financial years
                        const financialYear = this.financialYears.find(year => year.Year === yearFromParam);
                        if (financialYear) {
                            searchParams.AccountYear = financialYear.Year;
                        } else {
                            searchParams.AccountYear = this.activeFinancialYear.Year;
                        }
                    } else {
                        searchParams.AccountYear = this.activeFinancialYear.Year;
                    }
                }

                this.searchParams$.next(searchParams);
                this.addTab();

                const unitableFilter = this.generateUnitableFilters(routeParams);
                this.uniTableConfig = this.generateUniTableConfig(unitableFilter, routeParams);
                this.setupFunction();
                this.fields$.next(this.getLayout().Fields);
            });
        });
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

        const searchParams = _.cloneDeep(this.searchParams$.getValue());

        // Find the searchvalue
        const splitted = filters[0].split(`'`);

        let searchValue;
        if (splitted.length > 1 && splitted[1] !== undefined) {
            searchValue = splitted[1];
        }

        // This is only used when linking from the MVA-Melding view.. This filter is to specific to mix
        if (!this.useConfiguredFilter) {
            if (searchParams.AccountYear) {
                filters.push(`Period.AccountYear eq ${searchParams.AccountYear}`);
            }

            if (searchParams.JournalEntryNumber && !isNaN(searchParams.JournalEntryNumber)) {
                filters.push(`JournalEntryNumberNumeric eq ${searchParams.JournalEntryNumber}`);
            }

            if (searchParams.AccountNumber && !isNaN(searchParams.AccountNumber)) {
                filters.push(`(Account.AccountNumber eq ${searchParams.AccountNumber} or SubAccount.AccountNumber eq ${searchParams.AccountNumber})`);
            }

            if (searchParams.SubAccountNumber && !isNaN(searchParams.SubAccountNumber)) {
                filters.push(`SubAccount.AccountNumber eq ${searchParams.SubAccountNumber}`);
            }

            if (searchParams.InvoiceNumber) {
                filters.push(`InvoiceNumber eq ${searchParams.InvoiceNumber}`);
            }

            let amount = searchParams.Amount ? searchParams.Amount.toString() : '';
            amount = amount.replace(',', '.');

            if (amount && !isNaN(+amount)) {
                filters.push(`Amount eq ${amount}`);
            }

            // Always allow user to show/hide credited lines!
            if (!searchParams.ShowCreditedLines) {
                filters.push('isnull(StatusCode,0) ne 31004');
            }
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

        let selectString = 'ID as ID,JournalEntryID as JournalEntryID,StatusCode as StatusCode,JournalEntryNumber as JournalEntryNumber,ReferenceCreditPostID as ReferenceCreditPostID,'
            + 'sum(casewhen(FileEntityLink.EntityType eq \'JournalEntry\'\\,1\\,0)) as Attachments,TerminPeriod.AccountYear';
        let expandString = '';

        // Loop the columns in unitable to only get the data for the once visible!
        this.table.columns.forEach((col) => {
            selectString += col.visible ? ',' + col.field : '';
            if (col.field.indexOf('Dimension') !== -1 && col.visible) {
                selectString += ',Dimension' + parseInt(col.field.substr(9, 3), 10) + '.Number';
                expandString += ',Dimensions.Dimension' + parseInt(col.field.substr(9, 3), 10);
            } else if (col.field.indexOf('Department') !== -1 && col.visible) {
                selectString += ',Department.DepartmentNumber';
            } else if (col.field.indexOf('Project') !== -1 && col.visible) {
                selectString += ',Project.ProjectNumber';
            }
        });

        urlParams = urlParams.set('model', 'JournalEntryLine');
        urlParams = urlParams.set(
            'expand',
            'Account,SubAccount,JournalEntry,VatType,Dimensions.Department'
                + ',Dimensions.Project,Period,VatReport.TerminPeriod,CurrencyCode,JournalEntryType'
                + expandString
        );
        urlParams = urlParams.set('filter', filters.join(' and '));

        if (isSum) {
            urlParams = urlParams.set('select', 'sum(Amount) as JournalEntryLineAmount');
            urlParams = urlParams.set('join', 'Journalentryline.createdby eq user.globalidentity');
            urlParams = urlParams.delete('orderby');
            return this.statisticsService.GetAllByHttpParams(urlParams)
                .map(res => res.body)
                .map(res => (res.Data && res.Data[0]) || []);
        } else {
            urlParams = urlParams.set('select', selectString );
            urlParams = urlParams.set('join',
                'JournalEntryLine.JournalEntryID eq FileEntityLink.EntityID and Journalentryline.createdby eq user.globalidentity');
                urlParams = urlParams.set('orderby', urlParams.get('orderby') || 'JournalEntryID desc');
            return this.statisticsService.GetAllByHttpParams(urlParams);
        }
    }

    public onFiltersChange(filter: string) {
        this.lastFilterString = filter;
        let f = this.configuredFilter || filter;
        if (f) {
            f = f.split('Dimensions.').join('');
            const urlParams = new HttpParams()
                .set('model', 'JournalEntryLine')
                .set('filter', f)
                .set(
                    'select',
                    'sum(casewhen(JournalEntryLine.Amount gt 0\\,JournalEntryLine.Amount\\,0)) as SumDebit,'
                        + 'sum(casewhen(JournalEntryLine.Amount lt 0\\,JournalEntryLine.Amount\\,0)) as SumCredit,'
                        + 'sum(casewhen(JournalEntryLine.AccountID gt 0\\,JournalEntryLine.Amount\\,0)) as SumLedger,'
                        + 'sum(JournalEntryLine.TaxBasisAmount) as SumTaxBasisAmount,'
                        + 'sum(JournalEntryLine.Amount) as SumBalance'
                )
                .set(
                    'expand',
                    'Account,SubAccount,JournalEntry,VatType,Dimensions.Department,'
                        + 'Dimensions.Project,Period,VatReport.TerminPeriod,CurrencyCode'
                );

            this.statisticsService.GetDataByHttpParams(urlParams).subscribe(summary => {
                this.summaryData = summary.Data[0];
                this.summaryData.SumCredit *= -1;
                this.setSums();
            }, err => this.errorService.handle(err));
        } else {
            this.summaryData = null;
        }
    }

    public onFormReady() {
        this.uniForm.field('JournalEntryNumber').focus();
    }

    public addTab() {
        const form = this.searchParams$.getValue();

        // Set page state service to make sure browser navigatio works
        this.pageStateService.setPageState('JournalEntryNumber', form.JournalEntryNumber ? form.JournalEntryNumber + '' : '');
        this.pageStateService.setPageState('AccountNumber', form.AccountNumber ? form.AccountNumber + '' : '');
        this.pageStateService.setPageState('Amount', form.Amount ? form.Amount + '' : '');
        this.pageStateService.setPageState('AccountYear', form.AccountYear + '');
        this.pageStateService.setPageState('ShowCreditedLines', form.ShowCreditedLines + '');
        this.pageStateService.setPageState('SubAccountNumber', form.SubAccountNumber ? form.SubAccountNumber + '' : '');
        this.pageStateService.setPageState('InvoiceNumber', form.InvoiceNumber ?  form.InvoiceNumber + '' : '');

        this.tabService.addTab({
            name: 'Søk på bilag',
            url: this.pageStateService.getUrl(),
            moduleID: UniModules.TransqueryDetails,
            active: true
        });
    }

    public onFormInput(input) {
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
            const form = this.searchParams$.getValue();

            if (input['JournalEntryNumber']) {
                form['JournalEntryNumber'] = input['JournalEntryNumber'].currentValue.trim();
            }

            if (input['AccountNumber']) {
                form['AccountNumber'] = input['AccountNumber'].currentValue;
            }

            if (input['Amount']) {
                form['Amount'] = input['Amount'].currentValue;
                input['Amount'].currentValue = input['Amount'].currentValue.replace(',', '.');
            }

            if (input['SubAccountNumber']) {
                form['SubAccountNumber'] = input['SubAccountNumber'].currentValue;
            }

            if (input['InvoiceNumber']) {
                form['InvoiceNumber'] = input['InvoiceNumber'].currentValue;
            }

            this.searchParams$.next(form);
            this.addTab();
            this.setupFunction();
            // this.router.navigateByUrl(url);
        }, 500);
    }

    public setSearchParamsOnLinkClick(field, value) {
        const form = this.searchParams$.getValue();
        form[field] = value;
        this.searchParams$.next(form);
        this.addTab();
        this.setupFunction();
    }

    private setSums() {
        const sumItems = [{
                value: this.summaryData ? this.numberFormat.asMoney(this.summaryData.SumDebit || 0) : null,
                title: 'Sum debet',
            }, {
                value: this.summaryData ? this.numberFormat.asMoney(this.summaryData.SumCredit || 0) : null,
                title: 'Sum kredit',
            }, {
                value: this.summaryData ? this.numberFormat.asMoney(this.summaryData.SumLedger || 0) : null,
                title: 'Sum reskontro',
            }, {
                value: this.summaryData ? this.numberFormat.asMoney(this.summaryData.SumBalance || 0) : null,
                title: 'Saldo',
            }];

        this.summary = sumItems;
    }

    private generateUnitableFilters(routeParams: any): ITableFilter[] {
        this.configuredFilter = '';
        const filter: ITableFilter[] = [];

        if (
            routeParams['vatCodesAndAccountNumbers']
            && routeParams['vatFromDate']
            && routeParams['vatToDate']
            && routeParams['showTaxBasisAmount']
        ) {

            // This filter is to specific for adding to it to unitable.. Lets just hide default filter
            // and inform user of this.. Add a reset button to remove configured filter and show filter fields

            this.useConfiguredFilter = true;

            // This is a two-dimensional array, "vatcode1|accountno1,vatcode2|accountno2,etc"
            const vatCodesAndAccountNumbers: Array<string> = routeParams['vatCodesAndAccountNumbers'].split(',');

            this.configuredFilter = '';

            if (routeParams['vatReportID'] && routeParams['vatReportID'] !== '0') {
                this.configuredFilter += `VatReportID eq '${routeParams['vatReportID']}' and TaxBasisAmount ne 0 `;
            } else if (routeParams['vatReportID'] === '0') {
                const threeYearsAgo = moment(routeParams['vatFromDate']).subtract(3, 'year');
                const vatFromDate = threeYearsAgo.format('YYYY.MM.DD');

                this.configuredFilter += `VatDate le '${routeParams['vatToDate']}' and VatDate ge '${vatFromDate}' `
                    + `and isnull(VatReportID,0) eq 0 and TaxBasisAmount ne 0 `;

            } else {
                this.configuredFilter += `VatDate ge '${routeParams['vatFromDate']}' and VatDate le '${routeParams['vatToDate']}' `
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
            }
        }
        return filter;
    }

    public resetConfiguredFilter () {
        this.useConfiguredFilter = false;
        this.configuredFilter = '';
        this.router.navigateByUrl('/accounting/transquery');
    }

    private creditJournalEntry(item: any) {
        this.modalService.open(ConfirmCreditedJournalEntryWithDate, {
            header: `Kreditere bilag ${item.JournalEntryNumber}?`,
            message: 'Vil du kreditere hele dette bilaget?',
            buttonLabels: {
                accept: 'Krediter',
                cancel: 'Avbryt'
            },
            data: {JournalEntryID: item.JournalEntryID}
        }).onClose.subscribe(response => {
            if (response && response.action === ConfirmActions.ACCEPT) {
                this.journalEntryService.creditJournalEntry(item.JournalEntryNumber, response.creditDate)
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

    private editJournalEntryLine(journalEntryLine: any) {

                this.currentRow = journalEntryLine;
                this.modalService.open(UniJournalEntryLineModal, {
                    header: `Redigere bilagsline (uten kreditering)`,
                    buttonLabels: {
                        accept: 'Lagre',
                        cancel: 'Avbryt'
                    },
                    data: { journalEntryLine }
                }).onClose.subscribe(
                    (res) => {
                        if (res != null) {
                            this.currentRow['JournalEntryLineDescription'] = res.Description;
                            this.currentRow['JournalEntryLinePaymentID'] = res.PaymentID;
                            this.currentRow['JournalEntryLineJournalEntryTypeID'] = res.JournalEntryType;
                            // this.currentRow['JournalEntryLineJournalEntryType'] = res.JournalEntryType;
                            this.table.refreshTableData();
                        }
                });
    }

    private editJournalEntry(journalEntryID, journalEntryNumber) {
        const url = '/accounting/journalentry/manual' + `;journalEntryNumber=${journalEntryNumber}`
            + `;journalEntryID=${journalEntryID};editmode=true`;

        this.router.navigateByUrl(url);
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
                .setLinkClick(row => this.setSearchParamsOnLinkClick('JournalEntryNumber', row.JournalEntryLineJournalEntryNumberNumeric))
                .setFilterable(false)
                .setWidth(100),
                new UniTableColumn('JournalEntryNumber', 'Bnr. med år', UniTableColumnType.Link)
                .setDisplayField('JournalEntryLineJournalEntryNumber')
                .setLinkResolver(row => {
                    const numberAndYear = row.JournalEntryNumber.split('-');
                    if (numberAndYear.length > 1) {
                        return `/accounting/transquery?JournalEntryNumber=${numberAndYear[0]}&AccountYear=${numberAndYear[1]}`;
                    } else {
                        const year = new Date(row.JournalEntryLineFinancialDate).getFullYear() || this.searchParams$.getValue().AccountYear;
                        return `/accounting/transquery?JournalEntryNumber=${numberAndYear[0]}&AccountYear=${year}`;
                    }
                })
                .setFilterOperator('eq')
                .setVisible(false),
            new UniTableColumn('Account.AccountNumber', 'Kontonr.', UniTableColumnType.Link)
                .setTemplate(line => line.AccountAccountNumber)
                .setLinkClick(row => this.setSearchParamsOnLinkClick('AccountNumber', row.AccountAccountNumber))
                .setWidth('85px')
                .setFilterable(false),
            new UniTableColumn('Account.AccountName', 'Kontonavn', UniTableColumnType.Text)
                .setTemplate(line => line.AccountAccountName),
            new UniTableColumn('SubAccount.AccountNumber', 'Reskontronr.', UniTableColumnType.Link)
                .setDisplayField('SubAccountAccountNumber')
                .setLinkResolver(row => `/accounting/transquery?SubAccount_AccountNumber=${row.SubAccountAccountNumber}`)
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
                .setFilterOperator('contains')
                .setTemplate(line => line.JournalEntryLineDescription),
            new UniTableColumn('VatType.VatCode', 'Mva-kode', UniTableColumnType.Text)
            .setFilterable(false)
                .setWidth('60px')
                .setTemplate(line => line.VatTypeVatCode),
            new UniTableColumn('VatDeductionPercent', 'Fradrag %', UniTableColumnType.Number)
            .setFilterable(false)
                .setTemplate(line => line.JournalEntryLineVatDeductionPercent)
                .setVisible(false),
            new UniTableColumn('Amount', 'Beløp', UniTableColumnType.Money)
                .setFilterable(false)
                .setTemplate(line => line.JournalEntryLineAmount)
                .setIsSumColumn(true),
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
            new UniTableColumn('JournalEntryType.DisplayName', 'Bilagstype', UniTableColumnType.Text)
                .setFilterable(true)
                .setVisible(false)
                .setTemplate(line => line.JournalEntryTypeDisplayName),
            new UniTableColumn('TerminPeriod.No', 'MVA rapportert', UniTableColumnType.Text)
                .setTemplate(line => line.TerminPeriodNo ? `${line.TerminPeriodNo}-${line.TerminPeriodAccountYear}` : 'Nei')
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
            new UniTableColumn('PaymentID', 'KID', UniTableColumnType.Text)
                .setTemplate(line => line.JournalEntryLinePaymentID)
                .setVisible(false),
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
            .setSearchable(true)
            .setEntityType('JournalEntryLine')
            .setFilters(unitableFilter)
            .setIsRowReadOnly(row => row.StatusCode === 31004)
            .setAllowGroupFilter(true)
            .setColumnMenuVisible(true)
            .setConditionalRowCls((row) => {
                return (row && row.StatusCode === 31004) ? 'journal-entry-credited' : '';
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
                        item.JournalEntryLineJournalEntryNumberNumeric
                    ),
                    disabled: (item) => false,
                    label: 'Korriger bilag'
                },
                {
                    action: (item) => this.editJournalEntryLine(item),
                    disabled: (item) => false,
                    label: 'Rediger bilagslinje uten kreditering'
                },
                {
                    action: (item) => this.openCreditedJournalEntryLines(item),
                    disabled: (item) => item.StatusCode !== 31004,
                    label: 'Vis kreditert bilag'
                }
            ])
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

            this.modalService.open(ImageModal, {data: modalOptions});
        }
    }

    private openCreditedJournalEntryLines(cs: any) {
        if (cs.ReferenceCreditPostID) {
            this.journalEntryLineService.Get(cs.ReferenceCreditPostID).subscribe((jl) => {
                const jnr = jl.JournalEntryNumber;
                this.router.navigateByUrl(`/accounting/transquery?JournalEntryNumber=${jnr.split('-')[0]}&AccountYear=${jnr.split('-')[1]}`)
            });
        }
    }
    private getCssClasses(data, field) {
        let cssClasses = '';

        if (!data) {
            return '';
        }

        if (field === 'Amount' || field === 'AmountCurrency' || field === 'RestAmount' || field === 'RestAmountCurrency') {
            cssClasses += ' ' + (parseInt(data.value, 10) >= 0 ? 'number-good' : 'number-bad');
        }

        return cssClasses.trim();
    }

    public onFormFilterChange(event) {
        this.addTab();
        this.table.refreshTableData();
    }

    public toExcel() {
        this.loading$.next(true);
        let urlParams = new HttpParams();
        const filtersFromUniTable = this.table.getFilterString();
        const filters = filtersFromUniTable ? [filtersFromUniTable] : [this.configuredFilter];
        const searchParams = _.cloneDeep(this.searchParams$.getValue());
        // Find the searchvalue
        const splitted = filters[0].split(`'`);
        let searchValue;
        if (splitted.length > 1 && splitted[1] !== undefined) {
            searchValue = splitted[1];
        }
        // This is only used when linking from the MVA-Melding view.. This filter is to specific to mix
        if (!this.useConfiguredFilter) {
            if (searchParams.AccountYear) {
                filters.push(`Period.AccountYear eq ${searchParams.AccountYear}`);
            }
            if (searchParams.JournalEntryNumber && !isNaN(searchParams.JournalEntryNumber)) {
                filters.push(`JournalEntryNumberNumeric eq ${searchParams.JournalEntryNumber}`);
            }
            if (searchParams.AccountNumber && !isNaN(searchParams.AccountNumber)) {
                filters.push(`(Account.AccountNumber eq ${searchParams.AccountNumber} or SubAccount.AccountNumber eq ${searchParams.AccountNumber})`);
            }
            if (searchParams.SubAccountNumber && !isNaN(searchParams.SubAccountNumber)) {
                filters.push(`SubAccount.AccountNumber eq ${searchParams.SubAccountNumber}`);
            }
            if (searchParams.InvoiceNumber) {
                filters.push(`InvoiceNumber eq ${searchParams.InvoiceNumber}`);
            }
            let amount = searchParams.Amount ? searchParams.Amount.toString() : '';
            amount = amount.replace(',', '.');
            if (amount && !isNaN(+amount)) {
                filters.push(`Amount eq ${amount}`);
            }
            // Always allow user to show/hide credited lines!
            if (!searchParams.ShowCreditedLines) {
                filters.push('isnull(StatusCode,0) ne 31004');
            }
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
        let selectString = 'ID as ID,JournalEntryID as JournalEntryID,StatusCode as StatusCode,JournalEntryNumber as JournalEntryNumber,ReferenceCreditPostID as ReferenceCreditPostID,'
            + 'sum(casewhen(FileEntityLink.EntityType eq \'JournalEntry\'\\,1\\,0)) as Attachments';
        let expandString = '';

        // Loop the columns in unitable to only get the data for the once visible!
        this.table.columns.forEach((col) => {
            selectString += col.visible ? ',' + col.field : '';
            if (col.field.indexOf('Dimension') !== -1 && col.visible) {
                selectString += ',Dimension' + parseInt(col.field.substr(9, 3), 10) + '.Number';
                expandString += ',Dimensions.Dimension' + parseInt(col.field.substr(9, 3), 10);
            } else if (col.field.indexOf('Department') !== -1 && col.visible) {
                selectString += ',Department.DepartmentNumber';
            } else if (col.field.indexOf('Project') !== -1 && col.visible) {
                selectString += ',Project.ProjectNumber';
            }
        });

        urlParams = urlParams.set('model', 'JournalEntryLine');
        urlParams = urlParams.set(
            'expand',
            'Account,SubAccount,JournalEntry,VatType,Dimensions.Department'
            + ',Dimensions.Project,Period,VatReport.TerminPeriod,CurrencyCode,JournalEntryType'
            + expandString
        );
        urlParams = urlParams.set('filter', filters.join(' and '));
        urlParams = urlParams.set('select', selectString );
        urlParams = urlParams.set('join',
            'JournalEntryLine.JournalEntryID eq FileEntityLink.EntityID and Journalentryline.createdby eq user.globalidentity');
        urlParams = urlParams.set('orderby', urlParams.get('orderby') || 'JournalEntryID desc');
        this.statisticsService.GetExportedExcelFileFromUrlParams(urlParams)
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
                },
                {
                    EntityType: 'JournalEntryLine',
                    Property: 'JournalEntryNumber',
                    FieldType: FieldType.TEXT,
                    Label: 'Bilagsnr',
                    Placeholder: 'Bilagsnr'
                },
                {
                    EntityType: 'JournalEntryLine',
                    Property: 'AccountNumber',
                    FieldType: FieldType.TEXT,
                    Label: 'Kontonr',
                    Placeholder: 'Kontonr'
                },
                {
                    EntityType: 'JournalEntryLine',
                    Property: 'SubAccountNumber',
                    FieldType: FieldType.TEXT,
                    Label: 'RestKontro',
                    Placeholder: 'Restkontro'
                },
                {
                    EntityType: 'JournalEntryLine',
                    Property: 'InvoiceNumber',
                    FieldType: FieldType.TEXT,
                    Label: 'Fakturanr',
                    Placeholder: 'Fakturanr'
                },
                {
                    EntityType: 'JournalEntryLine',
                    Property: 'Amount',
                    FieldType: FieldType.TEXT,
                    Label: 'Beløp',
                    Placeholder: 'Beløp'
                },
                {
                    EntityType: 'JournalEntryLine',
                    Property: 'ShowCreditedLines',
                    FieldType: FieldType.CHECKBOX,
                    Label: 'Vis krediterte',
                    Placeholder: ''
                }
            ]
        };
    }
}
