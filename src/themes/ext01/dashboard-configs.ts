export const DASHBOARD_CONFIGS = {
    main: {
        header: 'Hjem',
        storageKey: 'main_dashboard',
        layout: [
            'BANK_BALANCE',
            'REMINDER_WIDGET',

            'OPERATING_PROFITS',
            'PUBLIC_DUEDATES',

            'UNPAID',
            'UNPAID_BILLS'
        ]
    },
    sales: {
        header: 'Salg',
        storageKey: 'sales_dashboard',
        layout: [
            'INVOICED',
            'UNPAID_PER_CUSTOMER',
            'UNPAID',
            'TOP_TEN_CUSTOMERS',
        ]
    },
    accounting: {
        header: 'Regnskap',
        storageKey: 'accounting_dashboard',
        layout: [
            'OPERATING_PROFITS',
            'UNPAID_BILLS',
            'EXPENSES',
            'BALANCE',
        ]
    },
    salary: {
        header: 'Lønn',
        storageKey: 'salary_dashboard',
        layout: [
            'EMPLOYEES',
            'EMPLOYMENTS_PER_JOBCODE',
            'TRAVELS',
            'RECENT_PAYROLL_RUNS',
            'SALARY_SHORTCUTS',
        ]
    },
    timetracking: {
        header: 'Timeføring',
        storageKey: 'timetracking_dashboard',
        layout: [
            'TIME_ENTRY',
            'HOURS_PER_WORKTYPE',
            'HOURS_PER_PROJECT',
        ]
    },
    bank: {
        header: 'Bank',
        storageKey: 'bank_dashboard',
        layout: [
            'BANK_BALANCE',
            'PAYMENTS',
            'BANK_STATUS'
        ]
    }
};
