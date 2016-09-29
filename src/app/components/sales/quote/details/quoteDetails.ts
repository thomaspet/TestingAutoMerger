import {Component, Input, ViewChild} from '@angular/core';
import {Router, ActivatedRoute, RouterLink} from '@angular/router';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';

import {CustomerQuoteService, CustomerQuoteItemService, CustomerService, BusinessRelationService} from '../../../../services/services';
import {ProjectService, DepartmentService, AddressService, ReportDefinitionService} from '../../../../services/services';
import {CompanySettingsService} from '../../../../services/common/CompanySettingsService';

import {UniSave, IUniSaveAction} from '../../../../../framework/save/save';
import {UniForm, UniFieldLayout} from '../../../../../framework/uniform';

import {QuoteItemList} from './quoteItemList';
import {TradeItemHelper} from '../../salesHelper/tradeItemHelper';


import {FieldType, CustomerQuote, CustomerQuoteItem, Customer} from '../../../../unientities';
import {Dimensions, Address, BusinessRelation} from '../../../../unientities';
import {StatusCodeCustomerQuote, CompanySettings} from '../../../../unientities';

import {AddressModal} from '../../../common/modals/modals';
import {TradeHeaderCalculationSummary} from '../../../../models/sales/TradeHeaderCalculationSummary';

import {PreviewModal} from '../../../reports/modals/preview/previewModal';
import {TabService} from '../../../layout/navbar/tabstrip/tabService';

import {ToastService, ToastType} from '../../../../../framework/uniToast/toastService';

declare var _;
declare var moment;

class CustomerQuoteExt extends CustomerQuote {
    public _InvoiceAddress: Address;
    public _InvoiceAddresses: Array<Address>;
    public _ShippingAddress: Address;
    public _ShippingAddresses: Array<Address>;
    public _InvoiceAddressID: number;
    public _ShippingAddressID: number;
}

@Component({
    selector: 'quote-details',
    templateUrl: 'app/components/sales/quote/details/quoteDetails.html',
    directives: [RouterLink, QuoteItemList, AddressModal, UniForm, UniSave, PreviewModal],
    providers: [CustomerQuoteService, CustomerQuoteItemService, CustomerService, CompanySettingsService,
        ProjectService, DepartmentService, AddressService, ReportDefinitionService, BusinessRelationService]
})
export class QuoteDetails {
    @Input() public quoteID: any;
    @ViewChild(UniForm) public form: UniForm;
    @ViewChild(AddressModal) public addressModal: AddressModal;
    @ViewChild(PreviewModal) private previewModal: PreviewModal;

    public config: any = {};
    public fields: any[] = [];

    private quote: CustomerQuoteExt;
    private statusText: string;

    private itemsSummaryData: TradeHeaderCalculationSummary;

    private customers: Customer[];
    private dropdownData: any;

    private emptyAddress: Address;
    private recalcTimeout: any;
    private addressChanged: any;

    private companySettings: CompanySettings;

    private actions: IUniSaveAction[];

    private formIsInitialized: boolean = false;

    private expandOptions: Array<string> = ['Items', 'Items.Product', 'Items.VatType',
        'Items.Dimensions', 'Items.Dimensions.Project', 'Items.Dimensions.Department',
        'Customer', 'Customer.Info', 'Customer.Info.Addresses', 'Customer.Dimensions', 'Customer.Dimensions.Project', 'Customer.Dimensions.Department'];

    constructor(private customerService: CustomerService,
        private customerQuoteService: CustomerQuoteService,
        private customerQuoteItemService: CustomerQuoteItemService,
        private departmentService: DepartmentService,
        private projectService: ProjectService,
        private addressService: AddressService,
        private businessRelationService: BusinessRelationService,
        private reportDefinitionService: ReportDefinitionService,
        private companySettingsService: CompanySettingsService,
        private toastService: ToastService,

        private router: Router,
        private route: ActivatedRoute,
        private tabService: TabService) {

        this.route.params.subscribe(params => {
            this.quoteID = +params['id'];
            this.setup();
        });
    }

    private log(err) {
        this.toastService.addToast(err._body, ToastType.bad);
    }

    public nextQuote() {
        this.customerQuoteService.next(this.quote.ID)
            .subscribe((data) => {
                if (data) {
                    this.router.navigateByUrl('/sales/quotes/' + data.ID);
                }
            },
            (err) => {
                console.log('Error getting next quote: ', err);
                this.toastService.addToast('Ikke flere tilbud etter denne', ToastType.warn, 5);
            }
            );
    }

