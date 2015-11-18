import {componentProxyFactory} from '../framework/core';
import {Route} from 'angular2/router';

export var Routes = {
	dashboard: new Route({
		path: '/',
    	name: 'Dashboard',
		component: componentProxyFactory({
			path: './app/components/hero/heroes.component',
			provide: m => m.HeroesComponent
		}),
	}),
	heroes: new Route({
		path: '/heroes',
        name: 'Heroes',
		component: componentProxyFactory({
			path: './app/components/dashboard/dashboard.component',
			provide: m => m.DashboardComponent
		}),
	}),
	detail: new Route({
		path: '/detail/:id',
        name: 'Detail',
		component: componentProxyFactory({
				path: './app/components/hero/hero-detail.component',
				provide: m => m.HeroDetailComponent
		}),
	}),
	order: new Route({
		path:'/orders',
        name: 'Orders',
		component: componentProxyFactory({
			path: './app/components/order/order.component',
			provide: m => m.OrderGrid
		})
	}),
	orderDetail: new Route({
		path:'/orders/:id',
        name: 'OrderDetail',
		component: componentProxyFactory({
			path: './app/components/order/orderDetail.component',
			provide: m => m.OrderDetail
		})
	}),
	modelDrivenForms: new Route({
		path:'/model-driven-forms',
        name: 'ModelDrivenForms',
		component: componentProxyFactory({
			path: './app/components/modelDrivenForms/modelDrivenForms.component',
			provide: m => m.ModelDrivenForms
		})
	}),
	kitchensink: new Route({
		path: '/kitchensink',
		name: 'Kitchensink',
		component: componentProxyFactory({
			path: './app/components/kitchensink/kitchensink',
			provide: m => m.Kitchensink
		})
	})
};

export const APP_ROUTES = Object.keys(Routes).map(r => Routes[r]);
