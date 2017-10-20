import {
    Component, Input, Output, HostBinding, EventEmitter, QueryList, ViewChildren, ChangeDetectorRef,
    ChangeDetectionStrategy, SimpleChange, SimpleChanges, Pipe, PipeTransform
} from '@angular/core';
import {UniFieldLayout} from './interfaces';
import {UniField} from './unifield';

@Pipe({
    name: 'noFieldSet',
    pure: false
})
export class noFieldSetPipe implements PipeTransform {
    public transform(fields: UniFieldLayout[]): UniFieldLayout[] {
        let filteredFields: UniFieldLayout[] = [];
        fields.forEach((f: UniFieldLayout) => {
            if (!f.FieldSet) {
                filteredFields.push(f);
            }
        });
        return filteredFields;
    }
}
@Pipe({
    name: 'fieldsetIndexes',
    pure: false
})
export class fieldsetIndexesPipe implements PipeTransform {
    public transform(fields: UniFieldLayout[]): number[] {
        let indexes: number[] = [];
        fields.forEach((f: UniFieldLayout) => {
            if (indexes.indexOf(f.FieldSet) === -1 && !!f.FieldSet && f.FieldSet > 0) {
                indexes.push(f.FieldSet);
            }
        });
        return indexes;
    }
}
@Pipe({
    name: 'columnIndexes',
    pure: false
})
export class columnIndexesPipe implements PipeTransform {
    public transform(fields: UniFieldLayout[], fieldset: number): number[] {
        let indexes: number[] = [];
        fields.forEach((f: UniFieldLayout) => {
            const column = f.FieldSetColumn || 0;
            if (indexes.indexOf(column) === -1) {
                if (f.FieldSet === fieldset) {
                    indexes.push(column);
                }
            }
        });
        return indexes;
    }
}

@Pipe({
    name: 'getLegend',
    pure: false
})
export class getLegendPipe implements PipeTransform {
    public transform(fields: UniFieldLayout[], fieldset: number): string {
        if (fields && fields.length) {
            for (let i = 0; i < fields.length; i++) {
                let f = fields[i];
                if (f.FieldSet === fieldset && !!f.Legend) {
                    return f.Legend;
                }
            }
        }
        return '';
    }
}
@Pipe({
    name: 'byFieldSet',
    pure: false
})
export class byFieldSetPipe implements PipeTransform {
    public transform(fields: UniFieldLayout[], fieldset: number, column: number): UniFieldLayout[] {
        let filteredFields: UniFieldLayout[] = [];
        fields.forEach((f: UniFieldLayout) => {
            if (f.FieldSet === fieldset && (f.FieldSetColumn === column || (!f.FieldSetColumn && !!f.FieldSetColumn === !!column))) {
                filteredFields.push(f);
            }
        });
        return filteredFields;
    }
}

