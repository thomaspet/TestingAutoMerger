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

    public Action: string;
    public OldValue: string;
    public Transaction: string;
    public Route: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Field: string;
    public ClientID: string;
    public NewValue: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public EntityType: string;
    public UpdatedBy: string;
    public EntityID: number;
    public Verb: string;
    public _createguid: string;
    public CustomFields: any;
}


export class WorkBalance extends UniEntity {
    public static RelativeUrl = 'workbalances';
    public static EntityType = 'WorkBalance';

    public Description: string;
    public WorkRelationID: number;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public IsStartBalance: boolean;
    public ExpectedMinutes: number;
    public Balancetype: WorkBalanceTypeEnum;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ValidFrom: Date;
    public ID: number;
    public Minutes: number;
    public ActualMinutes: number;
    public UpdatedBy: string;
    public Days: number;
    public BalanceDate: Date;
    public BalanceFrom: Date;
    public ValidTimeOff: number;
    public _createguid: string;
    public CustomFields: any;
}


export class Worker extends UniEntity {
    public static RelativeUrl = 'workers';
    public static EntityType = 'Worker';

    public CreatedBy: string;
    public UpdatedAt: Date;
    public EmployeeID: number;
    public StatusCode: number;
    public UserID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public UpdatedBy: string;
    public BusinessRelationID: number;
    public _createguid: string;
    public Info: BusinessRelation;
    public Relations: Array<WorkRelation>;
    public Employee: Employee;
    public CustomFields: any;
}


export class WorkItem extends UniEntity {
    public static RelativeUrl = 'workitems';
    public static EntityType = 'WorkItem';

    public Description: string;
    public WorkRelationID: number;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CustomerOrderID: number;
    public TransferedToPayroll: boolean;
    public OrderItemId: number;
    public PriceExVat: number;
    public Date: Date;
    public WorkItemGroupID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public MinutesToOrder: number;
    public ID: number;
    public DimensionsID: number;
    public WorkTypeID: number;
    public LunchInMinutes: number;
    public Minutes: number;
    public TransferedToOrder: boolean;
    public UpdatedBy: string;
    public Invoiceable: boolean;
    public CustomerID: number;
    public PayrollTrackingID: number;
    public StartTime: Date;
    public Label: string;
    public EndTime: Date;
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

    public WorkRelationID: number;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
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
    public UpdatedAt: Date;
    public MinutesPerYear: number;
    public StatusCode: number;
    public LunchIncluded: boolean;
    public MinutesPerWeek: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public IsShared: boolean;
    public MinutesPerMonth: number;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class WorkRelation extends UniEntity {
    public static RelativeUrl = 'workrelations';
    public static EntityType = 'WorkRelation';

    public Description: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public IsActive: boolean;
    public StatusCode: number;
    public CompanyID: number;
    public WorkProfileID: number;
    public TeamID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public StartDate: Date;
    public CompanyName: string;
    public IsPrivate: boolean;
    public UpdatedBy: string;
    public WorkPercentage: number;
    public WorkerID: number;
    public EndTime: Date;
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

    public Description: string;
    public WorkRelationID: number;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public TimeoffType: number;
    public IsHalfDay: boolean;
    public StatusCode: number;
    public ToDate: Date;
    public Deleted: boolean;
    public CreatedAt: Date;
    public SystemKey: string;
    public ID: number;
    public RegionKey: string;
    public UpdatedBy: string;
    public FromDate: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class WorkType extends UniEntity {
    public static RelativeUrl = 'worktypes';
    public static EntityType = 'WorkType';

    public Description: string;
    public ProductID: number;
    public SystemType: WorkTypeEnum;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public Price: number;
    public ID: number;
    public WagetypeNumber: number;
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
    public UpdatedAt: Date;
    public ParentFileid: number;
    public StatusCode: number;
    public FileID: number;
    public SubCompanyID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public UpdatedBy: string;
    public Accountnumber: string;
    public _createguid: string;
    public File: File;
    public SubCompany: SubCompany;
    public CustomFields: any;
}


export class BatchInvoice extends UniEntity {
    public static RelativeUrl = 'batchinvoices';
    public static EntityType = 'BatchInvoice';

    public NumberOfBatches: number;
    public CreatedBy: string;
    public YourRef: string;
    public UpdatedAt: Date;
    public InvoiceDate: LocalDate;
    public Operation: BatchInvoiceOperation;
    public StatusCode: number;
    public SellerID: number;
    public OurRef: string;
    public NotifyEmail: boolean;
    public Processed: number;
    public DueDate: LocalDate;
    public MinAmount: number;
    public Comment: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public FreeTxt: string;
    public ID: number;
    public TotalToProcess: number;
    public UpdatedBy: string;
    public ProjectID: number;
    public CustomerID: number;
    public _createguid: string;
    public Items: Array<BatchInvoiceItem>;
    public CustomFields: any;
}


export class BatchInvoiceItem extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'BatchInvoiceItem';

    public CustomerInvoiceID: number;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public StatusCode: StatusCode;
    public CustomerOrderID: number;
    public BatchNumber: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public CommentID: number;
    public BatchInvoiceID: number;
    public UpdatedBy: string;
    public ProjectID: number;
    public CustomerID: number;
    public _createguid: string;
    public CustomerOrder: CustomerOrder;
    public CustomerInvoice: CustomerInvoice;
    public CustomFields: any;
}


export class CampaignTemplate extends UniEntity {
    public static RelativeUrl = 'campaigntemplate';
    public static EntityType = 'CampaignTemplate';

    public CreatedBy: string;
    public UpdatedAt: Date;
    public EntityName: string;
    public StatusCode: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public Template: string;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Customer extends UniEntity {
    public static RelativeUrl = 'customers';
    public static EntityType = 'Customer';

    public DeliveryTermsID: number;
    public DontSendReminders: boolean;
    public CreatedBy: string;
    public AvtaleGiro: boolean;
    public AcceptableDelta4CustomerPaymentAccountID: number;
    public UpdatedAt: Date;
    public EInvoiceAgreementReference: string;
    public CustomerNumberKidAlias: string;
    public GLN: string;
    public StatusCode: number;
    public AcceptableDelta4CustomerPayment: number;
    public DefaultCustomerQuoteReportID: number;
    public AvtaleGiroNotification: boolean;
    public PeppolAddress: string;
    public SocialSecurityNumber: string;
    public DefaultCustomerInvoiceReportID: number;
    public DefaultCustomerOrderReportID: number;
    public Localization: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public CustomerInvoiceReminderSettingsID: number;
    public OrgNumber: string;
    public CreditDays: number;
    public EfakturaIdentifier: string;
    public DefaultSellerID: number;
    public DimensionsID: number;
    public WebUrl: string;
    public PaymentTermsID: number;
    public IsPrivate: boolean;
    public SubAccountNumberSeriesID: number;
    public UpdatedBy: string;
    public CurrencyCodeID: number;
    public CustomerNumber: number;
    public DefaultDistributionsID: number;
    public BusinessRelationID: number;
    public FactoringNumber: number;
    public ReminderEmailAddress: string;
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
    public DeliveryTermsID: number;
    public DontSendReminders: boolean;
    public InvoiceNumber: string;
    public CreatedBy: string;
    public PaymentID: string;
    public Requisition: string;
    public CustomerPerson: string;
    public PayableRoundingCurrencyAmount: number;
    public UpdatedAt: Date;
    public InvoiceDate: LocalDate;
    public ShippingCountry: string;
    public ExternalReference: string;
    public StatusCode: number;
    public ShippingAddressLine3: string;
    public PaymentInfoTypeID: number;
    public CurrencyExchangeRate: number;
    public InvoiceNumberSeriesID: number;
    public InvoiceCountryCode: string;
    public ShippingCountryCode: string;
    public CreditedAmount: number;
    public CollectorStatusCode: number;
    public TaxInclusiveAmountCurrency: number;
    public Credited: boolean;
    public Payment: string;
    public BankAccountID: number;
    public UpdateCurrencyAmountsOnDateChange: boolean;
    public DeliveryMethod: string;
    public DeliveryName: string;
    public UseReportID: number;
    public InvoiceCity: string;
    public PaymentTerm: string;
    public EmailAddress: string;
    public InvoiceAddressLine2: string;
    public DefaultDimensionsID: number;
    public ShippingAddressLine2: string;
    public JournalEntryID: number;
    public ExternalStatus: number;
    public InvoicePostalCode: string;
    public SalesPerson: string;
    public OurReference: string;
    public InvoiceAddressLine1: string;
    public TaxExclusiveAmountCurrency: number;
    public CustomerName: string;
    public Comment: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ShippingAddressLine1: string;
    public ShippingPostalCode: string;
    public VatTotalsAmount: number;
    public InvoiceReceiverName: string;
    public TaxExclusiveAmount: number;
    public FreeTxt: string;
    public ID: number;
    public AccrualID: number;
    public VatTotalsAmountCurrency: number;
    public AmountRegards: string;
    public CreditDays: number;
    public InvoiceType: number;
    public PaymentDueDate: LocalDate;
    public DefaultSellerID: number;
    public PaymentTermsID: number;
    public TaxInclusiveAmount: number;
    public PrintStatus: number;
    public InvoiceCountry: string;
    public YourReference: string;
    public SupplierOrgNumber: string;
    public UpdatedBy: string;
    public RestAmount: number;
    public CurrencyCodeID: number;
    public PaymentInformation: string;
    public CustomerID: number;
    public DeliveryTerm: string;
    public ShippingCity: string;
    public DeliveryDate: LocalDate;
    public RestAmountCurrency: number;
    public PayableRoundingAmount: number;
    public CustomerOrgNumber: string;
    public InvoiceReferenceID: number;
    public InvoiceAddressLine3: string;
    public InternalNote: string;
    public DistributionPlanID: number;
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

    public CustomerInvoiceID: number;
    public ProductID: number;
    public CalculateGrossPriceBasedOnNetPrice: boolean;
    public CreatedBy: string;
    public NumberOfItems: number;
    public PriceIncVat: number;
    public UpdatedAt: Date;
    public DiscountCurrency: number;
    public StatusCode: number;
    public CurrencyExchangeRate: number;
    public InvoicePeriodStartDate: LocalDate;
    public AccountingCost: string;
    public SumTotalIncVatCurrency: number;
    public PriceExVatCurrency: number;
    public ItemText: string;
    public PriceExVat: number;
    public SumTotalExVatCurrency: number;
    public SortIndex: number;
    public InvoicePeriodEndDate: LocalDate;
    public AccountID: number;
    public Comment: string;
    public VatPercent: number;
    public Unit: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public SumTotalIncVat: number;
    public CostPrice: number;
    public ID: number;
    public PriceSetByUser: boolean;
    public DiscountPercent: number;
    public SumVat: number;
    public DimensionsID: number;
    public SumTotalExVat: number;
    public ItemSourceID: number;
    public UpdatedBy: string;
    public CurrencyCodeID: number;
    public SumVatCurrency: number;
    public VatTypeID: number;
    public Discount: number;
    public OrderItemId: number;
    public VatDate: LocalDate;
    public _createguid: string;
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

    public CustomerInvoiceID: number;
    public Description: string;
    public CreatedBy: string;
    public InterestFee: number;
    public UpdatedAt: Date;
    public Title: string;
    public ReminderNumber: number;
    public StatusCode: number;
    public CurrencyExchangeRate: number;
    public DebtCollectionFeeCurrency: number;
    public EmailAddress: string;
    public DueDate: LocalDate;
    public CreatedByReminderRuleID: number;
    public ReminderFeeCurrency: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public DebtCollectionFee: number;
    public ID: number;
    public ReminderFee: number;
    public RemindedDate: LocalDate;
    public RunNumber: number;
    public DimensionsID: number;
    public InterestFeeCurrency: number;
    public UpdatedBy: string;
    public RestAmount: number;
    public CurrencyCodeID: number;
    public RestAmountCurrency: number;
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

    public Description: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Title: string;
    public ReminderNumber: number;
    public StatusCode: number;
    public UseMaximumLegalReminderFee: boolean;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public CustomerInvoiceReminderSettingsID: number;
    public ReminderFee: number;
    public CreditDays: number;
    public MinimumDaysFromDueDate: number;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomerInvoiceReminderSettings: CustomerInvoiceReminderSettings;
    public CustomFields: any;
}


export class CustomerInvoiceReminderSettings extends UniEntity {
    public static RelativeUrl = 'invoiceremindersettings';
    public static EntityType = 'CustomerInvoiceReminderSettings';

    public CreatedBy: string;
    public MinimumAmountToRemind: number;
    public RemindersBeforeDebtCollection: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public DebtCollectionSettingsID: number;
    public AcceptPaymentWithoutReminderFee: boolean;
    public DefaultReminderFeeAccountID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomerInvoiceReminderRules: Array<CustomerInvoiceReminderRule>;
    public DebtCollectionSettings: DebtCollectionSettings;
    public DefaultReminderFeeAccount: Account;
    public CustomFields: any;
}


export class CustomerOrder extends UniEntity {
    public static RelativeUrl = 'orders';
    public static EntityType = 'CustomerOrder';

    public DeliveryTermsID: number;
    public CreatedBy: string;
    public OrderNumberSeriesID: number;
    public Requisition: string;
    public CustomerPerson: string;
    public PayableRoundingCurrencyAmount: number;
    public UpdatedAt: Date;
    public RestExclusiveAmountCurrency: number;
    public ShippingCountry: string;
    public StatusCode: number;
    public ShippingAddressLine3: string;
    public PaymentInfoTypeID: number;
    public CurrencyExchangeRate: number;
    public InvoiceCountryCode: string;
    public ShippingCountryCode: string;
    public TaxInclusiveAmountCurrency: number;
    public UpdateCurrencyAmountsOnDateChange: boolean;
    public ReadyToInvoice: boolean;
    public DeliveryMethod: string;
    public DeliveryName: string;
    public UseReportID: number;
    public InvoiceCity: string;
    public PaymentTerm: string;
    public EmailAddress: string;
    public InvoiceAddressLine2: string;
    public DefaultDimensionsID: number;
    public ShippingAddressLine2: string;
    public UpdateCurrencyOnToInvoice: boolean;
    public InvoicePostalCode: string;
    public SalesPerson: string;
    public OurReference: string;
    public InvoiceAddressLine1: string;
    public TaxExclusiveAmountCurrency: number;
    public CustomerName: string;
    public Comment: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ShippingAddressLine1: string;
    public ShippingPostalCode: string;
    public VatTotalsAmount: number;
    public InvoiceReceiverName: string;
    public TaxExclusiveAmount: number;
    public FreeTxt: string;
    public ID: number;
    public AccrualID: number;
    public VatTotalsAmountCurrency: number;
    public CreditDays: number;
    public DefaultSellerID: number;
    public PaymentTermsID: number;
    public TaxInclusiveAmount: number;
    public PrintStatus: number;
    public InvoiceCountry: string;
    public OrderDate: LocalDate;
    public YourReference: string;
    public SupplierOrgNumber: string;
    public UpdatedBy: string;
    public CurrencyCodeID: number;
    public OrderNumber: number;
    public CustomerID: number;
    public DeliveryTerm: string;
    public ShippingCity: string;
    public DeliveryDate: LocalDate;
    public RestAmountCurrency: number;
    public PayableRoundingAmount: number;
    public CustomerOrgNumber: string;
    public InvoiceAddressLine3: string;
    public InternalNote: string;
    public DistributionPlanID: number;
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

    public ProductID: number;
    public CalculateGrossPriceBasedOnNetPrice: boolean;
    public CreatedBy: string;
    public NumberOfItems: number;
    public PriceIncVat: number;
    public UpdatedAt: Date;
    public DiscountCurrency: number;
    public StatusCode: number;
    public CurrencyExchangeRate: number;
    public CustomerOrderID: number;
    public SumTotalIncVatCurrency: number;
    public PriceExVatCurrency: number;
    public ReadyToInvoice: boolean;
    public ItemText: string;
    public PriceExVat: number;
    public SumTotalExVatCurrency: number;
    public SortIndex: number;
    public AccountID: number;
    public Comment: string;
    public VatPercent: number;
    public Unit: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public SumTotalIncVat: number;
    public CostPrice: number;
    public ID: number;
    public PriceSetByUser: boolean;
    public DiscountPercent: number;
    public SumVat: number;
    public DimensionsID: number;
    public SumTotalExVat: number;
    public ItemSourceID: number;
    public UpdatedBy: string;
    public CurrencyCodeID: number;
    public SumVatCurrency: number;
    public VatTypeID: number;
    public Discount: number;
    public VatDate: LocalDate;
    public _createguid: string;
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

    public DeliveryTermsID: number;
    public CreatedBy: string;
    public Requisition: string;
    public CustomerPerson: string;
    public PayableRoundingCurrencyAmount: number;
    public UpdatedAt: Date;
    public ShippingCountry: string;
    public StatusCode: number;
    public ShippingAddressLine3: string;
    public PaymentInfoTypeID: number;
    public CurrencyExchangeRate: number;
    public InvoiceCountryCode: string;
    public ShippingCountryCode: string;
    public ValidUntilDate: LocalDate;
    public TaxInclusiveAmountCurrency: number;
    public UpdateCurrencyAmountsOnDateChange: boolean;
    public DeliveryMethod: string;
    public DeliveryName: string;
    public UseReportID: number;
    public InvoiceCity: string;
    public PaymentTerm: string;
    public EmailAddress: string;
    public InvoiceAddressLine2: string;
    public DefaultDimensionsID: number;
    public ShippingAddressLine2: string;
    public QuoteNumber: number;
    public UpdateCurrencyOnToInvoice: boolean;
    public InvoicePostalCode: string;
    public QuoteDate: LocalDate;
    public SalesPerson: string;
    public OurReference: string;
    public InvoiceAddressLine1: string;
    public TaxExclusiveAmountCurrency: number;
    public CustomerName: string;
    public Comment: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ShippingAddressLine1: string;
    public InquiryReference: number;
    public ShippingPostalCode: string;
    public VatTotalsAmount: number;
    public InvoiceReceiverName: string;
    public UpdateCurrencyOnToOrder: boolean;
    public TaxExclusiveAmount: number;
    public FreeTxt: string;
    public ID: number;
    public VatTotalsAmountCurrency: number;
    public CreditDays: number;
    public DefaultSellerID: number;
    public PaymentTermsID: number;
    public TaxInclusiveAmount: number;
    public PrintStatus: number;
    public QuoteNumberSeriesID: number;
    public InvoiceCountry: string;
    public YourReference: string;
    public SupplierOrgNumber: string;
    public UpdatedBy: string;
    public CurrencyCodeID: number;
    public CustomerID: number;
    public DeliveryTerm: string;
    public ShippingCity: string;
    public DeliveryDate: LocalDate;
    public PayableRoundingAmount: number;
    public CustomerOrgNumber: string;
    public InvoiceAddressLine3: string;
    public InternalNote: string;
    public DistributionPlanID: number;
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

    public ProductID: number;
    public CalculateGrossPriceBasedOnNetPrice: boolean;
    public CreatedBy: string;
    public NumberOfItems: number;
    public PriceIncVat: number;
    public UpdatedAt: Date;
    public DiscountCurrency: number;
    public StatusCode: number;
    public CurrencyExchangeRate: number;
    public SumTotalIncVatCurrency: number;
    public PriceExVatCurrency: number;
    public ItemText: string;
    public PriceExVat: number;
    public SumTotalExVatCurrency: number;
    public SortIndex: number;
    public AccountID: number;
    public Comment: string;
    public VatPercent: number;
    public Unit: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public SumTotalIncVat: number;
    public CostPrice: number;
    public ID: number;
    public PriceSetByUser: boolean;
    public DiscountPercent: number;
    public SumVat: number;
    public DimensionsID: number;
    public SumTotalExVat: number;
    public UpdatedBy: string;
    public CurrencyCodeID: number;
    public SumVatCurrency: number;
    public VatTypeID: number;
    public CustomerQuoteID: number;
    public Discount: number;
    public VatDate: LocalDate;
    public _createguid: string;
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

    public CreatedBy: string;
    public UpdatedAt: Date;
    public DebtCollectionFormat: number;
    public StatusCode: number;
    public IntegrateWithDebtCollection: boolean;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public CustomerInvoiceReminderSettingsID: number;
    public DebtCollectionAutomationID: number;
    public CreditorNumber: number;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomerInvoiceReminderSettings: CustomerInvoiceReminderSettings;
    public DebtCollectionAutomation: Array<DebtCollectionAutomation>;
    public CustomFields: any;
}


export class ItemSource extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ItemSource';

    public CreatedBy: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public UpdatedBy: string;
    public _createguid: string;
    public Details: Array<ItemSourceDetail>;
    public CustomFields: any;
}


export class ItemSourceDetail extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ItemSourceDetail';

    public Description: string;
    public SourceType: string;
    public CreatedBy: string;
    public Amount: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public SourceFK: number;
    public ID: number;
    public Tag: string;
    public ItemSourceID: number;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class PaymentInfoType extends UniEntity {
    public static RelativeUrl = 'paymentinfotype';
    public static EntityType = 'PaymentInfoType';

    public CreatedBy: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public Control: Modulus;
    public Deleted: boolean;
    public CreatedAt: Date;
    public Length: number;
    public ID: number;
    public Locked: boolean;
    public UpdatedBy: string;
    public Name: string;
    public Type: PaymentInfoTypeEnum;
    public _createguid: string;
    public PaymentInfoTypeParts: Array<PaymentInfoTypePart>;
    public CustomFields: any;
}


export class PaymentInfoTypePart extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'PaymentInfoTypePart';

