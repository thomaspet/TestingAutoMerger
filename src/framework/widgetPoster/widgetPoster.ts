import {Component, Input} from '@angular/core';
declare var Chart;

@Component({
    selector: 'uni-widget-poster',
    templateUrl: 'framework/widgetPoster/widgetPoster.html'
})
export class WidgetPoster {
    @Input() public model: any;

    public ngAfterViewInit() {
        let chartElem0 = document.getElementById('widgetGraph0');
        this.lineChartGenerator(chartElem0);
    }

    private lineChartGenerator(elem: any) {
        console.log(elem);
        let chart = new Chart(elem, {
            type: 'line',
            data: {
                datasets: [{
                    data: this.generateRandomGraphData(8, 175000, 10000, 750),
                    lineTension: 0,
                    backgroundColor: 'transparent',
                    borderColor: 'rgba(0,130,192,.1)'
                }]
            },
            options: {
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
                        type: 'time',
                        display: false
                    }]
                }
            }
        });
    }

    public generateRandomDateTime(start, end){
        return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    }

    public generateRandomGraphData(
        numberOfDataPoints = 10,
        startValue = 175000,
        maxValueVariance = 1000,
        trend = 0,
        startDate = new Date(2016, 1, 1),
        endDate = new Date()
    ) {

        let _data = [];

        // Add random dates
        for (var index = 0; index < numberOfDataPoints; index++) {
            _data.push({x: this.generateRandomDateTime(startDate, endDate)});
        }

        // Sort the dates
        _data.sort((a, b) => {
            return a.x - b.x;
        });

        // Add values
        _data.forEach((datapoint, index) => {
            let _currentMin = startValue - maxValueVariance + (trend * index);
            let _currentMax = startValue + maxValueVariance + (trend * index);
            let _currentVal = Math.floor(Math.random() * (_currentMax - _currentMin + 1)) + _currentMin;
            datapoint.y = _currentVal;
        });

        return _data;
    }
}
