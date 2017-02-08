import {Component, Type, Input, Output, ViewChild, EventEmitter} from '@angular/core';
import {UniModal} from '../../../../framework/modals/modal';
import {UniForm} from 'uniform-ng2/main';
import {FieldType} from 'uniform-ng2/main';
import {BankAccount, Account} from '../../../unientities';
import {BankService, AccountService, AddressService, ErrorService} from '../../../services/services';
import {ToastService, ToastType} from '../../../../framework/uniToast/toastService';
import {BankData} from '../../../models/models';
import {Observable} from 'rxjs/Observable';
declare var _;

// Reusable bankaccount form
@Component({
    selector: 'bankaccount-form',

    template: `
        <article class="modal-content bankaccount-modal" *ngIf="config.model">
           <h1 *ngIf="config.title">{{config.title}}</h1>
           <uni-form [config]="formConfig" [fields]="fields" [model]="config.model" (readyEvent)="ready($event)"></uni-form>
           <footer [attr.aria-busy]="busy">
                <button *ngFor="let action of config.actions; let i=index" (click)="action.method()" [ngClass]="action.class" type="button">
                    {{action.text}}
                </button>
            </footer>
        </article>
    `
})
export class BankAccountForm {
    @ViewChild(UniForm) public form: UniForm;

    private config: any = {};
    private fields: any[] = [];
    private formConfig: any = {};
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
        this.setupForm();

        this.accountService.GetAll('filter=AccountNumber lt 3000 and Visible eq true&orderby=AccountNumber').subscribe((accounts) => {
            this.accounts = accounts;
            this.fields = this.extendFields();

            // This is here instead of in ready() because this.extendFields() runs _.cloneDeep which destroys bindings
            setTimeout(() =>
                this.form.field('AccountNumber')
                    .changeEvent
                    .subscribe((bankaccount) => {
                        this.lookupBankAccountNumber(bankaccount);
                    })
            );
       }, err => this.errorService.handle(err));

    }

    public ready(value) {
    }

    public lookupBankAccountNumber(bankaccount) {
        if (bankaccount.AccountNumber && bankaccount.AccountNumber.length == 11) {
            this.busy = true;
            this.toastService.addToast('Henter inn informasjon om banken, vennligst vent', ToastType.warn, 5);
            this.bankService.getIBANUpsertBank(bankaccount.AccountNumber)
            .finally(() => this.busy = false)
            .subscribe((bankdata: BankData) => {
                this.config.model.IBAN = bankdata.IBAN;
                this.config.model.Bank = bankdata.Bank;
                this.config.model.BankID = bankdata.Bank.ID;

                this.config.model = _.cloneDeep(this.config.model);
                if (this.form.field('AccountID')) {
                    this.form.field('AccountID').focus();
                }
                this.toastService.addToast('Informasjon om banken er innhentet', ToastType.good, 5);
            },
            (error) => this.errorService.handleWithMessage(
                error, 'Kunne ikke slå opp kontonummer ' + bankaccount.AccountNumber
            ));
        } else {
            this.toastService.addToast('Kontonummer må ha 11 siffer', ToastType.warn, 10);
        }
    }

    private extendFields() {
        var accountNumber = this.fields.find(x => x.Property === 'AccountNumber');
        accountNumber.Options = {
            mask: '0000 00 00000',
            events: {
            }
        };

        var accountID = this.fields.find(x => x.Property === 'AccountID');
        accountID.Options = {
            source: this.accounts,
            displayProperty: 'AccountName',
            valueProperty: 'ID',
            template: (account: Account) => account ? `${account.AccountNumber} - ${account.AccountName}` : '',
            minLength: 1,
            debounceTime: 200,
            search: (searchValue: string) => Observable.from([this.accounts.filter((account) => account.AccountNumber.toString().startsWith(searchValue) || account.AccountName.toLowerCase().indexOf(searchValue.toLowerCase()) >= 0)]),
        };
        return _.cloneDeep(this.fields);
    }

    private setupForm() {
        // TODO get it from the API and move these to backend migrations
        // TODO: turn to 'ComponentLayout when the object respects the interface

        this.fields = [
            {
                EntityType: 'BankAccount',
                Property: 'AccountNumber',
                FieldType: FieldType.TEXT,
                Label: 'Kontonummer',
            },
            {
                EntityType: 'BankAccount',
                Property: 'IBAN',
                FieldType: FieldType.TEXT,
                ReadOnly: true,
                LineBreak: !this.config.accountVisible,
                Label: 'IBAN'
            },
            {
                EntityType: 'BankAccount',
                Property: 'AccountID',
                FieldType: FieldType.AUTOCOMPLETE,
                Label: 'Hovedbokskonto',
                Classes: 'large-field',
                LineBreak: true,
                Hidden: !this.config.accountVisible
            },
            // Bank section
            {
                EntityType: 'Bank',
                Property: 'Bank.Name',
                FieldType: FieldType.TEXT,
                ReadOnly: true,
                Label: 'Banknavn',
                Classes: 'large-field'
            },
            {
                EntityType: 'Bank',
                Property: 'Bank.BIC',
                FieldType: FieldType.TEXT,
                ReadOnly: true,
                Label: 'BIC',
                Classes: 'small-field',
            },
            {
                EntityType: 'Bank',
                Property: 'Bank.Web',
                FieldType: FieldType.URL,
                ReadOnly: true,
                Label: 'Hjemmeside',
                Classes: 'large-field',
                LineBreak: true
            },
            {
                EntityType: 'Bank',
                Property: 'Bank.Address.AddressLine1',
                Hidden: false,
                FieldType: FieldType.TEXT,
                ReadOnly: true,
                Label: 'Adresse',
                Classes: 'large-field'
            },
            {
                EntityType: 'Bank',
                Property: 'Bank.Address.PostalCode',
                FieldType: FieldType.TEXT,
                ReadOnly: true,
                Label: 'Postnr',
                Classes: 'small-field'
            },
            {
                EntityType: 'Bank',
                Property: 'Bank.Address.City',
                FieldType: FieldType.TEXT,
                ReadOnly: true,
                Label: 'Poststed',
                Classes: 'large-field',
                LineBreak: true
            },
            {
                EntityType: 'Bank',
                Property: 'Bank.Email.EmailAddress',
                FieldType: FieldType.TEXT,
                ReadOnly: true,
                Classes: 'large-field',
                Label: 'E-post'
            },
            {
                EntityType: 'Bank',
                Property: 'Bank.Phone.Number',
                FieldType: FieldType.TEXT,
                ReadOnly: true,
                Label: 'Telefonnummer',
                LineBreak: true
            }
        ];
    }
}

