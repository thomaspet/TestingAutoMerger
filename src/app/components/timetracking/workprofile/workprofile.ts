import {Component} from "@angular/core";
import {TabService} from '../../layout/navbar/tabstrip/tabService';
import {View} from '../../../models/view/view';
import {Worker} from '../../../unientities';
import {UniTable, UniTableBuilder, UniTableColumn} from '../../../../framework/uniTable';
import {Editable, IChangeEvent, IConfig, Column, ColumnType, ITypeSearch, ICopyEventDetails} from '../utils/editable/editable';

export var view = new View('workprofile', 'Stillingsmal', 'WorkprofileListview');

@Component({
    selector: view.name,
    templateUrl: 'app/components/timetracking/workprofile/workprofile.html',
    directives: [UniTable, Editable]
})
export class WorkprofileListview {    
    public view = view;
    
    private tableConfig: UniTableBuilder;

    constructor(private tabService: TabService) {
        this.tabService.addTab({ name: view.label, url: view.url, moduleID: 15, active: true });
        this.tableConfig = this.createTableConfig();
    }
    
    createTableConfig():UniTableBuilder {
        
        var c1 = new UniTableColumn('ID', 'Nr.', 'number').setWidth('10%');
        var c2 = new UniTableColumn('Name', 'Navn', 'string').setWidth('40%');
        var c3 = new UniTableColumn('LunchIncluded', 'Inklusiv lunsj', 'string');

        return new UniTableBuilder('workprofiles', false)
        .setToolbarOptions([])
        .setSelectCallback((item)=>{ this.onSelect(item); } )
        .setFilterable(false)
        .setPageSize(25)
        .addColumns(c1, c2, c3);
    }
    
    onSelect(item) {
        
    }
}