import {UniModules} from './tabstrip/tabService';
import {INavbarLinkSection} from './navbar-links-common';

export const NAVBAR_LINKS: INavbarLinkSection[] = [
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
                        moduleID: UniModules.Dashboard,
                        routerLinkActiveExact: true,
                        activeInSidebar: true

                    },
                    {
                        name: 'NAVBAR.COMPANIES',
                        url: '/bureau',
                        moduleID: UniModules.BureauDashboard,
                        activeInSidebar: true
                    },
                    {
                        name: 'NAVBAR.APPROVALS',
                        url: '/assignments',
                        moduleID: UniModules.Assignments,
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
                        moduleID: UniModules.UniTicker,
                        activeInSidebar: true
                    },
                    {
                        name: 'NAVBAR.DISTRIBUTION_LIST',
                        url: '/sharings',
                        moduleID: UniModules.Sharings,
                        activeInSidebar: true
                    },
                    {
                        name: 'NAVBAR.EXTRACT',
                        url: '/uniqueries',
                        moduleID: UniModules.UniQuery,
                        activeInSidebar: true
                    },
                    {
                        name: 'NAVBAR.REPORTS',
                        url: '/reports',
                        moduleID: UniModules.Reports,
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
                        moduleID: UniModules.Invoices,
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
                        moduleID: UniModules.Orders,
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
                        moduleID: UniModules.Quotes,
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
                        moduleID: UniModules.Reminders,
                        activeInSidebar: true
                    },
                    {
                        name: 'NAVBAR.KID_SETTINGS',
                        url: '/sales/kidsettings',
                        moduleID: UniModules.KIDSettings,
                        activeInSidebar: true
                    },
                    {
                        name: 'NAVBAR.RECURRING_INVOICE',
                        url: '/sales/recurringinvoice',
                        moduleID: UniModules.RecurringInvoice,
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
                        moduleID: UniModules.Customers,
                        activeInSidebar: true,
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
                        name: 'NAVBAR.PRODUCTS',
                        url: '/sales/products',
                        moduleID: UniModules.Products,
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
                        moduleID: UniModules.ProductGroup,
                        activeInSidebar: true
                    },
                    {
                        name: 'NAVBAR.SELLERS',
                        url: '/sales/sellers',
                        moduleID: UniModules.Sellers,
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
                        moduleID: UniModules.Accounting,
                        activeInSidebar: true
                    },
                    {
                        name: 'NAVBAR.SUPPLIER_INVOICE',
                        url: '/accounting/bills',
                        moduleID: UniModules.Bills,
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
                        moduleID: UniModules.Budget,
                        activeInSidebar: true
                    },
                    {
                        name: 'NAVBAR.OPEN_POST',
                        url: '/accounting/postpost',
                        moduleID: UniModules.PostPost,
                        activeInSidebar: true
                    },
                    {
                        name: 'NAVBAR.VAT_MESSAGE',
                        url: '/accounting/vatreport',
                        moduleID: UniModules.VatReport,
                        activeInSidebar: true
                    },
                    {
                        name: 'NAVBAR.SEARCH_JOURNALENTRY',
                        url: '/accounting/transquery',
                        moduleID: UniModules.TransqueryDetails,
                        activeInSidebar: true
                    },
                    {
                        name: 'NAVBAR.SEARCH_ACCOUNT',
                        url: '/accounting/accountquery',
                        moduleID: UniModules.AccountQuery,
                        activeInSidebar: true
                    },
                    {
                        name: 'NAVBAR.RESULT_BALANCE',
                        url: '/accounting/accountingreports',
                        moduleID: UniModules.AccountingReports,
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
                        moduleID: UniModules.Suppliers,
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
                        moduleID: UniModules.Accountsettings,
                        activeInSidebar: true
                    },
                    {
                        name: 'NAVBAR.VAT_SETTINGS',
                        url: '/accounting/vatsettings',
                        moduleID: UniModules.Vatsettings,
                        activeInSidebar: true
                    },
                    {
                        name: 'NAVBAR.CURRENCY',
                        url: '/currency/exchange',
                        moduleID: UniModules.CurrencyExchange,
                        activeInSidebar: true
                    },
                    {
                        name: 'NAVBAR.COSTALLOCATION',
                        url: '/accounting/costallocation',
                        moduleID: UniModules.CostAllocation,
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
                    moduleID: UniModules.Payment,
                    activeInSidebar: true
                },
                {
                    name: 'NAVBAR.PAYMENTS',
                    url: '/bank/ticker?code=payment_list',
                    moduleID: UniModules.Payment,
                    activeInSidebar: true
                },
                {
                    name: 'NAVBAR.PAYMENT_BATCH',
                    url: '/bank/ticker?code=payment_batch_list',
                    moduleID: UniModules.Payment,
                    activeInSidebar: true
                },
                {
                    name: 'NAVBAR.PAYMENT_BATCH_AUTO',
                    url: '/bank/ticker?code=avtalegiro_list',
                    moduleID: UniModules.Payment,
                    activeInSidebar: true
                },
                {
                    name: 'NAVBAR.BANK_RECONCILIATION',
                    url: '/bank/reconciliation',
                    moduleID: UniModules.BankReconciliation,
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
                        moduleID: UniModules.Payrollrun,
                        activeInSidebar: true
                    },
                    {
                        name: 'NAVBAR.AMELDING',
                        url: '/salary/amelding',
                        moduleID: UniModules.Amelding,
                        activeInSidebar: true
                    },
                    {
                        name: 'NAVBAR.BALANCE',
                        url: '/salary/salarybalances',
                        moduleID: UniModules.Salarybalances,
                        activeInSidebar: true
                    },
                    {
                        name: 'NAVBAR.ADDITIONAL_INFORMATION',
                        url: '/salary/supplements',
                        moduleID: UniModules.Supplements,
                        activeInSidebar: true
                    },
                    {
                        name: 'NAVBAR.ANNUAL_ASSIGNMENT',
                        url: '/salary/annualstatements',
                        moduleID: UniModules.AnnualStatements,
                        activeInSidebar: true
                    },
                    {
                        name: 'NAVBAR.OTP_EXPORT',
                        url: '/salary/otpexport',
                        moduleID: UniModules.OTPExport,
                        activeInSidebar: true
                    },
                    {
                        name: 'NAVBAR.VARIABLE_PAYROLLS',
                        url: '/salary/variablepayrolls',
                        moduleID: UniModules.VariablePayrolls,
                        activeInSidebar: true
                    },
                    {
                        name: 'NAVBAR.REGULATIVE',
                        url: '/salary/regulative',
                        moduleID: UniModules.Regulative,
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
                        moduleID: UniModules.Employees,
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
                        moduleID: UniModules.Wagetypes,
                        activeInSidebar: true
                    },
                    {
                        name: 'NAVBAR.CATAGORIES',
                        url: '/salary/employeecategories',
                        moduleID: UniModules.Categories,
                        activeInSidebar: true
                    },
                    {
                        name: 'NAVBAR.MOVE_TEMPLATES',
                        url: '/salary/salarybalancetemplates',
                        moduleID: UniModules.SalarybalanceTemplates,
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
                        moduleID: UniModules.Timesheets,
                        activeInSidebar: true
                    },
                    {
                        name: 'NAVBAR.BILLING_HOURS',
                        url: '/timetracking/invoice-hours',
                        moduleID: UniModules.InvoiceHours,
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
                        moduleID: UniModules.HourTotals,
                        activeInSidebar: true,
                    },
                    {
                        name: 'NAVBAR.PERSONS',
                        url: '/timetracking/workers',
                        moduleID: UniModules.Workers,
                        activeInSidebar: true,
                    },
                    {
                        name: 'NAVBAR.TYPES',
                        url: '/timetracking/worktypes',
                        moduleID: UniModules.WorkTypes,
                        activeInSidebar: true
                    },
                    {
                        name: 'NAVBAR.EMPLOYMENT_TEMPLATE',
                        url: '/timetracking/workprofiles',
                        moduleID: UniModules.WorkProfiles,
                        activeInSidebar: true
                    },
                    {
                        name: 'NAVBAR.ADMIN_DAYSOFF',
                        url: '/timetracking/worktimeoff',
                        moduleID: UniModules.WorkProfiles,
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
                    moduleID: UniModules.Projects,
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
                    moduleID: UniModules.Projects,
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
                        moduleID: UniModules.AltinnOverview,
                        activeInSidebar: true
                    },
                    {
                        name: 'Altinn - Innstillinger',
                        url: '/altinn/settings',
                        moduleID: UniModules.AltinnOverview,
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
                        moduleID: UniModules.Marketplace,
                        activeInSidebar: true
                    },
                    {
                        name: 'NAVBAR.INTEGRATION',
                        url: '/marketplace/integrations',
                        moduleID: UniModules.Marketplace,
                        activeInSidebar: true
                    },
                    {
                        name: 'NAVBAR.PURCHASES',
                        url: '/marketplace/purchases',
                        moduleID: UniModules.Marketplace,
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
