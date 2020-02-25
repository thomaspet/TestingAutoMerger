import { Component, EventEmitter, HostListener, Input, ViewChild, OnInit, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, forkJoin, of as observableOf, throwError, from as observableFrom } from 'rxjs';
import { switchMap, map, take, tap, finalize, flatMap, catchError } from 'rxjs/operators';
import * as moment from 'moment';

import {
    CompanySettings,
    CurrencyCode,
    Customer,
    CustomerInvoice,
    CustomerInvoiceItem,
    Dimensions,
    InvoicePaymentData,
    LocalDate,
    Project,
    Seller,
    StatusCodeCustomerInvoice,
    NumberSeries,
    VatType,
    Department,
    User,
    StatusCodeCustomerInvoiceReminder,
} from '@uni-entities';

import {
    CompanySettingsService,
    CurrencyCodeService,
    CurrencyService,
    CustomerInvoiceItemService,
    CustomerInvoiceReminderService,
    CustomerInvoiceService,
    CustomerService,
    ErrorService,
    NumberFormat,
    ProjectService,
    ReportDefinitionService,
    ReportService,
    StatisticsService,
    JournalEntryService,
    UserService,
    NumberSeriesService,
    SellerService,
    VatTypeService,
    DimensionSettingsService,
    CustomDimensionService,
    DepartmentService,
    PaymentInfoTypeService,
    ModulusService,
    AccrualService,
    createGuid,
    AccountMandatoryDimensionService,
    ElsaPurchaseService
} from '@app/services/services';

import {
    UniModalService,
    UniRegisterPaymentModal,
    ConfirmActions,
    UniConfirmModalV2,
    IModalOptions,
} from '@uni-framework/uni-modal';
import { IUniSaveAction } from '@uni-framework/save/save';
import { ToastService, ToastType, ToastTime } from '@uni-framework/uniToast/toastService';

import { ReportTypeEnum } from '@app/models/reportTypeEnum';
import { InvoiceTypes } from '@app/models/sales/invoiceTypes';
import { TradeHeaderCalculationSummary } from '@app/models/sales/TradeHeaderCalculationSummary';

import { IToolbarConfig, ICommentsConfig, IToolbarSubhead, UniToolbar } from '../../../common/toolbar/toolbar';
import { StatusTrack, IStatus, STATUSTRACK_STATES } from '../../../common/toolbar/statustrack';

import { TabService, UniModules } from '../../../layout/navbar/tabstrip/tabService';

import { TofHead } from '../../common/tofHead';
import { TradeItemTable } from '../../common/tradeItemTable';
import { UniTofSelectModal } from '../../common/tofSelectModal';

import { StatusCode } from '../../salesHelper/salesEnums';
import { TofHelper } from '../../salesHelper/tofHelper';
import { TradeItemHelper, ISummaryLine } from '../../salesHelper/tradeItemHelper';

import { UniReminderSendingModal } from '../../reminder/sending/reminderSendingModal';
import { AccrualModal } from '@app/components/common/modals/accrualModal';

import { cloneDeep } from 'lodash';
import { AprilaOfferModal } from '../modals/aprila-offer/aprila-offer-modal';
import { AprilaCreditNoteModal } from '../modals/aprila-credit-note/aprila-credit-note-modal';
import { SendInvoiceModal } from '../modals/send-invoice-modal/send-invoice-modal';
import { TofReportModal } from '../../common/tof-report-modal/tof-report-modal';

export enum CollectorStatus {
    Reminded = 42501,
    SendtToDebtCollection = 42502,
    FactoringRegistered = 42503,
    SentToFactoring = 42504,
    Completed = 42502
}

@Component({
    selector: 'uni-invoice',
    templateUrl: './invoice.html'
})
export class InvoiceDetails implements OnInit, AfterViewInit {
    @ViewChild(UniToolbar, { static: true }) toolbar: UniToolbar;
    @ViewChild(TofHead, { static: true }) tofHead: TofHead;
    @ViewChild(TradeItemTable, { static: false }) tradeItemTable: TradeItemTable;

    @Input() invoiceID: any;

    private distributeEntityType = 'Models.Sales.CustomerInvoice';
    private isDirty: boolean;
    private itemsSummaryData: TradeHeaderCalculationSummary;
    private numberSeries: NumberSeries[];
    private projectID: number;
    private askedAboutSettingDimensionsOnItems: boolean;

    recalcDebouncer: EventEmitter<any> = new EventEmitter();
    private aprilaOption = {
        hasPermission: false,
        autoSellInvoice: false
    };
    readonly: boolean;
    readonlyDraft: boolean;
    invoice: CustomerInvoice;
    invoiceItems: CustomerInvoiceItem[];
    newInvoiceItem: CustomerInvoiceItem;

    projects: Project[];
    departments: Department[];

    currencyInfo: string;
    summaryLines: ISummaryLine[];

    companySettings: CompanySettings;
    saveActions: IUniSaveAction[] = [];
    toolbarconfig: IToolbarConfig;
    toolbarStatus: IStatus[];
    commentsConfig: ICommentsConfig;

    vatTypes: VatType[];
    currencyCodes: Array<CurrencyCode>;
    currencyCodeID: number;
    currencyExchangeRate: number;
    private currentCustomer: Customer;
    currentUser: User;
    selectConfig: any;
    canSendEHF: boolean = false;

    sellers: Seller[];
    private currentInvoiceDate: LocalDate;
    dimensionTypes: any[];
    paymentInfoTypes: any[];
    distributionPlans: any[];
    reports: any[];
    accountsWithMandatoryDimensionsIsUsed = true;

    isDistributable = false;
    validEHFFileTypes: string[] = ['.csv', '.pdf', '.png', '.jpg', '.xlsx', '.ods'];

    private customerExpands: string[] = [
        'DeliveryTerms',
        'Dimensions',
        'Dimensions.Project',
        'Dimensions.Department',
        'Dimensions.Dimension5',
        'Dimensions.Dimension6',
        'Dimensions.Dimension7',
        'Dimensions.Dimension8',
        'Dimensions.Dimension9',
        'Dimensions.Dimension10',
        'Info',
        'Info.Addresses',
        'Info.DefaultContact.Info',
        'Info.Emails',
        'Info.DefaultEmail',
        'Info.Contacts.Info',
        'PaymentTerms',
        'Sellers',
        'Sellers.Seller',
        'DefaultSeller',
        'Distributions'
    ];

    private invoiceExpands: Array<string> = [
        'Customer',
        'Customer.Info.Contacts.Info',
        'DefaultDimensions',
        'DefaultDimensions.Project',
        'DefaultDimensions.Department',
        'DefaultDimensions.Dimension5',
        'DefaultDimensions.Dimension6',
        'DefaultDimensions.Dimension7',
        'DefaultDimensions.Dimension8',
        'DefaultDimensions.Dimension9',
        'DefaultDimensions.Dimension10',
        'DeliveryTerms',
        'InvoiceReference',
        'JournalEntry',
        'PaymentTerms',
        'Sellers',
        'Sellers.Seller',
        'DefaultSeller',
        'CustomerInvoiceReminders'
    ];

    private invoiceItemExpands: string[] = [
        'Product.VatType',
        'VatType',
        'Account',
        'Account.MandatoryDimensions',
        'Dimensions',
        'Dimensions.Project',
        'Dimensions.Department',
        'Dimensions.Dimension5',
        'Dimensions.Dimension6',
        'Dimensions.Dimension7',
        'Dimensions.Dimension8',
        'Dimensions.Dimension9',
        'Dimensions.Dimension10',
    ];

    constructor(
        private companySettingsService: CompanySettingsService,
        private currencyCodeService: CurrencyCodeService,
        private currencyService: CurrencyService,
        private customerInvoiceItemService: CustomerInvoiceItemService,
        private customerInvoiceReminderService: CustomerInvoiceReminderService,
        private customerInvoiceService: CustomerInvoiceService,
        private customerService: CustomerService,
        private errorService: ErrorService,
        private modalService: UniModalService,
        private numberFormat: NumberFormat,
        private projectService: ProjectService,
        private reportDefinitionService: ReportDefinitionService,
        private reportService: ReportService,
        private router: Router,
        private route: ActivatedRoute,
        private statisticsService: StatisticsService,
        private tabService: TabService,
        private toastService: ToastService,
        private tofHelper: TofHelper,
        private tradeItemHelper: TradeItemHelper,
        private userService: UserService,
        private numberSeriesService: NumberSeriesService,
        private sellerService: SellerService,
        private vatTypeService: VatTypeService,
        private dimensionsSettingsService: DimensionSettingsService,
        private customDimensionService: CustomDimensionService,
        private journalEntryService: JournalEntryService,
        private departmentService: DepartmentService,
        private paymentTypeService: PaymentInfoTypeService,
        private modulusService: ModulusService,
        private accrualService: AccrualService,
        private accountMandatoryDimensionService: AccountMandatoryDimensionService,
        private elsaPurchaseService: ElsaPurchaseService
    ) {
        // set default tab title, this is done to set the correct current module to make the breadcrumb correct
        this.tabService.addTab({
            url: '/sales/invoices/',
            name: 'Faktura',
            active: true,
            moduleID: UniModules.Invoices
        });
    }

