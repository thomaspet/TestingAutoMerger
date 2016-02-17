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
    tableConfig: UniTableBuilder;
    
    constructor(private http:UniHttpService) {
        var idCol = new UniTableColumn('ID', 'Dimnr', 'number')
        var nameCol = new UniTableColumn('Name', 'Navn', 'string'); 
        
        var tableConfig = new UniTableBuilder(this.http.baseUrl + "dimensions", false)
        .setPageSize(5)
        .addColumns(idCol, nameCol);

        /*
        this.tableConfig = new UniTableConfig(this.http.baseUrl + 'dimensions', false, false)
        .setOdata({
            expand: '',
            filter: 'ID eq ' + this.dimension
        })
        .setDsModel({
            id: 'ID',
            fields: {
                ID: {type: 'number'},
                Name: {type: 'text'}
            }
        })
        .setColumns([
            {field: 'ID', title: 'Dimnr'},
            {field: 'Name', title: 'Navn'}
        ]); 
        */ 
    }
}