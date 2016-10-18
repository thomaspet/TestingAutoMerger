import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {UniTableColumn, UniTableConfig, UniTableColumnType, ITableFilter} from 'unitable-ng2/main';
import {TransqueryDetailsCalculationsSummary} from '../../../../models/accounting/TransqueryDetailsCalculationsSummary';
import {JournalEntryLineService} from '../../../../services/Accounting/JournalEntryLineService';
import {URLSearchParams} from '@angular/http';
import {Observable} from 'rxjs/Rx';
import {JournalEntryLine} from '../../../../unientities';
import {TabService, UniModules} from '../../../layout/navbar/tabstrip/tabService';

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

    constructor(private route: ActivatedRoute, private journalEntryLineService: JournalEntryLineService, private tabService: TabService) {
        this.tabService.addTab({ 'name': 'Forespørsel Bilag', url: '/accounting/transquery/details', moduleID: UniModules.TransqueryDetails, active: true });
    }

    public ngOnInit() {
        this.route.params.subscribe(params => {
            const unitableFilter = this.generateUnitableFilters(params);
            this.uniTableConfig = this.generateUniTableConfig(unitableFilter, params);
            this.lookupFunction = (urlParams: URLSearchParams) => this.getTableData(urlParams);
        });
    }

    private getTableData(urlParams: URLSearchParams): Observable<JournalEntryLine[]> {
        urlParams = urlParams || new URLSearchParams();
        console.log('urlParams:', urlParams);

        // Some really complex filters cannot be defined through the unitable search module.
        // The configuredFilter is set to an odatafilter in these cases, so that this can be
        // used instead
        if (this.configuredFilter) {
            urlParams.set('filter', this.configuredFilter);
        }

        urlParams.set('expand', 'VatType,Account,VatReport,VatReport.TerminPeriod,Info,Dimensions,Dimensions.Department,Dimensions.Project');

        return this.journalEntryLineService.GetAllByUrlSearchParams(urlParams);
    }

    public onFiltersChange(filter: string) {

        // Some really complex filters cannot be defined through the unitable search module.
        // The configuredFilter is set to an odatafilter in these cases, so that this can be
        // used instead
        if (this.configuredFilter) {
            this.journalEntryLineService
                .getJournalEntryLineRequestSummary(this.configuredFilter)
                .subscribe(summary => this.summaryData = summary);
        } else if (filter) {
            this.journalEntryLineService
                .getJournalEntryLineRequestSummary(filter)
                .subscribe(summary => this.summaryData = summary);
        } else {
            this.summaryData = null;
        }
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
            const nextAccountYear = `01.01.${routeParams['year'] + 1}`;
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
                    this.configuredFilter += `(VatType.VatCode eq '${vatCode}' and Account.AccountNumber eq ${accountNo} )`;
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
            .setColumns([
                new UniTableColumn('JournalEntryNumber', 'Bilagsnr')
                    .setTemplate((journalEntryLine) => {
                        return `<a href="/#/accounting/transquery/details;journalEntryNumber=${journalEntryLine.JournalEntryNumber}">
                                ${journalEntryLine.JournalEntryNumber}
                            </a>`;
                    })
                    .setFilterOperator('contains'),
                new UniTableColumn('Account.AccountNumber', 'Kontonr')
                    .setTemplate((journalEntryLine) => {
                        return `<a href="/#/accounting/transquery/details;Account_AccountNumber=${journalEntryLine.Account.AccountNumber}">
                                ${journalEntryLine.Account.AccountNumber}
                            </a>`;
                    })
                    .setFilterOperator('contains'),
                new UniTableColumn('Account.AccountName', 'Kontonavn', UniTableColumnType.Text)
                    .setFilterOperator('contains'),
                new UniTableColumn('FinancialDate', 'Regnskapsdato', UniTableColumnType.Date)
                    .setFilterOperator('contains')
                    .setFormat('DD.MM.YYYY'),
                new UniTableColumn('VatDate', 'MVA-dato', UniTableColumnType.Date)
                    .setFilterOperator('contains')
                    .setFormat('DD.MM.YYYY'),
                new UniTableColumn('Description', 'Beskrivelse', UniTableColumnType.Text)
                    .setFilterOperator('contains'),
                new UniTableColumn('VatType.VatCode', 'Mvakode', UniTableColumnType.Text)
                    .setFilterOperator('eq'),
                new UniTableColumn('Amount', 'Beløp', UniTableColumnType.Number)
                    .setCls('column-align-right')
                    .setFilterOperator('eq'),
                new UniTableColumn('TaxBasisAmount', 'Grunnlag MVA', UniTableColumnType.Number)
                    .setCls('column-align-right')
                    .setFilterOperator('eq')
                    .setVisible(showTaxBasisAmount),
                new UniTableColumn('VatReportID', 'MVA rapportert', UniTableColumnType.Text)
                    .setTemplate((line: JournalEntryLine) => line.VatReport && line.VatReport.TerminPeriod ? line.VatReport.TerminPeriod.No + '-' + line.VatReport.TerminPeriod.AccountYear : '')
                    .setFilterable(false)
                    .setVisible(false),
                new UniTableColumn('RestAmount', 'Restbeløp', UniTableColumnType.Number)
                    .setCls('column-align-right')
                    .setFilterOperator('eq')
                    .setVisible(false),
                new UniTableColumn('StatusCode', 'Status', UniTableColumnType.Text)
                    .setTemplate((line: JournalEntryLine) => this.journalEntryLineService.getStatusText(line.StatusCode))
                    .setFilterable(false)
                    .setVisible(false),
                new UniTableColumn('Dimensions.DepartmentNumber', 'Avdeling', UniTableColumnType.Text).setWidth('15%').setFilterOperator('contains')
                    .setTemplate((data: JournalEntryLine) => {return data.Dimensions && data.Dimensions.Department ? data.Dimensions.Department.DepartmentNumber + ': ' + data.Dimensions.Department.Name : ''; }),
                new UniTableColumn('Dimensions.ProjectNumber', 'Prosjekt', UniTableColumnType.Text).setWidth('15%').setFilterOperator('contains')
                    .setTemplate((data: JournalEntryLine) => {return data.Dimensions && data.Dimensions.Project ? data.Dimensions.Project.ProjectNumber + ': ' + data.Dimensions.Project.Name : ''; })
            ]);
    }
}
