import {Component, ViewChildren} from 'angular2/core';
import {UniTable, UniTableBuilder, UniTableColumn} from '../../../../framework/uniTable';
import {RouteParams} from 'angular2/router';

import {UniHttp} from '../../../../framework/core/http/http';
declare var jQuery;

@Component({
    selector: 'uni-table-demo',
    template: `   
        <h4>Editable table with remote data lookup and config defined sorting</h4>
        <uni-table [config]="demoTable1"></uni-table>
        <br><br>
        
        <h4>Editable table with local data, create/update/delete callbacks and commands/buttons</h4>
        <uni-table [config]="demoTable2"></uni-table>
        <button class="c2a" (click)="refreshTable()">Test table refresh</button>
        <br><br>
        
        <h4>Read-only table with callback on row click (logs to console)</h4>
        <uni-table [config]="demoTable3"></uni-table>
        <button class="c2a" (click)="updateTableFilter()">Update filter (price > 100)</button>
    `,
    directives: [UniTable]
})
export class UniTableDemo {
    @ViewChildren(UniTable)
    private tables: any;

    private localData: any;
    private leaveTypes: any[];
    private employments: any[];

    private demoTable1: UniTableBuilder;
    private demoTable2: UniTableBuilder;
    private demoTable3: UniTableBuilder;

    constructor(private uniHttpService: UniHttp, params: RouteParams) {

        this.leaveTypes = [
            {ID: '0', Name: 'Ikke valgt'},
            {ID: '1', Name: 'Permisjon'},
            {ID: '2', Name: 'Permittering'}
        ];

        this.uniHttpService.asGET()
            .usingBusinessDomain()
            .withEndPoint('employments')
            .send()
            .subscribe((response) => {
                this.employments = response;
                this.setupDemoTable1();
            });

        // Step1 -> Step2 -> Name is just for testing multi-level objects with local datasource
        this.localData = [
            {ID: 1, Step1: {Step2: {Name: 'Vare 1'}}, Price: 10},
            {ID: 2, Step1: {Step2: {Name: 'Vare 2'}}, Price: 20},
            {ID: 3, Step1: {Step2: {Name: 'Vare 3'}}, Price: 30},
            {ID: 4, Step1: {Step2: {Name: 'Vare 4'}}, Price: 40},
            {ID: 5, Step1: {Step2: {Name: 'Vare 5'}}, Price: 50},
            {ID: 6, Step1: {Step2: {Name: 'Vare 6'}}, Price: 60},
        ];

        this.setupDemoTable2();
        this.setupDemoTable3();
    }

    private setupDemoTable1() {
        var idCol = new UniTableColumn('ID', 'ID', 'number')
            .setEditable(false);

        var fromDateCol = new UniTableColumn('FromDate', 'Startdato', 'date');

        var toDateCol = new UniTableColumn('ToDate', 'Sluttdato', 'date')
            .setCustomEditor('datepicker', {});

        var leavePercentCol = new UniTableColumn('LeavePercent', 'Andel permisjon', 'number')
            .setFormat("{0: #\\'%'}");

        var leaveTypeCol = new UniTableColumn('LeaveType', 'Type', 'string')
            .setTemplate((dataItem) => {
                // Show leave type name instead of ID
                if (this.leaveTypes[dataItem.LeaveType]) {
                    return this.leaveTypes[dataItem.LeaveType].Name;
                } else {
                    return '';
                }
            })
            .setCustomEditor('dropdown', {
                dataSource: this.leaveTypes,
                dataValueField: 'ID',
                dataTextField: 'Name'
            });

        var employmentIDCol = new UniTableColumn('EmploymentID', 'Arbeidsforhold')
            .setTemplate((dataItem) => {
                // Show employment JobName instead of ID
                return this.getEmploymentJobName(dataItem.EmploymentID);
            })
            .setCustomEditor('dropdown', {
                dataSource: this.employments,
                dataValueField: 'ID',
                dataTextField: 'JobName',
            }, (selectedItem, rowModel) => {
                // Change LeavePercent when employment changes (for testing purposes)
                rowModel.set('LeavePercent', 33);
            });

        var commentCol = new UniTableColumn('Description', 'Kommentar', 'string');

        this.demoTable1 = new UniTableBuilder('EmployeeLeave', true)
            .setOrderBy('ID', 'desc')
            .addColumns(
                idCol,
                fromDateCol,
                toDateCol,
                leavePercentCol,
                leaveTypeCol,
                employmentIDCol,
                commentCol
            );
    }

    private setupDemoTable2() {
        // Define columns to use in the table
        var idCol = new UniTableColumn('ID', 'Produktnummer', 'number')
            .setEditable(false);

        var nameCol = new UniTableColumn('Step1.Step2.Name', 'Produktnavn', 'string');
        var priceCol = new UniTableColumn('Price', 'Pris', 'number');

        // Define callback functions for create, update and delete
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
        };

        this.demoTable2 = new UniTableBuilder(this.localData, true)
            .setPageSize(5)
            .setOrderBy('ID', 'desc')
            .setCreateCallback(createCallback)
            .setUpdateCallback(updateCallback)
            .setDeleteCallback(deleteCallback)
            .addCommands(
                'destroy',
                {
                    name: 'Command1', text: 'Command 1', click: (event) => {
                    event.preventDefault();
                    console.log(event);
                }
                },
                {
                    name: 'Command2', text: 'Command 2', click: (event) => {
                    event.preventDefault();
                    console.log(event);
                }
                }
            )
            .addColumns(idCol, nameCol, priceCol);

    }

    private setupDemoTable3() {
        // Define columns to use in the table
        var idCol = new UniTableColumn('ID', 'Produktnummer', 'number')
            .setEditable(false);

        var nameCol = new UniTableColumn('Name', 'Produktnavn', 'string');
        var priceCol = new UniTableColumn('PriceIncVat', 'Pris inkl. mva.', 'number');

        // Define callback function for row clicks
        var selectCallback = (selectedItem) => {
            console.log('Selected: ');
            console.log(selectedItem);
        };

        // Setup table
        this.demoTable3 = new UniTableBuilder('products', false)
            .setSelectCallback(selectCallback)
            .addColumns(idCol, nameCol, priceCol);
    }

    // Returns JobName for the selected ID in employment dropdown
    private getEmploymentJobName(employmentID: number) {
        var jobName = '';

        this.employments.forEach((employment) => {
            if (employment.ID === employmentID) {
                jobName = employment.JobName;
            }
        });
        return jobName;
    };

    private refreshTable() {
        this.localData[0].Name = 'Navn endret etter tabell init!';
        this.tables.toArray()[1].refresh(this.localData);
    }

    private updateTableFilter() {
        this.tables.toArray()[2].updateFilter('Price gt 100');
    }
}