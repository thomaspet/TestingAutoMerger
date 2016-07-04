import {Component} from "@angular/core";
import {TabService} from '../../layout/navbar/tabstrip/tabService';
import {View} from '../../../models/view/view';
import {UniTable, UniTableColumn, UniTableColumnType, UniTableConfig, IContextMenuItem} from 'unitable-ng2/main';
import {WorkerService} from '../../../services/timetracking/workerservice';
import {WorkTypeSystemTypePipe} from '../utils/pipes';
import {Router} from '@angular/router-deprecated';

export var view = new View('worktypes', 'Timearter', 'WorktypeListview', false, 'worktype');

@Component({    
    selector: view.name,
    templateUrl: 'app/components/timetracking/worktype/worktypes.html',
    directives: [UniTable],
    pipes: [WorkTypeSystemTypePipe],
    providers: [WorkerService]
})
export class WorktypeListview {    
    public view = view;
    private tableConfig: UniTableConfig;
    private lookupFunction: (urlParams: any) => any;

    constructor(private tabService: TabService, private workerService:WorkerService, private router:Router) {
        this.tabService.addTab({ name: view.label, url: view.url, moduleID: 17, active: true });
        this.createTableConfig();
    }

    public createNew() {
        this.router.navigateByUrl('/timetracking/worktype/0');
    }

    public onRowSelected(event) {
        this.router.navigateByUrl('/timetracking/worktype/' + event.rowModel.ID);
    };    
    
    private createTableConfig() {

        this.lookupFunction = (urlParams: any) => {
            return this.workerService.getWorkTypes(urlParams);
        };
        
        var systemTypePipe = new WorkTypeSystemTypePipe();

        var cols = [
        	new UniTableColumn('ID', 'Nr.', UniTableColumnType.Number).setWidth('10%').setFilterOperator('startswith'),
            new UniTableColumn('Name', 'Navn', UniTableColumnType.Text).setWidth('40%').setFilterOperator('startswith'),
            new UniTableColumn('Description', 'Beskrivelse', UniTableColumnType.Text).setFilterOperator('startswith'),
            new UniTableColumn('SystemType', 'Type', UniTableColumnType.Number).setFilterOperator('eq')
                .setTemplate((rowModel:any) => systemTypePipe.transform(rowModel.SystemType, '')  )
        ];


        this.tableConfig = new UniTableConfig(false,true).setSearchable(true).setColumns(cols)

    }
}
