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

    public UpdatedBy: string;
    public CreatedBy: string;
    public Action: string;
    public UpdatedAt: Date;
    public ClientID: string;
    public Field: string;
    public Transaction: string;
    public Route: string;
    public ID: number;
    public NewValue: string;
    public EntityType: string;
    public Deleted: boolean;
    public OldValue: string;
    public CreatedAt: Date;
    public Verb: string;
    public EntityID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class WorkBalance extends UniEntity {
    public static RelativeUrl = 'workbalances';
    public static EntityType = 'WorkBalance';

    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public BalanceFrom: Date;
    public UpdatedAt: Date;
    public WorkRelationID: number;
    public Description: string;
    public ValidFrom: Date;
    public Days: number;
    public ActualMinutes: number;
    public ID: number;
    public Balancetype: WorkBalanceTypeEnum;
    public Deleted: boolean;
    public ExpectedMinutes: number;
    public Minutes: number;
    public BalanceDate: Date;
    public CreatedAt: Date;
    public IsStartBalance: boolean;
    public ValidTimeOff: number;
    public _createguid: string;
    public CustomFields: any;
}


export class Worker extends UniEntity {
    public static RelativeUrl = 'workers';
    public static EntityType = 'Worker';

    public UserID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public EmployeeID: number;
    public UpdatedAt: Date;
    public ID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
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

    public Date: Date;
    public StatusCode: number;
    public UpdatedBy: string;
    public EndTime: Date;
    public CreatedBy: string;
    public OrderItemId: number;
    public Label: string;
    public CustomerID: number;
    public UpdatedAt: Date;
    public WorkRelationID: number;
    public Description: string;
    public WorkTypeID: number;
    public StartTime: Date;
    public PayrollTrackingID: number;
    public PriceExVat: number;
    public LunchInMinutes: number;
    public ID: number;
    public Deleted: boolean;
    public Minutes: number;
    public MinutesToOrder: number;
    public CreatedAt: Date;
    public WorkItemGroupID: number;
    public DimensionsID: number;
    public TransferedToPayroll: boolean;
    public TransferedToOrder: boolean;
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

    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public WorkRelationID: number;
    public ID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public _createguid: string;
    public WorkRelation: WorkRelation;
    public Items: Array<WorkItem>;
    public CustomFields: any;
}


export class WorkProfile extends UniEntity {
    public static RelativeUrl = 'workprofiles';
    public static EntityType = 'WorkProfile';

    public MinutesPerMonth: number;
    public LunchIncluded: boolean;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public MinutesPerWeek: number;
    public UpdatedAt: Date;
    public ID: number;
    public Name: string;
    public Deleted: boolean;
    public MinutesPerYear: number;
    public CreatedAt: Date;
    public IsShared: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class WorkRelation extends UniEntity {
    public static RelativeUrl = 'workrelations';
    public static EntityType = 'WorkRelation';

    public TeamID: number;
    public StatusCode: number;
    public WorkerID: number;
    public UpdatedBy: string;
    public EndTime: Date;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public WorkPercentage: number;
    public CompanyName: string;
    public IsPrivate: boolean;
    public StartDate: Date;
    public Description: string;
    public ID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public CompanyID: number;
    public IsActive: boolean;
    public WorkProfileID: number;
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

    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public FromDate: Date;
    public UpdatedAt: Date;
    public IsHalfDay: boolean;
    public ToDate: Date;
    public WorkRelationID: number;
    public Description: string;
    public ID: number;
    public Deleted: boolean;
    public SystemKey: string;
    public RegionKey: string;
    public CreatedAt: Date;
    public TimeoffType: number;
    public _createguid: string;
    public CustomFields: any;
}


export class WorkType extends UniEntity {
    public static RelativeUrl = 'worktypes';
    public static EntityType = 'WorkType';

    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Description: string;
    public ID: number;
    public Name: string;
    public Deleted: boolean;
    public Price: number;
    public ProductID: number;
    public CreatedAt: Date;
    public WagetypeNumber: number;
    public SystemType: WorkTypeEnum;
    public _createguid: string;
    public Product: Product;
    public CustomFields: any;
}


export class BankFile extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'BankFile';

    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public ParentFileid: number;
    public UpdatedAt: Date;
    public SubCompanyID: number;
    public ID: number;
    public FileID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public Accountnumber: string;
    public _createguid: string;
    public File: File;
    public SubCompany: SubCompany;
    public CustomFields: any;
}


export class BatchInvoice extends UniEntity {
    public static RelativeUrl = 'batchinvoices';
    public static EntityType = 'BatchInvoice';

    public TotalToProcess: number;
    public StatusCode: number;
    public Operation: BatchInvoiceOperation;
    public SellerID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public NotifyEmail: boolean;
    public OurRef: string;
    public UpdatedAt: Date;
    public Processed: number;
    public MinAmount: number;
    public NumberOfBatches: number;
    public InvoiceDate: LocalDate;
    public Comment: string;
    public ID: number;
    public DueDate: LocalDate;
    public YourRef: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public FreeTxt: string;
    public CustomerID: number;
    public ProjectID: number;
    public _createguid: string;
    public Items: Array<BatchInvoiceItem>;
    public CustomFields: any;
}


export class BatchInvoiceItem extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'BatchInvoiceItem';

    public CommentID: number;
    public CustomerInvoiceID: number;
    public StatusCode: StatusCode;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public ID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public BatchInvoiceID: number;
    public BatchNumber: number;
    public CustomerOrderID: number;
    public CustomerID: number;
    public ProjectID: number;
    public _createguid: string;
    public CustomerOrder: CustomerOrder;
    public CustomerInvoice: CustomerInvoice;
    public CustomFields: any;
}


export class CampaignTemplate extends UniEntity {
    public static RelativeUrl = 'campaigntemplate';
    public static EntityType = 'CampaignTemplate';

    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public EntityName: string;
    public Template: string;
    public UpdatedAt: Date;
    public ID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class Customer extends UniEntity {
    public static RelativeUrl = 'customers';
    public static EntityType = 'Customer';

    public Localization: string;
    public CustomerNumber: number;
    public PeppolAddress: string;
    public SubAccountNumberSeriesID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public SocialSecurityNumber: string;
    public CreatedBy: string;
    public AvtaleGiro: boolean;
    public CurrencyCodeID: number;
    public UpdatedAt: Date;
    public CustomerInvoiceReminderSettingsID: number;
    public AvtaleGiroNotification: boolean;
    public IsPrivate: boolean;
    public OrgNumber: string;
    public WebUrl: string;
    public DontSendReminders: boolean;
    public ID: number;
    public DefaultCustomerOrderReportID: number;
    public DefaultSellerID: number;
    public ReminderEmailAddress: string;
    public Deleted: boolean;
    public GLN: string;
    public PaymentTermsID: number;
    public EInvoiceAgreementReference: string;
    public EfakturaIdentifier: string;
    public DeliveryTermsID: number;
    public CreatedAt: Date;
    public DefaultDistributionsID: number;
    public DefaultCustomerQuoteReportID: number;
    public DefaultCustomerInvoiceReportID: number;
    public DimensionsID: number;
    public BusinessRelationID: number;
    public AcceptableDelta4CustomerPaymentAccountID: number;
    public CreditDays: number;
    public FactoringNumber: number;
    public AcceptableDelta4CustomerPayment: number;
    public CustomerNumberKidAlias: string;
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

    public PaymentInfoTypeID: number;
    public PayableRoundingCurrencyAmount: number;
    public InvoiceType: number;
    public CustomerOrgNumber: string;
    public StatusCode: number;
    public ShippingCountry: string;
    public CustomerPerson: string;
    public AmountRegards: string;
    public VatTotalsAmount: number;
    public OurReference: string;
    public InvoicePostalCode: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CollectorStatusCode: number;
    public ShippingCountryCode: string;
    public InvoiceCountry: string;
    public LastPaymentDate: LocalDate;
    public CustomerID: number;
    public InternalNote: string;
    public Requisition: string;
    public PaymentID: string;
    public VatTotalsAmountCurrency: number;
    public CreditedAmount: number;
    public CurrencyCodeID: number;
    public UpdatedAt: Date;
    public DefaultDimensionsID: number;
    public InvoiceNumberSeriesID: number;
    public BankAccountID: number;
    public InvoiceCity: string;
    public UseReportID: number;
    public EmailAddress: string;
    public JournalEntryID: number;
    public DeliveryName: string;
    public ExternalStatus: number;
    public InvoiceAddressLine1: string;
    public CurrencyExchangeRate: number;
    public DistributionPlanID: number;
    public Credited: boolean;
    public RestAmount: number;
    public DeliveryMethod: string;
    public TaxExclusiveAmountCurrency: number;
    public DontSendReminders: boolean;
    public DeliveryTerm: string;
    public InvoiceDate: LocalDate;
    public TaxInclusiveAmountCurrency: number;
    public SalesPerson: string;
    public CustomerName: string;
    public ExternalReference: string;
    public UpdateCurrencyAmountsOnDateChange: boolean;
    public Comment: string;
    public ID: number;
    public CreditedAmountCurrency: number;
    public DefaultSellerID: number;
    public Payment: string;
    public RestAmountCurrency: number;
    public Deleted: boolean;
    public PaymentTerm: string;
    public ShippingCity: string;
    public YourReference: string;
    public PaymentTermsID: number;
    public TaxExclusiveAmount: number;
    public PaymentInformation: string;
    public ShippingAddressLine1: string;
    public DeliveryTermsID: number;
    public CreatedAt: Date;
    public InvoiceAddressLine2: string;
    public ShippingAddressLine2: string;
    public DeliveryDate: LocalDate;
    public AccrualID: number;
    public InvoiceCountryCode: string;
    public SupplierOrgNumber: string;
    public PaymentDueDate: LocalDate;
    public InvoiceReferenceID: number;
    public InvoiceAddressLine3: string;
    public TaxInclusiveAmount: number;
    public ShippingPostalCode: string;
    public CreditDays: number;
    public PayableRoundingAmount: number;
    public FreeTxt: string;
    public InvoiceNumber: string;
    public ShippingAddressLine3: string;
    public PrintStatus: number;
    public InvoiceReceiverName: string;
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

    public NumberOfItems: number;
    public PriceIncVat: number;
    public CustomerInvoiceID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public SumTotalExVatCurrency: number;
    public SumTotalIncVat: number;
    public Discount: number;
    public AccountingCost: string;
    public Unit: string;
    public CurrencyCodeID: number;
    public UpdatedAt: Date;
    public CostPrice: number;
    public SumVatCurrency: number;
    public InvoicePeriodEndDate: LocalDate;
    public CurrencyExchangeRate: number;
    public ItemText: string;
    public SortIndex: number;
    public PriceSetByUser: boolean;
    public DiscountPercent: number;
    public PriceExVat: number;
    public SumTotalIncVatCurrency: number;
    public Comment: string;
    public ID: number;
    public ItemSourceID: number;
    public CalculateGrossPriceBasedOnNetPrice: boolean;
    public Deleted: boolean;
    public DiscountCurrency: number;
    public ProductID: number;
    public SumTotalExVat: number;
    public CreatedAt: Date;
    public SumVat: number;
    public DimensionsID: number;
    public VatTypeID: number;
    public VatPercent: number;
    public InvoicePeriodStartDate: LocalDate;
    public PriceExVatCurrency: number;
    public AccountID: number;
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

    public ReminderFeeCurrency: number;
    public DebtCollectionFee: number;
    public CustomerInvoiceID: number;
    public StatusCode: number;
    public RemindedDate: LocalDate;
    public UpdatedBy: string;
    public Title: string;
    public CreatedBy: string;
    public InterestFee: number;
    public CurrencyCodeID: number;
    public UpdatedAt: Date;
    public DebtCollectionFeeCurrency: number;
    public EmailAddress: string;
    public InterestFeeCurrency: number;
    public Description: string;
    public CurrencyExchangeRate: number;
    public RestAmount: number;
    public ID: number;
    public DueDate: LocalDate;
    public ReminderNumber: number;
    public RestAmountCurrency: number;
    public Deleted: boolean;
    public Notified: boolean;
    public CreatedAt: Date;
    public ReminderFee: number;
    public CreatedByReminderRuleID: number;
    public DimensionsID: number;
    public RunNumber: number;
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

    public StatusCode: number;
    public UpdatedBy: string;
    public Title: string;
    public CreatedBy: string;
    public UseMaximumLegalReminderFee: boolean;
    public UpdatedAt: Date;
    public CustomerInvoiceReminderSettingsID: number;
    public MinimumDaysFromDueDate: number;
    public Description: string;
    public ID: number;
    public ReminderNumber: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ReminderFee: number;
    public CreditDays: number;
    public _createguid: string;
    public CustomerInvoiceReminderSettings: CustomerInvoiceReminderSettings;
    public CustomFields: any;
}


export class CustomerInvoiceReminderSettings extends UniEntity {
    public static RelativeUrl = 'invoiceremindersettings';
    public static EntityType = 'CustomerInvoiceReminderSettings';

    public DebtCollectionSettingsID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public AcceptPaymentWithoutReminderFee: boolean;
    public ID: number;
    public DefaultReminderFeeAccountID: number;
    public Deleted: boolean;
    public RemindersBeforeDebtCollection: number;
    public CreatedAt: Date;
    public MinimumAmountToRemind: number;
    public _createguid: string;
    public DebtCollectionSettings: DebtCollectionSettings;
    public DefaultReminderFeeAccount: Account;
    public CustomerInvoiceReminderRules: Array<CustomerInvoiceReminderRule>;
    public CustomFields: any;
}


export class CustomerOrder extends UniEntity {
    public static RelativeUrl = 'orders';
    public static EntityType = 'CustomerOrder';

    public PaymentInfoTypeID: number;
    public PayableRoundingCurrencyAmount: number;
    public CustomerOrgNumber: string;
    public RestExclusiveAmountCurrency: number;
    public StatusCode: number;
    public ShippingCountry: string;
    public CustomerPerson: string;
    public VatTotalsAmount: number;
    public OurReference: string;
    public InvoicePostalCode: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public OrderNumber: number;
    public ShippingCountryCode: string;
    public InvoiceCountry: string;
    public CustomerID: number;
    public InternalNote: string;
    public Requisition: string;
    public VatTotalsAmountCurrency: number;
    public CurrencyCodeID: number;
    public UpdatedAt: Date;
    public DefaultDimensionsID: number;
    public InvoiceCity: string;
    public UseReportID: number;
    public EmailAddress: string;
    public DeliveryName: string;
    public InvoiceAddressLine1: string;
    public CurrencyExchangeRate: number;
    public ReadyToInvoice: boolean;
    public DistributionPlanID: number;
    public DeliveryMethod: string;
    public UpdateCurrencyOnToInvoice: boolean;
    public TaxExclusiveAmountCurrency: number;
    public DeliveryTerm: string;
    public TaxInclusiveAmountCurrency: number;
    public SalesPerson: string;
    public CustomerName: string;
    public UpdateCurrencyAmountsOnDateChange: boolean;
    public Comment: string;
    public ID: number;
    public DefaultSellerID: number;
    public RestAmountCurrency: number;
    public Deleted: boolean;
    public PaymentTerm: string;
    public ShippingCity: string;
    public YourReference: string;
    public PaymentTermsID: number;
    public TaxExclusiveAmount: number;
    public OrderDate: LocalDate;
    public ShippingAddressLine1: string;
    public DeliveryTermsID: number;
    public CreatedAt: Date;
    public InvoiceAddressLine2: string;
    public ShippingAddressLine2: string;
    public DeliveryDate: LocalDate;
    public OrderNumberSeriesID: number;
    public AccrualID: number;
    public InvoiceCountryCode: string;
    public SupplierOrgNumber: string;
    public InvoiceAddressLine3: string;
    public TaxInclusiveAmount: number;
    public ShippingPostalCode: string;
    public CreditDays: number;
    public PayableRoundingAmount: number;
    public FreeTxt: string;
    public ShippingAddressLine3: string;
    public PrintStatus: number;
    public InvoiceReceiverName: string;
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

    public NumberOfItems: number;
    public PriceIncVat: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public SumTotalExVatCurrency: number;
    public SumTotalIncVat: number;
    public Discount: number;
    public Unit: string;
    public CurrencyCodeID: number;
    public UpdatedAt: Date;
    public CostPrice: number;
    public SumVatCurrency: number;
    public CurrencyExchangeRate: number;
    public ItemText: string;
    public ReadyToInvoice: boolean;
    public SortIndex: number;
    public PriceSetByUser: boolean;
    public DiscountPercent: number;
    public PriceExVat: number;
    public SumTotalIncVatCurrency: number;
    public Comment: string;
    public ID: number;
    public ItemSourceID: number;
    public CalculateGrossPriceBasedOnNetPrice: boolean;
    public Deleted: boolean;
    public DiscountCurrency: number;
    public ProductID: number;
    public SumTotalExVat: number;
    public CreatedAt: Date;
    public SumVat: number;
    public DimensionsID: number;
    public VatTypeID: number;
    public CustomerOrderID: number;
    public VatPercent: number;
    public PriceExVatCurrency: number;
    public AccountID: number;
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

    public PaymentInfoTypeID: number;
    public PayableRoundingCurrencyAmount: number;
    public ValidUntilDate: LocalDate;
    public CustomerOrgNumber: string;
    public StatusCode: number;
    public ShippingCountry: string;
    public CustomerPerson: string;
    public VatTotalsAmount: number;
    public OurReference: string;
    public InvoicePostalCode: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdateCurrencyOnToOrder: boolean;
    public ShippingCountryCode: string;
    public InvoiceCountry: string;
    public CustomerID: number;
    public InternalNote: string;
    public Requisition: string;
    public VatTotalsAmountCurrency: number;
    public CurrencyCodeID: number;
    public UpdatedAt: Date;
    public QuoteNumber: number;
    public DefaultDimensionsID: number;
    public InvoiceCity: string;
    public UseReportID: number;
    public EmailAddress: string;
    public DeliveryName: string;
    public InvoiceAddressLine1: string;
    public CurrencyExchangeRate: number;
    public DistributionPlanID: number;
    public DeliveryMethod: string;
    public UpdateCurrencyOnToInvoice: boolean;
    public TaxExclusiveAmountCurrency: number;
    public DeliveryTerm: string;
    public TaxInclusiveAmountCurrency: number;
    public SalesPerson: string;
    public CustomerName: string;
    public UpdateCurrencyAmountsOnDateChange: boolean;
    public Comment: string;
    public ID: number;
    public DefaultSellerID: number;
    public Deleted: boolean;
    public PaymentTerm: string;
    public ShippingCity: string;
    public InquiryReference: number;
    public YourReference: string;
    public PaymentTermsID: number;
    public TaxExclusiveAmount: number;
    public ShippingAddressLine1: string;
    public DeliveryTermsID: number;
    public CreatedAt: Date;
    public InvoiceAddressLine2: string;
    public ShippingAddressLine2: string;
    public DeliveryDate: LocalDate;
    public QuoteDate: LocalDate;
    public InvoiceCountryCode: string;
    public SupplierOrgNumber: string;
    public InvoiceAddressLine3: string;
    public TaxInclusiveAmount: number;
    public QuoteNumberSeriesID: number;
    public ShippingPostalCode: string;
    public CreditDays: number;
    public PayableRoundingAmount: number;
    public FreeTxt: string;
    public ShippingAddressLine3: string;
    public PrintStatus: number;
    public InvoiceReceiverName: string;
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

    public NumberOfItems: number;
    public PriceIncVat: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public SumTotalExVatCurrency: number;
    public SumTotalIncVat: number;
    public Discount: number;
    public Unit: string;
    public CurrencyCodeID: number;
    public UpdatedAt: Date;
    public CostPrice: number;
    public CustomerQuoteID: number;
    public SumVatCurrency: number;
    public CurrencyExchangeRate: number;
    public ItemText: string;
    public SortIndex: number;
    public PriceSetByUser: boolean;
    public DiscountPercent: number;
    public PriceExVat: number;
    public SumTotalIncVatCurrency: number;
    public Comment: string;
    public ID: number;
    public CalculateGrossPriceBasedOnNetPrice: boolean;
    public Deleted: boolean;
    public DiscountCurrency: number;
    public ProductID: number;
    public SumTotalExVat: number;
    public CreatedAt: Date;
    public SumVat: number;
    public DimensionsID: number;
    public VatTypeID: number;
    public VatPercent: number;
    public PriceExVatCurrency: number;
    public AccountID: number;
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

    public StatusCode: number;
    public UpdatedBy: string;
    public CreditorNumber: number;
    public CreatedBy: string;
    public DebtCollectionFormat: number;
    public UpdatedAt: Date;
    public CustomerInvoiceReminderSettingsID: number;
    public ID: number;
    public Deleted: boolean;
    public DebtCollectionAutomationID: number;
    public CreatedAt: Date;
    public IntegrateWithDebtCollection: boolean;
    public _createguid: string;
    public DebtCollectionAutomation: Array<DebtCollectionAutomation>;
    public CustomerInvoiceReminderSettings: CustomerInvoiceReminderSettings;
    public CustomFields: any;
}


export class ItemSource extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ItemSource';

    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public ID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public _createguid: string;
    public Details: Array<ItemSourceDetail>;
    public CustomFields: any;
}


export class ItemSourceDetail extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ItemSourceDetail';

    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public SourceFK: number;
    public Description: string;
    public Amount: number;
    public ID: number;
    public ItemSourceID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public Tag: string;
    public SourceType: string;
    public _createguid: string;
    public CustomFields: any;
}


export class PaymentInfoType extends UniEntity {
    public static RelativeUrl = 'paymentinfotype';
    public static EntityType = 'PaymentInfoType';

    public Length: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Control: Modulus;
    public UpdatedAt: Date;
    public Type: PaymentInfoTypeEnum;
    public ID: number;
    public Locked: boolean;
    public Name: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public _createguid: string;
    public PaymentInfoTypeParts: Array<PaymentInfoTypePart>;
    public CustomFields: any;
}


