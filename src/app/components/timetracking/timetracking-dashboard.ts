import {Component} from '@angular/core';
import {TabService, UniModules} from '../layout/navbar/tabstrip/tabService';
import {IUniWidget} from '../widgets/widgetCanvas';
import {ToastService} from '../../../framework/uniToast/toastService';
import {CompanySettings, User, UserDto, Permission} from '../../unientities';
import {
    ErrorService,
    CompanySettingsService,
    UserService
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
    private allWidgets: IUniWidget[] = [];
    private companySettings: CompanySettings;
    private localTesting = true;
    public currentYear: number = new Date().getFullYear();

    constructor(
        private tabService: TabService,
        private toastService: ToastService,
        private errorService: ErrorService,
        private userService: UserService
    ) {
        this.tabService.addTab({
             name: 'Timer',
             url: '/timetracking',
             moduleID: UniModules.Timesheets,
             active: true
        });

        this.userService.getCurrentUser().subscribe( user => {
            this.allWidgets = this.getDefaultLayout(user);
            this.switchUserRole(this.getPermissionLevel(user));
        });
    }

    public switchUserRole(level: PermissionLevel) {
        this.widgetLayout = this.compressWidgets( this.allWidgets, level );
    }

    private getPermissionLevel(user: IUserWithPermissions): PermissionLevel {
        let permissionLevel = PermissionLevel.Worker;
        if ((!user.Permissions) || user.Permissions.length === 0) {
            permissionLevel = PermissionLevel.Admin;
        } else {
            user.Permissions.forEach( x => {
                switch (x) {
                    case 'ui_timetracking_workers':
                    case 'ui_timetracking_worktypes':
                        permissionLevel = permissionLevel < PermissionLevel.Payroll ? PermissionLevel.Payroll : permissionLevel;
                        break;
                    case 'ui_timetracking_workprofiles':
                        permissionLevel = PermissionLevel.Admin;
                        break;
                    case 'ui_reports':
                        permissionLevel = permissionLevel < PermissionLevel.Reporting ? PermissionLevel.Reporting : permissionLevel;
                        break;
                }
            });
        }
        return permissionLevel;
    }

    private getDefaultLayout(user: User): IUniWidget[] {
        const widgetList = [
            {
                permissionLevel: PermissionLevel.Payroll,
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
                permissionLevel: PermissionLevel.Payroll,
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
                permissionLevel: PermissionLevel.Worker,
                width: 1,
                height: 1,
                x: 2,
                y: 0,
                widgetType: 'shortcut',
                config: {
                    label: 'Fakturere timer',
                    description: 'Overføre/fakturere timer',
                    icon: 'sale',
                    link: '/timetracking/invoice-hours'
                }
            },
            {
                permissionLevel: PermissionLevel.Reporting,
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
            {
                permissionLevel: PermissionLevel.Payroll,
                width: 2,
                height: 3,
                x: 3,
                y: 1,
                widgetType: 'shortcutlist',
                config: {
                    header: 'Snarveier',
                    shortcuts: [
                        {
                            label: 'Registrere timer',
                            link: '/timetracking/timeentry',
                            urlToNew: ''
                        },
                        {
                            label: 'Fakturere timer',
                            link: '/timetracking/invoice-hours',
                            urlToNew: ''
                        },
                        {
                            label: 'Personer',
                            link: '/timetracking/workers',
                            urlToNew: '/timetracking/workers/0'
                        },
                        {
                            label: 'Timearter',
                            link: '/timetracking/worktypes',
                            urlToNew: '/timetracking/worktypes/0'
                        },
                        {
                            label: 'Stillingsmaler',
                            link: '/timetracking/workprofiles',
                            urlToNew: '/timetracking/workprofiles/0'
                        },
                        {
                            label: 'Kunder',
                            link: '/sales/customer',
                            urlToNew: '/sales/customer/0'
                        },
                        {
                            label: 'Produkter',
                            link: '/sales/products',
                            urlToNew: '/sales/products/0'
                        },
                    ]
                }
            },
            {
                permissionLevel: PermissionLevel.Reporting,
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
                permissionLevel: PermissionLevel.Reporting,
                width: 3,
                height: 3,
                x: 0,
                y: 1,
                widgetType: 'chart',
                config: {
                    header: 'Fordeling pr. timeart ' + this.currentYear,
                    chartType: 'pie',
                    labels: [],
                    colors: [],
                    dataEndpoint: [
                        '/api/statistics?model=workitem&select=sum(minutes) as Sum,'
                        + 'worktype.Name as Name&expand=worktype'
                        + '&filter=year(date) eq ' + this.currentYear
                    ],
                    labelKey: 'Name',
                    valueKey: 'Sum',
                    maxNumberOfLabels: 4,
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

        return widgetList;
    }

    private compressWidgets(widgetList: Array<IUniWidget>, permissionLevel: PermissionLevel): Array<IUniWidget> {
        const list = widgetList.filter( x => (x['permissionLevel'] || PermissionLevel.Worker) <= permissionLevel);
        const rows: Array<{ y: number, items: Array<IUniWidget> }> = [];
        list.forEach( widget => {
            let row = rows.find( r => r.y === widget.y );
            if (!row) {
                row = { y: widget.y, items: [widget] };
                rows.push(row);
            } else {
                const index = row.items.findIndex( item => item.x > widget.x );
                if (index >= 0) {
                    row.items.splice(index, 0, widget);
                } else {
                    row.items.push(widget);
                }
            }
        });
        rows.sort( (a, b) => a.items[0].y > b.items[0].y ? 1 : a.items[0].y === b.items[0].y ? 0 : -1 );
        rows.forEach( (row, index) => {
            for (let i = 0; i < row.items.length; i++) {
                const item = row.items[i];
                item.x = i === 0 ? 0 : row.items[i - 1].x + row.items[i - 1].width;
                item.y = index > 0 ? rows[index - 1].items[0].y + rows[index - 1].items[0].height : 0;
            }
        });
        return list;
    }
}

interface IUserWithPermissions {
    ID: number;
    Permissions?: Array<string>;
    License?: {
        Name: string;
        UserType: { TypeID: number, TypeName: string };
        ContractType?: any;
        Roles: Array<string>;
    };
    DisplayName: string;
    Email: string;
    GlobalIdentity: string;
    PhoneNumber: string;
    UserName: string;
}

enum PermissionLevel {
    Worker = 0,
    Reporting = 1,
    Manager = 2,
    Payroll = 3,
    Admin = 4
}

