import {Component, ViewChild, OnChanges, Input, Output, EventEmitter, SimpleChanges, ChangeDetectorRef, ChangeDetectionStrategy} from '@angular/core';
import {StatisticsService, ErrorService} from '../../../services/services';
import {ModelService} from '../../../services/common/modelService';
import {UniTableColumn, UniTableColumnType} from 'unitable-ng2/main';

declare const _; // lodash

@Component({
    selector: 'model-tree-view',
    templateUrl: './modeltreeview.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModelTreeView implements OnChanges {
    @Input() private header: string;
    @Input() private mainModelName: string;
    @Input() private showAllModels: boolean = false;
    @Input() private showAllFields: boolean = false;
    @Input() private selectedFields: Array<UniTableColumn> = [];

    @Output() private fieldAdded: EventEmitter<any> = new EventEmitter<any>();
    @Output() private modelSelected: EventEmitter<any> = new EventEmitter<any>();

    private models: Array<any> = [];
    private visibleModels: Array<any> = [];
    private model: {Relations: any, Fields: any[], fieldArray: string[]};

    constructor(
        private statisticsService: StatisticsService,
        private modelService: ModelService,
        private errorService: ErrorService,
        private cdr: ChangeDetectorRef) {

    }

    public ngOnChanges(changes: SimpleChanges) {
        if (!this.models || this.models.length === 0) {
            this.setupModelData();
        }
    }

    private setupModelData() {
        this.modelService
            .loadModelCache()
            .then(x => {
                this.models = this.modelService.getModels();
                this.setDefaultExpandedModels();
                this.filterModels();
                this.cdr.markForCheck();
            });
    }

    private getModel(name: string) {
        return this.modelService.getModel(name);
    }

    private setDefaultExpandedModels() {
        if (this.mainModelName && this.models) {
            let mainModel = this.models.find(x => x.Name === this.mainModelName);

            if (mainModel) {
                mainModel.Expanded = true;
                mainModel.Selected = true;

                // place the active mainmodel at top of the treeview
                this.models = this.models.filter(x => x !== mainModel);
                this.models.unshift(mainModel);

                let expandedMainModel = _.cloneDeep(mainModel);
                expandedMainModel.RelatedModels = [];
                expandedMainModel.Relations.forEach(rel => {
                    let relatedModel = this.models.find(x => x.Name === rel.RelatedModel);
                    if (relatedModel) {
                        expandedMainModel.RelatedModels.push(relatedModel);
                    } else {
                        console.log('rel not found:', rel);
                    }
                });

                this.modelSelected.emit(expandedMainModel);
            }
        }
    }

    private filterModels() {
        let models = this.models.filter(x => this.showAllModels || this.statisticsService.checkShouldShowEntity(x.Name));

        models.forEach(model => {
            model.fieldArray = Object.keys(model.Fields).filter(x => this.showAllFields || this.statisticsService.checkShouldShowField(x));

            if (this.selectedFields) {
                let fieldsOnTopLevelModels = this.selectedFields
                    .filter((field: UniTableColumn) => field.path === null || field.path === '' || field.path === this.mainModelName);

                fieldsOnTopLevelModels.forEach((field: UniTableColumn) => {
                    let selectedField = model.fieldArray.find(x => x === field.field.toLowerCase());

                    if (selectedField !== undefined) {
                        model.Fields[field.field.toLowerCase()].Selected = true;
                    }
                });
            }
        });

        this.visibleModels = models;
    }

    private addOrRemoveField(model, fieldname, field, path) {
        this.fieldAdded.emit({
            model: model,
            fieldname: fieldname,
            field: field,
            path: path
        });
    }

    private addOrRemoveFieldFromChild(model, event){
        //this.addOrRemoveField(model, event.fieldname, event.field, event.path);
        event.model = model;
        this.fieldAdded.emit(event);
    }



    private expandModel(model) {
        if (model.Expanded === null) {
            model.Expanded = true;
        } else {
            model.Expanded = !model.Expanded;
        }
    }

    private expandRelation(relation) {
        if (relation.Expanded === null) {
            relation.Expanded = true;
        } else {
            relation.Expanded = !relation.Expanded;
        }
    }
}
