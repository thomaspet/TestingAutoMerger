import { Component, Input, ViewChild, ElementRef } from '@angular/core';
import {IUniWidget} from '../uniWidget';
declare var Chart;

@Component({
    selector: 'uni-chart',
    template: ` <figure style="margin: 0; color: white; text-align: center;">
                    <div class="uni-dashboard-chart-header"> {{ widget.config.header }}</div>
                    <div style="padding: 20px;">
                        <canvas #chartElement> </canvas>
                    </div>
                </figure>`
})

export class UniChartWidget {
    @ViewChild('chartElement')
    private chartElement: ElementRef;

    public widget: IUniWidget;
    private myChart: any;

    constructor() { }

    public ngAfterViewInit() {
        if (this.widget) {
            this.loadChartWidget();
        }
    }

    public ngOnChanges() {
        if (this.chartElement && this.widget) {
            this.loadChartWidget();
        }
    }

    private loadChartWidget() {
        // Destroy the old chart before replacing it with new to avoid conflicts in canvas..
        if (this.myChart) {
            this.myChart.destroy();
        }

        let myElement = this.chartElement.nativeElement;

        // 64px is 2 * 20px padding in parent + 24px in the header.. Canvas hack! Jørgen Lom fix it..
        myElement.style.height = ((100 * 3 + (3 - 1) * 20) - 64) + 'px';
        myElement.style.maxHeight = ((100 * 3 + (3 - 1) * 20) - 64) + 'px';

        // Draws new chart to the canvas
        this.myChart = new Chart(<any>myElement, {
            type: this.widget.config.chartType,
            data: {
                labels: this.widget.config.labels,
                datasets: this.widget.config.dataset
            },
            options: this.widget.config.options
        });
    }

}

