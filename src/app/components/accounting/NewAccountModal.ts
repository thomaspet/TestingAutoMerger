import {Component, Input, Output, ViewChild, EventEmitter, SimpleChange, AfterViewInit, OnInit, OnChanges} from '@angular/core';
import {IUniModal, IModalOptions} from '../../../framework/uni-modal';
import {UniForm} from '../../../framework/ui/uniform/index';
import {BusinessRelation, Email, Phone, Address, Customer, Supplier} from '../../unientities';
import {BehaviorSubject} from 'rxjs';
import {IUniSearchConfig, UniSearch} from '../../../framework/ui/unisearch/index';
import {AccountService, CustomerService, SupplierService} from '../../services/services';
import {UniSearchCustomerConfig} from '../../services/common/uniSearchConfig/uniSearchCustomerConfig';

declare const _; // lodash

@Component({
    selector: 'new-account-modal',
    template: `
        <section role="dialog" class="uni-modal" style="width: 50vw;">
            <header>Opprett ny konto</header>

            <article class="new-account-form" [attr.aria-busy]="busy" style="width: 95vw;">

                <span>Søk etter kunde eller leverandør 1880</span>
                <div>
                    <uni-search [config]="uniSearchConfig" (changeEvent)="selectItem($event)"></uni-search>
                </div>

                <div *ngIf="selectedItem" class="business-relation-preview">
                    <strong>Du har valgt:</strong>
                    <label *ngIf="selectedItem.Name">{{selectedItem.Name}}</label>
                    <label *ngIf="selectedItem.AddressLine1">{{selectedItem.AddressLine1}}</label>
                    <label *ngIf="selectedItem.PostalCode || selectedItem.City">{{selectedItem.PostalCode}}
                        {{selectedItem.City}}
                     </label>
                    <label *ngIf="selectedItem.EmailAddress">E-post: {{selectedItem.Country}}</label>
                    <label *ngIf="selectedItem.PhoneNumber"><I>Telefon</I>: {{selectedItem.PhoneNumber}}</label>
                    <label *ngIf="selectedItem.OrgNumber"><I>Org.Nummer</I>: {{selectedItem.OrgNumber}}</label>
                </div>

            </article>
            <footer>
                <button (click)="createNewAccountAndCloseModal('Customer')" class="good" [disabled]="!selectedItem">
                    Opprett som kunde
                </button>
                <button (click)="createNewAccountAndCloseModal('Supplier')" class="good" [disabled]="!selectedItem">
                    Opprett som leverandør
                </button>
                <button (click)="close()" class="bad">Avbryt</button>
            </footer>
        </section>
    `
})

export class NewAccountModal implements IUniModal, AfterViewInit, OnInit, OnChanges {
    @Input()
    public options: IModalOptions;

    @Output()
    public onClose: EventEmitter<any> = new EventEmitter();

    // @ViewChild(UniForm) public form: UniForm;
    @ViewChild(UniSearch, { static: true }) private uniSearch: UniSearch;

    public config: any = {};
    public uniSearchConfig: IUniSearchConfig;
    public model$: BehaviorSubject<any>= new BehaviorSubject(null);
    public selectedItem: any;
    public busy: boolean = false;

    public searchCriteria: string = '';
    constructor(
        private supplierService: SupplierService,
        private customerService: CustomerService,
        private accountService: AccountService,
        private uniSearchCustomerConfig: UniSearchCustomerConfig
    ) {
        this.uniSearchConfig = this.uniSearchCustomerConfig.generateOnlyExternalSearch();
    }

    public ngAfterViewInit() {
        setTimeout(() => {
            if (this.uniSearch) {
                this.uniSearch.focus();
            }
        }, 300);
    }

    public ngOnInit() {

        this.config = {
            title: 'Ny konto',
            initSearchCriteria: this.options.data.searchCritera,
            mode: null,
            question: 'Opprette ny konto',
            disableQuestion: false,
        };

        this.model$.next(this.config.model);
        this.uniSearchConfig.initialItem$.next({Name: this.options.data.searchCritera});
    }

    public createNewAccountAndCloseModal(accountType: string) {

        if (this.config.selectedItem) {

            const selectedItem = this.config.selectedItem;
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
                this.busy = true;
                this.customerService.Post(newAccount).subscribe(res => {
                    this.accountService.GetAll(`filter=AccountNumber eq ` + res.CustomerNumber).subscribe(resAcc => {
                            this.busy = false;
                            this.close(resAcc[0]);
                        }, err => err.handleError(err));
                    }, err => { err.handleError(err); this.busy = false; });
                }


            if (accountType === 'Supplier') {
                this.busy = true;
                this.supplierService.Post(newAccount).subscribe(res => {
                    this.accountService.GetAll(`filter=AccountNumber eq ` + res.SupplierNumber).subscribe(resAcc => {
                        this.busy = false;
                        this.close(resAcc[0]);
                        }, err => err.handleError(err));
                    }, err => { err.handleError(err); this.busy = false; });
                }
            }
        }
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

    public close(params: any = false) {
        this.onClose.emit(params);
    }
}

