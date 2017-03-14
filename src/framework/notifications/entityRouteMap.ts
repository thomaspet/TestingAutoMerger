// Used to map entitytype on a notification to correct frontend route

export const accountingRouteMap = {
    'supplierinvoice': 'bill/:id',
    'supplierinvoiceitem': 'bill/:id'
};

export const salaryRouteMap = {
    'wagetype': 'wagetypes/:id',
    'employee': 'employees/:id',
    'payrollrun': 'payrollrun/:id',
    'salarybalance': 'salarybalances/:id'
};

export const salesRouteMap = {
    'customerquote': 'quotes/:id',
    'customerquoteitem': 'quotes/:id',
    'customerorder': 'orders/:id',
    'customerorderitem': 'orders/:id',
    'customerinvoice': 'invoices/:id',
    'customerinvoiceitem': 'invoices/:id',
};

export const timetrackingRouteMap = {
    'workprofile': 'workprofiles/:id',
    'worker': 'workers/:id',
    'worktype': 'worktypes/:id',
};

