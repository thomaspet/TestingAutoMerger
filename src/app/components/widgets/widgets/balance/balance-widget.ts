import {
    Component,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    ViewChild,
    ElementRef,
} from '@angular/core';
import {take} from 'rxjs/operators';
import {Chart, ChartConfiguration} from 'chart.js';

import {IUniWidget} from '../../uniWidget';
import {WidgetDataService} from '../../widgetDataService';

@Component({
    selector: 'balance-widget',
    template: `
        <section class="widget-wrapper">
            <section class="header">
                <span>Balansefordeling</span>
            </section>
            <div class="content">
                <!--
                <section class="chart-legend">
                    <section *ngFor="let item of items; let idx = index" class="legend">
                        <span class="indicator" [ngStyle]="{'background': colors[idx]}"></span>
                        {{item.SubGroupName}}: <strong>{{ item.Sum | uninumberformat:'money'}}</strong>
                    </section>
                </section>
                -->
                <div class="canvas-wrapper">
                    <canvas #canvas></canvas>
                </div>
            </div>
        </section>
    `,
    styleUrls: ['./balance-widget.sass'],
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class BalanceWidget {
    @ViewChild('canvas') canvas: ElementRef;

    widget: IUniWidget;

    chartRef: any;
    totalAmount: number = 0;

    data;
    absoluteSum;
    v2 = ['#62B2FF', '#4DB6AC', '#94E4FF', '#7BCBFF', '#f6dc8d', '#80E9DF', '#FF9989', '#FF6656', '#FFDE29'];
    colors = ['#2F7FDA', '#4898F3', '#62B2FF', '#7BCBFF', '#94E4FF', '#E1FFFF', '#4DB6AC', '#81C784', '#AED581', '#DCE775'];

    constructor(
        private dataService: WidgetDataService,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnDestroy() {
        if (this.chartRef) {
            this.chartRef.destroy();
        }
    }

    ngOnInit() {
        const year = new Date().getFullYear();
        this.dataService.getData('/api/biz/accounts?action=balance-grouped&financialyear=' + year).pipe(
            take(1)
        ).subscribe(
            res => {
                const data: any[] = (res || []).filter(item => !!item.Sum);
                this.absoluteSum = data.reduce((total, item) => {
                    return total + Math.abs((item.Sum || 0));
                }, 0);

                this.drawChart(data);
            },
            err => console.error(err)
        );
    }

    private drawChart(data) {
        if (!data || !data.length) {
            return;
        }

        if (this.chartRef) {
            this.chartRef.destroy();
        }

        this.data = data;
        const config = this.getChartConfig();

        this.chartRef = new Chart(this.canvas.nativeElement, config);
        this.cdr.markForCheck();
    }

    private getChartConfig(): ChartConfiguration {
        return {
            type: 'pie',
            data: {
                labels: this.data.map(i => i.SubGroupName),
                datasets: [{
                    data: this.data.map(i => Math.abs(i.Sum)),
                    backgroundColor: this.v2, // this.colors,
                    label: '',
                    borderColor: 'white',
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    animateScale: true
                },
                legend: {
                    position: 'left',
                    labels: {
                        usePointStyle: true
                    }
                },
                plugins: {
                    datalabels: {
                        display: true,
                        color: '#596879',
                        backgroundColor: '#fff',
                        borderRadius: 3,
                        font: {
                            size: 10
                        },
                        formatter: (chartvalue, context) => {
                            const item = this.data[context.dataIndex];

                            if (item) {
                                const percent = (item.Sum * 100) / this.absoluteSum;
                                return Math.round(percent) + '%';
                            }

                            return chartvalue;
                        }
                    }
                }
            }
        };
    }
}
