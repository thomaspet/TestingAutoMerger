import {Component, EventEmitter, HostListener, Input, ViewChild, OnInit, AfterViewInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Observable} from 'rxjs/Observable';
import * as moment from 'moment';

import {
    CompanySettings,
    CurrencyCode,
    Customer,
    CustomerQuote,
    CustomerQuoteItem,
    Dimensions,
    LocalDate,
    Project,
    Seller,
    SellerLink,
    StatusCodeCustomerQuote,
    Terms,
    NumberSeries,
    VatType
} from '../../../../unientities';

import {
    CompanySettingsService,
    CurrencyCodeService,
    CurrencyService,
    CustomerQuoteService,
    CustomerQuoteItemService,
    CustomerService,
    ErrorService,
    NumberFormat,
    ProjectService,
    ReportDefinitionService,
    ReportService,
    TermsService,
    UserService,
    NumberSeriesTypeService,
    NumberSeriesService,
    EmailService,
    SellerService,
    SellerLinkService,
    VatTypeService
} from '../../../../services/services';

import {
    UniModalService,
    UniSendEmailModal,
    ConfirmActions
} from '../../../../../framework/uniModal/barrel';
import {IContextMenuItem} from '../../../../../framework/ui/unitable/index';
import {IUniSaveAction} from '../../../../../framework/save/save';
import {ToastService, ToastType} from '../../../../../framework/uniToast/toastService';

import {GetPrintStatusText} from '../../../../models/printStatus';
import {SendEmail} from '../../../../models/sendEmail';
import {TradeHeaderCalculationSummary} from '../../../../models/sales/TradeHeaderCalculationSummary';

import {ISummaryConfig} from '../../../common/summary/summary';
import {IToolbarConfig, ICommentsConfig, IShareAction} from '../../../common/toolbar/toolbar';
import {IStatus, STATUSTRACK_STATES} from '../../../common/toolbar/statustrack';

import {UniPreviewModal} from '../../../reports/modals/preview/previewModal';
import {TabService, UniModules} from '../../../layout/navbar/tabstrip/tabService';

import {TofHead} from '../../common/tofHead';
import {TradeItemTable} from '../../common/tradeItemTable';
import {UniTofSelectModal} from '../../common/tofSelectModal';

import {StatusCode} from '../../salesHelper/salesEnums';
import {TofHelper} from '../../salesHelper/tofHelper';
import {TradeItemHelper} from '../../salesHelper/tradeItemHelper';

declare var _;

@Component({
    selector: 'quote-details',
    templateUrl: './quoteDetails.html',
})
export class QuoteDetails implements OnInit, AfterViewInit {
    @ViewChild(TofHead) private tofHead: TofHead;
    @ViewChild(TradeItemTable) private tradeItemTable: TradeItemTable;

    @Input() public quoteID: number;

    private companySettings: CompanySettings;
    private isDirty: boolean;
    private itemsSummaryData: TradeHeaderCalculationSummary;
    private newQuoteItem: CustomerQuoteItem;
    private printStatusPrinted: string = '200';
    private quote: CustomerQuote;
    private quoteItems: CustomerQuoteItem[];
    private readonly: boolean;
    private recalcDebouncer: EventEmitter<CustomerQuoteItem[]> = new EventEmitter<CustomerQuoteItem[]>();
    private shareActions: IShareAction[];
    private saveActions: IUniSaveAction[] = [];

    private currencyCodeID: number;
    private currencyCodes: Array<CurrencyCode>;
    private currencyExchangeRate: number;
    private currentCustomer: Customer;
    private currentDeliveryTerm: Terms;
    private deliveryTerms: Terms[];
    private paymentTerms: Terms[];
    private projects: Project[];
    private currentDefaultProjectID: number;
    private sellers: Seller[];
    private deletables: SellerLink[] = [];
    private currentQuoteDate: LocalDate;
    private vatTypes: VatType[];
    private toolbarconfig: IToolbarConfig;
    private contextMenuItems: IContextMenuItem[] = [];
    public summary: ISummaryConfig[] = [];

    public selectedNumberSeries: NumberSeries;
    public selectedNumberSeriesTaskID: number;
    private selectConfig: any;
    private numberSeries: NumberSeries[];
    private projectID: number;

    private customerExpandOptions: string[] = [
        'Info',
        'Info.Addresses',
        'Info.DefaultContact.Info',
        'Info.Emails',
        'Info.InvoiceAddress',
        'Info.ShippingAddress',
        'Dimensions',
        'Dimensions.Project',
        'Dimensions.Department',
        'PaymentTerms',
        'DeliveryTerms',
        'Sellers',
        'Sellers.Seller',
        'DefaultSeller',
        'DefaultSeller.Seller'
    ];
    private expandOptions: Array<string> = [
        'Items',
        'Items.Product.VatType',
        'Items.VatType',
        'Items.Account',
        'Items.Dimensions',
        'Items.Dimensions.Project',
        'Items.Dimensions.Department',
        'Customer',
        'DefaultDimensions',
        'Sellers',
        'Sellers.Seller',
        'DefaultSeller',
        'DefaultSeller.Seller',
        'PaymentTerms',
        'DeliveryTerms'
    ].concat(this.customerExpandOptions.map(option => 'Customer.' + option));

    private commentsConfig: ICommentsConfig;

