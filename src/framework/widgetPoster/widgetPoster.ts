import {Component, Input, ChangeDetectorRef} from '@angular/core';
declare var Chart;

@Component({
    selector: 'uni-widget-poster',
    templateUrl: 'framework/widgetPoster/widgetPoster.html',
})
export class WidgetPoster {
    @Input() public model: any;

    private rngIteration: number = 0;
    public randomNumber: string = '42%';
    private cdr: any;

    constructor(cdr: ChangeDetectorRef) {
        this.cdr = cdr;
    }

    public ngAfterViewInit() {
        let chartElem = document.getElementById('widgetGraph0');
        this.lineChartGenerator(chartElem);
        this.randomNumberGenerator();
    }

    private randomNumberGenerator() {
        
        let iterations = 50;

        if (this.rngIteration < iterations) {
            
            this.rngIteration++;
            let rando = Math.floor((Math.random() * 94) + 5);
            this.randomNumber = rando.toString() + '%';
            this.cdr.detectChanges();

            window.requestAnimationFrame(() => {
                this.randomNumberGenerator();
            });

        } else if (this.rngIteration === iterations) {
            let rando = Math.floor((Math.random() * 50) + 50);
            this.randomNumber = rando.toString() + '%';
            this.cdr.detectChanges();
        }

    }

    private lineChartGenerator(elem: any) {
        let chart = new Chart(elem, {
            type: 'line',
            data: {
                labels: this.labelGenerator(10),
                datasets: [{
                    data: this.generateRandomGraphData(10, 175000, 10000, 750),
                    backgroundColor: 'rgba(0,130,192,.05)',
                    borderColor: 'rgba(0,130,192,.1)',
                    borderWidth: 5
                }]
            },
            options: {
                maintainAspectRatio: false,
                scaleShowLabels : false,
                tooltips: {
                    enabled: false
                },
                legend: {
                    display: false
                },
                scales: {
                    yAxes: [{
                        display: false
                    }],
                    xAxes: [{
                        display: false
                    }]
                }
            }
        });
    }

    public labelGenerator(numberOfDataPoints){
        let _data = [];
        for (var index = 0; index < numberOfDataPoints; index++) {
            _data.push('');
        }
        return _data;
    }

    public generateRandomGraphData(
        numberOfDataPoints = 10,
        startValue = 175000,
        maxValueVariance = 1000,
        trend = 0
    ) {

        let _data = [];
        for (var index = 0; index < numberOfDataPoints; index++) {
            let _currentMin = startValue - maxValueVariance + (trend * index);
            let _currentMax = startValue + maxValueVariance + (trend * index);
            let _currentVal = Math.floor(Math.random() * (_currentMax - _currentMin + 1)) + _currentMin;

            _data.push(_currentVal);

        }
        return _data;
    }
}
