import {Component, Input, Output, EventEmitter, ElementRef} from '@angular/core';
import {Observable} from 'rxjs';
import {UniFieldLayout, FieldType} from '../../ui/uniform/index';
import {Bank, BankAccount, Account} from '../../../app/unientities';
import {ToastService, ToastType} from '../../uniToast/toastService';
import {AccountService, BankService, ErrorService, BankAccountService, StatisticsService} from '../../../app/services/services';
import { UniModalService } from '../modalService';
import {UniConfirmModalV2} from './confirmModal';
import {BehaviorSubject} from 'rxjs';
import {IModalOptions, IUniModal} from '@uni-framework/uni-modal/interfaces';
import {UniBankModal} from '@uni-framework/uni-modal/modals/bankModal';
import {StatisticsResponse} from '../../../app/models/StatisticsResponse';

@Component({
    selector: 'uni-bankaccount-modal',
    template: `
        <section role="dialog" class="uni-modal uni-redesign">
            <header>{{options.header || 'Bankkonto'}}</header>
            <article>
                <section *ngIf="busy" class="modal-spinner">
                    <mat-spinner class="c2a"></mat-spinner>
                </section>
                <uni-form #form
                    [config]="formConfig$"
                    [fields]="formFields$"
                    [model]="formModel$"
                    (readyEvent)="onReady()"
                    (changeEvent)="onFormChange($event)">
                </uni-form>
                <small style="color: var(--color-bad)"> {{ errorMsg }} </small>
            </article>
            <footer>
                <button
                    class="secondary"
                    (click)="close(false)"
                    (keydown.shift.tab)="$event.preventDefault(); form?.focus()"
                    (keydown.tab)="onCancelTab($event)">
                    Avbryt
                </button>

                <button class="c2a"
                    (click)="close(true)"
                    (keydown.tab)="$event.preventDefault()"
                    [disabled]="!isDirty || !validAccount">
                    Ok
                </button>
            </footer>
        </section>
    `
})
export class UniBankAccountModal implements IUniModal {
    @Input() options: IModalOptions = {};
    @Input() modalService: UniModalService;
    @Output() onClose = new EventEmitter();

    private saveBankAccountInModal: boolean = false;

    formConfig$ = new BehaviorSubject({autofocus: true});
    formModel$ = new BehaviorSubject(null);
    formFields$ = new BehaviorSubject([]);

    isDirty: boolean;
    validAccount: boolean = true;
    busy: boolean = true;
    bankAccounts: Array<BankAccount> = [];
    accountInfo: any;
    errorMsg: string = '';
    bankAccountsConnectedToAccount: string = '';

    constructor(
        private bankService: BankService,
        private accountService: AccountService,
        private errorService: ErrorService,
        private toastService: ToastService,
        private bankAccountService: BankAccountService,
        private statisticsService: StatisticsService
    ) {}

    public ngOnInit() {
        this.accountInfo = this.options.data.bankAccount || this.options.data || {};
        this.bankAccounts = this.options.data.bankAccounts || [];

        const fields = this.getFormFields();
        if (this.accountInfo._initValue && fields[0] && !this.accountInfo[fields[0].Property]) {
            this.accountInfo[fields[0].Property] = this.accountInfo._initValue;
        }
        if (this.accountInfo._saveBankAccountInModal) {
            this.saveBankAccountInModal = true;
        }

        this.GetBankAccountsConnectedToAccount(this.accountInfo.AccountID);
        this.bankService.GetAll(null, ['Address,Email,Phone']).subscribe(banks => {
            this.accountInfo['BankList'] = banks;
            if (this.accountInfo.BankID && !this.accountInfo.Bank) {
                this.accountInfo.Bank = banks.find(x => x.ID === this.accountInfo.BankID);
            }

            this.formModel$.next(this.accountInfo);
            this.formFields$.next(this.getFormFields());
            const modalConfig = this.options && this.options.modalConfig || {};
            if (modalConfig.defaultAccountNumber && !this.accountInfo.AccountID) {
                this.busy = true;
                this.getDefaultAccountFromAccountNumber(this.options.modalConfig.defaultAccountNumber);
            } else {
                this.busy = false;
            }
        });
    }

    getDefaultAccountFromAccountNumber(accountNumber: number) {
        this.bankAccountService.getAccountFromAccountNumber(accountNumber).subscribe((accounts) => {
            if (accounts && accounts.length) {
                const account = accounts[0];
                const value = this.formModel$.getValue();
                value.Account = account;
                value.AccountID = account.ID;
                this.formModel$.next(value);
            }
            this.busy = false;
        }, err => this.busy = false);
    }

    ngOnDestroy() {
        this.formConfig$.complete();
        this.formModel$.complete();
        this.formFields$.complete();
    }

