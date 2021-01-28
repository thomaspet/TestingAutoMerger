import {Component, Input, Output, EventEmitter, OnInit} from '@angular/core';
import {IModalOptions, IUniModal, UniModalService, UniBankAccountModal} from '@uni-framework/uni-modal';
import {ToastService, ToastTime, ToastType} from '@uni-framework/uniToast/toastService';
import {
    CompanySettingsService,
    BankService,
    ElsaPurchaseService,
    ElsaProductService,
    ErrorService,
    ElsaContractService,
    ElsaAgreementService,
} from '@app/services/services';
import {CompanySettings, BankAccount} from '@app/unientities';
import {FieldType, UserDto} from '@uni-entities';
import {BehaviorSubject, forkJoin} from 'rxjs';
import {AuthService} from '@app/authService';
import {CompanyBankAccountModal} from '../bank-account-modal/company-bank-account-modal';
import {SafeResourceUrl, DomSanitizer} from '@angular/platform-browser';
import { BankAgreementServiceProvider } from '@app/models/autobank-models';

@Component({
    selector: 'bank-init-modal',
    templateUrl: './bank-init-modal.html',
    styleUrls: ['./bank-init-modal.sass']
})
export class BankInitModal implements IUniModal, OnInit {

    @Input() options = <IModalOptions>{};
    @Output() onClose = new EventEmitter<boolean>();

    steps: number = 0;
    companySettings: CompanySettings;

    errorMsg: string = '';
    payload: any = {
         Phone: '',
         Password: '',
         Password2: '',
         IsInbound: true,
         IsOutgoing: true,
         IsBankBalance: true,
         IsBankStatement: true,
         BankApproval: true
    };
    currentUser: UserDto;
    agreement: any;
    busy: boolean = false;
    isDirty: boolean = false;
    dataLoaded: boolean = false;
    isNextStepValid: boolean = true;
    accounts = [
        {
            label: 'Driftskonto',
            field: 'CompanyBankAccount',
            type: 'company',
            defaultAccount: 1920
        },
        {
            label: 'Lønnskonto',
            field: 'SalaryBankAccount',
            type: 'salary',
            defaultAccount: null
        },
        {
            label: 'Skattetrekkskonto',
            field: 'TaxBankAccount',
            type: 'tax',
            defaultAccount: 1950
        }
    ];

    companySettings$ = new BehaviorSubject<CompanySettings>(null);
    hasBoughtAutobank: boolean = false;
    fields$ = new BehaviorSubject([]);
    bankName: string;
    forceSameBank = false;
    bankAgreementUrl: SafeResourceUrl;
    hasReadAgreement = false;

    constructor(
        private companySettingsService: CompanySettingsService,
        private modalService: UniModalService,
        private toastService: ToastService,
        private bankService: BankService,
        private elsaPurchasesService: ElsaPurchaseService,
        private elsaProductService: ElsaProductService,
        private errorService: ErrorService,
        private authService: AuthService,
        private elsaContractService: ElsaContractService,
        private elsaAgreementService: ElsaAgreementService,
        private sanitizer: DomSanitizer,
    ) {}

    ngOnInit() {
        if (!this.options.data || !this.options.data.cs || !this.options.data.cs.OrganizationNumber) {
            this.errorMsg = '*Mangler organisasjonsnummer. Du må gå til firmaoppsett og ' +
            'registrere dette før du kan koble sammen bank og regnskap.';
            this.isNextStepValid = false;
            return;
        }

        this.bankName = this.authService.publicSettings?.BankName || 'SpareBank 1 SR-Bank';
        this.currentUser = this.options.data.user;
        this.payload.Phone = this.currentUser.PhoneNumber;

        forkJoin([
            this.elsaContractService.getCurrentContractType(this.currentUser.License?.ContractType?.TypeName),
            this.elsaAgreementService.getByType('Bank')
        ]).subscribe(([contracttype, agreement]) => {
            this.forceSameBank = !!contracttype?.ForceSameBank;
            this.bankAgreementUrl = this.sanitizer.bypassSecurityTrustResourceUrl(agreement?.DownloadUrl);
        });

        this.elsaPurchasesService.getPurchaseByProductName('Autobank').subscribe((response) => {
            this.hasBoughtAutobank = !!response;
            this.initiateRegistrationModal();
        }, err => {
            this.hasBoughtAutobank = false;
            this.initiateRegistrationModal();
        });
    }

