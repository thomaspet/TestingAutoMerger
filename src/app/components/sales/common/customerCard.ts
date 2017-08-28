import {Component, Input, Output, EventEmitter, ViewChild, ElementRef} from '@angular/core';
import {FormControl} from '@angular/forms';
import {Customer, SellerLink} from '../../../unientities';
import {CustomerDetailsModal} from '../customer/customerDetails/customerDetailsModal';
import {
    AddressService,
    EHFService,
    UniSearchConfigGeneratorService,
    CustomerService,
    ErrorService,
    SellerLinkService
} from '../../../services/services';
import {Observable} from 'rxjs/Observable';
import {IUniSearchConfig} from '../../../../framework/ui/unisearch/index';

@Component({
    selector: 'tof-customer-card',
    template: `
        <fieldset>
            <legend>Kunde</legend>

            <label class="customer-input">
                <!--<span>Kunde</span>-->
                <uni-search
                    [config]="uniSearchConfig"
                    (changeEvent)="customerSelected($event)"
                    [disabled]="readonly">
                </uni-search>

                <section class="addressCard" [attr.aria-readonly]="readonly">
                    <span class="edit-btn" (click)="openCustomerModal()"></span>
                    <span *ngIf="ehfEnabled" class="ehf">EHF</span>
                    <strong>{{entity?.Customer?.Info?.Name}}</strong>
                    <br><span *ngIf="entity?.InvoiceAddressLine1">
                        {{entity?.InvoiceAddressLine1}}
                    </span>
                    <br><span *ngIf="entity?.InvoicePostalCode || entity?.InvoiceCity">
                        {{entity?.InvoicePostalCode}} {{entity?.InvoiceCity}}
                    </span>
                    <br><span *ngIf="entity?.InvoiceCountry">
                        {{entity?.InvoiceCountry}}
                    </span>
                    <span class="emailInfo" *ngIf="entity?.Customer?.Info?.Emails">
                        {{entity?.Customer?.Info?.Emails[0]?.EmailAddress}}
                    </span>
                    <div class="unpaid-invoices" *ngIf="customerDueInvoiceData?.NumberOfDueInvoices > 0">
                        <a href="#/sales/customer/{{entity?.Customer?.ID}}">Kunden har {{customerDueInvoiceData.NumberOfDueInvoices}} forfalt{{customerDueInvoiceData.NumberOfDueInvoices > 1 ? 'e' : ''}} faktura{{customerDueInvoiceData.NumberOfDueInvoices > 1 ? 'er' : ''}}</a>
                    </div>
                </section>
            </label>
        </fieldset>

        <customer-details-modal></customer-details-modal>
    `
})
export class TofCustomerCard {
    private searchInput: HTMLElement;

    @ViewChild(CustomerDetailsModal)
    public customerDetailsModal: CustomerDetailsModal;

    @Input()
    private readonly: boolean;

    @Input()
    private entity: any;

    @Input()
    private entityType: string;

    @Output()
    private entityChange: EventEmitter<any> = new EventEmitter();

    private ehfEnabled: boolean;
    public uniSearchConfig: IUniSearchConfig;
    private customerDueInvoiceData: any;
    private lastPeppolAddressChecked: string;
    private lastCheckedStatisticsCustomerID: number;

    private emailControl: FormControl = new FormControl('');
    private yourRefControl: FormControl = new FormControl('');

    private customerExpands: [string] = [
        'Info.Addresses',
        'Info.ShippingAddress',
        'Info.InvoiceAddress',
        'Info.DefaultEmail',
        'Dimensions.Project',
        'Dimensions.Department',
        'Sellers',
        'Sellers.Seller',
        'PaymentTerms',
        'DeliveryTerms'
    ];

    constructor(
        private addressService: AddressService,
        private ehfService: EHFService,
        private elementRef: ElementRef,
        private uniSearchConfigGeneratorService: UniSearchConfigGeneratorService,
        private customerService: CustomerService,
        private errorService: ErrorService,
        private sellerLinkService: SellerLinkService
    ) {
        this.uniSearchConfig = this.uniSearchConfigGeneratorService.generate(
            Customer,
            this.customerExpands,
            () => this.openCustomerModal()
        );
    }

    public ngAfterViewInit() {
        this.searchInput = this.elementRef.nativeElement.querySelector('input');
        this.focus();
    }

