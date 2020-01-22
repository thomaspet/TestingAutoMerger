import {Component, ChangeDetectionStrategy, ChangeDetectorRef, ElementRef, ViewChild} from '@angular/core';
import {IUniWidget} from '../../uniWidget';
import {AuthService} from '@app/authService';
import {FinancialYearService} from '@app/services/services';
import {WidgetDataService} from '@app/components/widgets/widgetDataService';
import * as Chart from 'chart.js';
import * as doughnutlabel from 'chartjs-plugin-doughnutlabel';
import {theme} from 'src/themes/theme';

interface IKeyNumberObject {
    label: string;
    value: string;
    grade: string;
    class: string;
    indicator: string;
    indicatorLevel: number;
}

@Component({
    selector: 'kpi-widget',
    templateUrl: './kpi.html',
    styleUrls: ['./kpi.sass'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KpiWidget {
    @ViewChild('canvas') canvas: ElementRef;

    widget: IUniWidget;
    chartRef: Chart;

    unauthorized: boolean;
    kpiItem = {
        label: '',
        value: '',
        grade: '-',
        class: 'warn',
        indicator: 'trending_flat',
        indicatorLevel: 0
    };

    constructor(
        private authService: AuthService,
        private cdr: ChangeDetectorRef,
        private dataService: WidgetDataService,
        private financialYearService: FinancialYearService
    ) {}

    public ngAfterViewInit() {
        let hasAccess = true;
        if (this.widget.permissions && this.widget.permissions.length) {
            const user = this.authService.currentUser;
            hasAccess = this.widget.permissions.some(p => this.authService.hasUIPermission(user, p));
        }

        if (hasAccess) {
            this.getKpiData();
        } else {
            this.unauthorized = true;
            this.cdr.markForCheck();
        }
    }

    ngOnDestroy() {
        if (this.chartRef) {
            this.chartRef.destroy();
        }
    }

    private getKpiData() {
        this.financialYearService.lastSelectedFinancialYear$.subscribe(financialYear => {
            const year = financialYear.Year;
            const endpoint = '/api/statistics?model=JournalEntryLine'
            + '&select=sum(casewhen(Account.AccountNumber ge 1400 '
            + 'and Account.AccountNumber le 1999,Amount,0)) as sumOmlopsmidler,'
            + 'sum(casewhen(Account.AccountNumber ge 2300 '
            + 'and Account.AccountNumber le 2999,Amount,0)) as sumkortsiktiggjeld,'
            + 'sum(casewhen(Account.AccountNumber ge 2000 '
            + 'and Account.AccountNumber le 2999,Amount,0)) as sumTK,'
            + 'sum(casewhen(Account.AccountNumber ge 2000 '
            + 'and Account.AccountNumber le 2099,Amount,0)) as sumEK,'
            + 'sum(casewhen(Account.AccountNumber ge 3000 '
            + 'and Account.AccountNumber le 8299 '
            + 'and Period.AccountYear eq ' + year + ',Amount,0)) as resultat'
            + '&expand=Account,Period&distinct=false';

            this.dataService.getData(endpoint).subscribe(
                data => {
                    if (!data || !data.Data) {
                        return;
                    }

                    if (this.chartRef) {
                        this.chartRef.destroy();
                    }

                    switch (this.widget.config.type) {
                        case 'profitability':
                            this.initProfitabilityIndicator(data.Data[0]);
                        break;
                        case 'liquidity':
                            this.initLiquidityIndicator(data.Data[0]);
                        break;
                        case 'solidity':
                            this.initSolidityIndicator(data.Data[0]);
                        break;
                    }

                    this.cdr.markForCheck();
                },
                err => {
                    if (err.status === 403) {
                        this.unauthorized = true;
                        this.cdr.markForCheck();
                    } else {
                        console.error(err);
                    }
                }
            );
        });
    }

    private formatValue(value) {
        return value >= 100 || value <= -100
            ? value.toFixed(0) : value.toFixed(1);
    }

    public initProfitabilityIndicator(data) {
        if (data.sumTK) {
            this.kpiItem.value = this.formatValue((data.resultat * 100) / data.sumTK || 1);
            this.checkNumbers(this.kpiItem, [1, 5, 9, 15]);
            this.drawDoughnut(this.canvas.nativeElement, this.kpiItem);
        }
    }

    public initLiquidityIndicator(data) {
        if (data.sumkortsiktiggjeld) {
            this.kpiItem.value = this.formatValue(data.sumOmlopsmidler / (data.sumkortsiktiggjeld * -1));
            this.checkNumbers(this.kpiItem, [0.5, 1, 1.5, 2]);
            this.drawDoughnut(this.canvas.nativeElement, this.kpiItem);
        }
    }

    public initSolidityIndicator(data) {
        if (data.sumTK) {
            // Add result to give a more up-to-date view of the solidity
            this.kpiItem.value = this.formatValue(((data.sumEK + data.resultat) * 100) / (data.sumTK + data.resultat));

            this.checkNumbers(this.kpiItem, [3, 10, 18, 40]);
            this.drawDoughnut(this.canvas.nativeElement, this.kpiItem);
        }
    }

    public checkNumbers(kpiObject: IKeyNumberObject, breakpoints: number[]) {
        const keyNumber = parseInt(kpiObject.value, 10);

        if (keyNumber < breakpoints[0]) {
            kpiObject.grade = 'Svak';
            kpiObject.class = 'bad';
            kpiObject.indicator = 'trending_down';
            kpiObject.indicatorLevel = 1;
        } else if (keyNumber >= breakpoints[0] && keyNumber < breakpoints[1]) {
            kpiObject.grade = 'Svak';
            kpiObject.class = 'bad';
            kpiObject.indicator = 'trending_down';
            kpiObject.indicatorLevel = 2;
        } else if (keyNumber >= breakpoints[1] && keyNumber < breakpoints[2]) {
            kpiObject.grade = 'Tilfredstillende';
            kpiObject.class = 'warn';
            kpiObject.indicator = 'trending_flat';
            kpiObject.indicatorLevel = 3;
        } else if (keyNumber >= breakpoints[2] && keyNumber < breakpoints[3]) {
            kpiObject.grade = 'God';
            kpiObject.class = 'good';
            kpiObject.indicator = 'trending_up';
            kpiObject.indicatorLevel = 4;
        } else {
            kpiObject.grade = 'Meget god';
            kpiObject.class = 'good';
            kpiObject.indicator = 'trending_up';
            kpiObject.indicatorLevel = 5;
        }
    }

    drawDoughnut(canvas, kpiObject: IKeyNumberObject) {
        let backgroundColor = theme.widgets.kpi.good;
        if (kpiObject.indicatorLevel === 3) {
            backgroundColor = theme.widgets.kpi.warn;
        } else if (kpiObject.indicatorLevel < 3) {
            backgroundColor = theme.widgets.kpi.bad;
        }

        const data = {
            labels: ['', ''],
            datasets: [{
                data: [kpiObject.indicatorLevel, 5 - kpiObject.indicatorLevel],
                backgroundColor: [backgroundColor, theme.widgets.kpi.background],
            }]
        };

        this.chartRef = new Chart(canvas, {
            type: 'doughnut',
            data: data,
            plugins: [doughnutlabel],
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutoutPercentage: 75,
                legend: { display: false },
                tooltips: { enabled: false },
                events: [],
                plugins: {
                    doughnutlabel: {
                        labels: [{
                            text: kpiObject.value,
                            color: '#676767',
                            font: { size: '14' }
                        }]
                    }
                }
            }
        });
    }
}
