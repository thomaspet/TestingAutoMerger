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
        permissions: ['ui_sales'],
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
        permissions: ['ui_sales'],
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
        permissions: ['ui_accounting'],
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
        permissions: ['ui_sales'],
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
        widgetType: 'chart',
        config: {
            chartType: 'pie',
            labels: [],
            colors: [],
            dataEndpoint: [
                '/api/statistics?model=Employee&select=count(ID) as '
                + 'Count,Employments.JobName as JobName&expand=Employments'
            ],
            labelKey: 'JobName',
            valueKey: 'Count',
            maxNumberOfLabels: 7,
            useIf: '',
            addDataValueToLabel: false,
            dataset: [],
            options: {
                cutoutPercentage: 0,
                animation: {
                    animateScale: true
                },
                legend: {
                    position: 'left'
                },
            }
        }
    },
    {
        id: 'chart_restamount_per_customer',
        description: 'Utestående per kunde',
        permissions: ['ui_sales'],
        width: 4,
        height: 3,
        widgetType: 'chart',
        config: {
            chartType: 'pie',
            labels: [],
            colors: [],
            dataEndpoint: [
                '/api/statistics?model=Customer&select=Info.Name as Name,'
                + 'isnull(sum(CustomerInvoices.RestAmount),0) as RestAmount'
                + '&expand=Info,CustomerInvoices&having=sum(CustomerInvoices.RestAmount) gt 0'
            ],
            valueKey: 'RestAmount',
            labelKey: 'Name',
            maxNumberOfLabels: 7,
            useIf: '',
            addDataValueToLabel: false,
            dataset: [],
            options: {
                animation: {
                    animateScale: true
                },
                legend: {
                    position: 'left'
                }
            }
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
        id: 'unpaid_customerinvoice_sr',
        description: 'Leverandørgjeld',
        permissions: ['ui_accounting'],
        width: 3,
        height: 3,
        widgetType: 'unpaidsr',
        config: {
            model: 'SupplierInvoice',
            function: 'unpaid',
            labels: ['Ikke forfalt', '1-30 dager', '31-60 dager', 'Over 60 dager']
        }
    },
    {
        id: 'chart_and_table_accounts',
        description: 'Likviditet og prognose',
        permissions: ['ui_accounting'],
        width: 7,
        height: 3,
        widgetType: 'chartAndTable',
        config: {
            model: 'Account'
        }
    },
    {
        id: 'chart_and_table_customers',
        description: 'Kundefordringer & kunder jeg bør purre på',
        permissions: ['ui_accounting'],
        width: 7,
        height: 3,
        widgetType: 'chartAndTable',
        config: {
            model: 'CustomerInvoice',
            labels: ['Ikke forfalt', '1-30 dager', '31-60 dager', 'Over 60 dager'],
            colors: ['#008A00', '#FFF000', '#FF9100', '#DA3D00']

        }
    },
    {
        id: 'reminder_list',
        description: 'Huskeliste',
        permissions: ['ui_accounting'],
        width: 3,
        height: 3,
        widgetType: 'reminderList',
        config: {

        }
    },
    {
        id: 'operatingprofit_line',
        description: 'Driftsresultat',
        permissions: ['ui_accounting'],
        width: 6,
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
        width: 4,
        height: 3,
        widgetType: 'public_duedates',
        config: { }
    },
];