export class PaymentInfoTypePart extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'PaymentInfoTypePart';

    public PaymentInfoTypeID: number;
    public Length: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Part: string;
    public UpdatedAt: Date;
    public SortIndex: number;
    public ID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class RecurringInvoice extends UniEntity {
    public static RelativeUrl = 'recurringinvoices';
    public static EntityType = 'RecurringInvoice';

    public PaymentInfoTypeID: number;
    public PayableRoundingCurrencyAmount: number;
    public CustomerOrgNumber: string;
    public StatusCode: number;
    public ShippingCountry: string;
    public CustomerPerson: string;
    public AmountRegards: string;
    public EndDate: LocalDate;
    public VatTotalsAmount: number;
    public OurReference: string;
    public InvoicePostalCode: string;
    public UpdatedBy: string;
    public ProduceAs: RecurringResult;
    public CreatedBy: string;
    public PreparationDays: number;
    public ShippingCountryCode: string;
    public InvoiceCountry: string;
    public CustomerID: number;
    public InternalNote: string;
    public Requisition: string;
    public VatTotalsAmountCurrency: number;
    public NotifyUser: string;
    public MaxIterations: number;
    public CurrencyCodeID: number;
    public UpdatedAt: Date;
    public DefaultDimensionsID: number;
    public InvoiceNumberSeriesID: number;
    public InvoiceCity: string;
    public UseReportID: number;
    public EmailAddress: string;
    public DeliveryName: string;
    public StartDate: LocalDate;
    public NotifyWhenRecurringEnds: boolean;
    public InvoiceAddressLine1: string;
    public CurrencyExchangeRate: number;
    public DistributionPlanID: number;
    public DeliveryMethod: string;
    public TaxExclusiveAmountCurrency: number;
    public NoCreditDays: boolean;
    public DeliveryTerm: string;
    public TaxInclusiveAmountCurrency: number;
    public SalesPerson: string;
    public CustomerName: string;
    public UpdateCurrencyAmountsOnDateChange: boolean;
    public Comment: string;
    public ID: number;
    public NotifyWhenOrdersArePrepared: boolean;
    public DefaultSellerID: number;
    public Payment: string;
    public TimePeriod: RecurringPeriod;
    public Deleted: boolean;
    public PaymentTerm: string;
    public NextInvoiceDate: LocalDate;
    public ShippingCity: string;
    public YourReference: string;
    public PaymentTermsID: number;
    public Interval: number;
    public TaxExclusiveAmount: number;
    public PaymentInformation: string;
    public ShippingAddressLine1: string;
    public DeliveryTermsID: number;
    public CreatedAt: Date;
    public InvoiceAddressLine2: string;
    public ShippingAddressLine2: string;
    public DeliveryDate: LocalDate;
    public InvoiceCountryCode: string;
    public SupplierOrgNumber: string;
    public InvoiceAddressLine3: string;
    public TaxInclusiveAmount: number;
    public ShippingPostalCode: string;
    public CreditDays: number;
    public PayableRoundingAmount: number;
    public FreeTxt: string;
    public ShippingAddressLine3: string;
    public PrintStatus: number;
    public InvoiceReceiverName: string;
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

    public RecurringInvoiceID: number;
    public NumberOfItems: number;
    public PriceIncVat: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public SumTotalExVatCurrency: number;
    public PricingSource: PricingSource;
    public SumTotalIncVat: number;
    public Discount: number;
    public Unit: string;
    public CurrencyCodeID: number;
    public UpdatedAt: Date;
    public SumVatCurrency: number;
    public CurrencyExchangeRate: number;
    public ItemText: string;
    public SortIndex: number;
    public PriceSetByUser: boolean;
    public DiscountPercent: number;
    public PriceExVat: number;
    public SumTotalIncVatCurrency: number;
    public Comment: string;
    public ID: number;
    public ReduceIncompletePeriod: boolean;
    public CalculateGrossPriceBasedOnNetPrice: boolean;
    public Deleted: boolean;
    public DiscountCurrency: number;
    public ProductID: number;
    public SumTotalExVat: number;
    public CreatedAt: Date;
    public SumVat: number;
    public DimensionsID: number;
    public VatTypeID: number;
    public TimeFactor: RecurringPeriod;
    public VatPercent: number;
    public PriceExVatCurrency: number;
    public AccountID: number;
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

    public RecurringInvoiceID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public InvoiceID: number;
    public NotifiedRecurringEnds: boolean;
    public CreationDate: LocalDate;
    public InvoiceDate: LocalDate;
    public Comment: string;
    public ID: number;
    public IterationNumber: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public OrderID: number;
    public NotifiedOrdersPrepared: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class Seller extends UniEntity {
    public static RelativeUrl = 'sellers';
    public static EntityType = 'Seller';

    public UserID: number;
    public TeamID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public EmployeeID: number;
    public UpdatedAt: Date;
    public DefaultDimensionsID: number;
    public ID: number;
    public Name: string;
    public Deleted: boolean;
    public CreatedAt: Date;
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

    public RecurringInvoiceID: number;
    public CustomerInvoiceID: number;
    public StatusCode: number;
    public SellerID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CustomerID: number;
    public UpdatedAt: Date;
    public CustomerQuoteID: number;
    public Percent: number;
    public Amount: number;
    public ID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public CustomerOrderID: number;
    public _createguid: string;
    public Seller: Seller;
    public CustomFields: any;
}


export class SubCompany extends UniEntity {
    public static RelativeUrl = 'subcompanies';
    public static EntityType = 'SubCompany';

    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CustomerID: number;
    public UpdatedAt: Date;
    public CompanyName: string;
    public ID: number;
    public CompanyKey: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public CompanyID: number;
    public CompanyType: CompanyRelation;
    public _createguid: string;
    public Customer: Customer;
    public CustomFields: any;
}


export class Supplier extends UniEntity {
    public static RelativeUrl = 'suppliers';
    public static EntityType = 'Supplier';

    public Localization: string;
    public SupplierNumber: number;
    public CostAllocationID: number;
    public PeppolAddress: string;
    public SubAccountNumberSeriesID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CurrencyCodeID: number;
    public UpdatedAt: Date;
    public SelfEmployed: boolean;
    public OrgNumber: string;
    public WebUrl: string;
    public ID: number;
    public Deleted: boolean;
    public GLN: string;
    public CreatedAt: Date;
    public DimensionsID: number;
    public BusinessRelationID: number;
    public CreditDays: number;
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

    public TermsType: TermsType;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Description: string;
    public ID: number;
    public Name: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public CreditDays: number;
    public _createguid: string;
    public CustomFields: any;
}


export class TOFCurrencySettings extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'TOFCurrencySettings';

    public UpdateCurrencyAmountsOnQuoteToInvoice: boolean;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdateCurrencyAmountsOnQuotedateChange: boolean;
    public UpdateCurrencyAmountsOnQuoteToOrder: boolean;
    public UpdatedAt: Date;
    public ID: number;
    public UpdateCurrencyAmountsOnOrderToInvoice: boolean;
    public Deleted: boolean;
    public UpdateCurrencyAmountsOnInvoicedateChange: boolean;
    public CreatedAt: Date;
    public UpdateCurrencyAmountsOnOrderdateChange: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class Address extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Address';

    public CountryCode: string;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public AddressLine3: string;
    public Region: string;
    public ID: number;
    public Deleted: boolean;
    public PostalCode: string;
    public Country: string;
    public CreatedAt: Date;
    public AddressLine1: string;
    public City: string;
    public BusinessRelationID: number;
    public AddressLine2: string;
    public _createguid: string;
    public BusinessRelation: BusinessRelation;
    public CustomFields: any;
}


export class BusinessRelation extends UniEntity {
    public static RelativeUrl = 'business-relations';
    public static EntityType = 'BusinessRelation';

    public ShippingAddressID: number;
    public StatusCode: number;
    public DefaultEmailID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public InvoiceAddressID: number;
    public UpdatedAt: Date;
    public DefaultBankAccountID: number;
    public ID: number;
    public DefaultContactID: number;
    public Name: string;
    public Deleted: boolean;
    public DefaultPhoneID: number;
    public CreatedAt: Date;
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

    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public InfoID: number;
    public Comment: string;
    public ID: number;
    public Role: string;
    public Deleted: boolean;
    public ParentBusinessRelationID: number;
    public CreatedAt: Date;
    public _createguid: string;
    public ParentBusinessRelation: BusinessRelation;
    public Info: BusinessRelation;
    public CustomFields: any;
}


export class Email extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Email';

    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public EmailAddress: string;
    public Description: string;
    public Type: string;
    public ID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public BusinessRelationID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class Phone extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Phone';

    public CountryCode: string;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Number: string;
    public UpdatedAt: Date;
    public Description: string;
    public Type: PhoneTypeEnum;
    public ID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public BusinessRelationID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class AGACalculation extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AGACalculation';

    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public ID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public DimensionsID: number;
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

    public StatusCode: number;
    public AGACalculationID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public freeAmount: number;
    public ID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public SubEntityID: number;
    public _createguid: string;
    public subEntity: SubEntity;
    public CustomFields: any;
}


export class AGATax extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AGATax';

    public beregningsKode: number;
    public StatusCode: number;
    public AGACalculationID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public agaBase: number;
    public ID: number;
    public zone: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public agaRate: number;
    public SubEntityID: number;
    public AGARateID: number;
    public zoneName: string;
    public municipalityName: string;
    public _createguid: string;
    public subEntity: SubEntity;
    public CustomFields: any;
}


export class AGAPension extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AGAPension';

    public beregningsKode: number;
    public StatusCode: number;
    public AGACalculationID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public agaBase: number;
    public ID: number;
    public zone: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public agaRate: number;
    public SubEntityID: number;
    public AGARateID: number;
    public zoneName: string;
    public municipalityName: string;
    public _createguid: string;
    public subEntity: SubEntity;
    public CustomFields: any;
}


export class AGADraw extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AGADraw';

    public beregningsKode: number;
    public StatusCode: number;
    public AGACalculationID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public agaBase: number;
    public ID: number;
    public zone: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public agaRate: number;
    public SubEntityID: number;
    public AGARateID: number;
    public zoneName: string;
    public municipalityName: string;
    public _createguid: string;
    public subEntity: SubEntity;
    public CustomFields: any;
}


export class ForeignerWithPercent extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ForeignerWithPercent';

    public StatusCode: number;
    public AGACalculationID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public agaBase: number;
    public ID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public agaRate: number;
    public SubEntityID: number;
    public zoneName: string;
    public municipalityName: string;
    public _createguid: string;
    public subEntity: SubEntity;
    public CustomFields: any;
}


export class DrawForeignerWithPercent extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'DrawForeignerWithPercent';

    public StatusCode: number;
    public AGACalculationID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public agaBase: number;
    public ID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public agaRate: number;
    public SubEntityID: number;
    public zoneName: string;
    public municipalityName: string;
    public _createguid: string;
    public subEntity: SubEntity;
    public CustomFields: any;
}


export class ForeignerWithAmount extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ForeignerWithAmount';

    public StatusCode: number;
    public AGACalculationID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public ID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public SubEntityID: number;
    public persons: number;
    public aga: number;
    public zoneName: string;
    public municipalityName: string;
    public _createguid: string;
    public subEntity: SubEntity;
    public CustomFields: any;
}


export class TaxAndAgaSums extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'TaxAndAgaSums';

    public StatusCode: number;
    public FinancialTax: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public ID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public WithholdingTax: number;
    public GarnishmentTax: number;
    public _createguid: string;
    public CustomFields: any;
}


export class AmeldingData extends UniEntity {
    public static RelativeUrl = 'amelding';
    public static EntityType = 'AmeldingData';

    public receiptID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public replacesID: number;
    public UpdatedAt: Date;
    public altinnStatus: string;
    public period: number;
    public type: AmeldingType;
    public attachmentFileID: number;
    public mainFileID: number;
    public sent: Date;
    public year: number;
    public ID: number;
    public messageID: string;
    public initiated: Date;
    public Deleted: boolean;
    public status: number;
    public CreatedAt: Date;
    public OppgaveHash: string;
    public PayrollRunID: number;
    public created: Date;
    public feedbackFileID: number;
    public replaceThis: string;
    public xmlValidationErrors: string;
    public _createguid: string;
    public log: Array<AmeldingLog>;
    public CustomFields: any;
}


export class AmeldingLog extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AmeldingLog';

    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public key: number;
    public ID: number;
    public Deleted: boolean;
    public AmeldingsID: number;
    public CreatedAt: Date;
    public registry: SalaryRegistry;
    public _createguid: string;
    public CustomFields: any;
}


export class BasicAmount extends UniEntity {
    public static RelativeUrl = 'basicamounts';
    public static EntityType = 'BasicAmount';

    public BasicAmountPrYear: number;
    public ConversionFactor: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public AveragePrYear: number;
    public FromDate: Date;
    public UpdatedAt: Date;
    public BasicAmountPrMonth: number;
    public ID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class CompanySalary extends UniEntity {
    public static RelativeUrl = 'companysalary';
    public static EntityType = 'CompanySalary';

    public MainAccountCostAGA: number;
    public WagetypeAdvancePayment: number;
    public HoursPerMonth: number;
    public StatusCode: number;
    public MainAccountCostVacation: number;
    public PostToTaxDraw: boolean;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public PaycheckZipReportID: number;
    public AnnualStatementZipReportID: number;
    public MainAccountAllocatedAGA: number;
    public WageDeductionDueToHoliday: WageDeductionDueToHolidayType;
    public PaymentInterval: CompanySalaryPaymentInterval;
    public Base_TaxFreeOrganization: boolean;
    public WagetypeAdvancePaymentAuto: number;
    public Base_PayAsYouEarnTaxOnPensions: boolean;
    public MainAccountAllocatedFinancial: number;
    public InterrimRemitAccount: number;
    public MainAccountCostFinancialVacation: number;
    public FreeAmount: number;
    public AllowOver6G: boolean;
    public Base_NettoPayment: boolean;
    public HourFTEs: number;
    public Base_JanMayenAndBiCountries: boolean;
    public ID: number;
    public MainAccountAllocatedAGAVacation: number;
    public MainAccountCostFinancial: number;
    public Deleted: boolean;
    public MainAccountCostAGAVacation: number;
    public MainAccountAllocatedVacation: number;
    public PostGarnishmentToTaxAccount: boolean;
    public OtpExportActive: boolean;
    public CreatedAt: Date;
    public Base_NettoPaymentForMaritim: boolean;
    public RateFinancialTax: number;
    public Base_SpesialDeductionForMaritim: boolean;
    public CalculateFinancialTax: boolean;
    public MainAccountAllocatedFinancialVacation: number;
    public Base_Svalbard: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class CompanyVacationRate extends UniEntity {
    public static RelativeUrl = 'companyvacationrates';
    public static EntityType = 'CompanyVacationRate';

    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public FromDate: Date;
    public Rate: number;
    public UpdatedAt: Date;
    public ID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public Rate60: number;
    public _createguid: string;
    public CustomFields: any;
}


export class EmployeeCategory extends UniEntity {
    public static RelativeUrl = 'employeecategories';
    public static EntityType = 'EmployeeCategory';

    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public ID: number;
    public EmployeeCategoryLinkID: number;
    public Name: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class EmployeeCategoryLink extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'EmployeeCategoryLink';

    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public EmployeeID: number;
    public UpdatedAt: Date;
    public EmployeeNumber: number;
    public ID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public EmployeeCategoryID: number;
    public _createguid: string;
    public EmployeeCategory: EmployeeCategory;
    public Employee: Employee;
    public CustomFields: any;
}


export class Employee extends UniEntity {
    public static RelativeUrl = 'employees';
    public static EntityType = 'Employee';

    public UserID: number;
    public IncludeOtpUntilMonth: number;
    public IncludeOtpUntilYear: number;
    public StatusCode: number;
    public PhotoID: number;
    public UpdatedBy: string;
    public SocialSecurityNumber: string;
    public ForeignWorker: ForeignWorker;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public PaymentInterval: PaymentInterval;
    public MunicipalityNo: string;
    public EmploymentDate: Date;
    public EmploymentDateOtp: LocalDate;
    public EmployeeNumber: number;
    public InternasjonalIDCountry: string;
    public OtpStatus: OtpStatus;
    public InternasjonalIDType: InternationalIDType;
    public ID: number;
    public Active: boolean;
    public Deleted: boolean;
    public EmployeeLanguageID: number;
    public BirthDate: Date;
    public CreatedAt: Date;
    public OtpExport: boolean;
    public TypeOfPaymentOtp: TypeOfPaymentOtp;
    public FreeText: string;
    public SubEntityID: number;
    public Sex: GenderEnum;
    public BusinessRelationID: number;
    public AdvancePaymentAmount: number;
    public InternationalID: string;
    public EndDateOtp: LocalDate;
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

    public SecondaryPercent: number;
    public StatusCode: number;
    public NonTaxableAmount: number;
    public pensjonID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public ResultatStatus: string;
    public loennFraBiarbeidsgiverID: number;
    public SKDXml: string;
    public EmployeeID: number;
    public NotMainEmployer: boolean;
    public UpdatedAt: Date;
    public loennTilUtenrikstjenestemannID: number;
    public loennKunTrygdeavgiftTilUtenlandskBorgerID: number;
    public Table: string;
    public EmployeeNumber: number;
    public loennKunTrygdeavgiftTilUtenlandskBorgerSomGrensegjengerID: number;
    public Percent: number;
    public Year: number;
    public Tilleggsopplysning: string;
    public ID: number;
    public Deleted: boolean;
    public IssueDate: Date;
    public TaxcardId: number;
    public CreatedAt: Date;
    public ufoereYtelserAndreID: number;
    public SecondaryTable: string;
    public loennFraHovedarbeidsgiverID: number;
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

    public AntallMaanederForTrekk: number;
    public NonTaxableAmount: number;
    public UpdatedBy: string;
    public tabellType: TabellType;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Table: string;
    public Percent: number;
    public ID: number;
    public Deleted: boolean;
    public freeAmountType: FreeAmountType;
    public CreatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class EmployeeLeave extends UniEntity {
    public static RelativeUrl = 'EmployeeLeave';
    public static EntityType = 'EmployeeLeave';

    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public FromDate: Date;
    public AffectsOtp: boolean;
    public UpdatedAt: Date;
    public ToDate: Date;
    public Description: string;
    public ID: number;
    public Deleted: boolean;
    public LeaveType: Leavetype;
    public CreatedAt: Date;
    public EmploymentID: number;
    public LeavePercent: number;
    public _createguid: string;
    public Employment: Employment;
    public CustomFields: any;
}


export class Employment extends UniEntity {
    public static RelativeUrl = 'employments';
    public static EntityType = 'Employment';

    public Standard: boolean;
    public MonthRate: number;
    public StatusCode: number;
    public EndDate: Date;
    public WorkingHoursScheme: WorkingHoursScheme;
    public UpdatedBy: string;
    public LedgerAccount: string;
    public CreatedBy: string;
    public RegulativeStepNr: number;
    public ShipType: ShipTypeOfShip;
    public EmploymentType: EmploymentType;
    public EmployeeID: number;
    public HoursPerWeek: number;
    public PayGrade: string;
    public TypeOfEmployment: TypeOfEmployment;
    public UpdatedAt: Date;
    public LastSalaryChangeDate: Date;
    public HourRate: number;
    public JobName: string;
    public JobCode: string;
    public WorkPercent: number;
    public StartDate: Date;
    public LastWorkPercentChangeDate: Date;
    public EndDateReason: EndDateReason;
    public RemunerationType: RemunerationType;
    public ShipReg: ShipRegistry;
    public TradeArea: ShipTradeArea;
    public EmployeeNumber: number;
    public SeniorityDate: Date;
    public ID: number;
    public UserDefinedRate: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public DimensionsID: number;
    public SubEntityID: number;
    public RegulativeGroupID: number;
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

    public StatusCode: number;
    public AffectsAGA: boolean;
    public UpdatedBy: string;
    public CreatedBy: string;
    public FromDate: Date;
    public UpdatedAt: Date;
    public Description: string;
    public Amount: number;
    public ID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public SubentityID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class OtpExportWagetype extends UniEntity {
    public static RelativeUrl = 'otpexportwagetypes';
    public static EntityType = 'OtpExportWagetype';

    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public ID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public WageTypeNumber: number;
    public _createguid: string;
    public CustomFields: any;
}


export class PayrollRun extends UniEntity {
    public static RelativeUrl = 'payrollrun';
    public static EntityType = 'PayrollRun';

    public PayDate: Date;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public FromDate: Date;
    public UpdatedAt: Date;
    public AGAonRun: number;
    public ToDate: Date;
    public HolidayPayDeduction: boolean;
    public PaycheckFileID: number;
    public Description: string;
    public JournalEntryNumber: string;
    public SettlementDate: Date;
    public ID: number;
    public AGAFreeAmount: number;
    public Deleted: boolean;
    public taxdrawfactor: TaxDrawFactor;
    public ExcludeRecurringPosts: boolean;
    public CreatedAt: Date;
    public needsRecalc: boolean;
    public FreeText: string;
    public _createguid: string;
    public transactions: Array<SalaryTransaction>;
    public agacalculation: Array<AGACalculation>;
    public CustomFields: any;
}


export class PayrollRunCategoryLink extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'PayrollRunCategoryLink';

    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public ID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public EmployeeCategoryID: number;
    public PayrollRunID: number;
    public _createguid: string;
    public EmployeeCategory: EmployeeCategory;
    public PayrollRun: PayrollRun;
    public CustomFields: any;
}


export class PostingSummaryDraft extends UniEntity {
    public PayrollID: number;
    public JobInfoID: number;
    public draftBasic: string;
    public ID: number;
    public draftWithDimsOnBalance: string;
    public status: SummaryJobStatus;
    public statusTime: Date;
    public draftWithDims: string;
}


export class Regulative extends UniEntity {
    public static RelativeUrl = 'regulatives';
    public static EntityType = 'Regulative';

    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public StartDate: LocalDate;
    public ID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public RegulativeGroupID: number;
    public _createguid: string;
    public Steps: Array<RegulativeStep>;
    public CustomFields: any;
}


export class RegulativeGroup extends UniEntity {
    public static RelativeUrl = 'regulativegroups';
    public static EntityType = 'RegulativeGroup';

    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public ID: number;
    public Name: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public _createguid: string;
    public Regulatives: Array<Regulative>;
    public CustomFields: any;
}


export class RegulativeStep extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'RegulativeStep';

    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Step: number;
    public Amount: number;
    public ID: number;
    public Deleted: boolean;
    public RegulativeID: number;
    public CreatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class SalaryBalance extends UniEntity {
    public static RelativeUrl = 'salarybalances';
    public static EntityType = 'SalaryBalance';

    public CreatePayment: boolean;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public FromDate: Date;
    public EmployeeID: number;
    public SalaryBalanceTemplateID: number;
    public UpdatedAt: Date;
    public InstalmentPercent: number;
    public ToDate: Date;
    public KID: string;
    public MinAmount: number;
    public InstalmentType: SalBalType;
    public Type: SalBalDrawType;
    public ID: number;
    public Name: string;
    public Deleted: boolean;
    public MaxAmount: number;
    public Source: SalBalSource;
    public SupplierID: number;
    public Instalment: number;
    public CreatedAt: Date;
    public WageTypeNumber: number;
    public EmploymentID: number;
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

    public Date: LocalDate;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public SalaryTransactionID: number;
    public Description: string;
    public Amount: number;
    public ID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public SalaryBalanceID: number;
    public _createguid: string;
    public SalaryTransaction: SalaryTransaction;
    public SalaryBalance: SalaryBalance;
    public CustomFields: any;
}


export class SalaryBalanceTemplate extends UniEntity {
    public static RelativeUrl = 'salarybalancetemplates';
    public static EntityType = 'SalaryBalanceTemplate';

    public CreatePayment: boolean;
    public SalarytransactionDescription: string;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public InstalmentPercent: number;
    public KID: string;
    public MinAmount: number;
    public InstalmentType: SalBalType;
    public ID: number;
    public Name: string;
    public Deleted: boolean;
    public MaxAmount: number;
    public SupplierID: number;
    public Instalment: number;
    public CreatedAt: Date;
    public WageTypeNumber: number;
    public Account: number;
    public _createguid: string;
    public Supplier: Supplier;
    public SalaryBalances: Array<SalaryBalance>;
    public CustomFields: any;
}


export class SalaryTransaction extends UniEntity {
    public static RelativeUrl = 'salarytrans';
    public static EntityType = 'SalaryTransaction';

    public ChildSalaryTransactionID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public FromDate: Date;
    public Sum: number;
    public Rate: number;
    public EmployeeID: number;
    public UpdatedAt: Date;
    public calcAGA: number;
    public ToDate: Date;
    public HolidayPayDeduction: boolean;
    public MunicipalityNo: string;
    public RecurringID: number;
    public EmployeeNumber: number;
    public recurringPostValidFrom: Date;
    public Amount: number;
    public ID: number;
    public IsRecurringPost: boolean;
    public WageTypeID: number;
    public Deleted: boolean;
    public recurringPostValidTo: Date;
    public TaxbasisID: number;
    public CreatedAt: Date;
    public SalaryBalanceID: number;
    public DimensionsID: number;
    public WageTypeNumber: number;
    public VatTypeID: number;
    public SystemType: StdSystemType;
    public EmploymentID: number;
    public PayrollRunID: number;
    public Account: number;
    public Text: string;
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

    public StatusCode: number;
    public ValueDate2: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public ValueDate: Date;
    public SalaryTransactionID: number;
    public ID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public WageTypeSupplementID: number;
    public ValueBool: boolean;
    public ValueMoney: number;
    public ValueString: string;
    public _createguid: string;
    public WageTypeSupplement: WageTypeSupplement;
    public CustomFields: any;
}


export class SalaryYear extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'SalaryYear';

    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public ID: number;
    public Deleted: boolean;
    public CurrentYear: number;
    public CreatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class SubEntity extends UniEntity {
    public static RelativeUrl = 'subentities';
    public static EntityType = 'SubEntity';

    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public AgaZone: number;
    public UpdatedAt: Date;
    public MunicipalityNo: string;
    public OrgNumber: string;
    public freeAmount: number;
    public ID: number;
    public AgaRule: number;
    public Deleted: boolean;
    public SuperiorOrganizationID: number;
    public CreatedAt: Date;
    public BusinessRelationID: number;
    public _createguid: string;
    public BusinessRelationInfo: BusinessRelation;
    public SuperiorOrganization: SubEntity;
    public CustomFields: any;
}


export class TaxBasis extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'TaxBasis';

    public DisabilityOtherBasis: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Basis: number;
    public SailorBasis: number;
    public PensionSourcetaxBasis: number;
    public UpdatedAt: Date;
    public SalaryTransactionID: number;
    public SvalbardBasis: number;
    public ID: number;
    public JanMayenBasis: number;
    public ForeignCitizenInsuranceBasis: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public PensionBasis: number;
    public ForeignBorderCommuterBasis: number;
    public _createguid: string;
    public CustomFields: any;
}


export class Travel extends UniEntity {
    public static RelativeUrl = 'travels';
    public static EntityType = 'Travel';

    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public SourceSystem: string;
    public Description: string;
    public TravelIdentificator: string;
    public EmployeeNumber: number;
    public Comment: string;
    public ID: number;
    public Phone: string;
    public Name: string;
    public Deleted: boolean;
    public SupplierID: number;
    public CreatedAt: Date;
    public Email: string;
    public PersonID: string;
    public DimensionsID: number;
    public Purpose: string;
    public State: state;
    public AdvanceAmount: number;
    public _createguid: string;
    public TravelLines: Array<TravelLine>;
    public Dimensions: Dimensions;
    public CustomFields: any;
}


export class TravelLine extends UniEntity {
    public static RelativeUrl = 'travellines';
    public static EntityType = 'TravelLine';

    public StatusCode: number;
    public TravelID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CostType: costtype;
    public Rate: number;
    public UpdatedAt: Date;
    public TypeID: number;
    public Description: string;
    public TravelIdentificator: string;
    public LineState: linestate;
    public InvoiceAccount: number;
    public Amount: number;
    public paytransID: number;
    public ID: number;
    public Deleted: boolean;
    public To: Date;
    public CreatedAt: Date;
    public DimensionsID: number;
    public From: Date;
    public VatTypeID: number;
    public AccountNumber: number;
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

    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public ForeignTypeID: string;
    public Description: string;
    public InvoiceAccount: number;
    public ID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public WageTypeNumber: number;
    public ForeignDescription: string;
    public _createguid: string;
    public CustomFields: any;
}


export class VacationPayLine extends UniEntity {
    public static RelativeUrl = 'VacationPayLines';
    public static EntityType = 'VacationPayLine';

    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public EmployeeID: number;
    public UpdatedAt: Date;
    public ManualVacationPayBase: number;
    public Year: number;
    public ID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public MissingEarlierVacationPay: number;
    public Rate: number;
    public PaidVacationPay: number;
    public VacationPay: number;
    public PaidTaxFreeVacationPay: number;
    public Age: number;
    public VacationPay60: number;
    public _createguid: string;
    public SystemVacationPayBase: number;
    public Withdrawal: number;
    public Rate60: number;
    public Employee: Employee;
    public CustomFields: any;
}


export class VacationRateEmployee extends UniEntity {
    public static RelativeUrl = 'employeevacationrates';
    public static EntityType = 'VacationRateEmployee';

    public StatusCode: number;
    public EndDate: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Rate: number;
    public EmployeeID: number;
    public UpdatedAt: Date;
    public StartDate: Date;
    public ID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public Rate60: number;
    public _createguid: string;
    public CustomFields: any;
}


export class WageType extends UniEntity {
    public static RelativeUrl = 'wagetypes';
    public static EntityType = 'WageType';

    public SystemRequiredWageType: number;
    public HideFromPaycheck: boolean;
    public StatusCode: number;
    public Limit_value: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public SpecialTaxAndContributionsRule: SpecialTaxAndContributionsRule;
    public GetRateFrom: GetRateFrom;
    public Base_EmploymentTax: boolean;
    public Rate: number;
    public Base_div3: boolean;
    public Limit_newRate: number;
    public UpdatedAt: Date;
    public Benefit: string;
    public IncomeType: string;
    public Base_div2: boolean;
    public Description: string;
    public Postnr: string;
    public RateFactor: number;
    public DaysOnBoard: boolean;
    public FixedSalaryHolidayDeduction: boolean;
    public SpecialAgaRule: SpecialAgaRule;
    public RatetypeColumn: RateTypeColumn;
    public ID: number;
    public SupplementPackage: string;
    public NoNumberOfHours: boolean;
    public Deleted: boolean;
    public StandardWageTypeFor: StdWageType;
    public CreatedAt: Date;
    public WageTypeName: string;
    public WageTypeNumber: number;
    public Base_Payment: boolean;
    public Systemtype: string;
    public ValidYear: number;
    public Limit_WageTypeNumber: number;
    public Limit_type: LimitType;
    public taxtype: TaxType;
    public AccountNumber_balance: number;
    public Base_Vacation: boolean;
    public SpecialTaxHandling: string;
    public AccountNumber: number;
    public _createguid: string;
    public SupplementaryInformations: Array<WageTypeSupplement>;
    public CustomFields: any;
}


export class WageTypeSupplement extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'WageTypeSupplement';

    public StatusCode: number;
    public UpdatedBy: string;
    public SuggestedValue: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Description: string;
    public ameldingType: string;
    public ValueType: Valuetype;
    public ID: number;
    public Name: string;
    public WageTypeID: number;
    public Deleted: boolean;
    public GetValueFromTrans: boolean;
    public CreatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class WageTypeTranslation extends UniEntity {
    public static RelativeUrl = 'wagetypetranslations';
    public static EntityType = 'WageTypeTranslation';

    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public ID: number;
    public Deleted: boolean;
    public EmployeeLanguageID: number;
    public CreatedAt: Date;
    public WageTypeName: string;
    public WageTypeNumber: number;
    public _createguid: string;
    public EmployeeLanguage: EmployeeLanguage;
    public CustomFields: any;
}


export class PensionScheme extends UniEntity {
    public static RelativeUrl = 'pensionschemes';
    public static EntityType = 'PensionScheme';

    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Period: number;
    public Identificator: string;
    public Year: number;
    public ID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class PensionSchemeSupplier extends UniEntity {
    public static RelativeUrl = 'pensionschemesuppliers';
    public static EntityType = 'PensionSchemeSupplier';

    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Identificator: string;
    public ID: number;
    public Name: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class StandardPensionSchemeSupplier extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'StandardPensionSchemeSupplier';

    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Identificator: string;
    public ID: number;
    public Name: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class EmployeeLanguage extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'EmployeeLanguage';

    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public LanguageCode: string;
    public UpdatedAt: Date;
    public ID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class ComponentLayout extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ComponentLayout';

    public BaseEntity: string;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public ID: number;
    public Name: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public _createguid: string;
    public Fields: Array<FieldLayout>;
    public CustomFields: any;
}


export class FieldLayout extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'FieldLayout';

    public Width: string;
    public Combo: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Label: string;
    public ReadOnly: boolean;
    public Sectionheader: string;
    public UpdatedAt: Date;
    public LineBreak: boolean;
    public Hidden: boolean;
    public Section: number;
    public Description: string;
    public Placement: number;
    public ID: number;
    public Placeholder: string;
    public EntityType: string;
    public Deleted: boolean;
    public Options: string;
    public CreatedAt: Date;
    public ComponentLayoutID: number;
    public HelpText: string;
    public Property: string;
    public Legend: string;
    public LookupField: boolean;
    public FieldSet: number;
    public FieldType: FieldType;
    public Alignment: Alignment;
    public DisplayField: string;
    public _createguid: string;
    public CustomFields: any;
}


export class CurrencyOverride extends UniEntity {
    public static RelativeUrl = 'currencyoverrides';
    public static EntityType = 'CurrencyOverride';

    public UpdatedBy: string;
    public CreatedBy: string;
    public FromDate: LocalDate;
    public UpdatedAt: Date;
    public ToCurrencyCodeID: number;
    public ToDate: LocalDate;
    public ID: number;
    public Deleted: boolean;
    public ExchangeRate: number;
    public Source: CurrencySourceEnum;
    public Factor: number;
    public CreatedAt: Date;
    public FromCurrencyCodeID: number;
    public _createguid: string;
    public FromCurrencyCode: CurrencyCode;
    public ToCurrencyCode: CurrencyCode;
    public CustomFields: any;
}


export class AccountAssetGroup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AccountAssetGroup';

    public ToAccountNumber: number;
    public AssetGroupCode: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public ID: number;
    public Deleted: boolean;
    public FromAccountNumber: number;
    public CreatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class AccountGroupSetup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AccountGroupSetup';

    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public ParentID: number;
    public PlanType: PlanTypeEnum;
    public ExternalReference: string;
    public ID: number;
    public Name: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public _createguid: string;
    public Parent: AccountGroupSetup;
    public CustomFields: any;
}


export class AccountSetup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AccountSetup';

