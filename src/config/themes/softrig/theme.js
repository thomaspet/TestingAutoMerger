// /// <reference path="../theme.d.ts" />
// // @ts-check

// /** @type {AppTheme} */
export default {
    theme: 'SOFTRIG',
    appName: 'SoftRig',
    appProvider: 'Uni Micro',

    chatbotIcon: undefined,

    dashboardConfigs: getDashbordConfig(),
    translationOverrides: getTranslationOverrides(),
    featureBlacklists: undefined,
    tableColumnOverrides: undefined,

    init: {
        illustration: 'config/dist/theme/assets/softrig/init_bg.svg',
        background: '#E1FBFF',
        login_background: undefined,
        login_background_height: undefined,
        signup_background_height: undefined,
    },

    widgets: {
        empty_state_illustration: 'config/dist/theme/assets/empty_state.svg',

        primary: '#00c8eb',
        primary_soft: '#DAEEFF',
        primary_text: '#2B2B2B',

        secondary: '#01A901',
        secondary_soft: '#DAF0CD',
        secondary_text: '#2B2B2B',

        warn: '#FF9E2C',
        warn_soft: '#FFEBD5',
        warn_text: '#2B2B2B',

        bad: '#D63731',
        bad_soft: '#FDD5D2',
        bad_text: '#2B2B2B',

        bar_negative: '#FEEBC1',
        bar_foreground: '#F2F2F5',

        pie_colors: ['#132F9A', '#0070E0', '#2699FB', '#7FC6E8', '#F8598B']
    },

    // tslint:disable
    icons: {
        home: 'bar_chart',
        sales: 'shopping_cart',
        accounting: 'library_books',
        expense: 'receipt',
        bank: 'account_balance',
        salary: 'group',
        timetracking: 'watch_later',
        project: 'work_outline',
        dimensions: 'developer_board',
        altinn: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path fill="currentColor" d="M13.5,14.8c0.7,0,1.3-0.6,1.3-1.3v-3c0-0.7-0.6-1.3-1.3-1.3h-3c-0.7,0-1.3,0.6-1.3,1.3v3c0,0.7,0.6,1.3,1.3,1.3H13.5z"/><path fill="currentColor" d="M21.3,2.3H3c-0.5,0-1,0.4-1,1v0.3c0,0.5,0.4,1,1,1h16.8v11.3c0,0.5,0.4,1,1,1H21c0.5,0,1-0.4,1-1V4.6V3C22,2.6,21.7,2.3,21.3,2.3z"/><path fill="currentColor" d="M21,19.4H4.3V8.1c0-0.5-0.4-1-1-1H3c-0.5,0-1,0.4-1,1v11.3v1.5c0,0.4,0.3,0.8,0.8,0.8H21c0.5,0,1-0.4,1-1v-0.3C22,19.8,21.6,19.4,21,19.4z"/></g></svg>',
        marketplace: 'shopping_basket',

        search: 'search',
        company: 'business',
        add: 'add_box',
        notifications: 'notifications',
        settings: 'settings',
        user: 'account_circle',
        help: 'help',
        calendar: 'date_range'
    }
}

function getDashbordConfig() {
    return {
        main: {
            header: 'Hjem',
            storageKey: 'main_dashboard',
            layout: [
                'OPERATING_PROFITS',
                'REMINDER_WIDGET',

                'UNPAID',
                'NEWSLETTER',

                'BANK_BALANCE',
                'NEW_ENTITIES',

                'LIQUIDITY',
                'REPORT_SHORTCUTS',
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
    }
}

function getTranslationOverrides() {
    return {
        COMMON: {
            'APPLICATION_NAME': 'Softrig',
        },
        NAVBAR: {
            'KPI': 'Oversikt',
            'COMPANIES': 'Mine selskaper',
            'APPROVALS': 'Oppgaver og godkjenninger',
            'OVERVIEW': 'Database',
            'RECURRING_INVOICE': 'Gjentakende faktura',
            'JOURNALENTRY': 'Føre bilag',
            'SUPPLIER_INVOICE': 'Regninger',
            'OPEN_POST': 'Utestående',
            'VAT_MESSAGE': 'MVA-melding',
            'PAYROLL': 'Lønnskjøring',
            'AMELDING': 'A-melding',
            'BALANCE': 'Faste trekk',
            'HOUR_REG': 'Registrere timer',
            'BILLING_HOURS': 'Fakturere timer',
            'PERSONS': 'Timebrukere',
            'EXPENSE': 'Utgift',
            'BANK_PRODUCTS': 'Bankprodukter',
            'PURCHASES': 'Produktkjøp',
            'DIMENSION': 'Prosjekt og avdeling'
        },
    }
}