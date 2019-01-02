import {Component, ChangeDetectorRef, ChangeDetectionStrategy, ViewChild, AfterContentInit} from '@angular/core';
import {Observable} from 'rxjs';
import {IToolbarConfig} from '../common/toolbar/toolbar';
import {IUniSaveAction} from '../../../framework/save/save';
import {Router, ActivatedRoute} from '@angular/router';
import {
    Ticker,
    TickerGroup,
    ITickerActionOverride,
    ITickerColumnOverride
} from '../../services/common/uniTickerService';
import {TabService, UniModules} from '../layout/navbar/tabstrip/tabService';
import {UniTickerContainer} from '../uniticker/tickerContainer/tickerContainer';
import {
    UniModalService,
    UniSendPaymentModal,
    UniConfirmModalV2,
    UniAutobankAgreementModal,
    ConfirmActions,
} from '../../../framework/uni-modal';
import {
    UniAutobankAgreementListModal,
    MatchCustomerManualModal
} from './modals';
import {File, Payment, PaymentBatch, LocalDate, CompanySettings} from '../../unientities';
import {saveAs} from 'file-saver';
import {UniPaymentEditModal} from './modals/paymentEditModal';
import { AddPaymentModal } from '@app/components/common/modals/addPaymentModal';
import {
    ErrorService,
    StatisticsService,
    PaymentBatchService,
    FileService,
    UniTickerService,
    PaymentService,
    JournalEntryService,
    CustomerInvoiceService,
    ElsaProductService,
    ElsaPurchaseService,
    CompanySettingsService,
} from '../../services/services';
import {ToastService, ToastType} from '../../../framework/uniToast/toastService';
import * as moment from 'moment';
import { AfterViewInit } from '@angular/core/src/metadata/lifecycle_hooks';
import { RequestMethod, Http } from '@angular/http';
import { BookPaymentManualModal } from '@app/components/common/modals/bookPaymentManual';
import { MatchCustomerInvoiceManual } from '@app/components/bank/modals/matchCustomerInvoiceManual';

