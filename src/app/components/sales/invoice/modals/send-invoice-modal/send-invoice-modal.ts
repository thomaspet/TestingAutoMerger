import {Component, EventEmitter} from '@angular/core';
import {IModalOptions, IUniModal, ConfirmActions} from '@uni-framework/uni-modal/interfaces';
import {CustomerInvoice, DistributionPlan, CompanySettings, SharingType, StatusCodeSharing, DistributionPlanElement} from '@app/unientities';
import {map, catchError, finalize, filter, tap, concatMap} from 'rxjs/operators';
import {forkJoin, of as observableOf, Observable, combineLatest} from 'rxjs';
import {UniModalService} from '@uni-framework/uni-modal';
import {TofEmailModal} from '@uni-framework/uni-modal/modals/tof-email-modal/tof-email-modal';
import {ReportTypeEnum} from '@app/models';
import {Router} from '@angular/router';
import {ToastService, ToastType} from '@uni-framework/uniToast/toastService';
import {
    ErrorService,
    CompanySettingsService,
    EHFService,
    ReportService,
    CustomerInvoiceService,
    StatisticsService,
    DistributionPlanService,
    EmailService,
    ElsaPurchaseService
} from '@app/services/services';
import {TofReportModal} from '@app/components/sales/common/tof-report-modal/tof-report-modal';
import {ElementType} from '@app/models/distribution';
import * as moment from 'moment';

interface SendingOption {
    label: string;
    tooltip?: string;
    small?: string;
    action: () => void;
    type: ElementType;
}

@Component({
    selector: 'send-invoice-modal',
    templateUrl: './send-invoice-modal.html',
    styleUrls: ['./send-invoice-modal.sass']
})
export class SendInvoiceModal implements IUniModal {
    options: IModalOptions = {};
    onClose = new EventEmitter();

    busy: boolean;
    invoice: CustomerInvoice;
    previousSharings: any[];
    companySettings: CompanySettings;

    sendingOptions: SendingOption[] = [
        { label: 'Send på epost', action: () => this.sendEmail(), type: ElementType.Email },
        { label: 'Skriv ut', action: () => this.print(), type: ElementType.Print }
    ];

    selectedOption = this.sendingOptions[0];
    journalEntryUrl = '';
    constructor(
        private distributionPlanService: DistributionPlanService,
        private router: Router,
        private modalService: UniModalService,
        private errorService: ErrorService,
        private toastService: ToastService,
        private reportService: ReportService,
        private statisticsService: StatisticsService,
        private companySettingsService: CompanySettingsService,
        private invoiceService: CustomerInvoiceService,
        private ehfService: EHFService,
        private emailService: EmailService,
        private elsaPurchaseService: ElsaPurchaseService,
    ) {}

