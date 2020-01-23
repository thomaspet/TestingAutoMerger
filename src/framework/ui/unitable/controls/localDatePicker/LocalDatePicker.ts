import {Component, Input, ElementRef, ViewChild} from '@angular/core';
import {FormControl} from '@angular/forms';
import {LocalDate} from '@uni-entities';

@Component({
    selector: 'unidate-picker',
    template: `
        <section class="input-with-button">
            <input #input
                type="text"
                [formControl]="inputControl"
                [matDatepicker]="picker"
                (keydown.space)="$event.preventDefault();picker.open()"
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

    ngOnInit() {
        console.log(this.inputControl.value);
    }

    focus() {
        if (this.inputElement) {
            this.inputElement.nativeElement.focus();
            this.inputElement.nativeElement.select();
        }
    }

    getValue(): LocalDate {
        if (this.inputControl.dirty) {
            return this.inputControl.value && new LocalDate(this.inputControl.value);
        }
    }
}
