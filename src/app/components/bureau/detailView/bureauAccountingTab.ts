import {
    Component,
    Input,
    ChangeDetectionStrategy,
    ElementRef,
    ChangeDetectorRef,
    OnChanges,
    SimpleChanges
} from '@angular/core';
import {KpiCompany} from '../kpiCompanyModel';
import {AppConfig} from '../../../AppConfig';
import {BureauCustomHttpService} from '../bureauCustomHttpService';
import {YearService} from '../../../services/common/yearService';
import {Observable} from 'rxjs/Observable';
import {AuthService} from '../../../authService';

const BASE = AppConfig.BASE_URL;

@Component({
    selector: 'uni-bureau-accounting-tab',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
<table *ngIf="!!viewData">
    <tr><th>Fakturamotak</th></tr>
    <tr>
        <td>Godkjente faktura</td>
        <td><a href="#" (click)="navigateToCompanyUrl('/accounting/bills?filter=Approved')">{{viewData[0]}}</a></td>
    </tr>
    <tr>
        <td>Bokført i {{accountingYear}}</td>
        <td><a href="#" (click)="navigateToCompanyUrl('/accounting/bills?filter=Journaled')">{{viewData[1]}}</a></td>
    </tr>
    <tr><td colspan="2"><hr/></td></tr>
    <tr><th>Bilag</th></tr>
    <tr>
        <td>Antall bilag bokført i {{accountingYear}}</td>
        <td><a href="#" (click)="navigateToCompanyUrl('/accounting/bills?filter=All')">{{viewData[2]}}</a></td>
    </tr>
</table>`
})
export class BureauAccountingTab implements OnChanges {
    @Input() public company: KpiCompany;

    public accountingYear: number;
    public viewData: any[];

    constructor(
        private element: ElementRef,
        private cd: ChangeDetectorRef,
        private customHttpService: BureauCustomHttpService,
        private yearService: YearService,
        private authService: AuthService
    ) {
        this.accountingYear = this.yearService.getSavedYear();
    }

    public ngOnChanges(changes: SimpleChanges) {
        this.element.nativeElement.setAttribute('aria-busy', true);
        Observable.forkJoin(
            this.getApprovedInvoices(),
            this.getNumberOfJournalEntryTransactions(),
            this.getNumberOfJournalEntries()
        )
            .do(() => this.element.nativeElement.setAttribute('aria-busy', false))
            .do(() => this.cd.markForCheck())
            .subscribe(
                result => this.viewData = result
            );
    }

    public getApprovedInvoices() {
        return this.customHttpService.get(
            `${BASE}/api/statistics/?model=supplierinvoice&select=count(id)&filter=statuscode eq 30103`,
            this.company.Key
        )
            .map(this.customHttpService.singleStatisticsExtractor)
            .map(result => result.countid);
    }

    public getNumberOfJournalEntryTransactions() {
        const year = this.accountingYear;
        return this.customHttpService.get(
            `${BASE}/api/statistics?model=supplierinvoice&select=count(id)&filter=FinancialYear.Year eq ${year} and JournalEntry.JournalEntryNumber gt 0&join=&expand=journalentry,journalentry.financialyear`,
            this.company.Key
        )
            .map(this.customHttpService.singleStatisticsExtractor)
            .map(result => result.countid);
    }

    public getNumberOfJournalEntries() {
        const year = this.accountingYear;
        return this.customHttpService.get(
            `${BASE}/api/statistics?model=journalentry&select=count(id)&filter=FinancialYear.Year eq ${year} and JournalEntryNumber gt 0&join=&expand=financialyear`,
            this.company.Key
        )
            .map(this.customHttpService.singleStatisticsExtractor)
            .map(result => result.countid);
    }

    public navigateToCompanyUrl(url: string) {
        this.authService.setActiveCompany(<any>this.company, url);
        this.element.nativeElement.setAttribute('aria-busy', true);
    }
}
