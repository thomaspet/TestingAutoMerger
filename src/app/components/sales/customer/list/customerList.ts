import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {UniHttp} from '../../../../../framework/core/http/http';
import {CompanySettings} from '../../../../unientities';
import {TabService, UniModules} from '../../../layout/navbar/tabstrip/tabService';
import {ToastService} from '../../../../../framework/uniToast/toastService';
import {
    ITickerActionOverride, ITickerColumnOverride
} from '../../../../services/common/uniTickerService';
import {
    CustomerService,
    ErrorService,
    CompanySettingsService,
    CustomerInvoiceService,
    CustomerQuoteService,
    CustomerOrderService
} from '../../../../services/services';

@Component({
    selector: 'customer-list',
    templateUrl: './customerList.html'
})
export class CustomerList implements OnInit {

    public actionOverrides: Array<ITickerActionOverride> = [
        {
            Code: 'tof_sendemail',
            ExecuteActionHandler: (selectedRows) => this.customerInvoiceService.onSendEmail(selectedRows)
        },
        {
            Code: 'invoice_registerpayment',
            ExecuteActionHandler: (selectedRows) => this.customerInvoiceService.onRegisterPayment(selectedRows),
            CheckActionIsDisabled: (selectedRow) => this.customerInvoiceService.onCheckRegisterPaymentDisabled(selectedRow)
        },
        {
            Code: 'invoice_createcreditnote',
            CheckActionIsDisabled: (selectedRow) => this.customerInvoiceService.onCheckCreateCreditNoteDisabled(selectedRow),
            ExecuteActionHandler: (selectedRows) => this.customerInvoiceService.onCreateCreditNote(selectedRows)
        },
        {
            Code: 'invoice_creditcreditnote',
            CheckActionIsDisabled: (selectedRow) => this.customerInvoiceService.onCheckCreditCreditNoteDisabled(selectedRow)
        },
        {
            Code: 'customer_quote_sendemail',
            ExecuteActionHandler: (selectedRows) => this.customerQuoteService.onSendEmail(selectedRows)
        },
        {
            Code: 'quote_delete',
            ExecuteActionHandler: (selectedRows) => this.customerQuoteService.deleteQuotes(selectedRows)
        },
        {
            Code: 'quote_print',
            AfterExecuteActionHandler: (selectedRows) => this.customerQuoteService.onAfterPrintQuote(selectedRows)
        },
        {
            Code: 'customer_order_sendemail',
            ExecuteActionHandler: (selectedRows) => this.customerOrderService.onSendEmail(selectedRows)
        },
        {
            Code: 'customer_order_delete',
            ExecuteActionHandler: (selectedRows) => this.customerOrderService.deleteOrders(selectedRows)
        },
        {
            Code: 'customer_order_print',
            AfterExecuteActionHandler: (selectedRows) => this.customerOrderService.onAfterPrintOrder(selectedRows)
        }
    ];

    private companySettings: CompanySettings;

    public columnOverrides: Array<ITickerColumnOverride> = [ ];

    public tickercode: string = 'customer_list';

    public toolbarActions = [{
        label: 'Ny kunde',
        action: this.createCustomer.bind(this),
        main: true,
        disabled: false
    }];

    constructor(
        private uniHttpService: UniHttp,
        private router: Router,
        private customerService: CustomerService,
        private tabService: TabService,
        private toastService: ToastService,
        private errorService: ErrorService,
        private companySettingsService: CompanySettingsService,
        private customerInvoiceService: CustomerInvoiceService,
        private customerQuoteService: CustomerQuoteService,
        private customerOrderService: CustomerOrderService
    ) { }

    public ngOnInit() {
        this.companySettingsService.Get(1)
            .subscribe(settings => {
                this.companySettings = settings;
                }, err => this.errorService.handle(err)
            );

        this.tabService.addTab({
            url: '/sales/customer',
            name: 'Kunde',
            active: true,
            moduleID: UniModules.Customers
        });
    }

    public createCustomer() {
        this.router.navigateByUrl('/sales/customer/0');
    }







}
