import {THEMES} from 'src/themes/theme';

export const CHARTS = [
    {
        id: 'topten_customers',
        description: '10 største kunder',
        width: 5,
        height: 3,
        widgetType: 'topTenCustomers',
    },
    {
        id: 'transaction_accounting',
        description: 'Transaksjoner - Regnskap',
        width: 7,
        height: 3,
        widgetType: 'transaction',
        config: {
            dashboard: 'Accounting' // Identifyer for which fields to show.. fix while not dynamic
        }
    },
    {
        id: 'transaction_sales',
        description: 'Transaksjoner - Salg',
        width: 10,
        height: 3,
        widgetType: 'transaction',
        config: {
            dashboard: 'Sale' // Identifyer for which fields to show.. fix while not dynamic
        }
    },
    {
        id: 'invoiced',
        description: 'Fakturert',
        permissions: ['ui_sales_invoices'],
        width: 5,
        height: 3,
        widgetType: 'invoiced',
        config: {
            dashboard: 'Sale' // Identifyer for which fields to show.. fix while not dynamic
        }
    },
    {
        id: 'payment_chart',
        description: 'Innbetalinger',
        permissions: ['ui_bank_payments'],
        width: 9,
        height: 4,
        widgetType: 'payment_chart',
        config: {
            dashboard: 'Sale' // Identifyer for which fields to show.. fix while not dynamic
        }
    },
    {
        id: 'expenses',
        description: 'Kostnader',
        permissions: ['ui_accounting'],
        width: 3,
        height: 4,
        widgetType: 'expenses'
    },
    {
        id: 'balance',
        description: 'Balansefordeling',
        permissions: ['ui_accounting'],
        width: 5,
        height: 3,
        widgetType: 'balance'
    },
    {
        id: 'unpaid_supplierinvoice',
        description: 'Leverandørgjeld',
        permissions: ['ui_accounting_bills'],
        width: 4,
        height: 3,
        widgetType: 'unpaid',
        config: {
            model: 'SupplierInvoice',
            function: 'unpaid',
            labels: ['Ikke forfalt', '1-30 dager', '31-60 dager', '61-90 dager', 'Over 90 dager']
        }
    },
    {
        id: 'unpaid_customerinvoice',
        description: 'Kundefordringer',
        permissions: ['ui_sales_invoices'],
        width: 4,
        height: 3,
        widgetType: 'unpaid',
        config: {
            model: 'CustomerInvoice',
            function: 'unpaid',
            labels: ['Ikke forfalt', '1-30 dager', '31-60 dager', '61-90 dager', 'Over 90 dager']
        }
    },
    {
        id: 'project_percent',
        description: 'Prosjektprosent',
        permissions: ['ui_timetracking_timeentry'],
        width: 4,
        height: 3,
        widgetType: 'ttchart',
        config: {
            type: 'project_percent',
        }
    },
    {
        id: 'transaction_salary',
        description: 'Transaksjoner - Lønn',
        width: 8,
        height: 3,
        widgetType: 'transaction',
        config: {
            dashboard: 'Salary' // Identifyer for which fields to show.. FIX while not dynamic
        }
    },
    {
        id: 'operatingprofit',
        description: 'Driftsresultat',
        permissions: ['ui_accounting'],
        width: 6,
        height: 4,
        widgetType: 'operatingprofit',
    },
    {
        id: 'chart_employees_per_employment',
        description: 'Ansatte per stillingskode',
        permissions: ['ui_salary'],
        width: 5,
        height: 3,
        widgetType: 'pieChart',
        config: {
            dataEndpoint: '/api/statistics?model=Employee&select=count(ID) as '
                + `Count,isnull(Employments.JobName,'Ingen stillingskode') as JobName&expand=Employments`,
            labelKey: 'JobName',
            valueKey: 'Count',
            maxNumberOfLabels: 7,
        }
    },
    {
        id: 'chart_restamount_per_customer',
        description: 'Utestående per kunde',
        permissions: ['ui_sales_invoices'],
        width: 4,
        height: 3,
        widgetType: 'pieChart',
        config: {
            dataEndpoint: '/api/statistics?model=Customer&select=Info.Name as Name,'
                + 'isnull(sum(CustomerInvoices.RestAmount),0) as RestAmount'
                + '&expand=Info,CustomerInvoices&having=sum(CustomerInvoices.RestAmount) gt 0'
                + '&filter=CustomerInvoices.StatusCode gt 42001',
            valueKey: 'RestAmount',
            labelKey: 'Name',
            maxNumberOfLabels: 7,
        }
    },
    {
        id: 'chart_minutes_per_wagetype',
        description: 'Fordeling pr. timeart',
        permissions: ['ui_timetracking_timeentry'],
        width: 5,
        height: 3,
        widgetType: 'ttchart',
        config: {
            type: 'wagetype_pie'
        }
    },
    // SR TEMPORARY
    {
        id: 'unpaid_supplierinvoice_sr',
        description: 'Leverandørgjeld',
        permissions: ['ui_accounting'],
        width: 4,
        height: 3,
        widgetType: 'unpaidsr',
        config: {
            model: 'SupplierInvoice',
            function: 'unpaid',
            labels: ['Ikke forfalt', '1-30 dager', '31-60 dager', 'Over 60 dager']
        }
    },
    {
        id: 'overdue_invoices',
        description: 'Kundefordringer og kunder jeg bør purre på',
        permissions: ['ui_accounting'],
        width: 8,
        height: 3,
        widgetType: 'overdue_invoices',
    },
    {
        id: 'reminder_list',
        description: 'Huskeliste',
        permissions: ['ui_accounting'],
        width: 4,
        height: 3,
        widgetType: 'reminderList',
        config: {

        }
    },
    {
        id: 'operatingprofit_line',
        description: 'Driftsresultat',
        permissions: ['ui_accounting'],
        width: 8,
        height: 3,
        widgetType: 'operatingprofit',
        config: {
            type: 'line',
            costMultiplier: -1
        }
    },
    {
        id: 'public_duedates',
        description: 'Offentlige frister neste 30 dager',
        width: 8,
        height: 3,
        widgetType: 'public_duedates',
        config: {}
    },
    {
        id: 'liquidity',
        description: 'Likviditetsprognose',
        width: 5,
        height: 3,
        widgetType: 'liquidity',
        onlyForTheme: THEMES.SR,
        config: {}
    },
    {
        id: 'bank_balance',
        description: 'Banksaldo',
        permissions: ['ui_bank'],
        onlyForTheme: THEMES.SR,
        width: 4,
        height: 3,
        widgetType: 'bank_balance',
        config: {

        }
    },
    {
        id: 'bank_balance_ext02',
        description: 'Banksaldo',
        permissions: ['ui_bank'],
        onlyForTheme: THEMES.EXT02,
        width: 4,
        height: 3,
        widgetType: 'bank_balance_ext02',
        config: {

        }
    },
];
