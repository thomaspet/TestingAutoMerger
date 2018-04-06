import {Component, OnInit} from '@angular/core';
import {URLSearchParams} from '@angular/http';
import {Router} from '@angular/router';
import {UniTableColumn, UniTableColumnType, UniTableConfig} from '../../../../../framework/ui/unitable/index';
import {SupplierService, ErrorService, CompanySettingsService} from '../../../../services/services';
import {Supplier, CompanySettings} from '../../../../unientities';
import {TabService, UniModules} from '../../../layout/navbar/tabstrip/tabService';

interface IFilter {
    name: string;
    label: string;
    isSelected?: boolean;
    count?: number;
    total?: number;
    filter?: string;
    showStatus?: boolean;
    showJournalID?: boolean;
    route?: string;
    onDataReady?: (data) => void;
    passiveCounter?: boolean;
    hotCounter?: boolean;
}

@Component({
    selector: 'supplier-list',
    templateUrl: './supplierList.html'
})
export class SupplierList implements OnInit {

    private companySettings: CompanySettings;
    private supplierTable: UniTableConfig;
    private lookupFunction: (urlParams: URLSearchParams, filter?: string) => any;
    private filter: string = 'statuscode ne 50001';

    public filters: IFilter[] = [
         {
            label: 'Aktiv',
            name: 'Active',
            filter: 'statuscode ne 50001',
            isSelected: true
        },
        {
            label: 'Inaktiv',
            name: 'Inactive',
            filter: 'statuscode eq 50001',
            passiveCounter: true
        },
        {
            label: 'Alle',
            name: 'All',
            filter: '',
            passiveCounter: true
        },
    ];

    constructor(
        private router: Router,
        private supplierService: SupplierService,
        private tabService: TabService,
        private errorService: ErrorService,
        private companySettingsService: CompanySettingsService
    ) {
        this.tabService.addTab({
            name: 'Leverandører', url: '/accounting/suppliers', active: true, moduleID: UniModules.Suppliers
        });
    }

    public ngOnInit() {
        this.companySettingsService.Get(1)
            .subscribe(settings => {
                this.companySettings = settings;
                this.setupSupplierTable();
            }, err => this.errorService.handle(err));
    }

    public createSupplier() {
        this.router.navigateByUrl('/accounting/suppliers/0');
    }

    public onRowSelected (event) {
        this.router.navigateByUrl('/accounting/suppliers/' + event.rowModel.ID);
    }

     public onFilterClick(filter: IFilter, searchFilter?: string) {
        this.filters.forEach(f => f.isSelected = false);
        filter.isSelected = true;
        this.filter = filter.filter;
        this.setupSupplierTable();
    }

    private setupSupplierTable() {

        this.lookupFunction = (urlParams: URLSearchParams, filter?) => {
            let params = urlParams;

            if (params === null) {
                params = new URLSearchParams();
            }

            params.set('expand', 'Info,Dimensions,Dimensions.Department,Dimensions.Project');

            params.set('filter', this.filter);

            return this.supplierService.GetAllByUrlSearchParams(params)
                .catch((err, obs) => this.errorService.handleRxCatch(err, obs));
        };

        // Define columns to use in the table
        const numberCol = new UniTableColumn(
            'SupplierNumber', 'Leverandørnr', UniTableColumnType.Text
        ).setWidth('15%').setFilterOperator('contains');
        const nameCol = new UniTableColumn('Info.Name', 'Navn', UniTableColumnType.Text).setFilterOperator('contains');
        const orgNoCol = new UniTableColumn(
            'OrgNumber', 'Orgnr', UniTableColumnType.Text
        ).setWidth('15%').setFilterOperator('contains');
        const glnCol = new UniTableColumn(
            'GLN', 'GLN', UniTableColumnType.Text
        ).setFilterOperator('contains').setVisible(false);
        const peppolCol = new UniTableColumn(
            'PeppolAddress', 'Peppoladresse', UniTableColumnType.Text
        ).setFilterOperator('contains').setVisible(false);
        const departmentCol = new UniTableColumn(
            'Dimensions.Department.DepartmentNumber', 'Avdeling', UniTableColumnType.Text
        ).setWidth('15%').setFilterOperator('contains')
            .setTemplate((data: Supplier) => {
                return data.Dimensions && data.Dimensions.Department
                    ? data.Dimensions.Department.DepartmentNumber + ': ' + data.Dimensions.Department.Name
                    : '';
            });
        const projectCol = new UniTableColumn(
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
