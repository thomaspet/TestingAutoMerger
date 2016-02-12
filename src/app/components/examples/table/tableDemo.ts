import {Component} from 'angular2/core';
import {UniTable, UniTableBuilder, UniTableColumn} from '../../../../framework/uniTable';

@Component({
    selector: 'uni-table-demo', 
    template: `   
        <h4>Editable table with remote data</h4>
        <uni-table [config]="editableRemoteDataCfg"></uni-table>
        <br><br>
        
        <h4>Editable table with local data</h4>
        <uni-table [config]="editableLocalDataCfg"></uni-table>
        <br><br>
        
        <h4>Read-only table with remote data</h4>
        <uni-table [config]="readOnlyRemoteDataCfg"></uni-table>
        <br><br>
        
        <h4>Read-only table with local data</h4>
        <uni-table [config]="readOnlyLocalDataCfg"></uni-table>
    `,
    directives: [UniTable]
})
export class UniTableDemo {
    editableRemoteDataCfg;
    editableLocalDataCfg;
    
    readOnlyRemoteDataCfg;
    readOnlyLocalDataCfg;	
    
    constructor() {
        // Create columns to use in the tables
        var idCol = new UniTableColumn('ID', 'Produktnummer', 'number')
        .setEditable(false)
        .setNullable(true);
        
        var nameCol = new UniTableColumn('Name', 'Produktnavn', 'string');
        var priceCol = new UniTableColumn('Price', 'Pris', 'number');
        
        
        // Mocked local data
        var localData = [
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
        .setPageSize(5)
        .addColumns(idCol, nameCol, priceCol);
        
        
        // Editable table working with local data
        this.editableLocalDataCfg = new UniTableBuilder(localData, true)
        .setPageSize(5)
        .addColumns(idCol, nameCol, priceCol)
        .setUpdateCallback(updateCallback)
        .setCreateCallback(createCallback)
        .setDeleteCallback(deleteCallback);
        
        
        // Read-only table working with remote data
        this.readOnlyRemoteDataCfg = new UniTableBuilder('products', false)
        .setPageSize(5)
        .addColumns(idCol, nameCol, priceCol)
        .setSelectCallback(selectCallback);
        
        
        // Read-only table working with local data
        this.readOnlyLocalDataCfg = new UniTableBuilder(localData, false)
        .setPageSize(5)
        .addColumns(idCol, nameCol, priceCol)
        .setSelectCallback(selectCallback);
         
    }
}