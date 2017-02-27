import {ModuleWithProviders} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {CurrencyOverrides} from './currencyoverrides/currencyoverrides';
import {CurrencyComponent} from './currencyComponent';
import {CurrencyExchange} from './currencyexchange/currencyexchange';
import {AuthGuard} from '../../authGuard';
import {CanDeactivateGuard} from '../../canDeactivateGuard';

export const childRoutes: Routes = [
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
];

const currencyRoutes: Routes = [
    {
        path: 'currency',
        component: CurrencyComponent,
        canActivate: [AuthGuard],
        children: [{
            path: '',
            canActivateChild: [AuthGuard],
            children: childRoutes
        }],

    }
];

export const routes: ModuleWithProviders = RouterModule.forChild(currencyRoutes);
