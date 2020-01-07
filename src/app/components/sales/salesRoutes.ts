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

import {UniRecurringInvoice} from './recurringInvoice/recurringInvoiceDetails';
import {RecurringInvoiceList} from './recurringInvoice/recurringInvoiceList';

import {SellerList} from './sellers/sellerList';
import {SellerDetails} from './sellers/sellerDetails';

import {ProductGroups} from './productgroup/productgroups';
import {KIDSettings} from './kidSettings/kidSettings';

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
        path: 'recurringinvoice',
        component: RecurringInvoiceList
    },
    {
        path: 'recurringinvoice/:id',
        component: UniRecurringInvoice,
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
        component: ProductDetails,
        canDeactivate: [CanDeactivateGuard]
    },
    {
        path: 'productgroups',
        component: ProductGroups,
        canDeactivate: [CanDeactivateGuard]
    },
    {
        path: 'productgroups/:id',
        component: ProductGroups,
        canDeactivate: [CanDeactivateGuard]
    },
    {
        path: 'sellers',
        component: SellerList,
    },
    {
        path: 'sellers/:id',
        component: SellerDetails,
        canDeactivate: [CanDeactivateGuard]
    },
    {
        path: 'sellers/:id/sales',
        component: SellerDetails,
        canDeactivate: [CanDeactivateGuard]
    },
    {
        path: 'kidsettings',
        component: KIDSettings,
        canDeactivate: [CanDeactivateGuard],
    },
    {
        path: 'batch-invoices',
        loadChildren: () => import('./batch-invoice/batch-invoice.module').then(m => m.BatchInvoiceModule),
    },
];
