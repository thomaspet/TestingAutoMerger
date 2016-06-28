import {Component, Input, ViewChild, OnInit} from '@angular/core';
import {Router, RouteParams, RouterLink} from '@angular/router-deprecated';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';

import {CustomerInvoiceService, CustomerInvoiceItemService, CustomerService, BusinessRelationService} from '../../../../services/services';
import {ProjectService, DepartementService, AddressService, ReportDefinitionService} from '../../../../services/services';

import {UniSave, IUniSaveAction} from '../../../../../framework/save/save';
import {UniForm, UniFieldLayout} from '../../../../../framework/uniform';


import {InvoiceItemList} from './invoiceItemList';

import {CustomerInvoice, CustomerInvoiceItem, Customer, Dimensions, Address, BusinessRelation} from '../../../../unientities';
import {StatusCodeCustomerInvoice, FieldType} from '../../../../unientities';

import {AddressModal} from '../../../common/modals/modals';
import {TradeHeaderCalculationSummary} from '../../../../models/sales/TradeHeaderCalculationSummary';

import {PreviewModal} from '../../../reports/modals/preview/previewModal';
import {TabService} from '../../../layout/navbar/tabstrip/tabService';

import {InvoicePaymentData} from '../../../../models/sales/InvoicePaymentData';
import {RegisterPaymentModal} from '../../../common/modals/registerPaymentModal';

declare var _;
declare var moment;

class CustomerInvoiceExt extends CustomerInvoice {
    public _InvoiceAddress: Address;
    public _InvoiceAddresses: Array<Address>;
    public _ShippingAddress: Address;
    public _ShippingAddresses: Array<Address>;
}

@Component({
    selector: 'invoice-details',
    templateUrl: 'app/components/sales/invoice/details/invoiceDetails.html',
    directives: [RouterLink, InvoiceItemList, AddressModal, UniForm, UniSave, PreviewModal, RegisterPaymentModal],
    providers: [CustomerInvoiceService, CustomerInvoiceItemService, CustomerService, ProjectService, DepartementService, AddressService, ReportDefinitionService, BusinessRelationService]
})
export class InvoiceDetails implements OnInit {

    @Input() public invoiceID: any;
    @ViewChild(UniForm) public form: UniForm;
    @ViewChild(AddressModal) public addressModal: AddressModal;

    @ViewChild(PreviewModal) private previewModal: PreviewModal;

    @ViewChild(RegisterPaymentModal) private registerPaymentModal: RegisterPaymentModal;


    public config: any = {};
    private fields: any[] = [];

    private invoice: CustomerInvoiceExt;
    private statusText: string;

    private itemsSummaryData: TradeHeaderCalculationSummary;

    private customers: Customer[];
    private dropdownData: any;

    private emptyAddress: Address;
    private invoiceReference: CustomerInvoice;
    private invoiceButtonText: string = 'Fakturer';
    private creditButtonText: string = 'Krediter faktura';
    private recalcTimeout: any;
    private actions: IUniSaveAction[];

    private expandOptions: Array<string> = ['Dimensions', 'Items', 'Items.Product', 'Items.VatType',
        'Customer', 'Customer.Info', 'Customer.Info.Addresses', 'InvoiceReference'];

    constructor(private customerService: CustomerService,
        private customerInvoiceService: CustomerInvoiceService,
        private customerInvoiceItemService: CustomerInvoiceItemService,
        private departementService: DepartementService,
        private projectService: ProjectService,
        private addressService: AddressService,
        private reportDefinitionService: ReportDefinitionService,
        private businessRelationService: BusinessRelationService,

        private router: Router, private params: RouteParams,
        private tabService: TabService) {

        this.invoiceID = params.get('id');
        this.tabService.addTab({ url: '/sales/invoice/details/' + this.invoiceID, name: 'Fakturanr. ' + this.invoiceID, active: true, moduleID: 5 });
    }

    private log(err) {
        alert(err._body);
    }

    public nextInvoice() {
        this.customerInvoiceService.next(this.invoice.ID)
            .subscribe((data) => {
                if (data) {
                    this.router.navigateByUrl('/sales/invoice/details/' + data.ID);
                }
            },
            (err) => {
                console.log('Error getting next invoice: ', err);
                alert('Ikke flere faktura etter denne');
            }
            );
    }

    public previousInvoice() {
        this.customerInvoiceService.previous(this.invoice.ID)
            .subscribe((data) => {
                if (data) {
                    this.router.navigateByUrl('/sales/invoice/details/' + data.ID);
                }
            },
            (err) => {
                console.log('Error getting previous invoice: ', err);
                alert('Ikke flere faktura før denne');
            }
            );
    }

