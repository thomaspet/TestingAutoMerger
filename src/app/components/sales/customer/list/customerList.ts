import { IToolbarConfig } from './../../../common/toolbar/toolbar';
import {Component, ViewChild} from '@angular/core';
import {UniTable, UniTableColumn, UniTableColumnType, UniTableConfig} from 'unitable-ng2/main';
import {Router} from '@angular/router';
import {UniHttp} from '../../../../../framework/core/http/http';
import {URLSearchParams} from '@angular/http';
import {CustomerService, ErrorService} from '../../../../services/services';
import {TabService, UniModules} from '../../../layout/navbar/tabstrip/tabService';
import {Customer} from '../../../../unientities';

@Component({
    selector: 'customer-list',
    templateUrl: './customerList.html'
})
export class CustomerList {
    @ViewChild(UniTable) table: any;

    private customerTable: UniTableConfig;
    private lookupFunction: (urlParams: URLSearchParams) => any;

    private toolbarconfig: IToolbarConfig = {
        title: 'Kunder',
        omitFinalCrumb: true
    };

    constructor(
        private uniHttpService: UniHttp,
        private router: Router,
        private customerService: CustomerService,
        private tabService: TabService,
        private errorService: ErrorService
    ) {
        this.tabService.addTab({ name: 'Kunder', url: '/sales/customer', moduleID: UniModules.Customers, active: true });
        this.setupCustomerTable();
    }

    private createCustomer() {
        this.router.navigateByUrl('/sales/customer/new');
    }

    private onRowSelected(event) {
        this.router.navigateByUrl('/sales/customer/' + event.rowModel.ID);
    };

    private setupCustomerTable() {

        this.lookupFunction = (urlParams: URLSearchParams) => {
            let params = urlParams;

            if (params === null) {
                params = new URLSearchParams();
            }

            if (!params.get('orderby')) {
                params.set('orderby', 'ID DESC');
            }

            params.set('expand', 'Info,Dimensions,Dimensions.Department,Dimensions.Project');

            return this.customerService.GetAllByUrlSearchParams(params)
                .catch((err, obs) => this.errorService.handleRxCatch(err, obs));
        };

        // Define columns to use in the table
        let numberCol = new UniTableColumn('CustomerNumber', 'Kundenr', UniTableColumnType.Text).setWidth('15%').setFilterOperator('contains');
        let nameCol = new UniTableColumn('Info.Name', 'Navn', UniTableColumnType.Text).setFilterOperator('contains');
        let orgNoCol = new UniTableColumn('OrgNumber', 'Orgnr', UniTableColumnType.Text).setWidth('15%').setFilterOperator('contains');
        let glnCol = new UniTableColumn('GLN', 'GLN', UniTableColumnType.Text).setFilterOperator('contains').setVisible(false);
        let peppolCol = new UniTableColumn('PeppolAddress', 'Peppoladresse', UniTableColumnType.Text).setFilterOperator('contains').setVisible(false);
        let departmentCol = new UniTableColumn('Dimensions.Department.DepartmentNumber', 'Avdeling', UniTableColumnType.Text).setWidth('15%').setFilterOperator('contains')
            .setTemplate((data: Customer) => {return data.Dimensions && data.Dimensions.Department ? data.Dimensions.Department.DepartmentNumber + ': ' + data.Dimensions.Department.Name : ''; });
        let projectCol = new UniTableColumn('Dimensions.Project.ProjectNumber', 'Prosjekt', UniTableColumnType.Text).setWidth('15%').setFilterOperator('contains')
            .setTemplate((data: Customer) => {return data.Dimensions && data.Dimensions.Project ? data.Dimensions.Project.ProjectNumber + ': ' + data.Dimensions.Project.Name : ''; });

        // Setup table
        this.customerTable = new UniTableConfig(false, true, 25)
            .setSearchable(true)
            .setColumnMenuVisible(true)
            .setColumns([numberCol, nameCol, orgNoCol, peppolCol, glnCol, departmentCol, projectCol]);
    }
}
