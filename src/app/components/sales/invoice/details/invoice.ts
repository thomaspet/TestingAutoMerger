import {Component, Input, ViewChild, EventEmitter, HostListener} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {Observable} from 'rxjs/Rx';
import {TradeItemHelper} from '../../salesHelper/tradeItemHelper';
import {IUniSaveAction} from '../../../../../framework/save/save';
import {CustomerInvoice, Address, Customer} from '../../../../unientities';
import {StatusCodeCustomerInvoice} from '../../../../unientities';
import {TradeHeaderCalculationSummary} from '../../../../models/sales/TradeHeaderCalculationSummary';
import {TabService, UniModules} from '../../../layout/navbar/tabstrip/tabService';
import {ToastService, ToastType} from '../../../../../framework/uniToast/toastService';
import {IToolbarConfig} from '../../../common/toolbar/toolbar';
import {UniStatusTrack} from '../../../common/toolbar/statustrack';
import {ISummaryConfig} from '../../../common/summary/summary';
import {StatusCode} from '../../salesHelper/salesEnums';
import {InvoiceItems} from './invoiceItems';
import {PreviewModal} from '../../../reports/modals/preview/previewModal';
import {RegisterPaymentModal} from '../../../common/modals/registerPaymentModal';
import {IContextMenuItem} from 'unitable-ng2/main';
import {CustomerService} from '../../../../services/Sales/CustomerService';
import {SendEmailModal} from '../../../common/modals/sendEmailModal';
import {SendEmail} from '../../../../models/sendEmail';
import {InvoiceTypes} from '../../../../models/Sales/InvoiceTypes';
import {NumberFormat} from '../../../../services/common/NumberFormatService';
import {GetPrintStatusText} from '../../../../models/printStatus';
import {
    CustomerInvoiceService,
    CustomerInvoiceItemService,
    BusinessRelationService,
    UserService,
    AddressService,
    ReportDefinitionService
} from '../../../../services/services';

import {TofCustomerCard} from '../../common/customerCard';

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
    selector: 'uni-invoice',
    templateUrl: 'app/components/sales/invoice/details/invoice.html'
})
export class InvoiceDetails {
    @ViewChild(RegisterPaymentModal)
    public registerPaymentModal: RegisterPaymentModal;

    @ViewChild(PreviewModal)
    public previewModal: PreviewModal;

    @ViewChild(TofCustomerCard)
    private customerCard: TofCustomerCard;

    @ViewChild(InvoiceItems)
    private invoiceItems: InvoiceItems;

    @ViewChild(SendEmailModal)
    private sendEmailModal: SendEmailModal;

    @Input()
    public invoiceID: any;

    private invoice: CustomerInvoiceExt;
    private itemsSummaryData: TradeHeaderCalculationSummary;
    private summaryFields: ISummaryConfig[];
    private readonly: boolean;

    private tabs: string[] = [];
    private activeTabIndex: number = 0;
    private recalcDebouncer: EventEmitter<CustomerInvoice> = new EventEmitter<CustomerInvoice>();
    private saveActions: IUniSaveAction[] = [];
    private toolbarconfig: IToolbarConfig;
    private contextMenuItems: IContextMenuItem[] = [];

    private customerExpandOptions: string[] = ['Info', 'Info.Addresses', 'Dimensions', 'Dimensions.Project', 'Dimensions.Department'];
    private expandOptions: Array<string> = ['Items', 'Items.Product', 'Items.VatType',
        'Items.Dimensions', 'Items.Dimensions.Project', 'Items.Dimensions.Department',
        'Customer', 'InvoiceReference'].concat(this.customerExpandOptions.map(option => 'Customer.' + option));

    constructor(private customerInvoiceService: CustomerInvoiceService,
                private customerInvoiceItemService: CustomerInvoiceItemService,
                private addressService: AddressService,
                private reportDefinitionService: ReportDefinitionService,
                private businessRelationService: BusinessRelationService,
                private userService: UserService,
                private toastService: ToastService,
                private customerService: CustomerService,
                private numberFormat: NumberFormat,
                private router: Router,
                private route: ActivatedRoute,
                private tabService: TabService,
                private tradeItemHelper: TradeItemHelper) {}

