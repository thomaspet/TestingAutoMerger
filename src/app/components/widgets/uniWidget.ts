import {
    Directive,
    ViewContainerRef,
    Component,
    Input,
    ViewChild,
    ComponentFactoryResolver,
    ComponentRef
} from '@angular/core';

// Import known widgets. Loading third party stuff needs to be solved
// for all appfrontend, not just widgets.
import {
    UniShortcutWidget,
    UniNotificationWidget,
    UniChartWidget,
    UniRSSWidget,
    UniListWidget,
    UniClockWidget
} from './widgets/barrel';

export interface IUniWidget {
    x?: number;
    y?: number;
    width: number;
    height: number;
    widgetType: string;
    config: any;
    _editMode?: boolean;
    _position?: {
        top?: number;
        left?: number;
        width?: number;
        height?: number;
    };
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
    public widget: IUniWidget;

    @ViewChild(WidgetContainer)
    private widgetContainer: WidgetContainer;

    // This could be moved somewhere else?
    private widgetMap: any = {
        'shortcut': UniShortcutWidget,
        'notification': UniNotificationWidget,
        'chart': UniChartWidget,
        'rss': UniRSSWidget,
        'list': UniListWidget,
        'clock': UniClockWidget
    };

    private widgetComponent: ComponentRef<any>;

    constructor(private componentFactoryResolver: ComponentFactoryResolver) {}

    public ngOnChanges() {
        if (this.widget) {
            this.loadWidget();
        }
    }

    public setEditMode(editMode) {
        this.widget._editMode = editMode;
        this.widgetComponent.instance.widget = this.widget;
    }

    private loadWidget() {
        const widget = this.widgetMap[this.widget.widgetType];
        const componentFactory = this.componentFactoryResolver.resolveComponentFactory(widget);

        let viewContainerRef = this.widgetContainer.viewContainerRef;
        viewContainerRef.clear();

        this.widgetComponent = viewContainerRef.createComponent(componentFactory);
        this.widgetComponent.instance.widget = this.widget;
    }

}
