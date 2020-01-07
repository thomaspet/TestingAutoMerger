import {Component, Input, Output, ViewChild, EventEmitter} from '@angular/core';
import {MatStepper} from '@angular/material';
import {forkJoin, BehaviorSubject} from 'rxjs';
import {CompanySettings, Address, Email, BankAccount, CompanySalary} from '../../../../app/unientities';
import {FieldType} from '@uni-framework/ui/uniform/index';
import {UniBankAccountModal} from '@uni-framework/uni-modal/modals/bankAccountModal';
import {UniModalService} from '../../modalService';
import {IModalOptions, IUniModal} from '@uni-framework/uni-modal/interfaces';
import {
    CompanySettingsService,
    CompanySalaryService,
    CompanyVacationRateService,
    PeriodSeriesService,
    DistributionPlanService,
    AccountService
} from '@app/services/services';

enum SETTINGS_STEPS {
    CompanyAndAccounting = 0,
    Accounting = 1,
    BankAndAltinn = 2,
    Salary = 3,
    Complete = 4
}

@Component({
    selector: 'wizard-settings-modal',
    templateUrl: './wizard-settings-modal.html',
    styleUrls: ['./wizard-settings-modal.sass']
})
export class WizardSettingsModal implements IUniModal {

    @ViewChild(MatStepper, { static: false })
    stepper: MatStepper;

    @Input()
    options: IModalOptions = {};

    @Output()
    onClose: EventEmitter<any> = new EventEmitter();

    fields$: BehaviorSubject<any[]> = new BehaviorSubject([]);
    accountingFields$: BehaviorSubject<any[]> = new BehaviorSubject([]);
    accountSettings$: BehaviorSubject<CompanySettings> = new BehaviorSubject(null);

    steps = SETTINGS_STEPS;
    stepValidator = [
        { hasStep: true, isValid: false },
        { hasStep: true, isValid: false },
        { hasStep: true, isValid: false },
        { hasStep: true, isValid: false }
    ];
    busy = false;
    errorMessage: string = '';
    currentStep = SETTINGS_STEPS.CompanyAndAccounting;
    lastStep = SETTINGS_STEPS.Complete;
    companyLimitReached: boolean;
    distributionTypes: any[] = [];
    isOrgNumberValid = true;
    initiated: boolean = false;
    showCloseWhenError: boolean = false;
    companySettings: CompanySettings;
    companySalary: any = {};
    vacationRates: any;
    periodSeries: any;
    defaultCompanyAccount: any;
    defaultTaxAccount: any;

    constructor(
        private companySettingsService: CompanySettingsService,
        private companySalaryService: CompanySalaryService,
        private companyVacationRateService: CompanyVacationRateService,
        private modalService: UniModalService,
        private periodeSeriesService: PeriodSeriesService,
        private distributionPlanService: DistributionPlanService,
        private accountService: AccountService
    ) { }

    ngOnInit() {
        this.busy = true;
        forkJoin(
            this.companySettingsService.Get(1, [
                'BankAccounts',
                'DefaultAddress',
                'DefaultEmail',
                'CompanyBankAccount',
                'TaxBankAccount',
                'SalaryBankAccount'
            ]),
            this.companyVacationRateService.getCurrentRates(new Date().getFullYear() - 4),
            this.periodeSeriesService.GetAll(null),
            this.companySalaryService.getCompanySalary(),
            this.distributionPlanService.getElementTypes(),
            this.accountService.searchAccounts('AccountNumber eq 1920', 1),
            this.accountService.searchAccounts('AccountNumber eq 1950', 1)
        ).subscribe(([settings, vaycay, periodes, salary, types, companyAccount, taxAccount]) => {
            this.companySettings = settings;
            this.vacationRates = vaycay;
            this.periodSeries = periodes;
            this.companySalary = salary || {};
            this.distributionTypes = types.slice(0, 4);
            this.defaultCompanyAccount = companyAccount[0];
            this.defaultTaxAccount = taxAccount[0];

            // Uniform setup
            this.accountSettings$.next(settings);
            this.fields$.next(this.getFields());
            this.accountingFields$.next(this.getAccountingFields());


            if (!this.companySettings.DefaultAddress)  {
                this.companySettings.DefaultAddress = new Address();
                this.companySettings.DefaultAddress._createguid = this.companySettingsService.getNewGuid();
            }

            if (!this.companySettings.DefaultEmail)  {
                this.companySettings.DefaultEmail = new Email();
                this.companySettings.DefaultEmail._createguid = this.companySettingsService.getNewGuid();
            }

            this.initiated = true;
            this.busy = false;
        });
    }

