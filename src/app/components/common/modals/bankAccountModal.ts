import {Component, Type, Input, Output, ViewChild, EventEmitter, SimpleChanges} from '@angular/core';
import {UniModal} from '../../../../framework/modals/modal';
import {UniForm} from 'uniform-ng2/main';
import {FieldType} from 'uniform-ng2/main';
import {BankAccount, Account} from '../../../unientities';
import {BankService, AccountService, AddressService, ErrorService} from '../../../services/services';
import {ToastService, ToastType} from '../../../../framework/uniToast/toastService';
import {BankData} from '../../../models/models';
import {Observable} from 'rxjs/Observable';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {UniConfirmModal, ConfirmActions} from '../../../../framework/modals/confirm';

declare var _;

// Reusable bankaccount form
@Component({
    selector: 'bankaccount-form',

    template: `
        <article class="modal-content bankaccount-modal" *ngIf="config.model">
           <h1 *ngIf="config.title">{{config.title}}</h1>
           <uni-form [config]="formConfig$" [fields]="fields$" [model]="model$" (changeEvent)="change($event)"></uni-form>
           <footer [attr.aria-busy]="busy">
                <button *ngIf="config?.actions?.validate && !config?.validaccountnumber" (click)="config?.actions?.validate?.method()" class="warning">
                    {{config?.actions?.validate?.text}}
                </button>
                <button *ngIf="config?.actions?.accept && config?.validaccountnumber" (click)="config?.actions?.accept?.method()" class="good">
                    {{config?.actions?.accept?.text}}
                </button>
                <button *ngIf="config?.actions?.cancel" (click)="config?.actions?.cancel?.method()">
                    {{config?.actions?.cancel?.text}}
                </button>
            </footer>
        </article>
    `
})
export class BankAccountForm {
    @ViewChild(UniForm) public form: UniForm;
    @Input() private config: any = {};
    private fields$: BehaviorSubject<any[]> = new BehaviorSubject([]);
    private formConfig$: BehaviorSubject<any> = new BehaviorSubject({});
    private model$: BehaviorSubject<any>=new BehaviorSubject(null);
    private busy: boolean = false;
    private accounts: Account[] = [];

    constructor(
        private bankService: BankService,
        private toastService: ToastService,
        private accountService: AccountService,
        private addressService: AddressService,
        private errorService: ErrorService
    ) {
    }

    public ngOnInit() {
        this.model$.next(this.config.model);
        this.fields$.next(this.extendFields());

        /*this.accountService.GetAll('filter=AccountNumber lt 3000 and Visible eq true&orderby=AccountNumber').subscribe((accounts) => {
            this.accounts = accounts;

       }, err => this.errorService.handle(err));*/
    }

    public change(changes: SimpleChanges) {
        if (changes['AccountNumber']) {
            this.config.validaccountnumber = false;
            this.config.model.AccountNumber = this.config.model.AccountNumber.replace(/[\s|.]/g, '');
            this.lookupBankAccountNumber();
        }
    }

    public lookupBankAccountNumber() {
        if (!this.model$.getValue()) {
            this.model$.next(this.config.model);
        }
        let model = this.model$.getValue();
        if (model) {
            let accountNumber = model.AccountNumber;
            if (accountNumber.length === 11) {
                this.busy = true;
                this.toastService.addToast('Henter inn informasjon om banken, vennligst vent', ToastType.warn);
                this.bankService.getIBANUpsertBank(accountNumber)
                .finally(() => this.busy = false)
                .subscribe((bankdata: BankData) => {
                    this.config.model.IBAN = bankdata.IBAN;
                    this.config.model.Bank = bankdata.Bank;
                    this.config.model.BankID = bankdata.Bank.ID;
                    this.config.validaccountnumber = true;
                    this.model$.next(this.config.model);
                    this.form.field('AccountID')
                        .then(f => f.focus())
                        .catch(()=>{});
                    this.toastService.clear();
                    this.toastService.addToast('Informasjon om banken er innhentet', ToastType.good, 5);
                },
                (error) => {
                    this.toastService.clear();
                    this.errorService.handleWithMessage(error, 'Ugyldig kontonummer ' + accountNumber + ' endre eller avbryt');
                });
            } else {
                this.toastService.addToast('Kontonummer må ha 11 siffer', ToastType.warn, 10);
            }
        }
    }

