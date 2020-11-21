import {WidgetDefinition, WidgetCategory, WidgetModule} from '../models';
import {TimeentryWidget} from './charts/timeentry/timeentry';
import {ReminderWidget} from './misc/reminder-widget/reminder-widget';
import {OperatingProfitsWidget} from './charts/operating-profits/operating-profits';
import {UnpaidWidget} from './charts/unpaid/unpaid';
import {ExpensesWidget} from './charts/expenses/expenses';
import {PublicDueDatesWidget} from './misc/public-duedates/public-duedates';
import {BankBalanceWidget, Ext02BankBalanceWidget, BankBalanceWidgetContent} from './misc/bank-balance';
import {UnpaidBillsWidget} from './charts/unpaid-bills/unpaid-bills';
import {InvoicedWidget} from './charts/invoiced/invoiced';
import {OrderReserveWidget} from './charts/order-reserve/order-reserve';
import {BrunoAccountingServicesWidget} from './misc/bruno-accounting-services/bruno-accounting-services';
import {THEMES, theme} from 'src/themes/theme';
import {LiquidityWidget} from './charts/liquidity/liquidity';
import {EmploymentsPerJobCodeWidget} from './charts/employments-per-job-code/employments-per-job-code';
import {TopTenCustomersWidget} from './misc/top-ten-customers/top-ten-customers';
import {UnpaidPerCustomer} from './charts/unpaid-per-customer/unpaid-per-customer';
import {BalanceWidget} from './charts/balance-widget/balance-widget';
import {PaymentsWidget} from './charts/payments-widget/payments-widget';
import {TravelsWidget} from './misc/travels-widget/travels-widget';
import {RecentEmployeesComponent} from './misc/recent-employees/recent-employees.component';
import {RecentPayrollRunsComponent} from './misc/recent-payroll-runs/recent-payroll-runs.component';
import {EmployeesWidget} from './misc/employees/employees-widget';
import {SalaryShortcutsComponent} from './misc/salary-shortcuts/salary-shortcuts.component';
import {NewEntitiesWidget} from './misc/new-entities/new-entities';
import {ReportShortcutsWidget, SelectReportsModal} from './misc/report-shortcuts/report-shortcuts';
import {WorkItemPieChart} from './charts/workitem-pie-chart/workitem-pie-chart';
import {BankStatusWidget} from './misc/bank-status/bank-status';
import {NewsletterWidget} from './misc/newsletter/newsletter-widget';
import {CurrencyWidget} from './charts/currency-widget/currency-widget';

export * from './widget';

export const WIDGET_COMPONENTS = [
    TimeentryWidget,
    WorkItemPieChart,
    ReminderWidget,
    OperatingProfitsWidget,
    UnpaidWidget,
    UnpaidBillsWidget,
    ExpensesWidget,
    PublicDueDatesWidget,
    BankBalanceWidget,
    Ext02BankBalanceWidget,
    BankBalanceWidgetContent,
    InvoicedWidget,
    OrderReserveWidget,
    BrunoAccountingServicesWidget,
    LiquidityWidget,
    EmployeesWidget,
    EmploymentsPerJobCodeWidget,
    TopTenCustomersWidget,
    UnpaidPerCustomer,
    BalanceWidget,
    PaymentsWidget,
    TravelsWidget,
    RecentEmployeesComponent,
    RecentPayrollRunsComponent,
    SalaryShortcutsComponent,
    NewEntitiesWidget,
    ReportShortcutsWidget,
    SelectReportsModal,
    BankStatusWidget,
    NewsletterWidget,
    CurrencyWidget
];

