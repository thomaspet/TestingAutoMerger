import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {
    SupplierInvoice,
    JournalEntry,
    JournalEntryLineDraft,
    Dimensions,
    Supplier,
    CompanySettings,
    VatType,
    LocalDate,
    StatusCodeSupplierInvoice,
    Payment,
    File,
} from '@uni-entities';
import {
    SupplierInvoiceService,
    UniSearchDimensionConfig,
    ProjectService,
    DepartmentService,
    CustomDimensionService,
    JournalEntryService,
    FileService,
    VatTypeService,
    CompanySettingsService,
    ErrorService,
    BankService
} from '@app/services/services';
import {BehaviorSubject, of, forkJoin, Observable, throwError} from 'rxjs';
import {switchMap, catchError, map, tap} from 'rxjs/operators';
import {SmartBookingHelperClass, ISmartBookingResult} from './smart-booking-helper';
import {OCRHelperClass} from './ocr-helper';
import {JournalAndPaymentHelper, ActionOnReload} from './journal-and-pay-helper';
import {ToPaymentModal} from './modals/to-payment-modal/to-payment-modal';
import {set} from 'lodash';

import * as moment from 'moment';
import {ToastService, ToastType} from '@uni-framework/uniToast/toastService';
import * as _ from 'lodash';
import { IModalOptions, UniModalService, ConfirmActions, InvoiceApprovalModal } from '@uni-framework/uni-modal';
import { BillAssignmentModal } from '../bill/assignment-modal/assignment-modal';

@Injectable()
export class SupplierInvoiceStore {

    startupFileID$ = new BehaviorSubject<number>(null);
    fileIDs$ = new BehaviorSubject<number[]>([]);
    selectedFile: File;
    hasChanges = false;

    invoice$ = new BehaviorSubject<SupplierInvoice>(new SupplierInvoice());
    changes$ = new BehaviorSubject<any>([]);
    readonly$ = new BehaviorSubject<boolean>(false);
    journalEntryLines$ = new BehaviorSubject<JournalEntryLineDraft[]>([]);
    smartBookingResult: ISmartBookingResult = {};
    invoicePayments: Array<Payment> = [];
    initDataLoaded$: BehaviorSubject<boolean> = new BehaviorSubject(false);

    vatTypes = [];
    currencyCodes = [];
    companySettings: CompanySettings;

    constructor(
        private router: Router,
        private ocrHelper: OCRHelperClass,
        private journalAndPaymentHelper: JournalAndPaymentHelper,
        private supplierInvoiceService: SupplierInvoiceService,
        private fileService: FileService,
        private journalEntryService: JournalEntryService,
        private uniSearchDimensionConfig: UniSearchDimensionConfig,
        private projectService: ProjectService,
        private departmentService: DepartmentService,
        private customDimensionService: CustomDimensionService,
        private smartBookingHelper: SmartBookingHelperClass,
        private vatTypeService: VatTypeService,
        private companySettingsService: CompanySettingsService,
        private errorService: ErrorService,
        private toastService: ToastService,
        private modalService: UniModalService,
        private bankService: BankService
    ) {}

    init(invoiceID: number) {
        Observable.forkJoin(
            this.companySettingsService.Get(1, []),
            this.vatTypeService.GetAll()
        ).subscribe(([companySettings, types]) => {
            this.companySettings = companySettings;
            this.vatTypes = types;
            this.loadInvoice(invoiceID);
        });
    }