    public ngOnInit() {
        this.busy = true;
        this.invoice = this.options.data;
        this.journalEntryUrl = this.buildJournalEntryNumberUrl(this.invoice.JournalEntry.JournalEntryNumber);
        this.sendingOptions = [
            { label: 'Send på epost', action: () => this.sendEmail(), type: ElementType.Email },
            { label: 'Skriv ut', action: () => this.print(), type: ElementType.Print }
        ];

        // Might be added back later. Same with runDistributionPlan(), which is only used here.

        /* if (this.invoice.DistributionPlanID) {
            this.distributionPlanService.Get(
                this.invoice.DistributionPlanID, ['Elements.ElementType']
            ).subscribe(
                (plan: DistributionPlan) => {
                    let planDetails = '';

                    if (plan && plan.Elements) {
                        if (plan.Elements.length === 1) {
                            planDetails = `(${plan.Elements[0].ElementType.Name})`;
                        } else {
                            const steps = plan.Elements.map(el => `${el.Priority}. ${el.ElementType.Name}`);
                            planDetails = `(${steps.join(' ')})`;
                        }
                    }

                    this.sendingOptions.unshift({
                        label: 'Valgt utsendingsplan',
                        small: planDetails,
                        action: () => this.runDistributionPlan()
                    });

                    this.selectedOption = this.sendingOptions[0];
                },
                err => {
                    console.error(err);
                    this.sendingOptions.unshift({
                        label: 'Valgt utsendingsplan',
                        action: () => this.runDistributionPlan()
                    });
                }

            );
        } */

        this.selectedOption = this.sendingOptions[0];

        const previousSharingsQuery = `model=Sharing`
            + `&filter=EntityType eq 'CustomerInvoice' and EntityID eq ${this.invoice.ID}`
            + `&select=ID,Type,StatusCode,ExternalMessage,UpdatedAt,CreatedAt,To`;

        forkJoin(
            this.statisticsService.GetAllUnwrapped(previousSharingsQuery),
            this.companySettingsService.Get(1, ['DefaultAddress', 'APOutgoing', 'CompanyBankAccount']),
            this.elsaPurchaseService.getPurchaseByProductName('EHF_OUT'),
            this.invoice.DistributionPlanID
                ? this.distributionPlanService.Get(this.invoice.DistributionPlanID, ['Elements.ElementType'])
                : Observable.of(null)
        ).subscribe(
            res => {
                this.previousSharings = res[0] || [];
                this.companySettings = res[1];
                const hasPurchasedEhfOut = !!res[2];
                this.canSendEHF(hasPurchasedEhfOut).subscribe(canSendEHF => {
                    if (canSendEHF) {
                        this.sendingOptions.push({
                            label: 'Send EHF',
                            action: () => this.sendEHF(),
                            type: ElementType.EHF
                        });

                        if (!this.invoice.DistributionPlanID) {
                            this.selectedOption = this.sendingOptions[this.sendingOptions.length - 1];
                        }
                    }
                });

                var plan = res[3];

                if (plan) {
                    this.sendingOptions = [];

                    Observable.from(plan.Elements.sort(el => el.Priority)).pipe(
                        concatMap((el: DistributionPlanElement) => { // combine flag if allowed and element
                            let allowed = this.canUseThisElement(el.ElementType.ID, hasPurchasedEhfOut);                          
                            return combineLatest(allowed, Observable.of(el));
                        }),
                        filter(([allow, _]: [boolean, DistributionPlanElement]) => allow), // only keep allowed
                        tap(([_, el]) => { // add element to options
                            this.addSendingOptionForElementType(el.ElementType.ID);
                        }),
                        finalize(() => { // add default alternatives if missing
                            this.addDefaultSendingOptionsIfMissing();
                            this.selectedOption = this.sendingOptions[0];
                            this.busy = false;    
                        })
                    ).subscribe();
                }
                else
                {
                    this.busy = false;
                }
            },
            () => this.busy = false
        );
    }

    addDefaultSendingOptionsIfMissing() {
        if (!this.sendingOptions.find(opt => opt.type === ElementType.Email)) {
            this.addSendingOptionForElementType(ElementType.Email);
        }

        if (!this.sendingOptions.find(opt => opt.type === ElementType.Print)) {
            this.addSendingOptionForElementType(ElementType.Print);
        }
    }

    addSendingOptionForElementType(elementType: ElementType)
    {
        this.sendingOptions.push(
            {
                label: `${this.distributionPlanService.getElementTypeText(elementType)}`,
                action: this.createActionForElementType(elementType),
                type: elementType
            }
        );
    }

    createActionForElementType(elementType: ElementType) {
        let action = null;
        let label = this.distributionPlanService.getElementTypeText(elementType);
        let name = this.distributionPlanService.getElementName(elementType);

        switch (elementType) {
            case ElementType.Print:
                action = () => this.print();
                break;
            case ElementType.EHF:
                action = () => this.sendEHF();
                break;
            case ElementType.Email:
                action = () => this.sendEmail();
                break;
            default:
                action = () => this.sendElementWithType(name, label);
                break;
        }

        return action;
    }

    runSelectedOption() {
        if (this.selectedOption) {
            this.busy = true;
            this.selectedOption.action();
        }
    }

    getSharingText(sharing) {
        switch (sharing.SharingType) {
            case SharingType.Unknown:
                return 'Sending via utsendingsplan';
            case SharingType.Print:
                return 'Skrevet ut';
            case SharingType.Email:
                return `Sendt på epost til ${sharing.SharingTo}`;
            case SharingType.AP:
                return 'Sending via aksesspunkt/EHF';
            case SharingType.Vipps:
                return `Sending via Vipps faktura til ${sharing.sharingTo}`;
            case SharingType.Export:
                return 'Eksportert';
            case SharingType.InvoicePrint:
                return 'Fakturaprint (fra Nets)';
            case SharingType.Efaktura:
                return 'Sending via eFaktura';
            case SharingType.Avtalegiro:
                return 'Sending via avtalegiro';
            case SharingType.Factoring:
                return 'Factoring';
        }
    }

    getSharingStatus(sharing) {
        switch (sharing.SharingStatusCode) {
            case StatusCodeSharing.Pending:
            case StatusCodeSharing.InProgress:
                return 'Planlagt / i kø';
            // return 'Behandles';
            case StatusCodeSharing.Completed:
                return 'Fullført';
            case StatusCodeSharing.Cancelled:
                return 'Avbrutt';
            case StatusCodeSharing.Failed:
                return 'Feilet';
        }
    }

    //
    // Section allowed to use elementtype
    //

