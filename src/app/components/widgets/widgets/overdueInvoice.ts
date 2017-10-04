import {Component, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import {WidgetDataService} from '../widgetDataService';
import {IUniWidget} from '../uniWidget';
import {Router} from '@angular/router';

@Component({
    selector: 'uni-overdue-invoice',
    template: `
        <div class="positive-negative-widget"
            [ngClass]="positive ? 'positive' : 'negative'"
            (click)="onClickNavigate()"
            title="Totalsum forfalte faktura">

            <span class="title">Forfalte ubetalte faktura</span>
            <span class="value">{{displayValue}}</span>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class UniOverdueInvoiceWidget {
    public widget: IUniWidget;
    public displayValue: string = '-';
    public positive: boolean;

    constructor(
        private widgetDataService: WidgetDataService,
        private router: Router,
        private cdr: ChangeDetectorRef
    ) {}

    public ngAfterViewInit() {
        this.widgetDataService.getData("/api/statistics?skip=0&top=50&model=CustomerInvoice&select=sum(CustomerInvoice.RestAmount) as sum&filter=(CustomerInvoice.PaymentDueDate le 'getdate()' )")
            .subscribe((res) => {
                if (!res || !res.Data) {
                    return;
                }

                const sum = res.Data[0] && (res.Data[0].sum || 0);
                this.positive = sum <= 0;
                this.displayValue = sum.toFixed(2)
                    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
                    .replace('.', ',');

                this.cdr.markForCheck();
            });
    }

    public onClickNavigate() {
        if (this.widget && !this.widget._editMode) {
            this.router.navigateByUrl('/sales/invoices?expanded=ticker&selected=null&filter=overdue_invoices');
        }
    }
}
