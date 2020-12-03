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
    InvoicePaymentData,
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
    BankService,
    CurrencyCodeService,
    PaymentMode,
    StatisticsService, AccountService, AssetsService
} from '@app/services/services';
import {BehaviorSubject, of, forkJoin, Observable, throwError} from 'rxjs';
import {switchMap, catchError, map, tap, finalize} from 'rxjs/operators';
import {SmartBookingHelperClass, ISmartBookingResult} from './smart-booking-helper';
import {OCRHelperClass} from './ocr-helper';
import {JournalAndPaymentHelper, ActionOnReload} from './journal-and-pay-helper';
import {ToPaymentModal} from './modals/to-payment-modal/to-payment-modal';
import {set} from 'lodash';

import * as moment from 'moment';
import {ToastService, ToastType} from '@uni-framework/uniToast/toastService';
import * as _ from 'lodash';
import {
    IModalOptions,
    UniModalService,
    ConfirmActions,
    InvoiceApprovalModal,
    UniConfirmModalV2,
    UniRegisterPaymentModal,
    UniConfirmModalWithCheckbox
} from '@uni-framework/uni-modal';
import { BillAssignmentModal } from '../bill/assignment-modal/assignment-modal';
import { roundTo } from '@app/components/common/utils/utils';
import { DoneRedirectModal } from '../bill/expense/done-redirect-modal/done-redirect-modal';
import {theme, THEMES} from 'src/themes/theme';

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
    currentMode: number = 0;
    bankAccounts: any[] = [];
    selectedBankAccount;
    url = theme.theme === THEMES.SR ? '/accounting/supplier-invoice/' : '/accounting/bills/';
    invoiceID: number = 0;

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
        public toastService: ToastService,
        private modalService: UniModalService,
        private bankService: BankService,
        private currencyCodeService: CurrencyCodeService,
        private statisticsService: StatisticsService,
        private accountService: AccountService,
        private assetsService: AssetsService
    ) {}

    init(invoiceID: number, currentMode: number = 0) {
        this.invoiceID = invoiceID;
        this.currentMode = currentMode;

        Observable.forkJoin(
            [this.companySettingsService.Get(1, []),
            this.vatTypeService.GetAll(),
            this.currencyCodeService.GetAll(),
            this.getSystemBankAccounts()]
        ).subscribe(([companySettings, types, codes, accounts]) => {
            this.companySettings = companySettings;
            this.vatTypes = types;
            this.currencyCodes = codes;
            this.bankAccounts = accounts;

            const defaultAccount = accounts.find(a => a.ID === this.companySettings.CompanyBankAccountID);
            this.selectedBankAccount = defaultAccount || accounts[0];

            this.loadInvoice(invoiceID, false);
        });
    }

    loadInvoice(id?, checkAsset: boolean = false, action: ActionOnReload = 0) {
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
                        'DraftLines.Account', 'DraftLines.Accrual.Periods'
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
                this.router.navigateByUrl(this.url + '0');
                return;
            }

            // Lets set default to NOK
            invoice.CurrencyCodeID = invoice.CurrencyCodeID || 1;
            invoice.InvoiceDate = invoice.InvoiceDate || new LocalDate(new Date());

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

            if (checkAsset) {
                this.itCanBeAnAsset(this.invoice$.value).subscribe((canBeAsset) => {
                    if (canBeAsset) {
                        this.assetsService.openRegisterModal(this.invoice$.value).take(1).subscribe((response: ConfirmActions) => {
                            if (action && response !== ConfirmActions.ACCEPT) {
                                this.openJournaledAndPaidModal(action).subscribe((res) => {
                                    if (res === ConfirmActions.ACCEPT) {
                                        this.router.navigateByUrl('/accounting/bills/0');
                                    } else if (res === ConfirmActions.REJECT &&
                                        (action === ActionOnReload.SentToPaymentList
                                            || action === ActionOnReload.JournaledAndSentToPaymentList)) {
                                        this.router.navigateByUrl('/bank/ticker?code=payment_list');
                                    } else if (action > 0 && action < 3) {
                                        this.itCanBeAnAsset(this.invoice$.value).subscribe(canBeAnAsset => {
                                            if (canBeAnAsset) {
                                                this.assetsService.openRegisterModal(this.invoice$.value);
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    }

    listInit(companySettings: CompanySettings) {
        this.companySettings = companySettings;
        this.getSystemBankAccounts().subscribe((accounts) => {
            this.bankAccounts = accounts;
            const defaultAccount = accounts.find(a => a.ID === this.companySettings.CompanyBankAccountID);
            this.selectedBankAccount = defaultAccount || accounts[0];
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

            const run = () => {
                if (this.supplierInvoiceService.isOCR(file)) {
                    this.runOcr();
                } else if (this.supplierInvoiceService.isEHF(file)) {
                    this.runEHF(file);
                }
            };

            if (!this.invoiceID) {
                if (this.initDataLoaded$.value) {
                    run();
                } else {
                    this.initDataLoaded$.take(2).subscribe(res => {
                        if (res) {
                            run();
                        }
                    });
                }
            }
        }
    }

    runOcr(force: boolean = false) {
        const invoice = this.invoice$.value;

        const run = () => {
            this.toastService.showLoadIndicator({
                title: 'Et lite øyeblikk',
                message: 'Vi tolker vedlegget, og legger automatisk inn de verdiene som systemet gjenkjenner.'
            });

            this.ocrHelper.runOcr(this.selectedFile, invoice, this.currentMode === PaymentMode.PrepaidByEmployee).subscribe(
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
        };

        if (this.selectedFile && invoice && !invoice?.SupplierID) {
            if (this.companySettings.UseOcrInterpretation) {
                run();
            } else if (this.companySettings.UseOcrInterpretation === undefined || this.companySettings.UseOcrInterpretation === null) {
                this.ocrHelper.getOCRCount().subscribe((res) => {
                    if (res?.CountOcrDataUsed <= 10) {
                        run();
                    } else {
                        this.companySettingsService.PostAction(1, 'ocr-trial-used').subscribe(success => {
                            this.companySettings.UseOcrInterpretation = false;

                            this.modalService.open(UniConfirmModalV2, {
                                header: 'Fakturatolkning er ikke aktivert',
                                message: 'Du har nå fått prøve vår tjeneste for å tolke fakturaer maskinelt'
                                + ' 10 ganger gratis. For å bruke tjenesten'
                                + ' videre må du aktivere Fakturatolk under regnskapsinnstillinger.',
                                buttonLabels: {
                                    accept: 'OK',
                                }
                            });
                        }, err => this.errorService.handle(err));
                    }
                });
            } else if (force) {
                this.modalService.open(UniConfirmModalV2, {
                    header: 'Fakturatolkning er deaktivert',
                    message: 'Vennligst aktiver fakturatolkning under firmainnstillinger i menyen for å benytte tolking av fakturaer',
                    buttonLabels: {
                        accept: 'OK'
                    }
                });
            }
        }
    }

    runEHF(file: any) {
        this.toastService.showLoadIndicator({
            title: 'Et lite øyeblikk',
            message: 'Vi tolker vedlegget, og legger automatisk inn de verdiene som systemet gjenkjenner.'
        });
        this.ocrHelper.runEHFParse(file, this.currentMode === PaymentMode.PrepaidByEmployee).subscribe(invoice => {
            invoice.JournalEntry = invoice.JournalEntry || <JournalEntry>{ ID: 0, DraftLines: [] };
            this.invoice$.next(invoice);

            this.updateJournalEntryLine(0, 'AmountCurrency', invoice.TaxInclusiveAmountCurrency);

            if (invoice.Supplier) {
                this.runSmartBooking();
            }
            this.toastService.hideLoadIndicator();
        }, err => {
            this.toastService.hideLoadIndicator();
        });
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

            this.updateDatesOnJournalEntryLines(moment(invoice.InvoiceDate).toString());
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
        } else if (field === 'AmountCurrency' && line.AmountCurrency) {
            // When typed into simple journal entry line form with a comma, change to . before parsefloat to avoid rounding and errors
            if (line.AmountCurrency.toString().indexOf(',') !== -1) {
                line.AmountCurrency = parseFloat(line.AmountCurrency.toString().replace(' ', '').replace(',', '.'))
            }
            line.Amount = line.AmountCurrency * line.CurrencyExchangeRate;
        } else if (field === 'AmountCurrency') {
            if (!line?.AmountCurrency || isNaN(line.AmountCurrency)) {
                line.AmountCurrency = 0;
            }
            line.Amount = line.AmountCurrency * line.CurrencyExchangeRate;
        }

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

            vatType = this.vatTypes.find(x => x.ID === ID);

            if (overrideVatCodes.indexOf(vatType?.VatCode) !== -1) {
                vatType = this.vatTypes.find(x => x.VatCode === '6');
            } else if (overrideVatCodesNone.indexOf(vatType?.VatCode) !== -1) {
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
    private updateDatesOnJournalEntryLines(date: string) {
        const lines = this.journalEntryLines$.value.map(line => {
            line.VatDate = new LocalDate(date);
            line.FinancialDate = new LocalDate(date);
            return line;
        });

        this.journalEntryLines$.next(lines);
    }

    prepExpenseForSave(date?) {
        const invoice = this.invoice$.value;
        const total = this.journalEntryLines$.value
            .map((l: any) =>  parseFloat((l.AmountCurrency + '').replace(',', '.')))
            .reduce((a, b) => a + b);

        invoice.TaxInclusiveAmountCurrency = total;
        invoice.InvoiceOriginType = this.currentMode + 1;

        if (date) {
            invoice.InvoiceDate = new LocalDate(new Date(date));
            invoice.PaymentDueDate = invoice.InvoiceDate;
            invoice.DeliveryDate = invoice.InvoiceDate;
        }

        this.invoice$.next(invoice);
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

        if (invoice.DefaultDimensions) {
            invoice.DefaultDimensions.Project = null;
            invoice.DefaultDimensions.Department = null;
        }

        // When in expense view, update journal entry line dates based on invoice date before saving
        this.updateDatesOnJournalEntryLines(moment(invoice.InvoiceDate).toString());

        // Lets get journal-lines and map dimensions from the head
        invoice.JournalEntry.DraftLines = this.journalEntryLines$.value.map(line => {
            line.Dimensions = invoice.DefaultDimensions;
            line.AmountCurrency = parseFloat((line.AmountCurrency + '').replace(',', '.'));
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

        if (this.currentMode === PaymentMode.PrepaidByEmployee) {
            return;
        }

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
                    this.updateJournalEntryLine(0, 'Account', result.account, true);
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

    journal(done = (string) => {}, alsoPay: boolean = false, payment?) {
        // TODO: validations?
        const invoice = this.invoice$.value;

        this.journalAndPaymentHelper.journal(invoice, true && !alsoPay).subscribe(response => {
            if (response) {
                if (alsoPay) {
                    this.supplierInvoiceService.payinvoice(invoice.ID, payment).subscribe(() => {
                        this.loadInvoice(invoice.ID, true);
                        done('Faktura er bokført og registrert som betalt. Bilagsnummer med link vises i toppen.');
                    }, err => {
                        this.errorService.handle(err);
                        done('Betaling feilet');
                    });
                } else {
                    this.loadInvoice(this.invoice$.value.ID, true);
                    done('Faktura er bokført. Bilagsnummer med link vises i toppen.');
                }
            } else {
                done('Bokføring avbrutt, ingenting endret.');
            }
        }, err => {
            done('Bokføring feilet. Sjekk at det ikke er differanse på bilagslinjen.');
        });
    }

    sendToPayment(isOnlyPayment = true, done) {
        const invoice = this.invoice$.value;

        if (!this.invoice$?.value?.BankAccountID) {
            this.toastService.addToast('Ukomplett regning', ToastType.warn, 8, 'Kan ikke opprette betaling uten at feltet "Betal til bankkonto" er fylt ut');
            done();
            return;
        }

        const paymentData = <InvoicePaymentData> {
            Amount: roundTo(invoice.RestAmount),
            AmountCurrency: roundTo(invoice.RestAmountCurrency),
            BankChargeAmount: 0,
            CurrencyCodeID: invoice.CurrencyCodeID,
            CurrencyExchangeRate: 0,
            PaymentDate: invoice.PaymentDueDate || invoice.InvoiceDate,
            AgioAccountID: 0,
            BankChargeAccountID: this.companySettings.BankChargeAccountID,
            AgioAmount: 0,
            PaymentID: null,
            DimensionsID: invoice.DefaultDimensionsID,
            FromBankAccountID: this.selectedBankAccount?.ID
        };

        const options = {
            data: {
                supplierInvoice: invoice,
                onlyToPayment: isOnlyPayment,
                accounts: this.bankAccounts,
                payment: paymentData
            }
        };

        this.modalService.open(ToPaymentModal, options).onClose.subscribe((response: ActionOnReload) => {
            if (!response) {
                done('');
                return;
            }

            if (response <= ActionOnReload.SentToPaymentList) {
                this.loadInvoice(this.invoice$.value.ID, true, response);
                done('Faktura sendt til betaling');
            } else if (response >= ActionOnReload.FailedToSendToBank) {
                this.loadInvoice(this.invoice$.value.ID, true);
                done('Faktura ble bokført med kunne ikke sende til betaling');
            } else {
                done('Betaling avbrutt');
            }
        });
    }

    showSavedJournalToast(response: Array<{ JournalEntryNumber: string }>, withPayment = false) {
        const jnr = (response && response.length > 0) ? response[0].JournalEntryNumber : undefined;
        const paymentJournalEntry = response?.length > 1 ? response[1].JournalEntryNumber : undefined;

        this.modalService.open(DoneRedirectModal, {
            closeOnClickOutside: false,
            closeOnEscape: false,
            hideCloseButton: true,
            data: {
                number: jnr.split('-')[0],
                year: jnr.split('-')[1],
                journalEntryNumber: jnr,
                paymentJournalEntry: paymentJournalEntry,
                withPayment: withPayment
            }
        }).onClose.subscribe((url: string) => {
            this.invoice$.next(null);
            this.router.navigateByUrl(url, { replaceUrl: true });
        });
    }

    registerExpensePayment(accountID, id?: number): Observable<any> {
        const invoice = this.invoice$.getValue();
        invoice.ID = id || invoice.ID;

        const paymentData = <InvoicePaymentData> {
            Amount: roundTo(invoice.RestAmount),
            AmountCurrency: roundTo(invoice.RestAmountCurrency),
            BankChargeAmount: 0,
            CurrencyCodeID: invoice.CurrencyCodeID,
            CurrencyExchangeRate: 0,
            PaymentDate: invoice.InvoiceDate,
            AgioAccountID: 0,
            BankChargeAccountID: accountID,
            AgioAmount: 0,
            PaymentID: null,
            DimensionsID: invoice.DefaultDimensionsID,
            FromBankAccountID: accountID
        };

        return this.journalAndPaymentHelper.cleanJournal(invoice.ID).pipe(switchMap(i => {
            return this.supplierInvoiceService.payinvoice(invoice.ID, paymentData);
        })).pipe(switchMap(() => {
            const query = `model=JournalEntry&select=JournalEntryNumber as JournalEntryNumber&filter=SupplierInvoice.ID eq ${invoice.ID} or Payment.SupplierInvoiceID eq ${invoice.ID}&join=JournalEntry.ID eq SupplierInvoice.JournalEntryID and JournalEntry.ID eq Payment.JournalEntryID`
            return this.statisticsService.GetAllUnwrapped(query);
        }));
    }

    sendExpenseToPayment(): Observable<any> {
        const invoice = this.invoice$.value;
        const paymentData = <InvoicePaymentData> {
            Amount: roundTo(invoice.RestAmount),
            AmountCurrency: roundTo(invoice.RestAmountCurrency),
            BankChargeAmount: 0,
            CurrencyCodeID: invoice.CurrencyCodeID,
            CurrencyExchangeRate: 0,
            PaymentDate: invoice.InvoiceDate,
            AgioAccountID: 0,
            BankChargeAccountID: this.companySettings.BankChargeAccountID,
            AgioAmount: 0,
            PaymentID: null,
            DimensionsID: invoice.DefaultDimensionsID,
            FromBankAccountID: this.selectedBankAccount?.ID
        };

        return this.modalService.open(ToPaymentModal, {
            data: {
                supplierInvoice: invoice,
                accounts: this.bankAccounts,
                onlyToPayment: false,
                payment: paymentData
            }
        }).onClose.pipe(switchMap((response: ActionOnReload) => {
            return of(response);
        })).pipe(switchMap((response) => {
            if (response === ActionOnReload.JournaledAndSentToBank || response === ActionOnReload.JournaledAndSentToPaymentList) {
                return this.statisticsService.GetAllUnwrapped(`model=JournalEntry&filter=ID eq ${this.invoice$.value.JournalEntryID}&select=JournalEntryNumber as JournalEntryNumber`);
            } else if (response === ActionOnReload.FailedToJournal) {
                this.toastService.addToast('Noe gikk galt med bokføring', ToastType.warn, 10, '<a href="/#/accounting/bills?filter=Draft">Gå til regninger for å fullføre tilbakebetalingen</a>');
                throwError('');
            } else {
                this.toastService.addToast('Noe gikk galt med betaling', ToastType.warn, 10, 'Tilbakebetaling ble bokført, men klarte ikke fullføre betaling. <a href="/#/accounting/bills?filter=Journaled">Gå til regninger for å fullføre tilbakebetalingen</a>');
                throwError('');
            }
        }));
    }

    journalExpense(): Observable<any> {
        return this.journalAndPaymentHelper.cleanJournal(this.invoice$.value.ID).pipe(switchMap(() => {
            return this.statisticsService.GetAllUnwrapped(`model=JournalEntry&filter=ID eq ${this.invoice$.value.JournalEntryID}&select=JournalEntryNumber as JournalEntryNumber`);
        }));
    }

    journalFromList(ID: number): Observable<any> {
        return this.supplierInvoiceService.Get(ID, ['Supplier.Info']).pipe(switchMap(invoice => {
            return this.journalAndPaymentHelper.journal(invoice, true);
        }));
    }

    toPaymentFromList(ID: number, onlyPay: boolean = true) {
                return this.supplierInvoiceService.Get(ID, ['Supplier.Info', 'JournalEntry.DraftLines', 'BankAccount'])
        .pipe(switchMap((invoice) => {
            const paymentData = <InvoicePaymentData> {
                Amount: roundTo(invoice.RestAmount),
                AmountCurrency: roundTo(invoice.RestAmountCurrency),
                BankChargeAmount: 0,
                CurrencyCodeID: invoice.CurrencyCodeID,
                CurrencyExchangeRate: 0,
                PaymentDate: invoice.InvoiceDate,
                AgioAccountID: 0,
                BankChargeAccountID: this.companySettings.BankChargeAccountID,
                AgioAmount: 0,
                PaymentID: null,
                DimensionsID: invoice.DefaultDimensionsID,
                FromBankAccountID: this.selectedBankAccount.ID
            };

            return this.modalService.open(ToPaymentModal, {
                data: {
                    supplierInvoice: invoice,
                    onlyToPayment: onlyPay,
                    accounts: this.bankAccounts,
                    payment: paymentData
                }
            }).onClose;
        }));
    }

    registerPaymentFromListAndOptionalJournaling(ID: number, isAlsoBook: boolean): Observable<any> {
        return this.supplierInvoiceService.Get(ID, ['CurrencyCode']).pipe(switchMap((invoice) => {
            return this.openRegisterPaymentModal(invoice, isAlsoBook).pipe(switchMap((payment) => {
                if (isAlsoBook) {
                    return this.supplierInvoiceService.journal(ID).pipe(switchMap(() => {
                        return this.supplierInvoiceService.payinvoice(invoice.ID, payment);
                    }));
                } else {
                    return this.supplierInvoiceService.payinvoice(invoice.ID, payment);
                }
            }));
        }));
    }

    deleteFromList(invoice: any): Observable<any> {
        const amount = invoice.SupplierInvoiceRestAmountCurrency.toFixed(2);
        const options: IModalOptions = {
            header: 'Slette regning',
            message: `Er du sikker på at du ønsker å slette <strong>regning nr ${invoice.ID}</strong> på ${amount} fra <strong>${invoice.InfoName}</strong>? Dette valget kan ikke angres.`,
            buttonLabels: {
                accept: 'Avbryt',
                reject: 'Slett'
            }
        };

        return this.modalService.confirm(options).onClose.pipe(switchMap((closeAction: ConfirmActions) => {
            return closeAction === ConfirmActions.REJECT ? this.supplierInvoiceService.Remove(invoice.ID) : of(false);
        }));
    }

    getPaymentsBeforeCredit(ID: number) {
        const obs = [this.bankService.getBankPayments(ID), this.bankService.getRegisteredPayments(ID)];
        return Observable.forkJoin(obs).pipe(switchMap((res) => {
            return this.creditSupplierInvoice(ID, res[0].concat(res[1]));
        }));
    }

    restoreSupplierInvoice(ID: number) {
        return this.supplierInvoiceService.restore(ID);
    }

    creditSupplierInvoice(ID?: number, fetchedPayments?: any[]) {

        const invoiceID = ID || this.invoice$?.value?.ID;
        const payments = fetchedPayments || this.invoicePayments;

        const paymentsSentToBank = payments.find(payment =>
            payment.StatusCode === 44002
            || payment.StatusCode === 44007
            || payment.StatusCode === 44008
            || payment.StatusCode === 44009
            || payment.StatusCode === 44011) !== undefined;

        const paymentsThatWillBeDeleted = payments.find(payment =>
            payment.StatusCode === 44001
            || payment.StatusCode === 44003
            || payment.StatusCode === 44005
            || payment.StatusCode === 44012
            || payment.StatusCode === 44014) !== undefined;

        const options = {
            header: 'Kreditere faktura?',
            message: 'Vil du kreditere bokføringen for fakturaen? Fakturaen vil settes tilbake til opprettet.',
            closeOnClickOutside: false,
            checkboxLabel: '',
            warning: paymentsSentToBank ?
                'Leverandørfakturaen har en eller flere betalinger som er sendt til banken. ' +
                'Dersom du krediterer bør denne betalingen stoppes manuelt i banken.'
                : paymentsThatWillBeDeleted
                    ? 'Leverandørfakturaen har en eller flere betalinger som vil bli slettet viss du krediterer.'
                    : ''
        };

        if (options.warning !== '') {
            options.checkboxLabel = 'Jeg har forstått hva som skjer hvis jeg krediterer fakturaen.';
        }

        return this.modalService.open(UniConfirmModalWithCheckbox, options).onClose.pipe(switchMap((response) => {
            if (response === ConfirmActions.ACCEPT) {
                return this.supplierInvoiceService.creditInvoiceJournalEntry(invoiceID);
            }
            return of(false);
        }));
    }

    openRegisterPaymentModal(invoice, isAlsoBook): Observable<any> {
        const paymentData = <InvoicePaymentData> {
            Amount: roundTo(invoice.RestAmount),
            AmountCurrency: roundTo(invoice.RestAmountCurrency),
            BankChargeAmount: 0,
            CurrencyCodeID: invoice.CurrencyCodeID,
            CurrencyExchangeRate: 0,
            PaymentDate: new LocalDate(Date()),
            AgioAccountID: 0,
            BankChargeAccountID: 0,
            AgioAmount: 0,
            PaymentID: null,
            DimensionsID: invoice.DefaultDimensionsID
        };

        return this.modalService.open(UniRegisterPaymentModal, {
            header: isAlsoBook ? 'Bokfør og registrer gjennomført betaling' : 'Registrer gjennomført betaling',
            message: 'Regningen vil bli registrert som betalt i systemet. Husk å betale regningen i nettbanken dersom dette ikke allerede er gjort.',
            data: paymentData,
            modalConfig: {
                entityName: 'SupplierInvoice',
                currencyCode: invoice.CurrencyCode || this.currencyCodes.find(code => code.ID === invoice.CurrencyCodeID).Code,
                currencyExchangeRate: invoice.CurrencyExchangeRate,
                entityID: invoice.SupplierID,
                supplierID: invoice.SupplierID,
                isSendForPayment: true
            },
            buttonLabels: {
                accept: isAlsoBook ? 'Bokfør og registrer betaling' : 'Registrer betaling'
            }
        }).onClose;
    }

    registerPayment(done, isAlsoBook: boolean = false, supplierInvoice?: SupplierInvoice) {
        const invoice = supplierInvoice || this.invoice$.getValue();

        this.openRegisterPaymentModal(invoice, isAlsoBook).subscribe((payment) => {
            if (payment) {
                if (isAlsoBook) {
                    this.journal(done, true, payment);
                } else {
                    this.supplierInvoiceService.payinvoice(invoice.ID, payment).subscribe(() => {
                        this.loadInvoice(invoice.ID);
                        done('Faktura registrert som betalt');
                    }, err => {
                        this.errorService.handle(err);
                        done('Betaling feilet');
                    });
                }
            } else {
                done();
            }
        });
    }

    assignInvoice(reAssign: boolean = false, done: any) {
        return this.modalService.open(BillAssignmentModal, {
            closeOnClickOutside: false
        }).onClose.subscribe((details) => {
            if (details) {
                const obs = reAssign
                    ? this.supplierInvoiceService.reAssign(this.invoice$.value.ID, details)
                    : this.supplierInvoiceService.assign(this.invoice$.value.ID, details);

                obs.subscribe(res => {
                    this.loadInvoice(this.invoice$.value.ID);
                    done('Faktura tildelt');
                }, err => {
                    done();
                });
            } else {
                done();
            }
        });
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

    getSystemBankAccounts() {
        return this.statisticsService.GetAll('model=bankaccount&select=ID as ID,AccountID as AccountID'
        + ',BankAccountType as BankAccountType,Account.AccountNumber as AccountNumber'
        + ',Account.AccountName as AccountName,AccountNumber as BankAccountNumber,Bank.Name,Label as Label'
        + ',casewhen(companysettingsid gt 0 and id eq companysettings.companybankaccountid,1,0) as IsDefault'
        + '&filter=companysettingsid gt 0&expand=bank,account'
        + '&join=bankaccount.id eq companysettings.CompanyBankAccountID'
        + '&top=50&distinct=false'
        + '&orderby=casewhen(companysettingsid gt 0 and id eq companysettings.companybankaccountid,0,1)')
            .map( x => x.Data );
    }

    approveOrRejectFromList(ID: number, key: string) {
        return this.supplierInvoiceService.Get(ID, [], true).pipe(switchMap((invoice) => {
            return this.modalService.open(InvoiceApprovalModal, {
                data: {
                    task: invoice['_task'],
                    entityType: 'SupplierInvoice',
                    action: key
                }
            }).onClose;
        }));
    }

    mapDimensions(current: SupplierInvoice, info: any): SupplierInvoice {

        if (info.DepartmentNumber) {
            current.DefaultDimensions.Department = <any>{
                DepartmentName: info.DepartmentName,
                DepartmentNumber: info.DepartmentNumber
            };
        }

        if (info.ProjectNumber) {
            current.DefaultDimensions.Project = <any>{
                ProjectName: info.ProjectName,
                ProjectNumber: info.ProjectNumber
            };
        }

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
                    message: `Regningen er bokført i regnskapet ditt og sendt til banken hvor den vil bli betalt på forfallsdato.`
                };

                break;
            case ActionOnReload.JournaledAndSentToPaymentList:
                options = {
                    header: 'Bokført og lagt til betalingsliste',
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

        return this.modalService.confirm(options).onClose;

    }

    itCanBeAnAsset(current: SupplierInvoice) {
        if (current?.JournalEntry?.DraftLines?.length > 0) {
            const line = current?.JournalEntry?.DraftLines[0];
            const accountFromLine = line.Account;
            if (accountFromLine) {
                return of(accountFromLine.AccountNumber.toString().startsWith('10')
                    || accountFromLine.AccountNumber.toString().startsWith('11')
                    || accountFromLine.AccountNumber.toString().startsWith('12'));

            } else {
                return this.accountService.Get(line.AccountID).pipe(
                    tap((account) => current.JournalEntry.DraftLines[0].Account = account),
                    map((account) => {
                        return account.AccountNumber.toString().startsWith('10')
                            || account.AccountNumber.toString().startsWith('11')
                            || account.AccountNumber.toString().startsWith('12');
                    })
                );
            }
        }
        return of(false);
    }
}
