import {Component} from "angular2/core";
import {RouteConfig, ROUTER_DIRECTIVES} from "angular2/router";
import {ComponentProxy} from "../../../framework/core/componentProxy";
import {AsyncRoute} from "angular2/router";
import {UniRouterOutlet} from "../../uniRouterOutlet";

const REPORTS_ROUTES = [
        new AsyncRoute({
        useAsDefault: true,
        path: "/overview",
        name: "Overview",
        loader: () => ComponentProxy.LoadComponentAsync("Overview", "./app/components/reports/overview/overview")
        })
];

@Component({
    selector: 'uni-reports',
    template: '<uni-router-outlet></uni-router-outlet>',
    directives: [ROUTER_DIRECTIVES, UniRouterOutlet]
})
@RouteConfig(REPORTS_ROUTES)
export class UniReports {}