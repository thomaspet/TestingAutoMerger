import {componentProxyFactory} from '../framework/core/component_proxy';

export var Routes = {
	dashboard: {
		path: '/',
    	as: 'Dashboard',
		component: componentProxyFactory({
			path: './app/components/hero/heroes.component',
			provide: m => m.HeroesComponent
		}),
	},
	heroes: {
		path: '/heroes',
		as: 'Heroes',
		component: componentProxyFactory({
			path: './app/components/dashboard/dashboard.component',
			provide: m => m.DashboardComponent
		}),
	},
	detail: {
		path: '/detail/:id',
		as: 'Detail',
		component: componentProxyFactory({
				path: './app/components/hero/hero-detail.component',
				provide: m => m.HeroDetailComponent
		}),
	},
	order: {
		path:'/orders',
		as: 'Orders',
		component: componentProxyFactory({
			path: './app/components/order/order.component',
			provide: m => m.OrderGrid
		})
	},
	orderDetail: {
		path:'/orders/:id',
		as: 'OrderDetail',
		component: componentProxyFactory({
			path: './app/components/order/orderDetail.component',
			provide: m => m.OrderDetail
		})
	},
	modelDrivenForms: {
		path:'/model-driven-forms',
		as: 'ModelDrivenForms',
		component: componentProxyFactory({
			path: './app/components/modelDrivenForms/modelDrivenForms.component',
			provide: m => m.ModelDrivenForms
		})
	},
	helloworld: {
		path:'/helloworld',
		as: 'HelloWorld',
		component:componentProxyFactory({
			path: './app/components/helloworld',
			provide: m => m.HelloWorld
		})
	}
};

export const APP_ROUTES = Object.keys(Routes).map(r => Routes[r]);
