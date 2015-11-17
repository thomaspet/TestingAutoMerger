import {ComponentProxy} from '../framework/core';
import {AsyncRoute} from 'angular2/router';

export var Routes = {
	dashboard: new AsyncRoute({
		path: '/',
    	name: 'Dashboard',
		loader: ()=> ComponentProxy.LoadComponentAsync('DashboardComponent','./app/components/dashboard/dashboard.component')
	}),
	heroes: new AsyncRoute({
		path: '/heroes',
        name: 'Heroes',
		loader: ()=> ComponentProxy.LoadComponentAsync('HeroesComponent','./app/components/hero/heroes.component')
	}),
	detail: new AsyncRoute({
		path: '/detail/:id',
        name: 'Detail',
		loader: ()=> ComponentProxy.LoadComponentAsync('HeroDetailComponent','./app/components/hero/hero-detail.component')
	}),
	order: new AsyncRoute({
		path:'/orders',
        name: 'Orders',
		loader: ()=> ComponentProxy.LoadComponentAsync('OrderGrid','./app/components/order/order.component')
	}),
	orderDetail: new AsyncRoute({
		path:'/orders/:id',
        name: 'OrderDetail',
		loader: ()=> ComponentProxy.LoadComponentAsync('OrderDetail','./app/components/order/orderDetail.component')
	}),
	modelDrivenForms: new AsyncRoute({
		path:'/model-driven-forms',
        name: 'ModelDrivenForms',
		loader: ()=> ComponentProxy.LoadComponentAsync('ModelDrivenForms','./app/components/modelDrivenForms/modelDrivenForms.component')
	}),
	helloworld: new AsyncRoute({
		path:'/helloworld',
        name: 'HelloWorld',
		loader:()=> ComponentProxy.LoadComponentAsync('HelloWorld','./app/components/helloworld')
	})
};

export const APP_ROUTES = Object.keys(Routes).map(r => Routes[r]);
