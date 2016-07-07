import {Component} from "@angular/core";
import {View} from '../../../models/view/view';
import {UniForm, UniFieldLayout} from '../../../../framework/uniform';
import {createFormField} from '../utils/utils';
import {IViewConfig} from '../genericview/list';
import {WorkType} from '../../../unientities';
import {GenericDetailview} from '../genericview/detail';
import {WorkTypeSystemTypePipe, SystemTypes} from '../utils/pipes';

export var view = new View('worktype', 'Timeart', 'WorktypeDetailview', true);

var DefaultSystemType = 1; // 1 - Hours (default) 

@Component({
    selector: view.name,
    template: '<genericdetail [viewconfig]="viewconfig" ></genericdetail>',
    directives: [GenericDetailview]
})
export class WorktypeDetailview {
    private viewconfig: IViewConfig;
    constructor() {
        this.viewconfig = this.createLayout();
    }

    private createLayout(): IViewConfig {

        var layout: IViewConfig = {
            moduleID: 17,
            labels: { single: 'Mal', plural: 'Maler', createNew: 'Ny Timeart'},
            detail: { routeBackToList: '/timetracking/worktypes'},
            tab: view,
            data: {
                model: 'worktype',
                route: 'worktypes',
                factory: () => { 
                        var item = new WorkType();
                        item.SystemType = DefaultSystemType;
                        return item;
                    },
                check: (item) => { 
                    item.SystemType = item.SystemType || DefaultSystemType; 
                }
            },
            formFields: [
                createFormField('Name', 'Navn'),
                createFormField('SystemType', 'Type', 3, null, null, null, {
                    source: SystemTypes, valueProperty: 'id', displayProperty: 'label'
                }),
                createFormField('Description', '', 16, 1, 'Kommentar', null, null, true)
            ],
        };

        return layout;
    }   

}