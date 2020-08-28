import { Component, ChangeDetectorRef, ChangeDetectionStrategy, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';
import { IToolbarConfig } from '../common/toolbar/toolbar';
import { IUniSaveAction } from '../../../framework/save/save';
import { Router, ActivatedRoute } from '@angular/router';
import {
    Ticker,
    TickerGroup,
    ITickerActionOverride,
    ITickerColumnOverride
} from '../../services/common/uniTickerService';
import { TabService, UniModules } from '../layout/navbar/tabstrip/tabService';
import { UniTickerContainer } from '../uniticker/tickerContainer/tickerContainer';
import {
    UniModalService,
    UniSendPaymentModal,
    UniConfirmModalV2,
    UniAutobankAgreementModal,
    ConfirmActions,
    UniFileUploadModal,
    EntityForFileUpload,
    IModalOptions,
    UniConfirmModalWithCheckbox
} from '../../../framework/uni-modal';
import {
    UniBankListModal,
    MatchSubAccountManualModal,
    MatchMainAccountModal
} from './modals';
import { Payment, PaymentBatch, LocalDate, CompanySettings, BankIntegrationAgreement, StatusCodeBankIntegrationAgreement, File } from '../../unientities';
import { saveAs } from 'file-saver';
import { UniPaymentEditModal } from './modals/paymentEditModal';
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
    ElsaPurchaseService,
    CompanySettingsService,
    JobService,
    BrunoOnboardingService,
} from '../../services/services';
import { ToastService, ToastType, ToastTime } from '../../../framework/uniToast/toastService';
import * as moment from 'moment';
import { RequestMethod } from '@uni-framework/core/http';
import { BookPaymentManualModal } from '@app/components/common/modals/bookPaymentManual';
import { JournalingRulesModal } from '@app/components/common/modals/journaling-rules-modal/journaling-rules-modal';
import { BankInitModal } from '@app/components/common/modals/bank-init-modal/bank-init-modal';
import { MatchCustomerInvoiceManual } from '@app/components/bank/modals/matchCustomerInvoiceManual';
import { ConfirmCreditedJournalEntryWithDate } from '../common/modals/confirmCreditedJournalEntryWithDate';
import { AuthService } from '@app/authService';
import { theme, THEMES } from 'src/themes/theme';
import { FeaturePermissionService } from '@app/featurePermissionService';
import { bankRoutes } from './bankRoutes';