    ngOnInit() {
        this.recalcItemSums(null);

        // Subscribe and debounce recalc on table changes
        this.recalcDebouncer.debounceTime(500).subscribe((invoiceItems) => {
            this.recalcItemSums(invoiceItems);
        });

        this.accountMandatoryDimensionService.GetNumberOfAccountsWithMandatoryDimensions().subscribe((result) => {
            this.accountsWithMandatoryDimensionsIsUsed = result > 0;
        });

        // Subscribe to route param changes and update invoice data
        this.route.params.subscribe((params) => {
            this.invoiceID = +params['id'];
            const customerID = +params['customerID'];
            const projectID = +params['projectID'];
            const hasCopyParam = params['copy'];

            this.commentsConfig = {
                entityType: 'CustomerInvoice',
                entityID: !hasCopyParam ? this.invoiceID : 0
            }; 

            if (this.invoiceID === 0) {
                Observable.forkJoin(
                    this.customerInvoiceService.GetNewEntity(['DefaultDimensions'], CustomerInvoice.EntityType),
                    this.userService.getCurrentUser(),
                    customerID
                        ? this.customerService.Get(customerID, this.customerExpands)
                        : Observable.of(null),
                    this.companySettingsService.Get(1),
                    this.currencyCodeService.GetAll(null),
                    projectID ? this.projectService.Get(projectID, null) : Observable.of(null),
                    this.numberSeriesService.GetAll(
                        `filter=NumberSeriesType.Name eq 'Customer Invoice number `
                        + `series' and Empty eq false and Disabled eq false`,
                        ['NumberSeriesType']
                    ),
                    this.projectService.GetAll(null),
                    this.sellerService.GetAll(null),
                    this.vatTypeService.GetVatTypesWithDefaultVatPercent('filter=OutputVat eq true'),
                    this.departmentService.GetAll(null),
                    this.dimensionsSettingsService.GetAll(null),
                    this.paymentTypeService.GetAll(null),
                    this.reportService.getDistributions(this.distributeEntityType),
                    this.reportDefinitionService.GetAll('filter=ReportType eq 1'),
                    this.elsaPurchaseService.getPurchaseByProductName('Aprila fakturasalg').pipe(catchError(() => observableOf(null)))
                ).subscribe((res) => {
                    let invoice = <CustomerInvoice>res[0];
                    this.currentUser = res[1];
                    invoice.OurReference = this.currentUser.DisplayName;
                    if (res[2]) {
                        invoice = this.tofHelper.mapCustomerToEntity(res[2], invoice);
                    }
                    this.companySettings = res[3];

                    this.canSendEHF = this.companySettings.APActivated
                        && this.companySettings.APOutgoing
                        && this.companySettings.APOutgoing.some(format => {
                            return format.Name === 'EHF INVOICE 2.0';
                        });

                    this.currencyCodes = res[4];
                    if (res[5]) {
                        invoice.DefaultDimensions = invoice.DefaultDimensions || new Dimensions();
                        invoice.DefaultDimensions.ProjectID = res[5].ID;
                        invoice.DefaultDimensions.Project = res[5];
                    }
                    this.numberSeries = this.numberSeriesService.CreateAndSet_DisplayNameAttributeOnSeries(res[6]);
                    this.projects = res[7];
                    this.sellers = res[8];
                    this.vatTypes = res[9];
                    this.departments = res[10];
                    this.setUpDims(res[11]);
                    this.paymentInfoTypes = res[12];
                    this.distributionPlans = res[13];
                    this.reports = res[14];
                    this.aprilaOption.hasPermission = !!res[15];

                    if (!!customerID && res[2] && res[2]['Distributions'] && res[2]['Distributions'].CustomerInvoiceDistributionPlanID) {
                        invoice.DistributionPlanID = res[2]['Distributions'].CustomerInvoiceDistributionPlanID;
                    } else if (this.companySettings['Distributions']) {
                        invoice.DistributionPlanID = this.companySettings['Distributions'].CustomerInvoiceDistributionPlanID;
                    }

                    invoice.InvoiceDate = new LocalDate(Date());

                    if (!invoice.CurrencyCodeID) {
                        invoice.CurrencyCodeID = this.companySettings.BaseCurrencyCodeID;
                        invoice.CurrencyExchangeRate = 1;
                    }

                    this.currencyCodeID = invoice.CurrencyCodeID;
                    this.currencyExchangeRate = invoice.CurrencyExchangeRate;

                    if (!invoice.PaymentTerms && !invoice.PaymentDueDate) {
                        invoice.PaymentDueDate = new LocalDate(
                            moment(invoice.InvoiceDate).add(this.companySettings.CustomerCreditDays, 'days').toDate()
                        );
                    } else {
                        this.setPaymentDueDate(invoice);
                    }

                    if (invoice.DeliveryTerms && invoice.DeliveryTerms.CreditDays) {
                        this.setDeliveryDate(invoice);
                    } else {
                        invoice.DeliveryDate = null;
                    }

                    this.selectConfig = this.numberSeriesService.getSelectConfig(
                        this.invoiceID, this.numberSeries, 'Customer Invoice number series'
                    );

                    this.refreshInvoice(invoice);
                    this.recalcItemSums(null);
                    this.tofHead.focus();
                    if (this.accountsWithMandatoryDimensionsIsUsed) {
                        this.tofHead.clearValidationMessage();
                    }
                }, err => this.errorService.handle(err));
            } else {
                Observable.forkJoin(
                    this.getInvoice(this.invoiceID),
                    this.companySettingsService.Get(1, ['APOutgoing']),
                    this.currencyCodeService.GetAll(null),
                    this.projectService.GetAll(null),
                    this.sellerService.GetAll(null),
                    this.vatTypeService.GetVatTypesWithDefaultVatPercent('filter=OutputVat eq true'),
                    this.departmentService.GetAll(null),
                    this.dimensionsSettingsService.GetAll(null),
                    this.paymentTypeService.GetAll(null),
                    this.reportService.getDistributions(this.distributeEntityType),
                    this.reportDefinitionService.GetAll('filter=ReportType eq 1'),
                    this.elsaPurchaseService.getPurchaseByProductName('Aprila fakturasalg').pipe(catchError(() => observableOf(null)))
                ).subscribe((res) => {
                    const invoice = res[0];

                    this.companySettings = res[1];
                    this.currencyCodes = res[2];
                    this.projects = res[3];
                    this.sellers = res[4];
                    this.vatTypes = res[5];
                    this.departments = res[6];
                    this.setUpDims(res[7]);
                    this.paymentInfoTypes = res[8];
                    this.distributionPlans = res[9];
                    this.reports = res[10];
                    this.aprilaOption.hasPermission = !!res[11];
                    if (!invoice.CurrencyCodeID) {
                        invoice.CurrencyCodeID = this.companySettings.BaseCurrencyCodeID;
                        invoice.CurrencyExchangeRate = 1;
                    }

                    this.canSendEHF = this.companySettings.APActivated
                        && this.companySettings.APOutgoing
                        && this.companySettings.APOutgoing.some(format => {
                            return format.Name === 'EHF INVOICE 2.0';
                        });

                    this.currencyCodeID = invoice.CurrencyCodeID;
                    this.currencyExchangeRate = invoice.CurrencyExchangeRate;

                    if (!invoice.PaymentTerms && !invoice.PaymentDueDate) {
                        invoice.PaymentDueDate = new LocalDate(
                            moment(invoice.InvoiceDate).add(this.companySettings.CustomerCreditDays, 'days').toDate()
                        );
                    } else if (!invoice.PaymentDueDate) {
                        this.setPaymentDueDate(invoice);
                    }

                    invoice.DefaultDimensions = invoice.DefaultDimensions || new Dimensions();
                    if (invoice.DefaultDimensions) {
                        this.projectID = invoice.DefaultDimensions.ProjectID;
                    }
                    invoice.DefaultDimensions.Project = this.projects.find(project => project.ID === this.projectID);

                    if (hasCopyParam) {
                        if (!this.currentCustomer && invoice.Customer) {
                            this.currentCustomer = invoice.Customer;
                        }
                        this.refreshInvoice(this.copyInvoice(invoice));
                    } else {
                        this.refreshInvoice(invoice);
                    }
                    this.tofHead.focus();
                    if (this.accountsWithMandatoryDimensionsIsUsed && invoice.CustomerID
                        && invoice.StatusCode < StatusCodeCustomerInvoice.Invoiced) {
                        this.tofHead.getValidationMessage(invoice.CustomerID, invoice.DefaultDimensionsID);
                    }

                    // If the user has activated EHF, and entering an invoice in draft state,
                    // check if the invoice has files with unsupported formats
                    if (this.canSendEHF && invoice.StatusCode === 42001) {
                        this.customerInvoiceService.getFileList(invoice.ID).subscribe((files) => {
                            let hasMisMatch = false;
                            files.forEach(file => {
                                hasMisMatch = !this.validEHFFileTypes.some(type => file.Name.includes(type));
                            });

                            if (hasMisMatch) {
                                this.toastService.addToast('Ugyldig filtype for vedlegg', ToastType.warn, 10,
                                    'Denne fakturakladd har et dokument tilknyttet som ikke er godkjent som vedlegg for EHF, og vil ikke bli ' +
                                    'lagt til som vedlegg om du velger utsendelse via EHF. ' +
                                    'Gyldige formater er CSV, PDF, PNG, JPG, XLSX og ODS.');
                            }
                        });
                    }

                }, err => this.errorService.handle(err));
            }
        }, err => this.errorService.handle(err));
    }

    ngAfterViewInit() {
        this.tofHead.detailsForm.tabbedPastLastField.subscribe((event) => {
            this.tradeItemTable.focusFirstRow();
        });
    }

    private getInvoice(ID: number): Observable<CustomerInvoice> {
        if (!ID) {
            return this.customerInvoiceService.GetNewEntity(
                ['DefaultDimensions'],
                CustomerInvoice.EntityType
            );
        }

        // Get invoice, invoicelines and customer in separate expands
        // to avoid expand hell
        return Observable.forkJoin(
            this.customerInvoiceService.Get(ID, this.invoiceExpands, true),
            this.customerInvoiceItemService.GetAll(
                `filter=CustomerInvoiceID eq ${ID}&hateoas=false`,
                this.invoiceItemExpands
            )
        ).pipe(
            switchMap(res => {
                const invoice: CustomerInvoice = res[0];
                const invoiceItems: CustomerInvoiceItem[] = res[1];

                invoice.Items = invoiceItems;

                if (!invoice.CustomerID) {
                    return observableOf(invoice);
                }

                return this.customerService.Get(invoice.CustomerID, this.customerExpands).pipe(
                    map(customer => {
                        invoice.Customer = customer;
                        return invoice;
                    })
                );
            })
        );
    }

