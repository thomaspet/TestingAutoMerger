import {Component, Input, ViewChild, EventEmitter, HostListener} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {Observable} from 'rxjs/Observable';
import {IUniSaveAction} from '../../../../../framework/save/save';
import {TradeItemHelper} from '../../salesHelper/tradeItemHelper';
import {CustomerQuote} from '../../../../unientities';
import {StatusCodeCustomerQuote, CompanySettings, CustomerQuoteItem} from '../../../../unientities';
import {StatusCode} from '../../salesHelper/salesEnums';
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
import {GetPrintStatusText} from '../../../../models/printStatus';
import {TofHead} from '../../common/tofHead';
import {TradeItemTable} from '../../common/tradeItemTable';
import {UniConfirmModal, ConfirmActions} from '../../../../../framework/modals/confirm';
import {
    CustomerQuoteService,
    CustomerQuoteItemService,
    CustomerService,
    ReportDefinitionService,
    UserService,
    ErrorService,
    NumberFormat,
    CompanySettingsService
} from '../../../../services/services';
import * as moment from 'moment';
declare var _;

@Component({
    selector: 'quote-details',
    templateUrl: './quoteDetails.html',
})
export class QuoteDetails {
    @ViewChild(PreviewModal) private previewModal: PreviewModal;
    @ViewChild(SendEmailModal) private sendEmailModal: SendEmailModal;

    @ViewChild(TofHead)
    private tofHead: TofHead;

    @ViewChild(TradeItemTable)
    private tradeItemTable: TradeItemTable;

    @ViewChild(UniConfirmModal)
    private confirmModal: UniConfirmModal;

    @Input()
    public quoteID: number;

    private isDirty: boolean;
    private quote: CustomerQuote;
    private quoteItems: CustomerQuoteItem[];
    private newQuoteItem: CustomerQuoteItem;
    private itemsSummaryData: TradeHeaderCalculationSummary;
    private companySettings: CompanySettings;
    private saveActions: IUniSaveAction[] = [];
    private readonly: boolean;
    private recalcDebouncer: EventEmitter<CustomerQuoteItem[]> = new EventEmitter<CustomerQuoteItem[]>();

    private toolbarconfig: IToolbarConfig;
    private contextMenuItems: IContextMenuItem[] = [];
    public summary: ISummaryConfig[] = [];
    private customerExpandOptions: string[] = ['Info', 'Info.Addresses', 'Info.InvoiceAddress', 'Info.ShippingAddress', 'Dimensions', 'Dimensions.Project', 'Dimensions.Department'];
    private expandOptions: Array<string> = ['Items', 'Items.Product', 'Items.VatType', 'Items.Account',
        'Items.Dimensions', 'Items.Dimensions.Project', 'Items.Dimensions.Department', 'Customer'
    ].concat(this.customerExpandOptions.map(option => 'Customer.' + option));

