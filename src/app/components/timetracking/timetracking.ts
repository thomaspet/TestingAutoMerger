import {Component} from '@angular/core';

import {View} from '../../models/view/view';
import {view as workerView} from './worker/workers';
import {view as workerDetailView} from './worker/worker';

import {view as workTypeView} from './worktype/worktypes';
import {view as workTypeDetailView} from './worktype/worktype';

import {view as workProfileView} from './workprofile/workprofiles';
import {view as workProfileDetailView} from './workprofile/workprofile';

import {view as timeentryView} from './timeentry/timeentry';
import {view as InvoiceHoursView } from './invoice-hours/invoice-hours';

// Main view (meta)
export const view = new View('timetracking', 'Timer', 'UniTimetracking', false, '');

// Add subviews (meta)
view.addSubView(timeentryView);
view.addSubView(workerView);
view.addSubView(workerDetailView);
view.addSubView(workTypeView);
view.addSubView(workTypeDetailView);
view.addSubView(workProfileView);
view.addSubView(workProfileDetailView);
view.addSubView(InvoiceHoursView);

@Component({
    selector: 'uni-timetracking',
    template: `<router-outlet></router-outlet>`
})
export class UniTimetracking {
    constructor() {}
}

view.component = UniTimetracking;
