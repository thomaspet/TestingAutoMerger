import {Component, Input, Output, EventEmitter, Injectable, ViewChild, ElementRef, SimpleChanges, ChangeDetectorRef} from '@angular/core';
import { DateAdapter } from '@angular/material/core';
import {UniDateAdapter} from '@app/date-adapter';
import {BaseControl} from '@uni-framework/ui/uniform/controls/baseControl';
import {MatDatepicker} from '@angular/material/datepicker';
import {UniFieldLayout} from '@uni-framework/ui/uniform/interfaces/uni-field-layout.interface.ts';
import {get, set} from 'lodash';
import * as moment from 'moment';
import {LocalDate} from '@uni-entities';
import {KeyCodes} from '@app/services/common/keyCodes';

@Injectable()
export class MonthDateAdapter extends UniDateAdapter {
    format(date: Date): string {
        return moment(date).format('MMMM YYYY');
    }
}

@Component({
    selector: 'month-picker-input',
    templateUrl: './month-picker.html',
    providers: [
        {provide: DateAdapter, useClass: MonthDateAdapter},
    ]
})
export class MonthPickerInput extends BaseControl {
    @ViewChild('input', { static: true }) inputElement: ElementRef;
    @ViewChild(MatDatepicker, { static: true }) datepicker: MatDatepicker<any>;

    @Input() field: UniFieldLayout;
    @Input() model: any;
    @Input() asideGuid: string;

    @Output() readyEvent = new EventEmitter<MonthPickerInput>();
    @Output() changeEvent = new EventEmitter<SimpleChanges>();
    @Output() inputEvent = new EventEmitter<SimpleChanges>();
    @Output() focusEvent = new EventEmitter<MonthPickerInput>();

    initDate: Date;
    value: Date;
    options: any;

    constructor(
        public cd: ChangeDetectorRef
    ) {
        super();
    }

    ngAfterViewInit() {
        this.readyEvent.emit(this);
    }

    ngOnChanges() {
        if (this.field) {
            this.options = this.field.Options || {};
            this.createControl();

            let value = get(this.model, this.field.Property, '');
            if (!(value instanceof LocalDate)) {
                if (!value) {
                    value = null;
                } else {
                    value = new LocalDate(value);
                }
            }
            if (value) {
                this.control.setValue(moment(value).format('YYYY-MM-DD'));
                this.initDate = value;
                this.value = value.toDate();
            } else {
                this.control.setValue('');
                this.initDate = value?.toDate();
                this.value = value?.toDate();
            }
        }
    }

    onMonthSelected(value, datepicker) {
        datepicker.close();
        const initValue = this.initDate;
        const controlValue = value ? moment(value).format('YYYY-MM-DD') : '';
        const newValue = value && new LocalDate(value);
        this.control.setValue(controlValue, { emitEvent: false });
        set(this.model, this.field.Property, newValue);
        this.emitChange(initValue, newValue);
        this.emitInstantChange(initValue, newValue);
    }

    focus() {
        if (this.inputElement) {
            this.inputElement.nativeElement.focus();
            this.inputElement.nativeElement.select();
        }
    }

    onKeyDown(event: KeyboardEvent) {
        const key = event.which || event.keyCode;
        if (key === KeyCodes.DOWN_ARROW || key === KeyCodes.F4 || key === KeyCodes.SPACE) {
            event.preventDefault();
            this.datepicker.open();
        }
    }

}
