import {Component, ViewChild, Input, EventEmitter, Output, OnChanges} from '@angular/core';
import {Router} from '@angular/router';
import {PaymentService, PaymentBatchService, ErrorService, FileService} from '../../../services/services';
import {Payment, PaymentBatch} from '../../../unientities';
import {Observable} from 'rxjs/Observable';
import {UniTable, UniTableColumn, UniTableColumnType, UniTableConfig} from 'unitable-ng2/main';
import {URLSearchParams} from '@angular/http';
import {PaymentRelationsModal} from './relationModal';
import {ToastService, ToastType} from '../../../../framework/uniToast/toastService';

declare const moment;
declare const saveAs; // filesaver.js

@Component({
    selector: 'payment-batch-details',
    templateUrl: 'app/components/bank/payments/paymentBatchDetails.html',
})
export class PaymentBatchDetails implements OnChanges {
    @Input() private paymentBatchID: number;
    @Output() private paymentBatchUpdated: EventEmitter<PaymentBatch> = new EventEmitter<PaymentBatch>();
    @Output() private paymentBatchNavigate: EventEmitter<number> = new EventEmitter<number>();
    @Output() private deletePaymentBatch: EventEmitter<PaymentBatch> = new EventEmitter<PaymentBatch>();

    @ViewChild(PaymentRelationsModal) private paymentRelationsModal: PaymentRelationsModal;
    @ViewChild(UniTable) private table: UniTable;


    private paymentBatch: PaymentBatch;
    private paymentTableConfig: UniTableConfig;
    private lookupFunction: (urlParams: URLSearchParams) => any;


    constructor(private router: Router,
                private paymentService: PaymentService,
                private paymentBatchService: PaymentBatchService,
                private errorService: ErrorService,
                private toastService: ToastService,
                private fileService: FileService) {}

    public ngOnInit() {
        this.setupPaymentTable();
    }

    public ngOnChanges() {
        if (this.paymentBatchID) {
            if (this.table) {
                this.table.refreshTableData();
            }

            this.loadPaymentBatchData();
        }
    }

    private goToPreviousBatch() {
        this.paymentBatchNavigate.emit(-1);
    }

    private goToNextBatch() {
        this.paymentBatchNavigate.emit(1);
    }

    private deleteBatch() {
        if (!this.paymentBatch.PaymentFileID
            || (this.paymentBatch.PaymentFileID && confirm('Er du helt sikker på at du vil tilbakestille bunten?'))) {
            this.deletePaymentBatch.emit(this.paymentBatch);
        }
    }

    private receiptFileUploaded(file) {
        this.toastService.addToast('Kvitteringsfil lastet opp, tolker fil..', ToastType.good, 10,
            'Dette kan ta litt tid, vennligst vent...');

        this.paymentBatchService.registerReceiptFileCamt054(file)
            .subscribe(paymentBatch => {
                this.toastService.addToast('Kvitteringsfil tolket og behandlet', ToastType.good, 10,
                    'Betalinger og bilag er oppdatert');
            },
            err => this.errorService.handle
        );

    }

    private createPaymentFile() {
        // kjør action for å generere utbetalingsfil basert på batch
        this.paymentBatchService.generatePaymentFile(this.paymentBatch.ID)
            .subscribe((updatedPaymentBatch: PaymentBatch) => {
                if (updatedPaymentBatch.PaymentFileID) {
                    this.toastService.addToast('Utbetalingsfil laget, henter fil...', ToastType.good, 5);

                    this.fileService
                        .downloadFile(updatedPaymentBatch.PaymentFileID, 'application/xml')
                            .subscribe((blob) => {
                                this.toastService.addToast('Utbetalingsfil hentet', ToastType.good, 5);

                                // download file so the user can open it
                                saveAs(blob, `payments_${updatedPaymentBatch.ID}.xml`);

                                // reload data to display buttons correctly after generating the file
                                this.loadPaymentBatchData();
                            },
                            err => {
                                this.errorService.handle(err);
                            }
                        );
                } else {
                    this.toastService.addToast('Fant ikke utbetalingsfil, ingen PaymentFileID definert', ToastType.bad, 0);
                }
            },
            err => {
                this.errorService.handle(err);
            });
    }

