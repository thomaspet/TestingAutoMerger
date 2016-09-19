import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {UniTable, UniTableColumn, UniTableConfig, UniTableColumnType, ITableFilter} from 'unitable-ng2/main';
import {TransqueryDetailsCalculationsSummary} from '../../../../models/accounting/TransqueryDetailsCalculationsSummary';
import {JournalEntryLineService} from '../../../../services/Accounting/JournalEntryLineService';
import {URLSearchParams} from '@angular/http';
import {Observable} from 'rxjs/Rx';
import {JournalEntryLine} from '../../../../unientities';
import {TabService} from '../../../layout/navbar/tabstrip/tabService';

@Component({
    selector: 'transquery-details',
    templateUrl: 'app/components/accounting/transquery/details/transqueryDetails.html',
    directives: [UniTable],
    providers: [JournalEntryLineService]
})
export class TransqueryDetails implements OnInit {
    private summaryData: TransqueryDetailsCalculationsSummary;
    private uniTableConfig: UniTableConfig;
    private lookupFunction: (urlParams: URLSearchParams) => any;

    constructor(private route: ActivatedRoute, private journalEntryLineService: JournalEntryLineService, private tabService: TabService) {
        this.tabService.addTab({ 'name': 'Forespørsel Bilag', url: '/accounting/transquery/details', moduleID: 9, active: true });
    }

    public ngOnInit() {
        this.route.params.subscribe(params => {
            const unitableFilter = this.generateUnitableFilters(params);
            this.uniTableConfig = this.generateUniTableConfig(unitableFilter);
            this.lookupFunction = (urlParams: URLSearchParams) => this.getTableData(urlParams);
        });
    }

    private getTableData(urlParams: URLSearchParams): Observable<JournalEntryLine[]> {
        urlParams = urlParams || new URLSearchParams();
        urlParams.set('expand', 'VatType,Account,VatReport,VatReport.TerminPeriod');
        return this.journalEntryLineService.GetAllByUrlSearchParams(urlParams);
    }

    public onFiltersChange(filter: string) {
        if (filter) {
            this.journalEntryLineService
                .getJournalEntryLineRequestSummary(filter)
                .subscribe(summary => this.summaryData = summary);
        } else {
            this.summaryData = null;
        }
    }

    private generateUnitableFilters(routeParams: any): ITableFilter[] {
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
            routeParams['vatCode']
            && routeParams['vatFromDate']
            && routeParams['vatToDate']
        ) {
            filter.push({field: 'VatType.VatCode', operator: 'eq', value: routeParams['vatCode'], group: 0});                
            filter.push({field: 'VatDate', operator: 'ge', value: routeParams['vatFromDate'], group: 0});
            filter.push({field: 'VatDate', operator: 'le', value: routeParams['vatToDate'], group: 0});
        } else if (
            routeParams['vatCodes']
            && routeParams['vatFromDate']
            && routeParams['vatToDate']
        ) {
            let vatCodes: Array<string> = routeParams['vatCodes'].split(',');             
            
            vatCodes.forEach(vatCode => {
                filter.push({field: 'VatType.VatCode', operator: 'eq', value: vatCode, group: 1});    
            });            
            
            filter.push({field: 'VatDate', operator: 'ge', value: routeParams['vatFromDate'], group: 0});
            filter.push({field: 'VatDate', operator: 'le', value: routeParams['vatToDate'], group: 0});
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

    private generateUniTableConfig(unitableFilter: ITableFilter[]): UniTableConfig {
        return new UniTableConfig(false, false)
            .setPageable(true)
            .setPageSize(20)
            .setColumnMenuVisible(false)
            .setSearchable(true)
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
                    .setVisible(false),
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
                    .setVisible(false)
            ]);
    }
}
