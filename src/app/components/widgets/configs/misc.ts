export const MISC_WIDGETS = [
    {
        id: 'kpi_profitability',
        description: 'Lønnsomhet',
        width: 3,
        height: 1,
        widgetType: 'kpi',
        config: {type: 'profitability'}
    },
    {
        id: 'kpi_liquidity',
        description: 'Likviditet',
        width: 3,
        height: 1,
        widgetType: 'kpi',
        config: {type: 'liquidity'}
    },
    {
        id: 'kpi_solidity',
        description: 'Soliditet',
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
        description: 'Firmalogo',
        width: 2,
        height: 1,
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
