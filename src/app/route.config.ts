import {ComponentProxy} from '../framework/core';
import {AsyncRoute} from 'angular2/router';

export var Routes = {
	
	login: new AsyncRoute({
		path: '/login',
		name: 'Login',
		loader: () => ComponentProxy.LoadComponentAsync('Login', './app/components/login/login')
	}),
	
    employeeList: new AsyncRoute({
        path: '/employees',
        name: 'EmployeeList',
        loader: () => ComponentProxy.LoadComponentAsync('EmployeeList', './app/components/employee/employeeList')
    }),
    
    employeeDetails: new AsyncRoute({
		path: '/employees/:id/...',
		name: 'EmployeeDetails',
		loader: () => ComponentProxy.LoadComponentAsync('EmployeeDetails', './app/components/employee/employeeDetails')
	}),
	
	dashboard: new AsyncRoute({
		path: '/',
    	name: 'Dashboard',
		loader: ()=> ComponentProxy.LoadComponentAsync('Dashboard','./app/components/dashboard/dashboard')
	}),
	
	uniFormDemo: new AsyncRoute({
		path:'/uniformdemo',
		name: 'UniFormDemo',
		loader:()=> ComponentProxy.LoadComponentAsync('UniFormDemo','./app/components/uniFormDemo/uniFormDemoComponent')
    }),

    companySettings: new AsyncRoute({
        path: '/settings/...',
        name: 'Settings',
        loader: () => ComponentProxy.LoadComponentAsync('Settings', './app/components/settings/settings')
    }),
	
	kitchensink: new AsyncRoute({
		path: '/kitchensink',
		name: 'Kitchensink',
		loader:()=> ComponentProxy.LoadComponentAsync('Kitchensink','./app/components/kitchensink/kitchensink')
	})
};

export const APP_ROUTES = Object.keys(Routes).map(r => Routes[r]);
