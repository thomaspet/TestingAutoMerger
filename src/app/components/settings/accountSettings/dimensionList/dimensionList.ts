import {Component, Input} from 'angular2/core';
import {UniTable, UniTableConfig} from '../../../../../framework/uniTable';
import {UniHttpService} from '../../../../../framework/data/uniHttpService';

@Component({
    selector: 'dimension-list',
    templateUrl: 'app/components/settings/accountSettings/dimensionList/dimensionList.html',
    directives: [UniTable]
})
export class DimensionList {
    @Input() dimension = 1;
    tableConfig: UniTableConfig;
    
    constructor(private http:UniHttpService) {
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
    }
}