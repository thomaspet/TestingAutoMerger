import {Component} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {IUniTabsRoute} from '../../layout/uniTabs/uniTabs';
import {StatusCodeCustomerInvoice} from '../../../unientities';
import {IPosterWidget} from '../../common/poster/poster';
import {
    StatisticsService,
    NumberFormat
} from '../../../services/services';

@Component({
    selector: 'uni-seller-component',
    template: `
    <uni-poster [widgets]="salesWidgets" *ngIf="salesWidgets"></uni-poster>
    <uni-tabs [routes]="childRoutes" class="horizontal_nav"></uni-tabs>
    <router-outlet></router-outlet>`
})
export class SellerDetailsComponent {
    public childRoutes: IUniTabsRoute[];

    private sellerId: number;
    private salesWidgets: IPosterWidget[] = [
        {
            type: 'text',
            size: 'small',
            config: {
                topText: [
                    { text: 'Totalsum inkl. mva', class: 'large' },
                    { text: 'fakturert hittil i år', class: 'small' }
                ],
                mainText: { text: '' }
            }
        },
        {
            type: 'text',
            size: 'small',
            config: {
                topText: [
                    { text: 'Selgersum inkl. mva', class: 'large' },
                    { text: 'fakturert hittil i år', class: 'small' }
                ],
                mainText: { text: '' }
            }
        },
        {
            type: 'text',
            size: 'small',
            config: {
                topText: [
                    { text: 'Antall salg', class: 'large' },
                    { text: 'antall hittil i år', class: 'small' }
                ],
                mainText: { text: '' }
            }
        }
    ];

    constructor(
        private route: ActivatedRoute,
        private statisticsService: StatisticsService,
        private numberformat: NumberFormat
    ) {
        this.route.params.subscribe(params => {
            this.sellerId = +params['id'];
            this.childRoutes = [
                {
                    name: 'Detaljer',
                    path: 'details'
                },
                {
                    name: 'Faktura',
                    path: 'invoices'
                },
                {
                    name: 'Ordre',
                    path: 'orders'
                },
                {
                    name: 'Tilbud',
                    path: 'quotes'
                }
            ].filter((item) =>  item.path === 'details' || this.sellerId);
        });

        this.loadSalesSums();
    }

    private loadSalesSums() {
       this.statisticsService.GetAllUnwrapped(
            `model=CustomerInvoice&select=sum(TaxInclusiveAmount) as TotalAmount,`
            + `sum(TaxInclusiveAmount mul casewhen(SellerLink.Percent gt 0,`
            + `SellerLink.Percent,100) div 100) as SellerTotalAmount,count(ID) as TotalCount`
            + `&join=CustomerInvoice.ID eq SellerLink.CustomerInvoiceID`
            + `&filter=SellerLink.SellerID eq ${this.sellerId} and StatusCode ne ${StatusCodeCustomerInvoice.Draft} `
            + `and year(InvoiceDate) eq thisyear()`
        ).subscribe(response => {
            /* tslint:disable */
            let sums = response[0];
            this.salesWidgets[0].config.mainText.text = this.numberformat.asMoney(sums.TotalAmount | 0);
            this.salesWidgets[1].config.mainText.text = this.numberformat.asMoney(sums.SellerTotalAmount | 0);
            this.salesWidgets[2].config.mainText.text = sums.TotalCount | 0;
        });
    }
}
