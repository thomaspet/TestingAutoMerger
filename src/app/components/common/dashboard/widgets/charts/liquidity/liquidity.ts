import {Component, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import {of} from 'rxjs';
import {catchError} from 'rxjs/operators';

import {LiquidityTableDTO, DetailsDTO} from '@uni-entities';
import {DashboardDataService} from '../../../dashboard-data.service';
import {UniModalService} from '@uni-framework/uni-modal';
import {CustomPaymentModal} from '@app/components/widgets/widgets/liquidity-widget/custom-payment-modal';
import {COLORS} from '../../../colors';
import {LiquidityPaymentModal} from './payment-modal/liquidity-payment-modal';

@Component({
    selector: 'liquidity-widget',
    templateUrl: './liquidity.html',
    styleUrls: ['./liquidity.sass'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LiquidityWidget {
    viewMode: 'table' | 'chart' = 'table';

    loading = true;
    hasData = false;

    chartConfig;

    bankBalanceText: string;
    bankBalance: number;

    periodData: DetailsDTO[];

    constructor(
        private cdr: ChangeDetectorRef,
        private modalService: UniModalService,
        private dataService: DashboardDataService
    ) {}

    ngOnInit() {
        this.loadDataAndInitChart();
    }

    loadDataAndInitChart(ignoreCache?: boolean) {
        const endpoint = '/api/biz/liquiditypayment?action=getLiquidityTableData';

        this.dataService.get(endpoint, ignoreCache).pipe(
            catchError(err => {
                console.error(err);
                return of(null);
            })
        ).subscribe((data: LiquidityTableDTO) => {
            this.hasData = !!data;

            if (this.hasData) {
                if (data.BankBalanceRefferance === 0) {
                    this.bankBalanceText = 'Kunne ikke hente banksaldo';
                } else if (data.BankBalanceRefferance === 1) {
                    this.bankBalanceText = 'Saldo hentet fra bankkonto: ';
                    this.bankBalance = data.BankBalance;
                } else {
                    this.bankBalanceText = 'Saldo hentet fra hovedbokskonto: ';
                    this.bankBalance = data.BankBalance;
                }

                this.periodData = data.Period || [];
                this.chartConfig = this.getChartConfig();
            }

            this.loading = false;
            this.cdr.markForCheck();
        });
    }

    addCustomPayment() {
        this.modalService.open(LiquidityPaymentModal).onClose.subscribe(changes => {
            if (changes) {
                this.loadDataAndInitChart(true);
            }
        });

        // this.modalService.open(CustomPaymentModal, {
        //     data: { isNew: isNew }
        // }).onClose.subscribe(res => {
        //     if (res) {
        //         this.loadDataAndInitChart(true);
        //     }
        // });
    }

    private getChartConfig() {
        return {
            type: 'line',
            data: {
                labels: ['I dag', '7 dager', '14 dager', '30 dager'],
                datasets: [{
                    label: 'Resultat',
                    data: this.periodData.map(item => item.Liquidity || 0),
                    backgroundColor: COLORS.primary,
                    borderColor: COLORS.primary,
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
