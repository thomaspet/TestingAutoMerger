import {Component, Input, Output, EventEmitter, OnInit} from '@angular/core';
import {IModalOptions, IUniModal, UniModalService, UniBankAccountModal} from '@uni-framework/uni-modal';
import {ToastService, ToastTime, ToastType} from '@uni-framework/uniToast/toastService';
import {CompanySettingsService, BankService} from '@app/services/services';
import {CompanySettings, BankAccount} from '@app/unientities';
import {FieldType, UserDto} from '@uni-entities';
import {BehaviorSubject} from 'rxjs';

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
         IsBankStatement: true
    };
    currentUser: UserDto;
    busy: boolean = false;
    isDirty: boolean = false;
    dataLoaded: boolean = false;
    isNextStepValid: boolean = true;
    userDoesNotFeelReady: boolean = false;
    accounts = [
        {
            label: 'Driftskonto',
            field: 'CompanyBankAccount',
            type: 'company'
        },
        {
            label: 'Lønnskonto',
            field: 'SalaryBankAccount',
            type: 'salarybank'
        },
        {
            label: 'Skattetrekkskonto',
            field: 'TaxBankAccount',
            type: 'bankaccount'
        }
    ];

    companySettings$ = new BehaviorSubject<CompanySettings>(null);
    fields$ = new BehaviorSubject([]);

    constructor(
        private companySettingsService: CompanySettingsService,
        private modalService: UniModalService,
        private toastService: ToastService,
        private bankService: BankService
    ) {}

    ngOnInit() {
        this.currentUser = this.options.data.user;
        this.payload.Phone = this.currentUser.PhoneNumber;
        this.busy = false;
        this.reloadCompanySettings();
    }

    reloadCompanySettings() {
        this.companySettingsService.Get(1,
            ['CompanyBankAccount', 'CompanyBankAccount.Bank', 'SalaryBankAccount', 'SalaryBankAccount.Bank',
            'TaxBankAccount', 'TaxBankAccount.Bank', 'BankAccounts'])
        .subscribe(companySettings => {
            this.companySettings = companySettings;
            this.companySettings$.next(companySettings);
            this.checkNextStepValid();
            this.dataLoaded = true;
            this.busy = false;
        }, err => {
            // Should just redirect back?
            this.busy = false;
        });
    }

    next() {
        if (this.userDoesNotFeelReady) {
            this.onClose.emit(false);
            return;
        }

        this.steps++;

        if (this.steps >= 1 && this.steps <= 3) {
            this.fields$.next(this.setUpUniForm());
        }

        this.checkNextStepValid();
    }

    prev() {
        this.steps--;
        this.isNextStepValid = true;

        if (this.steps >= 1 && this.steps <= 3) {
            this.fields$.next(this.setUpUniForm());
        }
    }

    checkNextStepValid() {
        switch (this.steps) {
            case 1:
                this.isNextStepValid = !!this.companySettings$.value.CompanyBankAccountID;
                break;
            default:
                this.isNextStepValid = true;
                break;
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
            this.bankService.createInitialAgreement(this.payload).subscribe(() => {
                this.busy = false;
                this.next();
            }, err => {
                this.busy = false;
                this.toastService.addToast('Klarte ikke opprette autobankavtale', ToastType.bad, 10);
            });
        } else {
            this.busy = false;
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

        if (!/[a-zæøå]/.test(this.payload.Password)) {
            this.errorMsg = 'Passord må ha minst 1 liten bokstav';
            return false;
        }
        if (!/[A-ZÆØÅ]/.test(this.payload.Password)) {
            this.errorMsg = 'Passord må ha minst 1 stor bokstav';
            return false;
        }
        if (!/[\d]/.test(this.payload.Password)) {
            this.errorMsg = 'Passord må ha minst ett tall';
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

    close(value: boolean = false) {
        this.onClose.emit(value);
    }

    setUpUniForm() {
        const accountType = this.accounts[this.steps - 1];
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
                            bankaccount.BankAccountType =  accountType.type,
                            bankaccount.CompanySettingsID = 1;
                            bankaccount.BusinessRelationID = 0;
                            bankaccount.ID = 0;
                        }
                        const modal = this.modalService.open(UniBankAccountModal, {
                            data: {
                                bankAccount: bankaccount
                            },
                            modalConfig: {
                                ledgerAccountVisible: true,
                                BICLock: {
                                    BIC:  'SPRONO22',
                                    BankName: 'SpareBank 1 SR-Bank'
                                }
                            },
                            closeOnClickOutside: false
                        });

                        return modal.onClose.take(1).toPromise();
                    }
                }
            },
        ]
    }
}