    loadInvoice(id?) {
        const expands =  [
            'Supplier.Info.BankAccounts',
            'BankAccount',
            'JournalEntry',
            'DefaultDimensions.Info'
        ];

        const invoice$ = id > 0
            ? this.supplierInvoiceService.Get(id, expands, true)
            : of(<SupplierInvoice> {});

        invoice$.pipe(
            switchMap(invoice => {
                const obs = [this.bankService.getBankPayments(id), this.bankService.getRegisteredPayments(id)];

                if (invoice.JournalEntryID) {
                    obs.push(this.journalEntryService.Get(invoice.JournalEntryID, [
                        'DraftLines.Account',
                    ]));
                }

                return Observable.forkJoin(obs).pipe(map(res => {
                    this.invoicePayments = res[0].concat(res[1]);
                    invoice.JournalEntry = res[2];
                    return invoice;
                }));
            }),
            catchError(err => {
                return of(null);
            })
        ).subscribe((invoice: SupplierInvoice) => {
            // REVISIT: consider removing this.
            // The store should be route agnostic, since it might be used by multiple route components
            // e.g simple/advanced variations of supplier-invoice, very specific whitelabel versions etc.
            if (!invoice) {
                this.changes$.next(false);
                this.router.navigateByUrl('/accounting/bills/0');
                return;
            }

            if (!invoice.JournalEntry) {
                invoice.JournalEntry = <JournalEntry> {
                    _createguid: this.supplierInvoiceService.getNewGuid(),
                };
            }

            if (!invoice.JournalEntry.DraftLines?.length) {
                invoice.JournalEntry.DraftLines = [
                    <JournalEntryLineDraft> {
                        AmountCurrency: invoice.TaxInclusiveAmountCurrency || 0,
                        _createguid: this.supplierInvoiceService.getNewGuid()
                    }
                ];
            } else {
                invoice.JournalEntry.DraftLines.forEach(line => {
                    line.VatType = this.vatTypes.find(type => type.ID === line.VatTypeID);
                });
            }

            this.smartBookingResult = {};
            this.invoice$.next(invoice);
            this.journalEntryLines$.next(invoice.JournalEntry.DraftLines);
            this.changes$.next(false);
            this.readonly$.next(invoice.StatusCode === StatusCodeSupplierInvoice.Journaled);
            this.initDataLoaded$.next(true);
        });
    }

    ngOnDestroy() {
        this.startupFileID$.complete();
        this.invoice$.complete();
        this.changes$.complete();
        this.initDataLoaded$.complete();
    }

    setSelectedFile(file: File) {
        if (this.selectedFile?.ID !== file.ID) {
            this.selectedFile = file;

            if (this.initDataLoaded$.value) {
                this.runOcr();
            } else {
                this.initDataLoaded$.take(2).subscribe(res => {
                    if (res) {
                        this.runOcr();
                    }
                });
            }
        }
    }

    runOcr() {
        const invoice = this.invoice$.value;

        if (this.selectedFile && invoice && !invoice?.SupplierID) {
            this.toastService.showLoadIndicator({
                title: 'Et lite øyeblikk',
                message: 'Vi tolker vedlegget, og legger automatisk inn de verdiene som systemet gjenkjenner.'
            });

            this.ocrHelper.runOcr(this.selectedFile, invoice).subscribe(
                updatedInvoice => {
                    this.invoice$.next(updatedInvoice);

                    this.updateJournalEntryLine(0, 'AmountCurrency', updatedInvoice.TaxInclusiveAmountCurrency);

                    if (invoice.Supplier) {
                        this.runSmartBooking();
                    }

                    this.toastService.hideLoadIndicator();
                },
                () => this.toastService.hideLoadIndicator()
            );
        }
    }

    getDescription(): string {
        const invoice = this.invoice$.value;
        if (!invoice?.Supplier) {
            return '';
        }
        return invoice.Supplier.SupplierNumber + ' - ' + invoice.Supplier.Info.Name +
            (invoice.InvoiceNumber ? ' - fakturanr. ' + invoice.InvoiceNumber : '');
    }

    onInvoiceChange(field: string, event?: any) {
        this.hasChanges = true;
        const invoice = this.invoice$.value;
        if (field === 'TaxInclusiveAmountCurrency') {
            // Set invoice amount as draftline amount if we only have one line
            if (invoice?.JournalEntry?.DraftLines?.length === 1) {
                this.updateJournalEntryLine(0, 'AmountCurrency', invoice.TaxInclusiveAmountCurrency);

                if (!invoice.JournalEntry.DraftLines[0].Account && invoice?.Supplier?.OrgNumber) {
                    this.runSmartBooking();
                }

            } else {
                // Trigger recalc
                this.journalEntryLines$.next(this.journalEntryLines$.value);
            }
        } else if (field === 'InvoiceDate') {

            // When updating invoice date, update duedate and deliverydate accordingly
            invoice.PaymentDueDate = new LocalDate(moment(invoice.InvoiceDate).add('d', 14).toDate());
            invoice.DeliveryDate = invoice.InvoiceDate;

            this.updateDatesOnJournalEntryLines(invoice.InvoiceDate);
        } else if (field.toLowerCase().includes('dimension') && !invoice.DefaultDimensions.ID) {
            invoice.DefaultDimensions._createguid = this.supplierInvoiceService.getNewGuid();
        } else if (field === 'Supplier' && invoice.TaxInclusiveAmountCurrency && !invoice.ID) {
            this.runSmartBooking();
        }

        this.invoice$.next(invoice);
        this.changes$.next(true);
    }

