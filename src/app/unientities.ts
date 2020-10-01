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

    public CreatedAt: Date;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public EntityID: number;
    public Deleted: boolean;
    public Action: string;
    public OldValue: string;
    public EntityType: string;
    public Transaction: string;
    public UpdatedBy: string;
    public ID: number;
    public Field: string;
    public ClientID: string;
    public Route: string;
    public Verb: string;
    public NewValue: string;
    public _createguid: string;
    public CustomFields: any;
}


export class WorkBalance extends UniEntity {
    public static RelativeUrl = 'workbalances';
    public static EntityType = 'WorkBalance';

    public ValidTimeOff: number;
    public IsStartBalance: boolean;
    public CreatedAt: Date;
    public CreatedBy: string;
    public ExpectedMinutes: number;
    public UpdatedAt: Date;
    public BalanceDate: Date;
    public Days: number;
    public Balancetype: WorkBalanceTypeEnum;
    public Deleted: boolean;
    public BalanceFrom: Date;
    public ActualMinutes: number;
    public ValidFrom: Date;
    public WorkRelationID: number;
    public UpdatedBy: string;
    public ID: number;
    public Minutes: number;
    public Description: string;
    public StatusCode: number;
    public _createguid: string;
    public CustomFields: any;
}


export class Worker extends UniEntity {
    public static RelativeUrl = 'workers';
    public static EntityType = 'Worker';

    public CreatedAt: Date;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public BusinessRelationID: number;
    public Deleted: boolean;
    public UpdatedBy: string;
    public EmployeeID: number;
    public ID: number;
    public StatusCode: number;
    public UserID: number;
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
    public WorkItemGroupID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public StartTime: Date;
    public Invoiceable: boolean;
    public TransferedToOrder: boolean;
    public MinutesToOrder: number;
    public Deleted: boolean;
    public EndTime: Date;
    public TransferedToPayroll: boolean;
    public WorkTypeID: number;
    public PayrollTrackingID: number;
    public WorkRelationID: number;
    public CustomerID: number;
    public UpdatedBy: string;
    public ID: number;
    public Label: string;
    public Minutes: number;
    public PriceExVat: number;
    public OrderItemId: number;
    public DimensionsID: number;
    public Description: string;
    public CustomerOrderID: number;
    public StatusCode: number;
    public LunchInMinutes: number;
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

    public CreatedAt: Date;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public WorkRelationID: number;
    public UpdatedBy: string;
    public ID: number;
    public StatusCode: number;
    public _createguid: string;
    public WorkRelation: WorkRelation;
    public Items: Array<WorkItem>;
    public CustomFields: any;
}


export class WorkProfile extends UniEntity {
    public static RelativeUrl = 'workprofiles';
    public static EntityType = 'WorkProfile';

    public MinutesPerMonth: number;
    public CreatedAt: Date;
    public LunchIncluded: boolean;
    public Name: string;
    public MinutesPerWeek: number;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public IsShared: boolean;
    public MinutesPerYear: number;
    public StatusCode: number;
    public _createguid: string;
    public CustomFields: any;
}


export class WorkRelation extends UniEntity {
    public static RelativeUrl = 'workrelations';
    public static EntityType = 'WorkRelation';

    public CreatedAt: Date;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public CompanyName: string;
    public Deleted: boolean;
    public EndTime: Date;
    public IsPrivate: boolean;
    public CompanyID: number;
    public StartDate: Date;
    public UpdatedBy: string;
    public ID: number;
    public WorkPercentage: number;
    public IsActive: boolean;
    public WorkProfileID: number;
    public Description: string;
    public StatusCode: number;
    public TeamID: number;
    public WorkerID: number;
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

    public CreatedAt: Date;
    public CreatedBy: string;
    public FromDate: Date;
    public UpdatedAt: Date;
    public TimeoffType: number;
    public Deleted: boolean;
    public SystemKey: string;
    public ToDate: Date;
    public RegionKey: string;
    public WorkRelationID: number;
    public UpdatedBy: string;
    public ID: number;
    public Description: string;
    public IsHalfDay: boolean;
    public StatusCode: number;
    public _createguid: string;
    public CustomFields: any;
}


export class WorkType extends UniEntity {
    public static RelativeUrl = 'worktypes';
    public static EntityType = 'WorkType';

    public Price: number;
    public CreatedAt: Date;
    public WagetypeNumber: number;
    public SystemType: WorkTypeEnum;
    public Name: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public ProductID: number;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public Description: string;
    public StatusCode: number;
    public _createguid: string;
    public Product: Product;
    public CustomFields: any;
}


export class BankFile extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'BankFile';

    public CreatedAt: Date;
    public SubCompanyID: number;
    public CreatedBy: string;
    public FileID: number;
    public UpdatedAt: Date;
    public ParentFileid: number;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public Accountnumber: string;
    public StatusCode: number;
    public _createguid: string;
    public File: File;
    public SubCompany: SubCompany;
    public CustomFields: any;
}


export class BatchInvoice extends UniEntity {
    public static RelativeUrl = 'batchinvoices';
    public static EntityType = 'BatchInvoice';

    public CreatedAt: Date;
    public OurRef: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public YourRef: string;
    public MinAmount: number;
    public Processed: number;
    public Deleted: boolean;
    public TotalToProcess: number;
    public Comment: string;
    public UpdatedBy: string;
    public ID: number;
    public FreeTxt: string;
    public SellerID: number;
    public DueDate: LocalDate;
    public NumberOfBatches: number;
    public StatusCode: number;
    public Operation: BatchInvoiceOperation;
    public NotifyEmail: boolean;
    public InvoiceDate: LocalDate;
    public ProjectID: number;
    public CustomerID: number;
    public _createguid: string;
    public Items: Array<BatchInvoiceItem>;
    public CustomFields: any;
}


export class BatchInvoiceItem extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'BatchInvoiceItem';

    public CreatedAt: Date;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public BatchNumber: number;
    public BatchInvoiceID: number;
    public Deleted: boolean;
    public CustomerInvoiceID: number;
    public UpdatedBy: string;
    public ID: number;
    public CustomerOrderID: number;
    public StatusCode: StatusCode;
    public CommentID: number;
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

    public CreatedAt: Date;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public EntityName: string;
    public UpdatedBy: string;
    public ID: number;
    public StatusCode: number;
    public Template: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Customer extends UniEntity {
    public static RelativeUrl = 'customers';
    public static EntityType = 'Customer';

    public CustomerNumberKidAlias: string;
    public CreatedAt: Date;
    public AcceptableDelta4CustomerPaymentAccountID: number;
    public CreditDays: number;
    public CreatedBy: string;
    public PeppolAddress: string;
    public SubAccountNumberSeriesID: number;
    public UpdatedAt: Date;
    public Localization: string;
    public CustomerNumber: number;
    public DefaultDistributionsID: number;
    public OrgNumber: string;
    public BusinessRelationID: number;
    public CustomerInvoiceReminderSettingsID: number;
    public DefaultCustomerQuoteReportID: number;
    public ReminderEmailAddress: string;
    public Deleted: boolean;
    public AcceptableDelta4CustomerPayment: number;
    public DefaultCustomerInvoiceReportID: number;
    public IsPrivate: boolean;
    public DefaultCustomerOrderReportID: number;
    public PaymentTermsID: number;
    public DefaultSellerID: number;
    public AvtaleGiroNotification: boolean;
    public WebUrl: string;
    public EfakturaIdentifier: string;
    public CurrencyCodeID: number;
    public UpdatedBy: string;
    public GLN: string;
    public ID: number;
    public SocialSecurityNumber: string;
    public DeliveryTermsID: number;
    public DimensionsID: number;
    public FactoringNumber: number;
    public StatusCode: number;
    public AvtaleGiro: boolean;
    public DontSendReminders: boolean;
    public EInvoiceAgreementReference: string;
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

    public InternalNote: string;
    public CustomerOrgNumber: string;
    public PaymentDueDate: LocalDate;
    public ExternalReference: string;
    public CreatedAt: Date;
    public DeliveryTerm: string;
    public PaymentID: string;
    public Credited: boolean;
    public InvoiceNumberSeriesID: number;
    public InvoiceAddressLine3: string;
    public CreditedAmount: number;
    public InvoiceCountryCode: string;
    public CreditDays: number;
    public TaxExclusiveAmountCurrency: number;
    public InvoicePostalCode: string;
    public YourReference: string;
    public Payment: string;
    public CreatedBy: string;
    public JournalEntryID: number;
    public CustomerPerson: string;
    public CollectorStatusCode: number;
    public InvoiceReceiverName: string;
    public UpdatedAt: Date;
    public DistributionPlanID: number;
    public InvoiceReferenceID: number;
    public ExternalStatus: number;
    public CurrencyExchangeRate: number;
    public UseReportID: number;
    public PayableRoundingAmount: number;
    public DeliveryName: string;
    public TaxInclusiveAmountCurrency: number;
    public AccrualID: number;
    public ShippingCountryCode: string;
    public TaxInclusiveAmount: number;
    public RestAmountCurrency: number;
    public Deleted: boolean;
    public DeliveryDate: LocalDate;
    public RestAmount: number;
    public PaymentTerm: string;
    public AmountRegards: string;
    public ShippingCountry: string;
    public InvoiceAddressLine1: string;
    public DeliveryMethod: string;
    public InvoiceCity: string;
    public SupplierOrgNumber: string;
    public EmailAddress: string;
    public InvoiceType: number;
    public PaymentTermsID: number;
    public DefaultSellerID: number;
    public Comment: string;
    public InvoiceCountry: string;
    public TaxExclusiveAmount: number;
    public UpdateCurrencyAmountsOnDateChange: boolean;
    public SalesPerson: string;
    public VatTotalsAmountCurrency: number;
    public ShippingAddressLine2: string;
    public CustomerID: number;
    public CreditedAmountCurrency: number;
    public CurrencyCodeID: number;
    public UpdatedBy: string;
    public PaymentInformation: string;
    public ID: number;
    public FreeTxt: string;
    public ShippingPostalCode: string;
    public ShippingAddressLine3: string;
    public ShippingCity: string;
    public OurReference: string;
    public DeliveryTermsID: number;
    public InvoiceNumber: string;
    public StatusCode: number;
    public PayableRoundingCurrencyAmount: number;
    public PaymentInfoTypeID: number;
    public InvoiceAddressLine2: string;
    public DontSendReminders: boolean;
    public CustomerName: string;
    public Requisition: string;
    public InvoiceDate: LocalDate;
    public ShippingAddressLine1: string;
    public BankAccountID: number;
    public PrintStatus: number;
    public VatTotalsAmount: number;
    public DefaultDimensionsID: number;
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

    public CreatedAt: Date;
    public SumTotalExVatCurrency: number;
    public DiscountCurrency: number;
    public Unit: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public ProductID: number;
    public CurrencyExchangeRate: number;
    public DiscountPercent: number;
    public PriceIncVat: number;
    public SumTotalIncVat: number;
    public Deleted: boolean;
    public SumVat: number;
    public VatPercent: number;
    public SumTotalExVat: number;
    public InvoicePeriodStartDate: LocalDate;
    public Discount: number;
    public CalculateGrossPriceBasedOnNetPrice: boolean;
    public Comment: string;
    public SumTotalIncVatCurrency: number;
    public PriceExVatCurrency: number;
    public NumberOfItems: number;
    public SumVatCurrency: number;
    public VatTypeID: number;
    public CustomerInvoiceID: number;
    public CurrencyCodeID: number;
    public UpdatedBy: string;
    public ID: number;
    public AccountingCost: string;
    public AccountID: number;
    public SortIndex: number;
    public CostPrice: number;
    public PriceExVat: number;
    public ItemText: string;
    public DimensionsID: number;
    public StatusCode: number;
    public InvoicePeriodEndDate: LocalDate;
    public PriceSetByUser: boolean;
    public ItemSourceID: number;
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

    public CreatedAt: Date;
    public ReminderFeeCurrency: number;
    public DebtCollectionFeeCurrency: number;
    public InterestFee: number;
    public ReminderNumber: number;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public InterestFeeCurrency: number;
    public CreatedByReminderRuleID: number;
    public CurrencyExchangeRate: number;
    public RestAmountCurrency: number;
    public Deleted: boolean;
    public RestAmount: number;
    public EmailAddress: string;
    public Title: string;
    public RemindedDate: LocalDate;
    public Notified: boolean;
    public CustomerInvoiceID: number;
    public CurrencyCodeID: number;
    public UpdatedBy: string;
    public ID: number;
    public DebtCollectionFee: number;
    public ReminderFee: number;
    public DueDate: LocalDate;
    public RunNumber: number;
    public DimensionsID: number;
    public Description: string;
    public StatusCode: number;
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

    public CreatedAt: Date;
    public CreditDays: number;
    public ReminderNumber: number;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public UseMaximumLegalReminderFee: boolean;
    public CustomerInvoiceReminderSettingsID: number;
    public Deleted: boolean;
    public Title: string;
    public MinimumDaysFromDueDate: number;
    public UpdatedBy: string;
    public ID: number;
    public ReminderFee: number;
    public Description: string;
    public StatusCode: number;
    public _createguid: string;
    public CustomerInvoiceReminderSettings: CustomerInvoiceReminderSettings;
    public CustomFields: any;
}


export class CustomerInvoiceReminderSettings extends UniEntity {
    public static RelativeUrl = 'invoiceremindersettings';
    public static EntityType = 'CustomerInvoiceReminderSettings';

    public CreatedAt: Date;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public AcceptPaymentWithoutReminderFee: boolean;
    public Deleted: boolean;
    public DefaultReminderFeeAccountID: number;
    public RemindersBeforeDebtCollection: number;
    public MinimumAmountToRemind: number;
    public UpdatedBy: string;
    public ID: number;
    public DebtCollectionSettingsID: number;
    public StatusCode: number;
    public _createguid: string;
    public DebtCollectionSettings: DebtCollectionSettings;
    public DefaultReminderFeeAccount: Account;
    public CustomerInvoiceReminderRules: Array<CustomerInvoiceReminderRule>;
    public CustomFields: any;
}


export class CustomerOrder extends UniEntity {
    public static RelativeUrl = 'orders';
    public static EntityType = 'CustomerOrder';

    public InternalNote: string;
    public CustomerOrgNumber: string;
    public UpdateCurrencyOnToInvoice: boolean;
    public CreatedAt: Date;
    public DeliveryTerm: string;
    public InvoiceAddressLine3: string;
    public InvoiceCountryCode: string;
    public CreditDays: number;
    public TaxExclusiveAmountCurrency: number;
    public InvoicePostalCode: string;
    public YourReference: string;
    public CreatedBy: string;
    public CustomerPerson: string;
    public InvoiceReceiverName: string;
    public UpdatedAt: Date;
    public ReadyToInvoice: boolean;
    public DistributionPlanID: number;
    public OrderDate: LocalDate;
    public CurrencyExchangeRate: number;
    public UseReportID: number;
    public PayableRoundingAmount: number;
    public DeliveryName: string;
    public TaxInclusiveAmountCurrency: number;
    public AccrualID: number;
    public ShippingCountryCode: string;
    public TaxInclusiveAmount: number;
    public RestAmountCurrency: number;
    public Deleted: boolean;
    public DeliveryDate: LocalDate;
    public PaymentTerm: string;
    public ShippingCountry: string;
    public InvoiceAddressLine1: string;
    public DeliveryMethod: string;
    public OrderNumberSeriesID: number;
    public InvoiceCity: string;
    public SupplierOrgNumber: string;
    public EmailAddress: string;
    public PaymentTermsID: number;
    public DefaultSellerID: number;
    public Comment: string;
    public InvoiceCountry: string;
    public TaxExclusiveAmount: number;
    public UpdateCurrencyAmountsOnDateChange: boolean;
    public RestExclusiveAmountCurrency: number;
    public SalesPerson: string;
    public VatTotalsAmountCurrency: number;
    public ShippingAddressLine2: string;
    public CustomerID: number;
    public CurrencyCodeID: number;
    public UpdatedBy: string;
    public ID: number;
    public FreeTxt: string;
    public ShippingPostalCode: string;
    public ShippingAddressLine3: string;
    public ShippingCity: string;
    public OurReference: string;
    public DeliveryTermsID: number;
    public StatusCode: number;
    public PayableRoundingCurrencyAmount: number;
    public PaymentInfoTypeID: number;
    public InvoiceAddressLine2: string;
    public CustomerName: string;
    public Requisition: string;
    public ShippingAddressLine1: string;
    public PrintStatus: number;
    public VatTotalsAmount: number;
    public OrderNumber: number;
    public DefaultDimensionsID: number;
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

    public CreatedAt: Date;
    public SumTotalExVatCurrency: number;
    public DiscountCurrency: number;
    public Unit: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public ReadyToInvoice: boolean;
    public ProductID: number;
    public CurrencyExchangeRate: number;
    public DiscountPercent: number;
    public PriceIncVat: number;
    public SumTotalIncVat: number;
    public Deleted: boolean;
    public SumVat: number;
    public VatPercent: number;
    public SumTotalExVat: number;
    public Discount: number;
    public CalculateGrossPriceBasedOnNetPrice: boolean;
    public Comment: string;
    public SumTotalIncVatCurrency: number;
    public PriceExVatCurrency: number;
    public NumberOfItems: number;
    public SumVatCurrency: number;
    public VatTypeID: number;
    public CurrencyCodeID: number;
    public UpdatedBy: string;
    public ID: number;
    public AccountID: number;
    public SortIndex: number;
    public CostPrice: number;
    public PriceExVat: number;
    public ItemText: string;
    public DimensionsID: number;
    public CustomerOrderID: number;
    public StatusCode: number;
    public PriceSetByUser: boolean;
    public ItemSourceID: number;
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

    public InternalNote: string;
    public CustomerOrgNumber: string;
    public UpdateCurrencyOnToInvoice: boolean;
    public CreatedAt: Date;
    public DeliveryTerm: string;
    public InvoiceAddressLine3: string;
    public InquiryReference: number;
    public InvoiceCountryCode: string;
    public UpdateCurrencyOnToOrder: boolean;
    public CreditDays: number;
    public TaxExclusiveAmountCurrency: number;
    public InvoicePostalCode: string;
    public YourReference: string;
    public CreatedBy: string;
    public CustomerPerson: string;
    public InvoiceReceiverName: string;
    public UpdatedAt: Date;
    public DistributionPlanID: number;
    public QuoteNumberSeriesID: number;
    public CurrencyExchangeRate: number;
    public UseReportID: number;
    public PayableRoundingAmount: number;
    public DeliveryName: string;
    public TaxInclusiveAmountCurrency: number;
    public ShippingCountryCode: string;
    public TaxInclusiveAmount: number;
    public Deleted: boolean;
    public DeliveryDate: LocalDate;
    public PaymentTerm: string;
    public ShippingCountry: string;
    public InvoiceAddressLine1: string;
    public DeliveryMethod: string;
    public InvoiceCity: string;
    public SupplierOrgNumber: string;
    public EmailAddress: string;
    public PaymentTermsID: number;
    public DefaultSellerID: number;
    public Comment: string;
    public InvoiceCountry: string;
    public QuoteNumber: number;
    public TaxExclusiveAmount: number;
    public ValidUntilDate: LocalDate;
    public UpdateCurrencyAmountsOnDateChange: boolean;
    public SalesPerson: string;
    public VatTotalsAmountCurrency: number;
    public ShippingAddressLine2: string;
    public CustomerID: number;
    public CurrencyCodeID: number;
    public UpdatedBy: string;
    public QuoteDate: LocalDate;
    public ID: number;
    public FreeTxt: string;
    public ShippingPostalCode: string;
    public ShippingAddressLine3: string;
    public ShippingCity: string;
    public OurReference: string;
    public DeliveryTermsID: number;
    public StatusCode: number;
    public PayableRoundingCurrencyAmount: number;
    public PaymentInfoTypeID: number;
    public InvoiceAddressLine2: string;
    public CustomerName: string;
    public Requisition: string;
    public ShippingAddressLine1: string;
    public PrintStatus: number;
    public VatTotalsAmount: number;
    public DefaultDimensionsID: number;
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

    public CreatedAt: Date;
    public SumTotalExVatCurrency: number;
    public DiscountCurrency: number;
    public Unit: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public ProductID: number;
    public CurrencyExchangeRate: number;
    public DiscountPercent: number;
    public PriceIncVat: number;
    public CustomerQuoteID: number;
    public SumTotalIncVat: number;
    public Deleted: boolean;
    public SumVat: number;
    public VatPercent: number;
    public SumTotalExVat: number;
    public Discount: number;
    public CalculateGrossPriceBasedOnNetPrice: boolean;
    public Comment: string;
    public SumTotalIncVatCurrency: number;
    public PriceExVatCurrency: number;
    public NumberOfItems: number;
    public SumVatCurrency: number;
    public VatTypeID: number;
    public CurrencyCodeID: number;
    public UpdatedBy: string;
    public ID: number;
    public AccountID: number;
    public SortIndex: number;
    public CostPrice: number;
    public PriceExVat: number;
    public ItemText: string;
    public DimensionsID: number;
    public StatusCode: number;
    public PriceSetByUser: boolean;
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

    public CreatedAt: Date;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public CreditorNumber: number;
    public CustomerInvoiceReminderSettingsID: number;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public IntegrateWithDebtCollection: boolean;
    public StatusCode: number;
    public DebtCollectionAutomationID: number;
    public DebtCollectionFormat: number;
    public _createguid: string;
    public DebtCollectionAutomation: Array<DebtCollectionAutomation>;
    public CustomerInvoiceReminderSettings: CustomerInvoiceReminderSettings;
    public CustomFields: any;
}


export class ItemSource extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ItemSource';

    public CreatedAt: Date;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public StatusCode: number;
    public _createguid: string;
    public Details: Array<ItemSourceDetail>;
    public CustomFields: any;
}


export class ItemSourceDetail extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ItemSourceDetail';

    public SourceFK: number;
    public CreatedAt: Date;
    public Amount: number;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public Tag: string;
    public SourceType: string;
    public Description: string;
    public StatusCode: number;
    public ItemSourceID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class PaymentInfoType extends UniEntity {
    public static RelativeUrl = 'paymentinfotype';
    public static EntityType = 'PaymentInfoType';

    public CreatedAt: Date;
    public Name: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Locked: boolean;
    public Deleted: boolean;
    public Control: Modulus;
    public Type: PaymentInfoTypeEnum;
    public UpdatedBy: string;
    public ID: number;
    public Length: number;
    public StatusCode: number;
    public _createguid: string;
    public PaymentInfoTypeParts: Array<PaymentInfoTypePart>;
    public CustomFields: any;
}


