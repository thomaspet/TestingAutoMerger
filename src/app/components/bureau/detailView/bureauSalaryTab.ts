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
            <span> {{ 'NAVBAR.PAYROLL' | translate }} </span>
        </section>
        <section class="text-container">
            <p>
                {{ 'SALARY.PAYROLL.LATEST' | translate }}:
                <a (click)="navigateToCompanyUrl('/salary/payrollrun')">{{viewData[0]}}</a>
            </p>

            <p>
                Utbetalingsdato
                <a (click)="navigateToCompanyUrl('/salary/payrollrun')">{{viewData[1]}}</a>
            </p>
        </section>
    </section>
    <section class="tab-part">
        <section class="image-container">
            <img class="amelding-icon">
            <span>A-melding</span>
        </section>
        <section class="text-container">
            <p>
                Siste leverte periode (A-melding):
                <a (click)="navigateToCompanyUrl('/salary/amelding')">{{viewData[2]}}</a>
            </p>
        </section>
    </section>
</section>`
})
export class BureauSalaryTab implements AfterViewInit, OnDestroy {
    public company: KpiCompany;
    public viewData: any[];
    private subscription: Subscription;
    public accountingYear: number;
    @HostBinding('class.no_access') public noAccess: boolean = false;

    constructor(
        private element: ElementRef,
        private cd: ChangeDetectorRef,
        private customHttpService: BureauCustomHttpService,
        private authService: AuthService,
        private errorService: ErrorService,
        public currentCompanyService: BureauCurrentCompanyService,
        financialYearService: FinancialYearService,
    ) {
        this.accountingYear = financialYearService.getActiveYear();
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
                    this.getLastPayroll(company.Key),
                    this.getPayrollPaymentDate(company.Key),
                    this.getLastPeriodOfAMelding(company.Key),
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