    private canUseThisElement(elementType: ElementType, hasPurchasedEhfOut: boolean) {
        switch (elementType) {
            case ElementType.EHF:
                return this.canSendEHF(hasPurchasedEhfOut);
            case ElementType.Invoiceprint:
                return this.canSendInvoicePrint();
            case ElementType.Vipps:
                return this.canSendVippsinvoice();
            case ElementType.AvtaleGiro:
                return this.canSendAvtaleGiro();
            case ElementType.AvtaleGiroEfaktura:
                return this.canSendAvtaleGiroEfaktura();
            case ElementType.Efaktura:
                return this.canSendEfaktura();
            case ElementType.Factoring:
                return this.canSendFactoring();
            default:
                return Observable.of(true);
        }
    }

    private canSendFactoring() {
        return Observable.of(this.companySettings.FactoringNumber > 0
            && this.companySettings.Factoring > 0
            && this.invoice.Customer.FactoringNumber > 0);
    }

    private canSendAvtaleGiro() {
        return Observable.of(this.invoice.Customer.AvtaleGiro 
            && this.invoice.PaymentID
            && (this.invoice.EmailAddress || !this.invoice.Customer.AvtaleGiroNotification));
    }

    private canSendEfaktura() {
        return Observable.of(this.invoice.TaxInclusiveAmount >= 0
            && this.companySettings.NetsIntegrationActivated
            && this.invoice.Customer.EInvoiceAgreementReference
            && this.invoice.Customer.EfakturaIdentifier);
    }

    private canSendAvtaleGiroEfaktura() {
        return combineLatest(this.canSendAvtaleGiro(), this.canSendEfaktura())
            .mergeMap(([avtaleGiro, eFaktura]) => Observable.of(avtaleGiro && eFaktura));
    }

    private canSendVippsinvoice() {
        let then = this.invoice.PaymentDueDate != null
            ? moment(this.invoice.PaymentDueDate)
            : moment().add(72, 'hours');

        var diffHours = then.diff(moment(), 'hours');
        var diffDays = then.diff(moment(), 'days');

        if (diffHours <= 72 || diffDays >= 365
            || !this.companySettings.CompanyBankAccount?.AccountNumber
            || (!this.invoice.Customer?.Info?.DefaultPhone && !((this.invoice.Customer?.Info?.Phones || []).length > 0))) {
            return Observable.of(false);
        }
   
        return Observable.of(true);
    }

    private canSendInvoicePrint() {
        const invoicePrintActive = this.ehfService.isInvoicePrintActivated(this.companySettings);
        return Observable.of(invoicePrintActive);
    }

    private canSendEHF(hasPurchasedEhfOut: boolean) {
        const ehfActive = this.ehfService.isEHFOutActivated(this.companySettings);
        const peppoladdress = this.invoice.Customer.PeppolAddress
            || '0192:' + this.invoice.Customer.OrgNumber;

        if ((ehfActive || hasPurchasedEhfOut) && peppoladdress) {
            const params = `peppoladdress=${peppoladdress}&entitytype=CustomerInvoice`;
            return this.ehfService.GetAction(null, 'is-ehf-receiver', params).pipe(
                catchError(() => observableOf(false)),
                map(canSend => !!canSend)
            );
        } else {
            return observableOf(false);
        }
    }

    //
    // End section
    //

    private print() {
        this.modalService.open(TofReportModal, {
            header: 'Skriv ut faktura',
            data: {
                entityLabel: 'Faktura',
                entityType: 'CustomerInvoice',
                entity: this.invoice,
                reportType: ReportTypeEnum.INVOICE,
                hideEmailButton: true,
                skipConfigurationGoStraightToAction: 'print'
            }
        }).onClose.subscribe(selectedAction => {
            if (selectedAction === 'print') {
                this.invoiceService.setPrintStatus(this.invoice.ID, '200').subscribe();
                this.onClose.emit();
            }
            this.busy = false;
        });
    }

    private sendEmail() {
        this.modalService.open(TofEmailModal, {
            data: {
                entity: this.invoice,
                entityType: 'CustomerInvoice',
                reportType: ReportTypeEnum.INVOICE
            }
        }).onClose.subscribe(emailSentTo => {
            if (emailSentTo) {
                this.onClose.emit(emailSentTo);
            }
            this.busy = false;
        });
    }

