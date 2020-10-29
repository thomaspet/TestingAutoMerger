import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IncomingBalanceComponent } from './incoming-balance.component';
import { IncomingBalanceGuard } from './shared/guards/incoming-balance.guard';

const routes: Routes = [
        {
            path: '',
            component: IncomingBalanceComponent,
        },
        {
            path: 'choice',
            component: IncomingBalanceComponent,
            canActivate: [IncomingBalanceGuard],
        },
        {
            path: 'wizard',
            loadChildren: () => import('@app/components/settings/incoming-balance/wizard/incoming-balance-wizard.module')
                .then(m => m.IncomingBalanceWizardModule),
        }
    ];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class IncomingBalanceRoutingModule { }
