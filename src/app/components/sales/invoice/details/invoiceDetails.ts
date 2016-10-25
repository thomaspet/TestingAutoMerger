import {Component, Input, ViewChild} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';
import {CustomerInvoiceService, DepartmentService, CustomerInvoiceItemService, CustomerService, BusinessRelationService} from '../../../../services/services';
import {ProjectService, AddressService, ReportDefinitionService} from '../../../../services/services';
import {CompanySettingsService} from '../../../../services/common/CompanySettingsService';
import {IUniSaveAction} from '../../../../../framework/save/save';
import {UniForm, UniFieldLayout} from '../../../../../framework/uniform';
import {TradeItemHelper} from '../../salesHelper/tradeItemHelper';
import {CustomerInvoice, Customer, Address, CustomerInvoiceItem} from '../../../../unientities';
import {StatusCodeCustomerInvoice, FieldType, CompanySettings} from '../../../../unientities';
import {AddressModal} from '../../../common/modals/modals';
import {TradeHeaderCalculationSummary} from '../../../../models/sales/TradeHeaderCalculationSummary';
import {PreviewModal} from '../../../reports/modals/preview/previewModal';
import {TabService, UniModules} from '../../../layout/navbar/tabstrip/tabService';
import {InvoicePaymentData} from '../../../../models/sales/InvoicePaymentData';
import {RegisterPaymentModal} from '../../../common/modals/registerPaymentModal';
import {ToastService, ToastType} from '../../../../../framework/uniToast/toastService';
import {IToolbarConfig} from '../../../common/toolbar/toolbar';
import {UniStatusTrack} from '../../../common/toolbar/statustrack';

declare const _;
declare const moment;

class CustomerInvoiceExt extends CustomerInvoice {
    public _InvoiceAddress: Address;
    public _InvoiceAddresses: Array<Address>;
    public _ShippingAddress: Address;
    public _ShippingAddresses: Array<Address>;
    public _InvoiceAddressID: number;
    public _ShippingAddressID: number;
}

@Component({
    selector: 'invoice-details',
    templateUrl: 'app/components/sales/invoice/details/invoiceDetails.html'
})
export class InvoiceDetails {

    @Input() public invoiceID: any;
    @ViewChild(UniForm) public form: UniForm;
    @ViewChild(AddressModal) public addressModal: AddressModal;

    @ViewChild(PreviewModal) private previewModal: PreviewModal;

    @ViewChild(RegisterPaymentModal) private registerPaymentModal: RegisterPaymentModal;


    public config: any = {};
    private fields: any[] = [];

    private invoice: CustomerInvoiceExt;
    private deletedItems: Array<CustomerInvoiceItem>;

    private itemsSummaryData: TradeHeaderCalculationSummary;

    private customers: Customer[];
    private dropdownData: any;

    private emptyAddress: Address;
    private invoiceReference: CustomerInvoice;
    private invoiceButtonText: string = 'Fakturer';
    private creditButtonText: string = 'Krediter faktura';
    private recalcTimeout: any;
    private actions: IUniSaveAction[];
    private addressChanged: any;
    private companySettings: CompanySettings;
    private creditInvoiceArr: CustomerInvoice[];
    private toolbarconfig: IToolbarConfig;

    private expandOptions: Array<string> = ['Items', 'Items.Product', 'Items.VatType',
        'Items.Dimensions', 'Items.Dimensions.Project', 'Items.Dimensions.Department',
        'Customer', 'Customer.Info', 'Customer.Info.Addresses', 'Customer.Dimensions', 'Customer.Dimensions.Project', 'Customer.Dimensions.Department', 'InvoiceReference'];

    private formIsInitialized: boolean = false;

    constructor(private customerService: CustomerService,
                private customerInvoiceService: CustomerInvoiceService,
                private customerInvoiceItemService: CustomerInvoiceItemService,
                private departmentService: DepartmentService,
                private projectService: ProjectService,
                private addressService: AddressService,
                private reportDefinitionService: ReportDefinitionService,
                private businessRelationService: BusinessRelationService,
                private companySettingsService: CompanySettingsService,
                private toastService: ToastService,

                private router: Router,
                private route: ActivatedRoute,
                private tabService: TabService) {

        this.route.params.subscribe(params => {
            this.invoiceID = +params['id'];
            this.setup();
        });
    }

