import {Component} from "@angular/core";
import {RouteConfig, ROUTER_DIRECTIVES} from "@angular/router-deprecated";
import {UniRouterOutlet} from "../../uniRouterOutlet";

import {View} from "../../models/view/view";
import {view as workerView} from './worker/worker';
import {view as workTypeView} from './worktype/worktypes';
import {view as workTypeDetailView} from './worktype/detail/worktype';
import {view as workProfileView} from './workprofile/workprofile';
import {view as regTimeView} from './regtime/regtime';
import {view as timeentryView} from './timeentry/timeentry';

// Main view (meta)
export var view = new View("timetracking", "Timer", "UniTimetracking");

// Add subviews (meta)
view.addSubView(timeentryView);
view.addSubView(regTimeView);
view.addSubView(workerView);
view.addSubView(workTypeView);
view.addSubView(workTypeDetailView);
view.addSubView(workProfileView);

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