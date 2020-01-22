import {Component, OnInit, ViewChild} from '@angular/core';
import {TabService, UniModules} from '../../../layout/navbar/tabstrip/tabService';
import {CustomerInvoiceService, ITickerActionOverride, ITickerColumnOverride} from '@app/services/services';
import {Router} from '@angular/router';

@Component({
    selector: 'invoice-list',
    templateUrl: './invoiceList.html'
})
export class InvoiceList implements OnInit {
    public tickercode: string = 'invoice_list';
    public actionOverrides: ITickerActionOverride[] = this.customerInvoiceService.actionOverrides;

    public columnOverrides: ITickerColumnOverride[] = [{
        Field: 'StatusCode',
        Template: (dataItem) => {
            let statusText: string = this.customerInvoiceService.getStatusText(
                dataItem.CustomerInvoiceStatusCode,
                dataItem.CustomerInvoiceInvoiceType
            );

            if (((dataItem.CustomerInvoiceTaxInclusiveAmount * -1) === dataItem.CustomerInvoiceCreditedAmount) &&
                    (dataItem.CustomerInvoiceCreditedAmount > 0 || dataItem.CustomerInvoiceCreditedAmount < 0 )) {
                statusText = 'Kreditert';
            }

            if (((dataItem.CustomerInvoiceTaxInclusiveAmount * -1) > dataItem.CustomerInvoiceCreditedAmount) &&
                    (dataItem.CustomerInvoiceCreditedAmount > 0 || dataItem.CustomerInvoiceCreditedAmount < 0 )) {
                statusText = statusText + '(Kreditert)';
            }

            if (dataItem.CustomerInvoiceCollectorStatusCode === 42501) {
                statusText = 'Purret';
            }
            if (dataItem.CustomerInvoiceCollectorStatusCode === 42502) {
                statusText = 'Inkasso';
            }

            return statusText;
        }
    }];

    public toolbarActions = [{
        label: 'Ny faktura',
        action: this.newInvoice.bind(this),
        main: true,
        disabled: false
    }];

    constructor(
        private customerInvoiceService: CustomerInvoiceService,
        private tabService: TabService,
        private router: Router,
    ) {}

    public ngOnInit() {
        this.tabService.addTab({
            url: '/sales/invoices',
            name: 'Faktura',
            active: true,
            moduleID: UniModules.Invoices
        });
    }

    private newInvoice() {
        this.router.navigateByUrl('/sales/invoices/' + 0);
    }
}