    updateJournalEntryLine(index: number, field: string, value: any, shouldUpdateVat = false) {
        const lines = this.journalEntryLines$.value;
        const line = lines[index];

        set(line, field, value);

        this.hasChanges = true;

        if (field === 'Account') {
            line.AccountID = value?.ID || null;

            this.updateJournalEntryLine(index, 'Description', this.getDescription());

            if (value?.VatTypeID && shouldUpdateVat) {
                this.updateJournalEntryLine(index, 'VatType', this.findVatType(value.VatTypeID));
            }
        } else if (field === 'VatType') {
            line.VatTypeID = value?.ID || null;
        }

        // recalc

        lines[index] = line;
        this.journalEntryLines$.next(lines);
        this.changes$.next(true);
    }

    findVatType(ID: number): VatType {
        let vatType;

        // 3 = Avgiftspliktig
        if (this.companySettings.TaxMandatoryType === 3) {
            vatType = this.vatTypes.find(x => x.ID === ID);

        // 2 = Avgiftsfri men planlegger mva
        } else if (this.companySettings.TaxMandatoryType === 2) {

            const overrideVatCodes = ['3', '31', '32', '33'];
            const overrideVatCodesNone = ['1', '11', '12', '13'];

            if (overrideVatCodes.indexOf(vatType.VatCode) !== -1) {
                vatType = this.vatTypes.find(x => x.VatCode === '6');
            } else if (overrideVatCodesNone.indexOf(vatType.VatCode) !== -1) {
                vatType = this.vatTypes.find(x => x.VatCode === '0');
            }
        } else {
            vatType = this.vatTypes.find(x => x.VatCode === '0');
        }

        return vatType;
    }

    getDimensionsConfig(dimensionNumber: number) {
        switch (dimensionNumber) {
            case 1: // PROJECT
                return this.uniSearchDimensionConfig.generateProjectConfig(this.projectService);
            case 2: // DEPARTMENT
                return this.uniSearchDimensionConfig.generateDepartmentConfig(this.departmentService);
            case 5: case 6: case 7:     // SUPPORT FOR CUSTOM DIMENSIONS
            case 8: case 9: case 10:
                return this.uniSearchDimensionConfig.generateDimensionConfig(dimensionNumber, this.customDimensionService)
        }
    }

    setSupplier(newSupplier: Supplier): Promise<SupplierInvoice> {

        return new Promise((resolve) => {
            let current: SupplierInvoice = this.invoice$.getValue();
            current.Supplier = newSupplier;
            current.SupplierID = newSupplier.ID;

            if (
                !current.BankAccountID && newSupplier?.Info?.DefaultBankAccountID ||
                (current.BankAccount && current?.BankAccount?.BusinessRelationID !== newSupplier.BusinessRelationID)
            ) {
                current.BankAccountID = newSupplier?.Info?.DefaultBankAccountID;
                current.BankAccount = newSupplier?.Info?.DefaultBankAccount;
            }

            // this.orgNumber = newSupplier.OrgNumber;

            current.DefaultDimensions = current.DefaultDimensions || <Dimensions> {
                _createguid: this.supplierInvoiceService.getNewGuid()
            };

            if (newSupplier?.Dimensions?.Info) {
                current = this.mapDimensions(current, newSupplier.Dimensions.Info[0]);
            }

            current.DefaultDimensions.ProjectID = newSupplier?.Dimensions?.ProjectID;
            current.DefaultDimensions.DepartmentID = newSupplier?.Dimensions?.DepartmentID;

            for (let i = 5; i <= 10; i++) {
                const dimensions = newSupplier?.Dimensions || {};
                current.DefaultDimensions[`Dimension${i}ID`] = dimensions[`Dimension${i}ID`] ||  null;
            }

            resolve(current);
        });
    }

