import {Component, Input, Output, EventEmitter, ElementRef} from '@angular/core';
import {UniFieldLayout, FieldType} from '../../ui/uniform/index';
import {Bank, BankAccount, Account} from '../../../app/unientities';
import {ToastService, ToastType} from '../../uniToast/toastService';
import {AccountService, BankService, ErrorService, BankAccountService, StatisticsService} from '../../../app/services/services';
import { UniModalService } from '../modalService';
import {UniConfirmModalV2} from './confirmModal';
import {Observable} from 'rxjs';
import {BehaviorSubject} from 'rxjs';
import {KeyCodes} from '../../../app/services/common/keyCodes';
import {ConfirmActions, IModalOptions, IUniModal} from '@uni-framework/uni-modal/interfaces';
import {UniBankModal} from '@uni-framework/uni-modal/modals/bankModal';
import {StatisticsResponse} from '../../../app/models/StatisticsResponse';

@Component({
    selector: 'uni-bankaccount-modal',
    template: `
        <section role="dialog" class="uni-modal">
            <header>
                <h1>{{options.header || 'Bankkonto'}}</h1>
            </header>
            <article [attr.aria-busy]="busy">
                <uni-form
                    [config]="formConfig$"
                    [fields]="formFields$"
                    [model]="formModel$"
                    (readyEvent)="onReady()"
                    (changeEvent)="onFormChange($event)">
                </uni-form>
            </article>
            <footer>
                <button class="good"
                        (click)="close(true)"
                        [disabled]="isDirty && !validAccount || !hasChanges">
                    Ok
                </button>
                <button class="bad" (click)="close(false)">Avbryt</button>
            </footer>
        </section>
    `
})
export class UniBankAccountModal implements IUniModal {
    @Input()
    public options: IModalOptions = {};

    @Input()
    public modalService: UniModalService;

    @Output()
    public onClose: EventEmitter<any> = new EventEmitter();

    public formConfig$: BehaviorSubject<any> = new BehaviorSubject({autofocus: false});
    public formModel$: BehaviorSubject<BankAccount> = new BehaviorSubject(null);
    public formFields$: BehaviorSubject<UniFieldLayout[]> = new BehaviorSubject([]);

    public isDirty: boolean;
    public validAccount: boolean = true;
    public busy: boolean = false;
    public hasChanges: boolean = false;
    private saveBankAccountInModal: boolean = false;
    public bankAccounts: Array<BankAccount> = [];

    constructor(
        private bankService: BankService,
        private accountService: AccountService,
        private errorService: ErrorService,
        private toastService: ToastService,
        private elementRef: ElementRef,
        private bankAccountService: BankAccountService,
        private statisticsService: StatisticsService
    ) {}

    public ngOnInit() {
        const accountInfo = this.options.data.bankAccount || this.options.data || {};
        this.bankAccounts = this.options.data.bankAccounts || [];
        const fields = this.getFormFields();
        if (accountInfo._initValue && fields[0] && !accountInfo[fields[0].Property]) {
            accountInfo[fields[0].Property] = accountInfo._initValue;
        }
        if (accountInfo._saveBankAccountInModal) {
            this.saveBankAccountInModal = true;
        }
        this.bankService.GetAll(null, ['Address,Email,Phone']).subscribe(banks => {
            accountInfo['BankList'] = banks;
            if (accountInfo.BankID && !accountInfo.Bank) {
                accountInfo.Bank = banks.find(x => x.ID === accountInfo.BankID);
            }
            this.formModel$.next(accountInfo);
            this.formFields$.next(this.getFormFields());
        });
    }

    public onReady() {
        const inputs = <HTMLInputElement[]> this.elementRef.nativeElement.querySelectorAll('input');
        if (inputs.length) {
            const first = inputs[0];
            first.focus();
            first.value = first.value; // set cursor at end of text
            const last = inputs[inputs.length - 1];
            Observable.fromEvent(last, 'keydown')
                .filter((event: KeyboardEvent) => (event.which || event.keyCode) === KeyCodes.ENTER)
                .subscribe(() => this.close(true));
        }
        if (this.options.data._ibanAccountSearch) {
            this.onFormChange({
                _ibanAccountSearch: {
                    currentValue: this.options.data._ibanAccountSearch
                }
            });
        }
    }

    public close(emitValue?: boolean) {
        let account: BankAccount;
        if (emitValue) {
            account = this.formModel$.getValue();
            if (this.options.modalConfig
                && this.options.modalConfig.ledgerAccountVisible
                && !account.AccountID) {

                const confirm = this.modalService.open(UniConfirmModalV2, {
                    header: 'Bekreft manglende konto',
                    message: 'Du har ikke angitt hovedbokskonto (f.eks 1920). Vil du fortsette uten å velge konto?'
                });

                confirm.onClose.subscribe((response) => {
                    if (response !== ConfirmActions.ACCEPT) {
                        return;
                    } else {
                        this.onClose.emit(account);
                    }
                });
            } else {
                if (this.saveBankAccountInModal) {
                    this.SaveBankAccount(account);
                } else {
                    this.onClose.emit(account);
                }
            }
        } else {
            this.onClose.emit(null);
        }
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
        this.isDirty = true;
        this.validAccount = true;
        this.hasChanges = true;


        if (changes['AccountNumber']) {
            this.toastService.clear();
            this.validAccount = false;
            const account = this.formModel$.value;
            this.validateAccountNumber(account);
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
/*                this.isAccountNumberDuplicate(account);
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

                }, err => this.errorService.handle(err));*/

            });
            this.formFields$.next(fields);
        }
        if (changes['_ibanAccountSearch']) {
            this.toastService.clear();
            this.validAccount = false;
            const account = this.formModel$.value;

            if (changes['_ibanAccountSearch'].currentValue) {
                if (!this.isAccountNumberDuplicate(changes['_ibanAccountSearch'].currentValue)) {
                    this.busy = true;
                    const toastSearchBankAccount = this.toastService.addToast('Henter informasjon om konto, vennligst vent', ToastType.warn);
                    this.accountAndIBANSearch(changes['_ibanAccountSearch'].currentValue).subscribe((res) => {
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
            }
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
        searchValue = searchValue.replace(/ /g, '');
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
