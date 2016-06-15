import {Component} from "@angular/core";
import {TabService} from '../../layout/navbar/tabstrip/tabService';
import {View} from '../../../models/view/view';
import {Worker} from '../../../unientities';
import {UniTable, UniTableBuilder, UniTableColumn} from '../../../../framework/uniTable';

export var view = new View('worker', 'Personer', 'WorkerListview');

@Component({
    selector: view.name,
    templateUrl: 'app/components/timetracking/worker/worker.html',
    directives: [UniTable]
})
export class WorkerListview {    
    public view = view;
    
    private tableConfig: UniTableBuilder;

    constructor(private tabService: TabService) {
        this.tabService.addTab({ name: view.label, url: view.route });
        this.tableConfig = this.createTableConfig();
    }
    
    createTableConfig():UniTableBuilder {
        
        var c1 = new UniTableColumn('ID', 'Nr.', 'number').setWidth('10%');
        var c2 = new UniTableColumn('Info.Name', 'Navn', 'string');

        return new UniTableBuilder('workers?expand=Info', false)
        .setToolbarOptions([])
        .setSelectCallback((item)=>{ this.onSelect(item); } )
        .setFilterable(false)
        .setPageSize(25)
        .addColumns(c1, c2);
    }
    
    onSelect(item) {
        
    }
}