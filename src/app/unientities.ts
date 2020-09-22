/* tslint:disable */

export class LocalDate {
    private value: Date;
    public year: number;  // <-- For moment constructor
    public month: number; // <-- For moment constructor
    public day: number;   // <-- For moment constructor
    constructor(value: string | Date = new Date()) {
        if (typeof value === 'string') {
            this.value = new Date(value);
        } else if (Object.prototype.toString.call(value) === '[object Date]') {
            this.value = value
        } else {
            throw new Error(`Can only be initialized with a date or a string! Was: ${value} (${typeof value})`);
        }
        if (isNaN(this.value.getTime())) {
            throw new Error(`The date you supplied is not valid: ${value}`);
        }
        this.year = this.value.getFullYear();
        this.month = this.value.getMonth();
        this.day = this.value.getDate();
    }
    public toJSON(): string {
        const pad = function(x) { return ('00' + x).slice(-2); };
        return this.year + '-' + pad(this.month + 1) + '-' + pad(this.day);
    }
    public toDate(): Date {
        return new Date(this.value.getTime());
    }
    public toString(): string {
        return this.toJSON();
    }
}

export class LocalTime {
    constructor(private value: string) {
        if (!/^\d{2}:\d{2}:\d{2}(\.\d{1,7})?$/.test(this.value)) {
            throw new Error('LocalTime needs to be either on the format'
                + ` 00:00:00 or 00:00:00.000! Was: ${this.value}!`);
        }
    }
    public toJSON() {
        return this.value;
    }
    public toString() {
        return this.value;
    }
}

export class UniEntity {}

export class AuditLog extends UniEntity {
    public static RelativeUrl = 'auditlogs';
    public static EntityType = 'AuditLog';

    public NewValue: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Field: string;
    public Action: string;
    public Transaction: string;
    public EntityType: string;
    public ClientID: string;
    public Deleted: boolean;
    public Verb: string;
    public OldValue: string;
    public EntityID: number;
    public ID: number;
    public UpdatedBy: string;
    public Route: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class WorkBalance extends UniEntity {
    public static RelativeUrl = 'workbalances';
    public static EntityType = 'WorkBalance';

    public Days: number;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Description: string;
    public Minutes: number;
    public BalanceDate: Date;
    public ActualMinutes: number;
    public Deleted: boolean;
    public IsStartBalance: boolean;
    public ID: number;
    public BalanceFrom: Date;
    public ValidFrom: Date;
    public StatusCode: number;
    public UpdatedBy: string;
    public WorkRelationID: number;
    public Balancetype: WorkBalanceTypeEnum;
    public CreatedBy: string;
    public ValidTimeOff: number;
    public ExpectedMinutes: number;
    public _createguid: string;
    public CustomFields: any;
}


export class Worker extends UniEntity {
    public static RelativeUrl = 'workers';
    public static EntityType = 'Worker';

    public UpdatedAt: Date;
    public BusinessRelationID: number;
    public CreatedAt: Date;
    public UserID: number;
    public Deleted: boolean;
    public EmployeeID: number;
    public ID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public Info: BusinessRelation;
    public Relations: Array<WorkRelation>;
    public Employee: Employee;
    public CustomFields: any;
}


export class WorkItem extends UniEntity {
    public static RelativeUrl = 'workitems';
    public static EntityType = 'WorkItem';

    public CustomerID: number;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public WorkTypeID: number;
    public Invoiceable: boolean;
    public DimensionsID: number;
    public Description: string;
    public Minutes: number;
    public CustomerOrderID: number;
    public Deleted: boolean;
    public TransferedToOrder: boolean;
    public WorkItemGroupID: number;
    public PayrollTrackingID: number;
    public LunchInMinutes: number;
    public OrderItemId: number;
    public ID: number;
    public Label: string;
    public StartTime: Date;
    public StatusCode: number;
    public EndTime: Date;
    public Date: Date;
    public UpdatedBy: string;
    public WorkRelationID: number;
    public TransferedToPayroll: boolean;
    public MinutesToOrder: number;
    public CreatedBy: string;
    public PriceExVat: number;
    public _createguid: string;
    public WorkRelation: WorkRelation;
    public Worktype: WorkType;
    public Customer: Customer;
    public CustomerOrder: CustomerOrder;
    public Dimensions: Dimensions;
    public WorkItemGroup: WorkItemGroup;
    public CustomFields: any;
}


export class WorkItemGroup extends UniEntity {
    public static RelativeUrl = 'workitemgroups';
    public static EntityType = 'WorkItemGroup';

    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public ID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public WorkRelationID: number;
    public CreatedBy: string;
    public _createguid: string;
    public WorkRelation: WorkRelation;
    public Items: Array<WorkItem>;
    public CustomFields: any;
}


export class WorkProfile extends UniEntity {
    public static RelativeUrl = 'workprofiles';
    public static EntityType = 'WorkProfile';

    public IsShared: boolean;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public MinutesPerMonth: number;
    public LunchIncluded: boolean;
    public Deleted: boolean;
    public MinutesPerWeek: number;
    public ID: number;
    public Name: string;
    public StatusCode: number;
    public MinutesPerYear: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class WorkRelation extends UniEntity {
    public static RelativeUrl = 'workrelations';
    public static EntityType = 'WorkRelation';

    public UpdatedAt: Date;
    public CreatedAt: Date;
    public CompanyID: number;
    public WorkPercentage: number;
    public Description: string;
    public WorkerID: number;
    public Deleted: boolean;
    public TeamID: number;
    public StartDate: Date;
    public IsPrivate: boolean;
    public ID: number;
    public IsActive: boolean;
    public WorkProfileID: number;
    public CompanyName: string;
    public StatusCode: number;
    public EndTime: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public Worker: Worker;
    public WorkProfile: WorkProfile;
    public Items: Array<WorkItem>;
    public Team: Team;
    public CustomFields: any;
}


export class WorkTimeOff extends UniEntity {
    public static RelativeUrl = 'worktimeoff';
    public static EntityType = 'WorkTimeOff';

    public SystemKey: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public TimeoffType: number;
    public Description: string;
    public ToDate: Date;
    public Deleted: boolean;
    public FromDate: Date;
    public ID: number;
    public IsHalfDay: boolean;
    public RegionKey: string;
    public StatusCode: number;
    public UpdatedBy: string;
    public WorkRelationID: number;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class WorkType extends UniEntity {
    public static RelativeUrl = 'worktypes';
    public static EntityType = 'WorkType';

    public WagetypeNumber: number;
    public UpdatedAt: Date;
    public ProductID: number;
    public CreatedAt: Date;
    public SystemType: WorkTypeEnum;
    public Price: number;
    public Description: string;
    public Deleted: boolean;
    public ID: number;
    public Name: string;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public Product: Product;
    public CustomFields: any;
}


export class BankFile extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'BankFile';

    public Accountnumber: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public FileID: number;
    public SubCompanyID: number;
    public ID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public ParentFileid: number;
    public CreatedBy: string;
    public _createguid: string;
    public File: File;
    public SubCompany: SubCompany;
    public CustomFields: any;
}


export class BatchInvoice extends UniEntity {
    public static RelativeUrl = 'batchinvoices';
    public static EntityType = 'BatchInvoice';

    public Operation: BatchInvoiceOperation;
    public OurRef: string;
    public UpdatedAt: Date;
    public NumberOfBatches: number;
    public NotifyEmail: boolean;
    public CreatedAt: Date;
    public DueDate: LocalDate;
    public SellerID: number;
    public Processed: number;
    public Comment: string;
    public MinAmount: number;
    public Deleted: boolean;
    public ID: number;
    public InvoiceDate: LocalDate;
    public YourRef: string;
    public FreeTxt: string;
    public StatusCode: number;
    public TotalToProcess: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CustomerID: number;
    public _createguid: string;
    public ProjectID: number;
    public Items: Array<BatchInvoiceItem>;
    public CustomFields: any;
}


export class BatchInvoiceItem extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'BatchInvoiceItem';

    public UpdatedAt: Date;
    public CustomerInvoiceID: number;
    public CreatedAt: Date;
    public CommentID: number;
    public BatchInvoiceID: number;
    public CustomerOrderID: number;
    public Deleted: boolean;
    public BatchNumber: number;
    public ID: number;
    public StatusCode: StatusCode;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CustomerID: number;
    public _createguid: string;
    public ProjectID: number;
    public CustomerOrder: CustomerOrder;
    public CustomerInvoice: CustomerInvoice;
    public CustomFields: any;
}


export class CampaignTemplate extends UniEntity {
    public static RelativeUrl = 'campaigntemplate';
    public static EntityType = 'CampaignTemplate';

    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Template: string;
    public Deleted: boolean;
    public ID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public EntityName: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Customer extends UniEntity {
    public static RelativeUrl = 'customers';
    public static EntityType = 'Customer';

    public DefaultDistributionsID: number;
    public EfakturaIdentifier: string;
    public CustomerInvoiceReminderSettingsID: number;
    public UpdatedAt: Date;
    public ReminderEmailAddress: string;
    public BusinessRelationID: number;
    public PaymentTermsID: number;
    public CreatedAt: Date;
    public AvtaleGiro: boolean;
    public DontSendReminders: boolean;
    public AcceptableDelta4CustomerPaymentAccountID: number;
    public GLN: string;
    public DimensionsID: number;
    public DeliveryTermsID: number;
    public SocialSecurityNumber: string;
    public AcceptableDelta4CustomerPayment: number;
    public Localization: string;
    public CustomerNumber: number;
    public OrgNumber: string;
    public Deleted: boolean;
    public SubAccountNumberSeriesID: number;
    public CurrencyCodeID: number;
    public DefaultSellerID: number;
    public IsPrivate: boolean;
    public PeppolAddress: string;
    public DefaultCustomerInvoiceReportID: number;
    public ID: number;
    public EInvoiceAgreementReference: string;
    public FactoringNumber: number;
    public AvtaleGiroNotification: boolean;
    public StatusCode: number;
    public WebUrl: string;
    public DefaultCustomerOrderReportID: number;
    public CustomerNumberKidAlias: string;
    public UpdatedBy: string;
    public CreditDays: number;
    public DefaultCustomerQuoteReportID: number;
    public CreatedBy: string;
    public _createguid: string;
    public Info: BusinessRelation;
    public Distributions: Distributions;
    public PaymentTerms: Terms;
    public DeliveryTerms: Terms;
    public Dimensions: Dimensions;
    public CustomerInvoiceReminderSettings: CustomerInvoiceReminderSettings;
    public CustomerQuotes: Array<CustomerQuote>;
    public CustomerOrders: Array<CustomerOrder>;
    public CustomerInvoices: Array<CustomerInvoice>;
    public CurrencyCode: CurrencyCode;
    public AcceptableDelta4CustomerPaymentAccount: Account;
    public SubAccountNumberSeries: NumberSeries;
    public DefaultSeller: Seller;
    public Sellers: Array<SellerLink>;
    public Companies: Array<SubCompany>;
    public Account: Account;
    public CustomFields: any;
}


export class CustomerInvoice extends UniEntity {
    public static RelativeUrl = 'invoices';
    public static EntityType = 'CustomerInvoice';

    public TaxInclusiveAmount: number;
    public UpdateCurrencyAmountsOnDateChange: boolean;
    public CustomerID: number;
    public RestAmountCurrency: number;
    public PayableRoundingAmount: number;
    public InvoiceAddressLine1: string;
    public OurReference: string;
    public UpdatedAt: Date;
    public PaymentID: string;
    public ShippingAddressLine3: string;
    public Payment: string;
    public TaxExclusiveAmount: number;
    public CustomerPerson: string;
    public PaymentTermsID: number;
    public CreatedAt: Date;
    public ShippingAddressLine1: string;
    public Credited: boolean;
    public CollectorStatusCode: number;
    public PayableRoundingCurrencyAmount: number;
    public VatTotalsAmount: number;
    public ShippingCity: string;
    public DeliveryName: string;
    public InvoiceReceiverName: string;
    public DontSendReminders: boolean;
    public InvoiceNumberSeriesID: number;
    public InvoiceType: number;
    public TaxExclusiveAmountCurrency: number;
    public PaymentInformation: string;
    public DeliveryTermsID: number;
    public Comment: string;
    public DefaultDimensionsID: number;
    public EmailAddress: string;
    public CurrencyExchangeRate: number;
    public InternalNote: string;
    public InvoiceAddressLine3: string;
    public CustomerName: string;
    public SupplierOrgNumber: string;
    public RestAmount: number;
    public CreditedAmountCurrency: number;
    public DeliveryDate: LocalDate;
    public ExternalReference: string;
    public PaymentDueDate: LocalDate;
    public Deleted: boolean;
    public CustomerOrgNumber: string;
    public UseReportID: number;
    public InvoiceNumber: string;
    public BankAccountID: number;
    public YourReference: string;
    public TaxInclusiveAmountCurrency: number;
    public ExternalStatus: number;
    public CurrencyCodeID: number;
    public InvoiceAddressLine2: string;
    public DefaultSellerID: number;
    public PaymentInfoTypeID: number;
    public InvoiceCity: string;
    public AmountRegards: string;
    public ID: number;
    public DeliveryMethod: string;
    public InvoiceCountry: string;
    public InvoiceDate: LocalDate;
    public PaymentTerm: string;
    public AccrualID: number;
    public InvoicePostalCode: string;
    public SalesPerson: string;
    public ShippingPostalCode: string;
    public ShippingCountry: string;
    public FreeTxt: string;
    public JournalEntryID: number;
    public DeliveryTerm: string;
    public ShippingAddressLine2: string;
    public StatusCode: number;
    public CreditedAmount: number;
    public DistributionPlanID: number;
    public Requisition: string;
    public InvoiceReferenceID: number;
    public VatTotalsAmountCurrency: number;
    public UpdatedBy: string;
    public CreditDays: number;
    public InvoiceCountryCode: string;
    public ShippingCountryCode: string;
    public CreatedBy: string;
    public PrintStatus: number;
    public _createguid: string;
    public Payments: Array<Payment>;
    public BankAccount: BankAccount;
    public JournalEntry: JournalEntry;
    public PaymentTerms: Terms;
    public DeliveryTerms: Terms;
    public Customer: Customer;
    public CurrencyCode: CurrencyCode;
    public InvoiceNumberNumberSeries: NumberSeries;
    public Items: Array<CustomerInvoiceItem>;
    public InvoiceReference: CustomerInvoice;
    public DefaultDimensions: Dimensions;
    public Accrual: Accrual;
    public DefaultSeller: Seller;
    public CustomerInvoiceReminders: Array<CustomerInvoiceReminder>;
    public Sellers: Array<SellerLink>;
    public PaymentInfoType: PaymentInfoType;
    public DistributionPlan: DistributionPlan;
    public CustomFields: any;
}


export class CustomerInvoiceItem extends UniEntity {
    public static RelativeUrl = 'invoiceitems';
    public static EntityType = 'CustomerInvoiceItem';

    public PriceExVatCurrency: number;
    public CostPrice: number;
    public UpdatedAt: Date;
    public ProductID: number;
    public CustomerInvoiceID: number;
    public CreatedAt: Date;
    public PriceIncVat: number;
    public ItemSourceID: number;
    public Discount: number;
    public SumTotalIncVatCurrency: number;
    public DimensionsID: number;
    public Comment: string;
    public CurrencyExchangeRate: number;
    public SumVatCurrency: number;
    public SumTotalExVatCurrency: number;
    public NumberOfItems: number;
    public Deleted: boolean;
    public AccountID: number;
    public CurrencyCodeID: number;
    public InvoicePeriodEndDate: LocalDate;
    public SortIndex: number;
    public Unit: string;
    public DiscountPercent: number;
    public ID: number;
    public DiscountCurrency: number;
    public VatPercent: number;
    public SumTotalExVat: number;
    public SumTotalIncVat: number;
    public StatusCode: number;
    public AccountingCost: string;
    public CalculateGrossPriceBasedOnNetPrice: boolean;
    public InvoicePeriodStartDate: LocalDate;
    public UpdatedBy: string;
    public SumVat: number;
    public ItemText: string;
    public CreatedBy: string;
    public PriceExVat: number;
    public VatTypeID: number;
    public PriceSetByUser: boolean;
    public _createguid: string;
    public VatDate: LocalDate;
    public OrderItemId: number;
    public Product: Product;
    public VatType: VatType;
    public Dimensions: Dimensions;
    public Account: Account;
    public CurrencyCode: CurrencyCode;
    public ItemSource: ItemSource;
    public CustomFields: any;
}


export class CustomerInvoiceReminder extends UniEntity {
    public static RelativeUrl = 'invoicereminders';
    public static EntityType = 'CustomerInvoiceReminder';

    public InterestFeeCurrency: number;
    public RestAmountCurrency: number;
    public ReminderFeeCurrency: number;
    public Notified: boolean;
    public UpdatedAt: Date;
    public CustomerInvoiceID: number;
    public CreatedAt: Date;
    public DueDate: LocalDate;
    public DimensionsID: number;
    public ReminderFee: number;
    public EmailAddress: string;
    public InterestFee: number;
    public Title: string;
    public CurrencyExchangeRate: number;
    public Description: string;
    public RunNumber: number;
    public ReminderNumber: number;
    public RestAmount: number;
    public Deleted: boolean;
    public RemindedDate: LocalDate;
    public CurrencyCodeID: number;
    public ID: number;
    public CreatedByReminderRuleID: number;
    public DebtCollectionFee: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public DebtCollectionFeeCurrency: number;
    public CreatedBy: string;
    public _createguid: string;
    public CurrencyCode: CurrencyCode;
    public CustomerInvoice: CustomerInvoice;
    public CreatedByReminderRule: CustomerInvoiceReminderRule;
    public Payments: Array<Payment>;
    public CustomFields: any;
}


export class CustomerInvoiceReminderRule extends UniEntity {
    public static RelativeUrl = 'invoicereminderrules';
    public static EntityType = 'CustomerInvoiceReminderRule';

    public CustomerInvoiceReminderSettingsID: number;
    public MinimumDaysFromDueDate: number;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public UseMaximumLegalReminderFee: boolean;
    public ReminderFee: number;
    public Title: string;
    public Description: string;
    public ReminderNumber: number;
    public Deleted: boolean;
    public ID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreditDays: number;
    public CreatedBy: string;
    public _createguid: string;
    public CustomerInvoiceReminderSettings: CustomerInvoiceReminderSettings;
    public CustomFields: any;
}


export class CustomerInvoiceReminderSettings extends UniEntity {
    public static RelativeUrl = 'invoiceremindersettings';
    public static EntityType = 'CustomerInvoiceReminderSettings';

    public AcceptPaymentWithoutReminderFee: boolean;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public RemindersBeforeDebtCollection: number;
    public MinimumAmountToRemind: number;
    public Deleted: boolean;
    public ID: number;
    public DebtCollectionSettingsID: number;
    public DefaultReminderFeeAccountID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public DebtCollectionSettings: DebtCollectionSettings;
    public DefaultReminderFeeAccount: Account;
    public CustomerInvoiceReminderRules: Array<CustomerInvoiceReminderRule>;
    public CustomFields: any;
}


export class CustomerOrder extends UniEntity {
    public static RelativeUrl = 'orders';
    public static EntityType = 'CustomerOrder';

    public TaxInclusiveAmount: number;
    public UpdateCurrencyAmountsOnDateChange: boolean;
    public CustomerID: number;
    public RestAmountCurrency: number;
    public PayableRoundingAmount: number;
    public InvoiceAddressLine1: string;
    public OurReference: string;
    public UpdatedAt: Date;
    public ShippingAddressLine3: string;
    public TaxExclusiveAmount: number;
    public CustomerPerson: string;
    public PaymentTermsID: number;
    public CreatedAt: Date;
    public ShippingAddressLine1: string;
    public PayableRoundingCurrencyAmount: number;
    public VatTotalsAmount: number;
    public ShippingCity: string;
    public DeliveryName: string;
    public InvoiceReceiverName: string;
    public TaxExclusiveAmountCurrency: number;
    public OrderNumber: number;
    public DeliveryTermsID: number;
    public Comment: string;
    public DefaultDimensionsID: number;
    public EmailAddress: string;
    public CurrencyExchangeRate: number;
    public InternalNote: string;
    public OrderDate: LocalDate;
    public InvoiceAddressLine3: string;
    public ReadyToInvoice: boolean;
    public CustomerName: string;
    public SupplierOrgNumber: string;
    public DeliveryDate: LocalDate;
    public UpdateCurrencyOnToInvoice: boolean;
    public Deleted: boolean;
    public CustomerOrgNumber: string;
    public UseReportID: number;
    public YourReference: string;
    public TaxInclusiveAmountCurrency: number;
    public CurrencyCodeID: number;
    public InvoiceAddressLine2: string;
    public DefaultSellerID: number;
    public PaymentInfoTypeID: number;
    public InvoiceCity: string;
    public ID: number;
    public DeliveryMethod: string;
    public InvoiceCountry: string;
    public PaymentTerm: string;
    public AccrualID: number;
    public InvoicePostalCode: string;
    public SalesPerson: string;
    public ShippingPostalCode: string;
    public ShippingCountry: string;
    public FreeTxt: string;
    public DeliveryTerm: string;
    public ShippingAddressLine2: string;
    public StatusCode: number;
    public DistributionPlanID: number;
    public Requisition: string;
    public VatTotalsAmountCurrency: number;
    public UpdatedBy: string;
    public CreditDays: number;
    public RestExclusiveAmountCurrency: number;
    public InvoiceCountryCode: string;
    public ShippingCountryCode: string;
    public CreatedBy: string;
    public OrderNumberSeriesID: number;
    public PrintStatus: number;
    public _createguid: string;
    public Accrual: Accrual;
    public PaymentTerms: Terms;
    public DeliveryTerms: Terms;
    public DefaultDimensions: Dimensions;
    public Customer: Customer;
    public CurrencyCode: CurrencyCode;
    public OrderNumberNumberSeries: NumberSeries;
    public Items: Array<CustomerOrderItem>;
    public DefaultSeller: Seller;
    public Sellers: Array<SellerLink>;
    public OrderDistributionPlan: DistributionPlan;
    public CustomFields: any;
}


export class CustomerOrderItem extends UniEntity {
    public static RelativeUrl = 'orderitems';
    public static EntityType = 'CustomerOrderItem';

    public PriceExVatCurrency: number;
    public CostPrice: number;
    public UpdatedAt: Date;
    public ProductID: number;
    public CreatedAt: Date;
    public PriceIncVat: number;
    public ItemSourceID: number;
    public Discount: number;
    public SumTotalIncVatCurrency: number;
    public DimensionsID: number;
    public Comment: string;
    public CurrencyExchangeRate: number;
    public SumVatCurrency: number;
    public ReadyToInvoice: boolean;
    public CustomerOrderID: number;
    public SumTotalExVatCurrency: number;
    public NumberOfItems: number;
    public Deleted: boolean;
    public AccountID: number;
    public CurrencyCodeID: number;
    public SortIndex: number;
    public Unit: string;
    public DiscountPercent: number;
    public ID: number;
    public DiscountCurrency: number;
    public VatPercent: number;
    public SumTotalExVat: number;
    public SumTotalIncVat: number;
    public StatusCode: number;
    public CalculateGrossPriceBasedOnNetPrice: boolean;
    public UpdatedBy: string;
    public SumVat: number;
    public ItemText: string;
    public CreatedBy: string;
    public PriceExVat: number;
    public VatTypeID: number;
    public PriceSetByUser: boolean;
    public _createguid: string;
    public VatDate: LocalDate;
    public Product: Product;
    public VatType: VatType;
    public Dimensions: Dimensions;
    public Account: Account;
    public CurrencyCode: CurrencyCode;
    public ItemSource: ItemSource;
    public CustomFields: any;
}


export class CustomerQuote extends UniEntity {
    public static RelativeUrl = 'quotes';
    public static EntityType = 'CustomerQuote';

    public TaxInclusiveAmount: number;
    public UpdateCurrencyAmountsOnDateChange: boolean;
    public CustomerID: number;
    public PayableRoundingAmount: number;
    public InvoiceAddressLine1: string;
    public OurReference: string;
    public UpdatedAt: Date;
    public ShippingAddressLine3: string;
    public TaxExclusiveAmount: number;
    public CustomerPerson: string;
    public PaymentTermsID: number;
    public CreatedAt: Date;
    public ShippingAddressLine1: string;
    public PayableRoundingCurrencyAmount: number;
    public VatTotalsAmount: number;
    public ShippingCity: string;
    public DeliveryName: string;
    public InvoiceReceiverName: string;
    public TaxExclusiveAmountCurrency: number;
    public DeliveryTermsID: number;
    public Comment: string;
    public DefaultDimensionsID: number;
    public QuoteNumberSeriesID: number;
    public EmailAddress: string;
    public CurrencyExchangeRate: number;
    public InternalNote: string;
    public InquiryReference: number;
    public InvoiceAddressLine3: string;
    public CustomerName: string;
    public SupplierOrgNumber: string;
    public DeliveryDate: LocalDate;
    public UpdateCurrencyOnToInvoice: boolean;
    public Deleted: boolean;
    public CustomerOrgNumber: string;
    public UseReportID: number;
    public YourReference: string;
    public TaxInclusiveAmountCurrency: number;
    public ValidUntilDate: LocalDate;
    public CurrencyCodeID: number;
    public InvoiceAddressLine2: string;
    public DefaultSellerID: number;
    public PaymentInfoTypeID: number;
    public InvoiceCity: string;
    public ID: number;
    public UpdateCurrencyOnToOrder: boolean;
    public DeliveryMethod: string;
    public InvoiceCountry: string;
    public PaymentTerm: string;
    public QuoteNumber: number;
    public InvoicePostalCode: string;
    public SalesPerson: string;
    public ShippingPostalCode: string;
    public ShippingCountry: string;
    public FreeTxt: string;
    public DeliveryTerm: string;
    public ShippingAddressLine2: string;
    public StatusCode: number;
    public DistributionPlanID: number;
    public Requisition: string;
    public VatTotalsAmountCurrency: number;
    public UpdatedBy: string;
    public CreditDays: number;
    public InvoiceCountryCode: string;
    public ShippingCountryCode: string;
    public CreatedBy: string;
    public PrintStatus: number;
    public QuoteDate: LocalDate;
    public _createguid: string;
    public PaymentTerms: Terms;
    public DeliveryTerms: Terms;
    public Customer: Customer;
    public CurrencyCode: CurrencyCode;
    public DefaultDimensions: Dimensions;
    public QuoteNumberNumberSeries: NumberSeries;
    public Items: Array<CustomerQuoteItem>;
    public DefaultSeller: Seller;
    public Sellers: Array<SellerLink>;
    public DistributionPlan: DistributionPlan;
    public CustomFields: any;
}


export class CustomerQuoteItem extends UniEntity {
    public static RelativeUrl = 'quoteitems';
    public static EntityType = 'CustomerQuoteItem';

    public PriceExVatCurrency: number;
    public CostPrice: number;
    public UpdatedAt: Date;
    public ProductID: number;
    public CreatedAt: Date;
    public PriceIncVat: number;
    public Discount: number;
    public SumTotalIncVatCurrency: number;
    public DimensionsID: number;
    public Comment: string;
    public CurrencyExchangeRate: number;
    public SumVatCurrency: number;
    public SumTotalExVatCurrency: number;
    public NumberOfItems: number;
    public Deleted: boolean;
    public AccountID: number;
    public CurrencyCodeID: number;
    public SortIndex: number;
    public Unit: string;
    public DiscountPercent: number;
    public ID: number;
    public DiscountCurrency: number;
    public VatPercent: number;
    public SumTotalExVat: number;
    public SumTotalIncVat: number;
    public StatusCode: number;
    public CalculateGrossPriceBasedOnNetPrice: boolean;
    public UpdatedBy: string;
    public SumVat: number;
    public CustomerQuoteID: number;
    public ItemText: string;
    public CreatedBy: string;
    public PriceExVat: number;
    public VatTypeID: number;
    public PriceSetByUser: boolean;
    public _createguid: string;
    public VatDate: LocalDate;
    public Product: Product;
    public VatType: VatType;
    public Dimensions: Dimensions;
    public Account: Account;
    public CurrencyCode: CurrencyCode;
    public CustomFields: any;
}


export class DebtCollectionSettings extends UniEntity {
    public static RelativeUrl = 'debtcollectionsettings';
    public static EntityType = 'DebtCollectionSettings';

    public CustomerInvoiceReminderSettingsID: number;
    public CreditorNumber: number;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public IntegrateWithDebtCollection: boolean;
    public DebtCollectionFormat: number;
    public Deleted: boolean;
    public ID: number;
    public DebtCollectionAutomationID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomerInvoiceReminderSettings: CustomerInvoiceReminderSettings;
    public DebtCollectionAutomation: Array<DebtCollectionAutomation>;
    public CustomFields: any;
}


export class ItemSource extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ItemSource';

    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public ID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public Details: Array<ItemSourceDetail>;
    public CustomFields: any;
}


export class ItemSourceDetail extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ItemSourceDetail';