    public CreatedBy: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public PaymentInfoTypeID: number;
    public Part: string;
    public SortIndex: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public Length: number;
    public ID: number;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class RecurringInvoice extends UniEntity {
    public static RelativeUrl = 'recurringinvoices';
    public static EntityType = 'RecurringInvoice';

    public Interval: number;
    public DeliveryTermsID: number;
    public CreatedBy: string;
    public Requisition: string;
    public CustomerPerson: string;
    public PayableRoundingCurrencyAmount: number;
    public UpdatedAt: Date;
    public ShippingCountry: string;
    public StatusCode: number;
    public ShippingAddressLine3: string;
    public PaymentInfoTypeID: number;
    public CurrencyExchangeRate: number;
    public InvoiceNumberSeriesID: number;
    public InvoiceCountryCode: string;
    public ShippingCountryCode: string;
    public NotifyWhenOrdersArePrepared: boolean;
    public TaxInclusiveAmountCurrency: number;
    public Payment: string;
    public UpdateCurrencyAmountsOnDateChange: boolean;
    public DeliveryMethod: string;
    public DeliveryName: string;
    public UseReportID: number;
    public InvoiceCity: string;
    public TimePeriod: RecurringPeriod;
    public PaymentTerm: string;
    public EmailAddress: string;
    public InvoiceAddressLine2: string;
    public EndDate: LocalDate;
    public DefaultDimensionsID: number;
    public ShippingAddressLine2: string;
    public MaxIterations: number;
    public InvoicePostalCode: string;
    public SalesPerson: string;
    public OurReference: string;
    public InvoiceAddressLine1: string;
    public TaxExclusiveAmountCurrency: number;
    public CustomerName: string;
    public Comment: string;
    public Deleted: boolean;
    public NotifyUser: string;
    public CreatedAt: Date;
    public ShippingAddressLine1: string;
    public ShippingPostalCode: string;
    public VatTotalsAmount: number;
    public InvoiceReceiverName: string;
    public TaxExclusiveAmount: number;
    public FreeTxt: string;
    public ID: number;
    public VatTotalsAmountCurrency: number;
    public AmountRegards: string;
    public CreditDays: number;
    public PreparationDays: number;
    public StartDate: LocalDate;
    public DefaultSellerID: number;
    public PaymentTermsID: number;
    public TaxInclusiveAmount: number;
    public PrintStatus: number;
    public NextInvoiceDate: LocalDate;
    public InvoiceCountry: string;
    public YourReference: string;
    public SupplierOrgNumber: string;
    public UpdatedBy: string;
    public CurrencyCodeID: number;
    public NoCreditDays: boolean;
    public PaymentInformation: string;
    public CustomerID: number;
    public DeliveryTerm: string;
    public ShippingCity: string;
    public DeliveryDate: LocalDate;
    public PayableRoundingAmount: number;
    public CustomerOrgNumber: string;
    public NotifyWhenRecurringEnds: boolean;
    public InvoiceAddressLine3: string;
    public InternalNote: string;
    public DistributionPlanID: number;
    public ProduceAs: RecurringResult;
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

    public ReduceIncompletePeriod: boolean;
    public ProductID: number;
    public CalculateGrossPriceBasedOnNetPrice: boolean;
    public CreatedBy: string;
    public NumberOfItems: number;
    public PriceIncVat: number;
    public UpdatedAt: Date;
    public PricingSource: PricingSource;
    public DiscountCurrency: number;
    public StatusCode: number;
    public CurrencyExchangeRate: number;
    public SumTotalIncVatCurrency: number;
    public PriceExVatCurrency: number;
    public ItemText: string;
    public PriceExVat: number;
    public SumTotalExVatCurrency: number;
    public SortIndex: number;
    public AccountID: number;
    public Comment: string;
    public VatPercent: number;
    public Unit: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public SumTotalIncVat: number;
    public TimeFactor: RecurringPeriod;
    public ID: number;
    public PriceSetByUser: boolean;
    public DiscountPercent: number;
    public SumVat: number;
    public DimensionsID: number;
    public SumTotalExVat: number;
    public RecurringInvoiceID: number;
    public UpdatedBy: string;
    public CurrencyCodeID: number;
    public SumVatCurrency: number;
    public VatTypeID: number;
    public Discount: number;
    public VatDate: LocalDate;
    public _createguid: string;
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

    public CreatedBy: string;
    public CreationDate: LocalDate;
    public UpdatedAt: Date;
    public InvoiceDate: LocalDate;
    public StatusCode: number;
    public NotifiedOrdersPrepared: boolean;
    public NotifiedRecurringEnds: boolean;
    public OrderID: number;
    public IterationNumber: number;
    public Comment: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public RecurringInvoiceID: number;
    public UpdatedBy: string;
    public InvoiceID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class Seller extends UniEntity {
    public static RelativeUrl = 'sellers';
    public static EntityType = 'Seller';

    public CreatedBy: string;
    public UpdatedAt: Date;
    public EmployeeID: number;
    public StatusCode: number;
    public UserID: number;
    public DefaultDimensionsID: number;
    public TeamID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
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

    public CustomerInvoiceID: number;
    public CreatedBy: string;
    public Amount: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CustomerOrderID: number;
    public SellerID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public Percent: number;
    public ID: number;
    public RecurringInvoiceID: number;
    public UpdatedBy: string;
    public CustomerID: number;
    public CustomerQuoteID: number;
    public _createguid: string;
    public Seller: Seller;
    public CustomFields: any;
}


export class SubCompany extends UniEntity {
    public static RelativeUrl = 'subcompanies';
    public static EntityType = 'SubCompany';

    public CreatedBy: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CompanyID: number;
    public CompanyType: CompanyRelation;
    public CompanyKey: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public CompanyName: string;
    public UpdatedBy: string;
    public CustomerID: number;
    public _createguid: string;
    public Customer: Customer;
    public CustomFields: any;
}


export class Supplier extends UniEntity {
    public static RelativeUrl = 'suppliers';
    public static EntityType = 'Supplier';

    public CreatedBy: string;
    public UpdatedAt: Date;
    public GLN: string;
    public SupplierNumber: number;
    public StatusCode: number;
    public PeppolAddress: string;
    public Localization: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public OrgNumber: string;
    public CreditDays: number;
    public SelfEmployed: boolean;
    public DimensionsID: number;
    public WebUrl: string;
    public CostAllocationID: number;
    public SubAccountNumberSeriesID: number;
    public UpdatedBy: string;
    public CurrencyCodeID: number;
    public BusinessRelationID: number;
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

    public Description: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public CreditDays: number;
    public TermsType: TermsType;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class TOFCurrencySettings extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'TOFCurrencySettings';

    public CreatedBy: string;
    public UpdateCurrencyAmountsOnQuoteToInvoice: boolean;
    public UpdatedAt: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public UpdateCurrencyAmountsOnQuotedateChange: boolean;
    public UpdateCurrencyAmountsOnQuoteToOrder: boolean;
    public UpdateCurrencyAmountsOnOrderToInvoice: boolean;
    public ID: number;
    public UpdateCurrencyAmountsOnInvoicedateChange: boolean;
    public UpdatedBy: string;
    public UpdateCurrencyAmountsOnOrderdateChange: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class Address extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Address';

    public CreatedBy: string;
    public Region: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public Country: string;
    public AddressLine3: string;
    public AddressLine1: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public City: string;
    public ID: number;
    public UpdatedBy: string;
    public PostalCode: string;
    public CountryCode: string;
    public BusinessRelationID: number;
    public AddressLine2: string;
    public _createguid: string;
    public BusinessRelation: BusinessRelation;
    public CustomFields: any;
}


export class BusinessRelation extends UniEntity {
    public static RelativeUrl = 'business-relations';
    public static EntityType = 'BusinessRelation';

    public CreatedBy: string;
    public UpdatedAt: Date;
    public InvoiceAddressID: number;
    public StatusCode: number;
    public DefaultEmailID: number;
    public ShippingAddressID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public DefaultBankAccountID: number;
    public DefaultContactID: number;
    public DefaultPhoneID: number;
    public UpdatedBy: string;
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

    public CreatedBy: string;
    public UpdatedAt: Date;
    public ParentBusinessRelationID: number;
    public StatusCode: number;
    public Role: string;
    public Comment: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public InfoID: number;
    public UpdatedBy: string;
    public _createguid: string;
    public ParentBusinessRelation: BusinessRelation;
    public Info: BusinessRelation;
    public CustomFields: any;
}


export class Email extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Email';

    public Description: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public EmailAddress: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public UpdatedBy: string;
    public BusinessRelationID: number;
    public Type: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Phone extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Phone';

    public Description: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public UpdatedBy: string;
    public CountryCode: string;
    public BusinessRelationID: number;
    public Type: PhoneTypeEnum;
    public Number: string;
    public _createguid: string;
    public CustomFields: any;
}


export class AGACalculation extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AGACalculation';

    public CreatedBy: string;
    public UpdatedAt: Date;
    public PayrollRunID: number;
    public StatusCode: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public DimensionsID: number;
    public UpdatedBy: string;
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
    public UpdatedAt: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public freeAmount: number;
    public UpdatedBy: string;
    public SubEntityID: number;
    public AGACalculationID: number;
    public _createguid: string;
    public subEntity: SubEntity;
    public CustomFields: any;
}


export class AGATax extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AGATax';

    public CreatedBy: string;
    public UpdatedAt: Date;
    public agaBase: number;
    public agaRate: number;
    public StatusCode: number;
    public AGARateID: number;
    public Deleted: boolean;
    public beregningsKode: number;
    public CreatedAt: Date;
    public ID: number;
    public UpdatedBy: string;
    public zone: number;
    public SubEntityID: number;
    public AGACalculationID: number;
    public zoneName: string;
    public municipalityName: string;
    public _createguid: string;
    public subEntity: SubEntity;
    public CustomFields: any;
}


export class AGAPension extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AGAPension';

    public CreatedBy: string;
    public UpdatedAt: Date;
    public agaBase: number;
    public agaRate: number;
    public StatusCode: number;
    public AGARateID: number;
    public Deleted: boolean;
    public beregningsKode: number;
    public CreatedAt: Date;
    public ID: number;
    public UpdatedBy: string;
    public zone: number;
    public SubEntityID: number;
    public AGACalculationID: number;
    public zoneName: string;
    public municipalityName: string;
    public _createguid: string;
    public subEntity: SubEntity;
    public CustomFields: any;
}


export class AGADraw extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AGADraw';

    public CreatedBy: string;
    public UpdatedAt: Date;
    public agaBase: number;
    public agaRate: number;
    public StatusCode: number;
    public AGARateID: number;
    public Deleted: boolean;
    public beregningsKode: number;
    public CreatedAt: Date;
    public ID: number;
    public UpdatedBy: string;
    public zone: number;
    public SubEntityID: number;
    public AGACalculationID: number;
    public zoneName: string;
    public municipalityName: string;
    public _createguid: string;
    public subEntity: SubEntity;
    public CustomFields: any;
}


export class ForeignerWithPercent extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ForeignerWithPercent';

    public CreatedBy: string;
    public UpdatedAt: Date;
    public agaBase: number;
    public agaRate: number;
    public StatusCode: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public UpdatedBy: string;
    public SubEntityID: number;
    public AGACalculationID: number;
    public zoneName: string;
    public municipalityName: string;
    public _createguid: string;
    public subEntity: SubEntity;
    public CustomFields: any;
}


export class DrawForeignerWithPercent extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'DrawForeignerWithPercent';

    public CreatedBy: string;
    public UpdatedAt: Date;
    public agaBase: number;
    public agaRate: number;
    public StatusCode: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public UpdatedBy: string;
    public SubEntityID: number;
    public AGACalculationID: number;
    public zoneName: string;
    public municipalityName: string;
    public _createguid: string;
    public subEntity: SubEntity;
    public CustomFields: any;
}


export class ForeignerWithAmount extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ForeignerWithAmount';

    public CreatedBy: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public aga: number;
    public persons: number;
    public UpdatedBy: string;
    public SubEntityID: number;
    public AGACalculationID: number;
    public zoneName: string;
    public municipalityName: string;
    public _createguid: string;
    public subEntity: SubEntity;
    public CustomFields: any;
}


export class TaxAndAgaSums extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'TaxAndAgaSums';

    public CreatedBy: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public FinancialTax: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public WithholdingTax: number;
    public UpdatedBy: string;
    public GarnishmentTax: number;
    public _createguid: string;
    public CustomFields: any;
}


export class AmeldingData extends UniEntity {
    public static RelativeUrl = 'amelding';
    public static EntityType = 'AmeldingData';

    public CreatedBy: string;
    public UpdatedAt: Date;
    public OppgaveHash: string;
    public PayrollRunID: number;
    public StatusCode: number;
    public year: number;
    public receiptID: number;
    public replacesID: number;
    public messageID: string;
    public mainFileID: number;
    public created: Date;
    public sent: Date;
    public Deleted: boolean;
    public CreatedAt: Date;
    public period: number;
    public altinnStatus: string;
    public ID: number;
    public feedbackFileID: number;
    public UpdatedBy: string;
    public attachmentFileID: number;
    public type: AmeldingType;
    public initiated: Date;
    public status: number;
    public xmlValidationErrors: string;
    public replaceThis: string;
    public _createguid: string;
    public log: Array<AmeldingLog>;
    public CustomFields: any;
}


