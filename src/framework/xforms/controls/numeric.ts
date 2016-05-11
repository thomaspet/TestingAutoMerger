import {Component, Input, Output, ElementRef, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import {Control} from '@angular/common';
import {FieldLayout} from '../../../app/unientities';

declare var jQuery, _, accounting; // jquery and lodash

@Component({
    selector: 'uni-numeric-input',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <input
            *ngIf="control"
            type="text"
            [ngFormControl]="control"
            [readonly]="field?.ReadOnly"
            (blur)="blurHandler($event)"
            (focus)="focusHandler($event)"
            (keyup)="keyUpHandler($event)"
            (keydown)="keyDownHandler($event)"
        />
    `
})
export class UniNumericInput {
    @Input()
    public field: FieldLayout;

    @Input()
    public model: any;

    @Input()
    public control: Control;

    @Output()
    public onReady: EventEmitter<UniNumericInput> = new EventEmitter<UniNumericInput>(true);

    @Output()
    public onChange: EventEmitter<UniNumericInput> = new EventEmitter<UniNumericInput>(true);

    constructor(public elementRef: ElementRef, private cd: ChangeDetectorRef) {
    }

    public focus() {
        jQuery(this.elementRef.nativeElement).focus();
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
        this.initOptions();
    }

    public ngAfterViewInit() {
        this.onReady.emit(this);
    }

    private initOptions() {
        this.field.Options = this.field.Options || {};
        this.field.Options.step = this.field.Options.step || 1;
        this.field.Options.thousands = this.field.Options.thousands || '';
        this.field.Options.decimals = this.field.Options.decimals || 0;
    }

    private keyDownHandler(event: KeyboardEvent) {
        if (!this.isAllowedKey(event.keyCode) && !this.isSpecialAction(event)) {
            event.preventDefault();
        }
    }

    private keyUpHandler(event: KeyboardEvent) {
        var value: number;
        if (this.isArrowDown(event.keyCode)) {
            value = +this.control.value;
            this.control.updateValue(value - this.field.Options.step);
        }
        if (this.isArrowUp(event.keyCode)) {
            value = +this.control.value;
            this.control.updateValue(value + this.field.Options.step);
        }
    }

    private isArrowUp(keycode: number): boolean {
        return keycode === 38;
    }

    private isArrowDown(keycode: number): boolean {
        return keycode === 40;
    }

    private isSpecialAction(e: KeyboardEvent) {
         var actions = 
            // Allow: Ctrl+A
            (e.keyCode === 65 && e.ctrlKey === true) ||
             // Allow: Ctrl+C
            (e.keyCode === 67 && e.ctrlKey === true) ||
            // Allow: Ctrl+V
            (e.keyCode === 86 && e.ctrlKey === true) ||
             // Allow: Ctrl+X
            (e.keyCode === 88 && e.ctrlKey === true);
         return actions;
    }

    private isAllowedKey(keycode: number): boolean {
        var isKeyBoardNumber = keycode >= 48 && keycode <= 57;
        var isNumericBoardNumber = keycode >= 96 && keycode <= 105;
        var isPoint = keycode === 190;
        var isMinus = keycode === 189 || keycode === 109;
        var arrows = [37, 38, 39, 40].indexOf(keycode) > -1;
        var special = [8, 13, 27, 16, 17, 18, 35, 36, 33, 34, 45, 46].indexOf(keycode) > -1;
        if (
            !isKeyBoardNumber
            && !isNumericBoardNumber
            && !isPoint
            && !isMinus
            && !arrows
            && !special
        ) {
            return false;
        }
        return true;
    }

    private blurHandler() {
        var options = this.field.Options;
        if (this.control.valid) {
            let value = accounting.unformat(this.control.value);
            let stringValue = accounting.formatNumber(value, options.decimals, options.thousands);
            this.control.updateValue(stringValue);
            _.set(this.model, this.field.Property, value);
            this.onChange.emit(this.model);
        } else {
            let stringValue = accounting.formatNumber(_.get(this.model, this.field.Property), options.decimals, options.thousands);
            this.control.updateValue(stringValue);
        }
    }

    private focusHandler() {
        if (this.control.value === undefined || this.control.value === '' || this.control.value === null) {
            return;
        }
        let value = accounting.unformat(this.control.value);
        this.control.updateValue(value);
    }
}