export class PaymentInfoTypePart extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'PaymentInfoTypePart';

    public CreatedAt: Date;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public SortIndex: number;
    public Part: string;
    public Length: number;
    public StatusCode: number;
    public PaymentInfoTypeID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class RecurringInvoice extends UniEntity {
    public static RelativeUrl = 'recurringinvoices';
    public static EntityType = 'RecurringInvoice';

    public NextInvoiceDate: LocalDate;
    public InternalNote: string;
    public CustomerOrgNumber: string;
    public CreatedAt: Date;
    public DeliveryTerm: string;
    public InvoiceNumberSeriesID: number;
    public InvoiceAddressLine3: string;
    public Interval: number;
    public InvoiceCountryCode: string;
    public CreditDays: number;
    public NoCreditDays: boolean;
    public TaxExclusiveAmountCurrency: number;
    public InvoicePostalCode: string;
    public YourReference: string;
    public Payment: string;
    public CreatedBy: string;
    public CustomerPerson: string;
    public InvoiceReceiverName: string;
    public UpdatedAt: Date;
    public DistributionPlanID: number;
    public EndDate: LocalDate;
    public CurrencyExchangeRate: number;
    public UseReportID: number;
    public PayableRoundingAmount: number;
    public DeliveryName: string;
    public PreparationDays: number;
    public TaxInclusiveAmountCurrency: number;
    public ShippingCountryCode: string;
    public TaxInclusiveAmount: number;
    public Deleted: boolean;
    public DeliveryDate: LocalDate;
    public PaymentTerm: string;
    public AmountRegards: string;
    public ShippingCountry: string;
    public InvoiceAddressLine1: string;
    public DeliveryMethod: string;
    public InvoiceCity: string;
    public SupplierOrgNumber: string;
    public EmailAddress: string;
    public PaymentTermsID: number;
    public TimePeriod: RecurringPeriod;
    public DefaultSellerID: number;
    public Comment: string;
    public InvoiceCountry: string;
    public TaxExclusiveAmount: number;
    public UpdateCurrencyAmountsOnDateChange: boolean;
    public StartDate: LocalDate;
    public SalesPerson: string;
    public VatTotalsAmountCurrency: number;
    public NotifyWhenOrdersArePrepared: boolean;
    public ShippingAddressLine2: string;
    public CustomerID: number;
    public MaxIterations: number;
    public CurrencyCodeID: number;
    public UpdatedBy: string;
    public PaymentInformation: string;
    public ID: number;
    public FreeTxt: string;
    public ProduceAs: RecurringResult;
    public ShippingPostalCode: string;
    public NotifyWhenRecurringEnds: boolean;
    public ShippingAddressLine3: string;
    public ShippingCity: string;
    public OurReference: string;
    public DeliveryTermsID: number;
    public NotifyUser: string;
    public StatusCode: number;
    public PayableRoundingCurrencyAmount: number;
    public PaymentInfoTypeID: number;
    public InvoiceAddressLine2: string;
    public CustomerName: string;
    public Requisition: string;
    public ShippingAddressLine1: string;
    public PrintStatus: number;
    public VatTotalsAmount: number;
    public DefaultDimensionsID: number;
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
    public CreatedAt: Date;
    public SumTotalExVatCurrency: number;
    public DiscountCurrency: number;
    public Unit: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public ProductID: number;
    public CurrencyExchangeRate: number;
    public DiscountPercent: number;
    public TimeFactor: RecurringPeriod;
    public PriceIncVat: number;
    public SumTotalIncVat: number;
    public Deleted: boolean;
    public SumVat: number;
    public VatPercent: number;
    public SumTotalExVat: number;
    public RecurringInvoiceID: number;
    public Discount: number;
    public CalculateGrossPriceBasedOnNetPrice: boolean;
    public Comment: string;
    public SumTotalIncVatCurrency: number;
    public PriceExVatCurrency: number;
    public NumberOfItems: number;
    public SumVatCurrency: number;
    public VatTypeID: number;
    public CurrencyCodeID: number;
    public UpdatedBy: string;
    public ID: number;
    public AccountID: number;
    public SortIndex: number;
    public PriceExVat: number;
    public ItemText: string;
    public DimensionsID: number;
    public StatusCode: number;
    public PriceSetByUser: boolean;
    public PricingSource: PricingSource;
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

    public CreatedAt: Date;
    public InvoiceID: number;
    public CreatedBy: string;
    public OrderID: number;
    public UpdatedAt: Date;
    public NotifiedRecurringEnds: boolean;
    public Deleted: boolean;
    public IterationNumber: number;
    public RecurringInvoiceID: number;
    public NotifiedOrdersPrepared: boolean;
    public Comment: string;
    public UpdatedBy: string;
    public CreationDate: LocalDate;
    public ID: number;
    public StatusCode: number;
    public InvoiceDate: LocalDate;
    public _createguid: string;
    public CustomFields: any;
}


export class Seller extends UniEntity {
    public static RelativeUrl = 'sellers';
    public static EntityType = 'Seller';

    public CreatedAt: Date;
    public Name: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public UpdatedBy: string;
    public EmployeeID: number;
    public ID: number;
    public StatusCode: number;
    public UserID: number;
    public TeamID: number;
    public DefaultDimensionsID: number;
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

    public CreatedAt: Date;
    public Percent: number;
    public Amount: number;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public CustomerQuoteID: number;
    public Deleted: boolean;
    public RecurringInvoiceID: number;
    public CustomerID: number;
    public CustomerInvoiceID: number;
    public UpdatedBy: string;
    public ID: number;
    public SellerID: number;
    public CustomerOrderID: number;
    public StatusCode: number;
    public _createguid: string;
    public Seller: Seller;
    public CustomFields: any;
}


export class SubCompany extends UniEntity {
    public static RelativeUrl = 'subcompanies';
    public static EntityType = 'SubCompany';

    public CreatedAt: Date;
    public CreatedBy: string;
    public CompanyType: CompanyRelation;
    public UpdatedAt: Date;
    public CompanyName: string;
    public CompanyKey: string;
    public Deleted: boolean;
    public CompanyID: number;
    public CustomerID: number;
    public UpdatedBy: string;
    public ID: number;
    public StatusCode: number;
    public _createguid: string;
    public Customer: Customer;
    public CustomFields: any;
}


export class Supplier extends UniEntity {
    public static RelativeUrl = 'suppliers';
    public static EntityType = 'Supplier';

    public CreatedAt: Date;
    public CreditDays: number;
    public CreatedBy: string;
    public PeppolAddress: string;
    public SelfEmployed: boolean;
    public SubAccountNumberSeriesID: number;
    public UpdatedAt: Date;
    public Localization: string;
    public OrgNumber: string;
    public BusinessRelationID: number;
    public SupplierNumber: number;
    public Deleted: boolean;
    public WebUrl: string;
    public CurrencyCodeID: number;
    public UpdatedBy: string;
    public GLN: string;
    public ID: number;
    public DimensionsID: number;
    public StatusCode: number;
    public CostAllocationID: number;
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

    public CreatedAt: Date;
    public CreditDays: number;
    public Name: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public Description: string;
    public StatusCode: number;
    public TermsType: TermsType;
    public _createguid: string;
    public CustomFields: any;
}


export class TOFCurrencySettings extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'TOFCurrencySettings';

    public CreatedAt: Date;
    public CreatedBy: string;
    public UpdateCurrencyAmountsOnQuoteToOrder: boolean;
    public UpdatedAt: Date;
    public UpdateCurrencyAmountsOnOrderdateChange: boolean;
    public UpdateCurrencyAmountsOnOrderToInvoice: boolean;
    public Deleted: boolean;
    public UpdateCurrencyAmountsOnQuotedateChange: boolean;
    public UpdateCurrencyAmountsOnQuoteToInvoice: boolean;
    public UpdateCurrencyAmountsOnInvoicedateChange: boolean;
    public UpdatedBy: string;
    public ID: number;
    public StatusCode: number;
    public _createguid: string;
    public CustomFields: any;
}


export class Address extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Address';

    public CreatedAt: Date;
    public City: string;
    public PostalCode: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public AddressLine2: string;
    public AddressLine1: string;
    public BusinessRelationID: number;
    public CountryCode: string;
    public Deleted: boolean;
    public Region: string;
    public Country: string;
    public UpdatedBy: string;
    public ID: number;
    public AddressLine3: string;
    public StatusCode: number;
    public _createguid: string;
    public BusinessRelation: BusinessRelation;
    public CustomFields: any;
}


export class BusinessRelation extends UniEntity {
    public static RelativeUrl = 'business-relations';
    public static EntityType = 'BusinessRelation';

    public CreatedAt: Date;
    public Name: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public InvoiceAddressID: number;
    public DefaultContactID: number;
    public Deleted: boolean;
    public DefaultPhoneID: number;
    public DefaultEmailID: number;
    public ShippingAddressID: number;
    public DefaultBankAccountID: number;
    public UpdatedBy: string;
    public ID: number;
    public StatusCode: number;
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

    public CreatedAt: Date;
    public Role: string;
    public InfoID: number;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public Comment: string;
    public ParentBusinessRelationID: number;
    public UpdatedBy: string;
    public ID: number;
    public StatusCode: number;
    public _createguid: string;
    public ParentBusinessRelation: BusinessRelation;
    public Info: BusinessRelation;
    public CustomFields: any;
}


export class Email extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Email';

    public CreatedAt: Date;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public BusinessRelationID: number;
    public Deleted: boolean;
    public Type: string;
    public EmailAddress: string;
    public UpdatedBy: string;
    public ID: number;
    public Description: string;
    public StatusCode: number;
    public _createguid: string;
    public CustomFields: any;
}


export class Phone extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Phone';

    public CreatedAt: Date;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public BusinessRelationID: number;
    public CountryCode: string;
    public Deleted: boolean;
    public Type: PhoneTypeEnum;
    public UpdatedBy: string;
    public ID: number;
    public Number: string;
    public Description: string;
    public StatusCode: number;
    public _createguid: string;
    public CustomFields: any;
}


export class AGACalculation extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AGACalculation';

    public CreatedAt: Date;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public PayrollRunID: number;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public DimensionsID: number;
    public StatusCode: number;
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

    public CreatedAt: Date;
    public SubEntityID: number;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public AGACalculationID: number;
    public UpdatedBy: string;
    public ID: number;
    public freeAmount: number;
    public StatusCode: number;
    public _createguid: string;
    public subEntity: SubEntity;
    public CustomFields: any;
}


export class AGATax extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AGATax';

    public CreatedAt: Date;
    public SubEntityID: number;
    public agaBase: number;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public beregningsKode: number;
    public zone: number;
    public Deleted: boolean;
    public AGACalculationID: number;
    public UpdatedBy: string;
    public ID: number;
    public agaRate: number;
    public StatusCode: number;
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

    public CreatedAt: Date;
    public SubEntityID: number;
    public agaBase: number;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public beregningsKode: number;
    public zone: number;
    public Deleted: boolean;
    public AGACalculationID: number;
    public UpdatedBy: string;
    public ID: number;
    public agaRate: number;
    public StatusCode: number;
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

    public CreatedAt: Date;
    public SubEntityID: number;
    public agaBase: number;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public beregningsKode: number;
    public zone: number;
    public Deleted: boolean;
    public AGACalculationID: number;
    public UpdatedBy: string;
    public ID: number;
    public agaRate: number;
    public StatusCode: number;
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

    public CreatedAt: Date;
    public SubEntityID: number;
    public agaBase: number;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public AGACalculationID: number;
    public UpdatedBy: string;
    public ID: number;
    public agaRate: number;
    public StatusCode: number;
    public zoneName: string;
    public municipalityName: string;
    public _createguid: string;
    public subEntity: SubEntity;
    public CustomFields: any;
}


export class DrawForeignerWithPercent extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'DrawForeignerWithPercent';

    public CreatedAt: Date;
    public SubEntityID: number;
    public agaBase: number;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public AGACalculationID: number;
    public UpdatedBy: string;
    public ID: number;
    public agaRate: number;
    public StatusCode: number;
    public zoneName: string;
    public municipalityName: string;
    public _createguid: string;
    public subEntity: SubEntity;
    public CustomFields: any;
}


export class ForeignerWithAmount extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ForeignerWithAmount';

    public CreatedAt: Date;
    public SubEntityID: number;
    public aga: number;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public persons: number;
    public Deleted: boolean;
    public AGACalculationID: number;
    public UpdatedBy: string;
    public ID: number;
    public StatusCode: number;
    public zoneName: string;
    public municipalityName: string;
    public _createguid: string;
    public subEntity: SubEntity;
    public CustomFields: any;
}


export class TaxAndAgaSums extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'TaxAndAgaSums';

    public CreatedAt: Date;
    public CreatedBy: string;
    public GarnishmentTax: number;
    public WithholdingTax: number;
    public UpdatedAt: Date;
    public FinancialTax: number;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public StatusCode: number;
    public _createguid: string;
    public CustomFields: any;
}


export class AmeldingData extends UniEntity {
    public static RelativeUrl = 'amelding';
    public static EntityType = 'AmeldingData';

    public OppgaveHash: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public replacesID: number;
    public created: Date;
    public UpdatedAt: Date;
    public receiptID: number;
    public altinnStatus: string;
    public PayrollRunID: number;
    public sent: Date;
    public year: number;
    public Deleted: boolean;
    public mainFileID: number;
    public type: AmeldingType;
    public attachmentFileID: number;
    public UpdatedBy: string;
    public ID: number;
    public period: number;
    public status: number;
    public feedbackFileID: number;
    public messageID: string;
    public StatusCode: number;
    public initiated: Date;
    public xmlValidationErrors: string;
    public replaceThis: string;
    public _createguid: string;
    public log: Array<AmeldingLog>;
    public CustomFields: any;
}


export class AmeldingLog extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AmeldingLog';

    public CreatedAt: Date;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public registry: SalaryRegistry;
    public Deleted: boolean;
    public AmeldingsID: number;
    public key: number;
    public UpdatedBy: string;
    public ID: number;
    public StatusCode: number;
    public _createguid: string;
    public CustomFields: any;
}


export class BasicAmount extends UniEntity {
    public static RelativeUrl = 'basicamounts';
    public static EntityType = 'BasicAmount';

    public CreatedAt: Date;
    public AveragePrYear: number;
    public CreatedBy: string;
    public FromDate: Date;
    public UpdatedAt: Date;
    public ConversionFactor: number;
    public Deleted: boolean;
    public BasicAmountPrMonth: number;
    public UpdatedBy: string;
    public ID: number;
    public BasicAmountPrYear: number;
    public StatusCode: number;
    public _createguid: string;
    public CustomFields: any;
}


export class CompanySalary extends UniEntity {
    public static RelativeUrl = 'companysalary';
    public static EntityType = 'CompanySalary';

    public CalculateFinancialTax: boolean;
    public CreatedAt: Date;
    public RateFinancialTax: number;
    public Base_NettoPayment: boolean;
    public CreatedBy: string;
    public PaycheckZipReportID: number;
    public UpdatedAt: Date;
    public Base_PayAsYouEarnTaxOnPensions: boolean;
    public OtpExportActive: boolean;
    public Base_SpesialDeductionForMaritim: boolean;
    public HoursPerMonth: number;
    public HourFTEs: number;
    public MainAccountAllocatedFinancial: number;
    public PostGarnishmentToTaxAccount: boolean;
    public MainAccountAllocatedFinancialVacation: number;
    public Deleted: boolean;
    public PostToTaxDraw: boolean;
    public WagetypeAdvancePaymentAuto: number;
    public Base_Svalbard: boolean;
    public InterrimRemitAccount: number;
    public MainAccountCostAGAVacation: number;
    public Base_TaxFreeOrganization: boolean;
    public AllowOver6G: boolean;
    public PaymentInterval: CompanySalaryPaymentInterval;
    public MainAccountCostVacation: number;
    public MainAccountCostFinancialVacation: number;
    public UpdatedBy: string;
    public ID: number;
    public MainAccountAllocatedAGAVacation: number;
    public MainAccountAllocatedVacation: number;
    public FreeAmount: number;
    public MainAccountCostFinancial: number;
    public MainAccountAllocatedAGA: number;
    public WagetypeAdvancePayment: number;
    public Base_NettoPaymentForMaritim: boolean;
    public StatusCode: number;
    public WageDeductionDueToHoliday: WageDeductionDueToHolidayType;
    public MainAccountCostAGA: number;
    public Base_JanMayenAndBiCountries: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class CompanyVacationRate extends UniEntity {
    public static RelativeUrl = 'companyvacationrates';
    public static EntityType = 'CompanyVacationRate';

    public CreatedAt: Date;
    public Rate60: number;
    public CreatedBy: string;
    public FromDate: Date;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public Rate: number;
    public UpdatedBy: string;
    public ID: number;
    public StatusCode: number;
    public _createguid: string;
    public CustomFields: any;
}


export class EmployeeCategory extends UniEntity {
    public static RelativeUrl = 'employeecategories';
    public static EntityType = 'EmployeeCategory';

    public CreatedAt: Date;
    public EmployeeCategoryLinkID: number;
    public Name: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public StatusCode: number;
    public _createguid: string;
    public CustomFields: any;
}


export class EmployeeCategoryLink extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'EmployeeCategoryLink';

    public CreatedAt: Date;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public EmployeeNumber: number;
    public Deleted: boolean;
    public UpdatedBy: string;
    public EmployeeID: number;
    public ID: number;
    public EmployeeCategoryID: number;
    public StatusCode: number;
    public _createguid: string;
    public EmployeeCategory: EmployeeCategory;
    public Employee: Employee;
    public CustomFields: any;
}


export class Employee extends UniEntity {
    public static RelativeUrl = 'employees';
    public static EntityType = 'Employee';

    public FreeText: string;
    public EmploymentDateOtp: LocalDate;
    public CreatedAt: Date;
    public IncludeOtpUntilYear: number;
    public SubEntityID: number;
    public CreatedBy: string;
    public InternasjonalIDType: InternationalIDType;
    public OtpStatus: OtpStatus;
    public UpdatedAt: Date;
    public IncludeOtpUntilMonth: number;
    public AdvancePaymentAmount: number;
    public InternationalID: string;
    public BusinessRelationID: number;
    public InternasjonalIDCountry: string;
    public BirthDate: Date;
    public EmployeeNumber: number;
    public Deleted: boolean;
    public Active: boolean;
    public OtpExport: boolean;
    public Sex: GenderEnum;
    public PhotoID: number;
    public ForeignWorker: ForeignWorker;
    public PaymentInterval: PaymentInterval;
    public EndDateOtp: LocalDate;
    public UpdatedBy: string;
    public MunicipalityNo: string;
    public EmploymentDate: Date;
    public ID: number;
    public SocialSecurityNumber: string;
    public EmployeeLanguageID: number;
    public TypeOfPaymentOtp: TypeOfPaymentOtp;
    public StatusCode: number;
    public UserID: number;
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

    public loennTilUtenrikstjenestemannID: number;
    public SecondaryTable: string;
    public CreatedAt: Date;
    public loennFraHovedarbeidsgiverID: number;
    public Percent: number;
    public NonTaxableAmount: number;
    public Table: string;
    public CreatedBy: string;
    public IssueDate: Date;
    public UpdatedAt: Date;
    public loennFraBiarbeidsgiverID: number;
    public SKDXml: string;
    public Tilleggsopplysning: string;
    public loennKunTrygdeavgiftTilUtenlandskBorgerID: number;
    public EmployeeNumber: number;
    public Year: number;
    public Deleted: boolean;
    public loennKunTrygdeavgiftTilUtenlandskBorgerSomGrensegjengerID: number;
    public NotMainEmployer: boolean;
    public pensjonID: number;
    public TaxcardId: number;
    public ufoereYtelserAndreID: number;
    public ResultatStatus: string;
    public UpdatedBy: string;
    public EmployeeID: number;
    public ID: number;
    public SecondaryPercent: number;
    public StatusCode: number;
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

    public CreatedAt: Date;
    public Percent: number;
    public NonTaxableAmount: number;
    public Table: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public AntallMaanederForTrekk: number;
    public Deleted: boolean;
    public tabellType: TabellType;
    public UpdatedBy: string;
    public freeAmountType: FreeAmountType;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class EmployeeLeave extends UniEntity {
    public static RelativeUrl = 'EmployeeLeave';
    public static EntityType = 'EmployeeLeave';

    public CreatedAt: Date;
    public CreatedBy: string;
    public FromDate: Date;
    public UpdatedAt: Date;
    public EmploymentID: number;
    public AffectsOtp: boolean;
    public Deleted: boolean;
    public ToDate: Date;
    public UpdatedBy: string;
    public ID: number;
    public LeaveType: Leavetype;
    public LeavePercent: number;
    public Description: string;
    public StatusCode: number;
    public _createguid: string;
    public Employment: Employment;
    public CustomFields: any;
}


export class Employment extends UniEntity {
    public static RelativeUrl = 'employments';
    public static EntityType = 'Employment';

    public TradeArea: ShipTradeArea;
    public CreatedAt: Date;
    public EndDateReason: EndDateReason;
    public HourRate: number;
    public RegulativeGroupID: number;
    public SubEntityID: number;
    public WorkPercent: number;
    public LastSalaryChangeDate: Date;
    public JobCode: string;
    public CreatedBy: string;
    public RegulativeStepNr: number;
    public UpdatedAt: Date;
    public TypeOfEmployment: TypeOfEmployment;
    public EndDate: Date;
    public LedgerAccount: string;
    public EmployeeNumber: number;
    public JobName: string;
    public Deleted: boolean;
    public UserDefinedRate: number;
    public ShipType: ShipTypeOfShip;
    public WorkingHoursScheme: WorkingHoursScheme;
    public Standard: boolean;
    public StartDate: Date;
    public UpdatedBy: string;
    public EmployeeID: number;
    public ID: number;
    public RemunerationType: RemunerationType;
    public LastWorkPercentChangeDate: Date;
    public DimensionsID: number;
    public MonthRate: number;
    public StatusCode: number;
    public PayGrade: string;
    public EmploymentType: EmploymentType;
    public SeniorityDate: Date;
    public HoursPerWeek: number;
    public ShipReg: ShipRegistry;
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

    public CreatedAt: Date;
    public Amount: number;
    public SubentityID: number;
    public CreatedBy: string;
    public FromDate: Date;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public AffectsAGA: boolean;
    public UpdatedBy: string;
    public ID: number;
    public Description: string;
    public StatusCode: number;
    public _createguid: string;
    public CustomFields: any;
}


export class OtpExportWagetype extends UniEntity {
    public static RelativeUrl = 'otpexportwagetypes';
    public static EntityType = 'OtpExportWagetype';

    public CreatedAt: Date;
    public WageTypeNumber: number;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public StatusCode: number;
    public _createguid: string;
    public CustomFields: any;
}


export class PayrollRun extends UniEntity {
    public static RelativeUrl = 'payrollrun';
    public static EntityType = 'PayrollRun';

    public FreeText: string;
    public CreatedAt: Date;
    public PaycheckFileID: number;
    public CreatedBy: string;
    public FromDate: Date;
    public AGAonRun: number;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public AGAFreeAmount: number;
    public ToDate: Date;
    public PayDate: Date;
    public needsRecalc: boolean;
    public UpdatedBy: string;
    public SettlementDate: Date;
    public ID: number;
    public taxdrawfactor: TaxDrawFactor;
    public HolidayPayDeduction: boolean;
    public ExcludeRecurringPosts: boolean;
    public Description: string;
    public StatusCode: number;
    public JournalEntryNumber: string;
    public _createguid: string;
    public transactions: Array<SalaryTransaction>;
    public agacalculation: Array<AGACalculation>;
    public CustomFields: any;
}


export class PayrollRunCategoryLink extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'PayrollRunCategoryLink';

    public CreatedAt: Date;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public PayrollRunID: number;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public EmployeeCategoryID: number;
    public StatusCode: number;
    public _createguid: string;
    public EmployeeCategory: EmployeeCategory;
    public PayrollRun: PayrollRun;
    public CustomFields: any;
}


export class PostingSummaryDraft extends UniEntity {
    public draftWithDimsOnBalance: string;
    public draftWithDims: string;
    public JobInfoID: number;
    public statusTime: Date;
    public ID: number;
    public status: SummaryJobStatus;
    public PayrollID: number;
    public draftBasic: string;
}


export class Regulative extends UniEntity {
    public static RelativeUrl = 'regulatives';
    public static EntityType = 'Regulative';

    public CreatedAt: Date;
    public RegulativeGroupID: number;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public StartDate: LocalDate;
    public UpdatedBy: string;
    public ID: number;
    public StatusCode: number;
    public _createguid: string;
    public Steps: Array<RegulativeStep>;
    public CustomFields: any;
}


export class RegulativeGroup extends UniEntity {
    public static RelativeUrl = 'regulativegroups';
    public static EntityType = 'RegulativeGroup';

    public CreatedAt: Date;
    public Name: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public StatusCode: number;
    public _createguid: string;
    public Regulatives: Array<Regulative>;
    public CustomFields: any;
}


export class RegulativeStep extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'RegulativeStep';

    public CreatedAt: Date;
    public Amount: number;
    public CreatedBy: string;
    public Step: number;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public RegulativeID: number;
    public UpdatedBy: string;
    public ID: number;
    public StatusCode: number;
    public _createguid: string;
    public CustomFields: any;
}


export class SalaryBalance extends UniEntity {
    public static RelativeUrl = 'salarybalances';
    public static EntityType = 'SalaryBalance';

    public CreatedAt: Date;
    public WageTypeNumber: number;
    public MaxAmount: number;
    public Name: string;
    public CreatedBy: string;
    public FromDate: Date;
    public InstalmentType: SalBalType;
    public UpdatedAt: Date;
    public MinAmount: number;
    public SalaryBalanceTemplateID: number;
    public EmploymentID: number;
    public Deleted: boolean;
    public CreatePayment: boolean;
    public ToDate: Date;
    public Type: SalBalDrawType;
    public InstalmentPercent: number;
    public UpdatedBy: string;
    public Instalment: number;
    public EmployeeID: number;
    public ID: number;
    public Source: SalBalSource;
    public KID: string;
    public SupplierID: number;
    public StatusCode: number;
    public Amount: number;
    public Balance: number;
    public CalculatedBalance: number;
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

    public Date: LocalDate;
    public CreatedAt: Date;
    public Amount: number;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public SalaryBalanceID: number;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public Description: string;
    public StatusCode: number;
    public SalaryTransactionID: number;
    public _createguid: string;
    public SalaryTransaction: SalaryTransaction;
    public SalaryBalance: SalaryBalance;
    public CustomFields: any;
}


