/// <reference path="../../../../typings/modules/chart.js/index.d.ts" />
import {Component, ViewChild} from '@angular/core';
import {TabService, UniModules} from '../layout/navbar/tabstrip/tabService';
import {UniHttp} from '../../../framework/core/http/http';
import {Router} from '@angular/router';
import {ErrorService, CompanySettingsService} from '../../services/services';
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
        private companySettingsService: CompanySettingsService,
    ) {
        this.tabService.addTab({ name: 'Skrivebord', url: '/', active: true, moduleID: UniModules.Dashboard });

        // Avoid compile error. Seems to be something weird with the chart.js typings file
        (<any> Chart).defaults.global.maintainAspectRatio = false;
        this.widgets = this.initLayout();
    }

    public initLayout() {
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
                widgetType: 'counter', // TODO: enum
                config: {
                    label: 'innboks',
                    description: 'Uleste eposter',
                    icon: 'home',
                    link: '/accounting/bills?filter=Inbox',
                    dataEndpoint: "/api/statistics?skip=0&model=FileTag&select=count(ID) as count&expand=File&filter=FileTag.Status eq 0 and FileTag.TagName eq 'IncomingMail'",
                    valueKey: 'Data[0].count',
                    amount: 0,
                    class: 'uni-widget-notification-orange'
                }
            },
            {
                width: 1,
                height: 1,
                x: 9,
                y: 4,
                widgetType: 'counter', // TODO: enum
                config: {
                    label: 'ehf',
                    description: 'Innkommende ehf',
                    icon: 'globe',
                    link: '/accounting/bills?filter=Inbox',
                    dataEndpoint: "/api/statistics?skip=0&model=FileTag&select=count(ID) as count&expand=File&filter=FileTag.Status eq 0 and FileTag.TagName eq 'IncomingEHF'",
                    valueKey: 'Data[0].count',
                    amount: 0,
                    class: 'uni-widget-notification-orange'
                }
            },
            {
                width: 1,
                height: 1,
                x: 10,
                y: 4,
                widgetType: 'counter', // TODO: enum
                config: {
                    label: 'tildelte',
                    description: 'Tildelte faktura',
                    icon: 'paperclip',
                    link: '/accounting/bills?filter=ForApproval&page=1',
                    dataEndpoint: "/api/statistics/?model=SupplierInvoice&select=count(ID) as count&filter=( isnull(deleted,0) eq 0 ) and ( statuscode eq 30102 )",
                    valueKey: 'Data[0].count',
                    amount: 0,
                    class: 'uni-widget-notification-orange'
                }
            },
            // {
            //    width: 1,
            //    height: 1,
            //    x: 11,
            //    y: 4,
            //    widgetType: 'counter', // TODO: enum
            //    config: {
            //        label: 'prosjekter',
            //        description: 'Antall aktive prosjekter',
            //        icon: 'settings',
            //        link: '/dimensions/project',
            //        dataEndpoint: "/api/statistics?model=Project&select=count(ID) as count",
            //        valueKey: 'Data[0].count',
            //        amount: 0,
            //        class: 'uni-widget-notification-orange'
            //    }
            // },
            {
                width: 1,
                height: 1,
                x: 11,
                y: 4,
                widgetType: 'counter', // TODO: enum
                config: {
                    label: 'varsler',
                    description: 'Uleste varlser',
                    icon: 'bell',
                    link: '/',
                    dataEndpoint: "/api/statistics?model=Notification&select=count(ID) as count&filter=StatusCode eq 900010 and RecipientID eq '<userID>'",
                    // dataEndpoint: '/api/biz/notifications?action=count',
                    valueKey: 'Count',
                    class: 'uni-widget-notification-lite-blue'
                }
            },
            {
                width: 2,
                height: 1,
                x: 8,
                y: 5,
                widgetType: 'flex', // TODO: enum
                config: {}
            },
            {
                width: 2,
                height: 1,
                x: 10,
                y: 5,
                widgetType: 'overdue', // TODO: enum
                config: {}
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
                    title: ['Driftsresultat']
                }
            },

            // {
            //    width: 4,
            //    height: 3,
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
            //        title: ['Tilbud', 'Ordre', 'Faktura']
            //    }
            // },

            {
                width: 4,
                height: 3,
                x: 4,
                y: 1,
                widgetType: 'kpi',
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
                    header: 'Ansatte per stillingskode',
                    chartType: 'pie',
                    labels: [],
                    colors: [],
                    dataEndpoint: [
                        '/api/statistics?model=Employee&select=count(ID) as Count,Employments.JobName as JobName&expand=Employments'
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
                            position: 'left'
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
                    dataEndPoint: "/api/statistics?model=AuditLog&select=id,entitytype,transaction,route,action,entityid,User.ID,field,User.displayname,createdat,updatedat&filter=field eq 'updatedby' and ( not contains(entitytype,'item') ) &join=auditlog.createdby eq user.globalidentity&top=50&orderby=id desc",
                    listItemKeys: {
                        username: 'UserDisplayName',
                        module: 'AuditLogEntityType',
                        action: 'AuditLogField',
                        moduleID: 'AuditLogEntityID',
                        time: 'AuditLogCreatedAt',
                        uniqueID: 'AuditLogTransaction',
                        numberToDisplay: 10
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
