import {
    Directive,
    ViewContainerRef,
    Component,
    Input,
    Output,
    EventEmitter,
    ViewChild,
    ComponentFactoryResolver,
    ComponentRef,
    ChangeDetectionStrategy,
    ChangeDetectorRef
} from '@angular/core';

// Import known widgets. Loading third party stuff needs to be solved
// for all appfrontend, not just widgets.
import {
    UniCountersWidget,
    UniKpiWidget,
    UniShortcutWidget,
    UniChartWidget,
    UniRSSWidget,
    UniClockWidget,
    UniCompanyLogoWidget,
    UniSumWidget,
    UniFlexWidget,
    UniTransactionsWidget,
    UniShortcutListWidget,
    UniInfoShortcutWidget,
    UniCurrencyWidget,
    UniTopTenWidget,
    UniIntegrationCounterWidget,
    UniOperatingProfitWidget
} from './widgets/barrel';

export interface IUniWidget {
    id: string;
    permissions?: string[];
    description?: string;
    x?: number;
    y?: number;
    width: number;
    height: number;
    widgetType: string;
    alwaysVisible?: boolean;
    config?: any;
    _editMode?: boolean;
    _position?: {
        top?: number;
        left?: number;
        width?: number;
        height?: number;
    };
}

export const WIDGET_MAP = {
    counters: UniCountersWidget,
    overview: UniKpiWidget,
    shortcuts: UniShortcutWidget,
    chart: UniChartWidget,
    rss: UniRSSWidget,
    clock: UniClockWidget,
    sum: UniSumWidget,
    companyLogo: UniCompanyLogoWidget,
    flex: UniFlexWidget,
    transaction: UniTransactionsWidget,
    shortcutlist: UniShortcutListWidget,
    infoshortcut: UniInfoShortcutWidget,
    currency: UniCurrencyWidget,
    topten: UniTopTenWidget,
    integrationCounter: UniIntegrationCounterWidget,
    operatingprofit: UniOperatingProfitWidget
};

@Directive({
    selector: '[widget-container]'
})
export class WidgetContainer {
    constructor(public viewContainerRef: ViewContainerRef) {}
}

@Component({
    selector: 'uni-widget',
    template: `
        <ng-template widget-container></ng-template>
        <button class="widget-remove-btn"
                (click)="removeWidget()"
                *ngIf="widget?._editMode && !widget.alwaysVisible">
            Remove
        </button>
    `
})
export class UniWidget {
    @ViewChild(WidgetContainer)
    private widgetContainer: WidgetContainer;

    @Input()
    public widget: IUniWidget;

    @Output()
    public widgetRemoved: EventEmitter<IUniWidget> = new EventEmitter();

    private widgetComponent: ComponentRef<any>;

    constructor(private factoryResolver: ComponentFactoryResolver) {}

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
        const widget = WIDGET_MAP[this.widget.widgetType];
        const componentFactory = this.factoryResolver.resolveComponentFactory(widget);

        const viewContainerRef = this.widgetContainer.viewContainerRef;
        viewContainerRef.clear();

        this.widgetComponent = viewContainerRef.createComponent(componentFactory);
        this.widgetComponent.instance.widget = this.widget;
    }

    public removeWidget() {
        this.widgetRemoved.next(this.widget);
    }
}
