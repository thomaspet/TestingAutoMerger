import {
    Component,
    Input,
    Output,
    ElementRef,
    EventEmitter,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    ViewChild,
    SimpleChanges, OnChanges
} from '@angular/core';
import {FormControl} from '@angular/forms';
import {UniFieldLayout} from '../../interfaces';
import {Observable} from 'rxjs';
import {UniSelect} from '../../../uni-select/select';
import {BaseControl} from '../baseControl';

import * as _ from 'lodash';


@Component({
    selector: 'uni-select-input',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './select-wrapper.html'
})
export class UniSelectInput extends BaseControl implements OnChanges {
    @Input() public field: UniFieldLayout;
    @Input() public model: any;
    @Input() public control: FormControl;
    @Input() public asideGuid: string;

    @Output() public readyEvent: EventEmitter<UniSelectInput> = new EventEmitter<UniSelectInput>(true);
    @Output() public changeEvent: EventEmitter<SimpleChanges> = new EventEmitter<SimpleChanges>();
    @Output() public inputEvent: EventEmitter<SimpleChanges> = new EventEmitter<SimpleChanges>();
    @Output() public focusEvent: EventEmitter<UniSelectInput> = new EventEmitter<UniSelectInput>();

    @ViewChild('uniselect', { static: true }) public uniSelect: UniSelect;

    public items: any[];
    public selectedItem: any;

    constructor(public elementRef: ElementRef, private cd: ChangeDetectorRef) {
        super();
    }

    public focus() {
        this.uniSelect.focus();
        this.uniSelect.select();
        this.focusEvent.emit(this);
        return this;
    }

    public ngOnChanges(changes) {
        this.readOnly$.next(this.field.ReadOnly);
        if (this.asideGuid) {
            if (!this.field.Options) {
                this.field.Options = {};
            }
            this.field.Options.asideGuid = this.asideGuid;
        }
        if (this.model && this.field) {
            this.selectedItem = _.get(this.model, this.field.Property);
        }

        if (changes['field']) {
            if (!this.field.Options) {
                this.items = [];
            } else if (!this.field.Options.source) {
                this.items = [];
            } else if (this.field.Options.source.constructor === Array) {
                this.items = this.addEmptyValue(this.field.Options.source);
            } else if (this.field.Options.source.subscribe) {
                this.field.Options.source.subscribe(items => {
                    this.items = this.addEmptyValue(items);
                    this.cd.markForCheck();
                });
            } else if (typeof this.field.Options.source === 'string') {
                // TODO: manage lookup url;
            }
        }
    }

    public createFocusListener(component: UniSelect) {
        const self = this;
        if (component.valueInput) {
            Observable.fromEvent(component.valueInput.nativeElement, 'focus').subscribe(() => {
                self.focusEvent.emit(self);
            });
        }
    }

    public onChange(item) {
        let value;
        if (this.field.Options.valueProperty) {
            value = _.get(item, this.field.Options.valueProperty);
        }
        const valueIsDefined = (value !== null && value !== undefined);
        const previousValue = _.get(this.model, this.field.Property);
        const currentValue = valueIsDefined ? value : item;

        if (previousValue === currentValue) {
            return;
        }
        this.selectedItem = currentValue;
        _.set(this.model, this.field.Property, currentValue);
        this.emitChange(previousValue, currentValue);
        this.emitInstantChange(previousValue, currentValue, true);
    }

    public addEmptyValue(source: any[]): any[] {
        if (this.field.Options && !this.field.Options.addEmptyValue) {
            return [].concat(source);
        }
        return [].concat(null, source);
    }
}
