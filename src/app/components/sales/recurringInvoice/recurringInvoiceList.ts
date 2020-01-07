import {Component, OnInit, ViewChild} from '@angular/core';
import {CompanySettings, StatusCodeRecurringInvoice} from '../../../unientities';
import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';
import {ITickerActionOverride, ITickerColumnOverride} from '../../../services/common/uniTickerService';
import {UniTickerWrapper} from '../../uniticker/tickerWrapper/tickerWrapper';
import {UniRecurringInvoiceLogModal} from './recurringInvoiceLogModal';
import {
    UniModalService
} from '@uni-framework/uni-modal';
import { IUniSaveAction } from '../../../../framework/save/save';
import { Router } from '@angular/router';

@Component({
    selector: 'recurring-invoice-list',
    templateUrl: './recurringInvoiceList.html'
})
export class RecurringInvoiceList implements OnInit {

    @ViewChild(UniTickerWrapper, { static: true }) private tickerWrapper: UniTickerWrapper;

    public createNewAction: IUniSaveAction = {
        label: 'SALES.RECURRING_INVOICE.RECURRING_INVOICE_NEW',
        action: () => this.router.navigateByUrl('/sales/recurringinvoice/0')
    };

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
        private modalService: UniModalService,
        private router: Router
    ) { }

    public ngOnInit() {
        this.tabService.addTab({
            url: '/sales/recurringinvoice',
            name: 'NAVBAR.RECURRING_INVOICE',
            active: true,
            moduleID: UniModules.RecurringInvoice
        });
    }

    public showInvoiceLog(row) {
        return new Promise((resolve, reject) => {
            this.modalService.open(UniRecurringInvoiceLogModal,
                {
                    header: 'SALES.RECURRING_INVOICE.LOG_HEADER~' + row[0].ID,
                    data: {
                        reccuringInvoiceID: row[0].ID
                    }
                }).onClose.subscribe(res => resolve(res));
        });
    }
}