    public previousQuote() {
        this.customerQuoteService.previous(this.quote.ID)
            .subscribe((data) => {
                if (data) {
                    this.router.navigateByUrl('/sales/quotes/' + data.ID);
                }
            },
            (err) => {
                console.log('Error getting previous quote: ', err);
                this.toastService.addToast('Ikke flere tilbud før denne', ToastType.warn, 5);
            }
            );
    }

    public addQuote() {
        this.customerQuoteService.newCustomerQuote().then(quote => {
            this.customerQuoteService.Post(quote)
                .subscribe(
                (data) => {
                    this.router.navigateByUrl('/sales/quotes/' + data.ID);
                },
                (err) => {
                    console.log('Error creating quote: ', err);
                    this.log(err);
                }
                );
        });
    }

    public change(value: CustomerQuote) { }

    public ready(event) {
        this.setupSubscriptions(null);
    }

    private setupSubscriptions(event) {
        this.form.field('CustomerID')
            .onChange
            .subscribe((data) => {
                if (data) {
                    this.customerService.Get(this.quote.CustomerID, ['Info', 'Info.Addresses', 'Info.InvoiceAddress', 'Info.ShippingAddress', 'Dimensions', 'Dimensions.Project', 'Dimensions.Department']).subscribe((customer: Customer) => {
                        let keepEntityAddresses: boolean = true;
                        if (this.quote.Customer && this.quote.CustomerID !== this.quote.Customer.ID) {
                            keepEntityAddresses = false;
                        }

                        this.quote.Customer = customer;
                        this.addressService.setAddresses(this.quote, null, keepEntityAddresses);

                        this.quote.CustomerName = customer.Info.Name;

                        if (customer.CreditDays !== null) {
                            this.quote.CreditDays = customer.CreditDays;
                        }
                        else {
                            this.quote.CreditDays = this.companySettings.CustomerCreditDays;
                        }

                        this.quote = _.cloneDeep(this.quote);
                    });
                }
            });
        this.form.field('QuoteDate')
            .onChange
            .subscribe((data) => {
                if (data) {
                    this.quote.ValidUntilDate = moment(this.quote.QuoteDate).add(1, 'month').toDate();

                    this.quote = _.cloneDeep(this.quote);
                }
            });
    }

    private setup() {
        this.companySettingsService.Get(1)
            .subscribe(settings => this.companySettings = settings,
            err => {
                console.log('Error retrieving company settings data: ', err);
                this.toastService.addToast('En feil oppsto ved henting av firmainnstillinger: ' + JSON.stringify(err), ToastType.bad);
            });

        if (!this.formIsInitialized) {
            this.fields = this.getComponentLayout().Fields;

            Observable.forkJoin(
                this.departmentService.GetAll(null),
                this.projectService.GetAll(null),
                this.customerQuoteService.Get(this.quoteID, this.expandOptions),
                this.customerService.GetAll(null, ['Info']),
                this.addressService.GetNewEntity(null, 'address')
            ).subscribe(response => {
                this.dropdownData = [response[0], response[1]];
                this.quote = response[2];
                this.customers = response[3];
                this.emptyAddress = response[4];

                // Add a blank item in the dropdown controls
                this.dropdownData[0].unshift(null);
                this.dropdownData[1].unshift(null);
                this.customers.unshift(null);

                this.updateStatusText();
                this.addressService.setAddresses(this.quote);
                this.setTabTitle();

                this.updateSaveActions();
                this.extendFormConfig();

                this.formIsInitialized = true;
            }, (err) => {
                console.log('Error retrieving data: ', err);
                this.toastService.addToast('En feil oppsto ved henting av data: ' + JSON.stringify(err), ToastType.bad);
            });
        } else {
            this.customerQuoteService.Get(this.quoteID, this.expandOptions)
                .subscribe((quote) => {
                    this.quote = quote;
                    this.updateStatusText();
                    this.addressService.setAddresses(this.quote);
                    this.setTabTitle();
                } , (err) => {
                    console.log('Error retrieving data: ', err);
                    this.toastService.addToast('En feil oppsto ved henting av data: ' + JSON.stringify(err), ToastType.bad);
                });
        }
    }

