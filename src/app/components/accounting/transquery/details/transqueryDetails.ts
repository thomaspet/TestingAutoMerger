import {Component, OnInit} from '@angular/core';
import {RouteParams} from '@angular/router-deprecated';
import {UniTable, UniTableBuilder, UniTableColumn} from '../../../../../framework/uniTable';
import {TransqueryDetailsCalculationsSummary} from '../../../../models/accounting/TransqueryDetailsCalculationsSummary';
import {JournalEntryLineService} from '../../../../services/Accounting/JournalEntryLineService';
import {TransqueryDetailSearchParamters} from './TransqueryDetailSearchParamters';

@Component({
    selector: 'transquery-details',
    templateUrl: 'app/components/accounting/transquery/details/transqueryDetails.html',
    directives: [UniTable],
    providers: [JournalEntryLineService]
})
export class TransqueryDetails implements OnInit {
    private uniTableConfig: UniTableBuilder;
    private summaryData: TransqueryDetailsCalculationsSummary;
    private searchParameters: TransqueryDetailSearchParamters;

    constructor(private routeParams: RouteParams, private journalEntryLineService: JournalEntryLineService) {}

    public ngOnInit() {
        this.searchParameters = this.getSearchParameters(this.routeParams);
        const odataFilter = this.generateOdataFilter(this.searchParameters);
        if (this.searchParameters.accountId) {
            this.journalEntryLineService
                .getJournalEntryLineRequestSummary(odataFilter)
                .subscribe(summary => this.summaryData = summary);

            this.uniTableConfig = this.generateUniTableConfig(odataFilter);
        } else if (this.searchParameters.journalEntryNumber) {
            this.journalEntryLineService
                .getJournalEntryLineRequestSummary(odataFilter)
                .subscribe(summary => this.summaryData = summary);

            this.uniTableConfig = this.generateUniTableConfig(odataFilter);
        } else {
            this.uniTableConfig = this.generateUniTableConfig();
        }
    }

    private getSearchParameters(routeParams): TransqueryDetailSearchParamters {
        const searchParams = new TransqueryDetailSearchParamters();
        searchParams.accountId = Number(routeParams.get('accountId'));
        searchParams.year = Number(routeParams.get('year'));
        searchParams.period = Number(routeParams.get('period'));
        searchParams.isIncomingBalance = routeParams.get('isIncomingBalance') === 'true';
        searchParams.journalEntryNumber = routeParams.get('journalEntryNumber');
        return searchParams;
    }

    private generateUniTableConfig(odataFilter?: string): UniTableBuilder {
        let queryText = 'journalentrylines?expand=VatType,Account';
        if (odataFilter) {
            queryText += `&filter=${odataFilter}`;
        }
        return new UniTableBuilder(queryText, false)
            .setFilterable(false)
            .setPageSize(25)
            .addColumns(
                new UniTableColumn('JournalEntryNumber', 'Bilagsnr', 'string')
                    .setTemplate(`<a href="/\\#/accounting/transquery/detailsByJournalEntryNumber/#= JournalEntryNumber#/">#= JournalEntryNumber#</a>`),
                new UniTableColumn('Account.AccountNumber', 'Kontonr', 'number'),
                new UniTableColumn('Account.AccountName', 'Kontonavn', 'string'),
                new UniTableColumn('FinancialDate', 'Regnskapsdato', 'string'),
                new UniTableColumn('RegisteredDate', 'Bokføringsdato', 'string'),
                new UniTableColumn('Description', 'Beskrivelse', 'string'),
                new UniTableColumn('VatTypeID', 'Mvakode', 'string'),
                new UniTableColumn('Amount', 'Beløp', 'string')
            );
    }

    private generateOdataFilter(searchParameters: TransqueryDetailSearchParamters): string {
        const accountYear = `01.01.${searchParameters.year}`;
        const nextAccountYear = `01.01.${searchParameters.year + 1}`;
        if (searchParameters.accountId) {
            const accountSearch = 'Account.ID eq ' + searchParameters.accountId;
            if (searchParameters.period === 0) {
                return `${accountSearch} and FinancialDate lt '${accountYear}'`;
            } else if (searchParameters.period === 13) {
                if (searchParameters.isIncomingBalance) {
                    return `${accountSearch} and FinancialDate lt '${nextAccountYear}'`;
                } else {
                    return `${accountSearch} and FinancialDate ge '${accountYear}' and FinancialDate lt '${nextAccountYear}'`;
                }
            } else {
                const periodDates = this.journalEntryLineService
                    .periodNumberToPeriodDates(searchParameters.period, searchParameters.year);
                return `${accountSearch} and FinancialDate ge '${periodDates.firstDayOfPeriod}' and FinancialDate le '${periodDates.lastDayOfPeriod}'`;
            }
        } else if (this.searchParameters.journalEntryNumber) {
            return `JournalEntryNumber eq '${this.searchParameters.journalEntryNumber}'`;
        } else {
            return '';
        }
    }
}
