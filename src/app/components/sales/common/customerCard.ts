import {Component, Input, Output, EventEmitter, ViewChild} from '@angular/core';
import {FormControl} from '@angular/forms';
import {Customer, SharingType, StatusCodeSharing} from '@uni-entities';
import {
    EHFService,
    UniSearchCustomerConfig,
    CustomerService,
    ErrorService,
    StatisticsService,
    StatusService
} from '@app/services/services';
import {TofHelper} from '../salesHelper/tofHelper';
import {IUniSearchConfig} from '@uni-framework/ui/unisearch';
import {UniModalService} from '@uni-framework/uni-modal';
import {AutocompleteOptions, Autocomplete} from '@uni-framework/ui/autocomplete/autocomplete';
import {CustomerEditModal} from './customer-edit-modal/customer-edit-modal';
import {cloneDeep} from 'lodash';
import * as moment from 'moment';

@Component({
    selector: 'tof-customer-card',
    template: `
        <autocomplete class="customer-select"
            [options]="autocompleteOptions"
            [readonly]="readonly"
            [value]="entity?.Customer"
            (valueChanges)="onCustomerSelected($event)">
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

            <div class="unpaid-invoices" *ngIf="customerDueInvoiceData?.NumberOfDueInvoices > 0">
                <a href="#/sales/customer/{{entity?.Customer?.ID}}">
                    Kunden har {{customerDueInvoiceData.NumberOfDueInvoices}}
                    forfalt{{customerDueInvoiceData.NumberOfDueInvoices > 1 ? 'e' : ''}}
                    faktura{{customerDueInvoiceData.NumberOfDueInvoices > 1 ? 'er' : ''}}
                </a>
            </div>

            <!--<section class="sharing-badges">
                <span [attr.title]="distributionPendingTitle" [ngClass]="distributionPendingClass">I sendingskø</span>
                <span [attr.title]="invoicePrintTitle" [ngClass]="invoicePrintClass">Fakturaprint</span>
                <span [attr.title]="printTitle" [ngClass]="printClass">Utskrift</span>
                <span [attr.title]="vippsTitle" [ngClass]="vippsClass">Vipps</span>
                <span [attr.title]="emailTitle" [ngClass]="emailClass">E-post</span>
                <span [attr.title]="ehfTitle" [ngClass]="ehfClass">EHF</span>
                <span [attr.title]="efakturaTitle" [ngClass]="efakturaClass">eFaktura</span>
            </section>-->

        </section>
    `
})
export class TofCustomerCard {
    @ViewChild(Autocomplete) autocomplete: Autocomplete;

    @Input() readonly: boolean;
    @Input() entity: any;
    @Input() entityType: string;

    @Output() entityChange: EventEmitter<any> = new EventEmitter();

    ehfClass: string = 'badge-unavailable';
    efakturaClass: string = 'badge-unavailable';
    emailClass: string = 'badge-unavailable';
    vippsClass: string = 'badge-unavailable';
    printClass: string = 'badge-unavailable';
    invoicePrintClass: string = 'badge-unavailable';
    distributionPendingClass: string = 'badge-unavailable';
    ehfTitle: string;
    efakturaTitle: string;
    emailTitle: string;
    vippsTitle: string;
    printTitle: string = 'Sendt til utskrift';
    invoicePrintTitle: string = 'Sendt til fakturaprint';
    distributionPendingTitle: string;

    uniSearchConfig: IUniSearchConfig;
    customerDueInvoiceData: any;
    private lastPeppolAddressChecked: string;

    private emailControl: FormControl = new FormControl('');
    private yourRefControl: FormControl = new FormControl('');

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

    constructor(
        private ehfService: EHFService,
        private uniSearchCustomerConfig: UniSearchCustomerConfig,
        private customerService: CustomerService,
        private errorService: ErrorService,
        private modalService: UniModalService,
        private statisticsService: StatisticsService,
        private statusService: StatusService,
        private tofHelper: TofHelper,
    ) {}

