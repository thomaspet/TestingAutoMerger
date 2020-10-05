import {Component, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import {of, Subscription, forkJoin} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import * as moment from 'moment';
import {DashboardDataService} from '../../../dashboard-data.service';
import {theme} from 'src/themes/theme';

@Component({
    selector: 'invoiced',
    templateUrl: './invoiced.html',
    styleUrls: ['./invoiced.sass'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class InvoicedWidget {
    dataSubscription: Subscription;
    chartConfig;
    colors = [theme.widgets.primary, theme.widgets.bar_foreground];

    loading = true;
    hasData = false;

    labels: string[];
    invoiced: number[];
    paid: number[];

    sumInvoiced: number;
    sumPaid: number;
    sumOverdue: number;

    tooltip;

    constructor(
        private cdr: ChangeDetectorRef,
        private dataService: DashboardDataService,
    ) {}

    ngOnInit() {
        forkJoin(
            this.getInvoiceSums('TaxInclusiveAmount'),
            this.getInvoiceSums('RestAmount'),
            this.getOverdueSum()
        ).subscribe(([invoiced, restAmounts, sumOverdue]) => {
            this.hasData = invoiced?.length && invoiced.some(item => !!item);
            if (this.hasData) {
                // Since we're showing last 12 months we need to reorganize the items.
                // E.g if current month is July then the first bar of the chart will be July last year
                const endMonth = new Date().getMonth() + 1;
                const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Des'];
                labels.push(...labels.splice(0, endMonth));
                this.labels = labels;

                invoiced.push(...invoiced.splice(0, endMonth));
                restAmounts.push(...restAmounts.splice(0, endMonth));

                this.invoiced = invoiced;
                this.paid = restAmounts.map((restAmount, index) => {
                    return this.invoiced[index] - restAmount;
                });

                this.sumInvoiced = this.invoiced.reduce((sum, value) => sum += value || 0, 0);
                this.sumPaid = this.paid.reduce((sum, value) => sum += value || 0, 0);
                this.sumOverdue = sumOverdue;

                this.chartConfig = this.getChartConfig();
            }

            this.loading = false;
            this.cdr.markForCheck();
        });
    }

    sortList(a, b) {
        return a.Periode > b.Periode ? 1 : -1;
    }

    ngOnDestroy() {
        this.dataSubscription?.unsubscribe();
    }

    getChartConfig() {
        return {
            type: 'roundedBarChart',
            data: {
                labels: this.labels,
                datasets: [
                    {
                        label: 'Innbetalt',
                        data: this.paid,
                        backgroundColor: this.colors[0],
                        barThickness: 16,
                    },
                    {
                        label: 'Fakturert',
                        data: this.invoiced,
                        backgroundColor: this.colors[1],
                        barThickness: 16,
                    },
                ]
            },
            options: {
                barRoundness: .75,
                responsive: true,
                maintainAspectRatio: false,
                legend: {display: false},
                scales: {
                    yAxes: [{
                        gridLines: {
                            borderDash: [4, 4],
                        },
                        ticks: {
                            maxTicksLimit: 8,
                            callback: function (value) {
                                if (value === 0 || (value < 999 && value > -999)) {
                                    return value;
                                } else if (value > -1000000 && value < 1000000) {
                                    return (value / 1000) + 'k';
                                } else if (value <= -1000000 || value >= 1000000) {
                                    return (value / 1000000) + 'm';
                                } else {
                                    return value;
                                }
                            }
                        }
                    }],
                    xAxes: [{
                        stacked: true,
                        gridLines: {display: false},
                    }]
                },
                tooltips: {
                    enabled: false,
                    mode: 'index',
                    position: 'nearest',
                    custom: tooltip => {
                        if (tooltip.dataPoints && tooltip.dataPoints.length) {
                            const data = tooltip.dataPoints;
                            const paid = data[0].yLabel || 0;
                            const invoiced = data[1].yLabel || 0;

                            this.tooltip = {
                                invoiced: invoiced,
                                paid: paid,
                                unpaid: invoiced - paid,
                                style: {
                                    top: tooltip.y + 'px',
                                    left: tooltip.x + 'px',
                                    opacity: '1'
                                }
                            };
                        } else {
                            this.tooltip = undefined;
                        }

                        this.cdr.markForCheck();
                    }
                },
            }
        };
    }

    private getOverdueSum() {
        const filter = [
            `CustomerInvoice.RestAmount ne '0'`,
            `CustomerInvoice.PaymentDueDate lt 'getdate()'`,
            `add(TaxInclusiveAmount, CreditedAmount) ne 0`,
            `(CustomerInvoice.StatusCode eq 42002 or CustomerInvoice.StatusCode eq 42003)`,
        ].join(' and ');

        const endpoint = '/api/statistics?model=CustomerInvoice'
            + `&select=sum(CustomerInvoice.RestAmount) as RestAmount`
            + `&filter=${filter}`
            + `&wrap=false`;

        return this.dataService.get(endpoint).pipe(
            catchError(err => {
                console.error(err);
                return of([]);
            }),
            map(res => res[0]?.RestAmount || 0)
        );
    }

    private getInvoiceSums(sumField: string) {
        const fromDate = moment().subtract(11, 'month').startOf('month').format('YYYYMMDD');
        const toDate = moment().endOf('month').format('YYYYMMDD');

        const filter = [
            `InvoiceType eq 0 and StatusCode ne '42001'`,
            `add(TaxInclusiveAmount, CreditedAmount) ne '0'`,
            `InvoiceDate ge '${fromDate}'`,
            `InvoiceDate le '${toDate}'`
        ].join(' and ');

        const endpoint = '/api/statistics?model=CustomerInvoice'
            + `&select=month(invoicedate) as Periode,sum(${sumField}) as Sum`
            + `&filter=${filter}&range=Periode&wrap=false`;

        return this.dataService.get(endpoint).pipe(
            catchError(err => {
                console.error(err);
                return of([]);
            }),
            map(res => (res || []).sort(this.sortList).map(item => item.Sum || 0))
        );
    }
}
