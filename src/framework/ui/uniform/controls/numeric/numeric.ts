import {
    Component, Input, Output, ElementRef, EventEmitter, ChangeDetectionStrategy, SimpleChanges,
    OnChanges
} from '@angular/core';
import {FormControl} from '@angular/forms';
import {UniFieldLayout} from '../../interfaces';
import {BaseControl} from '../baseControl';
import {NumberFormat} from '@app/services/common/numberFormatService';
import {CompanySettingsService} from '@app/services/common/companySettingsService';
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
    templateUrl: './numeric.html'
})
export class UniNumericInput extends BaseControl implements OnChanges {
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

    private settingsDecimalLength: number;

    constructor(
        private elementRef: ElementRef,
        private numberFormatter: NumberFormat,
        private companySettingsService: CompanySettingsService
    ) {
        super();
        this.companySettingsService.Get(1).subscribe(settings => {
            this.settingsDecimalLength = settings.ShowNumberOfDecimals;
            this.initOptions();
        });
    }

    public ngOnChanges(changes) {
        this.createControl();
        this.lastControlValue = this.control.value;

        if (this.controlSubscription) {
            this.controlSubscription.unsubscribe();
        }

        this.controlSubscription = this.control.valueChanges.subscribe(value => {
            const parsed = this._parseValue(value);
            if (this.control.dirty) {
                this.emitInstantChange(this.lastControlValue, parsed, !isNaN(parsed));
            }
        });

        if (changes.field && this.field) {
            this.initOptions();
        }

        if (this.elementRef && document.activeElement !== this.elementRef.nativeElement) {
            this.control.setValue(this.format(this.control.value));
        }
    }

    public focus() {
        this.elementRef.nativeElement.children[0].focus();
        this.elementRef.nativeElement.children[0].select();
        return this;
    }

    public blurHandler() {
        if (this.control.dirty) {
            const previousValue = _.get(this.model, this.field.Property);
            const newValue = this._parseValue(this.control.value);

            _.set(this.model, this.field.Property, newValue);
            this.emitChange(previousValue, newValue);

            this.control.setValue(this.format(newValue));
            this.control.markAsPristine();
        }
    }

    public focusHandler() {
        this.focusEvent.emit(this);
    }

    private initOptions() {
        const fieldOptions = (this.field && this.field.Options) || {};

        const options = {
            format: fieldOptions.format,
            thousandSeparator: fieldOptions.thousandSeparator || ' ',
            decimalSeparator: fieldOptions.decimalSeparator || ',',
            decimalLength: fieldOptions.decimalLength || 0
        };

        if (this.settingsDecimalLength && options.format === 'money') {
            options.decimalLength = this.settingsDecimalLength;
        }

        this.options = options;
    }

    private format(value: number): string {
        if (!value || this.options.format === 'none') {
            return;
        }

        const decimals = value.toString().split('.')[1];
        let formatNumberOfDecimals = this.options.decimalLength;
        let formatThousandSeparator = this.options.thousandSeparator;

        if (this.options.format === 'money') {
            // On format 'money' we dont want to force fewer decimals, only fill with 0s if
            // number of decimals is less than the defined number in companySettings.
            // This is to avoid confusion with sums etc that could arise if the actual number
            // contained more decimals than our format settings would display.
            if (decimals && decimals.length > this.options.decimalLength) {
                formatNumberOfDecimals = decimals.length;
            }
        }

        if (this.options.format === 'integer') {
            formatThousandSeparator = '';
            formatNumberOfDecimals = 0;
        }

        const parsed = this._parseValue((value || '').toString());
        let formatted = this.numberFormatter.asNumber(parsed, {
            decimalLength: formatNumberOfDecimals,
            // thousandSeparator: this.options.thousandSeparator,
            thousandSeparator: formatThousandSeparator
        });

        if (this.options.format === 'percent') {
            formatted = formatted + '%';
        }

        return formatted;
    }

    private _parseValue(value): number {
        if (_.isNumber(value)) {
            return value;
        }

        if (value === null || value === undefined) {
            return null;
        }

        if (this.options.thousandSeparator) {
            value = value.replace(this.options.thousandSeparator, '');
        }

        value = value.replace(' ', '');
        value = value.replace(',', '.');

        const parsed = parseFloat(value);
        return isNaN(parsed) ? null : parsed;
    }
}
