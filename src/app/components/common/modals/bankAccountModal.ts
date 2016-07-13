import {Component, Type, Input, Output, ViewChild, EventEmitter} from '@angular/core';
import {UniModal} from '../../../../framework/modals/modal';
import {UniForm} from '../../../../framework/uniform';
import {UniFieldLayout} from '../../../../framework/uniform/index';
import {Bank, BankAccount, FieldType, Address, Account} from '../../../unientities';
import {BankService, AccountService, AddressService} from '../../../services/services';
import {ToastService, ToastType} from '../../../../framework/uniToast/toastService';
import {BankData} from '../../../models/models';
import {Observable} from 'rxjs/Observable';

declare var _;

// Reusable bankaccount form
@Component({
    selector: 'bankaccount-form',
    directives: [UniForm],
    template: `
        <article class="modal-content bankaccount-modal" *ngIf="config.model">
           <h1 *ngIf="config.title">{{config.title}}</h1>
           <uni-form [config]="formConfig" [fields]="fields" [model]="config.model" (onReady)="ready($event)"></uni-form>
           <footer [attr.aria-busy]="busy">
                <button *ngFor="let action of config.actions; let i=index" (click)="action.method()" [ngClass]="action.class" type="button">
                    {{action.text}}
                </button>                
            </footer>
        </article>
    `,
    providers: [BankService, AccountService, AddressService]
})
export class BankAccountForm {    
    @ViewChild(UniForm) public form: UniForm;
    private config: any = {};
    private fields: any[] = [];
    private formConfig: any = {};
    private busy: boolean = false;
    private accounts: Account[] = [];

    constructor(private bankService: BankService,
                private toastService: ToastService,
                private accountService: AccountService,
                private addressService: AddressService) {    
    }

    public ngOnInit() {
        this.setupForm();
  
        this.accountService.GetAll('filter=AccountNumber lt 3000').subscribe((accounts) => {
            this.accounts = accounts;
            this.extendForm();
       }); 
    }

    public ready(value) {
        this.form.field('AccountNumber')
            .onChange
            .subscribe((bankaccount) => {
                this.lookupBankAccountNumber(bankaccount);
            });                        
    }

    private lookupBankAccountNumber(bankaccount) {
        if (bankaccount.AccountNumber && bankaccount.AccountNumber.length == 11) {
            this.busy = true;
            this.toastService.addToast('Henter inn informasjon om banken, vennligst vent', ToastType.warn, 5);
            this.bankService.getIBANUpsertBank(bankaccount.AccountNumber).subscribe((bankdata: BankData) => {
                this.config.model.IBAN = bankdata.IBAN;
                this.config.model.Bank = bankdata.Bank;
                this.config.model.BankID = bankdata.Bank.ID;

                this.config.model = _.cloneDeep(this.config.model);
                this.busy = false;
                this.form.field('AccountID').focus();
                this.toastService.addToast('Informasjon om banken er innhentet', ToastType.good, 5);
            }, (error) => {
                this.busy = false;
                this.toastService.addToast('Kunne ikke slå opp kontonummer ' + bankaccount.AccountNumber, ToastType.bad, 10);
            });
        } else {
            this.toastService.addToast('Kontonummer må ha 11 siffer', ToastType.warn, 10);
        }
    }

    private extendForm() {
        var accountNumber = this.fields.find(x => x.Property === 'AccountNumber');
        accountNumber.Options = {
            mask: '0000 00 00000',
            events: {
                tab: (event) => {
                    this.form.field('AccountID').focus(); 
                },
                shift_tab: (event) => {
                    this.form.field('AccountNumber').focus();
                }
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
    }
 
    private setupForm() {   
        // TODO get it from the API and move these to backend migrations
        // TODO: turn to 'ComponentLayout when the object respects the interface
        this.fields = [
            {         
                EntityType: 'BankAccount',
                Property: 'AccountNumber',
                FieldType: FieldType.MASKED,
                Label: 'Kontonummer',
            },
            {
                EntityType: 'BankAccount',
                Property: 'IBAN',
                FieldType: FieldType.TEXT,
                ReadOnly: true,
                Label: 'IBAN'
            },
            {
                EntityType: 'BankAccount',
                Property: 'AccountID',
                FieldType: FieldType.AUTOCOMPLETE,
                Label: 'Hovedbokskonto',
                Classes: 'large-field',
                LineBreak: true
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
    `,
    directives: [UniModal]
})
export class BankAccountModal {
    @Input() public bankaccount: BankAccount;    
    @ViewChild(UniModal) public modal: UniModal;
    
    @Output() public Changed = new EventEmitter<BankAccount>();
    @Output() public Canceled = new EventEmitter<boolean>();

    private modalConfig: any = {};    

    private type: Type = BankAccountForm;

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
                        this.modal.close();
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

    public openModal(bankaccount: BankAccount) {  
        this.modalConfig.model = bankaccount;    
        this.modal.open();
    }
}
