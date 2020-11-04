import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IncomingBalanceBalanceComponent } from './incoming-balance-list/incoming-balance-list.component';
import { IncomingBalanceCustomersComponent } from './incoming-balance-customers/incoming-balance-customers.component';
import { IncomingBalanceDateComponent } from './incoming-balance-date/incoming-balance-date.component';
import { IncomingBalancePreparationComponent } from './incoming-balance-preparation/incoming-balance-preparation.component';
import { IncomingBalanceCustomersGuard } from './shared/guards/incoming-balance-customers.guard';
import { IncomingBalanceSuppliersGuard } from './shared/guards/incoming-balance-suppliers.guard';
import { IncomingBalanceSuppliersComponent } from './incoming-balance-suppliers/incoming-balance-suppliers.component';
import { IncomingBalanceWizardComponent } from './incoming-balance-wizard.component';

const routes: Routes = [
        {
            path: '',
            component: IncomingBalanceWizardComponent,
            children: [
                {
                    path: '',
                    redirectTo: 'preparation',
                },
                {
                    path: 'preparation',
                    component: IncomingBalancePreparationComponent,
                },
                {
                    path: 'date',
                    component: IncomingBalanceDateComponent,
                },
                {
                    path: 'balance',
                    component: IncomingBalanceBalanceComponent,
                },
                {
                    path: 'customers',
                    component: IncomingBalanceCustomersComponent,
                    canActivate: [IncomingBalanceCustomersGuard]
                },
                {
                    path: 'suppliers',
                    component: IncomingBalanceSuppliersComponent,
                    canActivate: [IncomingBalanceSuppliersGuard]
                },
            ],
        },
    ];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class IncomingBalanceWizardRoutingModule { }
