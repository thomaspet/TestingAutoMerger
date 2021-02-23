import { Component, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { IModalOptions, IUniModal } from '@uni-framework/uni-modal/interfaces';
import { PaymentService } from '@app/services/services';
import { UniTableColumn, UniTableColumnType, UniTableConfig, IContextMenuItem } from '@uni-framework/ui/unitable';
import { StatisticsService } from '@app/services/common/statisticsService';
import { ToastService, ToastType } from '@uni-framework/uniToast/toastService';
import { AgGridWrapper } from '@uni-framework/ui/ag-grid/ag-grid-wrapper';
import { UniModalService, UniConfirmModalWithCheckbox, ConfirmActions } from '../../../../framework/uni-modal';
import { RequestMethod } from '@uni-framework/core/http';
import { AddPaymentModal } from '@app/components/common/modals/addPaymentModal';
import { Payment } from '@uni-entities';
import {Router} from '@angular/router';
import * as moment from 'moment';

@Component({
    selector: 'view-connected-payments-modal',
    template: `
        <section role="dialog" class="uni-modal large">
            <header>{{options.header}}</header>

            <article>
                <p>{{options.warning}}</p>

                <ag-grid-wrapper
                    [resource]="payments"
                    [config]="uniTableConfig" >
                </ag-grid-wrapper>
            </article>

            <footer>
                <button class="good" (click)="close()">{{options.buttonLabels.cancel}}</button>
            </footer>
        </section>
    `
})
export class EditSupplierInvoicePayments implements IUniModal {
    @Input()
    public options: IModalOptions = {};

    @Output()
    public onClose: EventEmitter<any> = new EventEmitter();

    @ViewChild(AgGridWrapper, { static: true })
    private table: AgGridWrapper;

    public payments: Array<any> = [];
    public uniTableConfig: UniTableConfig;
    public supplierInvoiceID: number;
    public sumOfSelectedRows: number = 0;
    public isOkEnabled: boolean = false;
    private modalService: UniModalService;
    private statisticString: string;

    constructor(
        private statisticsService: StatisticsService,
        private toastService: ToastService,
        private paymentService: PaymentService,
        private router: Router
    ) { }

    public ngOnInit() {
        this.supplierInvoiceID = this.options.data;
        this.statisticString = `model=Tracelink`
        + `&select=payment.Id as ID,payment.businessrelationid as BusinessRelationID,`
        + `payment.amount as Amount,payment.amountCurrency as AmountCurrency,`
        + `payment.description as Description,businessrelation.name as Name,`
        + `payment.paymentID as PaymentID,bankaccount.accountnumber as AccountNumber,`
        + `payment.statusCode as StatusCode,payment.paymentdate as PaymentDate,`
        + `payment.paymentCodeId as PaymentCodeID,journalEntry.JournalEntryNumber as JournalEntryNumber,`
        + `payment.JournalEntryID as JournalEntryID`
        + `&filter=SourceEntityName eq 'SupplierInvoice' and `
        + `DestinationEntityName eq 'Payment' and `
        + `SourceInstanceID eq ${this.supplierInvoiceID} and `
        + `Payment.ID gt 0`
        + `&join=Tracelink.DestinationInstanceId eq Payment.ID and `
        + `Payment.BusinessRelationID eq BusinessRelation.ID and `
        + `Payment.ToBankAccountID eq BankAccount.ID and Payment.JournalEntryID eq JournalEntry.ID`;
        this.setUpTable();
    }

    public close() {
        this.onClose.emit();
    }

    public refresh() {
        this.statisticsService.GetAllUnwrapped(this.statisticString)
        .subscribe(data => {
            this.payments = [];
            if (data && data.length > 0) {
                data.forEach(payment => {
                    this.payments.push(payment);
                });
            } else {
                this.close();
            }
            this.table.refreshTableData();
        });
    }

    public setUpTable() {
        const contextMenuItems: IContextMenuItem[] = [
            {
                action: (rows) => this.deletePayment(rows),
                label: 'Slett betaling',
                disabled: (row) => !(row.StatusCode === 44001 || this.isAllowedToForceDeletePayment(row))
            },
            {
                action: (rows) => this.editPayment(rows),
                label: 'Endre betaling',
                disabled: (row) => row.StatusCode !== 44001
            },
            {
                action: (rows) => this.goToPayments(),
                label: 'Gå til utbetalinger'
            }
        ];

        this.statisticsService.GetAllUnwrapped(this.statisticString)
            .subscribe(data => {
                if (data && data.length > 0) {
                    data.forEach(payment => {
                        this.payments.push(payment);
                    });
                    const columns = [
                        new UniTableColumn('Name', 'Betales til', UniTableColumnType.Text),
                        new UniTableColumn('AccountNumber', 'Konto til', UniTableColumnType.Number),
                        new UniTableColumn('AmountCurrency', 'Valutabeløp', UniTableColumnType.Money)
                            .setTemplate(line => line.AmountCurrency)
                            .setIsSumColumn(true),
                        new UniTableColumn('Amount', 'Beløp', UniTableColumnType.Money),
                        new UniTableColumn('PaymentDate', 'Betalingsdato', UniTableColumnType.LocalDate),
                        new UniTableColumn('ID', 'ID', UniTableColumnType.Number)
                            .setVisible(false),
                        new UniTableColumn('PaymentID', 'KID', UniTableColumnType.Number),
                        new UniTableColumn('Description', 'Beskrivelse', UniTableColumnType.Text),
                        new UniTableColumn('StatusCode', 'Status', UniTableColumnType.Text)
                            .setWidth('7rem')
                            .setTemplate(x => this.paymentService.getStatusText(x.StatusCode)),
                        new UniTableColumn('JournalEntryNumber', 'Bilagnr.', UniTableColumnType.Link)
                        .setLinkClick(row => {
                            const numberAndYear = row.JournalEntryNumber.split('-');
                            let url: string = `/accounting/transquery?JournalEntryNumber=${numberAndYear[0]}&AccountYear=`;
                            if (numberAndYear.length > 1) {
                                url += numberAndYear[1];
                            } else {
                                url += row.PaymentDate ? moment(row.PaymentDate).year() : moment().year();
                            }
                            this.router.navigateByUrl(url);
                            this.close();
                        }),
                        new UniTableColumn('JournalEntryID', 'JournalEntryID', UniTableColumnType.Number)
                        .setVisible(false)
                    ];

                    this.uniTableConfig = new UniTableConfig('common.modal.editSupplierInvoicePayments', false, true, 25)
                        .setMultiRowSelect(false)
                        .setColumns(columns)
                        .setEntityType('Payment')
                        .setColumnMenuVisible(true)
                        .setContextMenu(contextMenuItems)
                        .setSearchable(true);

                } else {
                    this.toastService.addToast('Ingen betaling funnet', ToastType.bad, 0,
                        'Kan ikke velge betalinger siden det ikke ble funnet noen betaling for dette fakturamottaket');
                    this.close();
                }
            });
    }

    private isAllowedToForceDeletePayment(payment: any): boolean {
        const enabledForStatuses = [44002, 44005, 44007, 44008, 44009, 44011];
        return enabledForStatuses.includes(payment.StatusCode);
    }

    private deletePayment(payment: any) {
        const warningMessage = this.isAllowedToForceDeletePayment(payment) ?
        `Viktig! Betaling(er) er sendt til banken og <strong class="modwarn">må</strong> stoppes manuelt der før du sletter betalingen.<br>
        Hvis betalingen ikke kan stoppes manuelt, vennligst ta kontakt med banken<br>`
        : '';

        const modal = this.modalService.open(UniConfirmModalWithCheckbox, {
            header: 'Bekreft Sletting',
            message: `Vil du slette betaling ${payment.Description ? ' ' + payment.Description : ''}?`,
            checkboxLabel: warningMessage !== '' ? 'Jeg har forstått og kommer til å slette betaling manuelt i bank.' : '',
            closeOnClickOutside: false,
            buttonLabels: {
                accept: 'Slett betaling',
                cancel: 'Avbryt'
            },
            warning: warningMessage
        });

        modal.onClose.subscribe(result => {
            if (result === ConfirmActions.ACCEPT) {
                this.paymentService.Action(payment.ID, 'force-delete', null, RequestMethod.Delete)
                .subscribe(() => {
                    this.toastService.addToast('Betaling er slettet', ToastType.good, 3);
                    this.refresh();

                });
            }
        });
    }

    private goToPayments() {
        this.router.navigateByUrl('/bank/ticker?code=payment_list');
        this.close();
    }

    private editPayment(row: any) {
        this.paymentService.Get(row.ID, ['BusinessRelation', 'FromBankAccount', 'ToBankAccount', 'CurrencyCode'])
        .subscribe((payment: Payment) => {
            // show addPaymentModel
            this.modalService.open(AddPaymentModal, {
                data: { model: payment },
                header: 'Endre betaling',
                buttonLabels: {accept: 'Oppdater betaling'}
            }).onClose.
            subscribe((updatedPaymentInfo: Payment) => {
                if (updatedPaymentInfo) {
                    this.paymentService.Put(payment.ID, updatedPaymentInfo)
                    .subscribe(() => {
                        this.refresh(); // refresh table
                    });
                }
            });
        });
    }
}
