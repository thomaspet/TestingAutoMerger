import { Component, ViewChild, ElementRef } from '@angular/core';
import { IUniWidget } from '../uniWidget';
import { WidgetDatasetBuilder, ChartColorEnum } from '../widgetDatasetBuilder';
import { WidgetDataService } from '../widgetDataService';
import { Observable } from 'rxjs/Observable';
import * as Chart from 'chart.js';

@Component({
    selector: 'uni-chart',
    template: `
        <figure #chartContainer style="margin: 0; color: white; text-align: center; background-color: #fff; max-height: 100%; height: 100%;">
            <div class="uni-dashboard-chart-header"> {{ widget.config.header }}</div>
            <section style="padding: 20px;">
                <canvas #chartElement> </canvas>
            </section>
        </figure>`
})

export class UniChartWidget {
    @ViewChild('chartElement')
    private chartElement: ElementRef;

    @ViewChild('chartContainer')
    private container: ElementRef;

    private builder: WidgetDatasetBuilder = new WidgetDatasetBuilder();
    public widget: IUniWidget;
    private myChart: any;

    private labels: string[];
    private datasets: any[] = [];

    constructor(
        private widgetDataService: WidgetDataService,
        private el: ElementRef
    ) {
        Observable.fromEvent(window, 'resize')
            .throttleTime(100)
            .subscribe(res => {
                const height = this.container.nativeElement.clientHeight - 64;
                this.chartElement.nativeElement.style.height = height + 'px';
            });
    }


    public ngAfterViewInit() {
        if (this.widget) {
            if (this.widget.config.chartType === 'pie') {
                this.loadPieWidget();
            } else {
                this.loadChartWidget();
            }
        }
    }

    public ngOnChanges() {
        if (this.chartElement && this.widget) {
            this.drawChart();
        }
    }

    private loadPieWidget() {
        if (this.myChart) {
            this.myChart.destroy();
        }

        this.widgetDataService.getData(this.widget.config.dataEndpoint[0]).subscribe(res => {
            if (!res.Success) {
                return;
            }

            const builderResult = this.builder.buildPieDataset(res.Data, this.widget.config);
            this.labels = builderResult.labels;
            this.datasets = builderResult.dataset;
            this.drawChart();
        });
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
            (res: any) => {
                res.forEach((item: any, i) => {
                    if (item.Success) {
                        this.datasets.push(this.builder.buildSingleColorDataset(
                            item.Data,
                            i,
                            this.widget.config
                        ));

                        this.labels = this.widget.config.labels;
                    }
                });

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

