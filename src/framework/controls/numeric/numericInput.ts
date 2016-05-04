import {Component, Input, Output, ElementRef, EventEmitter} from 'angular2/core';
import {Control, FORM_DIRECTIVES} from 'angular2/common';
import {FieldLayout} from '../../../app/unientities';

declare var jQuery, accounting, _;

@Component({
    selector: 'uni-text',
    directives: [FORM_DIRECTIVES],
    template: `
        <input *ngIf="control"
            type="text"
            [ngFormControl]="control"
            [readonly]="field?.ReadOnly"
            (keydown)="validSymbol($event)"
            (blur)="formatNumber($event)"
            (focus)="unformatNumber($event)"
        />
    `
})
export class UniNumericInput {
    @Input()
    public control: Control;

    @Input()
    public field: FieldLayout;

    @Input()
    public model: any;

    @Output()
    public onReady: EventEmitter<any> = new EventEmitter<any>(true);
    public isReady: boolean = true;

    private options: any;

    get OnValueChanges() {
        return this.control.valueChanges;
    }

    get FormControl() {
        return this.control;
    }

    constructor(public elementRef: ElementRef) {
    }

    public setFocus() {
        jQuery(this.elementRef).focus();
        return this;
    }

    public editMode() {
        this.field.ReadOnly = false;
    }

    public readMode() {
        this.field.ReadOnly = true;
    }

    public ngAfterViewInit() {
        this.onReady.emit(this);
        this.isReady = true;
        if (this.field)  {
            this.setOptions();
        }
    }

    public ngOnChanges(changes) {
        if (changes['field']) {
            this.setOptions();
        }
    }

    private validSymbol(event: KeyboardEvent) {
        console.log(event);
        var code = event.which;
        var value: any = this.control.value + '';
        value = accounting.unformat(value.replace(',', '.'));
        switch (code) {
            case 37: // key left
                break;
            case 38: // key up
                event.preventDefault();
                value = value + this.options.step;
                this.control.updateValue(this.allowValue(value));
                break;
            case 39: // key key right
                break;
            case 40: // key down
                event.preventDefault();
                value = value - this.options.step;
                this.control.updateValue(this.allowValue(value));
                break;
        }
        // Allow: backspace, delete, tab, escape, enter, '-', and '.'
        if ($.inArray(event.keyCode, [45, 46, 8, 9, 27, 13, 110, 190]) !== -1 ||
            // Allow: Ctrl+A
            (event.keyCode === 65 && event.ctrlKey === true) ||
            // Allow: Ctrl+C
            (event.keyCode === 67 && event.ctrlKey === true) ||
            // Allow: Ctrl+X
            (event.keyCode === 88 && event.ctrlKey === true) ||
            // Allow: home, end, left, right
            (event.keyCode >= 35 && event.keyCode <= 39)) {
            // let it happen, don't do anything
            return;
        }
        // Ensure that it is a number and stop the keypress
        if ((event.shiftKey || (event.keyCode < 48 || event.keyCode > 57)) && (event.keyCode < 96 || event.keyCode > 105)) {
            event.preventDefault();
        }
    }

    private formatNumber(event) {
        var value;
        if (this.control.value) {
            value = this.control.value + ''; // force to be string
            value = value.replace(',', '.');
        }
        this.control.updateValue(accounting.formatMoney(value, '', 2, ' ', ','));
        _.set(this.model, this.field.Property, accounting.unformat(value));
    }

    private unformatNumber(event) {
        var value = this.control.value + ''; // force to be string;
        value = accounting.unformat(value.replace(',', '.'));
        this.control.updateValue(value);
    }

    private allowValue(value) {
        if (this.options.max < value) {
            return this.options.max;
        }
        if (this.options.min > value) {
            return this.options.min;
        }
        return value;
    }

    private setOptions() {
        this.options = this.field.Options || {};
        this.options.min = this.options.min || Number.MIN_SAFE_INTEGER;
        this.options.max = this.options.max || Number.MAX_SAFE_INTEGER;
        this.options.step = this.options.step || 1;
        this.options.thousands = this.options.thousands || ' ';
        this.options.decimal = this.options.decimal || '.';
        this.options.fixed = this.options.fixed || 2;
    }
}