    public Amount: number;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public ItemSourceID: number;
    public Description: string;
    public Deleted: boolean;
    public ID: number;
    public Tag: string;
    public SourceFK: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public SourceType: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class PaymentInfoType extends UniEntity {
    public static RelativeUrl = 'paymentinfotype';
    public static EntityType = 'PaymentInfoType';

    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public Locked: boolean;
    public ID: number;
    public Name: string;
    public Control: Modulus;
    public StatusCode: number;
    public Type: PaymentInfoTypeEnum;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Length: number;
    public _createguid: string;
    public PaymentInfoTypeParts: Array<PaymentInfoTypePart>;
    public CustomFields: any;
}


export class PaymentInfoTypePart extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'PaymentInfoTypePart';

    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public PaymentInfoTypeID: number;
    public SortIndex: number;
    public ID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Length: number;
    public Part: string;
    public _createguid: string;
    public CustomFields: any;
}


export class RecurringInvoice extends UniEntity {
    public static RelativeUrl = 'recurringinvoices';
    public static EntityType = 'RecurringInvoice';

    public TaxInclusiveAmount: number;
    public UpdateCurrencyAmountsOnDateChange: boolean;
    public CustomerID: number;
    public PayableRoundingAmount: number;
    public InvoiceAddressLine1: string;
    public OurReference: string;
    public Interval: number;
    public UpdatedAt: Date;
    public ShippingAddressLine3: string;
    public Payment: string;
    public TaxExclusiveAmount: number;
    public CustomerPerson: string;
    public PaymentTermsID: number;
    public CreatedAt: Date;
    public ShippingAddressLine1: string;
    public PayableRoundingCurrencyAmount: number;
    public VatTotalsAmount: number;
    public ShippingCity: string;
    public DeliveryName: string;
    public NoCreditDays: boolean;
    public InvoiceReceiverName: string;
    public InvoiceNumberSeriesID: number;
    public TaxExclusiveAmountCurrency: number;
    public PaymentInformation: string;
    public NotifyUser: string;
    public DeliveryTermsID: number;
    public Comment: string;
    public DefaultDimensionsID: number;
    public EmailAddress: string;
    public CurrencyExchangeRate: number;
    public InternalNote: string;
    public InvoiceAddressLine3: string;
    public NotifyWhenRecurringEnds: boolean;
    public CustomerName: string;
    public SupplierOrgNumber: string;
    public DeliveryDate: LocalDate;
    public EndDate: LocalDate;
    public Deleted: boolean;
    public CustomerOrgNumber: string;
    public UseReportID: number;
    public YourReference: string;
    public TaxInclusiveAmountCurrency: number;
    public ProduceAs: RecurringResult;
    public CurrencyCodeID: number;
    public InvoiceAddressLine2: string;
    public DefaultSellerID: number;
    public StartDate: LocalDate;
    public PaymentInfoTypeID: number;
    public InvoiceCity: string;
    public AmountRegards: string;
    public ID: number;
    public DeliveryMethod: string;
    public InvoiceCountry: string;
    public PaymentTerm: string;
    public PreparationDays: number;
    public NextInvoiceDate: LocalDate;
    public InvoicePostalCode: string;
    public NotifyWhenOrdersArePrepared: boolean;
    public SalesPerson: string;
    public ShippingPostalCode: string;
    public ShippingCountry: string;
    public FreeTxt: string;
    public DeliveryTerm: string;
    public ShippingAddressLine2: string;
    public TimePeriod: RecurringPeriod;
    public StatusCode: number;
    public DistributionPlanID: number;
    public Requisition: string;
    public VatTotalsAmountCurrency: number;
    public UpdatedBy: string;
    public CreditDays: number;
    public InvoiceCountryCode: string;
    public ShippingCountryCode: string;
    public CreatedBy: string;
    public PrintStatus: number;
    public MaxIterations: number;
    public _createguid: string;
    public PaymentTerms: Terms;
    public DeliveryTerms: Terms;
    public Customer: Customer;
    public CurrencyCode: CurrencyCode;
    public InvoiceNumberNumberSeries: NumberSeries;
    public Items: Array<RecurringInvoiceItem>;
    public DefaultDimensions: Dimensions;
    public DefaultSeller: Seller;
    public Sellers: Array<SellerLink>;
    public PaymentInfoType: PaymentInfoType;
    public DistributionPlan: DistributionPlan;
    public CustomFields: any;
}


export class RecurringInvoiceItem extends UniEntity {
    public static RelativeUrl = 'recurringinvoiceitems';
    public static EntityType = 'RecurringInvoiceItem';

    public PriceExVatCurrency: number;
    public UpdatedAt: Date;
    public ProductID: number;
    public CreatedAt: Date;
    public PriceIncVat: number;
    public Discount: number;
    public SumTotalIncVatCurrency: number;
    public DimensionsID: number;
    public Comment: string;
    public CurrencyExchangeRate: number;
    public SumVatCurrency: number;
    public RecurringInvoiceID: number;
    public SumTotalExVatCurrency: number;
    public NumberOfItems: number;
    public Deleted: boolean;
    public AccountID: number;
    public TimeFactor: RecurringPeriod;
    public CurrencyCodeID: number;
    public SortIndex: number;
    public Unit: string;
    public DiscountPercent: number;
    public ID: number;
    public DiscountCurrency: number;
    public VatPercent: number;
    public SumTotalExVat: number;
    public PricingSource: PricingSource;
    public SumTotalIncVat: number;
    public StatusCode: number;
    public CalculateGrossPriceBasedOnNetPrice: boolean;
    public ReduceIncompletePeriod: boolean;
    public UpdatedBy: string;
    public SumVat: number;
    public ItemText: string;
    public CreatedBy: string;
    public PriceExVat: number;
    public VatTypeID: number;
    public PriceSetByUser: boolean;
    public _createguid: string;
    public VatDate: LocalDate;
    public Product: Product;
    public VatType: VatType;
    public Dimensions: Dimensions;
    public Account: Account;
    public CurrencyCode: CurrencyCode;
    public CustomFields: any;
}


export class RecurringInvoiceLog extends UniEntity {
    public static RelativeUrl = 'RecurringInvoicelogs';
    public static EntityType = 'RecurringInvoiceLog';

    public InvoiceID: number;
    public IterationNumber: number;
    public UpdatedAt: Date;
    public OrderID: number;
    public CreatedAt: Date;
    public Comment: string;
    public RecurringInvoiceID: number;
    public Deleted: boolean;
    public NotifiedRecurringEnds: boolean;
    public ID: number;
    public InvoiceDate: LocalDate;
    public CreationDate: LocalDate;
    public StatusCode: number;
    public UpdatedBy: string;
    public NotifiedOrdersPrepared: boolean;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Seller extends UniEntity {
    public static RelativeUrl = 'sellers';
    public static EntityType = 'Seller';

    public UpdatedAt: Date;
    public CreatedAt: Date;
    public DefaultDimensionsID: number;
    public UserID: number;
    public Deleted: boolean;
    public EmployeeID: number;
    public TeamID: number;
    public ID: number;
    public Name: string;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public User: User;
    public Employee: Employee;
    public Team: Team;
    public DefaultDimensions: Dimensions;
    public CustomFields: any;
}


export class SellerLink extends UniEntity {
    public static RelativeUrl = 'sellerlinks';
    public static EntityType = 'SellerLink';

    public CustomerID: number;
    public Amount: number;
    public Percent: number;
    public UpdatedAt: Date;
    public CustomerInvoiceID: number;
    public CreatedAt: Date;
    public SellerID: number;
    public RecurringInvoiceID: number;
    public CustomerOrderID: number;
    public Deleted: boolean;
    public ID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public CustomerQuoteID: number;
    public CreatedBy: string;
    public _createguid: string;
    public Seller: Seller;
    public CustomFields: any;
}


export class SubCompany extends UniEntity {
    public static RelativeUrl = 'subcompanies';
    public static EntityType = 'SubCompany';

    public CustomerID: number;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public CompanyID: number;
    public CompanyType: CompanyRelation;
    public Deleted: boolean;
    public ID: number;
    public CompanyName: string;
    public StatusCode: number;
    public UpdatedBy: string;
    public CompanyKey: string;
    public CreatedBy: string;
    public _createguid: string;
    public Customer: Customer;
    public CustomFields: any;
}


export class Supplier extends UniEntity {
    public static RelativeUrl = 'suppliers';
    public static EntityType = 'Supplier';

    public UpdatedAt: Date;
    public BusinessRelationID: number;
    public CreatedAt: Date;
    public GLN: string;
    public DimensionsID: number;
    public SupplierNumber: number;
    public SelfEmployed: boolean;
    public Localization: string;
    public OrgNumber: string;
    public Deleted: boolean;
    public SubAccountNumberSeriesID: number;
    public CurrencyCodeID: number;
    public CostAllocationID: number;
    public PeppolAddress: string;
    public ID: number;
    public StatusCode: number;
    public WebUrl: string;
    public UpdatedBy: string;
    public CreditDays: number;
    public CreatedBy: string;
    public _createguid: string;
    public Info: BusinessRelation;
    public Dimensions: Dimensions;
    public CurrencyCode: CurrencyCode;
    public SubAccountNumberSeries: NumberSeries;
    public CostAllocation: CostAllocation;
    public CustomFields: any;
}


export class Terms extends UniEntity {
    public static RelativeUrl = 'terms';
    public static EntityType = 'Terms';

    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Description: string;
    public Deleted: boolean;
    public ID: number;
    public Name: string;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreditDays: number;
    public CreatedBy: string;
    public TermsType: TermsType;
    public _createguid: string;
    public CustomFields: any;
}


export class TOFCurrencySettings extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'TOFCurrencySettings';

    public UpdatedAt: Date;
    public CreatedAt: Date;
    public UpdateCurrencyAmountsOnQuoteToOrder: boolean;
    public UpdateCurrencyAmountsOnInvoicedateChange: boolean;
    public Deleted: boolean;
    public UpdateCurrencyAmountsOnQuotedateChange: boolean;
    public UpdateCurrencyAmountsOnOrderdateChange: boolean;
    public UpdateCurrencyAmountsOnQuoteToInvoice: boolean;
    public ID: number;
    public StatusCode: number;
    public UpdateCurrencyAmountsOnOrderToInvoice: boolean;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Address extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Address';

    public UpdatedAt: Date;
    public BusinessRelationID: number;
    public CreatedAt: Date;
    public AddressLine1: string;
    public AddressLine3: string;
    public PostalCode: string;
    public AddressLine2: string;
    public CountryCode: string;
    public Deleted: boolean;
    public Region: string;
    public City: string;
    public Country: string;
    public ID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public BusinessRelation: BusinessRelation;
    public CustomFields: any;
}


export class BusinessRelation extends UniEntity {
    public static RelativeUrl = 'business-relations';
    public static EntityType = 'BusinessRelation';

    public ShippingAddressID: number;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public DefaultEmailID: number;
    public DefaultBankAccountID: number;
    public Deleted: boolean;
    public ID: number;
    public Name: string;
    public DefaultContactID: number;
    public DefaultPhoneID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public InvoiceAddressID: number;
    public _createguid: string;
    public DefaultContact: Contact;
    public Contacts: Array<Contact>;
    public Addresses: Array<Address>;
    public Phones: Array<Phone>;
    public Emails: Array<Email>;
    public BankAccounts: Array<BankAccount>;
    public InvoiceAddress: Address;
    public ShippingAddress: Address;
    public DefaultPhone: Phone;
    public DefaultEmail: Email;
    public DefaultBankAccount: BankAccount;
    public CustomFields: any;
}


export class Contact extends UniEntity {
    public static RelativeUrl = 'contacts';
    public static EntityType = 'Contact';

    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Comment: string;
    public Deleted: boolean;
    public InfoID: number;
    public ID: number;
    public ParentBusinessRelationID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public Role: string;
    public CreatedBy: string;
    public _createguid: string;
    public ParentBusinessRelation: BusinessRelation;
    public Info: BusinessRelation;
    public CustomFields: any;
}


export class Email extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Email';

    public UpdatedAt: Date;
    public BusinessRelationID: number;
    public CreatedAt: Date;
    public EmailAddress: string;
    public Description: string;
    public Deleted: boolean;
    public ID: number;
    public StatusCode: number;
    public Type: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Phone extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Phone';

    public UpdatedAt: Date;
    public BusinessRelationID: number;
    public CreatedAt: Date;
    public CountryCode: string;
    public Description: string;
    public Deleted: boolean;
    public Number: string;
    public ID: number;
    public StatusCode: number;
    public Type: PhoneTypeEnum;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class AGACalculation extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AGACalculation';

    public PayrollRunID: number;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public DimensionsID: number;
    public Deleted: boolean;
    public ID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public freeAmountUsed: Array<FreeAmountUsed>;
    public agaTax: Array<AGATax>;
    public agaDraw: Array<AGADraw>;
    public agaPension: Array<AGAPension>;
    public foreignerWithPercent: Array<ForeignerWithPercent>;
    public drawForeignerWithPercent: Array<DrawForeignerWithPercent>;
    public foreignerWithAmount: Array<ForeignerWithAmount>;
    public payrollRun: PayrollRun;
    public Dimensions: Dimensions;
    public CustomFields: any;
}


export class FreeAmountUsed extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'FreeAmountUsed';

    public UpdatedAt: Date;
    public AGACalculationID: number;
    public CreatedAt: Date;
    public SubEntityID: number;
    public Deleted: boolean;
    public ID: number;
    public StatusCode: number;
    public freeAmount: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public subEntity: SubEntity;
    public CustomFields: any;
}


export class AGATax extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AGATax';

    public UpdatedAt: Date;
    public AGACalculationID: number;
    public CreatedAt: Date;
    public beregningsKode: number;
    public zone: number;
    public agaRate: number;
    public SubEntityID: number;
    public Deleted: boolean;
    public agaBase: number;
    public ID: number;
    public AGARateID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public zoneName: string;
    public municipalityName: string;
    public subEntity: SubEntity;
    public CustomFields: any;
}


export class AGAPension extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AGAPension';

    public UpdatedAt: Date;
    public AGACalculationID: number;
    public CreatedAt: Date;
    public beregningsKode: number;
    public zone: number;
    public agaRate: number;
    public SubEntityID: number;
    public Deleted: boolean;
    public agaBase: number;
    public ID: number;
    public AGARateID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public zoneName: string;
    public municipalityName: string;
    public subEntity: SubEntity;
    public CustomFields: any;
}


export class AGADraw extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AGADraw';

    public UpdatedAt: Date;
    public AGACalculationID: number;
    public CreatedAt: Date;
    public beregningsKode: number;
    public zone: number;
    public agaRate: number;
    public SubEntityID: number;
    public Deleted: boolean;
    public agaBase: number;
    public ID: number;
    public AGARateID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public zoneName: string;
    public municipalityName: string;
    public subEntity: SubEntity;
    public CustomFields: any;
}


export class ForeignerWithPercent extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ForeignerWithPercent';

    public UpdatedAt: Date;
    public AGACalculationID: number;
    public CreatedAt: Date;
    public agaRate: number;
    public SubEntityID: number;
    public Deleted: boolean;
    public agaBase: number;
    public ID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public zoneName: string;
    public municipalityName: string;
    public subEntity: SubEntity;
    public CustomFields: any;
}


export class DrawForeignerWithPercent extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'DrawForeignerWithPercent';

    public UpdatedAt: Date;
    public AGACalculationID: number;
    public CreatedAt: Date;
    public agaRate: number;
    public SubEntityID: number;
    public Deleted: boolean;
    public agaBase: number;
    public ID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public zoneName: string;
    public municipalityName: string;
    public subEntity: SubEntity;
    public CustomFields: any;
}


export class ForeignerWithAmount extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ForeignerWithAmount';

    public UpdatedAt: Date;
    public AGACalculationID: number;
    public CreatedAt: Date;
    public persons: number;
    public aga: number;
    public SubEntityID: number;
    public Deleted: boolean;
    public ID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public zoneName: string;
    public municipalityName: string;
    public subEntity: SubEntity;
    public CustomFields: any;
}


export class TaxAndAgaSums extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'TaxAndAgaSums';

    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public WithholdingTax: number;
    public ID: number;
    public FinancialTax: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public GarnishmentTax: number;
    public _createguid: string;
    public CustomFields: any;
}


export class AmeldingData extends UniEntity {
    public static RelativeUrl = 'amelding';
    public static EntityType = 'AmeldingData';

    public PayrollRunID: number;
    public mainFileID: number;
    public created: Date;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public OppgaveHash: string;
    public messageID: string;
    public replacesID: number;
    public altinnStatus: string;
    public status: number;
    public receiptID: number;
    public sent: Date;
    public Deleted: boolean;
    public period: number;
    public ID: number;
    public feedbackFileID: number;
    public StatusCode: number;
    public attachmentFileID: number;
    public type: AmeldingType;
    public initiated: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public year: number;
    public _createguid: string;
    public replaceThis: string;
    public xmlValidationErrors: string;
    public log: Array<AmeldingLog>;
    public CustomFields: any;
}


export class AmeldingLog extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AmeldingLog';

    public UpdatedAt: Date;
    public CreatedAt: Date;
    public key: number;
    public registry: SalaryRegistry;
    public Deleted: boolean;
    public AmeldingsID: number;
    public ID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class BasicAmount extends UniEntity {
    public static RelativeUrl = 'basicamounts';
    public static EntityType = 'BasicAmount';

    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public FromDate: Date;
    public ID: number;
    public ConversionFactor: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public BasicAmountPrMonth: number;
    public CreatedBy: string;
    public BasicAmountPrYear: number;
    public AveragePrYear: number;
    public _createguid: string;
    public CustomFields: any;
}


export class CompanySalary extends UniEntity {
    public static RelativeUrl = 'companysalary';
    public static EntityType = 'CompanySalary';

    public HoursPerMonth: number;
    public WagetypeAdvancePaymentAuto: number;
    public WageDeductionDueToHoliday: WageDeductionDueToHolidayType;
    public OtpExportActive: boolean;
    public Base_Svalbard: boolean;
    public MainAccountAllocatedFinancialVacation: number;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Base_NettoPayment: boolean;
    public RateFinancialTax: number;
    public MainAccountCostAGA: number;
    public MainAccountCostVacation: number;
    public MainAccountCostAGAVacation: number;
    public MainAccountAllocatedAGAVacation: number;
    public InterrimRemitAccount: number;
    public MainAccountAllocatedAGA: number;
    public MainAccountCostFinancialVacation: number;
    public Base_JanMayenAndBiCountries: boolean;
    public MainAccountAllocatedVacation: number;
    public Deleted: boolean;
    public Base_NettoPaymentForMaritim: boolean;
    public PostToTaxDraw: boolean;
    public PostGarnishmentToTaxAccount: boolean;
    public MainAccountCostFinancial: number;
    public MainAccountAllocatedFinancial: number;
    public ID: number;
    public PaymentInterval: CompanySalaryPaymentInterval;
    public Base_TaxFreeOrganization: boolean;
    public HourFTEs: number;
    public StatusCode: number;
    public Base_SpesialDeductionForMaritim: boolean;
    public FreeAmount: number;
    public WagetypeAdvancePayment: number;
    public UpdatedBy: string;
    public AllowOver6G: boolean;
    public CreatedBy: string;
    public Base_PayAsYouEarnTaxOnPensions: boolean;
    public CalculateFinancialTax: boolean;
    public PaycheckZipReportID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class CompanyVacationRate extends UniEntity {
    public static RelativeUrl = 'companyvacationrates';
    public static EntityType = 'CompanyVacationRate';

    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public FromDate: Date;
    public ID: number;
    public StatusCode: number;
    public Rate: number;
    public Rate60: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class EmployeeCategory extends UniEntity {
    public static RelativeUrl = 'employeecategories';
    public static EntityType = 'EmployeeCategory';

    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public ID: number;
    public Name: string;
    public StatusCode: number;
    public EmployeeCategoryLinkID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class EmployeeCategoryLink extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'EmployeeCategoryLink';

    public UpdatedAt: Date;
    public CreatedAt: Date;
    public EmployeeCategoryID: number;
    public Deleted: boolean;
    public EmployeeID: number;
    public ID: number;
    public StatusCode: number;
    public EmployeeNumber: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public EmployeeCategory: EmployeeCategory;
    public Employee: Employee;
    public CustomFields: any;
}


export class Employee extends UniEntity {
    public static RelativeUrl = 'employees';
    public static EntityType = 'Employee';

    public EmploymentDateOtp: LocalDate;
    public FreeText: string;
    public MunicipalityNo: string;
    public UpdatedAt: Date;
    public BusinessRelationID: number;
    public CreatedAt: Date;
    public InternasjonalIDType: InternationalIDType;
    public InternasjonalIDCountry: string;
    public Sex: GenderEnum;
    public OtpStatus: OtpStatus;
    public SocialSecurityNumber: string;
    public UserID: number;
    public BirthDate: Date;
    public Active: boolean;
    public InternationalID: string;
    public SubEntityID: number;
    public ForeignWorker: ForeignWorker;
    public Deleted: boolean;
    public TypeOfPaymentOtp: TypeOfPaymentOtp;
    public EmployeeLanguageID: number;
    public PhotoID: number;
    public ID: number;
    public OtpExport: boolean;
    public PaymentInterval: PaymentInterval;
    public AdvancePaymentAmount: number;
    public EmploymentDate: Date;
    public EndDateOtp: LocalDate;
    public IncludeOtpUntilMonth: number;
    public StatusCode: number;
    public EmployeeNumber: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public IncludeOtpUntilYear: number;
    public _createguid: string;
    public BusinessRelationInfo: BusinessRelation;
    public Employments: Array<Employment>;
    public VacationRateEmployees: Array<VacationRateEmployee>;
    public SubEntity: SubEntity;
    public TaxCards: Array<EmployeeTaxCard>;
    public EmployeeLanguage: EmployeeLanguage;
    public CustomFields: any;
}


export class EmployeeTaxCard extends UniEntity {
    public static RelativeUrl = 'taxcards';
    public static EntityType = 'EmployeeTaxCard';

    public NonTaxableAmount: number;
    public SecondaryPercent: number;
    public Percent: number;
    public UpdatedAt: Date;
    public loennKunTrygdeavgiftTilUtenlandskBorgerID: number;
    public CreatedAt: Date;
    public loennFraHovedarbeidsgiverID: number;
    public ResultatStatus: string;
    public SecondaryTable: string;
    public IssueDate: Date;
    public loennTilUtenrikstjenestemannID: number;
    public loennFraBiarbeidsgiverID: number;
    public Tilleggsopplysning: string;
    public ufoereYtelserAndreID: number;
    public pensjonID: number;
    public Deleted: boolean;
    public EmployeeID: number;
    public NotMainEmployer: boolean;
    public ID: number;
    public TaxcardId: number;
    public StatusCode: number;
    public SKDXml: string;
    public EmployeeNumber: number;
    public loennKunTrygdeavgiftTilUtenlandskBorgerSomGrensegjengerID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Year: number;
    public Table: string;
    public _createguid: string;
    public NoRecalc: boolean;
    public loennFraHovedarbeidsgiver: TaxCard;
    public loennFraBiarbeidsgiver: TaxCard;
    public pensjon: TaxCard;
    public loennTilUtenrikstjenestemann: TaxCard;
    public loennKunTrygdeavgiftTilUtenlandskBorger: TaxCard;
    public loennKunTrygdeavgiftTilUtenlandskBorgerSomGrensegjenger: TaxCard;
    public ufoereYtelserAndre: TaxCard;
    public CustomFields: any;
}


export class TaxCard extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'TaxCard';

    public NonTaxableAmount: number;
    public Percent: number;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public freeAmountType: FreeAmountType;
    public AntallMaanederForTrekk: number;
    public Deleted: boolean;
    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public tabellType: TabellType;
    public Table: string;
    public _createguid: string;
    public CustomFields: any;
}


export class EmployeeLeave extends UniEntity {
    public static RelativeUrl = 'EmployeeLeave';
    public static EntityType = 'EmployeeLeave';

    public LeavePercent: number;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public AffectsOtp: boolean;
    public Description: string;
    public ToDate: Date;
    public Deleted: boolean;
    public EmploymentID: number;
    public FromDate: Date;
    public ID: number;
    public LeaveType: Leavetype;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public Employment: Employment;
    public CustomFields: any;
}


export class Employment extends UniEntity {
    public static RelativeUrl = 'employments';
    public static EntityType = 'Employment';

    public PayGrade: string;
    public SeniorityDate: Date;
    public TypeOfEmployment: TypeOfEmployment;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public RegulativeGroupID: number;
    public DimensionsID: number;
    public EmploymentType: EmploymentType;
    public JobName: string;
    public TradeArea: ShipTradeArea;
    public MonthRate: number;
    public RegulativeStepNr: number;
    public SubEntityID: number;
    public EndDate: Date;
    public Deleted: boolean;
    public LastWorkPercentChangeDate: Date;
    public EmployeeID: number;
    public LedgerAccount: string;
    public WorkPercent: number;
    public HourRate: number;
    public LastSalaryChangeDate: Date;
    public StartDate: Date;
    public RemunerationType: RemunerationType;
    public ID: number;
    public Standard: boolean;
    public HoursPerWeek: number;
    public WorkingHoursScheme: WorkingHoursScheme;
    public StatusCode: number;
    public ShipReg: ShipRegistry;
    public EmployeeNumber: number;
    public ShipType: ShipTypeOfShip;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UserDefinedRate: number;
    public JobCode: string;
    public EndDateReason: EndDateReason;
    public _createguid: string;
    public Employee: Employee;
    public SubEntity: SubEntity;
    public Dimensions: Dimensions;
    public Leaves: Array<EmployeeLeave>;
    public CustomFields: any;
}


export class Grant extends UniEntity {
    public static RelativeUrl = 'grants';
    public static EntityType = 'Grant';

    public Amount: number;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Description: string;
    public AffectsAGA: boolean;
    public SubentityID: number;
    public Deleted: boolean;
    public FromDate: Date;
    public ID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class OtpExportWagetype extends UniEntity {
    public static RelativeUrl = 'otpexportwagetypes';
    public static EntityType = 'OtpExportWagetype';

    public WageTypeNumber: number;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public ID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class PayrollRun extends UniEntity {
    public static RelativeUrl = 'payrollrun';
    public static EntityType = 'PayrollRun';

    public FreeText: string;
    public SettlementDate: Date;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public AGAonRun: number;
    public AGAFreeAmount: number;
    public PaycheckFileID: number;
    public Description: string;
    public ExcludeRecurringPosts: boolean;
    public needsRecalc: boolean;
    public JournalEntryNumber: string;
    public ToDate: Date;
    public Deleted: boolean;
    public PayDate: Date;
    public FromDate: Date;
    public ID: number;
    public HolidayPayDeduction: boolean;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public taxdrawfactor: TaxDrawFactor;
    public _createguid: string;
    public transactions: Array<SalaryTransaction>;
    public agacalculation: Array<AGACalculation>;
    public CustomFields: any;
}


export class PayrollRunCategoryLink extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'PayrollRunCategoryLink';

    public PayrollRunID: number;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public EmployeeCategoryID: number;
    public Deleted: boolean;
    public ID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public EmployeeCategory: EmployeeCategory;
    public PayrollRun: PayrollRun;
    public CustomFields: any;
}


export class PostingSummaryDraft extends UniEntity {
    public draftWithDims: string;
    public draftWithDimsOnBalance: string;
    public status: SummaryJobStatus;
    public statusTime: Date;
    public JobInfoID: number;
    public draftBasic: string;
    public ID: number;
    public PayrollID: number;
}


export class Regulative extends UniEntity {
    public static RelativeUrl = 'regulatives';
    public static EntityType = 'Regulative';

    public UpdatedAt: Date;
    public CreatedAt: Date;
    public RegulativeGroupID: number;
    public Deleted: boolean;
    public StartDate: LocalDate;
    public ID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public Steps: Array<RegulativeStep>;
    public CustomFields: any;
}


export class RegulativeGroup extends UniEntity {
    public static RelativeUrl = 'regulativegroups';
    public static EntityType = 'RegulativeGroup';

    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public ID: number;
    public Name: string;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public Regulatives: Array<Regulative>;
    public CustomFields: any;
}


export class RegulativeStep extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'RegulativeStep';

    public Amount: number;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Step: number;
    public Deleted: boolean;
    public ID: number;
    public StatusCode: number;
    public RegulativeID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class SalaryBalance extends UniEntity {
    public static RelativeUrl = 'salarybalances';
    public static EntityType = 'SalaryBalance';

    public WageTypeNumber: number;
    public KID: string;
    public CreatePayment: boolean;
    public UpdatedAt: Date;
    public Source: SalBalSource;
    public CreatedAt: Date;
    public MinAmount: number;
    public ToDate: Date;
    public Deleted: boolean;
    public EmploymentID: number;
    public EmployeeID: number;
    public SalaryBalanceTemplateID: number;
    public FromDate: Date;
    public ID: number;
    public Name: string;
    public InstalmentType: SalBalType;
    public MaxAmount: number;
    public SupplierID: number;
    public StatusCode: number;
    public Type: SalBalDrawType;
    public InstalmentPercent: number;
    public UpdatedBy: string;
    public Instalment: number;
    public CreatedBy: string;
    public CalculatedBalance: number;
    public Amount: number;
    public _createguid: string;
    public Balance: number;
    public Employee: Employee;
    public Supplier: Supplier;
    public Transactions: Array<SalaryBalanceLine>;
    public Employment: Employment;
    public CustomFields: any;
}


export class SalaryBalanceLine extends UniEntity {
    public static RelativeUrl = 'salarybalancelines';
    public static EntityType = 'SalaryBalanceLine';

