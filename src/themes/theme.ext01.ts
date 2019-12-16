import {TRANSLATION_OVERRIDES} from './ext01/translation-overrides';
import {DASHBOARD_CONFIG} from './ext01/dashboard-config';

export const theme = {
    translationOverrides: TRANSLATION_OVERRIDES,
    dashboardConfig: DASHBOARD_CONFIG,

    init: {
        illustration: 'themes/ext01/register-company-background.svg',
        background: '#ebf6fb',
        login_background: 'url(themes/ext01/login_background.png)',
        backgroundHeight: '100%',
    },

    widgets: {
        pie_colors: ['#005AA4', '#0071CD', '#008ED2', '#7FC6E8', '#A1DFFF', '#CEEEFF', '#DFF1F9', '#f6dc8d', '#4DB6AC'],
        due_date_colors: ['#008A00', '#E7A733', '#FF9100', '#DA3D00', '#A20076'],
        bar_chart_colors: ['#0071cd', '#E3E3E3'],
        result_bar_colors: ['#0071CD', '#7FC6E8', 'rgba(89, 104, 121, .75)'],
        kpi: {
            good: '#008A00',
            bad: '#E60000',
            warn: '#FF9100',
            c2a: '#0071cd',
            background: '#F4F4F4'
        }
    }
};
