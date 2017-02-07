import {Routes} from '@angular/router';
import {CanDeactivateGuard} from '../../canDeactivateGuard';

import {Customer} from './customer/customer';
import {routes as CustomerRoutes} from './customer/customerRoutes';

import {QuoteList} from './quote/list/quoteList';
import {QuoteDetails} from './quote/details/quoteDetails';

import {InvoiceList} from './invoice/list/invoiceList';
import {InvoiceDetails} from './invoice/details/invoice';

import {OrderList} from './order/list/orderList';
import {OrderDetails} from './order/details/orderDetails';

// Maps entitytype to frontend route
// Important for notifications to work properly!
export const entityTypeMap: any = {
    // 'supplier': 'suppliers/:id',
    'customerquote': 'quotes/:id',
    'customerquoteitem': 'quotes/:id',
    'customerorder': 'orders/:id',
    'customerorderitem': 'orders/:id',
    'customerinvoice': 'invoices/:id',
    'customerinvoiceitem': 'invoices/:id',
};

export const salesRoutes: Routes = [
    {
        path: 'customer',
        component: Customer,
        children: CustomerRoutes
    },

    // {
    //     path: 'suppliers',
    //     component: SupplierList
    // },
    // {
    //     path: 'suppliers/:id',
    //     component: SupplierDetails,
    //     canDeactivate: [CanDeactivateGuard]
    // },

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
        path: 'invoices',
        component: InvoiceList
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
