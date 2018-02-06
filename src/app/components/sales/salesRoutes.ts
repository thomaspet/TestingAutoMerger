import {Routes} from '@angular/router';
import {CanDeactivateGuard} from '../../canDeactivateGuard';

import {UniSales} from './sales';
import {Customer} from './customer/customer';
import {routes as CustomerRoutes} from './customer/customerRoutes';

import {QuoteList} from './quote/list/quoteList';
import {QuoteDetails} from './quote/details/quoteDetails';

import {InvoiceList} from './invoice/list/invoiceList';
import {InvoiceDetails} from './invoice/details/invoice';

import {OrderList} from './order/list/orderList';
import {OrderDetails} from './order/details/orderDetails';

import {Reminder} from './reminder/reminder';
import {routes as ReminderRoutes} from './reminder/reminderRoutes';

import {ProductList} from './products/productList';
import {ProductDetails} from './products/productDetails';

import {SellerList} from './sellers/sellerList';
import {SellerDetails} from './sellers/sellerDetails';
import {SellerSalesList} from './sellers/sellerSalesList';
import {SellerDetailsComponent} from './sellers/sellerDetailsComponent';

import {ProductGroups} from './productgroup/productgroups';
import {routes as ProductGroupRoutes} from './productgroup/productGroupRoutes';

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
    {
        path: 'reminders',
        component: Reminder,
        children: ReminderRoutes
    },
    {
        path: 'products',
        component: ProductList
    },

    {
        path: 'products/:id',
        component: ProductDetails
    },
    {
        path: 'productgroups',
        component: ProductGroups,
        children: ProductGroupRoutes,
        canDeactivate: [CanDeactivateGuard]
    },
    {
        path: 'sellers',
        component: SellerList,
    },
    {
        path: 'sellers/:id',
        component: SellerDetailsComponent,
        children: [
            {
                path: '',
                pathMatch: 'full',
                redirectTo: 'details'
            },
            {
                path: 'details',
                component: SellerDetails
            },
            {
                path: ':mode',
                component: SellerSalesList
            }
        ]
    }
];
