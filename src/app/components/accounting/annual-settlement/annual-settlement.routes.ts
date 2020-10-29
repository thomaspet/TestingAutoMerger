import {Routes} from '@angular/router';
import {CanDeactivateGuard} from '@app/canDeactivateGuard';
import {AnnualSettlementStepsComponent} from '@app/components/accounting/annual-settlement/annual-settlement-steps/annual-settlement-steps.component';

export const annualSettlementRoutes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        component: AnnualSettlementStepsComponent,
        canDeactivate: [CanDeactivateGuard]
    },
];
