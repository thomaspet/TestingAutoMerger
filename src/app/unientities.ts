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

    public EntityType: string;
    public Verb: string;
    public Deleted: boolean;
    public NewValue: string;
    public CreatedBy: string;
    public Route: string;
    public OldValue: string;
    public ClientID: string;
    public Action: string;
    public EntityID: number;
    public ID: number;
    public Transaction: string;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public Field: string;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class WorkBalance extends UniEntity {
    public static RelativeUrl = 'workbalances';
    public static EntityType = 'WorkBalance';

    public Deleted: boolean;
    public StatusCode: number;
    public ExpectedMinutes: number;
    public CreatedBy: string;
    public Days: number;
    public ValidFrom: Date;
    public IsStartBalance: boolean;
    public Description: string;
    public ActualMinutes: number;
    public Balancetype: WorkBalanceTypeEnum;
    public ID: number;
    public BalanceFrom: Date;
    public WorkRelationID: number;
    public CreatedAt: Date;
    public Minutes: number;
    public UpdatedAt: Date;
    public ValidTimeOff: number;
    public UpdatedBy: string;
    public BalanceDate: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class Worker extends UniEntity {
    public static RelativeUrl = 'workers';
    public static EntityType = 'Worker';

    public Deleted: boolean;
    public UserID: number;
    public StatusCode: number;
    public EmployeeID: number;
    public CreatedBy: string;
    public BusinessRelationID: number;
    public ID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
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

    public DimensionsID: number;
    public Deleted: boolean;
    public MinutesToOrder: number;
    public StatusCode: number;
    public Date: Date;
    public CreatedBy: string;
    public WorkItemGroupID: number;
    public TransferedToOrder: boolean;
    public PayrollTrackingID: number;
    public OrderItemId: number;
    public PriceExVat: number;
    public Invoiceable: boolean;
    public EndTime: Date;
    public CustomerOrderID: number;
    public Description: string;
    public TransferedToPayroll: boolean;
    public ID: number;
    public WorkRelationID: number;
    public Label: string;
    public CreatedAt: Date;
    public CustomerID: number;
    public Minutes: number;
    public LunchInMinutes: number;
    public UpdatedAt: Date;
    public StartTime: Date;
    public UpdatedBy: string;
    public WorkTypeID: number;
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

    public Deleted: boolean;
    public StatusCode: number;
    public CreatedBy: string;
    public ID: number;
    public WorkRelationID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public WorkRelation: WorkRelation;
    public Items: Array<WorkItem>;
    public CustomFields: any;
}


export class WorkProfile extends UniEntity {
    public static RelativeUrl = 'workprofiles';
    public static EntityType = 'WorkProfile';

    public Deleted: boolean;
    public MinutesPerMonth: number;
    public StatusCode: number;
    public CreatedBy: string;
    public IsShared: boolean;
    public MinutesPerYear: number;
    public LunchIncluded: boolean;
    public Name: string;
    public MinutesPerWeek: number;
    public ID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class WorkRelation extends UniEntity {
    public static RelativeUrl = 'workrelations';
    public static EntityType = 'WorkRelation';

    public IsPrivate: boolean;
    public Deleted: boolean;
    public StatusCode: number;
    public TeamID: number;
    public CreatedBy: string;
    public CompanyID: number;
    public StartDate: Date;
    public EndTime: Date;
    public Description: string;
    public ID: number;
    public WorkerID: number;
    public CompanyName: string;
    public CreatedAt: Date;
    public WorkPercentage: number;
    public UpdatedAt: Date;
    public WorkProfileID: number;
    public UpdatedBy: string;
    public IsActive: boolean;
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

    public Deleted: boolean;
    public StatusCode: number;
    public ToDate: Date;
    public CreatedBy: string;
    public RegionKey: string;
    public IsHalfDay: boolean;
    public SystemKey: string;
    public TimeoffType: number;
    public Description: string;
    public FromDate: Date;
    public ID: number;
    public WorkRelationID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class WorkType extends UniEntity {
    public static RelativeUrl = 'worktypes';
    public static EntityType = 'WorkType';

    public Price: number;
    public Deleted: boolean;
    public StatusCode: number;
    public CreatedBy: string;
    public SystemType: WorkTypeEnum;
    public Description: string;
    public Name: string;
    public ID: number;
    public ProductID: number;
    public CreatedAt: Date;
    public WagetypeNumber: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public Product: Product;
    public CustomFields: any;
}


export class BankFile extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'BankFile';

    public SubCompanyID: number;
    public Deleted: boolean;
    public StatusCode: number;
    public CreatedBy: string;
    public ParentFileid: number;
    public FileID: number;
    public Accountnumber: string;
    public ID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public File: File;
    public SubCompany: SubCompany;
    public CustomFields: any;
}


export class BatchInvoice extends UniEntity {
    public static RelativeUrl = 'batchinvoices';
    public static EntityType = 'BatchInvoice';

    public NotifyEmail: boolean;
    public InvoiceDate: LocalDate;
    public Deleted: boolean;
    public NumberOfBatches: number;
    public StatusCode: number;
    public YourRef: string;
    public CreatedBy: string;
    public Processed: number;
    public Comment: string;
    public SellerID: number;
    public FreeTxt: string;
    public DueDate: LocalDate;
    public MinAmount: number;
    public ID: number;
    public Operation: BatchInvoiceOperation;
    public OurRef: string;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public TotalToProcess: number;
    public ProjectID: number;
    public CustomerID: number;
    public _createguid: string;
    public Items: Array<BatchInvoiceItem>;
    public CustomFields: any;
}


export class BatchInvoiceItem extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'BatchInvoiceItem';

    public Deleted: boolean;
    public StatusCode: StatusCode;
    public CreatedBy: string;
    public CustomerInvoiceID: number;
    public CustomerOrderID: number;
    public ID: number;
    public BatchInvoiceID: number;
    public CommentID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public BatchNumber: number;
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

    public Deleted: boolean;
    public StatusCode: number;
    public EntityName: string;
    public Template: string;
    public CreatedBy: string;
    public ID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Customer extends UniEntity {
    public static RelativeUrl = 'customers';
    public static EntityType = 'Customer';

    public SocialSecurityNumber: string;
    public AcceptableDelta4CustomerPaymentAccountID: number;
    public DontSendReminders: boolean;
    public IsPrivate: boolean;
    public DimensionsID: number;
    public DefaultCustomerInvoiceReportID: number;
    public DefaultDistributionsID: number;
    public CustomerInvoiceReminderSettingsID: number;
    public Deleted: boolean;
    public PeppolAddress: string;
    public StatusCode: number;
    public EfakturaIdentifier: string;
    public DeliveryTermsID: number;
    public SubAccountNumberSeriesID: number;
    public ReminderEmailAddress: string;
    public CurrencyCodeID: number;
    public CreatedBy: string;
    public DefaultCustomerQuoteReportID: number;
    public CustomerNumber: number;
    public CustomerNumberKidAlias: string;
    public WebUrl: string;
    public CreditDays: number;
    public DefaultSellerID: number;
    public AvtaleGiro: boolean;
    public BusinessRelationID: number;
    public Localization: string;
    public DefaultCustomerOrderReportID: number;
    public AvtaleGiroNotification: boolean;
    public ID: number;
    public PaymentTermsID: number;
    public AcceptableDelta4CustomerPayment: number;
    public CreatedAt: Date;
    public EInvoiceAgreementReference: string;
    public GLN: string;
    public UpdatedAt: Date;
    public OrgNumber: string;
    public UpdatedBy: string;
    public FactoringNumber: number;
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

    public ExternalStatus: number;
    public DontSendReminders: boolean;
    public Credited: boolean;
    public PrintStatus: number;
    public CustomerName: string;
    public TaxExclusiveAmount: number;
    public InvoiceDate: LocalDate;
    public InvoicePostalCode: string;
    public Deleted: boolean;
    public InvoiceNumber: string;
    public CollectorStatusCode: number;
    public OurReference: string;
    public StatusCode: number;
    public AmountRegards: string;
    public PayableRoundingAmount: number;
    public DeliveryTermsID: number;
    public InvoiceReceiverName: string;
    public PayableRoundingCurrencyAmount: number;
    public EmailAddress: string;
    public PaymentInformation: string;
    public UseReportID: number;
    public CurrencyCodeID: number;
    public PaymentID: string;
    public CreatedBy: string;
    public VatTotalsAmount: number;
    public BankAccountID: number;
    public ShippingAddressLine1: string;
    public InvoiceReferenceID: number;
    public InvoiceAddressLine1: string;
    public DeliveryMethod: string;
    public Comment: string;
    public ShippingAddressLine3: string;
    public InternalNote: string;
    public DeliveryName: string;
    public PaymentInfoTypeID: number;
    public LastPaymentDate: LocalDate;
    public CurrencyExchangeRate: number;
    public FreeTxt: string;
    public DeliveryTerm: string;
    public DefaultDimensionsID: number;
    public CreditedAmountCurrency: number;
    public CreditDays: number;
    public RestAmount: number;
    public SalesPerson: string;
    public Requisition: string;
    public DefaultSellerID: number;
    public RestAmountCurrency: number;
    public PaymentTerm: string;
    public InvoiceCountry: string;
    public ShippingPostalCode: string;
    public TaxInclusiveAmount: number;
    public YourReference: string;
    public ShippingCountry: string;
    public JournalEntryID: number;
    public InvoiceType: number;
    public ID: number;
    public TaxInclusiveAmountCurrency: number;
    public ShippingAddressLine2: string;
    public PaymentTermsID: number;
    public DeliveryDate: LocalDate;
    public ShippingCity: string;
    public PaymentDueDate: LocalDate;
    public InvoiceNumberSeriesID: number;
    public ShippingCountryCode: string;
    public InvoiceCountryCode: string;
    public InvoiceCity: string;
    public CreatedAt: Date;
    public CustomerID: number;
    public SupplierOrgNumber: string;
    public CustomerPerson: string;
    public UpdatedAt: Date;
    public VatTotalsAmountCurrency: number;
    public CustomerOrgNumber: string;
    public UpdateCurrencyAmountsOnDateChange: boolean;
    public DistributionPlanID: number;
    public CreditedAmount: number;
    public UpdatedBy: string;
    public AccrualID: number;
    public TaxExclusiveAmountCurrency: number;
    public ExternalReference: string;
    public InvoiceAddressLine2: string;
    public Payment: string;
    public InvoiceAddressLine3: string;
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

    public DiscountPercent: number;
    public DiscountCurrency: number;
    public VatPercent: number;
    public DimensionsID: number;
    public PriceSetByUser: boolean;
    public InvoicePeriodEndDate: LocalDate;
    public SumTotalIncVatCurrency: number;
    public Discount: number;
    public Deleted: boolean;
    public PriceExVatCurrency: number;
    public VatTypeID: number;
    public StatusCode: number;
    public InvoicePeriodStartDate: LocalDate;
    public CostPrice: number;
    public CurrencyCodeID: number;
    public CalculateGrossPriceBasedOnNetPrice: boolean;
    public CreatedBy: string;
    public AccountID: number;
    public SumTotalExVat: number;
    public SumTotalIncVat: number;
    public Comment: string;
    public SumVat: number;
    public AccountingCost: string;
    public PriceExVat: number;
    public CurrencyExchangeRate: number;
    public SumVatCurrency: number;
    public SumTotalExVatCurrency: number;
    public CustomerInvoiceID: number;
    public ItemText: string;
    public SortIndex: number;
    public ID: number;
    public ItemSourceID: number;
    public ProductID: number;
    public PriceIncVat: number;
    public NumberOfItems: number;
    public CreatedAt: Date;
    public Unit: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public VatDate: LocalDate;
    public OrderItemId: number;
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

    public DimensionsID: number;
    public ReminderNumber: number;
    public Deleted: boolean;
    public RunNumber: number;
    public StatusCode: number;
    public RemindedDate: LocalDate;
    public Title: string;
    public EmailAddress: string;
    public CurrencyCodeID: number;
    public CreatedBy: string;
    public DebtCollectionFeeCurrency: number;
    public CurrencyExchangeRate: number;
    public CreatedByReminderRuleID: number;
    public RestAmount: number;
    public CustomerInvoiceID: number;
    public RestAmountCurrency: number;
    public DueDate: LocalDate;
    public InterestFeeCurrency: number;
    public Description: string;
    public ReminderFeeCurrency: number;
    public ID: number;
    public ReminderFee: number;
    public DebtCollectionFee: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public InterestFee: number;
    public UpdatedBy: string;
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

    public ReminderNumber: number;
    public CustomerInvoiceReminderSettingsID: number;
    public Deleted: boolean;
    public StatusCode: number;
    public Title: string;
    public CreatedBy: string;
    public MinimumDaysFromDueDate: number;
    public CreditDays: number;
    public Description: string;
    public UseMaximumLegalReminderFee: boolean;
    public ID: number;
    public ReminderFee: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomerInvoiceReminderSettings: CustomerInvoiceReminderSettings;
    public CustomFields: any;
}


export class CustomerInvoiceReminderSettings extends UniEntity {
    public static RelativeUrl = 'invoiceremindersettings';
    public static EntityType = 'CustomerInvoiceReminderSettings';

    public Deleted: boolean;
    public StatusCode: number;
    public AcceptPaymentWithoutReminderFee: boolean;
    public CreatedBy: string;
    public MinimumAmountToRemind: number;
    public ID: number;
    public DebtCollectionSettingsID: number;
    public RemindersBeforeDebtCollection: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public DefaultReminderFeeAccountID: number;
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

    public UpdateCurrencyOnToInvoice: boolean;
    public PrintStatus: number;
    public CustomerName: string;
    public TaxExclusiveAmount: number;
    public OrderNumberSeriesID: number;
    public OrderDate: LocalDate;
    public InvoicePostalCode: string;
    public Deleted: boolean;
    public ReadyToInvoice: boolean;
    public OurReference: string;
    public StatusCode: number;
    public PayableRoundingAmount: number;
    public DeliveryTermsID: number;
    public InvoiceReceiverName: string;
    public PayableRoundingCurrencyAmount: number;
    public EmailAddress: string;
    public UseReportID: number;
    public CurrencyCodeID: number;
    public CreatedBy: string;
    public OrderNumber: number;
    public VatTotalsAmount: number;
    public ShippingAddressLine1: string;
    public InvoiceAddressLine1: string;
    public DeliveryMethod: string;
    public Comment: string;
    public ShippingAddressLine3: string;
    public InternalNote: string;
    public DeliveryName: string;
    public PaymentInfoTypeID: number;
    public CurrencyExchangeRate: number;
    public FreeTxt: string;
    public DeliveryTerm: string;
    public DefaultDimensionsID: number;
    public CreditDays: number;
    public SalesPerson: string;
    public Requisition: string;
    public DefaultSellerID: number;
    public RestAmountCurrency: number;
    public PaymentTerm: string;
    public InvoiceCountry: string;
    public ShippingPostalCode: string;
    public TaxInclusiveAmount: number;
    public YourReference: string;
    public ShippingCountry: string;
    public RestExclusiveAmountCurrency: number;
    public ID: number;
    public TaxInclusiveAmountCurrency: number;
    public ShippingAddressLine2: string;
    public PaymentTermsID: number;
    public DeliveryDate: LocalDate;
    public ShippingCity: string;
    public ShippingCountryCode: string;
    public InvoiceCountryCode: string;
    public InvoiceCity: string;
    public CreatedAt: Date;
    public CustomerID: number;
    public SupplierOrgNumber: string;
    public CustomerPerson: string;
    public UpdatedAt: Date;
    public VatTotalsAmountCurrency: number;
    public CustomerOrgNumber: string;
    public UpdateCurrencyAmountsOnDateChange: boolean;
    public DistributionPlanID: number;
    public UpdatedBy: string;
    public AccrualID: number;
    public TaxExclusiveAmountCurrency: number;
    public InvoiceAddressLine2: string;
    public InvoiceAddressLine3: string;
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

    public DiscountPercent: number;
    public DiscountCurrency: number;
    public VatPercent: number;
    public DimensionsID: number;
    public PriceSetByUser: boolean;
    public SumTotalIncVatCurrency: number;
    public Discount: number;
    public Deleted: boolean;
    public PriceExVatCurrency: number;
    public ReadyToInvoice: boolean;
    public VatTypeID: number;
    public StatusCode: number;
    public CostPrice: number;
    public CurrencyCodeID: number;
    public CalculateGrossPriceBasedOnNetPrice: boolean;
    public CreatedBy: string;
    public AccountID: number;
    public SumTotalExVat: number;
    public SumTotalIncVat: number;
    public Comment: string;
    public SumVat: number;
    public PriceExVat: number;
    public CurrencyExchangeRate: number;
    public SumVatCurrency: number;
    public SumTotalExVatCurrency: number;
    public CustomerOrderID: number;
    public ItemText: string;
    public SortIndex: number;
    public ID: number;
    public ItemSourceID: number;
    public ProductID: number;
    public PriceIncVat: number;
    public NumberOfItems: number;
    public CreatedAt: Date;
    public Unit: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
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

    public UpdateCurrencyOnToInvoice: boolean;
    public PrintStatus: number;
    public CustomerName: string;
    public TaxExclusiveAmount: number;
    public InvoicePostalCode: string;
    public Deleted: boolean;
    public QuoteNumberSeriesID: number;
    public OurReference: string;
    public StatusCode: number;
    public PayableRoundingAmount: number;
    public DeliveryTermsID: number;
    public InvoiceReceiverName: string;
    public PayableRoundingCurrencyAmount: number;
    public QuoteDate: LocalDate;
    public EmailAddress: string;
    public UseReportID: number;
    public CurrencyCodeID: number;
    public CreatedBy: string;
    public VatTotalsAmount: number;
    public ShippingAddressLine1: string;
    public InvoiceAddressLine1: string;
    public DeliveryMethod: string;
    public Comment: string;
    public ShippingAddressLine3: string;
    public InquiryReference: number;
    public InternalNote: string;
    public DeliveryName: string;
    public PaymentInfoTypeID: number;
    public CurrencyExchangeRate: number;
    public FreeTxt: string;
    public DeliveryTerm: string;
    public DefaultDimensionsID: number;
    public UpdateCurrencyOnToOrder: boolean;
    public CreditDays: number;
    public SalesPerson: string;
    public Requisition: string;
    public DefaultSellerID: number;
    public PaymentTerm: string;
    public InvoiceCountry: string;
    public QuoteNumber: number;
    public ShippingPostalCode: string;
    public TaxInclusiveAmount: number;
    public YourReference: string;
    public ShippingCountry: string;
    public ID: number;
    public TaxInclusiveAmountCurrency: number;
    public ShippingAddressLine2: string;
    public PaymentTermsID: number;
    public DeliveryDate: LocalDate;
    public ShippingCity: string;
    public ShippingCountryCode: string;
    public InvoiceCountryCode: string;
    public InvoiceCity: string;
    public CreatedAt: Date;
    public CustomerID: number;
    public ValidUntilDate: LocalDate;
    public SupplierOrgNumber: string;
    public CustomerPerson: string;
    public UpdatedAt: Date;
    public VatTotalsAmountCurrency: number;
    public CustomerOrgNumber: string;
    public UpdateCurrencyAmountsOnDateChange: boolean;
    public DistributionPlanID: number;
    public UpdatedBy: string;
    public TaxExclusiveAmountCurrency: number;
    public InvoiceAddressLine2: string;
    public InvoiceAddressLine3: string;
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

    public CustomerQuoteID: number;
    public DiscountPercent: number;
    public DiscountCurrency: number;
    public VatPercent: number;
    public DimensionsID: number;
    public PriceSetByUser: boolean;
    public SumTotalIncVatCurrency: number;
    public Discount: number;
    public Deleted: boolean;
    public PriceExVatCurrency: number;
    public VatTypeID: number;
    public StatusCode: number;
    public CostPrice: number;
    public CurrencyCodeID: number;
    public CalculateGrossPriceBasedOnNetPrice: boolean;
    public CreatedBy: string;
    public AccountID: number;
    public SumTotalExVat: number;
    public SumTotalIncVat: number;
    public Comment: string;
    public SumVat: number;
    public PriceExVat: number;
    public CurrencyExchangeRate: number;
    public SumVatCurrency: number;
    public SumTotalExVatCurrency: number;
    public ItemText: string;
    public SortIndex: number;
    public ID: number;
    public ProductID: number;
    public PriceIncVat: number;
    public NumberOfItems: number;
    public CreatedAt: Date;
    public Unit: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
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

    public IntegrateWithDebtCollection: boolean;
    public CreditorNumber: number;
    public CustomerInvoiceReminderSettingsID: number;
    public Deleted: boolean;
    public StatusCode: number;
    public CreatedBy: string;
    public DebtCollectionFormat: number;
    public DebtCollectionAutomationID: number;
    public ID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomerInvoiceReminderSettings: CustomerInvoiceReminderSettings;
    public DebtCollectionAutomation: Array<DebtCollectionAutomation>;
    public CustomFields: any;
}


export class ItemSource extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ItemSource';

    public Deleted: boolean;
    public StatusCode: number;
    public CreatedBy: string;
    public ID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public Details: Array<ItemSourceDetail>;
    public CustomFields: any;
}


export class ItemSourceDetail extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ItemSourceDetail';

    public Deleted: boolean;
    public SourceFK: number;
    public StatusCode: number;
    public SourceType: string;
    public Amount: number;
    public CreatedBy: string;
    public Tag: string;
    public Description: string;
    public ID: number;
    public ItemSourceID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class PaymentInfoType extends UniEntity {
    public static RelativeUrl = 'paymentinfotype';
    public static EntityType = 'PaymentInfoType';

    public Locked: boolean;
    public Deleted: boolean;
    public StatusCode: number;
    public CreatedBy: string;
    public Length: number;
    public Name: string;
    public ID: number;
    public Control: Modulus;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public Type: PaymentInfoTypeEnum;
    public UpdatedBy: string;
    public _createguid: string;
    public PaymentInfoTypeParts: Array<PaymentInfoTypePart>;
    public CustomFields: any;
}


export class PaymentInfoTypePart extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'PaymentInfoTypePart';

    public Deleted: boolean;
    public StatusCode: number;
    public Part: string;
    public CreatedBy: string;
    public PaymentInfoTypeID: number;
    public Length: number;
    public SortIndex: number;
    public ID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class RecurringInvoice extends UniEntity {
    public static RelativeUrl = 'recurringinvoices';
    public static EntityType = 'RecurringInvoice';

    public TimePeriod: RecurringPeriod;
    public PrintStatus: number;
    public CustomerName: string;
    public TaxExclusiveAmount: number;
    public PreparationDays: number;
    public ProduceAs: RecurringResult;
    public InvoicePostalCode: string;
    public Deleted: boolean;
    public OurReference: string;
    public StatusCode: number;
    public AmountRegards: string;
    public MaxIterations: number;
    public PayableRoundingAmount: number;
    public DeliveryTermsID: number;
    public InvoiceReceiverName: string;
    public PayableRoundingCurrencyAmount: number;
    public NotifyUser: string;
    public EmailAddress: string;
    public PaymentInformation: string;
    public UseReportID: number;
    public NoCreditDays: boolean;
    public CurrencyCodeID: number;
    public CreatedBy: string;
    public VatTotalsAmount: number;
    public ShippingAddressLine1: string;
    public NextInvoiceDate: LocalDate;
    public InvoiceAddressLine1: string;
    public DeliveryMethod: string;
    public Comment: string;
    public ShippingAddressLine3: string;
    public Interval: number;
    public InternalNote: string;
    public DeliveryName: string;
    public StartDate: LocalDate;
    public NotifyWhenOrdersArePrepared: boolean;
    public PaymentInfoTypeID: number;
    public CurrencyExchangeRate: number;
    public FreeTxt: string;
    public DeliveryTerm: string;
    public DefaultDimensionsID: number;
    public CreditDays: number;
    public SalesPerson: string;
    public Requisition: string;
    public DefaultSellerID: number;
    public PaymentTerm: string;
    public InvoiceCountry: string;
    public ShippingPostalCode: string;
    public TaxInclusiveAmount: number;
    public YourReference: string;
    public ShippingCountry: string;
    public ID: number;
    public TaxInclusiveAmountCurrency: number;
    public ShippingAddressLine2: string;
    public PaymentTermsID: number;
    public DeliveryDate: LocalDate;
    public ShippingCity: string;
    public InvoiceNumberSeriesID: number;
    public ShippingCountryCode: string;
    public InvoiceCountryCode: string;
    public InvoiceCity: string;
    public CreatedAt: Date;
    public CustomerID: number;
    public SupplierOrgNumber: string;
    public EndDate: LocalDate;
    public CustomerPerson: string;
    public UpdatedAt: Date;
    public VatTotalsAmountCurrency: number;
    public CustomerOrgNumber: string;
    public UpdateCurrencyAmountsOnDateChange: boolean;
    public DistributionPlanID: number;
    public UpdatedBy: string;
    public TaxExclusiveAmountCurrency: number;
    public InvoiceAddressLine2: string;
    public Payment: string;
    public NotifyWhenRecurringEnds: boolean;
    public InvoiceAddressLine3: string;
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

    public DiscountPercent: number;
    public DiscountCurrency: number;
    public VatPercent: number;
    public DimensionsID: number;
    public PriceSetByUser: boolean;
    public SumTotalIncVatCurrency: number;
    public Discount: number;
    public Deleted: boolean;
    public PriceExVatCurrency: number;
    public VatTypeID: number;
    public StatusCode: number;
    public ReduceIncompletePeriod: boolean;
    public CurrencyCodeID: number;
    public CalculateGrossPriceBasedOnNetPrice: boolean;
    public CreatedBy: string;
    public AccountID: number;
    public SumTotalExVat: number;
    public SumTotalIncVat: number;
    public Comment: string;
    public SumVat: number;
    public PriceExVat: number;
    public CurrencyExchangeRate: number;
    public SumVatCurrency: number;
    public SumTotalExVatCurrency: number;
    public ItemText: string;
    public SortIndex: number;
    public ID: number;
    public ProductID: number;
    public PriceIncVat: number;
    public PricingSource: PricingSource;
    public NumberOfItems: number;
    public CreatedAt: Date;
    public RecurringInvoiceID: number;
    public Unit: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public TimeFactor: RecurringPeriod;
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

    public InvoiceDate: LocalDate;
    public OrderID: number;
    public Deleted: boolean;
    public StatusCode: number;
    public NotifiedOrdersPrepared: boolean;
    public CreatedBy: string;
    public Comment: string;
    public IterationNumber: number;
    public CreationDate: LocalDate;
    public ID: number;
    public CreatedAt: Date;
    public RecurringInvoiceID: number;
    public InvoiceID: number;
    public UpdatedAt: Date;
    public NotifiedRecurringEnds: boolean;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Seller extends UniEntity {
    public static RelativeUrl = 'sellers';
    public static EntityType = 'Seller';

    public Deleted: boolean;
    public UserID: number;
    public StatusCode: number;
    public EmployeeID: number;
    public TeamID: number;
    public CreatedBy: string;
    public DefaultDimensionsID: number;
    public Name: string;
    public ID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
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

    public CustomerQuoteID: number;
    public Deleted: boolean;
    public StatusCode: number;
    public Amount: number;
    public CreatedBy: string;
    public Percent: number;
    public SellerID: number;
    public CustomerInvoiceID: number;
    public CustomerOrderID: number;
    public ID: number;
    public CreatedAt: Date;
    public RecurringInvoiceID: number;
    public CustomerID: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public Seller: Seller;
    public CustomFields: any;
}


export class SubCompany extends UniEntity {
    public static RelativeUrl = 'subcompanies';
    public static EntityType = 'SubCompany';

    public Deleted: boolean;
    public StatusCode: number;
    public CreatedBy: string;
    public CompanyID: number;
    public CompanyType: CompanyRelation;
    public ID: number;
    public CompanyKey: string;
    public CompanyName: string;
    public CreatedAt: Date;
    public CustomerID: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public Customer: Customer;
    public CustomFields: any;
}


export class Supplier extends UniEntity {
    public static RelativeUrl = 'suppliers';
    public static EntityType = 'Supplier';

    public CostAllocationID: number;
    public DimensionsID: number;
    public Deleted: boolean;
    public PeppolAddress: string;
    public StatusCode: number;
    public SubAccountNumberSeriesID: number;
    public CurrencyCodeID: number;
    public CreatedBy: string;
    public WebUrl: string;
    public SupplierNumber: number;
    public CreditDays: number;
    public BusinessRelationID: number;
    public Localization: string;
    public ID: number;
    public CreatedAt: Date;
    public SelfEmployed: boolean;
    public GLN: string;
    public UpdatedAt: Date;
    public OrgNumber: string;
    public UpdatedBy: string;
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

    public Deleted: boolean;
    public StatusCode: number;
    public CreatedBy: string;
    public CreditDays: number;
    public TermsType: TermsType;
    public Description: string;
    public Name: string;
    public ID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class TOFCurrencySettings extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'TOFCurrencySettings';

    public Deleted: boolean;
    public StatusCode: number;
    public UpdateCurrencyAmountsOnQuotedateChange: boolean;
    public CreatedBy: string;
    public UpdateCurrencyAmountsOnOrderToInvoice: boolean;
    public ID: number;
    public UpdateCurrencyAmountsOnQuoteToInvoice: boolean;
    public UpdateCurrencyAmountsOnOrderdateChange: boolean;
    public CreatedAt: Date;
    public UpdateCurrencyAmountsOnQuoteToOrder: boolean;
    public UpdatedAt: Date;
    public UpdateCurrencyAmountsOnInvoicedateChange: boolean;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Address extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Address';

    public AddressLine3: string;
    public AddressLine1: string;
    public Deleted: boolean;
    public StatusCode: number;
    public City: string;
    public CreatedBy: string;
    public CountryCode: string;
    public AddressLine2: string;
    public BusinessRelationID: number;
    public ID: number;
    public Region: string;
    public Country: string;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public PostalCode: string;
    public _createguid: string;
    public BusinessRelation: BusinessRelation;
    public CustomFields: any;
}


export class BusinessRelation extends UniEntity {
    public static RelativeUrl = 'business-relations';
    public static EntityType = 'BusinessRelation';

    public Deleted: boolean;
    public StatusCode: number;
    public ShippingAddressID: number;
    public CreatedBy: string;
    public DefaultBankAccountID: number;
    public DefaultEmailID: number;
    public DefaultPhoneID: number;
    public Name: string;
    public InvoiceAddressID: number;
    public ID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public DefaultContactID: number;
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

    public Deleted: boolean;
    public Role: string;
    public StatusCode: number;
    public CreatedBy: string;
    public Comment: string;
    public InfoID: number;
    public ID: number;
    public ParentBusinessRelationID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public ParentBusinessRelation: BusinessRelation;
    public Info: BusinessRelation;
    public CustomFields: any;
}


export class Email extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Email';

    public Deleted: boolean;
    public StatusCode: number;
    public EmailAddress: string;
    public CreatedBy: string;
    public Description: string;
    public BusinessRelationID: number;
    public ID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public Type: string;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Phone extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Phone';

    public Deleted: boolean;
    public StatusCode: number;
    public CreatedBy: string;
    public CountryCode: string;
    public Description: string;
    public BusinessRelationID: number;
    public ID: number;
    public Number: string;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public Type: PhoneTypeEnum;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class AGACalculation extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AGACalculation';

    public DimensionsID: number;
    public Deleted: boolean;
    public PayrollRunID: number;
    public StatusCode: number;
    public CreatedBy: string;
    public ID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
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

    public Deleted: boolean;
    public StatusCode: number;
    public CreatedBy: string;
    public SubEntityID: number;
    public freeAmount: number;
    public ID: number;
    public CreatedAt: Date;
    public AGACalculationID: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public subEntity: SubEntity;
    public CustomFields: any;
}


export class AGATax extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AGATax';

    public agaBase: number;
    public zone: number;
    public Deleted: boolean;
    public beregningsKode: number;
    public StatusCode: number;
    public CreatedBy: string;
    public SubEntityID: number;
    public agaRate: number;
    public AGARateID: number;
    public ID: number;
    public CreatedAt: Date;
    public AGACalculationID: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public municipalityName: string;
    public zoneName: string;
    public _createguid: string;
    public subEntity: SubEntity;
    public CustomFields: any;
}


