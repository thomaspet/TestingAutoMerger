import {
    ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, OnChanges, Output, SimpleChanges,
    ViewChild, ViewEncapsulation
} from '@angular/core';
import { BaseControl } from '@uni-framework/ui/uniform/controls/baseControl';
import { UniFieldLayout } from '@uni-framework/ui/uniform/interfaces/uni-field-layout.interface';
import { FormControl } from '@angular/forms';
import * as _ from 'lodash';
import { NgSelectComponent } from '@ng-select/ng-select';
import { Observable } from 'rxjs/Observable';
import { allSettled } from 'q';

@Component({
    selector: 'uni-multi-select-input',
    templateUrl: './multiselect.html',
    styles: [`
        .ng-select .ng-select-container { border-radius: 0; min-height: inherit; }
        .ng-select input[type=text] { height: 100%; padding: 0; margin: 0; }
        .ng-select.ng-select-multiple .ng-select-container .ng-value-container { max-width: 88% }
        .ng-select.ng-select-multiple .ng-select-container .ng-value-container .ng-value { max-width: 95%; overflow: hidden; text-overflow: ellipsis; }
        .ng-select.ng-select-multiple .ng-select-container .ng-value-container .ng-input { padding: 0; }
        .ng-select input[type=checkbox] { width: auto; margin-right: 0.1rem }
    `],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UniMultiSelectInput  extends BaseControl implements OnChanges {
    @Input() public field: UniFieldLayout;
    @Input() public model: any;
    @Input() public control: FormControl;
    @Input() public asideGuid: string;

    @Output() public readyEvent: EventEmitter<any> = new EventEmitter<any>(true);
    @Output() public changeEvent: EventEmitter<SimpleChanges> = new EventEmitter<SimpleChanges>();
    @Output() public inputEvent: EventEmitter<SimpleChanges> = new EventEmitter<SimpleChanges>();
    @Output() public focusEvent: EventEmitter<any> = new EventEmitter<any>(true);


    @ViewChild('input') private inputElement: NgSelectComponent;

    private lastControlValue: any;
    public tempModel: Array<any> = [];
    private allSelected = false;
    public items: any;
    constructor() {
        super();
    }

    public focus() {
        this.inputElement.focus();
    }

    public ngOnChanges() {
        if (!this.field.Options) {
            this.control = new FormControl([]);
            return;
        }
        let source: Observable<any>;
        if (this.field.Options.source.subscribe) {
            source = this.field.Options.source;
        } else {
            source = Observable.of(this.field.Options.source);
        }

        source.subscribe(x => {
            this.items = x;
            let initialObjects;
            if (this.field.Options.ModelToOptions) {
                initialObjects = this.field.Options.ModelToOptions(_.get(this.model, this.field.Property), this.field, this.items);
            } else {
                initialObjects = _.get(this.model, this.field.Property) || [];
            }

            const initialValue = initialObjects.map(y => y[this.field.Options.bindValue]);
            this.lastControlValue = <any>initialValue;
            this.control = new FormControl(initialValue);
            this.allSelected ? this.control.disable() : this.control.enable();
            this.readOnly$.next(this.field.ReadOnly);
        });
    }

    onChange(event) {
        this.emitChange(this.lastControlValue , event);
        this.emitInstantChange(this.lastControlValue , event);
        if (this.field.Options.OptionsToModel) {
            _.set(this.model, this.field.Property, this.field.Options.OptionsToModel(event, this.field, this.items));
        } else {
            _.set(this.model, this.field.Property, event);
        }
        this.lastControlValue = event;
    }

    toggleSelectAll($event) {
        this.allSelected = $event.checked;
        this.allSelected ? this.control.disable() : this.control.enable();
        if (this.allSelected) {
            this.emitChange(this.lastControlValue, this.field.Options.allValue || '*');
            this.emitInstantChange(this.lastControlValue, this.field.Options.allValue || '*');
            _.set(this.model, this.field.Property, this.field.Options.allValue || '*');
            this.control.setValue([]);
            this.lastControlValue = [];
        } else {
            this.emitChange(this.field.Options.allValue || '*', '');
            this.emitInstantChange(this.field.Options.allValue || '*', '');
            _.set(this.model, this.field.Property, '');
            this.control.setValue([]);
            this.lastControlValue = [];
        }
    }
    // onOpen(event) { console.log('onOpen', event); }
    // onClose(event) { console.log('onClose', event); }
    // onClear(event) { console.log('onClear', event); }
    // onAdd(event) { console.log('onAdd', event); }
    // onRemove(event) { console.log('onRemove', event); }
    // onNgModelChange() { console.log('onNgModelChange', this.tempModel); }
}