    private getFormattedDate(date) {
        return moment(date).format('DD.MM.YYYY');
    }

    private downloadPaymentFile() {
        if (!this.paymentBatch.PaymentFileID) {
            this.toastService.addToast('Fil ikke generert', ToastType.bad, 15, 'Fant ingen betalingsfil, generering pågår kanskje fortsatt, vennligst prøv igjen om noen minutter');
        } else {
            this.fileService
                .downloadFile(this.paymentBatch.PaymentFileID, 'application/xml')
                    .subscribe((blob) => {
                        this.toastService.addToast('Utbetalingsfil hentet', ToastType.good, 5);
                        // download file so the user can open it
                        saveAs(blob, `payments_${this.paymentBatch.ID}.xml`);
                    },
                    err => {
                        this.errorService.handleWithMessage(err, 'Feil ved henting av utbetalingsfil');
                    }
                );
        }
    }

    private downloadReceiptFile() {
        this.fileService
            .downloadFile(this.paymentBatch.PaymentReceiptFileID, 'application/xml')
                .subscribe((blob) => {
                    this.toastService.addToast('Kvitteringsfil hentet', ToastType.good, 5)
                    // download file so the user can open it
                    saveAs(blob, `paymentreceipts_${this.paymentBatch.ID}.xml`);
                },
                err => {
                    this.errorService.handleWithMessage(err, 'Feil ved henting av kvitteringsfil');
                }
            );
    }

    private loadPaymentBatchData() {
        this.paymentBatchService.Get(this.paymentBatchID)
            .subscribe(data => {
                this.paymentBatch = data;
            },
            err => this.errorService.handle(err)
        );
    }

    private setupPaymentTable() {
        this.lookupFunction = (urlParams: URLSearchParams) => {
            let params = urlParams;

            if (params === null) {
                params = new URLSearchParams();
            }

            params.set('expand', 'ToBankAccount,FromBankAccount,PaymentCode,BusinessRelation');

            if (!params.get('orderby')) {
                params.set('orderby', 'PaymentDate ASC');
            }

            params.set('filter', `PaymentBatchID eq ${this.paymentBatchID}`);

            return this.paymentService.GetAllByUrlSearchParams(params).catch(this.errorService.handleRxCatch);
        };

        let paymentDateCol = new UniTableColumn('PaymentDate', 'Betalingsdato', UniTableColumnType.LocalDate);
        let payToCol = new UniTableColumn('BusinessRelation', 'Betales til', UniTableColumnType.Lookup)
            .setTemplate(data => data.BusinessRelation ? data.BusinessRelation.Name : '');
        let amountCol = new UniTableColumn('Amount', 'Beløp', UniTableColumnType.Money);
        let fromAccountCol = new UniTableColumn('FromBankAccount', 'Konto fra', UniTableColumnType.Lookup)
            .setDisplayField('FromBankAccount.AccountNumber');
        let toAccountCol = new UniTableColumn('ToBankAccount', 'Konto til', UniTableColumnType.Lookup)
            .setDisplayField('ToBankAccount.AccountNumber');
        let paymentIDCol = new UniTableColumn('PaymentID', 'KID', UniTableColumnType.Text);
        let dueDateCol = new UniTableColumn('DueDate', 'Forfall', UniTableColumnType.LocalDate)
            .setConditionalCls(payment => moment(payment.DueDate).isBefore(moment()) ? 'payment-due' : '');
        let paymentCodeCol = new UniTableColumn('PaymentCode', 'Type', UniTableColumnType.Lookup)
            .setDisplayField('PaymentCode.Name');
        let descriptionCol = new UniTableColumn('Description', 'Beskrivelse', UniTableColumnType.Text).setVisible(false);

        // Setup table
        this.paymentTableConfig = new UniTableConfig(false, true, 15)
            .setColumns([
                paymentDateCol,
                payToCol,
                fromAccountCol,
                toAccountCol,
                paymentIDCol,
                amountCol,
                dueDateCol,
                paymentCodeCol,
                descriptionCol
            ])
            .setContextMenu([
                {
                    action: (item) => this.paymentRelationsModal.openModal(item.ID),
                    disabled: (item) => false,
                    label: 'Vis relasjoner'
                }
            ])
            .setColumnMenuVisible(true)
            .setSearchable(false);
    }
}
