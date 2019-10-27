import {
    Component,
    ViewChild,
    ElementRef,
    EventEmitter,
    ChangeDetectorRef
} from '@angular/core';
import {IUniWidget} from '../uniWidget';
import {WidgetDataService} from '../widgetDataService';
import * as Chart from 'chart.js';

@Component({
    selector: 'uni-pie-chart',
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
export class UniPieChartWidget {
    @ViewChild('chartElement') chartElement: ElementRef;

    colors = [ '#005AA4', '#0071CD', '#008ED2', '#7FC6E8', '#A1DFFF', '#CEEEFF', '#DFF1F9' ];

    public widget: IUniWidget;
    private myChart: any;

    private labels: string[];
    private datasets: any[] = [];
    dataLoaded = new EventEmitter<boolean>();
    unauthorized = false;

    constructor(
        private widgetDataService: WidgetDataService,
        private cdr: ChangeDetectorRef
    ) {}

    public ngAfterViewInit() {
        if (this.widget) {
            this.loadPieWidget();
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
            || (!this.widget.permissions || this.widget.permissions.length === 0)
        ) {
            this.widgetDataService.getData(this.widget.config.dataEndpoint).subscribe(
                res => {
                    if (!res.Success) { return; }

                    const builderResult = this.buildPieDataset(res.Data, this.widget.config);
                    this.labels = builderResult.labels;
                    this.datasets = builderResult.dataset;
                    this.drawChart();
                },
                () => {
                    this.dataLoaded.emit(true);
                }
            );
        } else {
            this.dataLoaded.next(true);
            this.unauthorized = true;
            this.cdr.markForCheck();
        }
    }

    private drawChart() {
        this.myChart = new Chart(<any> this.chartElement.nativeElement, {
            type: 'pie',
            data: {
                labels: this.labels,
                datasets: this.datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: { animateScale: true },
                legend: {
                    position: 'left',
                    labels: { usePointStyle: true }
                }
            },
        });

        this.dataLoaded.emit(true);
    }

    private buildPieDataset(data: any[], config) {
        const labels = [];
        const dataset = [];

        let rest = [];

        let sorted = data.sort((a, b) => {
            return (a[config.valueKey] <= b[config.valueKey]) ? 1 : -1;
        });

        sorted = sorted.filter(x => x[config.valueKey] > 0);

        if (sorted.length > config.maxNumberOfLabels) {
            rest = sorted.splice(config.maxNumberOfLabels - 1);
        }

        sorted.forEach((item) => {
            labels.push((item[config.labelKey] || '').slice(0, 20));
            dataset.push(item[config.valueKey]);
        });

        if (rest.length) {
            labels.push('Resterende');
            dataset.push(rest.reduce((sum, item) => {
                return sum + item[config.valueKey];
            }, 0));
        }

        return {
            dataset: [{
                data: dataset,
                backgroundColor: this.colors.slice(0, data.length),
                label: '',
            }],
            labels: labels
        };
    }
}

