import {Component, OnInit, ViewChild} from '@angular/core';
import {CompanySettings, StatusCodeRecurringInvoice} from '../../../unientities';
import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';
import {ITickerActionOverride, ITickerColumnOverride} from '../../../services/common/uniTickerService';
import {UniTickerWrapper} from '../../uniticker/tickerWrapper/tickerWrapper';
import {UniRecurringInvoiceLogModal} from './recurringInvoiceLogModal';
import {
    UniModalService
} from '@uni-framework/uni-modal';

@Component({
    selector: 'recurring-invoice-list',
    templateUrl: './recurringInvoiceList.html'
})
export class RecurringInvoiceList implements OnInit {

    @ViewChild(UniTickerWrapper) private tickerWrapper: UniTickerWrapper;

    public tickercode: string = 'recurring_invoice_list';
    public actionOverrides: Array<ITickerActionOverride> = [
        {
            Code: 'recurring_invoice_showlog',
            ExecuteActionHandler: (selectedRows) => this.showInvoiceLog(selectedRows),
            CheckActionIsDisabled: (selectedRow) => false
        },
    ];

    constructor(
        private tabService: TabService,
        private modalService: UniModalService
    ) { }

    public ngOnInit() {
        this.tabService.addTab({
            url: '/sales/recurringinvoice',
            name: 'Repeterende faktura',
            active: true,
            moduleID: UniModules.RecurringInvoice
        });
    }

    public showInvoiceLog(row) {
        return new Promise((resolve, reject) => {
            this.modalService.open(UniRecurringInvoiceLogModal,
                {
                    header: 'Fakturalogg for repeterende fakturanr. ' + row[0].ID,
                    data: {
                        reccuringInvoiceID: row[0].ID
                    }
                }).onClose.subscribe(res => resolve(res));
        });
    }
}
