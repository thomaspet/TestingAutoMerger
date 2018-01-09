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
                x: 3,
                y: 0,
                widgetType: 'shortcut',
                config: {
                    label: 'Kunder',
                    description: 'Kundeoversikt',
                    icon: 'customer',
                    link: '/sales/customer'
                }
            },
            {
                width: 1,
                height: 1,
                x: 4,
                y: 0,
                widgetType: 'shortcut',
                config: {
                    label: 'Produkter',
                    description: 'Produktoversikt',
                    icon: 'product',
                    link: '/sales/products'
                }
            },
            {
                width: 1,
                height: 1,
                x: 5,
                y: 0,
                widgetType: 'shortcut',
                config: {
                    label: 'Oversikt',
                    description: 'Oversikt',
                    icon: 'search',
                    link: '/overview'
                }
            },
            {
                width: 1,
                height: 1,
                x: 0,
                y: 0,
                widgetType: 'shortcut',
                config: {
                    label: 'Tilbud',
                    description: 'Tilbudsoversikt',
                    icon: '',
                    link: '/sales/quotes',
                    letterForIcon: 'T',
                    letterIconClass: 'letterIconStyling'
                }
            },
            {
                width: 1,
                height: 1,
                x: 1,
                y: 0,
                widgetType: 'shortcut',
                config: {
                    label: 'Ordre',
                    description: 'Ordreoversikt',
                    icon: '',
                    link: '/sales/orders',
                    letterForIcon: 'O',
                    letterIconClass: 'letterIconStyling'
                }
            },
            {
                width: 1,
                height: 1,
                x: 2,
                y: 0,
                widgetType: 'shortcut',
                config: {
                    label: 'Faktura',
                    description: 'Fakturaoversikt',
                    icon: '',
                    link: '/sales/invoices',
                    letterForIcon: 'F',
                    letterIconClass: 'letterIconStyling'
                }
            },
            {
                width: 2,
                height: 1,
                x: 6,
                y: 0,
                widgetType: 'sum',
                config: {
                    dataEndpoint: '/api/statistics?skip=0&top=50&model=CustomerInvoice&select=sum(CustomerInvoice.RestAmount) as '
                    + 'sum&filter=(CustomerInvoice.PaymentDueDate le \'getdate()\' )',
                    title: 'Forfalte ubetalte faktura',
                    description: 'Totalsum forfalte faktura',
                    positive: false,
                    link: '/sales/invoices?expanded=ticker&selected=null&filter=overdue_invoices'
                }
            },
            {
                width: 3,
                height: 1,
                x: 9,
                y: 0,
                widgetType: 'clock',
                config: {
                    showSeconds: false,
                    dateColor: '#7698bd',
                }
            },
            {
                width: 4,
                height: 3,
                x: 0,
                y: 4,
                widgetType: 'chart',
                config: {
                    header: 'Utestående per kunde',
                    chartType: 'pie',
                    labels: [],
                    colors: [],
                    dataEndpoint: [
                        '/api/statistics?model=Customer&select=Info.Name as Name,'
                        + 'isnull(sum(CustomerInvoices.RestAmount),0) as RestAmount'
                        + '&expand=Info,CustomerInvoices&having=sum(CustomerInvoices.RestAmount) gt 0'
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
                width: 4,
                height: 3,
                x: 4,
                y: 4,
                widgetType: 'topten',
                config: {
                    header: 'Kunder, 10 største',
                    contextMenuItems: [
                        {
                            label: 'Ny faktura',
                            link: '/sales/invoices/0;customerID=',
                            needsID: true
                        },
                        {
                            label: 'Ny ordre',
                            link: '/sales/orders/0;customerID=',
                            needsID: true
                        },
                        {
                            label: 'Nytt tilbud',
                            link: '/sales/quotes/0;customerID=',
                            needsID: true
                        }
                    ]
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
                x: 8,
                y: 1,
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
            {
                width: 2,
                height: 2,
                x: 10,
                y: 1,
                widgetType: 'infoshortcut', // TODO: enum
                config: {
                    header: 'Oversikt',
                    text: 'Alle dine data er kun et tastetrykk unna. Kraftig søk med filtreringsmuligheter',
                    link: '/overview',
                    externalLink: '',
                    imageLink: '../../../assets/info_shortcut_ticker_img.jpg',
                    title: 'Gå til oversikt'
                }
            },
            {
                width: 2,
                height: 2,
                x: 10,
                y: 3,
                widgetType: 'infoshortcut', // TODO: enum
                config: {
                    header: 'Opplæringsvideoer',
                    text: 'Se våre opplæringsvideoer slik at du blir god og trygg på Uni Economy',
                    link: '',
                    externalLink: 'http://app.cimple.no/unimicro/',
                    imageLink: '../../../assets/info_shortcut_movie_img.jpg',
                    title: ''
                }
            },
            {
                width: 2,
                height: 2,
                x: 10,
                y: 5,
                widgetType: 'infoshortcut', // TODO: enum
                config: {
                    header: 'Kundesenteret',
                    text: 'Besøk vårt kundesenter for tips og triks, nyttige datoer og annen info.',
                    link: '',
                    externalLink: 'https://unimicro.atlassian.net/servicedesk/customer/portal/3',
                    imageLink: '../../../assets/info_shortcut_bell_img.jpg',
                    title: ''
                }
            },
            {
                width: 2,
                height: 1,
                x: 8,
                y: 4,
                widgetType: 'currency', // TODO: enum
                config: {
                    dataEndpoint: '/api/biz/currencies?action=get-latest-currency-downloaded-date&downloadSource=1'
                }
            },
            {
                width: 2,
                height: 1,
                x: 8,
                y: 5,
                widgetType: 'sum',
                config: {
                    dataEndpoint: `/api/statistics?model=customerorder`
                    + `&select=sum(items.SumTotalExVat) as sum,count(id) as counter`
                    + `&filter=items.statuscode eq 41102 and (statuscode eq 41002 or statuscode eq 41003)&join=&expand=items`,
                    title: 'Ordrereserver',
                    description: 'Totalsum ordrereserver',
                    positive: true,
                    link: '/bureau/sales'
                }
            },
        ];
    }
}
