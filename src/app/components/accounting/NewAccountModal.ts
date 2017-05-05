import {Component, Type, Input, Output, ViewChild, EventEmitter, OnChanges, SimpleChange} from '@angular/core';
import {UniModal} from '../../../framework/modals/modal';
import {Observable} from 'rxjs/Observable';
import {UniForm, UniFieldLayout} from 'uniform-ng2/main';
import {Account, BusinessRelation, Email, Phone, PhoneTypeEnum, Address, Customer, Supplier, JournalEntryLineDraft, LocalDate, Period} from '../../unientities';
import {ToastService, ToastType} from '../../../framework/uniToast/toastService';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {IUniSearchConfig} from 'unisearch-ng2/src/UniSearch/IUniSearchConfig';
import {AccountService, AddressService, UniSearchConfigGeneratorService, CustomerService, SupplierService, ErrorService} from '../../services/services';
import {UniSearchCustomerConfigGeneratorHelper} from '../../services/common/uniSearchConfig/uniSearchCustomerConfigGeneratorHelper';
import {FieldType} from 'uniform-ng2/main';

declare const _; // lodash

// Reusable address form
@Component({
    selector: 'new-account-form',

    template: `

        <article class="modal-content new-account-modal">
            <h1 *ngIf="config.title">{{config.title}}</h1>

                <section class="new-account-form">

                    <span>Søk etter kunde eller leverandør 1880</span>
                    <div>
                        <uni-search [config]="uniSearchConfig" (changeEvent)="selectItem($event)"></uni-search>
                    </div>

                    <div *ngIf="selectedItem" class="business-relation-preview">
                        <strong>Du har valgt:</strong>
                        <label *ngIf="selectedItem.Name">{{selectedItem.Name}}</label>
                        <label *ngIf="selectedItem.AddressLine1">{{selectedItem.AddressLine1}}</label>
                        <label *ngIf="selectedItem.PostalCode || selectedItem.City">{{selectedItem.PostalCode}} {{selectedItem.City}}</label>
                        <label *ngIf="selectedItem.EmailAddress">E-post: {{selectedItem.Country}}</label>
                        <label *ngIf="selectedItem.PhoneNumber"><I>Telefon</I>: {{selectedItem.PhoneNumber}}</label>
                        <label *ngIf="selectedItem.OrgNumber"><I>Org.Nummer</I>: {{selectedItem.OrgNumber}}</label>
                    </div>

                </section>
            <footer>
                <button
                    *ngFor="let action of config.actions; let i=index"
                    (click)="action.method()"
                    [ngClass]="action.class"
                    type="button"
                    [disabled]="action.isDisabled()">
                    {{action.text}}
                </button>
            </footer>
        </article>
    `
})
export class NewAccountForm implements OnChanges {
    @ViewChild(UniForm) public form: UniForm;

    public config: any = {};
    public uniSearchConfig: IUniSearchConfig;
    private model$: BehaviorSubject<any>= new BehaviorSubject(null);
    public selectedItem: any;



    constructor(
        private uniSearchCustomerConfigGeneratorHelper: UniSearchCustomerConfigGeneratorHelper
    ) {
        this.uniSearchConfig = this.uniSearchCustomerConfigGeneratorHelper.generateOnlyExternalSearch();

    }

    public openCustomerModal(): Observable<Customer> {
        return null;
    }

    public ngOnInit() {
        this.model$.next(this.config.model);
        const searchCriteria = {Name: this.config.initSearchCriteria };
        this.uniSearchConfig.initialItem$.next(searchCriteria);
    }

    public selectItem(selectedItem: any) {
        if (selectedItem) {
            this.selectedItem = selectedItem;
            this.config.selectedItem = selectedItem;
        }
    }

    public ngOnChanges(changes: {[propName: string]: SimpleChange}) {
        this.model$.next(this.config.model);
    }
}

// newAccount modal
@Component({
    selector: 'new-account-modal',
    template: `<uni-modal [type]="type" [config]="modalConfig" [destroyOnClose]="'true'"></uni-modal>`
})

