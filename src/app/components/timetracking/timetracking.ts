import {Component} from "@angular/core";
import {RouteConfig, ROUTER_DIRECTIVES} from "@angular/router-deprecated";
import {ComponentProxy} from "../../../framework/core/componentProxy";
import {AsyncRoute} from "@angular/router-deprecated";
import {UniRouterOutlet} from "../../uniRouterOutlet";

const moduleInfo = {
    name: 'timetracking',
    label: 'Timer'
};

export var views = {
    baseFolder: './app/components/timetracking',
    timeEntry: {
        className: 'TimeEntry', label: 'Timeføring', name: 'timeentry', path: '/timeentry/timeentry'
    }
};

var subroutes = [
    new AsyncRoute({
        useAsDefault: true,
        path: '/' + views.timeEntry.name,
        name: views.timeEntry.className,
        loader: () => ComponentProxy.LoadComponentAsync(views.timeEntry.className, views.baseFolder + views.timeEntry.path )
    }),
];

@Component({
    selector: 'uni-' + moduleInfo.name,
    template: `<h3>{{moduleInfo.label}}</h3>
        <uni-router-outlet></uni-router-outlet>`,
    directives: [ROUTER_DIRECTIVES, UniRouterOutlet]
})
@RouteConfig(subroutes)
export class UniTimetracking {
    public moduleInfo = moduleInfo;
    constructor() {        
        console.log("UniTimetracking view constructor");
    }
}