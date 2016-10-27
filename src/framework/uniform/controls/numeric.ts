import {Component, Input, Output, ElementRef, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import {FormControl} from '@angular/forms';
import {UniFieldLayout} from '../interfaces';
declare var _, accounting; // jquery and lodash

export interface INumberOptions {
    format?: string;
    decimalLength?: number;
    thousandSeparator?: string;
    decimalSeparator?: string;
}

@Component({
    selector: 'uni-numeric-input',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <input #inputElement
            *ngIf="control"
            type="text"
            [formControl]="control"
            [readonly]="field?.ReadOnly"
            [placeholder]="field?.Placeholder || ''"

            (blur)="blurHandler($event)"
            (focus)="focusHandler($event)"
        />
    `
})
export class UniNumericInput {
    @Input()
    public field: UniFieldLayout;

    @Input()
    public model: any;

    @Input()
    public control: FormControl;

    @Output()
    public readyEvent: EventEmitter<UniNumericInput> = new EventEmitter<UniNumericInput>(true);

    @Output()
    public changeEvent: EventEmitter<UniNumericInput> = new EventEmitter<UniNumericInput>(true);

    @Output()
    public focusEvent: EventEmitter<UniNumericInput> = new EventEmitter<UniNumericInput>(true);

    private lastControlValue: string;
    private options: INumberOptions;

    constructor(private elementRef: ElementRef, private cd: ChangeDetectorRef) {

    }

    public ngOnChanges(changes) {
        this.lastControlValue = this.control.value;

        if (changes.field && this.field) {
            this.initOptions(this.field.Options || {});
        }

        if (this.elementRef && document.activeElement !== this.elementRef.nativeElement) {
            this.formatControlValue();
        }
    }

    public ngAfterViewInit() {
        this.readyEvent.emit(this);
    }

    public focus() {
        this.elementRef.nativeElement.children[0].focus();
        this.elementRef.nativeElement.children[0].select();
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

    private initOptions(fieldOptions: INumberOptions) {
        // Should we get default values from locale?
        let options = {
            format: fieldOptions.format,
            thousandSeparator: fieldOptions.thousandSeparator || ' ',
            decimalSeparator: fieldOptions.decimalSeparator || ',',
            decimalLength: fieldOptions.decimalLength
        };

        if (!options.decimalLength && fieldOptions.format === 'money') {
            options.decimalLength = 2;
        }

        this.options = options;
    }

    private formatControlValue() {
        if (!this.control.value) {
            return;
        }

        let value = this.control.value;

        if (this.options.decimalLength) {
            value = parseFloat(value).toFixed(this.options.decimalLength);
        }

        let [integer, decimal] = value.toString().split('.');
        integer = integer.replace(/\B(?=(\d{3})+(?!\d))/g, this.options.thousandSeparator);

        value = decimal ? (integer + this.options.decimalSeparator + decimal) : integer;
        if (this.options.format === 'percent') {
            value += '%';
        }

        this.control.setValue(value);
    }

    private unFormatControlValue() {
        if (!this.control.value) {
            return;
        }

        let unformatted = this.control.value.toString().replace(/[% ]/g, '');
        let valueParts = unformatted.split(/[.,]/g);
        if (valueParts.length > 1) {
            const decimal = valueParts.pop();
            unformatted = valueParts.join('') + this.options.decimalSeparator + decimal;
        }

        this.control.setValue(unformatted);
    }

    private getParsedValue(): number {
        let value = this.control.value || '';
        return parseFloat(value.replace(',', '.')) || null;
    }

    private blurHandler() {
        if (this.lastControlValue !== this.control.value) {
            this.unFormatControlValue();

            if (this.control.valid) {
                _.set(this.model, this.field.Property, this.getParsedValue());
                this.changeEvent.emit(this.model);
                this.lastControlValue = this.control.value;
            }
        }

        this.formatControlValue();
    }

    private focusHandler() {
        this.focusEvent.emit(this);
        this.unFormatControlValue();
    }
}