export class AmeldingLog extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AmeldingLog';

    public CreatedBy: string;
    public registry: SalaryRegistry;
    public UpdatedAt: Date;
    public StatusCode: number;
    public key: number;
    public AmeldingsID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class BasicAmount extends UniEntity {
    public static RelativeUrl = 'basicamounts';
    public static EntityType = 'BasicAmount';

    public CreatedBy: string;
    public UpdatedAt: Date;
    public ConversionFactor: number;
    public StatusCode: number;
    public AveragePrYear: number;
    public BasicAmountPrMonth: number;
    public BasicAmountPrYear: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public UpdatedBy: string;
    public FromDate: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class CompanySalary extends UniEntity {
    public static RelativeUrl = 'companysalary';
    public static EntityType = 'CompanySalary';

    public MainAccountAllocatedFinancial: number;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public MainAccountAllocatedAGAVacation: number;
    public MainAccountCostVacation: number;
    public StatusCode: number;
    public PaycheckZipReportID: number;
    public Base_Svalbard: boolean;
    public WagetypeAdvancePayment: number;
    public Base_TaxFreeOrganization: boolean;
    public InterrimRemitAccount: number;
    public RateFinancialTax: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public MainAccountAllocatedAGA: number;
    public ID: number;
    public HourFTEs: number;
    public HoursPerMonth: number;
    public FreeAmount: number;
    public MainAccountCostAGA: number;
    public PostGarnishmentToTaxAccount: boolean;
    public MainAccountCostFinancial: number;
    public CalculateFinancialTax: boolean;
    public Base_SpesialDeductionForMaritim: boolean;
    public AllowOver6G: boolean;
    public OtpExportActive: boolean;
    public WageDeductionDueToHoliday: WageDeductionDueToHolidayType;
    public Base_PayAsYouEarnTaxOnPensions: boolean;
    public PostToTaxDraw: boolean;
    public MainAccountCostFinancialVacation: number;
    public Base_JanMayenAndBiCountries: boolean;
    public UpdatedBy: string;
    public MainAccountAllocatedFinancialVacation: number;
    public PaymentInterval: CompanySalaryPaymentInterval;
    public WagetypeAdvancePaymentAuto: number;
    public MainAccountAllocatedVacation: number;
    public MainAccountCostAGAVacation: number;
    public Base_NettoPaymentForMaritim: boolean;
    public Base_NettoPayment: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class CompanyVacationRate extends UniEntity {
    public static RelativeUrl = 'companyvacationrates';
    public static EntityType = 'CompanyVacationRate';

    public CreatedBy: string;
    public UpdatedAt: Date;
    public Rate: number;
    public StatusCode: number;
    public Rate60: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public UpdatedBy: string;
    public FromDate: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class EmployeeCategory extends UniEntity {
    public static RelativeUrl = 'employeecategories';
    public static EntityType = 'EmployeeCategory';

    public EmployeeCategoryLinkID: number;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class EmployeeCategoryLink extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'EmployeeCategoryLink';

    public CreatedBy: string;
    public UpdatedAt: Date;
    public EmployeeID: number;
    public StatusCode: number;
    public EmployeeNumber: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public EmployeeCategoryID: number;
    public UpdatedBy: string;
    public _createguid: string;
    public EmployeeCategory: EmployeeCategory;
    public Employee: Employee;
    public CustomFields: any;
}


export class Employee extends UniEntity {
    public static RelativeUrl = 'employees';
    public static EntityType = 'Employee';

    public EmployeeLanguageID: number;
    public ForeignWorker: ForeignWorker;
    public CreatedBy: string;
    public Sex: GenderEnum;
    public EmploymentDateOtp: LocalDate;
    public UpdatedAt: Date;
    public EndDateOtp: LocalDate;
    public OtpExport: boolean;
    public MunicipalityNo: string;
    public StatusCode: number;
    public UserID: number;
    public IncludeOtpUntilMonth: number;
    public InternasjonalIDCountry: string;
    public InternationalID: string;
    public SocialSecurityNumber: string;
    public InternasjonalIDType: InternationalIDType;
    public EmployeeNumber: number;
    public Active: boolean;
    public EmploymentDate: Date;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public TypeOfPaymentOtp: TypeOfPaymentOtp;
    public AdvancePaymentAmount: number;
    public PhotoID: number;
    public BirthDate: Date;
    public UpdatedBy: string;
    public FreeText: string;
    public PaymentInterval: PaymentInterval;
    public SubEntityID: number;
    public IncludeOtpUntilYear: number;
    public BusinessRelationID: number;
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

    public CreatedBy: string;
    public ResultatStatus: string;
    public UpdatedAt: Date;
    public EmployeeID: number;
    public Tilleggsopplysning: string;
    public pensjonID: number;
    public StatusCode: number;
    public loennFraBiarbeidsgiverID: number;
    public loennKunTrygdeavgiftTilUtenlandskBorgerSomGrensegjengerID: number;
    public Year: number;
    public Table: string;
    public EmployeeNumber: number;
    public SKDXml: string;
    public SecondaryTable: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public Percent: number;
    public SecondaryPercent: number;
    public ID: number;
    public loennTilUtenrikstjenestemannID: number;
    public loennKunTrygdeavgiftTilUtenlandskBorgerID: number;
    public NotMainEmployer: boolean;
    public TaxcardId: number;
    public loennFraHovedarbeidsgiverID: number;
    public UpdatedBy: string;
    public ufoereYtelserAndreID: number;
    public NonTaxableAmount: number;
    public IssueDate: Date;
    public NoRecalc: boolean;
    public _createguid: string;
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
    public UpdatedAt: Date;
    public AntallMaanederForTrekk: number;
    public freeAmountType: FreeAmountType;
    public Table: string;
    public tabellType: TabellType;
    public Deleted: boolean;
    public CreatedAt: Date;
    public Percent: number;
    public ID: number;
    public UpdatedBy: string;
    public NonTaxableAmount: number;
    public _createguid: string;
    public CustomFields: any;
}


export class EmployeeLeave extends UniEntity {
    public static RelativeUrl = 'EmployeeLeave';
    public static EntityType = 'EmployeeLeave';

    public Description: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public LeaveType: Leavetype;
    public StatusCode: number;
    public LeavePercent: number;
    public ToDate: Date;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public EmploymentID: number;
    public UpdatedBy: string;
    public AffectsOtp: boolean;
    public FromDate: Date;
    public _createguid: string;
    public Employment: Employment;
    public CustomFields: any;
}


export class Employment extends UniEntity {
    public static RelativeUrl = 'employments';
    public static EntityType = 'Employment';

    public CreatedBy: string;
    public UpdatedAt: Date;
    public EmployeeID: number;
    public StatusCode: number;
    public TradeArea: ShipTradeArea;
    public EndDate: Date;
    public Standard: boolean;
    public JobName: string;
    public LastWorkPercentChangeDate: Date;
    public JobCode: string;
    public EndDateReason: EndDateReason;
    public EmployeeNumber: number;
    public HourRate: number;
    public TypeOfEmployment: TypeOfEmployment;
    public Deleted: boolean;
    public CreatedAt: Date;
    public MonthRate: number;
    public PayGrade: string;
    public HoursPerWeek: number;
    public RegulativeStepNr: number;
    public EmploymentType: EmploymentType;
    public LedgerAccount: string;
    public ID: number;
    public WorkPercent: number;
    public SeniorityDate: Date;
    public StartDate: Date;
    public DimensionsID: number;
    public ShipReg: ShipRegistry;
    public LastSalaryChangeDate: Date;
    public UserDefinedRate: number;
    public WorkingHoursScheme: WorkingHoursScheme;
    public RegulativeGroupID: number;
    public UpdatedBy: string;
    public SubEntityID: number;
    public RemunerationType: RemunerationType;
    public ShipType: ShipTypeOfShip;
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

    public Description: string;
    public CreatedBy: string;
    public Amount: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public AffectsAGA: boolean;
    public ID: number;
    public UpdatedBy: string;
    public SubentityID: number;
    public FromDate: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class OtpExportWagetype extends UniEntity {
    public static RelativeUrl = 'otpexportwagetypes';
    public static EntityType = 'OtpExportWagetype';

    public CreatedBy: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public WageTypeNumber: number;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class PayrollRun extends UniEntity {
    public static RelativeUrl = 'payrollrun';
    public static EntityType = 'PayrollRun';

    public Description: string;
    public SettlementDate: Date;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public JournalEntryNumber: string;
    public AGAFreeAmount: number;
    public PayDate: Date;
    public StatusCode: number;
    public ExcludeRecurringPosts: boolean;
    public PaycheckFileID: number;
    public AGAonRun: number;
    public ToDate: Date;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public taxdrawfactor: TaxDrawFactor;
    public HolidayPayDeduction: boolean;
    public UpdatedBy: string;
    public FreeText: string;
    public needsRecalc: boolean;
    public FromDate: Date;
    public _createguid: string;
    public transactions: Array<SalaryTransaction>;
    public agacalculation: Array<AGACalculation>;
    public CustomFields: any;
}


export class PayrollRunCategoryLink extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'PayrollRunCategoryLink';

    public CreatedBy: string;
    public UpdatedAt: Date;
    public PayrollRunID: number;
    public StatusCode: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public EmployeeCategoryID: number;
    public UpdatedBy: string;
    public _createguid: string;
    public EmployeeCategory: EmployeeCategory;
    public PayrollRun: PayrollRun;
    public CustomFields: any;
}


export class PostingSummaryDraft extends UniEntity {
    public statusTime: Date;
    public draftBasic: string;
    public draftWithDims: string;
    public JobInfoID: number;
    public ID: number;
    public draftWithDimsOnBalance: string;
    public PayrollID: number;
    public status: SummaryJobStatus;
}


export class Regulative extends UniEntity {
    public static RelativeUrl = 'regulatives';
    public static EntityType = 'Regulative';

    public CreatedBy: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public StartDate: LocalDate;
    public RegulativeGroupID: number;
    public UpdatedBy: string;
    public _createguid: string;
    public Steps: Array<RegulativeStep>;
    public CustomFields: any;
}


export class RegulativeGroup extends UniEntity {
    public static RelativeUrl = 'regulativegroups';
    public static EntityType = 'RegulativeGroup';

    public CreatedBy: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
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
    public Amount: number;
    public UpdatedAt: Date;
    public Step: number;
    public StatusCode: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public RegulativeID: number;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class SalaryBalance extends UniEntity {
    public static RelativeUrl = 'salarybalances';
    public static EntityType = 'SalaryBalance';

    public CreatedBy: string;
    public MaxAmount: number;
    public UpdatedAt: Date;
    public EmployeeID: number;
    public InstalmentPercent: number;
    public InstalmentType: SalBalType;
    public StatusCode: number;
    public CreatePayment: boolean;
    public ToDate: Date;
    public SupplierID: number;
    public MinAmount: number;
    public Source: SalBalSource;
    public Deleted: boolean;
    public CreatedAt: Date;
    public SalaryBalanceTemplateID: number;
    public ID: number;
    public EmploymentID: number;
    public Instalment: number;
    public WageTypeNumber: number;
    public UpdatedBy: string;
    public KID: string;
    public Name: string;
    public Type: SalBalDrawType;
    public FromDate: Date;
    public Amount: number;
    public CalculatedBalance: number;
    public Balance: number;
    public _createguid: string;
    public Employee: Employee;
    public Supplier: Supplier;
    public Transactions: Array<SalaryBalanceLine>;
    public Employment: Employment;
    public CustomFields: any;
}


export class SalaryBalanceLine extends UniEntity {
    public static RelativeUrl = 'salarybalancelines';
    public static EntityType = 'SalaryBalanceLine';

    public Description: string;
    public CreatedBy: string;
    public Amount: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public SalaryTransactionID: number;
    public SalaryBalanceID: number;
    public Date: LocalDate;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public UpdatedBy: string;
    public _createguid: string;
    public SalaryTransaction: SalaryTransaction;
    public SalaryBalance: SalaryBalance;
    public CustomFields: any;
}


export class SalaryBalanceTemplate extends UniEntity {
    public static RelativeUrl = 'salarybalancetemplates';
    public static EntityType = 'SalaryBalanceTemplate';

    public CreatedBy: string;
    public MaxAmount: number;
    public UpdatedAt: Date;
    public InstalmentPercent: number;
    public InstalmentType: SalBalType;
    public StatusCode: number;
    public CreatePayment: boolean;
    public SupplierID: number;
    public MinAmount: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public Account: number;
    public SalarytransactionDescription: string;
    public Instalment: number;
    public WageTypeNumber: number;
    public UpdatedBy: string;
    public KID: string;
    public Name: string;
    public _createguid: string;
    public Supplier: Supplier;
    public SalaryBalances: Array<SalaryBalance>;
    public CustomFields: any;
}


export class SalaryTransaction extends UniEntity {
    public static RelativeUrl = 'salarytrans';
    public static EntityType = 'SalaryTransaction';

    public recurringPostValidFrom: Date;
    public SystemType: StdSystemType;
    public CreatedBy: string;
    public Amount: number;
    public UpdatedAt: Date;
    public EmployeeID: number;
    public PayrollRunID: number;
    public MunicipalityNo: string;
    public Rate: number;
    public StatusCode: number;
    public SalaryBalanceID: number;
    public RecurringID: number;
    public Text: string;
    public ToDate: Date;
    public Sum: number;
    public EmployeeNumber: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public Account: number;
    public EmploymentID: number;
    public HolidayPayDeduction: boolean;
    public DimensionsID: number;
    public recurringPostValidTo: Date;
    public calcAGA: number;
    public WageTypeID: number;
    public WageTypeNumber: number;
    public UpdatedBy: string;
    public VatTypeID: number;
    public ChildSalaryTransactionID: number;
    public IsRecurringPost: boolean;
    public TaxbasisID: number;
    public FromDate: Date;
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

    public CreatedBy: string;
    public WageTypeSupplementID: number;
    public ValueMoney: number;
    public UpdatedAt: Date;
    public ValueDate2: Date;
    public StatusCode: number;
    public SalaryTransactionID: number;
    public ValueBool: boolean;
    public ValueString: string;
    public ValueDate: Date;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public UpdatedBy: string;
    public _createguid: string;
    public WageTypeSupplement: WageTypeSupplement;
    public CustomFields: any;
}


export class SalaryYear extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'SalaryYear';

    public CreatedBy: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public CurrentYear: number;
    public ID: number;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class SubEntity extends UniEntity {
    public static RelativeUrl = 'subentities';
    public static EntityType = 'SubEntity';

    public CreatedBy: string;
    public UpdatedAt: Date;
    public MunicipalityNo: string;
    public StatusCode: number;
    public SuperiorOrganizationID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public OrgNumber: string;
    public freeAmount: number;
    public AgaZone: number;
    public UpdatedBy: string;
    public AgaRule: number;
    public BusinessRelationID: number;
    public _createguid: string;
    public BusinessRelationInfo: BusinessRelation;
    public SuperiorOrganization: SubEntity;
    public CustomFields: any;
}


export class TaxBasis extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'TaxBasis';

    public CreatedBy: string;
    public ForeignCitizenInsuranceBasis: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public SalaryTransactionID: number;
    public PensionBasis: number;
    public DisabilityOtherBasis: number;
    public ForeignBorderCommuterBasis: number;
    public JanMayenBasis: number;
    public SailorBasis: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public PensionSourcetaxBasis: number;
    public SvalbardBasis: number;
    public UpdatedBy: string;
    public Basis: number;
    public _createguid: string;
    public CustomFields: any;
}


export class Travel extends UniEntity {
    public static RelativeUrl = 'travels';
    public static EntityType = 'Travel';

    public Description: string;
    public CreatedBy: string;
    public State: state;
    public UpdatedAt: Date;
    public StatusCode: number;
    public TravelIdentificator: string;
    public PersonID: string;
    public SupplierID: number;
    public EmployeeNumber: number;
    public Purpose: string;
    public Comment: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public SourceSystem: string;
    public Phone: string;
    public DimensionsID: number;
    public UpdatedBy: string;
    public Email: string;
    public Name: string;
    public AdvanceAmount: number;
    public _createguid: string;
    public TravelLines: Array<TravelLine>;
    public Dimensions: Dimensions;
    public CustomFields: any;
}


export class TravelLine extends UniEntity {
    public static RelativeUrl = 'travellines';
    public static EntityType = 'TravelLine';

    public InvoiceAccount: number;
    public Description: string;
    public CreatedBy: string;
    public Amount: number;
    public UpdatedAt: Date;
    public Rate: number;
    public StatusCode: number;
    public TravelIdentificator: string;
    public CostType: costtype;
    public LineState: linestate;
    public Deleted: boolean;
    public CreatedAt: Date;
    public To: Date;
    public ID: number;
    public From: Date;
    public DimensionsID: number;
    public TravelID: number;
    public UpdatedBy: string;
    public AccountNumber: number;
    public TypeID: number;
    public VatTypeID: number;
    public paytransID: number;
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

    public InvoiceAccount: number;
    public Description: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ForeignDescription: string;
    public ID: number;
    public WageTypeNumber: number;
    public UpdatedBy: string;
    public ForeignTypeID: string;
    public _createguid: string;
    public CustomFields: any;
}


export class VacationPayLine extends UniEntity {
    public static RelativeUrl = 'VacationPayLines';
    public static EntityType = 'VacationPayLine';

    public CreatedBy: string;
    public UpdatedAt: Date;
    public EmployeeID: number;
    public StatusCode: number;
    public ManualVacationPayBase: number;
    public Year: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public UpdatedBy: string;
    public PaidVacationPay: number;
    public Rate: number;
    public Withdrawal: number;
    public VacationPay: number;
    public Rate60: number;
    public PaidTaxFreeVacationPay: number;
    public VacationPay60: number;
    public SystemVacationPayBase: number;
    public MissingEarlierVacationPay: number;
    public Age: number;
    public _createguid: string;
    public Employee: Employee;
    public CustomFields: any;
}


export class VacationRateEmployee extends UniEntity {
    public static RelativeUrl = 'employeevacationrates';
    public static EntityType = 'VacationRateEmployee';

    public CreatedBy: string;
    public UpdatedAt: Date;
    public EmployeeID: number;
    public Rate: number;
    public StatusCode: number;
    public EndDate: Date;
    public Rate60: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public StartDate: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class WageType extends UniEntity {
    public static RelativeUrl = 'wagetypes';
    public static EntityType = 'WageType';

    public Base_Payment: boolean;
    public Description: string;
    public Systemtype: string;
    public CreatedBy: string;
    public taxtype: TaxType;
    public UpdatedAt: Date;
    public SpecialAgaRule: SpecialAgaRule;
    public SpecialTaxAndContributionsRule: SpecialTaxAndContributionsRule;
    public Limit_value: number;
    public DaysOnBoard: boolean;
    public SystemRequiredWageType: number;
    public Rate: number;
    public StatusCode: number;
    public GetRateFrom: GetRateFrom;
    public ValidYear: number;
    public IncomeType: string;
    public Postnr: string;
    public RatetypeColumn: RateTypeColumn;
    public Limit_type: LimitType;
    public Base_div3: boolean;
    public StandardWageTypeFor: StdWageType;
    public Limit_WageTypeNumber: number;
    public Base_EmploymentTax: boolean;
    public Deleted: boolean;
    public CreatedAt: Date;
    public Base_div2: boolean;
    public ID: number;
    public Limit_newRate: number;
    public FixedSalaryHolidayDeduction: boolean;
    public Base_Vacation: boolean;
    public HideFromPaycheck: boolean;
    public WageTypeNumber: number;
    public NoNumberOfHours: boolean;
    public SpecialTaxHandling: string;
    public RateFactor: number;
    public UpdatedBy: string;
    public AccountNumber: number;
    public AccountNumber_balance: number;
    public Benefit: string;
    public WageTypeName: string;
    public SupplementPackage: string;
    public _createguid: string;
    public SupplementaryInformations: Array<WageTypeSupplement>;
    public CustomFields: any;
}


export class WageTypeSupplement extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'WageTypeSupplement';

    public Description: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public ValueType: Valuetype;
    public ameldingType: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public WageTypeID: number;
    public UpdatedBy: string;
    public SuggestedValue: string;
    public GetValueFromTrans: boolean;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class WageTypeTranslation extends UniEntity {
    public static RelativeUrl = 'wagetypetranslations';
    public static EntityType = 'WageTypeTranslation';

    public EmployeeLanguageID: number;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public WageTypeNumber: number;
    public UpdatedBy: string;
    public WageTypeName: string;
    public _createguid: string;
    public EmployeeLanguage: EmployeeLanguage;
    public CustomFields: any;
}


export class PensionScheme extends UniEntity {
    public static RelativeUrl = 'pensionschemes';
    public static EntityType = 'PensionScheme';

    public CreatedBy: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public Year: number;
    public Identificator: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public Period: number;
    public ID: number;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class PensionSchemeSupplier extends UniEntity {
    public static RelativeUrl = 'pensionschemesuppliers';
    public static EntityType = 'PensionSchemeSupplier';

    public CreatedBy: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public Identificator: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class StandardPensionSchemeSupplier extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'StandardPensionSchemeSupplier';

    public CreatedBy: string;
    public UpdatedAt: Date;
    public Identificator: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class EmployeeLanguage extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'EmployeeLanguage';

    public CreatedBy: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public LanguageCode: string;
    public ID: number;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class ComponentLayout extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ComponentLayout';

    public CreatedBy: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public BaseEntity: string;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public Fields: Array<FieldLayout>;
    public CustomFields: any;
}


export class FieldLayout extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'FieldLayout';

    public Description: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public DisplayField: string;
    public Combo: number;
    public StatusCode: number;
    public ReadOnly: boolean;
    public Sectionheader: string;
    public LookupField: boolean;
    public FieldSet: number;
    public FieldType: FieldType;
    public ComponentLayoutID: number;
    public Placement: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public LineBreak: boolean;
    public Legend: string;
    public ID: number;
    public EntityType: string;
    public Placeholder: string;
    public Section: number;
    public UpdatedBy: string;
    public Property: string;
    public Width: string;
    public Options: string;
    public Hidden: boolean;
    public Label: string;
    public Alignment: Alignment;
    public HelpText: string;
    public _createguid: string;
    public CustomFields: any;
}


export class CurrencyOverride extends UniEntity {
    public static RelativeUrl = 'currencyoverrides';
    public static EntityType = 'CurrencyOverride';

    public CreatedBy: string;
    public UpdatedAt: Date;
    public ToCurrencyCodeID: number;
    public ToDate: LocalDate;
    public Source: CurrencySourceEnum;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public Factor: number;
    public UpdatedBy: string;
    public ExchangeRate: number;
    public FromCurrencyCodeID: number;
    public FromDate: LocalDate;
    public _createguid: string;
    public FromCurrencyCode: CurrencyCode;
    public ToCurrencyCode: CurrencyCode;
    public CustomFields: any;
}


export class AccountAssetGroup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AccountAssetGroup';

    public CreatedBy: string;
    public UpdatedAt: Date;
    public FromAccountNumber: number;
    public ToAccountNumber: number;
    public Deleted: boolean;
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
    public ParentID: number;
    public UpdatedAt: Date;
    public ExternalReference: string;
    public PlanType: PlanTypeEnum;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public Parent: AccountGroupSetup;
    public CustomFields: any;
}


export class AccountSetup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AccountSetup';

    public VatCode: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public ExpectedDebitBalance: boolean;
    public PlanType: PlanTypeEnum;
    public Visible: boolean;
    public SaftMappingAccountID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public AccountName: string;
    public UpdatedBy: string;
    public AccountNumber: number;
    public AccountGroupSetupID: number;
    public _createguid: string;
    public AccountGroup: AccountGroupSetup;
    public SaftMappingAccount: SaftMappingAccount;
    public CustomFields: any;
}


export class AccountVisibilityGroup extends UniEntity {
    public static RelativeUrl = 'accountvisibilitygroups';
    public static EntityType = 'AccountVisibilityGroup';

    public CreatedBy: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
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
    public UpdatedAt: Date;
    public AccountSetupID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public UpdatedBy: string;
    public AccountVisibilityGroupID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class AGARate extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AGARate';

    public CreatedBy: string;
    public ZoneID: number;
    public UpdatedAt: Date;
    public Rate: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public RateValidFrom: Date;
    public ID: number;
    public UpdatedBy: string;
    public _createguid: string;
    public sector: Array<AGASector>;
    public CustomFields: any;
}


export class AGASector extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AGASector';

    public CreatedBy: string;
    public UpdatedAt: Date;
    public Rate: number;
    public SectorID: number;
    public RateID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ValidFrom: Date;
    public ID: number;
    public freeAmount: number;
    public UpdatedBy: string;
    public Sector: string;
    public _createguid: string;
    public CustomFields: any;
}


export class AGAZone extends UniEntity {
    public static RelativeUrl = 'AGAZones';
    public static EntityType = 'AGAZone';

    public CreatedBy: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
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

    public CreatedBy: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ValidFrom: Date;
    public ID: number;
    public Template: string;
    public UpdatedBy: string;
    public Name: string;
    public AppliesTo: number;
    public _createguid: string;
    public CustomFields: any;
}


export class AssetGroup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AssetGroup';

    public DepreciationYears: number;
    public DepreciationRate: number;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Code: string;
    public ToDate: Date;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public UpdatedBy: string;
    public Name: string;
    public DepreciationAccountNumber: number;
    public _createguid: string;
    public CustomFields: any;
}


export class BankIdentifierCode extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'BankIdentifierCode';

    public CreatedBy: string;
    public UpdatedAt: Date;
    public Bic: string;
    public BankName: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public BankIdentifier: string;
    public ID: number;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class CompanyType extends UniEntity {
    public static RelativeUrl = 'companytypes';
    public static EntityType = 'CompanyType';

    public Description: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public DefaultPlanType: PlanTypeEnum;
    public DefaultAccountVisibilityGroupID: number;
    public Priority: boolean;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public FullName: string;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Confirmation extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Confirmation';

    public CreatedBy: string;
    public UpdatedAt: Date;
    public DisplayName: string;
    public StatusCode: number;
    public Code: string;
    public SignUpReferrer: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public Phone: string;
    public CompanyName: string;
    public ExpirationDate: Date;
    public ContractType: string;
    public UpdatedBy: string;
    public PostalCode: string;
    public Email: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Country extends UniEntity {
    public static RelativeUrl = 'countries';
    public static EntityType = 'Country';

    public CreatedBy: string;
    public UpdatedAt: Date;
    public DefaultCurrencyCode: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public CurrencyRateSource: string;
    public UpdatedBy: string;
    public Name: string;
    public CountryCode: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Currency extends UniEntity {
    public static RelativeUrl = 'currencies';
    public static EntityType = 'Currency';

    public CreatedBy: string;
    public UpdatedAt: Date;
    public ToCurrencyCodeID: number;
    public Source: CurrencySourceEnum;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public Factor: number;
    public UpdatedBy: string;
    public ExchangeRate: number;
    public FromCurrencyCodeID: number;
    public CurrencyDate: LocalDate;
    public _createguid: string;
    public FromCurrencyCode: CurrencyCode;
    public ToCurrencyCode: CurrencyCode;
    public CustomFields: any;
}


export class CurrencyCode extends UniEntity {
    public static RelativeUrl = 'currencycodes';
    public static EntityType = 'CurrencyCode';

    public Description: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Code: string;
    public Deleted: boolean;
    public CreatedAt: Date;
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

    public Description: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public DebtCollectionSettingsID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
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
    public UpdatedAt: Date;
    public employment: TypeOfEmployment;
    public TradeArea: boolean;
    public EndDate: boolean;
    public JobName: boolean;
    public JobCode: boolean;
    public LastWorkPercentChange: boolean;
    public HourRate: boolean;
    public typeOfEmployment: boolean;
    public Deleted: boolean;
    public CreatedAt: Date;
    public MonthRate: boolean;
    public HoursPerWeek: boolean;
    public PaymentType: RemunerationType;
    public ID: number;
    public WorkPercent: boolean;
    public SeniorityDate: boolean;
    public StartDate: boolean;
    public ShipReg: boolean;
    public LastSalaryChangeDate: boolean;
    public UserDefinedRate: boolean;
    public WorkingHoursScheme: boolean;
    public UpdatedBy: string;
    public RemunerationType: boolean;
    public ShipType: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class FinancialDeadline extends UniEntity {
    public static RelativeUrl = 'deadlines';
    public static EntityType = 'FinancialDeadline';

    public CreatedBy: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public PassableDueDate: number;
    public AdditionalInfo: string;
    public Deadline: LocalDate;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public UpdatedBy: string;
    public Name: string;
    public Type: FinancialDeadlineType;
    public _createguid: string;
    public CustomFields: any;
}


export class LanguageCode extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'LanguageCode';

    public CreatedBy: string;
    public UpdatedAt: Date;
    public Code: string;
    public Deleted: boolean;
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
    public UpdatedAt: Date;
    public MunicipalityNo: string;
    public CountyName: string;
    public Retired: boolean;
    public CountyNo: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public MunicipalityName: string;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class MunicipalAGAZone extends UniEntity {
    public static RelativeUrl = 'MunicipalAGAZones';
    public static EntityType = 'MunicipalAGAZone';

    public CreatedBy: string;
    public ZoneID: number;
    public UpdatedAt: Date;
    public MunicipalityNo: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public Startdate: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class PaymentBatchType extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'PaymentBatchType';

    public Description: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Code: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class PaymentCode extends UniEntity {
    public static RelativeUrl = 'paymentCodes';
    public static EntityType = 'PaymentCode';

    public Description: string;
    public CreatedBy: string;
    public PaymentGroup: string;
    public UpdatedAt: Date;
    public Code: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class PostalCode extends UniEntity {
    public static RelativeUrl = 'postalcodes';
    public static EntityType = 'PostalCode';

    public CreatedBy: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public Code: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public City: string;
    public ID: number;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class SaftMappingAccount extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'SaftMappingAccount';

    public Description: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public AccountID: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class StaticRegister extends UniEntity {
    public static RelativeUrl = 'StaticRegister';
    public static EntityType = 'StaticRegister';

    public CreatedBy: string;
    public Registry: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public stamp: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class STYRKCode extends UniEntity {
    public static RelativeUrl = 'STYRK';
    public static EntityType = 'STYRKCode';

    public CreatedBy: string;
    public styrk: string;
    public UpdatedAt: Date;
    public tittel: string;
    public ynr: number;
    public Deleted: boolean;
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

    public CreatedBy: string;
    public UpdatedAt: Date;
    public Code: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public FallBackLanguageID: number;
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
    public Description: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public Model: string;
    public Meaning: string;
    public Module: i18nModule;
    public UpdatedBy: string;
    public Value: string;
    public Column: string;
    public _createguid: string;
    public Translations: Array<Translation>;
    public CustomFields: any;
}


export class Translation extends UniEntity {
    public static RelativeUrl = 'translations';
    public static EntityType = 'Translation';

    public CreatedBy: string;
    public UpdatedAt: Date;
    public TranslatableID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public UpdatedBy: string;
    public Value: string;
    public LanguageID: number;
    public _createguid: string;
    public Language: Language;
    public Translatable: Translatable;
    public CustomFields: any;
}


export class VatCodeGroupSetup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'VatCodeGroupSetup';

    public CreatedBy: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public No: string;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class VatPostSetup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'VatPostSetup';

    public CreatedBy: string;
    public UpdatedAt: Date;
    public VatCodeGroupSetupNo: string;
    public HasTaxAmount: boolean;
    public ReportAsNegativeAmount: boolean;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public No: string;
    public UpdatedBy: string;
    public Name: string;
    public HasTaxBasis: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class VatReportForm extends UniEntity {
    public static RelativeUrl = 'vatreportforms';
    public static EntityType = 'VatReportForm';

    public Description: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class VatReportReferenceSetup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'VatReportReferenceSetup';

    public VatCode: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public VatPostNo: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public UpdatedBy: string;
    public AccountNumber: number;
    public _createguid: string;
    public CustomFields: any;
}


export class VatTypeSetup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'VatTypeSetup';

    public VatCode: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public IsNotVatRegistered: boolean;
    public IncomingAccountNumber: number;
    public DefaultVisible: boolean;
    public DirectJournalEntryOnly: boolean;
    public VatCodeGroupNo: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public OutputVat: boolean;
    public ReversedTaxDutyVat: boolean;
    public UpdatedBy: string;
    public IsCompensated: boolean;
    public Name: string;
    public OutgoingAccountNumber: number;
    public _createguid: string;
    public VatTypeSetupPercentages: Array<VatTypeSetupPercentage>;
    public CustomFields: any;
}


export class VatTypeSetupPercentage extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'VatTypeSetupPercentage';

    public CreatedBy: string;
    public UpdatedAt: Date;
    public VatTypeSetupID: number;
    public VatPercent: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ValidFrom: LocalDate;
    public ID: number;
    public UpdatedBy: string;
    public ValidTo: LocalDate;
    public _createguid: string;
    public CustomFields: any;
}


export class CompanyReport extends UniEntity {
    public static RelativeUrl = 'company-report';
    public static EntityType = 'CompanyReport';

    public CreatedBy: string;
    public ReportDefinitionID: number;
    public UpdatedAt: Date;
    public ContractId: number;
    public CompanyKey: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class ReportDefinition extends UniEntity {
    public static RelativeUrl = 'report-definitions';
    public static EntityType = 'ReportDefinition';

    public Description: string;
    public CreatedBy: string;
    public UniqueReportID: string;
    public UpdatedAt: Date;
    public Category: string;
    public Md5: string;
    public ReportSource: string;
    public Visible: boolean;
    public CategoryLabel: string;
    public TemplateLinkId: string;
    public Version: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public ReportType: number;
    public UpdatedBy: string;
    public IsStandard: boolean;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class ReportDefinitionDataSource extends UniEntity {
    public static RelativeUrl = 'report-definition-data-sources';
    public static EntityType = 'ReportDefinitionDataSource';

    public CreatedBy: string;
    public ReportDefinitionId: number;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public CreatedAt: Date;
    public DataSourceUrl: string;
    public ID: number;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class ReportDefinitionParameter extends UniEntity {
    public static RelativeUrl = 'report-definition-parameters';
    public static EntityType = 'ReportDefinitionParameter';

    public CreatedBy: string;
    public ReportDefinitionId: number;
    public UpdatedAt: Date;
    public DefaultValueLookupType: string;
    public DefaultValue: string;
    public Visible: boolean;
    public DefaultValueSource: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public DefaultValueList: string;
    public UpdatedBy: string;
    public Name: string;
    public Type: string;
    public Label: string;
    public _createguid: string;
    public CustomFields: any;
}


export class PeriodSeries extends UniEntity {
    public static RelativeUrl = 'period-series';
    public static EntityType = 'PeriodSeries';

    public CreatedBy: string;
    public UpdatedAt: Date;
    public Active: boolean;
    public SeriesType: PeriodSeriesType;
    public Deleted: boolean;
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
    public UpdatedAt: Date;
    public ToDate: LocalDate;
    public PeriodSeriesID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public No: number;
    public UpdatedBy: string;
    public Name: string;
    public FromDate: LocalDate;
    public _createguid: string;
    public PeriodSeries: PeriodSeries;
    public CustomFields: any;
}


export class Model extends UniEntity {
    public static RelativeUrl = 'models';
    public static EntityType = 'Model';

    public Description: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Admin: boolean;
    public Deleted: boolean;
    public CreatedAt: Date;
    public Shared: boolean;
    public ID: number;
    public UpdatedBy: string;
    public LabelPlural: string;
    public Name: string;
    public Label: string;
    public _createguid: string;
    public Fields: Array<Field>;
    public CustomFields: any;
}


export class Field extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Field';

    public Description: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public ModelID: number;
    public UpdatedBy: string;
    public Name: string;
    public Label: string;
    public HelpText: string;
    public _createguid: string;
    public Model: Model;
    public CustomFields: any;
}


export class Notification extends UniEntity {
    public static RelativeUrl = 'notifications';
    public static EntityType = 'Notification';

    public CreatedBy: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CompanyKey: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public SourceEntityID: number;
    public ID: number;
    public EntityType: string;
    public CompanyName: string;
    public RecipientID: string;
    public UpdatedBy: string;
    public EntityID: number;
    public SenderDisplayName: string;
    public SourceEntityType: string;
    public Message: string;
    public _createguid: string;
    public CustomFields: any;
}


export class CompanySettings extends UniEntity {
    public static RelativeUrl = 'companysettings';
    public static EntityType = 'CompanySettings';

    public BaseCurrencyCodeID: number;
    public TwoStageAutobankEnabled: boolean;
    public SettlementVatAccountID: number;
    public VatLockedDate: LocalDate;
    public AccountGroupSetID: number;
    public CreatedBy: string;
    public SaveCustomersFromQuoteAsLead: boolean;
    public AcceptableDelta4CustomerPaymentAccountID: number;
    public RoundingNumberOfDecimals: number;
    public TaxBankAccountID: number;
    public UpdatedAt: Date;
    public ShowKIDOnCustomerInvoice: boolean;
    public HasAutobank: boolean;
    public BookCustomerInvoiceOnDeliveryDate: boolean;
    public UseNetsIntegration: boolean;
    public GLN: string;
    public StatusCode: number;
    public AutoJournalPayment: string;
    public FactoringEmailID: number;
    public APIncludeAttachment: boolean;
    public VatReportFormID: number;
    public ShowNumberOfDecimals: number;
    public CompanyBankAccountID: number;
    public TaxableFromLimit: number;
    public CompanyTypeID: number;
    public SupplierAccountID: number;
    public AcceptableDelta4CustomerPayment: number;
    public DefaultCustomerQuoteReportID: number;
    public UseAssetRegister: boolean;
    public UseOcrInterpretation: boolean;
    public DefaultEmailID: number;
    public LogoAlign: number;
    public DefaultAddressID: number;
    public PaymentBankIdentification: string;
    public IgnorePaymentsWithoutEndToEndID: boolean;
    public OrganizationNumber: string;
    public APGuid: string;
    public DefaultCustomerInvoiceReportID: number;
    public DefaultCustomerOrderReportID: number;
    public NetsIntegrationActivated: boolean;
    public StoreDistributedInvoice: boolean;
    public PaymentBankAgreementNumber: string;
    public XtraPaymentOrgXmlTagValue: string;
    public TaxableFromDate: LocalDate;
    public InterrimPaymentAccountID: number;
    public Localization: string;
    public Factoring: number;
    public TaxMandatory: boolean;
    public Deleted: boolean;
    public CreatedAt: Date;
    public HideInActiveSuppliers: boolean;
    public SalaryBankAccountID: number;
    public TaxMandatoryType: number;
    public CustomerCreditDays: number;
    public LogoHideField: number;
    public ID: number;
    public PeriodSeriesVatID: number;
    public CustomerAccountID: number;
    public CustomerInvoiceReminderSettingsID: number;
    public DefaultCustomerInvoiceReminderReportID: number;
    public BankChargeAccountID: number;
    public AgioGainAccountID: number;
    public HideInActiveCustomers: boolean;
    public CompanyName: string;
    public DefaultSalesAccountID: number;
    public CompanyRegistered: boolean;
    public SAFTimportAccountID: number;
    public InterrimRemitAccountID: number;
    public BatchInvoiceMinAmount: number;
    public APContactID: number;
    public WebAddress: string;
    public DefaultPhoneID: number;
    public OfficeMunicipalityNo: string;
    public AgioLossAccountID: number;
    public APActivated: boolean;
    public UpdatedBy: string;
    public UsePaymentBankValues: boolean;
    public RoundingType: RoundingType;
    public ForceSupplierInvoiceApproval: boolean;
    public DefaultDistributionsID: number;
    public DefaultTOFCurrencySettingsID: number;
    public UseXtraPaymentOrgXmlTag: boolean;
    public LogoFileID: number;
    public FactoringNumber: number;
    public AccountingLockedDate: LocalDate;
    public AccountVisibilityGroupID: number;
    public PeriodSeriesAccountID: number;
    public UseFinancialDateToCalculateVatPercent: boolean;
    public AutoDistributeInvoice: boolean;
    public AllowAvtalegiroRegularInvoice: boolean;
    public _createguid: string;
    public DefaultAddress: Address;
    public DefaultPhone: Phone;
    public DefaultEmail: Email;
    public SupplierAccount: Account;
    public CustomerAccount: Account;
    public SAFTimportAccount: Account;
    public BankAccounts: Array<BankAccount>;
    public CompanyBankAccount: BankAccount;
    public TaxBankAccount: BankAccount;
    public SalaryBankAccount: BankAccount;
    public SettlementVatAccount: Account;
    public DefaultSalesAccount: Account;
    public APContact: Contact;
    public APIncomming: Array<AccessPointFormat>;
    public APOutgoing: Array<AccessPointFormat>;
    public Distributions: Distributions;
    public CustomerInvoiceReminderSettings: CustomerInvoiceReminderSettings;
    public BaseCurrencyCode: CurrencyCode;
    public AgioGainAccount: Account;
    public AgioLossAccount: Account;
    public BankChargeAccount: Account;
    public AcceptableDelta4CustomerPaymentAccount: Account;
    public DefaultTOFCurrencySettings: TOFCurrencySettings;
    public FactoringEmail: Email;
    public CustomFields: any;
}


export class DistributionPlan extends UniEntity {
    public static RelativeUrl = 'distributions';
    public static EntityType = 'DistributionPlan';

    public CreatedBy: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public EntityType: string;
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
    public UpdatedAt: Date;
    public StatusCode: number;
    public DistributionPlanElementTypeID: number;
    public Priority: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public UpdatedBy: string;
    public DistributionPlanID: number;
    public _createguid: string;
    public ElementType: DistributionPlanElementType;
    public CustomFields: any;
}


export class DistributionPlanElementType extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'DistributionPlanElementType';

    public CreatedBy: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
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
    public UpdatedAt: Date;
    public StatusCode: number;
    public DistributionPlanElementTypeID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public EntityType: string;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Distributions extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Distributions';

    public CreatedBy: string;
    public UpdatedAt: Date;
    public CustomerOrderDistributionPlanID: number;
    public StatusCode: number;
    public AnnualStatementDistributionPlanID: number;
    public CustomerQuoteDistributionPlanID: number;
    public CustomerInvoiceReminderDistributionPlanID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public CustomerInvoiceDistributionPlanID: number;
    public PayCheckDistributionPlanID: number;
    public UpdatedBy: string;
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
    public UpdatedAt: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class EmailLog extends UniEntity {
    public static RelativeUrl = 'emails';
    public static EntityType = 'EmailLog';

    public CreatedBy: string;
    public UpdatedAt: Date;
    public ExternalReference: string;
    public StatusCode: number;
    public ExternalMessage: string;
    public Subject: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public To: string;
    public ID: number;
    public From: string;
    public EntityType: string;
    public JobRunExternalRef: string;
    public DistributeAt: LocalDate;
    public UpdatedBy: string;
    public JobRunID: number;
    public EntityID: number;
    public Type: SharingType;
    public EntityDisplayValue: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Eventplan extends UniEntity {
    public static RelativeUrl = 'eventplans';
    public static EntityType = 'Eventplan';

    public CreatedBy: string;
    public ExpressionFilter: string;
    public UpdatedAt: Date;
    public OperationFilter: string;
    public JobNames: string;
    public StatusCode: number;
    public PlanType: EventplanType;
    public Active: boolean;
    public ModelFilter: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public IsSystemPlan: boolean;
    public UpdatedBy: string;
    public Cargo: string;
    public Name: string;
    public _createguid: string;
    public Subscribers: Array<EventSubscriber>;
    public CustomFields: any;
}


export class EventSubscriber extends UniEntity {
    public static RelativeUrl = 'eventsubscribers';
    public static EntityType = 'EventSubscriber';

    public CreatedBy: string;
    public UpdatedAt: Date;
    public Headers: string;
    public StatusCode: number;
    public Active: boolean;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public UpdatedBy: string;
    public EventplanID: number;
    public Authorization: string;
    public Name: string;
    public Endpoint: string;
    public _createguid: string;
    public Eventplan: Eventplan;
    public CustomFields: any;
}


export class Period extends UniEntity {
    public static RelativeUrl = 'periodes';
    public static EntityType = 'Period';

    public CreatedBy: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public PeriodTemplateID: number;
    public ToDate: LocalDate;
    public PeriodSeriesID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public No: number;
    public AccountYear: number;
    public UpdatedBy: string;
    public Name: string;
    public FromDate: LocalDate;
    public _createguid: string;
    public PeriodTemplate: PeriodTemplate;
    public PeriodSeries: PeriodSeries;
    public CustomFields: any;
}


export class PredefinedDescription extends UniEntity {
    public static RelativeUrl = 'predefineddescriptions';
    public static EntityType = 'PredefinedDescription';

    public Description: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public Code: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public UpdatedBy: string;
    public Type: PredefinedDescriptionType;
    public _createguid: string;
    public CustomFields: any;
}


export class ProductCategory extends UniEntity {
    public static RelativeUrl = 'productcategories';
    public static EntityType = 'ProductCategory';

    public Description: string;
    public CreatedBy: string;
    public Depth: number;
    public ParentID: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public Lft: number;
    public Comment: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public UpdatedBy: string;
    public Rght: number;
    public Name: string;
    public Status: number;
    public _createguid: string;
    public CustomFields: any;
}


export class ProductCategoryLink extends UniEntity {
    public static RelativeUrl = 'productcategorylinks';
    public static EntityType = 'ProductCategoryLink';

    public ProductID: number;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public ProductCategoryID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public UpdatedBy: string;
    public _createguid: string;
    public ProductCategory: ProductCategory;
    public CustomFields: any;
}


export class Sharing extends UniEntity {
    public static RelativeUrl = 'sharings';
    public static EntityType = 'Sharing';

    public CreatedBy: string;
    public UpdatedAt: Date;
    public ExternalReference: string;
    public StatusCode: number;
    public ExternalMessage: string;
    public Subject: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public To: string;
    public ID: number;
    public From: string;
    public EntityType: string;
    public JobRunExternalRef: string;
    public DistributeAt: LocalDate;
    public UpdatedBy: string;
    public JobRunID: number;
    public EntityID: number;
    public Type: SharingType;
    public EntityDisplayValue: string;
    public _createguid: string;
    public CustomFields: any;
}


export class StatusLog extends UniEntity {
    public static RelativeUrl = 'statuslogs';
    public static EntityType = 'StatusLog';

    public CreatedBy: string;
    public FromStatus: number;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public EntityType: string;
    public UpdatedBy: string;
    public ToStatus: number;
    public EntityID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class Tracelink extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Tracelink';

    public SourceInstanceID: number;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public DestinationEntityName: string;
    public StatusCode: number;
    public DestinationInstanceID: number;
    public Date: Date;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public UpdatedBy: string;
    public SourceEntityName: string;
    public _createguid: string;
    public CustomFields: any;
}


export class User extends UniEntity {
    public static RelativeUrl = 'users';
    public static EntityType = 'User';

    public CreatedBy: string;
    public UpdatedAt: Date;
    public UserName: string;
    public DisplayName: string;
    public LastLogin: Date;
    public StatusCode: number;
    public BankIntegrationUserName: string;
    public HasAgreedToImportDisclaimer: boolean;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public PhoneNumber: string;
    public Protected: boolean;
    public UpdatedBy: string;
    public IsAutobankAdmin: boolean;
    public GlobalIdentity: string;
    public Email: string;
    public TwoFactorEnabled: boolean;
    public EndDate: Date;
    public AuthPhoneNumber: string;
    public _createguid: string;
    public CustomFields: any;
}


export class UniQueryDefinition extends UniEntity {
    public static RelativeUrl = 'uniquerydefinitions';
    public static EntityType = 'UniQueryDefinition';

    public Description: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public UserID: number;
    public Category: string;
    public SystemGeneratedQuery: boolean;
    public Code: string;
    public SortIndex: number;
    public ModuleID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public ClickUrl: string;
    public IsShared: boolean;
    public UpdatedBy: string;
    public ClickParam: string;
    public Name: string;
    public MainModelName: string;
    public _createguid: string;
    public UniQueryFilters: Array<UniQueryFilter>;
    public UniQueryFields: Array<UniQueryField>;
    public CustomFields: any;
}


export class UniQueryField extends UniEntity {
    public static RelativeUrl = 'uniqueryfields';
    public static EntityType = 'UniQueryField';

    public CreatedBy: string;
    public Header: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public Field: string;
    public Alias: string;
    public Index: number;
    public FieldType: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public SumFunction: string;
    public ID: number;
    public UpdatedBy: string;
    public UniQueryDefinitionID: number;
    public Path: string;
    public Width: string;
    public _createguid: string;
    public CustomFields: any;
}


export class UniQueryFilter extends UniEntity {
    public static RelativeUrl = 'uniqueryfilters';
    public static EntityType = 'UniQueryFilter';

    public CreatedBy: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public Field: string;
    public Operator: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public UpdatedBy: string;
    public Value: string;
    public UniQueryDefinitionID: number;
    public Group: number;
    public _createguid: string;
    public CustomFields: any;
}


export class Team extends UniEntity {
    public static RelativeUrl = 'teams';
    public static EntityType = 'Team';

    public CreatedBy: string;
    public Depth: number;
    public ParentID: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public Lft: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public DimensionsID: number;
    public UpdatedBy: string;
    public Rght: number;
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
    public UpdatedAt: Date;
    public RelatedSharedRoleId: number;
    public Position: TeamPositionEnum;
    public StatusCode: number;
    public UserID: number;
    public ApproveOrder: number;
    public ToDate: LocalDate;
    public TeamID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public UpdatedBy: string;
    public FromDate: LocalDate;
    public _createguid: string;
    public Team: Team;
    public CustomFields: any;
}


export class ApprovalRule extends UniEntity {
    public static RelativeUrl = 'approvalrules';
    public static EntityType = 'ApprovalRule';

    public RuleType: ApprovalRuleType;
    public Keywords: string;
    public Description: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public IndustryCodes: string;
    public UpdatedBy: string;
    public _createguid: string;
    public Steps: Array<ApprovalRuleStep>;
    public CustomFields: any;
}


export class ApprovalRuleStep extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ApprovalRuleStep';

    public CreatedBy: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public UserID: number;
    public Limit: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public ApprovalRuleID: number;
    public StepNumber: number;
    public UpdatedBy: string;
    public _createguid: string;
    public ApprovalRule: ApprovalRule;
    public User: User;
    public CustomFields: any;
}


export class ApprovalSubstitute extends UniEntity {
    public static RelativeUrl = 'approvalsubstitutes';
    public static EntityType = 'ApprovalSubstitute';

    public CreatedBy: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public UserID: number;
    public ToDate: LocalDate;
    public Deleted: boolean;
    public CreatedAt: Date;
    public SubstituteUserID: number;
    public ID: number;
    public UpdatedBy: string;
    public FromDate: LocalDate;
    public _createguid: string;
    public User: User;
    public SubstituteUser: User;
    public CustomFields: any;
}


export class TaskApprovalPlan extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'TaskApprovalPlan';

    public CreatedBy: string;
    public Amount: number;
    public UpdatedAt: Date;
    public ApprovalID: number;
    public TaskID: number;
    public StatusCode: number;
    public UserID: number;
    public Limit: number;
    public Comment: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public ApprovalRuleID: number;
    public StepNumber: number;
    public UpdatedBy: string;
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

    public Description: string;
    public CreatedBy: string;
    public StatusCategoryID: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public IsDepricated: boolean;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public System: boolean;
    public EntityType: string;
    public UpdatedBy: string;
    public Order: number;
    public _createguid: string;
    public StatusCategory: StatusCategory;
    public CustomFields: any;
}


export class StatusCategory extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'StatusCategory';

    public CreatedBy: string;
    public UpdatedAt: Date;
    public StatusCategoryCode: StatusCategoryCode;
    public Deleted: boolean;
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
    public UpdatedAt: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public EntityType: string;
    public UpdatedBy: string;
    public Remark: string;
    public EntityID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class Transition extends UniEntity {
    public static RelativeUrl = 'transitions';
    public static EntityType = 'Transition';

    public CreatedBy: string;
    public UpdatedAt: Date;
    public Controller: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public EntityType: string;
    public MethodName: string;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class TransitionThreshold extends UniEntity {
    public static RelativeUrl = 'thresholds';
    public static EntityType = 'TransitionThreshold';

    public PropertyName: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Operation: OperationType;
    public SharedRejectTransitionId: number;
    public Disabled: boolean;
    public RejectStatusCode: number;
    public SharedRoleId: number;
    public Operator: Operator;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public UpdatedBy: string;
    public SharedApproveTransitionId: number;
    public Value: string;
    public _createguid: string;
    public CustomFields: any;
}


export class TransitionThresholdApproval extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'TransitionThresholdApproval';

    public PropertyName: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public ApprovalID: number;
    public Operation: OperationType;
    public SharedRejectTransitionId: number;
    public RejectStatusCode: number;
    public SharedRoleId: number;
    public Operator: Operator;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public UpdatedBy: string;
    public SharedApproveTransitionId: number;
    public Value: string;
    public _createguid: string;
    public Approval: Approval;
    public CustomFields: any;
}


export class Approval extends UniEntity {
    public static RelativeUrl = 'approvals';
    public static EntityType = 'Approval';

    public CreatedBy: string;
    public Amount: number;
    public UpdatedAt: Date;
    public TaskID: number;
    public StatusCode: number;
    public UserID: number;
    public SharedRoleId: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public UpdatedBy: string;
    public _createguid: string;
    public Thresholds: Array<TransitionThresholdApproval>;
    public Task: Task;
    public User: User;
    public CustomFields: any;
}


export class Task extends UniEntity {
    public static RelativeUrl = 'tasks';
    public static EntityType = 'Task';

    public CreatedBy: string;
    public UpdatedAt: Date;
    public Title: string;
    public StatusCode: number;
    public SharedRejectTransitionId: number;
    public UserID: number;
    public RejectStatusCode: number;
    public SharedRoleId: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public ModelID: number;
    public UpdatedBy: string;
    public SharedApproveTransitionId: number;
    public EntityID: number;
    public Type: TaskType;
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

    public CreatedBy: string;
    public UpdatedAt: Date;
    public IsDepricated: boolean;
    public ExpiresDate: Date;
    public FromStatusID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public ToStatusID: number;
    public EntityType: string;
    public UpdatedBy: string;
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

    public Description: string;
    public CreatedBy: string;
    public Amount: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public EndDate: LocalDate;
    public ProjectNumberNumeric: number;
    public PlannedEnddate: LocalDate;
    public WorkPlaceAddressID: number;
    public ProjectNumberSeriesID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public Price: number;
    public ProjectNumber: string;
    public CostPrice: number;
    public ID: number;
    public ProjectCustomerID: number;
    public StartDate: LocalDate;
    public DimensionsID: number;
    public ProjectLeadName: string;
    public PlannedStartdate: LocalDate;
    public Total: number;
    public UpdatedBy: string;
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
    public Responsibility: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public UserID: number;
    public ProjectID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public UpdatedBy: string;
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
    public UpdatedAt: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public ProjectTaskScheduleID: number;
    public ProjectTaskID: number;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class ProjectTask extends UniEntity {
    public static RelativeUrl = 'projects-tasks';
    public static EntityType = 'ProjectTask';

    public Description: string;
    public CreatedBy: string;
    public Amount: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public ProjectID: number;
    public SuggestedNumber: string;
    public EndDate: LocalDate;
    public Deleted: boolean;
    public CreatedAt: Date;
    public Price: number;
    public CostPrice: number;
    public ID: number;
    public StartDate: LocalDate;
    public Total: number;
    public UpdatedBy: string;
    public Name: string;
    public Number: string;
    public _createguid: string;
    public ProjectTaskSchedules: Array<ProjectTaskSchedule>;
    public ProjectTaskResources: Array<ProjectResourceSchedule>;
    public CustomFields: any;
}


export class ProjectTaskSchedule extends UniEntity {
    public static RelativeUrl = 'projects-tasks-schedules';
    public static EntityType = 'ProjectTaskSchedule';

    public CreatedBy: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public EndDate: LocalDate;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public StartDate: LocalDate;
    public ProjectTaskID: number;
    public UpdatedBy: string;
    public _createguid: string;
    public ScheduleResources: Array<ProjectResourceSchedule>;
    public CustomFields: any;
}


export class BarnepassProduct extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'BarnepassProduct';

    public ProductID: number;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public UpdatedBy: string;
    public _createguid: string;
    public Product: Product;
    public CustomFields: any;
}


export class Product extends UniEntity {
    public static RelativeUrl = 'products';
    public static EntityType = 'Product';

    public Description: string;
    public CalculateGrossPriceBasedOnNetPrice: boolean;
    public DefaultProductCategoryID: number;
    public CreatedBy: string;
    public PriceIncVat: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public VariansParentID: number;
    public PartName: string;
    public PriceExVat: number;
    public AccountID: number;
    public Unit: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public CostPrice: number;
    public ID: number;
    public ListPrice: number;
    public DimensionsID: number;
    public UpdatedBy: string;
    public ImageFileID: number;
    public VatTypeID: number;
    public Name: string;
    public Type: ProductTypeEnum;
    public AverageCost: number;
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

    public CreatedBy: string;
    public IsDefaultForTask: boolean;
    public UpdatedAt: Date;
    public DisplayName: string;
    public NumberSeriesTaskID: number;
    public NumberSeriesTypeID: number;
    public StatusCode: number;
    public Disabled: boolean;
    public ToNumber: number;
    public Empty: boolean;
    public Comment: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public NumberLock: boolean;
    public System: boolean;
    public UseNumbersFromNumberSeriesID: number;
    public AccountYear: number;
    public UpdatedBy: string;
    public NextNumber: number;
    public FromNumber: number;
    public Name: string;
    public MainAccountID: number;
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

    public NumberSerieTypeAID: number;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public UpdatedBy: string;
    public NumberSerieTypeBID: number;
    public _createguid: string;
    public NumberSerieTypeA: NumberSeriesType;
    public NumberSerieTypeB: NumberSeriesType;
    public CustomFields: any;
}


export class NumberSeriesTask extends UniEntity {
    public static RelativeUrl = 'number-series-tasks';
    public static EntityType = 'NumberSeriesTask';

    public CreatedBy: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public EntityType: string;
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
    public UpdatedAt: Date;
    public StatusCode: number;
    public EntityField: string;
    public CanHaveSeveralActiveSeries: boolean;
    public EntitySeriesIDField: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public System: boolean;
    public EntityType: string;
    public UpdatedBy: string;
    public Yearly: boolean;
    public Name: string;
    public _createguid: string;
    public Series: Array<NumberSeries>;
    public CustomFields: any;
}


export class EncryptionInfo extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'EncryptionInfo';

    public description: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public password: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public UpdatedBy: string;
    public type: Type;
    public _createguid: string;
    public CustomFields: any;
}


export class File extends UniEntity {
    public static RelativeUrl = 'files/{entitytype}/{entityid}';
    public static EntityType = 'File';

    public Description: string;
    public CreatedBy: string;
    public Pages: number;
    public UpdatedAt: Date;
    public encryptionID: number;
    public PermaLink: string;
    public Size: string;
    public StatusCode: number;
    public Md5: string;
    public ContentType: string;
    public OCRData: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public StorageReference: string;
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
    public UpdatedAt: Date;
    public FileID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public UpdatedBy: string;
    public TagName: string;
    public Status: number;
    public _createguid: string;
    public File: File;
    public CustomFields: any;
}


export class FileEntityLink extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'FileEntityLink';

    public CreatedBy: string;
    public IsAttachment: boolean;
    public UpdatedAt: Date;
    public StatusCode: number;
    public FileID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public EntityType: string;
    public UpdatedBy: string;
    public EntityID: number;
    public _createguid: string;
    public File: File;
    public CustomFields: any;
}


export class ElsaUsageLog extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ElsaUsageLog';

    public Quantity: number;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public ExternalReference: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public ProductType: string;
    public UpdatedBy: string;
    public DateLogged: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class AccessPointFormat extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AccessPointFormat';

    public CreatedBy: string;
    public OutgoingID: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public IncommingID: number;
    public ResourceName: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public UpdatedBy: string;
    public Name: string;
    public Label: string;
    public _createguid: string;
    public CustomFields: any;
}


export class EHFLog extends UniEntity {
    public static RelativeUrl = 'ehf';
    public static EntityType = 'EHFLog';

    public CreatedBy: string;
    public UpdatedAt: Date;
    public ExternalReference: string;
    public StatusCode: number;
    public ExternalMessage: string;
    public Subject: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public To: string;
    public ID: number;
    public From: string;
    public EntityType: string;
    public JobRunExternalRef: string;
    public DistributeAt: LocalDate;
    public UpdatedBy: string;
    public JobRunID: number;
    public EntityID: number;
    public Type: SharingType;
    public EntityDisplayValue: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Department extends UniEntity {
    public static RelativeUrl = 'departments';
    public static EntityType = 'Department';

    public Description: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public DepartmentManagerName: string;
    public DepartmentNumberSeriesID: number;
    public DepartmentNumber: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public DepartmentNumberNumeric: number;
    public ID: number;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public DepartmentNumberSeries: NumberSeries;
    public CustomFields: any;
}


export class Dimension10 extends UniEntity {
    public static RelativeUrl = 'Dimension10';
    public static EntityType = 'Dimension10';

    public Description: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public NumberNumeric: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public UpdatedBy: string;
    public Name: string;
    public Number: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Dimension5 extends UniEntity {
    public static RelativeUrl = 'Dimension5';
    public static EntityType = 'Dimension5';

    public Description: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public NumberNumeric: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public UpdatedBy: string;
    public Name: string;
    public Number: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Dimension6 extends UniEntity {
    public static RelativeUrl = 'Dimension6';
    public static EntityType = 'Dimension6';

    public Description: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public NumberNumeric: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public UpdatedBy: string;
    public Name: string;
    public Number: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Dimension7 extends UniEntity {
    public static RelativeUrl = 'Dimension7';
    public static EntityType = 'Dimension7';

    public Description: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public NumberNumeric: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public UpdatedBy: string;
    public Name: string;
    public Number: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Dimension8 extends UniEntity {
    public static RelativeUrl = 'Dimension8';
    public static EntityType = 'Dimension8';

    public Description: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public NumberNumeric: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public UpdatedBy: string;
    public Name: string;
    public Number: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Dimension9 extends UniEntity {
    public static RelativeUrl = 'Dimension9';
    public static EntityType = 'Dimension9';

    public Description: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public NumberNumeric: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public UpdatedBy: string;
    public Name: string;
    public Number: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Dimensions extends UniEntity {
    public static RelativeUrl = 'dimensions';
    public static EntityType = 'Dimensions';

    public CreatedBy: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public RegionID: number;
    public ProjectID: number;
    public Dimension5ID: number;
    public Dimension10ID: number;
    public ResponsibleID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public Dimension6ID: number;
    public ID: number;
    public DepartmentID: number;
    public Dimension8ID: number;
    public ProjectTaskID: number;
    public UpdatedBy: string;
    public Dimension7ID: number;
    public Dimension9ID: number;
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
    public Dimension7Number: string;
    public DepartmentName: string;
    public Dimension5Name: string;
    public Dimension7Name: string;
    public DepartmentNumber: string;
    public RegionCode: string;
    public ResponsibleName: string;
    public Dimension6Name: string;
    public Dimension8Number: string;
    public Dimension10Name: string;
    public ProjectNumber: string;
    public ID: number;
    public Dimension5Number: string;
    public DimensionsID: number;
    public Dimension9Number: string;
    public Dimension8Name: string;
    public ProjectTaskNumber: string;
    public Dimension10Number: string;
    public Dimension6Number: string;
    public RegionName: string;
    public Dimension9Name: string;
    public ProjectTaskName: string;
    public ProjectName: string;
}


export class DimensionSettings extends UniEntity {
    public static RelativeUrl = 'dimensionsettings';
    public static EntityType = 'DimensionSettings';

    public CreatedBy: string;
    public UpdatedAt: Date;
    public IsActive: boolean;
    public StatusCode: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public Dimension: number;
    public UpdatedBy: string;
    public Label: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Region extends UniEntity {
    public static RelativeUrl = 'regions';
    public static EntityType = 'Region';

    public Description: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public RegionCode: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public UpdatedBy: string;
    public Name: string;
    public CountryCode: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Responsible extends UniEntity {
    public static RelativeUrl = 'responsibles';
    public static EntityType = 'Responsible';

    public Description: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public NameOfResponsible: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Contract extends UniEntity {
    public static RelativeUrl = 'contracts';
    public static EntityType = 'Contract';

    public Description: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public Engine: ContractEngine;
    public ContractCode: string;
    public TeamsUri: string;
    public HashTransactionAddress: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public UpdatedBy: string;
    public Name: string;
    public Hash: string;
    public _createguid: string;
    public Parameters: Array<ContractParameter>;
    public Triggers: Array<ContractTrigger>;
    public RunLogs: Array<ContractRunLog>;
    public CustomFields: any;
}


export class ContractAddress extends UniEntity {
    public static RelativeUrl = 'contractaddresses';
    public static EntityType = 'ContractAddress';

    public AssetAddress: string;
    public CreatedBy: string;
    public Amount: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public ContractID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public Address: string;
    public EntityType: string;
    public UpdatedBy: string;
    public ContractAssetID: number;
    public EntityID: number;
    public Type: AddressType;
    public _createguid: string;
    public Contract: Contract;
    public ContractAsset: ContractAsset;
    public CustomFields: any;
}


export class ContractAsset extends UniEntity {
    public static RelativeUrl = 'contractassets';
    public static EntityType = 'ContractAsset';

    public CreatedBy: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public Cap: number;
    public ContractID: number;
    public IsIssuedByDefinerOnly: boolean;
    public IsFixedDenominations: boolean;
    public Deleted: boolean;
    public CreatedAt: Date;
    public SpenderAttested: boolean;
    public IsAutoDestroy: boolean;
    public ID: number;
    public IsPrivate: boolean;
    public IsTransferrable: boolean;
    public UpdatedBy: string;
    public IsCosignedByDefiner: boolean;
    public Type: AddressType;
    public _createguid: string;
    public Contract: Contract;
    public CustomFields: any;
}


export class ContractDebugLog extends UniEntity {
    public static RelativeUrl = 'contractdebuglogs';
    public static EntityType = 'ContractDebugLog';

    public CreatedBy: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public ContractID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public UpdatedBy: string;
    public Type: ContractEventType;
    public ContractRunLogID: number;
    public Message: string;
    public _createguid: string;
    public Contract: Contract;
    public ContractRunLog: ContractRunLog;
    public CustomFields: any;
}


export class ContractParameter extends UniEntity {
    public static RelativeUrl = 'contractparameters';
    public static EntityType = 'ContractParameter';

    public CreatedBy: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public ContractID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public UpdatedBy: string;
    public Value: string;
    public Name: string;
    public _createguid: string;
    public Contract: Contract;
    public CustomFields: any;
}


export class ContractRunLog extends UniEntity {
    public static RelativeUrl = 'contractrunlogs';
    public static EntityType = 'ContractRunLog';

    public CreatedBy: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public ContractID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public RunTime: string;
    public ContractTriggerID: number;
    public UpdatedBy: string;
    public Type: ContractEventType;
    public Message: string;
    public _createguid: string;
    public Contract: Contract;
    public CustomFields: any;
}


export class ContractTransaction extends UniEntity {
    public static RelativeUrl = 'contracttransactions';
    public static EntityType = 'ContractTransaction';

    public AssetAddress: string;
    public CreatedBy: string;
    public Amount: number;
    public SenderAddress: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public ReceiverAddress: string;
    public ContractID: number;
    public ContractAddressID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public UpdatedBy: string;
    public _createguid: string;
    public Contract: Contract;
    public ContractAddress: ContractAddress;
    public CustomFields: any;
}


export class ContractTrigger extends UniEntity {
    public static RelativeUrl = 'contracttriggers';
    public static EntityType = 'ContractTrigger';

    public CreatedBy: string;
    public ExpressionFilter: string;
    public UpdatedAt: Date;
    public OperationFilter: string;
    public StatusCode: number;
    public ContractID: number;
    public ModelFilter: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public UpdatedBy: string;
    public Type: ContractEventType;
    public _createguid: string;
    public Contract: Contract;
    public CustomFields: any;
}


export class Comment extends UniEntity {
    public static RelativeUrl = 'comments';
    public static EntityType = 'Comment';

    public CreatedBy: string;
    public UpdatedAt: Date;
    public AuthorID: number;
    public StatusCode: number;
    public Text: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public EntityType: string;
    public UpdatedBy: string;
    public EntityID: number;
    public _createguid: string;
    public Mentioned: Array<Mentioned>;
    public Author: User;
    public CustomFields: any;
}


export class Mentioned extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Mentioned';

    public CreatedBy: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public UserID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public CommentID: number;
    public UpdatedBy: string;
    public _createguid: string;
    public User: User;
    public CustomFields: any;
}


export class ApiKey extends UniEntity {
    public static RelativeUrl = 'apikeys';
    public static EntityType = 'ApiKey';

    public Description: string;
    public ExternalId: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public IntegrationKey: string;
    public Encrypt: boolean;
    public Deleted: boolean;
    public CreatedAt: Date;
    public IntegrationType: TypeOfIntegration;
    public Url: string;
    public ID: number;
    public FilterDate: LocalDate;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Altinn extends UniEntity {
    public static RelativeUrl = 'altinn';
    public static EntityType = 'Altinn';

    public SystemID: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public SystemPw: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public Language: string;
    public PreferredLogin: TypeOfLogin;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class AltinnReceipt extends UniEntity {
    public static RelativeUrl = 'altinnreceipts';
    public static EntityType = 'AltinnReceipt';

    public CreatedBy: string;
    public UpdatedAt: Date;
    public HasBeenRegistered: boolean;
    public StatusCode: number;
    public ReceiptID: number;
    public ErrorText: string;
    public AltinnResponseData: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public XmlReceipt: string;
    public TimeStamp: Date;
    public UpdatedBy: string;
    public UserSign: string;
    public Form: string;
    public _createguid: string;
    public Signings: Array<AltinnSigning>;
    public CustomFields: any;
}


export class AltinnSigning extends UniEntity {
    public static RelativeUrl = 'altinnsigning';
    public static EntityType = 'AltinnSigning';

    public CreatedBy: string;
    public UpdatedAt: Date;
    public DateSigned: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public SignatureText: string;
    public ID: number;
    public AltinnReceiptID: number;
    public SignatureReference: string;
    public StatusText: string;
    public UpdatedBy: string;
    public _createguid: string;
    public AltinnReceipt: AltinnReceipt;
    public CustomFields: any;
}


export class Barnepass extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Barnepass';

    public CreatedBy: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public inntektsaar: number;
    public UpdatedBy: string;
    public _createguid: string;
    public oppgave: Array<BarnepassOppgave>;
    public CustomFields: any;
}


export class BarnepassOppgave extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'BarnepassOppgave';

    public CreatedBy: string;
    public UpdatedAt: Date;
    public foedselsnummer: string;
    public StatusCode: number;
    public navn: string;
    public paaloeptBeloep: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public UpdatedBy: string;
    public email: string;
    public BarnepassID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class UserRole extends UniEntity {
    public static RelativeUrl = 'userroles';
    public static EntityType = 'UserRole';

    public CreatedBy: string;
    public UpdatedAt: Date;
    public UserID: number;
    public SharedRoleId: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public UpdatedBy: string;
    public SharedRoleName: string;
    public _createguid: string;
    public User: User;
    public CustomFields: any;
}


export class Role extends UniEntity {
    public static RelativeUrl = 'roles';
    public static EntityType = 'Role';

    public Description: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public UpdatedBy: string;
    public Name: string;
    public Label: string;
    public _createguid: string;
    public RolePermissions: Array<RolePermission>;
    public CustomFields: any;
}


export class RolePermission extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'RolePermission';

    public CreatedBy: string;
    public UpdatedAt: Date;
    public PermissionID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public UpdatedBy: string;
    public RoleID: number;
    public _createguid: string;
    public Role: Role;
    public Permission: Permission;
    public CustomFields: any;
}


export class Permission extends UniEntity {
    public static RelativeUrl = 'permissions';
    public static EntityType = 'Permission';

    public CreatedBy: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
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

    public KeyPath: string;
    public Description: string;
    public CreatedBy: string;
    public Thumbprint: string;
    public UpdatedAt: Date;
    public DataSender: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public UpdatedBy: string;
    public NextNumber: number;
    public _createguid: string;
    public CustomFields: any;
}


export class AvtaleGiroBankAccount extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AvtaleGiroBankAccount';

    public CreatedBy: string;
    public UpdatedAt: Date;
    public BankAccountNumber: string;
    public CompanyID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public AvtaleGiroAgreementID: number;
    public UpdatedBy: string;
    public _createguid: string;
    public Company: Company;
    public CustomFields: any;
}


export class AvtaleGiroFile extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AvtaleGiroFile';

    public AvtaleGiroContent: string;
    public CreatedBy: string;
    public AvtaleGiroMergedFileID: number;
    public UpdatedAt: Date;
    public CompanyID: number;
    public FileID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public AvtaleGiroAgreementID: number;
    public UpdatedBy: string;
    public _createguid: string;
    public Company: Company;
    public CustomFields: any;
}


export class AvtaleGiroMergedFile extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AvtaleGiroMergedFile';

    public CreatedBy: string;
    public UpdatedAt: Date;
    public TransmissionNumber: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class BankAgreement extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'BankAgreement';

    public CreatedBy: string;
    public UpdatedAt: Date;
    public OrderName: string;
    public OrderEmail: string;
    public ReceiptDate: Date;
    public CompanyID: number;
    public ReceiptID: string;
    public AccountOwnerOrgNumber: string;
    public ServiceAccountID: number;
    public AccountOwnerName: string;
    public CustomerName: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public OrderMobile: string;
    public UpdatedBy: string;
    public ServiceID: string;
    public CustomerOrgNumber: string;
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
    public UpdatedAt: Date;
    public ConfirmInNetbank: boolean;
    public FileType: string;
    public DivisionID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public KidRule: string;
    public DivisionName: string;
    public UpdatedBy: string;
    public BankAgreementID: number;
    public ServiceType: number;
    public _createguid: string;
    public BankAgreement: BankAgreement;
    public BankAccounts: Array<BankServiceBankAccount>;
    public CustomFields: any;
}


export class BankServiceBankAccount extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'BankServiceBankAccount';

    public CreatedBy: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public UpdatedBy: string;
    public AccountNumber: string;
    public BankServiceID: number;
    public _createguid: string;
    public BankService: BankService;
    public CustomFields: any;
}


export class Company extends UniEntity {
    public static RelativeUrl = 'companies';
    public static EntityType = 'Company';

    public CreatedBy: string;
    public SchemaName: string;
    public FileFlowOrgnrEmail: string;
    public UpdatedAt: Date;
    public FileFlowEmail: string;
    public Key: string;
    public IsGlobalTemplate: boolean;
    public IsTemplate: boolean;
    public LastActivity: Date;
    public OrganizationNumber: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ClientNumber: number;
    public ID: number;
    public IsTest: boolean;
    public ConnectionString: string;
    public UpdatedBy: string;
    public Name: string;
    public WebHookSubscriberId: string;
    public _createguid: string;
    public CustomFields: any;
}


export class CompanyAccess extends UniEntity {
    public static RelativeUrl = 'companies-access';
    public static EntityType = 'CompanyAccess';

    public CreatedBy: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public Roles: string;
    public CompanyID: number;
    public EndDate: Date;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public StartDate: Date;
    public UpdatedBy: string;
    public GlobalIdentity: string;
    public _createguid: string;
    public CustomFields: any;
}


export class CompanyBackup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'CompanyBackup';

    public CreatedBy: string;
    public SchemaName: string;
    public UpdatedAt: Date;
    public DeletedAt: Date;
    public Reason: string;
    public CopyFiles: boolean;
    public ContractID: number;
    public ScheduledForDeleteAt: Date;
    public Environment: string;
    public CompanyKey: string;
    public CustomerName: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public BackupStatus: BackupStatus;
    public ID: number;
    public OrgNumber: string;
    public ContainerName: string;
    public CompanyName: string;
    public ContractType: number;
    public UpdatedBy: string;
    public CloudBlobName: string;
    public Message: string;
    public _createguid: string;
    public CustomFields: any;
}


export class ContractCron extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ContractCron';

    public CreatedBy: string;
    public UpdatedAt: Date;
    public ContractID: number;
    public CompanyID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public Expression: string;
    public ID: number;
    public ContractTriggerID: number;
    public UpdatedBy: string;
    public CompanyDbName: string;
    public CompanyKey: string;
    public _createguid: string;
    public CustomFields: any;
}


export class ContractObyte extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ContractObyte';

    public AssetAddress: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public ContractID: number;
    public CompanyID: number;
    public ContractAddressID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public Address: string;
    public UpdatedBy: string;
    public CompanyDbName: string;
    public CompanyKey: string;
    public _createguid: string;
    public CustomFields: any;
}


export class DeniedUserAccessLog extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'DeniedUserAccessLog';

    public CreatedBy: string;
    public UpdatedAt: Date;
    public Username: string;
    public CompanyID: number;
    public Occurred: Date;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public CompanyName: string;
    public UpdatedBy: string;
    public Email: string;
    public Message: string;
    public _createguid: string;
    public Company: Company;
    public CustomFields: any;
}


export class FailedBankFile extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'FailedBankFile';

    public CreatedBy: string;
    public UpdatedAt: Date;
    public FileName: string;
    public FileContent: string;
    public CompanyKey: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public UpdatedBy: string;
    public FailedReason: FailedReasonEnum;
    public _createguid: string;
    public CustomFields: any;
}


export class HangfireJob extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'HangfireJob';

    public UpdatedAt: Date;
    public CompanyID: number;
    public Year: number;
    public CompanyKey: string;
    public CreatedAt: Date;
    public ID: number;
    public HasError: boolean;
    public Completed: boolean;
    public JobId: string;
    public GlobalIdentity: string;
    public Status: number;
    public CustomFields: any;
}


export class HangfireJobContext extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'HangfireJobContext';

    public SchemaName: string;
    public UpdatedAt: Date;
    public CompanyID: number;
    public Year: number;
    public CompanyKey: string;
    public CreatedAt: Date;
    public ID: number;
    public HasError: boolean;
    public Completed: boolean;
    public JobId: string;
    public GlobalIdentity: string;
    public Status: number;
    public CustomFields: any;
}


export class HangfireResponse extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'HangfireResponse';

    public ProgressUrl: string;
    public State: string;
    public UpdatedAt: Date;
    public CompanyID: number;
    public Year: number;
    public CompanyKey: string;
    public CreatedAt: Date;
    public ID: number;
    public HasError: boolean;
    public Completed: boolean;
    public JobId: string;
    public GlobalIdentity: string;
    public Status: number;
    public CustomFields: any;
}


export class KpiDefinition extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'KpiDefinition';

    public Interval: string;
    public SourceType: KpiSourceType;
    public Route: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public CompanyID: number;
    public ValueType: KpiValueType;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public IsPerUser: boolean;
    public Application: string;
    public UpdatedBy: string;
    public RefreshModels: string;
    public RoleNames: string;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class KpiValue extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'KpiValue';

    public CreatedBy: string;
    public UpdatedAt: Date;
    public UserIdentity: string;
    public CompanyID: number;
    public Text: string;
    public KpiDefinitionID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public LastUpdated: Date;
    public ID: number;
    public ValueStatus: KpiValueStatus;
    public Total: number;
    public UpdatedBy: string;
    public Counter: number;
    public KpiName: string;
    public _createguid: string;
    public CustomFields: any;
}