export class AGAPension extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AGAPension';

    public agaBase: number;
    public zone: number;
    public Deleted: boolean;
    public beregningsKode: number;
    public StatusCode: number;
    public CreatedBy: string;
    public SubEntityID: number;
    public agaRate: number;
    public AGARateID: number;
    public ID: number;
    public CreatedAt: Date;
    public AGACalculationID: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public municipalityName: string;
    public zoneName: string;
    public _createguid: string;
    public subEntity: SubEntity;
    public CustomFields: any;
}


export class AGADraw extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AGADraw';

    public agaBase: number;
    public zone: number;
    public Deleted: boolean;
    public beregningsKode: number;
    public StatusCode: number;
    public CreatedBy: string;
    public SubEntityID: number;
    public agaRate: number;
    public AGARateID: number;
    public ID: number;
    public CreatedAt: Date;
    public AGACalculationID: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public municipalityName: string;
    public zoneName: string;
    public _createguid: string;
    public subEntity: SubEntity;
    public CustomFields: any;
}


export class ForeignerWithPercent extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ForeignerWithPercent';

    public agaBase: number;
    public Deleted: boolean;
    public StatusCode: number;
    public CreatedBy: string;
    public SubEntityID: number;
    public agaRate: number;
    public ID: number;
    public CreatedAt: Date;
    public AGACalculationID: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public municipalityName: string;
    public zoneName: string;
    public _createguid: string;
    public subEntity: SubEntity;
    public CustomFields: any;
}


export class DrawForeignerWithPercent extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'DrawForeignerWithPercent';

    public agaBase: number;
    public Deleted: boolean;
    public StatusCode: number;
    public CreatedBy: string;
    public SubEntityID: number;
    public agaRate: number;
    public ID: number;
    public CreatedAt: Date;
    public AGACalculationID: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public municipalityName: string;
    public zoneName: string;
    public _createguid: string;
    public subEntity: SubEntity;
    public CustomFields: any;
}


export class ForeignerWithAmount extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ForeignerWithAmount';

    public Deleted: boolean;
    public StatusCode: number;
    public aga: number;
    public persons: number;
    public CreatedBy: string;
    public SubEntityID: number;
    public ID: number;
    public CreatedAt: Date;
    public AGACalculationID: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public municipalityName: string;
    public zoneName: string;
    public _createguid: string;
    public subEntity: SubEntity;
    public CustomFields: any;
}


export class TaxAndAgaSums extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'TaxAndAgaSums';

    public Deleted: boolean;
    public WithholdingTax: number;
    public FinancialTax: number;
    public StatusCode: number;
    public CreatedBy: string;
    public GarnishmentTax: number;
    public ID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class AmeldingData extends UniEntity {
    public static RelativeUrl = 'amelding';
    public static EntityType = 'AmeldingData';

    public feedbackFileID: number;
    public messageID: string;
    public Deleted: boolean;
    public initiated: Date;
    public OppgaveHash: string;
    public attachmentFileID: number;
    public PayrollRunID: number;
    public StatusCode: number;
    public status: number;
    public receiptID: number;
    public replacesID: number;
    public CreatedBy: string;
    public mainFileID: number;
    public year: number;
    public altinnStatus: string;
    public period: number;
    public created: Date;
    public ID: number;
    public sent: Date;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public type: AmeldingType;
    public UpdatedBy: string;
    public xmlValidationErrors: string;
    public _createguid: string;
    public replaceThis: string;
    public log: Array<AmeldingLog>;
    public CustomFields: any;
}


