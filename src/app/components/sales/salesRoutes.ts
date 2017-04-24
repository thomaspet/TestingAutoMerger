import {Routes} from '@angular/router';
import {CanDeactivateGuard} from '../../canDeactivateGuard';

import {UniSales} from './sales';
import {Customer} from './customer/customer';
import {routes as CustomerRoutes} from './customer/customerRoutes';

import {QuoteList} from './quote/list/quoteList';
import {QuoteDetails} from './quote/details/quoteDetails';

import {InvoiceList} from './invoice/list/invoiceList';
import {InvoiceList2} from './invoice/list/invoiceList2';
import {InvoiceDetails} from './invoice/details/invoice';

import {OrderList} from './order/list/orderList';
import {OrderDetails} from './order/details/orderDetails';

import {Reminder} from './reminder/reminder';
import {routes as ReminderRoutes} from './reminder/reminderRoutes';

export const salesRoutes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        component: UniSales
    },
    {
        path: 'customer',
        component: Customer,
        children: CustomerRoutes
    },
    {
        path: 'quotes',
        component: QuoteList
    },
    {
        path: 'quotes/:id',
        component: QuoteDetails,
        canDeactivate: [CanDeactivateGuard]
    },

    {
        path: 'invoicesold',
        component: InvoiceList
    },
    {
        path: 'invoices',
        component: InvoiceList2
    },
    {
        path: 'invoices/:id',
        component: InvoiceDetails,
        canDeactivate: [CanDeactivateGuard]
    },
    {
        path: 'orders',
        component: OrderList
    },
    {
        path: 'orders/:id',
        component: OrderDetails,
        canDeactivate: [CanDeactivateGuard]
    },

    {
        path: 'reminders',
        component: Reminder,
        children: ReminderRoutes
    }

];

// const salesRoutes: Routes = [
//     {
//         path: 'sales',
//         component: UniSales,
//         canActivate: [AuthGuard],
//         children: [{
//             path: '',
//             canActivateChild: [AuthGuard],
//             children: childRoutes
//         }],

//     }
// ];

// export const routes: ModuleWithProviders = RouterModule.forChild(salesRoutes);
