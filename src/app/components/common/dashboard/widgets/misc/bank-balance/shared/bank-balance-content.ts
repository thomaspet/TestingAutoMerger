import {Component, ChangeDetectionStrategy, ChangeDetectorRef, Pipe} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {forkJoin, of, Observable} from 'rxjs';
import {map, switchMap, catchError} from 'rxjs/operators';

import {BankAccountService, NumberFormat} from '@app/services/services';
import {AuthService} from '@app/authService';

import * as doughnutlabel from 'chartjs-plugin-doughnutlabel';
import {theme} from 'src/themes/theme';

interface AccountBalanceData {
    accountName: string;
    accountNumber: string;
    balanceAvailable: number;
    balanceBooked: number;
    isMainAccountBalance: boolean;
    MainAccountName: string;
}

@Component({
    selector: 'bank-balance-widget-content',
    templateUrl: './bank-balance-content.html',
    styleUrls: ['./bank-balance-content.sass'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BankBalanceWidgetContent {
    colors = theme.widgets.pie_colors;

    accountBalanceItems: AccountBalanceData[];
    reconciliationCount: number;

    missingData: boolean;
    chartConfig;

    constructor(
        private cdr: ChangeDetectorRef,
        private authService: AuthService,
        private http: HttpClient,
        private bankAccountService: BankAccountService,
        private numberFormatter: NumberFormat
    ) {}

    ngOnInit() {
        forkJoin(
            this.getAccountBalances(),
            this.getReconciliationCount()
        ).subscribe(
            ([balances, reconciliationCount]) => {
                if (balances && balances.some(b => !!b.balanceAvailable)) {
                    this.accountBalanceItems = balances;
                    this.chartConfig = this.getChartConfig();
                    this.missingData = false;
                    this.reconciliationCount = reconciliationCount;
                } else {
                    this.missingData = true;
                }

                this.cdr.markForCheck();
            },
            err => {
                console.error(err);
                this.missingData = true;
                this.cdr.markForCheck();
            }
        );
    }

    private getAccountBalances() {
        if (this.authService.activeCompany?.IsTest) {
            return this.bankAccountService.getBankBalance(1).pipe(
                map(res => [{
                    accountName: 'Testkonto',
                    accountNumber: res.AccountNumber,
                    balanceAvailable: res.BalanceAvailable,
                    balanceBooked: res.BalanceBooked,
                    isMainAccountBalance: false,
                    MainAccountName: ''
                }])
            );
        }

        return this.bankAccountService.getAllBankBalances()
            .map((balances: any[]) => {
            const data: AccountBalanceData[] = [];

            balances.forEach((balance) => {
                data.push({
                    accountName: balance.AccountName,
                    accountNumber: this.numberFormatter.asBankAcct(balance.AccountNumber),
                    balanceAvailable: balance.BalanceAvailable,
                    balanceBooked: balance.BalanceBooked,
                    isMainAccountBalance: balance.IsMainAccountBalance,
                    MainAccountName: balance.MainAccountName
                });
            });

            return data;
    });
    }

    private getReconciliationCount(): Observable<number> {
        const endpoint = '/api/statistics?model=BankAccount&wrap=false'
            + '&filter=companysettingsid gt 0'
            + '&join=bankaccount.id eq companysettings.companybankaccountid and bankaccount.accountid eq bankstatement.accountid and bankstatement.id eq bankstatemententry.bankstatementid as entry'
            + '&select=sum(casewhen(entry.statuscode eq 48002,1,0)) as closed,sum(casewhen(entry.id gt 0,1,0)) as total';

        return this.http.get(endpoint).pipe(
            catchError(() => of(null)),
            map(res => {
                if (res && res[0]) {
                    return res[0].total - res[0].closed;
                } else {
                    return 0;
                }
            })
        );
    }

    private getChartConfig() {
        const totalAmount = this.accountBalanceItems.reduce((sum, item) => {
            return sum += (item.isMainAccountBalance ? item.balanceBooked : item.balanceAvailable || 0);
        }, 0);

        return {
            type: 'pie',
            plugins: [doughnutlabel],
            data: {
                datasets: [{
                    data: this.accountBalanceItems.map(item => item.isMainAccountBalance ? item.balanceBooked : item.balanceAvailable),
                    backgroundColor: this.colors,
                    label: '',
                    borderColor: '#fff',
                    hoverBorderColor: '#fff'
                }],
                labels: this.accountBalanceItems.map(item => item.accountName)
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutoutPercentage: 72,
                legend: {display: false},
                tooltips: {enabled: false},
                elements: {arc: {borderWidth: 8}},
                animation: {animateScale: true},
                plugins: {
                    doughnutlabel: {
                        labels: [
                            {
                                text: 'Sum',
                                color: '#2b2b2b',
                                font: {size: '16'}
                            },
                            {
                                text: this.numberFormatter.asMoney(totalAmount),
                                color: '#2b2b2b',
                                font: {size: '17', weight: '500'}
                            }
                        ]
                    }
                },
            }
        };
    }
}
