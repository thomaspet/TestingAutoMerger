import {Component, ViewChild} from '@angular/core';
import {UniHttp} from '../../../framework/core/http/http';
import {YearService} from '../../services/services';
import {UniWidgetCanvas} from '../widgets/widgetCanvas';

import * as Chart from 'chart.js';
import {BrowserStorageService} from '@uni-framework/core/browserStorageService';

export interface IChartDataSet {
    label: string;
    labels: string[];
    chartType: string;
    backgroundColor: string[] | string;
    borderColor: any; // String or null
    data: number[];
}

@Component({
    selector: 'uni-dashboard',
    templateUrl: './dashboard.html'
})
export class Dashboard {
    @ViewChild(UniWidgetCanvas)
    public widgetCanvas: UniWidgetCanvas;

    public welcomeHidden: boolean = this.browserStorage.getItem('welcomeHidden');
    private layout: any[] = [];
    private activeYear: number;

    constructor(
        private http: UniHttp,
        private yearService: YearService,
        private browserStorage: BrowserStorageService,
    ) {
        // Avoid compile error. Seems to be something weird with the chart.js typings file
        (<any> Chart).defaults.global.maintainAspectRatio = false;
        // this.layout = this.initLayout();

        this.yearService.selectedYear$.subscribe(year => {
            this.activeYear = year;
            this.layout = this.initLayout();
        });
    }


    public initLayout() {
        return [
            {
                width: 1,
                height: 1,
                x: 0,
                y: 0,
                widgetType: 'shortcut',
                config: {
                    label: 'Regnskap',
                    description: 'Regnskap',
                    icon: 'accounting',
                    link: '/accounting'
                }
            },
            {
                width: 1,
                height: 1,
                x: 1,
                y: 0,
                widgetType: 'shortcut',
                config: {
                    label: 'Salg',
                    description: 'Salg',
                    icon: 'sale',
                    link: '/sales'
                }
            },
            {
                width: 1,
                height: 1,
                x: 2,
                y: 0,
                widgetType: 'shortcut',
                config: {
                    label: 'Lønn',
                    description: 'Lønn',
                    icon: 'payroll',
                    link: '/salary'
                }
            },
            {
                width: 1,
                height: 1,
                x: 3,
                y: 0,
                widgetType: 'shortcut',
                config: {
                    label: 'Bank',
                    description: 'Bank',
                    icon: 'bank',
                    link: '/bank'
                }
            },
            {
                width: 1,
                height: 1,
                x: 4,
                y: 0,
                widgetType: 'shortcut',
                config: {
                    label: 'Timer',
                    description: 'Timeføring',
                    icon: 'hourreg',
                    link: '/timetracking/dashboard'
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
                width: 3,
                height: 1,
                x: 6,
                y: 0,
                widgetType: 'clock',
                config: {
                    dateColor: '#7698bd',
                    showSeconds: false
                }
            },
            {
                width: 2,
                height: 1,
                x: 9,
                y: 0,
                widgetType: 'companyLogo',
                config: {}
            },
            {
                width: 1,
                height: 1,
                x: 8,
                y: 1,
                widgetType: 'counter', // TODO: enum
                config: {
                    label: 'Epost',
                    description: 'Antall eposter i innboks',
                    icon: 'letter',
                    link: '/accounting/bills?filter=Inbox',
                    dataEndpoint: '/api/biz/filetags/IncomingMail/0?action=get-supplierInvoice-inbox-count',
                    valueKey: null,
                    amount: 0,
                    class: 'uni-widget-notification-orange'
                }
            },
            {
                width: 1,
                height: 1,
                x: 9,
                y: 1,
                widgetType: 'counter', // TODO: enum
                config: {
                    label: 'EHF',
                    description: 'Antall EHFer i innboks',
                    icon: 'ehf',
                    link: '/accounting/bills?filter=Inbox',
                    dataEndpoint: '/api/biz/filetags/IncomingEHF/0?action=get-supplierInvoice-inbox-count',
                    valueKey: null,
                    amount: 0,
                    class: 'uni-widget-notification-orange'
                }
            },
            {
                width: 1,
                height: 1,
                x: 10,
                y: 1,
                widgetType: 'counter', // TODO: enum
                config: {
                    label: 'Tildelte',
                    description: 'Tildelte faktura',
                    icon: 'pdf',
                    link: '/accounting/bills?filter=ForApproval&page=1',
                    dataEndpoint: '/api/statistics/?model=SupplierInvoice&select=count(ID) as '
                        + 'count&filter=( isnull(deleted,0) eq 0 ) and ( statuscode eq 30102 )',
                    valueKey: 'Data[0].count',
                    amount: 0,
                    class: 'uni-widget-notification-orange'
                }
            },
            {
                width: 1,
                height: 1,
                x: 11,
                y: 1,
                widgetType: 'counter', // TODO: enum
                config: {
                    label: 'Varsler',
                    description: 'Uleste varlser',
                    icon: 'notification',
                    link: '/',
                    dataEndpoint: '/api/biz/notifications?action=count',
                    valueKey: 'Count',
                    class: 'uni-widget-notification-lite-blue'
                }
            },
            {
                width: 2,
                height: 1,
                x: 8,
                y: 2,
                widgetType: 'flex', // TODO: enum
                config: {}
            },
            {
                width: 2,
                height: 1,
                x: 10,
                y: 2,
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
                width: 4,
                height: 3,
                x: 0,
                y: 1,
                widgetType: 'chart',
                config: {
                    header: `Driftsresultater (${this.activeYear})`,
                    chartType: 'line',
                    labels: ['Jan', '', '', 'Apr', '', '', 'Jul', '', 'Sep', '', '', 'Dec'],
                    colors: ['#7293cb'],
                    backgroundColors: ['transparent'],
                    dataEndpoint: ['/api/statistics?model=JournalEntryLine&select=month(financialdate),'
                        + 'sum(amount)&join=journalentryline.accountid eq account.id&filter=year(financialdate) '
                        + 'eq <year> and account.accountnumber ge 3000 and account.accountnumber le 9999 '
                        + '&range=monthfinancialdate'
                    ],
                    dataKey: ['sumamount'],
                    multiplyValue: -1,
                    dataset: [],
                    fill: 'none',
                    options: {
                        showLines: true,
                        bezierCurve: false
                    },
                    title: ['Driftsresultat']
                }
            },
            {
                width: 4,
                height: 3,
                x: 4,
                y: 1,
                widgetType: 'kpi',
                config: {
                    header: `Nøkkeltall (${this.activeYear})`
                }
            },
            {
                width: 4,
                height: 3,
                x: 0,
                y: 4,
                widgetType: 'chart',
                config: {
                    header: 'Ansatte per stillingskode',
                    chartType: 'pie',
                    labels: [],
                    colors: [],
                    dataEndpoint: [
                        '/api/statistics?model=Employee&select=count(ID) as '
                        + 'Count,Employments.JobName as JobName&expand=Employments'
                    ],
                    labelKey: 'JobName',
                    valueKey: 'Count',
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

            {
                width: 4,
                height: 3,
                x: 4,
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
            }
        ];


    }
}
