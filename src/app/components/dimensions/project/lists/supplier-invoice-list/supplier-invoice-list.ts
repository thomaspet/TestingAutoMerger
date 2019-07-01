import {Component} from '@angular/core';
import {StatisticsService, ProjectService, SupplierInvoiceService} from '@app/services/services';
import {Router} from '@angular/router';
import {URLSearchParams} from '@angular/http';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {UniTableConfig, UniTableColumn, UniTableColumnType} from '@uni-framework/ui/unitable';

@Component({
    selector: 'project-supplier-invoice-list',
    template: `
        <button (click)="addNew()" class="outline-c2a">
            Opprett ny
        </button>

        <ag-grid-wrapper
            class="font-13"
            [config]="tableConfig"
            [resource]="lookupFunction"
            [columnSumResolver]="sumResolver"
            (rowClick)="onRowClick($event)">
        </ag-grid-wrapper>
    `,
    styleUrls: ['./supplier-invoice-list.sass'],
    host: {class: 'uni-redesign'}
})
export class ProjectSupplierInvoiceList {
    onDestroy$ = new Subject();

    lookupFunction;
    sumResolver;
    tableConfig: UniTableConfig;

    projectID: number;

    constructor(
        private supplierInvoiceService: SupplierInvoiceService,
        private projectService: ProjectService,
        private router: Router,
        private statisticsService: StatisticsService
    ) {}

    ngOnInit() {
        if (!this.projectService.hasSupplierInvoiceModule) {
            this.router.navigateByUrl('/dimensions/projects/editmode');
        }

        this.projectService.currentProject.pipe(
            takeUntil(this.onDestroy$)
        ).subscribe(project => {
            if (project) {
                this.projectID = project.ID;
                this.lookupFunction = (params: URLSearchParams) => this.getTableData(params);
                this.sumResolver = (params: URLSearchParams) => this.getSumRow(params);
            }
        });

        this.tableConfig = new UniTableConfig('project.supplierinvoices', false)
            .setSearchable(true)
            .setColumns([
                new UniTableColumn('SupplierInvoice.InvoiceNumber', 'Fakturanr')
                    .setAlias('InvoiceNumber'),
                new UniTableColumn('Info.Name', 'Leverandør')
                    .setAlias('Name'),
                new UniTableColumn('SupplierInvoice.SupplierOrgNumber', 'Org.nr')
                    .setAlias('OrgNumber'),
                new UniTableColumn('SupplierInvoice.YourReference', 'Deres ref')
                    .setAlias('YourReference'),
                new UniTableColumn('SupplierInvoice.TaxExclusiveAmountCurrency', 'Sum eks.mva', UniTableColumnType.Money)
                    .setAlias('TaxExclusiveAmountCurrency'),
                new UniTableColumn('SupplierInvoice.TaxInclusiveAmountCurrency', 'Sum inkl.mva', UniTableColumnType.Money)
                    .setAlias('TaxInclusiveAmountCurrency'),
                new UniTableColumn('SupplierInvoice.RestAmountCurrency', 'Utestående', UniTableColumnType.Money)
                    .setAlias('RestAmountCurrency'),
                new UniTableColumn('SupplierInvoice.StatusCode', 'Status')
                    .setAlias('StatusCode')
                    .setTemplate(row => this.supplierInvoiceService.getStatusText(row.StatusCode)),
            ]);
    }

    ngOnDestroy() {
        this.onDestroy$.next();
        this.onDestroy$.complete();
    }

    addNew() {
        this.router.navigateByUrl('/accounting/bills/0?projectID=' + this.projectID);
    }

    onRowClick(row) {
        this.router.navigateByUrl('/accounting/bills/' + row.ID);
    }

    private getSumRow(tableParams: URLSearchParams) {
        const params = this.getParams(tableParams);
        const select = [
            'sum(SupplierInvoice.TaxExclusiveAmountCurrency) as TaxExclusiveAmountCurrency',
            'sum(SupplierInvoice.TaxInclusiveAmountCurrency) as TaxInclusiveAmountCurrency',
            'sum(SupplierInvoice.RestAmountCurrency) as RestAmountCurrency'
        ].join(',');

        params.set('select', select);
        return this.statisticsService.GetAllUnwrapped(params.toString());
    }

    private getTableData(tableParams: URLSearchParams) {
        const params = this.getParams(tableParams);
        const select = [
            'SupplierInvoice.ID as ID',
            'SupplierInvoice.InvoiceNumber as InvoiceNumber',
            'Info.Name as Name',
            'SupplierInvoice.SupplierOrgNumber as OrgNumber',
            'SupplierInvoice.YourReference as YourReference',
            'SupplierInvoice.TaxExclusiveAmountCurrency as TaxExclusiveAmountCurrency',
            'SupplierInvoice.TaxInclusiveAmountCurrency as TaxInclusiveAmountCurrency',
            'SupplierInvoice.RestAmountCurrency as RestAmountCurrency',
            'SupplierInvoice.StatusCode as StatusCode'
        ].join(',');

        params.set('select', select);
        return this.statisticsService.GetAllByUrlSearchParams(params, true);
    }

    private getParams(tableParams: URLSearchParams) {
        const params = tableParams.clone();
        params.set('model', 'SupplierInvoice');
        params.set('expand', 'DefaultDimensions.Project,Supplier.Info');
        params.set('distinct', 'true');

        let filter = `(Project.ID eq ${this.projectID})`;
        if (params.has('filter')) {
            filter += ` and ${params.get('filter')}`;
        }

        params.set('filter', filter);
        return params;
    }
}
