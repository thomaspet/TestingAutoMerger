import {Component, Input, ViewChild, EventEmitter} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {Observable} from 'rxjs/Rx';
import {CompanySettingsService} from '../../../../services/common/CompanySettingsService';
import {IUniSaveAction} from '../../../../../framework/save/save';
import {TradeItemHelper} from '../../salesHelper/tradeItemHelper';
import {CustomerQuote} from '../../../../unientities';
import {Address} from '../../../../unientities';
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
import {ISummaryConfig} from '../../../common/summary/summary';
import {NumberFormat} from '../../../../services/common/NumberFormatService';
import {GetPrintStatusText} from '../../../../models/printStatus';
import {
    CustomerQuoteService,
    CustomerQuoteItemService,
    CustomerService,
    ReportDefinitionService,
    UserService
} from '../../../../services/services';
import moment from 'moment';
declare const _;

@Component({
    selector: 'quote-details',
    templateUrl: 'app/components/sales/quote/details/quoteDetails.html',
})
export class QuoteDetails {
    @ViewChild(PreviewModal) private previewModal: PreviewModal;
    @ViewChild(SendEmailModal) private sendEmailModal: SendEmailModal;
    @Input() public quoteID: any;

    private quote: CustomerQuote;
    private itemsSummaryData: TradeHeaderCalculationSummary;
    private companySettings: CompanySettings;
    private actions: IUniSaveAction[];
    private readonly: boolean;
    private recalcDebouncer: EventEmitter<any> = new EventEmitter();

    private toolbarconfig: IToolbarConfig;
    private contextMenuItems: IContextMenuItem[] = [];
    public summary: ISummaryConfig[] = [];
    private customerExpandOptions: string[] = ['Info', 'Info.Addresses', 'Info.InvoiceAddress', 'Info.ShippingAddress', 'Dimensions', 'Dimensions.Project', 'Dimensions.Department'];
    private expandOptions: Array<string> = ['Items', 'Items.Product', 'Items.VatType',
        'Items.Dimensions', 'Items.Dimensions.Project', 'Items.Dimensions.Department', 'Customer'
    ].concat(this.customerExpandOptions.map(option => 'Customer.' + option));

    constructor(private customerService: CustomerService,
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
                private tradeItemHelper: TradeItemHelper) {}

    public ngOnInit() {
        this.setSums();
        this.contextMenuItems = [{
            label: 'Send på epost',
            action: () => {
                let sendemail = new SendEmail();
                sendemail.EntityType = 'CustomerQuote';
                sendemail.EntityID = this.quote.ID;
                sendemail.CustomerID = this.quote.CustomerID;
                sendemail.Subject = 'Tilbud ' + (this.quote.QuoteNumber ? 'nr. ' + this.quote.QuoteNumber : 'kladd');
                sendemail.Message = 'Vedlagt finner du Tilbud ' + (this.quote.QuoteNumber ? 'nr. ' + this.quote.QuoteNumber : 'kladd');

                this.sendEmailModal.openModal(sendemail);

                if (this.sendEmailModal.Changed.observers.length === 0) {
                    this.sendEmailModal.Changed.subscribe((email) => {
                        this.reportDefinitionService.generateReportSendEmail('Tilbud id', email);
                    });
                }
            },
            disabled: () => !this.quote.ID
        }];

        // Subscribe and debounce recalc on table changes
        this.recalcDebouncer.debounceTime(500).subscribe((quoteitems) => {
            console.log('debounce', quoteitems);
            if (quoteitems.length) {
                this.recalcItemSums(quoteitems);
            }
        });

        this.companySettingsService.Get(1).subscribe(settings => this.companySettings = settings);

        // Subscribe to route param changes and update invoice data
        this.route.params.subscribe(params => {
            this.quoteID = +params['id'];

            if (this.quoteID) {
                this.customerQuoteService.Get(this.quoteID, this.expandOptions).subscribe((quote) => {
                    this.refreshQuote(quote);
                });
            } else {
                Observable.forkJoin(
                    this.customerQuoteService.GetNewEntity([], CustomerQuote.EntityType),
                    this.userService.getCurrentUser(),
                ).subscribe((dataset) => {
                    let quote = <CustomerQuote> dataset[0];
                    quote.OurReference = dataset[1].DisplayName;
                    quote.QuoteDate = new Date();
                    quote.DeliveryDate = new Date();
                    quote.ValidUntilDate = null;
                    this.refreshQuote(quote);
                });
            }

        });
    }

    private refreshQuote(quote: CustomerQuote) {
        this.onQuoteChange(quote);
        this.readonly = quote.StatusCode && (
            quote.StatusCode === StatusCodeCustomerQuote.CustomerAccepted
            || quote.StatusCode === StatusCodeCustomerQuote.TransferredToOrder
            || quote.StatusCode === StatusCodeCustomerQuote.TransferredToInvoice
        );

        this.quote = _.cloneDeep(quote);
        this.setTabTitle();
        this.updateToolbar();
        this.updateSaveActions();
        this.recalcDebouncer.next(quote.Items);
    }

