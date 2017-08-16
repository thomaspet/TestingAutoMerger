import {Component, Input, Output, ElementRef, EventEmitter, ChangeDetectionStrategy, SimpleChanges} from '@angular/core';
import {FormControl} from '@angular/forms';
import {UniFieldLayout} from '../interfaces';
import {BaseControl} from './baseControl';
import * as _ from 'lodash';

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
            [attr.aria-describedby]="asideGuid"
            type="text"
            [formControl]="control"
            [readonly]="readOnly$ | async"
            [placeholder]="field?.Placeholder || ''" 
            [title]="control?.value || ''"
            (blur)="blurHandler($event)"
            (focus)="focusHandler($event)"
        />
        <ng-content></ng-content>
    `
})
export class UniNumericInput extends BaseControl {
    @Input() public field: UniFieldLayout;
    @Input() public model: any;
    @Input() public control: FormControl;
    @Input() public asideGuid: string;

    @Output() public readyEvent: EventEmitter<UniNumericInput> = new EventEmitter<UniNumericInput>(true);
    @Output() public changeEvent: EventEmitter<SimpleChanges> = new EventEmitter<SimpleChanges>();
    @Output() public inputEvent: EventEmitter<SimpleChanges> = new EventEmitter<SimpleChanges>();
    @Output() public focusEvent: EventEmitter<UniNumericInput> = new EventEmitter<UniNumericInput>(true);

    private lastControlValue: string;
    private options: INumberOptions;

    constructor(private elementRef: ElementRef) {
        super();
    }

    public ngOnChanges(changes) {
        this.createControl();
        this.lastControlValue = this.control.value;
        if (this.controlSubscription) {
            this.controlSubscription.unsubscribe();
        }
        this.controlSubscription = this.control.valueChanges.subscribe(() => {
            if (this._parseValue(this.lastControlValue) !== this.getParsedValue()) {
                this.emitInstantChange(this.lastControlValue, this.getParsedValue(), isNaN(this.getParsedValue()));
            }
        });
        if (changes.field && this.field) {
            this.initOptions(this.field.Options || {});
        }

        if (this.elementRef && document.activeElement !== this.elementRef.nativeElement) {
            this.formatControlValue();
        }
    }

    public focus() {
        this.elementRef.nativeElement.children[0].focus();
        this.elementRef.nativeElement.children[0].select();
        return this;
    }

    public blurHandler() {
        if (this.lastControlValue !== this.control.value) {
            this.unFormatControlValue();

            if (this.control.valid) {
                const value = _.get(this.model, this.field.Property);
                const parsedValue = this.getParsedValue();
                if (value !== parsedValue) {
                    _.set(this.model, this.field.Property, parsedValue);
                    this.emitChange(value, parsedValue);
                    this.lastControlValue = this.control.value;
                }
            }
        }

        this.formatControlValue();
    }

    public focusHandler() {
        this.focusEvent.emit(this);
        this.unFormatControlValue();
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

    private justOneMinusSign(value) {
        let negative = false;
        if (value[0] === '-') {
            negative = true;
        }
        value = value.toString().replace(new RegExp('-', 'g'), '');
        return negative ? '-'.concat(value) : value;
    }

    private getDecimalSeparator(value) {
        let result = this.options.decimalSeparator || ',';
        let indexDot = -1;
        let indexComma = -1;
        for (let i = value.length - 1; i > 0; i--) {
            if (value[i] === '.' && indexDot === -1) {
                indexDot = i;
            }
            if (value[i] === ',' && indexComma === -1) {
                indexComma = i;
            }
        }
        if (indexDot > indexComma && indexDot !== -1) {
            return '.';
        }
        if (indexComma > indexDot && indexComma !== -1) {
            return ',';
        }
        return result;
    }

    private cleanNumber(value, decimalSeparator) {
        let oneDecimal = false;
        let result = '';
        for (let i = value.length - 1; i >= 0; i--) {
            if (value[i] === decimalSeparator && !oneDecimal) {
                oneDecimal = true;
                result = value[i] + result;
            } else {
                if (value[i] === decimalSeparator && oneDecimal) {
                    continue;
                } else {
                    if ((value[i] >= 0 && value[i] <= 9) || value[i] === '-') {
                        result = value[i] + result;
                    }
                }
            }
        }
        return result;
    }

    private addThousandSeparator(value, thousandSeparator, decimalSeparator) {
        let parts = value.split(decimalSeparator);
        let integerPart = '';
        for (let i = parts[0].length - 1, j = 1; i >= 0; i--) {
            if (j % 3 === 0 && parts[0].length > 3) {
                integerPart = thousandSeparator + parts[0][i] + integerPart;
            } else {
                integerPart = parts[0][i] + integerPart;
            }
            j++;
        }
        if (!parts[1]) {
            parts[1] = '';
        } else {
            parts[1] = decimalSeparator + parts[1];
        }
        return integerPart + parts[1];
    }

    private removeThousandSeparator(value, thousandSeparator) {
        let result = '';
        for (let i = 0; i < value.length; i++) {
            if (value[i] !== thousandSeparator) {
                result =  result + value[i];
            }
        }
        return result;
    }

    private formatControlValue() {
        if (!this.control.value || this.options.format === 'none') {
            return;
        }
        let value = this.control.value + '' || '';
        value = this.justOneMinusSign(value);
        let decimalSeparator = this.getDecimalSeparator(value);
        if (decimalSeparator === this.options.thousandSeparator) {
            decimalSeparator = this.options.decimalSeparator;
        }
        value = this.cleanNumber(value, decimalSeparator);
        if (this.options.format === 'percent') {
            value = value + '%';
        }
        if (this.options.decimalLength === undefined) {
            this.options.decimalLength = 0;
        }
        if (this.options.format === 'money') {
            this.options.decimalLength = 2;
        }
        value = value.replace(this.options.decimalSeparator, '.');
        value = this.round(value, this.options.decimalLength).toString();
        value = this.addThousandSeparator(value + '', this.options.thousandSeparator, '.');
        value = value.replace('.', this.options.decimalSeparator);
        this.control.setValue(value);
    }

    private unFormatControlValue() {
        let value = this.control.value + '' || '';
        let result = '';
        let negative = false;
        if  (value[0] === '-') {
            negative = true;
        }
        value = this.removeThousandSeparator(value, this.options.thousandSeparator);
        let decimalSeparator = this.getDecimalSeparator(value);
        for(let i = 0; i < value.length; i++) {
            let integer = value[i] >= '0' && value[i] <= '9';
            let hasDecimalSeparator = value[i] === decimalSeparator;
            if (integer || hasDecimalSeparator) {
                result += value[i];
            }
        }
        // result = result.replace(decimalSeparator, '.');
        if (negative) {
            result = '-'.concat(result);
        }
        this.control.setValue(result);
    }

    public round(value: number | string, decimals = 2) {
        return Number(Math.round(Number.parseFloat(value + 'e' + decimals)) + 'e-' + decimals);
    }

    private getParsedValue(): number {
        let value = this.control.value || '';
        return this._parseValue(value);
    }

    private _parseValue(value): number {
        if (_.isNumber(value)) {
            return value;
        }
        if (value === null || value === undefined) {
            return null;
        }
        value = this.removeThousandSeparator(value, this.options.thousandSeparator);
        let parsedValue = this.round(value.replace(',', '.'), this.options.decimalLength);
        if (isNaN(parsedValue)) {
            return null;
        }
        return parsedValue;
    }
}
