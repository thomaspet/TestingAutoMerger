import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { IUniSaveAction } from '@uni-framework/save/save';
import { IToolbarConfig } from '@app/components/common/toolbar/toolbar';
import {
    BankJournalSession,
    DebitCreditEntry,
    ErrorService,
    PageStateService,
    PaymentMode,
    SupplierInvoiceService,
    CompanySettingsService,
    UniFilesService,
    JournalEntryService
} from '@app/services/services';
import { TabService, UniModules } from '@app/components/layout/navbar/tabstrip/tabService';
import {IOcrServiceResult, OcrValuables} from '../../bill/detail/ocr';
import { ToastService, ToastType } from '@uni-framework/uniToast/toastService';
import { ExpenseSummaryModal } from './summary/summary';
export { ExpenseSummaryModal } from './summary/summary';
import { Router, ActivatedRoute } from '@angular/router';
import { ExpensePrepaid } from './prepaid/prepaid';
export { ExpensePrepaid } from './prepaid/prepaid';
export { ExpenseEntries } from './entries/entries';
export { ExpensePayable } from './payable/payable';
import { UniImage } from '@uni-framework/uniImage/uniImage';
import { UniModalService, UniConfirmModalV2 } from '@uni-framework/uni-modal';
import {DoneRedirectModal} from './done-redirect-modal/done-redirect-modal';
import { FileFromInboxModal } from '../../modals/file-from-inbox-modal/file-from-inbox-modal';
import {CompanySettings} from '@app/unientities';

@Component({
    selector: 'expense',
    templateUrl: './expense.html',
    styleUrls: [ './expense.sass' ]
})
export class Expense implements OnInit {
    @ViewChild(ExpensePrepaid) prepaidView: ExpensePrepaid;
    @ViewChild(UniImage) public uniImage: UniImage;

    busy = true;
    fileIds: number[] = [];

    saveActions: IUniSaveAction[] = [];
    toolbarConfig: IToolbarConfig;
    companySettings: CompanySettings;

    constructor(
        public session: BankJournalSession,
        private errorService: ErrorService,
        private pageStateService: PageStateService,
        private tabService: TabService,
        private toast: ToastService,
        private router: Router,
        private route: ActivatedRoute,
        private modalService: UniModalService,
        private supplierInvoiceService: SupplierInvoiceService,
        private companySettingsService: CompanySettingsService,
        private uniFilesService: UniFilesService,
        private journalEntryService: JournalEntryService,
        private self: ElementRef
    ) {

        this.companySettingsService.Get(1, null).subscribe((companySettings) => {
            this.companySettings = companySettings;
            this.route.queryParams.subscribe(params => {
                if (params && params.fileid) {
                    this.fileIds = [...[+params.fileid]];
                } else {
                    this.router.navigateByUrl('/accounting/inbox');
                    return;
                }
                const mode = +params.mode || PaymentMode.PrepaidByEmployee;

                session.initialize(mode)
                    .finally( () => this.busy = false)
                    .subscribe( () => {
                        this.setupToolbarConfig();
                        this.setUpSaveActions();
                        this.clear();
                    });

                this.tabService.addTab({
                    name: 'NAVBAR.EXPENSE',
                    url: this.pageStateService.getUrl(),
                    moduleID: UniModules.Inbox,
                    active: true
                });
            });
        });
    }

    onFileListReady(files: Array<any>) {
        this.runConverter(files);
    }

    setupToolbarConfig() {
        this.toolbarConfig =  {
            omitFinalCrumb: true,
            title: this.getTitle()
        };
        if (this.session.payment.Mode === PaymentMode.PrepaidByEmployee) {
            this.toolbarConfig.buttons = [{
                label: 'Bokfør',
                action: () => this.save(false),
            }];
        }
    }

    setUpSaveActions() {
        if (this.session.payment.Mode === PaymentMode.PrepaidByEmployee) {
           this.saveActions = [{
                label: 'Bokfør og lag utbetaling',
                action: (done) => setTimeout(() => this.save(true).then( () => done() )), main: true, disabled: false
            }];
        } else {
            this.saveActions = [{
                label: 'Bokfør',
                action: (done) => setTimeout(() => this.save(false).then( () => done() )), main: true, disabled: false
            }];
        }
    }

    private getTitle(): string {
        return this.session.payment.Mode === PaymentMode.PrepaidByEmployee ? 'Utlegg - tilbakebetaling' : 'Kvittering - forhåndsbetalt';
    }

    ngOnInit() {
        this.clear();
    }

