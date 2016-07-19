import {Component} from '@angular/core';
import {View} from '../../../models/view/view';
import {createFormField, FieldSize, ControlTypes} from '../utils/utils';
import {IViewConfig} from '../genericview/list';
import {WorkType} from '../../../unientities';
import {GenericDetailview} from '../genericview/detail';
import {SYSTEMTYPES} from '../utils/pipes';

export var view = new View('worktype', 'Timeart', 'WorktypeDetailview', true, '', WorktypeDetailview);

var defaultSystemType = 1; // 1 - Hours (default) 

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
                        item.SystemType = defaultSystemType;
                        return item;
                    },
                check: (item) => { 
                    item.SystemType = item.SystemType || defaultSystemType; 
                }
            },
            formFields: [
                createFormField('Name', 'Navn',  ControlTypes.TextInput, FieldSize.Double),
                createFormField('SystemType', 'Type', 3, FieldSize.Quarter, false, null, null, null, {
                    source: SYSTEMTYPES, valueProperty: 'id', displayProperty: 'label'
                }),
                createFormField('Description', 'Kommentar', ControlTypes.TextareaInput, FieldSize.Full, true, 1, 'Kommentar')
            ],
        };

        return layout;
    }   

}
