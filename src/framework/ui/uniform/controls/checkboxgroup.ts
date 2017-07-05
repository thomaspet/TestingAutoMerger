import {
    Component, Input, Output, ElementRef, EventEmitter,
    ChangeDetectionStrategy, SimpleChanges
} from '@angular/core';
import {FormControl} from '@angular/forms';
import {UniFieldLayout} from '../interfaces';
import {BaseControl} from './baseControl';
import * as _ from 'lodash';


export interface ICheckboxgroupConfig {
    source: any;
    valueProperty: string;
    labelProperty: string;
    multivalue: boolean;
}

@Component({
    selector: 'uni-checkboxgroup-input',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <ng-template ngFor let-item [ngForOf]="items" let-i="index">
            <input
                #rd
                [attr.aria-describedby]="asideGuid"
                type="checkbox"
                [readonly]="readOnly$ | async"
                [placeholder]="field?.Placeholder || ''"
                [checked]="isChecked(item)"
                [value]="getValue(item)"
                [name]="getValue(item)"
                (focus)="focusHandler()"
            />
            <label (click)="checkIt(item)">{{getLabel(item)}}</label>
            <ng-content></ng-content>
        </ng-template>
    `
})
export class UniCheckboxgroupInput extends BaseControl {
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
            this.selectedItems = _.get(this.model, this.field.Property, []);
        }
    }

    public getValue(item) {
        return _.get(item, this.field.Options.valueProperty);
    }
    public getLabel(item) {
        return _.get(item, this.field.Options.labelProperty);
    }

    public checkIt(item) {
        const itemValue = _.get(item, this.field.Options.valueProperty);
        if (!this.isChecked(item)) {
            if (this.field.Options.multivalue !== false) {
                let previousValue = _.get(this.model, this.field.Property);
                this.selectedItems.push(itemValue);
                _.set(this.model, this.field.Property, [...this.selectedItems]);
                this.emitChange(previousValue, this.selectedItems);
                this.emitInstantChange(previousValue, this.selectedItems, true);
            } else {
                let previousValue = _.get(this.model, this.field.Property);
                _.set(this.model, this.field.Property, itemValue);
                this.emitChange(previousValue, itemValue);
                this.emitInstantChange(previousValue, itemValue, true);
            }
        } else {
            if (this.field.Options.multivalue !== false) {
                const index = this.selectedItems.indexOf(itemValue);
                let previousValue = [...this.selectedItems];
                this.selectedItems.splice(index, 1);
                _.set(this.model, this.field.Property, this.selectedItems);
                this.emitChange(previousValue, this.selectedItems);
                this.emitInstantChange(previousValue, this.selectedItems, true);
            } else {
                let previousValue = _.get(this.model, this.field.Property);
                _.set(this.model, this.field.Property, null);
                this.emitChange(previousValue, null);
                this.emitInstantChange(previousValue, null, true);
            }
        }
    }

    public isChecked(item) {
        const itemValue = _.get(item, this.field.Options.valueProperty);
        if (this.field.Options.multivalue !== false) {
            return this.selectedItems.indexOf(itemValue) >= 0;
        } else {
            const modelValue = _.get(this.model, this.field.Property);
            return itemValue === modelValue;
        }
    }
}
