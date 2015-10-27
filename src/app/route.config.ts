import {HeroesComponent} from './components/hero/heroes.component';
import {HeroDetailComponent} from './components/hero/hero-detail.component';
import {DashboardComponent} from './components/dashboard/dashboard.component';
import {ModelDrivenForms} from './components/modelDrivenForms/modelDrivenForms.component';
import {OrderGrid} from './components/order/order.component';
import {OrderDetail} from './components/order/orderDetail.component';

export var Routes = {
	dashboard: {
		path: '/',
    	as: 'Dashboard',
		component: DashboardComponent
	},
	heroes: {
		path: '/heroes',
		as: 'Heroes',
		component: HeroesComponent
	},
	detail: {
		path: '/detail/:id',
		as: 'Detail',
		component: HeroDetailComponent
	},
	order: {
		path:'/orders',
		as: 'Orders',
		component: OrderGrid
	},
	orderDetail: {
		path:'/orders/:id',
		as: 'OrderDetail',
		component: OrderDetail
	},
	modelDrivenForms: {
		path:'/model-driven-forms',
		as: 'ModelDrivenForms',
		component: ModelDrivenForms
	}
};

export const APP_ROUTES = Object.keys(Routes).map(r => Routes[r]);
