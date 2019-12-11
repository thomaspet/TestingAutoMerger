import {UniModules} from './tabstrip/tabService';
export interface INavbarLink {
    name: string;
    url: string;
    activeInSidebar: boolean;
    moduleID?: number;
    routerLinkActiveExact?: boolean;
    isSuperSearchComponent?: boolean;
    predefinedFilter?: string;
    moduleName?: string;
    shortcutName?: string;
    prefix?: string[];
    selects?: any[];
    searchFields?: string[];
    expands?: string[];
    joins?: string[];
}

export interface INavbarLinkSection {
    name: string;
    url: string;
    icon: string;
    hidden?: boolean;
    megaMenuGroupIndex: number;
    isOnlyLinkSection?: boolean;
    onIconClickUrl?: string;
    linkGroups: {
        name: string;
        links: INavbarLink[];
    }[];
}

export const SETTINGS_LINKS: INavbarLinkSection[] = [
    // INNSTILLINGER
    {
        name: 'NAVBAR.SETTINGS',
        url: '/settings',
        icon: 'settings',
        megaMenuGroupIndex: 0,
        hidden: true,
        linkGroups: [
            {
                name: '',
                links: [
                    {name: 'NAVBAR.COMPANY', activeInSidebar: false, url: '/settings/company'},
                    {name: 'NAVBAR.DISTRIBUTION', activeInSidebar: false, url: '/settings/distribution'},
                    {name: 'NAVBAR.PAYROLL_SETTINGS', activeInSidebar: false, url: '/settings/aga-and-subentities'},
                    {name: 'NAVBAR.INTEGRATION', activeInSidebar: false, url: '/settings/webhooks'},
                    {name: 'NAVBAR.USERS', activeInSidebar: false, url: '/settings/users'},
                    {name: 'NAVBAR.TEAMS', activeInSidebar: false, url: '/settings/teams'},
                    {name: 'NAVBAR.NUMBERSERIES', activeInSidebar: false, url: '/settings/numberseries'},
                    {name: 'NAVBAR.TERMS', activeInSidebar: false, url: '/settings/terms'},
                    {name: 'NAVBAR.DIMENSION_SETTINGS', activeInSidebar: false, url: '/settings/dimension'},
                    {name: 'NAVBAR.RULES', activeInSidebar: false, url: '/approval-rules'},
                    {name: 'NAVBAR.IMPORT_CENTRAL', activeInSidebar: true, url: '/import'},
                ]
            },
            {
                name: 'Admin',
                links: [
                    {
                        name: 'Jobber',
                        url: '/admin/jobs',
                        moduleID: UniModules.Jobs,
                        activeInSidebar: false
                    },
                    {
                        name: 'GDPR',
                        url: '/admin/gdpr',
                        moduleID: UniModules.GDPRList,
                        activeInSidebar: false
                    },
                    {
                        name: 'Flyt',
                        url: '/admin/flow',
                        moduleID: UniModules.Flow,
                        activeInSidebar: false
                    },
                    {
                        name: 'Importsentral',
                        url: '/admin/import-central',
                        activeInSidebar: false
                    }
                ]
            }
        ]
    },
];