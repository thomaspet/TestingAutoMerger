import {Component, ViewChild, ChangeDetectorRef} from '@angular/core';
import {SupplierInvoiceStore} from './supplier-invoice-store';
import {SupplierInvoice, StatusCodeSupplierInvoice} from '@uni-entities';
import {ActivatedRoute, Router} from '@angular/router';
import {Subject, of, Observable} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {DetailsForm} from './components/details-form/details-form';
import {IUniSaveAction} from '@uni-framework/save/save';
import {SupplierInvoiceService, ErrorService, PaymentService} from '@app/services/services';
import { IStatus, STATUSTRACK_STATES } from '@app/components/common/toolbar/statustrack';
import { IToolbarSubhead, IToolbarConfig, ICommentsConfig } from '@app/components/common/toolbar/toolbar';
import {BillInitModal} from '../bill/bill-init-modal/bill-init-modal';
import * as moment from 'moment';
import { UniModalService, ConfirmActions } from '@uni-framework/uni-modal';

declare const ResizeObserver;

@Component({
    templateUrl: './supplier-invoice.html',
    styleUrls: ['./supplier-invoice.sass']
})
export class SupplierInvoiceView {
    @ViewChild(DetailsForm) detailsForm: DetailsForm;

    onDestroy$ = new Subject();

    resizeObserver;
    attachmentSectionHeight: string;
    hasChanges: boolean = false;

    toolbarconfig: IToolbarConfig = {};
    saveActions: IUniSaveAction[] = [];
    toolbarStatus: IStatus[];
    subHeads: IToolbarSubhead[] = [];
    commentsConfig: ICommentsConfig;
    paymentStatusIndicator;

    constructor(
        public store: SupplierInvoiceStore,
        private router: Router,
        private activeRoute: ActivatedRoute,
        private cdr: ChangeDetectorRef,
        private errorService: ErrorService,
        private supplierInvoiceService: SupplierInvoiceService,
        private modalService: UniModalService,
        private paymentService: PaymentService
    ) {
        this.store.changes$.subscribe((change) => this.updateSaveActions(change));
        this.store.invoice$.subscribe((invoice) => this.updateToolbar(invoice || {} ));

        this.activeRoute.paramMap.pipe(
            takeUntil(this.onDestroy$)
        ).subscribe(params => {
            this.store.fileIDs$.next([]);
            const invoiceID = +params.get('id');
            this.store.init(invoiceID);
            this.hasChanges = false;
            this.paymentStatusIndicator = null;

            if (!invoiceID) {
                const fileID = +this.activeRoute.snapshot.queryParamMap.get('fileid');
                if (fileID) {
                    this.store.startupFileID$.next(fileID);
                } else {
                    this.modalService.open(BillInitModal).onClose.subscribe((fileIDFromModal) => {
                        this.store.startupFileID$.next(fileIDFromModal);
                    });
                }
            }
        });
    }

    ngAfterViewInit() {
        const detailsFormElement = this.detailsForm?.elementRef?.nativeElement;
        if (detailsFormElement) {
            this.syncFormAndAttachmentsHeight();

            this.resizeObserver = new ResizeObserver(() => {
                this.syncFormAndAttachmentsHeight();
            });
            this.resizeObserver.observe(detailsFormElement);
        }
    }

    ngOnDestroy() {
        this.resizeObserver.disconnect();
        this.onDestroy$.next();
        this.onDestroy$.complete();
    }

    private syncFormAndAttachmentsHeight() {
        const detailsFormElement = this.detailsForm?.elementRef?.nativeElement;
        this.attachmentSectionHeight = detailsFormElement && (detailsFormElement.clientHeight + 'px');
        this.cdr.detectChanges();
    }

    // SAVEACTIONS

    updateSaveActions(changes: boolean) {
        const invoice = this.store.invoice$.value;

        this.saveActions = [
            {
                label: 'Lagre',
                action: (done) => {
                    const redirectAfterSave = !this.store.invoice$.value?.ID;
                    this.store.saveChanges().subscribe(
                        savedInvoice => {
                            this.store.changes$.next(false);
                            done('Lagring fullført');
                            if (redirectAfterSave) {
                                this.router.navigateByUrl('/accounting/bills/' + savedInvoice.ID);
                            } else {
                                this.store.loadInvoice(savedInvoice.ID);
                            }
                        },
                        err => {
                            this.errorService.handle(err),
                            done('Lagring feilet');
                        }
                    );
                },
                main: changes,
                disabled: !changes
            },
            {
                label: 'Tøm feltene',
                action: (done) => {
                    done();
                    this.store.loadInvoice(0);
                },
                disabled: !!invoice?.ID
            },
            {
                label: 'Bokfør og betal',
                action: (done) => {
                    this.store.sendToPayment(false, done);
                },
                main: invoice?.ID && invoice?.StatusCode === StatusCodeSupplierInvoice.Draft,
                disabled: !invoice?.ID || invoice?.StatusCode !== StatusCodeSupplierInvoice.Draft || changes
            },
            {
                label: 'Bokfør',
                action: (done) => { this.store.journal(done); },
                main: invoice?.ID && invoice?.StatusCode === StatusCodeSupplierInvoice.Draft,
                disabled: !invoice?.ID || invoice?.StatusCode !== StatusCodeSupplierInvoice.Draft || changes
            },
            {
                label: 'Send til betaling',
                action: (done) => {
                    this.store.sendToPayment(true, done);
                },
                main: invoice?.ID && (invoice?.StatusCode === StatusCodeSupplierInvoice.Journaled && invoice.PaymentStatus <= 30109 ),
                disabled: !invoice?.ID || invoice?.StatusCode !== StatusCodeSupplierInvoice.Journaled || changes
                    || invoice.PaymentStatus === 30110 || invoice.PaymentStatus === 30112
            },
            {
                label: 'Slett',
                action: (done) => {
                    this.supplierInvoiceService.Remove(invoice.ID).subscribe(
                        () => {
                            done();
                            this.router.navigateByUrl('/accounting/bills/0');
                        },
                        err => {
                            done();
                            this.errorService.handle(err);
                        }
                    );
                },
                main: false,
                disabled: !invoice?.ID || invoice?.StatusCode === StatusCodeSupplierInvoice.Journaled
            }
        ];
    }

