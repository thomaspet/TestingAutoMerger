import {Component, ViewChild, ElementRef, EventEmitter} from '@angular/core';
import {IUniWidget} from '../uniWidget';
import {YearService, ErrorService} from '../../../services/services';
import {WidgetDataService} from '../widgetDataService';
import * as Chart from 'chart.js';

interface IKeyNumberObject {
    value: string;
    grade: string;
    class: string;
    arrowX: number;
    arrowY: number;
    textColor: string;
}

@Component({
    selector: 'uni-kpi-widget',
    template: `
        <section class="uni-widget-header">
            {{ widget.description }}
        </section>

        <section class="uni-widget-content" [attr.aria-busy]="!(dataLoaded | async)">
            <section class="kpi-widget-row">
                <section class="kpi-widget-column">
                    <span class="kpi-widget-title">Lønnsomhet</span>
                    <span class="kpi-widget-value" [ngStyle]="{'color': profitability.textColor}">
                        {{ profitability.value }}
                    </span>
                </section>

                <section class="kpi-widget-column">
                    <span class="kpi-widget-arrow" [ngClass]="profitability.class">link</span>
                    <span [ngStyle]="{'color': profitability.textColor}">
                        {{ profitability.grade }}
                    </span>
                </section>

                <section class="kpi-widget-column">
                    <canvas #profitabilityCanvas> </canvas>
                </section>
            </section>

            <section class="kpi-widget-row">
                <section class="kpi-widget-column">
                    <span class="kpi-widget-title">Likviditet</span>
                    <span class="kpi-widget-value" [ngStyle]="{'color': liquidity.textColor}">
                        {{ liquidity.value }}
                    </span>
                </section>

                <section class="kpi-widget-column">
                    <span class="kpi-widget-arrow" [ngClass]="liquidity.class">link</span>
                    <span [ngStyle]="{'color': liquidity.textColor}">
                        {{ liquidity.grade }}
                    </span>
                </section>

                <section class="kpi-widget-column">
                    <canvas #liquidityCanvas> </canvas>
                </section>
            </section>

            <section class="kpi-widget-row">
                <section class="kpi-widget-column">
                    <span class="kpi-widget-title">Soliditet</span>
                    <span class="kpi-widget-value" [ngStyle]="{'color': solidity.textColor}">
                        {{ solidity.value }}
                    </span>
                </section>

                <section class="kpi-widget-column">
                    <span class="kpi-widget-arrow" [ngClass]="solidity.class">link</span>
                    <span [ngStyle]="{'color': solidity.textColor}">{{ solidity.grade }}</span>
                </section>

                <section class="kpi-widget-column">
                    <canvas #solidityCanvas></canvas>
                </section>
            </section>
        </section>
    `,
})
export class UniKPIWidget {
    @ViewChild('profitabilityCanvas')
    private profitabilityCanvas: ElementRef;

    @ViewChild('liquidityCanvas')
    private liquidityCanvas: ElementRef;

    @ViewChild('solidityCanvas')
    private solidityCanvas: ElementRef;

    public widget: IUniWidget;
    public dataLoaded: EventEmitter<boolean> = new EventEmitter();

    public liquidity: IKeyNumberObject = {
        value: '-',
        grade: 'Ikke tilgjengelig',
        class: '',
        arrowX: 0,
        arrowY: 0,
        textColor: '#85898b'
    };

    public solidity: IKeyNumberObject = {
        value: '-',
        grade: 'Ikke tilgjengelig',
        class: '',
        arrowX: 0,
        arrowY: 0,
        textColor: '#85898b'
    };

    public profitability: IKeyNumberObject = {
        value: '-',
        grade: 'Ikke tilgjengelig',
        class: '',
        arrowX: 0,
        arrowY: 0,
        textColor: '#85898b'
    };

    constructor(
        private dataService: WidgetDataService,
        private errorService: ErrorService,
        private yearService: YearService
    ) {}

    public ngAfterViewInit() {
        this.yearService.selectedYear$.subscribe(year => {
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
                    this.initLiquidityIndicator(data.Data[0]);
                    this.initProfitabilityIndicator(data.Data[0]);
                    this.initSolidityIndicator(data.Data[0]);

                    this.dataLoaded.emit(true);
                },
                err => this.dataLoaded.emit(true)
            );
        },
        err => this.dataLoaded.emit(true)
        );
    }

    public initSolidityIndicator(data) {
        if (data.sumTK) {
            // Add result to give a more up-to-date view of the solidity
            this.solidity.value = (((data.sumEK + data.resultat) * 100) / (data.sumTK + data.resultat)).toFixed(1);
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
            this.profitability.value = ((data.resultat * 100) / data.sumTK || 1).toFixed(1);
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
            kpiObject.grade = 'Ikke tilfredst.';
            kpiObject.class = 'kpi-widget-level1';
            kpiObject.textColor = '#d65e63';
            kpiObject.arrowX = 15;
            kpiObject.arrowY = 90;
        } else if (keyNumber >= breakpoints[0] && keyNumber < breakpoints[1]) {
            kpiObject.grade = 'Svak';
            kpiObject.class = 'kpi-widget-level2';
            kpiObject.textColor = '#ebb5ab';
            kpiObject.arrowX = 20;
            kpiObject.arrowY = 60;
        } else if (keyNumber >= breakpoints[1] && keyNumber < breakpoints[2]) {
            kpiObject.grade = 'Tilfredstillende';
            kpiObject.class = 'kpi-widget-level3';
            kpiObject.textColor = '#b9d49d';
            kpiObject.arrowX = 35;
            kpiObject.arrowY = 40;
        } else if (keyNumber >= breakpoints[2] && keyNumber < breakpoints[3]) {
            kpiObject.grade = 'God';
            kpiObject.class = 'kpi-widget-level4';
            kpiObject.textColor = '#9bc57d';
            kpiObject.arrowX = 60;
            kpiObject.arrowY = 40;
        } else {
            kpiObject.grade = 'Meget god';
            kpiObject.class = 'kpi-widget-level5';
            kpiObject.textColor = '#77b655';
            kpiObject.arrowX = 85;
            kpiObject.arrowY = 70;
        }
    }

    public drawIndicator(canvas: ElementRef, arrowX: number, arrowY: number) {
        if (!canvas || !canvas.nativeElement) {
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
