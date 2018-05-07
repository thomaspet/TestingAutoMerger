import {UniModules} from './tabstrip/tabService';

export interface INavbarLink {
    componentName: string;
    componentUrl: string;
    moduleID?: number;
    groupHeader?: string;
}

export interface INavbarLinkSection {
    componentListName: string;
    componentListHeader: string;
    componentListUrl: string;
    componentListIcon: string;
    componentList: INavbarLink[];
}

export const NAVBAR_LINKS: INavbarLinkSection[] = [
    {
        componentListName: 'Nøkkeltall',
        componentListHeader: 'Nøkkeltall',
        componentListUrl: '/',
        componentListIcon: 'key-figures',
        componentList: [
            {
                componentName: 'Skrivebord',
                componentUrl: '/',
                moduleID: UniModules.Dashboard
            },
            {
                componentName: 'Selskaper',
                componentUrl: '/bureau',
                moduleID: UniModules.BureauDashboard
            },
            {
                componentName: 'Markedsplass',
                componentUrl: '/marketplace',
                moduleID: UniModules.Marketplace
            },
            {
                componentName: 'Oversikt',
                componentUrl: '/overview',
                moduleID: UniModules.UniTicker
            },
            {
                componentName: 'Resultat og balanse',
                componentUrl: '/accounting/accountingreports',
                moduleID: UniModules.AccountingReports
            },
            {
                componentName: 'Rapporter',
                componentUrl: '/reports',
                moduleID: UniModules.Reports
            },
            {
                componentName: 'Uttrekk',
                componentUrl: '/uniqueries',
                moduleID: UniModules.UniQuery
            },
            {
                componentName: 'Mine oppgaver',
                componentUrl: '/assignments',
                moduleID: UniModules.Assignments
            },

            {
                componentName: 'Delinger',
                componentUrl: '/sharings',
                moduleID: UniModules.Sharings
            }
        ]
    },
    {
        componentListName: 'Salg',
        componentListHeader: 'Salg',
        componentListUrl: '/sales',
        componentListIcon: 'sales',
        componentList: [
            {
                componentName: 'Faktura',
                componentUrl: '/sales/invoices',
                moduleID: UniModules.Invoices
            },
            {
                componentName: 'Ordre',
                componentUrl: '/sales/orders',
                moduleID: UniModules.Orders
            },
            {
                componentName: 'Tilbud',
                componentUrl: '/sales/quotes',
                moduleID: UniModules.Quotes
            },
            {
                componentName: 'Purring',
                componentUrl: '/sales/reminders',
                moduleID: UniModules.Reminders
            },
            {
                componentName: 'Kunder',
                componentUrl: '/sales/customer',
                moduleID: UniModules.Customers,
                groupHeader: 'Register'
            },
            {
                componentName: 'Produkter',
                componentUrl: '/sales/products',
                moduleID: UniModules.Products
            },
            {
                componentName: 'Produktgrupper',
                componentUrl: '/sales/productgroups',
                moduleID: UniModules.ProductGroup
            },
            {
                componentName: 'Selgere',
                componentUrl: '/sales/sellers',
                moduleID: UniModules.Sellers
            },
            {
                componentName: 'Valuta',
                componentUrl: '/currency/exchange',
                moduleID: UniModules.CurrencyExchange
            },
            {
                componentName: 'KID-innstillinger',
                componentUrl: '/sales/kidsettings',
                moduleID: UniModules.KIDSettings,
            },
        ]
    },
    {
        componentListName: 'Regnskap',
        componentListHeader: 'Regnskap og økonomi',
        componentListUrl: '/accounting',
        componentListIcon: 'accounting',
        componentList: [
            {
                componentName: 'Bilagsføring',
                componentUrl: '/accounting/journalentry',
                moduleID: UniModules.Accounting
            },
            {
                componentName: 'Fakturamottak',
                componentUrl: '/accounting/bills',
                moduleID: UniModules.Bills
            },
            {
                componentName: 'Åpne poster',
                componentUrl: '/accounting/postpost',
                moduleID: UniModules.PostPost
            },
            {
                componentName: 'MVA-melding',
                componentUrl: '/accounting/vatreport',
                moduleID: UniModules.VatReport
            },
            {
                componentName: 'Resultat og balanse',
                componentUrl: '/accounting/accountingreports',
                moduleID: UniModules.AccountingReports
            },
            {
                componentName: 'Søk på bilag',
                componentUrl: '/accounting/transquery',
                moduleID: UniModules.TransqueryDetails, groupHeader: 'Søk'
            },
            {
                componentName: 'Søk på konto',
                componentUrl: '/accounting/accountquery',
                moduleID: UniModules.AccountQuery
            },
            {
                componentName: 'Leverandør',
                componentUrl: '/accounting/suppliers',
                moduleID: UniModules.Suppliers, groupHeader: 'Register'
            },
            {
                componentName: 'Kontoplan',
                componentUrl: '/accounting/accountsettings',
                moduleID: UniModules.Accountsettings
            },
            {
                componentName: 'MVA-innstillinger',
                componentUrl: '/accounting/vatsettings',
                moduleID: UniModules.Vatsettings
            },
            {
                componentName: 'Valuta',
                componentUrl: '/currency/exchange',
                moduleID: UniModules.CurrencyExchange
            },
            {
                componentName: 'Betaling',
                componentUrl: '/accounting/journalentry/payments',
                moduleID: UniModules.Payments
            }
        ]
    },
    {
        componentListName: 'Bank',
        componentListHeader: 'Bank',
        componentListUrl: '/bank',
        componentListIcon: 'bank',
        componentList: [
            {
                componentName: 'Betalinger',
                componentUrl: '/bank',
                moduleID: UniModules.Payment
            }
        ]
    },
    {
        componentListName: 'Lønn',
        componentListHeader: 'Lønn og personal',
        componentListUrl: '/salary',
        componentListIcon: 'salary',
        componentList: [
            {
                componentName: 'Lønnsavregning',
                componentUrl: '/salary/payrollrun',
                moduleID: UniModules.Payrollrun
            },
            {
                componentName: 'A-Melding',
                componentUrl: '/salary/amelding',
                moduleID: UniModules.Amelding
            },
            {
                componentName: 'Saldo',
                componentUrl: '/salary/salarybalances',
                moduleID: UniModules.Salarybalances
            },
            {
                componentName: 'Tilleggsopplysninger',
                componentUrl: '/salary/supplements',
                moduleID: UniModules.Supplements
            },
            {
                componentName: 'Årsoppgave til inntektsmottaker',
                componentUrl: '/salary/annualstatements',
                moduleID: UniModules.AnnualStatements
            },
            {
                componentName: 'Ansatte',
                componentUrl: '/salary/employees',
                moduleID: UniModules.Employees,
                groupHeader: 'Register'
            },
            {
                componentName: 'Lønnsarter',
                componentUrl: '/salary/wagetypes',
                moduleID: UniModules.Wagetypes
            },
            {
                componentName: 'Kategorier',
                componentUrl: '/salary/employeecategories',
                moduleID: UniModules.Categories
            },
            {
                componentName: 'Altinn oversikt',
                componentUrl: '/salary/altinnoverview',
                moduleID: UniModules.AltinnOverview
            }
        ]
    },
    {
        componentListName: 'Timer',
        componentListHeader: 'Timer',
        componentListUrl: '/timetracking',
        componentListIcon: 'timetracking',
        componentList: [
            {
                componentName: 'Timemodul',
                componentUrl: '/timetracking',
                moduleID: UniModules.Timesheets
            },
            {
                componentName: 'Timeregistrering',
                componentUrl: '/timetracking/timeentry',
                moduleID: UniModules.Timesheets
            },
            {
                componentName: 'Fakturering av timer',
                componentUrl: '/timetracking/invoice-hours',
                moduleID: UniModules.Timesheets
            },
            {
                componentName: 'Personer',
                componentUrl: '/timetracking/workers',
                moduleID: UniModules.Workers, groupHeader: 'Register'
            },
            {
                componentName: 'Timearter',
                componentUrl: '/timetracking/worktypes',
                moduleID: UniModules.WorkTypes
            },
            {
                componentName: 'Stillingsmaler',
                componentUrl: '/timetracking/workprofiles',
                moduleID: UniModules.WorkProfiles
            },
        ]
    },
    {
        componentListName: 'Prosjekt [BETA]',
        componentListHeader: 'Prosjekt [BETA]',
        componentListUrl: '/dimensions/projects',
        componentListIcon: 'projects',
        componentList: [
            {
                componentName: 'Oversikt',
                componentUrl: '/dimensions/projects/overview',
                moduleID: UniModules.Projects
            },
            {
                componentName: 'Timer',
                componentUrl: '/dimensions/projects/hours',
                moduleID: UniModules.Projects
            },
        ]
    },
    {
        componentListName: 'Innstillinger',
        componentListHeader: 'Innstillinger',
        componentListUrl: '/admin',
        componentListIcon: 'settings',
        componentList: [
            {componentName: 'Firmaoppsett', componentUrl: '/settings/company'},
            {componentName: 'Nummerserier', componentUrl: '/settings/numberseries'},
            {componentName: 'Team', componentUrl: '/settings/teams'},
            {componentName: 'Altinn', componentUrl: '/settings/altinn'},
            // {componentName: 'Bankinnstillinger', componentUrl: '/settings/banksettings'},
            {componentName: 'Integrasjon', componentUrl: '/settings/webhooks'},
            {
                componentName: 'Regler',
                componentUrl: '/admin/thresholds',
                moduleID: UniModules.Thresholds
            },
            {
                componentName: 'Jobber',
                componentUrl: '/admin/jobs',
                moduleID: UniModules.Jobs
            },
            {
                componentName: 'Modeller',
                componentUrl: '/admin/models',
                moduleID: UniModules.Models
            },
            {
                componentName: 'Roller',
                componentUrl: '/admin/roles',
                moduleID: UniModules.Roles
            },
            {
                componentName: 'GDPR List',
                componentUrl: '/admin/gdpr',
                moduleID: UniModules.GDPRList
            },
            {
                componentName: 'Versjonsinformasjon',
                componentUrl: '/about/versions',
                moduleID: UniModules.Versions
            },
        ]
    }
];
