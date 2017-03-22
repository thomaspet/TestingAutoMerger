import {Component} from '@angular/core';

@Component({
    selector: 'uni-widget-canvas',
    templateUrl: './widgetCanvas.html'
})
export class UniWidgetCanvas {
    private widgetLayout: any = [{
        size: 'widget-small',
        config: {
            widgetName: 'widget1'
        }
    }];

    public addWidget(widgetName: string, size: string) {
        this.widgetLayout.push({
            size: size, // replace for more advanced layout stuff
            config: {
                widgetName: widgetName,
                // ...
            }
        });
    }
}
