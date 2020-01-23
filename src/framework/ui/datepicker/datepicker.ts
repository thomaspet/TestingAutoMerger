import {Component, Input, Output, EventEmitter, ViewChild, ElementRef} from '@angular/core';
import {MatDatepicker} from '@angular/material';

@Component({
    selector: 'uni-datepicker',
    templateUrl: './datepicker.html',
    styleUrls: ['./datepicker.sass']
})
export class UniDatepicker {
    @ViewChild('input', { static: true }) inputElement: ElementRef;
    @ViewChild(MatDatepicker, { static: true }) datepicker: MatDatepicker<any>;

    @Input() placeholder: string;
    @Input() readonly: boolean;
    @Input() value: Date;
    @Output() valueChange = new EventEmitter<Date>();

    model: Date;

    ngOnChanges(changes) {
        if (changes['value']) {
            this.model = this.value;
        }
    }

    focus() {
        if (this.inputElement) {
            this.inputElement.nativeElement.focus();

        }
    }

    onFocus() {
        if (this.inputElement) {
            this.inputElement.nativeElement.select();
        }
    }

    datepickerClosed() {
        this.emitChange();
        this.focus();
    }

    emitChange() {
        if (this.model !== this.value) {
            this.value = this.model;
            this.valueChange.emit(this.value);
        }
    }
}
