export const MISC_WIDGETS = [
    {
        id: 'kpi_profitability',
        description: 'Lønnsomhet',
        permissions: ['ui_accounting'],
        width: 3,
        height: 1,
        widgetType: 'kpi',
        config: {type: 'profitability'}
    },
    {
        id: 'kpi_liquidity',
        description: 'Likviditet',
        permissions: ['ui_accounting'],
        width: 3,
        height: 1,
        widgetType: 'kpi',
        config: {type: 'liquidity'}
    },
    {
        id: 'kpi_solidity',
        description: 'Soliditet',
        permissions: ['ui_accounting'],
        width: 3,
        height: 1,
        widgetType: 'kpi',
        config: {type: 'solidity'}
    },
    {
        id: 'clock',
        description: 'Klokke',
        width: 3,
        height: 1,
        widgetType: 'clock'
    },
    {
        id: 'companylogo',
        description: 'Logo - Horisontal',
        width: 2,
        height: 1,
        widgetType: 'companyLogo',
        config: {}
    },
    {
        id: 'companylogo_vertical',
        description: 'Logo - Vertikal',
        width: 2,
        height: 3,
        widgetType: 'companyLogo',
        config: {}
    },
    {
        id: 'currency',
        description: 'Valutakurs',
        width: 2,
        height: 1,
        widgetType: 'currency',
        config: {}
    },
    {
        id: 'report_shortcuts',
        description: 'Rapporter',
        permissions: [
            'ui_accounting',
            'ui_sales',
            'ui_salary',
            'ui_timetracking',
        ],
        width: 3,
        height: 3,
        widgetType: 'reportlist',
    },
    {
        id: 'events_widget',
        description: 'Hendelser',
        permissions: ['ui_sales'],
        width: 3,
        height: 3,
        widgetType: 'event',
    },
    {
        id: 'assignments',
        description: 'Godkjenninger',
        width: 3,
        height: 3,
        widgetType: 'assignments'
    }
];
