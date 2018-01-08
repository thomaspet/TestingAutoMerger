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
import { ConfirmActions, IModalOptions, IUniModal } from '@uni-framework/uniModal/interfaces';

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
    }

    public close(emitValue?: boolean) {
        let account: BankAccount;

        if (emitValue) {
            account = this.formModel$.getValue();

            if (account && account.Bank && account.Bank.BIC && account.AccountNumber && !account.ID) {
                // Set account type to - to pass validation check backend
                if (!account.BankAccountType) {
                    account.BankAccountType = '-';
                }
                this.bankAccountService.Post<BankAccount>(account).subscribe((res: any) => {
                    this.toastService.addToast('Ny konto lagret', ToastType.good, 4);
                    this.onClose.emit(res);
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
            }

        } else {
            this.onClose.emit(null);
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

            if (changes['_ibanAccountSearch'].currentValue && /^\d{1,100}$/.test(changes['_ibanAccountSearch'].currentValue)) {
                this.busy = true;
                this.toastService.addToast('Henter informasjon om konto, vennligst vent', ToastType.warn);
                this.accountAndIBANSearch(changes['_ibanAccountSearch'].currentValue).subscribe((res) => {
                    this.busy = false;
                }, (err) => { this.busy = false; this.errorService.handle(err); });
            } else {
                this.toastService.addToast('Ugyldig kontonummer');
                this.validAccount = false;
                return;
            }
        }
    }

    private validateAccountNumber(account: any) {
        const valid = account
            && account.AccountNumber
            && /^\d{1,100}$/.test(account.AccountNumber);

        if (!valid) {
            this.toastService.addToast('Ugyldig kontonummer');
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
                ReadOnly: true,
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
