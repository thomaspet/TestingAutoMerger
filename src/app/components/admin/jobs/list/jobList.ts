import {Component, OnInit} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';

import {UniTableConfig, UniTableColumn} from '@uni-framework/ui/unitable/index';
import {TabService, UniModules} from '../../../layout/navbar/tabstrip/tabService';
import {ErrorService, JobService} from '@app/services/services';
import {IUniTab} from '@uni-framework/uni-tabs';

@Component({
    selector: 'recently-executed-jobs',
    templateUrl: './JobList.html'
})
export class JobList implements OnInit {
    tabs: IUniTab[] = [
        {name: 'Siste utførte'},
        {name: 'Alle jobber'},
        {name: 'SAF-T'},
    ];

    activeTabIndex: number = 0;
    jobRuns: any[];
    jobRunsConfig: UniTableConfig;
    jobs: any[];

    constructor(
        private tabService: TabService,
        private router: Router,
        private route: ActivatedRoute,
        private jobService: JobService,
        private errorService: ErrorService,
    ) {}

    public ngOnInit() {
        this.tabService.addTab({
            url: '/admin/jobs',
            name: 'Jobber',
            active: true,
            moduleID: UniModules.Jobs
        });

        this.setupJobTable();
        this.route.queryParams.subscribe((params: any) => {
            const activeTab = params.tab || '';
            switch (activeTab) {
                case 'lastjobs': this.activeTabIndex = 0; break;
                case 'alljobs': this.activeTabIndex = 1; break;
                case 'saft-t': this.activeTabIndex = 2; break;
                case 'batchinvoices': this.activeTabIndex = 3; break;
            }
        });
    }

    public refresh() {
        this.getLatestJobRuns();
    }

    private getLatestJobRuns() {
        this.jobService.getLatestJobRuns(20).subscribe(
            result => this.jobRuns = result,
            err => this.errorService.handle(err)
        );
    }

    private setupJobTable() {
        this.setupJobRunsConfig();
        this.getLatestJobRuns();

        this.jobService.getJobs().subscribe(
            result => this.prepareJobList(result),
            err => this.errorService.handle(err)
        );
    }

    private setupJobRunsConfig() {
        const tableConfig = new UniTableConfig('admin.jobs.jobruns', false, true, 20);
        tableConfig.columns = [
            new UniTableColumn('ID', 'Nr.').setWidth('4rem'),
            new UniTableColumn('HangfireJobId', 'Jobb nr.').setWidth('5rem'),
            new UniTableColumn('JobName', 'Navn'),
            new UniTableColumn('Created', 'Startet')
                .setWidth('8rem')
                .setTemplate(row => row.Created && moment(row.Created).format('DD.MM.YY - HH:mm')),
            new UniTableColumn('LastStatus', 'Fremdrift')
                .setWidth('6rem')
                .setTemplate(row => {
                    if (row.Progress && row.Progress.length) {
                        return moment(row.Progress[0].Created).format('HH:mm');
                    }
                }),
            new UniTableColumn('Status', 'Status')
                .setWidth('20rem')
                .setTemplate(row => {
                    if (row.Progress && row.Progress.length) {
                        return row.Progress[0].Progress;
                    }
                })
        ];

        this.jobRunsConfig = tableConfig;
    }

    private prepareJobList(jobNames: string[]) {
        this.jobs = jobNames.map(name => {
            return {name: name};
        });
    }

    public onJobRunSelected(job) {
        this.router.navigateByUrl(`/admin/job-logs?jobName=${job.JobName}&jobID=${job.HangfireJobId}`);
    }
}
