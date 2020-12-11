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
    public ID: number;
    public UpdatedAt: Date;
    public Verb: string;
    public Field: string;
    public Deleted: boolean;
    public OldValue: string;
    public Route: string;
    public ClientID: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public EntityType: string;
    public Action: string;
    public Transaction: string;
    public EntityID: number;
    public CreatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class WorkBalance extends UniEntity {
    public static RelativeUrl = 'workbalances';
    public static EntityType = 'WorkBalance';

    public Balancetype: WorkBalanceTypeEnum;
    public ID: number;
    public Description: string;
    public UpdatedAt: Date;
    public Days: number;
    public StatusCode: number;
    public ExpectedMinutes: number;
    public BalanceDate: Date;
    public ValidFrom: Date;
    public ActualMinutes: number;
    public Deleted: boolean;
    public WorkRelationID: number;
    public BalanceFrom: Date;
    public Minutes: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public IsStartBalance: boolean;
    public CreatedAt: Date;
    public ValidTimeOff: number;
    public _createguid: string;
    public CustomFields: any;
}


export class Worker extends UniEntity {
    public static RelativeUrl = 'workers';
    public static EntityType = 'Worker';

    public ID: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public UserID: number;
    public BusinessRelationID: number;
    public Deleted: boolean;
    public EmployeeID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public _createguid: string;
    public Info: BusinessRelation;
    public Relations: Array<WorkRelation>;
    public Employee: Employee;
    public CustomFields: any;
}


export class WorkItem extends UniEntity {
    public static RelativeUrl = 'workitems';
    public static EntityType = 'WorkItem';

    public ID: number;
    public EndTime: Date;
    public Invoiceable: boolean;
    public OrderItemId: number;
    public Description: string;
    public UpdatedAt: Date;
    public PriceExVat: number;
    public CustomerID: number;
    public WorkTypeID: number;
    public LunchInMinutes: number;
    public StatusCode: number;
    public Label: string;
    public StartTime: Date;
    public Deleted: boolean;
    public CustomerOrderID: number;
    public WorkRelationID: number;
    public Minutes: number;
    public DimensionsID: number;
    public TransferedToPayroll: boolean;
    public UpdatedBy: string;
    public TransferedToOrder: boolean;
    public CreatedBy: string;
    public PayrollTrackingID: number;
    public MinutesToOrder: number;
    public Date: Date;
    public CreatedAt: Date;
    public WorkItemGroupID: number;
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
    public UpdatedAt: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public WorkRelationID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public _createguid: string;
    public WorkRelation: WorkRelation;
    public Items: Array<WorkItem>;
    public CustomFields: any;
}


export class WorkProfile extends UniEntity {
    public static RelativeUrl = 'workprofiles';
    public static EntityType = 'WorkProfile';

    public MinutesPerWeek: number;
    public ID: number;
    public UpdatedAt: Date;
    public Name: string;
    public StatusCode: number;
    public Deleted: boolean;
    public MinutesPerYear: number;
    public IsShared: boolean;
    public LunchIncluded: boolean;
    public MinutesPerMonth: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class WorkRelation extends UniEntity {
    public static RelativeUrl = 'workrelations';
    public static EntityType = 'WorkRelation';

    public ID: number;
    public IsActive: boolean;
    public EndTime: Date;
    public CompanyID: number;
    public Description: string;
    public UpdatedAt: Date;
    public CompanyName: string;
    public StatusCode: number;
    public WorkProfileID: number;
    public WorkerID: number;
    public Deleted: boolean;
    public TeamID: number;
    public IsPrivate: boolean;
    public UpdatedBy: string;
    public CreatedBy: string;
    public WorkPercentage: number;
    public StartDate: Date;
    public CreatedAt: Date;
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
    public SystemKey: string;
    public Description: string;
    public UpdatedAt: Date;
    public TimeoffType: number;
    public StatusCode: number;
    public Deleted: boolean;
    public WorkRelationID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public RegionKey: string;
    public ToDate: Date;
    public IsHalfDay: boolean;
    public CreatedAt: Date;
    public FromDate: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class WorkType extends UniEntity {
    public static RelativeUrl = 'worktypes';
    public static EntityType = 'WorkType';

    public WagetypeNumber: number;
    public ID: number;
    public Description: string;
    public UpdatedAt: Date;
    public Name: string;
    public SystemType: WorkTypeEnum;
    public StatusCode: number;
    public Deleted: boolean;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Price: number;
    public ProductID: number;
    public _createguid: string;
    public Product: Product;
    public CustomFields: any;
}


export class BankFile extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'BankFile';

    public Accountnumber: string;
    public ID: number;
    public UpdatedAt: Date;
    public FileID: number;
    public StatusCode: number;
    public Deleted: boolean;
    public SubCompanyID: number;
    public ParentFileid: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public _createguid: string;
    public File: File;
    public SubCompany: SubCompany;
    public CustomFields: any;
}


export class BatchInvoice extends UniEntity {
    public static RelativeUrl = 'batchinvoices';
    public static EntityType = 'BatchInvoice';

    public ID: number;
    public MinAmount: number;
    public Processed: number;
    public UpdatedAt: Date;
    public OurRef: string;
    public InvoiceDate: LocalDate;
    public NotifyEmail: boolean;
    public SellerID: number;
    public StatusCode: number;
    public Comment: string;
    public Deleted: boolean;
    public YourRef: string;
    public TotalToProcess: number;
    public Operation: BatchInvoiceOperation;
    public UpdatedBy: string;
    public CreatedBy: string;
    public NumberOfBatches: number;
    public DueDate: LocalDate;
    public CreatedAt: Date;
    public FreeTxt: string;
    public CustomerID: number;
    public _createguid: string;
    public ProjectID: number;
    public Items: Array<BatchInvoiceItem>;
    public CustomFields: any;
}


export class BatchInvoiceItem extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'BatchInvoiceItem';

    public ID: number;
    public UpdatedAt: Date;
    public StatusCode: StatusCode;
    public CommentID: number;
    public Deleted: boolean;
    public BatchInvoiceID: number;
    public CustomerOrderID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CustomerInvoiceID: number;
    public CreatedAt: Date;
    public BatchNumber: number;
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

    public ID: number;
    public UpdatedAt: Date;
    public Template: string;
    public StatusCode: number;
    public Deleted: boolean;
    public EntityName: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class Customer extends UniEntity {
    public static RelativeUrl = 'customers';
    public static EntityType = 'Customer';

    public DefaultCustomerOrderReportID: number;
    public ID: number;
    public UpdatedAt: Date;
    public CustomerNumber: number;
    public AvtaleGiroNotification: boolean;
    public EfakturaIdentifier: string;
    public AcceptableDelta4CustomerPaymentAccountID: number;
    public DefaultDistributionsID: number;
    public DefaultSellerID: number;
    public StatusCode: number;
    public BusinessRelationID: number;
    public Deleted: boolean;
    public DefaultCustomerQuoteReportID: number;
    public WebUrl: string;
    public SubAccountNumberSeriesID: number;
    public CustomerNumberKidAlias: string;
    public AvtaleGiro: boolean;
    public Localization: string;
    public IsPrivate: boolean;
    public CustomerInvoiceReminderSettingsID: number;
    public EInvoiceAgreementReference: string;
    public DimensionsID: number;
    public UpdatedBy: string;
    public DeliveryTermsID: number;
    public AcceptableDelta4CustomerPayment: number;
    public CreatedBy: string;
    public DontSendReminders: boolean;
    public CreditDays: number;
    public ReminderEmailAddress: string;
    public PaymentTermsID: number;
    public FactoringNumber: number;
    public SocialSecurityNumber: string;
    public CurrencyCodeID: number;
    public CreatedAt: Date;
    public GLN: string;
    public OrgNumber: string;
    public DefaultCustomerInvoiceReportID: number;
    public PeppolAddress: string;
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
    public DeliveryTerm: string;
    public OurReference: string;
    public ID: number;
    public TaxExclusiveAmount: number;
    public DistributionPlanID: number;
    public VatTotalsAmountCurrency: number;
    public UpdatedAt: Date;
    public PayableRoundingCurrencyAmount: number;
    public CustomerID: number;
    public InvoiceDate: LocalDate;
    public InvoiceReceiverName: string;
    public SalesPerson: string;
    public DeliveryDate: LocalDate;
    public CreditedAmountCurrency: number;
    public ShippingCity: string;
    public DeliveryMethod: string;
    public ExternalStatus: number;
    public ShippingAddressLine2: string;
    public TaxInclusiveAmount: number;
    public DefaultSellerID: number;
    public CustomerOrgNumber: string;
    public AmountRegards: string;
    public InvoiceCountry: string;
    public PaymentTerm: string;
    public EmailAddress: string;
    public StatusCode: number;
    public InvoiceAddressLine2: string;
    public VatTotalsAmount: number;
    public Comment: string;
    public Deleted: boolean;
    public DeliveryName: string;
    public PrintStatus: number;
    public InvoiceReferenceID: number;
    public TaxInclusiveAmountCurrency: number;
    public ShippingAddressLine1: string;
    public Requisition: string;
    public InvoiceAddressLine1: string;
    public UpdateCurrencyAmountsOnDateChange: boolean;
    public LastPaymentDate: LocalDate;
    public JournalEntryID: number;
    public PayableRoundingAmount: number;
    public InvoiceType: number;
    public AccrualID: number;
    public PaymentInfoTypeID: number;
    public TaxExclusiveAmountCurrency: number;
    public ShippingPostalCode: string;
    public InvoiceCity: string;
    public InvoicePostalCode: string;
    public InvoiceNumber: string;
    public CreditedAmount: number;
    public Credited: boolean;
    public InvoiceAddressLine3: string;
    public CurrencyExchangeRate: number;
    public BankAccountID: number;
    public SupplierOrgNumber: string;
    public UpdatedBy: string;
    public DeliveryTermsID: number;
    public CustomerPerson: string;
    public InvoiceCountryCode: string;
    public CreatedBy: string;
    public RestAmountCurrency: number;
    public DontSendReminders: boolean;
    public CreditDays: number;
    public ShippingCountryCode: string;
    public InvoiceNumberSeriesID: number;
    public PaymentID: string;
    public DefaultDimensionsID: number;
    public UseReportID: number;
    public PaymentTermsID: number;
    public PaymentInformation: string;
    public CustomerName: string;
    public ExternalReference: string;
    public CurrencyCodeID: number;
    public ShippingAddressLine3: string;
    public CreatedAt: Date;
    public CollectorStatusCode: number;
    public PaymentDueDate: LocalDate;
    public Payment: string;
    public FreeTxt: string;
    public YourReference: string;
    public ShippingCountry: string;
    public RestAmount: number;
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

    public ID: number;
    public DiscountCurrency: number;
    public VatTypeID: number;
    public SumTotalExVatCurrency: number;
    public SumVatCurrency: number;
    public UpdatedAt: Date;
    public PriceExVat: number;
    public NumberOfItems: number;
    public PriceSetByUser: boolean;
    public SumTotalExVat: number;
    public StatusCode: number;
    public CostPrice: number;
    public Comment: string;
    public Deleted: boolean;
    public SumTotalIncVat: number;
    public PriceExVatCurrency: number;
    public SumVat: number;
    public AccountingCost: string;
    public DiscountPercent: number;
    public SumTotalIncVatCurrency: number;
    public DimensionsID: number;
    public CurrencyExchangeRate: number;
    public ItemSourceID: number;
    public UpdatedBy: string;
    public InvoicePeriodStartDate: LocalDate;
    public CreatedBy: string;
    public CustomerInvoiceID: number;
    public Unit: string;
    public SortIndex: number;
    public CalculateGrossPriceBasedOnNetPrice: boolean;
    public CurrencyCodeID: number;
    public Discount: number;
    public InvoicePeriodEndDate: LocalDate;
    public CreatedAt: Date;
    public PriceIncVat: number;
    public ItemText: string;
    public AccountID: number;
    public VatPercent: number;
    public ProductID: number;
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

    public DebtCollectionFeeCurrency: number;
    public ID: number;
    public Description: string;
    public UpdatedAt: Date;
    public CreatedByReminderRuleID: number;
    public EmailAddress: string;
    public StatusCode: number;
    public Notified: boolean;
    public InterestFee: number;
    public Deleted: boolean;
    public ReminderNumber: number;
    public Title: string;
    public RemindedDate: LocalDate;
    public InterestFeeCurrency: number;
    public DimensionsID: number;
    public ReminderFee: number;
    public CurrencyExchangeRate: number;
    public DebtCollectionFee: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public RestAmountCurrency: number;
    public CustomerInvoiceID: number;
    public DueDate: LocalDate;
    public RunNumber: number;
    public CurrencyCodeID: number;
    public CreatedAt: Date;
    public ReminderFeeCurrency: number;
    public RestAmount: number;
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
    public Description: string;
    public UpdatedAt: Date;
    public UseMaximumLegalReminderFee: boolean;
    public StatusCode: number;
    public Deleted: boolean;
    public ReminderNumber: number;
    public Title: string;
    public MinimumDaysFromDueDate: number;
    public CustomerInvoiceReminderSettingsID: number;
    public ReminderFee: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreditDays: number;
    public CreatedAt: Date;
    public _createguid: string;
    public CustomerInvoiceReminderSettings: CustomerInvoiceReminderSettings;
    public CustomFields: any;
}


export class CustomerInvoiceReminderSettings extends UniEntity {
    public static RelativeUrl = 'invoiceremindersettings';
    public static EntityType = 'CustomerInvoiceReminderSettings';

    public MinimumAmountToRemind: number;
    public ID: number;
    public UpdatedAt: Date;
    public AcceptPaymentWithoutReminderFee: boolean;
    public StatusCode: number;
    public Deleted: boolean;
    public DebtCollectionSettingsID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public DefaultReminderFeeAccountID: number;
    public CreatedAt: Date;
    public RemindersBeforeDebtCollection: number;
    public _createguid: string;
    public CustomerInvoiceReminderRules: Array<CustomerInvoiceReminderRule>;
    public DebtCollectionSettings: DebtCollectionSettings;
    public DefaultReminderFeeAccount: Account;
    public CustomFields: any;
}


export class CustomerOrder extends UniEntity {
    public static RelativeUrl = 'orders';
    public static EntityType = 'CustomerOrder';

    public InternalNote: string;
    public DeliveryTerm: string;
    public OurReference: string;
    public ID: number;
    public TaxExclusiveAmount: number;
    public DistributionPlanID: number;
    public VatTotalsAmountCurrency: number;
    public UpdatedAt: Date;
    public PayableRoundingCurrencyAmount: number;
    public CustomerID: number;
    public OrderNumber: number;
    public InvoiceReceiverName: string;
    public OrderNumberSeriesID: number;
    public SalesPerson: string;
    public DeliveryDate: LocalDate;
    public ShippingCity: string;
    public DeliveryMethod: string;
    public ShippingAddressLine2: string;
    public TaxInclusiveAmount: number;
    public DefaultSellerID: number;
    public CustomerOrgNumber: string;
    public InvoiceCountry: string;
    public PaymentTerm: string;
    public EmailAddress: string;
    public StatusCode: number;
    public InvoiceAddressLine2: string;
    public VatTotalsAmount: number;
    public Comment: string;
    public Deleted: boolean;
    public DeliveryName: string;
    public PrintStatus: number;
    public TaxInclusiveAmountCurrency: number;
    public ShippingAddressLine1: string;
    public UpdateCurrencyOnToInvoice: boolean;
    public Requisition: string;
    public ReadyToInvoice: boolean;
    public InvoiceAddressLine1: string;
    public UpdateCurrencyAmountsOnDateChange: boolean;
    public PayableRoundingAmount: number;
    public AccrualID: number;
    public PaymentInfoTypeID: number;
    public TaxExclusiveAmountCurrency: number;
    public RestExclusiveAmountCurrency: number;
    public ShippingPostalCode: string;
    public InvoiceCity: string;
    public InvoicePostalCode: string;
    public InvoiceAddressLine3: string;
    public CurrencyExchangeRate: number;
    public SupplierOrgNumber: string;
    public UpdatedBy: string;
    public DeliveryTermsID: number;
    public CustomerPerson: string;
    public InvoiceCountryCode: string;
    public CreatedBy: string;
    public RestAmountCurrency: number;
    public CreditDays: number;
    public ShippingCountryCode: string;
    public DefaultDimensionsID: number;
    public UseReportID: number;
    public PaymentTermsID: number;
    public CustomerName: string;
    public CurrencyCodeID: number;
    public ShippingAddressLine3: string;
    public CreatedAt: Date;
    public OrderDate: LocalDate;
    public FreeTxt: string;
    public YourReference: string;
    public ShippingCountry: string;
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

    public ID: number;
    public DiscountCurrency: number;
    public VatTypeID: number;
    public SumTotalExVatCurrency: number;
    public SumVatCurrency: number;
    public UpdatedAt: Date;
    public PriceExVat: number;
    public NumberOfItems: number;
    public PriceSetByUser: boolean;
    public SumTotalExVat: number;
    public StatusCode: number;
    public CostPrice: number;
    public Comment: string;
    public Deleted: boolean;
    public SumTotalIncVat: number;
    public PriceExVatCurrency: number;
    public SumVat: number;
    public ReadyToInvoice: boolean;
    public DiscountPercent: number;
    public CustomerOrderID: number;
    public SumTotalIncVatCurrency: number;
    public DimensionsID: number;
    public CurrencyExchangeRate: number;
    public ItemSourceID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Unit: string;
    public SortIndex: number;
    public CalculateGrossPriceBasedOnNetPrice: boolean;
    public CurrencyCodeID: number;
    public Discount: number;
    public CreatedAt: Date;
    public PriceIncVat: number;
    public ItemText: string;
    public AccountID: number;
    public VatPercent: number;
    public ProductID: number;
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

    public InternalNote: string;
    public UpdateCurrencyOnToOrder: boolean;
    public DeliveryTerm: string;
    public OurReference: string;
    public ID: number;
    public TaxExclusiveAmount: number;
    public DistributionPlanID: number;
    public VatTotalsAmountCurrency: number;
    public UpdatedAt: Date;
    public PayableRoundingCurrencyAmount: number;
    public CustomerID: number;
    public InvoiceReceiverName: string;
    public SalesPerson: string;
    public DeliveryDate: LocalDate;
    public ShippingCity: string;
    public DeliveryMethod: string;
    public ShippingAddressLine2: string;
    public TaxInclusiveAmount: number;
    public DefaultSellerID: number;
    public CustomerOrgNumber: string;
    public InvoiceCountry: string;
    public PaymentTerm: string;
    public EmailAddress: string;
    public StatusCode: number;
    public InvoiceAddressLine2: string;
    public QuoteNumberSeriesID: number;
    public VatTotalsAmount: number;
    public Comment: string;
    public Deleted: boolean;
    public DeliveryName: string;
    public PrintStatus: number;
    public TaxInclusiveAmountCurrency: number;
    public ShippingAddressLine1: string;
    public UpdateCurrencyOnToInvoice: boolean;
    public Requisition: string;
    public InvoiceAddressLine1: string;
    public UpdateCurrencyAmountsOnDateChange: boolean;
    public PayableRoundingAmount: number;
    public PaymentInfoTypeID: number;
    public TaxExclusiveAmountCurrency: number;
    public ShippingPostalCode: string;
    public QuoteDate: LocalDate;
    public InvoiceCity: string;
    public InvoicePostalCode: string;
    public InquiryReference: number;
    public QuoteNumber: number;
    public InvoiceAddressLine3: string;
    public CurrencyExchangeRate: number;
    public SupplierOrgNumber: string;
    public UpdatedBy: string;
    public DeliveryTermsID: number;
    public CustomerPerson: string;
    public InvoiceCountryCode: string;
    public CreatedBy: string;
    public CreditDays: number;
    public ShippingCountryCode: string;
    public DefaultDimensionsID: number;
    public UseReportID: number;
    public PaymentTermsID: number;
    public CustomerName: string;
    public CurrencyCodeID: number;
    public ShippingAddressLine3: string;
    public ValidUntilDate: LocalDate;
    public CreatedAt: Date;
    public FreeTxt: string;
    public YourReference: string;
    public ShippingCountry: string;
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

    public ID: number;
    public DiscountCurrency: number;
    public VatTypeID: number;
    public SumTotalExVatCurrency: number;
    public SumVatCurrency: number;
    public UpdatedAt: Date;
    public PriceExVat: number;
    public NumberOfItems: number;
    public PriceSetByUser: boolean;
    public SumTotalExVat: number;
    public StatusCode: number;
    public CostPrice: number;
    public CustomerQuoteID: number;
    public Comment: string;
    public Deleted: boolean;
    public SumTotalIncVat: number;
    public PriceExVatCurrency: number;
    public SumVat: number;
    public DiscountPercent: number;
    public SumTotalIncVatCurrency: number;
    public DimensionsID: number;
    public CurrencyExchangeRate: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Unit: string;
    public SortIndex: number;
    public CalculateGrossPriceBasedOnNetPrice: boolean;
    public CurrencyCodeID: number;
    public Discount: number;
    public CreatedAt: Date;
    public PriceIncVat: number;
    public ItemText: string;
    public AccountID: number;
    public VatPercent: number;
    public ProductID: number;
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

    public ID: number;
    public DebtCollectionAutomationID: number;
    public UpdatedAt: Date;
    public IntegrateWithDebtCollection: boolean;
    public StatusCode: number;
    public Deleted: boolean;
    public CustomerInvoiceReminderSettingsID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public DebtCollectionFormat: number;
    public CreatedAt: Date;
    public CreditorNumber: number;
    public _createguid: string;
    public CustomerInvoiceReminderSettings: CustomerInvoiceReminderSettings;
    public DebtCollectionAutomation: Array<DebtCollectionAutomation>;
    public CustomFields: any;
}


export class ItemSource extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ItemSource';

    public ID: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public _createguid: string;
    public Details: Array<ItemSourceDetail>;
    public CustomFields: any;
}


export class ItemSourceDetail extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ItemSourceDetail';

    public ID: number;
    public Description: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public SourceType: string;
    public ItemSourceID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Tag: string;
    public SourceFK: number;
    public CreatedAt: Date;
    public Amount: number;
    public _createguid: string;
    public CustomFields: any;
}


export class PaymentInfoType extends UniEntity {
    public static RelativeUrl = 'paymentinfotype';
    public static EntityType = 'PaymentInfoType';

    public ID: number;
    public Control: Modulus;
    public UpdatedAt: Date;
    public Name: string;
    public Locked: boolean;
    public StatusCode: number;
    public Deleted: boolean;
    public Length: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Type: PaymentInfoTypeEnum;
    public _createguid: string;
    public PaymentInfoTypeParts: Array<PaymentInfoTypePart>;
    public CustomFields: any;
}


