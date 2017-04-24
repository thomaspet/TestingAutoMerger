export const CHARTS = {
    operatingProfits: {
        width: 4,
        height: 3,
        widgetType: 'chart',
        config: {
            header: 'Driftsresultater',
            chartType: 'line',
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            colors: ['#ab6857'],
            dataEndpoint: ['/api/statistics?model=JournalEntryLine&select=month(financialdate),sum(amount)&join=journalentryline.accountid eq account.id&filter=account.accountnumber ge 3000 and account.accountnumber le 9999 &range=monthfinancialdate'],
            dataKey: ['sumamount'],
            multiplyValue: -1,
            dataset: [],
            options: {
                showLines: true,
                animation: {
                    animateScale: true
                },
                legend: {
                    position: 'top'
                }
            },
            title: ['Driftsresultat'],
            drilldown: false,
            chartID: 487515
        }
    },

    outstandingInvoices: {
        width: 4,
        height: 3,
        widgetType: 'chart',
        config: {
            header: 'Utestående per kunde',
            chartType: 'pie',
            labels: [],
            colors: [],
            dataEndpoint: [
                '/api/statistics?model=Customer&select=Info.Name as Name,isnull(sum(CustomerInvoices.RestAmount),0) as RestAmount&expand=Info,CustomerInvoices&having=sum(CustomerInvoices.RestAmount) gt 0'
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

    kpi: {
        width: 4,
        height: 3,
        widgetType  : 'kpi',
        config: {
            header: 'Nøkkeltall'
        }
    },

    employeesPerJobCode: {
        width: 4,
        height: 3,
        widgetType: 'chart',
        config: {
            header: 'Ansatte per stillingskode',
            chartType: 'pie',
            labels: [],
            colors: [],

            dataEndpoint: [
                '/api/statistics?model=Employee&select=count(ID) as Count,Employments.JobName as JobName&expand=Employments'
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
                    position: 'left'
                },
            }
        }
    },


};
