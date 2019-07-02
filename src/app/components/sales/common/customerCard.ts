import {Component, Input, Output, EventEmitter, ElementRef, AfterViewInit, OnInit, OnChanges} from '@angular/core';
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
import {TofHelper} from '../salesHelper/tofHelper';
import {IUniSearchConfig} from '../../../../framework/ui/unisearch/index';
import {UniModalService, UniConfirmModalV2, ConfirmActions} from '../../../../framework/uni-modal';
import * as moment from 'moment';
import * as _ from 'lodash';

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
                    <span [attr.title]="distributionPendingTitle" [ngClass]="distributionPendingClass">I DISTRIBUSJONSKØ</span>
                    <span [attr.title]="invoicePrintTitle" [ngClass]="invoicePrintClass">FAKTURAPRINT</span>
                    <span [attr.title]="printTitle" [ngClass]="printClass">UTSKRIFT</span>
                    <span [attr.title]="vippsTitle" [ngClass]="vippsClass">VIPPS</span>
                    <span [attr.title]="emailTitle" [ngClass]="emailClass">E-POST</span>
                    <span [attr.title]="ehfTitle" [ngClass]="ehfClass">EHF</span>
                    <span [attr.title]="efakturaTitle" [ngClass]="efakturaClass">EFAKTURA</span>
                </section>
                <a href="#/sales/customer/{{entity?.Customer?.ID}}"><strong>{{entity?.CustomerName}}</strong></a>
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
export class TofCustomerCard implements AfterViewInit, OnChanges, OnInit {
    private searchInput: HTMLElement;

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
        private addressService: AddressService,
        private ehfService: EHFService,
        private elementRef: ElementRef,
        private uniSearchCustomerConfig: UniSearchCustomerConfig,
        private customerService: CustomerService,
        private errorService: ErrorService,
        private sellerLinkService: SellerLinkService,
        private modalService: UniModalService,
        private statisticsService: StatisticsService,
        private statusService: StatusService,
        private tofHelper: TofHelper,
    ) { }

    ngOnInit() {
        // Recurring invoice does not have functionality for creating customers when saving
        // so we create them when selecting from 1880
        if (this.entityType === 'RecurringInvoice') {
            this.uniSearchConfig = this.uniSearchCustomerConfig.generate(this.customerExpands);
        } else {
            this.uniSearchConfig = this.uniSearchCustomerConfig.generateDoNotCreate(this.customerExpands);
        }
    }

    ngAfterViewInit() {
        this.searchInput = this.elementRef.nativeElement.querySelector('input');
        this.focus();
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
        if (customer && customer.Info && customer.Info.DefaultEmail) {
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
                                'I kø, type distribusjon velges basert på distribusjonsoppsettet når jobben startes';
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

    focus() {
        if (this.searchInput) {
            this.searchInput.focus();
        }
    }

    openAddressModal() {
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
                        const newaddress = {
                            AddressLine1: updatedInvoiceAddress.AddressLine1,
                            AddressLine2: updatedInvoiceAddress.AddressLine2,
                            AddressLine3: updatedInvoiceAddress.AddressLine3,
                            PostalCode: updatedInvoiceAddress.PostalCode,
                            City: updatedInvoiceAddress.City,
                            Country: updatedInvoiceAddress.Country
                        };

                        if (this.entity.Customer.Info.InvoiceAddressID) {
                            newaddress['ID'] = this.entity.Customer.Info.InvoiceAddressID;
                        } else {
                            newaddress['_createguid'] = this.addressService.getNewGuid();
                        }

                        const customer = <Customer>{
                            ID: this.entity.CustomerID,
                            Info: {
                                ID: this.entity.Customer.BusinessRelationID,
                                InvoiceAddress: newaddress
                            }
                        };
                        this.customerService.Put(this.entity.CustomerID, customer).subscribe(updatedcustomer => {
                            this.entity.Customer = updatedcustomer;
                            this.entityChange.emit(this.entity);
                        });
                    }
                });
                this.entityChange.emit(this.entity);
            }
        });
    }

    customerSelected(customer: Customer) {
        this.entity = this.tofHelper.mapCustomerToEntity(customer, this.entity);

        this.showDefaultBadgeForCustomer(customer);
        this.entity = _.cloneDeep(this.entity);
        this.entityChange.emit(this.entity);
    }
}