    public AccountName: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public AccountGroupSetupID: number;
    public UpdatedAt: Date;
    public Visible: boolean;
    public VatCode: string;
    public PlanType: PlanTypeEnum;
    public ID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ExpectedDebitBalance: boolean;
    public SaftMappingAccountID: number;
    public AccountNumber: number;
    public _createguid: string;
    public AccountGroup: AccountGroupSetup;
    public SaftMappingAccount: SaftMappingAccount;
    public CustomFields: any;
}


export class AccountVisibilityGroup extends UniEntity {
    public static RelativeUrl = 'accountvisibilitygroups';
    public static EntityType = 'AccountVisibilityGroup';

    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public ID: number;
    public Name: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public _createguid: string;
    public Accounts: Array<AccountVisibilityGroupAccount>;
    public CompanyTypes: Array<CompanyType>;
    public CustomFields: any;
}


export class AccountVisibilityGroupAccount extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AccountVisibilityGroupAccount';

    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public AccountVisibilityGroupID: number;
    public ID: number;
    public Deleted: boolean;
    public AccountSetupID: number;
    public CreatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class AGARate extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AGARate';

    public ZoneID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Rate: number;
    public UpdatedAt: Date;
    public ID: number;
    public Deleted: boolean;
    public RateValidFrom: Date;
    public CreatedAt: Date;
    public _createguid: string;
    public sector: Array<AGASector>;
    public CustomFields: any;
}


export class AGASector extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AGASector';

    public UpdatedBy: string;
    public CreatedBy: string;
    public RateID: number;
    public Rate: number;
    public UpdatedAt: Date;
    public ValidFrom: Date;
    public freeAmount: number;
    public SectorID: number;
    public ID: number;
    public Sector: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class AGAZone extends UniEntity {
    public static RelativeUrl = 'AGAZones';
    public static EntityType = 'AGAZone';

    public ZoneName: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public ID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public _createguid: string;
    public rates: Array<AGARate>;
    public municipalsOnZone: Array<MunicipalAGAZone>;
    public CustomFields: any;
}


export class Agreement extends UniEntity {
    public static RelativeUrl = 'agreements';
    public static EntityType = 'Agreement';

    public UpdatedBy: string;
    public CreatedBy: string;
    public Template: string;
    public UpdatedAt: Date;
    public ValidFrom: Date;
    public ID: number;
    public Name: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public AppliesTo: number;
    public _createguid: string;
    public CustomFields: any;
}


export class AssetGroup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AssetGroup';

    public DepreciationAccountNumber: number;
    public Code: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public ToDate: Date;
    public DepreciationRate: number;
    public ID: number;
    public Name: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public DepreciationYears: number;
    public _createguid: string;
    public CustomFields: any;
}


export class BankIdentifierCode extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'BankIdentifierCode';

    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public BankIdentifier: string;
    public Bic: string;
    public ID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public BankName: string;
    public _createguid: string;
    public CustomFields: any;
}


export class CompanyType extends UniEntity {
    public static RelativeUrl = 'companytypes';
    public static EntityType = 'CompanyType';

    public UpdatedBy: string;
    public CreatedBy: string;
    public FullName: string;
    public Priority: boolean;
    public UpdatedAt: Date;
    public Description: string;
    public ID: number;
    public Name: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public DefaultPlanType: PlanTypeEnum;
    public DefaultAccountVisibilityGroupID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class Confirmation extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Confirmation';