    constructor(
        private customerService: CustomerService,
        private customerQuoteService: CustomerQuoteService,
        private customerQuoteItemService: CustomerQuoteItemService,
        private reportDefinitionService: ReportDefinitionService,
        private companySettingsService: CompanySettingsService,
        private toastService: ToastService,
        private userService: UserService,
        private numberFormat: NumberFormat,
        private router: Router,
        private route: ActivatedRoute,
        private tabService: TabService,
        private tradeItemHelper: TradeItemHelper,
        private errorService: ErrorService,
        private currencyCodeService: CurrencyCodeService,
        private currencyService: CurrencyService,
        private reportService: ReportService,
        private tofHelper: TofHelper,
        private projectService: ProjectService,
        private modalService: UniModalService,
        private termsService: TermsService,
        private numberSeriesTypeService: NumberSeriesTypeService,
        private numberSeriesService: NumberSeriesService,
        private emailService: EmailService,
        private sellerService: SellerService,
        private sellerLinkService: SellerLinkService,
        private vatTypeService: VatTypeService
    ) { }

    public ngOnInit() {
        this.setSums();
        // Subscribe and debounce recalc on table changes
        this.recalcDebouncer.debounceTime(500).subscribe((quoteitems) => {
            if (quoteitems.length) {
                this.recalcItemSums(quoteitems);

                const dirtyItems = quoteitems.filter(x => x['_isDirty']);

                if (dirtyItems.length > 0) {
                    if (!this.isDirty) {
                        this.isDirty = true;
                        this.updateSaveActions();
                    }
                }
            }
        });

        this.companySettingsService.Get(1).subscribe(
            settings => this.companySettings = settings,
            err => this.errorService.handle(err)
        );

        // Subscribe to route param changes and update invoice data
        this.route.params.subscribe(params => {
            this.quoteID = +params['id'];
            const customerID = +params['customerID'];
            const projectID = +params['projectID'];
            const hasCopyParam = params['copy'];

            this.commentsConfig = {
                entityType: 'CustomerQuote',
                entityID: this.quoteID
            };

            if (this.quoteID) {
                Observable.forkJoin(
                    this.customerQuoteService.Get(this.quoteID, this.expandOptions),
                    this.companySettingsService.Get(1),
                    this.currencyCodeService.GetAll(null),
                    this.termsService.GetAction(null, 'get-payment-terms'),
                    this.termsService.GetAction(null, 'get-delivery-terms'),
                    this.projectService.GetAll(null),
                    this.sellerService.GetAll(null),
                    this.vatTypeService.GetVatTypesWithDefaultVatPercent('filter=OutputVat eq true')
                ).subscribe((res) => {
                    const quote = res[0];
                    this.companySettings = res[1];
                    this.currencyCodes = res[2];
                    this.paymentTerms = res[3];
                    this.deliveryTerms = res[4];
                    this.projects = res[5];
                    this.sellers = res[6];
                    this.vatTypes = res[7];

                    if (!quote.CurrencyCodeID) {
                        quote.CurrencyCodeID = this.companySettings.BaseCurrencyCodeID;
                        quote.CurrencyExchangeRate = 1;
                    }
                    this.currencyCodeID = quote.CurrencyCodeID;
                    this.currencyExchangeRate = quote.CurrencyExchangeRate;

                    quote.DefaultDimensions = quote.DefaultDimensions || new Dimensions();
                    if (quote.DefaultDimensions) {
                        this.projectID = quote.DefaultDimensions.ProjectID;
                    }
                    quote.DefaultDimensions.Project = this.projects.find(project => project.ID === this.projectID);

                    if (hasCopyParam) {
                        this.refreshQuote(this.copyQuote(quote));
                    } else {
                        this.refreshQuote(quote);
                    }
                });
            } else {
                Observable.forkJoin(
                    this.customerQuoteService.GetNewEntity(['DefaultDimensions'], CustomerQuote.EntityType),
                    this.userService.getCurrentUser(),
                    this.companySettingsService.Get(1),
                    this.currencyCodeService.GetAll(null),
                    this.termsService.GetAction(null, 'get-payment-terms'),
                    this.termsService.GetAction(null, 'get-delivery-terms'),
                    customerID ? this.customerService.Get(
                        customerID, this.customerExpandOptions
                    ) : Observable.of(null),
                    projectID ? this.projectService.Get(projectID, null) : Observable.of(null),
                    this.numberSeriesService.GetAll(`filter=NumberSeriesType.Name eq 'Customer Quote number `
                    + `series' and Empty eq false and Disabled eq false`,
                    ['NumberSeriesType']),
                    this.projectService.GetAll(null),
                    this.sellerService.GetAll(null),
                    this.vatTypeService.GetVatTypesWithDefaultVatPercent('filter=OutputVat eq true')
                ).subscribe(
                    (res) => {
                        let quote = <CustomerQuote>res[0];
                        quote.OurReference = res[1].DisplayName;
                        this.companySettings = res[2];
                        this.currencyCodes = res[3];
                        this.paymentTerms = res[4];
                        this.deliveryTerms = res[5];
                        if (res[6]) {
                            quote = this.tofHelper.mapCustomerToEntity(res[6], quote);

                            if (quote.DeliveryTerms && quote.DeliveryTerms.CreditDays) {
                                this.setDeliveryDate(quote);
                            }
                        } else {
                            quote.DeliveryDate =  null;
                        }
                        if (res[7]) {
                            quote.DefaultDimensions = quote.DefaultDimensions || new Dimensions();
                            quote.DefaultDimensions.ProjectID = res[7].ID;
                            quote.DefaultDimensions.Project = res[7];
                        }
                        this.numberSeries = this.numberSeriesService.CreateAndSet_DisplayNameAttributeOnSeries(res[8]);
                        this.selectConfig = this.numberSeriesService.getSelectConfig(
                            this.quoteID, this.numberSeries, 'Customer Quote number series'
                        );
                        this.projects = res[9];
                        this.sellers = res[10];
                        this.vatTypes = res[11];

                        quote.QuoteDate = new LocalDate(Date());
                        quote.ValidUntilDate = new LocalDate(moment(quote.QuoteDate).add(1, 'month').toDate());

                        if (!quote.CurrencyCodeID) {
                            quote.CurrencyCodeID = this.companySettings.BaseCurrencyCodeID;
                            quote.CurrencyExchangeRate = 1;
                        }
                        this.currencyCodeID = quote.CurrencyCodeID;
                        this.currencyExchangeRate = quote.CurrencyExchangeRate;

                        this.refreshQuote(quote);
                    },
                    err => this.errorService.handle(err)
                    );
            }
        });
    }

