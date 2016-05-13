import {Component, OnInit} from '@angular/core';
import {RouteParams} from '@angular/router-deprecated';
import {UniTable, UniTableColumn, UniTableConfig} from 'unitable-ng2/main';
import {TransqueryDetailsCalculationsSummary} from '../../../../models/accounting/TransqueryDetailsCalculationsSummary';
import {JournalEntryLineService} from '../../../../services/Accounting/JournalEntryLineService';
import {TransqueryDetailSearchParamters} from './TransqueryDetailSearchParamters';
import {Observable} from 'rxjs/Observable';
import {JournalEntryLine} from '../../../../unientities';

@Component({
    selector: 'transquery-details',
    templateUrl: 'app/components/accounting/transquery/details/transqueryDetails.html',
    directives: [UniTable],
    providers: [JournalEntryLineService]
})
export class TransqueryDetails implements OnInit {
    private summaryData: TransqueryDetailsCalculationsSummary;
    private searchParameters: TransqueryDetailSearchParamters;
    private uniTableConfig: UniTableConfig;
    private uniTableData: Observable<JournalEntryLine>;

    constructor(private routeParams: RouteParams, private journalEntryLineService: JournalEntryLineService) {}

    public ngOnInit() {
        this.searchParameters = this.getSearchParameters(this.routeParams);
        const odataFilter = this.generateOdataFilter(this.searchParameters);
        this.journalEntryLineService
            .getJournalEntryLineRequestSummary(odataFilter)
            .subscribe(summary => this.summaryData = summary);
        this.uniTableData = this.journalEntryLineService.GetAll(
            `expand=VatType,Account&filter=${odataFilter}`
        );
        this.uniTableConfig = this.generateUniTableConfig();
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

    private generateUniTableConfig(): UniTableConfig {
        return new UniTableConfig(false, false)
            .setColumnMenuVisible(false)
            .setColumns([
                    new UniTableColumn('JournalEntryNumber', 'Bilagsnr')
                        .setTemplate((journalEntryLine) => {
                            return `<a href="/#/accounting/transquery/detailsByJournalEntryNumber/${journalEntryLine.JournalEntryNumber}/">
                                ${journalEntryLine.JournalEntryNumber}
                            </a>`;
                        }),
                    new UniTableColumn('Account.AccountNumber', 'Kontonr'),
                    new UniTableColumn('Account.AccountName', 'Kontonavn'),
                    new UniTableColumn('FinancialDate', 'Regnskapsdato'),
                    new UniTableColumn('RegisteredDate', 'Bokføringsdato'),
                    new UniTableColumn('Description', 'Beskrivelse'),
                    new UniTableColumn('VatTypeID', 'Mvakode'),
                    new UniTableColumn('Amount', 'Beløp')
                ]
            );
    }
}
