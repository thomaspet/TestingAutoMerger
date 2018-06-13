import {
    Component,
    ViewChild,
    ElementRef,
    EventEmitter
} from '@angular/core';
import {IUniWidget} from '../uniWidget';
import {WidgetDatasetBuilder} from '../widgetDatasetBuilder';
import {WidgetDataService} from '../widgetDataService';
import {Observable} from 'rxjs';
import {FinancialYearService} from '../../../services/services';
import * as Chart from 'chart.js';

@Component({
    selector: 'uni-chart',
    template: `
        <section class="uni-widget-header">
            {{widget.description}}
        </section>

        <section class="uni-widget-content" [attr.aria-busy]="!(dataLoaded | async)">
            <canvas #chartElement></canvas>
        </section>
    `,
})
export class UniChartWidget {
    @ViewChild('chartElement')
    private chartElement: ElementRef;

    private builder: WidgetDatasetBuilder = new WidgetDatasetBuilder();
    public widget: IUniWidget;
    private myChart: any;

    private labels: string[];
    private datasets: any[] = [];
    public dataLoaded: EventEmitter<boolean> = new EventEmitter();

    constructor(
        private widgetDataService: WidgetDataService,
        private el: ElementRef,
        private yearService: FinancialYearService
    ) {}

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

        this.widgetDataService.getData(this.widget.config.dataEndpoint[0]).subscribe(
            res => {
                if (!res.Success) {
                    return;
                }

                const builderResult = this.builder.buildPieDataset(res.Data, this.widget.config);
                this.labels = builderResult.labels;
                this.datasets = builderResult.dataset;
                this.drawChart();
            },
            err => {
                this.dataLoaded.emit(true);
            }
        );
    }

    private loadChartWidget() {
        // Destroy the old chart before replacing it with new to avoid conflicts in canvas..
        if (this.myChart) {
            this.myChart.destroy();
        }

        let sources = [];
        this.widget.config.dataEndpoint.forEach((endpoint) => {
            sources.push(this.widgetDataService.getData(endpoint));
        });

        Observable.forkJoin(sources).subscribe(
            res => {
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
            err => this.dataLoaded.emit(true)
        );
    }

    private drawChart() {
        let options = this.widget.config.options || {};
        options.responsive = true;
        options.maintainAspectRatio = false;

        this.myChart = new Chart(<any> this.chartElement.nativeElement, {
            type: this.widget.config.chartType,
            data: {
                labels: this.labels,
                datasets: this.datasets
            },
            options: options
        });

        this.dataLoaded.emit(true);
    }
}

