import {Component, Input, Output, EventEmitter} from '@angular/core';
import {Observable} from 'rxjs';
import {FieldType, UniFieldLayout} from '@uni-framework/ui/uniform/index';
import {BankAccount, CompanySettings} from '@app/unientities';
import {ToastService, ToastType} from '@uni-framework/uniToast/toastService';
import {BankService, ErrorService, BankAccountService, StatisticsService} from '@app/services/services';
import {UniSearchAccountConfig} from '@app/services/common/uniSearchConfig/uniSearchAccountConfig';
import {BehaviorSubject} from 'rxjs';

@Component({
    selector: 'company-bankaccount-edit',
    template: `
		<uni-form
			class="company-bank-account-form"
			[config]="{autofocus: true, showLabelAbove: true}"
			[fields]="formFields$"
			[model]="formModel$"
			(changeEvent)="onFormChange($event)">
        </uni-form>

        <small style="color: red"> {{ errorMsg }} </small>

        <footer style="display: flex; align-items: center; justify-content: center; margin-top: 2rem">
            <button class="c2a secondary" style="min-width: 8rem" (click)="saved.emit(false);">Lukk</button>
            <button class="c2a" style="min-width: 8rem"  (click)="save()">Lagre konto</button>
        </footer>
    `,
    styleUrls: ['./bank-accounts.sass']
})
export class CompanyBankAccountEdit {

    @Input()
    bankAccount: BankAccount;

    @Input()
    isNew: boolean = false;

    @Input()
    companySettings: CompanySettings;

    @Output()
    saved = new EventEmitter();

    @Output()
    setBusy = new EventEmitter();

    formModel$ = new BehaviorSubject(null);
    formFields$ = new BehaviorSubject([]);

    validAccount: boolean = true;
    validMainAccount: boolean = true;

    errorMsg: string = '';

    constructor(
        private bankService: BankService,
        private errorService: ErrorService,
        private toastService: ToastService,
        private bankAccountService: BankAccountService,
        private statisticsService: StatisticsService,
        private uniSearchAccountConfig: UniSearchAccountConfig
    ) {}

    public ngOnChanges() {
        this.bankAccount['_link'] = 'https://www.dnb.no/bedrift/konto-kort-og-betaling/konto/skattetrekkskonto.html?noredirect=true';
        this.bankAccount['_hasChangedStandard'] = this.bankAccount['_hasChangedStandard'] || false;
        this.bankAccount.CompanySettingsID = 1;

        if (!this.bankAccount) {
            // Error handling
            this.saved.emit(false);
        }

        this.bankService.GetAll(null, ['Address,Email,Phone']).subscribe(banks => {
            this.bankAccount['BankList'] = banks;
            if (this.bankAccount.BankID && !this.bankAccount.Bank) {
                this.bankAccount.Bank = banks.find(x => x.ID === this.bankAccount.BankID);
            }

            this.formModel$.next(Object.assign({}, this.bankAccount));
            this.formFields$.next(this.getFormFields());

            this.setBusy.emit(false);
        });
    }

    getDefaultAccountFromAccountNumber(accountNumber: number) {
        this.setBusy.emit(true);
        this.bankAccountService.getAccountFromAccountNumber(accountNumber).subscribe((accounts) => {
            if (accounts && accounts.length) {
                this.validMainAccount = true;
                const account = accounts[0];
                const value = this.formModel$.getValue();
                value.Account = account;
                value.AccountID = account.ID;

                this.formModel$.next(value);
                this.getBankAccountsConnectedToAccount(value.AccountID);
            } else {
                this.setBusy.emit(false);
            }
        }, err => this.setBusy.emit(false));
    }

    ngOnDestroy() {
        this.formModel$.complete();
        this.formFields$.complete();
    }

    getBankAccountsConnectedToAccount(accountID: number) {
        this.setBusy.emit(true);
        this.errorMsg = '';
        const accounts = [];
        this.bankAccountService.getConnectedBankAccounts(accountID, this.formModel$.value.ID).subscribe((res) => {
            res.forEach(ba => {
                accounts.push(ba.AccountNumber);
            });
            if (accounts.length !== 0) {
                this.errorMsg = 'Hovedbok er allerede knyttet til konto ' + accounts.join(', ')
                + '. Vi anbefaler ikke å knytte flere konti til samme hovedbokskonto.';
                this.validMainAccount = false;
            }
            this.setBusy.emit(false);
        }, err => this.setBusy.emit(false));
    }

