import {Component, ViewChild, OnInit} from '@angular/core';
import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';
import { Router } from '@angular/router';
import { UniTickerWrapper } from '@app/components/uniticker/tickerWrapper/tickerWrapper';

@Component({
    selector: 'workers',
    templateUrl: './workers.html'
})
export class WorkerListview implements OnInit {

    @ViewChild(UniTickerWrapper) private tickerWrapper: UniTickerWrapper;

    public tickercode: string = 'worker_main_list';

    public toolbarActions = [{
        label: 'TIMETRACKING.PERSON_NEW',
        action: this.newWorker.bind(this),
        main: true,
        disabled: false
    }];

    constructor(private router: Router, private tabService: TabService) {}

    public ngOnInit(): void {
        this.tabService.addTab({
            url: '/timetracking/workers',
            name: 'NAVBAR.PERSONS',
            active: true,
            moduleID: UniModules.Workers
        });
    }

    private newWorker() {
        this.router.navigateByUrl('/timetracking/workers/' + 0);
    }
}
