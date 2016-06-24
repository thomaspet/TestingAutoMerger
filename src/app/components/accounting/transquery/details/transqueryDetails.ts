import {Component, OnInit} from '@angular/core';
import {RouteParams} from '@angular/router-deprecated';
import {UniTable, UniTableColumn, UniTableConfig, UniTableColumnType, ITableFilter} from 'unitable-ng2/main';
import {TransqueryDetailsCalculationsSummary} from '../../../../models/accounting/TransqueryDetailsCalculationsSummary';
import {JournalEntryLineService} from '../../../../services/Accounting/JournalEntryLineService';
import {TransqueryDetailSearchParamters} from './TransqueryDetailSearchParamters';
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

    constructor(private routeParams: RouteParams, private journalEntryLineService: JournalEntryLineService, private tabService: TabService) {
        this.tabService.addTab({ 'name': 'Forespørsel Bilag', url: '/accounting/transquery/details', moduleID: 9, active: true });
    }

    public ngOnInit() {
        const searchParameters = this.getSearchParameters(this.routeParams);
        const unitableFilter = this.generateUnitableFilters(searchParameters);
        this.uniTableConfig = this.generateUniTableConfig(unitableFilter);
        this.lookupFunction = (urlParams: URLSearchParams) => this.getTableData(urlParams);
    }

    private getTableData(urlParams: URLSearchParams): Observable<JournalEntryLine[]> {
        urlParams = urlParams || new URLSearchParams();
        urlParams.set('expand', 'VatType,Account');
        return this.journalEntryLineService.GetAllByUrlSearchParams(urlParams);
    }

    private getSearchParameters(routeParams): TransqueryDetailSearchParamters {
        const searchParams = new TransqueryDetailSearchParamters();
        searchParams.accountNumber = Number(routeParams.get('accountNumber'));
        searchParams.year = Number(routeParams.get('year'));
        searchParams.period = Number(routeParams.get('period'));
        searchParams.isIncomingBalance = routeParams.get('isIncomingBalance') === 'true';
        searchParams.journalEntryNumber = routeParams.get('journalEntryNumber');
        searchParams.accountID = routeParams.get('accountID');        
        return searchParams;
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

    private generateUnitableFilters(searchParameters: TransqueryDetailSearchParamters): ITableFilter[] {
        const filter: ITableFilter[] = [];
        if (searchParameters.accountNumber) {
            const accountYear = `01.01.${searchParameters.year}`;
            const nextAccountYear = `01.01.${searchParameters.year + 1}`;
            filter.push({field: 'Account.AccountNumber', operator: 'eq', value: searchParameters.accountNumber});
            if (searchParameters.period === 0) {
                filter.push({field: 'FinancialDate', operator: 'lt', value: accountYear});
            } else if (searchParameters.period === 13) {
                if (searchParameters.isIncomingBalance) {
                    filter.push({field: 'FinancialDate', operator: 'lt', value: nextAccountYear});
                } else {
                    filter.push({field: 'FinancialDate', operator: 'ge', value: accountYear});
                    filter.push({field: 'FinancialDate', operator: 'lt', value: nextAccountYear});
                }
            } else {
                const periodDates = this.journalEntryLineService
                    .periodNumberToPeriodDates(searchParameters.period, searchParameters.year);
                filter.push({field: 'FinancialDate', operator: 'ge', value: periodDates.firstDayOfPeriod});
                filter.push({field: 'FinancialDate', operator: 'le', value: periodDates.lastDayOfPeriod});
            }
        } else if (searchParameters.journalEntryNumber) {
            filter.push({field: 'JournalEntryNumber', operator: 'eq', value: searchParameters.journalEntryNumber});
        } else if (searchParameters.accountID) {
            filter.push({field: 'Account.ID', operator: 'eq', value: searchParameters.accountID});       
        }
        return filter;
    }

    private generateUniTableConfig(unitableFilter: ITableFilter[]): UniTableConfig {
        return new UniTableConfig(false, false)
            .setPageable(true)
            .setPageSize(15)
            .setColumnMenuVisible(false)
            .setSearchable(true)
            .setFilters(unitableFilter)
            .setColumns([
                new UniTableColumn('JournalEntryNumber', 'Bilagsnr')
                    .setTemplate((journalEntryLine) => {
                        return `<a href="/#/accounting/transquery/detailsByJournalEntryNumber/${journalEntryLine.JournalEntryNumber}/">
                                ${journalEntryLine.JournalEntryNumber}
                            </a>`;
                    })
                    .setFilterOperator('contains'),
                new UniTableColumn('Account.AccountNumber', 'Kontonr')
                    .setTemplate((journalEntryLine) => {
                        return `<a href="/#/accounting/transquery/detailsByAccountID/${journalEntryLine.AccountID}/">
                                ${journalEntryLine.Account.AccountNumber}
                            </a>`;
                    })
                    .setFilterOperator('contains'),
                new UniTableColumn('Account.AccountName', 'Kontonavn')
                    .setFilterOperator('contains'),
                new UniTableColumn('FinancialDate', 'Regnskapsdato')
                    .setFilterOperator('contains')
                    .setType(UniTableColumnType.Date)
                    .setFormat('DD.MM.YYYY'),
                new UniTableColumn('RegisteredDate', 'Bokføringsdato')
                    .setFilterOperator('contains')
                    .setType(UniTableColumnType.Date)
                    .setFormat('DD.MM.YYYY'),
                new UniTableColumn('Description', 'Beskrivelse')
                    .setFilterOperator('contains'),
                new UniTableColumn('VatType.VatCode', 'Mvakode')
                    .setFilterOperator('contains'),
                new UniTableColumn('Amount', 'Beløp')
                    .setType(UniTableColumnType.Number)
                    .setFilterOperator('contains')
            ]);
    }
}