@Component({
    selector: 'uni-bank-component',
    template: `
        <uni-toolbar [config]="toolbarconfig" [saveactions]="actions"></uni-toolbar>
        <section class="ticker-overview">
            <ul class="ticker-list">
                <li *ngFor="let group of tickerGroups">
                    {{group.Name}}
                    <ul>
                        <li *ngFor="let ticker of group.Tickers"
                            (click)="navigateToTicker(ticker)"
                            [attr.aria-selected]="ticker.Code === selectedTicker?.Code">
                            {{ticker.Name}}
                        </li>
                    </ul>
                </li>
            </ul>

            <section class="autobank-section" *ngIf="hasAccessToAutobank">
                <a (click)="openAgreementsModal()" *ngIf="agreements?.length > 0">Mine avtaler</a>
                <button class="good" (click)="openAutobankAgreementModal()"> Ny autobankavtale </button>
            </section>

            <section class="overview-ticker-section">
                <uni-ticker-container
                    [ticker]="selectedTicker"
                    [actionOverrides]="actionOverrides"
                    [columnOverrides]="columnOverrides"
                    (rowSelectionChange)="onRowSelectionChanged($event)">
                </uni-ticker-container>
            </section>
        </section>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BankComponent implements AfterViewInit {

    @ViewChild(UniTickerContainer) public tickerContainer: UniTickerContainer;

    private tickers: Ticker[];
    public tickerGroups: TickerGroup[];
    public selectedTicker: Ticker;
    public actions: IUniSaveAction[];
    private rows: Array<any> = [];
    private canEdit: boolean = true;
    private agreements: any[];
    private companySettings: CompanySettings;
    public hasAccessToAutobank: boolean;

    public toolbarconfig: IToolbarConfig = {
        title: '',
        subheads: [],
        navigation: {}
    };

    public actionOverrides: Array<ITickerActionOverride> = [
        {
            Code: 'to_payment',
            ExecuteActionHandler: (selectedRows) => this.openSendToPaymentModal(selectedRows)
        },
        {
            Code: 'download_file',
            ExecuteActionHandler: (selectedRows) => this.downloadIncommingPaymentFile(selectedRows)
        },
        {
            Code: 'download_payment_file',
            ExecuteActionHandler: (selectedRows) => this.downloadPaymentFiles(selectedRows),
            CheckActionIsDisabled: (selectedRow) => selectedRow.PaymentStatusCode === 44001
        },
        {
            Code: 'edit_payment',
            ExecuteActionHandler: (selectedRows) => this.editPayment(selectedRows),
            CheckActionIsDisabled: (selectedRow) => selectedRow.PaymentStatusCode !== 44001
        },
        {
            Code: 'reset_payment',
            ExecuteActionHandler: (selectedRows) => this.resetPayment(selectedRows, false),
            CheckActionIsDisabled: (selectedRow) => this.checkResetPaymentDisabled(selectedRow)
        },
        {
            Code: 'reset_edit_payment',
            ExecuteActionHandler: (selectedRows) => this.resetPayment(selectedRows, true),
            CheckActionIsDisabled: (selectedRow) => this.checkResetPaymentDisabled(selectedRow)
        },
        {
            Code: 'remove_payment',
            ExecuteActionHandler: (selectedRows) => this.removePayment(selectedRows),
            CheckActionIsDisabled: (selectedRow) =>
                selectedRow.PaymentStatusCode !== 44001 &&
                !this.isAllowedToForceDeletePayment(selectedRow)
        },
        {
            Code: 'book_manual',
            ExecuteActionHandler: (selectedRows) => this.bookManual(selectedRows),
            CheckActionIsDisabled: (selectedRow) => this.checkBookPaymentDisabled(selectedRow)
        },
        {
            Code: 'select_invoice',
            ExecuteActionHandler: (selectedRows) => this.selectInvoiceForPayment(selectedRows),
            CheckActionIsDisabled: (selectedRow) => selectedRow.PaymentStatusCode !== 44018
        },
        {
            Code: 'select_customer',
            ExecuteActionHandler: (selectedRows) => this.selectCustomerForPayment(selectedRows),
            CheckActionIsDisabled: (selectedRow) => selectedRow.PaymentStatusCode !== 44018
        },
        {
            Code: 'revert_batch',
            ExecuteActionHandler: (selectedRows) => this.revertBatch(selectedRows),
            CheckActionIsDisabled: (selectedRow) => selectedRow.PaymentBatchStatusCode === 45009
        }
    ];

    public columnOverrides: ITickerColumnOverride[] = [
        {
            Field: 'FromBankAccount.AccountNumber',
            Template: (row) => {
                return row.FromBankAccountAccountNumber || row.PaymentExternalBankAccountNumber;
            }
        },
        {
            Field: 'ToBankAccount.AccountNumber',
            Template: (row) => {
                return row.ToBankAccountAccountNumber || row.PaymentExternalBankAccountNumber;
            }
        },
        {
            Field: 'BusinessRelation.Name',
            Template: (row) => {
                if (!this.companySettings || !this.companySettings.TaxBankAccount || row.BusinessRelationName) {
                    return row.BusinessRelationName;
                }
                if (row.ToBankAccountAccountNumber === this.companySettings.TaxBankAccount.AccountNumber) {return 'Forskuddstrekk'; }
                return '';
            }
        }
    ];

    public checkResetPaymentDisabled(selectedRow: any): boolean {
        const enabledForStatuses = [44003, 44010, 44012, 44014];
        return !enabledForStatuses.includes(selectedRow.PaymentStatusCode);
    }

    public checkBookPaymentDisabled(selectedRow: any): boolean {
        // incase payment is rejected and done manualy in a bankprogram you can still book the payment
        const enabledForStatuses = [44003, 44006, 44010, 44012, 44014];
        return !enabledForStatuses.includes(selectedRow.PaymentStatusCode);
    }

    public isAllowedToForceDeletePayment(selectedRow: any): boolean {
        const enabledForStatuses = [44002, 44005, 44007, 44008, 44009, 44011];
        return enabledForStatuses.includes(selectedRow.PaymentStatusCode);
    }

    constructor(
        private uniTickerService: UniTickerService,
        private router: Router,
        private route: ActivatedRoute,
        private cdr: ChangeDetectorRef,
        private tabService: TabService,
        private modalService: UniModalService,
        private paymentBatchService: PaymentBatchService,
        private errorService: ErrorService,
        private toastService: ToastService,
        private fileService: FileService,
        private paymentService: PaymentService,
        private journalEntryService: JournalEntryService,
        private customerInvoiceService: CustomerInvoiceService,
        private elsaPurchasesService: ElsaPurchaseService,
        private companySettingsService: CompanySettingsService,
    ) {
        this.updateTab();

        this.elsaPurchasesService.getPurchaseByProductName('Autobank').subscribe(
            res => this.hasAccessToAutobank = !!res,
            err => console.error(err)
        );
    }

    public ngAfterViewInit() {
        this.companySettingsService
            .getCompanySettings(['TaxBankAccount'])
            .subscribe(companySettings => this.companySettings = companySettings);

        this.uniTickerService.getTickers().then(tickers => {
            this.tickers = tickers;
            this.tickerGroups = this.uniTickerService.getGroupedTopLevelTickers(tickers)
                .filter((group) => {
                    return group.Name === 'Bank';
                });

            // Get autobank agreements to see if options should be shown in the toolbar
            this.paymentBatchService.checkAutoBankAgreement().subscribe((agreements) => {
                this.agreements = agreements;
            });

            this.route.queryParams.subscribe(params => {
                const tickerCode = params && params['code'];
                const ticker = tickerCode && this.tickerGroups[0].Tickers.find(t => t.Code === tickerCode);

                if (!ticker) {
                    this.navigateToTicker(this.tickerGroups[0].Tickers[0]);
                    return;
                }

                this.canEdit = !params['filter'] || params['filter'] === 'not_payed';

                if (!this.selectedTicker || this.selectedTicker.Code !== ticker.Code) {
                    this.updateTab();
                    this.selectedTicker = ticker;
                    this.updateSaveActions(tickerCode);
                    this.toolbarconfig.title = this.selectedTicker.Name;
                    this.cdr.markForCheck();
                }
            });
        });
    }

    private updateTab() {
        let url = '/bank';
        const queryParams = window.location.href.split('?')[1];
        if (queryParams) {
            url += '?' + queryParams;
        }

        this.tabService.addTab({
            name: 'Bank',
            url: url,
            moduleID: UniModules.Bank,
            active: true
        });
    }

    public navigateToTicker(ticker: Ticker) {
        this.router.navigate(['/bank'], {
            queryParams: { code: ticker.Code },
            skipLocationChange: false
        });
    }

    public onRowSelectionChanged(selectedRows) {
        this.rows = selectedRows;
        this.updateSaveActions(this.selectedTicker.Code);
    }

    public updateSaveActions(selectedTickerCode: string) {
        this.actions = [];

        if (selectedTickerCode === 'payment_list') {

            this.actions.push({
                label: 'Rediger',
                action: (done) => {
                    this.openEditModal().subscribe((res: boolean) => {
                        done(res ? 'Endringer lagret.' : '');
                        if (res) {
                            // Refresh the data in the table.. Down down goes the rabbithole!
                            // Should have taken the blue pill...
                            this.tickerContainer.mainTicker.reloadData();
                        }
                    });
                },
                main: this.canEdit && !this.rows.length,
                disabled: !this.canEdit
            });

            this.actions.push({
                label: 'Manuell betaling',
                action: (done) => this.pay(done, true),
                main: this.rows.length > 0 && !this.agreements.length,
                disabled: this.rows.length === 0 || !this.canEdit
            });

            this.actions.push({
                label: 'Send til betaling',
                action: (done) => this.pay(done, false),
                main: this.rows.length > 0 && this.canEdit,
                disabled: this.rows.length === 0 || !this.agreements.length || !this.canEdit
            });

            this.actions.push({
                label: 'Slett valgte',
                action: (done) => this.deleteSelected(done),
                main: false,
                disabled: this.rows.length === 0 || !this.canEdit
            });

            this.actions.push({
                label: 'Hent bankfiler og bokfør',
                action: (done, file) => {
                    done('Fil lastet opp');
                    this.recieptUploaded(file);
                },
                disabled: false,
                isUpload: true
            });

            this.actions.push({
                label: 'Bokfør og sett til betalt',
                action: (done, file) => {
                    done('Status oppdatert');
                    this.updatePaymentStatusToPaidAndJournaled(done);
                },
                disabled: this.rows.length === 0
            });

            this.actions.push({
                label: 'Sett som betalt og bokført',
                action: (done, file) => {
                    done('Status oppdatert');
                    this.updatePaymentStatusToPaid(done);
                },
                disabled: this.rows.length === 0
            });
        } else if (selectedTickerCode === 'bank_list') {
            this.actions.push({
                label: 'Hent og bokfør innbetalingsfil',
                action: (done, file) => {
                    done('Fil lastet opp');
                    this.fileUploaded(file);
                },
                disabled: false,
                main: true,
                isUpload: true
            });
        }
    }

    public downloadPaymentFiles(rows): Promise<any> {
        const row = rows[0];
        return new Promise((resolve, reject) => {
            resolve();
            this.paymentBatchService.Get(row.PaymentBatchID).subscribe((paymentBatch) => {
                if (paymentBatch.PaymentFileID) {
                    this.fileService
                        .downloadFile(paymentBatch.PaymentFileID, 'application/xml')
                        .subscribe((blob) => {
                            this.toastService.addToast('Utbetalingsfil hentet', ToastType.good, 5);
                            saveAs(blob, `payments_${row.ID}.xml`);
                            resolve();
                        },
                        err => {
                            this.errorService.handleWithMessage(err, 'Feil ved henting av utbetalingsfil');
                            reject('Feil ved henting av utbetalingsfil');
                        });
                } else {
                    this.toastService.addToast(
                        'Fil ikke generert',
                        ToastType.bad,
                        15,
                        'Fant ingen betalingsfil, generering pågår kanskje fortsatt, '
                        + 'vennligst prøv igjen om noen minutter'
                    );
                    reject('Feil ved henting av utbetalingsfil');
                }
            });
        });
    }

    public downloadIncommingPaymentFile(rows): Promise<any> {
        const row = rows[0];
        return new Promise(() => {
            this.paymentBatchService.Get(row.PaymentBatchID).subscribe((paymentBatch) => {
                if (!paymentBatch.PaymentFileID) {
                    this.toastService.addToast('Fil ikke generert', ToastType.bad, 15, 'Fant ingen betalingsfil.');
                } else {
                    this.fileService
                        .downloadFile(paymentBatch.PaymentFileID, 'application/xml')
                        .subscribe((blob) => {
                            this.toastService.addToast('Innbetalingsfil hentet', ToastType.good, 5);
                            // download file so the user can open it
                            saveAs(blob, `payments_${paymentBatch.ID}.xml`);
                        },
                        err => {
                            this.errorService.handleWithMessage(err, 'Feil ved henting av innbetalingsfil');
                        }
                        );
                }
            });
        });
    }

    public editPayment(selectedRows: any): Promise<any> {
        const row = selectedRows[0];
        return new Promise(() => {
            this.paymentService.Get(row.ID, ['BusinessRelation', 'FromBankAccount', 'ToBankAccount']).subscribe((payment: Payment) => {
                // show addPaymentModel
                this.modalService.open(AddPaymentModal, {
                    data: { model: payment },
                    header: 'Endre betaling',
                    buttonLabels: {accept: 'Oppdater betaling'}
                }).onClose.
                subscribe((updatedPaymentInfo: Payment) => {
                    if (updatedPaymentInfo) {
                        this.paymentService.Put(payment.ID, updatedPaymentInfo)
                        .subscribe(paymentResponse => {
                            this.tickerContainer.mainTicker.reloadData(); // refresh table
                        });
                    }
                });
            });
        });
    }

    public resetPayment(selectedRows: any, showModal: boolean): Promise<any> {
        const row = selectedRows[0];
        return new Promise(() => {
            this.paymentService.Get(row.ID, ['BusinessRelation', 'FromBankAccount', 'ToBankAccount']).subscribe((payment: Payment) => {
                const newPayment = new Payment();
                newPayment.PaymentDate = new LocalDate();
                newPayment.DueDate =  payment.DueDate;
                newPayment.InvoiceNumber = payment.InvoiceNumber;
                newPayment.Amount = payment.Amount;
                newPayment.AmountCurrency = payment.AmountCurrency;
                newPayment.ToBankAccount = payment.ToBankAccount;
                newPayment.ToBankAccountID = payment.ToBankAccountID;
                newPayment.FromBankAccount = payment.FromBankAccount;
                newPayment.FromBankAccountID = payment.FromBankAccountID;
                newPayment.BusinessRelation = payment.BusinessRelation;
                newPayment.BusinessRelationID = payment.BusinessRelationID;
                newPayment.PaymentCodeID = payment.PaymentCodeID;
                newPayment.Description = payment.Description;
                newPayment.PaymentID = payment.PaymentID;
                newPayment.ReconcilePayment = payment.ReconcilePayment;
                newPayment.AutoJournal = payment.AutoJournal;
                newPayment.IsCustomerPayment = payment.IsCustomerPayment;

                if (showModal) {
                    // show addPaymentModel
                    this.modalService.open(AddPaymentModal, {
                        data: { model: newPayment },
                        header: 'Endre betaling',
                        buttonLabels: {accept: 'Oppdater betaling'}
                    }).onClose.
                    subscribe((updatedPaymentInfo: Payment) => {
                        if (updatedPaymentInfo) {
                            this.paymentService.ActionWithBody(
                                null,
                                updatedPaymentInfo,
                                'reset-payment',
                                RequestMethod.Post,
                                'oldPaymentID=' + payment.ID
                            ).subscribe(paymentResponse => {
                                this.tickerContainer.mainTicker.reloadData(); // refresh table
                                this.toastService.addToast('Lagring og tilbakestillingen av betalingen er fullført', ToastType.good, 3);
                            });
                        }
                    });
                } else {
                    this.paymentService.ActionWithBody(
                        null,
                        newPayment,
                        'reset-payment',
                        RequestMethod.Post,
                        'oldPaymentID=' + payment.ID
                    ).subscribe(paymentResponse => {
                        this.tickerContainer.mainTicker.reloadData(); // refresh table
                        this.toastService.addToast('Tilbakestillingen av betalingen er fullført', ToastType.good, 3);
                    });
                }
            });
        });
    }

    public revertBatch(selectedRows: any) {
        return new Promise(() => {
        const row = selectedRows[0];
        const modal = this.modalService.open(UniConfirmModalV2, {
            header: 'Tilbakestille betalingsbunt',
            message: `Viktig, du må kun gjøre dette hvis betalingsfil er avvist fra banken eller `
            + ` hvis betalingsfil ikke er sendt til nettbank.<br>Når filen er allerede er akseptert `
            + ` i nettbanken og du sender den igjen blir betalingen utført flere ganger.<br>`
            + ` Vil du tilbakestille betalingsbunt med ID: ${row.ID}?`,
            buttonLabels: {
                accept: 'Tilbakestill',
                reject: 'Avbryt'
            }
        });

        modal.onClose.subscribe((result) => {
            if (result === ConfirmActions.ACCEPT) {
                this.paymentBatchService.revertPaymentBatch(row.ID, true).subscribe(paymentResponse => {
                    this.tickerContainer.mainTicker.reloadData(); // refresh table
                    this.toastService.addToast('Tilbakestillingen av betalingsbunt er fullført', ToastType.good, 3);
                    });
                }
            });
        });
    }

    public removePayment(selectedRows: any) {
        return new Promise(() => {
        const row = selectedRows[0];
        const warningMessage = this.isAllowedToForceDeletePayment(row) ?
        `Viktig, betalinger er sendt til banken og må stoppes manuelt der før du kan slette betalingen.<br>
        Hvis betalingen ikke kan stoppes manuelt, vennligst ta kontakt med banken<br><br>`
        : '';
        const modal = this.modalService.open(UniConfirmModalV2, {
            header: 'Slett betaling',
            message: `Vil du slette betaling ${row.Description ? ' ' + row.Description : ''}?`,
            warning: warningMessage,
            buttonLabels: {
                accept: 'Slett og krediter faktura',
                reject: 'Slett betaling',
                cancel: 'Avbryt'
            }
        });

        modal.onClose.subscribe((result) => {
            if (result !== ConfirmActions.CANCEL) {
                this.paymentService.Action(
                    row.ID,
                    result === ConfirmActions.ACCEPT ? 'force-delete-and-credit' : 'force-delete',
                    null,
                    RequestMethod.Delete
                ).subscribe(paymentResponse => {
                    this.tickerContainer.mainTicker.reloadData(); // refresh table
                    this.toastService.addToast('Betaling er slettet', ToastType.good, 3);
                    });
                }
            });
        });
    }

    public updatePaymentStatusToPaidAndJournaled(doneHandler: (status: string) => any) {
        this.rows = this.tickerContainer.mainTicker.table.getSelectedRows();
        if (this.rows.length === 0) {
            this.toastService.addToast(
                'Ingen rader er valgt',
                ToastType.bad,
                10,
                'Vennligst velg hvilke linjer du vil endre, eller kryss av for alle'
            );

            doneHandler('Lagring og utbetaling avbrutt');
            return;
        }

        const modal = this.modalService.open(UniConfirmModalV2, {
            header: 'Oppdater betalingsstatus',
            message: `Viktig, du må kun gjøre dette hvis betalinger er fullført og du har ikke bokført betalinger manuelt.`,
            buttonLabels: {
                accept: 'Oppdater',
                reject: 'Avbryt'
            }
        });

        modal.onClose.subscribe((result) => {
            if (result === ConfirmActions.ACCEPT) {
                const paymentIDs: number[] = [];
                this.rows.forEach(x => {
                    paymentIDs.push(x.ID);
                });
                this.paymentBatchService.updatePaymentsToPaidAndJournalPayments(paymentIDs).subscribe(paymentResponse => {
                    this.tickerContainer.mainTicker.reloadData(); // refresh table
                    this.toastService.addToast('Oppdatering av valgt betalinger er fullført', ToastType.good, 3);
                });
            } else {
                doneHandler('Status oppdatering avbrutt');
                return;
            }
        });
    }

    public updatePaymentStatusToPaid(doneHandler: (status: string) => any) {
        this.rows = this.tickerContainer.mainTicker.table.getSelectedRows();
        if (this.rows.length === 0) {
            this.toastService.addToast(
                'Ingen rader er valgt',
                ToastType.bad,
                10,
                'Vennligst velg hvilke linjer du vil endre, eller kryss av for alle'
            );

            doneHandler('Lagring og utbetaling avbrutt');
            return;
        }

        const modal = this.modalService.open(UniConfirmModalV2, {
            header: 'Oppdater betalingsstatus',
            message: `Viktig, du må kun gjøre dette hvis du har manuelt bokført betalinger og hvis betalinger er fullført.`,
            buttonLabels: {
                accept: 'Oppdater',
                reject: 'Avbryt'
            }
        });

        modal.onClose.subscribe((result) => {
            if (result === ConfirmActions.ACCEPT) {
                const paymentIDs: number[] = [];
                this.rows.forEach(x => {
                    paymentIDs.push(x.ID);
                });
                this.paymentBatchService.updatePaymentsToPaid(paymentIDs).subscribe(paymentResponse => {
                    this.tickerContainer.mainTicker.reloadData(); // refresh table
                    this.toastService.addToast('Oppdatering av valgt betalinger er fullført', ToastType.good, 3);
                });
            } else {
                doneHandler('Status oppdatering avbrutt');
                return;
            }
        });
    }

    public bookManual(selectedRows: any) {
        return new Promise(() => {
            const row = selectedRows[0];
            const modal = this.modalService.open(BookPaymentManualModal, {
                data: {model: row}
            });

            modal.onClose.subscribe((result) => {

                if (result) {
                    this.journalEntryService.bookJournalEntryAgainstPayment(result, row.ID)
                    .subscribe(() => {
                        this.tickerContainer.mainTicker.reloadData(); // refresh table
                        this.toastService.addToast('Manuell betaling fullført', ToastType.good, 3);
                    });
                }
            });
        });
    }

    public selectInvoiceForPayment(selectedRows: any) {
        return new Promise(() => {
            const row = selectedRows[0];
            const modal = this.modalService.open(MatchCustomerInvoiceManual, {
                data: {model: row}
            });

            modal.onClose.subscribe((result) => {
                if (result && result.length > 0) {
                    this.customerInvoiceService.matchInvoicesManual(result, row.ID)
                        .subscribe(() => this.tickerContainer.mainTicker.reloadData()); // refresh table);
                }
            });
        });
    }

    public selectCustomerForPayment(selectedRows: any) {
        return new Promise(() => {
            const row = selectedRows[0];
            const modal = this.modalService.open(MatchCustomerManualModal, {
                data: {model: row}
            });
            modal.onClose.subscribe((result) => {
                if (result && result.customerID) {
                     this.journalEntryService.PutAction(null,
                         'book-payment-against-customer',
                         'customerID=' + result.customerID + '&paymentID=' + row.ID + '&isBalanceKID=' + result.isBalanceKID)
                         .subscribe(() => this.tickerContainer.mainTicker.reloadData()); // refresh table);
                }
            });
        });
    }

    public fileUploaded(file: File) {
        this.toastService.addToast('Laster opp innbetalingsfil..', ToastType.good, 5,
            'Dette kan ta litt tid, vennligst vent...');

        this.paymentBatchService.registerAndCompleteCustomerPayment(file.ID)
            .subscribe(result => {
                this.toastService.clear();
                if (result && result.ProgressUrl) {
                    this.toastService.addToast('Innbetalingsjobb startet', ToastType.good, 5,
                    'Avhengig av pågang og størrelse på oppgaven kan dette ta litt tid. Vennligst sjekk igjen om litt.');
                    this.paymentBatchService.waitUntilJobCompleted(result.ID).subscribe(jobResponse => {
                        if (jobResponse && !jobResponse.HasError) {
                            this.toastService.addToast('Innbetalingjobb er fullført', ToastType.good, 10,
                            `<a href="/#/bank?code=bank_list&filter=incomming_and_journaled">Se detaljer</a>`);
                        } else {
                            this.toastService.addToast('Innbetalingsjobb feilet', ToastType.bad, 0, jobResponse.Result);
                        }
                        this.tickerContainer.getFilterCounts();
                        this.tickerContainer.mainTicker.reloadData();
                    });
                } else {
                    this.toastService.addToast('Innbetaling fullført', ToastType.good, 5);
                    this.tickerContainer.getFilterCounts();
                    this.tickerContainer.mainTicker.reloadData();
                }
            },
            err => this.errorService.handle(err)
        );
    }

    public recieptUploaded(file: File) {
        this.toastService.addToast('Laster opp kvitteringsfil..', ToastType.good, 10,
        'Dette kan ta litt tid, vennligst vent...');

        this.paymentBatchService.registerReceiptFile(file)
            .subscribe(paymentBatch => {
                this.toastService.addToast('Kvitteringsfil tolket og behandlet', ToastType.good, 10,
                    'Betalinger og bilag er oppdatert');

                this.tickerContainer.getFilterCounts();
                this.tickerContainer.mainTicker.reloadData();
            },
            err => this.errorService.handle(err)
            );
    }

    private openSendToPaymentModal(row): Promise<any> {
        return new Promise((resolve, reject) => {
            this.modalService.open(UniSendPaymentModal, {
                data: {
                    PaymentBatchID: row[0].ID,
                    hasTwoStage: this.companySettings.TwoStageAutobankEnabled
                }
            });
        });
    }

    private openEditModal() {
        return this.modalService.open(UniPaymentEditModal).onClose;
    }

    public openAgreementsModal() {
        this.modalService.open(UniAutobankAgreementListModal, { data: { agreements: this.agreements } });
    }

    public openAutobankAgreementModal() {
        this.modalService.open(UniAutobankAgreementModal);
    }

    private pay(doneHandler: (status: string) => any, isManualPayment: boolean) {
        this.rows = this.tickerContainer.mainTicker.table.getSelectedRows();
        if (this.rows.length === 0) {
            this.toastService.addToast(
                'Ingen rader er valgt',
                ToastType.bad,
                10,
                'Vennligst velg hvilke linjer du vil utbetale, eller kryss av for alle'
            );

            doneHandler('Lagring og utbetaling avbrutt');
            return;
        }

        if (!this.validateBeforePay(this.rows)) {
            doneHandler('Feil ved validering, lagring og utbetaling avbrutt');
            return;
        }

        const rowsWithOldDates: any[] =
        this.rows.filter(x => moment(x.PaymentDate).isBefore(moment().startOf('day')));

        if (rowsWithOldDates.length > 0) {
            const modal = this.modalService.open(UniConfirmModalV2, {
                header: 'Ugyldig betalingsdato',
                message: `Det er ${rowsWithOldDates.length} rader som har betalingsdato
                    tidligere enn dagens dato. Vil du sette dagens dato?`,
                buttonLabels: {
                    accept: 'Lagre med dagens dato og send til utbetaling',
                    reject: 'Avbryt og sett dato manuelt'
                }
            });

            modal.onClose.subscribe((result) => {
                if (result === ConfirmActions.ACCEPT) {
                    rowsWithOldDates.map(row => {
                        row.PaymentDate = new LocalDate(new Date());
                        row._isDirty = true;
                        this.tickerContainer.mainTicker.table.updateRow(row._originalIndex, row);
                    });
                    this.payInternal(this.rows, doneHandler, isManualPayment);
                } else {
                    doneHandler('Lagring og utbetaling avbrutt');
                }
            });
        } else {
            const modal = this.modalService.open(UniConfirmModalV2, {
                header: 'Bekreft utbetaling',
                message: `Er du sikker på at du vil utbetale de valgte ${this.rows.length} radene?`,
                buttonLabels: {accept: 'Lagre og send til utbetaling', reject: 'Avbryt'}
            });

            modal.onClose.subscribe((response) => {
                if (response !== ConfirmActions.ACCEPT) {
                    doneHandler('Lagring og utbetaling avbrutt');
                    return;
                }
                this.payInternal(this.rows, doneHandler, isManualPayment);
            });
        }
    }

    private payInternal(selectedRows: Array<Payment>, doneHandler: (status: string) => any, isManualPayment: boolean) {
        const paymentIDs: number[] = [];
        selectedRows.forEach(x => {
            paymentIDs.push(x.ID);
        });

        // User selected manual payment!
        if (isManualPayment) {
        // Create action to generate batch for n paymetns
        this.paymentService.createPaymentBatch(paymentIDs, isManualPayment)
        .subscribe((paymentBatch: PaymentBatch) => {
            this.toastService.addToast(
                `Betalingsbunt ${paymentBatch.ID} opprettet, genererer utbetalingsfil...`,
                ToastType.good, 5
            );

            // Refresh list after paymentbatch has been generated
            this.tickerContainer.mainTicker.reloadData();

            // Run action to generate paymentfile based on batch
            this.paymentBatchService.generatePaymentFile(paymentBatch.ID)
            .subscribe((updatedPaymentBatch: PaymentBatch) => {
                if (updatedPaymentBatch.PaymentFileID) {
                    this.toastService.addToast(
                        'Utbetalingsfil laget, henter fil...',
                        ToastType.good, 5
                    );
                    this.updateSaveActions(this.selectedTicker.Code);

                    this.fileService
                        .downloadFile(updatedPaymentBatch.PaymentFileID, 'application/xml')
                        .subscribe((blob) => {
                            doneHandler('Utbetalingsfil hentet');

                            // Download file so the user can open it
                            saveAs(blob, `payments_${updatedPaymentBatch.ID}.xml`);
                            this.tickerContainer.getFilterCounts();
                            this.tickerContainer.mainTicker.reloadData();
                        },
                        err => {
                            doneHandler('Feil ved henting av utbetalingsfil');
                            this.errorService.handle(err);
                        });
                } else {
                    this.toastService.addToast(
                        'Fant ikke utbetalingsfil, ingen PaymentFileID definert',
                        ToastType.bad
                    );
                    this.updateSaveActions(this.selectedTicker.Code);
                    doneHandler('Feil ved henting av utbetalingsfil');
                }
            },
            err => {
                doneHandler('Feil ved generering av utbetalingsfil');
                this.errorService.handle(err);
            });
        },
        err => {
            doneHandler('Feil ved opprettelse av betalingsbunt');
            this.errorService.handle(err);
        });

        // User clicked for autobank payment (Should only be clickable if agreements.length > 0)
        } else if (this.agreements.length) {
            this.modalService.open(UniSendPaymentModal, {
                data: { PaymentIds: paymentIDs, hasTwoStage: this.companySettings.TwoStageAutobankEnabled }
            }).onClose.subscribe(
                res => {
                doneHandler(res);
                if (res === 'Sendingen er fullført') {
                    this.tickerContainer.getFilterCounts();
                    this.tickerContainer.mainTicker.reloadData();
                }
            },
            err => doneHandler('Feil ved sending av autobank'));
        }
    }

    private validateBeforePay(selectedRows: Array<any>): boolean {
        const errorMessages: string[] = [];
        const paymentsWithoutFromAccount = selectedRows.filter(x => !x.FromBankAccountAccountNumber);
        if (paymentsWithoutFromAccount.length > 0) {
            errorMessages.push(`Det er ${paymentsWithoutFromAccount.length} rader som mangler fra-konto`);
        }

        const paymentsWithoutToAccount = selectedRows.filter(x => !x.ToBankAccountAccountNumber);
        if (paymentsWithoutToAccount.length > 0) {
            errorMessages.push(`Det er ${paymentsWithoutToAccount.length} rader som mangler til-konto`);
        }

        const paymentsWithoutPaymentCode = selectedRows.filter(x => !x.PaymentCodeCode);
        if (paymentsWithoutPaymentCode.length > 0) {
            errorMessages.push(`Det er ${paymentsWithoutPaymentCode.length} rader som mangler type`);
        }

        if (errorMessages.length > 0) {
            this.toastService.addToast('Feil ved validering', ToastType.bad, 0, errorMessages.join('\n\n'));
            return false;
        }

        return true;
    }

    private deleteSelected(doneHandler: (status: string) => any) {
        this.rows = this.tickerContainer.mainTicker.table.getSelectedRows();
        if (this.rows.length === 0) {
            this.toastService.addToast(
                'Ingen rader',
                ToastType.warn,
                5,
                'Ingen rader er valgt - kan ikke slette noe'
            );
            doneHandler('Sletting avbrutt');
            return;
        }

        const modal = this.modalService.open(UniConfirmModalV2, {
            header: 'Bekreft sletting',
            message: `Er du sikker på at du vil slette ${this.rows.length} betalinger?`,
            buttonLabels: {accept: 'Slett og krediter faktura', reject: 'Slett betaling', cancel: 'Avbryt'}
        });

        modal.onClose.subscribe(result => {
            if (result === ConfirmActions.CANCEL) {
                doneHandler('Sletting avbrutt');
                return;
            }

            const requests = [];
            this.rows.forEach(x => {
                requests.push(
                    result === ConfirmActions.ACCEPT
                    ? this.paymentService.Action(x.ID, 'delete-and-credit', null, RequestMethod.Delete)
                    : this.paymentService.Remove(x.ID, x),
                    );
            });

            Observable.forkJoin(requests).subscribe(response => {
                this.toastService.addToast('Betalinger slettet', ToastType.good, 5);
                doneHandler('Betalinger slettet');

                // Refresh data after save
                this.tickerContainer.mainTicker.reloadData();
            }, (err) => {
                doneHandler('Feil ved sletting av data');
                this.errorService.handle(err);
            });
        });
    }

}