    /* private runDistributionPlan() {
        if (moment(this.invoice.InvoiceDate).isAfter(moment(), 'days')) {
            const invoiceDate = moment(this.invoice.InvoiceDate).format('DD.MM.YYYY');
            const dialogMessage = `Fakturadato er satt til ${invoiceDate}. `
                + ` Ønsker du å sende den med en gang, eller legge inn automatisk sending på fakturadato?`;

            this.modalService.confirm({
                header: 'Sende nå eller frem i tid?',
                message: dialogMessage,
                buttonLabels: {
                    accept: 'Send nå',
                    reject: 'Send på fakturadato',
                    cancel: 'Avbryt'
                }
            }).onClose.subscribe(response => {
                if (response === ConfirmActions.CANCEL) {
                    return;
                }

                const distributionRequest = response === ConfirmActions.ACCEPT
                    ? this.reportService.distribute(this.invoice.ID, 'Models.Sales.CustomerInvoice')
                    : this.reportService.distributeWithDate(this.invoice.ID, 'Models.Sales.CustomerInvoice', this.invoice.InvoiceDate);

                this.busy = true;
                distributionRequest.subscribe(
                    () => {
                        this.toastService.toast({
                            title: (this.invoice.InvoiceType === 1 ? 'Kreditnota' : 'Faktura') + ' er lagt i utsendingskø',
                            type: ToastType.good,
                            duration: 5
                        });

                        this.onClose.emit();
                    },
                    err => {
                        this.errorService.handle(err);
                        this.busy = false;
                    }
                );
            });
        } else {
            this.busy = true;
            this.reportService.distribute(
                this.invoice.ID, 'Models.Sales.CustomerInvoice'
            ).subscribe(
                () => {
                    this.toastService.toast({
                        title: (this.invoice.InvoiceType === 1 ? 'Kreditnota' : 'Faktura') + ' er lagt i utsendingskø',
                        type: ToastType.good,
                        duration: 5
                    });

                    this.onClose.emit();
                },
                err => {
                    this.errorService.handle(err);
                    this.busy = false;
                }
            );
        }
    } */

    private sendElementWithType(name: string, label: string) {
        this.reportService.distributeWithType(
            this.invoice.ID, 'Models.Sales.CustomerInvoice', name
        ).subscribe(
            () => {
                this.toastService.toast({
                    title: (this.invoice.InvoiceType === 1 ? 'Kreditnota' : 'Faktura') + ` er lagt i kø for ${label} utsendelse`,
                    type: ToastType.good,
                    duration: 5,
                });

                this.onClose.emit();
            },
            err => {
                this.errorService.handle(err);
                this.busy = false;
            }
        );
    }

    private sendEHF() {
        if (this.companySettings.DefaultAddress && this.companySettings.DefaultAddress.AddressLine1) {
            let shouldSendEhf = observableOf(true);

            if (this.invoice.PrintStatus === 300) {
                shouldSendEhf = this.modalService.confirm({
                    header: 'Bekreft EHF sending',
                    message: 'Vil du sende EHF på nytt?',
                    buttonLabels: {
                        accept: 'Send',
                        cancel: 'Avbryt'
                    }
                }).onClose.pipe(map(res => res === ConfirmActions.ACCEPT));
            }

            shouldSendEhf.subscribe(send => {
                if (!send) {
                    this.busy = false;
                    return;
                }

                this.reportService.distributeWithType(
                    this.invoice.ID, 'Models.Sales.CustomerInvoice', 'EHF'
                ).subscribe(
                    () => {
                        // TODO: Do we have to update printStatus?
                        // this.invoice.PrintStatus = 300;
                        this.toastService.toast({
                            title: (this.invoice.InvoiceType === 1 ? 'Kreditnota' : 'Faktura') + ' er lagt i kø for EHF-utsendelse',
                            type: ToastType.good,
                            duration: 5,
                        });

                        this.onClose.emit();
                    },
                    err => {
                        this.errorService.handle(err);
                        this.busy = false;
                    }
                );
            });
        } else {
            this.modalService.confirm({
                header: 'Ditt firma mangler adresse',
                message: 'Vil du gå til firmainnstillinger og fylle ut dette nå?',
                buttonLabels: {
                    accept: 'Ja',
                    cancel: 'Nei'
                }
            }).onClose.subscribe(response => {
                if (response === ConfirmActions.ACCEPT) {
                    this.router.navigate(['/settings/company']);
                    this.onClose.emit();
                } else {
                    this.busy = false;
                }
            });
        }
    }

    private buildJournalEntryNumberUrl(journalEntryNumber: string) {
        const numberAndYear = journalEntryNumber.split('-');
        let url: string = `/#/accounting/transquery?JournalEntryNumber=${numberAndYear[0]}&AccountYear=`;
        if (numberAndYear.length > 1) {
            url += numberAndYear[1];
        } else {
            url += this.invoice.InvoiceDate ? moment(this.invoice.InvoiceDate).year() : moment().year();
        }
        return url;
    }
}
