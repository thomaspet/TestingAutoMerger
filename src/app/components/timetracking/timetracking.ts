import {Component} from "@angular/core";
import {RouteConfig, ROUTER_DIRECTIVES} from "@angular/router-deprecated";
import {UniRouterOutlet} from "../../uniRouterOutlet";
import {View} from "../../models/view/view";

export var rootView = new View("timetracking", "Timer", "UniTimetracking");
rootView.addSubView(new View('timeentry', 'Timeføring', 'TimeEntry'));

@Component({
    selector: 'uni-' + rootView.name,
    template: `<h3>{{view.label}}</h3>
        <uni-router-outlet></uni-router-outlet>`,
    directives: [ROUTER_DIRECTIVES, UniRouterOutlet]
})
@RouteConfig(rootView.getSubRoutes())
export class UniTimetracking {
    public view = rootView;
    constructor() {        
        //console.log("UniTimetracking view constructor");
    }
}