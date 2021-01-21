import {Component, SimpleChanges} from '@angular/core';
import {CompanySettings, CompanySalary, StatusCodeBankIntegrationAgreement, BankIntegrationAgreement} from '@uni-entities';
import {UniSearchAccountConfig} from '@app/services/common/uniSearchConfig/uniSearchAccountConfig';
import {
    CompanySettingsService,
    AccountService,
    CompanySalaryService,
    ErrorService,
    PageStateService,
    StatisticsService,
    BankService,
    BrunoOnboardingService,
    PaymentBatchService,
    UserRoleService
} from '@app/services/services';
import {TabService, UniModules} from '@app/components/layout/navbar/tabstrip/tabService';
import {FieldType, UniFieldLayout} from '../../../../framework/ui/uniform/index';
import {THEMES, theme} from 'src/themes/theme';
import {Observable, BehaviorSubject} from 'rxjs';
import {
    UniModalService,
    ConfirmActions
} from '@uni-framework/uni-modal';
import { IUniTab } from '@uni-framework/uni-tabs';
import { ActivatedRoute } from '@angular/router';
import { FeaturePermissionService } from '@app/featurePermissionService';
import { IContextMenuItem, IToolbarConfig } from '@app/components/common/toolbar/toolbar';
import { ToastService, ToastType } from '@uni-framework/uniToast/toastService';
import { BrunoBankOffboardingModal } from '@uni-framework/uni-modal/modals/bruno-bank-offboarding-modal/bruno-bank-offboarding-modal';
import {AuthService} from '@app/authService';

interface RGBValues {
    rgb: boolean;
    status: string;
}

enum ServiceProvider {
    ZData = 1,
    Bruno = 2,
    Mock = 3,
    ZDataV3 = 4
}

@Component({
    selector: 'bank-settings',
    templateUrl: 'bank-settings.html'
})

export class UniBankSettings {

    isSrEnvironment = theme.theme === THEMES.SR;
    isExt02Environment = theme.theme === THEMES.EXT02;
    showRemAccounts: boolean = true;
    dataLoaded: boolean = false;
    hideBankValues: boolean = false;
    hideXtraPaymentOrgXmlTagValue: boolean = false;
    isBankAdmin: boolean = false;
    isRGBDirty: boolean = false;
    expands: string[] = [
        'CompanyBankAccount',
        'TaxBankAccount',
        'SalaryBankAccount',
        'BankChargeAccount',
        'InterrimPaymentAccount',
        'InterrimRemitAccount',
        'InterrimRemitAccount',
        'BankAccounts.Bank',
        'BankAccounts.Account',
    ];
    RGBValues: RGBValues = {
        rgb:  false,
        status: ''
    };

    RGBFields$ = new BehaviorSubject<UniFieldLayout[]>([]);
    bankFields$ = new BehaviorSubject<UniFieldLayout[]>([]);
    autobankFields$ = new BehaviorSubject<UniFieldLayout[]>([]);
    remitteringFields$ = new BehaviorSubject<UniFieldLayout[]>([]);
    remitteringFields$2 = new BehaviorSubject<UniFieldLayout[]>([]);

    companySalary$ = new BehaviorSubject<CompanySalary>(null);
    companySettings$ = new BehaviorSubject<CompanySettings>(null);
    RGB$ = new BehaviorSubject<RGBValues>(null);
    companySettings: CompanySettings;
    agreements: any[];
    serviceProvider: ServiceProvider;
    isPreApprovedPaymentsServiceProvider: boolean = false;

    activeIndex: number = 0;
    tabs: IUniTab[] = [
        {name: 'Bankkontoer'},
        {name: 'Bankinnstillinger'}
    ];
    bankAccountQuery = 'model=BankAccount&filter=CompanySettingsID eq 1&join=BankAccount.ID eq Payment.FromBankAccountID&select=ID as ID,count(Payment.ID) as count';

    saveActions: any[] = [
        {
            label: 'Lagre innstillinger',
            action: done => this.saveCompanySettings(done),
            main: true,
            disabled: false
        },
    ];

    public contextMenuItems: IContextMenuItem[] = [];
    toolbarconfig: IToolbarConfig;

