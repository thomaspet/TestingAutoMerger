import {Component, Input, Output, EventEmitter, ElementRef, AfterViewInit, OnChanges} from '@angular/core';
import {FormControl} from '@angular/forms';
import {Customer, SellerLink, SharingType, StatusCodeSharing, Address} from '../../../unientities';
import {UniAddressModal} from '../../../../framework/uni-modal/modals/addressModal';
import {
    AddressService,
    EHFService,
    UniSearchCustomerConfig,
    CustomerService,
    ErrorService,
    SellerLinkService,
    StatisticsService,
    StatusService
} from '../../../services/services';
import {IUniSearchConfig} from '../../../../framework/ui/unisearch/index';
import {UniModalService, UniConfirmModalV2, ConfirmActions} from '../../../../framework/uni-modal';
import * as moment from 'moment';

@Component({
    selector: 'tof-customer-card',
    template: `
        <label class="customer-input">
            <!--<span>Kunde</span>-->
            <uni-search
                [config]="uniSearchConfig"
                (changeEvent)="customerSelected($event)"
                [disabled]="readonly">
            </uni-search>

            <section class="addressCard" [attr.aria-readonly]="readonly">
                <span *ngIf="!readonly" class="edit-btn" (click)="openAddressModal()"></span>
                <section class="sharing-badges">
                    <span [attr.title]="printTitle" [ngClass]="printClass">UTSKRIFT</span>
                    <span [attr.title]="vippsTitle" [ngClass]="vippsClass">VIPPS</span>
                    <span [attr.title]="emailTitle" [ngClass]="emailClass">E-POST</span>
                    <span [attr.title]="ehfTitle" [ngClass]="ehfClass">EHF</span>
                </section>
                <a href="#/sales/customer/{{entity?.Customer?.ID}}"><strong>{{entity?.Customer?.Info?.Name}}</strong></a>
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
                    <a href="#/sales/customer/{{entity?.Customer?.ID}}">
                        Kunden har {{customerDueInvoiceData.NumberOfDueInvoices}}
                        forfalt{{customerDueInvoiceData.NumberOfDueInvoices > 1 ? 'e' : ''}}
                        faktura{{customerDueInvoiceData.NumberOfDueInvoices > 1 ? 'er' : ''}}
                    </a>
                </div>
            </section>
        </label>
    `
})
export class TofCustomerCard implements AfterViewInit, OnChanges {
    private searchInput: HTMLElement;

    @Input() public readonly: boolean;
    @Input() public entity: any;
    @Input() private entityType: string;

    @Output() private entityChange: EventEmitter<any> = new EventEmitter();

    public ehfClass: string = 'badge-unavailable';
    public emailClass: string = 'badge-unavailable';
    public vippsClass: string = 'badge-unavailable';
    public printClass: string = 'badge-unavailable';
    public ehfTitle: string;
    public emailTitle: string;
    public vippsTitle: string;
    public printTitle: string = 'Sendt til utskrift';

    public uniSearchConfig: IUniSearchConfig;
    public customerDueInvoiceData: any;
    private lastPeppolAddressChecked: string;
    private lastCheckedStatisticsCustomerID: number;

    private emailControl: FormControl = new FormControl('');
    private yourRefControl: FormControl = new FormControl('');

    private customerExpands: string[] = [
        'Info.Addresses',
        'Info.ShippingAddress',
        'Info.InvoiceAddress',
        'Info.DefaultContact.Info',
        'Info.DefaultEmail',
        'DefaultSeller',
        'DefaultSeller.Seller',
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
        private uniSearchCustomerConfig: UniSearchCustomerConfig,
        private customerService: CustomerService,
        private errorService: ErrorService,
        private sellerLinkService: SellerLinkService,
        private modalService: UniModalService,
        private statisticsService: StatisticsService,
        private statusService: StatusService
    ) {
        this.uniSearchConfig = this.uniSearchCustomerConfig.generateDoNotCreate(this.customerExpands);
    }

    public ngAfterViewInit() {
        this.searchInput = this.elementRef.nativeElement.querySelector('input');
        this.focus();
    }

    private toBadgeClass(code: number): string {
        switch (code) {
            case StatusCodeSharing.InProgress:
                return 'badge-in-progress';
            case StatusCodeSharing.Failed:
                return 'badge-failed';
            case StatusCodeSharing.Completed:
                return 'badge-completed';
            default:
                return 'badge-unavailable';
        }
    }

