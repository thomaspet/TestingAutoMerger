import {Component, Input, ViewChild} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {Observable} from 'rxjs/Rx';
import {CustomerQuoteService, CustomerQuoteItemService, CustomerService, BusinessRelationService} from '../../../../services/services';
import {ProjectService, DepartmentService, AddressService, ReportDefinitionService, UserService} from '../../../../services/services';
import {CompanySettingsService} from '../../../../services/common/CompanySettingsService';
import {IUniSaveAction} from '../../../../../framework/save/save';
import {UniForm, UniFieldLayout} from '../../../../../framework/uniform';
import {TradeItemHelper} from '../../salesHelper/tradeItemHelper';
import {FieldType, CustomerQuote, Customer, User} from '../../../../unientities';
import {Address, CustomerQuoteItem} from '../../../../unientities';
import {StatusCodeCustomerQuote, CompanySettings} from '../../../../unientities';
import {StatusCode} from '../../salesHelper/salesEnums';
import {AddressModal} from '../../../common/modals/modals';
import {TradeHeaderCalculationSummary} from '../../../../models/sales/TradeHeaderCalculationSummary';
import {PreviewModal} from '../../../reports/modals/preview/previewModal';
import {TabService, UniModules} from '../../../layout/navbar/tabstrip/tabService';
import {ToastService, ToastType} from '../../../../../framework/uniToast/toastService';
import {IToolbarConfig} from '../../../common/toolbar/toolbar';
import {UniStatusTrack} from '../../../common/toolbar/statustrack';
import {IContextMenuItem} from 'unitable-ng2/main';
import {SendEmailModal} from '../../../common/modals/sendEmailModal';
import {SendEmail} from '../../../../models/sendEmail';
import {AuthService} from '../../../../../framework/core/authService';
import {ISummaryConfig} from '../../../common/summary/summary';

declare const _;
declare const moment;

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
})
export class QuoteDetails {
    @Input() public quoteID: any;
    @ViewChild(UniForm) public form: UniForm;
    @ViewChild(AddressModal) public addressModal: AddressModal;
    @ViewChild(PreviewModal) private previewModal: PreviewModal;
    @ViewChild(SendEmailModal) private sendEmailModal: SendEmailModal;

    public config: any = {};
    public fields: any[] = [];

    private quote: CustomerQuoteExt;
    private deletedItems: Array<CustomerQuoteItem>;

    private itemsSummaryData: TradeHeaderCalculationSummary;

    private customers: Customer[];
    private dropdownData: any;

    private emptyAddress: Address;
    private recalcTimeout: any;
    private addressChanged: any;

    private companySettings: CompanySettings;

    private actions: IUniSaveAction[];

    private formIsInitialized: boolean = false;
    private toolbarconfig: IToolbarConfig;
    private contextMenuItems: IContextMenuItem[] = [];
    private user: User;
    public summary: ISummaryConfig[] = [];

    private expandOptions: Array<string> = ['Items', 'Items.Product', 'Items.VatType',
        'Items.Dimensions', 'Items.Dimensions.Project', 'Items.Dimensions.Department',
        'Customer', 'Customer.Info', 'Customer.Info.DefaultEmail', 'Customer.Info.Addresses', 'Customer.Dimensions', 'Customer.Dimensions.Project', 'Customer.Dimensions.Department'];

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
                private authService: AuthService,
                private userService: UserService,

