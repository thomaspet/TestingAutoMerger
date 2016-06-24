﻿import {Component} from '@angular/core';
import {RouteConfig, RouteDefinition, ROUTER_DIRECTIVES, Router, AsyncRoute} from '@angular/router-deprecated';

import {TabService} from '../layout/navbar/tabstrip/tabService';

import {UniTabs} from '../layout/uniTabs/uniTabs';

import {CompanySettings} from './companySettings/companySettings';
import {AccountSettings} from './accountSettings/accountSettings';
import {UserSettings} from './userSettings/userSettings';
import {ComponentProxy} from '../../../framework/core/componentProxy';


import {Users} from './users/users';

import {VatSettings} from './vatsettings/vatsettings';

const CHILD_ROUTES = [

    new AsyncRoute({
        useAsDefault: true,
        path: '/company',
        name: 'Firmainnstillinger',
        loader: () => ComponentProxy.LoadComponentAsync('CompanySettings','app/components/settings/companySettings/companySettings')
    }),
    new AsyncRoute({
        path: '/agaandsubentities',
        name: 'AGA og virksomheter',
        loader: () => ComponentProxy.LoadComponentAsync('AgaAndSubEntitySettings','app/components/settings/agaAndSubEntitySettings/agaAndSubEntitySettings')
    }),
    new AsyncRoute({
        path: '/user',
        name: 'Brukerinnstillinger',
        loader: () => ComponentProxy.LoadComponentAsync('UserSettings','app/components/settings/userSettings/userSettings')
    }),
    new AsyncRoute({
        path: '/users',
        name: 'Brukere og roller',
        loader: () => ComponentProxy.LoadComponentAsync('Users','app/components/settings/users/users')
    }),    
    new AsyncRoute({
        path: '/altinn',
        name: 'Altinn',
        loader: () => ComponentProxy.LoadComponentAsync('AltinnSettings','app/components/settings/altinnSettings/altinnSettings')
    }),
];

@Component({
    selector: 'settings',
    templateUrl: 'app/components/settings/settings.html',
    directives: [ROUTER_DIRECTIVES, UniTabs]
})
@RouteConfig(CHILD_ROUTES)
export class Settings {
    
    private childRoutes: RouteDefinition[];

    constructor(public router: Router, private tabService: TabService) {
        this.tabService.addTab({ name: 'Settings', url: '/settings/company' });
        this.childRoutes = CHILD_ROUTES; // we dont want the redirect route in our navigation
    }
}