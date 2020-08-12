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
import {BrunoAccountingServicesWidget} from './misc/bruno-accounting-services/bruno-accounting-services';
import {THEMES, theme} from 'src/themes/theme';
import {LiquidityWidget} from './charts/liquidity/liquidity';
import {EmployeesWidget} from './misc/employees/employees-widget';
import {EmploymentsPerJobCodeWidget} from './charts/employments-per-job-code/employments-per-job-code';

export * from './widget';

export const WIDGET_COMPONENTS = [
    TimeentryWidget,
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
    BrunoAccountingServicesWidget,
    LiquidityWidget,
    EmployeesWidget,
    EmploymentsPerJobCodeWidget,
];

export const WIDGET_DEFINITIONS: WidgetDefinition[] = [
    {
        name: 'TIME_ENTRY',
        label: 'Timeføring',
        size: 'small',
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
        component: OperatingProfitsWidget
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
        name: 'INVOICED',
        label: 'Fakturert',
        size: 'large',
        category: WidgetCategory.CHART,
        module: WidgetModule.SALES,
        component: InvoicedWidget,
        routePermissions: ['ui_sales_invoices'],
    },
    {
        name: 'BRUNO_ACCOUNTING_SERVICES',
        label: 'Bestille regnskapstjenester',
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
    }
];

