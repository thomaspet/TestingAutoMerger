import {Component} from '@angular/core';
import {TabService, UniModules} from '../layout/navbar/tabstrip/tabService';
import {IUniWidget} from '../widgets/widgetCanvas';

@Component({
    selector: 'uni-salary',
    template: `
        <uni-widget-canvas [defaultLayout]="widgetLayout"
                           [layoutName]="'salary'">
        </uni-widget-canvas>
    `,
})
export class UniSalary {
    private widgetLayout: IUniWidget[];

    constructor(tabService: TabService) {
        tabService.addTab({
             name: 'Lønn',
             url: '/salary',
             moduleID: UniModules.Salary,
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
                    label: 'Ansatte',
                    description: 'Ansatte',
                    icon: 'employee',
                    link: '/salary/employees'
                }
            },

            {
                width: 1,
                height: 1,
                x: 1,
                y: 0,
                widgetType: 'shortcut',
                config: {
                    label: 'Lønnsarter',
                    description: 'Lønnsarter',
                    icon: 'wagetype',
                    link: '/salary/wagetypes'
                }
            },

            {
                width: 1,
                height: 1,
                x: 2,
                y: 0,
                widgetType: 'shortcut',
                config: {
                    label: 'Lønnsavregninger',
                    description: 'Lønnsavregninger',
                    icon: 'payrollrun',
                    link: '/salary/payrollrun'
                }
            },

            {
                width: 1,
                height: 1,
                x: 3,
                y: 0,
                widgetType: 'shortcut',
                config: {
                    label: 'A-melding',
                    description: 'A-melding',
                    icon: 'amelding',
                    link: '/salary/amelding'
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
                    showSeconds: false
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
                        '/api/statistics?model=Employee&select=count(ID) as Count,'
                        + 'Employments.JobName as JobName&expand=Employments'
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
                width: 8,
                height: 3,
                x: 2,
                y: 1,
                widgetType: 'transaction', // TODO: enum
                config: {
                    dashboard: 'Salary' // Identifyer for which fields to show.. FIX while not dynamic
                }
            },
            {
                width: 2,
                height: 3,
                x: 0,
                y: 1,
                widgetType: 'shortcutlist',
                config: {
                    header: 'Snarveier',
                    shortcuts: [
                        {
                            label: 'Ansatte',
                            link: '/salary/employees',
                            urlToNew: '/salary/employees/0'
                        },
                        {
                            label: 'Lønnsarter',
                            link: '/salary/wagetypes',
                            urlToNew: '/salary/wagetypes/0/details'
                        },
                        {
                            label: 'Kategorier',
                            link: '/salary/employeecategories',
                            urlToNew: '/salary/employeecategories/0/details'
                        },
                        {
                            label: 'Lønnsavregning',
                            link: '/salary/payrollrun',
                            urlToNew: '/salary/payrollrun/0'
                        },
                        {
                            label: 'A-melding',
                            link: '/salary/amelding',
                            urlToNew: ''
                        },
                        {
                            label: 'Saldo',
                            link: '/salary/salarybalances',
                            urlToNew: '/salary/salarybalances/0/details'
                        },
                        {
                            label: 'Tillegsopplysninger',
                            link: '/salary/supplements',
                            urlToNew: ''
                        }
                    ]
                }
            },
            {
                width: 2,
                height: 2,
                x: 4,
                y: 4,
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
                x: 6,
                y: 4,
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
                x: 8,
                y: 4,
                widgetType: 'infoshortcut', // TODO: enum
                config: {
                    header: 'Kundersenteret',
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

