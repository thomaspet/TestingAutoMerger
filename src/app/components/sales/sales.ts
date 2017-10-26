import {Component} from '@angular/core';
import {TabService, UniModules} from '../layout/navbar/tabstrip/tabService';
import {IUniWidget} from '../widgets/widgetCanvas';
import {ToastService} from '../../../framework/uniToast/toastService';
import {CompanySettings} from '../../unientities';
import {
    ErrorService,
    EHFService,
    CompanySettingsService
} from '../../services/services';

@Component({
    selector: 'uni-sales',
    template: `
        <uni-widget-canvas [defaultLayout]="widgetLayout"
                           [layoutName]="'sales'">
        </uni-widget-canvas>
    `,
})
export class UniSales {
    private widgetLayout: IUniWidget[] = [];
    private companySettings: CompanySettings;

    constructor(
        private tabService: TabService,
        private toastService: ToastService,
        private errorService: ErrorService,
        private ehfService: EHFService,
        private companySettingsService: CompanySettingsService
    ) {
        this.tabService.addTab({
             name: 'Salg',
             url: '/sales',
             moduleID: UniModules.Sales,
             active: true
        });

        this.companySettingsService.Get(1).subscribe((settings) => {
            this.companySettings = settings;
            this.widgetLayout = this.getDefaultLayout();
        });
    }

    private getDefaultLayout(): IUniWidget[] {
        return [
            {
                width: 1,
                height: 1,
                x: 0,
                y: 0,
                widgetType: 'shortcut',
                config: {
                    label: 'Kunder',
                    description: 'Kundeoversikt',
                    icon: '',
                    link: '/sales/customer'
                }
            },
            {
                width: 1,
                height: 1,
                x: 1,
                y: 0,
                widgetType: 'shortcut',
                config: {
                    label: 'Produkter',
                    description: 'Produktoversikt',
                    icon: '',
                    link: '/sales/products'
                }
            },
            {
                width: 1,
                height: 1,
                x: 2,
                y: 0,
                widgetType: 'shortcut',
                config: {
                    label: 'Tilbud',
                    description: 'Tilbudsoversikt',
                    icon: '',
                    link: '/sales/quotes'
                }
            },
            {
                width: 1,
                height: 1,
                x: 3,
                y: 0,
                widgetType: 'shortcut',
                config: {
                    label: 'Ordre',
                    description: 'Ordreoversikt',
                    icon: '',
                    link: '/sales/orders'
                }
            },
            {
                width: 1,
                height: 1,
                x: 4,
                y: 0,
                widgetType: 'shortcut',
                config: {
                    label: 'Faktura',
                    description: 'Fakturaoversikt',
                    icon: '',
                    link: '/sales/invoices'
                }
            },

            {
                width: 1,
                height: 1,
                x: 5,
                y: 0,
                widgetType: 'shortcut',
                config: {
                    label: 'Prosjekt',
                    description: 'Prosjektmodul',
                    icon: '',
                    link: '/dimensions/projects/overview'
                }
            },

            {
                width: 1,
                height: 1,
                x: 6,
                y: 0,
                widgetType: 'shortcut',
                config: {
                    label: 'Purring',
                    description: 'Purring',
                    icon: '',
                    link: '/sales/reminders/ready'
                }
            },

            {
                width: 2,
                height: 1,
                x: 7,
                y: 0,
                widgetType: 'overdue',
                config: {}
            },
            {
                width: 4,
                height: 3,
                x: 8,
                y: 1,
                widgetType: 'chart',
                config: {
                    header: 'Utestående per kunde',
                    chartType: 'pie',
                    labels: [],
                    colors: [],
                    dataEndpoint: [
                        '/api/statistics?model=Customer&select=Info.Name as Name,isnull(sum(CustomerInvoices.RestAmount),0) as RestAmount&expand=Info,CustomerInvoices&having=sum(CustomerInvoices.RestAmount) gt 0'
                    ],
                    valueKey: 'RestAmount',
                    labelKey: 'Name',
                    maxNumberOfLabels: 7,
                    useIf: '',
                    addDataValueToLabel: false,
                    dataset: [],
                    options: {
                        animation: {
                            animateScale: true
                        },
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            },
            {
                width: 8,
                height: 3,
                x: 0,
                y: 1,
                widgetType: 'transaction', // TODO: enum
                config: {
                    dashboard: 'Sale' // Identifyer for which fields to show.. fix while not dynamic
                }
            },
            {
                width: 2,
                height: 3,
                x: 0,
                y: 4,
                widgetType: 'shortcutlist',
                config: {
                    header: 'Snarveier',
                    shortcuts: [
                        {
                            label: 'Kunder',
                            link: '/sales/customer',
                            urlToNew: '/sales/customer/0'
                        },
                        {
                            label: 'Produkter',
                            link: '/sales/products',
                            urlToNew: '/sales/products/0'
                        },
                        {
                            label: 'Purring',
                            link: '/sales/reminders/ready',
                            urlToNew: ''
                        },
                        {
                            label: 'Tilbud',
                            link: '/sales/quotes',
                            urlToNew: '/sales/quotes/0'
                        },
                        {
                            label: 'Ordre',
                            link: '/sales/orders',
                            urlToNew: '/sales/orders/0'
                        },
                        {
                            label: 'Faktura',
                            link: '/sales/invoices',
                            urlToNew: '/sales/invoices/0'
                        },
                    ]
                }
            },
        ];
    }
}
