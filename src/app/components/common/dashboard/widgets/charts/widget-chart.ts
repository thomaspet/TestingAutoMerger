import {Component, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild, ElementRef, Input} from '@angular/core';

import * as Chart from 'chart.js';

@Component({
    selector: 'widget-chart',
    template: '<canvas #canvas></canvas>',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class WidgetChart {
    @ViewChild('canvas', {static: true}) private canvas: ElementRef<HTMLCanvasElement>;
    @Input() chartConfig;

    chartRef: Chart;

    ngOnChanges(changes) {
        if (changes['chartConfig'] && this.chartConfig) {
            this.chartRef?.destroy();
            this.chartRef = new Chart(this.canvas.nativeElement, this.chartConfig);
        }
    }

    ngOnDestroy() {
        this.chartRef?.destroy();
    }
}
