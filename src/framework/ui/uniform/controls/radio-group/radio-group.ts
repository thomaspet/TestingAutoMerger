import {
    Component, Input, Output, ElementRef, EventEmitter, ChangeDetectionStrategy, SimpleChanges,
    OnChanges
} from '@angular/core';
import {FormControl} from '@angular/forms';
import {UniFieldLayout} from '../../interfaces';
import {BaseControl} from '../baseControl';
import * as _ from 'lodash';

@Component({
    selector: 'uni-radiogroup-input',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './radio-group.html'
})
export class UniRadiogroupInput extends BaseControl implements OnChanges {
    @Input() public field: UniFieldLayout;
    @Input() public model: any;
    @Input() public control: FormControl;
    @Input() public asideGuid: string;

    @Output() public readyEvent: EventEmitter<UniRadiogroupInput> = new EventEmitter<UniRadiogroupInput>(true);
    @Output() public changeEvent: EventEmitter<SimpleChanges> = new EventEmitter<SimpleChanges>();
    @Output() public inputEvent: EventEmitter<SimpleChanges> = new EventEmitter<SimpleChanges>();
    @Output() public focusEvent: EventEmitter<UniRadiogroupInput> = new EventEmitter<UniRadiogroupInput>(true);

    public items: any[] = [];
    public initValue: any;

    constructor(public elementRef: ElementRef) {
        super();
    }

    public focus() {
        this.elementRef.nativeElement.focus();
        return this;
    }

    public ngOnChanges(changes) {
        if (changes['field']) {
            this.readOnly$.next(this.field.ReadOnly);
            if (!this.field.Options) {
                this.items = [];
            } else if (!this.field.Options.source) {
                this.items = [];
            } else if (this.field.Options.source.constructor === Array) {
                this.items = this.field.Options.source;
            } else if (this.field.Options.source.subscribe) {
                this.field.Options.souce.subscribe(items => this.items = items);
            } else if (typeof this.field.Options.source === 'string') {
                // TODO: manage lookup url;
            }
        }

        if (this.field && this.model) {
            this.initValue = _.get(this.model, this.field.Property);
        }
    }

    public onChange(event) {
        const previousValue = _.get(this.model, this.field.Property);

        _.set(this.model, this.field.Property, event.value);

        this.emitChange(previousValue, event.value);
        this.emitInstantChange(previousValue, event.value, true);
    }

    public getRadioButtonValue(item) {
        return _.get(item, this.field.Options.valueProperty);
    }
    public getRadioButtonLabel(item) {
        return _.get(item, this.field.Options.labelProperty);
    }

    public isChecked(item) {
        const itemValue = _.get(item, this.field.Options.valueProperty);
        const modelValue = _.get(this.model, this.field.Property);
        return itemValue === modelValue;
    }
}
