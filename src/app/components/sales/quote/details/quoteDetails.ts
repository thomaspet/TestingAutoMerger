import {Component, Input, ViewChild} from '@angular/core';
import {Router, RouteParams, RouterLink} from '@angular/router-deprecated';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';

import {CustomerQuoteService, CustomerQuoteItemService, CustomerService} from '../../../../services/services';
import {ProjectService, DepartementService, AddressService, ReportDefinitionService} from '../../../../services/services';


import {UniSave, IUniSaveAction} from '../../../../../framework/save/save';
import {UniForm, UniFieldLayout} from '../../../../../framework/uniform';

import {QuoteItemList} from './quoteItemList';

import {FieldType, CustomerQuote, Customer} from '../../../../unientities';
import {Dimensions, Address, BusinessRelation} from '../../../../unientities';
import {StatusCodeCustomerQuote} from '../../../../unientities';

import {AddressModal} from '../../customer/modals/address/address';
import {TradeHeaderCalculationSummary} from '../../../../models/sales/TradeHeaderCalculationSummary';

import {PreviewModal} from '../../../reports/modals/preview/previewModal';
import {TabService} from '../../../layout/navbar/tabstrip/tabService';

declare var _;
declare var moment;

@Component({
    selector: 'quote-details',
    templateUrl: 'app/components/sales/quote/details/quoteDetails.html',
    directives: [RouterLink, QuoteItemList, AddressModal, UniForm, UniSave, PreviewModal],
    providers: [CustomerQuoteService, CustomerQuoteItemService, CustomerService,
        ProjectService, DepartementService, AddressService, ReportDefinitionService]
})
export class QuoteDetails {
    @Input() public quoteID: any;
    @ViewChild(UniForm) public form: UniForm;
    @ViewChild(AddressModal) public addressModal: AddressModal;
    @ViewChild(PreviewModal) private previewModal: PreviewModal;

    public config: any = {};
    public fields: any[] = [];

    private businessRelationInvoice: BusinessRelation = new BusinessRelation();
    private businessRelationShipping: BusinessRelation = new BusinessRelation();
    private lastCustomerInfo: BusinessRelation;

    private quote: CustomerQuote;
    private statusText: string;

    private itemsSummaryData: TradeHeaderCalculationSummary;

    private customers: Customer[];
    private dropdownData: any;

    private emptyAddress: Address;
    private recalcTimeout: any;

    private actions: IUniSaveAction[];

    constructor(private customerService: CustomerService,
        private customerQuoteService: CustomerQuoteService,
        private customerQuoteItemService: CustomerQuoteItemService,
        private departementService: DepartementService,
        private projectService: ProjectService,
        private addressService: AddressService,
        private reportDefinitionService: ReportDefinitionService,
        private router: Router, private params: RouteParams,
        private tabService: TabService) {

        this.quoteID = params.get('id');
        this.businessRelationInvoice.Addresses = [];
        this.businessRelationShipping.Addresses = [];
        this.tabService.addTab({ url: '/sales/quote/details/' + this.quoteID, name: 'Tilbudsnr. ' + this.quoteID, active: true, moduleID: 3 });
    }


    private log(err) {
        alert(err._body);
    }

    public nextQuote() {
        this.customerQuoteService.next(this.quote.ID)
            .subscribe((data) => {
                if (data) {
                    this.router.navigateByUrl('/sales/quote/details/' + data.ID);
                }
            },
            (err) => {
                console.log('Error getting next quote: ', err);
                alert('Ikke flere tilbud etter denne');
            }
            );
    }

    public previousQuote() {
        this.customerQuoteService.previous(this.quote.ID)
            .subscribe((data) => {
                if (data) {
                    this.router.navigateByUrl('/sales/quote/details/' + data.ID);
                }
            },
            (err) => {
                console.log('Error getting previous quote: ', err);
                alert('Ikke flere tilbud før denne');
            }
            );
    }

    public addQuote() {
        this.customerQuoteService.newCustomerQuote().then(quote => {
            this.customerQuoteService.Post(quote)
                .subscribe(
                (data) => {
                    this.router.navigateByUrl('/sales/quote/details/' + data.ID);
                },
                (err) => {
                    console.log('Error creating quote: ', err);
                    this.log(err);
                }
                );
        });
    }

    public isActive(instruction: any[]): boolean {
        return this.router.isRouteActive(this.router.generate(instruction));
    }

    public change(value: CustomerQuote) { }

    public ready(event) {
        this.form.field('FreeTxt').addClass('max-width', true);
        this.setupSubscriptions(null);
    }

