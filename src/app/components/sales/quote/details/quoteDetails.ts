import {Component, EventEmitter, HostListener, Input, ViewChild, OnInit, AfterViewInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Observable, throwError, of} from 'rxjs';
import {tap, switchMap, catchError, map} from 'rxjs/operators';
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
    StatusCodeCustomerQuote,
    NumberSeries,
    VatType,
    Department,
    User,
} from '@uni-entities';

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
    UserService,
    NumberSeriesService,
    SellerService,
    VatTypeService,
    DimensionSettingsService,
    CustomDimensionService,
    DepartmentService,
    ModulusService,
} from '@app/services/services';

import {
    UniModalService,
    ConfirmActions,
    IModalOptions,
    UniConfirmModalV2,
} from '@uni-framework/uni-modal';
import {IUniSaveAction} from '@uni-framework/save/save';
import {ToastService, ToastType, ToastTime} from '@uni-framework/uniToast/toastService';

import {ReportTypeEnum} from '@app/models/reportTypeEnum';
import {TradeHeaderCalculationSummary} from '@app/models/sales/TradeHeaderCalculationSummary';

import {IToolbarConfig, ICommentsConfig} from '../../../common/toolbar/toolbar';
import {IStatus, STATUSTRACK_STATES} from '../../../common/toolbar/statustrack';

import {TabService, UniModules} from '../../../layout/navbar/tabstrip/tabService';

import {TofHead} from '../../common/tofHead';
import {TradeItemTable} from '../../common/tradeItemTable';
import {UniTofSelectModal} from '../../common/tofSelectModal';

import {StatusCode} from '../../salesHelper/salesEnums';
import {TofHelper} from '../../salesHelper/tofHelper';
import {TradeItemHelper, ISummaryLine} from '../../salesHelper/tradeItemHelper';

import {cloneDeep} from 'lodash';
import {TofReportModal} from '../../common/tof-report-modal/tof-report-modal';

@Component({
    selector: 'quote-details',
    templateUrl: './quoteDetails.html',
})
export class QuoteDetails implements OnInit, AfterViewInit {
    @ViewChild(TofHead, { static: true }) private tofHead: TofHead;
    @ViewChild(TradeItemTable, { static: false }) private tradeItemTable: TradeItemTable;

    @Input() quoteID: number;

    private companySettings: CompanySettings;
    private isDirty: boolean;
    private itemsSummaryData: TradeHeaderCalculationSummary;

    private distributeEntityType: string = 'Models.Sales.CustomerQuote';

    private numberSeries: NumberSeries[];
    private projectID: number;

    newQuoteItem: CustomerQuoteItem;
    quote: CustomerQuote;
    quoteItems: CustomerQuoteItem[];
    readonly: boolean;
    recalcDebouncer: EventEmitter<CustomerQuoteItem[]> = new EventEmitter<CustomerQuoteItem[]>();
    saveActions: IUniSaveAction[] = [];

    currencyCodeID: number;
    currencyCodes: Array<CurrencyCode>;
    currencyExchangeRate: number;
    private currentCustomer: Customer;
    private askedAboutSettingDimensionsOnItems: boolean;

    currentUser: User;
    projects: Project[];
    departments: Department[];
    sellers: Seller[];

    private currentQuoteDate: LocalDate;
    vatTypes: VatType[];
    commentsConfig: ICommentsConfig;
    toolbarconfig: IToolbarConfig;

    currencyInfo: string;
    summaryLines: ISummaryLine[];

    selectedNumberSeries: NumberSeries;
    selectedNumberSeriesTaskID: number;
    selectConfig: any;
    dimensionTypes: any[];
    distributionPlans: any[];
    reports: any[];

    isDistributable = false;

    private customerExpands: string[] = [
        'Info',
        'Info.Addresses',
        'Info.DefaultContact.Info',
        'Info.Emails',
        'Info.DefaultEmail',
        'Info.InvoiceAddress',
        'Info.ShippingAddress',
        'Info.Contacts.Info',
        'Dimensions',
        'Dimensions.Project',
        'Dimensions.Department',
        'Dimensions.Dimension5',
        'Dimensions.Dimension6',
        'Dimensions.Dimension7',
        'Dimensions.Dimension8',
        'Dimensions.Dimension9',
        'Dimensions.Dimension10',
        'PaymentTerms',
        'DeliveryTerms',
        'Sellers',
        'Sellers.Seller',
        'DefaultSeller',
        'DefaultSeller.Seller',
        'Distributions'
    ];

