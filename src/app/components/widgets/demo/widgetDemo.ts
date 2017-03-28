import {Component, ViewChild} from '@angular/core';
import {UniWidgetCanvas} from '../widgetCanvas';

@Component({
    selector: 'uni-widget-demo',
    templateUrl: './widgetDemo.html'
})
export class UniWidgetDemo {
    @ViewChild(UniWidgetCanvas)
    private widgetCanvas: UniWidgetCanvas;

    private widgets: any[] = []; // TODO: widget interface!

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
                class: 'uni-widget-notification-orange'
            }
        },

        rss: {
            width: 4,
            height: 4,
            widgetType: 'rss', // TODO: enum
            config: {
                header: 'Nyheter fra kundesenteret',
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
        },

        chart: {
            width: 4,
            height: 3,
            widgetType: 'chart',
            config: {
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
                    cutoutPercentage: 85,
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
        }
    };

    constructor() {
        this.addWidget('shortcut');
    }

    public onWidgetsChange(widgets) {
        this.widgets = widgets;
    }

    private addWidget(type: string) {
        // JSON stuff is a hack for making newWidget an actual new object
        // instead of a reference to the object in mockWidgets.
        // Because that caused x/y values to be equal for all widgets
        let newWidget = JSON.parse(JSON.stringify(this.mockWidgets[type]));
        this.widgets = [...this.widgets, newWidget];
    }

}
