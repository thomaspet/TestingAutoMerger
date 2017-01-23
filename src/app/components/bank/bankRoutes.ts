import {Routes} from '@angular/router';
import {AuthGuard} from '../../authGuard';
import {CanDeactivateGuard} from '../../canDeactivateGuard';
import {BankComponent} from './bankComponent';
import {PaymentList} from './payments/paymentList';
import {PaymentBatches} from './payments/paymentBatches';

import {CustomerPaymentBatches} from './payments/customerPaymentBatches';

export const bankRoutes: Routes = [
    {
        path: '',
        component: BankComponent,
        canActivate: [AuthGuard],
        children: [
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
            },
            {
                path: 'customerbatches',
                component: CustomerPaymentBatches
            }
        ],

    }
];