    private log(err) {
        this.toastService.addToast(err._body, ToastType.bad);
    }

    private getStatustrackConfig() {
        let statustrack: UniStatusTrack.IStatus[] = [];
        let activeStatus = this.invoice.StatusCode;
 
        this.customerInvoiceService.statusTypes.forEach((s, i) => {
            let _state: UniStatusTrack.States;

            if (s.Code > activeStatus) {
                _state = UniStatusTrack.States.Future;
            } else if (s.Code < activeStatus) {
                _state = UniStatusTrack.States.Completed;
            } else if (s.Code === activeStatus) {
                _state = UniStatusTrack.States.Active;
            }

            statustrack[i] = {
                title: s.Text,
                state: _state
            };
        });
        return statustrack;
    }

    public nextInvoice() {
        this.customerInvoiceService.next(this.invoice.ID)
            .subscribe((data) => {
                    if (data) {
                        this.router.navigateByUrl('/sales/invoices/' + data.ID);
                    }
                },
                (err) => {
                    console.log('Error getting next invoice: ', err);
                    this.toastService.addToast('Ikke flere faktura etter denne', ToastType.warn, 5);
                }
            );
    }

    public previousInvoice() {
        this.customerInvoiceService.previous(this.invoice.ID)
            .subscribe((data) => {
                    if (data) {
                        this.router.navigateByUrl('/sales/invoices/' + data.ID);
                    }
                },
                (err) => {
                    console.log('Error getting previous invoice: ', err);
                    this.toastService.addToast('Ikke flere faktura før denne', ToastType.warn, 5);
                }
            );
    }

    public addInvoice() {
        this.customerInvoiceService.newCustomerInvoice().then(invoice => {
            this.customerInvoiceService.Post(invoice)
                .subscribe(
                    (data) => {
                        this.router.navigateByUrl('/sales/invoices/' + data.ID);
                    },
                    (err) => {
                        console.log('Error creating invoice: ', err);
                        this.log(err);
                    }
                );
        });
    }

    public change(value: CustomerInvoice) { }

    public ready(event) {
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
            .changeEvent
            .subscribe((data) => {
                if (data) {
                    this.customerService.Get(this.invoice.CustomerID, ['Info', 'Info.Addresses', 'Info.InvoiceAddress', 'Info.ShippingAddress', 'Dimensions', 'Dimensions.Project', 'Dimensions.Department']).subscribe((customer: Customer) => {

                        let keepEntityAddresses: boolean = true;
                        if (this.invoice.Customer && this.invoice.CustomerID !== this.invoice.Customer.ID) {
                            keepEntityAddresses = false;
                        }

                        this.invoice.Customer = customer;
                        this.addressService.setAddresses(this.invoice, null, keepEntityAddresses);

                        this.invoice.CustomerName = customer.Info.Name;

                        if (customer.CreditDays !== null) {
                            this.invoice.CreditDays = customer.CreditDays;
                        } else {
                            this.invoice.CreditDays = this.companySettings.CustomerCreditDays;
                        }
                        this.invoice.PaymentDueDate = moment(this.invoice.InvoiceDate).startOf('day').add(Number(data.CreditDays), 'days').toDate();

                        this.invoice = _.cloneDeep(this.invoice);
                        this.updateToolbar();
                    });
                }
            });

        this.form.field('CreditDays')
            .changeEvent
            .subscribe((data) => {
                if (data.CreditDays) {
                    this.invoice.PaymentDueDate = moment(this.invoice.InvoiceDate).startOf('day').add(Number(data.CreditDays), 'days').toDate();
                    this.invoice = _.cloneDeep(this.invoice);
                    this.updateToolbar();
                }
            });

        this.form.field('PaymentDueDate')
            .changeEvent
            .subscribe((data) => {
                if (data.PaymentDueDate) {
                    var newdays = moment(data.PaymentDueDate).startOf('day').diff(moment(this.invoice.InvoiceDate).startOf('day'), 'days');
                    if (newdays !== this.invoice.CreditDays) {
                        this.invoice.CreditDays = newdays;
                        this.invoice = _.cloneDeep(this.invoice);
                        this.updateToolbar();
                    }
                }
            });
    }

