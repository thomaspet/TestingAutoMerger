import {Component, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import {of, Subscription, forkJoin} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import * as moment from 'moment';
import {DashboardDataService} from '../../../dashboard-data.service';
import {theme} from 'src/themes/theme';

@Component({
    selector: 'order-reserve',
    templateUrl: './order-reserve.html',
    styleUrls: ['../invoiced/invoiced.sass'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrderReserveWidget {
    dataSubscription: Subscription;
    chartConfig;
    colors = [theme.widgets.primary, theme.widgets.bar_foreground];

    loading = true;
    hasData = false;

    labels: string[];

    ordersToInvoice: number[];
    orderSum: number[];
    orderTotal: number;

    sumInvoiced: number;
    totalReserve: number;

    tooltip;

    constructor(
        private cdr: ChangeDetectorRef,
        private dataService: DashboardDataService,
    ) {}

    ngOnInit() {
        forkJoin(
            this.getInvoiceSums('TaxExclusiveAmountCurrency'),
            this.getInvoiceSums('RestExclusiveAmountCurrency')
        ).subscribe(([orderTotal, restAmounts]) => {
            this.hasData = orderTotal?.length && orderTotal.some(item => !!item);


            if (this.hasData) {
                // Since we're showing last 12 months we need to reorganize the items.
                // E.g if current month is July then the first bar of the chart will be July last year
                const endMonth = new Date().getMonth() + 1;
                const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Des'];
                labels.push(...labels.splice(0, endMonth));
                this.labels = labels;

                orderTotal.push(...orderTotal.splice(0, endMonth));
                restAmounts.push(...restAmounts.splice(0, endMonth));

                this.orderSum = orderTotal;

                this.ordersToInvoice = restAmounts.map((restAmount, index) => {
                    return this.orderSum[index] - restAmount;
                });

                this.orderTotal = this.orderSum.reduce((sum, value) => sum += value || 0, 0);

                this.sumInvoiced = this.ordersToInvoice.reduce((sum, value) => sum += value || 0, 0);
                this.totalReserve = this.orderTotal - this.sumInvoiced;

                this.chartConfig = this.getChartConfig();
            }

            this.loading = false;
            this.cdr.markForCheck();
        });
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
                        label: 'Overført til faktura',
                        data: this.ordersToInvoice,
                        backgroundColor: this.colors[0],
                        barThickness: 16,
                    },
                    {
                        label: 'Total ordresum',
                        data: this.orderSum,
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
                            const invoiced = data[0].yLabel || 0;
                            const orderTotal = data[1].yLabel || 0;

                            this.tooltip = {
                                orderTotal: orderTotal,
                                invoiced: invoiced,
                                reserve: orderTotal - invoiced,
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

    private getInvoiceSums(sumField: string) {
        const fromDate = moment().subtract(11, 'month').startOf('month').format('YYYYMMDD');
        const toDate = moment().endOf('month').format('YYYYMMDD');

        const filter = [
            `StatusCode ne '41005'`,
            `OrderDate ge '${fromDate}'`,
            `OrderDate le '${toDate}'`
        ].join(' and ');

        const endpoint = '/api/statistics?model=CustomerOrder'
            + `&select=month(OrderDate) as Periode,sum(${sumField}) as Sum`
            + `&filter=${filter}&range=Periode&wrap=false`;

        return this.dataService.get(endpoint).pipe(
            catchError(err => {
                console.error(err);
                return of([]);
            }),
            map(res => (res || []).map(item => item.Sum || 0))
        );
    }
}
