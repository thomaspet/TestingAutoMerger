import {Component, Input, Output, ElementRef, EventEmitter} from 'angular2/core';
import {Control, FORM_DIRECTIVES} from 'angular2/common';
import {FieldLayout} from '../../../app/unientities';

declare var jQuery;

@Component({
    selector: 'uni-text',
    directives: [FORM_DIRECTIVES],
    template: `
        <input *ngIf="control"
            type="text"
            [ngFormControl]="control"
            [readonly]="field?.ReadOnly"
        />
    `
})
export class UniTextInput {
    @Input()
    public control: Control;

    @Input()
    public field: FieldLayout;

    @Input()
    public model: any;

    @Output()
    public onReady: EventEmitter<any> = new EventEmitter<any>(true);
    public isReady: boolean = true;
    
    get OnValueChanges() {
        return this.control.valueChanges;
    }

    get FormControl() {
        return this.control;
    }

    constructor(public elementRef: ElementRef) {
    }

    public setFocus() {
        jQuery(this.elementRef).focus();
        return this;
    }
    
    public editMode() {
        this.field.ReadOnly = false;    
    }

    public readMode() {
        this.field.ReadOnly = true;
    }
    
    public ngAfterViewInit() {
        this.onReady.emit(this);
        this.isReady = true;
    }
}
