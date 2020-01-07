import {
    Component, Input, Output, ElementRef, ViewChild, EventEmitter, ChangeDetectorRef, SimpleChanges
} from '@angular/core';
import {UniFieldLayout} from '../../interfaces';
import {BaseControl} from '../baseControl';
import {LocalDate} from '@uni-entities';
import {get, set} from 'lodash';

@Component({
    selector: 'localdate-picker-input',
    templateUrl: './local-date-picker.html'
})
export class LocalDatePickerInput extends BaseControl {
    @ViewChild('input', { static: true }) inputElement: ElementRef;

    @Input() field: UniFieldLayout;
    @Input() model: any;
    @Input() asideGuid: string;

    @Output() readyEvent = new EventEmitter<LocalDatePickerInput>();
    @Output() changeEvent = new EventEmitter<SimpleChanges>();
    @Output() inputEvent = new EventEmitter<SimpleChanges>();
    @Output() focusEvent = new EventEmitter<LocalDatePickerInput>();

    initDate: Date;

    constructor(public cd: ChangeDetectorRef) {
        super();
    }

    ngOnChanges() {
        if (this.field) {
            this.createControl();

            const value = get(this.model, this.field.Property, '');
            if (value) {
                this.initDate = value === '*' ? new Date() : new Date(value);
                this.control.setValue(this.initDate);
            }
        }
    }

    ngAfterViewInit() {
        this.readyEvent.emit(this);
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

    onBlur() {
        const date = this.control.value;
        if (this.control.dirty) {
            set(this.model, this.field.Property, date && new LocalDate(date));
            this.emitChange(new LocalDate(this.initDate), date && new LocalDate(date));
            this.emitInstantChange(new LocalDate(this.initDate), date && new LocalDate(date));
        }
    }
}
