import {Component, EventEmitter} from '@angular/core';
import { forkJoin } from 'rxjs';
import { cloneDeep } from 'lodash';
import { Eventplan, EventplanType, EventSubscriber } from '@uni-entities';
import { IModalOptions, IUniModal } from '@uni-framework/uni-modal';
import { StatisticsService, JobService, ErrorService, EventplanService, GuidService } from '@app/services/services';
import { ToastService, ToastType } from '@uni-framework/uniToast/toastService';
import { QueryBuilderField, QueryBuilderOperator, QueryItem } from '@app/components/common/query-builder/query-builder';
import * as moment from 'moment';
import { UniHttp } from '@uni-framework/core/http/http';
import { QueryParser } from '@app/components/bank-reconciliation/bank-statement-rules/query-parser';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';

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

    filterEnabled: boolean = false;
    fields: QueryBuilderField[];
    queryItems: QueryItem[] = [];

    additionalOperators: QueryBuilderOperator[] = [
        {
            label: "Forandrer verdi",
            operator: "updated",
            isFunction: true,
            forFieldTypes: ["text", "number", "date", "boolean"]
        },
    ];

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
        private guidService: GuidService,
        protected http: UniHttp
    ) {
        forkJoin([
            statisticsService.GetAllUnwrapped('model=model&select=name'),
            jobService.getJobs()
        ]).subscribe(
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

        if (this.eventPlan.ModelFilter) {
            this.updateFilterModels();
        }

        if (this.eventPlan.ExpressionFilter) {
            const parser = new QueryParser();
            try {
                this.queryItems = parser.parseExpression(this.eventPlan.ExpressionFilter);
                this.filterEnabled = true;
            } catch (e) {
                console.error(e);
            }
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
        
        if (!this.filterEnabled) {
            this.eventPlan.ExpressionFilter = "";
        }

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

    updateFilterModels() {
        this.http.usingMetadataDomain()
            .asGET()
            .withEndPoint(`${this.eventPlan.ModelFilter}/types`)
            .send()
            .subscribe(a => this.setFields(a.body))
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

    onQueryChange() {
        this.eventPlan.ExpressionFilter = this.buildQueryString(this.queryItems);
    }

    private buildQueryString(items: QueryItem[]) {
        let string = '';
        items.forEach(item => {
            if (!item.field || !item.operator || (!item.value && item.operator !== "updated")) {
                return '';
            }

            if (item.logicalOperator) {
                string += ` ${item.logicalOperator} `;
            }

            const field = this.fields.find(f => f.field === item.field);
            let value = field && field.type === 'date'
                ? moment(item.value).format('YYYY-MM-DD')
                : item.value;

            if (!field || field.type !== 'number') {
                value = `'${value}'`;
            }

            const isFunctionOperator = ['contains', 'startswith', 'endswith', 'updated'].includes(item.operator);
            
            let query: string = "";
            if (isFunctionOperator) {
                if (item.operator === "updated") {
                    const tokens = item.field.split(".");
                    const last = tokens.splice(tokens.length - 1, 1);
                    query = `${item.operator}(${tokens.join(".")},'${last}')`;
                } 
                else {
                    query = `${item.operator}(${item.field},${value})`;
                }
            } 
            else {
                query = `${item.field} ${item.operator} ${value}`;
            }

            if (item.siblings && item.siblings.length) {
                string += `(${query}${this.buildQueryString(item.siblings)})`;
            } else {
                string += query;
            }
        });


        return string.replace('  ', ' ');
    }

    private parseTupleToField(tuple: [string, string]): QueryBuilderField {
        switch (tuple[1]) {
            case "Boolean":
                return {
                    label: tuple[0],
                    field: `entry.${tuple[0]}`,
                    type: "boolean"
                };
            case "Int32":
            case "Decimal":
                return {
                    label: tuple[0],
                    field: `entry.${tuple[0]}`,
                    type: "number"
                };
            case "LocalDate":
                return {
                    label: tuple[0],
                    field: `entry.${tuple[0]}`,
                    type: "date"
                };
            case "String":
            default:
                return {
                    label: tuple[0],
                    field: `entry.${tuple[0]}`,
                    type: "text"
                };
        }
    }

    private setFields(response){
        const allowedTypes = ["Boolean", "Int32", "String", "Decimal", "LocalDate"];
        this.fields = Object.entries(response)
            .filter(tup => allowedTypes.includes(tup[1] as string))
            .map(this.parseTupleToField);
        
    }
}