    public ngAfterViewInit() {
        this.tofHead.detailsForm.tabbedPastLastField.subscribe((event) => this.tradeItemTable.focusFirstRow());
    }

    @HostListener('keydown', ['$event'])
    public onKeyDown(event: KeyboardEvent) {
        const key = event.which || event.keyCode;
        if (key === 34) {
            event.preventDefault();
            this.tradeItemTable.focusFirstRow();
        } else if (key === 33) {
            event.preventDefault();
            this.tradeItemTable.blurTable();
            this.tofHead.focus();
        }
    }

    public canDeactivate(): Observable<boolean> {
        return !this.isDirty
            ? Observable.of(true)
            : this.modalService
                .openUnsavedChangesModal()
                .onClose
                .map(result => {
                    if (result === ConfirmActions.ACCEPT) {
                        this.saveQuote();
                    }

                    return result !== ConfirmActions.CANCEL;
                });
    }

    public numberSeriesChange(selectedSerie) {
        this.quote.QuoteNumberSeriesID = selectedSerie.ID;
    }

    private refreshQuote(quote?: CustomerQuote): Promise<boolean> {
        return new Promise((resolve) => {
            const orderObservable = !!quote
                ? Observable.of(quote)
                : this.customerQuoteService.Get(this.quoteID, this.expandOptions);

            orderObservable.subscribe(res => {
                if (!quote) { quote = res; }

                this.readonly = quote.StatusCode && (
                    quote.StatusCode === StatusCodeCustomerQuote.CustomerAccepted
                    || quote.StatusCode === StatusCodeCustomerQuote.TransferredToOrder
                    || quote.StatusCode === StatusCodeCustomerQuote.TransferredToInvoice
                  );

                this.newQuoteItem = <any>this.tradeItemHelper.getDefaultTradeItemData(quote);
                this.isDirty = false;
                this.quoteItems = quote.Items.sort(
                    function(itemA, itemB) { return itemA.SortIndex - itemB.SortIndex; }
                );

                this.currentCustomer = quote.Customer;
                this.currentDeliveryTerm = quote.DeliveryTerms;

                quote.DefaultSeller = quote.DefaultSeller;
                this.currentDefaultProjectID = quote.DefaultDimensions.ProjectID;

                this.currentQuoteDate = quote.QuoteDate;

                this.quote = _.cloneDeep(quote);
                this.updateCurrency(quote, true);
                this.recalcItemSums(quote.Items);
                this.setTabTitle();
                this.updateToolbar();
                this.updateSaveActions();

                resolve(true);
            });
        });
    }

    public onQuoteChange(quote: CustomerQuote) {
        this.isDirty = true;
        this.updateSaveActions();
        let shouldGetCurrencyRate: boolean = false;

        if (this.didCustomerChange(quote)) {
            if (quote.DeliveryTerms && quote.DeliveryTerms.CreditDays) {
                this.setDeliveryDate(quote);
            }

            // update currency code in detailsForm to customer's currency code
            if (quote.Customer.CurrencyCodeID) {
                quote.CurrencyCodeID = quote.Customer.CurrencyCodeID;
            } else {
                quote.CurrencyCodeID = this.companySettings.BaseCurrencyCodeID;
            }
            shouldGetCurrencyRate = true;
        }

        // refresh items if project changed
        if (quote.DefaultDimensions && quote.DefaultDimensions.ProjectID !== this.projectID) {
            this.projectID = quote.DefaultDimensions.ProjectID;

            if (this.quoteItems.length) {
                this.modalService.confirm({
                    header: `Endre prosjekt på alle varelinjer?`,
                    message: `Vil du endre til dette prosjektet på alle eksisterende varelinjer?`,
                    buttonLabels: {
                        accept: 'Ja',
                        reject: 'Nei'
                    }
                }).onClose.subscribe(response => {
                    const replaceItemsProject: boolean = (response === ConfirmActions.ACCEPT);
                    this.tradeItemTable
                        .setDefaultProjectAndRefreshItems(quote.DefaultDimensions.ProjectID, replaceItemsProject);
                });
            } else {
                this.tradeItemTable.setDefaultProjectAndRefreshItems(quote.DefaultDimensions.ProjectID, true);
            }
        }

        if (quote.QuoteDate && !quote.ValidUntilDate) {
            quote.ValidUntilDate = new LocalDate(moment(quote.QuoteDate).add(1, 'month').toDate());
        }

        this.updateCurrency(quote, shouldGetCurrencyRate);

        this.currentQuoteDate = quote.QuoteDate;

        this.quote = _.cloneDeep(quote);
    }

