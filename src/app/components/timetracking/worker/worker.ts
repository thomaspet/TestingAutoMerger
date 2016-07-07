import {Component} from "@angular/core";
import {View} from '../../../models/view/view';
import {UniForm, UniFieldLayout} from '../../../../framework/uniform';
import {createFormField, FieldSize, ControlTypes} from '../utils/utils';
import {IViewConfig} from '../genericview/list';
import {Worker} from '../../../unientities';
import {GenericDetailview} from '../genericview/detail';
import {WorkTypeSystemTypePipe, SystemTypes} from '../utils/pipes';

export var view = new View('worker', 'Person', 'WorkerDetailview', true);

@Component({
    selector: view.name,
    template: '<genericdetail [viewconfig]="viewconfig" ></genericdetail>',
    directives: [GenericDetailview]
})
export class WorkerDetailview {
    private viewconfig: IViewConfig;
    constructor() {
        this.viewconfig = this.createLayout();
    }

    private createLayout(): IViewConfig {

        var layout: IViewConfig = {
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
            ],
        };

        return layout;
    }   

}