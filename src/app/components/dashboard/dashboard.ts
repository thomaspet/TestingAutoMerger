import {Component} from '@angular/core';
import {TabService} from '../layout/navbar/tabstrip/tabService';
declare var Chart;
declare var moment;

@Component({
  selector: 'uni-dashboard',
  templateUrl: 'app/components/dashboard/dashboard.html',
})
export class Dashboard {

    public welcomeHidden: boolean = localStorage.getItem('welcomeHidden');

    constructor(private tabService: TabService) {
        this.tabService.addTab({name: 'Dashboard', url: '/'});
        Chart.defaults.global.maintainAspectRatio = false;
    }

    public ngAfterViewInit() {
        let revCanvas = document.getElementById('revenue');
        let revChart = new Chart(revCanvas, {
            type: 'line',
            data: {
                labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
                datasets: [{
                    data: [12, 19, 3, 5, 2, 3]
                }]
            }
        });

        let debetCanvas = document.getElementById('debetGraph');
        let debetChart = new Chart(debetCanvas, {
            type: 'line',
            data: {
                datasets: [{
                    data: this.generateRandomGraphData(75, 175000, 10000, 750),
                    lineTension: 0
                }]
            },
            options: {
                scales: {
                    xAxes: [{
                        type: 'time'
                    }]
                }
            }
        });

    }

    public hideWelcome() {
        this.welcomeHidden = true;
        localStorage.setItem('welcomeHidden', 'true');
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