export class SalaryBalanceTemplate extends UniEntity {
    public static RelativeUrl = 'salarybalancetemplates';
    public static EntityType = 'SalaryBalanceTemplate';

    public CreatedAt: Date;
    public WageTypeNumber: number;
    public MaxAmount: number;
    public Name: string;
    public CreatedBy: string;
    public InstalmentType: SalBalType;
    public UpdatedAt: Date;
    public MinAmount: number;
    public Deleted: boolean;
    public CreatePayment: boolean;
    public InstalmentPercent: number;
    public UpdatedBy: string;
    public Instalment: number;
    public ID: number;
    public Account: number;
    public KID: string;
    public SupplierID: number;
    public StatusCode: number;
    public SalarytransactionDescription: string;
    public _createguid: string;
    public Supplier: Supplier;
    public SalaryBalances: Array<SalaryBalance>;
    public CustomFields: any;
}


export class SalaryTransaction extends UniEntity {
    public static RelativeUrl = 'salarytrans';
    public static EntityType = 'SalaryTransaction';

    public RecurringID: number;
    public CreatedAt: Date;
    public WageTypeNumber: number;
    public SystemType: StdSystemType;
    public Amount: number;
    public ChildSalaryTransactionID: number;
    public CreatedBy: string;
    public FromDate: Date;
    public UpdatedAt: Date;
    public SalaryBalanceID: number;
    public PayrollRunID: number;
    public recurringPostValidFrom: Date;
    public IsRecurringPost: boolean;
    public EmploymentID: number;
    public TaxbasisID: number;
    public Sum: number;
    public EmployeeNumber: number;
    public Deleted: boolean;
    public recurringPostValidTo: Date;
    public ToDate: Date;
    public Rate: number;
    public WageTypeID: number;
    public calcAGA: number;
    public VatTypeID: number;
    public UpdatedBy: string;
    public MunicipalityNo: string;
    public EmployeeID: number;
    public ID: number;
    public Account: number;
    public HolidayPayDeduction: boolean;
    public DimensionsID: number;
    public StatusCode: number;
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

    public CreatedAt: Date;
    public ValueDate: Date;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public ValueDate2: Date;
    public Deleted: boolean;
    public WageTypeSupplementID: number;
    public ValueString: string;
    public UpdatedBy: string;
    public ID: number;
    public ValueMoney: number;
    public StatusCode: number;
    public ValueBool: boolean;
    public SalaryTransactionID: number;
    public _createguid: string;
    public WageTypeSupplement: WageTypeSupplement;
    public CustomFields: any;
}


export class SalaryYear extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'SalaryYear';

    public CreatedAt: Date;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public CurrentYear: number;
    public UpdatedBy: string;
    public ID: number;
    public StatusCode: number;
    public _createguid: string;
    public CustomFields: any;
}


export class SubEntity extends UniEntity {
    public static RelativeUrl = 'subentities';
    public static EntityType = 'SubEntity';

    public CreatedAt: Date;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public OrgNumber: string;
    public BusinessRelationID: number;
    public Deleted: boolean;
    public AgaRule: number;
    public AgaZone: number;
    public UpdatedBy: string;
    public MunicipalityNo: string;
    public ID: number;
    public freeAmount: number;
    public StatusCode: number;
    public SuperiorOrganizationID: number;
    public _createguid: string;
    public BusinessRelationInfo: BusinessRelation;
    public SuperiorOrganization: SubEntity;
    public CustomFields: any;
}


export class TaxBasis extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'TaxBasis';

    public JanMayenBasis: number;
    public CreatedAt: Date;
    public SailorBasis: number;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public ForeignCitizenInsuranceBasis: number;
    public ForeignBorderCommuterBasis: number;
    public PensionSourcetaxBasis: number;
    public Basis: number;
    public Deleted: boolean;
    public UpdatedBy: string;
    public SvalbardBasis: number;
    public ID: number;
    public DisabilityOtherBasis: number;
    public PensionBasis: number;
    public StatusCode: number;
    public SalaryTransactionID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class Travel extends UniEntity {
    public static RelativeUrl = 'travels';
    public static EntityType = 'Travel';

    public CreatedAt: Date;
    public Name: string;
    public State: state;
    public CreatedBy: string;
    public Email: string;
    public Purpose: string;
    public UpdatedAt: Date;
    public SourceSystem: string;
    public Phone: string;
    public EmployeeNumber: number;
    public Deleted: boolean;
    public TravelIdentificator: string;
    public Comment: string;
    public PersonID: string;
    public UpdatedBy: string;
    public ID: number;
    public DimensionsID: number;
    public Description: string;
    public SupplierID: number;
    public StatusCode: number;
    public AdvanceAmount: number;
    public _createguid: string;
    public TravelLines: Array<TravelLine>;
    public Dimensions: Dimensions;
    public CustomFields: any;
}


export class TravelLine extends UniEntity {
    public static RelativeUrl = 'travellines';
    public static EntityType = 'TravelLine';

    public CostType: costtype;
    public From: Date;
    public CreatedAt: Date;
    public Amount: number;
    public paytransID: number;
    public To: Date;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public InvoiceAccount: number;
    public LineState: linestate;
    public Deleted: boolean;
    public Rate: number;
    public TravelIdentificator: string;
    public VatTypeID: number;
    public UpdatedBy: string;
    public ID: number;
    public TypeID: number;
    public AccountNumber: number;
    public DimensionsID: number;
    public Description: string;
    public StatusCode: number;
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

    public CreatedAt: Date;
    public WageTypeNumber: number;
    public CreatedBy: string;
    public ForeignDescription: string;
    public UpdatedAt: Date;
    public InvoiceAccount: number;
    public Deleted: boolean;
    public ForeignTypeID: string;
    public UpdatedBy: string;
    public ID: number;
    public Description: string;
    public StatusCode: number;
    public _createguid: string;
    public CustomFields: any;
}


export class VacationPayLine extends UniEntity {
    public static RelativeUrl = 'VacationPayLines';
    public static EntityType = 'VacationPayLine';

    public ManualVacationPayBase: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Year: number;
    public Deleted: boolean;
    public UpdatedBy: string;
    public EmployeeID: number;
    public ID: number;
    public StatusCode: number;
    public PaidTaxFreeVacationPay: number;
    public MissingEarlierVacationPay: number;
    public Rate60: number;
    public Age: number;
    public VacationPay: number;
    public Rate: number;
    public PaidVacationPay: number;
    public Withdrawal: number;
    public _createguid: string;
    public VacationPay60: number;
    public SystemVacationPayBase: number;
    public Employee: Employee;
    public CustomFields: any;
}


export class VacationRateEmployee extends UniEntity {
    public static RelativeUrl = 'employeevacationrates';
    public static EntityType = 'VacationRateEmployee';

    public CreatedAt: Date;
    public Rate60: number;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public EndDate: Date;
    public Deleted: boolean;
    public Rate: number;
    public StartDate: Date;
    public UpdatedBy: string;
    public EmployeeID: number;
    public ID: number;
    public StatusCode: number;
    public _createguid: string;
    public CustomFields: any;
}


export class WageType extends UniEntity {
    public static RelativeUrl = 'wagetypes';
    public static EntityType = 'WageType';

    public Limit_value: number;
    public Base_EmploymentTax: boolean;
    public CreatedAt: Date;
    public taxtype: TaxType;
    public WageTypeNumber: number;
    public Systemtype: string;
    public RatetypeColumn: RateTypeColumn;
    public AccountNumber_balance: number;
    public CreatedBy: string;
    public SpecialTaxHandling: string;
    public WageTypeName: string;
    public UpdatedAt: Date;
    public Limit_newRate: number;
    public GetRateFrom: GetRateFrom;
    public Postnr: string;
    public SpecialTaxAndContributionsRule: SpecialTaxAndContributionsRule;
    public SupplementPackage: string;
    public IncomeType: string;
    public StandardWageTypeFor: StdWageType;
    public Deleted: boolean;
    public Base_div3: boolean;
    public DaysOnBoard: boolean;
    public FixedSalaryHolidayDeduction: boolean;
    public SpecialAgaRule: SpecialAgaRule;
    public Benefit: string;
    public Rate: number;
    public SystemRequiredWageType: number;
    public Base_div2: boolean;
    public Base_Vacation: boolean;
    public NoNumberOfHours: boolean;
    public UpdatedBy: string;
    public ID: number;
    public Limit_WageTypeNumber: number;
    public AccountNumber: number;
    public HideFromPaycheck: boolean;
    public Description: string;
    public StatusCode: number;
    public ValidYear: number;
    public RateFactor: number;
    public Limit_type: LimitType;
    public Base_Payment: boolean;
    public _createguid: string;
    public SupplementaryInformations: Array<WageTypeSupplement>;
    public CustomFields: any;
}


export class WageTypeSupplement extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'WageTypeSupplement';

    public CreatedAt: Date;
    public Name: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public ameldingType: string;
    public WageTypeID: number;
    public UpdatedBy: string;
    public ID: number;
    public GetValueFromTrans: boolean;
    public ValueType: Valuetype;
    public Description: string;
    public StatusCode: number;
    public SuggestedValue: string;
    public _createguid: string;
    public CustomFields: any;
}


export class WageTypeTranslation extends UniEntity {
    public static RelativeUrl = 'wagetypetranslations';
    public static EntityType = 'WageTypeTranslation';

    public CreatedAt: Date;
    public WageTypeNumber: number;
    public CreatedBy: string;
    public WageTypeName: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public EmployeeLanguageID: number;
    public StatusCode: number;
    public _createguid: string;
    public EmployeeLanguage: EmployeeLanguage;
    public CustomFields: any;
}


export class PensionScheme extends UniEntity {
    public static RelativeUrl = 'pensionschemes';
    public static EntityType = 'PensionScheme';

    public Identificator: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Year: number;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public Period: number;
    public StatusCode: number;
    public _createguid: string;
    public CustomFields: any;
}


export class PensionSchemeSupplier extends UniEntity {
    public static RelativeUrl = 'pensionschemesuppliers';
    public static EntityType = 'PensionSchemeSupplier';

    public Identificator: string;
    public CreatedAt: Date;
    public Name: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public StatusCode: number;
    public _createguid: string;
    public CustomFields: any;
}


export class StandardPensionSchemeSupplier extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'StandardPensionSchemeSupplier';

    public Identificator: string;
    public CreatedAt: Date;
    public Name: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class EmployeeLanguage extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'EmployeeLanguage';

    public LanguageCode: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public StatusCode: number;
    public _createguid: string;
    public CustomFields: any;
}


export class ComponentLayout extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ComponentLayout';

    public CreatedAt: Date;
    public Name: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public BaseEntity: string;
    public UpdatedBy: string;
    public ID: number;
    public StatusCode: number;
    public _createguid: string;
    public Fields: Array<FieldLayout>;
    public CustomFields: any;
}


export class FieldLayout extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'FieldLayout';

    public Hidden: boolean;
    public CreatedAt: Date;
    public ReadOnly: boolean;
    public Property: string;
    public Options: string;
    public Placeholder: string;
    public ComponentLayoutID: number;
    public CreatedBy: string;
    public FieldType: FieldType;
    public UpdatedAt: Date;
    public LineBreak: boolean;
    public Placement: number;
    public Combo: number;
    public Deleted: boolean;
    public HelpText: string;
    public FieldSet: number;
    public Alignment: Alignment;
    public EntityType: string;
    public UpdatedBy: string;
    public Width: string;
    public ID: number;
    public Label: string;
    public Sectionheader: string;
    public Legend: string;
    public Description: string;
    public StatusCode: number;
    public LookupField: boolean;
    public DisplayField: string;
    public Section: number;
    public _createguid: string;
    public CustomFields: any;
}


export class CurrencyOverride extends UniEntity {
    public static RelativeUrl = 'currencyoverrides';
    public static EntityType = 'CurrencyOverride';

    public Factor: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public FromDate: LocalDate;
    public UpdatedAt: Date;
    public ExchangeRate: number;
    public Deleted: boolean;
    public ToDate: LocalDate;
    public ToCurrencyCodeID: number;
    public UpdatedBy: string;
    public FromCurrencyCodeID: number;
    public ID: number;
    public Source: CurrencySourceEnum;
    public _createguid: string;
    public FromCurrencyCode: CurrencyCode;
    public ToCurrencyCode: CurrencyCode;
    public CustomFields: any;
}


export class AccountAssetGroup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AccountAssetGroup';

    public CreatedAt: Date;
    public CreatedBy: string;
    public FromAccountNumber: number;
    public UpdatedAt: Date;
    public AssetGroupCode: string;
    public Deleted: boolean;
    public ToAccountNumber: number;
    public UpdatedBy: string;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class AccountGroupSetup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AccountGroupSetup';

    public ExternalReference: string;
    public CreatedAt: Date;
    public Name: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public UpdatedBy: string;
    public PlanType: PlanTypeEnum;
    public ID: number;
    public ParentID: number;
    public _createguid: string;
    public Parent: AccountGroupSetup;
    public CustomFields: any;
}


export class AccountSetup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AccountSetup';

    public CreatedAt: Date;
    public SaftMappingAccountID: number;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public VatCode: string;
    public AccountName: string;
    public AccountGroupSetupID: number;
    public UpdatedBy: string;
    public PlanType: PlanTypeEnum;
    public ID: number;
    public AccountNumber: number;
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

    public CreatedAt: Date;
    public Name: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public _createguid: string;
    public Accounts: Array<AccountVisibilityGroupAccount>;
    public CompanyTypes: Array<CompanyType>;
    public CustomFields: any;
}


export class AccountVisibilityGroupAccount extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AccountVisibilityGroupAccount';

    public CreatedAt: Date;
    public AccountVisibilityGroupID: number;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public AccountSetupID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class AGARate extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AGARate';

    public CreatedAt: Date;
    public ZoneID: number;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public Rate: number;
    public UpdatedBy: string;
    public ID: number;
    public RateValidFrom: Date;
    public _createguid: string;
    public sector: Array<AGASector>;
    public CustomFields: any;
}


export class AGASector extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AGASector';

    public CreatedAt: Date;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public Rate: number;
    public Sector: string;
    public ValidFrom: Date;
    public UpdatedBy: string;
    public ID: number;
    public freeAmount: number;
    public SectorID: number;
    public RateID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class AGAZone extends UniEntity {
    public static RelativeUrl = 'AGAZones';
    public static EntityType = 'AGAZone';

    public CreatedAt: Date;
    public ZoneName: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public _createguid: string;
    public rates: Array<AGARate>;
    public municipalsOnZone: Array<MunicipalAGAZone>;
    public CustomFields: any;
}


export class Agreement extends UniEntity {
    public static RelativeUrl = 'agreements';
    public static EntityType = 'Agreement';

    public CreatedAt: Date;
    public Name: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public AppliesTo: number;
    public Deleted: boolean;
    public ValidFrom: Date;
    public UpdatedBy: string;
    public ID: number;
    public Template: string;
    public _createguid: string;
    public CustomFields: any;
}


export class AssetGroup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AssetGroup';

    public CreatedAt: Date;
    public DepreciationYears: number;
    public Name: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public ToDate: Date;
    public UpdatedBy: string;
    public ID: number;
    public DepreciationRate: number;
    public DepreciationAccountNumber: number;
    public Code: string;
    public _createguid: string;
    public CustomFields: any;
}


export class BankIdentifierCode extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'BankIdentifierCode';

    public CreatedAt: Date;
    public BankName: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public Bic: string;
    public BankIdentifier: string;
    public _createguid: string;
    public CustomFields: any;
}


export class CompanyType extends UniEntity {
    public static RelativeUrl = 'companytypes';
    public static EntityType = 'CompanyType';

    public CreatedAt: Date;
    public FullName: string;
    public Name: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public DefaultAccountVisibilityGroupID: number;
    public Priority: boolean;
    public DefaultPlanType: PlanTypeEnum;
    public UpdatedBy: string;
    public ID: number;
    public Description: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Confirmation extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Confirmation';

    public CreatedAt: Date;
    public ExpirationDate: Date;
    public PostalCode: string;
    public CreatedBy: string;
    public Email: string;
    public UpdatedAt: Date;
    public CompanyName: string;
    public Phone: string;
    public Deleted: boolean;
    public ContractType: string;
    public DisplayName: string;
    public UpdatedBy: string;
    public ID: number;
    public StatusCode: number;
    public Code: string;
    public SignUpReferrer: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Country extends UniEntity {
    public static RelativeUrl = 'countries';
    public static EntityType = 'Country';

    public CreatedAt: Date;
    public Name: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public CountryCode: string;
    public CurrencyRateSource: string;
    public Deleted: boolean;
    public DefaultCurrencyCode: string;
    public UpdatedBy: string;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class Currency extends UniEntity {
    public static RelativeUrl = 'currencies';
    public static EntityType = 'Currency';

    public Factor: number;
    public CurrencyDate: LocalDate;
    public CreatedAt: Date;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public ExchangeRate: number;
    public Deleted: boolean;
    public ToCurrencyCodeID: number;
    public UpdatedBy: string;
    public FromCurrencyCodeID: number;
    public ID: number;
    public Source: CurrencySourceEnum;
    public _createguid: string;
    public FromCurrencyCode: CurrencyCode;
    public ToCurrencyCode: CurrencyCode;
    public CustomFields: any;
}


export class CurrencyCode extends UniEntity {
    public static RelativeUrl = 'currencycodes';
    public static EntityType = 'CurrencyCode';

    public CreatedAt: Date;
    public Name: string;
    public ShortCode: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public Description: string;
    public Code: string;
    public _createguid: string;
    public CustomFields: any;
}


export class DebtCollectionAutomation extends UniEntity {
    public static RelativeUrl = 'debtcollectionautomation';
    public static EntityType = 'DebtCollectionAutomation';

    public CreatedAt: Date;
    public Name: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public DebtCollectionSettingsID: number;
    public Description: string;
    public _createguid: string;
    public DebtCollectionSettings: DebtCollectionSettings;
    public CustomFields: any;
}


export class EmploymentValidValues extends UniEntity {
    public static RelativeUrl = 'employmentvalidvalues';
    public static EntityType = 'EmploymentValidValues';

    public TradeArea: boolean;
    public CreatedAt: Date;
    public employment: TypeOfEmployment;
    public HourRate: boolean;
    public WorkPercent: boolean;
    public LastSalaryChangeDate: boolean;
    public JobCode: boolean;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public typeOfEmployment: boolean;
    public EndDate: boolean;
    public LastWorkPercentChange: boolean;
    public JobName: boolean;
    public Deleted: boolean;
    public UserDefinedRate: boolean;
    public ShipType: boolean;
    public WorkingHoursScheme: boolean;
    public StartDate: boolean;
    public UpdatedBy: string;
    public ID: number;
    public RemunerationType: boolean;
    public MonthRate: boolean;
    public SeniorityDate: boolean;
    public HoursPerWeek: boolean;
    public PaymentType: RemunerationType;
    public ShipReg: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class FinancialDeadline extends UniEntity {
    public static RelativeUrl = 'deadlines';
    public static EntityType = 'FinancialDeadline';

    public AdditionalInfo: string;
    public CreatedAt: Date;
    public Name: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public Type: FinancialDeadlineType;
    public Deadline: LocalDate;
    public UpdatedBy: string;
    public ID: number;
    public PassableDueDate: number;
    public StatusCode: number;
    public _createguid: string;
    public CustomFields: any;
}


export class LanguageCode extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'LanguageCode';

    public CreatedAt: Date;
    public Name: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public Code: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Municipal extends UniEntity {
    public static RelativeUrl = 'Municipals';
    public static EntityType = 'Municipal';

    public CreatedAt: Date;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public CountyName: string;
    public UpdatedBy: string;
    public MunicipalityNo: string;
    public ID: number;
    public MunicipalityName: string;
    public CountyNo: string;
    public Retired: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class MunicipalAGAZone extends UniEntity {
    public static RelativeUrl = 'MunicipalAGAZones';
    public static EntityType = 'MunicipalAGAZone';

    public CreatedAt: Date;
    public ZoneID: number;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public Startdate: Date;
    public UpdatedBy: string;
    public MunicipalityNo: string;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class PaymentBatchType extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'PaymentBatchType';

    public CreatedAt: Date;
    public Name: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public Description: string;
    public Code: number;
    public _createguid: string;
    public CustomFields: any;
}


export class PaymentCode extends UniEntity {
    public static RelativeUrl = 'paymentCodes';
    public static EntityType = 'PaymentCode';

    public CreatedAt: Date;
    public Name: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public PaymentGroup: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public Description: string;
    public Code: number;
    public _createguid: string;
    public CustomFields: any;
}


export class PostalCode extends UniEntity {
    public static RelativeUrl = 'postalcodes';
    public static EntityType = 'PostalCode';

    public CreatedAt: Date;
    public City: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public StatusCode: number;
    public Code: string;
    public _createguid: string;
    public CustomFields: any;
}


export class SaftMappingAccount extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'SaftMappingAccount';

    public CreatedAt: Date;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public AccountID: string;
    public Description: string;
    public _createguid: string;
    public CustomFields: any;
}


export class StaticRegister extends UniEntity {
    public static RelativeUrl = 'StaticRegister';
    public static EntityType = 'StaticRegister';

    public CreatedAt: Date;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Registry: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public stamp: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class STYRKCode extends UniEntity {
    public static RelativeUrl = 'STYRK';
    public static EntityType = 'STYRKCode';

    public CreatedAt: Date;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public ynr: number;
    public UpdatedBy: string;
    public ID: number;
    public tittel: string;
    public styrk: string;
    public lnr: number;
    public _createguid: string;
    public CustomFields: any;
}


export class Language extends UniEntity {
    public static RelativeUrl = 'languages';
    public static EntityType = 'Language';

    public CreatedAt: Date;
    public Name: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public FallBackLanguageID: number;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public Code: string;
    public _createguid: string;
    public Translations: Array<Translation>;
    public CustomFields: any;
}


export class Translatable extends UniEntity {
    public static RelativeUrl = 'translatables';
    public static EntityType = 'Translatable';

    public CreatedAt: Date;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Model: string;
    public Value: string;
    public Deleted: boolean;
    public Meaning: string;
    public Static: boolean;
    public UpdatedBy: string;
    public ID: number;
    public Module: i18nModule;
    public Column: string;
    public Description: string;
    public _createguid: string;
    public Translations: Array<Translation>;
    public CustomFields: any;
}


export class Translation extends UniEntity {
    public static RelativeUrl = 'translations';
    public static EntityType = 'Translation';

    public TranslatableID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Value: string;
    public LanguageID: number;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public _createguid: string;
    public Language: Language;
    public Translatable: Translatable;
    public CustomFields: any;
}


export class VatCodeGroupSetup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'VatCodeGroupSetup';

    public CreatedAt: Date;
    public Name: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public No: string;
    public _createguid: string;
    public CustomFields: any;
}


export class VatPostSetup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'VatPostSetup';

    public CreatedAt: Date;
    public Name: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public ReportAsNegativeAmount: boolean;
    public HasTaxBasis: boolean;
    public UpdatedBy: string;
    public ID: number;
    public VatCodeGroupSetupNo: string;
    public No: string;
    public HasTaxAmount: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class VatReportForm extends UniEntity {
    public static RelativeUrl = 'vatreportforms';
    public static EntityType = 'VatReportForm';

    public CreatedAt: Date;
    public Name: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public Description: string;
    public _createguid: string;
    public CustomFields: any;
}


export class VatReportReferenceSetup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'VatReportReferenceSetup';

    public VatPostNo: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public VatCode: string;
    public UpdatedBy: string;
    public ID: number;
    public AccountNumber: number;
    public _createguid: string;
    public CustomFields: any;
}


export class VatTypeSetup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'VatTypeSetup';

    public DefaultVisible: boolean;
    public CreatedAt: Date;
    public OutgoingAccountNumber: number;
    public Name: string;
    public CreatedBy: string;
    public DirectJournalEntryOnly: boolean;
    public UpdatedAt: Date;
    public IsCompensated: boolean;
    public Deleted: boolean;
    public VatCodeGroupNo: string;
    public IncomingAccountNumber: number;
    public VatCode: string;
    public ReversedTaxDutyVat: boolean;
    public OutputVat: boolean;
    public UpdatedBy: string;
    public ID: number;
    public IsNotVatRegistered: boolean;
    public _createguid: string;
    public VatTypeSetupPercentages: Array<VatTypeSetupPercentage>;
    public CustomFields: any;
}


export class VatTypeSetupPercentage extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'VatTypeSetupPercentage';

