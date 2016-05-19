import {Component} from "@angular/core";
import {TabService} from '../../layout/navbar/tabstrip/tabService';
import {View} from '../../../models/view/view';
import {Worker, WorkRelation, WorkProfile, WorkItem} from '../../../unientities';
import {UniTable as NewTable, UniTableColumn, UniTableConfig, UniTableColumnType} from 'unitable-ng2/main';
import {Observable} from 'rxjs/Observable';

export var view = new View('regtime', 'Timeregistrering', 'RegisterTime');

@Component({
    selector: view.name,
    templateUrl: 'app/components/timetracking/regtime/regtime.html',
    directives: [NewTable], 
    styles: [`.tabtip { color: #606060; margin-left: -15px; }`],
})
export class RegisterTime {    
    public view = view;
    
    private tableConfig: UniTableConfig;
    private tableData = [];
    
    tabs = [ { name: 'timeentry', label: 'Timer', isSelected: true },
            { name: 'totals', label: 'Totaler' },
            { name: 'flex', label: 'Fleksitid', counter: 15 },
            { name: 'profiles', label: 'Arbeidsgivere', counter: 1 },
            { name: 'vacation', label: 'Ferie', counter: 22 },
            { name: 'offtime', label: 'Fravær', counter: 4 },
            ];    

    constructor(private tabService: TabService) {
        this.tabService.addTab({ name: view.label, url: view.route });
        this.addNewRow();
        this.tableConfig = this.createTableConfig();
    }
    
	addNewRow(text = 'Fyll inn beskrivelse') {
        this.tableData.push({ Description: text});
        //this.tableData.push({ Description: text, StartTime: '08:00', EndTime: '09:00' });		
	}    
    
    createTableConfig():UniTableConfig {
             
        var cols = [
            new UniTableColumn('Description', 'Beskrivelse', UniTableColumnType.Number, true),
            new UniTableColumn('StartTime', 'Fra kl.', UniTableColumnType.Text, true),
            new UniTableColumn('StartTime', 'Fra kl.', UniTableColumnType.Text, true),
            new UniTableColumn('EndTime', 'Til kl.', UniTableColumnType.Text, true)
            //new UniTableColumn('WorkTypeID', 'Timeart', UniTableColumnType.Lookup, true)
        ];

        return new UniTableConfig(true, true, 25).setColumns(cols);
    }

}