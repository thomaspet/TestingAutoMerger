import {Component} from "angular2/core";
import {RouteConfig, RouteDefinition, ROUTER_DIRECTIVES, Router, AsyncRoute} from "angular2/router";

import {TabService} from "../layout/navbar/tabstrip/tabService";

import {UniTabs} from '../layout/uniTabs/uniTabs';

import {CompanySettings} from './companySettings/companySettings';
import {AccountSettings} from './accountSettings/accountSettings';
import {UserSettings} from './userSettings/userSettings';
import {ComponentProxy} from "../../../framework/core/componentProxy";


import {Users} from './users/users';

import {VatSettings} from './vatSettings/vatSettings';

const CHILD_ROUTES = [

    new AsyncRoute({
        useAsDefault: true,
        path: "/company",
        name: "Firmainnstillinger",
        loader: () => ComponentProxy.LoadComponentAsync("CompanySettings", "./app/components/settings/companySettings/companySettings")
    }),
    new AsyncRoute({
        path: "/accounts",
        name: "Kontoer",
        loader: () => ComponentProxy.LoadComponentAsync("AccountSettings", "./app/components/settings/accountSettings/accountSettings")
    }),
    new AsyncRoute({
        path: "/vat",
        name: "VAT",
        loader: () => ComponentProxy.LoadComponentAsync("VatSettings", "./app/components/settings/vatSettings/vatSettings")
    }),
    new AsyncRoute({
        path: "/user",
        name: "Brukerinnstillinger",
        loader: () => ComponentProxy.LoadComponentAsync("UserSettings", "./app/components/settings/userSettings/userSettings")
    }),

    new AsyncRoute({
        path: "/users",
        name: "Brukere og roller",
        loader: () => ComponentProxy.LoadComponentAsync("Users", "./app/components/settings/users/users")
    })
];

@Component({
    selector: "settings",
    templateUrl: "app/components/settings/settings.html",
    directives: [ROUTER_DIRECTIVES, UniTabs]
})
@RouteConfig(CHILD_ROUTES)
export class Settings {
    
    childRoutes: RouteDefinition[];

    constructor(public router: Router, private tabService: TabService) {
        this.tabService.addTab({ name: "Settings", url: "/settings/company" });
        this.childRoutes = CHILD_ROUTES; // we dont want the redirect route in our navigation
    }
}