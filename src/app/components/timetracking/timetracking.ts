import {Component} from "@angular/core";
import {RouteConfig, ROUTER_DIRECTIVES} from "@angular/router-deprecated";
import {UniRouterOutlet} from "../../uniRouterOutlet";
import {View} from "../../models/view/view";
import {view as timeEntryView} from './timeentry/timeentry';
import {view as workerView} from './worker/worker';

// Main view (meta)
export var view = new View("timetracking", "Timer", "UniTimetracking");

// Add subviews (meta)
view.addSubView(timeEntryView);
view.addSubView(workerView);

@Component({
    selector: 'uni-' + view.name,
    template: `<uni-router-outlet></uni-router-outlet>`,
    directives: [ROUTER_DIRECTIVES, UniRouterOutlet]
})
@RouteConfig(view.getSubRoutes())
export class UniTimetracking {
    public view = view;
    constructor() {}
}