    public openAddFileModal() {
        this.modalService.open(FileFromInboxModal).onClose.subscribe(file => {
            if (!file) {
                return;
            }

            if (this.fileIds.some(id => id === file.ID)) {
                this.toast.addToast('Dokument ikke lagt til', ToastType.warn, 10,
                    'Dette dokumentet er allerede lagt til på dette utlegget.');
                return;
            }

            if (this.fileIds.length) {
                this.uniImage.fetchDocumentWithID(file.ID);
            } else {
                this.fileIds = [file.ID];
            }
        });
    }

    save(withPayment = false): Promise<boolean> {

        // Payment only possible with mode == PaymentMode.PrepaidByEmployee
        const createPayment = withPayment && this.session.payment.Mode === PaymentMode.PrepaidByEmployee;

        return new Promise((resolve, reject) => {

            // Validation
            this.session.recalc();
            const validation = this.session.validate(createPayment);
            if (validation.success === false) {
                this.toast.addToast(validation.messages[0], ToastType.bad, 4);
                this.focusErrorElement(validation.errField);
                resolve(false);
                return;
            }

            this.setDefaultText();

            // Ask user to confirm before saving
            this.openSummary(createPayment).then( ok => {
                if (ok) {
                    this.busy = true;
                    this.session.save(false, this.fileIds, createPayment).subscribe( x => {
                        this.showSavedJournalToast(x, createPayment);
                        resolve(true);
                    }, err => {
                        this.errorService.handle(err);
                        this.busy = false;
                        resolve(false);
                    });
                } else {
                    resolve(false);
                }
            });

        });
    }

    focusErrorElement(fieldName: string) {
        if (!fieldName) { return; }
        const name = `validate-${(fieldName.replace('.', '-'))}`;
        const list = this.self.nativeElement.getElementsByClassName(name);
        if (list && list.length > 0) {
            const inputs = list[0].getElementsByTagName('input');
            if (inputs && inputs.length) {
                inputs[0].focus();
                inputs[0].select();
            }
        }
    }

    setDefaultText() {
        let userInput = (this.session.items.length > 0 ? this.session.items[0].Description : '');
        switch (this.session.payment.Mode) {
            case PaymentMode.PrepaidByEmployee:
                userInput = userInput || `Til: ${this.session.payment.PaymentTo.AccountName}`;
                break;
            default:
                break;
        }
        this.session.payment.Description = userInput || 'Utlegg';
    }

    showSavedJournalToast(response: Array<{ JournalEntryNumber: string }>, withPayment = false) {
        const jnr = (response && response.length > 0) ? response[0].JournalEntryNumber : undefined;
        this.tabService.currentActiveTab.url = '/accounting/inbox';
        this.busy = false;
        this.modalService.open(DoneRedirectModal, {
            closeOnClickOutside: false,
            closeOnEscape: false,
            hideCloseButton: true,
            data: {
                number: jnr.split('-')[0],
                year: jnr.split('-')[1],
                journalEntryNumber: jnr,
                withPayment: withPayment
            }
        }).onClose.subscribe((url: string) => {
            this.clear();
            this.fileIds = [];
            this.uniImage.files = [];
            this.router.navigateByUrl(url, { replaceUrl: true });
        });
    }

    openSummary(withPayment = false) {
        return new Promise((resolve, reject) => {
            const xpl = this.session.convertToExpense(this.fileIds);
            if (xpl === undefined || xpl.length === 0) { resolve(false); return; }
            this.modalService.open(ExpenseSummaryModal, {
                data: {
                    session: this.session,
                    withPayment: withPayment
                }
            }).onClose.subscribe(value => {
                resolve(value);
            });
        });
    }

    clear() {
        this.session.clear();

        if (this.prepaidView) {
            this.prepaidView.clear();
        }
        this.session.payment.PaymentDate = new Date();
        this.session.items.push(new DebitCreditEntry(new Date()));
    }

    private runConverter(files: Array<any>) {

        if (this.companySettings.UseOcrInterpretation) {
            // user has accepted license/agreement for ocr
            this.runOcr(files[0]);
        } else {
            // check for undefined or null, because this is a "tristate", so null != false here,
            // false means that the user has rejected the agreement, while null means he/she has
            // neither accepted or rejected it yet
            if (this.companySettings.UseOcrInterpretation === undefined || this.companySettings.UseOcrInterpretation === null) {
                // user has not accepted license/agreement for ocr
                this.uniFilesService.getOcrStatistics().subscribe(res => {
                    const countUsed = res.CountOcrDataUsed;

                    if (countUsed <= 10) {
                        // Run 10 times for free
                        this.runOcr(files[0]);
                    } else {
                        this.companySettingsService.PostAction(1, 'ocr-trial-used').subscribe(success => {
                            // this is set through the ocr-trial-used, but set it in the local object as well to
                            // avoid displaying the same message multiple times
                            this.companySettings.UseOcrInterpretation = false;

                            this.modalService.open(UniConfirmModalV2, {
                                header: 'OCR tolkning er ikke aktivert',
                                message: 'Du har prøvd vår tjeneste for å tolke fakturaer maskinelt (OCR tolkning) 10 ganger gratis.'
                                + 'For å bruke tjenesten videre må du aktivere OCR tolkning under Innstillinger - Firmaoppsett.',
                                buttonLabels: {
                                    accept: 'Ok',
                                    cancel: 'Avbryt'
                                }
                            });
                        }, err => this.errorService.handle(err));
                    }
                }, err => this.errorService.handle(err));
            }
        }
    }