export class OutgoingInvoice extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'OutgoingInvoice';

    public CreatedBy: string;
    public Amount: number;
    public UpdatedAt: Date;
    public ExternalReference: string;
    public StatusCode: number;
    public CompanyID: number;
    public RecipientPhoneNumber: string;
    public DueDate: Date;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public InvoiceType: OutgoingInvoiceType;
    public RecipientOrganizationNumber: string;
    public MetaJson: string;
    public UpdatedBy: string;
    public ISPOrganizationNumber: string;
    public InvoiceID: number;
    public Status: number;
    public _createguid: string;
    public Company: Company;
    public CustomFields: any;
}


export class ProcessFileLog extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ProcessFileLog';

    public CreatedBy: string;
    public UpdatedAt: Date;
    public EntityName: string;
    public StatusCode: number;
    public FileType: number;
    public FileName: string;
    public UserIdentity: string;
    public CompanyID: number;
    public FileID: number;
    public CompanyKey: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public CompanyName: string;
    public UpdatedBy: string;
    public EntityCount: number;
    public EntityInstanceID: string;
    public Message: string;
    public _createguid: string;
    public Company: Company;
    public CustomFields: any;
}


export class ServiceAccount extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ServiceAccount';

    public KeyPath: string;
    public Description: string;
    public CreatedBy: string;
    public Thumbprint: string;
    public UpdatedAt: Date;
    public DataSender: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public UpdatedBy: string;
    public NextNumber: number;
    public _createguid: string;
    public CustomFields: any;
}