    private updateCurrency(quote: CustomerQuote, getCurrencyRate: boolean) {
        let shouldGetCurrencyRate = getCurrencyRate;

        // update currency code in detailsForm and tradeItemTable to selected currency code if selected
        // or from customer
        if ((!this.currencyCodeID && quote.CurrencyCodeID) || this.currencyCodeID !== quote.CurrencyCodeID) {
        this.currencyCodeID = quote.CurrencyCodeID;
        this.tradeItemTable.updateAllItemVatCodes(this.currencyCodeID);
        shouldGetCurrencyRate = true;
        }

        if (this.currentQuoteDate.toString() !== quote.QuoteDate.toString()) {
            shouldGetCurrencyRate = true;
        }

        if (this.quote && quote.CurrencyCodeID !== this.quote.CurrencyCodeID) {
            shouldGetCurrencyRate = true;
        }

        if (shouldGetCurrencyRate) {
            this.getUpdatedCurrencyExchangeRate(quote)
                .subscribe(res => {
                    const newCurrencyRate = res;

                    if (!this.currencyExchangeRate) {
                        this.currencyExchangeRate = 1;
                    }

                    if (newCurrencyRate !== this.currencyExchangeRate) {
                        this.currencyExchangeRate = newCurrencyRate;

                        quote.CurrencyExchangeRate = res;

                        let askUserWhatToDo: boolean = false;

                        let newTotalExVatBaseCurrency: number;
                        let diffBaseCurrency: number;
                        let diffBaseCurrencyPercent: number;

                        const haveUserDefinedPrices = this.quoteItems && this.quoteItems.filter(
                            x => x.PriceSetByUser
                        ).length > 0;

                        if (haveUserDefinedPrices) {
                            // calculate how much the new currency will affect the amount for the base currency,
                            // if it doesnt cause a change larger than 5%, don't bother asking the user what
                            // to do, just use the set prices
                            newTotalExVatBaseCurrency = this.itemsSummaryData.SumTotalExVatCurrency * newCurrencyRate;
                            diffBaseCurrency = Math.abs(
                                newTotalExVatBaseCurrency - this.itemsSummaryData.SumTotalExVat
                            );

                            diffBaseCurrencyPercent = this.tradeItemHelper.round(
                                (diffBaseCurrency * 100) / Math.abs(this.itemsSummaryData.SumTotalExVat), 1
                            );

                            // 5% is set as a limit for asking the user now, but this might
                            // need to be reconsidered, or make it possible to override it
                            // either on companysettings, customer, or the TOF header
                            if (diffBaseCurrencyPercent > 5) {
                                askUserWhatToDo = true;
                            }
                        }

                        if (askUserWhatToDo) {
                            const baseCurrencyCode = this.getCurrencyCode(this.companySettings.BaseCurrencyCodeID);

                            const modalMessage = 'Endringen førte til at en ny valutakurs ble hentet. '
                                + 'Du har overstyrt en eller flere priser, '
                                + 'og dette fører derfor til at totalsum eks. mva '
                                + `for ${baseCurrencyCode} endres med ${diffBaseCurrencyPercent}% `
                                + `til ${baseCurrencyCode} ${this.numberFormat.asMoney(newTotalExVatBaseCurrency)}`
                                + `.\n\nVil du heller rekalkulere valutaprisene basert på ny kurs `
                                + `og standardprisen på varene?`;

                            this.modalService.confirm({
                                header: 'Rekalkulere valutapriser for varer?',
                                message: modalMessage,
                                buttonLabels: {
                                    accept: 'Ikke rekalkuler valutapriser',
                                    reject: 'Rekalkuler valutapriser'
                                }
                            }).onClose.subscribe(response => {
                                if (response === ConfirmActions.ACCEPT) {
                                    // we need to calculate the base currency amount numbers if we are going
                                    // to keep the currency amounts - if not the data will be out of sync
                                    this.quoteItems.forEach(item => {
                                        if (item.PriceSetByUser) {
                                            this.recalcPriceAndSumsBasedOnSetPrices(item, this.currencyExchangeRate);
                                        } else {
                                            this.recalcPriceAndSumsBasedOnBaseCurrencyPrices(
                                                item, this.currencyExchangeRate
                                            );
                                        }
                                    });
                                } else if (response === ConfirmActions.REJECT) {
                                    // we need to calculate the currency amounts based on the original prices
                                    // defined in the base currency
                                    this.quoteItems.forEach(item => {
                                        this.recalcPriceAndSumsBasedOnBaseCurrencyPrices(
                                            item, this.currencyExchangeRate
                                        );
                                    });
                                }

                                // make unitable update the data after calculations
                                this.quoteItems = this.quoteItems.concat();
                                this.recalcItemSums(this.quoteItems);

                                // update the model
                                this.quote = _.cloneDeep(quote);
                            });

                        } else if (this.quoteItems && this.quoteItems.length > 0) {
                            // the currencyrate has changed, but not so much that we had to ask the user what to do,
                            // so just make an assumption what to do; recalculated based on set price if user
                            // has defined a price, and by the base currency price if the user has not set a
                            // specific price
                            this.quoteItems.forEach(item => {
                                if (item.PriceSetByUser) {
                                    this.recalcPriceAndSumsBasedOnSetPrices(item, this.currencyExchangeRate);
                                } else {
                                    this.recalcPriceAndSumsBasedOnBaseCurrencyPrices(item, this.currencyExchangeRate);
                                }
                            });

                            // make unitable update the data after calculations
                            this.quoteItems = this.quoteItems.concat();
                            this.recalcItemSums(this.quoteItems);

                            // update the model
                            this.quote = _.cloneDeep(quote);
                        } else {
                            // update
                            this.recalcItemSums(this.quoteItems);

                            // update the model
                            this.quote = _.cloneDeep(quote);
                        }
                    } else {
                        this.recalcItemSums(this.quoteItems);
                    }
                }, err => this.errorService.handle(err)
                );
        }
    }

