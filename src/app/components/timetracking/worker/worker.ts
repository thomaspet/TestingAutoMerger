import {Component} from '@angular/core';
import {View} from '../../../models/view/view';
import {createFormField, FieldSize, ControlTypes} from '../utils/utils';
import {IViewConfig} from '../genericview/list';
import {Worker} from '../../../unientities';
import {GenericDetailview} from '../genericview/detail';
import {View as RelationsSubView} from './relations';

export var view = new View('workers', 'Person', 'WorkerDetailview', true, '', WorkerDetailview);

@Component({
    selector: view.name,
    template: `<genericdetail [viewconfig]="viewconfig" (itemChanged)="onItemChanged($event)" ></genericdetail>
        <workrelations [workerid]="currentId">
    `,
    directives: [GenericDetailview, RelationsSubView]
})
export class WorkerDetailview {
    private viewconfig: IViewConfig;
    private currentId: number = 0;
    constructor() {
        this.viewconfig =  this.createFormConfig();
    }   

    public onItemChanged(item: Worker) {
        this.currentId = item.ID;
    }

    private createFormConfig(): IViewConfig {
        return {
            moduleID: 16,
            labels: { single: 'Person', plural: 'Personer', createNew: 'Ny person'},
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
