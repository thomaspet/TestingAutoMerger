import {Component, ChangeDetectorRef, ChangeDetectionStrategy} from '@angular/core';
import {DashboardDataService} from '../../../dashboard-data.service';
import {theme} from 'src/themes/theme';

@Component({
    selector: 'balance-widget',
    templateUrl: './balance-widget.html',
    styleUrls: ['./balance-widget.sass'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BalanceWidget {
    loading = true;
    hasData = false;

    data;
    absoluteSum: number;
    chartConfig;

    constructor(
        private cdr: ChangeDetectorRef,
        private dataService: DashboardDataService
    ) {}

    ngOnInit() {
        const year = new Date().getFullYear();
        this.dataService.get('/api/biz/accounts?action=balance-grouped&financialyear=' + year).subscribe(
            res => {
                this.data = (res || []).filter(item => !!item.Sum);
                this.absoluteSum = this.data.reduce((total, item) => {
                    return total + Math.abs((item.Sum || 0));
                }, 0);

                if (this.data.length) {
                    this.chartConfig = this.getChartConfig();

                    this.hasData = true;
                    this.loading = false;
                    this.cdr.markForCheck();
                }

            },
            err => {
                console.error(err);
                this.loading = false;
                this.cdr.markForCheck();
            }
        );

    }

    private getChartConfig() {
        return {
            type: 'pie',
            data: {
                labels: this.data.map(i => i.SubGroupName),
                datasets: [{
                    data: this.data.map(i => Math.abs(i.Sum)),
                    backgroundColor: theme.widgets.pie_colors,
                    label: '',
                    borderColor: '#fff',
                    hoverBorderColor: '#fff',

                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    animateScale: true
                },
                elements: {
                    arc: { borderWidth: 2 }
                },
                plugins: {
                    datalabels: {
                        display: true,
                        backgroundColor: '#fff',
                        borderRadius: 3,
                        font: { size: 12 },
                        formatter: (chartvalue, context) => {
                            const item = this.data[context.dataIndex];
                            if (item) {
                                const percent = (item.Sum * 100) / this.absoluteSum;
                                return Math.abs(Math.round(percent)) + '%';
                            }

                            return chartvalue;
                        }
                    }
                }
            }
        };
    }
}
