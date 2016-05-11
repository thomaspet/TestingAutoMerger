import {Component} from "@angular/core";
import {RouteConfig, ROUTER_DIRECTIVES} from "@angular/router-deprecated";
import {ComponentProxy} from "../../../framework/core/componentProxy";
import {AsyncRoute} from "@angular/router-deprecated";
import {UniRouterOutlet} from "../../uniRouterOutlet";


@Component({
    //selector: 'uni-sales',
    template: '<h3>Timetracking</h3>',
    //directives: [ROUTER_DIRECTIVES, UniRouterOutlet]
})
//@RouteConfig(TIMETRACKING_ROUTES)
export class UniTimetracking {}