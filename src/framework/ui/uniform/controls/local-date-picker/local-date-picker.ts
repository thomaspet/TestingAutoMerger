import {
    Component, Input, Output, ElementRef, ViewChild, EventEmitter, ChangeDetectorRef, SimpleChanges
} from '@angular/core';
import {UniFieldLayout} from '../../interfaces';
import {BaseControl} from '../baseControl';
import {LocalDate} from '@uni-entities';
import {get, set} from 'lodash';
import {autocompleteDate} from '@app/date-adapter';
import * as moment from 'moment';
import {FinancialYearService} from '@app/services/accounting/financialYearService';
import {KeyCodes} from '@app/services/common/keyCodes';
import {MatDatepicker} from '@angular/material';

@Component({
    selector: 'localdate-picker-input',
    templateUrl: './local-date-picker.html',
})
export class LocalDatePickerInput extends BaseControl {
    @ViewChild('input', { static: true }) inputElement: ElementRef;
    @ViewChild(MatDatepicker, { static: true }) datepicker: MatDatepicker;

    @Input() field: UniFieldLayout;
    @Input() model: any;
    @Input() asideGuid: string;

    @Output() readyEvent = new EventEmitter<LocalDatePickerInput>();
    @Output() changeEvent = new EventEmitter<SimpleChanges>();
    @Output() inputEvent = new EventEmitter<SimpleChanges>();
    @Output() focusEvent = new EventEmitter<LocalDatePickerInput>();

    options: { useSmartYear?: boolean; useFinancialYear?: boolean; };
    initDate: Date;

    // Use a separate variable for the input with attach mat-calendar to
    // Because we want custom parsing on the input the user types into
    calendarDate: Date;

    constructor(
        public cd: ChangeDetectorRef,
        private yearService: FinancialYearService
    ) {
        super();
    }

    ngOnChanges() {
        if (this.field) {
            this.options = this.field.Options || {};
            this.createControl();

            const value = get(this.model, this.field.Property, '');
            if (value) {
                this.initDate = value === '*' ? new Date() : new Date(value);
                this.calendarDate = this.initDate;
                this.control.setValue(moment(this.initDate).format('L'));
            } else {
                this.initDate = undefined;
                this.calendarDate = undefined;
            }
        }
    }

    ngAfterViewInit() {
        this.readyEvent.emit(this);
    }

    onCalendarDateChange() {
        this.selectDate(this.calendarDate);
    }

    parseInput() {
        const yearOveride = this.options.useFinancialYear && this.yearService.getActiveYear();
        const date = autocompleteDate(this.control.value, yearOveride, this.options.useSmartYear);
        this.selectDate(date);
    }

    onFocus() {
        this.focusEvent.emit(this);
    }

    focus() {
        if (this.inputElement) {
            this.inputElement.nativeElement.focus();
            this.inputElement.nativeElement.select();
        }
    }

    selectDate(date: Date) {
        this.calendarDate = date;

        const controlValue = date ? moment(date).format('L') : '';
        const initValue = this.initDate && new LocalDate(this.initDate);
        const newValue = date && new LocalDate(date);

        this.control.setValue(controlValue, { emitEvent: false });

        set(this.model, this.field.Property, newValue);
        this.emitChange(initValue, newValue);
        this.emitInstantChange(initValue, newValue);
    }

    onKeyDown(event: KeyboardEvent) {
        const key = event.which || event.keyCode;
        if (key === KeyCodes.DOWN_ARROW || key === KeyCodes.F4 || key === KeyCodes.SPACE) {
            event.preventDefault();
            this.datepicker.open();
        }
    }
}
