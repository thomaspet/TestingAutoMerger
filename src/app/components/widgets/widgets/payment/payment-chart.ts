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
import {Router} from '@angular/router';
import * as Chart from 'chart.js';
import * as moment from 'moment';
import { Observable } from 'rxjs';
import {WidgetDataService} from '../../widgetDataService';

interface IPeriode {
    label: string;
    numberOfElements: number;
    timeSpan: 'month' | 'w' | 'd';
    index: number;
}

@Component({
    selector: 'payment-chart',
    templateUrl: './payment-chart.html',
    styleUrls: ['./payment-chart.sass'],
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class PaymentWidget implements AfterViewInit {
    @ViewChild('chartCanvas') private canvas: ElementRef;

    widget: IUniWidget;
    header: string = 'Fakturert siste 12 mnd';
    dataLoaded: EventEmitter<boolean> = new EventEmitter();
    chartRef: any;
    chartConfig: any;
    incommingCounter: any;
    outgoingCounter: any;
    unauthorized: boolean = false;

    tooltip;

    MONTHS = [ 'Jan', 'Feb', 'Mar', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Des' ];
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
    totalIncommmingInPeriod: string = '';
    totalOutgoingInPeriod: string = '';

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
        if (this.widgetDataService.hasAccess('ui_bank_payments')) {
            Observable.forkJoin(
                this.statisticsService.GetAllUnwrapped(`model=Payment&filter=StatusCode eq '44004'&select=${this.generateSelect('true')}`),
                this.statisticsService.GetAllUnwrapped(`model=Payment&filter=StatusCode eq '44004' and isPaymentClaim eq 'false' and ` +
                `isPaymentCancellationRequest eq 'false'&select=${this.generateSelect('false')}`)
            ).subscribe(([incomming, outgoing]) => {
                this.chartConfig = this.getEmptyResultChart();

                const incommingDataset = [];
                const outgoingDataset = [];

                let totalIncomming = 0;
                let totalOutgoing = 0;

                for (const key in incomming[0]) {
                    if (key) {
                        if (key.includes('sum')) {
                            totalIncomming += incomming[0][key] || 0;
                            incommingDataset.push(incomming[0][key] || 0);
                        }
                    }
                }
                this.incommingCounter = incomming[0];

                for (const key in outgoing[0]) {
                    if (key) {
                        if (key.includes('sum')) {
                            totalOutgoing += outgoing[0][key] || 0;
                            outgoingDataset.push(outgoing[0][key] || 0);
                        }
                    }
                }

                this.outgoingCounter = outgoing[0];

                this.chartConfig.data.datasets[0].data = incommingDataset;
                this.chartConfig.data.datasets[1].data = outgoingDataset;

                this.totalIncommmingInPeriod = this.numberFormatService.asMoney(totalIncomming);
                this.totalOutgoingInPeriod = this.numberFormatService.asMoney(totalOutgoing);

                this.drawChart();
            });
        } else {
            this.unauthorized = true;
        }
    }

    public updateData(index: number) {
        if (index !== this.currentPeriod.index) {
            this.currentPeriod = this.periodes[index];
            this.getDataAndLoadChart();
        }
    }

    public generateSelect(isCustomerPayment: string = 'false') {
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

            selectString += `sum(casewhen(PaymentDate ge '${dateString}' `
                + `and PaymentDate le '${dateStringTo}' and IsCustomerPayment eq '${isCustomerPayment}',Amount,0)) as sum` + i + ',';

            selectString += `sum(casewhen(PaymentDate ge '${dateString}' `
                + `and PaymentDate le '${dateStringTo}' and IsCustomerPayment eq '${isCustomerPayment}',1,0)) as count`
                + i + (i !== momentNumber ? ',' : '');
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
                        backgroundColor: '#62B2FF'
                    },
                    {
                        label: 'Utbetalt',
                        data: [],
                        backgroundColor: '#FCD292'
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

                            const incomming = data[0].yLabel || 0;
                            const outgoing = data[1].yLabel || 0;

                            this.tooltip = {
                                label: this.currentLabelsFull[index],
                                incomming: incomming,
                                incommingCounter: this.incommingCounter['count' + index],
                                outgoing: outgoing,
                                outgoingCounter: this.outgoingCounter['count' + index],
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
                }
            }
        };
    }
}