    private setupSubscriptions(event) {
        this.form.field('CustomerID')
            .onChange
            .subscribe((data) => {
                if (data) {
                    this.customerService.Get(this.quote.CustomerID, ['Info', 'Info.Addresses']).subscribe((customer: Customer) => {
                        this.quote.Customer = customer;
                        this.addAddresses();
                        this.quote.CustomerName = customer.Info.Name;

                        if (customer.CreditDays !== null) {
                            this.quote.CreditDays = customer.CreditDays;
                        }

                        this.quote = _.cloneDeep(this.quote);
                    });
                }
            });
        this.form.field('QuoteDate')
            .onChange
            .subscribe((data) => {
                if (data) {
                    console.log('== CHANGED DATE ==');
                    this.quote.ValidUntilDate = moment(this.quote.QuoteDate).add(1, 'month').toDate();

                    this.quote = _.cloneDeep(this.quote);
                }
            });
    }

    public ngOnInit() {
        this.getLayoutAndData();
    }

    private getLayoutAndData() {
        this.fields = this.getComponentLayout().Fields;

        Observable.forkJoin(
            this.departementService.GetAll(null),
            this.projectService.GetAll(null),
            this.customerQuoteService.Get(this.quoteID, ['Dimensions', 'Items', 'Items.Product', 'Items.VatType',
                'Customer', 'Customer.Info', 'Customer.Info.Addresses']),
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
            this.addAddresses();
            this.updateSaveActions();
            this.extendFormConfig();
        }, (err) => {
            console.log('Error retrieving data: ', err);
            alert('En feil oppsto ved henting av tilbuds-data: ' + JSON.stringify(err));
        });
    }

    private extendFormConfig() {
        var departement: UniFieldLayout = this.fields.find(x => x.Property === 'Dimensions.DepartementID');
        departement.Options = {
            source: this.dropdownData[0],
            valueProperty: 'ID',
            displayProperty: 'Name',
            debounceTime: 200
        };

        var project: UniFieldLayout = this.fields.find(x => x.Property === 'Dimensions.ProjectID');
        project.Options = {
            source: this.dropdownData[1],
            valueProperty: 'ID',
            displayProperty: 'Name',
            debounceTime: 200
        };

        var invoiceaddress: UniFieldLayout = this.fields.find(x => x.Property === 'InvoiceAddress');
        invoiceaddress.Options = {
            entity: Address,
            listProperty: 'Customer.Info.Addresses',
            displayValue: 'AddressLine1',
            linkProperty: 'ID',
            foreignProperty: 'Customer.Info.InvoiceAddressID',
            editor: (value) => new Promise((resolve) => {
                if (!value) {
                    value = new Address();
                    value.ID = 0;
                }

                this.addressModal.openModal(value);

                this.addressModal.Changed.subscribe(modalval => {
                    resolve(modalval);
                });
            }),
            display: (address: Address) => {
                let displayVal = address.AddressLine1 + ', ' + address.PostalCode + ' ' + address.City;
                return displayVal;
            }
        };

        // var invoiceaddress: UniFieldBuilder = this.formConfig.find('InvoiceAddress');
        // invoiceaddress
        //    .setKendoOptions({
        //        dataTextField: 'AddressLine1',
        //        dataValueField: 'ID',
        //        enableSave: true
        //    })
        //    .setModel(this.businessRelationInvoice)
        //    .setModelField('Addresses')
        //    //  .setModelDefaultField('InvoiceAddressID')           
        //    .setPlaceholder(this.EmptyAddress)
        //    .setEditor(AddressModal);
        // invoiceaddress.onSelect = (address: Address) => {
        //    this.addressToInvoice(address);
        //    this.businessRelationInvoice.Addresses[0] = address;
        // };

        var shippingaddress: UniFieldLayout = this.fields.find(x => x.Property === 'ShippingAddress');
        shippingaddress.Options = {
            entity: Address,
            listProperty: 'Customer.Info.Addresses',
            displayValue: 'AddressLine1',
            linkProperty: 'ID',
            foreignProperty: 'Customer.Info.ShippingAddressID',
            editor: (value) => new Promise((resolve) => {
                if (!value) {
                    value = new Address();
                    value.ID = 0;
                }

                this.addressModal.openModal(value);

                this.addressModal.Changed.subscribe(modalval => {
                    resolve(modalval);
                });
            }),
            display: (address: Address) => {
                let displayVal = address.AddressLine1 + ', ' + address.PostalCode + ' ' + address.City;
                return displayVal;
            }
        };

        // var shippingaddress: UniFieldBuilder = this.formConfig.find('ShippingAddress');
        // shippingaddress
        //    .hasLineBreak(true)
        //    .setKendoOptions({
        //        dataTextField: 'AddressLine1',
        //        dataValueField: 'ID',
        //        enableSave: true
        //    })
        //    .setModel(this.businessRelationShipping)
        //    .setModelField('Addresses')
        //    //    .setModelDefaultField('ShippingAddressID')
        //    .setPlaceholder(this.EmptyAddress)
        //    .setEditor(AddressModal);
        // shippingaddress.onSelect = (address: Address) => {
        //    this.addressToShipping(address);
        //    this.businessRelationShipping.Addresses[0] = address;
        // };

        var customer: UniFieldLayout = this.fields.find(x => x.Property === 'CustomerID');
        customer.Options = {
            source: this.customers,
            valueProperty: 'ID',
            displayProperty: 'Info.Name',
            debounceTime: 200
        };
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
            action: (done) => this.saveQuoteTransition(done, 'register'),
            disabled: (this.quote.StatusCode !== StatusCodeCustomerQuote.Draft)

        });

        // TODO: Add a actions for shipToCustomer,customerAccept

        this.actions.push({
            label: 'Lagre og overfør til ordre',
            action: (done) => this.saveQuoteTransition(done, 'toOrder'),
            disabled: this.IsTransferToOrderDisabled()

        });
        this.actions.push({
            label: 'Lagre og overfør til faktura',
            action: (done) => this.saveQuoteTransition(done, 'toInvoice'),
            disabled: this.IsTransferToInvoiceDisabled()

        });
        this.actions.push({
            label: 'Avslutt tilbud',
            action: (done) => this.saveQuoteTransition(done, 'complete'),
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
        alert('Slett  - Under construction');
        done('Slett tilbud avbrutt');
    }

    private addAddresses() {
        var invoiceaddresses = this.businessRelationInvoice.Addresses ? this.businessRelationInvoice.Addresses : [];
        var shippingaddresses = this.businessRelationShipping.Addresses ? this.businessRelationShipping.Addresses : [];
        var firstinvoiceaddress = null;
        var firstshippingaddress = null;

        // remove addresses from last customer
        if (this.lastCustomerInfo) {
            this.lastCustomerInfo.Addresses.forEach(a => {
                invoiceaddresses.forEach((b, i) => {
                    if (a.ID == b.ID) {
                        delete invoiceaddresses[i];
                        return;
                    }
                });
                shippingaddresses.forEach((b, i) => {
                    if (a.ID == b.ID) {
                        delete shippingaddresses[i];
                        return;
                    }
                });
            });
        }

        // Add address from order if no addresses
        if (invoiceaddresses.length == 0) {
            var invoiceaddress = this.invoiceToAddress();
            if (!this.isEmptyAddress(invoiceaddress)) {
                firstinvoiceaddress = invoiceaddress;
            }
        } else {
            firstinvoiceaddress = invoiceaddresses.shift();
        }

        if (shippingaddresses.length == 0) {
            var shippingaddress = this.shippingToAddress();
            if (!this.isEmptyAddress(shippingaddress)) {
                firstshippingaddress = shippingaddress;
            }
        } else {
            firstshippingaddress = shippingaddresses.shift();
        }

        // Add addresses from current customer
        if (this.quote.Customer) {
            this.businessRelationInvoice = _.cloneDeep(this.quote.Customer.Info);
            this.businessRelationShipping = _.cloneDeep(this.quote.Customer.Info);
            this.lastCustomerInfo = this.quote.Customer.Info;
        }

        if (!this.isEmptyAddress(firstinvoiceaddress)) {
            this.businessRelationInvoice.Addresses.unshift(firstinvoiceaddress);
        }

        if (!this.isEmptyAddress(firstshippingaddress)) {
            this.businessRelationShipping.Addresses.unshift(firstshippingaddress);
        }

        this.businessRelationInvoice.Addresses = this.businessRelationInvoice.Addresses.concat(invoiceaddresses);
        this.businessRelationShipping.Addresses = this.businessRelationShipping.Addresses.concat(shippingaddresses);
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
        this.saveQuote((quote => {
            done('Lagret');
        }));

        //this.saveQuote();
        //done('Lagret');
    }

    private saveQuoteTransition(done: any, transition: string) {
        this.saveQuote((quote) => {
            this.customerQuoteService.Transition(this.quote.ID, this.quote, transition).subscribe(() => {
                console.log('== TRANSITION OK ' + transition + ' ==');
                done(transition);

                this.customerQuoteService.Get(quote.ID, ['Dimensions', 'Items', 'Items.Product', 'Items.VatType',
                    'Customer', 'Customer.Info', 'Customer.Info.Addresses']).subscribe((data) => {
                        this.quote = data;
                        this.updateStatusText();
                        this.updateSaveActions();
                        this.ready(null);
                    });
            }, (err) => {
                console.log('Feil oppstod ved ' + transition + ' transition', err);
                done('Feilet');
                this.log(err);
            });
        });
    }


    private saveQuote(cb = null) {
        this.quote.TaxInclusiveAmount = -1; // TODO in AppFramework, does not save main entity if just items have changed

        if (this.quote.DimensionsID === 0) {
            this.quote.Dimensions = new Dimensions();
            this.quote.Dimensions['_createguid'] = this.customerQuoteService.getNewGuid();
        }

        this.customerQuoteService.Put(this.quote.ID, this.quote)
            .subscribe(
            (quote) => {
                this.quote = quote;
                this.updateStatusText();
                this.updateSaveActions();

                if (cb) {
                    cb(quote);
                }
            },
            (err) => {
                console.log('Feil oppsto ved lagring', err);
                this.log(err);
            }
            );
    }

    private updateStatusText() {
        this.statusText = this.customerQuoteService.getStatusText((this.quote.StatusCode || '').toString());
    }



    private saveAndPrint(done) {
        this.saveQuote((quote) => {
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

    private isEmptyAddress(address: Address): boolean {
        if (address == null) {
            return true;
        }
        return (address.AddressLine1 == null &&
            address.AddressLine2 == null &&
            address.AddressLine3 == null &&
            address.PostalCode == null &&
            address.City == null &&
            address.Country == null &&
            address.CountryCode == null);
    }

    private invoiceToAddress(): Address {
        var a = new Address();
        a.AddressLine1 = this.quote.InvoiceAddressLine1;
        a.AddressLine2 = this.quote.InvoiceAddressLine2;
        a.AddressLine3 = this.quote.ShippingAddressLine3;
        a.PostalCode = this.quote.InvoicePostalCode;
        a.City = this.quote.InvoiceCity;
        a.Country = this.quote.InvoiceCountry;
        a.CountryCode = this.quote.InvoiceCountryCode;

        return a;
    }

    private shippingToAddress(): Address {
        var a = new Address();
        a.AddressLine1 = this.quote.ShippingAddressLine1;
        a.AddressLine2 = this.quote.ShippingAddressLine2;
        a.AddressLine3 = this.quote.ShippingAddressLine3;
        a.PostalCode = this.quote.ShippingPostalCode;
        a.City = this.quote.ShippingCity;
        a.Country = this.quote.ShippingCountry;
        a.CountryCode = this.quote.ShippingCountryCode;

        return a;
    }

    public addressToInvoice(a: Address) {
        this.quote.InvoiceAddressLine1 = a.AddressLine1;
        this.quote.InvoiceAddressLine2 = a.AddressLine2;
        this.quote.ShippingAddressLine3 = a.AddressLine3;
        this.quote.InvoicePostalCode = a.PostalCode;
        this.quote.InvoiceCity = a.City;
        this.quote.InvoiceCountry = a.Country;
        this.quote.InvoiceCountryCode = a.CountryCode;
    }

    public addressToShipping(a: Address) {
        this.quote.ShippingAddressLine1 = a.AddressLine1;
        this.quote.ShippingAddressLine2 = a.AddressLine2;
        this.quote.ShippingAddressLine3 = a.AddressLine3;
        this.quote.ShippingPostalCode = a.PostalCode;
        this.quote.ShippingCity = a.City;
        this.quote.ShippingCountry = a.Country;
        this.quote.ShippingCountryCode = a.CountryCode;
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
                    Property: 'InvoiceAddress',
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
                    Property: 'ShippingAddress',
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
                    EntityType: 'Project',
                    Property: 'Dimensions.ProjectID',
                    Placement: 4,
                    Hidden: false,
                    FieldType: FieldType.DROPDOWN,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Std. prosjekt på linje',
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
                    ID: 20,
                    Deleted: false,
                    CreatedAt: null,
                    UpdatedAt: null,
                    CreatedBy: null,
                    UpdatedBy: null,
                    CustomFields: null
                },
                {
                    ComponentLayoutID: 3,
                    EntityType: 'Departement',
                    Property: 'Dimensions.DepartementID',
                    Placement: 4,
                    Hidden: false,
                    FieldType: FieldType.DROPDOWN,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Std. avdeling på linje',
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
                    ID: 21,
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
                    CustomFields: null
                }
            ]
        };
    }
}
