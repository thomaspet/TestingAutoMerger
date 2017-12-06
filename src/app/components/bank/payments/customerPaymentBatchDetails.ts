import {Component, ViewChild, Input, EventEmitter, Output, OnChanges} from '@angular/core';
import {Router} from '@angular/router';
import {
    PaymentService,
    PaymentBatchService,
    ErrorService,
    FileService,
    StatisticsService,
    CompanySettingsService
} from '../../../services/services';
import {PaymentBatch, CompanySettings} from '../../../unientities';
import {Observable} from 'rxjs/Observable';
import {UniTable, UniTableColumn, UniTableColumnType, UniTableConfig} from '../../../../framework/ui/unitable/index';
import {URLSearchParams} from '@angular/http';
import {PaymentRelationsModal} from './relationModal';
import {ToastService, ToastType} from '../../../../framework/uniToast/toastService';
import {UniModalService, ConfirmActions} from '../../../../framework/uniModal/barrel';
import {saveAs} from 'file-saver';
import * as moment from 'moment';

@Component({
    selector: 'customer-payment-batch-details',
    templateUrl: './customerPaymentBatchDetails.html',
})
export class CustomerPaymentBatchDetails implements OnChanges {
    @Input() private paymentBatchID: number;
    @Output() private paymentBatchUpdated: EventEmitter<PaymentBatch> = new EventEmitter<PaymentBatch>();
    @Output() private paymentBatchNavigate: EventEmitter<number> = new EventEmitter<number>();
    @Output() private deletePaymentBatch: EventEmitter<PaymentBatch> = new EventEmitter<PaymentBatch>();

    @ViewChild(PaymentRelationsModal) private paymentRelationsModal: PaymentRelationsModal;
    @ViewChild(UniTable) private table: UniTable;

    public downloadFilesAsAttachments: boolean = true;
    private paymentBatch: PaymentBatch;
    private paymentTableConfig: UniTableConfig;
    private lookupFunction: (urlParams: URLSearchParams) => any;
    private restAmountsCurrency: any;
    private companySettings: CompanySettings;

