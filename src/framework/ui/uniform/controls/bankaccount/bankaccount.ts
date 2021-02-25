import {
    Component, Input, Output, EventEmitter,
    ChangeDetectionStrategy, SimpleChanges,
    OnChanges, SimpleChange
} from '@angular/core';
import {UniFieldLayout} from '../../interfaces';
import {set, get} from 'lodash';
import { NumberFormat } from '@app/services/common/numberFormatService';


@Component({
    selector: 'uni-bankaccount-input',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './bankaccount.html'
})
export class UniBankAccountInput implements OnChanges {
    @Input() public field: UniFieldLayout;
    @Input() public model: any;
    @Input() public asideGuid: string;

    @Output() public changeEvent: EventEmitter<SimpleChanges> = new EventEmitter<SimpleChanges>();

    modelValue: string;
    inputValue: string;
    readOnly: boolean;

    constructor(private numberFormat: NumberFormat) {}

    ngOnChanges(changes) {
        if (changes['model'] || changes['field']) {
            this.modelValue = get(this.model, this.field.Property); // import {get} from 'lodash';
            this.inputValue = this.format(this.modelValue);
            this.readOnly = this.field.ReadOnly;
        }
    }

    onBlur() {
        this.readOnly = this.field.ReadOnly;

        const newValue = this.parse(this.inputValue);

        if (newValue !== this.modelValue) {
            set(this.model, this.field.Property, newValue);
            const changes = {
                [this.field.Property]: new SimpleChange(this.modelValue, newValue, false)
            };
            this.changeEvent.next(changes);
        }

        this.modelValue = get(this.model, this.field.Property);
        const format = this.format(this.modelValue)
        
        if (format !== this.inputValue) {
            this.inputValue = format;
        }
    }

    format(value: string): string {
        return this.numberFormat.asBankAcct(value);
    }

    parse(value: string): string {
        return value.replace(/[\s.-]/g, '');
    }
}
