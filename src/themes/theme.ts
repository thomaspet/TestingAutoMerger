import {TRANSLATION_OVERRIDES} from './ue/translation-overrides';
import {DASHBOARD_CONFIG} from './ue/dashboard-config';

export const theme = {
    translationOverrides: TRANSLATION_OVERRIDES,
    dashboardConfig: DASHBOARD_CONFIG,

    init: {
        illustration: 'themes/ue/init_bg.svg',
        background: '#F5F6F8',
        login_background: undefined,
        backgroundHeight: undefined,
    },

    widgets: {
        pie_colors: ['#132F9A', '#0070E0', '#2699FB', '#7FC6E8', '#F8958B', '#FF9E2C', '#FBBE11', '#01A901', '#DAF0CD'],
        due_date_colors: ['#01A901', '#DAF0CD', '#FBBE11', '#FF9E2C', '#D63731'],
        bar_chart_colors: ['#0070E0', '#E3E3E3'],
        result_bar_colors: ['#01A901', '#0070E0', 'rgba(89, 104, 121, .75)'],
        kpi: {
            good: '#01A901',
            bad: '#D63731',
            warn: '#FF9E2C',
            c2a: '#0070E0',
            background: '#F4F4F4'
        }
    }
};
