import {Component} from '@angular/core';
import {URLSearchParams} from '@angular/http';
import {Router} from '@angular/router';
import {UniTable, UniTableColumn, UniTableColumnType, UniTableConfig} from 'unitable-ng2/main';
import {SupplierService} from '../../../../services/services';
import {Supplier} from '../../../../unientities';

import {TabService, UniModules} from '../../../layout/navbar/tabstrip/tabService';

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
        this.tabService.addTab({ name: 'Leverandører', url: '/sales/suppliers', active: true, moduleID: UniModules.Suppliers });
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

            params.set('expand', 'Info,Dimensions,Dimensions.Department,Dimensions.Project');

            return this.supplierService.GetAllByUrlSearchParams(params);
        };

        // Define columns to use in the table
        let numberCol = new UniTableColumn('SupplierNumber', 'Leverandørnr', UniTableColumnType.Text).setWidth('15%').setFilterOperator('contains');
        let nameCol = new UniTableColumn('Info.Name', 'Navn', UniTableColumnType.Text).setFilterOperator('contains');
        let orgNoCol = new UniTableColumn('Orgnumber', 'Orgnr', UniTableColumnType.Text).setWidth('15%').setFilterOperator('contains');
        let departmentCol = new UniTableColumn('Dimensions.DepartmentNumber', 'Avdeling', UniTableColumnType.Text).setWidth('15%').setFilterOperator('contains')
            .setTemplate((data: Supplier) => {return data.Dimensions && data.Dimensions.Department ? data.Dimensions.Department.DepartmentNumber + ': ' + data.Dimensions.Department.Name : ''; });
        let projectCol = new UniTableColumn('Dimensions.ProjectNumber', 'Prosjekt', UniTableColumnType.Text).setWidth('15%').setFilterOperator('contains')
            .setTemplate((data: Supplier) => {return data.Dimensions && data.Dimensions.Project ? data.Dimensions.Project.ProjectNumber + ': ' + data.Dimensions.Project.Name : ''; });

        // Setup table
        this.supplierTable = new UniTableConfig(false, true, 25)
            .setSearchable(true)
            .setColumns([numberCol, nameCol, orgNoCol, departmentCol, projectCol]);
    }
}