    private commentsConfig: any;

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
                private tradeItemHelper: TradeItemHelper,
                private errorService: ErrorService) {
    }

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
            if (quoteitems.length) {
                this.recalcItemSums(quoteitems);
            }
        });

        this.companySettingsService.Get(1).subscribe(
            settings => this.companySettings = settings,
            err => this.errorService.handle(err)
        );

        // Subscribe to route param changes and update invoice data
        this.route.params.subscribe(params => {
            this.quoteID = +params['id'];
            this.commentsConfig = {
                entityType: 'CustomerQuote',
                entityID: this.quoteID
            };

            if (this.quoteID) {
                this.customerQuoteService.Get(this.quoteID, this.expandOptions).subscribe((quote) => {
                    this.refreshQuote(quote);
                });
            } else {
                Observable.forkJoin(
                    this.customerQuoteService.GetNewEntity([], CustomerQuote.EntityType),
                    this.userService.getCurrentUser(),
                ).subscribe(
                    (dataset) => {
                        let quote = <CustomerQuote> dataset[0];
                        quote.OurReference = dataset[1].DisplayName;
                        quote.QuoteDate = new Date();
                        quote.DeliveryDate = new Date();
                        quote.ValidUntilDate = null;
                        this.refreshQuote(quote);
                    },
                    err => this.errorService.handle(err)
                );
            }

        });
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

    public canDeactivate(): boolean|Promise<boolean> {
        if (!this.isDirty) {
            return true;
        }

        return new Promise<boolean>((resolve, reject) => {
            this.confirmModal.confirm(
                'Ønsker du å lagre tilbudet før du fortsetter?',
                'Ulagrede endringer',
                true
            ).then((action) => {
                if (action === ConfirmActions.ACCEPT) {
                    if (!this.quote.StatusCode) {
                        this.quote.StatusCode = StatusCode.Draft;
                    }
                    this.saveQuote().subscribe(
                        (res) => {
                            this.isDirty = false;
                            resolve(true);
                        },
                        (err) => {
                            this.errorService.handle(err);
                            resolve(false);
                        }
                    );
                } else if (action === ConfirmActions.REJECT) {
                    resolve(true);
                } else {
                    resolve(false);
                    this.setTabTitle();
                }
            });
        });
    }

    private refreshQuote(quote?: CustomerQuote) {
        if (!quote) {
            this.customerQuoteService.Get(this.quoteID, this.expandOptions).subscribe(
                res => this.refreshQuote(res),
                err => this.errorService.handle(err)
            );
            return;
        }

        this.onQuoteChange(quote);
        this.readonly = quote.StatusCode && (
                quote.StatusCode === StatusCodeCustomerQuote.CustomerAccepted
                || quote.StatusCode === StatusCodeCustomerQuote.TransferredToOrder
                || quote.StatusCode === StatusCodeCustomerQuote.TransferredToInvoice
            );

        this.newQuoteItem = <any> this.tradeItemHelper.getDefaultTradeItemData(quote);
        this.isDirty = false;
        this.quoteItems = quote.Items;

        this.quote = _.cloneDeep(quote);
        this.recalcItemSums(quote.Items);
        this.setTabTitle();
        this.updateToolbar();
        this.updateSaveActions();
    }

    public onQuoteChange(quote: CustomerQuote) {
        this.isDirty = true;
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

        this.quote = _.cloneDeep(quote);
    }

    private getStatustrackConfig() {
        let statustrack: UniStatusTrack.IStatus[] = [];
        let activeStatus = this.quote ? (this.quote.StatusCode ? this.quote.StatusCode : 1) : 0;

        this.customerQuoteService.getFilteredStatusTypes(this.quote.StatusCode).forEach((status) => {
            let _state: UniStatusTrack.States;

            if (status.Code > activeStatus) {
                _state = UniStatusTrack.States.Future;
            } else if (status.Code < activeStatus) {
                _state = UniStatusTrack.States.Completed;
            } else if (status.Code === activeStatus) {
                _state = UniStatusTrack.States.Active;
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

        let customerText = (this.quote.Customer)
            ? this.quote.Customer.CustomerNumber + ' - ' + this.quote.Customer.Info.Name
            : '';

        let netSumText = (this.itemsSummaryData)
            ? 'Netto kr ' + this.itemsSummaryData.SumTotalExVat + '.'
            : 'Netto kr ' + this.quote.TaxExclusiveAmount + '.';

        this.toolbarconfig = {
            title: quoteText,
            subheads: [
                {title: customerText, link: this.quote.Customer ? `#/sales/customer/${this.quote.Customer.ID}` : ''},
                {title: netSumText},
                {title: GetPrintStatusText(this.quote.PrintStatus)}
            ],
            statustrack: this.getStatustrackConfig(),
            navigation: {
                prev: this.previousQuote.bind(this),
                next: this.nextQuote.bind(this),
                add: () => this.router.navigateByUrl('/sales/quotes/0')
            },
            contextmenu: this.contextMenuItems,
            entityID: this.quoteID,
            entityType: 'CustomerQuote'
        };
    }

    public recalcItemSums(quoteItems: any) {
        if (!quoteItems) {
            return;
        }

        this.itemsSummaryData = this.tradeItemHelper.calculateTradeItemSummaryLocal(quoteItems);
        this.updateToolbar();
        this.setSums();
    }

    private updateSaveActions() {
        const transitions = (this.quote['_links'] || {}).transitions;
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
                this.saveQuote().subscribe(
                    (res) => {
                        done('Lagring fullført');
                        this.quoteID = res.ID;
                        this.refreshQuote();
                    },
                    (err) => {
                        done('Lagring feilet');
                        this.errorService.handle(err);
                    }
                );
            },
            disabled: !this.quote.ID,
            main: this.quote.ID > 0 && this.quote.StatusCode !== StatusCodeCustomerQuote.Draft
        });

        if (!this.quote.ID) {
            this.saveActions.push({
                label: 'Lagre som kladd',
                action: (done) => this.saveQuoteAsDraft(done),
                disabled: (this.quote.ID > 0)
            });
        }

        this.saveActions.push({
            label: 'Skriv ut',
            action: (done) => this.saveAndPrint(done),
            disabled: !this.quote.ID
        });

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

    private saveQuote(): Observable<CustomerQuote> {
        this.quote.TaxInclusiveAmount = -1; // TODO in AppFramework, does not save main entity if just items have changed
        this.quote.Items = this.quoteItems;

        this.quote.Items.forEach(item => {
            if (item.Dimensions && item.Dimensions.ID === 0) {
                item.Dimensions['_createguid'] = this.customerQuoteItemService.getNewGuid();
            }
        });

        // Save only lines with products from product list
        if (!TradeItemHelper.IsItemsValid(this.quote.Items)) {
            const message = 'En eller flere varelinjer mangler produkt';
            return Observable.throw(message);
        }

        return (this.quote.ID > 0)
            ? this.customerQuoteService.Put(this.quote.ID, this.quote)
            : this.customerQuoteService.Post(this.quote);
    }

    private saveQuoteAsRegistered(done: any) {
        if (this.quote.ID > 0) {
            this.saveQuoteTransition(done, 'register', 'Registrert');
        } else {
            this.saveQuote().subscribe(
                (res) => {
                    done('Registrering fullført');
                    this.quoteID = res.ID;
                    this.isDirty = false;
                    this.router.navigateByUrl('/sales/quotes/' + res.ID);
                },
                (err) => {
                    done('Registrering feilet');
                    this.errorService.handle(err);
                }
            );
        }
    }

    private saveQuoteAsDraft(done: any) {
        this.quote.StatusCode = StatusCode.Draft;
        const navigateOnSuccess = !this.quote.ID;
        this.saveQuote().subscribe(
            (res) => {
                this.isDirty = false;
                done('Lagring fullført');
                if (navigateOnSuccess) {
                    this.router.navigateByUrl('/sales/quotes/' + res.ID);
                } else {
                    this.quoteID = res.ID;
                    this.refreshQuote();
                }
            },
            (err) => {
                done('Lagring feilet');
                this.errorService.handle(err);
            }
        );
    }

    private saveQuoteTransition(done: any, transition: string, doneText: string) {
        this.saveQuote().subscribe(
            (quote) => {
                this.isDirty = false;
                this.customerQuoteService.Transition(this.quote.ID, this.quote, transition).subscribe(
                    (res) => {
                        done(doneText);
                        if (transition === 'toOrder') {
                            this.router.navigateByUrl('/sales/orders/' + res.CustomerOrderID);
                        } else if (transition === 'toInvoice') {
                            this.router.navigateByUrl('/sales/invoices/' + res.CustomerInvoiceID);
                        } else {
                            this.quoteID = quote.ID;
                            this.refreshQuote();
                        }
                    }
                );
            },
            (err) => {
                done('Lagring feilet');
                this.errorService.handle(err);
            }
        );
    }

    private saveAndPrint(done) {
        this.saveQuote().subscribe(
            (res) => {
                this.isDirty = false;
                this.reportDefinitionService.getReportByName('Tilbud id').subscribe((report) => {
                    if (report) {
                        this.previewModal.openWithId(report, res.ID);
                        done('Viser utskrift');
                    } else {
                        done('Rapport mangler');
                    }
                });
            },
            (err) => {
                done('Lagring feilet');
                this.errorService.handle(err);
            }
        );
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

    private setSums() {
        this.summary = [{
            value: this.itemsSummaryData ? this.numberFormat.asMoney(this.itemsSummaryData.SumNoVatBasis) : '',
            title: 'Avgiftsfritt',
        }, {
            value: this.itemsSummaryData ? this.numberFormat.asMoney(this.itemsSummaryData.SumVatBasis) : '',
            title: 'Avgiftsgrunnlag',
        }, {
            value: this.itemsSummaryData ? this.numberFormat.asMoney(this.itemsSummaryData.SumDiscount) : '',
            title: 'Sum rabatt',
        }, {
            value: this.itemsSummaryData ? this.numberFormat.asMoney(this.itemsSummaryData.SumTotalExVat) : '',
            title: 'Nettosum',
        }, {
            value: this.itemsSummaryData ? this.numberFormat.asMoney(this.itemsSummaryData.SumVat) : '',
            title: 'Mva',
        }, {
            value: this.itemsSummaryData ? this.numberFormat.asMoney(this.itemsSummaryData.DecimalRounding) : '',
            title: 'Øreavrunding',
        }, {
            value: this.itemsSummaryData ? this.numberFormat.asMoney(this.itemsSummaryData.SumTotalIncVat) : '',
            title: 'Totalsum',
        }];
    }
}