    public StatusCode: number;
    public Code: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public ContractType: string;
    public UpdatedAt: Date;
    public CompanyName: string;
    public ExpirationDate: Date;
    public ID: number;
    public Phone: string;
    public DisplayName: string;
    public Deleted: boolean;
    public PostalCode: string;
    public CreatedAt: Date;
    public Email: string;
    public SignUpReferrer: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Country extends UniEntity {
    public static RelativeUrl = 'countries';
    public static EntityType = 'Country';

    public CountryCode: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public ID: number;
    public DefaultCurrencyCode: string;
    public CurrencyRateSource: string;
    public Name: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class Currency extends UniEntity {
    public static RelativeUrl = 'currencies';
    public static EntityType = 'Currency';

    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public ToCurrencyCodeID: number;
    public ID: number;
    public Deleted: boolean;
    public ExchangeRate: number;
    public Source: CurrencySourceEnum;
    public Factor: number;
    public CurrencyDate: LocalDate;
    public CreatedAt: Date;
    public FromCurrencyCodeID: number;
    public _createguid: string;
    public FromCurrencyCode: CurrencyCode;
    public ToCurrencyCode: CurrencyCode;
    public CustomFields: any;
}


export class CurrencyCode extends UniEntity {
    public static RelativeUrl = 'currencycodes';
    public static EntityType = 'CurrencyCode';

    public Code: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public ShortCode: string;
    public Description: string;
    public ID: number;
    public Name: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class DebtCollectionAutomation extends UniEntity {
    public static RelativeUrl = 'debtcollectionautomation';
    public static EntityType = 'DebtCollectionAutomation';

    public DebtCollectionSettingsID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Description: string;
    public ID: number;
    public Name: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public _createguid: string;
    public DebtCollectionSettings: DebtCollectionSettings;
    public CustomFields: any;
}


export class EmploymentValidValues extends UniEntity {
    public static RelativeUrl = 'employmentvalidvalues';
    public static EntityType = 'EmploymentValidValues';

    public MonthRate: boolean;
    public EndDate: boolean;
    public WorkingHoursScheme: boolean;
    public UpdatedBy: string;
    public CreatedBy: string;
    public ShipType: boolean;
    public HoursPerWeek: boolean;
    public typeOfEmployment: boolean;
    public UpdatedAt: Date;
    public LastSalaryChangeDate: boolean;
    public HourRate: boolean;
    public JobName: boolean;
    public JobCode: boolean;
    public WorkPercent: boolean;
    public StartDate: boolean;
    public RemunerationType: boolean;
    public ShipReg: boolean;
    public TradeArea: boolean;
    public SeniorityDate: boolean;
    public ID: number;
    public UserDefinedRate: boolean;
    public Deleted: boolean;
    public PaymentType: RemunerationType;
    public LastWorkPercentChange: boolean;
    public CreatedAt: Date;
    public employment: TypeOfEmployment;
    public _createguid: string;
    public CustomFields: any;
}


export class FinancialDeadline extends UniEntity {
    public static RelativeUrl = 'deadlines';
    public static EntityType = 'FinancialDeadline';

    public PassableDueDate: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Type: FinancialDeadlineType;
    public ID: number;
    public Name: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public AdditionalInfo: string;
    public Deadline: LocalDate;
    public _createguid: string;
    public CustomFields: any;
}


export class LanguageCode extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'LanguageCode';

    public Code: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public ID: number;
    public Name: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class Municipal extends UniEntity {
    public static RelativeUrl = 'Municipals';
    public static EntityType = 'Municipal';

    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public MunicipalityNo: string;
    public MunicipalityName: string;
    public ID: number;
    public Deleted: boolean;
    public Retired: boolean;
    public CountyName: string;
    public CreatedAt: Date;
    public CountyNo: string;
    public _createguid: string;
    public CustomFields: any;
}


export class MunicipalAGAZone extends UniEntity {
    public static RelativeUrl = 'MunicipalAGAZones';
    public static EntityType = 'MunicipalAGAZone';

    public ZoneID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public MunicipalityNo: string;
    public Startdate: Date;
    public ID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class PaymentBatchType extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'PaymentBatchType';

    public Code: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Description: string;
    public ID: number;
    public Name: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class PaymentCode extends UniEntity {
    public static RelativeUrl = 'paymentCodes';
    public static EntityType = 'PaymentCode';

    public Code: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public PaymentGroup: string;
    public UpdatedAt: Date;
    public Description: string;
    public ID: number;
    public Name: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class PostalCode extends UniEntity {
    public static RelativeUrl = 'postalcodes';
    public static EntityType = 'PostalCode';

    public StatusCode: number;
    public Code: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public ID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public City: string;
    public _createguid: string;
    public CustomFields: any;
}


export class SaftMappingAccount extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'SaftMappingAccount';

    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Description: string;
    public ID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public AccountID: string;
    public _createguid: string;
    public CustomFields: any;
}


export class StaticRegister extends UniEntity {
    public static RelativeUrl = 'StaticRegister';
    public static EntityType = 'StaticRegister';

    public stamp: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public ID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public Registry: string;
    public _createguid: string;
    public CustomFields: any;
}


export class STYRKCode extends UniEntity {
    public static RelativeUrl = 'STYRK';
    public static EntityType = 'STYRKCode';

    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public lnr: number;
    public tittel: string;
    public ynr: number;
    public ID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public styrk: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Language extends UniEntity {
    public static RelativeUrl = 'languages';
    public static EntityType = 'Language';

    public Code: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public ID: number;
    public FallBackLanguageID: number;
    public Name: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public _createguid: string;
    public Translations: Array<Translation>;
    public CustomFields: any;
}


export class Translatable extends UniEntity {
    public static RelativeUrl = 'translatables';
    public static EntityType = 'Translatable';

    public UpdatedBy: string;
    public CreatedBy: string;
    public Meaning: string;
    public UpdatedAt: Date;
    public Column: string;
    public Description: string;
    public Module: i18nModule;
    public ID: number;
    public Deleted: boolean;
    public Static: boolean;
    public CreatedAt: Date;
    public Value: string;
    public Model: string;
    public _createguid: string;
    public Translations: Array<Translation>;
    public CustomFields: any;
}


export class Translation extends UniEntity {
    public static RelativeUrl = 'translations';
    public static EntityType = 'Translation';

    public TranslatableID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public LanguageID: number;
    public ID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public Value: string;
    public _createguid: string;
    public Language: Language;
    public Translatable: Translatable;
    public CustomFields: any;
}


export class VatCodeGroupSetup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'VatCodeGroupSetup';

    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public No: string;
    public ID: number;
    public Name: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class VatPostSetup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'VatPostSetup';

    public ReportAsNegativeAmount: boolean;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public No: string;
    public VatCodeGroupSetupNo: string;
    public HasTaxBasis: boolean;
    public ID: number;
    public Name: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public HasTaxAmount: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class VatReportForm extends UniEntity {
    public static RelativeUrl = 'vatreportforms';
    public static EntityType = 'VatReportForm';

    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Description: string;
    public ID: number;
    public Name: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class VatReportReferenceSetup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'VatReportReferenceSetup';

    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public VatCode: string;
    public ID: number;
    public VatPostNo: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public AccountNumber: number;
    public _createguid: string;
    public CustomFields: any;
}


export class VatTypeSetup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'VatTypeSetup';

    public VatCodeGroupNo: string;
    public IsNotVatRegistered: boolean;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public VatCode: string;
    public DirectJournalEntryOnly: boolean;
    public IsCompensated: boolean;
    public ID: number;
    public Name: string;
    public IncomingAccountNumber: number;
    public DefaultVisible: boolean;
    public ReversedTaxDutyVat: boolean;
    public Deleted: boolean;
    public OutputVat: boolean;
    public CreatedAt: Date;
    public OutgoingAccountNumber: number;
    public _createguid: string;
    public VatTypeSetupPercentages: Array<VatTypeSetupPercentage>;
    public CustomFields: any;
}


export class VatTypeSetupPercentage extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'VatTypeSetupPercentage';

    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public ValidFrom: LocalDate;
    public ValidTo: LocalDate;
    public ID: number;
    public Deleted: boolean;
    public VatTypeSetupID: number;
    public CreatedAt: Date;
    public VatPercent: number;
    public _createguid: string;
    public CustomFields: any;
}


export class CompanyReport extends UniEntity {
    public static RelativeUrl = 'company-report';
    public static EntityType = 'CompanyReport';

    public UpdatedBy: string;
    public CreatedBy: string;
    public ReportDefinitionID: number;
    public UpdatedAt: Date;
    public ContractId: number;
    public ID: number;
    public CompanyKey: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class ReportDefinition extends UniEntity {
    public static RelativeUrl = 'report-definitions';
    public static EntityType = 'ReportDefinition';

    public ReportSource: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Visible: boolean;
    public IsStandard: boolean;
    public Category: string;
    public Description: string;
    public UniqueReportID: string;
    public ID: number;
    public Name: string;
    public Deleted: boolean;
    public CategoryLabel: string;
    public Md5: string;
    public CreatedAt: Date;
    public ReportType: number;
    public Version: string;
    public TemplateLinkId: string;
    public _createguid: string;
    public CustomFields: any;
}


export class ReportDefinitionDataSource extends UniEntity {
    public static RelativeUrl = 'report-definition-data-sources';
    public static EntityType = 'ReportDefinitionDataSource';

    public UpdatedBy: string;
    public CreatedBy: string;
    public ReportDefinitionId: number;
    public UpdatedAt: Date;
    public ID: number;
    public Name: string;
    public Deleted: boolean;
    public DataSourceUrl: string;
    public CreatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class ReportDefinitionParameter extends UniEntity {
    public static RelativeUrl = 'report-definition-parameters';
    public static EntityType = 'ReportDefinitionParameter';

    public DefaultValueList: string;
    public DefaultValueLookupType: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Label: string;
    public ReportDefinitionId: number;
    public DefaultValueSource: string;
    public UpdatedAt: Date;
    public Visible: boolean;
    public SortIndex: number;
    public Type: string;
    public DefaultValue: string;
    public ID: number;
    public Name: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class PeriodSeries extends UniEntity {
    public static RelativeUrl = 'period-series';
    public static EntityType = 'PeriodSeries';

    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public ID: number;
    public Name: string;
    public Active: boolean;
    public Deleted: boolean;
    public CreatedAt: Date;
    public SeriesType: PeriodSeriesType;
    public _createguid: string;
    public CustomFields: any;
}


export class PeriodTemplate extends UniEntity {
    public static RelativeUrl = 'period-templates';
    public static EntityType = 'PeriodTemplate';

    public UpdatedBy: string;
    public CreatedBy: string;
    public FromDate: LocalDate;
    public UpdatedAt: Date;
    public No: number;
    public ToDate: LocalDate;
    public ID: number;
    public Name: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public PeriodSeriesID: number;
    public _createguid: string;
    public PeriodSeries: PeriodSeries;
    public CustomFields: any;
}


export class Model extends UniEntity {
    public static RelativeUrl = 'models';
    public static EntityType = 'Model';

    public UpdatedBy: string;
    public CreatedBy: string;
    public Label: string;
    public UpdatedAt: Date;
    public Admin: boolean;
    public Description: string;
    public ID: number;
    public Name: string;
    public Deleted: boolean;
    public LabelPlural: string;
    public Shared: boolean;
    public CreatedAt: Date;
    public _createguid: string;
    public Fields: Array<Field>;
    public CustomFields: any;
}


export class Field extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Field';

    public UpdatedBy: string;
    public CreatedBy: string;
    public Label: string;
    public UpdatedAt: Date;
    public ModelID: number;
    public Description: string;
    public ID: number;
    public Name: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public HelpText: string;
    public _createguid: string;
    public Model: Model;
    public CustomFields: any;
}


export class Notification extends UniEntity {
    public static RelativeUrl = 'notifications';
    public static EntityType = 'Notification';

    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public CompanyName: string;
    public RecipientID: string;
    public ID: number;
    public SourceEntityID: number;
    public CompanyKey: string;
    public SenderDisplayName: string;
    public EntityType: string;
    public Deleted: boolean;
    public Message: string;
    public CreatedAt: Date;
    public SourceEntityType: string;
    public EntityID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class CompanySettings extends UniEntity {
    public static RelativeUrl = 'companysettings';
    public static EntityType = 'CompanySettings';

    public Localization: string;
    public ForceSupplierInvoiceApproval: boolean;
    public TaxableFromLimit: number;
    public TaxMandatoryType: number;
    public StatusCode: number;
    public OrganizationNumber: string;
    public PeriodSeriesAccountID: number;
    public CompanyBankAccountID: number;
    public PeriodSeriesVatID: number;
    public APGuid: string;
    public AutoDistributeInvoice: boolean;
    public TwoStageAutobankEnabled: boolean;
    public DefaultEmailID: number;
    public VatLockedDate: LocalDate;
    public UpdatedBy: string;
    public CompanyRegistered: boolean;
    public CreatedBy: string;
    public UseNetsIntegration: boolean;
    public LogoHideField: number;
    public TaxBankAccountID: number;
    public OfficeMunicipalityNo: string;
    public UsePaymentBankValues: boolean;
    public UseOcrInterpretation: boolean;
    public AllowAvtalegiroRegularInvoice: boolean;
    public UpdatedAt: Date;
    public DefaultAddressID: number;
    public APActivated: boolean;
    public AgioLossAccountID: number;
    public ShowNumberOfDecimals: number;
    public CompanyName: string;
    public CustomerInvoiceReminderSettingsID: number;
    public APContactID: number;
    public NetsIntegrationActivated: boolean;
    public AccountVisibilityGroupID: number;
    public InterrimPaymentAccountID: number;
    public BankChargeAccountID: number;
    public LogoFileID: number;
    public DefaultSalesAccountID: number;
    public DefaultTOFCurrencySettingsID: number;
    public HideInActiveSuppliers: boolean;
    public AgioGainAccountID: number;
    public WebAddress: string;
    public IgnorePaymentsWithoutEndToEndID: boolean;
    public SAFTimportAccountID: number;
    public CustomerAccountID: number;
    public UseFinancialDateToCalculateVatPercent: boolean;
    public RoundingNumberOfDecimals: number;
    public StoreDistributedInvoice: boolean;
    public SalaryBankAccountID: number;
    public CompanyTypeID: number;
    public RoundingType: RoundingType;
    public PaymentBankIdentification: string;
    public LogoAlign: number;
    public ID: number;
    public DefaultCustomerOrderReportID: number;
    public HasAutobank: boolean;
    public Deleted: boolean;
    public CustomerCreditDays: number;
    public DefaultCustomerInvoiceReminderReportID: number;
    public BatchInvoiceMinAmount: number;
    public GLN: string;
    public VatReportFormID: number;
    public AutoJournalPayment: string;
    public UseXtraPaymentOrgXmlTag: boolean;
    public SupplierAccountID: number;
    public HideInActiveCustomers: boolean;
    public DefaultPhoneID: number;
    public AccountingLockedDate: LocalDate;
    public BookCustomerInvoiceOnDeliveryDate: boolean;
    public CreatedAt: Date;
    public DefaultDistributionsID: number;
    public AccountGroupSetID: number;
    public DefaultCustomerQuoteReportID: number;
    public TaxableFromDate: LocalDate;
    public DefaultCustomerInvoiceReportID: number;
    public InterrimRemitAccountID: number;
    public XtraPaymentOrgXmlTagValue: string;
    public PaymentBankAgreementNumber: string;
    public FactoringEmailID: number;
    public SaveCustomersFromQuoteAsLead: boolean;
    public AcceptableDelta4CustomerPaymentAccountID: number;
    public SettlementVatAccountID: number;
    public TaxMandatory: boolean;
    public UseAssetRegister: boolean;
    public FactoringNumber: number;
    public Factoring: number;
    public ShowKIDOnCustomerInvoice: boolean;
    public BaseCurrencyCodeID: number;
    public DefaultAccrualAccountID: number;
    public AcceptableDelta4CustomerPayment: number;
    public APIncludeAttachment: boolean;
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
    public DefaultAccrualAccount: Account;
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

    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public ID: number;
    public EntityType: string;
    public Name: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public _createguid: string;
    public Elements: Array<DistributionPlanElement>;
    public CustomFields: any;
}


export class DistributionPlanElement extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'DistributionPlanElement';

    public DistributionPlanElementTypeID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Priority: number;
    public UpdatedAt: Date;
    public DistributionPlanID: number;
    public ID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public _createguid: string;
    public ElementType: DistributionPlanElementType;
    public CustomFields: any;
}


export class DistributionPlanElementType extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'DistributionPlanElementType';

    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public ID: number;
    public Name: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public _createguid: string;
    public LegalEntities: Array<DistributionPlanElementTypeLegalEntity>;
    public CustomFields: any;
}


export class DistributionPlanElementTypeLegalEntity extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'DistributionPlanElementTypeLegalEntity';

    public DistributionPlanElementTypeID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public ID: number;
    public EntityType: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class Distributions extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Distributions';

    public CustomerOrderDistributionPlanID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CustomerInvoiceDistributionPlanID: number;
    public CustomerInvoiceReminderDistributionPlanID: number;
    public UpdatedAt: Date;
    public CustomerQuoteDistributionPlanID: number;
    public ID: number;
    public Deleted: boolean;
    public PayCheckDistributionPlanID: number;
    public CreatedAt: Date;
    public AnnualStatementDistributionPlanID: number;
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

    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public ID: number;
    public Name: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class EmailLog extends UniEntity {
    public static RelativeUrl = 'emails';
    public static EntityType = 'EmailLog';

    public JobRunExternalRef: string;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public EntityDisplayValue: string;
    public UpdatedAt: Date;
    public ExternalMessage: string;
    public Subject: string;
    public Type: SharingType;
    public ExternalReference: string;
    public ID: number;
    public EntityType: string;
    public Deleted: boolean;
    public To: string;
    public DistributeAt: LocalDate;
    public CreatedAt: Date;
    public JobRunID: number;
    public From: string;
    public EntityID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class Eventplan extends UniEntity {
    public static RelativeUrl = 'eventplans';
    public static EntityType = 'Eventplan';

    public IsSystemPlan: boolean;
    public Cargo: string;
    public StatusCode: number;
    public ModelFilter: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public JobNames: string;
    public UpdatedAt: Date;
    public OperationFilter: string;
    public PlanType: EventplanType;
    public ID: number;
    public Name: string;
    public Active: boolean;
    public Deleted: boolean;
    public CreatedAt: Date;
    public SigningKey: string;
    public _createguid: string;
    public ExpressionFilters: Array<ExpressionFilter>;
    public Subscribers: Array<EventSubscriber>;
    public CustomFields: any;
}


export class EventSubscriber extends UniEntity {
    public static RelativeUrl = 'eventsubscribers';
    public static EntityType = 'EventSubscriber';

    public Endpoint: string;
    public Headers: string;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Authorization: string;
    public UpdatedAt: Date;
    public ID: number;
    public Name: string;
    public Active: boolean;
    public Deleted: boolean;
    public CreatedAt: Date;
    public EventplanID: number;
    public _createguid: string;
    public Eventplan: Eventplan;
    public CustomFields: any;
}


export class ExpressionFilter extends UniEntity {
    public static RelativeUrl = 'expressionfilters';
    public static EntityType = 'ExpressionFilter';

    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public EntityName: string;
    public UpdatedAt: Date;
    public Expression: string;
    public ID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public EventplanID: number;
    public _createguid: string;
    public Eventplan: Eventplan;
    public CustomFields: any;
}


export class Period extends UniEntity {
    public static RelativeUrl = 'periodes';
    public static EntityType = 'Period';

    public PeriodTemplateID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public FromDate: LocalDate;
    public UpdatedAt: Date;
    public No: number;
    public ToDate: LocalDate;
    public ID: number;
    public Name: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public PeriodSeriesID: number;
    public AccountYear: number;
    public _createguid: string;
    public PeriodTemplate: PeriodTemplate;
    public PeriodSeries: PeriodSeries;
    public CustomFields: any;
}


export class PredefinedDescription extends UniEntity {
    public static RelativeUrl = 'predefineddescriptions';
    public static EntityType = 'PredefinedDescription';

    public StatusCode: number;
    public Code: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Description: string;
    public Type: PredefinedDescriptionType;
    public ID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class ProductCategory extends UniEntity {
    public static RelativeUrl = 'productcategories';
    public static EntityType = 'ProductCategory';

    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Rght: number;
    public ParentID: number;
    public Description: string;
    public Lft: number;
    public Comment: string;
    public ID: number;
    public Name: string;
    public Deleted: boolean;
    public Status: number;
    public CreatedAt: Date;
    public Depth: number;
    public _createguid: string;
    public CustomFields: any;
}


export class ProductCategoryLink extends UniEntity {
    public static RelativeUrl = 'productcategorylinks';
    public static EntityType = 'ProductCategoryLink';

    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public ID: number;
    public Deleted: boolean;
    public ProductID: number;
    public ProductCategoryID: number;
    public CreatedAt: Date;
    public _createguid: string;
    public ProductCategory: ProductCategory;
    public CustomFields: any;
}


export class Sharing extends UniEntity {
    public static RelativeUrl = 'sharings';
    public static EntityType = 'Sharing';

    public JobRunExternalRef: string;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public EntityDisplayValue: string;
    public UpdatedAt: Date;
    public ExternalMessage: string;
    public Subject: string;
    public Type: SharingType;
    public ExternalReference: string;
    public ID: number;
    public EntityType: string;
    public Deleted: boolean;
    public To: string;
    public DistributeAt: LocalDate;
    public CreatedAt: Date;
    public JobRunID: number;
    public From: string;
    public EntityID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class StatusLog extends UniEntity {
    public static RelativeUrl = 'statuslogs';
    public static EntityType = 'StatusLog';

    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public FromStatus: number;
    public ID: number;
    public EntityType: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ToStatus: number;
    public EntityID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class Tracelink extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Tracelink';

    public Date: Date;
    public StatusCode: number;
    public SourceInstanceID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public DestinationEntityName: string;
    public UpdatedAt: Date;
    public DestinationInstanceID: number;
    public ID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public SourceEntityName: string;
    public _createguid: string;
    public CustomFields: any;
}


export class User extends UniEntity {
    public static RelativeUrl = 'users';
    public static EntityType = 'User';

    public StatusCode: number;
    public BankIntegrationUserName: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public HasAgreedToImportDisclaimer: boolean;
    public UpdatedAt: Date;
    public IsAutobankAdmin: boolean;
    public LastLogin: Date;
    public UserName: string;
    public PhoneNumber: string;
    public ID: number;
    public DisplayName: string;
    public Deleted: boolean;
    public Protected: boolean;
    public CreatedAt: Date;
    public Email: string;
    public GlobalIdentity: string;
    public EndDate: Date;
    public TwoFactorEnabled: boolean;
    public _createguid: string;
    public AuthPhoneNumber: string;
    public CustomFields: any;
}


export class UniQueryDefinition extends UniEntity {
    public static RelativeUrl = 'uniquerydefinitions';
    public static EntityType = 'UniQueryDefinition';

    public UserID: number;
    public StatusCode: number;
    public Code: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public ClickParam: string;
    public UpdatedAt: Date;
    public ModuleID: number;
    public Category: string;
    public Description: string;
    public SortIndex: number;
    public ID: number;
    public Name: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public IsShared: boolean;
    public ClickUrl: string;
    public MainModelName: string;
    public SystemGeneratedQuery: boolean;
    public _createguid: string;
    public UniQueryFilters: Array<UniQueryFilter>;
    public UniQueryFields: Array<UniQueryField>;
    public CustomFields: any;
}


export class UniQueryField extends UniEntity {
    public static RelativeUrl = 'uniqueryfields';
    public static EntityType = 'UniQueryField';

    public Width: string;
    public StatusCode: number;
    public UniQueryDefinitionID: number;
    public SumFunction: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Field: string;
    public Header: string;
    public Index: number;
    public ID: number;
    public Alias: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public Path: string;
    public FieldType: number;
    public _createguid: string;
    public CustomFields: any;
}


export class UniQueryFilter extends UniEntity {
    public static RelativeUrl = 'uniqueryfilters';
    public static EntityType = 'UniQueryFilter';

    public StatusCode: number;
    public UniQueryDefinitionID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Group: number;
    public Field: string;
    public ID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public Value: string;
    public Operator: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Team extends UniEntity {
    public static RelativeUrl = 'teams';
    public static EntityType = 'Team';

    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Rght: number;
    public ParentID: number;
    public Lft: number;
    public ID: number;
    public Name: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public DimensionsID: number;
    public Depth: number;
    public _createguid: string;
    public Dimensions: Dimensions;
    public Positions: Array<TeamPosition>;
    public CustomFields: any;
}


export class TeamPosition extends UniEntity {
    public static RelativeUrl = 'teampositions';
    public static EntityType = 'TeamPosition';

    public UserID: number;
    public TeamID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public FromDate: LocalDate;
    public UpdatedAt: Date;
    public RelatedSharedRoleId: number;
    public Position: TeamPositionEnum;
    public ToDate: LocalDate;
    public ID: number;
    public Deleted: boolean;
    public ApproveOrder: number;
    public CreatedAt: Date;
    public _createguid: string;
    public Team: Team;
    public CustomFields: any;
}


export class ApprovalRule extends UniEntity {
    public static RelativeUrl = 'approvalrules';
    public static EntityType = 'ApprovalRule';

    public StatusCode: number;
    public Keywords: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Description: string;
    public RuleType: ApprovalRuleType;
    public IndustryCodes: string;
    public ID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public _createguid: string;
    public Steps: Array<ApprovalRuleStep>;
    public CustomFields: any;
}


export class ApprovalRuleStep extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ApprovalRuleStep';

    public UserID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public ID: number;
    public Deleted: boolean;
    public ApprovalRuleID: number;
    public CreatedAt: Date;
    public StepNumber: number;
    public Limit: number;
    public _createguid: string;
    public ApprovalRule: ApprovalRule;
    public User: User;
    public CustomFields: any;
}


export class ApprovalSubstitute extends UniEntity {
    public static RelativeUrl = 'approvalsubstitutes';
    public static EntityType = 'ApprovalSubstitute';

    public UserID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public FromDate: LocalDate;
    public UpdatedAt: Date;
    public ToDate: LocalDate;
    public ID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public SubstituteUserID: number;
    public _createguid: string;
    public User: User;
    public SubstituteUser: User;
    public CustomFields: any;
}


export class TaskApprovalPlan extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'TaskApprovalPlan';

    public UserID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public TaskID: number;
    public Amount: number;
    public Comment: string;
    public ID: number;
    public Deleted: boolean;
    public ApprovalRuleID: number;
    public ApprovalID: number;
    public CreatedAt: Date;
    public StepNumber: number;
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

    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Description: string;
    public Order: number;
    public ID: number;
    public IsDepricated: boolean;
    public EntityType: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public StatusCategoryID: number;
    public System: boolean;
    public _createguid: string;
    public StatusCategory: StatusCategory;
    public CustomFields: any;
}


export class StatusCategory extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'StatusCategory';

    public UpdatedBy: string;
    public StatusCategoryCode: StatusCategoryCode;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public ID: number;
    public Name: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class StatusRemark extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'StatusRemark';

    public StatusCode: number;
    public UpdatedBy: string;
    public Remark: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public ID: number;
    public EntityType: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public EntityID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class Transition extends UniEntity {
    public static RelativeUrl = 'transitions';
    public static EntityType = 'Transition';

    public UpdatedBy: string;
    public CreatedBy: string;
    public Controller: string;
    public UpdatedAt: Date;
    public ID: number;
    public EntityType: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public MethodName: string;
    public _createguid: string;
    public CustomFields: any;
}


export class TransitionThreshold extends UniEntity {
    public static RelativeUrl = 'thresholds';
    public static EntityType = 'TransitionThreshold';

    public SharedRejectTransitionId: number;
    public Operation: OperationType;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Disabled: boolean;
    public RejectStatusCode: number;
    public UpdatedAt: Date;
    public SharedApproveTransitionId: number;
    public SharedRoleId: number;
    public ID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public Value: string;
    public PropertyName: string;
    public Operator: Operator;
    public _createguid: string;
    public CustomFields: any;
}


export class TransitionThresholdApproval extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'TransitionThresholdApproval';

    public SharedRejectTransitionId: number;
    public Operation: OperationType;
    public UpdatedBy: string;
    public CreatedBy: string;
    public RejectStatusCode: number;
    public UpdatedAt: Date;
    public SharedApproveTransitionId: number;
    public SharedRoleId: number;
    public ID: number;
    public Deleted: boolean;
    public ApprovalID: number;
    public CreatedAt: Date;
    public Value: string;
    public PropertyName: string;
    public Operator: Operator;
    public _createguid: string;
    public Approval: Approval;
    public CustomFields: any;
}


export class Approval extends UniEntity {
    public static RelativeUrl = 'approvals';
    public static EntityType = 'Approval';

    public UserID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public SharedRoleId: number;
    public TaskID: number;
    public Amount: number;
    public ID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public _createguid: string;
    public Thresholds: Array<TransitionThresholdApproval>;
    public Task: Task;
    public User: User;
    public CustomFields: any;
}


export class Task extends UniEntity {
    public static RelativeUrl = 'tasks';
    public static EntityType = 'Task';

    public UserID: number;
    public SharedRejectTransitionId: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public Title: string;
    public CreatedBy: string;
    public RejectStatusCode: number;
    public UpdatedAt: Date;
    public SharedApproveTransitionId: number;
    public ModelID: number;
    public Type: TaskType;
    public SharedRoleId: number;
    public ID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public EntityID: number;
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

    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public ID: number;
    public IsDepricated: boolean;
    public EntityType: string;
    public ExpiresDate: Date;
    public Deleted: boolean;
    public FromStatusID: number;
    public CreatedAt: Date;
    public ToStatusID: number;
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

    public ProjectNumber: string;
    public ProjectNumberSeriesID: number;
    public StatusCode: number;
    public EndDate: LocalDate;
    public UpdatedBy: string;
    public CreatedBy: string;
    public ProjectNumberNumeric: number;
    public WorkPlaceAddressID: number;
    public UpdatedAt: Date;
    public CostPrice: number;
    public StartDate: LocalDate;
    public Total: number;
    public PlannedEnddate: LocalDate;
    public Description: string;
    public Amount: number;
    public ID: number;
    public Name: string;
    public Deleted: boolean;
    public ProjectLeadName: string;
    public Price: number;
    public ProjectCustomerID: number;
    public CreatedAt: Date;
    public DimensionsID: number;
    public PlannedStartdate: LocalDate;
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

    public UserID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public ProjectID: number;
    public Responsibility: string;
    public ID: number;
    public Name: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public _createguid: string;
    public ProjectUser: User;
    public CustomFields: any;
}


export class ProjectResourceSchedule extends UniEntity {
    public static RelativeUrl = 'projects-schedules-resources';
    public static EntityType = 'ProjectResourceSchedule';

    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public ProjectResourceID: number;
    public UpdatedAt: Date;
    public ID: number;
    public Deleted: boolean;
    public ProjectTaskScheduleID: number;
    public CreatedAt: Date;
    public ProjectTaskID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class ProjectTask extends UniEntity {
    public static RelativeUrl = 'projects-tasks';
    public static EntityType = 'ProjectTask';

    public StatusCode: number;
    public EndDate: LocalDate;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Number: string;
    public UpdatedAt: Date;
    public CostPrice: number;
    public StartDate: LocalDate;
    public Total: number;
    public Description: string;
    public ProjectID: number;
    public SuggestedNumber: string;
    public Amount: number;
    public ID: number;
    public Name: string;
    public Deleted: boolean;
    public Price: number;
    public CreatedAt: Date;
    public _createguid: string;
    public ProjectTaskSchedules: Array<ProjectTaskSchedule>;
    public ProjectTaskResources: Array<ProjectResourceSchedule>;
    public CustomFields: any;
}


export class ProjectTaskSchedule extends UniEntity {
    public static RelativeUrl = 'projects-tasks-schedules';
    public static EntityType = 'ProjectTaskSchedule';

    public StatusCode: number;
    public EndDate: LocalDate;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public StartDate: LocalDate;
    public ID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ProjectTaskID: number;
    public _createguid: string;
    public ScheduleResources: Array<ProjectResourceSchedule>;
    public CustomFields: any;
}


export class BarnepassProduct extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'BarnepassProduct';

    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public ID: number;
    public Deleted: boolean;
    public ProductID: number;
    public CreatedAt: Date;
    public _createguid: string;
    public Product: Product;
    public CustomFields: any;
}


export class Product extends UniEntity {
    public static RelativeUrl = 'products';
    public static EntityType = 'Product';

    public PriceIncVat: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public VariansParentID: number;
    public Unit: string;
    public UpdatedAt: Date;
    public CostPrice: number;
    public Description: string;
    public Type: ProductTypeEnum;
    public PriceExVat: number;
    public ID: number;
    public Name: string;
    public CalculateGrossPriceBasedOnNetPrice: boolean;
    public Deleted: boolean;
    public DefaultProductCategoryID: number;
    public CreatedAt: Date;
    public ListPrice: number;
    public DimensionsID: number;
    public VatTypeID: number;
    public AverageCost: number;
    public ImageFileID: number;
    public PartName: string;
    public AccountID: number;
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

    public StatusCode: number;
    public ToNumber: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Disabled: boolean;
    public UpdatedAt: Date;
    public NumberSeriesTaskID: number;
    public NumberSeriesTypeID: number;
    public Empty: boolean;
    public MainAccountID: number;
    public Comment: string;
    public ID: number;
    public DisplayName: string;
    public Name: string;
    public UseNumbersFromNumberSeriesID: number;
    public Deleted: boolean;
    public NumberLock: boolean;
    public CreatedAt: Date;
    public NextNumber: number;
    public IsDefaultForTask: boolean;
    public AccountYear: number;
    public FromNumber: number;
    public System: boolean;
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
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public NumberSerieTypeAID: number;
    public ID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public _createguid: string;
    public NumberSerieTypeA: NumberSeriesType;
    public NumberSerieTypeB: NumberSeriesType;
    public CustomFields: any;
}


export class NumberSeriesTask extends UniEntity {
    public static RelativeUrl = 'number-series-tasks';
    public static EntityType = 'NumberSeriesTask';

    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public ID: number;
    public EntityType: string;
    public Name: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public _createguid: string;
    public NumberSeries: Array<NumberSeries>;
    public CustomFields: any;
}


export class NumberSeriesType extends UniEntity {
    public static RelativeUrl = 'number-series-types';
    public static EntityType = 'NumberSeriesType';

    public Yearly: boolean;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public CanHaveSeveralActiveSeries: boolean;
    public ID: number;
    public EntitySeriesIDField: string;
    public EntityType: string;
    public Name: string;
    public Deleted: boolean;
    public EntityField: string;
    public CreatedAt: Date;
    public System: boolean;
    public _createguid: string;
    public Series: Array<NumberSeries>;
    public CustomFields: any;
}


export class EncryptionInfo extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'EncryptionInfo';

    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public description: string;
    public type: Type;
    public ID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public password: string;
    public _createguid: string;
    public CustomFields: any;
}


export class File extends UniEntity {
    public static RelativeUrl = 'files/{entitytype}/{entityid}';
    public static EntityType = 'File';

    public StorageReference: string;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public PermaLink: string;
    public Pages: number;
    public Description: string;
    public ID: number;
    public Name: string;
    public OCRData: string;
    public Deleted: boolean;
    public Size: string;
    public Md5: string;
    public CreatedAt: Date;
    public ContentType: string;
    public encryptionID: number;
    public UploadSlot: string;
    public _createguid: string;
    public FileTags: Array<FileTag>;
    public EntityLinks: Array<FileEntityLink>;
    public CustomFields: any;
}


export class FileTag extends UniEntity {
    public static RelativeUrl = 'filetags';
    public static EntityType = 'FileTag';

    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public TagName: string;
    public ID: number;
    public FileID: number;
    public Deleted: boolean;
    public Status: number;
    public CreatedAt: Date;
    public _createguid: string;
    public File: File;
    public CustomFields: any;
}


export class FileEntityLink extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'FileEntityLink';

    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public IsAttachment: boolean;
    public ID: number;
    public EntityType: string;
    public FileID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public EntityID: number;
    public _createguid: string;
    public File: File;
    public CustomFields: any;
}


export class ElsaUsageLog extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ElsaUsageLog';

    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public DateLogged: Date;
    public ProductType: string;
    public ExternalReference: string;
    public ID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public Quantity: number;
    public _createguid: string;
    public CustomFields: any;
}


export class AccessPointFormat extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AccessPointFormat';

    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Label: string;
    public OutgoingID: number;
    public UpdatedAt: Date;
    public ID: number;
    public Name: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public IncommingID: number;
    public ResourceName: string;
    public _createguid: string;
    public CustomFields: any;
}


export class EHFLog extends UniEntity {
    public static RelativeUrl = 'ehf';
    public static EntityType = 'EHFLog';

