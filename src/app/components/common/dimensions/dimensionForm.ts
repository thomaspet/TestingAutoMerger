import {Component, Input, Output, EventEmitter} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import { FieldType, UniForm } from '@uni-framework/ui/uniform';
declare const _;

@Component({
    selector: 'uni-dimension-view',
    template: `
    <uni-form
        [fields]="dimfields$"
        [model]="model$"
        [config]="{}"
        (changeEvent)="onFormChange($event)">
    </uni-form>`
})


export class UniDimensionTOFView {

    @Input() dimensionTypes: any[] = [];
    @Input() entity: any;
    @Input() entityType: string;
    @Input() isModal: boolean = false;
    @Output() entityChange = new EventEmitter();
    @Output() dimensionChange = new EventEmitter();

    public dimfields$: BehaviorSubject<any[]> = new BehaviorSubject([]);
    public model$: BehaviorSubject<any> = new BehaviorSubject({});

    constructor() {}


    public ngOnChanges(changes) {
        this.model$.next(this.entity);
        this.setUpDimensions();
    }

    public onFormChange(changes) {
        const keys = Object.keys(changes);
        keys.forEach(key => {
            _.set(this.entity, key, changes[key].currentValue);
        });

        this.entityChange.emit(this.entity);

        // Important that this happens after entityChange emit!
        if (keys[0]) {
            this.dimensionChange.emit({
                field: keys[0],
                value: changes[keys[0]]?.currentValue
            });
        }
    }

    private setUpDimensions() {

        if (!this.dimensionTypes || !this.entity) {
            return;
        }

        const fields = [];

        this.dimensionTypes.forEach((dim, index) => {
            let fieldsetIndex;
            if (this.dimensionTypes.length === 9) {
                if (index < 4) {
                    fieldsetIndex = 1;
                } else if (index < 8) {
                    fieldsetIndex = 2;
                } else {
                    fieldsetIndex = 3;
                }
            } else if (this.dimensionTypes.length > 4) {
                fieldsetIndex = index < 4 ? 1 : 2;
            } else {
                fieldsetIndex = 1;
            }
            fields.push(
                {
                    FieldSet: this.isModal ? 0 : 1,
                    FieldSetColumn: fieldsetIndex,
                    EntityType: this.entityType,
                    Property: dim.Property,
                    FieldType: FieldType.DROPDOWN,
                    Label: dim.Label,
                    ReadOnly: !dim.IsActive,
                    Section: 0,
                    Options: {
                        source: dim.Data,
                        valueProperty: 'ID',
                        displayProperty: 'Name',
                        debounceTime: 200,
                        addEmptyValue: true
                    },
                }
            );
        });
        this.dimfields$.next(fields);
    }

}
