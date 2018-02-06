import {Routes} from '@angular/router';
import {CurrencyOverrides} from './currencyoverrides/currencyoverrides';
import {CurrencyComponent} from './currencyComponent';
import {CurrencyExchange} from './currencyexchange/currencyexchange';
import {CanDeactivateGuard} from '../../canDeactivateGuard';

export const currencyRoutes: Routes = [
    {
        path: 'currency',
        component: CurrencyComponent,
        children: [
            {
                path: '',
                redirectTo: 'exchange',
                pathMatch: 'full'
            },
            {
                path: 'overrides',
                component: CurrencyOverrides,
                canDeactivate: [CanDeactivateGuard]
            },
            {
                path: 'exchange',
                component: CurrencyExchange
            }
        ]
    },
];
