import {Component, Input, Output} from '@angular/core';
import {
    SupplierInvoiceService,
    ErrorService,
    CompanySettingsService
} from '../../../services/services';
import {Task, SupplierInvoice} from '../../../unientities';

@Component({
    selector: 'supplier-invoice-preview',
    templateUrl: './supplierInvoicePreview.html'
})
export class SupplierInvoicePreview {
    @Input()
    private task: Task;

    public invoice: SupplierInvoice;
    public settingsCurrency: string;
    public showCurrency: boolean;
    public invoiceInfoShow: boolean;
    public mva: number;

    public expand: string[] = [
        'BankAccounts',
        'JournalEntry.DraftLines.Account',
        'JournalEntry.DraftLines.VatType',
        'CurrencyCode',
        'BankAccount'
    ];

    constructor(
        private invoiceService: SupplierInvoiceService,
        private errorService: ErrorService,
        private companySettingsService: CompanySettingsService
    ) {
        this.companySettingsService.Get(1).subscribe(
            res => this.settingsCurrency = res.BaseCurrencyCode.Code,
            err => this.errorService.handle(err)
        );
    }

    public ngOnChanges() {
        this.invoiceInfoShow = false;

        if (this.task && this.task.EntityID) {
            this.invoiceService.Get(this.task.EntityID, this.expand)
                .subscribe(
                    res => {
                        this.invoice = res;

                        let draftLines = res.JournalEntry && res.JournalEntry.DraftLines;
                        if (draftLines && draftLines.length) {
                            const withVat = draftLines.find(dl => dl.VatPercent > 0);
                            this.mva = withVat ? withVat.VatPercent : 0;
                        }

                        // setting showCurrency to true/false for it to hide/show if
                        // company settings currency match with invoice currency
                        this.showCurrency = res.CurrencyCode.Code !== this.settingsCurrency;

                        // setting invoiceInfoShow based on the existance of InvoiceType
                        if (res.InvoiceType === 0 || res.InvoiceType) {
                            this.invoiceInfoShow = true;
                        }
                    },
                    err => this.errorService.handle(err)
                );
        }

        // hiding invoice info at the start of each change
        this.invoiceInfoShow = false;
    }

}