    private quoteExpands: string[] = [
        'Customer',
        'Customer.Info.Contacts.Info',
        'Customer.Info.Addresses',
        'DefaultDimensions',
        'DefaultDimensions.Project',
        'DefaultDimensions.Department',
        'DefaultDimensions.Dimension5',
        'DefaultDimensions.Dimension6',
        'DefaultDimensions.Dimension7',
        'DefaultDimensions.Dimension8',
        'DefaultDimensions.Dimension9',
        'DefaultDimensions.Dimension10',
        'Sellers',
        'Sellers.Seller',
        'DefaultSeller',
        'DefaultSeller.Seller',
        'PaymentTerms',
        'DeliveryTerms'
    ];

    private quoteItemExpands: string[] = [
        'Product',
        'Product.VatType',
        'VatType',
        'Account',
        'Dimensions.Info'
    ];

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
        private numberSeriesService: NumberSeriesService,
        private sellerService: SellerService,
        private vatTypeService: VatTypeService,
        private dimensionsSettingsService: DimensionSettingsService,
        private customDimensionService: CustomDimensionService,
        private departmentService: DepartmentService,
        private modulusService: ModulusService,
    ) { }

    ngOnInit() {
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
                entityID: !hasCopyParam ? this.quoteID : 0
            };

            if (this.quoteID) {
                Observable.forkJoin(
                    this.getQuote(this.quoteID),
                    this.companySettingsService.Get(1),
                    this.currencyCodeService.GetAll(null),
                    this.projectService.GetAll(null),
                    this.sellerService.GetAll(null),
                    this.vatTypeService.GetVatTypesWithDefaultVatPercent('filter=OutputVat eq true'),
                    this.departmentService.GetAll(null),
                    this.dimensionsSettingsService.GetAll(null),
                    this.reportService.getDistributions(this.distributeEntityType),
                    this.reportDefinitionService.GetAll('filter=ReportType eq 3')
                ).subscribe((res) => {
                    const quote = res[0];
                    this.companySettings = res[1];
                    this.currencyCodes = res[2];
                    this.projects = res[3];
                    this.sellers = res[4];
                    this.vatTypes = res[5];
                    this.departments = res[6];
                    this.setUpDims(res[7]);
                    this.distributionPlans = res[8];
                    this.reports = res[9];


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
                        if (!this.currentCustomer && quote.Customer) {
                            this.currentCustomer = quote.Customer;
                        }
                        this.refreshQuote(this.copyQuote(quote));
                    } else {
                        this.refreshQuote(quote);
                    }
                });
            } else {
                Observable.forkJoin(
                    this.getQuote(0),
                    this.userService.getCurrentUser(),
                    this.companySettingsService.Get(1),
                    this.currencyCodeService.GetAll(null),
                    customerID ? this.customerService.Get(
                        customerID, this.customerExpands
                    ) : Observable.of(null),
                    projectID ? this.projectService.Get(projectID, null) : Observable.of(null),
                    this.numberSeriesService.GetAll(`filter=NumberSeriesType.Name eq 'Customer Quote number `
                    + `series' and Empty eq false and Disabled eq false`,
                    ['NumberSeriesType']),
                    this.projectService.GetAll(null),
                    this.sellerService.GetAll(null),
                    this.vatTypeService.GetVatTypesWithDefaultVatPercent('filter=OutputVat eq true'),
                    this.departmentService.GetAll(null),
                    this.dimensionsSettingsService.GetAll(null),
                    this.reportService.getDistributions(this.distributeEntityType),
                    this.reportDefinitionService.GetAll('filter=ReportType eq 3')
                ).subscribe(
                    (res) => {
                        let quote = <CustomerQuote>res[0];
                        this.currentUser = res[1];
                        quote.OurReference = this.currentUser.DisplayName;
                        this.companySettings = res[2];
                        this.currencyCodes = res[3];
                        if (res[4]) {
                            quote = this.tofHelper.mapCustomerToEntity(res[4], quote);
                        }
                        if (res[5]) {
                            quote.DefaultDimensions = quote.DefaultDimensions || new Dimensions();
                            quote.DefaultDimensions.ProjectID = res[5].ID;
                            quote.DefaultDimensions.Project = res[5];
                        }
                        this.numberSeries = this.numberSeriesService.CreateAndSet_DisplayNameAttributeOnSeries(res[6]);
                        this.selectConfig = this.numberSeriesService.getSelectConfig(
                            this.quoteID, this.numberSeries, 'Customer Quote number series'
                        );
                        this.projects = res[7];
                        this.sellers = res[8];
                        this.vatTypes = res[9];
                        this.departments = res[10];
                        this.setUpDims(res[11]);
                        this.distributionPlans = res[12];
                        this.reports = res[13];

                        if (!!customerID && res[4] && res[4]['Distributions'] && res[4]['Distributions'].CustomerQuoteDistributionPlanID) {
                            quote.DistributionPlanID = res[4]['Distributions'].CustomerQuoteDistributionPlanID;
                        } else if (this.companySettings['Distributions']) {
                            quote.DistributionPlanID = this.companySettings['Distributions'].CustomerQuoteDistributionPlanID;
                        }

                        quote.QuoteDate = new LocalDate(Date());
                        quote.ValidUntilDate = new LocalDate(moment(quote.QuoteDate).add(1, 'month').toDate());
                        if (quote.DeliveryTerms && quote.DeliveryTerms.CreditDays) {
                            this.setDeliveryDate(quote);
                        } else {
                            quote.DeliveryDate =  null;
                        }

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

    ngAfterViewInit() {
        this.tofHead.detailsForm.tabbedPastLastField.subscribe((event) => this.tradeItemTable.focusFirstRow());
    }

    @HostListener('keydown', ['$event'])
    onKeyDown(event: KeyboardEvent) {
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

    private getQuote(ID: number): Observable<CustomerQuote> {
        if (!ID) {
            return this.customerQuoteService.GetNewEntity(
                ['DefaultDimensions'],
                CustomerQuote.EntityType
            );
        }

        return Observable.forkJoin(
            this.customerQuoteService.Get(ID, this.quoteExpands, true),
            this.customerQuoteItemService.GetAll(
                `filter=CustomerQuoteID eq ${ID}&hateoas=false`,
                this.quoteItemExpands
            )
        ).map(res => {
            const quote: CustomerQuote = res[0];
            const quoteItems: CustomerQuoteItem[] = res[1].map(item => {
                if (item.Dimensions) {
                    item.Dimensions = this.customDimensionService.mapDimensions(item.Dimensions);
                }
                return item;
            });

            quote.Items = quoteItems;
            return quote;
        });
    }

    canDeactivate(): boolean | Observable<boolean> {
        if (!this.isDirty) {
            return true;
        }

        return this.modalService.openUnsavedChangesModal().onClose.pipe(
            switchMap(result => {
                if (result === ConfirmActions.ACCEPT) {
                    return this.saveQuote(false).pipe(
                        map(res => !!res),
                        catchError(err => {
                            this.errorService.handle(err);
                            return of(false);
                        })
                    );
                }

                return of(result !== ConfirmActions.CANCEL);
            })
        );
    }

    numberSeriesChange(selectedSerie) {
        this.quote.QuoteNumberSeriesID = selectedSerie.ID;
    }

    private refreshQuote(quote?: CustomerQuote) {
        this.readonly = quote.StatusCode && (
            quote.StatusCode === StatusCodeCustomerQuote.CustomerAccepted
                || quote.StatusCode === StatusCodeCustomerQuote.TransferredToOrder
                || quote.StatusCode === StatusCodeCustomerQuote.TransferredToInvoice
        );

        this.newQuoteItem = this.tradeItemHelper.getDefaultTradeItemData(quote);
        this.isDirty = false;
        this.quoteItems = quote.Items.sort(
            function(itemA, itemB) { return itemA.SortIndex - itemB.SortIndex; }
        );

        this.currentCustomer = quote.Customer;
        this.currentQuoteDate = quote.QuoteDate;

        this.quote = cloneDeep(quote);

        this.recalcItemSums(quote.Items);
        this.updateCurrency(quote, true);

        this.isDistributable = this.tofHelper.isDistributable('CustomerQuote', this.quote, this.companySettings, this.distributionPlans);

        this.updateTab();
        this.updateToolbar();
        this.updateSaveActions();
    }

    onQuoteChange(quote: CustomerQuote) {
        this.isDirty = true;
        let shouldGetCurrencyRate: boolean = false;
        const customerChanged = this.didCustomerChange(quote);
        if (customerChanged) {
            if ((!quote.Customer.ID || quote.Customer.ID === 0) && quote.Customer.OrgNumber !== null) {
                this.customerService.getCustomers(quote.Customer.OrgNumber).subscribe(res => {
                    if (res.Data.length > 0) {
                        let orgNumberUses = 'Det finnes allerede kunde med dette organisasjonsnummeret registrert i UE: <br><br>';
                        res.Data.forEach(function (ba) {
                            orgNumberUses += ba.CustomerNumber + ' ' + ba.Name + ' <br>';
                        });
                        this.toastService.addToast('', ToastType.warn, 60, orgNumberUses);
                    }
                }, err => this.errorService.handle(err));
            }
            if (quote.Customer.StatusCode === StatusCode.InActive) {
                const options: IModalOptions = {message: 'Vil du aktivere kunden?'};
                this.modalService.open(UniConfirmModalV2, options).onClose.subscribe(res => {
                    if (res === ConfirmActions.ACCEPT) {
                        this.customerService.activateCustomer(quote.CustomerID).subscribe(
                            response => {
                                quote.Customer.StatusCode = StatusCode.Active;
                                this.toastService.addToast('Kunde aktivert', ToastType.good);
                                this.onQuoteChange(quote);
                            },
                            err => this.errorService.handle(err)
                        );
                    }
                    return;
                });
            }


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
            this.tradeItemTable.setDefaultProjectAndRefreshItems(quote.DefaultDimensions, true);
        }

        if (quote['_updatedFields'] && quote['_updatedFields'].toString().includes('Dimension')) {
            this.askedAboutSettingDimensionsOnItems = false;
        }

        if (quote['_updatedField']) {
            this.tradeItemTable.setDefaultProjectAndRefreshItems(quote.DefaultDimensions, false);
            this.newQuoteItem = this.tradeItemHelper.getDefaultTradeItemData(quote);

            const dimension = quote['_updatedField'].split('.');
            const dimKey = parseInt(dimension[1].substr(dimension[1].length - 3, 1), 10);
            if (!isNaN(dimKey) && dimKey >= 5) {
                this.tradeItemTable.setDimensionOnTradeItems(dimKey, quote[dimension[0]][dimension[1]], this.askedAboutSettingDimensionsOnItems);
            } else {
                // Project, Department, Region and Reponsibility hits here!
                this.tradeItemTable.setNonCustomDimsOnTradeItems(dimension[1], quote.DefaultDimensions[dimension[1]], this.askedAboutSettingDimensionsOnItems);
            }
        }

        if (quote.QuoteDate && !quote.ValidUntilDate) {
            quote.ValidUntilDate = new LocalDate(moment(quote.QuoteDate).add(1, 'month').toDate());
        }

        this.updateCurrency(quote, shouldGetCurrencyRate);

        if (
            customerChanged && this.currentCustomer &&
            this.currentCustomer['Distributions'] &&
            this.currentCustomer['Distributions'].CustomerQuoteDistributionPlanID
        ) {
            if (quote.DistributionPlanID &&
                quote.DistributionPlanID !== this.currentCustomer['Distributions'].CustomerQuoteDistributionPlanID) {
                this.modalService.open(UniConfirmModalV2,
                    {
                        header: 'Oppdatere utsendelsesplan?',
                        buttonLabels: {
                            accept: 'Oppdater',
                            reject: 'Ikke oppdater'
                        },
                        message: 'Kunden du har valgt har en annen utsendelsesplan enn den som allerede er valgt for ' +
                        'dette tilbudet. Ønsker du å oppdatere utsendelsesplanen for dette tilbudet til å matche kundens?'
                    }
                ).onClose.subscribe((res) => {
                    if (res === ConfirmActions.ACCEPT) {
                        quote.DistributionPlanID = this.currentCustomer['Distributions'].CustomerQuoteDistributionPlanID;
                        this.toastService.addToast('Oppdatert', ToastType.good, 5, 'Utsendelsesplanen oppdatert');
                        this.quote = quote;
                    }
                });
            } else {
                quote.DistributionPlanID = this.currentCustomer['Distributions'].CustomerQuoteDistributionPlanID;
            }
        }
        this.quote = quote;
        this.currentQuoteDate = quote.QuoteDate;
        this.updateSaveActions();
    }

    onFreetextChange() {
        // Stupid data flow requires this
        this.quote = cloneDeep(this.quote);
        this.isDirty = true;
        this.updateSaveActions();
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
                                this.quote = cloneDeep(quote);
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
                            this.quote = cloneDeep(quote);
                        } else {
                            // update
                            this.recalcItemSums(this.quoteItems);

                            // update the model
                            this.quote = cloneDeep(quote);
                        }
                    } else {
                        this.recalcItemSums(this.quoteItems);
                    }
                }, err => this.errorService.handle(err)
                );
        }
    }

    private setUpDims(dims) {
        this.dimensionTypes = [{
            Label: 'Avdeling',
            Dimension: 2,
            IsActive: true,
            Property: 'DefaultDimensions.DepartmentID',
            Data: this.departments
        }];

        const queries = [];

        dims.forEach((dim) => {
            this.dimensionTypes.push({
                Label: dim.Label,
                IsActive: dim.IsActive,
                Dimension: dim.Dimension,
                Property: 'DefaultDimensions.Dimension' + dim.Dimension + 'ID',
                Data: []
            });
            queries.push(this.customDimensionService.getCustomDimensionList(dim.Dimension));
        });

        Observable.forkJoin(queries).subscribe((res) => {
            res.forEach((list, index) => {
                this.dimensionTypes[index + 1].Data = res[index];
            });
        });
    }

    private didCustomerChange(quote: CustomerQuote): boolean {
        let change: boolean;

        if (!this.currentCustomer && !quote.Customer) {
            return false;
        }

        if (!this.currentCustomer && quote.Customer.ID === 0) {
            change = true;
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

    private newBasedOn(doneCallback) {
        if (this.quote.ID) {
            this.router.navigateByUrl('sales/quotes/' + this.quote.ID + ';copy=true');
            doneCallback();
        } else {
            this.modalService.open(UniTofSelectModal, {
                data: {
                    service: this.customerQuoteService,
                    moduleName: 'Quote',
                    label: 'Tilbudsnr'
                }
            }).onClose.subscribe((id: number) => {
                if (id) {
                    this.router.navigateByUrl('sales/quotes/' + id + ';copy=true');
                }

                doneCallback();
            });
        }
    }

    private copyQuote(quote: CustomerQuote): CustomerQuote {
        quote.ID = 0;
        quote.QuoteNumber = null;
        quote.QuoteNumberNumberSeries = null;
        quote.StatusCode = null;
        quote.PrintStatus = null;
        quote.Comment = null;
        delete quote['_links'];

        quote.Sellers = quote.Sellers.map(item => {
            item.CustomerQuoteID = null;
            return item;
        });

        quote.Items = quote.Items.map((item: CustomerQuoteItem) => {
            item.CustomerQuoteID = 0;
            item.ID = 0;
            item.StatusCode = null;
            return item;
        });

        if (this.currentCustomer && this.currentCustomer.Info) {
            quote.CustomerName = this.currentCustomer.Info.Name;
            if (this.currentCustomer.Info.Addresses && this.currentCustomer.Info.Addresses.length > 0) {
                var address = this.currentCustomer.Info.Addresses[0];
                if (this.currentCustomer.Info.InvoiceAddressID) {
                    address = this.currentCustomer.Info.Addresses.find(x => x.ID == this.currentCustomer.Info.InvoiceAddressID);
                }
                quote.InvoiceAddressLine1 = address.AddressLine1;
                quote.InvoiceAddressLine2 = address.AddressLine2;
                quote.InvoiceAddressLine3 = address.AddressLine3;
                quote.InvoicePostalCode = address.PostalCode;
                quote.InvoiceCity = address.City;
                quote.InvoiceCountry = address.Country;
                quote.InvoiceCountryCode = address.CountryCode;

                if (this.currentCustomer.Info.ShippingAddressID) {
                    address = this.currentCustomer.Info.Addresses.find(x => x.ID == this.currentCustomer.Info.ShippingAddressID);
                }
                quote.ShippingAddressLine1 = address.AddressLine1;
                quote.ShippingAddressLine2 = address.AddressLine2;
                quote.ShippingAddressLine3 = address.AddressLine3;
                quote.ShippingPostalCode = address.PostalCode;
                quote.ShippingCity = address.City;
                quote.ShippingCountry = address.Country;
                quote.ShippingCountryCode = address.CountryCode;
            }
        }
        return quote;
    }

    private recalcPriceAndSumsBasedOnSetPrices(item, newCurrencyRate) {
        item.PriceExVat = this.tradeItemHelper.round(item.PriceExVatCurrency * newCurrencyRate, 4);

        this.tradeItemHelper.calculatePriceIncVat(item, newCurrencyRate);
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

        this.tradeItemHelper.calculatePriceIncVat(item, newCurrencyRate);
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

    private nextQuote() {
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

    private previousQuote() {
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

    private updateTab(quote?: CustomerQuote) {
        if (!quote) {
            quote = this.quote;
        }

        let tabTitle = '';
        if (quote.QuoteNumber) {
            tabTitle = 'Tilbudsnr. ' + quote.QuoteNumber;
        } else {
            tabTitle = (quote.ID) ? 'Tilbud (kladd)' : 'Nytt tilbud';
        }
        this.tabService.addTab({
            url: '/sales/quotes/' + quote.ID,
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

        const config: IToolbarConfig = {
            title: quoteText,
            statustrack: this.getStatustrackConfig(),
            hideDisabledActions: true,
            entityID: this.quoteID,
            entityType: 'CustomerQuote',
            navigation: {
                prev: this.previousQuote.bind(this),
                next: this.nextQuote.bind(this),
            },
            buttons: [{
                class: 'icon-button',
                icon: 'remove_red_eye',
                action: () => this.preview(),
                tooltip: 'Forhåndsvis'
            }]
        };

        if (this.quote.ID) {
            config.buttons.push({
                label: 'Nytt tilbud',
                action: () => this.router.navigateByUrl('sales/quotes/0')
            });
        } else {
            config.buttons.push({
                label: 'Lagre kladd',
                action: () => {
                    this.quote.StatusCode = StatusCode.Draft;
                    return this.saveQuote();
                }
            });
        }

        this.toolbarconfig = config;
    }

    private preview() {
        const openPreview = (quote) => {
            return this.modalService.open(TofReportModal, {
                data: {
                    entityLabel: 'Tilbud',
                    entityType: 'CustomerQuote',
                    entity: quote,
                    reportType: ReportTypeEnum.QUOTE,
                    hideEmailButton: true,
                    hidePrintButton: true
                }
            }).onClose;
        };

        if (this.isDirty) {
            if (!this.quote.ID) {
                this.quote.StatusCode = StatusCode.Draft;
            }

            return this.saveQuote().pipe(
                switchMap(quote => openPreview(quote))
            );
        } else {
            return openPreview(this.quote);
        }
    }

    recalcItemSums(quoteItems: CustomerQuoteItem[]) {
        const items = quoteItems && quoteItems.filter(item => !item.Deleted);
        const decimals = this.tradeItemHelper.getCompanySettingsNumberOfDecimals(this.companySettings, this.currencyCodeID);

        this.itemsSummaryData = items && items.length
            ? this.tradeItemHelper.calculateTradeItemSummaryLocal(items, decimals)
            : undefined;

        if (this.itemsSummaryData) {
            this.summaryLines = this.tradeItemHelper.getSummaryLines(items, this.itemsSummaryData);
        } else {
            this.summaryLines = [];
        }

        if (this.currencyCodeID && this.currencyExchangeRate) {
            this.currencyInfo = `${this.getCurrencyCode(this.currencyCodeID)} `
                + `(kurs: ${this.numberFormat.asMoney(this.currencyExchangeRate)})`;
        }

        this.updateToolbar();
    }

    private printOrEmail() {
        return this.modalService.open(TofReportModal, {
            data: {
                entityLabel: 'Tilbud',
                entityType: 'CustomerQuote',
                entity: this.quote,
                reportType: ReportTypeEnum.QUOTE
            }
        }).onClose.pipe(tap(selectedAction => {
            let printStatus;
            if (selectedAction === 'print') {
                printStatus = '200';
            } else if (selectedAction === 'email') {
                printStatus = '100';
            }

            if (printStatus) {
                this.customerQuoteService.setPrintStatus(this.quote.ID, printStatus).subscribe(
                    () => {
                        this.quote.PrintStatus = +printStatus;
                        this.updateToolbar();
                    },
                    err => console.error(err)
                );
            }
        }));
    }

    private updateSaveActions() {
        const transitions = (this.quote['_links'] || {}).transitions;
        const printStatus = this.quote.PrintStatus;

        this.saveActions = [];

        if (this.quote.ID) {
            this.saveActions.push({
                label: 'Lagre endringer',
                action: (done) => {
                    this.saveQuote().subscribe(
                        () => done(),
                        err => {
                            this.errorService.handle(err);
                            done();
                        }
                    );
                },
                main: this.isDirty || (this.quote.ID > 0
                    && this.quote.StatusCode !== StatusCodeCustomerQuote.Draft
                    && printStatus === 100
                )
            });

            this.saveActions.push({
                label: 'Send via utsendelsesplan',
                disabled: !this.isDistributable,
                action: (done) => {
                    this.reportService.distribute(this.quote.ID, this.distributeEntityType).subscribe(
                        () => {
                            this.toastService.toast({
                                title: 'Tilbud er lagt i kø for utsendelse',
                                type: ToastType.good,
                                duration: ToastTime.short
                            });

                            done();
                        },
                        err => {
                            this.errorService.handle(err);
                            done();
                        }
                    );
                }
            });

            this.saveActions.push({
                label: 'Skriv ut / send e-post',
                action: (done) => this.printOrEmail().subscribe(() => done()),
            });

            this.saveActions.push({
                label: 'Avslutt tilbud',
                action: (done) => this.transition(done, 'complete'),
                disabled: !transitions || !transitions['complete'],
            });

            this.saveActions.push({
                label: 'Slett',
                action: (done) => this.deleteQuote(done),
                disabled: this.quote.StatusCode !== StatusCodeCustomerQuote.Draft
            });

            this.saveActions.push({
                label: 'Overfør til ordre',
                action: (done) => this.transition(done, 'toOrder'),
                disabled: !transitions || !transitions['toOrder']
            });

            this.saveActions.push({
                label: 'Overfør til faktura',
                action: (done) => this.transition(done, 'toInvoice'),
                disabled: !transitions || !transitions['toInvoice']
            });
        }

        this.saveActions.push({
            label: 'Registrer',
            action: (done) => this.saveQuoteAsRegistered(done),
            disabled: transitions && !transitions['register'] || !this.currentCustomer,
            main: !transitions || transitions['register']
        });

        this.saveActions.push({
            label: 'Ny basert på',
            action: (done) => this.newBasedOn(done),
            disabled: false
        });
    }

    private saveQuote(reloadAfterSave = true): Observable<CustomerQuote> {
        this.quote.Items = this.tradeItemHelper.prepareItemsForSave(this.quoteItems);
        if (this.quote.Sellers) {
            this.quote.Sellers = this.quote.Sellers.filter(x => !x['_isEmpty']);
            if (!this.quote.ID) {
                this.quote.Sellers.forEach(seller => seller.CustomerQuoteID = null);
            }
        }

        this.quote = this.tofHelper.beforeSave(this.quote);

        return this.checkCurrencyAndVatBeforeSave().pipe(switchMap(canSave => {
            if (!canSave) {
                return throwError('Lagring avbrutt');
            }

            const navigateAfterSave = !this.quote.ID;
            const saveRequest = this.quote.ID > 0
                ? this.customerQuoteService.Put(this.quote.ID, this.quote)
                : this.customerQuoteService.Post(this.quote);

            return saveRequest.pipe(switchMap(res => {
                this.isDirty = false;
                if (reloadAfterSave) {
                    if (navigateAfterSave) {
                        this.router.navigateByUrl('sales/quotes/' + res.ID);
                        return of(res);
                    } else {
                        return this.getQuote(res.ID).pipe(
                            tap(quote => this.refreshQuote(quote))
                        );
                    }
                } else {
                    return of(res);
                }
            }));
        }));
    }

    private checkCurrencyAndVatBeforeSave(): Observable<boolean> {
        if (this.quote.CurrencyCodeID !== this.companySettings.BaseCurrencyCodeID) {
            const linesWithVat = this.quote.Items.filter(x => x.SumVatCurrency > 0);
            if (linesWithVat.length > 0) {
                const modalMessage = 'Er du sikker på at du vil registrere linjer med MVA når det er brukt '
                    + `${this.getCurrencyCode(this.quote.CurrencyCodeID)} som valuta?`;

                return this.modalService.confirm({
                    header: 'Vennligst bekreft',
                    message: modalMessage,
                    buttonLabels: {
                        accept: 'Ja, lagre med MVA',
                        cancel: 'Avbryt'
                    }
                }).onClose.map(response => {
                    return response === ConfirmActions.ACCEPT;
                });
            }
        }

        return Observable.of(true);
    }

    private saveQuoteAsRegistered(done: any) {
        if (this.quote.ID > 0) {
            this.transition(done, 'register');
        } else {
            this.saveQuote().subscribe(
                () => done(),
                err => {
                    this.errorService.handle(err);
                    done();
                }
            );
        }
    }

    private transition(doneCallback, transition: string) {
        if (!this.quote.Customer) {
            this.toastService.addToast('Kan ikke overføre tilbud uten kunde', ToastType.warn, 5);
            doneCallback('');
            return;
        }

        const orgNumber = this.quote.Customer.OrgNumber;
        let canTransitionCheck = of(true);
        if (orgNumber && !this.modulusService.isValidOrgNr(orgNumber)) {
            canTransitionCheck = this.modalService.confirm({
                header: 'Bekreft kunde',
                message: `Ugyldig org.nr. '${this.quote.Customer.OrgNumber}' på kunde. Vil du fortsette?`,
                buttonLabels: {
                    accept: 'Ja',
                    cancel: 'Avbryt'
                }
            }).onClose.pipe(map(res => res === ConfirmActions.ACCEPT));
        }

        canTransitionCheck.subscribe(canTransition => {
            if (!canTransition) {
                doneCallback();
                return;
            }

            this.saveQuote(false).subscribe(
                quote => {
                    this.isDirty = false;
                    this.customerQuoteService.Transition(quote.ID, quote, transition).subscribe(
                        res => {
                            if (transition === 'toOrder') {
                                this.router.navigateByUrl('/sales/orders/' + res.CustomerOrderID);
                            } else if (transition === 'toInvoice') {
                                this.router.navigateByUrl('/sales/invoices/' + res.CustomerInvoiceID);
                            } else {
                                this.getQuote(quote.ID).subscribe(updatedQuote => this.refreshQuote(updatedQuote));
                            }

                            doneCallback();
                        },
                        err => {
                            this.errorService.handle(err);
                            this.getQuote(quote.ID).subscribe(res => this.refreshQuote(res));
                            doneCallback();
                        }
                    );
                },
                err => {
                    this.errorService.handle(err);
                    doneCallback();
                }
            );
        });
    }

    private deleteQuote(done) {
        this.customerQuoteService.Remove(this.quote.ID, null).subscribe(
            () => {
                this.isDirty = false;
                this.router.navigateByUrl('/sales/quotes');
            },
            (err) => {
                this.errorService.handle(err);
                done();
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

    public onTradeItemsChange($event) {
        this.quote.Items = this.quoteItems;
        this.quote = cloneDeep(this.quote);
        this.recalcDebouncer.emit($event);
    }
}
