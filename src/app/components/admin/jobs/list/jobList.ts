import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import * as moment from 'moment';

import {UniTableConfig, UniTableColumn} from '@uni-framework/ui/unitable/index';
import {TabService, UniModules} from '../../../layout/navbar/tabstrip/tabService';
import {ErrorService, JobService} from '@app/services/services';
import {IUniTab} from '@app/components/layout/uniTabs/uniTabs';

@Component({
    selector: 'recently-executed-jobs',
    templateUrl: './JobList.html'
})
export class JobList implements OnInit {
    public activeTabIndex: number = 0;
    public tabs: IUniTab[] = [
        {name: 'Siste utførte'},
        {name: 'Alle jobber'},
        {name: 'SAF-T'},
    ];

    public filterTabs: any[] = [
        { label: 'Siste utførte', name: 'jobruns', id: 1 },
        { label: 'Alle jobber', name: 'jobs', id: 2 },
        { label: 'SAF-T', name: 'saft', id: 3 }
    ];

    private activeTab: { id: number, name: string, label: string } = this.filterTabs[0];

    private jobRuns: any[];
    public jobRunsConfig: UniTableConfig;
    private jobs: any[];

    constructor(
        private tabService: TabService,
        private router: Router,
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
    }

    public refresh() {
        this.getLatestJobRuns();
    }

    private getLatestJobRuns() {
        this.jobService.getLatestJobRuns(20).subscribe(
            result => {
                this.jobRuns = result;
            },
            err => this.errorService.handle(err)
        );
    }

    private setupJobTable() {
        this.setupJobRunsConfig();
        this.getLatestJobRuns();

        this.jobService.getJobs().subscribe(
            result => {
                this.prepareJobList(result);
            },
            err => this.errorService.handle(err)
        );
    }

    private setupJobRunsConfig() {
        const tableConfig = new UniTableConfig('admin.jobs.jobruns', false, true, 20);
        tableConfig.columns = [
            new UniTableColumn('ID', 'Nr.').setWidth('4rem'),
            new UniTableColumn('HangfireJobId', 'Jobb nr.').setWidth('5rem'),
            new UniTableColumn('JobName', 'Navn').setWidth('15rem'),
            new UniTableColumn('Created', 'Startet')
                .setWidth('8rem')
                .setTemplate( row => {
                    return row && row.Created
                        ? moment(row.Created).format('DD.MM.YY HH:mm')
                        : '';
                }),
            new UniTableColumn('LastStatus', 'Fremdrift')
                .setWidth('6rem')
                .setTemplate( row => {
                    return row && row.Progress && row.Progress.length > 0
                        ? moment(row.Progress[0].Created).format('HH:mm')
                        : '';
                }),
            new UniTableColumn('Status', 'Status').setTemplate(row => {
                    return row && row.Progress && row.Progress.length > 0
                        ? row.Progress[0].Progress
                        : '';
            })
        ];

        this.jobRunsConfig = tableConfig;
    }

    private prepareJobList(jobNames: string[]) {
        this.jobs = jobNames.map(name => {
            return {name: name};
        });
    }

    public isFiltered() {
        return this.activeTab === undefined || this.activeTab === this.filterTabs[0];
    }

    public createJob() {
        this.router.navigateByUrl('/admin/job-details/');
    }

    // do we need this?
    public onRowSelected(event) {
        this.router.navigateByUrl(`/admin/job-details/${event.rowModel.ID}`);
    }

    public onJobRunSelected(event) {
        const item = event.rowModel;
        this.router.navigateByUrl(`/admin/job-logs?jobName=${item.JobName}&jobID=${item.HangfireJobId}`);
    }

    public onTabChange(tab) {
        this.activeTab = tab;
        if (!this.jobRunsConfig) {
            this.setupJobTable();
        }
    }
}