    // Update dates on all lines when dates are altered on head
    private updateDatesOnJournalEntryLines(date) {
        const lines = this.journalEntryLines$.value.map(line => {
            line.VatDate = date;
            line.FinancialDate = date;
            return line;
        });

        this.journalEntryLines$.next(lines);
    }

    /**
     * WARNING!
     *
     * This function is only concerned with saving the current state, it does not reload data or redirect.
     *
     * To avoid bugs with missing IDs, old createguids etc you should always redirect or re-initialize the store after saving
     * (unless you're running a transition after saving, in that case reload after the transition completes)
     */
    saveChanges(): Observable<SupplierInvoice> {
        const invoice = this.invoice$.value;

        // Lets get journal-lines and map dimensions from the head
        invoice.JournalEntry.DraftLines = this.journalEntryLines$.value.map(line => {
            line.Dimensions = invoice.DefaultDimensions;
            return line;
        });

        if (!invoice.Supplier || !invoice.TaxInclusiveAmountCurrency) {
            return Observable.throwError('En regning må ha leverandør og sum');
        }

        let saveRequest$ = invoice.ID
            ? this.supplierInvoiceService.Put(invoice.ID, invoice)
            : this.supplierInvoiceService.Post(invoice);

        // Link unlinked files
        const fileIDs = this.fileIDs$.value;
        if (!invoice.ID && fileIDs?.length) {
            saveRequest$ = saveRequest$.pipe(switchMap(savedInvoice => {
                return this.linkFiles(savedInvoice.ID, fileIDs).pipe(
                    map(() => savedInvoice)
                );
            }));
        }

        return saveRequest$;
    }

    private linkFiles(invoiceID: number, fileIDs: number[]): Observable<any> {
        if (!fileIDs?.length) {
            return of(null);
        }

        const requests = fileIDs.map(fileID => {
            return this.fileService.linkFile('SupplierInvoice', invoiceID, fileID).pipe(
                catchError(err => {
                    return of(null);
                })
            );
        });

        return forkJoin(requests);
    }

    runSmartBooking() {
        const orgNumber = this.invoice$.value?.Supplier?.OrgNumber;

        if (orgNumber && orgNumber.length === 9 && this.journalEntryLines$.value.length === 1) {
            this.toastService.showLoadIndicator({
                title: 'Kjører smart bokføring',
                message: 'Systemet ser etter kostnadskonto basert på valgt leverandør. Resultat vises under regnskap under. Vennligst vent..'
            });

            return this.smartBookingHelper.runSmartBooking(orgNumber).subscribe((result: ISmartBookingResult) => {

                // Save the result to show message and access account any time
                this.smartBookingResult = result;
                this.smartBookingResult.visible = true;

                // TODO: use message / error
                if (result.account) {
                    this.updateJournalEntryLine(0, 'Account', result.account);
                    this.updateJournalEntryLine(0, 'Description', this.getDescription());
                }
                setTimeout(() => {
                    this.toastService.hideLoadIndicator();
                }, 1000);
            });
        } else {
            // TODO: toast
            this.smartBookingResult.message = (orgNumber && orgNumber.length === 9)
                ? 'Smart bokføring kan ikke kjøres hvis det er mer enn en konteringslinje.'
                : 'Kan ikke kjøre smart bokføring uten leverandør med organsiasjonsnummer';
            this.smartBookingResult.visible = true;
        }
    }

    // JOURNAL AND PAYMENT FUNCTIONS - OWN INJECTABLE?
    journal(done?) {
        // TODO: validations?

        this.journalAndPaymentHelper.journal(this.invoice$.value, true).subscribe(response => {
            if (response) {
                this.loadInvoice(this.invoice$.value.ID);
                done('Faktura er bokført. Bilagsnummer med link vises i toppen.');
            } else {
                done('Bokføring avbrutt, ingenting endret.');
            }
        }, err => {
            done('Bokføring feilet. Sjekk at det ikke er differanse på bilagslinjen.');
        });
    }

    sendToPayment(isOnlyPayment = true, done) {

        if (!this.invoice$?.value?.BankAccountID) {
            this.toastService.addToast('Ukomplett regning', ToastType.warn, 8, 'Kan ikke opprette betaling uten at feltet "Betal til bankkonto" er fylt ut');
            done();
            return;
        }

        const options = {
            data: {
                current: this.invoice$.value,
                onlyToPayment: isOnlyPayment
            }
        };

        this.modalService.open(ToPaymentModal, options).onClose.subscribe(response => {
            if (response) {
                done('Faktura sendt til betaling');
                this.openJournaledAndPaidModal(response);
                this.loadInvoice(this.invoice$.value.ID);
            } else {
                done('Betaling avbrutt');
            }
        });
    }

