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
    public ClientID: string;
    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Transaction: string;
    public EntityID: number;
    public Action: string;
    public EntityType: string;
    public OldValue: string;
    public UpdatedAt: Date;
    public Route: string;
    public CreatedAt: Date;
    public Field: string;
    public Deleted: boolean;
    public Verb: string;
    public _createguid: string;
    public CustomFields: any;
}


export class WorkBalance extends UniEntity {
    public static RelativeUrl = 'workbalances';
    public static EntityType = 'WorkBalance';

    public ID: number;
    public IsStartBalance: boolean;
    public Minutes: number;
    public UpdatedBy: string;
    public WorkRelationID: number;
    public CreatedBy: string;
    public Description: string;
    public ActualMinutes: number;
    public ExpectedMinutes: number;
    public BalanceFrom: Date;
    public Balancetype: WorkBalanceTypeEnum;
    public ValidFrom: Date;
    public Days: number;
    public UpdatedAt: Date;
    public BalanceDate: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public ValidTimeOff: number;
    public Deleted: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class Worker extends UniEntity {
    public static RelativeUrl = 'workers';
    public static EntityType = 'Worker';

    public ID: number;
    public UserID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public BusinessRelationID: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public EmployeeID: number;
    public _createguid: string;
    public Info: BusinessRelation;
    public Relations: Array<WorkRelation>;
    public Employee: Employee;
    public CustomFields: any;
}


export class WorkItem extends UniEntity {
    public static RelativeUrl = 'workitems';
    public static EntityType = 'WorkItem';

    public Label: string;
    public StartTime: Date;
    public ID: number;
    public PriceExVat: number;
    public Date: Date;
    public TransferedToPayroll: boolean;
    public Minutes: number;
    public UpdatedBy: string;
    public WorkRelationID: number;
    public CreatedBy: string;
    public Description: string;
    public PayrollTrackingID: number;
    public EndTime: Date;
    public WorkItemGroupID: number;
    public TransferedToOrder: boolean;
    public OrderItemId: number;
    public WorkTypeID: number;
    public UpdatedAt: Date;
    public LunchInMinutes: number;
    public StatusCode: number;
    public CustomerID: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public DimensionsID: number;
    public MinutesToOrder: number;
    public CustomerOrderID: number;
    public Invoiceable: boolean;
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

    public ID: number;
    public UpdatedBy: string;
    public WorkRelationID: number;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public _createguid: string;
    public WorkRelation: WorkRelation;
    public Items: Array<WorkItem>;
    public CustomFields: any;
}


export class WorkProfile extends UniEntity {
    public static RelativeUrl = 'workprofiles';
    public static EntityType = 'WorkProfile';

    public ID: number;
    public MinutesPerWeek: number;
    public MinutesPerYear: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public MinutesPerMonth: number;
    public IsShared: boolean;
    public LunchIncluded: boolean;
    public Name: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class WorkRelation extends UniEntity {
    public static RelativeUrl = 'workrelations';
    public static EntityType = 'WorkRelation';

    public StartDate: Date;
    public ID: number;
    public WorkProfileID: number;
    public CompanyName: string;
    public CompanyID: number;
    public IsPrivate: boolean;
    public TeamID: number;
    public UpdatedBy: string;
    public WorkerID: number;
    public CreatedBy: string;
    public Description: string;
    public WorkPercentage: number;
    public EndTime: Date;
    public IsActive: boolean;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public Deleted: boolean;
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

    public ID: number;
    public UpdatedBy: string;
    public WorkRelationID: number;
    public CreatedBy: string;
    public Description: string;
    public ToDate: Date;
    public RegionKey: string;
    public FromDate: Date;
    public TimeoffType: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public IsHalfDay: boolean;
    public CreatedAt: Date;
    public Deleted: boolean;
    public SystemKey: string;
    public _createguid: string;
    public CustomFields: any;
}


export class WorkType extends UniEntity {
    public static RelativeUrl = 'worktypes';
    public static EntityType = 'WorkType';

    public Price: number;
    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Description: string;
    public WagetypeNumber: number;
    public SystemType: WorkTypeEnum;
    public Name: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public ProductID: number;
    public Deleted: boolean;
    public _createguid: string;
    public Product: Product;
    public CustomFields: any;
}


export class BankFile extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'BankFile';

    public FileID: number;
    public ID: number;
    public ParentFileid: number;
    public SubCompanyID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Accountnumber: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public _createguid: string;
    public File: File;
    public SubCompany: SubCompany;
    public CustomFields: any;
}


export class BatchInvoice extends UniEntity {
    public static RelativeUrl = 'batchinvoices';
    public static EntityType = 'BatchInvoice';

    public Processed: number;
    public Operation: BatchInvoiceOperation;
    public ID: number;
    public FreeTxt: string;
    public NumberOfBatches: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public TotalToProcess: number;
    public NotifyEmail: boolean;
    public OurRef: string;
    public Comment: string;
    public YourRef: string;
    public DueDate: LocalDate;
    public InvoiceDate: LocalDate;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public SellerID: number;
    public Deleted: boolean;
    public MinAmount: number;
    public _createguid: string;
    public ProjectID: number;
    public CustomerID: number;
    public Items: Array<BatchInvoiceItem>;
    public CustomFields: any;
}


export class BatchInvoiceItem extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'BatchInvoiceItem';

    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public BatchInvoiceID: number;
    public CustomerInvoiceID: number;
    public CommentID: number;
    public BatchNumber: number;
    public UpdatedAt: Date;
    public StatusCode: StatusCode;
    public CreatedAt: Date;
    public Deleted: boolean;
    public CustomerOrderID: number;
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

    public ID: number;
    public Template: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public EntityName: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Customer extends UniEntity {
    public static RelativeUrl = 'customers';
    public static EntityType = 'Customer';

    public DefaultCustomerOrderReportID: number;
    public ID: number;
    public CurrencyCodeID: number;
    public AcceptableDelta4CustomerPaymentAccountID: number;
    public IsPrivate: boolean;
    public AvtaleGiroNotification: boolean;
    public ReminderEmailAddress: string;
    public PaymentTermsID: number;
    public UpdatedBy: string;
    public CustomerNumberKidAlias: string;
    public CreatedBy: string;
    public DefaultCustomerInvoiceReportID: number;
    public CustomerNumber: number;
    public SocialSecurityNumber: string;
    public FactoringNumber: number;
    public EfakturaIdentifier: string;
    public AvtaleGiro: boolean;
    public SubAccountNumberSeriesID: number;
    public DontSendReminders: boolean;
    public DefaultDistributionsID: number;
    public CreditDays: number;
    public Localization: string;
    public GLN: string;
    public EInvoiceAgreementReference: string;
    public UpdatedAt: Date;
    public DefaultSellerID: number;
    public CustomerInvoiceReminderSettingsID: number;
    public StatusCode: number;
    public BusinessRelationID: number;
    public CreatedAt: Date;
    public AcceptableDelta4CustomerPayment: number;
    public DeliveryTermsID: number;
    public Deleted: boolean;
    public PeppolAddress: string;
    public DimensionsID: number;
    public WebUrl: string;
    public DefaultCustomerQuoteReportID: number;
    public OrgNumber: string;
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

    public CurrencyExchangeRate: number;
    public DeliveryName: string;
    public CreditedAmountCurrency: number;
    public AccrualID: number;
    public ShippingPostalCode: string;
    public ShippingCountry: string;
    public DistributionPlanID: number;
    public DeliveryTerm: string;
    public UseReportID: number;
    public ShippingAddressLine2: string;
    public ID: number;
    public CurrencyCodeID: number;
    public ShippingAddressLine3: string;
    public RestAmountCurrency: number;
    public RestAmount: number;
    public FreeTxt: string;
    public InvoiceCity: string;
    public PaymentTermsID: number;
    public UpdatedBy: string;
    public PaymentInfoTypeID: number;
    public TaxInclusiveAmount: number;
    public CreatedBy: string;
    public CollectorStatusCode: number;
    public InvoiceCountry: string;
    public VatTotalsAmount: number;
    public CustomerName: string;
    public InvoiceReferenceID: number;
    public UpdateCurrencyAmountsOnDateChange: boolean;
    public InvoiceType: number;
    public VatTotalsAmountCurrency: number;
    public TaxExclusiveAmountCurrency: number;
    public InternalNote: string;
    public InvoiceAddressLine2: string;
    public PrintStatus: number;
    public PaymentDueDate: LocalDate;
    public Requisition: string;
    public DefaultDimensionsID: number;
    public AmountRegards: string;
    public PaymentInformation: string;
    public InvoiceAddressLine1: string;
    public InvoiceCountryCode: string;
    public EmailAddress: string;
    public InvoiceAddressLine3: string;
    public CustomerOrgNumber: string;
    public SupplierOrgNumber: string;
    public CustomerPerson: string;
    public YourReference: string;
    public Payment: string;
    public DontSendReminders: boolean;
    public Comment: string;
    public InvoiceNumber: string;
    public PayableRoundingAmount: number;
    public TaxInclusiveAmountCurrency: number;
    public PaymentTerm: string;
    public ShippingCountryCode: string;
    public CreditDays: number;
    public InvoicePostalCode: string;
    public InvoiceDate: LocalDate;
    public JournalEntryID: number;
    public ExternalReference: string;
    public UpdatedAt: Date;
    public DefaultSellerID: number;
    public InvoiceNumberSeriesID: number;
    public StatusCode: number;
    public CustomerID: number;
    public CreatedAt: Date;
    public Credited: boolean;
    public InvoiceReceiverName: string;
    public DeliveryTermsID: number;
    public SalesPerson: string;
    public OurReference: string;
    public BankAccountID: number;
    public Deleted: boolean;
    public ShippingAddressLine1: string;
    public DeliveryMethod: string;
    public TaxExclusiveAmount: number;
    public CreditedAmount: number;
    public PayableRoundingCurrencyAmount: number;
    public DeliveryDate: LocalDate;
    public PaymentID: string;
    public ShippingCity: string;
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

    public CurrencyExchangeRate: number;
    public Discount: number;
    public PriceSetByUser: boolean;
    public ID: number;
    public CurrencyCodeID: number;
    public PriceExVat: number;
    public VatTypeID: number;
    public InvoicePeriodEndDate: LocalDate;
    public SumTotalExVatCurrency: number;
    public AccountingCost: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public ItemText: string;
    public InvoicePeriodStartDate: LocalDate;
    public DiscountCurrency: number;
    public CustomerInvoiceID: number;
    public ItemSourceID: number;
    public SumTotalIncVatCurrency: number;
    public Comment: string;
    public AccountID: number;
    public Unit: string;
    public SumVat: number;
    public SumVatCurrency: number;
    public UpdatedAt: Date;
    public SumTotalExVat: number;
    public SortIndex: number;
    public StatusCode: number;
    public CreatedAt: Date;
    public PriceIncVat: number;
    public ProductID: number;
    public Deleted: boolean;
    public NumberOfItems: number;
    public CalculateGrossPriceBasedOnNetPrice: boolean;
    public SumTotalIncVat: number;
    public DimensionsID: number;
    public VatPercent: number;
    public CostPrice: number;
    public PriceExVatCurrency: number;
    public DiscountPercent: number;
    public _createguid: string;
    public OrderItemId: number;
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

    public CurrencyExchangeRate: number;
    public DebtCollectionFeeCurrency: number;
    public CreatedByReminderRuleID: number;
    public ID: number;
    public CurrencyCodeID: number;
    public RestAmountCurrency: number;
    public ReminderFeeCurrency: number;
    public RestAmount: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Description: string;
    public ReminderFee: number;
    public RemindedDate: LocalDate;
    public CustomerInvoiceID: number;
    public EmailAddress: string;
    public InterestFee: number;
    public DueDate: LocalDate;
    public Title: string;
    public DebtCollectionFee: number;
    public InterestFeeCurrency: number;
    public ReminderNumber: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public RunNumber: number;
    public Deleted: boolean;
    public DimensionsID: number;
    public Notified: boolean;
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

    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Description: string;
    public MinimumDaysFromDueDate: number;
    public ReminderFee: number;
    public Title: string;
    public CreditDays: number;
    public ReminderNumber: number;
    public UseMaximumLegalReminderFee: boolean;
    public UpdatedAt: Date;
    public CustomerInvoiceReminderSettingsID: number;
    public StatusCode: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public _createguid: string;
    public CustomerInvoiceReminderSettings: CustomerInvoiceReminderSettings;
    public CustomFields: any;
}


export class CustomerInvoiceReminderSettings extends UniEntity {
    public static RelativeUrl = 'invoiceremindersettings';
    public static EntityType = 'CustomerInvoiceReminderSettings';

    public MinimumAmountToRemind: number;
    public RemindersBeforeDebtCollection: number;
    public ID: number;
    public UpdatedBy: string;
    public AcceptPaymentWithoutReminderFee: boolean;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public DebtCollectionSettingsID: number;
    public DefaultReminderFeeAccountID: number;
    public _createguid: string;
    public DebtCollectionSettings: DebtCollectionSettings;
    public DefaultReminderFeeAccount: Account;
    public CustomerInvoiceReminderRules: Array<CustomerInvoiceReminderRule>;
    public CustomFields: any;
}


export class CustomerOrder extends UniEntity {
    public static RelativeUrl = 'orders';
    public static EntityType = 'CustomerOrder';

    public CurrencyExchangeRate: number;
    public DeliveryName: string;
    public AccrualID: number;
    public ShippingPostalCode: string;
    public ShippingCountry: string;
    public DistributionPlanID: number;
    public OrderNumber: number;
    public DeliveryTerm: string;
    public UseReportID: number;
    public ShippingAddressLine2: string;
    public ID: number;
    public CurrencyCodeID: number;
    public ShippingAddressLine3: string;
    public RestAmountCurrency: number;
    public RestExclusiveAmountCurrency: number;
    public FreeTxt: string;
    public OrderNumberSeriesID: number;
    public InvoiceCity: string;
    public PaymentTermsID: number;
    public UpdatedBy: string;
    public PaymentInfoTypeID: number;
    public TaxInclusiveAmount: number;
    public CreatedBy: string;
    public InvoiceCountry: string;
    public VatTotalsAmount: number;
    public CustomerName: string;
    public UpdateCurrencyAmountsOnDateChange: boolean;
    public VatTotalsAmountCurrency: number;
    public TaxExclusiveAmountCurrency: number;
    public InternalNote: string;
    public InvoiceAddressLine2: string;
    public PrintStatus: number;
    public UpdateCurrencyOnToInvoice: boolean;
    public Requisition: string;
    public DefaultDimensionsID: number;
    public InvoiceAddressLine1: string;
    public InvoiceCountryCode: string;
    public EmailAddress: string;
    public InvoiceAddressLine3: string;
    public CustomerOrgNumber: string;
    public SupplierOrgNumber: string;
    public CustomerPerson: string;
    public YourReference: string;
    public Comment: string;
    public PayableRoundingAmount: number;
    public TaxInclusiveAmountCurrency: number;
    public PaymentTerm: string;
    public ShippingCountryCode: string;
    public CreditDays: number;
    public InvoicePostalCode: string;
    public OrderDate: LocalDate;
    public ReadyToInvoice: boolean;
    public UpdatedAt: Date;
    public DefaultSellerID: number;
    public StatusCode: number;
    public CustomerID: number;
    public CreatedAt: Date;
    public InvoiceReceiverName: string;
    public DeliveryTermsID: number;
    public SalesPerson: string;
    public OurReference: string;
    public Deleted: boolean;
    public ShippingAddressLine1: string;
    public DeliveryMethod: string;
    public TaxExclusiveAmount: number;
    public PayableRoundingCurrencyAmount: number;
    public DeliveryDate: LocalDate;
    public ShippingCity: string;
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

    public CurrencyExchangeRate: number;
    public Discount: number;
    public PriceSetByUser: boolean;
    public ID: number;
    public CurrencyCodeID: number;
    public PriceExVat: number;
    public VatTypeID: number;
    public SumTotalExVatCurrency: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public ItemText: string;
    public DiscountCurrency: number;
    public ItemSourceID: number;
    public SumTotalIncVatCurrency: number;
    public Comment: string;
    public AccountID: number;
    public Unit: string;
    public SumVat: number;
    public ReadyToInvoice: boolean;
    public SumVatCurrency: number;
    public UpdatedAt: Date;
    public SumTotalExVat: number;
    public SortIndex: number;
    public StatusCode: number;
    public CreatedAt: Date;
    public PriceIncVat: number;
    public ProductID: number;
    public Deleted: boolean;
    public NumberOfItems: number;
    public CalculateGrossPriceBasedOnNetPrice: boolean;
    public SumTotalIncVat: number;
    public DimensionsID: number;
    public VatPercent: number;
    public CostPrice: number;
    public PriceExVatCurrency: number;
    public CustomerOrderID: number;
    public DiscountPercent: number;
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

    public CurrencyExchangeRate: number;
    public DeliveryName: string;
    public QuoteNumberSeriesID: number;
    public ShippingPostalCode: string;
    public ShippingCountry: string;
    public DistributionPlanID: number;
    public DeliveryTerm: string;
    public UseReportID: number;
    public ShippingAddressLine2: string;
    public ID: number;
    public CurrencyCodeID: number;
    public ShippingAddressLine3: string;
    public FreeTxt: string;
    public InvoiceCity: string;
    public QuoteDate: LocalDate;
    public PaymentTermsID: number;
    public UpdatedBy: string;
    public PaymentInfoTypeID: number;
    public TaxInclusiveAmount: number;
    public UpdateCurrencyOnToOrder: boolean;
    public CreatedBy: string;
    public InvoiceCountry: string;
    public VatTotalsAmount: number;
    public CustomerName: string;
    public UpdateCurrencyAmountsOnDateChange: boolean;
    public VatTotalsAmountCurrency: number;
    public TaxExclusiveAmountCurrency: number;
    public InternalNote: string;
    public InvoiceAddressLine2: string;
    public QuoteNumber: number;
    public PrintStatus: number;
    public UpdateCurrencyOnToInvoice: boolean;
    public Requisition: string;
    public DefaultDimensionsID: number;
    public InvoiceAddressLine1: string;
    public InvoiceCountryCode: string;
    public EmailAddress: string;
    public InvoiceAddressLine3: string;
    public CustomerOrgNumber: string;
    public SupplierOrgNumber: string;
    public CustomerPerson: string;
    public YourReference: string;
    public Comment: string;
    public PayableRoundingAmount: number;
    public TaxInclusiveAmountCurrency: number;
    public PaymentTerm: string;
    public ShippingCountryCode: string;
    public CreditDays: number;
    public InvoicePostalCode: string;
    public UpdatedAt: Date;
    public DefaultSellerID: number;
    public StatusCode: number;
    public InquiryReference: number;
    public CustomerID: number;
    public ValidUntilDate: LocalDate;
    public CreatedAt: Date;
    public InvoiceReceiverName: string;
    public DeliveryTermsID: number;
    public SalesPerson: string;
    public OurReference: string;
    public Deleted: boolean;
    public ShippingAddressLine1: string;
    public DeliveryMethod: string;
    public TaxExclusiveAmount: number;
    public PayableRoundingCurrencyAmount: number;
    public DeliveryDate: LocalDate;
    public ShippingCity: string;
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

    public CurrencyExchangeRate: number;
    public Discount: number;
    public PriceSetByUser: boolean;
    public ID: number;
    public CurrencyCodeID: number;
    public PriceExVat: number;
    public VatTypeID: number;
    public SumTotalExVatCurrency: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public ItemText: string;
    public DiscountCurrency: number;
    public SumTotalIncVatCurrency: number;
    public Comment: string;
    public CustomerQuoteID: number;
    public AccountID: number;
    public Unit: string;
    public SumVat: number;
    public SumVatCurrency: number;
    public UpdatedAt: Date;
    public SumTotalExVat: number;
    public SortIndex: number;
    public StatusCode: number;
    public CreatedAt: Date;
    public PriceIncVat: number;
    public ProductID: number;
    public Deleted: boolean;
    public NumberOfItems: number;
    public CalculateGrossPriceBasedOnNetPrice: boolean;
    public SumTotalIncVat: number;
    public DimensionsID: number;
    public VatPercent: number;
    public CostPrice: number;
    public PriceExVatCurrency: number;
    public DiscountPercent: number;
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

    public CreditorNumber: number;
    public ID: number;
    public IntegrateWithDebtCollection: boolean;
    public UpdatedBy: string;
    public CreatedBy: string;
    public DebtCollectionAutomationID: number;
    public UpdatedAt: Date;
    public CustomerInvoiceReminderSettingsID: number;
    public StatusCode: number;
    public CreatedAt: Date;
    public DebtCollectionFormat: number;
    public Deleted: boolean;
    public _createguid: string;
    public DebtCollectionAutomation: Array<DebtCollectionAutomation>;
    public CustomerInvoiceReminderSettings: CustomerInvoiceReminderSettings;
    public CustomFields: any;
}


export class ItemSource extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ItemSource';

    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public _createguid: string;
    public Details: Array<ItemSourceDetail>;
    public CustomFields: any;
}


export class ItemSourceDetail extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ItemSourceDetail';

    public ID: number;
    public SourceFK: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Description: string;
    public ItemSourceID: number;
    public Amount: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public Tag: string;
    public SourceType: string;
    public _createguid: string;
    public CustomFields: any;
}


export class PaymentInfoType extends UniEntity {
    public static RelativeUrl = 'paymentinfotype';
    public static EntityType = 'PaymentInfoType';

    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Locked: boolean;
    public Type: PaymentInfoTypeEnum;
    public Control: Modulus;
    public Name: string;
    public Length: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public _createguid: string;
    public PaymentInfoTypeParts: Array<PaymentInfoTypePart>;
    public CustomFields: any;
}


