import {
    Component,
    Input,
    Output,
    ElementRef,
    EventEmitter,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    ViewChild
} from '@angular/core';
import {FormControl} from '@angular/forms';
import {UniFieldLayout} from '../interfaces';
import {Observable} from 'rxjs/Observable';
import {UniSelect} from "./select/select";

declare var _; // jquery and lodash

@Component({
    selector: 'uni-select-input',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <uni-select #uniselect
            [config]="field?.Options"
            [items]="items"
            [value]="selectedItem"
            [newButtonAction]="field?.Options?.newButtonAction"
            (valueChange)="onChange($event)">
        </uni-select>
    `
})
export class UniSelectInput {
    @Input()
    public field: UniFieldLayout;

    @Input()
    public model: any;

    @Input()
    public control: FormControl;

    @Output()
    public readyEvent: EventEmitter<UniSelectInput> = new EventEmitter<UniSelectInput>(true);

    @Output()
    public changeEvent: EventEmitter<any> = new EventEmitter<any>(true);

    @Output()
    public focusEvent: EventEmitter<UniSelectInput> = new EventEmitter<UniSelectInput>();

    @ViewChild('uniselect')
    public uniSelect: UniSelect;

    private items: any[];
    private selectedItem: any;

    constructor(public elementRef: ElementRef, private cd: ChangeDetectorRef) {
    }

    public focus() {
        this.uniSelect.focus();
        this.uniSelect.select();
        this.focusEvent.emit(this);
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

    public ngOnChanges(changes) {
        if (this.model && this.field) {
            this.selectedItem = _.get(this.model, this.field.Property);
        }

        if (changes['field']) {
            if (!this.field.Options) {
                this.items = [];
            } else if (!this.field.Options.source) {
                this.items = [];
            } else if (this.field.Options.source.constructor === Array) {
                this.items = this.field.Options.source;
            } else if (this.field.Options.source.subscribe) {
                this.field.Options.source.subscribe(items => this.items = items);
            } else if (typeof this.field.Options.source === 'string') {
                // TODO: manage lookup url;
            }
        }
    }

    public ngAfterViewInit() {
        this.readyEvent.emit(this);
        this.createFocusListener();
    }

    private createFocusListener() {
        this.uniSelect.readyEvent.subscribe(() => {
            Observable.fromEvent(this.uniSelect.inputElement.nativeElement, 'focus').subscribe(() => {
                this.focusEvent.emit(this);
            });
        })

    }

    private onChange(item) {
        let value;
        if (this.field.Options.valueProperty) {
            value = _.get(item, this.field.Options.valueProperty);
        }

        _.set(this.model, this.field.Property, value ? value : item);
        this.changeEvent.emit(this.model);
    }
}
