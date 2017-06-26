import * as Chart from 'chart.js';
export class ChartHelper {
    public static generateChart(elementID: string, data: IChartDataSet) {
        if (data.chartType === 'bar') {
            this.generateBarChart(elementID, data);
        } else {
            this.generateLineChart(elementID, data);
        }
    }

    private static generateBarChart(elementID: string, data: IChartDataSet) {
        let element = document.getElementById(elementID);
        let chart = Chart.Bar(<any> element, {
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
        let element = document.getElementById(elementID);
        let chart = Chart.Line(<any> element, {
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
    borderColor: any; // String or null
    data: number[];
    datasets: any[];
}
