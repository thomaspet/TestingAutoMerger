import {Component} from '@angular/core';
import {View} from '../../../models/view/view';
import {GenericListView, IViewConfig} from '../genericview/list';
import {UniTable, UniTableColumn, UniTableColumnType, UniTableConfig} from 'unitable-ng2/main';

export var view = new View('projects', 'Prosjekter', 'ProjectListview', false, 'project');

@Component({
    selector: view.name,
    template: '<genericlist [viewconfig]="viewconfig"></genericlist>',
    directives: [GenericListView]    
})
export class ProjectListview {
    viewconfig: IViewConfig;

    constructor() {
        this.viewconfig = {
            moduleID: 101,
            detail: { route: '/timetracking/project/'},
            tab: view,
            data: {
                route: 'projects'
            },
            tableConfig: new UniTableConfig(false, true).setSearchable(true)
                .setColumns([
                    new UniTableColumn('ID', 'Nr', UniTableColumnType.Number).setWidth('10%'),
                    new UniTableColumn('Name', 'Navn').setWidth('40%'),
                    new UniTableColumn('ProjectLeadName', 'Prosjektleder')
                ])
        }
    }
}