    save() {

        if (!this.validMainAccount) {
            this.errorMsg = 'Du må velge en annen hovedbokskonto for å få lagret bankkonto.';
            return;
        }

        const account = this.formModel$.value;
        if (!account.Label) {
            this.errorMsg = 'Vennligst oppgi navn på konto før du lagrer';
            return;
        }

        if (!account.AccountNumber) {
            this.errorMsg = 'Kan ikke lagre en bankkonto uten kontonummer';
            return;
        }

        if (!account.Bank || !account.Bank.BIC) {
            this.errorMsg = 'Kan ikke lagre bankkonto uten gyldig bank og BIC. Du må velge en bank og oppgi en BIC for Banken.';
            return;
        }

        // Set account type to - to pass validation check backend
        if (!account.BankAccountType) {
            account.BankAccountType = 'company';
        }

        if (!account.AccountID) {
            this.errorMsg = 'Du må koble bankkonto til en hovedbokskonto.';
            return;
        }

        this.setBusy.emit(true);

        const obs = account.ID
            ? this.bankAccountService.Put<BankAccount>(account.ID, account)
            : this.bankAccountService.Post<BankAccount>(account);

        const isStandard = account['_isStandard'];
        const changedStandard = account['_hasChangedStandard'];

        obs.subscribe(response => {
            this.bankAccountService.Get(response.ID, ['Bank', 'Account']).subscribe(savedAccount => {
                this.setBusy.emit(false);
                this.toastService.addToast('Konto lagret', ToastType.good, 5);

                // Add the old appended values to the new saved object
                savedAccount['_isStandard'] = isStandard;
                savedAccount['_hasChangedStandard'] = changedStandard;
                savedAccount = this.bankService.mapBankIntegrationValues(savedAccount);

                this.saved.emit(savedAccount);
            }, err => {
                this.errorMsg = 'Bankkonto ble lagret, men vi klarte ikke hente den fram igjen. Lukk modalen og last inn data på nytt.';
            });

        }, err => this.setBusy.emit(false) );
    }

    public onFormChange(changes) {

        if (changes['AccountNumber']) {
            const account = this.formModel$.value;
            this.validAccount = this.validateAccountNumber(account);
            this.checkIsAccountNumberAlreadyRegistered(account, changes['AccountNumber'].currentValue);
        }

        if (changes['BankAccountType'] && changes['BankAccountType'].currentValue) {
            const accountType = this.bankService.BANK_ACCOUNT_TYPES
                .find(type => type.value === changes['BankAccountType'].currentValue);

            this.formFields$.next(this.getFormFields());

            if (accountType?.suggestion > 1500 && (!this.formModel$.value.AccountID || this.isNew)) {
                this.getDefaultAccountFromAccountNumber(accountType.suggestion);
            }
            this.formFields$.next(this.getFormFields(true));
        }

        if (changes['AccountID'] && changes['AccountID'].currentValue === null) {
            const account = this.formModel$.getValue();
            account.Account = null;
            account.AccountID = null;
            this.formModel$.next(account);

        }
        if (changes['AccountID'] && changes['AccountID'].currentValue !== null) {
            const account = this.formModel$.getValue();
            this.validMainAccount = true;
            this.getBankAccountsConnectedToAccount(changes['AccountID'].currentValue);
        }

        if (changes['_isStandard']) {
            const account = this.formModel$.value;
            if (changes['_isStandard'].previousValue && account.BankAccountType === 'company' && !account['_hasChangedStandard']) {
                account['_isStandard'] = true;
                this.formModel$.next(account);
                this.toastService.addToast('Ugyldig handlig', ToastType.warn, 10, 'Kan ikke fjerne standard driftskonto. Om du skal sette ny konto som standard, velg den konto og sett som standard');
            } else {
                account['_hasChangedStandard'] = !account['_hasChangedStandard'];
            }
        }
    }

