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
    subSettings?: INavbarLink[];
    showSubSettings?: boolean;
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
                name: 'Innstillinger',
                links: [
                    {
                        name: 'NAVBAR.COMPANY', activeInSidebar: false, url: '/settings/company',
                        keyWords: ['Kontaktinformasjon', 'Organiasjonsnummer', 'Orgnr', 'Logo', 'E-postmottak']
                    },
                    {
                        name: 'NAVBAR.SALES',
                        activeInSidebar: false,
                        url: '/settings/sales',
                        showSubSettings: false,
                        subSettings: [
                            {name: 'Salgsfaktura', activeInSidebar: false, url: '/settings/sales?index=0', keyWords: ['Salgskonto', 'Desimaler', 'Avrunding', 'Periodisering', 'GLN', 'Fakturaprint', 'EHF', 'Øredifferanse', 'Factoring', 'Inkluder PDF']},
                            {name: 'NAVBAR.TERMS', activeInSidebar: false, url: '/settings/sales?index=1', keyWords: ['Leveringsbetingelser', 'Leveringsdager', 'Betalingsbetingelser', 'Kredittdager']},
                            {name: 'SETTINGS.KID_SETTINGS', activeInSidebar: false, url: '/settings/sales?index=2', keyWords: ['KID oppsett']},
                            {name: 'SETTINGS.FORM_SETTINGS', activeInSidebar: false, url: '/settings/sales?index=3', keyWords: ['Logo', 'Rapport', 'Språk', 'Faste tekster', 'Blankett', 'Vis KID i fakturablankett']},
                            {name: 'SETTINGS.COLLECTOR', activeInSidebar: false, url: '/settings/sales?index=4', keyWords: ['Purring', 'Inkasso', 'Inkassovarsel', 'Purregebyr', 'Blankett', 'Purreregler']}
                        ],
                        keyWords: ['Salgskonto', 'Desimaler', 'Avrunding', 'Periodisering', 'GLN', 'Kredittdager', 'Øredifferanse', 'Potensiell kunde', 'Leveringsbetingelser', 'Inkluder PDF', 'Leveringsdager', 'Betalingsbetingelser', 'Vis KID i fakturablankett', 'Factoring', 'Logo', 'Factoring', 'Purreregler', 'Rapporter', 'Språk', 'Faste tekster', 'Fakturaprint', 'EHF', 'Purring', 'Inkasso', 'Inkassovarsel', 'Purregebyr', 'Blankett', 'KID oppsett']
                    },
                    {
                        name: 'NAVBAR.ACCOUNTING',
                        activeInSidebar: false,
                        url: '/settings/accounting',
                        showSubSettings: false,
                        subSettings: [
                            {name: 'Regnskapsinnstillinger', activeInSidebar: false, url: '/settings/accounting?index=0', keyWords: ['Kundereskontro', 'Leverandørreskontro', 'EHF', 'OCR', 'Kontoer', 'Perioder', 'Mva-pliktig', 'Låst til', 'Skjema', 'Valutagevinst', 'Valutatap']},
                            {name: 'Mvakoder', activeInSidebar: false, url: '/settings/accounting?index=1', keyWords: ['Omvendt avgiftsplikt', 'Direktepostering MVA', 'Sperret', 'Fradragsberettiget', 'Mvakode', 'Mva-kode', 'Momssats']},
                            {name: 'Forholdsmessig MVA / fradrag', activeInSidebar: false, url: '/settings/accounting?index=2', keyWords: ['Fradragsprosent']},
                            {name: 'Eiendeler', activeInSidebar: false, url: '/settings/accounting?index=3', keyWords: ['Eiendel', 'Eiendeler', 'Avskrivning']},
                        ],
                        keyWords: ['Kundereskontro', 'Leverandørreskontro', 'Kontoer', 'Perioder', 'Mva-pliktig', 'Låst til', 'Skjema', 'Valutagevinst', 'EHF', 'OCR', 'Valutatap', 'Fradragsprosent', 'Omvendt avgiftsplikt', 'Direktepostering MVA', 'Sperret', 'Fradragsberettiget', 'Mvakode', 'Mva-kode', 'Momssats']
                    },
                    {
                        name: 'NAVBAR.BANK', activeInSidebar: false, url: '/settings/bank',
                        keyWords: ['Bank', 'Autobank', 'Innbetaling', 'Bankgebyr', 'Differansebeløp', 'Driftskonto', 'Skattetrekkskonto', 'Lønnskonto', 'Remitteringskonto', 'Mellomkonto', 'EndToEndID']
                    },
                    {
                        name: 'NAVBAR.SALARY', activeInSidebar: false, url: '/settings/aga-and-subentities',
                        subSettings: [
                            {name: 'Juridisk enhet', activeInSidebar: false, url: '/settings/aga-and-subentities?index=0', keyWords: ['Fribeløp', 'Arbeidsgiveravgift', 'Beregningsregel', 'Aga soner', 'Tilskudd']},
                            {name: 'Virksomheter', activeInSidebar: false, url: '/settings/aga-and-subentities?index=1', keyWords: ['Fribeløp', 'Arbeidsgiveravgift', 'Beregningsregel', 'Aga soner']},
                            {name: 'Kontoer og lønn', activeInSidebar: false, url: '/settings/aga-and-subentities?index=2', keyWords: ['Hovedbokskontoer', 'Avsatt erbeidsgiveravgift', 'Feriepenger', 'Poster skattetrekk', 'Timer per årsverk', 'Lønnsinterval', 'OTP-eksport']},
                            {name: 'Feriepenger', activeInSidebar: false, url: '/settings/aga-and-subentities?index=3'},
                            {name: 'Spesielle innstillinger', activeInSidebar: false, url: '/settings/aga-and-subentities?index=4', keyWords: ['Finansskatt', 'Finansskatt av feriepenger', 'Særskilt fradrag for sjøfolk', 'Kildeskatt for pensjonister', 'Skatteregler', 'Avgiftsregler']}
                        ],
                        keyWords: ['Virksomheter', 'Arbeidsgiveravgift', 'Aga', 'Fribeløp', 'Tilskudd', 'Feriepenger', 'Finansskatt']
                    },
                    {name: 'NAVBAR.NUMBERSERIES', activeInSidebar: false, url: '/settings/numberseries'},
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
                        keyWords: ['Autotildeling', 'Leverandørsynkronisering', 'Automatisk bankavstemming', 'Automatikk', 'Automasjon']
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
                    {name: 'NAVBAR.TEAMS', activeInSidebar: false, url: '/settings/teams', keyWords: ['Godkjenning', 'Tilgang']},
                    {name: 'NAVBAR.INTEGRATION', activeInSidebar: false, url: '/settings/webhooks'},
                    {name: 'NAVBAR.RULES', activeInSidebar: false, url: '/approval-rules', keyWords: ['Regler', 'Fakturagodkjenning', 'Vikar']},
                    {name: 'GDPR', url: '/admin/gdpr', moduleID: UniModules.GDPRList, activeInSidebar: false, keyWords: ['Personopplysninger', 'Personvern']},
                ]
            }
        ]
    },
];
