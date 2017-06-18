// angular
import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';

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
    private jobs: any[];
    private busy: boolean = false;

    constructor(
        private tabService: TabService,
        private router: Router,
        private jobService: JobService,
        private errorService: ErrorService) {
    }

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
        this.getLatestJobRuns();

        this.jobService.getJobs().subscribe(
            result => {
                this.prepareJobList(result);
            },
            err => this.errorService.handle(err)
            );
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

    public onTabChange(tab) {
        this.activeTab = tab;
    }
}
