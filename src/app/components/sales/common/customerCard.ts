import {Component, Input, Output, EventEmitter, ViewChild, ElementRef} from '@angular/core';
import {FormControl} from '@angular/forms';
import {Customer} from '../../../unientities';
import {CustomerDetailsModal} from '../customer/customerDetails/customerDetailsModal';
import {AddressModal} from '../../common/modals/modals';
import {AddressService, CustomerService, EHFService} from '../../../services/services';
import {Observable} from 'rxjs/Rx';
import {ErrorService} from '../../../services/common/ErrorService';
declare const _;

@Component({
    selector: 'tof-customer-card',
    template: `
        <label>
            <span>Kunde</span>
            <section class="autocomplete">
                <input #searchInput
                       class="autocomplete_input"
                       [formControl]="control"
                       [readonly]="readonly"
                       [attr.aria-readonly]="readonly"
                       (keydown)="onKeydown($event)"
                       (blur)="onBlur()"
                       role="combobox"
                       autocomplete="false"
                       aria-autocomplete="inline"
                       autofocus
                />

                <button class="uni-autocomplete-searchBtn"
                        [disabled]="readonly"
                        (click)="toggleDropdown()"
                        (keydown.esc)="onKeydown($event)"
                        tabindex="-1">Søk
                </button>

                <ul #list
                    class ="uniTable_dropdown_list"
                    role="listbox"
                    tabindex="-1"
                    [attr.aria-expanded]="expanded">

                    <li *ngFor="let item of lookupResults; let idx = index"
                        class="autocomplete_result"
                        role="option"
                        (mouseover)="selectedIndex = idx"
                        (click)="selectCustomer()"
                        [attr.aria-selected]="selectedIndex === idx">

                        {{item.CustomerNumber}} - {{item?.Info?.Name}}
                    </li>
                </ul>

            </section>
        </label>

        <section *ngIf="entity?.Customer" class="addressCard"
                 [attr.aria-readonly]="readonly">
            <span class="edit-btn" (click)="openCustomerModal()"></span>
            <span *ngIf="ehfEnabled" class="ehf">EHF</span>
            <strong>{{entity.Customer?.Info?.Name}}</strong>
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
        <a *ngIf="!readonly" class="new-customer" (click)="customerDetailsModal.open()">
            Ny kunde
        </a>

        <customer-details-modal (customerUpdated)="refreshCustomer($event)"></customer-details-modal>
        <address-modal></address-modal>
    `
})
export class TofCustomerCard {
    @ViewChild(AddressModal)
    private addressModal: AddressModal;

    @ViewChild('searchInput')
    private searchInput: ElementRef;

    @ViewChild(CustomerDetailsModal)
    public customerDetailsModal: CustomerDetailsModal;

    @ViewChild('list')
    private list: ElementRef;

    @Input()
    private readonly: boolean;

    @Input()
    private entity: any;

    @Input()
    private entityType: string;

    @Output()
    private entityChange: EventEmitter<any> = new EventEmitter();

    private control: FormControl = new FormControl();
    private initialDisplayValue: string;
    private focusPositionTop: number = 0;
    private selectedIndex: number = -1;
    private expanded: boolean;
    private lookupResults: Customer[] = [];
    private busy: boolean;
    private ehfEnabled: boolean;

    constructor(
        private addressService: AddressService,
        private customerService: CustomerService,
        private errorService: ErrorService,
        private ehfService: EHFService
    ) {}

    public ngOnInit() {
        this.control.valueChanges.switchMap((input) => {
            this.busy = true;
            return Observable.of(input);
        })
        .debounceTime(200)
        .subscribe(value => this.performLookup(value));
    }

    public ngAfterViewInit() {
        this.searchInput.nativeElement.focus();
    }

    public ngOnChanges(changes) {
        if (changes['entity'] && this.entity) {
            const customer: any = this.entity.Customer || {Info: {}};
            this.initialDisplayValue = customer.Info.Name || '';
            this.control.setValue(this.initialDisplayValue, {emitEvent: false});
            var peppoladdress = customer.PeppolAddress ? customer.PeppolAddress : '9908:' + customer.OrgNumber;
            this.ehfService.GetAction(null, 'is-ehf-receiver', 'peppoladdress=' + peppoladdress + '&entitytype=' + this.entityType).subscribe(enabled => {
                this.ehfEnabled = enabled;
            });
        }
    }

    public focus() {
        this.searchInput.nativeElement.focus();
    }

    public onBlur() {
        setTimeout(() => {
            if (this.expanded) {
                this.expanded = false;
            }
        }, 200);
    }

    public newCustomerFromModal(customer: Customer) {
        if (!customer) {
            return;
        }

        const info: any = customer.Info || {};
        this.addressService.addressToShipping(this.entity, info.ShippingAddress);
        this.addressService.addressToInvoice(this.entity, info.InvoiceAddress);

        this.control.setValue(info.Name, {emitEvent: false});
        this.entity.CustomerID = customer.ID;
        this.entity.CustomerName = info.Name;
        this.entity.Customer = customer;
        this.entity['_shippingAddressID'] = null; // reset when entering deliveryForm
        this.entityChange.next(_.cloneDeep(this.entity));
    }

