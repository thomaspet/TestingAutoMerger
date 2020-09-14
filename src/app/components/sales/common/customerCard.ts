import {Component, Input, Output, EventEmitter, ViewChild} from '@angular/core';
import {FormControl} from '@angular/forms';
import {Customer} from '@uni-entities';
import {
    CustomerService,
    ErrorService,
    StatisticsService,
    EHFService,
} from '@app/services/services';
import {TofHelper} from '../salesHelper/tofHelper';
import {UniModalService} from '@uni-framework/uni-modal';
import {AutocompleteOptions, Autocomplete} from '@uni-framework/ui/autocomplete/autocomplete';
import {CustomerEditModal} from './customer-edit-modal/customer-edit-modal';
import {cloneDeep} from 'lodash';

@Component({
    selector: 'tof-customer-card',
    template: `
        <autocomplete class="customer-select"
            [options]="autocompleteOptions"
            [readonly]="readonly"
            [value]="entity?.Customer"
            (valueChange)="onCustomerSelected($event)">
        </autocomplete>

        <section *ngIf="entity" class="addressCard" [attr.aria-readonly]="readonly">
            <i *ngIf="!readonly && !!entity?.Customer" class="edit-btn material-icons" (click)="editCustomer()">edit</i>

            <a href="#/sales/customer/{{entity?.Customer?.ID}}">
                <strong>{{entity?.CustomerName}}</strong>
            </a>

            <div *ngIf="entity?.InvoiceAddressLine1">
                {{entity?.InvoiceAddressLine1}}
            </div>

            <div *ngIf="entity?.InvoicePostalCode || entity?.InvoiceCity">
                {{entity?.InvoicePostalCode}} {{entity?.InvoiceCity}}
            </div>

            <div *ngIf="entity?.InvoiceCountry">
                {{entity?.InvoiceCountry}}
            </div>

            <div *ngIf="entity?.Customer?.Info?.Emails">
                {{entity?.Customer?.Info?.Emails[0]?.EmailAddress}}
            </div>
        </section>

        <section class="sharing-badges">
            <span *ngIf="canSendEHF" matTooltip="Kunden kan motta EHF">EHF</span>
            <span *ngIf="canSendEfaktura" matTooltip="Kunden kan motta eFaktura">eFaktura</span>
        </section>
    `
})
export class TofCustomerCard {
    @ViewChild(Autocomplete, { static: true }) autocomplete: Autocomplete;

    @Input() readonly: boolean;
    @Input() entity: any;
    @Input() entityType: string;

    @Output() entityChange: EventEmitter<any> = new EventEmitter();

    autocompleteOptions: AutocompleteOptions;

    private customerExpands: string[] = [
        'Info.Addresses',
        'Info.Emails',
        'Info.Phones',
        'Info.ShippingAddress',
        'Info.InvoiceAddress',
        'Info.DefaultEmail',
        'Info.DefaultPhone',
        'Info.DefaultContact.Info',
        'Info.Contacts.Info',
        'DefaultSeller',
        'DefaultSeller.Seller',
        'Dimensions.Project',
        'Dimensions.Department',
        'Dimensions.Dimension5',
        'Dimensions.Dimension6',
        'Dimensions.Dimension7',
        'Dimensions.Dimension8',
        'Dimensions.Dimension9',
        'Dimensions.Dimension10',
        'Sellers',
        'Sellers.Seller',
        'PaymentTerms',
        'DeliveryTerms',
        'Distributions'
    ];

    lastPeppolAddressChecked: string;
    canSendEHF: boolean;
    canSendEfaktura: boolean;

    constructor(
        private customerService: CustomerService,
        private errorService: ErrorService,
        private modalService: UniModalService,
        private statisticsService: StatisticsService,
        private tofHelper: TofHelper,
        private ehfService: EHFService,
    ) {}

