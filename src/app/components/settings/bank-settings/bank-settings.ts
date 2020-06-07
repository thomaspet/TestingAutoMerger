import {Component, SimpleChanges} from '@angular/core';
import {CompanySettings, BankAccount, CompanySalary} from '@uni-entities';
import {UniSearchAccountConfig} from '@app/services/common/uniSearchConfig/uniSearchAccountConfig';
import {CompanySettingsService, AccountService, CompanySalaryService, ErrorService} from '@app/services/services';
import {TabService, UniModules} from '@app/components/layout/navbar/tabstrip/tabService';
import {FieldType, UniFieldLayout} from '../../../../framework/ui/uniform/index';
import {THEMES, theme} from 'src/themes/theme';
import {Observable, BehaviorSubject} from 'rxjs';
import {
    UniBankAccountModal,
    UniModalService,
    ConfirmActions
} from '@uni-framework/uni-modal';

@Component({
    selector: 'bank-settings',
    templateUrl: 'bank-settings.html'
})

export class UniBankSettings {

    isSrEnvironment = theme.theme === THEMES.SR;
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
    accountFields$ = new BehaviorSubject<UniFieldLayout[]>([]);
    autobankFields$ = new BehaviorSubject<UniFieldLayout[]>([]);
    remitteringFields$ = new BehaviorSubject<UniFieldLayout[]>([]);
    remitteringFields$2 = new BehaviorSubject<UniFieldLayout[]>([]);

    companySalary$ = new BehaviorSubject<CompanySalary>(null);
    companySettings$ = new BehaviorSubject<CompanySettings>(null);

    bankAccounts: any[] = [];
    saveActions: any[] = [
        {
            label: 'Lagre innstillinger',
            action: done => this.saveCompanySettings(done),
            main: true,
            disabled: false
        },
    ];

    constructor(
        private uniSearchAccountConfig: UniSearchAccountConfig,
        private companySettingsService: CompanySettingsService,
        private companySalaryService: CompanySalaryService,
        private modalService: UniModalService,
        private accountService: AccountService,
        private errorService: ErrorService,
        private tabService: TabService
    ) {}

    ngOnInit() {
        this.loadAccountsDataAndInit();
        this.tabService.addTab({
            name: 'Innstillinger - Bank',
            url: 'settings/bank',
            moduleID: UniModules.SubSettings,
            active: true
       });
    }

    ngOnDestroy() {
        this.bankFields$.complete();
        this.accountFields$.complete();
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
        ).subscribe(([companySettings, companySalary]) => {
            this.companySettings$.next(companySettings);
            this.companySalary$.next(companySalary);
            this.hideBankValues = !companySettings.UsePaymentBankValues;
            this.hideXtraPaymentOrgXmlTagValue = !companySettings.UseXtraPaymentOrgXmlTag;

            this.bankAccounts = [].concat(companySettings.BankAccounts);

            this.createFormFields();
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
                    companySettings.CompanyBankAccount.BankAccountType = 'companySettings';
                }
                companySettings.BankAccounts = companySettings.BankAccounts.filter(x => x !== companySettings.CompanyBankAccount);
            }

            if (companySettings.TaxBankAccount) {
                if (!companySettings.TaxBankAccount.ID) {
                    companySettings.TaxBankAccount['_createguid'] = this.companySettingsService.getNewGuid();
                    companySettings.TaxBankAccount.BankAccountType = 'bankaccount';
                }
                companySettings.BankAccounts = companySettings.BankAccounts.filter(x => x !== companySettings.TaxBankAccount);
            }

            if (companySettings.SalaryBankAccount) {
                if (!companySettings.SalaryBankAccount.ID) {
                    companySettings.SalaryBankAccount['_createguid'] = this.companySettingsService.getNewGuid();
                    companySettings.SalaryBankAccount.BankAccountType = 'salarybank';
                }
                companySettings.BankAccounts = companySettings.BankAccounts.filter(x => x !== companySettings.SalaryBankAccount);
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

        this.accountFields$.next([
            <any>{
                EntityType: 'CompanySettings',
                Property: 'CompanyBankAccount',
                FieldType: FieldType.MULTIVALUE,
                Label: 'Driftskonto',
                Options: this.getBankAccountOptions('CompanyBankAccount', 'company')
            },
            {
                EntityType: 'CompanySettings',
                Property: 'TaxBankAccount',
                FieldType: FieldType.MULTIVALUE,
                Label: 'Skattetrekkskonto',
                Options: this.getBankAccountOptions('TaxBankAccount', 'tax')
            },
            {
                EntityType: 'CompanySettings',
                Property: 'SalaryBankAccount',
                FieldType: FieldType.MULTIVALUE,
                Label: 'Lønnskonto',
                Options: this.getBankAccountOptions('SalaryBankAccount', 'salary')
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
                Label: 'Bokfør kun utbetalinger fra UE'
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

    private getBankAccountOptions(storeResultInProperty: string, bankAccountType: string) {
        const modalConfig: any = {
            ledgerAccountVisible: true,
            defaultAccountNumber: bankAccountType === 'company' ? 1920 : bankAccountType === 'tax' ? 1950 : null,
        };

        if (this.isSrEnvironment) {
            modalConfig.BICLock = {
                BIC:  'SPRONO22',
                BankName: 'SpareBank 1 SR-Bank'
            };
        }

        return {
            entity: BankAccount,
            listProperty: 'BankAccounts',
            displayValue: 'AccountNumber',
            linkProperty: 'ID',
            storeResultInProperty: storeResultInProperty,
            storeIdInProperty: storeResultInProperty + 'ID',
            editor: (bankaccount: BankAccount) => {
                if (!bankaccount || bankaccount.ID <= 0) {
                    bankaccount = bankaccount || new BankAccount();
                    bankaccount['_createguid'] = this.companySettingsService.getNewGuid();
                    bankaccount.BankAccountType = bankAccountType;
                    bankaccount.CompanySettingsID = this.companySettings$.getValue().ID;
                    bankaccount.ID = 0;
                }

                const modal = this.modalService.open(UniBankAccountModal, {
                    data: bankaccount,
                    modalConfig: modalConfig,
                    closeOnClickOutside: false
                });

                return modal.onClose.take(1).toPromise();
            }
        };
    }
}
