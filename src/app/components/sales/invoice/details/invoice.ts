import {Component, Input, ViewChild, EventEmitter} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {Observable} from 'rxjs/Rx';
import {TradeItemHelper} from '../../salesHelper/tradeItemHelper';
import {CustomerInvoiceService, DepartmentService, CustomerInvoiceItemService, BusinessRelationService, UserService} from '../../../../services/services';
import {ProjectService, AddressService, ReportDefinitionService} from '../../../../services/services';
import {CompanySettingsService} from '../../../../services/common/CompanySettingsService';
import {IUniSaveAction} from '../../../../../framework/save/save';
import {CustomerInvoice, Address} from '../../../../unientities';
import {StatusCodeCustomerInvoice} from '../../../../unientities';
import {TradeHeaderCalculationSummary} from '../../../../models/sales/TradeHeaderCalculationSummary';
import {TabService, UniModules} from '../../../layout/navbar/tabstrip/tabService';
import {ToastService, ToastType} from '../../../../../framework/uniToast/toastService';
import {IToolbarConfig} from '../../../common/toolbar/toolbar';
import {UniStatusTrack} from '../../../common/toolbar/statustrack';
import {ISummaryConfig} from '../../../common/summary/summary';

import {PreviewModal} from '../../../reports/modals/preview/previewModal';
import {RegisterPaymentModal} from '../../../common/modals/registerPaymentModal';

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

    @Input()
    public invoiceID: any;

    private invoice: CustomerInvoiceExt;
    private itemsSummaryData: TradeHeaderCalculationSummary;
    private summaryFields: ISummaryConfig[];

    private companySettings: any;
    private departments: any[] = [];
    private projects: any[] = [];

    private tabs: string[] = [];
    private activeTabIndex: number = 0;
    private invoiceButtonText: string = 'Fakturer';
    private creditButtonText: string = 'Krediter faktura';
    private recalcDebouncer: EventEmitter<CustomerInvoice> = new EventEmitter<CustomerInvoice>();
    private saveActions: IUniSaveAction[] = [];
    private toolbarconfig: IToolbarConfig;

    private expandOptions: Array<string> = ['Items', 'Items.Product', 'Items.VatType',
        'Items.Dimensions', 'Items.Dimensions.Project', 'Items.Dimensions.Department',
        'Customer', 'Customer.Info', 'Customer.Info.Addresses', 'Customer.Dimensions', 'Customer.Dimensions.Project', 'Customer.Dimensions.Department', 'InvoiceReference'];


    constructor(private customerInvoiceService: CustomerInvoiceService,
                private customerInvoiceItemService: CustomerInvoiceItemService,
                private departmentService: DepartmentService,
                private projectService: ProjectService,
                private addressService: AddressService,
                private reportDefinitionService: ReportDefinitionService,
                private businessRelationService: BusinessRelationService,
                private companySettingsService: CompanySettingsService,
                private userService: UserService,
                private toastService: ToastService,

                private router: Router,
                private route: ActivatedRoute,
                private tabService: TabService) {}

    public ngOnInit() {
        this.tabs = ['Detaljer', 'Levering', 'Dokumenter'];
        this.activeTabIndex = 0;

        this.summaryFields = [
            {title: 'Avgiftsfritt', value: '0'},
            {title: 'Avgiftsgrunnlag', value: '0'},
            {title: 'Sum rabatt', value: '0'},
            {title: 'Nettosum', value: '0'},
            {title: 'Mva', value: '0'},
            {title: 'Øreavrunding', value: '0'},
            {title: 'Totalsum', value: '0'},
        ];

        // Subscribe and debounce recalc on table changes
        this.recalcDebouncer.debounceTime(1500).subscribe((invoice) => {
            if (invoice.Items.length) {
                this.recalcItemSums(invoice);
            }
        });

        // Get data for subentities once
        Observable.forkJoin(
            this.departmentService.GetAll(null),
            this.projectService.GetAll(null),
            this.companySettingsService.Get(1)
        ).subscribe((response) => {
            this.departments = response[0];
            this.projects = response[1];
            this.companySettings = response[2];
        });

        // Subscribe to route param changes and update invoice data
        this.route.params.subscribe((params) => {
            this.invoiceID = +params['id'];

            if (this.invoiceID === 0) {
                return Observable.forkJoin(
                    this.customerInvoiceService.GetNewEntity([], CustomerInvoice.EntityType),
                    this.userService.getCurrentUser()
                ).subscribe((res) => {
                    let invoice = res[0];
                    invoice.OurReference = res[1].DisplayName;
                    this.refreshInvoice(invoice);
                });
            } else {
                this.customerInvoiceService.Get(this.invoiceID, this.expandOptions).subscribe((res) => {
                    this.refreshInvoice(res);
                });
            }

        });
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

    private refreshInvoice(invoice) {
        this.invoice = invoice;
        this.addressService.setAddresses(this.invoice);
        this.recalcDebouncer.next(invoice);
        this.updateTabTitle();
        this.updateToolbar();
        this.updateSaveActions();

        if (this.invoice.PaymentDueDate === null) {
            let dueDate = new Date(this.invoice.InvoiceDate);
            if (dueDate) {
                dueDate.setDate(dueDate.getDate() + this.invoice.CreditDays);
                this.invoice.PaymentDueDate = dueDate;
            }
        }
    }

    private newInvoice() {
        // copy paste from old invoice component
        this.customerInvoiceService.newCustomerInvoice().then((invoice)  => {
            this.customerInvoiceService.Post(invoice).subscribe((res) => {
                this.router.navigateByUrl('/sales/invoices/' + res.ID);
            });
        });
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

    private updateTabTitle() {
        var tabTitle;
        if (this.invoice.InvoiceType === 1) {
            tabTitle = this.invoice.InvoiceNumber ? 'Kreditnotanr. ' + this.invoice.InvoiceNumber : 'Kreditnota (kladd)';
        } else {
            tabTitle = this.invoice.InvoiceNumber ? 'Fakturanr. ' + this.invoice.InvoiceNumber : 'Faktura (kladd)';
        }
        this.tabService.addTab({ url: '/sales/invoices/' + this.invoice.ID, name: tabTitle, active: true, moduleID: UniModules.Invoices });
    }


    private updateToolbar() {
        let invoiceText = '';
        if (this.invoice.InvoiceNumber) {
            const prefix = this.invoice.InvoiceType === 0 ? 'Fakturanr.' : 'Kreditnota.';
            invoiceText = `${prefix} ${this.invoice.InvoiceNumber}`;
        }

        let netSumText = 'Netto kr ';
        netSumText += this.itemsSummaryData ? this.itemsSummaryData.SumTotalExVat : this.invoice.TaxInclusiveAmount;

        let toolbarconfig: IToolbarConfig = {
            title: this.invoice.Customer ? (this.invoice.Customer.CustomerNumber + ' - ' + this.invoice.Customer.Info.Name) : this.invoice.CustomerName,
            subheads: [
                {title: invoiceText},
                {title: netSumText},
            ],
            statustrack: this.getStatustrackConfig(),
            navigation: {
                prev: this.previousInvoice.bind(this),
                next: this.nextInvoice.bind(this),
                add: () => this.newInvoice.bind(this) //this.router.navigateByUrl('/sales/invoices/0')
            }
        };

        if (this.invoice.InvoiceType === 1 && this.invoice.InvoiceReference) {
            toolbarconfig.subheads.push({
                title: `Kreditering av faktura nr. ${this.invoice.InvoiceReference.InvoiceNumber}`,
                link: `#/sales/invoices/${this.invoice.InvoiceReference.ID}`
            });
        }

        this.toolbarconfig = toolbarconfig;
    }

    // Summary
    public recalcItemSums(invoice: CustomerInvoice) {
        if (!invoice || !invoice.Items) {
            return;
        }

        invoice.Items.forEach((x) => {
            x.PriceIncVat = x.PriceIncVat ? x.PriceIncVat : 0;
            x.PriceExVat = x.PriceExVat ? x.PriceExVat : 0;
            x.CalculateGrossPriceBasedOnNetPrice = x.CalculateGrossPriceBasedOnNetPrice ? x.CalculateGrossPriceBasedOnNetPrice : false;
            x.Discount = x.Discount ? x.Discount : 0;
            x.DiscountPercent = x.DiscountPercent ? x.DiscountPercent : 0;
            x.NumberOfItems = x.NumberOfItems ? x.NumberOfItems : 0;
            x.SumTotalExVat = x.SumTotalExVat ? x.SumTotalExVat : 0;
            x.SumTotalIncVat = x.SumTotalIncVat ? x.SumTotalIncVat : 0;
        });

        this.customerInvoiceService.calculateInvoiceSummary(invoice.Items)
            .subscribe((data) => {
                this.itemsSummaryData = data || {};
                this.updateSaveActions();
                this.updateToolbar();

                this.summaryFields = [
                    {
                        title: 'Avgiftsfritt',
                        value: this.itemsSummaryData.SumNoVatBasis.toString() || '0',
                    },
                    {
                        title: 'Avgiftsgrunnlag',
                        value: this.itemsSummaryData.SumVatBasis.toString() || '0',
                    },
                    {
                        title: 'Sum rabatt',
                        value: this.itemsSummaryData.SumDiscount.toString() || '0',
                    },
                    {
                        title: 'Nettosum',
                        value: this.itemsSummaryData.SumTotalExVat.toString() || '0',
                    },
                    {
                        title: 'Mva',
                        value: this.itemsSummaryData.SumVat.toString() || '0',
                    },
                    {
                        title: 'Øreavrunding',
                        value: this.itemsSummaryData.DecimalRounding.toString() || '0',
                    },
                    {
                        title: 'Totalsum',
                        value: this.itemsSummaryData.SumTotalIncVat.toString() || '0',
                    },
                ];
            },
            (err) => {
                console.log('Error when recalculating items:', err);
                this.log(err);
            }
        );
    }


    // Save actions
    private updateSaveActions() {
        this.saveActions = [];

        // Logic copy-pasted from old invoice component. Needs testing
        const canRunTransition = (this.invoice.TaxExclusiveAmount > 0) ||
            (this.itemsSummaryData && this.itemsSummaryData.SumTotalIncVat > 0);

        const status = this.invoice.StatusCode;

        this.saveActions.push({
            label: 'Lagre',
            action: (done) => {
                this.saveInvoice().subscribe(
                    (invoice) => {
                        this.refreshInvoice(invoice);
                        done('Lagring fullført');
                    },
                    (err) => done('Noe gikk galt under lagring')
                );
            },
            disabled: status && status !== StatusCodeCustomerInvoice.Draft
        });

        this.saveActions.push({
            label: this.creditButtonText,
            action: (done) => this.creditInvoice(done),
            disabled: status === StatusCodeCustomerInvoice.Draft
        });

        this.saveActions.push({
            label: this.invoiceButtonText, // Fakturer eller Krediter
            action: (done) => this.saveInvoiceTransition(done, 'invoice', this.getInvoiceDoneText()),
            disabled: !canRunTransition
        });

        this.saveActions.push({
            label: 'Lagre og skriv ut',
            action: (done) => this.saveAndPrint(done),
            disabled: false
        });

        this.saveActions.push({
            label: 'Registrer betaling',
            action: (done) => this.payInvoice(done),
            disabled: this.isPayActionDisabled()
        });

        this.saveActions.push({
            label: 'Slett',
            action: (done) => this.deleteInvoice(done),
            disabled: true
        });

        // Set main save action
        if (canRunTransition && status !== StatusCodeCustomerInvoice.Invoiced) {
            this.saveActions[2].main = true;
        } else if (!this.isPayActionDisabled()) {
            this.saveActions[4].main = true;
        } else if (status !== StatusCodeCustomerInvoice.Draft) {
            this.saveActions[1].main = true;
        } else {
            this.saveActions[0].main = true;
        }

    }

    private isPayActionDisabled() {
        return this.invoice.StatusCode !== StatusCodeCustomerInvoice.Invoiced
            && this.invoice.StatusCode !== StatusCodeCustomerInvoice.PartlyPaid;
    }

    private getInvoiceDoneText() {
        if (this.invoice.InvoiceType === 1) {
            return 'Kreditnota kreditert';
        }
        return 'Faktura fakturert';
    }

    private saveInvoiceTransition(done: any, transition: string, doneText: string) {
        if (transition === 'invoice' && !this.invoice.DeliveryDate) {
            this.invoice.DeliveryDate = moment();
        }

        this.saveInvoice().subscribe(
            (invoice) => {
                this.refreshInvoice(invoice);
                this.customerInvoiceService.Transition(this.invoice.ID, this.invoice, transition).subscribe(
                    (res) => {
                        done(doneText);
                        this.customerInvoiceService.Get(this.invoice.ID, this.expandOptions).subscribe((invoice1) => {
                            this.refreshInvoice(invoice1);
                        });
                    },
                    (err) => {
                        done('Noe gikk galt under fakturering');
                        this.log(err);
                    }
                );
            },
            (err) => {
                done('Noe gikk galt under lagring');
            }
        );
    }

    private saveInvoice(): Observable<CustomerInvoiceExt> {
        // Transform addresses to flat
        // REVISIT: Are these needed in the new implementation?
        this.addressService.addressToInvoice(this.invoice, this.invoice._InvoiceAddress);
        this.addressService.addressToShipping(this.invoice, this.invoice._ShippingAddress);

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

        // return this.customerInvoiceService.Put(this.invoice.ID, this.invoice);
        return Observable.create((observer) => {
           this.customerInvoiceService.Put(this.invoice.ID, this.invoice).subscribe(
               (res) => {
                   this.customerInvoiceService.Get(this.invoice.ID, this.expandOptions).subscribe((invoice) => {
                       observer.next(invoice);
                       observer.complete();
                   });
                },
               (err) => {
                   observer.error(err);
                   observer.complete();
               }
           );
        });
    }

    private saveAndPrint(done) {
        this.saveInvoice().subscribe(
            (invoice) => {
                this.reportDefinitionService.getReportByName('Faktura Uten Giro').subscribe((report) => {
                    this.previewModal.openWithId(report, invoice.ID);
                    done('Lagring fullført');
                });
            },
            (err) => done('Noe gikk galt under lagring')
        );
    }

    private creditInvoice(done) {
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
                    done('Betaling registrert');
                    this.customerInvoiceService.Get(this.invoice.ID, this.expandOptions).subscribe((invoice) => {
                        this.refreshInvoice(invoice);
                    });
                }, (err) => {
                    console.log('Error registering payment: ', err);
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
        this.toastService.addToast('Slett  - Under construction', ToastType.warn, 5);
        done('Slett faktura avbrutt');
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
