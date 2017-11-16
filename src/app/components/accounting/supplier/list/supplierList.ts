import {Component} from '@angular/core';
import {URLSearchParams} from '@angular/http';
import {Router} from '@angular/router';
import {UniTableColumn, UniTableColumnType, UniTableConfig} from '../../../../../framework/ui/unitable/index';
import {SupplierService, ErrorService} from '../../../../services/services';
import {Supplier} from '../../../../unientities';
import {TabService, UniModules} from '../../../layout/navbar/tabstrip/tabService';

@Component({
    selector: 'supplier-list',
    templateUrl: './supplierList.html'
})
export class SupplierList {

    private supplierTable: UniTableConfig;
    private lookupFunction: (urlParams: URLSearchParams) => any;

    constructor(
        private router: Router,
        private supplierService: SupplierService,
        private tabService: TabService,
        private errorService: ErrorService
    ) {
        this.tabService.addTab({
            name: 'Leverandører', url: '/accounting/suppliers', active: true, moduleID: UniModules.Suppliers
        });
        this.setupSupplierTable();
    }

    public createSupplier() {
        this.router.navigateByUrl('/accounting/suppliers/0');
    }

    public onRowSelected (event) {
        this.router.navigateByUrl('/accounting/suppliers/' + event.rowModel.ID);
    };

    private setupSupplierTable() {

        this.lookupFunction = (urlParams: URLSearchParams) => {
            let params = urlParams;

            if (params === null) {
                params = new URLSearchParams();
            }

            params.set('expand', 'Info,Dimensions,Dimensions.Department,Dimensions.Project');

            return this.supplierService.GetAllByUrlSearchParams(params)
                .catch((err, obs) => this.errorService.handleRxCatch(err, obs));
        };

        // Define columns to use in the table
        let numberCol = new UniTableColumn(
            'SupplierNumber', 'Leverandørnr', UniTableColumnType.Text
        ).setWidth('15%').setFilterOperator('contains');
        let nameCol = new UniTableColumn('Info.Name', 'Navn', UniTableColumnType.Text).setFilterOperator('contains');
        let orgNoCol = new UniTableColumn(
            'OrgNumber', 'Orgnr', UniTableColumnType.Text
        ).setWidth('15%').setFilterOperator('contains');
        let glnCol = new UniTableColumn(
            'GLN', 'GLN', UniTableColumnType.Text
        ).setFilterOperator('contains').setVisible(false);
        let peppolCol = new UniTableColumn(
            'PeppolAddress', 'Peppoladresse', UniTableColumnType.Text
        ).setFilterOperator('contains').setVisible(false);
        let departmentCol = new UniTableColumn(
            'Dimensions.Department.DepartmentNumber', 'Avdeling', UniTableColumnType.Text
        ).setWidth('15%').setFilterOperator('contains')
            .setTemplate((data: Supplier) => {
                return data.Dimensions && data.Dimensions.Department
                    ? data.Dimensions.Department.DepartmentNumber + ': ' + data.Dimensions.Department.Name
                    : '';
            });
        let projectCol = new UniTableColumn(
            'Dimensions.Project.ProjectNumber', 'Prosjekt', UniTableColumnType.Text
        ).setWidth('15%').setFilterOperator('contains')
            .setTemplate((data: Supplier) => {
                return data.Dimensions && data.Dimensions.Project
                    ? data.Dimensions.Project.ProjectNumber + ': ' + data.Dimensions.Project.Name
                    : '';
                });

        // Setup table
        this.supplierTable = new UniTableConfig('common.supplier.supplierList', false, true, 25)
            .setSearchable(true)
            .setColumnMenuVisible(true)
            .setColumns([numberCol, nameCol, orgNoCol, peppolCol, glnCol, departmentCol, projectCol]);
    }
}
