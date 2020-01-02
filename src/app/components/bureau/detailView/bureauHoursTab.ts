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
import {FinancialYearService} from '@app/services/services';
import {Observable} from 'rxjs';
import {Subscription} from 'rxjs';
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
            <p>
                Antall timeføringer i {{accountingYear}}:
                <a (click)="navigateToCompanyUrl('/timetracking/timeentry?mode=Registrering')">
                    {{round(viewData[0].sum/60, 1)}} timer ({{viewData[0].counter}})
                </a>
            </p>
        </section>
    </section>
    <section class="tab-part">
        <section class="image-container">
            <img class="journalentry-icon">
            <span>Fakturering</span>
        </section>
        <section class="text-container">
            <p>
                Ufakturerte (fakturerbare) timer:
                <a (click)="navigateToCompanyUrl('/timetracking/timeentry?mode=Registrering')">{{viewData[1]}}</a>
            </p>

            <p>
                Fakturerte timer:
                <a (click)="navigateToCompanyUrl('/timetracking/timeentry?mode=Registrering')">{{viewData[2]}}</a>
            </p>
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
    @HostBinding('class.no_access') public noAccess: boolean = false;

    constructor(
        private element: ElementRef,
        private cd: ChangeDetectorRef,
        private customHttpService: BureauCustomHttpService,
        private financialYearService: FinancialYearService,
        private authService: AuthService,
        public currentCompanyService: BureauCurrentCompanyService,
        private errorService: ErrorService,
    ) {
        this.accountingYear = this.financialYearService.getActiveYear();
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
                    this.getNumberOfTimeTracings(company.Key),
                    this.getUnInvoicedHours(company.Key),
                    this.getInvoicedHours(company.Key),
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
                    );
            });
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
