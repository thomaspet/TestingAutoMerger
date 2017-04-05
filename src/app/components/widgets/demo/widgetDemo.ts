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
                header: 'Driftsresultater',
                chartType: 'line',
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                colors: ['#84ba5b'],
                dataEndpoint: ['/api/statistics?model=JournalEntryLine&select=month(financialdate),sum(amount)&join=journalentryline.accountid eq account.id&filter=account.accountnumber ge 3000 and account.accountnumber le 9999 &range=monthfinancialdate'],
                dataKey: ['sumamount'],
                multiplyValue: -1,
                dataset: [],
                options: {
                    showLines: true,
                    animation: {
                        animateScale: true
                    },
                    legend: {
                        position: 'top'
                    }
                },
                title: ['Driftsresultat'],
                drilldown: false,
                chartID: 487515
            }
        },
    };

    constructor() {
        this.widgets = [
            JSON.parse(JSON.stringify(this.mockWidgets['shortcut']))
        ];
    }

    private addWidget(type: string) {
        // JSON stuff is a hack for making newWidget an actual new object
        // instead of a reference to the object in mockWidgets.
        // Because that caused x/y values to be equal for all widgets
        let newWidget = JSON.parse(JSON.stringify(this.mockWidgets[type]));
        this.widgetCanvas.addWidget(newWidget);
    }

}
