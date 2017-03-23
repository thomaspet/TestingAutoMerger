import {Component} from '@angular/core';

@Component({
    selector: 'uni-widget-demo',
    templateUrl: './widgetDemo.html'
})
export class UniWidgetDemo {
    private widgets: any[] = []; // TODO: widget interface!

    //private dummyChartObject = {
    //    header: 'Monthly sale: HighChart Premium Deluxe',
    //    chartType: 'line',
    //    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    //    dataset: [
    //        {
    //            data: [58, 40, 80, 90, 72, 64, 80, 73, 50, 90, 108, 68],
    //            backgroundColor: 'red',
    //            label: 'B2B',
    //            borderColor: 'red',
    //            fill: false,
    //            showLine: true,
    //            pointHoverRadius: 2 
    //        },
    //        {
    //            data: [80, 73, 50, 90, 108, 68, 58, 40, 80, 90, 72, 64],
    //            backgroundColor: 'blue',
    //            label: 'B2C',
    //            borderColor: 'blue',
    //            fill: false,
    //            showLine: true,
    //            pointHoverRadius: 2
    //        }
    //    ],
    //    options: { pointRadius: 4 },
    //    title: 'Driftsresultat',
    //    drilldown: false,
    //    chartID: 487515
    //}

    private dummyChartObject = {
        header: 'Ansatte per avdeling',
        chartType: 'pie',
        labels: ['Utvikling', 'Salg', 'Konsulent', 'Kundeservice', 'Teknisk', 'Administrasjon'],
        dataset: [
            {
                data: [22, 8, 6, 16, 4, 10],
                backgroundColor: ['#7293cb', '#6b4c9a', '#e1974c', '#84ba5b', '#ff0000', '#ffff00'],
                label: 'Ansatte',
                borderColor: '#fff',
            }
        ],
        options: {
            cutoutPercentage: 50,
            animation: {
                animateScale: true
            },
            legend: {
                position: 'left'
            }
        },
        title: 'Driftsresultat',
        drilldown: false,
        chartID: 487515
    }

    private mockWidgets: any = {
        notification: {
            width: 1,
            height: 1,
            widgetType: 'notification', // TODO: enum
            config: {
                label: 'Varsler',
                description: 'Trenger tilsyn',
                icon: 'bell',
                link: '/sales/quotes',
                amount: 90,
                backgroundColor: '#dc9346'
            }
        },

        shortcut: {
            width: 1,
            height: 1,
            widgetType: 'shortcut', // TODO: enum
            config: {
                label: 'Tilbud',
                description: 'Tilbudsoversikt',
                icon: 'paperclip',
                link: '/sales/quotes'
            }
        }
    };

    constructor() {
        this.addWidget('shortcut');
    }

    private addWidget(type: string) {
        this.widgets.push(this.mockWidgets[type]);
        this.widgets = [...this.widgets];
    }

}
