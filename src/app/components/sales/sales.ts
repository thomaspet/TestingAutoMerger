import {Component} from '@angular/core';
import {TabService, UniModules} from '../layout/navbar/tabstrip/tabService';
import {UniWidgetCanvas, IUniWidget} from '../widgets/widgetCanvas';

@Component({
    selector: 'uni-sales',
    template: `
        <uni-widget-canvas [defaultLayout]="widgetLayout"
                           [layoutName]="'sales'">
        </uni-widget-canvas>
    `,
})
export class UniSales {
    private widgetLayout: IUniWidget[];

    constructor(tabService: TabService) {
        tabService.addTab({
             name: 'Salg',
             url: '/sales',
             moduleID: UniModules.Sales,
             active: true
        });

        this.widgetLayout = this.getDefaultLayout();
    }

    private getDefaultLayout(): IUniWidget[] {
        return [
            {
                width: 1,
                height: 1,
                x: 0,
                y: 0,
                widgetType: 'shortcut', // TODO: enum
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
                x: 1,
                y: 0,
                widgetType: 'shortcut', // TODO: enum
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
                x: 2,
                y: 0,
                widgetType: 'shortcut', // TODO: enum
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
                x: 3,
                y: 0,
                widgetType: 'shortcut', // TODO: enum
                config: {
                    label: 'Kunder',
                    description: 'Kundeoversikt',
                    icon: '',
                    link: '/sales/customer'
                }
            },

            {
                width: 3,
                height: 1,
                x: 4,
                y: 0,
                widgetType: 'clock',
                config: {
                    dateColor: '#7698bd',
                    showSeconds: true
                }
            },

            {
                width: 2,
                height: 1,
                x: 7,
                y: 0,
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

            {
                width: 4,
                height: 3,
                x: 4,
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

        ];
    }
}
