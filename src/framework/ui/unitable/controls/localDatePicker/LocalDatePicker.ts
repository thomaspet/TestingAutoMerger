import {Component, Input, ElementRef, ViewChild} from '@angular/core';
import {FormControl} from '@angular/forms';
import {LocalDate} from '@uni-entities';
import {autocompleteDate} from '@app/date-adapter';
import * as moment from 'moment';
import {FinancialYearService} from '@app/services/services';
import {UniTableColumn} from '../../config/unitableColumn';

@Component({
    selector: 'unidate-picker',
    template: `
        <section class="input-with-button">
            <input #input
                type="text"
                [formControl]="inputControl"
                (keydown.space)="$event.preventDefault();picker.open()"
            />

            <!-- Hidden input for mat-datepicker, because we want custom parsing on the "text input" -->
            <input
                style="position: absolute; visibility: hidden; width: 0px;"
                [(ngModel)]="calendarDate"
                (ngModelChange)="onCalendarDateChange()"
                [matDatepicker]="picker"
                tabindex="-1"
            />

            <button type="button" tabindex="-1" (click)="picker.open()">
                <i class="material-icons">date_range</i>
            </button>

            <mat-datepicker #picker (closed)="focus()"></mat-datepicker>
        </section>
    `
})
export class  LocalDatePicker {
    @ViewChild('input', { static: true }) inputElement: ElementRef;
    @Input() inputControl: FormControl;

    column;
    calendarDate: Date;

    constructor(private yearService: FinancialYearService) {}

    ngOnInit() {
        if (this.inputControl.value) {
            this.calendarDate = autocompleteDate(this.inputControl.value);
        }
    }

    onCalendarDateChange() {
        this.inputControl.setValue(moment(this.calendarDate).format('L'));
        this.inputControl.markAsDirty();
    }

    focus() {
        if (this.inputElement) {
            this.inputElement.nativeElement.focus();
            this.inputElement.nativeElement.select();
        }
    }

    getValue(): LocalDate {
        if (this.inputControl.dirty) {
            const options = this.column && this.column.get('options') || {};
            const yearOverride = options.useFinancialYear && this.yearService.getActiveYear();

            const parsed = this.inputControl.value && autocompleteDate(
                this.inputControl.value,
                yearOverride,
                options.useSmartYear
            );

            return parsed && new LocalDate(parsed);
        }
    }
}
