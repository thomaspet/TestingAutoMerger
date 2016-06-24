import {Component} from "@angular/core";
import {TabService} from '../../layout/navbar/tabstrip/tabService';
import {View} from '../../../models/view/view';
import {Worker} from '../../../unientities';
import {UniTable, UniTableBuilder, UniTableColumn} from '../../../../framework/uniTable';

export var view = new View('worktype', 'Timearter', 'WorktypeListview');

@Component({
    selector: view.name,
    templateUrl: 'app/components/timetracking/worktype/worktype.html',
    directives: [UniTable]
})
export class WorktypeListview {    
    public view = view;
    
    private tableConfig: UniTableBuilder;

    constructor(private tabService: TabService) {
        this.tabService.addTab({ name: view.label, url: view.route, moduleID: 17, active: true });
        this.tableConfig = this.createTableConfig();
    }
    
    createTableConfig():UniTableBuilder {
        
        var c1 = new UniTableColumn('ID', 'Nr.', 'number').setWidth('10%');
        var c2 = new UniTableColumn('Name', 'Navn', 'string').setWidth('40%');
        var c3 = new UniTableColumn('Description', 'Beskrivelse', 'string');

        return new UniTableBuilder('worktypes', false)
        .setToolbarOptions([])
        .setSelectCallback((item)=>{ this.onSelect(item); } )
        .setFilterable(false)
        .setPageSize(25)
        .addColumns(c1, c2, c3);
    }
    
    onSelect(item) {
        
    }
}