import {Component} from "@angular/core";
import {TabService} from '../../layout/navbar/tabstrip/tabService';
import {View} from '../../../models/view/view';
import {GenericListView, IViewConfig} from '../genericview/list';
import {UniTableColumn, UniTableColumnType, UniTableConfig} from 'unitable-ng2/main';
import {WorkerService} from '../../../services/timetracking/workerservice';

export var view = new View('workprofiles', 'Stillingsmal', 'WorkprofileListview', false, 'workprofile');

@Component({
    selector: view.name,
    template: '<genericlist [viewconfig]="viewconfig"></genericlist>',
    directives: [GenericListView],
    providers: [WorkerService]    
})
export class WorkprofileListview {    

    viewconfig: IViewConfig;

    constructor(private tabService: TabService, private workerservice: WorkerService) {
        this.viewconfig = this.createConfig();
    }

    private createConfig(): IViewConfig {
        return {
            moduleID: 15,
            detail: { route: '/timetracking/workprofile/'},
            tab: view,
            data: { 
                route: 'workprofiles',
                lookupFunction: (urlParams: any) => { return this.workerservice.getWorkTypes(urlParams, 'workprofiles'); }
            },
            tableConfig: this.createTableConfig()
        };
    }

    private createTableConfig():UniTableConfig {
        var cols = [
        	new UniTableColumn('ID', 'Nr.', UniTableColumnType.Number).setWidth('10%').setFilterOperator('startswith'),
            new UniTableColumn('Name', 'Navn', UniTableColumnType.Text).setWidth('40%').setFilterOperator('startswith')
        ];
        return new UniTableConfig(false,true).setSearchable(true).setColumns(cols)
    }
    
    
}