    public JobRunExternalRef: string;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public EntityDisplayValue: string;
    public UpdatedAt: Date;
    public ExternalMessage: string;
    public Subject: string;
    public Type: SharingType;
    public ExternalReference: string;
    public ID: number;
    public EntityType: string;
    public Deleted: boolean;
    public To: string;
    public DistributeAt: LocalDate;
    public CreatedAt: Date;
    public JobRunID: number;
    public From: string;
    public EntityID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class Department extends UniEntity {
    public static RelativeUrl = 'departments';
    public static EntityType = 'Department';

    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public DepartmentNumber: string;
    public UpdatedAt: Date;
    public Description: string;
    public DepartmentNumberSeriesID: number;
    public ID: number;
    public Name: string;
    public Deleted: boolean;
    public DepartmentManagerName: string;
    public CreatedAt: Date;
    public DepartmentNumberNumeric: number;
    public _createguid: string;
    public DepartmentNumberSeries: NumberSeries;
    public CustomFields: any;
}


export class Dimension10 extends UniEntity {
    public static RelativeUrl = 'Dimension10';
    public static EntityType = 'Dimension10';

    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Number: string;
    public UpdatedAt: Date;
    public NumberNumeric: number;
    public Description: string;
    public ID: number;
    public Name: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class Dimension5 extends UniEntity {
    public static RelativeUrl = 'Dimension5';
    public static EntityType = 'Dimension5';

    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Number: string;
    public UpdatedAt: Date;
    public NumberNumeric: number;
    public Description: string;
    public ID: number;
    public Name: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class Dimension6 extends UniEntity {
    public static RelativeUrl = 'Dimension6';
    public static EntityType = 'Dimension6';

    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Number: string;
    public UpdatedAt: Date;
    public NumberNumeric: number;
    public Description: string;
    public ID: number;
    public Name: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class Dimension7 extends UniEntity {
    public static RelativeUrl = 'Dimension7';
    public static EntityType = 'Dimension7';

    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Number: string;
    public UpdatedAt: Date;
    public NumberNumeric: number;
    public Description: string;
    public ID: number;
    public Name: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class Dimension8 extends UniEntity {
    public static RelativeUrl = 'Dimension8';
    public static EntityType = 'Dimension8';

    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Number: string;
    public UpdatedAt: Date;
    public NumberNumeric: number;
    public Description: string;
    public ID: number;
    public Name: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class Dimension9 extends UniEntity {
    public static RelativeUrl = 'Dimension9';
    public static EntityType = 'Dimension9';

    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Number: string;
    public UpdatedAt: Date;
    public NumberNumeric: number;
    public Description: string;
    public ID: number;
    public Name: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class Dimensions extends UniEntity {
    public static RelativeUrl = 'dimensions';
    public static EntityType = 'Dimensions';

    public Dimension5ID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public Dimension10ID: number;
    public CreatedBy: string;
    public Dimension8ID: number;
    public Dimension7ID: number;
    public UpdatedAt: Date;
    public RegionID: number;
    public Dimension6ID: number;
    public ProjectID: number;
    public ResponsibleID: number;
    public DepartmentID: number;
    public ID: number;
    public Deleted: boolean;
    public Dimension9ID: number;
    public CreatedAt: Date;
    public ProjectTaskID: number;
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
    public ProjectNumber: string;
    public Dimension8Name: string;
    public ProjectTaskNumber: string;
    public Dimension10Name: string;
    public Dimension10Number: string;
    public Dimension6Number: string;
    public ProjectTaskName: string;
    public DepartmentNumber: string;
    public Dimension6Name: string;
    public DepartmentName: string;
    public ResponsibleName: string;
    public RegionName: string;
    public Dimension5Number: string;
    public Dimension9Number: string;
    public ID: number;
    public Dimension7Name: string;
    public ProjectName: string;
    public Dimension8Number: string;
    public DimensionsID: number;
    public Dimension7Number: string;
    public Dimension5Name: string;
    public RegionCode: string;
    public Dimension9Name: string;
}


export class DimensionSettings extends UniEntity {
    public static RelativeUrl = 'dimensionsettings';
    public static EntityType = 'DimensionSettings';

    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Label: string;
    public UpdatedAt: Date;
    public ID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public IsActive: boolean;
    public Dimension: number;
    public _createguid: string;
    public CustomFields: any;
}


export class Region extends UniEntity {
    public static RelativeUrl = 'regions';
    public static EntityType = 'Region';

    public CountryCode: string;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Description: string;
    public ID: number;
    public Name: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public RegionCode: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Responsible extends UniEntity {
    public static RelativeUrl = 'responsibles';
    public static EntityType = 'Responsible';

    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Description: string;
    public NameOfResponsible: string;
    public ID: number;
    public Name: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class Contract extends UniEntity {
    public static RelativeUrl = 'contracts';
    public static EntityType = 'Contract';

    public StatusCode: number;
    public Hash: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Engine: ContractEngine;
    public ContractCode: string;
    public UpdatedAt: Date;
    public Description: string;
    public TeamsUri: string;
    public ID: number;
    public HashTransactionAddress: string;
    public Name: string;
    public Deleted: boolean;
    public CreatedAt: Date;
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
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public ContractID: number;
    public Type: AddressType;
    public Amount: number;
    public ID: number;
    public EntityType: string;
    public Deleted: boolean;
    public ContractAssetID: number;
    public CreatedAt: Date;
    public AssetAddress: string;
    public EntityID: number;
    public _createguid: string;
    public Contract: Contract;
    public ContractAsset: ContractAsset;
    public CustomFields: any;
}


export class ContractAsset extends UniEntity {
    public static RelativeUrl = 'contractassets';
    public static EntityType = 'ContractAsset';

    public IsIssuedByDefinerOnly: boolean;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public IsAutoDestroy: boolean;
    public IsTransferrable: boolean;
    public UpdatedAt: Date;
    public IsPrivate: boolean;
    public ContractID: number;
    public Type: AddressType;
    public ID: number;
    public IsCosignedByDefiner: boolean;
    public Deleted: boolean;
    public IsFixedDenominations: boolean;
    public CreatedAt: Date;
    public Cap: number;
    public SpenderAttested: boolean;
    public _createguid: string;
    public Contract: Contract;
    public CustomFields: any;
}


export class ContractDebugLog extends UniEntity {
    public static RelativeUrl = 'contractdebuglogs';
    public static EntityType = 'ContractDebugLog';

    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public ContractID: number;
    public Type: ContractEventType;
    public ID: number;
    public Deleted: boolean;
    public Message: string;
    public ContractRunLogID: number;
    public CreatedAt: Date;
    public _createguid: string;
    public Contract: Contract;
    public ContractRunLog: ContractRunLog;
    public CustomFields: any;
}


export class ContractParameter extends UniEntity {
    public static RelativeUrl = 'contractparameters';
    public static EntityType = 'ContractParameter';

    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public ContractID: number;
    public ID: number;
    public Name: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public Value: string;
    public _createguid: string;
    public Contract: Contract;
    public CustomFields: any;
}


export class ContractRunLog extends UniEntity {
    public static RelativeUrl = 'contractrunlogs';
    public static EntityType = 'ContractRunLog';

    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public ContractTriggerID: number;
    public UpdatedAt: Date;
    public ContractID: number;
    public Type: ContractEventType;
    public ID: number;
    public Deleted: boolean;
    public Message: string;
    public CreatedAt: Date;
    public RunTime: string;
    public _createguid: string;
    public Contract: Contract;
    public CustomFields: any;
}


export class ContractTransaction extends UniEntity {
    public static RelativeUrl = 'contracttransactions';
    public static EntityType = 'ContractTransaction';

    public ContractAddressID: number;
    public ReceiverAddress: string;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public ContractID: number;
    public Amount: number;
    public ID: number;
    public Deleted: boolean;
    public SenderAddress: string;
    public CreatedAt: Date;
    public AssetAddress: string;
    public _createguid: string;
    public Contract: Contract;
    public ContractAddress: ContractAddress;
    public CustomFields: any;
}


export class ContractTrigger extends UniEntity {
    public static RelativeUrl = 'contracttriggers';
    public static EntityType = 'ContractTrigger';

    public StatusCode: number;
    public ModelFilter: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public ExpressionFilter: string;
    public UpdatedAt: Date;
    public OperationFilter: string;
    public ContractID: number;
    public Type: ContractEventType;
    public ID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public _createguid: string;
    public Contract: Contract;
    public CustomFields: any;
}


export class Comment extends UniEntity {
    public static RelativeUrl = 'comments';
    public static EntityType = 'Comment';

    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public ID: number;
    public EntityType: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public AuthorID: number;
    public EntityID: number;
    public Text: string;
    public _createguid: string;
    public Mentioned: Array<Mentioned>;
    public Author: User;
    public CustomFields: any;
}


export class Mentioned extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Mentioned';

    public UserID: number;
    public CommentID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public ID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public _createguid: string;
    public User: User;
    public CustomFields: any;
}


export class ApiKey extends UniEntity {
    public static RelativeUrl = 'apikeys';
    public static EntityType = 'ApiKey';

    public IntegrationKey: string;
    public StatusCode: number;
    public UpdatedBy: string;
    public ExternalId: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Description: string;
    public ID: number;
    public Url: string;
    public Deleted: boolean;
    public Encrypt: boolean;
    public CreatedAt: Date;
    public IntegrationType: TypeOfIntegration;
    public FilterDate: LocalDate;
    public _createguid: string;
    public CustomFields: any;
}


export class Altinn extends UniEntity {
    public static RelativeUrl = 'altinn';
    public static EntityType = 'Altinn';

    public StatusCode: number;
    public PreferredLogin: TypeOfLogin;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Language: string;
    public UpdatedAt: Date;
    public SystemPw: string;
    public SystemID: string;
    public ID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class AltinnReceipt extends UniEntity {
    public static RelativeUrl = 'altinnreceipts';
    public static EntityType = 'AltinnReceipt';

    public ReceiptID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public XmlReceipt: string;
    public UserSign: string;
    public TimeStamp: Date;
    public ID: number;
    public HasBeenRegistered: boolean;
    public AltinnResponseData: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public Form: string;
    public ErrorText: string;
    public _createguid: string;
    public Signings: Array<AltinnSigning>;
    public CustomFields: any;
}


export class AltinnSigning extends UniEntity {
    public static RelativeUrl = 'altinnsigning';
    public static EntityType = 'AltinnSigning';

    public SignatureReference: string;
    public StatusCode: number;
    public DateSigned: Date;
    public SignatureText: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public AltinnReceiptID: number;
    public UpdatedAt: Date;
    public StatusText: string;
    public ID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public _createguid: string;
    public AltinnReceipt: AltinnReceipt;
    public CustomFields: any;
}


export class Barnepass extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Barnepass';

    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public ID: number;
    public Deleted: boolean;
    public inntektsaar: number;
    public CreatedAt: Date;
    public _createguid: string;
    public oppgave: Array<BarnepassOppgave>;
    public CustomFields: any;
}


export class BarnepassOppgave extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'BarnepassOppgave';

    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public paaloeptBeloep: number;
    public UpdatedAt: Date;
    public ID: number;
    public navn: string;
    public Deleted: boolean;
    public BarnepassID: number;
    public CreatedAt: Date;
    public email: string;
    public foedselsnummer: string;
    public _createguid: string;
    public CustomFields: any;
}


export class UserRole extends UniEntity {
    public static RelativeUrl = 'userroles';
    public static EntityType = 'UserRole';

    public UserID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public SharedRoleId: number;
    public ID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public SharedRoleName: string;
    public _createguid: string;
    public User: User;
    public CustomFields: any;
}


export class Role extends UniEntity {
    public static RelativeUrl = 'roles';
    public static EntityType = 'Role';

    public UpdatedBy: string;
    public CreatedBy: string;
    public Label: string;
    public UpdatedAt: Date;
    public Description: string;
    public ID: number;
    public Name: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public _createguid: string;
    public RolePermissions: Array<RolePermission>;
    public CustomFields: any;
}


export class RolePermission extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'RolePermission';

    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public RoleID: number;
    public ID: number;
    public PermissionID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public _createguid: string;
    public Permission: Permission;
    public Role: Role;
    public CustomFields: any;
}


export class Permission extends UniEntity {
    public static RelativeUrl = 'permissions';
    public static EntityType = 'Permission';

    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public ID: number;
    public Name: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public _createguid: string;
    public RolePermissions: Array<RolePermission>;
    public CustomFields: any;
}


export class ApiMessage extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ApiMessage';

    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public FromDate: Date;
    public UpdatedAt: Date;
    public ToDate: Date;
    public Type: ApiMessageType;
    public ID: number;
    public Deleted: boolean;
    public Message: string;
    public Service: string;
    public CreatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class AvtaleGiroAgreement extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AvtaleGiroAgreement';

    public UpdatedBy: string;
    public CreatedBy: string;
    public KeyPath: string;
    public UpdatedAt: Date;
    public DataSender: string;
    public Description: string;
    public ID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public Thumbprint: string;
    public NextNumber: number;
    public _createguid: string;
    public CustomFields: any;
}


export class AvtaleGiroBankAccount extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AvtaleGiroBankAccount';

    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public ID: number;
    public AvtaleGiroAgreementID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public CompanyID: number;
    public BankAccountNumber: string;
    public _createguid: string;
    public Company: Company;
    public CustomFields: any;
}


export class AvtaleGiroFile extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AvtaleGiroFile';

    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public AvtaleGiroContent: string;
    public ID: number;
    public AvtaleGiroAgreementID: number;
    public FileID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public CompanyID: number;
    public AvtaleGiroMergedFileID: number;
    public _createguid: string;
    public Company: Company;
    public CustomFields: any;
}


export class AvtaleGiroMergedFile extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AvtaleGiroMergedFile';

    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public ID: number;
    public TransmissionNumber: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class BankAgreement extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'BankAgreement';

    public ReceiptID: string;
    public CustomerOrgNumber: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public AccountOwnerOrgNumber: string;
    public OrderEmail: string;
    public CustomerName: string;
    public OrderName: string;
    public ID: number;
    public ReceiptDate: Date;
    public Deleted: boolean;
    public ServiceAccountID: number;
    public CreatedAt: Date;
    public ServiceID: string;
    public OrderMobile: string;
    public CompanyID: number;
    public AccountOwnerName: string;
    public _createguid: string;
    public ServiceAccount: ServiceAccount;
    public Company: Company;
    public Services: Array<BankService>;
    public CustomFields: any;
}


export class BankService extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'BankService';

    public ServiceType: number;
    public KidRule: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public FileType: string;
    public BankAgreementID: number;
    public DivisionName: string;
    public ID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public ConfirmInNetbank: boolean;
    public DivisionID: number;
    public _createguid: string;
    public BankAgreement: BankAgreement;
    public BankAccounts: Array<BankServiceBankAccount>;
    public CustomFields: any;
}


export class BankServiceBankAccount extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'BankServiceBankAccount';

    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public ID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public BankServiceID: number;
    public AccountNumber: string;
    public _createguid: string;
    public BankService: BankService;
    public CustomFields: any;
}


export class Company extends UniEntity {
    public static RelativeUrl = 'companies';
    public static EntityType = 'Company';

    public IsTest: boolean;
    public LastActivity: Date;
    public StatusCode: CompanyStatusCode;
    public OrganizationNumber: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public ClientNumber: number;
    public UpdatedAt: Date;
    public FileFlowOrgnrEmail: string;
    public MigrationVersion: string;
    public WebHookSubscriberId: string;
    public Key: string;
    public IsTemplate: boolean;
    public SchemaName: string;
    public ID: number;
    public Name: string;
    public Deleted: boolean;
    public ConnectionString: string;
    public FileFlowEmail: string;
    public CreatedAt: Date;
    public IsGlobalTemplate: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class CompanyAccess extends UniEntity {
    public static RelativeUrl = 'companies-access';
    public static EntityType = 'CompanyAccess';

    public StatusCode: number;
    public EndDate: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public StartDate: Date;
    public ID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public Roles: string;
    public CompanyID: number;
    public GlobalIdentity: string;
    public _createguid: string;
    public CustomFields: any;
}


export class CompanyBackup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'CompanyBackup';

    public ContainerName: string;
    public CopyFiles: boolean;
    public UpdatedBy: string;
    public CreatedBy: string;
    public ContractType: number;
    public UpdatedAt: Date;
    public CompanyName: string;
    public OrgNumber: string;
    public ContractID: number;
    public CustomerName: string;
    public SchemaName: string;
    public ID: number;
    public ScheduledForDeleteAt: Date;
    public BackupStatus: BackupStatus;
    public CompanyKey: string;
    public Deleted: boolean;
    public Message: string;
    public CloudBlobName: string;
    public DeletedAt: Date;
    public CreatedAt: Date;
    public Reason: string;
    public Environment: string;
    public _createguid: string;
    public CustomFields: any;
}


export class ContractCron extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ContractCron';

    public UpdatedBy: string;
    public CreatedBy: string;
    public ContractTriggerID: number;
    public UpdatedAt: Date;
    public ContractID: number;
    public Expression: string;
    public ID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public CompanyID: number;
    public CompanyDbName: string;
    public CompanyKey: string;
    public _createguid: string;
    public CustomFields: any;
}


export class ContractObyte extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ContractObyte';

    public ContractAddressID: number;
    public Address: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public ContractID: number;
    public ID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public AssetAddress: string;
    public CompanyID: number;
    public CompanyDbName: string;
    public CompanyKey: string;
    public _createguid: string;
    public CustomFields: any;
}


export class DeniedUserAccessLog extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'DeniedUserAccessLog';

    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public CompanyName: string;
    public Username: string;
    public Occurred: Date;
    public ID: number;
    public Deleted: boolean;
    public Message: string;
    public CreatedAt: Date;
    public Email: string;
    public CompanyID: number;
    public _createguid: string;
    public Company: Company;
    public CustomFields: any;
}


export class FailedBankFile extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'FailedBankFile';

    public FileName: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public FailedReason: FailedReasonEnum;
    public ID: number;
    public CompanyKey: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public FileContent: string;
    public _createguid: string;
    public CustomFields: any;
}


export class HangfireJob extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'HangfireJob';

    public HasError: boolean;
    public UpdatedAt: Date;
    public Completed: boolean;
    public JobId: string;
    public Year: number;
    public ID: number;
    public CompanyKey: string;
    public Status: number;
    public CreatedAt: Date;
    public CompanyID: number;
    public GlobalIdentity: string;
    public CustomFields: any;
}