export class NewAccountModal {
    @ViewChild(UniModal) public modal: UniModal;
    @Output() public CreatedAccount = new EventEmitter<Account>();
    @Output() public Cancelled = new EventEmitter<boolean>();



    private modalConfig: any = {};
    public type: Type<any> = NewAccountForm;
    public searchCriteria: string = '';
    constructor(
        private supplierService: SupplierService,
        private customerService: CustomerService,
        private accountService: AccountService
    ) { }

    public ngOnInit() {
        this.modalConfig = {
            title: 'Ny konto',
            initSearchCriteria: this.searchCriteria,
            mode: null,
            question: 'Opprette ny konto',
            disableQuestion: false,

            actions: [
                {
                    text: 'Opprett som kunde',
                    class: 'good',
                    method: () => {
                        this.createNewCustomer();
                    },
                    isDisabled: () =>  false
                },
                {
                    text: 'Opprett som leverandør',
                    class: 'good',
                    method: () => {
                        this.createNewSupplier();
                    },
                    isDisabled: () => false
                },
                {
                    text: ' Avbryt ' ,
                    class: 'bad',
                    method: () => {
                        this.modalConfig.selectedItem = null;
                        this.Cancelled.emit(true);
                        this.modal.close();
                        return false;
                    },
                    isDisabled: () => false
                },
            ]
        };
    }


    private createNewCustomer() {
        this.createNewAccountAndCloseModal('Customer');
    }

    private createNewSupplier() {
        this.createNewAccountAndCloseModal('Supplier');
    }

    private createNewMainAccount() {
        this.createNewAccountAndCloseModal('MainAccount');
    }

    private createNewAccountAndCloseModal(accountType: string) {

        if (this.modalConfig.selectedItem) {

            const selectedItem = this.modalConfig.selectedItem;
            let newAccount: any = null;

            if (accountType === 'Customer') { newAccount = new Customer(); }
            if (accountType === 'Supplier') { newAccount = new Supplier(); }
            if (newAccount) {

            if (selectedItem.OrgNumber) { newAccount.OrgNumber = selectedItem.OrgNumber; }
            if (selectedItem.WebUrl) { newAccount.WebUrl = selectedItem.WebUrl; }

            const br: BusinessRelation = new BusinessRelation();
            br.Name = selectedItem.Name;

            if (selectedItem.AddressLine1 || selectedItem.PostalCode || selectedItem.City) {
                const a: Address = new Address();
                a.AddressLine1 = selectedItem.AddressLine1;
                a.PostalCode = selectedItem.PostalCode;
                a.City = selectedItem.City;
                a.CountryCode = selectedItem.CountryCode;
                br.InvoiceAddress = a;
                br.ShippingAddress = a;
            }

            if (selectedItem.EmailAddress) {
                const e: Email = new Email();
                e.EmailAddress = selectedItem.EmailAddress;
                br.DefaultEmail = e;
            }

            if (selectedItem.PhoneNumber) {
                const p: Phone = new Phone();
                p.Number = selectedItem.PhoneNumber;
                br.DefaultPhone = p;
            }

            newAccount.Info = br;

            if (accountType === 'Customer') {
                this.customerService.Post(newAccount).subscribe(res => {
                    this.accountService.GetAll(`filter=AccountNumber eq ` + res.CustomerNumber).subscribe(resAcc => {
                            this.CreatedAccount.emit(resAcc[0]);
                            this.modal.close();
                        }, err => err.handleError(err));
                    }, err => err.handleError(err));
                }


            if (accountType === 'Supplier') {
                this.supplierService.Post(newAccount).subscribe(res => {
                    this.accountService.GetAll(`filter=AccountNumber eq ` + res.SupplierNumber).subscribe(resAcc => {
                            this.CreatedAccount.emit(resAcc[0]);
                            this.modal.close();
                        }, err => err.handleError(err));
                    }, err => err.handleError(err));
                }
            }
        }
    }



    public openModal() {
        this.modalConfig.title = 'Opprett ny konto:';
        this.modalConfig.initSearchCriteria = this.searchCriteria;
        this.modal.open();
    }
}