    private validateAccountNumber(account: any): boolean {
        return account && account.AccountNumber && /^[a-zA-Z0-9]{1,100}$/.test(account.AccountNumber);
    }

    private isAccountNumberAlreadyRegistered(account: BankAccount): Observable<any> {
        const qryString = 'model=BankAccount&select=BankAccount.ID,BankAccount.BankAccountType,' +
        'BankAccount.CompanySettingsID,BankAccount.BusinessRelationID,BusinessRelation.Name as Name' +
        '&filter=BankAccount.AccountNumber eq ' + account.AccountNumber +
        '&join=BankAccount.BusinessRelationID eq BusinessRelation.ID';

        return this.statisticsService.GetAll(qryString);
    }

    private checkIsAccountNumberAlreadyRegistered(account: BankAccount, currentValue: string) {
        this.setBusy.emit(true);
        const toastSearchBankAccount = this.toastService.addToast('Henter informasjon om konto, vennligst vent', ToastType.warn);
        this.accountAndIBANSearch(currentValue).subscribe((res) => {
            this.setBusy.emit(false);
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

        }, (err) => { this.setBusy.emit(false); this.toastService.removeToast(toastSearchBankAccount); this.errorService.handle(err); });

    }

    accountAndIBANSearch(searchValue: string) {
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

    private getFormFields(hideStandard: boolean = false): Partial<UniFieldLayout>[] {
        const ba = this.formModel$.value;
        return [
            {
                Property: 'Label',
                FieldType: FieldType.TEXT,
                Label: 'Navn'
            },
            {
                Property: 'BankAccountType',
                FieldType: FieldType.DROPDOWN,
                Label: 'Type',
                ReadOnly: this.bankAccount['_count'],
                Options: {
                    source: this.bankService.BANK_ACCOUNT_TYPES,
                    valueProperty: 'value',
                    template: (item) => item.label,
                    debounceTime: 200
                }
            },
            {
                Label: '',
                HelpText: 'Skattetrekkskonto',
                Property: '_link',
                FieldType: FieldType.HYPERLINK,
                Hidden: this.formModel$.value.BankAccountType !== 'tax' || !this.isNew,
                Options: {
                    linkClass: 'alert info',
                    description: 'Skattetrekkskonto er en type konto som kun kan brukes til betalinger til det offentlige. Den benyttes til overføring av forskuddstrekk for ansatte knyttet til lønnskjøring',
                    target: '_blank',
                    icon: 'info_outline'
                }
            },
            {
                EntityType: 'BankAccount',
                Property: 'AccountNumber',
                FieldType: FieldType.TEXT,
                ReadOnly: this.bankAccount['_count'],
                Label: 'Kontonummer',
            },
            {
                EntityType: 'Bank',
                Property: 'BankID',
                FieldType: FieldType.DROPDOWN,
                ReadOnly: true,
                Label: 'Navn på bank',
                Options: {
                    source: this.bankAccount['BankList'],
                    valueProperty: 'ID',
                    template: (item) => item?.Name,
                    debounceTime: 200
                }
            },
            {
                EntityType: 'BankAccount',
                Property: 'AccountID',
                FieldType: FieldType.UNI_SEARCH,
                ReadOnly: this.bankAccount['_count'],
                Label: 'Hovedbokskonto',
                Options: {
                    uniSearchConfig: this.uniSearchAccountConfig.generateOnlyMainAccountsConfig(),
                    valueProperty: 'ID'
                }
            },
            {
                EntityType: 'BankAccount',
                Property: 'IBAN',
                FieldType: FieldType.TEXT,
                ReadOnly: true,
                Label: 'IBAN',
            },
            {
                EntityType: 'BankAccount',
                Property: '_isStandard',
                FieldType: FieldType.CHECKBOX,
                ReadOnly: this.formModel$.value['_isStandard'] && this.formModel$.value.ID === this.companySettings.CompanyBankAccountID,
                Hidden: hideStandard && !this.isNew,
                Label: 'Standard ' + (ba.BankAccountType === 'company' ? 'driftskonto' : ba.BankAccountType === 'salary' ? 'lønnskonto' : 'skattekonto'),
            }
        ];
    }
}
