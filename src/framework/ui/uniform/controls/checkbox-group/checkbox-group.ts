import {
    Component, Input, Output, ElementRef, EventEmitter,
    ChangeDetectionStrategy, SimpleChanges, OnChanges
} from '@angular/core';
import {FormControl} from '@angular/forms';
import {UniFieldLayout} from '../../interfaces';
import {BaseControl} from '../baseControl';
import * as _ from 'lodash';

@Component({
    selector: 'uni-checkboxgroup-input',
    templateUrl: './checkbox-group.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UniCheckboxgroupInput extends BaseControl implements OnChanges {
    @Input() public field: UniFieldLayout;
    @Input() public model: any;
    @Input() public control: FormControl;
    @Input() public asideGuid: string;

    @Output() public readyEvent: EventEmitter<UniCheckboxgroupInput> = new EventEmitter<UniCheckboxgroupInput>(true);
    @Output() public changeEvent: EventEmitter<SimpleChanges> = new EventEmitter<SimpleChanges>();
    @Output() public inputEvent: EventEmitter<SimpleChanges> = new EventEmitter<SimpleChanges>();
    @Output() public focusEvent: EventEmitter<UniCheckboxgroupInput> = new EventEmitter<UniCheckboxgroupInput>(true);


    private items: any[] = [];
    private selectedItems: any[] = [];

    constructor(public elementRef: ElementRef) {
        super();
    }

    public focus() {
        this.elementRef.nativeElement.focus();
        return this;
    }

    public ngOnChanges(changes) {
        if (changes['field']) {
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
            this.readOnly$.next(this.field.ReadOnly);
        }

        if (this.model && this.field) {
            this.selectedItems = _.get(this.model, this.field.Property, []);
        }
    }

    public getValue(item) {
        return _.get(item, this.field.Options.valueProperty);
    }
    public getLabel(item) {
        return _.get(item, this.field.Options.labelProperty);
    }

    public toggleCheckbox(item) {
        if (this.field.ReadOnly) {
            return;
        }

        const wasChecked = this.isChecked(item);

        const itemValue = _.get(item, this.field.Options.valueProperty);
        const previousValue = _.cloneDeep(_.get(this.model, this.field.Property));

        if (wasChecked) {
            const index = this.selectedItems.indexOf(itemValue);
            this.selectedItems.splice(index, 1);
            _.set(this.model, this.field.Property, this.selectedItems);
        } else {
            this.selectedItems.push(itemValue);
            _.set(this.model, this.field.Property, [...this.selectedItems]);
        }

        this.emitChange(previousValue, this.selectedItems);
        this.emitInstantChange(previousValue, this.selectedItems, true);
    }

    public isChecked(item) {
        const itemValue = _.get(item, this.field.Options.valueProperty);
        return this.selectedItems.indexOf(itemValue) >= 0;
    }
}