export class PaymentInfoTypePart extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'PaymentInfoTypePart';

    public ID: number;
    public Part: string;
    public UpdatedBy: string;
    public PaymentInfoTypeID: number;
    public CreatedBy: string;
    public Length: number;
    public UpdatedAt: Date;
    public SortIndex: number;
    public StatusCode: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class RecurringInvoice extends UniEntity {
    public static RelativeUrl = 'recurringinvoices';
    public static EntityType = 'RecurringInvoice';

    public CurrencyExchangeRate: number;
    public DeliveryName: string;
    public TimePeriod: RecurringPeriod;
    public StartDate: LocalDate;
    public ShippingPostalCode: string;
    public ShippingCountry: string;
    public DistributionPlanID: number;
    public DeliveryTerm: string;
    public UseReportID: number;
    public ShippingAddressLine2: string;
    public ID: number;
    public CurrencyCodeID: number;
    public NotifyUser: string;
    public ShippingAddressLine3: string;
    public FreeTxt: string;
    public InvoiceCity: string;
    public PaymentTermsID: number;
    public UpdatedBy: string;
    public PaymentInfoTypeID: number;
    public TaxInclusiveAmount: number;
    public CreatedBy: string;
    public InvoiceCountry: string;
    public VatTotalsAmount: number;
    public CustomerName: string;
    public UpdateCurrencyAmountsOnDateChange: boolean;
    public VatTotalsAmountCurrency: number;
    public TaxExclusiveAmountCurrency: number;
    public InternalNote: string;
    public InvoiceAddressLine2: string;
    public PrintStatus: number;
    public NoCreditDays: boolean;
    public Requisition: string;
    public DefaultDimensionsID: number;
    public AmountRegards: string;
    public PaymentInformation: string;
    public InvoiceAddressLine1: string;
    public PreparationDays: number;
    public InvoiceCountryCode: string;
    public EmailAddress: string;
    public InvoiceAddressLine3: string;
    public CustomerOrgNumber: string;
    public SupplierOrgNumber: string;
    public ProduceAs: RecurringResult;
    public CustomerPerson: string;
    public YourReference: string;
    public Payment: string;
    public Comment: string;
    public PayableRoundingAmount: number;
    public TaxInclusiveAmountCurrency: number;
    public PaymentTerm: string;
    public ShippingCountryCode: string;
    public CreditDays: number;
    public InvoicePostalCode: string;
    public NotifyWhenOrdersArePrepared: boolean;
    public UpdatedAt: Date;
    public DefaultSellerID: number;
    public InvoiceNumberSeriesID: number;
    public StatusCode: number;
    public NextInvoiceDate: LocalDate;
    public CustomerID: number;
    public CreatedAt: Date;
    public MaxIterations: number;
    public InvoiceReceiverName: string;
    public DeliveryTermsID: number;
    public SalesPerson: string;
    public OurReference: string;
    public EndDate: LocalDate;
    public Deleted: boolean;
    public ShippingAddressLine1: string;
    public DeliveryMethod: string;
    public TaxExclusiveAmount: number;
    public PayableRoundingCurrencyAmount: number;
    public DeliveryDate: LocalDate;
    public NotifyWhenRecurringEnds: boolean;
    public Interval: number;
    public ShippingCity: string;
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

    public CurrencyExchangeRate: number;
    public Discount: number;
    public PriceSetByUser: boolean;
    public ID: number;
    public CurrencyCodeID: number;
    public PriceExVat: number;
    public VatTypeID: number;
    public PricingSource: PricingSource;
    public SumTotalExVatCurrency: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public ItemText: string;
    public DiscountCurrency: number;
    public RecurringInvoiceID: number;
    public SumTotalIncVatCurrency: number;
    public Comment: string;
    public ReduceIncompletePeriod: boolean;
    public AccountID: number;
    public Unit: string;
    public SumVat: number;
    public TimeFactor: RecurringPeriod;
    public SumVatCurrency: number;
    public UpdatedAt: Date;
    public SumTotalExVat: number;
    public SortIndex: number;
    public StatusCode: number;
    public CreatedAt: Date;
    public PriceIncVat: number;
    public ProductID: number;
    public Deleted: boolean;
    public NumberOfItems: number;
    public CalculateGrossPriceBasedOnNetPrice: boolean;
    public SumTotalIncVat: number;
    public DimensionsID: number;
    public VatPercent: number;
    public PriceExVatCurrency: number;
    public DiscountPercent: number;
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

    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public OrderID: number;
    public RecurringInvoiceID: number;
    public Comment: string;
    public CreationDate: LocalDate;
    public NotifiedOrdersPrepared: boolean;
    public InvoiceDate: LocalDate;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public InvoiceID: number;
    public Deleted: boolean;
    public IterationNumber: number;
    public NotifiedRecurringEnds: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class Seller extends UniEntity {
    public static RelativeUrl = 'sellers';
    public static EntityType = 'Seller';

    public ID: number;
    public UserID: number;
    public TeamID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public DefaultDimensionsID: number;
    public Name: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public EmployeeID: number;
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

    public ID: number;
    public Percent: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CustomerInvoiceID: number;
    public RecurringInvoiceID: number;
    public Amount: number;
    public CustomerQuoteID: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CustomerID: number;
    public CreatedAt: Date;
    public SellerID: number;
    public Deleted: boolean;
    public CustomerOrderID: number;
    public _createguid: string;
    public Seller: Seller;
    public CustomFields: any;
}


export class SubCompany extends UniEntity {
    public static RelativeUrl = 'subcompanies';
    public static EntityType = 'SubCompany';

    public ID: number;
    public CompanyName: string;
    public CompanyID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CompanyKey: string;
    public CompanyType: CompanyRelation;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CustomerID: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public _createguid: string;
    public Customer: Customer;
    public CustomFields: any;
}


export class Supplier extends UniEntity {
    public static RelativeUrl = 'suppliers';
    public static EntityType = 'Supplier';

    public ID: number;
    public CurrencyCodeID: number;
    public SupplierNumber: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public SelfEmployed: boolean;
    public CostAllocationID: number;
    public SubAccountNumberSeriesID: number;
    public CreditDays: number;
    public Localization: string;
    public GLN: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public BusinessRelationID: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public PeppolAddress: string;
    public DimensionsID: number;
    public WebUrl: string;
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

    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Description: string;
    public CreditDays: number;
    public Name: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public TermsType: TermsType;
    public Deleted: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class TOFCurrencySettings extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'TOFCurrencySettings';

    public UpdateCurrencyAmountsOnQuoteToOrder: boolean;
    public UpdateCurrencyAmountsOnQuoteToInvoice: boolean;
    public UpdateCurrencyAmountsOnOrderToInvoice: boolean;
    public ID: number;
    public UpdateCurrencyAmountsOnInvoicedateChange: boolean;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdateCurrencyAmountsOnOrderdateChange: boolean;
    public UpdateCurrencyAmountsOnQuotedateChange: boolean;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class Address extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Address';

    public AddressLine2: string;
    public City: string;
    public ID: number;
    public UpdatedBy: string;
    public CountryCode: string;
    public CreatedBy: string;
    public AddressLine3: string;
    public Country: string;
    public PostalCode: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public BusinessRelationID: number;
    public CreatedAt: Date;
    public AddressLine1: string;
    public Deleted: boolean;
    public Region: string;
    public _createguid: string;
    public BusinessRelation: BusinessRelation;
    public CustomFields: any;
}


export class BusinessRelation extends UniEntity {
    public static RelativeUrl = 'business-relations';
    public static EntityType = 'BusinessRelation';

    public InvoiceAddressID: number;
    public ID: number;
    public UpdatedBy: string;
    public DefaultBankAccountID: number;
    public CreatedBy: string;
    public ShippingAddressID: number;
    public DefaultContactID: number;
    public Name: string;
    public DefaultEmailID: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public DefaultPhoneID: number;
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

    public ID: number;
    public ParentBusinessRelationID: number;
    public InfoID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Comment: string;
    public Role: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public _createguid: string;
    public ParentBusinessRelation: BusinessRelation;
    public Info: BusinessRelation;
    public CustomFields: any;
}


export class Email extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Email';

    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Description: string;
    public EmailAddress: string;
    public Type: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public BusinessRelationID: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class Phone extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Phone';

    public Number: string;
    public ID: number;
    public UpdatedBy: string;
    public CountryCode: string;
    public CreatedBy: string;
    public Description: string;
    public Type: PhoneTypeEnum;
    public UpdatedAt: Date;
    public StatusCode: number;
    public BusinessRelationID: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class AGACalculation extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AGACalculation';

    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public PayrollRunID: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public DimensionsID: number;
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

    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public SubEntityID: number;
    public UpdatedAt: Date;
    public freeAmount: number;
    public StatusCode: number;
    public CreatedAt: Date;
    public AGACalculationID: number;
    public Deleted: boolean;
    public _createguid: string;
    public subEntity: SubEntity;
    public CustomFields: any;
}


export class AGATax extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AGATax';

    public beregningsKode: number;
    public ID: number;
    public agaRate: number;
    public agaBase: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public AGARateID: number;
    public SubEntityID: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public AGACalculationID: number;
    public zone: number;
    public Deleted: boolean;
    public zoneName: string;
    public _createguid: string;
    public municipalityName: string;
    public subEntity: SubEntity;
    public CustomFields: any;
}


export class AGAPension extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AGAPension';

    public beregningsKode: number;
    public ID: number;
    public agaRate: number;
    public agaBase: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public AGARateID: number;
    public SubEntityID: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public AGACalculationID: number;
    public zone: number;
    public Deleted: boolean;
    public zoneName: string;
    public _createguid: string;
    public municipalityName: string;
    public subEntity: SubEntity;
    public CustomFields: any;
}


export class AGADraw extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AGADraw';

    public beregningsKode: number;
    public ID: number;
    public agaRate: number;
    public agaBase: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public AGARateID: number;
    public SubEntityID: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public AGACalculationID: number;
    public zone: number;
    public Deleted: boolean;
    public zoneName: string;
    public _createguid: string;
    public municipalityName: string;
    public subEntity: SubEntity;
    public CustomFields: any;
}


export class ForeignerWithPercent extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ForeignerWithPercent';

    public ID: number;
    public agaRate: number;
    public agaBase: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public SubEntityID: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public AGACalculationID: number;
    public Deleted: boolean;
    public zoneName: string;
    public _createguid: string;
    public municipalityName: string;
    public subEntity: SubEntity;
    public CustomFields: any;
}


export class DrawForeignerWithPercent extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'DrawForeignerWithPercent';

    public ID: number;
    public agaRate: number;
    public agaBase: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public SubEntityID: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public AGACalculationID: number;
    public Deleted: boolean;
    public zoneName: string;
    public _createguid: string;
    public municipalityName: string;
    public subEntity: SubEntity;
    public CustomFields: any;
}


export class ForeignerWithAmount extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ForeignerWithAmount';

    public ID: number;
    public persons: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public aga: number;
    public SubEntityID: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public AGACalculationID: number;
    public Deleted: boolean;
    public zoneName: string;
    public _createguid: string;
    public municipalityName: string;
    public subEntity: SubEntity;
    public CustomFields: any;
}


export class TaxAndAgaSums extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'TaxAndAgaSums';

    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public WithholdingTax: number;
    public FinancialTax: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class AmeldingData extends UniEntity {
    public static RelativeUrl = 'amelding';
    public static EntityType = 'AmeldingData';

    public sent: Date;
    public ID: number;
    public year: number;
    public created: Date;
    public UpdatedBy: string;
    public feedbackFileID: number;
    public CreatedBy: string;
    public status: number;
    public PayrollRunID: number;
    public mainFileID: number;
    public receiptID: number;
    public type: AmeldingType;
    public initiated: Date;
    public messageID: string;
    public attachmentFileID: number;
    public replacesID: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public altinnStatus: string;
    public OppgaveHash: string;
    public period: number;
    public replaceThis: string;
    public _createguid: string;
    public xmlValidationErrors: string;
    public log: Array<AmeldingLog>;
    public CustomFields: any;
}