export class HangfireJobContext extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'HangfireJobContext';

    public HasError: boolean;
    public UpdatedAt: Date;
    public Completed: boolean;
    public JobId: string;
    public Year: number;
    public SchemaName: string;
    public ID: number;
    public CompanyKey: string;
    public Status: number;
    public CreatedAt: Date;
    public CompanyID: number;
    public GlobalIdentity: string;
    public CustomFields: any;
}


export class HangfireResponse extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'HangfireResponse';

    public HasError: boolean;
    public UpdatedAt: Date;
    public Completed: boolean;
    public JobId: string;
    public Year: number;
    public ID: number;
    public CompanyKey: string;
    public Status: number;
    public CreatedAt: Date;
    public CompanyID: number;
    public GlobalIdentity: string;
    public State: string;
    public ProgressUrl: string;
    public CustomFields: any;
}


export class KpiDefinition extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'KpiDefinition';

    public Application: string;
    public IsPerUser: boolean;
    public UpdatedBy: string;
    public CreatedBy: string;
    public RefreshModels: string;
    public UpdatedAt: Date;
    public ValueType: KpiValueType;
    public Route: string;
    public ID: number;
    public Name: string;
    public Deleted: boolean;
    public RoleNames: string;
    public Interval: string;
    public CreatedAt: Date;
    public CompanyID: number;
    public SourceType: KpiSourceType;
    public _createguid: string;
    public CustomFields: any;
}


export class KpiValue extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'KpiValue';

    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public KpiDefinitionID: number;
    public KpiName: string;
    public Total: number;
    public UserIdentity: string;
    public LastUpdated: Date;
    public Counter: number;
    public ID: number;
    public Deleted: boolean;
    public ValueStatus: KpiValueStatus;
    public CreatedAt: Date;
    public CompanyID: number;
    public Text: string;
    public _createguid: string;
    public CustomFields: any;
}


export class OutgoingInvoice extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'OutgoingInvoice';

    public InvoiceType: OutgoingInvoiceType;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public RecipientOrganizationNumber: string;
    public InvoiceID: number;
    public RecipientPhoneNumber: string;
    public MetaJson: string;
    public Amount: number;
    public ExternalReference: string;
    public ID: number;
    public DueDate: Date;
    public Deleted: boolean;
    public Status: number;
    public CreatedAt: Date;
    public ISPOrganizationNumber: string;
    public CompanyID: number;
    public _createguid: string;
    public Company: Company;
    public CustomFields: any;
}


export class ProcessFileLog extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ProcessFileLog';

    public FileName: string;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public EntityName: string;
    public UpdatedAt: Date;
    public FileType: number;
    public CompanyName: string;
    public UserIdentity: string;
    public ID: number;
    public CompanyKey: string;
    public FileID: number;
    public Deleted: boolean;
    public Message: string;
    public CreatedAt: Date;
    public EntityCount: number;
    public CompanyID: number;
    public EntityInstanceID: string;
    public _createguid: string;
    public Company: Company;
    public CustomFields: any;
}


export class ServiceAccount extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ServiceAccount';

    public UpdatedBy: string;
    public CreatedBy: string;
    public KeyPath: string;
    public UpdatedAt: Date;
    public DataSender: string;
    public Description: string;
    public ID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public Thumbprint: string;
    public NextNumber: number;
    public _createguid: string;
    public CustomFields: any;
}


export class UserVerification extends UniEntity {
    public static RelativeUrl = 'user-verifications';
    public static EntityType = 'UserVerification';

    public UserId: number;
    public StatusCode: number;
    public VerificationCode: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public VerificationDate: Date;
    public ExpirationDate: Date;
    public ID: number;
    public DisplayName: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public Email: string;
    public CompanyId: number;
    public _createguid: string;
    public CustomFields: any;
}


export class Account extends UniEntity {
    public static RelativeUrl = 'accounts';
    public static EntityType = 'Account';

    public LockManualPosts: boolean;
    public CostAllocationID: number;
    public AccountName: string;
    public StatusCode: number;
    public Keywords: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public DoSynchronize: boolean;
    public SystemAccount: boolean;
    public CustomerID: number;
    public AccountGroupID: number;
    public EmployeeID: number;
    public CurrencyCodeID: number;
    public UpdatedAt: Date;
    public Visible: boolean;
    public Description: string;
    public ID: number;
    public TopLevelAccountGroupID: number;
    public Locked: boolean;
    public Active: boolean;
    public Deleted: boolean;
    public SupplierID: number;
    public AccountSetupID: number;
    public CreatedAt: Date;
    public DimensionsID: number;
    public VatTypeID: number;
    public UsePostPost: boolean;
    public UseVatDeductionGroupID: number;
    public SaftMappingAccountID: number;
    public AccountID: number;
    public AccountNumber: number;
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

    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public ID: number;
    public Name: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public AccountID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class AccountGroup extends UniEntity {
    public static RelativeUrl = 'accountgroups';
    public static EntityType = 'AccountGroup';

    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public AccountGroupSetupID: number;
    public UpdatedAt: Date;
    public GroupNumber: string;
    public MainGroupID: number;
    public CompatibleAccountID: number;
    public ID: number;
    public Name: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public AccountGroupSetID: number;
    public Summable: boolean;
    public AccountID: number;
    public _createguid: string;
    public MainGroup: AccountGroup;
    public AccountGroupSet: AccountGroupSet;
    public CustomFields: any;
}


export class AccountGroupSet extends UniEntity {
    public static RelativeUrl = 'accountgroupsets';
    public static EntityType = 'AccountGroupSet';

    public ToAccountNumber: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public SubAccountAllowed: boolean;
    public ID: number;
    public Name: string;
    public Deleted: boolean;
    public FromAccountNumber: number;
    public Shared: boolean;
    public CreatedAt: Date;
    public System: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class AccountMandatoryDimension extends UniEntity {
    public static RelativeUrl = 'accountmandatorydimension';
    public static EntityType = 'AccountMandatoryDimension';

    public StatusCode: number;
    public DimensionNo: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public ID: number;
    public Deleted: boolean;
    public MandatoryType: number;
    public CreatedAt: Date;
    public AccountID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class Accrual extends UniEntity {
    public static RelativeUrl = 'accruals';
    public static EntityType = 'Accrual';

    public BalanceAccountID: number;
    public StatusCode: number;
    public ResultAccountID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public AccrualJournalEntryMode: number;
    public ID: number;
    public JournalEntryLineDraftID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public AccrualAmount: number;
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

    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public PeriodNo: number;
    public Amount: number;
    public ID: number;
    public JournalEntryDraftLineID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public AccrualID: number;
    public AccountYear: number;
    public _createguid: string;
    public Accrual: Accrual;
    public JournalEntryLineDraft: JournalEntryLineDraft;
    public CustomFields: any;
}


export class ApprovalData extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ApprovalData';

    public EntityHash: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public EntityName: string;
    public UpdatedAt: Date;
    public VerificationReference: string;
    public ID: number;
    public VerificationMethod: string;
    public EntityReference: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public EntityCount: number;
    public EntityID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class Asset extends UniEntity {
    public static RelativeUrl = 'assets';
    public static EntityType = 'Asset';

    public BalanceAccountID: number;
    public StatusCode: number;
    public AssetGroupCode: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public ScrapValue: number;
    public NetFinancialValue: number;
    public UpdatedAt: Date;
    public DepreciationCycle: number;
    public PurchaseAmount: number;
    public ID: number;
    public Name: string;
    public Deleted: boolean;
    public DepreciationAccountID: number;
    public AutoDepreciation: boolean;
    public CreatedAt: Date;
    public DimensionsID: number;
    public Lifetime: number;
    public PurchaseDate: LocalDate;
    public DepreciationStartDate: LocalDate;
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

    public StatusCode: number;
    public EmailID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public AddressID: number;
    public InitialBIC: string;
    public UpdatedAt: Date;
    public PhoneID: number;
    public BIC: string;
    public ID: number;
    public Name: string;
    public Deleted: boolean;
    public Web: string;
    public CreatedAt: Date;
    public _createguid: string;
    public Address: Address;
    public Phone: Phone;
    public Email: Email;
    public CustomFields: any;
}


export class BankAccount extends UniEntity {
    public static RelativeUrl = 'bankaccounts';
    public static EntityType = 'BankAccount';

    public StatusCode: number;
    public BankID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Label: string;
    public CompanySettingsID: number;
    public UpdatedAt: Date;
    public IntegrationStatus: number;
    public IntegrationSettings: string;
    public ID: number;
    public Locked: boolean;
    public BankAccountType: string;
    public Deleted: boolean;
    public IBAN: string;
    public CreatedAt: Date;
    public BusinessRelationID: number;
    public AccountID: number;
    public AccountNumber: string;
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

    public StatusCode: number;
    public PropertiesJson: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public IsOutgoing: boolean;
    public UpdatedAt: Date;
    public BankAccountID: number;
    public ServiceProvider: number;
    public BankAcceptance: boolean;
    public IsInbound: boolean;
    public ServiceTemplateID: string;
    public ID: number;
    public Name: string;
    public DefaultAgreement: boolean;
    public Deleted: boolean;
    public HasNewAccountInformation: boolean;
    public CreatedAt: Date;
    public Email: string;
    public ServiceID: string;
    public IsBankBalance: boolean;
    public HasOrderedIntegrationChange: boolean;
    public _createguid: string;
    public Password: string;
    public BankAccount: BankAccount;
    public CustomFields: any;
}


export class BankRule extends UniEntity {
    public static RelativeUrl = 'bankrules';
    public static EntityType = 'BankRule';

    public StatusCode: number;
    public ActionCode: ActionCodeBankRule;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Priority: number;
    public UpdatedAt: Date;
    public ID: number;
    public Rule: string;
    public Name: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public IsActive: boolean;
    public AccountID: number;
    public _createguid: string;
    public Account: Account;
    public CustomFields: any;
}


export class BankStatement extends UniEntity {
    public static RelativeUrl = 'bankstatements';
    public static EntityType = 'BankStatement';

    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public FromDate: LocalDate;
    public UpdatedAt: Date;
    public EndBalance: number;
    public BankAccountID: number;
    public ToDate: LocalDate;
    public Amount: number;
    public ID: number;
    public FileID: number;
    public Deleted: boolean;
    public ArchiveReference: string;
    public CreatedAt: Date;
    public StartBalance: number;
    public CurrencyCode: string;
    public AmountCurrency: number;
    public AccountID: number;
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

    public TransactionId: string;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public ValueDate: LocalDate;
    public Category: string;
    public StructuredReference: string;
    public Description: string;
    public OpenAmountCurrency: number;
    public Amount: number;
    public ID: number;
    public Deleted: boolean;
    public SenderAccount: string;
    public Receivername: string;
    public OpenAmount: number;
    public BankStatementID: number;
    public BookingDate: LocalDate;
    public ArchiveReference: string;
    public CreatedAt: Date;
    public CurrencyCode: string;
    public CID: string;
    public SenderName: string;
    public InvoiceNumber: string;
    public ReceiverAccount: string;
    public AmountCurrency: number;
    public _createguid: string;
    public BankStatement: BankStatement;
    public CustomFields: any;
}


export class BankStatementMatch extends UniEntity {
    public static RelativeUrl = 'bankstatementmatch';
    public static EntityType = 'BankStatementMatch';

    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public BankStatementEntryID: number;
    public UpdatedAt: Date;
    public Batch: string;
    public Group: string;
    public JournalEntryLineID: number;
    public Amount: number;
    public ID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public _createguid: string;
    public BankStatementEntry: BankStatementEntry;
    public JournalEntryLine: JournalEntryLine;
    public CustomFields: any;
}


export class BankStatementRule extends UniEntity {
    public static RelativeUrl = 'bankstatementrules';
    public static EntityType = 'BankStatementRule';

    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Priority: number;
    public UpdatedAt: Date;
    public ID: number;
    public Rule: string;
    public EntryText: string;
    public Name: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public DimensionsID: number;
    public IsActive: boolean;
    public AccountID: number;
    public _createguid: string;
    public Dimensions: Dimensions;
    public Account: Account;
    public CustomFields: any;
}


export class Budget extends UniEntity {
    public static RelativeUrl = 'budgets';
    public static EntityType = 'Budget';

    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public ID: number;
    public Name: string;
    public Deleted: boolean;
    public AccountingYear: number;
    public CreatedAt: Date;
    public _createguid: string;
    public Entries: Array<BudgetEntry>;
    public CustomFields: any;
}


export class BudgetEntry extends UniEntity {
    public static RelativeUrl = 'budgetentries';
    public static EntityType = 'BudgetEntry';

    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public PeriodNumber: number;
    public Amount: number;
    public ID: number;
    public Deleted: boolean;
    public BudgetID: number;
    public CreatedAt: Date;
    public DimensionsID: number;
    public AccountID: number;
    public _createguid: string;
    public Budget: Budget;
    public Account: Account;
    public Dimensions: Dimensions;
    public CustomFields: any;
}


export class CompanyAccountingSettings extends UniEntity {
    public static RelativeUrl = 'companyaccountingsettings';
    public static EntityType = 'CompanyAccountingSettings';

    public ReInvoicingTurnoverProductID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public ReInvoicingCostsharingProductID: number;
    public AssetSaleProductID: number;
    public AssetSaleLossNoVatAccountID: number;
    public ID: number;
    public Deleted: boolean;
    public AssetWriteoffAccountID: number;
    public ReInvoicingMethod: number;
    public AssetSaleLossVatAccountID: number;
    public CreatedAt: Date;
    public AssetSaleProfitVatAccountID: number;
    public AssetSaleProfitBalancingAccountID: number;
    public AssetSaleLossBalancingAccountID: number;
    public AssetSaleProfitNoVatAccountID: number;
    public _createguid: string;
    public ReInvoicingCostsharingProduct: Product;
    public ReInvoicingTurnoverProduct: Product;
    public CustomFields: any;
}


export class CompanyBankAccount extends UniEntity {
    public static RelativeUrl = 'companybankaccounts';
    public static EntityType = 'CompanyBankAccount';

    public IsSalary: boolean;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public IsOutgoing: boolean;
    public IsTax: boolean;
    public UpdatedAt: Date;
    public BankAccountID: number;
    public ID: number;
    public Name: string;
    public IsIncomming: boolean;
    public Deleted: boolean;
    public CreatedAt: Date;
    public CreditAmount: number;
    public AccountID: number;
    public _createguid: string;
    public BankAccount: BankAccount;
    public Account: Account;
    public CustomFields: any;
}


export class CostAllocation extends UniEntity {
    public static RelativeUrl = 'costallocations';
    public static EntityType = 'CostAllocation';

    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public ID: number;
    public Name: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public _createguid: string;
    public Items: Array<CostAllocationItem>;
    public CustomFields: any;
}


export class CostAllocationItem extends UniEntity {
    public static RelativeUrl = 'costallocationitems';
    public static EntityType = 'CostAllocationItem';

    public CostAllocationID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Description: string;
    public Percent: number;
    public Amount: number;
    public ID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public DimensionsID: number;
    public VatTypeID: number;
    public AccountID: number;
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
    public StatusCode: number;
    public EndDate: LocalDate;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CurrencyCodeID: number;
    public UpdatedAt: Date;
    public Description: string;
    public Amount: number;
    public ID: number;
    public DueDate: LocalDate;
    public Deleted: boolean;
    public IsCustomerPayment: boolean;
    public CreatedAt: Date;
    public AmountCurrency: number;
    public _createguid: string;
    public currency: CurrencyCode;
    public CustomFields: any;
}


export class DepreciationLine extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'DepreciationLine';

    public DepreciationJELineID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public AssetJELineID: number;
    public CreatedBy: string;
    public DepreciationType: number;
    public UpdatedAt: Date;
    public AssetID: number;
    public ID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public _createguid: string;
    public DepreciationJELine: JournalEntryLine;
    public AssetJELine: JournalEntryLine;
    public CustomFields: any;
}


export class FinancialYear extends UniEntity {
    public static RelativeUrl = 'financialyears';
    public static EntityType = 'FinancialYear';

    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public ValidFrom: LocalDate;
    public ValidTo: LocalDate;
    public Year: number;
    public ID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class JournalEntry extends UniEntity {
    public static RelativeUrl = 'journalentries';
    public static EntityType = 'JournalEntry';

    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public NumberSeriesTaskID: number;
    public Description: string;
    public FinancialYearID: number;
    public JournalEntryNumber: string;
    public ID: number;
    public JournalEntryDraftGroup: string;
    public Deleted: boolean;
    public NumberSeriesID: number;
    public CreatedAt: Date;
    public JournalEntryNumberNumeric: number;
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

    public PaymentInfoTypeID: number;
    public CustomerInvoiceID: number;
    public StatusCode: number;
    public ReferenceCreditPostID: number;
    public PeriodID: number;
    public VatJournalEntryPostID: number;
    public VatReportID: number;
    public SubAccountID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public VatDate: LocalDate;
    public PaymentID: string;
    public CurrencyCodeID: number;
    public UpdatedAt: Date;
    public JournalEntryID: number;
    public PostPostJournalEntryLineID: number;
    public Description: string;
    public CurrencyExchangeRate: number;
    public FinancialDate: LocalDate;
    public RestAmount: number;
    public TaxBasisAmount: number;
    public JournalEntryNumber: string;
    public RegisteredDate: LocalDate;
    public Amount: number;
    public VatPeriodID: number;
    public ID: number;
    public DueDate: LocalDate;
    public PaymentReferenceID: number;
    public OriginalReferencePostID: number;
    public TaxBasisAmountCurrency: number;
    public JournalEntryLineDraftID: number;
    public RestAmountCurrency: number;
    public Deleted: boolean;
    public JournalEntryTypeID: number;
    public CreatedAt: Date;
    public OriginalJournalEntryPost: number;
    public VatDeductionPercent: number;
    public Signature: string;
    public AccrualID: number;
    public DimensionsID: number;
    public VatTypeID: number;
    public BatchNumber: number;
    public ReferenceOriginalPostID: number;
    public SupplierInvoiceID: number;
    public CustomerOrderID: number;
    public JournalEntryNumberNumeric: number;
    public InvoiceNumber: string;
    public VatPercent: number;
    public AmountCurrency: number;
    public AccountID: number;
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

    public PaymentInfoTypeID: number;
    public CustomerInvoiceID: number;
    public StatusCode: number;
    public PeriodID: number;
    public SubAccountID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public VatDate: LocalDate;
    public PaymentID: string;
    public CurrencyCodeID: number;
    public UpdatedAt: Date;
    public JournalEntryID: number;
    public PostPostJournalEntryLineID: number;
    public Description: string;
    public CurrencyExchangeRate: number;
    public FinancialDate: LocalDate;
    public TaxBasisAmount: number;
    public JournalEntryNumber: string;
    public RegisteredDate: LocalDate;
    public Amount: number;
    public VatPeriodID: number;
    public ID: number;
    public DueDate: LocalDate;
    public PaymentReferenceID: number;
    public TaxBasisAmountCurrency: number;
    public Deleted: boolean;
    public JournalEntryTypeID: number;
    public CreatedAt: Date;
    public VatDeductionPercent: number;
    public Signature: string;
    public AccrualID: number;
    public DimensionsID: number;
    public VatTypeID: number;
    public BatchNumber: number;
    public SupplierInvoiceID: number;
    public CustomerOrderID: number;
    public JournalEntryNumberNumeric: number;
    public InvoiceNumber: string;
    public VatPercent: number;
    public AmountCurrency: number;
    public AccountID: number;
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

    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public TraceLinkTypes: string;
    public ColumnSetUp: string;
    public ID: number;
    public Name: string;
    public Deleted: boolean;
    public VisibleModules: string;
    public CreatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class JournalEntrySourceSerie extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'JournalEntrySourceSerie';

    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public ID: number;
    public JournalEntrySourceID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public _createguid: string;
    public JournalEntrySourceEntityName: string;
    public JournalEntrySourceInstanceID: number;
    public CustomFields: any;
}


export class JournalEntryType extends UniEntity {
    public static RelativeUrl = 'journalentrytypes';
    public static EntityType = 'JournalEntryType';

    public UpdatedBy: string;
    public CreatedBy: string;
    public Number: number;
    public UpdatedAt: Date;
    public ExpectNegativeAmount: boolean;
    public MainName: string;
    public ID: number;
    public DisplayName: string;
    public Name: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class LedgerSuggestion extends UniEntity {
    public IndustryCode: string;
    public IndustryName: string;
    public BusinessType: string;
    public OrgNumber: string;
    public ID: number;
    public Name: string;
    public Source: SuggestionSource;
}


export class Payment extends UniEntity {
    public static RelativeUrl = 'payments';
    public static EntityType = 'Payment';

    public ExternalBankAccountNumber: string;
    public CustomerInvoiceID: number;
    public StatusCode: number;
    public Domain: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public PaymentID: string;
    public FromBankAccountID: number;
    public CustomerInvoiceReminderID: number;
    public Debtor: string;
    public CurrencyCodeID: number;
    public UpdatedAt: Date;
    public BankChargeAmount: number;
    public IsExternal: boolean;
    public StatusText: string;
    public InPaymentID: string;
    public SerialNumberOrAcctSvcrRef: string;
    public JournalEntryID: number;
    public Description: string;
    public CurrencyExchangeRate: number;
    public XmlTagPmtInfIdReference: string;
    public PaymentCodeID: number;
    public PaymentBatchID: number;
    public ReconcilePayment: boolean;
    public PaymentNotificationReportFileID: number;
    public Amount: number;
    public ID: number;
    public DueDate: LocalDate;
    public Deleted: boolean;
    public XmlTagEndToEndIdReference: string;
    public PaymentStatusReportFileID: number;
    public AutoJournal: boolean;
    public IsCustomerPayment: boolean;
    public Proprietary: string;
    public CreatedAt: Date;
    public PaymentDate: LocalDate;
    public IsPaymentCancellationRequest: boolean;
    public IsPaymentClaim: boolean;
    public SupplierInvoiceID: number;
    public BusinessRelationID: number;
    public OcrPaymentStrings: string;
    public ToBankAccountID: number;
    public InvoiceNumber: string;
    public AmountCurrency: number;
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

    public PaymentBatchTypeID: number;
    public Camt054CMsgId: string;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public NumberOfPayments: number;
    public TotalAmount: number;
    public PaymentFileID: number;
    public ID: number;
    public ReceiptDate: Date;
    public PaymentReferenceID: string;
    public HashValue: string;
    public Deleted: boolean;
    public OcrTransmissionNumber: number;
    public PaymentStatusReportFileID: number;
    public IsCustomerPayment: boolean;
    public CreatedAt: Date;
    public OcrHeadingStrings: string;
    public TransferredDate: Date;
    public _createguid: string;
    public Payments: Array<Payment>;
    public PaymentBatchType: PaymentBatchType;
    public CustomFields: any;
}


export class PostPost extends UniEntity {
    public static RelativeUrl = 'postposts';
    public static EntityType = 'PostPost';

