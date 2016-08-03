import {Component} from '@angular/core';
import {ROUTER_DIRECTIVES} from '@angular/router';

import {View} from '../../models/view/view';
import {view as workerView} from './worker/workers';
import {view as workerDetailView} from './worker/worker';

import {view as workTypeView} from './worktype/worktypes';
import {view as workTypeDetailView} from './worktype/worktype';

import {view as workProfileView} from './workprofile/workprofiles';
import {view as workProfileDetailView} from './workprofile/workprofile';

import {view as regTimeView} from './regtime/regtime';
import {view as timeentryView} from './timeentry/timeentry';

import {view as projectView} from './project/projects';
import {view as projectDetailView} from './project/project';

// Main view (meta)
export var view = new View('timetracking', 'Timer', 'UniTimetracking', false, '', UniTimetracking);

// Add subviews (meta)
view.addSubView(timeentryView);
view.addSubView(regTimeView);

view.addSubView(workerView);
view.addSubView(workerDetailView);
view.addSubView(workTypeView);
view.addSubView(workTypeDetailView);
view.addSubView(workProfileView);
view.addSubView(workProfileDetailView);
view.addSubView(projectView);
view.addSubView(projectDetailView);

@Component({
    selector: 'uni-' + view.name,
    template: `<router-outlet></router-outlet>`,
    directives: [ROUTER_DIRECTIVES]
})
export class UniTimetracking {
    constructor() {}
}
