import {
    Component,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    AfterViewInit,
    ViewChild,
    ElementRef,
    EventEmitter
} from '@angular/core';
import {
    StatisticsService,
    NumberFormat,
    CompanySettingsService,
    BankAccountService,
    PaymentBatchService,
    ElsaPurchaseService,
    BrunoOnboardingService,
    BankService
} from '@app/services/services';
import { AuthService } from '@app/authService';
import { IUniWidget } from '../uniWidget';
import * as Chart from 'chart.js';
import * as moment from 'moment';
import * as doughnutlabel from 'chartjs-plugin-doughnutlabel';
import { CompanySettings, BankIntegrationAgreement } from '@uni-entities';
import { Observable } from 'rxjs';

@Component({
    selector: 'bank-balance-widget-ext02',
    template: `
        <section class="widget-wrapper">
            <section class="header">
                <span>{{ widget.description }}</span>
            </section>

            <section *ngIf="missingData" class="no-content" style="flex-direction: column; text-align: center; padding: 2rem;">
                <i class="material-icons" style="margin-bottom: 1rem; font-size: 3rem; color: var(--alert-info);"> {{ icon }} </i>
                <span [innerHtml]="msg" style="font-size: 14px"></span>
                <span style="font-size: 14px"><a (click)="startOnboarding()" [innerHtml]="actionLink"></a> <span [innerHtml]="actionMsg"></span></span>
            </section>

            <div *ngIf="!missingData" class="content cavnas-container">

                <section class="bank-balance-tooltip" *ngIf="tooltip" [ngStyle]="tooltip.style">
                    <span class="tooltip-header">{{tooltip.accountName}}</span>
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
                <div class="legend-vertical-class" style="text-align: center;" *ngIf="dataHolder.length">
                    <section class="legend-row"
                        *ngFor="let legend of chartLegends; let  i = index;" id="{{ 'bank_balance_legend' + i }}"
                        (click)="addhiddenClass('bank_balance_legend' + i, i)">

                        <span class="indicator cost" [ngStyle]="{ 'background-color': colors[i] }"></span>
                        {{ legend }}
                    </section>
                </div>
            </div>
        </section>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class BankBalanceWidgetExt02 implements AfterViewInit {
    @ViewChild('bankBalance')
    private bankBalance: ElementRef;

    widget: IUniWidget;
    dataLoaded: EventEmitter<boolean> = new EventEmitter();
    colors = ['#005AA4', '#0071CD'];
    show = [true, true];

    chartRef: Chart;
    chartConfig: any;
    totalAmount: number = 0;
    missingData: boolean = false;
    dataHolder: any[] = [];
    companySettings: CompanySettings;
    agreements: any[];
    agreement?: BankIntegrationAgreement;
    msg: string = '';
    actionLink: string;
    actionMsg: string;
    icon: string = '';
    tooltip: any;
    chartLegends: string[] = [];

    constructor(
        private statisticsService: StatisticsService,
        private companySettingsService: CompanySettingsService,
        private bankAccountService: BankAccountService,
        private numberFormatService: NumberFormat,
        private elsaPurchasesService: ElsaPurchaseService,
        private paymentBatchService: PaymentBatchService,
        private authService: AuthService,
        private cdr: ChangeDetectorRef,
        private brunoOnboardingService: BrunoOnboardingService,
        private bankService: BankService
    ) { }

    ngOnDestroy() {
        this.dataLoaded.complete();
        if (this.chartRef) {
            this.chartRef.destroy();
        }
    }

    private getDataAndLoadChart() {

        Observable.forkJoin(
            this.bankAccountService.getBankBalance(this.companySettings.CompanyBankAccountID),
            this.bankAccountService.getBankBalance(this.companySettings.TaxBankAccountID)
        ).subscribe(([company, tax]) => {
            const data = [];
            this.dataHolder = [];
            this.totalAmount = 0;

            if (company) {
                this.chartLegends.push('Driftskonto standard');
                data.push(company.BalanceBooked);
                this.dataHolder.push(company);
                this.totalAmount += company.BalanceBooked;
            }

            if (tax) {
                this.chartLegends.push('Skattetrekkskonto');
                data.push(tax.BalanceBooked);
                this.dataHolder.push(tax);
                this.totalAmount += tax.BalanceBooked;
            }

            if (data.some(sum => !!sum)) {
                this.missingData = false;
                this.chartConfig = this.getEmptyResultChart();
                this.chartConfig.data.labels = this.chartLegends;

                data.forEach((value, index) => {
                    this.chartLegends[index] += ' - ' + this.numberFormatService.asMoney(value);
                });

                this.chartConfig.options.plugins.doughnutlabel.labels = this.getChartLabel();

                this.chartConfig.data.datasets[0].data = data;
                this.chartConfig.data.datasets[0].backgroundColor = this.colors;
                this.drawChart();
            } else {
                this.icon = 'money_off';
                this.msg = 'Vi fant ingen saldo. Har du satt opp driftskonto og/eller skattetrekkskonto på firmaoppsett?';
                this.missingData = true;
                this.cdr.markForCheck();

            }
        }, err => {
            this.icon = 'money_off';
            this.msg = 'Vi kunne ikke hente banksaldo. Det kan være problem med tredjepartssystem som henter data for oss.';
            this.missingData = true;
            this.cdr.markForCheck();
        });
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
        this.chartRef.config.data.labels = this.chartLegends.map((l, i) => {
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
        this.chartRef.config.data.datasets[0].data = this.dataHolder.map((l, i) => {
            if (this.show[i]) {
                this.totalAmount += l.BalanceBooked;
                return l.BalanceBooked;
            }
        });

        this.chartRef.config.options.plugins.doughnutlabel.labels = this.getChartLabel();
        this.chartRef.update();
    }

    getTestData() {
        this.bankAccountService.getBankBalance(1).subscribe(money => {
            this.chartLegends = ['Testkonto - ' + this.numberFormatService.asMoney(money.BalanceBooked)];

            const data = [money.BalanceBooked];
            this.dataHolder = [money];
            this.totalAmount = money.BalanceBooked;

            this.missingData = false;
            this.chartConfig = this.getEmptyResultChart();
            this.chartConfig.data.labels = this.chartLegends;

            this.chartConfig.options.plugins.doughnutlabel.labels = this.getChartLabel();

            this.chartConfig.data.datasets[0].data = data;
            this.chartConfig.data.datasets[0].backgroundColor = this.colors;
            this.drawChart();
        });
    }

    startOnboarding() {
        this.brunoOnboardingService.startOnboarding()
            .subscribe(() => {
                this.ngAfterViewInit(); // BUG: Only waits if a debugger is pressent, should not be done before data is ready
            });
    }

    public ngAfterViewInit() {
        if (this.authService.activeCompany.IsTest) {
            this.getTestData();
            return;
        }

        if (this.widget) {
            Observable.forkJoin(
                this.companySettingsService.Get(1,
                    ['BankAccounts', 'BankAccounts.Account', 'CompanyBankAccount', 'TaxBankAccount']),
                this.brunoOnboardingService.getAgreement()
            ).subscribe(([companySettings, agreement]) => {
                this.companySettings = companySettings;
                this.agreement = agreement;
                if (this.brunoOnboardingService.isActiveAgreement(this.agreement)) {
                    this.getDataAndLoadChart();
                }
                if (!this.agreement) {
                    this.msg = 'For å se saldo på bankkonto, trenger du en autobankavtale med banken. <br/>';
                    this.actionLink = 'Gå til bank';
                    this.actionMsg = ' for å koble sammen bank og regnskap.';
                    this.icon = 'sync_disabled';
                    this.missingData = true;
                    this.cdr.markForCheck();
                } else if (this.brunoOnboardingService.isPendingAgreement(this.agreement)) {
                    this.msg = 'Du har bestilt integrasjon med nettbanken din og vi jobber <br/> med å sette den opp. ' +
                        'Dette kan ta inntil 3 arbeidsdager.';
                    this.actionLink = 'Gå til bank';
                    this.actionMsg = ' for å bestille på nytt.';
                    this.icon = 'domain_disabled';
                    this.missingData = true;
                    this.cdr.markForCheck();
                } else if (this.brunoOnboardingService.isNeedConfigOnBankAccounts(this.agreement)) {
                    this.msg = 'Integrasjon er klar fra banken. <br/> Hjelp oss å knytte riktige kontoer til DNB Regnskap. <br/>';
                    this.actionLink = ' Sett opp kontoen(e) her';
                    this.actionMsg = '';
                    this.icon = 'domain_disabled';
                    this.missingData = true;
                    this.cdr.markForCheck();
                }
            }, err => {
                this.msg = 'Kunne ikke hente data';
                this.icon = 'sync_problem';
                this.missingData = true;
                this.cdr.markForCheck();
            });
        }


    }

    private drawChart() {
        if (this.chartRef) {
            this.chartRef.destroy();
        }

        this.chartRef = new Chart(<any>this.bankBalance.nativeElement, this.chartConfig);
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
                tooltips: {
                    enabled: false,
                    mode: 'index',
                    position: 'nearest',
                    custom: tooltip => {
                        if (tooltip.dataPoints && tooltip.dataPoints.length) {
                            const index = tooltip.dataPoints[0].index;
                            this.tooltip = {
                                accountName: this.chartRef.config.data.labels[index],
                                balance: this.dataHolder[index].BalanceBooked,
                                date: moment(new Date(this.dataHolder[index].Date)).format('DD.MMM YYYY HH:mm'),
                                accountNumber: this.getFormattedAccountNumber(this.dataHolder[index].AccountNumber.toString()),
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