    public ngOnChanges(changes) {
        if (changes['entity'] && this.entity) {

            if (this.entity.ID) { this.setSharingBadges(); }

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

            if (customer && this.entityType === 'CustomerInvoice') {
                // Can customer receive EHF?
                if (customer.PeppolAddress || customer.OrgNumber) {
                    const peppoladdress = customer.PeppolAddress ? customer.PeppolAddress : '9908:' + customer.OrgNumber;

                    if (peppoladdress !== this.lastPeppolAddressChecked) {
                        this.ehfService.GetAction(
                            null, 'is-ehf-receiver',
                            'peppoladdress=' + peppoladdress + '&entitytype=' + this.entityType
                        ).subscribe(enabled => {
                            if (enabled && this.ehfClass === 'badge-unavailable') {
                                this.ehfClass = 'badge-available';
                                this.ehfTitle = 'Kan sende EHF til ' + peppoladdress;
                            }
                            this.lastPeppolAddressChecked = peppoladdress;
                        }, err => this.errorService.handle(err));
                    }
                }
           }

            // Can customer receive email?
            if (customer && customer.Info && customer.Info.DefaultEmail) {
                this.emailClass = 'badge-available';
                this.emailTitle = 'Kan sende på e-post til ' + customer.Info.DefaultEmail.EmailAddress;
            }

            if (customer && customer.customerID) {
                if (customer.ID && customer.ID !== this.lastCheckedStatisticsCustomerID) {
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

    private setSharingBadges() {
        this.statisticsService.GetAllUnwrapped(
            `model=Sharing&filter=EntityType eq '${this.entityType}' and EntityID eq ${this.entity.ID}`
            + `&select=ID,Type,StatusCode,ExternalMessage,UpdatedAt,CreatedAt,To&orderby=ID desc`
        ).subscribe(sharings => {
            [SharingType.AP, SharingType.Email, SharingType.Vipps, SharingType.Print].forEach(type => {
                let cls = '';
                let title = '';
                const firstOfType = sharings.find(sharing => sharing.SharingType === type);
                if (firstOfType) {
                    cls = this.toBadgeClass(firstOfType.SharingStatusCode);
                    title = this.statusService.getSharingStatusText(firstOfType.SharingStatusCode);

                    if (firstOfType.SharingStatusCode === StatusCodeSharing.Completed && type !== SharingType.Print) {
                        title += ' til ' + firstOfType.SharingTo;
                    }

                    if (firstOfType.SharingExternalMessage) {
                        if (firstOfType.SharingExternalMessage === 'Opened by receiver') {
                            title += ' - Åpnet av mottaker';
                        } else if (firstOfType.SharingExternalMessage === 'Payed') {
                            title += ' - Betalt av mottaker';
                        } else {
                            title += ' - ' + firstOfType.SharingExternalMessage;
                        }
                    }

                    const date = moment(firstOfType.SharingUpdatedAt || firstOfType.SharingCreatedAt);
                    if (date.isValid()) {
                        title += '\n' + date.format('DD.MM.YYYY HH:mm');
                    }

                    switch (type) {
                        case SharingType.AP:
                            this.ehfClass = cls;
                            this.ehfTitle = title;
                            break;
                        case SharingType.Email:
                            this.emailClass = cls;
                            this.emailTitle = title;
                            break;
                        case SharingType.Vipps:
                            this.vippsClass = cls;
                            this.vippsTitle = title;
                            break;
                        case SharingType.Print:
                            this.printClass = cls;
                            this.printTitle = title;
                    }
                }
            });
        });
    }

    public focus() {
        if (this.searchInput) {
            this.searchInput.focus();
        }
    }

    public openAddressModal() {
        const invoiceAddress = <Address>{
            AddressLine1: this.entity.InvoiceAddressLine1,
            AddressLine2: this.entity.InvoiceAddressLine2,
            AddressLine3: this.entity.InvoiceAddressLine3,
            PostalCode: this.entity.InvoicePostalCode,
            City: this.entity.InvoiceCity,
            Country: this.entity.InvoiceCountry
        };

        this.modalService.open(UniAddressModal, {data: invoiceAddress}).onClose.subscribe(updatedInvoiceAddress => {
            if (updatedInvoiceAddress) {
                this.entity.InvoiceAddressLine1 = updatedInvoiceAddress.AddressLine1;
                this.entity.InvoiceAddressLine2 = updatedInvoiceAddress.AddressLine2;
                this.entity.InvoiceAddressLine3 = updatedInvoiceAddress.AddressLine3;
                this.entity.InvoicePostalCode = updatedInvoiceAddress.PostalCode;
                this.entity.InvoiceCity = updatedInvoiceAddress.City;
                this.entity.InvoiceCountry = updatedInvoiceAddress.Country;

                this.modalService.open(UniConfirmModalV2, {
                    header: 'Endre kunde?',
                    message: 'Endre framtidig fakturaadresse for denne kunden?',
                    buttonLabels: {
                        accept: 'Ja',
                        cancel: 'Nei, kun på denne blanketten'
                    }
                }).onClose.subscribe(response => {
                    if (response === ConfirmActions.ACCEPT) {
                        const customer = <Customer>{
                            ID: this.entity.CustomerID,
                            Info: {
                                ID: this.entity.Customer.BusinessRelationID,
                                InvoiceAddress: {
                                    ID: this.entity.Customer.Info.InvoiceAddressID,
                                    AddressLine1: updatedInvoiceAddress.AddressLine1,
                                    AddressLine2: updatedInvoiceAddress.AddressLine2,
                                    AddressLine3: updatedInvoiceAddress.AddressLine3,
                                    PostalCode: updatedInvoiceAddress.PostalCode,
                                    City: updatedInvoiceAddress.City,
                                    Country: updatedInvoiceAddress.Country
                                }
                            }
                        };
                        this.customerService.Put(this.entity.CustomerID, customer).subscribe();
                    }
                });
                this.entityChange.emit(this.entity);
            }
        });
    }

    public formFieldChange() {
        this.entity.EmailAddress = this.emailControl.value;
        this.entity.YourReference = this.yourRefControl.value;
        this.entityChange.emit(this.entity);
    }

    public customerSelected(customer: Customer) {
        if (customer) {
            this.entity.CustomerID = customer.ID || null;
            if (customer.Info) {
                this.entity.CustomerName = customer.Info.Name;
                this.mapAddressesToEntity(customer, customer.Info.Addresses || []);
            } else {
                this.entity.CustomerName = null;
            }
        }

        this.mapProjectToEntity(customer, this.entity);
        this.mapTermsToEntity(customer, this.entity);

        this.entity.YourReference = customer.Info.DefaultContact && customer.Info.DefaultContact.Info.Name
            ? customer.Info.DefaultContact.Info.Name : this.entity.YourReference;
        this.entity.EmailAddress = customer.Info.DefaultEmail && customer.Info.DefaultEmail.EmailAddress
            ? customer.Info.DefaultEmail.EmailAddress : this.entity.EmailAddress;

        // map sellers to entity
        const sellers = [];
        if (this.entity.Sellers.length === 0 && customer.ID > 0) {
            customer.Sellers.forEach((seller: SellerLink) => {
                sellers.push({
                    Percent: seller.Percent,
                    SellerID: seller.SellerID,
                    Seller: seller.Seller,
                    _createguid: this.sellerLinkService.getNewGuid(),
                });
            });
            this.entity.Sellers = sellers;

            // map main seller to entity
            if (customer.DefaultSellerID) {
                this.entity.DefaultSeller = Object.assign({}, customer.DefaultSeller);
            }
        }

        this.entity.Customer = customer;
        this.entityChange.emit(this.entity);
    }

    private mapProjectToEntity(customer: Customer, entity: any) {
        if (entity.DefaultDimensions && customer.Dimensions && customer.Dimensions.ProjectID) {
            entity.DefaultDimensions.ProjectID = customer.Dimensions.ProjectID;
        }
    }

    private mapTermsToEntity(customer: Customer, entity: any) {
        if (customer.PaymentTerms) {
            entity.PaymentTerms = customer.PaymentTerms;
            entity.PaymentTermsID = customer.PaymentTermsID;
        }

        if (customer.DeliveryTerms) {
            entity.DeliveryTerms = customer.DeliveryTerms;
            entity.DeliveryTermsID = customer.DeliveryTermsID;
        }
    }

    private mapAddressesToEntity(customer, addresses) {
        const info = customer.Info || {};
        if (info.InvoiceAddressID) {
            const invoiceAddress = addresses.find(addr => addr.ID === info.InvoiceAddressID);
            this.addressService.addressToInvoice(this.entity, invoiceAddress);
        } else {
            const invoiceAddress = addresses.find(addr => addr !== null);
            this.addressService.addressToInvoice(this.entity, invoiceAddress);
        }

        if (info.ShippingAddressID) {
            const shippingAddress = addresses.find(addr => addr.ID === info.ShippingAddressID);
            this.addressService.addressToShipping(this.entity, shippingAddress);
        } else {
            const shippingAddress = addresses.find(addr => addr !== null);
            this.addressService.addressToShipping(this.entity, shippingAddress);
        }
    }
}
