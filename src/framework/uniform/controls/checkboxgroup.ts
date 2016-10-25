import {Component, Input, Output, ElementRef, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import {FormControl} from '@angular/forms';
import {UniFieldLayout} from '../interfaces';
declare var _; // jquery and lodash

@Component({
    selector: 'uni-checkboxgroup-input',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <template ngFor let-item [ngForOf]="items" let-i="index">
            <input
                #rd
                type="checkbox"
                [readonly]="field?.ReadOnly"
                [placeholder]="field?.Placeholder || ''"
                [checked]="isChecked(item)"
                [value]="getValue(item)"
                [name]="getValue(item)"
                (focus)="focusHandler()"
            />
            <label (click)="checkIt(item)">{{getLabel(item)}}</label>
        </template>
    `
})
export class UniCheckboxgroupInput {
    @Input()
    public field: UniFieldLayout;

    @Input()
    public model: any;

    @Input()
    public control: FormControl;

    @Output()
    public readyEvent: EventEmitter<UniCheckboxgroupInput> = new EventEmitter<UniCheckboxgroupInput>(true);
    
    @Output()
    public changeEvent: EventEmitter<any> = new EventEmitter<any>(true);

    @Output()
    public focusEvent: EventEmitter<UniCheckboxgroupInput> = new EventEmitter<UniCheckboxgroupInput>(true);

    private items: any[] = [];
    private selectedItems: any[] = [];
    constructor(public elementRef: ElementRef, private cd: ChangeDetectorRef) {
    }

    public focus() {
        this.elementRef.nativeElement.focus();
        return this;
    }

    public focusHandler() {
        this.focusEvent.emit(this);
    }

    public readMode() {
        this.field.ReadOnly = true;
        this.cd.markForCheck();
    }

    public editMode() {
        this.field.ReadOnly = false;
        this.cd.markForCheck();
    }

    public ngAfterViewInit() {
        this.readyEvent.emit(this);
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
        var itemValue = _.get(item, this.field.Options.valueProperty);
        if (this.isChecked(item)) {
            _.set(this.model, this.field.Property, null);
            this.changeEvent.emit(this.model);
            return;
        }
        _.set(this.model, this.field.Property, itemValue);
        this.changeEvent.emit(this.model);
    }
    
    public isChecked(item) {
        var itemValue = _.get(item, this.field.Options.valueProperty);
        var modelValue = _.get(this.model, this.field.Property);
        return itemValue === modelValue; 
    }
}
