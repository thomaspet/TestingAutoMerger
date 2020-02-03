import {Component, EventEmitter, ViewChild} from '@angular/core';
import {IModalOptions, IUniModal} from '@uni-framework/uni-modal';
import {UniTableColumn, UniTableColumnSortMode, UniTableColumnType, UniTableConfig} from '@uni-framework/ui/unitable';
import {AgGridWrapper} from '@uni-framework/ui/ag-grid/ag-grid-wrapper';
import {SupplierInvoiceService} from '@app/services/accounting/supplierInvoiceService';
import {VatTypeService} from '@app/services/accounting/vatTypeService';
import {forkJoin} from 'rxjs';

@Component({
    selector: 'selfemployed-details-modal',
    templateUrl: './selfemployed-details-modal.html',
    styleUrls: ['./selfemployed-details-modal.sass']
})
export class SelfEmployedDetailsModal implements IUniModal {
    public options: IModalOptions = {};
    public onClose: EventEmitter<any> = new EventEmitter();
    public line: any;
    public year: number;
    public busy = false;
    public data = [];
    public tableConfig: UniTableConfig;
    @ViewChild(AgGridWrapper, { static: true }) public table: AgGridWrapper;

    constructor(
        private supplierInvoiceService: SupplierInvoiceService,
        private vatTypeService: VatTypeService
    ) {
    }

    ngOnInit() {
        this.line = this.options.data.line || {};
        this.year = this.options.data.year || 0;
        forkJoin([
            this.vatTypeService.GetAll('orderby=VatCode'),
            this.supplierInvoiceService.getJournalEntyLinesBySupplierID(this.line.supplierID, this.year)
        ]).subscribe(data => {
            const [vattypes, lines] = data;
            this.setTableConfig(vattypes);
            this.data = [...lines];
        });
    }

    close() {
        this.onClose.next(null);
    }

    submit() {
        this.onClose.next(this.table.sumMarkedRows);
    }

    private setTableConfig(vattypes: any) {
        const invoiceNumberCol = new UniTableColumn('InvoiceNumber', 'Fakturanummer', UniTableColumnType.Text, false)
            .setWidth('5rem', false);
        const invoiceDateCol = new UniTableColumn('InvoiceDate', 'Fakturadato', UniTableColumnType.DateTime, false)
            .setWidth('4rem');
        const dueDateCol = new UniTableColumn('DeliveryDate', 'Leveringsdato', UniTableColumnType.DateTime, false)
            .setWidth('4rem');
        const mvaCol = new UniTableColumn('VatTypeID', 'MVA', UniTableColumnType.Text, false)
            .setWidth('3rem')
            .setTemplate(rowModel => {
                return `${rowModel.VatCode} - ${rowModel.VatPercent}%`;
            });
        const accountCol = new UniTableColumn('AccountName', 'Konto', UniTableColumnType.Text, false)
            .setWidth('15rem')
            .setTemplate(rowModel => {
                return `${rowModel.AccountNumber} - ${rowModel.AccountName}%`;
            });
        const descriptionCol = new UniTableColumn('Description', 'Berskrivelse', UniTableColumnType.Text, false);
        const netAmountCol = new UniTableColumn('Amount', 'Nettobeløp', UniTableColumnType.Money, false);
        netAmountCol.markedRowsSumCol = true;

        const columns = [
            invoiceNumberCol,
            invoiceDateCol,
            dueDateCol,
            mvaCol,
            accountCol,
            descriptionCol,
            netAmountCol
        ];

        this.tableConfig = new UniTableConfig('selfemployedview.table', true)
            .setColumns(columns)
            .setEditable(false)
            .setSearchable(false)
            .setSortable(true)
            .setAutoAddNewRow(false)
            .setMultiRowSelect(true)
            .setVirtualScroll(true);
    }

    public onDataLoaded() {
        this.table.agGridApi.selectAll();
    }
}