    public ngOnInit() {
        this.tabs = ['Detaljer', 'Levering', 'Dokumenter'];
        this.activeTabIndex = 0;

        this.summaryFields = [
            {title: 'Avgiftsfritt', value: this.numberFormat.asMoney(0)},
            {title: 'Avgiftsgrunnlag', value: this.numberFormat.asMoney(0)},
            {title: 'Sum rabatt', value: this.numberFormat.asMoney(0)},
            {title: 'Nettosum', value: this.numberFormat.asMoney(0)},
            {title: 'Mva', value: this.numberFormat.asMoney(0)},
            {title: 'Øreavrunding', value: this.numberFormat.asMoney(0)},
            {title: 'Totalsum', value: this.numberFormat.asMoney(0)},
        ];

        // Subscribe and debounce recalc on table changes
        this.recalcDebouncer.debounceTime(500).subscribe((invoice) => {
            if (invoice.Items.length) {
                this.recalcItemSums(invoice);
            }
        });

        // contextMenu
        this.contextMenuItems = [
            {
                label: 'Send på epost',
                action: () => {
                    let sendemail = new SendEmail();
                    sendemail.EntityType = 'CustomerInvoice';
                    sendemail.EntityID = this.invoice.ID;
                    sendemail.CustomerID = this.invoice.CustomerID;
                    sendemail.Subject = 'Faktura ' + (this.invoice.InvoiceNumber ? 'nr. ' + this.invoice.InvoiceNumber : 'kladd');
                    sendemail.Message = 'Vedlagt finner du Faktura ' + (this.invoice.InvoiceNumber ? 'nr. ' + this.invoice.InvoiceNumber : 'kladd');
                    this.sendEmailModal.openModal(sendemail);

                    if (this.sendEmailModal.Changed.observers.length === 0) {
                        this.sendEmailModal.Changed.subscribe((email) => {
                            this.reportDefinitionService.generateReportSendEmail('Faktura id', email);
                        });
                    }
                },
                disabled: () => !this.invoice.ID
            }
        ];

        // Subscribe to route param changes and update invoice data
        this.route.params.subscribe((params) => {
            this.invoiceID = +params['id'];
            const customerID = +params['customerID'];

            if (this.invoiceID === 0) {
                return Observable.forkJoin(
                    this.customerInvoiceService.GetNewEntity([], CustomerInvoice.EntityType),
                    this.userService.getCurrentUser(),
                    customerID ? this.customerService.Get(customerID, this.customerExpandOptions) : Observable.of(null)
                ).subscribe((res) => {
                    let invoice = <CustomerInvoiceExt>res[0];
                    const customer = <Customer>res[2]
                    invoice.Customer = customer;
                    invoice.CustomerID = customer.ID;
                    invoice.CustomerName = customer.Info.Name;
                    invoice.InvoiceDate = new Date();
                    invoice.DeliveryDate = new Date();
                    invoice.PaymentDueDate = null; // calculated in refreshInvoice()
                    invoice.OurReference = res[1].DisplayName;
                    this.refreshInvoice(invoice);
                    this.recalcItemSums(invoice);
                });
            } else {
                this.customerInvoiceService.Get(this.invoiceID, this.expandOptions).subscribe((invoice) => {
                    this.refreshInvoice(invoice);
                    this.recalcItemSums(invoice);
                });
            }

        });
    }

    @HostListener('keydown', ['$event'])
    public onKeyDown(event: KeyboardEvent) {
        const key = event.which || event.keyCode;
        if (key === 34) {
            // Page down
            this.invoiceItems.focusFirstRow();
        } else if (key === 33) {
            // Page up
            this.customerCard.focus();
        }
    }

