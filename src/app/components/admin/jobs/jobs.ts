import {Component} from '@angular/core';

import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';

@Component({
    selector: 'uni-jobs',
    templateUrl: './jobs.html'
})
export class Jobs {
        constructor(
        private tabService: TabService
    ) {
        this.tabService.addTab({ name: 'Jobs', url: '/admin/jobs', moduleID: UniModules.Jobs, active: true });
    }
}
