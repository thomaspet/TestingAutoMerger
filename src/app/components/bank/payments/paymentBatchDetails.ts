import {Component, ViewChild, Input, EventEmitter, Output, OnChanges} from '@angular/core';
import {Router} from '@angular/router';
import {PaymentService, PaymentBatchService, ErrorService, FileService,
    StatisticsService, CompanySettingsService} from '../../../services/services';
import {PaymentBatch, CompanySettings} from '../../../unientities';
import {UniTable, UniTableColumn, UniTableColumnType, UniTableConfig} from 'unitable-ng2/main';
import {URLSearchParams} from '@angular/http';
import {PaymentRelationsModal} from './relationModal';
import {ToastService, ToastType} from '../../../../framework/uniToast/toastService';
import {UniConfirmModal, ConfirmActions} from '../../../../framework/modals/confirm';
import {saveAs} from 'file-saver';
import * as moment from 'moment';

@Component({
    selector: 'payment-batch-details',
    templateUrl: './paymentBatchDetails.html',
})
export class PaymentBatchDetails implements OnChanges {
    @Input() private paymentBatchID: number;
    @Output() private paymentBatchUpdated: EventEmitter<PaymentBatch> = new EventEmitter<PaymentBatch>();
    @Output() private paymentBatchNavigate: EventEmitter<number> = new EventEmitter<number>();
    @Output() private deletePaymentBatch: EventEmitter<PaymentBatch> = new EventEmitter<PaymentBatch>();

    @ViewChild(PaymentRelationsModal) private paymentRelationsModal: PaymentRelationsModal;
    @ViewChild(UniTable) private table: UniTable;
    @ViewChild(UniConfirmModal) private confirmModal: UniConfirmModal;

    private downloadFilesAsAttachments: boolean = true;
    private paymentBatch: PaymentBatch;
    private paymentTableConfig: UniTableConfig;
    private lookupFunction: (urlParams: URLSearchParams) => any;
    private receiptFilesVisible: boolean = false;
    private companySettings: CompanySettings;

    constructor(
        private router: Router,
        private paymentService: PaymentService,
        private paymentBatchService: PaymentBatchService,
        private errorService: ErrorService,
        private toastService: ToastService,
        private fileService: FileService,
        private statisticsService: StatisticsService,
        private companySettingsService: CompanySettingsService) { }

    public ngOnInit() {
        this.companySettingsService.Get(1)
            .subscribe(data => {
                this.companySettings = data;
                this.setupPaymentTable();
            },
            err => this.errorService.handle(err)
            );
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
        if (!this.paymentBatch.PaymentFileID) {
            this.deletePaymentBatch.emit(this.paymentBatch);
        } else {
            this.confirmModal.confirm(
                `Er du sikker på at du vil tilbakestille bunten? Betalingene vil da legges tilbake i betalingslisten`,
                'Bekreft tilbakestilling',
                false,
                { accept: 'Tilbakestill bunt', reject: 'Avbryt' }
            ).then((action) => {
                if (action === ConfirmActions.ACCEPT) {
                    this.deletePaymentBatch.emit(this.paymentBatch);
                }
            });
        }
    }

    private receiptFileUploaded(file) {
        this.toastService.addToast('Kvitteringsfil lastet opp, tolker fil..', ToastType.good, 10,
            'Dette kan ta litt tid, vennligst vent...');

        this.paymentBatchService.registerReceiptFileCamt054(file)
            .subscribe(paymentBatch => {
                this.toastService.addToast('Kvitteringsfil tolket og behandlet', ToastType.good, 10,
                    'Betalinger og bilag er oppdatert');
                this.table.refreshTableData();
                this.paymentBatchUpdated.emit(paymentBatch);
            },
            err => {
                this.errorService.handle(err);
            }
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

    private toggleReceiptFilesVisible() {
        this.receiptFilesVisible = !this.receiptFilesVisible;
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

            params.set('expand', 'ToBankAccount,FromBankAccount,PaymentCode,BusinessRelation,CurrencyCode');
            params.set('filter', `PaymentBatchID eq ${this.paymentBatchID}`);

            if (!params.get('orderby')) {
                params.set('orderby', 'PaymentDate ASC');
            }

            return this.paymentService.GetAllByUrlSearchParams(params).catch(this.errorService.handleRxCatch);
        };

        let paymentDateCol = new UniTableColumn('PaymentDate', 'Betalingsdato', UniTableColumnType.LocalDate);
        let payToCol = new UniTableColumn('BusinessRelation', 'Betales til', UniTableColumnType.Lookup)
            .setTemplate(data => data.BusinessRelation ? data.BusinessRelation.Name : '');
        let currencyCodeCol = new UniTableColumn('CurrencyCode', 'Valuta', UniTableColumnType.Text, false)
            .setDisplayField('CurrencyCode.Code')
            .setWidth('5%')
            .setVisible(false);
        let amountCurrencyCol = new UniTableColumn('AmountCurrency', 'Beløp', UniTableColumnType.Money);

        let amountCol = new UniTableColumn('Amount', `Beløp (${this.companySettings.BaseCurrencyCode.Code})`, UniTableColumnType.Money)
            .setVisible(false)
            .setEditable(false);

        let fromAccountCol = new UniTableColumn('FromBankAccount', 'Konto fra', UniTableColumnType.Lookup)
            .setDisplayField('FromBankAccount.AccountNumber');
        let toAccountCol = new UniTableColumn('ToBankAccount', 'Konto til', UniTableColumnType.Lookup)
            .setDisplayField('ToBankAccount.AccountNumber');
        let paymentIDCol = new UniTableColumn('PaymentID', 'KID', UniTableColumnType.Text);
        let dueDateCol = new UniTableColumn('DueDate', 'Forfall', UniTableColumnType.LocalDate)
            .setConditionalCls(payment => moment(payment.DueDate).isBefore(moment()) ? 'payment-due' : '');
        let paymentCodeCol = new UniTableColumn('PaymentCode', 'Type', UniTableColumnType.Lookup)
            .setDisplayField('PaymentCode.Name').setVisible(false);
        let descriptionCol = new UniTableColumn('Description', 'Beskrivelse', UniTableColumnType.Text).setVisible(false);
        let statusCol = new UniTableColumn('StatusCode', 'Status', UniTableColumnType.Number)
            .setEditable(false)
            .setVisible(false)
            .setTemplate((p) => {
                return this.paymentService.getStatusText(p.StatusCode);
            });


        // Setup table
        this.paymentTableConfig = new UniTableConfig(false, true, 15)
            .setColumns([
                paymentDateCol,
                payToCol,
                fromAccountCol,
                toAccountCol,
                paymentIDCol,
                currencyCodeCol,
                amountCurrencyCol,
                amountCol,
                dueDateCol,
                paymentCodeCol,
                descriptionCol,
                statusCol
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
