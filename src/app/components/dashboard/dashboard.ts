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
    private layout: any[] = [];

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
        this.layout = this.initLayout();
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
                    label: 'TIMER',
                    description: 'Timeføring',
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
                    label: 'Innboks',
                    description: 'Uleste eposter',
                    icon: 'letter',
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
                    label: 'EHF',
                    description: 'Innkommende ehfs',
                    icon: 'ehf',
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
                    label: 'Tildelte',
                    description: 'Tildelte faktura',
                    icon: 'pdf',
                    link: '/accounting/bills?filter=ForApproval&page=1',
                    dataEndpoint: "/api/statistics/?model=SupplierInvoice&select=count(ID) as count&filter=( isnull(deleted,0) eq 0 ) and ( statuscode eq 30102 )",
                    valueKey: 'Data[0].count',
                    amount: 0,
                    class: 'uni-widget-notification-orange'
                }
            },
            {
                width: 1,
                height: 1,
                x: 11,
                y: 4,
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
                    labels: ['Jan', '', '', 'Apr', '', '', 'Jul', '', 'Sep', '', '', 'Dec'],
                    colors: ['#7293cb'],
                    backgroundColors: ['transparent'],
                    dataEndpoint: ['/api/statistics?model=JournalEntryLine&select=month(financialdate),sum(amount)&join=journalentryline.accountid eq account.id&filter=account.accountnumber ge 3000 and account.accountnumber le 9999 &range=monthfinancialdate'],
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
                width: 4,
                height: 3,
                x: 8,
                y: 1,
                widgetType: 'list',
                config: {
                    header: 'Siste endringer',
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
