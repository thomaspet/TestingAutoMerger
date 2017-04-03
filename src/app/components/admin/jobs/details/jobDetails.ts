// angular
import {Component, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
// app
import {IToolbarConfig} from '../../../common/toolbar/toolbar';
import {IUniSaveAction} from '../../../../../framework/save/save';
import {TabService, UniModules} from '../../../layout/navbar/tabstrip/tabService';
import {UniSelect, ISelectConfig} from 'uniform-ng2/main';
import {ErrorService, JobService} from '../../../../services/services';
// admin module
import {Job} from '../../../../models/admin/jobs/job';

// this is different from the JobMode
enum JobStartMode {
    Now,
// this will be supported later
//    Date,
    Delay
}

enum TimeUnit {
    Min,
    Hour,
    Day,
    Month,
    DayOfWeek
}

class ScheduleHelper {
    public id: string = '';
    public period: string = '';
    public unit: TimeUnit = TimeUnit.Min;
}

@Component({
    selector: 'job-details',
    templateUrl: './jobDetails.html'
})
export class JobDetails {
    @ViewChild(UniSelect)

    private saveActions: IUniSaveAction[] = [];
    private toolbarconfig: IToolbarConfig;
    private delayTimeUnitSelectConfig: ISelectConfig;
    private scheduleTimeUnitSelectConfig: ISelectConfig;
    private jobStartModeSelectConfig: ISelectConfig;

    // job
    private job: Job;
    private isNewJob: boolean = true;

    // job start
    private jobStartModes: any[];
    private jobStartMode: JobStartMode = JobStartMode.Now;
    
    // delayed start
    private delayTimeUnits: any[];
    private delayTimeUnit: TimeUnit = TimeUnit.Min;
    private delay: string = '';
    

    // schedules
    private scheduleTimeUnits: any[];
    private newSchedule: ScheduleHelper = new ScheduleHelper();
    private schedules: ScheduleHelper[] = [];

    private lastExecutionTime: string = "Aldri kjørt";

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
        this.initJob();
        this.initDropDownLists();
        this.updateTabTitle();
        this.updateToolBar();

        if (!this.isNewJob) {
            this.getSchedules();
        }
    }

    private initDropDownLists() {
        // init job mode list
        this.jobStartModeSelectConfig = {
            displayProperty: 'name',
            placeholder: 'Velg trigger modus',
            searchable: false
        };

        this.jobStartModes = [
            {name: 'Nå', mode: JobStartMode.Now },
            // 'Date' will be supported later.
            //{name: 'I et tidspunkt', mode: JobStartMode.Date },
            {name: 'Med utsettelse', mode: JobStartMode.Delay }
        ];

        // init list of unit of measurement
        this.delayTimeUnitSelectConfig = {
            displayProperty: 'name',
            placeholder: 'Velg måleenhet',
            searchable: false
        };

        this.scheduleTimeUnitSelectConfig = {
            displayProperty: 'name',
            placeholder: 'Velg måleenhet',
            searchable: false
        };

        this.delayTimeUnits = [
            { name: 'min', unit: TimeUnit.Min },
            { name: 'time', unit: TimeUnit.Hour },
            { name: 'dag', unit: TimeUnit.Day }
        ];

        this.scheduleTimeUnits = [
            { name: 'min', unit: TimeUnit.Min },
            { name: 'time', unit: TimeUnit.Hour },
            { name: 'dag', unit: TimeUnit.Day },
            { name: 'måned', unit: TimeUnit.Month },
            { name: 'ukedag', unit: TimeUnit.DayOfWeek }
        ];
    }

    private initJob() {
        this.route.params.subscribe((params) => {
                this.job = new Job();
                this.job.ID = 0;

                this.job.Name = params['id'];
                this.job.IsEnabled = true;
                this.isNewJob = params['id'] === '';

                if (this.job.Name.length > 0) {
                    this.getSchedules();
                } else {
                    this.schedules = [];
                }
            },
                err => this.errorService.handle(err)
            );
    }

    private updateTabTitle() {
        let tabTitle = this.isNewJob ? 'Ny jobb' : "Jobb '" + this.job.Name + "'";

        this.tabService.addTab(
            {
                url: '/admin/job-details/' + this.job.Name, 
                name: tabTitle, 
                active: true, 
                moduleID: UniModules.Jobs,
            });
    }

    private updateToolBar() {
        if (!this.isNewJob) {
            this.toolbarconfig = {
                title: this.job.Name,
                omitFinalCrumb: false
            };
        } else {
            this.toolbarconfig = {
                title: 'Legg til ny jobb',
                omitFinalCrumb: false
            };
        }
    }

    private toggleJob() {
        this.job.IsEnabled = !this.job.IsEnabled;
    }

    private startJob() {
        switch (this.jobStartMode) {
            case JobStartMode.Now:
                this.startJobNow();
                break;
            case JobStartMode.Delay:
                this.startDelayedJob();
                break;
            /* 'Date' will be supported later.
            case JobStartMode.Date:
                break;
                */
            default:
                break;
        }
    }
            
    private startJobNow() {
        this.jobService.startJob(this.job.Name).subscribe(
            result => {},
            err => this.errorService.handle(err)
        );
    }

    private startDelayedJob() {
        let delay: number = Number(this.delay);

        if (!isNaN(delay)) {
            switch (this.delayTimeUnit) {
                case TimeUnit.Hour:
                    delay *= 60;
                    break;
                case TimeUnit.Day:
                    delay *= 60 * 24;
                    break;
                default:
                     break;
            }

            this.jobService.startJob(this.job.Name, delay).subscribe(
                result => {},
                err => this.errorService.handle(err));
        }
    }
    
    private onJobStartModeChanged(event) {
        this.jobStartMode = event.mode;
    }

    private onDelayTimeUnitChanged(event) {
        this.delayTimeUnit = event.unit;
    }

    private onNewScheduleTimeUnitChanged(event) {
        this.newSchedule.unit = event.unit;
    }

    private onScheduleTimeUnitChanged(event, item: ScheduleHelper) {
        item.unit = event.unit;
        this.updateSchedule(item);
    }

    private isJobStartDisabled(): Boolean {
        return this.isNewJob 
            || 
                (
                    this.jobStartMode === JobStartMode.Delay 
                    && !this.isNumber(this.delay)
                );
            // 'Date' will be supported later.
            //|| (this.jobStartMode === JobStartMode.Date && )
    }

    private addNewSchedule() {
        this.jobService.createSchedule(this.job.Name, this.convertObjectToCronExp(this.newSchedule)).subscribe(
            result => {
                this.newSchedule = new ScheduleHelper();
                this.getSchedules();
            },
            err => this.errorService.handle(err)
        );
    }

    private deleteSchedule(id: string) {
        this.jobService.deleteSchedule(id).subscribe(
            result => {
                this.getSchedules();
            },
            err => {
                // @TODO: fix ret value on backend first and then remove this line and uncomment the error handler
                this.getSchedules();
                //this.errorService.handle(err)
            }
        );
    }

    private updateSchedule(item: ScheduleHelper) {
        this.jobService.modifySchedule(this.job.Name, item.id, this.convertObjectToCronExp(item)).subscribe(
            res => this.getSchedules(),
            err => this.errorService.handle(err)
        );
    }

    private getSchedules() {
        this.jobService.getSchedules(this.job.Name).subscribe(
            schedules => {
                let tmpArray = [];
                let tmp: ScheduleHelper;

                for (let key in schedules) {
                    tmp = this.convertCronExpToObject(schedules[key]);
                    tmp.id = key;

                    tmpArray.push(tmp);
                }
                this.schedules = tmpArray;
            },
            err => this.errorService.handle(err)        
        );
    }

    private convertObjectToCronExp(helper: ScheduleHelper): string {
        let cronExp: string = '0 0 1 1 1 ';
        let index: number = helper.unit * 2;

        for (let i = index + 2; i < cronExp.length; i += 2) {
            cronExp = cronExp.substr(0, i) + '* ' + cronExp.substr(i + 2);
        }

        cronExp = cronExp.substr(0, index) + '*/' + helper.period + cronExp.substr(index + 1);
        console.log('|' + cronExp + '|');
        return cronExp;
    }

    private convertCronExpToObject(cronExp: string): ScheduleHelper {
        let scheduleHelper: ScheduleHelper = new ScheduleHelper();

        cronExp = cronExp.replace('*/', '');

        let items = cronExp.match(/\S+/g) || [];
        let defaultValues = [ '0', '0', '1', '1', '1' ];

        for (let i = 0; i < items.length; ++i) {
            if (this.isNumber(items[i]) && items[i] !== defaultValues[i]) {
                scheduleHelper.period = items[i];
                scheduleHelper.unit = i;
                break;
            }
        }
        return scheduleHelper;
    }

    private getScheduleTimeUnit(schedule: any)
    {
        let length: number = this.scheduleTimeUnits.length;
        let obj: any;

        for (let i = 0; i < length; ++i) {
            if (this.scheduleTimeUnits[i].unit === schedule.unit) {
                obj = this.scheduleTimeUnits[i];
            }
        }
        return obj;
    }

    private isNumber(str: string): boolean {
        return str !== undefined && str.length > 0 && !isNaN(Number(str));
    }
}
