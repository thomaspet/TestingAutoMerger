import {Component, Input, Output, EventEmitter, ViewChild, ElementRef} from '@angular/core';
import {Customer} from '../../../unientities';
import {CustomerDetailsModal} from '../customer/customerDetails/customerDetailsModal';
import {AddressModal} from '../../common/modals/modals';
import {AddressService, EHFService, UniSearchConfigGeneratorService} from '../../../services/services';
import {Observable} from 'rxjs/Rx';
import {IUniSearchConfig} from 'unisearch-ng2/src/UniSearch/UniSearch';


@Component({
    selector: 'tof-customer-card',
    template: `
        <label>
            <span>Kunde</span>
            <uni-search
                [config]="uniSearchConfig"
                (changeEvent)="selectCustomer($event)"
                [disabled]="readonly"
            ></uni-search>
        </label>

        <section *ngIf="entity?.Customer" class="addressCard"
                 [attr.aria-readonly]="readonly">
            <span class="edit-btn" (click)="openCustomerModal()"></span>
            <span *ngIf="ehfEnabled" class="ehf">EHF</span>
            <strong>{{entity.Customer.Info?.Name}}</strong>
            <br><span *ngIf="entity.InvoiceAddressLine1">
                {{entity.InvoiceAddressLine1}}
            </span>
            <br><span *ngIf="entity.InvoicePostalCode || entity.InvoiceCity">
                {{entity.InvoicePostalCode}} {{entity.InvoiceCity}}
            </span>
            <br><span *ngIf="entity.InvoiceCountry">
                {{entity.InvoiceCountry}}
            </span>
            <span class="emailInfo" *ngIf="entity.Customer?.Info?.Emails">
                {{entity?.Customer?.Info?.Emails[0]?.EmailAddress}}
            </span>
        </section>

        <customer-details-modal></customer-details-modal>
        <address-modal></address-modal>
    `
})
export class TofCustomerCard {
    @ViewChild(AddressModal)
    private addressModal: AddressModal;

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

    private customerExpands: [string] = [
        'Info.Addresses',
        'Info.ShippingAddress',
        'Info.InvoiceAddress',
        'Dimensions.Project',
        'Dimensions.Department'
    ];

    constructor(
        private addressService: AddressService,
        private ehfService: EHFService,
        private elementRef: ElementRef,
        private uniSearchConfigGeneratorService: UniSearchConfigGeneratorService
    ) {}

    public ngOnInit() {
        this.uniSearchConfig = this.uniSearchConfigGeneratorService.generateUniSearchConfig(
            Customer,
            this.customerExpands,
            () => this.openCustomerModal()
        );
    }

    public ngAfterViewInit() {
        this.searchInput = this.elementRef.nativeElement.querySelector('input');
        this.searchInput.focus();
    }

    public ngOnChanges(changes) {
        if (changes['entity'] && this.entity) {
            const customer: any = this.entity.Customer || {Info: {}};
            this.uniSearchConfig.initialItem$.next(customer);
            var peppoladdress = customer.PeppolAddress ? customer.PeppolAddress : '9908:' + customer.OrgNumber;
            this.ehfService.GetAction(
                null, 'is-ehf-receiver',
                'peppoladdress=' + peppoladdress + '&entitytype=' + this.entityType
            ).subscribe(enabled => {
                this.ehfEnabled = enabled;
            });
        }
    }

    public focus() {
        this.searchInput.focus();
    }

    public openCustomerModal(): Observable<Customer> {
        this.customerDetailsModal.open(this.entity.CustomerID);
        return this.customerDetailsModal.customerUpdated;
    }

    public openAddressModal() {
        if (this.readonly) {
            return;
        }
        let address = this.addressService.invoiceToAddress(this.entity);
        this.addressModal.openModal(address, false, 'Fakuraadresse');
        this.addressModal.Changed.subscribe((modalValue) => {
            this.addressService.addressToInvoice(this.entity, modalValue);
        });
    }

    public selectCustomer(customer: Customer) {
        if (customer) {
            this.entity.CustomerID = customer.ID;
            this.entity.CustomerName = customer.Info.Name;

            const addresses = customer.Info.Addresses || [];
            this.mapAddresses(customer, addresses);
        } else {
            this.entity.CustomerID = null;
            this.entity.CustomerName = null;
        }

        this.entity.Customer = customer;
        this.entity['_shippingAddressID'] = null; // reset when entering deliveryForm
        this.entityChange.emit(this.entity);
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
