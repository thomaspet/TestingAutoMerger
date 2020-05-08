// EXT01 main dashboard config
export const DASHBOARD_CONFIG = {
    large: [
        {x: 0, y: 0, widgetID: 'bank_balance'},
        {x: 4, y: 0, widgetID: 'public_duedates'},
        {x: 0, y: 3, widgetID: 'operatingprofit_line' },
        {x: 8, y: 3, widgetID: 'reminder_list'},
        {x: 0, y: 6, widgetID: 'unpaid_supplierinvoice_sr'},
        {x: 4, y: 6, widgetID: 'overdue_invoices'}
    ],
    medium: [
        {x: 0, y: 0, widgetID: 'bank_balance'},
        {x: 4, y: 0, widgetID: 'public_duedates'},
        {x: 0, y: 3, widgetID: 'operatingprofit_line' },
        {x: 8, y: 3, widgetID: 'reminder_list'},
        {x: 0, y: 6, widgetID: 'unpaid_supplierinvoice_sr'},
        {x: 4, y: 6, widgetID: 'overdue_invoices'}
    ]
};

export const ACCOUNTING_DASHBOARD_CONFIG = {
        large: [
            { x: 0, y: 0, widgetID: 'operatingprofit' },
            { x: 6, y: 0, widgetID: 'expenses' },

            { x: 9, y: 0, widgetID: 'help_sr_accounting'},
            { x: 9, y: 1, widgetID: 'sum_inbox' },
            { x: 9, y: 2, widgetID: 'sum_payment_list' },
            { x: 9, y: 3, widgetID: 'payment_no_match' },

            { x: 0, y: 4, widgetID: 'balance' },
            { x: 5, y: 4, widgetID: 'unpaid_supplierinvoice' }
        ],
        medium: [
            { x: 0, y: 0, widgetID: 'sum_inbox' },
            { x: 3, y: 0, widgetID: 'sum_payment_list' },
            { x: 6, y: 0, widgetID: 'payment_no_match' },

            { x: 0, y: 1, widgetID: 'operatingprofit' },
            { x: 6, y: 1, widgetID: 'expenses' },

            { x: 0, y: 5, widgetID: 'balance' },
            { x: 5, y: 5, widgetID: 'unpaid_supplierinvoice' },

            { x: 0, y: 8, widgetID: 'help_sr_accounting'},
        ],
        small: [
            { x: 0, y: 0, widgetID: 'expenses' },

            { x: 3, y: 0, widgetID: 'help_sr_accounting'},
            { x: 3, y: 1, widgetID: 'sum_inbox' },
            { x: 3, y: 2, widgetID: 'sum_payment_list' },
            { x: 3, y: 3, widgetID: 'payment_no_match' },

            { x: 0, y: 4, widgetID: 'operatingprofit' },
            { x: 0, y: 8, widgetID: 'balance' },
            { x: 0, y: 11, widgetID: 'unpaid_supplierinvoice' }
        ],
        xs: [
            { x: 0, y: 0, widgetID: 'help_sr_accounting'},
            { x: 0, y: 1, widgetID: 'sum_inbox' },
            { x: 0, y: 2, widgetID: 'sum_payment_list' },
            { x: 0, y: 3, widgetID: 'payment_no_match' },

            { x: 0, y: 4, widgetID: 'expenses' },
            { x: 0, y: 8, widgetID: 'balance' },
            { x: 0, y: 11, widgetID: 'operatingprofit' },
            { x: 0, y: 15, widgetID: 'unpaid_supplierinvoice' }
        ]
};

export const BANK_DASHBOARD_CONFIG = {
    large: [
        { x: 0, y: 0, widgetID: 'reconciliation_list' },
        { x: 0, y: 1, widgetID: 'payment_no_match' },
        { x: 0, y: 2, widgetID: 'payment_list' },
        { x: 0, y: 3, widgetID: 'shortcut_list_bank', },
        { x: 3, y: 0, widgetID: 'payment_chart', },
        { x: 3, y: 4, widgetID: 'autobank_agreements' },
        { x: 6, y: 4, widgetID: 'customers_with_avtalegiro' },
    ]
};

export const SALARY_DASHBOARD_CONFIG = {
    large: [
        { x: 5, y: 0, widgetID: 'shortcut_list_salary', },
        { x: 0,y: 3,widgetID: 'transaction_salary', },
        { x: 0, y: 0, widgetID: 'chart_employees_per_employment', },
        { x: 8, y: 0, widgetID: 'help_sr_accounting', },
        { x: 8, y: 1, widgetID: 'sum_employees', },
        { x: 8, y: 2, widgetID: 'sum_employments', },
        { x: 8, y: 3, widgetID: 'sum_wagetypes', },
        { x: 8, y: 4, widgetID: 'counter_salary_travels' },
    ]
}