    public ValidTo: LocalDate;
    public CreatedAt: Date;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public VatPercent: number;
    public ValidFrom: LocalDate;
    public VatTypeSetupID: number;
    public UpdatedBy: string;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class CompanyReport extends UniEntity {
    public static RelativeUrl = 'company-report';
    public static EntityType = 'CompanyReport';

    public CreatedAt: Date;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public ContractId: number;
    public CompanyKey: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public ReportDefinitionID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class ReportDefinition extends UniEntity {
    public static RelativeUrl = 'report-definitions';
    public static EntityType = 'ReportDefinition';

    public CreatedAt: Date;
    public Name: string;
    public ReportType: number;
    public CreatedBy: string;
    public ReportSource: string;
    public TemplateLinkId: string;
    public UpdatedAt: Date;
    public IsStandard: boolean;
    public Deleted: boolean;
    public UniqueReportID: string;
    public UpdatedBy: string;
    public ID: number;
    public Version: string;
    public Md5: string;
    public Visible: boolean;
    public Description: string;
    public Category: string;
    public CategoryLabel: string;
    public _createguid: string;
    public CustomFields: any;
}


export class ReportDefinitionDataSource extends UniEntity {
    public static RelativeUrl = 'report-definition-data-sources';
    public static EntityType = 'ReportDefinitionDataSource';

    public CreatedAt: Date;
    public Name: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public DataSourceUrl: string;
    public UpdatedBy: string;
    public ID: number;
    public ReportDefinitionId: number;
    public _createguid: string;
    public CustomFields: any;
}


export class ReportDefinitionParameter extends UniEntity {
    public static RelativeUrl = 'report-definition-parameters';
    public static EntityType = 'ReportDefinitionParameter';

    public DefaultValue: string;
    public CreatedAt: Date;
    public Name: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public DefaultValueLookupType: string;
    public Type: string;
    public UpdatedBy: string;
    public ID: number;
    public Label: string;
    public ReportDefinitionId: number;
    public DefaultValueSource: string;
    public Visible: boolean;
    public DefaultValueList: string;
    public _createguid: string;
    public CustomFields: any;
}


export class PeriodSeries extends UniEntity {
    public static RelativeUrl = 'period-series';
    public static EntityType = 'PeriodSeries';

    public CreatedAt: Date;
    public Name: string;
    public CreatedBy: string;
    public SeriesType: PeriodSeriesType;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public Active: boolean;
    public UpdatedBy: string;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class PeriodTemplate extends UniEntity {
    public static RelativeUrl = 'period-templates';
    public static EntityType = 'PeriodTemplate';

    public CreatedAt: Date;
    public Name: string;
    public CreatedBy: string;
    public FromDate: LocalDate;
    public UpdatedAt: Date;
    public PeriodSeriesID: number;
    public Deleted: boolean;
    public ToDate: LocalDate;
    public UpdatedBy: string;
    public ID: number;
    public No: number;
    public _createguid: string;
    public PeriodSeries: PeriodSeries;
    public CustomFields: any;
}


export class Model extends UniEntity {
    public static RelativeUrl = 'models';
    public static EntityType = 'Model';

    public CreatedAt: Date;
    public Name: string;
    public CreatedBy: string;
    public LabelPlural: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public Shared: boolean;
    public UpdatedBy: string;
    public ID: number;
    public Label: string;
    public Admin: boolean;
    public Description: string;
    public _createguid: string;
    public Fields: Array<Field>;
    public CustomFields: any;
}


export class Field extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Field';

    public CreatedAt: Date;
    public ModelID: number;
    public Name: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public HelpText: string;
    public UpdatedBy: string;
    public ID: number;
    public Label: string;
    public Description: string;
    public _createguid: string;
    public Model: Model;
    public CustomFields: any;
}


export class Notification extends UniEntity {
    public static RelativeUrl = 'notifications';
    public static EntityType = 'Notification';

    public Message: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public RecipientID: string;
    public UpdatedAt: Date;
    public CompanyName: string;
    public SenderDisplayName: string;
    public CompanyKey: string;
    public EntityID: number;
    public Deleted: boolean;
    public EntityType: string;
    public SourceEntityType: string;
    public SourceEntityID: number;
    public UpdatedBy: string;
    public ID: number;
    public StatusCode: number;
    public _createguid: string;
    public CustomFields: any;
}


export class CompanySettings extends UniEntity {
    public static RelativeUrl = 'companysettings';
    public static EntityType = 'CompanySettings';

    public LogoAlign: number;
    public UseFinancialDateToCalculateVatPercent: boolean;
    public CustomerAccountID: number;
    public InterrimPaymentAccountID: number;
    public InterrimRemitAccountID: number;
    public PaymentBankAgreementNumber: string;
    public CreatedAt: Date;
    public DefaultTOFCurrencySettingsID: number;
    public APIncludeAttachment: boolean;
    public AcceptableDelta4CustomerPaymentAccountID: number;
    public AllowAvtalegiroRegularInvoice: boolean;
    public AccountVisibilityGroupID: number;
    public AccountingLockedDate: LocalDate;
    public TaxableFromDate: LocalDate;
    public CreatedBy: string;
    public Factoring: number;
    public DefaultAddressID: number;
    public HideInActiveSuppliers: boolean;
    public UpdatedAt: Date;
    public Localization: string;
    public SaveCustomersFromQuoteAsLead: boolean;
    public DefaultDistributionsID: number;
    public RoundingNumberOfDecimals: number;
    public CompanyName: string;
    public DefaultSalesAccountID: number;
    public SalaryBankAccountID: number;
    public AgioLossAccountID: number;
    public VatReportFormID: number;
    public AutoDistributeInvoice: boolean;
    public APContactID: number;
    public TaxMandatoryType: number;
    public CustomerInvoiceReminderSettingsID: number;
    public DefaultCustomerQuoteReportID: number;
    public TaxBankAccountID: number;
    public OrganizationNumber: string;
    public RoundingType: RoundingType;
    public DefaultCustomerInvoiceReminderReportID: number;
    public HasAutobank: boolean;
    public APActivated: boolean;
    public ForceSupplierInvoiceApproval: boolean;
    public Deleted: boolean;
    public SettlementVatAccountID: number;
    public TwoStageAutobankEnabled: boolean;
    public AcceptableDelta4CustomerPayment: number;
    public BookCustomerInvoiceOnDeliveryDate: boolean;
    public UseNetsIntegration: boolean;
    public DefaultCustomerInvoiceReportID: number;
    public LogoFileID: number;
    public PeriodSeriesVatID: number;
    public DefaultPhoneID: number;
    public DefaultCustomerOrderReportID: number;
    public UseAssetRegister: boolean;
    public DefaultEmailID: number;
    public IgnorePaymentsWithoutEndToEndID: boolean;
    public UseXtraPaymentOrgXmlTag: boolean;
    public LogoHideField: number;
    public CompanyTypeID: number;
    public SAFTimportAccountID: number;
    public BankChargeAccountID: number;
    public OfficeMunicipalityNo: string;
    public AutoJournalPayment: string;
    public CompanyBankAccountID: number;
    public BatchInvoiceMinAmount: number;
    public SupplierAccountID: number;
    public FactoringEmailID: number;
    public XtraPaymentOrgXmlTagValue: string;
    public UpdatedBy: string;
    public GLN: string;
    public ID: number;
    public TaxableFromLimit: number;
    public BaseCurrencyCodeID: number;
    public UsePaymentBankValues: boolean;
    public StoreDistributedInvoice: boolean;
    public PeriodSeriesAccountID: number;
    public HideInActiveCustomers: boolean;
    public CustomerCreditDays: number;
    public UseOcrInterpretation: boolean;
    public AccountGroupSetID: number;
    public VatLockedDate: LocalDate;
    public FactoringNumber: number;
    public PaymentBankIdentification: string;
    public APGuid: string;
    public StatusCode: number;
    public WebAddress: string;
    public TaxMandatory: boolean;
    public ShowKIDOnCustomerInvoice: boolean;
    public NetsIntegrationActivated: boolean;
    public CompanyRegistered: boolean;
    public AgioGainAccountID: number;
    public ShowNumberOfDecimals: number;
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

    public CreatedAt: Date;
    public Name: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public EntityType: string;
    public UpdatedBy: string;
    public ID: number;
    public StatusCode: number;
    public _createguid: string;
    public Elements: Array<DistributionPlanElement>;
    public CustomFields: any;
}


export class DistributionPlanElement extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'DistributionPlanElement';

    public CreatedAt: Date;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public DistributionPlanID: number;
    public Deleted: boolean;
    public Priority: number;
    public DistributionPlanElementTypeID: number;
    public UpdatedBy: string;
    public ID: number;
    public StatusCode: number;
    public _createguid: string;
    public ElementType: DistributionPlanElementType;
    public CustomFields: any;
}


export class DistributionPlanElementType extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'DistributionPlanElementType';

    public CreatedAt: Date;
    public Name: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public StatusCode: number;
    public _createguid: string;
    public LegalEntities: Array<DistributionPlanElementTypeLegalEntity>;
    public CustomFields: any;
}


export class DistributionPlanElementTypeLegalEntity extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'DistributionPlanElementTypeLegalEntity';

    public CreatedAt: Date;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public EntityType: string;
    public DistributionPlanElementTypeID: number;
    public UpdatedBy: string;
    public ID: number;
    public StatusCode: number;
    public _createguid: string;
    public CustomFields: any;
}


export class Distributions extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Distributions';

    public CreatedAt: Date;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public CustomerInvoiceDistributionPlanID: number;
    public CustomerInvoiceReminderDistributionPlanID: number;
    public CustomerOrderDistributionPlanID: number;
    public Deleted: boolean;
    public AnnualStatementDistributionPlanID: number;
    public PayCheckDistributionPlanID: number;
    public UpdatedBy: string;
    public ID: number;
    public StatusCode: number;
    public CustomerQuoteDistributionPlanID: number;
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

    public CreatedAt: Date;
    public Name: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public StatusCode: number;
    public _createguid: string;
    public CustomFields: any;
}


export class EmailLog extends UniEntity {
    public static RelativeUrl = 'emails';
    public static EntityType = 'EmailLog';

    public From: string;
    public DistributeAt: LocalDate;
    public ExternalReference: string;
    public CreatedAt: Date;
    public ExternalMessage: string;
    public To: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public EntityID: number;
    public Deleted: boolean;
    public Type: SharingType;
    public JobRunExternalRef: string;
    public JobRunID: number;
    public EntityType: string;
    public UpdatedBy: string;
    public ID: number;
    public EntityDisplayValue: string;
    public StatusCode: number;
    public Subject: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Eventplan extends UniEntity {
    public static RelativeUrl = 'eventplans';
    public static EntityType = 'Eventplan';

    public CreatedAt: Date;
    public ModelFilter: string;
    public JobNames: string;
    public Name: string;
    public ExpressionFilter: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public SigningKey: string;
    public IsSystemPlan: boolean;
    public Deleted: boolean;
    public Cargo: string;
    public Active: boolean;
    public OperationFilter: string;
    public UpdatedBy: string;
    public PlanType: EventplanType;
    public ID: number;
    public StatusCode: number;
    public _createguid: string;
    public Subscribers: Array<EventSubscriber>;
    public CustomFields: any;
}


export class EventSubscriber extends UniEntity {
    public static RelativeUrl = 'eventsubscribers';
    public static EntityType = 'EventSubscriber';

    public CreatedAt: Date;
    public Name: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Endpoint: string;
    public Headers: string;
    public EventplanID: number;
    public Deleted: boolean;
    public Active: boolean;
    public UpdatedBy: string;
    public ID: number;
    public Authorization: string;
    public StatusCode: number;
    public _createguid: string;
    public Eventplan: Eventplan;
    public CustomFields: any;
}


export class Period extends UniEntity {
    public static RelativeUrl = 'periodes';
    public static EntityType = 'Period';

    public CreatedAt: Date;
    public Name: string;
    public AccountYear: number;
    public CreatedBy: string;
    public FromDate: LocalDate;
    public UpdatedAt: Date;
    public PeriodSeriesID: number;
    public Deleted: boolean;
    public ToDate: LocalDate;
    public PeriodTemplateID: number;
    public UpdatedBy: string;
    public ID: number;
    public StatusCode: number;
    public No: number;
    public _createguid: string;
    public PeriodTemplate: PeriodTemplate;
    public PeriodSeries: PeriodSeries;
    public CustomFields: any;
}


export class PredefinedDescription extends UniEntity {
    public static RelativeUrl = 'predefineddescriptions';
    public static EntityType = 'PredefinedDescription';

    public CreatedAt: Date;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public Type: PredefinedDescriptionType;
    public UpdatedBy: string;
    public ID: number;
    public Description: string;
    public StatusCode: number;
    public Code: string;
    public _createguid: string;
    public CustomFields: any;
}


export class ProductCategory extends UniEntity {
    public static RelativeUrl = 'productcategories';
    public static EntityType = 'ProductCategory';

    public CreatedAt: Date;
    public Name: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public Depth: number;
    public Comment: string;
    public Rght: number;
    public UpdatedBy: string;
    public ID: number;
    public Status: number;
    public Description: string;
    public StatusCode: number;
    public ParentID: number;
    public Lft: number;
    public _createguid: string;
    public CustomFields: any;
}


export class ProductCategoryLink extends UniEntity {
    public static RelativeUrl = 'productcategorylinks';
    public static EntityType = 'ProductCategoryLink';

    public ProductCategoryID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public ProductID: number;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public StatusCode: number;
    public _createguid: string;
    public ProductCategory: ProductCategory;
    public CustomFields: any;
}


export class Sharing extends UniEntity {
    public static RelativeUrl = 'sharings';
    public static EntityType = 'Sharing';

    public From: string;
    public DistributeAt: LocalDate;
    public ExternalReference: string;
    public CreatedAt: Date;
    public ExternalMessage: string;
    public To: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public EntityID: number;
    public Deleted: boolean;
    public Type: SharingType;
    public JobRunExternalRef: string;
    public JobRunID: number;
    public EntityType: string;
    public UpdatedBy: string;
    public ID: number;
    public EntityDisplayValue: string;
    public StatusCode: number;
    public Subject: string;
    public _createguid: string;
    public CustomFields: any;
}


export class StatusLog extends UniEntity {
    public static RelativeUrl = 'statuslogs';
    public static EntityType = 'StatusLog';

    public CreatedAt: Date;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public EntityID: number;
    public Deleted: boolean;
    public ToStatus: number;
    public EntityType: string;
    public UpdatedBy: string;
    public ID: number;
    public FromStatus: number;
    public _createguid: string;
    public CustomFields: any;
}


export class Tracelink extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Tracelink';

    public Date: Date;
    public CreatedAt: Date;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public SourceInstanceID: number;
    public DestinationInstanceID: number;
    public Deleted: boolean;
    public DestinationEntityName: string;
    public SourceEntityName: string;
    public UpdatedBy: string;
    public ID: number;
    public StatusCode: number;
    public _createguid: string;
    public CustomFields: any;
}


export class User extends UniEntity {
    public static RelativeUrl = 'users';
    public static EntityType = 'User';

    public CreatedAt: Date;
    public GlobalIdentity: string;
    public CreatedBy: string;
    public Email: string;
    public LastLogin: Date;
    public UpdatedAt: Date;
    public IsAutobankAdmin: boolean;
    public BankIntegrationUserName: string;
    public Deleted: boolean;
    public UserName: string;
    public DisplayName: string;
    public HasAgreedToImportDisclaimer: boolean;
    public UpdatedBy: string;
    public PhoneNumber: string;
    public ID: number;
    public Protected: boolean;
    public StatusCode: number;
    public EndDate: Date;
    public TwoFactorEnabled: boolean;
    public AuthPhoneNumber: string;
    public _createguid: string;
    public CustomFields: any;
}


export class UniQueryDefinition extends UniEntity {
    public static RelativeUrl = 'uniquerydefinitions';
    public static EntityType = 'UniQueryDefinition';

    public ClickUrl: string;
    public CreatedAt: Date;
    public Name: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public ClickParam: string;
    public Deleted: boolean;
    public ModuleID: number;
    public MainModelName: string;
    public UpdatedBy: string;
    public ID: number;
    public SortIndex: number;
    public IsShared: boolean;
    public Description: string;
    public Category: string;
    public StatusCode: number;
    public UserID: number;
    public Code: string;
    public SystemGeneratedQuery: boolean;
    public _createguid: string;
    public UniQueryFilters: Array<UniQueryFilter>;
    public UniQueryFields: Array<UniQueryField>;
    public CustomFields: any;
}


export class UniQueryField extends UniEntity {
    public static RelativeUrl = 'uniqueryfields';
    public static EntityType = 'UniQueryField';

    public CreatedAt: Date;
    public SumFunction: string;
    public CreatedBy: string;
    public FieldType: number;
    public Alias: string;
    public UpdatedAt: Date;
    public Header: string;
    public Deleted: boolean;
    public Index: number;
    public UpdatedBy: string;
    public Width: string;
    public ID: number;
    public UniQueryDefinitionID: number;
    public Path: string;
    public Field: string;
    public StatusCode: number;
    public _createguid: string;
    public CustomFields: any;
}


export class UniQueryFilter extends UniEntity {
    public static RelativeUrl = 'uniqueryfilters';
    public static EntityType = 'UniQueryFilter';

    public CreatedAt: Date;
    public Group: number;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Value: string;
    public Deleted: boolean;
    public Operator: string;
    public UpdatedBy: string;
    public ID: number;
    public UniQueryDefinitionID: number;
    public Field: string;
    public StatusCode: number;
    public _createguid: string;
    public CustomFields: any;
}


export class Team extends UniEntity {
    public static RelativeUrl = 'teams';
    public static EntityType = 'Team';

    public CreatedAt: Date;
    public Name: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public Depth: number;
    public Rght: number;
    public UpdatedBy: string;
    public ID: number;
    public DimensionsID: number;
    public StatusCode: number;
    public ParentID: number;
    public Lft: number;
    public _createguid: string;
    public Dimensions: Dimensions;
    public Positions: Array<TeamPosition>;
    public CustomFields: any;
}


export class TeamPosition extends UniEntity {
    public static RelativeUrl = 'teampositions';
    public static EntityType = 'TeamPosition';

    public RelatedSharedRoleId: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public FromDate: LocalDate;
    public Position: TeamPositionEnum;
    public UpdatedAt: Date;
    public ApproveOrder: number;
    public Deleted: boolean;
    public ToDate: LocalDate;
    public UpdatedBy: string;
    public ID: number;
    public StatusCode: number;
    public UserID: number;
    public TeamID: number;
    public _createguid: string;
    public Team: Team;
    public CustomFields: any;
}


export class ApprovalRule extends UniEntity {
    public static RelativeUrl = 'approvalrules';
    public static EntityType = 'ApprovalRule';

    public CreatedAt: Date;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public RuleType: ApprovalRuleType;
    public Deleted: boolean;
    public IndustryCodes: string;
    public UpdatedBy: string;
    public Keywords: string;
    public ID: number;
    public Description: string;
    public StatusCode: number;
    public _createguid: string;
    public Steps: Array<ApprovalRuleStep>;
    public CustomFields: any;
}


export class ApprovalRuleStep extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ApprovalRuleStep';

    public Limit: number;
    public CreatedAt: Date;
    public StepNumber: number;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public ApprovalRuleID: number;
    public UpdatedBy: string;
    public ID: number;
    public StatusCode: number;
    public UserID: number;
    public _createguid: string;
    public ApprovalRule: ApprovalRule;
    public User: User;
    public CustomFields: any;
}


export class ApprovalSubstitute extends UniEntity {
    public static RelativeUrl = 'approvalsubstitutes';
    public static EntityType = 'ApprovalSubstitute';

    public CreatedAt: Date;
    public CreatedBy: string;
    public FromDate: LocalDate;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public ToDate: LocalDate;
    public SubstituteUserID: number;
    public UpdatedBy: string;
    public ID: number;
    public StatusCode: number;
    public UserID: number;
    public _createguid: string;
    public User: User;
    public SubstituteUser: User;
    public CustomFields: any;
}


export class TaskApprovalPlan extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'TaskApprovalPlan';

    public Limit: number;
    public ApprovalID: number;
    public CreatedAt: Date;
    public Amount: number;
    public StepNumber: number;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public TaskID: number;
    public Deleted: boolean;
    public Comment: string;
    public ApprovalRuleID: number;
    public UpdatedBy: string;
    public ID: number;
    public StatusCode: number;
    public UserID: number;
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

    public CreatedAt: Date;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public Order: number;
    public EntityType: string;
    public UpdatedBy: string;
    public ID: number;
    public IsDepricated: boolean;
    public Description: string;
    public System: boolean;
    public StatusCode: number;
    public StatusCategoryID: number;
    public _createguid: string;
    public StatusCategory: StatusCategory;
    public CustomFields: any;
}


export class StatusCategory extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'StatusCategory';

    public CreatedAt: Date;
    public Name: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public StatusCategoryCode: StatusCategoryCode;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class StatusRemark extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'StatusRemark';

    public Remark: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public EntityID: number;
    public Deleted: boolean;
    public EntityType: string;
    public UpdatedBy: string;
    public ID: number;
    public StatusCode: number;
    public _createguid: string;
    public CustomFields: any;
}


export class Transition extends UniEntity {
    public static RelativeUrl = 'transitions';
    public static EntityType = 'Transition';

    public Controller: string;
    public CreatedAt: Date;
    public MethodName: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public EntityType: string;
    public UpdatedBy: string;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class TransitionThreshold extends UniEntity {
    public static RelativeUrl = 'thresholds';
    public static EntityType = 'TransitionThreshold';

    public CreatedAt: Date;
    public PropertyName: string;
    public CreatedBy: string;
    public SharedApproveTransitionId: number;
    public UpdatedAt: Date;
    public RejectStatusCode: number;
    public SharedRoleId: number;
    public SharedRejectTransitionId: number;
    public Value: string;
    public Deleted: boolean;
    public Disabled: boolean;
    public Operator: Operator;
    public UpdatedBy: string;
    public ID: number;
    public Operation: OperationType;
    public _createguid: string;
    public CustomFields: any;
}


export class TransitionThresholdApproval extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'TransitionThresholdApproval';

    public ApprovalID: number;
    public CreatedAt: Date;
    public PropertyName: string;
    public CreatedBy: string;
    public SharedApproveTransitionId: number;
    public UpdatedAt: Date;
    public RejectStatusCode: number;
    public SharedRoleId: number;
    public SharedRejectTransitionId: number;
    public Value: string;
    public Deleted: boolean;
    public Operator: Operator;
    public UpdatedBy: string;
    public ID: number;
    public Operation: OperationType;
    public _createguid: string;
    public Approval: Approval;
    public CustomFields: any;
}


export class Approval extends UniEntity {
    public static RelativeUrl = 'approvals';
    public static EntityType = 'Approval';

    public CreatedAt: Date;
    public Amount: number;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public TaskID: number;
    public SharedRoleId: number;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public StatusCode: number;
    public UserID: number;
    public _createguid: string;
    public Task: Task;
    public Thresholds: Array<TransitionThresholdApproval>;
    public User: User;
    public CustomFields: any;
}


export class Task extends UniEntity {
    public static RelativeUrl = 'tasks';
    public static EntityType = 'Task';

    public CreatedAt: Date;
    public ModelID: number;
    public CreatedBy: string;
    public SharedApproveTransitionId: number;
    public UpdatedAt: Date;
    public RejectStatusCode: number;
    public SharedRoleId: number;
    public SharedRejectTransitionId: number;
    public EntityID: number;
    public Deleted: boolean;
    public Type: TaskType;
    public Title: string;
    public UpdatedBy: string;
    public ID: number;
    public StatusCode: number;
    public UserID: number;
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

    public CreatedAt: Date;
    public TransitionID: number;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public ExpiresDate: Date;
    public FromStatusID: number;
    public Deleted: boolean;
    public EntityType: string;
    public UpdatedBy: string;
    public ToStatusID: number;
    public ID: number;
    public IsDepricated: boolean;
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
    public CreatedAt: Date;
    public Name: string;
    public Amount: number;
    public ProjectCustomerID: number;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public WorkPlaceAddressID: number;
    public EndDate: LocalDate;
    public PlannedEnddate: LocalDate;
    public ProjectNumberSeriesID: number;
    public ProjectNumberNumeric: number;
    public Deleted: boolean;
    public Total: number;
    public ProjectLeadName: string;
    public ProjectNumber: string;
    public StartDate: LocalDate;
    public UpdatedBy: string;
    public ID: number;
    public CostPrice: number;
    public DimensionsID: number;
    public Description: string;
    public PlannedStartdate: LocalDate;
    public StatusCode: number;
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