// bankaccount modal
@Component({
    selector: 'bankaccount-modal',
    template: `
        <uni-modal [type]="type" [config]="modalConfig"></uni-modal>
    `
})
export class BankAccountModal {
    @Input() public bankaccount: BankAccount;
    @ViewChild(UniModal) public modal: UniModal;

    @Output() public Changed = new EventEmitter<BankAccount>();
    @Output() public Canceled = new EventEmitter<boolean>();

    private modalConfig: any = {};

    private type: Type<any> = BankAccountForm;

    constructor() {
    }

    public ngOnInit() {
        this.modalConfig = {
            model: this.bankaccount,
            title: 'Bankkonto',
            actions: [
                {
                    text: 'Lagre bankkonto',
                    class: 'good',
                    method: () => {
                        if (this.modalConfig.accountVisible && !this.modalConfig.model.AccountID) {
                            if (!confirm('Du har ikke angitt hovedbokskonto (f.eks. 1920) - vil du fortsette uten å velge hovedbokskonto?')) {
                                return;
                            }
                        }

                        this.modal.close();

                        if (this.modalConfig.model.Account) {
                            this.modalConfig.model.Account = null;
                        }

                        this.Changed.emit(this.modalConfig.model);
                        return false;
                    }
                },
                {
                    text: 'Avbryt',
                    method: () => {
                        this.modal.close();
                        this.Canceled.emit(true);
                        return false;
                    }
                }
            ]
        };
    }

    public openModal(bankaccount: BankAccount, accountVisible: boolean = true) {
        this.modalConfig.model = bankaccount;
        this.modalConfig.accountVisible = accountVisible;
        this.modal.open();
        this.modal.getContent().then((form: BankAccountForm) => {
            if (!bankaccount.IBAN && bankaccount.AccountNumber && bankaccount.AccountNumber.length === 11) {
                form.lookupBankAccountNumber(bankaccount);
            }
        })
    }
}
