import {Component, ViewChildren} from 'angular2/core';
import {UniTable, UniTableBuilder, UniTableColumn} from '../../../../../framework/uniTable';
import {ComponentInstruction, RouteParams, Router} from 'angular2/router';
import {UniHttp} from '../../../../../framework/core/http/http';
import {CustomerService} from "../../../../services/services";
import {Customer, BusinessRelation} from "../../../../unientities";

declare var jQuery;

@Component({
    selector: 'customer-list',
    templateUrl: 'app/components/sales/customer/list/customerList.html',
    directives: [UniTable],
    providers: [CustomerService]
})
export class CustomerList {
    @ViewChildren(UniTable) tables: any;
    
    customerTable: UniTableBuilder;
 
    constructor(private uniHttpService: UniHttp, private router: Router, private customerService: CustomerService) {
        this.setupCustomerTable();
    }
    
    createCustomer() {        
        /*     
        this.customerService.setRelativeUrl("customer"); // TODO: remove when its fixed
        this.customerService.GetNewEntity(["Info"]).subscribe((c)=> {
            console.log("CUSTOMER");
            console.log(c);
            this.customerService.Post(c)
                .subscribe(
                    (data) => {
                        this.router.navigateByUrl('/customer/details/' + data.ID);        
                    },
                    (err) => console.log('Error creating customer: ', err)
                );        
        });    */
        
        /* OLD VERSION */
                var c = new Customer();
        c.Info = new BusinessRelation(); 
        
        this.customerService.Post(c)
            .subscribe(
                (data) => {
                    console.log('Kunde opprettet, id: ' + data.ID);
                    this.router.navigateByUrl('/sales/customer/details/' + data.ID);        
                },
                (err) => console.log('Error creating customer: ', err)
            );      
    }

    setupCustomerTable() {
        // Define columns to use in the table
        var numberCol = new UniTableColumn('ID', 'Kundenr', 'number').setWidth('15%');
        var nameCol = new UniTableColumn('Info.Name', 'Navn', 'string');
        var orgNoCol = new UniTableColumn('Orgnumber', 'Orgnr', 'string').setWidth('15%');
                
        // Define callback function for row clicks
        var selectCallback = (selectedItem) => {
            this.router.navigateByUrl('/sales/customer/details/' + selectedItem.ID);
        }

        // Setup table
        this.customerTable = new UniTableBuilder('customers?expand=Info', false)
            .setSelectCallback(selectCallback)
            .setFilterable(false)
            .setPageSize(25)
            .addColumns(numberCol, nameCol, orgNoCol);            
    }
}