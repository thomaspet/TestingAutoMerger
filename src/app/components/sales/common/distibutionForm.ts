import {Component, Input, Output, EventEmitter, OnInit} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import { FieldType, UniForm } from '@uni-framework/ui/uniform';
declare const _;

@Component({
    selector: 'uni-distribute',
    template: `
    <uni-form
        [fields]="fields$"
        [model]="model$"
        [config]="{}"
        (changeEvent)="onFormChange($event)">
    </uni-form>`
})


export class UniDistibutionTOFView implements OnInit {

    @Input() public distributionPlans: any[] = [];
    @Input() public reports: any[] = [];
    @Input() public entity: any;
    @Input() public entityType: string;
    @Output() public entityChange: EventEmitter<any> = new EventEmitter();

    public fields$: BehaviorSubject<any[]> = new BehaviorSubject([]);
    public model$: BehaviorSubject<any> = new BehaviorSubject({});

    constructor() {}

    public ngOnInit() {
        this.setUpFields();
    }

    public ngOnChanges(changes) {
        this.model$.next(this.entity);
    }

    public onFormChange(changes) {
        this.entityChange.emit(this.entity);
    }

    private setUpFields() {
        const fields = [
            {
                FieldSet: 1,
                FieldSetColumn: 1,
                EntityType: this.entityType,
                Property: 'DistributionPlanID',
                FieldType: FieldType.DROPDOWN,
                Label: 'Distribusjon',
                ReadOnly: false,
                Options: {
                    source: this.distributionPlans,
                    valueProperty: 'ID',
                    displayProperty: 'Name',
                    debounceTime: 200,
                    addEmptyValue: true
                },
            },
            {
                FieldSet: 1,
                FieldSetColumn: 1,
                EntityType: this.entityType,
                Property: 'UseReportID',
                FieldType: FieldType.DROPDOWN,
                Label: 'Rapport',
                ReadOnly: false,
                Options: {
                    source: this.reports,
                    valueProperty: 'ID',
                    displayProperty: 'Name',
                    debounceTime: 200,
                    addEmptyValue: true
                },
            }
        ];

        this.fields$.next(fields);
    }

}