    private setTabTitle() {
        let tabTitle = this.quote.QuoteNumber ? 'Tilbudsnr. ' + this.quote.QuoteNumber : 'Tilbud (kladd)';
        this.tabService.addTab({ url: '/sales/quotes/' + this.quote.ID, name: tabTitle, active: true, moduleID: 3 });
    }

    private extendFormConfig() {
        let self = this;

        var invoiceaddress: UniFieldLayout = this.fields.find(x => x.Property === '_InvoiceAddress');
        invoiceaddress.Options = {
            entity: Address,
            listProperty: '_InvoiceAddresses',
            displayValue: 'AddressLine1',
            linkProperty: 'ID',
            storeResultInProperty: '_InvoiceAddressID',
            editor: (value) => new Promise((resolve) => {
                if (!value) {
                    value = new Address();
                    value.ID = 0;
                }

                this.addressModal.openModal(value, !!!this.quote.CustomerID);

                this.addressChanged = this.addressModal.Changed.subscribe((address) => {
                    if (address._question) { self.saveAddressOnCustomer(address, resolve); }
                    else { this.addressChanged.unsubscribe(); resolve(address); }
                });
            }),
            display: (address: Address) => {
                return this.addressService.displayAddress(address);
            }
        };

        var shippingaddress: UniFieldLayout = this.fields.find(x => x.Property === '_ShippingAddress');
        shippingaddress.Options = {
            entity: Address,
            listProperty: '_ShippingAddresses',
            displayValue: 'AddressLine1',
            linkProperty: 'ID',
            storeResultInProperty: '_ShippingAddressID',
            editor: (value) => new Promise((resolve) => {
                if (!value) {
                    value = new Address();
                    value.ID = 0;
                }

                this.addressModal.openModal(value);

                this.addressChanged = this.addressModal.Changed.subscribe((address) => {
                    if (address._question) { self.saveAddressOnCustomer(address, resolve); }
                    else { this.addressChanged.unsubscribe(); resolve(address); }
                });
            }),
            display: (address: Address) => {
                return this.addressService.displayAddress(address);
            }
        };

        var customer: UniFieldLayout = this.fields.find(x => x.Property === 'CustomerID');
        customer.Options = {
            source: this.customers,
            valueProperty: 'ID',
            displayProperty: 'Info.Name',
            debounceTime: 200
        };
    }

    private saveAddressOnCustomer(address: Address, resolve) {
        var idx = 0;

        if (!address.ID || address.ID == 0) {
            address['_createguid'] = this.addressService.getNewGuid();
            this.quote.Customer.Info.Addresses.push(address);
            idx = this.quote.Customer.Info.Addresses.length - 1;
        } else {
            idx = this.quote.Customer.Info.Addresses.findIndex((a) => a.ID === address.ID);
            this.quote.Customer.Info.Addresses[idx] = address;
        }

        // remove entries with equal _createguid
        this.quote.Customer.Info.Addresses = _.uniq(this.quote.Customer.Info.Addresses, '_createguid');

        // this.quote.Customer.Info.ID
        this.businessRelationService.Put(this.quote.Customer.Info.ID, this.quote.Customer.Info).subscribe((info) => {
            this.quote.Customer.Info = info;
            this.addressChanged.unsubscribe();
            resolve(info.Addresses[idx]);
        },(error) => {
            this.addressChanged.unsubscribe();
        });
    }


    private updateSaveActions() {
        this.actions = [];

        this.actions.push({
            label: 'Lagre',
            action: (done) => this.saveQuoteManual(done),
            main: true,
            disabled: false
        });

        this.actions.push({
            label: 'Lagre og skriv ut',
            action: (done) => this.saveAndPrint(done),
            disabled: false
        });

        this.actions.push({
            label: 'Registrer',
            action: (done) => this.saveQuoteTransition(done, 'register', 'Registrert'),
            disabled: (this.quote.StatusCode !== StatusCodeCustomerQuote.Draft)

        });

        // TODO: Add a actions for shipToCustomer,customerAccept

        this.actions.push({
            label: 'Lagre og overfør til ordre',
            action: (done) => this.saveQuoteTransition(done, 'toOrder', 'Overført til ordre'),
            disabled: this.IsTransferToOrderDisabled()
        });

        this.actions.push({
            label: 'Lagre og overfør til faktura',
            action: (done) => this.saveQuoteTransition(done, 'toInvoice', 'Overført til faktura'),
            disabled: this.IsTransferToInvoiceDisabled()

        });
        this.actions.push({
            label: 'Avslutt tilbud',
            action: (done) => this.saveQuoteTransition(done, 'complete', 'Tilbud avsluttet'),
            disabled: this.IsTransferToCompleteDisabled()

        });

        this.actions.push({
            label: 'Slett',
            action: (done) => this.deleteQuote(done),
            disabled: true
        });
    }

