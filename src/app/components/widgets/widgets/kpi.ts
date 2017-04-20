import { Component, ViewChild, ElementRef } from '@angular/core';
import { IUniWidget } from '../uniWidget';
import { WidgetDataService } from '../widgetDataService';
import { FinancialYearService } from '../../../services/services';
import * as Chart from 'chart.js';

interface IKeyNumberObject {
    value: string;
    grade: string;
    arrowX: number;
    arrowY: number;
    textColor: string;
    id: string;
}

@Component({
    selector: 'uni-kpi-widget',
    template: `
        <div class="uni-kpi-widget">
            <div class="uni-dashboard-chart-header"> {{ widget.config.header }}</div>
            <section>

                <section>
                    <div>
                        <h2>Lønnsomhet</h2>
                        <p class="uni-kpi-widget-value" [ngStyle]="{'color': profitability.textColor}">{{ profitability.value }}</p>
                    </div>
                    <div>
                        <p [ngStyle]="{'color': profitability.textColor}">{{ profitability.grade }} </p>
                    </div>
                    <div>
                        <canvas #profitabilityCanvas> </canvas>
                    </div>
                </section>

                <section>
                    <div>
                        <h2>Likviditet</h2>
                        <p class="uni-kpi-widget-value" [ngStyle]="{'color': liquidity.textColor}">{{ liquidity.value }}</p>
                    </div>
                    <div>
                        <p [ngStyle]="{'color': liquidity.textColor}">{{ liquidity.grade }} </p>
                    </div>
                    <div>
                        <canvas #liquidityCanvas> </canvas>
                    </div>
                </section>

                <section>
                    <div>
                        <h2>Soliditet</h2>
                        <p class="uni-kpi-widget-value" [ngStyle]="{'color': solidity.textColor}">{{ solidity.value }}</p>
                    </div>
                    <div>
                        <p [ngStyle]="{'color': solidity.textColor}">{{ solidity.grade }} </p>
                    </div>
                    <div>
                        <canvas #solidityCanvas> </canvas>
                    </div>
                </section>

            </section>
        </div>
    `
})

export class UniKPIWidget {
    @ViewChild('profitabilityCanvas')
    private profitabilityCanvas: ElementRef;

    @ViewChild('liquidityCanvas')
    private liquidityCanvas: ElementRef;

    @ViewChild('solidityCanvas')
    private solidityCanvas: ElementRef;

    public widget: IUniWidget;

    public liquidity: IKeyNumberObject = {
        value: '-',
        grade: 'Ikke tilgjengelig',
        arrowX: 0,
        arrowY: 0,
        textColor: '#85898b',
        id: '151468'
    };

    public solidity: IKeyNumberObject = {
        value: '-',
        grade: 'Ikke tilgjengelig',
        arrowX: 0,
        arrowY: 0,
        textColor: '#85898b',
        id: '124515'
    };

    public profitability: IKeyNumberObject = {
        value: '-',
        grade: 'Ikke tilgjengelig',
        arrowX: 0,
        arrowY: 0,
        textColor: '#85898b',
        id: '784574'
    };

    constructor(
        private widgetDataService: WidgetDataService,
        private financialYearService: FinancialYearService
    ) {}

    public ngAfterViewInit() {
        this.financialYearService.getActiveYear().subscribe((year: number) => {
            this.widgetDataService.getData('/api/statistics?skip=0&top=50&model=JournalEntryLine&select=sum(casewhen(Account.AccountNumber%20ge%201400%20and%20Account.AccountNumber%20le%201999,Amount,0))%20as%20sumOmlopsmidler,sum(casewhen(Account.AccountNumber%20ge%202300%20and%20Account.AccountNumber%20le%202999,Amount,0))%20as%20sumkortsiktiggjeld,sum(casewhen(Account.AccountNumber%20ge%201000%20and%20Account.AccountNumber%20le%201999,Amount,0))%20as%20sumTK,sum(casewhen(Account.AccountNumber%20ge%202000%20and%20Account.AccountNumber%20le%202099,Amount,0))%20as%20sumEK,sum(casewhen(Account.AccountNumber%20ge%203000%20and%20Account.AccountNumber%20le%208299 and Period.AccountYear eq ' + year + ',Amount,0))%20as%20resultat&expand=Account,Period&distinct=false')
                .subscribe(
                    (data) => {
                        this.initLiquidityIndicator(data.Data[0]);
                        this.initProfitabilityIndicator(data.Data[0]);
                        this.initSolidityIndicator(data.Data[0]);
                    },
                    err => console.log(err)
                );
        });
    }