    private getStatustrackConfig() {
        let statustrack: UniStatusTrack.IStatus[] = [];
        let activeStatus = 0;
        if (this.invoice) {
            activeStatus = this.invoice.StatusCode || 1;
        }

        let statuses = [...this.customerInvoiceService.statusTypes];
        const spliceIndex = (activeStatus === StatusCodeCustomerInvoice.PartlyPaid)
            ? statuses.findIndex(st => st.Code === StatusCodeCustomerInvoice.Paid)
            : statuses.findIndex(st => st.Code === StatusCodeCustomerInvoice.PartlyPaid);

        if (spliceIndex >= 0) {
            statuses.splice(spliceIndex, 1);
        }

        statuses.forEach((s, i) => {
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

    private refreshInvoice(invoice: CustomerInvoiceExt) {
        if (!invoice.PaymentDueDate) {
            let dueDate = new Date(invoice.InvoiceDate);
            if (dueDate) {
                dueDate.setDate(dueDate.getDate() + invoice.CreditDays);
                invoice.PaymentDueDate = dueDate;
            }
        }

        this.readonly = invoice.StatusCode && invoice.StatusCode !== StatusCodeCustomerInvoice.Draft;
        this.invoice = _.cloneDeep(invoice);
        this.addressService.setAddresses(this.invoice);
        this.recalcDebouncer.next(invoice);
        this.updateTabTitle();
        this.updateToolbar();
        this.updateSaveActions();
    }

    public onCustomerChange() {
        this.invoice = _.cloneDeep(this.invoice);
    }

    private updateTabTitle() {
        var tabTitle;
        if (this.invoice.InvoiceType === InvoiceTypes.CreditNote) {
            tabTitle = this.invoice.InvoiceNumber ? 'Kreditnotanr. ' + this.invoice.InvoiceNumber : 'Kreditnota (kladd)';
        } else {
            if (this.invoice.InvoiceNumber) {
                tabTitle = 'Fakturanr. ' + this.invoice.InvoiceNumber;
            } else {
                tabTitle = (this.invoice.StatusCode === StatusCodeCustomerInvoice.Draft)
                    ? 'Faktura (kladd)' : 'Ny faktura';
            }
        }
        this.tabService.addTab({ url: '/sales/invoices/' + this.invoice.ID, name: tabTitle, active: true, moduleID: UniModules.Invoices });
    }

    private updateToolbar() {
        let invoiceText = '';
        if (this.invoice.InvoiceNumber) {
            const prefix = this.invoice.InvoiceType === InvoiceTypes.Invoice ? 'Fakturanr.' : 'Kreditnota.';
            invoiceText = `${prefix} ${this.invoice.InvoiceNumber}`;
        }

        let netSumText = 'Netto kr ';
        netSumText += this.itemsSummaryData ? this.itemsSummaryData.SumTotalExVat : this.invoice.TaxInclusiveAmount;

        let toolbarconfig: IToolbarConfig = {
            title: this.invoice.Customer ? (this.invoice.Customer.CustomerNumber + ' - ' + this.invoice.Customer.Info.Name) : this.invoice.CustomerName,
            subheads: [
                {title: invoiceText},
                {title: netSumText},
                {title: GetPrintStatusText(this.invoice.PrintStatus)}
            ],
            statustrack: this.getStatustrackConfig(),
            navigation: {
                prev: this.previousInvoice.bind(this),
                next: this.nextInvoice.bind(this),
                add: () => this.router.navigateByUrl('/sales/invoices/0')
            },
            contextmenu: this.contextMenuItems
        };

        if (this.invoice.InvoiceType === InvoiceTypes.CreditNote && this.invoice.InvoiceReference) {
            toolbarconfig.subheads.push({
                title: `Kreditering av faktura nr. ${this.invoice.InvoiceReference.InvoiceNumber}`,
                link: `#/sales/invoices/${this.invoice.InvoiceReference.ID}`
            });
        }

        this.toolbarconfig = toolbarconfig;
    }

    // Save actions
    private updateSaveActions() {
        this.saveActions = [];

        const payActionDisabled = this.invoice.StatusCode !== StatusCodeCustomerInvoice.Invoiced
            && this.invoice.StatusCode !== StatusCodeCustomerInvoice.PartlyPaid;

        const status = this.invoice.StatusCode;

        this.saveActions.push({
            label: 'Lagre som kladd',
            action: done => this.saveAsDraft(done),
            disabled: status && status !== StatusCodeCustomerInvoice.Draft
        });

        this.saveActions.push({
            label: 'Krediter faktura',
            action: (done) => this.creditInvoice(done),
            disabled: status === StatusCodeCustomerInvoice.Draft
        });

        this.saveActions.push({
            label: (this.invoice.InvoiceType === InvoiceTypes.CreditNote) ? 'Krediter' : 'Fakturer',
            action: done => this.transition(done),
            disabled: (!this.invoice.TaxExclusiveAmount) &&
                (!this.itemsSummaryData || !this.itemsSummaryData.SumTotalIncVat)
        });

        this.saveActions.push({
            label: 'Lagre og skriv ut',
            action: (done) => this.saveAndPrint(done),
            disabled: false
        });

        this.saveActions.push({
            label: 'Registrer betaling',
            action: (done) => this.payInvoice(done),
            disabled: payActionDisabled
        });

        this.saveActions.push({
            label: 'Slett',
            action: (done) => this.deleteInvoice(done),
            disabled: status !== StatusCodeCustomerInvoice.Draft
        });

        // Set main save action
        if (!status || status === StatusCodeCustomerInvoice.Draft) {
            this.saveActions[2].main = true; // transition
        } else {
            if (payActionDisabled) {
                this.saveActions[1].main = true; // credit
            } else {
                this.saveActions[4].main = true; // register payment
            }
        }
    }

    private saveInvoice(refreshOnSuccess?: boolean): Observable<CustomerInvoiceExt> {
        this.invoice.TaxInclusiveAmount = -1; // TODO in AppFramework, does not save main entity if just items have changed

        // Prep new orderlines for complex put
        this.invoice.Items.forEach(item => {
            if (item.Dimensions && item.Dimensions.ID === 0) {
                item.Dimensions['_createguid'] = this.customerInvoiceItemService.getNewGuid();
            }
        });

        if (!TradeItemHelper.IsItemsValid(this.invoice.Items)) {
            const message = 'En eller flere varelinjer mangler produkt';
            this.toastService.addToast(message, ToastType.bad, 10);
            return Observable.throw('message');
        }

        return (this.invoice.ID > 0)
            ? this.customerInvoiceService.Put(this.invoice.ID, this.invoice)
            : this.customerInvoiceService.Post(this.invoice);
    }

    private transition(done: any) {
        const isDraft = this.invoice.ID >= 1;

        const isCreditNote = this.invoice.InvoiceType === InvoiceTypes.CreditNote;
        const doneText = isCreditNote ? 'Faktura kreditert' : 'Faktura fakturert';
        const errText =  isCreditNote ? 'Kreditering feiler' : 'Fakturering feilet';

        this.saveInvoice().subscribe(
            (invoice) => {
                if (!isDraft) {
                    done(doneText);
                    this.router.navigateByUrl('sales/invoices/' + invoice.ID);
                    return;
                }

                this.customerInvoiceService.Transition(invoice.ID, null, 'invoice').subscribe(
                    (res) => {
                        done(doneText);
                        this.customerInvoiceService.Get(this.invoice.ID, this.expandOptions).subscribe((refreshed) => {
                            this.refreshInvoice(refreshed);
                        });
                    },
                    (err) => {
                        done(errText);
                        this.log(err);
                    }
                );
            },
            (err) => {
                done('Noe gikk galt under fakturering');
                this.log(err);
            }
        );
    }

    private saveAsDraft(done) {
        const requiresPageRefresh = !this.invoice.ID;
        if (!this.invoice.StatusCode) {
            this.invoice.StatusCode = StatusCode.Draft; // TODO: replace with enum from salesEnums.ts!
        }

        this.saveInvoice().subscribe(
            (invoice) => {
                if (requiresPageRefresh) {
                    this.router.navigateByUrl('sales/invoices/' + invoice.ID);
                } else {
                    this.customerInvoiceService.Get(invoice.ID, this.expandOptions)
                        .subscribe(res => this.refreshInvoice(res));
                }
                done('Lagring fullført');
            },
            (err) => {
                done('Noe gikk galt under lagring');
                this.log(err);
            }
        );
    }

    private saveAndPrint(done) {
        if (!this.invoice.ID && !this.invoice.StatusCode) {
            this.invoice.StatusCode = StatusCode.Draft;
        }

        this.saveInvoice().subscribe(
            (invoice) => {
                this.reportDefinitionService.getReportByName('Faktura id').subscribe((report) => {
                    this.previewModal.openWithId(report, invoice.ID);
                    done('Lagring fullført');
                });
            },
            (err) => done('Noe gikk galt under lagring')
        );
    }

    private creditInvoice(done) {
        this.customerInvoiceService.createCreditNoteFromInvoice(this.invoice.ID).subscribe(
            (data) => {
                done('Kreditering fullført');
                this.router.navigateByUrl('/sales/invoices/' + data.ID);
            },
            (err) => {
                done('Feil ved kreditering');
                this.log(err);
            }
        );
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
                    done('Betaling registrert');
                    this.customerInvoiceService.Get(this.invoice.ID, this.expandOptions).subscribe((invoice) => {
                        this.refreshInvoice(invoice);
                    });
                }, (err) => {
                    done('Feilet ved registrering av betaling');
                    this.log(err);
                });
            });
        }

        const invoiceData = {
            Amount: this.invoice.RestAmount,
            PaymentDate: new Date()
        };

        this.registerPaymentModal.openModal(this.invoice.ID, title, invoiceData);
    }

    private deleteInvoice(done) {
        this.customerInvoiceService.Remove(this.invoice.ID, null).subscribe(
            (res) => {
                this.router.navigateByUrl('/sales/invoices');
            },
            (err) => {
                done('Noe gikk galt under sletting');
            }
        );
    }

    public nextInvoice() {
        this.customerInvoiceService.getNextID(this.invoice.ID)
            .subscribe((invoiceID) => {
                if (invoiceID) {
                    this.router.navigateByUrl('/sales/invoices/' + invoiceID);
                }
            },
            (err) => {
                console.log('Error getting next invoice: ', err);
                this.toastService.addToast('Ikke flere faktura etter denne', ToastType.warn, 5);
            });
    }

    public previousInvoice() {
        this.customerInvoiceService.getPreviousID(this.invoice.ID)
            .subscribe((invoiceID) => {
                    if (invoiceID) {
                        this.router.navigateByUrl('/sales/invoices/' + invoiceID);
                    }
                },
                (err) => {
                    console.log('Error getting previous invoice: ', err);
                    this.toastService.addToast('Ikke flere faktura før denne', ToastType.warn, 5);
                }
            );
    }

    // Summary
    public recalcItemSums(invoice: CustomerInvoice) {
        if (!invoice || !invoice.Items) {
            return;
        }

        this.itemsSummaryData = this.tradeItemHelper.calculateTradeItemSummaryLocal(invoice.Items);
        this.updateSaveActions();
        this.updateToolbar();

        this.summaryFields = [
            {
                title: 'Avgiftsfritt',
                value: this.numberFormat.asMoney(this.itemsSummaryData.SumNoVatBasis)
            },
            {
                title: 'Avgiftsgrunnlag',
                value: this.numberFormat.asMoney(this.itemsSummaryData.SumVatBasis)
            },
            {
                title: 'Sum rabatt',
                value: this.numberFormat.asMoney(this.itemsSummaryData.SumDiscount)
            },
            {
                title: 'Nettosum',
                value: this.numberFormat.asMoney(this.itemsSummaryData.SumTotalExVat)
            },
            {
                title: 'Mva',
                value: this.numberFormat.asMoney(this.itemsSummaryData.SumVat)
            },
            {
                title: 'Øreavrunding',
                value: this.numberFormat.asMoney(this.itemsSummaryData.DecimalRounding)
            },
            {
                title: 'Totalsum',
                value: this.numberFormat.asMoney(this.itemsSummaryData.SumTotalIncVat)
            },
        ];
    }

    private log(err) {
        err = err.json();
        if (err.Messages) {
            err.Messages.forEach((message) => {
                this.toastService.addToast(message.Message, ToastType.bad, 10);
            });
        } else {
            this.toastService.addToast('Noe gikk galt', ToastType.bad, 10);
        }
    }
}
