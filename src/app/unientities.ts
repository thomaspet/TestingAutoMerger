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

    public OldValue: string;
    public Field: string;
    public CreatedBy: string;
    public Route: string;
    public Deleted: boolean;
    public NewValue: string;
    public UpdatedAt: Date;
    public Transaction: string;
    public CreatedAt: Date;
    public EntityType: string;
    public ClientID: string;
    public Verb: string;
    public ID: number;
    public Action: string;
    public EntityID: number;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class WorkBalance extends UniEntity {
    public static RelativeUrl = 'workbalances';
    public static EntityType = 'WorkBalance';

    public CreatedBy: string;
    public ValidTimeOff: number;
    public ActualMinutes: number;
    public ValidFrom: Date;
    public Deleted: boolean;
    public Days: number;
    public Balancetype: WorkBalanceTypeEnum;
    public UpdatedAt: Date;
    public WorkRelationID: number;
    public CreatedAt: Date;
    public Description: string;
    public Minutes: number;
    public ID: number;
    public BalanceDate: Date;
    public ExpectedMinutes: number;
    public StatusCode: number;
    public IsStartBalance: boolean;
    public BalanceFrom: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Worker extends UniEntity {
    public static RelativeUrl = 'workers';
    public static EntityType = 'Worker';

    public CreatedBy: string;
    public BusinessRelationID: number;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public ID: number;
    public StatusCode: number;
    public UserID: number;
    public EmployeeID: number;
    public UpdatedBy: string;
    public _createguid: string;
    public Info: BusinessRelation;
    public Relations: Array<WorkRelation>;
    public Employee: Employee;
    public CustomFields: any;
}


export class WorkItem extends UniEntity {
    public static RelativeUrl = 'workitems';
    public static EntityType = 'WorkItem';

    public WorkItemGroupID: number;
    public OrderItemId: number;
    public StartTime: Date;
    public CreatedBy: string;
    public DimensionsID: number;
    public MinutesToOrder: number;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public Date: Date;
    public WorkRelationID: number;
    public CreatedAt: Date;
    public Description: string;
    public Minutes: number;
    public TransferedToPayroll: boolean;
    public ID: number;
    public TransferedToOrder: boolean;
    public CustomerOrderID: number;
    public Label: string;
    public LunchInMinutes: number;
    public PriceExVat: number;
    public WorkTypeID: number;
    public StatusCode: number;
    public EndTime: Date;
    public Invoiceable: boolean;
    public UpdatedBy: string;
    public CustomerID: number;
    public PayrollTrackingID: number;
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

    public CreatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public WorkRelationID: number;
    public CreatedAt: Date;
    public ID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public _createguid: string;
    public WorkRelation: WorkRelation;
    public Items: Array<WorkItem>;
    public CustomFields: any;
}


export class WorkProfile extends UniEntity {
    public static RelativeUrl = 'workprofiles';
    public static EntityType = 'WorkProfile';

    public CreatedBy: string;
    public MinutesPerWeek: number;
    public IsShared: boolean;
    public Deleted: boolean;
    public MinutesPerMonth: number;
    public MinutesPerYear: number;
    public UpdatedAt: Date;
    public LunchIncluded: boolean;
    public CreatedAt: Date;
    public ID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class WorkRelation extends UniEntity {
    public static RelativeUrl = 'workrelations';
    public static EntityType = 'WorkRelation';

    public IsActive: boolean;
    public CreatedBy: string;
    public CompanyName: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public WorkProfileID: number;
    public WorkerID: number;
    public WorkPercentage: number;
    public CreatedAt: Date;
    public TeamID: number;
    public Description: string;
    public ID: number;
    public IsPrivate: boolean;
    public StatusCode: number;
    public CompanyID: number;
    public StartDate: Date;
    public EndTime: Date;
    public UpdatedBy: string;
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

    public CreatedBy: string;
    public TimeoffType: number;
    public SystemKey: string;
    public Deleted: boolean;
    public FromDate: Date;
    public IsHalfDay: boolean;
    public UpdatedAt: Date;
    public WorkRelationID: number;
    public RegionKey: string;
    public CreatedAt: Date;
    public Description: string;
    public ID: number;
    public StatusCode: number;
    public ToDate: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class WorkType extends UniEntity {
    public static RelativeUrl = 'worktypes';
    public static EntityType = 'WorkType';

    public Price: number;
    public CreatedBy: string;
    public WagetypeNumber: number;
    public SystemType: WorkTypeEnum;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public ProductID: number;
    public Description: string;
    public ID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public Product: Product;
    public CustomFields: any;
}


export class BankFile extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'BankFile';

    public CreatedBy: string;
    public SubCompanyID: number;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public FileID: number;
    public Accountnumber: string;
    public ID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public ParentFileid: number;
    public _createguid: string;
    public File: File;
    public SubCompany: SubCompany;
    public CustomFields: any;
}


export class BatchInvoice extends UniEntity {
    public static RelativeUrl = 'batchinvoices';
    public static EntityType = 'BatchInvoice';

    public FreeTxt: string;
    public NotifyEmail: boolean;
    public CreatedBy: string;
    public MinAmount: number;
    public InvoiceDate: LocalDate;
    public TotalToProcess: number;
    public NumberOfBatches: number;
    public Operation: BatchInvoiceOperation;
    public Deleted: boolean;
    public YourRef: string;
    public UpdatedAt: Date;
    public OurRef: string;
    public DueDate: LocalDate;
    public SellerID: number;
    public CreatedAt: Date;
    public ID: number;
    public StatusCode: number;
    public Comment: string;
    public UpdatedBy: string;
    public Processed: number;
    public _createguid: string;
    public ProjectID: number;
    public CustomerID: number;
    public Items: Array<BatchInvoiceItem>;
    public CustomFields: any;
}


export class BatchInvoiceItem extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'BatchInvoiceItem';

    public CreatedBy: string;
    public CustomerInvoiceID: number;
    public Deleted: boolean;
    public BatchInvoiceID: number;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public CommentID: number;
    public ID: number;
    public CustomerOrderID: number;
    public StatusCode: StatusCode;
    public UpdatedBy: string;
    public BatchNumber: number;
    public _createguid: string;
    public ProjectID: number;
    public CustomerID: number;
    public CustomerOrder: CustomerOrder;
    public CustomerInvoice: CustomerInvoice;
    public CustomFields: any;
}


export class CampaignTemplate extends UniEntity {
    public static RelativeUrl = 'campaigntemplate';
    public static EntityType = 'CampaignTemplate';

    public Template: string;
    public CreatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public ID: number;
    public StatusCode: number;
    public EntityName: string;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Customer extends UniEntity {
    public static RelativeUrl = 'customers';
    public static EntityType = 'Customer';

    public CustomerNumber: number;
    public SocialSecurityNumber: string;
    public CustomerInvoiceReminderSettingsID: number;
    public CreditDays: number;
    public ReminderEmailAddress: string;
    public CreatedBy: string;
    public EfakturaIdentifier: string;
    public FactoringNumber: number;
    public GLN: string;
    public DimensionsID: number;
    public DeliveryTermsID: number;
    public DontSendReminders: boolean;
    public BusinessRelationID: number;
    public DefaultDistributionsID: number;
    public DefaultSellerID: number;
    public AvtaleGiro: boolean;
    public SubAccountNumberSeriesID: number;
    public DefaultCustomerOrderReportID: number;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public PeppolAddress: string;
    public CreatedAt: Date;
    public WebUrl: string;
    public ID: number;
    public EInvoiceAgreementReference: string;
    public IsPrivate: boolean;
    public StatusCode: number;
    public Localization: string;
    public AcceptableDelta4CustomerPaymentAccountID: number;
    public AvtaleGiroNotification: boolean;
    public UpdatedBy: string;
    public DefaultCustomerQuoteReportID: number;
    public CustomerNumberKidAlias: string;
    public CurrencyCodeID: number;
    public PaymentTermsID: number;
    public OrgNumber: string;
    public DefaultCustomerInvoiceReportID: number;
    public AcceptableDelta4CustomerPayment: number;
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

    public CreditedAmountCurrency: number;
    public ShippingAddressLine2: string;
    public InvoiceAddressLine1: string;
    public VatTotalsAmountCurrency: number;
    public CreditDays: number;
    public CustomerOrgNumber: string;
    public CustomerName: string;
    public FreeTxt: string;
    public PayableRoundingAmount: number;
    public InvoiceType: number;
    public BankAccountID: number;
    public CreatedBy: string;
    public InvoicePostalCode: string;
    public TaxInclusiveAmountCurrency: number;
    public InvoiceDate: LocalDate;
    public DeliveryTermsID: number;
    public DontSendReminders: boolean;
    public DeliveryDate: LocalDate;
    public PaymentInformation: string;
    public EmailAddress: string;
    public ShippingCountry: string;
    public DefaultSellerID: number;
    public ExternalReference: string;
    public CreditedAmount: number;
    public Deleted: boolean;
    public SupplierOrgNumber: string;
    public PaymentID: string;
    public TaxExclusiveAmount: number;
    public ShippingAddressLine1: string;
    public UpdatedAt: Date;
    public InvoiceReferenceID: number;
    public InvoiceCountryCode: string;
    public InvoiceNumber: string;
    public InternalNote: string;
    public Payment: string;
    public ShippingAddressLine3: string;
    public InvoiceCity: string;
    public OurReference: string;
    public RestAmountCurrency: number;
    public UseReportID: number;
    public CreatedAt: Date;
    public AmountRegards: string;
    public InvoiceCountry: string;
    public InvoiceAddressLine3: string;
    public DistributionPlanID: number;
    public ID: number;
    public ShippingCountryCode: string;
    public PayableRoundingCurrencyAmount: number;
    public CurrencyExchangeRate: number;
    public DeliveryName: string;
    public CustomerPerson: string;
    public DefaultDimensionsID: number;
    public PrintStatus: number;
    public StatusCode: number;
    public JournalEntryID: number;
    public Comment: string;
    public CollectorStatusCode: number;
    public Requisition: string;
    public ShippingCity: string;
    public YourReference: string;
    public InvoiceNumberSeriesID: number;
    public DeliveryMethod: string;
    public DeliveryTerm: string;
    public InvoiceAddressLine2: string;
    public TaxExclusiveAmountCurrency: number;
    public PaymentDueDate: LocalDate;
    public UpdateCurrencyAmountsOnDateChange: boolean;
    public TaxInclusiveAmount: number;
    public UpdatedBy: string;
    public InvoiceReceiverName: string;
    public VatTotalsAmount: number;
    public SalesPerson: string;
    public RestAmount: number;
    public PaymentTerm: string;
    public ShippingPostalCode: string;
    public PaymentInfoTypeID: number;
    public CurrencyCodeID: number;
    public CustomerID: number;
    public Credited: boolean;
    public PaymentTermsID: number;
    public AccrualID: number;
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
    public InvoicePeriodEndDate: LocalDate;
    public SumVat: number;
    public CreatedBy: string;
    public PriceIncVat: number;
    public CostPrice: number;
    public CustomerInvoiceID: number;
    public SortIndex: number;
    public DimensionsID: number;
    public ItemSourceID: number;
    public AccountingCost: string;
    public VatPercent: number;
    public Deleted: boolean;
    public DiscountPercent: number;
    public UpdatedAt: Date;
    public DiscountCurrency: number;
    public ItemText: string;
    public SumTotalExVatCurrency: number;
    public SumTotalExVat: number;
    public SumVatCurrency: number;
    public CreatedAt: Date;
    public ProductID: number;
    public ID: number;
    public SumTotalIncVat: number;
    public InvoicePeriodStartDate: LocalDate;
    public NumberOfItems: number;
    public CurrencyExchangeRate: number;
    public CalculateGrossPriceBasedOnNetPrice: boolean;
    public PriceExVat: number;
    public StatusCode: number;
    public Comment: string;
    public Discount: number;
    public PriceSetByUser: boolean;
    public AccountID: number;
    public UpdatedBy: string;
    public VatTypeID: number;
    public CurrencyCodeID: number;
    public SumTotalIncVatCurrency: number;
    public Unit: string;
    public OrderItemId: number;
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


export class CustomerInvoiceReminder extends UniEntity {
    public static RelativeUrl = 'invoicereminders';
    public static EntityType = 'CustomerInvoiceReminder';

    public DebtCollectionFee: number;
    public CreatedBy: string;
    public CustomerInvoiceID: number;
    public DimensionsID: number;
    public ReminderFeeCurrency: number;
    public EmailAddress: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public InterestFeeCurrency: number;
    public Title: string;
    public DueDate: LocalDate;
    public RestAmountCurrency: number;
    public CreatedAt: Date;
    public CreatedByReminderRuleID: number;
    public Description: string;
    public ID: number;
    public CurrencyExchangeRate: number;
    public RunNumber: number;
    public StatusCode: number;
    public ReminderNumber: number;
    public InterestFee: number;
    public ReminderFee: number;
    public UpdatedBy: string;
    public DebtCollectionFeeCurrency: number;
    public Notified: boolean;
    public RestAmount: number;
    public RemindedDate: LocalDate;
    public CurrencyCodeID: number;
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
    public CreditDays: number;
    public CreatedBy: string;
    public MinimumDaysFromDueDate: number;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public Title: string;
    public CreatedAt: Date;
    public Description: string;
    public ID: number;
    public StatusCode: number;
    public ReminderNumber: number;
    public ReminderFee: number;
    public UpdatedBy: string;
    public UseMaximumLegalReminderFee: boolean;
    public _createguid: string;
    public CustomerInvoiceReminderSettings: CustomerInvoiceReminderSettings;
    public CustomFields: any;
}


export class CustomerInvoiceReminderSettings extends UniEntity {
    public static RelativeUrl = 'invoiceremindersettings';
    public static EntityType = 'CustomerInvoiceReminderSettings';

    public RemindersBeforeDebtCollection: number;
    public CreatedBy: string;
    public Deleted: boolean;
    public AcceptPaymentWithoutReminderFee: boolean;
    public UpdatedAt: Date;
    public DebtCollectionSettingsID: number;
    public CreatedAt: Date;
    public ID: number;
    public StatusCode: number;
    public DefaultReminderFeeAccountID: number;
    public MinimumAmountToRemind: number;
    public UpdatedBy: string;
    public _createguid: string;
    public DebtCollectionSettings: DebtCollectionSettings;
    public DefaultReminderFeeAccount: Account;
    public CustomerInvoiceReminderRules: Array<CustomerInvoiceReminderRule>;
    public CustomFields: any;
}


export class CustomerOrder extends UniEntity {
    public static RelativeUrl = 'orders';
    public static EntityType = 'CustomerOrder';

    public ShippingAddressLine2: string;
    public InvoiceAddressLine1: string;
    public VatTotalsAmountCurrency: number;
    public CreditDays: number;
    public OrderNumberSeriesID: number;
    public CustomerOrgNumber: string;
    public CustomerName: string;
    public FreeTxt: string;
    public PayableRoundingAmount: number;
    public RestExclusiveAmountCurrency: number;
    public CreatedBy: string;
    public InvoicePostalCode: string;
    public TaxInclusiveAmountCurrency: number;
    public DeliveryTermsID: number;
    public DeliveryDate: LocalDate;
    public EmailAddress: string;
    public ShippingCountry: string;
    public DefaultSellerID: number;
    public OrderNumber: number;
    public Deleted: boolean;
    public SupplierOrgNumber: string;
    public UpdateCurrencyOnToInvoice: boolean;
    public TaxExclusiveAmount: number;
    public ShippingAddressLine1: string;
    public UpdatedAt: Date;
    public InvoiceCountryCode: string;
    public InternalNote: string;
    public ShippingAddressLine3: string;
    public InvoiceCity: string;
    public OurReference: string;
    public RestAmountCurrency: number;
    public UseReportID: number;
    public CreatedAt: Date;
    public InvoiceCountry: string;
    public InvoiceAddressLine3: string;
    public DistributionPlanID: number;
    public ID: number;
    public ShippingCountryCode: string;
    public PayableRoundingCurrencyAmount: number;
    public CurrencyExchangeRate: number;
    public DeliveryName: string;
    public CustomerPerson: string;
    public DefaultDimensionsID: number;
    public PrintStatus: number;
    public StatusCode: number;
    public Comment: string;
    public Requisition: string;
    public OrderDate: LocalDate;
    public ShippingCity: string;
    public YourReference: string;
    public DeliveryMethod: string;
    public DeliveryTerm: string;
    public InvoiceAddressLine2: string;
    public ReadyToInvoice: boolean;
    public TaxExclusiveAmountCurrency: number;
    public UpdateCurrencyAmountsOnDateChange: boolean;
    public TaxInclusiveAmount: number;
    public UpdatedBy: string;
    public InvoiceReceiverName: string;
    public VatTotalsAmount: number;
    public SalesPerson: string;
    public PaymentTerm: string;
    public ShippingPostalCode: string;
    public PaymentInfoTypeID: number;
    public CurrencyCodeID: number;
    public CustomerID: number;
    public PaymentTermsID: number;
    public AccrualID: number;
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
    public SumVat: number;
    public CreatedBy: string;
    public PriceIncVat: number;
    public CostPrice: number;
    public SortIndex: number;
    public DimensionsID: number;
    public ItemSourceID: number;
    public VatPercent: number;
    public Deleted: boolean;
    public DiscountPercent: number;
    public UpdatedAt: Date;
    public DiscountCurrency: number;
    public ItemText: string;
    public SumTotalExVatCurrency: number;
    public SumTotalExVat: number;
    public SumVatCurrency: number;
    public CreatedAt: Date;
    public ProductID: number;
    public ID: number;
    public SumTotalIncVat: number;
    public CustomerOrderID: number;
    public NumberOfItems: number;
    public CurrencyExchangeRate: number;
    public CalculateGrossPriceBasedOnNetPrice: boolean;
    public PriceExVat: number;
    public StatusCode: number;
    public Comment: string;
    public Discount: number;
    public ReadyToInvoice: boolean;
    public PriceSetByUser: boolean;
    public AccountID: number;
    public UpdatedBy: string;
    public VatTypeID: number;
    public CurrencyCodeID: number;
    public SumTotalIncVatCurrency: number;
    public Unit: string;
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

    public ShippingAddressLine2: string;
    public InvoiceAddressLine1: string;
    public VatTotalsAmountCurrency: number;
    public CreditDays: number;
    public CustomerOrgNumber: string;
    public CustomerName: string;
    public FreeTxt: string;
    public PayableRoundingAmount: number;
    public CreatedBy: string;
    public InquiryReference: number;
    public QuoteNumber: number;
    public InvoicePostalCode: string;
    public TaxInclusiveAmountCurrency: number;
    public DeliveryTermsID: number;
    public DeliveryDate: LocalDate;
    public EmailAddress: string;
    public ShippingCountry: string;
    public DefaultSellerID: number;
    public QuoteNumberSeriesID: number;
    public Deleted: boolean;
    public SupplierOrgNumber: string;
    public UpdateCurrencyOnToInvoice: boolean;
    public TaxExclusiveAmount: number;
    public ValidUntilDate: LocalDate;
    public ShippingAddressLine1: string;
    public UpdatedAt: Date;
    public InvoiceCountryCode: string;
    public InternalNote: string;
    public UpdateCurrencyOnToOrder: boolean;
    public ShippingAddressLine3: string;
    public InvoiceCity: string;
    public OurReference: string;
    public UseReportID: number;
    public CreatedAt: Date;
    public InvoiceCountry: string;
    public InvoiceAddressLine3: string;
    public DistributionPlanID: number;
    public ID: number;
    public ShippingCountryCode: string;
    public PayableRoundingCurrencyAmount: number;
    public CurrencyExchangeRate: number;
    public DeliveryName: string;
    public CustomerPerson: string;
    public DefaultDimensionsID: number;
    public PrintStatus: number;
    public StatusCode: number;
    public Comment: string;
    public Requisition: string;
    public ShippingCity: string;
    public YourReference: string;
    public QuoteDate: LocalDate;
    public DeliveryMethod: string;
    public DeliveryTerm: string;
    public InvoiceAddressLine2: string;
    public TaxExclusiveAmountCurrency: number;
    public UpdateCurrencyAmountsOnDateChange: boolean;
    public TaxInclusiveAmount: number;
    public UpdatedBy: string;
    public InvoiceReceiverName: string;
    public VatTotalsAmount: number;
    public SalesPerson: string;
    public PaymentTerm: string;
    public ShippingPostalCode: string;
    public PaymentInfoTypeID: number;
    public CurrencyCodeID: number;
    public CustomerID: number;
    public PaymentTermsID: number;
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
    public SumVat: number;
    public CreatedBy: string;
    public PriceIncVat: number;
    public CostPrice: number;
    public SortIndex: number;
    public DimensionsID: number;
    public VatPercent: number;
    public Deleted: boolean;
    public DiscountPercent: number;
    public UpdatedAt: Date;
    public DiscountCurrency: number;
    public ItemText: string;
    public SumTotalExVatCurrency: number;
    public SumTotalExVat: number;
    public SumVatCurrency: number;
    public CreatedAt: Date;
    public ProductID: number;
    public ID: number;
    public SumTotalIncVat: number;
    public NumberOfItems: number;
    public CurrencyExchangeRate: number;
    public CalculateGrossPriceBasedOnNetPrice: boolean;
    public PriceExVat: number;
    public StatusCode: number;
    public Comment: string;
    public CustomerQuoteID: number;
    public Discount: number;
    public PriceSetByUser: boolean;
    public AccountID: number;
    public UpdatedBy: string;
    public VatTypeID: number;
    public CurrencyCodeID: number;
    public SumTotalIncVatCurrency: number;
    public Unit: string;
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
    public CreatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public ID: number;
    public CreditorNumber: number;
    public StatusCode: number;
    public DebtCollectionAutomationID: number;
    public IntegrateWithDebtCollection: boolean;
    public UpdatedBy: string;
    public DebtCollectionFormat: number;
    public _createguid: string;
    public DebtCollectionAutomation: Array<DebtCollectionAutomation>;
    public CustomerInvoiceReminderSettings: CustomerInvoiceReminderSettings;
    public CustomFields: any;
}


export class ItemSource extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ItemSource';

    public CreatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public ID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public _createguid: string;
    public Details: Array<ItemSourceDetail>;
    public CustomFields: any;
}


export class ItemSourceDetail extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ItemSourceDetail';

    public CreatedBy: string;
    public ItemSourceID: number;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public SourceType: string;
    public CreatedAt: Date;
    public Amount: number;
    public SourceFK: number;
    public Description: string;
    public ID: number;
    public Tag: string;
    public StatusCode: number;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class PaymentInfoType extends UniEntity {
    public static RelativeUrl = 'paymentinfotype';
    public static EntityType = 'PaymentInfoType';

    public CreatedBy: string;
    public Type: PaymentInfoTypeEnum;
    public Deleted: boolean;
    public Length: number;
    public UpdatedAt: Date;
    public Control: Modulus;
    public CreatedAt: Date;
    public Locked: boolean;
    public ID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public PaymentInfoTypeParts: Array<PaymentInfoTypePart>;
    public CustomFields: any;
}


export class PaymentInfoTypePart extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'PaymentInfoTypePart';

    public CreatedBy: string;
    public SortIndex: number;
    public Deleted: boolean;
    public Length: number;
    public UpdatedAt: Date;
    public Part: string;
    public CreatedAt: Date;
    public ID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public PaymentInfoTypeID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class RecurringInvoice extends UniEntity {
    public static RelativeUrl = 'recurringinvoices';
    public static EntityType = 'RecurringInvoice';

    public ShippingAddressLine2: string;
    public InvoiceAddressLine1: string;
    public NoCreditDays: boolean;
    public VatTotalsAmountCurrency: number;
    public CreditDays: number;
    public CustomerOrgNumber: string;
    public CustomerName: string;
    public TimePeriod: RecurringPeriod;
    public NotifyWhenOrdersArePrepared: boolean;
    public FreeTxt: string;
    public PayableRoundingAmount: number;
    public CreatedBy: string;
    public InvoicePostalCode: string;
    public TaxInclusiveAmountCurrency: number;
    public DeliveryTermsID: number;
    public DeliveryDate: LocalDate;
    public MaxIterations: number;
    public PaymentInformation: string;
    public EmailAddress: string;
    public ShippingCountry: string;
    public DefaultSellerID: number;
    public Deleted: boolean;
    public SupplierOrgNumber: string;
    public TaxExclusiveAmount: number;
    public ShippingAddressLine1: string;
    public UpdatedAt: Date;
    public InvoiceCountryCode: string;
    public InternalNote: string;
    public Payment: string;
    public ShippingAddressLine3: string;
    public InvoiceCity: string;
    public OurReference: string;
    public UseReportID: number;
    public CreatedAt: Date;
    public AmountRegards: string;
    public InvoiceCountry: string;
    public InvoiceAddressLine3: string;
    public DistributionPlanID: number;
    public ID: number;
    public ShippingCountryCode: string;
    public NextInvoiceDate: LocalDate;
    public Interval: number;
    public PayableRoundingCurrencyAmount: number;
    public CurrencyExchangeRate: number;
    public DeliveryName: string;
    public CustomerPerson: string;
    public DefaultDimensionsID: number;
    public PrintStatus: number;
    public StatusCode: number;
    public Comment: string;
    public StartDate: LocalDate;
    public Requisition: string;
    public ShippingCity: string;
    public YourReference: string;
    public InvoiceNumberSeriesID: number;
    public DeliveryMethod: string;
    public DeliveryTerm: string;
    public InvoiceAddressLine2: string;
    public PreparationDays: number;
    public TaxExclusiveAmountCurrency: number;
    public UpdateCurrencyAmountsOnDateChange: boolean;
    public TaxInclusiveAmount: number;
    public UpdatedBy: string;
    public EndDate: LocalDate;
    public NotifyUser: string;
    public InvoiceReceiverName: string;
    public VatTotalsAmount: number;
    public SalesPerson: string;
    public PaymentTerm: string;
    public ShippingPostalCode: string;
    public PaymentInfoTypeID: number;
    public ProduceAs: RecurringResult;
    public CurrencyCodeID: number;
    public CustomerID: number;
    public PaymentTermsID: number;
    public NotifyWhenRecurringEnds: boolean;
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
    public SumVat: number;
    public CreatedBy: string;
    public PriceIncVat: number;
    public SortIndex: number;
    public DimensionsID: number;
    public VatPercent: number;
    public Deleted: boolean;
    public ReduceIncompletePeriod: boolean;
    public DiscountPercent: number;
    public UpdatedAt: Date;
    public DiscountCurrency: number;
    public PricingSource: PricingSource;
    public ItemText: string;
    public SumTotalExVatCurrency: number;
    public SumTotalExVat: number;
    public SumVatCurrency: number;
    public CreatedAt: Date;
    public ProductID: number;
    public ID: number;
    public SumTotalIncVat: number;
    public NumberOfItems: number;
    public CurrencyExchangeRate: number;
    public TimeFactor: RecurringPeriod;
    public CalculateGrossPriceBasedOnNetPrice: boolean;
    public PriceExVat: number;
    public StatusCode: number;
    public Comment: string;
    public Discount: number;
    public PriceSetByUser: boolean;
    public AccountID: number;
    public UpdatedBy: string;
    public VatTypeID: number;
    public CurrencyCodeID: number;
    public RecurringInvoiceID: number;
    public SumTotalIncVatCurrency: number;
    public Unit: string;
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

    public NotifiedRecurringEnds: boolean;
    public CreatedBy: string;
    public InvoiceDate: LocalDate;
    public OrderID: number;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public InvoiceID: number;
    public CreatedAt: Date;
    public ID: number;
    public IterationNumber: number;
    public StatusCode: number;
    public Comment: string;
    public CreationDate: LocalDate;
    public NotifiedOrdersPrepared: boolean;
    public UpdatedBy: string;
    public RecurringInvoiceID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class Seller extends UniEntity {
    public static RelativeUrl = 'sellers';
    public static EntityType = 'Seller';

    public CreatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public TeamID: number;
    public ID: number;
    public DefaultDimensionsID: number;
    public StatusCode: number;
    public UserID: number;
    public EmployeeID: number;
    public UpdatedBy: string;
    public Name: string;
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

    public CreatedBy: string;
    public CustomerInvoiceID: number;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public SellerID: number;
    public CreatedAt: Date;
    public Amount: number;
    public ID: number;
    public CustomerOrderID: number;
    public Percent: number;
    public StatusCode: number;
    public CustomerQuoteID: number;
    public UpdatedBy: string;
    public RecurringInvoiceID: number;
    public CustomerID: number;
    public _createguid: string;
    public Seller: Seller;
    public CustomFields: any;
}


export class SubCompany extends UniEntity {
    public static RelativeUrl = 'subcompanies';
    public static EntityType = 'SubCompany';

    public CreatedBy: string;
    public CompanyName: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public CompanyKey: string;
    public CreatedAt: Date;
    public CompanyType: CompanyRelation;
    public ID: number;
    public StatusCode: number;
    public CompanyID: number;
    public UpdatedBy: string;
    public CustomerID: number;
    public _createguid: string;
    public Customer: Customer;
    public CustomFields: any;
}


export class Supplier extends UniEntity {
    public static RelativeUrl = 'suppliers';
    public static EntityType = 'Supplier';

    public CreditDays: number;
    public CreatedBy: string;
    public GLN: string;
    public SupplierNumber: number;
    public DimensionsID: number;
    public BusinessRelationID: number;
    public SubAccountNumberSeriesID: number;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public PeppolAddress: string;
    public CostAllocationID: number;
    public SelfEmployed: boolean;
    public CreatedAt: Date;
    public WebUrl: string;
    public ID: number;
    public StatusCode: number;
    public Localization: string;
    public UpdatedBy: string;
    public CurrencyCodeID: number;
    public OrgNumber: string;
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

    public CreditDays: number;
    public CreatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Description: string;
    public ID: number;
    public TermsType: TermsType;
    public StatusCode: number;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class TOFCurrencySettings extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'TOFCurrencySettings';

    public UpdateCurrencyAmountsOnQuotedateChange: boolean;
    public UpdateCurrencyAmountsOnOrderdateChange: boolean;
    public CreatedBy: string;
    public UpdateCurrencyAmountsOnQuoteToOrder: boolean;
    public UpdateCurrencyAmountsOnQuoteToInvoice: boolean;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public ID: number;
    public UpdateCurrencyAmountsOnOrderToInvoice: boolean;
    public StatusCode: number;
    public UpdateCurrencyAmountsOnInvoicedateChange: boolean;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Address extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Address';

    public CreatedBy: string;
    public CountryCode: string;
    public BusinessRelationID: number;
    public AddressLine1: string;
    public Country: string;
    public AddressLine2: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public AddressLine3: string;
    public CreatedAt: Date;
    public ID: number;
    public StatusCode: number;
    public Region: string;
    public PostalCode: string;
    public City: string;
    public UpdatedBy: string;
    public _createguid: string;
    public BusinessRelation: BusinessRelation;
    public CustomFields: any;
}


export class BusinessRelation extends UniEntity {
    public static RelativeUrl = 'business-relations';
    public static EntityType = 'BusinessRelation';

    public CreatedBy: string;
    public DefaultContactID: number;
    public DefaultBankAccountID: number;
    public Deleted: boolean;
    public ShippingAddressID: number;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public ID: number;
    public DefaultEmailID: number;
    public InvoiceAddressID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public DefaultPhoneID: number;
    public Name: string;
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

    public Role: string;
    public CreatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public ParentBusinessRelationID: number;
    public CreatedAt: Date;
    public InfoID: number;
    public ID: number;
    public StatusCode: number;
    public Comment: string;
    public UpdatedBy: string;
    public _createguid: string;
    public ParentBusinessRelation: BusinessRelation;
    public Info: BusinessRelation;
    public CustomFields: any;
}


export class Email extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Email';

    public CreatedBy: string;
    public BusinessRelationID: number;
    public Type: string;
    public EmailAddress: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Description: string;
    public ID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Phone extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Phone';

    public CreatedBy: string;
    public CountryCode: string;
    public BusinessRelationID: number;
    public Type: PhoneTypeEnum;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Description: string;
    public ID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public Number: string;
    public _createguid: string;
    public CustomFields: any;
}


export class AGACalculation extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AGACalculation';

    public CreatedBy: string;
    public DimensionsID: number;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public ID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public PayrollRunID: number;
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

    public CreatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public ID: number;
    public StatusCode: number;
    public AGACalculationID: number;
    public SubEntityID: number;
    public UpdatedBy: string;
    public freeAmount: number;
    public _createguid: string;
    public subEntity: SubEntity;
    public CustomFields: any;
}


export class AGATax extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AGATax';

    public CreatedBy: string;
    public agaBase: number;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public AGARateID: number;
    public CreatedAt: Date;
    public ID: number;
    public agaRate: number;
    public StatusCode: number;
    public beregningsKode: number;
    public AGACalculationID: number;
    public SubEntityID: number;
    public UpdatedBy: string;
    public zone: number;
    public _createguid: string;
    public zoneName: string;
    public municipalityName: string;
    public subEntity: SubEntity;
    public CustomFields: any;
}


