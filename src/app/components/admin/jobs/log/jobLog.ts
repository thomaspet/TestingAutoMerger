import {Component} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
// app
import {IToolbarConfig} from '../../../common/toolbar/toolbar';
import {TabService, UniModules} from '../../../layout/navbar/tabstrip/tabService';
import {ErrorService, JobService} from '../../../../services/services';
import { BehaviorSubject } from 'rxjs';

@Component({
    selector: 'job-log',
    templateUrl: './jobLog.html'
})
export class JobLog {
    public toolbarconfig: IToolbarConfig;
    public jobName: string = '';
    public jobRun: any;
    public busy: boolean = false;

    public log: any = [];
    public progress: any = [];
    public errorMessage$: BehaviorSubject<string> = new BehaviorSubject('');

    constructor(
        private tabService: TabService,
        private route: ActivatedRoute,
        private errorService: ErrorService,
        private jobService: JobService
    ) {
        // set default tab title, this is done to set the correct current module to make the breadcrumb correct
        this.tabService.addTab({ url: '/admin/jobs', name: 'Jobber', active: true, moduleID: UniModules.Jobs });
    }

    public ngOnInit() {
        this.initLog();
    }

    private updateToolBar() {
        this.toolbarconfig = {
            title: this.jobName
        };
    }

    public refresh() {
        this.initLog();
    }

    private initLog() {
        this.busy = true;
        this.route.queryParamMap.subscribe(params => {
            this.jobName = params.get('jobName');
            const jobID = params.get('jobID');

            this.jobService.getJobRun(this.jobName, +jobID)
                .finally(() => this.busy = false )
                .subscribe(
                    jobRun => {
                        this.jobRun = jobRun;
                        this.log = jobRun ? jobRun.JobRunLogs : [];
                        this.progress = jobRun ? jobRun.Progress : [];

                        this.updateToolBar();
                    },
                    err => this.errorMessage$.next(err)
                );

        });

        // this.route.params.subscribe((params) => {
        //     this.jobName = params['jobName'];
        //     let hangfireJobId: string = params['jobRunId'];

        //     this.jobService.getJobRun(this.jobName, +hangfireJobId)
        //     .finally( () => this.busy = false )
        //     .subscribe(
        //         jobRun => {
        //             this.jobRun = jobRun;
        //             this.log = jobRun ? jobRun.JobRunLogs : [];
        //             this.progress = jobRun ? jobRun.Progress : [];


        //             this.updateTabTitle();
        //             this.updateToolBar();
        //         },
        //         err => this.errorService.handle(err)
        //     );
        // });
    }

}
