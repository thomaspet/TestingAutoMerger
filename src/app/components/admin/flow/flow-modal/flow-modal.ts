import { Component, EventEmitter } from '@angular/core';
import { forkJoin } from 'rxjs';
import { cloneDeep, Dictionary } from 'lodash';
import { Eventplan, EventplanType, EventSubscriber, ExpressionFilter } from '@uni-entities';
import { IModalOptions, IUniModal } from '@uni-framework/uni-modal';
import { StatisticsService, JobService, ErrorService, EventplanService, GuidService } from '@app/services/services';
import { ToastService, ToastType } from '@uni-framework/uniToast/toastService';
import { QueryBuilderField, QueryBuilderOperator, QueryItem } from '@app/components/common/query-builder/query-builder';
import * as moment from 'moment';
import { UniHttp } from '@uni-framework/core/http/http';
import { QueryParser } from '@app/components/bank-reconciliation/bank-statement-rules/query-parser';

interface OperationFilterItem {
    operation: string;
    label: string;
    selected?: boolean;
}

interface Model {
    name: string;
    fields: QueryBuilderField[];
    queryItems: QueryItem[];
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

    modelQuery: string = "";
    filteredModels: string[] = [];
    selectedModels: Dictionary<Model> = {};
    filteredJobs: string[];

