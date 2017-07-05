import {Component, Input, Output, ElementRef, EventEmitter, ChangeDetectionStrategy, SimpleChanges} from '@angular/core';
import {FormControl} from '@angular/forms';
import {UniFieldLayout} from '../interfaces';
import {BaseControl} from './baseControl';
import * as _ from 'lodash';

@Component({
    selector: 'uni-radiogroup-input',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <ng-template ngFor let-item [ngForOf]="items" let-i="index">
            <input
                #rd
                type="radio"
                [attr.aria-describedby]="asideGuid"
                [readonly]="readOnly$ | async"
                [placeholder]="field?.Placeholder || ''"
                [checked]="isChecked(item)"
                [value]="getValue(item)"
                [name]="field?.Property"
                (focus)="focusHandler()"
            />
            <label (click)="checkIt(item)">{{getLabel(item)}}</label>
        </ng-template>
        <ng-content></ng-content>
    `
})
export class UniRadiogroupInput extends BaseControl{
    @Input() public field: UniFieldLayout;
    @Input() public model: any;
    @Input() public control: FormControl;
    @Input() public asideGuid: string;

    @Output() public readyEvent: EventEmitter<UniRadiogroupInput> = new EventEmitter<UniRadiogroupInput>(true);
    @Output() public changeEvent: EventEmitter<SimpleChanges> = new EventEmitter<SimpleChanges>();
    @Output() public inputEvent: EventEmitter<SimpleChanges> = new EventEmitter<SimpleChanges>();
    @Output() public focusEvent: EventEmitter<UniRadiogroupInput> = new EventEmitter<UniRadiogroupInput>(true);

    private items: any[] = [];

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
        }
    }

    public getValue(item) {
        return _.get(item, this.field.Options.valueProperty);
    }
    public getLabel(item) {
        return _.get(item, this.field.Options.labelProperty);
    }

    public checkIt(item) {
        let previousValue = _.get(this.model, this.field.Property);
        let itemValue = _.get(item, this.field.Options.valueProperty);
        if (this.isChecked(item)) { // uncheck
            _.set(this.model, this.field.Property, null);
            this.emitChange(previousValue, null);
            this.emitInstantChange(previousValue, null, true);
            return;
        }
        _.set(this.model, this.field.Property, itemValue);
        this.emitChange(previousValue, itemValue);
        this.emitInstantChange(previousValue, itemValue, true);
    }

    public isChecked(item) {
        var itemValue = _.get(item, this.field.Options.valueProperty);
        var modelValue = _.get(this.model, this.field.Property);
        return itemValue === modelValue;
    }
}
