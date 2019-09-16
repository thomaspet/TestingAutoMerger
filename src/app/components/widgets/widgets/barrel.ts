import {UniChartWidget} from './chart';
import {UniClockWidget} from './clock/clock';
import {UniCompanyLogoWidget} from './companyLogo';
import {UniSumWidget} from './sumWidget';
import {UniFlexWidget} from './flex';
import {UniTransactionsWidget} from './transactions';
import {UniShortcutListWidget} from './shortcutList';
import {UniCurrencyWidget} from './currency';
import {TopTenCustomersWidget} from './top-ten-customers/top-ten-customers';
import {UniIntegrationCounterWidget} from './integrationCounter';
import {OperatingProfitWidget} from './operating-profits/operating-profits';
import {UniReportListWidget} from './report-list/report-list';

import {UniShortcutWidget} from './shortcuts';
import {InvoicedWidget} from './invoiced/invoiced';
import {UniUnpaidDoughnutChart} from './unpaid-doughnut-chart';
import {TimetrackingCalendar} from './timetracking-calendar/timetracking-calendar';
import {UniEventsWidget} from './eventswidget';
import {KpiWidget} from './kpi/kpi';
import {UniTimetrackingCharts} from './timetracking-charts/timetracking-charts';
import {AssignmentsWidget} from './assignments/assignments-widget';
import {ExpensesWidget} from './expenses/expenses-widget';
import {BalanceWidget} from './balance/balance-widget';
import {PaymentWidget} from './payment/payment-chart';

export const UNI_WIDGETS = [
    UniShortcutWidget,
    UniChartWidget,
    UniClockWidget,
    UniCompanyLogoWidget,
    UniSumWidget,
    UniFlexWidget,
    UniTransactionsWidget,
    UniShortcutListWidget,
    UniCurrencyWidget,
    TopTenCustomersWidget,
    UniIntegrationCounterWidget,
    InvoicedWidget,
    UniUnpaidDoughnutChart,
    TimetrackingCalendar,
    OperatingProfitWidget,
    KpiWidget,
    UniReportListWidget,
    UniEventsWidget,
    UniTimetrackingCharts,
    AssignmentsWidget,
    ExpensesWidget,
    BalanceWidget,
    PaymentWidget
];

export * from './shortcuts';
export * from './chart';
export * from './clock/clock';
export * from './companyLogo';
export * from './sumWidget';
export * from './flex';
export * from './transactions';
export * from './shortcutList';
export * from './currency';
export * from './top-ten-customers/top-ten-customers';
export * from './integrationCounter';
export * from './operating-profits/operating-profits';
export * from './invoiced/invoiced';
export * from './timetracking-calendar/timetracking-calendar';
export * from './kpi/kpi';
export * from './unpaid-doughnut-chart';
export * from './report-list/report-list';
export * from './eventswidget';
export * from './timetracking-charts/timetracking-charts';
export * from './assignments/assignments-widget';
export * from './expenses/expenses-widget';
export * from './balance/balance-widget';
export * from './payment/payment-chart';
