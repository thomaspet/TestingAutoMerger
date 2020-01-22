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
import * as doughnutlabel from 'chartjs-plugin-doughnutlabel';
import {theme} from 'src/themes/theme';

@Component({
    selector: 'overdue-invoices-widget',
    templateUrl: './overdue-invoices.html',
    styleUrls: ['./overdue-invoices.sass'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class OverdueInvoicesWidget implements AfterViewInit {
    @ViewChild('chartCanvas') canvas: ElementRef;

    widget: IUniWidget;
    dataLoaded: EventEmitter<boolean> = new EventEmitter();

    chartRef;
    chartConfig;
    totalAmount: number = 0;
    missingData: boolean;
    dataHolder: number[] = [];
    tableData = [];
    hasLoadedData: boolean = false;
    show = [true, true, true, true];
    colors = theme.widgets.due_date_colors;
    chartLegends = ['Ikke forfalt', '1-30 dager', '31-60 dager', 'Over 60 dager'];

    constructor(
        private statisticsService: StatisticsService,
        private numberFormatService: NumberFormat,
        private router: Router,
        private cdr: ChangeDetectorRef
    ) {}

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
        Observable.forkJoin(
            this.statisticsService.GetAllUnwrapped(`model=CustomerInvoice&select=${this.getCustomerSumQuery()}`),
            this.statisticsService.GetAllUnwrapped(this.getCustomersThatNeedAttention())
        ).subscribe(
            response => {
                this.formatChartData(response[0]);
                this.tableData = response[1].map((customer) => {
                    const sinceDueDate = moment().diff(moment(customer.PaymentDueDate), 'days');
                    if (sinceDueDate <= 30) {
                        customer.color = this.colors[1];
                    } else if (sinceDueDate >= 31 && sinceDueDate <= 60) {
                        customer.color = this.colors[2];
                    } else {
                        customer.color = this.colors[3];
                    }

                    return customer;
                });
                this.hasLoadedData = true;
            },
            err => {
                this.hasLoadedData = true;
                if (err && err.status === 403) {
                    this.missingData = true;
                    this.cdr.markForCheck();
                }
            }
        );
    }

    addhiddenClass(id: string, index) {
        this.show[index] = !this.show[index];

        const element = document.getElementById(id);

        if (this.show[index]) {
            element.classList.remove('line-through');
        } else {
            element.classList.add('line-through');
        }
        this.reDrawAfterLegendClick();
    }

    reDrawAfterLegendClick() {
        this.chartRef.config.data.labels = this.chartLegends.map((l, i) =>  {
            if (this.show[i]) {
                return l;
            }
        });

        this.chartRef.config.data.datasets[0].backgroundColor = this.colors.map((l, i) => {
            if (this.show[i]) {
                return l;
            }
        });

        this.totalAmount = 0;
        this.chartRef.config.data.datasets[0].data = this.dataHolder.map((l, i) =>  {
            if (this.show[i]) {
                this.totalAmount += l;
                return l;
            }
        });

        this.chartRef.config.options.plugins.doughnutlabel.labels = this.getUnpaidDoughnutLabels();

        this.chartRef.update();
    }

    formatChartData(result) {
        this.totalAmount = 0;
        this.dataHolder = [];
        for (const key in result[0]) {
            if (key) {
                this.dataHolder.push(result[0][key]);
                this.totalAmount += result[0][key];
            }
        }

        if (this.dataHolder.some(sum => !!sum)) {
            this.missingData = false;
            this.chartConfig = this.getEmptyResultChart();
            this.chartConfig.data.labels = this.chartLegends.slice();
            this.chartConfig.options.plugins.doughnutlabel.labels = this.getUnpaidDoughnutLabels();

            this.chartConfig.data.datasets[0].data = this.dataHolder;
            this.chartConfig.data.datasets[0].backgroundColor = this.colors;
            this.drawChart();
        } else {
            this.missingData = true;
            this.cdr.markForCheck();
        }
    }

    // public sendReminder(invoice: any) {
    //     this.reminderService.createInvoiceRemindersForInvoicelist([invoice.ID]).subscribe((run) => {
    //         this.onClickNavigate('/sales/reminders/reminded?runNumber=', run && run[0] && run[0].ID);
    //     }, err => {
    //         console.error('Kunne ikke opprette purring');
    //     });
    // }

    public getCustomerSumQuery() {
        // Ikke forfalt
        return `sum(casewhen(PaymentDueDate gt '${moment().format('YYYYMMDD')}' and `
        + `RestAmount gt 0 and StatusCode ne 30107 and StatusCode ne 42001 and StatusCode ne 30101\,RestAmount\,0) ) as sum,`
        // 0 - 30 dager
        + `sum(casewhen(PaymentDueDate ge '${moment().subtract(30, 'd').format('YYYYMMDD')}' and `
        + `PaymentDueDate le '${moment().format('YYYYMMDD')}' and RestAmount gt 0 and `
        + `StatusCode ne 30107 and StatusCode ne 42001 and StatusCode ne 30101\,RestAmount\,0) ) as sum1,`
        // 30 - 60 dager
        + `sum(casewhen(PaymentDueDate ge '${moment().subtract(60, 'd').format('YYYYMMDD')}' and `
        + `PaymentDueDate le '${moment().subtract(31, 'd').format('YYYYMMDD')}' and `
        + `RestAmount gt 0 and StatusCode ne 30107 and StatusCode ne 42001 and StatusCode ne 30101\,RestAmount\,0) ) as sum2,`
        // Over 60 dager
        + `sum(casewhen(PaymentDueDate lt '${moment().subtract(61, 'd').format('YYYYMMDD')}' and `
        + `RestAmount gt 0 and StatusCode ne 30107 and StatusCode ne 42001 and StatusCode ne 30101\,RestAmount\,0) ) as sum3`;
    }

    public getCustomersThatNeedAttention() {
        return `model=CustomerInvoice&select=ID as ID,PaymentDueDate as PaymentDueDate,` +
        `CustomerName as CustomerName,InvoiceNumber as InvoiceNumber,` +
        `Customer.ID as CustomerID,Customer.CustomerNumber as CustomerNumber,RestAmount as RestAmount,StatusCode as StatusCode` +
        `&filter=PaymentDueDate le ${moment().format('YYYYMMDD')} and RestAmount gt 0 and ` +
        `StatusCode ne 42001 and (Reminder.DueDate lt ${moment().format('YYYYMMDD')} or isnull(Reminder.ID, 0) eq 0 )` +
        `&top=3&join=CustomerInvoice.ID eq CustomerInvoiceReminder.CustomerInvoiceID as Reminder&expand=Customer&orderby=PaymentDueDate`;
    }

    onClickNavigate(route: string, ID: number) {
        this.router.navigateByUrl(route + ID);
    }

    goToOverdueList() {
        this.router.navigateByUrl('/sales/invoices?filter=overdue_invoices')
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
            type: 'pie',
            plugins: [doughnutlabel],
            data: {
                datasets: [{
                    data: [],
                    backgroundColor: [],
                    label: '',
                    borderColor: 'white'
                }],
                labels: []
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutoutPercentage: 70,
                animation: {
                    scale: true,
                    rotate: true,
                    steps: 50,
                    easing: 'easeOutBounce'
                },
                legend: { display: false },
                tooltips: {
                    callbacks: {
                        label: (tooltipItem, array) => {
                            return array.labels[tooltipItem.index] + ': '
                            + this.numberFormatService.asMoney(array.datasets[tooltipItem.datasetIndex].data[tooltipItem.index]);
                        }
                    }
                },
                plugins: {
                    doughnutlabel: {
                        labels: []
                    }
                },
                elements: {
                    arc: {
                        borderWidth: 5
                    }
                }
            }
        };
    }

    private getUnpaidDoughnutLabels() {
        return [
            {
                text: 'Sum',
                color: '#2b2b2b',
                font: { size: '16' }
            },
            {
                text: this.numberFormatService.asMoney(this.totalAmount),
                color: '#2b2b2b',
                font: { size: '17', weight: '500' }
            }
        ];
    }
}
