import {Component, Input, Output, ElementRef, ViewChild, EventEmitter} from '@angular/core';
import {FormControl} from '@angular/forms';
import {UniFieldLayout} from '../../interfaces';
import {autocompleteDate} from '../../shared/autocompleteDate';
import {UniCalendar} from './calendar';

import moment from 'moment';
declare var _;

@Component({
    selector: 'uni-date-input',
    template: `
        <section class="uni-datepicker" (clickOutside)="hideCalendar()">
            <input #input
                *ngIf="control"
                type="text"
                (change)="inputChange()"
                [formControl]="control"
                [readonly]="field?.ReadOnly"
                [placeholder]="field?.Placeholder || ''"
            />
            <button type="button"
                    class="uni-datepicker-calendarBtn"
                    (click)="calendarOpen = !calendarOpen"
                    [disabled]="field?.ReadOnly"
            >Kalender</button>

            <uni-calendar [attr.aria-expanded]="calendarOpen"
                          [date]="selectedDate"
                          (dateChange)="dateSelected($event)">
            </uni-calendar>
        </section>
    `
})
export class UniDateInput {
    @ViewChild('input')
    private inputElement: ElementRef;

    @Input()
    public field: UniFieldLayout;

    @Input()
    public model: any;

    @Input()
    public control: FormControl;

    @Output()
    public onReady: EventEmitter<UniDateInput> = new EventEmitter<UniDateInput>();

    @Output()
    public onChange: EventEmitter<Date> = new EventEmitter<Date>();

    private calendarOpen: boolean;
    private selectedDate: Date;
    private options: any;

    public ngOnChanges(changes) {
        if (this.control && this.field) {
            this.options = this.field.Options || {};
            let value = _.get(this.model, this.field.Property);

            if (value) {
                this.selectedDate = new Date(value);
                this.control.setValue(moment(this.selectedDate).format('L'));
            }
        }
    }

    public ngAfterViewInit() {
        this.onReady.emit(this);
    }

    public focus() {
        this.inputElement.nativeElement.focus();
    }

    public readMode() {
        this.field.ReadOnly = true;
    }

    public editMode() {
        this.field.ReadOnly = false;
    }

    private inputChange() {
        const value = this.control.value;
        let date;

        if ((value && value.length) || this.options.autocompleteEmptyValue) {
            date = autocompleteDate(value) || null;
        }

        this.dateSelected(date);
    }

    private dateSelected(date) {
        this.selectedDate = date;

        this.control.setValue(date ? moment(date).format('L') : '');

        _.set(this.model, this.field.Property, date);
        this.onChange.emit(this.model);
    }

    private hideCalendar() {
        this.calendarOpen = false;
    }

}
