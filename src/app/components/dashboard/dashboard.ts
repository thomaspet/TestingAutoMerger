/// <reference path="../../../../typings/modules/chart.js/index.d.ts" />
import {Component, ViewChild} from '@angular/core';
import {TabService, UniModules} from '../layout/navbar/tabstrip/tabService';
import {UniHttp} from '../../../framework/core/http/http';
import {Router} from '@angular/router';
import {ErrorService, CompanySettingsService} from '../../services/services';
import {AuthService} from '../../../framework/core/authService';
import {WidgetDataService} from '../widgets/widgetDataService';
import {UniWidgetCanvas} from '../widgets/widgetCanvas';

import * as Chart from 'chart.js';

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
    private widgetCanvas: UniWidgetCanvas;

    public welcomeHidden: boolean = JSON.parse(localStorage.getItem('welcomeHidden'));
    private widgets: any[] = [];

    constructor(
        private tabService: TabService,
        private http: UniHttp,
        private router: Router,
        private errorService: ErrorService,
        private authService: AuthService,
        private companySettingsService: CompanySettingsService,
        private widgetDataService: WidgetDataService
    ) {
        this.tabService.addTab({ name: 'Nøkkeltall', url: '/', active: true, moduleID: UniModules.Dashboard });

        // Avoid compile error. Seems to be something weird with the chart.js typings file
        (<any> Chart).defaults.global.maintainAspectRatio = false;

        this.authService.companyChange
            .subscribe(change => {
                this.widgetCanvas.refreshWidgets();
            });

        this.widgets = this.fakeLayout();
    }

    public fakeLayout() {
        return [
            {
                width: 1,
                height: 1,
                x: 0,
                y: 0,
                widgetType: 'shortcut', // TODO: enum
                config: {
                    label: 'TILBUD',
                    description: 'Tilbudsoversikt',
                    icon: 'paperclip',
                    link: '/sales/quotes'
                }
            },
            {
                width: 1,
                height: 1,
                x: 1,
                y: 0,
                widgetType: 'shortcut', // TODO: enum
                config: {
                    label: 'ORDRE',
                    description: 'Ordreoversikt',
                    icon: 'chat',
                    link: '/sales/orders'
                }
            },
            {
                width: 1,
                height: 1,
                x: 2,
                y: 0,
                widgetType: 'shortcut', // TODO: enum
                config: {
                    label: 'FAKTURA',
                    description: 'Fakturaoversikt',
                    icon: 'globe',
                    link: '/sales/invoices'
                }
            },
            {
                width: 1,
                height: 1,
                x: 3,
                y: 0,
                widgetType: 'shortcut', // TODO: enum
                config: {
                    label: 'KUNDER',
                    description: 'Kundeoversikt',
                    icon: 'user',
                    link: '/sales/customer'
                }
            },
            {
                width: 1,
                height: 1,
                x: 4,
                y: 0,
                widgetType: 'shortcut', // TODO: enum
                config: {
                    label: 'TIMER',
                    description: 'Timeføring',
                    icon: 'calender',
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
                    dateColor: '#7698bd',
                    showSeconds: true
                }
            },
            {
                width: 1,
                height: 1,
                x: 8,
                y: 4,
                widgetType: 'notification', // TODO: enum
                config: {
                    label: 'epost',
                    description: 'Uleste eposter',
                    icon: 'globe',
                    link: '/sales/quotes',
                    endpoint: '',
                    amount: 14,
                    class: 'uni-widget-notification-orange'
                }
            },
            {
                width: 1,
                height: 1,
                x: 9,
                y: 4,
                widgetType: 'notification', // TODO: enum
                config: {
                    label: 'ehf',
                    description: 'Uleste eposter',
                    icon: 'bell',
                    link: '/sales/quotes',
                    endpoint: '',
                    amount: 3,
                    class: 'uni-widget-notification-orange'
                }
            },
            {
                width: 1,
                height: 1,
                x: 10,
                y: 4,
                widgetType: 'notification', // TODO: enum
                config: {
                    label: 'pdf',
                    description: 'Uleste eposter',
                    icon: 'search',
                    link: '/sales/quotes',
                    endpoint: '',
                    amount: 9,
                    class: 'uni-widget-notification-orange'
                }
            },
            {
                width: 1,
                height: 1,
                x: 11,
                y: 4,
                widgetType: 'notification', // TODO: enum
                config: {
                    label: 'utlegg',
                    description: 'Uleste eposter',
                    icon: 'paperclip',
                    link: '/sales/quotes',
                    endpoint: '',
                    amount: 21,
                    class: 'uni-widget-notification-orange'
                }
            },
            {
                width: 1,
                height: 1,
                x: 8,
                y: 5,
                widgetType: 'notification', // TODO: enum
                config: {
                    label: 'varsler',
                    description: 'Uleste eposter',
                    icon: 'bell',
                    link: '/sales/quotes',
                    endpoint: '',
                    amount: 6,
                    class: 'uni-widget-notification-lite-blue'
                }
            },
            {
                width: 1,
                height: 1,
                x: 9,
                y: 5,
                widgetType: 'notification', // TODO: enum
                config: {
                    label: 'utlegg',
                    description: 'Uleste eposter',
                    icon: 'paperclip',
                    link: '/sales/quotes',
                    amount: 1,
                    class: 'uni-widget-notification-lite-blue'
                }
            },
            {
                width: 4,
                height: 3,
                x: 0,
                y: 1,
                widgetType: 'chart',
                config: {
                    header: 'Driftsresultater',
                    chartType: 'line',
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                    colors: ['#ab6857'],
                    dataEndpoint: ['/api/statistics?model=JournalEntryLine&select=month(financialdate),sum(amount)&join=journalentryline.accountid eq account.id&filter=account.accountnumber ge 3000 and account.accountnumber le 9999 &range=monthfinancialdate'],
                    dataKey: ['sumamount'],
                    multiplyValue: -1,
                    dataset: [],
                    options: {
                        showLines: true,
                        animation: {
                            animateScale: true
                        },
                        legend: {
                            position: 'top'
                        }
                    },
                    title: ['Driftsresultat'],
                    drilldown: false,
                    chartID: 487515
                }
            },
            //{
            //    width: 4,
            //    height: 3,
            //    x: 4,
            //    y: 1,
            //    widgetType: 'chart',
            //    config: {
            //        header: 'Tilbud, ordre og faktura - 2016',
            //        chartType: 'bar',
            //        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            //        colors: ['#7293cb', '#e1974c', '#84ba5b'],
            //        dataEndpoint: ['/api/statistics?model=CustomerQuote&select=sum(TaxExclusiveAmount),month(QuoteDate),year(QuoteDate)&range=monthquotedate', '/api/statistics?model=CustomerOrder&select=sum(TaxExclusiveAmount),month(OrderDate),year(OrderDate)&range=monthorderdate', '/api/statistics?model=CustomerInvoice&select=sum(TaxExclusiveAmount),month(InvoiceDate),year(InvoiceDate)&filter=month(invoicedate) ge 1 and year(invoicedate) eq 2016&range=monthinvoicedate'],
            //        dataKey: ['sumTaxExclusiveAmount', 'sumTaxExclusiveAmount', 'sumTaxExclusiveAmount'],
            //        multiplyValue: 1,
            //        dataset: [],
            //        options: {},
            //        title: ['Tilbud', 'Ordre', 'Faktura'],
            //        drilldown: false,
            //        chartID: 458751
            //    }
            //},
            {
                width: 4,
                height: 3,
                x: 4,
                y: 1,
                widgetType: 'tripleVertical',
                config: {
                    header: 'Nøkkeltall'
                }
            },
            {
                width: 4,
                height: 3,
                x: 0,
                y: 4,
                widgetType: 'chart',
                config: {
                    header: 'Antall ansatte per stilling',
                    chartType: 'pie',
                    labels: [],
                    colors: [],
                    dataEndpoint: ['/api/statistics?skip=0&top=50&model=Employee&select=Employee.ID as EmployeeID,BusinessRelationInfo.Name as BusinessRelationInfoName,Employments.JobName as EmploymentsJobName,Employments.Standard as EmploymentsStandard&expand=BusinessRelationInfo,Employments&distinct=false'],
                    dataKey: ['EmploymentsJobName'],
                    maxNumberOfLabels: 7,
                    useIf: 'EmploymentsStandard',
                    addDataValueToLabel: true, //Only recommended if you are using tooltips callback
                    dataset: [],
                    options: {
                        cutoutPercentage: 85,
                        animation: {
                            animateScale: true
                        },
                        legend: {
                            position: 'left'
                        },
                        tooltips: {
                            callbacks: {
                                label: (item, data) => {
                                    let total = data.datasets[item.datasetIndex].data.reduce((previousValue, currentValue) => { return previousValue + currentValue });
                                    let currentValue = data.datasets[item.datasetIndex].data[item.index];
                                    return Math.floor(((currentValue / total) * 100) + 0.5) + "%";
                                }
                            }
                        },
                    },
                    title: [],
                    drilldown: false,
                    chartID: 845715
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
                    dataEndpoint: ['/api/statistics?skip=0&top=50&model=Customer&select=Info.Name as InfoName,CustomerInvoices.RestAmount as CustomerInvoicesRestAmount,CustomerInvoices.TaxExclusiveAmount as CustomerInvoicesTaxExclusiveAmount,CustomerInvoices.StatusCode as CustomerInvoicesStatusCode&expand=Info,CustomerInvoices&distinct=false'],
                    dataKey: ['InfoName', 'CustomerInvoicesRestAmount'],
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
                    },
                    title: [],
                    drilldown: false,
                    chartID: 845721
                }
            },
            // {
            //     width: 4,
            //     height: 4,
            //     x: 8,
            //     y: 0,
            //     widgetType: 'rss',
            //     config: {
            //         header: 'Nyheter fra kundesenteret',
            //         dataEndpoint: "/api/biz/rss/1",
            //         RSSType: 1 // DOCUMENTATION: https://unimicro.atlassian.net/wiki/pages/viewpage.action?spaceKey=UE&title=RssListe
            //     }
            // },
            {
                width: 4,
                height: 3,
                x: 8,
                y: 1,
                widgetType: 'list',
                config: {
                    header: 'Siste transaksjoner',
                    dataEndPoint: "/api/statistics?model=AuditLog&select=id,entitytype,entityid,field,User.displayname,createdat,updatedat&filter=field eq 'updatedby' and ( not contains(entitytype,'item') ) &join=auditlog.createdby eq user.globalidentity&top=10&orderby=id desc",
                    listItemKeys: {
                        username: 'UserDisplayName',
                        module: 'AuditLogEntityType',
                        action: 'AuditLogField',
                        moduleID: 'AuditLogEntityID',
                        time: 'AuditLogCreatedAt'
                    }
                }
            },
            {
                width: 2,
                height: 1,
                widgetType: 'companyLogo',
                config: {}
            }
        ];


    }
}