                private router: Router,
                private route: ActivatedRoute,
                private tabService: TabService) {

        this.route.params.subscribe(params => {
            this.quoteID = +params['id'];
            this.setSums();
            this.setup();
        });

        this.contextMenuItems = [
            {
                label: 'Send på epost',
                action: () => {
                    let sendemail = new SendEmail();
                    sendemail.EntityType = 'CustomerQuote';
                    sendemail.EntityID = this.quote.ID;
                    sendemail.Subject = 'Tilbud ' + (this.quote.QuoteNumber ? 'nr. ' + this.quote.QuoteNumber : 'kladd');
                    sendemail.EmailAddress = this.quote.Customer.Info.DefaultEmail ? this.quote.Customer.Info.DefaultEmail.EmailAddress : '';
                    sendemail.CopyAddress = this.user.Email;
                    sendemail.Message = 'Vedlagt finner du Tilbud ' + (this.quote.QuoteNumber ? 'nr. ' + this.quote.QuoteNumber : 'kladd') +
                                        '\n\nMed vennlig hilsen\n' +
                                        this.companySettings.CompanyName + '\n' +
                                        this.user.DisplayName + '\n' +
                                        (this.companySettings.DefaultEmail ? this.companySettings.DefaultEmail.EmailAddress : '');

                    this.sendEmailModal.openModal(sendemail);

                    if (this.sendEmailModal.Changed.observers.length === 0) {
                        this.sendEmailModal.Changed.subscribe((email) => {
                            this.reportDefinitionService.generateReportSendEmail('Tilbud id', email);
                        });
                    }
                },
                disabled: () => !this.quote.ID
            }
        ];
    }
    private log(err) {
        this.toastService.addToast(err._body, ToastType.bad);
    }

    private getStatustrackConfig() {
        let statustrack: UniStatusTrack.IStatus[] = [];
        let activeStatus = this.quote ? (this.quote.StatusCode ? this.quote.StatusCode : 1) : 0;

        this.customerQuoteService.getFilteredStatusTypes(this.quote.StatusCode).forEach((s, i) => {
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
        this.router.navigateByUrl('/sales/quotes/0');
    }

    public ready(event) {
        this.setupSubscriptions(null);
    }

    private setupSubscriptions(event) {
        this.form.field('CustomerID')
            .changeEvent
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
                        } else {
                            this.quote.CreditDays = this.companySettings.CustomerCreditDays;
                        }

                        this.quote = _.cloneDeep(this.quote);
                        this.updateToolbar();
                    });
                }
            });
        this.form.field('QuoteDate')
            .changeEvent
            .subscribe((data) => {
                if (data) {
                    this.quote.ValidUntilDate = moment(this.quote.QuoteDate).add(1, 'month').toDate();

                    this.quote = _.cloneDeep(this.quote);
                    this.updateToolbar();
                }
            });
    }

    private setup() {
        this.deletedItems = [];

        this.companySettingsService.Get(1, ['DefaultEmail'])
            .subscribe(settings => this.companySettings = settings,
            err => {
                console.log('Error retrieving company settings data: ', err);
                this.toastService.addToast('En feil oppsto ved henting av firmainnstillinger: ' + JSON.stringify(err), ToastType.bad);
            });

        let jwt = this.authService.jwtDecoded;
        this.userService.Get(`?filter=GlobalIdentity eq '${jwt.nameid}'`).subscribe((users) => {
            this.user = users[0];
        });

        if (!this.formIsInitialized) {
            this.fields = this.getComponentLayout().Fields;

            Observable.forkJoin(
                this.departmentService.GetAll(null),
                this.projectService.GetAll(null),
                (
                    this.quoteID > 0 ?
                        this.customerQuoteService.Get(this.quoteID, this.expandOptions)
                        : this.customerQuoteService.newCustomerQuote()
                ),
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

                this.addressService.setAddresses(this.quote);
                this.setTabTitle();

                this.updateSaveActions();
                this.updateToolbar();
                this.extendFormConfig();

                this.formIsInitialized = true;
            }, (err) => {
                console.log('Error retrieving data: ', err);
                this.toastService.addToast('En feil oppsto ved henting av data: ' + JSON.stringify(err), ToastType.bad);
            });
        } else {
            const source = this.quoteID > 0 ?
                this.customerQuoteService.Get(this.quoteID, this.expandOptions)
                : Observable.fromPromise(this.customerQuoteService.newCustomerQuote());

            source.subscribe(response => {
                this.quote = response;
                this.addressService.setAddresses(this.quote);
                this.setTabTitle();
                this.updateToolbar();
            }, (err) => {
                console.log('Error retrieving data: ', err);
                this.toastService.addToast('En feil oppsto ved henting av data: ' + JSON.stringify(err), ToastType.bad);
            });
        }
    }

    private setTabTitle() {
        let tabTitle = this.quote.QuoteNumber ? 'Tilbudsnr. ' + this.quote.QuoteNumber : 'Tilbud';
        this.tabService.addTab({ url: '/sales/quotes/' + this.quote.ID, name: tabTitle, active: true, moduleID: UniModules.Quotes });
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
            resolve(info.Addresses[idx]);
        });
    }

    private updateToolbar() {
        this.toolbarconfig = {
            title: this.quote.Customer ? (this.quote.Customer.CustomerNumber + ' - ' + this.quote.Customer.Info.Name) : this.quote.CustomerName,
            subheads: [
                { title: this.quote.QuoteNumber ? 'Tilbudsnr. ' + this.quote.QuoteNumber + '.' : '' },
                { title: !this.itemsSummaryData ? 'Netto kr ' + this.quote.TaxExclusiveAmount + '.' : 'Netto kr ' + this.itemsSummaryData.SumTotalExVat + '.' }
            ],
            statustrack: this.getStatustrackConfig(),
            navigation: {
                prev: this.previousQuote.bind(this),
                next: this.nextQuote.bind(this),
                add: this.addQuote.bind(this)
            },
            contextmenu: this.contextMenuItems
        };
    }

    private updateSaveActions() {
        this.actions = [];

        this.actions.push({
            label: 'Lagre',
            action: (done) => this.saveQuoteManual(done),
            disabled: this.quote.ID === 0,
            main: this.quote.ID > 0 && this.quote.StatusCode !== StatusCodeCustomerQuote.Draft
        });

        this.actions.push({
            label: 'Lagre og skriv ut',
            action: (done) => this.saveAndPrint(done),
            disabled: this.quote.ID === 0
        });

        this.actions.push({
            label: 'Registrer',
            action: (done) => this.saveQuoteAsRegistered(done),
            disabled: this.IsTransferToRegisterDisabled(),
            main: this.quote.ID === 0 || this.quote.StatusCode === StatusCodeCustomerQuote.Draft
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
            label: 'Lagre som kladd',
            action: (done) => this.saveQuoteAsDraft(done),
            disabled: (this.quote.ID > 0)
        });

        this.actions.push({
            label: 'Slett',
            action: (done) => this.deleteQuote(done),
            disabled: true
        });
    }

    private IsTransferToRegisterDisabled() {
        if (this.quote.ID > 0 &&
            this.quote.StatusCode !== StatusCodeCustomerQuote.Draft) {
            return true;
        }
        return false;
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
        if (quoteItems === null || quoteItems === undefined) {
            return;
        }
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
                    this.updateToolbar();
                    this.setSums();
                },
                (err) => {
                    console.log('Error when recalculating items:', err);
                    this.log(err);
                });
        }, 2000);
    }

    private deleteItem(item: CustomerQuoteItem) {
        this.deletedItems.push(item);
    }

    private saveQuoteManual(done: any) {
        this.saveQuote(done);
    }

    private saveQuoteAsRegistered(done: any) {
        if (this.quote.ID > 0) {
            this.saveQuoteTransition(done, 'register', 'Registrert');
        } else {
            this.saveQuote(done);
        }
    }

    private saveQuoteAsDraft(done: any) {
        this.quote.StatusCode = StatusCode.Draft;
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
        if (!TradeItemHelper.IsItemsValid(this.quote.Items)) {
            console.log('Linjer uten produkt. Lagring avbrutt.');
            if (done) {
                done('Lagring feilet');
            }
            return;
        }

        // set deleted items as deleted on server as well, using soft delete / complex put
        this.deletedItems.forEach((item: CustomerQuoteItem) => {
            // don't send deleted items that has not been saved previously,
            // because this can cause problems with validation
            if (item.ID > 0) {
                item.Deleted = true;
                this.quote.Items.push(item);
            }
        });

        this.deletedItems = [];

        if (this.quote.ID > 0) {
            this.customerQuoteService.Put(this.quote.ID, this.quote)
                .subscribe(
                (quoteSaved) => {
                    this.customerQuoteService.Get(this.quote.ID, this.expandOptions).subscribe(newQuoate => {
                        this.quote = newQuoate;
                        this.addressService.setAddresses(this.quote);
                        this.updateSaveActions();
                        this.updateToolbar();
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
        } else {
            this.customerQuoteService.Post(this.quote)
                .subscribe(
                (quoteSaved) => {
                    if (next) {
                        next(quoteSaved);
                    } else {
                        done('Tilbud lagret');
                    }

                    this.router.navigateByUrl('/sales/quotes/' + quoteSaved.ID);
                },
                (err) => {
                    console.log('Feil oppsto ved lagring', err);
                    this.log(err);
                    done('Lagring feilet');
                }
            );
        }
    }

    private setSums() {
        this.summary = [{
                value: this.itemsSummaryData ? this.itemsSummaryData.SumNoVatBasis.toString() : null,
                title: 'Avgiftsfritt',
            }, {
                value: this.itemsSummaryData ? this.itemsSummaryData.SumVatBasis.toString() : null,
                title: 'Avgiftsgrunnlag',
            }, {
                value: this.itemsSummaryData ? this.itemsSummaryData.SumDiscount.toString() : null,
                title: 'Sum rabatt',
            }, {
                value: this.itemsSummaryData ? this.itemsSummaryData.SumTotalExVat.toString() : null,
                title: 'Nettosum',
            }, {
                value: this.itemsSummaryData ? this.itemsSummaryData.SumVat.toString() : null,
                title: 'Mva',
            }, {
                value: this.itemsSummaryData ? this.itemsSummaryData.DecimalRounding.toString() : null,
                title: 'Øreavrunding',
            }, {
                value: this.itemsSummaryData ? this.itemsSummaryData.SumTotalIncVat.toString() : null,
                title: 'Totalsum',
            }];
    }

    private saveAndPrint(done) {
        this.saveQuote(done, (quote) => {
            this.reportDefinitionService.getReportByName('Tilbud id').subscribe((report) => {
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
