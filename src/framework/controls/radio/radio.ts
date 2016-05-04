import {Component, Input, Output, ElementRef, EventEmitter} from 'angular2/core';
import {Control, FORM_DIRECTIVES} from 'angular2/common';
import {FieldLayout} from '../../../app/unientities';
import {Guid} from '../guid';

declare var jQuery, _;

@Component({
    selector: 'uni-checkbox',
    directives: [FORM_DIRECTIVES],
    template: `
        <input *ngIf="control"
            [attr.id]="guid"
            type="radio"
            [ngFormControl]="control"
            [readonly]="field?.ReadOnly"
        />
        <label [attr.for]="guid">{{config.label}}</label>
    `
})
export class UniRadioInput {
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
    
    public guid: string;

    constructor(public elementRef:ElementRef) {
        this.guid = Guid.MakeNew().ToString();
    }

    public setFocus() {
        jQuery(this.elementRef).find('input').first().focus();
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
        var self = this;
        this.control.valueChanges.subscribe((newValue: any) => {
            if (self.control.valid) {
                _.set(self.model, self.field.Property, newValue);
            }
        });
    }
}