export class AmeldingLog extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AmeldingLog';

    public registry: SalaryRegistry;
    public ID: number;
    public UpdatedBy: string;
    public key: number;
    public CreatedBy: string;
    public AmeldingsID: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class BasicAmount extends UniEntity {
    public static RelativeUrl = 'basicamounts';
    public static EntityType = 'BasicAmount';

    public ID: number;
    public AveragePrYear: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public BasicAmountPrMonth: number;
    public FromDate: Date;
    public BasicAmountPrYear: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public ConversionFactor: number;
    public Deleted: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class CompanySalary extends UniEntity {
    public static RelativeUrl = 'companysalary';
    public static EntityType = 'CompanySalary';

    public MainAccountAllocatedFinancialVacation: number;
    public ID: number;
    public Base_NettoPayment: boolean;
    public MainAccountAllocatedAGA: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public RateFinancialTax: number;
    public WagetypeAdvancePayment: number;
    public Base_SpesialDeductionForMaritim: boolean;
    public MainAccountCostAGAVacation: number;
    public WageDeductionDueToHoliday: WageDeductionDueToHolidayType;
    public Base_JanMayenAndBiCountries: boolean;
    public MainAccountCostFinancial: number;
    public Base_PayAsYouEarnTaxOnPensions: boolean;
    public HoursPerMonth: number;
    public PaymentInterval: CompanySalaryPaymentInterval;
    public MainAccountAllocatedVacation: number;
    public HourFTEs: number;
    public Base_TaxFreeOrganization: boolean;
    public PostGarnishmentToTaxAccount: boolean;
    public MainAccountCostFinancialVacation: number;
    public WagetypeAdvancePaymentAuto: number;
    public MainAccountCostAGA: number;
    public Base_Svalbard: boolean;
    public UpdatedAt: Date;
    public FreeAmount: number;
    public MainAccountAllocatedFinancial: number;
    public StatusCode: number;
    public Base_NettoPaymentForMaritim: boolean;
    public PostToTaxDraw: boolean;
    public CreatedAt: Date;
    public Deleted: boolean;
    public PaycheckZipReportID: number;
    public InterrimRemitAccount: number;
    public AllowOver6G: boolean;
    public MainAccountAllocatedAGAVacation: number;
    public MainAccountCostVacation: number;
    public OtpExportActive: boolean;
    public CalculateFinancialTax: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class CompanyVacationRate extends UniEntity {
    public static RelativeUrl = 'companyvacationrates';
    public static EntityType = 'CompanyVacationRate';

    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Rate: number;
    public FromDate: Date;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public Rate60: number;
    public _createguid: string;
    public CustomFields: any;
}


export class EmployeeCategory extends UniEntity {
    public static RelativeUrl = 'employeecategories';
    public static EntityType = 'EmployeeCategory';

    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public EmployeeCategoryLinkID: number;
    public Name: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class EmployeeCategoryLink extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'EmployeeCategoryLink';

    public EmployeeNumber: number;
    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public EmployeeCategoryID: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public EmployeeID: number;
    public _createguid: string;
    public EmployeeCategory: EmployeeCategory;
    public Employee: Employee;
    public CustomFields: any;
}


export class Employee extends UniEntity {
    public static RelativeUrl = 'employees';
    public static EntityType = 'Employee';

    public EmployeeNumber: number;
    public ID: number;
    public OtpExport: boolean;
    public UserID: number;
    public EmployeeLanguageID: number;
    public EndDateOtp: LocalDate;
    public BirthDate: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public EmploymentDate: Date;
    public EmploymentDateOtp: LocalDate;
    public SocialSecurityNumber: string;
    public Active: boolean;
    public AdvancePaymentAmount: number;
    public ForeignWorker: ForeignWorker;
    public MunicipalityNo: string;
    public IncludeOtpUntilYear: number;
    public SubEntityID: number;
    public PaymentInterval: PaymentInterval;
    public FreeText: string;
    public InternasjonalIDCountry: string;
    public UpdatedAt: Date;
    public OtpStatus: OtpStatus;
    public PhotoID: number;
    public StatusCode: number;
    public BusinessRelationID: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public InternasjonalIDType: InternationalIDType;
    public InternationalID: string;
    public TypeOfPaymentOtp: TypeOfPaymentOtp;
    public Sex: GenderEnum;
    public IncludeOtpUntilMonth: number;
    public _createguid: string;
    public BusinessRelationInfo: BusinessRelation;
    public Employments: Array<Employment>;
    public VacationRateEmployees: Array<VacationRateEmployee>;
    public SubEntity: SubEntity;
    public TaxCards: Array<EmployeeTaxCard>;
    public CustomFields: any;
}


export class EmployeeTaxCard extends UniEntity {
    public static RelativeUrl = 'taxcards';
    public static EntityType = 'EmployeeTaxCard';

    public SecondaryPercent: number;
    public EmployeeNumber: number;
    public ID: number;
    public pensjonID: number;
    public Year: number;
    public NotMainEmployer: boolean;
    public Percent: number;
    public loennFraBiarbeidsgiverID: number;
    public Tilleggsopplysning: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public NonTaxableAmount: number;
    public TaxcardId: number;
    public ResultatStatus: string;
    public Table: string;
    public ufoereYtelserAndreID: number;
    public IssueDate: Date;
    public SecondaryTable: string;
    public loennKunTrygdeavgiftTilUtenlandskBorgerSomGrensegjengerID: number;
    public SKDXml: string;
    public loennKunTrygdeavgiftTilUtenlandskBorgerID: number;
    public loennTilUtenrikstjenestemannID: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public loennFraHovedarbeidsgiverID: number;
    public Deleted: boolean;
    public EmployeeID: number;
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

    public ID: number;
    public AntallMaanederForTrekk: number;
    public Percent: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public NonTaxableAmount: number;
    public Table: string;
    public freeAmountType: FreeAmountType;
    public tabellType: TabellType;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class EmployeeLeave extends UniEntity {
    public static RelativeUrl = 'EmployeeLeave';
    public static EntityType = 'EmployeeLeave';

    public ID: number;
    public EmploymentID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Description: string;
    public AffectsOtp: boolean;
    public LeavePercent: number;
    public LeaveType: Leavetype;
    public ToDate: Date;
    public FromDate: Date;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public _createguid: string;
    public Employment: Employment;
    public CustomFields: any;
}


export class Employment extends UniEntity {
    public static RelativeUrl = 'employments';
    public static EntityType = 'Employment';

    public WorkingHoursScheme: WorkingHoursScheme;
    public EmployeeNumber: number;
    public StartDate: Date;
    public HoursPerWeek: number;
    public ID: number;
    public LastSalaryChangeDate: Date;
    public ShipType: ShipTypeOfShip;
    public TradeArea: ShipTradeArea;
    public UpdatedBy: string;
    public HourRate: number;
    public CreatedBy: string;
    public SeniorityDate: Date;
    public ShipReg: ShipRegistry;
    public RemunerationType: RemunerationType;
    public JobCode: string;
    public LastWorkPercentChangeDate: Date;
    public RegulativeStepNr: number;
    public RegulativeGroupID: number;
    public UserDefinedRate: number;
    public MonthRate: number;
    public TypeOfEmployment: TypeOfEmployment;
    public WorkPercent: number;
    public PayGrade: string;
    public SubEntityID: number;
    public Standard: boolean;
    public UpdatedAt: Date;
    public JobName: string;
    public StatusCode: number;
    public LedgerAccount: string;
    public CreatedAt: Date;
    public EndDate: Date;
    public Deleted: boolean;
    public EmployeeID: number;
    public DimensionsID: number;
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

    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Description: string;
    public Amount: number;
    public SubentityID: number;
    public FromDate: Date;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public AffectsAGA: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class OtpExportWagetype extends UniEntity {
    public static RelativeUrl = 'otpexportwagetypes';
    public static EntityType = 'OtpExportWagetype';

    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public WageTypeNumber: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class PayrollRun extends UniEntity {
    public static RelativeUrl = 'payrollrun';
    public static EntityType = 'PayrollRun';

    public ID: number;
    public HolidayPayDeduction: boolean;
    public PayDate: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Description: string;
    public needsRecalc: boolean;
    public ToDate: Date;
    public JournalEntryNumber: string;
    public AGAonRun: number;
    public ExcludeRecurringPosts: boolean;
    public FromDate: Date;
    public PaycheckFileID: number;
    public FreeText: string;
    public UpdatedAt: Date;
    public SettlementDate: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public AGAFreeAmount: number;
    public Deleted: boolean;
    public taxdrawfactor: TaxDrawFactor;
    public _createguid: string;
    public transactions: Array<SalaryTransaction>;
    public agacalculation: Array<AGACalculation>;
    public CustomFields: any;
}


export class PayrollRunCategoryLink extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'PayrollRunCategoryLink';

    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public PayrollRunID: number;
    public EmployeeCategoryID: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public _createguid: string;
    public EmployeeCategory: EmployeeCategory;
    public PayrollRun: PayrollRun;
    public CustomFields: any;
}


export class PostingSummaryDraft extends UniEntity {
    public statusTime: Date;
    public ID: number;
    public JobInfoID: number;
    public PayrollID: number;
    public status: SummaryJobStatus;
    public draftWithDimsOnBalance: string;
    public draftBasic: string;
    public draftWithDims: string;
}


export class Regulative extends UniEntity {
    public static RelativeUrl = 'regulatives';
    public static EntityType = 'Regulative';

    public StartDate: LocalDate;
    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public RegulativeGroupID: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public _createguid: string;
    public Steps: Array<RegulativeStep>;
    public CustomFields: any;
}


export class RegulativeGroup extends UniEntity {
    public static RelativeUrl = 'regulativegroups';
    public static EntityType = 'RegulativeGroup';

    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Name: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public _createguid: string;
    public Regulatives: Array<Regulative>;
    public CustomFields: any;
}


export class RegulativeStep extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'RegulativeStep';

    public ID: number;
    public RegulativeID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Amount: number;
    public Step: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class SalaryBalance extends UniEntity {
    public static RelativeUrl = 'salarybalances';
    public static EntityType = 'SalaryBalance';

    public CreatePayment: boolean;
    public ID: number;
    public EmploymentID: number;
    public SalaryBalanceTemplateID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public WageTypeNumber: number;
    public InstalmentPercent: number;
    public ToDate: Date;
    public MaxAmount: number;
    public Type: SalBalDrawType;
    public Instalment: number;
    public Source: SalBalSource;
    public KID: string;
    public Name: string;
    public FromDate: Date;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public InstalmentType: SalBalType;
    public Deleted: boolean;
    public EmployeeID: number;
    public MinAmount: number;
    public SupplierID: number;
    public _createguid: string;
    public Amount: number;
    public Balance: number;
    public CalculatedBalance: number;
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
    public ID: number;
    public Date: LocalDate;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Description: string;
    public Amount: number;
    public SalaryTransactionID: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public _createguid: string;
    public SalaryTransaction: SalaryTransaction;
    public SalaryBalance: SalaryBalance;
    public CustomFields: any;
}


export class SalaryBalanceTemplate extends UniEntity {
    public static RelativeUrl = 'salarybalancetemplates';
    public static EntityType = 'SalaryBalanceTemplate';

    public CreatePayment: boolean;
    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public WageTypeNumber: number;
    public InstalmentPercent: number;
    public MaxAmount: number;
    public Instalment: number;
    public KID: string;
    public Name: string;
    public SalarytransactionDescription: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public InstalmentType: SalBalType;
    public Deleted: boolean;
    public Account: number;
    public MinAmount: number;
    public SupplierID: number;
    public _createguid: string;
    public Supplier: Supplier;
    public SalaryBalances: Array<SalaryBalance>;
    public CustomFields: any;
}


export class SalaryTransaction extends UniEntity {
    public static RelativeUrl = 'salarytrans';
    public static EntityType = 'SalaryTransaction';

    public SalaryBalanceID: number;
    public EmployeeNumber: number;
    public ID: number;
    public HolidayPayDeduction: boolean;
    public VatTypeID: number;
    public EmploymentID: number;
    public WageTypeID: number;
    public UpdatedBy: string;
    public recurringPostValidFrom: Date;
    public CreatedBy: string;
    public IsRecurringPost: boolean;
    public PayrollRunID: number;
    public WageTypeNumber: number;
    public Sum: number;
    public SystemType: StdSystemType;
    public Amount: number;
    public ToDate: Date;
    public TaxbasisID: number;
    public Rate: number;
    public calcAGA: number;
    public MunicipalityNo: string;
    public ChildSalaryTransactionID: number;
    public RecurringID: number;
    public recurringPostValidTo: Date;
    public FromDate: Date;
    public Text: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public EmployeeID: number;
    public DimensionsID: number;
    public Account: number;
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

    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public ValueBool: boolean;
    public ValueDate2: Date;
    public ValueString: string;
    public ValueMoney: number;
    public ValueDate: Date;
    public SalaryTransactionID: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public WageTypeSupplementID: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public _createguid: string;
    public WageTypeSupplement: WageTypeSupplement;
    public CustomFields: any;
}


export class SalaryYear extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'SalaryYear';

    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CurrentYear: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class SubEntity extends UniEntity {
    public static RelativeUrl = 'subentities';
    public static EntityType = 'SubEntity';

    public ID: number;
    public AgaRule: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public AgaZone: number;
    public MunicipalityNo: string;
    public UpdatedAt: Date;
    public freeAmount: number;
    public StatusCode: number;
    public BusinessRelationID: number;
    public CreatedAt: Date;
    public SuperiorOrganizationID: number;
    public Deleted: boolean;
    public OrgNumber: string;
    public _createguid: string;
    public BusinessRelationInfo: BusinessRelation;
    public SuperiorOrganization: SubEntity;
    public CustomFields: any;
}


export class TaxBasis extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'TaxBasis';

    public PensionBasis: number;
    public Basis: number;
    public ID: number;
    public SvalbardBasis: number;
    public ForeignBorderCommuterBasis: number;
    public UpdatedBy: string;
    public ForeignCitizenInsuranceBasis: number;
    public CreatedBy: string;
    public SailorBasis: number;
    public PensionSourcetaxBasis: number;
    public JanMayenBasis: number;
    public DisabilityOtherBasis: number;
    public SalaryTransactionID: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class Travel extends UniEntity {
    public static RelativeUrl = 'travels';
    public static EntityType = 'Travel';

    public PersonID: string;
    public EmployeeNumber: number;
    public State: state;
    public ID: number;
    public TravelIdentificator: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Description: string;
    public Purpose: string;
    public Phone: string;
    public Comment: string;
    public Name: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public DimensionsID: number;
    public Email: string;
    public SourceSystem: string;
    public SupplierID: number;
    public _createguid: string;
    public AdvanceAmount: number;
    public TravelLines: Array<TravelLine>;
    public Dimensions: Dimensions;
    public CustomFields: any;
}


export class TravelLine extends UniEntity {
    public static RelativeUrl = 'travellines';
    public static EntityType = 'TravelLine';

    public To: Date;
    public ID: number;
    public VatTypeID: number;
    public TravelIdentificator: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public InvoiceAccount: number;
    public Description: string;
    public AccountNumber: number;
    public From: Date;
    public Amount: number;
    public CostType: costtype;
    public Rate: number;
    public paytransID: number;
    public UpdatedAt: Date;
    public TypeID: number;
    public StatusCode: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public DimensionsID: number;
    public TravelID: number;
    public LineState: linestate;
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

    public ID: number;
    public UpdatedBy: string;
    public ForeignDescription: string;
    public CreatedBy: string;
    public InvoiceAccount: number;
    public Description: string;
    public WageTypeNumber: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public ForeignTypeID: string;
    public _createguid: string;
    public CustomFields: any;
}


export class VacationPayLine extends UniEntity {
    public static RelativeUrl = 'VacationPayLines';
    public static EntityType = 'VacationPayLine';

    public ID: number;
    public Year: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public ManualVacationPayBase: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public EmployeeID: number;
    public VacationPay: number;
    public PaidTaxFreeVacationPay: number;
    public VacationPay60: number;
    public _createguid: string;
    public MissingEarlierVacationPay: number;
    public Withdrawal: number;
    public Rate: number;
    public Age: number;
    public SystemVacationPayBase: number;
    public Rate60: number;
    public PaidVacationPay: number;
    public Employee: Employee;
    public CustomFields: any;
}


export class VacationRateEmployee extends UniEntity {
    public static RelativeUrl = 'employeevacationrates';
    public static EntityType = 'VacationRateEmployee';

    public StartDate: Date;
    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Rate: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public EndDate: Date;
    public Deleted: boolean;
    public EmployeeID: number;
    public Rate60: number;
    public _createguid: string;
    public CustomFields: any;
}


export class WageType extends UniEntity {
    public static RelativeUrl = 'wagetypes';
    public static EntityType = 'WageType';

    public Base_div3: boolean;
    public StandardWageTypeFor: StdWageType;
    public IncomeType: string;
    public ID: number;
    public ValidYear: number;
    public RateFactor: number;
    public Base_EmploymentTax: boolean;
    public UpdatedBy: string;
    public CreatedBy: string;
    public NoNumberOfHours: boolean;
    public Description: string;
    public RatetypeColumn: RateTypeColumn;
    public Limit_type: LimitType;
    public AccountNumber: number;
    public Limit_value: number;
    public Limit_newRate: number;
    public WageTypeNumber: number;
    public FixedSalaryHolidayDeduction: boolean;
    public SpecialTaxAndContributionsRule: SpecialTaxAndContributionsRule;
    public Systemtype: string;
    public Base_Payment: boolean;
    public HideFromPaycheck: boolean;
    public AccountNumber_balance: number;
    public Postnr: string;
    public GetRateFrom: GetRateFrom;
    public SpecialAgaRule: SpecialAgaRule;
    public Rate: number;
    public SpecialTaxHandling: string;
    public WageTypeName: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public SystemRequiredWageType: number;
    public CreatedAt: Date;
    public Limit_WageTypeNumber: number;
    public Base_div2: boolean;
    public Deleted: boolean;
    public Benefit: string;
    public DaysOnBoard: boolean;
    public taxtype: TaxType;
    public Base_Vacation: boolean;
    public SupplementPackage: string;
    public _createguid: string;
    public SupplementaryInformations: Array<WageTypeSupplement>;
    public CustomFields: any;
}


export class WageTypeSupplement extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'WageTypeSupplement';

    public ID: number;
    public SuggestedValue: string;
    public WageTypeID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Description: string;
    public GetValueFromTrans: boolean;
    public ValueType: Valuetype;
    public Name: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public ameldingType: string;
    public Deleted: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class WageTypeTranslation extends UniEntity {
    public static RelativeUrl = 'wagetypetranslations';
    public static EntityType = 'WageTypeTranslation';

    public ID: number;
    public EmployeeLanguageID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public WageTypeNumber: number;
    public WageTypeName: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public _createguid: string;
    public EmployeeLanguage: EmployeeLanguage;
    public CustomFields: any;
}


export class EmployeeLanguage extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'EmployeeLanguage';

    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public LanguageCode: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class ComponentLayout extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ComponentLayout';

    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Name: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public BaseEntity: string;
    public Deleted: boolean;
    public _createguid: string;
    public Fields: Array<FieldLayout>;
    public CustomFields: any;
}


export class FieldLayout extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'FieldLayout';

    public FieldSet: number;
    public Label: string;
    public ID: number;
    public Alignment: Alignment;
    public Property: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Description: string;
    public HelpText: string;
    public Placement: number;
    public Combo: number;
    public LookupField: boolean;
    public DisplayField: string;
    public EntityType: string;
    public ReadOnly: boolean;
    public Options: string;
    public Width: string;
    public LineBreak: boolean;
    public Legend: string;
    public Placeholder: string;
    public ComponentLayoutID: number;
    public FieldType: FieldType;
    public UpdatedAt: Date;
    public Hidden: boolean;
    public StatusCode: number;
    public CreatedAt: Date;
    public Section: number;
    public Deleted: boolean;
    public Sectionheader: string;
    public _createguid: string;
    public CustomFields: any;
}


export class CurrencyOverride extends UniEntity {
    public static RelativeUrl = 'currencyoverrides';
    public static EntityType = 'CurrencyOverride';

    public FromCurrencyCodeID: number;
    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public ToCurrencyCodeID: number;
    public ToDate: LocalDate;
    public Source: CurrencySourceEnum;
    public FromDate: LocalDate;
    public UpdatedAt: Date;
    public ExchangeRate: number;
    public Factor: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public _createguid: string;
    public FromCurrencyCode: CurrencyCode;
    public ToCurrencyCode: CurrencyCode;
    public CustomFields: any;
}


export class AccountAssetGroup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AccountAssetGroup';

    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public ToAccountNumber: number;
    public AssetGroupCode: string;
    public FromAccountNumber: number;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class AccountGroupSetup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AccountGroupSetup';

    public ID: number;
    public PlanType: PlanTypeEnum;
    public UpdatedBy: string;
    public CreatedBy: string;
    public ParentID: number;
    public Name: string;
    public ExternalReference: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public _createguid: string;
    public Parent: AccountGroupSetup;
    public CustomFields: any;
}


export class AccountSetup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AccountSetup';

    public ID: number;
    public PlanType: PlanTypeEnum;
    public UpdatedBy: string;
    public CreatedBy: string;
    public SaftMappingAccountID: number;
    public AccountNumber: number;
    public AccountName: string;
    public VatCode: string;
    public AccountGroupSetupID: number;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public Visible: boolean;
    public ExpectedDebitBalance: boolean;
    public _createguid: string;
    public AccountGroup: AccountGroupSetup;
    public SaftMappingAccount: SaftMappingAccount;
    public CustomFields: any;
}


export class AccountVisibilityGroup extends UniEntity {
    public static RelativeUrl = 'accountvisibilitygroups';
    public static EntityType = 'AccountVisibilityGroup';

    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Name: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public _createguid: string;
    public Accounts: Array<AccountVisibilityGroupAccount>;
    public CompanyTypes: Array<CompanyType>;
    public CustomFields: any;
}


export class AccountVisibilityGroupAccount extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AccountVisibilityGroupAccount';

    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public AccountVisibilityGroupID: number;
    public AccountSetupID: number;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class AGARate extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AGARate';

    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public RateValidFrom: Date;
    public Rate: number;
    public UpdatedAt: Date;
    public ZoneID: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public _createguid: string;
    public sector: Array<AGASector>;
    public CustomFields: any;
}


export class AGASector extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AGASector';

    public ID: number;
    public RateID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Rate: number;
    public ValidFrom: Date;
    public UpdatedAt: Date;
    public freeAmount: number;
    public Sector: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public SectorID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class AGAZone extends UniEntity {
    public static RelativeUrl = 'AGAZones';
    public static EntityType = 'AGAZone';

    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public ZoneName: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public _createguid: string;
    public rates: Array<AGARate>;
    public municipalsOnZone: Array<MunicipalAGAZone>;
    public CustomFields: any;
}


export class Agreement extends UniEntity {
    public static RelativeUrl = 'agreements';
    public static EntityType = 'Agreement';

    public ID: number;
    public Template: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public AppliesTo: number;
    public ValidFrom: Date;
    public Name: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class AssetGroup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AssetGroup';