    constructor(
        private uniSearchAccountConfig: UniSearchAccountConfig,
        private companySettingsService: CompanySettingsService,
        private companySalaryService: CompanySalaryService,
        private modalService: UniModalService,
        private accountService: AccountService,
        private errorService: ErrorService,
        private tabService: TabService,
        private route: ActivatedRoute,
        private pageStateService: PageStateService,
        private statisticsService: StatisticsService,
        private bankService: BankService,
        private featurePermissionService: FeaturePermissionService,
        private brunoOnboardingService: BrunoOnboardingService,
        private paymentBatchService: PaymentBatchService,
        private toast: ToastService,
        private authService: AuthService,
        private userRoleService: UserRoleService
    ) {}

    ngOnInit() {
        this.showRemAccounts = !(this.isExt02Environment) || this.featurePermissionService.canShowUiFeature('ui.accountsettings.interrimaccounts');
        this.route.queryParams.subscribe(params => {
            const index = +params['index'];
            if (!isNaN(index) && index >= 0 && index < this.tabs.length) {
                this.activeIndex = index;
            }
            this.loadAccountsDataAndInit();
            this.updateTabAndUrl();
        });

        const currentUser = this.authService.currentUser;
        this.userRoleService.getRolesByUserID(currentUser.ID).subscribe(res => {
            res.forEach(role => {
                if (role.SharedRoleName === 'Bank.Admin') {
                    this.isBankAdmin = true;
                }
            });
        });
    }

    ngOnDestroy() {
        this.RGBFields$.complete();
        this.bankFields$.complete();
        this.autobankFields$.complete();
        this.remitteringFields$.complete();
        this.remitteringFields$2.complete();
        this.companySalary$.complete();
        this.companySettings$.complete();
        this.RGB$.complete();
    }

    loadAccountsDataAndInit() {
        Observable.forkJoin(
            this.companySettingsService.Get(1, this.expands),
            this.companySalaryService.getCompanySalary(),
            this.statisticsService.GetAllUnwrapped(this.bankAccountQuery),
            this.paymentBatchService.checkAutoBankAgreement()
        ).subscribe(([companySettings, companySalary, accountCounts, agreements]) => {

            this.agreements = agreements;
            this.setRGBValues(agreements);
            this.RGB$.next(this.RGBValues);
            this.serviceProvider = agreements[0]?.ServiceProvider;
            this.isPreApprovedPaymentsServiceProvider = this.serviceProvider === ServiceProvider.Bruno
                                    || this.serviceProvider === ServiceProvider.ZDataV3;

            companySettings.BankAccounts.map(account => this.bankService.mapBankIntegrationValues(account, agreements));

            // This should always be ordered the same way..
            accountCounts.forEach((account, index) => {
                const bankAccount = companySettings.BankAccounts.find(a => a.ID === account.ID);
                if (bankAccount) {
                    bankAccount['_count'] = account.count;
                }
            });

            this.companySettings = companySettings;
            this.companySettings$.next(companySettings);
            this.companySalary$.next(companySalary);
            this.hideBankValues = !companySettings.UsePaymentBankValues;
            this.hideXtraPaymentOrgXmlTagValue = !companySettings.UseXtraPaymentOrgXmlTag;

            this.createFormFields();
            this.toolbarconfig = this.getToolbarConfig();
        });
    }

    updateTabAndUrl() {
        this.pageStateService.setPageState('index', this.activeIndex + '');
        this.tabService.addTab({
            name: 'Innstillinger - Bank',
            url: this.pageStateService.getUrl(),
            moduleID: UniModules.SubSettings,
            active: true
       });
    }

    setRGBValues(agreements: any[]) {
        const preApprovedBankPayments = agreements[0]?.PreApprovedBankPayments;

        this.RGBValues.rgb = preApprovedBankPayments === 700003 || preApprovedBankPayments === 700005;

        if (preApprovedBankPayments !== null) {
            switch (preApprovedBankPayments) {
                case 700003: {
                    this.RGBValues.status = 'Venter på godkjenning';
                    break;
                }
                case 700005: {
                    this.RGBValues.status = 'Aktiv';
                    break;
                }
            }
        }
    }

