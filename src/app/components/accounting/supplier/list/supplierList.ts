import {Component, OnInit} from '@angular/core';
import {URLSearchParams} from '@angular/http';
import {Router} from '@angular/router';
import {UniTableColumn, UniTableColumnType, UniTableConfig} from '@uni-framework/ui/unitable/index';
import {SupplierService, ErrorService, CompanySettingsService, StatisticsService} from '@app/services/services';
import {Supplier, CompanySettings} from '@app/unientities';
import {TabService, UniModules} from '../../../layout/navbar/tabstrip/tabService';
import {IUniTab} from '@app/components/layout/uniTabs/uniTabs';
import {IUniSaveAction} from '@uni-framework/save/save';
import {StatusCode} from '../../../sales/salesHelper/salesEnums';

@Component({
    selector: 'supplier-list',
    templateUrl: './supplierList.html'
})
export class SupplierList implements OnInit {

    private companySettings: CompanySettings;
    private supplierTable: UniTableConfig;
    public lookupFunction: (urlParams: URLSearchParams, filter?: string) => any;

    private filter: string = `StatusCode eq ${StatusCode.Active}`;
    public tabs: IUniTab[] = [
        {name: 'Kladd', value: `(StatusCode eq ${StatusCode.Pending} or StatusCode eq null)`},
        {name: 'Aktiv', value: `StatusCode eq ${StatusCode.Active}`},
        {name: 'Inaktiv', value: `StatusCode eq ${StatusCode.InActive}`},
        {name: 'Blokkert', value: `StatusCode eq ${StatusCode.Error}`},
        {name: 'Alle', value: `(StatusCode ne ${StatusCode.Deleted} or StatusCode eq null)`},
    ];

    public createNewAction: IUniSaveAction = {
        label: 'Ny leverandør',
        action: () => this.createSupplier()
    };

    constructor(
        private router: Router,
        private supplierService: SupplierService,
        private tabService: TabService,
        private errorService: ErrorService,
        private companySettingsService: CompanySettingsService,
        private statisticsService: StatisticsService,
    ) {
        this.tabService.addTab({
            name: 'Leverandører',
            url: '/accounting/suppliers',
            active: true,
            moduleID: UniModules.Suppliers
        });
    }

    public ngOnInit() {
        this.statisticsService.GetAll(
            `model=Supplier` +
            `&select=sum(casewhen((Supplier.StatusCode eq '${StatusCode.Active}')\,1\,0)) as Active,` +
            `sum(casewhen(((isnull(Supplier.StatusCode, 0) eq 0) or Supplier.StatusCode eq '${StatusCode.Pending}')\,1\,0)) as Draft,` +
            `sum(casewhen((Supplier.StatusCode eq '${StatusCode.InActive}')\,1\,0)) as Inactive,` +
            `sum(casewhen(isnull(StatusCode, 0) ne ${StatusCode.Deleted}\,1\,0)) as AllSuppliers`
        ).subscribe(
            res => {
                this.tabs[0].count = res.Data[0].Draft;
                this.tabs[1].count = res.Data[0].Active;
                this.tabs[2].count = res.Data[0].Inactive;
                this.tabs[3].count = res.Data[0].AllSuppliers;
            },
            err => this.errorService.handle(err)
        );

        this.companySettingsService.Get(1).subscribe(settings => {
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

     public onFilterClick(filter: IUniTab) {
        this.filter = filter.value;
        this.setupSupplierTable();
    }

    private setupSupplierTable() {

        this.lookupFunction = (urlParams: URLSearchParams, filter?) => {
            let params = urlParams;

            if (params === null) {
                params = new URLSearchParams();
            }

            params.set('expand', 'Info,Dimensions,Dimensions.Department,Dimensions.Project');

            if (this.filter) {
                const tableFilter = urlParams.get('filter');
                const combinedFilters = tableFilter
                    ? `(${tableFilter}) and ${this.filter}`
                    : this.filter;

                params.set('filter', combinedFilters);
            }

            return this.supplierService.GetAllByUrlSearchParams(params)
                .catch((err, obs) => this.errorService.handleRxCatch(err, obs));
        };

        // Define columns to use in the table
        const numberCol = new UniTableColumn(
            'SupplierNumber', 'Leverandørnr', UniTableColumnType.Text
        ).setWidth('15%').setFilterOperator('contains').setTemplate(x => {
            if (x.StatusCode === 20001 || !x.StatusCode) {
                return 'Kladd';
            }
            return x.SupplierNumber;
        });
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
