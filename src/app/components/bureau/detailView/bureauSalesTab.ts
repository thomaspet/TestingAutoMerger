import {Component, Input, ChangeDetectionStrategy} from '@angular/core';
import {KpiCompany} from '../kpiCompanyModel';
import {AppConfig} from '../../../AppConfig';
import {BureauCustomHttpService} from '../bureauCustomHttpService';
import {YearService} from '../../../services/common/yearService';

const BASE = AppConfig.BASE_URL;

@Component({
    selector: 'uni-bureau-sales-tab',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
<table>
    <tr><th>Faktura</th></tr>
    <tr>
        <td>Salgsfaktura i år sum og antall</td>
        <td><uni-value-loader [value]="getSalesInvoices()"></uni-value-loader></td>
    </tr>
    <tr>
        <td>Forfalte ubetalte faktura</td>
        <td><uni-value-loader [value]="getDueSalesInvoices()"></uni-value-loader></td>
    </tr>
    <tr><td colspan="2"><hr/></td></tr>
    <tr><th>Ordre</th></tr>
    <tr>
        <td>Ordrereserve</td>
        <td><uni-value-loader [value]="getOrderReserve()"></uni-value-loader></td>
    </tr>
</table>`
})
export class BureauSalesTab {
    @Input() public company: KpiCompany;

    constructor(
        private customHttpService: BureauCustomHttpService,
        private yearService: YearService
    ) {}

    public getSalesInvoices() {
        const year = this.yearService.getSavedYear();
        return this.customHttpService.get(
            `${BASE}/api/statistics?model=customerinvoice&select=sum(taxexclusiveamount),count(id)&filter=year(invoicedate) eq ${year} and statuscode ge 42002`,
            this.company.Key
        )
            .map(this.customHttpService.singleStatisticsExtractor)
            .map(result => result.sumtaxexclusiveamount)
            .map(sum => sum === null ? 0 : sum);
    }

    public getDueSalesInvoices() {
        return this.customHttpService.get(
            `${BASE}/api/statistics?model=customerinvoice&select=sum(RestAmount),count(id)&filter=now() ge PaymentDueDate and (StatusCode eq 42002 or StatusCode eq 42003) and restamount gt 0`,
            this.company.Key
        )
            .map(this.customHttpService.singleStatisticsExtractor)
            .map(result => result.sumRestAmount)
            .map(sum => sum === null ? 0 : sum);
    }

    public getOrderReserve() {
        return this.customHttpService.get(
            `${BASE}/api/statistics?model=customerorder&select=sum(items.SumTotalExVat) as sum,count(id) as counter&filter=items.statuscode eq 41102 and (statuscode eq 41002 or statuscode eq 41003)&join=&expand=items`,
            this.company.Key
        )
            .map(this.customHttpService.singleStatisticsExtractor)
            .map(result => result.sum)
            .map(sum => sum === null ? 0 : sum);
    }
}