@Component({
    selector: 'uni-section',
    template: `
        <article class="collapsable" [ngClass]="{'-is-open':isOpen}">
            <h4 *ngIf="config?.Sectionheader" (click)="toggle()">{{config?.Sectionheader}}</h4>
            <div class="collapsable-content">
                <!-- Not Fieldset -->
                <ng-template ngFor let-item [ngForOf]="groupedFields | noFieldSet" let-i="index">
                    <uni-field *ngIf="!item?.Hidden"
                               [field]="item"
                               [model]="model"
                               [formConfig]="formConfig"
                               (readyEvent)="onReadyHandler($event)"
                               (changeEvent)="onChangeHandler($event)"
                               (inputEvent)="onInputHandler($event)"
                               (focusEvent)="onFocusHandler($event)"
                               (moveForwardEvent)="onMoveForward($event)"
                               (moveBackwardEvent)="onMoveBackward($event)"
                               (errorEvent)="onError($event)"
                    >
                    </uni-field>
                    <uni-linebreak *ngIf="hasLineBreak(item)"></uni-linebreak>
                </ng-template>
                <!-- Fieldset -->
                <ng-template ngFor let-fieldset [ngForOf]="groupedFields | fieldsetIndexes" let-i="index">
                    <fieldset>
                        <legend>{{groupedFields | getLegend:fieldset}}</legend>
                        <section class="fieldset-column-container">
                            <ng-template ngFor let-column [ngForOf]="groupedFields | columnIndexes:fieldset" let-j="index2">
                                <section class="fieldset-column">
                                    <ng-template ngFor let-item [ngForOf]="groupedFields | byFieldSet:fieldset:column" let-k="index3">
                                    <uni-field *ngIf="!item?.Hidden"
                                               [field]="item"
                                               [model]="model"
                                               [formConfig]="formConfig"
                                               (readyEvent)="onReadyHandler($event)"
                                               (changeEvent)="onChangeHandler($event)"
                                               (inputEvent)="onInputHandler($event)"
                                               (focusEvent)="onFocusHandler($event)"
                                               (moveForwardEvent)="onMoveForward($event)"
                                               (moveBackwardEvent)="onMoveBackward($event)"
                                               (errorEvent)="onError($event)"
                                    >
                                    </uni-field>
                                   <uni-linebreak *ngIf="hasLineBreak(item)"></uni-linebreak>
                                    </ng-template>
                                </section>                                
                            </ng-template>
                        </section>
                    </fieldset>
                </ng-template>
            </div>
        </article>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UniSection {
    @Input() public fields: UniFieldLayout[];
    @Input() public model: any;
    @Input() public formConfig: any;

    @Output() public readyEvent: EventEmitter<UniSection> = new EventEmitter<UniSection>(true);
    @Output() public changeEvent: EventEmitter<SimpleChanges> = new EventEmitter<SimpleChanges>();
    @Output() public inputEvent: EventEmitter<SimpleChanges> = new EventEmitter<SimpleChanges>();
    @Output() public toggleEvent: EventEmitter<Object> = new EventEmitter<Object>(true);
    @Output() public focusEvent: EventEmitter<UniSection> = new EventEmitter<UniSection>(true);
    @Output() public moveForwardEvent: EventEmitter<Object> = new EventEmitter<Object>(true);
    @Output() public moveBackwardEvent: EventEmitter<Object> = new EventEmitter<Object>(true);
    @Output() public errorEvent: EventEmitter<Object> = new EventEmitter<Object>(true);

    @ViewChildren(UniField) public fieldElements: QueryList<UniField>;

    public sectionId: number;
    public isOpen: boolean = false;

    private groupedFields: any;
    private config: any = {};
    private readyFields: number;
    private hidden: boolean = false;

    @HostBinding('hidden') public get Hidden() { return this.hidden; }

    public set Hidden(value: boolean) {
        this.hidden = value;
        this.cd.markForCheck();
    }

    constructor(private cd: ChangeDetectorRef) { }

    public toggle() {
        this.isOpen = !this.isOpen;
        this.formConfig.sections[this.sectionId].isOpen = this.isOpen;
        this.cd.markForCheck();
        this.toggleEvent.emit({sectionId: this.sectionId, isOpen: this.isOpen});
    }

    public ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
        if (changes['fields']) {
            if (this.fields && this.fields.length > 0) {
                this.sectionId = this.fields[0].Section;
                this.config.Sectionheader = this.fields[0].Sectionheader;
                if (this.formConfig) {
                    if (!this.formConfig.sections) {
                        this.formConfig.sections = {};
                    }
                    if (!this.formConfig.sections[this.sectionId]) {
                        this.formConfig.sections[this.sectionId] = {
                            isOpen: (this.sectionId === 0 || !this.sectionId)
                        };

                    }
                    this.isOpen = this.formConfig.sections[this.sectionId].isOpen;
                }

            }
            this.groupedFields = this.fields;
        }
    }

    public ngAfterViewInit() {
        this.readyFields = 0;
    }

    public onReadyHandler(item: UniField) {
        this.readyFields++;
        if (this.readyFields === this.countElements()) {
            this.readyEvent.emit(this);
        }
    }

    public onFocusHandler(event) {
        this.focusEvent.emit(event);
    }

    public countElements() {
        let fields = this.fieldElements.toArray();
        let all = [].concat(fields);

        return all.length;
    }

    public onChangeHandler(model: any) {
        this.changeEvent.emit(model);
    }

    public onInputHandler(model: any) {
        this.inputEvent.emit(model);
    }

    public onMoveForward(action) {
        this.moveForwardEvent.emit(action);
    }

    public onMoveBackward(action) {
        this.moveBackwardEvent.emit(action);
    }

    public readMode() {
        this.fieldElements.forEach((f: UniField) => f.readMode());
        this.cd.markForCheck();
    }

    public editMode() {
        this.fieldElements.forEach((f: UniField) => f.editMode());
        this.cd.markForCheck();
    }

    public field(property: string, isMultivalue?: boolean): UniField {
        return this.fieldElements.find((field: UniField) => {
            if (isMultivalue) {
                if (field.field.Options && field.field.Options.storeResultInProperty) {
                    return field.field.Options.storeResultInProperty === property;
                }
            }
            return field.field.Property === property;
        });
    }

    public onError(event) {
        this.errorEvent.emit(event);
    }

    public hasLineBreak(item: UniFieldLayout) {
        return item.LineBreak;
    }
}
