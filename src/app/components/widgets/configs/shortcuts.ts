const MAIN_SHORTCUTS = [
    {
        id: 'shortcut_accounting',
        description: 'Regnskap',
        permissions: ['ui_accounting'],
        width: 1,
        height: 1,
        widgetType: 'shortcut',
        config: {
            icon: 'accounting',
            link: '/accounting'
        }
    },
    {
        id: 'shortcut_sales',
        description: 'Salg',
        permissions: ['ui_sales'],
        width: 1,
        height: 1,
        widgetType: 'shortcut',
        config: {
            icon: 'sale',
            link: '/sales'
        }
    },
    {
        id: 'shortcut_salary',
        description: 'Lønn',
        permissions: ['ui_salary'],
        width: 1,
        height: 1,
        widgetType: 'shortcut',
        config: {
            icon: 'payroll',
            link: '/salary'
        }
    },
    {
        id: 'shortcut_bank',
        description: 'Bank',
        permissions: ['ui_bank'],
        width: 1,
        height: 1,
        widgetType: 'shortcut',
        config: {
            icon: 'bank',
            link: '/bank'
        }
    },
    {
        id: 'shortcut_timetracking',
        description: 'Timer',
        permissions: ['ui_timetracking'],
        width: 1,
        height: 1,
        widgetType: 'shortcut',
        config: {
            icon: 'hourreg',
            link: '/timetracking'
        }
    },
    {
        id: 'shortcut_overview',
        description: 'Oversikt',
        permissions: ['ui_overview'],
        width: 1,
        height: 1,
        widgetType: 'shortcut',
        config: {
            icon: 'search',
            link: '/overview'
        }
    }
];

const ACCOUNTING_SHORTCUTS = [
    {
        id: 'shortcut_accounting_journalentry',
        description: 'Føre bilag',
        permissions: ['ui_accounting_journalentry'],
        width: 1,
        height: 1,
        widgetType: 'shortcut',
        config: {
            icon: 'journalentry',
            link: '/accounting/journalentry/manual'
        }
    },
    {
        id: 'shortcut_accounting_bills',
        description: 'Fakturamottak',
        permissions: ['ui_accounting_bills'],
        width: 1,
        height: 1,
        widgetType: 'shortcut',
        config: {
            icon: 'supplierinvoice',
            link: '/accounting/bills'
        }
    },
    {
        id: 'shortcut_accounting_transquery',
        description: 'Søk bilag',
        permissions: ['ui_accounting_transquery'],
        width: 1,
        height: 1,
        widgetType: 'shortcut',
        config: {
            icon: 'magnifying',
            link: '/accounting/transquery/details'
        }
    },
    {
        id: 'shortcut_accounting_accountingreports',
        description: 'Rapporter',
        permissions: ['ui_accounting_accountingreports'],
        width: 1,
        height: 1,
        widgetType: 'shortcut',
        config: {
            icon: 'accountingreport',
            link: '/accounting/accountingreports/result'
        }
    },
    {
        id: 'shortcut_accounting_vatreport',
        description: 'MVA-melding',
        permissions: ['ui_accounting_vatreport'],
        width: 1,
        height: 1,
        widgetType: 'shortcut',
        config: {
            icon: 'mva',
            link: '/accounting/vatreport'
        }
    }
];

