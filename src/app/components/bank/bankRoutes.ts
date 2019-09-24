import {Routes} from '@angular/router';
import {CanDeactivateGuard} from '../../canDeactivateGuard';
import {BankComponent} from './bankComponent';
import {UniBank} from './bank';
import {UniBankReconciliationList} from './reconciliation/reconciliation-list/reconciliation-list';

export const bankRoutes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        component: UniBank,
    },
    {
        path: 'ticker',
        component: BankComponent,
    },
    {
        path: 'reconciliation',
        component: UniBankReconciliationList
    }
];

