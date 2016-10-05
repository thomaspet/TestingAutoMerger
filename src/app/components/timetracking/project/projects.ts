import {Component} from '@angular/core';
import {View} from '../../../models/view/view';
import {GenericListView, IViewConfig} from '../genericview/list';
import {UniTableColumn, UniTableColumnType, UniTableConfig} from 'unitable-ng2/main';
import {UniModules} from '../../layout/navbar/tabstrip/tabService';

export var view = new View('projects', 'Prosjekter', 'ProjectListview', false, 'project', ProjectListview);

@Component({
    selector: view.name,
    template: '<genericlist [viewconfig]="viewconfig"></genericlist>'
})
export class ProjectListview {
    public viewconfig: IViewConfig;

    constructor() {
        this.viewconfig = {
            moduleID: UniModules.Projects,
            detail: { route: '/timetracking/projects/'},
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
        };
    }
}
