// UE main dashboard config
export const DASHBOARD_CONFIG = {
    large: [
        {x: 0, y: 0, widgetID: 'kpi_profitability'},
        {x: 3, y: 0, widgetID: 'kpi_liquidity'},
        {x: 6, y: 0, widgetID: 'kpi_solidity'},

        {x: 9, y: 0, widgetID: 'sum_inbox'},
        {x: 9, y: 1, widgetID: 'sum_order_reserves'},
        {x: 9, y: 2, widgetID: 'sum_overdue_invoices'},
        {x: 9, y: 3, widgetID: 'sum_hours'},

        {x: 0, y: 1, widgetID: 'operatingprofit' },

        {x: 6, y: 1, widgetID: 'assignments'},

        {x: 6, y: 4, widgetID: 'events_widget'},
        {x: 9, y: 4, widgetID: 'report_shortcuts'},
    ],
    small: [
        {x: 0, y: 0, widgetID: 'sum_order_reserves'},
        {x: 3, y: 0, widgetID: 'sum_overdue_invoices'},
        {x: 0, y: 1, widgetID: 'sum_inbox'},
        {x: 3, y: 1, widgetID: 'sum_hours'},

        {x: 0, y: 2, widgetID: 'operatingprofit' },

        {x: 0, y: 6, widgetID: 'kpi_profitability'},
        {x: 0, y: 7, widgetID: 'kpi_liquidity'},
        {x: 0, y: 8, widgetID: 'kpi_solidity'},
        {x: 3, y: 6, widgetID: 'assignments'},

        {x: 0, y: 9, widgetID: 'events_widget'},
        {x: 3, y: 9, widgetID: 'report_shortcuts'},
    ],
    xs: [
        {x: 0, y: 0, widgetID: 'sum_order_reserves'},
        {x: 0, y: 1, widgetID: 'sum_overdue_invoices'},
        {x: 0, y: 2, widgetID: 'sum_inbox'},
        {x: 0, y: 3, widgetID: 'sum_hours'},
        {x: 0, y: 4, widgetID: 'assignments'},
        {x: 0, y: 7, widgetID: 'operatingprofit' },
        {x: 0, y: 11, widgetID: 'kpi_profitability'},
        {x: 0, y: 12, widgetID: 'kpi_liquidity'},
        {x: 0, y: 13, widgetID: 'kpi_solidity'},
        {x: 0, y: 14, widgetID: 'events_widget'},
        {x: 0, y: 17, widgetID: 'report_shortcuts'},
    ]
};
