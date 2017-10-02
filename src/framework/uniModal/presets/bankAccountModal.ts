import {Component, Input, Output, EventEmitter, ElementRef} from '@angular/core';
import {UniFieldLayout, FieldType} from '../../ui/uniform/index';
import {Bank, BankAccount, Account} from '../../../app/unientities';
import {ToastService, ToastType} from '../../uniToast/toastService';
import {AccountService, BankService, ErrorService} from '../../../app/services/services';
import {
    IModalOptions,
    IUniModal,
    UniModalService,
    ConfirmActions
} from '../modalService';
import {UniConfirmModalV2} from './confirmModal';
import {Observable} from 'rxjs/Observable';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {KeyCodes} from '../../../app/services/common/keyCodes';

@Component({
    selector: 'uni-bankaccount-modal',
    template: `
        <section role="dialog" class="uni-modal">
            <header>
                <h1>{{options.header || 'Bankkonto'}}</h1>
            </header>
            <article>
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
                        [disabled]="isDirty && !validAccount">
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

    constructor(
        private bankService: BankService,
        private accountService: AccountService,
        private errorService: ErrorService,
        private toastService: ToastService,
        private elementRef: ElementRef
    ) {}

    public ngOnInit() {
        const accountInfo = this.options.data || {};
        const fields = this.getFormFields();

        if (accountInfo._initValue && fields[0]) {
            accountInfo[fields[0].Property] = accountInfo._initValue;
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
                .filter(event => (event.which || event.keyCode) === KeyCodes.ENTER)
                .subscribe(() => this.close(true));
        }
    }

    public close(emitValue?: boolean) {
        let account: BankAccount;

        if (emitValue) {
            account = this.formModel$.getValue();

            if (!account.Bank || account.Bank.BIC === '' || account.Bank.BIC === null) {
               this.toastService.addToast('Mangler BIC!', ToastType.bad, 5, 'Du må oppgi en BIC for Banken.') ;
               return;
            }

            if (this.isBankChanged) {
                this.bankService.Put<Bank>(account.Bank.ID, account.Bank)
                .subscribe(item => {}, err => this.errorService.handle(err));
            }

            if (this.options.modalConfig
                && this.options.modalConfig.ledgerAccountVisible
                && !account.AccountID) {

                const confirm = this.modalService.open(UniConfirmModalV2, {
                    header: 'Bekreft manglende konto',
                    message: 'Du har ikke angitt hovedbokskonto (f.eks 1920). Vil du fortsette uten å velge konto?'
                });

                confirm.onClose.subscribe((response) => {
                    if (response === ConfirmActions.ACCEPT) {
                        this.onClose.emit(account);
                    } else {
                        return;
                    }
                });
            } else {
                this.onClose.emit(account);
            }
        } else {
            this.onClose.emit(null);
        }
    }

    public onFormChange(changes) {
        this.isDirty = true;

        if (changes['Bank.BIC']) {
            this.isBankChanged = true;
        }

        if (changes['AccountNumber']) {
            this.toastService.clear();
            this.validAccount = false;
            const account = this.formModel$.getValue();

            // Simple check first
            const valid = account
                && account.AccountNumber
                && /^\d{11}$/.test(account.AccountNumber);

            if (!valid) {
                this.toastService.addToast('Ugyldig kontonummer');
                this.validAccount = false;
                return;
            }

            this.getAccountDetails(account);
        }
    }

    private getAccountDetails(account: BankAccount) {
        this.toastService.addToast('Henter informasjon om konto, vennligst vent', ToastType.warn);
        this.bankService.getIBANUpsertBank(account.AccountNumber).subscribe(
            res => {
                account.IBAN = res.IBAN;
                account.Bank = res.Bank;
                account.BankID = res.Bank.ID;
                this.formModel$.next(account);
                this.validAccount = true;
                setTimeout(() => {
                    this.toastService.clear();
                }, 1000);
            },
            err => {
                this.validAccount = false;
                this.toastService.clear();
                this.toastService.addToast('Ugyldig kontonummer');
            }
        );
    }

    // Copy paste old bankmodal..
    private accountSearch(searchValue: string) {
        let filter = `Visible eq 'true' and isnull(AccountID,0) eq 0`;
        if (!searchValue) {
            filter += ' and AccountNumber lt 3000';
        } else {
            let copyPasteFilter = '';

            if (searchValue.toString().indexOf(':') > 0) {
                let accountNumberPart = searchValue.split(':')[0].trim();
                let accountNamePart =  searchValue.split(':')[1].trim();

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
                EntityType: 'BankAccount',
                Property: 'AccountNumber',
                FieldType: FieldType.TEXT,
                Label: 'Kontonummer',
            },
            <any> {
                FieldSet: 1,
                FieldSetColumn: 1,
                EntityType: 'BankAccount',
                Property: 'IBAN',
                FieldType: FieldType.TEXT,
                ReadOnly: true,
                Label: 'IBAN',
            },
            <any> {
                FieldSet: 1,
                FieldSetColumn: 1,
                EntityType: 'BankAccount',
                Property: 'AccountID',
                FieldType: FieldType.AUTOCOMPLETE,
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
                        let model = this.options && this.options.data || {};
                        return model.Account
                            ? Observable.of([model.Account])
                            : Observable.of([]);
                    },
                    debounceTime: 200,
                    search: (searchValue) => this.accountSearch(searchValue)
                },
                Hidden: !this.options.modalConfig || !this.options.modalConfig.ledgerAccountVisible,
            },
            <any> {
                FieldSet: 1,
                FieldSetColumn: 1,
                EntityType: 'Bank',
                Property: 'Bank.Name',
                FieldType: FieldType.TEXT,
                ReadOnly: true,
                Label: 'Banknavn',
            },
            <any> {
                FieldSet: 1,
                FieldSetColumn: 1,
                EntityType: 'Bank',
                Property: 'Bank.BIC',
                FieldType: FieldType.TEXT,
                ReadOnly: false,
                Label: 'BIC',
            },
            <any> {
                FieldSet: 1,
                FieldSetColumn: 1,
                EntityType: 'Bank',
                Property: 'Bank.Web',
                FieldType: FieldType.URL,
                ReadOnly: true,
                Label: 'Hjemmeside',
                LineBreak: true,
            },
            <any> {
                FieldSet: 1,
                FieldSetColumn: 2,
                EntityType: 'Bank',
                Property: 'Bank.Address.AddressLine1',
                FieldType: FieldType.TEXT,
                ReadOnly: true,
                Label: 'Adresse',
            },
            <any> {
                FieldSet: 1,
                FieldSetColumn: 2,
                EntityType: 'Bank',
                Property: 'Bank.Address.PostalCode',
                FieldType: FieldType.TEXT,
                ReadOnly: true,
                Label: 'Postnr',
            },
            <any> {
                FieldSet: 1,
                FieldSetColumn: 2,
                EntityType: 'Bank',
                Property: 'Bank.Address.City',
                FieldType: FieldType.TEXT,
                ReadOnly: true,
                Label: 'Poststed',
            },
            <any> {
                FieldSet: 1,
                FieldSetColumn: 2,
                EntityType: 'Bank',
                Property: 'Bank.Email.EmailAddress',
                FieldType: FieldType.TEXT,
                ReadOnly: true,
                Label: 'E-post',
            },
            <any> {
                FieldSet: 1,
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
