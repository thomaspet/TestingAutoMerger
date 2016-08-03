import {Component, ViewChild} from '@angular/core';
import {View} from '../../../models/view/view';
import {createFormField, FieldSize, ControlTypes} from '../utils/utils';
import {IViewConfig} from '../genericview/list';
import {Worker, WorkRelation} from '../../../unientities';
import {GenericDetailview, IAfterSaveInfo} from '../genericview/detail';
import {View as RelationsSubView} from './relations';

export var view = new View('workers', 'Timefører', 'WorkerDetailview', true, '', WorkerDetailview);

@Component({
    selector: view.name,
    template: `<genericdetail [viewconfig]="viewconfig" (itemChanged)="onItemChanged($event)" (afterSave)="afterWorkerSaved($event)" ></genericdetail>
        <workrelations [hidden]="!currentId" (onValueChange)="onRelationvalueChanged($event)" [workerid]="currentId">
    `,
    directives: [GenericDetailview, RelationsSubView]
})
export class WorkerDetailview {
    @ViewChild(GenericDetailview) private detailForm: GenericDetailview;
    @ViewChild(RelationsSubView) private relationsView: RelationsSubView;
    private viewconfig: IViewConfig;
    private currentId: number = 0;
    private hasRelationChanges: boolean = false;

    constructor() {
        this.viewconfig = this.createFormConfig();
    }   

    public onItemChanged(item: Worker) {
        this.currentId = item.ID;
        this.hasRelationChanges = false;
        this.detailForm.flagDirty(true);
    }

    public onRelationvalueChanged(item: WorkRelation) {
        this.hasRelationChanges = true;
    }

    public afterWorkerSaved(info: IAfterSaveInfo) {
        debugger;
        if (this.hasRelationChanges) {
            info.promise = this.relationsView.saveChanges(info.entity.ID);
        }
    }

    private createFormConfig(): IViewConfig {
        return {
            moduleID: 16,
            labels: { single: 'Timefører', plural: 'Timeførere', createNew: 'Ny timefører'},
            detail: { routeBackToList: '/timetracking/workers', nameProperty: 'Info.Name'},
            tab: view,
            data: {
                model: 'worker',
                expand: 'info',
                route: 'workers',
                factory: () => { 
                        var item = new Worker();
                        return item;
                    },
                check: (item) => { 
                }
            },
            formFields: [
                createFormField('Info.Name', 'Navn',  ControlTypes.TextInput, FieldSize.Double),
            ]
        };        
    }

}