    public addInvoice() {
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

    public isActive(instruction: any[]): boolean {
        return this.router.isRouteActive(this.router.generate(instruction));
    }

    public change(value: CustomerInvoice) { }

    public ready(event) {
        this.form.field('FreeTxt').addClass('max-width', true);
        this.setupSubscriptions(null);


        if (this.invoice.StatusCode === StatusCodeCustomerInvoice.Draft) {
            this.form.editMode();
        } else {
            this.form.readMode();
        }

        if (this.invoice.PaymentDueDate === null) {
            this.invoice.PaymentDueDate = moment(this.invoice.InvoiceDate).startOf('day').add(Number(this.invoice.CreditDays), 'days').toDate();
        }
    }

    private setupSubscriptions(event) {
        this.form.field('CustomerID')
            .onChange
            .subscribe((data) => {
                if (data) {
                    this.customerService.Get(this.invoice.CustomerID, ['Info', 'Info.Addresses']).subscribe((customer: Customer) => {
                        let previousAddresses = this.invoice.Customer ? this.invoice.Customer.Info.Addresses : null;
                        this.invoice.Customer = customer;
                        this.addressService.setAddresses(this.invoice, previousAddresses);

                        this.invoice.CustomerName = customer.Info.Name;

                        if (customer.CreditDays !== null) {
                            this.invoice.CreditDays = customer.CreditDays;
                            this.invoice.PaymentDueDate = moment(this.invoice.InvoiceDate).startOf('day').add(Number(data.CreditDays), 'days').toDate();
                        }

                        this.invoice = _.cloneDeep(this.invoice);
                    });
                }
            });

        this.form.field('CreditDays')
            .onChange
            .subscribe((data) => {
                if (data.CreditDays) {
                    this.invoice.PaymentDueDate = moment(this.invoice.InvoiceDate).startOf('day').add(Number(data.CreditDays), 'days').toDate();
                    this.invoice = _.cloneDeep(this.invoice);
                }
            });

        this.form.field('PaymentDueDate')
            .onChange
            .subscribe((data) => {
                if (data.PaymentDueDate) {
                    var newdays = moment(data.PaymentDueDate).startOf('day').diff(moment(this.invoice.InvoiceDate).startOf('day'), 'days');
                    if (newdays !== this.invoice.CreditDays) {
                        this.invoice.CreditDays = newdays;
                        this.invoice = _.cloneDeep(this.invoice);
                    }
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
            this.customerInvoiceService.Get(this.invoiceID, this.expandOptions),
            this.customerService.GetAll(null, ['Info']),
            this.addressService.GetNewEntity(null, 'address')
        ).subscribe(response => {
            this.dropdownData = [response[0], response[1]];
            this.invoice = response[2];
            this.customers = response[3];
            this.emptyAddress = response[4];
            this.invoiceReference = response[5];

            // Add a blank item in the dropdown controls
            this.dropdownData[0].unshift(null);
            this.dropdownData[1].unshift(null);
            this.customers.unshift(null);

            if (this.invoice.InvoiceType === 1) {
                this.invoiceButtonText = 'Krediter';
                this.creditButtonText = 'Fakturer kreditnota';
            }
            this.updateStatusText();
            this.addressService.setAddresses(this.invoice);
            this.updateSaveActions();
            this.extendFormConfig();

        }, (err) => {
            console.log('Error retrieving data: ', err);
            alert('En feil oppsto ved henting av data: ' + JSON.stringify(err));
        });
    }

    private extendFormConfig() {
        let self = this;

        // TODO Insert line breaks were needed 


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

        var invoiceaddress: UniFieldLayout = this.fields.find(x => x.Property === '_InvoiceAddress');

        // TODO:
        invoiceaddress.Options = {
            entity: Address,
            listProperty: '_InvoiceAddresses',
            displayValue: 'AddressLine1',
            linkProperty: 'ID',
            foreignProperty: '_InvoiceAddressesID',
            editor: (value) => new Promise((resolve) => {
                if (!value) {
                    value = new Address();
                    value.ID = 0;
                }

                this.addressModal.openModal(value);

                this.addressModal.Changed.subscribe((address) => {
                    this.invoice._InvoiceAddress = address;
                    this.invoice = _.cloneDeep(this.invoice);
                    if (address._question) { self.saveAddressOnCustomer(address); }
                    resolve(address);
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
            foreignProperty: '_ShippingAddressesID',
            editor: (value) => new Promise((resolve) => {
                if (!value) {
                    value = new Address();
                    value.ID = 0;
                }

                this.addressModal.openModal(value);

                this.addressModal.Changed.subscribe((address) => {
                    this.invoice._ShippingAddress = address;
                    this.invoice = _.cloneDeep(this.invoice);
                    if (address._question) { self.saveAddressOnCustomer(address); }
                    resolve(address);
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

    private saveAddressOnCustomer(address: Address) {
        if (!address.ID || address.ID == 0) {
            address['_createguid'] = this.addressService.getNewGuid();
            this.invoice.Customer.Info.Addresses.push(address);
            this.businessRelationService.Put(this.invoice.Customer.Info.ID, this.invoice.Customer.Info).subscribe((res) => {
                this.invoice.Customer.Info = res;
                this.addressService.setAddresses(this.invoice);
            });
        } else {
            this.addressService.Put(address.ID, address).subscribe((res) => {
            });
        }
    }

    private updateSaveActions() {
        this.actions = [];

        this.actions.push({
            label: 'Lagre',
            action: (done) => this.saveInvoiceManual(done),
            main: true,
            disabled: (this.invoice.StatusCode !== StatusCodeCustomerInvoice.Draft)
        });

        this.actions.push({
            label: this.creditButtonText, //
            action: (done) => this.CreditInvoice(done),
            disabled: this.IsCreditActionDisabled()
        });

        this.actions.push({
            label: this.invoiceButtonText, // Fakturer eller Krediter
            action: (done) => this.saveInvoiceTransition(done, 'invoice'),
            disabled: this.IsInvoiceActionDisabled()
        });

        this.actions.push({
            label: 'Lagre og skriv ut',
            action: (done) => this.saveAndPrint(done),
            disabled: false
        });

        this.actions.push({
            label: 'Registrer betaling',
            action: (done) => this.payInvoice(done),
            disabled: this.IsPayActionDisabled()
        });

        this.actions.push({
            label: 'Slett',
            action: (done) => this.deleteInvoice(done),
            disabled: true
        });
    }

    private IsInvoiceActionDisabled() {
        if ((this.invoice.TaxExclusiveAmount === 0) &&
            ((this.itemsSummaryData == null) || (this.itemsSummaryData.SumTotalIncVat === 0))) {
            return true;
        }
        if (this.invoice.StatusCode === StatusCodeCustomerInvoice.Draft) {
            return false;
        }
        return true;
    }
    private IsCreditActionDisabled() {
        if (this.invoice.InvoiceType === 1) {
            return true; //TODO: fakturering av kreditnota er ikke implementert
        }

        if (this.invoice.StatusCode === StatusCodeCustomerInvoice.Invoiced ||
            this.invoice.StatusCode === StatusCodeCustomerInvoice.PartlyPaid ||
            this.invoice.StatusCode === StatusCodeCustomerInvoice.Paid) {
            return false;
        }
        return true;
    }

    private IsPayActionDisabled() {
        if (this.invoice.StatusCode === StatusCodeCustomerInvoice.Invoiced ||
            this.invoice.StatusCode === StatusCodeCustomerInvoice.PartlyPaid) {
            return false;
        }
        return true;
    }

    public recalcItemSums(invoiceItems: any) {
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

    private getValidInvoiceItems(invoiceItems: any) {
        let items: CustomerInvoiceItem[] = [];
        let showMessage: boolean = false;

        for (let i = 0; i < invoiceItems.length; i++) {
            let line: CustomerInvoiceItem = invoiceItems[i];

            if (line.ProductID !== null) {
                items.push(line);
            }
            else {
                showMessage = true;
            }
        }

        if (showMessage) {
            alert('En eller flere av linjene inneholder produkter som ikke finnes i produktliste. Disse vil ikke bli lagret med faktura. Vennligst opprett produktene først');
        }
        return items;
    }

    private saveInvoiceTransition(done: any, transition: string) {
        this.saveInvoice((invoice) => {
            this.customerInvoiceService.Transition(this.invoice.ID, this.invoice, transition).subscribe(() => {
                console.log('== TRANSITION OK ' + transition + ' ==');
                this.router.navigateByUrl('/sales/invoice/details/' + this.invoice.ID);

                this.customerInvoiceService.Get(invoice.ID, this.expandOptions).subscribe((data) => {
                    this.invoice = data;
                    this.updateStatusText();
                    this.updateSaveActions();
                    this.ready(null);
                });
                done('Fakturert');
            }, (err) => {
                console.log('Feil oppstod ved ' + transition + ' transition', err);
                done('Feilet');
                this.log(err);
            });
        }, transition);
    }

    private saveInvoiceManual(done) {
        this.saveInvoice((invoice => {
            done('Lagret');
        }));
    }

    private saveInvoice(cb = null, transition = '') {
        // Transform addresses to flat
        this.addressService.addressToInvoice(this.invoice, this.invoice._InvoiceAddress);
        this.addressService.addressToShipping(this.invoice, this.invoice._ShippingAddress);

        this.invoice.TaxInclusiveAmount = -1; // TODO in AppFramework, does not save main entity if just items have changed

        if (transition == 'invoice' && this.invoice.DeliveryDate == null) {
            this.invoice.DeliveryDate = moment();
        }

        if (this.invoice.DimensionsID === 0) {
            this.invoice.Dimensions = new Dimensions();
            this.invoice.Dimensions['_createguid'] = this.customerInvoiceService.getNewGuid();
        }

        //Save only lines with products from product list
        this.invoice.Items = this.getValidInvoiceItems(this.invoice.Items);

        this.customerInvoiceService.Put(this.invoice.ID, this.invoice)
            .subscribe(
            (invoiceSaved) => {
                this.customerInvoiceService.Get(this.invoice.ID, this.expandOptions).subscribe(invoiceGet => {
                    this.invoice = invoiceGet;
                    this.addressService.setAddresses(this.invoice);
                    this.updateStatusText();
                    this.updateSaveActions();
                    this.ready(null);

                    if (cb) {
                        cb(invoiceGet);
                    }
                });
            },
            (err) => {
                console.log('Feil oppsto ved lagring', err);
                this.log(err);
            }
            );
    }

    private updateStatusText() {
        this.statusText = this.customerInvoiceService.getStatusText(this.invoice.StatusCode, this.invoice.InvoiceType);
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

    private CreditInvoice(done) {
        this.customerInvoiceService.createCreditNoteFromInvoice(this.invoice.ID)
            .subscribe((data) => {
                this.router.navigateByUrl('/sales/invoice/details/' + data.ID);
            },
            (err) => {
                console.log('Error creating credit note: ', err);
                this.log(err);
            });
    }

    private payInvoice(done) {
        const title = `Register betaling, Faktura ${this.invoice.InvoiceNumber || ''}, ${this.invoice.CustomerName || ''}`;

        const invoiceData: InvoicePaymentData = {
            Amount: this.invoice.RestAmount,
            PaymentDate: new Date()
        };

        this.registerPaymentModal.openModal(this.invoice.ID, title, invoiceData);
        done('');
    }

    // private saveInvoiceTransition(done: any, transition: string) {
    //    this.saveInvoice((invoice) => {
    //        this.customerInvoiceService.Transition(this.invoice.ID, this.invoice, transition).subscribe(() => {
    //            console.log('== TRANSITION OK ' + transition + ' ==');
    //            this.router.navigateByUrl('/sales/invoice/details/' + this.invoice.ID);

    //            this.customerInvoiceService.Get(invoice.ID, ['Dimensions', 'Items', 'Items.Product', 'Items.VatType', 'Customer',
    //                'Customer.Info', 'Customer.Info.Addresses']).subscribe((data) => {
    //                    this.invoice = data;
    //                    this.updateStatusText();
    //                    this.updateSaveActions();
    //                    this.ready(null);
    //                });
    //            done('Fakturert');
    //        }, (err) => {
    //            console.log('Feil oppstod ved ' + transition + ' transition', err);
    //            done('Feilet');
    //            this.log(err);
    //        });
    //    }, transition);
    // }

    public onRegisteredPayment(modalData: any) {

        this.customerInvoiceService.ActionWithBody(modalData.id, modalData.invoice, 'payInvoice').subscribe((journalEntry) => {
            alert('Faktura er betalt. Bilagsnummer: ' + journalEntry.JournalEntryNumber);

            this.customerInvoiceService.Get(this.invoice.ID, this.expandOptions).subscribe((data) => {
                this.invoice = data;
                this.updateStatusText();
                this.updateSaveActions();
                this.ready(null);
            },
                (err) => {
                    //    console.log('Feil oppstod ved henting av faktura: Error:', err);
                    //    this.log(err);
                });

            console.log('Fsdfsdf');
            //}, (err) => {
            //    console.log('Feil oppstod ved henting av faktura: Error:', err);
            //    this.log(err);

        }, (err) => {
            console.log('Error registering payment: ', err);
            this.log(err);
        });
    }


    private deleteInvoice(done) {
        alert('Slett  - Under construction');
        done('Slett faktura avbrutt');
    }

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
                    EntityType: 'Address',
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
                    EntityType: 'Address',
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
                    Hidden: true, //false, // TODO: > 30.6
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
                    Hidden: true, //false, // TODO: > 30.6
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
