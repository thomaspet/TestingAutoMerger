import {Component, ViewChild} from 'angular2/core';
import {UniTable, UniTableBuilder, UniTableColumn} from '../../../../framework/uniTable';

@Component({
    selector: 'uni-table-demo',
    // template: `
    //     <h4>Table with expanded properties in lookup</h4>
    //     <uni-table [config]="expandedFieldsTableCfg"></uni-table>
    // `, 
    // template: `   
    //     <h4>Editable table with remote data</h4>
    //     <uni-table [config]="editableRemoteDataCfg"></uni-table>
    //     <br><br>
    //     
    //     <h4>Editable table with local data</h4>
    //     <uni-table [config]="editableLocalDataCfg"></uni-table>
    //     <br><br>
    //     
    //     <h4>Read-only table with remote data</h4>
    //     <uni-table [config]="readOnlyRemoteDataCfg"></uni-table>
    //     <br><br>
    //     
    //     <h4>Read-only table with local data</h4>
    //     <uni-table [config]="readOnlyLocalDataCfg"></uni-table>
    //     <button (click)="addRow()">Test table refresh with new row</button>
    // `,
    template: `   
        <h4>Read-only table with local data</h4>
        <uni-table [config]="readOnlyLocalDataCfg"></uni-table>
        <button (click)="testTableRefresh()">Test table refresh with new row</button>
    `,
    directives: [UniTable]
})
export class UniTableDemo {
    @ViewChild(UniTable) table: UniTable;
 
    localData: any;
    
    expandedFieldsTableCfg;
    
    editableRemoteDataCfg;
    editableLocalDataCfg;
    
    readOnlyRemoteDataCfg;
    readOnlyLocalDataCfg;	
    
    testTableRefresh() {
        this.localData[0].Name = "Navn endret av refresh!";
        this.table.refresh(this.localData);
    }
    
    constructor() {
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
        .setPageSize(5)
        .addColumns(idCol, nameCol, priceCol);
        
        
        // Editable table working with local data
        this.editableLocalDataCfg = new UniTableBuilder(this.localData, true)
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
        this.readOnlyLocalDataCfg = new UniTableBuilder(this.localData, false)
        .setPageSize(5)
        .addColumns(idCol, nameCol, priceCol)
        .setSelectCallback(selectCallback);
         
        
        
        // Expand test
        // var employeeIdCol = new UniTableColumn('ID', 'ID', 'number')
        // .setEditable(false)
        // .setNullable(true);
        // 
        // var employeeNumberCol = new UniTableColumn('EmployeeNumber', 'Ansattnummer', 'number')
        // .setEditable(false);
        // 
        // var employeeNameCol = new UniTableColumn('BusinessRelationInfo.Name', 'Navn', 'string');
        // 
        // var employeeEmailCol = new UniTableColumn('BusinessRelationInfo.DefaultEmail.EmailAddress', 'Epost', 'string')
        // .setNullable(true);
        // 
        // 
        // this.expandedFieldsTableCfg = new UniTableBuilder('employees', true)
        // .setExpand('BusinessRelationInfo,BusinessRelationInfo.DefaultEmail')
        // .setFilter('EmployeeNumber eq 42')
        // .addColumns(employeeIdCol, employeeNumberCol, employeeNameCol, employeeEmailCol);
        
//         var data = [
//             {
//                 ID: 1,
//                 EmployeeNumber: 1,
//                 BusinessRelationInfo: {
//                     Name: 'Anders',
//                     DefaultEmail: {
//                         EmailAddress: 'anders@test.com'
//                     }                    
//                 }
//             },
//             {
//                 ID: 2,
//                 EmployeeNumber: 2,
//                 BusinessRelationInfo: {
//                     Name: 'Jonis',
//                     DefaultEmail: {
// 
//                     }                    
//                 }
//             },
//             {
//                 ID: 3,
//                 EmployeeNumber: 3,
//                 BusinessRelationInfo: {
//                     DefaultEmail: {}                    
//                 }
//             },
//         ];
//         this.expandedFieldsTableCfg = new UniTableBuilder(data, true)
//         .setUpdateCallback((updatedItem) => {
//             var myObj = {
//                 ID: 1,
//                 EmployeeNumber: 1,
//                 BusinessRelationInfo: {
//                     Name: '',
//                     DefaultEmail: {
//                         EmailAddress: ''
//                     }
//                 }
//             }
//             console.log(jQuery.extend(myObj, updatedItem));
//         })
//         .addColumns(employeeIdCol, employeeNumberCol, employeeNameCol, employeeEmailCol);
        
    }
}