    updateToolbar(invoice) {

        const status: IStatus = {
            title: this.supplierInvoiceService.getStatusText(invoice.StatusCode),
            state: STATUSTRACK_STATES.Active
        };

        this.toolbarStatus = invoice.ID ? [status] : undefined;

        this.toolbarconfig = {
            title: 'Regninger',
            subheads: [],
            entityID: invoice.ID,
            entityType: SupplierInvoice.EntityType,
            showSharingStatus: true,
            hideDisabledActions: true,
            buttons: [],
            contextmenu: [
                {
                    label: 'Kjør OCR-tolk',
                    action: () => { this.store.runOcr(); }
                },
                {
                    label: 'Kjør smart bokføring',
                    action: () => { this.store.runSmartBooking(); }
                }
            ]
        };

        this.commentsConfig = {
            entityID: invoice.ID || 0,
            entityType: SupplierInvoice.EntityType
        };

        if (invoice.JournalEntry && invoice.JournalEntry.JournalEntryNumber) {
            const numberAndYear = invoice.JournalEntry.JournalEntryNumber.split('-');
            let url: string = `/#/accounting/transquery?JournalEntryNumber=${numberAndYear[0]}&AccountYear=`;
            if (numberAndYear.length > 1) {
                url += numberAndYear[1];
            } else {
                url += invoice.InvoiceDate ? moment(invoice.InvoiceDate).year() : moment().year();
            }

           this.toolbarconfig.subheads = [{
                title: `Bilagsnr. ${invoice.JournalEntry.JournalEntryNumber}`,
                link: url
            }];
        }

        if (invoice.ID) {
            this.toolbarconfig.buttons.push({
                label: 'Opprett ny',
                action: () => this.router.navigateByUrl('/accounting/bills/0')
            });
        }

        if (invoice?.PaymentStatus) {

            const statusLabel = this.supplierInvoiceService.getPaymentStatusText(invoice.PaymentStatus);

            const statusClass = 'info';
            let payments;

            if (this.store.invoicePayments) {
                this.store.invoicePayments.sort((payment1, payment2) =>
                    new Date(<any> payment1.PaymentDate).getTime() - new Date(<any> payment2.PaymentDate).getTime()
                );

                const buildLink = (payment) => {
                    if (!payment.JournalEntryNumber) {
                        return '';
                    }
                    const [journalEntryNumber, year] = payment.JournalEntryNumber.split('-');
                    return `#/accounting/transquery?JournalEntryNumber=${journalEntryNumber}&AccountYear=${year}`;
                };

                payments = this.store.invoicePayments.map(payment => {
                    return {
                        label: payment.AmountCurrency.toFixed(2) + ' ' + payment.CurrencyCode,
                        status: (payment.StatusCode === 31002 || payment.StatusCode === 31003)
                            ? this.paymentService.getStatusText(44006) : this.paymentService.getStatusText(payment.StatusCode),
                        timestamp: new Date(<any> payment.PaymentDate),
                        link: buildLink(payment)
                    };
                });
            }

            this.paymentStatusIndicator = {
                label: statusLabel,
                class: statusClass,
                subStatuses: payments,
            };

        }
    }

    canDeactivate(): boolean | Observable<boolean> {
        if (!this.store.changes$.value) {
            return of(true);
        }

        const modalOptions = {
            header: 'Ulagrede endringer',
            message: 'Du har endringer som ikke er lagret. Ønsker du å lagre disse før du fortsetter?',
            buttonLabels: {
                accept: 'Lagre',
                reject: 'Forkast',
                cancel: 'Avbryt'
            }
        };

        return this.modalService.confirm(modalOptions).onClose.switchMap(confirm => {
            if (confirm === ConfirmActions.ACCEPT) {
                return this.store.saveChanges().toPromise().then(res => true).catch(res => false);
            }
            return Observable.of(confirm !== ConfirmActions.CANCEL);
        });
    }

}
