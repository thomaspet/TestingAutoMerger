import {Component, Input, Output, ElementRef, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import {FormControl} from '@angular/forms';
import {UniFieldLayout} from '../interfaces';
declare var _; // lodash

@Component({
    selector: 'uni-password-input',
    changeDetection: ChangeDetectionStrategy.OnPush,

    template: `
        <input
            *ngIf="control"
            type="password"
            [formControl]="control"
            [readonly]="field?.ReadOnly"
            [placeholder]="field?.Placeholder ||''"
            (focus)="focusHandler()"
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
    public control: FormControl;

    @Output()
    public readyEvent: EventEmitter<UniPasswordInput> = new EventEmitter<UniPasswordInput>(true);
    
    @Output()
    public changeEvent: EventEmitter<any> = new EventEmitter<any>(true);

    @Output()
    public focusEvent: EventEmitter<UniPasswordInput> = new EventEmitter<UniPasswordInput>(true);

    private lastControlValue: string;
    
    constructor(public elementRef: ElementRef, private cd: ChangeDetectorRef) {
    }

    public focus() {
        this.elementRef.nativeElement.children[0].focus();
        this.elementRef.nativeElement.children[0].select();
        return this;
    }

    public focusHandler() {
        this.focusEvent.emit(this);
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
        this.readyEvent.emit(this);
    }
    
    private blurHandler() {
        var lodash = _;
        if (this.lastControlValue === this.control.value) {
            return;
        }
        if (this.control.valid) {
            lodash.set(this.model, this.field.Property, this.control.value);
            this.lastControlValue = this.control.value;
            this.changeEvent.emit(this.model);
        }
    }
}
