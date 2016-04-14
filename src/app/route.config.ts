import {ComponentProxy} from '../framework/core';
import {AsyncRoute} from 'angular2/router';

export const ROUTES = [
    new AsyncRoute({
        useAsDefault: true,
        path: '/',
        name: 'Dashboard',
        loader: () => ComponentProxy.LoadComponentAsync('Dashboard', './app/components/dashboard/dashboard')
    }),

    new AsyncRoute({
        path: '/login',
        name: 'Login',
        loader: () => ComponentProxy.LoadComponentAsync('Login', './app/components/login/login')
    }),

    new AsyncRoute({
        path: '/signup',
        name: 'Signup',
        loader: () => ComponentProxy.LoadComponentAsync('Signup', './app/components/login/signup')
    }),

    new AsyncRoute({
        path: '/salary/...',
        name: 'UniSalary',
        loader: () => ComponentProxy.LoadComponentAsync('UniSalary', './app/components/salary/salary')
    }),

    new AsyncRoute({
        path: '/sales/...',
        name: 'UniSales',
        loader: () => ComponentProxy.LoadComponentAsync('UniSales', './app/components/sales/sales')
    }),

    new AsyncRoute({
        path: '/settings/...',
        name: 'Settings',
        loader: () => ComponentProxy.LoadComponentAsync('Settings', './app/components/settings/settings')
    }),

    new AsyncRoute({
        path: '/accounting/...',
        name: 'UniAccounting',
        loader: () => ComponentProxy.LoadComponentAsync('UniAccounting', './app/components/accounting/accounting')
    }),

    new AsyncRoute({
        path: '/products/...',
        name: 'Products',
        loader: () => ComponentProxy.LoadComponentAsync('Product', './app/components/common/product/product')
    }),
    
    /// ROUTES FOR TESTING POURPOSES

    new AsyncRoute({
        path: '/usertest',
        name: 'Usertest',
        loader: () => ComponentProxy.LoadComponentAsync('Usertest', './app/components/usertest/usertest')
    }),

    new AsyncRoute({
        path: '/examples/...',
        name: 'Examples',
        loader: () => ComponentProxy.LoadComponentAsync('Examples', './app/components/examples/examples')
    })
];

