import { NgModule } from '@angular/core';
import { IncomingBalanceSharedModule } from '../../shared/incoming-balance-shared.module';
import { IncomingBalanceWizardNavigationComponent } from './components/incoming-balance-wizard-navigation/incoming-balance-wizard-navigation.component';
import { IncomingBalanceListStoreService } from './services/incoming-balance-list-store.service';
import { IncomingBalanceCustomersStoreService } from './services/incoming-balance-customers-store.service';
import { IncomingBalanceSupplierStoreService } from './services/incoming-balance-supplier-store.service';
import { IncomingBalanceTotalsComponent } from './components/incoming-balance-totals/incoming-balance-totals.component';
import { IncomingBalanceDiffService } from './services/incoming-balance-diff.service';
import { IncomingBalanceInfoComponent } from './components/incoming-balance-info/incoming-balance-info.component';
import { IncomingBalanceSuppliersGuard } from './guards/incoming-balance-suppliers.guard';
import { IncomingBalanceCustomersGuard } from './guards/incoming-balance-customers.guard';
import { IncomingBalanceTabEmptyStateComponent } from './components/incoming-balance-tab-empty-state/incoming-balance-tab-empty-state.component';



@NgModule({
    declarations: [
        IncomingBalanceWizardNavigationComponent,
        IncomingBalanceTotalsComponent,
        IncomingBalanceInfoComponent,
        IncomingBalanceTabEmptyStateComponent
    ],
    imports: [
        IncomingBalanceSharedModule,
    ],
    exports: [
        IncomingBalanceSharedModule,
        IncomingBalanceWizardNavigationComponent,
        IncomingBalanceTotalsComponent,
        IncomingBalanceInfoComponent,
        IncomingBalanceTabEmptyStateComponent,
    ],
    providers: [
        IncomingBalanceListStoreService,
        IncomingBalanceCustomersStoreService,
        IncomingBalanceSupplierStoreService,
        IncomingBalanceDiffService,
        IncomingBalanceSuppliersGuard,
        IncomingBalanceCustomersGuard,
    ]
})
export class IncomingBalanceWizardSharedModule { }
