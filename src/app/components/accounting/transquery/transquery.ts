import {Component} from "angular2/core";
import {RouteConfig, RouteDefinition, ROUTER_DIRECTIVES, Router, AsyncRoute} from "angular2/router";

import {TabService} from "../../layout/navbar/tabstrip/tabService";
import {UniTabs} from '../../layout/uniTabs/uniTabs';

import {ComponentProxy} from "../../../../framework/core/componentProxy";

const TRANSQUERY_ROUTES = [
    new AsyncRoute({
        useAsDefault: true,
        path: "/list",
        name: "TransqueryList",
        loader: () => ComponentProxy.LoadComponentAsync("TransqueryList", "./app/components/accounting/transquery/list/transqueryList")
    })    
];

@Component({
    selector: "uni-transquery",
    templateUrl: "app/components/accounting/transquery/transquery.html",
    directives: [ROUTER_DIRECTIVES, UniTabs]
})
@RouteConfig(TRANSQUERY_ROUTES)
export class Transquery {

    childRoutes: RouteDefinition[];

    constructor(public router: Router, private tabService: TabService) {
        this.tabService.addTab({name: "Forespørsel", url: "/accounting/transquery"});
        this.childRoutes = TRANSQUERY_ROUTES.slice(0, TRANSQUERY_ROUTES.length - 1);
    }
}
