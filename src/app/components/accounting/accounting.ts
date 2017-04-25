import {Component} from '@angular/core';
import {TabService, UniModules} from '../layout/navbar/tabstrip/tabService';
import {IUniWidget} from '../widgets/widgetCanvas';

@Component({
    selector: 'uni-accounting',
    template: `
        <uni-widget-canvas [defaultLayout]="widgetLayout"
                           [layoutName]="'accounting'">
        </uni-widget-canvas>
    `,
})
export class UniAccounting {
    private widgetLayout: IUniWidget[];

    constructor(tabService: TabService) {
        tabService.addTab({
             name: 'Regnskap',
             url: '/accounting',
             moduleID: UniModules.Accounting,
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
                widgetType: 'shortcut',
                config: {
                    label: 'Bilagsføring',
                    description: 'Bilagsføring',
                    icon: '',
                    link: '/accounting/journalentry/manual'
                }
            },
            {
                width: 1,
                height: 1,
                x: 1,
                y: 0,
                widgetType: 'shortcut',
                config: {
                    label: 'Fakturamottak',
                    description: 'Fakturamottak',
                    icon: '',
                    link: '/accounting/bills'
                }
            },
            {
                width: 1,
                height: 1,
                x: 2,
                y: 0,
                widgetType: 'shortcut',
                config: {
                    label: 'Foresp�rsel bilag',
                    description: 'Foresp�rsel bilag',
                    icon: '',
                    link: '/accounting/transquery/details'
                }
            },
            {
                width: 1,
                height: 1,
                x: 3,
                y: 0,
                widgetType: 'shortcut',
                config: {
                    label: 'Regnskaps- oversikt',
                    description: 'Regnskaps- oversikt',
                    icon: '',
                    link: '/accounting/accountingreports/result'
                }
            },
            {
                width: 1,
                height: 1,
                x: 4,
                y: 0,
                widgetType: 'shortcut',
                config: {
                    label: 'MVA-melding',
                    description: 'MVA-melding',
                    icon: '',
                    link: '/accounting/vatreport'
                }
            },
            {
                width: 1,
                height: 1,
                x: 5,
                y: 0,
                widgetType: 'shortcut',
                config: {
                    label: 'Kontoplan',
                    description: 'Kontoplan',
                    icon: '',
                    link: '/accounting/accountsettings'
                }
            },
            {
                width: 1,
                height: 1,
                x: 6,
                y: 0,
                widgetType: 'shortcut',
                config: {
                    label: 'Leverandører',
                    description: 'Leverandører',
                    icon: '',
                    link: '/suppliers'
                }
            },
            {
                height: 1,
                x: 6,
                y: 0,
                widgetType: 'shortcut',
                config: {
                    label: 'Leverandører',
                    description: 'Leverandører',
                    icon: '',
                    link: '/suppliers'
                }
            },
            {
                width: 1,
                height: 1,
                x: 7,
                x: 10,
                y: 0,
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
                x: 11,
                y: 0,
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
                x: 12,
                y: 0,
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
                widgetType: 'kpi',
                config: {
                    header: 'Nøkkeltall'
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
                width: 3,
                height: 1,
                x: 0,
                y: 4,
                widgetType: 'clock',
                config: {
                    dateColor: '#7698bd',
                    showSeconds: true
                }
            },

        ];
    }

}