    selectedModelsLength: number = 0;
    filterEnabled: boolean = false;

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
                this.models = this.filteredModels = ["*", ...res[0].map(d => d.ModelName)];
                this.jobs = this.filteredJobs = res[1];
            },
            err => this.errorService.handle(err)
        );
    }

    ngOnInit(): void {
        if (this.options.data) {
            this.eventPlan = cloneDeep(this.options.data);
        } else {
            this.eventPlan = <Eventplan>{
                Active: true,
                PlanType: EventplanType.Webhook,
                OperationFilter: ''
            };
        }

        this.header = this.eventPlan.Name || 'Ny flyt';
        this.operationFilters.forEach(filter =>
            filter.selected = this.eventPlan.OperationFilter.includes(filter.operation));

        if (!this.eventPlan.Subscribers) {
            this.eventPlan.Subscribers = [<EventSubscriber>{}];
        }

        if (!this.eventPlan.ExpressionFilters) {
            this.eventPlan.ExpressionFilters = [];
        }

        if (this.eventPlan.ModelFilter) {

            if (this.eventPlan.ModelFilter === "*") {
                this.setStarModelValues();
            }
            else {
                const modelNames = this.eventPlan.ModelFilter.split(",");
                for (let modelName of modelNames) {
                    this.addSelectedModel(modelName);
                }

                this.selectedModelsLength = Object.keys(this.selectedModels).length
            }
        }

        for (let ef of this.eventPlan.ExpressionFilters) {
            let model = this.selectedModels[ef.EntityName]

            if (model && ef.Expression) {

                const parser = new QueryParser();
                try {
                    const queryitems = parser.parseExpression(ef.Expression);

                    this.selectedModels[model.name].queryItems = queryitems;
                    this.onQueryChange(model.name);
                    this.filterEnabled = true;
                } catch (e) {
                    console.error(e);
                }
            }
        }
    }

    /**
     * Eventhandler for when the EventPlan is saved/created
     * Combines fields in arrays and object into strings, like OperationFiltre.
     * Validates the plan, then sends it to the API
     */
    savePlan(): void {
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

        if (!this.filterEnabled || this.selectedModels["Alle (*)"]) {
            this.eventPlan.ExpressionFilters = [];
        } else {
            this.eventPlan.ExpressionFilters.forEach(ef => {
                if (!ef.ID) {
                    ef['_createguid'] = this.guidService.guid();
                }
            });
        }

        this.eventPlan.ModelFilter = Object.values(this.selectedModels)
            .map(m => m.name)
            .join(",");

        this.eventPlanService.save(this.eventPlan).subscribe(
            () => this.onClose.emit(true),
            err => {
                this.errorService.handle(err);
                this.busy = false;
            },
        );
    }

    /**
     * Eventhandler for when Plantype is changed
     */
    onPlanTypeChange(): void {
        if (this.eventPlan.PlanType === EventplanType.Webhook) {
            this.eventPlan.JobNames = '';
        }

        this.eventPlan.Subscribers = [<EventSubscriber>{}];
    }

    /**
     * Eventhandler for when a new querybuilder item is added 
     * @param {string} model name of the model we're adding to, passed from html
     */
    addQueryItem(model: string): void {
        this.selectedModels[model].queryItems.push({ logicalOperator: 'and' });
    }

    /**
     * Eventhandler for removing subscribers
     * @param {number} index Which index the subscriber is stored at, passed from html
     */
    removeSubscriber(index: number): void {
        this.eventPlan.Subscribers.splice(index, 1);
        if (!this.eventPlan.Subscribers.length) {
            this.eventPlan.Subscribers.push(<EventSubscriber>{});
        }
    }

    /**
     * Eventhandler for removing a model in the "entiteter" field
     * @param {string} model name of the model to remove from the dictionary, passed from html
     */
    removeModel(model: string): void {
        this.selectedModels[model].queryItems = [];
        delete this.selectedModels[model];
        this.selectedModelsLength--;
    }

    /**
     * Resets all selected models
     * Empties the dictionary, and sets length to 0
     * Called from HTML & from setStarModelValues
     */
    resetSelectedModels(): void {
        this.selectedModels = {};
        this.selectedModelsLength = 0;
    }

    /**
     * Eventhandler for when a new entity/model is selected in the auto-complete component
     * If the model is "*" we reset everything and just set the model to "All"
     */
    entityOptionSelected(): void {
        if (this.modelQuery === "*") {
            this.setStarModelValues()
        }
        else {
            if (this.selectedModels["Alle (*)"]) {
                this.removeModel("Alle (*)");
            }
            this.addSelectedModel(this.modelQuery);
        }

        // "" wont remove the query, but this won't show suggestions until a button is pressed
        this.modelQuery = null;
    }

    /**
     * Eventhandler for the change-event in the auto-complete model component.
     */
    filterModels(query: string): void {
        this.filteredModels = this.models.filter(model => {
            return (model || '').toLowerCase()
                .includes((query || "").toLowerCase());
        });
    }

    /**
     * Eventhandler for the change-event in the auto-complete job component.
     */
    filterJobs(query: string): void {
        this.filteredJobs = this.jobs.filter(job => {
            return (job || '').toLowerCase()
                .includes((query || "").toLowerCase());
        });
    }

    /**
     * Eventhandler for the query-builder component
     * Builds a expression from the queryitems, and adds it to the eventplan.
     */
    onQueryChange(modelName: string): void {
        const model = this.selectedModels[modelName];

        if (model.fields && model.queryItems) {
            const expression = this.buildQueryString(model.fields, model.queryItems);
            let filter = this.eventPlan.ExpressionFilters.find(ef => ef.EntityName === modelName);

            if (!filter) {
                this.eventPlan.ExpressionFilters.push(
                    <ExpressionFilter>{
                        EntityName: model.name,
                        Expression: expression
                    }
                );
            } else {
                filter.Expression = expression; 
            }
        }
    }

    /**
     * Helper function to add a model to the selectedModels dictionary
     * @param {string} key which key the model is referenced with
     * @param {string?} name what name the model should have, this defaults to key if not provided
     */
    private addSelectedModel(key: string, name: string = null): void {
        if (key in this.selectedModels) {
            return;
        }

        this.selectedModels[key] = {
            name: name || key,
            fields: [],
            queryItems: [],
        };
        this.updateFilterModel(key);
        this.selectedModelsLength++;
    }

    /**
     * Helper function to set the model to "*" (all).
     * Resets all selected entities / models.
     */
    private setStarModelValues(): void {
        this.resetSelectedModels()
        this.filterEnabled = false;

        this.addSelectedModel("Alle (*)", "*");
        this.selectedModelsLength = 1;
    }

    /**
     * Helper function to call the meta endpoint of the API
     * fetches all properties we care about, and their corresponding type.
     */
    private updateFilterModel(model: string): void {
        if (model === "Alle (*)") {
            return;
        }

        this.http.usingMetadataDomain()
            .asGET()
            .withEndPoint(`${model}/types`)
            .send()
            .subscribe(a => this.setFields(model, a.body))
    }

    /**
     * Validates the current EventPlan model
     * @returns {boolean} based on the validitiy of the eventplan
     */
    private isValidFlow(): boolean {
        this.toastService.clear();
        const errors = [];

        if (!this.eventPlan.Name) {
            errors.push('Navn på flyt mangler');
        }

        if (!this.selectedModelsLength) {
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

    /**
     * Helper function to build the querystring / expresisonfilter string based on queryitems and fields
     * @param {QueryBuilderFiled[]} fields All the fields used in the querybuilder, used for looking up types
     * @param {QueryItem[]} items All the query items generated in the querybuilder, holds all the values
     * @returns {string} the finished expressionfilter / querystring
     */
    private buildQueryString(fields: QueryBuilderField[], items: QueryItem[]): string {
        let string = '';
        items.forEach(item => {
            if (!item.field || !item.operator || (!item.value && item.operator !== "updated")) {
                return '';
            }

            if (item.logicalOperator) {
                string += ` ${item.logicalOperator} `;
            }

            const field = fields.find(f => f.field === item.field);
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
                string += `(${query}${this.buildQueryString(fields, item.siblings)})`;
            } else {
                string += query;
            }
        });


        return string.replace('  ', ' ');
    }

    /**
     * Helper function to parse a tuple of [property, type] on a model
     * @param {string} model the model we're parsing for, adds the model name to the field
     * @param {[string, any]} tuple A tuple holding a set of property name to type of property
     * @returns {QueryBuilderField} An object of {label, field, type} to represent a field in a query-builder
     */
    private parseTupleToField(model: string, tuple: [string, any]): QueryBuilderField {
        switch (tuple[1]) {
            case "Boolean":
                return {
                    label: tuple[0],
                    field: `${model}.${tuple[0]}`,
                    type: "boolean"
                };
            case "Int32":
            case "Decimal":
                return {
                    label: tuple[0],
                    field: `${model}.${tuple[0]}`,
                    type: "number"
                };
            case "LocalDate":
                return {
                    label: tuple[0],
                    field: `${model}.${tuple[0]}`,
                    type: "date"
                };
            case "String":
            default:
                return {
                    label: tuple[0],
                    field: `${model}.${tuple[0]}`,
                    type: "text"
                };
        }
    }

    /**
     * Helper function to set the fields in a querybuilder component
     * Sets the fields on a selectedmodel (indexed by model)
     * @param {string} model name of the model
     * @param {Dictionary<string>} response Dictionary of propertyname -> propertytype
     */
    private setFields(model: string, response: Dictionary<string>) {
        const allowedTypes = ["Boolean", "Int32", "String", "Decimal", "LocalDate"];
        this.selectedModels[model].fields = Object.entries(response)
            .filter(tup => allowedTypes.includes(tup[1] as string))
            .map(t => this.parseTupleToField(model, t));
    }
}
