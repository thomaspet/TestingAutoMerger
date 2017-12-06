import {Component} from '@angular/core';
import {View} from '../../../models/view/view';
import {IViewConfig} from '../genericview/list';
import {UniTableColumn, UniTableColumnType, UniTableConfig} from '../../../../framework/ui/unitable/index';
import {UniModules} from '../../layout/navbar/tabstrip/tabService';

export var view = new View('workprofiles', 'Stillingsmaler', 'WorkprofileListview', false, 'workprofile');

@Component({
    selector: view.name,
    template: '<genericlist [viewconfig]="viewconfig"></genericlist>'
})
export class WorkprofileListview {

    public viewconfig: IViewConfig;

    constructor() {
        this.viewconfig = this.createConfig();
    }

    private createConfig(): IViewConfig {
        return {
            moduleID: UniModules.WorkProfiles,
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
            new UniTableColumn(
                'ID', 'Nr.', UniTableColumnType.Number
            ).setWidth('10%').setFilterOperator('startswith'),
            new UniTableColumn(
                'Name', 'Navn', UniTableColumnType.Text
            ).setWidth('40%').setFilterOperator('startswith')
        ];

        return new UniTableConfig('timetracking.workprofiles.list', false, true).setSearchable(true).setColumns(cols);
    }
}

view.component = WorkprofileListview;
