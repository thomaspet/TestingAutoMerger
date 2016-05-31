import {Component} from "@angular/core";
import {RouteConfig, RouteDefinition, ROUTER_DIRECTIVES, Router, AsyncRoute} from "@angular/router-deprecated";

import {TabService} from "../../layout/navbar/tabstrip/tabService";
import {UniTabs} from '../../layout/uniTabs/uniTabs';

import {ComponentProxy} from "../../../../framework/core/componentProxy";

const QUOTE_ROUTES = [
    new AsyncRoute({
        useAsDefault: true,
        path: "/list",
        name: "QuoteList",
        loader: () => ComponentProxy.LoadComponentAsync("QuoteList", "src/app/components/sales/quote/list/quoteList")
    }),    
    new AsyncRoute({
        path: "/details/:id",
        name: "QuoteDetails",
        loader: () => ComponentProxy.LoadComponentAsync("QuoteDetails", "src/app/components/sales/quote/details/quoteDetails")
    })    
];

@Component({
    selector: "uni-quote",
    templateUrl: "app/components/sales/quote/quote.html",
    directives: [ROUTER_DIRECTIVES, UniTabs]
})
@RouteConfig(QUOTE_ROUTES)
export class Quote {

    childRoutes: RouteDefinition[];

    constructor(public router: Router, private tabService: TabService) {
        this.tabService.addTab({name: "Tilbud", url: "/sales/quote"});
        this.childRoutes = QUOTE_ROUTES.slice(0, QUOTE_ROUTES.length - 1);
    }
}