    constructor(
        private router: Router,
        private paymentService: PaymentService,
        private paymentBatchService: PaymentBatchService,
        private errorService: ErrorService,
        private toastService: ToastService,
        private fileService: FileService,
        private statisticsService: StatisticsService,
        private companySettingsService: CompanySettingsService,
        private modalService: UniModalService
    ) {}

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
            this.loadPaymentBatchData(() => {
                if (this.table) {
                    this.table.refreshTableData();
                }
            });
        }
    }

    public goToPreviousBatch() {
        this.paymentBatchNavigate.emit(-1);
    }

    public goToNextBatch() {
        this.paymentBatchNavigate.emit(1);
    }

    public deleteBatch() {
        if (!this.paymentBatch.PaymentFileID) {
            this.deletePaymentBatch.emit(this.paymentBatch);
        } else {
            this.modalService.confirm({
                header: 'Bekreft fjerning',
                message: 'Vennligst bekreft fjerning av innbetalingsfil',
                buttonLabels: {
                    accept: 'Fjern',
                    cancel: 'Avbryt'
                }
            }).onClose.subscribe(response => {
                if (response === ConfirmActions.ACCEPT) {
                    this.deletePaymentBatch.emit(this.paymentBatch);
                }
            });
        }
    }

    public updatetest() {
        this.paymentBatchUpdated.emit(this.paymentBatch);
    }

    public completeCustomerPayment() {
        this.modalService.confirm({
            header: 'Bekreft fullføring',
            message: 'Vennligst bekreft at du ønsker å fullføre innbetaling på denne innbetalingsfilen',
        }).onClose.subscribe(response => {
            if (response === ConfirmActions.ACCEPT) {
                this.paymentBatchService.completeCustomerPayment(this.paymentBatch.ID).subscribe(
                    res => {
                        this.toastService.addToast('Innbetaling fullført', ToastType.good, 5);
                        this.paymentBatch = res;
                        this.table.refreshTableData();
                        this.paymentBatchUpdated.emit(res);
                    },
                    err => this.errorService.handleWithMessage(err, 'Feil ved fullføring av betaling')
                );
            }
        });
    }

    public getFormattedDate(date) {
        return moment(date).format('DD.MM.YYYY');
    }

    public downloadPaymentFile() {
        if (!this.paymentBatch.PaymentFileID) {
            this.toastService.addToast('Fil ikke generert', ToastType.bad, 15, 'Fant ingen betalingsfil.');
        } else {
            this.fileService
                .downloadFile(this.paymentBatch.PaymentFileID, 'application/xml')
                .subscribe((blob) => {
                    this.toastService.addToast('Innbetalingsfil hentet', ToastType.good, 5);
                    // download file so the user can open it
                    saveAs(blob, `payments_${this.paymentBatch.ID}.xml`);
                },
                err => {
                    this.errorService.handleWithMessage(err, 'Feil ved henting av innbetalingsfil');
                }
                );
        }
    }

    private loadRestAmounts(done) {
        this.statisticsService.GetAll(
            `model=Tracelink&filter=DestinationEntityName%20eq%20'Payment'%20`
            + `and%20SourceEntityName%20eq%20'CustomerInvoice'%20`
            + `and%20Payment.PaymentBatchId%20eq%20${this.paymentBatchID}`
            + `&join=Tracelink.SourceInstanceId%20eq%20CustomerInvoice.ID%20as%20CustomerInvoice%20`
            + `and%20Tracelink.DestinationInstanceId%20eq%20Payment.ID`
            + `&select=Tracelink.DestinationInstanceId%20as%20PaymentId,`
            + `CustomerInvoice.RestAmountCurrency%20as%20RestAmountCurrency`
        ).map(x => x.Data ? x.Data : []).subscribe((restamountsCurrency) => {
            this.restAmountsCurrency = restamountsCurrency;

            done();
        });
    }

    private loadPaymentBatchData(done) {
        this.paymentBatchService.Get(this.paymentBatchID)
            .subscribe(data => {
                this.paymentBatch = data;
                this.loadRestAmounts(done);
            },
            err => this.errorService.handle(err)
            );
    }

    public save() {
        let tableData = this.table.getTableData();

        // set up observables (requests)
        let requests = [];

        tableData.forEach(x => {
            if (x.StatusCode !== 44004) {
                requests.push(this.paymentService.Put(x.ID, x));
            }
        });

        if (requests.length > 0) {
            Observable.forkJoin(requests)
                .subscribe(resp => {
                    this.toastService.addToast('Lagret', ToastType.good, 10, 'Endringer lagret');
                }, (err) => {
                    this.errorService.handle(err);
                });
        } else {
            this.toastService.addToast(
                'Ingen endringer',
                ToastType.warn,
                10,
                'Ingen endringer funnet eller ikke tillatt å endre fullførte.'
            );
        }
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

        let invoiceNoCol = new UniTableColumn('InvoiceNumber', 'Fakturanr', UniTableColumnType.Text);
        let payToCol = new UniTableColumn('BusinessRelation', 'Kunde', UniTableColumnType.Lookup)
            .setTemplate(data => data.BusinessRelation ? data.BusinessRelation.Name : '')
            .setOptions({
                itemTemplate: (selectedItem) => {
                    return (
                        selectedItem.CustomerID
                        ? 'Kunde: '
                        : selectedItem.SupplierID
                            ? 'Leverandør: '
                            : selectedItem.EmployeeID
                                ? 'Ansatt: '
                                : ''
                            )
                        + selectedItem.BusinessRelationName;
                },
                lookupFunction: (query: string) => {
                    return this.statisticsService.GetAll(
                        `model=BusinessRelation&select=BusinessRelation.ID,BusinessRelation.Name,`
                        + `Customer.ID,Supplier.ID,Employee.ID&join=Customer on BusinessRelation.ID `
                        + `eq Customer.BusinessRelationID Supplier on BusinessRelation.ID `
                        + `eq Supplier.BusinessRelationID Employee on BusinessRelation.ID `
                        + `eq Employee.BusinessRelationID&filter=BusinessRelation.Deleted `
                        + `eq 'false' and contains(BusinessRelation.Name,'${query}') `
                        + `and (isnull(Customer.ID,0) ne 0 or isnull(Supplier.ID,0) ne 0 `
                        + `or isnull(Employee.ID,0) ne 0)&top=20`
                    ).map(x => x.Data ? x.Data : []);
                }
            });

        let currencyCodeCol = new UniTableColumn('CurrencyCode', 'Valuta', UniTableColumnType.Text, false)
            .setDisplayField('CurrencyCode.Code')
            .setWidth('5%')
            .setVisible(false);
        let amountCurrencyCol = new UniTableColumn('AmountCurrency', 'Beløp', UniTableColumnType.Money);

        let amountCol = new UniTableColumn(
            'Amount',
            `Beløp (${this.companySettings.BaseCurrencyCode.Code})`,
            UniTableColumnType.Money
        )
            .setVisible(false)
            .setEditable(false);


        let restAmountCurrencyCol = new UniTableColumn('RestAmountCurrency', 'Restbeløp', UniTableColumnType.Money)
            .setTemplate((payment) => {
                if (this.restAmountsCurrency === null) { return 0; }
                let restamountCurrency = this.restAmountsCurrency.find(
                    (restamountCur) => restamountCur.PaymentId === payment.ID
                );
                return restamountCurrency ? restamountCurrency.RestAmountCurrency : 0;
            });
        let fromAccountCol = new UniTableColumn('FromBankAccount', 'Konto fra', UniTableColumnType.Lookup)
            .setDisplayField('FromBankAccount.AccountNumber');
        let toAccountCol = new UniTableColumn('ToBankAccount', 'Konto til', UniTableColumnType.Lookup)
            .setDisplayField('ToBankAccount.AccountNumber');
        let paymentIDCol = new UniTableColumn('PaymentID', 'KID', UniTableColumnType.Text).setWidth('12%');
        let dueDateCol = new UniTableColumn('DueDate', 'Forfall', UniTableColumnType.LocalDate)
            .setConditionalCls(
                payment => moment(payment.DueDate).isBefore(moment()) ? 'payment-due' : ''
            )
            .setVisible(false);
        let descriptionCol = new UniTableColumn(
            'Description',
            'Beskrivelse',
            UniTableColumnType.Text
        )
            .setVisible(false);

        let statusCodeCol = new UniTableColumn('StatusCode', 'Status', UniTableColumnType.Text)
            .setTemplate(data => this.paymentService.getStatusText(data.StatusCode))
            .setFilterable(false);

        // editable
        invoiceNoCol.editable = true;
        payToCol.editable = false;
        amountCol.editable = false;
        amountCurrencyCol.editable = false;
        restAmountCurrencyCol.editable = false;
        currencyCodeCol.editable = false;
        fromAccountCol.editable = false;
        toAccountCol.editable = false;
        paymentIDCol.editable = false;
        dueDateCol.editable = false;
        descriptionCol.editable = false;
        statusCodeCol.editable = false;

        // Setup table
        const configStoreKey = 'bank.payments.customerPaymentBatchDetails';
        this.paymentTableConfig = new UniTableConfig(configStoreKey, true, true, 15)
            .setAutoAddNewRow(false)
            .setColumns([
                invoiceNoCol,
                payToCol,
                fromAccountCol,
                toAccountCol,
                paymentIDCol,
                currencyCodeCol,
                amountCurrencyCol,
                amountCol,
                restAmountCurrencyCol,
                statusCodeCol,
                dueDateCol,
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
