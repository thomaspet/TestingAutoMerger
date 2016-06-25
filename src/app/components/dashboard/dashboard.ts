import {Component} from '@angular/core';
import {TabService} from '../layout/navbar/tabstrip/tabService';
import {ChartDataService} from '../../services/Dashboard/ChartDataService';
declare var Chart;
declare var moment;

export interface IChartDataSet {
    label: string;
    backgroundColor: string[] | string;
    borderColor: any; //String or null
    data: number[];
}

@Component({
  selector: 'uni-dashboard',
  templateUrl: 'app/components/dashboard/dashboard.html',
})

export class Dashboard {

    public welcomeHidden: boolean = localStorage.getItem('welcomeHidden');
    public chartDataLoaded: boolean = localStorage.getItem('chartDataLoaded');
    public transactionList;

    constructor(private tabService: TabService) {
        this.tabService.addTab({ name: 'Dashboard', url: '/', active: true, moduleID: 0 });
        Chart.defaults.global.maintainAspectRatio = false;
        this.welcomeHidden = false;
        this.transactionList = [
            {
                user: 'Knut Knutsen',
                action: 'endret',
                module: 'faktura #154',
                time: 'for 2 timer siden'
            },
            {
                user: 'Hans Hansen',
                action: 'opprettet',
                module: 'bilag #5',
                time: 'for 8 timer siden'
            },
            {
                user: 'Jens Jensen',
                action: 'endret',
                module: 'Ordre #154',
                time: 'for 2 minutter siden'
            },
            {
                user: 'Petter Pettersen',
                action: 'slettet',
                module: 'ordre #94',
                time: 'for 1 dag siden'
            },
            {
                user: 'Anders Andersen',
                action: 'opprettet',
                module: 'faktura #155',
                time: 'for 4 timer siden'
            }
        ]
    }

    public ngAfterViewInit() {

        //INVOICED CHART
        var labels = ["March", "April", "May", "June"];
        var data: IChartDataSet = {
            data: [125000, 154000, 235000, 500000],
            label: 'Fakturert',
            backgroundColor: ['#7293cb'],
            borderColor: '#396bb1',
        }
        this.chartGenerator('invoicedChart', 'bar', data, labels)

        //OPERATING PROFIT/LOSS CHART
        labels = ['2013', '2014', '2015', '2016'];
        data = {
            label: 'Driftsresultat',
            backgroundColor: '#7293cb',
            borderColor: '#396bb1',
            data: [2125000, 3154000, 6235000, 4000000]
        } 
        this.chartGenerator('operating_chart', 'line', data, labels)

        //ASSETS CHART
        labels = ['Kontanter og bankinnskudd', 'Kortsiktige fordringer', 'Anleggsmidler', 'Varelager', 'Andre midler'];
        data = {
            data: [250000, 350000, 200000, 500000, 410000],
            label: '',
            backgroundColor: ['#7293cb', '#e1974c', '#84ba5b', '#d35e60', '#808585'],
            borderColor: null
        }
        this.chartGenerator('assets_chart', 'pie', data, labels)

    }

    public hideWelcome() {
        this.welcomeHidden = true;
        localStorage.setItem('welcomeHidden', 'true');
    }

    private buildChartData(rawData): IChartDataSet {
        return {
            label: 'Driftsresultat',
            backgroundColor: '#7293cb',
            borderColor: '#396bb1',
            data: [2125000, 3154000, 6235000, 4000000]
        }
    }

    private chartGenerator(elementID: string, chartType: string, chartData: any, labels: any[]) {
        let myElement = document.getElementById(elementID);
        let myChart = new Chart(myElement, {
            type: chartType,
            data: {
                labels: labels,
                datasets: [
                    {
                        data: chartData.data,
                        backgroundColor: chartData.backgroundColor,
                        label: chartData.label,
                        borderColor: chartData.borderColor
                    }
                ]
            }
        });
    }
}