    public DepreciationRate: number;
    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public ToDate: Date;
    public Code: string;
    public DepreciationYears: number;
    public Name: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public DepreciationAccountNumber: number;
    public Deleted: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class BankIdentifierCode extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'BankIdentifierCode';

    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Bic: string;
    public BankName: string;
    public BankIdentifier: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class CompanyType extends UniEntity {
    public static RelativeUrl = 'companytypes';
    public static EntityType = 'CompanyType';

    public DefaultPlanType: PlanTypeEnum;
    public FullName: string;
    public ID: number;
    public Priority: boolean;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Description: string;
    public Name: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public DefaultAccountVisibilityGroupID: number;
    public Deleted: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class Confirmation extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Confirmation';

    public SignUpReferrer: string;
    public ID: number;
    public CompanyName: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public ContractType: string;
    public DisplayName: string;
    public Code: string;
    public Phone: string;
    public ExpirationDate: Date;
    public PostalCode: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public Email: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Country extends UniEntity {
    public static RelativeUrl = 'countries';
    public static EntityType = 'Country';

    public ID: number;
    public UpdatedBy: string;
    public CountryCode: string;
    public CreatedBy: string;
    public DefaultCurrencyCode: string;
    public CurrencyRateSource: string;
    public Name: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class Currency extends UniEntity {
    public static RelativeUrl = 'currencies';
    public static EntityType = 'Currency';

    public FromCurrencyCodeID: number;
    public ID: number;
    public UpdatedBy: string;
    public CurrencyDate: LocalDate;
    public CreatedBy: string;
    public ToCurrencyCodeID: number;
    public Source: CurrencySourceEnum;
    public UpdatedAt: Date;
    public ExchangeRate: number;
    public Factor: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public _createguid: string;
    public FromCurrencyCode: CurrencyCode;
    public ToCurrencyCode: CurrencyCode;
    public CustomFields: any;
}


export class CurrencyCode extends UniEntity {
    public static RelativeUrl = 'currencycodes';
    public static EntityType = 'CurrencyCode';

    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public ShortCode: string;
    public Description: string;
    public Code: string;
    public Name: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class DebtCollectionAutomation extends UniEntity {
    public static RelativeUrl = 'debtcollectionautomation';
    public static EntityType = 'DebtCollectionAutomation';

    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Description: string;
    public Name: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public DebtCollectionSettingsID: number;
    public _createguid: string;
    public DebtCollectionSettings: DebtCollectionSettings;
    public CustomFields: any;
}


export class EmploymentValidValues extends UniEntity {
    public static RelativeUrl = 'employmentvalidvalues';
    public static EntityType = 'EmploymentValidValues';

    public employment: TypeOfEmployment;
    public LastWorkPercentChange: boolean;
    public WorkingHoursScheme: boolean;
    public StartDate: boolean;
    public HoursPerWeek: boolean;
    public ID: number;
    public LastSalaryChangeDate: boolean;
    public ShipType: boolean;
    public TradeArea: boolean;
    public UpdatedBy: string;
    public HourRate: boolean;
    public CreatedBy: string;
    public SeniorityDate: boolean;
    public ShipReg: boolean;
    public RemunerationType: boolean;
    public JobCode: boolean;
    public UserDefinedRate: boolean;
    public MonthRate: boolean;
    public typeOfEmployment: boolean;
    public PaymentType: RemunerationType;
    public WorkPercent: boolean;
    public UpdatedAt: Date;
    public JobName: boolean;
    public CreatedAt: Date;
    public EndDate: boolean;
    public Deleted: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class FinancialDeadline extends UniEntity {
    public static RelativeUrl = 'deadlines';
    public static EntityType = 'FinancialDeadline';

    public ID: number;
    public AdditionalInfo: string;
    public UpdatedBy: string;
    public PassableDueDate: number;
    public CreatedBy: string;
    public Type: FinancialDeadlineType;
    public Name: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public Deadline: LocalDate;
    public _createguid: string;
    public CustomFields: any;
}


export class LanguageCode extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'LanguageCode';

    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Code: string;
    public Name: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class Municipal extends UniEntity {
    public static RelativeUrl = 'Municipals';
    public static EntityType = 'Municipal';

    public CountyNo: string;
    public ID: number;
    public CountyName: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Retired: boolean;
    public MunicipalityNo: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public MunicipalityName: string;
    public _createguid: string;
    public CustomFields: any;
}


export class MunicipalAGAZone extends UniEntity {
    public static RelativeUrl = 'MunicipalAGAZones';
    public static EntityType = 'MunicipalAGAZone';

    public Startdate: Date;
    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public MunicipalityNo: string;
    public UpdatedAt: Date;
    public ZoneID: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class PaymentBatchType extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'PaymentBatchType';

    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Description: string;
    public Code: number;
    public Name: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class PaymentCode extends UniEntity {
    public static RelativeUrl = 'paymentCodes';
    public static EntityType = 'PaymentCode';

    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Description: string;
    public Code: number;
    public Name: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public PaymentGroup: string;
    public _createguid: string;
    public CustomFields: any;
}


export class PostalCode extends UniEntity {
    public static RelativeUrl = 'postalcodes';
    public static EntityType = 'PostalCode';

    public City: string;
    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Code: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class SaftMappingAccount extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'SaftMappingAccount';

    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Description: string;
    public AccountID: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class StaticRegister extends UniEntity {
    public static RelativeUrl = 'StaticRegister';
    public static EntityType = 'StaticRegister';

    public Registry: string;
    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public stamp: Date;
    public Deleted: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class STYRKCode extends UniEntity {
    public static RelativeUrl = 'STYRK';
    public static EntityType = 'STYRKCode';

    public ID: number;
    public lnr: number;
    public styrk: string;
    public tittel: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public ynr: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class Language extends UniEntity {
    public static RelativeUrl = 'languages';
    public static EntityType = 'Language';

    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public FallBackLanguageID: number;
    public Code: string;
    public Name: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public _createguid: string;
    public Translations: Array<Translation>;
    public CustomFields: any;
}


export class Translatable extends UniEntity {
    public static RelativeUrl = 'translatables';
    public static EntityType = 'Translatable';

    public Column: string;
    public ID: number;
    public UpdatedBy: string;
    public Value: string;
    public CreatedBy: string;
    public Description: string;
    public Meaning: string;
    public Module: i18nModule;
    public Model: string;
    public UpdatedAt: Date;
    public Static: boolean;
    public CreatedAt: Date;
    public Deleted: boolean;
    public _createguid: string;
    public Translations: Array<Translation>;
    public CustomFields: any;
}


export class Translation extends UniEntity {
    public static RelativeUrl = 'translations';
    public static EntityType = 'Translation';

    public ID: number;
    public UpdatedBy: string;
    public Value: string;
    public CreatedBy: string;
    public LanguageID: number;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public TranslatableID: number;
    public Deleted: boolean;
    public _createguid: string;
    public Language: Language;
    public Translatable: Translatable;
    public CustomFields: any;
}


export class VatCodeGroupSetup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'VatCodeGroupSetup';

    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public No: string;
    public Name: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class VatPostSetup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'VatPostSetup';

    public ID: number;
    public HasTaxAmount: boolean;
    public HasTaxBasis: boolean;
    public UpdatedBy: string;
    public VatCodeGroupSetupNo: string;
    public CreatedBy: string;
    public No: string;
    public Name: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public ReportAsNegativeAmount: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class VatReportForm extends UniEntity {
    public static RelativeUrl = 'vatreportforms';
    public static EntityType = 'VatReportForm';

    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Description: string;
    public Name: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class VatReportReferenceSetup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'VatReportReferenceSetup';

    public VatPostNo: string;
    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public AccountNumber: number;
    public VatCode: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class VatTypeSetup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'VatTypeSetup';

    public ReversedTaxDutyVat: boolean;
    public ID: number;
    public DirectJournalEntryOnly: boolean;
    public UpdatedBy: string;
    public CreatedBy: string;
    public VatCodeGroupNo: string;
    public OutputVat: boolean;
    public DefaultVisible: boolean;
    public VatCode: string;
    public OutgoingAccountNumber: number;
    public IncomingAccountNumber: number;
    public IsCompensated: boolean;
    public Name: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public IsNotVatRegistered: boolean;
    public _createguid: string;
    public VatTypeSetupPercentages: Array<VatTypeSetupPercentage>;
    public CustomFields: any;
}


export class VatTypeSetupPercentage extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'VatTypeSetupPercentage';

    public ID: number;
    public VatTypeSetupID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public ValidTo: LocalDate;
    public ValidFrom: LocalDate;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public VatPercent: number;
    public _createguid: string;
    public CustomFields: any;
}


export class CompanyReport extends UniEntity {
    public static RelativeUrl = 'company-report';
    public static EntityType = 'CompanyReport';

    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CompanyKey: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public ReportDefinitionID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class ReportDefinition extends UniEntity {
    public static RelativeUrl = 'report-definitions';
    public static EntityType = 'ReportDefinition';

    public ReportSource: string;
    public ID: number;
    public CategoryLabel: string;
    public Md5: string;
    public UpdatedBy: string;
    public ReportType: number;
    public CreatedBy: string;
    public Category: string;
    public Description: string;
    public TemplateLinkId: string;
    public Version: string;
    public UniqueReportID: string;
    public Name: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public IsStandard: boolean;
    public Deleted: boolean;
    public Visible: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class ReportDefinitionDataSource extends UniEntity {
    public static RelativeUrl = 'report-definition-data-sources';
    public static EntityType = 'ReportDefinitionDataSource';

    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Name: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public ReportDefinitionId: number;
    public DataSourceUrl: string;
    public _createguid: string;
    public CustomFields: any;
}


export class ReportDefinitionParameter extends UniEntity {
    public static RelativeUrl = 'report-definition-parameters';
    public static EntityType = 'ReportDefinitionParameter';

    public Label: string;
    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Type: string;
    public DefaultValue: string;
    public DefaultValueSource: string;
    public Name: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public Visible: boolean;
    public DefaultValueList: string;
    public ReportDefinitionId: number;
    public DefaultValueLookupType: string;
    public _createguid: string;
    public CustomFields: any;
}


export class PeriodSeries extends UniEntity {
    public static RelativeUrl = 'period-series';
    public static EntityType = 'PeriodSeries';

    public SeriesType: PeriodSeriesType;
    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Active: boolean;
    public Name: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class PeriodTemplate extends UniEntity {
    public static RelativeUrl = 'period-templates';
    public static EntityType = 'PeriodTemplate';

    public ID: number;
    public PeriodSeriesID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public No: number;
    public ToDate: LocalDate;
    public Name: string;
    public FromDate: LocalDate;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public _createguid: string;
    public PeriodSeries: PeriodSeries;
    public CustomFields: any;
}


export class Model extends UniEntity {
    public static RelativeUrl = 'models';
    public static EntityType = 'Model';

    public Label: string;
    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Description: string;
    public Admin: boolean;
    public LabelPlural: string;
    public Name: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public Shared: boolean;
    public _createguid: string;
    public Fields: Array<Field>;
    public CustomFields: any;
}


export class Field extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Field';

    public Label: string;
    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Description: string;
    public HelpText: string;
    public ModelID: number;
    public Name: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public _createguid: string;
    public Model: Model;
    public CustomFields: any;
}


export class Notification extends UniEntity {
    public static RelativeUrl = 'notifications';
    public static EntityType = 'Notification';

    public SourceEntityType: string;
    public ID: number;
    public SourceEntityID: number;
    public CompanyName: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CompanyKey: string;
    public SenderDisplayName: string;
    public Message: string;
    public EntityID: number;
    public EntityType: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public RecipientID: string;
    public _createguid: string;
    public CustomFields: any;
}


export class CompanySettings extends UniEntity {
    public static RelativeUrl = 'companysettings';
    public static EntityType = 'CompanySettings';

    public DefaultSalesAccountID: number;
    public UseXtraPaymentOrgXmlTag: boolean;
    public UseNetsIntegration: boolean;
    public APContactID: number;
    public AgioGainAccountID: number;
    public LogoFileID: number;
    public PeriodSeriesVatID: number;
    public PaymentBankIdentification: string;
    public ShowKIDOnCustomerInvoice: boolean;
    public DefaultCustomerOrderReportID: number;
    public UsePaymentBankValues: boolean;
    public ID: number;
    public TwoStageAutobankEnabled: boolean;
    public BookCustomerInvoiceOnDeliveryDate: boolean;
    public CompanyName: string;
    public XtraPaymentOrgXmlTagValue: string;
    public TaxMandatoryType: number;
    public AcceptableDelta4CustomerPaymentAccountID: number;
    public FactoringEmailID: number;
    public Factoring: number;
    public BankChargeAccountID: number;
    public DefaultTOFCurrencySettingsID: number;
    public RoundingNumberOfDecimals: number;
    public UpdatedBy: string;
    public StoreDistributedInvoice: boolean;
    public HasAutobank: boolean;
    public CreatedBy: string;
    public APActivated: boolean;
    public APIncludeAttachment: boolean;
    public VatReportFormID: number;
    public DefaultCustomerInvoiceReportID: number;
    public VatLockedDate: LocalDate;
    public UseAssetRegister: boolean;
    public SettlementVatAccountID: number;
    public ShowNumberOfDecimals: number;
    public CustomerAccountID: number;
    public PaymentBankAgreementNumber: string;
    public InterrimPaymentAccountID: number;
    public DefaultCustomerInvoiceReminderReportID: number;
    public AutoJournalPayment: boolean;
    public PeriodSeriesAccountID: number;
    public FactoringNumber: number;
    public TaxMandatory: boolean;
    public LogoHideField: number;
    public HideInActiveCustomers: boolean;
    public AccountVisibilityGroupID: number;
    public TaxableFromDate: LocalDate;
    public IgnorePaymentsWithoutEndToEndID: boolean;
    public ForceSupplierInvoiceApproval: boolean;
    public DefaultDistributionsID: number;
    public HideInActiveSuppliers: boolean;
    public Localization: string;
    public GLN: string;
    public SalaryBankAccountID: number;
    public InterrimRemitAccountID: number;
    public CompanyBankAccountID: number;
    public CompanyTypeID: number;
    public AccountGroupSetID: number;
    public TaxableFromLimit: number;
    public RoundingType: RoundingType;
    public AccountingLockedDate: LocalDate;
    public DefaultAddressID: number;
    public TaxBankAccountID: number;
    public SupplierAccountID: number;
    public SaveCustomersFromQuoteAsLead: boolean;
    public DefaultEmailID: number;
    public UpdatedAt: Date;
    public SAFTimportAccountID: number;
    public CustomerInvoiceReminderSettingsID: number;
    public StatusCode: number;
    public CreatedAt: Date;
    public UseOcrInterpretation: boolean;
    public LogoAlign: number;
    public OfficeMunicipalityNo: string;
    public AcceptableDelta4CustomerPayment: number;
    public CustomerCreditDays: number;
    public BatchInvoiceMinAmount: number;
    public AgioLossAccountID: number;
    public Deleted: boolean;
    public OrganizationNumber: string;
    public CompanyRegistered: boolean;
    public WebAddress: string;
    public APGuid: string;
    public NetsIntegrationActivated: boolean;
    public BaseCurrencyCodeID: number;
    public AllowAvtalegiroRegularInvoice: boolean;
    public DefaultCustomerQuoteReportID: number;
    public DefaultPhoneID: number;
    public AutoDistributeInvoice: boolean;
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

    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public EntityType: string;
    public Name: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public _createguid: string;
    public Elements: Array<DistributionPlanElement>;
    public CustomFields: any;
}


export class DistributionPlanElement extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'DistributionPlanElement';

    public DistributionPlanID: number;
    public ID: number;
    public Priority: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public DistributionPlanElementTypeID: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public _createguid: string;
    public ElementType: DistributionPlanElementType;
    public CustomFields: any;
}


export class DistributionPlanElementType extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'DistributionPlanElementType';

    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Name: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public _createguid: string;
    public LegalEntities: Array<DistributionPlanElementTypeLegalEntity>;
    public CustomFields: any;
}


export class DistributionPlanElementTypeLegalEntity extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'DistributionPlanElementTypeLegalEntity';

    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public EntityType: string;
    public DistributionPlanElementTypeID: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class Distributions extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Distributions';

    public ID: number;
    public PayCheckDistributionPlanID: number;
    public AnnualStatementDistributionPlanID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CustomerInvoiceDistributionPlanID: number;
    public CustomerOrderDistributionPlanID: number;
    public UpdatedAt: Date;
    public CustomerInvoiceReminderDistributionPlanID: number;
    public StatusCode: number;
    public CreatedAt: Date;
    public CustomerQuoteDistributionPlanID: number;
    public Deleted: boolean;
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

    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Name: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class EmailLog extends UniEntity {
    public static RelativeUrl = 'emails';
    public static EntityType = 'EmailLog';

    public To: string;
    public ID: number;
    public ExternalMessage: string;
    public JobRunExternalRef: string;
    public Subject: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public EntityDisplayValue: string;
    public From: string;
    public EntityID: number;
    public JobRunID: number;
    public EntityType: string;
    public Type: SharingType;
    public DistributeAt: LocalDate;
    public ExternalReference: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class Eventplan extends UniEntity {
    public static RelativeUrl = 'eventplans';
    public static EntityType = 'Eventplan';

    public ID: number;
    public PlanType: EventplanType;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Cargo: string;
    public IsSystemPlan: boolean;
    public OperationFilter: string;
    public ExpressionFilter: string;
    public Active: boolean;
    public JobNames: string;
    public Name: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public ModelFilter: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public _createguid: string;
    public Subscribers: Array<EventSubscriber>;
    public CustomFields: any;
}


export class EventSubscriber extends UniEntity {
    public static RelativeUrl = 'eventsubscribers';
    public static EntityType = 'EventSubscriber';

    public ID: number;
    public Endpoint: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Headers: string;
    public EventplanID: number;
    public Authorization: string;
    public Active: boolean;
    public Name: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public _createguid: string;
    public Eventplan: Eventplan;
    public CustomFields: any;
}


export class Period extends UniEntity {
    public static RelativeUrl = 'periodes';
    public static EntityType = 'Period';

    public ID: number;
    public PeriodSeriesID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public No: number;
    public ToDate: LocalDate;
    public AccountYear: number;
    public Name: string;
    public FromDate: LocalDate;
    public PeriodTemplateID: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public _createguid: string;
    public PeriodTemplate: PeriodTemplate;
    public PeriodSeries: PeriodSeries;
    public CustomFields: any;
}


export class PredefinedDescription extends UniEntity {
    public static RelativeUrl = 'predefineddescriptions';
    public static EntityType = 'PredefinedDescription';

    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Description: string;
    public Code: string;
    public Type: PredefinedDescriptionType;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class ProductCategory extends UniEntity {
    public static RelativeUrl = 'productcategories';
    public static EntityType = 'ProductCategory';

    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Description: string;
    public Status: number;
    public Comment: string;
    public Rght: number;
    public ParentID: number;
    public Name: string;
    public UpdatedAt: Date;
    public Depth: number;
    public StatusCode: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public Lft: number;
    public _createguid: string;
    public CustomFields: any;
}


export class ProductCategoryLink extends UniEntity {
    public static RelativeUrl = 'productcategorylinks';
    public static EntityType = 'ProductCategoryLink';

    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public ProductCategoryID: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public ProductID: number;
    public Deleted: boolean;
    public _createguid: string;
    public ProductCategory: ProductCategory;
    public CustomFields: any;
}


export class Sharing extends UniEntity {
    public static RelativeUrl = 'sharings';
    public static EntityType = 'Sharing';

    public To: string;
    public ID: number;
    public ExternalMessage: string;
    public JobRunExternalRef: string;
    public Subject: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public EntityDisplayValue: string;
    public From: string;
    public EntityID: number;
    public JobRunID: number;
    public EntityType: string;
    public Type: SharingType;
    public DistributeAt: LocalDate;
    public ExternalReference: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class StatusLog extends UniEntity {
    public static RelativeUrl = 'statuslogs';
    public static EntityType = 'StatusLog';

    public FromStatus: number;
    public ID: number;
    public ToStatus: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public EntityID: number;
    public EntityType: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class Tracelink extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Tracelink';

    public DestinationInstanceID: number;
    public ID: number;
    public SourceInstanceID: number;
    public Date: Date;
    public UpdatedBy: string;
    public SourceEntityName: string;
    public CreatedBy: string;
    public DestinationEntityName: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class User extends UniEntity {
    public static RelativeUrl = 'users';
    public static EntityType = 'User';

    public ID: number;
    public IsAutobankAdmin: boolean;
    public UserName: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public DisplayName: string;
    public PhoneNumber: string;
    public Protected: boolean;
    public GlobalIdentity: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public Email: string;
    public LastLogin: Date;
    public BankIntegrationUserName: string;
    public HasAgreedToImportDisclaimer: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class UniQueryDefinition extends UniEntity {
    public static RelativeUrl = 'uniquerydefinitions';
    public static EntityType = 'UniQueryDefinition';

    public ID: number;
    public UserID: number;
    public UpdatedBy: string;
    public ClickUrl: string;
    public CreatedBy: string;
    public Category: string;
    public Description: string;
    public ModuleID: number;
    public IsShared: boolean;
    public Code: string;
    public SystemGeneratedQuery: boolean;
    public MainModelName: string;
    public Name: string;
    public ClickParam: string;
    public UpdatedAt: Date;
    public SortIndex: number;
    public StatusCode: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public _createguid: string;
    public UniQueryFilters: Array<UniQueryFilter>;
    public UniQueryFields: Array<UniQueryField>;
    public CustomFields: any;
}


export class UniQueryField extends UniEntity {
    public static RelativeUrl = 'uniqueryfields';
    public static EntityType = 'UniQueryField';

    public SumFunction: string;
    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Header: string;
    public Alias: string;
    public Width: string;
    public Path: string;
    public Index: number;
    public FieldType: number;
    public UpdatedAt: Date;
    public UniQueryDefinitionID: number;
    public StatusCode: number;
    public CreatedAt: Date;
    public Field: string;
    public Deleted: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class UniQueryFilter extends UniEntity {
    public static RelativeUrl = 'uniqueryfilters';
    public static EntityType = 'UniQueryFilter';

    public ID: number;
    public Operator: string;
    public UpdatedBy: string;
    public Value: string;
    public Group: number;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public UniQueryDefinitionID: number;
    public StatusCode: number;
    public CreatedAt: Date;
    public Field: string;
    public Deleted: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class Team extends UniEntity {
    public static RelativeUrl = 'teams';
    public static EntityType = 'Team';

    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Rght: number;
    public ParentID: number;
    public Name: string;
    public UpdatedAt: Date;
    public Depth: number;
    public StatusCode: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public DimensionsID: number;
    public Lft: number;
    public _createguid: string;
    public Dimensions: Dimensions;
    public Positions: Array<TeamPosition>;
    public CustomFields: any;
}


export class TeamPosition extends UniEntity {
    public static RelativeUrl = 'teampositions';
    public static EntityType = 'TeamPosition';

    public ID: number;
    public UserID: number;
    public TeamID: number;
    public UpdatedBy: string;
    public ApproveOrder: number;
    public CreatedBy: string;
    public ToDate: LocalDate;
    public FromDate: LocalDate;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public RelatedSharedRoleId: number;
    public Deleted: boolean;
    public Position: TeamPositionEnum;
    public _createguid: string;
    public Team: Team;
    public CustomFields: any;
}


export class ApprovalRule extends UniEntity {
    public static RelativeUrl = 'approvalrules';
    public static EntityType = 'ApprovalRule';

    public ID: number;
    public Keywords: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Description: string;
    public RuleType: ApprovalRuleType;
    public IndustryCodes: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public _createguid: string;
    public Steps: Array<ApprovalRuleStep>;
    public CustomFields: any;
}


export class ApprovalRuleStep extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ApprovalRuleStep';

    public ID: number;
    public UserID: number;
    public StepNumber: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public ApprovalRuleID: number;
    public Limit: number;
    public _createguid: string;
    public ApprovalRule: ApprovalRule;
    public User: User;
    public CustomFields: any;
}


export class ApprovalSubstitute extends UniEntity {
    public static RelativeUrl = 'approvalsubstitutes';
    public static EntityType = 'ApprovalSubstitute';

    public SubstituteUserID: number;
    public ID: number;
    public UserID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public ToDate: LocalDate;
    public FromDate: LocalDate;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public _createguid: string;
    public User: User;
    public SubstituteUser: User;
    public CustomFields: any;
}


export class TaskApprovalPlan extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'TaskApprovalPlan';

    public ID: number;
    public UserID: number;
    public ApprovalID: number;
    public StepNumber: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Amount: number;
    public Comment: string;
    public UpdatedAt: Date;
    public TaskID: number;
    public StatusCode: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public ApprovalRuleID: number;
    public Limit: number;
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

    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Description: string;
    public System: boolean;
    public EntityType: string;
    public IsDepricated: boolean;
    public StatusCategoryID: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public Order: number;
    public Deleted: boolean;
    public _createguid: string;
    public StatusCategory: StatusCategory;
    public CustomFields: any;
}


export class StatusCategory extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'StatusCategory';

    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Name: string;
    public StatusCategoryCode: StatusCategoryCode;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class StatusRemark extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'StatusRemark';

    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public EntityID: number;
    public EntityType: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public Remark: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Transition extends UniEntity {
    public static RelativeUrl = 'transitions';
    public static EntityType = 'Transition';

    public ID: number;
    public UpdatedBy: string;
    public MethodName: string;
    public CreatedBy: string;
    public EntityType: string;
    public Controller: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class TransitionThreshold extends UniEntity {
    public static RelativeUrl = 'thresholds';
    public static EntityType = 'TransitionThreshold';

    public Operation: OperationType;
    public SharedApproveTransitionId: number;
    public ID: number;
    public Operator: Operator;
    public UpdatedBy: string;
    public Value: string;
    public CreatedBy: string;
    public Disabled: boolean;
    public RejectStatusCode: number;
    public PropertyName: string;
    public UpdatedAt: Date;
    public SharedRoleId: number;
    public CreatedAt: Date;
    public SharedRejectTransitionId: number;
    public Deleted: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class TransitionThresholdApproval extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'TransitionThresholdApproval';

    public Operation: OperationType;
    public SharedApproveTransitionId: number;
    public ID: number;
    public Operator: Operator;
    public ApprovalID: number;
    public UpdatedBy: string;
    public Value: string;
    public CreatedBy: string;
    public RejectStatusCode: number;
    public PropertyName: string;
    public UpdatedAt: Date;
    public SharedRoleId: number;
    public CreatedAt: Date;
    public SharedRejectTransitionId: number;
    public Deleted: boolean;
    public _createguid: string;
    public Approval: Approval;
    public CustomFields: any;
}


export class Approval extends UniEntity {
    public static RelativeUrl = 'approvals';
    public static EntityType = 'Approval';

    public ID: number;
    public UserID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Amount: number;
    public UpdatedAt: Date;
    public TaskID: number;
    public SharedRoleId: number;
    public StatusCode: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public _createguid: string;
    public Thresholds: Array<TransitionThresholdApproval>;
    public Task: Task;
    public User: User;
    public CustomFields: any;
}


export class Task extends UniEntity {
    public static RelativeUrl = 'tasks';
    public static EntityType = 'Task';

    public SharedApproveTransitionId: number;
    public ID: number;
    public UserID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public EntityID: number;
    public ModelID: number;
    public Type: TaskType;
    public Title: string;
    public RejectStatusCode: number;
    public UpdatedAt: Date;
    public SharedRoleId: number;
    public StatusCode: number;
    public CreatedAt: Date;
    public SharedRejectTransitionId: number;
    public Deleted: boolean;
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
    public TransitionID: number;
    public ID: number;
    public FromStatusID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public EntityType: string;
    public IsDepricated: boolean;
    public UpdatedAt: Date;
    public ExpiresDate: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public _createguid: string;
    public FromStatus: Status;
    public ToStatus: Status;
    public Transition: Transition;
    public CustomFields: any;
}


export class Project extends UniEntity {
    public static RelativeUrl = 'projects';
    public static EntityType = 'Project';

    public WorkPlaceAddressID: number;
    public ProjectNumberSeriesID: number;
    public Price: number;
    public StartDate: LocalDate;
    public ID: number;
    public ProjectCustomerID: number;
    public ProjectNumberNumeric: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Description: string;
    public Total: number;
    public PlannedStartdate: LocalDate;
    public Amount: number;
    public ProjectNumber: string;
    public ProjectLeadName: string;
    public Name: string;
    public UpdatedAt: Date;
    public PlannedEnddate: LocalDate;
    public StatusCode: number;
    public CreatedAt: Date;
    public EndDate: LocalDate;
    public Deleted: boolean;
    public DimensionsID: number;
    public CostPrice: number;
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

    public Responsibility: string;
    public ID: number;
    public UserID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public ProjectID: number;
    public Name: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public _createguid: string;
    public ProjectUser: User;
    public CustomFields: any;
}


export class ProjectResourceSchedule extends UniEntity {
    public static RelativeUrl = 'projects-schedules-resources';
    public static EntityType = 'ProjectResourceSchedule';

    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public ProjectTaskID: number;
    public ProjectTaskScheduleID: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public ProjectResourceID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class ProjectTask extends UniEntity {
    public static RelativeUrl = 'projects-tasks';
    public static EntityType = 'ProjectTask';

    public Price: number;
    public StartDate: LocalDate;
    public Number: string;
    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Description: string;
    public Total: number;
    public Amount: number;
    public SuggestedNumber: string;
    public ProjectID: number;
    public Name: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public EndDate: LocalDate;
    public Deleted: boolean;
    public CostPrice: number;
    public _createguid: string;
    public ProjectTaskSchedules: Array<ProjectTaskSchedule>;
    public ProjectTaskResources: Array<ProjectResourceSchedule>;
    public CustomFields: any;
}


export class ProjectTaskSchedule extends UniEntity {
    public static RelativeUrl = 'projects-tasks-schedules';
    public static EntityType = 'ProjectTaskSchedule';

    public StartDate: LocalDate;
    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public ProjectTaskID: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public EndDate: LocalDate;
    public Deleted: boolean;
    public _createguid: string;
    public ScheduleResources: Array<ProjectResourceSchedule>;
    public CustomFields: any;
}


export class BarnepassProduct extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'BarnepassProduct';

    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public ProductID: number;
    public Deleted: boolean;
    public _createguid: string;
    public Product: Product;
    public CustomFields: any;
}


export class Product extends UniEntity {
    public static RelativeUrl = 'products';
    public static EntityType = 'Product';

    public AverageCost: number;
    public ID: number;
    public PriceExVat: number;
    public VatTypeID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Description: string;
    public Type: ProductTypeEnum;
    public DefaultProductCategoryID: number;
    public AccountID: number;
    public Name: string;
    public Unit: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public PriceIncVat: number;
    public ListPrice: number;
    public Deleted: boolean;
    public CalculateGrossPriceBasedOnNetPrice: boolean;
    public DimensionsID: number;
    public VariansParentID: number;
    public CostPrice: number;
    public ImageFileID: number;
    public PartName: string;
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

    public UseNumbersFromNumberSeriesID: number;
    public ToNumber: number;
    public ID: number;
    public UpdatedBy: string;
    public IsDefaultForTask: boolean;
    public CreatedBy: string;
    public MainAccountID: number;
    public DisplayName: string;
    public FromNumber: number;
    public NextNumber: number;
    public Empty: boolean;
    public Disabled: boolean;
    public System: boolean;
    public Comment: string;
    public NumberLock: boolean;
    public AccountYear: number;
    public Name: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public NumberSeriesTypeID: number;
    public Deleted: boolean;
    public NumberSeriesTaskID: number;
    public IsCopiedFromOtherYear: boolean;
    public _createguid: string;
    public NumberSeriesType: NumberSeriesType;
    public UseNumbersFromNumberSeries: NumberSeries;
    public NumberSeriesTask: NumberSeriesTask;
    public MainAccount: Account;
    public CustomFields: any;
}


export class NumberSeriesInvalidOverlap extends UniEntity {
    public static RelativeUrl = 'number-series-invalid-overlaps';
    public static EntityType = 'NumberSeriesInvalidOverlap';

    public NumberSerieTypeBID: number;
    public ID: number;
    public UpdatedBy: string;
    public NumberSerieTypeAID: number;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public _createguid: string;
    public NumberSerieTypeA: NumberSeriesType;
    public NumberSerieTypeB: NumberSeriesType;
    public CustomFields: any;
}


export class NumberSeriesTask extends UniEntity {
    public static RelativeUrl = 'number-series-tasks';
    public static EntityType = 'NumberSeriesTask';

    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public EntityType: string;
    public Name: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public _createguid: string;
    public NumberSeries: Array<NumberSeries>;
    public CustomFields: any;
}


export class NumberSeriesType extends UniEntity {
    public static RelativeUrl = 'number-series-types';
    public static EntityType = 'NumberSeriesType';

    public ID: number;
    public CanHaveSeveralActiveSeries: boolean;
    public UpdatedBy: string;
    public CreatedBy: string;
    public EntityField: string;
    public System: boolean;
    public EntityType: string;
    public Yearly: boolean;
    public EntitySeriesIDField: string;
    public Name: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public _createguid: string;
    public Series: Array<NumberSeries>;
    public CustomFields: any;
}


export class EncryptionInfo extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'EncryptionInfo';

    public ID: number;
    public password: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public description: string;
    public type: Type;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class File extends UniEntity {
    public static RelativeUrl = 'files/{entitytype}/{entityid}';
    public static EntityType = 'File';

    public ID: number;
    public Md5: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Description: string;
    public encryptionID: number;
    public ContentType: string;
    public StorageReference: string;
    public PermaLink: string;
    public Name: string;
    public OCRData: string;
    public UpdatedAt: Date;
    public Size: string;
    public StatusCode: number;
    public CreatedAt: Date;
    public Pages: number;
    public Deleted: boolean;
    public UploadSlot: string;
    public _createguid: string;
    public FileTags: Array<FileTag>;
    public EntityLinks: Array<FileEntityLink>;
    public CustomFields: any;
}


export class FileTag extends UniEntity {
    public static RelativeUrl = 'filetags';
    public static EntityType = 'FileTag';

    public FileID: number;
    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Status: number;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public TagName: string;
    public _createguid: string;
    public File: File;
    public CustomFields: any;
}


export class FileEntityLink extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'FileEntityLink';

    public FileID: number;
    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public IsAttachment: boolean;
    public EntityID: number;
    public EntityType: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public _createguid: string;
    public File: File;
    public CustomFields: any;
}


export class ElsaUsageLog extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ElsaUsageLog';

    public Quantity: number;
    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public ProductType: string;
    public DateLogged: Date;
    public ExternalReference: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class AccessPointFormat extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AccessPointFormat';

    public Label: string;
    public ID: number;
    public IncommingID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public OutgoingID: number;
    public Name: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public ResourceName: string;
    public _createguid: string;
    public CustomFields: any;
}


export class EHFLog extends UniEntity {
    public static RelativeUrl = 'ehf';
    public static EntityType = 'EHFLog';

    public To: string;
    public ID: number;
    public ExternalMessage: string;
    public JobRunExternalRef: string;
    public Subject: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public EntityDisplayValue: string;
    public From: string;
    public EntityID: number;
    public JobRunID: number;
    public EntityType: string;
    public Type: SharingType;
    public DistributeAt: LocalDate;
    public ExternalReference: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class Department extends UniEntity {
    public static RelativeUrl = 'departments';
    public static EntityType = 'Department';

    public ID: number;
    public DepartmentNumberNumeric: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Description: string;
    public DepartmentManagerName: string;
    public DepartmentNumberSeriesID: number;
    public DepartmentNumber: string;
    public Name: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public _createguid: string;
    public DepartmentNumberSeries: NumberSeries;
    public CustomFields: any;
}


export class Dimension10 extends UniEntity {
    public static RelativeUrl = 'Dimension10';
    public static EntityType = 'Dimension10';

    public Number: string;
    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Description: string;
    public Name: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public NumberNumeric: number;
    public _createguid: string;
    public CustomFields: any;
}


export class Dimension5 extends UniEntity {
    public static RelativeUrl = 'Dimension5';
    public static EntityType = 'Dimension5';

    public Number: string;
    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Description: string;
    public Name: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public NumberNumeric: number;
    public _createguid: string;
    public CustomFields: any;
}


export class Dimension6 extends UniEntity {
    public static RelativeUrl = 'Dimension6';
    public static EntityType = 'Dimension6';

    public Number: string;
    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Description: string;
    public Name: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public NumberNumeric: number;
    public _createguid: string;
    public CustomFields: any;
}


export class Dimension7 extends UniEntity {
    public static RelativeUrl = 'Dimension7';
    public static EntityType = 'Dimension7';

    public Number: string;
    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Description: string;
    public Name: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public NumberNumeric: number;
    public _createguid: string;
    public CustomFields: any;
}


export class Dimension8 extends UniEntity {
    public static RelativeUrl = 'Dimension8';
    public static EntityType = 'Dimension8';

    public Number: string;
    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Description: string;
    public Name: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public NumberNumeric: number;
    public _createguid: string;
    public CustomFields: any;
}


export class Dimension9 extends UniEntity {
    public static RelativeUrl = 'Dimension9';
    public static EntityType = 'Dimension9';

    public Number: string;
    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Description: string;
    public Name: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public NumberNumeric: number;
    public _createguid: string;
    public CustomFields: any;
}


export class Dimensions extends UniEntity {
    public static RelativeUrl = 'dimensions';
    public static EntityType = 'Dimensions';

    public Dimension5ID: number;
    public DepartmentID: number;
    public ID: number;
    public Dimension10ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public ProjectTaskID: number;
    public ResponsibleID: number;
    public Dimension7ID: number;
    public RegionID: number;
    public ProjectID: number;
    public Dimension6ID: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public Dimension9ID: number;
    public Deleted: boolean;
    public Dimension8ID: number;
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
    public Dimension6Name: string;
    public ProjectTaskName: string;
    public ID: number;
    public Dimension8Name: string;
    public Dimension5Number: string;
    public Dimension10Name: string;
    public ProjectName: string;
    public ProjectTaskNumber: string;
    public Dimension5Name: string;
    public Dimension6Number: string;
    public Dimension9Number: string;
    public Dimension10Number: string;
    public ProjectNumber: string;
    public Dimension7Name: string;
    public Dimension9Name: string;
    public RegionCode: string;
    public DepartmentNumber: string;
    public ResponsibleName: string;
    public DepartmentName: string;
    public Dimension8Number: string;
    public RegionName: string;
    public DimensionsID: number;
    public Dimension7Number: string;
}


export class DimensionSettings extends UniEntity {
    public static RelativeUrl = 'dimensionsettings';
    public static EntityType = 'DimensionSettings';

    public Label: string;
    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public IsActive: boolean;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public Dimension: number;
    public _createguid: string;
    public CustomFields: any;
}


export class Region extends UniEntity {
    public static RelativeUrl = 'regions';
    public static EntityType = 'Region';

    public ID: number;
    public UpdatedBy: string;
    public CountryCode: string;
    public CreatedBy: string;
    public Description: string;
    public RegionCode: string;
    public Name: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class Responsible extends UniEntity {
    public static RelativeUrl = 'responsibles';
    public static EntityType = 'Responsible';

    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Description: string;
    public NameOfResponsible: string;
    public Name: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class Contract extends UniEntity {
    public static RelativeUrl = 'contracts';
    public static EntityType = 'Contract';

    public ID: number;
    public ContractCode: string;
    public Hash: string;
    public UpdatedBy: string;
    public Engine: ContractEngine;
    public CreatedBy: string;
    public Description: string;
    public TeamsUri: string;
    public HashTransactionAddress: string;
    public Name: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public _createguid: string;
    public Parameters: Array<ContractParameter>;
    public Triggers: Array<ContractTrigger>;
    public RunLogs: Array<ContractRunLog>;
    public CustomFields: any;
}


export class ContractAddress extends UniEntity {
    public static RelativeUrl = 'contractaddresses';
    public static EntityType = 'ContractAddress';

    public Address: string;
    public ID: number;
    public ContractID: number;
    public UpdatedBy: string;
    public ContractAssetID: number;
    public CreatedBy: string;
    public EntityID: number;
    public Amount: number;
    public EntityType: string;
    public Type: AddressType;
    public AssetAddress: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public _createguid: string;
    public Contract: Contract;
    public ContractAsset: ContractAsset;
    public CustomFields: any;
}


export class ContractAsset extends UniEntity {
    public static RelativeUrl = 'contractassets';
    public static EntityType = 'ContractAsset';

    public IsAutoDestroy: boolean;
    public Cap: number;
    public ID: number;
    public IsIssuedByDefinerOnly: boolean;
    public ContractID: number;
    public IsFixedDenominations: boolean;
    public IsPrivate: boolean;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Type: AddressType;
    public IsTransferrable: boolean;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public SpenderAttested: boolean;
    public IsCosignedByDefiner: boolean;
    public _createguid: string;
    public Contract: Contract;
    public CustomFields: any;
}


export class ContractDebugLog extends UniEntity {
    public static RelativeUrl = 'contractdebuglogs';
    public static EntityType = 'ContractDebugLog';

    public ID: number;
    public ContractID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Message: string;
    public Type: ContractEventType;
    public ContractRunLogID: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public _createguid: string;
    public Contract: Contract;
    public ContractRunLog: ContractRunLog;
    public CustomFields: any;
}


export class ContractParameter extends UniEntity {
    public static RelativeUrl = 'contractparameters';
    public static EntityType = 'ContractParameter';

    public ID: number;
    public ContractID: number;
    public UpdatedBy: string;
    public Value: string;
    public CreatedBy: string;
    public Name: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public _createguid: string;
    public Contract: Contract;
    public CustomFields: any;
}


export class ContractRunLog extends UniEntity {
    public static RelativeUrl = 'contractrunlogs';
    public static EntityType = 'ContractRunLog';

    public ID: number;
    public ContractID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Message: string;
    public ContractTriggerID: number;
    public RunTime: string;
    public Type: ContractEventType;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public _createguid: string;
    public Contract: Contract;
    public CustomFields: any;
}


export class ContractTransaction extends UniEntity {
    public static RelativeUrl = 'contracttransactions';
    public static EntityType = 'ContractTransaction';

    public ContractAddressID: number;
    public ID: number;
    public ContractID: number;
    public ReceiverAddress: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Amount: number;
    public AssetAddress: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public SenderAddress: string;
    public _createguid: string;
    public Contract: Contract;
    public ContractAddress: ContractAddress;
    public CustomFields: any;
}


export class ContractTrigger extends UniEntity {
    public static RelativeUrl = 'contracttriggers';
    public static EntityType = 'ContractTrigger';

    public ID: number;
    public ContractID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public OperationFilter: string;
    public ExpressionFilter: string;
    public Type: ContractEventType;
    public UpdatedAt: Date;
    public StatusCode: number;
    public ModelFilter: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public _createguid: string;
    public Contract: Contract;
    public CustomFields: any;
}


export class Comment extends UniEntity {
    public static RelativeUrl = 'comments';
    public static EntityType = 'Comment';

    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public EntityID: number;
    public EntityType: string;
    public Text: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public AuthorID: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public _createguid: string;
    public Mentioned: Array<Mentioned>;
    public Author: User;
    public CustomFields: any;
}


export class Mentioned extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Mentioned';

    public ID: number;
    public UserID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CommentID: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public _createguid: string;
    public User: User;
    public CustomFields: any;
}


export class ApiKey extends UniEntity {
    public static RelativeUrl = 'apikeys';
    public static EntityType = 'ApiKey';

    public Url: string;
    public Encrypt: boolean;
    public ID: number;
    public FilterDate: LocalDate;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Description: string;
    public ExternalId: string;
    public UpdatedAt: Date;
    public IntegrationKey: string;
    public StatusCode: number;
    public CreatedAt: Date;
    public IntegrationType: TypeOfIntegration;
    public Deleted: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class Altinn extends UniEntity {
    public static RelativeUrl = 'altinn';
    public static EntityType = 'Altinn';

    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public SystemID: string;
    public Language: string;
    public PreferredLogin: TypeOfLogin;
    public UpdatedAt: Date;
    public StatusCode: number;
    public SystemPw: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class AltinnReceipt extends UniEntity {
    public static RelativeUrl = 'altinnreceipts';
    public static EntityType = 'AltinnReceipt';

    public ID: number;
    public XmlReceipt: string;
    public UpdatedBy: string;
    public TimeStamp: Date;
    public UserSign: string;
    public ErrorText: string;
    public CreatedBy: string;
    public AltinnResponseData: string;
    public ReceiptID: number;
    public Form: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public HasBeenRegistered: boolean;
    public _createguid: string;
    public Signings: Array<AltinnSigning>;
    public CustomFields: any;
}


export class AltinnSigning extends UniEntity {
    public static RelativeUrl = 'altinnsigning';
    public static EntityType = 'AltinnSigning';

    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public SignatureText: string;
    public StatusText: string;
    public DateSigned: Date;
    public SignatureReference: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public AltinnReceiptID: number;
    public Deleted: boolean;
    public _createguid: string;
    public AltinnReceipt: AltinnReceipt;
    public CustomFields: any;
}


export class Barnepass extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Barnepass';

    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public inntektsaar: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public _createguid: string;
    public oppgave: Array<BarnepassOppgave>;
    public CustomFields: any;
}


export class BarnepassOppgave extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'BarnepassOppgave';

    public ID: number;
    public paaloeptBeloep: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public BarnepassID: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public email: string;
    public foedselsnummer: string;
    public navn: string;
    public _createguid: string;
    public CustomFields: any;
}


export class UserRole extends UniEntity {
    public static RelativeUrl = 'userroles';
    public static EntityType = 'UserRole';

    public ID: number;
    public UserID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public SharedRoleName: string;
    public UpdatedAt: Date;
    public SharedRoleId: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public _createguid: string;
    public User: User;
    public CustomFields: any;
}


export class Role extends UniEntity {
    public static RelativeUrl = 'roles';
    public static EntityType = 'Role';

    public Label: string;
    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Description: string;
    public Name: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public _createguid: string;
    public RolePermissions: Array<RolePermission>;
    public CustomFields: any;
}


export class RolePermission extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'RolePermission';

    public PermissionID: number;
    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public RoleID: number;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public _createguid: string;
    public Permission: Permission;
    public Role: Role;
    public CustomFields: any;
}


export class Permission extends UniEntity {
    public static RelativeUrl = 'permissions';
    public static EntityType = 'Permission';

    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Name: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public _createguid: string;
    public RolePermissions: Array<RolePermission>;
    public CustomFields: any;
}


export class AvtaleGiroAgreement extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AvtaleGiroAgreement';

    public ID: number;
    public Thumbprint: string;
    public UpdatedBy: string;
    public DataSender: string;
    public CreatedBy: string;
    public Description: string;
    public NextNumber: number;
    public KeyPath: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class AvtaleGiroBankAccount extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AvtaleGiroBankAccount';

    public ID: number;
    public CompanyID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public AvtaleGiroAgreementID: number;
    public Deleted: boolean;
    public BankAccountNumber: string;
    public _createguid: string;
    public Company: Company;
    public CustomFields: any;
}


export class AvtaleGiroFile extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AvtaleGiroFile';

    public FileID: number;
    public ID: number;
    public AvtaleGiroMergedFileID: number;
    public CompanyID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public AvtaleGiroAgreementID: number;
    public Deleted: boolean;
    public AvtaleGiroContent: string;
    public _createguid: string;
    public Company: Company;
    public CustomFields: any;
}


export class AvtaleGiroMergedFile extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AvtaleGiroMergedFile';

    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public TransmissionNumber: number;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class BankAgreement extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'BankAgreement';

    public ServiceAccountID: number;
    public ReceiptDate: Date;
    public OrderName: string;
    public ID: number;
    public CompanyID: number;
    public OrderMobile: string;
    public UpdatedBy: string;
    public OrderEmail: string;
    public CreatedBy: string;
    public AccountOwnerName: string;
    public CustomerName: string;
    public ServiceID: string;
    public ReceiptID: string;
    public CustomerOrgNumber: string;
    public AccountOwnerOrgNumber: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public _createguid: string;
    public ServiceAccount: ServiceAccount;
    public Company: Company;
    public Services: Array<BankService>;
    public CustomFields: any;
}


export class BankService extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'BankService';

    public ID: number;
    public ServiceType: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public BankAgreementID: number;
    public DivisionName: string;
    public DivisionID: number;
    public KidRule: string;
    public FileType: string;
    public UpdatedAt: Date;
    public ConfirmInNetbank: boolean;
    public CreatedAt: Date;
    public Deleted: boolean;
    public _createguid: string;
    public BankAgreement: BankAgreement;
    public BankAccounts: Array<BankServiceBankAccount>;
    public CustomFields: any;
}


export class BankServiceBankAccount extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'BankServiceBankAccount';

    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public AccountNumber: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public BankServiceID: number;
    public _createguid: string;
    public BankService: BankService;
    public CustomFields: any;
}


export class Company extends UniEntity {
    public static RelativeUrl = 'companies';
    public static EntityType = 'Company';

    public IsGlobalTemplate: boolean;
    public ID: number;
    public ClientNumber: number;
    public UpdatedBy: string;
    public Key: string;
    public CreatedBy: string;
    public SchemaName: string;
    public IsTest: boolean;
    public IsTemplate: boolean;
    public ConnectionString: string;
    public LastActivity: Date;
    public Name: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public FileFlowEmail: string;
    public Deleted: boolean;
    public OrganizationNumber: string;
    public FileFlowOrgnrEmail: string;
    public WebHookSubscriberId: string;
    public _createguid: string;
    public CustomFields: any;
}


export class CompanyAccess extends UniEntity {
    public static RelativeUrl = 'companies-access';
    public static EntityType = 'CompanyAccess';

    public ID: number;
    public CompanyID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public GlobalIdentity: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class CompanyBackup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'CompanyBackup';

    public Environment: string;
    public ID: number;
    public CompanyName: string;
    public ContractID: number;
    public UpdatedBy: string;
    public CopyFiles: boolean;
    public CreatedBy: string;
    public CompanyKey: string;
    public CustomerName: string;
    public Message: string;
    public ContractType: number;
    public SchemaName: string;
    public DeletedAt: Date;
    public BackupStatus: BackupStatus;
    public CloudBlobName: string;
    public ContainerName: string;
    public Reason: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public ScheduledForDeleteAt: Date;
    public Deleted: boolean;
    public OrgNumber: string;
    public _createguid: string;
    public CustomFields: any;
}


export class ContractCron extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ContractCron';

    public ID: number;
    public ContractID: number;
    public CompanyID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public ContractTriggerID: number;
    public Expression: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public CompanyKey: string;
    public _createguid: string;
    public CompanyDbName: string;
    public CustomFields: any;
}


export class ContractObyte extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ContractObyte';

    public Address: string;
    public ContractAddressID: number;
    public ID: number;
    public ContractID: number;
    public CompanyID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public AssetAddress: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public CompanyKey: string;
    public _createguid: string;
    public CompanyDbName: string;
    public CustomFields: any;
}


export class DeniedUserAccessLog extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'DeniedUserAccessLog';

    public ID: number;
    public Username: string;
    public CompanyName: string;
    public Occurred: Date;
    public CompanyID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Message: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public Email: string;
    public _createguid: string;
    public Company: Company;
    public CustomFields: any;
}


export class FailedBankFile extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'FailedBankFile';

    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CompanyKey: string;
    public FileName: string;
    public FailedReason: FailedReasonEnum;
    public FileContent: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class HangfireJob extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'HangfireJob';

    public ID: number;
    public Completed: boolean;
    public Year: number;
    public CompanyID: number;
    public CompanyKey: string;
    public HasError: boolean;
    public Status: number;
    public JobId: string;
    public GlobalIdentity: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public CustomFields: any;
}


export class HangfireJobContext extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'HangfireJobContext';

    public ID: number;
    public Completed: boolean;
    public Year: number;
    public CompanyID: number;
    public CompanyKey: string;
    public HasError: boolean;
    public Status: number;
    public SchemaName: string;
    public JobId: string;
    public GlobalIdentity: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public CustomFields: any;
}


export class HangfireResponse extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'HangfireResponse';

    public State: string;
    public ID: number;
    public Completed: boolean;
    public Year: number;
    public CompanyID: number;
    public CompanyKey: string;
    public HasError: boolean;
    public ProgressUrl: string;
    public Status: number;
    public JobId: string;
    public GlobalIdentity: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public CustomFields: any;
}


export class KpiDefinition extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'KpiDefinition';

    public ID: number;
    public IsPerUser: boolean;
    public CompanyID: number;
    public RefreshModels: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Application: string;
    public RoleNames: string;
    public ValueType: KpiValueType;
    public Name: string;
    public UpdatedAt: Date;
    public Route: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public Interval: string;
    public SourceType: KpiSourceType;
    public _createguid: string;
    public CustomFields: any;
}


export class KpiValue extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'KpiValue';

