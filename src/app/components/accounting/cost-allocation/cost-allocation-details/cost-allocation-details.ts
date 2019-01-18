import {
    ChangeDetectionStrategy, Component, EventEmitter, Input, Output, SimpleChanges
} from '@angular/core';
import { UniTableConfig } from '@uni-framework/ui/unitable';
import { CostAllocation } from '@app/unientities';
import formFields from './cost-allocation-form.config';
import tableConfig from './cost-allocation-items-table.config';
import { BehaviorSubject } from 'rxjs';
import { CostAllocationService } from '@app/services/accounting/costAllocationService';

@Component({
    selector: 'uni-cost-allocation-details',
    templateUrl: './cost-allocation-details.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UniCostAllocationDetails {
    @Input() costAllocation: CostAllocation = new CostAllocation();
    @Input() isTouched: boolean;

    @Output() touched = new EventEmitter<boolean>(true);
    @Output() addSubscriber = new EventEmitter<any>(true);
    @Output() saveEventplan = new EventEmitter<CostAllocation>(true);
    @Output() updateSubscriber = new EventEmitter<CostAllocation>(true);
    @Output() deleteSubscriber = new EventEmitter<CostAllocation>(true);

    formConfig = { autofocus: true };
    fields$ = new BehaviorSubject<any>([]);
    tableConfig: UniTableConfig;

    constructor(private costAllocationService: CostAllocationService) {
        this.costAllocationService.GetAll('expand=items&hateoas=false', [])
            .subscribe(data => {
                this.fields$.next(formFields(data));
            }, () => {
                this.fields$.next(formFields([], []));
            });
        this.tableConfig = tableConfig;
        this.tableConfig.deleteButton = true;
    }

    ngOnChanges(change: SimpleChanges) {
        if (change.costAllocation) {
            if (change.costAllocation.currentValue) {
                this.fields$.next(this.updateFormFields(change.costAllocation.currentValue));
            } else {
                this.costAllocation = new CostAllocation();
            }
        }
    }

    onFormInput() {
        this.touched.emit(true);
    }

    onRowDeleted(row) {
        this.deleteSubscriber.emit(row);
    }

    onRowChange(row) {
        if (row.ID) {
            this.updateSubscriber.emit(row);
        } else {
            this.addSubscriber.emit(row);
        }
    }

    onClickSaveEventplanButton() {
        this.saveEventplan.emit(this.costAllocation);
    }
}
