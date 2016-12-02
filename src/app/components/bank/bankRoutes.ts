import {ModuleWithProviders} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {AuthGuard} from '../../authGuard';
import {CanDeactivateGuard} from '../../canDeactivateGuard';

import {BankComponent} from './bankComponent';
import {PaymentList} from './payments/paymentList';
import {PaymentBatches} from './payments/paymentBatches';

export const childRoutes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'payments'
    },
    {
        path: 'payments',
        component: PaymentList,
        canDeactivate: [CanDeactivateGuard]
    },
    {
        path: 'batches',
        component: PaymentBatches
    }
];


const bankRoutes: Routes = [
    {
        path: 'bank',
        component: BankComponent,
        canActivate: [AuthGuard],
        children: [{
            path: '',
            canActivateChild: [AuthGuard],
            children: childRoutes
        }],

    }
];

export const routes: ModuleWithProviders = RouterModule.forChild(bankRoutes);