export const WIDGET_DEFINITIONS: WidgetDefinition[] = [
    {
        name: 'TIME_ENTRY',
        label: 'Timeføring',
        size: 'large',
        category: WidgetCategory.CHART,
        module: WidgetModule.TIMETRACKING,
        component: TimeentryWidget
    },
    {
        name: 'OPERATING_PROFITS',
        label: 'Driftsresultat',
        size: 'large',
        category: WidgetCategory.CHART,
        module: WidgetModule.MISC,
        component: OperatingProfitsWidget,
        routePermissions: ['ui_accounting']
    },
    {
        name: 'UNPAID',
        label: 'Kundefordringer',
        size: 'large',
        category: WidgetCategory.CHART,
        module: WidgetModule.SALES,
        component: UnpaidWidget,
        routePermissions: ['ui_sales_invoices'],
    },
    {
        name: 'UNPAID_BILLS',
        label: 'Ubetalte regninger',
        size: 'small',
        category: WidgetCategory.CHART,
        module: WidgetModule.ACCOUNTING,
        component: UnpaidBillsWidget,
        routePermissions: ['ui_accounting_bills'],
    },
    {
        name: 'EXPENSES',
        label: 'Kostnader',
        size: 'small',
        category: WidgetCategory.CHART,
        module: WidgetModule.MISC,
        component: ExpensesWidget,
        routePermissions: ['ui_accounting'],
    },
    {
        name: 'REMINDER_WIDGET',
        label: 'Huskeliste',
        size: 'small',
        category: WidgetCategory.MISC,
        module: WidgetModule.MISC,
        component: ReminderWidget,
        options: {
            showPublicDueDates: false
        }
    },
    {
        name: 'REMINDER_WIDGET_WITH_PUBLIC_DUEDATES',
        label: 'Huskeliste med offentlige frister',
        size: 'small',
        category: WidgetCategory.MISC,
        module: WidgetModule.MISC,
        component: ReminderWidget,
        options: {
            showPublicDueDates: true
        }
    },
    {
        name: 'PUBLIC_DUEDATES',
        label: 'Offentlige frister',
        size: 'small',
        category: WidgetCategory.MISC,
        module: WidgetModule.MISC,
        component: PublicDueDatesWidget
    },
    {
        name: 'BANK_BALANCE',
        label: 'Banksaldo',
        size: 'large',
        category: WidgetCategory.MISC,
        module: WidgetModule.BANK,
        component: theme.theme === THEMES.EXT02 ? Ext02BankBalanceWidget : BankBalanceWidget,
        routePermissions: ['ui_bank']
    },
    {
        name: 'BANK_STATUS',
        label: 'Bankstatus',
        size: 'small',
        category: WidgetCategory.MISC,
        module: WidgetModule.BANK,
        component: BankStatusWidget,
        routePermissions: ['ui_bank']
    },
    {
        name: 'INVOICED',
        label: 'Fakturert',
        size: 'large',
        category: WidgetCategory.CHART,
        module: WidgetModule.SALES,
        component: InvoicedWidget,
        routePermissions: ['ui_sales_invoices'],
    },
    {
        name: 'ORERESERVE',
        label: 'Ordrereserve',
        size: 'large',
        category: WidgetCategory.CHART,
        module: WidgetModule.SALES,
        component: OrderReserveWidget,
        routePermissions: ['ui_sales_invoices'],
    },
    {
        name: 'NEWSLETTER',
        label: 'Nyhetsbrev',
        size: 'small',
        category: WidgetCategory.MISC,
        module: WidgetModule.MISC,
        onlyForTheme: THEMES.UE,
        component: NewsletterWidget
    },
    {
        name: 'CURRENCY',
        label: 'Valutakurser',
        size: 'large',
        category: WidgetCategory.MISC,
        module: WidgetModule.MISC,
        component: CurrencyWidget
    },
    {
        name: 'BRUNO_ACCOUNTING_SERVICES',
        label: 'Bestille bankkort',
        size: 'small',
        category: WidgetCategory.MISC,
        module: WidgetModule.MISC,
        onlyForTheme: THEMES.EXT02,
        component: BrunoAccountingServicesWidget
    },
    {
        name: 'LIQUIDITY',
        label: 'Likviditetsprognose',
        size: 'large',
        category: WidgetCategory.CHART,
        module: WidgetModule.MISC,
        component: LiquidityWidget
    },
    {
        name: 'EMPLOYEES',
        label: 'Ansattoversikt',
        size: 'small',
        category: WidgetCategory.MISC,
        module: WidgetModule.SALARY,
        component: EmployeesWidget,
        routePermissions: ['ui_salary'],
    },
    {
        name: 'EMPLOYMENTS_PER_JOBCODE',
        label: 'Ansatte per stillingskode',
        size: 'small',
        category: WidgetCategory.CHART,
        module: WidgetModule.SALARY,
        component: EmploymentsPerJobCodeWidget,
        routePermissions: ['ui_salary'],
    },
    {
        name: 'RECENT_EMPLOYEES',
        label: 'Siste ansatte',
        size: 'large',
        category: WidgetCategory.MISC,
        module: WidgetModule.SALARY,
        component: RecentEmployeesComponent,
        routePermissions: ['ui_salary'],
    },
    {
        name: 'RECENT_PAYROLL_RUNS',
        label: 'DASHBOARD.RECENT_PAYROLL_RUNS.HEADER',
        size: 'large',
        category: WidgetCategory.MISC,
        module: WidgetModule.SALARY,
        component: RecentPayrollRunsComponent,
        routePermissions: ['ui_salary'],
    },
    {
        name: 'SALARY_SHORTCUTS',
        label: 'Snarveier',
        size: 'small',
        category: WidgetCategory.MISC,
        module: WidgetModule.SALARY,
        component: SalaryShortcutsComponent,
        routePermissions: ['ui_salary'],
    },
    {
        name: 'TOP_TEN_CUSTOMERS',
        label: 'Topp 10 kunder',
        size: 'large',
        category: WidgetCategory.MISC,
        module: WidgetModule.SALES,
        component: TopTenCustomersWidget,
        routePermissions: ['ui_sales_invoices']
    },
    {
        name: 'UNPAID_PER_CUSTOMER',
        label: 'Utestående per  kunde',
        size: 'small',
        category: WidgetCategory.CHART,
        module: WidgetModule.SALES,
        component: UnpaidPerCustomer,
        routePermissions: ['ui_sales_invoices']
    },
    {
        name: 'BALANCE',
        label: 'Balansefordeling',
        size: 'small',
        category: WidgetCategory.CHART,
        module: WidgetModule.ACCOUNTING,
        component: BalanceWidget,
        routePermissions: ['ui_accounting']
    },
    {
        name: 'PAYMENTS',
        label: 'Inn- og utbetalinger',
        size: 'large',
        category: WidgetCategory.CHART,
        module: WidgetModule.BANK,
        component: PaymentsWidget,
        routePermissions: ['ui_bank_payments']
    },
    {
        name: 'TRAVELS',
        label: 'Reiseregninger',
        size: 'small',
        category: WidgetCategory.MISC,
        module: WidgetModule.SALARY,
        component: TravelsWidget,
        routePermissions: ['ui_salary_travels']
    },
    {
        name: 'NEW_ENTITIES',
        label: 'Nye',
        size: 'small',
        category: WidgetCategory.MISC,
        module: WidgetModule.MISC,
        component: NewEntitiesWidget
    },
    {
        name: 'REPORT_SHORTCUTS',
        label: 'Rapportsnarveier',
        size: 'small',
        category: WidgetCategory.MISC,
        module: WidgetModule.MISC,
        component: ReportShortcutsWidget,
    },
    {
        name: 'HOURS_PER_WORKTYPE',
        label: 'Timer per timeart',
        size: 'small',
        category: WidgetCategory.CHART,
        module: WidgetModule.TIMETRACKING,
        component: WorkItemPieChart,
        options: {
            viewMode: 'worktype',
            header: 'Timer per timeart',
            select: 'WorkType.Name',
            expand: 'WorkType'
        }
    },
    {
        name: 'HOURS_PER_PROJECT',
        label: 'Timer per prosjekt',
        size: 'small',
        category: WidgetCategory.CHART,
        module: WidgetModule.TIMETRACKING,
        component: WorkItemPieChart,
        options: {
            viewMode: 'project',
            header: 'Timer per prosjekt',
            select: `isnull(Project.Name,'Uten prosjekt',Project.Name)`,
            expand: 'Dimensions.Project'
        }
    },
];

