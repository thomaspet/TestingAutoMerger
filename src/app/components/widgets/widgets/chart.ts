import { Component, Input } from '@angular/core';

declare var Chart;

@Component({
    selector: 'uni-chart',
    template: ` <figure style="margin: 0; color: white; text-align: center;"> 
                    <div class="uni-dashboard-chart-header"> {{ config.header }}</div> 
                    <div style="padding: 20px;"> 
                        <canvas [attr.id]="config.chartID"> </canvas>
                    </div> 
                </figure>`
})

export class UniChartWidget {

    @Input() private config: any;

    constructor() { }

    ngAfterViewInit() {
        let myElement = document.getElementById(this.config.chartID);

        // 64px is 2 * 20px padding in parent + 24px in the header.. Canvas hack! Jørgen Lom fix it..
        myElement.style.height = ((100 * 3 + (3 - 1) * 20) - 64) + 'px';
        myElement.style.maxHeight = ((100 * 3 + (3 - 1) * 20) - 64) + 'px';

        let myChart = new Chart(<any>myElement, {
            type: this.config.chartType,
            data: {
                labels: this.config.labels,
                datasets: this.config.dataset
            },
            options: this.config.options
        });
    }

}