export class AGAPension extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AGAPension';

    public CreatedBy: string;
    public agaBase: number;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public AGARateID: number;
    public CreatedAt: Date;
    public ID: number;
    public agaRate: number;
    public StatusCode: number;
    public beregningsKode: number;
    public AGACalculationID: number;
    public SubEntityID: number;
    public UpdatedBy: string;
    public zone: number;
    public _createguid: string;
    public zoneName: string;
    public municipalityName: string;
    public subEntity: SubEntity;
    public CustomFields: any;
}


export class AGADraw extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AGADraw';

    public CreatedBy: string;
    public agaBase: number;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public AGARateID: number;
    public CreatedAt: Date;
    public ID: number;
    public agaRate: number;
    public StatusCode: number;
    public beregningsKode: number;
    public AGACalculationID: number;
    public SubEntityID: number;
    public UpdatedBy: string;
    public zone: number;
    public _createguid: string;
    public zoneName: string;
    public municipalityName: string;
    public subEntity: SubEntity;
    public CustomFields: any;
}


export class ForeignerWithPercent extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ForeignerWithPercent';

    public CreatedBy: string;
    public agaBase: number;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public ID: number;
    public agaRate: number;
    public StatusCode: number;
    public AGACalculationID: number;
    public SubEntityID: number;
    public UpdatedBy: string;
    public _createguid: string;
    public zoneName: string;
    public municipalityName: string;
    public subEntity: SubEntity;
    public CustomFields: any;
}


export class DrawForeignerWithPercent extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'DrawForeignerWithPercent';

    public CreatedBy: string;
    public agaBase: number;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public ID: number;
    public agaRate: number;
    public StatusCode: number;
    public AGACalculationID: number;
    public SubEntityID: number;
    public UpdatedBy: string;
    public _createguid: string;
    public zoneName: string;
    public municipalityName: string;
    public subEntity: SubEntity;
    public CustomFields: any;
}


export class ForeignerWithAmount extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ForeignerWithAmount';

    public CreatedBy: string;
    public Deleted: boolean;
    public persons: number;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public ID: number;
    public StatusCode: number;
    public AGACalculationID: number;
    public SubEntityID: number;
    public UpdatedBy: string;
    public aga: number;
    public _createguid: string;
    public zoneName: string;
    public municipalityName: string;
    public subEntity: SubEntity;
    public CustomFields: any;
}


export class TaxAndAgaSums extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'TaxAndAgaSums';

    public CreatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public WithholdingTax: number;
    public FinancialTax: number;
    public CreatedAt: Date;
    public ID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class AmeldingData extends UniEntity {
    public static RelativeUrl = 'amelding';
    public static EntityType = 'AmeldingData';

    public CreatedBy: string;
    public type: AmeldingType;
    public created: Date;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public altinnStatus: string;
    public receiptID: number;
    public CreatedAt: Date;
    public period: number;
    public year: number;
    public ID: number;
    public initiated: Date;
    public mainFileID: number;
    public StatusCode: number;
    public OppgaveHash: string;
    public replacesID: number;
    public attachmentFileID: number;
    public status: number;
    public feedbackFileID: number;
    public UpdatedBy: string;
    public PayrollRunID: number;
    public sent: Date;
    public messageID: string;
    public _createguid: string;
    public xmlValidationErrors: string;
    public replaceThis: string;
    public log: Array<AmeldingLog>;
    public CustomFields: any;
}


export class AmeldingLog extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AmeldingLog';

    public CreatedBy: string;
    public key: number;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public ID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public registry: SalaryRegistry;
    public AmeldingsID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class BasicAmount extends UniEntity {
    public static RelativeUrl = 'basicamounts';
    public static EntityType = 'BasicAmount';

    public CreatedBy: string;
    public BasicAmountPrYear: number;
    public AveragePrYear: number;
    public Deleted: boolean;
    public FromDate: Date;
    public BasicAmountPrMonth: number;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public ID: number;
    public ConversionFactor: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class CompanySalary extends UniEntity {
    public static RelativeUrl = 'companysalary';
    public static EntityType = 'CompanySalary';

    public WagetypeAdvancePayment: number;
    public MainAccountAllocatedVacation: number;
    public OtpExportActive: boolean;
    public CreatedBy: string;
    public PostGarnishmentToTaxAccount: boolean;
    public MainAccountCostFinancialVacation: number;
    public AllowOver6G: boolean;
    public Base_JanMayenAndBiCountries: boolean;
    public Base_TaxFreeOrganization: boolean;
    public MainAccountCostAGAVacation: number;
    public HoursPerMonth: number;
    public Base_Svalbard: boolean;
    public MainAccountAllocatedFinancialVacation: number;
    public WagetypeAdvancePaymentAuto: number;
    public PaycheckZipReportID: number;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public MainAccountAllocatedAGA: number;
    public CalculateFinancialTax: boolean;
    public CreatedAt: Date;
    public HourFTEs: number;
    public MainAccountCostFinancial: number;
    public ID: number;
    public Base_NettoPayment: boolean;
    public Base_SpesialDeductionForMaritim: boolean;
    public MainAccountAllocatedAGAVacation: number;
    public PostToTaxDraw: boolean;
    public MainAccountCostVacation: number;
    public StatusCode: number;
    public MainAccountCostAGA: number;
    public Base_NettoPaymentForMaritim: boolean;
    public WageDeductionDueToHoliday: WageDeductionDueToHolidayType;
    public UpdatedBy: string;
    public FreeAmount: number;
    public InterrimRemitAccount: number;
    public PaymentInterval: CompanySalaryPaymentInterval;
    public MainAccountAllocatedFinancial: number;
    public RateFinancialTax: number;
    public Base_PayAsYouEarnTaxOnPensions: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class CompanyVacationRate extends UniEntity {
    public static RelativeUrl = 'companyvacationrates';
    public static EntityType = 'CompanyVacationRate';

    public CreatedBy: string;
    public Deleted: boolean;
    public FromDate: Date;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public ID: number;
    public Rate60: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public Rate: number;
    public _createguid: string;
    public CustomFields: any;
}


export class EmployeeCategory extends UniEntity {
    public static RelativeUrl = 'employeecategories';
    public static EntityType = 'EmployeeCategory';

    public CreatedBy: string;
    public Deleted: boolean;
    public EmployeeCategoryLinkID: number;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public ID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class EmployeeCategoryLink extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'EmployeeCategoryLink';

    public CreatedBy: string;
    public EmployeeCategoryID: number;
    public Deleted: boolean;
    public EmployeeNumber: number;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public ID: number;
    public StatusCode: number;
    public EmployeeID: number;
    public UpdatedBy: string;
    public _createguid: string;
    public EmployeeCategory: EmployeeCategory;
    public Employee: Employee;
    public CustomFields: any;
}


export class Employee extends UniEntity {
    public static RelativeUrl = 'employees';
    public static EntityType = 'Employee';

    public SocialSecurityNumber: string;
    public InternasjonalIDCountry: string;
    public CreatedBy: string;
    public EndDateOtp: LocalDate;
    public AdvancePaymentAmount: number;
    public TypeOfPaymentOtp: TypeOfPaymentOtp;
    public BusinessRelationID: number;
    public Active: boolean;
    public IncludeOtpUntilMonth: number;
    public IncludeOtpUntilYear: number;
    public Deleted: boolean;
    public InternasjonalIDType: InternationalIDType;
    public EmployeeNumber: number;
    public UpdatedAt: Date;
    public OtpExport: boolean;
    public BirthDate: Date;
    public EmploymentDate: Date;
    public CreatedAt: Date;
    public ID: number;
    public MunicipalityNo: string;
    public ForeignWorker: ForeignWorker;
    public StatusCode: number;
    public PhotoID: number;
    public Sex: GenderEnum;
    public UserID: number;
    public EmploymentDateOtp: LocalDate;
    public EmployeeLanguageID: number;
    public SubEntityID: number;
    public UpdatedBy: string;
    public FreeText: string;
    public PaymentInterval: PaymentInterval;
    public InternationalID: string;
    public OtpStatus: OtpStatus;
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

    public SecondaryTable: string;
    public SecondaryPercent: number;
    public CreatedBy: string;
    public TaxcardId: number;
    public NotMainEmployer: boolean;
    public SKDXml: string;
    public ResultatStatus: string;
    public loennFraBiarbeidsgiverID: number;
    public Deleted: boolean;
    public EmployeeNumber: number;
    public UpdatedAt: Date;
    public Table: string;
    public pensjonID: number;
    public Tilleggsopplysning: string;
    public CreatedAt: Date;
    public IssueDate: Date;
    public ufoereYtelserAndreID: number;
    public Year: number;
    public ID: number;
    public Percent: number;
    public loennTilUtenrikstjenestemannID: number;
    public loennKunTrygdeavgiftTilUtenlandskBorgerID: number;
    public loennFraHovedarbeidsgiverID: number;
    public StatusCode: number;
    public NonTaxableAmount: number;
    public loennKunTrygdeavgiftTilUtenlandskBorgerSomGrensegjengerID: number;
    public EmployeeID: number;
    public UpdatedBy: string;
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

    public CreatedBy: string;
    public freeAmountType: FreeAmountType;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public Table: string;
    public AntallMaanederForTrekk: number;
    public CreatedAt: Date;
    public ID: number;
    public Percent: number;
    public NonTaxableAmount: number;
    public tabellType: TabellType;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class EmployeeLeave extends UniEntity {
    public static RelativeUrl = 'EmployeeLeave';
    public static EntityType = 'EmployeeLeave';

    public AffectsOtp: boolean;
    public CreatedBy: string;
    public EmploymentID: number;
    public Deleted: boolean;
    public LeavePercent: number;
    public FromDate: Date;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Description: string;
    public ID: number;
    public StatusCode: number;
    public ToDate: Date;
    public LeaveType: Leavetype;
    public UpdatedBy: string;
    public _createguid: string;
    public Employment: Employment;
    public CustomFields: any;
}


export class Employment extends UniEntity {
    public static RelativeUrl = 'employments';
    public static EntityType = 'Employment';

    public CreatedBy: string;
    public HoursPerWeek: number;
    public JobCode: string;
    public DimensionsID: number;
    public RegulativeGroupID: number;
    public Standard: boolean;
    public ShipType: ShipTypeOfShip;
    public Deleted: boolean;
    public RegulativeStepNr: number;
    public TypeOfEmployment: TypeOfEmployment;
    public EmployeeNumber: number;
    public ShipReg: ShipRegistry;
    public UpdatedAt: Date;
    public SeniorityDate: Date;
    public JobName: string;
    public CreatedAt: Date;
    public HourRate: number;
    public ID: number;
    public LastWorkPercentChangeDate: Date;
    public WorkPercent: number;
    public LastSalaryChangeDate: Date;
    public StatusCode: number;
    public StartDate: Date;
    public MonthRate: number;
    public WorkingHoursScheme: WorkingHoursScheme;
    public RemunerationType: RemunerationType;
    public EmployeeID: number;
    public LedgerAccount: string;
    public UserDefinedRate: number;
    public TradeArea: ShipTradeArea;
    public SubEntityID: number;
    public UpdatedBy: string;
    public EndDate: Date;
    public PayGrade: string;
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

    public AffectsAGA: boolean;
    public CreatedBy: string;
    public Deleted: boolean;
    public FromDate: Date;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Amount: number;
    public Description: string;
    public ID: number;
    public StatusCode: number;
    public SubentityID: number;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class OtpExportWagetype extends UniEntity {
    public static RelativeUrl = 'otpexportwagetypes';
    public static EntityType = 'OtpExportWagetype';

    public CreatedBy: string;
    public WageTypeNumber: number;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public ID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class PayrollRun extends UniEntity {
    public static RelativeUrl = 'payrollrun';
    public static EntityType = 'PayrollRun';

    public AGAFreeAmount: number;
    public CreatedBy: string;
    public needsRecalc: boolean;
    public SettlementDate: Date;
    public taxdrawfactor: TaxDrawFactor;
    public Deleted: boolean;
    public PaycheckFileID: number;
    public FromDate: Date;
    public AGAonRun: number;
    public UpdatedAt: Date;
    public JournalEntryNumber: string;
    public CreatedAt: Date;
    public Description: string;
    public PayDate: Date;
    public ID: number;
    public StatusCode: number;
    public ToDate: Date;
    public HolidayPayDeduction: boolean;
    public UpdatedBy: string;
    public ExcludeRecurringPosts: boolean;
    public FreeText: string;
    public _createguid: string;
    public transactions: Array<SalaryTransaction>;
    public agacalculation: Array<AGACalculation>;
    public CustomFields: any;
}


export class PayrollRunCategoryLink extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'PayrollRunCategoryLink';

    public CreatedBy: string;
    public EmployeeCategoryID: number;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public ID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public PayrollRunID: number;
    public _createguid: string;
    public EmployeeCategory: EmployeeCategory;
    public PayrollRun: PayrollRun;
    public CustomFields: any;
}


export class PostingSummaryDraft extends UniEntity {
    public draftBasic: string;
    public PayrollID: number;
    public draftWithDimsOnBalance: string;
    public statusTime: Date;
    public ID: number;
    public JobInfoID: number;
    public status: SummaryJobStatus;
    public draftWithDims: string;
}


export class Regulative extends UniEntity {
    public static RelativeUrl = 'regulatives';
    public static EntityType = 'Regulative';

    public CreatedBy: string;
    public RegulativeGroupID: number;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public ID: number;
    public StatusCode: number;
    public StartDate: LocalDate;
    public UpdatedBy: string;
    public _createguid: string;
    public Steps: Array<RegulativeStep>;
    public CustomFields: any;
}


export class RegulativeGroup extends UniEntity {
    public static RelativeUrl = 'regulativegroups';
    public static EntityType = 'RegulativeGroup';

    public CreatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public ID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public Regulatives: Array<Regulative>;
    public CustomFields: any;
}


export class RegulativeStep extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'RegulativeStep';

    public CreatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Amount: number;
    public ID: number;
    public StatusCode: number;
    public RegulativeID: number;
    public UpdatedBy: string;
    public Step: number;
    public _createguid: string;
    public CustomFields: any;
}


export class SalaryBalance extends UniEntity {
    public static RelativeUrl = 'salarybalances';
    public static EntityType = 'SalaryBalance';

    public Source: SalBalSource;
    public SupplierID: number;
    public Instalment: number;
    public CreatedBy: string;
    public MinAmount: number;
    public WageTypeNumber: number;
    public Type: SalBalDrawType;
    public EmploymentID: number;
    public Deleted: boolean;
    public FromDate: Date;
    public InstalmentPercent: number;
    public SalaryBalanceTemplateID: number;
    public UpdatedAt: Date;
    public MaxAmount: number;
    public CreatedAt: Date;
    public ID: number;
    public CreatePayment: boolean;
    public StatusCode: number;
    public ToDate: Date;
    public EmployeeID: number;
    public KID: string;
    public InstalmentType: SalBalType;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public CalculatedBalance: number;
    public Amount: number;
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

    public SalaryBalanceID: number;
    public CreatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public Date: LocalDate;
    public CreatedAt: Date;
    public Amount: number;
    public Description: string;
    public ID: number;
    public StatusCode: number;
    public SalaryTransactionID: number;
    public UpdatedBy: string;
    public _createguid: string;
    public SalaryTransaction: SalaryTransaction;
    public SalaryBalance: SalaryBalance;
    public CustomFields: any;
}


export class SalaryBalanceTemplate extends UniEntity {
    public static RelativeUrl = 'salarybalancetemplates';
    public static EntityType = 'SalaryBalanceTemplate';

    public SupplierID: number;
    public Instalment: number;
    public CreatedBy: string;
    public Account: number;
    public MinAmount: number;
    public WageTypeNumber: number;
    public Deleted: boolean;
    public InstalmentPercent: number;
    public UpdatedAt: Date;
    public MaxAmount: number;
    public CreatedAt: Date;
    public ID: number;
    public CreatePayment: boolean;
    public StatusCode: number;
    public SalarytransactionDescription: string;
    public KID: string;
    public InstalmentType: SalBalType;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public Supplier: Supplier;
    public SalaryBalances: Array<SalaryBalance>;
    public CustomFields: any;
}


export class SalaryTransaction extends UniEntity {
    public static RelativeUrl = 'salarytrans';
    public static EntityType = 'SalaryTransaction';

    public WageTypeID: number;
    public SalaryBalanceID: number;
    public recurringPostValidTo: Date;
    public CreatedBy: string;
    public Account: number;
    public DimensionsID: number;
    public WageTypeNumber: number;
    public Sum: number;
    public SystemType: StdSystemType;
    public IsRecurringPost: boolean;
    public EmploymentID: number;
    public Deleted: boolean;
    public FromDate: Date;
    public TaxbasisID: number;
    public EmployeeNumber: number;
    public recurringPostValidFrom: Date;
    public Text: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Amount: number;
    public ID: number;
    public MunicipalityNo: string;
    public StatusCode: number;
    public ToDate: Date;
    public calcAGA: number;
    public HolidayPayDeduction: boolean;
    public EmployeeID: number;
    public UpdatedBy: string;
    public VatTypeID: number;
    public RecurringID: number;
    public PayrollRunID: number;
    public Rate: number;
    public ChildSalaryTransactionID: number;
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

    public ValueString: string;
    public ValueDate: Date;
    public CreatedBy: string;
    public ValueMoney: number;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public WageTypeSupplementID: number;
    public CreatedAt: Date;
    public ID: number;
    public ValueBool: boolean;
    public StatusCode: number;
    public ValueDate2: Date;
    public SalaryTransactionID: number;
    public UpdatedBy: string;
    public _createguid: string;
    public WageTypeSupplement: WageTypeSupplement;
    public CustomFields: any;
}


export class SalaryYear extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'SalaryYear';

    public CreatedBy: string;
    public CurrentYear: number;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public ID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class SubEntity extends UniEntity {
    public static RelativeUrl = 'subentities';
    public static EntityType = 'SubEntity';

    public CreatedBy: string;
    public BusinessRelationID: number;
    public SuperiorOrganizationID: number;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public ID: number;
    public MunicipalityNo: string;
    public AgaRule: number;
    public StatusCode: number;
    public AgaZone: number;
    public UpdatedBy: string;
    public freeAmount: number;
    public OrgNumber: string;
    public _createguid: string;
    public BusinessRelationInfo: BusinessRelation;
    public SuperiorOrganization: SubEntity;
    public CustomFields: any;
}


export class TaxBasis extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'TaxBasis';

    public CreatedBy: string;
    public JanMayenBasis: number;
    public DisabilityOtherBasis: number;
    public SvalbardBasis: number;
    public SailorBasis: number;
    public PensionSourcetaxBasis: number;
    public Deleted: boolean;
    public PensionBasis: number;
    public UpdatedAt: Date;
    public ForeignBorderCommuterBasis: number;
    public CreatedAt: Date;
    public ID: number;
    public StatusCode: number;
    public Basis: number;
    public SalaryTransactionID: number;
    public UpdatedBy: string;
    public ForeignCitizenInsuranceBasis: number;
    public _createguid: string;
    public CustomFields: any;
}


export class Travel extends UniEntity {
    public static RelativeUrl = 'travels';
    public static EntityType = 'Travel';

    public SupplierID: number;
    public Purpose: string;
    public CreatedBy: string;
    public State: state;
    public DimensionsID: number;
    public Email: string;
    public Deleted: boolean;
    public EmployeeNumber: number;
    public UpdatedAt: Date;
    public PersonID: string;
    public CreatedAt: Date;
    public Description: string;
    public TravelIdentificator: string;
    public ID: number;
    public Phone: string;
    public StatusCode: number;
    public Comment: string;
    public SourceSystem: string;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public AdvanceAmount: number;
    public TravelLines: Array<TravelLine>;
    public Dimensions: Dimensions;
    public CustomFields: any;
}


export class TravelLine extends UniEntity {
    public static RelativeUrl = 'travellines';
    public static EntityType = 'TravelLine';

    public CreatedBy: string;
    public DimensionsID: number;
    public CostType: costtype;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Amount: number;
    public Description: string;
    public AccountNumber: number;
    public TravelIdentificator: string;
    public TypeID: number;
    public ID: number;
    public StatusCode: number;
    public From: Date;
    public LineState: linestate;
    public TravelID: number;
    public UpdatedBy: string;
    public VatTypeID: number;
    public To: Date;
    public paytransID: number;
    public InvoiceAccount: number;
    public Rate: number;
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

    public CreatedBy: string;
    public ForeignDescription: string;
    public WageTypeNumber: number;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Description: string;
    public ID: number;
    public StatusCode: number;
    public ForeignTypeID: string;
    public UpdatedBy: string;
    public InvoiceAccount: number;
    public _createguid: string;
    public CustomFields: any;
}


export class VacationPayLine extends UniEntity {
    public static RelativeUrl = 'VacationPayLines';
    public static EntityType = 'VacationPayLine';

    public CreatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public ManualVacationPayBase: number;
    public CreatedAt: Date;
    public Year: number;
    public ID: number;
    public StatusCode: number;
    public EmployeeID: number;
    public UpdatedBy: string;
    public Withdrawal: number;
    public VacationPay60: number;
    public PaidVacationPay: number;
    public _createguid: string;
    public VacationPay: number;
    public MissingEarlierVacationPay: number;
    public PaidTaxFreeVacationPay: number;
    public Rate60: number;
    public Age: number;
    public SystemVacationPayBase: number;
    public Rate: number;
    public Employee: Employee;
    public CustomFields: any;
}


export class VacationRateEmployee extends UniEntity {
    public static RelativeUrl = 'employeevacationrates';
    public static EntityType = 'VacationRateEmployee';

    public CreatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public ID: number;
    public Rate60: number;
    public StatusCode: number;
    public StartDate: Date;
    public EmployeeID: number;
    public UpdatedBy: string;
    public EndDate: Date;
    public Rate: number;
    public _createguid: string;
    public CustomFields: any;
}


export class WageType extends UniEntity {
    public static RelativeUrl = 'wagetypes';
    public static EntityType = 'WageType';

    public CreatedBy: string;
    public SpecialTaxAndContributionsRule: SpecialTaxAndContributionsRule;
    public HideFromPaycheck: boolean;
    public Limit_type: LimitType;
    public SpecialTaxHandling: string;
    public StandardWageTypeFor: StdWageType;
    public Base_EmploymentTax: boolean;
    public WageTypeNumber: number;
    public GetRateFrom: GetRateFrom;
    public Systemtype: string;
    public SystemRequiredWageType: number;
    public Postnr: string;
    public Deleted: boolean;
    public DaysOnBoard: boolean;
    public IncomeType: string;
    public WageTypeName: string;
    public Base_div3: boolean;
    public Benefit: string;
    public ValidYear: number;
    public UpdatedAt: Date;
    public Base_Vacation: boolean;
    public Base_div2: boolean;
    public CreatedAt: Date;
    public SpecialAgaRule: SpecialAgaRule;
    public RateFactor: number;
    public Description: string;
    public AccountNumber: number;
    public taxtype: TaxType;
    public ID: number;
    public Limit_value: number;
    public AccountNumber_balance: number;
    public StatusCode: number;
    public FixedSalaryHolidayDeduction: boolean;
    public Limit_WageTypeNumber: number;
    public Base_Payment: boolean;
    public SupplementPackage: string;
    public RatetypeColumn: RateTypeColumn;
    public NoNumberOfHours: boolean;
    public UpdatedBy: string;
    public Limit_newRate: number;
    public Rate: number;
    public _createguid: string;
    public SupplementaryInformations: Array<WageTypeSupplement>;
    public CustomFields: any;
}


export class WageTypeSupplement extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'WageTypeSupplement';

    public WageTypeID: number;
    public CreatedBy: string;
    public ValueType: Valuetype;
    public SuggestedValue: string;
    public Deleted: boolean;
    public GetValueFromTrans: boolean;
    public UpdatedAt: Date;
    public ameldingType: string;
    public CreatedAt: Date;
    public Description: string;
    public ID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class WageTypeTranslation extends UniEntity {
    public static RelativeUrl = 'wagetypetranslations';
    public static EntityType = 'WageTypeTranslation';

    public CreatedBy: string;
    public WageTypeNumber: number;
    public Deleted: boolean;
    public WageTypeName: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public ID: number;
    public StatusCode: number;
    public EmployeeLanguageID: number;
    public UpdatedBy: string;
    public _createguid: string;
    public EmployeeLanguage: EmployeeLanguage;
    public CustomFields: any;
}


export class EmployeeLanguage extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'EmployeeLanguage';

    public CreatedBy: string;
    public LanguageCode: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public ID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class ComponentLayout extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ComponentLayout';

    public CreatedBy: string;
    public BaseEntity: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public ID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public Fields: Array<FieldLayout>;
    public CustomFields: any;
}


export class FieldLayout extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'FieldLayout';

    public Placeholder: string;
    public CreatedBy: string;
    public Placement: number;
    public LookupField: boolean;
    public ReadOnly: boolean;
    public Sectionheader: string;
    public ComponentLayoutID: number;
    public Section: number;
    public Options: string;
    public Legend: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public Combo: number;
    public Hidden: boolean;
    public CreatedAt: Date;
    public EntityType: string;
    public Description: string;
    public ID: number;
    public Width: string;
    public FieldType: FieldType;
    public DisplayField: string;
    public Label: string;
    public LineBreak: boolean;
    public StatusCode: number;
    public UpdatedBy: string;
    public Alignment: Alignment;
    public HelpText: string;
    public FieldSet: number;
    public Property: string;
    public _createguid: string;
    public CustomFields: any;
}


