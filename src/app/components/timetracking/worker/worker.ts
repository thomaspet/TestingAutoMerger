import {Component} from "@angular/core";
import {TabService} from '../../layout/navbar/tabstrip/tabService';
import {View} from '../../../models/view/view';
import {WorkerService} from '../../../services/timetracking/workerservice';
import {Worker} from '../../../unientities';
import {UniTable, UniTableBuilder, UniTableColumn} from '../../../../framework/uniTable';

export var view = new View('worker', 'Personer', 'WorkerListview');

@Component({
    selector: view.name,
    template: `<section class='application'>
        <h2>{{view.label}}</h2>
        <aside class='info'>
            Personer er resurser som du kan føre timer mot. Normalt sett er bruker, ansatt og person den samme, men du kan i teorien føre timer for personer som ikke er hverken brukere eller ansatte.
        </aside> 
        <uni-table [config]="tableConfig"></uni-table>
    </section>
    `,
    directives: [UniTable]
})
export class WorkerListview {    
    public view = view;
    
    private tableConfig: UniTableBuilder;

    constructor(private tabService: TabService, private service: WorkerService) {
        this.tabService.addTab({ name: view.label, url: view.route });
        this.tableConfig = this.createTableConfig();
    }
    
    createTableConfig():UniTableBuilder {
        
        var c1 = new UniTableColumn('ID', 'Nr.', 'number').setWidth('20%');
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