import {Component, ViewChildren, AfterViewInit} from 'angular2/core';
import {UniTable, UniTableBuilder, UniTableColumn} from '../../../../framework/uniTable';

import {UniHttp} from '../../../../framework/core/http';

@Component({
    selector: 'uni-table-demo',
    template: `   
        <h4>Editable table with remote data</h4>
        <uni-table [config]="editableRemoteDataCfg"></uni-table>
        <button (click)="testUpdateFilter()">Test updateFilter</button>
        <br><br>
        
        <h4>Editable table with local data</h4>
        <uni-table [config]="editableLocalDataCfg"></uni-table>
        <br><br>
        
        <h4>Read-only table with remote data</h4>
        <uni-table [config]="readOnlyRemoteDataCfg"></uni-table>
        <br><br>
        
        <h4>Read-only table with local data</h4>
        <uni-table [config]="readOnlyLocalDataCfg"></uni-table>
        <button (click)="testTableRefresh()">Test table refresh with new row</button>
    `,
    directives: [UniTable]
})
export class UniTableDemo {
    @ViewChildren(UniTable) tables: any;
 
    localData: any;
    
    expandedFieldsTableCfg;
    
    editableRemoteDataCfg;
    editableLocalDataCfg;
    
    readOnlyRemoteDataCfg;
    readOnlyLocalDataCfg;	
    
    testTableRefresh() {
        this.localData[0].Name = "Navn endret av refresh!";
        this.tables.toArray()[3].refresh(this.localData);
    }
    
    testUpdateFilter() {
        this.tables.toArray()[0].updateFilter('Price gt 200');
    }
    
    constructor(uniHttpService: UniHttp) {
        
        // Create columns to use in the tables
        var idCol = new UniTableColumn('ID', 'Produktnummer', 'number')
        .setEditable(false)
        .setNullable(true);
        
        var nameCol = new UniTableColumn('Name', 'Produktnavn', 'string');
        var priceCol = new UniTableColumn('Price', 'Pris', 'number');
        
        
        // Mocked local data
        this.localData = [
            {ID: 1, Name: 'Vare 1', Price: 10},
            {ID: 2, Name: 'Vare 2', Price: 20},
            {ID: 3, Name: 'Vare 3', Price: 30},
            {ID: 4, Name: 'Vare 4', Price: 40},
            {ID: 5, Name: 'Vare 5', Price: 50},
            {ID: 6, Name: 'Vare 6', Price: 60},
        ];
        
        // Defined callbacks used in the tables
        var updateCallback = (updatedItem) => {
            console.log('Updated: ');
            console.log(updatedItem);
        };
        
        var createCallback = (createdItem) => {
            console.log('Created: ');
            console.log(createdItem);
        };
        
        var deleteCallback = (deletedItem) => {
            console.log('Deleted: ');
            console.log(deletedItem);
        }
        
        var selectCallback = (selectedItem) => {
            console.log('Selected: ');
            console.log(selectedItem);
        }
        
        
        // Editable table working with remote data
        this.editableRemoteDataCfg = new UniTableBuilder('products', true)
        .setFilter('Price gt 100')
        .setPageSize(5)
        .addColumns(idCol, nameCol, priceCol)
        .addCommands(
            'destroy',
            { name: 'Command1', text: 'Command 1', click: (event) => {event.preventDefault(); console.log(event)} },
            { name: 'Command2', text: 'Command 2', click: (event) => {event.preventDefault(); console.log(event)} }
        );
        
        
        // Editable table working with local data
        uniHttpService
        .asGET()
        .usingBusinessDomain()
        .withEndPoint("products")
        .send({top:5})
        .subscribe((response) => {
           this.editableLocalDataCfg = new UniTableBuilder(response, true)
            .setPageSize(5)
            .addColumns(idCol, nameCol, priceCol)
            .setUpdateCallback(updateCallback)
            .setCreateCallback(createCallback)
            .setDeleteCallback(deleteCallback); 
        });
        
        
        // Read-only table working with remote data
        this.readOnlyRemoteDataCfg = new UniTableBuilder('products', false)
        .setPageSize(5)
        .addColumns(idCol, nameCol, priceCol)
        .setSelectCallback(selectCallback);
        
        
        // Read-only table working with local data
        this.readOnlyLocalDataCfg = new UniTableBuilder(this.localData, false)
        .setPageSize(5)
        .addColumns(idCol, nameCol, priceCol)
        .setSelectCallback(selectCallback);
         
    }
}