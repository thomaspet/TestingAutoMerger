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
                    label: 'Føre bilag',
                    description: 'Bilagsføring',
                    icon: 'journalentry',
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
                    icon: 'supplierinvoice',
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
                    label: 'Søk bilag',
                    description: 'Forespørsel på bilag',
                    icon: 'magnifying',
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
                    label: 'Oversikt',
                    description: 'Regnskapsoversikt',
                    icon: 'accountingreport',
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
                    icon: 'mva',
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
                    label: 'Oversikt',
                    description: 'Oversikt',
                    icon: 'search',
                    link: '/overview'
                }
            },
            {
                width: 1,
                height: 1,
                x: 6,
                y: 0,
                widgetType: 'counter', // TODO: enum
                config: {
                    label: 'Epost',
                    description: 'Antall eposter i innboks',
                    icon: 'home',
                    link: '/accounting/bills?filter=Inbox',
                    dataEndpoint: '/api/statistics?skip=0&model=FileTag&select=count(ID) as count&expand=File'
                        + '&filter=FileTag.Status eq 0 and FileTag.TagName eq "IncomingMail" and File.Deleted eq 0',
                    valueKey: 'Data[0].count',
                    amount: 0,
                    class: 'uni-widget-notification-orange'
                }
            },
            {
                width: 1,
                height: 1,
                x: 7,
                y: 0,
                widgetType: 'counter', // TODO: enum
                config: {
                    label: 'EHF',
                    description: 'Antall EHFer i innboks',
                    icon: 'globe',
                    link: '/accounting/bills?filter=Inbox',
                    dataEndpoint: '/api/statistics?skip=0&model=FileTag&select=count(ID) as count&expand=File'
                        + '&filter=FileTag.Status eq 0 and FileTag.TagName eq "IncomingEHF" and File.Deleted eq 0',
                    valueKey: 'Data[0].count',
                    amount: 0,
                    class: 'uni-widget-notification-orange'
                }
            },
            {
                width: 1,
                height: 1,
                x: 8,
                y: 0,
                widgetType: 'counter', // TODO: enum
                config: {
                    label: 'tildelte',
                    description: 'Tildelte faktura',
                    icon: 'paperclip',
                    link: '/accounting/bills?filter=ForApproval&page=1',
                    dataEndpoint: '/api/statistics/?model=SupplierInvoice&select=count(ID) as count'
                        + '&filter=( isnull(deleted,0) eq 0 ) and ( statuscode eq 30102 )',
                    valueKey: 'Data[0].count',
                    amount: 0,
                    class: 'uni-widget-notification-orange'
                }
            },
            {
                width: 1,
                height: 1,
                x: 9,
                y: 0,
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
                width: 4,
                height: 3,
                x: 4,
                y: 4,
                widgetType: 'chart',
                config: {
                    header: 'Driftsresultater',
                    chartType: 'line',
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                    colors: ['#396bb1'],
                    dataEndpoint: [
                        '/api/statistics?model=JournalEntryLine&select=month(financialdate),sum(amount)'
                        + '&join=journalentryline.accountid eq account.id&filter=account.accountnumber ge 3000 '
                        + 'and account.accountnumber le 9999 &range=monthfinancialdate'
                    ],
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
                x: 0,
                y: 4,
                widgetType: 'kpi',
                config: {
                    header: 'Nøkkeltall'
                }
            },
            {
                width: 8,
                height: 3,
                x: 0,
                y: 1,
                widgetType: 'transaction', // TODO: enum
                config: {
                    dashboard: 'Accounting' // Identifyer for which fields to show.. fix while not dynamic
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
                            label: 'Bilagsføring',
                            link: '/accounting/journalentry/manual',
                            urlToNew: ''
                        },
                        {
                            label: 'Fakturamottak',
                            link: '/accounting/bills',
                            urlToNew: '/accounting/bills/0'
                        },
                        {
                            label: 'Åpne poster',
                            link: '/accounting/postpost',
                            urlToNew: ''
                        },
                        {
                            label: 'Forespørsel bilg',
                            link: '/accounting/transquery/details',
                            urlToNew: ''
                        },
                        {
                            label: 'Regnskapsoversikt',
                            link: '/accounting/accountingreports/result',
                            urlToNew: ''
                        },
                        {
                            label: 'MVA-melding',
                            link: '/accounting/vatreport',
                            urlToNew: ''
                        },
                        {
                            label: 'Kontoplan',
                            link: '/accounting/accountsettings',
                            urlToNew: ''
                        },
                        {
                            label: 'Leverandør',
                            link: '/accounting/suppliers',
                            urlToNew: '/accounting/suppliers/0'
                        },
                    ]
                }
            },
            {
                width: 2,
                height: 2,
                x: 10,
                y: 0,
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
                y: 2,
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
                y: 4,
                widgetType: 'infoshortcut', // TODO: enum
                config: {
                    header: 'Kundesenteret',
                    text: 'Besøk vårt kundesenter for tips og triks, nyttige datoer og annen info.',
                    link: '',
                    externalLink: 'https://unimicro.atlassian.net/servicedesk/customer/portal/3',
                    imageLink: '../../../assets/info_shortcut_bell_img.jpg',
                    title: ''
                }
            }
        ];
    }

}
