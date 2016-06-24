import {Component, Input, Output, Renderer, ElementRef, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import {Control} from '@angular/common';
import {UniFieldLayout} from '../interfaces';
declare var _; // jquery and lodash

@Component({
    selector: 'uni-button-input',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <button
            *ngIf="control"
            [disabled]="field?.ReadOnly"
            (click)="clickHandler($event)"
        >{{field.Label}}</button>
    `
})
export class UniButtonInput {
    @Input()
    public field: UniFieldLayout;

    @Input()
    public model: any;

    @Input()
    public control: Control;

    @Output()
    public onReady: EventEmitter<UniButtonInput> = new EventEmitter<UniButtonInput>(true);
    
    @Output()
    public onChange: EventEmitter<any> = new EventEmitter<any>(true);
    
    private lastControlValue: string;
    
    constructor(public renderer: Renderer, public elementRef: ElementRef, private cd: ChangeDetectorRef) {
    }

    public focus() {
        this.renderer.invokeElementMethod(this.elementRef.nativeElement, 'focus', []);
        this.cd.markForCheck();
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
        this.cd.markForCheck();
    }

    public ngAfterViewInit() {
        this.onReady.emit(this);
    }
    
    private clickHandler(event) {
        this.field.Options.click(event);
    }
}