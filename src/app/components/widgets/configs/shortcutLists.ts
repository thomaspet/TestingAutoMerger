export const SHORTCUT_LISTS = [
    {
        id: 'shortcut_list_accounting',
        description: 'Snarveier - Regnskap',
        width: 2,
        height: 3,
        widgetType: 'shortcutlist',
        config: {
            header: 'Snarveier',
            shortcuts: [
                {
                    label: 'Bilagsføring',
                    link: '/accounting/journalentry/manual',
                    urlToNew: ''
                },
                {
                    label: 'Fakturamottak',
                    link: '/accounting/bills',
                    urlToNew: '/accounting/bills/0'
                },
                {
                    label: 'Åpne poster',
                    link: '/accounting/postpost',
                    urlToNew: ''
                },
                {
                    label: 'Forespørsel bilg',
                    link: '/accounting/transquery',
                    urlToNew: ''
                },
                {
                    label: 'Regnskapsoversikt',
                    link: '/accounting/accountingreports/result',
                    urlToNew: ''
                },
                {
                    label: 'MVA-melding',
                    link: '/accounting/vatreport',
                    urlToNew: ''
                },
                {
                    label: 'Kontoplan',
                    link: '/accounting/accountsettings',
                    urlToNew: ''
                },
                {
                    label: 'Leverandør',
                    link: '/accounting/suppliers',
                    urlToNew: '/accounting/suppliers/0'
                },
            ]
        }
    },
    {
        id: 'shortcut_list_sales',
        description: 'Snarveier - Salg',
        width: 2,
        height: 3,
        widgetType: 'shortcutlist',
        config: {
            header: 'Snarveier',
            shortcuts: [
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
                {
                    label: 'Purring',
                    link: '/sales/reminders/ready',
                    urlToNew: ''
                },
                {
                    label: 'Tilbud',
                    link: '/sales/quotes',
                    urlToNew: '/sales/quotes/0'
                },
                {
                    label: 'Ordre',
                    link: '/sales/orders',
                    urlToNew: '/sales/orders/0'
                },
                {
                    label: 'Faktura',
                    link: '/sales/invoices',
                    urlToNew: '/sales/invoices/0'
                },
            ]
        }
    },
    {
        id: 'shortcut_list_salary',
        description: 'Snarveier - Lønn',
        width: 2,
        height: 3,
        widgetType: 'shortcutlist',
        config: {
            header: 'Snarveier',
            shortcuts: [
                {
                    label: 'Ansatte',
                    link: '/salary/employees',
                    urlToNew: '/salary/employees/0'
                },
                {
                    label: 'Lønnsarter',
                    link: '/salary/wagetypes',
                    urlToNew: '/salary/wagetypes/0/details'
                },
                {
                    label: 'Kategorier',
                    link: '/salary/employeecategories',
                    urlToNew: '/salary/employeecategories/0/details'
                },
                {
                    label: 'Lønnsavregning',
                    link: '/salary/payrollrun',
                    urlToNew: '/salary/payrollrun/0'
                },
                {
                    label: 'A-melding',
                    link: '/salary/amelding',
                    urlToNew: ''
                },
                {
                    label: 'Saldo',
                    link: '/salary/salarybalances',
                    urlToNew: '/salary/salarybalances/0/details'
                },
                {
                    label: 'Tilleggsopplysninger',
                    link: '/salary/supplements',
                    urlToNew: ''
                }
            ]
        }
    },
    {
        id: 'shortcut_list_timetracking',
        description: 'Snarveier - Timeføring',
        permissions: ['ui_timetracking_workers', 'ui_timetracking_worktypes'],
        width: 2,
        height: 3,
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
];
