import { IToolbarConfig } from '../../../../components/common/toolbar/toolbar';
import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {UniTableColumn, UniTableConfig, UniTableColumnType, ITableFilter} from 'unitable-ng2/main';
import {TransqueryDetailsCalculationsSummary} from '../../../../models/accounting/TransqueryDetailsCalculationsSummary';
import {JournalEntryLineService} from '../../../../services/Accounting/JournalEntryLineService';
import {URLSearchParams} from '@angular/http';
import {Observable} from 'rxjs/Rx';
import {JournalEntryLine, JournalEntry} from '../../../../unientities';
import {TabService, UniModules} from '../../../layout/navbar/tabstrip/tabService';
import {StatisticsService} from '../../../../services/common/StatisticsService';
import {ToastService, ToastType} from '../../../../../framework/uniToast/toastService';
import {ImageModal} from '../../../common/modals/ImageModal';
import {ISummaryConfig} from '../../../common/summary/summary';
import {NumberFormat} from '../../../../services/common/NumberFormatService';
import {ErrorService} from '../../../../services/common/ErrorService';

const PAPERCLIP = '📎'; // It might look empty in your editor, but this is the unicode paperclip

@Component({
    selector: 'transquery-details',
    templateUrl: 'app/components/accounting/transquery/details/transqueryDetails.html',
})
export class TransqueryDetails implements OnInit {
    private summaryData: TransqueryDetailsCalculationsSummary;
    private uniTableConfig: UniTableConfig;
    private lookupFunction: (urlParams: URLSearchParams) => any;
    private configuredFilter: string;
    private allowManualSearch: boolean = true;
    public summary: ISummaryConfig[] = [];

    private toolbarconfig: IToolbarConfig = {
        title: 'Forespørsel på bilag'
    };

    @ViewChild(ImageModal)
    private imageModal: ImageModal;

    constructor(
        private route: ActivatedRoute,
        private journalEntryLineService: JournalEntryLineService,
        private tabService: TabService,
        private statisticsService: StatisticsService,
        private toastService: ToastService,
        private numberFormat: NumberFormat,
        private errorService: ErrorService
    ) {
        this.tabService.addTab({ 'name': 'Forespørsel bilag', url: '/accounting/transquery/details', moduleID: UniModules.TransqueryDetails, active: true });
    }

    public ngOnInit() {
        this.route.params.subscribe(params => {
            const unitableFilter = this.generateUnitableFilters(params);
            this.uniTableConfig = this.generateUniTableConfig(unitableFilter, params);
            this.lookupFunction = (urlParams: URLSearchParams) =>
                this.getTableData(urlParams).catch((err, obs) => this.errorService.handleRxCatch(err, obs));
        });
    }

    private getTableData(urlParams: URLSearchParams): Observable<JournalEntryLine[]> {
        urlParams = urlParams || new URLSearchParams();
        const filtersFromUniTable = urlParams.get('filter');
        const filters = filtersFromUniTable ? [filtersFromUniTable] : [];

        if (this.configuredFilter) {
            filters.push(this.configuredFilter);
        }

        urlParams.set('model', 'JournalEntryLine');
        urlParams.set('select',
            'ID as ID,' +
            'JournalEntryNumber,' +
            'Account.AccountNumber,' +
            'Account.AccountName,' +
            'FinancialDate,' +
            'VatDate,' +
            'Description,' +
            'VatType.VatCode,' +
            'Amount,' +
            'TaxBasisAmount,' +
            'VatReportID,' +
            'RestAmount,' +
            'StatusCode,' +
            'Department.Name,' +
            'Project.Name,' +
            'Department.DepartmentNumber,' +
            'Project.ProjectNumber,' +
            'TerminPeriod.No,' +
            'TerminPeriod.AccountYear,' +
            'JournalEntryID as JournalEntryID,' +
            'sum(casewhen(FileEntityLink.EntityType eq \'JournalEntry\'\\,1\\,0)) as Attachments'
        );
        urlParams.set('expand', 'Account,VatType,Dimensions.Department,Dimensions.Project,VatReport.TerminPeriod');
        urlParams.set('join', 'JournalEntryLine.JournalEntryID eq FileEntityLink.EntityID');
        urlParams.set('filter', filters.join(' and '));
        urlParams.set('orderby', urlParams.get('orderby') || 'ID desc');

        return this.statisticsService.GetAllByUrlSearchParams(urlParams);
    }