    public onQuoteChange(quote: CustomerQuote) {
        if (quote.QuoteDate && !quote.ValidUntilDate) {
            quote.ValidUntilDate = moment(quote.QuoteDate).add(1, 'month').toDate();
        }

        if (!quote.CreditDays) {
            if (quote.Customer && quote.Customer.CreditDays) {
                quote.CreditDays = quote.Customer.CreditDays;
            } else if (this.companySettings) {
                quote.CreditDays = this.companySettings.CustomerCreditDays;
            }
        }
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

    public addQuote() {
        this.router.navigateByUrl('/sales/quotes/0');
    }

    public nextQuote() {
        this.customerQuoteService.next(this.quote.ID).subscribe(
            (data) => {
                if (data) {
                    this.router.navigateByUrl('/sales/quotes/' + data.ID);
                }
            },
            (err) => {
                this.toastService.addToast('Ikke flere tilbud etter dette', ToastType.warn, 5);
            }
        );
    }

    public previousQuote() {
        this.customerQuoteService.previous(this.quote.ID).subscribe(
            (data) => {
                if (data) {
                    this.router.navigateByUrl('/sales/quotes/' + data.ID);
                }
            },
            (err) => {
                this.toastService.addToast('Ikke flere tilbud før dette', ToastType.warn, 5);
            }
        );
    }


    private setTabTitle() {
        let tabTitle = this.quote.QuoteNumber ? 'Tilbudsnr. ' + this.quote.QuoteNumber : 'Tilbud';
        this.tabService.addTab({ url: '/sales/quotes/' + this.quote.ID, name: tabTitle, active: true, moduleID: UniModules.Quotes });
    }


    private updateToolbar() {
        this.toolbarconfig = {
            title: this.quote.Customer ? (this.quote.Customer.CustomerNumber + ' - ' + this.quote.Customer.Info.Name) : this.quote.CustomerName,
            subheads: [
                { title: this.quote.QuoteNumber ? 'Tilbudsnr. ' + this.quote.QuoteNumber + '.' : '' },
                { title: !this.itemsSummaryData ? 'Netto kr ' + this.quote.TaxExclusiveAmount + '.' : 'Netto kr ' + this.itemsSummaryData.SumTotalExVat + '.' },
                { title: GetPrintStatusText(this.quote.PrintStatus) }
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
        console.log(quoteItems);
        if (!quoteItems || !quoteItems.length) {
            return;
        }
        this.quote.Items = quoteItems;
        this.itemsSummaryData = this.tradeItemHelper.calculateTradeItemSummaryLocal(quoteItems);
        this.updateToolbar();
        this.setSums();
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
            this.customerQuoteService.Transition(this.quote.ID, this.quote, transition)
                .subscribe((transitionData: any) => {
                    done(doneText);
                    if (transition === 'toOrder') {
                        this.router.navigateByUrl('/sales/orders/' + transitionData.CustomerOrderID);
                    } else if (transition === 'toInvoice') {
                        this.router.navigateByUrl('/sales/invoices/' + transitionData.CustomerInvoiceID);
                    } else {
                        this.customerQuoteService.Get(this.quoteID, this.expandOptions)
                            .subscribe(res => this.refreshQuote(res));
                    }
                }, (err) => {
                    done('Feilet');
                    this.log(err);
                });
        });
    }

    private saveQuote(done: any, next: any = null) {
        this.quote.TaxInclusiveAmount = -1; // TODO in AppFramework, does not save main entity if just items have changed

        this.quote.Items.forEach(item => {
            if (item.Dimensions && item.Dimensions.ID === 0) {
                item.Dimensions['_createguid'] = this.customerQuoteItemService.getNewGuid();
            }
        });

        // Save only lines with products from product list
        if (!TradeItemHelper.IsItemsValid(this.quote.Items)) {
            if (done) {
                done('Lagring feilet');
            }
            return;
        }

        if (this.quote.ID > 0) {
            this.customerQuoteService.Put(this.quote.ID, this.quote)
                .subscribe(
                (quoteSaved) => {
                    this.customerQuoteService.Get(this.quote.ID, this.expandOptions).subscribe(newQuoate => {
                        this.quote = newQuoate;
                        this.updateSaveActions();
                        this.updateToolbar();
                        this.setTabTitle();

                        if (next) {
                            next(this.quote);
                        } else {
                            done('Tilbud lagret');
                        }
                    });
                },
                (err) => {
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
                    this.log(err);
                    done('Lagring feilet');
                }
            );
        }
    }

    private setSums() {
        this.summary = [{
                value: this.itemsSummaryData ? this.numberFormat.asMoney(this.itemsSummaryData.SumNoVatBasis) : null,
                title: 'Avgiftsfritt',
            }, {
                value: this.itemsSummaryData ? this.numberFormat.asMoney(this.itemsSummaryData.SumVatBasis) : null,
                title: 'Avgiftsgrunnlag',
            }, {
                value: this.itemsSummaryData ? this.numberFormat.asMoney(this.itemsSummaryData.SumDiscount) : null,
                title: 'Sum rabatt',
            }, {
                value: this.itemsSummaryData ? this.numberFormat.asMoney(this.itemsSummaryData.SumTotalExVat) : null,
                title: 'Nettosum',
            }, {
                value: this.itemsSummaryData ? this.numberFormat.asMoney(this.itemsSummaryData.SumVat) : null,
                title: 'Mva',
            }, {
                value: this.itemsSummaryData ? this.numberFormat.asMoney(this.itemsSummaryData.DecimalRounding) : null,
                title: 'Øreavrunding',
            }, {
                value: this.itemsSummaryData ? this.numberFormat.asMoney(this.itemsSummaryData.SumTotalIncVat) : null,
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

    private log(err) {
        this.toastService.addToast('En feil oppsto:', ToastType.bad, 0, this.toastService.parseErrorMessageFromError(err));
    }
}
