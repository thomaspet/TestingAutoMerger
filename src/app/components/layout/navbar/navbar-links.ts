import {UniModules} from './tabstrip/tabService';

export interface INavbarLink {
    name: string;
    url: string;
    moduleID?: number;
    routerLinkActiveExact?: boolean;
    isSuperSearchComponent?: boolean;
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
    mdIcon?: string;
    hidden?: boolean;
    linkGroups: {
        name: string;
        links: INavbarLink[];
    }[];
}

export const NAVBAR_LINKS: INavbarLinkSection[] = [
    // NØKKELTALL
    {
        name: 'Nøkkeltall',
        url: '/',
        icon: 'key-figures',
        mdIcon: 'equalizer',
        linkGroups: [
            {
                name: '',
                links: [
                    {
                        name: 'Dashboard',
                        url: '/',
                        moduleID: UniModules.Dashboard,
                        routerLinkActiveExact: true

                    },
                    {
                        name: 'Selskaper',
                        url: '/bureau',
                        moduleID: UniModules.BureauDashboard
                    },
                    {
                        name: 'Markedsplass',
                        url: '/marketplace',
                        moduleID: UniModules.Marketplace
                    },
                    {
                        name: 'Mine oppgaver',
                        url: '/assignments',
                        moduleID: UniModules.Assignments
                    },
                ]
            },
            {
                name: 'Tall og rapporter',
                links: [
                    {
                        name: 'Oversikt',
                        url: '/overview',
                        moduleID: UniModules.UniTicker
                    },
                    {
                        name: 'Resultat og balanse',
                        url: '/accounting/accountingreports',
                        moduleID: UniModules.AccountingReports
                    },
                    {
                        name: 'Delinger',
                        url: '/sharings',
                        moduleID: UniModules.Sharings
                    },
                    {
                        name: 'Uttrekk',
                        url: '/uniqueries',
                        moduleID: UniModules.UniQuery
                    },
                    {
                        name: 'Rapporter',
                        url: '/reports',
                        moduleID: UniModules.Reports,
                        isSuperSearchComponent: true,
                        prefix: ['rapport'],
                        moduleName: 'ReportDefinition',
                        selects: [
                            {key: 'ID', isNumeric: false},
                            {key: 'Name', isNumeric: false},
                            {key: 'Description', isNumeric: false}
                        ]
                    },
                ]
            }
        ]
    },

    // SALG
    {
        name: 'Salg',
        url: '/sales',
        icon: 'sales',
        mdIcon: 'shopping_cart',
        linkGroups: [
            {
                name: '',
                links: [
                    {
                        name: 'Faktura',
                        url: '/sales/invoices',
                        moduleID: UniModules.Invoices,
                        isSuperSearchComponent: true,
                        moduleName: 'CustomerInvoice',
                        shortcutName: 'Ny faktura',
                        prefix: ['f', 'faktura'],
                        selects: [
                            {key: 'ID', isNumeric: true},
                            {key: 'InvoiceNumber', isNumeric: true},
                            {key: 'CustomerName', isNumeric: false}
                        ],
                        expands: ['customer']
                    },
                    {
                        name: 'Ordre',
                        url: '/sales/orders',
                        moduleID: UniModules.Orders,
                        isSuperSearchComponent: true,
                        moduleName: 'CustomerOrder',
                        shortcutName: 'Ny ordre',
                        prefix: ['o', 'ordre'],
                        selects: [
                            {key: 'ID', isNumeric: true},
                            {key: 'OrderNumber', isNumeric: true},
                            {key: 'CustomerName', isNumeric: false}
                        ],
                        expands: ['customer']
                    },
                    {
                        name: 'Tilbud',
                        url: '/sales/quotes',
                        moduleID: UniModules.Quotes,
                        isSuperSearchComponent: true,
                        moduleName: 'CustomerQuote',
                        shortcutName: 'Nytt tilbud',
                        prefix: ['t', 'tilbud'],
                        selects: [
                            {key: 'ID', isNumeric: true},
                            {key: 'QuoteNumber', isNumeric: true},
                            {key: 'CustomerName', isNumeric: false}
                        ],
                        expands: ['customer']
                    },
                    {
                        name: 'Purring',
                        url: '/sales/reminders',
                        moduleID: UniModules.Reminders
                    },
                    {
                        name: 'KID-innstillinger',
                        url: '/sales/kidsettings',
                        moduleID: UniModules.KIDSettings,
                    },
                ]
            },
            {
                name: 'Register',
                links: [
                    {
                        name: 'Kunder',
                        url: '/sales/customer',
                        moduleID: UniModules.Customers,
                        isSuperSearchComponent: true,
                        moduleName: 'Customer',
                        shortcutName: 'Ny kunde',
                        prefix: ['k', 'kunde'],
                        selects: [
                            {key: 'ID', isNumeric: true},
                            {key: 'CustomerNumber', isNumeric: true},
                            {key: 'BusinessRelation.Name', isNumeric: false}
                        ],
                        joins: ['Customer.BusinessRelationid eq BusinessRelation.id']
                    },
                    {
                        name: 'Produkter',
                        url: '/sales/products',
                        moduleID: UniModules.Products,
                        isSuperSearchComponent: true,
                        moduleName: 'Product',
                        shortcutName: 'Nytt produkt',
                        prefix: ['p', 'produkt'],
                        selects: [
                            {key: 'ID', isNumeric: true},
                            {key: 'PartName', isNumeric: false},
                            {key: 'Name', isNumeric: false}
                        ]
                    },
                    {
                        name: 'Produktgrupper',
                        url: '/sales/productgroups',
                        moduleID: UniModules.ProductGroup
                    },
                    {
                        name: 'Selgere',
                        url: '/sales/sellers',
                        moduleID: UniModules.Sellers
                    },
                    {
                        name: 'Valuta',
                        url: '/currency/exchange',
                        moduleID: UniModules.CurrencyExchange
                    }
                ]
            }
        ]
    },

    // REGNSKAP
    {
        name: 'Regnskap',
        url: '/accounting',
        icon: 'accounting',
        mdIcon: 'library_books',
        linkGroups: [
            {
                name: '',
                links: [
                    {
                        name: 'Bilagsføring',
                        url: '/accounting/journalentry',
                        moduleID: UniModules.Accounting
                    },
                    {
                        name: 'Fakturamottak',
                        url: '/accounting/bills',
                        moduleID: UniModules.Bills,
                        isSuperSearchComponent: true,
                        moduleName: 'SupplierInvoice',
                        shortcutName: 'Nytt fakturamottak',
                        prefix: ['fakturamottak'],
                        selects: [
                            {key: 'ID', isNumeric: true},
                            {key: 'InvoiceNumber', isNumeric: true},
                            {key: 'BusinessRelation.Name', isNumeric: false}
                        ],
                        joins: ['Supplier.BusinessRelationid eq BusinessRelation.id'],
                        expands: ['Supplier']
                    },
                    {
                        name: 'Åpne poster',
                        url: '/accounting/postpost',
                        moduleID: UniModules.PostPost
                    },
                    {
                        name: 'MVA-melding',
                        url: '/accounting/vatreport',
                        moduleID: UniModules.VatReport
                    },
                    {
                        name: 'Resultat og balanse',
                        url: '/accounting/accountingreports',
                        moduleID: UniModules.AccountingReports
                    },
                    {
                        name: 'Søk på bilag',
                        url: '/accounting/transquery',
                        moduleID: UniModules.TransqueryDetails
                    },
                    {
                        name: 'Søk på konto',
                        url: '/accounting/accountquery',
                        moduleID: UniModules.AccountQuery
                    }
                ]
            },
            {
                name: 'Register',
                links: [
                    {
                        name: 'Leverandør',
                        url: '/accounting/suppliers',
                        moduleID: UniModules.Suppliers,
                        isSuperSearchComponent: true,
                        moduleName: 'Supplier',
                        shortcutName: 'Ny leverandør',
                        prefix: ['l', 'leverandør'],
                        selects: [
                            {key: 'ID', isNumeric: true},
                            {key: 'SupplierNumber', isNumeric: true},
                            {key: 'BusinessRelation.Name', isNumeric: false}
                        ],
                        joins: ['Supplier.BusinessRelationid eq BusinessRelation.id']
                    },
                    {
                        name: 'Kontoplan',
                        url: '/accounting/accountsettings',
                        moduleID: UniModules.Accountsettings
                    },
                    {
                        name: 'MVA-innstillinger',
                        url: '/accounting/vatsettings',
                        moduleID: UniModules.Vatsettings
                    },
                    {
                        name: 'Valuta',
                        url: '/currency/exchange',
                        moduleID: UniModules.CurrencyExchange
                    },
                    {
                        name: 'Betaling',
                        url: '/accounting/journalentry/payments',
                        moduleID: UniModules.Payments
                    },
                ]
            }
        ]
    },

    // BANK
    {
        name: 'Bank',
        url: '/bank',
        icon: 'bank',
        mdIcon: 'account_balance',
        linkGroups: [{
            name: '',
            links: [
                {
                    name: 'Innbetalinger',
                    url: '/bank?code=bank_list',
                    moduleID: UniModules.Payment
                },
                {
                    name: 'Utbetalinger',
                    url: '/bank?code=payment_list',
                    moduleID: UniModules.Payment
                },
                {
                    name: 'Utbetalingsbunter',
                    url: '/bank?code=payment_batch_list',
                    moduleID: UniModules.Payment
                },
            ]
        }]
    },

    // LØNN
    {
        name: 'Lønn',
        url: '/salary',
        icon: 'salary',
        mdIcon: 'group',
        linkGroups: [
            {
                name: '',
                links: [
                    {
                        name: 'Lønnsavregning',
                        url: '/salary/payrollrun',
                        moduleID: UniModules.Payrollrun
                    },
                    {
                        name: 'A-Melding',
                        url: '/salary/amelding',
                        moduleID: UniModules.Amelding
                    },
                    {
                        name: 'Saldo',
                        url: '/salary/salarybalances',
                        moduleID: UniModules.Salarybalances
                    },
                    {
                        name: 'Tilleggsopplysninger',
                        url: '/salary/supplements',
                        moduleID: UniModules.Supplements
                    },
                    {
                        name: 'Årsoppgave til inntektsmottaker',
                        url: '/salary/annualstatements',
                        moduleID: UniModules.AnnualStatements
                    }
                ]
            },
            {
                name: 'Register',
                links: [
                    {
                        name: 'Ansatte',
                        url: '/salary/employees',
                        moduleID: UniModules.Employees,
                        isSuperSearchComponent: true,
                        moduleName: 'Employee',
                        shortcutName: 'Ny ansatt',
                        prefix: ['a', 'ansatt'],
                        selects: [
                            {key: 'ID', isNumeric: true},
                            {key: 'EmployeeNumber', isNumeric: true},
                            {key: 'BusinessRelation.Name', isNumeric: false}
                        ],
                        joins: ['Employee.BusinessRelationID eq BusinessRelation.ID']
                    },
                    {
                        name: 'Lønnsarter',
                        url: '/salary/wagetypes',
                        moduleID: UniModules.Wagetypes
                    },
                    {
                        name: 'Kategorier',
                        url: '/salary/employeecategories',
                        moduleID: UniModules.Categories
                    },
                    {
                        name: 'Altinn oversikt',
                        url: '/salary/altinnoverview',
                        moduleID: UniModules.AltinnOverview
                    }
                ]
            }
        ]
    },

    // TIMER
    {
        name: 'Timer',
        url: '/timetracking',
        icon: 'timetracking',
        mdIcon: 'watch_later',
        linkGroups: [
            {
                name: '',
                links: [
                    {
                        name: 'Timeregistrering',
                        url: '/timetracking/timeentry',
                        moduleID: UniModules.Timesheets
                    },
                    {
                        name: 'Fakturering av timer',
                        url: '/timetracking/invoice-hours',
                        moduleID: UniModules.Timesheets
                    },
                ]
            },
            {
                name: 'Register',
                links: [
                    {
                        name: 'Personer',
                        url: '/timetracking/workers',
                        moduleID: UniModules.Workers,
                    },
                    {
                        name: 'Timearter',
                        url: '/timetracking/worktypes',
                        moduleID: UniModules.WorkTypes
                    },
                    {
                        name: 'Stillingsmaler',
                        url: '/timetracking/workprofiles',
                        moduleID: UniModules.WorkProfiles
                    },
                ]
            }
        ]
    },

    // PROSJEKT
    {
        name: 'Prosjekt [BETA]',
        url: '/dimensions/projects',
        icon: 'projects',
        mdIcon: 'work',
        linkGroups: [{
            name: '',
            links: [
                {
                    name: 'Prosjekt',
                    url: '/dimensions/projects/overview',
                    moduleID: UniModules.Projects,
                    isSuperSearchComponent: true,
                    moduleName: 'Project',
                    prefix: ['prosjekt'],
                    selects: [
                        {key: 'ID', isNumeric: true},
                        {key: 'ProjectNumber', isNumeric: true},
                        {key: 'Name', isNumeric: false}
                    ]
                },
                {
                    name: 'Timer',
                    url: '/dimensions/projects/hours',
                    moduleID: UniModules.Projects
                },
            ]
        }]
    },

    // INNSTILLINGER
    {
        name: 'Innstillinger',
        url: '/settings',
        icon: 'settings',
        mdIcon: 'settings',
        hidden: true,
        linkGroups: [
            {
                name: '',
                links: [
                    {name: 'Firmaoppsett', url: '/settings/company'},
                    {name: 'Lønnsinnstillinger', url: '/settings/aga-and-subentities'},
                    {name: 'Integrasjon', url: '/settings/webhooks'},
                    {name: 'Brukere', url: '/settings/users'},
                    {name: 'Team', url: '/settings/teams'},
                    {name: 'Altinn', url: '/settings/altinn'},
                    {name: 'Nummerserier', url: '/settings/numberseries'},
                    {name: 'Betingelser', url: '/settings/terms'},
                    {name: 'Dimensjoner', url: '/settings/dimensions'},
                ]
            },
            {
                name: 'Admin',
                links: [
                    {
                        name: 'Regler',
                        url: '/admin/thresholds',
                        moduleID: UniModules.Thresholds
                    },
                    {
                        name: 'Jobber',
                        url: '/admin/jobs',
                        moduleID: UniModules.Jobs
                    },
                    {
                        name: 'Modeller',
                        url: '/admin/models',
                        moduleID: UniModules.Models
                    },
                    {
                        name: 'Roller',
                        url: '/admin/roles',
                        moduleID: UniModules.Roles
                    },
                    {
                        name: 'GDPR',
                        url: '/admin/gdpr',
                        moduleID: UniModules.GDPRList
                    },
                ]
            }
        ]
    }
];