    public onSellerDelete(sellerLink: SellerLink) {
        this.deletables.push(sellerLink);
    }

    private didCustomerChange(quote: CustomerQuote): boolean {
        let change: boolean;

        if (!this.currentCustomer && !quote.Customer) {
            return false;
        }

        if (quote.Customer && this.currentCustomer) {
            change = quote.Customer.ID !== this.currentCustomer.ID;
        } else if (quote.Customer && quote.Customer.ID) {
            change = true;
        }

        this.currentCustomer = quote.Customer;
        return change;
    }

    private setDeliveryDate(quote: CustomerQuote) {
        if (quote.DeliveryTerms && quote.DeliveryTerms.CreditDays) {
            quote.DeliveryDate = quote.QuoteDate;

            if (quote.DeliveryTerms.CreditDays < 0) {
                quote.DeliveryDate = new LocalDate(moment(quote.QuoteDate).endOf('month').toDate());
            }

            quote.DeliveryDate = new LocalDate(
                moment(quote.DeliveryDate).add(Math.abs(quote.DeliveryTerms.CreditDays), 'days').toDate()
            );
        }
    }

    private getUpdatedCurrencyExchangeRate(quote): Observable<number> {
        // if base currency code is the same a the currency code for the quote, the
        // exchangerate will always be 1 - no point in asking the server about that..
        if (!quote.CurrencyCodeID || this.companySettings.BaseCurrencyCodeID === quote.CurrencyCodeID) {
            return Observable.from([1]);
        } else {
            const currencyDate: LocalDate = new LocalDate(quote.QuoteDate.toString());

            return this.currencyService.getCurrencyExchangeRate(
                quote.CurrencyCodeID,
                this.companySettings.BaseCurrencyCodeID,
                currencyDate
            ).map(x => x.ExchangeRate);
        }
    }

    private newBasedOn(): Promise<any> {
        return new Promise((resolve, reject) => {
            if (this.quote.ID) {
                resolve(true);
                this.router.navigateByUrl('sales/quotes/' + this.quote.ID + ';copy=true');
            } else {
                const config = {
                    service: this.customerQuoteService,
                    moduleName: 'Quote',
                    label: 'Tilbudsnr'
                };

                this.modalService.open(UniTofSelectModal, { data: config }).onClose.subscribe((id: number) => {
                    if (id) {
                        resolve(id);
                        this.router.navigateByUrl('sales/quotes/' + id + ';copy=true');
                    } else {
                        reject('Kopiering avbrutt');
                    }

                });
            }
        });
    }

    private copyQuote(quote: CustomerQuote): CustomerQuote {
        quote.ID = 0;
        quote.QuoteNumber = null;
        quote.QuoteNumberNumberSeries = null;
        quote.StatusCode = null;
        quote.PrintStatus = null;
        quote.Comment = null;
        delete quote['_links'];

        quote.Items = quote.Items.map((item: CustomerQuoteItem) => {
            item.CustomerQuoteID = 0;
            item.ID = 0;
            item.StatusCode = null;
            return item;
        });

        return quote;
    }

    private recalcPriceAndSumsBasedOnSetPrices(item, newCurrencyRate) {
        item.PriceExVat = this.tradeItemHelper.round(item.PriceExVatCurrency * newCurrencyRate, 4);

        this.tradeItemHelper.calculatePriceIncVat(item);
        this.tradeItemHelper.calculateBaseCurrencyAmounts(item, newCurrencyRate);
        this.tradeItemHelper.calculateDiscount(item, newCurrencyRate);
    }

    private recalcPriceAndSumsBasedOnBaseCurrencyPrices(item, newCurrencyRate) {
        if (!item.PriceSetByUser || !item.Product) {
            // if price has not been changed by the user, recalc based on the PriceExVat.
            // we do this before using the products price in case the product has been changed
            // after the item was created. This is also done if no Product is selected
            item.PriceExVatCurrency = this.tradeItemHelper.round(item.PriceExVat / newCurrencyRate, 4);
        } else {
            // if the user has changed the price for this item, we need to recalc based
            // on the product's PriceExVat, because using the items PriceExVat will not make
            // sense as that has also been changed when the user when the currency price
            // was changed
            item.PriceExVatCurrency = this.tradeItemHelper.round(item.Product.PriceExVat / newCurrencyRate, 4);

            // if price was set by user, it is not any longer
            item.PriceSetByUser = false;
        }

        this.tradeItemHelper.calculatePriceIncVat(item);
        this.tradeItemHelper.calculateBaseCurrencyAmounts(item, newCurrencyRate);
        this.tradeItemHelper.calculateDiscount(item, newCurrencyRate);
    }

    private getStatustrackConfig() {
        const statustrack: IStatus[] = [];
        const activeStatus = this.quote ? (this.quote.StatusCode ? this.quote.StatusCode : 1) : 0;

        this.customerQuoteService.getFilteredStatusTypes(this.quote.StatusCode).forEach((status) => {
            let _state: STATUSTRACK_STATES;

            if (status.Code > activeStatus) {
                _state = STATUSTRACK_STATES.Future;
            } else if (status.Code < activeStatus) {
                _state = STATUSTRACK_STATES.Completed;
            } else if (status.Code === activeStatus) {
                _state = STATUSTRACK_STATES.Active;
            }

            statustrack.push({
                title: status.Text,
                state: _state,
                code: status.Code
            });
        });
        return statustrack;
    }

