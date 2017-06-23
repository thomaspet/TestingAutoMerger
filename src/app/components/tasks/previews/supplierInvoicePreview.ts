import {Component, Input, Output} from '@angular/core';
import {
    SupplierInvoiceService, 
    ErrorService, 
    CompanySettingsService
} from '../../../services/services';
import {Task} from '../../../unientities';

@Component({
    selector: 'supplier-invoice-preview',
    templateUrl: './supplierInvoicePreview.html'
})
export class SupplierInvoicePreview {
    @Input()
    private task: Task;

    public invoice;
    public expand: string[] = [
        'BankAccounts', 
        'JournalEntry.DraftLines.Account', 
        'JournalEntry.DraftLines.VatType', 
        'CurrencyCode', 
        'BankAccount'
    ];
    public settingsCurrency: string;
    public showCurrency: boolean;
    public entityID: number;
    public invoiceInfoShow: boolean;
    public mva: number;

    constructor(
        private invoiceService: SupplierInvoiceService,
        private errorService: ErrorService,
        private companySettingsService: CompanySettingsService) {}

    public ngOnChanges() {
        this.getCompanySettingsCurrency()
         if (this.task && this.task.EntityID) {
            this.invoiceService.Get(this.task.EntityID, this.expand)
                .subscribe(
                    res => {
                        this.invoice = res;
                        this.entityID = res._task.EntityID;
                        // setting mva to 0 if it doesnt have one and to invoice value if it does
                        if (!res.JournalEntry) {
                           this.mva = 0;
                        } else {
                            this.mva = res.JournalEntry.DraftLines[0].VatType.VatPercent;
                        }
                        // setting showCurrency to true/false for it to hide/show if
                        // company settings currency match with invoice currency
                        (res.CurrencyCode.Code === this.settingsCurrency) 
                        ? this.showCurrency = false
                        : true;
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

    // getting the set currency from your company settings
    getCompanySettingsCurrency() {
        this.companySettingsService.Get(1).subscribe(
            res => this.settingsCurrency = res.BaseCurrencyCode.Code,
            err => this.errorService.handle(err)
        );
    }
}
