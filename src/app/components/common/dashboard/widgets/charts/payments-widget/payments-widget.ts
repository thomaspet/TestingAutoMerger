import {Component, ChangeDetectorRef, ChangeDetectionStrategy} from '@angular/core';
import * as moment from 'moment';
import {DashboardDataService} from '../../../dashboard-data.service';
import {forkJoin, of} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {theme} from 'src/themes/theme';

@Component({
    selector: 'payments-widget',
    templateUrl: './payments-widget.html',
    styleUrls: ['./payments-widget.sass'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaymentsWidget {
    loading = true;
    hasData = false;

    labels: string[];
    incomingPayments;
    outgoingPayments;

    sumIncoming: number;
    sumOutgoing: number;

    colors = [theme.widgets.primary, theme.widgets.bar_foreground];
    chartConfig;
    tooltip;

    constructor(
        private cdr: ChangeDetectorRef,
        private dataService: DashboardDataService,
    ) {}

    ngOnInit() {
        forkJoin([
            this.getData(true),
            this.getData(false),
        ]).subscribe(([incoming, outgoing]) => {
            this.hasData = incoming.some(item => !!item.Sum) || outgoing.some(item => !!item.Sum);

            if (this.hasData) {
                const endMonth = new Date().getMonth() + 1;
                const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Des'];

                labels.push(...labels.splice(0, endMonth));
                this.labels = labels;

                incoming.push(...incoming.splice(0, endMonth));
                this.incomingPayments = incoming;

                outgoing.push(...outgoing.splice(0, endMonth));
                this.outgoingPayments = outgoing;

                this.sumIncoming = this.incomingPayments.reduce((sum, item) => sum += (item.Sum || 0), 0);
                this.sumOutgoing = this.outgoingPayments.reduce((sum, item) => sum += (item.Sum || 0), 0);

                this.chartConfig = this.getChartConfig();
            }

            this.loading = false;
            this.cdr.markForCheck();
        });
    }

    private getData(isCustomerPayment: boolean) {
        const from = moment().subtract(11, 'month').startOf('month').format('YYYYMMDD');
        const to = moment().endOf('month').format('YYYYMMDD');

        const endpoint = `/api/statistics?model=Payment&wrap=false`
            + `&select=month(PaymentDate) as Period,sum(Amount) as Sum,count(id) as Count`
            + `&filter=StatusCode eq '44004' and IsCustomerPayment eq '${isCustomerPayment}' and PaymentDate ge '${from}' and PaymentDate le '${to}'`
            + `&range=Period`;

        return this.dataService.get(endpoint).pipe(
            catchError(err => {
                console.error(err);
                return of([]);
            })
        );
    }

    private getChartConfig() {
        return {
            type: 'roundedBarChart',
            data: {
                labels: this.labels,
                datasets: [
                    {
                        label: 'Innbetalt',
                        data: this.incomingPayments.map(item => item.Sum),
                        backgroundColor: this.colors[0],
                        barThickness: 18,
                    },
                    {
                        label: 'Utbetalt',
                        data: this.outgoingPayments.map(item => item.Sum),
                        backgroundColor: this.colors[1],
                        barThickness: 18,

                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                legend: { display: false },
                scales: {
                    yAxes: [{
                        gridLines: { borderDash: [4, 4] },
                        ticks: {
                            maxTicksLimit: 8,
                            callback: function(value) {
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
                    xAxes: [{ gridLines: { display: false } }]
                },
                tooltips: {
                    enabled: false,
                    mode: 'index',
                    position: 'nearest',
                    custom: tooltip => {
                        if (tooltip.dataPoints && tooltip.dataPoints.length) {
                            const data = tooltip.dataPoints;
                            const index = data[0].index;

                            this.tooltip = {
                                label: this.labels[index],
                                incoming: this.incomingPayments[index],
                                outgoing: this.outgoingPayments[index],
                                style: {
                                    top: tooltip.y + 'px',
                                    left: tooltip.x + 'px',
                                }
                            };
                        } else {
                            this.tooltip = undefined;
                        }

                        this.cdr.markForCheck();
                    }
                }
            }
        };
    }

}