export class AmeldingLog extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AmeldingLog';

    public registry: SalaryRegistry;
    public Deleted: boolean;
    public StatusCode: number;
    public CreatedBy: string;
    public ID: number;
    public AmeldingsID: number;
    public CreatedAt: Date;
    public key: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class BasicAmount extends UniEntity {
    public static RelativeUrl = 'basicamounts';
    public static EntityType = 'BasicAmount';

    public Deleted: boolean;
    public AveragePrYear: number;
    public StatusCode: number;
    public ConversionFactor: number;
    public CreatedBy: string;
    public FromDate: Date;
    public ID: number;
    public BasicAmountPrMonth: number;
    public CreatedAt: Date;
    public BasicAmountPrYear: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class CompanySalary extends UniEntity {
    public static RelativeUrl = 'companysalary';
    public static EntityType = 'CompanySalary';

    public Base_PayAsYouEarnTaxOnPensions: boolean;
    public Base_SpesialDeductionForMaritim: boolean;
    public Deleted: boolean;
    public AllowOver6G: boolean;
    public WagetypeAdvancePayment: number;
    public MainAccountAllocatedAGA: number;
    public StatusCode: number;
    public HoursPerMonth: number;
    public PostGarnishmentToTaxAccount: boolean;
    public MainAccountCostFinancial: number;
    public Base_Svalbard: boolean;
    public CreatedBy: string;
    public RateFinancialTax: number;
    public WagetypeAdvancePaymentAuto: number;
    public PaycheckZipReportID: number;
    public MainAccountCostVacation: number;
    public Base_TaxFreeOrganization: boolean;
    public InterrimRemitAccount: number;
    public MainAccountCostAGA: number;
    public PostToTaxDraw: boolean;
    public MainAccountAllocatedFinancial: number;
    public FreeAmount: number;
    public MainAccountAllocatedAGAVacation: number;
    public Base_NettoPaymentForMaritim: boolean;
    public MainAccountCostAGAVacation: number;
    public Base_NettoPayment: boolean;
    public PaymentInterval: CompanySalaryPaymentInterval;
    public MainAccountCostFinancialVacation: number;
    public OtpExportActive: boolean;
    public HourFTEs: number;
    public ID: number;
    public MainAccountAllocatedFinancialVacation: number;
    public CalculateFinancialTax: boolean;
    public WageDeductionDueToHoliday: WageDeductionDueToHolidayType;
    public CreatedAt: Date;
    public MainAccountAllocatedVacation: number;
    public Base_JanMayenAndBiCountries: boolean;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class CompanyVacationRate extends UniEntity {
    public static RelativeUrl = 'companyvacationrates';
    public static EntityType = 'CompanyVacationRate';

    public Deleted: boolean;
    public StatusCode: number;
    public CreatedBy: string;
    public Rate: number;
    public FromDate: Date;
    public ID: number;
    public CreatedAt: Date;
    public Rate60: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class EmployeeCategory extends UniEntity {
    public static RelativeUrl = 'employeecategories';
    public static EntityType = 'EmployeeCategory';

    public Deleted: boolean;
    public StatusCode: number;
    public EmployeeCategoryLinkID: number;
    public CreatedBy: string;
    public Name: string;
    public ID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class EmployeeCategoryLink extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'EmployeeCategoryLink';

    public Deleted: boolean;
    public StatusCode: number;
    public EmployeeID: number;
    public EmployeeNumber: number;
    public CreatedBy: string;
    public ID: number;
    public EmployeeCategoryID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
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
    public FreeText: string;
    public EmployeeLanguageID: number;
    public Deleted: boolean;
    public OtpStatus: OtpStatus;
    public IncludeOtpUntilYear: number;
    public UserID: number;
    public MunicipalityNo: string;
    public StatusCode: number;
    public InternasjonalIDType: InternationalIDType;
    public AdvancePaymentAmount: number;
    public PhotoID: number;
    public EmploymentDateOtp: LocalDate;
    public EmployeeNumber: number;
    public CreatedBy: string;
    public SubEntityID: number;
    public ForeignWorker: ForeignWorker;
    public EmploymentDate: Date;
    public InternasjonalIDCountry: string;
    public Active: boolean;
    public PaymentInterval: PaymentInterval;
    public BusinessRelationID: number;
    public TypeOfPaymentOtp: TypeOfPaymentOtp;
    public ID: number;
    public OtpExport: boolean;
    public BirthDate: Date;
    public InternationalID: string;
    public IncludeOtpUntilMonth: number;
    public Sex: GenderEnum;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
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

    public loennFraBiarbeidsgiverID: number;
    public Deleted: boolean;
    public ResultatStatus: string;
    public SecondaryPercent: number;
    public NotMainEmployer: boolean;
    public NonTaxableAmount: number;
    public StatusCode: number;
    public IssueDate: Date;
    public EmployeeID: number;
    public loennFraHovedarbeidsgiverID: number;
    public EmployeeNumber: number;
    public CreatedBy: string;
    public Percent: number;
    public Year: number;
    public ufoereYtelserAndreID: number;
    public TaxcardId: number;
    public SecondaryTable: string;
    public Table: string;
    public Tilleggsopplysning: string;
    public loennKunTrygdeavgiftTilUtenlandskBorgerSomGrensegjengerID: number;
    public SKDXml: string;
    public loennTilUtenrikstjenestemannID: number;
    public ID: number;
    public pensjonID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public loennKunTrygdeavgiftTilUtenlandskBorgerID: number;
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

    public AntallMaanederForTrekk: number;
    public Deleted: boolean;
    public NonTaxableAmount: number;
    public freeAmountType: FreeAmountType;
    public CreatedBy: string;
    public Percent: number;
    public Table: string;
    public tabellType: TabellType;
    public ID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class EmployeeLeave extends UniEntity {
    public static RelativeUrl = 'EmployeeLeave';
    public static EntityType = 'EmployeeLeave';

    public Deleted: boolean;
    public LeavePercent: number;
    public StatusCode: number;
    public LeaveType: Leavetype;
    public ToDate: Date;
    public CreatedBy: string;
    public Description: string;
    public FromDate: Date;
    public ID: number;
    public AffectsOtp: boolean;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public EmploymentID: number;
    public UpdatedBy: string;
    public _createguid: string;
    public Employment: Employment;
    public CustomFields: any;
}


export class Employment extends UniEntity {
    public static RelativeUrl = 'employments';
    public static EntityType = 'Employment';

    public RemunerationType: RemunerationType;
    public TypeOfEmployment: TypeOfEmployment;
    public DimensionsID: number;
    public Deleted: boolean;
    public JobName: string;
    public LastSalaryChangeDate: Date;
    public StatusCode: number;
    public HoursPerWeek: number;
    public HourRate: number;
    public EmployeeID: number;
    public ShipReg: ShipRegistry;
    public UserDefinedRate: number;
    public EmployeeNumber: number;
    public CreatedBy: string;
    public SubEntityID: number;
    public SeniorityDate: Date;
    public JobCode: string;
    public WorkPercent: number;
    public MonthRate: number;
    public StartDate: Date;
    public EndDateReason: EndDateReason;
    public RegulativeGroupID: number;
    public ShipType: ShipTypeOfShip;
    public LedgerAccount: string;
    public LastWorkPercentChangeDate: Date;
    public ID: number;
    public WorkingHoursScheme: WorkingHoursScheme;
    public RegulativeStepNr: number;
    public TradeArea: ShipTradeArea;
    public CreatedAt: Date;
    public Standard: boolean;
    public EmploymentType: EmploymentType;
    public EndDate: Date;
    public UpdatedAt: Date;
    public PayGrade: string;
    public UpdatedBy: string;
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

    public Deleted: boolean;
    public StatusCode: number;
    public Amount: number;
    public CreatedBy: string;
    public SubentityID: number;
    public AffectsAGA: boolean;
    public Description: string;
    public FromDate: Date;
    public ID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class OtpExportWagetype extends UniEntity {
    public static RelativeUrl = 'otpexportwagetypes';
    public static EntityType = 'OtpExportWagetype';

    public Deleted: boolean;
    public StatusCode: number;
    public CreatedBy: string;
    public ID: number;
    public CreatedAt: Date;
    public WageTypeNumber: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class PayrollRun extends UniEntity {
    public static RelativeUrl = 'payrollrun';
    public static EntityType = 'PayrollRun';

    public FreeText: string;
    public Deleted: boolean;
    public StatusCode: number;
    public ToDate: Date;
    public JournalEntryNumber: string;
    public CreatedBy: string;
    public HolidayPayDeduction: boolean;
    public AGAonRun: number;
    public PaycheckFileID: number;
    public AGAFreeAmount: number;
    public Description: string;
    public PayDate: Date;
    public needsRecalc: boolean;
    public FromDate: Date;
    public ID: number;
    public CreatedAt: Date;
    public ExcludeRecurringPosts: boolean;
    public taxdrawfactor: TaxDrawFactor;
    public SettlementDate: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public transactions: Array<SalaryTransaction>;
    public agacalculation: Array<AGACalculation>;
    public CustomFields: any;
}


export class PayrollRunCategoryLink extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'PayrollRunCategoryLink';

    public Deleted: boolean;
    public PayrollRunID: number;
    public StatusCode: number;
    public CreatedBy: string;
    public ID: number;
    public EmployeeCategoryID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public EmployeeCategory: EmployeeCategory;
    public PayrollRun: PayrollRun;
    public CustomFields: any;
}


export class PostingSummaryDraft extends UniEntity {
    public draftWithDims: string;
    public status: SummaryJobStatus;
    public JobInfoID: number;
    public statusTime: Date;
    public PayrollID: number;
    public draftBasic: string;
    public ID: number;
    public draftWithDimsOnBalance: string;
}


export class Regulative extends UniEntity {
    public static RelativeUrl = 'regulatives';
    public static EntityType = 'Regulative';

    public Deleted: boolean;
    public StatusCode: number;
    public CreatedBy: string;
    public StartDate: LocalDate;
    public RegulativeGroupID: number;
    public ID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public Steps: Array<RegulativeStep>;
    public CustomFields: any;
}


export class RegulativeGroup extends UniEntity {
    public static RelativeUrl = 'regulativegroups';
    public static EntityType = 'RegulativeGroup';

    public Deleted: boolean;
    public StatusCode: number;
    public CreatedBy: string;
    public Name: string;
    public ID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public Regulatives: Array<Regulative>;
    public CustomFields: any;
}


export class RegulativeStep extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'RegulativeStep';

    public Deleted: boolean;
    public StatusCode: number;
    public Amount: number;
    public CreatedBy: string;
    public ID: number;
    public Step: number;
    public RegulativeID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class SalaryBalance extends UniEntity {
    public static RelativeUrl = 'salarybalances';
    public static EntityType = 'SalaryBalance';

    public KID: string;
    public Deleted: boolean;
    public CreatePayment: boolean;
    public SupplierID: number;
    public StatusCode: number;
    public EmployeeID: number;
    public ToDate: Date;
    public CreatedBy: string;
    public InstalmentType: SalBalType;
    public MaxAmount: number;
    public Instalment: number;
    public InstalmentPercent: number;
    public FromDate: Date;
    public Name: string;
    public MinAmount: number;
    public ID: number;
    public SalaryBalanceTemplateID: number;
    public CreatedAt: Date;
    public Source: SalBalSource;
    public WageTypeNumber: number;
    public UpdatedAt: Date;
    public Type: SalBalDrawType;
    public EmploymentID: number;
    public UpdatedBy: string;
    public CalculatedBalance: number;
    public Amount: number;
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

    public SalaryTransactionID: number;
    public SalaryBalanceID: number;
    public Deleted: boolean;
    public StatusCode: number;
    public Date: LocalDate;
    public Amount: number;
    public CreatedBy: string;
    public Description: string;
    public ID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public SalaryTransaction: SalaryTransaction;
    public SalaryBalance: SalaryBalance;
    public CustomFields: any;
}


export class SalaryBalanceTemplate extends UniEntity {
    public static RelativeUrl = 'salarybalancetemplates';
    public static EntityType = 'SalaryBalanceTemplate';

    public KID: string;
    public Deleted: boolean;
    public CreatePayment: boolean;
    public SupplierID: number;
    public StatusCode: number;
    public CreatedBy: string;
    public SalarytransactionDescription: string;
    public Account: number;
    public InstalmentType: SalBalType;
    public MaxAmount: number;
    public Instalment: number;
    public InstalmentPercent: number;
    public Name: string;
    public MinAmount: number;
    public ID: number;
    public CreatedAt: Date;
    public WageTypeNumber: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public Supplier: Supplier;
    public SalaryBalances: Array<SalaryBalance>;
    public CustomFields: any;
}


export class SalaryTransaction extends UniEntity {
    public static RelativeUrl = 'salarytrans';
    public static EntityType = 'SalaryTransaction';

    public DimensionsID: number;
    public SalaryBalanceID: number;
    public Deleted: boolean;
    public VatTypeID: number;
    public MunicipalityNo: string;
    public PayrollRunID: number;
    public StatusCode: number;
    public EmployeeID: number;
    public ToDate: Date;
    public EmployeeNumber: number;
    public Amount: number;
    public CreatedBy: string;
    public HolidayPayDeduction: boolean;
    public WageTypeID: number;
    public Account: number;
    public Rate: number;
    public SystemType: StdSystemType;
    public Text: string;
    public calcAGA: number;
    public recurringPostValidTo: Date;
    public FromDate: Date;
    public Sum: number;
    public ChildSalaryTransactionID: number;
    public ID: number;
    public IsRecurringPost: boolean;
    public recurringPostValidFrom: Date;
    public CreatedAt: Date;
    public WageTypeNumber: number;
    public RecurringID: number;
    public TaxbasisID: number;
    public UpdatedAt: Date;
    public EmploymentID: number;
    public UpdatedBy: string;
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

    public SalaryTransactionID: number;
    public Deleted: boolean;
    public ValueString: string;
    public StatusCode: number;
    public WageTypeSupplementID: number;
    public CreatedBy: string;
    public ValueMoney: number;
    public ValueDate2: Date;
    public ID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public ValueDate: Date;
    public UpdatedBy: string;
    public ValueBool: boolean;
    public _createguid: string;
    public WageTypeSupplement: WageTypeSupplement;
    public CustomFields: any;
}


export class SalaryYear extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'SalaryYear';

    public Deleted: boolean;
    public StatusCode: number;
    public CreatedBy: string;
    public CurrentYear: number;
    public ID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class SubEntity extends UniEntity {
    public static RelativeUrl = 'subentities';
    public static EntityType = 'SubEntity';

    public SuperiorOrganizationID: number;
    public Deleted: boolean;
    public MunicipalityNo: string;
    public StatusCode: number;
    public AgaZone: number;
    public CreatedBy: string;
    public freeAmount: number;
    public BusinessRelationID: number;
    public ID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public OrgNumber: string;
    public AgaRule: number;
    public UpdatedBy: string;
    public _createguid: string;
    public BusinessRelationInfo: BusinessRelation;
    public SuperiorOrganization: SubEntity;
    public CustomFields: any;
}


export class TaxBasis extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'TaxBasis';

    public SvalbardBasis: number;
    public SalaryTransactionID: number;
    public PensionBasis: number;
    public Deleted: boolean;
    public SailorBasis: number;
    public ForeignBorderCommuterBasis: number;
    public StatusCode: number;
    public CreatedBy: string;
    public Basis: number;
    public ForeignCitizenInsuranceBasis: number;
    public JanMayenBasis: number;
    public DisabilityOtherBasis: number;
    public ID: number;
    public CreatedAt: Date;
    public PensionSourcetaxBasis: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Travel extends UniEntity {
    public static RelativeUrl = 'travels';
    public static EntityType = 'Travel';

    public State: state;
    public DimensionsID: number;
    public Deleted: boolean;
    public SupplierID: number;
    public Phone: string;
    public StatusCode: number;
    public PersonID: string;
    public SourceSystem: string;
    public EmployeeNumber: number;
    public CreatedBy: string;
    public Comment: string;
    public Description: string;
    public Name: string;
    public Purpose: string;
    public ID: number;
    public TravelIdentificator: string;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public Email: string;
    public UpdatedBy: string;
    public AdvanceAmount: number;
    public _createguid: string;
    public TravelLines: Array<TravelLine>;
    public Dimensions: Dimensions;
    public CustomFields: any;
}


export class TravelLine extends UniEntity {
    public static RelativeUrl = 'travellines';
    public static EntityType = 'TravelLine';

    public DimensionsID: number;
    public Deleted: boolean;
    public LineState: linestate;
    public VatTypeID: number;
    public StatusCode: number;
    public paytransID: number;
    public Amount: number;
    public CreatedBy: string;
    public TravelID: number;
    public CostType: costtype;
    public From: Date;
    public Rate: number;
    public To: Date;
    public Description: string;
    public InvoiceAccount: number;
    public AccountNumber: number;
    public TypeID: number;
    public ID: number;
    public TravelIdentificator: string;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
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

    public ForeignDescription: string;
    public Deleted: boolean;
    public StatusCode: number;
    public CreatedBy: string;
    public ForeignTypeID: string;
    public Description: string;
    public InvoiceAccount: number;
    public ID: number;
    public CreatedAt: Date;
    public WageTypeNumber: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class VacationPayLine extends UniEntity {
    public static RelativeUrl = 'VacationPayLines';
    public static EntityType = 'VacationPayLine';

    public Deleted: boolean;
    public StatusCode: number;
    public EmployeeID: number;
    public CreatedBy: string;
    public Year: number;
    public ManualVacationPayBase: number;
    public ID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public PaidTaxFreeVacationPay: number;
    public PaidVacationPay: number;
    public SystemVacationPayBase: number;
    public Rate: number;
    public VacationPay: number;
    public MissingEarlierVacationPay: number;
    public _createguid: string;
    public Age: number;
    public Rate60: number;
    public VacationPay60: number;
    public Withdrawal: number;
    public Employee: Employee;
    public CustomFields: any;
}


export class VacationRateEmployee extends UniEntity {
    public static RelativeUrl = 'employeevacationrates';
    public static EntityType = 'VacationRateEmployee';

    public Deleted: boolean;
    public StatusCode: number;
    public EmployeeID: number;
    public CreatedBy: string;
    public Rate: number;
    public StartDate: Date;
    public ID: number;
    public CreatedAt: Date;
    public Rate60: number;
    public EndDate: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class WageType extends UniEntity {
    public static RelativeUrl = 'wagetypes';
    public static EntityType = 'WageType';

    public HideFromPaycheck: boolean;
    public Base_div3: boolean;
    public Base_div2: boolean;
    public RatetypeColumn: RateTypeColumn;
    public Deleted: boolean;
    public Limit_newRate: number;
    public Base_EmploymentTax: boolean;
    public StatusCode: number;
    public Benefit: string;
    public SpecialTaxAndContributionsRule: SpecialTaxAndContributionsRule;
    public SpecialAgaRule: SpecialAgaRule;
    public Base_Vacation: boolean;
    public Limit_value: number;
    public CreatedBy: string;
    public SpecialTaxHandling: string;
    public RateFactor: number;
    public SystemRequiredWageType: number;
    public SupplementPackage: string;
    public Base_Payment: boolean;
    public Rate: number;
    public FixedSalaryHolidayDeduction: boolean;
    public Systemtype: string;
    public WageTypeName: string;
    public Description: string;
    public StandardWageTypeFor: StdWageType;
    public AccountNumber: number;
    public Limit_type: LimitType;
    public DaysOnBoard: boolean;
    public ID: number;
    public NoNumberOfHours: boolean;
    public Limit_WageTypeNumber: number;
    public GetRateFrom: GetRateFrom;
    public CreatedAt: Date;
    public AccountNumber_balance: number;
    public taxtype: TaxType;
    public IncomeType: string;
    public WageTypeNumber: number;
    public ValidYear: number;
    public Postnr: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public SupplementaryInformations: Array<WageTypeSupplement>;
    public CustomFields: any;
}


export class WageTypeSupplement extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'WageTypeSupplement';

    public Deleted: boolean;
    public StatusCode: number;
    public CreatedBy: string;
    public WageTypeID: number;
    public ameldingType: string;
    public ValueType: Valuetype;
    public Description: string;
    public SuggestedValue: string;
    public Name: string;
    public GetValueFromTrans: boolean;
    public ID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class WageTypeTranslation extends UniEntity {
    public static RelativeUrl = 'wagetypetranslations';
    public static EntityType = 'WageTypeTranslation';

    public EmployeeLanguageID: number;
    public Deleted: boolean;
    public StatusCode: number;
    public CreatedBy: string;
    public WageTypeName: string;
    public ID: number;
    public CreatedAt: Date;
    public WageTypeNumber: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public EmployeeLanguage: EmployeeLanguage;
    public CustomFields: any;
}


export class PensionScheme extends UniEntity {
    public static RelativeUrl = 'pensionschemes';
    public static EntityType = 'PensionScheme';

    public Deleted: boolean;
    public StatusCode: number;
    public CreatedBy: string;
    public Year: number;
    public Period: number;
    public Identificator: string;
    public ID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class PensionSchemeSupplier extends UniEntity {
    public static RelativeUrl = 'pensionschemesuppliers';
    public static EntityType = 'PensionSchemeSupplier';

    public Deleted: boolean;
    public StatusCode: number;
    public CreatedBy: string;
    public Identificator: string;
    public Name: string;
    public ID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class StandardPensionSchemeSupplier extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'StandardPensionSchemeSupplier';

    public Deleted: boolean;
    public CreatedBy: string;
    public Identificator: string;
    public Name: string;
    public ID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class EmployeeLanguage extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'EmployeeLanguage';

    public Deleted: boolean;
    public StatusCode: number;
    public CreatedBy: string;
    public ID: number;
    public LanguageCode: string;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class ComponentLayout extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ComponentLayout';

    public Deleted: boolean;
    public StatusCode: number;
    public BaseEntity: string;
    public CreatedBy: string;
    public Name: string;
    public ID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public Fields: Array<FieldLayout>;
    public CustomFields: any;
}


export class FieldLayout extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'FieldLayout';

    public Options: string;
    public EntityType: string;
    public FieldType: FieldType;
    public Deleted: boolean;
    public Legend: string;
    public Combo: number;
    public StatusCode: number;
    public HelpText: string;
    public Section: number;
    public Width: string;
    public Placement: number;
    public CreatedBy: string;
    public Sectionheader: string;
    public Property: string;
    public ComponentLayoutID: number;
    public Placeholder: string;
    public DisplayField: string;
    public Alignment: Alignment;
    public ReadOnly: boolean;
    public Description: string;
    public ID: number;
    public LookupField: boolean;
    public Label: string;
    public CreatedAt: Date;
    public LineBreak: boolean;
    public UpdatedAt: Date;
    public FieldSet: number;
    public UpdatedBy: string;
    public Hidden: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class CurrencyOverride extends UniEntity {
    public static RelativeUrl = 'currencyoverrides';
    public static EntityType = 'CurrencyOverride';

    public Deleted: boolean;
    public ToDate: LocalDate;
    public CreatedBy: string;
    public ExchangeRate: number;
    public Factor: number;
    public FromCurrencyCodeID: number;
    public FromDate: LocalDate;
    public ID: number;
    public CreatedAt: Date;
    public Source: CurrencySourceEnum;
    public ToCurrencyCodeID: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public FromCurrencyCode: CurrencyCode;
    public ToCurrencyCode: CurrencyCode;
    public CustomFields: any;
}


export class AccountAssetGroup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AccountAssetGroup';

    public Deleted: boolean;
    public CreatedBy: string;
    public AssetGroupCode: string;
    public ToAccountNumber: number;
    public FromAccountNumber: number;
    public ID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class AccountGroupSetup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AccountGroupSetup';

    public Deleted: boolean;
    public CreatedBy: string;
    public PlanType: PlanTypeEnum;
    public Name: string;
    public ID: number;
    public CreatedAt: Date;
    public ParentID: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public ExternalReference: string;
    public _createguid: string;
    public Parent: AccountGroupSetup;
    public CustomFields: any;
}


export class AccountSetup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AccountSetup';

    public AccountGroupSetupID: number;
    public Deleted: boolean;
    public VatCode: string;
    public ExpectedDebitBalance: boolean;
    public AccountName: string;
    public CreatedBy: string;
    public PlanType: PlanTypeEnum;
    public AccountNumber: number;
    public ID: number;
    public SaftMappingAccountID: number;
    public CreatedAt: Date;
    public Visible: boolean;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public AccountGroup: AccountGroupSetup;
    public SaftMappingAccount: SaftMappingAccount;
    public CustomFields: any;
}


export class AccountVisibilityGroup extends UniEntity {
    public static RelativeUrl = 'accountvisibilitygroups';
    public static EntityType = 'AccountVisibilityGroup';

    public Deleted: boolean;
    public CreatedBy: string;
    public Name: string;
    public ID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public Accounts: Array<AccountVisibilityGroupAccount>;
    public CompanyTypes: Array<CompanyType>;
    public CustomFields: any;
}


export class AccountVisibilityGroupAccount extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AccountVisibilityGroupAccount';

    public AccountSetupID: number;
    public Deleted: boolean;
    public CreatedBy: string;
    public AccountVisibilityGroupID: number;
    public ID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class AGARate extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AGARate';

    public RateValidFrom: Date;
    public Deleted: boolean;
    public CreatedBy: string;
    public Rate: number;
    public ID: number;
    public ZoneID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public sector: Array<AGASector>;
    public CustomFields: any;
}


export class AGASector extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AGASector';

    public RateID: number;
    public SectorID: number;
    public Deleted: boolean;
    public CreatedBy: string;
    public Sector: string;
    public ValidFrom: Date;
    public Rate: number;
    public freeAmount: number;
    public ID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class AGAZone extends UniEntity {
    public static RelativeUrl = 'AGAZones';
    public static EntityType = 'AGAZone';

    public Deleted: boolean;
    public ZoneName: string;
    public CreatedBy: string;
    public ID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public rates: Array<AGARate>;
    public municipalsOnZone: Array<MunicipalAGAZone>;
    public CustomFields: any;
}


export class Agreement extends UniEntity {
    public static RelativeUrl = 'agreements';
    public static EntityType = 'Agreement';

    public Deleted: boolean;
    public Template: string;
    public CreatedBy: string;
    public ValidFrom: Date;
    public Name: string;
    public ID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public AppliesTo: number;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class AltinnAccountFormLink extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AltinnAccountFormLink';

    public Deleted: boolean;
    public CreatedBy: string;
    public Ref: string;
    public AccountNumber: number;
    public ID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class AssetGroup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AssetGroup';

    public Deleted: boolean;
    public ToDate: Date;
    public DepreciationRate: number;
    public DepreciationYears: number;
    public CreatedBy: string;
    public Name: string;
    public Code: string;
    public ID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public DepreciationAccountNumber: number;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class BankIdentifierCode extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'BankIdentifierCode';

    public Deleted: boolean;
    public BankName: string;
    public CreatedBy: string;
    public Bic: string;
    public ID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public BankIdentifier: string;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class CompanyType extends UniEntity {
    public static RelativeUrl = 'companytypes';
    public static EntityType = 'CompanyType';

    public Deleted: boolean;
    public Priority: boolean;
    public CreatedBy: string;
    public DefaultAccountVisibilityGroupID: number;
    public FullName: string;
    public Description: string;
    public Name: string;
    public DefaultPlanType: PlanTypeEnum;
    public ID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Confirmation extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Confirmation';

    public ContractType: string;
    public Deleted: boolean;
    public Phone: string;
    public StatusCode: number;
    public ExpirationDate: Date;
    public CreatedBy: string;
    public Code: string;
    public ID: number;
    public DisplayName: string;
    public CompanyName: string;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public Email: string;
    public UpdatedBy: string;
    public PostalCode: string;
    public SignUpReferrer: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Country extends UniEntity {
    public static RelativeUrl = 'countries';
    public static EntityType = 'Country';

    public Deleted: boolean;
    public CreatedBy: string;
    public CurrencyRateSource: string;
    public CountryCode: string;
    public Name: string;
    public ID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public DefaultCurrencyCode: string;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Currency extends UniEntity {
    public static RelativeUrl = 'currencies';
    public static EntityType = 'Currency';

    public Deleted: boolean;
    public CreatedBy: string;
    public ExchangeRate: number;
    public Factor: number;
    public FromCurrencyCodeID: number;
    public ID: number;
    public CurrencyDate: LocalDate;
    public CreatedAt: Date;
    public Source: CurrencySourceEnum;
    public ToCurrencyCodeID: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public FromCurrencyCode: CurrencyCode;
    public ToCurrencyCode: CurrencyCode;
    public CustomFields: any;
}


export class CurrencyCode extends UniEntity {
    public static RelativeUrl = 'currencycodes';
    public static EntityType = 'CurrencyCode';

    public Deleted: boolean;
    public CreatedBy: string;
    public Description: string;
    public ShortCode: string;
    public Name: string;
    public Code: string;
    public ID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class DebtCollectionAutomation extends UniEntity {
    public static RelativeUrl = 'debtcollectionautomation';
    public static EntityType = 'DebtCollectionAutomation';

    public Deleted: boolean;
    public CreatedBy: string;
    public Description: string;
    public Name: string;
    public ID: number;
    public DebtCollectionSettingsID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public DebtCollectionSettings: DebtCollectionSettings;
    public CustomFields: any;
}


export class EmploymentValidValues extends UniEntity {
    public static RelativeUrl = 'employmentvalidvalues';
    public static EntityType = 'EmploymentValidValues';

    public RemunerationType: boolean;
    public typeOfEmployment: boolean;
    public Deleted: boolean;
    public JobName: boolean;
    public LastSalaryChangeDate: boolean;
    public HoursPerWeek: boolean;
    public HourRate: boolean;
    public ShipReg: boolean;
    public UserDefinedRate: boolean;
    public CreatedBy: string;
    public SeniorityDate: boolean;
    public JobCode: boolean;
    public WorkPercent: boolean;
    public MonthRate: boolean;
    public StartDate: boolean;
    public ShipType: boolean;
    public employment: TypeOfEmployment;
    public ID: number;
    public WorkingHoursScheme: boolean;
    public PaymentType: RemunerationType;
    public TradeArea: boolean;
    public CreatedAt: Date;
    public EndDate: boolean;
    public LastWorkPercentChange: boolean;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class FinancialDeadline extends UniEntity {
    public static RelativeUrl = 'deadlines';
    public static EntityType = 'FinancialDeadline';

    public Deleted: boolean;
    public StatusCode: number;
    public CreatedBy: string;
    public PassableDueDate: number;
    public Deadline: LocalDate;
    public AdditionalInfo: string;
    public Name: string;
    public ID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public Type: FinancialDeadlineType;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class LanguageCode extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'LanguageCode';

    public Deleted: boolean;
    public CreatedBy: string;
    public Name: string;
    public Code: string;
    public ID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Municipal extends UniEntity {
    public static RelativeUrl = 'Municipals';
    public static EntityType = 'Municipal';

    public Deleted: boolean;
    public MunicipalityNo: string;
    public MunicipalityName: string;
    public CreatedBy: string;
    public CountyName: string;
    public ID: number;
    public CountyNo: string;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public Retired: boolean;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class MunicipalAGAZone extends UniEntity {
    public static RelativeUrl = 'MunicipalAGAZones';
    public static EntityType = 'MunicipalAGAZone';

    public Deleted: boolean;
    public MunicipalityNo: string;
    public CreatedBy: string;
    public Startdate: Date;
    public ID: number;
    public ZoneID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class PaymentBatchType extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'PaymentBatchType';

    public Deleted: boolean;
    public CreatedBy: string;
    public Description: string;
    public Name: string;
    public Code: number;
    public ID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class PaymentCode extends UniEntity {
    public static RelativeUrl = 'paymentCodes';
    public static EntityType = 'PaymentCode';

    public Deleted: boolean;
    public CreatedBy: string;
    public Description: string;
    public Name: string;
    public Code: number;
    public ID: number;
    public PaymentGroup: string;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class PostalCode extends UniEntity {
    public static RelativeUrl = 'postalcodes';
    public static EntityType = 'PostalCode';

    public Deleted: boolean;
    public StatusCode: number;
    public City: string;
    public CreatedBy: string;
    public Code: string;
    public ID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class ReconcileType extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ReconcileType';

    public Deleted: boolean;
    public MaxIntervalNumber: number;
    public CreatedBy: string;
    public Interval: ReconcileInterval;
    public ReconcileName: string;
    public ID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class SaftMappingAccount extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'SaftMappingAccount';

    public Deleted: boolean;
    public CreatedBy: string;
    public AccountID: string;
    public Description: string;
    public ID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class StaticRegister extends UniEntity {
    public static RelativeUrl = 'StaticRegister';
    public static EntityType = 'StaticRegister';

    public Registry: string;
    public Deleted: boolean;
    public CreatedBy: string;
    public stamp: Date;
    public ID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class STYRKCode extends UniEntity {
    public static RelativeUrl = 'STYRK';
    public static EntityType = 'STYRKCode';

    public Deleted: boolean;
    public styrk: string;
    public ynr: number;
    public lnr: number;
    public CreatedBy: string;
    public tittel: string;
    public ID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Language extends UniEntity {
    public static RelativeUrl = 'languages';
    public static EntityType = 'Language';

    public Deleted: boolean;
    public CreatedBy: string;
    public FallBackLanguageID: number;
    public Name: string;
    public Code: string;
    public ID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public Translations: Array<Translation>;
    public CustomFields: any;
}


export class Translatable extends UniEntity {
    public static RelativeUrl = 'translatables';
    public static EntityType = 'Translatable';

    public Static: boolean;
    public Deleted: boolean;
    public Module: i18nModule;
    public CreatedBy: string;
    public Meaning: string;
    public Column: string;
    public Description: string;
    public Model: string;
    public ID: number;
    public Value: string;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public Translations: Array<Translation>;
    public CustomFields: any;
}


export class Translation extends UniEntity {
    public static RelativeUrl = 'translations';
    public static EntityType = 'Translation';

    public Deleted: boolean;
    public LanguageID: number;
    public CreatedBy: string;
    public TranslatableID: number;
    public ID: number;
    public Value: string;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public Language: Language;
    public Translatable: Translatable;
    public CustomFields: any;
}


export class VatCodeGroupSetup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'VatCodeGroupSetup';

    public Deleted: boolean;
    public CreatedBy: string;
    public Name: string;
    public ID: number;
    public No: string;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class VatPostSetup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'VatPostSetup';

    public Deleted: boolean;
    public HasTaxAmount: boolean;
    public CreatedBy: string;
    public VatCodeGroupSetupNo: string;
    public Name: string;
    public ReportAsNegativeAmount: boolean;
    public ID: number;
    public No: string;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public HasTaxBasis: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class VatReportForm extends UniEntity {
    public static RelativeUrl = 'vatreportforms';
    public static EntityType = 'VatReportForm';

    public Deleted: boolean;
    public CreatedBy: string;
    public Description: string;
    public Name: string;
    public ID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class VatReportReferenceSetup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'VatReportReferenceSetup';

    public VatPostNo: string;
    public Deleted: boolean;
    public VatCode: string;
    public CreatedBy: string;
    public AccountNumber: number;
    public ID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class VatTypeSetup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'VatTypeSetup';

    public Deleted: boolean;
    public VatCode: string;
    public DefaultVisible: boolean;
    public IsCompensated: boolean;
    public IsNotVatRegistered: boolean;
    public CreatedBy: string;
    public OutgoingAccountNumber: number;
    public VatCodeGroupNo: string;
    public Name: string;
    public ID: number;
    public OutputVat: boolean;
    public DirectJournalEntryOnly: boolean;
    public ReversedTaxDutyVat: boolean;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public IncomingAccountNumber: number;
    public _createguid: string;
    public VatTypeSetupPercentages: Array<VatTypeSetupPercentage>;
    public CustomFields: any;
}


export class VatTypeSetupPercentage extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'VatTypeSetupPercentage';

    public VatPercent: number;
    public Deleted: boolean;
    public VatTypeSetupID: number;
    public CreatedBy: string;
    public ValidFrom: LocalDate;
    public ValidTo: LocalDate;
    public ID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class CompanyReport extends UniEntity {
    public static RelativeUrl = 'company-report';
    public static EntityType = 'CompanyReport';

    public Deleted: boolean;
    public CreatedBy: string;
    public ReportDefinitionID: number;
    public ID: number;
    public CompanyKey: string;
    public ContractId: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class ReportDefinition extends UniEntity {
    public static RelativeUrl = 'report-definitions';
    public static EntityType = 'ReportDefinition';

    public ReportType: number;
    public IsStandard: boolean;
    public Deleted: boolean;
    public CategoryLabel: string;
    public UniqueReportID: string;
    public CreatedBy: string;
    public ReportSource: string;
    public Description: string;
    public Name: string;
    public ID: number;
    public Md5: string;
    public TemplateLinkId: string;
    public Category: string;
    public Version: string;
    public CreatedAt: Date;
    public Visible: boolean;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class ReportDefinitionDataSource extends UniEntity {
    public static RelativeUrl = 'report-definition-data-sources';
    public static EntityType = 'ReportDefinitionDataSource';

    public Deleted: boolean;
    public CreatedBy: string;
    public Name: string;
    public ReportDefinitionId: number;
    public ID: number;
    public DataSourceUrl: string;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class ReportDefinitionParameter extends UniEntity {
    public static RelativeUrl = 'report-definition-parameters';
    public static EntityType = 'ReportDefinitionParameter';

    public DefaultValueLookupType: string;
    public Deleted: boolean;
    public DefaultValueSource: string;
    public DefaultValueList: string;
    public CreatedBy: string;
    public Name: string;
    public ReportDefinitionId: number;
    public ID: number;
    public Label: string;
    public CreatedAt: Date;
    public Visible: boolean;
    public UpdatedAt: Date;
    public DefaultValue: string;
    public Type: string;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class PeriodSeries extends UniEntity {
    public static RelativeUrl = 'period-series';
    public static EntityType = 'PeriodSeries';

    public Deleted: boolean;
    public SeriesType: PeriodSeriesType;
    public CreatedBy: string;
    public Active: boolean;
    public Name: string;
    public ID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class PeriodTemplate extends UniEntity {
    public static RelativeUrl = 'period-templates';
    public static EntityType = 'PeriodTemplate';

    public Deleted: boolean;
    public PeriodSeriesID: number;
    public ToDate: LocalDate;
    public CreatedBy: string;
    public FromDate: LocalDate;
    public Name: string;
    public ID: number;
    public No: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public PeriodSeries: PeriodSeries;
    public CustomFields: any;
}


export class Model extends UniEntity {
    public static RelativeUrl = 'models';
    public static EntityType = 'Model';

    public Deleted: boolean;
    public Admin: boolean;
    public Shared: boolean;
    public CreatedBy: string;
    public Description: string;
    public Name: string;
    public LabelPlural: string;
    public ID: number;
    public Label: string;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public Fields: Array<Field>;
    public CustomFields: any;
}


export class Field extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Field';

    public Deleted: boolean;
    public HelpText: string;
    public CreatedBy: string;
    public ModelID: number;
    public Description: string;
    public Name: string;
    public ID: number;
    public Label: string;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public Model: Model;
    public CustomFields: any;
}


export class Notification extends UniEntity {
    public static RelativeUrl = 'notifications';
    public static EntityType = 'Notification';

    public EntityType: string;
    public SourceEntityType: string;
    public Message: string;
    public Deleted: boolean;
    public SourceEntityID: number;
    public StatusCode: number;
    public CreatedBy: string;
    public RecipientID: string;
    public SenderDisplayName: string;
    public EntityID: number;
    public ID: number;
    public CompanyKey: string;
    public CompanyName: string;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class CompanySettings extends UniEntity {
    public static RelativeUrl = 'companysettings';
    public static EntityType = 'CompanySettings';

    public UseNetsIntegration: boolean;
    public BaseCurrencyCodeID: number;
    public AcceptableDelta4CustomerPaymentAccountID: number;
    public CustomerAccountID: number;
    public AccountingLockedDate: LocalDate;
    public DefaultTOFCurrencySettingsID: number;
    public NetsIntegrationActivated: boolean;
    public CompanyRegistered: boolean;
    public CustomerCreditDays: number;
    public InterrimRemitAccountID: number;
    public DefaultCustomerInvoiceReportID: number;
    public DefaultDistributionsID: number;
    public CustomerInvoiceReminderSettingsID: number;
    public AgioLossAccountID: number;
    public Deleted: boolean;
    public AllowAvtalegiroRegularInvoice: boolean;
    public DefaultCustomerInvoiceReminderReportID: number;
    public AgioGainAccountID: number;
    public TwoStageAutobankEnabled: boolean;
    public TaxMandatoryType: number;
    public StatusCode: number;
    public CompanyBankAccountID: number;
    public VatLockedDate: LocalDate;
    public TaxableFromDate: LocalDate;
    public VatReportFormID: number;
    public InterrimPaymentAccountID: number;
    public UseFinancialDateToCalculateVatPercent: boolean;
    public CreatedBy: string;
    public SalaryBankAccountID: number;
    public DefaultAddressID: number;
    public DefaultCustomerQuoteReportID: number;
    public SettlementVatAccountID: number;
    public HideInActiveCustomers: boolean;
    public PersonNumber: string;
    public BatchInvoiceMinAmount: number;
    public LogoHideField: number;
    public AccountGroupSetID: number;
    public WebAddress: string;
    public HasAutobank: boolean;
    public LogoAlign: number;
    public AutoDistributeInvoice: boolean;
    public UseAssetRegister: boolean;
    public TaxBankAccountID: number;
    public OrganizationNumber: string;
    public DefaultEmailID: number;
    public StoreDistributedInvoice: boolean;
    public FactoringEmailID: number;
    public XtraPaymentOrgXmlTagValue: string;
    public SAFTimportAccountID: number;
    public PaymentBankIdentification: string;
    public ForceSupplierInvoiceApproval: boolean;
    public PeriodSeriesAccountID: number;
    public HideInActiveSuppliers: boolean;
    public TaxableFromLimit: number;
    public DefaultPhoneID: number;
    public APContactID: number;
    public RoundingType: RoundingType;
    public AccountVisibilityGroupID: number;
    public Localization: string;
    public OfficeMunicipalityNo: string;
    public CompanyTypeID: number;
    public DefaultCustomerOrderReportID: number;
    public ShowNumberOfDecimals: number;
    public ID: number;
    public PaymentBankAgreementNumber: string;
    public AutoJournalPayment: string;
    public UsePaymentBankValues: boolean;
    public SupplierAccountID: number;
    public UseOcrInterpretation: boolean;
    public IgnorePaymentsWithoutEndToEndID: boolean;
    public CompanyName: string;
    public APIncludeAttachment: boolean;
    public AcceptableDelta4CustomerPayment: number;
    public Factoring: number;
    public CreatedAt: Date;
    public APActivated: boolean;
    public ShowKIDOnCustomerInvoice: boolean;
    public UseXtraPaymentOrgXmlTag: boolean;
    public TaxMandatory: boolean;
    public GLN: string;
    public RoundingNumberOfDecimals: number;
    public PeriodSeriesVatID: number;
    public UpdatedAt: Date;
    public APGuid: string;
    public SaveCustomersFromQuoteAsLead: boolean;
    public UpdatedBy: string;
    public LogoFileID: number;
    public FactoringNumber: number;
    public DefaultSalesAccountID: number;
    public BookCustomerInvoiceOnDeliveryDate: boolean;
    public BankChargeAccountID: number;
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

    public EntityType: string;
    public Deleted: boolean;
    public StatusCode: number;
    public CreatedBy: string;
    public Name: string;
    public ID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public Elements: Array<DistributionPlanElement>;
    public CustomFields: any;
}


export class DistributionPlanElement extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'DistributionPlanElement';

    public Deleted: boolean;
    public Priority: number;
    public StatusCode: number;
    public CreatedBy: string;
    public ID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public DistributionPlanElementTypeID: number;
    public DistributionPlanID: number;
    public UpdatedBy: string;
    public _createguid: string;
    public ElementType: DistributionPlanElementType;
    public CustomFields: any;
}


export class DistributionPlanElementType extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'DistributionPlanElementType';

    public Deleted: boolean;
    public StatusCode: number;
    public CreatedBy: string;
    public Name: string;
    public ID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public LegalEntities: Array<DistributionPlanElementTypeLegalEntity>;
    public CustomFields: any;
}


export class DistributionPlanElementTypeLegalEntity extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'DistributionPlanElementTypeLegalEntity';

    public EntityType: string;
    public Deleted: boolean;
    public StatusCode: number;
    public CreatedBy: string;
    public ID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public DistributionPlanElementTypeID: number;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Distributions extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Distributions';

    public Deleted: boolean;
    public PayCheckDistributionPlanID: number;
    public StatusCode: number;
    public CreatedBy: string;
    public CustomerInvoiceReminderDistributionPlanID: number;
    public CustomerQuoteDistributionPlanID: number;
    public CustomerOrderDistributionPlanID: number;
    public AnnualStatementDistributionPlanID: number;
    public ID: number;
    public CustomerInvoiceDistributionPlanID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
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

    public Deleted: boolean;
    public StatusCode: number;
    public CreatedBy: string;
    public Name: string;
    public ID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class EmailLog extends UniEntity {
    public static RelativeUrl = 'emails';
    public static EntityType = 'EmailLog';

    public ExternalMessage: string;
    public EntityType: string;
    public Deleted: boolean;
    public JobRunExternalRef: string;
    public DistributeAt: LocalDate;
    public StatusCode: number;
    public CreatedBy: string;
    public From: string;
    public EntityDisplayValue: string;
    public To: string;
    public Subject: string;
    public EntityID: number;
    public ID: number;
    public JobRunID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public Type: SharingType;
    public UpdatedBy: string;
    public ExternalReference: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Eventplan extends UniEntity {
    public static RelativeUrl = 'eventplans';
    public static EntityType = 'Eventplan';

    public ExpressionFilter: string;
    public Deleted: boolean;
    public StatusCode: number;
    public ModelFilter: string;
    public Cargo: string;
    public IsSystemPlan: boolean;
    public CreatedBy: string;
    public PlanType: EventplanType;
    public Active: boolean;
    public Name: string;
    public ID: number;
    public JobNames: string;
    public OperationFilter: string;
    public CreatedAt: Date;
    public SigningKey: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public Subscribers: Array<EventSubscriber>;
    public CustomFields: any;
}


export class EventSubscriber extends UniEntity {
    public static RelativeUrl = 'eventsubscribers';
    public static EntityType = 'EventSubscriber';

    public Deleted: boolean;
    public StatusCode: number;
    public EventplanID: number;
    public Headers: string;
    public CreatedBy: string;
    public Active: boolean;
    public Name: string;
    public ID: number;
    public Authorization: string;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public Endpoint: string;
    public UpdatedBy: string;
    public _createguid: string;
    public Eventplan: Eventplan;
    public CustomFields: any;
}


export class Period extends UniEntity {
    public static RelativeUrl = 'periodes';
    public static EntityType = 'Period';

    public Deleted: boolean;
    public StatusCode: number;
    public PeriodSeriesID: number;
    public ToDate: LocalDate;
    public CreatedBy: string;
    public AccountYear: number;
    public FromDate: LocalDate;
    public Name: string;
    public ID: number;
    public No: number;
    public PeriodTemplateID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public PeriodTemplate: PeriodTemplate;
    public PeriodSeries: PeriodSeries;
    public CustomFields: any;
}


export class PredefinedDescription extends UniEntity {
    public static RelativeUrl = 'predefineddescriptions';
    public static EntityType = 'PredefinedDescription';

    public Deleted: boolean;
    public StatusCode: number;
    public CreatedBy: string;
    public Description: string;
    public Code: string;
    public ID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public Type: PredefinedDescriptionType;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class ProductCategory extends UniEntity {
    public static RelativeUrl = 'productcategories';
    public static EntityType = 'ProductCategory';

    public Deleted: boolean;
    public Lft: number;
    public StatusCode: number;
    public Status: number;
    public Depth: number;
    public CreatedBy: string;
    public Comment: string;
    public Description: string;
    public Name: string;
    public ID: number;
    public Rght: number;
    public CreatedAt: Date;
    public ParentID: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class ProductCategoryLink extends UniEntity {
    public static RelativeUrl = 'productcategorylinks';
    public static EntityType = 'ProductCategoryLink';

    public Deleted: boolean;
    public StatusCode: number;
    public CreatedBy: string;
    public ProductCategoryID: number;
    public ID: number;
    public ProductID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public ProductCategory: ProductCategory;
    public CustomFields: any;
}


export class Sharing extends UniEntity {
    public static RelativeUrl = 'sharings';
    public static EntityType = 'Sharing';

    public ExternalMessage: string;
    public EntityType: string;
    public Deleted: boolean;
    public JobRunExternalRef: string;
    public DistributeAt: LocalDate;
    public StatusCode: number;
    public CreatedBy: string;
    public From: string;
    public EntityDisplayValue: string;
    public To: string;
    public Subject: string;
    public EntityID: number;
    public ID: number;
    public JobRunID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public Type: SharingType;
    public UpdatedBy: string;
    public ExternalReference: string;
    public _createguid: string;
    public CustomFields: any;
}


export class StatusLog extends UniEntity {
    public static RelativeUrl = 'statuslogs';
    public static EntityType = 'StatusLog';

    public ToStatus: number;
    public EntityType: string;
    public Deleted: boolean;
    public FromStatus: number;
    public CreatedBy: string;
    public EntityID: number;
    public ID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Tracelink extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Tracelink';

    public Deleted: boolean;
    public StatusCode: number;
    public DestinationEntityName: string;
    public Date: Date;
    public CreatedBy: string;
    public DestinationInstanceID: number;
    public SourceEntityName: string;
    public ID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public SourceInstanceID: number;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class User extends UniEntity {
    public static RelativeUrl = 'users';
    public static EntityType = 'User';

    public GlobalIdentity: string;
    public Protected: boolean;
    public UserName: string;
    public Deleted: boolean;
    public IsAutobankAdmin: boolean;
    public StatusCode: number;
    public HasAgreedToImportDisclaimer: boolean;
    public CreatedBy: string;
    public LastLogin: Date;
    public BankIntegrationUserName: string;
    public ID: number;
    public DisplayName: string;
    public CreatedAt: Date;
    public PhoneNumber: string;
    public UpdatedAt: Date;
    public Email: string;
    public UpdatedBy: string;
    public TwoFactorEnabled: boolean;
    public AuthPhoneNumber: string;
    public _createguid: string;
    public EndDate: Date;
    public CustomFields: any;
}


export class UniQueryDefinition extends UniEntity {
    public static RelativeUrl = 'uniquerydefinitions';
    public static EntityType = 'UniQueryDefinition';

    public Deleted: boolean;
    public UserID: number;
    public StatusCode: number;
    public CreatedBy: string;
    public ClickParam: string;
    public ClickUrl: string;
    public IsShared: boolean;
    public MainModelName: string;
    public ModuleID: number;
    public SystemGeneratedQuery: boolean;
    public Description: string;
    public Name: string;
    public Code: string;
    public SortIndex: number;
    public ID: number;
    public Category: string;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public UniQueryFilters: Array<UniQueryFilter>;
    public UniQueryFields: Array<UniQueryField>;
    public CustomFields: any;
}


export class UniQueryField extends UniEntity {
    public static RelativeUrl = 'uniqueryfields';
    public static EntityType = 'UniQueryField';

    public FieldType: number;
    public Deleted: boolean;
    public Index: number;
    public StatusCode: number;
    public Width: string;
    public CreatedBy: string;
    public SumFunction: string;
    public Header: string;
    public ID: number;
    public CreatedAt: Date;
    public Path: string;
    public Alias: string;
    public UpdatedAt: Date;
    public Field: string;
    public UpdatedBy: string;
    public UniQueryDefinitionID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class UniQueryFilter extends UniEntity {
    public static RelativeUrl = 'uniqueryfilters';
    public static EntityType = 'UniQueryFilter';

    public Operator: string;
    public Deleted: boolean;
    public StatusCode: number;
    public CreatedBy: string;
    public Group: number;
    public ID: number;
    public Value: string;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public Field: string;
    public UpdatedBy: string;
    public UniQueryDefinitionID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class Team extends UniEntity {
    public static RelativeUrl = 'teams';
    public static EntityType = 'Team';

    public DimensionsID: number;
    public Deleted: boolean;
    public Lft: number;
    public StatusCode: number;
    public Depth: number;
    public CreatedBy: string;
    public Name: string;
    public ID: number;
    public Rght: number;
    public CreatedAt: Date;
    public ParentID: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public Dimensions: Dimensions;
    public Positions: Array<TeamPosition>;
    public CustomFields: any;
}


export class TeamPosition extends UniEntity {
    public static RelativeUrl = 'teampositions';
    public static EntityType = 'TeamPosition';

    public ApproveOrder: number;
    public RelatedSharedRoleId: number;
    public Deleted: boolean;
    public Position: TeamPositionEnum;
    public UserID: number;
    public StatusCode: number;
    public ToDate: LocalDate;
    public TeamID: number;
    public CreatedBy: string;
    public FromDate: LocalDate;
    public ID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public Team: Team;
    public CustomFields: any;
}


export class ApprovalRule extends UniEntity {
    public static RelativeUrl = 'approvalrules';
    public static EntityType = 'ApprovalRule';

    public Deleted: boolean;
    public Keywords: string;
    public StatusCode: number;
    public CreatedBy: string;
    public Description: string;
    public RuleType: ApprovalRuleType;
    public ID: number;
    public IndustryCodes: string;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public Steps: Array<ApprovalRuleStep>;
    public CustomFields: any;
}


export class ApprovalRuleStep extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ApprovalRuleStep';

    public ApprovalRuleID: number;
    public Deleted: boolean;
    public UserID: number;
    public StatusCode: number;
    public CreatedBy: string;
    public StepNumber: number;
    public ID: number;
    public Limit: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public ApprovalRule: ApprovalRule;
    public User: User;
    public CustomFields: any;
}


export class ApprovalSubstitute extends UniEntity {
    public static RelativeUrl = 'approvalsubstitutes';
    public static EntityType = 'ApprovalSubstitute';

    public Deleted: boolean;
    public UserID: number;
    public StatusCode: number;
    public ToDate: LocalDate;
    public CreatedBy: string;
    public FromDate: LocalDate;
    public ID: number;
    public SubstituteUserID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public User: User;
    public SubstituteUser: User;
    public CustomFields: any;
}


export class TaskApprovalPlan extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'TaskApprovalPlan';

    public ApprovalRuleID: number;
    public Deleted: boolean;
    public UserID: number;
    public StatusCode: number;
    public Amount: number;
    public CreatedBy: string;
    public StepNumber: number;
    public ApprovalID: number;
    public TaskID: number;
    public Comment: string;
    public ID: number;
    public Limit: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
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

    public EntityType: string;
    public Deleted: boolean;
    public StatusCode: number;
    public System: boolean;
    public CreatedBy: string;
    public Order: number;
    public StatusCategoryID: number;
    public Description: string;
    public IsDepricated: boolean;
    public ID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public StatusCategory: StatusCategory;
    public CustomFields: any;
}


export class StatusCategory extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'StatusCategory';

    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCategoryCode: StatusCategoryCode;
    public Name: string;
    public ID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class StatusRemark extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'StatusRemark';

    public EntityType: string;
    public Deleted: boolean;
    public StatusCode: number;
    public CreatedBy: string;
    public Remark: string;
    public EntityID: number;
    public ID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Transition extends UniEntity {
    public static RelativeUrl = 'transitions';
    public static EntityType = 'Transition';

    public EntityType: string;
    public Deleted: boolean;
    public CreatedBy: string;
    public MethodName: string;
    public Controller: string;
    public ID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class TransitionThreshold extends UniEntity {
    public static RelativeUrl = 'thresholds';
    public static EntityType = 'TransitionThreshold';

    public Operator: Operator;
    public SharedApproveTransitionId: number;
    public Deleted: boolean;
    public SharedRejectTransitionId: number;
    public PropertyName: string;
    public SharedRoleId: number;
    public CreatedBy: string;
    public RejectStatusCode: number;
    public ID: number;
    public Value: string;
    public Operation: OperationType;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public Disabled: boolean;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class TransitionThresholdApproval extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'TransitionThresholdApproval';

    public Operator: Operator;
    public SharedApproveTransitionId: number;
    public Deleted: boolean;
    public SharedRejectTransitionId: number;
    public PropertyName: string;
    public SharedRoleId: number;
    public CreatedBy: string;
    public ApprovalID: number;
    public RejectStatusCode: number;
    public ID: number;
    public Value: string;
    public Operation: OperationType;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public Approval: Approval;
    public CustomFields: any;
}


export class Approval extends UniEntity {
    public static RelativeUrl = 'approvals';
    public static EntityType = 'Approval';

    public Deleted: boolean;
    public UserID: number;
    public StatusCode: number;
    public SharedRoleId: number;
    public Amount: number;
    public CreatedBy: string;
    public TaskID: number;
    public ID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
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

    public SharedApproveTransitionId: number;
    public Deleted: boolean;
    public SharedRejectTransitionId: number;
    public UserID: number;
    public StatusCode: number;
    public Title: string;
    public SharedRoleId: number;
    public CreatedBy: string;
    public ModelID: number;
    public RejectStatusCode: number;
    public EntityID: number;
    public ID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public Type: TaskType;
    public UpdatedBy: string;
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

    public EntityType: string;
    public TransitionID: number;
    public Deleted: boolean;
    public CreatedBy: string;
    public ToStatusID: number;
    public FromStatusID: number;
    public ExpiresDate: Date;
    public IsDepricated: boolean;
    public ID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
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
    public DimensionsID: number;
    public ProjectNumberSeriesID: number;
    public Deleted: boolean;
    public WorkPlaceAddressID: number;
    public StatusCode: number;
    public PlannedStartdate: LocalDate;
    public PlannedEnddate: LocalDate;
    public CostPrice: number;
    public ProjectNumberNumeric: number;
    public ProjectLeadName: string;
    public Amount: number;
    public CreatedBy: string;
    public StartDate: LocalDate;
    public ProjectNumber: string;
    public Description: string;
    public Total: number;
    public Name: string;
    public ID: number;
    public ProjectCustomerID: number;
    public CreatedAt: Date;
    public EndDate: LocalDate;
    public UpdatedAt: Date;
    public UpdatedBy: string;
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

    public Deleted: boolean;
    public UserID: number;
    public StatusCode: number;
    public CreatedBy: string;
    public ProjectID: number;
    public Name: string;
    public Responsibility: string;
    public ID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public ProjectUser: User;
    public CustomFields: any;
}


export class ProjectResourceSchedule extends UniEntity {
    public static RelativeUrl = 'projects-schedules-resources';
    public static EntityType = 'ProjectResourceSchedule';

    public Deleted: boolean;
    public StatusCode: number;
    public CreatedBy: string;
    public ProjectTaskID: number;
    public ProjectTaskScheduleID: number;
    public ID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public ProjectResourceID: number;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class ProjectTask extends UniEntity {
    public static RelativeUrl = 'projects-tasks';
    public static EntityType = 'ProjectTask';

    public Price: number;
    public Deleted: boolean;
    public StatusCode: number;
    public CostPrice: number;
    public Amount: number;
    public CreatedBy: string;
    public StartDate: LocalDate;
    public ProjectID: number;
    public Description: string;
    public Total: number;
    public Name: string;
    public ID: number;
    public SuggestedNumber: string;
    public Number: string;
    public CreatedAt: Date;
    public EndDate: LocalDate;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public ProjectTaskSchedules: Array<ProjectTaskSchedule>;
    public ProjectTaskResources: Array<ProjectResourceSchedule>;
    public CustomFields: any;
}


export class ProjectTaskSchedule extends UniEntity {
    public static RelativeUrl = 'projects-tasks-schedules';
    public static EntityType = 'ProjectTaskSchedule';

    public Deleted: boolean;
    public StatusCode: number;
    public CreatedBy: string;
    public StartDate: LocalDate;
    public ProjectTaskID: number;
    public ID: number;
    public CreatedAt: Date;
    public EndDate: LocalDate;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public ScheduleResources: Array<ProjectResourceSchedule>;
    public CustomFields: any;
}


export class BarnepassProduct extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'BarnepassProduct';

    public Deleted: boolean;
    public StatusCode: number;
    public CreatedBy: string;
    public ID: number;
    public ProductID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public Product: Product;
    public CustomFields: any;
}


export class Product extends UniEntity {
    public static RelativeUrl = 'products';
    public static EntityType = 'Product';

    public DimensionsID: number;
    public PartName: string;
    public Deleted: boolean;
    public VatTypeID: number;
    public StatusCode: number;
    public ImageFileID: number;
    public ListPrice: number;
    public CostPrice: number;
    public CalculateGrossPriceBasedOnNetPrice: boolean;
    public CreatedBy: string;
    public AccountID: number;
    public PriceExVat: number;
    public VariansParentID: number;
    public Description: string;
    public AverageCost: number;
    public Name: string;
    public ID: number;
    public DefaultProductCategoryID: number;
    public PriceIncVat: number;
    public CreatedAt: Date;
    public Unit: string;
    public UpdatedAt: Date;
    public Type: ProductTypeEnum;
    public UpdatedBy: string;
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

    public Deleted: boolean;
    public ToNumber: number;
    public NumberSeriesTaskID: number;
    public StatusCode: number;
    public Empty: boolean;
    public FromNumber: number;
    public System: boolean;
    public CreatedBy: string;
    public AccountYear: number;
    public MainAccountID: number;
    public Comment: string;
    public IsDefaultForTask: boolean;
    public UseNumbersFromNumberSeriesID: number;
    public Name: string;
    public NumberLock: boolean;
    public NumberSeriesTypeID: number;
    public NextNumber: number;
    public ID: number;
    public DisplayName: string;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public Disabled: boolean;
    public UpdatedBy: string;
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

    public Deleted: boolean;
    public StatusCode: number;
    public CreatedBy: string;
    public ID: number;
    public NumberSerieTypeBID: number;
    public NumberSerieTypeAID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public NumberSerieTypeA: NumberSeriesType;
    public NumberSerieTypeB: NumberSeriesType;
    public CustomFields: any;
}


export class NumberSeriesTask extends UniEntity {
    public static RelativeUrl = 'number-series-tasks';
    public static EntityType = 'NumberSeriesTask';

    public EntityType: string;
    public Deleted: boolean;
    public StatusCode: number;
    public CreatedBy: string;
    public Name: string;
    public ID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public NumberSeries: Array<NumberSeries>;
    public CustomFields: any;
}


export class NumberSeriesType extends UniEntity {
    public static RelativeUrl = 'number-series-types';
    public static EntityType = 'NumberSeriesType';

    public EntityType: string;
    public Deleted: boolean;
    public StatusCode: number;
    public System: boolean;
    public CreatedBy: string;
    public EntityField: string;
    public EntitySeriesIDField: string;
    public CanHaveSeveralActiveSeries: boolean;
    public Name: string;
    public Yearly: boolean;
    public ID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public Series: Array<NumberSeries>;
    public CustomFields: any;
}


export class EncryptionInfo extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'EncryptionInfo';

    public Deleted: boolean;
    public CreatedBy: string;
    public description: string;
    public ID: number;
    public CreatedAt: Date;
    public password: string;
    public UpdatedAt: Date;
    public type: Type;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class File extends UniEntity {
    public static RelativeUrl = 'files/{entitytype}/{entityid}';
    public static EntityType = 'File';

    public Deleted: boolean;
    public StatusCode: number;
    public ContentType: string;
    public CreatedBy: string;
    public StorageReference: string;
    public Size: string;
    public PermaLink: string;
    public Pages: number;
    public OCRData: string;
    public Description: string;
    public Name: string;
    public encryptionID: number;
    public ID: number;
    public Md5: string;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public UploadSlot: string;
    public _createguid: string;
    public FileTags: Array<FileTag>;
    public EntityLinks: Array<FileEntityLink>;
    public CustomFields: any;
}


export class FileTag extends UniEntity {
    public static RelativeUrl = 'filetags';
    public static EntityType = 'FileTag';

    public Deleted: boolean;
    public Status: number;
    public CreatedBy: string;
    public FileID: number;
    public TagName: string;
    public ID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public File: File;
    public CustomFields: any;
}


export class FileEntityLink extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'FileEntityLink';

    public EntityType: string;
    public Deleted: boolean;
    public StatusCode: number;
    public CreatedBy: string;
    public FileID: number;
    public EntityID: number;
    public ID: number;
    public IsAttachment: boolean;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public File: File;
    public CustomFields: any;
}


export class ElsaUsageLog extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ElsaUsageLog';

    public Quantity: number;
    public Deleted: boolean;
    public CreatedBy: string;
    public DateLogged: Date;
    public ID: number;
    public ProductType: string;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public ExternalReference: string;
    public _createguid: string;
    public CustomFields: any;
}


export class AccessPointFormat extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AccessPointFormat';

    public Deleted: boolean;
    public ResourceName: string;
    public StatusCode: number;
    public CreatedBy: string;
    public Name: string;
    public ID: number;
    public Label: string;
    public CreatedAt: Date;
    public OutgoingID: number;
    public UpdatedAt: Date;
    public IncommingID: number;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class EHFLog extends UniEntity {
    public static RelativeUrl = 'ehf';
    public static EntityType = 'EHFLog';

    public ExternalMessage: string;
    public EntityType: string;
    public Deleted: boolean;
    public JobRunExternalRef: string;
    public DistributeAt: LocalDate;
    public StatusCode: number;
    public CreatedBy: string;
    public From: string;
    public EntityDisplayValue: string;
    public To: string;
    public Subject: string;
    public EntityID: number;
    public ID: number;
    public JobRunID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public Type: SharingType;
    public UpdatedBy: string;
    public ExternalReference: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Department extends UniEntity {
    public static RelativeUrl = 'departments';
    public static EntityType = 'Department';

    public DepartmentNumberNumeric: number;
    public Deleted: boolean;
    public DepartmentNumber: string;
    public StatusCode: number;
    public CreatedBy: string;
    public DepartmentNumberSeriesID: number;
    public Description: string;
    public DepartmentManagerName: string;
    public Name: string;
    public ID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public DepartmentNumberSeries: NumberSeries;
    public CustomFields: any;
}


export class Dimension10 extends UniEntity {
    public static RelativeUrl = 'Dimension10';
    public static EntityType = 'Dimension10';

    public Deleted: boolean;
    public StatusCode: number;
    public CreatedBy: string;
    public Description: string;
    public Name: string;
    public ID: number;
    public NumberNumeric: number;
    public Number: string;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Dimension5 extends UniEntity {
    public static RelativeUrl = 'Dimension5';
    public static EntityType = 'Dimension5';

    public Deleted: boolean;
    public StatusCode: number;
    public CreatedBy: string;
    public Description: string;
    public Name: string;
    public ID: number;
    public NumberNumeric: number;
    public Number: string;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Dimension6 extends UniEntity {
    public static RelativeUrl = 'Dimension6';
    public static EntityType = 'Dimension6';

    public Deleted: boolean;
    public StatusCode: number;
    public CreatedBy: string;
    public Description: string;
    public Name: string;
    public ID: number;
    public NumberNumeric: number;
    public Number: string;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Dimension7 extends UniEntity {
    public static RelativeUrl = 'Dimension7';
    public static EntityType = 'Dimension7';

    public Deleted: boolean;
    public StatusCode: number;
    public CreatedBy: string;
    public Description: string;
    public Name: string;
    public ID: number;
    public NumberNumeric: number;
    public Number: string;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Dimension8 extends UniEntity {
    public static RelativeUrl = 'Dimension8';
    public static EntityType = 'Dimension8';

    public Deleted: boolean;
    public StatusCode: number;
    public CreatedBy: string;
    public Description: string;
    public Name: string;
    public ID: number;
    public NumberNumeric: number;
    public Number: string;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Dimension9 extends UniEntity {
    public static RelativeUrl = 'Dimension9';
    public static EntityType = 'Dimension9';

    public Deleted: boolean;
    public StatusCode: number;
    public CreatedBy: string;
    public Description: string;
    public Name: string;
    public ID: number;
    public NumberNumeric: number;
    public Number: string;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Dimensions extends UniEntity {
    public static RelativeUrl = 'dimensions';
    public static EntityType = 'Dimensions';

    public Dimension6ID: number;
    public Dimension5ID: number;
    public Deleted: boolean;
    public Dimension10ID: number;
    public Dimension8ID: number;
    public StatusCode: number;
    public CreatedBy: string;
    public RegionID: number;
    public ProjectID: number;
    public ProjectTaskID: number;
    public ID: number;
    public Dimension7ID: number;
    public DepartmentID: number;
    public CreatedAt: Date;
    public Dimension9ID: number;
    public ResponsibleID: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
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
    public RegionName: string;
    public Dimension7Name: string;
    public ProjectTaskName: string;
    public ProjectTaskNumber: string;
    public DimensionsID: number;
    public Dimension9Name: string;
    public DepartmentNumber: string;
    public RegionCode: string;
    public Dimension10Number: string;
    public Dimension8Number: string;
    public Dimension6Name: string;
    public Dimension9Number: string;
    public Dimension6Number: string;
    public ResponsibleName: string;
    public Dimension8Name: string;
    public ProjectNumber: string;
    public Dimension5Number: string;
    public Dimension7Number: string;
    public ID: number;
    public DepartmentName: string;
    public Dimension5Name: string;
    public Dimension10Name: string;
    public ProjectName: string;
}


export class DimensionSettings extends UniEntity {
    public static RelativeUrl = 'dimensionsettings';
    public static EntityType = 'DimensionSettings';

    public Deleted: boolean;
    public StatusCode: number;
    public CreatedBy: string;
    public ID: number;
    public Label: string;
    public CreatedAt: Date;
    public Dimension: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public IsActive: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class Region extends UniEntity {
    public static RelativeUrl = 'regions';
    public static EntityType = 'Region';

    public Deleted: boolean;
    public RegionCode: string;
    public StatusCode: number;
    public CreatedBy: string;
    public CountryCode: string;
    public Description: string;
    public Name: string;
    public ID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Responsible extends UniEntity {
    public static RelativeUrl = 'responsibles';
    public static EntityType = 'Responsible';

    public NameOfResponsible: string;
    public Deleted: boolean;
    public StatusCode: number;
    public CreatedBy: string;
    public Description: string;
    public Name: string;
    public ID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Contract extends UniEntity {
    public static RelativeUrl = 'contracts';
    public static EntityType = 'Contract';

    public Deleted: boolean;
    public StatusCode: number;
    public Engine: ContractEngine;
    public CreatedBy: string;
    public Hash: string;
    public HashTransactionAddress: string;
    public Description: string;
    public ContractCode: string;
    public Name: string;
    public TeamsUri: string;
    public ID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public Parameters: Array<ContractParameter>;
    public Triggers: Array<ContractTrigger>;
    public RunLogs: Array<ContractRunLog>;
    public CustomFields: any;
}


export class ContractAddress extends UniEntity {
    public static RelativeUrl = 'contractaddresses';
    public static EntityType = 'ContractAddress';

    public EntityType: string;
    public Deleted: boolean;
    public StatusCode: number;
    public Amount: number;
    public CreatedBy: string;
    public ContractAssetID: number;
    public AssetAddress: string;
    public Address: string;
    public EntityID: number;
    public ID: number;
    public ContractID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public Type: AddressType;
    public UpdatedBy: string;
    public _createguid: string;
    public Contract: Contract;
    public ContractAsset: ContractAsset;
    public CustomFields: any;
}


export class ContractAsset extends UniEntity {
    public static RelativeUrl = 'contractassets';
    public static EntityType = 'ContractAsset';

    public IsPrivate: boolean;
    public Deleted: boolean;
    public IsAutoDestroy: boolean;
    public StatusCode: number;
    public Cap: number;
    public CreatedBy: string;
    public IsFixedDenominations: boolean;
    public SpenderAttested: boolean;
    public IsCosignedByDefiner: boolean;
    public ID: number;
    public IsTransferrable: boolean;
    public ContractID: number;
    public CreatedAt: Date;
    public IsIssuedByDefinerOnly: boolean;
    public UpdatedAt: Date;
    public Type: AddressType;
    public UpdatedBy: string;
    public _createguid: string;
    public Contract: Contract;
    public CustomFields: any;
}


export class ContractDebugLog extends UniEntity {
    public static RelativeUrl = 'contractdebuglogs';
    public static EntityType = 'ContractDebugLog';

    public ContractRunLogID: number;
    public Message: string;
    public Deleted: boolean;
    public StatusCode: number;
    public CreatedBy: string;
    public ID: number;
    public ContractID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public Type: ContractEventType;
    public UpdatedBy: string;
    public _createguid: string;
    public Contract: Contract;
    public ContractRunLog: ContractRunLog;
    public CustomFields: any;
}


export class ContractParameter extends UniEntity {
    public static RelativeUrl = 'contractparameters';
    public static EntityType = 'ContractParameter';

    public Deleted: boolean;
    public StatusCode: number;
    public CreatedBy: string;
    public Name: string;
    public ID: number;
    public Value: string;
    public ContractID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public Contract: Contract;
    public CustomFields: any;
}


export class ContractRunLog extends UniEntity {
    public static RelativeUrl = 'contractrunlogs';
    public static EntityType = 'ContractRunLog';

    public Message: string;
    public Deleted: boolean;
    public RunTime: string;
    public StatusCode: number;
    public CreatedBy: string;
    public ID: number;
    public ContractID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public Type: ContractEventType;
    public UpdatedBy: string;
    public ContractTriggerID: number;
    public _createguid: string;
    public Contract: Contract;
    public CustomFields: any;
}


export class ContractTransaction extends UniEntity {
    public static RelativeUrl = 'contracttransactions';
    public static EntityType = 'ContractTransaction';

    public ReceiverAddress: string;
    public Deleted: boolean;
    public StatusCode: number;
    public Amount: number;
    public CreatedBy: string;
    public SenderAddress: string;
    public ContractAddressID: number;
    public AssetAddress: string;
    public ID: number;
    public ContractID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public Contract: Contract;
    public ContractAddress: ContractAddress;
    public CustomFields: any;
}


export class ContractTrigger extends UniEntity {
    public static RelativeUrl = 'contracttriggers';
    public static EntityType = 'ContractTrigger';

    public ExpressionFilter: string;
    public Deleted: boolean;
    public StatusCode: number;
    public ModelFilter: string;
    public CreatedBy: string;
    public ID: number;
    public OperationFilter: string;
    public ContractID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public Type: ContractEventType;
    public UpdatedBy: string;
    public _createguid: string;
    public Contract: Contract;
    public CustomFields: any;
}


export class Comment extends UniEntity {
    public static RelativeUrl = 'comments';
    public static EntityType = 'Comment';

    public EntityType: string;
    public AuthorID: number;
    public Deleted: boolean;
    public StatusCode: number;
    public CreatedBy: string;
    public Text: string;
    public EntityID: number;
    public ID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public Mentioned: Array<Mentioned>;
    public Author: User;
    public CustomFields: any;
}


export class Mentioned extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Mentioned';

    public Deleted: boolean;
    public UserID: number;
    public StatusCode: number;
    public CreatedBy: string;
    public ID: number;
    public CommentID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public User: User;
    public CustomFields: any;
}


export class ApiKey extends UniEntity {
    public static RelativeUrl = 'apikeys';
    public static EntityType = 'ApiKey';

    public Deleted: boolean;
    public StatusCode: number;
    public ExternalId: string;
    public Url: string;
    public CreatedBy: string;
    public IntegrationType: TypeOfIntegration;
    public IntegrationKey: string;
    public FilterDate: LocalDate;
    public Encrypt: boolean;
    public Description: string;
    public ID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Altinn extends UniEntity {
    public static RelativeUrl = 'altinn';
    public static EntityType = 'Altinn';

    public Deleted: boolean;
    public StatusCode: number;
    public SystemPw: string;
    public CreatedBy: string;
    public Language: string;
    public PreferredLogin: TypeOfLogin;
    public ID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public SystemID: string;
    public _createguid: string;
    public CustomFields: any;
}


export class AltinnReceipt extends UniEntity {
    public static RelativeUrl = 'altinnreceipts';
    public static EntityType = 'AltinnReceipt';

    public XmlReceipt: string;
    public Form: string;
    public Deleted: boolean;
    public StatusCode: number;
    public TimeStamp: Date;
    public AltinnResponseData: string;
    public ReceiptID: number;
    public CreatedBy: string;
    public ErrorText: string;
    public UserSign: string;
    public ID: number;
    public HasBeenRegistered: boolean;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public Signings: Array<AltinnSigning>;
    public CustomFields: any;
}


export class AltinnSigning extends UniEntity {
    public static RelativeUrl = 'altinnsigning';
    public static EntityType = 'AltinnSigning';

    public Deleted: boolean;
    public StatusCode: number;
    public CreatedBy: string;
    public DateSigned: Date;
    public SignatureText: string;
    public SignatureReference: string;
    public ID: number;
    public AltinnReceiptID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public StatusText: string;
    public UpdatedBy: string;
    public _createguid: string;
    public AltinnReceipt: AltinnReceipt;
    public CustomFields: any;
}


export class Barnepass extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Barnepass';

    public Deleted: boolean;
    public StatusCode: number;
    public CreatedBy: string;
    public inntektsaar: number;
    public ID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public oppgave: Array<BarnepassOppgave>;
    public CustomFields: any;
}


export class BarnepassOppgave extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'BarnepassOppgave';

    public Deleted: boolean;
    public StatusCode: number;
    public navn: string;
    public CreatedBy: string;
    public foedselsnummer: string;
    public paaloeptBeloep: number;
    public BarnepassID: number;
    public ID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public email: string;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class UserRole extends UniEntity {
    public static RelativeUrl = 'userroles';
    public static EntityType = 'UserRole';

    public Deleted: boolean;
    public SharedRoleName: string;
    public UserID: number;
    public SharedRoleId: number;
    public CreatedBy: string;
    public ID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public User: User;
    public CustomFields: any;
}


export class Role extends UniEntity {
    public static RelativeUrl = 'roles';
    public static EntityType = 'Role';

    public Deleted: boolean;
    public CreatedBy: string;
    public Description: string;
    public Name: string;
    public ID: number;
    public Label: string;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public RolePermissions: Array<RolePermission>;
    public CustomFields: any;
}


export class RolePermission extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'RolePermission';

    public Deleted: boolean;
    public PermissionID: number;
    public CreatedBy: string;
    public ID: number;
    public CreatedAt: Date;
    public RoleID: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public Role: Role;
    public Permission: Permission;
    public CustomFields: any;
}


export class Permission extends UniEntity {
    public static RelativeUrl = 'permissions';
    public static EntityType = 'Permission';

    public Deleted: boolean;
    public CreatedBy: string;
    public Name: string;
    public ID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public RolePermissions: Array<RolePermission>;
    public CustomFields: any;
}


export class AvtaleGiroAgreement extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AvtaleGiroAgreement';

    public Thumbprint: string;
    public Deleted: boolean;
    public CreatedBy: string;
    public KeyPath: string;
    public DataSender: string;
    public Description: string;
    public NextNumber: number;
    public ID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class AvtaleGiroBankAccount extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AvtaleGiroBankAccount';

    public Deleted: boolean;
    public BankAccountNumber: string;
    public CreatedBy: string;
    public CompanyID: number;
    public ID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public AvtaleGiroAgreementID: number;
    public _createguid: string;
    public Company: Company;
    public CustomFields: any;
}


export class AvtaleGiroFile extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AvtaleGiroFile';

    public Deleted: boolean;
    public CreatedBy: string;
    public FileID: number;
    public CompanyID: number;
    public ID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public AvtaleGiroContent: string;
    public UpdatedBy: string;
    public AvtaleGiroMergedFileID: number;
    public AvtaleGiroAgreementID: number;
    public _createguid: string;
    public Company: Company;
    public CustomFields: any;
}


export class AvtaleGiroMergedFile extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AvtaleGiroMergedFile';

    public Deleted: boolean;
    public TransmissionNumber: number;
    public CreatedBy: string;
    public ID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class BankAgreement extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'BankAgreement';

    public CustomerName: string;
    public Deleted: boolean;
    public OrderName: string;
    public ServiceAccountID: number;
    public ReceiptID: string;
    public CreatedBy: string;
    public OrderMobile: string;
    public CompanyID: number;
    public AccountOwnerName: string;
    public ReceiptDate: Date;
    public OrderEmail: string;
    public ID: number;
    public ServiceID: string;
    public CreatedAt: Date;
    public AccountOwnerOrgNumber: string;
    public UpdatedAt: Date;
    public CustomerOrgNumber: string;
    public UpdatedBy: string;
    public _createguid: string;
    public ServiceAccount: ServiceAccount;
    public Company: Company;
    public Services: Array<BankService>;
    public CustomFields: any;
}


export class BankService extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'BankService';

    public Deleted: boolean;
    public DivisionID: number;
    public FileType: string;
    public CreatedBy: string;
    public ConfirmInNetbank: boolean;
    public BankAgreementID: number;
    public KidRule: string;
    public ID: number;
    public ServiceType: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public DivisionName: string;
    public UpdatedBy: string;
    public _createguid: string;
    public BankAgreement: BankAgreement;
    public BankAccounts: Array<BankServiceBankAccount>;
    public CustomFields: any;
}


export class BankServiceBankAccount extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'BankServiceBankAccount';

    public Deleted: boolean;
    public BankServiceID: number;
    public CreatedBy: string;
    public AccountNumber: string;
    public ID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public BankService: BankService;
    public CustomFields: any;
}


export class Company extends UniEntity {
    public static RelativeUrl = 'companies';
    public static EntityType = 'Company';

    public ConnectionString: string;
    public Deleted: boolean;
    public StatusCode: CompanyStatusCode;
    public WebHookSubscriberId: string;
    public CreatedBy: string;
    public LastActivity: Date;
    public OrganizationNumber: string;
    public MigrationVersion: string;
    public ClientNumber: number;
    public FileFlowEmail: string;
    public FileFlowOrgnrEmail: string;
    public SchemaName: string;
    public Name: string;
    public IsTemplate: boolean;
    public ID: number;
    public IsTest: boolean;
    public IsGlobalTemplate: boolean;
    public CreatedAt: Date;
    public Key: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class CompanyAccess extends UniEntity {
    public static RelativeUrl = 'companies-access';
    public static EntityType = 'CompanyAccess';

    public GlobalIdentity: string;
    public Deleted: boolean;
    public StatusCode: number;
    public CreatedBy: string;
    public CompanyID: number;
    public StartDate: Date;
    public Roles: string;
    public ID: number;
    public CreatedAt: Date;
    public EndDate: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class CompanyBackup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'CompanyBackup';

    public CloudBlobName: string;
    public CustomerName: string;
    public ContractType: number;
    public Message: string;
    public Deleted: boolean;
    public CreatedBy: string;
    public DeletedAt: Date;
    public SchemaName: string;
    public ContainerName: string;
    public Environment: string;
    public ID: number;
    public BackupStatus: BackupStatus;
    public CompanyKey: string;
    public CompanyName: string;
    public ContractID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public CopyFiles: boolean;
    public Reason: string;
    public ScheduledForDeleteAt: Date;
    public OrgNumber: string;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class ContractCron extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ContractCron';

    public Deleted: boolean;
    public CreatedBy: string;
    public CompanyID: number;
    public Expression: string;
    public ID: number;
    public ContractID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public ContractTriggerID: number;
    public CompanyDbName: string;
    public CompanyKey: string;
    public _createguid: string;
    public CustomFields: any;
}


export class ContractObyte extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ContractObyte';

    public Deleted: boolean;
    public CreatedBy: string;
    public CompanyID: number;
    public ContractAddressID: number;
    public AssetAddress: string;
    public Address: string;
    public ID: number;
    public ContractID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CompanyDbName: string;
    public CompanyKey: string;
    public _createguid: string;
    public CustomFields: any;
}


export class DeniedUserAccessLog extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'DeniedUserAccessLog';

    public Username: string;
    public Message: string;
    public Deleted: boolean;
    public Occurred: Date;
    public CreatedBy: string;
    public CompanyID: number;
    public ID: number;
    public CompanyName: string;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public Email: string;
    public UpdatedBy: string;
    public _createguid: string;
    public Company: Company;
    public CustomFields: any;
}


export class FailedBankFile extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'FailedBankFile';

    public Deleted: boolean;
    public CreatedBy: string;
    public ID: number;
    public FileName: string;
    public CompanyKey: string;
    public FileContent: string;
    public CreatedAt: Date;
    public FailedReason: FailedReasonEnum;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class HangfireJob extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'HangfireJob';

    public GlobalIdentity: string;
    public JobId: string;
    public HasError: boolean;
    public Status: number;
    public Year: number;
    public CompanyID: number;
    public Completed: boolean;
    public ID: number;
    public CompanyKey: string;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public CustomFields: any;
}


export class HangfireJobContext extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'HangfireJobContext';

    public GlobalIdentity: string;
    public JobId: string;
    public HasError: boolean;
    public Status: number;
    public Year: number;
    public CompanyID: number;
    public SchemaName: string;
    public Completed: boolean;
    public ID: number;
    public CompanyKey: string;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public CustomFields: any;
}


export class HangfireResponse extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'HangfireResponse';

    public GlobalIdentity: string;
    public JobId: string;
    public State: string;
    public HasError: boolean;
    public Status: number;
    public Year: number;
    public CompanyID: number;
    public ProgressUrl: string;
    public Completed: boolean;
    public ID: number;
    public CompanyKey: string;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public CustomFields: any;
}


export class KpiDefinition extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'KpiDefinition';

    public IsPerUser: boolean;
    public Deleted: boolean;
    public SourceType: KpiSourceType;
    public RoleNames: string;
    public CreatedBy: string;
    public CompanyID: number;
    public ValueType: KpiValueType;
    public RefreshModels: string;
    public Interval: string;
    public Route: string;
    public Name: string;
    public Application: string;
    public ID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class KpiValue extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'KpiValue';

    public KpiName: string;
    public Deleted: boolean;
    public CreatedBy: string;
    public LastUpdated: Date;
    public CompanyID: number;
    public KpiDefinitionID: number;
    public Text: string;
    public Counter: number;
    public Total: number;
    public ID: number;
    public ValueStatus: KpiValueStatus;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UserIdentity: string;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class OutgoingInvoice extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'OutgoingInvoice';

    public Deleted: boolean;
    public StatusCode: number;
    public MetaJson: string;
    public Status: number;
    public ISPOrganizationNumber: string;
    public Amount: number;
    public CreatedBy: string;
    public CompanyID: number;
    public RecipientOrganizationNumber: string;
    public DueDate: Date;
    public InvoiceType: OutgoingInvoiceType;
    public ID: number;
    public CreatedAt: Date;
    public RecipientPhoneNumber: string;
    public InvoiceID: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public ExternalReference: string;
    public _createguid: string;
    public Company: Company;
    public CustomFields: any;
}


export class ProcessFileLog extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ProcessFileLog';

    public Message: string;
    public Deleted: boolean;
    public StatusCode: number;
    public EntityName: string;
    public FileType: number;
    public CreatedBy: string;
    public FileID: number;
    public CompanyID: number;
    public EntityInstanceID: string;
    public EntityCount: number;
    public ID: number;
    public FileName: string;
    public CompanyKey: string;
    public CompanyName: string;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UserIdentity: string;
    public UpdatedBy: string;
    public _createguid: string;
    public Company: Company;
    public CustomFields: any;
}


export class ServiceAccount extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ServiceAccount';

    public Thumbprint: string;
    public Deleted: boolean;
    public CreatedBy: string;
    public KeyPath: string;
    public DataSender: string;
    public Description: string;
    public NextNumber: number;
    public ID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class UserVerification extends UniEntity {
    public static RelativeUrl = 'user-verifications';
    public static EntityType = 'UserVerification';

    public Deleted: boolean;
    public UserId: number;
    public StatusCode: number;
    public ExpirationDate: Date;
    public CreatedBy: string;
    public CompanyId: number;
    public VerificationDate: Date;
    public ID: number;
    public DisplayName: string;
    public VerificationCode: string;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public Email: string;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Account extends UniEntity {
    public static RelativeUrl = 'accounts';
    public static EntityType = 'Account';

    public CostAllocationID: number;
    public DimensionsID: number;
    public LockManualPosts: boolean;
    public Locked: boolean;
    public AccountSetupID: number;
    public Deleted: boolean;
    public Keywords: string;
    public VatTypeID: number;
    public SupplierID: number;
    public StatusCode: number;
    public DoSynchronize: boolean;
    public EmployeeID: number;
    public CurrencyCodeID: number;
    public AccountName: string;
    public TopLevelAccountGroupID: number;
    public CreatedBy: string;
    public SystemAccount: boolean;
    public UseVatDeductionGroupID: number;
    public AccountID: number;
    public AccountGroupID: number;
    public Active: boolean;
    public Description: string;
    public AccountNumber: number;
    public ID: number;
    public SaftMappingAccountID: number;
    public CreatedAt: Date;
    public CustomerID: number;
    public Visible: boolean;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public UsePostPost: boolean;
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

    public Deleted: boolean;
    public StatusCode: number;
    public CreatedBy: string;
    public AccountID: number;
    public Name: string;
    public ID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class AccountGroup extends UniEntity {
    public static RelativeUrl = 'accountgroups';
    public static EntityType = 'AccountGroup';

    public AccountGroupSetupID: number;
    public Deleted: boolean;
    public StatusCode: number;
    public MainGroupID: number;
    public GroupNumber: string;
    public CreatedBy: string;
    public AccountID: number;
    public AccountGroupSetID: number;
    public Summable: boolean;
    public Name: string;
    public ID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CompatibleAccountID: number;
    public _createguid: string;
    public MainGroup: AccountGroup;
    public AccountGroupSet: AccountGroupSet;
    public CustomFields: any;
}


export class AccountGroupSet extends UniEntity {
    public static RelativeUrl = 'accountgroupsets';
    public static EntityType = 'AccountGroupSet';

    public SubAccountAllowed: boolean;
    public Deleted: boolean;
    public StatusCode: number;
    public Shared: boolean;
    public System: boolean;
    public CreatedBy: string;
    public ToAccountNumber: number;
    public FromAccountNumber: number;
    public Name: string;
    public ID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class AccountMandatoryDimension extends UniEntity {
    public static RelativeUrl = 'accountmandatorydimension';
    public static EntityType = 'AccountMandatoryDimension';

    public Deleted: boolean;
    public StatusCode: number;
    public CreatedBy: string;
    public AccountID: number;
    public DimensionNo: number;
    public ID: number;
    public MandatoryType: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Accrual extends UniEntity {
    public static RelativeUrl = 'accruals';
    public static EntityType = 'Accrual';

    public Deleted: boolean;
    public StatusCode: number;
    public CreatedBy: string;
    public ResultAccountID: number;
    public AccrualJournalEntryMode: number;
    public BalanceAccountID: number;
    public JournalEntryLineDraftID: number;
    public ID: number;
    public AccrualAmount: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
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

    public Deleted: boolean;
    public StatusCode: number;
    public JournalEntryDraftLineID: number;
    public Amount: number;
    public CreatedBy: string;
    public AccountYear: number;
    public ID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public AccrualID: number;
    public PeriodNo: number;
    public _createguid: string;
    public Accrual: Accrual;
    public JournalEntryLineDraft: JournalEntryLineDraft;
    public CustomFields: any;
}


export class AltinnAccountLink extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AltinnAccountLink';

    public Deleted: boolean;
    public StatusCode: number;
    public CreatedBy: string;
    public AltinnAccountNumber: number;
    public AccountNumber: number;
    public ID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Asset extends UniEntity {
    public static RelativeUrl = 'assets';
    public static EntityType = 'Asset';

    public DimensionsID: number;
    public Deleted: boolean;
    public StatusCode: number;
    public ScrapValue: number;
    public PurchaseDate: LocalDate;
    public DepreciationStartDate: LocalDate;
    public CreatedBy: string;
    public DepreciationCycle: number;
    public AssetGroupCode: string;
    public DepreciationAccountID: number;
    public AutoDepreciation: boolean;
    public BalanceAccountID: number;
    public NetFinancialValue: number;
    public PurchaseAmount: number;
    public Name: string;
    public Lifetime: number;
    public ID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Status: string;
    public CurrentNetFinancialValue: number;
    public _createguid: string;
    public BalanceAccount: Account;
    public DepreciationAccount: Account;
    public Dimensions: Dimensions;
    public DepreciationLines: Array<DepreciationLine>;
    public CustomFields: any;
}


export class Bank extends UniEntity {
    public static RelativeUrl = 'banks';
    public static EntityType = 'Bank';

    public InitialBIC: string;
    public Deleted: boolean;
    public AddressID: number;
    public EmailID: number;
    public StatusCode: number;
    public CreatedBy: string;
    public Web: string;
    public BIC: string;
    public Name: string;
    public ID: number;
    public PhoneID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public Address: Address;
    public Phone: Phone;
    public Email: Email;
    public CustomFields: any;
}


export class BankAccount extends UniEntity {
    public static RelativeUrl = 'bankaccounts';
    public static EntityType = 'BankAccount';

    public Locked: boolean;
    public Deleted: boolean;
    public StatusCode: number;
    public BankAccountType: string;
    public IntegrationSettings: string;
    public CreatedBy: string;
    public AccountID: number;
    public IBAN: string;
    public CompanySettingsID: number;
    public BankID: number;
    public BusinessRelationID: number;
    public AccountNumber: string;
    public ID: number;
    public IntegrationStatus: number;
    public Label: string;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
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

    public HasOrderedIntegrationChange: boolean;
    public Deleted: boolean;
    public PropertiesJson: string;
    public IsBankBalance: boolean;
    public StatusCode: number;
    public IsInbound: boolean;
    public CreatedBy: string;
    public BankAccountID: number;
    public DefaultAgreement: boolean;
    public IsOutgoing: boolean;
    public ServiceTemplateID: string;
    public ServiceProvider: number;
    public HasNewAccountInformation: boolean;
    public Name: string;
    public ID: number;
    public ServiceID: string;
    public BankAcceptance: boolean;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public Email: string;
    public UpdatedBy: string;
    public _createguid: string;
    public Password: string;
    public BankAccount: BankAccount;
    public CustomFields: any;
}


export class BankRule extends UniEntity {
    public static RelativeUrl = 'bankrules';
    public static EntityType = 'BankRule';

    public Deleted: boolean;
    public ActionCode: ActionCodeBankRule;
    public Rule: string;
    public Priority: number;
    public StatusCode: number;
    public CreatedBy: string;
    public AccountID: number;
    public Name: string;
    public ID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public IsActive: boolean;
    public _createguid: string;
    public Account: Account;
    public CustomFields: any;
}


export class BankStatement extends UniEntity {
    public static RelativeUrl = 'bankstatements';
    public static EntityType = 'BankStatement';

    public ArchiveReference: string;
    public AmountCurrency: number;
    public Deleted: boolean;
    public CurrencyCode: string;
    public StartBalance: number;
    public StatusCode: number;
    public ToDate: LocalDate;
    public Amount: number;
    public CreatedBy: string;
    public BankAccountID: number;
    public AccountID: number;
    public FileID: number;
    public FromDate: LocalDate;
    public ID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public EndBalance: number;
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

    public OpenAmountCurrency: number;
    public ArchiveReference: string;
    public AmountCurrency: number;
    public Receivername: string;
    public Deleted: boolean;
    public InvoiceNumber: string;
    public SenderAccount: string;
    public CurrencyCode: string;
    public ReceiverAccount: string;
    public StatusCode: number;
    public BookingDate: LocalDate;
    public Amount: number;
    public CreatedBy: string;
    public CID: string;
    public BankStatementID: number;
    public Description: string;
    public StructuredReference: string;
    public OpenAmount: number;
    public SenderName: string;
    public ID: number;
    public TransactionId: string;
    public Category: string;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public ValueDate: LocalDate;
    public UpdatedBy: string;
    public _createguid: string;
    public BankStatement: BankStatement;
    public CustomFields: any;
}


export class BankStatementMatch extends UniEntity {
    public static RelativeUrl = 'bankstatementmatch';
    public static EntityType = 'BankStatementMatch';

    public Deleted: boolean;
    public StatusCode: number;
    public Amount: number;
    public CreatedBy: string;
    public Group: string;
    public Batch: string;
    public BankStatementEntryID: number;
    public ID: number;
    public CreatedAt: Date;
    public JournalEntryLineID: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public BankStatementEntry: BankStatementEntry;
    public JournalEntryLine: JournalEntryLine;
    public CustomFields: any;
}


export class BankStatementRule extends UniEntity {
    public static RelativeUrl = 'bankstatementrules';
    public static EntityType = 'BankStatementRule';

    public EntryText: string;
    public DimensionsID: number;
    public Deleted: boolean;
    public Rule: string;
    public Priority: number;
    public StatusCode: number;
    public CreatedBy: string;
    public AccountID: number;
    public Name: string;
    public ID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public IsActive: boolean;
    public _createguid: string;
    public Dimensions: Dimensions;
    public Account: Account;
    public CustomFields: any;
}


export class Budget extends UniEntity {
    public static RelativeUrl = 'budgets';
    public static EntityType = 'Budget';

    public Deleted: boolean;
    public StatusCode: number;
    public AccountingYear: number;
    public CreatedBy: string;
    public Name: string;
    public ID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public Entries: Array<BudgetEntry>;
    public CustomFields: any;
}


export class BudgetEntry extends UniEntity {
    public static RelativeUrl = 'budgetentries';
    public static EntityType = 'BudgetEntry';

    public DimensionsID: number;
    public Deleted: boolean;
    public PeriodNumber: number;
    public StatusCode: number;
    public Amount: number;
    public CreatedBy: string;
    public AccountID: number;
    public ID: number;
    public BudgetID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
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

    public AssetSaleLossVatAccountID: number;
    public Deleted: boolean;
    public AssetSaleProfitVatAccountID: number;
    public AssetSaleProductID: number;
    public StatusCode: number;
    public ReInvoicingCostsharingProductID: number;
    public AssetSaleLossBalancingAccountID: number;
    public CreatedBy: string;
    public ReInvoicingMethod: number;
    public ReInvoicingTurnoverProductID: number;
    public AssetSaleProfitBalancingAccountID: number;
    public ID: number;
    public AssetSaleProfitNoVatAccountID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public AssetSaleLossNoVatAccountID: number;
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

    public Deleted: boolean;
    public StatusCode: number;
    public IsSalary: boolean;
    public CreditAmount: number;
    public CreatedBy: string;
    public BankAccountID: number;
    public AccountID: number;
    public IsOutgoing: boolean;
    public IsTax: boolean;
    public Name: string;
    public IsIncomming: boolean;
    public ID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public BankAccount: BankAccount;
    public Account: Account;
    public CustomFields: any;
}


export class CostAllocation extends UniEntity {
    public static RelativeUrl = 'costallocations';
    public static EntityType = 'CostAllocation';

    public Deleted: boolean;
    public StatusCode: number;
    public CreatedBy: string;
    public Name: string;
    public ID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public Items: Array<CostAllocationItem>;
    public CustomFields: any;
}


export class CostAllocationItem extends UniEntity {
    public static RelativeUrl = 'costallocationitems';
    public static EntityType = 'CostAllocationItem';

    public CostAllocationID: number;
    public DimensionsID: number;
    public Deleted: boolean;
    public VatTypeID: number;
    public StatusCode: number;
    public Amount: number;
    public CreatedBy: string;
    public Percent: number;
    public AccountID: number;
    public Description: string;
    public ID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public Account: Account;
    public VatType: VatType;
    public Dimensions: Dimensions;
    public CustomFields: any;
}


export class CustomLiquidityPayment extends UniEntity {
    public static RelativeUrl = 'liquiditypayment';
    public static EntityType = 'CustomLiquidityPayment';

    public AmountCurrency: number;
    public Deleted: boolean;
    public StatusCode: number;
    public CurrencyCodeID: number;
    public Amount: number;
    public IsCustomerPayment: boolean;
    public CreatedBy: string;
    public CustomLiquidityPaymentType: CustomLiquidityPaymentInterval;
    public DueDate: LocalDate;
    public Description: string;
    public ID: number;
    public CreatedAt: Date;
    public EndDate: LocalDate;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public currency: CurrencyCode;
    public CustomFields: any;
}


export class DepreciationLine extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'DepreciationLine';

    public DepreciationJELineID: number;
    public DepreciationType: number;
    public Deleted: boolean;
    public AssetJELineID: number;
    public StatusCode: number;
    public CreatedBy: string;
    public AssetID: number;
    public ID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public DepreciationJELine: JournalEntryLine;
    public AssetJELine: JournalEntryLine;
    public CustomFields: any;
}


export class FinancialYear extends UniEntity {
    public static RelativeUrl = 'financialyears';
    public static EntityType = 'FinancialYear';

    public Deleted: boolean;
    public StatusCode: number;
    public CreatedBy: string;
    public Year: number;
    public ValidFrom: LocalDate;
    public ValidTo: LocalDate;
    public ID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class JournalEntry extends UniEntity {
    public static RelativeUrl = 'journalentries';
    public static EntityType = 'JournalEntry';

    public JournalEntryDraftGroup: string;
    public Deleted: boolean;
    public NumberSeriesTaskID: number;
    public StatusCode: number;
    public JournalEntryNumber: string;
    public CreatedBy: string;
    public Description: string;
    public NumberSeriesID: number;
    public ID: number;
    public JournalEntryAccrualID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public FinancialYearID: number;
    public UpdatedBy: string;
    public JournalEntryNumberNumeric: number;
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

    public VatDate: LocalDate;
    public AmountCurrency: number;
    public VatReportID: number;
    public VatPercent: number;
    public DimensionsID: number;
    public Deleted: boolean;
    public InvoiceNumber: string;
    public VatTypeID: number;
    public StatusCode: number;
    public Signature: string;
    public PeriodID: number;
    public TaxBasisAmountCurrency: number;
    public PaymentReferenceID: number;
    public JournalEntryNumber: string;
    public CurrencyCodeID: number;
    public OriginalJournalEntryPost: number;
    public Amount: number;
    public PaymentID: string;
    public CreatedBy: string;
    public FinancialDate: LocalDate;
    public AccountID: number;
    public VatJournalEntryPostID: number;
    public PostPostJournalEntryLineID: number;
    public PaymentInfoTypeID: number;
    public CurrencyExchangeRate: number;
    public VatDeductionPercent: number;
    public ReferenceOriginalPostID: number;
    public VatPeriodID: number;
    public RestAmount: number;
    public CustomerInvoiceID: number;
    public RegisteredDate: LocalDate;
    public CustomerOrderID: number;
    public RestAmountCurrency: number;
    public DueDate: LocalDate;
    public Description: string;
    public JournalEntryLineDraftID: number;
    public SubAccountID: number;
    public JournalEntryID: number;
    public ID: number;
    public SupplierInvoiceID: number;
    public ReferenceCreditPostID: number;
    public TaxBasisAmount: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public JournalEntryTypeID: number;
    public OriginalReferencePostID: number;
    public BatchNumber: number;
    public UpdatedBy: string;
    public AccrualID: number;
    public JournalEntryNumberNumeric: number;
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

    public VatDate: LocalDate;
    public AmountCurrency: number;
    public VatPercent: number;
    public DimensionsID: number;
    public Deleted: boolean;
    public InvoiceNumber: string;
    public VatTypeID: number;
    public StatusCode: number;
    public Signature: string;
    public PeriodID: number;
    public TaxBasisAmountCurrency: number;
    public PaymentReferenceID: number;
    public JournalEntryNumber: string;
    public CurrencyCodeID: number;
    public Amount: number;
    public PaymentID: string;
    public CreatedBy: string;
    public FinancialDate: LocalDate;
    public AccountID: number;
    public PostPostJournalEntryLineID: number;
    public PaymentInfoTypeID: number;
    public CurrencyExchangeRate: number;
    public VatDeductionPercent: number;
    public VatPeriodID: number;
    public CustomerInvoiceID: number;
    public RegisteredDate: LocalDate;
    public CustomerOrderID: number;
    public DueDate: LocalDate;
    public Description: string;
    public SubAccountID: number;
    public JournalEntryID: number;
    public ID: number;
    public SupplierInvoiceID: number;
    public TaxBasisAmount: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public JournalEntryTypeID: number;
    public BatchNumber: number;
    public UpdatedBy: string;
    public AccrualID: number;
    public JournalEntryNumberNumeric: number;
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

    public Deleted: boolean;
    public StatusCode: number;
    public TraceLinkTypes: string;
    public CreatedBy: string;
    public VisibleModules: string;
    public ColumnSetUp: string;
    public Name: string;
    public ID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class JournalEntrySourceSerie extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'JournalEntrySourceSerie';

    public Deleted: boolean;
    public StatusCode: number;
    public JournalEntrySourceID: number;
    public CreatedBy: string;
    public ID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public JournalEntrySourceInstanceID: number;
    public JournalEntrySourceEntityName: string;
    public _createguid: string;
    public CustomFields: any;
}


export class JournalEntryType extends UniEntity {
    public static RelativeUrl = 'journalentrytypes';
    public static EntityType = 'JournalEntryType';

    public MainName: string;
    public Deleted: boolean;
    public CreatedBy: string;
    public ExpectNegativeAmount: boolean;
    public Name: string;
    public ID: number;
    public DisplayName: string;
    public Number: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class LedgerSuggestion extends UniEntity {
    public BusinessType: string;
    public Name: string;
    public ID: number;
    public Source: SuggestionSource;
    public IndustryName: string;
    public OrgNumber: string;
    public IndustryCode: string;
}


export class Payment extends UniEntity {
    public static RelativeUrl = 'payments';
    public static EntityType = 'Payment';

    public Debtor: string;
    public PaymentCodeID: number;
    public AmountCurrency: number;
    public IsPaymentCancellationRequest: boolean;
    public Deleted: boolean;
    public FromBankAccountID: number;
    public InvoiceNumber: string;
    public ToBankAccountID: number;
    public PaymentBatchID: number;
    public OcrPaymentStrings: string;
    public StatusCode: number;
    public PaymentStatusReportFileID: number;
    public Domain: string;
    public PaymentDate: LocalDate;
    public ExternalBankAccountNumber: string;
    public CurrencyCodeID: number;
    public PaymentNotificationReportFileID: number;
    public Amount: number;
    public IsCustomerPayment: boolean;
    public PaymentID: string;
    public CreatedBy: string;
    public BankChargeAmount: number;
    public IsExternal: boolean;
    public CurrencyExchangeRate: number;
    public CustomerInvoiceReminderID: number;
    public CustomerInvoiceID: number;
    public DueDate: LocalDate;
    public Description: string;
    public BusinessRelationID: number;
    public JournalEntryID: number;
    public ID: number;
    public AutoJournal: boolean;
    public SupplierInvoiceID: number;
    public InPaymentID: string;
    public IsPaymentClaim: boolean;
    public Proprietary: string;
    public XmlTagEndToEndIdReference: string;
    public CreatedAt: Date;
    public XmlTagPmtInfIdReference: string;
    public ReconcilePayment: boolean;
    public SerialNumberOrAcctSvcrRef: string;
    public UpdatedAt: Date;
    public StatusText: string;
    public UpdatedBy: string;
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

    public Deleted: boolean;
    public StatusCode: number;
    public PaymentStatusReportFileID: number;
    public OcrTransmissionNumber: number;
    public PaymentReferenceID: string;
    public NumberOfPayments: number;
    public Camt054CMsgId: string;
    public IsCustomerPayment: boolean;
    public CreatedBy: string;
    public TransferredDate: Date;
    public ReceiptDate: Date;
    public OcrHeadingStrings: string;
    public PaymentFileID: number;
    public TotalAmount: number;
    public ID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public PaymentBatchTypeID: number;
    public UpdatedBy: string;
    public _createguid: string;
    public Payments: Array<Payment>;
    public PaymentBatchType: PaymentBatchType;
    public CustomFields: any;
}


export class PostPost extends UniEntity {
    public static RelativeUrl = 'postposts';
    public static EntityType = 'PostPost';

    public AmountCurrency: number;
    public Deleted: boolean;
    public StatusCode: number;
    public Date: LocalDate;
    public CurrencyCodeID: number;
    public Amount: number;
    public CreatedBy: string;
    public JournalEntryLine1ID: number;
    public CurrencyExchangeRate: number;
    public ID: number;
    public CreatedAt: Date;
    public JournalEntryLine2ID: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public JournalEntryLine1: JournalEntryLine;
    public JournalEntryLine2: JournalEntryLine;
    public CurrencyCode: CurrencyCode;
    public CustomFields: any;
}


export class ReInvoice extends UniEntity {
    public static RelativeUrl = 'reinvoicing';
    public static EntityType = 'ReInvoice';

    public TaxExclusiveAmount: number;
    public Deleted: boolean;
    public StatusCode: number;
    public CreatedBy: string;
    public TaxInclusiveAmount: number;
    public ID: number;
    public SupplierInvoiceID: number;
    public ProductID: number;
    public OwnCostShare: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public OwnCostAmount: number;
    public ReInvoicingType: number;
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

    public Deleted: boolean;
    public StatusCode: number;
    public CreatedBy: string;
    public Surcharge: number;
    public Vat: number;
    public NetAmount: number;
    public ReInvoiceID: number;
    public Share: number;
    public ID: number;
    public CreatedAt: Date;
    public GrossAmount: number;
    public CustomerID: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public Customer: Customer;
    public CustomFields: any;
}


export class SupplierInvoice extends UniEntity {
    public static RelativeUrl = 'supplierinvoices';
    public static EntityType = 'SupplierInvoice';

    public Credited: boolean;
    public PrintStatus: number;
    public TaxExclusiveAmount: number;
    public IsSentToPayment: boolean;
    public InvoiceDate: LocalDate;
    public InvoicePostalCode: string;
    public Deleted: boolean;
    public InvoiceNumber: string;
    public SupplierID: number;
    public OurReference: string;
    public StatusCode: number;
    public AmountRegards: string;
    public PayableRoundingAmount: number;
    public DeliveryTermsID: number;
    public InvoiceReceiverName: string;
    public PayableRoundingCurrencyAmount: number;
    public PaymentInformation: string;
    public CurrencyCodeID: number;
    public PaymentID: string;
    public CreatedBy: string;
    public VatTotalsAmount: number;
    public BankAccountID: number;
    public ShippingAddressLine1: string;
    public ReInvoiced: boolean;
    public InvoiceReferenceID: number;
    public InvoiceAddressLine1: string;
    public DeliveryMethod: string;
    public Comment: string;
    public ShippingAddressLine3: string;
    public PaymentStatus: number;
    public InternalNote: string;
    public DeliveryName: string;
    public InvoiceOriginType: SupplierInvoiceOriginType;
    public ProjectID: number;
    public CurrencyExchangeRate: number;
    public FreeTxt: string;
    public DeliveryTerm: string;
    public DefaultDimensionsID: number;
    public CreditedAmountCurrency: number;
    public ReInvoiceID: number;
    public CreditDays: number;
    public RestAmount: number;
    public SalesPerson: string;
    public Requisition: string;
    public RestAmountCurrency: number;
    public PaymentTerm: string;
    public InvoiceCountry: string;
    public ShippingPostalCode: string;
    public TaxInclusiveAmount: number;
    public YourReference: string;
    public ShippingCountry: string;
    public JournalEntryID: number;
    public InvoiceType: number;
    public ID: number;
    public TaxInclusiveAmountCurrency: number;
    public ShippingAddressLine2: string;
    public PaymentTermsID: number;
    public DeliveryDate: LocalDate;
    public ShippingCity: string;
    public PaymentDueDate: LocalDate;
    public ShippingCountryCode: string;
    public InvoiceCountryCode: string;
    public InvoiceCity: string;
    public CreatedAt: Date;
    public SupplierOrgNumber: string;
    public CustomerPerson: string;
    public UpdatedAt: Date;
    public VatTotalsAmountCurrency: number;
    public CustomerOrgNumber: string;
    public CreditedAmount: number;
    public UpdatedBy: string;
    public TaxExclusiveAmountCurrency: number;
    public InvoiceAddressLine2: string;
    public Payment: string;
    public InvoiceAddressLine3: string;
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

    public DiscountPercent: number;
    public DiscountCurrency: number;
    public VatPercent: number;
    public DimensionsID: number;
    public PriceSetByUser: boolean;
    public InvoicePeriodEndDate: LocalDate;
    public SumTotalIncVatCurrency: number;
    public Discount: number;
    public Deleted: boolean;
    public PriceExVatCurrency: number;
    public VatTypeID: number;
    public StatusCode: number;
    public InvoicePeriodStartDate: LocalDate;
    public CurrencyCodeID: number;
    public CalculateGrossPriceBasedOnNetPrice: boolean;
    public CreatedBy: string;
    public SumTotalExVat: number;
    public SumTotalIncVat: number;
    public Comment: string;
    public SumVat: number;
    public AccountingCost: string;
    public PriceExVat: number;
    public CurrencyExchangeRate: number;
    public SumVatCurrency: number;
    public SumTotalExVatCurrency: number;
    public ItemText: string;
    public SortIndex: number;
    public ID: number;
    public SupplierInvoiceID: number;
    public ProductID: number;
    public PriceIncVat: number;
    public NumberOfItems: number;
    public CreatedAt: Date;
    public Unit: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
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

    public Deleted: boolean;
    public StatusCode: number;
    public CreatedBy: string;
    public Name: string;
    public ID: number;
    public No: string;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class VatDeduction extends UniEntity {
    public static RelativeUrl = 'vatdeductions';
    public static EntityType = 'VatDeduction';

    public DeductionPercent: number;
    public Deleted: boolean;
    public StatusCode: number;
    public CreatedBy: string;
    public ValidFrom: LocalDate;
    public ValidTo: LocalDate;
    public VatDeductionGroupID: number;
    public ID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public VatDeductionGroup: VatDeductionGroup;
    public CustomFields: any;
}


export class VatDeductionGroup extends UniEntity {
    public static RelativeUrl = 'vatdeductiongroups';
    public static EntityType = 'VatDeductionGroup';

    public Deleted: boolean;
    public StatusCode: number;
    public CreatedBy: string;
    public Name: string;
    public ID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class VatPost extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'VatPost';

    public Deleted: boolean;
    public StatusCode: number;
    public HasTaxAmount: boolean;
    public CreatedBy: string;
    public Name: string;
    public ReportAsNegativeAmount: boolean;
    public ID: number;
    public No: string;
    public VatCodeGroupID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public HasTaxBasis: boolean;
    public _createguid: string;
    public VatCodeGroup: VatCodeGroup;
    public VatReportReferences: Array<VatReportReference>;
    public CustomFields: any;
}


export class VatReport extends UniEntity {
    public static RelativeUrl = 'vatreports';
    public static EntityType = 'VatReport';

    public Deleted: boolean;
    public StatusCode: number;
    public ReportedDate: Date;
    public Title: string;
    public TerminPeriodID: number;
    public CreatedBy: string;
    public ExecutedDate: Date;
    public Comment: string;
    public ExternalRefNo: string;
    public VatReportTypeID: number;
    public InternalComment: string;
    public JournalEntryID: number;
    public ID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public VatReportArchivedSummaryID: number;
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

    public Deleted: boolean;
    public AmountToBeReceived: number;
    public StatusCode: number;
    public ReportName: string;
    public PaymentYear: number;
    public PaymentID: string;
    public CreatedBy: string;
    public AmountToBePayed: number;
    public PaymentPeriod: string;
    public SummaryHeader: string;
    public PaymentToDescription: string;
    public ID: number;
    public PaymentDueDate: Date;
    public PaymentBankAccountNumber: string;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class VatReportReference extends UniEntity {
    public static RelativeUrl = 'vatreportreferences';
    public static EntityType = 'VatReportReference';

    public Deleted: boolean;
    public VatPostID: number;
    public VatTypeID: number;
    public StatusCode: number;
    public CreatedBy: string;
    public AccountID: number;
    public ID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public VatType: VatType;
    public VatPost: VatPost;
    public Account: Account;
    public CustomFields: any;
}


export class VatReportType extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'VatReportType';

    public Deleted: boolean;
    public StatusCode: number;
    public CreatedBy: string;
    public Name: string;
    public ID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class VatType extends UniEntity {
    public static RelativeUrl = 'vattypes';
    public static EntityType = 'VatType';

    public AvailableInModules: boolean;
    public Locked: boolean;
    public Deleted: boolean;
    public VatCode: string;
    public StatusCode: number;
    public VatCodeGroupingValue: VatCodeGroupingValueEnum;
    public OutgoingAccountID: number;
    public VatTypeSetupID: number;
    public CreatedBy: string;
    public InUse: boolean;
    public IncomingAccountID: number;
    public Name: string;
    public ID: number;
    public OutputVat: boolean;
    public DirectJournalEntryOnly: boolean;
    public ReversedTaxDutyVat: boolean;
    public VatCodeGroupID: number;
    public CreatedAt: Date;
    public Visible: boolean;
    public Alias: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public VatPercent: number;
    public _createguid: string;
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

    public VatPercent: number;
    public Deleted: boolean;
    public VatTypeID: number;
    public StatusCode: number;
    public CreatedBy: string;
    public ValidFrom: LocalDate;
    public ValidTo: LocalDate;
    public ID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Reconcile extends UniEntity {
    public static RelativeUrl = 'reconcile';
    public static EntityType = 'Reconcile';

    public Deleted: boolean;
    public IntervalNumber: number;
    public StatusCode: number;
    public ToDate: LocalDate;
    public CreatedBy: string;
    public ReconcileType: string;
    public AccountYear: number;
    public Interval: ReconcileInterval;
    public FromDate: LocalDate;
    public ID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public Accounts: Array<ReconcileAccount>;
    public CustomFields: any;
}


export class ReconcileAccount extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ReconcileAccount';

    public Deleted: boolean;
    public StatusCode: number;
    public IsApproved: boolean;
    public CreatedBy: string;
    public AccountID: number;
    public Balance: number;
    public Comment: string;
    public ID: number;
    public ApprovedAt: Date;
    public ReconcileID: number;
    public CreatedAt: Date;
    public ApprovedBy: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class AnnualSettlement extends UniEntity {
    public static RelativeUrl = 'annualsettlement';
    public static EntityType = 'AnnualSettlement';

    public Deleted: boolean;
    public StatusCode: number;
    public AnnualSettlementCheckListID: number;
    public CreatedBy: string;
    public AccountYear: number;
    public JournalEntryID: number;
    public ID: number;
    public ReconcileID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public Reconcile: Reconcile;
    public AnnualSettlementCheckList: AnnualSettlementCheckList;
    public CustomFields: any;
}


export class AnnualSettlementCheckList extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AnnualSettlementCheckList';

    public Deleted: boolean;
    public StatusCode: number;
    public CreatedBy: string;
    public AreAllPreviousYearsEndedAndBalances: boolean;
    public IsVatReportOK: boolean;
    public IsAllSupplierInvoicesPaid: boolean;
    public ID: number;
    public IsShareCapitalOK: boolean;
    public IsAllCustomerInvoicesPaid: boolean;
    public CreatedAt: Date;
    public IsAmeldingOK: boolean;
    public UpdatedAt: Date;
    public IsAllJournalsDone: boolean;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class TaxReport extends UniEntity {
    public static RelativeUrl = 'taxreport';
    public static EntityType = 'TaxReport';

    public Deleted: boolean;
    public StatusCode: number;
    public CreatedBy: string;
    public Year: number;
    public AnnualSettlementID: number;
    public Data: string;
    public Code: string;
    public ID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class EntityValidationRule extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'EntityValidationRule';

    public Operator: Operator;
    public EntityType: string;
    public ChangedByCompany: boolean;
    public Message: string;
    public Level: ValidationLevel;
    public Deleted: boolean;
    public OnConflict: OnConflict;
    public PropertyName: string;
    public System: boolean;
    public SyncKey: string;
    public CreatedBy: string;
    public ID: number;
    public Value: string;
    public Operation: OperationType;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class EntityValidationRuleTemplate extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'EntityValidationRuleTemplate';

    public Operator: Operator;
    public EntityType: string;
    public ChangedByCompany: boolean;
    public Message: string;
    public Level: ValidationLevel;
    public Deleted: boolean;
    public OnConflict: OnConflict;
    public PropertyName: string;
    public System: boolean;
    public SyncKey: string;
    public CreatedBy: string;
    public ID: number;
    public Value: string;
    public Operation: OperationType;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class ComplexValidationRule extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ComplexValidationRule';

    public ValidationCode: number;
    public EntityType: string;
    public ChangedByCompany: boolean;
    public Message: string;
    public Level: ValidationLevel;
    public Deleted: boolean;
    public OnConflict: OnConflict;
    public System: boolean;
    public SyncKey: string;
    public CreatedBy: string;
    public ID: number;
    public Operation: OperationType;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class ComplexValidationRuleTemplate extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ComplexValidationRuleTemplate';

    public ValidationCode: number;
    public EntityType: string;
    public ChangedByCompany: boolean;
    public Message: string;
    public Level: ValidationLevel;
    public Deleted: boolean;
    public OnConflict: OnConflict;
    public System: boolean;
    public SyncKey: string;
    public CreatedBy: string;
    public ID: number;
    public Operation: OperationType;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class CustomField extends UniEntity {
    public static RelativeUrl = 'custom-fields';
    public static EntityType = 'CustomField';

    public Deleted: boolean;
    public StatusCode: number;
    public CreatedBy: string;
    public ModelID: number;
    public Nullable: boolean;
    public DataType: string;
    public Name: string;
    public ID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class ValueList extends UniEntity {
    public static RelativeUrl = 'valuelists';
    public static EntityType = 'ValueList';

    public Deleted: boolean;
    public CreatedBy: string;
    public Description: string;
    public Name: string;
    public Code: string;
    public ID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public Items: Array<ValueItem>;
    public CustomFields: any;
}


export class ValueItem extends UniEntity {
    public static RelativeUrl = 'valueitems';
    public static EntityType = 'ValueItem';

    public ValueListID: number;
    public Deleted: boolean;
    public Index: number;
    public CreatedBy: string;
    public Description: string;
    public Name: string;
    public Code: string;
    public ID: number;
    public Value: string;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
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

    public Options: string;
    public EntityType: string;
    public FieldType: FieldType;
    public Deleted: boolean;
    public Legend: string;
    public Combo: number;
    public StatusCode: number;
    public Url: string;
    public HelpText: string;
    public Section: number;
    public Width: string;
    public Placement: number;
    public CreatedBy: string;
    public Sectionheader: string;
    public Property: string;
    public ComponentLayoutID: number;
    public Placeholder: string;
    public DisplayField: string;
    public Alignment: Alignment;
    public ReadOnly: boolean;
    public Description: string;
    public LookupEntityType: string;
    public ID: number;
    public LookupField: boolean;
    public Label: string;
    public CreatedAt: Date;
    public LineBreak: boolean;
    public UpdatedAt: Date;
    public ValueList: string;
    public FieldSet: number;
    public UpdatedBy: string;
    public Hidden: boolean;
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
    public Invoicable: number;
    public Workflow: TimesheetWorkflow;
    public WeekNumber: number;
    public Overtime: number;
    public Status: WorkStatus;
    public ExpectedTime: number;
    public Flextime: number;
    public TotalTime: number;
    public Date: Date;
    public SickTime: number;
    public EndTime: Date;
    public WeekDay: number;
    public Projecttime: number;
    public TimeOff: number;
    public ValidTime: number;
    public StartTime: Date;
    public IsWeekend: boolean;
    public ValidTimeOff: number;
}


export class WorkBalanceDto extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'WorkBalanceDto';

    public LastDayActual: number;
    public Deleted: boolean;
    public StatusCode: number;
    public ExpectedMinutes: number;
    public CreatedBy: string;
    public Days: number;
    public ValidFrom: Date;
    public LastDayExpected: number;
    public IsStartBalance: boolean;
    public Description: string;
    public ActualMinutes: number;
    public SumOvertime: number;
    public Balancetype: WorkBalanceTypeEnum;
    public ID: number;
    public BalanceFrom: Date;
    public WorkRelationID: number;
    public CreatedAt: Date;
    public Minutes: number;
    public UpdatedAt: Date;
    public ValidTimeOff: number;
    public UpdatedBy: string;
    public BalanceDate: Date;
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
    public ExpectedMinutes: number;
    public Date: Date;
    public WorkedMinutes: number;
    public IsWeekend: boolean;
    public ValidTimeOff: number;
}


export class ContactSearchServiceResponse extends UniEntity {
    public ErrorCode: number;
    public ErrorMessage: string;
    public Method: string;
    public ObjectName: string;
    public Success: boolean;
}


export class InvoicesAndRemindersReadyToRemind extends UniEntity {
    public DontSendReminders: boolean;
    public CustomerName: string;
    public InvoiceDate: Date;
    public ReminderNumber: number;
    public InvoiceNumber: number;
    public StatusCode: number;
    public CurrencyCodeCode: string;
    public EmailAddress: string;
    public CurrencyCodeID: number;
    public CustomerNumber: number;
    public Fee: number;
    public CurrencyExchangeRate: number;
    public CustomerInvoiceReminderID: number;
    public RestAmount: number;
    public CustomerInvoiceID: number;
    public RestAmountCurrency: number;
    public DueDate: Date;
    public TaxInclusiveAmount: number;
    public TaxInclusiveAmountCurrency: number;
    public Interest: number;
    public CurrencyCodeShortCode: string;
    public CustomerID: number;
    public ExternalReference: string;
}


export class TradeHeaderCalculationSummary extends UniEntity {
    public SumNoVatBasisCurrency: number;
    public SumVatBasis: number;
    public SumTotalIncVatCurrency: number;
    public DecimalRoundingCurrency: number;
    public SumTotalExVat: number;
    public SumTotalIncVat: number;
    public SumVat: number;
    public SumDiscountCurrency: number;
    public SumVatCurrency: number;
    public SumTotalExVatCurrency: number;
    public SumNoVatBasis: number;
    public SumDiscount: number;
    public SumVatBasisCurrency: number;
    public DecimalRounding: number;
}


export class VatCalculationSummary extends UniEntity {
    public VatPercent: number;
    public SumVatBasis: number;
    public SumVat: number;
    public SumVatCurrency: number;
    public SumVatBasisCurrency: number;
}


export class InvoicePaymentData extends UniEntity {
    public AmountCurrency: number;
    public DimensionsID: number;
    public FromBankAccountID: number;
    public PaymentDate: LocalDate;
    public CurrencyCodeID: number;
    public Amount: number;
    public PaymentID: string;
    public BankChargeAmount: number;
    public AccountID: number;
    public CurrencyExchangeRate: number;
    public AgioAccountID: number;
    public AgioAmount: number;
    public BankChargeAccountID: number;
}


export class InvoiceSummary extends UniEntity {
    public SumCreditedAmount: number;
    public SumRestAmount: number;
    public SumTotalAmount: number;
}


export class CustomerNoAndName extends UniEntity {
    public Name: string;
    public Number: string;
}


export class InvoicePayment extends UniEntity {
    public AmountCurrency: number;
    public JournalEntryNumber: string;
    public Amount: number;
    public FinancialDate: LocalDate;
    public Description: string;
    public JournalEntryID: number;
    public JournalEntryLineID: number;
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
    public ReasonHelpLink: string;
    public ReasonCode: string;
    public ReasonDescription: string;
}


export class AmountDetail extends UniEntity {
    public Amount: number;
    public Currency: string;
}


export class Limits extends UniEntity {
    public MaxInvoiceAmount: number;
    public Limit: number;
    public RemainingLimit: number;
}


export class AmeldingAgaAndTaxSums extends UniEntity {
    public EmploymentTax: number;
    public MessageID: string;
    public FinancialTax: number;
    public TaxDraw: number;
    public GarnishmentTax: number;
    public period: number;
    public DueDate: Date;
    public KIDFinancialTax: string;
    public AccountNumber: string;
    public KIDGarnishment: string;
    public KIDEmploymentTax: string;
    public KIDTaxDraw: string;
}


export class PayrollRunInAmeldingPeriod extends UniEntity {
    public PayrollrunID: number;
    public AmeldingSentdate: Date;
    public PayrollrunDescription: string;
    public PayrollrunPaydate: Date;
    public CanGenerateAddition: boolean;
}


export class PayAgaTaxDTO extends UniEntity {
    public payGarnishment: boolean;
    public payDate: Date;
    public payTaxDraw: boolean;
    public payFinancialTax: boolean;
    public correctPennyDiff: boolean;
    public payAga: boolean;
}


export class AmeldingSumUp extends UniEntity {
    public meldingsID: string;
    public generated: Date;
    public status: AmeldingStatus;
    public year: number;
    public altInnStatus: string;
    public period: number;
    public LegalEntityNo: string;
    public ReplacesAMeldingID: number;
    public ID: number;
    public sent: Date;
    public type: AmeldingType;
    public Replaces: string;
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
    public arbeidsforholdId: string;
    public startDate: Date;
    public endDate: Date;
    public type: string;
    public permisjon: Array<EmploymentLeaves>;
}


export class EmploymentLeaves extends UniEntity {
    public beskrivelse: string;
    public sluttdato: Date;
    public startdato: Date;
    public permisjonsId: string;
    public permisjonsprosent: string;
}


export class TransactionTypes extends UniEntity {
    public tax: boolean;
    public Base_EmploymentTax: boolean;
    public benefit: string;
    public amount: number;
    public description: string;
    public incomeType: string;
}


export class AGADetails extends UniEntity {
    public baseAmount: number;
    public sectorName: string;
    public zoneName: string;
    public rate: number;
    public type: string;
}


export class Totals extends UniEntity {
    public sumTax: number;
    public sumAGA: number;
    public sumUtleggstrekk: number;
}


export class AnnualStatement extends UniEntity {
    public EmployeeMunicipalName: string;
    public EmployerWebAddress: string;
    public EmployerCountry: string;
    public EmployeeSSn: string;
    public EmployerName: string;
    public EmployeeNumber: number;
    public EmployerPhoneNumber: string;
    public EmployeeAddress: string;
    public Year: number;
    public EmployeePostCode: string;
    public EmployeeCity: string;
    public EmployerCountryCode: string;
    public EmployerEmail: string;
    public EmployeeMunicipalNumber: string;
    public EmployerAddress: string;
    public EmployeeName: string;
    public EmployerTaxMandatory: boolean;
    public VacationPayBase: number;
    public EmployerPostCode: string;
    public EmployerOrgNr: string;
    public EmployerCity: string;
    public Contributions: Array<AnnualStatementLine>;
    public PensionOrBenefits: Array<AnnualStatementLine>;
    public Deductions: Array<AnnualStatementLine>;
    public Draws: Array<AnnualStatementLine>;
}


export class AnnualStatementLine extends UniEntity {
    public SupplementPackageName: string;
    public IsDeduction: boolean;
    public Amount: number;
    public TaxReturnPost: string;
    public Description: string;
    public LineIndex: number;
    public Sum: number;
    public Supplements: Array<SupplementInfo>;
}


export class SupplementInfo extends UniEntity {
    public ValueString: string;
    public WageTypeSupplementID: number;
    public ValueType: Valuetype;
    public ValueMoney: number;
    public ValueDate2: Date;
    public Name: string;
    public ValueDate: Date;
    public ValueBool: boolean;
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
    public Title: string;
    public Text: string;
    public IsJob: boolean;
    public employeestatus: Array<EmployeeStatus>;
}


export class EmployeeStatus extends UniEntity {
    public employeeID: number;
    public status: string;
    public employeeNumber: number;
    public year: number;
    public info: string;
    public ssn: string;
    public changedFields: Array<FieldsChanged>;
}


export class FieldsChanged extends UniEntity {
    public valFrom: string;
    public valTo: string;
    public fieldName: string;
}


export class EmploymentHistoryRecord extends UniEntity {
    public HourRate: number;
    public ChangedAt: Date;
    public WorkPercent: number;
    public MonthRate: number;
    public RegulativeGroupID: number;
    public RegulativeStepNr: number;
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
    public tax: number;
    public employeeID: number;
    public netPayment: number;
}


export class SumOnYear extends UniEntity {
    public taxBase: number;
    public nonTaxableAmount: number;
    public pension: number;
    public employeeID: number;
    public sumTax: number;
    public baseVacation: number;
    public paidHolidaypay: number;
    public advancePayment: number;
    public netPayment: number;
    public usedNonTaxableAmount: number;
    public grossPayment: number;
}


export class VacationPayLastYear extends UniEntity {
    public employeeID: number;
    public baseVacation: number;
    public paidHolidayPay: number;
}


export class SalaryTransactionPay extends UniEntity {
    public CompanyBankAccountID: number;
    public PaymentDate: Date;
    public Withholding: number;
    public SalaryBankAccountID: number;
    public TaxBankAccountID: number;
    public CompanyAddress: string;
    public CompanyName: string;
    public CompanyCity: string;
    public CompanyPostalCode: string;
    public PayList: Array<SalaryTransactionPayLine>;
    public SalaryBalancePayList: Array<SalaryBalancePayLine>;
}


export class SalaryTransactionPayLine extends UniEntity {
    public Tax: number;
    public City: string;
    public EmployeeNumber: number;
    public Account: string;
    public NetPayment: number;
    public EmployeeName: string;
    public Address: string;
    public PostalCode: string;
}


export class SalaryBalancePayLine extends UniEntity {
    public Kid: string;
    public Account: string;
    public Text: string;
    public Sum: number;
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
    public ReportID: number;
    public Message: string;
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
    public Year: number;
    public BookedPayruns: number;
    public CreatedPayruns: number;
    public FromPeriod: number;
    public ToPeriod: number;
    public Groups: Array<ReconciliationGroup>;
}


export class ReconciliationGroup extends UniEntity {
    public AccountNumber: string;
    public Sum: number;
    public Lines: Array<ReconciliationLine>;
}


export class ReconciliationLine extends UniEntity {
    public Benefit: string;
    public HasEmploymentTax: boolean;
    public WageTypeName: string;
    public Description: string;
    public Sum: number;
    public IncomeType: string;
    public WageTypeNumber: number;
}


export class UnionReport extends UniEntity {
    public ToDate: LocalDate;
    public Year: number;
    public FromDate: LocalDate;
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
    public Name: string;
    public UnionDraw: number;
    public MemberNumber: string;
}


export class SalaryTransactionSums extends UniEntity {
    public baseAGA: number;
    public paidAdvance: number;
    public calculatedVacationPay: number;
    public baseVacation: number;
    public tableTax: number;
    public calculatedFinancialTax: number;
    public percentTax: number;
    public calculatedAGA: number;
    public netPayment: number;
    public paidPension: number;
    public manualTax: number;
    public baseTableTax: number;
    public grossPayment: number;
    public Employee: number;
    public Payrun: number;
    public basePercentTax: number;
}


export class SalaryTransactionPeriodSums extends UniEntity {
    public AgaZone: string;
    public Year: number;
    public AgaRate: number;
    public FromPeriod: number;
    public MunicipalName: string;
    public ToPeriod: number;
    public OrgNumber: string;
    public Sums: SalaryTransactionSums;
    public Aga: AGACalculation;
}


export class code extends UniEntity {
    public inngaarIGrunnlagForTrekk: string;
    public fordel: string;
    public skatteOgAvgiftregel: string;
    public kunfranav: string;
    public uninavn: string;
    public gyldigtil: string;
    public utloeserArbeidsgiveravgift: string;
    public gyldigfom: string;
    public postnr: string;
    public gmlcode: string;
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
    public ContractType: number;
    public ProductNames: string;
    public TemplateCompanyKey: string;
    public LicenseKey: string;
    public IsTemplate: boolean;
    public CompanyName: string;
    public IsTest: boolean;
    public ContractID: number;
    public CopyFiles: boolean;
    public CompanySettings: CompanySettings;
}


export class UserDto extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'UserDto';

    public GlobalIdentity: string;
    public Protected: boolean;
    public UserName: string;
    public Deleted: boolean;
    public IsAutobankAdmin: boolean;
    public StatusCode: number;
    public PermissionHandling: string;
    public HasAgreedToImportDisclaimer: boolean;
    public CreatedBy: string;
    public LastLogin: Date;
    public BankIntegrationUserName: string;
    public ID: number;
    public DisplayName: string;
    public CreatedAt: Date;
    public PhoneNumber: string;
    public UpdatedAt: Date;
    public Email: string;
    public UpdatedBy: string;
    public TwoFactorEnabled: boolean;
    public AuthPhoneNumber: string;
    public _createguid: string;
    public EndDate: Date;
    public License: UserLicenseInformation;
    public CustomFields: any;
}


export class UserLicenseInformation extends UniEntity {
    public GlobalIdentity: string;
    public Comment: string;
    public UserLicenseKey: string;
    public Name: string;
    public CustomerAgreement: CustomerLicenseAgreementInfo;
    public UserType: UserLicenseType;
    public Company: CompanyLicenseInfomation;
    public ContractType: ContractLicenseType;
    public UserLicenseAgreement: LicenseAgreementInfo;
}


export class CustomerLicenseAgreementInfo extends UniEntity {
    public CanAgreeToLicense: boolean;
    public HasAgreedToLicense: boolean;
    public AgreementId: number;
}


export class UserLicenseType extends UniEntity {
    public TypeID: number;
    public TypeName: string;
    public EndDate: Date;
}


export class CompanyLicenseInfomation extends UniEntity {
    public StatusCode: LicenseEntityStatus;
    public Name: string;
    public ID: number;
    public ContactEmail: string;
    public ContractID: number;
    public Key: string;
    public ContactPerson: string;
    public EndDate: Date;
    public Agency: Agency;
}


export class Agency extends UniEntity {
    public Name: string;
    public CompanyKey: string;
}


export class ContractLicenseType extends UniEntity {
    public StartDate: Date;
    public TypeID: number;
    public TypeName: string;
    public TrialExpiration: Date;
}


export class LicenseAgreementInfo extends UniEntity {
    public HasAgreedToLicense: boolean;
    public AgreementId: number;
}


export class CreateBankUserDTO extends UniEntity {
    public Phone: string;
    public AdminPassword: string;
    public AdminUserId: number;
    public IsAdmin: boolean;
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
    public GrantSum: number;
    public MaxFreeAmount: number;
    public UsedFreeAmount: number;
}


export class AuthenticationChallengeBE extends UniEntity {
    public Message: string;
    public Status: ChallengeRequestResult;
    public ValidFrom: Date;
    public ValidTo: Date;
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
    public IncludeIncome: boolean;
    public ReportType: ReportType;
    public Year: number;
    public IncludeEmployments: boolean;
    public FromPeriod: Maaned;
    public IncludeInfoPerPerson: boolean;
    public ToPeriod: Maaned;
}


export class A07Response extends UniEntity {
    public mainStatus: string;
    public Title: string;
    public Text: string;
    public Data: string;
    public DataType: string;
    public DataName: string;
}


export class SelfEmployed extends UniEntity {
    public year: number;
    public items: Array<SelfEmployedItem>;
}


export class SelfEmployedItem extends UniEntity {
    public supplierID: number;
    public amount: number;
    public name: string;
    public number: string;
}


export class SetIntegrationDataDto extends UniEntity {
    public ExternalId: string;
    public IntegrationKey: string;
}


export class CurrencyRateData extends UniEntity {
    public IsOverrideRate: boolean;
    public ExchangeRate: number;
    public Factor: number;
    public ExchangeRateOld: number;
    public FromCurrencyCode: CurrencyCode;
}


export class EmailDTO extends UniEntity {
    public ReportID: number;
    public FromAddress: string;
    public Message: string;
    public Format: string;
    public CopyAddress: string;
    public Subject: string;
    public Parameters: Array<ReportParameter>;
}


export class ReportParameter extends UniEntity {
    public Name: string;
    public Value: string;
}


export class DistributionPlanElementValidation extends UniEntity {
    public IsValid: boolean;
    public Priority: number;
    public ElementTypeName: string;
    public ElementType: DistributionPlanElementTypes;
    public PlanElement: DistributionPlanElement;
}


export class SendEmail extends UniEntity {
    public ReportID: number;
    public FromAddress: string;
    public EntityType: string;
    public Message: string;
    public ReportName: string;
    public Localization: string;
    public CopyAddress: string;
    public Subject: string;
    public EntityID: number;
    public ExternalReference: string;
    public Attachments: Array<SendEmailAttachment>;
    public Parameters: Array<ReportParameter>;
}


export class SendEmailAttachment extends UniEntity {
    public Attachment: string;
    public FileID: number;
    public FileName: string;
}


export class RssList extends UniEntity {
    public Url: string;
    public Title: string;
    public Description: string;
    public Items: Array<RssItem>;
}


export class RssItem extends UniEntity {
    public Guid: string;
    public Title: string;
    public Description: string;
    public Category: string;
    public PubDate: string;
    public Link: string;
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
    public Status: StatusCodeSharing;
    public SharingId: number;
}


export class TeamReport extends UniEntity {
    public ToDate: LocalDate;
    public FromDate: LocalDate;
    public Team: Team;
    public Members: Array<MemberDetails>;
}


export class MemberDetails extends UniEntity {
    public ExpectedMinutes: number;
    public Name: string;
    public MinutesWorked: number;
    public TotalBalance: number;
    public ReportBalance: number;
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
    public orgno: string;
    public contactname: string;
    public contactemail: string;
    public orgname: string;
}


export class ServiceMetadataDto extends UniEntity {
    public ServiceName: string;
    public SupportEmail: string;
}


export class AccountUsageReference extends UniEntity {
    public Entity: string;
    public EntityID: number;
    public Info: string;
}


export class MandatoryDimensionAccountReport extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'MandatoryDimensionAccountReport';

    public DimensionsID: number;
    public Deleted: boolean;
    public StatusCode: number;
    public CreatedBy: string;
    public AccountID: number;
    public MissingRequiredDimensionsMessage: string;
    public AccountNumber: string;
    public journalEntryLineDraftID: number;
    public ID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public MissingOnlyWarningsDimensionsMessage: string;
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
    public GroupName: string;
    public LastDepreciation: LocalDate;
    public GroupCode: string;
    public CurrentValue: number;
    public BalanceAccountNumber: number;
    public Name: string;
    public Lifetime: number;
    public Number: number;
    public DepreciationAccountNumber: number;
    public BalanceAccountName: string;
    public Lines: Array<AssetReportLineDTO>;
}


export class AssetReportLineDTO extends UniEntity {
    public Date: LocalDate;
    public TypeID: number;
    public Value: number;
    public Type: string;
}


export class BankData extends UniEntity {
    public IBAN: string;
    public AccountNumber: string;
    public Bank: Bank;
}


export class CreateBankIntegrationDTO extends UniEntity {
    public UserName: string;
    public TuserName: string;
    public IsBankBalance: boolean;
    public Phone: string;
    public BankApproval: boolean;
    public Bank: string;
    public IsInbound: boolean;
    public BankAccountID: number;
    public IsOutgoing: boolean;
    public ServiceProvider: number;
    public IsBankStatement: boolean;
    public DisplayName: string;
    public BankAcceptance: boolean;
    public RequireTwoStage: boolean;
    public Password: string;
    public Email: string;
    public BankAccounts: Array<BankAccountDTO>;
}


export class BankAccountDTO extends UniEntity {
    public IsBankBalance: boolean;
    public BBAN: string;
    public IsInbound: boolean;
    public IsOutgoing: boolean;
    public IBAN: string;
    public Bic: string;
    public IsBankStatement: boolean;
}


export class ZdataUpdateBankProperties extends UniEntity {
    public IsBankBalance: boolean;
    public IsInbound: boolean;
    public IsOutgoing: boolean;
    public IsBankStatement: boolean;
    public ServiceID: string;
    public Password: string;
}


export class AutobankUserDTO extends UniEntity {
    public UserID: number;
    public Phone: string;
    public IsAdmin: boolean;
    public Password: string;
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
    public Group: string;
    public BankStatementEntryID: number;
    public JournalEntryLineID: number;
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
    public MaxDelta: number;
    public MaxDayOffset: number;
}


export class ReconciliationStatus extends UniEntity {
    public IsReconciled: boolean;
    public TotalUnreconciled: number;
    public Todate: Date;
    public AccountID: number;
    public FromDate: Date;
    public TotalAmount: number;
    public NumberOfUnReconciled: number;
    public NumberOfItems: number;
}


export class BalanceDto extends UniEntity {
    public BalanceInStatement: number;
    public Balance: number;
    public StartDate: Date;
    public EndDate: Date;
}


export class BankfileFormat extends UniEntity {
    public LinePrefix: string;
    public FileExtension: string;
    public IsFixed: boolean;
    public CustomFormat: BankFileCustomFormat;
    public IsXml: boolean;
    public Name: string;
    public Separator: string;
    public SkipRows: number;
    public Columns: Array<BankfileColumn>;
}


export class BankfileColumn extends UniEntity {
    public StartPos: number;
    public Length: number;
    public DataType: BankfileDataType;
    public IsFallBack: boolean;
    public FieldMapping: BankfileField;
}


export class JournalSuggestion extends UniEntity {
    public MatchWithEntryID: number;
    public BankStatementRuleID: number;
    public Amount: number;
    public FinancialDate: LocalDate;
    public AccountID: number;
    public Description: string;
    public Account: Account;
}


export class ReportRow extends UniEntity {
    public SumLastYear: number;
    public Period8: number;
    public BudPeriod6: number;
    public Period3: number;
    public Period7: number;
    public BudPeriod7: number;
    public Period9: number;
    public BudPeriod4: number;
    public GroupName: string;
    public Period11: number;
    public BudPeriod12: number;
    public PrecedingBalance: number;
    public Period6: number;
    public AccountName: string;
    public GroupNumber: number;
    public IsSubTotal: boolean;
    public Period12: number;
    public SubGroupName: string;
    public AccountYear: number;
    public BudPeriod11: number;
    public BudPeriod8: number;
    public BudgetSum: number;
    public Period10: number;
    public SumPeriodLastYearAccumulated: number;
    public BudPeriod9: number;
    public SumPeriodLastYear: number;
    public BudPeriod5: number;
    public AccountNumber: number;
    public BudPeriod2: number;
    public Sum: number;
    public ID: number;
    public Period2: number;
    public SumPeriod: number;
    public Period4: number;
    public SubGroupNumber: number;
    public BudPeriod3: number;
    public SumPeriodAccumulated: number;
    public Period1: number;
    public BudgetAccumulated: number;
    public Period5: number;
    public BudPeriod1: number;
    public BudPeriod10: number;
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
    public CustomPayments: number;
    public Supplier: number;
    public VAT: number;
    public Custumer: number;
    public Liquidity: number;
    public Sum: number;
}


export class JournalEntryData extends UniEntity {
    public CurrencyID: number;
    public VatDate: LocalDate;
    public AmountCurrency: number;
    public JournalEntryNo: string;
    public InvoiceNumber: string;
    public DebitAccountNumber: number;
    public NumberSeriesTaskID: number;
    public StatusCode: number;
    public DebitAccountID: number;
    public Amount: number;
    public PaymentID: string;
    public SupplierInvoiceNo: string;
    public FinancialDate: LocalDate;
    public CreditAccountNumber: number;
    public DebitVatTypeID: number;
    public PostPostJournalEntryLineID: number;
    public CurrencyExchangeRate: number;
    public VatDeductionPercent: number;
    public CustomerInvoiceID: number;
    public CustomerOrderID: number;
    public DueDate: LocalDate;
    public Description: string;
    public NumberSeriesID: number;
    public JournalEntryID: number;
    public CreditAccountID: number;
    public SupplierInvoiceID: number;
    public CreditVatTypeID: number;
    public JournalEntryDataAccrualID: number;
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
    public PeriodSumYear1: number;
    public PeriodSumYear2: number;
    public PeriodNo: number;
}


export class JournalEntryLineRequestSummary extends UniEntity {
    public SumTaxBasisAmount: number;
    public SumDebit: number;
    public SumBalance: number;
    public SumLedger: number;
    public SumCredit: number;
}


export class JournalEntryLinePostPostData extends UniEntity {
    public MarkedAgainstJournalEntryNumber: string;
    public AmountCurrency: number;
    public InvoiceNumber: string;
    public SubAccountName: string;
    public StatusCode: number;
    public CurrencyCodeCode: string;
    public NumberOfPayments: number;
    public SubAccountNumber: number;
    public JournalEntryNumber: string;
    public CurrencyCodeID: number;
    public SumPostPostAmountCurrency: number;
    public Amount: number;
    public PaymentID: string;
    public FinancialDate: Date;
    public AccountYear: number;
    public CurrencyExchangeRate: number;
    public MarkedAgainstJournalEntryLineID: number;
    public JournalEntryTypeName: string;
    public RestAmount: number;
    public RestAmountCurrency: number;
    public DueDate: Date;
    public Description: string;
    public SumPostPostAmount: number;
    public JournalEntryID: number;
    public ID: number;
    public CurrencyCodeShortCode: string;
    public JournalEntryNumberNumeric: number;
    public PeriodNo: number;
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
    public AmountCurrency: number;
    public InvoiceNumber: string;
    public StatusCode: StatusCodeJournalEntryLine;
    public JournalEntryNumber: string;
    public Amount: number;
    public FinancialDate: Date;
    public RestAmount: number;
    public RestAmountCurrency: number;
    public OriginalStatusCode: StatusCodeJournalEntryLine;
    public ID: number;
    public OriginalRestAmount: number;
    public Markings: Array<MarkingReference>;
}


export class MarkingReference extends UniEntity {
    public JournalEntryNumber: string;
    public ID: number;
}


export class SupplierInvoiceDetail extends UniEntity {
    public AmountCurrency: number;
    public VatPercent: number;
    public InvoiceDate: Date;
    public VatCode: string;
    public InvoiceNumber: string;
    public VatTypeID: number;
    public SupplierID: number;
    public AccountName: string;
    public Amount: number;
    public AccountID: number;
    public Description: string;
    public AccountNumber: number;
    public VatTypeName: string;
    public DeliveryDate: Date;
    public SupplierInvoiceID: number;
}


export class VatReportMessage extends UniEntity {
    public Message: string;
    public Level: ValidationLevel;
}


export class VatReportSummary extends UniEntity {
    public IsHistoricData: boolean;
    public SumVatAmount: number;
    public HasTaxAmount: boolean;
    public SumTaxBasisAmount: number;
    public NumberOfJournalEntryLines: number;
    public VatCodeGroupName: string;
    public VatCodeGroupNo: string;
    public VatCodeGroupID: number;
    public HasTaxBasis: boolean;
}


export class VatReportSummaryPerPost extends UniEntity {
    public IsHistoricData: boolean;
    public VatPostName: string;
    public VatPostNo: string;
    public VatPostID: number;
    public SumVatAmount: number;
    public HasTaxAmount: boolean;
    public SumTaxBasisAmount: number;
    public VatPostReportAsNegativeAmount: boolean;
    public NumberOfJournalEntryLines: number;
    public VatCodeGroupName: string;
    public VatCodeGroupNo: string;
    public VatCodeGroupID: number;
    public HasTaxBasis: boolean;
}


export class VatReportSummaryPerPostPerAccount extends UniEntity {
    public StdVatCode: string;
    public IsHistoricData: boolean;
    public VatJournalEntryPostAccountID: number;
    public VatPostName: string;
    public VatDate: Date;
    public VatPostNo: string;
    public VatCode: string;
    public VatPostID: number;
    public SumVatAmount: number;
    public HasTaxAmount: boolean;
    public VatJournalEntryPostAccountNumber: number;
    public SumTaxBasisAmount: number;
    public VatPostReportAsNegativeAmount: boolean;
    public JournalEntryNumber: string;
    public Amount: number;
    public FinancialDate: Date;
    public NumberOfJournalEntryLines: number;
    public VatCodeGroupName: string;
    public VatCodeGroupNo: string;
    public Description: string;
    public VatJournalEntryPostAccountName: string;
    public VatAccountID: number;
    public TaxBasisAmount: number;
    public VatCodeGroupID: number;
    public VatAccountName: string;
    public VatAccountNumber: number;
    public HasTaxBasis: boolean;
}


export class VatReportNotReportedJournalEntryData extends UniEntity {
    public SumVatAmount: number;
    public SumTaxBasisAmount: number;
    public TerminPeriodID: number;
    public NumberOfJournalEntryLines: number;
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
    public PercentWeight: number;
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


export enum CompanySalaryPaymentInterval{
    Monthly = 0,
    Pr14Days = 1,
    Weekly = 2,
}


export enum WageDeductionDueToHolidayType{
    Deduct4PartsOf26 = 0,
    Deduct3PartsOf22 = 1,
    Add1PartOf26 = 2,
    Deduct1PartOf26 = 3,
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


export enum ShipRegistry{
    notSet = 0,
    NorwegianInternationalShipRegister = 1,
    NorwegianOrdinaryShipRegister = 2,
    ForeignShipRegister = 3,
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


export enum ShipTypeOfShip{
    notSet = 0,
    Other = 1,
    DrillingPlatform = 2,
    Tourist = 3,
}


export enum WorkingHoursScheme{
    notSet = 0,
    NonShift = 1,
    OffshoreWork = 2,
    ContinousShiftwork336 = 3,
    DayAndNightContinous355 = 4,
    ShiftWork = 5,
}


export enum ShipTradeArea{
    notSet = 0,
    Domestic = 1,
    Foreign = 2,
}


export enum EmploymentType{
    notSet = 0,
    Permanent = 1,
    Temporary = 2,
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


export enum linestate{
    Received = 0,
    Processed = 1,
    Rejected = 3,
}


export enum costtype{
    Travel = 0,
    Expense = 1,
}


export enum RateTypeColumn{
    none = 0,
    Employment = 1,
    Employee = 2,
    Salary_scale = 3,
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


export enum SpecialAgaRule{
    Regular = 0,
    AgaRefund = 1,
    AgaPension = 2,
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


export enum GetRateFrom{
    WageType = 0,
    MonthlyPayEmployee = 1,
    HourlyPayEmployee = 2,
    FreeRateEmployee = 3,
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


export enum ReconcileInterval{
    year = 0,
    month = 1,
    term = 2,
    quarter = 3,
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
