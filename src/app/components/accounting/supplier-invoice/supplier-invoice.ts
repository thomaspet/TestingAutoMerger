import {Component, ViewChild, ChangeDetectorRef} from '@angular/core';
import {SupplierInvoiceStore} from './supplier-invoice-store';
import {SupplierInvoice, StatusCodeSupplierInvoice, UserDto} from '@uni-entities';
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
import { UniModalService, ConfirmActions, IModalOptions} from '@uni-framework/uni-modal';
import {BankIDPaymentModal} from '@app/components/common/modals/bankid-payment-modal/bankid-payment-modal';
import {FeaturePermissionService} from '@app/featurePermissionService';
import { AuthService } from '@app/authService';
import { theme, THEMES } from 'src/themes/theme';

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
    private user: UserDto;

    constructor(
        public store: SupplierInvoiceStore,
        private router: Router,
        private activeRoute: ActivatedRoute,
        private cdr: ChangeDetectorRef,
        private errorService: ErrorService,
        private supplierInvoiceService: SupplierInvoiceService,
        private modalService: UniModalService,
        private paymentService: PaymentService,
        private featurePermissionService: FeaturePermissionService,
        private authService: AuthService
    ) {
        this.store.changes$.subscribe((change) => this.updateSaveActions(change));
        this.store.invoice$.subscribe((invoice) => this.updateToolbar(invoice || {} ));

        this.authService.authentication$.take(1).subscribe(auth => {
            this.user = auth.user;
        });

        this.activeRoute.paramMap.pipe(
            takeUntil(this.onDestroy$)
        ).subscribe(params => {
            this.store.fileIDs$.next([]);
            const invoiceID = +params.get('id');

            this.store.init(invoiceID, 0);
            this.hasChanges = false;
            this.paymentStatusIndicator = null;

            const batchID = this.activeRoute.snapshot.queryParamMap.get('batchID');
            const hashValue = this.activeRoute.snapshot.queryParamMap.get('hashValue');

            if (batchID && hashValue) {
                const options: IModalOptions = {
                    data: {
                        batchID: batchID,
                        hashValue: hashValue
                    },
                    closeOnClickOutside: false
                };

                this.modalService.open(BankIDPaymentModal, options).onClose.subscribe((response) => {
                    if (response) {
                        this.store.changes$.next(true);
                        this.store.loadInvoice(invoiceID);
                    } else {
                        this.store.toastService.addToast('Betalingsbunt allerede sendt til betaling', 3, 5);
                    }
                    this.router.navigate(['.'], { relativeTo: this.activeRoute, queryParams: {} });
                });
            }

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
        this.store.selectedFile = null;
        this.store.invoiceID = 0;
        this.store.invoice$.next(<SupplierInvoice>{});
        this.store.startupFileID$.next(null);
        this.store.initDataLoaded$.next(false);
    }

    private syncFormAndAttachmentsHeight() {
        const detailsFormElement = this.detailsForm?.elementRef?.nativeElement;
        this.attachmentSectionHeight = detailsFormElement && (detailsFormElement.clientHeight + 'px');
        this.cdr.detectChanges();
    }

    // SAVEACTIONS

    updateSaveActions(changes: boolean) {
        const invoice = this.store.invoice$.value;
        const hasAutobank = this.store.companySettings?.HasAutobank;

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
                                this.router.navigateByUrl(this.store.url + savedInvoice.ID);
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
                label: 'Tildel',
                action: (done) => {
                    this.store.assignInvoice(false, done);
                },
                disabled: !this.featurePermissionService.canShowUiFeature('ui.assigning')
                || invoice?.StatusCode !== StatusCodeSupplierInvoice.Draft
            },
            {
                label: 'Tildel på nytt',
                action: (done) => {
                    this.store.assignInvoice(true, done);
                },
                disabled: !this.featurePermissionService.canShowUiFeature('ui.assigning')
                || invoice?.StatusCode !== StatusCodeSupplierInvoice.ForApproval
            },

            {
                label: 'Godkjenn',
                action: (done) => {
                    this.store.approveOrRejectInvoice('approve', done);
                },
                main: invoice?.StatusCode === StatusCodeSupplierInvoice.ForApproval,
                disabled: invoice?.StatusCode !== StatusCodeSupplierInvoice.ForApproval
            },
            {
                label: 'Avvis',
                action: (done) => {
                    this.store.approveOrRejectInvoice('reject', done);
                },
                disabled: !this.featurePermissionService.canShowUiFeature('ui.assigning')
                || invoice?.StatusCode !== StatusCodeSupplierInvoice.ForApproval
            },

            {
                label: 'Bokfør og betal',
                action: (done) => {
                    this.store.sendToPayment(false, done);
                },
                main: invoice?.ID && (invoice?.StatusCode === StatusCodeSupplierInvoice.Draft
                    || invoice?.StatusCode === StatusCodeSupplierInvoice.Approved) && hasAutobank && invoice.PaymentStatus !== 30112,
                disabled: !invoice?.ID || (invoice?.StatusCode !== StatusCodeSupplierInvoice.Draft
                    && invoice?.StatusCode !== StatusCodeSupplierInvoice.Approved) || changes
                    || !hasAutobank || invoice.PaymentStatus === 30112
            },
            {
                label: 'Bokfør og merk som betalt',
                action: (done) => {
                    this.store.registerPayment(done, true);
                },
                main: invoice?.ID && (invoice?.StatusCode === StatusCodeSupplierInvoice.Draft
                    || invoice?.StatusCode === StatusCodeSupplierInvoice.Approved) && !hasAutobank && invoice.PaymentStatus !== 30112,
                disabled: !invoice?.ID || (invoice?.StatusCode !== StatusCodeSupplierInvoice.Draft
                    && invoice?.StatusCode !== StatusCodeSupplierInvoice.Approved) || changes || invoice.PaymentStatus === 30112
            },
            {
                label: 'Bokfør',
                action: (done) => { this.store.journal(done); },
                main: invoice?.ID && (invoice?.StatusCode === StatusCodeSupplierInvoice.Draft
                    || invoice?.StatusCode === StatusCodeSupplierInvoice.Approved) && invoice.PaymentStatus === 30112,
                disabled: !invoice?.ID || (invoice?.StatusCode !== StatusCodeSupplierInvoice.Draft
                    && invoice?.StatusCode !== StatusCodeSupplierInvoice.Approved) || changes
            },
            {
                label: 'Send til betaling',
                action: (done) => {
                    this.store.sendToPayment(true, done);
                },
                main: invoice?.ID && (invoice?.StatusCode === StatusCodeSupplierInvoice.Journaled
                    && invoice.PaymentStatus <= 30109 ) && hasAutobank,
                disabled: !invoice?.ID || invoice?.StatusCode !== StatusCodeSupplierInvoice.Journaled || changes
                    || invoice.PaymentStatus === 30110 || invoice.PaymentStatus === 30111
                    || invoice.PaymentStatus === 30112 || invoice.PaymentStatus === 30113
                    || !hasAutobank || (theme.theme !== THEMES.EXT02 && !this.user.BankIntegrationUserName)
            },
            {
                label: 'Merk som betalt',
                action: (done) => {
                    this.store.registerPayment(done);
                },
                main: invoice?.ID && (invoice?.StatusCode === StatusCodeSupplierInvoice.Journaled
                    && invoice.PaymentStatus <= 30109 ) && !hasAutobank,
                disabled: !invoice?.ID || invoice?.StatusCode !== StatusCodeSupplierInvoice.Journaled || changes
                    || invoice.PaymentStatus === 30110 || invoice.PaymentStatus === 30111
                    || invoice.PaymentStatus === 30112 || invoice.PaymentStatus === 30113
            },
            {
                label: 'Slett',
                action: (done) => {
                    this.supplierInvoiceService.Remove(invoice.ID).subscribe(
                        () => {
                            done();
                            this.router.navigateByUrl('/accounting/inbox');
                        },
                        err => {
                            done();
                            this.errorService.handle(err);
                        }
                    );
                },
                main: false,
                disabled: !invoice?.ID || invoice?.StatusCode === StatusCodeSupplierInvoice.Journaled || invoice.PaymentStatus === 30112
            },
            {
                label: 'Krediter',
                action: (done) => {
                    this.store.creditSupplierInvoice().subscribe(res => {
                        done();
                        this.store.loadInvoice(invoice.ID);
                    }, err => this.errorService.handle(err))
                },
                main: true,
                disabled: !invoice?.ID || invoice?.StatusCode !== StatusCodeSupplierInvoice.Journaled
            },
            {
                label: 'Gjenopprett',
                action: (done) => {
                    this.store.restoreSupplierInvoice(invoice.ID).subscribe(res => {
                        done();
                        this.store.loadInvoice(invoice.ID);
                    }, err => this.errorService.handle(err))
                },
                main: false,
                disabled: !invoice?.ID || invoice?.StatusCode !== StatusCodeSupplierInvoice.Rejected
            },
        ];
    }

    updateToolbar(invoice) {

        const status: IStatus = {
            title: this.supplierInvoiceService.getStatusText(invoice.StatusCode),
            state: STATUSTRACK_STATES.Active
        };

        this.toolbarStatus = invoice.ID ? [status] : undefined;

        this.toolbarconfig = {
            title:  invoice.ID ? 'Regninger' : 'Ny utgift',
            subheads: [],
            entityID: invoice.ID,
            entityType: SupplierInvoice.EntityType,
            showSharingStatus: true,
            hideDisabledActions: true,
            buttons: [],
        };

        if (!invoice.StatusCode || invoice?.StatusCode < StatusCodeSupplierInvoice.Journaled) {
            this.toolbarconfig.contextmenu = [
                {
                    label: 'Kjør fakturatolkning',
                    action: () => { this.store.runOcr(true); }
                },
                {
                    label: 'Kjør smart bokføring',
                    action: () => { this.store.runSmartBooking(); }
                }
            ];
        }

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
                action: () => this.router.navigateByUrl('/accounting/inbox')
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
