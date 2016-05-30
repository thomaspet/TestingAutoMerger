import {ComponentProxy} from '../framework/core';
import {AsyncRoute} from '@angular/router-deprecated';

export const ROUTES = [
    new AsyncRoute({
        useAsDefault: true,
        path: '/',
        name: 'Dashboard',
        loader: () => ComponentProxy.LoadComponentAsync('Dashboard', 'src/app/components/dashboard/dashboard')
    }),

    new AsyncRoute({
        path: '/login',
        name: 'Login',
        loader: () => ComponentProxy.LoadComponentAsync('Login', 'src/app/components/authentication/login')
    }),

    new AsyncRoute({
        path: '/signup',
        name: 'Signup',
        loader: () => ComponentProxy.LoadComponentAsync('Signup', 'src/app/components/authentication/signup')
    }),
    
    new AsyncRoute({
        path: '/reset-password',
        name: 'ResetPassword',
        loader: () => ComponentProxy.LoadComponentAsync('ResetPassword', 'src/app/components/authentication/resetPassword')
    }),

    new AsyncRoute({
        path: '/salary/...',
        name: 'UniSalary',
        loader: () => ComponentProxy.LoadComponentAsync('UniSalary', 'src/app/components/salary/salary')
    }),

    new AsyncRoute({
        path: '/sales/...',
        name: 'UniSales',
        loader: () => ComponentProxy.LoadComponentAsync('UniSales', 'src/app/components/sales/sales')
    }),

    new AsyncRoute({
        path: '/settings/...',
        name: 'Settings',
        loader: () => ComponentProxy.LoadComponentAsync('Settings', 'src/app/components/settings/settings')
    }),

    new AsyncRoute({
        path: '/accounting/...',
        name: 'UniAccounting',
        loader: () => ComponentProxy.LoadComponentAsync('UniAccounting', 'src/app/components/accounting/accounting')
    }),

    new AsyncRoute({
        path: '/products/...',
        name: 'Products',
        loader: () => ComponentProxy.LoadComponentAsync('Product', 'src/app/components/common/product/product')
    }),

    new AsyncRoute({
        path: '/confirm/...',
        name: 'Confirm',
        loader: () => ComponentProxy.LoadComponentAsync('Confirm', 'src/app/components/login/confirmInvite')
    }),

    new AsyncRoute({
        path: '/timetracking/...',
        name: 'Timetracking',
        loader: () => ComponentProxy.LoadComponentAsync('UniTimetracking', './app/components/timetracking/timetracking')
    }),

    new AsyncRoute({
        path: '/reports/...',
        name: 'UniReports',
        loader: () => ComponentProxy.LoadComponentAsync('UniReports', 'src/app/components/reports/reports')
    }),

    /// ROUTES FOR TESTING POURPOSES

    new AsyncRoute({
        path: '/usertest',
        name: 'Usertest',
        loader: () => ComponentProxy.LoadComponentAsync('Usertest', 'src/app/components/usertest/usertest')
    }),

    new AsyncRoute({
        path: '/examples/...',
        name: 'Examples',
        loader: () => ComponentProxy.LoadComponentAsync('Examples', 'src/app/components/examples/examples')
    })
];

