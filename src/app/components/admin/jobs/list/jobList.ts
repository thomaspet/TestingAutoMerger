import {Component, OnInit} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';

import {UniTableConfig, UniTableColumn} from '@uni-framework/ui/unitable/index';
import {TabService, UniModules} from '../../../layout/navbar/tabstrip/tabService';
import {ErrorService, JobService, PageStateService} from '@app/services/services';
import {IUniTab} from '@uni-framework/uni-tabs';

@Component({
    selector: 'recently-executed-jobs',
    templateUrl: './jobList.html'
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
    tabValues = ['lastjobs', 'alljobs', 'saft-t'];

    constructor(
        private tabService: TabService,
        private router: Router,
        private route: ActivatedRoute,
        private jobService: JobService,
        private errorService: ErrorService,
        private pagestateService: PageStateService
    ) {}

    public ngOnInit() {
        this.setupJobTable();
        this.route.queryParams.subscribe((params: any) => {

            if (params && params.tab) {
                const index = this.tabValues.findIndex(tab => params.tab === tab);
                this.activeTabIndex = index > 0 ? index : 0;
            } else {
                this.activeTabIndex = 0;
            }

            this.updateTab();
        });
    }

    public refresh() {
        this.getLatestJobRuns();
    }

    public updateTab() {
        this.pagestateService.setPageState('tab', this.tabValues[this.activeTabIndex]);
        this.tabService.addTab({
            url: this.pagestateService.getUrl(),
            name: 'Jobber',
            active: true,
            moduleID: UniModules.Jobs
        });
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
