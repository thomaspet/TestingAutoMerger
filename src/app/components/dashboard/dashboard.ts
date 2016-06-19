import {Component} from '@angular/core';
import {TabService} from '../layout/navbar/tabstrip/tabService';
declare var Chart;

@Component({
  selector: 'uni-dashboard',
  templateUrl: 'app/components/dashboard/dashboard.html',
})
export class Dashboard {

    public welcomeHidden: boolean = localStorage.getItem('welcomeHidden');

    constructor(private tabService: TabService) {
        this.tabService.addTab({name: 'Dashboard', url: '/'});

        let data = this.generateRandomGraphData(10);
        console.log(data);

    }

    public ngAfterViewInit() {

        Chart.defaults.global.maintainAspectRatio = false;

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

    }

    public hideWelcome() {
        this.welcomeHidden = true;
        localStorage.setItem('welcomeHidden', 'true');
    }

    public generateRandomDateTime(start, end){
        return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    }

    public generateRandomGraphData(
        numberOfDataPoints = 75,
        startValue = 175000,
        maxValueVariance = 10000,
        trend = 0,
        startDate = new Date(2016, 1, 1),
        endDate = new Date()
    ) {

        let _data = [];

        for (var index = 0; index < numberOfDataPoints; index++) {

            let _currentMin = startValue - maxValueVariance + (trend * index);
            let _currentMax = startValue + maxValueVariance + (trend * index);

            console.log('min ' + _currentMin + '. Max: ' + _currentMax);

            _data.push({
                x: this.generateRandomDateTime(startDate, endDate),
                value: Math.floor(Math.random() * (_currentMax - _currentMin + 1)) + _currentMin
            });
        }
        return _data;
    }

}
