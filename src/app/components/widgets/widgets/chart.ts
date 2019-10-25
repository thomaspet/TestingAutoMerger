import {
    Component,
    ViewChild,
    ElementRef,
    EventEmitter,
    ChangeDetectorRef
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
        <section class="widget-wrapper">
            <section class="header">
                {{widget.description}}
            </section>

            <section class="content" [attr.aria-busy]="!(dataLoaded | async)">
                <section *ngIf="unauthorized" class="missing-access">Mangler tilgang</section>
                <canvas style="max-height: 220px" #chartElement></canvas>
            </section>
        </section>
    `
})
export class UniChartWidget {
    @ViewChild('chartElement')
    private chartElement: ElementRef;

    private builder: WidgetDatasetBuilder = new WidgetDatasetBuilder();
    public widget: IUniWidget;
    private myChart: any;

    private labels: string[];
    private datasets: any[] = [];
    dataLoaded: EventEmitter<boolean> = new EventEmitter();
    unauthorized: boolean = false;


    constructor(private widgetDataService: WidgetDataService, private cdr: ChangeDetectorRef) {}

    public ngAfterViewInit() {
        if (this.widget) {
            if (this.widget.config.chartType === 'pie') {
                this.loadPieWidget();
            } else {
                this.loadChartWidget();
            }
        }
    }

    ngOnDestroy() {
        this.dataLoaded.complete();
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

        if (this.widget && this.widget.permissions && this.widget.permissions[0]
            && this.widgetDataService.hasAccess(this.widget.permissions[0])
            || (!this.widget.permissions || this.widget.permissions.length === 0)) {
                this.widgetDataService.getData(this.widget.config.dataEndpoint[0]).subscribe(
                    res => {
                        if (!res.Success) { return; }

                        const builderResult = this.builder.buildPieDataset(res.Data, this.widget.config);
                        this.labels = builderResult.labels.map(l => l.substr(0, 20));
                        this.datasets = builderResult.dataset;
                        this.drawChart();
                    },
                    err => {
                        this.dataLoaded.emit(true);
                    }
                );
            } else {
                this.dataLoaded.next(true);
                this.unauthorized = true;
                this.cdr.markForCheck();
            }
    }

    private loadChartWidget() {
        // Destroy the old chart before replacing it with new to avoid conflicts in canvas..
        if (this.myChart) {
            this.myChart.destroy();
        }

        if (this.widget && this.widget.permissions && this.widget.permissions[0]
            && this.widgetDataService.hasAccess(this.widget.permissions[0])
            || (!this.widget.permissions || this.widget.permissions.length === 0)) {
                const sources = [];
                this.widget.config.dataEndpoint.forEach((endpoint) => {
                    sources.push(this.widgetDataService.getData(endpoint));
                });

                Observable.forkJoin(sources).subscribe(res => {
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
                err => this.dataLoaded.emit(true));
            } else {
                this.dataLoaded.next(true);
                this.unauthorized = true;
                this.cdr.markForCheck();
            }
    }

    private drawChart() {
        const options = this.widget.config.options || {};
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

