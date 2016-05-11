import {Component} from "@angular/core";
import {RouteConfig, ROUTER_DIRECTIVES} from "@angular/router-deprecated";
import {ComponentProxy} from "../../../framework/core/componentProxy";
import {AsyncRoute} from "@angular/router-deprecated";
import {UniRouterOutlet} from "../../uniRouterOutlet";

const $BASE_FOLDER = "./app/components/timetracking/";

const TIMETRACKING_ROUTES = [
    new AsyncRoute({
        useAsDefault: true,
        path: '/timeentry',
        name: 'TimeEntry',
        loader: () => ComponentProxy.LoadComponentAsync('TimeEntry', $BASE_FOLDER + 'timeentry/timeentry')
    }),
];

@Component({
    selector: 'uni-timetracking',
    template: `<h3>Timetracking</h3>
        <uni-router-outlet></uni-router-outlet>`,
    directives: [ROUTER_DIRECTIVES, UniRouterOutlet]
})
@RouteConfig(TIMETRACKING_ROUTES)
export class UniTimetracking {
    constructor() {
        console.log("UniTimetracking view constructor");
    }
}