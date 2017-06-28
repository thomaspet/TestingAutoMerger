import {Component, Input, Output, EventEmitter, ElementRef, ViewChild} from '@angular/core';
import {FormControl} from '@angular/forms';

@Component({
    selector: 'unitable-textinput',
    template: '<input #input type="text" [formControl]="inputControl" (blur)="onBlur()">'
})
export class UnitableTextInput {
    @ViewChild('input')
    public inputElement: ElementRef;

    @Input()
    private inputControl: FormControl;

    @Output()
    private close: EventEmitter<any> = new EventEmitter();

    public getValue() {
        if (this.inputControl.dirty) {
            return this.inputControl.value;
        } else {
            return undefined;
        }
    }

    private onBlur() {
        if (this.inputControl.dirty) {
            this.close.emit(this.inputControl.value);
        } else {
            this.close.emit(undefined);
        }
    }
}
