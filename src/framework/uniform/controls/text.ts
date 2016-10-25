import {Component, Input, Output, ElementRef, ViewChild, Renderer, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import {FormControl} from '@angular/forms';
import {UniFieldLayout} from '../interfaces';
declare var _; // jquery and lodash

@Component({
    selector: 'uni-text-input',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <input #input
            *ngIf="control"
            type="text"
            [formControl]="control"
            [readonly]="field?.ReadOnly"
            [placeholder]="field?.Placeholder || ''"
            (blur)="blurHandler()"
            (focus)="focusHandler()"
        />
    `
})
export class UniTextInput {
    @Input()
    public field: UniFieldLayout;

    @Input()
    public model: any;

    @Input()
    public control: FormControl;

    @Output()
    public readyEvent: EventEmitter<UniTextInput> = new EventEmitter<UniTextInput>(true);
    
    @Output()
    public changeEvent: EventEmitter<any> = new EventEmitter<any>(true);

    @Output()
    public focusEvent: EventEmitter<UniTextInput> = new EventEmitter<UniTextInput>(true);
    
    @ViewChild('input') private inputElement: ElementRef;
    
    private lastControlValue: string;
    
    constructor(private cd: ChangeDetectorRef, private renderer: Renderer) {
    }

    public focus() {
        this.renderer.invokeElementMethod(this.inputElement.nativeElement, 'focus', []);        
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