    private extendFields() {
        const fields = this.setupForm();
        let accountNumber = <any>fields.find(x => x.Property === 'AccountNumber');
        accountNumber.Options = {
            mask: '0000 00 00000',
            events: {
            }
        };

        let accountID = <any>fields.find(x => x.Property === 'AccountID');
        accountID.Options = {
            getDefaultData: () => this.getDefaultAccountData(),
            displayProperty: 'AccountName',
            valueProperty: 'ID',
            template: (account: Account) => account ? `${account.AccountNumber} - ${account.AccountName}` : '',
            minLength: 1,
            debounceTime: 200,
            search: (searchValue: string) => this.accountSearch(searchValue),
            events: {
                    select: (model: BankAccount) => {
                        this.updateAccount(model);
                    }
                }
        };

        return fields;
    }

    private updateAccount(model: BankAccount) {
        if (model && model.AccountID) {
            this.accountService.Get(model.AccountID)
                .subscribe(account => {
                    if (account) {
                        let mainModel = this.model$.getValue();
                        mainModel.Account = account;
                        this.model$.next(mainModel);
                    }
                },
                err => this.errorService.handle(err)
            );
        }
    }

    private getDefaultAccountData() {
        let model = this.model$.getValue();
        if (model && model.Account ) {
            return Observable.of([model.Account]);
        } else {
            return Observable.of([]);
        }
    }

    private accountSearch(searchValue: string): Observable<any> {

        let filter = `Visible eq 'true' and isnull(AccountID,0) eq 0`;
        if (searchValue === '') {
            filter += ' and AccountNumber lt 3000';
        } else {
            let copyPasteFilter = '';

            if (searchValue.indexOf(':') > 0) {
                let accountNumberPart = searchValue.split(':')[0].trim();
                let accountNamePart =  searchValue.split(':')[1].trim();

                copyPasteFilter = ` or (AccountNumber eq '${accountNumberPart}' and AccountName eq '${accountNamePart}')`;
            }

            filter += ` and (startswith(AccountNumber\,'${searchValue}') or contains(AccountName\,'${searchValue}')${copyPasteFilter} )`;
        }

        return this.accountService.searchAccounts(filter, searchValue !== '' ? 100 : 500);
    }

    private setupForm() {
        // TODO get it from the API and move these to backend migrations
        // TODO: turn to 'ComponentLayout when the object respects the interface

        return [
            {
                EntityType: 'BankAccount',
                Property: 'AccountNumber',
                FieldType: FieldType.TEXT,
                Label: 'Kontonummer',                
                Section: 0
            },
            {
                EntityType: 'BankAccount',
                Property: 'IBAN',
                FieldType: FieldType.TEXT,
                ReadOnly: true,
                LineBreak: !this.config.accountVisible,
                Label: 'IBAN',
                Section: 0
            },
            {
                EntityType: 'BankAccount',
                Property: 'AccountID',
                FieldType: FieldType.AUTOCOMPLETE,
                Label: 'Hovedbokskonto',
                Classes: 'large-field',
                LineBreak: true,
                Hidden: !this.config.accountVisible,
                Section: 0
            },
            // Bank section
            {
                EntityType: 'Bank',
                Property: 'Bank.Name',
                FieldType: FieldType.TEXT,
                ReadOnly: true,
                Label: 'Banknavn',
                Classes: 'large-field',
                Section: 0
            },
            {
                EntityType: 'Bank',
                Property: 'Bank.BIC',
                FieldType: FieldType.TEXT,
                ReadOnly: true,
                Label: 'BIC',
                Classes: 'small-field',
                Section: 0
            },
            {
                EntityType: 'Bank',
                Property: 'Bank.Web',
                FieldType: FieldType.URL,
                ReadOnly: true,
                Label: 'Hjemmeside',
                Classes: 'large-field',
                LineBreak: true,
                Section: 0
            },
            {
                EntityType: 'Bank',
                Property: 'Bank.Address.AddressLine1',
                Hidden: false,
                FieldType: FieldType.TEXT,
                ReadOnly: true,
                Label: 'Adresse',
                Classes: 'large-field',
                Section: 0
            },
            {
                EntityType: 'Bank',
                Property: 'Bank.Address.PostalCode',
                FieldType: FieldType.TEXT,
                ReadOnly: true,
                Label: 'Postnr',
                Classes: 'small-field',
                Section: 0
            },
            {
                EntityType: 'Bank',
                Property: 'Bank.Address.City',
                FieldType: FieldType.TEXT,
                ReadOnly: true,
                Label: 'Poststed',
                Classes: 'large-field',
                LineBreak: true,
                Section: 0
            },
            {
                EntityType: 'Bank',
                Property: 'Bank.Email.EmailAddress',
                FieldType: FieldType.TEXT,
                ReadOnly: true,
                Classes: 'large-field',
                Label: 'E-post',
                Section: 0
            },
            {
                EntityType: 'Bank',
                Property: 'Bank.Phone.Number',
                FieldType: FieldType.TEXT,
                ReadOnly: true,
                Label: 'Telefonnummer',
                LineBreak: true,
                Section: 0
            }
        ];
    }
}

