import {Component, EventEmitter} from '@angular/core';
import { forkJoin } from 'rxjs';
import { cloneDeep } from 'lodash';
import { Eventplan, EventplanType, EventSubscriber } from '@uni-entities';
import { IModalOptions, IUniModal } from '@uni-framework/uni-modal';
import { StatisticsService, JobService, ErrorService, EventplanService, GuidService } from '@app/services/services';
import { ToastService, ToastType } from '@uni-framework/uniToast/toastService';

interface OperationFilterItem {
    operation: string;
    label: string;
    selected?: boolean;
}

@Component({
    selector: 'flow-modal',
    templateUrl: './flow-modal.html',
    styleUrls: ['./flow-modal.sass'],
})
export class FlowModal implements IUniModal {
    options: IModalOptions = {};
    onClose: EventEmitter<boolean> = new EventEmitter();

    header: string;
    busy: boolean;

    planTypeEnum = EventplanType; // for use in template
    eventPlan: Eventplan;

    models: string[] = [];
    jobs: string[] = [];

    filteredModels: string[];
    filteredJobs: string[];

    operationFilters: OperationFilterItem[] = [
        { operation: 'C', label: 'Oppretting' },
        { operation: 'U', label: 'Endring' },
        { operation: 'D', label: 'Sletting' },
    ];

    constructor(
        statisticsService: StatisticsService,
        jobService: JobService,
        private errorService: ErrorService,
        private toastService: ToastService,
        private eventPlanService: EventplanService,
        private guidService: GuidService
    ) {
        forkJoin(
            statisticsService.GetAllUnwrapped('model=model&select=name'),
            jobService.getJobs()
        ).subscribe(
            res => {
                this.models = this.filteredModels = res[0].map(d => d.ModelName);
                this.jobs = this.filteredJobs = res[1];
            },
            err => this.errorService.handle(err)
        );
    }

    ngOnInit() {
        if (this.options.data) {
            this.eventPlan = cloneDeep(this.options.data);
        } else {
            this.eventPlan = <Eventplan> {
                Active: true,
                PlanType: EventplanType.Webhook,
                OperationFilter: ''
            };
        }

        this.header = this.eventPlan.Name || 'Ny flyt';
        this.operationFilters = this.operationFilters.map(filter => {
            if (this.eventPlan.OperationFilter.includes(filter.operation)) {
                filter.selected = true;
            }

            return filter;
        });

        if (!this.eventPlan.Subscribers) {
            this.eventPlan.Subscribers = [<EventSubscriber> {}];
        }
    }

    savePlan() {
        this.eventPlan.OperationFilter = this.operationFilters
            .filter(filter => filter.selected)
            .map(filter => filter.operation)
            .join('');

        this.eventPlan.Subscribers.forEach(sub => {
            sub.Active = true;
            if (!sub.ID) {
                sub['_createguid'] = this.guidService.guid();
            }
        });

        if (!this.isValidFlow()) {
            return;
        }

        this.busy = true;
        this.eventPlanService.save(this.eventPlan).subscribe(
            () => this.onClose.emit(true),
            err => {
                this.errorService.handle(err);
                this.busy = false;
            },
        );
    }

    onPlanTypeChange() {
        if (this.eventPlan.PlanType === EventplanType.Webhook) {
            this.eventPlan.JobNames = '';
        }

        this.eventPlan.Subscribers = [<EventSubscriber> {}];
    }

    removeSubscriber(index) {
        this.eventPlan.Subscribers.splice(index, 1);
        if (!this.eventPlan.Subscribers.length) {
            this.eventPlan.Subscribers.push(<EventSubscriber> {});
        }
    }

    filterModels(query: string) {
        this.filteredModels = this.models.filter(model => {
            return (model || '').toLowerCase().includes(query.toLowerCase());
        });
    }

    filterJobs(query) {
        this.filteredJobs = this.jobs.filter(job => {
            return (job || '').toLowerCase().includes(query.toLowerCase());
        });
    }

    private isValidFlow(): boolean {
        this.toastService.clear();
        const errors = [];

        if (!this.eventPlan.Name) {
            errors.push('Navn på flyt mangler');
        }

        if (!this.eventPlan.ModelFilter) {
            errors.push('Entitet er ikke spesifisert');
        }

        if (!this.eventPlan.OperationFilter) {
            errors.push('Flyten må lytte på minst en hendelse');
        }

        if (this.eventPlan.PlanType === EventplanType.Custom && !this.eventPlan.JobNames) {
            errors.push('Hvilken jobb som skal kjøres er ikke spesifisert');
        }

        if (errors.length) {
            const toastMessage = errors.map(err => `- ${err}`).join('<br>');
            this.toastService.addToast(
                'Kan ikke lagre flyt',
                ToastType.warn, 0,
                toastMessage
            );

            return false;
        }

        return true;
    }
}
