import {
    Component,
    ChangeDetectionStrategy,
    ElementRef,
    ChangeDetectorRef,
    OnDestroy,
    AfterViewInit
} from '@angular/core';
import {KpiCompany} from '../kpiCompanyModel';
import {environment} from 'src/environments/environment';
import {BureauCustomHttpService} from '../bureauCustomHttpService';
import {YearService} from '../../../services/common/yearService';
import {Observable} from 'rxjs/Observable';
import {Subscription} from 'rxjs/Subscription';
import {UniMath} from '../../../../framework/core/uniMath';
import {AuthService} from '../../../authService';
import {BureauCurrentCompanyService} from '../bureauCurrentCompanyService';
import {ErrorService} from '../../../services/common/errorService';

const BASE = environment.BASE_URL;

@Component({
    selector: 'uni-bureau-hours-tab',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
<section *ngIf="!!viewData" class="tab-parts">
    <section class="tab-part">
        <section class="image-container">
            <img class="hours-icon">
            <span>Timeføring</span>
        </section>
        <section class="text-container">
            <p>Sum i {{accountingYear}} (Antall timeføringer)</p>
            <a href="#" (click)="navigateToCompanyUrl('/timetracking/timeentry')">
                {{round(viewData[0].sum/60, 1)}} timer ({{viewData[0].counter}})
            </a>
        </section>
    </section>
    <section class="tab-part">
        <section class="image-container">
            <img class="journalentry-icon">
            <span>Fakturering</span>
        </section>
        <section class="text-container">
            <p>Ufakturerte (fakturerbare) timer</p>
            <a href="#" (click)="navigateToCompanyUrl('/timetracking/timeentry')">{{viewData[1]}}</a>
            <p>Fakturerte timer</p>
            <a href="#" (click)="navigateToCompanyUrl('/timetracking/timeentry')">{{viewData[2]}}</a>
        </section>
    </section>
</section>`
})
export class BureauHoursTab implements AfterViewInit, OnDestroy {
    public company: KpiCompany;

    public accountingYear: number;
    public viewData: any[];
    public round: any = UniMath.round;
    private subscription: Subscription;

    constructor(
        private element: ElementRef,
        private cd: ChangeDetectorRef,
        private customHttpService: BureauCustomHttpService,
        private yearService: YearService,
        private authService: AuthService,
        private currentCompanyService: BureauCurrentCompanyService,
        private errorService: ErrorService,
    ) {
        this.accountingYear = this.yearService.getSavedYear();
    }

    public ngAfterViewInit() {
        this.element.nativeElement.setAttribute('aria-busy', true);
        this.subscription = this.currentCompanyService
            .getCurrentCompany()
            .do(() => this.element.nativeElement.setAttribute('aria-busy', true))
            .do(company => this.company = company)
            .switchMap(company => Observable.forkJoin(
                this.getNumberOfTimeTracings(company.Key),
                this.getUnInvoicedHours(company.Key),
                this.getInvoicedHours(company.Key),
            ))
            .do(() => this.element.nativeElement.setAttribute('aria-busy', false))
            .do(() => this.cd.markForCheck())
            .subscribe(
                result => this.viewData = result,
                err => this.errorService.handle(err),
            );
    }

    public ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    public getNumberOfTimeTracings(companyKey: string): Observable<number> {
        const year = this.accountingYear;
        return this.customHttpService.get(
            `${BASE}/api/statistics?model=workitem&select=sum(minutes) as sum,`
                + `count(id) as counter&filter=(worktype.systemtype le 10 or worktype.systemtype eq 12) `
                + `and year(date) eq ${year}&join=&expand=worktype&top=50`,
            companyKey
        )
            .map(this.customHttpService.singleStatisticsExtractor);
    }

    public getUnInvoicedHours(companyKey: string): Observable<string> {
        return this.customHttpService.get(
            `${BASE}/api/statistics?model=workitem`
                + `&select=sum(casewhen(minutestoorder eq 0\,minutes\,minutestoorder)) as SumMinutes`
                + `&filter=(Invoiceable eq 1 or minutestoorder gt 0 or customerorderid gt 0) `
                + `and transferedtoorder eq 0`,
            companyKey
        )
            .map(this.customHttpService.singleStatisticsExtractor)
            .map(result => result.SumMinutes)
            .map(sum => sum === null ? 0 : sum);
    }

    public getInvoicedHours(companyKey: string): Observable<number> {
        const year = this.accountingYear;
        return this.customHttpService.get(
            `${BASE}/api/statistics?model=workitem`
                + `&select=sum(casewhen(minutestoorder eq 0\,minutes\,minutestoorder)) as SumMinutes`
                + `&filter=(Invoiceable eq 1 or minutestoorder gt 0 or customerorderid gt 0) `
                + `and transferedtoorder eq 1 and year(date) eq ${year}`,
            companyKey
        )
            .map(this.customHttpService.singleStatisticsExtractor)
            .map(result => result.SumMinutes)
            .map(sum => sum === null ? 0 : sum);
    }

    public navigateToCompanyUrl(url: string) {
        this.authService.setActiveCompany(<any>this.company, url);
        this.element.nativeElement.setAttribute('aria-busy', true);
    }
}
