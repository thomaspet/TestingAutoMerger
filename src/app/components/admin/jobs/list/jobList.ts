// angular
import {Component, OnInit, ViewChild} from '@angular/core';
import {Router} from '@angular/router';

// app
import {IPosterWidget} from '../../../common/poster/poster';
import {TabService, UniModules} from '../../../layout/navbar/tabstrip/tabService';
import {URLSearchParams} from '@angular/http';
import {ErrorService, JobService} from '../../../../services/services';

@Component({
    selector: 'recently-executed-jobs',
    templateUrl: './JobList.html'
})
export class JobList implements OnInit {

    private widgets: IPosterWidget[] = [
        {
            type: 'text',
            size: 'big',
            config: {
                mainText: { text: 'Hello widget' }
            }
        }
    ];

    public filterTabs: any[] = [
        { label: 'Siste utførte' },
        { label: 'Alle jobber'},
    ];

    private activeTab: any = this.filterTabs[0];

    private jobRuns: any[];
    private jobs: any[];

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

        this.initWidgets();
        this.setupJobTable();
    }

     private initWidgets() {
        var activeJobs = 0;
        var jobsThisMonth = 0;
        
        let widgetActiveJobs: IPosterWidget = {
            type: 'text',
            config: {
                mainText: { text: activeJobs, class: 'large' },
                bottomText: [{ text: 'Aktive jobber', class: '' }]
            }
        };

        let widgetChart: IPosterWidget = {
            type: 'image',
            config: {
                fileID: null,
                placeholderSrc: 'http://celebrityhockeyclassics.com/wp-content/uploads/Logo-Placeholder.png',
                altText: 'jobHistoryChart'
            }
        };

        let widgetJobsMonth: IPosterWidget = {
            type: 'text',
            config: {
                mainText: { text: jobsThisMonth, class: 'large' },
                bottomText: [{ text: 'Jobber kjørt denne måneden', class: '' }]
            }
        };

        let widgetStatus: IPosterWidget = {
            type: 'image',
            config: {
                fileID: null,
                placeholderSrc: 'http://celebrityhockeyclassics.com/wp-content/uploads/Logo-Placeholder.png',
                altText: 'jobServiceStatus'
            }
        };


        this.widgets[0] = widgetActiveJobs;
        this.widgets[1] = widgetChart;
        this.widgets[2] = widgetJobsMonth;
        this.widgets[3] = widgetStatus;
    }

    private setupJobTable() {
        this.jobService.getLatestJobRuns(10).subscribe(
            result => {
                this.jobRuns = result;
                this.formatDates();
            },
            err => this.errorService.handle(err)
            );

        this.jobService.getJobs().subscribe(
            result => {
                this.prepareJobList(result)
            },
            err => this.errorService.handle(err)
            );
    }

    private prepareJobList(jobNames: string[]) {
        this.jobs = [];

        jobNames.forEach(element => {
            var job = {
                name: element
            }
            this.jobs.push(job);
        });
    }

    private formatDates() {
        if (this.jobRuns !== undefined) {
            const length = this.jobRuns.length;

            for (let i = 0; i < length; ++i) {
                let localDate: Date = new Date(this.jobRuns[i].Created);

                this.jobRuns[i].Created = 
                    ('0' + localDate.getDate()).slice(-2) + '.'
                    + ('0' + (localDate.getMonth() + 1)).slice(-2) + '.'
                    + localDate.getFullYear() + ' '
                    + ('0' + localDate.getHours()).slice(-2) + ':'
                    + ('0' + localDate.getSeconds()).slice(-2)
            }
        }
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
