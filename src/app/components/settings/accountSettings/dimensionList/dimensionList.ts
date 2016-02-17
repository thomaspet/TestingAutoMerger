import {Component, Input} from 'angular2/core';
import {UniHttpService} from '../../../../../framework/data/uniHttpService';
import {UniTable, UniTableBuilder, UniTableColumn} from '../../../../../framework/uniTable';

@Component({
    selector: 'dimension-list',
    templateUrl: 'app/components/settings/accountSettings/dimensionList/dimensionList.html',
    directives: [UniTable]
})
export class DimensionList {
    @Input() dimension = 1;
    tableConfig;
    localData;
    
    constructor(private http:UniHttpService) {
        
        this.localData = [
            {ID: 1, Type: 'Prosjekt', Name: 'Test'},
            {ID: 2, Type: 'Avdeling', Name: 'Haugesund'},
        ];
       
        var idCol = new UniTableColumn('ID', 'Dimnr', 'number')
        var typeCol = new UniTableColumn('Type', 'Type', 'string');
        var nameCol = new UniTableColumn('Name', 'Navn', 'string');
        
        this.tableConfig = new UniTableBuilder(this.localData, false)
        .setPageSize(5)
        .setSearchable(false)
        .addColumns(idCol, typeCol, nameCol);
    }
}