    public onReady() {
        if (this.accountInfo._ibanAccountSearch) {
            this.onFormChange({
                _ibanAccountSearch: {
                    currentValue: this.accountInfo._ibanAccountSearch
                }
            });
        }
    }

    onCancelTab(event: KeyboardEvent) {
        if (!this.isDirty || !this.validAccount) {
            event.preventDefault();
        }
    }

    public close(emitValue?: boolean) {
        let account: BankAccount;
        if (emitValue) {
            account = this.formModel$.getValue();

            // Check if user can only set up given bank account
            if (this.options.modalConfig && this.options.modalConfig.BICLock) {
                if (!account.Bank) {
                    this.errorMsg = 'Kontoen må være knyttet til en bank. Velg korrekt bank i Banknavn-nedtrekkslisten';
                    return;
                } else {
                    if (account.Bank.BIC !== this.options.modalConfig.BICLock.BIC) {
                        this.errorMsg = 'Valgt konto er ikke en gyldig konto fra ' + this.options.modalConfig.BICLock.BankName +
                        '. Om du har krysset av for manuelt, sørg for at du har skrevet kontonr korrekt, og velg ' +
                        this.options.modalConfig.BICLock.BankName + ' i Banknavn-nedtrekkslisten';
                        return;
                    }
                }
            }

            if (this.options.modalConfig
                && this.options.modalConfig.ledgerAccountVisible
                && !account.AccountID && !(account.Account && account.Account.ID)) {

                const confirm = this.modalService.open(UniConfirmModalV2, {
                    header: 'Manglende konto',
                    message: 'Du har ikke angitt hovedbokskonto (f.eks 1920). Hovedbokskonto må velges for å registrere en bankkonto',
                    buttonLabels: {
                        accept: 'Ok'
                    }
                });

                confirm.onClose.subscribe(() => {
                    return;
                });
            } else {
                if (account.Account && !account.AccountID) {
                    account.AccountID = account.Account.ID;
                }
                account.Account = null;
                if (this.saveBankAccountInModal) {
                    this.SaveBankAccount(account);
                } else {
                    this.onClose.emit(account);
                }
            }
        } else {
            account = this.formModel$.getValue();
            account.Account = null;
            this.formModel$.next(account);
            this.onClose.emit(null);
        }
    }

    public GetBankAccountsConnectedToAccount(accountID: number) {

        const accounts = [];
        this.bankAccountService.getConnectedBankAccounts(accountID, this.accountInfo.ID)
        .subscribe((res) => {
            res.forEach(ba => {
                accounts.push(ba.AccountNumber);
            });
            if (accounts.length !== 0) {
                this.bankAccountsConnectedToAccount = 'Hovedbok er allerede knyttet til konto ' + accounts.join(', ')
                + '. Vi anbefaler ikke å knytte flere konti til samme hovedbokskonto.';
            } else {
                this.bankAccountsConnectedToAccount =  '';
            }
            if (this.bankAccountsConnectedToAccount !== '') {
                this.modalService.open(UniConfirmModalV2, {
                    message: this.bankAccountsConnectedToAccount,
                    buttonLabels: {
                        accept: 'Ok'
                    }
                }).onClose.subscribe(() => {
                    const model = this.formModel$.getValue();
                    model.AccountID = null;
                    model.Account = null;
                    this.formModel$.next(Object.assign({}, model));
                });
            }
        });
    }

    public SaveBankAccount(account: BankAccount) {
        if (!account.Bank || !account.Bank.BIC) {
            this.toastService.addToast('Mangler Bank eller BIC!', ToastType.bad, 5, 'Du må velge en bank og oppgi en BIC for Banken.') ;
            return;
         } else {
             if (!account.ID) {
                 // Set account type to - to pass validation check backend
                if (!account.BankAccountType) {
                    account.BankAccountType = '-';
                }
                this.bankAccountService.Post<BankAccount>(account).subscribe((res: any) => {
                    this.toastService.addToast('Ny konto lagret', ToastType.good, 4);
                    this.onClose.emit(res);
                });
             } else {
                this.bankAccountService.Put<BankAccount>(account.ID, account).subscribe((res: any) => {
                    this.toastService.addToast('Konto oppdatert', ToastType.good, 4);
                    this.onClose.emit(res);
                });
             }
         }
    }

