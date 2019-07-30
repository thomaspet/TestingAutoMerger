import {Chart} from 'chart.js';

export class ChartHelper {
    public static generateChart(elementID: string, data: IChartDataSet) {
        if (data.chartType === 'bar') {
            this.generateBarChart(elementID, data);
        } else {
            this.generateLineChart(elementID, data);
        }
    }

    private static generateBarChart(elementID: string, data: IChartDataSet) {
        const element = document.getElementById(elementID);
        const chart = new Chart(<any> element, {
            type: 'bar',
            data: {
                labels: data.labels,
                datasets: data.datasets ? data.datasets : [
                    {
                        data: data.data,
                        label: data.label,
                        borderColor: data.borderColor,
                        fill: false,
                        lineTension: 0
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }

    private static generateLineChart(elementID: string, data: IChartDataSet) {
        const element = document.getElementById(elementID);
        const chart = new Chart(<any> element, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: data.datasets ? data.datasets : [
                    {
                        data: data.data,
                        label: data.label,
                        borderColor: data.borderColor,
                        fill: false,
                        lineTension: 0
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }
}

export interface IChartDataSet {
    label: string;
    labels: string[];
    chartType: string;
    backgroundColor: string[] | string;
    borderColor: string | null; // String or null
    data: number[];
    datasets: any[];
}
