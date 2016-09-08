import {Component, Input, Output, EventEmitter, ViewChildren, QueryList, SimpleChange, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import {REACTIVE_FORM_DIRECTIVES, FormGroup} from '@angular/forms';
import {UniFieldLayout} from './interfaces';
import {UniField} from './unifield';
declare var _; // lodash


@Component({
    selector: 'uni-combo-field',
    changeDetection: ChangeDetectionStrategy.OnPush,
    directives: [REACTIVE_FORM_DIRECTIVES, UniField],
    template: `<legend *ngIf="config?.legend">{{config?.legend}}</legend>
        <template ngFor let-field [ngForOf]="fields" let i="index">
            <uni-field
                [controls]="controls"
                [field]="field" 
                [model]="model"
                (onReady)="onReadyHandler($event)"
                (onChange)="onChangeHandler($event)">
            </uni-field>
        </template>`
})
export class UniCombo {
    @Input()
    public fields: UniFieldLayout[];

    @Input()
    public controls: FormGroup;

    @Input()
    public model: any;

    @Output()
    public onReady: EventEmitter<UniCombo> = new EventEmitter<UniCombo>(true);

    @Output()
    public onChange: EventEmitter<any> = new EventEmitter<any>(true);

    @ViewChildren(UniField)
    public fieldElements: QueryList<UniField>;

    public comboId: number;
    public fieldsetId: number;
    public sectionId: number;
    public config: any;

    private hidden: boolean = false;
    public get Hidden() { return this.hidden; }
    
    public set Hidden(value: boolean) {
        this.hidden = value;
        this.cd.markForCheck();
    } 

    private readyFields: number;
    private totalFields: number;

    constructor(private cd: ChangeDetectorRef) { 
        this.readyFields = 0;
    }

    public ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
        if (changes['fields']) {
            if (this.fields && this.fields.length > 0) {
                this.sectionId = this.fields[0].Section;
                this.fieldsetId = this.fields[0].FieldSet;
                this.config = {};
                this.config.legend = this.fields[0].Legend;
                this.comboId = this.fields[0].Combo;
            }
        }
    }

    public ngAfterViewInit() {
        this.readyFields = 0;
    }

    public onReadyHandler(item: UniField) {
        this.readyFields++;
        if (this.readyFields === this.countElements()) {
            this.onReady.emit(this);
        }
    }

    public countElements() {
        let fields = this.fieldElements.toArray();
        let all = [].concat(fields);

        return all.length;
    }
    
    public onChangeHandler(model: any) {
        this.onChange.emit(model);
    }

    public readMode() {
        this.fieldElements.forEach((f: UniField) => {
            f.readMode();
        });        
        this.cd.markForCheck();
    }

    public editMode() {
        this.fieldElements.forEach((f: UniField) => {
            f.editMode();
        });
        this.cd.markForCheck();
    }

    public field(property: string): UniField {
        // look after fields
        var item: UniField[] = this.fieldElements.filter((cmp: UniField) => {
            return cmp.field.Property === property;
        });
        if (item.length > 0) {
            return item[0];
        }

        // nothing found
        return;
    }
}