    public ngOnChanges(changes) {
        if (changes['entity'] && this.entity) {
            this.customerDueInvoiceData = null;

            const customer: any = this.entity.Customer || {Info: {Name: ''}};
            if (this.uniSearchConfig) {
                this.uniSearchConfig.initialItem$.next(customer);
            } else {
                setTimeout(() => {
                    if (this.uniSearchConfig) {
                        this.uniSearchConfig.initialItem$.next(customer);
                    }
                });
            }


            if (customer && customer.ID) {
                let peppoladdress = customer.PeppolAddress ? customer.PeppolAddress : '9908:' + customer.OrgNumber;

                if (peppoladdress !== this.lastPeppolAddressChecked) {
                    this.ehfService.GetAction(
                        null, 'is-ehf-receiver',
                        'peppoladdress=' + peppoladdress + '&entitytype=' + this.entityType
                    ).subscribe(enabled => {
                        this.ehfEnabled = enabled;
                        this.lastPeppolAddressChecked = peppoladdress;
                    }, err => this.errorService.handle(err));
                }

                if (customer.ID !== this.lastCheckedStatisticsCustomerID) {
                    this.customerService.getCustomerStatistics(customer.ID)
                        .subscribe(x => {
                            this.lastCheckedStatisticsCustomerID = customer.ID;
                            if (x) {
                                this.customerDueInvoiceData = x;
                            }
                        }, err => this.errorService.handle(err)
                    );
                }

                this.emailControl.setValue(this.entity.EmailAddress, {emitEvent: false});
                this.yourRefControl.setValue(this.entity.YourReference, {emitEvent: false});
            }
        }
    }

    public focus() {
        if (this.searchInput) {
            this.searchInput.focus();
        }
    }

    public openCustomerModal(): Observable<Customer> {
        if (!this.readonly) {
            this.customerDetailsModal.open(this.entity.CustomerID);
            return this.customerDetailsModal.customerUpdated;
        }
    }

    public formFieldChange() {
        this.entity.EmailAddress = this.emailControl.value;
        this.entity.YourReference = this.yourRefControl.value;
        this.entityChange.emit(this.entity);
    }

    public customerSelected(customer: Customer) {
        if (customer) {
            this.entity.CustomerID = customer.ID;
            this.entity.CustomerName = customer.Info.Name;

            const addresses = customer.Info.Addresses || [];
            this.mapAddresses(customer, addresses);
        } else {
            this.entity.CustomerID = null;
            this.entity.CustomerName = null;
        }
        this.mapCustomerTermsToEntity(customer, this.entity);

        if (customer.Info.DefaultEmail) {
            this.entity.EmailAddress = customer.Info.DefaultEmail.EmailAddress;
        }

        let sellers = [];
        if (this.entity.Sellers.length === 0) {
            customer.Sellers.forEach((seller: SellerLink) => {
                sellers.push({
                    Percent: seller.Percent,
                    SellerID: seller.SellerID,
                    Seller: seller.Seller,
                    _createguid: this.sellerLinkService.getNewGuid(),
                    _mainseller: seller.ID === customer.DefaultSellerLinkID
                });
            });
            this.entity.Sellers = sellers;
        }

        this.entity.Customer = customer;

        this.entityChange.emit(this.entity);
    }

    private mapCustomerTermsToEntity(customer: Customer, entity: any) {
        if (!entity.PaymentTermsID && customer.PaymentTerms) {
            entity.PaymentTerms = customer.PaymentTerms;
            entity.PaymentTermsID = customer.PaymentTermsID;
        }

        if (!entity.DeliveryTermsID && customer.DeliveryTerms) {
            entity.DeliveryTerms = customer.DeliveryTerms;
            entity.DeliveryTermsID = customer.DeliveryTermsID;
        }
    }

    private mapAddresses(customer, addresses) {
        const info = customer.Info || {};
        if (info.InvoiceAddressID) {
            let invoiceAddress = addresses.find(addr => addr.ID === info.InvoiceAddressID);
            this.addressService.addressToInvoice(this.entity, invoiceAddress);
        }

        if (info.ShippingAddressID) {
            let shippingAddress = addresses.find(addr => addr.ID === info.ShippingAddressID);
            this.addressService.addressToShipping(this.entity, shippingAddress);
        }
    }
}
