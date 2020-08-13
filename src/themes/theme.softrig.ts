import {TRANSLATION_OVERRIDES} from './softrig/translation-overrides';
import {DASHBOARD_CONFIGS} from './ue/dashboard-configs';

import {THEMES} from './themes-enum';
export * from './themes-enum';

export const theme = {
    theme: THEMES.SOFTRIG,
    appName: 'SoftRig',
    appProvider: 'Uni Micro',

    translationOverrides: TRANSLATION_OVERRIDES,
    chatbotIcon: undefined,

    dashboardConfigs: DASHBOARD_CONFIGS,
    featureBlacklists: undefined,

    init: {
        illustration: 'themes/softrig/init_bg.svg',
        background: '#b4f5ff',
        login_background: undefined,
        login_background_height: undefined,
        signup_background_height: undefined,
    },

    widgets: {
        empty_state_illustration: 'themes/empty_state.svg',

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

        // pie_colors: ['#17a2b8', '#78e178', '#00c8eb', '#b4f5ff', '#ff5a5a', '#b23e3e', '#ffe164', '#fff587', '#A0EBA0'],
        // due_date_colors: ['#78e178', '#A0EBA0', '#fff587', '#ffe164', '#ff5a5a'],
        // bar_chart_colors: ['#78e178', '#ff5a5a'],
        // result_bar_colors: ['#78e178', '#ff5a5a', '#000000'],
        // kpi: {
        //     good: '#78e178',
        //     bad: '#ff5a5a',
        //     warn: '#ffe164',
        //     c2a: '#00c8eb',
        //     background: '#f8f8f8'
        // }
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
};