export class PaymentInfoTypePart extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'PaymentInfoTypePart';

    public ID: number;
    public UpdatedAt: Date;
    public Part: string;
    public StatusCode: number;
    public Deleted: boolean;
    public PaymentInfoTypeID: number;
    public Length: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public SortIndex: number;
    public CreatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class RecurringInvoice extends UniEntity {
    public static RelativeUrl = 'recurringinvoices';
    public static EntityType = 'RecurringInvoice';

    public InternalNote: string;
    public DeliveryTerm: string;
    public OurReference: string;
    public ID: number;
    public ProduceAs: RecurringResult;
    public TaxExclusiveAmount: number;
    public DistributionPlanID: number;
    public VatTotalsAmountCurrency: number;
    public UpdatedAt: Date;
    public PayableRoundingCurrencyAmount: number;
    public CustomerID: number;
    public InvoiceReceiverName: string;
    public SalesPerson: string;
    public DeliveryDate: LocalDate;
    public NextInvoiceDate: LocalDate;
    public ShippingCity: string;
    public DeliveryMethod: string;
    public ShippingAddressLine2: string;
    public TaxInclusiveAmount: number;
    public DefaultSellerID: number;
    public CustomerOrgNumber: string;
    public NotifyWhenOrdersArePrepared: boolean;
    public AmountRegards: string;
    public InvoiceCountry: string;
    public PaymentTerm: string;
    public EmailAddress: string;
    public PreparationDays: number;
    public MaxIterations: number;
    public StatusCode: number;
    public InvoiceAddressLine2: string;
    public VatTotalsAmount: number;
    public Comment: string;
    public Deleted: boolean;
    public DeliveryName: string;
    public PrintStatus: number;
    public NotifyUser: string;
    public TaxInclusiveAmountCurrency: number;
    public ShippingAddressLine1: string;
    public TimePeriod: RecurringPeriod;
    public Requisition: string;
    public NoCreditDays: boolean;
    public InvoiceAddressLine1: string;
    public NotifyWhenRecurringEnds: boolean;
    public UpdateCurrencyAmountsOnDateChange: boolean;
    public PayableRoundingAmount: number;
    public PaymentInfoTypeID: number;
    public TaxExclusiveAmountCurrency: number;
    public ShippingPostalCode: string;
    public InvoiceCity: string;
    public EndDate: LocalDate;
    public InvoicePostalCode: string;
    public Interval: number;
    public InvoiceAddressLine3: string;
    public CurrencyExchangeRate: number;
    public SupplierOrgNumber: string;
    public UpdatedBy: string;
    public DeliveryTermsID: number;
    public CustomerPerson: string;
    public InvoiceCountryCode: string;
    public CreatedBy: string;
    public CreditDays: number;
    public ShippingCountryCode: string;
    public InvoiceNumberSeriesID: number;
    public DefaultDimensionsID: number;
    public UseReportID: number;
    public PaymentTermsID: number;
    public PaymentInformation: string;
    public CustomerName: string;
    public CurrencyCodeID: number;
    public ShippingAddressLine3: string;
    public StartDate: LocalDate;
    public CreatedAt: Date;
    public Payment: string;
    public FreeTxt: string;
    public YourReference: string;
    public ShippingCountry: string;
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

    public ID: number;
    public DiscountCurrency: number;
    public VatTypeID: number;
    public SumTotalExVatCurrency: number;
    public SumVatCurrency: number;
    public UpdatedAt: Date;
    public PriceExVat: number;
    public NumberOfItems: number;
    public PriceSetByUser: boolean;
    public SumTotalExVat: number;
    public StatusCode: number;
    public Comment: string;
    public Deleted: boolean;
    public SumTotalIncVat: number;
    public PriceExVatCurrency: number;
    public SumVat: number;
    public DiscountPercent: number;
    public PricingSource: PricingSource;
    public SumTotalIncVatCurrency: number;
    public TimeFactor: RecurringPeriod;
    public RecurringInvoiceID: number;
    public DimensionsID: number;
    public ReduceIncompletePeriod: boolean;
    public CurrencyExchangeRate: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Unit: string;
    public SortIndex: number;
    public CalculateGrossPriceBasedOnNetPrice: boolean;
    public CurrencyCodeID: number;
    public Discount: number;
    public CreatedAt: Date;
    public PriceIncVat: number;
    public ItemText: string;
    public AccountID: number;
    public VatPercent: number;
    public ProductID: number;
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
    public UpdatedAt: Date;
    public InvoiceDate: LocalDate;
    public IterationNumber: number;
    public StatusCode: number;
    public NotifiedOrdersPrepared: boolean;
    public Comment: string;
    public Deleted: boolean;
    public OrderID: number;
    public RecurringInvoiceID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public InvoiceID: number;
    public CreationDate: LocalDate;
    public NotifiedRecurringEnds: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class Seller extends UniEntity {
    public static RelativeUrl = 'sellers';
    public static EntityType = 'Seller';

    public ID: number;
    public UpdatedAt: Date;
    public Name: string;
    public StatusCode: number;
    public UserID: number;
    public Deleted: boolean;
    public EmployeeID: number;
    public TeamID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public DefaultDimensionsID: number;
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

    public ID: number;
    public UpdatedAt: Date;
    public CustomerID: number;
    public SellerID: number;
    public StatusCode: number;
    public CustomerQuoteID: number;
    public Deleted: boolean;
    public CustomerOrderID: number;
    public RecurringInvoiceID: number;
    public UpdatedBy: string;
    public Percent: number;
    public CreatedBy: string;
    public CustomerInvoiceID: number;
    public CreatedAt: Date;
    public Amount: number;
    public _createguid: string;
    public Seller: Seller;
    public CustomFields: any;
}


export class SubCompany extends UniEntity {
    public static RelativeUrl = 'subcompanies';
    public static EntityType = 'SubCompany';

    public CompanyKey: string;
    public ID: number;
    public CompanyID: number;
    public UpdatedAt: Date;
    public CustomerID: number;
    public CompanyType: CompanyRelation;
    public CompanyName: string;
    public StatusCode: number;
    public Deleted: boolean;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public _createguid: string;
    public Customer: Customer;
    public CustomFields: any;
}


export class Supplier extends UniEntity {
    public static RelativeUrl = 'suppliers';
    public static EntityType = 'Supplier';

    public ID: number;
    public SupplierNumber: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public BusinessRelationID: number;
    public Deleted: boolean;
    public SelfEmployed: boolean;
    public WebUrl: string;
    public SubAccountNumberSeriesID: number;
    public Localization: string;
    public CostAllocationID: number;
    public DimensionsID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreditDays: number;
    public CurrencyCodeID: number;
    public CreatedAt: Date;
    public GLN: string;
    public OrgNumber: string;
    public PeppolAddress: string;
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
    public Description: string;
    public UpdatedAt: Date;
    public Name: string;
    public StatusCode: number;
    public Deleted: boolean;
    public UpdatedBy: string;
    public CreatedBy: string;
    public TermsType: TermsType;
    public CreditDays: number;
    public CreatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class TOFCurrencySettings extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'TOFCurrencySettings';

    public UpdateCurrencyAmountsOnQuoteToInvoice: boolean;
    public ID: number;
    public UpdatedAt: Date;
    public UpdateCurrencyAmountsOnQuotedateChange: boolean;
    public StatusCode: number;
    public Deleted: boolean;
    public UpdateCurrencyAmountsOnOrderdateChange: boolean;
    public UpdateCurrencyAmountsOnOrderToInvoice: boolean;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdateCurrencyAmountsOnInvoicedateChange: boolean;
    public UpdateCurrencyAmountsOnQuoteToOrder: boolean;
    public CreatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class Address extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Address';

    public City: string;
    public AddressLine2: string;
    public ID: number;
    public UpdatedAt: Date;
    public CountryCode: string;
    public AddressLine1: string;
    public Region: string;
    public StatusCode: number;
    public BusinessRelationID: number;
    public AddressLine3: string;
    public Deleted: boolean;
    public Country: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public PostalCode: string;
    public _createguid: string;
    public BusinessRelation: BusinessRelation;
    public CustomFields: any;
}


export class BusinessRelation extends UniEntity {
    public static RelativeUrl = 'business-relations';
    public static EntityType = 'BusinessRelation';

    public ID: number;
    public UpdatedAt: Date;
    public Name: string;
    public DefaultEmailID: number;
    public DefaultPhoneID: number;
    public StatusCode: number;
    public Deleted: boolean;
    public InvoiceAddressID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public DefaultBankAccountID: number;
    public CreatedAt: Date;
    public ShippingAddressID: number;
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

    public ID: number;
    public Role: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public Comment: string;
    public InfoID: number;
    public Deleted: boolean;
    public ParentBusinessRelationID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public _createguid: string;
    public ParentBusinessRelation: BusinessRelation;
    public Info: BusinessRelation;
    public CustomFields: any;
}


export class Email extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Email';

    public ID: number;
    public Description: string;
    public UpdatedAt: Date;
    public EmailAddress: string;
    public StatusCode: number;
    public BusinessRelationID: number;
    public Deleted: boolean;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Type: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Phone extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Phone';

    public ID: number;
    public Description: string;
    public UpdatedAt: Date;
    public CountryCode: string;
    public StatusCode: number;
    public Number: string;
    public BusinessRelationID: number;
    public Deleted: boolean;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Type: PhoneTypeEnum;
    public _createguid: string;
    public CustomFields: any;
}


export class AGACalculation extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AGACalculation';

    public ID: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public PayrollRunID: number;
    public DimensionsID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
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
    public UpdatedAt: Date;
    public freeAmount: number;
    public StatusCode: number;
    public Deleted: boolean;
    public UpdatedBy: string;
    public CreatedBy: string;
    public AGACalculationID: number;
    public CreatedAt: Date;
    public SubEntityID: number;
    public _createguid: string;
    public subEntity: SubEntity;
    public CustomFields: any;
}


export class AGATax extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AGATax';

    public ID: number;
    public agaRate: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public AGARateID: number;
    public Deleted: boolean;
    public zone: number;
    public beregningsKode: number;
    public agaBase: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public AGACalculationID: number;
    public CreatedAt: Date;
    public SubEntityID: number;
    public municipalityName: string;
    public _createguid: string;
    public zoneName: string;
    public subEntity: SubEntity;
    public CustomFields: any;
}


export class AGAPension extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AGAPension';

    public ID: number;
    public agaRate: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public AGARateID: number;
    public Deleted: boolean;
    public zone: number;
    public beregningsKode: number;
    public agaBase: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public AGACalculationID: number;
    public CreatedAt: Date;
    public SubEntityID: number;
    public municipalityName: string;
    public _createguid: string;
    public zoneName: string;
    public subEntity: SubEntity;
    public CustomFields: any;
}


export class AGADraw extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AGADraw';

    public ID: number;
    public agaRate: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public AGARateID: number;
    public Deleted: boolean;
    public zone: number;
    public beregningsKode: number;
    public agaBase: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public AGACalculationID: number;
    public CreatedAt: Date;
    public SubEntityID: number;
    public municipalityName: string;
    public _createguid: string;
    public zoneName: string;
    public subEntity: SubEntity;
    public CustomFields: any;
}


export class ForeignerWithPercent extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ForeignerWithPercent';

    public ID: number;
    public agaRate: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public agaBase: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public AGACalculationID: number;
    public CreatedAt: Date;
    public SubEntityID: number;
    public municipalityName: string;
    public _createguid: string;
    public zoneName: string;
    public subEntity: SubEntity;
    public CustomFields: any;
}


export class DrawForeignerWithPercent extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'DrawForeignerWithPercent';

    public ID: number;
    public agaRate: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public agaBase: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public AGACalculationID: number;
    public CreatedAt: Date;
    public SubEntityID: number;
    public municipalityName: string;
    public _createguid: string;
    public zoneName: string;
    public subEntity: SubEntity;
    public CustomFields: any;
}


export class ForeignerWithAmount extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ForeignerWithAmount';

    public ID: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public aga: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public AGACalculationID: number;
    public CreatedAt: Date;
    public SubEntityID: number;
    public persons: number;
    public municipalityName: string;
    public _createguid: string;
    public zoneName: string;
    public subEntity: SubEntity;
    public CustomFields: any;
}


export class TaxAndAgaSums extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'TaxAndAgaSums';

    public ID: number;
    public UpdatedAt: Date;
    public FinancialTax: number;
    public StatusCode: number;
    public GarnishmentTax: number;
    public WithholdingTax: number;
    public Deleted: boolean;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class AmeldingData extends UniEntity {
    public static RelativeUrl = 'amelding';
    public static EntityType = 'AmeldingData';

    public ID: number;
    public altinnStatus: string;
    public receiptID: number;
    public UpdatedAt: Date;
    public year: number;
    public created: Date;
    public status: number;
    public feedbackFileID: number;
    public StatusCode: number;
    public Deleted: boolean;
    public OppgaveHash: string;
    public attachmentFileID: number;
    public messageID: string;
    public PayrollRunID: number;
    public initiated: Date;
    public period: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public mainFileID: number;
    public CreatedAt: Date;
    public type: AmeldingType;
    public sent: Date;
    public replacesID: number;
    public xmlValidationErrors: string;
    public _createguid: string;
    public replaceThis: string;
    public log: Array<AmeldingLog>;
    public CustomFields: any;
}


export class AmeldingLog extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AmeldingLog';

    public ID: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public AmeldingsID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public registry: SalaryRegistry;
    public CreatedAt: Date;
    public key: number;
    public _createguid: string;
    public CustomFields: any;
}


export class BasicAmount extends UniEntity {
    public static RelativeUrl = 'basicamounts';
    public static EntityType = 'BasicAmount';

    public AveragePrYear: number;
    public ID: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public BasicAmountPrMonth: number;
    public BasicAmountPrYear: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public FromDate: Date;
    public ConversionFactor: number;
    public _createguid: string;
    public CustomFields: any;
}


export class CompanySalary extends UniEntity {
    public static RelativeUrl = 'companysalary';
    public static EntityType = 'CompanySalary';

    public ID: number;
    public Base_SpesialDeductionForMaritim: boolean;
    public PostGarnishmentToTaxAccount: boolean;
    public MainAccountCostFinancial: number;
    public UpdatedAt: Date;
    public PaycheckZipReportID: number;
    public RateFinancialTax: number;
    public CalculateFinancialTax: boolean;
    public MainAccountCostAGAVacation: number;
    public Base_NettoPaymentForMaritim: boolean;
    public WageDeductionDueToHoliday: WageDeductionDueToHolidayType;
    public HourFTEs: number;
    public FreeAmount: number;
    public StatusCode: number;
    public PostToTaxDraw: boolean;
    public MainAccountAllocatedFinancial: number;
    public MainAccountAllocatedAGAVacation: number;
    public MainAccountAllocatedFinancialVacation: number;
    public InterrimRemitAccount: number;
    public Deleted: boolean;
    public WagetypeAdvancePaymentAuto: number;
    public AnnualStatementZipReportID: number;
    public PaymentInterval: CompanySalaryPaymentInterval;
    public AllowOver6G: boolean;
    public Base_JanMayenAndBiCountries: boolean;
    public MainAccountCostAGA: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Base_TaxFreeOrganization: boolean;
    public MainAccountAllocatedAGA: number;
    public Base_PayAsYouEarnTaxOnPensions: boolean;
    public HoursPerMonth: number;
    public WagetypeAdvancePayment: number;
    public Base_Svalbard: boolean;
    public OtpExportActive: boolean;
    public MainAccountCostVacation: number;
    public MainAccountCostFinancialVacation: number;
    public CreatedAt: Date;
    public MainAccountAllocatedVacation: number;
    public Base_NettoPayment: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class CompanyVacationRate extends UniEntity {
    public static RelativeUrl = 'companyvacationrates';
    public static EntityType = 'CompanyVacationRate';

    public ID: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public Rate60: number;
    public Deleted: boolean;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public FromDate: Date;
    public Rate: number;
    public _createguid: string;
    public CustomFields: any;
}


export class EmployeeCategory extends UniEntity {
    public static RelativeUrl = 'employeecategories';
    public static EntityType = 'EmployeeCategory';

    public ID: number;
    public EmployeeCategoryLinkID: number;
    public UpdatedAt: Date;
    public Name: string;
    public StatusCode: number;
    public Deleted: boolean;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class EmployeeCategoryLink extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'EmployeeCategoryLink';

    public ID: number;
    public EmployeeCategoryID: number;
    public EmployeeNumber: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public EmployeeID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public _createguid: string;
    public EmployeeCategory: EmployeeCategory;
    public Employee: Employee;
    public CustomFields: any;
}


export class Employee extends UniEntity {
    public static RelativeUrl = 'employees';
    public static EntityType = 'Employee';

    public ID: number;
    public MunicipalityNo: string;
    public EmployeeNumber: number;
    public TypeOfPaymentOtp: TypeOfPaymentOtp;
    public EmploymentDate: Date;
    public InternationalID: string;
    public UpdatedAt: Date;
    public Sex: GenderEnum;
    public EmploymentDateOtp: LocalDate;
    public ForeignWorker: ForeignWorker;
    public OtpExport: boolean;
    public StatusCode: number;
    public UserID: number;
    public BusinessRelationID: number;
    public InternasjonalIDCountry: string;
    public Active: boolean;
    public OtpStatus: OtpStatus;
    public Deleted: boolean;
    public PhotoID: number;
    public EndDateOtp: LocalDate;
    public IncludeOtpUntilYear: number;
    public PaymentInterval: PaymentInterval;
    public IncludeOtpUntilMonth: number;
    public EmployeeLanguageID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public BirthDate: Date;
    public AdvancePaymentAmount: number;
    public SocialSecurityNumber: string;
    public CreatedAt: Date;
    public FreeText: string;
    public InternasjonalIDType: InternationalIDType;
    public SubEntityID: number;
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

    public NotMainEmployer: boolean;
    public loennTilUtenrikstjenestemannID: number;
    public ID: number;
    public NonTaxableAmount: number;
    public EmployeeNumber: number;
    public IssueDate: Date;
    public UpdatedAt: Date;
    public Year: number;
    public TaxcardId: number;
    public SKDXml: string;
    public StatusCode: number;
    public ufoereYtelserAndreID: number;
    public loennKunTrygdeavgiftTilUtenlandskBorgerID: number;
    public loennFraBiarbeidsgiverID: number;
    public Deleted: boolean;
    public SecondaryTable: string;
    public pensjonID: number;
    public EmployeeID: number;
    public Table: string;
    public SecondaryPercent: number;
    public ResultatStatus: string;
    public loennFraHovedarbeidsgiverID: number;
    public UpdatedBy: string;
    public Percent: number;
    public CreatedBy: string;
    public Tilleggsopplysning: string;
    public CreatedAt: Date;
    public loennKunTrygdeavgiftTilUtenlandskBorgerSomGrensegjengerID: number;
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
    public NonTaxableAmount: number;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public tabellType: TabellType;
    public Table: string;
    public AntallMaanederForTrekk: number;
    public UpdatedBy: string;
    public Percent: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public freeAmountType: FreeAmountType;
    public _createguid: string;
    public CustomFields: any;
}


export class EmployeeLeave extends UniEntity {
    public static RelativeUrl = 'EmployeeLeave';
    public static EntityType = 'EmployeeLeave';

    public ID: number;
    public EmploymentID: number;
    public Description: string;
    public UpdatedAt: Date;
    public LeavePercent: number;
    public StatusCode: number;
    public Deleted: boolean;
    public LeaveType: Leavetype;
    public AffectsOtp: boolean;
    public UpdatedBy: string;
    public CreatedBy: string;
    public ToDate: Date;
    public CreatedAt: Date;
    public FromDate: Date;
    public _createguid: string;
    public Employment: Employment;
    public CustomFields: any;
}


export class Employment extends UniEntity {
    public static RelativeUrl = 'employments';
    public static EntityType = 'Employment';

    public RemunerationType: RemunerationType;
    public ID: number;
    public EmployeeNumber: number;
    public WorkingHoursScheme: WorkingHoursScheme;
    public SeniorityDate: Date;
    public UpdatedAt: Date;
    public ShipReg: ShipRegistry;
    public LastWorkPercentChangeDate: Date;
    public TradeArea: ShipTradeArea;
    public JobName: string;
    public StatusCode: number;
    public HourRate: number;
    public HoursPerWeek: number;
    public Deleted: boolean;
    public UserDefinedRate: number;
    public EmployeeID: number;
    public LedgerAccount: string;
    public MonthRate: number;
    public EndDate: Date;
    public EmploymentType: EmploymentType;
    public DimensionsID: number;
    public EndDateReason: EndDateReason;
    public LastSalaryChangeDate: Date;
    public JobCode: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public RegulativeStepNr: number;
    public ShipType: ShipTypeOfShip;
    public StartDate: Date;
    public Standard: boolean;
    public CreatedAt: Date;
    public TypeOfEmployment: TypeOfEmployment;
    public PayGrade: string;
    public SubEntityID: number;
    public RegulativeGroupID: number;
    public WorkPercent: number;
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
    public Description: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public AffectsAGA: boolean;
    public Deleted: boolean;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public FromDate: Date;
    public SubentityID: number;
    public Amount: number;
    public _createguid: string;
    public CustomFields: any;
}


export class IncomeReportData extends UniEntity {
    public static RelativeUrl = 'income-reports';
    public static EntityType = 'IncomeReportData';

    public ID: number;
    public EmploymentID: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public AltinnReceiptID: number;
    public MonthlyRefund: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Xml: string;
    public CreatedAt: Date;
    public Type: string;
    public _createguid: string;
    public AltinnReceipt: AltinnReceipt;
    public Employment: Employment;
    public CustomFields: any;
}


export class OtpExportWagetype extends UniEntity {
    public static RelativeUrl = 'otpexportwagetypes';
    public static EntityType = 'OtpExportWagetype';

    public WageTypeNumber: number;
    public ID: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class PayrollRun extends UniEntity {
    public static RelativeUrl = 'payrollrun';
    public static EntityType = 'PayrollRun';

    public PaycheckFileID: number;
    public ID: number;
    public taxdrawfactor: TaxDrawFactor;
    public AGAFreeAmount: number;
    public Description: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public AGAonRun: number;
    public Deleted: boolean;
    public SettlementDate: Date;
    public HolidayPayDeduction: boolean;
    public ExcludeRecurringPosts: boolean;
    public JournalEntryNumber: string;
    public PayDate: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public needsRecalc: boolean;
    public ToDate: Date;
    public CreatedAt: Date;
    public FreeText: string;
    public FromDate: Date;
    public _createguid: string;
    public transactions: Array<SalaryTransaction>;
    public agacalculation: Array<AGACalculation>;
    public CustomFields: any;
}


export class PayrollRunCategoryLink extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'PayrollRunCategoryLink';

    public ID: number;
    public EmployeeCategoryID: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public PayrollRunID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public _createguid: string;
    public EmployeeCategory: EmployeeCategory;
    public PayrollRun: PayrollRun;
    public CustomFields: any;
}


export class PostingSummaryDraft extends UniEntity {
    public ID: number;
    public status: SummaryJobStatus;
    public draftBasic: string;
    public draftWithDims: string;
    public statusTime: Date;
    public PayrollID: number;
    public draftWithDimsOnBalance: string;
    public JobInfoID: number;
}


export class Regulative extends UniEntity {
    public static RelativeUrl = 'regulatives';
    public static EntityType = 'Regulative';

    public ID: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public UpdatedBy: string;
    public CreatedBy: string;
    public StartDate: LocalDate;
    public CreatedAt: Date;
    public RegulativeGroupID: number;
    public _createguid: string;
    public Steps: Array<RegulativeStep>;
    public CustomFields: any;
}


export class RegulativeGroup extends UniEntity {
    public static RelativeUrl = 'regulativegroups';
    public static EntityType = 'RegulativeGroup';

    public ID: number;
    public UpdatedAt: Date;
    public Name: string;
    public StatusCode: number;
    public Deleted: boolean;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public _createguid: string;
    public Regulatives: Array<Regulative>;
    public CustomFields: any;
}


export class RegulativeStep extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'RegulativeStep';

    public ID: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public UpdatedBy: string;
    public CreatedBy: string;
    public RegulativeID: number;
    public Step: number;
    public CreatedAt: Date;
    public Amount: number;
    public _createguid: string;
    public CustomFields: any;
}


export class SalaryBalance extends UniEntity {
    public static RelativeUrl = 'salarybalances';
    public static EntityType = 'SalaryBalance';

    public CreatePayment: boolean;
    public WageTypeNumber: number;
    public ID: number;
    public EmploymentID: number;
    public MinAmount: number;
    public UpdatedAt: Date;
    public Name: string;
    public SupplierID: number;
    public Instalment: number;
    public StatusCode: number;
    public Deleted: boolean;
    public EmployeeID: number;
    public KID: string;
    public SalaryBalanceTemplateID: number;
    public InstalmentPercent: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public InstalmentType: SalBalType;
    public Source: SalBalSource;
    public ToDate: Date;
    public CreatedAt: Date;
    public Type: SalBalDrawType;
    public FromDate: Date;
    public MaxAmount: number;
    public CalculatedBalance: number;
    public Balance: number;
    public _createguid: string;
    public Amount: number;
    public Employee: Employee;
    public Supplier: Supplier;
    public Transactions: Array<SalaryBalanceLine>;
    public Employment: Employment;
    public CustomFields: any;
}


export class SalaryBalanceLine extends UniEntity {
    public static RelativeUrl = 'salarybalancelines';
    public static EntityType = 'SalaryBalanceLine';

