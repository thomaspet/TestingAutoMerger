import {Component, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import {Router} from '@angular/router';
import {of, Subscription} from 'rxjs';
import {map, catchError} from 'rxjs/operators';

import {NumberFormat} from '@app/services/services';
import {DashboardDataService} from '../../../dashboard-data.service';
import {CustomerInvoice} from '@uni-entities';

import * as moment from 'moment';
import {theme} from 'src/themes/theme';

@Component({
    selector: 'unpaid',
    templateUrl: './unpaid.html',
    styleUrls: ['./unpaid.sass'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UnpaidWidget {
    dataSubscription: Subscription;

    loading = true;
    hasData = false;
    viewMode: 'overview' | 'invoices' = 'overview';

    overviewLoaded = false;
    invoicesLoaded = false;

    overviewData = [];
    totalUnpaid: number;
    chartConfig;
    invoices: CustomerInvoice[];

    constructor(
        private router: Router,
        private cdr: ChangeDetectorRef,
        private numberFormatService: NumberFormat,
        private dataService: DashboardDataService,
    ) {}

    ngOnInit() {
        this.initOverview();
    }

    ngOnDestroy() {
        this.dataSubscription?.unsubscribe();
    }

    onViewModeChange() {
        if (this.viewMode === 'overview' && !this.overviewLoaded) {
            this.initOverview();
        }

        if (this.viewMode === 'invoices' && !this.invoicesLoaded) {
            this.loadInvoices();
        }
    }

    private initOverview() {
        this.dataSubscription?.unsubscribe();
        this.dataSubscription = this.getOverviewData().subscribe(res => {
            this.hasData = res && !!(res.notOverdue || res.thirtyDays || res.sixtyDays || res.overSixtyDays);

            if (this.hasData) {
                this.overviewData = [
                    {
                        label: 'Over 60 dager',
                        value: res.overSixtyDays || 0,
                        color: theme.widgets.bad,
                        backgroundColor: theme.widgets.bad_soft,
                        textColor: theme.widgets.bad_text,
                    },
                    {
                        label: '31-60 dager',
                        value: res.sixtyDays || 0,
                        color: theme.widgets.warn,
                        backgroundColor: theme.widgets.warn_soft,
                        textColor: theme.widgets.warn_text,
                    },
                    {
                        label: '1-30 dager',
                        value: res.thirtyDays || 0,
                        color: theme.widgets.primary,
                        backgroundColor: theme.widgets.primary_soft,
                        textColor: theme.widgets.primary_text,
                    },
                    {
                        label: 'Ikke forfalt',
                        value: res.notOverdue || 0,
                        color: theme.widgets.secondary,
                        backgroundColor: theme.widgets.secondary_soft,
                        textColor: theme.widgets.secondary_text,
                    },
                ];

                this.totalUnpaid = this.overviewData.reduce((sum, item) => sum += (item.value || 0), 0);
                this.chartConfig = this.getChartConfig();

                this.overviewLoaded = true;
            }

            this.loading = false;
            this.cdr.markForCheck();
        });
    }

    private getOverviewData() {
        const today = moment().format('YYYYMMDD');
        const daysAgo = (days: number) => moment().subtract(days, 'd').format('YYYYMMDD');

        const select = [
            `sum(casewhen(PaymentDueDate gt '${today}',RestAmount,0) ) as notOverdue`,
            `sum(casewhen(PaymentDueDate ge '${daysAgo(30)}' and PaymentDueDate le '${today}',RestAmount,0) ) as thirtyDays`,
            `sum(casewhen(PaymentDueDate ge '${daysAgo(60)}' and PaymentDueDate le '${daysAgo(31)}',RestAmount,0) ) as sixtyDays`,
            `sum(casewhen(PaymentDueDate lt '${daysAgo(60)}',RestAmount,0) ) as overSixtyDays`,
        ].join(',');

        const filter = '(StatusCode eq 42002 or StatusCode eq 42003) and RestAmount gt 0';
        const endpoint = `/api/statistics?model=CustomerInvoice&select=${select}&filter=${filter}&wrap=false`;

        return this.dataService.get(endpoint).pipe(
            map(res => res && res[0]),
            catchError(err => {
                console.error(err);
                return of({
                    notOverdue: 0,
                    thirtyDays: 0,
                    sixtyDays: 0,
                    overSixtyDays: 0
                });
            })
        );
    }

    public loadInvoices() {
        this.dataSubscription?.unsubscribe();

        const today = moment().format('YYYYMMDD');
        const endpoint = `/api/statistics?model=CustomerInvoice`
            + `&select=ID as ID,PaymentDueDate as PaymentDueDate,CustomerName as CustomerName,InvoiceNumber as InvoiceNumber,RestAmount as RestAmount,StatusCode as StatusCode`
            + `&filter=PaymentDueDate le ${today} and RestAmount gt 0 and StatusCode ne 42001 and (Reminder.DueDate lt ${today} or isnull(Reminder.ID, 0) eq 0)`
            + `&join=CustomerInvoice.ID eq CustomerInvoiceReminder.CustomerInvoiceID as Reminder`
            + `&expand=Customer&orderby=PaymentDueDate&top=25&wrap=false`;

        this.dataSubscription = this.dataService.get(endpoint).pipe(
            catchError(err => {
                console.error(err);
                return of([]);
            })
        ).subscribe(invoices => {
            this.invoices = invoices;
            this.invoicesLoaded = true;
            this.cdr.markForCheck();
        });
    }

    onInvoiceClick(invoice) {
        this.router.navigateByUrl('/sales/invoices/' + invoice.ID);
    }

    private getChartConfig() {
        return {
            type: 'pie',
            data: {
                datasets: [{
                    data: this.overviewData.map(item => item.value),
                    backgroundColor: this.overviewData.map(item => item.color),
                    label: '',
                    borderColor: '#fff',
                    hoverBorderColor: '#fff'
                }],
                labels: this.overviewData.map(item => item.label)
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutoutPercentage: 72,
                animation: {
                    animateScale: true
                },
                legend: {display: false},
                tooltips: {enabled: false},
                elements: {
                    arc: {borderWidth: 8}
                },
                plugins: {
                    doughnutlabel: {
                        labels: [
                            {
                                text: 'Sum utestående',
                                color: '#2b2b2b',
                                font: {size: '16'}
                            },
                            {
                                text: this.numberFormatService.asMoney(this.totalUnpaid),
                                color: '#2b2b2b',
                                font: {size: '17', weight: '500'}
                            }
                        ]
                    }
                },
            }
        };
    }
}