    setAsDirty() {
        const cs = this.companySettings$.getValue();
        cs['_isDirty'] = true;
        this.companySettings$.next(cs);
    }

    setRGBAsDirty() {
        this.isRGBDirty = true;
    }

    setCompanySalaryAsDirty() {
        const cs = this.companySalary$.getValue();
        cs['_isDirty'] = true;
        this.companySalary$.next(cs);
    }

    saveCompanySettings(done?) {

        const companySettings = this.companySettings$.getValue();
        const companySalary = this.companySalary$.getValue();

        return new Promise(res => {
            if (!companySettings.CompanyBankAccountID && !companySettings.CompanyBankAccount) {
                if (done) {
                    done('Lagring avbrutt! Driftskonto må være angitt');
                }
                res(false);
                return;
            }

            if (!companySalary['_isDirty'] && !companySettings['_isDirty'] && !this.isRGBDirty) {
                if (done) {
                    done('Ingen endringer');
                }
                res(true);
                return;
            }

            if (this.isRGBDirty) {
                this.orderRGB();
            }

            // Clean up accounts
            if (companySettings.CompanyBankAccount) {
                if (!companySettings.CompanyBankAccount.ID) {
                    companySettings.CompanyBankAccount['_createguid'] = this.companySettingsService.getNewGuid();
                    companySettings.CompanyBankAccount.BankAccountType = 'company';
                }
                companySettings.BankAccounts = companySettings.BankAccounts.filter(x => x !== companySettings.CompanyBankAccount);
            }

            if (companySettings.TaxBankAccount) {
                if (!companySettings.TaxBankAccount.ID) {
                    companySettings.TaxBankAccount['_createguid'] = this.companySettingsService.getNewGuid();
                    companySettings.TaxBankAccount.BankAccountType = 'tax';
                }
                companySettings.BankAccounts = companySettings.BankAccounts.filter(x => x !== companySettings.TaxBankAccount);
            }

            if (companySettings.SalaryBankAccount) {
                if (!companySettings.SalaryBankAccount.ID) {
                    companySettings.SalaryBankAccount['_createguid'] = this.companySettingsService.getNewGuid();
                    companySettings.SalaryBankAccount.BankAccountType = 'salary';
                }

                companySettings.BankAccounts = companySettings.BankAccounts.filter(x => x !== companySettings.SalaryBankAccount);
            }

            if (companySettings.SalaryBankAccountID) {
                companySettings.SalaryBankAccount = null;
            }

            if (companySettings.TaxBankAccountID) {
                companySettings.TaxBankAccount = null;
            }

            if (companySettings.CompanyBankAccountID) {
                companySettings.CompanyBankAccount = null;
            }


            if (companySettings.BankChargeAccountID) {
                companySettings.BankChargeAccount = null;
            }

            const saveObs = [];

            if (companySettings['_isDirty']) {
                saveObs.push(this.companySettingsService.Put(companySettings.ID, companySettings));
            }

            if (companySalary['_isDirty']) {
                saveObs.push(this.companySalaryService.Put(companySalary.ID, companySalary));
            }

            Observable.forkJoin(saveObs).subscribe((response) => {
                if (done) {
                    done('Bankinnstillinger lagret');
                    this.loadAccountsDataAndInit();
                }
                res(true);
            }, err => {
                this.errorService.handle(err);
                if (done) {
                    done('Lagring feilet. Sjekk at info stemmer, eller last inn siden på nytt og prøv igjen.');
                }
                res(false);
            });
        });
    }

