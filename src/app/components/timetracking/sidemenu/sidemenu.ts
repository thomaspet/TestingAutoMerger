import { Component, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { TimeTrackingPeriodes } from '../timeentry/timeentry';
import { WorkerService, IFilter } from '../../../services/timetracking/workerService';
import { UniTemplateModal } from '../components/newtemplatemodal';
import * as moment from 'moment';

export interface ITimeTrackingTemplate {
    StartTime: string;
    EndTime: string;
    WorkType: number;
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
    Hours: number;
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

    private timearts: string[] = ['Administarsjon diverse', 'Utvikling/Prosjektarbeid', 'Reisetid', 'Møte']
    private editTemplateOnClick: boolean = false;
    private day = {
        name: '',
        date: new Date()
    }

    @ViewChild(UniTemplateModal) private templateModal: UniTemplateModal;
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
        if (this.editTemplateOnClick) {
            this.editTemplateOnClick = false;
            this.templateModal.open(template).then(x => {
                console.log(x);
            })
        } else {
            this.templateSelected.emit(template);
        }
    }

    private createNewTemplate() {
        this.templateModal.open().then(x => {
            //if (x) {
            //    this.onFilterClick(this.currentFilter);
            //    if (this.eventcfg && this.eventcfg.askReload) { this.eventcfg.askReload(); }
            //}
            console.log(x);
        });
    }

    private onCalendarDateChange(date: Date) {
        this.dateSelected.emit(date);
    }

    private setTodayAsCurrentDay() {
        this.periode.date = new Date();
        this.dateSelected.emit(new Date());
    }

    private templateSave(event) {
        console.log(event);
    }

    private dummyTemplates(): ITemplate[] {

        return [
            {
                Name: 'Standard dag',
                StartTime: '08:00',
                EndTime: '16:00',
                LunchInMinutes: 30,
                Hours: 7.50,
                Description: 'Vanlig dag',
                Items: [
                    {
                        StartTime: '08:00',
                        EndTime: '11:15',
                        Minutes: 120,
                        WorkType: 3,
                        LunchInMinutes: 0,
                        Description: 'Before lunch',
                        DimensionsID: null,
                        CustomerOrderID: null
                    },
                    {
                        StartTime: '11:15',
                        EndTime: '11:30',
                        Minutes: 15,
                        WorkType: 4,
                        LunchInMinutes: 0,
                        Description: 'Daily status update meeting',
                        DimensionsID: null,
                        CustomerOrderID: null
                    },
                    {
                        StartTime: '11:30',
                        EndTime: '16:00',
                        Minutes: 270,
                        WorkType: 2,
                        LunchInMinutes: 30,
                        Description: 'Working on timetracking module in UniEconomy',
                        DimensionsID: null,
                        CustomerOrderID: null
                    }
                ]
            },
            {
                Name: 'Full dag i en føring',
                StartTime: '08:00',
                EndTime: '16:00',
                LunchInMinutes: 30,
                Hours: 7.50,
                Description: 'Vanlig dag',
                Items: [
                    {
                        StartTime: '08:00',
                        EndTime: '16:00',
                        Minutes: 450,
                        WorkType: 2,
                        LunchInMinutes: 30,
                        Description: 'Uni Economy Timetracking',
                        DimensionsID: null,
                        CustomerOrderID: null
                    }
                ]
            }
        ]
    }
}