    public nextQuote() {
        this.customerQuoteService.getNextID(this.quote.ID).subscribe(
            id => {
                if (id) {
                    this.router.navigateByUrl('/sales/quotes/' + id);
                } else {
                    this.toastService.addToast('Warning', ToastType.warn, 0, 'Ikke flere tilbud etter denne');
                }
            },
            err => this.errorService.handle(err)
        );
    }

    public previousQuote() {
        this.customerQuoteService.getPreviousID(this.quote.ID).subscribe(
            id => {
                if (id) {
                    this.router.navigateByUrl('/sales/quotes/' + id);
                } else {
                    this.toastService.addToast('Warning', ToastType.warn, 0, 'Ikke flere tilbud før denne');
                }
            },
            err => this.errorService.handle(err)
        );
    }

    private setTabTitle() {
        let tabTitle = '';
        if (this.quote.QuoteNumber) {
            tabTitle = 'Tilbudsnr. ' + this.quote.QuoteNumber;
        } else {
            tabTitle = (this.quote.ID) ? 'Tilbud (kladd)' : 'Nytt tilbud';
        }
        this.tabService.addTab({
            url: '/sales/quotes/' + this.quote.ID,
            name: tabTitle,
            active: true,
            moduleID: UniModules.Quotes
        });
    }

    private updateToolbar() {
        let quoteText = '';
        if (this.quote.QuoteNumber) {
            quoteText = 'Tilbudsnr. ' + this.quote.QuoteNumber;
        } else {
            quoteText = (this.quote.ID) ? 'Tilbud (kladd)' : 'Nytt tilbud';
        }

        const customerText = (this.quote.Customer)
            ? this.quote.Customer.CustomerNumber + ' - ' + this.quote.Customer.Info.Name
            : '';

        const baseCurrencyCode = this.getCurrencyCode(this.companySettings.BaseCurrencyCodeID);
        const selectedCurrencyCode = this.getCurrencyCode(this.currencyCodeID);

        let netSumText = '';

        if (this.itemsSummaryData) {
            netSumText = `Netto ${selectedCurrencyCode} `
                + `${this.numberFormat.asMoney(this.itemsSummaryData.SumTotalExVatCurrency)}`;
            if (baseCurrencyCode !== selectedCurrencyCode) {
                netSumText += ` / ${baseCurrencyCode} `
                    + `${this.numberFormat.asMoney(this.itemsSummaryData.SumTotalExVat)}`;
            }
        } else {
            netSumText = `Netto ${selectedCurrencyCode} `
                + `${this.numberFormat.asMoney(this.quote.TaxExclusiveAmountCurrency)}`;
            if (baseCurrencyCode !== selectedCurrencyCode) {
                netSumText += ` / ${baseCurrencyCode} ${this.numberFormat.asMoney(this.quote.TaxExclusiveAmount)}`;
            }
        }

        this.toolbarconfig = {
            title: quoteText,
            statustrack: this.getStatustrackConfig(),
            navigation: {
                prev: this.previousQuote.bind(this),
                next: this.nextQuote.bind(this),
                add: () => this.quote.ID ? this.router.navigateByUrl('sales/quotes/0') : this.ngOnInit()
            },
            contextmenu: this.contextMenuItems,
            entityID: this.quoteID,
            entityType: 'CustomerQuote'
        };

        this.updateShareActions();
    }

    public recalcItemSums(quoteItems: any) {
        if (!quoteItems) {
            return;
        }

        this.itemsSummaryData = this.tradeItemHelper.calculateTradeItemSummaryLocal(
            quoteItems,
            this.companySettings.RoundingNumberOfDecimals
        );
        this.updateToolbar();
        this.setSums();
    }

    private handleSaveError(error, donehandler) {
        if (typeof (error) === 'string') {
            if (donehandler) {
                donehandler('Lagring avbrutt. ' + error);
            }
        } else {
            if (donehandler) {
                donehandler('Lagring feilet');
            }
            this.errorService.handle(error);
        }
    }

    private printAction(id): Observable<any> {
        const savedQuote = this.isDirty
            ? Observable.fromPromise(this.saveQuote())
            : Observable.of(this.quote);

        return savedQuote.switchMap((order) => {
            return this.reportDefinitionService.getReportByName('Tilbud id').switchMap((report) => {
                report.parameters = [{ Name: 'Id', value: id }];

                return this.modalService.open(UniPreviewModal, {
                    data: report
                }).onClose.switchMap(() => {
                    return this.customerQuoteService.setPrintStatus(
                        id,
                        this.printStatusPrinted
                    ).finally(() => {
                        this.quote.PrintStatus = +this.printStatusPrinted;
                        this.updateToolbar();
                    });
                });
            });
        });
    }

    private sendEmailAction(): Observable<any> {
        const savedQuote = this.isDirty
            ? Observable.fromPromise(this.saveQuote())
            : Observable.of(this.quote);

        return savedQuote.switchMap(order => {
            const model = new SendEmail();
            model.EntityType = 'CustomerQuote';
            model.EntityID = this.quote.ID;
            model.CustomerID = this.quote.CustomerID;
            model.EmailAddress = this.quote.EmailAddress;

            const quoteNumber = this.quote.QuoteNumber
                ? ` nr. ${this.quote.QuoteNumber}`
                : 'kladd';

            model.Subject = 'Tilbud' + quoteNumber;
            model.Message = 'Vedlagt finner du tilbud' + quoteNumber;

            return this.modalService.open(UniSendEmailModal, {
                data: model
            }).onClose.map(email => {
                if (email) {
                    this.emailService.sendEmailWithReportAttachment('Tilbud id', email, null);
                }
            });
        });
    }

