import {Component, ViewChildren} from 'angular2/core';
import {UniTable, UniTableBuilder, UniTableColumn} from '../../../../../framework/uniTable';
import {ComponentInstruction, RouteParams, Router} from 'angular2/router';
import {UniHttp} from '../../../../../framework/core/http/http';

declare var jQuery;

@Component({
    selector: 'customer-list',
    templateUrl: 'app/components/sales/customer/list/customerList.html',
    directives: [UniTable]
})
export class CustomerList {
    @ViewChildren(UniTable) tables: any;
    
    customerTable: UniTableBuilder;
 
    constructor(private uniHttpService: UniHttp, private router: Router) {
        this.setupCustomerTable();
    }
    
    createCustomer() {        
        this.router.navigateByUrl('/customer/add');
    }

    setupCustomerTable() {
        // Define columns to use in the table
        var numberCol = new UniTableColumn('ID', 'Kundenr', 'number').setWidth('15%');
        var nameCol = new UniTableColumn('Info.Name', 'Navn', 'string');
        var orgNoCol = new UniTableColumn('Orgnumber', 'Orgnr', 'string').setWidth('15%');
                
        // Define callback function for row clicks
        var selectCallback = (selectedItem) => {
            console.log('Selected: ' + selectedItem.ID);            
            this.router.navigateByUrl('/customer/details/' + selectedItem.ID);
        }

        // Setup table
        this.customerTable = new UniTableBuilder('customers?expand=Info', false)
            .setSelectCallback(selectCallback)
            .setFilterable(false)
            .setPageSize(25)
            .addColumns(numberCol, nameCol, orgNoCol);            
    }
}