import {INavbarLinkSection} from './navbar-links-common';

export let NAVBAR_LINKS: INavbarLinkSection[] = [
    // NØKKELTALL
    {
        name: 'NAVBAR.KPI',
        url: '',
        icon: 'home',
        megaMenuGroupIndex: 0,
        linkGroups: [
            {
                name: '',
                links: [
                    {
                        name: 'NAVBAR.DASHBOARD',
                        url: '/',
                        routerLinkActiveExact: true,
                        activeInSidebar: true

                    },
                    {
                        name: 'NAVBAR.COMPANIES',
                        url: '/bureau',
                        activeInSidebar: true
                    },
                    {
                        name: 'NAVBAR.APPROVALS',
                        url: '/assignments',
                        activeInSidebar: true
                    },
                ]
            },
            {
                name: 'NAVBAR.NUMBER_AND_REPORTS',
                links: [
                    {
                        name: 'NAVBAR.OVERVIEW',
                        url: '/overview',
                        activeInSidebar: true
                    },
                    {
                        name: 'NAVBAR.DISTRIBUTION_LIST',
                        url: '/sharings',
                        activeInSidebar: true
                    },
                    {
                        name: 'NAVBAR.EXTRACT',
                        url: '/uniqueries',
                        activeInSidebar: true
                    },
                    {
                        name: 'NAVBAR.REPORTS',
                        url: '/reports',
                        activeInSidebar: true,
                        isSuperSearchComponent: true,
                        prefix: ['rapport'],
                        moduleName: 'ReportDefinition',
                        predefinedFilter: `( visible ne 'false' and isstandard ne 'false' )`,
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
        name: 'NAVBAR.SALES',
        url: '/sales',
        icon: 'sales',
        megaMenuGroupIndex: 1,
        linkGroups: [
            {
                name: '',
                links: [
                    {
                        name: 'NAVBAR.INVOICE',
                        url: '/sales/invoices',
                        activeInSidebar: true,
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
                        name: 'NAVBAR.ORDER',
                        url: '/sales/orders',
                        activeInSidebar: true,
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
                        name: 'NAVBAR.QUOTE',
                        url: '/sales/quotes',
                        activeInSidebar: true,
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
                        name: 'NAVBAR.BATCH_INVOICE',
                        url: '/sales/batch-invoices',
                        activeInSidebar: true,
                    },
                    {
                        name: 'NAVBAR.REMINDER',
                        url: '/sales/reminders',
                        activeInSidebar: true
                    },
                    {
                        name: 'NAVBAR.RECURRING_INVOICE',
                        url: '/sales/recurringinvoice',
                        activeInSidebar: true
                    },
                ]
            },
            {
                name: 'NAVBAR.REGISTER',
                links: [
                    {
                        name: 'NAVBAR.CUSTOMER',
                        url: '/sales/customer',
                        activeInSidebar: true,
                        isSuperSearchComponent: true,
                        moduleName: 'Customer',
                        shortcutName: 'Ny kunde',
                        prefix: ['k', 'kunde'],
                        selects: [
                            {key: 'ID', isNumeric: true},
                            {key: 'CustomerNumber', isNumeric: true},
                            {key: 'BusinessRelation.Name', isNumeric: false},
                            {key: `isnull(SocialSecurityNumber,'')`, isNumeric: true}
                        ],
                        joins: ['Customer.BusinessRelationid eq BusinessRelation.id']
                    },
                    {
                        name: 'NAVBAR.PRODUCTS',
                        url: '/sales/products',
                        activeInSidebar: true,
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
                        name: 'NAVBAR.PRODUCT_GROUP',
                        url: '/sales/productgroups',
                        activeInSidebar: true
                    },
                    {
                        name: 'NAVBAR.SELLERS',
                        url: '/sales/sellers',
                        activeInSidebar: true
                    }
                ]
            }
        ]
    },
    // REGNSKAP
    {
        name: 'NAVBAR.ACCOUNTING',
        url: '/accounting',
        icon: 'accounting',
        megaMenuGroupIndex: 2,
        linkGroups: [
            {
                name: '',
                links: [
                    {
                        name: 'NAVBAR.JOURNALENTRY',
                        url: '/accounting/journalentry',
                        activeInSidebar: true
                    },
                    {
                        name: 'NAVBAR.SUPPLIER_INVOICE',
                        url: '/accounting/bills',
                        activeInSidebar: true,
                        isSuperSearchComponent: true,
                        moduleName: 'SupplierInvoice',
                        shortcutName: 'Ny leverandørfaktura',
                        prefix: ['lf', 'leverandørfaktura'],
                        selects: [
                            {key: 'ID', isNumeric: true},
                            {key: 'InvoiceNumber', isNumeric: true},
                            {key: 'BusinessRelation.Name', isNumeric: false}
                        ],
                        joins: ['Supplier.BusinessRelationid eq BusinessRelation.id'],
                        expands: ['Supplier']
                    },
                    {
                        name: 'NAVBAR.BUDGET',
                        url: '/accounting/budget',
                        activeInSidebar: true
                    },
                    {
                        name: 'NAVBAR.OPEN_POST',
                        url: '/accounting/postpost',
                        activeInSidebar: true
                    },
                    {
                        name: 'NAVBAR.VAT_MESSAGE',
                        url: '/accounting/vatreport',
                        activeInSidebar: true
                    },
                    {
                        name: 'NAVBAR.ANNUAL_SETTLEMENT',
                        url: '/accounting/annual-settlement',
                        activeInSidebar: true
                    },
                    {
                        name: 'NAVBAR.ASSETS',
                        url: '/accounting/assets',
                        activeInSidebar: true
                    },
                    {
                        name: 'NAVBAR.BALANCE_SEARCH',
                        url: '/accounting/balancesearch',
                        activeInSidebar: true
                    },
                    {
                        name: 'NAVBAR.SEARCH_JOURNALENTRY',
                        url: '/accounting/transquery',
                        activeInSidebar: true
                    },
                    {
                        name: 'NAVBAR.SEARCH_ACCOUNT',
                        url: '/accounting/accountquery',
                        activeInSidebar: true
                    },
                    {
                        name: 'NAVBAR.RESULT_BALANCE',
                        url: '/accounting/accountingreports',
                        activeInSidebar: true
                    },
                ]
            },
            {
                name: 'NAVBAR.REGISTER',
                links: [
                    {
                        name: 'NAVBAR.SUPPLIER',
                        url: '/accounting/suppliers',
                        activeInSidebar: true,
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
                        name: 'NAVBAR.ACCOUNT_PLAN',
                        url: '/accounting/accountsettings',
                        activeInSidebar: true
                    },
                    {
                        name: 'NAVBAR.CURRENCY',
                        url: '/currency/exchange',
                        activeInSidebar: true
                    },
                    {
                        name: 'NAVBAR.COSTALLOCATION',
                        url: '/accounting/costallocation',
                        activeInSidebar: true
                    }
                ]
            }
        ]
    },

    // BANK
    {
        name: 'NAVBAR.BANK',
        url: '/bank',
        icon: 'bank',
        megaMenuGroupIndex: 3,
        linkGroups: [{
            name: '',
            links: [
                {
                    name: 'NAVBAR.PROCEEDS',
                    url: '/bank/ticker?code=bank_list',
                    activeInSidebar: true
                },
                {
                    name: 'NAVBAR.PAYMENTS',
                    url: '/bank/ticker?code=payment_list',
                    activeInSidebar: true
                },
                {
                    name: 'NAVBAR.PAYMENT_BATCH',
                    url: '/bank/ticker?code=payment_batch_list',
                    activeInSidebar: true
                },
                {
                    name: 'NAVBAR.PAYMENT_BATCH_AUTO',
                    url: '/bank/ticker?code=avtalegiro_list',
                    activeInSidebar: true
                },
                {
                    name: 'NAVBAR.BANK_RECONCILIATION',
                    url: '/bank/reconciliation',
                    activeInSidebar: true
                },
            ]
        }]
    },

    // LØNN
    {
        name: 'NAVBAR.SALARY',
        url: '/salary',
        icon: 'salary',
        megaMenuGroupIndex: 4,
        linkGroups: [
            {
                name: '',
                links: [
                    {
                        name: 'NAVBAR.PAYROLL',
                        url: '/salary/payrollrun',
                        activeInSidebar: true
                    },
                    {
                        name: 'NAVBAR.AMELDING',
                        url: '/salary/amelding',
                        activeInSidebar: true
                    },
                    {
                        name: 'NAVBAR.INCOMEREPORTS',
                        url: '/salary/incomereports',
                        activeInSidebar: true
                    },
                    {
                        name: 'NAVBAR.BALANCE',
                        url: '/salary/salarybalances',
                        activeInSidebar: true
                    },
                    {
                        name: 'NAVBAR.ADDITIONAL_INFORMATION',
                        url: '/salary/supplements',
                        activeInSidebar: true
                    },
                    {
                        name: 'NAVBAR.ANNUAL_ASSIGNMENT',
                        url: '/salary/annualstatements',
                        activeInSidebar: true
                    },
                    {
                        name: 'NAVBAR.OTP_EXPORT',
                        url: '/salary/otpexport',
                        activeInSidebar: true
                    },
                    {
                        name: 'NAVBAR.VARIABLE_PAYROLLS',
                        url: '/salary/variablepayrolls',
                        activeInSidebar: true
                    },
                    {
                        name: 'NAVBAR.REGULATIVE',
                        url: '/salary/regulative',
                        activeInSidebar: true
                    }
                ]
            },
            {
                name: 'NAVBAR.REGISTER',
                links: [
                    {
                        name: 'NAVBAR.EMPLOYEES',
                        url: '/salary/employees',
                        activeInSidebar: true,
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
                        name: 'NAVBAR.WAGETYPE',
                        url: '/salary/wagetypes',
                        activeInSidebar: true
                    },
                    {
                        name: 'NAVBAR.CATAGORIES',
                        url: '/salary/employeecategories',
                        activeInSidebar: true
                    },
                    {
                        name: 'NAVBAR.MOVE_TEMPLATES',
                        url: '/salary/salarybalancetemplates',
                        activeInSidebar: true
                    }
                ]
            }
        ]
    },

    // TIMER
    {
        name: 'NAVBAR.HOURS',
        url: '/timetracking',
        icon: 'timetracking',
        megaMenuGroupIndex: 3,
        linkGroups: [
            {
                name: '',
                links: [
                    {
                        name: 'NAVBAR.HOUR_REG',
                        url: '/timetracking/timeentry?mode=Registrering',
                        activeInSidebar: true
                    },
                    {
                        name: 'NAVBAR.BILLING_HOURS',
                        url: '/timetracking/invoice-hours',
                        activeInSidebar: true
                    },
                ]
            },
            {
                name: 'NAVBAR.REGISTER',
                links: [
                    {
                        name: 'TIMETRACKING.HOURTOTALS',
                        url: '/timetracking/hourtotals',
                        activeInSidebar: true,
                    },
                    {
                        name: 'NAVBAR.PERSONS',
                        url: '/timetracking/workers',
                        activeInSidebar: true,
                    },
                    {
                        name: 'NAVBAR.TYPES',
                        url: '/timetracking/worktypes',
                        activeInSidebar: true
                    },
                    {
                        name: 'NAVBAR.EMPLOYMENT_TEMPLATE',
                        url: '/timetracking/workprofiles',
                        activeInSidebar: true
                    },
                    {
                        name: 'NAVBAR.ADMIN_DAYSOFF',
                        url: '/timetracking/worktimeoff',
                        activeInSidebar: true
                    },
                ]
            }
        ]
    },

    // PROSJEKT
    {
        name: 'NAVBAR.PROJECT_BETA',
        url: '/dimensions',
        icon: 'project',
        megaMenuGroupIndex: 1,
        linkGroups: [{
            name: '',
            links: [
                {
                    name: 'NAVBAR.PROJECT',
                    url: '/dimensions/projects/overview',
                    activeInSidebar: true,
                    isSuperSearchComponent: true,
                    moduleName: 'Project',
                    prefix: ['prosjekt'],
                    selects: [
                        {key: 'ID', isNumeric: true},
                        {key: 'ProjectNumber', isNumeric: false},
                        {key: 'Name', isNumeric: false}
                    ]
                },
                {
                    name: 'NAVBAR.HOURS',
                    url: '/dimensions/projects/hours',
                    activeInSidebar: true
                },
            ]
        }]
    },

    // ALTINN
    {
        name: 'Altinn',
        url: '/altinn',
        icon: 'altinn',
        megaMenuGroupIndex: 2,
        linkGroups: [
            {
                name: 'NAVBAR.REGISTER',
                links: [
                    {
                        name: 'Oversikt',
                        url: '/altinn/overview',
                        activeInSidebar: true
                    },
                    {
                        name: 'Altinn - Innstillinger',
                        url: '/altinn/settings',
                        activeInSidebar: true
                    }
                ]
            }
        ]
    },

    // MARKETPLACE
    {
        name: 'NAVBAR.MARKETPLACE',
        url: '/marketplace',
        icon: 'marketplace',
        megaMenuGroupIndex: 4,
        linkGroups: [
            {
                name: '',
                links: [
                    {
                        name: 'NAVBAR.MODULES',
                        url: '/marketplace/modules',
                        activeInSidebar: true
                    },
                    {
                        name: 'NAVBAR.INTEGRATION',
                        url: '/marketplace/integrations',
                        activeInSidebar: true
                    },
                    {
                        name: 'NAVBAR.PURCHASES',
                        url: '/marketplace/purchases',
                        activeInSidebar: true
                    },
                ]
            },
        ]
    },
    {
        name: 'NAVBAR.SETTINGS',
        url: '/settings',
        icon: 'settings',
        isOnlyLinkSection: true,
        megaMenuGroupIndex: 0,
        linkGroups: []
    },
];
