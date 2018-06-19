import {Component, Input, ElementRef, ViewChild} from '@angular/core';
import {FormControl} from '@angular/forms';
import * as moment from 'moment';
import {DateUtil} from '../common/DateUtil';
import {KeyCodes} from '../../../../../app/services/common/keyCodes';
import {LocalDate} from '../../../../../app/unientities';
import { UniTableColumn } from '@uni-framework/ui/unitable';
import * as Immutable from 'immutable';


@Component({
    selector: 'unidate-picker',
    template: `
        <section class="uni-datepicker">
            <input #input type="text"
                (change)="inputChange()"
                (keydown)="onKeyDown($event)"
                [formControl]="inputControl"
                class="uni-datepicker-input"/>

            <button class="uni-datepicker-calendarBtn"
                    (click)="toggleCalendar()"
                    (keydown.esc)="onKeyDown($event)"
                    tabIndex="-1">Kalender</button>
            <unitable-calendar [attr.aria-expanded]="expanded"
                          [date]="calendarDate"
                          (dateChange)="dateSelected($event)"
                          (keydown.esc)="onKeyDown($event)">
            </unitable-calendar>
        </section>
    `
})
export class  LocalDatePicker {
    @ViewChild('input')
    public inputElement: ElementRef;

    @Input()
    public inputControl: FormControl;

    public expanded: boolean;
    public column: Immutable.Map<any, any>;
    private selectedDate: Date;
    public calendarDate: Date;

    constructor(private dateUtil: DateUtil) {}

    public getValue(): LocalDate {
        if (this.selectedDate) {
            return new LocalDate(this.selectedDate);
        } else {
            if (this.inputControl.dirty) {
                const date = this.dateUtil.autocompleteDate(this.inputControl.value || '');
                return date && new LocalDate(date);
            } else {
                return undefined;
            }
        }
    }

    public inputChange() {
        const value = this.inputControl.value;
        let date;

        const options = this.column.get('options') || {};
        const year = options.defaultYear || new Date().getFullYear();

        if (value && value.length) {
            if (value === '*') {
                date = new Date();
            } else {
                date = this.dateUtil.autocompleteDate(value, year) || null;
            }
        }

        this.selectedDate = date;
    }

    public toggleCalendar() {
        if (this.expanded) {
            this.expanded = false;
        } else {
            this.calendarDate = this.dateUtil.autocompleteDate(this.inputControl.value);
            this.expanded = true;
        }
    }

    public dateSelected(date) {
        this.selectedDate = date;
        this.calendarDate = new Date(date);

        if (date) {
            this.inputControl.setValue(moment(date).format('DD.MM.YYYY'));
        } else {
            this.inputControl.setValue('');
        }

        this.expanded = false;
        this.inputElement.nativeElement.focus();
    }

    public onKeyDown(event: KeyboardEvent) {
        const key = event.which || event.keyCode;

        if (key === KeyCodes.ESCAPE && this.expanded) {
            event.preventDefault();
            event.stopPropagation();
            this.expanded = false;
            this.inputElement.nativeElement.focus();
        } else if (key === KeyCodes.SPACE && !this.inputControl.value.length) {
            event.preventDefault();
            this.expanded = true;
        } else if (key === KeyCodes.F4 || (key === KeyCodes.DOWN_ARROW && event.altKey)) {
            this.expanded = true;
        }
    }

}