    public previous() {
        this.currentStep--;
            setTimeout(() => {
                this.stepper.previous();
                this.errorMessage = '';
            });
    }

    public next() {
        if (this.canMove()) {
            this.currentStep++;
            setTimeout(() => {
                this.stepper.next();
            });
        }
    }

    public canMove(): boolean {
        this.errorMessage = '';
        if (this.currentStep === SETTINGS_STEPS.CompanyAndAccounting) {
            if  (!!this.companySettings.CompanyName
                && !!this.companySettings.DefaultAddress.AddressLine1
                && !!this.companySettings.DefaultEmail.EmailAddress) {
                this.stepValidator[SETTINGS_STEPS.CompanyAndAccounting].isValid = true;
                return true;
            }
        } else if (this.currentStep === SETTINGS_STEPS.Accounting) {
            if (!!this.companySettings.PeriodSeriesAccountID
                && !!this.companySettings.PeriodSeriesVatID
                && !!this.companySettings.TaxMandatoryType
            ) {
                this.stepValidator[SETTINGS_STEPS.Accounting].isValid = true;
                return true;
            }
        } else if (this.currentStep === SETTINGS_STEPS.Salary) {
            if (this.vacationRates.Rate && parseFloat(this.vacationRates.Rate) < 100 && parseFloat(this.vacationRates.Rate) >= 10.2) {
                this.stepValidator[SETTINGS_STEPS.Salary].isValid = true;
                return true;
            } else {
                this.errorMessage = 'Feriepengesats må være mellom 10.2% og 100%. Har du skrevet feil?';
                this.stepValidator[SETTINGS_STEPS.Salary].isValid = false;
                return false;
            }
        } else if (this.currentStep === SETTINGS_STEPS.BankAndAltinn) {
            this.stepValidator[SETTINGS_STEPS.BankAndAltinn].isValid = true;
            return true;
        }

        this.stepValidator[this.currentStep].isValid = false;
        this.errorMessage = 'Alle feltene med * er påkrevd. Sjekk at info stemmer.';
        return false;
    }

    close() {
        this.onClose.emit();
    }

    private getFields() {
        return [
            {
                EntityType: 'CompanySettings',
                Property: 'CompanyBankAccount',
                FieldType: FieldType.MULTIVALUE,
                Label: 'Driftskonto',
                Options: this.getBankAccountOptions('CompanyBankAccount', 'company'), // 1920
                Classes: 'wizard-labels-small'
            },
            {
                EntityType: 'CompanySettings',
                Property: 'TaxBankAccount',
                FieldType: FieldType.MULTIVALUE,
                Label: 'Skattetrekkskonto',
                Options: this.getBankAccountOptions('TaxBankAccount', 'tax'), // 1950
                Classes: 'wizard-labels-small'
            },
            {
                EntityType: 'CompanySettings',
                Property: 'SalaryBankAccount',
                FieldType: FieldType.MULTIVALUE,
                Label: 'Lønnskonto',
                Tooltip: {
                    Text: 'Dersom lønnskonto ikke er fylt ut vil lønn bruke driftskonto ved utbetaling'
                },
                Options: this.getBankAccountOptions('SalaryBankAccount', 'salary'),
                Classes: 'wizard-labels-small'
            },
        ];
    }

    private getAccountingFields() {
        return [
            {
                EntityType: 'CompanySettings',
                Property: 'PeriodSeriesAccountID',
                FieldType: FieldType.DROPDOWN,
                Label: 'Regnskapsperioder',
                Classes: 'wizard-labels-small',
                Options: {
                    source: this.periodSeries.filter((value) => value.SeriesType.toString() === '1'),
                    valueProperty: 'ID',
                    displayProperty: 'Name',
                    debounceTime: 200,
                    ReadOnly: true,
                    hideDeleteButton: true
                }
            },
            {
                EntityType: 'CompanySettings',
                Property: 'TaxMandatoryType',
                FieldType: FieldType.DROPDOWN,
                Label: 'Mva-pliktig',
                Classes: 'wizard-labels-small',
                Options: {
                    source: [
                        {
                            ID: 1,
                            Name: 'Avgiftsfri'
                        }, {
                            ID: 2,
                            Name: 'Avgiftsfri, men planlegger mva-registrering når omsetningsgrensen passeres'
                        }, {
                            ID: 3,
                            Name: 'Avgiftspliktig'
                        }
                    ],
                    valueProperty: 'ID',
                    displayProperty: 'Name',
                    debounceTime: 200,
                    hideDeleteButton: true
                }
            },
            {
                EntityType: 'CompanySettings',
                Property: 'PeriodSeriesVatID',
                FieldType: FieldType.DROPDOWN,
                Label: 'Mva perioder',
                Classes: 'wizard-labels-small',
                Options: {
                    source: this.periodSeries.filter((value) => value.SeriesType.toString() === '0'),
                    valueProperty: 'ID',
                    displayProperty: 'Name',
                    debounceTime: 200,
                    ReadOnly: true,
                    hideDeleteButton: true
                }
            },
        ];
    }

