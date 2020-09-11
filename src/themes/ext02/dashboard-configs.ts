export const DASHBOARD_CONFIGS = {
    main: {
        header: 'Hjem',
        storageKey: 'main_dashboard',
        layout: (contractType) => {
            if (contractType === 'Mini' || contractType === 'Demo') {
                return [
                    'BANK_BALANCE',
                    'REMINDER_WIDGET_WITH_PUBLIC_DUEDATES',

                    'INVOICED',
                    'UNPAID_BILLS',

                    'OPERATING_PROFITS',
                    'BRUNO_ACCOUNTING_SERVICES',
                ];
            } else {
                return [
                    'BANK_BALANCE',
                    'REMINDER_WIDGET_WITH_PUBLIC_DUEDATES',

                    'INVOICED',
                    'UNPAID_BILLS',

                    'OPERATING_PROFITS',

                    // Removed until we have a link for "chat med regnskapsfører"
                    // 'BRUNO_ACCOUNTING_SERVICES',

                    'LIQUIDITY',
                    'UNPAID',
                    'TOP_TEN_CUSTOMERS',
                ];
            }
        }
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
        ]
    }
};
