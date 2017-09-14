import {Component, Input, Output, EventEmitter, ViewChild} from '@angular/core';
import {IFilter} from '../../../services/timetracking/workerService';
import {UniTemplateModal, TemplateCloseOptions, ITemplateReturnObject} from '../components/newtemplatemodal';
import {UniCalendar} from '../../../../framework/ui/unitable/controls/common/calendar';
import {ToastService, ToastType} from '../../../../framework/uniToast/toastService';
import {UniModalService} from '../../../../framework/uniModal/barrel';
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
    Project: any;
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

    @ViewChild(UniTemplateModal) public templateModal: UniTemplateModal;
    @ViewChild(UniCalendar) public calendar: UniCalendar;
    @Input() public periode: IFilter;
    @Output() public dateSelected: EventEmitter<Date> = new EventEmitter();
    @Output() public monthChanged: EventEmitter<any> = new EventEmitter();
    @Output() public templateSelected: EventEmitter<any> = new EventEmitter();
    private sidemenuMinified: boolean = false;
    public calendarConfig: any = {
        allowSelection: true,
        dailyProgress: []
    };
    private initDate: Date = new Date();


    constructor(private toast: ToastService, private modalService: UniModalService) {
        let temp = localStorage.getItem('timeTrackingTemplates');

        if (temp) {
            this.timeTrackingTemplates = JSON.parse(temp);
        }
    }

    public ngAfterViewInit() {
        if (window.innerWidth < 1200) {
            setTimeout(() => {
                this.hideShowSideMenu();
            });
        }
    }

    public onTemplateSelected(template: any) {
        this.templateSelected.emit(template);
    }

    public onTemplateEdit(template: any, index: number) {
        this.modalService.open(UniTemplateModal,
            {
                data: {
                    template: template,
                    index: index
                }
            }).onClose.subscribe((item: ITemplateReturnObject) => {
                this.onTemplateModalClose(item);
            });
    }

    private onTemplateModalClose(item: ITemplateReturnObject) {
        // Item is null when modal closes on backdrop click
        if (!item) {
            return;
        }
        switch (item.closeOption) {
            case TemplateCloseOptions.save:
                if (item.index || item.index === 0) {
                    this.timeTrackingTemplates.splice(item.index, 1, item.template);
                } else {
                    this.timeTrackingTemplates.push(item.template);
                }
                localStorage.setItem('timeTrackingTemplates', JSON.stringify(this.timeTrackingTemplates));
                break;
            case TemplateCloseOptions.delete:
                this.timeTrackingTemplates.splice(item.index, 1);
                localStorage.setItem('timeTrackingTemplates', JSON.stringify(this.timeTrackingTemplates));
                break;
            case TemplateCloseOptions.cancel:
                break;
        }
    }

    public createNewTemplate() {
        // For now, limit number of templates to 5 because of reasons, styling reasons..
        if (this.timeTrackingTemplates.length >= 5) {
            this.toast.addToast(
                'For mange maler',
                ToastType.warn, 5,
                'Maler er under utvikling, og du kan derfor kun ha 5 maler foreløpig.'
                + ' Vennligst slett en for å lage ny, eller rediger en eksisterende');
            return;
        }

        this.modalService.open(UniTemplateModal,
            {
                data: {
                    template: false,
                    index: undefined
                }
            }).onClose.subscribe((item: ITemplateReturnObject) => {
                this.onTemplateModalClose(item);
            });
    }

    public onCalendarMonthChange(month: any) {
        this.monthChanged.emit(month);
    }

    public onCalendarDateChange(date: Date) {
        this.dateSelected.emit(date);
    }

    public setTodayAsCurrentDay() {
        if (this.calendar.calendarDate.month() !== new Date().getMonth()) {
            this.monthChanged.emit(moment(new Date()));
        }
        this.initDate = new Date();
        this.dateSelected.emit(new Date());
    }

    private hideShowSideMenu() {
        this.sidemenuMinified = !this.sidemenuMinified;

        let element = document.getElementById('sidemenu_timetracking_component');
        let button = document.getElementById('sidemeny_hide_show_button_id');
        let containter = document.getElementById('regtime_container_id');

        if (this.sidemenuMinified) {
            element.style.width = '80px';
            button.style.left = '10px';
            button.style.top = '180px';
            button.style.transform = 'rotate(-180deg)';
            containter.classList.add('sidemenu_minified_container_class');
        } else {
            element.style.width = '335px';
            button.style.left = '280px';
            button.style.top = '50vh';
            button.style.transform = 'rotate(0deg)';
            containter.classList.remove('sidemenu_minified_container_class');
        }


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
                        CustomerOrderID: null,
                        Project: null
                    },
                    {
                        StartTime: '09:00',
                        EndTime: '10:30',
                        Minutes: 90,
                        Worktype: {},
                        LunchInMinutes: 0,
                        Description: 'Meetings, blablabla',
                        DimensionsID: null,
                        CustomerOrderID: null,
                        Project: null
                    },
                    {
                        StartTime: '10:30',
                        EndTime: '16:00',
                        Minutes: 300,
                        Worktype: {},
                        LunchInMinutes: 30,
                        Description: 'Doing awesome work, like always',
                        DimensionsID: null,
                        CustomerOrderID: null,
                        Project: null
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
                        CustomerOrderID: null,
                        Project: null
                    }
                ]
            }
        ];
    }
}