    initiateRegistrationModal() {
        if (this.hasBoughtAutobank) {
            this.reloadCompanySettings();
        } else {
            this.elsaProductService.GetAll(`Name eq 'Autobank'`).subscribe((products) => {
                if (products && products.length) {
                    const payload = [ { ID: null, ProductID: products[0].ID } ];
                    this.elsaPurchasesService.massUpdate(payload).subscribe(() => {
                        this.reloadCompanySettings();
                    });
                } else {
                    // This could be a big error ?? Autobank not present in Elsa
                    this.toastService.addToast('Klarte ikke hente nødvendig informasjon. Prøv igjen');
                    this.close();
                }
            }, err => {
                this.toastService.addToast('Klarte ikke hente nødvendig informasjon. Prøv igjen');
                this.close();
            });
        }
    }

    reloadCompanySettings() {
        this.companySettingsService.Get(1,
            ['CompanyBankAccount', 'CompanyBankAccount.Bank', 'SalaryBankAccount', 'SalaryBankAccount.Bank',
            'TaxBankAccount', 'TaxBankAccount.Bank', 'BankAccounts'])
        .subscribe(companySettings => {
            this.companySettings = companySettings;
            this.companySettings$.next(companySettings);
            this.dataLoaded = true;
            this.busy = false;
        }, err => {
            // Should just redirect back?
            this.busy = false;
        });
    }

    next() {
        if (!this.checkNextStepValid()) {
            return;
        }
        this.steps++;
        this.errorMsg = '';
        if (this.steps >= 3 && this.steps <= 5) {
            this.fields$.next(this.setUpUniForm());
        }
    }

    prev() {
        this.steps--;
        this.errorMsg = '';

        if (this.steps >= 3 && this.steps <= 5) {
            this.fields$.next(this.setUpUniForm());
        }
    }

    checkNextStepValid(): boolean {
        switch (this.steps) {
            case 0:
                return this.isNextStepValid;
            case 1:
                return this.hasReadAgreement;
            case 3:
                return !!this.companySettings$.value?.CompanyBankAccountID;
            default:
                return true;
        }
    }

    saveAccount() {
        const objToSave: any = {
            ID: this.companySettings$.value.ID
        };

        const stringValueFromStep = ['CompanyBankAccount', 'SalaryBankAccount', 'TaxBankAccount'];

        if (this.companySettings$.value[stringValueFromStep[this.steps - 1] + 'ID']) {
            objToSave[stringValueFromStep[this.steps - 1] + 'ID'] = this.companySettings$.value[stringValueFromStep[this.steps - 1] + 'ID'];
        } else {
            objToSave[stringValueFromStep[this.steps - 1]] = this.companySettings$.value[stringValueFromStep[this.steps - 1]];
            objToSave[stringValueFromStep[this.steps - 1] + 'ID'] = null;
        }
        this.busy = true;
        this.companySettingsService.Put(this.companySettings$.value.ID, objToSave).subscribe((companySettings) => {

            this.toastService.addToast(this.accounts[this.steps - 1].label + ' oppdatert i firmaoppsett', ToastType.good, 5);
            this.reloadCompanySettings();
            this.isDirty = false;
        }, err => {
            this.busy = false;
        });
    }

    postAutobankUser() {
        this.busy = true;
        if (this.validatePassword() && this.isValidPhoneNumber(this.payload.Phone)) {
            this.bankService.createInitialAgreement(this.payload).subscribe((agreement) => {
                this.orderPreApprovedPayments(agreement);
                this.agreement = agreement;
                this.busy = false;
                this.next();
            }, err => {
                this.busy = false;
                this.errorService.handle(err);
            });
        } else {
            this.busy = false;
        }
    }