export class UserVerification extends UniEntity {
    public static RelativeUrl = 'user-verifications';
    public static EntityType = 'UserVerification';

    public CreatedBy: string;
    public UpdatedAt: Date;
    public DisplayName: string;
    public StatusCode: number;
    public UserId: number;
    public CompanyId: number;
    public VerificationCode: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public VerificationDate: Date;
    public ID: number;
    public ExpirationDate: Date;
    public UpdatedBy: string;
    public Email: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Account extends UniEntity {
    public static RelativeUrl = 'accounts';
    public static EntityType = 'Account';

    public Keywords: string;
    public Description: string;
    public SystemAccount: boolean;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public EmployeeID: number;
    public StatusCode: number;
    public AccountGroupID: number;
    public Visible: boolean;
    public DoSynchronize: boolean;
    public SupplierID: number;
    public UseVatDeductionGroupID: number;
    public Active: boolean;
    public AccountSetupID: number;
    public AccountID: number;
    public SaftMappingAccountID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public LockManualPosts: boolean;
    public ID: number;
    public AccountName: string;
    public UsePostPost: boolean;
    public DimensionsID: number;
    public CostAllocationID: number;
    public Locked: boolean;
    public UpdatedBy: string;
    public TopLevelAccountGroupID: number;
    public CurrencyCodeID: number;
    public AccountNumber: number;
    public CustomerID: number;
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

    public CreatedBy: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public AccountID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class AccountGroup extends UniEntity {
    public static RelativeUrl = 'accountgroups';
    public static EntityType = 'AccountGroup';

    public AccountGroupSetID: number;
    public CreatedBy: string;
    public Summable: boolean;
    public UpdatedAt: Date;
    public CompatibleAccountID: number;
    public StatusCode: number;
    public AccountID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public UpdatedBy: string;
    public MainGroupID: number;
    public Name: string;
    public GroupNumber: string;
    public AccountGroupSetupID: number;
    public _createguid: string;
    public MainGroup: AccountGroup;
    public AccountGroupSet: AccountGroupSet;
    public CustomFields: any;
}


export class AccountGroupSet extends UniEntity {
    public static RelativeUrl = 'accountgroupsets';
    public static EntityType = 'AccountGroupSet';

    public CreatedBy: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public FromAccountNumber: number;
    public ToAccountNumber: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public Shared: boolean;
    public ID: number;
    public System: boolean;
    public UpdatedBy: string;
    public SubAccountAllowed: boolean;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class AccountMandatoryDimension extends UniEntity {
    public static RelativeUrl = 'accountmandatorydimension';
    public static EntityType = 'AccountMandatoryDimension';

    public CreatedBy: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public AccountID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public MandatoryType: number;
    public DimensionNo: number;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Accrual extends UniEntity {
    public static RelativeUrl = 'accruals';
    public static EntityType = 'Accrual';

    public ResultAccountID: number;
    public CreatedBy: string;
    public BalanceAccountID: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public AccrualJournalEntryMode: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public JournalEntryLineDraftID: number;
    public AccrualAmount: number;
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
    public Amount: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public PeriodNo: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public AccrualID: number;
    public JournalEntryDraftLineID: number;
    public AccountYear: number;
    public UpdatedBy: string;
    public _createguid: string;
    public Accrual: Accrual;
    public JournalEntryLineDraft: JournalEntryLineDraft;
    public CustomFields: any;
}


export class Asset extends UniEntity {
    public static RelativeUrl = 'assets';
    public static EntityType = 'Asset';

    public CreatedBy: string;
    public PurchaseDate: LocalDate;
    public BalanceAccountID: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public PurchaseAmount: number;
    public Lifetime: number;
    public DepreciationStartDate: LocalDate;
    public AutoDepreciation: boolean;
    public Deleted: boolean;
    public DepreciationCycle: number;
    public CreatedAt: Date;
    public ID: number;
    public DepreciationAccountID: number;
    public NetFinancialValue: number;
    public AssetGroupCode: string;
    public DimensionsID: number;
    public UpdatedBy: string;
    public ScrapValue: number;
    public Name: string;
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

    public Web: string;
    public CreatedBy: string;
    public PhoneID: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public AddressID: number;
    public BIC: string;
    public InitialBIC: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public EmailID: number;
    public UpdatedBy: string;
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

    public CreatedBy: string;
    public CompanySettingsID: number;
    public UpdatedAt: Date;
    public IntegrationStatus: number;
    public StatusCode: number;
    public BankAccountType: string;
    public BankID: number;
    public IBAN: string;
    public IntegrationSettings: string;
    public AccountID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public Locked: boolean;
    public UpdatedBy: string;
    public AccountNumber: string;
    public BusinessRelationID: number;
    public Label: string;
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

    public PropertiesJson: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public DefaultAgreement: boolean;
    public StatusCode: number;
    public BankAccountID: number;
    public IsInbound: boolean;
    public IsBankBalance: boolean;
    public Deleted: boolean;
    public CreatedAt: Date;
    public BankAcceptance: boolean;
    public ID: number;
    public UpdatedBy: string;
    public HasOrderedIntegrationChange: boolean;
    public Email: string;
    public Name: string;
    public ServiceID: string;
    public ServiceProvider: number;
    public IsOutgoing: boolean;
    public ServiceTemplateID: string;
    public HasNewAccountInformation: boolean;
    public Password: string;
    public _createguid: string;
    public BankAccount: BankAccount;
    public CustomFields: any;
}


export class BankRule extends UniEntity {
    public static RelativeUrl = 'bankrules';
    public static EntityType = 'BankRule';

    public CreatedBy: string;
    public UpdatedAt: Date;
    public IsActive: boolean;
    public StatusCode: number;
    public Priority: number;
    public Rule: string;
    public AccountID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public ActionCode: ActionCodeBankRule;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public Account: Account;
    public CustomFields: any;
}


export class BankStatement extends UniEntity {
    public static RelativeUrl = 'bankstatements';
    public static EntityType = 'BankStatement';

    public CreatedBy: string;
    public Amount: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public BankAccountID: number;
    public ToDate: LocalDate;
    public FileID: number;
    public EndBalance: number;
    public AccountID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public AmountCurrency: number;
    public StartBalance: number;
    public UpdatedBy: string;
    public CurrencyCode: string;
    public ArchiveReference: string;
    public FromDate: LocalDate;
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

    public Description: string;
    public InvoiceNumber: string;
    public CreatedBy: string;
    public Amount: number;
    public UpdatedAt: Date;
    public SenderName: string;
    public BookingDate: LocalDate;
    public TransactionId: string;
    public StatusCode: number;
    public CID: string;
    public Category: string;
    public ReceiverAccount: string;
    public SenderAccount: string;
    public BankStatementID: number;
    public OpenAmount: number;
    public ValueDate: LocalDate;
    public Deleted: boolean;
    public CreatedAt: Date;
    public OpenAmountCurrency: number;
    public ID: number;
    public AmountCurrency: number;
    public Receivername: string;
    public UpdatedBy: string;
    public CurrencyCode: string;
    public ArchiveReference: string;
    public StructuredReference: string;
    public _createguid: string;
    public BankStatement: BankStatement;
    public CustomFields: any;
}


export class BankStatementMatch extends UniEntity {
    public static RelativeUrl = 'bankstatementmatch';
    public static EntityType = 'BankStatementMatch';

    public CreatedBy: string;
    public Amount: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public BankStatementEntryID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public Batch: string;
    public UpdatedBy: string;
    public JournalEntryLineID: number;
    public Group: string;
    public _createguid: string;
    public BankStatementEntry: BankStatementEntry;
    public JournalEntryLine: JournalEntryLine;
    public CustomFields: any;
}


export class BankStatementRule extends UniEntity {
    public static RelativeUrl = 'bankstatementrules';
    public static EntityType = 'BankStatementRule';

    public CreatedBy: string;
    public UpdatedAt: Date;
    public IsActive: boolean;
    public StatusCode: number;
    public Priority: number;
    public Rule: string;
    public AccountID: number;
    public EntryText: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public DimensionsID: number;
    public UpdatedBy: string;
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
    public UpdatedAt: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public UpdatedBy: string;
    public Name: string;
    public AccountingYear: number;
    public _createguid: string;
    public Entries: Array<BudgetEntry>;
    public CustomFields: any;
}


export class BudgetEntry extends UniEntity {
    public static RelativeUrl = 'budgetentries';
    public static EntityType = 'BudgetEntry';

    public CreatedBy: string;
    public Amount: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public PeriodNumber: number;
    public AccountID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public DimensionsID: number;
    public UpdatedBy: string;
    public BudgetID: number;
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
    public AssetSaleLossNoVatAccountID: number;
    public UpdatedAt: Date;
    public ReInvoicingTurnoverProductID: number;
    public StatusCode: number;
    public AssetSaleLossVatAccountID: number;
    public ReInvoicingCostsharingProductID: number;
    public AssetWriteoffAccountID: number;
    public AssetSaleProfitBalancingAccountID: number;
    public AssetSaleProfitNoVatAccountID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public AssetSaleLossBalancingAccountID: number;
    public AssetSaleProfitVatAccountID: number;
    public ID: number;
    public ReInvoicingMethod: number;
    public UpdatedBy: string;
    public _createguid: string;
    public ReInvoicingCostsharingProduct: Product;
    public ReInvoicingTurnoverProduct: Product;
    public CustomFields: any;
}


export class CompanyBankAccount extends UniEntity {
    public static RelativeUrl = 'companybankaccounts';
    public static EntityType = 'CompanyBankAccount';

    public CreatedBy: string;
    public UpdatedAt: Date;
    public IsIncomming: boolean;
    public StatusCode: number;
    public BankAccountID: number;
    public AccountID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public IsTax: boolean;
    public IsSalary: boolean;
    public CreditAmount: number;
    public UpdatedBy: string;
    public Name: string;
    public IsOutgoing: boolean;
    public _createguid: string;
    public BankAccount: BankAccount;
    public Account: Account;
    public CustomFields: any;
}


export class CostAllocation extends UniEntity {
    public static RelativeUrl = 'costallocations';
    public static EntityType = 'CostAllocation';

    public CreatedBy: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public Items: Array<CostAllocationItem>;
    public CustomFields: any;
}


export class CostAllocationItem extends UniEntity {
    public static RelativeUrl = 'costallocationitems';
    public static EntityType = 'CostAllocationItem';

    public Description: string;
    public CreatedBy: string;
    public Amount: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public AccountID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public Percent: number;
    public ID: number;
    public DimensionsID: number;
    public CostAllocationID: number;
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

    public Description: string;
    public CreatedBy: string;
    public Amount: number;
    public CustomLiquidityPaymentType: CustomLiquidityPaymentInterval;
    public UpdatedAt: Date;
    public StatusCode: number;
    public EndDate: LocalDate;
    public DueDate: LocalDate;
    public IsCustomerPayment: boolean;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public AmountCurrency: number;
    public UpdatedBy: string;
    public CurrencyCodeID: number;
    public _createguid: string;
    public currency: CurrencyCode;
    public CustomFields: any;
}


export class DepreciationLine extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'DepreciationLine';

    public CreatedBy: string;
    public DepreciationType: number;
    public UpdatedAt: Date;
    public AssetJELineID: number;
    public StatusCode: number;
    public AssetID: number;
    public DepreciationJELineID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public UpdatedBy: string;
    public _createguid: string;
    public DepreciationJELine: JournalEntryLine;
    public AssetJELine: JournalEntryLine;
    public CustomFields: any;
}


export class FinancialYear extends UniEntity {
    public static RelativeUrl = 'financialyears';
    public static EntityType = 'FinancialYear';

    public CreatedBy: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public Year: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ValidFrom: LocalDate;
    public ID: number;
    public UpdatedBy: string;
    public ValidTo: LocalDate;
    public _createguid: string;
    public CustomFields: any;
}


export class JournalEntry extends UniEntity {
    public static RelativeUrl = 'journalentries';
    public static EntityType = 'JournalEntry';

    public Description: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public NumberSeriesTaskID: number;
    public JournalEntryNumber: string;
    public JournalEntryDraftGroup: string;
    public StatusCode: number;
    public NumberSeriesID: number;
    public FinancialYearID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public JournalEntryNumberNumeric: number;
    public UpdatedBy: string;
    public JournalEntryAccrualID: number;
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

    public CustomerInvoiceID: number;
    public Description: string;
    public InvoiceNumber: string;
    public CreatedBy: string;
    public Amount: number;
    public PaymentID: string;
    public TaxBasisAmountCurrency: number;
    public UpdatedAt: Date;
    public JournalEntryNumber: string;
    public SubAccountID: number;
    public VatDeductionPercent: number;
    public VatReportID: number;
    public Signature: string;
    public StatusCode: number;
    public PaymentInfoTypeID: number;
    public CurrencyExchangeRate: number;
    public PostPostJournalEntryLineID: number;
    public CustomerOrderID: number;
    public VatPeriodID: number;
    public OriginalJournalEntryPost: number;
    public BatchNumber: number;
    public JournalEntryID: number;
    public FinancialDate: LocalDate;
    public ReferenceOriginalPostID: number;
    public DueDate: LocalDate;
    public VatJournalEntryPostID: number;
    public AccountID: number;
    public VatPercent: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public TaxBasisAmount: number;
    public AccrualID: number;
    public VatDate: LocalDate;
    public PeriodID: number;
    public JournalEntryLineDraftID: number;
    public JournalEntryNumberNumeric: number;
    public DimensionsID: number;
    public SupplierInvoiceID: number;
    public OriginalReferencePostID: number;
    public AmountCurrency: number;
    public ReferenceCreditPostID: number;
    public UpdatedBy: string;
    public RestAmount: number;
    public CurrencyCodeID: number;
    public RegisteredDate: LocalDate;
    public JournalEntryTypeID: number;
    public RestAmountCurrency: number;
    public VatTypeID: number;
    public PaymentReferenceID: number;
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

    public CustomerInvoiceID: number;
    public Description: string;
    public InvoiceNumber: string;
    public CreatedBy: string;
    public Amount: number;
    public PaymentID: string;
    public TaxBasisAmountCurrency: number;
    public UpdatedAt: Date;
    public JournalEntryNumber: string;
    public SubAccountID: number;
    public VatDeductionPercent: number;
    public Signature: string;
    public StatusCode: number;
    public PaymentInfoTypeID: number;
    public CurrencyExchangeRate: number;
    public PostPostJournalEntryLineID: number;
    public CustomerOrderID: number;
    public VatPeriodID: number;
    public BatchNumber: number;
    public JournalEntryID: number;
    public FinancialDate: LocalDate;
    public DueDate: LocalDate;
    public AccountID: number;
    public VatPercent: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public TaxBasisAmount: number;
    public AccrualID: number;
    public VatDate: LocalDate;
    public PeriodID: number;
    public JournalEntryNumberNumeric: number;
    public DimensionsID: number;
    public SupplierInvoiceID: number;
    public AmountCurrency: number;
    public UpdatedBy: string;
    public CurrencyCodeID: number;
    public RegisteredDate: LocalDate;
    public JournalEntryTypeID: number;
    public VatTypeID: number;
    public PaymentReferenceID: number;
    public VatIsCaluclauted: boolean;
    public _createguid: string;
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
    public UpdatedAt: Date;
    public StatusCode: number;
    public TraceLinkTypes: string;
    public ColumnSetUp: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public VisibleModules: string;
    public ID: number;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class JournalEntrySourceSerie extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'JournalEntrySourceSerie';

    public CreatedBy: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public JournalEntrySourceID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public UpdatedBy: string;
    public JournalEntrySourceEntityName: string;
    public JournalEntrySourceInstanceID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class JournalEntryType extends UniEntity {
    public static RelativeUrl = 'journalentrytypes';
    public static EntityType = 'JournalEntryType';

    public CreatedBy: string;
    public UpdatedAt: Date;
    public DisplayName: string;
    public MainName: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public UpdatedBy: string;
    public ExpectNegativeAmount: boolean;
    public Name: string;
    public Number: number;
    public _createguid: string;
    public CustomFields: any;
}


export class LedgerSuggestion extends UniEntity {
    public IndustryCode: string;
    public Source: SuggestionSource;
    public ID: number;
    public OrgNumber: string;
    public IndustryName: string;
    public BusinessType: string;
    public Name: string;
}


export class Payment extends UniEntity {
    public static RelativeUrl = 'payments';
    public static EntityType = 'Payment';

    public CustomerInvoiceID: number;
    public Description: string;
    public InvoiceNumber: string;
    public CreatedBy: string;
    public Amount: number;
    public AutoJournal: boolean;
    public PaymentID: string;
    public BankChargeAmount: number;
    public UpdatedAt: Date;
    public SerialNumberOrAcctSvcrRef: string;
    public OcrPaymentStrings: string;
    public PaymentStatusReportFileID: number;
    public IsExternal: boolean;
    public StatusCode: number;
    public CurrencyExchangeRate: number;
    public InPaymentID: string;
    public ExternalBankAccountNumber: string;
    public XmlTagEndToEndIdReference: string;
    public Proprietary: string;
    public Domain: string;
    public ReconcilePayment: boolean;
    public JournalEntryID: number;
    public XmlTagPmtInfIdReference: string;
    public PaymentBatchID: number;
    public DueDate: LocalDate;
    public IsCustomerPayment: boolean;
    public PaymentDate: LocalDate;
    public Deleted: boolean;
    public CreatedAt: Date;
    public IsPaymentCancellationRequest: boolean;
    public ID: number;
    public PaymentCodeID: number;
    public CustomerInvoiceReminderID: number;
    public SupplierInvoiceID: number;
    public AmountCurrency: number;
    public StatusText: string;
    public ToBankAccountID: number;
    public UpdatedBy: string;
    public IsPaymentClaim: boolean;
    public CurrencyCodeID: number;
    public FromBankAccountID: number;
    public BusinessRelationID: number;
    public Debtor: string;
    public PaymentNotificationReportFileID: number;
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

    public OcrHeadingStrings: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public PaymentStatusReportFileID: number;
    public StatusCode: number;
    public ReceiptDate: Date;
    public OcrTransmissionNumber: number;
    public Camt054CMsgId: string;
    public IsCustomerPayment: boolean;
    public Deleted: boolean;
    public CreatedAt: Date;
    public PaymentFileID: number;
    public ID: number;
    public PaymentBatchTypeID: number;
    public TotalAmount: number;
    public UpdatedBy: string;
    public NumberOfPayments: number;
    public PaymentReferenceID: string;
    public TransferredDate: Date;
    public _createguid: string;
    public Payments: Array<Payment>;
    public PaymentBatchType: PaymentBatchType;
    public CustomFields: any;
}


export class PostPost extends UniEntity {
    public static RelativeUrl = 'postposts';
    public static EntityType = 'PostPost';

    public CreatedBy: string;
    public Amount: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CurrencyExchangeRate: number;
    public JournalEntryLine1ID: number;
    public Date: LocalDate;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public AmountCurrency: number;
    public UpdatedBy: string;
    public CurrencyCodeID: number;
    public JournalEntryLine2ID: number;
    public _createguid: string;
    public JournalEntryLine1: JournalEntryLine;
    public JournalEntryLine2: JournalEntryLine;
    public CurrencyCode: CurrencyCode;
    public CustomFields: any;
}


export class ReInvoice extends UniEntity {
    public static RelativeUrl = 'reinvoicing';
    public static EntityType = 'ReInvoice';

    public OwnCostAmount: number;
    public ProductID: number;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public TaxExclusiveAmount: number;
    public ID: number;
    public TaxInclusiveAmount: number;
    public SupplierInvoiceID: number;
    public ReInvoicingType: number;
    public OwnCostShare: number;
    public UpdatedBy: string;
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
    public UpdatedAt: Date;
    public Share: number;
    public Vat: number;
    public StatusCode: number;
    public ReInvoiceID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public Surcharge: number;
    public ID: number;
    public NetAmount: number;
    public UpdatedBy: string;
    public CustomerID: number;
    public _createguid: string;
    public Customer: Customer;
    public CustomFields: any;
}


export class SupplierInvoice extends UniEntity {
    public static RelativeUrl = 'supplierinvoices';
    public static EntityType = 'SupplierInvoice';

    public CreditedAmountCurrency: number;
    public DeliveryTermsID: number;
    public InvoiceNumber: string;
    public CreatedBy: string;
    public PaymentStatus: number;
    public InvoiceOriginType: SupplierInvoiceOriginType;
    public IsSentToPayment: boolean;
    public PaymentID: string;
    public Requisition: string;
    public CustomerPerson: string;
    public PayableRoundingCurrencyAmount: number;
    public UpdatedAt: Date;
    public InvoiceDate: LocalDate;
    public ShippingCountry: string;
    public StatusCode: number;
    public ShippingAddressLine3: string;
    public CurrencyExchangeRate: number;
    public InvoiceCountryCode: string;
    public ShippingCountryCode: string;
    public ProjectID: number;
    public ReInvoiceID: number;
    public CreditedAmount: number;
    public TaxInclusiveAmountCurrency: number;
    public Credited: boolean;
    public Payment: string;
    public BankAccountID: number;
    public DeliveryMethod: string;
    public DeliveryName: string;
    public InvoiceCity: string;
    public PaymentTerm: string;
    public InvoiceAddressLine2: string;
    public DefaultDimensionsID: number;
    public ShippingAddressLine2: string;
    public JournalEntryID: number;
    public SupplierID: number;
    public InvoicePostalCode: string;
    public SalesPerson: string;
    public OurReference: string;
    public InvoiceAddressLine1: string;
    public TaxExclusiveAmountCurrency: number;
    public Comment: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ShippingAddressLine1: string;
    public ShippingPostalCode: string;
    public VatTotalsAmount: number;
    public InvoiceReceiverName: string;
    public TaxExclusiveAmount: number;
    public FreeTxt: string;
    public ID: number;
    public VatTotalsAmountCurrency: number;
    public AmountRegards: string;
    public CreditDays: number;
    public ReInvoiced: boolean;
    public InvoiceType: number;
    public PaymentDueDate: LocalDate;
    public PaymentTermsID: number;
    public TaxInclusiveAmount: number;
    public PrintStatus: number;
    public InvoiceCountry: string;
    public YourReference: string;
    public SupplierOrgNumber: string;
    public UpdatedBy: string;
    public RestAmount: number;
    public CurrencyCodeID: number;
    public PaymentInformation: string;
    public DeliveryTerm: string;
    public ShippingCity: string;
    public DeliveryDate: LocalDate;
    public RestAmountCurrency: number;
    public PayableRoundingAmount: number;
    public CustomerOrgNumber: string;
    public InvoiceReferenceID: number;
    public InvoiceAddressLine3: string;
    public InternalNote: string;
    public _createguid: string;
    public ReInvoice: ReInvoice;
    public Payments: Array<Payment>;
    public BankAccount: BankAccount;
    public JournalEntry: JournalEntry;
    public DefaultDimensions: Dimensions;
    public Supplier: Supplier;
    public CurrencyCode: CurrencyCode;
    public Items: Array<SupplierInvoiceItem>;
    public InvoiceReference: SupplierInvoice;
    public CustomFields: any;
}


export class SupplierInvoiceItem extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'SupplierInvoiceItem';

    public ProductID: number;
    public CalculateGrossPriceBasedOnNetPrice: boolean;
    public CreatedBy: string;
    public NumberOfItems: number;
    public PriceIncVat: number;
    public UpdatedAt: Date;
    public DiscountCurrency: number;
    public StatusCode: number;
    public CurrencyExchangeRate: number;
    public InvoicePeriodStartDate: LocalDate;
    public AccountingCost: string;
    public SumTotalIncVatCurrency: number;
    public PriceExVatCurrency: number;
    public ItemText: string;
    public PriceExVat: number;
    public SumTotalExVatCurrency: number;
    public SortIndex: number;
    public InvoicePeriodEndDate: LocalDate;
    public Comment: string;
    public VatPercent: number;
    public Unit: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public SumTotalIncVat: number;
    public ID: number;
    public PriceSetByUser: boolean;
    public DiscountPercent: number;
    public SumVat: number;
    public DimensionsID: number;
    public SupplierInvoiceID: number;
    public SumTotalExVat: number;
    public UpdatedBy: string;
    public CurrencyCodeID: number;
    public SumVatCurrency: number;
    public VatTypeID: number;
    public Discount: number;
    public VatDate: LocalDate;
    public _createguid: string;
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
    public UpdatedAt: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public No: string;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class VatDeduction extends UniEntity {
    public static RelativeUrl = 'vatdeductions';
    public static EntityType = 'VatDeduction';

    public CreatedBy: string;
    public VatDeductionGroupID: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public DeductionPercent: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ValidFrom: LocalDate;
    public ID: number;
    public UpdatedBy: string;
    public ValidTo: LocalDate;
    public _createguid: string;
    public VatDeductionGroup: VatDeductionGroup;
    public CustomFields: any;
}


export class VatDeductionGroup extends UniEntity {
    public static RelativeUrl = 'vatdeductiongroups';
    public static EntityType = 'VatDeductionGroup';

    public CreatedBy: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class VatPost extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'VatPost';

    public CreatedBy: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public HasTaxAmount: boolean;
    public ReportAsNegativeAmount: boolean;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public VatCodeGroupID: number;
    public No: string;
    public UpdatedBy: string;
    public Name: string;
    public HasTaxBasis: boolean;
    public _createguid: string;
    public VatReportReferences: Array<VatReportReference>;
    public VatCodeGroup: VatCodeGroup;
    public CustomFields: any;
}


export class VatReport extends UniEntity {
    public static RelativeUrl = 'vatreports';
    public static EntityType = 'VatReport';

    public CreatedBy: string;
    public ExternalRefNo: string;
    public ExecutedDate: Date;
    public UpdatedAt: Date;
    public Title: string;
    public InternalComment: string;
    public VatReportTypeID: number;
    public StatusCode: number;
    public JournalEntryID: number;
    public Comment: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public TerminPeriodID: number;
    public ID: number;
    public VatReportArchivedSummaryID: number;
    public ReportedDate: Date;
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

    public PaymentToDescription: string;
    public CreatedBy: string;
    public PaymentID: string;
    public UpdatedAt: Date;
    public PaymentPeriod: string;
    public SummaryHeader: string;
    public StatusCode: number;
    public AmountToBeReceived: number;
    public AmountToBePayed: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public PaymentYear: number;
    public PaymentDueDate: Date;
    public UpdatedBy: string;
    public ReportName: string;
    public PaymentBankAccountNumber: string;
    public _createguid: string;
    public CustomFields: any;
}


export class VatReportReference extends UniEntity {
    public static RelativeUrl = 'vatreportreferences';
    public static EntityType = 'VatReportReference';

    public CreatedBy: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public AccountID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public VatPostID: number;
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
    public UpdatedAt: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class VatType extends UniEntity {
    public static RelativeUrl = 'vattypes';
    public static EntityType = 'VatType';

    public VatCode: string;
    public IncomingAccountID: number;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public VatCodeGroupingValue: VatCodeGroupingValueEnum;
    public OutgoingAccountID: number;
    public StatusCode: number;
    public Alias: string;
    public InUse: boolean;
    public AvailableInModules: boolean;
    public Visible: boolean;
    public DirectJournalEntryOnly: boolean;
    public VatTypeSetupID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public OutputVat: boolean;
    public VatCodeGroupID: number;
    public Locked: boolean;
    public ReversedTaxDutyVat: boolean;
    public UpdatedBy: string;
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
    public UpdatedAt: Date;
    public StatusCode: number;
    public VatPercent: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ValidFrom: LocalDate;
    public ID: number;
    public UpdatedBy: string;
    public VatTypeID: number;
    public ValidTo: LocalDate;
    public _createguid: string;
    public CustomFields: any;
}


export class EntityValidationRule extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'EntityValidationRule';

    public PropertyName: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Operation: OperationType;
    public Level: ValidationLevel;
    public OnConflict: OnConflict;
    public Operator: Operator;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public System: boolean;
    public EntityType: string;
    public SyncKey: string;
    public ChangedByCompany: boolean;
    public UpdatedBy: string;
    public Value: string;
    public Message: string;
    public _createguid: string;
    public CustomFields: any;
}


export class EntityValidationRuleTemplate extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'EntityValidationRuleTemplate';

    public PropertyName: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Operation: OperationType;
    public Level: ValidationLevel;
    public OnConflict: OnConflict;
    public Operator: Operator;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public System: boolean;
    public EntityType: string;
    public SyncKey: string;
    public ChangedByCompany: boolean;
    public UpdatedBy: string;
    public Value: string;
    public Message: string;
    public _createguid: string;
    public CustomFields: any;
}


export class ComplexValidationRule extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ComplexValidationRule';

    public CreatedBy: string;
    public UpdatedAt: Date;
    public Operation: OperationType;
    public ValidationCode: number;
    public Level: ValidationLevel;
    public OnConflict: OnConflict;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public System: boolean;
    public EntityType: string;
    public SyncKey: string;
    public ChangedByCompany: boolean;
    public UpdatedBy: string;
    public Message: string;
    public _createguid: string;
    public CustomFields: any;
}


export class ComplexValidationRuleTemplate extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ComplexValidationRuleTemplate';

    public CreatedBy: string;
    public UpdatedAt: Date;
    public Operation: OperationType;
    public ValidationCode: number;
    public Level: ValidationLevel;
    public OnConflict: OnConflict;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public System: boolean;
    public EntityType: string;
    public SyncKey: string;
    public ChangedByCompany: boolean;
    public UpdatedBy: string;
    public Message: string;
    public _createguid: string;
    public CustomFields: any;
}


export class CustomField extends UniEntity {
    public static RelativeUrl = 'custom-fields';
    public static EntityType = 'CustomField';