// bankaccount modal
@Component({
    selector: 'bankaccount-modal',
    template: `
        <uni-modal [type]="type" [config]="modalConfig" (close)="onClose($event)"></uni-modal>
        <uni-confirm-modal></uni-confirm-modal>
    `
})
export class BankAccountModal {
    @Input() public bankaccount: BankAccount;
    @ViewChild(UniModal) public modal: UniModal;
    @ViewChild(UniConfirmModal) private confirmModal: UniConfirmModal;

    private modalConfig: any = {};

    private type: Type<any> = BankAccountForm;
    private rejector: any;

    constructor(private toastService: ToastService) {
    }

    public close() {
        this.modal.close();
    }

    public onClose(fromClose) {
        if (fromClose) {
            this.rejector();
        }
    }

    public ngOnInit() {
        this.modalConfig = {
            model: this.bankaccount,
            title: 'Bankkonto',
            actions: {
                accept: {
                    text: 'Ok',
                    method: () => { this.close(); }
                },
                cancel: {
                    text: 'Avbryt',
                    method: () => { this.close(); }
                },
                validate: {
                    text: 'Sjekk',
                    method: () => { }
                }
            }
        };
    }

    public confirm(bankaccount: BankAccount, accountVisible: boolean = true): Promise<any> {
        return new Promise((resolve, reject) => {
            this.rejector = reject;
            this.modalConfig.model = bankaccount;
            this.modalConfig.accountVisible = accountVisible;
            this.modalConfig.validaccountnumber = !!bankaccount.AccountNumber;
            let oldbankaccount = _.cloneDeep(bankaccount);

            this.modalConfig.actions.validate = {
                text: 'Sjekk',
                class: 'warning',
                method: () => {
                    this.modal.getContent().then((form: BankAccountForm) => {
                        form.lookupBankAccountNumber();
                    });
                    if (this.modalConfig.accountVisible && !this.modalConfig.model.AccountID) {
                        this.toastService.addToast('Mangler hovedbokskonto', ToastType.warn, 5, 'Du har ikke angitt hovedbokskonto (f.eks. 1920)');
                    }
                }
            };

            this.modalConfig.actions.accept = {
                text: 'Ok',
                class: 'good',
                method: () => {
                    if (this.modalConfig.accountVisible && !this.modalConfig.model.AccountID) {
                        this.confirmModal.confirm(
                            'Du har ikke angitt hovedbokskonto (f.eks. 1920) - vil du fortsette uten å velge hovedbokskonto?',
                            'Bekreft manglende konto',
                            false,
                            {accept: 'Ok', reject: 'Avbryt'}
                        )
                        .then((response: ConfirmActions) => {
                            if (response === ConfirmActions.ACCEPT) {
                                resolve({status: ConfirmActions.ACCEPT, model: this.modalConfig.model});
                                this.close();
                            } else {
                                reject();
                                this.close();
                            }
                        }).catch(() => {
                            reject();
                            this.close();
                        });
                    } else {
                        resolve({status: ConfirmActions.ACCEPT, model: this.modalConfig.model});
                        this.close();
                    }
                }
            }

            this.modalConfig.actions.cancel = {
                text: 'Avbryt',
                method: () => {
                    resolve({status: ConfirmActions.CANCEL, model: oldbankaccount});
                    this.modal.close();
                }
            };

            this.modal.open();
            this.modal.getContent().then((form: BankAccountForm) => {
                if (!bankaccount.IBAN && bankaccount.AccountNumber && bankaccount.AccountNumber.length === 11) {
                    form.lookupBankAccountNumber();
                }
            }).catch(value => console.log(value));
        });
    }
}
