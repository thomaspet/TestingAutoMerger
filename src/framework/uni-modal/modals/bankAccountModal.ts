import {Component, Input, Output, EventEmitter, ElementRef} from '@angular/core';
import {UniFieldLayout, FieldType} from '../../ui/uniform/index';
import {Bank, BankAccount, Account} from '../../../app/unientities';
import {ToastService, ToastType} from '../../uniToast/toastService';
import {AccountService, BankService, ErrorService, BankAccountService} from '../../../app/services/services';
import { UniModalService } from '../modalService';
import {UniConfirmModalV2} from './confirmModal';
import {Observable} from 'rxjs/Observable';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {KeyCodes} from '../../../app/services/common/keyCodes';
import { ConfirmActions, IModalOptions, IUniModal } from '@uni-framework/uni-modal/interfaces';

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
                    (readyEvent)="onReady($event)"
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
    private formModel$: BehaviorSubject<BankAccount> = new BehaviorSubject(null);
    private formFields$: BehaviorSubject<UniFieldLayout[]> = new BehaviorSubject([]);

    private isDirty: boolean;
    private validAccount: boolean = true;
    private isBankChanged: boolean = false;
    private busy: boolean = false;
    private hasChanges: boolean = false;
    private saveBankAccountInModal: boolean = false;

    constructor(
        private bankService: BankService,
        private accountService: AccountService,
        private errorService: ErrorService,
        private toastService: ToastService,
        private elementRef: ElementRef,
        private bankAccountService: BankAccountService
    ) {}

    public ngOnInit() {
        const accountInfo = this.options.data || {};
        const fields = this.getFormFields();
        if (accountInfo._initValue && fields[0] && !accountInfo[fields[0].Property]) {
            accountInfo[fields[0].Property] = accountInfo._initValue;
            this.validateAccountNumber(accountInfo);
        }
        if (accountInfo._saveBankAccountInModal) {
            this.saveBankAccountInModal = true;
        }
        this.formModel$.next(accountInfo);
        this.formFields$.next(this.getFormFields());
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
        if (account && account.Bank && account.Bank.BIC && account.AccountNumber && !account.ID) {
            // Set account type to - to pass validation check backend
            if (!account.BankAccountType) {
                account.BankAccountType = '-';
            }

            this.bankAccountService.Post<BankAccount>(account).subscribe((res: any) => {
                this.toastService.addToast('Ny konto lagret', ToastType.good, 4);
                this.onClose.emit(res);
            });
        // Gets in here if edit button is clicked from BankSettings!
        } else if (this.options.data._fromBankSettings && account && account.Bank && account.Bank.BIC && account.AccountNumber) {
            this.bankAccountService.Put<BankAccount>(account.ID, account).subscribe((res: any) => {
                this.toastService.addToast('Konto oppdatert', ToastType.good, 4);
            });
        } else {
            if (!account.Bank || account.Bank.BIC === '' || account.Bank.BIC === null) {
                this.toastService.addToast('Mangler BIC!', ToastType.bad, 5, 'Du må oppgi en BIC for Banken.') ;
                return;
             }
             if (this.isBankChanged) {
                 this.bankService.Put<Bank>(account.Bank.ID, account.Bank)
                 .subscribe(item => {}, err => this.errorService.handle(err));
             }
        }
    }



    public onFormChange(changes) {
        this.isDirty = true;
        this.validAccount = true;
        this.hasChanges = true;

        if (changes['Bank.BIC']) {
            this.isBankChanged = true;
        }
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
            });
            this.formFields$.next(fields);
        }
        if (changes['_ibanAccountSearch']) {
            this.toastService.clear();
            this.validAccount = false;
            const account = this.formModel$.value;

            if (changes['_ibanAccountSearch'].currentValue) {
                this.busy = true;
                const toastSearchBankAccount = this.toastService.addToast('Henter informasjon om konto, vennligst vent', ToastType.warn);
                this.accountAndIBANSearch(changes['_ibanAccountSearch'].currentValue).subscribe((res) => {
                    this.busy = false;
                    this.toastService.removeToast(toastSearchBankAccount);
                }, (err) => { this.busy = false; this.toastService.removeToast(toastSearchBankAccount); this.errorService.handle(err); });
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
    }

    private accountAndIBANSearch(searchValue: string) {
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
                account.AccountNumber = searchValue;
                account.IBAN = res.IBAN;
                account.Bank = res.Bank;
                account.BankID = res.Bank.ID;
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
                        const model = this.options && this.options.data || {};
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
                FieldType: FieldType.TEXT,
                ReadOnly: true,
                Label: 'Banknavn',
            },
            <any> {
                FieldSet: 2,
                FieldSetColumn: 1,
                EntityType: 'Bank',
                Property: 'Bank.BIC',
                FieldType: FieldType.TEXT,
                ReadOnly: true,
                Label: 'BIC',
            },
            <any> {
                FieldSet: 2,
                FieldSetColumn: 1,
                EntityType: 'Bank',
                Property: 'Bank.Web',
                FieldType: FieldType.URL,
                ReadOnly: true,
                Label: 'Hjemmeside',
                LineBreak: true,
            },
            <any> {
                FieldSet: 2,
                FieldSetColumn: 1,
                EntityType: 'Bank',
                Property: 'Bank.Email.EmailAddress',
                FieldType: FieldType.TEXT,
                ReadOnly: true,
                Label: 'E-post',
            },
            <any> {
                FieldSet: 2,
                FieldSetColumn: 2,
                EntityType: 'Bank',
                Property: 'Bank.Address.AddressLine1',
                FieldType: FieldType.TEXT,
                ReadOnly: true,
                Label: 'Adresse',
            },
            <any> {
                FieldSet: 2,
                FieldSetColumn: 2,
                EntityType: 'Bank',
                Property: 'Bank.Address.PostalCode',
                FieldType: FieldType.TEXT,
                ReadOnly: true,
                Label: 'Postnr',
            },
            <any> {
                FieldSet: 2,
                FieldSetColumn: 2,
                EntityType: 'Bank',
                Property: 'Bank.Address.City',
                FieldType: FieldType.TEXT,
                ReadOnly: true,
                Label: 'Poststed',
            },
            <any> {
                FieldSet: 2,
                FieldSetColumn: 2,
                EntityType: 'Bank',
                Property: 'Bank.Address.Country',
                FieldType: FieldType.TEXT,
                ReadOnly: true,
                Label: 'Country',
            },
            <any> {
                FieldSet: 2,
                FieldSetColumn: 2,
                EntityType: 'Bank',
                Property: 'Bank.Phone.Number',
                FieldType: FieldType.TEXT,
                ReadOnly: true,
                Label: 'Telefonnummer',
            }
        ];
    }
}
