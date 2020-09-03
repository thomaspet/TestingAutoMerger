import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {LibraryImportsModule} from '@app/library-imports.module';
import {UniFrameworkModule} from '@uni-framework/frameworkModule';

import {DashboardNew} from './dashboard';
import {Widget, WIDGET_COMPONENTS} from './widgets';
import {WidgetChart} from './widgets/charts/widget-chart';
import {WidgetPieChart} from './widgets/charts/widget-pie-chart';
import {WidgetSelectorDialog} from './widget-selector-dialog/widget-selector-dialog';
import {DashboardDataService} from './dashboard-data.service';
import {WidgetEmptyState} from './widgets/widget-empty-state';
import {LiquidityPaymentModal} from './widgets/charts/liquidity/payment-modal/liquidity-payment-modal';
import { RecentEmployeesService } from './widgets/misc/recent-employees/recent-employees.service';
import { RecentPayrollRunsService } from './widgets/misc/recent-payroll-runs/recent-payroll-runs.service';
import {EmployeeWidgetService} from './widgets/misc/employees/shared/services/employee-widget.service';

@NgModule({
    imports: [
        CommonModule,
        LibraryImportsModule,
        UniFrameworkModule
    ],
    declarations: [
        DashboardNew,
        WidgetChart,
        WidgetPieChart,
        Widget,
        WidgetSelectorDialog,
        WidgetEmptyState,
        LiquidityPaymentModal,
        ...WIDGET_COMPONENTS,
    ],
    providers: [
        DashboardDataService,
        RecentEmployeesService,
        RecentPayrollRunsService,
        EmployeeWidgetService,
    ],
    exports: [DashboardNew]
})
export class DashboardModule {}