    private setup() {
        this.deletedItems = [];

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
                this.addressService.setAddresses(this.invoice);
                this.setTabTitle();
                this.updateSaveActions();
                this.updateToolbar();
                this.getCreditInvoices();
                this.extendFormConfig();

                this.formIsInitialized = true;
            }, (err) => {
                console.log('Error retrieving data: ', err);
                this.toastService.addToast('En feil oppsto ved henting av data: ' + JSON.stringify(err), ToastType.bad);
            });
        } else {
            this.customerInvoiceService.Get(this.invoiceID, this.expandOptions)
                .subscribe((invoice) => {
                    this.invoice = invoice;
                    this.addressService.setAddresses(this.invoice);
                    this.setTabTitle();
                    this.updateToolbar();
                } , (err) => {
                    console.log('Error retrieving data: ', err);
                    this.toastService.addToast('En feil oppsto ved henting av data: ' + JSON.stringify(err), ToastType.bad);
                });
        }
    }

    private getCreditInvoices() {
        // Get list of credit notes for an invoice
        if (this.invoice.InvoiceType === 0 && this.invoice.CreditedAmount !== null && this.invoice.CreditedAmount !== 0) {
            this.customerInvoiceService.GetAll('filter=InvoiceReferenceID eq ' + this.invoice.ID)
                .subscribe((data) => {
                    this.creditInvoiceArr = data;
                }, (err) => {
                    console.log('Error retrieving data Credit Invoices: ', err);
                    this.toastService.addToast('En feil oppsto ved henting av data: ' + JSON.stringify(err), ToastType.bad);
                });
        }
    }

    private setTabTitle() {
        var tabTitle;
        if (this.invoice.InvoiceType === 1) {
            tabTitle = this.invoice.InvoiceNumber ? 'Kreditnotanr. ' + this.invoice.InvoiceNumber : 'Kreditnota (kladd)';
        } else {
            tabTitle = this.invoice.InvoiceNumber ? 'Fakturanr. ' + this.invoice.InvoiceNumber : 'Faktura (kladd)';
        }
        this.tabService.addTab({ url: '/sales/invoices/' + this.invoice.ID, name: tabTitle, active: true, moduleID: UniModules.Invoices });
    }

    private extendFormConfig() {
        let self = this;

        // TODO Insert line breaks were needed

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

                this.addressModal.openModal(value);

                if (this.addressChanged) {
                    this.addressChanged.unsubscribe();
                }

                this.addressChanged = this.addressModal.Changed.subscribe((address) => {
                    if (address._question) {
                        self.saveAddressOnCustomer(address, resolve);
                    } else {
                        resolve(address);
                    }
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

                if (this.addressChanged) {
                    this.addressChanged.unsubscribe();
                }

                this.addressChanged = this.addressModal.Changed.subscribe((address) => {
                    if (address._question) {
                        self.saveAddressOnCustomer(address, resolve);
                    } else {
                        resolve(address);
                    }
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

        if (!address.ID || address.ID === 0) {
            address['_createguid'] = this.addressService.getNewGuid();
            this.invoice.Customer.Info.Addresses.push(address);
            idx = this.invoice.Customer.Info.Addresses.length - 1;
        } else {
            idx = this.invoice.Customer.Info.Addresses.findIndex((a) => a.ID === address.ID);
            this.invoice.Customer.Info.Addresses[idx] = address;
        }

        // remove entries with equal _createguid
        this.invoice.Customer.Info.Addresses = _.uniq(this.invoice.Customer.Info.Addresses, '_createguid');

        // this.quote.Customer.Info.ID
        this.businessRelationService.Put(this.invoice.Customer.Info.ID, this.invoice.Customer.Info).subscribe((info) => {
            this.invoice.Customer.Info = info;
            resolve(info.Addresses[idx]);
        });
    }

    private updateToolbar() {
        this.toolbarconfig = {
            title: this.invoice.Customer ? (this.invoice.Customer.CustomerNumber + ' - ' + this.invoice.Customer.Info.Name) : this.invoice.CustomerName,
            subheads: [
                {title: this.invoice.InvoiceNumber ? (this.invoice.InvoiceType === 0 ? 'Fakturanr. ' : 'Kreditnota. ') + this.invoice.InvoiceNumber : '' },
                {title: !this.itemsSummaryData ? 'Netto kr ' + this.invoice.TaxExclusiveAmount + '.' : 'Netto kr ' + this.itemsSummaryData.SumTotalExVat + '.'},
                {title: this.invoice.InvoiceType === 1 && this.invoice.InvoiceReference ? 'Kreditering av <a href="#/sales/invoices/' + this.invoice.InvoiceReference.ID + '">faktura nr. ' + this.invoice.InvoiceReference.InvoiceNumber + '</a>' : ''}
            ],
            statustrack: this.getStatustrackConfig(),
            navigation: {
                prev: this.previousInvoice.bind(this),
                next: this.nextInvoice.bind(this),
                add: this.addInvoice.bind(this)
            }
        };
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
            action: (done) => this.saveInvoiceTransition(done, 'invoice', this.getInvoiceDoneText()),
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
            return true; // TODO: fakturering av kreditnota er ikke implementert
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

    private getInvoiceDoneText() {
        if (this.invoice.InvoiceType === 1) {
            return 'Kreditnota kreditert';
        }
        return 'Faktura fakturert';
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
                        this.updateToolbar();
                    },
                    (err) => {
                        console.log('Error when recalculating items:', err);
                        this.log(err);
                    }
                );
        }, 2000);
    }

    private deleteItem(item: CustomerInvoiceItem) {
        this.deletedItems.push(item);
    }

    private saveInvoiceTransition(done: any, transition: string, doneText: string) {
        this.saveInvoice(done, (invoice) => {
            this.customerInvoiceService.Transition(this.invoice.ID, this.invoice, transition).subscribe(() => {
                console.log('== TRANSITION OK ' + transition + ' ==');
                this.router.navigateByUrl('/sales/invoices/' + this.invoice.ID);
                done(doneText);

                this.customerInvoiceService.Get(invoice.ID, this.expandOptions).subscribe((data) => {
                    this.invoice = data;
                    this.addressService.setAddresses(this.invoice);
                    this.updateSaveActions();
                    this.updateToolbar();
                    this.setTabTitle();
                    this.ready(null);
                });

            }, (err) => {
                console.log('Feil oppstod ved ' + transition + ' transition', err);
                done('Feilet');
                this.log(err);
            });
        }, transition);
    }

    private saveInvoiceManual(done) {
        this.saveInvoice(done);
    }

    private saveInvoice(done: any, next: any = null, transition = '') {
        // Transform addresses to flat
        this.addressService.addressToInvoice(this.invoice, this.invoice._InvoiceAddress);
        this.addressService.addressToShipping(this.invoice, this.invoice._ShippingAddress);

        this.invoice.TaxInclusiveAmount = -1; // TODO in AppFramework, does not save main entity if just items have changed

        // set deleted items as deleted on server as well, using soft delete / complex put
        this.deletedItems.forEach((item: CustomerInvoiceItem) => {
           // don't send deleted items that has not been saved previously,
           // because this can cause problems with validation
           if (item.ID > 0) {
               item.Deleted = true;
               this.invoice.Items.push(item);
           }
        });

        this.deletedItems = [];

        this.invoice.Items.forEach(item => {
            if (item.Dimensions && item.Dimensions.ID === 0) {
                item.Dimensions['_createguid'] = this.customerInvoiceItemService.getNewGuid();
            }
        });

        if (transition == 'invoice' && this.invoice.DeliveryDate == null) {
            this.invoice.DeliveryDate = moment();
        }

        // Save only lines with products from product list
        if (!TradeItemHelper.IsItemsValid(this.invoice.Items)) {
            console.log('Linjer uten produkt. Lagring avbrutt.');
            if (done) {
                done('Lagring feilet')
            }
            return;
        }

        this.customerInvoiceService.Put(this.invoice.ID, this.invoice)
            .subscribe(
                (invoiceSaved) => {
                    this.customerInvoiceService.Get(this.invoice.ID, this.expandOptions).subscribe(invoiceGet => {
                        this.invoice = invoiceGet;
                        this.addressService.setAddresses(this.invoice);
                        this.setTabTitle();
                        this.updateSaveActions();
                        this.updateToolbar();
                        this.ready(null);
                        this.setTabTitle();

                        if (next) {
                            next(this.invoice);
                        } else {
                            done('Faktura lagret');
                        }
                    });
                },
                (err) => {
                    console.log('Feil oppsto ved lagring', err);
                    done('Feil oppsto ved lagring');
                    this.log(err);
                }
            );
    }

    private saveAndPrint(done) {
        this.saveInvoice(done, (invoice) => {
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
                    this.router.navigateByUrl('/sales/invoices/' + data.ID);
                },
                (err) => {
                    console.log('Error creating credit note: ', err);
                    done('Feil ved kreditering');
                    this.log(err);
                });
    }

    private payInvoice(done) {
        const title = `Register betaling, Faktura ${this.invoice.InvoiceNumber || ''}, ${this.invoice.CustomerName || ''}`;

        // Set up subscription to listen canceled modal
        if (this.registerPaymentModal.canceled.observers.length === 0) {
            this.registerPaymentModal.canceled.subscribe(() => {
                done();
            });
        }

        // Set up subscription to listen to when data has been registrerred and button clicked in modal window.
        if (this.registerPaymentModal.changed.observers.length === 0) {
            this.registerPaymentModal.changed.subscribe((modalData: any) => {
                this.customerInvoiceService.ActionWithBody(modalData.id, modalData.invoice, 'payInvoice').subscribe((journalEntry) => {
                    this.toastService.addToast('Faktura er betalt. Bilagsnummer: ' + journalEntry.JournalEntryNumber, ToastType.good, 5);

                    this.customerInvoiceService.Get(this.invoice.ID, this.expandOptions).subscribe((data) => {
                            this.invoice = data;
                            this.addressService.setAddresses(this.invoice);
                            this.updateSaveActions();
                            this.updateToolbar();
                            this.ready(null);

                            done('Betaling registrert');
                        },
                        (err) => {
                            done('Feilet ved registrering av betaling');
                        });
                }, (err) => {
                    console.log('Error registering payment: ', err);
                    done('Feilet ved registrering av betaling');
                    this.log(err);
                });
            });
        }

        const invoiceData: InvoicePaymentData = {
            Amount: this.invoice.RestAmount,
            PaymentDate: new Date()
        };

        this.registerPaymentModal.openModal(this.invoice.ID, title, invoiceData);
    }

    // private saveInvoiceTransition(done: any, transition: string) {
    //    this.saveInvoice((invoice) => {
    //        this.customerInvoiceService.Transition(this.invoice.ID, this.invoice, transition).subscribe(() => {
    //            console.log('== TRANSITION OK ' + transition + ' ==');
    //            this.router.navigateByUrl('/sales/invoices/' + this.invoice.ID);

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

    private deleteInvoice(done) {
        this.toastService.addToast('Slett  - Under construction', ToastType.warn, 5);
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
                    EntityType: 'CustomerInvoice',
                    Property: 'FreeTxt',
                    Placement: 1,
                    Hidden: false,
                    FieldType: FieldType.TEXTAREA,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Fritekst',
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
                    Classes: 'max-width visuallyHideLabel'
                }
            ]
        };
    }
}