    orderRGB() {
        const rgbValues = this.RGB$.getValue();
        const bankID = this.agreements[0]?.BankAccount?.BankID;
        const userID = this.authService.currentUser?.BankIntegrationUserName;

        // Box is checked, order RGB
        if (rgbValues.rgb && rgbValues.status === '') {
            if (this.isExt02Environment) {
                let url = 'https://www.dnb.no/bedrift/konto-kort-og-betaling/betaling/logginn-rgb-etterbestilling.html?erp=DNBRegnskap&utbetalingerval=true&rgb=etterbestill';

                if (userID) {
                    url += '&userid=' + userID;
                }

                window.open(url);

                this.updatePreApprovedBankPaymentStatus(false);
            }
            this.bankService.orderPreApprovedBankPayments(bankID).subscribe();

        } else if (!rgbValues.rgb && rgbValues.status !== '') {
            // Cancell RGB at ZData, to be implemented
            // this.bankService.orderPreApprovedBankPayments(bankID, true);

            if (this.isExt02Environment) {
                let url = 'https://www.dnb.no/bedrift/konto-kort-og-betaling/betaling/logginn-rgb-etterbestilling.html?erp=DNBRegnskap&utbetalingerval=true&rgb=etterbestill';

                if (userID) {
                    url += '&userid=' + userID;
                }
                window.open(url);

                this.updatePreApprovedBankPaymentStatus(true);
            }
        }
        this.isRGBDirty = false;
    }

    private updatePreApprovedBankPaymentStatus(cancel: boolean) {
        const agreement = this.agreements[0];
        agreement.PreApprovedBankPayments = cancel ? 700000 : 700003;

        this.bankService.updateBankIntegrationAgreement(agreement.ID, agreement).subscribe();
    }

    canDeactivate(): boolean | Observable<boolean> {
        if ((!this.companySalary$.getValue() || !this.companySettings$.getValue())
        || (!this.companySalary$.getValue()['_isDirty'] && !this.companySettings$.getValue()['_isDirty'])) {
            return true;
        }

        const modalOptions = {
            header: 'Ulagrede endringer',
            message: 'Du har endringer i innstillingene som ikke er lagret. Ønsker du å lagre disse før du fortsetter?',
            buttonLabels: {
                accept: 'Lagre',
                reject: 'Forkast',
                cancel: 'Avbryt'
            }
        };

        return this.modalService.confirm(modalOptions).onClose.switchMap(confirm => {
            if (confirm === ConfirmActions.ACCEPT) {
                return this.saveCompanySettings().then(res => true).catch(res => false);
            }
            return Observable.of(confirm !== ConfirmActions.CANCEL);
        });
    }

    onAutobankFormChange(changes: SimpleChanges) {
        const obj = this.companySettings$.getValue();
        if (changes['UseXtraPaymentOrgXmlTag']) {
            this.hideXtraPaymentOrgXmlTagValue = !changes['UseXtraPaymentOrgXmlTag'].currentValue;
            this.autobankFields$.next(this.autobankFields$.getValue().map((item) => {
                if (item.Property === 'XtraPaymentOrgXmlTagValue') {
                    item.Hidden = this.hideXtraPaymentOrgXmlTagValue;
                }
                return item;
            }));

            // If Nordea bank is activated while DNB bank is activated
            if (obj.UseXtraPaymentOrgXmlTag && obj['UsePaymentBankValues']) {
                obj.UsePaymentBankValues = false;
                this.hideBankValues = true;
                this.autobankFields$.next(this.autobankFields$.getValue().map((item) => {
                    if (item.Property === 'PaymentBankAgreementNumber' || item.Property === 'PaymentBankIdentification') {
                        item.Hidden = this.hideBankValues;
                    }
                    return item;
                }));
            }
        }

        if (changes['UsePaymentBankValues']) {
            this.hideBankValues = !changes['UsePaymentBankValues'].currentValue;
            this.autobankFields$.next(this.autobankFields$.getValue().map((item) => {
                if (item.Property === 'PaymentBankAgreementNumber' || item.Property === 'PaymentBankIdentification') {
                    item.Hidden = this.hideBankValues;
                }
                return item;
            }));

            // If DNB bank is activated while Nordea bank is activated
            if (obj.UseXtraPaymentOrgXmlTag && obj['UsePaymentBankValues']) {
                obj.UseXtraPaymentOrgXmlTag = false;
                this.hideXtraPaymentOrgXmlTagValue = true;
                this.autobankFields$.next(this.autobankFields$.getValue().map((item) => {
                    if (item.Property === 'XtraPaymentOrgXmlTagValue') {
                        item.Hidden = this.hideXtraPaymentOrgXmlTagValue;
                    }
                    return item;
                }));
            }
        }
        obj['_isDirty'] = true;
        this.companySettings$.next(obj);
    }

