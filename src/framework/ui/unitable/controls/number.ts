import {Component, Input, Output, EventEmitter, ElementRef, ViewChild} from '@angular/core';
import {FormControl} from '@angular/forms';

@Component({
    selector: 'unitable-numberinput',
    template: `<input type="text" #input
                      [formControl]="inputControl"
                      [ngStyle]="{'text-align': column?.get('alignment') || 'right'}">
    `
})
export class UnitableNumberInput {
    @ViewChild('input')
    public inputElement: ElementRef;

    @Input()
    private inputControl: FormControl;

    @Input()
    public column: any;

    @Output()
    public close: EventEmitter<any> = new EventEmitter();


    public getValue() {
        if (this.inputControl.dirty) {
            let value = parseFloat(this.inputControl.value.replace(',', '.'));
            return isNaN(value) ? null : value;
        } else {
            return undefined;
        }
    }
}