    public CreatedBy: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public DataType: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public ModelID: number;
    public UpdatedBy: string;
    public Name: string;
    public Nullable: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class ValueList extends UniEntity {
    public static RelativeUrl = 'valuelists';
    public static EntityType = 'ValueList';

    public Description: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Code: string;
    public Deleted: boolean;
    public CreatedAt: Date;
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

    public Description: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Index: number;
    public Code: string;
    public ValueListID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public UpdatedBy: string;
    public Value: string;
    public Name: string;
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

    public Description: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public DisplayField: string;
    public Combo: number;
    public StatusCode: number;
    public ReadOnly: boolean;
    public Sectionheader: string;
    public LookupField: boolean;
    public FieldSet: number;
    public FieldType: FieldType;
    public ComponentLayoutID: number;
    public Placement: number;
    public Deleted: boolean;
    public ValueList: string;
    public CreatedAt: Date;
    public LineBreak: boolean;
    public Url: string;
    public Legend: string;
    public ID: number;
    public EntityType: string;
    public Placeholder: string;
    public LookupEntityType: string;
    public Section: number;
    public UpdatedBy: string;
    public Property: string;
    public Width: string;
    public Options: string;
    public Hidden: boolean;
    public Label: string;
    public Alignment: Alignment;
    public HelpText: string;
    public _createguid: string;
    public Validations: Array<EntityValidationRule>;
    public CustomFields: any;
}


export class AssignmentDetails extends UniEntity {
    public Message: string;
}


export class TimeSheet extends UniEntity {
    public Workflow: TimesheetWorkflow;
    public ToDate: Date;
    public FromDate: Date;
    public Relation: WorkRelation;
    public Items: Array<TimeSheetItem>;
}


export class TimeSheetItem extends UniEntity {
    public TotalTime: number;
    public Workflow: TimesheetWorkflow;
    public Projecttime: number;
    public SickTime: number;
    public ValidTime: number;
    public IsWeekend: boolean;
    public WeekNumber: number;
    public Date: Date;
    public Overtime: number;
    public ExpectedTime: number;
    public Flextime: number;
    public WeekDay: number;
    public TimeOff: number;
    public StartTime: Date;
    public Invoicable: number;
    public ValidTimeOff: number;
    public EndTime: Date;
    public Status: WorkStatus;
}


export class WorkBalanceDto extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'WorkBalanceDto';

