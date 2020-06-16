export const PLUS_PACKAGE_BLACKLIST = {
    view_features: [
        'ui.distribution',
        'ui.bank_account_manual_setup',
        'ui.sellers',

        'ui.sales.customer.ehf_setup',
        'ui.sales.customer.sub_company',

        'ui.accounting.supplier.cost_allocation',
        'ui.accounting.supplier.ehf_setup',
        'ui.accounting.supplier.self_employed',

        'ui.accounting.bill.delivery_date',
        'ui.accounting.vat-deduction-settings',

        'ui.bank.journaling-rules',
    ],
    ui_permissions: [
        'ui_tickers',
        'ui_uniqueries',
        'ui_assignments',

        'ui_accounting_budget',
        'ui_accounting_costallocation',
        'ui_sales_kidsettings',
        'ui_sales_recurringinvoice',
    ],
};

export const MINI_PACKAGE_BLACKLIST = {
    view_features: [
        ...PLUS_PACKAGE_BLACKLIST.view_features,
        'ui.dimensions',
        'ui.debt-collection',

        'ui.sales.customer.tof_report_setup',
        'ui.sales.customer.avtalegiro',

        'ui.sales.invoice.reminder-stop',
        'ui.sales.invoice.accrual',

        'ui.sales.products.product_categories',
    ],
    ui_permissions: [
        ...PLUS_PACKAGE_BLACKLIST.ui_permissions,
        'ui_sales_quotes',
        'ui_sales_orders',
        'ui_sales_batch-invoices',

        'ui_sales_productgroups',
        'ui_sales_sellers',

        'ui_sales_reminders',
        'ui_sales_reminders_debtcollect',
        'ui_sales_reminders_ready',
        'ui_sales_reminders_reminded',
        'ui_sales_reminders_senttodebtcollect',


        'ui_accounting_postpost',

        'ui_dimensions',
        'ui_marketplace_integrations',
        'ui_marketplace_purchases',
        // 'ui_dimensions_projects_overview',
        // 'ui_dimensions_projects_hours',
    ],
};