    public ID: number;
    public SalaryTransactionID: number;
    public Description: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public UpdatedBy: string;
    public CreatedBy: string;
    public SalaryBalanceID: number;
    public Date: LocalDate;
    public CreatedAt: Date;
    public Amount: number;
    public _createguid: string;
    public SalaryTransaction: SalaryTransaction;
    public SalaryBalance: SalaryBalance;
    public CustomFields: any;
}


export class SalaryBalanceTemplate extends UniEntity {
    public static RelativeUrl = 'salarybalancetemplates';
    public static EntityType = 'SalaryBalanceTemplate';

    public CreatePayment: boolean;
    public WageTypeNumber: number;
    public ID: number;
    public MinAmount: number;
    public UpdatedAt: Date;
    public Name: string;
    public SupplierID: number;
    public Instalment: number;
    public StatusCode: number;
    public SalarytransactionDescription: string;
    public Deleted: boolean;
    public Account: number;
    public KID: string;
    public InstalmentPercent: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public InstalmentType: SalBalType;
    public CreatedAt: Date;
    public MaxAmount: number;
    public _createguid: string;
    public Supplier: Supplier;
    public SalaryBalances: Array<SalaryBalance>;
    public CustomFields: any;
}


export class SalaryTransaction extends UniEntity {
    public static RelativeUrl = 'salarytrans';
    public static EntityType = 'SalaryTransaction';

    public WageTypeNumber: number;
    public ID: number;
    public MunicipalityNo: string;
    public Text: string;
    public EmploymentID: number;
    public EmployeeNumber: number;
    public VatTypeID: number;
    public Sum: number;
    public UpdatedAt: Date;
    public calcAGA: number;
    public SalaryTransactionCarInfoID: number;
    public SystemType: StdSystemType;
    public recurringPostValidFrom: Date;
    public StatusCode: number;
    public TaxbasisID: number;
    public Deleted: boolean;
    public HolidayPayDeduction: boolean;
    public Account: number;
    public EmployeeID: number;
    public recurringPostValidTo: Date;
    public WageTypeID: number;
    public ChildSalaryTransactionID: number;
    public PayrollRunID: number;
    public DimensionsID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public RecurringID: number;
    public SalaryBalanceID: number;
    public IsRecurringPost: boolean;
    public ToDate: Date;
    public CreatedAt: Date;
    public FromDate: Date;
    public Rate: number;
    public Amount: number;
    public _createguid: string;
    public payrollrun: PayrollRun;
    public Employee: Employee;
    public Wagetype: WageType;
    public employment: Employment;
    public Dimensions: Dimensions;
    public Supplements: Array<SalaryTransactionSupplement>;
    public Taxbasis: TaxBasis;
    public VatType: VatType;
    public CarInfo: SalaryTransactionCarInfo;
    public CustomFields: any;
}


export class SalaryTransactionCarInfo extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'SalaryTransactionCarInfo';

    public ID: number;
    public IsElectric: boolean;
    public UpdatedAt: Date;
    public RegistrationYear: number;
    public StatusCode: number;
    public Deleted: boolean;
    public UpdatedBy: string;
    public CreatedBy: string;
    public IsLongRange: boolean;
    public CreatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class SalaryTransactionSupplement extends UniEntity {
    public static RelativeUrl = 'supplements';
    public static EntityType = 'SalaryTransactionSupplement';

    public ID: number;
    public SalaryTransactionID: number;
    public UpdatedAt: Date;
    public ValueMoney: number;
    public StatusCode: number;
    public Deleted: boolean;
    public ValueDate2: Date;
    public WageTypeSupplementID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public ValueBool: boolean;
    public CreatedAt: Date;
    public ValueDate: Date;
    public ValueString: string;
    public _createguid: string;
    public WageTypeSupplement: WageTypeSupplement;
    public CustomFields: any;
}


export class SalaryYear extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'SalaryYear';

    public ID: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CurrentYear: number;
    public CreatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class SubEntity extends UniEntity {
    public static RelativeUrl = 'subentities';
    public static EntityType = 'SubEntity';

    public ID: number;
    public MunicipalityNo: string;
    public AgaZone: number;
    public AgaRule: number;
    public UpdatedAt: Date;
    public freeAmount: number;
    public StatusCode: number;
    public BusinessRelationID: number;
    public Deleted: boolean;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public OrgNumber: string;
    public SuperiorOrganizationID: number;
    public _createguid: string;
    public BusinessRelationInfo: BusinessRelation;
    public SuperiorOrganization: SubEntity;
    public CustomFields: any;
}


export class TaxBasis extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'TaxBasis';

    public ID: number;
    public SalaryTransactionID: number;
    public JanMayenBasis: number;
    public UpdatedAt: Date;
    public SvalbardBasis: number;
    public ForeignBorderCommuterBasis: number;
    public PensionBasis: number;
    public Basis: number;
    public StatusCode: number;
    public DisabilityOtherBasis: number;
    public SailorBasis: number;
    public Deleted: boolean;
    public ForeignCitizenInsuranceBasis: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public PensionSourcetaxBasis: number;
    public CreatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class Travel extends UniEntity {
    public static RelativeUrl = 'travels';
    public static EntityType = 'Travel';

    public ID: number;
    public EmployeeNumber: number;
    public Description: string;
    public UpdatedAt: Date;
    public Name: string;
    public State: state;
    public SupplierID: number;
    public PersonID: string;
    public StatusCode: number;
    public Comment: string;
    public Deleted: boolean;
    public SourceSystem: string;
    public Purpose: string;
    public TravelIdentificator: string;
    public DimensionsID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Phone: string;
    public Email: string;
    public CreatedAt: Date;
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
    public ID: number;
    public VatTypeID: number;
    public Description: string;
    public UpdatedAt: Date;
    public TravelID: number;
    public To: Date;
    public StatusCode: number;
    public paytransID: number;
    public CostType: costtype;
    public TypeID: number;
    public Deleted: boolean;
    public InvoiceAccount: number;
    public TravelIdentificator: string;
    public From: Date;
    public DimensionsID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public LineState: linestate;
    public CreatedAt: Date;
    public Rate: number;
    public Amount: number;
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
    public ID: number;
    public ForeignTypeID: string;
    public Description: string;
    public UpdatedAt: Date;
    public ForeignDescription: string;
    public StatusCode: number;
    public Deleted: boolean;
    public InvoiceAccount: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class VacationPayLine extends UniEntity {
    public static RelativeUrl = 'VacationPayLines';
    public static EntityType = 'VacationPayLine';

    public ID: number;
    public UpdatedAt: Date;
    public Year: number;
    public StatusCode: number;
    public Deleted: boolean;
    public EmployeeID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public ManualVacationPayBase: number;
    public PaidTaxFreeVacationPay: number;
    public Age: number;
    public _createguid: string;
    public Rate60: number;
    public VacationPay: number;
    public MissingEarlierVacationPay: number;
    public SystemVacationPayBase: number;
    public VacationPay60: number;
    public PaidVacationPay: number;
    public Rate: number;
    public Withdrawal: number;
    public Employee: Employee;
    public CustomFields: any;
}


export class VacationRateEmployee extends UniEntity {
    public static RelativeUrl = 'employeevacationrates';
    public static EntityType = 'VacationRateEmployee';

    public ID: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public Rate60: number;
    public Deleted: boolean;
    public EmployeeID: number;
    public EndDate: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public StartDate: Date;
    public CreatedAt: Date;
    public Rate: number;
    public _createguid: string;
    public CustomFields: any;
}


export class WageType extends UniEntity {
    public static RelativeUrl = 'wagetypes';
    public static EntityType = 'WageType';

    public AccountNumber: number;
    public WageTypeNumber: number;
    public ID: number;
    public Limit_type: LimitType;
    public GetRateFrom: GetRateFrom;
    public HideFromPaycheck: boolean;
    public Description: string;
    public UpdatedAt: Date;
    public SpecialTaxHandling: string;
    public Systemtype: string;
    public StatusCode: number;
    public Base_div2: boolean;
    public Limit_newRate: number;
    public RateFactor: number;
    public SupplementPackage: string;
    public taxtype: TaxType;
    public Deleted: boolean;
    public SpecialTaxAndContributionsRule: SpecialTaxAndContributionsRule;
    public Limit_WageTypeNumber: number;
    public Base_Payment: boolean;
    public Base_Vacation: boolean;
    public ValidYear: number;
    public Benefit: string;
    public StandardWageTypeFor: StdWageType;
    public Base_EmploymentTax: boolean;
    public Postnr: string;
    public Limit_value: number;
    public UpdatedBy: string;
    public SystemRequiredWageType: number;
    public CreatedBy: string;
    public SpecialAgaRule: SpecialAgaRule;
    public AccountNumber_balance: number;
    public Base_div3: boolean;
    public RatetypeColumn: RateTypeColumn;
    public IncomeType: string;
    public CreatedAt: Date;
    public NoNumberOfHours: boolean;
    public WageTypeName: string;
    public Rate: number;
    public DaysOnBoard: boolean;
    public FixedSalaryHolidayDeduction: boolean;
    public _createguid: string;
    public SupplementaryInformations: Array<WageTypeSupplement>;
    public CustomFields: any;
}


export class WageTypeSupplement extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'WageTypeSupplement';

    public ID: number;
    public Description: string;
    public UpdatedAt: Date;
    public Name: string;
    public GetValueFromTrans: boolean;
    public StatusCode: number;
    public SuggestedValue: string;
    public Deleted: boolean;
    public WageTypeID: number;
    public ameldingType: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public ValueType: Valuetype;
    public CreatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class WageTypeTranslation extends UniEntity {
    public static RelativeUrl = 'wagetypetranslations';
    public static EntityType = 'WageTypeTranslation';

    public WageTypeNumber: number;
    public ID: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public EmployeeLanguageID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public WageTypeName: string;
    public _createguid: string;
    public EmployeeLanguage: EmployeeLanguage;
    public CustomFields: any;
}


export class PensionScheme extends UniEntity {
    public static RelativeUrl = 'pensionschemes';
    public static EntityType = 'PensionScheme';

    public ID: number;
    public UpdatedAt: Date;
    public Year: number;
    public Identificator: string;
    public StatusCode: number;
    public Deleted: boolean;
    public Period: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class PensionSchemeSupplier extends UniEntity {
    public static RelativeUrl = 'pensionschemesuppliers';
    public static EntityType = 'PensionSchemeSupplier';

    public ID: number;
    public UpdatedAt: Date;
    public Name: string;
    public Identificator: string;
    public StatusCode: number;
    public Deleted: boolean;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class StandardPensionSchemeSupplier extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'StandardPensionSchemeSupplier';

    public ID: number;
    public UpdatedAt: Date;
    public Name: string;
    public Identificator: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class EmployeeLanguage extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'EmployeeLanguage';

    public ID: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public UpdatedBy: string;
    public CreatedBy: string;
    public LanguageCode: string;
    public CreatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class ComponentLayout extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ComponentLayout';

    public ID: number;
    public UpdatedAt: Date;
    public Name: string;
    public StatusCode: number;
    public BaseEntity: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public _createguid: string;
    public Fields: Array<FieldLayout>;
    public CustomFields: any;
}


export class FieldLayout extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'FieldLayout';

    public ID: number;
    public ReadOnly: boolean;
    public Description: string;
    public UpdatedAt: Date;
    public Legend: string;
    public ComponentLayoutID: number;
    public LineBreak: boolean;
    public Width: string;
    public Sectionheader: string;
    public Options: string;
    public StatusCode: number;
    public Section: number;
    public FieldSet: number;
    public Label: string;
    public Placement: number;
    public Deleted: boolean;
    public Alignment: Alignment;
    public Hidden: boolean;
    public LookupField: boolean;
    public Combo: number;
    public DisplayField: string;
    public HelpText: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public EntityType: string;
    public Placeholder: string;
    public CreatedAt: Date;
    public FieldType: FieldType;
    public Property: string;
    public _createguid: string;
    public CustomFields: any;
}


export class CurrencyOverride extends UniEntity {
    public static RelativeUrl = 'currencyoverrides';
    public static EntityType = 'CurrencyOverride';

    public ID: number;
    public FromCurrencyCodeID: number;
    public UpdatedAt: Date;
    public Factor: number;
    public ExchangeRate: number;
    public Deleted: boolean;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Source: CurrencySourceEnum;
    public ToCurrencyCodeID: number;
    public ToDate: LocalDate;
    public CreatedAt: Date;
    public FromDate: LocalDate;
    public _createguid: string;
    public FromCurrencyCode: CurrencyCode;
    public ToCurrencyCode: CurrencyCode;
    public CustomFields: any;
}


export class AccountAssetGroup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AccountAssetGroup';

    public ID: number;
    public UpdatedAt: Date;
    public FromAccountNumber: number;
    public Deleted: boolean;
    public UpdatedBy: string;
    public CreatedBy: string;
    public ToAccountNumber: number;
    public AssetGroupCode: string;
    public CreatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class AccountGroupSetup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AccountGroupSetup';

    public ID: number;
    public UpdatedAt: Date;
    public Name: string;
    public Deleted: boolean;
    public PlanType: PlanTypeEnum;
    public ParentID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public ExternalReference: string;
    public CreatedAt: Date;
    public _createguid: string;
    public Parent: AccountGroupSetup;
    public CustomFields: any;
}


export class AccountSetup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AccountSetup';

    public AccountNumber: number;
    public ID: number;
    public UpdatedAt: Date;
    public Visible: boolean;
    public AccountName: string;
    public VatCode: string;
    public SaftMappingAccountID: number;
    public Deleted: boolean;
    public PlanType: PlanTypeEnum;
    public AccountGroupSetupID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
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
    public UpdatedAt: Date;
    public Name: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public _createguid: string;
    public Accounts: Array<AccountVisibilityGroupAccount>;
    public CompanyTypes: Array<CompanyType>;
    public CustomFields: any;
}


export class AccountVisibilityGroupAccount extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AccountVisibilityGroupAccount';

    public ID: number;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public AccountSetupID: number;
    public UpdatedBy: string;
    public AccountVisibilityGroupID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class AGARate extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AGARate';

    public ZoneID: number;
    public ID: number;
    public UpdatedAt: Date;
    public RateValidFrom: Date;
    public Deleted: boolean;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Rate: number;
    public _createguid: string;
    public sector: Array<AGASector>;
    public CustomFields: any;
}


export class AGASector extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AGASector';

    public RateID: number;
    public ID: number;
    public UpdatedAt: Date;
    public freeAmount: number;
    public ValidFrom: Date;
    public Deleted: boolean;
    public UpdatedBy: string;
    public CreatedBy: string;
    public SectorID: number;
    public Sector: string;
    public CreatedAt: Date;
    public Rate: number;
    public _createguid: string;
    public CustomFields: any;
}


export class AGAZone extends UniEntity {
    public static RelativeUrl = 'AGAZones';
    public static EntityType = 'AGAZone';

    public ID: number;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public ZoneName: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public _createguid: string;
    public rates: Array<AGARate>;
    public municipalsOnZone: Array<MunicipalAGAZone>;
    public CustomFields: any;
}


export class Agreement extends UniEntity {
    public static RelativeUrl = 'agreements';
    public static EntityType = 'Agreement';

    public ID: number;
    public UpdatedAt: Date;
    public Name: string;
    public Template: string;
    public ValidFrom: Date;
    public Deleted: boolean;
    public UpdatedBy: string;
    public CreatedBy: string;
    public AppliesTo: number;
    public CreatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class AltinnAccountFormLink extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AltinnAccountFormLink';

    public AccountNumber: number;
    public ID: number;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public Ref: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class AssetGroup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AssetGroup';

    public ID: number;
    public UpdatedAt: Date;
    public Code: string;
    public Name: string;
    public DepreciationAccountNumber: number;
    public Deleted: boolean;
    public DepreciationRate: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public DepreciationYears: number;
    public ToDate: Date;
    public CreatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class BankIdentifierCode extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'BankIdentifierCode';

