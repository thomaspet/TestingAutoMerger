import {Component, Input, Output, EventEmitter, ViewChildren, QueryList, SimpleChange, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import {FORM_DIRECTIVES, FORM_PROVIDERS, ControlGroup} from '@angular/common';
import {FieldLayout} from '../../app/unientities';
import {UniField} from '../xforms/unifield';
declare var _; // lodash

@Component({
    selector: 'uni-field-set',
    template: `
        <fieldset [hidden]="Hidden">
            <legend *ngIf="config.legend">{{config.legend}}</legend>
            <template ngFor let-field [ngForOf]="fields" let-i="index">
                <uni-field
                    [controls]="controls"
                    [field]="field" 
                    [model]="model"
                    (onReady)="onReadyHandler($event)">
                </uni-field>
            </template>
        </fieldset>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    directives: [FORM_DIRECTIVES, UniField],
    providers: [FORM_PROVIDERS]
})
export class UniFieldSet {

    @Input()
    public fields: FieldLayout[];

    @Input()
    public controls: ControlGroup;

    @Input()
    public model: any;

    @Output()
    public onReady: EventEmitter<UniFieldSet> = new EventEmitter<UniFieldSet>(true);

    @ViewChildren(UniField)
    public fieldElements: QueryList<UniField>;

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
            }
        }
    }

    public ngAfterViewInit() {
        this.totalFields = this.fieldElements.toArray().length;
        this.readyFields = 0;
    }

    public onReadyHandler(field: UniField) {
        this.readyFields++;
        if (this.readyFields === this.totalFields) {
            this.onReady.emit(this);
        }
    }

    public readMode() {
        this.fieldElements.forEach((f: UniField) => {
            f.readMode();
            this.cd.markForCheck();
        });        
    }

    public editMode() {
        this.fieldElements.forEach((f: UniField) => {
            f.editMode();
            this.cd.markForCheck();
        });
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
