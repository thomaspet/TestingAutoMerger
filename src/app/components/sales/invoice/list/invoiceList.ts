import {Component, OnInit, ViewChild} from '@angular/core';
import {CompanySettings} from '../../../../unientities';
import {TabService, UniModules} from '../../../layout/navbar/tabstrip/tabService';
import {ITickerActionOverride, ITickerColumnOverride} from '../../../../services/common/uniTickerService';
import {UniTickerWrapper} from '../../../uniticker/tickerWrapper/tickerWrapper';
import {
    CustomerInvoiceService,
    ErrorService,
    CompanySettingsService,
} from '../../../../services/services';
import { Router } from '@angular/router';

@Component({
    selector: 'invoice-list',
    templateUrl: './invoiceList.html'
})
export class InvoiceList implements OnInit {

    @ViewChild(UniTickerWrapper) private tickerWrapper: UniTickerWrapper;

    public tickercode: string = 'invoice_list';
    public actionOverrides: Array<ITickerActionOverride> = this.customerInvoiceService.actionOverrides;

    public columnOverrides: Array<ITickerColumnOverride> = [
        {
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
        }
    ];

    private companySettings: CompanySettings;
    private baseCurrencyCode: string;

    public toolbarActions = [{
        label: 'Ny faktura',
        action: this.newInvoice.bind(this),
        main: true,
        disabled: false
    }];

    constructor(
        private customerInvoiceService: CustomerInvoiceService,
        private tabService: TabService,
        private errorService: ErrorService,
        private companySettingsService: CompanySettingsService,
        private router: Router
    ) { }

    public ngOnInit() {
        this.companySettingsService.Get(1)
            .subscribe(settings => {
                this.companySettings = settings;
                if (this.companySettings && this.companySettings.BaseCurrencyCode) {
                    this.baseCurrencyCode = this.companySettings.BaseCurrencyCode.Code;
                }
            }, err => this.errorService.handle(err)
            );

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