    public Amount: number;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Description: string;
    public SalaryTransactionID: number;
    public SalaryBalanceID: number;
    public Deleted: boolean;
    public ID: number;
    public StatusCode: number;
    public Date: LocalDate;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public SalaryTransaction: SalaryTransaction;
    public SalaryBalance: SalaryBalance;
    public CustomFields: any;
}


export class SalaryBalanceTemplate extends UniEntity {
    public static RelativeUrl = 'salarybalancetemplates';
    public static EntityType = 'SalaryBalanceTemplate';

    public WageTypeNumber: number;
    public KID: string;
    public CreatePayment: boolean;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public MinAmount: number;
    public Deleted: boolean;
    public Account: number;
    public ID: number;
    public Name: string;
    public InstalmentType: SalBalType;
    public MaxAmount: number;
    public SupplierID: number;
    public StatusCode: number;
    public SalarytransactionDescription: string;
    public InstalmentPercent: number;
    public UpdatedBy: string;
    public Instalment: number;
    public CreatedBy: string;
    public _createguid: string;
    public Supplier: Supplier;
    public SalaryBalances: Array<SalaryBalance>;
    public CustomFields: any;
}


export class SalaryTransaction extends UniEntity {
    public static RelativeUrl = 'salarytrans';
    public static EntityType = 'SalaryTransaction';

    public WageTypeNumber: number;
    public MunicipalityNo: string;
    public Amount: number;
    public PayrollRunID: number;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public SystemType: StdSystemType;
    public DimensionsID: number;
    public WageTypeID: number;
    public Sum: number;
    public IsRecurringPost: boolean;
    public ToDate: Date;
    public SalaryBalanceID: number;
    public Deleted: boolean;
    public EmploymentID: number;
    public EmployeeID: number;
    public TaxbasisID: number;
    public Account: number;
    public FromDate: Date;
    public ID: number;
    public calcAGA: number;
    public HolidayPayDeduction: boolean;
    public RecurringID: number;
    public recurringPostValidTo: Date;
    public StatusCode: number;
    public Rate: number;
    public EmployeeNumber: number;
    public UpdatedBy: string;
    public recurringPostValidFrom: Date;
    public CreatedBy: string;
    public Text: string;
    public ChildSalaryTransactionID: number;
    public VatTypeID: number;
    public _createguid: string;
    public payrollrun: PayrollRun;
    public Employee: Employee;
    public Wagetype: WageType;
    public employment: Employment;
    public Dimensions: Dimensions;
    public Supplements: Array<SalaryTransactionSupplement>;
    public Taxbasis: TaxBasis;
    public VatType: VatType;
    public CustomFields: any;
}


export class SalaryTransactionSupplement extends UniEntity {
    public static RelativeUrl = 'supplements';
    public static EntityType = 'SalaryTransactionSupplement';

    public ValueMoney: number;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public SalaryTransactionID: number;
    public Deleted: boolean;
    public ValueString: string;
    public ValueDate: Date;
    public ID: number;
    public WageTypeSupplementID: number;
    public StatusCode: number;
    public ValueBool: boolean;
    public ValueDate2: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public WageTypeSupplement: WageTypeSupplement;
    public CustomFields: any;
}


export class SalaryYear extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'SalaryYear';

    public UpdatedAt: Date;
    public CreatedAt: Date;
    public CurrentYear: number;
    public Deleted: boolean;
    public ID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class SubEntity extends UniEntity {
    public static RelativeUrl = 'subentities';
    public static EntityType = 'SubEntity';

    public MunicipalityNo: string;
    public UpdatedAt: Date;
    public BusinessRelationID: number;
    public CreatedAt: Date;
    public OrgNumber: string;
    public Deleted: boolean;
    public ID: number;
    public AgaZone: number;
    public SuperiorOrganizationID: number;
    public AgaRule: number;
    public StatusCode: number;
    public freeAmount: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public BusinessRelationInfo: BusinessRelation;
    public SuperiorOrganization: SubEntity;
    public CustomFields: any;
}


export class TaxBasis extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'TaxBasis';

    public Basis: number;
    public UpdatedAt: Date;
    public SvalbardBasis: number;
    public CreatedAt: Date;
    public ForeignBorderCommuterBasis: number;
    public SalaryTransactionID: number;
    public Deleted: boolean;
    public ID: number;
    public JanMayenBasis: number;
    public PensionBasis: number;
    public ForeignCitizenInsuranceBasis: number;
    public StatusCode: number;
    public DisabilityOtherBasis: number;
    public UpdatedBy: string;
    public SailorBasis: number;
    public CreatedBy: string;
    public PensionSourcetaxBasis: number;
    public _createguid: string;
    public CustomFields: any;
}


export class Travel extends UniEntity {
    public static RelativeUrl = 'travels';
    public static EntityType = 'Travel';

    public Email: string;
    public Purpose: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public SourceSystem: string;
    public DimensionsID: number;
    public Comment: string;
    public Description: string;
    public TravelIdentificator: string;
    public Deleted: boolean;
    public ID: number;
    public State: state;
    public Phone: string;
    public Name: string;
    public PersonID: string;
    public SupplierID: number;
    public StatusCode: number;
    public EmployeeNumber: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public AdvanceAmount: number;
    public _createguid: string;
    public TravelLines: Array<TravelLine>;
    public Dimensions: Dimensions;
    public CustomFields: any;
}


export class TravelLine extends UniEntity {
    public static RelativeUrl = 'travellines';
    public static EntityType = 'TravelLine';

    public AccountNumber: number;
    public Amount: number;
    public UpdatedAt: Date;
    public InvoiceAccount: number;
    public CreatedAt: Date;
    public paytransID: number;
    public DimensionsID: number;
    public Description: string;
    public TravelIdentificator: string;
    public Deleted: boolean;
    public From: Date;
    public ID: number;
    public To: Date;
    public StatusCode: number;
    public Rate: number;
    public TypeID: number;
    public CostType: costtype;
    public UpdatedBy: string;
    public LineState: linestate;
    public CreatedBy: string;
    public VatTypeID: number;
    public TravelID: number;
    public _createguid: string;
    public Travel: Travel;
    public VatType: VatType;
    public travelType: TravelType;
    public Dimensions: Dimensions;
    public CustomFields: any;
}


export class TravelType extends UniEntity {
    public static RelativeUrl = 'traveltype';
    public static EntityType = 'TravelType';

    public WageTypeNumber: number;
    public UpdatedAt: Date;
    public ForeignDescription: string;
    public InvoiceAccount: number;
    public CreatedAt: Date;
    public Description: string;
    public Deleted: boolean;
    public ID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public ForeignTypeID: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class VacationPayLine extends UniEntity {
    public static RelativeUrl = 'VacationPayLines';
    public static EntityType = 'VacationPayLine';

    public ManualVacationPayBase: number;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public EmployeeID: number;
    public ID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Year: number;
    public PaidVacationPay: number;
    public Age: number;
    public PaidTaxFreeVacationPay: number;
    public _createguid: string;
    public MissingEarlierVacationPay: number;
    public Withdrawal: number;
    public SystemVacationPayBase: number;
    public VacationPay60: number;
    public VacationPay: number;
    public Rate: number;
    public Rate60: number;
    public Employee: Employee;
    public CustomFields: any;
}


export class VacationRateEmployee extends UniEntity {
    public static RelativeUrl = 'employeevacationrates';
    public static EntityType = 'VacationRateEmployee';

    public UpdatedAt: Date;
    public CreatedAt: Date;
    public EndDate: Date;
    public Deleted: boolean;
    public EmployeeID: number;
    public StartDate: Date;
    public ID: number;
    public StatusCode: number;
    public Rate: number;
    public Rate60: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class WageType extends UniEntity {
    public static RelativeUrl = 'wagetypes';
    public static EntityType = 'WageType';

    public DaysOnBoard: boolean;
    public WageTypeNumber: number;
    public AccountNumber: number;
    public Limit_value: number;
    public Postnr: string;
    public StandardWageTypeFor: StdWageType;
    public Benefit: string;
    public UpdatedAt: Date;
    public NoNumberOfHours: boolean;
    public Base_div2: boolean;
    public CreatedAt: Date;
    public Systemtype: string;
    public Base_Vacation: boolean;
    public Base_div3: boolean;
    public IncomeType: string;
    public SystemRequiredWageType: number;
    public Description: string;
    public AccountNumber_balance: number;
    public SupplementPackage: string;
    public Limit_newRate: number;
    public FixedSalaryHolidayDeduction: boolean;
    public Deleted: boolean;
    public SpecialTaxAndContributionsRule: SpecialTaxAndContributionsRule;
    public SpecialTaxHandling: string;
    public WageTypeName: string;
    public Base_EmploymentTax: boolean;
    public taxtype: TaxType;
    public HideFromPaycheck: boolean;
    public RatetypeColumn: RateTypeColumn;
    public ID: number;
    public SpecialAgaRule: SpecialAgaRule;
    public Limit_WageTypeNumber: number;
    public ValidYear: number;
    public StatusCode: number;
    public Rate: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Limit_type: LimitType;
    public GetRateFrom: GetRateFrom;
    public Base_Payment: boolean;
    public RateFactor: number;
    public _createguid: string;
    public SupplementaryInformations: Array<WageTypeSupplement>;
    public CustomFields: any;
}


export class WageTypeSupplement extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'WageTypeSupplement';

    public ameldingType: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public SuggestedValue: string;
    public WageTypeID: number;
    public Description: string;
    public ValueType: Valuetype;
    public Deleted: boolean;
    public ID: number;
    public Name: string;
    public StatusCode: number;
    public UpdatedBy: string;
    public GetValueFromTrans: boolean;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class WageTypeTranslation extends UniEntity {
    public static RelativeUrl = 'wagetypetranslations';
    public static EntityType = 'WageTypeTranslation';

    public WageTypeNumber: number;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public WageTypeName: string;
    public EmployeeLanguageID: number;
    public ID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public EmployeeLanguage: EmployeeLanguage;
    public CustomFields: any;
}


export class PensionScheme extends UniEntity {
    public static RelativeUrl = 'pensionschemes';
    public static EntityType = 'PensionScheme';

    public UpdatedAt: Date;
    public Identificator: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public Period: number;
    public ID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Year: number;
    public _createguid: string;
    public CustomFields: any;
}


export class PensionSchemeSupplier extends UniEntity {
    public static RelativeUrl = 'pensionschemesuppliers';
    public static EntityType = 'PensionSchemeSupplier';

    public UpdatedAt: Date;
    public Identificator: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public ID: number;
    public Name: string;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class StandardPensionSchemeSupplier extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'StandardPensionSchemeSupplier';

    public UpdatedAt: Date;
    public Identificator: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public ID: number;
    public Name: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class EmployeeLanguage extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'EmployeeLanguage';

    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public LanguageCode: string;
    public ID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class ComponentLayout extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ComponentLayout';

    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public BaseEntity: string;
    public ID: number;
    public Name: string;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public Fields: Array<FieldLayout>;
    public CustomFields: any;
}


export class FieldLayout extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'FieldLayout';

    public Section: number;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public DisplayField: string;
    public Placement: number;
    public Sectionheader: string;
    public EntityType: string;
    public FieldSet: number;
    public Description: string;
    public Deleted: boolean;
    public LineBreak: boolean;
    public ID: number;
    public Legend: string;
    public Combo: number;
    public Placeholder: string;
    public HelpText: string;
    public Label: string;
    public ReadOnly: boolean;
    public FieldType: FieldType;
    public StatusCode: number;
    public Alignment: Alignment;
    public Hidden: boolean;
    public ComponentLayoutID: number;
    public Options: string;
    public LookupField: boolean;
    public UpdatedBy: string;
    public Property: string;
    public CreatedBy: string;
    public Width: string;
    public _createguid: string;
    public CustomFields: any;
}


export class CurrencyOverride extends UniEntity {
    public static RelativeUrl = 'currencyoverrides';
    public static EntityType = 'CurrencyOverride';

    public FromCurrencyCodeID: number;
    public Factor: number;
    public UpdatedAt: Date;
    public Source: CurrencySourceEnum;
    public CreatedAt: Date;
    public ExchangeRate: number;
    public ToDate: LocalDate;
    public Deleted: boolean;
    public FromDate: LocalDate;
    public ID: number;
    public ToCurrencyCodeID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public FromCurrencyCode: CurrencyCode;
    public ToCurrencyCode: CurrencyCode;
    public CustomFields: any;
}


export class AccountAssetGroup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AccountAssetGroup';

    public FromAccountNumber: number;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public AssetGroupCode: string;
    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public ToAccountNumber: number;
    public _createguid: string;
    public CustomFields: any;
}


export class AccountGroupSetup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AccountGroupSetup';

    public UpdatedAt: Date;
    public CreatedAt: Date;
    public PlanType: PlanTypeEnum;
    public ExternalReference: string;
    public Deleted: boolean;
    public ID: number;
    public Name: string;
    public ParentID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public Parent: AccountGroupSetup;
    public CustomFields: any;
}


export class AccountSetup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AccountSetup';

    public AccountNumber: number;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public SaftMappingAccountID: number;
    public Visible: boolean;
    public PlanType: PlanTypeEnum;
    public AccountGroupSetupID: number;
    public Deleted: boolean;
    public ID: number;
    public ExpectedDebitBalance: boolean;
    public VatCode: string;
    public UpdatedBy: string;
    public AccountName: string;
    public CreatedBy: string;
    public _createguid: string;
    public AccountGroup: AccountGroupSetup;
    public SaftMappingAccount: SaftMappingAccount;
    public CustomFields: any;
}


export class AccountVisibilityGroup extends UniEntity {
    public static RelativeUrl = 'accountvisibilitygroups';
    public static EntityType = 'AccountVisibilityGroup';

    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public ID: number;
    public Name: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public Accounts: Array<AccountVisibilityGroupAccount>;
    public CompanyTypes: Array<CompanyType>;
    public CustomFields: any;
}


export class AccountVisibilityGroupAccount extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AccountVisibilityGroupAccount';

    public UpdatedAt: Date;
    public CreatedAt: Date;
    public AccountSetupID: number;
    public AccountVisibilityGroupID: number;
    public Deleted: boolean;
    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class AGARate extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AGARate';

    public UpdatedAt: Date;
    public CreatedAt: Date;
    public ZoneID: number;
    public RateValidFrom: Date;
    public Deleted: boolean;
    public ID: number;
    public Rate: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public sector: Array<AGASector>;
    public CustomFields: any;
}


export class AGASector extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AGASector';

    public UpdatedAt: Date;
    public SectorID: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public ID: number;
    public Sector: string;
    public ValidFrom: Date;
    public Rate: number;
    public freeAmount: number;
    public UpdatedBy: string;
    public RateID: number;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class AGAZone extends UniEntity {
    public static RelativeUrl = 'AGAZones';
    public static EntityType = 'AGAZone';

    public UpdatedAt: Date;
    public CreatedAt: Date;
    public ZoneName: string;
    public Deleted: boolean;
    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public rates: Array<AGARate>;
    public municipalsOnZone: Array<MunicipalAGAZone>;
    public CustomFields: any;
}


export class Agreement extends UniEntity {
    public static RelativeUrl = 'agreements';
    public static EntityType = 'Agreement';

    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Template: string;
    public Deleted: boolean;
    public ID: number;
    public ValidFrom: Date;
    public Name: string;
    public AppliesTo: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class AssetGroup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AssetGroup';

    public UpdatedAt: Date;
    public CreatedAt: Date;
    public DepreciationRate: number;
    public ToDate: Date;
    public DepreciationAccountNumber: number;
    public Deleted: boolean;
    public ID: number;
    public Name: string;
    public DepreciationYears: number;
    public Code: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class BankIdentifierCode extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'BankIdentifierCode';

