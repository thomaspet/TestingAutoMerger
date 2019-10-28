import { Component, EventEmitter, Output } from '@angular/core';
import { UniTableColumn, UniTableColumnType, UniTableConfig } from '@uni-framework/ui/unitable';
import { UniStatusCodePipe } from '@app/pipes/StatusCodePipe';
import { HttpParams } from '@angular/common/http';
import { StatisticsService } from '@app/services/common/statisticsService';

@Component({
    selector: 'batchinvoices-list',
    templateUrl: './batchinvoicesList.html'
})
export class BatchInvoicesList {

    public tableConfig: UniTableConfig;
    public lookupFunction: (urlParams: HttpParams) => any;
    @Output() public selectRow: EventEmitter<any> = new EventEmitter<any>(true);

    constructor(private statisticsService: StatisticsService) {}

    ngOnInit() {
        const idCol = new UniTableColumn('ID', 'Jobb Nr.', UniTableColumnType.Text)
            .setWidth('3rem')
            .setAlignment('center')
            .setFilterOperator('startswith');
        const statusCol = new UniTableColumn('StatusCode', 'Status', UniTableColumnType.Text)
            .setTemplate(rowModel => {
                const pipe = new UniStatusCodePipe();
                return pipe.transform(rowModel.StatusCode);
            });
        const createdByCol = new UniTableColumn('CreatedBy', 'Signature', UniTableColumnType.Text);
        const processedCol = new UniTableColumn('Processed', 'Fremdrift', UniTableColumnType.Text)
            .setTemplate(rowModel => `${rowModel.Processed} av ${rowModel.TotalToProcess}`)
            .setWidth('10rem')
            .setAlignment('right');
        const dateCol = new UniTableColumn('InvoiceDate', 'Fakturadato', UniTableColumnType.LocalDate);
        const dueDateCol = new UniTableColumn('DueDate', 'Forfallsdato', UniTableColumnType.LocalDate);
        const totalSumCol = new UniTableColumn('SumOrders', 'TotalSum', UniTableColumnType.Money)


        let pageSize = window.innerHeight - 350;
        pageSize = pageSize <= 33 ? 10 : Math.floor(pageSize / 34); // 34 = heigth of a single row

        this.tableConfig = new UniTableConfig('jobs.batchinvoices.list', false, true, pageSize)
            .setColumns([idCol, statusCol, processedCol, dateCol, totalSumCol, createdByCol, dueDateCol ])
            .setSearchable(true);

        this.lookupFunction = (urlParams: HttpParams) => {
            urlParams = urlParams.set('select',
                'ID as ID,StatusCode as StatusCode,Processed as Processed,User.DisplayName as CreatedBy,' +
                'TotalToProcess as TotalToProcess,InvoiceDate as InvoiceDate,DueDate as DueDate,' +
                'sum(CustomerOrder.TaxExclusiveAmountCurrency) as SumOrders');
            urlParams = urlParams.set('model', 'BatchInvoice');
            urlParams = urlParams.set('groupby', 'BatchInvoice.ID');
            urlParams = urlParams.set('expand', 'Items,Items.CustomerInvoice,Items.CustomerOrder');
            urlParams = urlParams.set('join', 'BatchInvoice.CreatedBy eq User.GlobalIdentity');
            return this.statisticsService.GetAllByHttpParams(urlParams, true);
        };
    }

    rowSelected(row) {
        this.selectRow.emit(row);
    }
}