    createFormFields() {
        this.RGBFields$.next([
            <any>{
                EntityType: 'RGBValues',
                Property: 'rgb',
                FieldType: FieldType.CHECKBOX,
                Label: 'Regnskapsgodkjente betalinger',
                Hidden: !this.isBankAdmin && this.serviceProvider !== ServiceProvider.Bruno
            },
            {
                EntityType: 'RGBValues',
                Property: 'status',
                FieldType: FieldType.STATIC_TEXT,
                Label: 'Status:',
                Hidden: this.RGBValues.status === ''
            },
            {
                EntityType: 'RGBValues',
                FieldType: FieldType.STATIC_TEXT,
                Label: 'Kun Bank-Admin rollen kan aktivere eller slå av regnskapsgodkjente betalinger.',
                Hidden: this.isBankAdmin || this.serviceProvider === ServiceProvider.Bruno
            }
        ]);
        this.bankFields$.next([
            <any>{
                EntityType: 'CompanySettings',
                Property: 'AcceptableDelta4CustomerPayment',
                FieldType: FieldType.NUMERIC,
                Label: 'Akseptabelt differanse-beløp ved innbetaling'
            },
            {
                EntityType: 'CompanySettings',
                Property: 'BankChargeAccountID',
                FieldType: FieldType.UNI_SEARCH,
                Label: 'Konto for bankgebyr',
                Options: {
                    uniSearchConfig: this.uniSearchAccountConfig.generateOnlyMainAccountsConfig(),
                    valueProperty: 'ID'
                }
            },
            {
                EntityType: 'CompanySettings',
                Property: 'OnlyJournalMatchedPayments',
                FieldType: FieldType.CHECKBOX,
                Label: 'Bokfør kun innbetalinger som matcher'
            }
        ]);

        this.autobankFields$.next([
            <any>{
                EntityType: 'CompanySettings',
                Property: 'UsePaymentBankValues',
                FieldType: FieldType.CHECKBOX,
                Label: 'Betaling fra Nordea',
                Hidden: this.isSrEnvironment
            },
            {
                EntityType: 'CompanySettings',
                Property: 'PaymentBankIdentification',
                FieldType: FieldType.TEXT,
                Label: 'Nordea signer id',
                Hidden: this.hideBankValues || this.isSrEnvironment,
            },
            {
                EntityType: 'CompanySettings',
                Property: 'PaymentBankAgreementNumber',
                FieldType: FieldType.TEXT,
                Label: 'Nordea avtalenummer',
                Hidden: this.hideBankValues || this.isSrEnvironment
            },
            {
                EntityType: 'CompanySettings',
                Property: 'UseXtraPaymentOrgXmlTag',
                FieldType: FieldType.CHECKBOX,
                Label: 'Betaling fra DnB konto',
                Hidden: this.isSrEnvironment
            },
            {
                EntityType: 'CompanySettings',
                Property: 'XtraPaymentOrgXmlTagValue',
                FieldType: FieldType.TEXT,
                Label: 'Divisjonskode DNB',
                Hidden: this.hideXtraPaymentOrgXmlTagValue || this.isSrEnvironment
            },
            {
                EntityType: 'CompanySettings',
                Property: 'IgnorePaymentsWithoutEndToEndID',
                FieldType: FieldType.CHECKBOX,
                Label: 'SETTINGS.BOOK_FROM_SYSTEM'
            }
        ]);

        this.remitteringFields$.next([
            <any>{
                EntityType: 'CompanySettings',
                Label: 'Mellomkonto innbetaling',
                Property: 'InterrimPaymentAccountID',
                FieldType: FieldType.UNI_SEARCH,
                Options: {
                    valueProperty: 'ID',
                    source: model => this.accountService
                        .GetAll(`filter=ID eq ${model.InterrimPaymentAccountID}`)
                        .map(results => results[0])
                        .catch((err, obs) => this.errorService.handleRxCatch(err, obs)),
                    uniSearchConfig: this.uniSearchAccountConfig.generateOnlyMainAccountsConfig()
                }
            },
            {
                EntityType: 'CompanySettings',
                Label: 'Mellomkonto utbetaling',
                Property: 'InterrimRemitAccountID',
                FieldType: FieldType.UNI_SEARCH,
                Options: {
                    valueProperty: 'ID',
                    source: model => this.accountService
                        .GetAll(`filter=ID eq ${model.InterrimRemitAccountID}`)
                        .map(results => results[0])
                        .catch((err, obs) => this.errorService.handleRxCatch(err, obs)),
                    uniSearchConfig: this.uniSearchAccountConfig.generateOnlyMainAccountsConfig()
                }
            },
        ]);

        this.remitteringFields$2.next([
            <any>{
                EntityType: 'CompanySalary',
                Label: 'Mellomkonto lønn',
                Property: 'InterrimRemitAccount',
                FieldType: FieldType.UNI_SEARCH,
                Options: {
                    valueProperty: 'AccountNumber',
                    source: model => this.accountService
                        .GetAll(`filter=AccountNumber eq ${model.InterrimRemitAccount}`)
                        .map(results => results[0])
                        .catch((err, obs) => this.errorService.handleRxCatch(err, obs)),
                    uniSearchConfig: this.uniSearchAccountConfig.generateOnlyMainAccountsConfig()
                }
            }
        ]);
    }

