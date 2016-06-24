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
    public transactionList;

    constructor(private tabService: TabService) {
        this.tabService.addTab({ name: 'Dashboard', url: '/', active: true, moduleID: 0 });
        Chart.defaults.global.maintainAspectRatio = false;
        this.transactionList = [
            {
                user: 'Bruce Wayne',
                action: 'endret',
                module: 'faktura #154',
                time: 'for 2 timer siden'
            },
            {
                user: 'Slade Wilson',
                action: 'opprettet',
                module: 'bilag #5',
                time: 'for 8 timer siden'
            },
            {
                user: 'Oliver Queen',
                action: 'endret',
                module: 'Ordre #154',
                time: 'for 2 minutter siden'
            },
            {
                user: 'Edward Nigma',
                action: 'slettet',
                module: 'ordre #94',
                time: 'for 1 dag siden'
            },
            {
                user: 'Harvey Dent',
                action: 'opprettet',
                module: 'faktura #155',
                time: 'for 4 timer siden'
            }
        ]
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

        let invoicedChart = document.getElementById('invoicedChart');
        let iChart = new Chart(invoicedChart, {
            type: 'bar',
            data: {
                labels: ["March", "April", "May", "June"],
                datasets: [
                    {
                        label: 'Fakturert',
                        data: [125000, 154000, 235000, 500000]
                    }
                ]
            }
        });

        let operating_chart = document.getElementById('operating_chart');
        let oChart = new Chart(operating_chart, {
            type: 'line',
            data: {
                labels: ['2013', '2014', '2015', '2016'],
                datasets: [{
                    label: 'Driftsresultat',
                    data: [2125000, 3154000, 6235000, 9500000],
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

        let assets_chart = document.getElementById('assets_chart');
        let aChart = new Chart(assets_chart, {
            type: 'pie',
            
            data: {
                labels: ['Kontanter og bankinnskudd', 'Kortsiktige fordringer', 'Anleggsmidler', 'Varelager', 'Andre omløpsmidler'],
                datasets: [
                    {
                        data: [250000, 350000, 200000, 500000, 410000]
                    }
                ]
            }
        })

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