    ngOnInit() {
        // Recurring invoice does not have functionality for creating customers when saving
        // so we create them when selecting from 1880
        if (this.entityType === 'RecurringInvoice') {
            this.uniSearchConfig = this.uniSearchCustomerConfig.generate(this.customerExpands);
        } else {
            this.uniSearchConfig = this.uniSearchCustomerConfig.generateDoNotCreate(this.customerExpands);
        }

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
            createHandler: () => {
                return this.modalService.open(CustomerEditModal).onClose;
            }
        };
    }

    ngOnChanges(changes) {
        if (changes['entity'] && this.entity) {

            if (this.entity.ID) {
                this.setSharingBadges();
            } else {
                this.clearSharingBadges();
            }

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

            this.showDefaultBadgeForCustomer(customer);

            if (customer && customer.customerID) {
                this.emailControl.setValue(this.entity.EmailAddress, {emitEvent: false});
                this.yourRefControl.setValue(this.entity.YourReference, {emitEvent: false});
            }
        }
    }

    focus() {
        if (this.autocomplete) {
            this.autocomplete.focus();
        }
    }

    onCustomerSelected(customer: Customer) {
        const setCustomer = c => {
            this.entity = this.tofHelper.mapCustomerToEntity(c, this.entity);
            this.showDefaultBadgeForCustomer(c);
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
            data: this.entity.Customer
        }).onClose.subscribe(editedCustomer => {
            if (editedCustomer) {
                this.onCustomerSelected(editedCustomer);
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

    private toBadgeClass(code: number): string {
        switch (code) {
            case StatusCodeSharing.Pending:
                return 'badge-pending';
            case StatusCodeSharing.InProgress:
                return 'badge-in-progress';
            case StatusCodeSharing.Failed:
                return 'badge-failed';
            case StatusCodeSharing.Completed:
                return 'badge-completed';
            case StatusCodeSharing.Cancelled:
                return 'badge-cancelled';
            default:
                return 'badge-unavailable';
        }
    }

    private showDefaultBadgeForCustomer(customer: Customer) {
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

            if (customer.EInvoiceAgreementReference) {
                this.efakturaClass = 'badge-available';
                this.efakturaTitle = 'Kan sende efaktura til ' + customer.EInvoiceAgreementReference;
            } else if (customer.EfakturaIdentifier) {
                this.efakturaClass = 'badge-available';
                this.efakturaTitle = 'Kan sende efaktura til ' + customer.EfakturaIdentifier;
            }
        }

        // Can customer receive email?
        if (customer && customer.Info && customer.Info.DefaultEmail && customer.Info.DefaultEmail.EmailAddress) {
            this.emailClass = 'badge-available';
            this.emailTitle = 'Kan sende på e-post til ' + customer.Info.DefaultEmail.EmailAddress;
        }
    }

    private clearSharingBadges() {
        this.ehfClass = 'badge-unavailable';
        this.efakturaClass = 'badge-unavailable';
        this.emailClass = 'badge-unavailable';
        this.vippsClass = 'badge-unavailable';
        this.printClass = 'badge-unavailable';
        this.invoicePrintClass = 'badge-unavailable';
        this.distributionPendingClass = 'badge-unavailable';
        this.ehfTitle = '';
        this.efakturaTitle = '';
        this.emailTitle = '';
        this.vippsTitle = '';
        this.printTitle = '';
        this.invoicePrintTitle = '';
        this.distributionPendingTitle = '';
    }

    private setSharingBadges() {
        this.statisticsService.GetAllUnwrapped(
            `model=Sharing&filter=EntityType eq '${this.entityType}' and EntityID eq ${this.entity.ID}`
            + `&select=ID,Type,StatusCode,ExternalMessage,UpdatedAt,CreatedAt,To&orderby=ID desc`
        ).subscribe(sharings => {
            [
                SharingType.Unknown,
                SharingType.AP,
                SharingType.Email,
                SharingType.Vipps,
                SharingType.Print,
                SharingType.InvoicePrint,
                SharingType.Efaktura
            ].forEach(type => {
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
                        case SharingType.Unknown:
                            this.distributionPendingClass = cls;
                            this.distributionPendingTitle = firstOfType.SharingExternalMessage ? firstOfType.SharingExternalMessage :
                                'I kø, sendingsmetode velges basert på utsendelsesoppsettet når jobben startes';
                            break;
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
                            break;
                        case SharingType.InvoicePrint:
                            this.invoicePrintClass = cls;
                            this.invoicePrintTitle = title;
                            break;
                        case SharingType.Efaktura:
                            this.efakturaClass = cls;
                            this.efakturaTitle = title;
                            break;
                    }
                }
            });
        });
    }
}