    public refreshCustomer(customerID: number) {
        this.customerService.Get(
            customerID,
            ['Info', 'Info.Addresses', 'Info.ShippingAddress', 'Info.InvoiceAddress', 'Dimensions', 'Dimensions.Project', 'Dimensions.Department']
        ).subscribe(
            (customer) => {
                const info: any = customer.Info || {};
                this.addressService.addressToShipping(this.entity, info.ShippingAddress);
                this.addressService.addressToInvoice(this.entity, info.InvoiceAddress);

                this.control.setValue(info.Name, {emitEvent: false});
                this.entity.CustomerID = customer.ID;
                this.entity.CustomerName = info.Name;
                this.entity.Customer = customer;
                this.entityChange.next(_.cloneDeep(this.entity));
            },
            err => this.errorService.handle(err)
        );
    }

    public openCustomerModal() {
        if (!this.readonly) {
            this.customerDetailsModal.open(this.entity.CustomerID);
        }
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

    public selectCustomer() {
        if (this.busy) {
            setTimeout(() => this.selectCustomer(), 100);
            return;
        }

        this.expanded = false;
        this.focusPositionTop = 0;

        if (this.selectedIndex === -1 && this.control.value === this.initialDisplayValue) {
            return;
        }

        let customer: Customer;
        if (this.control.value || this.selectedIndex > -1) {
            const index = (this.selectedIndex > -1) ? this.selectedIndex : 0;
            customer = this.lookupResults[index];
        } else {
            customer = null;
        }

        this.selectedIndex = -1;
        this.initialDisplayValue = customer ? customer.Info.Name : '';
        this.control.setValue(this.initialDisplayValue, {emitEvent: false});

        if (customer) {
            this.control.setValue(customer.Info.Name, {emitEvent: false});
            this.entity.CustomerID = customer.ID;
            this.entity.CustomerName = customer.Info.Name;

            const addresses = customer.Info.Addresses || [];
            this.mapAddresses(customer, addresses);
            // this.addressService.addressToInvoice(this.entity, addresses[0]);
        } else {
            this.control.setValue('', {emitEvent: false});
            this.entity.CustomerID = null;
            this.entity.CustomerName = null;
        }

        this.entity.Customer = customer;
        this.entity['_shippingAddressID'] = null; // reset when entering deliveryForm
        this.entityChange.next(_.cloneDeep(this.entity));
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

    public performLookup(query: string) {
        this.busy = true;
        this.customerService.GetAll(
            `filter=contains(Info.Name,'${query}') or startswith(CustomerNumber,'${query}')&top=30`,
            ['Info', 'Info.Addresses']
        ).subscribe((response) => {
            this.lookupResults = response;
            this.selectedIndex = (this.control.value) ? 0 : -1;
            this.expanded = true;
            this.busy = false;
        }, err => this.errorService.handle(err));
    }

    public onKeydown(event: KeyboardEvent) {
        const key = event.which || event.keyCode;

        switch (key) {
            case 9:
            case 13:
                this.selectCustomer();
            break;
            // Escape
            case 27:
                this.expanded = false;
                this.selectedIndex = -1;
                this.control.setValue(this.initialDisplayValue, {emitEvent: false});
                this.searchInput.nativeElement.focus();
                try {
                    this.searchInput.nativeElement.select();
                } catch (e) {}
            break;
            case 38:
                event.preventDefault();
                if (this.selectedIndex > 0) {
                    this.selectedIndex--;
                    this.scrollToListItem();
                }
            break;
            case 40:
                event.preventDefault();
                if (event.altKey && !this.expanded) {
                    this.toggleDropdown();
                    return;
                }

                if (this.selectedIndex < (this.lookupResults.length - 1)) {
                    this.selectedIndex++;
                    this.scrollToListItem();
                }
            break;
            case 115:
                this.toggleDropdown();
            break;
        }
    }

    private scrollToListItem() {
        const list = this.list.nativeElement;
        const currItem = list.children[this.selectedIndex];
        const bottom = list.scrollTop + list.offsetHeight - currItem.offsetHeight;

        if (currItem.offsetTop <= list.scrollTop) {
            list.scrollTop = currItem.offsetTop;
        } else if (currItem.offsetTop >= bottom) {
            list.scrollTop = currItem.offsetTop - (list.offsetHeight - currItem.offsetHeight);
        }
    }



    public toggleDropdown() {
        if (this.expanded) {
            this.lookupResults = [];
            this.expanded = false;
        } else if (!this.readonly) {
            this.performLookup('');
            this.expanded = true;
        }
        this.searchInput.nativeElement.focus();
    }

}