    ngOnInit() {
        this.autocompleteOptions = {
            placeholder: 'Velg kunde',
            autofocus: true,
            canClearValue: false,
            lookup: query => this.customerLookup(query),
            displayFunction: item => {
                if (item) {
                    const name = item.Info ? item.Info.Name : item.Name;
                    return item.CustomerNumber ? `${item.CustomerNumber} - ${name}` : name;
                }

                return '';
            },
            resultTableColumns: [
                { header: 'Kundenr', field: 'CustomerNumber' },
                { header: 'Navn', field: 'Name' },
                { header: 'Adresse', field: 'AddressLine1' },
                {
                    header: 'Poststed',
                    template: item => {
                        if (item.PostalCode || item.City) {
                            return `${item.PostalCode} - ${item.City}`;
                        }
                    }
                },
                { header: 'Orgnummer', field: 'OrgNumber' },
            ],
            createLabel: 'Opprett ny kunde',
            createHandler: (search) => this.modalService.open(CustomerEditModal, {data: {search: search}}).onClose
        };
    }

    ngOnChanges(changes) {
        if (changes['entity'] && this.entity) {
            this.canSendEfaktura = false;
            this.canSendEHF = false;

            const customer: Customer = this.entity.Customer;
            if (customer) {
                if (customer.PeppolAddress || customer.OrgNumber) {
                    const peppoladdress = customer.PeppolAddress
                        ? customer.PeppolAddress
                        : `9908:${customer.OrgNumber}`;

                    if (peppoladdress !== this.lastPeppolAddressChecked) {
                        this.ehfService.GetAction(
                            null,
                            'is-ehf-receiver',
                            'peppoladdress=' + peppoladdress + '&entitytype=' + this.entityType
                        ).subscribe(
                            isEnabled => {
                                this.canSendEHF = isEnabled;
                                this.lastPeppolAddressChecked = peppoladdress;
                                console.log(this.canSendEHF);
                            },
                            err => console.error(err)
                        );
                    }
                }

                if (customer.EInvoiceAgreementReference || customer.EfakturaIdentifier) {
                    this.canSendEfaktura = true;
                }
            }
        }
    }

    focus() {
        if (this.autocomplete) {
            this.autocomplete.focus();
        }
    }

    onCustomerSelected(customer: Customer, isNew = true) {
        const setCustomer = c => {
            this.entity = this.tofHelper.mapCustomerToEntity(c, this.entity, isNew);
            this.entity = cloneDeep(this.entity);
            this.entityChange.emit(this.entity);
        };

        if (customer && customer.ID) {
            this.customerService.Get(customer.ID, this.customerExpands).subscribe(
                res => setCustomer(res),
                err => {
                    this.errorService.handle(err);
                    setCustomer(null);
                }
            );
        } else {
            setCustomer(null);
        }
    }

    editCustomer() {
        this.modalService.open(CustomerEditModal, {
            data: {customer: this.entity.Customer}
        }).onClose.subscribe(editedCustomer => {
            if (editedCustomer) {
                this.onCustomerSelected(editedCustomer, false);
            }
        });
    }

    customerLookup(query: string) {
        const expand = 'Info.DefaultPhone,Info.InvoiceAddress';
        const select = [
            'Customer.ID as ID',
            'Info.Name as Name',
            'Customer.OrgNumber as OrgNumber',
            'InvoiceAddress.AddressLine1 as AddressLine1',
            'InvoiceAddress.PostalCode as PostalCode',
            'InvoiceAddress.City as City',
            'Customer.CustomerNumber as CustomerNumber',
            'Customer.StatusCode as StatusCode',
        ].join(',');

        let filter = `(Customer.Statuscode ne 50001 and Customer.Statuscode ne 90001)`;

        if (query && query.length) {
            const queryFilter = ['Customer.OrgNumber', 'Customer.CustomerNumber', 'Info.Name']
                .map(field => `contains(${field},'${query}')`)
                .join(' or ');

            filter += ` and ( ${queryFilter} )`;
        }

        const odata = `model=Customer`
            + `&expand=${expand}`
            + `&select=${select}`
            + `&filter=${filter}`
            + `&orderby=Info.Name&top=50&distinct=true`;

        return this.statisticsService.GetAllUnwrapped(odata);
    }
}