    public Date: LocalDate;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CurrencyCodeID: number;
    public UpdatedAt: Date;
    public CurrencyExchangeRate: number;
    public Amount: number;
    public ID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public JournalEntryLine1ID: number;
    public AmountCurrency: number;
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

    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public OwnCostShare: number;
    public UpdatedAt: Date;
    public OwnCostAmount: number;
    public ReInvoicingType: number;
    public ID: number;
    public Deleted: boolean;
    public TaxExclusiveAmount: number;
    public ProductID: number;
    public CreatedAt: Date;
    public TaxInclusiveAmount: number;
    public SupplierInvoiceID: number;
    public _createguid: string;
    public SupplierInvoice: SupplierInvoice;
    public Product: Product;
    public Items: Array<ReInvoiceItem>;
    public CustomFields: any;
}


export class ReInvoiceItem extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ReInvoiceItem';

    public StatusCode: number;
    public UpdatedBy: string;
    public Share: number;
    public CreatedBy: string;
    public CustomerID: number;
    public UpdatedAt: Date;
    public GrossAmount: number;
    public NetAmount: number;
    public ID: number;
    public Deleted: boolean;
    public Surcharge: number;
    public CreatedAt: Date;
    public Vat: number;
    public ReInvoiceID: number;
    public _createguid: string;
    public Customer: Customer;
    public CustomFields: any;
}


export class SupplierInvoice extends UniEntity {
    public static RelativeUrl = 'supplierinvoices';
    public static EntityType = 'SupplierInvoice';

    public PayableRoundingCurrencyAmount: number;
    public InvoiceType: number;
    public PaymentStatus: number;
    public CustomerOrgNumber: string;
    public StatusCode: number;
    public ShippingCountry: string;
    public CustomerPerson: string;
    public AmountRegards: string;
    public VatTotalsAmount: number;
    public OurReference: string;
    public InvoicePostalCode: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public ShippingCountryCode: string;
    public InvoiceCountry: string;
    public InternalNote: string;
    public Requisition: string;
    public PaymentID: string;
    public VatTotalsAmountCurrency: number;
    public CreditedAmount: number;
    public CurrencyCodeID: number;
    public UpdatedAt: Date;
    public DefaultDimensionsID: number;
    public BankAccountID: number;
    public InvoiceCity: string;
    public JournalEntryID: number;
    public DeliveryName: string;
    public InvoiceAddressLine1: string;
    public CurrencyExchangeRate: number;
    public Credited: boolean;
    public RestAmount: number;
    public DeliveryMethod: string;
    public ReInvoiced: boolean;
    public TaxExclusiveAmountCurrency: number;
    public DeliveryTerm: string;
    public InvoiceDate: LocalDate;
    public ProjectID: number;
    public TaxInclusiveAmountCurrency: number;
    public SalesPerson: string;
    public Comment: string;
    public ID: number;
    public CreditedAmountCurrency: number;
    public Payment: string;
    public RestAmountCurrency: number;
    public Deleted: boolean;
    public PaymentTerm: string;
    public ShippingCity: string;
    public YourReference: string;
    public PaymentTermsID: number;
    public TaxExclusiveAmount: number;
    public PaymentInformation: string;
    public SupplierID: number;
    public ShippingAddressLine1: string;
    public DeliveryTermsID: number;
    public CreatedAt: Date;
    public InvoiceAddressLine2: string;
    public ShippingAddressLine2: string;
    public DeliveryDate: LocalDate;
    public InvoiceCountryCode: string;
    public SupplierOrgNumber: string;
    public PaymentDueDate: LocalDate;
    public InvoiceReferenceID: number;
    public IsSentToPayment: boolean;
    public InvoiceAddressLine3: string;
    public TaxInclusiveAmount: number;
    public ShippingPostalCode: string;
    public ReInvoiceID: number;
    public CreditDays: number;
    public PayableRoundingAmount: number;
    public FreeTxt: string;
    public InvoiceNumber: string;
    public InvoiceOriginType: SupplierInvoiceOriginType;
    public ShippingAddressLine3: string;
    public PrintStatus: number;
    public InvoiceReceiverName: string;
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

    public NumberOfItems: number;
    public PriceIncVat: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public SumTotalExVatCurrency: number;
    public SumTotalIncVat: number;
    public Discount: number;
    public AccountingCost: string;
    public Unit: string;
    public CurrencyCodeID: number;
    public UpdatedAt: Date;
    public SumVatCurrency: number;
    public InvoicePeriodEndDate: LocalDate;
    public CurrencyExchangeRate: number;
    public ItemText: string;
    public SortIndex: number;
    public PriceSetByUser: boolean;
    public DiscountPercent: number;
    public PriceExVat: number;
    public SumTotalIncVatCurrency: number;
    public Comment: string;
    public ID: number;
    public CalculateGrossPriceBasedOnNetPrice: boolean;
    public Deleted: boolean;
    public DiscountCurrency: number;
    public ProductID: number;
    public SumTotalExVat: number;
    public CreatedAt: Date;
    public SumVat: number;
    public DimensionsID: number;
    public VatTypeID: number;
    public SupplierInvoiceID: number;
    public VatPercent: number;
    public InvoicePeriodStartDate: LocalDate;
    public PriceExVatCurrency: number;
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

    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public No: string;
    public ID: number;
    public Name: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class VatDeduction extends UniEntity {
    public static RelativeUrl = 'vatdeductions';
    public static EntityType = 'VatDeduction';

    public VatDeductionGroupID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public ValidFrom: LocalDate;
    public DeductionPercent: number;
    public ValidTo: LocalDate;
    public ID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public _createguid: string;
    public VatDeductionGroup: VatDeductionGroup;
    public CustomFields: any;
}


export class VatDeductionGroup extends UniEntity {
    public static RelativeUrl = 'vatdeductiongroups';
    public static EntityType = 'VatDeductionGroup';

    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public ID: number;
    public Name: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class VatPost extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'VatPost';

    public ReportAsNegativeAmount: boolean;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public VatCodeGroupID: number;
    public UpdatedAt: Date;
    public No: string;
    public HasTaxBasis: boolean;
    public ID: number;
    public Name: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public HasTaxAmount: boolean;
    public _createguid: string;
    public VatCodeGroup: VatCodeGroup;
    public VatReportReferences: Array<VatReportReference>;
    public CustomFields: any;
}


export class VatReport extends UniEntity {
    public static RelativeUrl = 'vatreports';
    public static EntityType = 'VatReport';

    public VatReportArchivedSummaryID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public Title: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public JournalEntryID: number;
    public VatReportTypeID: number;
    public ReportedDate: Date;
    public Comment: string;
    public ID: number;
    public Deleted: boolean;
    public ExecutedDate: Date;
    public CreatedAt: Date;
    public InternalComment: string;
    public ExternalRefNo: string;
    public TerminPeriodID: number;
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

    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public PaymentID: string;
    public UpdatedAt: Date;
    public ReportName: string;
    public ID: number;
    public PaymentBankAccountNumber: string;
    public Deleted: boolean;
    public PaymentPeriod: string;
    public AmountToBeReceived: number;
    public CreatedAt: Date;
    public SummaryHeader: string;
    public PaymentToDescription: string;
    public PaymentDueDate: Date;
    public PaymentYear: number;
    public AmountToBePayed: number;
    public _createguid: string;
    public CustomFields: any;
}


export class VatReportReference extends UniEntity {
    public static RelativeUrl = 'vatreportreferences';
    public static EntityType = 'VatReportReference';

    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public VatPostID: number;
    public UpdatedAt: Date;
    public ID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public VatTypeID: number;
    public AccountID: number;
    public _createguid: string;
    public VatType: VatType;
    public VatPost: VatPost;
    public Account: Account;
    public CustomFields: any;
}


export class VatReportType extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'VatReportType';

    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public ID: number;
    public Name: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class VatType extends UniEntity {
    public static RelativeUrl = 'vattypes';
    public static EntityType = 'VatType';

    public InUse: boolean;
    public StatusCode: number;
    public IncomingAccountID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public VatCodeGroupID: number;
    public UpdatedAt: Date;
    public Visible: boolean;
    public OutgoingAccountID: number;
    public VatCode: string;
    public VatCodeGroupingValue: VatCodeGroupingValueEnum;
    public DirectJournalEntryOnly: boolean;
    public ID: number;
    public Locked: boolean;
    public Alias: string;
    public Name: string;
    public ReversedTaxDutyVat: boolean;
    public Deleted: boolean;
    public AvailableInModules: boolean;
    public OutputVat: boolean;
    public VatTypeSetupID: number;
    public CreatedAt: Date;
    public _createguid: string;
    public VatPercent: number;
    public VatTypePercentages: Array<VatTypePercentage>;
    public VatCodeGroup: VatCodeGroup;
    public OutgoingAccount: Account;
    public IncomingAccount: Account;
    public VatReportReferences: Array<VatReportReference>;
    public CustomFields: any;
}


export class VatTypePercentage extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'VatTypePercentage';

    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public ValidFrom: LocalDate;
    public ValidTo: LocalDate;
    public ID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public VatTypeID: number;
    public VatPercent: number;
    public _createguid: string;
    public CustomFields: any;
}


export class EntityValidationRule extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'EntityValidationRule';

    public Operation: OperationType;
    public UpdatedBy: string;
    public CreatedBy: string;
    public ChangedByCompany: boolean;
    public UpdatedAt: Date;
    public SyncKey: string;
    public OnConflict: OnConflict;
    public ID: number;
    public EntityType: string;
    public Deleted: boolean;
    public Message: string;
    public Level: ValidationLevel;
    public CreatedAt: Date;
    public Value: string;
    public PropertyName: string;
    public Operator: Operator;
    public System: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class EntityValidationRuleTemplate extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'EntityValidationRuleTemplate';

    public Operation: OperationType;
    public UpdatedBy: string;
    public CreatedBy: string;
    public ChangedByCompany: boolean;
    public UpdatedAt: Date;
    public SyncKey: string;
    public OnConflict: OnConflict;
    public ID: number;
    public EntityType: string;
    public Deleted: boolean;
    public Message: string;
    public Level: ValidationLevel;
    public CreatedAt: Date;
    public Value: string;
    public PropertyName: string;
    public Operator: Operator;
    public System: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class ComplexValidationRule extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ComplexValidationRule';

    public Operation: OperationType;
    public UpdatedBy: string;
    public CreatedBy: string;
    public ChangedByCompany: boolean;
    public UpdatedAt: Date;
    public SyncKey: string;
    public OnConflict: OnConflict;
    public ID: number;
    public EntityType: string;
    public Deleted: boolean;
    public Message: string;
    public Level: ValidationLevel;
    public CreatedAt: Date;
    public ValidationCode: number;
    public System: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class ComplexValidationRuleTemplate extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ComplexValidationRuleTemplate';

    public Operation: OperationType;
    public UpdatedBy: string;
    public CreatedBy: string;
    public ChangedByCompany: boolean;
    public UpdatedAt: Date;
    public SyncKey: string;
    public OnConflict: OnConflict;
    public ID: number;
    public EntityType: string;
    public Deleted: boolean;
    public Message: string;
    public Level: ValidationLevel;
    public CreatedAt: Date;
    public ValidationCode: number;
    public System: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class CustomField extends UniEntity {
    public static RelativeUrl = 'custom-fields';
    public static EntityType = 'CustomField';

    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Nullable: boolean;
    public UpdatedAt: Date;
    public ModelID: number;
    public ID: number;
    public DataType: string;
    public Name: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class ValueList extends UniEntity {
    public static RelativeUrl = 'valuelists';
    public static EntityType = 'ValueList';

    public Code: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Description: string;
    public ID: number;
    public Name: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public _createguid: string;
    public Items: Array<ValueItem>;
    public CustomFields: any;
}


export class ValueItem extends UniEntity {
    public static RelativeUrl = 'valueitems';
    public static EntityType = 'ValueItem';

    public Code: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public ValueListID: number;
    public Description: string;
    public Index: number;
    public ID: number;
    public Name: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public Value: string;
    public _createguid: string;
    public ValueList: ValueList;
    public CustomFields: any;
}


export class ComponentLayoutDto extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ComponentLayoutDto';

    public BaseEntity: string;
    public Name: string;
    public Url: string;
    public Fields: Array<FieldLayoutDto>;
    public CustomFields: any;
}


export class FieldLayoutDto extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'FieldLayoutDto';

    public Width: string;
    public Combo: number;
    public ValueList: string;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Label: string;
    public ReadOnly: boolean;
    public Sectionheader: string;
    public UpdatedAt: Date;
    public LineBreak: boolean;
    public Hidden: boolean;
    public Section: number;
    public Description: string;
    public LookupEntityType: string;
    public Placement: number;
    public ID: number;
    public Placeholder: string;
    public EntityType: string;
    public Url: string;
    public Deleted: boolean;
    public Options: string;
    public CreatedAt: Date;
    public ComponentLayoutID: number;
    public HelpText: string;
    public Property: string;
    public Legend: string;
    public LookupField: boolean;
    public FieldSet: number;
    public FieldType: FieldType;
    public Alignment: Alignment;
    public DisplayField: string;
    public _createguid: string;
    public Validations: Array<EntityValidationRule>;
    public CustomFields: any;
}


export class AssignmentDetails extends UniEntity {
    public Message: string;
}


export class TimeSheet extends UniEntity {
    public Workflow: TimesheetWorkflow;
    public FromDate: Date;
    public ToDate: Date;
    public Relation: WorkRelation;
    public Items: Array<TimeSheetItem>;
}


export class TimeSheetItem extends UniEntity {
    public WeekDay: number;
    public Date: Date;
    public ExpectedTime: number;
    public Workflow: TimesheetWorkflow;
    public Projecttime: number;
    public EndTime: Date;
    public SickTime: number;
    public TotalTime: number;
    public WeekNumber: number;
    public StartTime: Date;
    public Flextime: number;
    public TimeOff: number;
    public Overtime: number;
    public Invoicable: number;
    public Status: WorkStatus;
    public ValidTime: number;
    public ValidTimeOff: number;
    public IsWeekend: boolean;
}


export class WorkBalanceDto extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'WorkBalanceDto';

    public LastDayActual: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public BalanceFrom: Date;
    public LastDayExpected: number;
    public UpdatedAt: Date;
    public SumOvertime: number;
    public WorkRelationID: number;
    public Description: string;
    public ValidFrom: Date;
    public Days: number;
    public ActualMinutes: number;
    public ID: number;
    public Balancetype: WorkBalanceTypeEnum;
    public Deleted: boolean;
    public ExpectedMinutes: number;
    public Minutes: number;
    public BalanceDate: Date;
    public CreatedAt: Date;
    public IsStartBalance: boolean;
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
    public Date: Date;
    public ExpectedMinutes: number;
    public ValidTimeOff: number;
    public WorkedMinutes: number;
    public IsWeekend: boolean;
}


export class ContactSearchServiceResponse extends UniEntity {
    public Success: boolean;
    public ErrorCode: number;
    public ObjectName: string;
    public Method: string;
    public ErrorMessage: string;
}


export class InvoicesAndRemindersReadyToRemind extends UniEntity {
    public CustomerNumber: number;
    public CurrencyCodeShortCode: string;
    public CustomerInvoiceID: number;
    public StatusCode: number;
    public CurrencyCodeCode: string;
    public CustomerID: number;
    public CustomerInvoiceReminderID: number;
    public Fee: number;
    public CurrencyCodeID: number;
    public EmailAddress: string;
    public CurrencyExchangeRate: number;
    public RestAmount: number;
    public DontSendReminders: boolean;
    public InvoiceDate: Date;
    public TaxInclusiveAmountCurrency: number;
    public CustomerName: string;
    public ExternalReference: string;
    public DueDate: Date;
    public ReminderNumber: number;
    public RestAmountCurrency: number;
    public Interest: number;
    public TaxInclusiveAmount: number;
    public InvoiceNumber: number;
}


export class TradeHeaderCalculationSummary extends UniEntity {
    public SumNoVatBasisCurrency: number;
    public SumVatBasis: number;
    public DecimalRounding: number;
    public SumDiscountCurrency: number;
    public SumTotalExVatCurrency: number;
    public SumTotalIncVat: number;
    public SumDiscount: number;
    public SumNoVatBasis: number;
    public SumVatCurrency: number;
    public SumVatBasisCurrency: number;
    public SumTotalIncVatCurrency: number;
    public DecimalRoundingCurrency: number;
    public SumTotalExVat: number;
    public SumVat: number;
}


export class VatCalculationSummary extends UniEntity {
    public SumVatBasis: number;
    public SumVatCurrency: number;
    public SumVatBasisCurrency: number;
    public SumVat: number;
    public VatPercent: number;
}


export class InvoicePaymentData extends UniEntity {
    public AgioAccountID: number;
    public PaymentID: string;
    public FromBankAccountID: number;
    public AgioAmount: number;
    public CurrencyCodeID: number;
    public BankChargeAmount: number;
    public BankChargeAccountID: number;
    public CurrencyExchangeRate: number;
    public Amount: number;
    public PaymentDate: LocalDate;
    public DimensionsID: number;
    public AmountCurrency: number;
    public AccountID: number;
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


export class InvoicePayment extends UniEntity {
    public JournalEntryID: number;
    public Description: string;
    public FinancialDate: LocalDate;
    public JournalEntryNumber: string;
    public JournalEntryLineID: number;
    public Amount: number;
    public AmountCurrency: number;
}


export class OrderOffer extends UniEntity {
    public CostPercentage: number;
    public Message: string;
    public Status: string;
    public OrderId: string;
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
    public Currency: string;
    public Amount: number;
}


export class Limits extends UniEntity {
    public MaxInvoiceAmount: number;
    public Limit: number;
    public RemainingLimit: number;
}


export class AmeldingAgaAndTaxSums extends UniEntity {
    public EmploymentTax: number;
    public FinancialTax: number;
    public KIDGarnishment: string;
    public KIDFinancialTax: string;
    public TaxDraw: number;
    public period: number;
    public DueDate: Date;
    public KIDEmploymentTax: string;
    public MessageID: string;
    public KIDTaxDraw: string;
    public GarnishmentTax: number;
    public AccountNumber: string;
}


export class PayrollRunInAmeldingPeriod extends UniEntity {
    public CanGenerateAddition: boolean;
    public PayrollrunDescription: string;
    public PayrollrunPaydate: Date;
    public AmeldingSentdate: Date;
    public PayrollrunID: number;
}


export class PayAgaTaxDTO extends UniEntity {
    public payDate: Date;
    public payAga: boolean;
    public correctPennyDiff: boolean;
    public payTaxDraw: boolean;
    public payFinancialTax: boolean;
    public payGarnishment: boolean;
}


export class AmeldingSumUp extends UniEntity {
    public ReplacesAMeldingID: number;
    public Replaces: string;
    public altInnStatus: string;
    public period: number;
    public type: AmeldingType;
    public sent: Date;
    public year: number;
    public ID: number;
    public generated: Date;
    public status: AmeldingStatus;
    public LegalEntityNo: string;
    public meldingsID: string;
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
    public type: string;
    public arbeidsforholdId: string;
    public permisjon: Array<EmploymentLeaves>;
}


export class EmploymentLeaves extends UniEntity {
    public permisjonsprosent: string;
    public permisjonsId: string;
    public beskrivelse: string;
    public startdato: Date;
    public sluttdato: Date;
}


export class TransactionTypes extends UniEntity {
    public Base_EmploymentTax: boolean;
    public benefit: string;
    public incomeType: string;
    public description: string;
    public amount: number;
    public tax: boolean;
}


export class AGADetails extends UniEntity {
    public zoneName: string;
    public rate: number;
    public type: string;
    public baseAmount: number;
    public sectorName: string;
}


export class Totals extends UniEntity {
    public sumUtleggstrekk: number;
    public sumAGA: number;
    public sumTax: number;
}


export class AnnualStatement extends UniEntity {
    public EmployerAddress: string;
    public EmployeeCity: string;
    public EmployerPostCode: string;
    public EmployerOrgNr: string;
    public EmployeeAddress: string;
    public EmployerCountryCode: string;
    public EmployeeMunicipalNumber: string;
    public EmployeeMunicipalName: string;
    public EmployerCity: string;
    public EmployeePostCode: string;
    public EmployeeNumber: number;
    public EmployerCountry: string;
    public EmployerTaxMandatory: boolean;
    public Year: number;
    public EmployeeSSn: string;
    public EmployeeName: string;
    public EmployerPhoneNumber: string;
    public VacationPayBase: number;
    public EmployerName: string;
    public EmployerWebAddress: string;
    public EmployerEmail: string;
    public Contributions: Array<AnnualStatementLine>;
    public PensionOrBenefits: Array<AnnualStatementLine>;
    public Deductions: Array<AnnualStatementLine>;
    public Draws: Array<AnnualStatementLine>;
}


export class AnnualStatementLine extends UniEntity {
    public Sum: number;
    public Description: string;
    public LineIndex: number;
    public TaxReturnPost: string;
    public Amount: number;
    public SupplementPackageName: string;
    public IsDeduction: boolean;
    public Supplements: Array<SupplementInfo>;
}


export class SupplementInfo extends UniEntity {
    public ValueDate2: Date;
    public ValueDate: Date;
    public ValueType: Valuetype;
    public Name: string;
    public WageTypeSupplementID: number;
    public ValueBool: boolean;
    public ValueMoney: number;
    public ValueString: string;
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
    public Title: string;
    public mainStatus: string;
    public IsJob: boolean;
    public Text: string;
    public employeestatus: Array<EmployeeStatus>;
}


export class EmployeeStatus extends UniEntity {
    public info: string;
    public ssn: string;
    public employeeID: number;
    public employeeNumber: number;
    public year: number;
    public status: string;
    public changedFields: Array<FieldsChanged>;
}


export class FieldsChanged extends UniEntity {
    public valFrom: string;
    public fieldName: string;
    public valTo: string;
}


export class EmploymentHistoryRecord extends UniEntity {
    public MonthRate: number;
    public RegulativeStepNr: number;
    public HourRate: number;
    public WorkPercent: number;
    public ChangedAt: Date;
    public RegulativeGroupID: number;
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
    public employeeID: number;
    public tax: number;
    public grossPayment: number;
}


export class SumOnYear extends UniEntity {
    public nonTaxableAmount: number;
    public netPayment: number;
    public employeeID: number;
    public usedNonTaxableAmount: number;
    public advancePayment: number;
    public pension: number;
    public taxBase: number;
    public paidHolidaypay: number;
    public baseVacation: number;
    public sumTax: number;
    public grossPayment: number;
}


export class VacationPayLastYear extends UniEntity {
    public employeeID: number;
    public paidHolidayPay: number;
    public baseVacation: number;
}


export class SalaryTransactionPay extends UniEntity {
    public CompanyBankAccountID: number;
    public TaxBankAccountID: number;
    public CompanyName: string;
    public CompanyCity: string;
    public SalaryBankAccountID: number;
    public CompanyAddress: string;
    public CompanyPostalCode: string;
    public Withholding: number;
    public PaymentDate: Date;
    public PayList: Array<SalaryTransactionPayLine>;
    public SalaryBalancePayList: Array<SalaryBalancePayLine>;
}


export class SalaryTransactionPayLine extends UniEntity {
    public Address: string;
    public NetPayment: number;
    public EmployeeNumber: number;
    public PostalCode: string;
    public EmployeeName: string;
    public City: string;
    public Tax: number;
    public Account: string;
}


export class SalaryBalancePayLine extends UniEntity {
    public Sum: number;
    public Kid: string;
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
    public Subject: string;
    public Message: string;
    public GroupByWageType: boolean;
}


export class WorkItemToSalary extends UniEntity {
    public Rate: number;
    public PayrollRunID: number;
    public WageType: WageType;
    public Employment: Employment;
    public WorkItems: Array<WorkItem>;
}


export class Reconciliation extends UniEntity {
    public CalculatedPayruns: number;
    public Year: number;
    public FromPeriod: number;
    public ToPeriod: number;
    public CreatedPayruns: number;
    public BookedPayruns: number;
    public Groups: Array<ReconciliationGroup>;
}


export class ReconciliationGroup extends UniEntity {
    public Sum: number;
    public AccountNumber: string;
    public Lines: Array<ReconciliationLine>;
}


export class ReconciliationLine extends UniEntity {
    public Sum: number;
    public Benefit: string;
    public IncomeType: string;
    public HasEmploymentTax: boolean;
    public Description: string;
    public WageTypeName: string;
    public WageTypeNumber: number;
}


export class UnionReport extends UniEntity {
    public FromDate: LocalDate;
    public ToDate: LocalDate;
    public Year: number;
    public Summaries: Array<UnionSummary>;
}


export class UnionSummary extends UniEntity {
    public SupplierID: number;
    public Supplier: Supplier;
    public Members: Array<UnionMember>;
}


export class UnionMember extends UniEntity {
    public Ensurance: number;
    public UnionDraw: number;
    public OUO: number;
    public MemberNumber: string;
    public Name: string;
}


export class SalaryTransactionSums extends UniEntity {
    public percentTax: number;
    public netPayment: number;
    public paidPension: number;
    public tableTax: number;
    public basePercentTax: number;
    public calculatedVacationPay: number;
    public calculatedAGA: number;
    public paidAdvance: number;
    public Payrun: number;
    public baseAGA: number;
    public baseTableTax: number;
    public calculatedFinancialTax: number;
    public baseVacation: number;
    public manualTax: number;
    public Employee: number;
    public grossPayment: number;
}


export class SalaryTransactionPeriodSums extends UniEntity {
    public AgaZone: string;
    public OrgNumber: string;
    public Year: number;
    public FromPeriod: number;
    public ToPeriod: number;
    public AgaRate: number;
    public MunicipalName: string;
    public Sums: SalaryTransactionSums;
    public Aga: AGACalculation;
}


export class code extends UniEntity {
    public gmlcode: string;
    public utloeserArbeidsgiveravgift: string;
    public postnr: string;
    public gyldigtil: string;
    public fordel: string;
    public uninavn: string;
    public inngaarIGrunnlagForTrekk: string;
    public gyldigfom: string;
    public skatteOgAvgiftregel: string;
    public kunfranav: string;
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
    public IsTest: boolean;
    public LicenseKey: string;
    public TemplateCompanyKey: string;
    public CopyFiles: boolean;
    public ContractType: number;
    public ProductNames: string;
    public CompanyName: string;
    public ContractID: number;
    public IsTemplate: boolean;
    public CompanySettings: CompanySettings;
}


export class UserDto extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'UserDto';

