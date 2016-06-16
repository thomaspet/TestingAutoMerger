import {Component, ComponentRef, Input, ViewChild, OnInit} from '@angular/core';
import {Router, RouteParams, RouterLink} from '@angular/router-deprecated';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';

import {CustomerInvoiceService, CustomerInvoiceItemService, CustomerService} from '../../../../services/services';
import {ProjectService, DepartementService, AddressService, ReportDefinitionService} from '../../../../services/services';

import {UniSave, IUniSaveAction} from '../../../../../framework/save/save';
import {UniForm, UniField, UniFieldLayout} from '../../../../../framework/uniform';


import {InvoiceItemList} from './invoiceItemList';

import {ComponentLayout, CustomerInvoice, Customer, Dimensions, Address, BusinessRelation} from '../../../../unientities';
import {StatusCodeCustomerInvoice, FieldType} from '../../../../unientities';

import {AddressModal} from '../../customer/modals/address/address';
import {TradeHeaderCalculationSummary} from '../../../../models/sales/TradeHeaderCalculationSummary';

import {PreviewModal} from '../../../reports/modals/preview/previewModal';

declare var _;
declare var moment;


@Component({
    selector: 'invoice-details',
    templateUrl: 'app/components/sales/invoice/details/invoiceDetails.html',
    directives: [RouterLink, InvoiceItemList, AddressModal, UniForm, UniSave, PreviewModal],
    providers: [CustomerInvoiceService, CustomerInvoiceItemService, CustomerService, ProjectService, DepartementService, AddressService, ReportDefinitionService]
})
export class InvoiceDetails implements OnInit {

    @Input() public invoiceID: any;
    @ViewChild(UniForm) public form: UniForm;
    @ViewChild(AddressModal) public addressModal: AddressModal;

    @ViewChild(PreviewModal) private previewModal: PreviewModal;

    private config: any = {};
    private fields: any[] = [];

    private businessRelationInvoice: BusinessRelation = new BusinessRelation();
    private businessRelationShipping: BusinessRelation = new BusinessRelation();
    private lastCustomerInfo: BusinessRelation;

    private invoice: CustomerInvoice;
    //private lastSavedInfo: string;
    private statusText: string;

    private itemsSummaryData: TradeHeaderCalculationSummary;

    private customers: Customer[];
    private dropdownData: any;

    //private formConfig: UniFormBuilder;
    //private formInstance: UniForm;

    //private whenFormInstance: Promise<UniForm>;
    private emptyAddress: Address;
    private invoiceReference: CustomerInvoice;
    private invoiceButtonText: string = 'Fakturer';
    private recalcTimeout: any;

    //Temp variable to detect changes
    //private currentCustomerID: number = null;

    //private actions: IUniSaveAction[] = [];
    private actions: IUniSaveAction[];

    constructor(private customerService: CustomerService,
        private customerInvoiceService: CustomerInvoiceService,
        private customerInvoiceItemService: CustomerInvoiceItemService,
        private departementService: DepartementService,
        private projectService: ProjectService,
        private addressService: AddressService,
        private reportDefinitionService: ReportDefinitionService,
        private router: Router, private params: RouteParams) {

        this.invoiceID = params.get('id');
        this.businessRelationInvoice.Addresses = [];
        this.businessRelationShipping.Addresses = [];
    }

    private log(err) {
        alert(err._body);
    }

    private nextInvoice() {
        this.customerInvoiceService.next(this.invoice.ID)
            .subscribe((data) => {
                this.router.navigateByUrl('/sales/invoice/details/' + data.ID);
            });
    }

    private previousInvoice() {
        this.customerInvoiceService.previous(this.invoice.ID)
            .subscribe((data) => {
                this.router.navigateByUrl('/sales/invoice/details/' + data.ID);
            });
    }

    private addInvoice() {
        this.customerInvoiceService.newCustomerInvoice().then(invoice => {
            this.customerInvoiceService.Post(invoice)
                .subscribe(
                (data) => {
                    this.router.navigateByUrl('/sales/invoice/details/' + data.ID);
                },
                (err) => {
                    console.log('Error creating invoice: ', err);
                    this.log(err);
                }
                );
        });
    }

    private isActive(instruction: any[]): boolean {
        return this.router.isRouteActive(this.router.generate(instruction));
    }

