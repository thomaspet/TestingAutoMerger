import {HeroesComponent} from './components/hero/heroes.component';
import {HeroDetailComponent} from './components/hero/hero-detail.component';
import {DashboardComponent} from './components/dashboard/dashboard.component';
import {ModelDrivenForms} from './components/modelDrivenForms/modelDrivenForms.component';

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
	modelDrivenForms: {
		path:'/model-driven-forms',
		as: 'ModelDrivenForms',
		component: ModelDrivenForms
	}
};

export const APP_ROUTES = Object.keys(Routes).map(r => Routes[r]);
