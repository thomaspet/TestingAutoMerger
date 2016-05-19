import {Component, Input, Output, ElementRef, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import {Control} from '@angular/common';
import {UniFieldLayout} from '../unifieldlayout';
declare var _; // jquery and lodash

@Component({
    selector: 'uni-radio-input',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
            <input
                #rd
                type="radio"
                [readonly]="field?.ReadOnly"
                [placeholder]="field?.Placeholder || ''"
                [checked]="isChecked()"
            />
            <label (click)="checkIt()">{{field?.Label}}</label>
    `
})
export class UniRadioInput {
    @Input()
    public field: UniFieldLayout;

    @Input()
    public model: any;

    @Input()
    public control: Control;

    @Output()
    public onReady: EventEmitter<UniRadioInput> = new EventEmitter<UniRadioInput>(true);
    
    @Output()
    public onChange: EventEmitter<any> = new EventEmitter<any>(true);
    
    constructor(public elementRef: ElementRef, private cd: ChangeDetectorRef) {
    }

    public focus() {
        this.elementRef.nativeElement.focus();
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

    public ngAfterViewInit() {
        this.onReady.emit(this);
    }
    
    public ngOnChanges(changes) {
    }
    
    public checkIt() {
        _.set(this.model, this.field.Property, !this.isChecked());
        this.onChange.emit(this.model);
    }
    
    public isChecked() {
        var modelValue = _.get(this.model, this.field.Property);
        return modelValue; 
    }
}