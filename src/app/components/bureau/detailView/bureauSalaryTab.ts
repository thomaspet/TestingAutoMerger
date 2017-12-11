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
import * as moment from 'moment';
import {AuthService} from '../../../authService';
import {ErrorService} from '../../../services/common/errorService';
import {BureauCurrentCompanyService} from '../bureauCurrentCompanyService';

const BASE = environment.BASE_URL;

@Component({
    selector: 'uni-bureau-salary-tab',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
<section *ngIf="!!viewData" class="tab-parts">
    <section class="tab-part">
        <section class="image-container">
            <img class="payrollrun-icon">
            <span>Lønns-<br />avregning</span>
        </section>
        <section class="text-container">
            <p>Siste lønnsavregning</p>
            <a href="#" (click)="navigateToCompanyUrl('/salary/payrollrun')">{{viewData[0]}}</a>
            <p>Utbetalingsdato</p>
            <a href="#" (click)="navigateToCompanyUrl('/salary/payrollrun')">{{viewData[1]}}</a>
        </section>
    </section>
    <section class="tab-part">
        <section class="image-container">
            <img class="amelding-icon">
            <span>A-Melding</span>
        </section>
        <section class="text-container">
            <p>Siste leverte periode (A-melding)</p>
            <a href="#" (click)="navigateToCompanyUrl('/salary/amelding')">{{viewData[2]}}</a>
        </section>
    </section>
</section>`
})
export class BureauSalaryTab implements AfterViewInit, OnDestroy {
    public company: KpiCompany;
    public viewData: any[];
    private subscription: Subscription;
    public accountingYear: number;

    constructor(
        private element: ElementRef,
        private cd: ChangeDetectorRef,
        private customHttpService: BureauCustomHttpService,
        private yearService: YearService,
        private authService: AuthService,
        private errorService: ErrorService,
        private currentCompanyService: BureauCurrentCompanyService,
    ) {
        this.accountingYear = this.yearService.selectedYear$.getValue();
    }

    public ngAfterViewInit() {
        this.element.nativeElement.setAttribute('aria-busy', true);
        this.subscription = this.currentCompanyService
            .getCurrentCompany()
            .do(() => this.element.nativeElement.setAttribute('aria-busy', true))
            .do(company => this.company = company)
            .switchMap(company => Observable.forkJoin(
                this.getLastPayroll(company.Key),
                this.getPayrollPaymentDate(company.Key),
                this.getLastPeriodOfAMelding(company.Key),
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

    private formatDate(date: string|Date): string {
        if (!date) {
            return '';
        }
        return moment(date).format('DD.MM.YYYY');
    }

    public getLastPayroll(companyKey: string): Observable<string> {
                return this.customHttpService.get(
            `${BASE}/api/statistics?model=payrollrun&select=id as id,description as name,`
            + `paydate as paydate&filter=year(paydate) eq ${this.accountingYear}&orderby=paydate desc&top=1`,
            companyKey
        )
            .map(this.customHttpService.statisticsExtractor)
            .map(results => results.length ? this.formatDate(results[0].paydate) : 'N/A');
    }

    public getPayrollPaymentDate(companyKey: string): Observable<string> {
                return this.customHttpService.get(
            `${BASE}/api/statistics?model=payrollrun&select=paydate as paydate`
            + `&filter=year(paydate) eq ${this.accountingYear}&orderby=paydate desc&top=1`,
            companyKey
        )
            .map(this.customHttpService.statisticsExtractor)
            .map(results => results.length ? this.formatDate(results[0].paydate) : 'N/A');
    }

    public getLastPeriodOfAMelding(companyKey: string): Observable<string> {
                return this.customHttpService.get(
            `${BASE}/api/statistics?model=ameldingdata&select=period as period,sent as sent,year as year`
            + `&filter=year eq ${this.accountingYear}&orderby=period desc,sent desc&top=1`,
            companyKey
        )
            .map(this.customHttpService.statisticsExtractor)
            .map(results => results.length ? this.formatDate(results[0].sent) : 'N/A');
    }

    public navigateToCompanyUrl(url: string) {
        this.authService.setActiveCompany(<any>this.company, url);
        this.element.nativeElement.setAttribute('aria-busy', true);
    }
}
