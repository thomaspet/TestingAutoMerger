import {Component} from 'angular2/core';
import {UniTable, UniTableConfig} from '../../../../framework/uniTable';

@Component({
    selector: 'uni-table-demo', 
    template: `
        <h4>Read-only table</h4>
        <uni-table [config]="readOnlyTableConfig"></uni-table>
        <br><br>
        <h4>Editable table</h4>
        <uni-table [config]="editableTableConfig"></uni-table>
    `,
    directives: [UniTable]
})
export class UniTableDemo {
    readOnlyTableConfig;	
	editableTableConfig;
    
    constructor() {
        
        // Read-only grid
        this.readOnlyTableConfig = new UniTableConfig('http://devapi.unieconomy.no/api/biz/companysettings')
        .setDsModel({
            id: 'ID',
            fields: {
                ID: {type: 'number'},
                CompanyName: {type: 'text'},
                BaseCurrency: {type: 'text'}
            }
        })
        .setColumns([
            {field: 'ID', title: 'ID'},
            {field: 'CompanyName', title: 'Navn'},
            {field: 'BaseCurrency', title: 'Valuta'}
        ])
        .setOnSelect(
            (selectedItem) => { console.log(selectedItem); }
        );
        
        // Inline edit        
        this.editableTableConfig = new UniTableConfig('http://devapi.unieconomy.no/api/biz/products', true, true)
        .setDsModel({
            id: 'ID',
            fields: {
                ID: {type: 'number', editable: false, nullable: true},
                Name: {type: 'text'},
                Price: {type: 'number'},
            }
        })
        .setColumns([
            {field: 'ID', title: 'Produktnummer'},
            {field: 'Name', title: 'Produktnavn'},
            {field: 'Price', title: 'Pris'},
        ]);   
        
    }
}