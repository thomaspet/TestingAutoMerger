import {Component, Input, Output, EventEmitter, ElementRef, ViewChild, AfterViewInit} from '@angular/core';
import {FormControl} from '@angular/forms';
import { UniTableColumn } from '@uni-framework/ui/unitable';

@Component({
    selector: 'unitable-textinput',
    template: `<input #input type="text" [formControl]="inputControl" (blur)="onBlur()">`
})
export class UnitableTextInput implements AfterViewInit {
    @ViewChild('input', { static: true })
    public inputElement: ElementRef;

    @Input()
    public inputControl: FormControl;

    @Input()
    private column: any;

    @Output()
    private close: EventEmitter<any> = new EventEmitter();

    public ngAfterViewInit() {
        if (this.column.get('maxLength')) {
            (<HTMLElement> this.inputElement.nativeElement ).setAttribute('maxLength' , this.column.get('maxLength'));
        }
    }

    public getValue() {
        if (this.inputControl.dirty) {
            return this.inputControl.value;
        } else {
            return undefined;
        }
    }

    public onBlur() {
        if (this.inputControl.dirty) {
            this.close.emit(this.inputControl.value);
        } else {
            this.close.emit(undefined);
        }
    }
}
