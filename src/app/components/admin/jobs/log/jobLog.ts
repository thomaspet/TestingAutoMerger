import {Component,} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
// app
import {IToolbarConfig} from '../../../common/toolbar/toolbar';
import {TabService, UniModules} from '../../../layout/navbar/tabstrip/tabService';
import {ErrorService, JobService} from '../../../../services/services';
import {JobRun} from '../../../../models/admin/jobs/jobRun';
import {JobRunLog} from '../../../../models/admin/jobs/jobRunLog';
import {JobProgress} from '../../../../models/admin/jobs/jobProgress';


@Component({
    selector: 'job-log',
    templateUrl: './JobLog.html'
})
export class JobLog {
    private toolbarconfig: IToolbarConfig;
    private jobName: string = '';
    private date: string = '';
    private time: string = '';

    private log: any = [];
    private progress: any = [];

    constructor(
            private tabService: TabService,
            private route: ActivatedRoute,
            private errorService: ErrorService,
            private jobService: JobService
    ) {
         // set default tab title, this is done to set the correct current module to make the breadcrumb correct
        this.tabService.addTab({ url: '/admin/jobs/', name: 'Jobber', active: true, moduleID: UniModules.Jobs });
    }

    public ngOnInit() {
        this.initLog();
    }

    private updateTabTitle() {
        this.tabService.addTab(
            {
                url: '/admin/job-log/' + this.jobName, 
                name: "Jobb log '" + this.jobName + "'", 
                active: true, 
                moduleID: UniModules.Jobs,
            });
    }

    private updateToolBar() {
        this.toolbarconfig = {
            title: this.jobName,
            omitFinalCrumb: false
        };
    }

    private initLog() {
        this.route.params.subscribe((params) => {
            this.jobName = params['jobName'];
            let hangfireJobId: string = params['jobRunId'];

            this.jobService.getJobRun(this.jobName, hangfireJobId).subscribe(
                jobRun => {
                    this.formatDates(jobRun);

                    this.log = jobRun.JobRunLogs;
                    this.progress = jobRun.Progress;


                    this.updateTabTitle();
                    this.updateToolBar();
                },
                err => this.errorService.handle(err)
            );
        });
    }

    private formatDates(jobRun: JobRun) {
        let localDate: Date = new Date(jobRun.Created);
        
        this.date = ('0' + localDate.getDate()).slice(-2) 
                    + '.' + ('0' + (localDate.getMonth() + 1)).slice(-2)
                    + '.' + localDate.getFullYear().toString();
                    
        this.time = ('0' + localDate.getHours()).slice(-2) + ':' + ('0' + localDate.getMinutes()).slice(-2);
        this.formatTimes(jobRun.JobRunLogs);
        this.formatTimes(jobRun.Progress);
    }

    private formatTimes(list: any) {
        let time: Date;

        for (let i = 0; i < list.length; ++i) {
            time = new Date(list[i].Created);
            list[i].Created = '[' 
                + ('0' + time.getHours()).slice(-2) 
                + ':' +  ('0' + time.getMinutes()).slice(-2) 
                + ':' +  ('0' + time.getSeconds()).slice(-2) + ']';
        }
      
    }
}
