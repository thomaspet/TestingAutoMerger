import {Component} from '@angular/core';

@Component({
    selector: 'uni-widget-demo',
    templateUrl: './widgetDemo.html'
})
export class UniWidgetDemo {
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