    private getBankAccountOptions(storeResultInProperty, bankAccountType) {
        return {
            entity: BankAccount,
            listProperty: 'BankAccounts',
            displayValue: 'AccountNumber',
            linkProperty: 'ID',
            storeResultInProperty: storeResultInProperty,
            storeIdInProperty: storeResultInProperty + 'ID',
            editor: (bankaccount: BankAccount) => {
                if (!bankaccount || !bankaccount.ID) {
                    bankaccount = bankaccount || new BankAccount();
                    bankaccount['_createguid'] = this.companySettingsService.getNewGuid();
                    bankaccount.BankAccountType = bankAccountType;
                    bankaccount.CompanySettingsID = this.companySettings.ID;
                    bankaccount.ID = 0;
                    switch (bankAccountType) {
                        case 'company':
                            bankaccount.Account = !bankaccount.Account ? this.defaultCompanyAccount : bankaccount.Account;
                            bankaccount.AccountID = !bankaccount.AccountID ? this.defaultCompanyAccount.ID : bankaccount.AccountID;
                            break;

                        case 'tax':
                            bankaccount.Account = !bankaccount.Account ? this.defaultTaxAccount : bankaccount.Account;
                            bankaccount.AccountID = !bankaccount.AccountID ? this.defaultTaxAccount.ID : bankaccount.AccountID;
                            break;

                        default:
                            break;
                    }
                }

                const modal = this.modalService.open(UniBankAccountModal, {
                    data: bankaccount,
                    modalConfig: {
                        ledgerAccountVisible: true
                    },
                    closeOnClickOutside: false
                });

                return modal.onClose.take(1).toPromise();
            }
        };
    }

    public saveSettings() {

        if (!this.canMove()) {
            return;
        }

        this.errorMessage = '';
        this.busy = true;
        const accountsSettingsObject = this.accountSettings$.getValue();
        this.mapAccounts(accountsSettingsObject);

        this.companySettings.BankAccounts = [];

        const queries = [
            this.companySettingsService.Put(1, this.companySettings),
            this.companySalaryService.Put(this.companySalary.ID, this.companySalary)
        ];
        if (this.vacationRates.Rate !== 10.2) {
            if (!this.vacationRates.ID) {
                queries.push(this.companyVacationRateService.Post(this.vacationRates));
            } else {
                queries.push(this.companyVacationRateService.Put(this.vacationRates.ID, this.vacationRates));
            }
        }
        forkJoin(queries).subscribe((result) => {
            this.busy = false;
            this.stepValidator[3].isValid = true;
            this.currentStep++;
            setTimeout(() => {
                this.stepper.next();
            });
        }, (err) => {
            this.busy = false;
            this.showCloseWhenError = true;
            this.errorMessage =
                'Kan ikke lagre innstillinger. Noe kan ha gått galt ved oppretting. Du kan endre dette i innstillingsbildet senere';
        });
    }

    mapAccounts(acc: any) {
        // From accounting
        this.companySettings.PeriodSeriesAccountID = acc.PeriodSeriesAccountID;
        this.companySettings.PeriodSeriesVatID = acc.PeriodSeriesVatID;
        this.companySettings.TaxMandatoryType = acc.TaxMandatoryType;

        // From bank
        this.companySettings.CompanyBankAccount = acc.CompanyBankAccount;
        this.companySettings.CompanyBankAccountID = acc.CompanyBankAccountID;

        this.companySettings.TaxBankAccount = acc.TaxBankAccount;
        this.companySettings.TaxBankAccountID = acc.TaxBankAccountID;

        this.companySettings.SalaryBankAccount = acc.SalaryBankAccount;
        this.companySettings.SalaryBankAccountID = acc.SalaryBankAccountID;
    }
}