    public initSolidityIndicator(data) {
        if (data.sumTK) {
            this.solidity.value = ((data.sumEK * 100) / data.sumTK).toFixed(1);
            this.checkNumbers(this.solidity, [3, 10, 18, 40]);

            this.drawIndicator(
                this.solidityCanvas,
                this.solidity.arrowX,
                this.solidity.arrowY
            );
        }
    }

    public initProfitabilityIndicator(data) {
        if (data.sumTK) {
            this.profitability.value = (((data.resultat * -1) * 100) / data.sumTK || 1).toFixed(1);
            this.checkNumbers(this.profitability, [1, 5, 9, 15]);

            this.drawIndicator(
                this.profitabilityCanvas,
                this.profitability.arrowX,
                this.profitability.arrowY
            );
        }
    }


    public initLiquidityIndicator(data) {
        if (data.sumkortsiktiggjeld) {
            this.liquidity.value = (data.sumOmlopsmidler / (data.sumkortsiktiggjeld * -1)).toFixed(1);
            this.checkNumbers(this.liquidity, [0.5, 1, 1.5, 2]);

            this.drawIndicator(
                this.liquidityCanvas,
                this.liquidity.arrowX,
                this.liquidity.arrowY
            );
        }
    }

    public checkNumbers(kpiObject: IKeyNumberObject, breakpoints: number[]) {
        let keyNumber = parseInt(kpiObject.value);

        if (keyNumber < breakpoints[0]) {
            kpiObject.grade = 'Ikke tilfredstillende';
            kpiObject.textColor = '#d65e63';
            kpiObject.arrowX = 15;
            kpiObject.arrowY = 90;
        } else if (keyNumber >= breakpoints[0] && keyNumber < breakpoints[1]) {
            kpiObject.grade = 'Svak';
            kpiObject.textColor = '#ebb5ab';
            kpiObject.arrowX = 20;
            kpiObject.arrowY = 60;
        } else if (keyNumber >= breakpoints[1] && keyNumber < breakpoints[2]) {
            kpiObject.grade = 'Tilfredstillende';
            kpiObject.textColor = '#b9d49d';
            kpiObject.arrowX = 35;
            kpiObject.arrowY = 40;
        } else if (keyNumber >= breakpoints[2] && keyNumber < breakpoints[3]) {
            kpiObject.grade = 'God';
            kpiObject.textColor = '#9bc57d';
            kpiObject.arrowX = 60;
            kpiObject.arrowY = 40;
        } else {
            kpiObject.grade = 'Meget god';
            kpiObject.textColor = '#77b655';
            kpiObject.arrowX = 85;
            kpiObject.arrowY = 70;
        }
    }

    public drawIndicator(canvas: ElementRef, arrowX: number, arrowY: number) {
        if (!canvas || !canvas.nativeElement) {
            console.log('too soon?');
            return;
        }

        new Chart(canvas.nativeElement, {
            type: 'doughnut',
            data: {
                datasets: [{
                    data: [2, 3, 4, 5, 6],
                    backgroundColor: [
                        '#d65e63',
                        '#ebb5ab',
                        '#b9d49d',
                        '#9bc57d',
                        '#77b655'
                    ],
                }]
            },
            options: {
                rotation: 1 * Math.PI,
                circumference: 1 * Math.PI,
                cutoutPercentage: 85,
                hover: { mode: null },
                tooltips: {
                    enabled: false
                },
                responsive: true,
                legend: {
                    display: false
                },
                animation: {
                    onComplete: function () {
                        const c = canvas.nativeElement;
                        const context = c.getContext('2d');

                        context.strokeStyle = '#85898b';
                        context.lineWidth = 3;
                        context.beginPath();
                        context.moveTo((c.width / 100) * arrowX, (c.height / 100) * arrowY);
                        context.lineTo(c.width / 2, c.height);
                        context.stroke();
                        context.save();
                    }
                }
            }
        });
    }
}
