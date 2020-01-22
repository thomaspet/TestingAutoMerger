import {Component, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {IToolbarConfig} from '../../../common/toolbar/toolbar';
import {IUniSaveAction} from '../../../../../framework/save/save';
import {TabService, UniModules} from '../../../layout/navbar/tabstrip/tabService';
import {UniSelect, ISelectConfig} from '../../../../../framework/ui/uniform/index';
import {ErrorService, JobService, PageStateService} from '../../../../services/services';
import {Job} from '../../../../models/admin/jobs/job';

enum JobStartMode {
    Now,
    Delay
}

enum TimeUnit {
    Min,
    Hour,
    Day,
    Month,
    DayOfWeek
}

class JobSchedule {
    public id: string = '';
    public period: string = '';
    public unit: TimeUnit = TimeUnit.Min;
}

@Component({
    selector: 'job-details',
    templateUrl: './jobDetails.html'
})
export class JobDetails {
    public saveActions: IUniSaveAction[] = [];
    public toolbarconfig: IToolbarConfig;

    public job: Partial<Job>;
    private isNewJob: boolean = true;

    public scheduleTimeUnitSelectConfig: ISelectConfig;
    public scheduleTimeUnits: any[];
    public newSchedule: JobSchedule = new JobSchedule();
    public schedules: JobSchedule[] = [];

    public lastExecutionTime: string = 'Aldri kjørt';

    constructor(
        private tabService: TabService,
        private pagestateService: PageStateService,
        private route: ActivatedRoute,
        private errorService: ErrorService,
        private jobService: JobService
    ) {
        this.tabService.addTab({
            url: this.pagestateService.getUrl(),
            name: 'Jobbdetaljer',
            active: true,
            moduleID: UniModules.Jobs
        });
   }

    public ngOnInit() {
        this.initDropDownLists();

        this.route.queryParamMap.subscribe(paramMap => {
            const job: Partial<Job> = {};
            job.ID = 0;
            job.Name = paramMap.get('jobName');
            job.IsEnabled = true;

            this.job = job;
            this.isNewJob = !job.Name;

            this.toolbarconfig = {
                title: (job && job.Name) || 'Ny jobb',
                hideBreadcrumbs: true,
                subheads: [
                    {
                        title: 'Tilbake til jobber',
                        link: '/#/admin/jobs?tab=alljobs'
                    }
                ]
            };

            if (this.isNewJob) {
                this.schedules = [];
            } else {
                this.getSchedules();
            }
        });
    }

    private initDropDownLists() {
        this.scheduleTimeUnitSelectConfig = {
            displayProperty: 'name',
            placeholder: 'Velg måleenhet',
            searchable: false,
            hideDeleteButton: true
        };

        this.scheduleTimeUnits = [
            { name: 'min', unit: TimeUnit.Min },
            { name: 'time', unit: TimeUnit.Hour },
            { name: 'dag', unit: TimeUnit.Day },
            { name: 'måned', unit: TimeUnit.Month },
            { name: 'ukedag', unit: TimeUnit.DayOfWeek }
        ];
    }

    public startJob() {
        this.jobService.startJob(this.job.Name).subscribe(
            result => {},
            err => this.errorService.handle(err)
        );
    }


    public onNewScheduleTimeUnitChanged(event) {
        this.newSchedule.unit = event.unit;
    }

    public onScheduleTimeUnitChanged(event, item: JobSchedule) {
        item.unit = event.unit;
        this.updateSchedule(item);
    }

    public addNewSchedule() {
        this.jobService.createSchedule(this.job.Name, this.convertObjectToCronExp(this.newSchedule)).subscribe(
            result => {
                this.newSchedule = new JobSchedule();
                this.getSchedules();
            },
            err => this.errorService.handle(err)
        );
    }

    public deleteSchedule(id: string) {
        this.jobService.deleteSchedule(id).subscribe(
            result => {
                this.getSchedules();
            },
            err => {
                // @TODO: fix ret value on backend first and then remove this line and uncomment the error handler
                this.getSchedules();
                // this.errorService.handle(err)
            }
        );
    }

    private updateSchedule(item: JobSchedule) {
        this.jobService.modifySchedule(this.job.Name, item.id, this.convertObjectToCronExp(item)).subscribe(
            res => this.getSchedules(),
            err => this.errorService.handle(err)
        );
    }

    private getSchedules() {
        this.jobService.getSchedules(this.job.Name).subscribe(
            schedules => {
                const tmpArray = [];
                let tmp: JobSchedule;
                // tslint:disable-next-line:forin
                for (const key in schedules) {
                    tmp = this.convertCronExpToObject(schedules[key]);
                    tmp.id = key;

                    tmpArray.push(tmp);
                }
                this.schedules = tmpArray;
            },
            err => this.errorService.handle(err)
        );
    }

    private convertObjectToCronExp(helper: JobSchedule): string {
        let cronExp: string = '0 0 1 1 1 ';
        const index: number = helper.unit * 2;

        for (let i = index + 2; i < cronExp.length; i += 2) {
            cronExp = cronExp.substr(0, i) + '* ' + cronExp.substr(i + 2);
        }

        cronExp = cronExp.substr(0, index) + '*/' + helper.period + cronExp.substr(index + 1);
        console.log('|' + cronExp + '|');
        return cronExp;
    }

    private convertCronExpToObject(cronExp: string): JobSchedule {
        const schedule: JobSchedule = new JobSchedule();

        cronExp = cronExp.replace('*/', '');

        const items = cronExp.match(/\S+/g) || [];
        const defaultValues = [ '0', '0', '1', '1', '1' ];

        for (let i = 0; i < items.length; ++i) {
            if (this.isNumber(items[i]) && items[i] !== defaultValues[i]) {
                schedule.period = items[i];
                schedule.unit = i;
                break;
            }
        }
        return schedule;
    }

    public getTimeUnitName(schedule): string {
        const timeUnit = this.scheduleTimeUnits && this.scheduleTimeUnits.find(tu => {
            return tu.unit === schedule.unit;
        });

        return timeUnit && timeUnit.name;
    }

    public isNumber(str: string): boolean {
        return str !== undefined && str.length > 0 && !isNaN(Number(str));
    }
}
