import {Component} from '@angular/core';
import {TabService} from '../../layout/navbar/tabstrip/tabService';
import {View} from '../../../models/view/view';
import {UniTableColumn, UniTableColumnType, UniTableConfig} from 'unitable-ng2/main';
import {WorkTypeSystemTypePipe} from '../utils/pipes';
import {GenericListView, IViewConfig} from '../genericview/list';

export var view = new View('worktypes', 'Timearter', 'WorktypeListview', false, 'worktype', WorktypeListview);

@Component({    
    selector: view.name,
    template: '<genericlist [viewconfig]="viewconfig"></genericlist>',
    directives: [GenericListView],    
    pipes: [WorkTypeSystemTypePipe]
})
export class WorktypeListview {    
    public viewconfig: IViewConfig;

    constructor(private tabService: TabService) {
        this.viewconfig = this.createConfig();
    }

    private createConfig(): IViewConfig {
        return {
            moduleID: 17,
            detail: { route: '/timetracking/worktypes/'},
            tab: view,
            data: { 
                route: 'worktypes'
            },
            tableConfig: this.createTableConfig()
        };
    }

    private createTableConfig(): UniTableConfig {
        var systemTypePipe = new WorkTypeSystemTypePipe();
        var cols = [
            new UniTableColumn('ID', 'Nr.', UniTableColumnType.Number).setWidth('10%').setFilterOperator('startswith'),
            new UniTableColumn('Name', 'Navn', UniTableColumnType.Text).setWidth('40%').setFilterOperator('startswith'),
            new UniTableColumn('SystemType', 'Type', UniTableColumnType.Number).setFilterOperator('eq')
                .setTemplate((rowModel: any) => systemTypePipe.transform(rowModel.SystemType, '')  ).setWidth('20%'),
            new UniTableColumn('Description', 'Beskrivelse', UniTableColumnType.Text).setFilterOperator('startswith')
        ];
        return new UniTableConfig(false, true).setSearchable(true).setColumns(cols);
    }



}