    public CreatedAt: Date;
    public Name: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public Responsibility: string;
    public ProjectID: number;
    public UpdatedBy: string;
    public ID: number;
    public StatusCode: number;
    public UserID: number;
    public _createguid: string;
    public ProjectUser: User;
    public CustomFields: any;
}


export class ProjectResourceSchedule extends UniEntity {
    public static RelativeUrl = 'projects-schedules-resources';
    public static EntityType = 'ProjectResourceSchedule';

    public CreatedAt: Date;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public ProjectTaskID: number;
    public Deleted: boolean;
    public ProjectResourceID: number;
    public UpdatedBy: string;
    public ID: number;
    public StatusCode: number;
    public ProjectTaskScheduleID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class ProjectTask extends UniEntity {
    public static RelativeUrl = 'projects-tasks';
    public static EntityType = 'ProjectTask';

    public Price: number;
    public CreatedAt: Date;
    public Name: string;
    public Amount: number;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public EndDate: LocalDate;
    public SuggestedNumber: string;
    public Deleted: boolean;
    public Total: number;
    public StartDate: LocalDate;
    public ProjectID: number;
    public UpdatedBy: string;
    public ID: number;
    public Number: string;
    public CostPrice: number;
    public Description: string;
    public StatusCode: number;
    public _createguid: string;
    public ProjectTaskSchedules: Array<ProjectTaskSchedule>;
    public ProjectTaskResources: Array<ProjectResourceSchedule>;
    public CustomFields: any;
}


export class ProjectTaskSchedule extends UniEntity {
    public static RelativeUrl = 'projects-tasks-schedules';
    public static EntityType = 'ProjectTaskSchedule';

    public CreatedAt: Date;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public EndDate: LocalDate;
    public ProjectTaskID: number;
    public Deleted: boolean;
    public StartDate: LocalDate;
    public UpdatedBy: string;
    public ID: number;
    public StatusCode: number;
    public _createguid: string;
    public ScheduleResources: Array<ProjectResourceSchedule>;
    public CustomFields: any;
}


export class BarnepassProduct extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'BarnepassProduct';

    public CreatedAt: Date;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public ProductID: number;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public StatusCode: number;
    public _createguid: string;
    public Product: Product;
    public CustomFields: any;
}


export class Product extends UniEntity {
    public static RelativeUrl = 'products';
    public static EntityType = 'Product';

    public CreatedAt: Date;
    public Name: string;
    public Unit: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public DefaultProductCategoryID: number;
    public PartName: string;
    public PriceIncVat: number;
    public Deleted: boolean;
    public ListPrice: number;
    public Type: ProductTypeEnum;
    public VariansParentID: number;
    public CalculateGrossPriceBasedOnNetPrice: boolean;
    public ImageFileID: number;
    public VatTypeID: number;
    public UpdatedBy: string;
    public ID: number;
    public AccountID: number;
    public CostPrice: number;
    public PriceExVat: number;
    public AverageCost: number;
    public DimensionsID: number;
    public Description: string;
    public StatusCode: number;
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

    public CreatedAt: Date;
    public Name: string;
    public AccountYear: number;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public ToNumber: number;
    public Empty: boolean;
    public NumberSeriesTypeID: number;
    public Deleted: boolean;
    public Disabled: boolean;
    public Comment: string;
    public NumberLock: boolean;
    public DisplayName: string;
    public UpdatedBy: string;
    public ID: number;
    public System: boolean;
    public UseNumbersFromNumberSeriesID: number;
    public StatusCode: number;
    public MainAccountID: number;
    public FromNumber: number;
    public NextNumber: number;
    public IsDefaultForTask: boolean;
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

    public NumberSerieTypeAID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public NumberSerieTypeBID: number;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public StatusCode: number;
    public _createguid: string;
    public NumberSerieTypeA: NumberSeriesType;
    public NumberSerieTypeB: NumberSeriesType;
    public CustomFields: any;
}


export class NumberSeriesTask extends UniEntity {
    public static RelativeUrl = 'number-series-tasks';
    public static EntityType = 'NumberSeriesTask';

    public CreatedAt: Date;
    public Name: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public EntityType: string;
    public UpdatedBy: string;
    public ID: number;
    public StatusCode: number;
    public _createguid: string;
    public NumberSeries: Array<NumberSeries>;
    public CustomFields: any;
}


export class NumberSeriesType extends UniEntity {
    public static RelativeUrl = 'number-series-types';
    public static EntityType = 'NumberSeriesType';

    public CreatedAt: Date;
    public Name: string;
    public CreatedBy: string;
    public EntitySeriesIDField: string;
    public UpdatedAt: Date;
    public EntityField: string;
    public Yearly: boolean;
    public Deleted: boolean;
    public EntityType: string;
    public UpdatedBy: string;
    public ID: number;
    public System: boolean;
    public StatusCode: number;
    public CanHaveSeveralActiveSeries: boolean;
    public _createguid: string;
    public Series: Array<NumberSeries>;
    public CustomFields: any;
}


export class EncryptionInfo extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'EncryptionInfo';

    public CreatedAt: Date;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public password: string;
    public Deleted: boolean;
    public type: Type;
    public UpdatedBy: string;
    public ID: number;
    public description: string;
    public _createguid: string;
    public CustomFields: any;
}


export class File extends UniEntity {
    public static RelativeUrl = 'files/{entitytype}/{entityid}';
    public static EntityType = 'File';

    public CreatedAt: Date;
    public Name: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public ContentType: string;
    public Deleted: boolean;
    public OCRData: string;
    public Size: string;
    public PermaLink: string;
    public UpdatedBy: string;
    public ID: number;
    public StorageReference: string;
    public Md5: string;
    public Pages: number;
    public encryptionID: number;
    public Description: string;
    public StatusCode: number;
    public UploadSlot: string;
    public _createguid: string;
    public FileTags: Array<FileTag>;
    public EntityLinks: Array<FileEntityLink>;
    public CustomFields: any;
}


export class FileTag extends UniEntity {
    public static RelativeUrl = 'filetags';
    public static EntityType = 'FileTag';

    public CreatedAt: Date;
    public CreatedBy: string;
    public FileID: number;
    public UpdatedAt: Date;
    public TagName: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public Status: number;
    public _createguid: string;
    public File: File;
    public CustomFields: any;
}


export class FileEntityLink extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'FileEntityLink';

    public CreatedAt: Date;
    public CreatedBy: string;
    public FileID: number;
    public UpdatedAt: Date;
    public EntityID: number;
    public Deleted: boolean;
    public IsAttachment: boolean;
    public EntityType: string;
    public UpdatedBy: string;
    public ID: number;
    public StatusCode: number;
    public _createguid: string;
    public File: File;
    public CustomFields: any;
}


export class ElsaUsageLog extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ElsaUsageLog';

    public ExternalReference: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Quantity: number;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public ProductType: string;
    public UpdatedBy: string;
    public ID: number;
    public DateLogged: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class AccessPointFormat extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AccessPointFormat';

    public IncommingID: number;
    public CreatedAt: Date;
    public Name: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public OutgoingID: number;
    public UpdatedBy: string;
    public ID: number;
    public Label: string;
    public ResourceName: string;
    public StatusCode: number;
    public _createguid: string;
    public CustomFields: any;
}


export class EHFLog extends UniEntity {
    public static RelativeUrl = 'ehf';
    public static EntityType = 'EHFLog';

    public From: string;
    public DistributeAt: LocalDate;
    public ExternalReference: string;
    public CreatedAt: Date;
    public ExternalMessage: string;
    public To: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public EntityID: number;
    public Deleted: boolean;
    public Type: SharingType;
    public JobRunExternalRef: string;
    public JobRunID: number;
    public EntityType: string;
    public UpdatedBy: string;
    public ID: number;
    public EntityDisplayValue: string;
    public StatusCode: number;
    public Subject: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Department extends UniEntity {
    public static RelativeUrl = 'departments';
    public static EntityType = 'Department';

    public DepartmentNumberNumeric: number;
    public CreatedAt: Date;
    public Name: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public DepartmentNumberSeriesID: number;
    public DepartmentManagerName: string;
    public UpdatedBy: string;
    public ID: number;
    public Description: string;
    public StatusCode: number;
    public DepartmentNumber: string;
    public _createguid: string;
    public DepartmentNumberSeries: NumberSeries;
    public CustomFields: any;
}


export class Dimension10 extends UniEntity {
    public static RelativeUrl = 'Dimension10';
    public static EntityType = 'Dimension10';

    public CreatedAt: Date;
    public Name: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public NumberNumeric: number;
    public UpdatedBy: string;
    public ID: number;
    public Number: string;
    public Description: string;
    public StatusCode: number;
    public _createguid: string;
    public CustomFields: any;
}


export class Dimension5 extends UniEntity {
    public static RelativeUrl = 'Dimension5';
    public static EntityType = 'Dimension5';

    public CreatedAt: Date;
    public Name: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public NumberNumeric: number;
    public UpdatedBy: string;
    public ID: number;
    public Number: string;
    public Description: string;
    public StatusCode: number;
    public _createguid: string;
    public CustomFields: any;
}


export class Dimension6 extends UniEntity {
    public static RelativeUrl = 'Dimension6';
    public static EntityType = 'Dimension6';

    public CreatedAt: Date;
    public Name: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public NumberNumeric: number;
    public UpdatedBy: string;
    public ID: number;
    public Number: string;
    public Description: string;
    public StatusCode: number;
    public _createguid: string;
    public CustomFields: any;
}


export class Dimension7 extends UniEntity {
    public static RelativeUrl = 'Dimension7';
    public static EntityType = 'Dimension7';

    public CreatedAt: Date;
    public Name: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public NumberNumeric: number;
    public UpdatedBy: string;
    public ID: number;
    public Number: string;
    public Description: string;
    public StatusCode: number;
    public _createguid: string;
    public CustomFields: any;
}


export class Dimension8 extends UniEntity {
    public static RelativeUrl = 'Dimension8';
    public static EntityType = 'Dimension8';

    public CreatedAt: Date;
    public Name: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public NumberNumeric: number;
    public UpdatedBy: string;
    public ID: number;
    public Number: string;
    public Description: string;
    public StatusCode: number;
    public _createguid: string;
    public CustomFields: any;
}


export class Dimension9 extends UniEntity {
    public static RelativeUrl = 'Dimension9';
    public static EntityType = 'Dimension9';

    public CreatedAt: Date;
    public Name: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public NumberNumeric: number;
    public UpdatedBy: string;
    public ID: number;
    public Number: string;
    public Description: string;
    public StatusCode: number;
    public _createguid: string;
    public CustomFields: any;
}


export class Dimensions extends UniEntity {
    public static RelativeUrl = 'dimensions';
    public static EntityType = 'Dimensions';

    public CreatedAt: Date;
    public Dimension6ID: number;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public ProjectTaskID: number;
    public Dimension8ID: number;
    public Deleted: boolean;
    public DepartmentID: number;
    public Dimension10ID: number;
    public Dimension9ID: number;
    public ProjectID: number;
    public Dimension5ID: number;
    public RegionID: number;
    public UpdatedBy: string;
    public ID: number;
    public Dimension7ID: number;
    public StatusCode: number;
    public ResponsibleID: number;
    public _createguid: string;
    public Region: Region;
    public Project: Project;
    public Department: Department;
    public Dimension5: Dimension5;
    public Dimension6: Dimension6;
    public Dimension7: Dimension7;
    public Dimension8: Dimension8;
    public Dimension9: Dimension9;
    public ProjectTask: ProjectTask;
    public Responsible: Responsible;
    public Dimension10: Dimension10;
    public Info: Array<DimensionsInfo>;
    public CustomFields: any;
}


export class DimensionsInfo extends UniEntity {
    public ProjectTaskNumber: string;
    public DepartmentName: string;
    public Dimension6Name: string;
    public Dimension5Name: string;
    public Dimension10Number: string;
    public Dimension10Name: string;
    public Dimension9Name: string;
    public Dimension7Name: string;
    public Dimension9Number: string;
    public Dimension7Number: string;
    public RegionCode: string;
    public ProjectTaskName: string;
    public Dimension6Number: string;
    public ResponsibleName: string;
    public ProjectNumber: string;
    public Dimension8Name: string;
    public ProjectName: string;
    public Dimension8Number: string;
    public ID: number;
    public RegionName: string;
    public DimensionsID: number;
    public Dimension5Number: string;
    public DepartmentNumber: string;
}


export class DimensionSettings extends UniEntity {
    public static RelativeUrl = 'dimensionsettings';
    public static EntityType = 'DimensionSettings';

    public CreatedAt: Date;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Dimension: number;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public Label: string;
    public IsActive: boolean;
    public StatusCode: number;
    public _createguid: string;
    public CustomFields: any;
}


export class Region extends UniEntity {
    public static RelativeUrl = 'regions';
    public static EntityType = 'Region';

    public CreatedAt: Date;
    public Name: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public CountryCode: string;
    public Deleted: boolean;
    public RegionCode: string;
    public UpdatedBy: string;
    public ID: number;
    public Description: string;
    public StatusCode: number;
    public _createguid: string;
    public CustomFields: any;
}


export class Responsible extends UniEntity {
    public static RelativeUrl = 'responsibles';
    public static EntityType = 'Responsible';

    public CreatedAt: Date;
    public Name: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public NameOfResponsible: string;
    public UpdatedBy: string;
    public ID: number;
    public Description: string;
    public StatusCode: number;
    public _createguid: string;
    public CustomFields: any;
}


export class Contract extends UniEntity {
    public static RelativeUrl = 'contracts';
    public static EntityType = 'Contract';

    public CreatedAt: Date;
    public Name: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public ContractCode: string;
    public Deleted: boolean;
    public TeamsUri: string;
    public UpdatedBy: string;
    public Engine: ContractEngine;
    public ID: number;
    public Description: string;
    public StatusCode: number;
    public Hash: string;
    public HashTransactionAddress: string;
    public _createguid: string;
    public Parameters: Array<ContractParameter>;
    public Triggers: Array<ContractTrigger>;
    public RunLogs: Array<ContractRunLog>;
    public CustomFields: any;
}


export class ContractAddress extends UniEntity {
    public static RelativeUrl = 'contractaddresses';
    public static EntityType = 'ContractAddress';

    public CreatedAt: Date;
    public Amount: number;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public ContractID: number;
    public Address: string;
    public EntityID: number;
    public Deleted: boolean;
    public Type: AddressType;
    public EntityType: string;
    public UpdatedBy: string;
    public ID: number;
    public AssetAddress: string;
    public ContractAssetID: number;
    public StatusCode: number;
    public _createguid: string;
    public Contract: Contract;
    public ContractAsset: ContractAsset;
    public CustomFields: any;
}


export class ContractAsset extends UniEntity {
    public static RelativeUrl = 'contractassets';
    public static EntityType = 'ContractAsset';

    public CreatedAt: Date;
    public IsTransferrable: boolean;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public ContractID: number;
    public Deleted: boolean;
    public Type: AddressType;
    public IsPrivate: boolean;
    public Cap: number;
    public UpdatedBy: string;
    public ID: number;
    public SpenderAttested: boolean;
    public IsFixedDenominations: boolean;
    public StatusCode: number;
    public IsIssuedByDefinerOnly: boolean;
    public IsAutoDestroy: boolean;
    public IsCosignedByDefiner: boolean;
    public _createguid: string;
    public Contract: Contract;
    public CustomFields: any;
}


export class ContractDebugLog extends UniEntity {
    public static RelativeUrl = 'contractdebuglogs';
    public static EntityType = 'ContractDebugLog';

    public Message: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public ContractID: number;
    public Deleted: boolean;
    public Type: ContractEventType;
    public UpdatedBy: string;
    public ID: number;
    public StatusCode: number;
    public ContractRunLogID: number;
    public _createguid: string;
    public Contract: Contract;
    public ContractRunLog: ContractRunLog;
    public CustomFields: any;
}


export class ContractParameter extends UniEntity {
    public static RelativeUrl = 'contractparameters';
    public static EntityType = 'ContractParameter';

    public CreatedAt: Date;
    public Name: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public ContractID: number;
    public Value: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public StatusCode: number;
    public _createguid: string;
    public Contract: Contract;
    public CustomFields: any;
}


export class ContractRunLog extends UniEntity {
    public static RelativeUrl = 'contractrunlogs';
    public static EntityType = 'ContractRunLog';

    public Message: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public ContractID: number;
    public RunTime: string;
    public Deleted: boolean;
    public ContractTriggerID: number;
    public Type: ContractEventType;
    public UpdatedBy: string;
    public ID: number;
    public StatusCode: number;
    public _createguid: string;
    public Contract: Contract;
    public CustomFields: any;
}


export class ContractTransaction extends UniEntity {
    public static RelativeUrl = 'contracttransactions';
    public static EntityType = 'ContractTransaction';

    public CreatedAt: Date;
    public Amount: number;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public ContractID: number;
    public SenderAddress: string;
    public Deleted: boolean;
    public ReceiverAddress: string;
    public UpdatedBy: string;
    public ID: number;
    public ContractAddressID: number;
    public AssetAddress: string;
    public StatusCode: number;
    public _createguid: string;
    public Contract: Contract;
    public ContractAddress: ContractAddress;
    public CustomFields: any;
}


export class ContractTrigger extends UniEntity {
    public static RelativeUrl = 'contracttriggers';
    public static EntityType = 'ContractTrigger';

    public CreatedAt: Date;
    public ModelFilter: string;
    public ExpressionFilter: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public ContractID: number;
    public Deleted: boolean;
    public Type: ContractEventType;
    public OperationFilter: string;
    public UpdatedBy: string;
    public ID: number;
    public StatusCode: number;
    public _createguid: string;
    public Contract: Contract;
    public CustomFields: any;
}


export class Comment extends UniEntity {
    public static RelativeUrl = 'comments';
    public static EntityType = 'Comment';

    public CreatedAt: Date;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public EntityID: number;
    public Deleted: boolean;
    public AuthorID: number;
    public EntityType: string;
    public UpdatedBy: string;
    public ID: number;
    public StatusCode: number;
    public Text: string;
    public _createguid: string;
    public Mentioned: Array<Mentioned>;
    public Author: User;
    public CustomFields: any;
}


export class Mentioned extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Mentioned';

    public CreatedAt: Date;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public StatusCode: number;
    public UserID: number;
    public CommentID: number;
    public _createguid: string;
    public User: User;
    public CustomFields: any;
}


export class ApiKey extends UniEntity {
    public static RelativeUrl = 'apikeys';
    public static EntityType = 'ApiKey';

    public CreatedAt: Date;
    public IntegrationType: TypeOfIntegration;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Encrypt: boolean;
    public Deleted: boolean;
    public FilterDate: LocalDate;
    public UpdatedBy: string;
    public ID: number;
    public IntegrationKey: string;
    public Url: string;
    public Description: string;
    public StatusCode: number;
    public ExternalId: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Altinn extends UniEntity {
    public static RelativeUrl = 'altinn';
    public static EntityType = 'Altinn';

    public CreatedAt: Date;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public SystemID: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public PreferredLogin: TypeOfLogin;
    public Language: string;
    public StatusCode: number;
    public SystemPw: string;
    public _createguid: string;
    public CustomFields: any;
}


export class AltinnReceipt extends UniEntity {
    public static RelativeUrl = 'altinnreceipts';
    public static EntityType = 'AltinnReceipt';

    public CreatedAt: Date;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public ReceiptID: number;
    public UserSign: string;
    public Deleted: boolean;
    public ErrorText: string;
    public XmlReceipt: string;
    public UpdatedBy: string;
    public ID: number;
    public Form: string;
    public TimeStamp: Date;
    public StatusCode: number;
    public AltinnResponseData: string;
    public HasBeenRegistered: boolean;
    public _createguid: string;
    public Signings: Array<AltinnSigning>;
    public CustomFields: any;
}


export class AltinnSigning extends UniEntity {
    public static RelativeUrl = 'altinnsigning';
    public static EntityType = 'AltinnSigning';

    public CreatedAt: Date;
    public StatusText: string;
    public SignatureText: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public SignatureReference: string;
    public Deleted: boolean;
    public AltinnReceiptID: number;
    public UpdatedBy: string;
    public ID: number;
    public DateSigned: Date;
    public StatusCode: number;
    public _createguid: string;
    public AltinnReceipt: AltinnReceipt;
    public CustomFields: any;
}


export class Barnepass extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Barnepass';

    public CreatedAt: Date;
    public inntektsaar: number;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public StatusCode: number;
    public _createguid: string;
    public oppgave: Array<BarnepassOppgave>;
    public CustomFields: any;
}


export class BarnepassOppgave extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'BarnepassOppgave';

    public CreatedAt: Date;
    public foedselsnummer: string;
    public CreatedBy: string;
    public email: string;
    public UpdatedAt: Date;
    public navn: string;
    public Deleted: boolean;
    public paaloeptBeloep: number;
    public BarnepassID: number;
    public UpdatedBy: string;
    public ID: number;
    public StatusCode: number;
    public _createguid: string;
    public CustomFields: any;
}


export class UserRole extends UniEntity {
    public static RelativeUrl = 'userroles';
    public static EntityType = 'UserRole';

    public CreatedAt: Date;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public SharedRoleId: number;
    public Deleted: boolean;
    public SharedRoleName: string;
    public UpdatedBy: string;
    public ID: number;
    public UserID: number;
    public _createguid: string;
    public User: User;
    public CustomFields: any;
}


export class Role extends UniEntity {
    public static RelativeUrl = 'roles';
    public static EntityType = 'Role';

    public CreatedAt: Date;
    public Name: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public Label: string;
    public Description: string;
    public _createguid: string;
    public RolePermissions: Array<RolePermission>;
    public CustomFields: any;
}


export class RolePermission extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'RolePermission';

    public CreatedAt: Date;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public PermissionID: number;
    public UpdatedBy: string;
    public ID: number;
    public RoleID: number;
    public _createguid: string;
    public Role: Role;
    public Permission: Permission;
    public CustomFields: any;
}


export class Permission extends UniEntity {
    public static RelativeUrl = 'permissions';
    public static EntityType = 'Permission';

    public CreatedAt: Date;
    public Name: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public _createguid: string;
    public RolePermissions: Array<RolePermission>;
    public CustomFields: any;
}


export class AvtaleGiroAgreement extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AvtaleGiroAgreement';

    public CreatedAt: Date;
    public Thumbprint: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public DataSender: string;
    public UpdatedBy: string;
    public ID: number;
    public KeyPath: string;
    public Description: string;
    public NextNumber: number;
    public _createguid: string;
    public CustomFields: any;
}


export class AvtaleGiroBankAccount extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AvtaleGiroBankAccount';

    public BankAccountNumber: string;
    public CreatedAt: Date;
    public AvtaleGiroAgreementID: number;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public CompanyID: number;
    public UpdatedBy: string;
    public ID: number;
    public _createguid: string;
    public Company: Company;
    public CustomFields: any;
}


export class AvtaleGiroFile extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AvtaleGiroFile';

    public CreatedAt: Date;
    public AvtaleGiroContent: string;
    public AvtaleGiroAgreementID: number;
    public CreatedBy: string;
    public FileID: number;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public AvtaleGiroMergedFileID: number;
    public CompanyID: number;
    public UpdatedBy: string;
    public ID: number;
    public _createguid: string;
    public Company: Company;
    public CustomFields: any;
}


export class AvtaleGiroMergedFile extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AvtaleGiroMergedFile';

    public CreatedAt: Date;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public TransmissionNumber: number;
    public _createguid: string;
    public CustomFields: any;
}


export class BankAgreement extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'BankAgreement';

    public OrderMobile: string;
    public CustomerOrgNumber: string;
    public CreatedAt: Date;
    public AccountOwnerOrgNumber: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public ReceiptID: string;
    public OrderEmail: string;
    public Deleted: boolean;
    public ServiceID: string;
    public CompanyID: number;
    public UpdatedBy: string;
    public ID: number;
    public ReceiptDate: Date;
    public AccountOwnerName: string;
    public CustomerName: string;
    public ServiceAccountID: number;
    public OrderName: string;
    public _createguid: string;
    public ServiceAccount: ServiceAccount;
    public Company: Company;
    public Services: Array<BankService>;
    public CustomFields: any;
}


export class BankService extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'BankService';

    public CreatedAt: Date;
    public KidRule: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public DivisionName: string;
    public Deleted: boolean;
    public ConfirmInNetbank: boolean;
    public ServiceType: number;
    public UpdatedBy: string;
    public ID: number;
    public DivisionID: number;
    public BankAgreementID: number;
    public FileType: string;
    public _createguid: string;
    public BankAgreement: BankAgreement;
    public BankAccounts: Array<BankServiceBankAccount>;
    public CustomFields: any;
}


