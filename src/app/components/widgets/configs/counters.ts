import {TypeOfIntegration} from '@uni-entities';

export const COUNTERS = [
    {
        id: 'counter_salary_travels',
        description: 'Reiser',
        permissions: ['ui_salary_travels'],
        width: 3,
        height: 1,
        widgetType: 'integrationCounter',
        config: {
            type: TypeOfIntegration.TravelAndExpenses,
            icon: 'flight_takeoff'
        }
    },
    {
        id: 'sum_hours',
        description: 'Timesaldo',
        permissions: ['ui_timetracking_timeentry'],
        label: 'Timesaldo',
        width: 3,
        height: 1,
        widgetType: 'flex',
        config: {}
    },
    {
        id: 'timetracking_calendar',
        description: 'Timeføring - Rask oversikt',
        permissions: ['ui_timetracking_timeentry'],
        width: 3,
        height: 4,
        widgetType: 'timetracking_calendar',
        config: {}
    },
    {
        id: 'sum_overdue_invoices',
        description: 'Totalsum forfalt faktura',
        permissions: ['ui_sales'],
        width: 3,
        height: 1,
        widgetType: 'sum',
        config: {
            dataEndpoint: '/api/statistics?skip=0&top=50&model=CustomerInvoice&select=sum(CustomerInvoice.RestAmount) as '
            + 'sum&filter=(CustomerInvoice.PaymentDueDate le \'getdate()\' )',
            title: 'Sum forfalte faktura',
            positive: false,
            link: '/sales/invoices?expanded=ticker&selected=null&filter=overdue_invoices',
            icon: 'description',
            class: 'pink-counter'
        }
    },
    {
        id: 'sum_order_reserves',
        description: 'Totalsum ordrereserver',
        permissions: ['ui_sales'],
        width: 3,
        height: 1,
        widgetType: 'sum',
        config: {
            dataEndpoint: `/api/statistics?model=customerorder`
            + `&select=sum(items.SumTotalExVat) as sum,count(id) as counter`
            + `&filter=items.statuscode eq 41102 and (statuscode eq 41002 or statuscode eq 41003)&join=&expand=items`,
            title: 'Ordrereserve',
            positive: false,
            link: '/overview?code=order_list&filter=order_reserves',
            icon: 'business',
            class: 'green-counter'
        }
    },
    {
        id: 'count_customer',
        description: 'Antall kunder',
        permissions: ['ui_sales'],
        width: 3,
        height: 1,
        widgetType: 'sum',
        config: {
            dataEndpoint: `/api/statistics?model=Customer&select=sum(casewhen((Customer.StatusCode eq '30001' )\,1\,0)) as sum`,
            title: 'Kunder',
            positive: false,
            link: '/sales/customer',
            icon: 'people_outline',
            class: 'blue-counter'
        }
    },
    {
        id: 'sum_products',
        description: 'Antall produkter',
        permissions: ['ui_sales'],
        width: 3,
        height: 1,
        widgetType: 'sum',
        config: {
            dataEndpoint: `/api/statistics?model=Product&select=count(id) as sum`,
            title: 'Produkter',
            positive: false,
            link: '/sales/products',
            icon: 'shopping_cart',
            class: 'yellow-counter'
        }
    },
    {
        id: 'sum_inbox',
        description: 'Fakturainnboks',
        permissions: ['ui_accounting'],
        width: 3,
        height: 1,
        widgetType: 'sum',
        config: {
            dataEndpoint: '/api/biz/filetags/IncomingMail|IncomingEHF/0?action=get-supplierInvoice-inbox-count',
            title: 'Fakturainnboks',
            positive: false,
            link: '/accounting/bills?filter=Inbox',
            icon: 'email',
            class: 'blue-counter'
        }
    },
    {
        id: 'sum_payment_list',
        description: 'Betalingsliste',
        permissions: ['ui_accounting'],
        width: 3,
        height: 1,
        widgetType: 'sum',
        config: {
            dataEndpoint: '/api/statistics/?model=SupplierInvoice&select=count(ID) as sum'
                + '&filter=(isnull(deleted,0) eq 0) and (statuscode eq 30105)',
            title: 'Betalingsliste',
            positive: false,
            link: '/accounting/bills?filter=ToPayment',
            icon: 'list',
            class: 'green-counter'
        }
    },
    {
        id: 'payment_no_match',
        description: 'Innbetalt ingen match',
        permissions: [],
        width: 3,
        height: 1,
        widgetType: 'sum',
        config: {
            dataEndpoint: `/api/statistics?model=Payment&select=count(payment.id) as sum&filter=(Payment.IsCustomerPayment eq 'true' and Payment.StatusCode eq '44018' )&join=Payment.JournalEntryID eq JournalEntry.ID and JournalEntry.ID eq FileEntityLink.EntityID`,
            title: 'Innbetalt ingen match',
            positive: false,
            link: '/bank?code=bank_list&filter=incomming_without_match',
            icon: 'account_balance',
            class: 'pink-counter'
        }
    },
    {
        id: 'sum_assigned',
        description: 'Tildelte faktura',
        permissions: ['ui_accounting'],
        width: 3,
        height: 1,
        widgetType: 'sum',
        config: {
            dataEndpoint: `api/statistics?model=Approval&expand=Task.Model&filter=UserID eq <userID> and ` +
            `StatusCode eq 50120 and Model.Name eq 'SupplierInvoice'&select=count(ID) as sum`, // tslint:disable,
            title: 'Tildelte faktura',
            positive: true,
            link: '/accounting/bills?filter=ForApproval&assignee=<userID>',
            icon: 'notifications_none',
            class: 'yellow-counter'
        }
    },
    {
        id: 'sum_employees',
        description: 'Antall ansatte',
        permissions: ['ui_salary'],
        width: 3,
        height: 1,
        widgetType: 'sum',
        config: {
            dataEndpoint: `/api/statistics?model=Employee&select=count(id) as sum`,
            title: 'Ansatte',
            positive: false,
            link: '/salary/employees',
            icon: 'mood',
            class: 'green-counter'
        }
    },
    {
        id: 'sum_employments',
        description: 'Antall stillingskoder',
        permissions: ['ui_salary'],
        width: 3,
        height: 1,
        widgetType: 'sum',
        config: {
            dataEndpoint: `/api/statistics?model=Employment&select=JobName`,
            title: 'Stillingskoder',
            positive: false,
            link: '/salary/employees/0/employments',
            icon: 'people_outline',
            class: 'pink-counter',
            useLength: true
        }
    },
    {
        id: 'sum_wagetypes',
        description: 'Antall lønnsarter',
        permissions: ['ui_salary'],
        width: 3,
        height: 1,
        widgetType: 'sum',
        config: {
            dataEndpoint: `/api/statistics?model=WageType&select=count(ID) as sum`,
            title: 'Lønnsarter',
            positive: false,
            link: '/salary/wagetypes',
            icon: 'money',
            class: 'blue-counter'
        }
    },
];