    private updateShareActions() {
        this.shareActions = [
            {
                label: 'Skriv ut',
                action: () => this.printAction(this.quoteID),
                disabled: () => false
            },
            {
                label: 'Send på epost',
                action: () => this.sendEmailAction(),
                disabled: () => false
            }
        ];
    }

    private updateSaveActions() {
        const transitions = (this.quote['_links'] || {}).transitions;
        const printStatus = this.quote.PrintStatus;

        this.saveActions = [];

        this.saveActions.push({
            label: 'Registrer',
            action: (done) => this.saveQuoteAsRegistered(done),
            disabled: transitions && !transitions['register'],
            main: !transitions || transitions['register']
        });

        this.saveActions.push({
            label: 'Lagre',
            action: (done) => {
                this.saveQuote().then(res => {
                    done('Lagring fullført');
                    this.quoteID = res.ID;
                    this.refreshQuote();
                }).catch(error => {
                    this.handleSaveError(error, done);
                });
            },
            disabled: !this.quote.ID,
            main: this.isDirty
                || (this.quote.ID > 0
                    && this.quote.StatusCode !== StatusCodeCustomerQuote.Draft
                    && printStatus === 100)
        });

        if (!this.quote.ID) {
            this.saveActions.push({
                label: 'Lagre som kladd',
                action: (done) => this.saveQuoteAsDraft(done),
                disabled: (this.quote.ID > 0)
            });
        }

        // TODO: Add a actions for shipToCustomer,customerAccept

        this.saveActions.push({
            label: 'Lagre og overfør til ordre',
            action: (done) => this.saveQuoteTransition(done, 'toOrder', 'Overført til ordre'),
            disabled: !transitions || !transitions['toOrder']
        });

        this.saveActions.push({
            label: 'Lagre og overfør til faktura',
            action: (done) => this.saveQuoteTransition(done, 'toInvoice', 'Overført til faktura'),
            disabled: !transitions || !transitions['toInvoice']

        });

        this.saveActions.push({
            label: 'Ny basert på',
            action: (done) => {
                this.newBasedOn().then(res => {
                    done('Tilbud kopiert');
                }).catch(error => {
                    done(error);
                });
            },
            disabled: false
        });

        this.saveActions.push({
            label: 'Avslutt tilbud',
            action: (done) => this.saveQuoteTransition(done, 'complete', 'Tilbud avsluttet'),
            disabled: !transitions || !transitions['complete'],
        });

        this.saveActions.push({
            label: 'Slett',
            action: (done) => this.deleteQuote(done),
            disabled: this.quote.StatusCode !== StatusCodeCustomerQuote.Draft
        });
    }

    private saveQuote(): Promise<CustomerQuote> {
        this.quote.Items = this.tradeItemHelper.prepareItemsForSave(this.quoteItems);

        // Doing this to prevent the 'foreignKey does not match parent ID' error where sellers is present
        if (this.quote.Sellers && this.quote.ID === 0) {
            this.quote.Sellers.forEach(seller => seller.CustomerQuoteID = null);
        }

        if (this.quote.DefaultDimensions && !this.quote.DefaultDimensions.ID) {
            this.quote.DefaultDimensions._createguid = this.customerQuoteService.getNewGuid();
        } else if (this.quote.DefaultDimensions
            && this.quote.DefaultDimensions.ProjectID === this.currentDefaultProjectID) {
                this.quote.DefaultDimensions = undefined;
        }


        if (this.quote.DefaultSeller && this.quote.DefaultSeller.ID > 0) {
            this.quote.DefaultSellerID = this.quote.DefaultSeller.ID;
        }

        if (this.quote.DefaultSeller && this.quote.DefaultSeller.ID === null) {
            this.quote.DefaultSeller = null;
            this.quote.DefaultSellerID = null;
        }

        // add deleted sellers back to 'Sellers' to delete with 'Deleted' property, was sliced locally/in view
        if (this.deletables) {
            this.deletables.forEach(sellerLink => this.quote.Sellers.push(sellerLink));
        }

        return new Promise((resolve, reject) => {
            // create observable but dont subscribe - resolve it in the promise
            const request = ((this.quote.ID > 0)
                ? this.customerQuoteService.Put(this.quote.ID, this.quote)
                : this.customerQuoteService.Post(this.quote));

            // If a currency other than basecurrency is used, and any lines contains VAT,
            // validate that this is correct before resolving the promise
            if (this.quote.CurrencyCodeID !== this.companySettings.BaseCurrencyCodeID) {
                const linesWithVat = this.quote.Items.filter(x => x.SumVatCurrency > 0);
                if (linesWithVat.length > 0) {
                    const modalMessage = 'Er du sikker på at du vil registrere linjer med MVA når det er brukt '
                        + `${this.getCurrencyCode(this.quote.CurrencyCodeID)} som valuta?`;

                    this.modalService.confirm({
                        header: 'Vennligst bekreft',
                        message: modalMessage,
                        buttonLabels: {
                            accept: 'Ja, lagre med MVA',
                            cancel: 'Avbryt'
                        }
                    }).onClose.subscribe(response => {
                        if (response === ConfirmActions.ACCEPT) {
                            request.subscribe(res => {
                                if (res.QuoteNumber) { this.selectConfig = undefined; }
                                resolve(res);
                            }, err => reject(err));
                        } else {
                            const message = 'Endre MVA kode og lagre på ny';
                            reject(message);
                        }
                    });
                } else {
                    request.subscribe(res => {
                        if (res.QuoteNumber) { this.selectConfig = undefined; }
                        resolve(res);
                    }, err => reject(err));
                }
            } else {
                request.subscribe(res => {
                    if (res.QuoteNumber) { this.selectConfig = undefined; }
                    resolve(res);
                }, err => reject(err));
            }
        });
    }

