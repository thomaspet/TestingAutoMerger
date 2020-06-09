import {AssetDetailsTab} from '@app/components/accounting/assets/asset-details-tab';
import {routes as AssetsRoutes} from '@app/components/accounting/assets/asset-details.routes';
import {CanDeactivateGuard} from '@app/canDeactivateGuard';
import {AssetsListComponent} from '@app/components/accounting/assets/assets-list/assets-list';
import {Routes} from '@angular/router';

export const assetsRoutes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        component: AssetsListComponent,
        canDeactivate: [CanDeactivateGuard]
    },
    {
        path: ':id',
        component: AssetDetailsTab,
        children: AssetsRoutes,
        canDeactivate: [CanDeactivateGuard]
    }
];
