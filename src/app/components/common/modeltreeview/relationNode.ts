import {Component, ViewChild, OnChanges, Input, Output, EventEmitter} from '@angular/core';
import {StatisticsService} from '../../../services/services';
import {UniTableColumn, UniTableColumnType} from 'unitable-ng2/main';
declare var _;

@Component({
    selector: 'model-tree-relation-node',
    templateUrl: './relationNode.html'
})
export class ModelTreeRelationNode implements OnChanges {
    @Input() private relation: any;
    @Input() private path: string;
    @Input() private models: Array<any>;
    @Input() private showAllFields: boolean;
    @Input() private selectedFields: Array<UniTableColumn>;
    @Output() private fieldAdded: EventEmitter<any> = new EventEmitter<any>();

    private model: {Relations: any, Fields: any[], fieldArray: string[]};

    constructor(private statisticsService: StatisticsService) {

    }

    public ngOnChanges(args) {
        if (this.models && this.relation && !this.model) {
            this.model = this.getRelatedEntity();
        }
    }

    private getRelatedEntity(): {Relations: any, Fields: any[], fieldArray: string[]} {
        let relatedModel: {Relations: any, Fields: any[], fieldArray: string[]} =  this.models.find(model => model.Name === this.relation.RelatedModel);

        if (relatedModel) {
            relatedModel = _.cloneDeep(relatedModel);
            relatedModel.fieldArray = Object.keys(relatedModel.Fields).filter(x => this.showAllFields || this.statisticsService.checkShouldShowField(x));

            // clear selection, this could be for the same model in another path
            relatedModel.fieldArray.forEach((x: string) => {
                if (relatedModel.Fields[x].Selected === true) {
                    relatedModel.Fields[x].Selected = false;
                }
            });

            // find selected fields for this path (if any)
            if (this.selectedFields) {
                let fieldsOnThisPath = this.selectedFields
                    .filter((field: UniTableColumn) => field.path === this.path);

                // set fields as selected in this path
                fieldsOnThisPath.forEach((field: UniTableColumn) => {
                    let selectedField = relatedModel.fieldArray.find(x => x === field.field.toLowerCase());

                    if (selectedField !== undefined) {
                        relatedModel.Fields[field.field.toLowerCase()].Selected = true;
                    }
                });
            }

            // set all child relations as not expanded (to avoid problems with same relation in multiple paths)
            relatedModel.Relations.forEach(rel => {
                rel.Expanded = false;
            });
        }

        return relatedModel;
    }

    private getFields(fields: any): Array<any> {
        return Object.keys(fields).filter(x => this.showAllFields || this.statisticsService.checkShouldShowField(x));
    }

    private expandRelation(relation) {
        if (relation.Expanded === null) {
            relation.Expanded = true;
        } else {
            relation.Expanded = !relation.Expanded;
        }
    }

    private getPath(path: string, relationName: string): string {
        return path + '.' + relationName;
    }

    private addOrRemoveField(field, fieldname) {
        this.fieldAdded.emit({
            fieldname: fieldname,
            field: field,
            path: this.path
        });
    }

    private addOrRemoveFieldFromChild(event) {
        this.fieldAdded.emit(event);
    }
}
