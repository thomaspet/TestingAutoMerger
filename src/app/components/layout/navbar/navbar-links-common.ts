// tslint:disable:max-line-length
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
    keyWords?: string[];
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
                name: 'FIRMAINNSTILLINGER',
                links: [
                    {
                        name: 'NAVBAR.COMPANY', activeInSidebar: false, url: '/settings/company',
                        keyWords: ['Kontaktinformasjon', 'Organiasjonsnummer', 'Perioder', 'Avrunding', 'Factoring', 'Rapportoppsett', 'Logo']
                    },
                    {
                        name: 'NAVBAR.PAYROLL_SETTINGS', activeInSidebar: false, url: '/settings/aga-and-subentities',
                        keyWords: ['Virksomheter', 'Arbeidsgiveravgift', 'Aga', 'Fribeløp', 'Tilskudd', 'Rapportoppsett', 'Feriepenger', 'Finansskatt']
                    },
                    {name: 'NAVBAR.TEAMS', activeInSidebar: false, url: '/settings/teams', keyWords: ['Godkjenning', 'Tilgang']},
                    {name: 'NAVBAR.NUMBERSERIES', activeInSidebar: false, url: '/settings/numberseries'},
                    {name: 'NAVBAR.TERMS', activeInSidebar: false, url: '/settings/terms', keyWords: ['Leveringsbetingelser', 'Betalingsbetingelser']},
                    {name: 'NAVBAR.DIMENSION_SETTINGS', activeInSidebar: false, url: '/settings/dimension', keyWords: ['Egendefinerte', 'Dimensjoner']},
                ]
            },
            {
                name: 'Verktøy',
                links: [
                    {name: 'NAVBAR.DISTRIBUTION', activeInSidebar: false, url: '/settings/distribution'},
                    {name: 'Jobber', url: '/admin/jobs', moduleID: UniModules.Jobs, activeInSidebar: false, keyWords: ['Export', 'SAF-T', 'SAFT']},
                    {name: 'Importsentral', url: '/admin/import-central', activeInSidebar: false},
                    {name: 'NAVBAR.IMPORT_CENTRAL', activeInSidebar: true, url: '/import'},
                    {
                        name: 'Flyt', url: '/admin/flow', moduleID: UniModules.Flow, activeInSidebar: false,
                        keyWords: ['Autotildeling', 'Leverandørsynkronisering', 'Automatisk bankavstemming', 'Automatikk']
                    },
                ]
            },
            {
                name: 'Admin',
                links: [
                    {
                        name: 'NAVBAR.USERS', activeInSidebar: false, url: '/settings/users',
                        keyWords: ['Inviter bruker', 'Produkttilgang', 'Roller', 'Tilgang', 'Deaktiver', 'Brukeroversikt', 'Bankbruker', 'Autobank']
                    },
                    {name: 'NAVBAR.INTEGRATION', activeInSidebar: false, url: '/settings/webhooks'},
                    {name: 'NAVBAR.RULES', activeInSidebar: false, url: '/approval-rules'},
                    {name: 'GDPR', url: '/admin/gdpr', moduleID: UniModules.GDPRList, activeInSidebar: false, keyWords: ['Personopplysninger']},
                ]
            }
        ]
    },
];
