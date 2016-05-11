import {Component, Input, Output, ElementRef, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import {Control} from '@angular/common';
import {FieldLayout} from '../../../app/unientities';

declare var _; // lodash

@Component({
    selector: 'uni-textarea-input',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <textarea
            *ngIf="control"
            [ngFormControl]="control"
            [readonly]="field?.ReadOnly"
            [cols]="field?.Options?.cols || 100"
            [rows]="field?.Options?.rows || 10"
            [placeholder]="field?.Options?.placeholder"
            (blur)="blurHandler($event)
        ></textarea>
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
    
    private lastControlValue: string;
    
    constructor(public elementRef: ElementRef, private cd: ChangeDetectorRef) {
    }

    public focus() {
        this.elementRef.nativeElement.children[0].focus();
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
        this.lastControlValue = this.control.value;
    }

    public ngAfterViewInit() {
        this.onReady.emit(this);
    }
    
    private blurHandler() {
        var lodash = _;
        if (this.lastControlValue === this.control.value) {
            return;
        }
        if (this.control.valid) {
            lodash.set(this.model, this.field.Property, this.control.value);
            this.lastControlValue = this.control.value;
            this.onChange.emit(this.model);
        }
    }
}