export class BankServiceBankAccount extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'BankServiceBankAccount';

    public CreatedAt: Date;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public AccountNumber: string;
    public BankServiceID: number;
    public _createguid: string;
    public BankService: BankService;
    public CustomFields: any;
}


export class Company extends UniEntity {
    public static RelativeUrl = 'companies';
    public static EntityType = 'Company';

    public ConnectionString: string;
    public SchemaName: string;
    public CreatedAt: Date;
    public ClientNumber: number;
    public Name: string;
    public CreatedBy: string;
    public IsTemplate: boolean;
    public UpdatedAt: Date;
    public IsTest: boolean;
    public WebHookSubscriberId: string;
    public OrganizationNumber: string;
    public Deleted: boolean;
    public Key: string;
    public FileFlowEmail: string;
    public UpdatedBy: string;
    public ID: number;
    public IsGlobalTemplate: boolean;
    public LastActivity: Date;
    public FileFlowOrgnrEmail: string;
    public _createguid: string;
    public CustomFields: any;
}


export class CompanyAccess extends UniEntity {
    public static RelativeUrl = 'companies-access';
    public static EntityType = 'CompanyAccess';

    public CreatedAt: Date;
    public GlobalIdentity: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public EndDate: Date;
    public Roles: string;
    public Deleted: boolean;
    public CompanyID: number;
    public StartDate: Date;
    public UpdatedBy: string;
    public ID: number;
    public StatusCode: number;
    public _createguid: string;
    public CustomFields: any;
}


export class CompanyBackup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'CompanyBackup';

    public SchemaName: string;
    public Message: string;
    public CreatedAt: Date;
    public Reason: string;
    public CreatedBy: string;
    public CopyFiles: boolean;
    public UpdatedAt: Date;
    public OrgNumber: string;
    public CompanyName: string;
    public ContractID: number;
    public CompanyKey: string;
    public Deleted: boolean;
    public ContainerName: string;
    public DeletedAt: Date;
    public BackupStatus: BackupStatus;
    public ContractType: number;
    public ScheduledForDeleteAt: Date;
    public UpdatedBy: string;
    public ID: number;
    public CloudBlobName: string;
    public CustomerName: string;
    public Environment: string;
    public _createguid: string;
    public CustomFields: any;
}


export class ContractCron extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ContractCron';

    public CreatedAt: Date;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public ContractID: number;
    public Deleted: boolean;
    public ContractTriggerID: number;
    public CompanyID: number;
    public UpdatedBy: string;
    public ID: number;
    public Expression: string;
    public CompanyKey: string;
    public CompanyDbName: string;
    public _createguid: string;
    public CustomFields: any;
}


export class ContractObyte extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ContractObyte';

    public CreatedAt: Date;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public ContractID: number;
    public Address: string;
    public Deleted: boolean;
    public CompanyID: number;
    public UpdatedBy: string;
    public ID: number;
    public ContractAddressID: number;
    public AssetAddress: string;
    public CompanyKey: string;
    public CompanyDbName: string;
    public _createguid: string;
    public CustomFields: any;
}


export class DeniedUserAccessLog extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'DeniedUserAccessLog';

    public Message: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Email: string;
    public UpdatedAt: Date;
    public CompanyName: string;
    public Deleted: boolean;
    public Username: string;
    public CompanyID: number;
    public UpdatedBy: string;
    public ID: number;
    public Occurred: Date;
    public _createguid: string;
    public Company: Company;
    public CustomFields: any;
}


export class FailedBankFile extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'FailedBankFile';

    public CreatedAt: Date;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public CompanyKey: string;
    public Deleted: boolean;
    public FileContent: string;
    public UpdatedBy: string;
    public ID: number;
    public FileName: string;
    public FailedReason: FailedReasonEnum;
    public _createguid: string;
    public CustomFields: any;
}


export class HangfireJob extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'HangfireJob';

    public CreatedAt: Date;
    public GlobalIdentity: string;
    public UpdatedAt: Date;
    public CompanyKey: string;
    public Year: number;
    public CompanyID: number;
    public ID: number;
    public HasError: boolean;
    public Status: number;
    public Completed: boolean;
    public JobId: string;
    public CustomFields: any;
}


export class HangfireJobContext extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'HangfireJobContext';

    public SchemaName: string;
    public CreatedAt: Date;
    public GlobalIdentity: string;
    public UpdatedAt: Date;
    public CompanyKey: string;
    public Year: number;
    public CompanyID: number;
    public ID: number;
    public HasError: boolean;
    public Status: number;
    public Completed: boolean;
    public JobId: string;
    public CustomFields: any;
}


export class HangfireResponse extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'HangfireResponse';

    public CreatedAt: Date;
    public ProgressUrl: string;
    public GlobalIdentity: string;
    public State: string;
    public UpdatedAt: Date;
    public CompanyKey: string;
    public Year: number;
    public CompanyID: number;
    public ID: number;
    public HasError: boolean;
    public Status: number;
    public Completed: boolean;
    public JobId: string;
    public CustomFields: any;
}


export class KpiDefinition extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'KpiDefinition';

    public CreatedAt: Date;
    public IsPerUser: boolean;
    public Interval: string;
    public Name: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Application: string;
    public Deleted: boolean;
    public RoleNames: string;
    public CompanyID: number;
    public UpdatedBy: string;
    public ID: number;
    public RefreshModels: string;
    public SourceType: KpiSourceType;
    public ValueType: KpiValueType;
    public Route: string;
    public _createguid: string;
    public CustomFields: any;
}


export class KpiValue extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'KpiValue';

    public LastUpdated: Date;
    public ValueStatus: KpiValueStatus;
    public CreatedAt: Date;
    public KpiDefinitionID: number;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public Total: number;
    public CompanyID: number;
    public UpdatedBy: string;
    public ID: number;
    public Text: string;
    public UserIdentity: string;
    public Counter: number;
    public KpiName: string;
    public _createguid: string;
    public CustomFields: any;
}


export class OutgoingInvoice extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'OutgoingInvoice';

    public ExternalReference: string;
    public CreatedAt: Date;
    public InvoiceID: number;
    public Amount: number;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public InvoiceType: OutgoingInvoiceType;
    public CompanyID: number;
    public UpdatedBy: string;
    public ID: number;
    public RecipientOrganizationNumber: string;
    public Status: number;
    public MetaJson: string;
    public DueDate: Date;
    public RecipientPhoneNumber: string;
    public ISPOrganizationNumber: string;
    public StatusCode: number;
    public _createguid: string;
    public Company: Company;
    public CustomFields: any;
}


export class ProcessFileLog extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ProcessFileLog';

    public Message: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public FileID: number;
    public UpdatedAt: Date;
    public CompanyName: string;
    public CompanyKey: string;
    public Deleted: boolean;
    public EntityCount: number;
    public EntityName: string;
    public CompanyID: number;
    public UpdatedBy: string;
    public ID: number;
    public StatusCode: number;
    public FileName: string;
    public FileType: number;
    public EntityInstanceID: string;
    public UserIdentity: string;
    public _createguid: string;
    public Company: Company;
    public CustomFields: any;
}


export class ServiceAccount extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ServiceAccount';

    public CreatedAt: Date;
    public Thumbprint: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public DataSender: string;
    public UpdatedBy: string;
    public ID: number;
    public KeyPath: string;
    public Description: string;
    public NextNumber: number;
    public _createguid: string;
    public CustomFields: any;
}


export class UserVerification extends UniEntity {
    public static RelativeUrl = 'user-verifications';
    public static EntityType = 'UserVerification';

    public VerificationCode: string;
    public CreatedAt: Date;
    public ExpirationDate: Date;
    public CreatedBy: string;
    public Email: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public VerificationDate: Date;
    public CompanyId: number;
    public DisplayName: string;
    public UpdatedBy: string;
    public ID: number;
    public StatusCode: number;
    public UserId: number;
    public _createguid: string;
    public CustomFields: any;
}


export class Account extends UniEntity {
    public static RelativeUrl = 'accounts';
    public static EntityType = 'Account';

    public UseVatDeductionGroupID: number;
    public CreatedAt: Date;
    public SaftMappingAccountID: number;
    public AccountGroupID: number;
    public CreatedBy: string;
    public UsePostPost: boolean;
    public UpdatedAt: Date;
    public TopLevelAccountGroupID: number;
    public Locked: boolean;
    public Deleted: boolean;
    public Active: boolean;
    public AccountName: string;
    public VatTypeID: number;
    public CustomerID: number;
    public SystemAccount: boolean;
    public CurrencyCodeID: number;
    public UpdatedBy: string;
    public Keywords: string;
    public EmployeeID: number;
    public ID: number;
    public AccountID: number;
    public DoSynchronize: boolean;
    public LockManualPosts: boolean;
    public AccountNumber: number;
    public Visible: boolean;
    public DimensionsID: number;
    public Description: string;
    public SupplierID: number;
    public StatusCode: number;
    public AccountSetupID: number;
    public CostAllocationID: number;
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

    public CreatedAt: Date;
    public Name: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public AccountID: number;
    public StatusCode: number;
    public _createguid: string;
    public CustomFields: any;
}


export class AccountGroup extends UniEntity {
    public static RelativeUrl = 'accountgroups';
    public static EntityType = 'AccountGroup';

    public CompatibleAccountID: number;
    public CreatedAt: Date;
    public Name: string;
    public CreatedBy: string;
    public GroupNumber: string;
    public UpdatedAt: Date;
    public Summable: boolean;
    public Deleted: boolean;
    public AccountGroupSetupID: number;
    public UpdatedBy: string;
    public ID: number;
    public MainGroupID: number;
    public AccountID: number;
    public AccountGroupSetID: number;
    public StatusCode: number;
    public _createguid: string;
    public MainGroup: AccountGroup;
    public AccountGroupSet: AccountGroupSet;
    public CustomFields: any;
}


export class AccountGroupSet extends UniEntity {
    public static RelativeUrl = 'accountgroupsets';
    public static EntityType = 'AccountGroupSet';

    public CreatedAt: Date;
    public Name: string;
    public CreatedBy: string;
    public FromAccountNumber: number;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public Shared: boolean;
    public ToAccountNumber: number;
    public SubAccountAllowed: boolean;
    public UpdatedBy: string;
    public ID: number;
    public System: boolean;
    public StatusCode: number;
    public _createguid: string;
    public CustomFields: any;
}


export class AccountMandatoryDimension extends UniEntity {
    public static RelativeUrl = 'accountmandatorydimension';
    public static EntityType = 'AccountMandatoryDimension';

    public CreatedAt: Date;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public MandatoryType: number;
    public Deleted: boolean;
    public DimensionNo: number;
    public UpdatedBy: string;
    public ID: number;
    public AccountID: number;
    public StatusCode: number;
    public _createguid: string;
    public CustomFields: any;
}


export class Accrual extends UniEntity {
    public static RelativeUrl = 'accruals';
    public static EntityType = 'Accrual';

    public BalanceAccountID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public AccrualJournalEntryMode: number;
    public JournalEntryLineDraftID: number;
    public UpdatedBy: string;
    public AccrualAmount: number;
    public ID: number;
    public StatusCode: number;
    public ResultAccountID: number;
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

    public CreatedAt: Date;
    public Amount: number;
    public AccountYear: number;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public AccrualID: number;
    public Deleted: boolean;
    public PeriodNo: number;
    public UpdatedBy: string;
    public ID: number;
    public StatusCode: number;
    public JournalEntryDraftLineID: number;
    public _createguid: string;
    public Accrual: Accrual;
    public JournalEntryLineDraft: JournalEntryLineDraft;
    public CustomFields: any;
}


export class Asset extends UniEntity {
    public static RelativeUrl = 'assets';
    public static EntityType = 'Asset';

    public BalanceAccountID: number;
    public CreatedAt: Date;
    public Name: string;
    public Lifetime: number;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public DepreciationAccountID: number;
    public DepreciationCycle: number;
    public PurchaseAmount: number;
    public AssetGroupCode: string;
    public Deleted: boolean;
    public PurchaseDate: LocalDate;
    public NetFinancialValue: number;
    public DepreciationStartDate: LocalDate;
    public UpdatedBy: string;
    public ID: number;
    public DimensionsID: number;
    public AutoDepreciation: boolean;
    public StatusCode: number;
    public ScrapValue: number;
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

    public CreatedAt: Date;
    public Name: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public AddressID: number;
    public PhoneID: number;
    public Deleted: boolean;
    public InitialBIC: string;
    public UpdatedBy: string;
    public ID: number;
    public BIC: string;
    public StatusCode: number;
    public EmailID: number;
    public Web: string;
    public _createguid: string;
    public Address: Address;
    public Phone: Phone;
    public Email: Email;
    public CustomFields: any;
}


export class BankAccount extends UniEntity {
    public static RelativeUrl = 'bankaccounts';
    public static EntityType = 'BankAccount';

    public CreatedAt: Date;
    public CreatedBy: string;
    public BankID: number;
    public BankAccountType: string;
    public UpdatedAt: Date;
    public IntegrationSettings: string;
    public CompanySettingsID: number;
    public BusinessRelationID: number;
    public Locked: boolean;
    public Deleted: boolean;
    public IntegrationStatus: number;
    public IBAN: string;
    public UpdatedBy: string;
    public ID: number;
    public Label: string;
    public AccountID: number;
    public AccountNumber: string;
    public StatusCode: number;
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

    public CreatedAt: Date;
    public Name: string;
    public HasOrderedIntegrationChange: boolean;
    public ServiceProvider: number;
    public CreatedBy: string;
    public Email: string;
    public IsInbound: boolean;
    public UpdatedAt: Date;
    public PropertiesJson: string;
    public IsOutgoing: boolean;
    public BankAcceptance: boolean;
    public Deleted: boolean;
    public ServiceID: string;
    public HasNewAccountInformation: boolean;
    public IsBankBalance: boolean;
    public UpdatedBy: string;
    public ID: number;
    public ServiceTemplateID: string;
    public StatusCode: number;
    public DefaultAgreement: boolean;
    public BankAccountID: number;
    public Password: string;
    public _createguid: string;
    public BankAccount: BankAccount;
    public CustomFields: any;
}


export class BankRule extends UniEntity {
    public static RelativeUrl = 'bankrules';
    public static EntityType = 'BankRule';

    public CreatedAt: Date;
    public Name: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Rule: string;
    public Deleted: boolean;
    public Priority: number;
    public UpdatedBy: string;
    public ID: number;
    public AccountID: number;
    public IsActive: boolean;
    public ActionCode: ActionCodeBankRule;
    public StatusCode: number;
    public _createguid: string;
    public Account: Account;
    public CustomFields: any;
}


export class BankStatement extends UniEntity {
    public static RelativeUrl = 'bankstatements';
    public static EntityType = 'BankStatement';

    public CreatedAt: Date;
    public AmountCurrency: number;
    public Amount: number;
    public EndBalance: number;
    public CreatedBy: string;
    public FromDate: LocalDate;
    public FileID: number;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public ToDate: LocalDate;
    public StartBalance: number;
    public CurrencyCode: string;
    public UpdatedBy: string;
    public ID: number;
    public AccountID: number;
    public ArchiveReference: string;
    public StatusCode: number;
    public BankAccountID: number;
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

    public CID: string;
    public CreatedAt: Date;
    public AmountCurrency: number;
    public Amount: number;
    public ValueDate: LocalDate;
    public StructuredReference: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Receivername: string;
    public SenderAccount: string;
    public SenderName: string;
    public BookingDate: LocalDate;
    public Deleted: boolean;
    public TransactionId: string;
    public OpenAmountCurrency: number;
    public BankStatementID: number;
    public ReceiverAccount: string;
    public CurrencyCode: string;
    public UpdatedBy: string;
    public ID: number;
    public ArchiveReference: string;
    public OpenAmount: number;
    public Description: string;
    public Category: string;
    public InvoiceNumber: string;
    public StatusCode: number;
    public _createguid: string;
    public BankStatement: BankStatement;
    public CustomFields: any;
}


export class BankStatementMatch extends UniEntity {
    public static RelativeUrl = 'bankstatementmatch';
    public static EntityType = 'BankStatementMatch';

    public CreatedAt: Date;
    public Group: string;
    public Amount: number;
    public BankStatementEntryID: number;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public JournalEntryLineID: number;
    public StatusCode: number;
    public Batch: string;
    public _createguid: string;
    public BankStatementEntry: BankStatementEntry;
    public JournalEntryLine: JournalEntryLine;
    public CustomFields: any;
}


export class BankStatementRule extends UniEntity {
    public static RelativeUrl = 'bankstatementrules';
    public static EntityType = 'BankStatementRule';

    public CreatedAt: Date;
    public Name: string;
    public EntryText: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Rule: string;
    public Deleted: boolean;
    public Priority: number;
    public UpdatedBy: string;
    public ID: number;
    public AccountID: number;
    public IsActive: boolean;
    public DimensionsID: number;
    public StatusCode: number;
    public _createguid: string;
    public Dimensions: Dimensions;
    public Account: Account;
    public CustomFields: any;
}


export class Budget extends UniEntity {
    public static RelativeUrl = 'budgets';
    public static EntityType = 'Budget';

    public CreatedAt: Date;
    public Name: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public AccountingYear: number;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public StatusCode: number;
    public _createguid: string;
    public Entries: Array<BudgetEntry>;
    public CustomFields: any;
}


export class BudgetEntry extends UniEntity {
    public static RelativeUrl = 'budgetentries';
    public static EntityType = 'BudgetEntry';

    public CreatedAt: Date;
    public Amount: number;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public PeriodNumber: number;
    public AccountID: number;
    public DimensionsID: number;
    public BudgetID: number;
    public StatusCode: number;
    public _createguid: string;
    public Budget: Budget;
    public Account: Account;
    public Dimensions: Dimensions;
    public CustomFields: any;
}


export class CompanyAccountingSettings extends UniEntity {
    public static RelativeUrl = 'companyaccountingsettings';
    public static EntityType = 'CompanyAccountingSettings';

    public CreatedAt: Date;
    public AssetSaleProductID: number;
    public AssetSaleProfitNoVatAccountID: number;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public AssetWriteoffAccountID: number;
    public ReInvoicingCostsharingProductID: number;
    public AssetSaleLossNoVatAccountID: number;
    public Deleted: boolean;
    public ReInvoicingTurnoverProductID: number;
    public AssetSaleLossBalancingAccountID: number;
    public AssetSaleProfitBalancingAccountID: number;
    public UpdatedBy: string;
    public AssetSaleProfitVatAccountID: number;
    public ID: number;
    public AssetSaleLossVatAccountID: number;
    public ReInvoicingMethod: number;
    public StatusCode: number;
    public _createguid: string;
    public ReInvoicingCostsharingProduct: Product;
    public ReInvoicingTurnoverProduct: Product;
    public CustomFields: any;
}


export class CompanyBankAccount extends UniEntity {
    public static RelativeUrl = 'companybankaccounts';
    public static EntityType = 'CompanyBankAccount';

    public CreatedAt: Date;
    public IsTax: boolean;
    public Name: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public CreditAmount: number;
    public IsOutgoing: boolean;
    public Deleted: boolean;
    public IsIncomming: boolean;
    public UpdatedBy: string;
    public ID: number;
    public AccountID: number;
    public IsSalary: boolean;
    public StatusCode: number;
    public BankAccountID: number;
    public _createguid: string;
    public BankAccount: BankAccount;
    public Account: Account;
    public CustomFields: any;
}


export class CostAllocation extends UniEntity {
    public static RelativeUrl = 'costallocations';
    public static EntityType = 'CostAllocation';

    public CreatedAt: Date;
    public Name: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public StatusCode: number;
    public _createguid: string;
    public Items: Array<CostAllocationItem>;
    public CustomFields: any;
}


export class CostAllocationItem extends UniEntity {
    public static RelativeUrl = 'costallocationitems';
    public static EntityType = 'CostAllocationItem';

    public CreatedAt: Date;
    public Percent: number;
    public Amount: number;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public VatTypeID: number;
    public UpdatedBy: string;
    public ID: number;
    public AccountID: number;
    public DimensionsID: number;
    public Description: string;
    public StatusCode: number;
    public CostAllocationID: number;
    public _createguid: string;
    public Account: Account;
    public VatType: VatType;
    public Dimensions: Dimensions;
    public CustomFields: any;
}


export class CustomLiquidityPayment extends UniEntity {
    public static RelativeUrl = 'liquiditypayment';
    public static EntityType = 'CustomLiquidityPayment';

    public CreatedAt: Date;
    public AmountCurrency: number;
    public Amount: number;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public EndDate: LocalDate;
    public IsCustomerPayment: boolean;
    public Deleted: boolean;
    public CustomLiquidityPaymentType: CustomLiquidityPaymentInterval;
    public CurrencyCodeID: number;
    public UpdatedBy: string;
    public ID: number;
    public DueDate: LocalDate;
    public Description: string;
    public StatusCode: number;
    public _createguid: string;
    public currency: CurrencyCode;
    public CustomFields: any;
}


export class DepreciationLine extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'DepreciationLine';

    public DepreciationJELineID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public DepreciationType: number;
    public AssetJELineID: number;
    public StatusCode: number;
    public AssetID: number;
    public _createguid: string;
    public DepreciationJELine: JournalEntryLine;
    public AssetJELine: JournalEntryLine;
    public CustomFields: any;
}


export class FinancialYear extends UniEntity {
    public static RelativeUrl = 'financialyears';
    public static EntityType = 'FinancialYear';

    public ValidTo: LocalDate;
    public CreatedAt: Date;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Year: number;
    public Deleted: boolean;
    public ValidFrom: LocalDate;
    public UpdatedBy: string;
    public ID: number;
    public StatusCode: number;
    public _createguid: string;
    public CustomFields: any;
}


export class JournalEntry extends UniEntity {
    public static RelativeUrl = 'journalentries';
    public static EntityType = 'JournalEntry';

    public CreatedAt: Date;
    public NumberSeriesID: number;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public JournalEntryDraftGroup: string;
    public JournalEntryAccrualID: number;
    public JournalEntryNumberNumeric: number;
    public UpdatedBy: string;
    public FinancialYearID: number;
    public ID: number;
    public Description: string;
    public StatusCode: number;
    public JournalEntryNumber: string;
    public NumberSeriesTaskID: number;
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

    public CreatedAt: Date;
    public PaymentID: string;
    public AmountCurrency: number;
    public Amount: number;
    public CreatedBy: string;
    public JournalEntryID: number;
    public TaxBasisAmount: number;
    public UpdatedAt: Date;
    public PeriodID: number;
    public ReferenceOriginalPostID: number;
    public CurrencyExchangeRate: number;
    public VatJournalEntryPostID: number;
    public BatchNumber: number;
    public PaymentReferenceID: number;
    public AccrualID: number;
    public RestAmountCurrency: number;
    public Deleted: boolean;
    public VatPercent: number;
    public PostPostJournalEntryLineID: number;
    public RestAmount: number;
    public VatPeriodID: number;
    public VatDeductionPercent: number;
    public VatReportID: number;
    public VatDate: LocalDate;
    public JournalEntryLineDraftID: number;
    public SubAccountID: number;
    public JournalEntryNumberNumeric: number;
    public VatTypeID: number;
    public CustomerInvoiceID: number;
    public ReferenceCreditPostID: number;
    public OriginalReferencePostID: number;
    public TaxBasisAmountCurrency: number;
    public CurrencyCodeID: number;
    public UpdatedBy: string;
    public FinancialDate: LocalDate;
    public ID: number;
    public AccountID: number;
    public Signature: string;
    public DueDate: LocalDate;
    public DimensionsID: number;
    public JournalEntryTypeID: number;
    public Description: string;
    public CustomerOrderID: number;
    public SupplierInvoiceID: number;
    public InvoiceNumber: string;
    public StatusCode: number;
    public PaymentInfoTypeID: number;
    public RegisteredDate: LocalDate;
    public JournalEntryNumber: string;
    public OriginalJournalEntryPost: number;
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

    public CreatedAt: Date;
    public PaymentID: string;
    public AmountCurrency: number;
    public Amount: number;
    public CreatedBy: string;
    public JournalEntryID: number;
    public TaxBasisAmount: number;
    public UpdatedAt: Date;
    public PeriodID: number;
    public CurrencyExchangeRate: number;
    public BatchNumber: number;
    public PaymentReferenceID: number;
    public AccrualID: number;
    public Deleted: boolean;
    public VatPercent: number;
    public PostPostJournalEntryLineID: number;
    public VatPeriodID: number;
    public VatDeductionPercent: number;
    public VatDate: LocalDate;
    public SubAccountID: number;
    public JournalEntryNumberNumeric: number;
    public VatTypeID: number;
    public CustomerInvoiceID: number;
    public TaxBasisAmountCurrency: number;
    public CurrencyCodeID: number;
    public UpdatedBy: string;
    public FinancialDate: LocalDate;
    public ID: number;
    public AccountID: number;
    public Signature: string;
    public DueDate: LocalDate;
    public DimensionsID: number;
    public JournalEntryTypeID: number;
    public Description: string;
    public CustomerOrderID: number;
    public SupplierInvoiceID: number;
    public InvoiceNumber: string;
    public StatusCode: number;
    public PaymentInfoTypeID: number;
    public RegisteredDate: LocalDate;
    public JournalEntryNumber: string;
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

