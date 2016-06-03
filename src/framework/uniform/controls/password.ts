import {Component, Input, Output, ElementRef, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import {Control} from '@angular/common';
import {UniFieldLayout} from '../interfaces';
declare var _; // lodash

@Component({
    selector: 'uni-password-input',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <input
            *ngIf="control"
            type="password"
            [ngFormControl]="control"
            [readonly]="field?.ReadOnly"
            [placeholder]="field?.Options?.placeholder ||''"
            (blur)="blurHandler()"
        />
    `
})
export class UniPasswordInput {
    @Input()
    public field: UniFieldLayout;

    @Input()
    public model: any;

    @Input()
    public control: Control;

    @Output()
    public onReady: EventEmitter<UniPasswordInput> = new EventEmitter<UniPasswordInput>(true);
    
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