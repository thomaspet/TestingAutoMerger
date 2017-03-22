import {Component} from '@angular/core';

@Component({
    selector: 'uni-widget-canvas',
    templateUrl: './widgetCanvas.html'
})
export class UniWidgetCanvas {
    private widgetLayout: any = [{
        size: 'widget-small',
        tileData: {
            name: 'Tilbud',
            title: 'Tilbudsoversikt',
            icon: 'paperclip',
            link: '/sales/quotes'
        },
        config: {
            widgetName: 'widget1'
        }
    }, {
        size: 'widget-small',
        tileData: {
            name: 'varsler',
            title: 'Trenger tilsyn',
            icon: 'bell',
            link: '/sales/quotes',
            ammount: 90,
            backgroundColor: '#dc9346'
        },
        config: {
            widgetName: 'widget1'
        }
    }];

    public addWidget(widgetName: string, size: string) {
        this.widgetLayout.push({
            size: size, // replace for more advanced layout stuff
            config: {
                widgetName: widgetName,
                tileData: {
                    name: 'Tilbud',
                    title: 'Tilbudsoversikt',
                    icon: 'paperclip',
                    link: '/sales/quotes'
                },
                // ...
            }
        });
    }
}
