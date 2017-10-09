import {Component, Input, ChangeDetectionStrategy} from '@angular/core';
import {KpiCompany} from '../kpiCompanyModel';
import {AppConfig} from '../../../AppConfig';
import {BureauCustomHttpService} from '../bureauCustomHttpService';
import {YearService} from '../../../services/common/yearService';

const BASE = AppConfig.BASE_URL;

@Component({
    selector: 'uni-bureau-accounting-tab',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
<table>
    <tr><th>Fakturamotak</th></tr>
    <tr>
        <td>Godkjente faktura</td>
        <td><uni-value-loader [value]="getApprovedInvoices()"></uni-value-loader></td>
    </tr>
    <tr>
        <td>Bokført i år, antall posteringer</td>
        <td><uni-value-loader [value]="getNumberOfJournalEntryTransactions()"></uni-value-loader></td>
    </tr>
    <tr><td colspan="2"><hr/></td></tr>
    <tr><th>Bilag</th></tr>
    <tr>
        <td>Bokført i år, antall bilag</td>
        <td><uni-value-loader [value]="getNumberOfJournalEntries()"></uni-value-loader></td>
    </tr>
</table>`
})
export class BureauAccountingTab {
    @Input() public company: KpiCompany;

    constructor(
        private customHttpService: BureauCustomHttpService,
        private yearService: YearService
    ) {}

    public getApprovedInvoices() {
        return this.customHttpService.get(
            `${BASE}/api/statistics/?model=supplierinvoice&select=count(id)&filter=statuscode eq 30103`,
            this.company.Key
        )
            .map(this.customHttpService.singleStatisticsExtractor)
            .map(result => result.countid);
    }

    public getNumberOfJournalEntryTransactions() {
        return this.customHttpService.get(
            `${BASE}/api/statistics?model=supplierinvoice&select=count(id)&filter=FinancialYear.Year eq 2017 and JournalEntry.JournalEntryNumber gt 0&join=&expand=journalentry,journalentry.financialyear`,
            this.company.Key
        )
            .map(this.customHttpService.singleStatisticsExtractor)
            .map(result => result.countid);
    }

    public getNumberOfJournalEntries() {
        const year = this.yearService.getSavedYear();
        return this.customHttpService.get(
            `${BASE}/api/statistics?model=journalentry&select=count(id)&filter=FinancialYear.Year eq ${year} and JournalEntryNumber gt 0&join=&expand=financialyear`,
            this.company.Key
        )
            .map(this.customHttpService.singleStatisticsExtractor)
            .map(result => result.countid);
    }
}
