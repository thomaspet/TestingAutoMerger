import {Component, Input, ElementRef, ViewChildren, AfterViewInit} from 'angular2/core';
import {UniTable, UniTableBuilder, UniTableColumn} from '../../../../framework/uniTable';

import {UniHttp} from '../../../../framework/core/http';

declare var jQuery;

@Component({
    selector: 'table-dropdown-test',
    template: '<input />'
})
class TableDropdown {
    @Input() kendoOptions;
    nativeElement;
    
    constructor(elementRef: ElementRef) {
        this.nativeElement = jQuery(elementRef.nativeElement);
        this.nativeElement.kendoDropDownList(this.kendoOptions);
    }
    
    ngAfterViewInit() {
        console.log(this.nativeElement);
        this.nativeElement.kendoDropDownList(this.kendoOptions);
    }
}

@Component({
    selector: 'uni-table-demo',
    template: `   
        <h4>Table with custom editor (dropdown) in "Type" column</h4>
        <uni-table [config]="customEditorCfg"></uni-table>
        <br><br>
        
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
    directives: [UniTable, TableDropdown]
})
export class UniTableDemo {
    @ViewChildren(UniTable) tables: any;
 
    localData: any;
    
    expandedFieldsTableCfg;
    
    editableRemoteDataCfg;
    editableLocalDataCfg;
    
    readOnlyRemoteDataCfg;
    readOnlyLocalDataCfg;	
    
    customEditorCfg;
    
    leaveTypes: any[];
    employments: any[];
    
    getLeaveTypeText = (typeID: string) => {
        var text = "";
        this.leaveTypes.forEach((leaveType) => {
            if (leaveType.typeID === typeID) {
                text = leaveType.text;
            }
        });
        return text;
    }
    
    getEmploymentJobName = (employmentID: number) => {
        var jobName = "";
        
        this.employments.forEach((employment) => {
            if (employment.ID === employmentID) {
                jobName = employment.JobName;
            }
        });
        return jobName;
    }
    
    setupCustomEditorCfg() {
        var idCol = new UniTableColumn('ID', 'Id', 'number')
        .setEditable(false)
        .setNullable(true);
        
        var fromDateCol = new UniTableColumn('FromDate', 'Startdato', 'date')
        .setFormat("{0: dd.MM.yyyy}");
        
        var toDateCol = new UniTableColumn('ToDate', 'Sluttdato', 'date')
        .setFormat("{0: dd.MM.yyyy}")
        .setCustomEditor('datepicker', {});
        
        var leaveTypeCol = new UniTableColumn('LeaveType', 'Type', 'string')
        .setTemplate((dataItem) => {
            return this.getLeaveTypeText(dataItem.LeaveType);
        })
        .setCustomEditor('dropdown', {
            dataSource: this.leaveTypes,
            dataValueField: 'typeID',
            dataTextField: 'text'
        });
        
        var leavePercentCol = new UniTableColumn('LeavePercent', 'Andel permisjon', 'number')
        .setFormat("{0: #\\'%'}");
        
        var commentCol = new UniTableColumn('Description', 'Kommentar', 'string');
        
        var employmentIDCol = new UniTableColumn('EmploymentID', 'Arbeidsforhold')
        .setTemplate((dataItem) => {
            return this.getEmploymentJobName(dataItem.EmploymentID)
        })
        .setCustomEditor('dropdown', {
            dataSource: this.employments,
            dataValueField: 'ID',
            dataTextField: 'JobName',
        }, (selectedItem, rowModel) => {
            // Change LeavePercent when employment changes (for testing purposes)
            rowModel.set('LeavePercent', 33);
        });
        
        
        this.customEditorCfg = new UniTableBuilder('EmployeeLeave', true)
        .addColumns(idCol, fromDateCol, toDateCol, leavePercentCol, leaveTypeCol, employmentIDCol, commentCol);

    }
    
    constructor(private uniHttpService: UniHttp) {
        // Test table with custom editor
        this.leaveTypes = [
          { typeID: "1", text: "Permisjon" },
          { typeID: "2", text: "Permittering" }  
        ];
        
        this.uniHttpService.asGET()
        .usingBusinessDomain()
        .withEndPoint('employments')
        .send()
        .subscribe((response) => {
            this.employments = response;
            this.setupCustomEditorCfg();
        });        
        
        
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
    
    testTableRefresh() {
        this.localData[0].Name = "Navn endret av refresh!";
        this.tables.toArray()[3].refresh(this.localData);
    }
    
    testUpdateFilter() {
        this.tables.toArray()[0].updateFilter('Price gt 200');
    }
}