import {Component, Input, ElementRef, ViewChild} from '@angular/core';
import {FormControl} from '@angular/forms';

@Component({
    selector: 'unitable-datepicker',
    template: `
        <section class="input-with-button">
            <input #input
                type="text"
                [formControl]="inputControl"
                [matDatepicker]="picker"
            />

            <button type="button" tabindex="-1" (click)="picker.open()">
                <i class="material-icons">date_range</i>
            </button>

            <mat-datepicker #picker (closed)="focus()"></mat-datepicker>
        </section>
    `
})
export class UnitableDateTimepicker {
    @ViewChild('input', { static: true }) inputElement: ElementRef;
    @Input() inputControl: FormControl;

    focus() {
        if (this.inputElement) {
            this.inputElement.nativeElement.focus();
            this.inputElement.nativeElement.select();
        }
    }

    getValue() {
        if (this.inputControl.dirty) {
            return this.inputControl.value;
        }
    }
}

