import {
    Component,
    Input,
    ChangeDetectionStrategy,
    ElementRef,
    ChangeDetectorRef,
    SimpleChanges,
    OnChanges
} from '@angular/core';
import {KpiCompany} from '../kpiCompanyModel';
import {AppConfig} from '../../../AppConfig';
import {BureauCustomHttpService} from '../bureauCustomHttpService';
import {YearService} from '../../../services/common/yearService';
import {Observable} from 'rxjs/Observable';
import {AuthService} from '../../../authService';

const BASE = AppConfig.BASE_URL;

@Component({
    selector: 'uni-bureau-sales-tab',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
<table *ngIf="!!viewData">
    <tr><th>Faktura</th></tr>
    <tr>
        <td>Salgsfaktura i {{accountingYear}} sum og antall</td>
        <td>
            <a href="#" (click)="navigateToCompanyUrl('/sales/invoices?filter=all_invoices')">
                {{viewData[0].sumtaxexclusiveamount | unicurrency}} kr ({{viewData[0].countid}})
            </a>
        </td>
    </tr>
    <tr>
        <td>Forfalte ubetalte faktura</td>
        <td>
            <a href="#" (click)="navigateToCompanyUrl('/sales/invoices?filter=all_invoices')">
                {{viewData[1]  | unicurrency}} kr
            </a>
        </td>
    </tr>
    <tr><td colspan="2"><hr/></td></tr>
    <tr><th>Ordre</th></tr>
    <tr>
        <td>Ordrereserve</td>
        <td>
            <a href="#" (click)="navigateToCompanyUrl('/sales/invoices?filter=all_invoices')">
                {{viewData[2] | unicurrency}} kr
            </a>
        </td>
    </tr>
</table>`
})
export class BureauSalesTab implements OnChanges {
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
            this.getSalesInvoices(),
            this.getDueSalesInvoices(),
            this.getOrderReserve()
        )
            .do(() => this.element.nativeElement.setAttribute('aria-busy', false))
            .do(() => this.cd.markForCheck())
            .subscribe(
                result => this.viewData = result
            );
    }

    public getSalesInvoices() {
        const year = this.accountingYear;
        return this.customHttpService.get(
            `${BASE}/api/statistics?model=customerinvoice&select=sum(taxexclusiveamount),`
            + `count(id)&filter=year(invoicedate) eq ${year} and statuscode ge 42002`,
            this.company.Key
        )
            .map(this.customHttpService.singleStatisticsExtractor);
    }

    public getDueSalesInvoices() {
        return this.customHttpService.get(
            `${BASE}/api/statistics?model=customerinvoice`
                + `&select=sum(RestAmount),count(id)`
                + `&filter=now() ge PaymentDueDate `
                + `and (StatusCode eq 42002 or StatusCode eq 42003) and restamount gt 0`,
            this.company.Key
        )
            .map(this.customHttpService.singleStatisticsExtractor)
            .map(result => result.sumRestAmount)
            .map(sum => sum === null ? 0 : sum);
    }

    public getOrderReserve() {
        return this.customHttpService.get(
            `${BASE}/api/statistics?model=customerorder&select=sum(items.SumTotalExVat) as sum,`
                + `count(id) as counter&filter=items.statuscode eq 41102 `
                + `and (statuscode eq 41002 or statuscode eq 41003)&join=&expand=items`,
            this.company.Key
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
