import {UniModules} from './tabstrip/tabService';
import {INavbarLinkSection} from './navbar-links-common';

export const NAVBAR_LINKS: INavbarLinkSection[] = [
    {
        name: 'NAVBAR.HOME',
        url: '/',
        icon: 'home',
        mdIcon: 'home',
        isOnlyLinkSection: true,
        megaMenuGroupIndex: 0,
        linkGroups: []
    },
    // SALGcon
    {
        name: 'NAVBAR.SALES',
        url: '/sales',
        icon: 'sales',
        mdIcon: 'shopping_cart',
        megaMenuGroupIndex: 0,
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
                        activeInSidebar: false,
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
                        activeInSidebar: false,
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
                        name: 'NAVBAR.REMINDER',
                        url: '/sales/reminders',
                        moduleID: UniModules.Reminders,
                        activeInSidebar: true
                    },
                    {
                        name: 'NAVBAR.KID_SETTINGS',
                        url: '/sales/kidsettings',
                        moduleID: UniModules.KIDSettings,
                        activeInSidebar: false
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
                        activeInSidebar: false,
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
                        activeInSidebar: false,
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
                        activeInSidebar: false
                    },
                    {
                        name: 'NAVBAR.SELLERS',
                        url: '/sales/sellers',
                        moduleID: UniModules.Sellers,
                        activeInSidebar: false
                    },
                    {
                        name: 'NAVBAR.CURRENCY',
                        url: '/currency/exchange',
                        moduleID: UniModules.CurrencyExchange,
                        activeInSidebar: false
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
        mdIcon: 'library_books',
        megaMenuGroupIndex: 1,
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
                        activeInSidebar: false
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
                        name: 'NAVBAR.RESULT_BALANCE',
                        url: '/accounting/accountingreports',
                        moduleID: UniModules.AccountingReports,
                        activeInSidebar: false
                    },
                    {
                        name: 'NAVBAR.SEARCH_JOURNALENTRY',
                        url: '/accounting/transquery',
                        moduleID: UniModules.TransqueryDetails,
                        activeInSidebar: false
                    },
                    {
                        name: 'NAVBAR.SEARCH_ACCOUNT',
                        url: '/accounting/accountquery',
                        moduleID: UniModules.AccountQuery,
                        activeInSidebar: false
                    }
                ]
            },
            {
                name: 'NAVBAR.REGISTER',
                links: [
                    {
                        name: 'NAVBAR.SUPPLIER',
                        url: '/accounting/suppliers',
                        moduleID: UniModules.Suppliers,
                        activeInSidebar: false,
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
                        activeInSidebar: false
                    },
                    {
                        name: 'NAVBAR.VAT_SETTINGS',
                        url: '/accounting/vatsettings',
                        moduleID: UniModules.Vatsettings,
                        activeInSidebar: false
                    },
                    {
                        name: 'NAVBAR.CURRENCY',
                        url: '/currency/exchange',
                        moduleID: UniModules.CurrencyExchange,
                        activeInSidebar: false
                    },
                    {
                        name: 'NAVBAR.COSTALLOCATION',
                        url: '/accounting/costallocation',
                        moduleID: UniModules.CostAllocation,
                        activeInSidebar: false
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
        mdIcon: 'account_balance',
        megaMenuGroupIndex: 2,
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
                }
            ]
        }]
    },

    // LØNN
    {
        name: 'NAVBAR.SALARY',
        url: '/salary',
        icon: 'salary',
        mdIcon: 'group',
        megaMenuGroupIndex: 3,
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
                        activeInSidebar: false
                    },
                    {
                        name: 'NAVBAR.ADDITIONAL_INFORMATION',
                        url: '/salary/supplements',
                        moduleID: UniModules.Supplements,
                        activeInSidebar: false
                    },
                    {
                        name: 'NAVBAR.ANNUAL_ASSIGNMENT',
                        url: '/salary/annualstatements',
                        moduleID: UniModules.AnnualStatements,
                        activeInSidebar: false
                    },
                    {
                        name: 'NAVBAR.OTP_EXPORT',
                        url: '/salary/otpexport',
                        moduleID: UniModules.OTPExport,
                        activeInSidebar: false
                    },
                    {
                        name: 'NAVBAR.VARIABLE_PAYROLLS',
                        url: '/salary/variablepayrolls',
                        moduleID: UniModules.VariablePayrolls,
                        activeInSidebar: false
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
                        activeInSidebar: false
                    },
                    {
                        name: 'NAVBAR.CATAGORIES',
                        url: '/salary/employeecategories',
                        moduleID: UniModules.Categories,
                        activeInSidebar: false
                    },
                    {
                        name: 'NAVBAR.MOVE_TEMPLATES',
                        url: '/salary/salarybalancetemplates',
                        moduleID: UniModules.SalarybalanceTemplates,
                        activeInSidebar: false
                    },
                    {
                        name: 'NAVBAR.ALTINN',
                        url: '/salary/altinnoverview',
                        moduleID: UniModules.AltinnOverview,
                        activeInSidebar: false
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
        mdIcon: 'watch_later',
        megaMenuGroupIndex: 2,
        linkGroups: [
            {
                name: '',
                links: [
                    {
                        name: 'NAVBAR.HOUR_REG',
                        url: '/timetracking/timeentry',
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
                        name: 'NAVBAR.PERSONS',
                        url: '/timetracking/workers',
                        moduleID: UniModules.Workers,
                        activeInSidebar: true,
                    },
                    {
                        name: 'NAVBAR.TYPES',
                        url: '/timetracking/worktypes',
                        moduleID: UniModules.WorkTypes,
                        activeInSidebar: false
                    },
                    {
                        name: 'NAVBAR.EMPLOYMENT_TEMPLATE',
                        url: '/timetracking/workprofiles',
                        moduleID: UniModules.WorkProfiles,
                        activeInSidebar: false
                    },
                    {
                        name: 'NAVBAR.ADMIN_DAYSOFF',
                        url: '/timetracking/worktimeoff',
                        moduleID: UniModules.WorkProfiles,
                        activeInSidebar: false
                    },
                ]
            }
        ]
    },
    {
        name: 'NAVBAR.OTHER',
        url: '',
        icon: 'all_inclusive',
        mdIcon: 'all_inclusive',
        megaMenuGroupIndex: 4,
        linkGroups: [
            {
                name: 'NAVBAR.OTHER',
                links: [
                    // MARKETPLACE
                    {
                        name: 'NAVBAR.COMPANIES',
                        url: '/bureau',
                        moduleID: UniModules.BureauDashboard,
                        activeInSidebar: false
                    },
                    {
                        name: 'NAVBAR.OVERVIEW',
                        url: '/overview',
                        moduleID: UniModules.UniTicker,
                        activeInSidebar: true
                    },
                    {
                        name: 'NAVBAR.APPROVALS',
                        url: '/assignments',
                        moduleID: UniModules.Assignments,
                        activeInSidebar: true
                    },
                    {
                        name: 'NAVBAR.EXTRACT',
                        url: '/uniqueries',
                        moduleID: UniModules.UniQuery,
                        activeInSidebar: false
                    },
                    {
                        name: 'Dimensjoner',
                        url: '/dimensions/overview/1',
                        moduleID: UniModules.UniQuery,
                        activeInSidebar: false
                    },
                    {
                        name: 'NAVBAR.DISTRIBUTION_LIST',
                        url: '/sharings',
                        moduleID: UniModules.Sharings,
                        activeInSidebar: false
                    },
                    {
                        name: 'NAVBAR.REPORTS',
                        url: '/reports',
                        moduleID: UniModules.Reports,
                        activeInSidebar: false,
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
            },
        ]
    },
    {
        name: 'NAVBAR.MARKEDPLACE',
        url: '/marketplace',
        icon: 'marketplace',
        mdIcon: 'shopping_basket',
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
                ]
            },
        ]
    },
];
