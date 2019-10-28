// EXT01 main dashboard config
export const DASHBOARD_CONFIG = {
    large: [
        {x: 0, y: 0, widgetID: 'overdue_invoices'},
        {x: 7, y: 0, widgetID: 'public_duedates'},
        {x: 0, y: 3, widgetID: 'reminder_list'},
        {x: 3, y: 3, widgetID: 'operatingprofit_line' },
        {x: 9, y: 3, widgetID: 'unpaid_supplierinvoice_sr'},
    ],
    medium: [
        {x: 0, y: 0, widgetID: 'overdue_invoices', widthOverride: 12},
        {x: 7, y: 0, widgetID: 'public_duedates'},
        {x: 0, y: 3, widgetID: 'reminder_list'},
        {x: 3, y: 3, widgetID: 'operatingprofit_line' },
        {x: 9, y: 3, widgetID: 'unpaid_supplierinvoice_sr'},
    ]
};