    public ID: number;
    public UpdatedAt: Date;
    public BankIdentifier: string;
    public Deleted: boolean;
    public Bic: string;
    public BankName: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class CompanyType extends UniEntity {
    public static RelativeUrl = 'companytypes';
    public static EntityType = 'CompanyType';

    public ID: number;
    public Description: string;
    public DefaultPlanType: PlanTypeEnum;
    public UpdatedAt: Date;
    public Name: string;
    public Priority: boolean;
    public Deleted: boolean;
    public FullName: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public DefaultAccountVisibilityGroupID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class Confirmation extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Confirmation';

    public ID: number;
    public DisplayName: string;
    public UpdatedAt: Date;
    public Code: string;
    public CompanyName: string;
    public StatusCode: number;
    public Deleted: boolean;
    public ContractType: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Phone: string;
    public Email: string;
    public CreatedAt: Date;
    public ExpirationDate: Date;
    public PostalCode: string;
    public SignUpReferrer: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Country extends UniEntity {
    public static RelativeUrl = 'countries';
    public static EntityType = 'Country';

    public ID: number;
    public UpdatedAt: Date;
    public CountryCode: string;
    public CurrencyRateSource: string;
    public Name: string;
    public Deleted: boolean;
    public DefaultCurrencyCode: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class Currency extends UniEntity {
    public static RelativeUrl = 'currencies';
    public static EntityType = 'Currency';

    public ID: number;
    public FromCurrencyCodeID: number;
    public UpdatedAt: Date;
    public Factor: number;
    public ExchangeRate: number;
    public Deleted: boolean;
    public CurrencyDate: LocalDate;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Source: CurrencySourceEnum;
    public ToCurrencyCodeID: number;
    public CreatedAt: Date;
    public _createguid: string;
    public FromCurrencyCode: CurrencyCode;
    public ToCurrencyCode: CurrencyCode;
    public CustomFields: any;
}


export class CurrencyCode extends UniEntity {
    public static RelativeUrl = 'currencycodes';
    public static EntityType = 'CurrencyCode';

    public ID: number;
    public Description: string;
    public UpdatedAt: Date;
    public Code: string;
    public Name: string;
    public Deleted: boolean;
    public ShortCode: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class DebtCollectionAutomation extends UniEntity {
    public static RelativeUrl = 'debtcollectionautomation';
    public static EntityType = 'DebtCollectionAutomation';

    public ID: number;
    public Description: string;
    public UpdatedAt: Date;
    public Name: string;
    public Deleted: boolean;
    public DebtCollectionSettingsID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public _createguid: string;
    public DebtCollectionSettings: DebtCollectionSettings;
    public CustomFields: any;
}


export class EmploymentValidValues extends UniEntity {
    public static RelativeUrl = 'employmentvalidvalues';
    public static EntityType = 'EmploymentValidValues';

    public RemunerationType: boolean;
    public ID: number;
    public WorkingHoursScheme: boolean;
    public SeniorityDate: boolean;
    public UpdatedAt: Date;
    public ShipReg: boolean;
    public PaymentType: RemunerationType;
    public TradeArea: boolean;
    public JobName: boolean;
    public HourRate: boolean;
    public HoursPerWeek: boolean;
    public Deleted: boolean;
    public UserDefinedRate: boolean;
    public LastWorkPercentChange: boolean;
    public MonthRate: boolean;
    public employment: TypeOfEmployment;
    public EndDate: boolean;
    public LastSalaryChangeDate: boolean;
    public JobCode: boolean;
    public UpdatedBy: string;
    public CreatedBy: string;
    public ShipType: boolean;
    public StartDate: boolean;
    public CreatedAt: Date;
    public typeOfEmployment: boolean;
    public WorkPercent: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class FinancialDeadline extends UniEntity {
    public static RelativeUrl = 'deadlines';
    public static EntityType = 'FinancialDeadline';

    public ID: number;
    public PassableDueDate: number;
    public UpdatedAt: Date;
    public Name: string;
    public StatusCode: number;
    public Deleted: boolean;
    public Deadline: LocalDate;
    public AdditionalInfo: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Type: FinancialDeadlineType;
    public _createguid: string;
    public CustomFields: any;
}


export class JobTicket extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'JobTicket';

    public ID: number;
    public UpdatedAt: Date;
    public JobName: string;
    public JobStatus: string;
    public Deleted: boolean;
    public GlobalIdentity: string;
    public UpdatedBy: string;
    public JobId: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class LanguageCode extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'LanguageCode';

    public ID: number;
    public UpdatedAt: Date;
    public Code: string;
    public Name: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class Municipal extends UniEntity {
    public static RelativeUrl = 'Municipals';
    public static EntityType = 'Municipal';

    public ID: number;
    public MunicipalityNo: string;
    public UpdatedAt: Date;
    public CountyNo: string;
    public MunicipalityName: string;
    public Deleted: boolean;
    public CountyName: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Retired: boolean;
    public CreatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class MunicipalAGAZone extends UniEntity {
    public static RelativeUrl = 'MunicipalAGAZones';
    public static EntityType = 'MunicipalAGAZone';

    public ZoneID: number;
    public ID: number;
    public MunicipalityNo: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Startdate: Date;
    public CreatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class PaymentBatchType extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'PaymentBatchType';

    public ID: number;
    public Description: string;
    public UpdatedAt: Date;
    public Code: number;
    public Name: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class PaymentCode extends UniEntity {
    public static RelativeUrl = 'paymentCodes';
    public static EntityType = 'PaymentCode';

    public PaymentGroup: string;
    public ID: number;
    public Description: string;
    public UpdatedAt: Date;
    public Code: number;
    public Name: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class PostalCode extends UniEntity {
    public static RelativeUrl = 'postalcodes';
    public static EntityType = 'PostalCode';

    public City: string;
    public ID: number;
    public UpdatedAt: Date;
    public Code: string;
    public StatusCode: number;
    public Deleted: boolean;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class ReconcileType extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ReconcileType';

    public ID: number;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public ReconcileName: string;
    public Interval: ReconcileInterval;
    public UpdatedBy: string;
    public CreatedBy: string;
    public MaxIntervalNumber: number;
    public CreatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class SaftMappingAccount extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'SaftMappingAccount';

    public ID: number;
    public Description: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public AccountID: string;
    public _createguid: string;
    public CustomFields: any;
}


export class StaticRegister extends UniEntity {
    public static RelativeUrl = 'StaticRegister';
    public static EntityType = 'StaticRegister';

    public ID: number;
    public UpdatedAt: Date;
    public stamp: Date;
    public Deleted: boolean;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Registry: string;
    public CreatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class STYRKCode extends UniEntity {
    public static RelativeUrl = 'STYRK';
    public static EntityType = 'STYRKCode';

    public ID: number;
    public UpdatedAt: Date;
    public lnr: number;
    public styrk: string;
    public Deleted: boolean;
    public ynr: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public tittel: string;
    public CreatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class Language extends UniEntity {
    public static RelativeUrl = 'languages';
    public static EntityType = 'Language';

    public ID: number;
    public UpdatedAt: Date;
    public Code: string;
    public Name: string;
    public Deleted: boolean;
    public FallBackLanguageID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public _createguid: string;
    public Translations: Array<Translation>;
    public CustomFields: any;
}


export class Translatable extends UniEntity {
    public static RelativeUrl = 'translatables';
    public static EntityType = 'Translatable';

    public ID: number;
    public Meaning: string;
    public Value: string;
    public Description: string;
    public UpdatedAt: Date;
    public Model: string;
    public Column: string;
    public Deleted: boolean;
    public Static: boolean;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Module: i18nModule;
    public _createguid: string;
    public Translations: Array<Translation>;
    public CustomFields: any;
}


export class Translation extends UniEntity {
    public static RelativeUrl = 'translations';
    public static EntityType = 'Translation';

    public ID: number;
    public Value: string;
    public UpdatedAt: Date;
    public TranslatableID: number;
    public Deleted: boolean;
    public UpdatedBy: string;
    public CreatedBy: string;
    public LanguageID: number;
    public CreatedAt: Date;
    public _createguid: string;
    public Language: Language;
    public Translatable: Translatable;
    public CustomFields: any;
}


export class VatCodeGroupSetup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'VatCodeGroupSetup';

    public ID: number;
    public UpdatedAt: Date;
    public Name: string;
    public Deleted: boolean;
    public No: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class VatPostSetup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'VatPostSetup';

    public ID: number;
    public UpdatedAt: Date;
    public Name: string;
    public ReportAsNegativeAmount: boolean;
    public Deleted: boolean;
    public HasTaxAmount: boolean;
    public No: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public VatCodeGroupSetupNo: string;
    public CreatedAt: Date;
    public HasTaxBasis: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class VatReportForm extends UniEntity {
    public static RelativeUrl = 'vatreportforms';
    public static EntityType = 'VatReportForm';

    public ID: number;
    public Description: string;
    public UpdatedAt: Date;
    public Name: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class VatReportReferenceSetup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'VatReportReferenceSetup';

    public AccountNumber: number;
    public ID: number;
    public UpdatedAt: Date;
    public VatCode: string;
    public VatPostNo: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class VatTypeSetup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'VatTypeSetup';

    public ID: number;
    public UpdatedAt: Date;
    public IncomingAccountNumber: number;
    public Name: string;
    public VatCode: string;
    public OutputVat: boolean;
    public DefaultVisible: boolean;
    public Deleted: boolean;
    public OutgoingAccountNumber: number;
    public ReversedTaxDutyVat: boolean;
    public IsCompensated: boolean;
    public UpdatedBy: string;
    public CreatedBy: string;
    public VatCodeGroupNo: string;
    public IsNotVatRegistered: boolean;
    public CreatedAt: Date;
    public DirectJournalEntryOnly: boolean;
    public _createguid: string;
    public VatTypeSetupPercentages: Array<VatTypeSetupPercentage>;
    public CustomFields: any;
}


export class VatTypeSetupPercentage extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'VatTypeSetupPercentage';

    public ID: number;
    public UpdatedAt: Date;
    public ValidFrom: LocalDate;
    public Deleted: boolean;
    public VatTypeSetupID: number;
    public ValidTo: LocalDate;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public VatPercent: number;
    public _createguid: string;
    public CustomFields: any;
}


export class CompanyReport extends UniEntity {
    public static RelativeUrl = 'company-report';
    public static EntityType = 'CompanyReport';

    public CompanyKey: string;
    public ID: number;
    public UpdatedAt: Date;
    public ReportDefinitionID: number;
    public Deleted: boolean;
    public UpdatedBy: string;
    public CreatedBy: string;
    public ContractId: number;
    public CreatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class ReportDefinition extends UniEntity {
    public static RelativeUrl = 'report-definitions';
    public static EntityType = 'ReportDefinition';

    public ID: number;
    public Description: string;
    public UpdatedAt: Date;
    public Visible: boolean;
    public Version: string;
    public Name: string;
    public UniqueReportID: string;
    public Md5: string;
    public Deleted: boolean;
    public ReportSource: string;
    public IsStandard: boolean;
    public Category: string;
    public ReportType: number;
    public CategoryLabel: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public TemplateLinkId: string;
    public CreatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class ReportDefinitionDataSource extends UniEntity {
    public static RelativeUrl = 'report-definition-data-sources';
    public static EntityType = 'ReportDefinitionDataSource';

    public ID: number;
    public UpdatedAt: Date;
    public Name: string;
    public ReportDefinitionId: number;
    public Deleted: boolean;
    public DataSourceUrl: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class ReportDefinitionParameter extends UniEntity {
    public static RelativeUrl = 'report-definition-parameters';
    public static EntityType = 'ReportDefinitionParameter';

    public ID: number;
    public UpdatedAt: Date;
    public Visible: boolean;
    public Name: string;
    public ReportDefinitionId: number;
    public Label: string;
    public Deleted: boolean;
    public DefaultValueSource: string;
    public DefaultValueLookupType: string;
    public DefaultValue: string;
    public DefaultValueList: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public SortIndex: number;
    public CreatedAt: Date;
    public Type: string;
    public _createguid: string;
    public CustomFields: any;
}


export class PeriodSeries extends UniEntity {
    public static RelativeUrl = 'period-series';
    public static EntityType = 'PeriodSeries';

    public ID: number;
    public UpdatedAt: Date;
    public Name: string;
    public Active: boolean;
    public Deleted: boolean;
    public SeriesType: PeriodSeriesType;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class PeriodTemplate extends UniEntity {
    public static RelativeUrl = 'period-templates';
    public static EntityType = 'PeriodTemplate';

    public ID: number;
    public UpdatedAt: Date;
    public Name: string;
    public PeriodSeriesID: number;
    public Deleted: boolean;
    public No: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public ToDate: LocalDate;
    public CreatedAt: Date;
    public FromDate: LocalDate;
    public _createguid: string;
    public PeriodSeries: PeriodSeries;
    public CustomFields: any;
}


export class Model extends UniEntity {
    public static RelativeUrl = 'models';
    public static EntityType = 'Model';

    public Shared: boolean;
    public ID: number;
    public Description: string;
    public UpdatedAt: Date;
    public Name: string;
    public Admin: boolean;
    public Label: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public LabelPlural: string;
    public _createguid: string;
    public Fields: Array<Field>;
    public CustomFields: any;
}


export class Field extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Field';

    public ModelID: number;
    public ID: number;
    public Description: string;
    public UpdatedAt: Date;
    public Name: string;
    public Label: string;
    public Deleted: boolean;
    public HelpText: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public _createguid: string;
    public Model: Model;
    public CustomFields: any;
}


export class Notification extends UniEntity {
    public static RelativeUrl = 'notifications';
    public static EntityType = 'Notification';

    public CompanyKey: string;
    public ID: number;
    public SourceEntityType: string;
    public UpdatedAt: Date;
    public RecipientID: string;
    public CompanyName: string;
    public StatusCode: number;
    public Message: string;
    public SenderDisplayName: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public CreatedBy: string;
    public EntityType: string;
    public EntityID: number;
    public CreatedAt: Date;
    public SourceEntityID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class CompanySettings extends UniEntity {
    public static RelativeUrl = 'companysettings';
    public static EntityType = 'CompanySettings';

    public OrganizationNumber: string;
    public PersonNumber: string;
    public DefaultTOFCurrencySettingsID: number;
    public DefaultCustomerOrderReportID: number;
    public VatLockedDate: LocalDate;
    public PaymentBankAgreementNumber: string;
    public ID: number;
    public AutoJournalPayment: string;
    public AccountingLockedDate: LocalDate;
    public ForceSupplierInvoiceApproval: boolean;
    public BatchInvoiceMinAmount: number;
    public NetsIntegrationActivated: boolean;
    public UpdatedAt: Date;
    public PaymentBankIdentification: string;
    public RoundingNumberOfDecimals: number;
    public CompanyTypeID: number;
    public TaxMandatory: boolean;
    public SalaryBankAccountID: number;
    public DefaultEmailID: number;
    public RoundingType: RoundingType;
    public OnlyJournalMatchedPayments: boolean;
    public CustomerCreditDays: number;
    public HideInActiveCustomers: boolean;
    public AcceptableDelta4CustomerPaymentAccountID: number;
    public DefaultPhoneID: number;
    public EnableAdvancedJournalEntry: boolean;
    public EnableSendPaymentBeforeJournaled: boolean;
    public HasAutobank: boolean;
    public UseNetsIntegration: boolean;
    public DefaultDistributionsID: number;
    public EnableApprovalFlow: boolean;
    public CompanyName: string;
    public DefaultCustomerInvoiceReminderReportID: number;
    public APActivated: boolean;
    public StatusCode: number;
    public SaveCustomersFromQuoteAsLead: boolean;
    public CustomerAccountID: number;
    public SupplierAccountID: number;
    public FactoringEmailID: number;
    public OfficeMunicipalityNo: string;
    public DefaultSalesAccountID: number;
    public Deleted: boolean;
    public DefaultCustomerQuoteReportID: number;
    public TwoStageAutobankEnabled: boolean;
    public BookCustomerInvoiceOnDeliveryDate: boolean;
    public UseXtraPaymentOrgXmlTag: boolean;
    public UseAssetRegister: boolean;
    public AutoDistributeInvoice: boolean;
    public DefaultAddressID: number;
    public DefaultAccrualAccountID: number;
    public CompanyRegistered: boolean;
    public EnableCheckboxesForSupplierInvoiceList: boolean;
    public Localization: string;
    public Factoring: number;
    public InterrimPaymentAccountID: number;
    public EnableArchiveSupplierInvoice: boolean;
    public APIncludeAttachment: boolean;
    public LogoAlign: number;
    public BaseCurrencyCodeID: number;
    public SettlementVatAccountID: number;
    public IgnorePaymentsWithoutEndToEndID: boolean;
    public UseFinancialDateToCalculateVatPercent: boolean;
    public AllowAvtalegiroRegularInvoice: boolean;
    public XtraPaymentOrgXmlTagValue: string;
    public CompanyBankAccountID: number;
    public WebAddress: string;
    public CustomerInvoiceReminderSettingsID: number;
    public TaxMandatoryType: number;
    public AgioLossAccountID: number;
    public AccountGroupSetID: number;
    public UsePaymentBankValues: boolean;
    public UseOcrInterpretation: boolean;
    public VatReportFormID: number;
    public UpdatedBy: string;
    public AcceptableDelta4CustomerPayment: number;
    public AccountVisibilityGroupID: number;
    public BankChargeAccountID: number;
    public PeriodSeriesAccountID: number;
    public CreatedBy: string;
    public APContactID: number;
    public APGuid: string;
    public SAFTimportAccountID: number;
    public ShowNumberOfDecimals: number;
    public AgioGainAccountID: number;
    public InterrimRemitAccountID: number;
    public FactoringNumber: number;
    public HideInActiveSuppliers: boolean;
    public TaxBankAccountID: number;
    public TaxableFromDate: LocalDate;
    public LogoHideField: number;
    public TaxableFromLimit: number;
    public StoreDistributedInvoice: boolean;
    public CreatedAt: Date;
    public GLN: string;
    public PeriodSeriesVatID: number;
    public LogoFileID: number;
    public DefaultCustomerInvoiceReportID: number;
    public ShowKIDOnCustomerInvoice: boolean;
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
    public DefaultAccrualAccount: Account;
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

    public ID: number;
    public UpdatedAt: Date;
    public Name: string;
    public StatusCode: number;
    public Deleted: boolean;
    public UpdatedBy: string;
    public CreatedBy: string;
    public EntityType: string;
    public CreatedAt: Date;
    public _createguid: string;
    public Elements: Array<DistributionPlanElement>;
    public CustomFields: any;
}


export class DistributionPlanElement extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'DistributionPlanElement';

    public ID: number;
    public DistributionPlanID: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public Priority: number;
    public Deleted: boolean;
    public DistributionPlanElementTypeID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public _createguid: string;
    public ElementType: DistributionPlanElementType;
    public CustomFields: any;
}


export class DistributionPlanElementType extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'DistributionPlanElementType';

    public ID: number;
    public UpdatedAt: Date;
    public Name: string;
    public StatusCode: number;
    public Deleted: boolean;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public _createguid: string;
    public LegalEntities: Array<DistributionPlanElementTypeLegalEntity>;
    public CustomFields: any;
}


export class DistributionPlanElementTypeLegalEntity extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'DistributionPlanElementTypeLegalEntity';

    public ID: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public DistributionPlanElementTypeID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public EntityType: string;
    public CreatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class Distributions extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Distributions';

    public ID: number;
    public UpdatedAt: Date;
    public CustomerInvoiceDistributionPlanID: number;
    public StatusCode: number;
    public CustomerQuoteDistributionPlanID: number;
    public Deleted: boolean;
    public CustomerInvoiceReminderDistributionPlanID: number;
    public CustomerOrderDistributionPlanID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public AnnualStatementDistributionPlanID: number;
    public PayCheckDistributionPlanID: number;
    public CreatedAt: Date;
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
    public UpdatedAt: Date;
    public Name: string;
    public StatusCode: number;
    public Deleted: boolean;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class EmailLog extends UniEntity {
    public static RelativeUrl = 'emails';
    public static EntityType = 'EmailLog';

    public ID: number;
    public JobRunID: number;
    public UpdatedAt: Date;
    public Subject: string;
    public To: string;
    public StatusCode: number;
    public Deleted: boolean;
    public JobRunExternalRef: string;
    public EntityDisplayValue: string;
    public From: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public EntityType: string;
    public DistributeAt: LocalDate;
    public EntityID: number;
    public ExternalReference: string;
    public CreatedAt: Date;
    public Type: SharingType;
    public ExternalMessage: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Eventplan extends UniEntity {
    public static RelativeUrl = 'eventplans';
    public static EntityType = 'Eventplan';

    public ID: number;
    public UpdatedAt: Date;
    public Name: string;
    public StatusCode: number;
    public Active: boolean;
    public Deleted: boolean;
    public PlanType: EventplanType;
    public IsSystemPlan: boolean;
    public Cargo: string;
    public SigningKey: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public JobNames: string;
    public CreatedAt: Date;
    public ModelFilter: string;
    public OperationFilter: string;
    public _createguid: string;
    public ExpressionFilters: Array<ExpressionFilter>;
    public Subscribers: Array<EventSubscriber>;
    public CustomFields: any;
}


export class EventSubscriber extends UniEntity {
    public static RelativeUrl = 'eventsubscribers';
    public static EntityType = 'EventSubscriber';

    public ID: number;
    public EventplanID: number;
    public UpdatedAt: Date;
    public Name: string;
    public Endpoint: string;
    public StatusCode: number;
    public Authorization: string;
    public Active: boolean;
    public Deleted: boolean;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Headers: string;
    public CreatedAt: Date;
    public _createguid: string;
    public Eventplan: Eventplan;
    public CustomFields: any;
}


export class ExpressionFilter extends UniEntity {
    public static RelativeUrl = 'expressionfilters';
    public static EntityType = 'ExpressionFilter';

    public ID: number;
    public EventplanID: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public Expression: string;
    public EntityName: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public _createguid: string;
    public Eventplan: Eventplan;
    public CustomFields: any;
}


export class Period extends UniEntity {
    public static RelativeUrl = 'periodes';
    public static EntityType = 'Period';

    public ID: number;
    public UpdatedAt: Date;
    public Name: string;
    public PeriodTemplateID: number;
    public AccountYear: number;
    public StatusCode: number;
    public PeriodSeriesID: number;
    public Deleted: boolean;
    public No: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public ToDate: LocalDate;
    public CreatedAt: Date;
    public FromDate: LocalDate;
    public _createguid: string;
    public PeriodTemplate: PeriodTemplate;
    public PeriodSeries: PeriodSeries;
    public CustomFields: any;
}


export class PredefinedDescription extends UniEntity {
    public static RelativeUrl = 'predefineddescriptions';
    public static EntityType = 'PredefinedDescription';

    public ID: number;
    public Description: string;
    public UpdatedAt: Date;
    public Code: string;
    public StatusCode: number;
    public Deleted: boolean;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Type: PredefinedDescriptionType;
    public _createguid: string;
    public CustomFields: any;
}


export class ProductCategory extends UniEntity {
    public static RelativeUrl = 'productcategories';
    public static EntityType = 'ProductCategory';

    public ID: number;
    public Description: string;
    public UpdatedAt: Date;
    public Name: string;
    public Status: number;
    public StatusCode: number;
    public Comment: string;
    public Deleted: boolean;
    public Rght: number;
    public ParentID: number;
    public Lft: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Depth: number;
    public _createguid: string;
    public CustomFields: any;
}


export class ProductCategoryLink extends UniEntity {
    public static RelativeUrl = 'productcategorylinks';
    public static EntityType = 'ProductCategoryLink';

    public ID: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ProductCategoryID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public ProductID: number;
    public _createguid: string;
    public ProductCategory: ProductCategory;
    public CustomFields: any;
}


export class Sharing extends UniEntity {
    public static RelativeUrl = 'sharings';
    public static EntityType = 'Sharing';

    public ID: number;
    public JobRunID: number;
    public UpdatedAt: Date;
    public Subject: string;
    public To: string;
    public StatusCode: number;
    public Deleted: boolean;
    public JobRunExternalRef: string;
    public EntityDisplayValue: string;
    public From: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public EntityType: string;
    public DistributeAt: LocalDate;
    public EntityID: number;
    public ExternalReference: string;
    public CreatedAt: Date;
    public Type: SharingType;
    public ExternalMessage: string;
    public _createguid: string;
    public CustomFields: any;
}


export class StatusLog extends UniEntity {
    public static RelativeUrl = 'statuslogs';
    public static EntityType = 'StatusLog';

    public ID: number;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public ToStatus: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public EntityType: string;
    public EntityID: number;
    public FromStatus: number;
    public CreatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class Tracelink extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Tracelink';

    public ID: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public DestinationInstanceID: number;
    public Deleted: boolean;
    public SourceInstanceID: number;
    public SourceEntityName: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Date: Date;
    public CreatedAt: Date;
    public DestinationEntityName: string;
    public _createguid: string;
    public CustomFields: any;
}


export class User extends UniEntity {
    public static RelativeUrl = 'users';
    public static EntityType = 'User';

    public PhoneNumber: string;
    public ID: number;
    public Protected: boolean;
    public DisplayName: string;
    public UpdatedAt: Date;
    public IsAutobankAdmin: boolean;
    public HasAgreedToImportDisclaimer: boolean;
    public StatusCode: number;
    public UserName: string;
    public Deleted: boolean;
    public LastLogin: Date;
    public GlobalIdentity: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Email: string;
    public BankIntegrationUserName: string;
    public CreatedAt: Date;
    public AuthPhoneNumber: string;
    public _createguid: string;
    public EndDate: Date;
    public TwoFactorEnabled: boolean;
    public CustomFields: any;
}


export class UniQueryDefinition extends UniEntity {
    public static RelativeUrl = 'uniquerydefinitions';
    public static EntityType = 'UniQueryDefinition';

    public SystemGeneratedQuery: boolean;
    public ID: number;
    public Description: string;
    public UpdatedAt: Date;
    public Code: string;
    public Name: string;
    public StatusCode: number;
    public UserID: number;
    public ClickParam: string;
    public Deleted: boolean;
    public IsShared: boolean;
    public ClickUrl: string;
    public Category: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public ModuleID: number;
    public SortIndex: number;
    public CreatedAt: Date;
    public MainModelName: string;
    public _createguid: string;
    public UniQueryFilters: Array<UniQueryFilter>;
    public UniQueryFields: Array<UniQueryField>;
    public CustomFields: any;
}


export class UniQueryField extends UniEntity {
    public static RelativeUrl = 'uniqueryfields';
    public static EntityType = 'UniQueryField';

    public ID: number;
    public SumFunction: string;
    public Header: string;
    public UpdatedAt: Date;
    public Path: string;
    public Width: string;
    public StatusCode: number;
    public Field: string;
    public Deleted: boolean;
    public Index: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UniQueryDefinitionID: number;
    public CreatedAt: Date;
    public FieldType: number;
    public Alias: string;
    public _createguid: string;
    public CustomFields: any;
}


export class UniQueryFilter extends UniEntity {
    public static RelativeUrl = 'uniqueryfilters';
    public static EntityType = 'UniQueryFilter';

    public ID: number;
    public Value: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public Field: string;
    public Group: number;
    public Deleted: boolean;
    public Operator: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UniQueryDefinitionID: number;
    public CreatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class Team extends UniEntity {
    public static RelativeUrl = 'teams';
    public static EntityType = 'Team';

    public ID: number;
    public UpdatedAt: Date;
    public Name: string;
    public StatusCode: number;
    public Deleted: boolean;
    public Rght: number;
    public ParentID: number;
    public Lft: number;
    public DimensionsID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Depth: number;
    public _createguid: string;
    public Dimensions: Dimensions;
    public Positions: Array<TeamPosition>;
    public CustomFields: any;
}


export class TeamPosition extends UniEntity {
    public static RelativeUrl = 'teampositions';
    public static EntityType = 'TeamPosition';

    public ID: number;
    public UpdatedAt: Date;
    public Position: TeamPositionEnum;
    public StatusCode: number;
    public UserID: number;
    public Deleted: boolean;
    public TeamID: number;
    public RelatedSharedRoleId: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public ToDate: LocalDate;
    public CreatedAt: Date;
    public ApproveOrder: number;
    public FromDate: LocalDate;
    public _createguid: string;
    public Team: Team;
    public CustomFields: any;
}


export class ApprovalRule extends UniEntity {
    public static RelativeUrl = 'approvalrules';
    public static EntityType = 'ApprovalRule';

    public ID: number;
    public Description: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public Keywords: string;
    public Deleted: boolean;
    public IndustryCodes: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public RuleType: ApprovalRuleType;
    public CreatedAt: Date;
    public _createguid: string;
    public Steps: Array<ApprovalRuleStep>;
    public CustomFields: any;
}


export class ApprovalRuleStep extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ApprovalRuleStep';

    public ID: number;
    public UpdatedAt: Date;
    public StepNumber: number;
    public ApprovalRuleID: number;
    public Limit: number;
    public StatusCode: number;
    public UserID: number;
    public Deleted: boolean;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public _createguid: string;
    public ApprovalRule: ApprovalRule;
    public User: User;
    public CustomFields: any;
}


export class ApprovalSubstitute extends UniEntity {
    public static RelativeUrl = 'approvalsubstitutes';
    public static EntityType = 'ApprovalSubstitute';

    public ID: number;
    public SubstituteUserID: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public UserID: number;
    public Deleted: boolean;
    public UpdatedBy: string;
    public CreatedBy: string;
    public ToDate: LocalDate;
    public CreatedAt: Date;
    public FromDate: LocalDate;
    public _createguid: string;
    public User: User;
    public SubstituteUser: User;
    public CustomFields: any;
}


export class TaskApprovalPlan extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'TaskApprovalPlan';

    public ID: number;
    public UpdatedAt: Date;
    public StepNumber: number;
    public ApprovalRuleID: number;
    public Limit: number;
    public StatusCode: number;
    public UserID: number;
    public Comment: string;
    public Deleted: boolean;
    public TaskID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public ApprovalID: number;
    public CreatedAt: Date;
    public Amount: number;
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
    public Description: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public StatusCategoryID: number;
    public Deleted: boolean;
    public System: boolean;
    public UpdatedBy: string;
    public CreatedBy: string;
    public EntityType: string;
    public CreatedAt: Date;
    public IsDepricated: boolean;
    public Order: number;
    public _createguid: string;
    public StatusCategory: StatusCategory;
    public CustomFields: any;
}


export class StatusCategory extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'StatusCategory';

    public ID: number;
    public UpdatedAt: Date;
    public Name: string;
    public StatusCategoryCode: StatusCategoryCode;
    public Deleted: boolean;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class StatusRemark extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'StatusRemark';

    public ID: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public Remark: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public CreatedBy: string;
    public EntityType: string;
    public EntityID: number;
    public CreatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class Transition extends UniEntity {
    public static RelativeUrl = 'transitions';
    public static EntityType = 'Transition';

    public ID: number;
    public UpdatedAt: Date;
    public Controller: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public CreatedBy: string;
    public EntityType: string;
    public MethodName: string;
    public CreatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class TransitionThreshold extends UniEntity {
    public static RelativeUrl = 'thresholds';
    public static EntityType = 'TransitionThreshold';

    public ID: number;
    public Value: string;
    public RejectStatusCode: number;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public PropertyName: string;
    public SharedRoleId: number;
    public SharedRejectTransitionId: number;
    public Operation: OperationType;
    public SharedApproveTransitionId: number;
    public Operator: Operator;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Disabled: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class TransitionThresholdApproval extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'TransitionThresholdApproval';

    public ID: number;
    public Value: string;
    public RejectStatusCode: number;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public PropertyName: string;
    public SharedRoleId: number;
    public SharedRejectTransitionId: number;
    public Operation: OperationType;
    public SharedApproveTransitionId: number;
    public Operator: Operator;
    public UpdatedBy: string;
    public CreatedBy: string;
    public ApprovalID: number;
    public CreatedAt: Date;
    public _createguid: string;
    public Approval: Approval;
    public CustomFields: any;
}


export class Approval extends UniEntity {
    public static RelativeUrl = 'approvals';
    public static EntityType = 'Approval';

    public ID: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public UserID: number;
    public Deleted: boolean;
    public TaskID: number;
    public SharedRoleId: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Amount: number;
    public _createguid: string;
    public Thresholds: Array<TransitionThresholdApproval>;
    public Task: Task;
    public User: User;
    public CustomFields: any;
}


export class Task extends UniEntity {
    public static RelativeUrl = 'tasks';
    public static EntityType = 'Task';

    public ModelID: number;
    public ID: number;
    public RejectStatusCode: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public UserID: number;
    public Deleted: boolean;
    public Title: string;
    public SharedRoleId: number;
    public SharedRejectTransitionId: number;
    public SharedApproveTransitionId: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public EntityID: number;
    public CreatedAt: Date;
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

    public ID: number;
    public UpdatedAt: Date;
    public TransitionID: number;
    public ToStatusID: number;
    public Deleted: boolean;
    public FromStatusID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public EntityType: string;
    public ExpiresDate: Date;
    public CreatedAt: Date;
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

    public ProjectNumber: string;
    public ID: number;
    public Description: string;
    public UpdatedAt: Date;
    public ProjectNumberNumeric: number;
    public Name: string;
    public StatusCode: number;
    public CostPrice: number;
    public Deleted: boolean;
    public PlannedStartdate: LocalDate;
    public WorkPlaceAddressID: number;
    public EndDate: LocalDate;
    public DimensionsID: number;
    public UpdatedBy: string;
    public Total: number;
    public ProjectCustomerID: number;
    public CreatedBy: string;
    public PlannedEnddate: LocalDate;
    public ProjectNumberSeriesID: number;
    public StartDate: LocalDate;
    public CreatedAt: Date;
    public ProjectLeadName: string;
    public Amount: number;
    public Price: number;
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

    public ID: number;
    public UpdatedAt: Date;
    public Name: string;
    public StatusCode: number;
    public UserID: number;
    public Responsibility: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public ProjectID: number;
    public _createguid: string;
    public ProjectUser: User;
    public CustomFields: any;
}


export class ProjectResourceSchedule extends UniEntity {
    public static RelativeUrl = 'projects-schedules-resources';
    public static EntityType = 'ProjectResourceSchedule';

    public ID: number;
    public ProjectTaskScheduleID: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public ProjectTaskID: number;
    public ProjectResourceID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class ProjectTask extends UniEntity {
    public static RelativeUrl = 'projects-tasks';
    public static EntityType = 'ProjectTask';

    public ID: number;
    public Description: string;
    public UpdatedAt: Date;
    public Name: string;
    public StatusCode: number;
    public CostPrice: number;
    public Number: string;
    public SuggestedNumber: string;
    public Deleted: boolean;
    public EndDate: LocalDate;
    public UpdatedBy: string;
    public Total: number;
    public CreatedBy: string;
    public StartDate: LocalDate;
    public CreatedAt: Date;
    public ProjectID: number;
    public Amount: number;
    public Price: number;
    public _createguid: string;
    public ProjectTaskSchedules: Array<ProjectTaskSchedule>;
    public ProjectTaskResources: Array<ProjectResourceSchedule>;
    public CustomFields: any;
}


export class ProjectTaskSchedule extends UniEntity {
    public static RelativeUrl = 'projects-tasks-schedules';
    public static EntityType = 'ProjectTaskSchedule';

    public ID: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public EndDate: LocalDate;
    public UpdatedBy: string;
    public CreatedBy: string;
    public StartDate: LocalDate;
    public CreatedAt: Date;
    public ProjectTaskID: number;
    public _createguid: string;
    public ScheduleResources: Array<ProjectResourceSchedule>;
    public CustomFields: any;
}


export class BarnepassProduct extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'BarnepassProduct';

    public ID: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public ProductID: number;
    public _createguid: string;
    public Product: Product;
    public CustomFields: any;
}


export class Product extends UniEntity {
    public static RelativeUrl = 'products';
    public static EntityType = 'Product';

    public ID: number;
    public PartName: string;
    public VatTypeID: number;
    public Description: string;
    public UpdatedAt: Date;
    public PriceExVat: number;
    public Name: string;
    public AverageCost: number;
    public StatusCode: number;
    public CostPrice: number;
    public Deleted: boolean;
    public VariansParentID: number;
    public ImageFileID: number;
    public DimensionsID: number;
    public DefaultProductCategoryID: number;
    public ListPrice: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Unit: string;
    public CalculateGrossPriceBasedOnNetPrice: boolean;
    public CreatedAt: Date;
    public PriceIncVat: number;
    public Type: ProductTypeEnum;
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

    public ID: number;
    public DisplayName: string;
    public NumberLock: boolean;
    public FromNumber: number;
    public UpdatedAt: Date;
    public NextNumber: number;
    public Name: string;
    public ToNumber: number;
    public AccountYear: number;
    public MainAccountID: number;
    public StatusCode: number;
    public Empty: boolean;
    public IsDefaultForTask: boolean;
    public Comment: string;
    public Deleted: boolean;
    public NumberSeriesTaskID: number;
    public UseNumbersFromNumberSeriesID: number;
    public System: boolean;
    public UpdatedBy: string;
    public CreatedBy: string;
    public NumberSeriesTypeID: number;
    public CreatedAt: Date;
    public Disabled: boolean;
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

    public ID: number;
    public NumberSerieTypeAID: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public NumberSerieTypeBID: number;
    public _createguid: string;
    public NumberSerieTypeA: NumberSeriesType;
    public NumberSerieTypeB: NumberSeriesType;
    public CustomFields: any;
}


export class NumberSeriesTask extends UniEntity {
    public static RelativeUrl = 'number-series-tasks';
    public static EntityType = 'NumberSeriesTask';

    public ID: number;
    public UpdatedAt: Date;
    public Name: string;
    public StatusCode: number;
    public Deleted: boolean;
    public UpdatedBy: string;
    public CreatedBy: string;
    public EntityType: string;
    public CreatedAt: Date;
    public _createguid: string;
    public NumberSeries: Array<NumberSeries>;
    public CustomFields: any;
}


export class NumberSeriesType extends UniEntity {
    public static RelativeUrl = 'number-series-types';
    public static EntityType = 'NumberSeriesType';

    public ID: number;
    public EntityField: string;
    public UpdatedAt: Date;
    public EntitySeriesIDField: string;
    public Yearly: boolean;
    public Name: string;
    public StatusCode: number;
    public Deleted: boolean;
    public CanHaveSeveralActiveSeries: boolean;
    public System: boolean;
    public UpdatedBy: string;
    public CreatedBy: string;
    public EntityType: string;
    public CreatedAt: Date;
    public _createguid: string;
    public Series: Array<NumberSeries>;
    public CustomFields: any;
}


export class EncryptionInfo extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'EncryptionInfo';

    public ID: number;
    public description: string;
    public UpdatedAt: Date;
    public password: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public type: Type;
    public _createguid: string;
    public CustomFields: any;
}


export class File extends UniEntity {
    public static RelativeUrl = 'files/{entitytype}/{entityid}';
    public static EntityType = 'File';

    public ID: number;
    public Description: string;
    public UpdatedAt: Date;
    public Name: string;
    public PermaLink: string;
    public OCRData: string;
    public Pages: number;
    public StatusCode: number;
    public Md5: string;
    public ContentType: string;
    public StorageReference: string;
    public Deleted: boolean;
    public Size: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public encryptionID: number;
    public _createguid: string;
    public UploadSlot: string;
    public FileTags: Array<FileTag>;
    public EntityLinks: Array<FileEntityLink>;
    public CustomFields: any;
}


export class FileTag extends UniEntity {
    public static RelativeUrl = 'filetags';
    public static EntityType = 'FileTag';

    public ID: number;
    public UpdatedAt: Date;
    public FileID: number;
    public Status: number;
    public Deleted: boolean;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public TagName: string;
    public _createguid: string;
    public File: File;
    public CustomFields: any;
}


export class FileEntityLink extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'FileEntityLink';

    public ID: number;
    public UpdatedAt: Date;
    public FileID: number;
    public StatusCode: number;
    public Deleted: boolean;
    public UpdatedBy: string;
    public CreatedBy: string;
    public EntityType: string;
    public IsAttachment: boolean;
    public EntityID: number;
    public CreatedAt: Date;
    public _createguid: string;
    public File: File;
    public CustomFields: any;
}


export class ElsaUsageLog extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ElsaUsageLog';

    public ID: number;
    public ProductType: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public Quantity: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public ExternalReference: string;
    public CreatedAt: Date;
    public DateLogged: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class AccessPointFormat extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AccessPointFormat';

    public OutgoingID: number;
    public ID: number;
    public UpdatedAt: Date;
    public Name: string;
    public StatusCode: number;
    public Label: string;
    public Deleted: boolean;
    public ResourceName: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public IncommingID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class EHFLog extends UniEntity {
    public static RelativeUrl = 'ehf';
    public static EntityType = 'EHFLog';

    public ID: number;
    public JobRunID: number;
    public UpdatedAt: Date;
    public Subject: string;
    public To: string;
    public StatusCode: number;
    public Deleted: boolean;
    public JobRunExternalRef: string;
    public EntityDisplayValue: string;
    public From: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public EntityType: string;
    public DistributeAt: LocalDate;
    public EntityID: number;
    public ExternalReference: string;
    public CreatedAt: Date;
    public Type: SharingType;
    public ExternalMessage: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Department extends UniEntity {
    public static RelativeUrl = 'departments';
    public static EntityType = 'Department';

    public ID: number;
    public DepartmentNumber: string;
    public Description: string;
    public UpdatedAt: Date;
    public Name: string;
    public StatusCode: number;
    public Deleted: boolean;
    public DepartmentNumberSeriesID: number;
    public DepartmentManagerName: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public DepartmentNumberNumeric: number;
    public _createguid: string;
    public DepartmentNumberSeries: NumberSeries;
    public CustomFields: any;
}


export class Dimension10 extends UniEntity {
    public static RelativeUrl = 'Dimension10';
    public static EntityType = 'Dimension10';

    public ID: number;
    public Description: string;
    public UpdatedAt: Date;
    public Name: string;
    public StatusCode: number;
    public Number: string;
    public Deleted: boolean;
    public NumberNumeric: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class Dimension5 extends UniEntity {
    public static RelativeUrl = 'Dimension5';
    public static EntityType = 'Dimension5';

    public ID: number;
    public Description: string;
    public UpdatedAt: Date;
    public Name: string;
    public StatusCode: number;
    public Number: string;
    public Deleted: boolean;
    public NumberNumeric: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class Dimension6 extends UniEntity {
    public static RelativeUrl = 'Dimension6';
    public static EntityType = 'Dimension6';

    public ID: number;
    public Description: string;
    public UpdatedAt: Date;
    public Name: string;
    public StatusCode: number;
    public Number: string;
    public Deleted: boolean;
    public NumberNumeric: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class Dimension7 extends UniEntity {
    public static RelativeUrl = 'Dimension7';
    public static EntityType = 'Dimension7';

    public ID: number;
    public Description: string;
    public UpdatedAt: Date;
    public Name: string;
    public StatusCode: number;
    public Number: string;
    public Deleted: boolean;
    public NumberNumeric: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class Dimension8 extends UniEntity {
    public static RelativeUrl = 'Dimension8';
    public static EntityType = 'Dimension8';

    public ID: number;
    public Description: string;
    public UpdatedAt: Date;
    public Name: string;
    public StatusCode: number;
    public Number: string;
    public Deleted: boolean;
    public NumberNumeric: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class Dimension9 extends UniEntity {
    public static RelativeUrl = 'Dimension9';
    public static EntityType = 'Dimension9';

    public ID: number;
    public Description: string;
    public UpdatedAt: Date;
    public Name: string;
    public StatusCode: number;
    public Number: string;
    public Deleted: boolean;
    public NumberNumeric: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class Dimensions extends UniEntity {
    public static RelativeUrl = 'dimensions';
    public static EntityType = 'Dimensions';

    public ID: number;
    public Dimension7ID: number;
    public UpdatedAt: Date;
    public Dimension9ID: number;
    public Dimension6ID: number;
    public StatusCode: number;
    public Dimension8ID: number;
    public Deleted: boolean;
    public RegionID: number;
    public DepartmentID: number;
    public Dimension5ID: number;
    public UpdatedBy: string;
    public ResponsibleID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public ProjectID: number;
    public Dimension10ID: number;
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
    public Dimension5Name: string;
    public Dimension10Name: string;
    public ProjectNumber: string;
    public ID: number;
    public ProjectTaskNumber: string;
    public RegionName: string;
    public DepartmentNumber: string;
    public ResponsibleName: string;
    public Dimension7Number: string;
    public Dimension8Number: string;
    public Dimension6Number: string;
    public Dimension9Name: string;
    public Dimension7Name: string;
    public DepartmentName: string;
    public ProjectTaskName: string;
    public DimensionsID: number;
    public Dimension6Name: string;
    public Dimension10Number: string;
    public ProjectName: string;
    public Dimension8Name: string;
    public Dimension9Number: string;
    public RegionCode: string;
    public Dimension5Number: string;
}


export class DimensionSettings extends UniEntity {
    public static RelativeUrl = 'dimensionsettings';
    public static EntityType = 'DimensionSettings';

    public ID: number;
    public IsActive: boolean;
    public UpdatedAt: Date;
    public Dimension: number;
    public StatusCode: number;
    public Label: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class Region extends UniEntity {
    public static RelativeUrl = 'regions';
    public static EntityType = 'Region';

    public ID: number;
    public Description: string;
    public UpdatedAt: Date;
    public CountryCode: string;
    public Name: string;
    public StatusCode: number;
    public Deleted: boolean;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public RegionCode: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Responsible extends UniEntity {
    public static RelativeUrl = 'responsibles';
    public static EntityType = 'Responsible';

    public ID: number;
    public Description: string;
    public UpdatedAt: Date;
    public Name: string;
    public StatusCode: number;
    public Deleted: boolean;
    public UpdatedBy: string;
    public CreatedBy: string;
    public NameOfResponsible: string;
    public CreatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class Contract extends UniEntity {
    public static RelativeUrl = 'contracts';
    public static EntityType = 'Contract';

    public ID: number;
    public Description: string;
    public UpdatedAt: Date;
    public Name: string;
    public TeamsUri: string;
    public ContractCode: string;
    public StatusCode: number;
    public Deleted: boolean;
    public Engine: ContractEngine;
    public Hash: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
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

    public ID: number;
    public ContractAssetID: number;
    public UpdatedAt: Date;
    public Address: string;
    public StatusCode: number;
    public Deleted: boolean;
    public AssetAddress: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public EntityType: string;
    public EntityID: number;
    public ContractID: number;
    public CreatedAt: Date;
    public Type: AddressType;
    public Amount: number;
    public _createguid: string;
    public Contract: Contract;
    public ContractAsset: ContractAsset;
    public CustomFields: any;
}


export class ContractAsset extends UniEntity {
    public static RelativeUrl = 'contractassets';
    public static EntityType = 'ContractAsset';

    public IsCosignedByDefiner: boolean;
    public ID: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public IsFixedDenominations: boolean;
    public Deleted: boolean;
    public IsAutoDestroy: boolean;
    public IsPrivate: boolean;
    public IsIssuedByDefinerOnly: boolean;
    public SpenderAttested: boolean;
    public UpdatedBy: string;
    public CreatedBy: string;
    public IsTransferrable: boolean;
    public ContractID: number;
    public CreatedAt: Date;
    public Cap: number;
    public Type: AddressType;
    public _createguid: string;
    public Contract: Contract;
    public CustomFields: any;
}


export class ContractDebugLog extends UniEntity {
    public static RelativeUrl = 'contractdebuglogs';
    public static EntityType = 'ContractDebugLog';

    public ID: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public ContractRunLogID: number;
    public Message: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public CreatedBy: string;
    public ContractID: number;
    public CreatedAt: Date;
    public Type: ContractEventType;
    public _createguid: string;
    public Contract: Contract;
    public ContractRunLog: ContractRunLog;
    public CustomFields: any;
}


export class ContractParameter extends UniEntity {
    public static RelativeUrl = 'contractparameters';
    public static EntityType = 'ContractParameter';

    public ID: number;
    public Value: string;
    public UpdatedAt: Date;
    public Name: string;
    public StatusCode: number;
    public Deleted: boolean;
    public UpdatedBy: string;
    public CreatedBy: string;
    public ContractID: number;
    public CreatedAt: Date;
    public _createguid: string;
    public Contract: Contract;
    public CustomFields: any;
}


export class ContractRunLog extends UniEntity {
    public static RelativeUrl = 'contractrunlogs';
    public static EntityType = 'ContractRunLog';

    public ID: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public Message: string;
    public Deleted: boolean;
    public ContractTriggerID: number;
    public RunTime: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public ContractID: number;
    public CreatedAt: Date;
    public Type: ContractEventType;
    public _createguid: string;
    public Contract: Contract;
    public CustomFields: any;
}


export class ContractTransaction extends UniEntity {
    public static RelativeUrl = 'contracttransactions';
    public static EntityType = 'ContractTransaction';

    public ID: number;
    public SenderAddress: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public ContractAddressID: number;
    public AssetAddress: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public ContractID: number;
    public CreatedAt: Date;
    public ReceiverAddress: string;
    public Amount: number;
    public _createguid: string;
    public Contract: Contract;
    public ContractAddress: ContractAddress;
    public CustomFields: any;
}


export class ContractTrigger extends UniEntity {
    public static RelativeUrl = 'contracttriggers';
    public static EntityType = 'ContractTrigger';

    public ID: number;
    public UpdatedAt: Date;
    public ExpressionFilter: string;
    public StatusCode: number;
    public Deleted: boolean;
    public UpdatedBy: string;
    public CreatedBy: string;
    public ContractID: number;
    public CreatedAt: Date;
    public Type: ContractEventType;
    public ModelFilter: string;
    public OperationFilter: string;
    public _createguid: string;
    public Contract: Contract;
    public CustomFields: any;
}


export class Comment extends UniEntity {
    public static RelativeUrl = 'comments';
    public static EntityType = 'Comment';

    public ID: number;
    public AuthorID: number;
    public Text: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public UpdatedBy: string;
    public CreatedBy: string;
    public EntityType: string;
    public EntityID: number;
    public CreatedAt: Date;
    public _createguid: string;
    public Mentioned: Array<Mentioned>;
    public Author: User;
    public CustomFields: any;
}


export class Mentioned extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Mentioned';

    public ID: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public CommentID: number;
    public UserID: number;
    public Deleted: boolean;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public _createguid: string;
    public User: User;
    public CustomFields: any;
}


export class ApiKey extends UniEntity {
    public static RelativeUrl = 'apikeys';
    public static EntityType = 'ApiKey';

    public ID: number;
    public Description: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public ExternalId: string;
    public Deleted: boolean;
    public Url: string;
    public IntegrationKey: string;
    public IntegrationType: TypeOfIntegration;
    public FilterDate: LocalDate;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Encrypt: boolean;
    public CreatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class Altinn extends UniEntity {
    public static RelativeUrl = 'altinn';
    public static EntityType = 'Altinn';

    public ID: number;
    public UpdatedAt: Date;
    public PreferredLogin: TypeOfLogin;
    public SystemID: string;
    public StatusCode: number;
    public Deleted: boolean;
    public UpdatedBy: string;
    public CreatedBy: string;
    public SystemPw: string;
    public Language: string;
    public CreatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class AltinnReceipt extends UniEntity {
    public static RelativeUrl = 'altinnreceipts';
    public static EntityType = 'AltinnReceipt';

    public ID: number;
    public ReceiptID: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public XmlReceipt: string;
    public Deleted: boolean;
    public Form: string;
    public HasBeenRegistered: boolean;
    public UserSign: string;
    public AltinnResponseData: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public TimeStamp: Date;
    public CreatedAt: Date;
    public ErrorText: string;
    public _createguid: string;
    public Signings: Array<AltinnSigning>;
    public CustomFields: any;
}


export class AltinnSigning extends UniEntity {
    public static RelativeUrl = 'altinnsigning';
    public static EntityType = 'AltinnSigning';

    public ID: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public DateSigned: Date;
    public Deleted: boolean;
    public AltinnReceiptID: number;
    public SignatureText: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public SignatureReference: string;
    public CreatedAt: Date;
    public StatusText: string;
    public _createguid: string;
    public AltinnReceipt: AltinnReceipt;
    public CustomFields: any;
}


export class Barnepass extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Barnepass';

    public ID: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public inntektsaar: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public _createguid: string;
    public oppgave: Array<BarnepassOppgave>;
    public CustomFields: any;
}


export class BarnepassOppgave extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'BarnepassOppgave';

    public ID: number;
    public BarnepassID: number;
    public UpdatedAt: Date;
    public navn: string;
    public StatusCode: number;
    public foedselsnummer: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public CreatedBy: string;
    public email: string;
    public CreatedAt: Date;
    public paaloeptBeloep: number;
    public _createguid: string;
    public CustomFields: any;
}


export class UserRole extends UniEntity {
    public static RelativeUrl = 'userroles';
    public static EntityType = 'UserRole';

    public ID: number;
    public UpdatedAt: Date;
    public UserID: number;
    public Deleted: boolean;
    public SharedRoleName: string;
    public SharedRoleId: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public _createguid: string;
    public User: User;
    public CustomFields: any;
}


export class Role extends UniEntity {
    public static RelativeUrl = 'roles';
    public static EntityType = 'Role';

    public ID: number;
    public Description: string;
    public UpdatedAt: Date;
    public Name: string;
    public Label: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public _createguid: string;
    public RolePermissions: Array<RolePermission>;
    public CustomFields: any;
}


export class RolePermission extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'RolePermission';

    public ID: number;
    public UpdatedAt: Date;
    public PermissionID: number;
    public Deleted: boolean;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public RoleID: number;
    public _createguid: string;
    public Role: Role;
    public Permission: Permission;
    public CustomFields: any;
}


export class Permission extends UniEntity {
    public static RelativeUrl = 'permissions';
    public static EntityType = 'Permission';

    public ID: number;
    public UpdatedAt: Date;
    public Name: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public _createguid: string;
    public RolePermissions: Array<RolePermission>;
    public CustomFields: any;
}


export class ApiMessage extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ApiMessage';

    public ID: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public Service: string;
    public Message: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public CreatedBy: string;
    public ToDate: Date;
    public CreatedAt: Date;
    public Type: ApiMessageType;
    public FromDate: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class AvtaleGiroAgreement extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AvtaleGiroAgreement';

    public ID: number;
    public Description: string;
    public UpdatedAt: Date;
    public DataSender: string;
    public NextNumber: number;
    public Deleted: boolean;
    public KeyPath: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Thumbprint: string;
    public _createguid: string;
    public CustomFields: any;
}


export class AvtaleGiroBankAccount extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AvtaleGiroBankAccount';

    public BankAccountNumber: string;
    public ID: number;
    public CompanyID: number;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public UpdatedBy: string;
    public CreatedBy: string;
    public AvtaleGiroAgreementID: number;
    public CreatedAt: Date;
    public _createguid: string;
    public Company: Company;
    public CustomFields: any;
}


export class AvtaleGiroFile extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AvtaleGiroFile';

    public ID: number;
    public CompanyID: number;
    public UpdatedAt: Date;
    public FileID: number;
    public Deleted: boolean;
    public AvtaleGiroContent: string;
    public AvtaleGiroMergedFileID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public AvtaleGiroAgreementID: number;
    public CreatedAt: Date;
    public _createguid: string;
    public Company: Company;
    public CustomFields: any;
}


export class AvtaleGiroMergedFile extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AvtaleGiroMergedFile';

    public ID: number;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public TransmissionNumber: number;
    public _createguid: string;
    public CustomFields: any;
}


export class BankAgreement extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'BankAgreement';

    public ReceiptDate: Date;
    public ID: number;
    public CompanyID: number;
    public ReceiptID: string;
    public AccountOwnerName: string;
    public UpdatedAt: Date;
    public CustomerOrgNumber: string;
    public ServiceID: string;
    public ServiceAccountID: number;
    public Deleted: boolean;
    public OrderEmail: string;
    public OrderMobile: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CustomerName: string;
    public CreatedAt: Date;
    public AccountOwnerOrgNumber: string;
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

    public ID: number;
    public ServiceType: number;
    public UpdatedAt: Date;
    public BankAgreementID: number;
    public DivisionName: string;
    public KidRule: string;
    public Deleted: boolean;
    public FileType: string;
    public DivisionID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public ConfirmInNetbank: boolean;
    public CreatedAt: Date;
    public _createguid: string;
    public BankAgreement: BankAgreement;
    public BankAccounts: Array<BankServiceBankAccount>;
    public CustomFields: any;
}


export class BankServiceBankAccount extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'BankServiceBankAccount';

    public AccountNumber: string;
    public ID: number;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public UpdatedBy: string;
    public BankServiceID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public _createguid: string;
    public BankService: BankService;
    public CustomFields: any;
}


export class Company extends UniEntity {
    public static RelativeUrl = 'companies';
    public static EntityType = 'Company';

    public OrganizationNumber: string;
    public LastActivity: Date;
    public ID: number;
    public FileFlowEmail: string;
    public UpdatedAt: Date;
    public ClientNumber: number;
    public Name: string;
    public MigrationVersion: string;
    public StatusCode: CompanyStatusCode;
    public IsGlobalTemplate: boolean;
    public FileFlowOrgnrEmail: string;
    public Deleted: boolean;
    public SchemaName: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public WebHookSubscriberId: string;
    public IsTemplate: boolean;
    public CreatedAt: Date;
    public IsTest: boolean;
    public Key: string;
    public ConnectionString: string;
    public _createguid: string;
    public CustomFields: any;
}


export class CompanyAccess extends UniEntity {
    public static RelativeUrl = 'companies-access';
    public static EntityType = 'CompanyAccess';

    public ID: number;
    public CompanyID: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public EndDate: Date;
    public GlobalIdentity: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public StartDate: Date;
    public CreatedAt: Date;
    public Roles: string;
    public _createguid: string;
    public CustomFields: any;
}


export class CompanyBackup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'CompanyBackup';

    public CompanyKey: string;
    public ID: number;
    public UpdatedAt: Date;
    public CloudBlobName: string;
    public BackupStatus: BackupStatus;
    public DeletedAt: Date;
    public CompanyName: string;
    public ScheduledForDeleteAt: Date;
    public Message: string;
    public Deleted: boolean;
    public ContainerName: string;
    public Reason: string;
    public Environment: string;
    public SchemaName: string;
    public ContractType: number;
    public CopyFiles: boolean;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CustomerName: string;
    public ContractID: number;
    public CreatedAt: Date;
    public OrgNumber: string;
    public _createguid: string;
    public CustomFields: any;
}


export class ContractCron extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ContractCron';

    public ID: number;
    public CompanyID: number;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public Expression: string;
    public ContractTriggerID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public ContractID: number;
    public CreatedAt: Date;
    public CompanyKey: string;
    public CompanyDbName: string;
    public _createguid: string;
    public CustomFields: any;
}


export class ContractObyte extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ContractObyte';

    public ID: number;
    public CompanyID: number;
    public UpdatedAt: Date;
    public Address: string;
    public Deleted: boolean;
    public ContractAddressID: number;
    public AssetAddress: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public ContractID: number;
    public CreatedAt: Date;
    public CompanyKey: string;
    public CompanyDbName: string;
    public _createguid: string;
    public CustomFields: any;
}


export class DeniedUserAccessLog extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'DeniedUserAccessLog';

    public Occurred: Date;
    public ID: number;
    public CompanyID: number;
    public UpdatedAt: Date;
    public CompanyName: string;
    public Username: string;
    public Message: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Email: string;
    public CreatedAt: Date;
    public _createguid: string;
    public Company: Company;
    public CustomFields: any;
}


export class FailedBankFile extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'FailedBankFile';

    public CompanyKey: string;
    public ID: number;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public FileContent: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public FileName: string;
    public FailedReason: FailedReasonEnum;
    public CreatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class HangfireJob extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'HangfireJob';

    public CompanyKey: string;
    public ID: number;
    public CompanyID: number;
    public UpdatedAt: Date;
    public Year: number;
    public Status: number;
    public GlobalIdentity: string;
    public Completed: boolean;
    public JobId: string;
    public CreatedAt: Date;
    public HasError: boolean;
    public CustomFields: any;
}


export class HangfireJobContext extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'HangfireJobContext';

    public CompanyKey: string;
    public ID: number;
    public CompanyID: number;
    public UpdatedAt: Date;
    public Year: number;
    public Status: number;
    public GlobalIdentity: string;
    public SchemaName: string;
    public Completed: boolean;
    public JobId: string;
    public CreatedAt: Date;
    public HasError: boolean;
    public CustomFields: any;
}


export class HangfireResponse extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'HangfireResponse';

    public CompanyKey: string;
    public ID: number;
    public CompanyID: number;
    public UpdatedAt: Date;
    public Year: number;
    public State: string;
    public ProgressUrl: string;
    public Status: number;
    public GlobalIdentity: string;
    public Completed: boolean;
    public JobId: string;
    public CreatedAt: Date;
    public HasError: boolean;
    public CustomFields: any;
}


export class KpiDefinition extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'KpiDefinition';

    public ID: number;
    public CompanyID: number;
    public IsPerUser: boolean;
    public UpdatedAt: Date;
    public Name: string;
    public Application: string;
    public Deleted: boolean;
    public SourceType: KpiSourceType;
    public RoleNames: string;
    public Route: string;
    public Interval: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public ValueType: KpiValueType;
    public CreatedAt: Date;
    public RefreshModels: string;
    public _createguid: string;
    public CustomFields: any;
}


export class KpiValue extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'KpiValue';

    public ValueStatus: KpiValueStatus;
    public ID: number;
    public Counter: number;
    public Text: string;
    public CompanyID: number;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public UpdatedBy: string;
    public Total: number;
    public CreatedBy: string;
    public UserIdentity: string;
    public CreatedAt: Date;
    public LastUpdated: Date;
    public KpiName: string;
    public KpiDefinitionID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class OutgoingInvoice extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'OutgoingInvoice';

    public ID: number;
    public CompanyID: number;
    public UpdatedAt: Date;
    public Status: number;
    public StatusCode: number;
    public Deleted: boolean;
    public InvoiceType: OutgoingInvoiceType;
    public RecipientOrganizationNumber: string;
    public ISPOrganizationNumber: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public DueDate: Date;
    public ExternalReference: string;
    public MetaJson: string;
    public CreatedAt: Date;
    public InvoiceID: number;
    public RecipientPhoneNumber: string;
    public Amount: number;
    public _createguid: string;
    public Company: Company;
    public CustomFields: any;
}


export class ProcessFileLog extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ProcessFileLog';

    public CompanyKey: string;
    public ID: number;
    public CompanyID: number;
    public EntityInstanceID: string;
    public UpdatedAt: Date;
    public FileID: number;
    public EntityCount: number;
    public CompanyName: string;
    public StatusCode: number;
    public Message: string;
    public Deleted: boolean;
    public FileType: number;
    public EntityName: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public FileName: string;
    public UserIdentity: string;
    public CreatedAt: Date;
    public _createguid: string;
    public Company: Company;
    public CustomFields: any;
}


export class ServiceAccount extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ServiceAccount';

    public ID: number;
    public Description: string;
    public UpdatedAt: Date;
    public DataSender: string;
    public NextNumber: number;
    public Deleted: boolean;
    public KeyPath: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Thumbprint: string;
    public _createguid: string;
    public CustomFields: any;
}


export class UserVerification extends UniEntity {
    public static RelativeUrl = 'user-verifications';
    public static EntityType = 'UserVerification';

