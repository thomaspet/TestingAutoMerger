import {Component} from '@angular/core';
import {TabService, UniModules} from '../layout/navbar/tabstrip/tabService';
import {IUniWidget} from '../widgets/widgetCanvas';
import {ToastService} from '../../../framework/uniToast/toastService';
import {CompanySettings} from '../../unientities';
import {
    ErrorService,
    CompanySettingsService
} from '../../services/services';

@Component({
    selector: 'timetracking-dashboard',
    template: `
        <uni-widget-canvas [defaultLayout]="widgetLayout"
                           [layoutName]="'timetracking'">
        </uni-widget-canvas>
    `,
})
export class TimetrackingDashboard {
    private widgetLayout: IUniWidget[] = [];
    private companySettings: CompanySettings;

    constructor(
        private tabService: TabService,
        private toastService: ToastService,
        private errorService: ErrorService,
        private companySettingsService: CompanySettingsService
    ) {
        this.tabService.addTab({
             name: 'Timer',
             url: '/timetracking',
             moduleID: UniModules.Timesheets,
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
                    label: 'Timearter',
                    description: 'Timearter',
                    icon: 'wagetype',
                    link: '/timetracking/worktypes'
                }
            },
            {
                width: 1,
                height: 1,
                x: 1,
                y: 0,
                widgetType: 'shortcut',
                config: {
                    label: 'Personer',
                    description: 'Personer',
                    icon: 'employee',
                    link: '/timetracking/workers'
                }
            },
            {
                width: 1,
                height: 1,
                x: 2,
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
                x: 3,
                y: 0,
                widgetType: 'shortcut',
                config: {
                    label: 'Rapporter',
                    description: 'Rapporter',
                    icon: '',
                    link: '/reports?category=timetracking',
                    letterForIcon: 'R',
                    letterIconClass: 'letterIconStyling'
                }
            },
            {
                width: 1,
                height: 1,
                x: 4,
                y: 0,
                widgetType: 'shortcut',
                config: {
                    label: 'Registrere',
                    description: 'Timeregistrering',
                    icon: 'hourreg',
                    link: '/timetracking/timeentry'
                }
            },
            {
                width: 3,
                height: 1,
                x: 5,
                y: 0,
                widgetType: 'clock',
                config: {
                    showSeconds: false,
                    dateColor: '#7698bd',
                }
            },
            // {
            //     width: 8,
            //     height: 3,
            //     x: 0,
            //     y: 1,
            //     widgetType: 'transaction', // TODO: enum
            //     config: {
            //         dashboard: 'Sale' // Identifyer for which fields to show.. fix while not dynamic
            //     }
            // },
            // {
            //     width: 2,
            //     height: 3,
            //     x: 8,
            //     y: 1,
            //     widgetType: 'shortcutlist',
            //     config: {
            //         header: 'Snarveier',
            //         shortcuts: [
            //             {
            //                 label: 'Kunder',
            //                 link: '/sales/customer',
            //                 urlToNew: '/sales/customer/0'
            //             },
            //             {
            //                 label: 'Produkter',
            //                 link: '/sales/products',
            //                 urlToNew: '/sales/products/0'
            //             },
            //             {
            //                 label: 'Purring',
            //                 link: '/sales/reminders/ready',
            //                 urlToNew: ''
            //             },
            //             {
            //                 label: 'Tilbud',
            //                 link: '/sales/quotes',
            //                 urlToNew: '/sales/quotes/0'
            //             },
            //             {
            //                 label: 'Ordre',
            //                 link: '/sales/orders',
            //                 urlToNew: '/sales/orders/0'
            //             },
            //             {
            //                 label: 'Faktura',
            //                 link: '/sales/invoices',
            //                 urlToNew: '/sales/invoices/0'
            //             },
            //         ]
            //     }
            // },
            {
                width: 2,
                height: 2,
                x: 4,
                y: 3,
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
                x: 2,
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
                x: 0,
                y: 3,
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
                width: 3,
                height: 2,
                x: 0,
                y: 1,
                widgetType: 'chart',
                config: {
                    header: 'Fordeling pr. timeart',
                    chartType: 'pie',
                    labels: [],
                    colors: [],
                    dataEndpoint: [
                        '/api/statistics?model=workitem&select=sum(minutes) as Sum,'
                        + 'worktype.Name as Name&expand=worktype'
                    ],
                    labelKey: 'Name',
                    valueKey: 'Sum',
                    maxNumberOfLabels: 7,
                    useIf: '',
                    addDataValueToLabel: false,
                    dataset: [],
                    options: {
                        cutoutPercentage: 80,
                        animation: {
                            animateScale: true
                        },
                        legend: {
                            position: 'bottom'
                        },
                    }
                }
            },
        ];
    }
}