    public BankName: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public Bic: string;
    public ID: number;
    public BankIdentifier: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class CompanyType extends UniEntity {
    public static RelativeUrl = 'companytypes';
    public static EntityType = 'CompanyType';

    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Description: string;
    public FullName: string;
    public Deleted: boolean;
    public ID: number;
    public DefaultPlanType: PlanTypeEnum;
    public Name: string;
    public Priority: boolean;
    public DefaultAccountVisibilityGroupID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Confirmation extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Confirmation';

    public Email: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public PostalCode: string;
    public ContractType: string;
    public DisplayName: string;
    public Deleted: boolean;
    public SignUpReferrer: string;
    public ID: number;
    public Phone: string;
    public ExpirationDate: Date;
    public CompanyName: string;
    public StatusCode: number;
    public Code: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Country extends UniEntity {
    public static RelativeUrl = 'countries';
    public static EntityType = 'Country';

    public UpdatedAt: Date;
    public CreatedAt: Date;
    public DefaultCurrencyCode: string;
    public CountryCode: string;
    public Deleted: boolean;
    public CurrencyRateSource: string;
    public ID: number;
    public Name: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Currency extends UniEntity {
    public static RelativeUrl = 'currencies';
    public static EntityType = 'Currency';

    public FromCurrencyCodeID: number;
    public Factor: number;
    public UpdatedAt: Date;
    public Source: CurrencySourceEnum;
    public CreatedAt: Date;
    public ExchangeRate: number;
    public Deleted: boolean;
    public CurrencyDate: LocalDate;
    public ID: number;
    public ToCurrencyCodeID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public FromCurrencyCode: CurrencyCode;
    public ToCurrencyCode: CurrencyCode;
    public CustomFields: any;
}


export class CurrencyCode extends UniEntity {
    public static RelativeUrl = 'currencycodes';
    public static EntityType = 'CurrencyCode';

    public UpdatedAt: Date;
    public ShortCode: string;
    public CreatedAt: Date;
    public Description: string;
    public Deleted: boolean;
    public ID: number;
    public Name: string;
    public Code: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class DebtCollectionAutomation extends UniEntity {
    public static RelativeUrl = 'debtcollectionautomation';
    public static EntityType = 'DebtCollectionAutomation';

    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Description: string;
    public Deleted: boolean;
    public ID: number;
    public DebtCollectionSettingsID: number;
    public Name: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public DebtCollectionSettings: DebtCollectionSettings;
    public CustomFields: any;
}


export class EmploymentValidValues extends UniEntity {
    public static RelativeUrl = 'employmentvalidvalues';
    public static EntityType = 'EmploymentValidValues';

    public SeniorityDate: boolean;
    public typeOfEmployment: boolean;
    public UpdatedAt: Date;
    public PaymentType: RemunerationType;
    public CreatedAt: Date;
    public employment: TypeOfEmployment;
    public JobName: boolean;
    public TradeArea: boolean;
    public MonthRate: boolean;
    public EndDate: boolean;
    public Deleted: boolean;
    public WorkPercent: boolean;
    public HourRate: boolean;
    public LastSalaryChangeDate: boolean;
    public StartDate: boolean;
    public RemunerationType: boolean;
    public ID: number;
    public HoursPerWeek: boolean;
    public WorkingHoursScheme: boolean;
    public ShipReg: boolean;
    public LastWorkPercentChange: boolean;
    public ShipType: boolean;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UserDefinedRate: boolean;
    public JobCode: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class FinancialDeadline extends UniEntity {
    public static RelativeUrl = 'deadlines';
    public static EntityType = 'FinancialDeadline';

    public PassableDueDate: number;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public ID: number;
    public AdditionalInfo: string;
    public Name: string;
    public Deadline: LocalDate;
    public StatusCode: number;
    public Type: FinancialDeadlineType;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class LanguageCode extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'LanguageCode';

    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public ID: number;
    public Name: string;
    public Code: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Municipal extends UniEntity {
    public static RelativeUrl = 'Municipals';
    public static EntityType = 'Municipal';

    public MunicipalityNo: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public CountyName: string;
    public CountyNo: string;
    public Retired: boolean;
    public Deleted: boolean;
    public ID: number;
    public MunicipalityName: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class MunicipalAGAZone extends UniEntity {
    public static RelativeUrl = 'MunicipalAGAZones';
    public static EntityType = 'MunicipalAGAZone';

    public MunicipalityNo: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public ZoneID: number;
    public Deleted: boolean;
    public Startdate: Date;
    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class PaymentBatchType extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'PaymentBatchType';

    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Description: string;
    public Deleted: boolean;
    public ID: number;
    public Name: string;
    public Code: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class PaymentCode extends UniEntity {
    public static RelativeUrl = 'paymentCodes';
    public static EntityType = 'PaymentCode';

    public UpdatedAt: Date;
    public CreatedAt: Date;
    public PaymentGroup: string;
    public Description: string;
    public Deleted: boolean;
    public ID: number;
    public Name: string;
    public Code: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class PostalCode extends UniEntity {
    public static RelativeUrl = 'postalcodes';
    public static EntityType = 'PostalCode';

    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public City: string;
    public ID: number;
    public StatusCode: number;
    public Code: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class SaftMappingAccount extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'SaftMappingAccount';

    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Description: string;
    public Deleted: boolean;
    public AccountID: string;
    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class StaticRegister extends UniEntity {
    public static RelativeUrl = 'StaticRegister';
    public static EntityType = 'StaticRegister';

    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Registry: string;
    public Deleted: boolean;
    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public stamp: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class STYRKCode extends UniEntity {
    public static RelativeUrl = 'STYRK';
    public static EntityType = 'STYRKCode';

    public styrk: string;
    public tittel: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public lnr: number;
    public Deleted: boolean;
    public ID: number;
    public ynr: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Language extends UniEntity {
    public static RelativeUrl = 'languages';
    public static EntityType = 'Language';

    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public ID: number;
    public Name: string;
    public Code: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public FallBackLanguageID: number;
    public _createguid: string;
    public Translations: Array<Translation>;
    public CustomFields: any;
}


export class Translatable extends UniEntity {
    public static RelativeUrl = 'translatables';
    public static EntityType = 'Translatable';

    public Value: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Column: string;
    public Static: boolean;
    public Description: string;
    public Meaning: string;
    public Deleted: boolean;
    public Module: i18nModule;
    public ID: number;
    public Model: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public Translations: Array<Translation>;
    public CustomFields: any;
}


export class Translation extends UniEntity {
    public static RelativeUrl = 'translations';
    public static EntityType = 'Translation';

    public TranslatableID: number;
    public LanguageID: number;
    public Value: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public Language: Language;
    public Translatable: Translatable;
    public CustomFields: any;
}


export class VatCodeGroupSetup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'VatCodeGroupSetup';

    public UpdatedAt: Date;
    public No: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public ID: number;
    public Name: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class VatPostSetup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'VatPostSetup';

    public UpdatedAt: Date;
    public No: string;
    public CreatedAt: Date;
    public ReportAsNegativeAmount: boolean;
    public Deleted: boolean;
    public ID: number;
    public Name: string;
    public VatCodeGroupSetupNo: string;
    public UpdatedBy: string;
    public HasTaxAmount: boolean;
    public HasTaxBasis: boolean;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class VatReportForm extends UniEntity {
    public static RelativeUrl = 'vatreportforms';
    public static EntityType = 'VatReportForm';

    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Description: string;
    public Deleted: boolean;
    public ID: number;
    public Name: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class VatReportReferenceSetup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'VatReportReferenceSetup';

    public AccountNumber: number;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public VatPostNo: string;
    public ID: number;
    public VatCode: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class VatTypeSetup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'VatTypeSetup';

    public DefaultVisible: boolean;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public OutputVat: boolean;
    public OutgoingAccountNumber: number;
    public IncomingAccountNumber: number;
    public VatCodeGroupNo: string;
    public Deleted: boolean;
    public ID: number;
    public ReversedTaxDutyVat: boolean;
    public Name: string;
    public DirectJournalEntryOnly: boolean;
    public VatCode: string;
    public UpdatedBy: string;
    public IsCompensated: boolean;
    public IsNotVatRegistered: boolean;
    public CreatedBy: string;
    public _createguid: string;
    public VatTypeSetupPercentages: Array<VatTypeSetupPercentage>;
    public CustomFields: any;
}


export class VatTypeSetupPercentage extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'VatTypeSetupPercentage';

    public UpdatedAt: Date;
    public CreatedAt: Date;
    public VatTypeSetupID: number;
    public ValidTo: LocalDate;
    public Deleted: boolean;
    public ID: number;
    public VatPercent: number;
    public ValidFrom: LocalDate;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class CompanyReport extends UniEntity {
    public static RelativeUrl = 'company-report';
    public static EntityType = 'CompanyReport';

    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public ReportDefinitionID: number;
    public ID: number;
    public UpdatedBy: string;
    public CompanyKey: string;
    public ContractId: number;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class ReportDefinition extends UniEntity {
    public static RelativeUrl = 'report-definitions';
    public static EntityType = 'ReportDefinition';

    public IsStandard: boolean;
    public Version: string;
    public UpdatedAt: Date;
    public ReportSource: string;
    public CreatedAt: Date;
    public Category: string;
    public ReportType: number;
    public Description: string;
    public Md5: string;
    public Visible: boolean;
    public Deleted: boolean;
    public ID: number;
    public TemplateLinkId: string;
    public Name: string;
    public CategoryLabel: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UniqueReportID: string;
    public _createguid: string;
    public CustomFields: any;
}


export class ReportDefinitionDataSource extends UniEntity {
    public static RelativeUrl = 'report-definition-data-sources';
    public static EntityType = 'ReportDefinitionDataSource';

    public UpdatedAt: Date;
    public DataSourceUrl: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public ReportDefinitionId: number;
    public ID: number;
    public Name: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class ReportDefinitionParameter extends UniEntity {
    public static RelativeUrl = 'report-definition-parameters';
    public static EntityType = 'ReportDefinitionParameter';

    public DefaultValueList: string;
    public DefaultValue: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Visible: boolean;
    public Deleted: boolean;
    public DefaultValueLookupType: string;
    public ReportDefinitionId: number;
    public ID: number;
    public Label: string;
    public Name: string;
    public Type: string;
    public UpdatedBy: string;
    public DefaultValueSource: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class PeriodSeries extends UniEntity {
    public static RelativeUrl = 'period-series';
    public static EntityType = 'PeriodSeries';

    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Active: boolean;
    public Deleted: boolean;
    public ID: number;
    public Name: string;
    public SeriesType: PeriodSeriesType;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class PeriodTemplate extends UniEntity {
    public static RelativeUrl = 'period-templates';
    public static EntityType = 'PeriodTemplate';

    public UpdatedAt: Date;
    public No: number;
    public CreatedAt: Date;
    public ToDate: LocalDate;
    public Deleted: boolean;
    public FromDate: LocalDate;
    public ID: number;
    public Name: string;
    public PeriodSeriesID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public PeriodSeries: PeriodSeries;
    public CustomFields: any;
}


export class Model extends UniEntity {
    public static RelativeUrl = 'models';
    public static EntityType = 'Model';

    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Description: string;
    public Admin: boolean;
    public Deleted: boolean;
    public LabelPlural: string;
    public ID: number;
    public Label: string;
    public Name: string;
    public Shared: boolean;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public Fields: Array<Field>;
    public CustomFields: any;
}


export class Field extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Field';

    public UpdatedAt: Date;
    public CreatedAt: Date;
    public ModelID: number;
    public Description: string;
    public Deleted: boolean;
    public ID: number;
    public HelpText: string;
    public Label: string;
    public Name: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public Model: Model;
    public CustomFields: any;
}


export class Notification extends UniEntity {
    public static RelativeUrl = 'notifications';
    public static EntityType = 'Notification';

    public UpdatedAt: Date;
    public CreatedAt: Date;
    public SourceEntityType: string;
    public EntityType: string;
    public Message: string;
    public Deleted: boolean;
    public EntityID: number;
    public ID: number;
    public SenderDisplayName: string;
    public RecipientID: string;
    public CompanyName: string;
    public StatusCode: number;
    public SourceEntityID: number;
    public UpdatedBy: string;
    public CompanyKey: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class CompanySettings extends UniEntity {
    public static RelativeUrl = 'companysettings';
    public static EntityType = 'CompanySettings';

    public SupplierAccountID: number;
    public UseFinancialDateToCalculateVatPercent: boolean;
    public DefaultDistributionsID: number;
    public ShowKIDOnCustomerInvoice: boolean;
    public TaxableFromDate: LocalDate;
    public VatReportFormID: number;
    public XtraPaymentOrgXmlTagValue: string;
    public CustomerInvoiceReminderSettingsID: number;
    public PaymentBankAgreementNumber: string;
    public BatchInvoiceMinAmount: number;
    public BaseCurrencyCodeID: number;
    public WebAddress: string;
    public RoundingType: RoundingType;
    public Factoring: number;
    public DefaultAddressID: number;
    public PeriodSeriesVatID: number;
    public UpdatedAt: Date;
    public AccountingLockedDate: LocalDate;
    public BankChargeAccountID: number;
    public CreatedAt: Date;
    public APIncludeAttachment: boolean;
    public UseXtraPaymentOrgXmlTag: boolean;
    public DefaultEmailID: number;
    public AutoDistributeInvoice: boolean;
    public TaxMandatoryType: number;
    public TwoStageAutobankEnabled: boolean;
    public HasAutobank: boolean;
    public APActivated: boolean;
    public AcceptableDelta4CustomerPaymentAccountID: number;
    public TaxBankAccountID: number;
    public GLN: string;
    public BookCustomerInvoiceOnDeliveryDate: boolean;
    public APContactID: number;
    public AllowAvtalegiroRegularInvoice: boolean;
    public UseOcrInterpretation: boolean;
    public DefaultTOFCurrencySettingsID: number;
    public AcceptableDelta4CustomerPayment: number;
    public CustomerCreditDays: number;
    public FactoringEmailID: number;
    public SaveCustomersFromQuoteAsLead: boolean;
    public SAFTimportAccountID: number;
    public Localization: string;
    public CustomerAccountID: number;
    public LogoFileID: number;
    public CompanyTypeID: number;
    public AutoJournalPayment: string;
    public TaxMandatory: boolean;
    public AccountVisibilityGroupID: number;
    public Deleted: boolean;
    public InterrimRemitAccountID: number;
    public StoreDistributedInvoice: boolean;
    public CompanyBankAccountID: number;
    public ShowNumberOfDecimals: number;
    public LogoHideField: number;
    public RoundingNumberOfDecimals: number;
    public AgioLossAccountID: number;
    public APGuid: string;
    public AccountGroupSetID: number;
    public DefaultCustomerInvoiceReminderReportID: number;
    public LogoAlign: number;
    public DefaultCustomerInvoiceReportID: number;
    public ID: number;
    public PaymentBankIdentification: string;
    public UsePaymentBankValues: boolean;
    public UseAssetRegister: boolean;
    public HideInActiveSuppliers: boolean;
    public VatLockedDate: LocalDate;
    public UseNetsIntegration: boolean;
    public InterrimPaymentAccountID: number;
    public OrganizationNumber: string;
    public CompanyName: string;
    public DefaultPhoneID: number;
    public FactoringNumber: number;
    public AgioGainAccountID: number;
    public StatusCode: number;
    public ForceSupplierInvoiceApproval: boolean;
    public DefaultCustomerOrderReportID: number;
    public CompanyRegistered: boolean;
    public NetsIntegrationActivated: boolean;
    public UpdatedBy: string;
    public DefaultSalesAccountID: number;
    public DefaultCustomerQuoteReportID: number;
    public HideInActiveCustomers: boolean;
    public CreatedBy: string;
    public OfficeMunicipalityNo: string;
    public PeriodSeriesAccountID: number;
    public SettlementVatAccountID: number;
    public TaxableFromLimit: number;
    public IgnorePaymentsWithoutEndToEndID: boolean;
    public SalaryBankAccountID: number;
    public _createguid: string;
    public DefaultEmail: Email;
    public DefaultPhone: Phone;
    public DefaultAddress: Address;
    public BaseCurrencyCode: CurrencyCode;
    public SalaryBankAccount: BankAccount;
    public CompanyBankAccount: BankAccount;
    public DefaultTOFCurrencySettings: TOFCurrencySettings;
    public CustomerInvoiceReminderSettings: CustomerInvoiceReminderSettings;
    public SupplierAccount: Account;
    public CustomerAccount: Account;
    public SAFTimportAccount: Account;
    public BankAccounts: Array<BankAccount>;
    public TaxBankAccount: BankAccount;
    public SettlementVatAccount: Account;
    public DefaultSalesAccount: Account;
    public APContact: Contact;
    public APIncomming: Array<AccessPointFormat>;
    public APOutgoing: Array<AccessPointFormat>;
    public Distributions: Distributions;
    public AgioGainAccount: Account;
    public AgioLossAccount: Account;
    public BankChargeAccount: Account;
    public AcceptableDelta4CustomerPaymentAccount: Account;
    public FactoringEmail: Email;
    public CustomFields: any;
}


export class DistributionPlan extends UniEntity {
    public static RelativeUrl = 'distributions';
    public static EntityType = 'DistributionPlan';

    public UpdatedAt: Date;
    public CreatedAt: Date;
    public EntityType: string;
    public Deleted: boolean;
    public ID: number;
    public Name: string;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public Elements: Array<DistributionPlanElement>;
    public CustomFields: any;
}


export class DistributionPlanElement extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'DistributionPlanElement';

    public UpdatedAt: Date;
    public CreatedAt: Date;
    public DistributionPlanElementTypeID: number;
    public Deleted: boolean;
    public ID: number;
    public StatusCode: number;
    public Priority: number;
    public DistributionPlanID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public ElementType: DistributionPlanElementType;
    public CustomFields: any;
}


export class DistributionPlanElementType extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'DistributionPlanElementType';

    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public ID: number;
    public Name: string;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public LegalEntities: Array<DistributionPlanElementTypeLegalEntity>;
    public CustomFields: any;
}


export class DistributionPlanElementTypeLegalEntity extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'DistributionPlanElementTypeLegalEntity';

    public UpdatedAt: Date;
    public CreatedAt: Date;
    public DistributionPlanElementTypeID: number;
    public EntityType: string;
    public Deleted: boolean;
    public ID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Distributions extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Distributions';

    public CustomerInvoiceReminderDistributionPlanID: number;
    public CustomerQuoteDistributionPlanID: number;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public CustomerOrderDistributionPlanID: number;
    public Deleted: boolean;
    public ID: number;
    public CustomerInvoiceDistributionPlanID: number;
    public PayCheckDistributionPlanID: number;
    public StatusCode: number;
    public AnnualStatementDistributionPlanID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomerInvoiceDistributionPlan: DistributionPlan;
    public CustomerOrderDistributionPlan: DistributionPlan;
    public CustomerQuoteDistributionPlan: DistributionPlan;
    public CustomerInvoiceReminderDistributionPlan: DistributionPlan;
    public PayCheckDistributionPlan: DistributionPlan;
    public AnnualStatementDistributionPlan: DistributionPlan;
    public CustomFields: any;
}


export class DistributionType extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'DistributionType';

    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public ID: number;
    public Name: string;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class EmailLog extends UniEntity {
    public static RelativeUrl = 'emails';
    public static EntityType = 'EmailLog';

    public DistributeAt: LocalDate;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public EntityType: string;
    public JobRunExternalRef: string;
    public ExternalReference: string;
    public Deleted: boolean;
    public JobRunID: number;
    public From: string;
    public EntityID: number;
    public ID: number;
    public To: string;
    public Subject: string;
    public StatusCode: number;
    public EntityDisplayValue: string;
    public Type: SharingType;
    public UpdatedBy: string;
    public CreatedBy: string;
    public ExternalMessage: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Eventplan extends UniEntity {
    public static RelativeUrl = 'eventplans';
    public static EntityType = 'Eventplan';

    public OperationFilter: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public IsSystemPlan: boolean;
    public ExpressionFilter: string;
    public Cargo: string;
    public Active: boolean;
    public JobNames: string;
    public PlanType: EventplanType;
    public Deleted: boolean;
    public ID: number;
    public Name: string;
    public SigningKey: string;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public ModelFilter: string;
    public _createguid: string;
    public Subscribers: Array<EventSubscriber>;
    public CustomFields: any;
}


export class EventSubscriber extends UniEntity {
    public static RelativeUrl = 'eventsubscribers';
    public static EntityType = 'EventSubscriber';

    public Headers: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Active: boolean;
    public Deleted: boolean;
    public EventplanID: number;
    public ID: number;
    public Name: string;
    public Authorization: string;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Endpoint: string;
    public _createguid: string;
    public Eventplan: Eventplan;
    public CustomFields: any;
}


export class Period extends UniEntity {
    public static RelativeUrl = 'periodes';
    public static EntityType = 'Period';

    public UpdatedAt: Date;
    public No: number;
    public CreatedAt: Date;
    public PeriodTemplateID: number;
    public ToDate: LocalDate;
    public Deleted: boolean;
    public FromDate: LocalDate;
    public ID: number;
    public AccountYear: number;
    public Name: string;
    public StatusCode: number;
    public PeriodSeriesID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public PeriodTemplate: PeriodTemplate;
    public PeriodSeries: PeriodSeries;
    public CustomFields: any;
}


export class PredefinedDescription extends UniEntity {
    public static RelativeUrl = 'predefineddescriptions';
    public static EntityType = 'PredefinedDescription';

    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Description: string;
    public Deleted: boolean;
    public ID: number;
    public StatusCode: number;
    public Type: PredefinedDescriptionType;
    public Code: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class ProductCategory extends UniEntity {
    public static RelativeUrl = 'productcategories';
    public static EntityType = 'ProductCategory';

    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Lft: number;
    public Comment: string;
    public Status: number;
    public Description: string;
    public Depth: number;
    public Deleted: boolean;
    public Rght: number;
    public ID: number;
    public Name: string;
    public StatusCode: number;
    public ParentID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class ProductCategoryLink extends UniEntity {
    public static RelativeUrl = 'productcategorylinks';
    public static EntityType = 'ProductCategoryLink';

    public UpdatedAt: Date;
    public ProductID: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public ID: number;
    public ProductCategoryID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public ProductCategory: ProductCategory;
    public CustomFields: any;
}


export class Sharing extends UniEntity {
    public static RelativeUrl = 'sharings';
    public static EntityType = 'Sharing';

    public DistributeAt: LocalDate;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public EntityType: string;
    public JobRunExternalRef: string;
    public ExternalReference: string;
    public Deleted: boolean;
    public JobRunID: number;
    public From: string;
    public EntityID: number;
    public ID: number;
    public To: string;
    public Subject: string;
    public StatusCode: number;
    public EntityDisplayValue: string;
    public Type: SharingType;
    public UpdatedBy: string;
    public CreatedBy: string;
    public ExternalMessage: string;
    public _createguid: string;
    public CustomFields: any;
}


export class StatusLog extends UniEntity {
    public static RelativeUrl = 'statuslogs';
    public static EntityType = 'StatusLog';

    public UpdatedAt: Date;
    public CreatedAt: Date;
    public EntityType: string;
    public ToStatus: number;
    public Deleted: boolean;
    public EntityID: number;
    public ID: number;
    public UpdatedBy: string;
    public FromStatus: number;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Tracelink extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Tracelink';

    public SourceEntityName: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public DestinationInstanceID: number;
    public Deleted: boolean;
    public SourceInstanceID: number;
    public DestinationEntityName: string;
    public ID: number;
    public StatusCode: number;
    public Date: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class User extends UniEntity {
    public static RelativeUrl = 'users';
    public static EntityType = 'User';

    public Email: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public DisplayName: string;
    public IsAutobankAdmin: boolean;
    public GlobalIdentity: string;
    public UserName: string;
    public Deleted: boolean;
    public LastLogin: Date;
    public Protected: boolean;
    public ID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public HasAgreedToImportDisclaimer: boolean;
    public BankIntegrationUserName: string;
    public CreatedBy: string;
    public PhoneNumber: string;
    public _createguid: string;
    public EndDate: Date;
    public AuthPhoneNumber: string;
    public TwoFactorEnabled: boolean;
    public CustomFields: any;
}


export class UniQueryDefinition extends UniEntity {
    public static RelativeUrl = 'uniquerydefinitions';
    public static EntityType = 'UniQueryDefinition';

    public IsShared: boolean;
    public UpdatedAt: Date;
    public ClickParam: string;
    public CreatedAt: Date;
    public Category: string;
    public SystemGeneratedQuery: boolean;
    public MainModelName: string;
    public Description: string;
    public UserID: number;
    public Deleted: boolean;
    public ModuleID: number;
    public ClickUrl: string;
    public SortIndex: number;
    public ID: number;
    public Name: string;
    public StatusCode: number;
    public Code: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public UniQueryFilters: Array<UniQueryFilter>;
    public UniQueryFields: Array<UniQueryField>;
    public CustomFields: any;
}


export class UniQueryField extends UniEntity {
    public static RelativeUrl = 'uniqueryfields';
    public static EntityType = 'UniQueryField';

    public UpdatedAt: Date;
    public Header: string;
    public CreatedAt: Date;
    public Field: string;
    public Alias: string;
    public SumFunction: string;
    public Path: string;
    public Deleted: boolean;
    public Index: number;
    public ID: number;
    public UniQueryDefinitionID: number;
    public FieldType: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Width: string;
    public _createguid: string;
    public CustomFields: any;
}


export class UniQueryFilter extends UniEntity {
    public static RelativeUrl = 'uniqueryfilters';
    public static EntityType = 'UniQueryFilter';

    public Value: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Field: string;
    public Deleted: boolean;
    public Group: number;
    public ID: number;
    public UniQueryDefinitionID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Operator: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Team extends UniEntity {
    public static RelativeUrl = 'teams';
    public static EntityType = 'Team';

    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Lft: number;
    public DimensionsID: number;
    public Depth: number;
    public Deleted: boolean;
    public Rght: number;
    public ID: number;
    public Name: string;
    public StatusCode: number;
    public ParentID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public Dimensions: Dimensions;
    public Positions: Array<TeamPosition>;
    public CustomFields: any;
}


export class TeamPosition extends UniEntity {
    public static RelativeUrl = 'teampositions';
    public static EntityType = 'TeamPosition';

    public ApproveOrder: number;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public UserID: number;
    public ToDate: LocalDate;
    public Position: TeamPositionEnum;
    public Deleted: boolean;
    public TeamID: number;
    public FromDate: LocalDate;
    public ID: number;
    public RelatedSharedRoleId: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public Team: Team;
    public CustomFields: any;
}


export class ApprovalRule extends UniEntity {
    public static RelativeUrl = 'approvalrules';
    public static EntityType = 'ApprovalRule';

    public RuleType: ApprovalRuleType;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public IndustryCodes: string;
    public Description: string;
    public Deleted: boolean;
    public ID: number;
    public StatusCode: number;
    public Keywords: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public Steps: Array<ApprovalRuleStep>;
    public CustomFields: any;
}


export class ApprovalRuleStep extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ApprovalRuleStep';

    public UpdatedAt: Date;
    public CreatedAt: Date;
    public UserID: number;
    public Deleted: boolean;
    public StepNumber: number;
    public Limit: number;
    public ApprovalRuleID: number;
    public ID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public ApprovalRule: ApprovalRule;
    public User: User;
    public CustomFields: any;
}


export class ApprovalSubstitute extends UniEntity {
    public static RelativeUrl = 'approvalsubstitutes';
    public static EntityType = 'ApprovalSubstitute';

    public UpdatedAt: Date;
    public CreatedAt: Date;
    public SubstituteUserID: number;
    public UserID: number;
    public ToDate: LocalDate;
    public Deleted: boolean;
    public FromDate: LocalDate;
    public ID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public User: User;
    public SubstituteUser: User;
    public CustomFields: any;
}


export class TaskApprovalPlan extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'TaskApprovalPlan';

    public Amount: number;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Comment: string;
    public UserID: number;
    public ApprovalID: number;
    public Deleted: boolean;
    public StepNumber: number;
    public Limit: number;
    public ApprovalRuleID: number;
    public ID: number;
    public TaskID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public Task: Task;
    public Approval: Approval;
    public ApprovalRule: ApprovalRule;
    public User: User;
    public CustomFields: any;
}


export class Status extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Status';

    public Order: number;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public EntityType: string;
    public StatusCategoryID: number;
    public Description: string;
    public Deleted: boolean;
    public IsDepricated: boolean;
    public ID: number;
    public System: boolean;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public StatusCategory: StatusCategory;
    public CustomFields: any;
}


export class StatusCategory extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'StatusCategory';

    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public ID: number;
    public Name: string;
    public StatusCategoryCode: StatusCategoryCode;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class StatusRemark extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'StatusRemark';

    public UpdatedAt: Date;
    public Remark: string;
    public CreatedAt: Date;
    public EntityType: string;
    public Deleted: boolean;
    public EntityID: number;
    public ID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Transition extends UniEntity {
    public static RelativeUrl = 'transitions';
    public static EntityType = 'Transition';

    public UpdatedAt: Date;
    public CreatedAt: Date;
    public EntityType: string;
    public MethodName: string;
    public Deleted: boolean;
    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Controller: string;
    public _createguid: string;
    public CustomFields: any;
}


export class TransitionThreshold extends UniEntity {
    public static RelativeUrl = 'thresholds';
    public static EntityType = 'TransitionThreshold';

    public Operation: OperationType;
    public Value: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public SharedRoleId: number;
    public RejectStatusCode: number;
    public Deleted: boolean;
    public SharedRejectTransitionId: number;
    public ID: number;
    public SharedApproveTransitionId: number;
    public Disabled: boolean;
    public PropertyName: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Operator: Operator;
    public _createguid: string;
    public CustomFields: any;
}


export class TransitionThresholdApproval extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'TransitionThresholdApproval';

    public Operation: OperationType;
    public Value: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public SharedRoleId: number;
    public ApprovalID: number;
    public RejectStatusCode: number;
    public Deleted: boolean;
    public SharedRejectTransitionId: number;
    public ID: number;
    public SharedApproveTransitionId: number;
    public PropertyName: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Operator: Operator;
    public _createguid: string;
    public Approval: Approval;
    public CustomFields: any;
}


export class Approval extends UniEntity {
    public static RelativeUrl = 'approvals';
    public static EntityType = 'Approval';

    public Amount: number;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public SharedRoleId: number;
    public UserID: number;
    public Deleted: boolean;
    public ID: number;
    public TaskID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public Task: Task;
    public Thresholds: Array<TransitionThresholdApproval>;
    public User: User;
    public CustomFields: any;
}


export class Task extends UniEntity {
    public static RelativeUrl = 'tasks';
    public static EntityType = 'Task';

    public UpdatedAt: Date;
    public CreatedAt: Date;
    public SharedRoleId: number;
    public ModelID: number;
    public Title: string;
    public UserID: number;
    public RejectStatusCode: number;
    public Deleted: boolean;
    public SharedRejectTransitionId: number;
    public EntityID: number;
    public ID: number;
    public SharedApproveTransitionId: number;
    public StatusCode: number;
    public Type: TaskType;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public Model: Model;
    public Approvals: Array<Approval>;
    public ApprovalPlan: Array<TaskApprovalPlan>;
    public User: User;
    public CustomFields: any;
}


export class TransitionFlow extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'TransitionFlow';

    public ToStatusID: number;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public ExpiresDate: Date;
    public EntityType: string;
    public Deleted: boolean;
    public FromStatusID: number;
    public IsDepricated: boolean;
    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public TransitionID: number;
    public _createguid: string;
    public FromStatus: Status;
    public ToStatus: Status;
    public Transition: Transition;
    public CustomFields: any;
}


export class Project extends UniEntity {
    public static RelativeUrl = 'projects';
    public static EntityType = 'Project';

    public CostPrice: number;
    public Total: number;
    public Amount: number;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public ProjectLeadName: string;
    public PlannedEnddate: LocalDate;
    public Price: number;
    public ProjectCustomerID: number;
    public DimensionsID: number;
    public ProjectNumber: string;
    public Description: string;
    public EndDate: LocalDate;
    public Deleted: boolean;
    public PlannedStartdate: LocalDate;
    public StartDate: LocalDate;
    public ProjectNumberSeriesID: number;
    public ID: number;
    public Name: string;
    public StatusCode: number;
    public ProjectNumberNumeric: number;
    public UpdatedBy: string;
    public WorkPlaceAddressID: number;
    public CreatedBy: string;
    public _createguid: string;
    public IsUsed: boolean;
    public ProjectCustomer: Customer;
    public WorkPlaceAddress: Address;
    public ProjectTasks: Array<ProjectTask>;
    public ProjectResources: Array<ProjectResource>;
    public ProjectNumberSeries: NumberSeries;
    public CustomFields: any;
}


export class ProjectResource extends UniEntity {
    public static RelativeUrl = 'projects-resources';
    public static EntityType = 'ProjectResource';

    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Responsibility: string;
    public UserID: number;
    public ProjectID: number;
    public Deleted: boolean;
    public ID: number;
    public Name: string;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public ProjectUser: User;
    public CustomFields: any;
}


export class ProjectResourceSchedule extends UniEntity {
    public static RelativeUrl = 'projects-schedules-resources';
    public static EntityType = 'ProjectResourceSchedule';

    public UpdatedAt: Date;
    public ProjectTaskID: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public ProjectTaskScheduleID: number;
    public ID: number;
    public StatusCode: number;
    public ProjectResourceID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class ProjectTask extends UniEntity {
    public static RelativeUrl = 'projects-tasks';
    public static EntityType = 'ProjectTask';

    public CostPrice: number;
    public Total: number;
    public Amount: number;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Price: number;
    public Description: string;
    public SuggestedNumber: string;
    public ProjectID: number;
    public EndDate: LocalDate;
    public Deleted: boolean;
    public StartDate: LocalDate;
    public Number: string;
    public ID: number;
    public Name: string;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public ProjectTaskSchedules: Array<ProjectTaskSchedule>;
    public ProjectTaskResources: Array<ProjectResourceSchedule>;
    public CustomFields: any;
}


export class ProjectTaskSchedule extends UniEntity {
    public static RelativeUrl = 'projects-tasks-schedules';
    public static EntityType = 'ProjectTaskSchedule';

    public UpdatedAt: Date;
    public ProjectTaskID: number;
    public CreatedAt: Date;
    public EndDate: LocalDate;
    public Deleted: boolean;
    public StartDate: LocalDate;
    public ID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public ScheduleResources: Array<ProjectResourceSchedule>;
    public CustomFields: any;
}


export class BarnepassProduct extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'BarnepassProduct';

    public UpdatedAt: Date;
    public ProductID: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public ID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public Product: Product;
    public CustomFields: any;
}


export class Product extends UniEntity {
    public static RelativeUrl = 'products';
    public static EntityType = 'Product';

    public CostPrice: number;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public PriceIncVat: number;
    public DimensionsID: number;
    public ImageFileID: number;
    public Description: string;
    public Deleted: boolean;
    public AccountID: number;
    public Unit: string;
    public ID: number;
    public Name: string;
    public ListPrice: number;
    public StatusCode: number;
    public CalculateGrossPriceBasedOnNetPrice: boolean;
    public Type: ProductTypeEnum;
    public UpdatedBy: string;
    public PartName: string;
    public DefaultProductCategoryID: number;
    public VariansParentID: number;
    public CreatedBy: string;
    public PriceExVat: number;
    public VatTypeID: number;
    public AverageCost: number;
    public _createguid: string;
    public ProductCategoryLinks: Array<ProductCategoryLink>;
    public VatType: VatType;
    public Account: Account;
    public Dimensions: Dimensions;
    public CustomFields: any;
}


export class NumberSeries extends UniEntity {
    public static RelativeUrl = 'number-series';
    public static EntityType = 'NumberSeries';

    public UpdatedAt: Date;
    public FromNumber: number;
    public CreatedAt: Date;
    public ToNumber: number;
    public NumberSeriesTaskID: number;
    public Comment: string;
    public DisplayName: string;
    public NextNumber: number;
    public Empty: boolean;
    public MainAccountID: number;
    public UseNumbersFromNumberSeriesID: number;
    public Deleted: boolean;
    public NumberSeriesTypeID: number;
    public IsDefaultForTask: boolean;
    public ID: number;
    public AccountYear: number;
    public Name: string;
    public System: boolean;
    public StatusCode: number;
    public Disabled: boolean;
    public UpdatedBy: string;
    public CreatedBy: string;
    public NumberLock: boolean;
    public _createguid: string;
    public IsCopiedFromOtherYear: boolean;
    public NumberSeriesType: NumberSeriesType;
    public UseNumbersFromNumberSeries: NumberSeries;
    public NumberSeriesTask: NumberSeriesTask;
    public MainAccount: Account;
    public CustomFields: any;
}


export class NumberSeriesInvalidOverlap extends UniEntity {
    public static RelativeUrl = 'number-series-invalid-overlaps';
    public static EntityType = 'NumberSeriesInvalidOverlap';

    public NumberSerieTypeAID: number;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public NumberSerieTypeBID: number;
    public ID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public NumberSerieTypeA: NumberSeriesType;
    public NumberSerieTypeB: NumberSeriesType;
    public CustomFields: any;
}


export class NumberSeriesTask extends UniEntity {
    public static RelativeUrl = 'number-series-tasks';
    public static EntityType = 'NumberSeriesTask';

    public UpdatedAt: Date;
    public CreatedAt: Date;
    public EntityType: string;
    public Deleted: boolean;
    public ID: number;
    public Name: string;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public NumberSeries: Array<NumberSeries>;
    public CustomFields: any;
}


export class NumberSeriesType extends UniEntity {
    public static RelativeUrl = 'number-series-types';
    public static EntityType = 'NumberSeriesType';

    public UpdatedAt: Date;
    public CreatedAt: Date;
    public EntityType: string;
    public CanHaveSeveralActiveSeries: boolean;
    public EntitySeriesIDField: string;
    public Yearly: boolean;
    public Deleted: boolean;
    public ID: number;
    public EntityField: string;
    public Name: string;
    public System: boolean;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public Series: Array<NumberSeries>;
    public CustomFields: any;
}


export class EncryptionInfo extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'EncryptionInfo';

    public password: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public description: string;
    public Deleted: boolean;
    public ID: number;
    public type: Type;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class File extends UniEntity {
    public static RelativeUrl = 'files/{entitytype}/{entityid}';
    public static EntityType = 'File';

    public UpdatedAt: Date;
    public PermaLink: string;
    public CreatedAt: Date;
    public OCRData: string;
    public Pages: number;
    public Description: string;
    public Md5: string;
    public Deleted: boolean;
    public encryptionID: number;
    public ContentType: string;
    public StorageReference: string;
    public ID: number;
    public Name: string;
    public Size: string;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public UploadSlot: string;
    public FileTags: Array<FileTag>;
    public EntityLinks: Array<FileEntityLink>;
    public CustomFields: any;
}


export class FileTag extends UniEntity {
    public static RelativeUrl = 'filetags';
    public static EntityType = 'FileTag';

    public TagName: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Status: number;
    public Deleted: boolean;
    public FileID: number;
    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public File: File;
    public CustomFields: any;
}


export class FileEntityLink extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'FileEntityLink';

    public UpdatedAt: Date;
    public CreatedAt: Date;
    public EntityType: string;
    public Deleted: boolean;
    public FileID: number;
    public EntityID: number;
    public ID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public IsAttachment: boolean;
    public _createguid: string;
    public File: File;
    public CustomFields: any;
}


export class ElsaUsageLog extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ElsaUsageLog';

    public DateLogged: Date;
    public UpdatedAt: Date;
    public ProductType: string;
    public CreatedAt: Date;
    public Quantity: number;
    public ExternalReference: string;
    public Deleted: boolean;
    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class AccessPointFormat extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AccessPointFormat';

    public ResourceName: string;
    public UpdatedAt: Date;
    public IncommingID: number;
    public CreatedAt: Date;
    public OutgoingID: number;
    public Deleted: boolean;
    public ID: number;
    public Label: string;
    public Name: string;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class EHFLog extends UniEntity {
    public static RelativeUrl = 'ehf';
    public static EntityType = 'EHFLog';

    public DistributeAt: LocalDate;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public EntityType: string;
    public JobRunExternalRef: string;
    public ExternalReference: string;
    public Deleted: boolean;
    public JobRunID: number;
    public From: string;
    public EntityID: number;
    public ID: number;
    public To: string;
    public Subject: string;
    public StatusCode: number;
    public EntityDisplayValue: string;
    public Type: SharingType;
    public UpdatedBy: string;
    public CreatedBy: string;
    public ExternalMessage: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Department extends UniEntity {
    public static RelativeUrl = 'departments';
    public static EntityType = 'Department';

    public DepartmentNumberSeriesID: number;
    public UpdatedAt: Date;
    public DepartmentManagerName: string;
    public CreatedAt: Date;
    public Description: string;
    public Deleted: boolean;
    public DepartmentNumberNumeric: number;
    public ID: number;
    public DepartmentNumber: string;
    public Name: string;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public DepartmentNumberSeries: NumberSeries;
    public CustomFields: any;
}


export class Dimension10 extends UniEntity {
    public static RelativeUrl = 'Dimension10';
    public static EntityType = 'Dimension10';

    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Description: string;
    public Deleted: boolean;
    public Number: string;
    public ID: number;
    public Name: string;
    public StatusCode: number;
    public NumberNumeric: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Dimension5 extends UniEntity {
    public static RelativeUrl = 'Dimension5';
    public static EntityType = 'Dimension5';

    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Description: string;
    public Deleted: boolean;
    public Number: string;
    public ID: number;
    public Name: string;
    public StatusCode: number;
    public NumberNumeric: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Dimension6 extends UniEntity {
    public static RelativeUrl = 'Dimension6';
    public static EntityType = 'Dimension6';

    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Description: string;
    public Deleted: boolean;
    public Number: string;
    public ID: number;
    public Name: string;
    public StatusCode: number;
    public NumberNumeric: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Dimension7 extends UniEntity {
    public static RelativeUrl = 'Dimension7';
    public static EntityType = 'Dimension7';

    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Description: string;
    public Deleted: boolean;
    public Number: string;
    public ID: number;
    public Name: string;
    public StatusCode: number;
    public NumberNumeric: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Dimension8 extends UniEntity {
    public static RelativeUrl = 'Dimension8';
    public static EntityType = 'Dimension8';

    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Description: string;
    public Deleted: boolean;
    public Number: string;
    public ID: number;
    public Name: string;
    public StatusCode: number;
    public NumberNumeric: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Dimension9 extends UniEntity {
    public static RelativeUrl = 'Dimension9';
    public static EntityType = 'Dimension9';

    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Description: string;
    public Deleted: boolean;
    public Number: string;
    public ID: number;
    public Name: string;
    public StatusCode: number;
    public NumberNumeric: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Dimensions extends UniEntity {
    public static RelativeUrl = 'dimensions';
    public static EntityType = 'Dimensions';

    public UpdatedAt: Date;
    public ProjectTaskID: number;
    public CreatedAt: Date;
    public Dimension9ID: number;
    public ResponsibleID: number;
    public DepartmentID: number;
    public Dimension10ID: number;
    public ProjectID: number;
    public RegionID: number;
    public Deleted: boolean;
    public Dimension8ID: number;
    public ID: number;
    public Dimension5ID: number;
    public Dimension7ID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Dimension6ID: number;
    public _createguid: string;
    public Project: Project;
    public Department: Department;
    public ProjectTask: ProjectTask;
    public Responsible: Responsible;
    public Region: Region;
    public Dimension5: Dimension5;
    public Dimension6: Dimension6;
    public Dimension7: Dimension7;
    public Dimension8: Dimension8;
    public Dimension9: Dimension9;
    public Dimension10: Dimension10;
    public Info: Array<DimensionsInfo>;
    public CustomFields: any;
}


export class DimensionsInfo extends UniEntity {
    public Dimension5Name: string;
    public ProjectName: string;
    public ResponsibleName: string;
    public Dimension7Name: string;
    public Dimension9Number: string;
    public ProjectTaskNumber: string;
    public DepartmentName: string;
    public Dimension8Number: string;
    public Dimension6Name: string;
    public ProjectTaskName: string;
    public DimensionsID: number;
    public ProjectNumber: string;
    public Dimension9Name: string;
    public Dimension10Name: string;
    public RegionName: string;
    public Dimension6Number: string;
    public Dimension5Number: string;
    public ID: number;
    public DepartmentNumber: string;
    public Dimension8Name: string;
    public Dimension7Number: string;
    public Dimension10Number: string;
    public RegionCode: string;
}


export class DimensionSettings extends UniEntity {
    public static RelativeUrl = 'dimensionsettings';
    public static EntityType = 'DimensionSettings';

    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public ID: number;
    public Label: string;
    public Dimension: number;
    public IsActive: boolean;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Region extends UniEntity {
    public static RelativeUrl = 'regions';
    public static EntityType = 'Region';

    public UpdatedAt: Date;
    public CreatedAt: Date;
    public CountryCode: string;
    public Description: string;
    public Deleted: boolean;
    public ID: number;
    public Name: string;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public RegionCode: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Responsible extends UniEntity {
    public static RelativeUrl = 'responsibles';
    public static EntityType = 'Responsible';

    public NameOfResponsible: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Description: string;
    public Deleted: boolean;
    public ID: number;
    public Name: string;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Contract extends UniEntity {
    public static RelativeUrl = 'contracts';
    public static EntityType = 'Contract';

    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Description: string;
    public TeamsUri: string;
    public HashTransactionAddress: string;
    public Deleted: boolean;
    public Hash: string;
    public Engine: ContractEngine;
    public ID: number;
    public Name: string;
    public StatusCode: number;
    public ContractCode: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public Parameters: Array<ContractParameter>;
    public Triggers: Array<ContractTrigger>;
    public RunLogs: Array<ContractRunLog>;
    public CustomFields: any;
}


export class ContractAddress extends UniEntity {
    public static RelativeUrl = 'contractaddresses';
    public static EntityType = 'ContractAddress';

    public Amount: number;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public EntityType: string;
    public Deleted: boolean;
    public ContractAssetID: number;
    public EntityID: number;
    public ID: number;
    public AssetAddress: string;
    public StatusCode: number;
    public Type: AddressType;
    public UpdatedBy: string;
    public ContractID: number;
    public CreatedBy: string;
    public Address: string;
    public _createguid: string;
    public Contract: Contract;
    public ContractAsset: ContractAsset;
    public CustomFields: any;
}


export class ContractAsset extends UniEntity {
    public static RelativeUrl = 'contractassets';
    public static EntityType = 'ContractAsset';

    public UpdatedAt: Date;
    public CreatedAt: Date;
    public IsIssuedByDefinerOnly: boolean;
    public Deleted: boolean;
    public IsPrivate: boolean;
    public SpenderAttested: boolean;
    public ID: number;
    public IsCosignedByDefiner: boolean;
    public IsFixedDenominations: boolean;
    public IsTransferrable: boolean;
    public IsAutoDestroy: boolean;
    public StatusCode: number;
    public Type: AddressType;
    public UpdatedBy: string;
    public ContractID: number;
    public CreatedBy: string;
    public Cap: number;
    public _createguid: string;
    public Contract: Contract;
    public CustomFields: any;
}


export class ContractDebugLog extends UniEntity {
    public static RelativeUrl = 'contractdebuglogs';
    public static EntityType = 'ContractDebugLog';

    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Message: string;
    public Deleted: boolean;
    public ID: number;
    public StatusCode: number;
    public ContractRunLogID: number;
    public Type: ContractEventType;
    public UpdatedBy: string;
    public ContractID: number;
    public CreatedBy: string;
    public _createguid: string;
    public Contract: Contract;
    public ContractRunLog: ContractRunLog;
    public CustomFields: any;
}


export class ContractParameter extends UniEntity {
    public static RelativeUrl = 'contractparameters';
    public static EntityType = 'ContractParameter';

    public Value: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public ID: number;
    public Name: string;
    public StatusCode: number;
    public UpdatedBy: string;
    public ContractID: number;
    public CreatedBy: string;
    public _createguid: string;
    public Contract: Contract;
    public CustomFields: any;
}


export class ContractRunLog extends UniEntity {
    public static RelativeUrl = 'contractrunlogs';
    public static EntityType = 'ContractRunLog';

    public UpdatedAt: Date;
    public CreatedAt: Date;
    public ContractTriggerID: number;
    public Message: string;
    public RunTime: string;
    public Deleted: boolean;
    public ID: number;
    public StatusCode: number;
    public Type: ContractEventType;
    public UpdatedBy: string;
    public ContractID: number;
    public CreatedBy: string;
    public _createguid: string;
    public Contract: Contract;
    public CustomFields: any;
}


export class ContractTransaction extends UniEntity {
    public static RelativeUrl = 'contracttransactions';
    public static EntityType = 'ContractTransaction';

    public ContractAddressID: number;
    public Amount: number;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public SenderAddress: string;
    public Deleted: boolean;
    public ID: number;
    public AssetAddress: string;
    public ReceiverAddress: string;
    public StatusCode: number;
    public UpdatedBy: string;
    public ContractID: number;
    public CreatedBy: string;
    public _createguid: string;
    public Contract: Contract;
    public ContractAddress: ContractAddress;
    public CustomFields: any;
}


export class ContractTrigger extends UniEntity {
    public static RelativeUrl = 'contracttriggers';
    public static EntityType = 'ContractTrigger';

    public OperationFilter: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public ExpressionFilter: string;
    public Deleted: boolean;
    public ID: number;
    public StatusCode: number;
    public Type: ContractEventType;
    public UpdatedBy: string;
    public ContractID: number;
    public CreatedBy: string;
    public ModelFilter: string;
    public _createguid: string;
    public Contract: Contract;
    public CustomFields: any;
}


export class Comment extends UniEntity {
    public static RelativeUrl = 'comments';
    public static EntityType = 'Comment';

    public UpdatedAt: Date;
    public CreatedAt: Date;
    public EntityType: string;
    public Deleted: boolean;
    public EntityID: number;
    public ID: number;
    public AuthorID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Text: string;
    public _createguid: string;
    public Mentioned: Array<Mentioned>;
    public Author: User;
    public CustomFields: any;
}


export class Mentioned extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Mentioned';

    public UpdatedAt: Date;
    public CreatedAt: Date;
    public CommentID: number;
    public UserID: number;
    public Deleted: boolean;
    public ID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public User: User;
    public CustomFields: any;
}


export class ApiKey extends UniEntity {
    public static RelativeUrl = 'apikeys';
    public static EntityType = 'ApiKey';

    public UpdatedAt: Date;
    public FilterDate: LocalDate;
    public CreatedAt: Date;
    public Description: string;
    public Url: string;
    public Deleted: boolean;
    public IntegrationKey: string;
    public ID: number;
    public Encrypt: boolean;
    public ExternalId: string;
    public IntegrationType: TypeOfIntegration;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Altinn extends UniEntity {
    public static RelativeUrl = 'altinn';
    public static EntityType = 'Altinn';

    public UpdatedAt: Date;
    public CreatedAt: Date;
    public PreferredLogin: TypeOfLogin;
    public Deleted: boolean;
    public SystemID: string;
    public ID: number;
    public Language: string;
    public SystemPw: string;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class AltinnReceipt extends UniEntity {
    public static RelativeUrl = 'altinnreceipts';
    public static EntityType = 'AltinnReceipt';

    public UserSign: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public XmlReceipt: string;
    public AltinnResponseData: string;
    public TimeStamp: Date;
    public ReceiptID: number;
    public Deleted: boolean;
    public HasBeenRegistered: boolean;
    public ErrorText: string;
    public ID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public Form: string;
    public CreatedBy: string;
    public _createguid: string;
    public Signings: Array<AltinnSigning>;
    public CustomFields: any;
}


export class AltinnSigning extends UniEntity {
    public static RelativeUrl = 'altinnsigning';
    public static EntityType = 'AltinnSigning';

    public UpdatedAt: Date;
    public AltinnReceiptID: number;
    public CreatedAt: Date;
    public StatusText: string;
    public DateSigned: Date;
    public Deleted: boolean;
    public ID: number;
    public SignatureReference: string;
    public StatusCode: number;
    public SignatureText: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public AltinnReceipt: AltinnReceipt;
    public CustomFields: any;
}


export class Barnepass extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Barnepass';

    public UpdatedAt: Date;
    public CreatedAt: Date;
    public inntektsaar: number;
    public Deleted: boolean;
    public ID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public oppgave: Array<BarnepassOppgave>;
    public CustomFields: any;
}


export class BarnepassOppgave extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'BarnepassOppgave';

    public email: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public BarnepassID: number;
    public paaloeptBeloep: number;
    public Deleted: boolean;
    public foedselsnummer: string;
    public ID: number;
    public navn: string;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class UserRole extends UniEntity {
    public static RelativeUrl = 'userroles';
    public static EntityType = 'UserRole';

    public UpdatedAt: Date;
    public CreatedAt: Date;
    public SharedRoleId: number;
    public UserID: number;
    public Deleted: boolean;
    public ID: number;
    public SharedRoleName: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public User: User;
    public CustomFields: any;
}


export class Role extends UniEntity {
    public static RelativeUrl = 'roles';
    public static EntityType = 'Role';

    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Description: string;
    public Deleted: boolean;
    public ID: number;
    public Label: string;
    public Name: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public RolePermissions: Array<RolePermission>;
    public CustomFields: any;
}


export class RolePermission extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'RolePermission';

    public RoleID: number;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public PermissionID: number;
    public Deleted: boolean;
    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public Permission: Permission;
    public Role: Role;
    public CustomFields: any;
}


export class Permission extends UniEntity {
    public static RelativeUrl = 'permissions';
    public static EntityType = 'Permission';

    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public ID: number;
    public Name: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public RolePermissions: Array<RolePermission>;
    public CustomFields: any;
}


export class AvtaleGiroAgreement extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AvtaleGiroAgreement';

    public DataSender: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Description: string;
    public NextNumber: number;
    public Thumbprint: string;
    public Deleted: boolean;
    public ID: number;
    public KeyPath: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class AvtaleGiroBankAccount extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AvtaleGiroBankAccount';

    public UpdatedAt: Date;
    public AvtaleGiroAgreementID: number;
    public CreatedAt: Date;
    public CompanyID: number;
    public BankAccountNumber: string;
    public Deleted: boolean;
    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public Company: Company;
    public CustomFields: any;
}


export class AvtaleGiroFile extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AvtaleGiroFile';

    public UpdatedAt: Date;
    public AvtaleGiroAgreementID: number;
    public CreatedAt: Date;
    public CompanyID: number;
    public AvtaleGiroContent: string;
    public Deleted: boolean;
    public FileID: number;
    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public AvtaleGiroMergedFileID: number;
    public _createguid: string;
    public Company: Company;
    public CustomFields: any;
}


export class AvtaleGiroMergedFile extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AvtaleGiroMergedFile';

    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public TransmissionNumber: number;
    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class BankAgreement extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'BankAgreement';

    public OrderEmail: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public CompanyID: number;
    public ServiceID: string;
    public ReceiptID: string;
    public CustomerName: string;
    public Deleted: boolean;
    public CustomerOrgNumber: string;
    public ServiceAccountID: number;
    public OrderName: string;
    public AccountOwnerOrgNumber: string;
    public AccountOwnerName: string;
    public OrderMobile: string;
    public ID: number;
    public ReceiptDate: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public ServiceAccount: ServiceAccount;
    public Company: Company;
    public Services: Array<BankService>;
    public CustomFields: any;
}


export class BankService extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'BankService';

    public UpdatedAt: Date;
    public CreatedAt: Date;
    public DivisionName: string;
    public ServiceType: number;
    public DivisionID: number;
    public Deleted: boolean;
    public FileType: string;
    public ID: number;
    public ConfirmInNetbank: boolean;
    public BankAgreementID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public KidRule: string;
    public _createguid: string;
    public BankAgreement: BankAgreement;
    public BankAccounts: Array<BankServiceBankAccount>;
    public CustomFields: any;
}


export class BankServiceBankAccount extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'BankServiceBankAccount';

    public BankServiceID: number;
    public AccountNumber: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public BankService: BankService;
    public CustomFields: any;
}


export class Company extends UniEntity {
    public static RelativeUrl = 'companies';
    public static EntityType = 'Company';

    public UpdatedAt: Date;
    public ConnectionString: string;
    public CreatedAt: Date;
    public FileFlowEmail: string;
    public IsGlobalTemplate: boolean;
    public Key: string;
    public IsTest: boolean;
    public ClientNumber: number;
    public WebHookSubscriberId: string;
    public LastActivity: Date;
    public IsTemplate: boolean;
    public FileFlowOrgnrEmail: string;
    public Deleted: boolean;
    public ID: number;
    public Name: string;
    public OrganizationNumber: string;
    public SchemaName: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class CompanyAccess extends UniEntity {
    public static RelativeUrl = 'companies-access';
    public static EntityType = 'CompanyAccess';

    public UpdatedAt: Date;
    public CreatedAt: Date;
    public CompanyID: number;
    public GlobalIdentity: string;
    public EndDate: Date;
    public Deleted: boolean;
    public StartDate: Date;
    public Roles: string;
    public ID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class CompanyBackup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'CompanyBackup';

    public ScheduledForDeleteAt: Date;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public ContainerName: string;
    public ContractType: number;
    public Message: string;
    public CustomerName: string;
    public Reason: string;
    public OrgNumber: string;
    public Deleted: boolean;
    public CopyFiles: boolean;
    public CloudBlobName: string;
    public DeletedAt: Date;
    public ID: number;
    public CompanyName: string;
    public Environment: string;
    public SchemaName: string;
    public UpdatedBy: string;
    public CompanyKey: string;
    public ContractID: number;
    public CreatedBy: string;
    public BackupStatus: BackupStatus;
    public _createguid: string;
    public CustomFields: any;
}


export class ContractCron extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ContractCron';

    public UpdatedAt: Date;
    public CreatedAt: Date;
    public CompanyID: number;
    public ContractTriggerID: number;
    public Deleted: boolean;
    public ID: number;
    public Expression: string;
    public UpdatedBy: string;
    public ContractID: number;
    public CreatedBy: string;
    public CompanyDbName: string;
    public _createguid: string;
    public CompanyKey: string;
    public CustomFields: any;
}


export class ContractObyte extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ContractObyte';

    public ContractAddressID: number;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public CompanyID: number;
    public Deleted: boolean;
    public ID: number;
    public AssetAddress: string;
    public UpdatedBy: string;
    public ContractID: number;
    public CreatedBy: string;
    public Address: string;
    public CompanyDbName: string;
    public _createguid: string;
    public CompanyKey: string;
    public CustomFields: any;
}


export class DeniedUserAccessLog extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'DeniedUserAccessLog';

    public Email: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public CompanyID: number;
    public Message: string;
    public Username: string;
    public Deleted: boolean;
    public ID: number;
    public CompanyName: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Occurred: Date;
    public _createguid: string;
    public Company: Company;
    public CustomFields: any;
}


export class FailedBankFile extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'FailedBankFile';

    public FileName: string;
    public UpdatedAt: Date;
    public FileContent: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public ID: number;
    public FailedReason: FailedReasonEnum;
    public UpdatedBy: string;
    public CompanyKey: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class HangfireJob extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'HangfireJob';

    public UpdatedAt: Date;
    public CreatedAt: Date;
    public CompanyID: number;
    public Status: number;
    public JobId: string;
    public GlobalIdentity: string;
    public Completed: boolean;
    public ID: number;
    public CompanyKey: string;
    public HasError: boolean;
    public Year: number;
    public CustomFields: any;
}


export class HangfireJobContext extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'HangfireJobContext';

    public UpdatedAt: Date;
    public CreatedAt: Date;
    public CompanyID: number;
    public Status: number;
    public JobId: string;
    public GlobalIdentity: string;
    public Completed: boolean;
    public ID: number;
    public SchemaName: string;
    public CompanyKey: string;
    public HasError: boolean;
    public Year: number;
    public CustomFields: any;
}


export class HangfireResponse extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'HangfireResponse';

    public UpdatedAt: Date;
    public CreatedAt: Date;
    public CompanyID: number;
    public Status: number;
    public JobId: string;
    public GlobalIdentity: string;
    public Completed: boolean;
    public ID: number;
    public State: string;
    public ProgressUrl: string;
    public CompanyKey: string;
    public HasError: boolean;
    public Year: number;
    public CustomFields: any;
}


export class KpiDefinition extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'KpiDefinition';

    public Interval: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public CompanyID: number;
    public Application: string;
    public IsPerUser: boolean;
    public RoleNames: string;
    public ValueType: KpiValueType;
    public Deleted: boolean;
    public RefreshModels: string;
    public ID: number;
    public Name: string;
    public UpdatedBy: string;
    public SourceType: KpiSourceType;
    public Route: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class KpiValue extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'KpiValue';

    public Total: number;
    public ValueStatus: KpiValueStatus;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public CompanyID: number;
    public KpiDefinitionID: number;
    public UserIdentity: string;
    public KpiName: string;
    public Deleted: boolean;
    public Counter: number;
    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Text: string;
    public LastUpdated: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class OutgoingInvoice extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'OutgoingInvoice';

    public RecipientPhoneNumber: string;
    public InvoiceID: number;
    public Amount: number;
    public UpdatedAt: Date;
    public MetaJson: string;
    public CreatedAt: Date;
    public CompanyID: number;
    public InvoiceType: OutgoingInvoiceType;
    public DueDate: Date;
    public Status: number;
    public ISPOrganizationNumber: string;
    public ExternalReference: string;
    public Deleted: boolean;
    public ID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public RecipientOrganizationNumber: string;
    public _createguid: string;
    public Company: Company;
    public CustomFields: any;
}


export class ProcessFileLog extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ProcessFileLog';

    public EntityCount: number;
    public FileName: string;
    public UpdatedAt: Date;
    public EntityInstanceID: string;
    public CreatedAt: Date;
    public CompanyID: number;
    public Message: string;
    public UserIdentity: string;
    public Deleted: boolean;
    public FileType: number;
    public FileID: number;
    public ID: number;
    public CompanyName: string;
    public StatusCode: number;
    public UpdatedBy: string;
    public CompanyKey: string;
    public EntityName: string;
    public CreatedBy: string;
    public _createguid: string;
    public Company: Company;
    public CustomFields: any;
}


export class ServiceAccount extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ServiceAccount';

    public DataSender: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Description: string;
    public NextNumber: number;
    public Thumbprint: string;
    public Deleted: boolean;
    public ID: number;
    public KeyPath: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class UserVerification extends UniEntity {
    public static RelativeUrl = 'user-verifications';
    public static EntityType = 'UserVerification';

    public Email: string;
    public UpdatedAt: Date;
    public VerificationCode: string;
    public CreatedAt: Date;
    public CompanyId: number;
    public VerificationDate: Date;
    public DisplayName: string;
    public UserId: number;
    public Deleted: boolean;
    public ID: number;
    public ExpirationDate: Date;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Account extends UniEntity {
    public static RelativeUrl = 'accounts';
    public static EntityType = 'Account';

    public AccountNumber: number;
    public CustomerID: number;
    public UpdatedAt: Date;
    public TopLevelAccountGroupID: number;
    public CreatedAt: Date;
    public SaftMappingAccountID: number;
    public DimensionsID: number;
    public DoSynchronize: boolean;
    public Description: string;
    public Active: boolean;
    public Visible: boolean;
    public UseVatDeductionGroupID: number;
    public AccountSetupID: number;
    public Deleted: boolean;
    public Locked: boolean;
    public AccountID: number;
    public EmployeeID: number;
    public CurrencyCodeID: number;
    public CostAllocationID: number;
    public UsePostPost: boolean;
    public ID: number;
    public AccountGroupID: number;
    public SupplierID: number;
    public StatusCode: number;
    public Keywords: string;
    public UpdatedBy: string;
    public AccountName: string;
    public SystemAccount: boolean;
    public CreatedBy: string;
    public LockManualPosts: boolean;
    public VatTypeID: number;
    public _createguid: string;
    public AccountGroup: AccountGroup;
    public TopLevelAccountGroup: AccountGroup;
    public VatType: VatType;
    public MainAccount: Account;
    public Customer: Customer;
    public Supplier: Supplier;
    public Employee: Employee;
    public Dimensions: Dimensions;
    public Alias: Array<AccountAlias>;
    public MandatoryDimensions: Array<AccountMandatoryDimension>;
    public CompatibleAccountGroups: Array<AccountGroup>;
    public SubAccounts: Array<Account>;
    public UseVatDeductionGroup: VatDeductionGroup;
    public CurrencyCode: CurrencyCode;
    public CostAllocation: CostAllocation;
    public SaftMappingAccount: SaftMappingAccount;
    public CustomFields: any;
}


export class AccountAlias extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AccountAlias';

    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public AccountID: number;
    public ID: number;
    public Name: string;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class AccountGroup extends UniEntity {
    public static RelativeUrl = 'accountgroups';
    public static EntityType = 'AccountGroup';

    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Summable: boolean;
    public CompatibleAccountID: number;
    public AccountGroupSetupID: number;
    public Deleted: boolean;
    public AccountID: number;
    public AccountGroupSetID: number;
    public GroupNumber: string;
    public ID: number;
    public Name: string;
    public MainGroupID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public MainGroup: AccountGroup;
    public AccountGroupSet: AccountGroupSet;
    public CustomFields: any;
}


export class AccountGroupSet extends UniEntity {
    public static RelativeUrl = 'accountgroupsets';
    public static EntityType = 'AccountGroupSet';

    public FromAccountNumber: number;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public ID: number;
    public Name: string;
    public System: boolean;
    public StatusCode: number;
    public Shared: boolean;
    public SubAccountAllowed: boolean;
    public UpdatedBy: string;
    public CreatedBy: string;
    public ToAccountNumber: number;
    public _createguid: string;
    public CustomFields: any;
}


export class AccountMandatoryDimension extends UniEntity {
    public static RelativeUrl = 'accountmandatorydimension';
    public static EntityType = 'AccountMandatoryDimension';

    public UpdatedAt: Date;
    public CreatedAt: Date;
    public MandatoryType: number;
    public DimensionNo: number;
    public Deleted: boolean;
    public AccountID: number;
    public ID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Accrual extends UniEntity {
    public static RelativeUrl = 'accruals';
    public static EntityType = 'Accrual';

    public AccrualJournalEntryMode: number;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public BalanceAccountID: number;
    public AccrualAmount: number;
    public Deleted: boolean;
    public ID: number;
    public ResultAccountID: number;
    public JournalEntryLineDraftID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public BalanceAccount: Account;
    public ResultAccount: Account;
    public JournalEntryLineDraft: JournalEntryLineDraft;
    public JournalEntryLines: Array<JournalEntryLine>;
    public Periods: Array<AccrualPeriod>;
    public CustomFields: any;
}


export class AccrualPeriod extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AccrualPeriod';

    public Amount: number;
    public JournalEntryDraftLineID: number;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public PeriodNo: number;
    public ID: number;
    public AccountYear: number;
    public AccrualID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public Accrual: Accrual;
    public JournalEntryLineDraft: JournalEntryLineDraft;
    public CustomFields: any;
}


export class Asset extends UniEntity {
    public static RelativeUrl = 'assets';
    public static EntityType = 'Asset';

    public DepreciationAccountID: number;
    public UpdatedAt: Date;
    public Lifetime: number;
    public CreatedAt: Date;
    public AutoDepreciation: boolean;
    public BalanceAccountID: number;
    public DimensionsID: number;
    public Deleted: boolean;
    public ScrapValue: number;
    public AssetGroupCode: string;
    public NetFinancialValue: number;
    public ID: number;
    public DepreciationStartDate: LocalDate;
    public Name: string;
    public StatusCode: number;
    public PurchaseDate: LocalDate;
    public DepreciationCycle: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public PurchaseAmount: number;
    public CurrentNetFinancialValue: number;
    public _createguid: string;
    public Status: string;
    public BalanceAccount: Account;
    public DepreciationAccount: Account;
    public Dimensions: Dimensions;
    public DepreciationLines: Array<DepreciationLine>;
    public CustomFields: any;
}


export class Bank extends UniEntity {
    public static RelativeUrl = 'banks';
    public static EntityType = 'Bank';

    public UpdatedAt: Date;
    public CreatedAt: Date;
    public InitialBIC: string;
    public Web: string;
    public EmailID: number;
    public Deleted: boolean;
    public BIC: string;
    public ID: number;
    public AddressID: number;
    public Name: string;
    public PhoneID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public Address: Address;
    public Phone: Phone;
    public Email: Email;
    public CustomFields: any;
}


export class BankAccount extends UniEntity {
    public static RelativeUrl = 'bankaccounts';
    public static EntityType = 'BankAccount';

    public IntegrationSettings: string;
    public AccountNumber: string;
    public BankAccountType: string;
    public UpdatedAt: Date;
    public BusinessRelationID: number;
    public CreatedAt: Date;
    public IBAN: string;
    public IntegrationStatus: number;
    public CompanySettingsID: number;
    public Deleted: boolean;
    public Locked: boolean;
    public AccountID: number;
    public BankID: number;
    public ID: number;
    public Label: string;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public Account: Account;
    public Bank: Bank;
    public BusinessRelation: BusinessRelation;
    public CompanySettings: CompanySettings;
    public CustomFields: any;
}


export class BankIntegrationAgreement extends UniEntity {
    public static RelativeUrl = 'bank-agreements';
    public static EntityType = 'BankIntegrationAgreement';

    public Email: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public BankAcceptance: boolean;
    public ServiceID: string;
    public IsInbound: boolean;
    public ServiceTemplateID: string;
    public HasNewAccountInformation: boolean;
    public Deleted: boolean;
    public BankAccountID: number;
    public IsOutgoing: boolean;
    public HasOrderedIntegrationChange: boolean;
    public PropertiesJson: string;
    public ServiceProvider: number;
    public ID: number;
    public Name: string;
    public IsBankBalance: boolean;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public DefaultAgreement: boolean;
    public Password: string;
    public _createguid: string;
    public BankAccount: BankAccount;
    public CustomFields: any;
}


export class BankRule extends UniEntity {
    public static RelativeUrl = 'bankrules';
    public static EntityType = 'BankRule';

    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public Rule: string;
    public AccountID: number;
    public ID: number;
    public IsActive: boolean;
    public Name: string;
    public StatusCode: number;
    public Priority: number;
    public ActionCode: ActionCodeBankRule;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public Account: Account;
    public CustomFields: any;
}


export class BankStatement extends UniEntity {
    public static RelativeUrl = 'bankstatements';
    public static EntityType = 'BankStatement';

    public AmountCurrency: number;
    public Amount: number;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public EndBalance: number;
    public CurrencyCode: string;
    public ToDate: LocalDate;
    public Deleted: boolean;
    public AccountID: number;
    public BankAccountID: number;
    public ArchiveReference: string;
    public FileID: number;
    public StartBalance: number;
    public FromDate: LocalDate;
    public ID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public BankAccount: BankAccount;
    public Entries: Array<BankStatementEntry>;
    public Account: Account;
    public File: File;
    public CustomFields: any;
}


export class BankStatementEntry extends UniEntity {
    public static RelativeUrl = 'bankstatemententries';
    public static EntityType = 'BankStatementEntry';

    public TransactionId: string;
    public CID: string;
    public ReceiverAccount: string;
    public AmountCurrency: number;
    public Amount: number;
    public UpdatedAt: Date;
    public StructuredReference: string;
    public CreatedAt: Date;
    public Category: string;
    public OpenAmountCurrency: number;
    public SenderName: string;
    public CurrencyCode: string;
    public Description: string;
    public Deleted: boolean;
    public InvoiceNumber: string;
    public ValueDate: LocalDate;
    public ArchiveReference: string;
    public SenderAccount: string;
    public Receivername: string;
    public BookingDate: LocalDate;
    public ID: number;
    public BankStatementID: number;
    public OpenAmount: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public BankStatement: BankStatement;
    public CustomFields: any;
}


export class BankStatementMatch extends UniEntity {
    public static RelativeUrl = 'bankstatementmatch';
    public static EntityType = 'BankStatementMatch';

    public Amount: number;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public BankStatementEntryID: number;
    public Deleted: boolean;
    public Group: string;
    public ID: number;
    public Batch: string;
    public StatusCode: number;
    public JournalEntryLineID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public BankStatementEntry: BankStatementEntry;
    public JournalEntryLine: JournalEntryLine;
    public CustomFields: any;
}


export class BankStatementRule extends UniEntity {
    public static RelativeUrl = 'bankstatementrules';
    public static EntityType = 'BankStatementRule';

    public UpdatedAt: Date;
    public CreatedAt: Date;
    public DimensionsID: number;
    public Deleted: boolean;
    public Rule: string;
    public AccountID: number;
    public EntryText: string;
    public ID: number;
    public IsActive: boolean;
    public Name: string;
    public StatusCode: number;
    public Priority: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public Dimensions: Dimensions;
    public Account: Account;
    public CustomFields: any;
}


export class Budget extends UniEntity {
    public static RelativeUrl = 'budgets';
    public static EntityType = 'Budget';

    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public ID: number;
    public AccountingYear: number;
    public Name: string;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public Entries: Array<BudgetEntry>;
    public CustomFields: any;
}


export class BudgetEntry extends UniEntity {
    public static RelativeUrl = 'budgetentries';
    public static EntityType = 'BudgetEntry';

    public Amount: number;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public BudgetID: number;
    public DimensionsID: number;
    public Deleted: boolean;
    public AccountID: number;
    public ID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public PeriodNumber: number;
    public _createguid: string;
    public Budget: Budget;
    public Account: Account;
    public Dimensions: Dimensions;
    public CustomFields: any;
}


export class CompanyAccountingSettings extends UniEntity {
    public static RelativeUrl = 'companyaccountingsettings';
    public static EntityType = 'CompanyAccountingSettings';

    public UpdatedAt: Date;
    public CreatedAt: Date;
    public AssetSaleLossVatAccountID: number;
    public AssetSaleProfitNoVatAccountID: number;
    public Deleted: boolean;
    public AssetSaleLossBalancingAccountID: number;
    public AssetSaleProfitBalancingAccountID: number;
    public ReInvoicingTurnoverProductID: number;
    public ReInvoicingMethod: number;
    public ID: number;
    public ReInvoicingCostsharingProductID: number;
    public AssetSaleProductID: number;
    public AssetWriteoffAccountID: number;
    public StatusCode: number;
    public AssetSaleProfitVatAccountID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public AssetSaleLossNoVatAccountID: number;
    public _createguid: string;
    public ReInvoicingCostsharingProduct: Product;
    public ReInvoicingTurnoverProduct: Product;
    public CustomFields: any;
}


export class CompanyBankAccount extends UniEntity {
    public static RelativeUrl = 'companybankaccounts';
    public static EntityType = 'CompanyBankAccount';

    public IsSalary: boolean;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public IsIncomming: boolean;
    public Deleted: boolean;
    public AccountID: number;
    public BankAccountID: number;
    public IsOutgoing: boolean;
    public ID: number;
    public Name: string;
    public StatusCode: number;
    public CreditAmount: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public IsTax: boolean;
    public _createguid: string;
    public BankAccount: BankAccount;
    public Account: Account;
    public CustomFields: any;
}


export class CostAllocation extends UniEntity {
    public static RelativeUrl = 'costallocations';
    public static EntityType = 'CostAllocation';

    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public ID: number;
    public Name: string;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public Items: Array<CostAllocationItem>;
    public CustomFields: any;
}


export class CostAllocationItem extends UniEntity {
    public static RelativeUrl = 'costallocationitems';
    public static EntityType = 'CostAllocationItem';

    public Amount: number;
    public Percent: number;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public DimensionsID: number;
    public Description: string;
    public Deleted: boolean;
    public AccountID: number;
    public CostAllocationID: number;
    public ID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public VatTypeID: number;
    public _createguid: string;
    public Account: Account;
    public VatType: VatType;
    public Dimensions: Dimensions;
    public CustomFields: any;
}


export class CustomLiquidityPayment extends UniEntity {
    public static RelativeUrl = 'liquiditypayment';
    public static EntityType = 'CustomLiquidityPayment';

    public CustomLiquidityPaymentType: CustomLiquidityPaymentInterval;
    public AmountCurrency: number;
    public Amount: number;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public DueDate: LocalDate;
    public Description: string;
    public EndDate: LocalDate;
    public Deleted: boolean;
    public CurrencyCodeID: number;
    public ID: number;
    public IsCustomerPayment: boolean;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public currency: CurrencyCode;
    public CustomFields: any;
}


export class DepreciationLine extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'DepreciationLine';

    public UpdatedAt: Date;
    public CreatedAt: Date;
    public AssetID: number;
    public DepreciationType: number;
    public DepreciationJELineID: number;
    public Deleted: boolean;
    public ID: number;
    public StatusCode: number;
    public AssetJELineID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public DepreciationJELine: JournalEntryLine;
    public AssetJELine: JournalEntryLine;
    public CustomFields: any;
}


export class FinancialYear extends UniEntity {
    public static RelativeUrl = 'financialyears';
    public static EntityType = 'FinancialYear';

    public UpdatedAt: Date;
    public CreatedAt: Date;
    public ValidTo: LocalDate;
    public Deleted: boolean;
    public ID: number;
    public ValidFrom: LocalDate;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Year: number;
    public _createguid: string;
    public CustomFields: any;
}


export class JournalEntry extends UniEntity {
    public static RelativeUrl = 'journalentries';
    public static EntityType = 'JournalEntry';

    public UpdatedAt: Date;
    public CreatedAt: Date;
    public JournalEntryNumberNumeric: number;
    public NumberSeriesTaskID: number;
    public Description: string;
    public JournalEntryNumber: string;
    public Deleted: boolean;
    public FinancialYearID: number;
    public JournalEntryDraftGroup: string;
    public JournalEntryAccrualID: number;
    public ID: number;
    public NumberSeriesID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public CanSkipMandatoryDimension: boolean;
    public FinancialYear: FinancialYear;
    public Lines: Array<JournalEntryLine>;
    public DraftLines: Array<JournalEntryLineDraft>;
    public NumberSeriesTask: NumberSeriesTask;
    public NumberSeries: NumberSeries;
    public JournalEntryAccrual: Accrual;
    public CustomFields: any;
}


export class JournalEntryLine extends UniEntity {
    public static RelativeUrl = 'journalentrylines';
    public static EntityType = 'JournalEntryLine';

    public RegisteredDate: LocalDate;
    public SubAccountID: number;
    public RestAmountCurrency: number;
    public AmountCurrency: number;
    public FinancialDate: LocalDate;
    public Amount: number;
    public OriginalJournalEntryPost: number;
    public PeriodID: number;
    public UpdatedAt: Date;
    public PaymentID: string;
    public CustomerInvoiceID: number;
    public VatReportID: number;
    public CreatedAt: Date;
    public JournalEntryNumberNumeric: number;
    public ReferenceCreditPostID: number;
    public VatPeriodID: number;
    public TaxBasisAmountCurrency: number;
    public DueDate: LocalDate;
    public DimensionsID: number;
    public VatJournalEntryPostID: number;
    public OriginalReferencePostID: number;
    public CurrencyExchangeRate: number;
    public Description: string;
    public JournalEntryTypeID: number;
    public JournalEntryNumber: string;
    public RestAmount: number;
    public CustomerOrderID: number;
    public PostPostJournalEntryLineID: number;
    public VatDate: LocalDate;
    public Deleted: boolean;
    public AccountID: number;
    public InvoiceNumber: string;
    public CurrencyCodeID: number;
    public PaymentInfoTypeID: number;
    public BatchNumber: number;
    public ID: number;
    public VatPercent: number;
    public SupplierInvoiceID: number;
    public AccrualID: number;
    public JournalEntryLineDraftID: number;
    public JournalEntryID: number;
    public VatDeductionPercent: number;
    public Signature: string;
    public StatusCode: number;
    public TaxBasisAmount: number;
    public ReferenceOriginalPostID: number;
    public PaymentReferenceID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public VatTypeID: number;
    public _createguid: string;
    public JournalEntry: JournalEntry;
    public CurrencyCode: CurrencyCode;
    public Period: Period;
    public VatPeriod: Period;
    public VatType: VatType;
    public VatJournalEntryPost: JournalEntryLine;
    public Account: Account;
    public SubAccount: Account;
    public ReferenceCreditPost: JournalEntryLine;
    public OriginalReferencePost: JournalEntryLine;
    public ReferenceOriginalPost: JournalEntryLine;
    public Dimensions: Dimensions;
    public CustomerInvoice: CustomerInvoice;
    public SupplierInvoice: SupplierInvoice;
    public VatReport: VatReport;
    public JournalEntryType: JournalEntryType;
    public Accrual: Accrual;
    public JournalEntryLineDraft: JournalEntryLineDraft;
    public CustomerOrder: CustomerOrder;
    public CustomFields: any;
}


export class JournalEntryLineDraft extends UniEntity {
    public static RelativeUrl = 'journalentrylinedrafts';
    public static EntityType = 'JournalEntryLineDraft';

    public RegisteredDate: LocalDate;
    public SubAccountID: number;
    public AmountCurrency: number;
    public FinancialDate: LocalDate;
    public Amount: number;
    public PeriodID: number;
    public UpdatedAt: Date;
    public PaymentID: string;
    public CustomerInvoiceID: number;
    public CreatedAt: Date;
    public JournalEntryNumberNumeric: number;
    public VatPeriodID: number;
    public TaxBasisAmountCurrency: number;
    public DueDate: LocalDate;
    public DimensionsID: number;
    public CurrencyExchangeRate: number;
    public Description: string;
    public JournalEntryTypeID: number;
    public JournalEntryNumber: string;
    public CustomerOrderID: number;
    public PostPostJournalEntryLineID: number;
    public VatDate: LocalDate;
    public Deleted: boolean;
    public AccountID: number;
    public InvoiceNumber: string;
    public CurrencyCodeID: number;
    public PaymentInfoTypeID: number;
    public BatchNumber: number;
    public ID: number;
    public VatPercent: number;
    public SupplierInvoiceID: number;
    public AccrualID: number;
    public JournalEntryID: number;
    public VatDeductionPercent: number;
    public Signature: string;
    public StatusCode: number;
    public TaxBasisAmount: number;
    public PaymentReferenceID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public VatTypeID: number;
    public _createguid: string;
    public VatIsCaluclauted: boolean;
    public CurrencyCode: CurrencyCode;
    public Period: Period;
    public VatPeriod: Period;
    public VatType: VatType;
    public Account: Account;
    public SubAccount: Account;
    public Dimensions: Dimensions;
    public CustomerInvoice: CustomerInvoice;
    public SupplierInvoice: SupplierInvoice;
    public JournalEntryType: JournalEntryType;
    public Accrual: Accrual;
    public CustomerOrder: CustomerOrder;
    public CustomFields: any;
}


export class JournalEntryMode extends UniEntity {
    public static RelativeUrl = 'journalEntryModes';
    public static EntityType = 'JournalEntryMode';

    public ColumnSetUp: string;
    public UpdatedAt: Date;
    public VisibleModules: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public TraceLinkTypes: string;
    public ID: number;
    public Name: string;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class JournalEntrySourceSerie extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'JournalEntrySourceSerie';

    public UpdatedAt: Date;
    public CreatedAt: Date;
    public JournalEntrySourceID: number;
    public Deleted: boolean;
    public ID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public JournalEntrySourceEntityName: string;
    public JournalEntrySourceInstanceID: number;
    public CustomFields: any;
}


export class JournalEntryType extends UniEntity {
    public static RelativeUrl = 'journalentrytypes';
    public static EntityType = 'JournalEntryType';

    public UpdatedAt: Date;
    public CreatedAt: Date;
    public DisplayName: string;
    public Deleted: boolean;
    public ExpectNegativeAmount: boolean;
    public MainName: string;
    public Number: number;
    public ID: number;
    public Name: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class LedgerSuggestion extends UniEntity {
    public Source: SuggestionSource;
    public IndustryName: string;
    public OrgNumber: string;
    public BusinessType: string;
    public ID: number;
    public Name: string;
    public IndustryCode: string;
}


export class Payment extends UniEntity {
    public static RelativeUrl = 'payments';
    public static EntityType = 'Payment';

    public XmlTagEndToEndIdReference: string;
    public AmountCurrency: number;
    public Amount: number;
    public UpdatedAt: Date;
    public PaymentID: string;
    public ToBankAccountID: number;
    public OcrPaymentStrings: string;
    public CustomerInvoiceID: number;
    public BusinessRelationID: number;
    public PaymentDate: LocalDate;
    public CreatedAt: Date;
    public StatusText: string;
    public PaymentStatusReportFileID: number;
    public XmlTagPmtInfIdReference: string;
    public PaymentBatchID: number;
    public PaymentCodeID: number;
    public DueDate: LocalDate;
    public IsPaymentClaim: boolean;
    public CurrencyExchangeRate: number;
    public Description: string;
    public PaymentNotificationReportFileID: number;
    public InPaymentID: string;
    public SerialNumberOrAcctSvcrRef: string;
    public ExternalBankAccountNumber: string;
    public Deleted: boolean;
    public Debtor: string;
    public InvoiceNumber: string;
    public BankChargeAmount: number;
    public IsPaymentCancellationRequest: boolean;
    public CustomerInvoiceReminderID: number;
    public CurrencyCodeID: number;
    public ReconcilePayment: boolean;
    public ID: number;
    public IsExternal: boolean;
    public SupplierInvoiceID: number;
    public AutoJournal: boolean;
    public IsCustomerPayment: boolean;
    public Proprietary: string;
    public FromBankAccountID: number;
    public JournalEntryID: number;
    public StatusCode: number;
    public Domain: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public DimensionsID: number;
    public PaymentBatch: PaymentBatch;
    public BusinessRelation: BusinessRelation;
    public FromBankAccount: BankAccount;
    public ToBankAccount: BankAccount;
    public CurrencyCode: CurrencyCode;
    public PaymentCode: PaymentCode;
    public CustomerInvoice: CustomerInvoice;
    public SupplierInvoice: SupplierInvoice;
    public CustomerInvoiceReminder: CustomerInvoiceReminder;
    public CustomFields: any;
}


export class PaymentBatch extends UniEntity {
    public static RelativeUrl = 'paymentbatches';
    public static EntityType = 'PaymentBatch';

    public PaymentFileID: number;
    public Camt054CMsgId: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public PaymentStatusReportFileID: number;
    public PaymentBatchTypeID: number;
    public TransferredDate: Date;
    public Deleted: boolean;
    public OcrTransmissionNumber: number;
    public ID: number;
    public OcrHeadingStrings: string;
    public IsCustomerPayment: boolean;
    public TotalAmount: number;
    public ReceiptDate: Date;
    public StatusCode: number;
    public PaymentReferenceID: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public NumberOfPayments: number;
    public _createguid: string;
    public Payments: Array<Payment>;
    public PaymentBatchType: PaymentBatchType;
    public CustomFields: any;
}


export class PostPost extends UniEntity {
    public static RelativeUrl = 'postposts';
    public static EntityType = 'PostPost';

    public AmountCurrency: number;
    public Amount: number;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public CurrencyExchangeRate: number;
    public Deleted: boolean;
    public CurrencyCodeID: number;
    public ID: number;
    public JournalEntryLine2ID: number;
    public StatusCode: number;
    public Date: LocalDate;
    public UpdatedBy: string;
    public CreatedBy: string;
    public JournalEntryLine1ID: number;
    public _createguid: string;
    public JournalEntryLine1: JournalEntryLine;
    public JournalEntryLine2: JournalEntryLine;
    public CurrencyCode: CurrencyCode;
    public CustomFields: any;
}


export class ReInvoice extends UniEntity {
    public static RelativeUrl = 'reinvoicing';
    public static EntityType = 'ReInvoice';

    public TaxInclusiveAmount: number;
    public UpdatedAt: Date;
    public ProductID: number;
    public TaxExclusiveAmount: number;
    public CreatedAt: Date;
    public OwnCostAmount: number;
    public ReInvoicingType: number;
    public OwnCostShare: number;
    public Deleted: boolean;
    public ID: number;
    public SupplierInvoiceID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public SupplierInvoice: SupplierInvoice;
    public Product: Product;
    public Items: Array<ReInvoiceItem>;
    public CustomFields: any;
}


export class ReInvoiceItem extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ReInvoiceItem';

    public CustomerID: number;
    public ReInvoiceID: number;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Vat: number;
    public Share: number;
    public Surcharge: number;
    public Deleted: boolean;
    public ID: number;
    public GrossAmount: number;
    public NetAmount: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public Customer: Customer;
    public CustomFields: any;
}


export class SupplierInvoice extends UniEntity {
    public static RelativeUrl = 'supplierinvoices';
    public static EntityType = 'SupplierInvoice';

    public TaxInclusiveAmount: number;
    public InvoiceOriginType: SupplierInvoiceOriginType;
    public RestAmountCurrency: number;
    public PayableRoundingAmount: number;
    public ReInvoiceID: number;
    public InvoiceAddressLine1: string;
    public OurReference: string;
    public UpdatedAt: Date;
    public PaymentID: string;
    public ShippingAddressLine3: string;
    public Payment: string;
    public TaxExclusiveAmount: number;
    public CustomerPerson: string;
    public PaymentTermsID: number;
    public CreatedAt: Date;
    public ShippingAddressLine1: string;
    public Credited: boolean;
    public PayableRoundingCurrencyAmount: number;
    public VatTotalsAmount: number;
    public ShippingCity: string;
    public DeliveryName: string;
    public InvoiceReceiverName: string;
    public IsSentToPayment: boolean;
    public InvoiceType: number;
    public TaxExclusiveAmountCurrency: number;
    public PaymentInformation: string;
    public DeliveryTermsID: number;
    public Comment: string;
    public DefaultDimensionsID: number;
    public CurrencyExchangeRate: number;
    public InternalNote: string;
    public InvoiceAddressLine3: string;
    public ProjectID: number;
    public SupplierOrgNumber: string;
    public RestAmount: number;
    public CreditedAmountCurrency: number;
    public PaymentStatus: number;
    public DeliveryDate: LocalDate;
    public PaymentDueDate: LocalDate;
    public Deleted: boolean;
    public CustomerOrgNumber: string;
    public InvoiceNumber: string;
    public BankAccountID: number;
    public YourReference: string;
    public TaxInclusiveAmountCurrency: number;
    public CurrencyCodeID: number;
    public InvoiceAddressLine2: string;
    public InvoiceCity: string;
    public AmountRegards: string;
    public ID: number;
    public DeliveryMethod: string;
    public InvoiceCountry: string;
    public InvoiceDate: LocalDate;
    public PaymentTerm: string;
    public InvoicePostalCode: string;
    public SalesPerson: string;
    public ShippingPostalCode: string;
    public ShippingCountry: string;
    public FreeTxt: string;
    public JournalEntryID: number;
    public DeliveryTerm: string;
    public ShippingAddressLine2: string;
    public SupplierID: number;
    public StatusCode: number;
    public CreditedAmount: number;
    public ReInvoiced: boolean;
    public Requisition: string;
    public InvoiceReferenceID: number;
    public VatTotalsAmountCurrency: number;
    public UpdatedBy: string;
    public CreditDays: number;
    public InvoiceCountryCode: string;
    public ShippingCountryCode: string;
    public CreatedBy: string;
    public PrintStatus: number;
    public _createguid: string;
    public Payments: Array<Payment>;
    public BankAccount: BankAccount;
    public JournalEntry: JournalEntry;
    public DefaultDimensions: Dimensions;
    public Supplier: Supplier;
    public CurrencyCode: CurrencyCode;
    public Items: Array<SupplierInvoiceItem>;
    public InvoiceReference: SupplierInvoice;
    public ReInvoice: ReInvoice;
    public CustomFields: any;
}


export class SupplierInvoiceItem extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'SupplierInvoiceItem';

    public PriceExVatCurrency: number;
    public UpdatedAt: Date;
    public ProductID: number;
    public CreatedAt: Date;
    public PriceIncVat: number;
    public Discount: number;
    public SumTotalIncVatCurrency: number;
    public DimensionsID: number;
    public Comment: string;
    public CurrencyExchangeRate: number;
    public SumVatCurrency: number;
    public SumTotalExVatCurrency: number;
    public NumberOfItems: number;
    public Deleted: boolean;
    public CurrencyCodeID: number;
    public InvoicePeriodEndDate: LocalDate;
    public SortIndex: number;
    public Unit: string;
    public DiscountPercent: number;
    public ID: number;
    public DiscountCurrency: number;
    public VatPercent: number;
    public SupplierInvoiceID: number;
    public SumTotalExVat: number;
    public SumTotalIncVat: number;
    public StatusCode: number;
    public AccountingCost: string;
    public CalculateGrossPriceBasedOnNetPrice: boolean;
    public InvoicePeriodStartDate: LocalDate;
    public UpdatedBy: string;
    public SumVat: number;
    public ItemText: string;
    public CreatedBy: string;
    public PriceExVat: number;
    public VatTypeID: number;
    public PriceSetByUser: boolean;
    public _createguid: string;
    public VatDate: LocalDate;
    public Product: Product;
    public VatType: VatType;
    public Dimensions: Dimensions;
    public CurrencyCode: CurrencyCode;
    public CustomFields: any;
}


export class VatCodeGroup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'VatCodeGroup';

    public UpdatedAt: Date;
    public No: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public ID: number;
    public Name: string;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class VatDeduction extends UniEntity {
    public static RelativeUrl = 'vatdeductions';
    public static EntityType = 'VatDeduction';

    public UpdatedAt: Date;
    public CreatedAt: Date;
    public ValidTo: LocalDate;
    public Deleted: boolean;
    public ID: number;
    public ValidFrom: LocalDate;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public VatDeductionGroupID: number;
    public DeductionPercent: number;
    public _createguid: string;
    public VatDeductionGroup: VatDeductionGroup;
    public CustomFields: any;
}


export class VatDeductionGroup extends UniEntity {
    public static RelativeUrl = 'vatdeductiongroups';
    public static EntityType = 'VatDeductionGroup';

    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public ID: number;
    public Name: string;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class VatPost extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'VatPost';

    public UpdatedAt: Date;
    public No: string;
    public CreatedAt: Date;
    public ReportAsNegativeAmount: boolean;
    public Deleted: boolean;
    public ID: number;
    public Name: string;
    public VatCodeGroupID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public HasTaxAmount: boolean;
    public HasTaxBasis: boolean;
    public CreatedBy: string;
    public _createguid: string;
    public VatCodeGroup: VatCodeGroup;
    public VatReportReferences: Array<VatReportReference>;
    public CustomFields: any;
}


export class VatReport extends UniEntity {
    public static RelativeUrl = 'vatreports';
    public static EntityType = 'VatReport';

    public ExternalRefNo: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public ExecutedDate: Date;
    public Comment: string;
    public Title: string;
    public TerminPeriodID: number;
    public Deleted: boolean;
    public ID: number;
    public ReportedDate: Date;
    public VatReportTypeID: number;
    public JournalEntryID: number;
    public StatusCode: number;
    public VatReportArchivedSummaryID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public InternalComment: string;
    public _createguid: string;
    public TerminPeriod: Period;
    public VatReportType: VatReportType;
    public JournalEntry: JournalEntry;
    public VatReportArchivedSummary: VatReportArchivedSummary;
    public CustomFields: any;
}


export class VatReportArchivedSummary extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'VatReportArchivedSummary';

    public ReportName: string;
    public UpdatedAt: Date;
    public PaymentID: string;
    public CreatedAt: Date;
    public SummaryHeader: string;
    public PaymentToDescription: string;
    public AmountToBePayed: number;
    public PaymentDueDate: Date;
    public AmountToBeReceived: number;
    public Deleted: boolean;
    public PaymentBankAccountNumber: string;
    public ID: number;
    public PaymentYear: number;
    public PaymentPeriod: string;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class VatReportReference extends UniEntity {
    public static RelativeUrl = 'vatreportreferences';
    public static EntityType = 'VatReportReference';

    public VatPostID: number;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public AccountID: number;
    public ID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public VatTypeID: number;
    public _createguid: string;
    public VatType: VatType;
    public VatPost: VatPost;
    public Account: Account;
    public CustomFields: any;
}


export class VatReportType extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'VatReportType';

    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public ID: number;
    public Name: string;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class VatType extends UniEntity {
    public static RelativeUrl = 'vattypes';
    public static EntityType = 'VatType';

    public OutgoingAccountID: number;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Alias: string;
    public OutputVat: boolean;
    public VatTypeSetupID: number;
    public InUse: boolean;
    public Visible: boolean;
    public Deleted: boolean;
    public Locked: boolean;
    public ID: number;
    public ReversedTaxDutyVat: boolean;
    public Name: string;
    public AvailableInModules: boolean;
    public VatCodeGroupingValue: VatCodeGroupingValueEnum;
    public VatCodeGroupID: number;
    public StatusCode: number;
    public DirectJournalEntryOnly: boolean;
    public VatCode: string;
    public IncomingAccountID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public VatPercent: number;
    public VatCodeGroup: VatCodeGroup;
    public OutgoingAccount: Account;
    public IncomingAccount: Account;
    public VatTypePercentages: Array<VatTypePercentage>;
    public VatReportReferences: Array<VatReportReference>;
    public CustomFields: any;
}


export class VatTypePercentage extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'VatTypePercentage';

    public UpdatedAt: Date;
    public CreatedAt: Date;
    public ValidTo: LocalDate;
    public Deleted: boolean;
    public ID: number;
    public VatPercent: number;
    public ValidFrom: LocalDate;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public VatTypeID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class EntityValidationRule extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'EntityValidationRule';

    public Operation: OperationType;
    public Value: string;
    public UpdatedAt: Date;
    public SyncKey: string;
    public CreatedAt: Date;
    public EntityType: string;
    public ChangedByCompany: boolean;
    public Message: string;
    public Deleted: boolean;
    public Level: ValidationLevel;
    public ID: number;
    public System: boolean;
    public PropertyName: string;
    public UpdatedBy: string;
    public OnConflict: OnConflict;
    public CreatedBy: string;
    public Operator: Operator;
    public _createguid: string;
    public CustomFields: any;
}


export class EntityValidationRuleTemplate extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'EntityValidationRuleTemplate';

    public Operation: OperationType;
    public Value: string;
    public UpdatedAt: Date;
    public SyncKey: string;
    public CreatedAt: Date;
    public EntityType: string;
    public ChangedByCompany: boolean;
    public Message: string;
    public Deleted: boolean;
    public Level: ValidationLevel;
    public ID: number;
    public System: boolean;
    public PropertyName: string;
    public UpdatedBy: string;
    public OnConflict: OnConflict;
    public CreatedBy: string;
    public Operator: Operator;
    public _createguid: string;
    public CustomFields: any;
}


export class ComplexValidationRule extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ComplexValidationRule';

    public Operation: OperationType;
    public UpdatedAt: Date;
    public SyncKey: string;
    public CreatedAt: Date;
    public EntityType: string;
    public ChangedByCompany: boolean;
    public Message: string;
    public Deleted: boolean;
    public Level: ValidationLevel;
    public ID: number;
    public System: boolean;
    public UpdatedBy: string;
    public OnConflict: OnConflict;
    public CreatedBy: string;
    public ValidationCode: number;
    public _createguid: string;
    public CustomFields: any;
}


export class ComplexValidationRuleTemplate extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ComplexValidationRuleTemplate';

    public Operation: OperationType;
    public UpdatedAt: Date;
    public SyncKey: string;
    public CreatedAt: Date;
    public EntityType: string;
    public ChangedByCompany: boolean;
    public Message: string;
    public Deleted: boolean;
    public Level: ValidationLevel;
    public ID: number;
    public System: boolean;
    public UpdatedBy: string;
    public OnConflict: OnConflict;
    public CreatedBy: string;
    public ValidationCode: number;
    public _createguid: string;
    public CustomFields: any;
}


export class CustomField extends UniEntity {
    public static RelativeUrl = 'custom-fields';
    public static EntityType = 'CustomField';

    public UpdatedAt: Date;
    public CreatedAt: Date;
    public ModelID: number;
    public Nullable: boolean;
    public Deleted: boolean;
    public ID: number;
    public Name: string;
    public StatusCode: number;
    public UpdatedBy: string;
    public DataType: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class ValueList extends UniEntity {
    public static RelativeUrl = 'valuelists';
    public static EntityType = 'ValueList';

    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Description: string;
    public Deleted: boolean;
    public ID: number;
    public Name: string;
    public Code: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public Items: Array<ValueItem>;
    public CustomFields: any;
}


export class ValueItem extends UniEntity {
    public static RelativeUrl = 'valueitems';
    public static EntityType = 'ValueItem';

    public Value: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Description: string;
    public ValueListID: number;
    public Deleted: boolean;
    public Index: number;
    public ID: number;
    public Name: string;
    public Code: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public ValueList: ValueList;
    public CustomFields: any;
}


export class ComponentLayoutDto extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ComponentLayoutDto';

    public Url: string;
    public BaseEntity: string;
    public Name: string;
    public Fields: Array<FieldLayoutDto>;
    public CustomFields: any;
}


export class FieldLayoutDto extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'FieldLayoutDto';

    public Section: number;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public DisplayField: string;
    public Placement: number;
    public Sectionheader: string;
    public ValueList: string;
    public EntityType: string;
    public FieldSet: number;
    public Description: string;
    public Url: string;
    public Deleted: boolean;
    public LookupEntityType: string;
    public LineBreak: boolean;
    public ID: number;
    public Legend: string;
    public Combo: number;
    public Placeholder: string;
    public HelpText: string;
    public Label: string;
    public ReadOnly: boolean;
    public FieldType: FieldType;
    public StatusCode: number;
    public Alignment: Alignment;
    public Hidden: boolean;
    public ComponentLayoutID: number;
    public Options: string;
    public LookupField: boolean;
    public UpdatedBy: string;
    public Property: string;
    public CreatedBy: string;
    public Width: string;
    public _createguid: string;
    public Validations: Array<EntityValidationRule>;
    public CustomFields: any;
}


export class AssignmentDetails extends UniEntity {
    public Message: string;
}


export class TimeSheet extends UniEntity {
    public ToDate: Date;
    public FromDate: Date;
    public Workflow: TimesheetWorkflow;
    public Relation: WorkRelation;
    public Items: Array<TimeSheetItem>;
}


export class TimeSheetItem extends UniEntity {
    public IsWeekend: boolean;
    public Projecttime: number;
    public ValidTime: number;
    public ExpectedTime: number;
    public Status: WorkStatus;
    public Invoicable: number;
    public TotalTime: number;
    public Flextime: number;
    public Overtime: number;
    public Workflow: TimesheetWorkflow;
    public StartTime: Date;
    public WeekDay: number;
    public TimeOff: number;
    public EndTime: Date;
    public SickTime: number;
    public Date: Date;
    public ValidTimeOff: number;
    public WeekNumber: number;
}


export class WorkBalanceDto extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'WorkBalanceDto';

    public LastDayExpected: number;
    public Days: number;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Description: string;
    public Minutes: number;
    public BalanceDate: Date;
    public ActualMinutes: number;
    public Deleted: boolean;
    public IsStartBalance: boolean;
    public ID: number;
    public BalanceFrom: Date;
    public LastDayActual: number;
    public ValidFrom: Date;
    public SumOvertime: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public WorkRelationID: number;
    public Balancetype: WorkBalanceTypeEnum;
    public CreatedBy: string;
    public ValidTimeOff: number;
    public ExpectedMinutes: number;
    public _createguid: string;
    public Previous: BalanceInfo;
    public Details: Array<FlexDetail>;
    public WorkRelation: WorkRelation;
    public CustomFields: any;
}


export class BalanceInfo extends UniEntity {
    public Description: string;
    public Minutes: number;
    public BalanceDate: Date;
    public ID: number;
}


export class FlexDetail extends UniEntity {
    public WorkedMinutes: number;
    public IsWeekend: boolean;
    public Date: Date;
    public ValidTimeOff: number;
    public ExpectedMinutes: number;
}


export class ContactSearchServiceResponse extends UniEntity {
    public Method: string;
    public ObjectName: string;
    public Success: boolean;
    public ErrorCode: number;
    public ErrorMessage: string;
}


export class InvoicesAndRemindersReadyToRemind extends UniEntity {
    public Interest: number;
    public TaxInclusiveAmount: number;
    public CustomerID: number;
    public RestAmountCurrency: number;
    public Fee: number;
    public CustomerInvoiceID: number;
    public DontSendReminders: boolean;
    public DueDate: Date;
    public EmailAddress: string;
    public CurrencyCodeShortCode: string;
    public CurrencyExchangeRate: number;
    public ReminderNumber: number;
    public CustomerName: string;
    public RestAmount: number;
    public CustomerNumber: number;
    public ExternalReference: string;
    public InvoiceNumber: number;
    public TaxInclusiveAmountCurrency: number;
    public CustomerInvoiceReminderID: number;
    public CurrencyCodeID: number;
    public InvoiceDate: Date;
    public CurrencyCodeCode: string;
    public StatusCode: number;
}


export class TradeHeaderCalculationSummary extends UniEntity {
    public SumVatBasis: number;
    public DecimalRoundingCurrency: number;
    public SumTotalIncVatCurrency: number;
    public SumVatCurrency: number;
    public SumNoVatBasisCurrency: number;
    public SumVatBasisCurrency: number;
    public SumTotalExVatCurrency: number;
    public SumDiscount: number;
    public DecimalRounding: number;
    public SumTotalExVat: number;
    public SumDiscountCurrency: number;
    public SumTotalIncVat: number;
    public SumNoVatBasis: number;
    public SumVat: number;
}


export class VatCalculationSummary extends UniEntity {
    public SumVatBasis: number;
    public SumVatCurrency: number;
    public SumVatBasisCurrency: number;
    public VatPercent: number;
    public SumVat: number;
}


export class InvoicePaymentData extends UniEntity {
    public AmountCurrency: number;
    public Amount: number;
    public PaymentID: string;
    public BankChargeAccountID: number;
    public PaymentDate: LocalDate;
    public AgioAmount: number;
    public DimensionsID: number;
    public CurrencyExchangeRate: number;
    public AccountID: number;
    public BankChargeAmount: number;
    public CurrencyCodeID: number;
    public AgioAccountID: number;
    public FromBankAccountID: number;
}


export class InvoiceSummary extends UniEntity {
    public SumCreditedAmount: number;
    public SumRestAmount: number;
    public SumTotalAmount: number;
}


export class CustomerNoAndName extends UniEntity {
    public Number: string;
    public Name: string;
}


export class OrderOffer extends UniEntity {
    public OrderId: string;
    public CostPercentage: number;
    public Message: string;
    public Status: string;
    public Reasons: Array<Reason>;
    public PurchaseAmount: AmountDetail;
    public InvoiceAmount: AmountDetail;
    public FinancialCost: AmountDetail;
    public Fee: AmountDetail;
    public TotalCost: AmountDetail;
    public DisbursementAmount: AmountDetail;
    public Limits: Limits;
}


export class Reason extends UniEntity {
    public ReasonHelpLink: string;
    public ReasonDescription: string;
    public ReasonCode: string;
}


export class AmountDetail extends UniEntity {
    public Amount: number;
    public Currency: string;
}


export class Limits extends UniEntity {
    public RemainingLimit: number;
    public Limit: number;
    public MaxInvoiceAmount: number;
}


export class AmeldingAgaAndTaxSums extends UniEntity {
    public KIDFinancialTax: string;
    public AccountNumber: string;
    public EmploymentTax: number;
    public DueDate: Date;
    public MessageID: string;
    public KIDEmploymentTax: string;
    public KIDTaxDraw: string;
    public TaxDraw: number;
    public period: number;
    public KIDGarnishment: string;
    public FinancialTax: number;
    public GarnishmentTax: number;
}


export class PayrollRunInAmeldingPeriod extends UniEntity {
    public PayrollrunID: number;
    public PayrollrunDescription: string;
    public CanGenerateAddition: boolean;
    public PayrollrunPaydate: Date;
    public AmeldingSentdate: Date;
}


export class PayAgaTaxDTO extends UniEntity {
    public payAga: boolean;
    public payTaxDraw: boolean;
    public payFinancialTax: boolean;
    public correctPennyDiff: boolean;
    public payGarnishment: boolean;
    public payDate: Date;
}


export class AmeldingSumUp extends UniEntity {
    public generated: Date;
    public ReplacesAMeldingID: number;
    public altInnStatus: string;
    public status: AmeldingStatus;
    public Replaces: string;
    public sent: Date;
    public period: number;
    public ID: number;
    public LegalEntityNo: string;
    public meldingsID: string;
    public type: AmeldingType;
    public year: number;
    public entities: Array<AmeldingEntity>;
    public agadetails: Array<AGADetails>;
    public totals: Totals;
}


export class AmeldingEntity extends UniEntity {
    public orgNumber: string;
    public name: string;
    public sums: Sums;
    public employees: Array<Employees>;
    public transactionTypes: Array<TransactionTypes>;
}


export class Sums extends UniEntity {
    public agaBase: number;
}


export class Employees extends UniEntity {
    public name: string;
    public employeeNumber: number;
    public arbeidsforhold: Array<Employments>;
}


export class Employments extends UniEntity {
    public arbeidsforholdId: string;
    public endDate: Date;
    public startDate: Date;
    public type: string;
    public permisjon: Array<EmploymentLeaves>;
}


export class EmploymentLeaves extends UniEntity {
    public sluttdato: Date;
    public permisjonsId: string;
    public startdato: Date;
    public permisjonsprosent: string;
    public beskrivelse: string;
}


export class TransactionTypes extends UniEntity {
    public amount: number;
    public benefit: string;
    public incomeType: string;
    public description: string;
    public Base_EmploymentTax: boolean;
    public tax: boolean;
}


export class AGADetails extends UniEntity {
    public baseAmount: number;
    public zoneName: string;
    public sectorName: string;
    public rate: number;
    public type: string;
}


export class Totals extends UniEntity {
    public sumTax: number;
    public sumAGA: number;
    public sumUtleggstrekk: number;
}


export class AnnualStatement extends UniEntity {
    public EmployerPhoneNumber: string;
    public EmployerTaxMandatory: boolean;
    public EmployeeMunicipalNumber: string;
    public EmployeeMunicipalName: string;
    public EmployeeAddress: string;
    public EmployeeName: string;
    public EmployerCountryCode: string;
    public EmployerCity: string;
    public EmployerWebAddress: string;
    public EmployerOrgNr: string;
    public VacationPayBase: number;
    public EmployeeCity: string;
    public EmployerName: string;
    public EmployerEmail: string;
    public EmployerAddress: string;
    public EmployeeSSn: string;
    public EmployerCountry: string;
    public EmployeePostCode: string;
    public EmployerPostCode: string;
    public EmployeeNumber: number;
    public Year: number;
    public Contributions: Array<AnnualStatementLine>;
    public PensionOrBenefits: Array<AnnualStatementLine>;
    public Deductions: Array<AnnualStatementLine>;
    public Draws: Array<AnnualStatementLine>;
}


export class AnnualStatementLine extends UniEntity {
    public Amount: number;
    public LineIndex: number;
    public IsDeduction: boolean;
    public Description: string;
    public Sum: number;
    public TaxReturnPost: string;
    public SupplementPackageName: string;
    public Supplements: Array<SupplementInfo>;
}


export class SupplementInfo extends UniEntity {
    public ValueMoney: number;
    public ValueType: Valuetype;
    public ValueString: string;
    public ValueDate: Date;
    public Name: string;
    public WageTypeSupplementID: number;
    public ValueBool: boolean;
    public ValueDate2: Date;
}


export class AnnualStatementReportSetup extends UniEntity {
    public Mail: AnnualStatementEmailInfo;
}


export class AnnualStatementEmailInfo extends UniEntity {
    public Message: string;
    public Subject: string;
}


export class HandleState extends UniEntity {
    public inState: State;
}


export class TaxCardReadStatus extends UniEntity {
    public Title: string;
    public mainStatus: string;
    public IsJob: boolean;
    public Text: string;
    public employeestatus: Array<EmployeeStatus>;
}


export class EmployeeStatus extends UniEntity {
    public info: string;
    public status: string;
    public employeeID: number;
    public ssn: string;
    public employeeNumber: number;
    public year: number;
    public changedFields: Array<FieldsChanged>;
}


export class FieldsChanged extends UniEntity {
    public valFrom: string;
    public fieldName: string;
    public valTo: string;
}


export class Paycheck extends UniEntity {
    public employee: Employee;
    public payroll: PayrollRun;
    public transactions: Array<SalaryTransaction>;
    public sumOnPay: SumOnRun;
    public sumOnYear: SumOnYear;
    public sumVacationLastYear: VacationPayLastYear;
}


export class SumOnRun extends UniEntity {
    public employeeID: number;
    public netPayment: number;
    public tax: number;
}


export class SumOnYear extends UniEntity {
    public nonTaxableAmount: number;
    public advancePayment: number;
    public sumTax: number;
    public grossPayment: number;
    public taxBase: number;
    public employeeID: number;
    public paidHolidaypay: number;
    public pension: number;
    public baseVacation: number;
    public netPayment: number;
    public usedNonTaxableAmount: number;
}


export class VacationPayLastYear extends UniEntity {
    public employeeID: number;
    public paidHolidayPay: number;
    public baseVacation: number;
}


export class SalaryTransactionPay extends UniEntity {
    public PaymentDate: Date;
    public TaxBankAccountID: number;
    public CompanyAddress: string;
    public CompanyBankAccountID: number;
    public CompanyPostalCode: string;
    public CompanyName: string;
    public CompanyCity: string;
    public Withholding: number;
    public SalaryBankAccountID: number;
    public PayList: Array<SalaryTransactionPayLine>;
    public SalaryBalancePayList: Array<SalaryBalancePayLine>;
}


export class SalaryTransactionPayLine extends UniEntity {
    public PostalCode: string;
    public EmployeeName: string;
    public City: string;
    public Account: string;
    public EmployeeNumber: number;
    public NetPayment: number;
    public Tax: number;
    public Address: string;
}


export class SalaryBalancePayLine extends UniEntity {
    public Kid: string;
    public Sum: number;
    public Account: string;
    public Text: string;
}


export class PostingSummary extends UniEntity {
    public SubEntity: SubEntity;
    public PayrollRun: PayrollRun;
    public PostList: Array<JournalEntryLine>;
}


export class PaycheckReportSetup extends UniEntity {
    public Mail: PaycheckEmailInfo;
}


export class PaycheckEmailInfo extends UniEntity {
    public ReportID: number;
    public Message: string;
    public GroupByWageType: boolean;
    public Subject: string;
}


export class WorkItemToSalary extends UniEntity {
    public PayrollRunID: number;
    public Rate: number;
    public WageType: WageType;
    public Employment: Employment;
    public WorkItems: Array<WorkItem>;
}


export class Reconciliation extends UniEntity {
    public FromPeriod: number;
    public CreatedPayruns: number;
    public CalculatedPayruns: number;
    public BookedPayruns: number;
    public ToPeriod: number;
    public Year: number;
    public Groups: Array<ReconciliationGroup>;
}


export class ReconciliationGroup extends UniEntity {
    public AccountNumber: string;
    public Sum: number;
    public Lines: Array<ReconciliationLine>;
}


export class ReconciliationLine extends UniEntity {
    public WageTypeNumber: number;
    public Benefit: string;
    public IncomeType: string;
    public Description: string;
    public Sum: number;
    public HasEmploymentTax: boolean;
    public WageTypeName: string;
}


export class UnionReport extends UniEntity {
    public ToDate: LocalDate;
    public FromDate: LocalDate;
    public Year: number;
    public Summaries: Array<UnionSummary>;
}


export class UnionSummary extends UniEntity {
    public SupplierID: number;
    public Supplier: Supplier;
    public Members: Array<UnionMember>;
}


export class UnionMember extends UniEntity {
    public MemberNumber: string;
    public UnionDraw: number;
    public Ensurance: number;
    public Name: string;
    public OUO: number;
}


export class SalaryTransactionSums extends UniEntity {
    public baseTableTax: number;
    public grossPayment: number;
    public calculatedVacationPay: number;
    public Employee: number;
    public basePercentTax: number;
    public manualTax: number;
    public calculatedAGA: number;
    public baseAGA: number;
    public paidPension: number;
    public paidAdvance: number;
    public baseVacation: number;
    public Payrun: number;
    public tableTax: number;
    public percentTax: number;
    public calculatedFinancialTax: number;
    public netPayment: number;
}


export class SalaryTransactionPeriodSums extends UniEntity {
    public MunicipalName: string;
    public FromPeriod: number;
    public AgaRate: number;
    public OrgNumber: string;
    public AgaZone: string;
    public ToPeriod: number;
    public Year: number;
    public Sums: SalaryTransactionSums;
    public Aga: AGACalculation;
}


export class code extends UniEntity {
    public kunfranav: string;
    public postnr: string;
    public utloeserArbeidsgiveravgift: string;
    public fordel: string;
    public gyldigtil: string;
    public gmlcode: string;
    public skatteOgAvgiftregel: string;
    public inngaarIGrunnlagForTrekk: string;
    public gyldigfom: string;
    public uninavn: string;
    public loennsinntekt: Loennsinntekt;
    public ytelseFraOffentlige: YtelseFraOffentlige;
    public pensjonEllerTrygd: PensjonEllerTrygd;
    public naeringsinntekt: Naeringsinntekt;
    public fradrag: Fradrag;
    public forskuddstrekk: Forskuddstrekk;
    public utleggstrekk: Utleggstrekk;
}


export class Loennsinntekt extends UniEntity {
    public antallSpecified: boolean;
    public antall: number;
}


export class YtelseFraOffentlige extends UniEntity {
}


export class PensjonEllerTrygd extends UniEntity {
}


export class Naeringsinntekt extends UniEntity {
}


export class Fradrag extends UniEntity {
}


export class Forskuddstrekk extends UniEntity {
}


export class Utleggstrekk extends UniEntity {
}


export class IActionResult extends UniEntity {
}


export class CreateCompanyDetails extends UniEntity {
    public LicenseKey: string;
    public ContractType: number;
    public IsTest: boolean;
    public IsTemplate: boolean;
    public TemplateCompanyKey: string;
    public CopyFiles: boolean;
    public CompanyName: string;
    public ProductNames: string;
    public ContractID: number;
    public CompanySettings: CompanySettings;
}


export class UserDto extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'UserDto';

    public Email: string;
    public PermissionHandling: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public DisplayName: string;
    public IsAutobankAdmin: boolean;
    public GlobalIdentity: string;
    public UserName: string;
    public Deleted: boolean;
    public LastLogin: Date;
    public Protected: boolean;
    public ID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public HasAgreedToImportDisclaimer: boolean;
    public BankIntegrationUserName: string;
    public CreatedBy: string;
    public PhoneNumber: string;
    public _createguid: string;
    public EndDate: Date;
    public AuthPhoneNumber: string;
    public TwoFactorEnabled: boolean;
    public License: UserLicenseInformation;
    public CustomFields: any;
}


export class UserLicenseInformation extends UniEntity {
    public UserLicenseKey: string;
    public Comment: string;
    public GlobalIdentity: string;
    public Name: string;
    public CustomerAgreement: CustomerLicenseAgreementInfo;
    public UserType: UserLicenseType;
    public Company: CompanyLicenseInfomation;
    public ContractType: ContractLicenseType;
    public UserLicenseAgreement: LicenseAgreementInfo;
}


export class CustomerLicenseAgreementInfo extends UniEntity {
    public CanAgreeToLicense: boolean;
    public AgreementId: number;
    public HasAgreedToLicense: boolean;
}


export class UserLicenseType extends UniEntity {
    public EndDate: Date;
    public TypeName: string;
    public TypeID: number;
}


export class CompanyLicenseInfomation extends UniEntity {
    public ContactPerson: string;
    public Key: string;
    public ContactEmail: string;
    public EndDate: Date;
    public ID: number;
    public Name: string;
    public StatusCode: LicenseEntityStatus;
    public ContractID: number;
    public Agency: Agency;
}


export class Agency extends UniEntity {
    public Name: string;
    public CompanyKey: string;
}


export class ContractLicenseType extends UniEntity {
    public TrialExpiration: Date;
    public TypeName: string;
    public StartDate: Date;
    public TypeID: number;
}


export class LicenseAgreementInfo extends UniEntity {
    public AgreementId: number;
    public HasAgreedToLicense: boolean;
}


export class CreateBankUserDTO extends UniEntity {
    public Password: string;
    public AdminPassword: string;
    public AdminUserId: number;
    public Phone: string;
    public IsAdmin: boolean;
}


export class ChangeAutobankPasswordDTO extends UniEntity {
    public Password: string;
    public NewPassword: string;
}


export class ActiveNumberSeriesTask extends UniEntity {
    public NumberSeriesTask: NumberSeriesTask;
    public DefaultNumberSeries: NumberSeries;
}


export class SplitFileResult extends UniEntity {
    public FirstPart: File;
    public SecondPart: File;
}


export class SplitFileMultipeResult extends UniEntity {
    public Parts: Array<File>;
}


export class FreeAmountSummary extends UniEntity {
    public RestFreeAmount: number;
    public SubEntitiesSums: Array<SubEntityAgaSums>;
}


export class SubEntityAgaSums extends UniEntity {
    public SubEntity: SubEntity;
    public Sums: AGASums;
}


export class AGASums extends UniEntity {
    public MaxFreeAmount: number;
    public GrantSum: number;
    public UsedFreeAmount: number;
}


export class AuthenticationChallengeBE extends UniEntity {
    public Message: string;
    public Status: ChallengeRequestResult;
    public ValidTo: Date;
    public ValidFrom: Date;
    public ExtensionData: ExtensionDataObject;
}


export class ExtensionDataObject extends UniEntity {
}


export class AltinnAuthRequest extends UniEntity {
    public UserPassword: string;
    public UserID: string;
    public PreferredLogin: string;
}


export class A06Options extends UniEntity {
    public IncludeInfoPerPerson: boolean;
    public ReportType: ReportType;
    public FromPeriod: Maaned;
    public IncludeEmployments: boolean;
    public IncludeIncome: boolean;
    public ToPeriod: Maaned;
    public Year: number;
}


export class A07Response extends UniEntity {
    public Data: string;
    public Title: string;
    public mainStatus: string;
    public DataName: string;
    public DataType: string;
    public Text: string;
}


export class SelfEmployed extends UniEntity {
    public year: number;
    public items: Array<SelfEmployedItem>;
}


export class SelfEmployedItem extends UniEntity {
    public amount: number;
    public number: string;
    public name: string;
    public supplierID: number;
}


export class SetIntegrationDataDto extends UniEntity {
    public IntegrationKey: string;
    public ExternalId: string;
}


export class CurrencyRateData extends UniEntity {
    public IsOverrideRate: boolean;
    public Factor: number;
    public ExchangeRate: number;
    public FromCurrencyCode: CurrencyCode;
}


export class EmailDTO extends UniEntity {
    public Format: string;
    public ReportID: number;
    public Message: string;
    public FromAddress: string;
    public Subject: string;
    public CopyAddress: string;
    public Parameters: Array<ReportParameter>;
}


export class ReportParameter extends UniEntity {
    public Value: string;
    public Name: string;
}


export class SendEmail extends UniEntity {
    public ReportName: string;
    public ReportID: number;
    public EntityType: string;
    public Message: string;
    public Localization: string;
    public ExternalReference: string;
    public EntityID: number;
    public FromAddress: string;
    public Subject: string;
    public CopyAddress: string;
    public Attachments: Array<SendEmailAttachment>;
    public Parameters: Array<ReportParameter>;
}


export class SendEmailAttachment extends UniEntity {
    public Attachment: string;
    public FileName: string;
    public FileID: number;
}


export class RssList extends UniEntity {
    public Title: string;
    public Description: string;
    public Url: string;
    public Items: Array<RssItem>;
}


export class RssItem extends UniEntity {
    public Link: string;
    public Category: string;
    public Guid: string;
    public Title: string;
    public Description: string;
    public PubDate: string;
    public Enclosure: Enclosure;
}


export class Enclosure extends UniEntity {
    public Url: string;
    public Type: string;
    public Length: string;
}


export class SharingUpdates extends UniEntity {
    public SharingStatusUpdates: Array<SharingStatusUpdate>;
}


export class SharingStatusUpdate extends UniEntity {
    public SharingId: number;
    public Status: StatusCodeSharing;
}


export class TeamReport extends UniEntity {
    public ToDate: LocalDate;
    public FromDate: LocalDate;
    public Team: Team;
    public Members: Array<MemberDetails>;
}


export class MemberDetails extends UniEntity {
    public ReportBalance: number;
    public MinutesWorked: number;
    public TotalBalance: number;
    public Name: string;
    public ExpectedMinutes: number;
    public WorkRelation: WorkRelation;
    public TimeOff: Array<FlexDetail>;
    public MissingDays: Array<FlexDetail>;
}


export class TeamPositionDto extends UniEntity {
    public PositionName: string;
    public Position: TeamPositionEnum;
}


export class EHFCustomer extends UniEntity {
    public contactname: string;
    public contactemail: string;
    public orgname: string;
    public orgno: string;
    public contactphone: string;
}


export class ServiceMetadataDto extends UniEntity {
    public SupportEmail: string;
    public ServiceName: string;
}


export class AccountUsageReference extends UniEntity {
    public Info: string;
    public EntityID: number;
    public Entity: string;
}


export class MandatoryDimensionAccountReport extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'MandatoryDimensionAccountReport';