    public onFormChange(changes) {
        this.errorMsg = '';
        this.isDirty = true;
        this.validAccount = true;

        if (changes['AccountNumber']) {
            this.toastService.clear();
            this.validAccount = false;
            const account = this.formModel$.value;
            this.validateAccountNumber(account);
            if (!this.isAccountNumberDuplicate(changes['AccountNumber'].currentValue)) {
                this.checkIsAccountNumberAlreadyRegistered(account, changes['AccountNumber'].currentValue);
            }
            this.GetBankAccountsConnectedToAccount(this.accountInfo.AccountID);
        }
        if (changes['_manualAccountNumber']) {
            const account = this.formModel$.getValue();
            const fields = this.formFields$.getValue();
            this.formFields$.getValue().forEach(field => {
                if (field.FieldSet === 1 && field.Property === '_ibanAccountSearch') {
                    field.ReadOnly = account['_manualAccountNumber'];
                }
                if (field.FieldSet === 2) {
                    field.ReadOnly = !account['_manualAccountNumber'];
                }
            });
            this.formFields$.next(fields);
        }
        if (changes['_ibanAccountSearch']) {
            this.toastService.clear();
            this.validAccount = false;
            const account = this.formModel$.value;

            if (changes['_ibanAccountSearch'].currentValue) {
                if (!this.isAccountNumberDuplicate(changes['_ibanAccountSearch'].currentValue)) {
                    this.checkIsAccountNumberAlreadyRegistered(account, changes['_ibanAccountSearch'].currentValue);
                }
            }
            this.GetBankAccountsConnectedToAccount(this.accountInfo.AccountID);
        }
        if (changes['AccountID'] && changes['AccountID'].currentValue === null) {
            const account = this.formModel$.getValue();
            account.Account = null;
            this.formModel$.next(account);
            this.bankAccountsConnectedToAccount = '';

        }
        if (changes['AccountID'] && changes['AccountID'].currentValue !== null) {
            const account = this.formModel$.getValue();
            this.GetBankAccountsConnectedToAccount(changes['AccountID'].currentValue);
        }
    }

    private validateAccountNumber(account: any) {
        const valid = account
            && account.AccountNumber
            && /^[a-zA-Z0-9]{1,100}$/.test(account.AccountNumber);

        if (!valid) {
            this.toastService.addToast('Ugyldig kontonummer', ToastType.bad, null, 'Bare bokstaver og sifre er tillatt');
            this.validAccount = false;
            return;
        }
        this.validAccount = true;
    }

    private isAccountNumberAlreadyRegistered(account: BankAccount): Observable<StatisticsResponse> {
        const qryString = 'model=BankAccount&select=BankAccount.ID,BankAccount.BankAccountType,' +
        'BankAccount.CompanySettingsID,BankAccount.BusinessRelationID,BusinessRelation.Name as Name' +
        '&filter=BankAccount.AccountNumber eq ' + account.AccountNumber +
        '&join=BankAccount.BusinessRelationID eq BusinessRelation.ID';

        return this.statisticsService.GetAll(qryString);
    }

    private checkIsAccountNumberAlreadyRegistered(account: BankAccount, currentValue: string) {
        this.busy = true;
        const toastSearchBankAccount = this.toastService.addToast('Henter informasjon om konto, vennligst vent', ToastType.warn);
        this.accountAndIBANSearch(currentValue).subscribe((res) => {
            this.busy = false;
            this.toastService.removeToast(toastSearchBankAccount);
            this.isAccountNumberAlreadyRegistered(account).subscribe(res2 => {
                if (res2.Data.length > 0) {
                    let bankAccountUsesMessages = 'Bankkonto er allerede i bruk: <br><br>';
                    res2.Data.forEach(function (ba) {
                        let baMessage = '';
                        switch (ba.BankAccountBankAccountType.toLowerCase()) {
                            case 'supplier':
                                baMessage = ' - Leverandør ' + ba.Name;
                                break;
                            case 'customer':
                                baMessage = ' - Kunde ' + ba.Name;
                                break;
                            case 'company':
                                baMessage = ' - Driftskonto i firmainnstillinger';
                                break;
                            case 'salarybank':
                                baMessage = ' - Lønnskonto i firmainnstilinger';
                                break;
                        }
                            bankAccountUsesMessages += baMessage + '<br>';
                    });
                    this.toastService.addToast('Bankkonto i bruk', ToastType.warn, 60, bankAccountUsesMessages);
                }

            }, err => this.errorService.handle(err));

        }, (err) => { this.busy = false; this.toastService.removeToast(toastSearchBankAccount); this.errorService.handle(err); });

    }

    private isAccountNumberDuplicate(accountNumber: string): boolean {
        if (this.bankAccounts.length > 0) {
            let duplicate = this.bankAccounts.find(x => x.AccountNumber == accountNumber);
            if (duplicate !== null && duplicate !== undefined) {
                this.toastService.addToast('Duplikat bankkonto nummer', ToastType.bad, null, 'Bankkonto med samme kontonummer er allerede registrert');
                this.validAccount = false;
                return true;
            }
        }
        return false;
    }

