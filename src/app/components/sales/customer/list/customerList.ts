import {Component, ViewChild} from '@angular/core';
import {UniTable, UniTableColumn, UniTableColumnType, UniTableConfig} from 'unitable-ng2/main';
import {Router} from '@angular/router-deprecated';
import {UniHttp} from '../../../../../framework/core/http/http';
import {URLSearchParams} from '@angular/http';
import {CustomerService} from "../../../../services/services";
import {Customer, BusinessRelation} from "../../../../unientities";
import {TabService} from "../../../layout/navbar/tabstrip/tabService";

declare var jQuery;

@Component({
    selector: 'customer-list',
    templateUrl: 'app/components/sales/customer/list/customerList.html',
    directives: [UniTable],
    providers: [CustomerService]
})
export class CustomerList {
    @ViewChild(UniTable) table: any;
    
    private customerTable: UniTableConfig;
    private lookupFunction: (urlParams: URLSearchParams) => any;
 
    constructor(private uniHttpService: UniHttp, private router: Router, private customerService: CustomerService, private tabService: TabService) {
        this.tabService.addTab({ name: "Kunder", url: "/sales/customer", moduleID: 1, active: true });
        this.setupCustomerTable();
    }
    
    private createCustomer() {
        this.router.navigateByUrl('/sales/customer/details/0');
    }

    private onRowSelected(event) {
        this.router.navigateByUrl('/sales/customer/details/' + event.rowModel.ID);
    };

    private setupCustomerTable() {
        
        this.lookupFunction = (urlParams: URLSearchParams) => {
            let params = urlParams;
            
            if (params === null) {
                params = new URLSearchParams();
            }
            
            return this.customerService.GetAllByUrlSearchParams(params);
        };
        
        // Define columns to use in the table
        var numberCol = new UniTableColumn('CustomerNumber', 'Kundenr', UniTableColumnType.Text).setWidth('15%').setFilterOperator('contains');
        var nameCol = new UniTableColumn('Info.Name', 'Navn', UniTableColumnType.Text).setFilterOperator('contains');
        var orgNoCol = new UniTableColumn('OrgNumber', 'Orgnr', UniTableColumnType.Text).setWidth('15%').setFilterOperator('contains');
         
        // Setup table
        this.customerTable = new UniTableConfig(false, true, 25)            
            .setSearchable(true)            
            .setColumns([numberCol, nameCol, orgNoCol]);   
                     
    }
}