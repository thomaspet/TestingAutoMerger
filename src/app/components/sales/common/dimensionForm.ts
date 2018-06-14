import {Component, Input, Output, EventEmitter, OnInit} from '@angular/core';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import { FieldType, UniForm } from '@uni-framework/ui/uniform';
declare const _;

@Component({
    selector: 'uni-dimension-tof-view',
    template: `
    <uni-form
        [fields]="dimfields$"
        [model]="model$"
        [config]="{}"
        (changeEvent)="onFormChange($event)">
    </uni-form>`
})


export class UniDimensionTOFView implements OnInit {

    @Input() public dimensionTypes: any[] = [];
    @Input() public entity: any;
    @Input() public entityType: string;
    @Output() public entityChange: EventEmitter<any> = new EventEmitter();

    public dimfields$: BehaviorSubject<any[]> = new BehaviorSubject([]);
    public model$: BehaviorSubject<any> = new BehaviorSubject({});

    constructor() {}

    public ngOnInit() {
        this.setUpDimensions();
    }

    public ngOnChanges(changes) {
        this.model$.next(this.entity);
    }

    public onFormChange(changes) {
        const keys = Object.keys(changes);
        keys.forEach(key => {
            _.set(this.entity, key, changes[key].currentValue);
        });

        this.entity['_updatedField'] = Object.keys(changes)[0];
        this.entityChange.emit(this.entity);
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
            console.log(dim);
            fields.push(
                {
                    FieldSet: 1,
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
