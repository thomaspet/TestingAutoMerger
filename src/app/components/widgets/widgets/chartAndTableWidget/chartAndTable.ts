import {
    Component,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    AfterViewInit,
    ViewChild,
    ElementRef,
    EventEmitter
} from '@angular/core';
import {StatisticsService, NumberFormat, CustomerInvoiceReminderService} from '@app/services/services';
import {IUniWidget} from '../../uniWidget';
import {Router} from '@angular/router';
import * as Chart from 'chart.js';
import * as moment from 'moment';
import { Observable } from 'rxjs';
import * as doughnutlabel from 'chartjs-plugin-doughnutlabel';

interface IPeriode {
    label: string;
    numberOfElements: number;
    timeSpan: 'month' | 'w' | 'd';
    index: number;
}

@Component({
    selector: 'chart-and-table-widget',
    templateUrl: './chartAndTable.html',
    styleUrls: ['./chartAndTable.sass'],
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class ChartAndTableWidget implements AfterViewInit {
    @ViewChild('chartCanvas') private canvas: ElementRef;

    widget: IUniWidget;
    dataLoaded: EventEmitter<boolean> = new EventEmitter();

    isCustomer: boolean = true;
    chartRef: any;
    chartConfig: any;
    totalAmount: number = 0;
    missingData: boolean;
    dataHolder: number[] = [];
    tableData: any[] = [];
    headers: string[] = ['Kunde', 'Fakturanr', 'Utestående', 'Forfalt dato'];
    accountTableLeaders: string[] = ['Startsaldo', 'Penger inn', 'Penger ut', 'Sluttsaldo'];
    show = [true, true, true, true];

    accounts: IPeriode[] = [
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

    currentAccount = this.accounts[0];

    constructor(
        private statisticsService: StatisticsService,
        private numberFormatService: NumberFormat,
        private reminderService: CustomerInvoiceReminderService,
        private router: Router,
        private cdr: ChangeDetectorRef
    ) { }

    ngAfterViewInit() {
        if (this.widget) {
            this.isCustomer = this.widget.config.model === 'CustomerInvoice';
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
        const queries: any[] = [];

        if (this.isCustomer) {
            queries.push(this.statisticsService.GetAllUnwrapped(`model=CustomerInvoice&select=${this.getCustomerSumQuery()}`));
            queries.push(this.statisticsService.GetAllUnwrapped(this.getCustomersThatNeedAttention()));
        } else {
            // ACCOUNT QUERY - IDONNO
            this.headers = [
                moment().format('MMM'),
                moment().add('M', 1).format('MMM'),
                moment().add('M', 2).format('MMM'),
                moment().add('M', 4).format('MMM')
            ];
        }

        Observable.forkJoin(queries).subscribe((response) => {
            this.formatChartData(response[0]);
            if (this.isCustomer) {
                this.tableData = response[1].map((customer) => {
                    customer.value1 = customer.CustomerName;
                    customer.value2 = customer.InvoiceNumber;
                    customer.value3 = this.numberFormatService.asMoney(customer.RestAmount);
                    customer.value4 = moment(customer.PaymentDueDate).format('DD.MM.YY');
                    customer.color = this.getCustomerDueColor(customer.PaymentDueDate);
                    return customer;
                });
            }
        }, err => {
            if (err && err.status === 403) {
                this.missingData = true;
                this.cdr.markForCheck();
            }
        });
    }

    addhiddenClass(id: string, index) {
        this.show[index] = !this.show[index];

        const element = document.getElementById(id);

        if (this.show[index]) {
            element.classList.remove('hidden-class');
        } else {
            element.classList.add('hidden-class');
        }
        this.reDrawAfterLegendClick();
    }

    reDrawAfterLegendClick() {
        this.chartRef.config.data.labels = this.widget.config.labels.map((l, i) =>  {
            if (this.show[i]) {
                return l;
            }
        });
        this.chartRef.config.options.plugins.doughnutlabel.labels = this.getUnpaidDoughnutLabels();

        this.chartRef.config.data.datasets[0].backgroundColor = this.widget.config.colors.map((l, i) => {
            if (this.show[i]) {
                return l;
            }
        });
        this.chartRef.config.data.datasets[0].data = this.dataHolder.map((l, i) =>  {
            if (this.show[i]) {
                return l;
            }
        });

        this.chartRef.update();
    }

    getCustomerDueColor(date) {
        const sinceDueDate = moment().diff(moment(date), 'days');

        if (sinceDueDate <= 30) {
            return this.widget.config.colors[1];
        } else if (sinceDueDate >= 31 && sinceDueDate <= 60) {
            return this.widget.config.colors[2];
        } else {
            return this.widget.config.colors[3];
        }
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
            this.chartConfig.data.labels = this.widget.config.labels.slice();
            this.chartConfig.options.plugins.doughnutlabel.labels = this.getUnpaidDoughnutLabels();

            this.chartConfig.data.datasets[0].data = this.dataHolder;
            this.chartConfig.data.datasets[0].backgroundColor = this.widget.config.colors;
            this.drawChart();
        } else {
            this.missingData = true;
        }
    }

    public sendReminder(invoice: any) {
        this.reminderService.createInvoiceRemindersForInvoicelist([invoice.ID]).subscribe((run) => {
            this.onClickNavigate('/sales/reminders/reminded?runNumber=', run && run[0] && run[0].ID);
        }, err => {
            console.error('Kunne ikke opprette purring');
        });
    }

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

    toggleButtonClick() {
        if (this.isCustomer) {
            this.router.navigateByUrl('/sales/invoices?filter=overdue_invoices');
        }
    }

    onClickNavigate(route: string, ID: number) {
        this.router.navigateByUrl(route + ID);
    }

    private drawChart() {
        if (this.chartRef) {
            this.chartRef.destroy();
        }
        this.chartRef = new Chart(<any> this.canvas.nativeElement, this.chartConfig);
        this.cdr.markForCheck();
        this.dataLoaded.emit(true);
    }

    getHeaders() {
        if (this.isCustomer) {
            return ['Kunde', 'Kundenr', 'Utestående', 'Forfalt dato'];
        }
    }

    getKeys() {
        if (this.isCustomer) {
            return ['CustomerName', 'CustomerNumber', 'RestAmount', 'PaymentDueDate'];
        }
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
                legend: {
                    display: false,
                    position: 'left',
                    reverse: true,
                    labels: {
                        usePointStyle: true
                    }
                },
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
                font: { size: '16', weight: 'bold' }
            },
            {
                text: this.numberFormatService.asMoney(this.totalAmount),
                font: { size: '16', weight: 'bold' }
            }
        ];
    }
}
