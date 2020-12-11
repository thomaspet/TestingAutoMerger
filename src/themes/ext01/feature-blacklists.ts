export const PLUS_PACKAGE_BLACKLIST = {
    view_features: [
        'ui.distribution',
        'ui.bank_account_manual_setup',
        'ui.bureau.company-groups',
        'ui.reports.custom',
        'ui.chat',
        'ui.assigning',

        'ui.sales.customer.lead',
        'ui.sales.customer.ehf_setup',
        'ui.sales.customer.sub_company',
        'ui.sales.customer.delivery-terms',
        'ui.sales.products.costprice',
        'ui.sales.contribution-margin',

        'ui.accounting.supplier.cost_allocation',
        'ui.accounting.supplier.ehf_setup',
        'ui.accounting.supplier.self_employed',
        'ui.accountsettings.interrimaccounts',

        'ui.accounting.bill.delivery_date',
        'ui.accounting.vat-deduction-settings',
        'ui.accounting.budget',
        'ui.accounting.payments',
        'ui.accounting.costallocation',
        'ui.accounting.advanced-account-settings',

        'ui.bank.payment-batch',
        'ui.bank.journaling-rules',
    ],
    routes: [
        'ui_overview',
        'ui_uniqueries',
        'ui_assignments_*',
        'ui_admin_flow',
        'ui_admin_jobs',
        'ui_settings_teams',
        'ui_approval-rules',

        'ui_accounting_budget',
        'ui_accounting_costallocation',
        'ui_settings_dimension',
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
        'ui.timetracking',
        'ui.sellers',

        'ui.accounting.assets',
        'ui.task.assign-to-user',

        'ui.sales.customer.tof_report_setup',
        'ui.sales.customer.avtalegiro',
        'ui.sales.customer.documents',

        'ui.sales.invoice.accrual',
        'ui.sales.invoice-list.my_invoices',
        'ui.sales.products.product_categories',
        'ui.sales.quotes',
        'ui.sales.orders',
        'ui.sales.reminders',

        'ui.accounting.fixed-texts',
        'ui.bank.reconciliation.auto-match',
    ],
    routes: [
        ...PLUS_PACKAGE_BLACKLIST.routes,
        'ui_sales_quotes',
        'ui_sales_orders',
        'ui_sales_batch-invoices',
        'ui_sales_recurringinvoice',
        'ui_sales_sellers',

        'ui_sales_productgroups',

        'ui_sales_reminders_*',
        'ui_dimensions_*',

        'ui_import',
        'ui_settings_webhooks',

        'ui_timetracking_*',
        'ui_accounting_balancesearch',
    ],
};
