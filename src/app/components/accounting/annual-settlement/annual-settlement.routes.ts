import {Routes} from '@angular/router';
import {CanDeactivateGuard} from '@app/canDeactivateGuard';
import {AnnualSettlementRoadMapComponent} from '@app/components/accounting/annual-settlement/annual-settlement-road-map/annual-settlement-road-map.component';
import {AnnualSettlementCheckListComponent} from '@app/components/accounting/annual-settlement/annual-settlement-check-list/annual-settlement-check-list.component';

export const annualSettlementRoutes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        component: AnnualSettlementRoadMapComponent,
        canDeactivate: [CanDeactivateGuard]
    },
    {
        path: ':id/check-list',
        component: AnnualSettlementCheckListComponent,
        canDeactivate: [CanDeactivateGuard]
    },
];
