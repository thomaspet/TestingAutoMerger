import {
    ChangeDetectionStrategy, Component, EventEmitter, Input, Output, SimpleChanges
} from '@angular/core';
import { UniTableConfig } from '@uni-framework/ui/unitable';
import { Eventplan } from '@app/unientities';
import formFields from './form.config';
import tableConfig from './table.config';
import { ModelService } from '@app/services/admin/models/modelService';
import { BehaviorSubject } from 'rxjs';
import { JobService } from '@app/services/admin/jobs/jobService';
import { Observable } from 'rxjs';

@Component({
    selector: 'event-plan-details',
    templateUrl: './event-plan-details.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventPlanDetails {
    @Input() eventplan: Eventplan = new Eventplan();
    @Input() isTouched: boolean;

    @Output() touched = new EventEmitter<boolean>(true);
    @Output() addSubscriber = new EventEmitter<any>(true);
    @Output() saveEventplan = new EventEmitter<Eventplan>(true);
    @Output() updateSubscriber = new EventEmitter<Eventplan>(true);
    @Output() deleteSubscriber = new EventEmitter<Eventplan>(true);

    formConfig = { autofocus: true };
    fields$= new BehaviorSubject<any>([]);
    tableConfig: UniTableConfig;

    constructor(private modelService: ModelService, private jobService: JobService) {
        Observable.forkJoin([
            this.modelService.GetAll('select=name&hateoas=false', []),
            this.jobService.getJobs()
        ])
        .subscribe(data => {
            const [models, jobs] = data;
            const mappedJobs = jobs.map((job, index) => ({ID: index, Name: job}));
            this.fields$.next(formFields(models, mappedJobs));
        }, () => {
            this.fields$.next(formFields([], []));
        });
        this.tableConfig = tableConfig;
        this.tableConfig.deleteButton = true;
    }

    ngOnChanges(change: SimpleChanges) {
        if (change.eventplan) {
            if (change.eventplan.currentValue) {
                this.fields$.next(this.updateFormFields(change.eventplan.currentValue));
            } else {
                this.eventplan = new Eventplan();
            }
        }
    }

    onFormInput() {
        this.touched.emit(true);
        this.fields$.next(this.updateFormFields(this.eventplan));
        console.log(this.eventplan);
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

    updateFormFields(value) {
        const fields = this.fields$.getValue();
        const field = fields.find(f => f.Property === 'JobNames');
        let change = false;
        if (field) {
            const oldValue = field.Hidden;
            field.Hidden = !value.PlanType;
            change = (field.Hidden !== oldValue && oldValue !== undefined) ? true : false;
        }
        return change ? [].concat(fields) : fields;
    }

    onClickSaveEventplanButton() {
        this.saveEventplan.emit(this.eventplan);
    }
}
