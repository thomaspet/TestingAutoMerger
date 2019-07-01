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
                new UniTableColumn('InvoiceNumber', 'Fakturanr'),
                new UniTableColumn('SupplierName', 'Leverandør'),
                new UniTableColumn('SupplierOrgNumber', 'Org.nr'),
                new UniTableColumn('YourReference', 'Deres ref'),
                new UniTableColumn('TaxInclusiveAmountCurrency', 'Sum inkl.mva', UniTableColumnType.Money),
                new UniTableColumn('RestAmountCurrency', 'Utestående', UniTableColumnType.Money),
                new UniTableColumn('StatusCode', 'Status')
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
            'sum(SupplierInvoice.TaxInclusiveAmountCurrency) as TaxInclusiveAmountCurrency',
            'sum(SupplierInvoice.RestAmountCurrency) as RestAmountCurrency'
        ].join(',');

        params.set('select', select);
        return this.statisticsService.GetAllUnwrapped(params.toString());
    }

    private getTableData(tableParams: URLSearchParams) {
        const params = this.getParams(tableParams);
        const select = [
            'ID as ID',
            'InvoiceNumber as InvoiceNumber',
            'Info.Name as SupplierName',
            'SupplierOrgNumber as SupplierOrgNumber',
            'YourReference as YourReference',
            'TaxInclusiveAmountCurrency as TaxInclusiveAmountCurrency',
            'RestAmountCurrency as RestAmountCurrency',
            'StatusCode as StatusCode',
        ].join(',');

        params.set('select', select);
        return this.statisticsService.GetAllByUrlSearchParams(params);
    }

    private getParams(tableParams: URLSearchParams) {
        const params = tableParams.clone();
        params.set('model', 'SupplierInvoice');
        params.set('join', 'SupplierInvoice.JournalEntryID eq JournalEntryLineDraft.JournalEntryID and JournalEntryLineDraft.DimensionsID eq Dimensions.ID'); //tslint:disable-line
        params.set('expand', 'DefaultDimensions.Project,Supplier.Info');

        let filter = `(Project.ID eq ${this.projectID} or Dimensions.ProjectID eq ${this.projectID})`;
        if (params.has('filter')) {
            filter += ` and ${params.get('filter')}`;
        }

        params.set('filter', filter);
        return params;
    }
}