    private accountAndIBANSearch(searchValue: string) {
        searchValue = searchValue.replace(/[\W]+/g, '');
        const request = (isNaN(Number(searchValue)))
            ? this.bankService.validateIBANUpsertBank(searchValue)
            : this.bankService.getIBANUpsertBank(searchValue);

        return request.catch(res => {
            this.validAccount = false;
            this.toastService.clear();
            this.toastService.addToast('Ugyldig IBAN/Kontonummer', ToastType.bad, 5, 'Sjekk kontonummer og prøv igjen.') ;
            return Observable.of(null);
        })
        .switchMap((res: any) => {
            if (res) {
                const account = this.formModel$.getValue();
                account.AccountNumber = res.AccountNumber;
                account.IBAN = res.IBAN;
                account.Bank = res.Bank;
                account.BankID = res.Bank.ID;
                if (!account['BankList'].find(x => x.ID === res.Bank.ID)) {
                    account['BankList'].push(res.Bank);
                }
                this.formModel$.next(account);
                this.validAccount = true;
            }
            return Observable.of([]);
        });
    }

    // Copy paste old bankmodal..
    private accountSearch(searchValue: string) {
        let filter = `Visible eq 'true' and isnull(AccountID,0) eq 0`;
        if (!searchValue) {
            filter += ' and AccountNumber lt 3000';
        } else {
            let copyPasteFilter = '';

            if (searchValue.toString().indexOf(':') > 0) {
                const accountNumberPart = searchValue.split(':')[0].trim();
                const accountNamePart =  searchValue.split(':')[1].trim();

                copyPasteFilter = ` or (AccountNumber eq '${accountNumberPart}' and AccountName eq '${accountNamePart}')`;
            }

            filter += ` and (startswith(AccountNumber\,'${searchValue}') or contains(AccountName\,'${searchValue}')${copyPasteFilter} )`;
        }

        return this.accountService.searchAccounts(filter, searchValue !== '' ? 100 : 500);
    }

    private getFormFields(): UniFieldLayout[] {
        return [
            <any> {
                FieldSet: 1,
                FieldSetColumn: 1,
                Property: '_ibanAccountSearch',
                FieldType: FieldType.TEXT,
                ReadOnly: false,
                Label: 'IBAN/Kontonummer søk'
            },
            <any> {
                FieldSet: 1,
                FieldSetColumn: 1,
                Property: '_manualAccountNumber',
                FieldType: FieldType.CHECKBOX,
                ReadOnly: false,
                Label: 'Manuelt',
            },
            <any> {
                FieldSet: 2,
                FieldSetColumn: 1,
                EntityType: 'BankAccount',
                Property: 'AccountNumber',
                FieldType: FieldType.TEXT,
                ReadOnly: true,
                Label: 'Kontonummer',
            },
            <any> {
                FieldSet: 2,
                FieldSetColumn: 1,
                EntityType: 'BankAccount',
                Property: 'IBAN',
                FieldType: FieldType.TEXT,
                ReadOnly: true,
                Label: 'IBAN',
            },
            <any> {
                FieldSet: 2,
                FieldSetColumn: 1,
                EntityType: 'BankAccount',
                Property: 'AccountID',
                FieldType: FieldType.AUTOCOMPLETE,
                ReadOnly: false,
                Label: 'Hovedbokskonto',
                Options: {
                    displayProperty: 'AccountName',
                    valueProperty: 'ID',
                    template: (account: Account) => {
                        if (account) {
                            return `${account.AccountNumber} - ${account.AccountName}`;
                        }
                    },
                    getDefaultData: () => {
                        const model = this.options && this.options.data.bankAccount || this.options.data || {};

                        return model.Account
                            ? Observable.of([model.Account])
                            : Observable.of([]);
                    },
                    debounceTime: 200,
                    search: (searchValue) => this.accountSearch(searchValue)
                },
                Hidden: (!this.options.modalConfig || !this.options.modalConfig.ledgerAccountVisible)
                    && !this.options.data._fromBankSettings,
            },
            <any> {
                FieldSet: 2,
                FieldSetColumn: 1,
                EntityType: 'Bank',
                Property: 'Bank.Name',
                FieldType: FieldType.MULTIVALUE,
                ReadOnly: true,
                Label: 'Banknavn',
                Options: {
                    listProperty: 'BankList',
                    displayValue: 'Name',
                    linkProperty: 'ID',
                    storeIdInProperty: 'BankID',
                    storeResultInProperty: 'Bank',
                    editor: (bank) => {
                        if (!bank || !bank.ID) {
                            bank['_isNewBank'] = true;
                            bank = new Bank();
                        }
                        const modal = this.modalService.open(UniBankModal, {
                            data: bank
                        });

                        return modal.onClose.take(1).toPromise();
                    }
                }
            }
        ];
    }
}