    public onFiltersChange(filter: string) {
        let f = this.configuredFilter || filter;
        if (f) {
            f = f.split('Dimensions.').join('');
            var urlParams = new URLSearchParams();
            urlParams.set('model', 'JournalEntryLine');
            urlParams.set('filter', f);
            urlParams.set('select', 'sum(casewhen(JournalEntryLine.Amount gt 0\\,JournalEntryLine.Amount\\,0)) as SumDebit,sum(casewhen(JournalEntryLine.Amount lt 0\\,JournalEntryLine.Amount\\,0)) as SumCredit,sum(casewhen(JournalEntryLine.AccountID gt 0\\,JournalEntryLine.Amount\\,0)) as SumLedger,sum(JournalEntryLine.TaxBasisAmount) as SumTaxBasisAmount,sum(JournalEntryLine.Amount) as SumBalance');
            urlParams.set('expand', 'Account,VatType,Dimensions.Department,Dimensions.Project,VatReport.TerminPeriod');
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

    private generateUnitableFilters(routeParams: any): ITableFilter[] {
        this.allowManualSearch = true;
        this.configuredFilter = '';
        const filter: ITableFilter[] = [];
        if (
            routeParams['Account_AccountNumber']
            && routeParams['year']
            && routeParams['period']
            && routeParams['isIncomingBalance']
        ) {
            const accountYear = `01.01.${routeParams['year']}`;
            const nextAccountYear = `01.01.${parseInt(routeParams['year']) + 1}`;
            filter.push({field: 'Account.AccountNumber', operator: 'eq', value: routeParams['Account_AccountNumber'], group: 0});
            if (+routeParams['period'] === 0) {
                filter.push({field: 'FinancialDate', operator: 'lt', value: accountYear, group: 0});
            } else if (+routeParams['period'] === 13) {
                if (routeParams['isIncomingBalance'] === 'true') {
                    filter.push({field: 'FinancialDate', operator: 'lt', value: nextAccountYear, group: 0});
                } else {
                    filter.push({field: 'FinancialDate', operator: 'ge', value: accountYear, group: 0});
                    filter.push({field: 'FinancialDate', operator: 'lt', value: nextAccountYear, group: 0});
                }
            } else {
                const periodDates = this.journalEntryLineService
                    .periodNumberToPeriodDates(routeParams['period'], routeParams['year']);
                filter.push({field: 'FinancialDate', operator: 'ge', value: periodDates.firstDayOfPeriod, group: 0});
                filter.push({field: 'FinancialDate', operator: 'le', value: periodDates.lastDayOfPeriod, group: 0});
            }
        } else if (
            routeParams['vatCodesAndAccountNumbers']
            && routeParams['vatFromDate']
            && routeParams['vatToDate']
            && routeParams['showTaxBasisAmount']
        ) {
            // this is a two-dimensional array, "vatcode1|accountno1,vatcode2|accountno2,etc"
            let vatCodesAndAccountNumbers: Array<string> = routeParams['vatCodesAndAccountNumbers'].split(',');

            this.configuredFilter = '';
            this.configuredFilter += `VatDate ge '${routeParams['vatFromDate']}' and VatDate le '${routeParams['vatToDate']}' and TaxBasisAmount ne 0 ` ;

            if (vatCodesAndAccountNumbers && vatCodesAndAccountNumbers.length > 0) {
                this.configuredFilter += ' and (';
                for (let index = 0; index < vatCodesAndAccountNumbers.length; index++) {
                    let vatCodeAndAccountNumber = vatCodesAndAccountNumbers[index].split('|');

                    let vatCode = vatCodeAndAccountNumber[0];
                    let accountNo = vatCodeAndAccountNumber[1];
                    if (index > 0) {
                        this.configuredFilter += ' or ';
                    }
                    this.configuredFilter += `( VatType.VatCode eq '${vatCode}' and Account.AccountNumber eq ${accountNo} )`;
                }

                this.configuredFilter += ') ';

                this.allowManualSearch = false;
            }

        } else {
            for (const field of Object.keys(routeParams)) {
                filter.push({
                    field: field.replace('_', '.'),
                    operator: 'eq',
                    value: routeParams[field],
                    group: 0
                });
            }
        }
        return filter;
    }

    private generateUniTableConfig(unitableFilter: ITableFilter[], routeParams: any): UniTableConfig {

        let showTaxBasisAmount = routeParams && routeParams['showTaxBasisAmount'] === 'true';

        return new UniTableConfig(false, false)
            .setPageable(true)
            .setPageSize(20)
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
            .setColumns([
                new UniTableColumn('JournalEntryNumber', 'Bilagsnr')
                    .setTemplate(line => {
                        return `<a href="/#/accounting/transquery/details;journalEntryNumber=${line.JournalEntryLineJournalEntryNumber}">
                                ${line.JournalEntryLineJournalEntryNumber}
                            </a>`;
                    })
                    .setFilterOperator('contains'),
                new UniTableColumn('Account.AccountNumber', 'Kontonr')
                    .setTemplate(line => {
                        return `<a href="/#/accounting/transquery/details;Account_AccountNumber=${line.AccountAccountNumber}">
                                ${line.AccountAccountNumber}
                            </a>`;
                    })
                    .setFilterOperator('startswith'),
                new UniTableColumn('Account.AccountName', 'Kontonavn', UniTableColumnType.Text)
                    .setFilterOperator('contains')
                    .setTemplate(line => line.AccountAccountName),
                new UniTableColumn('FinancialDate', 'Regnskapsdato', UniTableColumnType.Date)
                    .setFilterOperator('contains')
                    .setFormat('DD.MM.YYYY')
                    .setTemplate(line => line.JournalEntryLineFinancialDate),
                new UniTableColumn('VatDate', 'MVA-dato', UniTableColumnType.Date)
                    .setFilterOperator('contains')
                    .setFormat('DD.MM.YYYY')
                    .setTemplate(line => line.JournalEntryLineVatDate),
                new UniTableColumn('Description', 'Beskrivelse', UniTableColumnType.Text)
                    .setFilterOperator('contains')
                    .setTemplate(line => line.JournalEntryLineDescription),
                new UniTableColumn('VatType.VatCode', 'Mvakode', UniTableColumnType.Text)
                    .setFilterOperator('eq')
                    .setTemplate(line => line.VatTypeVatCode),
                new UniTableColumn('Amount', 'Beløp', UniTableColumnType.Money)
                    .setCls('column-align-right')
                    .setFilterOperator('eq')
                    .setTemplate(line => line.JournalEntryLineAmount),
                new UniTableColumn('TaxBasisAmount', 'Grunnlag MVA', UniTableColumnType.Money)
                    .setCls('column-align-right')
                    .setFilterOperator('eq')
                    .setVisible(showTaxBasisAmount)
                    .setTemplate(line => line.JournalEntryLineTaxBasisAmount),
                new UniTableColumn('TerminPeriod.No', 'MVA rapportert', UniTableColumnType.Text)
                    .setTemplate(line => line.VatReportTerminPeriodNo ? line.VatReportTerminPeriodNo + '-' + line.VatReportTerminPeriodAccountYear : '')
                    .setFilterable(false)
                    .setVisible(false),
                new UniTableColumn('RestAmount', 'Restbeløp', UniTableColumnType.Money)
                    .setCls('column-align-right')
                    .setFilterOperator('eq')
                    .setTemplate(line => line.JournalEntryLineRestAmount)
                    .setVisible(false),
                new UniTableColumn('StatusCode', 'Status', UniTableColumnType.Text)
                    .setFilterable(false)
                    .setTemplate(line => this.journalEntryLineService.getStatusText(line.JournalEntryLineStatusCode))
                    .setVisible(false),
                new UniTableColumn('Department.Name', 'Avdeling', UniTableColumnType.Text).setFilterOperator('contains')
                    .setTemplate(line => { return line.DepartmentDepartmentNumber ? line.DepartmentDepartmentNumber + ': ' + line.DepartmentName : ''; }),
                new UniTableColumn('Project.Name', 'Prosjekt', UniTableColumnType.Text).setFilterOperator('contains')
                    .setTemplate(line => { return line.ProjectProjectNumber ? line.ProjectProjectNumber + ': ' + line.ProjectName : ''; }),
                new UniTableColumn('ID', PAPERCLIP, UniTableColumnType.Text).setFilterOperator('contains')
                    .setTemplate(line => line.Attachments ? PAPERCLIP : '')
                    .setWidth('40px')
                    .setFilterable(false)
                    .setOnCellClick(line => this.imageModal.open(JournalEntry.EntityType, line.JournalEntryID))
            ]);
    }
}
