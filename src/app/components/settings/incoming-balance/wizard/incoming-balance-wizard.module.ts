import { NgModule } from '@angular/core';
import { IncomingBalanceBalanceComponent } from './incoming-balance-list/incoming-balance-list.component';
import { IncomingBalanceCustomersComponent } from './incoming-balance-customers/incoming-balance-customers.component';
import { IncomingBalanceDateComponent } from './incoming-balance-date/incoming-balance-date.component';
import { IncomingBalancePreparationComponent } from './incoming-balance-preparation/incoming-balance-preparation.component';
import { IncomingBalanceWizardSharedModule } from './shared/incoming-balance-wizard-shared.module';
import { IncomingBalanceSuppliersComponent } from './incoming-balance-suppliers/incoming-balance-suppliers.component';
import { IncomingBalanceWizardRoutingModule } from './incoming-balance-wizard-routing.module';
import { IncomingBalanceWizardComponent } from './incoming-balance-wizard.component';

@NgModule({
    declarations: [
        IncomingBalanceWizardComponent,
        IncomingBalancePreparationComponent,
        IncomingBalanceDateComponent,
        IncomingBalanceBalanceComponent,
        IncomingBalanceCustomersComponent,
        IncomingBalanceSuppliersComponent,
    ],
    imports: [
        IncomingBalanceWizardSharedModule,
        IncomingBalanceWizardRoutingModule,
    ]
})
export class IncomingBalanceWizardModule { }
