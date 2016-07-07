import {Component} from "@angular/core";
import {TabService} from '../../layout/navbar/tabstrip/tabService';
import {View} from '../../../models/view/view';
import {UniTable, UniTableColumn, UniTableColumnType, UniTableConfig} from 'unitable-ng2/main';
import {WorkerService} from '../../../services/timetracking/workerservice';
import {WorkTypeSystemTypePipe} from '../utils/pipes';
import {GenericListView, IViewConfig} from '../genericview/list';

export var view = new View('worktypes', 'Timearter', 'WorktypeListview', false, 'worktype');

@Component({    
    selector: view.name,
    template: '<genericlist [viewconfig]="viewconfig"></genericlist>',
    directives: [GenericListView],    
    pipes: [WorkTypeSystemTypePipe],
    providers: [WorkerService]
})
export class WorktypeListview {    
    viewconfig: IViewConfig;

    constructor(private tabService: TabService, private workerService: WorkerService) {
        this.viewconfig = this.createConfig();
    }

    private createConfig(): IViewConfig {
        return {
            moduleID: 17,
            detail: { route: '/timetracking/worktype/'},
            tab: view,
            data: { 
                route: 'worktypes',
                lookupFunction: (urlParams: any) => { return this.workerService.queryWithUrlParams(urlParams); }
            },
            tableConfig: this.createTableConfig()
        };
    }

    private createTableConfig():UniTableConfig {
        var systemTypePipe = new WorkTypeSystemTypePipe();
        var cols = [
        	new UniTableColumn('ID', 'Nr.', UniTableColumnType.Number).setWidth('10%').setFilterOperator('startswith'),
            new UniTableColumn('Name', 'Navn', UniTableColumnType.Text).setWidth('40%').setFilterOperator('startswith'),
            new UniTableColumn('SystemType', 'Type', UniTableColumnType.Number).setFilterOperator('eq')
                .setTemplate((rowModel:any) => systemTypePipe.transform(rowModel.SystemType, '')  ).setWidth('20%'),
            new UniTableColumn('Description', 'Beskrivelse', UniTableColumnType.Text).setFilterOperator('startswith')
        ];
        return new UniTableConfig(false,true).setSearchable(true).setColumns(cols)
    }



}