    public Description: string;
    public WorkRelationID: number;
    public CreatedBy: string;
    public LastDayExpected: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public LastDayActual: number;
    public IsStartBalance: boolean;
    public ExpectedMinutes: number;
    public Balancetype: WorkBalanceTypeEnum;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ValidFrom: Date;
    public ID: number;
    public Minutes: number;
    public ActualMinutes: number;
    public UpdatedBy: string;
    public Days: number;
    public SumOvertime: number;
    public BalanceDate: Date;
    public BalanceFrom: Date;
    public ValidTimeOff: number;
    public _createguid: string;
    public Previous: BalanceInfo;
    public Details: Array<FlexDetail>;
    public WorkRelation: WorkRelation;
    public CustomFields: any;
}


export class BalanceInfo extends UniEntity {
    public Description: string;
    public ID: number;
    public Minutes: number;
    public BalanceDate: Date;
}


export class FlexDetail extends UniEntity {
    public IsWeekend: boolean;
    public ExpectedMinutes: number;
    public Date: Date;
    public WorkedMinutes: number;
    public ValidTimeOff: number;
}


export class ContactSearchServiceResponse extends UniEntity {
    public ErrorMessage: string;
    public ErrorCode: number;
    public ObjectName: string;
    public Method: string;
    public Success: boolean;
}


export class InvoicesAndRemindersReadyToRemind extends UniEntity {
    public CustomerInvoiceID: number;
    public DontSendReminders: boolean;
    public InvoiceNumber: number;
    public InvoiceDate: Date;
    public ReminderNumber: number;
    public ExternalReference: string;
    public StatusCode: number;
    public CurrencyExchangeRate: number;
    public TaxInclusiveAmountCurrency: number;
    public CurrencyCodeCode: string;
    public EmailAddress: string;
    public DueDate: Date;
    public CustomerName: string;
    public Interest: number;
    public CustomerInvoiceReminderID: number;
    public CurrencyCodeShortCode: string;
    public TaxInclusiveAmount: number;
    public Fee: number;
    public RestAmount: number;
    public CurrencyCodeID: number;
    public CustomerID: number;
    public CustomerNumber: number;
    public RestAmountCurrency: number;
}


export class TradeHeaderCalculationSummary extends UniEntity {
    public SumNoVatBasis: number;
    public SumDiscountCurrency: number;
    public SumTotalIncVatCurrency: number;
    public SumDiscount: number;
    public SumVatBasisCurrency: number;
    public SumTotalExVatCurrency: number;
    public SumTotalIncVat: number;
    public SumNoVatBasisCurrency: number;
    public DecimalRounding: number;
    public SumVat: number;
    public DecimalRoundingCurrency: number;
    public SumTotalExVat: number;
    public SumVatCurrency: number;
    public SumVatBasis: number;
}


export class VatCalculationSummary extends UniEntity {
    public SumVatBasisCurrency: number;
    public VatPercent: number;
    public SumVat: number;
    public SumVatCurrency: number;
    public SumVatBasis: number;
}


export class InvoicePaymentData extends UniEntity {
    public Amount: number;
    public PaymentID: string;
    public BankChargeAmount: number;
    public AgioAmount: number;
    public CurrencyExchangeRate: number;
    public AgioAccountID: number;
    public AccountID: number;
    public PaymentDate: LocalDate;
    public BankChargeAccountID: number;
    public DimensionsID: number;
    public AmountCurrency: number;
    public CurrencyCodeID: number;
    public FromBankAccountID: number;
}


export class InvoiceSummary extends UniEntity {
    public SumRestAmount: number;
    public SumCreditedAmount: number;
    public SumTotalAmount: number;
}


export class CustomerNoAndName extends UniEntity {
    public Name: string;
    public Number: string;
}


export class OrderOffer extends UniEntity {
    public OrderId: string;
    public CostPercentage: number;
    public Status: string;
    public Message: string;
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
    public ReasonCode: string;
    public ReasonDescription: string;
    public ReasonHelpLink: string;
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
    public EmploymentTax: number;
    public KIDTaxDraw: string;
    public KIDEmploymentTax: string;
    public FinancialTax: number;
    public KIDGarnishment: string;
    public MessageID: string;
    public TaxDraw: number;
    public DueDate: Date;
    public period: number;
    public GarnishmentTax: number;
    public AccountNumber: string;
    public KIDFinancialTax: string;
}


export class PayrollRunInAmeldingPeriod extends UniEntity {
    public AmeldingSentdate: Date;
    public PayrollrunID: number;
    public CanGenerateAddition: boolean;
    public PayrollrunDescription: string;
    public PayrollrunPaydate: Date;
}


export class PayAgaTaxDTO extends UniEntity {
    public payGarnishment: boolean;
    public payTaxDraw: boolean;
    public payDate: Date;
    public payAga: boolean;
    public payFinancialTax: boolean;
    public correctPennyDiff: boolean;
}


export class AmeldingSumUp extends UniEntity {
    public LegalEntityNo: string;
    public year: number;
    public sent: Date;
    public period: number;
    public altInnStatus: string;
    public ID: number;
    public ReplacesAMeldingID: number;
    public type: AmeldingType;
    public meldingsID: string;
    public generated: Date;
    public Replaces: string;
    public status: AmeldingStatus;
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
    public endDate: Date;
    public startDate: Date;
    public arbeidsforholdId: string;
    public permisjon: Array<EmploymentLeaves>;
}


export class EmploymentLeaves extends UniEntity {
    public permisjonsprosent: string;
    public beskrivelse: string;
    public permisjonsId: string;
    public sluttdato: Date;
    public startdato: Date;
}


export class TransactionTypes extends UniEntity {
    public description: string;
    public amount: number;
    public incomeType: string;
    public tax: boolean;
    public Base_EmploymentTax: boolean;
    public benefit: string;
}


export class AGADetails extends UniEntity {
    public sectorName: string;
    public rate: number;
    public baseAmount: number;
    public zoneName: string;
    public type: string;
}


export class Totals extends UniEntity {
    public sumTax: number;
    public sumAGA: number;
    public sumUtleggstrekk: number;
}


export class AnnualStatement extends UniEntity {
    public EmployeeName: string;
    public EmployeeMunicipalName: string;
    public EmployerCity: string;
    public EmployerName: string;
    public VacationPayBase: number;
    public EmployeeCity: string;
    public EmployerPostCode: string;
    public EmployeePostCode: string;
    public Year: number;
    public EmployerTaxMandatory: boolean;
    public EmployerPhoneNumber: string;
    public EmployeeNumber: number;
    public EmployerWebAddress: string;
    public EmployeeAddress: string;
    public EmployerCountry: string;
    public EmployerOrgNr: string;
    public EmployeeSSn: string;
    public EmployerEmail: string;
    public EmployeeMunicipalNumber: string;
    public EmployerAddress: string;
    public EmployerCountryCode: string;
    public Contributions: Array<AnnualStatementLine>;
    public PensionOrBenefits: Array<AnnualStatementLine>;
    public Deductions: Array<AnnualStatementLine>;
    public Draws: Array<AnnualStatementLine>;
}


export class AnnualStatementLine extends UniEntity {
    public Description: string;
    public Amount: number;
    public IsDeduction: boolean;
    public Sum: number;
    public SupplementPackageName: string;
    public LineIndex: number;
    public TaxReturnPost: string;
    public Supplements: Array<SupplementInfo>;
}


export class SupplementInfo extends UniEntity {
    public WageTypeSupplementID: number;
    public ValueMoney: number;
    public ValueDate2: Date;
    public ValueType: Valuetype;
    public ValueBool: boolean;
    public ValueString: string;
    public ValueDate: Date;
    public Name: string;
}


export class AnnualStatementReportSetup extends UniEntity {
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
    public IsJob: boolean;
    public Title: string;
    public Text: string;
    public employeestatus: Array<EmployeeStatus>;
}


export class EmployeeStatus extends UniEntity {
    public employeeID: number;
    public info: string;
    public year: number;
    public employeeNumber: number;
    public ssn: string;
    public status: string;
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
    public employeeID: number;
    public netPayment: number;
    public tax: number;
}


export class SumOnYear extends UniEntity {
    public sumTax: number;
    public usedNonTaxableAmount: number;
    public employeeID: number;
    public grossPayment: number;
    public baseVacation: number;
    public netPayment: number;
    public pension: number;
    public paidHolidaypay: number;
    public taxBase: number;
    public advancePayment: number;
    public nonTaxableAmount: number;
}


export class VacationPayLastYear extends UniEntity {
    public employeeID: number;
    public baseVacation: number;
    public paidHolidayPay: number;
}


export class SalaryTransactionPay extends UniEntity {
    public TaxBankAccountID: number;
    public CompanyBankAccountID: number;
    public CompanyPostalCode: string;
    public Withholding: number;
    public CompanyAddress: string;
    public CompanyCity: string;
    public PaymentDate: Date;
    public SalaryBankAccountID: number;
    public CompanyName: string;
    public PayList: Array<SalaryTransactionPayLine>;
    public SalaryBalancePayList: Array<SalaryBalancePayLine>;
}


export class SalaryTransactionPayLine extends UniEntity {
    public EmployeeName: string;
    public NetPayment: number;
    public EmployeeNumber: number;
    public Tax: number;
    public City: string;
    public Address: string;
    public Account: string;
    public PostalCode: string;
}


export class SalaryBalancePayLine extends UniEntity {
    public Text: string;
    public Sum: number;
    public Account: string;
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
    public GroupByWageType: boolean;
    public Subject: string;
    public ReportID: number;
    public Message: string;
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
    public Year: number;
    public BookedPayruns: number;
    public ToPeriod: number;
    public CalculatedPayruns: number;
    public CreatedPayruns: number;
    public Groups: Array<ReconciliationGroup>;
}


export class ReconciliationGroup extends UniEntity {
    public Sum: number;
    public AccountNumber: string;
    public Lines: Array<ReconciliationLine>;
}


export class ReconciliationLine extends UniEntity {
    public Description: string;
    public IncomeType: string;
    public HasEmploymentTax: boolean;
    public Sum: number;
    public WageTypeNumber: number;
    public Benefit: string;
    public WageTypeName: string;
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
    public Ensurance: number;
    public OUO: number;
    public MemberNumber: string;
    public UnionDraw: number;
    public Name: string;
}


export class SalaryTransactionSums extends UniEntity {
    public baseTableTax: number;
    public grossPayment: number;
    public calculatedAGA: number;
    public baseVacation: number;
    public Employee: number;
    public netPayment: number;
    public manualTax: number;
    public baseAGA: number;
    public Payrun: number;
    public calculatedFinancialTax: number;
    public percentTax: number;
    public paidPension: number;
    public tableTax: number;
    public calculatedVacationPay: number;
    public basePercentTax: number;
    public paidAdvance: number;
}


export class SalaryTransactionPeriodSums extends UniEntity {
    public FromPeriod: number;
    public AgaRate: number;
    public Year: number;
    public MunicipalName: string;
    public ToPeriod: number;
    public OrgNumber: string;
    public AgaZone: string;
    public Sums: SalaryTransactionSums;
    public Aga: AGACalculation;
}


export class code extends UniEntity {
    public inngaarIGrunnlagForTrekk: string;
    public skatteOgAvgiftregel: string;
    public fordel: string;
    public postnr: string;
    public gyldigtil: string;
    public utloeserArbeidsgiveravgift: string;
    public kunfranav: string;
    public gmlcode: string;
    public uninavn: string;
    public gyldigfom: string;
    public loennsinntekt: Loennsinntekt;
    public ytelseFraOffentlige: YtelseFraOffentlige;
    public pensjonEllerTrygd: PensjonEllerTrygd;
    public naeringsinntekt: Naeringsinntekt;
    public fradrag: Fradrag;
    public forskuddstrekk: Forskuddstrekk;
    public utleggstrekk: Utleggstrekk;
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


export class Utleggstrekk extends UniEntity {
}


export class IActionResult extends UniEntity {
}


export class CreateCompanyDetails extends UniEntity {
    public CopyFiles: boolean;
    public ContractID: number;
    public IsTemplate: boolean;
    public TemplateCompanyKey: string;
    public ProductNames: string;
    public IsTest: boolean;
    public CompanyName: string;
    public ContractType: number;
    public LicenseKey: string;
    public CompanySettings: CompanySettings;
}


export class UserDto extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'UserDto';

