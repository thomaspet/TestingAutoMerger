import {
    Component,
    Input,
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
import {BureauCurrentCompanyService} from '../bureauCurrentCompanyService';
import {ErrorService} from '../../../services/common/errorService';

const BASE = environment.BASE_URL;

@Component({
    selector: 'uni-bureau-sales-tab',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
<section *ngIf="!!viewData" class="tab-parts">
    <section class="tab-part">
        <section class="image-container">
            <img class="invoice-icon">
            <span>Faktura</span>
        </section>
        <section class="text-container">
            <p>
                Salgsfaktura i {{accountingYear}}:
                <a (click)="navigateToCompanyUrl('/sales/invoices?filter=all_invoices')">
                    {{viewData[0].sumtaxexclusiveamount | unicurrency}} kr
                </a>
                ({{viewData[0].countid}} stk)
            </p>

            <p>
                Forfalte ubetalte faktura:
                <a (click)="navigateToCompanyUrl('/sales/invoices?filter=all_invoices')">
                    {{viewData[1]  | unicurrency}} kr
                </a>
            </p>
        </section>
    </section>
    <section class="tab-part">
        <section class="image-container">
            <img class="sale-icon">
            <span>Ordre</span>
        </section>
        <section class="text-container">
            <p>
                Ordrereserve
                <a (click)="navigateToCompanyUrl('/sales/orders')">
                    {{viewData[2] | unicurrency}} kr
                </a>
            </p>
        </section>
    </section>
</section>`
})
export class BureauSalesTab implements AfterViewInit, OnDestroy {
    @Input() public company: KpiCompany;

    public accountingYear: number;
    public viewData: any[];
    private subscription: Subscription;
    @HostBinding('class.no_access') public noAccess: boolean = false;

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
            .subscribe(company => {
                this.company = company;
                this.noAccess = false;
                this.element.nativeElement.setAttribute('aria-busy', true);
                Observable.forkJoin(
                    this.getSalesInvoices(company.Key),
                    this.getDueSalesInvoices(company.Key),
                    this.getOrderReserve(company.Key),
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

    public getSalesInvoices(companyKey: string): Observable<any> {
        const year = this.accountingYear;
        return this.customHttpService.get(
            `${BASE}/api/statistics?model=customerinvoice`
            + `&select=sum(taxexclusiveamount),count(id)`
            + `&filter=year(invoicedate) eq ${year} and statuscode ge 42002`,
            companyKey
        )
            .map(this.customHttpService.singleStatisticsExtractor)
    }

    public getDueSalesInvoices(companyKey: string): Observable<number> {
        return this.customHttpService.get(
            `${BASE}/api/statistics?model=customerinvoice`
            + `&select=sum(RestAmount),count(id)`
            + `&filter=now() ge PaymentDueDate and (StatusCode eq 42002 or StatusCode eq 42003) and restamount gt 0`,
            companyKey
        )
            .map(this.customHttpService.singleStatisticsExtractor)
            .map(result => result.sumRestAmount)
            .map(sum => sum === null ? 0 : sum);
    }

    public getOrderReserve(companyKey: string): Observable<number> {
        return this.customHttpService.get(
            `${BASE}/api/statistics?model=customerorder`
            + `&select=sum(items.SumTotalExVat) as sum,count(id) as counter`
            + `&filter=items.statuscode eq 41102 and (statuscode eq 41002 or statuscode eq 41003)&join=&expand=items`,
            companyKey
        )
            .map(this.customHttpService.singleStatisticsExtractor)
            .map(result => result.sum)
            .map(sum => sum === null ? 0 : sum);
    }

    public navigateToCompanyUrl(url: string) {
        this.authService.setActiveCompany(<any>this.company, url);
        this.element.nativeElement.setAttribute('aria-busy', true);
    }
}
