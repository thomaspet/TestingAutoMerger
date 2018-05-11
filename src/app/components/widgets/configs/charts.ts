export const CHARTS = [
    {
        id: 'kpi',
        description: 'Nøkkeltall',
        permissions: ['ui_accounting_accountingreports'],
        width: 4,
        height: 3,
        widgetType: 'kpi',
        config: {}
    },
    {
        id: 'topten_customers',
        description: '10 største kunder',
        width: 4,
        height: 3,
        widgetType: 'topten',
        config: {
            contextMenuItems: [
                {
                    label: 'Ny faktura',
                    link: '/sales/invoices/0;customerID=',
                    needsID: true
                },
                {
                    label: 'Ny ordre',
                    link: '/sales/orders/0;customerID=',
                    needsID: true
                },
                {
                    label: 'Nytt tilbud',
                    link: '/sales/quotes/0;customerID=',
                    needsID: true
                }
            ]
        }
    },
    {
        id: 'transaction_accounting',
        description: 'Transaksjoner - Regnskap',
        width: 8,
        height: 4,
        widgetType: 'transaction',
        config: {
            dashboard: 'Accounting' // Identifyer for which fields to show.. fix while not dynamic
        }
    },
    {
        id: 'transaction_sales',
        description: 'Transaksjoner - Salg',
        width: 8,
        height: 3,
        widgetType: 'transaction',
        config: {
            dashboard: 'Sale' // Identifyer for which fields to show.. fix while not dynamic
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
        id: 'chart_operating_profits',
        description: 'Driftsresultater',
        permissions: ['ui_accounting_accountingreports'],
        width: 7,
        height: 5,
        widgetType: 'chart',
        config: {
            chartType: 'line',
            labels: ['Jan', '', '', 'Apr', '', '', 'Jul', '', 'Sep', '', '', 'Dec'],
            colors: ['#7293cb'],
            backgroundColors: ['transparent'],
            dataEndpoint: ['/api/statistics?model=JournalEntryLine&select=month(financialdate),'
                + 'sum(amount)&join=journalentryline.accountid eq account.id&filter=year(financialdate) '
                + 'eq <year> and account.accountnumber ge 3000 and account.accountnumber le 9999 '
                + '&range=monthfinancialdate'
            ],
            dataKey: ['sumamount'],
            multiplyValue: -1,
            dataset: [],
            fill: 'none',
            options: {
                showLines: true,
                bezierCurve: false
            },
            title: ['Driftsresultat']
        }
    },
    {
        id: 'chart_employees_per_employment',
        description: 'Ansatte per stillingskode',
        permissions: ['ui_salary'],
        width: 4,
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
                cutoutPercentage: 80,
                animation: {
                    animateScale: true
                },
                legend: {
                    position: 'bottom'
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
                    position: 'bottom'
                }
            }
        }
    },
    {
        id: 'chart_minutes_per_wagetype',
        description: 'Fordeling pr. timeart',
        permissions: ['ui_reports'],
        width: 3,
        height: 3,
        widgetType: 'chart',
        config: {
            chartType: 'pie',
            labels: [],
            colors: [],
            dataEndpoint: [
                '/api/statistics?model=workitem&select=sum(minutes) as Sum,'
                + 'worktype.Name as Name&expand=worktype'
                + '&filter=year(date) eq <year>'
            ],
            labelKey: 'Name',
            valueKey: 'Sum',
            maxNumberOfLabels: 4,
            useIf: '',
            addDataValueToLabel: false,
            dataset: [],
            options: {
                cutoutPercentage: 80,
                animation: {
                    animateScale: true
                },
                legend: {
                    position: 'bottom'
                },
            }
        }
    },
];