    public ID: number;
    public DisplayName: string;
    public CompanyId: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public UserId: number;
    public Deleted: boolean;
    public RequestOrigin: UserVerificationRequestOrigin;
    public UpdatedBy: string;
    public VerificationCode: string;
    public CreatedBy: string;
    public Email: string;
    public VerificationDate: Date;
    public CreatedAt: Date;
    public UserType: UserVerificationUserType;
    public ExpirationDate: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class Account extends UniEntity {
    public static RelativeUrl = 'accounts';
    public static EntityType = 'Account';

    public AccountNumber: number;
    public ID: number;
    public VatTypeID: number;
    public Description: string;
    public UpdatedAt: Date;
    public Visible: boolean;
    public AccountName: string;
    public CustomerID: number;
    public SupplierID: number;
    public Locked: boolean;
    public StatusCode: number;
    public Keywords: string;
    public SaftMappingAccountID: number;
    public AccountGroupID: number;
    public Active: boolean;
    public LockManualPosts: boolean;
    public Deleted: boolean;
    public TopLevelAccountGroupID: number;
    public EmployeeID: number;
    public UsePostPost: boolean;
    public AccountSetupID: number;
    public CostAllocationID: number;
    public DimensionsID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UseVatDeductionGroupID: number;
    public CurrencyCodeID: number;
    public CreatedAt: Date;
    public AccountID: number;
    public SystemAccount: boolean;
    public DoSynchronize: boolean;
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
    public UpdatedAt: Date;
    public Name: string;
    public StatusCode: number;
    public Deleted: boolean;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public AccountID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class AccountGroup extends UniEntity {
    public static RelativeUrl = 'accountgroups';
    public static EntityType = 'AccountGroup';

    public ID: number;
    public MainGroupID: number;
    public UpdatedAt: Date;
    public Name: string;
    public StatusCode: number;
    public Summable: boolean;
    public GroupNumber: string;
    public Deleted: boolean;
    public CompatibleAccountID: number;
    public AccountGroupSetupID: number;
    public AccountGroupSetID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public AccountID: number;
    public _createguid: string;
    public MainGroup: AccountGroup;
    public AccountGroupSet: AccountGroupSet;
    public CustomFields: any;
}


export class AccountGroupSet extends UniEntity {
    public static RelativeUrl = 'accountgroupsets';
    public static EntityType = 'AccountGroupSet';

    public Shared: boolean;
    public ID: number;
    public UpdatedAt: Date;
    public Name: string;
    public FromAccountNumber: number;
    public StatusCode: number;
    public Deleted: boolean;
    public System: boolean;
    public SubAccountAllowed: boolean;
    public UpdatedBy: string;
    public CreatedBy: string;
    public ToAccountNumber: number;
    public CreatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class AccountMandatoryDimension extends UniEntity {
    public static RelativeUrl = 'accountmandatorydimension';
    public static EntityType = 'AccountMandatoryDimension';

    public ID: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public DimensionNo: number;
    public UpdatedBy: string;
    public CreatedBy: string;
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
    public AccrualAmount: number;
    public ID: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public ResultAccountID: number;
    public Deleted: boolean;
    public JournalEntryLineDraftID: number;
    public AccrualJournalEntryMode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
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

    public ID: number;
    public UpdatedAt: Date;
    public AccountYear: number;
    public StatusCode: number;
    public Deleted: boolean;
    public PeriodNo: number;
    public AccrualID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public JournalEntryDraftLineID: number;
    public CreatedAt: Date;
    public Amount: number;
    public _createguid: string;
    public Accrual: Accrual;
    public JournalEntryLineDraft: JournalEntryLineDraft;
    public CustomFields: any;
}


export class AltinnAccountLink extends UniEntity {
    public static RelativeUrl = 'altinnaccountlinks';
    public static EntityType = 'AltinnAccountLink';

    public AccountNumber: number;
    public ID: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public AltinnAccountNumber: number;
    public _createguid: string;
    public CustomFields: any;
}


export class ApprovalData extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ApprovalData';

    public ID: number;
    public UpdatedAt: Date;
    public EntityHash: string;
    public VerificationMethod: string;
    public EntityCount: number;
    public Deleted: boolean;
    public EntityName: string;
    public UpdatedBy: string;
    public VerificationReference: string;
    public CreatedBy: string;
    public EntityID: number;
    public CreatedAt: Date;
    public EntityReference: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Asset extends UniEntity {
    public static RelativeUrl = 'assets';
    public static EntityType = 'Asset';

    public BalanceAccountID: number;
    public AutoDepreciation: boolean;
    public ID: number;
    public DepreciationAccountID: number;
    public UpdatedAt: Date;
    public ScrapValue: number;
    public Name: string;
    public DepreciationStartDate: LocalDate;
    public StatusCode: number;
    public Deleted: boolean;
    public PurchaseDate: LocalDate;
    public DimensionsID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public AssetGroupCode: string;
    public CreatedAt: Date;
    public DepreciationCycle: number;
    public Lifetime: number;
    public NetFinancialValue: number;
    public PurchaseAmount: number;
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

    public EmailID: number;
    public ID: number;
    public UpdatedAt: Date;
    public Name: string;
    public PhoneID: number;
    public StatusCode: number;
    public Deleted: boolean;
    public InitialBIC: string;
    public AddressID: number;
    public BIC: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
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

    public IntegrationSettings: string;
    public AccountNumber: string;
    public ID: number;
    public UpdatedAt: Date;
    public IntegrationStatus: number;
    public Locked: boolean;
    public StatusCode: number;
    public BusinessRelationID: number;
    public IBAN: string;
    public Label: string;
    public Deleted: boolean;
    public BankID: number;
    public BankAccountType: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CompanySettingsID: number;
    public CreatedAt: Date;
    public AccountID: number;
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

    public ID: number;
    public UpdatedAt: Date;
    public IsBankBalance: boolean;
    public HasNewAccountInformation: boolean;
    public Name: string;
    public StatusCode: number;
    public IsInbound: boolean;
    public ServiceID: string;
    public HasOrderedIntegrationChange: boolean;
    public Deleted: boolean;
    public ServiceTemplateID: string;
    public PropertiesJson: string;
    public BankAccountID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public DefaultAgreement: boolean;
    public BankAcceptance: boolean;
    public Email: string;
    public CreatedAt: Date;
    public IsOutgoing: boolean;
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
    public IsActive: boolean;
    public UpdatedAt: Date;
    public Name: string;
    public ActionCode: ActionCodeBankRule;
    public StatusCode: number;
    public Priority: number;
    public Deleted: boolean;
    public Rule: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public AccountID: number;
    public _createguid: string;
    public Account: Account;
    public CustomFields: any;
}


export class BankStatement extends UniEntity {
    public static RelativeUrl = 'bankstatements';
    public static EntityType = 'BankStatement';

    public ID: number;
    public UpdatedAt: Date;
    public FileID: number;
    public StatusCode: number;
    public ArchiveReference: string;
    public Deleted: boolean;
    public BankAccountID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public StartBalance: number;
    public EndBalance: number;
    public ToDate: LocalDate;
    public CreatedAt: Date;
    public CurrencyCode: string;
    public FromDate: LocalDate;
    public AmountCurrency: number;
    public AccountID: number;
    public Amount: number;
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
    public ID: number;
    public Description: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public TransactionId: string;
    public ArchiveReference: string;
    public Deleted: boolean;
    public BankStatementID: number;
    public Receivername: string;
    public OpenAmountCurrency: number;
    public Category: string;
    public InvoiceNumber: string;
    public UpdatedBy: string;
    public BookingDate: LocalDate;
    public CreatedBy: string;
    public OpenAmount: number;
    public StructuredReference: string;
    public CreatedAt: Date;
    public CurrencyCode: string;
    public SenderName: string;
    public AmountCurrency: number;
    public ReceiverAccount: string;
    public SenderAccount: string;
    public Amount: number;
    public ValueDate: LocalDate;
    public _createguid: string;
    public BankStatement: BankStatement;
    public CustomFields: any;
}


export class BankStatementMatch extends UniEntity {
    public static RelativeUrl = 'bankstatementmatch';
    public static EntityType = 'BankStatementMatch';

    public ID: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public Group: string;
    public Deleted: boolean;
    public BankStatementEntryID: number;
    public Batch: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public JournalEntryLineID: number;
    public CreatedAt: Date;
    public Amount: number;
    public _createguid: string;
    public BankStatementEntry: BankStatementEntry;
    public JournalEntryLine: JournalEntryLine;
    public CustomFields: any;
}


export class BankStatementRule extends UniEntity {
    public static RelativeUrl = 'bankstatementrules';
    public static EntityType = 'BankStatementRule';

    public ID: number;
    public IsActive: boolean;
    public UpdatedAt: Date;
    public Name: string;
    public StatusCode: number;
    public Priority: number;
    public Deleted: boolean;
    public Rule: string;
    public DimensionsID: number;
    public EntryText: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public AccountID: number;
    public _createguid: string;
    public Dimensions: Dimensions;
    public Account: Account;
    public CustomFields: any;
}


export class Budget extends UniEntity {
    public static RelativeUrl = 'budgets';
    public static EntityType = 'Budget';

    public ID: number;
    public UpdatedAt: Date;
    public Name: string;
    public StatusCode: number;
    public Deleted: boolean;
    public AccountingYear: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public _createguid: string;
    public Entries: Array<BudgetEntry>;
    public CustomFields: any;
}


export class BudgetEntry extends UniEntity {
    public static RelativeUrl = 'budgetentries';
    public static EntityType = 'BudgetEntry';

    public ID: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public PeriodNumber: number;
    public Deleted: boolean;
    public BudgetID: number;
    public DimensionsID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public AccountID: number;
    public Amount: number;
    public _createguid: string;
    public Budget: Budget;
    public Account: Account;
    public Dimensions: Dimensions;
    public CustomFields: any;
}


export class CompanyAccountingSettings extends UniEntity {
    public static RelativeUrl = 'companyaccountingsettings';
    public static EntityType = 'CompanyAccountingSettings';

    public ID: number;
    public AssetSaleLossNoVatAccountID: number;
    public UpdatedAt: Date;
    public AssetSaleProfitVatAccountID: number;
    public StatusCode: number;
    public AssetSaleProfitBalancingAccountID: number;
    public AssetSaleProfitNoVatAccountID: number;
    public ReInvoicingCostsharingProductID: number;
    public Deleted: boolean;
    public AssetSaleLossVatAccountID: number;
    public ReInvoicingMethod: number;
    public ReInvoicingTurnoverProductID: number;
    public UpdatedBy: string;
    public AssetWriteoffAccountID: number;
    public CreatedBy: string;
    public AssetSaleProductID: number;
    public CreatedAt: Date;
    public AssetSaleLossBalancingAccountID: number;
    public _createguid: string;
    public ReInvoicingCostsharingProduct: Product;
    public ReInvoicingTurnoverProduct: Product;
    public CustomFields: any;
}


export class CompanyBankAccount extends UniEntity {
    public static RelativeUrl = 'companybankaccounts';
    public static EntityType = 'CompanyBankAccount';

    public IsSalary: boolean;
    public ID: number;
    public UpdatedAt: Date;
    public Name: string;
    public StatusCode: number;
    public Deleted: boolean;
    public CreditAmount: number;
    public BankAccountID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public IsTax: boolean;
    public IsIncomming: boolean;
    public CreatedAt: Date;
    public IsOutgoing: boolean;
    public AccountID: number;
    public _createguid: string;
    public BankAccount: BankAccount;
    public Account: Account;
    public CustomFields: any;
}


export class CostAllocation extends UniEntity {
    public static RelativeUrl = 'costallocations';
    public static EntityType = 'CostAllocation';

    public ID: number;
    public UpdatedAt: Date;
    public Name: string;
    public StatusCode: number;
    public Deleted: boolean;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public _createguid: string;
    public Items: Array<CostAllocationItem>;
    public CustomFields: any;
}


export class CostAllocationItem extends UniEntity {
    public static RelativeUrl = 'costallocationitems';
    public static EntityType = 'CostAllocationItem';

    public ID: number;
    public VatTypeID: number;
    public Description: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public CostAllocationID: number;
    public DimensionsID: number;
    public UpdatedBy: string;
    public Percent: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public AccountID: number;
    public Amount: number;
    public _createguid: string;
    public Account: Account;
    public VatType: VatType;
    public Dimensions: Dimensions;
    public CustomFields: any;
}


export class CustomLiquidityPayment extends UniEntity {
    public static RelativeUrl = 'liquiditypayment';
    public static EntityType = 'CustomLiquidityPayment';

    public ID: number;
    public IsCustomerPayment: boolean;
    public Description: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public EndDate: LocalDate;
    public UpdatedBy: string;
    public CreatedBy: string;
    public DueDate: LocalDate;
    public CurrencyCodeID: number;
    public CreatedAt: Date;
    public AmountCurrency: number;
    public CustomLiquidityPaymentType: CustomLiquidityPaymentInterval;
    public Amount: number;
    public _createguid: string;
    public currency: CurrencyCode;
    public CustomFields: any;
}


export class DepreciationLine extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'DepreciationLine';

    public ID: number;
    public DepreciationJELineID: number;
    public DepreciationType: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public UpdatedBy: string;
    public CreatedBy: string;
    public AssetID: number;
    public AssetJELineID: number;
    public CreatedAt: Date;
    public _createguid: string;
    public DepreciationJELine: JournalEntryLine;
    public AssetJELine: JournalEntryLine;
    public CustomFields: any;
}


export class FinancialYear extends UniEntity {
    public static RelativeUrl = 'financialyears';
    public static EntityType = 'FinancialYear';

    public ID: number;
    public UpdatedAt: Date;
    public Year: number;
    public StatusCode: number;
    public ValidFrom: LocalDate;
    public Deleted: boolean;
    public ValidTo: LocalDate;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class JournalEntry extends UniEntity {
    public static RelativeUrl = 'journalentries';
    public static EntityType = 'JournalEntry';

    public ID: number;
    public Description: string;
    public UpdatedAt: Date;
    public NumberSeriesID: number;
    public StatusCode: number;
    public Deleted: boolean;
    public NumberSeriesTaskID: number;
    public JournalEntryNumberNumeric: number;
    public JournalEntryAccrualID: number;
    public JournalEntryDraftGroup: string;
    public JournalEntryNumber: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public FinancialYearID: number;
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

    public ID: number;
    public TaxBasisAmountCurrency: number;
    public Signature: string;
    public VatTypeID: number;
    public Description: string;
    public UpdatedAt: Date;
    public PaymentReferenceID: number;
    public StatusCode: number;
    public ReferenceOriginalPostID: number;
    public SubAccountID: number;
    public FinancialDate: LocalDate;
    public VatDate: LocalDate;
    public Deleted: boolean;
    public VatReportID: number;
    public SupplierInvoiceID: number;
    public JournalEntryNumberNumeric: number;
    public TaxBasisAmount: number;
    public ReferenceCreditPostID: number;
    public JournalEntryID: number;
    public OriginalJournalEntryPost: number;
    public CustomerOrderID: number;
    public PeriodID: number;
    public VatDeductionPercent: number;
    public AccrualID: number;
    public PaymentInfoTypeID: number;
    public JournalEntryNumber: string;
    public InvoiceNumber: string;
    public JournalEntryLineDraftID: number;
    public JournalEntryTypeID: number;
    public OriginalReferencePostID: number;
    public DimensionsID: number;
    public CurrencyExchangeRate: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public RestAmountCurrency: number;
    public RegisteredDate: LocalDate;
    public CustomerInvoiceID: number;
    public DueDate: LocalDate;
    public PaymentID: string;
    public VatJournalEntryPostID: number;
    public CurrencyCodeID: number;
    public VatPeriodID: number;
    public CreatedAt: Date;
    public PostPostJournalEntryLineID: number;
    public AmountCurrency: number;
    public AccountID: number;
    public VatPercent: number;
    public Amount: number;
    public RestAmount: number;
    public BatchNumber: number;
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

    public ID: number;
    public TaxBasisAmountCurrency: number;
    public Signature: string;
    public VatTypeID: number;
    public Description: string;
    public UpdatedAt: Date;
    public PaymentReferenceID: number;
    public StatusCode: number;
    public SubAccountID: number;
    public FinancialDate: LocalDate;
    public VatDate: LocalDate;
    public Deleted: boolean;
    public SupplierInvoiceID: number;
    public JournalEntryNumberNumeric: number;
    public TaxBasisAmount: number;
    public JournalEntryID: number;
    public CustomerOrderID: number;
    public PeriodID: number;
    public VatDeductionPercent: number;
    public AccrualID: number;
    public PaymentInfoTypeID: number;
    public JournalEntryNumber: string;
    public InvoiceNumber: string;
    public JournalEntryTypeID: number;
    public DimensionsID: number;
    public CurrencyExchangeRate: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public RegisteredDate: LocalDate;
    public CustomerInvoiceID: number;
    public DueDate: LocalDate;
    public PaymentID: string;
    public CurrencyCodeID: number;
    public VatPeriodID: number;
    public CreatedAt: Date;
    public PostPostJournalEntryLineID: number;
    public AmountCurrency: number;
    public AccountID: number;
    public VatPercent: number;
    public Amount: number;
    public BatchNumber: number;
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

    public ID: number;
    public UpdatedAt: Date;
    public TraceLinkTypes: string;
    public Name: string;
    public ColumnSetUp: string;
    public StatusCode: number;
    public Deleted: boolean;
    public UpdatedBy: string;
    public VisibleModules: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class JournalEntrySourceSerie extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'JournalEntrySourceSerie';

    public ID: number;
    public UpdatedAt: Date;
    public JournalEntrySourceID: number;
    public StatusCode: number;
    public Deleted: boolean;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public JournalEntrySourceInstanceID: number;
    public _createguid: string;
    public JournalEntrySourceEntityName: string;
    public CustomFields: any;
}


export class JournalEntryType extends UniEntity {
    public static RelativeUrl = 'journalentrytypes';
    public static EntityType = 'JournalEntryType';

    public ID: number;
    public DisplayName: string;
    public UpdatedAt: Date;
    public Name: string;
    public Number: number;
    public ExpectNegativeAmount: boolean;
    public MainName: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class LedgerSuggestion extends UniEntity {
    public ID: number;
    public Name: string;
    public IndustryName: string;
    public IndustryCode: string;
    public BusinessType: string;
    public Source: SuggestionSource;
    public OrgNumber: string;
}


export class Payment extends UniEntity {
    public static RelativeUrl = 'payments';
    public static EntityType = 'Payment';

    public CustomerInvoiceReminderID: number;
    public ID: number;
    public IsCustomerPayment: boolean;
    public Description: string;
    public UpdatedAt: Date;
    public AutoJournal: boolean;
    public ToBankAccountID: number;
    public PaymentCodeID: number;
    public SerialNumberOrAcctSvcrRef: string;
    public XmlTagPmtInfIdReference: string;
    public ReconcilePayment: boolean;
    public StatusCode: number;
    public InPaymentID: string;
    public PaymentDate: LocalDate;
    public BusinessRelationID: number;
    public ExternalBankAccountNumber: string;
    public Deleted: boolean;
    public PaymentBatchID: number;
    public SupplierInvoiceID: number;
    public JournalEntryID: number;
    public XmlTagEndToEndIdReference: string;
    public FromBankAccountID: number;
    public Debtor: string;
    public InvoiceNumber: string;
    public OcrPaymentStrings: string;
    public IsPaymentClaim: boolean;
    public CurrencyExchangeRate: number;
    public UpdatedBy: string;
    public BankChargeAmount: number;
    public CreatedBy: string;
    public IsExternal: boolean;
    public CustomerInvoiceID: number;
    public DueDate: LocalDate;
    public Proprietary: string;
    public PaymentID: string;
    public PaymentStatusReportFileID: number;
    public CurrencyCodeID: number;
    public PaymentNotificationReportFileID: number;
    public Domain: string;
    public CreatedAt: Date;
    public AmountCurrency: number;
    public StatusText: string;
    public Amount: number;
    public IsPaymentCancellationRequest: boolean;
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
    public PaymentFileID: number;
    public ID: number;
    public NumberOfPayments: number;
    public IsCustomerPayment: boolean;
    public UpdatedAt: Date;
    public PaymentReferenceID: string;
    public TransferredDate: Date;
    public StatusCode: number;
    public OcrTransmissionNumber: number;
    public Deleted: boolean;
    public OcrHeadingStrings: string;
    public TotalAmount: number;
    public PaymentBatchTypeID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Camt054CMsgId: string;
    public PaymentStatusReportFileID: number;
    public HashValue: string;
    public CreatedAt: Date;
    public _createguid: string;
    public Payments: Array<Payment>;
    public PaymentBatchType: PaymentBatchType;
    public CustomFields: any;
}


export class PostPost extends UniEntity {
    public static RelativeUrl = 'postposts';
    public static EntityType = 'PostPost';

    public ID: number;
    public UpdatedAt: Date;
    public JournalEntryLine1ID: number;
    public StatusCode: number;
    public Deleted: boolean;
    public CurrencyExchangeRate: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public JournalEntryLine2ID: number;
    public CurrencyCodeID: number;
    public Date: LocalDate;
    public CreatedAt: Date;
    public AmountCurrency: number;
    public Amount: number;
    public _createguid: string;
    public JournalEntryLine1: JournalEntryLine;
    public JournalEntryLine2: JournalEntryLine;
    public CurrencyCode: CurrencyCode;
    public CustomFields: any;
}


export class ReInvoice extends UniEntity {
    public static RelativeUrl = 'reinvoicing';
    public static EntityType = 'ReInvoice';

    public ID: number;
    public TaxExclusiveAmount: number;
    public UpdatedAt: Date;
    public TaxInclusiveAmount: number;
    public StatusCode: number;
    public OwnCostShare: number;
    public Deleted: boolean;
    public OwnCostAmount: number;
    public SupplierInvoiceID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public ReInvoicingType: number;
    public ProductID: number;
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
    public Vat: number;
    public UpdatedAt: Date;
    public CustomerID: number;
    public GrossAmount: number;
    public StatusCode: number;
    public NetAmount: number;
    public Deleted: boolean;
    public ReInvoiceID: number;
    public Surcharge: number;
    public Share: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public _createguid: string;
    public Customer: Customer;
    public CustomFields: any;
}


export class SupplierInvoice extends UniEntity {
    public static RelativeUrl = 'supplierinvoices';
    public static EntityType = 'SupplierInvoice';

    public InvoiceOriginType: SupplierInvoiceOriginType;
    public InternalNote: string;
    public DeliveryTerm: string;
    public OurReference: string;
    public ID: number;
    public TaxExclusiveAmount: number;
    public VatTotalsAmountCurrency: number;
    public UpdatedAt: Date;
    public PayableRoundingCurrencyAmount: number;
    public InvoiceDate: LocalDate;
    public InvoiceReceiverName: string;
    public SalesPerson: string;
    public DeliveryDate: LocalDate;
    public SupplierID: number;
    public CreditedAmountCurrency: number;
    public ShippingCity: string;
    public DeliveryMethod: string;
    public ShippingAddressLine2: string;
    public TaxInclusiveAmount: number;
    public CustomerOrgNumber: string;
    public AmountRegards: string;
    public InvoiceCountry: string;
    public PaymentTerm: string;
    public StatusCode: number;
    public InvoiceAddressLine2: string;
    public VatTotalsAmount: number;
    public Comment: string;
    public Deleted: boolean;
    public DeliveryName: string;
    public PrintStatus: number;
    public InvoiceReferenceID: number;
    public TaxInclusiveAmountCurrency: number;
    public ShippingAddressLine1: string;
    public Requisition: string;
    public ReInvoiceID: number;
    public InvoiceAddressLine1: string;
    public PaymentStatus: number;
    public JournalEntryID: number;
    public PayableRoundingAmount: number;
    public InvoiceType: number;
    public TaxExclusiveAmountCurrency: number;
    public ReInvoiced: boolean;
    public ShippingPostalCode: string;
    public InvoiceCity: string;
    public InvoicePostalCode: string;
    public InvoiceNumber: string;
    public CreditedAmount: number;
    public Credited: boolean;
    public InvoiceAddressLine3: string;
    public CurrencyExchangeRate: number;
    public BankAccountID: number;
    public SupplierOrgNumber: string;
    public UpdatedBy: string;
    public DeliveryTermsID: number;
    public CustomerPerson: string;
    public InvoiceCountryCode: string;
    public CreatedBy: string;
    public RestAmountCurrency: number;
    public CreditDays: number;
    public ShippingCountryCode: string;
    public PaymentID: string;
    public DefaultDimensionsID: number;
    public PaymentTermsID: number;
    public PaymentInformation: string;
    public CurrencyCodeID: number;
    public ShippingAddressLine3: string;
    public CreatedAt: Date;
    public ProjectID: number;
    public PaymentDueDate: LocalDate;
    public IsSentToPayment: boolean;
    public Payment: string;
    public FreeTxt: string;
    public YourReference: string;
    public ShippingCountry: string;
    public RestAmount: number;
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

    public ID: number;
    public DiscountCurrency: number;
    public VatTypeID: number;
    public SumTotalExVatCurrency: number;
    public SumVatCurrency: number;
    public UpdatedAt: Date;
    public PriceExVat: number;
    public NumberOfItems: number;
    public PriceSetByUser: boolean;
    public SumTotalExVat: number;
    public StatusCode: number;
    public Comment: string;
    public Deleted: boolean;
    public SumTotalIncVat: number;
    public PriceExVatCurrency: number;
    public SumVat: number;
    public SupplierInvoiceID: number;
    public AccountingCost: string;
    public DiscountPercent: number;
    public SumTotalIncVatCurrency: number;
    public DimensionsID: number;
    public CurrencyExchangeRate: number;
    public UpdatedBy: string;
    public InvoicePeriodStartDate: LocalDate;
    public CreatedBy: string;
    public Unit: string;
    public SortIndex: number;
    public CalculateGrossPriceBasedOnNetPrice: boolean;
    public CurrencyCodeID: number;
    public Discount: number;
    public InvoicePeriodEndDate: LocalDate;
    public CreatedAt: Date;
    public PriceIncVat: number;
    public ItemText: string;
    public VatPercent: number;
    public ProductID: number;
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
    public UpdatedAt: Date;
    public Name: string;
    public StatusCode: number;
    public Deleted: boolean;
    public No: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class VatDeduction extends UniEntity {
    public static RelativeUrl = 'vatdeductions';
    public static EntityType = 'VatDeduction';

    public ID: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public ValidFrom: LocalDate;
    public Deleted: boolean;
    public DeductionPercent: number;
    public VatDeductionGroupID: number;
    public ValidTo: LocalDate;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public _createguid: string;
    public VatDeductionGroup: VatDeductionGroup;
    public CustomFields: any;
}


export class VatDeductionGroup extends UniEntity {
    public static RelativeUrl = 'vatdeductiongroups';
    public static EntityType = 'VatDeductionGroup';

    public ID: number;
    public UpdatedAt: Date;
    public Name: string;
    public StatusCode: number;
    public Deleted: boolean;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class VatPost extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'VatPost';

    public ID: number;
    public UpdatedAt: Date;
    public Name: string;
    public ReportAsNegativeAmount: boolean;
    public StatusCode: number;
    public VatCodeGroupID: number;
    public Deleted: boolean;
    public HasTaxAmount: boolean;
    public No: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public HasTaxBasis: boolean;
    public _createguid: string;
    public VatCodeGroup: VatCodeGroup;
    public VatReportReferences: Array<VatReportReference>;
    public CustomFields: any;
}


export class VatReport extends UniEntity {
    public static RelativeUrl = 'vatreports';
    public static EntityType = 'VatReport';

    public ID: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public Comment: string;
    public Deleted: boolean;
    public InternalComment: string;
    public JournalEntryID: number;
    public Title: string;
    public ReportedDate: Date;
    public ExecutedDate: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public ExternalRefNo: string;
    public VatReportArchivedSummaryID: number;
    public TerminPeriodID: number;
    public CreatedAt: Date;
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

    public PaymentToDescription: string;
    public ID: number;
    public UpdatedAt: Date;
    public AmountToBeReceived: number;
    public StatusCode: number;
    public AmountToBePayed: number;
    public Deleted: boolean;
    public ReportName: string;
    public SummaryHeader: string;
    public PaymentYear: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public PaymentPeriod: string;
    public PaymentBankAccountNumber: string;
    public PaymentID: string;
    public CreatedAt: Date;
    public PaymentDueDate: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class VatReportReference extends UniEntity {
    public static RelativeUrl = 'vatreportreferences';
    public static EntityType = 'VatReportReference';

    public ID: number;
    public VatTypeID: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public UpdatedBy: string;
    public CreatedBy: string;
    public VatPostID: number;
    public CreatedAt: Date;
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

    public ID: number;
    public UpdatedAt: Date;
    public Name: string;
    public StatusCode: number;
    public Deleted: boolean;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class VatType extends UniEntity {
    public static RelativeUrl = 'vattypes';
    public static EntityType = 'VatType';

    public ID: number;
    public UpdatedAt: Date;
    public Visible: boolean;
    public Name: string;
    public Locked: boolean;
    public StatusCode: number;
    public VatCodeGroupID: number;
    public VatCode: string;
    public OutputVat: boolean;
    public Deleted: boolean;
    public IncomingAccountID: number;
    public VatTypeSetupID: number;
    public ReversedTaxDutyVat: boolean;
    public InUse: boolean;
    public UpdatedBy: string;
    public CreatedBy: string;
    public AvailableInModules: boolean;
    public CreatedAt: Date;
    public DirectJournalEntryOnly: boolean;
    public VatCodeGroupingValue: VatCodeGroupingValueEnum;
    public OutgoingAccountID: number;
    public Alias: string;
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
    public UpdatedAt: Date;
    public StatusCode: number;
    public ValidFrom: LocalDate;
    public Deleted: boolean;
    public ValidTo: LocalDate;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public VatPercent: number;
    public _createguid: string;
    public CustomFields: any;
}


export class Reconcile extends UniEntity {
    public static RelativeUrl = 'reconcile';
    public static EntityType = 'Reconcile';

    public ID: number;
    public UpdatedAt: Date;
    public AccountYear: number;
    public StatusCode: number;
    public IntervalNumber: number;
    public Deleted: boolean;
    public Interval: ReconcileInterval;
    public UpdatedBy: string;
    public CreatedBy: string;
    public ToDate: LocalDate;
    public CreatedAt: Date;
    public FromDate: LocalDate;
    public ReconcileType: string;
    public _createguid: string;
    public Accounts: Array<ReconcileAccount>;
    public CustomFields: any;
}


export class ReconcileAccount extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ReconcileAccount';

    public ID: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public Balance: number;
    public Comment: string;
    public ApprovedAt: Date;
    public Deleted: boolean;
    public IsApproved: boolean;
    public ReconcileID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public ApprovedBy: string;
    public CreatedAt: Date;
    public AccountID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class AnnualSettlement extends UniEntity {
    public static RelativeUrl = 'annualsettlement';
    public static EntityType = 'AnnualSettlement';

    public AnnualSettlementCheckListID: number;
    public ID: number;
    public UpdatedAt: Date;
    public AccountYear: number;
    public StatusCode: number;
    public Deleted: boolean;
    public JournalEntryID: number;
    public AnnualSettlementJSONData: string;
    public ReconcileID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public _createguid: string;
    public Reconcile: Reconcile;
    public AnnualSettlementCheckList: AnnualSettlementCheckList;
    public CustomFields: any;
}


export class AnnualSettlementCheckList extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AnnualSettlementCheckList';

    public AreAllPreviousYearsEndedAndBalances: boolean;
    public ID: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public IsStockOK: boolean;
    public IsAllJournalsDone: boolean;
    public IsAllSupplierInvoicesPaid: boolean;
    public UpdatedBy: string;
    public CreatedBy: string;
    public IsVatReportOK: boolean;
    public IsShareCapitalOK: boolean;
    public CreatedAt: Date;
    public IsAmeldingOK: boolean;
    public IsAllCustomerInvoicesPaid: boolean;
    public IsAssetsOK: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class TaxReport extends UniEntity {
    public static RelativeUrl = 'taxreport';
    public static EntityType = 'TaxReport';

    public ID: number;
    public AnnualSettlementID: number;
    public UpdatedAt: Date;
    public Code: string;
    public Year: number;
    public StatusCode: number;
    public Deleted: boolean;
    public Data: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class EntityValidationRule extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'EntityValidationRule';

    public ID: number;
    public Value: string;
    public UpdatedAt: Date;
    public SyncKey: string;
    public Level: ValidationLevel;
    public OnConflict: OnConflict;
    public Message: string;
    public Deleted: boolean;
    public PropertyName: string;
    public Operation: OperationType;
    public System: boolean;
    public Operator: Operator;
    public ChangedByCompany: boolean;
    public UpdatedBy: string;
    public CreatedBy: string;
    public EntityType: string;
    public CreatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class EntityValidationRuleTemplate extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'EntityValidationRuleTemplate';

    public ID: number;
    public Value: string;
    public UpdatedAt: Date;
    public SyncKey: string;
    public Level: ValidationLevel;
    public OnConflict: OnConflict;
    public Message: string;
    public Deleted: boolean;
    public PropertyName: string;
    public Operation: OperationType;
    public System: boolean;
    public Operator: Operator;
    public ChangedByCompany: boolean;
    public UpdatedBy: string;
    public CreatedBy: string;
    public EntityType: string;
    public CreatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class ComplexValidationRule extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ComplexValidationRule';

    public ID: number;
    public UpdatedAt: Date;
    public ValidationCode: number;
    public SyncKey: string;
    public Level: ValidationLevel;
    public OnConflict: OnConflict;
    public Message: string;
    public Deleted: boolean;
    public Operation: OperationType;
    public System: boolean;
    public ChangedByCompany: boolean;
    public UpdatedBy: string;
    public CreatedBy: string;
    public EntityType: string;
    public CreatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class ComplexValidationRuleTemplate extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ComplexValidationRuleTemplate';

    public ID: number;
    public UpdatedAt: Date;
    public ValidationCode: number;
    public SyncKey: string;
    public Level: ValidationLevel;
    public OnConflict: OnConflict;
    public Message: string;
    public Deleted: boolean;
    public Operation: OperationType;
    public System: boolean;
    public ChangedByCompany: boolean;
    public UpdatedBy: string;
    public CreatedBy: string;
    public EntityType: string;
    public CreatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class CustomField extends UniEntity {
    public static RelativeUrl = 'custom-fields';
    public static EntityType = 'CustomField';

    public ModelID: number;
    public ID: number;
    public UpdatedAt: Date;
    public Name: string;
    public StatusCode: number;
    public Deleted: boolean;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public DataType: string;
    public Nullable: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class ValueList extends UniEntity {
    public static RelativeUrl = 'valuelists';
    public static EntityType = 'ValueList';

    public ID: number;
    public Description: string;
    public UpdatedAt: Date;
    public Code: string;
    public Name: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public _createguid: string;
    public Items: Array<ValueItem>;
    public CustomFields: any;
}


export class ValueItem extends UniEntity {
    public static RelativeUrl = 'valueitems';
    public static EntityType = 'ValueItem';

    public ID: number;
    public Value: string;
    public Description: string;
    public UpdatedAt: Date;
    public Code: string;
    public Name: string;
    public Deleted: boolean;
    public Index: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public ValueListID: number;
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

    public ID: number;
    public ReadOnly: boolean;
    public Description: string;
    public UpdatedAt: Date;
    public ValueList: string;
    public Legend: string;
    public ComponentLayoutID: number;
    public LineBreak: boolean;
    public Width: string;
    public Sectionheader: string;
    public Options: string;
    public StatusCode: number;
    public Section: number;
    public FieldSet: number;
    public Label: string;
    public Placement: number;
    public Deleted: boolean;
    public Alignment: Alignment;
    public Url: string;
    public Hidden: boolean;
    public LookupField: boolean;
    public Combo: number;
    public LookupEntityType: string;
    public DisplayField: string;
    public HelpText: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public EntityType: string;
    public Placeholder: string;
    public CreatedAt: Date;
    public FieldType: FieldType;
    public Property: string;
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
    public Projecttime: number;
    public EndTime: Date;
    public Workflow: TimesheetWorkflow;
    public Status: WorkStatus;
    public Flextime: number;
    public TotalTime: number;
    public SickTime: number;
    public StartTime: Date;
    public ValidTime: number;
    public Invoicable: number;
    public ExpectedTime: number;
    public IsWeekend: boolean;
    public Overtime: number;
    public WeekDay: number;
    public TimeOff: number;
    public Date: Date;
    public WeekNumber: number;
    public ValidTimeOff: number;
}


export class WorkBalanceDto extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'WorkBalanceDto';

    public Balancetype: WorkBalanceTypeEnum;
    public ID: number;
    public Description: string;
    public UpdatedAt: Date;
    public Days: number;
    public LastDayActual: number;
    public StatusCode: number;
    public ExpectedMinutes: number;
    public BalanceDate: Date;
    public ValidFrom: Date;
    public SumOvertime: number;
    public ActualMinutes: number;
    public Deleted: boolean;
    public LastDayExpected: number;
    public WorkRelationID: number;
    public BalanceFrom: Date;
    public Minutes: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public IsStartBalance: boolean;
    public CreatedAt: Date;
    public ValidTimeOff: number;
    public _createguid: string;
    public Previous: BalanceInfo;
    public Details: Array<FlexDetail>;
    public WorkRelation: WorkRelation;
    public CustomFields: any;
}


export class BalanceInfo extends UniEntity {
    public ID: number;
    public Description: string;
    public BalanceDate: Date;
    public Minutes: number;
}


export class FlexDetail extends UniEntity {
    public WorkedMinutes: number;
    public ExpectedMinutes: number;
    public IsWeekend: boolean;
    public Date: Date;
    public ValidTimeOff: number;
}


export class ContactSearchServiceResponse extends UniEntity {
    public Success: boolean;
    public Method: string;
    public ObjectName: string;
    public ErrorCode: number;
    public ErrorMessage: string;
}


export class InvoicesAndRemindersReadyToRemind extends UniEntity {
    public CustomerInvoiceReminderID: number;
    public Fee: number;
    public CustomerNumber: number;
    public CustomerID: number;
    public InvoiceDate: Date;
    public TaxInclusiveAmount: number;
    public EmailAddress: string;
    public StatusCode: number;
    public Interest: number;
    public TaxInclusiveAmountCurrency: number;
    public ReminderNumber: number;
    public InvoiceNumber: number;
    public CurrencyExchangeRate: number;
    public RestAmountCurrency: number;
    public CustomerInvoiceID: number;
    public DontSendReminders: boolean;
    public DueDate: Date;
    public CustomerName: string;
    public ExternalReference: string;
    public CurrencyCodeID: number;
    public CurrencyCodeShortCode: string;
    public CurrencyCodeCode: string;
    public RestAmount: number;
}


export class TradeHeaderCalculationSummary extends UniEntity {
    public DecimalRounding: number;
    public SumNoVatBasisCurrency: number;
    public SumTotalExVatCurrency: number;
    public SumVatCurrency: number;
    public SumTotalExVat: number;
    public SumVatBasisCurrency: number;
    public SumVatBasis: number;
    public SumTotalIncVat: number;
    public SumVat: number;
    public SumTotalIncVatCurrency: number;
    public DecimalRoundingCurrency: number;
    public SumDiscountCurrency: number;
    public SumDiscount: number;
    public SumNoVatBasis: number;
}


export class VatCalculationSummary extends UniEntity {
    public SumVatCurrency: number;
    public SumVatBasisCurrency: number;
    public SumVatBasis: number;
    public SumVat: number;
    public VatPercent: number;
}


export class InvoicePaymentData extends UniEntity {
    public PaymentDate: LocalDate;
    public FromBankAccountID: number;
    public AgioAmount: number;
    public DimensionsID: number;
    public CurrencyExchangeRate: number;
    public BankChargeAmount: number;
    public BankChargeAccountID: number;
    public PaymentID: string;
    public AgioAccountID: number;
    public CurrencyCodeID: number;
    public AmountCurrency: number;
    public AccountID: number;
    public Amount: number;
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


export class InvoicePayment extends UniEntity {
    public Description: string;
    public FinancialDate: LocalDate;
    public JournalEntryID: number;
    public JournalEntryNumber: string;
    public JournalEntryLineID: number;
    public AmountCurrency: number;
    public Amount: number;
}


export class OrderOffer extends UniEntity {
    public Status: string;
    public CostPercentage: number;
    public Message: string;
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
    public AccountNumber: string;
    public KIDTaxDraw: string;
    public FinancialTax: number;
    public GarnishmentTax: number;
    public KIDEmploymentTax: string;
    public KIDFinancialTax: string;
    public EmploymentTax: number;
    public TaxDraw: number;
    public MessageID: string;
    public period: number;
    public DueDate: Date;
    public KIDGarnishment: string;
}


export class PayrollRunInAmeldingPeriod extends UniEntity {
    public CanGenerateAddition: boolean;
    public AmeldingSentdate: Date;
    public PayrollrunPaydate: Date;
    public PayrollrunDescription: string;
    public PayrollrunID: number;
}


export class PayAgaTaxDTO extends UniEntity {
    public payAga: boolean;
    public payGarnishment: boolean;
    public payFinancialTax: boolean;
    public payDate: Date;
    public correctPennyDiff: boolean;
    public payTaxDraw: boolean;
}


export class ValidationMessage extends UniEntity {
    public ID: number;
    public Level: ValidationLevel;
    public Message: string;
    public PropertyName: string;
    public EntityType: string;
    public EntityID: number;
    public EntityValidationRule: EntityValidationRule;
    public ComplexValidationRule: ComplexValidationRule;
}


export class AmeldingSumUp extends UniEntity {
    public ID: number;
    public altInnStatus: string;
    public year: number;
    public status: AmeldingStatus;
    public ReplacesAMeldingID: number;
    public generated: Date;
    public Replaces: string;
    public period: number;
    public meldingsID: string;
    public LegalEntityNo: string;
    public type: AmeldingType;
    public sent: Date;
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
    public endDate: Date;
    public startDate: Date;
    public type: string;
    public permisjon: Array<EmploymentLeaves>;
}


export class EmploymentLeaves extends UniEntity {
    public beskrivelse: string;
    public permisjonsId: string;
    public startdato: Date;
    public sluttdato: Date;
    public permisjonsprosent: string;
}


export class TransactionTypes extends UniEntity {
    public description: string;
    public benefit: string;
    public Base_EmploymentTax: boolean;
    public tax: boolean;
    public incomeType: string;
    public amount: number;
}


export class AGADetails extends UniEntity {
    public zoneName: string;
    public sectorName: string;
    public baseAmount: number;
    public type: string;
    public rate: number;
}


export class Totals extends UniEntity {
    public sumTax: number;
    public sumUtleggstrekk: number;
    public sumAGA: number;
}


export class AnnualStatement extends UniEntity {
    public EmployerCountry: string;
    public VacationPayBase: number;
    public EmployeePostCode: string;
    public EmployeeNumber: number;
    public EmployerName: string;
    public EmployeeName: string;
    public Year: number;
    public EmployerCity: string;
    public EmployeeMunicipalNumber: string;
    public EmployerWebAddress: string;
    public EmployerEmail: string;
    public EmployerPhoneNumber: string;
    public EmployeeMunicipalName: string;
    public EmployerOrgNr: string;
    public EmployerPostCode: string;
    public EmployerTaxMandatory: boolean;
    public EmployeeAddress: string;
    public EmployerCountryCode: string;
    public EmployerAddress: string;
    public EmployeeSSn: string;
    public EmployeeCity: string;
    public Contributions: Array<AnnualStatementLine>;
    public PensionOrBenefits: Array<AnnualStatementLine>;
    public Deductions: Array<AnnualStatementLine>;
    public Draws: Array<AnnualStatementLine>;
}


export class AnnualStatementLine extends UniEntity {
    public Description: string;
    public Sum: number;
    public IsDeduction: boolean;
    public TaxReturnPost: string;
    public SupplementPackageName: string;
    public LineIndex: number;
    public Amount: number;
    public Supplements: Array<SupplementInfo>;
}


export class SupplementInfo extends UniEntity {
    public Name: string;
    public ValueMoney: number;
    public ValueDate2: Date;
    public WageTypeSupplementID: number;
    public ValueType: Valuetype;
    public ValueBool: boolean;
    public ValueDate: Date;
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
    public mainStatus: string;
    public Text: string;
    public Title: string;
    public IsJob: boolean;
    public employeestatus: Array<EmployeeStatus>;
}


export class EmployeeStatus extends UniEntity {
    public info: string;
    public employeeNumber: number;
    public year: number;
    public status: string;
    public ssn: string;
    public employeeID: number;
    public changedFields: Array<FieldsChanged>;
}


export class FieldsChanged extends UniEntity {
    public fieldName: string;
    public valFrom: string;
    public valTo: string;
}


export class EmploymentHistoryRecord extends UniEntity {
    public HourRate: number;
    public MonthRate: number;
    public ChangedAt: Date;
    public RegulativeStepNr: number;
    public RegulativeGroupID: number;
    public WorkPercent: number;
}


export class CodeListRowsCodeListRow extends UniEntity {
    public Code: string;
    public Value2: string;
    public Value1: string;
    public Value3: string;
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
    public grossPayment: number;
    public employeeID: number;
    public netPayment: number;
    public tax: number;
}


export class SumOnYear extends UniEntity {
    public pension: number;
    public grossPayment: number;
    public sumTax: number;
    public nonTaxableAmount: number;
    public usedNonTaxableAmount: number;
    public advancePayment: number;
    public employeeID: number;
    public netPayment: number;
    public paidHolidaypay: number;
    public taxBase: number;
    public baseVacation: number;
}


export class VacationPayLastYear extends UniEntity {
    public employeeID: number;
    public paidHolidayPay: number;
    public baseVacation: number;
}


export class SalaryTransactionPay extends UniEntity {
    public SalaryBankAccountID: number;
    public CompanyName: string;
    public CompanyPostalCode: string;
    public PaymentDate: Date;
    public CompanyAddress: string;
    public Withholding: number;
    public CompanyBankAccountID: number;
    public CompanyCity: string;
    public TaxBankAccountID: number;
    public PayList: Array<SalaryTransactionPayLine>;
    public SalaryBalancePayList: Array<SalaryBalancePayLine>;
}


export class SalaryTransactionPayLine extends UniEntity {
    public City: string;
    public EmployeeNumber: number;
    public EmployeeName: string;
    public Address: string;
    public Account: string;
    public NetPayment: number;
    public Tax: number;
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
    public ReportID: number;
    public Subject: string;
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
    public BookedPayruns: number;
    public Year: number;
    public CalculatedPayruns: number;
    public FromPeriod: number;
    public CreatedPayruns: number;
    public ToPeriod: number;
    public Groups: Array<ReconciliationGroup>;
}


export class ReconciliationGroup extends UniEntity {
    public AccountNumber: string;
    public Sum: number;
    public Lines: Array<ReconciliationLine>;
}


export class ReconciliationLine extends UniEntity {
    public WageTypeNumber: number;
    public Description: string;
    public Sum: number;
    public Benefit: string;
    public IncomeType: string;
    public WageTypeName: string;
    public HasEmploymentTax: boolean;
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
    public OUO: number;
    public UnionDraw: number;
    public Name: string;
    public MemberNumber: string;
    public Ensurance: number;
}


export class SalaryTransactionSums extends UniEntity {
    public paidPension: number;
    public percentTax: number;
    public calculatedVacationPay: number;
    public grossPayment: number;
    public calculatedAGA: number;
    public baseTableTax: number;
    public paidAdvance: number;
    public calculatedFinancialTax: number;
    public Payrun: number;
    public netPayment: number;
    public baseAGA: number;
    public basePercentTax: number;
    public manualTax: number;
    public baseVacation: number;
    public Employee: number;
    public tableTax: number;
}


export class SalaryTransactionPeriodSums extends UniEntity {
    public AgaRate: number;
    public AgaZone: string;
    public Year: number;
    public FromPeriod: number;
    public MunicipalName: string;
    public ToPeriod: number;
    public OrgNumber: string;
    public Sums: SalaryTransactionSums;
    public Aga: AGACalculation;
}


export class code extends UniEntity {
    public gyldigfom: string;
    public utloeserArbeidsgiveravgift: string;
    public skatteOgAvgiftregel: string;
    public inngaarIGrunnlagForTrekk: string;
    public postnr: string;
    public kunfranav: string;
    public uninavn: string;
    public gyldigtil: string;
    public fordel: string;
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
    public CompanyName: string;
    public ProductNames: string;
    public ContractType: number;
    public CopyFiles: boolean;
    public TemplateCompanyKey: string;
    public LicenseKey: string;
    public ContractID: number;
    public IsTemplate: boolean;
    public IsTest: boolean;
    public CompanySettings: CompanySettings;
}


export class UserDto extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'UserDto';

    public PhoneNumber: string;
    public ID: number;
    public Protected: boolean;
    public DisplayName: string;
    public UpdatedAt: Date;
    public IsAutobankAdmin: boolean;
    public HasAgreedToImportDisclaimer: boolean;
    public StatusCode: number;
    public UserName: string;
    public Deleted: boolean;
    public LastLogin: Date;
    public GlobalIdentity: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public PermissionHandling: string;
    public Email: string;
    public BankIntegrationUserName: string;
    public CreatedAt: Date;
    public AuthPhoneNumber: string;
    public _createguid: string;
    public EndDate: Date;
    public TwoFactorEnabled: boolean;
    public License: UserLicenseInformation;
    public CustomFields: any;
}


export class UserLicenseInformation extends UniEntity {
    public Name: string;
    public Comment: string;
    public GlobalIdentity: string;
    public UserLicenseKey: string;
    public UserLicenseEndDate: Date;
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
    public TypeName: string;
    public TypeID: number;
    public EndDate: Date;
}


export class CompanyLicenseInfomation extends UniEntity {
    public ID: number;
    public Name: string;
    public StatusCode: LicenseEntityStatus;
    public ContactEmail: string;
    public EndDate: Date;
    public ContractID: number;
    public Key: string;
    public ContactPerson: string;
    public Agency: Agency;
}


export class Agency extends UniEntity {
    public CompanyKey: string;
    public Name: string;
}


export class ContractLicenseType extends UniEntity {
    public TrialExpiration: Date;
    public TypeName: string;
    public TypeID: number;
    public StartDate: Date;
}


export class LicenseAgreementInfo extends UniEntity {
    public HasAgreedToLicense: boolean;
    public AgreementId: number;
}


export class CreateBankUserDTO extends UniEntity {
    public Password: string;
    public AdminUserId: number;
    public IsAdmin: boolean;
    public Phone: string;
    public AdminPassword: string;
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
    public UsedFreeAmount: number;
    public GrantSum: number;
    public MaxFreeAmount: number;
}


export class AuthenticationChallengeBE extends UniEntity {
    public Status: ChallengeRequestResult;
    public ValidFrom: Date;
    public Message: string;
    public ValidTo: Date;
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
    public IncludeIncome: boolean;
    public Year: number;
    public IncludeInfoPerPerson: boolean;
    public FromPeriod: Maaned;
    public IncludeEmployments: boolean;
    public ReportType: ReportType;
    public ToPeriod: Maaned;
}


export class A07Response extends UniEntity {
    public mainStatus: string;
    public Text: string;
    public Data: string;
    public Title: string;
    public DataName: string;
    public DataType: string;
}


export class SelfEmployed extends UniEntity {
    public year: number;
    public items: Array<SelfEmployedItem>;
}


export class SelfEmployedItem extends UniEntity {
    public name: string;
    public supplierID: number;
    public number: string;
    public amount: number;
}


export class SetIntegrationDataDto extends UniEntity {
    public ExternalId: string;
    public IntegrationKey: string;
}


export class CurrencyRateData extends UniEntity {
    public RateDateOld: LocalDate;
    public Factor: number;
    public ExchangeRate: number;
    public ExchangeRateOld: number;
    public RateDate: LocalDate;
    public IsOverrideRate: boolean;
    public FromCurrencyCode: CurrencyCode;
}


export class EmailDTO extends UniEntity {
    public ReportID: number;
    public Subject: string;
    public CopyAddress: string;
    public Message: string;
    public Format: string;
    public FromAddress: string;
    public Parameters: Array<ReportParameter>;
}


export class ReportParameter extends UniEntity {
    public Value: string;
    public Name: string;
}


export class DistributionPlanElementValidation extends UniEntity {
    public Priority: number;
    public ElementType: DistributionPlanElementTypes;
    public IsValid: boolean;
    public ElementTypeName: string;
    public PlanElement: DistributionPlanElement;
}


export class SendEmail extends UniEntity {
    public ReportID: number;
    public Subject: string;
    public CopyAddress: string;
    public Message: string;
    public FromAddress: string;
    public ReportName: string;
    public Localization: string;
    public EntityType: string;
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
    public Description: string;
    public Url: string;
    public Title: string;
    public Items: Array<RssItem>;
}


export class RssItem extends UniEntity {
    public Description: string;
    public PubDate: string;
    public Guid: string;
    public Title: string;
    public Category: string;
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
    public Name: string;
    public ExpectedMinutes: number;
    public TotalBalance: number;
    public MinutesWorked: number;
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
    public orgno: string;
    public contactemail: string;
    public contactname: string;
    public orgname: string;
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

    public AccountNumber: string;
    public ID: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public MissingRequiredDimensionsMessage: string;
    public journalEntryLineDraftID: number;
    public DimensionsID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public MissingOnlyWarningsDimensionsMessage: string;
    public CreatedAt: Date;
    public AccountID: number;
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
    public Name: string;
    public DepreciationAccountNumber: number;
    public LastDepreciation: LocalDate;
    public Number: number;
    public BalanceAccountNumber: number;
    public BalanceAccountName: string;
    public CurrentValue: number;
    public GroupName: string;
    public GroupCode: string;
    public Lifetime: number;
    public Lines: Array<AssetReportLineDTO>;
}


export class AssetReportLineDTO extends UniEntity {
    public Value: number;
    public TypeID: number;
    public Date: LocalDate;
    public Type: string;
}


export class BankBalanceDto extends UniEntity {
    public AccountNumber: string;
    public BalanceBooked: number;
    public Comment: string;
    public BalanceAvailable: number;
    public IsTestData: boolean;
    public Date: Date;
}


export class BankData extends UniEntity {
    public AccountNumber: string;
    public IBAN: string;
    public Bank: Bank;
}


export class CreateBankIntegrationDTO extends UniEntity {
    public DisplayName: string;
    public Password: string;
    public IsBankBalance: boolean;
    public TuserName: string;
    public Bank: string;
    public RequireTwoStage: boolean;
    public UserName: string;
    public IsInbound: boolean;
    public BankAccountID: number;
    public Phone: string;
    public BankAcceptance: boolean;
    public Email: string;
    public IsBankStatement: boolean;
    public IsOutgoing: boolean;
    public BankApproval: boolean;
    public ServiceProvider: number;
    public BankAccounts: Array<BankAccountDTO>;
}


export class BankAccountDTO extends UniEntity {
    public IsBankBalance: boolean;
    public IBAN: string;
    public IsInbound: boolean;
    public BBAN: string;
    public Bic: string;
    public IsBankStatement: boolean;
    public IsOutgoing: boolean;
}


export class ZdataUpdateBankProperties extends UniEntity {
    public Password: string;
    public IsBankBalance: boolean;
    public IsInbound: boolean;
    public ServiceID: string;
    public IsBankStatement: boolean;
    public IsOutgoing: boolean;
}


export class AutobankUserDTO extends UniEntity {
    public Password: string;
    public UserID: number;
    public IsAdmin: boolean;
    public Phone: string;
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
    public Group: string;
    public BankStatementEntryID: number;
    public JournalEntryLineID: number;
    public Amount: number;
}


export class MatchRequest extends UniEntity {
    public JournalEntries: Array<MatchCandidate>;
    public BankEntries: Array<MatchCandidate>;
    public Settings: MatchSettings;
}


export class MatchCandidate extends UniEntity {
    public ID: number;
    public Closed: boolean;
    public Date: Date;
    public IsBankEntry: boolean;
    public Amount: number;
}


export class MatchSettings extends UniEntity {
    public MaxDayOffset: number;
    public MaxDelta: number;
}


export class ReconciliationStatus extends UniEntity {
    public IsReconciled: boolean;
    public NumberOfItems: number;
    public NumberOfUnReconciled: number;
    public TotalAmount: number;
    public Todate: Date;
    public TotalUnreconciled: number;
    public FromDate: Date;
    public AccountID: number;
}


export class BalanceDto extends UniEntity {
    public Balance: number;
    public BalanceInStatement: number;
    public EndDate: Date;
    public StartDate: Date;
}


export class BankfileFormat extends UniEntity {
    public LinePrefix: string;
    public SkipRows: number;
    public Name: string;
    public IsFixed: boolean;
    public IsXml: boolean;
    public CustomFormat: BankFileCustomFormat;
    public Separator: string;
    public FileExtension: string;
    public Columns: Array<BankfileColumn>;
}


export class BankfileColumn extends UniEntity {
    public IsFallBack: boolean;
    public Length: number;
    public StartPos: number;
    public DataType: BankfileDataType;
    public FieldMapping: BankfileField;
}


export class JournalSuggestion extends UniEntity {
    public BankStatementRuleID: number;
    public Description: string;
    public FinancialDate: LocalDate;
    public MatchWithEntryID: number;
    public AccountID: number;
    public Amount: number;
    public Account: Account;
}


export class ReportRow extends UniEntity {
    public Period7: number;
    public BudPeriod3: number;
    public AccountNumber: number;
    public Period2: number;
    public BudPeriod4: number;
    public BudPeriod9: number;
    public ID: number;
    public BudPeriod8: number;
    public Sum: number;
    public BudgetSum: number;
    public AccountName: string;
    public Period4: number;
    public SumPeriodAccumulated: number;
    public BudPeriod10: number;
    public AccountYear: number;
    public Period3: number;
    public IsSubTotal: boolean;
    public SumPeriod: number;
    public GroupNumber: number;
    public SumPeriodLastYearAccumulated: number;
    public Period1: number;
    public BudgetAccumulated: number;
    public SubGroupName: string;
    public BudPeriod1: number;
    public Period10: number;
    public BudPeriod12: number;
    public SubGroupNumber: number;
    public BudPeriod2: number;
    public Period5: number;
    public Period8: number;
    public SumPeriodLastYear: number;
    public BudPeriod11: number;
    public Period9: number;
    public GroupName: string;
    public PrecedingBalance: number;
    public BudPeriod6: number;
    public Period6: number;
    public Period11: number;
    public BudPeriod5: number;
    public Period12: number;
    public BudPeriod7: number;
    public SumLastYear: number;
}


export class BudgetImport extends UniEntity {
    public Budget: Budget;
}


export class LiquidityTableDTO extends UniEntity {
    public OverdueCustomerInvoices: number;
    public BankBalance: number;
    public BankBalanceRefferance: BankBalanceType;
    public OverdueSupplierInvoices: number;
    public Period: Array<DetailsDTO>;
}


export class DetailsDTO extends UniEntity {
    public VAT: number;
    public Sum: number;
    public Liquidity: number;
    public Custumer: number;
    public Supplier: number;
    public CustomPayments: number;
}


export class JournalEntryData extends UniEntity {
    public Description: string;
    public NumberSeriesID: number;
    public JournalEntryDataAccrualID: number;
    public StatusCode: number;
    public CreditVatTypeID: number;
    public DebitVatTypeID: number;
    public FinancialDate: LocalDate;
    public VatDate: LocalDate;
    public CurrencyID: number;
    public NumberSeriesTaskID: number;
    public SupplierInvoiceID: number;
    public JournalEntryID: number;
    public CustomerOrderID: number;
    public VatDeductionPercent: number;
    public DebitAccountID: number;
    public InvoiceNumber: string;
    public CurrencyExchangeRate: number;
    public CreditAccountNumber: number;
    public SupplierInvoiceNo: string;
    public CustomerInvoiceID: number;
    public DueDate: LocalDate;
    public PaymentID: string;
    public CreditAccountID: number;
    public JournalEntryNo: string;
    public PostPostJournalEntryLineID: number;
    public AmountCurrency: number;
    public DebitAccountNumber: number;
    public Amount: number;
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
    public PeriodNo: number;
    public PeriodSumYear2: number;
    public PeriodName: string;
}


export class JournalEntryLineRequestSummary extends UniEntity {
    public SumDebit: number;
    public SumCredit: number;
    public SumBalance: number;
    public SumLedger: number;
    public SumTaxBasisAmount: number;
}


export class JournalEntryLinePostPostData extends UniEntity {
    public MarkedAgainstJournalEntryNumber: string;
    public ID: number;
    public NumberOfPayments: number;
    public Description: string;
    public SubAccountNumber: number;
    public SubAccountName: string;
    public AccountYear: number;
    public StatusCode: number;
    public FinancialDate: Date;
    public MarkedAgainstJournalEntryLineID: number;
    public JournalEntryNumberNumeric: number;
    public SumPostPostAmountCurrency: number;
    public PeriodNo: number;
    public JournalEntryID: number;
    public SumPostPostAmount: number;
    public JournalEntryNumber: string;
    public InvoiceNumber: string;
    public JournalEntryTypeName: string;
    public CurrencyExchangeRate: number;
    public RestAmountCurrency: number;
    public DueDate: Date;
    public PaymentID: string;
    public CurrencyCodeID: number;
    public CurrencyCodeShortCode: string;
    public CurrencyCodeCode: string;
    public AmountCurrency: number;
    public Amount: number;
    public RestAmount: number;
    public Markings: Array<JournalEntryLinePostPostData>;
}


export class CreatePaymentBatchDTO extends UniEntity {
    public Password: string;
    public Code: string;
    public HashValue: string;
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
    public OriginalStatusCode: StatusCodeJournalEntryLine;
    public StatusCode: StatusCodeJournalEntryLine;
    public FinancialDate: Date;
    public OriginalRestAmount: number;
    public JournalEntryNumber: string;
    public InvoiceNumber: string;
    public RestAmountCurrency: number;
    public AmountCurrency: number;
    public Amount: number;
    public RestAmount: number;
    public Markings: Array<MarkingReference>;
}


export class MarkingReference extends UniEntity {
    public ID: number;
    public JournalEntryNumber: string;
}


export class SupplierInvoiceDetail extends UniEntity {
    public AccountNumber: number;
    public VatTypeID: number;
    public Description: string;
    public AccountName: string;
    public InvoiceDate: Date;
    public DeliveryDate: Date;
    public SupplierID: number;
    public VatCode: string;
    public SupplierInvoiceID: number;
    public InvoiceNumber: string;
    public VatTypeName: string;
    public AmountCurrency: number;
    public AccountID: number;
    public VatPercent: number;
    public Amount: number;
}


export class VatReportNotReportedJournalEntryData extends UniEntity {
    public NumberOfJournalEntryLines: number;
    public SumVatAmount: number;
    public TerminPeriodID: number;
    public SumTaxBasisAmount: number;
}


export class AltinnSigningTextResponse extends UniEntity {
    public SigningText: string;
}


export class AltinnGetVatReportDataFromAltinnResult extends UniEntity {
    public Status: AltinnGetVatReportDataFromAltinnStatus;
    public Message: string;
}


export class AccountUsage extends UniEntity {
    public AccountNumber: number;
    public Counter: number;
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


export enum ForeignWorker{
    notSet = 0,
    ForeignWorkerUSA_Canada = 1,
    ForeignWorkerFixedAga = 2,
}


export enum OtpStatus{
    A = 0,
    S = 1,
    P = 2,
    LP = 3,
    AP = 4,
}


export enum PaymentInterval{
    Standard = 0,
    Monthly = 1,
    Pr14Days = 2,
    Weekly = 3,
}


export enum InternationalIDType{
    notSet = 0,
    Passportnumber = 1,
    SocialSecurityNumber = 2,
    TaxIdentificationNumber = 3,
    ValueAddedTaxNumber = 4,
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


export enum UserVerificationRequestOrigin{
    AppFrontend = 0,
    DeveloperPortal = 1,
}


export enum UserVerificationUserType{
    Reader = 0,
    Admin = 1,
    Owner = 2,
    Support = 3,
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
    Credited = 42006,
    PartlyCredited = 42007,
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


export enum StatusCodeIncomeReport{
    Created = 49001,
    Sendt = 49002,
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
