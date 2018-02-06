import {Component, ChangeDetectorRef, ChangeDetectionStrategy, ViewChild, AfterContentInit} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {IToolbarConfig} from '../common/toolbar/toolbar';
import {IUniSaveAction} from '../../../framework/save/save';
import {Router, ActivatedRoute} from '@angular/router';
import {
    Ticker,
    TickerGroup,
    ITickerActionOverride,
    TickerAction,
    ITickerColumnOverride
} from '../../services/common/uniTickerService';
import {TabService, UniModules} from '../layout/navbar/tabstrip/tabService';
import {UniTickerContainer} from '../uniticker/tickerContainer/tickerContainer';
import {
    UniModalService,
    UniSendPaymentModal,
    UniConfirmModalV2,
    ConfirmActions,
    UniAutobankAgreementModal
} from '../../../framework/uniModal/barrel';
import {File, Payment, PaymentBatch, LocalDate} from '../../unientities';
import {saveAs} from 'file-saver';
import {UniPaymentEditModal} from './modals/paymentEditModal';
import {
    ErrorService,
    StatisticsService,
    PaymentBatchService,
    FileService,
    UniTickerService,
    PaymentService
} from '../../services/services';
import {ToastService, ToastType} from '../../../framework/uniToast/toastService';
import * as moment from 'moment';
import { AfterViewInit } from '@angular/core/src/metadata/lifecycle_hooks';

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
                            (click)="selectTicker(ticker.Code)"
                            [attr.aria-selected]="ticker.Code === selectedTicker?.Code">
                            {{ticker.Name}}
                        </li>
                    </ul>
                </li>
            </ul>
            <section style="position: absolute; bottom: 20px; width: 14rem; text-align: center; display: none;">
                <button class="good" (click)="openAutobankAgreementModal()" style="margin-top: 20px;"> Ny autobankavtale </button>
            </section>

            <uni-ticker-container
                [ticker]="selectedTicker"
                [actionOverrides]="actionOverrides"
                (urlParamsChange)="onTickerParamsChange($event)"
                (rowSelectionChanged)="onRowSelectionChanged($event)">
            </uni-ticker-container>
        </section>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BankComponent implements AfterViewInit {

    @ViewChild(UniTickerContainer) public tickerContainer: UniTickerContainer;

    private tickers: Ticker[];
    private tickerGroups: TickerGroup[];
    private selectedTicker: Ticker;
    private actions: IUniSaveAction[];
    private rows: Array<any> = [];
    private canEdit: boolean = true;
    private agreements: any[];

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
            ExecuteActionHandler: (selectedRows) => this.downloadPaymentFiles(selectedRows)
        }
    ];

    constructor(
        private uniTickerService: UniTickerService,
        private router: Router,
        private route: ActivatedRoute,
        private cdr: ChangeDetectorRef,
        private tabService: TabService,
        private modalService: UniModalService,
        private statisticsService: StatisticsService,
        private paymentBatchService: PaymentBatchService,
        private errorService: ErrorService,
        private toastService: ToastService,
        private fileService: FileService,
        private paymentService: PaymentService
    ) {
        this.tabService.addTab({
            name: 'Bank',
            url: '/bank',
            moduleID: UniModules.Bank,
            active: true
        });
    }

    public ngAfterViewInit() {
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
            this.selectTicker(this.tickerGroups[0].Tickers[0].Code);
        });
    }

    private navigateToTicker(ticker: Ticker) {
        this.router.navigateByUrl('/bank/' + ticker.Code);
    }

    private selectTicker(selectedTickerCode: string) {
        this.selectedTicker = this.tickers.find(x => x.Code === selectedTickerCode);

        // Update toolbar when changing ticker
        this.updateSaveActions(selectedTickerCode);
        this.toolbarconfig.title = this.selectedTicker.Name;

        this.cdr.markForCheck();
    }

    public onTickerParamsChange(event) {
        this.canEdit = !event.params.filter || event.params.filter === 'not_payed';
        this.rows = [];
        if (this.selectedTicker) {
            this.updateSaveActions(this.selectedTicker.Code);
        }
    }

    public onRowSelectionChanged(row) {
        this.rows = this.tickerContainer.mainTicker.unitable.getSelectedRows();
        this.updateSaveActions(this.selectedTicker.Code);
    }

    public updateSaveActions(selectedTickerCode: string) {
        this.actions = [];

        if (selectedTickerCode === 'payment_list') {

            this.actions.push({
                label: 'Rediger',
                action: (done) => {
                    this.openEditModal().subscribe((res: boolean) => {
                        done(res ? 'Endringer lagret.' : 'Ingenting endret.');
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
                main: this.rows.length > 0,
                disabled: this.rows.length === 0
            });

            this.actions.push({
                label: 'Send til betaling',
                action: (done) => this.pay(done, false),
                main: this.rows.length > 0,
                disabled: this.rows.length === 0 || !this.agreements.length
            });

            this.actions.push({
                label: 'Slett valgte',
                action: (done) => this.deleteSelected(done),
                main: false,
                disabled: this.rows.length === 0
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

    public fileUploaded(file: File) {
        this.toastService.addToast('Laster opp innbetalingsfil..', ToastType.good, 10,
            'Dette kan ta litt tid, vennligst vent...');

        this.paymentBatchService.registerAndCompleteCustomerPayment(file.ID)
            .subscribe(res => {
                this.toastService.addToast('Innbetaling fullført', ToastType.good, 5);
                this.tickerContainer.tickerFilters.getFilterCounts();
                this.tickerContainer.mainTicker.reloadData();
            },
            err => this.errorService.handle(err)
        );
    }

    public recieptUploaded(file: File) {
        this.toastService.addToast('Laster opp kvitteringsfil..', ToastType.good, 10,
        'Dette kan ta litt tid, vennligst vent...');

        this.paymentBatchService.registerReceiptFileCamt054(file)
            .subscribe(paymentBatch => {
                this.toastService.addToast('Kvitteringsfil tolket og behandlet', ToastType.good, 10,
                    'Betalinger og bilag er oppdatert');

                this.tickerContainer.tickerFilters.getFilterCounts();
                this.tickerContainer.mainTicker.reloadData();
            },
            err => this.errorService.handle(err)
            );
    }

    private openSendToPaymentModal(row): Promise<any> {
        return new Promise((resolve, reject) => {
            this.modalService.open(UniSendPaymentModal, {
                data: {
                    PaymentBatchID: row[0].ID
                }
            });
        });
    }

    private openEditModal() {
        return this.modalService.open(UniPaymentEditModal).onClose;
    }

    public openAutobankAgreementModal() {
        this.modalService.open(UniAutobankAgreementModal);
    }

    private pay(doneHandler: (status: string) => any, isManualPayment: boolean) {
        this.rows = this.tickerContainer.mainTicker.unitable.getSelectedRows();
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
                        this.tickerContainer.mainTicker.unitable.updateRow(row._originalIndex, row);
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
                if (response === ConfirmActions.REJECT) {
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

        // Create action to generate batch for n paymetns
        this.paymentService.createPaymentBatch(paymentIDs)
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

                        // User clicked for manual payment, should download the file
                        if (isManualPayment) {
                            this.fileService
                            .downloadFile(updatedPaymentBatch.PaymentFileID, 'application/xml')
                            .subscribe((blob) => {
                                doneHandler('Utbetalingsfil hentet');

                                // Download file so the user can open it
                                saveAs(blob, `payments_${updatedPaymentBatch.ID}.xml`);
                                this.tickerContainer.tickerFilters.getFilterCounts();
                                this.tickerContainer.mainTicker.reloadData();
                            },
                            err => {
                                doneHandler('Feil ved henting av utbetalingsfil');
                                this.errorService.handle(err);
                            });
                        // User clicked for autobank payment (Should only be clickable if agreements.length > 0)
                        } else if (this.agreements.length) {
                            this.modalService.open(UniSendPaymentModal, {
                                data: { PaymentBatchID: updatedPaymentBatch.ID }
                            }).onClose.subscribe(
                                res => {
                                doneHandler(res);
                                this.tickerContainer.tickerFilters.getFilterCounts();
                                this.tickerContainer.mainTicker.reloadData();
                            },
                            err => doneHandler('Feil ved sending av autobank'));
                        }
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
        this.rows = this.tickerContainer.mainTicker.unitable.getSelectedRows();
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
            buttonLabels: {accept: 'Slett', cancel: 'Avbryt'}
        });

        modal.onClose.subscribe(result => {
            if (result === ConfirmActions.CANCEL) {
                doneHandler('Sletting avbrutt');
                return;
            }

            const requests = [];
            this.rows.forEach(x => {
                requests.push(this.paymentService.Remove(x.ID, x));
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
