import {Component, Input, Output, EventEmitter, ElementRef} from '@angular/core';
import {FormControl} from '@angular/forms';
import {Customer, SellerLink, SharingType, StatusCodeSharing} from '../../../unientities';
import {CustomerDetailsModal} from '../customer/customerDetails/customerDetailsModal';
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
import {UniModalService} from '../../../../framework/uniModal/barrel';
import * as moment from 'moment';

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
                    <span *ngIf="!readonly" class="edit-btn" (click)="openCustomerModal(entity.CustomerID)"></span>
                    <section class="sharing-badges">
                        <span [attr.title]="vippsTitle" [ngClass]="vippsClass">VIPPS</span>
                        <span [attr.title]="emailTitle" [ngClass]="emailClass">EPOST</span>
                        <span [attr.title]="ehfTitle" [ngClass]="ehfClass">EHF</span>
                    </section>
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
                        <a href="#/sales/customer/{{entity?.Customer?.ID}}">
                            Kunden har {{customerDueInvoiceData.NumberOfDueInvoices}}
                            forfalt{{customerDueInvoiceData.NumberOfDueInvoices > 1 ? 'e' : ''}}
                            faktura{{customerDueInvoiceData.NumberOfDueInvoices > 1 ? 'er' : ''}}
                        </a>
                    </div>
                </section>
            </label>
        </fieldset>
    `
})
export class TofCustomerCard {
    private searchInput: HTMLElement;

    @Input() public readonly: boolean;
    @Input() private entity: any;
    @Input() private entityType: string;

    @Output() private entityChange: EventEmitter<any> = new EventEmitter();

    private ehfClass: string = 'badge-unavailable';
    private emailClass: string = 'badge-unavailable';
    private vippsClass: string = 'badge-unavailable';
    private ehfTitle: string;
    private emailTitle: string;
    private vippsTitle: string;

    public uniSearchConfig: IUniSearchConfig;
    private customerDueInvoiceData: any;
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
        this.uniSearchConfig = this.uniSearchCustomerConfig.generateDoNotCreate(
            this.customerExpands,
            () => this.openCustomerModal(null)
        );
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
                    let peppoladdress = customer.PeppolAddress ? customer.PeppolAddress : '9908:' + customer.OrgNumber;

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
                this.emailTitle = 'Kan sende på epost til ' + customer.Info.DefaultEmail.EmailAddress;
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
        this.statisticsService.GetAllUnwrapped(`model=Sharing&filter=EntityType eq '${this.entityType}' and EntityID eq ${this.entity.ID}&select=ID,Type,StatusCode,ExternalMessage,UpdatedAt,CreatedAt,To&orderby=ID desc`).subscribe(sharings => {
            [SharingType.AP, SharingType.Email, SharingType.Vipps].forEach(type => {
                let cls = '';
                let title = '';
                let firstOfType = sharings.find(sharing => sharing.SharingType === type);
                if (firstOfType) {
                    cls = this.toBadgeClass(firstOfType.SharingStatusCode);
                    title = this.statusService.getSharingStatusText(firstOfType.SharingStatusCode);

                    if (firstOfType.SharingStatusCode === StatusCodeSharing.Completed) {
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

                    let date = moment(firstOfType.SharingUpdatedAt || firstOfType.SharingCreatedAt);
                    if (date.isValid()) {
                        title += '\n' + date.format('DD.MM.YYYY HH:mm');
                    }

                    switch(type) {
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

    public openCustomerModal(id) {
        let returnValue = this.modalService.open(CustomerDetailsModal, { data: { ID: id }}).onClose;
        returnValue.subscribe((res: Customer) => {
            if (res) {
                this.customerSelected(res);
            }
        });
        return returnValue;
    }

    public formFieldChange() {
        this.entity.EmailAddress = this.emailControl.value;
        this.entity.YourReference = this.yourRefControl.value;
        this.entityChange.emit(this.entity);
    }

    public customerSelected(customer: Customer) {

        if (customer && customer.ID > 0) {
            this.entity.CustomerID = customer.ID;
            this.entity.CustomerName = customer.Info.Name;

            const addresses = customer.Info.Addresses || [];
            this.mapAddressesToEntity(customer, addresses);
        } else {
            this.entity.CustomerID = null;
            let cName = customer ? customer.Info.Name : null;
            this.entity.CustomerName = cName;
        }
        this.mapProjectToEntity(customer, this.entity);
        this.mapTermsToEntity(customer, this.entity);

        this.entity.YourReference = customer.Info.DefaultContact && customer.Info.DefaultContact.Info.Name
            ? customer.Info.DefaultContact.Info.Name : this.entity.YourReference;
        this.entity.EmailAddress = customer.Info.DefaultEmail && customer.Info.DefaultEmail.EmailAddress
            ? customer.Info.DefaultEmail.EmailAddress : this.entity.EmailAddress;

        // map sellers to entity
        let sellers = [];
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
            let invoiceAddress = addresses.find(addr => addr.ID === info.InvoiceAddressID);
            this.addressService.addressToInvoice(this.entity, invoiceAddress);
        }

        if (info.ShippingAddressID) {
            let shippingAddress = addresses.find(addr => addr.ID === info.ShippingAddressID);
            this.addressService.addressToShipping(this.entity, shippingAddress);
        }
    }
}
