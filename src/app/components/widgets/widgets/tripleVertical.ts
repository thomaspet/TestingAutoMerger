import { Component } from '@angular/core';
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
    selector: 'uni-triple-vertical-widget',
    template: `
                <div class="uni-triple-verical-widget">
                    <div class="uni-dashboard-chart-header"> {{ widget.config.header }}</div>
                    <section>

                        <section>
                            <div>  
                                <h2>Lønnsomhet</h2>
                                <p class="uni-triple-verical-widget-value" [ngStyle]="{'color': profitability.textColor}">{{ profitability.value }}</p>
                            </div>
                            <div> 
                                <p [ngStyle]="{'color': profitability.textColor}">{{ profitability.grade }} </p>
                            </div>
                            <div> 
                                <canvas id="784574"> </canvas>
                            </div>
                        </section>

                        <section>
                            <div>  
                                <h2>Likviditet</h2>
                                <p class="uni-triple-verical-widget-value" [ngStyle]="{'color': liquidity.textColor}">{{ liquidity.value }}</p>
                            </div>
                            <div> 
                                <p [ngStyle]="{'color': liquidity.textColor}">{{ liquidity.grade }} </p>
                            </div>
                            <div> 
                                <canvas id="151468"> </canvas>
                            </div>
                        </section>

                        <section>
                            <div>  
                                <h2>Soliditet</h2>
                                <p class="uni-triple-verical-widget-value" [ngStyle]="{'color': solidity.textColor}">{{ solidity.value }}</p>
                            </div>
                            <div> 
                                <p [ngStyle]="{'color': solidity.textColor}">{{ solidity.grade }} </p>
                            </div>
                            <div> 
                                <canvas id="124515"> </canvas>
                            </div>
                        </section>

                    </section>
                </div>`
})

export class UniTripleVerticalWidget {

    public widget: IUniWidget;
    public liquidity: IKeyNumberObject = {
        value: '-',
        grade: '-',
        arrowX: 0,
        arrowY: 0,
        textColor: '',
        id: '151468'
    };

    public solidity: IKeyNumberObject = {
        value: '-',
        grade: 'Ikke tilgjengelig',
        arrowX: 0,
        arrowY: 0,
        textColor: '',
        id: '124515'
    }

    public profitability: IKeyNumberObject = {
        value: '',
        grade: '',
        arrowX: 0,
        arrowY: 0,
        textColor: '-',
        id: '784574'
    }

    constructor(private widgetDataService: WidgetDataService, private financialYearService: FinancialYearService) { }

    ngAfterViewInit() {
        this.financialYearService.getActiveYear()
            .subscribe((year: number) => {
                this.widgetDataService.getData('/api/statistics?skip=0&top=50&model=JournalEntryLine&select=sum(casewhen(Account.AccountNumber%20ge%201400%20and%20Account.AccountNumber%20le%201999,Amount,0))%20as%20sumOmlopsmidler,sum(casewhen(Account.AccountNumber%20ge%202300%20and%20Account.AccountNumber%20le%202999,Amount,0))%20as%20sumkortsiktiggjeld,sum(casewhen(Account.AccountNumber%20ge%201000%20and%20Account.AccountNumber%20le%201999,Amount,0))%20as%20sumTK,sum(casewhen(Account.AccountNumber%20ge%202000%20and%20Account.AccountNumber%20le%202099,Amount,0))%20as%20sumEK,sum(casewhen(Account.AccountNumber%20ge%203000%20and%20Account.AccountNumber%20le%208299 and Period.AccountYear eq ' + year + ',Amount,0))%20as%20resultat&expand=Account,Period&distinct=false')
                    .subscribe((data) => { this.loadTripleVerticalWidget(data.Data[0]); }, err => console.log(err));
            });
        
    }

    loadTripleVerticalWidget(data: any) {
        if (data.sumTK) {
            this.profitability.value = (((data.resultat * -1) * 100) / data.sumTK | 1).toFixed(1);
            this.findData(this.profitability, [1, 5, 9, 15]);

            this.solidity.value = ((data.sumEK * 100) / data.sumTK).toFixed(1);
            this.findData(this.solidity, [3, 10, 18, 40]);
        } else {
            this.solidity.value = '-';
            this.solidity.grade = 'Ikke tilgjengelig';
            this.solidity.textColor = "#85898b";

            this.profitability.value = '-';
            this.profitability.grade = 'Ikke tilgjengelig';
            this.profitability.textColor = "#85898b";
        }

        if (data.sumkortsiktiggjeld) {
            this.liquidity.value = (data.sumOmlopsmidler / (data.sumkortsiktiggjeld * -1)).toFixed(1);
            this.findData(this.liquidity, [0.5, 1, 1.5, 2]);
        } else {

            this.liquidity.value = '-';
            this.liquidity.grade = 'Ikke tilgjengelig';
            this.liquidity.textColor = "#85898b";
        }
    }

    findData(object: IKeyNumberObject, values: number[]) {
        let number = parseInt(object.value);
        if (number < values[0]) {
            object.grade = 'Ikke tilfredstillende';
            object.textColor = "#d65e63";
            object.arrowX = 15;
            object.arrowY = 90;
        } else if (number >= values[0] && number < values[1]) {
            object.grade = 'Svak';
            object.textColor = "#ebb5ab";
            object.arrowX = 20;
            object.arrowY = 60;
        } else if (number >= values[1] && number < values[2]) {
            object.grade = 'Tilfredstillende';
            object.textColor = "#b9d49d";
            object.arrowX = 35;
            object.arrowY = 40;
        } else if (number >= values[2] && number < values[3]) {
            object.grade = 'God';
            object.textColor = "#9bc57d";
            object.arrowX = 60;
            object.arrowY = 40;
        } else {
            object.grade = 'Meget god';
            object.textColor = "#77b655";
            object.arrowX = 85;
            object.arrowY = 70;
        }
        this.drawChart(object.id, object.arrowX, object.arrowY);
    }

    drawChart(id: any, x, y) {
        let el = document.getElementById(id);

        let mychart = new Chart(<any>el, {
            type: 'doughnut',
            data: {
                datasets: [
                    {
                        data: [2, 3, 4, 5, 6],
                        backgroundColor: [
                            "#d65e63",
                            "#ebb5ab",
                            "#b9d49d",
                            "#9bc57d",
                            "#77b655"
                        ],
                    }
                ]
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
                        var c: any = document.getElementById(id);
                        var ctx = c.getContext('2d');
                        ctx.strokeStyle = "#85898b";
                        ctx.lineWidth = 3;
                        ctx.beginPath();
                        ctx.moveTo((c.width / 100) * x, (c.height / 100) * y);
                        ctx.lineTo(c.width / 2, c.height);
                        ctx.stroke();
                        ctx.save();
                    }
                }
            }

        });
    }
}