    numberSeriesChange(selectedSerie) {
        this.invoice.InvoiceNumberSeriesID = selectedSerie.ID;
        this.invoice = cloneDeep(this.invoice);
    }

    private getCollectorStatusText(status: CollectorStatus): string {
        let statusText: string = '';
        switch (status) {
            case CollectorStatus.Reminded: {
                statusText = 'Purret';
                break;
            }
            case CollectorStatus.SendtToDebtCollection: {
                statusText = 'Sent til inkasso';
                break;
            }
        }
        return statusText;
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
                Dimension: dim.Dimension,
                IsActive: dim.IsActive,
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

    canDeactivate(): boolean | Observable<boolean> {
        if (this.isDirty) {
            const saveAsDraft = !this.invoice.InvoiceNumber;

            return this.modalService.openUnsavedChangesModal(
                saveAsDraft ? 'Lagre som kladd' : 'Lagre'
            ).onClose.pipe(switchMap(result => {
                if (result === ConfirmActions.ACCEPT) {
                    return this.save(saveAsDraft, false).pipe(map(res => !!res));
                }

                return Observable.of(result !== ConfirmActions.CANCEL);
            }));
        }

        return true;
    }

    onInvoiceChange(invoice: CustomerInvoice) {
        this.isDirty = true;
        let shouldGetCurrencyRate: boolean = false;
        const customerChanged: boolean = this.didCustomerChange(invoice);
        if (customerChanged) {
            if ((!invoice.Customer.ID || invoice.Customer.ID === 0) && invoice.Customer.OrgNumber !== null) {
                this.customerService.getCustomers(invoice.Customer.OrgNumber).subscribe(res => {
                    if (res.Data.length > 0) {
                        let orgNumberUses = 'Det finnes allerede kunde med dette organisasjonsnummeret registrert i UE: <br><br>';
                        res.Data.forEach(function (ba) {
                            orgNumberUses += ba.CustomerNumber + ' ' + ba.Name + ' <br>';
                        });
                        this.toastService.addToast('', ToastType.warn, 60, orgNumberUses);
                    }
                }, err => this.errorService.handle(err));
            }

            if (invoice.Customer.StatusCode === StatusCode.InActive) {
                const options: IModalOptions = { message: 'Vil du aktivere kunden?' };
                this.modalService.open(UniConfirmModalV2, options).onClose.subscribe(res => {
                    if (res === ConfirmActions.ACCEPT) {
                        this.customerService.activateCustomer(invoice.CustomerID).subscribe(
                            response => {
                                invoice.Customer.StatusCode = StatusCode.Active;
                                this.onInvoiceChange(invoice);
                                this.toastService.addToast('Kunde aktivert', ToastType.good);
                            },
                            err => this.errorService.handle(err)
                        );
                    }
                    return;
                });
            }

            if (invoice.PaymentTerms && invoice.PaymentTerms.CreditDays) {
                this.setPaymentDueDate(invoice);
            }
            if (invoice.DeliveryTerms && invoice.DeliveryTerms.CreditDays) {
                this.setDeliveryDate(invoice);
            }

            // update currency code in detailsForm to customer's currency code
            if (invoice.Customer.CurrencyCodeID) {
                invoice.CurrencyCodeID = invoice.Customer.CurrencyCodeID;
            } else {
                invoice.CurrencyCodeID = this.companySettings.BaseCurrencyCodeID;
            }
            shouldGetCurrencyRate = true;
            this.tradeItemTable.setDefaultProjectAndRefreshItems(invoice.DefaultDimensions, true);
            if (this.accountsWithMandatoryDimensionsIsUsed && invoice.CustomerID && invoice.StatusCode < StatusCodeCustomerInvoice.Invoiced) {
                this.tofHead.getValidationMessage(invoice.CustomerID, invoice.DefaultDimensionsID, invoice.DefaultDimensions);
            }
        }

        if (invoice['_updatedFields'] && invoice['_updatedFields'].toString().includes('Dimension')) {
            this.askedAboutSettingDimensionsOnItems = false;
        }

        if (invoice['_updatedField']) {
            this.tradeItemTable.setDefaultProjectAndRefreshItems(invoice.DefaultDimensions, false);
            this.newInvoiceItem = <any>this.tradeItemHelper.getDefaultTradeItemData(invoice);

            const dimension = invoice['_updatedField'].split('.');
            const dimKey = parseInt(dimension[1].substr(dimension[1].length - 3, 1), 10);
            if (!isNaN(dimKey) && dimKey >= 5) {
                this.tradeItemTable.setDimensionOnTradeItems(dimKey, invoice[dimension[0]][dimension[1]], this.askedAboutSettingDimensionsOnItems);
            } else {
                // Project, Department, Region and Reponsibility hits here!
                this.tradeItemTable.setNonCustomDimsOnTradeItems(dimension[1], invoice.DefaultDimensions[dimension[1]], this.askedAboutSettingDimensionsOnItems);
            }
            if (this.accountsWithMandatoryDimensionsIsUsed && invoice.CustomerID && invoice.StatusCode < StatusCodeCustomerInvoice.Invoiced) {
                this.tofHead.getValidationMessage(invoice.CustomerID, null, invoice.DefaultDimensions);
            }

        }

        this.updateCurrency(invoice, shouldGetCurrencyRate);

        this.currentInvoiceDate = invoice.InvoiceDate;
        invoice['_updatedField'] = null;

        if (
            customerChanged && this.currentCustomer &&
            this.currentCustomer['Distributions'] &&
            this.currentCustomer['Distributions'].CustomerInvoiceDistributionPlanID
        ) {
            if (invoice.DistributionPlanID &&
                invoice.DistributionPlanID !== this.currentCustomer['Distributions'].CustomerInvoiceDistributionPlanID) {
                this.modalService.open(UniConfirmModalV2,
                    {
                        header: 'Oppdatere utsendelsesplan?',
                        buttonLabels: {
                            accept: 'Oppdater',
                            reject: 'Ikke oppdater'
                        },
                        message: 'Kunden du har valgt har en annen utsendelsesplan enn den som allerede er valgt for ' +
                            'denne faktura. Ønsker du å oppdatere utsendelsesplanen for denne faktura til å matche kundens?'
                    }
                ).onClose.subscribe((res) => {
                    if (res === ConfirmActions.ACCEPT) {
                        invoice.DistributionPlanID = this.currentCustomer['Distributions'].CustomerInvoiceDistributionPlanID;
                        this.toastService.addToast('Oppdatert', ToastType.good, 5, 'Utsendelsesplan oppdatert');
                        this.invoice = invoice;
                    }
                });
            } else {
                invoice.DistributionPlanID = this.currentCustomer['Distributions'].CustomerInvoiceDistributionPlanID;
            }
        }

        this.invoice = invoice;
        this.updateSaveActions();
    }

    onFreetextChange() {
        // Stupid data flow requires this
        this.invoice = cloneDeep(this.invoice);
        this.isDirty = true;
        this.updateSaveActions();
    }

    private updateCurrency(invoice: CustomerInvoice, getCurrencyRate: boolean) {
        let shouldGetCurrencyRate = getCurrencyRate;

        if (this.currentInvoiceDate.toString() !== invoice.InvoiceDate.toString()) {
            shouldGetCurrencyRate = true;
        }

        // update currency code in detailsForm and tradeItemTable to selected currency code if selected
        // or from customer
        if ((!this.currencyCodeID && invoice.CurrencyCodeID) || this.currencyCodeID !== invoice.CurrencyCodeID) {
            this.currencyCodeID = invoice.CurrencyCodeID;
            this.tradeItemTable.updateAllItemVatCodes(this.currencyCodeID);
            shouldGetCurrencyRate = true;
        }

        if (this.invoice && invoice.CurrencyCodeID !== this.invoice.CurrencyCodeID) {
            shouldGetCurrencyRate = true;
        }

        if ((this.invoice.StatusCode !== null && this.invoice.StatusCode !== 42001) || this.invoice.InvoiceType === InvoiceTypes.CreditNote) {
            shouldGetCurrencyRate = false;
        }

        // If not getting currencyrate, we're done
        if (!shouldGetCurrencyRate) {
            return;
        }

        this.getUpdatedCurrencyExchangeRate(invoice).subscribe(res => {
            const newCurrencyRate = res;

            if (!this.currencyExchangeRate) {
                this.currencyExchangeRate = 1;
            }

            if (newCurrencyRate === this.currencyExchangeRate) {
                return;
            }

            if (newCurrencyRate !== this.currencyExchangeRate) {
                this.currencyExchangeRate = newCurrencyRate;
                invoice.CurrencyExchangeRate = res;

                let askUserWhatToDo: boolean = false;

                let newTotalExVatBaseCurrency: number;
                let diffBaseCurrency: number;
                let diffBaseCurrencyPercent: number;

                const haveUserDefinedPrices = this.invoiceItems && this.invoiceItems.filter(
                    x => x.PriceSetByUser
                ).length > 0;

                if (haveUserDefinedPrices) {
                    // calculate how much the new currency will affect the amount for the base currency,
                    // if it doesnt cause a change larger than 5%, don't bother asking the user what
                    // to do, just use the set prices
                    newTotalExVatBaseCurrency = this.itemsSummaryData.SumTotalExVatCurrency * newCurrencyRate;
                    diffBaseCurrency = Math.abs(newTotalExVatBaseCurrency - this.itemsSummaryData.SumTotalExVat);

                    diffBaseCurrencyPercent =
                        this.tradeItemHelper.round(
                            (diffBaseCurrency * 100) / Math.abs(this.itemsSummaryData.SumTotalExVat), 1
                        );

                    // 5% is set as a limit for asking the user now, but this might need to be reconsidered,
                    // or make it possible to override it either on companysettings, customer, or the TOF header
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
                        + `til ${baseCurrencyCode} ${this.numberFormat.asMoney(newTotalExVatBaseCurrency)}.\n\n`
                        + `Vil du heller rekalkulere valutaprisene basert på ny kurs og standardprisen på varene?`;

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
                            this.invoiceItems.forEach(item => {
                                if (item.PriceSetByUser) {
                                    this.recalcPriceAndSumsBasedOnSetPrices(item, this.currencyExchangeRate);
                                } else {
                                    this.recalcPriceAndSumsBasedOnBaseCurrencyPrices(item, this.currencyExchangeRate);
                                }
                            });
                        } else if (response === ConfirmActions.REJECT) {
                            // we need to calculate the currency amounts based on the original prices
                            // defined in the base currency
                            this.invoiceItems.forEach(item => {
                                this.recalcPriceAndSumsBasedOnBaseCurrencyPrices(item, this.currencyExchangeRate);
                            });
                        }

                        // make unitable update the data after calculations
                        this.invoiceItems = this.invoiceItems.concat();
                        this.recalcItemSums(this.invoiceItems);

                        // update the model
                        this.invoice = cloneDeep(invoice);
                    });

                } else if (this.invoiceItems && this.invoiceItems.length > 0) {
                    // the currencyrate has changed, but not so much that we had to ask the user what to do,
                    // so just make an assumption what to do; recalculated based on set price if user
                    // has defined a price, and by the base currency price if the user has not set a
                    // specific price
                    this.invoiceItems.forEach(item => {
                        if (item.PriceSetByUser) {
                            this.recalcPriceAndSumsBasedOnSetPrices(item, this.currencyExchangeRate);
                        } else {
                            this.recalcPriceAndSumsBasedOnBaseCurrencyPrices(item, this.currencyExchangeRate);
                        }
                    });

                    // make unitable update the data after calculations
                    this.invoiceItems = this.invoiceItems.concat();
                    this.recalcItemSums(this.invoiceItems);

                    // update the model
                    this.invoice = cloneDeep(invoice);
                } else {
                    // update
                    this.recalcItemSums(this.invoiceItems);

                    // update the model
                    this.invoice = cloneDeep(invoice);
                }
            }
        },
            err => this.errorService.handle(err));
    }

    private didCustomerChange(invoice: CustomerInvoice): boolean {
        let change: boolean;

        if (!this.currentCustomer && !invoice.Customer) {
            return false;
        }

        if (!this.currentCustomer && invoice.Customer.ID === 0) {
            change = true;
        }

        if (invoice.Customer && this.currentCustomer) {
            change = invoice.Customer.ID !== this.currentCustomer.ID;
        } else if (invoice.Customer && invoice.Customer.ID) {
            change = true;
        }

        this.currentCustomer = invoice.Customer;
        return change;
    }

    private setPaymentDueDate(invoice: CustomerInvoice) {
        if (invoice.PaymentTerms && invoice.PaymentTerms.CreditDays) {
            invoice.PaymentDueDate = invoice.InvoiceDate;

            if (invoice.PaymentTerms.CreditDays < 0) {
                invoice.PaymentDueDate = new LocalDate(
                    moment(invoice.InvoiceDate).endOf('month').toDate()
                );
            }

            invoice.PaymentDueDate = new LocalDate(
                moment(invoice.PaymentDueDate).add(Math.abs(invoice.PaymentTerms.CreditDays), 'days').toDate()
            );
        }
    }

    private setDeliveryDate(invoice: CustomerInvoice) {
        if (invoice.DeliveryTerms && invoice.DeliveryTerms.CreditDays) {
            invoice.DeliveryDate = invoice.InvoiceDate;

            if (invoice.DeliveryTerms.CreditDays < 0) {
                invoice.DeliveryDate = new LocalDate(moment(invoice.InvoiceDate).endOf('month').toDate());
            }

            invoice.DeliveryDate = new LocalDate(
                moment(invoice.DeliveryDate).add(Math.abs(invoice.DeliveryTerms.CreditDays), 'days').toDate()
            );
        }
    }

    private getUpdatedCurrencyExchangeRate(invoice: CustomerInvoice): Observable<number> {
        // if base currency code is the same a the currency code for the quote, the
        // exchangerate will always be 1 - no point in asking the server about that..
        if (!invoice.CurrencyCodeID || this.companySettings.BaseCurrencyCodeID === invoice.CurrencyCodeID) {
            return Observable.from([1]);
        } else {
            const currencyDate: LocalDate = new LocalDate(invoice.InvoiceDate.toString());

            return this.currencyService.getCurrencyExchangeRate(
                invoice.CurrencyCodeID,
                this.companySettings.BaseCurrencyCodeID,
                currencyDate
            ).map(x => x.ExchangeRate);
        }
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

    private getCollectionSubStatus(colStatus: CollectorStatus): Promise<any> {

        let subStatux: any = null;
        let statusText = '';
        let statusTimeStamp: Date = null;
        const subStatuses: StatusTrack[] = [];

        switch (colStatus) {
            case CollectorStatus.Reminded: {
                return new Promise((resolve, reject) => {
                    this.statisticsService.GetAll(
                        `model=CustomerInvoiceReminder&orderby=CustomerInvoiceReminder.ReminderNumber `
                        + `desc&filter=CustomerInvoiceReminder.CustomerInvoiceID eq ${this.invoiceID}`
                        + `&select=CustomerInvoiceReminder.CreatedAt as Date,CustomerInvoiceReminder.ReminderNumber `
                        + `as ReminderNumber,CustomerInvoiceReminder.DueDate as DueDate `
                    )
                        .map(data => data.Data ? data.Data : [])
                        .subscribe(brdata => {
                            if (brdata && brdata.length > 0) {
                                brdata.forEach(element => {
                                    const pastDue: boolean = new Date(element['DueDate']) < new Date();
                                    const pastDueText = pastDue ? 'forfalt for' : 'forfall om';
                                    statusText = `${element['ReminderNumber']}. purring, `
                                        + `${pastDueText} ${moment(new Date(element['DueDate'])).fromNow()}`;
                                    statusTimeStamp = new Date(element['Date']);
                                    subStatux = {
                                        title: statusText,
                                        state: STATUSTRACK_STATES.Active,
                                        timestamp: statusTimeStamp
                                    };
                                    subStatuses.push(subStatux);
                                });
                                resolve(subStatuses);
                            }
                        }, err => reject(err));
                });
            }

            case CollectorStatus.SendtToDebtCollection: {
                return new Promise((resolve, reject) => {
                    this.statisticsService.GetAll(
                        `model=AuditLog&orderby=AuditLog.CreatedAt desc&filter=AuditLog.EntityID eq `
                        + `${this.invoiceID} and EntityType eq 'CustomerInvoice' and Field eq 'CollectorStatusCode' `
                        + `and NewValue eq '42502'&select=User.DisplayName as Username,Auditlog.CreatedAt as `
                        + `Date&join=AuditLog.CreatedBy eq User.GlobalIdentity `
                    )
                        .map(data => data.Data ? data.Data : [])
                        .subscribe(brdata => {
                            if (brdata && brdata.length > 0) {
                                brdata.forEach(element => {
                                    statusText = `Sent av ${element['Username']} `
                                        + `${moment(new Date(element['Date'])).fromNow()}`;
                                    statusTimeStamp = new Date(element['Date']);
                                    subStatux = {
                                        title: statusText,
                                        state: STATUSTRACK_STATES.Active,
                                        timestamp: statusTimeStamp
                                    };
                                    subStatuses.push(subStatux);
                                });
                                resolve(subStatuses);
                            }
                        }, err => reject(err));
                });
            }
        }
    }

    private setToolbarStatus() {
        if (!this.invoice || !this.invoice.ID) {
            this.toolbarStatus = undefined;
            return;
        }

        const status: IStatus = {
            title: this.customerInvoiceService.getStatusText(this.invoice.StatusCode),
            state: STATUSTRACK_STATES.Active
        };

        if (this.invoice.InvoiceNumber) {
            const pastDueDate = moment(this.invoice.PaymentDueDate).isBefore(moment(), 'days')
                && this.invoice.StatusCode !== StatusCodeCustomerInvoice.Paid
                && this.invoice.StatusCode !== StatusCodeCustomerInvoice.Sold
                && (this.invoice.RestAmount >= 0 || this.invoice.RestAmountCurrency >= 0);

            if (pastDueDate) {
                status.title = 'Forfalt';
                status.class = 'bad';
            }
        }

        this.toolbarStatus = [status];

        if (this.invoice.CollectorStatusCode) {
            const statusText = this.getCollectorStatusText(this.invoice.CollectorStatusCode);
            if (statusText !== '') {
                const debtCollectorStatus: IStatus = {
                    title: statusText,
                    class: 'warn',
                    state: STATUSTRACK_STATES.Active,
                };
                this.getCollectionSubStatus(this.invoice.CollectorStatusCode).then(substatus => {
                    debtCollectorStatus.substatusList = substatus ? substatus : [];
                    this.toolbarStatus = [debtCollectorStatus];
                }).catch(err => {
                    this.errorService.handle(err);
                    this.toolbarStatus = [debtCollectorStatus];
                });
            }
        }
    }

    private refreshInvoice(invoice: CustomerInvoice): void {
        this.isDirty = false;
        invoice = cloneDeep(invoice);

        this.newInvoiceItem = <any>this.tradeItemHelper.getDefaultTradeItemData(invoice);
        this.readonly = (!!invoice.ID && !!invoice.StatusCode && invoice.StatusCode !== StatusCodeCustomerInvoice.Draft)
            || !!invoice.AccrualID;
        this.readonlyDraft = !!invoice.AccrualID;

        this.currentCustomer = invoice.Customer;
        this.currentInvoiceDate = invoice.InvoiceDate;

        this.invoiceItems = invoice.Items.sort((a, b) => a.SortIndex - b.SortIndex);
        this.invoice = invoice;

        this.recalcItemSums(invoice.Items);
        this.updateCurrency(invoice, true);

        if (this.tradeItemTable) {
            this.tradeItemTable.getMandatoryDimensionsReports();
        }

        this.isDistributable = this.tofHelper.isDistributable(
            'CustomerInvoice', this.invoice, this.companySettings, this.distributionPlans
        );

        if (invoice.InvoiceNumber) {
            this.selectConfig = undefined;
        }

        this.updateTab();
        this.updateToolbar();
        this.updateSaveActions();
    }

    private updateTab(invoice?: CustomerInvoice) {
        if (!invoice) {
            invoice = this.invoice;
        }

        const tabTitle = !!invoice.InvoiceNumber
            ? 'Fakturanr. ' + invoice.InvoiceNumber
            : invoice.ID ? 'Faktura (kladd)' : 'Ny faktura';

        this.tabService.addTab({
            url: '/sales/invoices/' + invoice.ID,
            name: tabTitle,
            active: true,
            moduleID: UniModules.Invoices
        });
    }

    private updateToolbar() {
        let invoiceText = '';
        if (this.invoice.InvoiceNumber) {
            const prefix = this.invoice.InvoiceType === InvoiceTypes.Invoice ? 'Fakturanr.' : 'Kreditnota.';
            invoiceText = `${prefix} ${this.invoice.InvoiceNumber}`;
        } else {
            invoiceText = (this.invoice.ID) ? 'Faktura (kladd)' : 'Ny faktura';
        }

        let customerText = '';
        if (this.invoice.Customer && this.invoice.Customer.Info) {
            customerText = `${this.invoice.Customer.CustomerNumber} - ${this.invoice.Customer.Info.Name}`;
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
                + `${this.numberFormat.asMoney(this.invoice.TaxExclusiveAmountCurrency)}`;
            if (baseCurrencyCode !== selectedCurrencyCode) {
                netSumText += ` / ${baseCurrencyCode} ${this.numberFormat.asMoney(this.invoice.TaxExclusiveAmount)}`;
            }
        }

        const toolbarconfig: IToolbarConfig = {
            title: invoiceText,
            subheads: this.getToolbarSubheads(),
            entityID: this.invoiceID,
            entityType: 'CustomerInvoice',
            showSharingStatus: true,
            hideDisabledActions: true,
            navigation: {
                prev: this.previousInvoice.bind(this),
                next: this.nextInvoice.bind(this)
            },
            contextmenu: [{
                label: 'Periodisering',
                action: () => this.accrueInvoice(),
                disabled: () => this.invoice.StatusCode >= StatusCodeCustomerInvoice.Invoiced
            }],
        };

        toolbarconfig.buttons = [{
            class: 'icon-button',
            icon: 'remove_red_eye',
            action: () => this.preview(),
            tooltip: 'Forhåndsvis'
        }];

        if (this.invoice.ID) {
            toolbarconfig.buttons.push({
                label: 'Ny faktura',
                action: () => this.router.navigateByUrl('/sales/invoices/0')
            });
        }

        if (!this.invoice.ID || this.invoice.StatusCode === StatusCodeCustomerInvoice.Draft) {
            toolbarconfig.buttons.push({
                label: 'Lagre kladd',
                action: () => this.save(true)
            });
        }

        this.toolbarconfig = toolbarconfig;
        this.setToolbarStatus();
    }

    private accrueInvoice() {
        const data = {
            accrualAmount: (this.itemsSummaryData && this.itemsSummaryData.SumTotalExVat) || 0,
            accrualStartDate: new LocalDate(this.invoice.InvoiceDate.toString()),
            journalEntryLineDraft: null,
            accrual: null,
            title: 'Periodisering av fakturaen'
        };

        if (this.invoice.ID) {
            if (this.invoice.Accrual) {
                data.accrual = this.invoice.Accrual;
                this.openAccrualModal(data);
            } else {
                const accrual$ = this.invoice.AccrualID
                    ? this.accrualService.Get(this.invoice.AccrualID, ['Periods'])
                    : Observable.of(null);

                accrual$.pipe(take(1)).subscribe(accrual => {
                    data.accrual = accrual;
                    this.openAccrualModal(data);
                });
            }
        } else {
            this.save(true).subscribe(
                () => this.openAccrualModal(data),
                err => this.errorService.handle(err)
            );
        }
    }

    openAccrualModal(data) {
        // Add the accounting lock date to the data object
        if (this.companySettings.AccountingLockedDate) {
            data.AccountingLockedDate = this.companySettings.AccountingLockedDate;
        }
        this.modalService.open(AccrualModal, { data: data }).onClose.subscribe(modalResult => {
            if (modalResult && modalResult.action === 'ok') {
                const accrual = modalResult.model;

                const accrualPUT = accrual.ID
                    ? this.accrualService.Put(accrual.ID, accrual)
                    : this.accrualService.Post(accrual);

                const journalEntryGET = this.invoice.JournalEntryID
                    ? this.journalEntryService.Get(this.invoice.JournalEntryID, ['DraftLines'])
                    : this.customerInvoiceService.createInvoiceJournalEntryDraftAction(this.invoice.ID);

                forkJoin(accrualPUT, journalEntryGET).subscribe(
                    ([savedAccrual, journalEntry]) => {
                        if (journalEntry.DraftLines && journalEntry.DraftLines.length) {
                            this.invoice.AccrualID = savedAccrual.ID;
                            this.invoice.JournalEntryID = journalEntry.ID;
                            journalEntry.DraftLines[0].AccrualID = savedAccrual.ID;

                            forkJoin(
                                this.save(true),
                                this.journalEntryService.Put(journalEntry.ID, journalEntry)
                            ).subscribe(
                                () => {
                                    this.readonlyDraft = true;
                                    this.toastService.addToast('Periodiseringen er oppdatert', ToastType.good, 3);
                                },
                                err => this.errorService.handle(err)
                            );
                        }
                    },
                    err => {
                        this.errorService.handle(err);
                    }
                );
            }
        });
    }

    private nextInvoice() {
        this.customerInvoiceService.getNextID(this.invoice.ID).subscribe(id => {
            if (id) {
                this.router.navigateByUrl('/sales/invoices/' + id);
            } else {
                this.toastService.addToast('Warning', ToastType.warn, 0, 'Ikke flere fakturaer etter denne');
            }
        }, err => this.errorService.handle(err));
    }

    private previousInvoice() {
        this.customerInvoiceService.getPreviousID(this.invoice.ID).subscribe(id => {
            if (id) {
                this.router.navigateByUrl('/sales/invoices/' + id);
            } else {
                this.toastService.addToast('Warning', ToastType.warn, 0, 'Ikke flere fakturaer før denne');
            }
        }, err => this.errorService.handle(err));
    }

    private getToolbarSubheads() {
        if (!this.invoice) {
            return;
        }

        const subheads: IToolbarSubhead[] = [];

        if (this.invoice.DontSendReminders) {
            subheads.push({ title: 'Purrestopp' });
        }

        if (this.invoice.InvoiceType === InvoiceTypes.CreditNote && this.invoice.InvoiceReference) {
            subheads.push({
                title: `Kreditering av faktura nr. ${this.invoice.InvoiceReference.InvoiceNumber}`,
                link: `#/sales/invoices/${this.invoice.InvoiceReference.ID}`
            });
        }

        if (this.invoice.JournalEntry && this.invoice.JournalEntry.JournalEntryNumber) {
            const numberAndYear = this.invoice.JournalEntry.JournalEntryNumber.split('-');
            let url: string = `/#/accounting/transquery?JournalEntryNumber=${numberAndYear[0]}&AccountYear=`;
            if (numberAndYear.length > 1) {
                url += numberAndYear[1];
            } else {
                url += this.invoice.InvoiceDate ? moment(this.invoice.InvoiceDate).year() : moment().year();
            }

            subheads.push({
                title: `Bilagsnr. ${this.invoice.JournalEntry.JournalEntryNumber}`,
                link: url
            });
        }

        if (this.invoice.RestAmountCurrency) {
            subheads.push({
                label: this.invoice.RestAmountCurrency > 0
                    ? 'Restbeløp' : 'Overbetalt beløp',
                title: this.numberFormat.asMoney(Math.abs(this.invoice.RestAmountCurrency))
            });
        }

        return subheads;
    }

    private updateSaveActions() {
        if (!this.invoice) { return; }

        this.saveActions = [];
        const transitions = (this.invoice['_links'] || {}).transitions;
        const id = this.invoice.ID;
        const status = this.invoice.StatusCode;

        if (!this.invoice.InvoiceNumber) {
            this.saveActions.push({
                label: 'Lagre som kladd',
                action: (done) => {
                    this.save(true).subscribe(
                        () => done('Lagring fullført'),
                        err => {
                            this.errorService.handle(err);
                            done('Lagring avbrutt');
                        }
                    );
                },
            });
        } else {
            if (this.isDirty && id) {
                this.saveActions.push({
                    label: 'Lagre endringer',
                    action: (done) => {
                        this.save().subscribe(
                            () => done('Lagring fullført'),
                            err => {
                                this.errorService.handle(err);
                                done('Lagring avbrutt');
                            }
                        );
                    },
                    main: true
                });
            }
        }

        if (this.invoice.InvoiceType === InvoiceTypes.Invoice) {
            this.saveActions.push({
                label: 'Krediter faktura',
                action: (done) => this.creditInvoice(done),
                disabled: !status || status === StatusCodeCustomerInvoice.Draft,
                main: status === StatusCodeCustomerInvoice.Paid && !this.isDirty
            });
        }

        if ((this.invoice.StatusCode === StatusCodeCustomerInvoice.Invoiced
            || this.invoice.StatusCode === StatusCodeCustomerInvoice.PartlyPaid
            || this.invoice.StatusCode === StatusCodeCustomerInvoice.Paid)
            || (this.invoice.InvoiceNumber && this.invoice.InvoiceType === InvoiceTypes.CreditNote)) {
            this.saveActions.push({
                label: this.invoice.InvoiceType === InvoiceTypes.CreditNote ? 'Send kreditnota' : 'Send faktura',
                main: this.invoice.StatusCode === StatusCodeCustomerInvoice.Invoiced,
                action: (done) => {
                    if (this.invoice.DistributionPlanID) {
                        const currentPlan = this.distributionPlans.find(plan => plan.ID === this.invoice.DistributionPlanID);
                        if (currentPlan && (!currentPlan.Elements || !currentPlan.Elements.length)) {
                            this.toastService.addToast('Plan for utsendelse uten sendingsvalg', ToastType.info, 10,
                                'Det er satt en utsendelsesplan som ikke har sendingsvalg. Dette forhindrer at faktura blir sendt. '
                                + 'Fjern denne planen om du ønsker å sende ut faktura.');
                            done('');
                            return;
                        }
                    }
                    this.modalService.open(SendInvoiceModal, {
                        data: this.invoice
                    }).onClose.subscribe(() => {
                        setTimeout(() => {
                            if (this.toolbar) {
                                this.toolbar.refreshSharingStatuses();
                            }
                        }, 500);
                    });

                    done();
                }
            });
        }

        if (this.invoice.StatusCode) {
            const entityLabel = this.invoice.InvoiceType === InvoiceTypes.Invoice ? 'Faktura' : 'Kreditnota';

            this.saveActions.push({
                label: 'Skriv ut / send på epost',
                action: (done) => {
                    this.modalService.open(TofReportModal, {
                        header: 'Skriv ut / send på epost',
                        data: {
                            entityLabel: entityLabel,
                            entityType: 'CustomerInvoice',
                            entity: this.invoice,
                            reportType: ReportTypeEnum.INVOICE,
                        }
                    }).onClose.subscribe(selectedAction => {
                        if (selectedAction) {
                            let printStatus;

                            if (selectedAction === 'print') {
                                printStatus = '200';
                            } else if (selectedAction === 'email') {
                                printStatus = '100';
                            }

                            if (printStatus) {
                                this.customerInvoiceService.setPrintStatus(this.invoice.ID, printStatus).subscribe(
                                    () => {
                                        setTimeout(() => {
                                            if (this.toolbar) {
                                                this.toolbar.refreshSharingStatuses();
                                            }
                                        }, 500);
                                    },
                                    err => console.error(err)
                                );
                            }
                        }
                        done();
                    });
                }
            });
        }

        this.saveActions.push({
            label: (this.invoice.InvoiceType === InvoiceTypes.CreditNote) ? 'Krediter' : 'Fakturer og send',
            action: done => {
                if (this.aprilaOption.hasPermission) {
                    this.aprilaOption.autoSellInvoice = false;
                }
                return this.transition(done);
            },
            disabled: id > 0 && !transitions['invoice'] && !transitions['credit'] || !this.currentCustomer,
            main: !id || (transitions && (transitions['invoice'] || transitions['credit'])),
        });

        if (this.invoice.InvoiceType !== InvoiceTypes.CreditNote) {
            this.saveActions.push({
                label: 'Registrer betaling',
                action: (done) => this.payInvoice(done),
                disabled: !transitions || !transitions['pay'],
                main: id > 0 && transitions['pay'] && !this.isDirty
            });

            this.saveActions.push({
                label: 'Send purring',
                action: (done) => {
                    this.sendReminderAction(done);
                },
                disabled: !this.invoice.InvoiceNumber || (
                    this.invoice.DontSendReminders
                    || this.invoice.StatusCode === StatusCode.Completed
                    || this.invoice.StatusCode === 42004
                )
            });
        }

        this.saveActions.push({
            label: this.invoice.DontSendReminders ? 'Opphev purrestopp' : 'Aktiver purrestopp',
            action: (done) => {
                this.invoice.DontSendReminders = !this.invoice.DontSendReminders;
                this.save().subscribe(
                    () => done(this.invoice.DontSendReminders ? 'Purrestopp aktivert' : 'Purrestopp opphevet'),
                    err => {
                        this.errorService.handle(err);
                        done('Lagring feilet');
                    }
                );
            },
            disabled: !this.invoice.ID || this.invoice.StatusCode === StatusCodeCustomerInvoice.Paid
        });

        this.saveActions.push({
            label: 'Ny basert på',
            action: (done) => {
                this.newBasedOn().then(res => {
                    done('Faktura kopiert');
                }).catch(error => {
                    done(error);
                });
            },
            disabled: false,
        });

        this.saveActions.push({
            label: 'Slett',
            action: (done) => this.deleteInvoice(done),
            disabled: status !== StatusCodeCustomerInvoice.Draft
        });

        if (this.aprilaOption.hasPermission && this.invoice.InvoiceType === InvoiceTypes.Invoice) {
            if (this.invoiceID === 0 || (this.invoice && (!this.invoice.StatusCode || this.invoice.StatusCode === StatusCodeCustomerInvoice.Draft))) {
                this.saveActions.push({
                    label: 'Selg til Aprila',
                    action: (done) => this.sellInvoiceToAprila(done),
                    disabled: !this.currentCustomer
                });
            }
        }
    }

    private openAprilaOfferModal(invoice: CustomerInvoice, done = null) {
        return this.modalService.open(AprilaOfferModal,
            {
                data: {
                    invoiceId: invoice.ID,
                    invoiceNumber: invoice.InvoiceNumber
                },
                closeOnClickOutside: false,
                closeOnEscape: false,
                hideCloseButton: true
            }
        );
    }

    private openAprilaCreditNoteModal(aprilaOrderStatus: string) {
        this.modalService.open(AprilaCreditNoteModal,
            {
                data: {
                    orderStatus: aprilaOrderStatus,
                    invoiceNumber: this.invoice.InvoiceReference.InvoiceNumber,
                    invoiceAmount: this.invoice.InvoiceReference.TaxInclusiveAmountCurrency
                }
            }
        ).onClose.subscribe((res: boolean) => {

        });
    }

    private save(saveAsDraft = false, reloadInvoiceAfterSave = true): Observable<CustomerInvoice> {
        if (saveAsDraft && !this.invoice.StatusCode) {
            this.invoice.StatusCode = StatusCode.Draft;
        }

        this.invoice.Items = this.tradeItemHelper.prepareItemsForSave(this.invoiceItems);
        this.invoice = this.tofHelper.beforeSave(this.invoice);

        if (this.invoice.PaymentDueDate < this.invoice.InvoiceDate) {
            this.toastService.toast({
                title: 'Forfallsdato må være lik eller senere enn fakturadato.',
                type: ToastType.bad,
                duration: 5
            });

            return throwError('');
        }

        const navigateAfterSave = !this.invoice.ID;
        const saveRequest = (this.invoice.ID > 0)
            ? this.customerInvoiceService.Put(this.invoice.ID, this.invoice)
            : this.customerInvoiceService.Post(this.invoice);

        return this.checkCurrencyAndVatBeforeSave().pipe(switchMap(canSave => {
            if (canSave) {
                return saveRequest.pipe(
                    switchMap(res => {
                        this.isDirty = false;
                        if (reloadInvoiceAfterSave) {
                            if (navigateAfterSave) {
                                this.router.navigateByUrl('sales/invoices/' + res.ID);
                                return observableOf(res);
                            } else {
                                return this.getInvoice(this.invoice.ID).pipe(
                                    tap(invoice => this.refreshInvoice(invoice))
                                );
                            }
                        } else {
                            return observableOf(res);
                        }
                    })
                );
            } else {
                return throwError('');
            }
        }));
    }

    private checkCurrencyAndVatBeforeSave(): Observable<boolean> {
        if (this.invoice.CurrencyCodeID !== this.companySettings.BaseCurrencyCodeID) {
            const linesWithVat = this.invoice.Items.filter(x => x.SumVatCurrency > 0);
            if (linesWithVat.length > 0) {
                const modalMessage = 'Er du sikker på at du vil registrere linjer med MVA når det er brukt '
                    + `${this.getCurrencyCode(this.invoice.CurrencyCodeID)} som valuta?`;

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

    private newBasedOn(): Promise<any> {
        return new Promise((resolve, reject) => {
            if (this.invoice.ID) {
                this.router.navigateByUrl('sales/invoices/' + this.invoice.ID + ';copy=true');
                resolve(true);
            } else {
                const config = {
                    service: this.customerInvoiceService,
                    moduleName: 'Invoice',
                    label: 'Fakturanr'
                };

                this.modalService.open(UniTofSelectModal, { data: config }).onClose.subscribe((id: number) => {
                    if (id) {
                        resolve(id);
                        this.router.navigateByUrl('sales/invoices/' + id + ';copy=true');
                    } else {
                        reject('Kopiering avbrutt');
                    }

                });
            }
        });
    }

    private copyInvoice(invoice: CustomerInvoice): CustomerInvoice {
        this.invoiceID = 0;
        invoice.ID = 0;
        invoice.InvoiceNumber = null;
        invoice.InvoiceNumberSeriesID = null;
        invoice.CollectorStatusCode = null;
        invoice.CustomerInvoiceReminders = null;
        invoice.StatusCode = null;
        invoice.PrintStatus = null;
        invoice.DontSendReminders = false;
        invoice.InvoiceDate = new LocalDate();
        invoice.JournalEntry = null;
        invoice.JournalEntryID = null;
        invoice.Payment = null;
        invoice.PaymentID = null;
        invoice.DeliveryDate = null;
        invoice.CreditedAmount = 0;
        invoice.CreditedAmountCurrency = 0;
        invoice.RestAmount = 0;
        invoice.RestAmountCurrency = 0;
        if (invoice.PaymentTerms && invoice.PaymentTerms.CreditDays) {
            this.setPaymentDueDate(invoice);
        } else {
            invoice.PaymentDueDate = new LocalDate(
                moment(invoice.InvoiceDate).add(this.companySettings.CustomerCreditDays, 'days').toDate()
            );
        }
        if (invoice.PaymentInfoTypeID) {
            if (this.paymentInfoTypes.findIndex(x => x.ID === invoice.PaymentInfoTypeID && x.StatusCode === 42000 && !x.Locked) === -1) {
                invoice.PaymentInfoTypeID = null; // Kid innstilling fra original faktura er ikke lenger aktiv
            }
        }
        invoice.InvoiceReferenceID = null;
        invoice.Comment = null;
        delete invoice['_links'];

        invoice.Sellers = invoice.Sellers.map(item => {
            item.CustomerInvoiceID = null;
            return item;
        });

        invoice.Items = invoice.Items.map((item: CustomerInvoiceItem) => {
            item.CustomerInvoiceID = 0;
            item.ID = 0;
            item.StatusCode = null;
            return item;
        });

        if (invoice['CustomValues'] && invoice['CustomValues'].CustomAprilaReferenceID) {
            invoice.UseReportID = null;
            invoice['CustomValues'].CustomAprilaReferenceID = null;
        }

        return (this.refreshInfo(invoice));
    }

    public refreshInfo(invoice: CustomerInvoice): CustomerInvoice {
        if (this.currentCustomer && this.currentCustomer.Info) {
            const info = this.currentCustomer.Info;
            invoice.CustomerName = info.Name;
            if (info.Addresses && info.Addresses.length > 0) {
                let address = info.Addresses[0];
                if (info.InvoiceAddressID) {
                    address = info.Addresses.find(x => x.ID === info.InvoiceAddressID);
                }
                invoice.InvoiceAddressLine1 = address.AddressLine1;
                invoice.InvoiceAddressLine2 = address.AddressLine2;
                invoice.InvoiceAddressLine3 = address.AddressLine3;
                invoice.InvoicePostalCode = address.PostalCode;
                invoice.InvoiceCity = address.City;
                invoice.InvoiceCountry = address.Country;
                invoice.InvoiceCountryCode = address.CountryCode;

                if (info.ShippingAddressID) {
                    address = info.Addresses.find(x => x.ID === info.ShippingAddressID);
                }
                invoice.ShippingAddressLine1 = address.AddressLine1;
                invoice.ShippingAddressLine2 = address.AddressLine2;
                invoice.ShippingAddressLine3 = address.AddressLine3;
                invoice.ShippingPostalCode = address.PostalCode;
                invoice.ShippingCity = address.City;
                invoice.ShippingCountry = address.Country;
                invoice.ShippingCountryCode = address.CountryCode;
            }
        }
        return invoice;
    }

    private transition(done: any) {
        let orgNumberCheck;
        if (this.invoice.Customer.OrgNumber && !this.modulusService.isValidOrgNr(this.invoice.Customer.OrgNumber)) {
            orgNumberCheck = this.modalService.confirm({
                header: 'Bekreft kunde',
                message: `Ugyldig org.nr. '${this.invoice.Customer.OrgNumber}' på kunde. Vil du fortsette?`,
                buttonLabels: {
                    accept: 'Ja',
                    cancel: 'Avbryt'
                }
            }).onClose.pipe(map(res => res === ConfirmActions.ACCEPT));
        } else {
            orgNumberCheck = observableOf(true);
        }

        forkJoin(
            observableFrom(this.checkVatLimitsBeforeSaving()),
            orgNumberCheck
        ).subscribe(([vatOk, orgNumberOk]) => {
            if (!vatOk || !orgNumberOk) {
                done('Lagring avbrutt');
                return;
            }

            const wasDraft = this.invoice.ID >= 1;
            const isCreditNote = this.invoice.InvoiceType === InvoiceTypes.CreditNote;

            const successText = isCreditNote ? 'Faktura kreditert' : 'Faktura fakturert';
            const errorText = isCreditNote ? 'Kreditering feilet' : 'Fakturering feilet';


            this.save(false, false).subscribe(
                invoice => {
                    this.isDirty = false;

                    // If the invoice was a draft we need to run the transition,
                    // if not its already saved as an invoice
                    let transition = wasDraft
                        ? this.customerInvoiceService.Transition(invoice.ID, null, 'invoice')
                        : observableOf(invoice);

                    if (!isCreditNote && invoice['CustomValues'] && invoice['CustomValues'].CustomAprilaReferenceID) {
                        transition = transition.pipe(flatMap(res => {
                            return this.customerInvoiceService.fulfillAprilaOffer(invoice.ID);
                        }));
                    }

                    transition.subscribe(
                        res => {
                            this.getInvoice(invoice.ID).subscribe(updatedInvoice => {
                                this.refreshInvoice(updatedInvoice);
                                done(successText);
                                // Copy paste aprila stuff from old function
                                if (this.aprilaOption.hasPermission) {
                                    if (isCreditNote && res['CustomValues'] && res['CustomValues'].AprilaOrderStatus) {
                                        this.openAprilaCreditNoteModal(res['CustomValues'].AprilaOrderStatus);
                                    }
                                }

                                const onSendingComplete = () => {
                                    setTimeout(() => {
                                        if (this.toolbar) {
                                            this.toolbar.refreshSharingStatuses();
                                        }
                                    }, 500);

                                    if (!wasDraft) {
                                        this.router.navigateByUrl('/sales/invoices/' + updatedInvoice.ID);
                                    }
                                };

                                if (!isCreditNote && !this.aprilaOption.autoSellInvoice) {
                                    if (invoice.DistributionPlanID && this.companySettings.AutoDistributeInvoice) {
                                        const currentPlan = this.distributionPlans
                                            .find(plan => plan.ID === this.invoice.DistributionPlanID);

                                        // Only show sending of invoice if plan has elementtypes
                                        if (currentPlan && currentPlan.Elements && !currentPlan.Elements.length) {
                                            this.toastService.toast({
                                                title: 'Fakturering vellykket. Faktura sendes med valgt utsendingplan.',
                                                type: ToastType.good,
                                                duration: 5
                                            });
                                        }

                                        onSendingComplete();
                                    } else {
                                        if (this.invoice.DistributionPlanID) {
                                            const p = this.distributionPlans.find(plan => plan.ID === this.invoice.DistributionPlanID);
                                            if (p && (!p.Elements || !p.Elements.length)) {
                                                this.toastService.addToast('Plan for utsendelse uten sendingsvalg', ToastType.info, 10,
                                                    'Det er satt en utsendelsesplan som ikke har sendingsvalg. Dette forhindrer at '
                                                    + 'faktura blir sendt. Fjern denne planen om du ønsker å sende ut faktura.');
                                                onSendingComplete();
                                                return;
                                            }
                                        }
                                        this.modalService.open(SendInvoiceModal, {
                                            data: this.invoice
                                        }).onClose.subscribe(() => onSendingComplete());
                                    }
                                } else {
                                    onSendingComplete();
                                }
                            });
                        },
                        err => {
                            this.errorService.handle(err);
                            if (isCreditNote) {
                                const isAprilaInvoice = this.invoice.InvoiceReference &&
                                    this.invoice.InvoiceReference["CustomValues"] &&
                                    this.invoice.InvoiceReference["CustomValues"].CustomAprilaReferenceID;
                                if (isAprilaInvoice) {
                                    this.openAprilaCreditNoteModal('ERROR');
                                }
                            }

                            if (wasDraft) {
                                this.getInvoice(invoice.ID).subscribe(updatedInvoice => {
                                    this.refreshInvoice(updatedInvoice);
                                    done(errorText);
                                });
                            } else {
                                this.router.navigateByUrl('/sales/invoices/' + invoice.ID);
                                done(errorText);
                            }
                        }
                    );
                },
                err => {
                    this.errorService.handle(err);
                    done(errorText);
                }
            );
        });
    }

    private checkVatLimitsBeforeSaving(): Promise<boolean> {
        if (this.companySettings.TaxMandatoryType !== 2) {
            // we are either not using VAT or using it, so no need to do more checks before running invoicing
            return Promise.resolve(true);
        } else if (this.companySettings.TaxMandatoryType === 2) {
            // we are planning to use VAT when a limit is reached, so we need to check if the
            // limit is now reached before running invoicing
            return new Promise(resolve => {
                this.journalEntryService.getTaxableIncomeLast12Months(this.invoice.DeliveryDate || this.invoice.InvoiceDate)
                    .subscribe(existingAmount => {
                        const linesWithVatCode6 =
                            this.invoiceItems.filter(x => x.VatType && x.VatType.VatCode === '6');

                        // income is negative amounts in the journalentries, switch to positive amounts
                        // to make it easier to calculate the values here
                        existingAmount = existingAmount * -1;

                        const sumLinesWithVatCode6 = linesWithVatCode6.reduce((a, b) => {
                            return a + b.SumTotalExVat;
                        }, 0);

                        const sumIncludingThis = existingAmount + sumLinesWithVatCode6;

                        // TODO / TBD: Skal det komme noe varsel ved fakturering hvis ikke mvakode 6 er brukt på fakturaen?

                        if ((existingAmount + sumLinesWithVatCode6) >= this.companySettings.TaxableFromLimit) {
                            let message: string = '';

                            message = `Det er tidligere fakturert totalt kr ${this.numberFormat.asMoney(existingAmount)} ` +
                                `med mva-kode 6. `;

                            if (existingAmount < this.companySettings.TaxableFromLimit) {
                                message += `Denne fakturaen gjør at grensen på kr ` +
                                    `${this.numberFormat.asMoney(this.companySettings.TaxableFromLimit)} som er registrert ` +
                                    `i Firmaoppsett passeres.<br/><br/>`;
                            } else {
                                message += `Dette er over grensen på kr ` +
                                    `${this.numberFormat.asMoney(this.companySettings.TaxableFromLimit)} som er registrert ` +
                                    `i Firmaoppsett.<br/><br/>`;
                            }

                            // add extra message if this invoice is what causes the limit to be passed
                            message += `Det er praktisk å vente med videre fakturering/bokføring av momspliktige inntekter ` +
                                `til etter mva-registreringen er godkjent og man har lagt inn dato for registrering ` +
                                `under Firmaoppsett. "Mva.pliktig" skal da endres til "Avgiftspliktig" under Firmaoppsett.<br/><br/>` +
                                `Må man fakturere/bokføre flere salg etter at grensen er nådd, men før registrering er godkjent, ` +
                                `skal man etter reglene fakturere uten mva, og deretter etterfakturere mva når godkjenning er mottatt.`;

                            return this.modalService.confirm({
                                header: 'Grense for mva nådd',
                                message: message,
                                buttonLabels: {
                                    accept: 'Fortsett fakturering',
                                    cancel: 'Avbryt'
                                }
                            }).onClose.subscribe(modalResponse => {
                                if (modalResponse === ConfirmActions.ACCEPT) {
                                    resolve(true);
                                } else {
                                    resolve(false);
                                }
                            });
                        } else {
                            // the configured limit is not reached yet, run invoicing
                            resolve(true);
                        }
                    });
            });
        } else {
            return Promise.resolve(true);
        }
    }

    private preview() {
        const openPreview = (invoice) => {
            return this.modalService.open(TofReportModal, {
                data: {
                    entityLabel: 'Faktura',
                    entityType: 'CustomerInvoice',
                    entity: invoice,
                    reportType: ReportTypeEnum.INVOICE,
                    hideEmailButton: true,
                    hidePrintButton: true
                }
            }).onClose;
        };

        if (this.isDirty || !this.invoice.ID) {
            const saveAsDraft = !this.invoice.InvoiceNumber;

            return this.save(saveAsDraft).pipe(
                switchMap((invoice) => openPreview(invoice))
            );
        } else {
            return openPreview(this.invoice);
        }
    }

    private sendReminderAction(doneCallback) {
        const sendReminder = () => {
            this.customerInvoiceReminderService.createInvoiceRemindersForInvoicelist([this.invoice.ID]).subscribe(
                reminders => {
                    this.toastService.toast({
                        title: 'Purring opprettet',
                        type: ToastType.good,
                        duration: 5
                    });

                    // Reload invoice so toolbar status etc is updated
                    this.customerInvoiceService.invalidateCache();
                    this.getInvoice(this.invoice.ID).subscribe(
                        invoice => this.refreshInvoice(invoice),
                        () => { }
                    );

                    this.modalService.open(UniReminderSendingModal, { data: reminders });
                    doneCallback();
                },
                () => {
                    doneCallback();
                    this.toastService.toast({
                        title: 'Purring ikke laget',
                        type: ToastType.bad,
                        duration: 5,
                        message: 'Kunne ikke sende purring. Er ikke faktura forfalt enda, eller er maks antall purringer nådd?'
                    });
                }
            );
        };

        this.customerInvoiceReminderService.checkCustomerInvoiceReminders(this.invoice.ID).subscribe((reminderList) => {
            if (reminderList && reminderList.Data && reminderList.Data.length) {
                this.modalService.open(UniConfirmModalV2, {
                    buttonLabels: {
                        accept: 'Kjør ny purring',
                        reject: 'Åpne aktiv purring',
                        cancel: 'Avbryt'
                    },
                    header: 'Faktura har aktiv purring',
                    message: 'Denne faktura har en aktiv purring. Vil du åpne den og sende den på nytt, eller kjøre ny purrejobb?'
                }).onClose.subscribe((result: ConfirmActions) => {
                    if (result === ConfirmActions.ACCEPT) {
                        sendReminder();
                    } else if (result === ConfirmActions.REJECT) {
                        this.modalService.open(UniReminderSendingModal, { data: reminderList.Data });
                        doneCallback();
                    } else {
                        doneCallback();
                    }
                });
            } else {
                sendReminder();
            }
        });
    }

    private creditInvoice(done) {
        this.customerInvoiceService.createCreditNoteFromInvoice(this.invoice.ID).subscribe(
            (data) => {
                done('Kreditkladd opprettet');
                this.router.navigateByUrl('/sales/invoices/' + data.ID);
            },
            (err) => {
                done('Feil ved kreditering');
                this.errorService.handle(err);
            }
        );
    }

    private payInvoice(done) {
        const title = `Register betaling, Kunde-faktura ${this.invoice.InvoiceNumber || ''}, `
            + `${this.invoice.CustomerName || ''}`;

        let amount = this.invoice.RestAmount || 0;
        let amountCurrency = this.invoice.RestAmountCurrency || 0;
        const reminders = this.invoice.CustomerInvoiceReminders || [];

        reminders.forEach(reminder => {
            if (reminder.StatusCode < StatusCodeCustomerInvoiceReminder.Paid) {
                amount += reminder.RestAmount;
                amountCurrency += reminder.RestAmountCurrency;
            }
        });

        const invoicePaymentData = <InvoicePaymentData>{
            Amount: amount,
            AmountCurrency: amountCurrency,
            BankChargeAmount: 0,
            CurrencyCodeID: this.invoice.CurrencyCodeID,
            CurrencyExchangeRate: 0,
            PaymentDate: new LocalDate(Date()),
            AgioAccountID: null,
            BankChargeAccountID: 0,
            AgioAmount: 0,
            PaymentID: null,
            DimensionsID: this.invoice.DefaultDimensionsID
        };

        const paymentModal = this.modalService.open(UniRegisterPaymentModal, {
            header: title,
            data: invoicePaymentData,
            modalConfig: {
                entityName: 'CustomerInvoice',
                customerID: this.currentCustomer.ID,
                currencyCode: this.currencyCodeID ? this.getCurrencyCode(this.currencyCodeID) : '',
                currencyExchangeRate: this.invoice.CurrencyExchangeRate,
            }
        });

        paymentModal.onClose.subscribe((payment) => {
            if (payment) {

                this.customerInvoiceService.ActionWithBody(this.invoice.ID, payment, 'payInvoice').subscribe(
                    res => {
                        done('Betaling vellykket');
                        this.toastService.addToast(
                            'Faktura er betalt. Betalingsnummer: ' + res.JournalEntryNumber,
                            ToastType.good,
                            5
                        );

                        this.getInvoice(this.invoice.ID).subscribe(invoice => {
                            this.refreshInvoice(invoice);
                        });
                    },
                    err => {
                        done('Feilet ved registrering av betaling');
                        this.errorService.handle(err);
                    }
                );
            } else {
                done();
            }
        });
    }

    private deleteInvoice(done) {
        this.customerInvoiceService.Remove(this.invoice.ID, null).subscribe(
            (res) => {
                this.isDirty = false;
                this.router.navigateByUrl('/sales/invoices');
            },
            (err) => {
                this.errorService.handle(err);
                done('Noe gikk galt under sletting');
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

    // Summary
    private recalcItemSums(invoiceItems: CustomerInvoiceItem[] = null) {
        const items = invoiceItems && invoiceItems.filter(line => !line.Deleted);
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
    }

    onTradeItemsChange() {
        setTimeout(() => {
            if (!this.isDirty && this.invoiceItems.some(item => item['_isDirty'])) {
                this.isDirty = true;
            }

            this.invoice.Items = this.invoiceItems;
            this.invoice = cloneDeep(this.invoice);
            this.recalcDebouncer.emit(this.invoiceItems);
        });
    }

    sellInvoiceToAprila(done) {

        if (!this.invoice.Customer.OrgNumber) {
            this.toastService.addToast('Error', ToastType.bad, 0,
                'Kunde må ha org.nr for å kunne selge faktura til Aprila bank');
            done();
            return;
        }

        const currencyCode = this.getCurrencyCode(this.invoice.CurrencyCodeID);
        if (currencyCode !== 'NOK') {
            this.toastService.addToast('Error', ToastType.bad, 0,
                'Valuta må være NOK for å kunne selge faktura til Aprila bank');
            done();
            return;
        }

        if (this.itemsSummaryData.SumTotalIncVatCurrency <= 200) {
            this.toastService.addToast('Error', ToastType.bad, 0,
                'Fakturabeløp må overstige kr 200,- for å selge faktura til Aprila bank');
            done();
            return;
        }

        const isCreditNote = this.invoice.InvoiceType === InvoiceTypes.CreditNote;
        this.invoice['CustomValues'] = {
            CustomAprilaReferenceID: null
        };

        this.save(true).subscribe(
            invoice => {
                if (!isCreditNote) {

                    this.openAprilaOfferModal(invoice, done)
                        .onClose.subscribe((res: any) => {

                            if (res) {
                                if (res.accepted) {
                                    this.getInvoice(invoice.ID).subscribe(inv => {
                                        this.refreshInvoice(inv);
                                        this.transition(done);
                                    });
                                } else {
                                    this.transition(done);
                                }


                            } else { done(); }
                        });
                }
            },
            err => {
                this.errorService.handle(err);
                done('Lagring avbrutt');
            }
        );

    }
}
