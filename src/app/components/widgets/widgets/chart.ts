import { Component, Input, ViewChild } from '@angular/core';

declare var Chart;

@Component({
    selector: 'uni-chart',
    template: ` <figure style="margin: 0; color: white; text-align: center;"> 
                    <div class="uni-dashboard-chart-header"> {{ config.header }}</div> 
                    <div style="padding: 20px;"> 
                        <canvas #chartelement> </canvas>
                    </div> 
                </figure>`
})

export class UniChartWidget {

    @Input() private config: any;
    @ViewChild('chartelement') chart: any;
    private myChart: any;

    constructor() { }

    ngAfterViewInit() {
        if (this.config) {
            this.loadChartWidget();
        }
    }

    ngOnChanges() {
        if (this.chart && this.config) {
            this.loadChartWidget(); 
        }
    }

    loadChartWidget() {

        //Destorys the old chart before replacing it with new to avoid conflicts in canvas..
        if (this.myChart) {
            this.myChart.destroy();
        }

        let myElement = this.chart.nativeElement;

        // 64px is 2 * 20px padding in parent + 24px in the header.. Canvas hack! Jørgen Lom fix it..
        myElement.style.height = ((100 * 3 + (3 - 1) * 20) - 64) + 'px';
        myElement.style.maxHeight = ((100 * 3 + (3 - 1) * 20) - 64) + 'px';

        //Draws new chart to the canvas
        this.myChart = new Chart(<any>myElement, {
            type: this.config.chartType,
            data: {
                labels: this.config.labels,
                datasets: this.config.dataset
            },
            options: this.config.options
        });
    }

}