    public onOrderedIntegrationChange() {
        this.toolbarconfig = this.getToolbarConfig();
    }

    private getToolbarConfig(): IToolbarConfig {
        let config: IToolbarConfig;

        config = {
            title: 'SETTINGS.BANK',
            saveactions: this.saveActions
        };

        this.brunoOnboardingService.getAgreement().subscribe((agreement) => {
            config.infoBannerConfig = !this.hasPendingOrder(agreement) ? null : {
                message: this.brunoOnboardingService.isActiveAgreement(agreement) ?
                    'Du endret kobling mellom regnskap og bank. Det jobbes med å sette det opp. Ble du avbrutt?' :
                    'Du har bestilt kobling mellom regnskap og bank. Det jobbes med å sette den opp. Ble du avbrutt?',
                link: 'Start på nytt',
                action: () => {
                    // If the agreement is already active, the user is requesting a change in the agreement
                    if (this.brunoOnboardingService.isActiveAgreement(agreement)) {
                        this.brunoOnboardingService.RequestBankintegrationChange(agreement).subscribe((orderedIntegration) => {
                            if (orderedIntegration) {
                                this.toolbarconfig = this.getToolbarConfig();
                            }
                        });
                    } else {
                        // In case this is the initial agreement request that is pending
                        this.brunoOnboardingService.restartOnboarding(agreement);
                    }
                }
            };
        });

        // Only show context menu when in ext02 environment
        if (theme.theme === THEMES.EXT02) {
            config.contextmenu = [
                {
                    label: this.companySettings.HasAutobank ? 'Avslutt kobling mot bank' : 'Bestill kobling mot bank',
                    action: () => this.companySettings.HasAutobank ?
                        this.cancelBrunoIntegration() : this.startBrunoOnboarding(),
                    disabled: () => false
                }
            ];
        }

        return config;
    }

    cancelBrunoIntegration() {
        this.brunoOnboardingService.cancelBankIntegration(null, false, BrunoBankOffboardingModal).subscribe((bankAccounts) => {
            if (bankAccounts) {
                this.loadAccountsDataAndInit();
                this.toast.addToast('Koblingen mot bank er oppdatert', ToastType.good, 5);
            }
        });
    }

    private startBrunoOnboarding() {
        this.brunoOnboardingService.getAgreement().subscribe((agreement: BankIntegrationAgreement) => {
            if (!agreement) {
                this.brunoOnboardingService.createAgreement().subscribe((pendingAgreement) => {
                    this.agreements[0] = pendingAgreement;
                });
            } else if (this.brunoOnboardingService.isPendingAgreement(agreement)) {
                this.brunoOnboardingService.restartOnboarding(agreement).subscribe((pendingAgreement) => {
                    this.agreements[0] = agreement;
                });
            }
        });
    }

    private hasPendingOrder(agreement: BankIntegrationAgreement): boolean {
        if (agreement && agreement.StatusCode === StatusCodeBankIntegrationAgreement.Active) {
            return agreement.HasOrderedIntegrationChange;
        } else {
            return this.brunoOnboardingService.isPendingAgreement(agreement);
        }
    }
}
