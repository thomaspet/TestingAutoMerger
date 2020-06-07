import {Component, ViewChild, ChangeDetectorRef} from '@angular/core';
import {SupplierInvoiceStore} from './supplier-invoice-store';
import {SupplierInvoice, StatusCodeSupplierInvoice} from '@uni-entities';
import {ActivatedRoute, Router} from '@angular/router';
import {Subject, of} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {DetailsForm} from './components/details-form/details-form';
import {IUniSaveAction} from '@uni-framework/save/save';
import {SupplierInvoiceService, ErrorService, PaymentService} from '@app/services/services';
import { IStatus, STATUSTRACK_STATES } from '@app/components/common/toolbar/statustrack';
import { IToolbarSubhead, IToolbarConfig, ICommentsConfig } from '@app/components/common/toolbar/toolbar';
import {BillInitModal} from '../bill/bill-init-modal/bill-init-modal';
import * as moment from 'moment';
import { UniModalService } from '@uni-framework/uni-modal';

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
        private router: Router,
        private store: SupplierInvoiceStore,
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
                main: changes
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
                label: 'Kjør OCR-tolk',
                action: (done) => {
                    done();
                    this.store.runOcr();
                },
                disabled: invoice?.StatusCode === StatusCodeSupplierInvoice.Journaled
            },
            {
                label: 'Kjør smart bokføring',
                action: (done) => {
                    done();
                    this.store.runSmartBooking();
                },
                disabled: invoice?.StatusCode === StatusCodeSupplierInvoice.Journaled
            },
            {
                label: 'Bokfør',
                action: (done) => { this.store.journal(done); },
                main: invoice?.ID && invoice?.StatusCode === StatusCodeSupplierInvoice.Draft,
                disabled: !invoice?.ID || invoice?.StatusCode !== StatusCodeSupplierInvoice.Draft || changes
            },
            {
                label: 'Bokfør og betal',
                action: (done) => {
                    this.store.journalAndSendToPayment(done);
                },
                main: invoice?.ID && invoice?.StatusCode === StatusCodeSupplierInvoice.Draft,
                disabled: !invoice?.ID || invoice?.StatusCode !== StatusCodeSupplierInvoice.Draft || changes
            },
            {
                label: 'Send til betaling',
                action: (done) => {
                    this.store.sendToPayment(done);
                },
                main: invoice?.ID && (invoice?.StatusCode === StatusCodeSupplierInvoice.Journaled && invoice.PaymentStatus <= 30109 ),
                disabled: !invoice?.ID || invoice?.StatusCode !== StatusCodeSupplierInvoice.Journaled || changes
            },
            {
                label: 'Arkiver',
                action: (done) => {
                    this.store.finish(done);
                },
                main: false,
                disabled: !invoice?.ID || changes
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
            buttons: []
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

    public canDeactivate() {
        if (!this.store.changes$.value) {
            return of(true);
        } else {
            return this.store.saveChanges().switchMap(res => of(true)).catch(res => of(false));
        }
    }

}