export class CurrencyOverride extends UniEntity {
    public static RelativeUrl = 'currencyoverrides';
    public static EntityType = 'CurrencyOverride';

    public Source: CurrencySourceEnum;
    public CreatedBy: string;
    public ToCurrencyCodeID: number;
    public Deleted: boolean;
    public FromDate: LocalDate;
    public UpdatedAt: Date;
    public Factor: number;
    public CreatedAt: Date;
    public ID: number;
    public FromCurrencyCodeID: number;
    public ToDate: LocalDate;
    public ExchangeRate: number;
    public UpdatedBy: string;
    public _createguid: string;
    public FromCurrencyCode: CurrencyCode;
    public ToCurrencyCode: CurrencyCode;
    public CustomFields: any;
}


export class AccountAssetGroup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AccountAssetGroup';

    public CreatedBy: string;
    public FromAccountNumber: number;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public ToAccountNumber: number;
    public CreatedAt: Date;
    public ID: number;
    public AssetGroupCode: string;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class AccountGroupSetup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AccountGroupSetup';

    public CreatedBy: string;
    public ExternalReference: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public ID: number;
    public ParentID: number;
    public UpdatedBy: string;
    public Name: string;
    public PlanType: PlanTypeEnum;
    public _createguid: string;
    public Parent: AccountGroupSetup;
    public CustomFields: any;
}


export class AccountSetup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AccountSetup';

    public ExpectedDebitBalance: boolean;
    public CreatedBy: string;
    public SaftMappingAccountID: number;
    public Deleted: boolean;
    public AccountName: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public AccountNumber: number;
    public ID: number;
    public AccountGroupSetupID: number;
    public UpdatedBy: string;
    public Visible: boolean;
    public VatCode: string;
    public PlanType: PlanTypeEnum;
    public _createguid: string;
    public AccountGroup: AccountGroupSetup;
    public SaftMappingAccount: SaftMappingAccount;
    public CustomFields: any;
}


export class AccountVisibilityGroup extends UniEntity {
    public static RelativeUrl = 'accountvisibilitygroups';
    public static EntityType = 'AccountVisibilityGroup';

    public CreatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public ID: number;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public Accounts: Array<AccountVisibilityGroupAccount>;
    public CompanyTypes: Array<CompanyType>;
    public CustomFields: any;
}


export class AccountVisibilityGroupAccount extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AccountVisibilityGroupAccount';

    public CreatedBy: string;
    public AccountVisibilityGroupID: number;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public AccountSetupID: number;
    public CreatedAt: Date;
    public ID: number;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class AGARate extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AGARate';

    public CreatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public ID: number;
    public RateValidFrom: Date;
    public ZoneID: number;
    public UpdatedBy: string;
    public Rate: number;
    public _createguid: string;
    public sector: Array<AGASector>;
    public CustomFields: any;
}


export class AGASector extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AGASector';

    public CreatedBy: string;
    public SectorID: number;
    public ValidFrom: Date;
    public Deleted: boolean;
    public Sector: string;
    public UpdatedAt: Date;
    public RateID: number;
    public CreatedAt: Date;
    public ID: number;
    public UpdatedBy: string;
    public freeAmount: number;
    public Rate: number;
    public _createguid: string;
    public CustomFields: any;
}


export class AGAZone extends UniEntity {
    public static RelativeUrl = 'AGAZones';
    public static EntityType = 'AGAZone';

    public CreatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public ZoneName: string;
    public ID: number;
    public UpdatedBy: string;
    public _createguid: string;
    public rates: Array<AGARate>;
    public municipalsOnZone: Array<MunicipalAGAZone>;
    public CustomFields: any;
}


export class Agreement extends UniEntity {
    public static RelativeUrl = 'agreements';
    public static EntityType = 'Agreement';

    public Template: string;
    public CreatedBy: string;
    public ValidFrom: Date;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public ID: number;
    public UpdatedBy: string;
    public AppliesTo: number;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class AssetGroup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AssetGroup';

    public Code: string;
    public DepreciationYears: number;
    public CreatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public DepreciationRate: number;
    public DepreciationAccountNumber: number;
    public CreatedAt: Date;
    public ID: number;
    public ToDate: Date;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class BankIdentifierCode extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'BankIdentifierCode';

    public CreatedBy: string;
    public Deleted: boolean;
    public BankIdentifier: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public ID: number;
    public BankName: string;
    public UpdatedBy: string;
    public Bic: string;
    public _createguid: string;
    public CustomFields: any;
}


export class CompanyType extends UniEntity {
    public static RelativeUrl = 'companytypes';
    public static EntityType = 'CompanyType';

    public CreatedBy: string;
    public DefaultPlanType: PlanTypeEnum;
    public Deleted: boolean;
    public FullName: string;
    public UpdatedAt: Date;
    public DefaultAccountVisibilityGroupID: number;
    public CreatedAt: Date;
    public Priority: boolean;
    public Description: string;
    public ID: number;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Confirmation extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Confirmation';