@Component({
    selector: 'uni-bank-component',
    template: `
        <uni-toolbar [config]="toolbarconfig" [saveactions]="actions"></uni-toolbar>
        <section class="ticker-overview">

            <section class="overview-ticker-section">
                <section *ngIf="showNoMatchInfo" class="no-match-info">
                    <a #menuTrigger="matMenuTrigger" [matMenuTriggerFor]="contextMenu">
                        Informasjon om "Betalt ingen match"
                    </a>

                    <mat-menu #contextMenu="matMenu" yPosition="below">
                        <div class="bank-ticker-info-container">
                            <h2>Innbetalinger uten match</h2>
                            <p>
                                Dette er en feilliste. Når det ligger poster her, er det viktig å behandle disse så raskt som mulig.
                                Disse postene er autobokført av programmet som innbetalinger på hovedbokskonto for bank,
                                ofte konto <strong>1920</strong>. Vi har dessverre ikke funnet hvilken kunde eller konto som innbetalingen gjelder.
                                Denne er derfor ført mot en interrimskonto, ofte konto <strong>2996</strong>.
                            </p>
                            <p>
                                Gjelder innbetalingen en kundefaktura, klikker du på de 3 prikkene til høyre, bruker funksjonen <br/>
                                <strong>"Velg faktura manuelt"</strong>, finner den riktige fakturaen og fullfører. Vet du bare hvilken kunde
                                dette gjelder, bruker du <br/> <strong>"Velg kunde manuelt</strong>. Da vil innbetalingsbilaget bli endret slik at
                                bokføringen vil gå mot riktig kunde, i stedet for mot interrimskonto og posten vil bli fjernet fra denne listen.
                            </p>
                        </div>
                    </mat-menu>
                </section>

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
export class BankComponent {

    @ViewChild(UniTickerContainer, { static: true }) public tickerContainer: UniTickerContainer;

    private rows: Array<any> = [];
    private canEdit: boolean = true;
    private agreements: any[] = [];
    private companySettings: CompanySettings;
    private isAutobankAdmin: boolean;
    hasAccessToAutobank: boolean;
    hasActiveAgreement: boolean;
    filter: string = '';
    showNoMatchInfo: boolean = false;
    failedFiles: any[] = [];
    tickerGroups: TickerGroup[];
    selectedTicker: Ticker;
    actions: IUniSaveAction[];
    toolbarconfig: IToolbarConfig = {
        title: '',
        subheads: [],
        navigation: {}
    };

    actionOverrides: Array<ITickerActionOverride> = [
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
            CheckActionIsDisabled: (selectedRow) => selectedRow.PaymentStatusCode === 44001 || selectedRow.PaymentStatusCode === 44018
        },
        {
            Code: 'download_payment_notification_file',
            ExecuteActionHandler: (selectedRows) =>
                this.downloadWithFileID(selectedRows[0], selectedRows[0].PaymentNotificationReportFileID, 'RECEIPT'),
            CheckActionIsDisabled: (selectedRow) => !selectedRow.PaymentNotificationReportFileID
        },
        {
            Code: 'download_payment_status_file',
            ExecuteActionHandler: (selectedRows) =>
                this.downloadWithFileID(selectedRows[0], selectedRows[0].PaymentStatusReportFileID, 'STATUS'),
            CheckActionIsDisabled: (selectedRow) => !selectedRow.PaymentStatusReportFileID
        },
        {
            Code: 'edit_payment',
            ExecuteActionHandler: (selectedRows) => this.editPayment(selectedRows),
            CheckActionIsDisabled: (selectedRow) => selectedRow.PaymentStatusCode !== 44001
        },
        {
            Code: 'ignore_payment',
            ExecuteActionHandler: (selectedRows) => this.updatePaymentStatusToIgnore(null, selectedRows),
            CheckActionIsDisabled: (selectedRow) => selectedRow.PaymentStatusCode === 44018
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
            ExecuteActionHandler: (selectedRows) => this.selectAccountForPayment(selectedRows, false),
            CheckActionIsDisabled: (selectedRow) => selectedRow.PaymentStatusCode !== 44018
        },
        {
            Code: 'select_supplier',
            ExecuteActionHandler: (selectedRows) => this.selectAccountForPayment(selectedRows, true),
            CheckActionIsDisabled: (selectedRow) => selectedRow.PaymentStatusCode !== 44018
        },
        {
            Code: 'select_main_account',
            ExecuteActionHandler: (selectedRows) => this.setMainAccountForPayment(selectedRows),
            CheckActionIsDisabled: (selectedRow) => selectedRow.PaymentStatusCode !== 44018
        },
        {
            Code: 'revert_batch',
            ExecuteActionHandler: (selectedRows) => this.revertBatch(selectedRows),
            CheckActionIsDisabled: (selectedRow) => selectedRow.PaymentBatchStatusCode === 45009
        },
        {
            Code: 'cancel_payment_claims',
            ExecuteActionHandler: (selectedRows) => this.cancelPaymentClaims(selectedRows),
            CheckActionIsDisabled: (selectedRow) => selectedRow.Type === 'Sletteanmodning'
        },
        {
            Code: 'set_to_paid',
            ExecuteActionHandler: (selectedRows) => this.updatePaymentStatusToPaid(null, selectedRows),
            CheckActionIsDisabled: (selectedRow) => selectedRow.PaymentStatusCode !== 44018
        },
        {
            Code: 'credit_journal_entry',
            ExecuteActionHandler: (selectedRows) => this.creditJournalEntry(selectedRows),
            CheckActionIsDisabled: (selectedRow) => selectedRow.PaymentStatusCode !== 44018 || !selectedRow.JournalEntryID
        }
    ];

    columnOverrides: ITickerColumnOverride[] = [
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
                if (row.ToBankAccountAccountNumber === this.companySettings.TaxBankAccount.AccountNumber) { return 'Forskuddstrekk'; }
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
        private featurePermissionService: FeaturePermissionService,
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
        private statisticsService: StatisticsService,
        private authService: AuthService,
        private brunoOnboardingService: BrunoOnboardingService
    ) {
        if (this.featurePermissionService.canShowUiFeature('ui.bank.journaling-rules')) {
            this.actionOverrides.push({
                Code: 'bank_rule_nomatch',
                ExecuteActionHandler: (selectedRows) => this.openJournalingRulesModalWithRule(selectedRows),
                CheckActionIsDisabled: (selectedRow) => selectedRow.PaymentStatusCode !== 44018
            });
        }

        this.isAutobankAdmin = this.authService.currentUser.IsAutobankAdmin;
        const productName = theme.theme === THEMES.SR ? 'Bank + Regnskap' : 'bankmodulen';
        // Route all test clients to contract activation, Bank is not for demo use
        this.authService.authentication$.take(1).subscribe(auth => {
            if (auth.isDemo) {
                this.toastService.toast({
                    title: `Du må ha en aktiv lisens for å ta i bruk ${productName}`,
                    type: ToastType.warn,
                    duration: 5
                });

                this.router.navigateByUrl('/contract-activation');
                return;
            } else {
                this.companySettingsService.getCompanySettings(['TaxBankAccount']).subscribe(companySettings => {
                    this.companySettings = companySettings;
                    if (theme.theme === THEMES.SR || theme.theme === THEMES.EXT02) {
                        this.paymentBatchService.checkAutoBankAgreement().subscribe((agreements) => {
                            if (theme.theme === THEMES.SR) {
                                if (agreements && agreements.length) {
                                    this.agreements = agreements;
                                    this.hasAccessToAutobank = true;
                                } else {
                                    this.modalService.open(BankInitModal, {
                                        data: { user: this.authService.currentUser, cs: this.companySettings },
                                        closeOnClickOutside: false
                                    }).onClose.subscribe((agreement: any) => {
                                        if (agreement) {
                                            this.agreements = [agreement];
                                            this.hasAccessToAutobank = true;
                                            this.initiateBank();
                                        } else {
                                            this.router.navigateByUrl('/');
                                        }
                                    });
                                }
                            } else if (theme.theme === THEMES.EXT02) {
                                this.agreements = (agreements || []).filter(agreement => agreement.IsOutgoing);
                                this.checkBrunoOnboardingState();
                                this.initiateBank();
                            }
                        }, err => {
                            this.toastService.addToast('Klarte ikke hente autobankavtaler', ToastType.bad);
                            this.router.navigateByUrl('/');
                        });
                    } else {
                        Observable.forkJoin(
                            this.fileService.GetAll('filter=StatusCode eq 20002&orderby=ID desc'),
                            this.elsaPurchasesService.getPurchaseByProductName('Autobank')
                        ).subscribe(result => {
                            this.failedFiles = result[0];
                            this.hasAccessToAutobank = !!result[1];

                            if (this.hasAccessToAutobank) {
                                this.paymentBatchService.checkAutoBankAgreement().subscribe(agreements => {
                                    this.agreements = agreements.filter(a => a.StatusCode === StatusCodeBankIntegrationAgreement.Active);
                                    this.initiateBank();
                                });
                            } else {
                                this.initiateBank();
                            }
                        }, err => {
                            this.toastService.addToast('Klarte ikke hente autobankavtaler', ToastType.bad);
                            this.router.navigateByUrl('/');
                        });
                    }
                });
            }
        });
    }

    private checkBrunoOnboardingState() {
        if (!this.toolbarconfig) {
            return;
        }

        const agreement = this.agreements && this.agreements[0];

        if (agreement) {
            // Pending agreement
            if (this.brunoOnboardingService.isPendingAgreement(agreement)) {
                this.toolbarconfig.infoBannerConfig = {
                    message: 'Du har bestilt kobling mellom regnskap og bank. Det jobbes med å sette den opp. Ble du avbrutt?',
                    link: 'Start på nytt',
                    action: () => this.brunoOnboardingService.restartOnboarding(agreement)
                };
            // Agreement has new account info
            } else if (this.brunoOnboardingService.hasNewAccountInfo(agreement)) {
                this.toolbarconfig.infoBannerConfig = {
                    message: `Vi har mottatt ny kontoinformasjon fra banken. Hjelp oss å knytte riktige kontoer til ${theme.appName}.`,
                    link: 'Sett opp kontoer her',
                    action: () => {
                        this.brunoOnboardingService.connectBankAccounts().subscribe(configurationSaved => {
                            if (configurationSaved) {
                                this.toolbarconfig.infoBannerConfig = undefined;
                                this.hasAccessToAutobank = true;
                            }
                        });
                    }
                };
            // Onboarding completed
            } else {
                this.toolbarconfig.infoBannerConfig = undefined;
                this.hasAccessToAutobank = true;
            }
        } else {
            this.toolbarconfig.infoBannerConfig = {
                message: 'Koble regnskap og bank sammen og få informasjon om inn- og utbetalinger i tillegg til å kunne betale direkte fra løsningen.',
                link: 'Trykk her for å bestille',
                action: () => {
                    this.brunoOnboardingService.createAgreement().subscribe(newAgreement => {
                        this.agreements = [newAgreement];
                        this.checkBrunoOnboardingState();
                    });
                }
            };
        }

        this.toolbarconfig = Object.assign({}, this.toolbarconfig);
        this.cdr.markForCheck();
    }

    public initiateBank() {
        this.hasActiveAgreement = this.agreements && this.agreements.length
            && this.agreements.filter((agreement: BankIntegrationAgreement) =>
                agreement.StatusCode === StatusCodeBankIntegrationAgreement.Active).length > 0;
        this.uniTickerService.getTickers().then(tickers => {
            this.tickerGroups = this.uniTickerService.getGroupedTopLevelTickers(tickers)
                .filter((group) => {
                    return group.Name === 'Bank';
                });

            this.route.queryParams.subscribe(params => {
                const tickerCode = params && params['code'];
                const ticker = tickerCode && this.tickerGroups[0].Tickers.find(t => t.Code === tickerCode);

                if (!ticker) {
                    this.navigateToTicker(this.tickerGroups[0].Tickers[0]);
                    return;
                }

                this.canEdit = !params['filter'] || params['filter'] === 'not_payed';
                this.showNoMatchInfo = params['filter'] === 'incomming_without_match';

                if (!this.selectedTicker || this.selectedTicker.Code !== ticker.Code || this.filter !== params['filter']) {
                    this.selectedTicker = ticker;
                    this.updateSaveActions(tickerCode);
                    this.toolbarconfig.title = this.selectedTicker.Name;
                    this.toolbarconfig.contextmenu = this.getContextMenu();
                    this.cdr.markForCheck();
                }
                this.updateTab();
                this.filter = params['filter'];
            });
        });
    }

    private updateTab() {
        let url = '/bank/ticker';
        const queryParams = window.location.href.split('?')[1];
        if (queryParams) {
            url += '?' + queryParams;
        }

        if (this.selectedTicker) {
            this.tabService.addTab({
                name: this.selectedTicker.Code === 'bank_list' ? 'Innbetalinger' : 'Utbetalinger',
                url: url,
                moduleID: this.selectedTicker.Code === 'bank_list' ? UniModules.Incomming : UniModules.Payment,
                active: true
            });
        }
    }

    public getContextMenu() {
        const items = [];

        if (this.selectedTicker.Code === 'bank_list'
            && this.featurePermissionService.canShowUiFeature('ui.bank.journaling-rules')
        ) {
            items.push({
                label: 'Bokføringsregler bank',
                action: () => this.openJournalingRulesModal(),
                disabled: () => false
            });
        }

        if (this.hasAccessToAutobank && (this.isAutobankAdmin || !this.agreements?.length) &&
            (this.selectedTicker.Code === 'bank_list' || this.selectedTicker.Code === 'payment_list')) {

            // Unavailable for both SR and Bruno
            if (theme.theme === THEMES.UE) {
                items.push({
                    label: 'Ny autobankavtale',
                    action: () => this.openAutobankAgreementModal(),
                    disabled: () => false
                });
            }

            // Bruno only has one agreement, and user should not be able to view/alter
            if (this.isAutobankAdmin && this.agreements?.length && theme.theme !== THEMES.EXT02) {
                items.push({
                    label: 'Mine autobankavtaler',
                    action: () => this.openAgreementsModal(),
                    disabled: () => false
                });
            }
        }

        return items;
    }

    public navigateToTicker(ticker: Ticker) {
        this.router.navigate(['/bank/ticker'], {
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
                label: 'Send alle til betaling',
                action: (done) => this.payAll(done, false),
                main: this.hasActiveAgreement && this.canEdit && !this.rows.length,
                disabled: !this.canEdit || !this.hasActiveAgreement || this.rows.length > 0
            });

            this.actions.push({
                label: 'Lag manuell betaling av alle',
                action: (done) => this.payAll(done, true),
                main: !this.hasActiveAgreement && this.canEdit && !this.rows.length,
                disabled: !this.canEdit || this.rows.length > 0
            });

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
                main: this.rows.length > 0 && !this.hasActiveAgreement,
                disabled: this.rows.length === 0 || !this.canEdit
            });

            this.actions.push({
                label: 'Send til betaling',
                action: (done) => this.pay(done, false),
                main: this.rows.length > 0 && this.canEdit,
                disabled: this.rows.length === 0 || !this.hasActiveAgreement || !this.canEdit
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
                    done();
                    this.recieptUploaded();
                },
                disabled: false
            });

            this.actions.push({
                label: 'Bokfør betaling',
                action: (done, file) => {
                    done('Status oppdatert');
                    this.updatePaymentStatusToPaidAndJournaled(done);
                },
                main: this.rows.length > 0 && (this.filter !== 'payed_not_journaled'),
                disabled: this.rows.length === 0 || (this.filter === 'payed_not_journaled')
            });

            this.actions.push({
                label: 'Endre status til bokført og betalt',
                action: (done, file) => {
                    done('Status oppdatert');
                    this.updatePaymentStatusToPaid(done);
                },
                main: this.rows.length > 0 && (this.filter === 'payed_not_journaled'),
                disabled: this.rows.length === 0
            });

            if (this.failedFiles.length && this.hasAccessToAutobank) {
                this.actions.push({
                    label: 'Se feilede filer',
                    action: (done) => {
                        done();
                        this.openFailedFilesModal();
                    },
                    disabled: false
                });
            }
            this.actions.sort((a, b) => {
                return a.disabled === b.disabled ? 0 : a.disabled ? 1 : -1;
            });

        } else if (selectedTickerCode === 'bank_list') {
            this.actions.push({
                label: 'Hent og bokfør innbetalingsfil',
                action: (done) => {
                    this.fileUploaded(done);
                },
                disabled: this.rows.length > 0 && (this.filter === 'incomming_without_match'),
                main: this.rows.length === 0 || this.filter !== 'incomming_without_match'
            });

            this.actions.push({
                label: 'Endre status til bokført og betalt',
                action: (done, file) => {
                    done('Status oppdatert');
                    this.updatePaymentStatusToPaid(done);
                },
                disabled: this.rows.length !== 1 || this.filter !== 'incomming_without_match'
            });

            this.actions.push({
                label: 'Skjul innbetalingsposter',
                action: (done, file) => {
                    done('Skjult innbetalinger');
                    this.updatePaymentStatusToIgnore(done);
                },
                disabled: this.rows.length === 0 || this.filter !== 'incomming_without_match',
                main: this.rows.length !== 0 || this.filter !== 'incomming_without_match'
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
                        .downloadXml(paymentBatch.PaymentFileID)
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
                    this.toastService.addToast('Fil ikke generert', ToastType.warn, 5, 'Fant ingen betalingsfil.');
                } else {
                    this.fileService
                        .downloadXml(paymentBatch.PaymentFileID)
                        .subscribe((blob) => {
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

    public downloadWithFileID(row: Payment, fileID: number, type: string): Promise<any> {
        return new Promise((resolve, reject) => {
            if (fileID) {
                resolve();
                this.fileService
                    .downloadXml(fileID)
                    .subscribe((blob) => {
                        const title = type === 'RECEIPT' ? 'Avregningsretur' : 'Statusretur';
                        this.toastService.addToast(`${title} hentet`, ToastType.good, 5);
                        // download file so the user can open it
                        saveAs(blob, `payments_${row.ID}_${type}.xml`);
                    },
                        err => {
                            this.errorService.handleWithMessage(err, 'Feil ved henting av fil');
                        }
                    );
            } else {
                reject('Fil ikke tilgjengelig');
            }
        });
    }

    public openJournalingRulesModalWithRule(row) {
        const rule = {
            ActionCode: 1,
            Name: 'Ny regel for innbetaling, ingen match',
            Priority: 0,
            Rule: '',
            StatusCode: 30001,
            IsActive: true
        };
        rule.Rule = `ExternalBankAccountNumber eq ${row[0].FromBankAccountAccountNumber
            || row[0].PaymentExternalBankAccountNumber} and Description eq ${row[0].PaymentDescription || ' '} and ` +
            `PaymentID eq ${row[0].PaymentPaymentID || ''} and InPaymentID eq ${row[0].PaymentInPaymentID || ''}`;

        return new Promise(() => {
            const opt = {
                data: {
                    headers: this.selectedTicker.Columns.filter(col => col.IsBankRuleField),
                    rule: rule
                }
            };
            this.modalService.open(JournalingRulesModal, opt);
        });
    }

    public openJournalingRulesModal() {
        const opt = {
            data: {
                headers: this.selectedTicker.Columns.filter(col => col.IsBankRuleField)
            }
        };
        this.modalService.open(JournalingRulesModal, opt);
    }

    public openFailedFilesModal() {
        const options: IModalOptions = {
            header: 'Feilede bankfiler',
            list: this.failedFiles,
            listkey: 'FILE'
        };
        this.modalService.open(UniBankListModal, options);
        return Promise.resolve();
    }

    public editPayment(selectedRows: any): Promise<any> {
        const row = selectedRows[0];
        return new Promise(() => {
            this.paymentService.Get(row.ID, ['BusinessRelation', 'FromBankAccount', 'ToBankAccount', 'CurrencyCode'])
                .subscribe((payment: Payment) => {
                    // show addPaymentModel
                    this.modalService.open(AddPaymentModal, {
                        data: { model: payment },
                        header: 'Endre betaling',
                        buttonLabels: { accept: 'Oppdater betaling' }
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

    public cancelPaymentClaims(selectedRows: any) {
        const ids = selectedRows.map(row => row.ID);
        return new Promise((res, rej) => {
            this.paymentService.cancelPaymentClaim(ids).subscribe((response) => {
                const errorMessages = response.filter(r => r.statusCode === 3);

                if (errorMessages.length) {
                    // This code will be implemented later when added delete on whole batches instead on just one payment
                    // const errorMessage =
                    //     (errorMessages.length !== response.length)
                    //     ? errorMessages.length + ' av ' + response.length + 'betalinger'
                    //     : (errorMessages.length === 1)
                    //     ?  'Betalingen'
                    //     : 'Alle betalingene';

                    // this.toastService.addToast('Noen kanselleringer feilet', ToastType.bad, 10,
                    // errorMessage + '  kunne ikke kanselleres. Se logg for detaljer.');
                    const errorMessage = errorMessages[0].errorMessage + ' ' + errorMessages[0].exception;
                    this.toastService.addToast('Kansellering feilet', ToastType.bad, 15, errorMessage);
                } else {
                    this.toastService.addToast('Betalinger kansellert', ToastType.good, 5);
                }

                res(errorMessages);
            }, error => {
                this.toastService.addToast('Noe gikk galt', ToastType.bad, 15,
                    'Fikk ikke kontakt med server for å kansellere betaling. Prøv igjen.');
            });
        });
    }

    public resetPayment(selectedRows: any, showModal: boolean): Promise<any> {
        const row = selectedRows[0];
        return new Promise(() => {
            this.paymentService.Get(row.ID, ['BusinessRelation', 'FromBankAccount', 'ToBankAccount', 'CurrencyCode'])
                .subscribe((payment: Payment) => {
                    const newPayment = new Payment();
                    newPayment.PaymentDate = new LocalDate();
                    newPayment.DueDate = payment.DueDate;
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
                    newPayment.CurrencyCodeID = payment.CurrencyCodeID;
                    newPayment.CurrencyCode = payment.CurrencyCode;
                    newPayment.SupplierInvoiceID = payment.SupplierInvoiceID;

                    if (showModal) {
                        // show addPaymentModel
                        this.modalService.open(AddPaymentModal, {
                            data: { model: newPayment },
                            header: 'Endre betaling',
                            buttonLabels: { accept: 'Oppdater betaling' }
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
            const modal = this.modalService.open(UniConfirmModalWithCheckbox, {
                header: 'Tilbakestille betalingsbunt',
                warning: `Viktig! Du må kun gjøre dette hvis betalingsfil er avvist fra banken eller `
                    + ` hvis betalingsfil ikke er sendt til nettbank.`,
                message: `Når filen allerede er akseptert `
                    + ` i nettbanken og du sender den igjen, vil betalingen bli utført flere ganger.`
                    + ` Vil du tilbakestille betalingsbunt med ID: ${row.ID}?`,
                checkboxLabel: 'Jeg har forstått og bekrefter at betalingsfil enten er avvist i bank eller ikke sendt.',
                closeOnClickOutside: false,
                buttonLabels: {
                    accept: 'Tilbakestill',
                    cancel: 'Avbryt'
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
                `Viktig! Betaling(er) er sendt til banken og <strong class="modwarn">må</strong> stoppes manuelt der før du kan slette betalingen.
        Hvis betalingen ikke kan stoppes manuelt, vennligst ta kontakt med banken`
                : '';
            this.isJournaled(row.ID).subscribe(res => {
                const journalEntryLine = res[0] ? res[0] : null;
                const invoiceNumber = journalEntryLine ? journalEntryLine.InvoiceNumber : null;
                const modal = this.modalService.open(UniConfirmModalWithCheckbox, {
                    header: 'Slett betaling',
                    checkboxLabel: warningMessage !== '' ? 'Jeg har forstått og kommer til å slette betaling manuelt i bank.' : '',
                    message: `Vil du slette betaling${invoiceNumber ? ' som tilhører fakturanr: ' + invoiceNumber : ''}?`,
                    warning: warningMessage,
                    closeOnClickOutside: false,
                    buttonLabels: {
                        accept: 'Slett betaling',
                        reject: journalEntryLine ? `Slett og krediter faktura` : null,
                        cancel: 'Avbryt'
                    }
                });

                modal.onClose.subscribe((result) => {
                    if (result === ConfirmActions.ACCEPT || result === ConfirmActions.REJECT) {
                        this.paymentService.Action(
                            row.ID,
                            result === ConfirmActions.REJECT ? 'force-delete-and-credit' : 'force-delete',
                            null,
                            RequestMethod.Delete
                        ).subscribe(() => {
                            this.tickerContainer.mainTicker.reloadData(); // refresh table
                            this.toastService.addToast('Betaling er slettet', ToastType.good, 3);
                        });
                    }
                });
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

    public updatePaymentStatusToIgnore(doneHandler: (status: string) => any, data: any = null) {
        return new Promise(() => {
            const rows = data || this.tickerContainer.mainTicker.table.getSelectedRows();
            if (rows.length === 0) {
                this.toastService.addToast(
                    'Ingen rader er valgt',
                    ToastType.bad,
                    10,
                    'Vennligst velg hvilke linjer du vil endre, eller kryss av for alle'
                );

                if (doneHandler) {
                    doneHandler('Oppdatering av status avbrutt');
                }
                return;
            }

            const modal = this.modalService.open(UniConfirmModalV2, {
                header: 'Skjul innbetalingsposter',
                warning: 'Det er kun innbetalingsposten som fjernes fra listen, bilaget vil ikke krediteres.',
                message: 'Ønsker du å kreditere posten, velg Krediter innbetaling på knappen til høyre i listen.',
                buttonLabels: {
                    accept: 'Ok',
                    reject: 'Avbryt'
                }
            });

            modal.onClose.subscribe((result) => {
                if (result === ConfirmActions.ACCEPT) {
                    const paymentIDs: number[] = [];
                    rows.forEach(x => {
                        paymentIDs.push(x.ID);
                    });
                    this.paymentService.updatePaymentsToIgnore(paymentIDs).subscribe(PaymentResponse => {
                        this.tickerContainer.mainTicker.reloadData();
                        this.toastService.addToast('Oppdatering av valgt betalinger er fullført', ToastType.good, 3);
                    });
                } else {
                    if (doneHandler) {
                        doneHandler('Status oppdatering avbrutt');
                    }
                    return;
                }
            });
        });
    }

    public updatePaymentStatusToPaid(doneHandler: (status: string) => any, data: any = null) {
        return new Promise(() => {
            const rows = data || this.tickerContainer.mainTicker.table.getSelectedRows();
            if (rows.length === 0) {
                this.toastService.addToast(
                    'Ingen rader er valgt',
                    ToastType.bad,
                    10,
                    'Vennligst velg hvilke linjer du vil endre, eller kryss av for alle'
                );

                if (doneHandler) {
                    doneHandler('Lagring og utbetaling avbrutt');
                }
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
                    rows.forEach(x => {
                        paymentIDs.push(x.ID);
                    });
                    this.paymentBatchService.updatePaymentsToPaid(paymentIDs).subscribe(paymentResponse => {
                        this.tickerContainer.mainTicker.reloadData(); // refresh table
                        this.toastService.addToast('Oppdatering av valgt betalinger er fullført', ToastType.good, 3);
                    });
                } else {
                    if (doneHandler) {
                        doneHandler('Status oppdatering avbrutt');
                    }
                    return;
                }
            });
        });
    }

    public bookManual(selectedRows: any) {
        return new Promise(() => {
            const row = selectedRows[0];
            const modal = this.modalService.open(BookPaymentManualModal, {
                data: { model: row }
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
                data: { model: row }
            });

            modal.onClose.subscribe((result) => {
                if (result && result.length > 0) {
                    this.customerInvoiceService.matchInvoicesManual(result, row.ID)
                        .subscribe(() => {
                            this.tickerContainer.getFilterCounts();
                            this.tickerContainer.mainTicker.reloadData();
                        }); // refresh table);
                }
            });
        });
    }

    public selectAccountForPayment(selectedRows: any, isSupplier: boolean) {
        return new Promise(() => {
            const row = selectedRows[0];
            const modal = this.modalService.open(MatchSubAccountManualModal, {
                header: isSupplier ? 'Velg leverandør manuelt' : 'Velg kunde manuelt',
                data: { model: row, isSupplier: isSupplier }
            });
            modal.onClose.subscribe((result) => {
                if (result && result.subAccountID) {
                    this.journalEntryService.PutAction(null,
                        isSupplier ? 'book-payment-against-supplier' : 'book-payment-against-customer',
                        (isSupplier ? 'supplierID=' : 'customerID=') + result.subAccountID
                        + '&paymentID=' + row.ID + '&isBalanceKID=' + result.isBalanceKID)
                        .subscribe(() => this.tickerContainer.mainTicker.reloadData()); // refresh table);
                }
            });
        });
    }

    public setMainAccountForPayment(selectedRows: any) {
        return new Promise(() => {
            const row = selectedRows[0];
            const modal = this.modalService.open(MatchMainAccountModal, {
                header: 'Velg hovedbokskonto manuelt',
                data: { model: row, interrimsAccount: this.companySettings.InterrimPaymentAccountID }
            });

            modal.onClose.subscribe(result => {
                if (result && result.accountID) {
                    this.journalEntryService.PutAction(null, 'book-payment-against-main-account',
                        'paymentID=' + row.ID + '&accountID=' + result.accountID)
                        .subscribe(() => {
                            this.tickerContainer.getFilterCounts();
                            this.tickerContainer.mainTicker.reloadData();
                        });
                }
            });
        });
    }

    public fileUploaded(done) {
        this.modalService.open(
            UniFileUploadModal,
            {
                closeOnClickOutside: false, buttonLabels: { accept: 'Bokfør valgte innbetalingsfiler' },
                data: { entity: EntityForFileUpload.BANK }
            })
            .onClose.subscribe((fileIDs) => {

                if (fileIDs && fileIDs.length) {
                    const queries = fileIDs.map(id => {
                        return this.paymentBatchService.registerAndCompleteCustomerPayment(id);
                    });

                    Observable.forkJoin(queries)
                        .subscribe((result: any) => {
                            if (result?.length) {
                                let collectionOfBatchIds = [];
                                result.forEach((res) => {
                                    if (res?.Value?.ProgressUrl) {
                                        this.toastService.addToast('Innbetalingsjobb startet', ToastType.good, 5,
                                            'Avhengig av pågang og størrelse på oppgaven kan dette ta litt tid. Vennligst sjekk igjen om litt.');
                                        done();
                                        this.paymentBatchService.waitUntilJobCompleted(res.Value.ID).subscribe(jobResponse => {
                                            if (jobResponse && !jobResponse.HasError && jobResponse.Result === null) {
                                                this.toastService.addToast('Innbetalingjobb er fullført', ToastType.good, 10,
                                                    `<a href="/#/bank/ticker?code=bank_list&filter=incomming_and_journaled">Se detaljer</a>`);
                                            } else if (jobResponse && !jobResponse.HasError && jobResponse.Result) {
                                                const paymentBatchIds = jobResponse.Result.map(paymentBatch => paymentBatch.ID);
                                                collectionOfBatchIds = collectionOfBatchIds.concat(paymentBatchIds);
                                                this.createToastWithStatus(collectionOfBatchIds);
                                            } else {
                                                this.toastService.addToast('Innbetalingsjobb feilet', ToastType.bad, 0, jobResponse.Result);
                                            }
                                        });
                                    } else if (res) {
                                        const paymentBatchIds = res.map(paymentBatch => paymentBatch.ID);
                                        collectionOfBatchIds = collectionOfBatchIds.concat(paymentBatchIds);
                                    }
                                    this.tickerContainer.getFilterCounts();
                                    this.tickerContainer.mainTicker.reloadData();
                                    done();
                                });
                                if (collectionOfBatchIds.length) {
                                    this.createToastWithStatus(collectionOfBatchIds);
                                }
                            } else {
                                done();
                            }
                        },
                            err => {
                                this.errorService.handle(err);
                                done();
                            });
                } else {
                    done();
                }
            });
    }

    private createToastWithStatus(batchIds) {
        this.getSumOfPayments(batchIds).subscribe(status => {
            this.toastService.addToast(
                'Status:',
                ToastType.good, ToastTime.long,
                `Ignorerte betalinger pga. bankregler: ${status[0].IgnoredPayments} <br>
                Bokførte betalinger: ${ status[0].JournaledPayments} <br>
                Betalinger som ikke ble bokført: ${ status[0].NonJournaledPayments}`);
        },
            err => this.errorService.handle(err));
    }

    public recieptUploaded() {
        this.modalService.open(
            UniFileUploadModal,
            { closeOnClickOutside: false, buttonLabels: { accept: 'Bokfør valgte bankfiler' }, data: { entity: EntityForFileUpload.BANK } })
            .onClose.subscribe((fileIDs) => {
                if (fileIDs && fileIDs.length) {
                    const queries = fileIDs.map(id => {
                        return this.paymentBatchService.registerReceiptFile(id);
                    });

                    Observable.forkJoin(queries).subscribe(result => {
                        this.toastService.addToast('Kvitteringsfil tolket og behandlet', ToastType.good, 10,
                            'Betalinger og bilag er oppdatert');

                        this.tickerContainer.getFilterCounts();
                        this.tickerContainer.mainTicker.reloadData();
                    }, err => {
                        this.errorService.handle(err);
                    });
                }
            });
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
        const options: IModalOptions = {
            header: 'Mine autobankavtaler',
            list: this.agreements,
            listkey: 'AGREEMENT'
        };
        this.modalService.open(UniBankListModal, options).onClose.subscribe(() => {
            this.paymentBatchService.checkAutoBankAgreement().subscribe(result => {
                this.agreements = result;
                this.toolbarconfig.contextmenu = this.getContextMenu();
            });
        });
    }

    public openAutobankAgreementModal() {
        if (!this.companySettings.OrganizationNumber) {
            const config: IModalOptions = {
                header: 'Mangler organisasjonsnummer',
                message: 'Du har ikke registrert organisasjonsnummer for din bedrift. ' +
                    'Dette må gjøres før du kan opprette en autobankavtale. Gå til firmaoppsett for å registrere organisasjonsnummer.',
                buttonLabels: {
                    accept: 'Gå til firmaoppsett',
                    cancel: 'Avbryt'
                }
            };
            this.modalService.open(UniConfirmModalV2, config).onClose.subscribe((response: ConfirmActions) => {
                if (response === ConfirmActions.ACCEPT) {
                    this.router.navigateByUrl('/settings/company');
                }
            });
            return;
        }

        this.modalService.open(UniAutobankAgreementModal, {
            data: { agreements: this.agreements },
            closeOnClickOutside: false
        }).onClose.subscribe(() => {
            this.paymentBatchService.checkAutoBankAgreement().subscribe(result => {
                this.agreements = result;
                this.toolbarconfig.contextmenu = this.getContextMenu();
            });
        });

    }

    private payAll(doneHandler: (status: string) => any, isManualPayment: boolean) {
        const count: any = this.tickerContainer.mainTicker.table.dataService.totalRowCount$.getValue();
        if (parseInt(count, 10) === 0) {
            doneHandler('Ingen betalinger i listen. Fullført uten endringer');
            this.cdr.markForCheck();
            return;
        }
        // temp workarround for ext02 until bankid is implemented
        if ((isManualPayment || (this.hasActiveAgreement && theme.theme === THEMES.EXT02)) && count) {
            this.paymentService.createPaymentBatchForAll().subscribe((result) => {
                if (result && result.ProgressUrl) {
                    // runs as hangfire job (decided by back-end)
                    this.toastService.addToast('Utbetaling startet', ToastType.good, ToastTime.long,
                        'Det opprettes en betalingsjobb og genereres en utbetalingsfil. ' +
                        'Avhengig av antall betalinger, kan dette ta litt tid. Vennligst vent.');
                    this.paymentBatchService.waitUntilJobCompleted(result.ID).subscribe(batchJobResponse => {
                        if (batchJobResponse && !batchJobResponse.HasError && batchJobResponse.Result && batchJobResponse.Result.ID > 0) {
                            if (isManualPayment) {
                                this.paymentBatchService.generatePaymentFile(batchJobResponse.Result.ID).subscribe(
                                    (startFileJob: any) => {
                                        if (startFileJob && startFileJob.Value && startFileJob.Value.ProgressUrl) {
                                            this.paymentBatchService.waitUntilJobCompleted(startFileJob.Value.ID).subscribe(
                                                fileJobResponse => {
                                                    if (fileJobResponse && !fileJobResponse.HasError && fileJobResponse.Result
                                                        && fileJobResponse.Result.ID > 0) {
                                                        return this.DownloadFile(doneHandler, fileJobResponse.Result.ID);
                                                    } else {
                                                        this.toastService.toast({
                                                            title: 'Generering av betalingsfil feilet',
                                                            type: ToastType.bad,
                                                            duration: 0,
                                                            message: fileJobResponse.Result
                                                        });

                                                        doneHandler('');
                                                    }
                                                },
                                                err => {
                                                    this.errorService.handle(err);
                                                    doneHandler('');
                                                }
                                            );
                                        } else {
                                            doneHandler('');
                                        }
                                    },
                                    err => {
                                        this.errorService.handle(err);
                                        doneHandler('');
                                    }
                                );
                            } else {
                                const body = {
                                    Code: null,
                                    Password: null
                                }; // body might be removed needs testing
                                // temp workarround sendt directly to backend until bankid is working
                                this.paymentBatchService.sendToPayment(batchJobResponse.Result.ID, body).subscribe(() => {
                                    const toastString = `Betalingsbunt med alle utbetalinger er opprettet og sendt til bank`;
                                    this.toastService.addToast('Sendt til bank', ToastType.good, 8, toastString);
                                    this.tickerContainer.getFilterCounts();
                                    this.tickerContainer.mainTicker.reloadData();
                                    doneHandler('');
                                });
                            }
                        } else {
                            this.toastService.toast({
                                title: 'Generering av betalingsbunt feilet',
                                type: ToastType.bad,
                                duration: 0,
                                message: batchJobResponse.Result
                            });
                            doneHandler('');
                        }
                    }, err => {
                        this.errorService.handle(err);
                        doneHandler('');
                    });
                } else {
                    // runs as non hangfire job
                    if (isManualPayment) {
                        this.paymentBatchService.generatePaymentFile(result.ID).subscribe(
                            (fileResult: any) => {
                                if (fileResult && fileResult.Value && fileResult.Value.ProgressUrl) {
                                    this.paymentBatchService.waitUntilJobCompleted(fileResult.Value.ID).subscribe(fileJobResponse => {
                                        if (fileJobResponse && !fileJobResponse.HasError && fileJobResponse.Result
                                            && fileJobResponse.Result.ID > 0) {
                                            return this.DownloadFile(doneHandler, fileJobResponse.Result.ID);
                                        } else {
                                            this.toastService.toast({
                                                title: 'Generering av betalingsfil feilet',
                                                type: ToastType.bad,
                                                duration: 0,
                                                message: fileJobResponse.Result
                                            });
                                            doneHandler('');
                                        }
                                    });
                                } else {
                                    return this.DownloadFile(doneHandler, fileResult.PaymentFileID);
                                }
                            },
                            err => {
                                this.errorService.handle(err);
                                doneHandler('');
                            }
                        );
                    } else {
                        const body = {
                            Code: null,
                            Password: null
                        }; // body might be removed needs testing
                        // temp workarround sendt directly to backend until bankid is working
                        this.paymentBatchService.sendToPayment(result.ID, body).subscribe(() => {
                            const toastString = `Betalingsbunt med alle utbetalinger er opprettet og sendt til bank`;
                            this.toastService.addToast('Sendt til bank', ToastType.good, 8, toastString);
                            this.tickerContainer.getFilterCounts();
                            this.tickerContainer.mainTicker.reloadData();
                            doneHandler('');
                        });
                    }
                }
            }, err => {
                this.errorService.handle(err);
                doneHandler('');
            });
        } else {
            this.modalService.open(UniSendPaymentModal, {
                closeOnClickOutside: false,
                data: { hasTwoStage: this.companySettings.TwoStageAutobankEnabled, sendAll: true, count: count }
            }).onClose.subscribe((res: boolean) => {
                if (res) {
                    this.tickerContainer.getFilterCounts();
                    this.tickerContainer.mainTicker.reloadData();
                    this.tickerContainer.mainTicker.table.clearSelection();
                    doneHandler('');
                } else {
                    doneHandler('Sending avbrutt.');
                }
            },
                err => doneHandler('Feil ved sending av autobank'));
        }
    }

    private DownloadFile(doneHandler: (status: string) => any, fileID: number) {
        this.toastService.addToast(
            'Utbetalingsfil laget, henter fil...',
            ToastType.good, 5
        );
        this.updateSaveActions(this.selectedTicker.Code);

        this.fileService
            .downloadXml(fileID)
            .subscribe((blob) => {
                doneHandler('Utbetalingsfil hentet');

                // Download file so the user can open it
                saveAs(blob, `payments_${fileID}.xml`);
                this.tickerContainer.getFilterCounts();
                this.tickerContainer.mainTicker.reloadData();
                this.tickerContainer.mainTicker.table.clearSelection();
            },
                err => {
                    doneHandler('Feil ved henting av utbetalingsfil');
                    this.errorService.handle(err);
                });
    }

    private creditJournalEntry(rows) {
        const item = rows[0];
        return new Promise((res) => {
            this.modalService.open(ConfirmCreditedJournalEntryWithDate, {
                header: `Kreditere bilag ${item.JournalEntryJournalEntryNumber}?`,
                message: 'Vil du kreditere hele dette bilaget?',
                buttonLabels: {
                    accept: 'Krediter',
                    cancel: 'Avbryt'
                },
                data: { JournalEntryID: item.JournalEntryID }
            }).onClose.subscribe(response => {
                if (response && response.action === ConfirmActions.ACCEPT) {
                    this.journalEntryService.creditJournalEntry(item.JournalEntryJournalEntryNumber)
                        .subscribe(result => {
                            if (result?.ProgressUrl) {
                                this.toastService.addToast(
                                    'Kreditering startet', ToastType.good, ToastTime.long,
                                    'Det opprettes en jobb for krediteringen av bilaget. ' +
                                    'Avhengig av antall linjer kan dette ta litt tid. Vennligst vent.'
                                );

                                this.journalEntryService.waitUntilJobCompleted(result.ID).subscribe(() => {
                                    this.displayCreditJournalEntryDoneToast();
                                },
                                err => this.errorService.handle(err)
                                );
                            } else {
                                this.displayCreditJournalEntryDoneToast();
                            }
                            res();
                        }, err => {
                            this.errorService.handle(err);
                            res();
                        });
                } else {
                    res();
                }
            });
        });
    }

    private displayCreditJournalEntryDoneToast() {
        this.toastService.addToast(
            'Kreditering utført',
            ToastType.good,
            ToastTime.short
            );

        this.tickerContainer.getFilterCounts();
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
                buttonLabels: { accept: 'Lagre og send til utbetaling', reject: 'Avbryt' }
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

    private groupBy(list, keyGetter): any {
        const map = new Map();
        list.forEach((item) => {
            const key = keyGetter(item);
            const collection = map.get(key);
            if (!collection) {
                map.set(key, [item]);
            } else {
                collection.push(item);
            }
        });
        return map;
    }

    private payInternal(selectedRows: Array<Payment>, doneHandler: (status: string) => any, isManualPayment: boolean) {
        const paymentIDs: number[] = [];
        selectedRows.forEach(x => {
            paymentIDs.push(x.ID);
        });

        // User selected manual payment or temp workarround until bankid is implemented for ext02
        if (isManualPayment || (this.hasActiveAgreement && theme.theme === THEMES.EXT02)) {
            // Create action to generate batch for n paymetns
            this.paymentService.createPaymentBatch(paymentIDs, isManualPayment)
                .subscribe((paymentBatch: PaymentBatch) => {
                    this.toastService.addToast(
                        `Betalingsbunt ${paymentBatch.ID} opprettet, genererer utbetalingsfil...`,
                        ToastType.good, 5
                    );

                    // Run action to generate paymentfile based on batch
                    if (isManualPayment) {
                        this.paymentBatchService.generatePaymentFile(paymentBatch.ID)
                            .subscribe((updatedPaymentBatch: PaymentBatch) => {
                                if (updatedPaymentBatch.PaymentFileID) {
                                    this.DownloadFile(doneHandler, updatedPaymentBatch.PaymentFileID);
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
                    } else {
                        const body = {
                            Code: null,
                            Password: null
                        }; // check if body this one can be removed
                        // temp workarround sendt directly to backend until bankid is working
                        this.paymentBatchService.sendToPayment(paymentBatch.ID, body).subscribe(() => {
                            const toastString = `Betalingsbunt med alle utbetalinger er opprettet og sendt til bank`;
                            this.toastService.addToast('Sendt til bank', ToastType.good, 8, toastString);
                            this.tickerContainer.getFilterCounts();
                            this.tickerContainer.mainTicker.reloadData();
                            this.tickerContainer.mainTicker.table.clearSelection();
                            doneHandler('');
                        });
                    }
                },
                    err => {
                        doneHandler('Feil ved opprettelse av betalingsbunt');
                        this.errorService.handle(err);
                    });

            // User clicked for autobank payment (Should only be clickable if agreements.length > 0)
        } else if (this.agreements?.length) {
            this.modalService.open(UniSendPaymentModal, {
                closeOnClickOutside: false,
                data: { PaymentIds: paymentIDs, hasTwoStage: this.companySettings.TwoStageAutobankEnabled }
            }).onClose.subscribe(res => {
                if (res) {
                    this.tickerContainer.getFilterCounts();
                    this.tickerContainer.mainTicker.reloadData();
                    this.tickerContainer.mainTicker.table.clearSelection();
                    doneHandler('');
                } else {
                    doneHandler('Sending avbrutt.');
                }
            });
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

        this.groupBy(selectedRows, payment => payment.ToBankAccountAccountNumber).forEach(paymentsGroupedByAccountNumber => {
            if (paymentsGroupedByAccountNumber.find(x => x.PaymentAmountCurrency < 0)) {
                this.groupBy(paymentsGroupedByAccountNumber, x => x.PaymentDate).forEach(paymentsGroupedByDate => {
                    let sum = 0;
                    const paymentDate = moment(paymentsGroupedByDate[0].PaymentDate).format('L');
                    const toBankAccountAccountNumber = paymentsGroupedByDate[0].ToBankAccountAccountNumber;
                    paymentsGroupedByDate.forEach(payment => {
                        sum += payment.Amount;
                    });
                    if (sum <= 0) {
                        errorMessages.push(`Det er noen rader med betalingsdato ${paymentDate}
                        til konto ${toBankAccountAccountNumber} hvor beløp ikke er større enn 0 (sum er ${sum}). Vennligst
                        endre betalingsdato på rader med minusbeløp til samme betalingsdato slik at sum blir positiv.<br><br>`);
                    }
                });
            }
        });

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
            buttonLabels: { accept: 'Slett og krediter faktura', reject: 'Slett betaling', cancel: 'Avbryt' }
        });

        modal.onClose.subscribe(result => {
            if (result === ConfirmActions.CANCEL) {
                doneHandler('Sletting avbrutt');
                return;
            }

            const paymentIDs = this.rows.map(x => x.ID);
            this.paymentService.ActionWithBody(null, paymentIDs, 'batch-delete-and-credit', RequestMethod.Put,
                result === ConfirmActions.ACCEPT ? '' : 'credit=false')
                .subscribe(res => {
                    res.forEach(x => {
                        if (x.statusCode === 3) {
                            this.toastService.addToast(x.errorMessage, ToastType.bad);
                        }
                    });
                    doneHandler('Betalinger slettet');
                    // Refresh data after save
                    this.tickerContainer.mainTicker.reloadData();
                }, (err) => {
                    doneHandler('Feil ved sletting av data');
                    this.errorService.handle(err);
                });
        });
    }

    private isJournaled(paymentID: number): Observable<any> {
        return this.statisticsService.GetAllUnwrapped(`model=Tracelink`
            + `&select=JournalEntryLine.ID as ID,JournalEntryLine.InvoiceNumber as InvoiceNumber`
            + `&filter=SourceEntityName eq 'SupplierInvoice' and `
            + `DestinationEntityName eq 'Payment' and Payment.ID eq ${paymentID} and Account.UsePostPost eq 1`
            + `&join=Tracelink.DestinationInstanceID eq Payment.ID and Tracelink.SourceInstanceID eq SupplierInvoice.ID `
            + `and SupplierInvoice.JournalEntryID eq JournalEntryLine.JournalEntryID and JournalEntryLine.AccountID eq Account.ID`);
    }

    private getSumOfPayments(paymentBatchIds: any[]): Observable<any> {
        const filter = 'paymentBatchId eq ' + paymentBatchIds.join(' or ID eq ');
        return this.statisticsService.GetAllUnwrapped(
            `model=payment&select=sum(casewhen((Payment.StatusCode%20eq%20%2744020%27)%5C,1%5C,0))`
            + `%20as%20IgnoredPayments,sum(casewhen((Payment.StatusCode%20ne%20%2744020%27%20and%20`
            + `Payment.AutoJournal%20eq%20%27true%27)%5C,1%5C,0))%20as%20JournaledPayments,sum(`
            + `casewhen((Payment.StatusCode%20ne%20%2744020%27%20and%20Payment.AutoJournal%`
            + `20eq%20%27false%27)%5C,1%5C,0))%20as%20NonJournaledPayments&filter=${filter}`);
    }
}
