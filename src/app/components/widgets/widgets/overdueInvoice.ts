import { Component } from '@angular/core';
import { WidgetDataService } from '../widgetDataService';
import { IUniWidget } from '../uniWidget';
import { Router } from '@angular/router';

@Component({
    selector: 'uni-overdue-invoice',
    template: `
        <div class="positive-negative-widget"
            [ngClass]="positive ? 'positive' : 'negative'"
            (click)="onClickNavigate()"
            title="Totalsum forfalte faktura">

            <span class="title">forfalte ubetalte faktura</span>
            <span class="value">{{displayValue}}</span>
        </div>
    `
})

export class UniOverdueInvoiceWidget {
    public widget: IUniWidget;
    public displayValue: string = '-';
    public positive: boolean;

    constructor(
        private widgetDataService: WidgetDataService,
        private router: Router
    ) {}

    public ngAfterViewInit() {
        this.widgetDataService.getData("/api/statistics?skip=0&top=50&model=CustomerInvoice&select=sum(CustomerInvoice.RestAmount) as sum&filter=(CustomerInvoice.PaymentDueDate le 'getdate()' )")
            .subscribe((res) => {
                this.positive = res.Data[0].sum <= 0;

                // "Animate" counting of the numbers
                let counter = 0;
                let myInterval = setInterval(() => {
                    counter += (res.Data[0].sum) / 50;
                    this.displayValue = counter.toFixed(2)
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
                        .replace('.', ',');

                    if (counter >= res.Data[0].sum) {
                        clearInterval(myInterval);
                    }
                }, 20);
            });
    }

    public onClickNavigate() {
        if (this.widget && !this.widget._editMode) {
            this.router.navigateByUrl('/sales/invoices?expanded=ticker&selected=null&filter=overdue_invoices');
        }
    }
}
