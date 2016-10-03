import {Component, Input, Output, ElementRef, ViewChild, Renderer, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import {FormControl, REACTIVE_FORM_DIRECTIVES} from '@angular/forms';
import {UniFieldLayout} from '../interfaces';
declare var _; // jquery and lodash

@Component({
    selector: 'uni-text-input',
    directives: [REACTIVE_FORM_DIRECTIVES],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <input #input
            *ngIf="control"
            type="text"
            [formControl]="control"
            [readonly]="field?.ReadOnly"
            [placeholder]="field?.Placeholder || ''"
            (blur)="blurHandler()"
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
    public onReady: EventEmitter<UniTextInput> = new EventEmitter<UniTextInput>(true);
    
    @Output()
    public onChange: EventEmitter<any> = new EventEmitter<any>(true);
    
    @ViewChild('input') private inputElement: ElementRef;
    
    private lastControlValue: string;
    
    constructor(private cd: ChangeDetectorRef, private renderer: Renderer) {
    }

    public focus() {
        this.renderer.invokeElementMethod(this.inputElement.nativeElement, 'focus', []);        
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
