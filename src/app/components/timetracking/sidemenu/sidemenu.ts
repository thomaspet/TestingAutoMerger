import {Component, Input, Output, EventEmitter, ViewChild} from '@angular/core';
import {TimeTrackingPeriodes} from '../timeentry/timeentry';
import {WorkerService, IFilter} from '../../../services/timetracking/workerService';
import {UniTemplateModal} from '../components/newtemplatemodal';
import {ToastService, ToastType} from '../../../../framework/uniToast/toastService';
import * as moment from 'moment';

export interface ITimeTrackingTemplate {
    StartTime: string;
    EndTime: string;
    Worktype: any;
    Minutes: number;
    LunchInMinutes: number;
    Description: string;
    DimensionsID: number;
    CustomerOrderID: number;
}

export interface ITemplate {
    Name: string;
    StartTime: string;
    EndTime: string;
    Minutes: number;
    LunchInMinutes: number;
    Description: string;
    Items: ITimeTrackingTemplate[];

}

@Component({
    selector: 'sidemenu',
    templateUrl: './sidemenu.html'
})

export class SideMenu {

    private timeTrackingTemplates: ITemplate[] = this.dummyTemplates();

    @ViewChild(UniTemplateModal) private templateModal: UniTemplateModal;
    @Input() private periode: IFilter;
    @Output() public dateSelected: EventEmitter<Date> = new EventEmitter();
    @Output() public templateSelected: EventEmitter<any> = new EventEmitter();


    constructor(private toast: ToastService) {
        let temp = localStorage.getItem('timeTrackingTemplates');

        if (temp) {
            this.timeTrackingTemplates = JSON.parse(temp);
        }
    }

    private onTemplateSelected(template: any) {
        this.templateSelected.emit(template);
    }

    private onTemplateEdit(template: any, index: number) {
        this.templateModal.open(template, index).then(x => { });
    }

    private createNewTemplate() {
        //For now, limit number of templates to 5 because of reasons, styling reasons..
        if (this.timeTrackingTemplates.length >= 5) {
            this.toast.addToast(
                'For mange maler',
                ToastType.warn, 5,
                'Maler er under utvikling, og du kan derfor kun ha 5 maler foreløpig.'
                + ' Vennligst slett en for å lage ny, eller rediger en eksisterende');
            return;
        }
        this.templateModal.open().then(x => { });
    }

    private onCalendarDateChange(date: Date) {
        this.dateSelected.emit(date);
    }

    private setTodayAsCurrentDay() {
        this.periode.date = new Date();
        this.dateSelected.emit(new Date());
    }

    private templateSave(event) {
        if (event.index || event.index === 0) {
            this.timeTrackingTemplates.splice(event.index, 1, event.template);
        } else {
            this.timeTrackingTemplates.push(event.template);
        }
        localStorage.setItem('timeTrackingTemplates', JSON.stringify(this.timeTrackingTemplates));
    }

    private templateDelete(index) {
        this.timeTrackingTemplates.splice(index, 1);
        localStorage.setItem('timeTrackingTemplates', JSON.stringify(this.timeTrackingTemplates));
    }

    private dummyTemplates(): ITemplate[] {

        return [
            {
                Name: 'Standard day',
                StartTime: '08:00',
                EndTime: '16:00',
                LunchInMinutes: 30,
                Minutes: 450,
                Description: 'Ordinary day..',
                Items: [
                    {
                        StartTime: '08:00',
                        EndTime: '09:00',
                        Minutes: 60,
                        Worktype: {},
                        LunchInMinutes: 0,
                        Description: 'Morning coffee + mails',
                        DimensionsID: null,
                        CustomerOrderID: null
                    },
                    {
                        StartTime: '09:00',
                        EndTime: '10:30',
                        Minutes: 90,
                        Worktype: {},
                        LunchInMinutes: 0,
                        Description: 'Meetings, blablabla',
                        DimensionsID: null,
                        CustomerOrderID: null
                    },
                    {
                        StartTime: '10:30',
                        EndTime: '16:00',
                        Minutes: 300,
                        Worktype: {},
                        LunchInMinutes: 30,
                        Description: 'Doing awesome work, like always',
                        DimensionsID: null,
                        CustomerOrderID: null
                    }
                ]
            },
            {
                Name: 'One-liner day',
                StartTime: '08:00',
                EndTime: '16:00',
                LunchInMinutes: 30,
                Minutes: 450,
                Description: 'Full day in one line',
                Items: [
                    {
                        StartTime: '08:00',
                        EndTime: '16:00',
                        Minutes: 450,
                        Worktype: {},
                        LunchInMinutes: 30,
                        Description: 'Working hard or hardly working',
                        DimensionsID: null,
                        CustomerOrderID: null
                    }
                ]
            }
        ]
    }
}