    public CreatedAt: Date;
    public Name: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public VisibleModules: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public TraceLinkTypes: string;
    public StatusCode: number;
    public ColumnSetUp: string;
    public _createguid: string;
    public CustomFields: any;
}


export class JournalEntrySourceSerie extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'JournalEntrySourceSerie';

    public CreatedAt: Date;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public JournalEntrySourceID: number;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public StatusCode: number;
    public JournalEntrySourceInstanceID: number;
    public JournalEntrySourceEntityName: string;
    public _createguid: string;
    public CustomFields: any;
}


export class JournalEntryType extends UniEntity {
    public static RelativeUrl = 'journalentrytypes';
    public static EntityType = 'JournalEntryType';

    public CreatedAt: Date;
    public Name: string;
    public CreatedBy: string;
    public MainName: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public ExpectNegativeAmount: boolean;
    public DisplayName: string;
    public UpdatedBy: string;
    public ID: number;
    public Number: number;
    public _createguid: string;
    public CustomFields: any;
}


export class LedgerSuggestion extends UniEntity {
    public Name: string;
    public OrgNumber: string;
    public IndustryCode: string;
    public IndustryName: string;
    public BusinessType: string;
    public ID: number;
    public Source: SuggestionSource;
}


export class Payment extends UniEntity {
    public static RelativeUrl = 'payments';
    public static EntityType = 'Payment';

    public PaymentBatchID: number;
    public CreatedAt: Date;
    public PaymentID: string;
    public AmountCurrency: number;
    public InPaymentID: string;
    public Amount: number;
    public StatusText: string;
    public CreatedBy: string;
    public PaymentDate: LocalDate;
    public JournalEntryID: number;
    public XmlTagPmtInfIdReference: string;
    public UpdatedAt: Date;
    public BusinessRelationID: number;
    public ExternalBankAccountNumber: string;
    public CurrencyExchangeRate: number;
    public IsPaymentClaim: boolean;
    public AutoJournal: boolean;
    public IsCustomerPayment: boolean;
    public Deleted: boolean;
    public SerialNumberOrAcctSvcrRef: string;
    public ToBankAccountID: number;
    public Debtor: string;
    public Domain: string;
    public FromBankAccountID: number;
    public BankChargeAmount: number;
    public CustomerInvoiceID: number;
    public Proprietary: string;
    public CustomerInvoiceReminderID: number;
    public CurrencyCodeID: number;
    public UpdatedBy: string;
    public ID: number;
    public OcrPaymentStrings: string;
    public PaymentCodeID: number;
    public XmlTagEndToEndIdReference: string;
    public IsPaymentCancellationRequest: boolean;
    public DueDate: LocalDate;
    public PaymentStatusReportFileID: number;
    public PaymentNotificationReportFileID: number;
    public Description: string;
    public SupplierInvoiceID: number;
    public InvoiceNumber: string;
    public StatusCode: number;
    public IsExternal: boolean;
    public ReconcilePayment: boolean;
    public DimensionsID: number;
    public _createguid: string;
    public BusinessRelation: BusinessRelation;
    public ToBankAccount: BankAccount;
    public PaymentBatch: PaymentBatch;
    public FromBankAccount: BankAccount;
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

    public CreatedAt: Date;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public TotalAmount: number;
    public PaymentReferenceID: string;
    public IsCustomerPayment: boolean;
    public Deleted: boolean;
    public OcrHeadingStrings: string;
    public PaymentFileID: number;
    public NumberOfPayments: number;
    public PaymentBatchTypeID: number;
    public Camt054CMsgId: string;
    public UpdatedBy: string;
    public OcrTransmissionNumber: number;
    public ID: number;
    public ReceiptDate: Date;
    public PaymentStatusReportFileID: number;
    public StatusCode: number;
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
    public CreatedAt: Date;
    public AmountCurrency: number;
    public Amount: number;
    public CreatedBy: string;
    public JournalEntryLine2ID: number;
    public UpdatedAt: Date;
    public CurrencyExchangeRate: number;
    public JournalEntryLine1ID: number;
    public Deleted: boolean;
    public CurrencyCodeID: number;
    public UpdatedBy: string;
    public ID: number;
    public StatusCode: number;
    public _createguid: string;
    public JournalEntryLine1: JournalEntryLine;
    public JournalEntryLine2: JournalEntryLine;
    public CurrencyCode: CurrencyCode;
    public CustomFields: any;
}


export class ReInvoice extends UniEntity {
    public static RelativeUrl = 'reinvoicing';
    public static EntityType = 'ReInvoice';

    public CreatedAt: Date;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public ProductID: number;
    public TaxInclusiveAmount: number;
    public Deleted: boolean;
    public TaxExclusiveAmount: number;
    public UpdatedBy: string;
    public ID: number;
    public OwnCostAmount: number;
    public ReInvoicingType: number;
    public OwnCostShare: number;
    public SupplierInvoiceID: number;
    public StatusCode: number;
    public _createguid: string;
    public SupplierInvoice: SupplierInvoice;
    public Product: Product;
    public Items: Array<ReInvoiceItem>;
    public CustomFields: any;
}


export class ReInvoiceItem extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ReInvoiceItem';

    public Share: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Vat: number;
    public Deleted: boolean;
    public GrossAmount: number;
    public CustomerID: number;
    public UpdatedBy: string;
    public ID: number;
    public ReInvoiceID: number;
    public StatusCode: number;
    public Surcharge: number;
    public NetAmount: number;
    public _createguid: string;
    public Customer: Customer;
    public CustomFields: any;
}


export class SupplierInvoice extends UniEntity {
    public static RelativeUrl = 'supplierinvoices';
    public static EntityType = 'SupplierInvoice';

    public InternalNote: string;
    public CustomerOrgNumber: string;
    public PaymentDueDate: LocalDate;
    public CreatedAt: Date;
    public DeliveryTerm: string;
    public PaymentID: string;
    public Credited: boolean;
    public InvoiceAddressLine3: string;
    public CreditedAmount: number;
    public InvoiceCountryCode: string;
    public CreditDays: number;
    public TaxExclusiveAmountCurrency: number;
    public InvoicePostalCode: string;
    public YourReference: string;
    public Payment: string;
    public CreatedBy: string;
    public JournalEntryID: number;
    public CustomerPerson: string;
    public InvoiceReceiverName: string;
    public UpdatedAt: Date;
    public InvoiceReferenceID: number;
    public CurrencyExchangeRate: number;
    public PayableRoundingAmount: number;
    public DeliveryName: string;
    public TaxInclusiveAmountCurrency: number;
    public ShippingCountryCode: string;
    public TaxInclusiveAmount: number;
    public RestAmountCurrency: number;
    public Deleted: boolean;
    public DeliveryDate: LocalDate;
    public RestAmount: number;
    public PaymentTerm: string;
    public AmountRegards: string;
    public ShippingCountry: string;
    public InvoiceAddressLine1: string;
    public DeliveryMethod: string;
    public InvoiceCity: string;
    public SupplierOrgNumber: string;
    public InvoiceType: number;
    public PaymentTermsID: number;
    public Comment: string;
    public InvoiceCountry: string;
    public PaymentStatus: number;
    public TaxExclusiveAmount: number;
    public ProjectID: number;
    public SalesPerson: string;
    public VatTotalsAmountCurrency: number;
    public ShippingAddressLine2: string;
    public IsSentToPayment: boolean;
    public CreditedAmountCurrency: number;
    public CurrencyCodeID: number;
    public UpdatedBy: string;
    public PaymentInformation: string;
    public ID: number;
    public FreeTxt: string;
    public ShippingPostalCode: string;
    public ShippingAddressLine3: string;
    public ReInvoiceID: number;
    public ShippingCity: string;
    public OurReference: string;
    public DeliveryTermsID: number;
    public SupplierID: number;
    public InvoiceNumber: string;
    public StatusCode: number;
    public PayableRoundingCurrencyAmount: number;
    public InvoiceAddressLine2: string;
    public ReInvoiced: boolean;
    public Requisition: string;
    public InvoiceDate: LocalDate;
    public ShippingAddressLine1: string;
    public BankAccountID: number;
    public PrintStatus: number;
    public VatTotalsAmount: number;
    public InvoiceOriginType: SupplierInvoiceOriginType;
    public DefaultDimensionsID: number;
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

    public CreatedAt: Date;
    public SumTotalExVatCurrency: number;
    public DiscountCurrency: number;
    public Unit: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public ProductID: number;
    public CurrencyExchangeRate: number;
    public DiscountPercent: number;
    public PriceIncVat: number;
    public SumTotalIncVat: number;
    public Deleted: boolean;
    public SumVat: number;
    public VatPercent: number;
    public SumTotalExVat: number;
    public InvoicePeriodStartDate: LocalDate;
    public Discount: number;
    public CalculateGrossPriceBasedOnNetPrice: boolean;
    public Comment: string;
    public SumTotalIncVatCurrency: number;
    public PriceExVatCurrency: number;
    public NumberOfItems: number;
    public SumVatCurrency: number;
    public VatTypeID: number;
    public CurrencyCodeID: number;
    public UpdatedBy: string;
    public ID: number;
    public AccountingCost: string;
    public SortIndex: number;
    public PriceExVat: number;
    public ItemText: string;
    public DimensionsID: number;
    public SupplierInvoiceID: number;
    public StatusCode: number;
    public InvoicePeriodEndDate: LocalDate;
    public PriceSetByUser: boolean;
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

    public CreatedAt: Date;
    public Name: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public StatusCode: number;
    public No: string;
    public _createguid: string;
    public CustomFields: any;
}


export class VatDeduction extends UniEntity {
    public static RelativeUrl = 'vatdeductions';
    public static EntityType = 'VatDeduction';

    public ValidTo: LocalDate;
    public CreatedAt: Date;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public DeductionPercent: number;
    public Deleted: boolean;
    public VatDeductionGroupID: number;
    public ValidFrom: LocalDate;
    public UpdatedBy: string;
    public ID: number;
    public StatusCode: number;
    public _createguid: string;
    public VatDeductionGroup: VatDeductionGroup;
    public CustomFields: any;
}


export class VatDeductionGroup extends UniEntity {
    public static RelativeUrl = 'vatdeductiongroups';
    public static EntityType = 'VatDeductionGroup';

    public CreatedAt: Date;
    public Name: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public StatusCode: number;
    public _createguid: string;
    public CustomFields: any;
}


export class VatPost extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'VatPost';

    public CreatedAt: Date;
    public Name: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public ReportAsNegativeAmount: boolean;
    public HasTaxBasis: boolean;
    public VatCodeGroupID: number;
    public UpdatedBy: string;
    public ID: number;
    public StatusCode: number;
    public No: string;
    public HasTaxAmount: boolean;
    public _createguid: string;
    public VatCodeGroup: VatCodeGroup;
    public VatReportReferences: Array<VatReportReference>;
    public CustomFields: any;
}


export class VatReport extends UniEntity {
    public static RelativeUrl = 'vatreports';
    public static EntityType = 'VatReport';

    public CreatedAt: Date;
    public ExternalRefNo: string;
    public ReportedDate: Date;
    public TerminPeriodID: number;
    public CreatedBy: string;
    public JournalEntryID: number;
    public UpdatedAt: Date;
    public ExecutedDate: Date;
    public Deleted: boolean;
    public Title: string;
    public Comment: string;
    public VatReportArchivedSummaryID: number;
    public UpdatedBy: string;
    public ID: number;
    public StatusCode: number;
    public InternalComment: string;
    public VatReportTypeID: number;
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

    public AmountToBeReceived: number;
    public PaymentDueDate: Date;
    public ReportName: string;
    public CreatedAt: Date;
    public PaymentID: string;
    public CreatedBy: string;
    public PaymentToDescription: string;
    public UpdatedAt: Date;
    public PaymentYear: number;
    public Deleted: boolean;
    public AmountToBePayed: number;
    public PaymentPeriod: string;
    public UpdatedBy: string;
    public ID: number;
    public StatusCode: number;
    public PaymentBankAccountNumber: string;
    public SummaryHeader: string;
    public _createguid: string;
    public CustomFields: any;
}


export class VatReportReference extends UniEntity {
    public static RelativeUrl = 'vatreportreferences';
    public static EntityType = 'VatReportReference';

    public CreatedAt: Date;
    public VatPostID: number;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public VatTypeID: number;
    public UpdatedBy: string;
    public ID: number;
    public AccountID: number;
    public StatusCode: number;
    public _createguid: string;
    public VatType: VatType;
    public VatPost: VatPost;
    public Account: Account;
    public CustomFields: any;
}


export class VatReportType extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'VatReportType';

    public CreatedAt: Date;
    public Name: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public StatusCode: number;
    public _createguid: string;
    public CustomFields: any;
}


export class VatType extends UniEntity {
    public static RelativeUrl = 'vattypes';
    public static EntityType = 'VatType';

    public CreatedAt: Date;
    public AvailableInModules: boolean;
    public Name: string;
    public VatCodeGroupingValue: VatCodeGroupingValueEnum;
    public CreatedBy: string;
    public DirectJournalEntryOnly: boolean;
    public Alias: string;
    public UpdatedAt: Date;
    public InUse: boolean;
    public IncomingAccountID: number;
    public Locked: boolean;
    public Deleted: boolean;
    public VatCode: string;
    public ReversedTaxDutyVat: boolean;
    public VatCodeGroupID: number;
    public OutputVat: boolean;
    public VatTypeSetupID: number;
    public UpdatedBy: string;
    public ID: number;
    public OutgoingAccountID: number;
    public Visible: boolean;
    public StatusCode: number;
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

    public ValidTo: LocalDate;
    public CreatedAt: Date;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public VatPercent: number;
    public ValidFrom: LocalDate;
    public VatTypeID: number;
    public UpdatedBy: string;
    public ID: number;
    public StatusCode: number;
    public _createguid: string;
    public CustomFields: any;
}


export class EntityValidationRule extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'EntityValidationRule';

    public Message: string;
    public CreatedAt: Date;
    public PropertyName: string;
    public CreatedBy: string;
    public ChangedByCompany: boolean;
    public UpdatedAt: Date;
    public Value: string;
    public Deleted: boolean;
    public Operator: Operator;
    public Level: ValidationLevel;
    public EntityType: string;
    public UpdatedBy: string;
    public ID: number;
    public OnConflict: OnConflict;
    public System: boolean;
    public Operation: OperationType;
    public SyncKey: string;
    public _createguid: string;
    public CustomFields: any;
}


export class EntityValidationRuleTemplate extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'EntityValidationRuleTemplate';

    public Message: string;
    public CreatedAt: Date;
    public PropertyName: string;
    public CreatedBy: string;
    public ChangedByCompany: boolean;
    public UpdatedAt: Date;
    public Value: string;
    public Deleted: boolean;
    public Operator: Operator;
    public Level: ValidationLevel;
    public EntityType: string;
    public UpdatedBy: string;
    public ID: number;
    public OnConflict: OnConflict;
    public System: boolean;
    public Operation: OperationType;
    public SyncKey: string;
    public _createguid: string;
    public CustomFields: any;
}


export class ComplexValidationRule extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ComplexValidationRule';

    public ValidationCode: number;
    public Message: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public ChangedByCompany: boolean;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public Level: ValidationLevel;
    public EntityType: string;
    public UpdatedBy: string;
    public ID: number;
    public OnConflict: OnConflict;
    public System: boolean;
    public Operation: OperationType;
    public SyncKey: string;
    public _createguid: string;
    public CustomFields: any;
}


export class ComplexValidationRuleTemplate extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ComplexValidationRuleTemplate';

    public ValidationCode: number;
    public Message: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public ChangedByCompany: boolean;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public Level: ValidationLevel;
    public EntityType: string;
    public UpdatedBy: string;
    public ID: number;
    public OnConflict: OnConflict;
    public System: boolean;
    public Operation: OperationType;
    public SyncKey: string;
    public _createguid: string;
    public CustomFields: any;
}


export class CustomField extends UniEntity {
    public static RelativeUrl = 'custom-fields';
    public static EntityType = 'CustomField';

    public DataType: string;
    public CreatedAt: Date;
    public ModelID: number;
    public Name: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public Nullable: boolean;
    public UpdatedBy: string;
    public ID: number;
    public StatusCode: number;
    public _createguid: string;
    public CustomFields: any;
}


export class ValueList extends UniEntity {
    public static RelativeUrl = 'valuelists';
    public static EntityType = 'ValueList';

    public CreatedAt: Date;
    public Name: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public Description: string;
    public Code: string;
    public _createguid: string;
    public Items: Array<ValueItem>;
    public CustomFields: any;
}


export class ValueItem extends UniEntity {
    public static RelativeUrl = 'valueitems';
    public static EntityType = 'ValueItem';

    public CreatedAt: Date;
    public ValueListID: number;
    public Name: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Value: string;
    public Deleted: boolean;
    public Index: number;
    public UpdatedBy: string;
    public ID: number;
    public Description: string;
    public Code: string;
    public _createguid: string;
    public ValueList: ValueList;
    public CustomFields: any;
}


export class ComponentLayoutDto extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ComponentLayoutDto';

    public Name: string;
    public BaseEntity: string;
    public Url: string;
    public Fields: Array<FieldLayoutDto>;
    public CustomFields: any;
}


export class FieldLayoutDto extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'FieldLayoutDto';

    public Hidden: boolean;
    public CreatedAt: Date;
    public ReadOnly: boolean;
    public Property: string;
    public Options: string;
    public Placeholder: string;
    public ComponentLayoutID: number;
    public CreatedBy: string;
    public FieldType: FieldType;
    public UpdatedAt: Date;
    public LineBreak: boolean;
    public LookupEntityType: string;
    public Placement: number;
    public Combo: number;
    public Deleted: boolean;
    public HelpText: string;
    public FieldSet: number;
    public Alignment: Alignment;
    public EntityType: string;
    public UpdatedBy: string;
    public Width: string;
    public ID: number;
    public Label: string;
    public Sectionheader: string;
    public Url: string;
    public Legend: string;
    public Description: string;
    public ValueList: string;
    public StatusCode: number;
    public LookupField: boolean;
    public DisplayField: string;
    public Section: number;
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
    public Date: Date;
    public Invoicable: number;
    public ValidTimeOff: number;
    public Projecttime: number;
    public IsWeekend: boolean;
    public StartTime: Date;
    public WeekNumber: number;
    public WeekDay: number;
    public EndTime: Date;
    public ValidTime: number;
    public ExpectedTime: number;
    public TimeOff: number;
    public TotalTime: number;
    public Workflow: TimesheetWorkflow;
    public Status: WorkStatus;
    public Flextime: number;
    public SickTime: number;
    public Overtime: number;
}


export class WorkBalanceDto extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'WorkBalanceDto';

    public ValidTimeOff: number;
    public IsStartBalance: boolean;
    public CreatedAt: Date;
    public CreatedBy: string;
    public ExpectedMinutes: number;
    public UpdatedAt: Date;
    public BalanceDate: Date;
    public Days: number;
    public Balancetype: WorkBalanceTypeEnum;
    public Deleted: boolean;
    public BalanceFrom: Date;
    public ActualMinutes: number;
    public ValidFrom: Date;
    public WorkRelationID: number;
    public UpdatedBy: string;
    public ID: number;
    public Minutes: number;
    public LastDayActual: number;
    public Description: string;
    public SumOvertime: number;
    public StatusCode: number;
    public LastDayExpected: number;
    public _createguid: string;
    public Previous: BalanceInfo;
    public Details: Array<FlexDetail>;
    public WorkRelation: WorkRelation;
    public CustomFields: any;
}


export class BalanceInfo extends UniEntity {
    public BalanceDate: Date;
    public ID: number;
    public Minutes: number;
    public Description: string;
}


export class FlexDetail extends UniEntity {
    public Date: Date;
    public ValidTimeOff: number;
    public ExpectedMinutes: number;
    public IsWeekend: boolean;
    public WorkedMinutes: number;
}


export class ContactSearchServiceResponse extends UniEntity {
    public ObjectName: string;
    public Success: boolean;
    public ErrorCode: number;
    public ErrorMessage: string;
    public Method: string;
}


export class InvoicesAndRemindersReadyToRemind extends UniEntity {
    public ExternalReference: string;
    public ReminderNumber: number;
    public CustomerNumber: number;
    public CurrencyExchangeRate: number;
    public TaxInclusiveAmountCurrency: number;
    public TaxInclusiveAmount: number;
    public RestAmountCurrency: number;
    public RestAmount: number;
    public EmailAddress: string;
    public Interest: number;
    public Fee: number;
    public CurrencyCodeCode: string;
    public CustomerID: number;
    public CustomerInvoiceID: number;
    public CustomerInvoiceReminderID: number;
    public CurrencyCodeID: number;
    public DueDate: Date;
    public CurrencyCodeShortCode: string;
    public InvoiceNumber: number;
    public StatusCode: number;
    public DontSendReminders: boolean;
    public CustomerName: string;
    public InvoiceDate: Date;
}


export class TradeHeaderCalculationSummary extends UniEntity {
    public DecimalRounding: number;
    public SumDiscountCurrency: number;
    public SumTotalExVatCurrency: number;
    public SumDiscount: number;
    public SumTotalIncVat: number;
    public SumVat: number;
    public SumTotalExVat: number;
    public SumNoVatBasisCurrency: number;
    public SumVatBasisCurrency: number;
    public SumTotalIncVatCurrency: number;
    public SumVatCurrency: number;
    public SumVatBasis: number;
    public SumNoVatBasis: number;
    public DecimalRoundingCurrency: number;
}


export class VatCalculationSummary extends UniEntity {
    public SumVat: number;
    public VatPercent: number;
    public SumVatBasisCurrency: number;
    public SumVatCurrency: number;
    public SumVatBasis: number;
}


export class InvoicePaymentData extends UniEntity {
    public PaymentID: string;
    public AmountCurrency: number;
    public Amount: number;
    public AgioAccountID: number;
    public PaymentDate: LocalDate;
    public CurrencyExchangeRate: number;
    public FromBankAccountID: number;
    public BankChargeAccountID: number;
    public BankChargeAmount: number;
    public CurrencyCodeID: number;
    public AccountID: number;
    public DimensionsID: number;
    public AgioAmount: number;
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
    public Limit: number;
    public MaxInvoiceAmount: number;
    public RemainingLimit: number;
}


export class AmeldingAgaAndTaxSums extends UniEntity {
    public KIDGarnishment: string;
    public GarnishmentTax: number;
    public EmploymentTax: number;
    public FinancialTax: number;
    public TaxDraw: number;
    public period: number;
    public KIDFinancialTax: string;
    public KIDEmploymentTax: string;
    public DueDate: Date;
    public MessageID: string;
    public AccountNumber: string;
    public KIDTaxDraw: string;
}


export class PayrollRunInAmeldingPeriod extends UniEntity {
    public CanGenerateAddition: boolean;
    public PayrollrunID: number;
    public AmeldingSentdate: Date;
    public PayrollrunDescription: string;
    public PayrollrunPaydate: Date;
}


export class PayAgaTaxDTO extends UniEntity {
    public payGarnishment: boolean;
    public correctPennyDiff: boolean;
    public payTaxDraw: boolean;
    public payFinancialTax: boolean;
    public payDate: Date;
    public payAga: boolean;
}


export class AmeldingSumUp extends UniEntity {
    public ReplacesAMeldingID: number;
    public generated: Date;
    public altInnStatus: string;
    public sent: Date;
    public year: number;
    public LegalEntityNo: string;
    public type: AmeldingType;
    public Replaces: string;
    public ID: number;
    public period: number;
    public status: AmeldingStatus;
    public meldingsID: string;
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
    public name: string;
    public employeeNumber: number;
    public arbeidsforhold: Array<Employments>;
}


export class Employments extends UniEntity {
    public endDate: Date;
    public type: string;
    public startDate: Date;
    public arbeidsforholdId: string;
    public permisjon: Array<EmploymentLeaves>;
}


export class EmploymentLeaves extends UniEntity {
    public beskrivelse: string;
    public startdato: Date;
    public permisjonsId: string;
    public sluttdato: Date;
    public permisjonsprosent: string;
}