    assignInvoice() {
        return this.modalService.open(BillAssignmentModal, {
            closeOnClickOutside: false
        }).onClose.pipe(switchMap(details => {
            return of (details);
        }), catchError(err => {
            return of(null);
        }));
    }

    approveOrRejectInvoice(key: string, done) {
        this.modalService.open(InvoiceApprovalModal, {
            data: {
                task: this.invoice$.value['_task'],
                entityType: 'SupplierInvoice',
                action: key
            }
        }).onClose.subscribe(approvedOrRejected => {
            if (approvedOrRejected) {
                this.loadInvoice(this.invoice$.value.ID);
                done('Faktura ' + (key === 'approve' ? 'godkjent' : 'avvist'));
            } else {
                done();
            }
        });
    }

    mapDimensions(current: SupplierInvoice, info: any): SupplierInvoice {

        const dimension = <any>{};

        if (info.DepartmentNumber) {
            dimension.Department = {
                DepartmentName: info.DepartmentName,
                DepartmentNumber: info.DepartmentNumber
            };
        }

        if (info.ProjectNumber) {
            dimension.Project = {
                ProjectName: info.ProjectName,
                ProjectNumber: info.ProjectNumber
            };
        }

        // Custom dimensions

        current.DefaultDimensions = dimension;
        return current;
    }

    openJournaledAndPaidModal(action: ActionOnReload) {
        let options: IModalOptions;
        switch (action) {
            case ActionOnReload.JournaledAndSentToBank:
                options = {
                    header: 'Bokført og betalt',
                    footerCls: 'center',
                    buttonLabels: {
                        accept: 'Registrer ny utgift',
                        reject: 'Lukk'
                    },
                    message: `Regningen er bokført i regnskapet ditt og sendt til banken. Husk å logge inn i nettbanken og godkjenn utbetalingen.`
                };

                break;
            case ActionOnReload.JournaledAndSentToPaymentList:
                options = {
                    header: 'Bokført og sendt til betaling',
                    footerCls: 'center',
                    buttonLabels: {
                        accept: 'Registrer ny utgift',
                        reject: 'Gå til betalingsliste',
                    },
                    message: `Regningen er bokført i regnskapet ditt og er lagt til utbetaling i betalingslisten. <br/><br/> Regningen vil ikke bli betalt før du manuelt gjør dette. ` +
                    `Du finner den i listen "Betalingsliste" under menyvalget "Bank - Utbetalinger" eller du kan trykke på knappen "Gå til betalingsliste" under.`
                };

                break;

            case ActionOnReload.SentToBank:
                options = {
                    header: 'Betaling fullført',
                    footerCls: 'center',
                    buttonLabels: {
                        accept: 'Registrer ny utgift',
                        reject: 'Lukk',
                    },
                    message: `Regningen er sendt til banken. Husk å logge inn i nettbanken og godkjenn utbetalingen.`
                };

                break;

            case ActionOnReload.SentToPaymentList:
                options = {
                    header: 'Sendt til betalingsliste',
                    footerCls: 'center',
                    buttonLabels: {
                        accept: 'Registrer ny utgift',
                        reject: 'Gå til betalingsliste',
                    },
                    message: `Regningen er lagt til utbetaling i betalingslisten. <br/><br/> Regningen vil ikke bli betalt før du manuelt gjør dette. ` +
                    `Du finner den i listen "Betalingsliste" under menyvalget "Bank - Utbetalinger" eller du kan trykke på knappen "Gå til betalingsliste" under.`
                };

                break;
            default:
                return;
        }

        this.modalService.confirm(options).onClose.subscribe((response) => {
            if (response === ConfirmActions.ACCEPT) {
                this.router.navigateByUrl('/accounting/bills/0');
            } else if (response === ConfirmActions.REJECT &&
                (action === ActionOnReload.SentToPaymentList || action === ActionOnReload.JournaledAndSentToPaymentList)) {
                this.router.navigateByUrl('/bank/ticker?code=payment_list');
            }
        });

    }
}
