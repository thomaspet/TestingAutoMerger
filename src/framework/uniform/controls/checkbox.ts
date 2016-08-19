import {Component, Input, Output, ElementRef, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import {FormControl} from '@angular/forms';
import {UniFieldLayout} from '../interfaces';
declare var _; // jquery and lodash

@Component({
    selector: 'uni-checkbox-input',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
            <input
                #rd
                type="checkbox"
                [readonly]="field?.ReadOnly"
                [placeholder]="field?.Placeholder || ''"
                [checked]="isChecked()"
            />
            <label (click)="checkIt()">{{field?.Label}}</label>
    `
})
export class UniCheckboxInput {
    @Input()
    public field: UniFieldLayout;

    @Input()
    public model: any;

    @Input()
    public control: FormControl;

    @Output()
    public onReady: EventEmitter<UniCheckboxInput> = new EventEmitter<UniCheckboxInput>(true);
    
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
    
    public checkIt() {
        _.set(this.model, this.field.Property, !this.isChecked());
        this.onChange.emit(this.model);
    }
    
    public isChecked() {
        var modelValue = _.get(this.model, this.field.Property);
        return modelValue; 
    }
}