    public StatusCode: number;
    public BankIntegrationUserName: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public HasAgreedToImportDisclaimer: boolean;
    public UpdatedAt: Date;
    public PermissionHandling: string;
    public IsAutobankAdmin: boolean;
    public LastLogin: Date;
    public UserName: string;
    public PhoneNumber: string;
    public ID: number;
    public DisplayName: string;
    public Deleted: boolean;
    public Protected: boolean;
    public CreatedAt: Date;
    public Email: string;
    public GlobalIdentity: string;
    public EndDate: Date;
    public TwoFactorEnabled: boolean;
    public _createguid: string;
    public AuthPhoneNumber: string;
    public License: UserLicenseInformation;
    public CustomFields: any;
}


export class UserLicenseInformation extends UniEntity {
    public UserLicenseEndDate: Date;
    public Comment: string;
    public Name: string;
    public UserLicenseKey: string;
    public GlobalIdentity: string;
    public CustomerAgreement: CustomerLicenseAgreementInfo;
    public UserType: UserLicenseType;
    public Company: CompanyLicenseInfomation;
    public ContractType: ContractLicenseType;
    public UserLicenseAgreement: LicenseAgreementInfo;
}


export class CustomerLicenseAgreementInfo extends UniEntity {
    public AgreementId: number;
    public HasAgreedToLicense: boolean;
    public CanAgreeToLicense: boolean;
}


export class UserLicenseType extends UniEntity {
    public EndDate: Date;
    public TypeID: number;
    public TypeName: string;
}


export class CompanyLicenseInfomation extends UniEntity {
    public StatusCode: LicenseEntityStatus;
    public EndDate: Date;
    public Key: string;
    public ContractID: number;
    public ID: number;
    public Name: string;
    public ContactEmail: string;
    public ContactPerson: string;
    public Agency: Agency;
}


export class Agency extends UniEntity {
    public CompanyKey: string;
    public Name: string;
}


export class ContractLicenseType extends UniEntity {
    public TypeID: number;
    public StartDate: Date;
    public TrialExpiration: Date;
    public TypeName: string;
}


export class LicenseAgreementInfo extends UniEntity {
    public AgreementId: number;
    public HasAgreedToLicense: boolean;
}


export class CreateBankUserDTO extends UniEntity {
    public IsAdmin: boolean;
    public AdminPassword: string;
    public AdminUserId: number;
    public Phone: string;
    public Password: string;
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
    public UsedFreeAmount: number;
    public GrantSum: number;
    public MaxFreeAmount: number;
}


export class AuthenticationChallengeBE extends UniEntity {
    public ValidFrom: Date;
    public ValidTo: Date;
    public Message: string;
    public Status: ChallengeRequestResult;
    public ExtensionData: ExtensionDataObject;
}


export class ExtensionDataObject extends UniEntity {
}


export class AltinnAuthRequest extends UniEntity {
    public UserID: string;
    public PreferredLogin: string;
    public UserPassword: string;
}


export class A06Options extends UniEntity {
    public IncludeEmployments: boolean;
    public Year: number;
    public FromPeriod: Maaned;
    public IncludeInfoPerPerson: boolean;
    public IncludeIncome: boolean;
    public ToPeriod: Maaned;
    public ReportType: ReportType;
}


export class A07Response extends UniEntity {
    public Title: string;
    public mainStatus: string;
    public DataName: string;
    public Data: string;
    public DataType: string;
    public Text: string;
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
    public IntegrationKey: string;
    public ExternalId: string;
}


export class CurrencyRateData extends UniEntity {
    public IsOverrideRate: boolean;
    public ExchangeRateOld: number;
    public RateDateOld: LocalDate;
    public ExchangeRate: number;
    public RateDate: LocalDate;
    public Factor: number;
    public FromCurrencyCode: CurrencyCode;
}


export class EmailDTO extends UniEntity {
    public FromAddress: string;
    public CopyAddress: string;
    public ReportID: number;
    public Subject: string;
    public Message: string;
    public Format: string;
    public Parameters: Array<ReportParameter>;
}


export class ReportParameter extends UniEntity {
    public Name: string;
    public Value: string;
}


export class DistributionPlanElementValidation extends UniEntity {
    public Priority: number;
    public ElementTypeName: string;
    public IsValid: boolean;
    public ElementType: DistributionPlanElementTypes;
    public PlanElement: DistributionPlanElement;
}


export class SendEmail extends UniEntity {
    public Localization: string;
    public FromAddress: string;
    public CopyAddress: string;
    public ReportID: number;
    public Subject: string;
    public ReportName: string;
    public ExternalReference: string;
    public EntityType: string;
    public Message: string;
    public EntityID: number;
    public Attachments: Array<SendEmailAttachment>;
    public Parameters: Array<ReportParameter>;
}


export class SendEmailAttachment extends UniEntity {
    public FileName: string;
    public Attachment: string;
    public FileID: number;
}


export class RssList extends UniEntity {
    public Title: string;
    public Description: string;
    public Url: string;
    public Items: Array<RssItem>;
}


export class RssItem extends UniEntity {
    public Title: string;
    public Guid: string;
    public PubDate: string;
    public Category: string;
    public Description: string;
    public Link: string;
    public Enclosure: Enclosure;
}


export class Enclosure extends UniEntity {
    public Length: string;
    public Type: string;
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
    public ReportBalance: number;
    public Name: string;
    public ExpectedMinutes: number;
    public WorkRelation: WorkRelation;
    public TimeOff: Array<FlexDetail>;
    public MissingDays: Array<FlexDetail>;
}


export class TeamPositionDto extends UniEntity {
    public Position: TeamPositionEnum;
    public PositionName: string;
}


export class EHFCustomer extends UniEntity {
    public contactphone: string;
    public orgname: string;
    public orgno: string;
    public contactemail: string;
    public contactname: string;
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

    public MissingRequiredDimensionsMessage: string;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public MissingOnlyWarningsDimensionsMessage: string;
    public ID: number;
    public journalEntryLineDraftID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public DimensionsID: number;
    public AccountID: number;
    public AccountNumber: string;
    public _createguid: string;
    public CustomFields: any;
}


export class AccountDimension extends UniEntity {
    public DimensionsID: number;
    public AccountID: number;
    public AccountNumber: number;
    public Dimensions: Dimensions;
}


export class AssetReportDTO extends UniEntity {
    public GroupCode: string;
    public GroupName: string;
    public DepreciationAccountNumber: number;
    public BalanceAccountName: string;
    public Number: number;
    public Name: string;
    public CurrentValue: number;
    public LastDepreciation: LocalDate;
    public Lifetime: number;
    public BalanceAccountNumber: number;
    public Lines: Array<AssetReportLineDTO>;
}


export class AssetReportLineDTO extends UniEntity {
    public Date: LocalDate;
    public TypeID: number;
    public Type: string;
    public Value: number;
}


export class BankBalanceDto extends UniEntity {
    public Date: Date;
    public BalanceAvailable: number;
    public IsTestData: boolean;
    public BalanceBooked: number;
    public Comment: string;
    public AccountNumber: string;
}


export class BankData extends UniEntity {
    public IBAN: string;
    public AccountNumber: string;
    public Bank: Bank;
}


export class CreateBankIntegrationDTO extends UniEntity {
    public IsOutgoing: boolean;
    public RequireTwoStage: boolean;
    public BankAccountID: number;
    public UserName: string;
    public ServiceProvider: number;
    public BankAcceptance: boolean;
    public IsInbound: boolean;
    public TuserName: string;
    public Phone: string;
    public DisplayName: string;
    public Email: string;
    public Bank: string;
    public IsBankStatement: boolean;
    public IsBankBalance: boolean;
    public BankApproval: boolean;
    public Password: string;
    public BankAccounts: Array<BankAccountDTO>;
}


export class BankAccountDTO extends UniEntity {
    public IsOutgoing: boolean;
    public BBAN: string;
    public IsInbound: boolean;
    public Bic: string;
    public IBAN: string;
    public IsBankStatement: boolean;
    public IsBankBalance: boolean;
}


export class ZdataUpdateBankProperties extends UniEntity {
    public IsOutgoing: boolean;
    public IsInbound: boolean;
    public IsBankStatement: boolean;
    public ServiceID: string;
    public IsBankBalance: boolean;
    public Password: string;
}


export class AutobankUserDTO extends UniEntity {
    public UserID: number;
    public IsAdmin: boolean;
    public Phone: string;
    public Password: string;
}


export class UpdateServiceStatusDTO extends UniEntity {
    public StatusCode: StatusCodeBankIntegrationAgreement;
    public ServiceID: string;
}


export class UpdateServiceIDDTO extends UniEntity {
    public ServiceID: string;
    public NewServiceID: string;
}


export class BankMatchSuggestion extends UniEntity {
    public BankStatementEntryID: number;
    public Group: string;
    public JournalEntryLineID: number;
    public Amount: number;
}


export class MatchRequest extends UniEntity {
    public JournalEntries: Array<MatchCandidate>;
    public BankEntries: Array<MatchCandidate>;
    public Settings: MatchSettings;
}


export class MatchCandidate extends UniEntity {
    public Date: Date;
    public IsBankEntry: boolean;
    public Amount: number;
    public ID: number;
    public Closed: boolean;
}


export class MatchSettings extends UniEntity {
    public MaxDayOffset: number;
    public MaxDelta: number;
}


export class ReconciliationStatus extends UniEntity {
    public NumberOfUnReconciled: number;
    public NumberOfItems: number;
    public FromDate: Date;
    public IsReconciled: boolean;
    public Todate: Date;
    public TotalAmount: number;
    public TotalUnreconciled: number;
    public AccountID: number;
}


export class BalanceDto extends UniEntity {
    public EndDate: Date;
    public StartDate: Date;
    public Balance: number;
    public BalanceInStatement: number;
}


export class BankfileFormat extends UniEntity {
    public Separator: string;
    public FileExtension: string;
    public IsXml: boolean;
    public LinePrefix: string;
    public IsFixed: boolean;
    public Name: string;
    public SkipRows: number;
    public CustomFormat: BankFileCustomFormat;
    public Columns: Array<BankfileColumn>;
}


export class BankfileColumn extends UniEntity {
    public StartPos: number;
    public Length: number;
    public FieldMapping: BankfileField;
    public IsFallBack: boolean;
    public DataType: BankfileDataType;
}


export class JournalSuggestion extends UniEntity {
    public MatchWithEntryID: number;
    public Description: string;
    public FinancialDate: LocalDate;
    public Amount: number;
    public BankStatementRuleID: number;
    public AccountID: number;
    public Account: Account;
}


export class ReportRow extends UniEntity {
    public BudPeriod10: number;
    public BudPeriod1: number;
    public GroupName: string;
    public AccountName: string;
    public Period8: number;
    public SumPeriod: number;
    public SumLastYear: number;
    public Sum: number;
    public PrecedingBalance: number;
    public Period9: number;
    public SubGroupNumber: number;
    public Period1: number;
    public GroupNumber: number;
    public BudgetAccumulated: number;
    public Period3: number;
    public BudPeriod2: number;
    public BudPeriod5: number;
    public Period6: number;
    public Period12: number;
    public SubGroupName: string;
    public Period7: number;
    public IsSubTotal: boolean;
    public Period4: number;
    public BudPeriod8: number;
    public ID: number;
    public BudPeriod9: number;
    public BudPeriod6: number;
    public BudPeriod12: number;
    public SumPeriodAccumulated: number;
    public BudPeriod4: number;
    public BudgetSum: number;
    public BudPeriod11: number;
    public Period2: number;
    public Period10: number;
    public Period5: number;
    public BudPeriod7: number;
    public AccountYear: number;
    public SumPeriodLastYear: number;
    public Period11: number;
    public BudPeriod3: number;
    public SumPeriodLastYearAccumulated: number;
    public AccountNumber: number;
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
    public Custumer: number;
    public Supplier: number;
    public Sum: number;
    public Liquidity: number;
    public CustomPayments: number;
    public VAT: number;
}


export class JournalEntryData extends UniEntity {
    public CreditAccountID: number;
    public CustomerInvoiceID: number;
    public StatusCode: number;
    public VatDate: LocalDate;
    public JournalEntryDataAccrualID: number;
    public SupplierInvoiceNo: string;
    public PaymentID: string;
    public JournalEntryNo: string;
    public DebitAccountID: number;
    public CreditAccountNumber: number;
    public NumberSeriesTaskID: number;
    public JournalEntryID: number;
    public PostPostJournalEntryLineID: number;
    public Description: string;
    public CurrencyExchangeRate: number;
    public FinancialDate: LocalDate;
    public Amount: number;
    public CreditVatTypeID: number;
    public DueDate: LocalDate;
    public CurrencyID: number;
    public DebitVatTypeID: number;
    public NumberSeriesID: number;
    public VatDeductionPercent: number;
    public DebitAccountNumber: number;
    public SupplierInvoiceID: number;
    public CustomerOrderID: number;
    public InvoiceNumber: string;
    public AmountCurrency: number;
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
    public PeriodSumYear1: number;
    public PeriodName: string;
    public PeriodNo: number;
    public PeriodSumYear2: number;
}


export class JournalEntryLineRequestSummary extends UniEntity {
    public SumBalance: number;
    public SumTaxBasisAmount: number;
    public SumCredit: number;
    public SumDebit: number;
    public SumLedger: number;
}


export class JournalEntryLinePostPostData extends UniEntity {
    public CurrencyCodeShortCode: string;
    public StatusCode: number;
    public MarkedAgainstJournalEntryLineID: number;
    public CurrencyCodeCode: string;
    public SubAccountName: string;
    public PaymentID: string;
    public CurrencyCodeID: number;
    public NumberOfPayments: number;
    public JournalEntryID: number;
    public Description: string;
    public CurrencyExchangeRate: number;
    public FinancialDate: Date;
    public PeriodNo: number;
    public RestAmount: number;
    public MarkedAgainstJournalEntryNumber: string;
    public SumPostPostAmountCurrency: number;
    public JournalEntryNumber: string;
    public Amount: number;
    public ID: number;
    public DueDate: Date;
    public SubAccountNumber: number;
    public RestAmountCurrency: number;
    public SumPostPostAmount: number;
    public JournalEntryTypeName: string;
    public AccountYear: number;
    public JournalEntryNumberNumeric: number;
    public InvoiceNumber: string;
    public AmountCurrency: number;
    public Markings: Array<JournalEntryLinePostPostData>;
}


export class CreatePaymentBatchDTO extends UniEntity {
    public Code: string;
    public HashValue: string;
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
    public StatusCode: StatusCodeJournalEntryLine;
    public OriginalRestAmount: number;
    public OriginalStatusCode: StatusCodeJournalEntryLine;
    public FinancialDate: Date;
    public RestAmount: number;
    public JournalEntryNumber: string;
    public Amount: number;
    public ID: number;
    public RestAmountCurrency: number;
    public InvoiceNumber: string;
    public AmountCurrency: number;
    public Markings: Array<MarkingReference>;
}


export class MarkingReference extends UniEntity {
    public JournalEntryNumber: string;
    public ID: number;
}


export class SupplierInvoiceDetail extends UniEntity {
    public VatTypeName: string;
    public AccountName: string;
    public VatCode: string;
    public Description: string;
    public InvoiceDate: Date;
    public Amount: number;
    public SupplierID: number;
    public DeliveryDate: Date;
    public VatTypeID: number;
    public SupplierInvoiceID: number;
    public InvoiceNumber: string;
    public VatPercent: number;
    public AmountCurrency: number;
    public AccountID: number;
    public AccountNumber: number;
}


export class VatReportMessage extends UniEntity {
    public Message: string;
    public Level: ValidationLevel;
}


export class VatReportSummary extends UniEntity {
    public VatCodeGroupName: string;
    public VatCodeGroupNo: string;
    public IsHistoricData: boolean;
    public SumVatAmount: number;
    public VatCodeGroupID: number;
    public SumTaxBasisAmount: number;
    public NumberOfJournalEntryLines: number;
    public HasTaxBasis: boolean;
    public HasTaxAmount: boolean;
}


export class VatReportSummaryPerPost extends UniEntity {
    public VatCodeGroupName: string;
    public VatCodeGroupNo: string;
    public VatPostReportAsNegativeAmount: boolean;
    public IsHistoricData: boolean;
    public SumVatAmount: number;
    public VatPostID: number;
    public VatPostName: string;
    public VatCodeGroupID: number;
    public SumTaxBasisAmount: number;
    public NumberOfJournalEntryLines: number;
    public HasTaxBasis: boolean;
    public VatPostNo: string;
    public HasTaxAmount: boolean;
}


export class VatReportSummaryPerPostPerAccount extends UniEntity {
    public VatCodeGroupName: string;
    public StdVatCode: string;
    public VatJournalEntryPostAccountNumber: number;
    public VatCodeGroupNo: string;
    public VatPostReportAsNegativeAmount: boolean;
    public IsHistoricData: boolean;
    public VatAccountID: number;
    public SumVatAmount: number;
    public VatDate: Date;
    public VatPostID: number;
    public VatPostName: string;
    public VatCodeGroupID: number;
    public SumTaxBasisAmount: number;
    public VatCode: string;
    public VatJournalEntryPostAccountID: number;
    public NumberOfJournalEntryLines: number;
    public Description: string;
    public FinancialDate: Date;
    public VatJournalEntryPostAccountName: string;
    public TaxBasisAmount: number;
    public JournalEntryNumber: string;
    public VatAccountName: string;
    public Amount: number;
    public HasTaxBasis: boolean;
    public VatAccountNumber: number;
    public VatPostNo: string;
    public HasTaxAmount: boolean;
}


export class VatReportNotReportedJournalEntryData extends UniEntity {
    public SumVatAmount: number;
    public SumTaxBasisAmount: number;
    public NumberOfJournalEntryLines: number;
    public TerminPeriodID: number;
}


export class AltinnSigningTextResponse extends UniEntity {
    public SigningText: string;
}


export class AltinnGetVatReportDataFromAltinnResult extends UniEntity {
    public Message: string;
    public Status: AltinnGetVatReportDataFromAltinnStatus;
}


export class AccountUsage extends UniEntity {
    public Counter: number;
    public AccountNumber: number;
    public PercentWeight: number;
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


export enum TabellType{
    loenn = 0,
    pension = 1,
}


export enum FreeAmountType{
    None = 0,
    WithAmount = 1,
    NoLimit = 2,
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


export enum EmploymentType{
    notSet = 0,
    Permanent = 1,
    Temporary = 2,
}


export enum TypeOfEmployment{
    notSet = 0,
    OrdinaryEmployment = 1,
    MaritimeEmployment = 2,
    FrilancerContratorFeeRecipient = 3,
    PensionOrOtherNonEmployedBenefits = 4,
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


export enum RemunerationType{
    notSet = 0,
    FixedSalary = 1,
    HourlyPaid = 2,
    PaidOnCommission = 3,
    OnAgreement_Honorar = 4,
    ByPerformance = 5,
}


export enum ShipRegistry{
    notSet = 0,
    NorwegianInternationalShipRegister = 1,
    NorwegianOrdinaryShipRegister = 2,
    ForeignShipRegister = 3,
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


export enum SalBalSource{
    AdvanceRoutine = 1,
    NegativeSalary = 2,
    Loan = 3,
    Other = 4,
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


export enum RateTypeColumn{
    none = 0,
    Employment = 1,
    Employee = 2,
    Salary_scale = 3,
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


export enum LimitType{
    None = 0,
    Amount = 1,
    Sum = 2,
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


export enum ApiMessageType{
    Critical = 0,
    Warn = 1,
    Info = 2,
}


export enum CompanyStatusCode{
    NotMigrated = 0,
    Migrating = 5,
    Error = 9,
    Migrated = 10,
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


export enum DistributionPlanElementTypes{
    Ehf = 1,
    Email = 2,
    Print = 3,
    Efaktura = 4,
    Factoring = 5,
    VippsInvoice = 6,
    Avtalegiro = 7,
    AvtalegiroEfaktura = 8,
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