    public ID: number;
    public CompanyID: number;
    public KpiDefinitionID: number;
    public UpdatedBy: string;
    public ValueStatus: KpiValueStatus;
    public CreatedBy: string;
    public LastUpdated: Date;
    public Total: number;
    public UserIdentity: string;
    public Text: string;
    public Counter: number;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public KpiName: string;
    public _createguid: string;
    public CustomFields: any;
}


export class ProcessFileLog extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ProcessFileLog';

    public FileID: number;
    public ID: number;
    public CompanyName: string;
    public CompanyID: number;
    public EntityInstanceID: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public EntityCount: number;
    public CompanyKey: string;
    public Message: string;
    public UserIdentity: string;
    public FileName: string;
    public FileType: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public EntityName: string;
    public _createguid: string;
    public Company: Company;
    public CustomFields: any;
}


export class ServiceAccount extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ServiceAccount';

    public ID: number;
    public Thumbprint: string;
    public UpdatedBy: string;
    public DataSender: string;
    public CreatedBy: string;
    public Description: string;
    public NextNumber: number;
    public KeyPath: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class UserVerification extends UniEntity {
    public static RelativeUrl = 'user-verifications';
    public static EntityType = 'UserVerification';

    public ID: number;
    public UserId: number;
    public CompanyId: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public DisplayName: string;
    public VerificationDate: Date;
    public ExpirationDate: Date;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public VerificationCode: string;
    public Email: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Account extends UniEntity {
    public static RelativeUrl = 'accounts';
    public static EntityType = 'Account';

    public ID: number;
    public Keywords: string;
    public CurrencyCodeID: number;
    public SystemAccount: boolean;
    public VatTypeID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Description: string;
    public SaftMappingAccountID: number;
    public Locked: boolean;
    public UseVatDeductionGroupID: number;
    public AccountNumber: number;
    public TopLevelAccountGroupID: number;
    public AccountName: string;
    public Active: boolean;
    public CostAllocationID: number;
    public AccountSetupID: number;
    public AccountID: number;
    public UpdatedAt: Date;
    public LockManualPosts: boolean;
    public StatusCode: number;
    public DoSynchronize: boolean;
    public CustomerID: number;
    public CreatedAt: Date;
    public AccountGroupID: number;
    public Deleted: boolean;
    public EmployeeID: number;
    public UsePostPost: boolean;
    public DimensionsID: number;
    public Visible: boolean;
    public SupplierID: number;
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

    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public AccountID: number;
    public Name: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class AccountGroup extends UniEntity {
    public static RelativeUrl = 'accountgroups';
    public static EntityType = 'AccountGroup';

    public Summable: boolean;
    public ID: number;
    public CompatibleAccountID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public MainGroupID: number;
    public AccountGroupSetupID: number;
    public AccountID: number;
    public GroupNumber: string;
    public Name: string;
    public AccountGroupSetID: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public _createguid: string;
    public MainGroup: AccountGroup;
    public AccountGroupSet: AccountGroupSet;
    public CustomFields: any;
}


export class AccountGroupSet extends UniEntity {
    public static RelativeUrl = 'accountgroupsets';
    public static EntityType = 'AccountGroupSet';

    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public ToAccountNumber: number;
    public SubAccountAllowed: boolean;
    public System: boolean;
    public FromAccountNumber: number;
    public Name: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public Shared: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class AccountMandatoryDimension extends UniEntity {
    public static RelativeUrl = 'accountmandatorydimension';
    public static EntityType = 'AccountMandatoryDimension';

    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public DimensionNo: number;
    public AccountID: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public MandatoryType: number;
    public _createguid: string;
    public CustomFields: any;
}


export class Accrual extends UniEntity {
    public static RelativeUrl = 'accruals';
    public static EntityType = 'Accrual';

    public ID: number;
    public AccrualJournalEntryMode: number;
    public BalanceAccountID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public AccrualAmount: number;
    public ResultAccountID: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public JournalEntryLineDraftID: number;
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

    public AccrualID: number;
    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Amount: number;
    public JournalEntryDraftLineID: number;
    public AccountYear: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public PeriodNo: number;
    public Deleted: boolean;
    public _createguid: string;
    public Accrual: Accrual;
    public JournalEntryLineDraft: JournalEntryLineDraft;
    public CustomFields: any;
}


export class Asset extends UniEntity {
    public static RelativeUrl = 'assets';
    public static EntityType = 'Asset';

    public ID: number;
    public AutoDepreciation: boolean;
    public DepreciationStartDate: LocalDate;
    public PurchaseAmount: number;
    public BalanceAccountID: number;
    public DepreciationCycle: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public DepreciationAccountID: number;
    public AssetGroupCode: string;
    public Name: string;
    public ScrapValue: number;
    public Lifetime: number;
    public NetFinancialValue: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public DimensionsID: number;
    public PurchaseDate: LocalDate;
    public Status: string;
    public _createguid: string;
    public CurrentNetFinancialValue: number;
    public BalanceAccount: Account;
    public DepreciationAccount: Account;
    public Dimensions: Dimensions;
    public DepreciationLines: Array<DepreciationLine>;
    public CustomFields: any;
}


export class Bank extends UniEntity {
    public static RelativeUrl = 'banks';
    public static EntityType = 'Bank';

    public ID: number;
    public AddressID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public BIC: string;
    public Web: string;
    public PhoneID: number;
    public InitialBIC: string;
    public Name: string;
    public EmailID: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public _createguid: string;
    public Address: Address;
    public Phone: Phone;
    public Email: Email;
    public CustomFields: any;
}


export class BankAccount extends UniEntity {
    public static RelativeUrl = 'bankaccounts';
    public static EntityType = 'BankAccount';

    public Label: string;
    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Locked: boolean;
    public AccountNumber: string;
    public BankID: number;
    public BankAccountType: string;
    public AccountID: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public BusinessRelationID: number;
    public CreatedAt: Date;
    public CompanySettingsID: number;
    public Deleted: boolean;
    public IBAN: string;
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

    public IsInbound: boolean;
    public ID: number;
    public BankAcceptance: boolean;
    public PropertiesJson: string;
    public UpdatedBy: string;
    public IsOutgoing: boolean;
    public CreatedBy: string;
    public DefaultAgreement: boolean;
    public ServiceID: string;
    public IsBankBalance: boolean;
    public ServiceTemplateID: string;
    public Name: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public BankAccountID: number;
    public Deleted: boolean;
    public Email: string;
    public ServiceProvider: number;
    public Password: string;
    public _createguid: string;
    public BankAccount: BankAccount;
    public CustomFields: any;
}


export class BankRule extends UniEntity {
    public static RelativeUrl = 'bankrules';
    public static EntityType = 'BankRule';

    public ID: number;
    public ActionCode: ActionCodeBankRule;
    public Priority: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public AccountID: number;
    public Name: string;
    public IsActive: boolean;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public Rule: string;
    public _createguid: string;
    public Account: Account;
    public CustomFields: any;
}


export class BankStatement extends UniEntity {
    public static RelativeUrl = 'bankstatements';
    public static EntityType = 'BankStatement';

    public FileID: number;
    public ID: number;
    public EndBalance: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CurrencyCode: string;
    public Amount: number;
    public ToDate: LocalDate;
    public StartBalance: number;
    public AccountID: number;
    public ArchiveReference: string;
    public FromDate: LocalDate;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public BankAccountID: number;
    public Deleted: boolean;
    public AmountCurrency: number;
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

    public OpenAmountCurrency: number;
    public ID: number;
    public SenderAccount: string;
    public BankStatementID: number;
    public CID: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Category: string;
    public Description: string;
    public StructuredReference: string;
    public CurrencyCode: string;
    public BookingDate: LocalDate;
    public OpenAmount: number;
    public Amount: number;
    public InvoiceNumber: string;
    public Receivername: string;
    public ValueDate: LocalDate;
    public ArchiveReference: string;
    public ReceiverAccount: string;
    public TransactionId: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public SenderName: string;
    public Deleted: boolean;
    public AmountCurrency: number;
    public _createguid: string;
    public BankStatement: BankStatement;
    public CustomFields: any;
}


export class BankStatementMatch extends UniEntity {
    public static RelativeUrl = 'bankstatementmatch';
    public static EntityType = 'BankStatementMatch';

    public JournalEntryLineID: number;
    public ID: number;
    public Batch: string;
    public UpdatedBy: string;
    public Group: string;
    public CreatedBy: string;
    public Amount: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public BankStatementEntryID: number;
    public Deleted: boolean;
    public _createguid: string;
    public BankStatementEntry: BankStatementEntry;
    public JournalEntryLine: JournalEntryLine;
    public CustomFields: any;
}


export class BankStatementRule extends UniEntity {
    public static RelativeUrl = 'bankstatementrules';
    public static EntityType = 'BankStatementRule';

    public EntryText: string;
    public ID: number;
    public Priority: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public AccountID: number;
    public Name: string;
    public IsActive: boolean;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public DimensionsID: number;
    public Rule: string;
    public _createguid: string;
    public Dimensions: Dimensions;
    public Account: Account;
    public CustomFields: any;
}


export class Budget extends UniEntity {
    public static RelativeUrl = 'budgets';
    public static EntityType = 'Budget';

    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public AccountingYear: number;
    public Name: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public _createguid: string;
    public Entries: Array<BudgetEntry>;
    public CustomFields: any;
}


export class BudgetEntry extends UniEntity {
    public static RelativeUrl = 'budgetentries';
    public static EntityType = 'BudgetEntry';

    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public BudgetID: number;
    public Amount: number;
    public PeriodNumber: number;
    public AccountID: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public DimensionsID: number;
    public _createguid: string;
    public Budget: Budget;
    public Account: Account;
    public Dimensions: Dimensions;
    public CustomFields: any;
}


export class CompanyAccountingSettings extends UniEntity {
    public static RelativeUrl = 'companyaccountingsettings';
    public static EntityType = 'CompanyAccountingSettings';

    public AssetSaleLossNoVatAccountID: number;
    public ReInvoicingMethod: number;
    public ReInvoicingCostsharingProductID: number;
    public ID: number;
    public UpdatedBy: string;
    public AssetWriteoffAccountID: number;
    public CreatedBy: string;
    public AssetSaleProfitBalancingAccountID: number;
    public AssetSaleProfitVatAccountID: number;
    public AssetSaleLossVatAccountID: number;
    public AssetSaleProductID: number;
    public AssetSaleLossBalancingAccountID: number;
    public ReInvoicingTurnoverProductID: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public AssetSaleProfitNoVatAccountID: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public _createguid: string;
    public ReInvoicingCostsharingProduct: Product;
    public ReInvoicingTurnoverProduct: Product;
    public CustomFields: any;
}


export class CompanyBankAccount extends UniEntity {
    public static RelativeUrl = 'companybankaccounts';
    public static EntityType = 'CompanyBankAccount';

    public IsSalary: boolean;
    public IsIncomming: boolean;
    public IsTax: boolean;
    public ID: number;
    public UpdatedBy: string;
    public IsOutgoing: boolean;
    public CreatedBy: string;
    public AccountID: number;
    public Name: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public BankAccountID: number;
    public Deleted: boolean;
    public CreditAmount: number;
    public _createguid: string;
    public BankAccount: BankAccount;
    public Account: Account;
    public CustomFields: any;
}


export class CostAllocation extends UniEntity {
    public static RelativeUrl = 'costallocations';
    public static EntityType = 'CostAllocation';

    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Name: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public _createguid: string;
    public Items: Array<CostAllocationItem>;
    public CustomFields: any;
}


export class CostAllocationItem extends UniEntity {
    public static RelativeUrl = 'costallocationitems';
    public static EntityType = 'CostAllocationItem';

    public ID: number;
    public VatTypeID: number;
    public Percent: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Description: string;
    public Amount: number;
    public CostAllocationID: number;
    public AccountID: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public DimensionsID: number;
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
    public ID: number;
    public CurrencyCodeID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Description: string;
    public Amount: number;
    public DueDate: LocalDate;
    public IsCustomerPayment: boolean;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public EndDate: LocalDate;
    public Deleted: boolean;
    public AmountCurrency: number;
    public _createguid: string;
    public currency: CurrencyCode;
    public CustomFields: any;
}


export class DepreciationLine extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'DepreciationLine';

    public DepreciationType: number;
    public ID: number;
    public AssetJELineID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public DepreciationJELineID: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public AssetID: number;
    public Deleted: boolean;
    public _createguid: string;
    public DepreciationJELine: JournalEntryLine;
    public AssetJELine: JournalEntryLine;
    public CustomFields: any;
}


export class FinancialYear extends UniEntity {
    public static RelativeUrl = 'financialyears';
    public static EntityType = 'FinancialYear';

    public ID: number;
    public Year: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public ValidTo: LocalDate;
    public ValidFrom: LocalDate;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class JournalEntry extends UniEntity {
    public static RelativeUrl = 'journalentries';
    public static EntityType = 'JournalEntry';

    public ID: number;
    public JournalEntryNumberNumeric: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Description: string;
    public FinancialYearID: number;
    public JournalEntryAccrualID: number;
    public JournalEntryNumber: string;
    public NumberSeriesID: number;
    public UpdatedAt: Date;
    public JournalEntryDraftGroup: string;
    public StatusCode: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public NumberSeriesTaskID: number;
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

    public CurrencyExchangeRate: number;
    public AccrualID: number;
    public VatDeductionPercent: number;
    public ID: number;
    public CurrencyCodeID: number;
    public JournalEntryNumberNumeric: number;
    public RestAmountCurrency: number;
    public VatTypeID: number;
    public RestAmount: number;
    public UpdatedBy: string;
    public PaymentInfoTypeID: number;
    public VatPeriodID: number;
    public CreatedBy: string;
    public Description: string;
    public PeriodID: number;
    public RegisteredDate: LocalDate;
    public CustomerInvoiceID: number;
    public Signature: string;
    public Amount: number;
    public FinancialDate: LocalDate;
    public JournalEntryNumber: string;
    public PaymentReferenceID: number;
    public OriginalReferencePostID: number;
    public SubAccountID: number;
    public ReferenceOriginalPostID: number;
    public InvoiceNumber: string;
    public VatJournalEntryPostID: number;
    public TaxBasisAmount: number;
    public DueDate: LocalDate;
    public AccountID: number;
    public JournalEntryID: number;
    public BatchNumber: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public JournalEntryTypeID: number;
    public CreatedAt: Date;
    public ReferenceCreditPostID: number;
    public OriginalJournalEntryPost: number;
    public VatDate: LocalDate;
    public SupplierInvoiceID: number;
    public Deleted: boolean;
    public PostPostJournalEntryLineID: number;
    public DimensionsID: number;
    public VatReportID: number;
    public AmountCurrency: number;
    public VatPercent: number;
    public JournalEntryLineDraftID: number;
    public TaxBasisAmountCurrency: number;
    public CustomerOrderID: number;
    public PaymentID: string;
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

    public CurrencyExchangeRate: number;
    public AccrualID: number;
    public VatDeductionPercent: number;
    public ID: number;
    public CurrencyCodeID: number;
    public JournalEntryNumberNumeric: number;
    public VatTypeID: number;
    public UpdatedBy: string;
    public PaymentInfoTypeID: number;
    public VatPeriodID: number;
    public CreatedBy: string;
    public Description: string;
    public PeriodID: number;
    public RegisteredDate: LocalDate;
    public CustomerInvoiceID: number;
    public Signature: string;
    public Amount: number;
    public FinancialDate: LocalDate;
    public JournalEntryNumber: string;
    public PaymentReferenceID: number;
    public SubAccountID: number;
    public InvoiceNumber: string;
    public TaxBasisAmount: number;
    public DueDate: LocalDate;
    public AccountID: number;
    public JournalEntryID: number;
    public BatchNumber: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public JournalEntryTypeID: number;
    public CreatedAt: Date;
    public VatDate: LocalDate;
    public SupplierInvoiceID: number;
    public Deleted: boolean;
    public PostPostJournalEntryLineID: number;
    public DimensionsID: number;
    public AmountCurrency: number;
    public VatPercent: number;
    public TaxBasisAmountCurrency: number;
    public CustomerOrderID: number;
    public PaymentID: string;
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

    public TraceLinkTypes: string;
    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public ColumnSetUp: string;
    public Name: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public VisibleModules: string;
    public _createguid: string;
    public CustomFields: any;
}


export class JournalEntrySourceSerie extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'JournalEntrySourceSerie';

    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public JournalEntrySourceID: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public JournalEntrySourceInstanceID: number;
    public _createguid: string;
    public JournalEntrySourceEntityName: string;
    public CustomFields: any;
}


export class JournalEntryType extends UniEntity {
    public static RelativeUrl = 'journalentrytypes';
    public static EntityType = 'JournalEntryType';

    public Number: number;
    public ID: number;
    public MainName: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public DisplayName: string;
    public Name: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public ExpectNegativeAmount: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class LedgerSuggestion extends UniEntity {
    public ID: number;
    public IndustryCode: string;
    public IndustryName: string;
    public BusinessType: string;
    public Source: SuggestionSource;
    public Name: string;
    public OrgNumber: string;
}


export class Payment extends UniEntity {
    public static RelativeUrl = 'payments';
    public static EntityType = 'Payment';

    public BankChargeAmount: number;
    public CurrencyExchangeRate: number;
    public OcrPaymentStrings: string;
    public IsExternal: boolean;
    public AutoJournal: boolean;
    public Domain: string;
    public SerialNumberOrAcctSvcrRef: string;
    public ID: number;
    public PaymentStatusReportFileID: number;
    public CurrencyCodeID: number;
    public PaymentDate: LocalDate;
    public PaymentCodeID: number;
    public UpdatedBy: string;
    public PaymentBatchID: number;
    public CreatedBy: string;
    public Description: string;
    public XmlTagPmtInfIdReference: string;
    public ToBankAccountID: number;
    public CustomerInvoiceID: number;
    public XmlTagEndToEndIdReference: string;
    public Amount: number;
    public IsPaymentCancellationRequest: boolean;
    public Proprietary: string;
    public InvoiceNumber: string;
    public CustomerInvoiceReminderID: number;
    public StatusText: string;
    public DueDate: LocalDate;
    public Debtor: string;
    public IsCustomerPayment: boolean;
    public ReconcilePayment: boolean;
    public IsPaymentClaim: boolean;
    public JournalEntryID: number;
    public ExternalBankAccountNumber: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public BusinessRelationID: number;
    public CreatedAt: Date;
    public FromBankAccountID: number;
    public SupplierInvoiceID: number;
    public Deleted: boolean;
    public InPaymentID: string;
    public AmountCurrency: number;
    public PaymentNotificationReportFileID: number;
    public PaymentID: string;
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

    public ReceiptDate: Date;
    public ID: number;
    public PaymentStatusReportFileID: number;
    public OcrTransmissionNumber: number;
    public PaymentFileID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public OcrHeadingStrings: string;
    public PaymentReferenceID: string;
    public Camt054CMsgId: string;
    public TransferredDate: Date;
    public IsCustomerPayment: boolean;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public TotalAmount: number;
    public Deleted: boolean;
    public PaymentBatchTypeID: number;
    public NumberOfPayments: number;
    public _createguid: string;
    public Payments: Array<Payment>;
    public PaymentBatchType: PaymentBatchType;
    public CustomFields: any;
}


export class PostPost extends UniEntity {
    public static RelativeUrl = 'postposts';
    public static EntityType = 'PostPost';

    public CurrencyExchangeRate: number;
    public ID: number;
    public CurrencyCodeID: number;
    public Date: LocalDate;
    public UpdatedBy: string;
    public CreatedBy: string;
    public JournalEntryLine2ID: number;
    public JournalEntryLine1ID: number;
    public Amount: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public AmountCurrency: number;
    public _createguid: string;
    public JournalEntryLine1: JournalEntryLine;
    public JournalEntryLine2: JournalEntryLine;
    public CurrencyCode: CurrencyCode;
    public CustomFields: any;
}


export class ReInvoice extends UniEntity {
    public static RelativeUrl = 'reinvoicing';
    public static EntityType = 'ReInvoice';

    public ReInvoicingType: number;
    public ID: number;
    public OwnCostAmount: number;
    public UpdatedBy: string;
    public TaxInclusiveAmount: number;
    public CreatedBy: string;
    public OwnCostShare: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public SupplierInvoiceID: number;
    public ProductID: number;
    public Deleted: boolean;
    public TaxExclusiveAmount: number;
    public _createguid: string;
    public SupplierInvoice: SupplierInvoice;
    public Product: Product;
    public Items: Array<ReInvoiceItem>;
    public CustomFields: any;
}


export class ReInvoiceItem extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ReInvoiceItem';

    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public ReInvoiceID: number;
    public NetAmount: number;
    public GrossAmount: number;
    public Vat: number;
    public Share: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CustomerID: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public Surcharge: number;
    public _createguid: string;
    public Customer: Customer;
    public CustomFields: any;
}


export class SupplierInvoice extends UniEntity {
    public static RelativeUrl = 'supplierinvoices';
    public static EntityType = 'SupplierInvoice';

    public CurrencyExchangeRate: number;
    public DeliveryName: string;
    public CreditedAmountCurrency: number;
    public IsSentToPayment: boolean;
    public ShippingPostalCode: string;
    public ShippingCountry: string;
    public DeliveryTerm: string;
    public ShippingAddressLine2: string;
    public ID: number;
    public CurrencyCodeID: number;
    public ShippingAddressLine3: string;
    public RestAmountCurrency: number;
    public RestAmount: number;
    public FreeTxt: string;
    public InvoiceCity: string;
    public PaymentTermsID: number;
    public UpdatedBy: string;
    public TaxInclusiveAmount: number;
    public CreatedBy: string;
    public InvoiceCountry: string;
    public VatTotalsAmount: number;
    public InvoiceReferenceID: number;
    public InvoiceType: number;
    public VatTotalsAmountCurrency: number;
    public TaxExclusiveAmountCurrency: number;
    public InternalNote: string;
    public PaymentStatus: number;
    public InvoiceAddressLine2: string;
    public PrintStatus: number;
    public PaymentDueDate: LocalDate;
    public Requisition: string;
    public ReInvoiceID: number;
    public DefaultDimensionsID: number;
    public AmountRegards: string;
    public PaymentInformation: string;
    public InvoiceAddressLine1: string;
    public InvoiceCountryCode: string;
    public InvoiceAddressLine3: string;
    public CustomerOrgNumber: string;
    public SupplierOrgNumber: string;
    public CustomerPerson: string;
    public YourReference: string;
    public Payment: string;
    public Comment: string;
    public InvoiceNumber: string;
    public ProjectID: number;
    public PayableRoundingAmount: number;
    public ReInvoiced: boolean;
    public TaxInclusiveAmountCurrency: number;
    public PaymentTerm: string;
    public ShippingCountryCode: string;
    public CreditDays: number;
    public InvoicePostalCode: string;
    public InvoiceDate: LocalDate;
    public JournalEntryID: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public Credited: boolean;
    public InvoiceReceiverName: string;
    public DeliveryTermsID: number;
    public SalesPerson: string;
    public OurReference: string;
    public BankAccountID: number;
    public Deleted: boolean;
    public ShippingAddressLine1: string;
    public DeliveryMethod: string;
    public TaxExclusiveAmount: number;
    public CreditedAmount: number;
    public PayableRoundingCurrencyAmount: number;
    public SupplierID: number;
    public DeliveryDate: LocalDate;
    public PaymentID: string;
    public ShippingCity: string;
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

    public CurrencyExchangeRate: number;
    public Discount: number;
    public PriceSetByUser: boolean;
    public ID: number;
    public CurrencyCodeID: number;
    public PriceExVat: number;
    public VatTypeID: number;
    public InvoicePeriodEndDate: LocalDate;
    public SumTotalExVatCurrency: number;
    public AccountingCost: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public ItemText: string;
    public InvoicePeriodStartDate: LocalDate;
    public DiscountCurrency: number;
    public SumTotalIncVatCurrency: number;
    public Comment: string;
    public Unit: string;
    public SumVat: number;
    public SumVatCurrency: number;
    public UpdatedAt: Date;
    public SumTotalExVat: number;
    public SortIndex: number;
    public StatusCode: number;
    public CreatedAt: Date;
    public PriceIncVat: number;
    public SupplierInvoiceID: number;
    public ProductID: number;
    public Deleted: boolean;
    public NumberOfItems: number;
    public CalculateGrossPriceBasedOnNetPrice: boolean;
    public SumTotalIncVat: number;
    public DimensionsID: number;
    public VatPercent: number;
    public PriceExVatCurrency: number;
    public DiscountPercent: number;
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

    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public No: string;
    public Name: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class VatDeduction extends UniEntity {
    public static RelativeUrl = 'vatdeductions';
    public static EntityType = 'VatDeduction';

    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public ValidTo: LocalDate;
    public VatDeductionGroupID: number;
    public ValidFrom: LocalDate;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public DeductionPercent: number;
    public Deleted: boolean;
    public _createguid: string;
    public VatDeductionGroup: VatDeductionGroup;
    public CustomFields: any;
}


export class VatDeductionGroup extends UniEntity {
    public static RelativeUrl = 'vatdeductiongroups';
    public static EntityType = 'VatDeductionGroup';

    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Name: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class VatPost extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'VatPost';

    public ID: number;
    public HasTaxAmount: boolean;
    public HasTaxBasis: boolean;
    public UpdatedBy: string;
    public CreatedBy: string;
    public No: string;
    public VatCodeGroupID: number;
    public Name: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public ReportAsNegativeAmount: boolean;
    public _createguid: string;
    public VatCodeGroup: VatCodeGroup;
    public VatReportReferences: Array<VatReportReference>;
    public CustomFields: any;
}


export class VatReport extends UniEntity {
    public static RelativeUrl = 'vatreports';
    public static EntityType = 'VatReport';

    public ExecutedDate: Date;
    public ID: number;
    public VatReportTypeID: number;
    public TerminPeriodID: number;
    public ReportedDate: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public InternalComment: string;
    public Comment: string;
    public Title: string;
    public ExternalRefNo: string;
    public VatReportArchivedSummaryID: number;
    public JournalEntryID: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public Deleted: boolean;
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

    public PaymentToDescription: string;
    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public PaymentYear: number;
    public PaymentDueDate: Date;
    public AmountToBeReceived: number;
    public PaymentBankAccountNumber: string;
    public SummaryHeader: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public ReportName: string;
    public AmountToBePayed: number;
    public Deleted: boolean;
    public PaymentPeriod: string;
    public PaymentID: string;
    public _createguid: string;
    public CustomFields: any;
}


export class VatReportReference extends UniEntity {
    public static RelativeUrl = 'vatreportreferences';
    public static EntityType = 'VatReportReference';

    public ID: number;
    public VatTypeID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public AccountID: number;
    public UpdatedAt: Date;
    public VatPostID: number;
    public StatusCode: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public _createguid: string;
    public VatType: VatType;
    public VatPost: VatPost;
    public Account: Account;
    public CustomFields: any;
}


export class VatReportType extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'VatReportType';

    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Name: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class VatType extends UniEntity {
    public static RelativeUrl = 'vattypes';
    public static EntityType = 'VatType';

    public ReversedTaxDutyVat: boolean;
    public ID: number;
    public IncomingAccountID: number;
    public VatTypeSetupID: number;
    public DirectJournalEntryOnly: boolean;
    public OutgoingAccountID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public VatCodeGroupingValue: VatCodeGroupingValueEnum;
    public Locked: boolean;
    public OutputVat: boolean;
    public InUse: boolean;
    public VatCode: string;
    public Alias: string;
    public AvailableInModules: boolean;
    public VatCodeGroupID: number;
    public Name: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public Visible: boolean;
    public _createguid: string;
    public VatPercent: number;
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

    public ID: number;
    public VatTypeID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public ValidTo: LocalDate;
    public ValidFrom: LocalDate;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public VatPercent: number;
    public _createguid: string;
    public CustomFields: any;
}


export class VippsInvoice extends UniEntity {
    public static RelativeUrl = 'vipps-invoices';
    public static EntityType = 'VippsInvoice';

    public ID: number;
    public Subject: string;
    public InvoiceRef: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Amount: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public InvoiceID: string;
    public Deleted: boolean;
    public BankAccountNumber: string;
    public Due: string;
    public MobileNumber: string;
    public _createguid: string;
    public CustomFields: any;
}


export class EntityValidationRule extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'EntityValidationRule';

    public Operation: OperationType;
    public ID: number;
    public Operator: Operator;
    public OnConflict: OnConflict;
    public Level: ValidationLevel;
    public UpdatedBy: string;
    public Value: string;
    public CreatedBy: string;
    public Message: string;
    public System: boolean;
    public EntityType: string;
    public PropertyName: string;
    public UpdatedAt: Date;
    public SyncKey: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public ChangedByCompany: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class EntityValidationRuleTemplate extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'EntityValidationRuleTemplate';

    public Operation: OperationType;
    public ID: number;
    public Operator: Operator;
    public OnConflict: OnConflict;
    public Level: ValidationLevel;
    public UpdatedBy: string;
    public Value: string;
    public CreatedBy: string;
    public Message: string;
    public System: boolean;
    public EntityType: string;
    public PropertyName: string;
    public UpdatedAt: Date;
    public SyncKey: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public ChangedByCompany: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class ComplexValidationRule extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ComplexValidationRule';

    public Operation: OperationType;
    public ValidationCode: number;
    public ID: number;
    public OnConflict: OnConflict;
    public Level: ValidationLevel;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Message: string;
    public System: boolean;
    public EntityType: string;
    public UpdatedAt: Date;
    public SyncKey: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public ChangedByCompany: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class ComplexValidationRuleTemplate extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ComplexValidationRuleTemplate';

    public Operation: OperationType;
    public ValidationCode: number;
    public ID: number;
    public OnConflict: OnConflict;
    public Level: ValidationLevel;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Message: string;
    public System: boolean;
    public EntityType: string;
    public UpdatedAt: Date;
    public SyncKey: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public ChangedByCompany: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class CustomField extends UniEntity {
    public static RelativeUrl = 'custom-fields';
    public static EntityType = 'CustomField';

    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Nullable: boolean;
    public ModelID: number;
    public Name: string;
    public UpdatedAt: Date;
    public DataType: string;
    public StatusCode: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class ValueList extends UniEntity {
    public static RelativeUrl = 'valuelists';
    public static EntityType = 'ValueList';

    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Description: string;
    public Code: string;
    public Name: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public _createguid: string;
    public Items: Array<ValueItem>;
    public CustomFields: any;
}


export class ValueItem extends UniEntity {
    public static RelativeUrl = 'valueitems';
    public static EntityType = 'ValueItem';

    public ID: number;
    public UpdatedBy: string;
    public Value: string;
    public CreatedBy: string;
    public Description: string;
    public ValueListID: number;
    public Code: string;
    public Name: string;
    public Index: number;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public _createguid: string;
    public ValueList: ValueList;
    public CustomFields: any;
}


export class ComponentLayoutDto extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ComponentLayoutDto';

    public Url: string;
    public Name: string;
    public BaseEntity: string;
    public Fields: Array<FieldLayoutDto>;
    public CustomFields: any;
}


export class FieldLayoutDto extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'FieldLayoutDto';

    public FieldSet: number;
    public Label: string;
    public Url: string;
    public ID: number;
    public Alignment: Alignment;
    public LookupEntityType: string;
    public Property: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Description: string;
    public HelpText: string;
    public Placement: number;
    public Combo: number;
    public LookupField: boolean;
    public DisplayField: string;
    public EntityType: string;
    public ReadOnly: boolean;
    public Options: string;
    public Width: string;
    public LineBreak: boolean;
    public Legend: string;
    public ValueList: string;
    public Placeholder: string;
    public ComponentLayoutID: number;
    public FieldType: FieldType;
    public UpdatedAt: Date;
    public Hidden: boolean;
    public StatusCode: number;
    public CreatedAt: Date;
    public Section: number;
    public Deleted: boolean;
    public Sectionheader: string;
    public _createguid: string;
    public Validations: Array<EntityValidationRule>;
    public CustomFields: any;
}


export class AssignmentDetails extends UniEntity {
    public Message: string;
    public UserIDs: string;
    public TeamIDs: string;
}


export class TimeSheet extends UniEntity {
    public Workflow: TimesheetWorkflow;
    public ToDate: Date;
    public FromDate: Date;
    public Relation: WorkRelation;
    public Items: Array<TimeSheetItem>;
}


export class TimeSheetItem extends UniEntity {
    public IsWeekend: boolean;
    public SickTime: number;
    public StartTime: Date;
    public Projecttime: number;
    public Date: Date;
    public WeekDay: number;
    public ValidTime: number;
    public Status: WorkStatus;
    public EndTime: Date;
    public Workflow: TimesheetWorkflow;
    public Invoicable: number;
    public ExpectedTime: number;
    public TotalTime: number;
    public WeekNumber: number;
    public Flextime: number;
    public TimeOff: number;
    public ValidTimeOff: number;
    public Overtime: number;
}


export class WorkBalanceDto extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'WorkBalanceDto';

    public ID: number;
    public IsStartBalance: boolean;
    public Minutes: number;
    public UpdatedBy: string;
    public SumOvertime: number;
    public WorkRelationID: number;
    public CreatedBy: string;
    public Description: string;
    public ActualMinutes: number;
    public ExpectedMinutes: number;
    public LastDayActual: number;
    public BalanceFrom: Date;
    public Balancetype: WorkBalanceTypeEnum;
    public ValidFrom: Date;
    public Days: number;
    public LastDayExpected: number;
    public UpdatedAt: Date;
    public BalanceDate: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public ValidTimeOff: number;
    public Deleted: boolean;
    public _createguid: string;
    public WorkRelation: WorkRelation;
    public Previous: BalanceInfo;
    public Details: Array<FlexDetail>;
    public CustomFields: any;
}


export class BalanceInfo extends UniEntity {
    public ID: number;
    public Minutes: number;
    public Description: string;
    public BalanceDate: Date;
}


export class FlexDetail extends UniEntity {
    public IsWeekend: boolean;
    public Date: Date;
    public ExpectedMinutes: number;
    public ValidTimeOff: number;
    public WorkedMinutes: number;
}


export class ContactSearchServiceResponse extends UniEntity {
    public ErrorCode: number;
    public ObjectName: string;
    public Method: string;
    public ErrorMessage: string;
    public Success: boolean;
}


export class InvoicesAndRemindersReadyToRemind extends UniEntity {
    public CurrencyExchangeRate: number;
    public Fee: number;
    public CurrencyCodeID: number;
    public RestAmountCurrency: number;
    public RestAmount: number;
    public TaxInclusiveAmount: number;
    public CustomerName: string;
    public CustomerNumber: number;
    public CurrencyCodeShortCode: string;
    public CustomerInvoiceID: number;
    public EmailAddress: string;
    public Interest: number;
    public DontSendReminders: boolean;
    public InvoiceNumber: number;
    public CustomerInvoiceReminderID: number;
    public DueDate: Date;
    public TaxInclusiveAmountCurrency: number;
    public InvoiceDate: Date;
    public ReminderNumber: number;
    public ExternalReference: string;
    public StatusCode: number;
    public CustomerID: number;
    public CurrencyCodeCode: string;
}


export class TradeHeaderCalculationSummary extends UniEntity {
    public SumDiscountCurrency: number;
    public SumNoVatBasis: number;
    public SumVatBasisCurrency: number;
    public SumVatBasis: number;
    public SumTotalExVatCurrency: number;
    public DecimalRounding: number;
    public DecimalRoundingCurrency: number;
    public SumTotalIncVatCurrency: number;
    public SumNoVatBasisCurrency: number;
    public SumVat: number;
    public SumVatCurrency: number;
    public SumTotalExVat: number;
    public SumDiscount: number;
    public SumTotalIncVat: number;
}


export class VatCalculationSummary extends UniEntity {
    public SumVatBasisCurrency: number;
    public SumVatBasis: number;
    public SumVat: number;
    public SumVatCurrency: number;
    public VatPercent: number;
}


export class InvoicePaymentData extends UniEntity {
    public BankChargeAmount: number;
    public CurrencyExchangeRate: number;
    public CurrencyCodeID: number;
    public PaymentDate: LocalDate;
    public BankChargeAccountID: number;
    public Amount: number;
    public AccountID: number;
    public FromBankAccountID: number;
    public AgioAmount: number;
    public DimensionsID: number;
    public AmountCurrency: number;
    public AgioAccountID: number;
    public PaymentID: string;
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
    public Message: string;
    public Status: string;
    public CostPercentage: number;
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
    public RemainingLimit: number;
    public MaxInvoiceAmount: number;
    public Limit: number;
}


export class AmeldingAgaAndTaxSums extends UniEntity {
    public KIDFinancialTax: string;
    public AccountNumber: string;
    public KIDEmploymentTax: string;
    public KIDTaxDraw: string;
    public MessageID: string;
    public DueDate: Date;
    public FinancialTax: number;
    public EmploymentTax: number;
    public TaxDraw: number;
    public period: number;
}


export class PayrollRunInAmeldingPeriod extends UniEntity {
    public PayrollrunPaydate: Date;
    public PayrollrunDescription: string;
    public PayrollrunID: number;
    public CanGenerateAddition: boolean;
    public AmeldingSentdate: Date;
}


export class PayAgaTaxDTO extends UniEntity {
    public payFinancialTax: boolean;
    public payDate: Date;
    public payTaxDraw: boolean;
    public correctPennyDiff: boolean;
    public payAga: boolean;
}


export class AmeldingSumUp extends UniEntity {
    public sent: Date;
    public ID: number;
    public year: number;
    public ReplacesAMeldingID: number;
    public meldingsID: string;
    public status: AmeldingStatus;
    public type: AmeldingType;
    public generated: Date;
    public Replaces: string;
    public altInnStatus: string;
    public LegalEntityNo: string;
    public period: number;
    public entities: Array<AmeldingEntity>;
    public agadetails: Array<AGADetails>;
    public totals: Totals;
}


export class AmeldingEntity extends UniEntity {
    public name: string;
    public orgNumber: string;
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
    public startDate: Date;
    public arbeidsforholdId: string;
    public endDate: Date;
    public permisjon: Array<EmploymentLeaves>;
}


export class EmploymentLeaves extends UniEntity {
    public sluttdato: Date;
    public beskrivelse: string;
    public permisjonsprosent: string;
    public permisjonsId: string;
    public startdato: Date;
}


export class TransactionTypes extends UniEntity {
    public incomeType: string;
    public Base_EmploymentTax: boolean;
    public description: string;
    public amount: number;
    public tax: boolean;
    public benefit: string;
}


export class AGADetails extends UniEntity {
    public baseAmount: number;
    public sectorName: string;
    public zoneName: string;
    public type: string;
    public rate: number;
}


export class Totals extends UniEntity {
    public sumAGA: number;
    public sumTax: number;
}


export class AnnualStatement extends UniEntity {
    public EmployerPhoneNumber: string;
    public EmployeeNumber: number;
    public EmployerPostCode: string;
    public Year: number;
    public EmployerAddress: string;
    public EmployerOrgNr: string;
    public VacationPayBase: number;
    public EmployerWebAddress: string;
    public EmployeeMunicipalNumber: string;
    public EmployeeMunicipalName: string;
    public EmployerTaxMandatory: boolean;
    public EmployeeCity: string;
    public EmployerCity: string;
    public EmployeePostCode: string;
    public EmployerName: string;
    public EmployeeSSn: string;
    public EmployerEmail: string;
    public EmployerCountryCode: string;
    public EmployeeAddress: string;
    public EmployerCountry: string;
    public EmployeeName: string;
    public Contributions: Array<AnnualStatementLine>;
    public PensionOrBenefits: Array<AnnualStatementLine>;
    public Deductions: Array<AnnualStatementLine>;
    public Draws: Array<AnnualStatementLine>;
}


export class AnnualStatementLine extends UniEntity {
    public LineIndex: number;
    public Description: string;
    public Sum: number;
    public Amount: number;
    public TaxReturnPost: string;
    public SupplementPackageName: string;
    public IsDeduction: boolean;
    public Supplements: Array<SupplementInfo>;
}


export class SupplementInfo extends UniEntity {
    public ValueBool: boolean;
    public ValueDate2: Date;
    public ValueString: string;
    public ValueMoney: number;
    public ValueType: Valuetype;
    public ValueDate: Date;
    public Name: string;
    public WageTypeSupplementID: number;
}


export class AnnualStatementReportSetup extends UniEntity {
    public EmpIDs: string;
    public Mail: AnnualStatementEmailInfo;
}


export class AnnualStatementEmailInfo extends UniEntity {
    public Subject: string;
    public Message: string;
}


export class HandleState extends UniEntity {
    public inState: State;
}


export class TaxCardReadStatus extends UniEntity {
    public mainStatus: string;
    public Title: string;
    public Text: string;
    public IsJob: boolean;
    public employeestatus: Array<EmployeeStatus>;
}


export class EmployeeStatus extends UniEntity {
    public employeeNumber: number;
    public year: number;
    public info: string;
    public status: string;
    public ssn: string;
    public employeeID: number;
    public changedFields: Array<FieldsChanged>;
}


export class FieldsChanged extends UniEntity {
    public valTo: string;
    public valFrom: string;
    public fieldName: string;
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
    public advancePayment: number;
    public netPayment: number;
    public sumTax: number;
    public pension: number;
    public grossPayment: number;
    public taxBase: number;
    public employeeID: number;
    public paidHolidaypay: number;
    public baseVacation: number;
}


export class VacationPayLastYear extends UniEntity {
    public employeeID: number;
    public paidHolidayPay: number;
    public baseVacation: number;
}


export class SalaryTransactionPay extends UniEntity {
    public CompanyCity: string;
    public CompanyName: string;
    public Withholding: number;
    public PaymentDate: Date;
    public CompanyAddress: string;
    public SalaryBankAccountID: number;
    public CompanyBankAccountID: number;
    public TaxBankAccountID: number;
    public CompanyPostalCode: string;
    public PayList: Array<SalaryTransactionPayLine>;
    public SalaryBalancePayList: Array<SalaryBalancePayLine>;
}


export class SalaryTransactionPayLine extends UniEntity {
    public Address: string;
    public EmployeeNumber: number;
    public City: string;
    public NetPayment: number;
    public Tax: number;
    public PostalCode: string;
    public Account: string;
    public EmployeeName: string;
}


export class SalaryBalancePayLine extends UniEntity {
    public Sum: number;
    public Kid: string;
    public Text: string;
    public Account: string;
}


export class PostingSummary extends UniEntity {
    public SubEntity: SubEntity;
    public PayrollRun: PayrollRun;
    public PostList: Array<JournalEntryLine>;
}


export class PaycheckReportSetup extends UniEntity {
    public EmpIDs: string;
    public Mail: PaycheckEmailInfo;
}


export class PaycheckEmailInfo extends UniEntity {
    public Subject: string;
    public ReportID: number;
    public Message: string;
    public GroupByWageType: boolean;
}


export class WorkItemToSalary extends UniEntity {
    public PayrollRunID: number;
    public Rate: number;
    public WageType: WageType;
    public Employment: Employment;
    public WorkItems: Array<WorkItem>;
}


export class Reconciliation extends UniEntity {
    public ToPeriod: number;
    public Year: number;
    public BookedPayruns: number;
    public CreatedPayruns: number;
    public CalculatedPayruns: number;
    public FromPeriod: number;
    public Groups: Array<ReconciliationGroup>;
}


export class ReconciliationGroup extends UniEntity {
    public AccountNumber: string;
    public Sum: number;
    public Lines: Array<ReconciliationLine>;
}


export class ReconciliationLine extends UniEntity {
    public IncomeType: string;
    public Description: string;
    public WageTypeNumber: number;
    public Sum: number;
    public WageTypeName: string;
    public HasEmploymentTax: boolean;
    public Benefit: string;
}


export class UnionReport extends UniEntity {
    public Year: number;
    public ToDate: LocalDate;
    public FromDate: LocalDate;
    public Summaries: Array<UnionSummary>;
}


export class UnionSummary extends UniEntity {
    public SupplierID: number;
    public Supplier: Supplier;
    public Members: Array<UnionMember>;
}


export class UnionMember extends UniEntity {
    public MemberNumber: string;
    public Ensurance: number;
    public Name: string;
    public UnionDraw: number;
    public OUO: number;
}


export class SalaryTransactionSums extends UniEntity {
    public paidAdvance: number;
    public percentTax: number;
    public netPayment: number;
    public calculatedAGA: number;
    public baseTableTax: number;
    public calculatedFinancialTax: number;
    public tableTax: number;
    public manualTax: number;
    public basePercentTax: number;
    public Payrun: number;
    public Employee: number;
    public grossPayment: number;
    public paidPension: number;
    public baseAGA: number;
    public calculatedVacationPay: number;
    public baseVacation: number;
}


export class SalaryTransactionPeriodSums extends UniEntity {
    public ToPeriod: number;
    public MunicipalName: string;
    public AgaRate: number;
    public Year: number;
    public AgaZone: string;
    public FromPeriod: number;
    public OrgNumber: string;
    public Sums: SalaryTransactionSums;
    public Aga: AGACalculation;
}


export class code extends UniEntity {
    public gyldigtil: string;
    public skatteOgAvgiftregel: string;
    public uninavn: string;
    public fordel: string;
    public postnr: string;
    public kunfranav: string;
    public gmlcode: string;
    public gyldigfom: string;
    public inngaarIGrunnlagForTrekk: string;
    public utloeserArbeidsgiveravgift: string;
    public loennsinntekt: Loennsinntekt;
    public ytelseFraOffentlige: YtelseFraOffentlige;
    public pensjonEllerTrygd: PensjonEllerTrygd;
    public naeringsinntekt: Naeringsinntekt;
    public fradrag: Fradrag;
    public forskuddstrekk: Forskuddstrekk;
}


export class Loennsinntekt extends UniEntity {
    public antall: number;
    public antallSpecified: boolean;
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
    public CompanyName: string;
    public ContractID: number;
    public LicenseKey: string;
    public CopyFiles: boolean;
    public IsTest: boolean;
    public TemplateCompanyKey: string;
    public IsTemplate: boolean;
    public ProductNames: string;
    public CompanySettings: CompanySettings;
}


export class UserDto extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'UserDto';

    public ID: number;
    public IsAutobankAdmin: boolean;
    public UserName: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public DisplayName: string;
    public TwoFactorEnabled: boolean;
    public PhoneNumber: string;
    public Protected: boolean;
    public GlobalIdentity: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public Email: string;
    public LastLogin: Date;
    public BankIntegrationUserName: string;
    public PermissionHandling: string;
    public HasAgreedToImportDisclaimer: boolean;
    public _createguid: string;
    public License: UserLicenseInformation;
    public CustomFields: any;
}


