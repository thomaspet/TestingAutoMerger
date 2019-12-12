import {
    Component,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    AfterViewInit,
    ViewChild,
    ElementRef,
    EventEmitter
} from '@angular/core';
import {StatisticsService, NumberFormat} from '@app/services/services';
import {IUniWidget} from '../../uniWidget';
import {WidgetDataService} from '../../widgetDataService';
import {Router} from '@angular/router';
import * as Chart from 'chart.js';
import * as moment from 'moment';
import { Observable } from 'rxjs';

interface IPeriode {
    label: string;
    numberOfElements: number;
    timeSpan: 'month' | 'w' | 'd';
    index: number;
}

@Component({
    selector: 'invoiced-widget',
    templateUrl: './invoiced.html',
    styleUrls: ['./invoiced.sass'],
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class InvoicedWidget implements AfterViewInit {
    @ViewChild('chartCanvas') private canvas: ElementRef;

    widget: IUniWidget;
    header: string = 'Fakturert siste 12 mnd';
    dataLoaded: EventEmitter<boolean> = new EventEmitter();
    chartRef: any;
    chartConfig: any;
    unauthorized: boolean = false;

    tooltip;

    MONTHS = [ 'Jan', 'Feb', 'Mar', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Des' ];
    COLORS = ['#E3E3E3', '#0070E0'];

    currentLabels: string[] = [];
    currentLabelsFull: string[] = [];
    periodes: IPeriode[] = [
        {
            label: 'Siste 12 mnd',
            numberOfElements: 12,
            timeSpan: 'month',
            index: 0
        },
        {
            label: 'Siste 10 uker',
            numberOfElements: 10,
            timeSpan: 'w',
            index: 1
        },
        {
            label: 'Siste 10 dager',
            numberOfElements: 10,
            timeSpan: 'd',
            index: 2
        }
    ];
    totalInvoiceInPeriod: string = '';
    totalPaidInPeriod: string = '';

    currentPeriod = this.periodes[0];

    constructor(
        private statisticsService: StatisticsService,
        private numberFormatService: NumberFormat,
        private widgetDataService: WidgetDataService,
        private router: Router,
        private cdr: ChangeDetectorRef
    ) { }

    ngAfterViewInit() {
        if (this.widget) {
            this.getDataAndLoadChart();
        }
    }

    ngOnDestroy() {
        this.dataLoaded.complete();
        if (this.chartRef && this.chartRef.destroy) {
            this.chartRef.destroy();
        }
    }

    private getDataAndLoadChart() {
        if (this.widgetDataService.hasAccess('ui_sales_invoices')) {
            Observable.forkJoin(
                this.statisticsService.GetAllUnwrapped(`model=CustomerInvoice&filter=InvoiceType eq 0&select=${this.generateSelect('TaxInclusiveAmount')}`),
                this.statisticsService.GetAllUnwrapped(`model=CustomerInvoice&filter=InvoiceType eq 0&select=${this.generateSelect('RestAmount')}`)
            ).subscribe(([invoiced, rest]) => {
                this.chartConfig = this.getEmptyResultChart();

                const invoicedDataset = [];
                const paidDataset = [];

                let totalInvoiced = 0;
                let totalPaid = 0;

                for (const key in invoiced[0]) {
                    if (key) {
                        const invoicedAmount = invoiced[0][key] || 0;
                        const restAmount = rest[0][key] || 0;
                        const paidAmount = invoicedAmount - restAmount;

                        totalInvoiced += invoicedAmount;
                        totalPaid += paidAmount;

                        invoicedDataset.push(invoicedAmount);
                        paidDataset.push(paidAmount);
                    }
                }

                this.chartConfig.data.datasets[0].data = paidDataset;
                this.chartConfig.data.datasets[1].data = invoicedDataset;

                this.totalInvoiceInPeriod = this.numberFormatService.asMoney(totalInvoiced);
                this.totalPaidInPeriod = this.numberFormatService.asMoney(totalPaid);

                this.drawChart();
            });
        } else {
            this.unauthorized = true;
            this.cdr.markForCheck();
        }
    }

    public updateData(index: number) {
        if (index !== this.currentPeriod.index) {
            this.currentPeriod = this.periodes[index];
            this.getDataAndLoadChart();
        }
    }

    public generateSelect(sumField) {
        this.currentLabels = [];
        this.currentLabelsFull = [];

        const momentNumber = this.currentPeriod.numberOfElements - 1;

        let selectString = '';
        for (let i = 0; i < this.currentPeriod.numberOfElements; i++) {
            let dateString;
            let dateStringTo;

            if (this.currentPeriod.timeSpan === 'w') {
                this.currentLabels.push('Uke ' + moment().subtract(momentNumber - i, 'w').format('W'));
                this.currentLabelsFull.push(
                    moment().subtract(momentNumber - i, 'w').startOf('w').format('DD.MMM') + ' - '
                    + moment().subtract(momentNumber - i, 'w').endOf('w').format('DD.MMM')
                );
            } else if (this.currentPeriod.timeSpan === 'd') {
                this.currentLabels.push(moment().subtract(momentNumber - i, 'd').format('DD.MMM'));
                this.currentLabelsFull.push(moment().subtract(momentNumber - i, 'd').format('DD MMMM YYYY'));
            } else {
                this.currentLabels.push(this.MONTHS[moment().subtract(11 - i, 'month').month()]);
                let fms = moment().subtract(11 - i, 'month').format('MMMM YYYY');
                fms = fms[0].toUpperCase() + fms.substr(1);
                this.currentLabelsFull.push(fms);
            }

            dateString = moment().subtract(momentNumber - i, this.currentPeriod.timeSpan)
                .startOf(this.currentPeriod.timeSpan).format('YYYYMMDD');
            dateStringTo = moment().subtract(momentNumber - i, this.currentPeriod.timeSpan)
                .endOf(this.currentPeriod.timeSpan).format('YYYYMMDD');

            selectString += `sum(casewhen(InvoiceDate ge '${dateString}' `
                + `and InvoiceDate le '${dateStringTo}' and StatusCode ne '42001' and add(TaxInclusiveAmount, CreditedAmount) ne '0'`
                + `\,${sumField}\,0) ) as sum` + i + (i !== momentNumber ? ',' : '');
        }
        return selectString;
    }

    public onClickNavigate() {
        if (this.widget && !this.widget._editMode) {
            this.router.navigateByUrl(this.widget.config.link);
        }
    }

    private drawChart() {
        if (this.chartRef) {
            this.chartRef.destroy();
        }
        this.chartRef = new Chart(<any> this.canvas.nativeElement, this.chartConfig);
        this.cdr.markForCheck();
        this.dataLoaded.emit(true);
    }

    private getEmptyResultChart() {
        return {
            type: 'bar',
            data: {
                labels: this.currentLabels,
                datasets: [
                    {
                        label: 'Innbetalt',
                        data: [],
                        backgroundColor: this.COLORS[1],
                    },
                    {
                        label: 'Fakturert',
                        data: [],
                        backgroundColor: this.COLORS[0],
                        // hoverBackgroundColor: '#4898F3',
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                legend: { display: false },
                scales: {
                    yAxes: [{
                        ticks: {
                            maxTicksLimit: 8,
                            callback: function(value) {
                                if (value === 0 || (value < 999 && value > -999)) {
                                    return value;
                                } else if (value > -1000000 && value < 1000000) {
                                    return (value / 1000) + 'k';
                                } else if (value <= -1000000 || value >= 1000000) {
                                    return (value / 1000000) + 'm';
                                } else {
                                    return value;
                                }
                            }
                        }
                    }],
                    xAxes: [{
                        stacked: true,
                        gridLines: { display: false },
                    }]
                },
                tooltips: {
                    enabled: false,
                    mode: 'index',
                    position: 'nearest',
                    custom: tooltip => {
                        if (tooltip.dataPoints && tooltip.dataPoints.length) {
                            const data = tooltip.dataPoints;
                            const index = data[0].index;

                            const paid = data[0].yLabel || 0;
                            const invoiced = data[1].yLabel || 0;

                            this.tooltip = {
                                label: this.currentLabelsFull[index],
                                invoiced: invoiced,
                                paid: paid,
                                unpaid: invoiced - paid,
                                style: {
                                    top: tooltip.y + 'px',
                                    left: tooltip.x + 'px',
                                    opacity: '1'
                                }
                            };
                        } else {
                            this.tooltip = undefined;
                        }

                        this.cdr.markForCheck();
                    }
                },
            }
        };
    }
}
