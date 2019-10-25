import {Component, ChangeDetectionStrategy, ChangeDetectorRef, AfterViewInit} from '@angular/core';
import {WidgetDataService} from '../widgetDataService';
import {IUniWidget} from '../uniWidget';
import {Router} from '@angular/router';
import {Observable} from 'rxjs';
import * as moment from 'moment';

@Component({
    selector: 'uni-events-widget',
    template: `
        <section class="widget-wrapper">
            <section class="header">
                <span> Nye </span>

                <section class="filters uni-redesign">
                    <button class="toggle-button" [matMenuTriggerFor]="contextMenu">
                        {{ currentTimeSpan.label }}
                        <i class="material-icons">expand_more</i>
                    </button>
                    <mat-menu #contextMenu="matMenu">
                        <ul class="widget-filter-menu">
                            <li *ngFor="let ts of timespans" role="button" (click)="changeTimeSpan(ts)">
                                {{ ts.label }}
                            </li>
                        </ul>
                    </mat-menu>
                </section>
            </section>

            <div class="content event-widget-content">
                <ul>
                    <li *ngFor="let data of formattedData">
                        <i class="material-icons" [ngClass]="data.class"> {{ data.icon }} </i>
                        <span (click)="onClickNavigate(data)"> {{ data.label }} </span>
                        <span class="event-new-value" [ngClass]="data.class"> {{ data.value }} </span>
                    </li>
                </ul>
            </div>
        </section>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class UniEventsWidget implements AfterViewInit {
    public widget: IUniWidget;
    public timespans: any[] = [
        { timespan: 0, label: 'I dag' },
        { timespan: 7, label: 'Siste 7 dager' },
        { timespan: 14, label: 'Siste 14 dager' },
        { timespan: 30, label: 'Siste 30 dager' }
    ];
    public currentTimeSpan = this.timespans[0];

    public formattedData = [
        {
            label: 'Leverandørfaktura',
            value: 0,
            icon: 'inbox',
            class: 'green-event',
            link: '/accounting/bills?filter=All',
            permission: 'ui_accounting_bills',
            hasAccess: true
        },
        {
            label: 'Faktura',
            value: 0,
            icon: 'credit_card',
            class: 'green-event',
            link: '/sales/invoices',
            permission: 'ui_sales_invoices',
            hasAccess: true
        },
        {
            label: 'Ordre',
            value: 0,
            icon: 'business',
            class: 'green-event',
            link: '/sales/orders',
            permission: 'ui_sales_orders',
            hasAccess: true
        },
        {
            label: 'Tilbud',
            value: 0,
            icon: 'local_offer',
            class: 'green-event',
            link: '/sales/quotes',
            permission: 'ui_sales_quotes',
            hasAccess: true
        },
        {
            label: 'Kunder',
            value: 0,
            icon: 'people_outline',
            class: 'green-event',
            link: '/sales/customer',
            permission: 'ui_sales_customer',
            hasAccess: true
        }
    ];

    constructor(
        private widgetDataService: WidgetDataService,
        private router: Router,
        private cdr: ChangeDetectorRef
    ) {
        const indexForTimeSpan = localStorage.getItem('timespanindex');
        this.currentTimeSpan = this.timespans[indexForTimeSpan || 0];
    }

    public ngAfterViewInit() {
        this.loadData();
    }

    public loadData() {
        Observable.forkJoin(this.getQueries()).subscribe(
            res => {
                res.forEach((data, index) => {
                    const next = this.formattedData.find(item => item.hasAccess);
                    next.value = data.Data[0].value;
                    next.hasAccess = false;
                });
                this.cdr.markForCheck();
            },
            err => console.error(err)
        );
    }

    public changeTimeSpan(timespan: any) {
        this.currentTimeSpan = timespan;
        localStorage.setItem('timespanindex', this.timespans.findIndex(res => res.timespan === timespan.timespan).toString());
        this.loadData();
    }

    public getQueries() {
        return [
            this.widgetDataService.getData(`/api/statistics?model=SupplierInvoice&select=count(ID) as value&`
            + `filter=createdat ge '${moment().subtract(this.currentTimeSpan.timespan, 'd').format('YYYY-MM-DD')}'`),
            this.widgetDataService.getData(`/api/statistics?model=CustomerInvoice&select=count(ID) as value&`
            + `filter=createdat ge '${moment().subtract(this.currentTimeSpan.timespan, 'd').format('YYYY-MM-DD')}'`),
            this.widgetDataService.getData(`/api/statistics?model=CustomerOrder&select=count(ID) as value&`
            + `filter=createdat ge '${moment().subtract(this.currentTimeSpan.timespan, 'd').format('YYYY-MM-DD')}'`),
            this.widgetDataService.getData(`/api/statistics?model=CustomerQuote&select=count(ID) as value&`
            + `filter=createdat ge '${moment().subtract(this.currentTimeSpan.timespan, 'd').format('YYYY-MM-DD')}'`),
            this.widgetDataService.getData(`/api/statistics?model=Customer&select=count(ID) as value&`
            + `filter=createdat ge '${moment().subtract(this.currentTimeSpan.timespan, 'd').format('YYYY-MM-DD')}'`)
        ].filter((query, index) => {
            if (!this.widgetDataService.hasAccess(this.formattedData[index].permission)) {
                this.formattedData[index].hasAccess = false;
            }
            return this.formattedData[index].hasAccess;
        });
    }

    public onClickNavigate(row) {
        this.router.navigateByUrl(row.link);
    }
}
