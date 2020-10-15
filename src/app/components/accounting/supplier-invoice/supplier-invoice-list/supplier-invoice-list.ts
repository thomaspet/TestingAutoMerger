import {Component, OnInit} from '@angular/core';
import {TabService, UniModules} from '../../../layout/navbar/tabstrip/tabService';
import {CompanySettingsService, ITickerActionOverride, ITickerColumnOverride, SupplierInvoiceService} from '@app/services/services';
import {Router} from '@angular/router';
import { SupplierInvoiceStore } from '../supplier-invoice-store';
import { of } from 'rxjs';
import { CompanySettings, StatusCodeSupplierInvoice } from '@uni-entities';

@Component({
    selector: 'supplier-invoice-list',
    templateUrl: './supplier-invoice-list.html'
})
export class NewSupplierInvoiceList implements OnInit {
    tickercode: string = 'new_supplierinvoice_list';
    actionOverrides: ITickerActionOverride[] = [];
    columnOverrides: ITickerColumnOverride[] = [{
        Field: 'StatusCode',
        Template: (dataItem) => this.supplierInvoiceService.getStatusText( dataItem.CustomerInvoiceStatusCode)
    }];

    hasAutoBank = false;

    toolbarActions = [{
        label: 'Ny utgift',
        action: this.newInvoice.bind(this),
        main: true,
        disabled: false
    }];

    constructor(
        private supplierInvoiceService: SupplierInvoiceService,
        private companySettingsService: CompanySettingsService,
        private tabService: TabService,
        private router: Router,
        private store: SupplierInvoiceStore
    ) {
        this.companySettingsService.Get(1).subscribe((cs: CompanySettings) => {
            this.hasAutoBank = cs.HasAutobank;
            this.actionOverrides = this.getActionOverrides();
        }, err => this.actionOverrides = this.getActionOverrides());
    }

    public ngOnInit() {
        this.tabService.addTab({
            url: '/accounting/bills',
            name: 'Utgifter',
            active: true,
            moduleID: UniModules.Bills
        });
    }

    public onRowSelected(row) {
        this.router.navigateByUrl('/accounting/bills/' + row.ID);
    }

    private newInvoice() {
        this.router.navigateByUrl('/accounting/inbox');
    }

    getActionOverrides() {
        return [
            {
                Code: 'supplier_invoice_journal',
                ExecuteActionHandler: (selectedRows) => this.store.journalFromList(selectedRows[0].SupplierInvoiceID).toPromise(),
                CheckActionIsDisabled: (selectedRow) => selectedRow.SupplierInvoiceStatusCode !== StatusCodeSupplierInvoice.Draft
                && selectedRow.SupplierInvoiceStatusCode !== StatusCodeSupplierInvoice.Approved
            },
            {
                Code: 'supplier_invoice_journal_and_pay',
                ExecuteActionHandler: (selectedRows) => this.store.toPaymentFromList(selectedRows[0].SupplierInvoiceID, false).toPromise(),
                CheckActionIsDisabled: (selectedRow) =>
                    (selectedRow.SupplierInvoiceStatusCode !== StatusCodeSupplierInvoice.Draft
                    && selectedRow.SupplierInvoiceStatusCode !== StatusCodeSupplierInvoice.Approved)
                    || selectedRow.SupplierInvoicePaymentStatus === 30112 || !this.hasAutoBank
            },
            {
                Code: 'supplier_invoice_journal_and_pay_no_autobank',
                ExecuteActionHandler: (selectedRows) =>
                    this.store.registerPaymentFromListAndOptionalJournaling(selectedRows[0].SupplierInvoiceID, true).toPromise(),
                CheckActionIsDisabled: (selectedRow) =>
                    (selectedRow.SupplierInvoiceStatusCode !== StatusCodeSupplierInvoice.Draft
                    && selectedRow.SupplierInvoiceStatusCode !== StatusCodeSupplierInvoice.Approved)
                    || selectedRow.SupplierInvoicePaymentStatus === 30112 || this.hasAutoBank
            },
            {
                Code: 'supplier_invoice_delete',
                ExecuteActionHandler: (selectedRows) => this.store.deleteFromList(selectedRows[0]).toPromise(),
                CheckActionIsDisabled: (selectedRow) => selectedRow.SupplierInvoiceStatusCode === StatusCodeSupplierInvoice.Journaled
                    || selectedRow.SupplierInvoicePaymentStatus !== 30109
            },
            {
                Code: 'supplier_invoice_pay',
                ExecuteActionHandler: (selectedRows) => {
                    return this.store.toPaymentFromList(selectedRows[0].SupplierInvoiceID).toPromise();
                },
                CheckActionIsDisabled: (selectedRow) => selectedRow.SupplierInvoiceStatusCode !== StatusCodeSupplierInvoice.Journaled
                || selectedRow.SupplierInvoicePaymentStatus === 30112 || !this.hasAutoBank
            },
            {
                Code: 'supplier_invoice_pay_no_autobank',
                ExecuteActionHandler: (selectedRows) =>
                    this.store.registerPaymentFromListAndOptionalJournaling(selectedRows[0].SupplierInvoiceID, false).toPromise(),
                CheckActionIsDisabled: (selectedRow) => selectedRow.SupplierInvoiceStatusCode !== StatusCodeSupplierInvoice.Journaled
                || selectedRow.SupplierInvoicePaymentStatus === 30112 || this.hasAutoBank
            },
            {
                Code: 'supplier_invoice_credit',
                ExecuteActionHandler: (selectedRows) => this.store.getPaymentsBeforeCredit(selectedRows[0].SupplierInvoiceID).toPromise(),
                CheckActionIsDisabled: (selectedRow) => selectedRow.SupplierInvoiceStatusCode !== StatusCodeSupplierInvoice.Journaled
            },
            {
                Code: 'supplier_invoice_approve',
                ExecuteActionHandler: (selectedRows) =>
                    this.store.approveOrRejectFromList(selectedRows[0].SupplierInvoiceID, 'approve').toPromise(),
                CheckActionIsDisabled: (selectedRow) => selectedRow.SupplierInvoiceStatusCode !== StatusCodeSupplierInvoice.ForApproval
            },
            {
                Code: 'supplier_invoice_reject',
                ExecuteActionHandler: (selectedRows) =>
                    this.store.approveOrRejectFromList(selectedRows[0].SupplierInvoiceID, 'reject').toPromise(),
                CheckActionIsDisabled: (selectedRow) => selectedRow.SupplierInvoiceStatusCode !== StatusCodeSupplierInvoice.ForApproval
            }
        ];
    }
}
