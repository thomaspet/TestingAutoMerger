import {Component} from "@angular/core";
import {RouteConfig, ROUTER_DIRECTIVES} from "@angular/router-deprecated";
import {ComponentProxy} from "../../../framework/core/componentProxy";
import {AsyncRoute} from "@angular/router-deprecated";
import {UniRouterOutlet} from "../../uniRouterOutlet";

const REPORTS_ROUTES = [
        new AsyncRoute({
        useAsDefault: true,
        path: "/overview",
        name: "Overview",
        loader: () => ComponentProxy.LoadComponentAsync("Overview", "src/app/components/reports/overview/overview")
        })
];

@Component({
    selector: 'uni-reports',
    template: '<uni-router-outlet></uni-router-outlet>',
    directives: [ROUTER_DIRECTIVES, UniRouterOutlet]
})
@RouteConfig(REPORTS_ROUTES)
export class UniReports {}