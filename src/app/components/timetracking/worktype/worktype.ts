import {Component, ViewChild} from "@angular/core";
import {TabService} from '../../layout/navbar/tabstrip/tabService';
import {View} from '../../../models/view/view';
import {Worker} from '../../../unientities';
import {UniTable, UniTableColumn, UniTableColumnType, UniTableConfig, IContextMenuItem} from 'unitable-ng2/main';
import {WorkTypeSystemType} from '../utils/enumpipes';
import {WorkerService} from '../../../services/timetracking/workerservice';
import {Observable} from "rxjs/Rx";

export var view = new View('worktype', 'Timearter', 'WorktypeListview');

@Component({
    selector: view.name,
    templateUrl: 'app/components/timetracking/worktype/worktype.html',
    directives: [UniTable],
    pipes: [WorkTypeSystemType],
    providers: [WorkerService]
})
export class WorktypeListview {    
    public view = view;
    @ViewChild(UniTable) public table: UniTable;
    private tableConfig: UniTableConfig;

    constructor(private tabService: TabService, private workerService:WorkerService) {
        this.tabService.addTab({ name: view.label, url: view.route, moduleID: 17, active: true });
        this.tableConfig = this.createTableConfig();
    }
    
    createTableConfig():UniTableConfig {
        
        var cols = [
        	new UniTableColumn('ID', 'Nr.', UniTableColumnType.Number).setWidth('10%'),
            new UniTableColumn('Name', 'Navn', UniTableColumnType.Text).setWidth('40%'),
            new UniTableColumn('Description', 'Beskrivelse', UniTableColumnType.Text),
            new UniTableColumn('SystemType', 'Type', UniTableColumnType.Number)
        ];
        cols[3].filterOperator = 'worktypesystemtype';

        return new UniTableConfig(false, false)
        .setSearchable(true)
        .setColumns(cols)

    }

    tableResource():any {
        if (this.workerService) {
            return this.workerService.getWorkTypes();
        }
        return Observable.from([]);
    }
    
    onSelect(item) {
        
    }
}