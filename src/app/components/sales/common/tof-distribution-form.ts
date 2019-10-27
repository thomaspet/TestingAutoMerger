import {Component, Input, Output, EventEmitter, OnInit} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {FieldType} from '@uni-framework/ui/uniform';
import { CompanySettings } from '@uni-entities';

@Component({
    selector: 'tof-distribution-form',
    template: `
    <uni-form
        [fields]="fields$"
        [model]="model$"
        [config]="{}"
        (changeEvent)="onFormChange()">
    </uni-form>`
})
export class TofDistributionForm implements OnInit {
    @Input() distributionPlans: any[] = [];
    @Input() reports: any[] = [];
    @Input() entity: any;
    @Input() entityType: string;
    @Input() companySettings: CompanySettings;
    @Output() entityChange = new EventEmitter();

    fields$ = new BehaviorSubject([]);
    model$ = new BehaviorSubject({});

    constructor() {}

    public ngOnInit() {
        this.setUpFields();
    }

    ngOnDestroy() {
        this.fields$.complete();
        this.model$.complete();
    }

    public ngOnChanges() {
        this.model$.next(this.entity);
        this.setUpFields();
    }

    public onFormChange() {
        this.entityChange.emit(this.entity);
    }

    private setUpFields() {
        const canClearPlan = this.companySettings && (
            !this.companySettings.Distributions.CustomerInvoiceDistributionPlanID
            || !this.companySettings.AutoDistributeInvoice
        );

        const fields = [
            {
                FieldSet: 1,
                FieldSetColumn: 1,
                EntityType: this.entityType,
                Property: 'DistributionPlanID',
                FieldType: FieldType.DROPDOWN,
                Label: 'Utsendelse',
                ReadOnly: false,
                Options: {
                    source: this.distributionPlans,
                    valueProperty: 'ID',
                    displayProperty: 'Name',
                    debounceTime: 200,
                    addEmptyValue: canClearPlan
                },
            },
            {
                FieldSet: 1,
                FieldSetColumn: 1,
                EntityType: this.entityType,
                Property: 'UseReportID',
                FieldType: FieldType.DROPDOWN,
                Label: 'Blankett',
                ReadOnly: false,
                Options: {
                    source: this.reports,
                    valueProperty: 'ID',
                    displayProperty: 'Description',
                    debounceTime: 200,
                    addEmptyValue: true
                },
            }
        ];

        this.fields$.next(fields);
    }

}
