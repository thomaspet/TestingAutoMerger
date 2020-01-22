import {Component, ViewChild, ElementRef, ChangeDetectorRef} from '@angular/core';
import {CustomPaymentModal} from './custom-payment-modal';
import {UniModalService} from '@uni-framework/uni-modal';
import {WidgetDataService} from '../../widgetDataService';
import {NumberFormat, ReportDefinitionService} from '@app/services/services';
import {Router} from '@angular/router';
import * as Chart from 'chart.js';

@Component({
    selector: 'liquidity-widget',
    templateUrl: './liquidity-widget.html',
    styleUrls: ['./liquidity-widget.sass']
})

export class LiquidityWidget {
    @ViewChild('liquidity') liquidityChart: ElementRef;

    mode: string = 'table';
    data: any = [];
    chartData: any[];
    chartRef: Chart;
    chartConfig: any;
    bankBalance: string = '';
    bankBalanceString: string = '';
    sumOverdueInvoices: string = '';
    sumSupplierInvoices: string = '';

    constructor (
        private router: Router,
        private cdr: ChangeDetectorRef,
        private numberFormat: NumberFormat,
        private modalService: UniModalService,
        private widgetDataService: WidgetDataService
    ) {
        this.mode = JSON.parse(localStorage.getItem('LIQUIDITY_MODE')) || 'table';
        this.getDataAndDisplayTableOrChart();
    }

    getDataAndDisplayTableOrChart() {
        this.widgetDataService.clearCache();
        this.widgetDataService.getData('/api/biz/liquiditypayment?action=getLiquidityTableData').subscribe(response => {
            if (response) {
                this.sumOverdueInvoices = this.numberFormat.asMoney(response.OverdueCustomerInvoices);
                this.sumSupplierInvoices = this.numberFormat.asMoney(response.OverdueSupplierInvoices);

                if (response.BankBalanceRefferance === 0) {
                    this.bankBalanceString = 'Kunne ikke hente banksaldo';
                } else if (response.BankBalanceRefferance === 1) {
                    this.bankBalanceString = 'Saldo hentet fra bankkonto: ';
                    this.bankBalance = this.numberFormat.asMoney(response.BankBalance);
                } else {
                    this.bankBalanceString = 'Saldo hentet fra hovedbokskonto: ';
                    this.bankBalance = this.numberFormat.asMoney(response.BankBalance);
                }

                this.data = response.Period;
                this.chartConfig = this.getEmptyLineChartConfig();
                this.chartConfig.data.datasets[0].data = this.data.map(res => res.Liquidity || 0);
                this.changeMode(this.mode);
                this.cdr.markForCheck();
            }
        });
    }

    goToOverdueInvoiceList() {
        this.router.navigateByUrl('/sales/invoices?expanded=ticker&selected=null&filter=overdue_invoices');
    }

    goToSupplierInvoices() {
        this.router.navigateByUrl('/accounting/bills?filter=unpaid');
    }

    addCustomerPayment(isNew: boolean = true) {
        this.modalService.open(CustomPaymentModal, { data: { isNew: isNew } }).onClose.subscribe((response) => {
            if (response) {
                this.getDataAndDisplayTableOrChart();
            }
        });
    }

    changeMode(mode: string) {
        this.mode = mode;
        if (this.mode === 'graph') {
            setTimeout(() => {
                this.drawChart();
            });
        }
    }

    drawChart() {
        if (this.chartRef) {
            this.chartRef.destroy();
        }
        this.chartRef = new Chart(<any> this.liquidityChart.nativeElement, this.chartConfig);
    }

    getEmptyLineChartConfig() {
        return {
            type: 'line',
            data: {
                labels: ['I dag', '7 dager', '14 dager', '30 dager'],
                datasets: [{
                    label: 'Resultat',
                    data: [],
                    backgroundColor: '#0071CD',
                    borderColor: '#0071CD',
                    borderWidth: 4,
                    fill: false,
                    options: {
                        fill: false
                    },
                    pointBorderColor: 'transparent',
                    pointBackgroundColor: 'transparent',
                    lineTension: 0,
                }
            ]},
            options: {
                legend: { display: false },
                scaleShowVerticalLines: false,
                scales: {
                    yAxes: [
                        {
                            gridLines: {
                                // color: 'rgba(0, 0, 0, 0.1)'
                                zeroLineColor: 'rgba(201, 102, 102, 0.8)'
                            },
                            ticks: {
                                maxTicksLimit: 6,
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
                        },
                        {
                            // This axes is just to get a border on the right side of the chart
                            position: 'right',
                            ticks: {
                                display: false
                            },
                            gridLines: {
                                display: false,
                                drawTicks: false
                            }
                        }
                    ],
                    xAxes: [{
                        gridLines: {
                            display: false
                        }
                    }]
                }
            }
        };
    }
}
