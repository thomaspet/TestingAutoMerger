import {Component, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import {of, Subscription, Observable} from 'rxjs';
import {catchError, map} from 'rxjs/operators';

import {DashboardDataService} from '../../../dashboard-data.service';
import {NumberFormat} from '@app/services/services';

import * as moment from 'moment';
import {theme} from 'src/themes/theme';

@Component({
    selector: 'unpaid-bills',
    templateUrl: './unpaid-bills.html',
    styleUrls: ['./unpaid-bills.sass'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UnpaidBillsWidget {
    chartConfig;

    dataSubscription: Subscription;
    loading = true;
    hasData = false;

    overdue: number;
    notOverdue: number;

    sumUnpaid: number;
    unpaidData = [];
    colors = [theme.widgets.primary, theme.widgets.bad];


    constructor(
        private cdr: ChangeDetectorRef,
        private dataService: DashboardDataService,
        private numberFormatter: NumberFormat,
    ) {}

    ngOnInit() {
        this.dataSubscription = this.loadData().subscribe(res => {
            this.overdue = res?.overdue || 0;
            this.notOverdue = res?.notOverdue || 0;

            this.hasData = !!(this.overdue || this.notOverdue);
            if (this.hasData) {
                this.chartConfig = this.getChartConfig();
            }

            this.loading = false;
            this.cdr.markForCheck();
        });
    }

    ngOnDestroy() {
        this.dataSubscription?.unsubscribe();
    }

    private loadData(): Observable<{overdue: number, notOverdue: number}> {
        const today = moment().format('YYYYMMDD');
        const endpoint = `/api/statistics?model=SupplierInvoice&wrap=false`
            + `&filter=RestAmount gt 0 and StatusCode ne 30108 and StatusCode ne 40001 and StatusCode ne 30101`
            + `&select=sum(casewhen(PaymentDueDate ge '${today}',RestAmount,0) ) as notOverdue,sum(casewhen(PaymentDueDate lt '${today}',RestAmount,0) ) as overdue`

        return this.dataService.get(endpoint).pipe(
            catchError(err => {
                console.error(err);
                return of(null);
            }),
            map(res => res && res[0])
        );
    }

    private getChartConfig() {
        return {
            type: 'pie',
            data: {
                datasets: [{
                    data: [this.notOverdue, this.overdue],
                    backgroundColor: this.colors,
                    label: '',
                    borderColor: '#fff',
                    hoverBorderColor: '#fff'
                }],
                labels: ['Ikke forfalt', 'Forfalt']
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutoutPercentage: 72,
                legend: {display: false},
                tooltips: {enabled: false},
                elements: {arc: {borderWidth: 8}},
                animation: {animateScale: true},
                plugins: {
                    doughnutlabel: {
                        labels: [
                            {
                                text: 'Sum',
                                color: '#2b2b2b',
                                font: {size: '16'}
                            },
                            {
                                text: this.numberFormatter.asMoney(this.notOverdue + this.overdue),
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
