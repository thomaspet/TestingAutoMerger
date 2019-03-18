import {TypeOfIntegration} from '@uni-entities';

export const COUNTERS = [
    {
        id: 'counters_supplierinvoice',
        description: 'Tellere - leverandørfaktura',
        width: 4,
        height: 1,
        widgetType: 'counters',
        config: {
            counters: [
                {
                    label: 'Innboks',
                    url: '/accounting/bills?filter=Inbox',
                    dataEndpoint: '/api/biz/filetags/IncomingMail/0?action=get-supplierInvoice-inbox-count'
                },
                {
                    label: 'EHF',
                    url: '/accounting/bills?filter=Inbox',
                    dataEndpoint: '/api/biz/filetags/IncomingEHF/0?action=get-supplierInvoice-inbox-count'
                },
                {
                    label: 'Tildelt',
                    url: '/accounting/bills?filter=ForApproval',
                    dataEndpoint: '/api/statistics/?model=SupplierInvoice&select=count(ID) as '
                        + 'count&filter=( isnull(deleted,0) eq 0 ) and ( statuscode eq 30102 )',
                    valueKey: 'Data[0].count'
                }
            ]
        }
    },
    {
        id: 'counter_salary_travels',
        description: 'Reiser',
        permissions: ['ui_salary_travels'],
        width: 2,
        height: 1,
        widgetType: 'integrationCounter',
        config: {
            type: TypeOfIntegration.TravelAndExpenses
        }
    },
    {
        id: 'sum_hours',
        description: 'Timesaldo',
        permissions: ['ui_timetracking_timeentry'],
        label: 'Timesaldo',
        width: 2,
        height: 1,
        widgetType: 'flex',
        config: {}
    },
    {
        id: 'sum_overdue_invoices',
        description: 'Totalsum forfalt faktura',
        permissions: ['ui_sales'],
        width: 2,
        height: 1,
        widgetType: 'sum',
        config: {
            dataEndpoint: '/api/statistics?skip=0&top=50&model=CustomerInvoice&select=sum(CustomerInvoice.RestAmount) as '
            + 'sum&filter=(CustomerInvoice.PaymentDueDate le \'getdate()\' )',
            title: 'Forfalte ubetalte faktura',
            positive: false,
            link: '/sales/invoices?expanded=ticker&selected=null&filter=overdue_invoices'
        }
    },
    {
        id: 'sum_order_reserves',
        description: 'Totalsum ordrereserver',
        permissions: ['ui_sales'],
        width: 2,
        height: 1,
        widgetType: 'sum',
        config: {
            dataEndpoint: `/api/statistics?model=customerorder`
            + `&select=sum(items.SumTotalExVat) as sum,count(id) as counter`
            + `&filter=items.statuscode eq 41102 and (statuscode eq 41002 or statuscode eq 41003)&join=&expand=items`,
            title: 'Ordrereserver',
            positive: true,
            link: '/overview?code=order_list&filter=order_reserves'
        }
    },
];
