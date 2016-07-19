import {Component} from '@angular/core';
import {URLSearchParams} from '@angular/http';
import {Router} from '@angular/router';
import {UniTable, UniTableColumn, UniTableColumnType, UniTableConfig} from 'unitable-ng2/main';
import {SupplierService} from '../../../../services/services';
import {TabService} from '../../../layout/navbar/tabstrip/tabService';

declare var jQuery;

@Component({
    selector: 'supplier-list',
    templateUrl: 'app/components/sales/supplier/list/supplierList.html',
    directives: [UniTable],
    providers: [SupplierService]
})
export class SupplierList {
    
    private supplierTable: UniTableConfig;
    private lookupFunction: (urlParams: URLSearchParams) => any;
    
    constructor(private router: Router, private supplierService: SupplierService, private tabService: TabService) {
        this.tabService.addTab({ name: "Leverandører", url: "/sales/suppliers", active: true, moduleID: 2 });    
        this.setupSupplierTable();
    }
    
    private createSupplier() {
        this.router.navigateByUrl('/sales/suppliers/0');
    }

    private onRowSelected (event) {
        this.router.navigateByUrl('/sales/suppliers/' + event.rowModel.ID);
    };

    private setupSupplierTable() {
        
        this.lookupFunction = (urlParams: URLSearchParams) => {
            let params = urlParams;
            
            if (params === null) {
                params = new URLSearchParams();
            }
            
            params.set('expand', 'Info');
            
            return this.supplierService.GetAllByUrlSearchParams(params);
        };
        
        // Define columns to use in the table
        var numberCol = new UniTableColumn('SupplierNumber', 'Leverandørnr', UniTableColumnType.Text).setWidth('15%').setFilterOperator('contains');
        var nameCol = new UniTableColumn('Info.Name', 'Navn', UniTableColumnType.Text).setFilterOperator('contains');
        var orgNoCol = new UniTableColumn('Orgnumber', 'Orgnr', UniTableColumnType.Text).setWidth('15%').setFilterOperator('contains');
         
        // Setup table
        this.supplierTable = new UniTableConfig(false, true, 25)            
            .setSearchable(true)            
            .setColumns([numberCol, nameCol, orgNoCol]);
    }
}