import {Component, ChangeDetectionStrategy, ViewChild, ElementRef, Input, ChangeDetectorRef} from '@angular/core';

import * as Chart from 'chart.js';

@Component({
    selector: 'widget-pie-chart',
    styleUrls: ['./widget-pie-chart.sass'],
    template: `
        <section class="canvas-wrapper">
            <canvas #canvas></canvas>
            <section class="chart-tooltip" *ngIf="tooltip" [ngStyle]="tooltip.position">
                {{tooltip.label}}: {{tooltip.value | uninumberformat:'money'}}
            </section>
        </section>

        <section *ngIf="legendItems?.length" class="pie-chart-legend">
            <section *ngFor="let item of legendItems; let idx = index" (click)="onLegendClick(item)" class="legend-item">
                <section class="legend-dot" [style.background]="item.color"></section>
                <section class="legend-label" [class.item-hidden]="item.hidden" [matTooltip]="item.label?.length >= 20 ? item.label : undefined">
                    {{item.label}}
                </section>
            </section>
        </section>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class WidgetPieChart {
    @ViewChild('canvas', {static: true}) private canvas: ElementRef<HTMLCanvasElement>;
    @Input() chartConfig;

    chartRef: Chart;

    legendItems: { label: string; color: string; hidden: boolean }[];
    tooltip: { label: string; value: number; position; };

    constructor(private cdr: ChangeDetectorRef) {}

    ngOnChanges(changes) {
        if (changes['chartConfig'] && this.chartConfig) {
            this.chartRef?.destroy();

            this.overrideLegend();
            this.overrideTooltip();

            this.chartRef = new Chart(this.canvas.nativeElement, this.chartConfig);
        }
    }

    ngOnDestroy() {
        this.chartRef?.destroy();
    }

    onLegendClick(legendItem) {
        const index = this.legendItems.findIndex(item => item === legendItem);
        if (index >= 0) {
            legendItem.hidden = !legendItem.hidden;
            this.chartRef.getDatasetMeta(0).data[index].hidden = legendItem.hidden;
            this.chartRef.update();

        }
    }

    private overrideLegend() {
        try {
            const legendVisible = this.chartConfig.options?.legend?.display !== false;
            if (legendVisible) {
                const labels = this.chartConfig.data.labels;
                const colors = this.chartConfig.data.datasets[0].backgroundColor;

                this.legendItems = labels.map((label: string, index) => {
                    return {
                        label,
                        color: colors[index]
                    };
                });

                this.chartConfig.options.legend = { display: false };
            }
        } catch (e) {
            console.error(e);
        }
    }

    private overrideTooltip() {
        try {
            this.chartConfig.options.tooltips = {
                enabled: false,
                mode: 'index',
                position: 'nearest',
                custom: tooltip => {
                    if (tooltip.dataPoints && tooltip.dataPoints.length) {
                        const labels = this.chartConfig.data.labels;
                        const data = this.chartConfig.data.datasets[0].data;
                        const index = tooltip.dataPoints[0].index;

                        this.tooltip = {
                            label: labels[index],
                            value: data[index],
                            position: {
                                top: tooltip.y + 'px',
                                left: tooltip.x + 'px',
                            }
                        };
                    } else {
                        this.tooltip = undefined;
                    }

                    this.cdr.markForCheck();
                }
            };
        } catch (e) {
            console.error(e);
        }
    }
}
