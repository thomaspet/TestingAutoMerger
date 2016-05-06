import {Component, ViewChildren} from 'angular2/core';
import {UniTable, UniTableBuilder, UniTableColumn} from '../../../../../framework/uniTable';
import {ComponentInstruction, RouteParams, Router} from 'angular2/router';
import {UniHttp} from '../../../../../framework/core/http/http';
import {CustomerService} from "../../../../services/services";
import {Customer, BusinessRelation} from "../../../../unientities";

declare var jQuery;

@Component({
    selector: 'customer-list',
    templateUrl: 'app/components/accounting/transquery/list/transqueryList.html',
    directives: [UniTable],
    providers: [CustomerService]
})
export class TransqueryList {
    @ViewChildren(UniTable) tables: any;
    
    periodeTable: UniTableBuilder;
 
    constructor(private uniHttpService: UniHttp, private router: Router, private customerService: CustomerService) {
        this.setupPeriodeTable();
    }
    
    setupPeriodeTable() {
        // Define columns to use in the table
        var periodeCol = new UniTableColumn('Periode', 'Periode', 'string').setWidth('60%');
        var lastYearCol = new UniTableColumn('LastYear', 'Regnskapsår 2015', 'string');
        var thisYearCol = new UniTableColumn('ThisYear', 'Regnskapsår 2016', 'string');
                
        // Define callback function for row clicks
        var selectCallback = (selectedItem) => {
            this.router.navigateByUrl('/sales/transquery/details/' + selectedItem.ID);
        }

        // Setup table
        this.periodeTable = new UniTableBuilder('customers?expand=Info', false)
            .setSelectCallback(selectCallback)
            .setFilterable(false)
            .setPageSize(14)
            .addColumns(periodeCol, lastYearCol, thisYearCol);            
    }
}