    private IsTransferToOrderDisabled() {
        if (this.quote.StatusCode === StatusCodeCustomerQuote.Registered ||
            this.quote.StatusCode === StatusCodeCustomerQuote.ShippedToCustomer ||
            this.quote.StatusCode === StatusCodeCustomerQuote.CustomerAccepted) {
            return false;
        }
        return true;
    }
    private IsTransferToInvoiceDisabled() {
        if (this.quote.StatusCode === StatusCodeCustomerQuote.Registered ||
            this.quote.StatusCode === StatusCodeCustomerQuote.ShippedToCustomer ||
            this.quote.StatusCode === StatusCodeCustomerQuote.CustomerAccepted ||
            this.quote.StatusCode === StatusCodeCustomerQuote.TransferredToOrder) {
            return false;
        }
        return true;
    }
    private IsTransferToCompleteDisabled() {
        if (this.quote.StatusCode === StatusCodeCustomerQuote.Registered ||
            this.quote.StatusCode === StatusCodeCustomerQuote.ShippedToCustomer ||
            this.quote.StatusCode === StatusCodeCustomerQuote.CustomerAccepted ||
            this.quote.StatusCode === StatusCodeCustomerQuote.TransferredToOrder) {
            return false;
        }
        return true;
    }

    private deleteQuote(done) {
        this.toastService.addToast('Slett  - Under construction', ToastType.warn, 5);
        done('Slett tilbud avbrutt');
    }

    public recalcItemSums(quoteItems: any) {
        this.quote.Items = quoteItems;

        // Do recalc after 2 second to avoid to much requests
        if (this.recalcTimeout) {
            clearTimeout(this.recalcTimeout);
        }

        this.recalcTimeout = setTimeout(() => {

            quoteItems.forEach((x) => {
                x.PriceIncVat = x.PriceIncVat ? x.PriceIncVat : 0;
                x.PriceExVat = x.PriceExVat ? x.PriceExVat : 0;
                x.CalculateGrossPriceBasedOnNetPrice = x.CalculateGrossPriceBasedOnNetPrice ? x.CalculateGrossPriceBasedOnNetPrice : false;
                x.Discount = x.Discount ? x.Discount : 0;
                x.DiscountPercent = x.DiscountPercent ? x.DiscountPercent : 0;
                x.NumberOfItems = x.NumberOfItems ? x.NumberOfItems : 0;
                x.SumTotalExVat = x.SumTotalExVat ? x.SumTotalExVat : 0;
                x.SumTotalIncVat = x.SumTotalIncVat ? x.SumTotalIncVat : 0;
            });

            this.customerQuoteService.calculateQuoteSummary(quoteItems)
                .subscribe((data) => {
                    this.itemsSummaryData = data;
                    this.updateSaveActions();
                },
                (err) => {
                    console.log('Error when recalculating items:', err);
                    this.log(err);
                });
        }, 2000);
    }

    private saveQuoteManual(done: any) {
        this.saveQuote(done);
    }

    private saveQuoteTransition(done: any, transition: string, doneText: string) {
        this.saveQuote(done, (quote) => {
            this.customerQuoteService.Transition(this.quote.ID, this.quote, transition).subscribe(() => {
                console.log('== TRANSITION OK ' + transition + ' ==');
                done(doneText);

                this.customerQuoteService.Get(quote.ID, this.expandOptions).subscribe((data) => {
                        this.quote = data;
                        this.addressService.setAddresses(this.quote);
                        this.updateStatusText();
                        this.updateSaveActions();
                        this.setTabTitle();
                        this.ready(null);
                    });
            }, (err) => {
                console.log('Feil oppstod ved ' + transition + ' transition', err);
                done('Feilet');
                this.log(err);
            });
        });
    }