export class UserLicenseInformation extends UniEntity {
    public UserLicenseKey: string;
    public Comment: string;
    public Name: string;
    public GlobalIdentity: string;
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
    public TypeName: string;
    public TypeID: number;
    public EndDate: Date;
}


export class CompanyLicenseInfomation extends UniEntity {
    public ID: number;
    public ContractID: number;
    public Key: string;
    public ContactPerson: string;
    public Name: string;
    public ContactEmail: string;
    public StatusCode: LicenseEntityStatus;
    public EndDate: Date;
    public Agency: Agency;
}


export class Agency extends UniEntity {
    public CompanyKey: string;
    public Name: string;
}


export class ContractLicenseType extends UniEntity {
    public StartDate: Date;
    public TypeName: string;
    public TypeID: number;
    public TrialExpiration: Date;
}


export class LicenseAgreementInfo extends UniEntity {
    public AgreementId: number;
    public HasAgreedToLicense: boolean;
}


export class CreateBankUserDTO extends UniEntity {
    public Password: string;
    public AdminPassword: string;
    public IsAdmin: boolean;
    public Phone: string;
    public AdminUserId: number;
}


export class ChangeAutobankPasswordDTO extends UniEntity {
    public NewPassword: string;
    public Password: string;
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
    public UsedFreeAmount: number;
    public GrantSum: number;
}