    private runOcr(file: any) {
        this.toast.addToast('OCR-scann startet', ToastType.good, 5);
        this.supplierInvoiceService.fetch(`files/${file.ID}?action=ocranalyse`).subscribe((result: IOcrServiceResult) => {
            // Need to map OCR-response to current
            const formattedResult = new OcrValuables(result);
            this.session.payment.PaymentDate = new Date(formattedResult.InvoiceDate);
            this.session.items[0].Amount = parseFloat(formattedResult.TaxInclusiveAmount);
            this.toast.clear();
            this.toast.addToast('OCR-resultater lagt til, kjører smart bokføring', ToastType.good, 5);
            if (formattedResult.Orgno) {
                this.runSmartBooking(formattedResult.Orgno);
            }

            }, (err) => {
                this.errorService.handle(err);
            });
    }

    private runSmartBooking(orgNumber) {
        this.journalEntryService.getLedgerSuggestions(orgNumber).subscribe(res => {
            if (!res || !res.Suggestion) {
                this.toastIfNoSmartBooking('Ingen bokføringsforslag funnet på denne leverandøren. Vi vil huske din neste bokføring.');
                return;
            }

            // Check for account to suggest
            if (res.Suggestion.AccountNumber > 0) {

                // Minimum percentage criteria for using suggested account number.. Should/could be set in Company settings??
                const LIMIT_PERCENTAGE = 50;

                let percent = res.Suggestion.PercentWeight || 0;
                const counter = res.Suggestion.Counter;

                if ((counter < 15 && res.Source === 3) || (counter < 20 && res.Source === 2)) {
                    percent = percent > 45 ? 45 : percent;
                }

                // If the suggestion does not meet limit criteria, dont do anything, just return..
                if (res.Source > 1 && percent < LIMIT_PERCENTAGE) {
                    this.toastIfNoSmartBooking('Fant ikke en konto som tilfredstiller kravet for smart bokføring på denne leverandøren. ' +
                    '<br/>Vi vil huske din bokføring på neste faktura fra denne leverandøren.');
                    return;
                }

                this.journalEntryService.getAccountsFromSuggeestions(res.Suggestion.AccountNumber.toString().substr(0, 3))
                .subscribe((accounts) => {
                    if (accounts.length) {
                        let match = accounts.find(acc => acc.AccountNumber === res.Suggestion.AccountNumber);
                        match = match ? match : accounts[0];

                        const msg = res.Source === 1
                            ? 'Kostnadskonto er lagt til basert på ditt firmas tidligere' +
                                ' bokføringer på faktura fra denne leverandøren.'
                            : res.Source === 2
                            ? 'Kostnadskonto er lagt til basert på bokføringer gjort på' +
                                ' denne leverandøren i UniEconomy'
                            : 'Kostnadskonto er lagt til basert på bokføringer gjort i UniEconomy' +
                                ' på levernadører i samme bransje som valgt leverandør på din faktura.';
                        this.toastIfNoSmartBooking(msg, ToastType.good, 'Smart bokføring');
                        this.session.setValue('Debet', match, 0);
                    } else {
                        this.toastIfNoSmartBooking(`Smart bokføring foreslo konto ${res.Suggestion.AccountNumber} men denne kontoen` +
                        ` (og nærliggende kontoer) mangler i din kontoplan.`);
                    }
                }, err => {
                    this.toastIfNoSmartBooking(`Noe gikk galt da smart bokføring prøvde å hente konto ${res.Suggestion.AccountNumber}`);
                });
            } else {
                this.toastIfNoSmartBooking(`Noe gikk galt da smart bokføring prøvde å hente bokføringsforslag.`);
            }
        }, err => {
            this.toastIfNoSmartBooking(`Noe gikk galt da smart bokføring prøvde å hente bokføringsforslag. ` +
            `Prøv å start den manuelt igjen i menyen oppe til høyre.`);
        });
    }

    toastIfNoSmartBooking(msg, type = ToastType.warn, header = 'Fant ikke konto med smart bokføring') {
        this.toast.clear();
        this.toast.addToast(header, type, 15, msg);
    }
}
