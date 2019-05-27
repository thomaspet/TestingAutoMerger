import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {TabService, UniModules} from '../../../layout/navbar/tabstrip/tabService';
import {ToastService, ToastType} from '../../../../../framework/uniToast/toastService';
import {
    ITickerActionOverride, ITickerColumnOverride
} from '../../../../services/common/uniTickerService';
import {
    CustomerInvoiceService,
    CustomerQuoteService,
    CustomerOrderService
} from '../../../../services/services';
import {UniModalService} from '@uni-framework/uni-modal';
import { ImportCentralTemplateModal } from '@app/components/common/modals/import-central-modal/import-central-template-modal';

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
            Code: 'new_customer_invoice',
            ExecuteActionHandler: (customer) => this.newTOFWithCustomer(customer, 'invoices')
        },
        {
            Code: 'new_customer_order',
            ExecuteActionHandler: (customer) => this.newTOFWithCustomer(customer, 'orders')
        },
        {
            Code: 'new_customer_quote',
            ExecuteActionHandler: (customer) => this.newTOFWithCustomer(customer, 'quotes')
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

    public columnOverrides: Array<ITickerColumnOverride> = [ ];

    public tickercode: string = 'customer_list';

    public toolbarActions = [{
        label: 'Ny kunde',
        action: this.createCustomer.bind(this),
        main: true,
        disabled: false
    },
    {
        label: 'Importer kunder',
        action: (done) => this.openImportModal(done),
        main: true,
        disabled: false
    }
];

    constructor(
        private router: Router,
        private tabService: TabService,
        private toastService: ToastService,
        private customerInvoiceService: CustomerInvoiceService,
        private customerQuoteService: CustomerQuoteService,
        private customerOrderService: CustomerOrderService,
        private modalService: UniModalService,
    ) { }

    public ngOnInit() {
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

    public newTOFWithCustomer(customer, entity: string) {
        return new Promise(res => {
            if (!entity || !customer || !customer.CustomerID) {
                this.toastService.addToast('Ops, noe gikk galt', ToastType.bad, 5, 'Last inn listen på nytt og prøv igjen.');
                res(true);
                return;
            }
            this.router.navigateByUrl(`/sales/${entity}/0;customerID=${customer.CustomerID}`);
            res(true);
        });
    }

    public openImportModal(done = () => {} ) {
        this.modalService.open(ImportCentralTemplateModal,
            {
                header: 'Importer Kunder',
                message: 'Om en kunde med likt kundenummer finnes fra før, vil den importerte kunden ikke lagres. Om kundenumrene ikke passer inn i valgt kundenummerserie vil de avvises',
                data: { jobName: 'CustomerImportJob', downloadTemplateUrl: 'https://dev-unifiles.unieconomy.no/api/externalfile/b5fa10ae-d6c8-4d02-a5df-795ef91c26a4/453c99f7-a66a-4e8a-9eb1-f229fbf0dd59/P3N2PTIwMTctMDQtMTcmc3I9YiZzaWc9QVh6MlM2U1FWTGMlMkJSbGdwTHdYJTJCOE1icFJTMEI0SDE1Vk1lOUluYU54REUlM0Qmc2U9MjAxOS0wNy0yNlQwNCUzQTEyJTNBMDVaJnNwPXI=' }
            }
        );
        done();
    }
}