    private saveQuoteAsRegistered(done: any) {
        if (this.quote.ID > 0) {
            this.saveQuoteTransition(done, 'register', 'Registrert');
        } else {
            this.saveQuote().then(res => {
                done('Registrering fullført');
                this.quoteID = res.ID;
                this.selectConfig = undefined;

                this.isDirty = false;
                this.router.navigateByUrl('/sales/quotes/' + res.ID);
            }).catch(error => {
                this.handleSaveError(error, done);
            });
        }
    }

    private saveQuoteAsDraft(done: any) {
        this.quote.StatusCode = StatusCode.Draft;
        const navigateOnSuccess = !this.quote.ID;
        this.saveQuote().then(res => {
            this.isDirty = false;
            done('Lagring fullført');
            if (navigateOnSuccess) {
                this.router.navigateByUrl('/sales/quotes/' + res.ID);
            } else {
                this.quoteID = res.ID;
                this.refreshQuote();
            }
        }).catch(error => {
            this.handleSaveError(error, done);
        });
    }

    private saveQuoteTransition(done: any, transition: string, doneText: string) {
        this.saveQuote().then(quote => {
            this.isDirty = false;
            this.customerQuoteService.Transition(this.quote.ID, this.quote, transition).subscribe(
                (res) => {
                    this.selectConfig = undefined;
                    if (transition === 'toOrder') {
                        this.router.navigateByUrl('/sales/orders/' + res.CustomerOrderID)
                            .then(() => done(doneText));
                    } else if (transition === 'toInvoice') {
                        this.router.navigateByUrl('/sales/invoices/' + res.CustomerInvoiceID)
                            .then(() => done(doneText));
                    } else {
                        this.quoteID = quote.ID;
                        this.refreshQuote()
                            .then(() => done(doneText));
                    }
                }
            );
        }).catch(error => {
            this.handleSaveError(error, done);
        });
    }

    public saveAndPrint(doneHandler: (msg: string) => void = null) {
        if (this.isDirty) {
            this.saveQuote().then(quote => {
                this.isDirty = false;
                this.print(quote.ID, doneHandler);
            }).catch(error => {
                if (doneHandler) { doneHandler('En feil oppstod ved utskrift av tilbud!'); }
                this.errorService.handle(error);
            });
        } else {
            this.print(this.quote.ID, doneHandler);
        }
    }

    private print(id, doneHandler: (msg?: string) => void = () => { }) {
        this.reportDefinitionService.getReportByName('Tilbud id').subscribe((report) => {
            report.parameters = [{ Name: 'Id', value: id }];

            this.modalService.open(UniPreviewModal, {
                data: report
            }).onClose.subscribe(() => {
                doneHandler();

                this.customerQuoteService.setPrintStatus(this.quoteID, this.printStatusPrinted).subscribe(
                    (printStatus) => {
                        this.quote.PrintStatus = +this.printStatusPrinted;
                        this.updateToolbar();
                    },
                    err => this.errorService.handle(err)
                );
            });
        },
            (err) => {
                doneHandler('En feil oppstod ved utskrift av tilbud');
            });
    }

    private deleteQuote(done) {
        this.customerQuoteService.Remove(this.quote.ID, null).subscribe(
            (success) => {
                this.isDirty = false;
                this.router.navigateByUrl('/sales/quotes');
            },
            (err) => {
                this.errorService.handle(err);
                done('Sletting feilet');
            }
        );
    }

    private getCurrencyCode(currencyCodeID: number): string {
        let currencyCode: CurrencyCode;

        if (this.currencyCodes) {
            if (currencyCodeID) {
                currencyCode = this.currencyCodes.find(x => x.ID === currencyCodeID);
            } else if (this.companySettings) {
                currencyCode = this.currencyCodes.find(x => x.ID === this.companySettings.BaseCurrencyCodeID);
            }
        }

        return currencyCode ? currencyCode.Code : '';
    }

    private setSums() {
        this.summary = [
            {
                value: this.getCurrencyCode(this.currencyCodeID),
                title: 'Valuta:',
            description: this.currencyExchangeRate ?
                'Kurs: ' + this.numberFormat.asMoney(this.currencyExchangeRate) : ''
            },
            {
            value: this.itemsSummaryData ?
                this.numberFormat.asMoney(this.itemsSummaryData.SumNoVatBasisCurrency) : '',
                title: 'Avgiftsfritt',
            }, {
            value: this.itemsSummaryData ?
                this.numberFormat.asMoney(this.itemsSummaryData.SumVatBasisCurrency) : '',
                title: 'Avgiftsgrunnlag',
            }, {
            value: this.itemsSummaryData ?
                this.numberFormat.asMoney(this.itemsSummaryData.SumDiscountCurrency) : '',
                title: 'Sum rabatt',
            }, {
            value: this.itemsSummaryData ?
                this.numberFormat.asMoney(this.itemsSummaryData.SumTotalExVatCurrency) : '',
                title: 'Nettosum',
            }, {
            value: this.itemsSummaryData ?
                this.numberFormat.asMoney(this.itemsSummaryData.SumVatCurrency) : '',
                title: 'Mva',
            }, {
            value: this.itemsSummaryData ?
                this.numberFormat.asMoney(this.itemsSummaryData.DecimalRoundingCurrency) : '',
                title: 'Øreavrunding',
            }, {
            value: this.itemsSummaryData ?
                this.numberFormat.asMoney(this.itemsSummaryData.SumTotalIncVatCurrency) : '',
                title: 'Totalsum',
            }];
    }
}