    public CreatedBy: string;
    public UpdatedAt: Date;
    public UserName: string;
    public DisplayName: string;
    public LastLogin: Date;
    public StatusCode: number;
    public PermissionHandling: string;
    public BankIntegrationUserName: string;
    public HasAgreedToImportDisclaimer: boolean;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public PhoneNumber: string;
    public Protected: boolean;
    public UpdatedBy: string;
    public IsAutobankAdmin: boolean;
    public GlobalIdentity: string;
    public Email: string;
    public TwoFactorEnabled: boolean;
    public EndDate: Date;
    public AuthPhoneNumber: string;
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
    public AgreementId: number;
    public CanAgreeToLicense: boolean;
    public HasAgreedToLicense: boolean;
}


export class UserLicenseType extends UniEntity {
    public TypeName: string;
    public EndDate: Date;
    public TypeID: number;
}


export class CompanyLicenseInfomation extends UniEntity {
    public StatusCode: LicenseEntityStatus;
    public Key: string;
    public ContractID: number;
    public EndDate: Date;
    public ID: number;
    public ContactEmail: string;
    public ContactPerson: string;
    public Name: string;
    public Agency: Agency;
}


export class Agency extends UniEntity {
    public CompanyKey: string;
    public Name: string;
}


export class ContractLicenseType extends UniEntity {
    public TypeName: string;
    public TrialExpiration: Date;
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
    public IsAdmin: boolean;
    public Phone: string;
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
    public ValidFrom: Date;
    public ValidTo: Date;
    public Status: ChallengeRequestResult;
    public Message: string;
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
    public FromPeriod: Maaned;
    public Year: number;
    public IncludeEmployments: boolean;
    public ToPeriod: Maaned;
    public IncludeIncome: boolean;
    public ReportType: ReportType;
    public IncludeInfoPerPerson: boolean;
}


export class A07Response extends UniEntity {
    public Data: string;
    public mainStatus: string;
    public Title: string;
    public DataType: string;
    public Text: string;
    public DataName: string;
}


export class SelfEmployed extends UniEntity {
    public year: number;
    public items: Array<SelfEmployedItem>;
}


export class SelfEmployedItem extends UniEntity {
    public amount: number;
    public supplierID: number;
    public name: string;
    public number: string;
}


export class SetIntegrationDataDto extends UniEntity {
    public ExternalId: string;
    public IntegrationKey: string;
}


export class CurrencyRateData extends UniEntity {
    public IsOverrideRate: boolean;
    public Factor: number;
    public ExchangeRate: number;
    public FromCurrencyCode: CurrencyCode;
}


export class EmailDTO extends UniEntity {
    public Format: string;
    public CopyAddress: string;
    public FromAddress: string;
    public Subject: string;
    public ReportID: number;
    public Message: string;
    public Parameters: Array<ReportParameter>;
}


export class ReportParameter extends UniEntity {
    public Value: string;
    public Name: string;
}


export class SendEmail extends UniEntity {
    public CopyAddress: string;
    public ExternalReference: string;
    public FromAddress: string;
    public Subject: string;
    public Localization: string;
    public EntityType: string;
    public ReportID: number;
    public EntityID: number;
    public ReportName: string;
    public Message: string;
    public Attachments: Array<SendEmailAttachment>;
    public Parameters: Array<ReportParameter>;
}


export class SendEmailAttachment extends UniEntity {
    public Attachment: string;
    public FileName: string;
    public FileID: number;
}


export class RssList extends UniEntity {
    public Description: string;
    public Title: string;
    public Url: string;
    public Items: Array<RssItem>;
}


export class RssItem extends UniEntity {
    public Description: string;
    public Title: string;
    public PubDate: string;
    public Category: string;
    public Link: string;
    public Guid: string;
    public Enclosure: Enclosure;
}


export class Enclosure extends UniEntity {
    public Url: string;
    public Length: string;
    public Type: string;
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
    public MinutesWorked: number;
    public ReportBalance: number;
    public ExpectedMinutes: number;
    public TotalBalance: number;
    public Name: string;
    public WorkRelation: WorkRelation;
    public TimeOff: Array<FlexDetail>;
    public MissingDays: Array<FlexDetail>;
}


export class TeamPositionDto extends UniEntity {
    public Position: TeamPositionEnum;
    public PositionName: string;
}


export class EHFCustomer extends UniEntity {
    public orgno: string;
    public contactname: string;
    public orgname: string;
    public contactemail: string;
    public contactphone: string;
}


export class ServiceMetadataDto extends UniEntity {
    public SupportEmail: string;
    public ServiceName: string;
}


export class AccountUsageReference extends UniEntity {
    public Info: string;
    public Entity: string;
    public EntityID: number;
}


export class MandatoryDimensionAccountReport extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'MandatoryDimensionAccountReport';

    public CreatedBy: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public MissingOnlyWarningsDimensionsMessage: string;
    public AccountID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ID: number;
    public journalEntryLineDraftID: number;
    public DimensionsID: number;
    public UpdatedBy: string;
    public AccountNumber: string;
    public MissingRequiredDimensionsMessage: string;
    public _createguid: string;
    public CustomFields: any;
}


export class AccountDimension extends UniEntity {
    public AccountID: number;
    public DimensionsID: number;
    public AccountNumber: number;
    public Dimensions: Dimensions;
}


export class AssetReportDTO extends UniEntity {
    public GroupName: string;
    public CurrentValue: number;
    public Lifetime: number;
    public GroupCode: string;
    public LastDepreciation: LocalDate;
    public BalanceAccountName: string;
    public BalanceAccountNumber: number;
    public Name: string;
    public DepreciationAccountNumber: number;
    public Number: number;
    public Lines: Array<AssetReportLineDTO>;
}


export class AssetReportLineDTO extends UniEntity {
    public Date: LocalDate;
    public Value: number;
    public TypeID: number;
    public Type: string;
}


export class BankData extends UniEntity {
    public IBAN: string;
    public AccountNumber: string;
    public Bank: Bank;
}


export class CreateBankIntegrationDTO extends UniEntity {
    public TuserName: string;
    public UserName: string;
    public DisplayName: string;
    public Bank: string;
    public BankApproval: boolean;
    public IsBankStatement: boolean;
    public BankAccountID: number;
    public Password: string;
    public IsInbound: boolean;
    public IsBankBalance: boolean;
    public BankAcceptance: boolean;
    public RequireTwoStage: boolean;
    public Phone: string;
    public Email: string;
    public ServiceProvider: number;
    public IsOutgoing: boolean;
    public BankAccounts: Array<BankAccountDTO>;
}


export class BankAccountDTO extends UniEntity {
    public IsBankStatement: boolean;
    public Bic: string;
    public IBAN: string;
    public IsInbound: boolean;
    public IsBankBalance: boolean;
    public BBAN: string;
    public IsOutgoing: boolean;
}


export class ZdataUpdateBankProperties extends UniEntity {
    public IsBankStatement: boolean;
    public Password: string;
    public IsInbound: boolean;
    public IsBankBalance: boolean;
    public ServiceID: string;
    public IsOutgoing: boolean;
}


export class AutobankUserDTO extends UniEntity {
    public UserID: number;
    public Password: string;
    public IsAdmin: boolean;
    public Phone: string;
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
    public Amount: number;
    public BankStatementEntryID: number;
    public JournalEntryLineID: number;
    public Group: string;
}


export class MatchRequest extends UniEntity {
    public JournalEntries: Array<MatchCandidate>;
    public BankEntries: Array<MatchCandidate>;
    public Settings: MatchSettings;
}


export class MatchCandidate extends UniEntity {
    public Amount: number;
    public IsBankEntry: boolean;
    public Date: Date;
    public Closed: boolean;
    public ID: number;
}


export class MatchSettings extends UniEntity {
    public MaxDelta: number;
    public MaxDayOffset: number;
}


export class ReconciliationStatus extends UniEntity {
    public NumberOfItems: number;
    public IsReconciled: boolean;
    public TotalUnreconciled: number;
    public Todate: Date;
    public AccountID: number;
    public TotalAmount: number;
    public NumberOfUnReconciled: number;
    public FromDate: Date;
}


export class BalanceDto extends UniEntity {
    public EndDate: Date;
    public StartDate: Date;
    public Balance: number;
    public BalanceInStatement: number;
}


export class BankfileFormat extends UniEntity {
    public IsFixed: boolean;
    public LinePrefix: string;
    public SkipRows: number;
    public Separator: string;
    public CustomFormat: BankFileCustomFormat;
    public IsXml: boolean;
    public FileExtension: string;
    public Name: string;
    public Columns: Array<BankfileColumn>;
}


export class BankfileColumn extends UniEntity {
    public DataType: BankfileDataType;
    public FieldMapping: BankfileField;
    public IsFallBack: boolean;
    public Length: number;
    public StartPos: number;
}


export class JournalSuggestion extends UniEntity {
    public Description: string;
    public Amount: number;
    public FinancialDate: LocalDate;
    public AccountID: number;
    public MatchWithEntryID: number;
    public BankStatementRuleID: number;
    public Account: Account;
}


export class ReportRow extends UniEntity {
    public SumLastYear: number;
    public SumPeriodLastYearAccumulated: number;
    public Period8: number;
    public BudgetSum: number;
    public Period12: number;
    public Period2: number;
    public BudgetAccumulated: number;
    public GroupName: string;
    public SumPeriodAccumulated: number;
    public BudPeriod4: number;
    public IsSubTotal: boolean;
    public BudPeriod7: number;
    public BudPeriod6: number;
    public Period3: number;
    public Sum: number;
    public SubGroupName: string;
    public PrecedingBalance: number;
    public Period7: number;
    public BudPeriod12: number;
    public BudPeriod5: number;
    public SumPeriod: number;
    public Period5: number;
    public BudPeriod9: number;
    public BudPeriod2: number;
    public Period4: number;
    public Period10: number;
    public SumPeriodLastYear: number;
    public ID: number;
    public AccountName: string;
    public AccountYear: number;
    public BudPeriod8: number;
    public BudPeriod10: number;
    public BudPeriod11: number;
    public BudPeriod1: number;
    public AccountNumber: number;
    public SubGroupNumber: number;
    public Period1: number;
    public Period6: number;
    public GroupNumber: number;
    public BudPeriod3: number;
    public Period11: number;
    public Period9: number;
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
    public VAT: number;
    public CustomPayments: number;
    public Sum: number;
    public Supplier: number;
    public Liquidity: number;
    public Custumer: number;
}


export class JournalEntryData extends UniEntity {
    public CustomerInvoiceID: number;
    public Description: string;
    public InvoiceNumber: string;
    public Amount: number;
    public CreditAccountNumber: number;
    public PaymentID: string;
    public NumberSeriesTaskID: number;
    public SupplierInvoiceNo: string;
    public VatDeductionPercent: number;
    public DebitVatTypeID: number;
    public StatusCode: number;
    public CurrencyExchangeRate: number;
    public PostPostJournalEntryLineID: number;
    public CustomerOrderID: number;
    public CreditAccountID: number;
    public NumberSeriesID: number;
    public JournalEntryID: number;
    public JournalEntryNo: string;
    public FinancialDate: LocalDate;
    public DueDate: LocalDate;
    public VatDate: LocalDate;
    public DebitAccountID: number;
    public JournalEntryDataAccrualID: number;
    public DebitAccountNumber: number;
    public SupplierInvoiceID: number;
    public AmountCurrency: number;
    public CreditVatTypeID: number;
    public CurrencyID: number;
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
    public PeriodSumYear1: number;
    public PeriodSumYear2: number;
}


export class JournalEntryLineRequestSummary extends UniEntity {
    public SumCredit: number;
    public SumTaxBasisAmount: number;
    public SumBalance: number;
    public SumLedger: number;
    public SumDebit: number;
}


export class JournalEntryLinePostPostData extends UniEntity {
    public Description: string;
    public InvoiceNumber: string;
    public Amount: number;
    public MarkedAgainstJournalEntryLineID: number;
    public PaymentID: string;
    public JournalEntryNumber: string;
    public StatusCode: number;
    public CurrencyExchangeRate: number;
    public SumPostPostAmount: number;
    public CurrencyCodeCode: string;
    public SubAccountNumber: number;
    public PeriodNo: number;
    public JournalEntryID: number;
    public FinancialDate: Date;
    public DueDate: Date;
    public SumPostPostAmountCurrency: number;
    public MarkedAgainstJournalEntryNumber: string;
    public ID: number;
    public CurrencyCodeShortCode: string;
    public JournalEntryNumberNumeric: number;
    public JournalEntryTypeName: string;
    public SubAccountName: string;
    public AccountYear: number;
    public AmountCurrency: number;
    public RestAmount: number;
    public CurrencyCodeID: number;
    public RestAmountCurrency: number;
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
    public InvoiceNumber: string;
    public Amount: number;
    public JournalEntryNumber: string;
    public StatusCode: StatusCodeJournalEntryLine;
    public FinancialDate: Date;
    public OriginalRestAmount: number;
    public ID: number;
    public OriginalStatusCode: StatusCodeJournalEntryLine;
    public AmountCurrency: number;
    public RestAmount: number;
    public RestAmountCurrency: number;
    public Markings: Array<MarkingReference>;
}


export class MarkingReference extends UniEntity {
    public JournalEntryNumber: string;
    public ID: number;
}


export class SupplierInvoiceDetail extends UniEntity {
    public VatCode: string;
    public Description: string;
    public InvoiceNumber: string;
    public Amount: number;
    public InvoiceDate: Date;
    public SupplierID: number;
    public AccountID: number;
    public VatPercent: number;
    public VatTypeName: string;
    public AccountName: string;
    public SupplierInvoiceID: number;
    public AmountCurrency: number;
    public AccountNumber: number;
    public DeliveryDate: Date;
    public VatTypeID: number;
}


export class VatReportMessage extends UniEntity {
    public Level: ValidationLevel;
    public Message: string;
}


export class VatReportSummary extends UniEntity {
    public NumberOfJournalEntryLines: number;
    public SumVatAmount: number;
    public VatCodeGroupName: string;
    public SumTaxBasisAmount: number;
    public HasTaxAmount: boolean;
    public VatCodeGroupNo: string;
    public IsHistoricData: boolean;
    public VatCodeGroupID: number;
    public HasTaxBasis: boolean;
}


export class VatReportSummaryPerPost extends UniEntity {
    public NumberOfJournalEntryLines: number;
    public SumVatAmount: number;
    public VatCodeGroupName: string;
    public SumTaxBasisAmount: number;
    public HasTaxAmount: boolean;
    public VatPostNo: string;
    public VatCodeGroupNo: string;
    public IsHistoricData: boolean;
    public VatPostName: string;
    public VatPostID: number;
    public VatPostReportAsNegativeAmount: boolean;
    public VatCodeGroupID: number;
    public HasTaxBasis: boolean;
}


export class VatReportSummaryPerPostPerAccount extends UniEntity {
    public VatCode: string;
    public Description: string;
    public Amount: number;
    public NumberOfJournalEntryLines: number;
    public SumVatAmount: number;
    public JournalEntryNumber: string;
    public VatJournalEntryPostAccountID: number;
    public VatCodeGroupName: string;
    public SumTaxBasisAmount: number;
    public HasTaxAmount: boolean;
    public FinancialDate: Date;
    public VatPostNo: string;
    public VatCodeGroupNo: string;
    public IsHistoricData: boolean;
    public VatAccountName: string;
    public TaxBasisAmount: number;
    public VatPostName: string;
    public VatDate: Date;
    public VatPostID: number;
    public VatPostReportAsNegativeAmount: boolean;
    public VatJournalEntryPostAccountNumber: number;
    public VatCodeGroupID: number;
    public StdVatCode: string;
    public VatAccountID: number;
    public VatAccountNumber: number;
    public VatJournalEntryPostAccountName: string;
    public HasTaxBasis: boolean;
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
    public Status: AltinnGetVatReportDataFromAltinnStatus;
    public Message: string;
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


export enum GenderEnum{
    NotDefined = 0,
    Woman = 1,
    Man = 2,
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


export enum ShipTradeArea{
    notSet = 0,
    Domestic = 1,
    Foreign = 2,
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


export enum ShipTypeOfShip{
    notSet = 0,
    Other = 1,
    DrillingPlatform = 2,
    Tourist = 3,
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


export enum SalBalType{
    Advance = 1,
    Contribution = 2,
    Outlay = 3,
    Garnishment = 4,
    Other = 5,
    Union = 6,
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


export enum TaxType{
    Tax_None = 0,
    Tax_Table = 1,
    Tax_Percent = 2,
    Tax_0 = 3,
}


export enum SpecialAgaRule{
    Regular = 0,
    AgaRefund = 1,
    AgaPension = 2,
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


export enum KpiSourceType{
    SourceStatistics = 0,
    SourceCountRecords = 1,
    SourceRecordValue = 2,
    SourceController = 3,
}


export enum KpiValueType{
    ValueTypeCounter = 0,
    ValueTypeDecimal = 1,
    ValueTypeText = 2,
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


export enum BankfileDataType{
    Text = 1,
    Decimal = 2,
    Decimal_00 = 3,
    NorDate = 4,
    IsoDate = 5,
    IsoDate2 = 6,
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