    private orderPreApprovedPayments(agreement: any) {
        if (!this.payload.BankApproval) {
            if (agreement.ServiceProvider === BankAgreementServiceProvider.Bruno) {
                const userID = this.authService.currentUser?.BankIntegrationUserName;

                let url = 'https://www.dnb.no/bedrift/konto-kort-og-betaling/betaling/logginn-rgb-etterbestilling.html?erp=DNBRegnskap&utbetalingerval=true&rgb=etterbestill';
                if (userID) {
                    url += '&userid=' + userID;
                }
                window.open(url);

                agreement.PreApprovedBankPayments = 700003;
            }
            this.bankService.orderPreApprovedBankPayments(this.companySettings.CompanyBankAccount.BankID).subscribe();
        }
    }

    private validatePassword(): boolean {
        this.errorMsg = '';

        if (this.payload.Password !== this.payload.Password2) {
            this.errorMsg = 'Passordene er ikke like';
            return false;
        }

        if (this.payload.Password.length < 10) {
            this.errorMsg = 'Passordet må være minst 10 tegn langt';
            return false;
        }

        if (!/[a-z]/.test(this.payload.Password)) {
            this.errorMsg = 'Passord må ha minst 1 liten bokstav [a-z]';
            return false;
        }
        if (!/[A-Z]/.test(this.payload.Password)) {
            this.errorMsg = 'Passord må ha minst 1 stor bokstav [A-Z]';
            return false;
        }
        if (!/[\d]/.test(this.payload.Password)) {
            this.errorMsg = 'Passord må ha minst ett tall [0-9]';
            return false;
        }

        if (!/[\@\#\$\%\^\&\*\-_\\+\=\[\]\{\}\|\\\:\‘\,\.\?\/\`\~\“\(\)\;]/.test(this.payload.Password)) {
            this.errorMsg = 'Passord må ha minst ett tegn';
            return false;
        }

        return true;
    }

    private isValidPhoneNumber(phone) {
        const test1 = /^\d{8}$/.test(phone);
        const test2 = /^0047\d{8}$/.test(phone);
        const test3 = /^\+47\d{8}$/.test(phone);

        if (test1 || test2 || test3) {
            return true;
        } else {
            this.errorMsg = 'Telefonnummer må være et gyldig norsk telefonnummer';
            return false;
        }
    }

    close() {
        this.onClose.emit(this.agreement);
    }

    setUpUniForm() {
        const accountType = this.accounts[this.steps - 3];
        return [
            {
                EntityType: 'Supplier',
                Property: 'Info.BankAccounts',
                FieldType: FieldType.MULTIVALUE,
                Label: accountType.label,
                Options: {
                    entity: 'BankAccount',
                    listProperty: 'BankAccounts',
                    displayValue: 'AccountNumber',
                    linkProperty: 'ID',
                    storeResultInProperty: accountType.field,
                    storeIdInProperty: accountType.field + 'ID',
                    editor: (bankaccount: BankAccount) => {
                        if ((bankaccount && !bankaccount.ID) || !bankaccount) {
                            bankaccount = bankaccount || new BankAccount();
                            bankaccount['_createguid'] = this.companySettingsService.getNewGuid();
                            bankaccount.BankAccountType = accountType.type;
                            bankaccount.CompanySettingsID = 1;
                            bankaccount.BusinessRelationID = 0;
                            bankaccount.ID = 0;
                        }
                        const modal = this.modalService.open(CompanyBankAccountModal, {
                            data: {
                                bankAccount: bankaccount
                            },
                            modalConfig: {
                                lockAccountType: !!accountType.type
                            },
                            header: bankaccount?.ID ? 'Rediger bankkonto' : 'Legg til bankkonto',
                            closeOnClickOutside: false
                        });

                        return modal.onClose.take(1).toPromise();
                    }
                }
            },
        ];
    }
}