    public AccountNumber: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public MissingOnlyWarningsDimensionsMessage: string;
    public DimensionsID: number;
    public Deleted: boolean;
    public AccountID: number;
    public MissingRequiredDimensionsMessage: string;
    public ID: number;
    public journalEntryLineDraftID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class AccountDimension extends UniEntity {
    public AccountNumber: number;
    public DimensionsID: number;
    public AccountID: number;
    public Dimensions: Dimensions;
}


export class AssetReportDTO extends UniEntity {
    public BalanceAccountNumber: number;
    public Lifetime: number;
    public DepreciationAccountNumber: number;
    public GroupCode: string;
    public Number: number;
    public LastDepreciation: LocalDate;
    public Name: string;
    public BalanceAccountName: string;
    public GroupName: string;
    public CurrentValue: number;
    public Lines: Array<AssetReportLineDTO>;
}


export class AssetReportLineDTO extends UniEntity {
    public Value: number;
    public TypeID: number;
    public Type: string;
    public Date: LocalDate;
}


export class BankData extends UniEntity {
    public AccountNumber: string;
    public IBAN: string;
    public Bank: Bank;
}


export class CreateBankIntegrationDTO extends UniEntity {
    public Password: string;
    public Email: string;
    public IsBankStatement: boolean;
    public BankAcceptance: boolean;
    public TuserName: string;
    public RequireTwoStage: boolean;
    public IsInbound: boolean;
    public DisplayName: string;
    public UserName: string;
    public BankAccountID: number;
    public IsOutgoing: boolean;
    public Bank: string;
    public ServiceProvider: number;
    public Phone: string;
    public IsBankBalance: boolean;
    public BankApproval: boolean;
    public BankAccounts: Array<BankAccountDTO>;
}


export class BankAccountDTO extends UniEntity {
    public IsBankStatement: boolean;
    public IBAN: string;
    public IsInbound: boolean;
    public BBAN: string;
    public IsOutgoing: boolean;
    public Bic: string;
    public IsBankBalance: boolean;
}


export class ZdataUpdateBankProperties extends UniEntity {
    public Password: string;
    public IsBankStatement: boolean;
    public ServiceID: string;
    public IsInbound: boolean;
    public IsOutgoing: boolean;
    public IsBankBalance: boolean;
}


export class AutobankUserDTO extends UniEntity {
    public Password: string;
    public UserID: number;
    public Phone: string;
    public IsAdmin: boolean;
}


export class UpdateServiceStatusDTO extends UniEntity {
    public ServiceID: string;
    public StatusCode: StatusCodeBankIntegrationAgreement;
}


export class UpdateServiceIDDTO extends UniEntity {
    public ServiceID: string;
    public NewServiceID: string;
}


export class BankMatchSuggestion extends UniEntity {
    public Amount: number;
    public BankStatementEntryID: number;
    public Group: string;
    public JournalEntryLineID: number;
}


export class MatchRequest extends UniEntity {
    public JournalEntries: Array<MatchCandidate>;
    public BankEntries: Array<MatchCandidate>;
    public Settings: MatchSettings;
}


export class MatchCandidate extends UniEntity {
    public Amount: number;
    public Closed: boolean;
    public ID: number;
    public Date: Date;
    public IsBankEntry: boolean;
}


export class MatchSettings extends UniEntity {
    public MaxDelta: number;
    public MaxDayOffset: number;
}


export class ReconciliationStatus extends UniEntity {
    public TotalUnreconciled: number;
    public Todate: Date;
    public NumberOfItems: number;
    public AccountID: number;
    public IsReconciled: boolean;
    public FromDate: Date;
    public TotalAmount: number;
    public NumberOfUnReconciled: number;
}


export class BalanceDto extends UniEntity {
    public Balance: number;
    public BalanceInStatement: number;
    public EndDate: Date;
    public StartDate: Date;
}


export class BankfileFormat extends UniEntity {
    public SkipRows: number;
    public IsFixed: boolean;
    public LinePrefix: string;
    public FileExtension: string;
    public IsXml: boolean;
    public CustomFormat: BankFileCustomFormat;
    public Name: string;
    public Separator: string;
    public Columns: Array<BankfileColumn>;
}


export class BankfileColumn extends UniEntity {
    public FieldMapping: BankfileField;
    public StartPos: number;
    public IsFallBack: boolean;
    public DataType: BankfileDataType;
    public Length: number;
}


export class JournalSuggestion extends UniEntity {
    public FinancialDate: LocalDate;
    public Amount: number;
    public BankStatementRuleID: number;
    public Description: string;
    public AccountID: number;
    public MatchWithEntryID: number;
    public Account: Account;
}


export class ReportRow extends UniEntity {
    public Period1: number;
    public BudgetAccumulated: number;
    public AccountNumber: number;
    public BudPeriod4: number;
    public Period10: number;
    public SumPeriodLastYear: number;
    public BudPeriod6: number;
    public PrecedingBalance: number;
    public SumLastYear: number;
    public Period8: number;
    public Period3: number;
    public Period5: number;
    public SumPeriodAccumulated: number;
    public BudPeriod7: number;
    public Period12: number;
    public SubGroupNumber: number;
    public SumPeriod: number;
    public BudPeriod10: number;
    public Sum: number;
    public BudPeriod11: number;
    public BudPeriod9: number;
    public BudPeriod2: number;
    public IsSubTotal: boolean;
    public BudPeriod3: number;
    public Period9: number;
    public BudPeriod12: number;
    public Period7: number;
    public BudPeriod8: number;
    public GroupNumber: number;
    public ID: number;
    public Period2: number;
    public BudgetSum: number;
    public AccountYear: number;
    public BudPeriod1: number;
    public SumPeriodLastYearAccumulated: number;
    public Period6: number;
    public Period4: number;
    public GroupName: string;
    public AccountName: string;
    public SubGroupName: string;
    public Period11: number;
    public BudPeriod5: number;
}


export class BudgetImport extends UniEntity {
    public Budget: Budget;
}


export class LiquidityTableDTO extends UniEntity {
    public BankBalanceRefferance: BankBalanceType;
    public OverdueSupplierInvoices: number;
    public BankBalance: number;
    public OverdueCustomerInvoices: number;
    public Period: Array<DetailsDTO>;
}


export class DetailsDTO extends UniEntity {
    public VAT: number;
    public Supplier: number;
    public Custumer: number;
    public Sum: number;
    public CustomPayments: number;
    public Liquidity: number;
}


export class JournalEntryData extends UniEntity {
    public AmountCurrency: number;
    public FinancialDate: LocalDate;
    public Amount: number;
    public JournalEntryDataAccrualID: number;
    public PaymentID: string;
    public CustomerInvoiceID: number;
    public JournalEntryNo: string;
    public NumberSeriesTaskID: number;
    public DueDate: LocalDate;
    public CurrencyExchangeRate: number;
    public Description: string;
    public SupplierInvoiceNo: string;
    public CustomerOrderID: number;
    public PostPostJournalEntryLineID: number;
    public VatDate: LocalDate;
    public InvoiceNumber: string;
    public NumberSeriesID: number;
    public CreditVatTypeID: number;
    public SupplierInvoiceID: number;
    public CurrencyID: number;
    public JournalEntryID: number;
    public CreditAccountNumber: number;
    public VatDeductionPercent: number;
    public DebitAccountID: number;
    public StatusCode: number;
    public CreditAccountID: number;
    public DebitVatTypeID: number;
    public DebitAccountNumber: number;
    public CurrencyCode: CurrencyCode;
    public DebitAccount: Account;
    public DebitVatType: VatType;
    public CreditAccount: Account;
    public CreditVatType: VatType;
    public Dimensions: Dimensions;
    public JournalEntryPaymentData: JournalEntryPaymentData;
    public JournalEntryDataAccrual: Accrual;
}


export class JournalEntryPaymentData extends UniEntity {
    public PaymentData: Payment;
}


export class JournalEntryPeriodData extends UniEntity {
    public PeriodName: string;
    public PeriodNo: number;
    public PeriodSumYear2: number;
    public PeriodSumYear1: number;
}


export class JournalEntryLineRequestSummary extends UniEntity {
    public SumLedger: number;
    public SumDebit: number;
    public SumBalance: number;
    public SumTaxBasisAmount: number;
    public SumCredit: number;
}


export class JournalEntryLinePostPostData extends UniEntity {
    public SumPostPostAmount: number;
    public SubAccountName: string;
    public SumPostPostAmountCurrency: number;
    public RestAmountCurrency: number;
    public MarkedAgainstJournalEntryLineID: number;
    public AmountCurrency: number;
    public FinancialDate: Date;
    public Amount: number;
    public PaymentID: string;
    public JournalEntryTypeName: string;
    public JournalEntryNumberNumeric: number;
    public DueDate: Date;
    public CurrencyCodeShortCode: string;
    public CurrencyExchangeRate: number;
    public Description: string;
    public SubAccountNumber: number;
    public JournalEntryNumber: string;
    public RestAmount: number;
    public InvoiceNumber: string;
    public CurrencyCodeID: number;
    public PeriodNo: number;
    public ID: number;
    public MarkedAgainstJournalEntryNumber: string;
    public AccountYear: number;
    public JournalEntryID: number;
    public CurrencyCodeCode: string;
    public StatusCode: number;
    public NumberOfPayments: number;
    public Markings: Array<JournalEntryLinePostPostData>;
}


export class CreatePaymentBatchDTO extends UniEntity {
    public Password: string;
    public Code: string;
}


export class CreateAvtaleGiroPaymentBatchDTO extends UniEntity {
}


export class JournalEntryLineCouple extends UniEntity {
}


export class MarkingResult extends UniEntity {
    public Pairs: Array<JournalEntryLineCouple>;
    public Entries: Array<MarkingEntry>;
}


export class MarkingEntry extends UniEntity {
    public RestAmountCurrency: number;
    public AmountCurrency: number;
    public FinancialDate: Date;
    public Amount: number;
    public JournalEntryNumber: string;
    public RestAmount: number;
    public InvoiceNumber: string;
    public ID: number;
    public StatusCode: StatusCodeJournalEntryLine;
    public OriginalStatusCode: StatusCodeJournalEntryLine;
    public OriginalRestAmount: number;
    public Markings: Array<MarkingReference>;
}


export class MarkingReference extends UniEntity {
    public JournalEntryNumber: string;
    public ID: number;
}


export class SupplierInvoiceDetail extends UniEntity {
    public AccountNumber: number;
    public AmountCurrency: number;
    public Amount: number;
    public Description: string;
    public DeliveryDate: Date;
    public AccountID: number;
    public InvoiceNumber: string;
    public InvoiceDate: Date;
    public VatPercent: number;
    public SupplierInvoiceID: number;
    public VatTypeName: string;
    public SupplierID: number;
    public VatCode: string;
    public AccountName: string;
    public VatTypeID: number;
}


export class VatReportMessage extends UniEntity {
    public Message: string;
    public Level: ValidationLevel;
}


export class VatReportSummary extends UniEntity {
    public SumVatAmount: number;
    public VatCodeGroupName: string;
    public NumberOfJournalEntryLines: number;
    public VatCodeGroupNo: string;
    public SumTaxBasisAmount: number;
    public IsHistoricData: boolean;
    public VatCodeGroupID: number;
    public HasTaxAmount: boolean;
    public HasTaxBasis: boolean;
}


export class VatReportSummaryPerPost extends UniEntity {
    public SumVatAmount: number;
    public VatPostID: number;
    public VatCodeGroupName: string;
    public NumberOfJournalEntryLines: number;
    public VatPostReportAsNegativeAmount: boolean;
    public VatCodeGroupNo: string;
    public VatPostNo: string;
    public VatPostName: string;
    public SumTaxBasisAmount: number;
    public IsHistoricData: boolean;
    public VatCodeGroupID: number;
    public HasTaxAmount: boolean;
    public HasTaxBasis: boolean;
}


export class VatReportSummaryPerPostPerAccount extends UniEntity {
    public VatAccountNumber: number;
    public SumVatAmount: number;
    public VatPostID: number;
    public FinancialDate: Date;
    public Amount: number;
    public VatJournalEntryPostAccountNumber: number;
    public StdVatCode: string;
    public VatCodeGroupName: string;
    public VatAccountName: string;
    public NumberOfJournalEntryLines: number;
    public VatAccountID: number;
    public VatPostReportAsNegativeAmount: boolean;
    public Description: string;
    public JournalEntryNumber: string;
    public VatCodeGroupNo: string;
    public VatJournalEntryPostAccountName: string;
    public VatDate: Date;
    public VatPostNo: string;
    public VatPostName: string;
    public SumTaxBasisAmount: number;
    public VatJournalEntryPostAccountID: number;
    public IsHistoricData: boolean;
    public VatCodeGroupID: number;
    public TaxBasisAmount: number;
    public VatCode: string;
    public HasTaxAmount: boolean;
    public HasTaxBasis: boolean;
}


export class VatReportNotReportedJournalEntryData extends UniEntity {
    public SumVatAmount: number;
    public NumberOfJournalEntryLines: number;
    public TerminPeriodID: number;
    public SumTaxBasisAmount: number;
}


export class AltinnSigningTextResponse extends UniEntity {
    public SigningText: string;
}


export class AltinnGetVatReportDataFromAltinnResult extends UniEntity {
    public Message: string;
    public Status: AltinnGetVatReportDataFromAltinnStatus;
}


export class AccountUsage extends UniEntity {
    public PercentWeight: number;
    public AccountNumber: number;
    public Counter: number;
}


export enum WorkBalanceTypeEnum{
    Hours = 1,
    Flex = 11,
    Overtime = 12,
    Vacation = 13,
    SickLeave = 20,
}


export enum WorkTypeEnum{
    IsHours = 1,
    IsFlexReduction = 8,
    IsPaidTimeOff = 9,
    IsTimeOff = 10,
    IsFlex = 11,
    IsOvertime = 12,
    IsVacation = 13,
    IsSickLeave = 20,
}


export enum BatchInvoiceOperation{
    OneInvoiceEachCustomer = 0,
    OneInvoiceEachOrder = 1,
    OneInvoiceEachProject = 2,
}


export enum StatusCode{
    Draft = 10001,
    Pending = 20001,
    Active = 30001,
    Completed = 40001,
    InActive = 50001,
    Deviation = 60001,
    Error = 70001,
    Deleted = 90001,
}


export enum Modulus{
    Modulus10 = 10,
}


export enum PaymentInfoTypeEnum{
    Regular = 1,
    Balance = 2,
    Collection = 3,
    Special = 4,
}


export enum RecurringResult{
    Order = 0,
    Invoice = 1,
}


export enum RecurringPeriod{
    None = 0,
    Days = 1,
    Weeks = 2,
    Month = 3,
    Quarter = 4,
    Year = 5,
}


export enum PricingSource{
    None = 0,
    LookupProduct = 1,
}


export enum CompanyRelation{
    ChildOfBeurea = 1,
    Subsidiary = 2,
}


export enum TermsType{
    PaymentTerms = 1,
    DeliveryTerms = 2,
}


export enum PhoneTypeEnum{
    PtPhone = 150101,
    PtMobile = 150102,
    PtFax = 150103,
}


export enum AmeldingType{
    Standard = 0,
    Employments = 1,
    Nullstilling = 2,
    Addition = 3,
}


export enum SalaryRegistry{
    Employee = 0,
    Employment = 1,
    Trans = 2,
    Svalbard = 3,
    Permisjon = 4,
}


export enum WageDeductionDueToHolidayType{
    Deduct4PartsOf26 = 0,
    Deduct3PartsOf22 = 1,
    Add1PartOf26 = 2,
    Deduct1PartOf26 = 3,
}


export enum CompanySalaryPaymentInterval{
    Monthly = 0,
    Pr14Days = 1,
    Weekly = 2,
}


export enum InternationalIDType{
    notSet = 0,
    Passportnumber = 1,
    SocialSecurityNumber = 2,
    TaxIdentificationNumber = 3,
    ValueAddedTaxNumber = 4,
}


export enum GenderEnum{
    NotDefined = 0,
    Woman = 1,
    Man = 2,
}


export enum OtpStatus{
    A = 0,
    S = 1,
    P = 2,
    LP = 3,
    AP = 4,
}


export enum ForeignWorker{
    notSet = 0,
    ForeignWorkerUSA_Canada = 1,
    ForeignWorkerFixedAga = 2,
}


export enum TypeOfPaymentOtp{
    FixedSalary = 0,
    HourlyPay = 1,
    PaidOnCommission = 2,
}


export enum PaymentInterval{
    Standard = 0,
    Monthly = 1,
    Pr14Days = 2,
    Weekly = 3,
}


export enum FreeAmountType{
    None = 0,
    WithAmount = 1,
    NoLimit = 2,
}


export enum TabellType{
    loenn = 0,
    pension = 1,
}


export enum Leavetype{
    NotSet = 0,
    Leave = 1,
    LayOff = 2,
    Leave_with_parental_benefit = 3,
    Military_service_leave = 4,
    Educational_leave = 5,
    Compassionate_leave = 6,
}


export enum TypeOfEmployment{
    notSet = 0,
    OrdinaryEmployment = 1,
    MaritimeEmployment = 2,
    FrilancerContratorFeeRecipient = 3,
    PensionOrOtherNonEmployedBenefits = 4,
}


export enum EmploymentType{
    notSet = 0,
    Permanent = 1,
    Temporary = 2,
}


export enum ShipTradeArea{
    notSet = 0,
    Domestic = 1,
    Foreign = 2,
}


export enum RemunerationType{
    notSet = 0,
    FixedSalary = 1,
    HourlyPaid = 2,
    PaidOnCommission = 3,
    OnAgreement_Honorar = 4,
    ByPerformance = 5,
}


export enum WorkingHoursScheme{
    notSet = 0,
    NonShift = 1,
    OffshoreWork = 2,
    ContinousShiftwork336 = 3,
    DayAndNightContinous355 = 4,
    ShiftWork = 5,
}


export enum ShipRegistry{
    notSet = 0,
    NorwegianInternationalShipRegister = 1,
    NorwegianOrdinaryShipRegister = 2,
    ForeignShipRegister = 3,
}


export enum ShipTypeOfShip{
    notSet = 0,
    Other = 1,
    DrillingPlatform = 2,
    Tourist = 3,
}


export enum EndDateReason{
    NotSet = 0,
    ShouldNotHaveBeenReported = 1,
    EmployerHasResignedEmployee = 2,
    EmployeeHasResigned = 3,
    ChangedAccountingSystemOrAccountant = 4,
    ChangeInOrganizationStructureOrChangedJobInternally = 5,
    TemporaryEmploymentHasExpired = 6,
}


export enum TaxDrawFactor{
    Standard = 1,
    Half = 2,
    None = 3,
}


export enum SummaryJobStatus{
    running = 0,
    finished = 1,
    failed = 2,
}


export enum SalBalSource{
    AdvanceRoutine = 1,
    NegativeSalary = 2,
    Loan = 3,
    Other = 4,
}


export enum SalBalType{
    Advance = 1,
    Contribution = 2,
    Outlay = 3,
    Garnishment = 4,
    Other = 5,
    Union = 6,
}


export enum SalBalDrawType{
    FixedAmount = 0,
    InstalmentWithBalance = 1,
}


export enum StdSystemType{
    None = 0,
    PercentTaxDeduction = 1,
    HolidayPayBasisLastYear = 2,
    TableTaxDeduction = 4,
    Holidaypay = 5,
    AutoAdvance = 6,
    HolidayPayDeduction = 7,
}


export enum state{
    Received = 0,
    Processed = 1,
    PartlyProcessed = 2,
    Rejected = 3,
}


export enum costtype{
    Travel = 0,
    Expense = 1,
}


export enum linestate{
    Received = 0,
    Processed = 1,
    Rejected = 3,
}


export enum StdWageType{
    None = 0,
    TaxDrawTable = 1,
    TaxDrawPercent = 2,
    HolidayPayThisYear = 3,
    HolidayPayLastYear = 4,
    HolidayPayWithTaxDeduction = 5,
    AdvancePayment = 6,
    HolidayPayEarlierYears = 7,
    Contribution = 8,
    Garnishment = 9,
    Outlay = 10,
    SourceTaxPension = 11,
}


export enum SpecialTaxAndContributionsRule{
    Standard = 0,
    NettoPayment = 1,
    SpesialDeductionForMaritim = 2,
    Svalbard = 3,
    PayAsYouEarnTaxOnPensions = 4,
    JanMayenAndBiCountries = 5,
    NettoPaymentForMaritim = 6,
    TaxFreeOrganization = 7,
}


export enum TaxType{
    Tax_None = 0,
    Tax_Table = 1,
    Tax_Percent = 2,
    Tax_0 = 3,
}


export enum RateTypeColumn{
    none = 0,
    Employment = 1,
    Employee = 2,
    Salary_scale = 3,
}


export enum SpecialAgaRule{
    Regular = 0,
    AgaRefund = 1,
    AgaPension = 2,
}


export enum LimitType{
    None = 0,
    Amount = 1,
    Sum = 2,
}


export enum GetRateFrom{
    WageType = 0,
    MonthlyPayEmployee = 1,
    HourlyPayEmployee = 2,
    FreeRateEmployee = 3,
}


export enum Valuetype{
    IsString = 1,
    IsDate = 2,
    IsBool = 3,
    IsMoney = 4,
    Period = 5,
}


export enum FieldType{
    AUTOCOMPLETE = 0,
    COMBOBOX = 1,
    DATE_TIME_PICKER = 2,
    DROPDOWN = 3,
    MASKED = 4,
    MULTISELECT = 5,
    NUMERIC = 6,
    RADIO = 7,
    CHECKBOX = 8,
    RADIOGROUP = 9,
    TEXT = 10,
    EMAIL = 11,
    PASSWORD = 12,
    HYPERLINK = 13,
    MULTIVALUE = 14,
    URL = 15,
    TEXTAREA = 16,
    LOCAL_DATE_PICKER = 17,
}


export enum Alignment{
    Right = 0,
    Left = 1,
    Middle = 2,
}


export enum CurrencySourceEnum{
    NORGESBANK = 1,
}


export enum PlanTypeEnum{
    NS4102 = 1,
}


export enum FinancialDeadlineType{
    MVA = 1,
    SALARY = 2,
    AS = 3,
    ENK = 4,
    ALL = 5,
}


export enum i18nModule{
    System = 0,
    Common = 1,
    Sales = 2,
    Salary = 3,
    TimeTracking = 4,
    Accounting = 5,
}


export enum PeriodSeriesType{
    m = 0,
    r = 1,
}


export enum RoundingType{
    Up = 0,
    Down = 1,
    Integer = 2,
    Half = 3,
}


export enum SharingType{
    Unknown = 0,
    Print = 1,
    Email = 2,
    AP = 3,
    Vipps = 4,
    Export = 5,
    InvoicePrint = 6,
    Efaktura = 7,
    Avtalegiro = 8,
    Factoring = 9,
}


export enum EventplanType{
    Webhook = 0,
    Custom = 1,
    Other = 2,
    NATS = 3,
}


export enum PredefinedDescriptionType{
    JournalEntryText = 1,
}


export enum TeamPositionEnum{
    NoPosition = 0,
    Member = 1,
    ReadAll = 10,
    WriteAll = 11,
    Approve = 12,
    Manager = 20,
}


export enum ApprovalRuleType{
    SupplierInvoice = 0,
    Payment = 1,
    CustomerInvoice = 2,
    CustomerOrder = 3,
    CustomerQuote = 4,
    PurchaseOrder = 5,
    Timesheet = 6,
}


export enum StatusCategoryCode{
    Draft = 10000,
    Pending = 20000,
    Active = 30000,
    Completed = 40000,
    InActive = 50000,
    Deviation = 60000,
    Error = 70000,
    Deleted = 90000,
}


export enum OperationType{
    Create = 10,
    Update = 20,
    CreateAndUpdate = 30,
    Delete = 40,
}


export enum Operator{
    Min = 0,
    Max = 1,
    MinIncl = 2,
    MaxIncl = 3,
    MinLength = 4,
    MaxLength = 5,
    EqualsLength = 6,
    Required = 7,
    Equals = 8,
    NotEquals = 9,
    RegExp = 10,
}


export enum TaskType{
    Task = 0,
    Approval = 1,
}


export enum ProductTypeEnum{
    PStorage = 1,
    PHour = 2,
    POther = 3,
}


export enum Type{
    Payroll = 0,
}


export enum ContractEngine{
    JavaScript = 0,
    VBScript = 1,
}


export enum AddressType{
    Obyte = 100,
}


export enum ContractEventType{
    Deploy = 1,
    Kill = 2,
    Initialize = 3,
    Reset = 4,
    Compile = 5,
    UE = 100,
    Cron = 101,
    Obyte = 200,
}


export enum TypeOfIntegration{
    TravelAndExpenses = 1,
    Aprila = 2,
}


export enum TypeOfLogin{
    none = 0,
    AltinnPin = 1,
    SMSPin = 2,
    TaxPin = 3,
}


export enum BackupStatus{
    BackedUp = 1,
    Restored = 2,
}


export enum FailedReasonEnum{
    BadRequest = 400,
    CompanyNotFound = 404,
    Unsupported = 415,
    UnknownError = 500,
}


export enum KpiValueType{
    ValueTypeCounter = 0,
    ValueTypeDecimal = 1,
    ValueTypeText = 2,
}


export enum KpiSourceType{
    SourceStatistics = 0,
    SourceCountRecords = 1,
    SourceRecordValue = 2,
    SourceController = 3,
}


export enum KpiValueStatus{
    StatusUnknown = 0,
    StatusInProgress = 1,
    StatusError = 2,
    StatusReady = 3,
}


export enum OutgoingInvoiceType{
    Unknown = 0,
    Vipps = 1,
}


export enum ActionCodeBankRule{
    JournalWithoutMatch = 1,
    DoNotJournal = 2,
    IgnorePayment = 3,
    BookToAccount = 4,
}


export enum CustomLiquidityPaymentInterval{
    OneTime = 0,
    Weekly = 7,
    BiWeekly = 14,
    Monthly = 30,
    Yearly = 365,
}


export enum SuggestionSource{
    InternalCompanyHistory = 1,
    CommonSupplierHistory = 2,
    CommonIndustryHistory = 3,
}


export enum SupplierInvoiceOriginType{
    SupplierInvoice = 1,
    Receipt = 2,
    Refund = 3,
}


export enum VatCodeGroupingValueEnum{
    Costs = 1,
    Invoice = 2,
    Calculation = 3,
    Income = 4,
    NoTax = 5,
    Special = 6,
    Custom = 7,
}


export enum ValidationLevel{
    Info = 1,
    Warning = 20,
    Error = 30,
}


export enum OnConflict{
    Replace = 0,
    Ignore = 1,
    ManualResolve = 2,
}


export enum TimesheetWorkflow{
    Draft = 1,
    PartialAssign = 4,
    AwaitingApproval = 5,
    PartialReject = 7,
    PartialApproval = 8,
    Rejected = 9,
    Approved = 10,
}


export enum WorkStatus{
    MissingFromWork = 0,
    Incomplete = 1,
    Complete = 2,
    OvertimeOrFlex = 3,
    ValidTimeOff = 4,
}


export enum AmeldingStatus{
    IN_PROGRESS = 0,
    GENERATED = 1,
    SENT = 2,
    STATUS_FROM_ALTINN_RECEIVED = 3,
}


export enum State{
    NoOp = 0,
    BalanceCreate = 1,
    Calculated = 2,
}


export enum LicenseEntityStatus{
    Draft = 0,
    Pending = 3,
    Active = 5,
    Paused = 10,
    Inactive = 11,
    SoftDeleted = 20,
    HardDeleted = 25,
}


export enum ChallengeRequestResult{
    Ok = 0,
    InvalidCredentials = 1,
    NoPinFound = 2,
    NoPhoneNumber = 3,
    UserLockedOut = 4,
    InvalidPinType = 5,
    StatusDead = 6,
}


export enum ReportType{
    regnearkOdsV2 = 0,
    regnearkOdsV1 = 1,
    xmlFormatV2 = 2,
    maskinlesbartFormatXmlV1 = 3,
}


export enum Maaned{
    Item01 = 0,
    Item02 = 1,
    Item03 = 2,
    Item04 = 3,
    Item05 = 4,
    Item06 = 5,
    Item07 = 6,
    Item08 = 7,
    Item09 = 8,
    Item10 = 9,
    Item11 = 10,
    Item12 = 11,
}


export enum StatusCodeSharing{
    Pending = 70000,
    InProgress = 70001,
    Failed = 70002,
    Completed = 70003,
    Cancelled = 70004,
}


export enum StatusCodeBankIntegrationAgreement{
    Pending = 700001,
    WaitForSigning = 700002,
    WaitForBankApprove = 700003,
    WaitForZDataApprove = 700004,
    Active = 700005,
    Canceled = 700006,
}


export enum BankFileCustomFormat{
    MTNone = 0,
    MT940 = 1,
}


export enum BankfileField{
    Date = 1,
    Text = 2,
    Amount = 3,
    Debit = 4,
    Credit = 5,
    ArchiveCode = 6,
    Presign = 7,
    Text2 = 8,
    SecondaryAccount = 9,
    Category = 10,
}


export enum BankfileDataType{
    Text = 1,
    Decimal = 2,
    Decimal_00 = 3,
    NorDate = 4,
    IsoDate = 5,
    IsoDate2 = 6,
}


export enum BankBalanceType{
    None = 0,
    BankAccount = 1,
    MainLedgerAccount = 2,
}


export enum StatusCodeJournalEntryLine{
    Open = 31001,
    PartlyMarked = 31002,
    Marked = 31003,
    Credited = 31004,
}


export enum AltinnGetVatReportDataFromAltinnStatus{
    WaitingForAltinnResponse = 1,
    RejectedByAltinn = 2,
    ReportReceived = 3,
}


export enum StatusCodeCustomerInvoice{
    Draft = 42001,
    Invoiced = 42002,
    PartlyPaid = 42003,
    Paid = 42004,
    Sold = 42005,
}


export enum StatusCodeCustomerInvoiceItem{
    Draft = 41301,
    Invoiced = 41302,
}


export enum StatusCodeCustomerInvoiceReminder{
    Registered = 42101,
    Sent = 42102,
    Paid = 42103,
    Completed = 42104,
    Failed = 42105,
    SentToDebtCollection = 42106,
    QueuedForDebtCollection = 42107,
}


export enum StatusCodeCustomerOrder{
    Draft = 41001,
    Registered = 41002,
    PartlyTransferredToInvoice = 41003,
    TransferredToInvoice = 41004,
    Completed = 41005,
}


export enum StatusCodeCustomerOrderItem{
    Draft = 41101,
    Registered = 41102,
    TransferredToInvoice = 41103,
    Completed = 41104,
}


export enum StatusCodeCustomerQuote{
    Draft = 40101,
    Registered = 40102,
    ShippedToCustomer = 40103,
    CustomerAccepted = 40104,
    TransferredToOrder = 40105,
    TransferredToInvoice = 40106,
    Completed = 40107,
}


export enum StatusCodePaymentInfoType{
    Active = 42400,
    Disabled = 42401,
}


export enum StatusCodeRecurringInvoice{
    InActive = 46001,
    Active = 46002,
}


export enum StatusCodeRecurringInvoiceLog{
    Draft = 46101,
    InProgress = 46102,
    Failed = 46103,
    Completed = 46104,
}


export enum InternalAmeldingStatus{
    IN_PROGRESS = 0,
    GENERATED = 1,
    SENT = 2,
    STATUS_FROM_ALTINN_RECEIVED = 3,
}


export enum NotificationStatus{
    New = 900010,
    Read = 900020,
    Marked = 900030,
}


export enum ApprovalStatus{
    Active = 50120,
    Approved = 50130,
    Rejected = 50140,
}


export enum TaskStatus{
    Active = 50020,
    Complete = 50030,
    Pending = 50040,
}


export enum StatusCodeProduct{
    Active = 35001,
    Discarded = 35002,
    Deleted = 35003,
}


export enum StatusCodeContract{
    Draft = 120000,
    Deploy = 120001,
    Running = 120002,
    Killed = 120003,
}


export enum StatusCodeContractParameter{
    Deploy = 121001,
    Run = 121002,
}


export enum StatusCodeContractRunLog{
    Started = 120100,
    Completed = 120101,
    Failed = 120102,
}


export enum StatusCodeApiKey{
    Active = 80000,
    InProgress = 80010,
    WaitingForApproval = 80020,
    Approved = 80030,
    Denied = 80040,
    InActive = 80050,
}


export enum StatusCodeAltinnSigning{
    NotSigned = 43001,
    PartialSigned = 43002,
    Signed = 43003,
    AlreadySigned = 43004,
    Failed = 43005,
}


export enum StatusCodeAccrualPeriod{
    Registered = 33001,
    Accrued = 33002,
}


export enum AssetStatusCode{
    Active = 46200,
    Sold = 46205,
    Depreciated = 46210,
    Lost = 46215,
    DepreciationFailed = 46220,
}


export enum StatusCodeJournalEntryLineDraft{
    Journaled = 34001,
    Credited = 34002,
}


export enum StatusCodeReInvoice{
    Marked = 30201,
    Ready = 30202,
    ReInvoiced = 30203,
}


export enum StatusCodeSupplierInvoice{
    Draft = 30101,
    ForApproval = 30102,
    Approved = 30103,
    Journaled = 30104,
    Rejected = 30108,
}


export enum StatusCodeVatReport{
    Executed = 32001,
    Submitted = 32002,
    Rejected = 32003,
    Approved = 32004,
    Adjusted = 32005,
    Cancelled = 32006,
}


export enum CustomFieldStatus{
    Draft = 110100,
    Active = 110101,
}