    private saveQuote(done: any, next: any = null) {
        // Transform addresses to flat
        this.addressService.addressToInvoice(this.quote, this.quote._InvoiceAddress);
        this.addressService.addressToShipping(this.quote, this.quote._ShippingAddress);

        this.quote.TaxInclusiveAmount = -1; // TODO in AppFramework, does not save main entity if just items have changed

        this.quote.Items.forEach(item => {
            if (item.Dimensions && item.Dimensions.ID === 0) {
                item.Dimensions['_createguid'] = this.customerQuoteItemService.getNewGuid();
            }
        });

        // Save only lines with products from product list
        if (!TradeItemHelper.IsItemsValid(this.quote.Items)){
            console.log('Linjer uten produkt. Lagring avbrutt.');
            if (done) {
                done('Lagring feilet');
            }
            return;
        }

        this.customerQuoteService.Put(this.quote.ID, this.quote)
            .subscribe(
            (quoteSaved) => {
                this.customerQuoteService.Get(this.quote.ID, this.expandOptions).subscribe(quoteGet => {
                    this.quote = quoteGet;
                    this.addressService.setAddresses(this.quote);
                    this.updateStatusText();
                    this.updateSaveActions();
                    this.setTabTitle();
                    this.ready(null);

                    if (next) {
                        next(this.quote);
                    } else {
                        done('Tilbud lagret');
                    }
                });
            },
            (err) => {
                console.log('Feil oppsto ved lagring', err);
                this.log(err);
                done('Lagring feilet');
            }
        );
    }

    private updateStatusText() {
        this.statusText = this.customerQuoteService.getStatusText((this.quote.StatusCode || '').toString());
    }

    private saveAndPrint(done) {
        this.saveQuote(done, (quote) => {
            this.reportDefinitionService.getReportByName('Tilbud').subscribe((report) => {
                if (report) {
                    this.previewModal.openWithId(report, quote.ID);
                    done('Utskrift');
                } else {
                    done('Rapport mangler');
                }
            });
        });
    }