export class AuthenticationChallengeBE extends UniEntity {
    public ValidTo: Date;
    public Message: string;
    public Status: ChallengeRequestResult;
    public ValidFrom: Date;
    public ExtensionData: ExtensionDataObject;
}


export class ExtensionDataObject extends UniEntity {
}


export class AltinnAuthRequest extends UniEntity {
    public UserID: string;
    public UserPassword: string;
    public PreferredLogin: string;
}


export class A06Options extends UniEntity {
    public ToPeriod: Maaned;
    public Year: number;
    public ReportType: ReportType;
    public IncludeInfoPerPerson: boolean;
    public FromPeriod: Maaned;
    public IncludeIncome: boolean;
    public IncludeEmployments: boolean;
}


export class A07Response extends UniEntity {
    public mainStatus: string;
    public DataName: string;
    public Title: string;
    public Text: string;
    public Data: string;
    public DataType: string;
}


export class SelfEmployed extends UniEntity {
    public year: number;
    public items: Array<SelfEmployedItem>;
}


export class SelfEmployedItem extends UniEntity {
    public number: string;
    public amount: number;
    public name: string;
    public supplierID: number;
}


export class SetIntegrationDataDto extends UniEntity {
    public ExternalId: string;
    public IntegrationKey: string;
}


export class CurrencyRateData extends UniEntity {
    public IsOverrideRate: boolean;
    public ExchangeRate: number;
    public Factor: number;
    public FromCurrencyCode: CurrencyCode;
}


