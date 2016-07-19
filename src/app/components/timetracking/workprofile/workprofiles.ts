import {Component} from '@angular/core';
import {View} from '../../../models/view/view';
import {GenericListView, IViewConfig} from '../genericview/list';
import {UniTableColumn, UniTableColumnType, UniTableConfig} from 'unitable-ng2/main';

export var view = new View('workprofiles', 'Stillingsmaler', 'WorkprofileListview', false, 'workprofile', WorkprofileListview);

@Component({
    selector: view.name,
    template: '<genericlist [viewconfig]="viewconfig"></genericlist>',
    directives: [GenericListView] 
})
export class WorkprofileListview {    

    public viewconfig: IViewConfig;

    constructor() {
        this.viewconfig = this.createConfig();
    }

    private createConfig(): IViewConfig {
        return {
            moduleID: 15,
            detail: { route: '/timetracking/workprofiles/'},
            tab: view,
            data: { 
                route: 'workprofiles',
            },
            tableConfig: this.createTableConfig()
        };
    }

    private createTableConfig(): UniTableConfig {
        var cols = [
            new UniTableColumn('ID', 'Nr.', UniTableColumnType.Number).setWidth('10%').setFilterOperator('startswith'),
            new UniTableColumn('Name', 'Navn', UniTableColumnType.Text).setWidth('40%').setFilterOperator('startswith')
        ];
        return new UniTableConfig(false, true).setSearchable(true).setColumns(cols);
    }
       
}
