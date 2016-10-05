import {Component} from '@angular/core';
import {View} from '../../../models/view/view';
import {UniTableColumn, UniTableColumnType, UniTableConfig} from 'unitable-ng2/main';
import {GenericListView, IViewConfig} from '../genericview/list';
import {UniModules} from '../../layout/navbar/tabstrip/tabService';

export var view = new View('workers', 'Personer', 'WorkerListview', false, 'worker', WorkerListview);

@Component({
    selector: view.name,
    template: '<genericlist [viewconfig]="viewconfig"></genericlist>',
    directives: [GenericListView]
})
export class WorkerListview {
    public viewconfig: IViewConfig;

    constructor() {
        this.viewconfig = this.createConfig();
    }

    private createConfig(): IViewConfig {
        return {
            moduleID: UniModules.Workers,
            detail: { route: '/timetracking/workers/'},
            tab: view,
            data: {
                route: 'workers',
                expand: 'info'
            },
            tableConfig: this.createTableConfig()
        };
    }

    private createTableConfig(): UniTableConfig {
        var cols = [
            new UniTableColumn('ID', 'Nr.', UniTableColumnType.Number).setWidth('10%').setFilterOperator('startswith'),
            new UniTableColumn('Info.Name', 'Navn').setWidth('40%')
        ];
        return new UniTableConfig(false, true).setSearchable(true).setColumns(cols);
    }



}