export class EmailDTO extends UniEntity {
    public CopyAddress: string;
    public Subject: string;
    public ReportID: number;
    public Message: string;
    public FromAddress: string;
    public Format: string;
    public Parameters: Array<ReportParameter>;
}


export class ReportParameter extends UniEntity {
    public Value: string;
    public Name: string;
}


export class SendEmail extends UniEntity {
    public CopyAddress: string;
    public Subject: string;
    public ReportID: number;
    public Message: string;
    public EntityID: number;
    public EntityType: string;
    public Localization: string;
    public FromAddress: string;
    public ExternalReference: string;
    public ReportName: string;
    public Attachments: Array<SendEmailAttachment>;
    public Parameters: Array<ReportParameter>;
}


export class SendEmailAttachment extends UniEntity {
    public FileID: number;
    public Attachment: string;
    public FileName: string;
}


export class RssList extends UniEntity {
    public Url: string;
    public Description: string;
    public Title: string;
    public Items: Array<RssItem>;
}


export class RssItem extends UniEntity {
    public Category: string;
    public Description: string;
    public Guid: string;
    public PubDate: string;
    public Link: string;
    public Title: string;
    public Enclosure: Enclosure;
}


export class Enclosure extends UniEntity {
    public Url: string;
    public Type: string;
    public Length: string;
}


export class TeamReport extends UniEntity {
    public ToDate: LocalDate;
    public FromDate: LocalDate;
    public Team: Team;
    public Members: Array<MemberDetails>;
}


export class MemberDetails extends UniEntity {
    public MinutesWorked: number;
    public TotalBalance: number;
    public ExpectedMinutes: number;
    public Name: string;
    public ReportBalance: number;
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
    public contactname: string;
    public orgno: string;
    public contactemail: string;
    public contactphone: string;
}


export class ServiceMetadataDto extends UniEntity {
    public ServiceName: string;
    public SupportEmail: string;
}


export class AccountUsageReference extends UniEntity {
    public Info: string;
    public EntityID: number;
    public Entity: string;
}


export class MandatoryDimensionAccountReport extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'MandatoryDimensionAccountReport';

    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public AccountNumber: string;
    public MissingOnlyWarningsDimensionsMessage: string;
    public AccountID: number;
    public MissingRequiredDimensionsMessage: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public DimensionsID: number;
    public journalEntryLineDraftID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class AccountDimension extends UniEntity {
    public AccountNumber: number;
    public AccountID: number;
    public DimensionsID: number;
    public Dimensions: Dimensions;
}


export class AssetReportDTO extends UniEntity {
    public Number: number;
    public GroupName: string;
    public BalanceAccountNumber: number;
    public CurrentValue: number;
    public LastDepreciation: LocalDate;
    public Name: string;
    public Lifetime: number;
    public GroupCode: string;
    public DepreciationAccountNumber: number;
    public BalanceAccountName: string;
    public Lines: Array<AssetReportLineDTO>;
}


export class AssetReportLineDTO extends UniEntity {
    public Date: LocalDate;
    public Value: number;
    public Type: string;
    public TypeID: number;
}


export class BankData extends UniEntity {
    public AccountNumber: string;
    public IBAN: string;
    public Bank: Bank;
}


export class CreateBankIntegrationDTO extends UniEntity {
    public IsInbound: boolean;
    public Password: string;
    public UserName: string;
    public BankAcceptance: boolean;
    public RequireTwoStage: boolean;
    public IsOutgoing: boolean;
    public TuserName: string;
    public DisplayName: string;
    public IsBankBalance: boolean;
    public Phone: string;
    public Bank: string;
    public BankApproval: boolean;
    public BankAccountID: number;
    public Email: string;
    public IsBankStatement: boolean;
    public ServiceProvider: number;
    public BankAccounts: Array<BankAccountDTO>;
}


export class BankAccountDTO extends UniEntity {
    public IsInbound: boolean;
    public IsOutgoing: boolean;
    public Bic: string;
    public IsBankBalance: boolean;
    public BBAN: string;
    public IsBankStatement: boolean;
    public IBAN: string;
}


export class ZdataUpdateBankProperties extends UniEntity {
    public IsInbound: boolean;
    public Password: string;
    public IsOutgoing: boolean;
    public ServiceID: string;
    public IsBankBalance: boolean;
    public IsBankStatement: boolean;
}


export class AutobankUserDTO extends UniEntity {
    public Password: string;
    public UserID: number;
    public IsAdmin: boolean;
    public Phone: string;
}


export class UpdateServiceStatusDTO extends UniEntity {
    public ServiceID: string;
    public StatusCode: StatusCodeBankIntegrationAgreement;
}


export class UpdateServiceIDDTO extends UniEntity {
    public NewServiceID: string;
    public ServiceID: string;
}


export class BankMatchSuggestion extends UniEntity {
    public JournalEntryLineID: number;
    public Group: string;
    public Amount: number;
    public BankStatementEntryID: number;
}


export class MatchRequest extends UniEntity {
    public JournalEntries: Array<MatchCandidate>;
    public BankEntries: Array<MatchCandidate>;
    public Settings: MatchSettings;
}


export class MatchCandidate extends UniEntity {
    public ID: number;
    public Date: Date;
    public Amount: number;
    public Closed: boolean;
    public IsBankEntry: boolean;
}


export class MatchSettings extends UniEntity {
    public MaxDelta: number;
    public MaxDayOffset: number;
}


export class ReconciliationStatus extends UniEntity {
    public NumberOfUnReconciled: number;
    public IsReconciled: boolean;
    public TotalUnreconciled: number;
    public Todate: Date;
    public AccountID: number;
    public FromDate: Date;
    public TotalAmount: number;
    public NumberOfItems: number;
}


export class BalanceDto extends UniEntity {
    public StartDate: Date;
    public Balance: number;
    public BalanceInStatement: number;
    public EndDate: Date;
}


export class BankfileFormat extends UniEntity {
    public IsFixed: boolean;
    public CustomFormat: BankFileCustomFormat;
    public LinePrefix: string;
    public Separator: string;
    public SkipRows: number;
    public Name: string;
    public FileExtension: string;
    public IsXml: boolean;
    public Columns: Array<BankfileColumn>;
}


export class BankfileColumn extends UniEntity {
    public FieldMapping: BankfileField;
    public StartPos: number;
    public Length: number;
    public DataType: BankfileDataType;
}


export class JournalSuggestion extends UniEntity {
    public Description: string;
    public MatchWithEntryID: number;
    public Amount: number;
    public FinancialDate: LocalDate;
    public BankStatementRuleID: number;
    public AccountID: number;
    public Account: Account;
}


export class ReportRow extends UniEntity {
    public Period6: number;
    public PrecedingBalance: number;
    public ID: number;
    public BudPeriod3: number;
    public IsSubTotal: boolean;
    public Period2: number;
    public GroupName: string;
    public Period9: number;
    public Period12: number;
    public Period8: number;
    public Period3: number;
    public BudPeriod1: number;
    public AccountNumber: number;
    public AccountName: string;
    public BudPeriod10: number;
    public BudPeriod2: number;
    public BudgetAccumulated: number;
    public SumLastYear: number;
    public Period11: number;
    public Sum: number;
    public SumPeriod: number;
    public BudPeriod7: number;
    public BudgetSum: number;
    public Period7: number;
    public Period4: number;
    public BudPeriod4: number;
    public BudPeriod5: number;
    public SubGroupName: string;
    public SumPeriodLastYearAccumulated: number;
    public SubGroupNumber: number;
    public BudPeriod9: number;
    public AccountYear: number;
    public SumPeriodAccumulated: number;
    public GroupNumber: number;
    public Period10: number;
    public BudPeriod8: number;
    public SumPeriodLastYear: number;
    public Period1: number;
    public BudPeriod11: number;
    public Period5: number;
    public BudPeriod6: number;
    public BudPeriod12: number;
}


export class BudgetImport extends UniEntity {
    public Budget: Budget;
}


export class LiquidityTableDTO extends UniEntity {
    public OverdueSupplierInvoices: number;
    public BankBalanceRefferance: BankBalanceType;
    public BankBalance: number;
    public OverdueCustomerInvoices: number;
    public Period: Array<DetailsDTO>;
}


export class DetailsDTO extends UniEntity {
    public Liquidity: number;
    public Custumer: number;
    public Supplier: number;
    public Sum: number;
    public CustomPayments: number;
    public VAT: number;
}


export class JournalEntryData extends UniEntity {
    public CurrencyExchangeRate: number;
    public VatDeductionPercent: number;
    public DebitAccountID: number;
    public CurrencyID: number;
    public JournalEntryNo: string;
    public CreditAccountNumber: number;
    public Description: string;
    public SupplierInvoiceNo: string;
    public CustomerInvoiceID: number;
    public CreditAccountID: number;
    public DebitAccountNumber: number;
    public Amount: number;
    public FinancialDate: LocalDate;
    public CreditVatTypeID: number;
    public NumberSeriesID: number;
    public InvoiceNumber: string;
    public DueDate: LocalDate;
    public JournalEntryID: number;
    public JournalEntryDataAccrualID: number;
    public DebitVatTypeID: number;
    public StatusCode: number;
    public VatDate: LocalDate;
    public SupplierInvoiceID: number;
    public PostPostJournalEntryLineID: number;
    public NumberSeriesTaskID: number;
    public AmountCurrency: number;
    public CustomerOrderID: number;
    public PaymentID: string;
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
    public PeriodSumYear2: number;
    public PeriodSumYear1: number;
    public PeriodName: string;
    public PeriodNo: number;
}


export class JournalEntryLineRequestSummary extends UniEntity {
    public SumBalance: number;
    public SumTaxBasisAmount: number;
    public SumCredit: number;
    public SumDebit: number;
    public SumLedger: number;
}


export class JournalEntryLinePostPostData extends UniEntity {
    public CurrencyExchangeRate: number;
    public ID: number;
    public MarkedAgainstJournalEntryLineID: number;
    public CurrencyCodeID: number;
    public JournalEntryNumberNumeric: number;
    public RestAmountCurrency: number;
    public SumPostPostAmount: number;
    public SumPostPostAmountCurrency: number;
    public RestAmount: number;
    public Description: string;
    public CurrencyCodeShortCode: string;
    public SubAccountNumber: number;
    public Amount: number;
    public FinancialDate: Date;
    public JournalEntryNumber: string;
    public InvoiceNumber: string;
    public MarkedAgainstJournalEntryNumber: string;
    public DueDate: Date;
    public AccountYear: number;
    public JournalEntryID: number;
    public StatusCode: number;
    public PeriodNo: number;
    public JournalEntryTypeName: string;
    public AmountCurrency: number;
    public NumberOfPayments: number;
    public PaymentID: string;
    public CurrencyCodeCode: string;
    public SubAccountName: string;
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
    public ID: number;
    public OriginalRestAmount: number;
    public RestAmountCurrency: number;
    public RestAmount: number;
    public Amount: number;
    public FinancialDate: Date;
    public JournalEntryNumber: string;
    public InvoiceNumber: string;
    public OriginalStatusCode: StatusCodeJournalEntryLine;
    public StatusCode: StatusCodeJournalEntryLine;
    public AmountCurrency: number;
    public Markings: Array<MarkingReference>;
}


export class MarkingReference extends UniEntity {
    public ID: number;
    public JournalEntryNumber: string;
}


export class SupplierInvoiceDetail extends UniEntity {
    public VatTypeName: string;
    public VatTypeID: number;
    public Description: string;
    public AccountNumber: number;
    public AccountName: string;
    public VatCode: string;
    public Amount: number;
    public InvoiceNumber: string;
    public AccountID: number;
    public InvoiceDate: Date;
    public SupplierInvoiceID: number;
    public AmountCurrency: number;
    public VatPercent: number;
    public SupplierID: number;
    public DeliveryDate: Date;
}


export class VatReportMessage extends UniEntity {
    public Level: ValidationLevel;
    public Message: string;
}


export class VatReportSummary extends UniEntity {
    public HasTaxAmount: boolean;
    public HasTaxBasis: boolean;
    public SumVatAmount: number;
    public NumberOfJournalEntryLines: number;
    public VatCodeGroupNo: string;
    public SumTaxBasisAmount: number;
    public VatCodeGroupName: string;
    public VatCodeGroupID: number;
    public IsHistoricData: boolean;
}


export class VatReportSummaryPerPost extends UniEntity {
    public VatPostNo: string;
    public VatPostName: string;
    public HasTaxAmount: boolean;
    public VatPostReportAsNegativeAmount: boolean;
    public HasTaxBasis: boolean;
    public SumVatAmount: number;
    public NumberOfJournalEntryLines: number;
    public VatCodeGroupNo: string;
    public SumTaxBasisAmount: number;
    public VatCodeGroupName: string;
    public VatCodeGroupID: number;
    public VatPostID: number;
    public IsHistoricData: boolean;
}


export class VatReportSummaryPerPostPerAccount extends UniEntity {
    public VatJournalEntryPostAccountID: number;
    public VatPostNo: string;
    public VatPostName: string;
    public VatAccountNumber: number;
    public HasTaxAmount: boolean;
    public VatPostReportAsNegativeAmount: boolean;
    public VatJournalEntryPostAccountNumber: number;
    public HasTaxBasis: boolean;
    public SumVatAmount: number;
    public NumberOfJournalEntryLines: number;
    public Description: string;
    public VatCodeGroupNo: string;
    public StdVatCode: string;
    public VatAccountID: number;
    public VatCode: string;
    public SumTaxBasisAmount: number;
    public Amount: number;
    public FinancialDate: Date;
    public JournalEntryNumber: string;
    public VatAccountName: string;
    public VatCodeGroupName: string;
    public VatJournalEntryPostAccountName: string;
    public TaxBasisAmount: number;
    public VatCodeGroupID: number;
    public VatPostID: number;
    public VatDate: Date;
    public IsHistoricData: boolean;
}


export class VatReportNotReportedJournalEntryData extends UniEntity {
    public TerminPeriodID: number;
    public SumVatAmount: number;
    public NumberOfJournalEntryLines: number;
    public SumTaxBasisAmount: number;
}


export class AltinnSigningTextResponse extends UniEntity {
    public SigningText: string;
}


export class AltinnGetVatReportDataFromAltinnResult extends UniEntity {
    public Message: string;
    public Status: AltinnGetVatReportDataFromAltinnStatus;
}


export class VippsUpdateStatus extends UniEntity {
    public StatusCode: number;
    public InvoiceID: string;
}


export class VippsUser extends UniEntity {
    public PhoneNumber: string;
}


export class AccountUsage extends UniEntity {
    public AccountNumber: number;
    public PercentWeight: number;
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


export enum ForeignWorker{
    notSet = 0,
    ForeignWorkerUSA_Canada = 1,
    ForeignWorkerFixedAga = 2,
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


export enum InternationalIDType{
    notSet = 0,
    Passportnumber = 1,
    SocialSecurityNumber = 2,
    TaxIdentificationNumber = 3,
    ValueAddedTaxNumber = 4,
}


export enum TypeOfPaymentOtp{
    FixedSalary = 0,
    HourlyPay = 1,
    PaidOnCommission = 2,
}


export enum GenderEnum{
    NotDefined = 0,
    Woman = 1,
    Man = 2,
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


export enum WorkingHoursScheme{
    notSet = 0,
    NonShift = 1,
    OffshoreWork = 2,
    ContinousShiftwork336 = 3,
    DayAndNightContinous355 = 4,
    ShiftWork = 5,
}


export enum ShipTypeOfShip{
    notSet = 0,
    Other = 1,
    DrillingPlatform = 2,
    Tourist = 3,
}


export enum ShipTradeArea{
    notSet = 0,
    Domestic = 1,
    Foreign = 2,
}


export enum ShipRegistry{
    notSet = 0,
    NorwegianInternationalShipRegister = 1,
    NorwegianOrdinaryShipRegister = 2,
    ForeignShipRegister = 3,
}


export enum RemunerationType{
    notSet = 0,
    FixedSalary = 1,
    HourlyPaid = 2,
    PaidOnCommission = 3,
    OnAgreement_Honorar = 4,
    ByPerformance = 5,
}


export enum TypeOfEmployment{
    notSet = 0,
    OrdinaryEmployment = 1,
    MaritimeEmployment = 2,
    FrilancerContratorFeeRecipient = 3,
    PensionOrOtherNonEmployedBenefits = 4,
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


export enum SalBalDrawType{
    FixedAmount = 0,
    InstalmentWithBalance = 1,
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


export enum RateTypeColumn{
    none = 0,
    Employment = 1,
    Employee = 2,
    Salary_scale = 3,
}


export enum LimitType{
    None = 0,
    Amount = 1,
    Sum = 2,
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


export enum Valuetype{
    IsString = 1,
    IsDate = 2,
    IsBool = 3,
    IsMoney = 4,
    Period = 5,
}


export enum Alignment{
    Right = 0,
    Left = 1,
    Middle = 2,
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


export enum ReportType{
    regnearkOdsV2 = 0,
    regnearkOdsV1 = 1,
    xmlFormatV2 = 2,
    maskinlesbartFormatXmlV1 = 3,
}


export enum StatusCodeBankIntegrationAgreement{
    Pending = 700001,
    WaitForSigning = 700002,
    WaitForBankApprove = 700003,
    WaitForZDataApprove = 700004,
    Active = 700005,
    Canceled = 700006,
    NeedsConfigOnBankAccounts = 700007,
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


export enum StatusCodeSharing{
    Pending = 70000,
    InProgress = 70001,
    Failed = 70002,
    Completed = 70003,
    Cancelled = 70004,
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