    public Code: string;
    public CreatedBy: string;
    public CompanyName: string;
    public ExpirationDate: Date;
    public Email: string;
    public ContractType: string;
    public Deleted: boolean;
    public DisplayName: string;
    public UpdatedAt: Date;
    public SignUpReferrer: string;
    public CreatedAt: Date;
    public ID: number;
    public Phone: string;
    public StatusCode: number;
    public PostalCode: string;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Country extends UniEntity {
    public static RelativeUrl = 'countries';
    public static EntityType = 'Country';

    public CreatedBy: string;
    public CountryCode: string;
    public Deleted: boolean;
    public CurrencyRateSource: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public ID: number;
    public DefaultCurrencyCode: string;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Currency extends UniEntity {
    public static RelativeUrl = 'currencies';
    public static EntityType = 'Currency';

    public CurrencyDate: LocalDate;
    public Source: CurrencySourceEnum;
    public CreatedBy: string;
    public ToCurrencyCodeID: number;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public Factor: number;
    public CreatedAt: Date;
    public ID: number;
    public FromCurrencyCodeID: number;
    public ExchangeRate: number;
    public UpdatedBy: string;
    public _createguid: string;
    public FromCurrencyCode: CurrencyCode;
    public ToCurrencyCode: CurrencyCode;
    public CustomFields: any;
}


export class CurrencyCode extends UniEntity {
    public static RelativeUrl = 'currencycodes';
    public static EntityType = 'CurrencyCode';

    public Code: string;
    public CreatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Description: string;
    public ID: number;
    public ShortCode: string;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class DebtCollectionAutomation extends UniEntity {
    public static RelativeUrl = 'debtcollectionautomation';
    public static EntityType = 'DebtCollectionAutomation';

    public CreatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public DebtCollectionSettingsID: number;
    public CreatedAt: Date;
    public Description: string;
    public ID: number;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public DebtCollectionSettings: DebtCollectionSettings;
    public CustomFields: any;
}


export class EmploymentValidValues extends UniEntity {
    public static RelativeUrl = 'employmentvalidvalues';
    public static EntityType = 'EmploymentValidValues';

    public CreatedBy: string;
    public HoursPerWeek: boolean;
    public JobCode: boolean;
    public ShipType: boolean;
    public Deleted: boolean;
    public typeOfEmployment: boolean;
    public ShipReg: boolean;
    public UpdatedAt: Date;
    public SeniorityDate: boolean;
    public LastWorkPercentChange: boolean;
    public JobName: boolean;
    public CreatedAt: Date;
    public HourRate: boolean;
    public ID: number;
    public WorkPercent: boolean;
    public LastSalaryChangeDate: boolean;
    public StartDate: boolean;
    public MonthRate: boolean;
    public WorkingHoursScheme: boolean;
    public RemunerationType: boolean;
    public employment: TypeOfEmployment;
    public UserDefinedRate: boolean;
    public TradeArea: boolean;
    public UpdatedBy: string;
    public EndDate: boolean;
    public PaymentType: RemunerationType;
    public _createguid: string;
    public CustomFields: any;
}


export class FinancialDeadline extends UniEntity {
    public static RelativeUrl = 'deadlines';
    public static EntityType = 'FinancialDeadline';

    public PassableDueDate: number;
    public CreatedBy: string;
    public Deadline: LocalDate;
    public AdditionalInfo: string;
    public Type: FinancialDeadlineType;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public ID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class LanguageCode extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'LanguageCode';

    public Code: string;
    public CreatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public ID: number;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Municipal extends UniEntity {
    public static RelativeUrl = 'Municipals';
    public static EntityType = 'Municipal';

    public CreatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public CountyNo: string;
    public CountyName: string;
    public CreatedAt: Date;
    public ID: number;
    public MunicipalityNo: string;
    public Retired: boolean;
    public MunicipalityName: string;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class MunicipalAGAZone extends UniEntity {
    public static RelativeUrl = 'MunicipalAGAZones';
    public static EntityType = 'MunicipalAGAZone';

    public CreatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public ID: number;
    public MunicipalityNo: string;
    public Startdate: Date;
    public ZoneID: number;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class PaymentBatchType extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'PaymentBatchType';

    public Code: number;
    public CreatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Description: string;
    public ID: number;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class PaymentCode extends UniEntity {
    public static RelativeUrl = 'paymentCodes';
    public static EntityType = 'PaymentCode';

    public Code: number;
    public CreatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Description: string;
    public PaymentGroup: string;
    public ID: number;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class PostalCode extends UniEntity {
    public static RelativeUrl = 'postalcodes';
    public static EntityType = 'PostalCode';

    public Code: string;
    public CreatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public ID: number;
    public StatusCode: number;
    public City: string;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class SaftMappingAccount extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'SaftMappingAccount';

    public CreatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Description: string;
    public ID: number;
    public AccountID: string;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class StaticRegister extends UniEntity {
    public static RelativeUrl = 'StaticRegister';
    public static EntityType = 'StaticRegister';

    public CreatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public ID: number;
    public UpdatedBy: string;
    public Registry: string;
    public stamp: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class STYRKCode extends UniEntity {
    public static RelativeUrl = 'STYRK';
    public static EntityType = 'STYRKCode';

    public styrk: string;
    public CreatedBy: string;
    public Deleted: boolean;
    public ynr: number;
    public UpdatedAt: Date;
    public tittel: string;
    public CreatedAt: Date;
    public ID: number;
    public UpdatedBy: string;
    public lnr: number;
    public _createguid: string;
    public CustomFields: any;
}


export class Language extends UniEntity {
    public static RelativeUrl = 'languages';
    public static EntityType = 'Language';

    public Code: string;
    public CreatedBy: string;
    public FallBackLanguageID: number;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public ID: number;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public Translations: Array<Translation>;
    public CustomFields: any;
}


export class Translatable extends UniEntity {
    public static RelativeUrl = 'translatables';
    public static EntityType = 'Translatable';

    public Static: boolean;
    public CreatedBy: string;
    public Column: string;
    public Model: string;
    public Meaning: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Description: string;
    public Value: string;
    public Module: i18nModule;
    public ID: number;
    public UpdatedBy: string;
    public _createguid: string;
    public Translations: Array<Translation>;
    public CustomFields: any;
}


export class Translation extends UniEntity {
    public static RelativeUrl = 'translations';
    public static EntityType = 'Translation';

    public LanguageID: number;
    public CreatedBy: string;
    public Deleted: boolean;
    public TranslatableID: number;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Value: string;
    public ID: number;
    public UpdatedBy: string;
    public _createguid: string;
    public Language: Language;
    public Translatable: Translatable;
    public CustomFields: any;
}


export class VatCodeGroupSetup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'VatCodeGroupSetup';

    public CreatedBy: string;
    public Deleted: boolean;
    public No: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public ID: number;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class VatPostSetup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'VatPostSetup';

    public ReportAsNegativeAmount: boolean;
    public CreatedBy: string;
    public Deleted: boolean;
    public No: string;
    public UpdatedAt: Date;
    public VatCodeGroupSetupNo: string;
    public CreatedAt: Date;
    public ID: number;
    public HasTaxAmount: boolean;
    public HasTaxBasis: boolean;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class VatReportForm extends UniEntity {
    public static RelativeUrl = 'vatreportforms';
    public static EntityType = 'VatReportForm';

    public CreatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Description: string;
    public ID: number;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class VatReportReferenceSetup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'VatReportReferenceSetup';

    public CreatedBy: string;
    public VatPostNo: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public AccountNumber: number;
    public ID: number;
    public UpdatedBy: string;
    public VatCode: string;
    public _createguid: string;
    public CustomFields: any;
}


export class VatTypeSetup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'VatTypeSetup';

    public OutgoingAccountNumber: number;
    public CreatedBy: string;
    public DirectJournalEntryOnly: boolean;
    public VatCodeGroupNo: string;
    public Deleted: boolean;
    public OutputVat: boolean;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public ID: number;
    public IncomingAccountNumber: number;
    public DefaultVisible: boolean;
    public UpdatedBy: string;
    public IsNotVatRegistered: boolean;
    public VatCode: string;
    public ReversedTaxDutyVat: boolean;
    public IsCompensated: boolean;
    public Name: string;
    public _createguid: string;
    public VatTypeSetupPercentages: Array<VatTypeSetupPercentage>;
    public CustomFields: any;
}


export class VatTypeSetupPercentage extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'VatTypeSetupPercentage';

    public VatTypeSetupID: number;
    public CreatedBy: string;
    public ValidFrom: LocalDate;
    public VatPercent: number;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public ID: number;
    public ValidTo: LocalDate;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class CompanyReport extends UniEntity {
    public static RelativeUrl = 'company-report';
    public static EntityType = 'CompanyReport';

    public CreatedBy: string;
    public ReportDefinitionID: number;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public CompanyKey: string;
    public CreatedAt: Date;
    public ID: number;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class ReportDefinition extends UniEntity {
    public static RelativeUrl = 'report-definitions';
    public static EntityType = 'ReportDefinition';

    public CreatedBy: string;
    public TemplateLinkId: string;
    public ReportType: number;
    public CategoryLabel: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Description: string;
    public ID: number;
    public Version: string;
    public ReportSource: string;
    public IsStandard: boolean;
    public Md5: string;
    public UpdatedBy: string;
    public Visible: boolean;
    public Category: string;
    public UniqueReportID: string;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class ReportDefinitionDataSource extends UniEntity {
    public static RelativeUrl = 'report-definition-data-sources';
    public static EntityType = 'ReportDefinitionDataSource';

    public CreatedBy: string;
    public ReportDefinitionId: number;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public DataSourceUrl: string;
    public CreatedAt: Date;
    public ID: number;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class ReportDefinitionParameter extends UniEntity {
    public static RelativeUrl = 'report-definition-parameters';
    public static EntityType = 'ReportDefinitionParameter';

    public DefaultValueSource: string;
    public CreatedBy: string;
    public Type: string;
    public ReportDefinitionId: number;
    public Deleted: boolean;
    public DefaultValueLookupType: string;
    public UpdatedAt: Date;
    public DefaultValueList: string;
    public CreatedAt: Date;
    public ID: number;
    public Label: string;
    public DefaultValue: string;
    public UpdatedBy: string;
    public Visible: boolean;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class PeriodSeries extends UniEntity {
    public static RelativeUrl = 'period-series';
    public static EntityType = 'PeriodSeries';

    public CreatedBy: string;
    public Active: boolean;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public SeriesType: PeriodSeriesType;
    public CreatedAt: Date;
    public ID: number;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class PeriodTemplate extends UniEntity {
    public static RelativeUrl = 'period-templates';
    public static EntityType = 'PeriodTemplate';

    public CreatedBy: string;
    public PeriodSeriesID: number;
    public Deleted: boolean;
    public FromDate: LocalDate;
    public No: number;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public ID: number;
    public ToDate: LocalDate;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public PeriodSeries: PeriodSeries;
    public CustomFields: any;
}


export class Model extends UniEntity {
    public static RelativeUrl = 'models';
    public static EntityType = 'Model';

    public Shared: boolean;
    public CreatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Description: string;
    public LabelPlural: string;
    public ID: number;
    public Label: string;
    public UpdatedBy: string;
    public Admin: boolean;
    public Name: string;
    public _createguid: string;
    public Fields: Array<Field>;
    public CustomFields: any;
}


export class Field extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Field';

    public ModelID: number;
    public CreatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Description: string;
    public ID: number;
    public Label: string;
    public UpdatedBy: string;
    public HelpText: string;
    public Name: string;
    public _createguid: string;
    public Model: Model;
    public CustomFields: any;
}


export class Notification extends UniEntity {
    public static RelativeUrl = 'notifications';
    public static EntityType = 'Notification';

    public SenderDisplayName: string;
    public CreatedBy: string;
    public CompanyName: string;
    public Message: string;
    public SourceEntityID: number;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public RecipientID: string;
    public CompanyKey: string;
    public CreatedAt: Date;
    public EntityType: string;
    public ID: number;
    public StatusCode: number;
    public EntityID: number;
    public SourceEntityType: string;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class CompanySettings extends UniEntity {
    public static RelativeUrl = 'companysettings';
    public static EntityType = 'CompanySettings';
    public UseFinancialDateToCalculateVatPercent: boolean;  
    public ShowKIDOnCustomerInvoice: boolean;
    public UseXtraPaymentOrgXmlTag: boolean;
    public CustomerInvoiceReminderSettingsID: number;
    public LogoFileID: number;
    public HideInActiveSuppliers: boolean;
    public InterrimRemitAccountID: number;
    public TaxMandatory: boolean;
    public CreatedBy: string;
    public CompanyName: string;
    public ForceSupplierInvoiceApproval: boolean;
    public TaxMandatoryType: number;
    public FactoringNumber: number;
    public VatReportFormID: number;
    public DefaultSalesAccountID: number;
    public TaxBankAccountID: number;
    public GLN: string;
    public CustomerAccountID: number;
    public PeriodSeriesAccountID: number;
    public DefaultDistributionsID: number;
    public PaymentBankAgreementNumber: string;
    public HasAutobank: boolean;
    public OrganizationNumber: string;
    public BookCustomerInvoiceOnDeliveryDate: boolean;
    public SaveCustomersFromQuoteAsLead: boolean;
    public AccountVisibilityGroupID: number;
    public DefaultCustomerInvoiceReminderReportID: number;
    public RoundingNumberOfDecimals: number;
    public DefaultCustomerOrderReportID: number;
    public WebAddress: string;
    public AgioLossAccountID: number;
    public Deleted: boolean;
    public FactoringEmailID: number;
    public APIncludeAttachment: boolean;
    public UpdatedAt: Date;
    public SalaryBankAccountID: number;
    public OfficeMunicipalityNo: string;
    public IgnorePaymentsWithoutEndToEndID: boolean;
    public UseAssetRegister: boolean;
    public AccountingLockedDate: LocalDate;
    public CreatedAt: Date;
    public TaxableFromLimit: number;
    public ID: number;
    public XtraPaymentOrgXmlTagValue: string;
    public AutoJournalPayment: boolean;
    public DefaultEmailID: number;
    public PeriodSeriesVatID: number;
    public APActivated: boolean;
    public ShowNumberOfDecimals: number;
    public NetsIntegrationActivated: boolean;
    public AccountGroupSetID: number;
    public StatusCode: number;
    public UseNetsIntegration: boolean;
    public CompanyBankAccountID: number;
    public APContactID: number;
    public Localization: string;
    public LogoAlign: number;
    public CompanyTypeID: number;
    public AgioGainAccountID: number;
    public TaxableFromDate: LocalDate;
    public TwoStageAutobankEnabled: boolean;
    public APGuid: string;
    public BatchInvoiceMinAmount: number;
    public HideInActiveCustomers: boolean;
    public AcceptableDelta4CustomerPaymentAccountID: number;
    public SettlementVatAccountID: number;
    public Factoring: number;
    public RoundingType: RoundingType;
    public SupplierAccountID: number;
    public DefaultAddressID: number;
    public AutoDistributeInvoice: boolean;
    public InterrimPaymentAccountID: number;
    public VatLockedDate: LocalDate;
    public LogoHideField: number;
    public UpdatedBy: string;
    public DefaultCustomerQuoteReportID: number;
    public BaseCurrencyCodeID: number;
    public BankChargeAccountID: number;
    public StoreDistributedInvoice: boolean;
    public CompanyRegistered: boolean;
    public AllowAvtalegiroRegularInvoice: boolean;
    public UsePaymentBankValues: boolean;
    public DefaultPhoneID: number;
    public DefaultTOFCurrencySettingsID: number;
    public PaymentBankIdentification: string;
    public UseOcrInterpretation: boolean;
    public CustomerCreditDays: number;
    public SAFTimportAccountID: number;
    public DefaultCustomerInvoiceReportID: number;
    public AcceptableDelta4CustomerPayment: number;
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

    public CreatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public EntityType: string;
    public ID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public Elements: Array<DistributionPlanElement>;
    public CustomFields: any;
}


export class DistributionPlanElement extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'DistributionPlanElement';

    public CreatedBy: string;
    public DistributionPlanElementTypeID: number;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Priority: number;
    public DistributionPlanID: number;
    public ID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public _createguid: string;
    public ElementType: DistributionPlanElementType;
    public CustomFields: any;
}


export class DistributionPlanElementType extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'DistributionPlanElementType';

    public CreatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public ID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public LegalEntities: Array<DistributionPlanElementTypeLegalEntity>;
    public CustomFields: any;
}


export class DistributionPlanElementTypeLegalEntity extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'DistributionPlanElementTypeLegalEntity';

    public CreatedBy: string;
    public DistributionPlanElementTypeID: number;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public EntityType: string;
    public ID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Distributions extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Distributions';

    public CustomerInvoiceDistributionPlanID: number;
    public CreatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public ID: number;
    public CustomerOrderDistributionPlanID: number;
    public StatusCode: number;
    public AnnualStatementDistributionPlanID: number;
    public CustomerInvoiceReminderDistributionPlanID: number;
    public CustomerQuoteDistributionPlanID: number;
    public UpdatedBy: string;
    public PayCheckDistributionPlanID: number;
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

    public CreatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public ID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class EmailLog extends UniEntity {
    public static RelativeUrl = 'emails';
    public static EntityType = 'EmailLog';

    public JobRunID: number;
    public CreatedBy: string;
    public Type: SharingType;
    public Subject: string;
    public ExternalReference: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public EntityType: string;
    public ID: number;
    public DistributeAt: LocalDate;
    public StatusCode: number;
    public JobRunExternalRef: string;
    public EntityDisplayValue: string;
    public EntityID: number;
    public From: string;
    public UpdatedBy: string;
    public ExternalMessage: string;
    public To: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Eventplan extends UniEntity {
    public static RelativeUrl = 'eventplans';
    public static EntityType = 'Eventplan';

    public Cargo: string;
    public ModelFilter: string;
    public CreatedBy: string;
    public IsSystemPlan: boolean;
    public OperationFilter: string;
    public JobNames: string;
    public Active: boolean;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public ID: number;
    public StatusCode: number;
    public ExpressionFilter: string;
    public UpdatedBy: string;
    public Name: string;
    public PlanType: EventplanType;
    public _createguid: string;
    public Subscribers: Array<EventSubscriber>;
    public CustomFields: any;
}


export class EventSubscriber extends UniEntity {
    public static RelativeUrl = 'eventsubscribers';
    public static EntityType = 'EventSubscriber';

    public CreatedBy: string;
    public EventplanID: number;
    public Active: boolean;
    public Deleted: boolean;
    public Authorization: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public ID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public Endpoint: string;
    public Headers: string;
    public Name: string;
    public _createguid: string;
    public Eventplan: Eventplan;
    public CustomFields: any;
}


export class Period extends UniEntity {
    public static RelativeUrl = 'periodes';
    public static EntityType = 'Period';

    public CreatedBy: string;
    public PeriodSeriesID: number;
    public Deleted: boolean;
    public FromDate: LocalDate;
    public AccountYear: number;
    public No: number;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public ID: number;
    public StatusCode: number;
    public ToDate: LocalDate;
    public UpdatedBy: string;
    public PeriodTemplateID: number;
    public Name: string;
    public _createguid: string;
    public PeriodTemplate: PeriodTemplate;
    public PeriodSeries: PeriodSeries;
    public CustomFields: any;
}


export class PredefinedDescription extends UniEntity {
    public static RelativeUrl = 'predefineddescriptions';
    public static EntityType = 'PredefinedDescription';

    public Code: string;
    public CreatedBy: string;
    public Type: PredefinedDescriptionType;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Description: string;
    public ID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class ProductCategory extends UniEntity {
    public static RelativeUrl = 'productcategories';
    public static EntityType = 'ProductCategory';

    public Rght: number;
    public CreatedBy: string;
    public Deleted: boolean;
    public Lft: number;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Description: string;
    public ID: number;
    public StatusCode: number;
    public Comment: string;
    public ParentID: number;
    public Depth: number;
    public Status: number;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class ProductCategoryLink extends UniEntity {
    public static RelativeUrl = 'productcategorylinks';
    public static EntityType = 'ProductCategoryLink';

    public CreatedBy: string;
    public Deleted: boolean;
    public ProductCategoryID: number;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public ProductID: number;
    public ID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public _createguid: string;
    public ProductCategory: ProductCategory;
    public CustomFields: any;
}


export class Sharing extends UniEntity {
    public static RelativeUrl = 'sharings';
    public static EntityType = 'Sharing';

    public JobRunID: number;
    public CreatedBy: string;
    public Type: SharingType;
    public Subject: string;
    public ExternalReference: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public EntityType: string;
    public ID: number;
    public DistributeAt: LocalDate;
    public StatusCode: number;
    public JobRunExternalRef: string;
    public EntityDisplayValue: string;
    public EntityID: number;
    public From: string;
    public UpdatedBy: string;
    public ExternalMessage: string;
    public To: string;
    public _createguid: string;
    public CustomFields: any;
}


export class StatusLog extends UniEntity {
    public static RelativeUrl = 'statuslogs';
    public static EntityType = 'StatusLog';

    public CreatedBy: string;
    public ToStatus: number;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public EntityType: string;
    public ID: number;
    public EntityID: number;
    public UpdatedBy: string;
    public FromStatus: number;
    public _createguid: string;
    public CustomFields: any;
}


export class Tracelink extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Tracelink';

    public DestinationEntityName: string;
    public CreatedBy: string;
    public SourceEntityName: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public Date: Date;
    public CreatedAt: Date;
    public ID: number;
    public SourceInstanceID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public DestinationInstanceID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class User extends UniEntity {
    public static RelativeUrl = 'users';
    public static EntityType = 'User';

    public UserName: string;
    public CreatedBy: string;
    public HasAgreedToImportDisclaimer: boolean;
    public LastLogin: Date;
    public Email: string;
    public PhoneNumber: string;
    public IsAutobankAdmin: boolean;
    public BankIntegrationUserName: string;
    public Deleted: boolean;
    public DisplayName: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public ID: number;
    public StatusCode: number;
    public GlobalIdentity: string;
    public Protected: boolean;
    public UpdatedBy: string;
    public TwoFactorEnabled: boolean;
    public _createguid: string;
    public AuthPhoneNumber: string;
    public CustomFields: any;
}


export class UniQueryDefinition extends UniEntity {
    public static RelativeUrl = 'uniquerydefinitions';
    public static EntityType = 'UniQueryDefinition';

    public SystemGeneratedQuery: boolean;
    public Code: string;
    public CreatedBy: string;
    public SortIndex: number;
    public IsShared: boolean;
    public ClickUrl: string;
    public Deleted: boolean;
    public ModuleID: number;
    public ClickParam: string;
    public UpdatedAt: Date;
    public MainModelName: string;
    public CreatedAt: Date;
    public Description: string;
    public ID: number;
    public StatusCode: number;
    public UserID: number;
    public UpdatedBy: string;
    public Category: string;
    public Name: string;
    public _createguid: string;
    public UniQueryFilters: Array<UniQueryFilter>;
    public UniQueryFields: Array<UniQueryField>;
    public CustomFields: any;
}


export class UniQueryField extends UniEntity {
    public static RelativeUrl = 'uniqueryfields';
    public static EntityType = 'UniQueryField';

    public Field: string;
    public CreatedBy: string;
    public Index: number;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public Alias: string;
    public SumFunction: string;
    public CreatedAt: Date;
    public ID: number;
    public Width: string;
    public FieldType: number;
    public StatusCode: number;
    public UniQueryDefinitionID: number;
    public UpdatedBy: string;
    public Header: string;
    public Path: string;
    public _createguid: string;
    public CustomFields: any;
}


export class UniQueryFilter extends UniEntity {
    public static RelativeUrl = 'uniqueryfilters';
    public static EntityType = 'UniQueryFilter';

    public Field: string;
    public CreatedBy: string;
    public Operator: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Value: string;
    public ID: number;
    public StatusCode: number;
    public UniQueryDefinitionID: number;
    public UpdatedBy: string;
    public Group: number;
    public _createguid: string;
    public CustomFields: any;
}


export class Team extends UniEntity {
    public static RelativeUrl = 'teams';
    public static EntityType = 'Team';

    public Rght: number;
    public CreatedBy: string;
    public DimensionsID: number;
    public Deleted: boolean;
    public Lft: number;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public ID: number;
    public StatusCode: number;
    public ParentID: number;
    public Depth: number;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public Dimensions: Dimensions;
    public Positions: Array<TeamPosition>;
    public CustomFields: any;
}


export class TeamPosition extends UniEntity {
    public static RelativeUrl = 'teampositions';
    public static EntityType = 'TeamPosition';

    public CreatedBy: string;
    public Deleted: boolean;
    public FromDate: LocalDate;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public TeamID: number;
    public RelatedSharedRoleId: number;
    public ID: number;
    public Position: TeamPositionEnum;
    public StatusCode: number;
    public ToDate: LocalDate;
    public UserID: number;
    public ApproveOrder: number;
    public UpdatedBy: string;
    public _createguid: string;
    public Team: Team;
    public CustomFields: any;
}


export class ApprovalRule extends UniEntity {
    public static RelativeUrl = 'approvalrules';
    public static EntityType = 'ApprovalRule';

    public CreatedBy: string;
    public Deleted: boolean;
    public Keywords: string;
    public RuleType: ApprovalRuleType;
    public UpdatedAt: Date;
    public IndustryCodes: string;
    public CreatedAt: Date;
    public Description: string;
    public ID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public _createguid: string;
    public Steps: Array<ApprovalRuleStep>;
    public CustomFields: any;
}


export class ApprovalRuleStep extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ApprovalRuleStep';

    public CreatedBy: string;
    public Limit: number;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public ID: number;
    public StatusCode: number;
    public UserID: number;
    public StepNumber: number;
    public UpdatedBy: string;
    public ApprovalRuleID: number;
    public _createguid: string;
    public ApprovalRule: ApprovalRule;
    public User: User;
    public CustomFields: any;
}


export class ApprovalSubstitute extends UniEntity {
    public static RelativeUrl = 'approvalsubstitutes';
    public static EntityType = 'ApprovalSubstitute';

    public CreatedBy: string;
    public Deleted: boolean;
    public FromDate: LocalDate;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public SubstituteUserID: number;
    public ID: number;
    public StatusCode: number;
    public ToDate: LocalDate;
    public UserID: number;
    public UpdatedBy: string;
    public _createguid: string;
    public User: User;
    public SubstituteUser: User;
    public CustomFields: any;
}


export class TaskApprovalPlan extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'TaskApprovalPlan';

    public CreatedBy: string;
    public Limit: number;
    public TaskID: number;
    public ApprovalID: number;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Amount: number;
    public ID: number;
    public StatusCode: number;
    public Comment: string;
    public UserID: number;
    public StepNumber: number;
    public UpdatedBy: string;
    public ApprovalRuleID: number;
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

    public CreatedBy: string;
    public System: boolean;
    public StatusCategoryID: number;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public EntityType: string;
    public Description: string;
    public IsDepricated: boolean;
    public ID: number;
    public StatusCode: number;
    public Order: number;
    public UpdatedBy: string;
    public _createguid: string;
    public StatusCategory: StatusCategory;
    public CustomFields: any;
}


export class StatusCategory extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'StatusCategory';

    public CreatedBy: string;
    public StatusCategoryCode: StatusCategoryCode;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public ID: number;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class StatusRemark extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'StatusRemark';

    public CreatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public EntityType: string;
    public ID: number;
    public Remark: string;
    public StatusCode: number;
    public EntityID: number;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Transition extends UniEntity {
    public static RelativeUrl = 'transitions';
    public static EntityType = 'Transition';

    public CreatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public EntityType: string;
    public Controller: string;
    public ID: number;
    public MethodName: string;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class TransitionThreshold extends UniEntity {
    public static RelativeUrl = 'thresholds';
    public static EntityType = 'TransitionThreshold';

    public Disabled: boolean;
    public CreatedBy: string;
    public Operator: Operator;
    public Operation: OperationType;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public SharedRoleId: number;
    public CreatedAt: Date;
    public SharedRejectTransitionId: number;
    public Value: string;
    public PropertyName: string;
    public ID: number;
    public SharedApproveTransitionId: number;
    public UpdatedBy: string;
    public RejectStatusCode: number;
    public _createguid: string;
    public CustomFields: any;
}


export class TransitionThresholdApproval extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'TransitionThresholdApproval';

    public CreatedBy: string;
    public Operator: Operator;
    public ApprovalID: number;
    public Operation: OperationType;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public SharedRoleId: number;
    public CreatedAt: Date;
    public SharedRejectTransitionId: number;
    public Value: string;
    public PropertyName: string;
    public ID: number;
    public SharedApproveTransitionId: number;
    public UpdatedBy: string;
    public RejectStatusCode: number;
    public _createguid: string;
    public Approval: Approval;
    public CustomFields: any;
}


export class Approval extends UniEntity {
    public static RelativeUrl = 'approvals';
    public static EntityType = 'Approval';

    public CreatedBy: string;
    public TaskID: number;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public SharedRoleId: number;
    public CreatedAt: Date;
    public Amount: number;
    public ID: number;
    public StatusCode: number;
    public UserID: number;
    public UpdatedBy: string;
    public _createguid: string;
    public Task: Task;
    public Thresholds: Array<TransitionThresholdApproval>;
    public User: User;
    public CustomFields: any;
}


export class Task extends UniEntity {
    public static RelativeUrl = 'tasks';
    public static EntityType = 'Task';

    public ModelID: number;
    public CreatedBy: string;
    public Type: TaskType;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public Title: string;
    public SharedRoleId: number;
    public CreatedAt: Date;
    public SharedRejectTransitionId: number;
    public ID: number;
    public StatusCode: number;
    public EntityID: number;
    public UserID: number;
    public SharedApproveTransitionId: number;
    public UpdatedBy: string;
    public RejectStatusCode: number;
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

    public TransitionID: number;
    public CreatedBy: string;
    public FromStatusID: number;
    public Deleted: boolean;
    public ToStatusID: number;
    public ExpiresDate: Date;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public EntityType: string;
    public IsDepricated: boolean;
    public ID: number;
    public UpdatedBy: string;
    public _createguid: string;
    public FromStatus: Status;
    public ToStatus: Status;
    public Transition: Transition;
    public CustomFields: any;
}


export class Project extends UniEntity {
    public static RelativeUrl = 'projects';
    public static EntityType = 'Project';

    public Price: number;
    public CreatedBy: string;
    public ProjectCustomerID: number;
    public CostPrice: number;
    public DimensionsID: number;
    public ProjectNumber: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public ProjectNumberNumeric: number;
    public ProjectLeadName: string;
    public CreatedAt: Date;
    public Amount: number;
    public Description: string;
    public ID: number;
    public StatusCode: number;
    public StartDate: LocalDate;
    public PlannedEnddate: LocalDate;
    public UpdatedBy: string;
    public EndDate: LocalDate;
    public ProjectNumberSeriesID: number;
    public WorkPlaceAddressID: number;
    public Total: number;
    public PlannedStartdate: LocalDate;
    public Name: string;
    public IsUsed: boolean;
    public _createguid: string;
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

    public CreatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public ID: number;
    public ProjectID: number;
    public StatusCode: number;
    public UserID: number;
    public UpdatedBy: string;
    public Responsibility: string;
    public Name: string;
    public _createguid: string;
    public ProjectUser: User;
    public CustomFields: any;
}


export class ProjectResourceSchedule extends UniEntity {
    public static RelativeUrl = 'projects-schedules-resources';
    public static EntityType = 'ProjectResourceSchedule';

    public CreatedBy: string;
    public ProjectResourceID: number;
    public ProjectTaskScheduleID: number;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public ID: number;
    public ProjectTaskID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class ProjectTask extends UniEntity {
    public static RelativeUrl = 'projects-tasks';
    public static EntityType = 'ProjectTask';

    public Price: number;
    public CreatedBy: string;
    public CostPrice: number;
    public SuggestedNumber: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Amount: number;
    public Description: string;
    public ID: number;
    public ProjectID: number;
    public StatusCode: number;
    public StartDate: LocalDate;
    public UpdatedBy: string;
    public EndDate: LocalDate;
    public Number: string;
    public Total: number;
    public Name: string;
    public _createguid: string;
    public ProjectTaskSchedules: Array<ProjectTaskSchedule>;
    public ProjectTaskResources: Array<ProjectResourceSchedule>;
    public CustomFields: any;
}


export class ProjectTaskSchedule extends UniEntity {
    public static RelativeUrl = 'projects-tasks-schedules';
    public static EntityType = 'ProjectTaskSchedule';

    public CreatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public ID: number;
    public ProjectTaskID: number;
    public StatusCode: number;
    public StartDate: LocalDate;
    public UpdatedBy: string;
    public EndDate: LocalDate;
    public _createguid: string;
    public ScheduleResources: Array<ProjectResourceSchedule>;
    public CustomFields: any;
}


export class BarnepassProduct extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'BarnepassProduct';

    public CreatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public ProductID: number;
    public ID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public _createguid: string;
    public Product: Product;
    public CustomFields: any;
}


export class Product extends UniEntity {
    public static RelativeUrl = 'products';
    public static EntityType = 'Product';

    public VariansParentID: number;
    public CreatedBy: string;
    public DefaultProductCategoryID: number;
    public PriceIncVat: number;
    public CostPrice: number;
    public DimensionsID: number;
    public ImageFileID: number;
    public Type: ProductTypeEnum;
    public Deleted: boolean;
    public PartName: string;
    public UpdatedAt: Date;
    public AverageCost: number;
    public CreatedAt: Date;
    public Description: string;
    public ID: number;
    public CalculateGrossPriceBasedOnNetPrice: boolean;
    public PriceExVat: number;
    public StatusCode: number;
    public ListPrice: number;
    public AccountID: number;
    public UpdatedBy: string;
    public VatTypeID: number;
    public Name: string;
    public Unit: string;
    public _createguid: string;
    public VatType: VatType;
    public Account: Account;
    public ProductCategoryLinks: Array<ProductCategoryLink>;
    public Dimensions: Dimensions;
    public CustomFields: any;
}


export class NumberSeries extends UniEntity {
    public static RelativeUrl = 'number-series';
    public static EntityType = 'NumberSeries';

    public Disabled: boolean;
    public FromNumber: number;
    public CreatedBy: string;
    public System: boolean;
    public Deleted: boolean;
    public AccountYear: number;
    public DisplayName: string;
    public Empty: boolean;
    public MainAccountID: number;
    public UpdatedAt: Date;
    public IsDefaultForTask: boolean;
    public NumberSeriesTaskID: number;
    public CreatedAt: Date;
    public ToNumber: number;
    public ID: number;
    public StatusCode: number;
    public Comment: string;
    public UseNumbersFromNumberSeriesID: number;
    public UpdatedBy: string;
    public NextNumber: number;
    public NumberSeriesTypeID: number;
    public NumberLock: boolean;
    public Name: string;
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

    public CreatedBy: string;
    public NumberSerieTypeBID: number;
    public Deleted: boolean;
    public NumberSerieTypeAID: number;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public ID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public _createguid: string;
    public NumberSerieTypeA: NumberSeriesType;
    public NumberSerieTypeB: NumberSeriesType;
    public CustomFields: any;
}


export class NumberSeriesTask extends UniEntity {
    public static RelativeUrl = 'number-series-tasks';
    public static EntityType = 'NumberSeriesTask';

    public CreatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public EntityType: string;
    public ID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public NumberSeries: Array<NumberSeries>;
    public CustomFields: any;
}


export class NumberSeriesType extends UniEntity {
    public static RelativeUrl = 'number-series-types';
    public static EntityType = 'NumberSeriesType';

    public CreatedBy: string;
    public System: boolean;
    public Yearly: boolean;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public EntityField: string;
    public CreatedAt: Date;
    public EntityType: string;
    public ID: number;
    public StatusCode: number;
    public CanHaveSeveralActiveSeries: boolean;
    public UpdatedBy: string;
    public EntitySeriesIDField: string;
    public Name: string;
    public _createguid: string;
    public Series: Array<NumberSeries>;
    public CustomFields: any;
}


export class EncryptionInfo extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'EncryptionInfo';

    public CreatedBy: string;
    public type: Type;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public password: string;
    public CreatedAt: Date;
    public description: string;
    public ID: number;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class File extends UniEntity {
    public static RelativeUrl = 'files/{entitytype}/{entityid}';
    public static EntityType = 'File';

    public Pages: number;
    public CreatedBy: string;
    public OCRData: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public StorageReference: string;
    public Size: string;
    public CreatedAt: Date;
    public encryptionID: number;
    public Description: string;
    public ID: number;
    public ContentType: string;
    public PermaLink: string;
    public StatusCode: number;
    public Md5: string;
    public UpdatedBy: string;
    public Name: string;
    public UploadSlot: string;
    public _createguid: string;
    public FileTags: Array<FileTag>;
    public EntityLinks: Array<FileEntityLink>;
    public CustomFields: any;
}


export class FileTag extends UniEntity {
    public static RelativeUrl = 'filetags';
    public static EntityType = 'FileTag';

    public CreatedBy: string;
    public TagName: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public FileID: number;
    public ID: number;
    public Status: number;
    public UpdatedBy: string;
    public _createguid: string;
    public File: File;
    public CustomFields: any;
}


export class FileEntityLink extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'FileEntityLink';

    public CreatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public IsAttachment: boolean;
    public CreatedAt: Date;
    public EntityType: string;
    public FileID: number;
    public ID: number;
    public StatusCode: number;
    public EntityID: number;
    public UpdatedBy: string;
    public _createguid: string;
    public File: File;
    public CustomFields: any;
}


export class ElsaUsageLog extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ElsaUsageLog';

    public CreatedBy: string;
    public ExternalReference: string;
    public Deleted: boolean;
    public DateLogged: Date;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public ID: number;
    public UpdatedBy: string;
    public ProductType: string;
    public Quantity: number;
    public _createguid: string;
    public CustomFields: any;
}


export class AccessPointFormat extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AccessPointFormat';

    public CreatedBy: string;
    public OutgoingID: number;
    public IncommingID: number;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public ResourceName: string;
    public CreatedAt: Date;
    public ID: number;
    public Label: string;
    public StatusCode: number;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class EHFLog extends UniEntity {
    public static RelativeUrl = 'ehf';
    public static EntityType = 'EHFLog';

    public JobRunID: number;
    public CreatedBy: string;
    public Type: SharingType;
    public Subject: string;
    public ExternalReference: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public EntityType: string;
    public ID: number;
    public DistributeAt: LocalDate;
    public StatusCode: number;
    public JobRunExternalRef: string;
    public EntityDisplayValue: string;
    public EntityID: number;
    public From: string;
    public UpdatedBy: string;
    public ExternalMessage: string;
    public To: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Department extends UniEntity {
    public static RelativeUrl = 'departments';
    public static EntityType = 'Department';

    public CreatedBy: string;
    public DepartmentNumber: string;
    public Deleted: boolean;
    public DepartmentManagerName: string;
    public DepartmentNumberNumeric: number;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Description: string;
    public ID: number;
    public StatusCode: number;
    public DepartmentNumberSeriesID: number;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public DepartmentNumberSeries: NumberSeries;
    public CustomFields: any;
}


export class Dimension10 extends UniEntity {
    public static RelativeUrl = 'Dimension10';
    public static EntityType = 'Dimension10';

    public CreatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Description: string;
    public ID: number;
    public StatusCode: number;
    public NumberNumeric: number;
    public UpdatedBy: string;
    public Number: string;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Dimension5 extends UniEntity {
    public static RelativeUrl = 'Dimension5';
    public static EntityType = 'Dimension5';

    public CreatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Description: string;
    public ID: number;
    public StatusCode: number;
    public NumberNumeric: number;
    public UpdatedBy: string;
    public Number: string;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Dimension6 extends UniEntity {
    public static RelativeUrl = 'Dimension6';
    public static EntityType = 'Dimension6';

    public CreatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Description: string;
    public ID: number;
    public StatusCode: number;
    public NumberNumeric: number;
    public UpdatedBy: string;
    public Number: string;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Dimension7 extends UniEntity {
    public static RelativeUrl = 'Dimension7';
    public static EntityType = 'Dimension7';

    public CreatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Description: string;
    public ID: number;
    public StatusCode: number;
    public NumberNumeric: number;
    public UpdatedBy: string;
    public Number: string;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Dimension8 extends UniEntity {
    public static RelativeUrl = 'Dimension8';
    public static EntityType = 'Dimension8';

    public CreatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Description: string;
    public ID: number;
    public StatusCode: number;
    public NumberNumeric: number;
    public UpdatedBy: string;
    public Number: string;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Dimension9 extends UniEntity {
    public static RelativeUrl = 'Dimension9';
    public static EntityType = 'Dimension9';

    public CreatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Description: string;
    public ID: number;
    public StatusCode: number;
    public NumberNumeric: number;
    public UpdatedBy: string;
    public Number: string;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Dimensions extends UniEntity {
    public static RelativeUrl = 'dimensions';
    public static EntityType = 'Dimensions';

    public CreatedBy: string;
    public Dimension10ID: number;
    public ResponsibleID: number;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Dimension9ID: number;
    public Dimension8ID: number;
    public ID: number;
    public ProjectID: number;
    public Dimension7ID: number;
    public ProjectTaskID: number;
    public StatusCode: number;
    public Dimension6ID: number;
    public UpdatedBy: string;
    public RegionID: number;
    public Dimension5ID: number;
    public DepartmentID: number;
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
    public Dimension5Number: string;
    public DepartmentName: string;
    public RegionName: string;
    public Dimension7Name: string;
    public DimensionsID: number;
    public Dimension6Number: string;
    public DepartmentNumber: string;
    public Dimension8Name: string;
    public Dimension7Number: string;
    public ProjectTaskNumber: string;
    public Dimension9Name: string;
    public Dimension10Name: string;
    public Dimension5Name: string;
    public ProjectNumber: string;
    public ProjectName: string;
    public ResponsibleName: string;
    public Dimension6Name: string;
    public ID: number;
    public Dimension9Number: string;
    public RegionCode: string;
    public Dimension8Number: string;
    public Dimension10Number: string;
    public ProjectTaskName: string;
}


export class DimensionSettings extends UniEntity {
    public static RelativeUrl = 'dimensionsettings';
    public static EntityType = 'DimensionSettings';

    public IsActive: boolean;
    public CreatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public Dimension: number;
    public CreatedAt: Date;
    public ID: number;
    public Label: string;
    public StatusCode: number;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Region extends UniEntity {
    public static RelativeUrl = 'regions';
    public static EntityType = 'Region';

    public CreatedBy: string;
    public CountryCode: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Description: string;
    public ID: number;
    public StatusCode: number;
    public RegionCode: string;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Responsible extends UniEntity {
    public static RelativeUrl = 'responsibles';
    public static EntityType = 'Responsible';

    public CreatedBy: string;
    public NameOfResponsible: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Description: string;
    public ID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Contract extends UniEntity {
    public static RelativeUrl = 'contracts';
    public static EntityType = 'Contract';

    public HashTransactionAddress: string;
    public ContractCode: string;
    public CreatedBy: string;
    public TeamsUri: string;
    public Hash: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Description: string;
    public ID: number;
    public StatusCode: number;
    public Engine: ContractEngine;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public Parameters: Array<ContractParameter>;
    public Triggers: Array<ContractTrigger>;
    public RunLogs: Array<ContractRunLog>;
    public CustomFields: any;
}


export class ContractAddress extends UniEntity {
    public static RelativeUrl = 'contractaddresses';
    public static EntityType = 'ContractAddress';

    public CreatedBy: string;
    public AssetAddress: string;
    public Type: AddressType;
    public ContractAssetID: number;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public EntityType: string;
    public Amount: number;
    public ID: number;
    public StatusCode: number;
    public EntityID: number;
    public ContractID: number;
    public Address: string;
    public UpdatedBy: string;
    public _createguid: string;
    public Contract: Contract;
    public ContractAsset: ContractAsset;
    public CustomFields: any;
}


export class ContractAsset extends UniEntity {
    public static RelativeUrl = 'contractassets';
    public static EntityType = 'ContractAsset';

    public CreatedBy: string;
    public Type: AddressType;
    public SpenderAttested: boolean;
    public Deleted: boolean;
    public IsFixedDenominations: boolean;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public IsCosignedByDefiner: boolean;
    public IsTransferrable: boolean;
    public ID: number;
    public IsIssuedByDefinerOnly: boolean;
    public IsPrivate: boolean;
    public StatusCode: number;
    public Cap: number;
    public ContractID: number;
    public IsAutoDestroy: boolean;
    public UpdatedBy: string;
    public _createguid: string;
    public Contract: Contract;
    public CustomFields: any;
}


export class ContractDebugLog extends UniEntity {
    public static RelativeUrl = 'contractdebuglogs';
    public static EntityType = 'ContractDebugLog';

    public CreatedBy: string;
    public Message: string;
    public Type: ContractEventType;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public ContractRunLogID: number;
    public CreatedAt: Date;
    public ID: number;
    public StatusCode: number;
    public ContractID: number;
    public UpdatedBy: string;
    public _createguid: string;
    public Contract: Contract;
    public ContractRunLog: ContractRunLog;
    public CustomFields: any;
}


export class ContractParameter extends UniEntity {
    public static RelativeUrl = 'contractparameters';
    public static EntityType = 'ContractParameter';

    public CreatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Value: string;
    public ID: number;
    public StatusCode: number;
    public ContractID: number;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public Contract: Contract;
    public CustomFields: any;
}


export class ContractRunLog extends UniEntity {
    public static RelativeUrl = 'contractrunlogs';
    public static EntityType = 'ContractRunLog';

    public CreatedBy: string;
    public ContractTriggerID: number;
    public Message: string;
    public Type: ContractEventType;
    public Deleted: boolean;
    public RunTime: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public ID: number;
    public StatusCode: number;
    public ContractID: number;
    public UpdatedBy: string;
    public _createguid: string;
    public Contract: Contract;
    public CustomFields: any;
}


export class ContractTransaction extends UniEntity {
    public static RelativeUrl = 'contracttransactions';
    public static EntityType = 'ContractTransaction';

    public CreatedBy: string;
    public AssetAddress: string;
    public SenderAddress: string;
    public ContractAddressID: number;
    public ReceiverAddress: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Amount: number;
    public ID: number;
    public StatusCode: number;
    public ContractID: number;
    public UpdatedBy: string;
    public _createguid: string;
    public Contract: Contract;
    public ContractAddress: ContractAddress;
    public CustomFields: any;
}


export class ContractTrigger extends UniEntity {
    public static RelativeUrl = 'contracttriggers';
    public static EntityType = 'ContractTrigger';

    public ModelFilter: string;
    public CreatedBy: string;
    public OperationFilter: string;
    public Type: ContractEventType;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public ID: number;
    public StatusCode: number;
    public ExpressionFilter: string;
    public ContractID: number;
    public UpdatedBy: string;
    public _createguid: string;
    public Contract: Contract;
    public CustomFields: any;
}


export class Comment extends UniEntity {
    public static RelativeUrl = 'comments';
    public static EntityType = 'Comment';

    public CreatedBy: string;
    public Deleted: boolean;
    public Text: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public EntityType: string;
    public ID: number;
    public StatusCode: number;
    public EntityID: number;
    public UpdatedBy: string;
    public AuthorID: number;
    public _createguid: string;
    public Mentioned: Array<Mentioned>;
    public Author: User;
    public CustomFields: any;
}


export class Mentioned extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Mentioned';

    public CreatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public CommentID: number;
    public ID: number;
    public StatusCode: number;
    public UserID: number;
    public UpdatedBy: string;
    public _createguid: string;
    public User: User;
    public CustomFields: any;
}


export class ApiKey extends UniEntity {
    public static RelativeUrl = 'apikeys';
    public static EntityType = 'ApiKey';

    public CreatedBy: string;
    public IntegrationType: TypeOfIntegration;
    public Deleted: boolean;
    public FilterDate: LocalDate;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Url: string;
    public Description: string;
    public ID: number;
    public StatusCode: number;
    public IntegrationKey: string;
    public Encrypt: boolean;
    public UpdatedBy: string;
    public ExternalId: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Altinn extends UniEntity {
    public static RelativeUrl = 'altinn';
    public static EntityType = 'Altinn';

    public PreferredLogin: TypeOfLogin;
    public CreatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public ID: number;
    public StatusCode: number;
    public SystemID: string;
    public UpdatedBy: string;
    public Language: string;
    public SystemPw: string;
    public _createguid: string;
    public CustomFields: any;
}


export class AltinnReceipt extends UniEntity {
    public static RelativeUrl = 'altinnreceipts';
    public static EntityType = 'AltinnReceipt';

    public XmlReceipt: string;
    public Form: string;
    public CreatedBy: string;
    public UserSign: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public AltinnResponseData: string;
    public ReceiptID: number;
    public CreatedAt: Date;
    public ID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public TimeStamp: Date;
    public HasBeenRegistered: boolean;
    public ErrorText: string;
    public _createguid: string;
    public Signings: Array<AltinnSigning>;
    public CustomFields: any;
}


export class AltinnSigning extends UniEntity {
    public static RelativeUrl = 'altinnsigning';
    public static EntityType = 'AltinnSigning';

    public SignatureReference: string;
    public CreatedBy: string;
    public DateSigned: Date;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public StatusText: string;
    public ID: number;
    public SignatureText: string;
    public StatusCode: number;
    public UpdatedBy: string;
    public AltinnReceiptID: number;
    public _createguid: string;
    public AltinnReceipt: AltinnReceipt;
    public CustomFields: any;
}


export class Barnepass extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Barnepass';

    public CreatedBy: string;
    public inntektsaar: number;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public ID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public _createguid: string;
    public oppgave: Array<BarnepassOppgave>;
    public CustomFields: any;
}


export class BarnepassOppgave extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'BarnepassOppgave';

    public BarnepassID: number;
    public CreatedBy: string;
    public email: string;
    public paaloeptBeloep: number;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public navn: string;
    public ID: number;
    public foedselsnummer: string;
    public StatusCode: number;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class UserRole extends UniEntity {
    public static RelativeUrl = 'userroles';
    public static EntityType = 'UserRole';

    public CreatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public SharedRoleId: number;
    public CreatedAt: Date;
    public ID: number;
    public SharedRoleName: string;
    public UserID: number;
    public UpdatedBy: string;
    public _createguid: string;
    public User: User;
    public CustomFields: any;
}


export class Role extends UniEntity {
    public static RelativeUrl = 'roles';
    public static EntityType = 'Role';

    public CreatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Description: string;
    public ID: number;
    public Label: string;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public RolePermissions: Array<RolePermission>;
    public CustomFields: any;
}


export class RolePermission extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'RolePermission';

    public CreatedBy: string;
    public RoleID: number;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public PermissionID: number;
    public CreatedAt: Date;
    public ID: number;
    public UpdatedBy: string;
    public _createguid: string;
    public Role: Role;
    public Permission: Permission;
    public CustomFields: any;
}


export class Permission extends UniEntity {
    public static RelativeUrl = 'permissions';
    public static EntityType = 'Permission';

    public CreatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public ID: number;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public RolePermissions: Array<RolePermission>;
    public CustomFields: any;
}


export class AvtaleGiroAgreement extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AvtaleGiroAgreement';

    public CreatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public DataSender: string;
    public CreatedAt: Date;
    public Description: string;
    public ID: number;
    public KeyPath: string;
    public UpdatedBy: string;
    public NextNumber: number;
    public Thumbprint: string;
    public _createguid: string;
    public CustomFields: any;
}


export class AvtaleGiroBankAccount extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AvtaleGiroBankAccount';

    public CreatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public AvtaleGiroAgreementID: number;
    public CreatedAt: Date;
    public ID: number;
    public BankAccountNumber: string;
    public CompanyID: number;
    public UpdatedBy: string;
    public _createguid: string;
    public Company: Company;
    public CustomFields: any;
}


export class AvtaleGiroFile extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AvtaleGiroFile';

    public CreatedBy: string;
    public AvtaleGiroMergedFileID: number;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public AvtaleGiroAgreementID: number;
    public CreatedAt: Date;
    public FileID: number;
    public ID: number;
    public CompanyID: number;
    public AvtaleGiroContent: string;
    public UpdatedBy: string;
    public _createguid: string;
    public Company: Company;
    public CustomFields: any;
}


export class AvtaleGiroMergedFile extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AvtaleGiroMergedFile';

    public CreatedBy: string;
    public Deleted: boolean;
    public TransmissionNumber: number;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public ID: number;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class BankAgreement extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'BankAgreement';

    public OrderMobile: string;
    public CustomerOrgNumber: string;
    public CustomerName: string;
    public CreatedBy: string;
    public AccountOwnerOrgNumber: string;
    public AccountOwnerName: string;
    public OrderEmail: string;
    public Deleted: boolean;
    public ReceiptDate: Date;
    public UpdatedAt: Date;
    public OrderName: string;
    public ReceiptID: string;
    public CreatedAt: Date;
    public ID: number;
    public CompanyID: number;
    public UpdatedBy: string;
    public ServiceID: string;
    public ServiceAccountID: number;
    public _createguid: string;
    public ServiceAccount: ServiceAccount;
    public Company: Company;
    public Services: Array<BankService>;
    public CustomFields: any;
}


export class BankService extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'BankService';

    public CreatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public KidRule: string;
    public CreatedAt: Date;
    public FileType: string;
    public ID: number;
    public BankAgreementID: number;
    public UpdatedBy: string;
    public ConfirmInNetbank: boolean;
    public ServiceType: number;
    public DivisionID: number;
    public DivisionName: string;
    public _createguid: string;
    public BankAgreement: BankAgreement;
    public BankAccounts: Array<BankServiceBankAccount>;
    public CustomFields: any;
}


export class BankServiceBankAccount extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'BankServiceBankAccount';

    public BankServiceID: number;
    public CreatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public AccountNumber: string;
    public ID: number;
    public UpdatedBy: string;
    public _createguid: string;
    public BankService: BankService;
    public CustomFields: any;
}


export class Company extends UniEntity {
    public static RelativeUrl = 'companies';
    public static EntityType = 'Company';

    public FileFlowEmail: string;
    public FileFlowOrgnrEmail: string;
    public CreatedBy: string;
    public SchemaName: string;
    public LastActivity: Date;
    public OrganizationNumber: string;
    public IsTest: boolean;
    public Key: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public ConnectionString: string;
    public IsGlobalTemplate: boolean;
    public CreatedAt: Date;
    public ID: number;
    public IsTemplate: boolean;
    public WebHookSubscriberId: string;
    public UpdatedBy: string;
    public ClientNumber: number;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class CompanyAccess extends UniEntity {
    public static RelativeUrl = 'companies-access';
    public static EntityType = 'CompanyAccess';

    public CreatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public ID: number;
    public CompanyID: number;
    public GlobalIdentity: string;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class CompanyBackup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'CompanyBackup';

    public CustomerName: string;
    public CreatedBy: string;
    public CompanyName: string;
    public SchemaName: string;
    public CloudBlobName: string;
    public Message: string;
    public ScheduledForDeleteAt: Date;
    public ContractType: number;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public Environment: string;
    public DeletedAt: Date;
    public CompanyKey: string;
    public CreatedAt: Date;
    public ID: number;
    public Reason: string;
    public BackupStatus: BackupStatus;
    public ContractID: number;
    public ContainerName: string;
    public UpdatedBy: string;
    public CopyFiles: boolean;
    public OrgNumber: string;
    public _createguid: string;
    public CustomFields: any;
}


export class ContractCron extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ContractCron';

    public Expression: string;
    public CreatedBy: string;
    public ContractTriggerID: number;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public ID: number;
    public CompanyID: number;
    public ContractID: number;
    public UpdatedBy: string;
    public CompanyDbName: string;
    public _createguid: string;
    public CompanyKey: string;
    public CustomFields: any;
}


export class ContractObyte extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ContractObyte';

    public CreatedBy: string;
    public AssetAddress: string;
    public ContractAddressID: number;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public ID: number;
    public CompanyID: number;
    public ContractID: number;
    public Address: string;
    public UpdatedBy: string;
    public CompanyDbName: string;
    public _createguid: string;
    public CompanyKey: string;
    public CustomFields: any;
}


export class DeniedUserAccessLog extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'DeniedUserAccessLog';

    public Username: string;
    public CreatedBy: string;
    public Occurred: Date;
    public CompanyName: string;
    public Message: string;
    public Email: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public ID: number;
    public CompanyID: number;
    public UpdatedBy: string;
    public _createguid: string;
    public Company: Company;
    public CustomFields: any;
}


export class FailedBankFile extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'FailedBankFile';

    public CreatedBy: string;
    public FileContent: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public CompanyKey: string;
    public CreatedAt: Date;
    public ID: number;
    public FailedReason: FailedReasonEnum;
    public FileName: string;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class HangfireJob extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'HangfireJob';

    public JobId: string;
    public UpdatedAt: Date;
    public CompanyKey: string;
    public CreatedAt: Date;
    public Year: number;
    public ID: number;
    public CompanyID: number;
    public HasError: boolean;
    public Status: number;
    public GlobalIdentity: string;
    public Completed: boolean;
    public CustomFields: any;
}


export class HangfireJobContext extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'HangfireJobContext';

    public JobId: string;
    public SchemaName: string;
    public UpdatedAt: Date;
    public CompanyKey: string;
    public CreatedAt: Date;
    public Year: number;
    public ID: number;
    public CompanyID: number;
    public HasError: boolean;
    public Status: number;
    public GlobalIdentity: string;
    public Completed: boolean;
    public CustomFields: any;
}


export class HangfireResponse extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'HangfireResponse';

    public State: string;
    public JobId: string;
    public UpdatedAt: Date;
    public CompanyKey: string;
    public CreatedAt: Date;
    public Year: number;
    public ID: number;
    public CompanyID: number;
    public HasError: boolean;
    public Status: number;
    public GlobalIdentity: string;
    public ProgressUrl: string;
    public Completed: boolean;
    public CustomFields: any;
}


export class KpiDefinition extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'KpiDefinition';

    public IsPerUser: boolean;
    public CreatedBy: string;
    public Route: string;
    public ValueType: KpiValueType;
    public RoleNames: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public SourceType: KpiSourceType;
    public CreatedAt: Date;
    public ID: number;
    public Interval: string;
    public RefreshModels: string;
    public CompanyID: number;
    public UpdatedBy: string;
    public Application: string;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class KpiValue extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'KpiValue';

    public KpiName: string;
    public LastUpdated: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public Counter: number;
    public Text: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public ValueStatus: KpiValueStatus;
    public ID: number;
    public KpiDefinitionID: number;
    public CompanyID: number;
    public UpdatedBy: string;
    public UserIdentity: string;
    public Total: number;
    public _createguid: string;
    public CustomFields: any;
}


export class ProcessFileLog extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ProcessFileLog';

    public CreatedBy: string;
    public CompanyName: string;
    public Message: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public CompanyKey: string;
    public CreatedAt: Date;
    public FileType: number;
    public FileID: number;
    public ID: number;
    public EntityCount: number;
    public StatusCode: number;
    public CompanyID: number;
    public FileName: string;
    public EntityName: string;
    public EntityInstanceID: string;
    public UpdatedBy: string;
    public UserIdentity: string;
    public _createguid: string;
    public Company: Company;
    public CustomFields: any;
}


export class ServiceAccount extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ServiceAccount';

    public CreatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public DataSender: string;
    public CreatedAt: Date;
    public Description: string;
    public ID: number;
    public KeyPath: string;
    public UpdatedBy: string;
    public NextNumber: number;
    public Thumbprint: string;
    public _createguid: string;
    public CustomFields: any;
}


export class UserVerification extends UniEntity {
    public static RelativeUrl = 'user-verifications';
    public static EntityType = 'UserVerification';

    public CreatedBy: string;
    public VerificationCode: string;
    public ExpirationDate: Date;
    public Email: string;
    public Deleted: boolean;
    public DisplayName: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public ID: number;
    public StatusCode: number;
    public CompanyId: number;
    public UserId: number;
    public VerificationDate: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Account extends UniEntity {
    public static RelativeUrl = 'accounts';
    public static EntityType = 'Account';

    public SupplierID: number;
    public CreatedBy: string;
    public UseVatDeductionGroupID: number;
    public DimensionsID: number;
    public TopLevelAccountGroupID: number;
    public SaftMappingAccountID: number;
    public AccountGroupID: number;
    public Active: boolean;
    public Deleted: boolean;
    public Keywords: string;
    public AccountName: string;
    public UpdatedAt: Date;
    public UsePostPost: boolean;
    public AccountSetupID: number;
    public CostAllocationID: number;
    public CreatedAt: Date;
    public Locked: boolean;
    public Description: string;
    public AccountNumber: number;
    public ID: number;
    public StatusCode: number;
    public EmployeeID: number;
    public AccountID: number;
    public UpdatedBy: string;
    public Visible: boolean;
    public SystemAccount: boolean;
    public VatTypeID: number;
    public DoSynchronize: boolean;
    public LockManualPosts: boolean;
    public CurrencyCodeID: number;
    public CustomerID: number;
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

    public CreatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public ID: number;
    public StatusCode: number;
    public AccountID: number;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class AccountGroup extends UniEntity {
    public static RelativeUrl = 'accountgroups';
    public static EntityType = 'AccountGroup';

    public CreatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public MainGroupID: number;
    public CreatedAt: Date;
    public ID: number;
    public AccountGroupSetupID: number;
    public Summable: boolean;
    public AccountGroupSetID: number;
    public StatusCode: number;
    public AccountID: number;
    public CompatibleAccountID: number;
    public UpdatedBy: string;
    public GroupNumber: string;
    public Name: string;
    public _createguid: string;
    public MainGroup: AccountGroup;
    public AccountGroupSet: AccountGroupSet;
    public CustomFields: any;
}


export class AccountGroupSet extends UniEntity {
    public static RelativeUrl = 'accountgroupsets';
    public static EntityType = 'AccountGroupSet';

    public Shared: boolean;
    public CreatedBy: string;
    public System: boolean;
    public FromAccountNumber: number;
    public Deleted: boolean;
    public SubAccountAllowed: boolean;
    public UpdatedAt: Date;
    public ToAccountNumber: number;
    public CreatedAt: Date;
    public ID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class AccountMandatoryDimension extends UniEntity {
    public static RelativeUrl = 'accountmandatorydimension';
    public static EntityType = 'AccountMandatoryDimension';

    public MandatoryType: number;
    public CreatedBy: string;
    public DimensionNo: number;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public ID: number;
    public StatusCode: number;
    public AccountID: number;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Accrual extends UniEntity {
    public static RelativeUrl = 'accruals';
    public static EntityType = 'Accrual';

    public CreatedBy: string;
    public BalanceAccountID: number;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public AccrualAmount: number;
    public CreatedAt: Date;
    public ID: number;
    public ResultAccountID: number;
    public StatusCode: number;
    public AccrualJournalEntryMode: number;
    public JournalEntryLineDraftID: number;
    public UpdatedBy: string;
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

    public CreatedBy: string;
    public PeriodNo: number;
    public JournalEntryDraftLineID: number;
    public Deleted: boolean;
    public AccountYear: number;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Amount: number;
    public ID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public AccrualID: number;
    public _createguid: string;
    public Accrual: Accrual;
    public JournalEntryLineDraft: JournalEntryLineDraft;
    public CustomFields: any;
}


export class Asset extends UniEntity {
    public static RelativeUrl = 'assets';
    public static EntityType = 'Asset';

    public DepreciationCycle: number;
    public CreatedBy: string;
    public DimensionsID: number;
    public BalanceAccountID: number;
    public PurchaseAmount: number;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public DepreciationStartDate: LocalDate;
    public PurchaseDate: LocalDate;
    public NetFinancialValue: number;
    public CreatedAt: Date;
    public ID: number;
    public AssetGroupCode: string;
    public AutoDepreciation: boolean;
    public ScrapValue: number;
    public Lifetime: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public DepreciationAccountID: number;
    public Name: string;
    public _createguid: string;
    public CurrentNetFinancialValue: number;
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

    public PhoneID: number;
    public CreatedBy: string;
    public Web: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public AddressID: number;
    public CreatedAt: Date;
    public ID: number;
    public InitialBIC: string;
    public StatusCode: number;
    public EmailID: number;
    public UpdatedBy: string;
    public BIC: string;
    public Name: string;
    public _createguid: string;
    public Address: Address;
    public Phone: Phone;
    public Email: Email;
    public CustomFields: any;
}


export class BankAccount extends UniEntity {
    public static RelativeUrl = 'bankaccounts';
    public static EntityType = 'BankAccount';

    public BankID: number;
    public CreatedBy: string;
    public BusinessRelationID: number;
    public IBAN: string;
    public Deleted: boolean;
    public BankAccountType: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Locked: boolean;
    public IntegrationStatus: number;
    public AccountNumber: string;
    public ID: number;
    public Label: string;
    public StatusCode: number;
    public IntegrationSettings: string;
    public AccountID: number;
    public UpdatedBy: string;
    public CompanySettingsID: number;
    public _createguid: string;
    public Bank: Bank;
    public Account: Account;
    public BusinessRelation: BusinessRelation;
    public CompanySettings: CompanySettings;
    public CustomFields: any;
}


export class BankIntegrationAgreement extends UniEntity {
    public static RelativeUrl = 'bank-agreements';
    public static EntityType = 'BankIntegrationAgreement';

    public BankAccountID: number;
    public CreatedBy: string;
    public HasOrderedIntegrationChange: boolean;
    public Email: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public ServiceProvider: number;
    public CreatedAt: Date;
    public DefaultAgreement: boolean;
    public ServiceTemplateID: string;
    public ID: number;
    public PropertiesJson: string;
    public HasNewAccountInformation: boolean;
    public StatusCode: number;
    public IsBankBalance: boolean;
    public UpdatedBy: string;
    public ServiceID: string;
    public BankAcceptance: boolean;
    public IsOutgoing: boolean;
    public Name: string;
    public IsInbound: boolean;
    public _createguid: string;
    public Password: string;
    public BankAccount: BankAccount;
    public CustomFields: any;
}


export class BankRule extends UniEntity {
    public static RelativeUrl = 'bankrules';
    public static EntityType = 'BankRule';

    public IsActive: boolean;
    public CreatedBy: string;
    public ActionCode: ActionCodeBankRule;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Priority: number;
    public ID: number;
    public StatusCode: number;
    public AccountID: number;
    public UpdatedBy: string;
    public Rule: string;
    public Name: string;
    public _createguid: string;
    public Account: Account;
    public CustomFields: any;
}


export class BankStatement extends UniEntity {
    public static RelativeUrl = 'bankstatements';
    public static EntityType = 'BankStatement';

    public ArchiveReference: string;
    public BankAccountID: number;
    public CreatedBy: string;
    public StartBalance: number;
    public Deleted: boolean;
    public CurrencyCode: string;
    public AmountCurrency: number;
    public FromDate: LocalDate;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Amount: number;
    public EndBalance: number;
    public FileID: number;
    public ID: number;
    public StatusCode: number;
    public ToDate: LocalDate;
    public AccountID: number;
    public UpdatedBy: string;
    public _createguid: string;
    public Account: Account;
    public BankAccount: BankAccount;
    public Entries: Array<BankStatementEntry>;
    public File: File;
    public CustomFields: any;
}


export class BankStatementEntry extends UniEntity {
    public static RelativeUrl = 'bankstatemententries';
    public static EntityType = 'BankStatementEntry';

    public ArchiveReference: string;
    public ValueDate: LocalDate;
    public SenderName: string;
    public TransactionId: string;
    public SenderAccount: string;
    public CreatedBy: string;
    public OpenAmountCurrency: number;
    public OpenAmount: number;
    public Deleted: boolean;
    public CurrencyCode: string;
    public BookingDate: LocalDate;
    public AmountCurrency: number;
    public CID: string;
    public Receivername: string;
    public UpdatedAt: Date;
    public InvoiceNumber: string;
    public CreatedAt: Date;
    public ReceiverAccount: string;
    public Amount: number;
    public Description: string;
    public ID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public Category: string;
    public BankStatementID: number;
    public StructuredReference: string;
    public _createguid: string;
    public BankStatement: BankStatement;
    public CustomFields: any;
}


export class BankStatementMatch extends UniEntity {
    public static RelativeUrl = 'bankstatementmatch';
    public static EntityType = 'BankStatementMatch';

    public CreatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public JournalEntryLineID: number;
    public CreatedAt: Date;
    public Amount: number;
    public ID: number;
    public BankStatementEntryID: number;
    public StatusCode: number;
    public Batch: string;
    public UpdatedBy: string;
    public Group: string;
    public _createguid: string;
    public BankStatementEntry: BankStatementEntry;
    public JournalEntryLine: JournalEntryLine;
    public CustomFields: any;
}


export class BankStatementRule extends UniEntity {
    public static RelativeUrl = 'bankstatementrules';
    public static EntityType = 'BankStatementRule';

    public IsActive: boolean;
    public CreatedBy: string;
    public EntryText: string;
    public DimensionsID: number;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Priority: number;
    public ID: number;
    public StatusCode: number;
    public AccountID: number;
    public UpdatedBy: string;
    public Rule: string;
    public Name: string;
    public _createguid: string;
    public Dimensions: Dimensions;
    public Account: Account;
    public CustomFields: any;
}


export class Budget extends UniEntity {
    public static RelativeUrl = 'budgets';
    public static EntityType = 'Budget';

    public CreatedBy: string;
    public AccountingYear: number;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public ID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public Entries: Array<BudgetEntry>;
    public CustomFields: any;
}


export class BudgetEntry extends UniEntity {
    public static RelativeUrl = 'budgetentries';
    public static EntityType = 'BudgetEntry';

    public CreatedBy: string;
    public DimensionsID: number;
    public Deleted: boolean;
    public BudgetID: number;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Amount: number;
    public ID: number;
    public StatusCode: number;
    public AccountID: number;
    public PeriodNumber: number;
    public UpdatedBy: string;
    public _createguid: string;
    public Budget: Budget;
    public Account: Account;
    public Dimensions: Dimensions;
    public CustomFields: any;
}


export class CompanyAccountingSettings extends UniEntity {
    public static RelativeUrl = 'companyaccountingsettings';
    public static EntityType = 'CompanyAccountingSettings';

    public AssetSaleProductID: number;
    public CreatedBy: string;
    public ReInvoicingCostsharingProductID: number;
    public AssetSaleLossBalancingAccountID: number;
    public AssetSaleLossNoVatAccountID: number;
    public Deleted: boolean;
    public AssetSaleProfitNoVatAccountID: number;
    public UpdatedAt: Date;
    public ReInvoicingTurnoverProductID: number;
    public ReInvoicingMethod: number;
    public CreatedAt: Date;
    public ID: number;
    public StatusCode: number;
    public AssetSaleProfitBalancingAccountID: number;
    public AssetSaleLossVatAccountID: number;
    public AssetSaleProfitVatAccountID: number;
    public UpdatedBy: string;
    public AssetWriteoffAccountID: number;
    public _createguid: string;
    public ReInvoicingCostsharingProduct: Product;
    public ReInvoicingTurnoverProduct: Product;
    public CustomFields: any;
}


export class CompanyBankAccount extends UniEntity {
    public static RelativeUrl = 'companybankaccounts';
    public static EntityType = 'CompanyBankAccount';

    public BankAccountID: number;
    public CreatedBy: string;
    public IsIncomming: boolean;
    public CreditAmount: number;
    public IsSalary: boolean;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public ID: number;
    public StatusCode: number;
    public AccountID: number;
    public UpdatedBy: string;
    public IsTax: boolean;
    public IsOutgoing: boolean;
    public Name: string;
    public _createguid: string;
    public BankAccount: BankAccount;
    public Account: Account;
    public CustomFields: any;
}


export class CostAllocation extends UniEntity {
    public static RelativeUrl = 'costallocations';
    public static EntityType = 'CostAllocation';

    public CreatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public ID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public Items: Array<CostAllocationItem>;
    public CustomFields: any;
}


export class CostAllocationItem extends UniEntity {
    public static RelativeUrl = 'costallocationitems';
    public static EntityType = 'CostAllocationItem';

    public CreatedBy: string;
    public DimensionsID: number;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public CostAllocationID: number;
    public CreatedAt: Date;
    public Amount: number;
    public Description: string;
    public ID: number;
    public Percent: number;
    public StatusCode: number;
    public AccountID: number;
    public UpdatedBy: string;
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

    public CreatedBy: string;
    public Deleted: boolean;
    public AmountCurrency: number;
    public UpdatedAt: Date;
    public DueDate: LocalDate;
    public CreatedAt: Date;
    public Amount: number;
    public Description: string;
    public CustomLiquidityPaymentType: CustomLiquidityPaymentInterval;
    public IsCustomerPayment: boolean;
    public ID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public EndDate: LocalDate;
    public CurrencyCodeID: number;
    public _createguid: string;
    public currency: CurrencyCode;
    public CustomFields: any;
}


export class DepreciationLine extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'DepreciationLine';

    public AssetID: number;
    public CreatedBy: string;
    public Deleted: boolean;
    public DepreciationType: number;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public ID: number;
    public StatusCode: number;
    public AssetJELineID: number;
    public UpdatedBy: string;
    public DepreciationJELineID: number;
    public _createguid: string;
    public DepreciationJELine: JournalEntryLine;
    public AssetJELine: JournalEntryLine;
    public CustomFields: any;
}


export class FinancialYear extends UniEntity {
    public static RelativeUrl = 'financialyears';
    public static EntityType = 'FinancialYear';

    public CreatedBy: string;
    public ValidFrom: LocalDate;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Year: number;
    public ID: number;
    public ValidTo: LocalDate;
    public StatusCode: number;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class JournalEntry extends UniEntity {
    public static RelativeUrl = 'journalentries';
    public static EntityType = 'JournalEntry';

    public FinancialYearID: number;
    public CreatedBy: string;
    public Deleted: boolean;
    public JournalEntryNumberNumeric: number;
    public UpdatedAt: Date;
    public JournalEntryDraftGroup: string;
    public JournalEntryNumber: string;
    public NumberSeriesTaskID: number;
    public CreatedAt: Date;
    public Description: string;
    public JournalEntryAccrualID: number;
    public ID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public NumberSeriesID: number;
    public CanSkipMandatoryDimension: boolean;
    public _createguid: string;
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

    public FinancialDate: LocalDate;
    public CreatedBy: string;
    public CustomerInvoiceID: number;
    public DimensionsID: number;
    public ReferenceOriginalPostID: number;
    public VatDeductionPercent: number;
    public VatPercent: number;
    public Deleted: boolean;
    public AmountCurrency: number;
    public JournalEntryNumberNumeric: number;
    public SupplierInvoiceID: number;
    public PaymentID: string;
    public VatJournalEntryPostID: number;
    public UpdatedAt: Date;
    public InvoiceNumber: string;
    public VatReportID: number;
    public OriginalReferencePostID: number;
    public JournalEntryNumber: string;
    public DueDate: LocalDate;
    public ReferenceCreditPostID: number;
    public RestAmountCurrency: number;
    public CreatedAt: Date;
    public Amount: number;
    public Description: string;
    public Signature: string;
    public ID: number;
    public TaxBasisAmount: number;
    public CustomerOrderID: number;
    public CurrencyExchangeRate: number;
    public TaxBasisAmountCurrency: number;
    public VatPeriodID: number;
    public StatusCode: number;
    public JournalEntryID: number;
    public SubAccountID: number;
    public OriginalJournalEntryPost: number;
    public JournalEntryLineDraftID: number;
    public VatDate: LocalDate;
    public PostPostJournalEntryLineID: number;
    public PaymentReferenceID: number;
    public AccountID: number;
    public UpdatedBy: string;
    public JournalEntryTypeID: number;
    public PeriodID: number;
    public VatTypeID: number;
    public RestAmount: number;
    public RegisteredDate: LocalDate;
    public BatchNumber: number;
    public PaymentInfoTypeID: number;
    public CurrencyCodeID: number;
    public AccrualID: number;
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

    public FinancialDate: LocalDate;
    public CreatedBy: string;
    public CustomerInvoiceID: number;
    public DimensionsID: number;
    public VatDeductionPercent: number;
    public VatPercent: number;
    public Deleted: boolean;
    public AmountCurrency: number;
    public JournalEntryNumberNumeric: number;
    public SupplierInvoiceID: number;
    public PaymentID: string;
    public UpdatedAt: Date;
    public InvoiceNumber: string;
    public JournalEntryNumber: string;
    public DueDate: LocalDate;
    public CreatedAt: Date;
    public Amount: number;
    public Description: string;
    public Signature: string;
    public ID: number;
    public TaxBasisAmount: number;
    public CustomerOrderID: number;
    public CurrencyExchangeRate: number;
    public TaxBasisAmountCurrency: number;
    public VatPeriodID: number;
    public StatusCode: number;
    public JournalEntryID: number;
    public SubAccountID: number;
    public VatDate: LocalDate;
    public PostPostJournalEntryLineID: number;
    public PaymentReferenceID: number;
    public AccountID: number;
    public UpdatedBy: string;
    public JournalEntryTypeID: number;
    public PeriodID: number;
    public VatTypeID: number;
    public RegisteredDate: LocalDate;
    public BatchNumber: number;
    public PaymentInfoTypeID: number;
    public CurrencyCodeID: number;
    public AccrualID: number;
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

    public CreatedBy: string;
    public TraceLinkTypes: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public VisibleModules: string;
    public CreatedAt: Date;
    public ID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public ColumnSetUp: string;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class JournalEntrySourceSerie extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'JournalEntrySourceSerie';

    public CreatedBy: string;
    public Deleted: boolean;
    public JournalEntrySourceID: number;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public ID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public JournalEntrySourceInstanceID: number;
    public _createguid: string;
    public JournalEntrySourceEntityName: string;
    public CustomFields: any;
}


export class JournalEntryType extends UniEntity {
    public static RelativeUrl = 'journalentrytypes';
    public static EntityType = 'JournalEntryType';

    public CreatedBy: string;
    public ExpectNegativeAmount: boolean;
    public Deleted: boolean;
    public DisplayName: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public ID: number;
    public MainName: string;
    public UpdatedBy: string;
    public Number: number;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class LedgerSuggestion extends UniEntity {
    public BusinessType: string;
    public Source: SuggestionSource;
    public IndustryName: string;
    public IndustryCode: string;
    public ID: number;
    public OrgNumber: string;
    public Name: string;
}


export class Payment extends UniEntity {
    public static RelativeUrl = 'payments';
    public static EntityType = 'Payment';

    public IsExternal: boolean;
    public IsPaymentClaim: boolean;
    public PaymentNotificationReportFileID: number;
    public CreatedBy: string;
    public CustomerInvoiceID: number;
    public ReconcilePayment: boolean;
    public BusinessRelationID: number;
    public XmlTagPmtInfIdReference: string;
    public PaymentDate: LocalDate;
    public FromBankAccountID: number;
    public Debtor: string;
    public OcrPaymentStrings: string;
    public Deleted: boolean;
    public Proprietary: string;
    public AmountCurrency: number;
    public SupplierInvoiceID: number;
    public PaymentID: string;
    public ToBankAccountID: number;
    public UpdatedAt: Date;
    public InvoiceNumber: string;
    public InPaymentID: string;
    public DueDate: LocalDate;
    public IsPaymentCancellationRequest: boolean;
    public CreatedAt: Date;
    public SerialNumberOrAcctSvcrRef: string;
    public Amount: number;
    public Description: string;
    public StatusText: string;
    public IsCustomerPayment: boolean;
    public ID: number;
    public CurrencyExchangeRate: number;
    public StatusCode: number;
    public JournalEntryID: number;
    public AutoJournal: boolean;
    public PaymentBatchID: number;
    public BankChargeAmount: number;
    public Domain: string;
    public XmlTagEndToEndIdReference: string;
    public PaymentStatusReportFileID: number;
    public UpdatedBy: string;
    public CustomerInvoiceReminderID: number;
    public PaymentCodeID: number;
    public CurrencyCodeID: number;
    public ExternalBankAccountNumber: string;
    public DimensionsID: number;
    public _createguid: string;
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

    public CreatedBy: string;
    public NumberOfPayments: number;
    public OcrTransmissionNumber: number;
    public Camt054CMsgId: string;
    public OcrHeadingStrings: string;
    public Deleted: boolean;
    public ReceiptDate: Date;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public IsCustomerPayment: boolean;
    public ID: number;
    public StatusCode: number;
    public TotalAmount: number;
    public PaymentStatusReportFileID: number;
    public PaymentReferenceID: string;
    public UpdatedBy: string;
    public TransferredDate: Date;
    public PaymentBatchTypeID: number;
    public PaymentFileID: number;
    public _createguid: string;
    public Payments: Array<Payment>;
    public PaymentBatchType: PaymentBatchType;
    public CustomFields: any;
}


export class PostPost extends UniEntity {
    public static RelativeUrl = 'postposts';
    public static EntityType = 'PostPost';

    public CreatedBy: string;
    public JournalEntryLine1ID: number;
    public Deleted: boolean;
    public AmountCurrency: number;
    public UpdatedAt: Date;
    public Date: LocalDate;
    public CreatedAt: Date;
    public Amount: number;
    public ID: number;
    public CurrencyExchangeRate: number;
    public JournalEntryLine2ID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public CurrencyCodeID: number;
    public _createguid: string;
    public JournalEntryLine1: JournalEntryLine;
    public JournalEntryLine2: JournalEntryLine;
    public CurrencyCode: CurrencyCode;
    public CustomFields: any;
}


export class ReInvoice extends UniEntity {
    public static RelativeUrl = 'reinvoicing';
    public static EntityType = 'ReInvoice';

    public CreatedBy: string;
    public OwnCostAmount: number;
    public Deleted: boolean;
    public SupplierInvoiceID: number;
    public TaxExclusiveAmount: number;
    public UpdatedAt: Date;
    public ReInvoicingType: number;
    public CreatedAt: Date;
    public ProductID: number;
    public ID: number;
    public StatusCode: number;
    public TaxInclusiveAmount: number;
    public UpdatedBy: string;
    public OwnCostShare: number;
    public _createguid: string;
    public SupplierInvoice: SupplierInvoice;
    public Product: Product;
    public Items: Array<ReInvoiceItem>;
    public CustomFields: any;
}


export class ReInvoiceItem extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ReInvoiceItem';

    public CreatedBy: string;
    public GrossAmount: number;
    public ReInvoiceID: number;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public Share: number;
    public CreatedAt: Date;
    public ID: number;
    public Vat: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public Surcharge: number;
    public CustomerID: number;
    public NetAmount: number;
    public _createguid: string;
    public Customer: Customer;
    public CustomFields: any;
}


export class SupplierInvoice extends UniEntity {
    public static RelativeUrl = 'supplierinvoices';
    public static EntityType = 'SupplierInvoice';

    public CreditedAmountCurrency: number;
    public ShippingAddressLine2: string;
    public IsSentToPayment: boolean;
    public InvoiceAddressLine1: string;
    public VatTotalsAmountCurrency: number;
    public CreditDays: number;
    public CustomerOrgNumber: string;
    public SupplierID: number;
    public PaymentStatus: number;
    public FreeTxt: string;
    public PayableRoundingAmount: number;
    public InvoiceType: number;
    public BankAccountID: number;
    public CreatedBy: string;
    public InvoicePostalCode: string;
    public TaxInclusiveAmountCurrency: number;
    public InvoiceDate: LocalDate;
    public DeliveryTermsID: number;
    public DeliveryDate: LocalDate;
    public PaymentInformation: string;
    public ShippingCountry: string;
    public ReInvoiceID: number;
    public CreditedAmount: number;
    public Deleted: boolean;
    public SupplierOrgNumber: string;
    public PaymentID: string;
    public TaxExclusiveAmount: number;
    public ShippingAddressLine1: string;
    public UpdatedAt: Date;
    public InvoiceReferenceID: number;
    public InvoiceCountryCode: string;
    public InvoiceNumber: string;
    public InternalNote: string;
    public Payment: string;
    public ShippingAddressLine3: string;
    public InvoiceCity: string;
    public OurReference: string;
    public RestAmountCurrency: number;
    public CreatedAt: Date;
    public AmountRegards: string;
    public InvoiceCountry: string;
    public InvoiceAddressLine3: string;
    public ID: number;
    public ShippingCountryCode: string;
    public PayableRoundingCurrencyAmount: number;
    public CurrencyExchangeRate: number;
    public DeliveryName: string;
    public ProjectID: number;
    public CustomerPerson: string;
    public DefaultDimensionsID: number;
    public PrintStatus: number;
    public StatusCode: number;
    public JournalEntryID: number;
    public Comment: string;
    public Requisition: string;
    public ReInvoiced: boolean;
    public ShippingCity: string;
    public YourReference: string;
    public DeliveryMethod: string;
    public DeliveryTerm: string;
    public InvoiceAddressLine2: string;
    public TaxExclusiveAmountCurrency: number;
    public PaymentDueDate: LocalDate;
    public TaxInclusiveAmount: number;
    public UpdatedBy: string;
    public InvoiceReceiverName: string;
    public VatTotalsAmount: number;
    public SalesPerson: string;
    public RestAmount: number;
    public InvoiceOriginType: SupplierInvoiceOriginType;
    public PaymentTerm: string;
    public ShippingPostalCode: string;
    public CurrencyCodeID: number;
    public Credited: boolean;
    public PaymentTermsID: number;
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
    public InvoicePeriodEndDate: LocalDate;
    public SumVat: number;
    public CreatedBy: string;
    public PriceIncVat: number;
    public SortIndex: number;
    public DimensionsID: number;
    public AccountingCost: string;
    public VatPercent: number;
    public Deleted: boolean;
    public SupplierInvoiceID: number;
    public DiscountPercent: number;
    public UpdatedAt: Date;
    public DiscountCurrency: number;
    public ItemText: string;
    public SumTotalExVatCurrency: number;
    public SumTotalExVat: number;
    public SumVatCurrency: number;
    public CreatedAt: Date;
    public ProductID: number;
    public ID: number;
    public SumTotalIncVat: number;
    public InvoicePeriodStartDate: LocalDate;
    public NumberOfItems: number;
    public CurrencyExchangeRate: number;
    public CalculateGrossPriceBasedOnNetPrice: boolean;
    public PriceExVat: number;
    public StatusCode: number;
    public Comment: string;
    public Discount: number;
    public PriceSetByUser: boolean;
    public UpdatedBy: string;
    public VatTypeID: number;
    public CurrencyCodeID: number;
    public SumTotalIncVatCurrency: number;
    public Unit: string;
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

    public CreatedBy: string;
    public Deleted: boolean;
    public No: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public ID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class VatDeduction extends UniEntity {
    public static RelativeUrl = 'vatdeductions';
    public static EntityType = 'VatDeduction';

    public VatDeductionGroupID: number;
    public CreatedBy: string;
    public ValidFrom: LocalDate;
    public Deleted: boolean;
    public DeductionPercent: number;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public ID: number;
    public ValidTo: LocalDate;
    public StatusCode: number;
    public UpdatedBy: string;
    public _createguid: string;
    public VatDeductionGroup: VatDeductionGroup;
    public CustomFields: any;
}


export class VatDeductionGroup extends UniEntity {
    public static RelativeUrl = 'vatdeductiongroups';
    public static EntityType = 'VatDeductionGroup';

    public CreatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public ID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class VatPost extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'VatPost';

    public ReportAsNegativeAmount: boolean;
    public CreatedBy: string;
    public VatCodeGroupID: number;
    public Deleted: boolean;
    public No: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public ID: number;
    public StatusCode: number;
    public HasTaxAmount: boolean;
    public HasTaxBasis: boolean;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public VatCodeGroup: VatCodeGroup;
    public VatReportReferences: Array<VatReportReference>;
    public CustomFields: any;
}


export class VatReport extends UniEntity {
    public static RelativeUrl = 'vatreports';
    public static EntityType = 'VatReport';

    public CreatedBy: string;
    public InternalComment: string;
    public ExternalRefNo: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public Title: string;
    public ExecutedDate: Date;
    public VatReportTypeID: number;
    public ReportedDate: Date;
    public CreatedAt: Date;
    public ID: number;
    public VatReportArchivedSummaryID: number;
    public StatusCode: number;
    public JournalEntryID: number;
    public Comment: string;
    public TerminPeriodID: number;
    public UpdatedBy: string;
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

    public CreatedBy: string;
    public PaymentToDescription: string;
    public PaymentPeriod: string;
    public Deleted: boolean;
    public SummaryHeader: string;
    public PaymentID: string;
    public UpdatedAt: Date;
    public ReportName: string;
    public CreatedAt: Date;
    public ID: number;
    public PaymentYear: number;
    public AmountToBeReceived: number;
    public PaymentBankAccountNumber: string;
    public StatusCode: number;
    public PaymentDueDate: Date;
    public AmountToBePayed: number;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class VatReportReference extends UniEntity {
    public static RelativeUrl = 'vatreportreferences';
    public static EntityType = 'VatReportReference';

    public VatPostID: number;
    public CreatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public ID: number;
    public StatusCode: number;
    public AccountID: number;
    public UpdatedBy: string;
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

    public CreatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public ID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class VatType extends UniEntity {
    public static RelativeUrl = 'vattypes';
    public static EntityType = 'VatType';

    public VatTypeSetupID: number;
    public CreatedBy: string;
    public IncomingAccountID: number;
    public DirectJournalEntryOnly: boolean;
    public VatCodeGroupID: number;
    public Deleted: boolean;
    public OutputVat: boolean;
    public UpdatedAt: Date;
    public OutgoingAccountID: number;
    public Alias: string;
    public CreatedAt: Date;
    public Locked: boolean;
    public InUse: boolean;
    public ID: number;
    public VatCodeGroupingValue: VatCodeGroupingValueEnum;
    public StatusCode: number;
    public AvailableInModules: boolean;
    public UpdatedBy: string;
    public Visible: boolean;
    public VatCode: string;
    public ReversedTaxDutyVat: boolean;
    public Name: string;
    public VatPercent: number;
    public _createguid: string;
    public IncomingAccount: Account;
    public OutgoingAccount: Account;
    public VatCodeGroup: VatCodeGroup;
    public VatReportReferences: Array<VatReportReference>;
    public VatTypePercentages: Array<VatTypePercentage>;
    public CustomFields: any;
}


export class VatTypePercentage extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'VatTypePercentage';

    public CreatedBy: string;
    public ValidFrom: LocalDate;
    public VatPercent: number;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public ID: number;
    public ValidTo: LocalDate;
    public StatusCode: number;
    public UpdatedBy: string;
    public VatTypeID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class VippsInvoice extends UniEntity {
    public static RelativeUrl = 'vipps-invoices';
    public static EntityType = 'VippsInvoice';

    public CreatedBy: string;
    public InvoiceRef: string;
    public Subject: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public InvoiceID: string;
    public CreatedAt: Date;
    public Amount: number;
    public MobileNumber: string;
    public ID: number;
    public BankAccountNumber: string;
    public StatusCode: number;
    public UpdatedBy: string;
    public Due: string;
    public _createguid: string;
    public CustomFields: any;
}


export class EntityValidationRule extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'EntityValidationRule';

    public CreatedBy: string;
    public System: boolean;
    public Message: string;
    public Operator: Operator;
    public Operation: OperationType;
    public OnConflict: OnConflict;
    public Deleted: boolean;
    public ChangedByCompany: boolean;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public EntityType: string;
    public Value: string;
    public PropertyName: string;
    public ID: number;
    public Level: ValidationLevel;
    public UpdatedBy: string;
    public SyncKey: string;
    public _createguid: string;
    public CustomFields: any;
}


export class EntityValidationRuleTemplate extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'EntityValidationRuleTemplate';

    public CreatedBy: string;
    public System: boolean;
    public Message: string;
    public Operator: Operator;
    public Operation: OperationType;
    public OnConflict: OnConflict;
    public Deleted: boolean;
    public ChangedByCompany: boolean;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public EntityType: string;
    public Value: string;
    public PropertyName: string;
    public ID: number;
    public Level: ValidationLevel;
    public UpdatedBy: string;
    public SyncKey: string;
    public _createguid: string;
    public CustomFields: any;
}


export class ComplexValidationRule extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ComplexValidationRule';

    public CreatedBy: string;
    public System: boolean;
    public Message: string;
    public Operation: OperationType;
    public OnConflict: OnConflict;
    public Deleted: boolean;
    public ChangedByCompany: boolean;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public EntityType: string;
    public ID: number;
    public Level: ValidationLevel;
    public ValidationCode: number;
    public UpdatedBy: string;
    public SyncKey: string;
    public _createguid: string;
    public CustomFields: any;
}


export class ComplexValidationRuleTemplate extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ComplexValidationRuleTemplate';

    public CreatedBy: string;
    public System: boolean;
    public Message: string;
    public Operation: OperationType;
    public OnConflict: OnConflict;
    public Deleted: boolean;
    public ChangedByCompany: boolean;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public EntityType: string;
    public ID: number;
    public Level: ValidationLevel;
    public ValidationCode: number;
    public UpdatedBy: string;
    public SyncKey: string;
    public _createguid: string;
    public CustomFields: any;
}


export class CustomField extends UniEntity {
    public static RelativeUrl = 'custom-fields';
    public static EntityType = 'CustomField';

    public ModelID: number;
    public CreatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public ID: number;
    public StatusCode: number;
    public Nullable: boolean;
    public UpdatedBy: string;
    public DataType: string;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class ValueList extends UniEntity {
    public static RelativeUrl = 'valuelists';
    public static EntityType = 'ValueList';

    public Code: string;
    public CreatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Description: string;
    public ID: number;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public Items: Array<ValueItem>;
    public CustomFields: any;
}


export class ValueItem extends UniEntity {
    public static RelativeUrl = 'valueitems';
    public static EntityType = 'ValueItem';

    public Code: string;
    public CreatedBy: string;
    public Index: number;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Description: string;
    public Value: string;
    public ID: number;
    public UpdatedBy: string;
    public ValueListID: number;
    public Name: string;
    public _createguid: string;
    public ValueList: ValueList;
    public CustomFields: any;
}


export class ComponentLayoutDto extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ComponentLayoutDto';

    public BaseEntity: string;
    public Url: string;
    public Name: string;
    public Fields: Array<FieldLayoutDto>;
    public CustomFields: any;
}


export class FieldLayoutDto extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'FieldLayoutDto';

    public Placeholder: string;
    public ValueList: string;
    public CreatedBy: string;
    public Placement: number;
    public LookupField: boolean;
    public ReadOnly: boolean;
    public Sectionheader: string;
    public ComponentLayoutID: number;
    public Section: number;
    public Options: string;
    public Legend: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public Combo: number;
    public Hidden: boolean;
    public CreatedAt: Date;
    public LookupEntityType: string;
    public EntityType: string;
    public Url: string;
    public Description: string;
    public ID: number;
    public Width: string;
    public FieldType: FieldType;
    public DisplayField: string;
    public Label: string;
    public LineBreak: boolean;
    public StatusCode: number;
    public UpdatedBy: string;
    public Alignment: Alignment;
    public HelpText: string;
    public FieldSet: number;
    public Property: string;
    public _createguid: string;
    public Validations: Array<EntityValidationRule>;
    public CustomFields: any;
}


export class AssignmentDetails extends UniEntity {
    public Message: string;
}


export class TimeSheet extends UniEntity {
    public FromDate: Date;
    public ToDate: Date;
    public Workflow: TimesheetWorkflow;
    public Relation: WorkRelation;
    public Items: Array<TimeSheetItem>;
}


export class TimeSheetItem extends UniEntity {
    public ExpectedTime: number;
    public WeekNumber: number;
    public StartTime: Date;
    public ValidTimeOff: number;
    public Projecttime: number;
    public Invoicable: number;
    public WeekDay: number;
    public SickTime: number;
    public Overtime: number;
    public Date: Date;
    public ValidTime: number;
    public TimeOff: number;
    public Status: WorkStatus;
    public Workflow: TimesheetWorkflow;
    public EndTime: Date;
    public Flextime: number;
    public IsWeekend: boolean;
    public TotalTime: number;
}


export class WorkBalanceDto extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'WorkBalanceDto';

    public LastDayExpected: number;
    public CreatedBy: string;
    public ValidTimeOff: number;
    public ActualMinutes: number;
    public ValidFrom: Date;
    public Deleted: boolean;
    public Days: number;
    public Balancetype: WorkBalanceTypeEnum;
    public UpdatedAt: Date;
    public WorkRelationID: number;
    public CreatedAt: Date;
    public SumOvertime: number;
    public Description: string;
    public Minutes: number;
    public ID: number;
    public BalanceDate: Date;
    public ExpectedMinutes: number;
    public StatusCode: number;
    public IsStartBalance: boolean;
    public BalanceFrom: Date;
    public UpdatedBy: string;
    public LastDayActual: number;
    public _createguid: string;
    public Previous: BalanceInfo;
    public Details: Array<FlexDetail>;
    public WorkRelation: WorkRelation;
    public CustomFields: any;
}


export class BalanceInfo extends UniEntity {
    public Description: string;
    public Minutes: number;
    public ID: number;
    public BalanceDate: Date;
}


export class FlexDetail extends UniEntity {
    public ValidTimeOff: number;
    public Date: Date;
    public ExpectedMinutes: number;
    public WorkedMinutes: number;
    public IsWeekend: boolean;
}


export class ContactSearchServiceResponse extends UniEntity {
    public Success: boolean;
    public ErrorMessage: string;
    public ErrorCode: number;
    public ObjectName: string;
    public Method: string;
}


export class InvoicesAndRemindersReadyToRemind extends UniEntity {
    public CustomerNumber: number;
    public CustomerName: string;
    public Interest: number;
    public TaxInclusiveAmountCurrency: number;
    public CustomerInvoiceID: number;
    public InvoiceDate: Date;
    public DontSendReminders: boolean;
    public EmailAddress: string;
    public ExternalReference: string;
    public InvoiceNumber: number;
    public DueDate: Date;
    public RestAmountCurrency: number;
    public CurrencyCodeCode: string;
    public CurrencyCodeShortCode: string;
    public CurrencyExchangeRate: number;
    public StatusCode: number;
    public ReminderNumber: number;
    public TaxInclusiveAmount: number;
    public Fee: number;
    public CustomerInvoiceReminderID: number;
    public RestAmount: number;
    public CurrencyCodeID: number;
    public CustomerID: number;
}


export class TradeHeaderCalculationSummary extends UniEntity {
    public SumVat: number;
    public DecimalRounding: number;
    public SumNoVatBasisCurrency: number;
    public SumNoVatBasis: number;
    public SumTotalExVatCurrency: number;
    public SumTotalExVat: number;
    public SumVatCurrency: number;
    public SumDiscount: number;
    public SumTotalIncVat: number;
    public SumDiscountCurrency: number;
    public SumVatBasis: number;
    public DecimalRoundingCurrency: number;
    public SumVatBasisCurrency: number;
    public SumTotalIncVatCurrency: number;
}


export class VatCalculationSummary extends UniEntity {
    public SumVat: number;
    public VatPercent: number;
    public SumVatCurrency: number;
    public SumVatBasis: number;
    public SumVatBasisCurrency: number;
}


export class InvoicePaymentData extends UniEntity {
    public DimensionsID: number;
    public PaymentDate: LocalDate;
    public FromBankAccountID: number;
    public AmountCurrency: number;
    public PaymentID: string;
    public AgioAmount: number;
    public Amount: number;
    public CurrencyExchangeRate: number;
    public AgioAccountID: number;
    public BankChargeAmount: number;
    public AccountID: number;
    public BankChargeAccountID: number;
    public CurrencyCodeID: number;
}


export class InvoiceSummary extends UniEntity {
    public SumRestAmount: number;
    public SumTotalAmount: number;
    public SumCreditedAmount: number;
}


export class CustomerNoAndName extends UniEntity {
    public Number: string;
    public Name: string;
}


export class OrderOffer extends UniEntity {
    public Message: string;
    public OrderId: string;
    public CostPercentage: number;
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
    public ReasonDescription: string;
    public ReasonCode: string;
    public ReasonHelpLink: string;
}


export class AmountDetail extends UniEntity {
    public Currency: string;
    public Amount: number;
}


export class Limits extends UniEntity {
    public MaxInvoiceAmount: number;
    public Limit: number;
    public RemainingLimit: number;
}


export class AmeldingAgaAndTaxSums extends UniEntity {
    public KIDTaxDraw: string;
    public FinancialTax: number;
    public EmploymentTax: number;
    public DueDate: Date;
    public KIDFinancialTax: string;
    public period: number;
    public AccountNumber: string;
    public KIDEmploymentTax: string;
    public TaxDraw: number;
    public MessageID: string;
}


export class PayrollRunInAmeldingPeriod extends UniEntity {
    public PayrollrunPaydate: Date;
    public CanGenerateAddition: boolean;
    public PayrollrunDescription: string;
    public PayrollrunID: number;
    public AmeldingSentdate: Date;
}


export class PayAgaTaxDTO extends UniEntity {
    public payTaxDraw: boolean;
    public payDate: Date;
    public payFinancialTax: boolean;
    public correctPennyDiff: boolean;
    public payAga: boolean;
}


export class AmeldingSumUp extends UniEntity {
    public type: AmeldingType;
    public altInnStatus: string;
    public meldingsID: string;
    public period: number;
    public year: number;
    public ID: number;
    public Replaces: string;
    public ReplacesAMeldingID: number;
    public status: AmeldingStatus;
    public generated: Date;
    public LegalEntityNo: string;
    public sent: Date;
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
    public employeeNumber: number;
    public name: string;
    public arbeidsforhold: Array<Employments>;
}


export class Employments extends UniEntity {
    public arbeidsforholdId: string;
    public startDate: Date;
    public endDate: Date;
    public permisjon: Array<EmploymentLeaves>;
}


export class EmploymentLeaves extends UniEntity {
    public sluttdato: Date;
    public permisjonsprosent: string;
    public beskrivelse: string;
    public startdato: Date;
    public permisjonsId: string;
}


export class TransactionTypes extends UniEntity {
    public Base_EmploymentTax: boolean;
    public incomeType: string;
    public benefit: string;
    public tax: boolean;
    public amount: number;
    public description: string;
}


export class AGADetails extends UniEntity {
    public type: string;
    public sectorName: string;
    public zoneName: string;
    public baseAmount: number;
    public rate: number;
}


export class Totals extends UniEntity {
    public sumAGA: number;
    public sumTax: number;
}


export class AnnualStatement extends UniEntity {
    public EmployeeCity: string;
    public EmployerAddress: string;
    public EmployeeMunicipalName: string;
    public EmployerOrgNr: string;
    public VacationPayBase: number;
    public EmployerCountryCode: string;
    public EmployerWebAddress: string;
    public EmployeeAddress: string;
    public EmployerCountry: string;
    public EmployeeNumber: number;
    public Year: number;
    public EmployeeSSn: string;
    public EmployerEmail: string;
    public EmployerCity: string;
    public EmployeePostCode: string;
    public EmployeeMunicipalNumber: string;
    public EmployerPostCode: string;
    public EmployerPhoneNumber: string;
    public EmployeeName: string;
    public EmployerTaxMandatory: boolean;
    public EmployerName: string;
    public Contributions: Array<AnnualStatementLine>;
    public PensionOrBenefits: Array<AnnualStatementLine>;
    public Deductions: Array<AnnualStatementLine>;
    public Draws: Array<AnnualStatementLine>;
}


export class AnnualStatementLine extends UniEntity {
    public Sum: number;
    public SupplementPackageName: string;
    public TaxReturnPost: string;
    public Amount: number;
    public Description: string;
    public IsDeduction: boolean;
    public LineIndex: number;
    public Supplements: Array<SupplementInfo>;
}


export class SupplementInfo extends UniEntity {
    public ValueString: string;
    public ValueDate: Date;
    public ValueMoney: number;
    public ValueType: Valuetype;
    public WageTypeSupplementID: number;
    public ValueBool: boolean;
    public ValueDate2: Date;
    public Name: string;
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
    public mainStatus: string;
    public Text: string;
    public Title: string;
    public IsJob: boolean;
    public employeestatus: Array<EmployeeStatus>;
}


export class EmployeeStatus extends UniEntity {
    public info: string;
    public employeeNumber: number;
    public ssn: string;
    public year: number;
    public status: string;
    public employeeID: number;
    public changedFields: Array<FieldsChanged>;
}


export class FieldsChanged extends UniEntity {
    public fieldName: string;
    public valFrom: string;
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
    public netPayment: number;
    public tax: number;
    public employeeID: number;
}


export class SumOnYear extends UniEntity {
    public pension: number;
    public usedNonTaxableAmount: number;
    public paidHolidaypay: number;
    public taxBase: number;
    public netPayment: number;
    public baseVacation: number;
    public grossPayment: number;
    public nonTaxableAmount: number;
    public advancePayment: number;
    public employeeID: number;
    public sumTax: number;
}


export class VacationPayLastYear extends UniEntity {
    public paidHolidayPay: number;
    public baseVacation: number;
    public employeeID: number;
}


export class SalaryTransactionPay extends UniEntity {
    public Withholding: number;
    public CompanyName: string;
    public TaxBankAccountID: number;
    public PaymentDate: Date;
    public SalaryBankAccountID: number;
    public CompanyBankAccountID: number;
    public CompanyAddress: string;
    public CompanyPostalCode: string;
    public CompanyCity: string;
    public PayList: Array<SalaryTransactionPayLine>;
    public SalaryBalancePayList: Array<SalaryBalancePayLine>;
}


export class SalaryTransactionPayLine extends UniEntity {
    public Account: string;
    public EmployeeNumber: number;
    public NetPayment: number;
    public Tax: number;
    public PostalCode: string;
    public Address: string;
    public City: string;
    public EmployeeName: string;
}


export class SalaryBalancePayLine extends UniEntity {
    public Account: string;
    public Sum: number;
    public Text: string;
    public Kid: string;
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
    public Message: string;
    public ReportID: number;
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
    public CalculatedPayruns: number;
    public FromPeriod: number;
    public Year: number;
    public BookedPayruns: number;
    public CreatedPayruns: number;
    public ToPeriod: number;
    public Groups: Array<ReconciliationGroup>;
}


export class ReconciliationGroup extends UniEntity {
    public Sum: number;
    public AccountNumber: string;
    public Lines: Array<ReconciliationLine>;
}


export class ReconciliationLine extends UniEntity {
    public WageTypeNumber: number;
    public Sum: number;
    public IncomeType: string;
    public WageTypeName: string;
    public Benefit: string;
    public HasEmploymentTax: boolean;
    public Description: string;
}


export class UnionReport extends UniEntity {
    public FromDate: LocalDate;
    public Year: number;
    public ToDate: LocalDate;
    public Summaries: Array<UnionSummary>;
}


export class UnionSummary extends UniEntity {
    public SupplierID: number;
    public Supplier: Supplier;
    public Members: Array<UnionMember>;
}


export class UnionMember extends UniEntity {
    public OUO: number;
    public Ensurance: number;
    public UnionDraw: number;
    public MemberNumber: string;
    public Name: string;
}


export class SalaryTransactionSums extends UniEntity {
    public Employee: number;
    public calculatedFinancialTax: number;
    public basePercentTax: number;
    public calculatedAGA: number;
    public Payrun: number;
    public manualTax: number;
    public tableTax: number;
    public netPayment: number;
    public baseVacation: number;
    public baseTableTax: number;
    public paidAdvance: number;
    public grossPayment: number;
    public percentTax: number;
    public paidPension: number;
    public baseAGA: number;
    public calculatedVacationPay: number;
}


export class SalaryTransactionPeriodSums extends UniEntity {
    public FromPeriod: number;
    public Year: number;
    public MunicipalName: string;
    public AgaRate: number;
    public AgaZone: string;
    public OrgNumber: string;
    public ToPeriod: number;
    public Sums: SalaryTransactionSums;
    public Aga: AGACalculation;
}


export class code extends UniEntity {
    public gyldigfom: string;
    public utloeserArbeidsgiveravgift: string;
    public uninavn: string;
    public postnr: string;
    public gyldigtil: string;
    public inngaarIGrunnlagForTrekk: string;
    public skatteOgAvgiftregel: string;
    public kunfranav: string;
    public gmlcode: string;
    public fordel: string;
    public loennsinntekt: Loennsinntekt;
    public ytelseFraOffentlige: YtelseFraOffentlige;
    public pensjonEllerTrygd: PensjonEllerTrygd;
    public naeringsinntekt: Naeringsinntekt;
    public fradrag: Fradrag;
    public forskuddstrekk: Forskuddstrekk;
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


export class IActionResult extends UniEntity {
}


export class CreateCompanyDetails extends UniEntity {
    public TemplateCompanyKey: string;
    public CompanyName: string;
    public IsTest: boolean;
    public ContractType: number;
    public ProductNames: string;
    public LicenseKey: string;
    public ContractID: number;
    public IsTemplate: boolean;
    public CopyFiles: boolean;
    public CompanySettings: CompanySettings;
}


export class UserDto extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'UserDto';

    public TwoFactorEnabled: boolean;
    public UserName: string;
    public CreatedBy: string;
    public HasAgreedToImportDisclaimer: boolean;
    public LastLogin: Date;
    public Email: string;
    public PermissionHandling: string;
    public PhoneNumber: string;
    public IsAutobankAdmin: boolean;
    public BankIntegrationUserName: string;
    public Deleted: boolean;
    public DisplayName: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public ID: number;
    public StatusCode: number;
    public GlobalIdentity: string;
    public Protected: boolean;
    public AuthPhoneNumber: string;
    public UpdatedBy: string;
    public _createguid: string;
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
    public TypeID: number;
    public TypeName: string;
    public EndDate: Date;
}


export class CompanyLicenseInfomation extends UniEntity {
    public Key: string;
    public ContactPerson: string;
    public ID: number;
    public StatusCode: LicenseEntityStatus;
    public ContactEmail: string;
    public ContractID: number;
    public EndDate: Date;
    public Name: string;
    public Agency: Agency;
}


export class Agency extends UniEntity {
    public CompanyKey: string;
    public Name: string;
}


export class ContractLicenseType extends UniEntity {
    public TypeID: number;
    public TrialExpiration: Date;
    public StartDate: Date;
    public TypeName: string;
}


export class LicenseAgreementInfo extends UniEntity {
    public AgreementId: number;
    public HasAgreedToLicense: boolean;
}


export class CreateBankUserDTO extends UniEntity {
    public AdminUserId: number;
    public AdminPassword: string;
    public Password: string;
    public IsAdmin: boolean;
    public Phone: string;
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
    public ValidFrom: Date;
    public ValidTo: Date;
    public Status: ChallengeRequestResult;
    public ExtensionData: ExtensionDataObject;
}


export class ExtensionDataObject extends UniEntity {
}


export class AltinnAuthRequest extends UniEntity {
    public UserPassword: string;
    public PreferredLogin: string;
    public UserID: string;
}


export class A06Options extends UniEntity {
    public ReportType: ReportType;
    public IncludeInfoPerPerson: boolean;
    public FromPeriod: Maaned;
    public Year: number;
    public IncludeIncome: boolean;
    public IncludeEmployments: boolean;
    public ToPeriod: Maaned;
}


export class A07Response extends UniEntity {
    public DataName: string;
    public mainStatus: string;
    public Data: string;
    public Text: string;
    public Title: string;
    public DataType: string;
}


export class SelfEmployed extends UniEntity {
    public year: number;
    public items: Array<SelfEmployedItem>;
}


export class SelfEmployedItem extends UniEntity {
    public supplierID: number;
    public amount: number;
    public number: string;
    public name: string;
}


export class SetIntegrationDataDto extends UniEntity {
    public IntegrationKey: string;
    public ExternalId: string;
}


export class CurrencyRateData extends UniEntity {
    public Factor: number;
    public ExchangeRate: number;
    public IsOverrideRate: boolean;
    public FromCurrencyCode: CurrencyCode;
}


export class EmailDTO extends UniEntity {
    public FromAddress: string;
    public Message: string;
    public ReportID: number;
    public Subject: string;
    public Format: string;
    public CopyAddress: string;
    public Parameters: Array<ReportParameter>;
}


export class ReportParameter extends UniEntity {
    public Value: string;
    public Name: string;
}


export class SendEmail extends UniEntity {
    public FromAddress: string;
    public Message: string;
    public ReportID: number;
    public Subject: string;
    public ExternalReference: string;
    public ReportName: string;
    public EntityType: string;
    public Localization: string;
    public EntityID: number;
    public CopyAddress: string;
    public Attachments: Array<SendEmailAttachment>;
    public Parameters: Array<ReportParameter>;
}


export class SendEmailAttachment extends UniEntity {
    public Attachment: string;
    public FileID: number;
    public FileName: string;
}


export class RssList extends UniEntity {
    public Title: string;
    public Url: string;
    public Description: string;
    public Items: Array<RssItem>;
}


export class RssItem extends UniEntity {
    public PubDate: string;
    public Guid: string;
    public Title: string;
    public Description: string;
    public Link: string;
    public Category: string;
    public Enclosure: Enclosure;
}


export class Enclosure extends UniEntity {
    public Type: string;
    public Length: string;
    public Url: string;
}


export class SharingUpdates extends UniEntity {
    public SharingStatusUpdates: Array<SharingStatusUpdate>;
}


export class SharingStatusUpdate extends UniEntity {
    public SharingId: number;
    public Status: StatusCodeSharing;
}


export class TeamReport extends UniEntity {
    public FromDate: LocalDate;
    public ToDate: LocalDate;
    public Team: Team;
    public Members: Array<MemberDetails>;
}


export class MemberDetails extends UniEntity {
    public TotalBalance: number;
    public MinutesWorked: number;
    public ExpectedMinutes: number;
    public ReportBalance: number;
    public Name: string;
    public WorkRelation: WorkRelation;
    public TimeOff: Array<FlexDetail>;
    public MissingDays: Array<FlexDetail>;
}


export class TeamPositionDto extends UniEntity {
    public PositionName: string;
    public Position: TeamPositionEnum;
}


export class EHFCustomer extends UniEntity {
    public orgname: string;
    public orgno: string;
    public contactname: string;
    public contactphone: string;
    public contactemail: string;
}


export class ServiceMetadataDto extends UniEntity {
    public ServiceName: string;
    public SupportEmail: string;
}


export class AccountUsageReference extends UniEntity {
    public Info: string;
    public Entity: string;
    public EntityID: number;
}


export class MandatoryDimensionAccountReport extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'MandatoryDimensionAccountReport';

    public MissingOnlyWarningsDimensionsMessage: string;
    public CreatedBy: string;
    public DimensionsID: number;
    public MissingRequiredDimensionsMessage: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public AccountNumber: string;
    public ID: number;
    public StatusCode: number;
    public journalEntryLineDraftID: number;
    public AccountID: number;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class AccountDimension extends UniEntity {
    public DimensionsID: number;
    public AccountNumber: number;
    public AccountID: number;
    public Dimensions: Dimensions;
}


export class AssetReportDTO extends UniEntity {
    public BalanceAccountNumber: number;
    public GroupCode: string;
    public DepreciationAccountNumber: number;
    public LastDepreciation: LocalDate;
    public Lifetime: number;
    public CurrentValue: number;
    public BalanceAccountName: string;
    public Number: number;
    public GroupName: string;
    public Name: string;
    public Lines: Array<AssetReportLineDTO>;
}


export class AssetReportLineDTO extends UniEntity {
    public Type: string;
    public Date: LocalDate;
    public TypeID: number;
    public Value: number;
}


export class BankData extends UniEntity {
    public IBAN: string;
    public AccountNumber: string;
    public Bank: Bank;
}


export class CreateBankIntegrationDTO extends UniEntity {
    public UserName: string;
    public BankAccountID: number;
    public TuserName: string;
    public Bank: string;
    public Email: string;
    public DisplayName: string;
    public Password: string;
    public ServiceProvider: number;
    public Phone: string;
    public RequireTwoStage: boolean;
    public BankApproval: boolean;
    public IsBankStatement: boolean;
    public IsBankBalance: boolean;
    public BankAcceptance: boolean;
    public IsOutgoing: boolean;
    public IsInbound: boolean;
    public BankAccounts: Array<BankAccountDTO>;
}


export class BankAccountDTO extends UniEntity {
    public BBAN: string;
    public IBAN: string;
    public IsBankStatement: boolean;
    public IsBankBalance: boolean;
    public Bic: string;
    public IsOutgoing: boolean;
    public IsInbound: boolean;
}


export class ZdataUpdateBankProperties extends UniEntity {
    public Password: string;
    public IsBankStatement: boolean;
    public IsBankBalance: boolean;
    public ServiceID: string;
    public IsOutgoing: boolean;
    public IsInbound: boolean;
}


export class AutobankUserDTO extends UniEntity {
    public Password: string;
    public IsAdmin: boolean;
    public Phone: string;
    public UserID: number;
}


export class UpdateServiceStatusDTO extends UniEntity {
    public StatusCode: StatusCodeBankIntegrationAgreement;
    public ServiceID: string;
}


export class UpdateServiceIDDTO extends UniEntity {
    public NewServiceID: string;
    public ServiceID: string;
}


export class BankMatchSuggestion extends UniEntity {
    public JournalEntryLineID: number;
    public Amount: number;
    public BankStatementEntryID: number;
    public Group: string;
}


export class MatchRequest extends UniEntity {
    public JournalEntries: Array<MatchCandidate>;
    public BankEntries: Array<MatchCandidate>;
    public Settings: MatchSettings;
}


export class MatchCandidate extends UniEntity {
    public Closed: boolean;
    public Date: Date;
    public Amount: number;
    public ID: number;
    public IsBankEntry: boolean;
}


export class MatchSettings extends UniEntity {
    public MaxDayOffset: number;
    public MaxDelta: number;
}


export class ReconciliationStatus extends UniEntity {
    public NumberOfUnReconciled: number;
    public FromDate: Date;
    public NumberOfItems: number;
    public Todate: Date;
    public TotalAmount: number;
    public TotalUnreconciled: number;
    public AccountID: number;
    public IsReconciled: boolean;
}


export class BalanceDto extends UniEntity {
    public Balance: number;
    public StartDate: Date;
    public BalanceInStatement: number;
    public EndDate: Date;
}


export class BankfileFormat extends UniEntity {
    public IsFixed: boolean;
    public SkipRows: number;
    public CustomFormat: BankFileCustomFormat;
    public LinePrefix: string;
    public IsXml: boolean;
    public FileExtension: string;
    public Separator: string;
    public Name: string;
    public Columns: Array<BankfileColumn>;
}


export class BankfileColumn extends UniEntity {
    public StartPos: number;
    public Length: number;
    public IsFallBack: boolean;
    public FieldMapping: BankfileField;
    public DataType: BankfileDataType;
}


export class JournalSuggestion extends UniEntity {
    public FinancialDate: LocalDate;
    public BankStatementRuleID: number;
    public Amount: number;
    public Description: string;
    public MatchWithEntryID: number;
    public AccountID: number;
    public Account: Account;
}


export class ReportRow extends UniEntity {
    public BudPeriod1: number;
    public SubGroupName: string;
    public BudPeriod7: number;
    public Period3: number;
    public BudgetSum: number;
    public BudPeriod5: number;
    public BudPeriod2: number;
    public BudPeriod3: number;
    public Period4: number;
    public BudPeriod6: number;
    public SumPeriod: number;
    public Period2: number;
    public Sum: number;
    public SumPeriodLastYear: number;
    public BudPeriod10: number;
    public Period5: number;
    public Period10: number;
    public AccountName: string;
    public AccountYear: number;
    public Period9: number;
    public PrecedingBalance: number;
    public SumPeriodAccumulated: number;
    public Period7: number;
    public SumLastYear: number;
    public AccountNumber: number;
    public BudPeriod12: number;
    public Period1: number;
    public ID: number;
    public IsSubTotal: boolean;
    public Period12: number;
    public SubGroupNumber: number;
    public BudPeriod9: number;
    public SumPeriodLastYearAccumulated: number;
    public BudPeriod11: number;
    public Period11: number;
    public GroupName: string;
    public BudPeriod8: number;
    public Period8: number;
    public BudPeriod4: number;
    public GroupNumber: number;
    public BudgetAccumulated: number;
    public Period6: number;
}


export class BudgetImport extends UniEntity {
    public Budget: Budget;
}


export class LiquidityTableDTO extends UniEntity {
    public BankBalance: number;
    public OverdueSupplierInvoices: number;
    public OverdueCustomerInvoices: number;
    public BankBalanceRefferance: BankBalanceType;
    public Period: Array<DetailsDTO>;
}


export class DetailsDTO extends UniEntity {
    public Supplier: number;
    public Sum: number;
    public Custumer: number;
    public CustomPayments: number;
    public VAT: number;
    public Liquidity: number;
}


export class JournalEntryData extends UniEntity {
    public FinancialDate: LocalDate;
    public CustomerInvoiceID: number;
    public CreditAccountID: number;
    public VatDeductionPercent: number;
    public DebitVatTypeID: number;
    public CurrencyID: number;
    public AmountCurrency: number;
    public SupplierInvoiceID: number;
    public PaymentID: string;
    public DebitAccountID: number;
    public JournalEntryNo: string;
    public InvoiceNumber: string;
    public DueDate: LocalDate;
    public NumberSeriesTaskID: number;
    public Amount: number;
    public Description: string;
    public CustomerOrderID: number;
    public CurrencyExchangeRate: number;
    public StatusCode: number;
    public JournalEntryID: number;
    public CreditVatTypeID: number;
    public VatDate: LocalDate;
    public PostPostJournalEntryLineID: number;
    public DebitAccountNumber: number;
    public JournalEntryDataAccrualID: number;
    public SupplierInvoiceNo: string;
    public NumberSeriesID: number;
    public CreditAccountNumber: number;
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
    public PeriodNo: number;
    public PeriodName: string;
    public PeriodSumYear2: number;
    public PeriodSumYear1: number;
}


export class JournalEntryLineRequestSummary extends UniEntity {
    public SumLedger: number;
    public SumTaxBasisAmount: number;
    public SumBalance: number;
    public SumDebit: number;
    public SumCredit: number;
}


export class JournalEntryLinePostPostData extends UniEntity {
    public FinancialDate: Date;
    public NumberOfPayments: number;
    public PeriodNo: number;
    public MarkedAgainstJournalEntryNumber: string;
    public AmountCurrency: number;
    public JournalEntryNumberNumeric: number;
    public AccountYear: number;
    public PaymentID: string;
    public SubAccountName: string;
    public InvoiceNumber: string;
    public JournalEntryNumber: string;
    public DueDate: Date;
    public RestAmountCurrency: number;
    public CurrencyCodeCode: string;
    public JournalEntryTypeName: string;
    public Amount: number;
    public Description: string;
    public ID: number;
    public MarkedAgainstJournalEntryLineID: number;
    public CurrencyCodeShortCode: string;
    public CurrencyExchangeRate: number;
    public SumPostPostAmountCurrency: number;
    public StatusCode: number;
    public JournalEntryID: number;
    public RestAmount: number;
    public CurrencyCodeID: number;
    public SumPostPostAmount: number;
    public SubAccountNumber: number;
    public Markings: Array<JournalEntryLinePostPostData>;
}


export class CreatePaymentBatchDTO extends UniEntity {
    public Code: string;
    public Password: string;
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
    public FinancialDate: Date;
    public OriginalRestAmount: number;
    public OriginalStatusCode: StatusCodeJournalEntryLine;
    public AmountCurrency: number;
    public InvoiceNumber: string;
    public JournalEntryNumber: string;
    public RestAmountCurrency: number;
    public Amount: number;
    public ID: number;
    public StatusCode: StatusCodeJournalEntryLine;
    public RestAmount: number;
    public Markings: Array<MarkingReference>;
}


export class MarkingReference extends UniEntity {
    public JournalEntryNumber: string;
    public ID: number;
}


export class SupplierInvoiceDetail extends UniEntity {
    public SupplierID: number;
    public InvoiceDate: Date;
    public DeliveryDate: Date;
    public VatPercent: number;
    public AmountCurrency: number;
    public SupplierInvoiceID: number;
    public AccountName: string;
    public InvoiceNumber: string;
    public Amount: number;
    public Description: string;
    public AccountNumber: number;
    public AccountID: number;
    public VatTypeID: number;
    public VatCode: string;
    public VatTypeName: string;
}


export class VatReportMessage extends UniEntity {
    public Message: string;
    public Level: ValidationLevel;
}


export class VatReportSummary extends UniEntity {
    public NumberOfJournalEntryLines: number;
    public VatCodeGroupID: number;
    public SumVatAmount: number;
    public VatCodeGroupNo: string;
    public VatCodeGroupName: string;
    public SumTaxBasisAmount: number;
    public HasTaxAmount: boolean;
    public HasTaxBasis: boolean;
    public IsHistoricData: boolean;
}


export class VatReportSummaryPerPost extends UniEntity {
    public VatPostID: number;
    public NumberOfJournalEntryLines: number;
    public VatCodeGroupID: number;
    public VatPostNo: string;
    public SumVatAmount: number;
    public VatCodeGroupNo: string;
    public VatPostName: string;
    public VatCodeGroupName: string;
    public SumTaxBasisAmount: number;
    public HasTaxAmount: boolean;
    public HasTaxBasis: boolean;
    public VatPostReportAsNegativeAmount: boolean;
    public IsHistoricData: boolean;
}


export class VatReportSummaryPerPostPerAccount extends UniEntity {
    public VatAccountName: string;
    public VatPostID: number;
    public FinancialDate: Date;
    public NumberOfJournalEntryLines: number;
    public VatAccountNumber: number;
    public VatJournalEntryPostAccountName: string;
    public VatCodeGroupID: number;
    public VatJournalEntryPostAccountID: number;
    public VatPostNo: string;
    public SumVatAmount: number;
    public VatCodeGroupNo: string;
    public VatPostName: string;
    public StdVatCode: string;
    public VatCodeGroupName: string;
    public JournalEntryNumber: string;
    public SumTaxBasisAmount: number;
    public Amount: number;
    public Description: string;
    public TaxBasisAmount: number;
    public VatAccountID: number;
    public HasTaxAmount: boolean;
    public HasTaxBasis: boolean;
    public VatDate: Date;
    public VatJournalEntryPostAccountNumber: number;
    public VatPostReportAsNegativeAmount: boolean;
    public VatCode: string;
    public IsHistoricData: boolean;
}


export class VatReportNotReportedJournalEntryData extends UniEntity {
    public NumberOfJournalEntryLines: number;
    public SumVatAmount: number;
    public SumTaxBasisAmount: number;
    public TerminPeriodID: number;
}


export class AltinnSigningTextResponse extends UniEntity {
    public SigningText: string;
}


export class AltinnGetVatReportDataFromAltinnResult extends UniEntity {
    public Message: string;
    public Status: AltinnGetVatReportDataFromAltinnStatus;
}


export class VippsUpdateStatus extends UniEntity {
    public InvoiceID: string;
    public StatusCode: number;
}


export class VippsUser extends UniEntity {
    public PhoneNumber: string;
}


export class AccountUsage extends UniEntity {
    public PercentWeight: number;
    public Counter: number;
    public AccountNumber: number;
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


export enum PaymentInfoTypeEnum{
    Regular = 1,
    Balance = 2,
    Collection = 3,
    Special = 4,
}


export enum Modulus{
    Modulus10 = 10,
}


export enum RecurringPeriod{
    None = 0,
    Days = 1,
    Weeks = 2,
    Month = 3,
    Quarter = 4,
    Year = 5,
}


export enum RecurringResult{
    Order = 0,
    Invoice = 1,
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


export enum TypeOfPaymentOtp{
    FixedSalary = 0,
    HourlyPay = 1,
    PaidOnCommission = 2,
}


export enum InternationalIDType{
    notSet = 0,
    Passportnumber = 1,
    SocialSecurityNumber = 2,
    TaxIdentificationNumber = 3,
    ValueAddedTaxNumber = 4,
}


export enum ForeignWorker{
    notSet = 0,
    ForeignWorkerUSA_Canada = 1,
    ForeignWorkerFixedAga = 2,
}


export enum GenderEnum{
    NotDefined = 0,
    Woman = 1,
    Man = 2,
}


export enum PaymentInterval{
    Standard = 0,
    Monthly = 1,
    Pr14Days = 2,
    Weekly = 3,
}


export enum OtpStatus{
    A = 0,
    S = 1,
    P = 2,
    LP = 3,
    AP = 4,
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


export enum ShipTypeOfShip{
    notSet = 0,
    Other = 1,
    DrillingPlatform = 2,
    Tourist = 3,
}


export enum TypeOfEmployment{
    notSet = 0,
    OrdinaryEmployment = 1,
    MaritimeEmployment = 2,
    FrilancerContratorFeeRecipient = 3,
    PensionOrOtherNonEmployedBenefits = 4,
}


export enum ShipRegistry{
    notSet = 0,
    NorwegianInternationalShipRegister = 1,
    NorwegianOrdinaryShipRegister = 2,
    ForeignShipRegister = 3,
}


export enum WorkingHoursScheme{
    notSet = 0,
    NonShift = 1,
    OffshoreWork = 2,
    ContinousShiftwork336 = 3,
    DayAndNightContinous355 = 4,
    ShiftWork = 5,
}


export enum RemunerationType{
    notSet = 0,
    FixedSalary = 1,
    HourlyPaid = 2,
    PaidOnCommission = 3,
    OnAgreement_Honorar = 4,
    ByPerformance = 5,
}


export enum ShipTradeArea{
    notSet = 0,
    Domestic = 1,
    Foreign = 2,
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


export enum SalBalDrawType{
    FixedAmount = 0,
    InstalmentWithBalance = 1,
}


export enum SalBalType{
    Advance = 1,
    Contribution = 2,
    Outlay = 3,
    Garnishment = 4,
    Other = 5,
    Union = 6,
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


export enum LimitType{
    None = 0,
    Amount = 1,
    Sum = 2,
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


export enum GetRateFrom{
    WageType = 0,
    MonthlyPayEmployee = 1,
    HourlyPayEmployee = 2,
    FreeRateEmployee = 3,
}


export enum SpecialAgaRule{
    Regular = 0,
    AgaRefund = 1,
    AgaPension = 2,
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


export enum OperationType{
    Create = 10,
    Update = 20,
    CreateAndUpdate = 30,
    Delete = 40,
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


export enum OnConflict{
    Replace = 0,
    Ignore = 1,
    ManualResolve = 2,
}


export enum ValidationLevel{
    Info = 1,
    Warning = 20,
    Error = 30,
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


export enum VippsProcessStatus{
    Created = 41000,
    Rejected = 42000,
    Pending = 43000,
    Expired = 44000,
    Approved = 45000,
    Deleted = 46000,
    Revoked = 47000,
}


export enum CustomFieldStatus{
    Draft = 110100,
    Active = 110101,
}