    private change(value: CustomerInvoice) {
        //console.log('Change:', value);
        //TODO needs to update specific based on what value has changed. Not supported pr. 16.06.2016

        //if (value.CustomerID != this.currentCustomerID) {
        //    this.onChangeCustomer();
        //    this.currentCustomerID = value.CustomerID;
        //}

        //this.form.field('CreditDays')
        //    .onReady
        //    .subscribe((days) => {
        //        if (days) {
        //            this.invoice.PaymentDueDate = moment(this.invoice.InvoiceDate).startOf('day').add(Number(days), 'days').toDate();
        //            this.invoice = _.cloneDeep(this.invoice);
        //        }
        //    });
    }

    private onChangeCustomer() {
        this.customerService.Get(this.invoice.CustomerID, ['Info', 'Info.Addresses']).subscribe((customer: Customer) => {
            this.invoice.Customer = customer;
            this.addAddresses();
            //this.invoice.invoiceaddress = .refresh(self.businessRelationInvoice);
            //    shippingaddress.refresh(self.businessRelationShipping);
            this.invoice.CustomerName = customer.Info.Name;
            this.invoice = _.cloneDeep(this.invoice);
        }
    }

    //        self.invoice.Customer = customer;
    //        self.addAddresses();
    //        invoiceaddress.refresh(self.businessRelationInvoice);
    //        shippingaddress.refresh(self.businessRelationShipping);
    //        self.invoice.CustomerName = customer.Info.Name;


    public ready(event) {
        this.form.field('FreeTxt').addClass('max-width', true);
        this.setupSubscriptions(null);
    }

    private setupSubscriptions(event) {

        this.form.field('CreditDays')
            .onChange
            .subscribe((data) => {
                if (data.CreditDays) {
                    this.invoice.PaymentDueDate = moment(this.invoice.InvoiceDate).startOf('day').add(Number(data.CreditDays), 'days').toDate();
                    this.invoice = _.cloneDeep(this.invoice);
                }
            });
    }
    //var creditdays: UniFieldBuilder = this.formConfig.find('CreditDays');
    //creditdays.ready.subscribe((component) => {
    //    component.config.control.valueChanges.subscribe(days => {
    //        if (days) {
    //            this.invoice.PaymentDueDate = moment(this.invoice.InvoiceDate).startOf('day').add(Number(days), 'days').toDate();
    //            paymentduedate.refresh(this.invoice.PaymentDueDate);
    //        }
    //    });
    //});

    //paymentduedate.ready.subscribe((component) => {
    //    component.config.control.valueChanges.subscribe(date => {
    //        if (date) {
    //            var newdays = moment(date).startOf('day').diff(moment(this.invoice.InvoiceDate).startOf('day'), 'days');
    //            if (newdays != this.invoice.CreditDays) {
    //                this.invoice.CreditDays = newdays;
    //                creditdays.refresh(this.invoice.CreditDays);
    //            }
    //        }
    //    });
    //});

    public ngOnInit() {
        this.getLayoutAndData();
    }

    public getLayoutAndData() {
        this.fields = this.getComponentLayout().Fields;

        Observable.forkJoin(
            this.departementService.GetAll(null),
            this.projectService.GetAll(null),
            this.customerInvoiceService.Get(this.invoiceID, ['Dimensions', 'Items', 'Items.Product', 'Items.VatType', 'Customer', 'Customer.Info', 'Customer.Info.Addresses', 'InvoiceReference']),
            this.customerService.GetAll(null, ['Info']),
            this.addressService.GetNewEntity(null, 'address')
        ).subscribe(response => {
            this.dropdownData = [response[0], response[1]];
            this.invoice = response[2];
            this.customers = response[3];
            this.emptyAddress = response[4];
            this.invoiceReference = response[5];

            //Add a blank item in the dropdown controls
            this.dropdownData[0].unshift(null);
            this.dropdownData[1].unshift(null);
            this.customers.unshift(null);

            if (this.invoice.InvoiceType == 1) {
                this.invoiceButtonText = 'Krediter';
            }
            this.updateStatusText();
            this.addAddresses();
            this.updateSaveActions();
            this.extendFormConfig();

            //setTimeout(() => {
            //    this.ready();
            //});
        }, (err) => {
            console.log('Error retrieving data: ', err);
            alert('En feil oppsto ved henting av data: ' + JSON.stringify(err));
        });
    }



    private extendFormConfig() {
        var paymentduedate: UniFieldLayout = this.fields.find(x => x.Property === 'PaymentDueDate');
        //TK TODO?? paymentduedate.hasLineBreak(true);

        var deliverydate: UniFieldLayout = this.fields.find(x => x.Property === 'DeliveryDate');
        //TK TODO?? deliverydate.hasLineBreak(true);

        // TODO remove .ready when functionality is available later on

        //TK TODO::
        //var creditdays: UniFieldBuilder = this.formConfig.find('CreditDays');
        //creditdays.ready.subscribe((component) => {
        //    component.config.control.valueChanges.subscribe(days => {
        //        if (days) {
        //            this.invoice.PaymentDueDate = moment(this.invoice.InvoiceDate).startOf('day').add(Number(days), 'days').toDate();
        //            paymentduedate.refresh(this.invoice.PaymentDueDate);
        //        }
        //    });
        //});
        //paymentduedate.ready.subscribe((component) => {
        //    component.config.control.valueChanges.subscribe(date => {
        //        if (date) {
        //            var newdays = moment(date).startOf('day').diff(moment(this.invoice.InvoiceDate).startOf('day'), 'days');
        //            if (newdays != this.invoice.CreditDays) {
        //                this.invoice.CreditDays = newdays;
        //                creditdays.refresh(this.invoice.CreditDays);
        //            }
        //        }
        //    });
        //});

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

        //TODO: Gjennomgang med Kjetil
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

        //var invoiceaddress: UniFieldBuilder = this.formConfig.find('InvoiceAddress');
        //invoiceaddress
        //    .setKendoOptions({
        //        dataTextField: 'AddressLine1',
        //        dataValueField: 'ID',
        //        enableSave: true
        //    })
        //    .setModel(this.businessRelationInvoice)
        //    .setModelField('Addresses')
        //    //  .setModelDefaultField('InvoiceAddressID')           
        //    .setPlaceholder(this.emptyAddress)
        //    .setEditor(AddressModal);
        //invoiceaddress.onSelect = (address: Address) => {
        //    this.addressToInvoice(address);
        //    this.businessRelationInvoice.Addresses[0] = address;
        //};

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
        //TK TODO: 
        //var shippingaddress: UniFieldBuilder = this.formConfig.find('ShippingAddress');
        //shippingaddress
        //    .setKendoOptions({
        //        dataTextField: 'AddressLine1',
        //        dataValueField: 'ID',
        //        enableSave: true
        //    })
        //    .setModel(this.businessRelationShipping)
        //    .setModelField('Addresses')
        //    //    .setModelDefaultField('ShippingAddressID')
        //    .setPlaceholder(this.emptyAddress)
        //    .setEditor(AddressModal);
        //shippingaddress.onSelect = (address: Address) => {
        //    this.addressToShipping(address);
        //    this.businessRelationShipping.Addresses[0] = address;
        //};

        var customer: UniFieldLayout = this.fields.find(x => x.Property === 'CustomerID');
        customer.Options = {
            source: this.customers,
            valueProperty: 'ID',
            displayProperty: 'Info.Name',
            debounceTime: 200
        };

        //var customer: UniFieldBuilder = this.formConfig.find('CustomerID');
        //customer
        //    .setKendoOptions({
        //        dataTextField: 'Info.Name',
        //        dataValueField: 'ID',
        //        dataSource: this.customers
        //    });

        //TK TODO??
        //customer.onSelect = function (customerID) {
        //    self.customerService.Get(customerID, ['Info', 'Info.Addresses']).subscribe((customer: Customer) => {
        //        self.invoice.Customer = customer;
        //        self.addAddresses();
        //        invoiceaddress.refresh(self.businessRelationInvoice);
        //        shippingaddress.refresh(self.businessRelationShipping);
        //        self.invoice.CustomerName = customer.Info.Name;
        //    });
        //};
    }

    private updateSaveActions() {
        this.actions = [];

        this.actions.push({
            label: 'Lagre',
            action: (done) => this.saveInvoiceManual(done),
            main: true,
            disabled: false
        });

        this.actions.push({
            label: this.invoiceButtonText, //Fakturer eller Lagre
            action: (done) => this.saveInvoiceTransition(done, 'invoice'),
            disabled: this.IsinvoiceActionDisable()
        });

        this.actions.push({
            label: 'Lagre og skriv ut',
            action: (done) => this.saveAndPrint(done),
            disabled: false
        });

        this.actions.push({
            label: 'Registrer betaling',
            action: (done) => {
                alert('Registrer betaling  - Under construction');
                done();
            },
            disabled: false
        });

        this.actions.push({
            label: 'Slett',
            action: (done) => {
                alert('Slett  - Under construction');
                done();
            },
            disabled: true
        });
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
        if (this.invoice.Customer) {
            this.businessRelationInvoice = _.cloneDeep(this.invoice.Customer.Info);
            this.businessRelationShipping = _.cloneDeep(this.invoice.Customer.Info);
            this.lastCustomerInfo = this.invoice.Customer.Info;
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

    private recalcItemSums(invoiceItems: any) {
        this.invoice.Items = invoiceItems;

        // do recalc after 2 second to avoid to much requests
        if (this.recalcTimeout) {
            clearTimeout(this.recalcTimeout);
        }

        this.recalcTimeout = setTimeout(() => {

            invoiceItems.forEach((x) => {
                x.PriceIncVat = x.PriceIncVat ? x.PriceIncVat : 0;
                x.PriceExVat = x.PriceExVat ? x.PriceExVat : 0;
                x.CalculateGrossPriceBasedOnNetPrice = x.CalculateGrossPriceBasedOnNetPrice ? x.CalculateGrossPriceBasedOnNetPrice : false;
                x.Discount = x.Discount ? x.Discount : 0;
                x.DiscountPercent = x.DiscountPercent ? x.DiscountPercent : 0;
                x.NumberOfItems = x.NumberOfItems ? x.NumberOfItems : 0;
                x.SumTotalExVat = x.SumTotalExVat ? x.SumTotalExVat : 0;
                x.SumTotalIncVat = x.SumTotalIncVat ? x.SumTotalIncVat : 0;
            });

            this.customerInvoiceService.calculateInvoiceSummary(invoiceItems)
                .subscribe((data) => {
                    this.itemsSummaryData = data;
                    this.updateSaveActions();
                },
                (err) => {
                    console.log('Error when recalculating items:', err);
                    this.log(err);
                }
                );
        }, 2000);
    }

    private saveInvoiceTransition(done: any, transition: string) {
        this.saveInvoice((invoice) => {
            this.customerInvoiceService.Transition(this.invoice.ID, this.invoice, transition).subscribe(() => {
                console.log('== TRANSITION OK ' + transition + ' ==');
                this.router.navigateByUrl('/sales/invoice/details/' + this.invoice.ID);

                this.customerInvoiceService.Get(invoice.ID, ['Dimensions', 'Items', 'Items.Product', 'Items.VatType', 'Customer', 'Customer.Info', 'Customer.Info.Addresses']).subscribe((invoice) => {
                    this.invoice = invoice;
                    this.updateStatusText();
                    this.updateSaveActions();
                });
                done();
            }, (err) => {
                console.log('Feil oppstod ved ' + transition + ' transition', err);
                done('Feilet');
                this.log(err);
            });
        }, transition);
    }

    private saveInvoiceManual(done) {
        this.saveInvoice((invoice => {
            done("Lagret");
        }));
    }

    private saveInvoice(cb = null, transition = '') {
        //this.formInstance.sync();
        //this.lastSavedInfo = 'Lagrer faktura...';
        this.invoice.TaxInclusiveAmount = -1; // TODO in AppFramework, does not save main entity if just items have changed

        if (transition == 'invoice' && this.invoice.DeliveryDate == null) {
            this.invoice.DeliveryDate = moment();
        }

        if (this.invoice.DimensionsID === 0) {
            this.invoice.Dimensions = new Dimensions();
            this.invoice.Dimensions['_createguid'] = this.customerInvoiceService.getNewGuid();
        }

        //TK TODO : According to customer

        this.customerInvoiceService.Put(this.invoice.ID, this.invoice)
            .subscribe(
            (invoice: CustomerInvoice) => {
                //this.lastSavedInfo = 'Sist lagret: ' + (new Date()).toLocaleTimeString();
                this.invoice = invoice;
                this.updateStatusText();
                this.updateSaveActions();

                if (cb) {
                    cb(invoice);
                }
            },
            (err) => {
                console.log('Feil oppsto ved lagring', err);
                this.log(err);
            }
            );
    }

    private updateStatusText() {
        //this.statusText = this.customerInvoiceService.getStatusText((this.invoice.StatusCode || '').toString(), this.invoice.InvoiceType);
        this.statusText = this.customerInvoiceService.getStatusText(this.invoice.StatusCode, this.invoice.InvoiceType);
    }

    private IsinvoiceActionDisable() {

        if ((this.invoice.TaxExclusiveAmount === 0) &&
            ((this.itemsSummaryData == null) || (this.itemsSummaryData.SumTotalIncVat === 0))) {
            return true;
        }

        //return this.invoice._links.transitions.invoice; //Links available??
        if (this.invoice.StatusCode === StatusCodeCustomerInvoice.Draft) {
            return false;
        }
        return true;
    }

    private saveAndPrint(done) {
        this.saveInvoice((invoice) => {
            this.reportDefinitionService.getReportByName('Faktura Uten Giro').subscribe((report) => {
                if (report) {
                    this.previewModal.openWithId(report, invoice.ID);
                    done('Utskrift');
                } else {
                    done('Rapport mangler');
                }
            });
        });
    }

    private isEmptyAddress(address: Address): boolean {
        if (address == null) { return true; }
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
        a.AddressLine1 = this.invoice.InvoiceAddressLine1;
        a.AddressLine2 = this.invoice.InvoiceAddressLine2;
        a.AddressLine3 = this.invoice.ShippingAddressLine3;
        a.PostalCode = this.invoice.InvoicePostalCode;
        a.City = this.invoice.InvoiceCity;
        a.Country = this.invoice.InvoiceCountry;
        a.CountryCode = this.invoice.InvoiceCountryCode;

        return a;
    }

    private shippingToAddress(): Address {
        var a = new Address();
        a.AddressLine1 = this.invoice.ShippingAddressLine1;
        a.AddressLine2 = this.invoice.ShippingAddressLine2;
        a.AddressLine3 = this.invoice.ShippingAddressLine3;
        a.PostalCode = this.invoice.ShippingPostalCode;
        a.City = this.invoice.ShippingCity;
        a.Country = this.invoice.ShippingCountry;
        a.CountryCode = this.invoice.ShippingCountryCode;

        return a;
    }

    private addressToInvoice(a: Address) {
        this.invoice.InvoiceAddressLine1 = a.AddressLine1;
        this.invoice.InvoiceAddressLine2 = a.AddressLine2;
        this.invoice.ShippingAddressLine3 = a.AddressLine3;
        this.invoice.InvoicePostalCode = a.PostalCode;
        this.invoice.InvoiceCity = a.City;
        this.invoice.InvoiceCountry = a.Country;
        this.invoice.InvoiceCountryCode = a.CountryCode;
    }

    private addressToShipping(a: Address) {
        this.invoice.ShippingAddressLine1 = a.AddressLine1;
        this.invoice.ShippingAddressLine2 = a.AddressLine2;
        this.invoice.ShippingAddressLine3 = a.AddressLine3;
        this.invoice.ShippingPostalCode = a.PostalCode;
        this.invoice.ShippingCity = a.City;
        this.invoice.ShippingCountry = a.Country;
        this.invoice.ShippingCountryCode = a.CountryCode;
    }

    // TODO: update to 'ComponentLayout' when the object respect interface
    private getComponentLayout(): any {

        return {
            Name: 'CustomerInvoice',
            BaseEntity: 'CustomerInvoice',
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
                    EntityType: 'CustomerInvoice',
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
                    EntityType: 'CustomerInvoice',
                    Property: 'InvoiceDate',
                    Placement: 3,
                    Hidden: false,
                    FieldType: FieldType.DATEPICKER,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Fakturadato',
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
                    EntityType: 'CustomerInvoice',
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
                    EntityType: 'CustomerInvoice',
                    Property: 'PaymentDueDate',
                    Placement: 1,
                    Hidden: false,
                    FieldType: FieldType.DATEPICKER,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Forfallsdato',
                    Description: '',
                    HelpText: '',
                    FieldSet: 0,
                    Section: 0,
                    Placeholder: null,
                    Options: null,
                    LineBreak: true,
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
                    ComponentLayoutID: 3,
                    EntityType: 'CustomerInvoice',
                    Property: 'DeliveryDate',
                    Placement: 1,
                    Hidden: false,
                    FieldType: FieldType.DATEPICKER,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Leveringsdato',
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
                    ID: 7,
                    Deleted: false,
                    CreatedAt: null,
                    UpdatedAt: null,
                    CreatedBy: null,
                    UpdatedBy: null,
                    CustomFields: null
                },
                {
                    //Vår referanse
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
                    //Deres referanse
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
                    //Rekvisisjon
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
                    EntityType: 'CustomerInvoice',
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
