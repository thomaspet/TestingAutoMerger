import {Component} from "@angular/core";
import {TabService} from '../../layout/navbar/tabstrip/tabService';
import {View} from '../../../models/view/view';
import {UniTable, UniTableColumn, UniTableColumnType, UniTableConfig} from 'unitable-ng2/main';
import {WorkerService} from '../../../services/timetracking/workerservice';
import {GenericListView, IViewConfig} from '../genericview/list';

export var view = new View('workers', 'Personer', 'WorkerListview', false, 'worker');

@Component({    
    selector: view.name,
    template: '<genericlist [viewconfig]="viewconfig"></genericlist>',
    directives: [GenericListView],    
    providers: [WorkerService]
})
export class WorkerListview {    
    viewconfig: IViewConfig;

    constructor(private tabService: TabService, private workerService: WorkerService) {
        this.viewconfig = this.createConfig();
    }

    private createConfig(): IViewConfig {
        return {
            moduleID: 16,
            detail: { route: '/timetracking/worker/'},
            tab: view,
            data: { 
                route: 'workers',                
                lookupFunction: (urlParams: any) => { return this.workerService.queryWithUrlParams(urlParams, 'workers', 'info'); }
            },
            tableConfig: this.createTableConfig()
        };
    }

    private createTableConfig():UniTableConfig {
        var cols = [
        	new UniTableColumn('ID', 'Nr.', UniTableColumnType.Number).setWidth('10%').setFilterOperator('startswith'),
            new UniTableColumn('Info.Name', 'Navn', UniTableColumnType.Text).setWidth('40%').setFilterOperator('startswith')
        ];
        return new UniTableConfig(false,true).setSearchable(true).setColumns(cols)
    }



}
