import {Routes} from '@angular/router';
import {CanDeactivateGuard} from '../../canDeactivateGuard';
import {BankComponent} from './bankComponent';

export const bankRoutes: Routes = [
    {
        path: '',
        component: BankComponent,
    },
    {
        path: '/:code',
        component: BankComponent,
    }
];

