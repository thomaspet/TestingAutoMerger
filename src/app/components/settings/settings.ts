import {Component, OnInit} from 'angular2/core';
import {RouteConfig, RouteDefinition, ROUTER_DIRECTIVES, RouterLink, Router} from 'angular2/router';

import {TabService} from '../layout/navbar/tabstrip/tabService';

import {UniTabs} from '../layout/uniTabs/uniTabs';
import {CompanySettings} from './companySettings/companySettings';
import {AccountSettings} from './accountSettings/accountSettings';
import {UserSettings} from './userSettings/userSettings';
import {Users} from './users/users';



const CHILD_ROUTES = [
    { path: '/', redirectTo: ['CompanySettings']},
    { path: '/company', component: CompanySettings, as: 'CompanySettings' },
    { path: '/accounts', component: AccountSettings, as: 'AccountSettings' },
    { path: '/user', component: UserSettings, as: 'UserSettings' },
    { path: '/users', component: Users, as: 'Brukere' }
];

@Component({
    selector: 'settings',
    templateUrl: 'app/components/settings/settings.html',
    directives: [ROUTER_DIRECTIVES, UniTabs]
})
@RouteConfig(CHILD_ROUTES)
export class Settings {
    
    childRoutes: RouteDefinition[];

    constructor(public router: Router, private tabService: TabService) {
        this.tabService.addTab({ name: 'Settings', url: '/settings/company' });
        this.childRoutes = CHILD_ROUTES.slice(1); // we dont want the redirect route in our navigation
    }
}