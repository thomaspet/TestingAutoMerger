import {Component, ViewChildren} from 'angular2/core';
import {UniTable, UniTableBuilder, UniTableColumn} from '../../../../../framework/uniTable';
import {ComponentInstruction, RouteParams, Router} from 'angular2/router';
import {UniHttp} from '../../../../../framework/core/http/http';
import {SupplierService} from "../../../../services/services";
import {Supplier, BusinessRelation} from "../../../../unientities";

declare var jQuery;

@Component({
    selector: 'supplier-list',
    templateUrl: 'app/components/sales/supplier/list/supplierList.html',
    directives: [UniTable],
    providers: [SupplierService]
})
export class SupplierList {
    @ViewChildren(UniTable) tables: any;
    
    supplierTable: UniTableBuilder;
 
    constructor(private uniHttpService: UniHttp, private router: Router, private supplierService: SupplierService) {
        this.setupSupplierTable();
    }
    
    createSupplier() {        
        /*     
        this.supplierService.setRelativeUrl("supplier"); // TODO: remove when its fixed
        this.supplierService.GetNewEntity(["Info"]).subscribe((s)=> {
            this.supplierService.Post(s)
                .subscribe(
                    (data) => {
                        this.router.navigateByUrl('/supplier/details/' + data.ID);        
                    },
                    (err) => console.log('Error creating supplier: ', err)
                );        
        });    */
        
        /* OLD VERSION */
        var c = new Supplier();
        c.Info = new BusinessRelation(); 
        
        this.supplierService.Post(c)
            .subscribe(
                (data) => {
                    console.log('Leverandør opprettet, id: ' + data.ID);
                    this.router.navigateByUrl('/sales/supplier/details/' + data.ID);        
                },
                (err) => console.log('Error creating supplier: ', err)
            );      
    }

    setupSupplierTable() {
        // Define columns to use in the table
        var numberCol = new UniTableColumn('ID', 'Leverandørnr', 'number').setWidth('15%');
        var nameCol = new UniTableColumn('Info.Name', 'Navn', 'string');
        var orgNoCol = new UniTableColumn('Orgnumber', 'Orgnr', 'string').setWidth('15%');
                
        // Define callback function for row clicks
        var selectCallback = (selectedItem) => {
            this.router.navigateByUrl('/sales/supplier/details/' + selectedItem.ID);
        }

        // Setup table
        this.supplierTable = new UniTableBuilder('suppliers?expand=Info', false)
            .setSelectCallback(selectCallback)
            .setFilterable(false)
            .setPageSize(25)
            .addColumns(numberCol, nameCol, orgNoCol);            
    }
}