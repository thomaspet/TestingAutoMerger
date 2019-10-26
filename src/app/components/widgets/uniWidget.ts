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
} from '@angular/core';

// Import known widgets. Loading third party stuff needs to be solved
// for all appfrontend, not just widgets.
import {
    UniShortcutWidget,
    UniChartWidget,
    UniClockWidget,
    UniCompanyLogoWidget,
    UniSumWidget,
    UniFlexWidget,
    UniTransactionsWidget,
    UniShortcutListWidget,
    UniCurrencyWidget,
    TopTenCustomersWidget,
    UniIntegrationCounterWidget,
    InvoicedWidget,
    UniUnpaidDoughnutChart,
    TimetrackingCalendar,
    OperatingProfitWidget,
    KpiWidget,
    UniReportListWidget,
    UniEventsWidget,
    UniTimetrackingCharts,
    AssignmentsWidget,
    ExpensesWidget,
    BalanceWidget,
    SRUnpaidDoughnutChart,
    OverdueInvoicesWidget,
    ReminderListWidget,
    PaymentWidget,
    PublicDueDatesWidget
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

// CUSTOM SR WIDGET MAP??? :ANDERS??
export const WIDGET_MAP = {
    shortcuts: UniShortcutWidget,
    chart: UniChartWidget,
    clock: UniClockWidget,
    sum: UniSumWidget,
    companyLogo: UniCompanyLogoWidget,
    flex: UniFlexWidget,
    transaction: UniTransactionsWidget,
    shortcutlist: UniShortcutListWidget,
    currency: UniCurrencyWidget,
    topTenCustomers: TopTenCustomersWidget,
    integrationCounter: UniIntegrationCounterWidget,
    invoiced: InvoicedWidget,
    unpaid: UniUnpaidDoughnutChart,
    unpaidsr: SRUnpaidDoughnutChart,
    timetracking_calendar: TimetrackingCalendar,
    operatingprofit: OperatingProfitWidget,
    kpi: KpiWidget,
    reportlist: UniReportListWidget,
    event: UniEventsWidget,
    ttchart: UniTimetrackingCharts,
    assignments: AssignmentsWidget,
    expenses: ExpensesWidget,
    balance: BalanceWidget,
    overdue_invoices: OverdueInvoicesWidget,
    reminderList: ReminderListWidget,
    payment_chart: PaymentWidget,
    public_duedates: PublicDueDatesWidget
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
