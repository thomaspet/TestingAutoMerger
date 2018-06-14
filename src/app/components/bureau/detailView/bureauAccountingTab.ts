import {
    Component,
    ChangeDetectionStrategy,
    ElementRef,
    ChangeDetectorRef,
    OnDestroy,
    AfterViewInit, HostBinding
} from '@angular/core';
import {KpiCompany} from '../kpiCompanyModel';
import {environment} from 'src/environments/environment';
import {BureauCustomHttpService} from '../bureauCustomHttpService';
import {YearService} from '../../../services/common/yearService';
import {Observable} from 'rxjs/Observable';
import {Subscription} from 'rxjs/Subscription';
import {AuthService} from '../../../authService';
import {ErrorService} from '../../../services/common/errorService';
import {BureauCurrentCompanyService} from '../bureauCurrentCompanyService';

const BASE = environment.BASE_URL;

@Component({
    selector: 'uni-bureau-accounting-tab',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
<section *ngIf="!!viewData" class="tab-parts">
    <section class="tab-part">
        <section class="image-container">
            <img class="invoice-icon">
            <span>Fakturamotak</span>
        </section>
        <section class="text-container">
            <p>
                Godkjente faktura:
                <a (click)="navigateToCompanyUrl('/accounting/bills?filter=Approved')">{{viewData[0]}}</a>
            </p>

            <p>
                Bokført i {{accountingYear}}:
                <a (click)="navigateToCompanyUrl('/accounting/bills?filter=Journaled')">{{viewData[1]}}</a>
            </p>
        </section>
    </section>
    <section class="tab-part">
        <section class="image-container">
            <img class="journalentry-icon">
            <span>Bilag</span>
        </section>
        <section class="text-container">
            <p>
                Antall bilag bokført i {{accountingYear}}:
                <a (click)="navigateToCompanyUrl('/accounting/bills?filter=All')">{{viewData[2]}}</a>
            </p>
        </section>
    </section>
</section>`
})
export class BureauAccountingTab implements AfterViewInit, OnDestroy {
    public company: KpiCompany;
    public accountingYear: number;
    public viewData: any[];
    private subscription: Subscription;
    @HostBinding('class.no_access') public noAccess: boolean = false;

    constructor(
        private element: ElementRef,
        private cd: ChangeDetectorRef,
        private customHttpService: BureauCustomHttpService,
        private authService: AuthService,
        private errorService: ErrorService,
        public currentCompanyService: BureauCurrentCompanyService,
        yearService: YearService,
    ) {
        this.accountingYear = yearService.selectedYear$.getValue();
    }

    public ngAfterViewInit() {
        this.element.nativeElement.setAttribute('aria-busy', true);
        this.subscription = this.currentCompanyService
            .getCurrentCompany()
            .subscribe(company => {
                this.company = company;
                this.noAccess = false;
                this.element.nativeElement.setAttribute('aria-busy', true);
                Observable.forkJoin(
                    this.getApprovedInvoices(company.Key),
                    this.getNumberOfJournalEntryTransactions(company.Key),
                    this.getNumberOfJournalEntries(company.Key),
                )
                    .finally(() => this.element.nativeElement.setAttribute('aria-busy', false))
                    .do(() => this.cd.markForCheck())
                    .subscribe(
                        result => this.viewData = result,
                        err => {
                            if (err.status === 403) {
                                this.noAccess = true;
                                this.cd.markForCheck();
                            } else {
                                this.errorService.handle(err);
                            }
                        },
                    )
            });
    }

    public ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    public getApprovedInvoices(companyKey: string): Observable<number> {
        return this.customHttpService.get(
            `${BASE}/api/statistics/?model=supplierinvoice`
            + `&select=count(id)`
            + `&filter=statuscode eq 30103`,
            companyKey
        )
            .map(this.customHttpService.singleStatisticsExtractor)
            .map(result => result.countid);
    }

    public getNumberOfJournalEntryTransactions(companyKey: string): Observable<number> {
        const year = this.accountingYear;
        return this.customHttpService.get(
            `${BASE}/api/statistics?model=supplierinvoice&select=count(id)`
            + `&filter=FinancialYear.Year eq ${year} and JournalEntry.JournalEntryNumber gt 0`
            + `&expand=journalentry,journalentry.financialyear`,
            companyKey
        )
            .map(this.customHttpService.singleStatisticsExtractor)
            .map(result => result.countid);
    }

    public getNumberOfJournalEntries(companyKey: string): Observable<number> {
        const year = this.accountingYear;
        return this.customHttpService.get(
            `${BASE}/api/statistics?model=journalentry&select=count(id)`
            + `&filter=FinancialYear.Year eq ${year} and JournalEntryNumber gt 0`
            + `&expand=financialyear`,
            companyKey
        )
            .map(this.customHttpService.singleStatisticsExtractor)
            .map(result => result.countid);
    }

    public navigateToCompanyUrl(url: string) {
        this.authService.setActiveCompany(<any>this.company, url);
        this.element.nativeElement.setAttribute('aria-busy', true);
    }
}