export class TransactionTypes extends UniEntity {
    public Base_EmploymentTax: boolean;
    public amount: number;
    public incomeType: string;
    public benefit: string;
    public tax: boolean;
    public description: string;
}


export class AGADetails extends UniEntity {
    public zoneName: string;
    public baseAmount: number;
    public rate: number;
    public type: string;
    public sectorName: string;
}


export class Totals extends UniEntity {
    public sumTax: number;
    public sumUtleggstrekk: number;
    public sumAGA: number;
}


export class AnnualStatement extends UniEntity {
    public EmployerCountry: string;
    public EmployeeSSn: string;
    public VacationPayBase: number;
    public EmployerCountryCode: string;
    public EmployeeMunicipalName: string;
    public EmployeeName: string;
    public EmployerPhoneNumber: string;
    public EmployeePostCode: string;
    public EmployerEmail: string;
    public EmployeeNumber: number;
    public EmployerPostCode: string;
    public Year: number;
    public EmployeeMunicipalNumber: string;
    public EmployerTaxMandatory: boolean;
    public EmployeeAddress: string;
    public EmployerCity: string;
    public EmployerWebAddress: string;
    public EmployerName: string;
    public EmployerOrgNr: string;
    public EmployerAddress: string;
    public EmployeeCity: string;
    public Contributions: Array<AnnualStatementLine>;
    public PensionOrBenefits: Array<AnnualStatementLine>;
    public Deductions: Array<AnnualStatementLine>;
    public Draws: Array<AnnualStatementLine>;
}


export class AnnualStatementLine extends UniEntity {
    public Amount: number;
    public Sum: number;
    public LineIndex: number;
    public IsDeduction: boolean;
    public Description: string;
    public TaxReturnPost: string;
    public SupplementPackageName: string;
    public Supplements: Array<SupplementInfo>;
}


export class SupplementInfo extends UniEntity {
    public Name: string;
    public ValueDate: Date;
    public ValueDate2: Date;
    public WageTypeSupplementID: number;
    public ValueString: string;
    public ValueMoney: number;
    public ValueType: Valuetype;
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
    public IsJob: boolean;
    public Text: string;
    public employeestatus: Array<EmployeeStatus>;
}


export class EmployeeStatus extends UniEntity {
    public ssn: string;
    public employeeNumber: number;
    public year: number;
    public info: string;
    public employeeID: number;
    public status: string;
    public changedFields: Array<FieldsChanged>;
}


export class FieldsChanged extends UniEntity {
    public fieldName: string;
    public valTo: string;
    public valFrom: string;
}


export class EmploymentHistoryRecord extends UniEntity {
    public HourRate: number;
    public RegulativeGroupID: number;
    public WorkPercent: number;
    public RegulativeStepNr: number;
    public ChangedAt: Date;
    public MonthRate: number;
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
}


export class SumOnYear extends UniEntity {
    public nonTaxableAmount: number;
    public sumTax: number;
    public pension: number;
    public usedNonTaxableAmount: number;
    public grossPayment: number;
    public taxBase: number;
    public paidHolidaypay: number;
    public netPayment: number;
    public baseVacation: number;
    public advancePayment: number;
    public employeeID: number;
}


export class VacationPayLastYear extends UniEntity {
    public paidHolidayPay: number;
    public baseVacation: number;
    public employeeID: number;
}


export class SalaryTransactionPay extends UniEntity {
    public CompanyAddress: string;
    public Withholding: number;
    public CompanyCity: string;
    public PaymentDate: Date;
    public CompanyName: string;
    public SalaryBankAccountID: number;
    public TaxBankAccountID: number;
    public CompanyBankAccountID: number;
    public CompanyPostalCode: string;
    public PayList: Array<SalaryTransactionPayLine>;
    public SalaryBalancePayList: Array<SalaryBalancePayLine>;
}


export class SalaryTransactionPayLine extends UniEntity {
    public EmployeeName: string;
    public City: string;
    public PostalCode: string;
    public Address: string;
    public EmployeeNumber: number;
    public NetPayment: number;
    public Account: string;
    public Tax: number;
}


export class SalaryBalancePayLine extends UniEntity {
    public Sum: number;
    public Account: string;
    public Kid: string;
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
    public Message: string;
    public GroupByWageType: boolean;
    public Subject: string;
    public ReportID: number;
}


export class WorkItemToSalary extends UniEntity {
    public PayrollRunID: number;
    public Rate: number;
    public WageType: WageType;
    public Employment: Employment;
    public WorkItems: Array<WorkItem>;
}


export class Reconciliation extends UniEntity {
    public Year: number;
    public CalculatedPayruns: number;
    public ToPeriod: number;
    public CreatedPayruns: number;
    public FromPeriod: number;
    public BookedPayruns: number;
    public Groups: Array<ReconciliationGroup>;
}


export class ReconciliationGroup extends UniEntity {
    public Sum: number;
    public AccountNumber: string;
    public Lines: Array<ReconciliationLine>;
}


export class ReconciliationLine extends UniEntity {
    public WageTypeNumber: number;
    public WageTypeName: string;
    public IncomeType: string;
    public Sum: number;
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
    public Name: string;
    public OUO: number;
    public Ensurance: number;
    public MemberNumber: string;
    public UnionDraw: number;
}


export class SalaryTransactionSums extends UniEntity {
    public percentTax: number;
    public basePercentTax: number;
    public calculatedFinancialTax: number;
    public paidAdvance: number;
    public grossPayment: number;
    public Employee: number;
    public baseAGA: number;
    public tableTax: number;
    public calculatedAGA: number;
    public netPayment: number;
    public baseVacation: number;
    public Payrun: number;
    public baseTableTax: number;
    public calculatedVacationPay: number;
    public paidPension: number;
    public manualTax: number;
}


export class SalaryTransactionPeriodSums extends UniEntity {
    public MunicipalName: string;
    public OrgNumber: string;
    public Year: number;
    public AgaZone: string;
    public ToPeriod: number;
    public AgaRate: number;
    public FromPeriod: number;
    public Sums: SalaryTransactionSums;
    public Aga: AGACalculation;
}


export class code extends UniEntity {
    public gyldigtil: string;
    public inngaarIGrunnlagForTrekk: string;
    public postnr: string;
    public skatteOgAvgiftregel: string;
    public gyldigfom: string;
    public kunfranav: string;
    public gmlcode: string;
    public utloeserArbeidsgiveravgift: string;
    public uninavn: string;
    public fordel: string;
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
    public CopyFiles: boolean;
    public IsTemplate: boolean;
    public CompanyName: string;
    public IsTest: boolean;
    public ContractID: number;
    public TemplateCompanyKey: string;
    public ContractType: number;
    public ProductNames: string;
    public LicenseKey: string;
    public CompanySettings: CompanySettings;
}


export class UserDto extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'UserDto';

    public PermissionHandling: string;
    public CreatedAt: Date;
    public GlobalIdentity: string;
    public CreatedBy: string;
    public Email: string;
    public LastLogin: Date;
    public UpdatedAt: Date;
    public IsAutobankAdmin: boolean;
    public BankIntegrationUserName: string;
    public Deleted: boolean;
    public UserName: string;
    public DisplayName: string;
    public HasAgreedToImportDisclaimer: boolean;
    public UpdatedBy: string;
    public PhoneNumber: string;
    public ID: number;
    public Protected: boolean;
    public StatusCode: number;
    public EndDate: Date;
    public TwoFactorEnabled: boolean;
    public AuthPhoneNumber: string;
    public _createguid: string;
    public License: UserLicenseInformation;
    public CustomFields: any;
}


export class UserLicenseInformation extends UniEntity {
    public UserLicenseKey: string;
    public Name: string;
    public GlobalIdentity: string;
    public Comment: string;
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
    public Name: string;
    public ContactEmail: string;
    public EndDate: Date;
    public ContractID: number;
    public Key: string;
    public ContactPerson: string;
    public ID: number;
    public StatusCode: LicenseEntityStatus;
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
    public AdminPassword: string;
    public Password: string;
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
    public GrantSum: number;
    public UsedFreeAmount: number;
    public MaxFreeAmount: number;
}


export class AuthenticationChallengeBE extends UniEntity {
    public Message: string;
    public ValidTo: Date;
    public ValidFrom: Date;
    public Status: ChallengeRequestResult;
    public ExtensionData: ExtensionDataObject;
}


export class ExtensionDataObject extends UniEntity {
}


export class AltinnAuthRequest extends UniEntity {
    public PreferredLogin: string;
    public UserPassword: string;
    public UserID: string;
}


export class A06Options extends UniEntity {
    public ReportType: ReportType;
    public Year: number;
    public IncludeInfoPerPerson: boolean;
    public ToPeriod: Maaned;
    public IncludeIncome: boolean;
    public IncludeEmployments: boolean;
    public FromPeriod: Maaned;
}


export class A07Response extends UniEntity {
    public DataType: string;
    public mainStatus: string;
    public Data: string;
    public DataName: string;
    public Title: string;
    public Text: string;
}


export class SelfEmployed extends UniEntity {
    public year: number;
    public items: Array<SelfEmployedItem>;
}


export class SelfEmployedItem extends UniEntity {
    public name: string;
    public amount: number;
    public number: string;
    public supplierID: number;
}


export class SetIntegrationDataDto extends UniEntity {
    public IntegrationKey: string;
    public ExternalId: string;
}


export class CurrencyRateData extends UniEntity {
    public Factor: number;
    public IsOverrideRate: boolean;
    public ExchangeRate: number;
    public FromCurrencyCode: CurrencyCode;
}


export class EmailDTO extends UniEntity {
    public Message: string;
    public CopyAddress: string;
    public FromAddress: string;
    public Subject: string;
    public ReportID: number;
    public Format: string;
    public Parameters: Array<ReportParameter>;
}


export class ReportParameter extends UniEntity {
    public Name: string;
    public Value: string;
}


export class DistributionPlanElementValidation extends UniEntity {
    public ElementTypeName: string;
    public IsValid: boolean;
    public ElementType: DistributionPlanElementTypes;
    public Priority: number;
    public PlanElement: DistributionPlanElement;
}


export class SendEmail extends UniEntity {
    public Message: string;
    public ExternalReference: string;
    public ReportName: string;
    public CopyAddress: string;
    public Localization: string;
    public EntityID: number;
    public EntityType: string;
    public FromAddress: string;
    public Subject: string;
    public ReportID: number;
    public Attachments: Array<SendEmailAttachment>;
    public Parameters: Array<ReportParameter>;
}


export class SendEmailAttachment extends UniEntity {
    public FileID: number;
    public Attachment: string;
    public FileName: string;
}


export class RssList extends UniEntity {
    public Title: string;
    public Url: string;
    public Description: string;
    public Items: Array<RssItem>;
}


export class RssItem extends UniEntity {
    public Title: string;
    public Guid: string;
    public PubDate: string;
    public Link: string;
    public Description: string;
    public Category: string;
    public Enclosure: Enclosure;
}


export class Enclosure extends UniEntity {
    public Type: string;
    public Url: string;
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
    public FromDate: LocalDate;
    public ToDate: LocalDate;
    public Team: Team;
    public Members: Array<MemberDetails>;
}


export class MemberDetails extends UniEntity {
    public MinutesWorked: number;
    public Name: string;
    public ExpectedMinutes: number;
    public ReportBalance: number;
    public TotalBalance: number;
    public WorkRelation: WorkRelation;
    public TimeOff: Array<FlexDetail>;
    public MissingDays: Array<FlexDetail>;
}


export class TeamPositionDto extends UniEntity {
    public PositionName: string;
    public Position: TeamPositionEnum;
}


export class EHFCustomer extends UniEntity {
    public contactemail: string;
    public contactphone: string;
    public orgno: string;
    public orgname: string;
    public contactname: string;
}


export class ServiceMetadataDto extends UniEntity {
    public SupportEmail: string;
    public ServiceName: string;
}


export class AccountUsageReference extends UniEntity {
    public Entity: string;
    public EntityID: number;
    public Info: string;
}


export class MandatoryDimensionAccountReport extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'MandatoryDimensionAccountReport';

    public MissingRequiredDimensionsMessage: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public journalEntryLineDraftID: number;
    public MissingOnlyWarningsDimensionsMessage: string;
    public UpdatedBy: string;
    public ID: number;
    public AccountID: number;
    public AccountNumber: string;
    public DimensionsID: number;
    public StatusCode: number;
    public _createguid: string;
    public CustomFields: any;
}


export class AccountDimension extends UniEntity {
    public AccountID: number;
    public AccountNumber: number;
    public DimensionsID: number;
    public Dimensions: Dimensions;
}


export class AssetReportDTO extends UniEntity {
    public GroupCode: string;
    public BalanceAccountName: string;
    public CurrentValue: number;
    public Name: string;
    public Lifetime: number;
    public GroupName: string;
    public Number: number;
    public LastDepreciation: LocalDate;
    public DepreciationAccountNumber: number;
    public BalanceAccountNumber: number;
    public Lines: Array<AssetReportLineDTO>;
}


export class AssetReportLineDTO extends UniEntity {
    public Date: LocalDate;
    public Value: number;
    public Type: string;
    public TypeID: number;
}


export class BankData extends UniEntity {
    public IBAN: string;
    public AccountNumber: string;
    public Bank: Bank;
}


export class CreateBankIntegrationDTO extends UniEntity {
    public RequireTwoStage: boolean;
    public ServiceProvider: number;
    public Email: string;
    public IsInbound: boolean;
    public Password: string;
    public IsOutgoing: boolean;
    public BankAcceptance: boolean;
    public Phone: string;
    public UserName: string;
    public IsBankStatement: boolean;
    public Bank: string;
    public BankApproval: boolean;
    public IsBankBalance: boolean;
    public DisplayName: string;
    public TuserName: string;
    public BankAccountID: number;
    public BankAccounts: Array<BankAccountDTO>;
}


export class BankAccountDTO extends UniEntity {
    public IsInbound: boolean;
    public IsOutgoing: boolean;
    public IsBankStatement: boolean;
    public IBAN: string;
    public IsBankBalance: boolean;
    public Bic: string;
    public BBAN: string;
}


export class ZdataUpdateBankProperties extends UniEntity {
    public IsInbound: boolean;
    public Password: string;
    public IsOutgoing: boolean;
    public IsBankStatement: boolean;
    public ServiceID: string;
    public IsBankBalance: boolean;
}


export class AutobankUserDTO extends UniEntity {
    public Password: string;
    public Phone: string;
    public IsAdmin: boolean;
    public UserID: number;
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
    public Group: string;
    public Amount: number;
    public BankStatementEntryID: number;
    public JournalEntryLineID: number;
}


export class MatchRequest extends UniEntity {
    public JournalEntries: Array<MatchCandidate>;
    public BankEntries: Array<MatchCandidate>;
    public Settings: MatchSettings;
}


export class MatchCandidate extends UniEntity {
    public Date: Date;
    public Amount: number;
    public IsBankEntry: boolean;
    public ID: number;
    public Closed: boolean;
}


export class MatchSettings extends UniEntity {
    public MaxDelta: number;
    public MaxDayOffset: number;
}


export class ReconciliationStatus extends UniEntity {
    public FromDate: Date;
    public TotalAmount: number;
    public TotalUnreconciled: number;
    public Todate: Date;
    public IsReconciled: boolean;
    public NumberOfItems: number;
    public AccountID: number;
    public NumberOfUnReconciled: number;
}


export class BalanceDto extends UniEntity {
    public EndDate: Date;
    public BalanceInStatement: number;
    public Balance: number;
    public StartDate: Date;
}


export class BankfileFormat extends UniEntity {
    public Name: string;
    public Separator: string;
    public IsFixed: boolean;
    public CustomFormat: BankFileCustomFormat;
    public LinePrefix: string;
    public IsXml: boolean;
    public FileExtension: string;
    public SkipRows: number;
    public Columns: Array<BankfileColumn>;
}


export class BankfileColumn extends UniEntity {
    public DataType: BankfileDataType;
    public FieldMapping: BankfileField;
    public StartPos: number;
    public IsFallBack: boolean;
    public Length: number;
}


export class JournalSuggestion extends UniEntity {
    public MatchWithEntryID: number;
    public Amount: number;
    public BankStatementRuleID: number;
    public FinancialDate: LocalDate;
    public AccountID: number;
    public Description: string;
    public Account: Account;
}


export class ReportRow extends UniEntity {
    public SubGroupNumber: number;
    public IsSubTotal: boolean;
    public BudPeriod7: number;
    public Period5: number;
    public Period2: number;
    public PrecedingBalance: number;
    public AccountYear: number;
    public GroupNumber: number;
    public SumPeriodAccumulated: number;
    public Period6: number;
    public BudPeriod10: number;
    public GroupName: string;
    public Period7: number;
    public Period8: number;
    public Period11: number;
    public Sum: number;
    public SumPeriodLastYear: number;
    public BudPeriod12: number;
    public Period1: number;
    public SumLastYear: number;
    public Period10: number;
    public BudPeriod3: number;
    public Period12: number;
    public BudPeriod6: number;
    public Period9: number;
    public BudgetSum: number;
    public BudPeriod4: number;
    public AccountName: string;
    public BudPeriod11: number;
    public BudPeriod2: number;
    public SumPeriod: number;
    public ID: number;
    public SubGroupName: string;
    public SumPeriodLastYearAccumulated: number;
    public Period3: number;
    public BudgetAccumulated: number;
    public Period4: number;
    public AccountNumber: number;
    public BudPeriod1: number;
    public BudPeriod8: number;
    public BudPeriod9: number;
    public BudPeriod5: number;
}


export class BudgetImport extends UniEntity {
    public Budget: Budget;
}


export class LiquidityTableDTO extends UniEntity {
    public BankBalance: number;
    public OverdueSupplierInvoices: number;
    public BankBalanceRefferance: BankBalanceType;
    public OverdueCustomerInvoices: number;
    public Period: Array<DetailsDTO>;
}


export class DetailsDTO extends UniEntity {
    public VAT: number;
    public Custumer: number;
    public Sum: number;
    public CustomPayments: number;
    public Supplier: number;
    public Liquidity: number;
}


export class JournalEntryData extends UniEntity {
    public CreditAccountID: number;
    public PaymentID: string;
    public CreditVatTypeID: number;
    public AmountCurrency: number;
    public Amount: number;
    public JournalEntryDataAccrualID: number;
    public NumberSeriesID: number;
    public DebitAccountNumber: number;
    public JournalEntryID: number;
    public SupplierInvoiceNo: string;
    public CurrencyExchangeRate: number;
    public PostPostJournalEntryLineID: number;
    public DebitVatTypeID: number;
    public VatDeductionPercent: number;
    public CreditAccountNumber: number;
    public VatDate: LocalDate;
    public CustomerInvoiceID: number;
    public FinancialDate: LocalDate;
    public CurrencyID: number;
    public DebitAccountID: number;
    public DueDate: LocalDate;
    public Description: string;
    public CustomerOrderID: number;
    public JournalEntryNo: string;
    public SupplierInvoiceID: number;
    public InvoiceNumber: string;
    public StatusCode: number;
    public NumberSeriesTaskID: number;
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
    public PeriodSumYear2: number;
    public PeriodNo: number;
    public PeriodName: string;
}


export class JournalEntryLineRequestSummary extends UniEntity {
    public SumTaxBasisAmount: number;
    public SumBalance: number;
    public SumCredit: number;
    public SumDebit: number;
    public SumLedger: number;
}


export class JournalEntryLinePostPostData extends UniEntity {
    public PaymentID: string;
    public AmountCurrency: number;
    public Amount: number;
    public SubAccountName: string;
    public AccountYear: number;
    public JournalEntryID: number;
    public MarkedAgainstJournalEntryNumber: string;
    public SumPostPostAmount: number;
    public CurrencyExchangeRate: number;
    public JournalEntryTypeName: string;
    public MarkedAgainstJournalEntryLineID: number;
    public RestAmountCurrency: number;
    public RestAmount: number;
    public SumPostPostAmountCurrency: number;
    public NumberOfPayments: number;
    public CurrencyCodeCode: string;
    public JournalEntryNumberNumeric: number;
    public PeriodNo: number;
    public CurrencyCodeID: number;
    public FinancialDate: Date;
    public SubAccountNumber: number;
    public ID: number;
    public DueDate: Date;
    public CurrencyCodeShortCode: string;
    public Description: string;
    public InvoiceNumber: string;
    public StatusCode: number;
    public JournalEntryNumber: string;
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
    public AmountCurrency: number;
    public OriginalRestAmount: number;
    public Amount: number;
    public RestAmountCurrency: number;
    public RestAmount: number;
    public FinancialDate: Date;
    public ID: number;
    public InvoiceNumber: string;
    public StatusCode: StatusCodeJournalEntryLine;
    public JournalEntryNumber: string;
    public OriginalStatusCode: StatusCodeJournalEntryLine;
    public Markings: Array<MarkingReference>;
}


export class MarkingReference extends UniEntity {
    public ID: number;
    public JournalEntryNumber: string;
}


export class SupplierInvoiceDetail extends UniEntity {
    public AmountCurrency: number;
    public Amount: number;
    public VatTypeName: string;
    public DeliveryDate: Date;
    public VatPercent: number;
    public VatCode: string;
    public AccountName: string;
    public VatTypeID: number;
    public AccountID: number;
    public AccountNumber: number;
    public Description: string;
    public SupplierID: number;
    public SupplierInvoiceID: number;
    public InvoiceNumber: string;
    public InvoiceDate: Date;
}


export class VatReportMessage extends UniEntity {
    public Message: string;
    public Level: ValidationLevel;
}


export class VatReportSummary extends UniEntity {
    public SumTaxBasisAmount: number;
    public NumberOfJournalEntryLines: number;
    public VatCodeGroupNo: string;
    public SumVatAmount: number;
    public HasTaxBasis: boolean;
    public VatCodeGroupID: number;
    public HasTaxAmount: boolean;
    public VatCodeGroupName: string;
    public IsHistoricData: boolean;
}


export class VatReportSummaryPerPost extends UniEntity {
    public VatPostNo: string;
    public VatPostID: number;
    public SumTaxBasisAmount: number;
    public NumberOfJournalEntryLines: number;
    public VatCodeGroupNo: string;
    public SumVatAmount: number;
    public VatPostName: string;
    public HasTaxBasis: boolean;
    public VatCodeGroupID: number;
    public VatPostReportAsNegativeAmount: boolean;
    public HasTaxAmount: boolean;
    public VatCodeGroupName: string;
    public IsHistoricData: boolean;
}


export class VatReportSummaryPerPostPerAccount extends UniEntity {
    public VatPostNo: string;
    public VatPostID: number;
    public Amount: number;
    public SumTaxBasisAmount: number;
    public TaxBasisAmount: number;
    public VatAccountNumber: number;
    public NumberOfJournalEntryLines: number;
    public VatJournalEntryPostAccountName: string;
    public VatCodeGroupNo: string;
    public SumVatAmount: number;
    public StdVatCode: string;
    public VatJournalEntryPostAccountNumber: number;
    public VatPostName: string;
    public VatCode: string;
    public VatDate: Date;
    public HasTaxBasis: boolean;
    public VatCodeGroupID: number;
    public FinancialDate: Date;
    public VatJournalEntryPostAccountID: number;
    public VatPostReportAsNegativeAmount: boolean;
    public VatAccountName: string;
    public Description: string;
    public HasTaxAmount: boolean;
    public JournalEntryNumber: string;
    public VatCodeGroupName: string;
    public VatAccountID: number;
    public IsHistoricData: boolean;
}


export class VatReportNotReportedJournalEntryData extends UniEntity {
    public SumTaxBasisAmount: number;
    public TerminPeriodID: number;
    public NumberOfJournalEntryLines: number;
    public SumVatAmount: number;
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


export enum InternationalIDType{
    notSet = 0,
    Passportnumber = 1,
    SocialSecurityNumber = 2,
    TaxIdentificationNumber = 3,
    ValueAddedTaxNumber = 4,
}


export enum OtpStatus{
    A = 0,
    S = 1,
    P = 2,
    LP = 3,
    AP = 4,
}


export enum GenderEnum{
    NotDefined = 0,
    Woman = 1,
    Man = 2,
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


export enum RemunerationType{
    notSet = 0,
    FixedSalary = 1,
    HourlyPaid = 2,
    PaidOnCommission = 3,
    OnAgreement_Honorar = 4,
    ByPerformance = 5,
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


export enum GetRateFrom{
    WageType = 0,
    MonthlyPayEmployee = 1,
    HourlyPayEmployee = 2,
    FreeRateEmployee = 3,
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
