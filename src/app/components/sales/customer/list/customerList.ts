import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TabService, UniModules } from '../../../layout/navbar/tabstrip/tabService';
import {
    CustomerInvoiceService,
    CustomerQuoteService,
    CustomerOrderService,
    UserService,
    ImportCentralService,
    ErrorService,
    ITickerActionOverride
} from '../../../../services/services';
import { UniModalService } from '@uni-framework/uni-modal';
import { environment } from 'src/environments/environment';
import { DisclaimerModal } from '@app/components/import-central/modals/disclaimer/disclaimer-modal';
import { ImportUIPermission } from '@app/models/import-central/ImportUIPermissionModel';
import { ImportJobName, TemplateType, ImportStatement } from '@app/models/import-central/ImportDialogModel';
import { ImportTemplateModal } from '@app/components/import-central/modals/import-template/import-template-modal';
import {CustomerEditModal} from '../../common/customer-edit-modal/customer-edit-modal';

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
            ExecuteActionHandler: (selectedRows) => this.newTOFWithCustomer(selectedRows, 'invoices')
        },
        {
            Code: 'new_customer_order',
            ExecuteActionHandler: (selectedRows) => this.newTOFWithCustomer(selectedRows, 'orders')
        },
        {
            Code: 'new_customer_quote',
            ExecuteActionHandler: (selectedRows) => this.newTOFWithCustomer(selectedRows, 'quotes')
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

    public tickercode: string = 'customer_list';
    public toolbarActions = [{
        label: 'Ny kunde',
        action: (done) => {
            this.modalService.open(CustomerEditModal).onClose.subscribe(customer => {
                if (customer) {
                    this.router.navigateByUrl('/sales/customer/' + customer.ID);
                }
            });

            done();
        },
        main: true,
        disabled: false
    }];

    customerTemplateUrl: string = environment.IMPORT_CENTRAL_TEMPLATE_URLS.CUSTOMER;
    private customerPermissions: ImportUIPermission;

    constructor(
        private router: Router,
        private tabService: TabService,
        private customerInvoiceService: CustomerInvoiceService,
        private customerQuoteService: CustomerQuoteService,
        private customerOrderService: CustomerOrderService,
        private modalService: UniModalService,
        private userService: UserService,
        private importCentralService: ImportCentralService,
        private errorService: ErrorService
    ) { }

    public ngOnInit() {
        this.tabService.addTab({
            url: '/sales/customer',
            name: 'Kunde',
            active: true,
            moduleID: UniModules.Customers
        });

        this.getImportAccess();
    }

    private getImportAccess() {
        this.userService.getCurrentUser().subscribe(res => {
            const permissions = res['Permissions'];
            this.customerPermissions = this.importCentralService.getAccessibleComponents(permissions).customer;
            if (this.customerPermissions.hasComponentAccess) {
                this.toolbarActions.push(...[{
                    label: 'Importer kunder',
                    action: (done) => this.openImportModal(done),
                    main: true,
                    disabled: false
                },
                {
                    label: 'Importlogg',
                    action: this.importLogs.bind(this),
                    main: true,
                    disabled: false
                }]);
            }
        }, err => {
            this.errorService.handle('En feil oppstod, vennligst prøv igjen senere');
        });

    }

    public newTOFWithCustomer(parentModel, entity: string) {
        const obj = parentModel[0] || parentModel;
        return new Promise(res => {
            if (entity && obj) {
                this.router.navigateByUrl(`/sales/${entity}/0;customerID=${obj.ID}`);
            }
            res(true);
        });
    }

    public openImportModal(done = () => { }) {
        this.userService.getCurrentUser().subscribe(res => {
            if (res) {
                if (res.HasAgreedToImportDisclaimer) {
                    this.openCustomerImportModal();
                } else {
                    this.modalService.open(DisclaimerModal)
                        .onClose.subscribe((val) => {
                            if (val) {
                                this.openCustomerImportModal();
                            }
                        });
                }
            }
        });
        done();
    }

    private importLogs() {
        this.router.navigate(['/import/log', { id: TemplateType.Customer }])
    }

    private openCustomerImportModal() {
        this.modalService.open(ImportTemplateModal,
            {
                header: 'Importer Kunder',
                data: {
                    jobName: ImportJobName.Customer,
                    type: 'Customer',
                    entity: TemplateType.Customer,
                    downloadTemplateUrl: this.customerTemplateUrl,
                    conditionalStatement: '',
                    formatStatement: ImportStatement.CustomerFormatStatement,
                    downloadStatement: ImportStatement.CustomerDownloadStatement,
                    hasTemplateAccess: this.customerPermissions.hasTemplateAccess,
                    isExternal: true
                }
            });
    }

    public onRowSelected(row) {
        this.router.navigateByUrl(`/sales/customer/${row.ID}`);
    }
}
