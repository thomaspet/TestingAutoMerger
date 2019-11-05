export const SHORTCUT_LISTS = [
    {
        id: 'shortcuts_main',
        description: 'Snarveier - Hjem',
        width: 6,
        height: 1,
        widgetType: 'shortcuts',
        config: {
            shortcuts: [
                {
                    label: 'Regnskap',
                    url: '/accounting',
                    icon: 'library_books'
                },
                {
                    label: 'Salg',
                    url: '/sales',
                    icon: 'shopping_cart'
                },
                {
                    label: 'Lønn',
                    url: '/salary',
                    icon: 'group'
                },
                {
                    label: 'Bank',
                    url: '/bank',
                    icon: 'account_balance'
                },
                {
                    label: 'Timer',
                    url: '/timetracking',
                    icon: 'watch_later'
                },
                {
                    label: 'Oversikt',
                    url: '/overview',
                    icon: 'search'
                },
            ]
        }
    },

    {
        id: 'shortcuts_accounting',
        description: 'Snarveier - Regnskap',
        width: 6,
        height: 1,
        widgetType: 'shortcuts',
        config: {
            shortcuts: [
                {
                    label: 'Bilagsføring',
                    url: '/accounting/journalentry/manual',
                    icon: 'chrome_reader_mode'
                },
                {
                    label: 'Leverandørfaktura',
                    url: '/accounting/bills',
                    icon: 'description'
                },
                {
                    label: 'Søk på bilag',
                    url: '/accounting/transquery',
                    icon: 'search'
                },
                {
                    label: 'Resultat og balanse',
                    url: '/accounting/accountingreports/result',
                    icon: 'insert_chart'
                },
                {
                    label: 'MVA-melding',
                    url: '/accounting/vatreport',
                    icon: 'assignment'
                },
            ]
        }
    },
    {
        id: 'shortcuts_sales',
        description: 'Snarveier - Salg',
        width: 6,
        height: 1,
        widgetType: 'shortcuts',
        config: {
            shortcuts: [
                {
                    label: 'Tilbud',
                    url: '/sales/quotes',
                    letterIcon: 'T'
                },
                {
                    label: 'Ordre',
                    url: '/sales/orders',
                    letterIcon: 'O'
                },
                {
                    label: 'Faktura',
                    url: '/sales/invoices',
                    letterIcon: 'F'
                },
                {
                    label: 'Kunder',
                    url: '/sales/customer',
                    icon: 'group'
                },
                {
                    label: 'Produkter',
                    url: '/sales/products',
                    icon: 'shopping_cart'
                },
                {
                    label: 'Oversikt',
                    url: '/overview',
                    icon: 'search'
                },
            ]
        }
    },
    {
        id: 'shortcuts_salary',
        description: 'Snarveier - Lønn',
        width: 6,
        height: 1,
        widgetType: 'shortcuts',
        config: {
            shortcuts: [
                {
                    label: 'Ansatte',
                    url: '/salary/employees',
                    icon: 'group'
                },
                {
                    label: 'Lønnsarter',
                    url: '/salary/wagetypes',
                    icon: 'dns'
                },
                {
                    label: 'Lønnsavregning',
                    url: '/salary/payrollrun',
                    icon: 'account_balance_wallet'
                },
                {
                    label: 'A-melding',
                    url: '/salary/amelding',
                    icon: 'description'
                },
                {
                    label: 'Altinn',
                    url: '/salary/altinnoverview',
                    icon: 'search'
                },
            ]
        }
    },
    {
        id: 'shortcuts_timetracking',
        description: 'Snarveier - Timeføring',
        width: 5,
        height: 1,
        widgetType: 'shortcuts',
        config: {
            shortcuts: [
                {
                    label: 'Timeføring',
                    url: '/timetracking/timeentry',
                    icon: 'watch_later'
                },
                {
                    label: 'Timearter',
                    url: '/timetracking/worktypes',
                    icon: 'dns'
                },
                {
                    label: 'Personer',
                    url: '/timetracking/workers',
                    icon: 'group'
                },
                {
                    label: 'Fakturere timer',
                    url: '/timetracking/invoice-hours',
                    icon: 'description'
                },
                {
                    label: 'Rapporter',
                    url: '/reports?category=timetracking',
                    icon: 'insert_chart'
                },
            ]
        }
    },

    {
        id: 'shortcut_list_accounting',
        description: 'Snartvei liste - Regnskap',
        width: 2,
        height: 4,
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
                    label: 'Leverandørfaktura',
                    link: '/accounting/bills',
                    urlToNew: '/accounting/bills/0'
                },
                {
                    label: 'Budsjett',
                    link: '/accounting/budget',
                    urlToNew: ''
                },
                {
                    label: 'Åpne poster',
                    link: '/accounting/postpost',
                    urlToNew: ''
                },
                {
                    label: 'Søk på bilag',
                    link: '/accounting/transquery',
                    urlToNew: ''
                },
                {
                    label: 'Søk på konto',
                    link: '/accounting/accountquery',
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
                {
                    link: '/reports?category=Accounting',
                    label: 'Rapport - Regnskap',
                    urlToNew: ''
                }
            ]
        }
    },
    {
        id: 'shortcut_list_sales',
        description: 'Snartvei liste - Salg',
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
        description: 'Snartvei liste - Lønn',
        width: 3,
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
                },
                {
                    label: 'Variable lønnsposter',
                    link: '/salary/variablepayrolls',
                    urlToNew: ''
                }
            ]
        }
    },
    {
        id: 'shortcut_list_bank',
        description: 'Snartvei liste - Bank',
        width: 3,
        height: 3,
        widgetType: 'shortcutlist',
        config: {
            header: 'Snarveier',
            shortcuts: [
                {
                    label: 'Innbetalinger',
                    link: '/bank/ticker?code=bank_list'
                },
                {
                    label: 'Utbetalinger',
                    link: '/bank/ticker?code=payment_list'
                },
                // {
                //     label: 'Bankavstemning',
                //     link: '/bank/reconciliation',
                // },
                {
                    label: 'Avtalegirobunter',
                    link: '/bank/ticker?code=avtalegiro_list'
                },
                {
                    label: 'Rapporter',
                    link: '/reports?category=Accounting'
                },
                {
                    label: 'Innstillinger',
                    link: '/settings/company'
                }
            ]
        }
    },
    {
        id: 'shortcut_list_timetracking',
        description: 'Snartvei liste - Timeføring',
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
