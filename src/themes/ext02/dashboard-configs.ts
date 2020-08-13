export const DASHBOARD_CONFIGS = {
    main: {
        header: 'Hjem',
        storageKey: 'main_dashboard',
        layout: [
            'BANK_BALANCE',
            'REMINDER_WIDGET_WITH_PUBLIC_DUEDATES',

            'INVOICED',
            'UNPAID_BILLS',

            'OPERATING_PROFITS',
            'BRUNO_ACCOUNTING_SERVICES',

            'LIQUIDITY',
            'UNPAID',
        ]
    },
    sales: {
        header: 'Salg',
        storageKey: 'sales_dashboard',
        layout: [
            'INVOICED',
            'UNPAID',
        ]
    },
    accounting: {
        header: 'Regnskap',
        storageKey: 'accounting_dashboard',
        layout: [
            'OPERATING_PROFITS',
            'BRUNO_ACCOUNTING_SERVICES',
            'UNPAID_BILLS',
            'EXPENSES',
        ]
    },
    salary: {
        header: 'Lønn',
        storageKey: 'salary_dashboard',
        layout: [
            'EMPLOYEES',
            'EMPLOYMENTS_PER_JOBCODE',
        ]
    },
    timetracking: {
        header: 'Timeføring',
        storageKey: 'timetracking_dashboard',
        layout: [
            'TIME_ENTRY',
        ]
    },
    bank: {
        header: 'Bank',
        storageKey: 'bank_dashboard',
        layout: [
            'BANK_BALANCE',
        ]
    }
};