const SALES_SHORTCUTS = [
    {
        id: 'shortcut_sales_customers',
        description: 'Kunder',
        permissions: ['ui_sales_customer'],
        width: 1,
        height: 1,
        widgetType: 'shortcut',
        config: {
            icon: 'customer',
            link: '/sales/customer'
        }
    },
    {
        id: 'shortcut_sales_products',
        description: 'Produkter',
        permissions: ['ui_sales_products'],
        width: 1,
        height: 1,
        widgetType: 'shortcut',
        config: {
            icon: 'product',
            link: '/sales/products'
        }
    },
    {
        id: 'shortcut_sales_quotes',
        description: 'Tilbud',
        permissions: ['ui_sales_quotes'],
        width: 1,
        height: 1,
        widgetType: 'shortcut',
        config: {
            icon: '',
            link: '/sales/quotes',
            letterForIcon: 'T',
            letterIconClass: 'letterIconStyling'
        }
    },
    {
        id: 'shortcut_sales_orders',
        description: 'Ordre',
        permissions: ['ui_sales_orders'],
        width: 1,
        height: 1,
        widgetType: 'shortcut',
        config: {
            icon: '',
            link: '/sales/orders',
            letterForIcon: 'O',
            letterIconClass: 'letterIconStyling'
        }
    },
    {
        id: 'shortcut_sales_invoices',
        description: 'Faktura',
        permissions: ['ui_sales_invoices'],
        width: 1,
        height: 1,
        widgetType: 'shortcut',
        config: {
            icon: '',
            link: '/sales/invoices',
            letterForIcon: 'F',
            letterIconClass: 'letterIconStyling'
        }
    },
];

const SALARY_SHORTCUTS = [
    {
        id: 'shortcut_salary_employees',
        description: 'Ansatte',
        permissions: ['ui_salary_employees'],
        width: 1,
        height: 1,
        widgetType: 'shortcut',
        config: {
            icon: 'employee',
            link: '/salary/employees'
        }
    },
    {
        id: 'shortcut_salary_wagetypes',
        description: 'Lønnsarter',
        permissions: ['ui_salary_wagetypes'],
        width: 1,
        height: 1,
        widgetType: 'shortcut',
        config: {
            icon: 'wagetype',
            link: '/salary/wagetypes'
        }
    },
    {
        id: 'shortcut_salary_payrollrun',
        description: 'Lønnsavregninger',
        permissions: ['ui_salary_payrollrun'],
        width: 1,
        height: 1,
        widgetType: 'shortcut',
        config: {
            icon: 'payrollrun',
            link: '/salary/payrollrun'
        }
    },
    {
        id: 'shortcut_salary_amelding',
        description: 'A-melding',
        permissions: ['ui_salary_amelding'],
        width: 1,
        height: 1,
        widgetType: 'shortcut',
        config: {
            icon: 'amelding',
            link: '/salary/amelding'
        }
    },
];

const TIMETRACKING_SHORTCUTS = [
    {
        id: 'shortcut_timetracking_worktypes',
        description: 'Timearter',
        permissions: ['ui_timetracking_workers', 'ui_timetracking_worktypes'],
        width: 1,
        height: 1,
        widgetType: 'shortcut',
        config: {
            icon: 'wagetype',
            link: '/timetracking/worktypes'
        }
    },
    {
        id: 'shortcut_timetracking_workers',
        description: 'Personer',
        permissions: ['ui_timetracking_workers', 'ui_timetracking_worktypes'],
        width: 1,
        height: 1,
        widgetType: 'shortcut',
        config: {
            icon: 'employee',
            link: '/timetracking/workers'
        }
    },
    {
        id: 'shortcut_timetracking_invoice_hours',
        description: 'Fakturere timer',
        permissions: [
            'ui_sales_orders',
            'ui_timetracking_invoice-hours'
        ],
        width: 1,
        height: 1,
        widgetType: 'shortcut',
        config: {
            icon: 'sale',
            link: '/timetracking/invoice-hours'
        }
    },
    {
        id: 'shortcut_timetracking_reports',
        description: 'Rapporter',
        permissions: ['ui_reports'],
        width: 1,
        height: 1,
        widgetType: 'shortcut',
        config: {
            icon: '',
            link: '/reports?category=timetracking',
            letterForIcon: 'R',
            letterIconClass: 'letterIconStyling'
        }
    },
    {
        id: 'shortcut_timetracking_timeentry',
        description: 'Timeføring',
        width: 1,
        height: 1,
        widgetType: 'shortcut',
        config: {
            icon: 'hourreg',
            link: '/timetracking/timeentry'
        }
    },
];

export const SHORTCUTS = [
    ...MAIN_SHORTCUTS,
    ...ACCOUNTING_SHORTCUTS,
    ...SALES_SHORTCUTS,
    ...SALARY_SHORTCUTS,
    ...TIMETRACKING_SHORTCUTS
];
