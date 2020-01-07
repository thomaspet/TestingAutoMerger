import {Component, Input, Output, EventEmitter, ViewChild, HostBinding} from '@angular/core';
import {IFilter} from '../../../services/timetracking/workerService';
import {UniTemplateModal, TemplateCloseOptions, ITemplateReturnObject} from '../components/newtemplatemodal';
import {UniCalendar} from '../../../../framework/ui/unitable/controls/common/calendar';
import {ToastService, ToastType} from '../../../../framework/uniToast/toastService';
import {UniModalService} from '../../../../framework/uni-modal';
import * as moment from 'moment';
import {BrowserStorageService} from '@uni-framework/core/browserStorageService';

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
    @ViewChild(UniCalendar, { static: true }) public calendar: UniCalendar;

    @Input() public periode: IFilter;
    @Output() public dateSelected: EventEmitter<Date> = new EventEmitter();
    @Output() public monthChanged: EventEmitter<any> = new EventEmitter();
    @Output() public templateSelected: EventEmitter<any> = new EventEmitter();

    @HostBinding('class.minimized') public minimized: boolean;

    public timeTrackingTemplates: ITemplate[] = this.dummyTemplates();
    // public sidemenuMinified: boolean = false;
    public initDate: Date = new Date();
    public calendarConfig: any = {
        allowSelection: true,
        dailyProgress: []
    };

    constructor(
        private toast: ToastService,
        private modalService: UniModalService,
        private browserStorage: BrowserStorageService,
    ) {
        const key = 'timeTrackingTemplates';
        const templates = browserStorage.getItem(key);
        if (templates) {
            this.timeTrackingTemplates = templates;
        }

        this.minimized = this.browserStorage.getItemFromCompany('timetracking_sidemenu_minimized');
    }

    ngAfterViewInit() {
        if (window.innerWidth < 1200) {
            this.minimized = true;
        }
    }

    toggleSidemenu() {
        this.minimized = !this.minimized;
        this.browserStorage.setItemOnCompany('timetracking_sidemenu_minimized', this.minimized);
    }

    onTemplateSelected(template: any) {
        this.templateSelected.emit(template);
    }

    onTemplateEdit(template: any, index: number) {
        this.modalService.open(UniTemplateModal,
            {
                data: {
                    template: template,
                    index: index
                },
                closeOnClickOutside: false
            }).onClose.subscribe((item: ITemplateReturnObject) => {
                this.onTemplateModalClose(item);
            });
    }

    onTemplateDelete(index: number) {
        this.timeTrackingTemplates.splice(index, 1);
        this.browserStorage.setItem('timeTrackingTemplates', this.timeTrackingTemplates);
    }

    onTemplateModalClose(item: ITemplateReturnObject) {
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
                this.browserStorage.setItem('timeTrackingTemplates', this.timeTrackingTemplates);
                break;
            case TemplateCloseOptions.delete:
                this.timeTrackingTemplates.splice(item.index, 1);
                this.browserStorage.setItem('timeTrackingTemplates', this.timeTrackingTemplates);
                break;
            case TemplateCloseOptions.cancel:
                break;
        }
    }

    createNewTemplate() {
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
                },
                closeOnClickOutside: false
            }).onClose.subscribe((item: ITemplateReturnObject) => {
                this.onTemplateModalClose(item);
            });
    }

    onCalendarMonthChange(month: any) {
        this.monthChanged.emit(month);
    }

    onCalendarDateChange(date: Date) {
        this.dateSelected.emit(date);
    }

    setTodayAsCurrentDay() {
        if (this.calendar.calendarDate.month() !== new Date().getMonth()) {
            this.monthChanged.emit(moment(new Date()));
        }
        this.initDate = new Date();
        this.dateSelected.emit(new Date());
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
