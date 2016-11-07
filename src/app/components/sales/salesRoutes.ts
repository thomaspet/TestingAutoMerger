import {ModuleWithProviders} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AuthGuard} from '../../authGuard';

import {Customer} from './customer/customer';
import {routes as CustomerRoutes} from './customer/customerRoutes';

import {SupplierList} from './supplier/list/supplierList';
import {SupplierDetails} from './supplier/details/supplierDetails';

import {QuoteList} from './quote/list/quoteList';
import {QuoteDetails} from './quote/details/quoteDetails';

import {InvoiceList} from './invoice/list/invoiceList';
import {InvoiceDetails} from './invoice/details/invoice';

import {OrderList} from './order/list/orderList';
import {OrderDetails} from './order/details/orderDetails';
import {UniSales} from './sales';

export const childRoutes = [
    {
        path: 'customer',
        component: Customer,
        children: CustomerRoutes
    },

    {
        path: 'suppliers',
        component: SupplierList
    },
    {
        path: 'suppliers/:id',
        component: SupplierDetails
    },

    {
        path: 'quotes',
        component: QuoteList
    },
    {
        path: 'quotes/:id',
        component: QuoteDetails
    },

    {
        path: 'invoices',
        component: InvoiceList
    },
    {
        path: 'invoices/:id',
        component: InvoiceDetails
    },
    {
        path: 'orders',
        component: OrderList
    },
    {
        path: 'orders/:id',
        component: OrderDetails
    },

];

const salesRoutes: Routes = [
    {
        path: 'sales',
        component: UniSales,
        canActivate: [AuthGuard],
        children: [{
            path: '',
            canActivateChild: [AuthGuard],
            children: childRoutes
        }],

    }
];

export const routes: ModuleWithProviders = RouterModule.forChild(salesRoutes);
