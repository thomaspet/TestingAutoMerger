import { Component, ViewChild, ElementRef } from '@angular/core';
import { IUniWidget } from '../uniWidget';
import { WidgetDatasetBuilder, ChartColorEnum } from '../widgetDatasetBuilder';
import { WidgetDataService } from '../widgetDataService';
import { Observable } from 'rxjs/Observable';
import * as Chart from 'chart.js';

@Component({
    selector: 'uni-chart',
    template: `
        <figure style="margin: 0; color: white; text-align: center; background-color: #fff; max-height: 100%; height: 100%;">
            <div class="uni-dashboard-chart-header"> {{ widget.config.header }}</div>
            <div style="padding: 20px;">
                <canvas #chartElement> </canvas>
            </div>
        </figure>`
})

export class UniChartWidget {
    @ViewChild('chartElement')
    private chartElement: ElementRef;

    private builder: WidgetDatasetBuilder = new WidgetDatasetBuilder();
    public widget: IUniWidget;
    private myChart: any;

    private labels: string[];
    private datasets: any[] = [];

    constructor(private widgetDataService: WidgetDataService) {}

    public ngAfterViewInit() {
        if (this.widget) {
            this.loadChartWidget();
        }
    }

    public ngOnChanges() {
        if (this.chartElement && this.widget) {
            this.drawChart();
        }
    }

    private loadChartWidget() {
        // Destroy the old chart before replacing it with new to avoid conflicts in canvas..
        if (this.myChart) {
            this.myChart.destroy();
        }

        let obs = [];
        this.widget.config.dataEndpoint.forEach((endpoint) => {
            obs.push(this.widgetDataService.getData(endpoint));
        });

        Observable.forkJoin(obs).subscribe(
            (data: any) => {
                // Failcheck in case http call fails.. needed???
                if (data[0].Success) {
                    data.forEach((item: any, i) => {
                        if (this.widget.config.labels.length < 1) {
                            const builderResult = this.builder.buildWithDynamicLabels(
                                item.Data,
                                this.widget.config.dataKey,
                                this.widget.config.useIf,
                                this.widget.config.maxNumberOfLabels
                            );

                            this.datasets.push(builderResult.dataset);
                            this.labels = builderResult.labels;

                        } else {
                            this.datasets.push(this.builder.buildSingleColorDataset(
                                item.Data,
                                ChartColorEnum.White,
                                this.widget.config.colors[i],
                                this.widget.config.title[i],
                                this.widget.config.dataKey[i],
                                this.widget.config.chartType,
                                this.widget.config.multiplyValue || 1
                            ));

                            this.labels = this.widget.config.labels;
                        }
                    });
                }
                this.drawChart();
            },
                err => console.log(err)
            );
    }

    private drawChart() {
        let myElement = this.chartElement.nativeElement;

        // 64px is 2 * 20px padding in parent + 24px in the header.. Canvas hack! Jørgen Lom fix it..
        myElement.style.height = ((100 * this.widget.height + (this.widget.height - 1) * 20) - 64) + 'px';
        myElement.style.maxHeight = ((100 * this.widget.height + (this.widget.height - 1) * 20) - 64) + 'px';

        // Draws new chart to the canvas
        this.myChart = new Chart(<any>myElement, {
            type: this.widget.config.chartType,
            data: {
                labels: this.labels,
                datasets: this.datasets
            },
            options: this.widget.config.options
        });
    }
}

