import {Directive, ViewContainerRef, Component, Input, ViewChild, ComponentFactoryResolver} from '@angular/core';

// Import known widgets. Loading third party stuff needs to be solved
// for all appfrontend, not just widgets.
import { Widget1, Widget2, Widget3, UniShortcutWidget, UniNotificationWidget, UniChartWidget, UniRSSWidget } from './widgets/barrel';

export interface IUniWidget {
    x?: number;
    y?: number;
    width: number;
    height: number;
    widgetType: string;
    config: any;
}


@Directive({
    selector: '[widget-container]'
})
export class WidgetContainer {
    constructor(public viewContainerRef: ViewContainerRef) {}
}

@Component({
    selector: 'uni-widget',
    template: `
        <template widget-container></template>
    `
})
export class UniWidget {
    @Input()
    public config: any; // type this

    @ViewChild(WidgetContainer)
    private widgetContainer: WidgetContainer;

    // This could be moved somewhere else?
    private widgetMap: any = {
        'widget1': Widget1,
        'widget2': Widget2,
        'widget3': Widget3,
        'shortcut': UniShortcutWidget,
        'notification': UniNotificationWidget,
        'chart': UniChartWidget,
        'rss': UniRSSWidget
    };

    constructor(private componentFactoryResolver: ComponentFactoryResolver) {}

    public ngOnChanges() {
        if (this.config) {
            this.loadWidget();
        }
    }

    private loadWidget() {
        const widget = this.widgetMap[this.config.widgetType];
        const componentFactory = this.componentFactoryResolver.resolveComponentFactory(widget);

        let viewContainerRef = this.widgetContainer.viewContainerRef;
        viewContainerRef.clear();

        let componentRef = viewContainerRef.createComponent(componentFactory);
        (<any>componentRef.instance).config = this.config.config;
    }

}
