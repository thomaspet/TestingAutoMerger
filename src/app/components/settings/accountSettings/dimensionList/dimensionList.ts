import {Component, Input} from 'angular2/core';
import {UniTable, UniTableConfig} from '../../../../../framework/uniTable';

@Component({
    selector: 'dimension-list',
    templateUrl: 'app/components/settings/accountSettings/dimensionList/dimensionList.html',
    directives: [UniTable]
})
export class DimensionList {
    @Input() dimension;
    tableConfig: UniTableConfig;
    
    constructor() {
        this.tableConfig = new UniTableConfig('http://devapi.unieconomy.no:80/api/biz/dimensions')
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