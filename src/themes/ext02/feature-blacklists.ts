export const PLUS_PACKAGE_BLACKLIST = {
    view_features: [
        'ui.distribution',
        'ui.bank_account_manual_setup',
        // 'ui.sellers',
        'ui.kid-settings',
        'ui.bureau.company-groups',
        'ui.reports.custom',

        'ui.sales.customer.lead',
        'ui.sales.customer.ehf_setup',
        'ui.sales.customer.sub_company',

        'ui.accounting.supplier.cost_allocation',
        'ui.accounting.supplier.ehf_setup',
        'ui.accounting.supplier.self_employed',

        'ui.accounting.bill.delivery_date',
        'ui.accounting.vat-deduction-settings',
        'ui.accounting.budget',

        'ui.bank.payment-batch',
        'ui.bank.journaling-rules',
    ],
    routes: [
        'ui_overview',
        'ui_uniqueries',
        'ui_assignments',
        'ui_sharings',
        'ui_admin_flow',
        'ui_admin_jobs',
        'ui_settings_teams',
        'ui_approval-rules',

        'ui_accounting_budget',
        'ui_accounting_costallocation',
        'ui_sales_recurringinvoice',
    ],
};

export const MINI_PACKAGE_BLACKLIST = {
    view_features: [
        ...PLUS_PACKAGE_BLACKLIST.view_features,
        'ui.dimensions',
        'ui.debt-collection',
        'ui.numberseries-others',
        'ui.accountsettings-add-and-import',
        'ui.dashboard.edit',

        'ui.accounting.assets',

        'ui.sales.customer.tof_report_setup',
        'ui.sales.customer.avtalegiro',
        'ui.sales.customer.documents',

        'ui.sales.invoice.reminder-stop',
        'ui.sales.invoice.accrual',

        'ui.sales.products.product_categories',

        'ui.sales.quotes',
        'ui.sales.orders',
        'ui.sales.reminders'
    ],
    routes: [
        ...PLUS_PACKAGE_BLACKLIST.routes,
        'ui_sales_quotes',
        'ui_sales_orders',
        'ui_sales_batch-invoices',

        'ui_sales_productgroups',
        'ui_sales_sellers',

        'ui_sales_reminders_*',
        'ui_dimensions_*',

        'ui_import',
        'ui_settings_webhooks',

        'ui_marketplace_integrations',
        'ui_marketplace_purchases',
    ],
};
