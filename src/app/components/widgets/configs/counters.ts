import {TypeOfIntegration} from '@uni-entities';

export const COUNTERS = [
    {
        id: 'counter_email',
        description: 'Antall eposter i innboks',
        permissions: ['ui_accounting_bills'],
        width: 1,
        height: 1,
        widgetType: 'counter',
        config: {
            label: 'Epost',
            icon: 'letter',
            link: '/accounting/bills?filter=Inbox',
            dataEndpoint: '/api/biz/filetags/IncomingMail/0?action=get-supplierInvoice-inbox-count',
            valueKey: null,
            amount: 0,
            class: 'uni-widget-notification-orange'
        }
    },
    {
        id: 'counter_ehf',
        description: 'Antall EHF i innboks',
        permissions: ['ui_accounting_bills'],
        width: 1,
        height: 1,
        widgetType: 'counter',
        config: {
            label: 'EHF',
            icon: 'ehf',
            link: '/accounting/bills?filter=Inbox',
            dataEndpoint: '/api/biz/filetags/IncomingEHF/0?action=get-supplierInvoice-inbox-count',
            valueKey: null,
            amount: 0,
            class: 'uni-widget-notification-orange'
        }
    },
    {
        id: 'counter_assigned_invoices',
        description: 'Tildelte faktura',
        permissions: ['ui_accounting_bills'],
        width: 1,
        height: 1,
        widgetType: 'counter',
        config: {
            label: 'Tildelte',
            icon: 'pdf',
            link: '/accounting/bills?filter=ForApproval&page=1',
            dataEndpoint: '/api/statistics/?model=SupplierInvoice&select=count(ID) as '
                + 'count&filter=( isnull(deleted,0) eq 0 ) and ( statuscode eq 30102 )',
            valueKey: 'Data[0].count',
            amount: 0,
            class: 'uni-widget-notification-orange'
        }
    },
    {
        id: 'counter_salary_travels',
        permissions: ['ui_salary_employees'],
        width: 1,
        height: 1,
        widgetType: 'integrationCounter',
        config: {
            type: TypeOfIntegration.TravelAndExpenses
        }
    },
    {
        id: 'counter_notifications',
        description: 'Uleste varlser',
        width: 1,
        height: 1,
        widgetType: 'counter',
        config: {
            label: 'Varsler',
            icon: 'notification',
            link: '/',
            dataEndpoint: '/api/biz/notifications?action=count',
            valueKey: 'Count',
            class: 'uni-widget-notification-lite-blue'
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
            link: '/overview/order_list?filter=order_reserves'
        }
    },
];
