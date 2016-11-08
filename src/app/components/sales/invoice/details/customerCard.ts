import {Component, Input, Output, EventEmitter, ViewChild, ElementRef} from '@angular/core';
import {FormControl} from '@angular/forms';
import {CustomerInvoice, Customer, StatusCodeCustomerInvoice} from '../../../../unientities';
import {AddressModal} from '../../../common/modals/modals';
import {AddressService, CustomerService} from '../../../../services/services';
import {Observable} from 'rxjs/Rx';
declare const _;

@Component({
    selector: 'invoice-customer-card',
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

        <section *ngIf="invoice" class="customerInfo" (click)="openAddressModal()">
            <span class="edit-btn" (click)="openAddressModal()"></span>
            <strong>{{invoice.Customer?.Info?.Name}}</strong>
            <br><span *ngIf="invoice.InvoiceAddressLine1">
                {{invoice.InvoiceAddressLine1}}
            </span>
            <br><span *ngIf="invoice.InvoicePostalCode || invoice.InvoiceCity">
                {{invoice.InvoicePostalCode}} {{InvoiceCity}}
            </span>
            <br><span *ngIf="invoice.InvoiceCountry">
                {{invoice.InvoiceCountry}}
            </span>
            <span class="emailInfo" *ngIf="invoice.Customer?.Info?.Emails">
                {{invoice?.Customer?.Info?.Emails[0]?.EmailAddress}}
            </span>
        </section>
        <address-modal></address-modal>
    `
})
export class CustomerCard {
    @ViewChild(AddressModal)
    private addressModal: AddressModal;

    @ViewChild('searchInput')
    private searchInput: ElementRef;

    @ViewChild('list')
    private list: ElementRef;

    @Input()
    private invoice: CustomerInvoice;

    @Output()
    private invoiceChange: EventEmitter<CustomerInvoice>;

    private control: FormControl = new FormControl();
    private initialDisplayValue: string;
    private focusPositionTop: number = 0;
    private selectedIndex: number = -1;
    private expanded: boolean;
    private lookupResults: Customer[] = [];
    private readonly: boolean;
    private busy: boolean;

    constructor(private addressService: AddressService,
                private customerService: CustomerService) {
        this.invoiceChange = new EventEmitter<CustomerInvoice>();
        this.control.valueChanges
            .switchMap((input) => {
                this.busy = true;
                return Observable.of(input);
            })
            .debounceTime(200)
            .subscribe(value => this.performLookup(value));
    }

    public ngOnChanges(changes) {
        if (changes['invoice'] && this.invoice) {
            const customer: any = this.invoice.Customer || {Info: {}};
            this.initialDisplayValue = customer.Info.Name || '';
            this.control.setValue(this.initialDisplayValue, {emitEvent: false});
            this.readonly = this.invoice.StatusCode && this.invoice.StatusCode !== StatusCodeCustomerInvoice.Draft;
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

    public openAddressModal() {
        if (this.readonly) {
            return;
        }
        let address = this.addressService.invoiceToAddress(this.invoice);
        this.addressModal.openModal(address, false, 'Fakuraadresse');
        this.addressModal.Changed.subscribe((modalValue) => {
            this.addressService.addressToInvoice(this.invoice, modalValue);
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
        if (this.control.value.length || this.selectedIndex > -1) {
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
            this.invoice.CustomerID = customer.ID;
            this.invoice.CustomerName = customer.Info.Name;

            const addresses = customer.Info.Addresses || [];
            this.addressService.addressToInvoice(this.invoice, addresses[0]);
        } else {
            this.control.setValue('', {emitEvent: false});
            this.invoice.CustomerID = null;
            this.invoice.CustomerName = null;
        }

        this.invoice.Customer = customer;
        this.invoiceChange.next(_.cloneDeep(this.invoice));
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
        });
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
