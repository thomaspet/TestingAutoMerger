import {
    Component,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    ViewChild,
    ElementRef,
} from '@angular/core';
import {take} from 'rxjs/operators';
import * as Chart from 'chart.js';

import {IUniWidget} from '../../uniWidget';
import {WidgetDataService} from '../../widgetDataService';

@Component({
    selector: 'expenses-widget',
    template: `
        <section class="widget-wrapper">
            <section class="header">
                <span>Kostnader</span>
            </section>

            <section *ngIf="missingData" class="no-content">
                Mangler data
            </section>

            <div *ngIf="!missingData" class="content">
                <section class="chart-legend">
                    <section *ngFor="let item of items; let idx = index" class="legend">
                        <span class="indicator" [style.background]="colors[idx]"></span>
                        {{item.label}}: <strong>{{ (item.sum | uninumberformat:'money') || 0}}</strong>
                    </section>
                </section>

                <div class="canvas-wrapper">
                    <canvas #canvas></canvas>
                </div>
            </div>
        </section>
    `,
    styleUrls: ['./expenses-widget.sass'],
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class ExpensesWidget {
    @ViewChild('canvas') canvas: ElementRef;

    widget: IUniWidget;
    chartRef: any;

    missingData: boolean;
    totalAmount = 0;
    items: {label: string, sum: number}[] = [];
    colors = ['#005AA4', '#008ED2', '#7FC6E8'];

    constructor(
        private dataService: WidgetDataService,
        private cdr: ChangeDetectorRef
    ) {}

    ngAfterViewInit() {
        const year = new Date().getFullYear();
        this.dataService.getData('/api/biz/accounts?action=profit-and-loss-grouped&FinancialYear=' + year).pipe(
            take(1)
        ).subscribe(
            res => this.drawChart(res),
            err => console.error(err)
        );
    }

    ngOnDestroy() {
        if (this.chartRef) {
            this.chartRef.destroy();
        }
    }

    private drawChart(data) {
        if (!data || !data.length) {
            return;
        }

        if (this.chartRef) {
            this.chartRef.destroy();
        }

        const items = [];
        let totalAmount = 0;
        data.forEach(sumItem => {
            if (sumItem.GroupName === 'Varekostnad'
                || sumItem.GroupName === 'Lønnskostnad'
                || sumItem.GroupName === 'Annen driftskostnad'
            ) {
                totalAmount += sumItem.Sum || 0;
                items.push({label: sumItem.GroupName, sum: sumItem.Sum || 0});
            }
        });

        if (items.some(i => i.sum)) {
            this.missingData = false;
            this.items = items;
            this.totalAmount = totalAmount;

            const config = this.getChartConfig();
            this.chartRef = new Chart(this.canvas.nativeElement, config);
        } else {
            this.missingData = true;
        }

        this.cdr.markForCheck();
    }

    private getChartConfig() {
        return {
            type: 'pie',
            data: {
                labels: this.items.map(i => i.label),
                datasets: [{
                    data: this.items.map(i => i.sum),
                    backgroundColor: this.colors,
                    label: '',
                    borderColor: 'white',
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,

                legend: { display: false },
                layout: { padding: 20 },
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
                            const item = this.items[context.dataIndex];
                            if (item && this.totalAmount) {
                                const percent = (item.sum * 100) / this.totalAmount;
                                return Math.round(percent) + '%';
                            }
                        }
                    }
                }
            }
        };
    }
}
