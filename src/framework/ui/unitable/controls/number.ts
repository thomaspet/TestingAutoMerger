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
    @ViewChild('input', { static: true })
    public inputElement: ElementRef;

    @Input()
    public inputControl: FormControl;

    @Input()
    public column: any;

    @Output()
    public close: EventEmitter<any> = new EventEmitter();


    public getValue() {
        if (this.inputControl.dirty) {
            const value = parseFloat(
                this.inputControl.value
                    .replace(',', '.')
                    .replace(new RegExp(' ', 'gi'), '')
            );
            return isNaN(value) ? null : value;
        } else {
            return undefined;
        }
    }
}
