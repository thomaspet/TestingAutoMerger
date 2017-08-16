import { Component, Input, Output, EventEmitter } from '@angular/core';
import { TimeTrackingPeriodes } from '../timeentry/timeentry';
import { WorkerService, IFilter } from '../../../services/timetracking/workerService';
import * as moment from 'moment';

export interface ITimeTrackingTemplate {
    Date: Date,
    StartTime: String,
    EndTime: String,
    WorkType: number,
    Minutes: number,
    LunchInMinutes: number,
    Description: number,
    DimensionsID: number,
    CustomerOrderID: number
}

@Component({
    selector: 'sidemenu',
    templateUrl: './sidemenu.html'
})

export class SideMenu {

    private timeTrackingTemplates: any[] = this.dummyTemplates();

    private timearts: string[] = ['Administarsjon diverse', 'Utvikling/Prosjektarbeid', 'Reisetid', 'Møte']

    private day = {
        name: '',
        date: new Date()
    }

    @Input() private periode: IFilter;
    @Output() public dateSelected: EventEmitter<Date> = new EventEmitter();
    @Output() public templateSelected: EventEmitter<any> = new EventEmitter();


    constructor() {
        let temp = localStorage.getItem('timeTrackingTemplates');
        
        if (temp) {
            this.timeTrackingTemplates = JSON.parse(temp);
        }
    }

    private onTemplateSelected(template: any) {
        this.templateSelected.emit(template);
    }

    private createNewTemplate() {
        console.log('Create new template');
    }

    private onCalendarDateChange(date: Date) {
        this.dateSelected.emit(date);
    }

    private setTodayAsCurrentDay() {
        this.periode.date = new Date();
        this.dateSelected.emit(new Date());
    }

    private dummyTemplates() {
        return [
            {
                Label: 'Reise til modalen',
                StartTime: '08:00',
                EndTime: '10:00',
                Minutes: 120,
                WorkRelationID: 3,
                LunchInMinutes: 0,
                Description: 'Reisetid til modalen',
                DimensionsID: null,
                CustomerOrderID: null
            },
            {
                Label: 'Daily Standup',
                StartTime: '11:15',
                EndTime: '11:30',
                Minutes: 15,
                WorkRelationID: 4,
                LunchInMinutes: 0,
                Description: 'Daily status update meeting',
                DimensionsID: null,
                CustomerOrderID: null
            },
            {
                Label: 'UniEconomy TimeTracking',
                StartTime: '08:00',
                EndTime: '16:00',
                Minutes: 450,
                WorkRelationID: 2,
                LunchInMinutes: 30,
                Description: 'Working on timetracking module in UniEconomy',
                DimensionsID: null,
                CustomerOrderID: null
            }
        ]
    }
}