    private getComponentLayout(): any {
        return {
            Name: 'CustomerQuote',
            BaseEntity: 'CustomerQuote',
            StatusCode: 0,
            Deleted: false,
            CreatedAt: null,
            UpdatedAt: null,
            CreatedBy: null,
            UpdatedBy: null,
            ID: 1,
            CustomFields: null,
            Fields: [
                {
                    ComponentLayoutID: 3,
                    EntityType: 'CustomerQuote',
                    Property: 'CustomerID',
                    Placement: 4,
                    Hidden: false,
                    FieldType: FieldType.DROPDOWN,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Kunde',
                    Description: '',
                    HelpText: '',
                    FieldSet: 0,
                    Section: 0,
                    Placeholder: null,
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    Legend: '',
                    StatusCode: 0,
                    ID: 1,
                    Deleted: false,
                    CreatedAt: null,
                    UpdatedAt: null,
                    CreatedBy: null,
                    UpdatedBy: null,
                    CustomFields: null
                },
                {
                    ComponentLayoutID: 3,
                    EntityType: 'CustomerQuote',
                    Property: 'QuoteDate',
                    Placement: 3,
                    Hidden: false,
                    FieldType: FieldType.DATEPICKER,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Tilbudsdato',
                    Description: '',
                    HelpText: '',
                    FieldSet: 0,
                    Section: 0,
                    Placeholder: null,
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    Legend: '',
                    StatusCode: 0,
                    ID: 2,
                    Deleted: false,
                    CreatedAt: null,
                    UpdatedAt: null,
                    CreatedBy: null,
                    UpdatedBy: null,
                    CustomFields: null
                },
                {
                    ComponentLayoutID: 3,
                    EntityType: 'CustomerQuote',
                    Property: 'ValidUntilDate',
                    Placement: 1,
                    Hidden: false,
                    FieldType: FieldType.DATEPICKER,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Gyldig til dato',
                    Description: '',
                    HelpText: '',
                    FieldSet: 0,
                    Section: 0,
                    Placeholder: null,
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    Legend: '',
                    StatusCode: 0,
                    ID: 3,
                    Deleted: false,
                    CreatedAt: null,
                    UpdatedAt: null,
                    CreatedBy: null,
                    UpdatedBy: null,
                    CustomFields: null
                },
                {
                    ComponentLayoutID: 3,
                    EntityType: 'CustomerQuote',
                    Property: 'CreditDays',
                    Placement: 1,
                    Hidden: false,
                    FieldType: FieldType.TEXT,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Kredittdager',
                    Description: '',
                    HelpText: '',
                    FieldSet: 0,
                    Section: 0,
                    Placeholder: null,
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    Legend: '',
                    StatusCode: 0,
                    ID: 4,
                    Deleted: false,
                    CreatedAt: null,
                    UpdatedAt: null,
                    CreatedBy: null,
                    UpdatedBy: null,
                    CustomFields: null
                },
                {
                    ComponentLayoutID: 3,
                    EntityType: 'BusinessRelation',
                    Property: '_InvoiceAddress',
                    Placement: 1,
                    Hidden: false,
                    FieldType: FieldType.MULTIVALUE,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Fakturaadresse',
                    Description: '',
                    HelpText: '',
                    FieldSet: 0,
                    Section: 0,
                    Placeholder: null,
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    Legend: '',
                    StatusCode: 0,
                    ID: 5,
                    Deleted: false,
                    CreatedAt: null,
                    UpdatedAt: null,
                    CreatedBy: null,
                    UpdatedBy: null,
                    CustomFields: null
                },
                {
                    ComponentLayoutID: 3,
                    EntityType: 'BusinessRelation',
                    Property: '_ShippingAddress',
                    Placement: 1,
                    Hidden: false,
                    FieldType: FieldType.MULTIVALUE,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Leveringsadresse',
                    Description: '',
                    HelpText: '',
                    FieldSet: 0,
                    Section: 0,
                    Placeholder: null,
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    Legend: '',
                    StatusCode: 0,
                    ID: 6,
                    Deleted: false,
                    CreatedAt: null,
                    UpdatedAt: null,
                    CreatedBy: null,
                    UpdatedBy: null,
                    CustomFields: null
                },
                {
                    // Vår referanse
                    ComponentLayoutID: 3,
                    EntityType: 'CustomerInvoice',
                    Property: 'OurReference',
                    Placement: 1,
                    Hidden: false,
                    FieldType: FieldType.TEXT,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Vår referanse',
                    Description: '',
                    HelpText: '',
                    FieldSet: 0,
                    Section: 0,
                    Placeholder: null,
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    Legend: '',
                    StatusCode: 0,
                    ID: 10,
                    Deleted: false,
                    CreatedAt: null,
                    UpdatedAt: null,
                    CreatedBy: null,
                    UpdatedBy: null,
                    CustomFields: null
                },
                {
                    // Deres referanse
                    ComponentLayoutID: 3,
                    EntityType: 'CustomerInvoice',
                    Property: 'YourReference',
                    Placement: 1,
                    Hidden: false,
                    FieldType: FieldType.TEXT,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Deres referanse',
                    Description: '',
                    HelpText: '',
                    FieldSet: 0,
                    Section: 0,
                    Placeholder: null,
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    Legend: '',
                    StatusCode: 0,
                    ID: 11,
                    Deleted: false,
                    CreatedAt: null,
                    UpdatedAt: null,
                    CreatedBy: null,
                    UpdatedBy: null,
                    CustomFields: null
                },
                {
                    // Rekvisisjon
                    ComponentLayoutID: 3,
                    EntityType: 'CustomerInvoice',
                    Property: 'Requisition',
                    Placement: 1,
                    Hidden: false,
                    FieldType: FieldType.TEXT,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Rekvisisjon',
                    Description: '',
                    HelpText: '',
                    FieldSet: 0,
                    Section: 0,
                    Placeholder: null,
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    Legend: '',
                    StatusCode: 0,
                    ID: 12,
                    Deleted: false,
                    CreatedAt: null,
                    UpdatedAt: null,
                    CreatedBy: null,
                    UpdatedBy: null,
                    CustomFields: null
                },
                {
                    ComponentLayoutID: 3,
                    EntityType: 'CustomerQuote',
                    Property: 'FreeTxt',
                    Placement: 1,
                    Hidden: false,
                    FieldType: FieldType.TEXTAREA,
                    ReadOnly: false,
                    LookupField: false,
                    Label: '',
                    Description: '',
                    HelpText: '',
                    FieldSet: 0,
                    Section: 1,
                    Sectionheader: 'Fritekst',
                    Placeholder: null,
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    Legend: 'Fritekst',
                    StatusCode: 0,
                    ID: 30,
                    Deleted: false,
                    CreatedAt: null,
                    UpdatedAt: null,
                    CreatedBy: null,
                    UpdatedBy: null,
                    CustomFields: null,
                    Classes: 'max-width'
                }
            ]
        };
    }
}
