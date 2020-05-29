import {Component, ChangeDetectionStrategy, ViewChild, ElementRef, ChangeDetectorRef} from '@angular/core';
import {Observable} from 'rxjs';
import {BankAccountService, NumberFormat, CompanySettingsService} from '@app/services/services';
import {CompanySettings} from '@uni-entities';
import {IUniWidget} from '../../uniWidget';
import {AuthService} from '@app/authService';

import * as moment from 'moment';
import * as Chart from 'chart.js';
import * as doughnutlabel from 'chartjs-plugin-doughnutlabel';
import {theme} from 'src/themes/theme';

type BankBalanceData = {
    label: string;
    color: string;
    data: any;
    hidden?: boolean;
}[];

@Component({
    selector: 'bank-balance-chart',
    template: `
        <section *ngIf="missingData" class="no-content" style="flex-direction: column; text-align: center; padding: 2rem;">
            <i class="material-icons" style="margin-bottom: 1rem; font-size: 3rem; color: var(--alert-info);"> {{ icon }} </i>
            <span [innerHtml]="msg" style="font-size: 14px"></span>
        </section>

        <section *ngIf="!missingData" class="content cavnas-container">
            <section class="bank-balance-tooltip" *ngIf="tooltip" [ngStyle]="tooltip.style">
                <section class="tooltip-header">{{tooltip.accountName}}</section>
                <section class="data-row">
                    <span>Kontonr</span>
                    <span>{{tooltip.accountNumber}}</span>
                </section>

                <section class="data-row">
                    <span>Balanse</span>
                    <span>{{tooltip.balance | uninumberformat:'money'}}</span>
                </section>

                <section class="data-row">
                    <span>Oppdatert:</span>
                    <span>{{tooltip.date}}</span>
                </section>
            </section>

            <div style="height: calc(100% - 4rem)">
                <canvas style="max-height: 220px" #bankBalance></canvas>
            </div>

            <div class="legend-vertical-class" style="text-align: center;" *ngIf="datasources?.length">
                <section class="legend-row"
                    *ngFor="let datasource of datasources"
                    (click)="toggleDatasource(datasource)"
                    [class.line-through]="datasource.hidden">

                    <span class="indicator cost" [ngStyle]="{ 'background-color': datasource.color }"></span>
                    {{ datasource.label }} - {{ datasource.data.BalanceBooked | uninumberformat: 'money' }}
                </section>
            </div>
        </section>
    `,
    styleUrls: ['./bank-balance-chart.sass'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BankBalanceChart {
    @ViewChild('bankBalance') bankBalance: ElementRef;

    widget: IUniWidget;
    colors = theme.widgets.pie_colors.slice(0, 2);

    chartRef: Chart;
    chartConfig: any;
    totalAmount: number = 0;
    missingData: boolean;

    msg: string = '';
    icon: string = '';
    tooltip: any;

    companySettings: CompanySettings;
    datasources: BankBalanceData;

    constructor(
        private authService: AuthService,
        private companySettingsService: CompanySettingsService,
        private bankAccountService: BankAccountService,
        private numberFormatService: NumberFormat,
        private cdr: ChangeDetectorRef,
    ) {}

    ngAfterViewInit() {
        if (this.authService.activeCompany.IsTest) {
            this.getTestDataAndDrawChart();
        } else {
            this.getDataAndDrawChart();
        }
    }

    ngOnDestroy() {
        if (this.chartRef) {
            this.chartRef.destroy();
        }
    }

    private getDataAndDrawChart() {
        this.companySettingsService.Get(1,
            ['BankAccounts', 'BankAccounts.Account', 'CompanyBankAccount', 'TaxBankAccount']
        ).subscribe(companySettings => {
            this.companySettings = companySettings;

            Observable.forkJoin(
                this.bankAccountService.getBankBalance(this.companySettings.CompanyBankAccountID),
                this.bankAccountService.getBankBalance(this.companySettings.TaxBankAccountID)
            ).subscribe(
                ([company, tax]) => {
                    const data: BankBalanceData = [];

                    if (company) {
                        data.push({
                            label: 'Driftskonto standard',
                            color: this.colors[0],
                            data: company,
                        });
                    }

                    if (tax) {
                        data.push({
                            label: 'Skattetrekkskonto',
                            color: this.colors[1],
                            data: tax,
                        });
                    }

                    this.drawChart(data);
                },
                err => {
                    console.error(err);
                    this.icon = 'money_off';
                    this.msg = 'Vi kunne ikke hente banksaldo. Det kan være problem med tredjepartssystem som henter data for oss.';
                    this.missingData = true;
                    this.cdr.markForCheck();
                }
            );
        });
    }

    private getTestDataAndDrawChart() {
        this.bankAccountService.getBankBalance(1).subscribe(res => {
            this.drawChart([{
                label: 'Testkonto',
                color: this.colors[0],
                data: res,
            }]);
        });
    }

    private drawChart(data: BankBalanceData) {
        this.datasources = data || [];

        if (data.some(item => item.data?.BalanceBooked > 0)) {
            this.missingData = false;
            this.chartConfig = this.getEmptyResultChart();

            this.totalAmount = data.reduce((sum, item) => sum += (item.data?.BalanceBooked || 0), 0);
            this.chartConfig.options.plugins.doughnutlabel.labels = this.getChartLabel();

            this.chartConfig.data.labels = data.map(item => item.label);
            this.chartConfig.data.datasets[0].data = data.map(item => item.data?.BalanceBooked || 0);
            this.chartConfig.data.datasets[0].backgroundColor = this.colors;

            if (this.chartRef) {
                this.chartRef.destroy();
            }

            this.chartRef = new Chart(<any>this.bankBalance.nativeElement, this.chartConfig);
            this.cdr.markForCheck();
        } else {
            this.icon = 'money_off';
            this.msg = 'Vi fant ingen saldo. Har du satt opp driftskonto og/eller skattetrekkskonto på firmaoppsett?';
            this.missingData = true;
            this.cdr.markForCheck();
        }
    }

    toggleDatasource(datasource) {
        datasource.hidden = !datasource.hidden;
        this.redrawChart();
    }

    private redrawChart() {
        this.totalAmount = (this.datasources || [])
            .filter(item => !item.hidden)
            .reduce((sum, item) => sum += (item.data?.BalanceBooked || 0), 0);


        this.chartRef.config.data.datasets[0].backgroundColor = this.datasources.map(datasource => {
            if (!datasource.hidden) {
                return datasource.color;
            }
        });

        this.chartRef.config.data.labels = this.datasources.map(datasource => {
            if (!datasource.hidden) {
                return datasource.label;
            }
        });

        this.chartRef.config.data.datasets[0].data = this.datasources.map(datasource => {
            if (!datasource.hidden) {
                return datasource.data.BalanceBooked;
            }
        });

        this.chartRef.config.options.plugins.doughnutlabel.labels = this.getChartLabel();
        this.chartRef.update();
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
                tooltips: {
                    enabled: false,
                    mode: 'index',
                    position: 'nearest',
                    custom: tooltip => {
                        if (tooltip.dataPoints && tooltip.dataPoints.length) {
                            const index = tooltip.dataPoints[0].index;

                            const datasource = this.datasources[index];

                            this.tooltip = {
                                accountName: this.chartRef.config.data.labels[index],
                                balance: datasource.data.BalanceBooked,
                                date: moment(new Date(datasource.data.Date)).format('DD.MMM YYYY HH:mm'),
                                accountNumber: this.getFormattedAccountNumber(datasource.data.AccountNumber.toString()),
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
                animation: {
                    scale: true,
                    rotate: true,
                    steps: 50,
                    easing: 'easeOutBounce'
                },
                legend: {
                    display: false
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

    private getFormattedAccountNumber(number: string) {
        if (number.length === 11) {
            return `${number.substr(0, 4)} ${number.substr(4, 2)} ${number.substr(6, 5)}`;
        } else {
            return number;
        }
    }

    private getChartLabel() {
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
