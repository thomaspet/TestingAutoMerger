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
                    icon: '',
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
                    icon: '',
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
                    icon: '',
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
                    icon: '',
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
                x: 8,
                y: 1,
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
                width: 8,
                height: 3,
                x: 0,
                y: 1,
                widgetType: 'transaction', // TODO: enum
                config: {
                    dashboard: 'Salary' // Identifyer for which fields to show.. FIX while not dynamic
                }
            }
        ];
    }
}

