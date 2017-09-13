// angular
import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {PageStateService} from '../../../../services/services';
import {UniTableConfig, UniTableColumn} 
    from '../../../../../framework/ui/unitable/index';
import * as moment from 'moment';

// app
import {TabService, UniModules} from '../../../layout/navbar/tabstrip/tabService';
import {ErrorService, JobService} from '../../../../services/services';

@Component({
    selector: 'recently-executed-jobs',
    templateUrl: './JobList.html'
})
export class JobList implements OnInit {

    public filterTabs: any[] = [
        { label: 'Siste utførte', name: 'jobruns', id: 1 },
        { label: 'Alle jobber', name: 'jobs', id: 2 },
        { label: 'SAF-T import', name: 'saft', id: 3 }
    ];

    private activeTab: { id: number, name: string, label: string } = this.filterTabs[0];

    private jobRuns: any[];
    public jobRunsConfig: UniTableConfig;
    private jobs: any[];
    private busy: boolean = false;

    constructor(
        private tabService: TabService,
        private router: Router,
        private jobService: JobService,
        private errorService: ErrorService,
        private pageStateService: PageStateService) {
    }

    public ngOnInit() {

        this.tabService.addTab({
            url: '/admin/jobs',
            name: 'Jobber',
            active: true,
            moduleID: UniModules.Jobs
        });
        
        // Select view?
        var params = this.pageStateService.getPageState(); 
        if (params.jobtype) {
            let ix = this.filterTabs.findIndex( t => t.name === params.jobtype);
            if (ix >= 0) {
                this.activeTab = this.filterTabs[ix];
                if (this.activeTab.name === 'saft') {
                    return;
                }
            }
        }

        this.setupJobTable();
    }

    public refresh() {
        this.getLatestJobRuns();
    }

    private getLatestJobRuns() {
        this.busy = true;
        this.jobService.getLatestJobRuns(20)
            .finally(() => this.busy = false)
            .subscribe(
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

        var cfg = new UniTableConfig('admin.jobs.jobruns', false, true, 20);
        cfg.columns = [
            new UniTableColumn('ID', 'Nr.').setWidth('4rem'),
            new UniTableColumn('JobName', 'Navn').setWidth('15rem'),
            new UniTableColumn('Created', 'Startet')
                .setWidth('8rem')
                .setTemplate( row => { 
                    return row && row.Created ? 
                        moment(row.Created).format('DD.MM.YY HH:mm') : '';
                }),
            new UniTableColumn('LastStatus', 'Fremdrift')
                .setWidth('6rem')
                .setTemplate( row => { 
                    return row && row.Progress && row.Progress.length > 0 ? 
                        moment(row.Progress[0].Created).format('HH:mm') : '';
                }),
            new UniTableColumn('Status', 'Status')
                .setTemplate( row => { 
                    return row && row.Progress && row.Progress.length > 0 ? 
                        row.Progress[0].Progress : '';
                })
        ];
        this.jobRunsConfig = cfg;
    }

    private prepareJobList(jobNames: string[]) {
        this.jobs = [];

        jobNames.forEach(element => {
            var job = {
                name: element
            };
            this.jobs.push(job);
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
        var item = event.rowModel;
        this.router.navigateByUrl(`/admin/job-logs/${item.JobName}/${item.HangfireJobId}`);
    }

    public onTabChange(tab) {
        this.activeTab = tab;
        this.pageStateService.setPageState('jobtype', tab.name);
        if (!this.jobRunsConfig) {
            this.setupJobTable();
        }
    }
}
