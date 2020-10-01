import {Component, SimpleChanges} from '@angular/core';
import {CompanySettings, BankAccount, CompanySalary, StatusCodeBankIntegrationAgreement, BankIntegrationAgreement} from '@uni-entities';
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
    PaymentBatchService
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
import { IToolbarConfig } from '@app/components/common/toolbar/toolbar';

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

    bankFields$ = new BehaviorSubject<UniFieldLayout[]>([]);
    autobankFields$ = new BehaviorSubject<UniFieldLayout[]>([]);
    remitteringFields$ = new BehaviorSubject<UniFieldLayout[]>([]);
    remitteringFields$2 = new BehaviorSubject<UniFieldLayout[]>([]);

    companySalary$ = new BehaviorSubject<CompanySalary>(null);
    companySettings$ = new BehaviorSubject<CompanySettings>(null);
    companySettings: CompanySettings;
    agreements: any[];

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
        private paymentBatchService: PaymentBatchService
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
    }

    ngOnDestroy() {
        this.bankFields$.complete();
        this.autobankFields$.complete();
        this.remitteringFields$.complete();
        this.remitteringFields$2.complete();
        this.companySalary$.complete();
        this.companySettings$.complete();
    }

    loadAccountsDataAndInit() {
        Observable.forkJoin(
            this.companySettingsService.Get(1, this.expands),
            this.companySalaryService.getCompanySalary(),
            this.statisticsService.GetAllUnwrapped(this.bankAccountQuery),
            this.paymentBatchService.checkAutoBankAgreement()
        ).subscribe(([companySettings, companySalary, accountCounts, agreements]) => {

            this.agreements = agreements;
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

    setAsDirty() {
        const cs = this.companySettings$.getValue();
        cs['_isDirty'] = true;
        this.companySettings$.next(cs);
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

            if (!companySalary['_isDirty'] && !companySettings['_isDirty']) {
                if (done) {
                    done('Ingen endringer');
                }
                res(true);
                return;
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

        return config;
    }

    private hasPendingOrder(agreement: BankIntegrationAgreement): boolean {
        if (agreement && agreement.StatusCode === StatusCodeBankIntegrationAgreement.Active) {
            return agreement.HasOrderedIntegrationChange;
        } else {
            return this.brunoOnboardingService.isPendingAgreement(agreement);
        }
    }
}
