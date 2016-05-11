import {Component, Input, Output, ElementRef, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import {Control} from '@angular/common';
import {FieldLayout} from '../../../app/unientities';

declare var jQuery, _; // jquery and lodash

@Component({
    selector: 'uni-text-input',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <input
            *ngIf="control"
            type="text"
            [ngFormControl]="control"
            [readonly]="field?.ReadOnly"
        />
    `
})
export class UniTextInput {
    @Input()
    public field: FieldLayout;

    @Input()
    public model: any;

    @Input()
    public control: Control;

    @Output()
    public onReady: EventEmitter<UniTextInput> = new EventEmitter<UniTextInput>(true);
    
    @Output()
    public onChange: EventEmitter<any> = new EventEmitter<any>(true);
    
    constructor(public elementRef: ElementRef, private cd: ChangeDetectorRef) {
    }

    public focus() {
        jQuery(this.elementRef).focus();
        return this;
    }

    public readMode() {
        this.field.ReadOnly = true;
        this.cd.markForCheck();
    }

    public editMode() {
        this.field.ReadOnly = false;
        this.cd.markForCheck();
    }



    public ngOnChanges() {
        var self = this;
        this.control.valueChanges.subscribe((value) => {
            if (self.control.valid) {
                _.set(self.model, self.field.Property, value);
                this.onChange.emit(self.model);
            }    
        });    
    }

    public ngAfterViewInit() {
        this.onReady.emit(this);
    }
}