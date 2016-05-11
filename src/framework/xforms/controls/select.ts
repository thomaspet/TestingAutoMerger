import {Component, Input, Output, ElementRef, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import {Control} from '@angular/common';
import {FieldLayout} from '../../../app/unientities';
declare var _; // jquery and lodash

@Component({
    selector: 'uni-select-input',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <select [readonly]="field?.ReadOnly" (change)="onChangeHandler($event)">
            <option *ngFor="let item of items" [value]="getValue(item)">
                {{template(item)}}
            </option>
        </select>
    `
})
export class UniSelectInput {
    @Input()
    public field: FieldLayout;

    @Input()
    public model: any;

    @Input()
    public control: Control;

    @Output()
    public onReady: EventEmitter<UniSelectInput> = new EventEmitter<UniSelectInput>(true);

    @Output()
    public onChange: EventEmitter<any> = new EventEmitter<any>(true);

    private items: any[];

    constructor(public elementRef: ElementRef, private cd: ChangeDetectorRef) {
    }

    public focus() {
        this.elementRef.nativeElement.children[0].focus();
        return this;
    }

    public readMode() {
        this.field.ReadOnly = true;
        this.cd.markForCheck();
    }

    public editMode() {
        this.field.ReadOnly = false;
        this.cd.markForCheck();
    }

    public ngOnChanges() {
        if (this.field.Options.source.constructor === Array) {
            this.items = this.field.Options.source;
        } else if (this.field.Options.source.subscribe) {
            this.field.Options.souce.subscribe(items => this.items = items);
        } else if (typeof this.field.Optons.source === 'string') {
            // TODO: manage lookup url;
        }
    }

    public ngAfterViewInit() {
        this.onReady.emit(this);
    }

    private onChangeHandler($event) {
        _.set(this.model, this.field.Property, $event.target.value);
        this.onChange.emit(this.model);
    }

    private template(item) {
        if (this.field.Options.template) {
            return this.field.Options.template(item);
        }
        return item;
    }

    private getValue(item) {
        if (this.field.Options.getValue) {
            return this.field.Options.getValue(item);
        }
        return item;
    }
}