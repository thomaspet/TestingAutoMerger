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

    public Field: string;
    public CreatedAt: Date;
    public NewValue: string;
    public Verb: string;
    public Action: string;
    public ClientID: string;
    public Deleted: boolean;
    public CreatedBy: string;
    public ID: number;
    public Transaction: string;
    public UpdatedBy: string;
    public Route: string;
    public UpdatedAt: Date;
    public EntityType: string;
    public OldValue: string;
    public EntityID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class WorkBalance extends UniEntity {
    public static RelativeUrl = 'workbalances';
    public static EntityType = 'WorkBalance';

    public BalanceFrom: Date;
    public CreatedAt: Date;
    public ExpectedMinutes: number;
    public ActualMinutes: number;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public Description: string;
    public ID: number;
    public BalanceDate: Date;
    public Minutes: number;
    public Balancetype: WorkBalanceTypeEnum;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public IsStartBalance: boolean;
    public WorkRelationID: number;
    public ValidTimeOff: number;
    public ValidFrom: Date;
    public Days: number;
    public _createguid: string;
    public CustomFields: any;
}


export class Worker extends UniEntity {
    public static RelativeUrl = 'workers';
    public static EntityType = 'Worker';

    public UserID: number;
    public CreatedAt: Date;
    public BusinessRelationID: number;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
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
    public Date: Date;
    public StartTime: Date;
    public CreatedAt: Date;
    public CustomerID: number;
    public LunchInMinutes: number;
    public EndTime: Date;
    public MinutesToOrder: number;
    public TransferedToPayroll: boolean;
    public TransferedToOrder: boolean;
    public PriceExVat: number;
    public OrderItemId: number;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public Description: string;
    public ID: number;
    public Minutes: number;
    public PayrollTrackingID: number;
    public UpdatedBy: string;
    public Invoiceable: boolean;
    public UpdatedAt: Date;
    public WorkTypeID: number;
    public WorkRelationID: number;
    public DimensionsID: number;
    public CustomerOrderID: number;
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

    public CreatedAt: Date;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public WorkRelationID: number;
    public _createguid: string;
    public WorkRelation: WorkRelation;
    public Items: Array<WorkItem>;
    public CustomFields: any;
}


export class WorkProfile extends UniEntity {
    public static RelativeUrl = 'workprofiles';
    public static EntityType = 'WorkProfile';

    public MinutesPerWeek: number;
    public MinutesPerMonth: number;
    public IsShared: boolean;
    public CreatedAt: Date;
    public MinutesPerYear: number;
    public LunchIncluded: boolean;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public ID: number;
    public UpdatedBy: string;
    public Name: string;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class WorkRelation extends UniEntity {
    public static RelativeUrl = 'workrelations';
    public static EntityType = 'WorkRelation';

    public IsPrivate: boolean;
    public CreatedAt: Date;
    public WorkerID: number;
    public EndTime: Date;
    public WorkProfileID: number;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public Description: string;
    public ID: number;
    public TeamID: number;
    public UpdatedBy: string;
    public WorkPercentage: number;
    public CompanyID: number;
    public UpdatedAt: Date;
    public IsActive: boolean;
    public StartDate: Date;
    public CompanyName: string;
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
    public SystemKey: string;
    public IsHalfDay: boolean;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public TimeoffType: number;
    public Description: string;
    public ID: number;
    public RegionKey: string;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public WorkRelationID: number;
    public ToDate: Date;
    public FromDate: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class WorkType extends UniEntity {
    public static RelativeUrl = 'worktypes';
    public static EntityType = 'WorkType';

    public WagetypeNumber: number;
    public CreatedAt: Date;
    public ProductID: number;
    public SystemType: WorkTypeEnum;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public Description: string;
    public ID: number;
    public Price: number;
    public UpdatedBy: string;
    public Name: string;
    public UpdatedAt: Date;
    public _createguid: string;
    public Product: Product;
    public CustomFields: any;
}


export class BankFile extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'BankFile';

    public CreatedAt: Date;
    public FileID: number;
    public SubCompanyID: number;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public ParentFileid: number;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public Accountnumber: string;
    public _createguid: string;
    public File: File;
    public SubCompany: SubCompany;
    public CustomFields: any;
}


export class BatchInvoice extends UniEntity {
    public static RelativeUrl = 'batchinvoices';
    public static EntityType = 'BatchInvoice';

    public OurRef: string;
    public CreatedAt: Date;
    public SellerID: number;
    public FreeTxt: string;
    public YourRef: string;
    public Processed: number;
    public Operation: BatchInvoiceOperation;
    public DueDate: LocalDate;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public ID: number;
    public Comment: string;
    public NumberOfBatches: number;
    public UpdatedBy: string;
    public NotifyEmail: boolean;
    public UpdatedAt: Date;
    public TotalToProcess: number;
    public MinAmount: number;
    public InvoiceDate: LocalDate;
    public CustomerID: number;
    public ProjectID: number;
    public _createguid: string;
    public Items: Array<BatchInvoiceItem>;
    public CustomFields: any;
}


export class BatchInvoiceItem extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'BatchInvoiceItem';

    public BatchInvoiceID: number;
    public CreatedAt: Date;
    public BatchNumber: number;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: StatusCode;
    public ID: number;
    public UpdatedBy: string;
    public CommentID: number;
    public CustomerInvoiceID: number;
    public UpdatedAt: Date;
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

    public CreatedAt: Date;
    public Template: string;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public EntityName: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Customer extends UniEntity {
    public static RelativeUrl = 'customers';
    public static EntityType = 'Customer';

    public PaymentTermsID: number;
    public EInvoiceAgreementReference: string;
    public EfakturaIdentifier: string;
    public IsPrivate: boolean;
    public SubAccountNumberSeriesID: number;
    public CreatedAt: Date;
    public CustomerNumberKidAlias: string;
    public AvtaleGiroNotification: boolean;
    public PeppolAddress: string;
    public DefaultCustomerOrderReportID: number;
    public BusinessRelationID: number;
    public AvtaleGiro: boolean;
    public AcceptableDelta4CustomerPayment: number;
    public ReminderEmailAddress: string;
    public AcceptableDelta4CustomerPaymentAccountID: number;
    public CustomerInvoiceReminderSettingsID: number;
    public GLN: string;
    public DefaultSellerID: number;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public ID: number;
    public DefaultDistributionsID: number;
    public SocialSecurityNumber: string;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public WebUrl: string;
    public DeliveryTermsID: number;
    public OrgNumber: string;
    public DimensionsID: number;
    public DefaultCustomerQuoteReportID: number;
    public CreditDays: number;
    public CustomerNumber: number;
    public Localization: string;
    public DontSendReminders: boolean;
    public DefaultCustomerInvoiceReportID: number;
    public CurrencyCodeID: number;
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

    public PaymentTermsID: number;
    public InvoiceReceiverName: string;
    public DeliveryTerm: string;
    public RestAmountCurrency: number;
    public AccrualID: number;
    public CreatedAt: Date;
    public RestAmount: number;
    public Payment: string;
    public CustomerID: number;
    public ShippingCountryCode: string;
    public SupplierOrgNumber: string;
    public InvoiceCity: string;
    public DeliveryDate: LocalDate;
    public InvoiceCountry: string;
    public CustomerPerson: string;
    public PaymentInformation: string;
    public CustomerName: string;
    public TaxInclusiveAmountCurrency: number;
    public FreeTxt: string;
    public LastPaymentDate: LocalDate;
    public InvoiceCountryCode: string;
    public InvoiceAddressLine1: string;
    public InvoiceType: number;
    public CurrencyExchangeRate: number;
    public CreditedAmountCurrency: number;
    public ExternalReference: string;
    public ShippingAddressLine1: string;
    public ShippingCity: string;
    public DefaultSellerID: number;
    public UpdateCurrencyAmountsOnDateChange: boolean;
    public OurReference: string;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public BankAccountID: number;
    public YourReference: string;
    public ID: number;
    public Requisition: string;
    public DeliveryName: string;
    public InvoiceReferenceID: number;
    public EmailAddress: string;
    public ShippingAddressLine2: string;
    public CollectorStatusCode: number;
    public PaymentDueDate: LocalDate;
    public Comment: string;
    public UpdatedBy: string;
    public ShippingCountry: string;
    public InvoiceNumber: string;
    public TaxExclusiveAmountCurrency: number;
    public InvoicePostalCode: string;
    public PaymentInfoTypeID: number;
    public InvoiceAddressLine2: string;
    public InvoiceAddressLine3: string;
    public UpdatedAt: Date;
    public SalesPerson: string;
    public DefaultDimensionsID: number;
    public PrintStatus: number;
    public CustomerOrgNumber: string;
    public Credited: boolean;
    public PayableRoundingAmount: number;
    public AmountRegards: string;
    public ExternalStatus: number;
    public PaymentID: string;
    public CreditedAmount: number;
    public DeliveryTermsID: number;
    public VatTotalsAmount: number;
    public PaymentTerm: string;
    public PayableRoundingCurrencyAmount: number;
    public JournalEntryID: number;
    public ShippingPostalCode: string;
    public InvoiceDate: LocalDate;
    public DistributionPlanID: number;
    public TaxInclusiveAmount: number;
    public CreditDays: number;
    public TaxExclusiveAmount: number;
    public VatTotalsAmountCurrency: number;
    public InvoiceNumberSeriesID: number;
    public DontSendReminders: boolean;
    public CurrencyCodeID: number;
    public UseReportID: number;
    public DeliveryMethod: string;
    public ShippingAddressLine3: string;
    public InternalNote: string;
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

    public SumTotalIncVatCurrency: number;
    public SumVatCurrency: number;
    public ItemSourceID: number;
    public CreatedAt: Date;
    public ProductID: number;
    public InvoicePeriodEndDate: LocalDate;
    public AccountingCost: string;
    public CostPrice: number;
    public DiscountPercent: number;
    public Unit: string;
    public DiscountCurrency: number;
    public CurrencyExchangeRate: number;
    public PriceExVat: number;
    public ItemText: string;
    public PriceIncVat: number;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public ID: number;
    public AccountID: number;
    public VatPercent: number;
    public Comment: string;
    public UpdatedBy: string;
    public CustomerInvoiceID: number;
    public InvoicePeriodStartDate: LocalDate;
    public NumberOfItems: number;
    public PriceSetByUser: boolean;
    public UpdatedAt: Date;
    public VatTypeID: number;
    public SumVat: number;
    public Discount: number;
    public SumTotalExVat: number;
    public DimensionsID: number;
    public SortIndex: number;
    public SumTotalIncVat: number;
    public CalculateGrossPriceBasedOnNetPrice: boolean;
    public CurrencyCodeID: number;
    public PriceExVatCurrency: number;
    public SumTotalExVatCurrency: number;
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

    public RestAmountCurrency: number;
    public CreatedAt: Date;
    public RestAmount: number;
    public Notified: boolean;
    public RunNumber: number;
    public CurrencyExchangeRate: number;
    public DebtCollectionFee: number;
    public ReminderFee: number;
    public InterestFeeCurrency: number;
    public InterestFee: number;
    public DueDate: LocalDate;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public Description: string;
    public ID: number;
    public EmailAddress: string;
    public DebtCollectionFeeCurrency: number;
    public UpdatedBy: string;
    public CustomerInvoiceID: number;
    public Title: string;
    public UpdatedAt: Date;
    public ReminderNumber: number;
    public RemindedDate: LocalDate;
    public DimensionsID: number;
    public CreatedByReminderRuleID: number;
    public CurrencyCodeID: number;
    public ReminderFeeCurrency: number;
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
    public CustomerInvoiceReminderSettingsID: number;
    public ReminderFee: number;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public Description: string;
    public ID: number;
    public UseMaximumLegalReminderFee: boolean;
    public MinimumDaysFromDueDate: number;
    public UpdatedBy: string;
    public Title: string;
    public UpdatedAt: Date;
    public ReminderNumber: number;
    public CreditDays: number;
    public _createguid: string;
    public CustomerInvoiceReminderSettings: CustomerInvoiceReminderSettings;
    public CustomFields: any;
}


export class CustomerInvoiceReminderSettings extends UniEntity {
    public static RelativeUrl = 'invoiceremindersettings';
    public static EntityType = 'CustomerInvoiceReminderSettings';

    public AcceptPaymentWithoutReminderFee: boolean;
    public MinimumAmountToRemind: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public ID: number;
    public UpdatedBy: string;
    public DefaultReminderFeeAccountID: number;
    public UpdatedAt: Date;
    public DebtCollectionSettingsID: number;
    public RemindersBeforeDebtCollection: number;
    public _createguid: string;
    public DebtCollectionSettings: DebtCollectionSettings;
    public DefaultReminderFeeAccount: Account;
    public CustomerInvoiceReminderRules: Array<CustomerInvoiceReminderRule>;
    public CustomFields: any;
}


export class CustomerOrder extends UniEntity {
    public static RelativeUrl = 'orders';
    public static EntityType = 'CustomerOrder';

    public PaymentTermsID: number;
    public InvoiceReceiverName: string;
    public DeliveryTerm: string;
    public RestAmountCurrency: number;
    public AccrualID: number;
    public CreatedAt: Date;
    public CustomerID: number;
    public ShippingCountryCode: string;
    public SupplierOrgNumber: string;
    public InvoiceCity: string;
    public OrderNumberSeriesID: number;
    public DeliveryDate: LocalDate;
    public InvoiceCountry: string;
    public CustomerPerson: string;
    public CustomerName: string;
    public TaxInclusiveAmountCurrency: number;
    public FreeTxt: string;
    public InvoiceCountryCode: string;
    public InvoiceAddressLine1: string;
    public CurrencyExchangeRate: number;
    public ShippingAddressLine1: string;
    public ShippingCity: string;
    public DefaultSellerID: number;
    public UpdateCurrencyAmountsOnDateChange: boolean;
    public OurReference: string;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public YourReference: string;
    public ID: number;
    public Requisition: string;
    public DeliveryName: string;
    public EmailAddress: string;
    public ShippingAddressLine2: string;
    public Comment: string;
    public UpdatedBy: string;
    public ShippingCountry: string;
    public UpdateCurrencyOnToInvoice: boolean;
    public TaxExclusiveAmountCurrency: number;
    public InvoicePostalCode: string;
    public ReadyToInvoice: boolean;
    public PaymentInfoTypeID: number;
    public InvoiceAddressLine2: string;
    public InvoiceAddressLine3: string;
    public UpdatedAt: Date;
    public SalesPerson: string;
    public DefaultDimensionsID: number;
    public PrintStatus: number;
    public CustomerOrgNumber: string;
    public OrderNumber: number;
    public PayableRoundingAmount: number;
    public OrderDate: LocalDate;
    public DeliveryTermsID: number;
    public VatTotalsAmount: number;
    public PaymentTerm: string;
    public PayableRoundingCurrencyAmount: number;
    public ShippingPostalCode: string;
    public DistributionPlanID: number;
    public TaxInclusiveAmount: number;
    public CreditDays: number;
    public TaxExclusiveAmount: number;
    public VatTotalsAmountCurrency: number;
    public CurrencyCodeID: number;
    public UseReportID: number;
    public DeliveryMethod: string;
    public RestExclusiveAmountCurrency: number;
    public ShippingAddressLine3: string;
    public InternalNote: string;
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

    public SumTotalIncVatCurrency: number;
    public SumVatCurrency: number;
    public ItemSourceID: number;
    public CreatedAt: Date;
    public ProductID: number;
    public CostPrice: number;
    public DiscountPercent: number;
    public Unit: string;
    public DiscountCurrency: number;
    public CurrencyExchangeRate: number;
    public PriceExVat: number;
    public ItemText: string;
    public PriceIncVat: number;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public ID: number;
    public AccountID: number;
    public VatPercent: number;
    public Comment: string;
    public UpdatedBy: string;
    public NumberOfItems: number;
    public PriceSetByUser: boolean;
    public ReadyToInvoice: boolean;
    public UpdatedAt: Date;
    public VatTypeID: number;
    public SumVat: number;
    public Discount: number;
    public SumTotalExVat: number;
    public DimensionsID: number;
    public SortIndex: number;
    public CustomerOrderID: number;
    public SumTotalIncVat: number;
    public CalculateGrossPriceBasedOnNetPrice: boolean;
    public CurrencyCodeID: number;
    public PriceExVatCurrency: number;
    public SumTotalExVatCurrency: number;
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

    public PaymentTermsID: number;
    public InvoiceReceiverName: string;
    public DeliveryTerm: string;
    public QuoteDate: LocalDate;
    public CreatedAt: Date;
    public CustomerID: number;
    public ShippingCountryCode: string;
    public SupplierOrgNumber: string;
    public InvoiceCity: string;
    public DeliveryDate: LocalDate;
    public InvoiceCountry: string;
    public CustomerPerson: string;
    public CustomerName: string;
    public TaxInclusiveAmountCurrency: number;
    public FreeTxt: string;
    public InvoiceCountryCode: string;
    public InvoiceAddressLine1: string;
    public ValidUntilDate: LocalDate;
    public CurrencyExchangeRate: number;
    public ShippingAddressLine1: string;
    public ShippingCity: string;
    public DefaultSellerID: number;
    public UpdateCurrencyAmountsOnDateChange: boolean;
    public OurReference: string;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public YourReference: string;
    public ID: number;
    public Requisition: string;
    public InquiryReference: number;
    public DeliveryName: string;
    public EmailAddress: string;
    public ShippingAddressLine2: string;
    public Comment: string;
    public UpdatedBy: string;
    public ShippingCountry: string;
    public UpdateCurrencyOnToInvoice: boolean;
    public TaxExclusiveAmountCurrency: number;
    public InvoicePostalCode: string;
    public PaymentInfoTypeID: number;
    public InvoiceAddressLine2: string;
    public InvoiceAddressLine3: string;
    public UpdatedAt: Date;
    public SalesPerson: string;
    public DefaultDimensionsID: number;
    public PrintStatus: number;
    public CustomerOrgNumber: string;
    public PayableRoundingAmount: number;
    public QuoteNumberSeriesID: number;
    public DeliveryTermsID: number;
    public VatTotalsAmount: number;
    public PaymentTerm: string;
    public PayableRoundingCurrencyAmount: number;
    public UpdateCurrencyOnToOrder: boolean;
    public ShippingPostalCode: string;
    public DistributionPlanID: number;
    public TaxInclusiveAmount: number;
    public QuoteNumber: number;
    public CreditDays: number;
    public TaxExclusiveAmount: number;
    public VatTotalsAmountCurrency: number;
    public CurrencyCodeID: number;
    public UseReportID: number;
    public DeliveryMethod: string;
    public ShippingAddressLine3: string;
    public InternalNote: string;
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

    public SumTotalIncVatCurrency: number;
    public SumVatCurrency: number;
    public CreatedAt: Date;
    public ProductID: number;
    public CustomerQuoteID: number;
    public CostPrice: number;
    public DiscountPercent: number;
    public Unit: string;
    public DiscountCurrency: number;
    public CurrencyExchangeRate: number;
    public PriceExVat: number;
    public ItemText: string;
    public PriceIncVat: number;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public ID: number;
    public AccountID: number;
    public VatPercent: number;
    public Comment: string;
    public UpdatedBy: string;
    public NumberOfItems: number;
    public PriceSetByUser: boolean;
    public UpdatedAt: Date;
    public VatTypeID: number;
    public SumVat: number;
    public Discount: number;
    public SumTotalExVat: number;
    public DimensionsID: number;
    public SortIndex: number;
    public SumTotalIncVat: number;
    public CalculateGrossPriceBasedOnNetPrice: boolean;
    public CurrencyCodeID: number;
    public PriceExVatCurrency: number;
    public SumTotalExVatCurrency: number;
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
    public CreditorNumber: number;
    public DebtCollectionAutomationID: number;
    public CustomerInvoiceReminderSettingsID: number;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public ID: number;
    public DebtCollectionFormat: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public IntegrateWithDebtCollection: boolean;
    public _createguid: string;
    public DebtCollectionAutomation: Array<DebtCollectionAutomation>;
    public CustomerInvoiceReminderSettings: CustomerInvoiceReminderSettings;
    public CustomFields: any;
}


export class ItemSource extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ItemSource';

    public CreatedAt: Date;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public _createguid: string;
    public Details: Array<ItemSourceDetail>;
    public CustomFields: any;
}


export class ItemSourceDetail extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ItemSourceDetail';

    public Tag: string;
    public ItemSourceID: number;
    public CreatedAt: Date;
    public Amount: number;
    public SourceFK: number;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public Description: string;
    public ID: number;
    public UpdatedBy: string;
    public SourceType: string;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class PaymentInfoType extends UniEntity {
    public static RelativeUrl = 'paymentinfotype';
    public static EntityType = 'PaymentInfoType';

    public Locked: boolean;
    public CreatedAt: Date;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public ID: number;
    public Length: number;
    public UpdatedBy: string;
    public Name: string;
    public UpdatedAt: Date;
    public Control: Modulus;
    public Type: PaymentInfoTypeEnum;
    public _createguid: string;
    public PaymentInfoTypeParts: Array<PaymentInfoTypePart>;
    public CustomFields: any;
}


export class PaymentInfoTypePart extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'PaymentInfoTypePart';

    public Part: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public ID: number;
    public Length: number;
    public UpdatedBy: string;
    public PaymentInfoTypeID: number;
    public UpdatedAt: Date;
    public SortIndex: number;
    public _createguid: string;
    public CustomFields: any;
}


export class RecurringInvoice extends UniEntity {
    public static RelativeUrl = 'recurringinvoices';
    public static EntityType = 'RecurringInvoice';

    public PaymentTermsID: number;
    public NotifyUser: string;
    public InvoiceReceiverName: string;
    public DeliveryTerm: string;
    public CreatedAt: Date;
    public EndDate: LocalDate;
    public Payment: string;
    public CustomerID: number;
    public ShippingCountryCode: string;
    public SupplierOrgNumber: string;
    public InvoiceCity: string;
    public DeliveryDate: LocalDate;
    public InvoiceCountry: string;
    public CustomerPerson: string;
    public PaymentInformation: string;
    public CustomerName: string;
    public TaxInclusiveAmountCurrency: number;
    public NoCreditDays: boolean;
    public FreeTxt: string;
    public InvoiceCountryCode: string;
    public InvoiceAddressLine1: string;
    public CurrencyExchangeRate: number;
    public ShippingAddressLine1: string;
    public NotifyWhenRecurringEnds: boolean;
    public ShippingCity: string;
    public DefaultSellerID: number;
    public UpdateCurrencyAmountsOnDateChange: boolean;
    public OurReference: string;
    public Deleted: boolean;
    public CreatedBy: string;
    public NotifyWhenOrdersArePrepared: boolean;
    public StatusCode: number;
    public YourReference: string;
    public ID: number;
    public Requisition: string;
    public DeliveryName: string;
    public MaxIterations: number;
    public EmailAddress: string;
    public ShippingAddressLine2: string;
    public Comment: string;
    public UpdatedBy: string;
    public ShippingCountry: string;
    public NextInvoiceDate: LocalDate;
    public TimePeriod: RecurringPeriod;
    public TaxExclusiveAmountCurrency: number;
    public InvoicePostalCode: string;
    public PaymentInfoTypeID: number;
    public InvoiceAddressLine2: string;
    public InvoiceAddressLine3: string;
    public UpdatedAt: Date;
    public SalesPerson: string;
    public DefaultDimensionsID: number;
    public PrintStatus: number;
    public CustomerOrgNumber: string;
    public PayableRoundingAmount: number;
    public AmountRegards: string;
    public ProduceAs: RecurringResult;
    public DeliveryTermsID: number;
    public VatTotalsAmount: number;
    public PaymentTerm: string;
    public PayableRoundingCurrencyAmount: number;
    public Interval: number;
    public PreparationDays: number;
    public ShippingPostalCode: string;
    public StartDate: LocalDate;
    public DistributionPlanID: number;
    public TaxInclusiveAmount: number;
    public CreditDays: number;
    public TaxExclusiveAmount: number;
    public VatTotalsAmountCurrency: number;
    public InvoiceNumberSeriesID: number;
    public CurrencyCodeID: number;
    public UseReportID: number;
    public DeliveryMethod: string;
    public ShippingAddressLine3: string;
    public InternalNote: string;
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

    public SumTotalIncVatCurrency: number;
    public SumVatCurrency: number;
    public RecurringInvoiceID: number;
    public CreatedAt: Date;
    public ProductID: number;
    public DiscountPercent: number;
    public Unit: string;
    public DiscountCurrency: number;
    public CurrencyExchangeRate: number;
    public PriceExVat: number;
    public ItemText: string;
    public PriceIncVat: number;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public ID: number;
    public AccountID: number;
    public VatPercent: number;
    public ReduceIncompletePeriod: boolean;
    public Comment: string;
    public UpdatedBy: string;
    public NumberOfItems: number;
    public PriceSetByUser: boolean;
    public UpdatedAt: Date;
    public TimeFactor: RecurringPeriod;
    public VatTypeID: number;
    public SumVat: number;
    public Discount: number;
    public SumTotalExVat: number;
    public DimensionsID: number;
    public SortIndex: number;
    public PricingSource: PricingSource;
    public SumTotalIncVat: number;
    public CalculateGrossPriceBasedOnNetPrice: boolean;
    public CurrencyCodeID: number;
    public PriceExVatCurrency: number;
    public SumTotalExVatCurrency: number;
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
    public CreatedAt: Date;
    public NotifiedRecurringEnds: boolean;
    public InvoiceID: number;
    public NotifiedOrdersPrepared: boolean;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public ID: number;
    public IterationNumber: number;
    public Comment: string;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public CreationDate: LocalDate;
    public OrderID: number;
    public InvoiceDate: LocalDate;
    public _createguid: string;
    public CustomFields: any;
}


export class Seller extends UniEntity {
    public static RelativeUrl = 'sellers';
    public static EntityType = 'Seller';

    public UserID: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public ID: number;
    public TeamID: number;
    public UpdatedBy: string;
    public Name: string;
    public UpdatedAt: Date;
    public DefaultDimensionsID: number;
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

    public Percent: number;
    public RecurringInvoiceID: number;
    public CreatedAt: Date;
    public SellerID: number;
    public CustomerID: number;
    public CustomerQuoteID: number;
    public Amount: number;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public ID: number;
    public UpdatedBy: string;
    public CustomerInvoiceID: number;
    public UpdatedAt: Date;
    public CustomerOrderID: number;
    public _createguid: string;
    public Seller: Seller;
    public CustomFields: any;
}


export class SubCompany extends UniEntity {
    public static RelativeUrl = 'subcompanies';
    public static EntityType = 'SubCompany';

    public CreatedAt: Date;
    public CustomerID: number;
    public CompanyType: CompanyRelation;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public ID: number;
    public UpdatedBy: string;
    public CompanyID: number;
    public UpdatedAt: Date;
    public CompanyName: string;
    public CompanyKey: string;
    public _createguid: string;
    public Customer: Customer;
    public CustomFields: any;
}


export class Supplier extends UniEntity {
    public static RelativeUrl = 'suppliers';
    public static EntityType = 'Supplier';

    public SubAccountNumberSeriesID: number;
    public CreatedAt: Date;
    public PeppolAddress: string;
    public BusinessRelationID: number;
    public SelfEmployed: boolean;
    public GLN: string;
    public CostAllocationID: number;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public ID: number;
    public SupplierNumber: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public WebUrl: string;
    public OrgNumber: string;
    public DimensionsID: number;
    public CreditDays: number;
    public Localization: string;
    public CurrencyCodeID: number;
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
    public TermsType: TermsType;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public Description: string;
    public ID: number;
    public UpdatedBy: string;
    public Name: string;
    public UpdatedAt: Date;
    public CreditDays: number;
    public _createguid: string;
    public CustomFields: any;
}


export class TOFCurrencySettings extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'TOFCurrencySettings';

    public CreatedAt: Date;
    public UpdateCurrencyAmountsOnQuoteToOrder: boolean;
    public UpdateCurrencyAmountsOnQuoteToInvoice: boolean;
    public UpdateCurrencyAmountsOnQuotedateChange: boolean;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public UpdateCurrencyAmountsOnInvoicedateChange: boolean;
    public ID: number;
    public UpdateCurrencyAmountsOnOrderToInvoice: boolean;
    public UpdateCurrencyAmountsOnOrderdateChange: boolean;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class Address extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Address';

    public PostalCode: string;
    public CountryCode: string;
    public CreatedAt: Date;
    public BusinessRelationID: number;
    public Region: string;
    public Deleted: boolean;
    public CreatedBy: string;
    public Country: string;
    public StatusCode: number;
    public ID: number;
    public City: string;
    public AddressLine2: string;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public AddressLine3: string;
    public AddressLine1: string;
    public _createguid: string;
    public BusinessRelation: BusinessRelation;
    public CustomFields: any;
}


export class BusinessRelation extends UniEntity {
    public static RelativeUrl = 'business-relations';
    public static EntityType = 'BusinessRelation';

    public InvoiceAddressID: number;
    public DefaultBankAccountID: number;
    public CreatedAt: Date;
    public DefaultEmailID: number;
    public Deleted: boolean;
    public DefaultPhoneID: number;
    public CreatedBy: string;
    public StatusCode: number;
    public ID: number;
    public UpdatedBy: string;
    public Name: string;
    public DefaultContactID: number;
    public UpdatedAt: Date;
    public ShippingAddressID: number;
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

    public ParentBusinessRelationID: number;
    public CreatedAt: Date;
    public InfoID: number;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public ID: number;
    public Comment: string;
    public UpdatedBy: string;
    public Role: string;
    public UpdatedAt: Date;
    public _createguid: string;
    public ParentBusinessRelation: BusinessRelation;
    public Info: BusinessRelation;
    public CustomFields: any;
}


export class Email extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Email';

    public CreatedAt: Date;
    public BusinessRelationID: number;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public Description: string;
    public ID: number;
    public EmailAddress: string;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public Type: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Phone extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Phone';

    public CountryCode: string;
    public CreatedAt: Date;
    public BusinessRelationID: number;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public Description: string;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public Type: PhoneTypeEnum;
    public Number: string;
    public _createguid: string;
    public CustomFields: any;
}


export class AGACalculation extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AGACalculation';

    public CreatedAt: Date;
    public PayrollRunID: number;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
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

    public AGACalculationID: number;
    public CreatedAt: Date;
    public freeAmount: number;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public SubEntityID: number;
    public _createguid: string;
    public subEntity: SubEntity;
    public CustomFields: any;
}


export class AGATax extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AGATax';

    public AGACalculationID: number;
    public CreatedAt: Date;
    public agaBase: number;
    public beregningsKode: number;
    public agaRate: number;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public AGARateID: number;
    public ID: number;
    public zone: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public SubEntityID: number;
    public zoneName: string;
    public municipalityName: string;
    public _createguid: string;
    public subEntity: SubEntity;
    public CustomFields: any;
}


export class AGAPension extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AGAPension';

    public AGACalculationID: number;
    public CreatedAt: Date;
    public agaBase: number;
    public beregningsKode: number;
    public agaRate: number;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public AGARateID: number;
    public ID: number;
    public zone: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public SubEntityID: number;
    public zoneName: string;
    public municipalityName: string;
    public _createguid: string;
    public subEntity: SubEntity;
    public CustomFields: any;
}


export class AGADraw extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AGADraw';

    public AGACalculationID: number;
    public CreatedAt: Date;
    public agaBase: number;
    public beregningsKode: number;
    public agaRate: number;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public AGARateID: number;
    public ID: number;
    public zone: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public SubEntityID: number;
    public zoneName: string;
    public municipalityName: string;
    public _createguid: string;
    public subEntity: SubEntity;
    public CustomFields: any;
}


export class ForeignerWithPercent extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ForeignerWithPercent';

    public AGACalculationID: number;
    public CreatedAt: Date;
    public agaBase: number;
    public agaRate: number;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
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

    public AGACalculationID: number;
    public CreatedAt: Date;
    public agaBase: number;
    public agaRate: number;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
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

    public AGACalculationID: number;
    public CreatedAt: Date;
    public persons: number;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public aga: number;
    public SubEntityID: number;
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
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public ID: number;
    public WithholdingTax: number;
    public UpdatedBy: string;
    public GarnishmentTax: number;
    public UpdatedAt: Date;
    public FinancialTax: number;
    public _createguid: string;
    public CustomFields: any;
}


export class AmeldingData extends UniEntity {
    public static RelativeUrl = 'amelding';
    public static EntityType = 'AmeldingData';

    public attachmentFileID: number;
    public receiptID: number;
    public CreatedAt: Date;
    public altinnStatus: string;
    public replacesID: number;
    public PayrollRunID: number;
    public mainFileID: number;
    public messageID: string;
    public feedbackFileID: number;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public period: number;
    public ID: number;
    public created: Date;
    public year: number;
    public OppgaveHash: string;
    public UpdatedBy: string;
    public initiated: Date;
    public UpdatedAt: Date;
    public sent: Date;
    public status: number;
    public type: AmeldingType;
    public xmlValidationErrors: string;
    public replaceThis: string;
    public _createguid: string;
    public log: Array<AmeldingLog>;
    public CustomFields: any;
}


export class AmeldingLog extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AmeldingLog';

    public registry: SalaryRegistry;
    public CreatedAt: Date;
    public AmeldingsID: number;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public ID: number;
    public key: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class BasicAmount extends UniEntity {
    public static RelativeUrl = 'basicamounts';
    public static EntityType = 'BasicAmount';

    public CreatedAt: Date;
    public ConversionFactor: number;
    public BasicAmountPrYear: number;
    public AveragePrYear: number;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public BasicAmountPrMonth: number;
    public FromDate: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class CompanySalary extends UniEntity {
    public static RelativeUrl = 'companysalary';
    public static EntityType = 'CompanySalary';

    public Base_Svalbard: boolean;
    public MainAccountAllocatedFinancialVacation: number;
    public CreatedAt: Date;
    public AnnualStatementZipReportID: number;
    public Base_TaxFreeOrganization: boolean;
    public PaycheckZipReportID: number;
    public CalculateFinancialTax: boolean;
    public PaymentInterval: CompanySalaryPaymentInterval;
    public WageDeductionDueToHoliday: WageDeductionDueToHolidayType;
    public WagetypeAdvancePayment: number;
    public MainAccountAllocatedVacation: number;
    public MainAccountCostFinancialVacation: number;
    public MainAccountAllocatedAGAVacation: number;
    public Base_NettoPayment: boolean;
    public HoursPerMonth: number;
    public FreeAmount: number;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public ID: number;
    public MainAccountCostFinancial: number;
    public Base_NettoPaymentForMaritim: boolean;
    public MainAccountCostVacation: number;
    public UpdatedBy: string;
    public PostGarnishmentToTaxAccount: boolean;
    public Base_PayAsYouEarnTaxOnPensions: boolean;
    public InterrimRemitAccount: number;
    public Base_SpesialDeductionForMaritim: boolean;
    public UpdatedAt: Date;
    public MainAccountAllocatedAGA: number;
    public MainAccountCostAGA: number;
    public MainAccountCostAGAVacation: number;
    public Base_JanMayenAndBiCountries: boolean;
    public HourFTEs: number;
    public PostToTaxDraw: boolean;
    public OtpExportActive: boolean;
    public AllowOver6G: boolean;
    public WagetypeAdvancePaymentAuto: number;
    public RateFinancialTax: number;
    public MainAccountAllocatedFinancial: number;
    public _createguid: string;
    public CustomFields: any;
}


export class CompanyVacationRate extends UniEntity {
    public static RelativeUrl = 'companyvacationrates';
    public static EntityType = 'CompanyVacationRate';

    public CreatedAt: Date;
    public Rate60: number;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public Rate: number;
    public FromDate: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class EmployeeCategory extends UniEntity {
    public static RelativeUrl = 'employeecategories';
    public static EntityType = 'EmployeeCategory';

    public CreatedAt: Date;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public ID: number;
    public UpdatedBy: string;
    public Name: string;
    public UpdatedAt: Date;
    public EmployeeCategoryLinkID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class EmployeeCategoryLink extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'EmployeeCategoryLink';

    public EmployeeCategoryID: number;
    public CreatedAt: Date;
    public EmployeeNumber: number;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public EmployeeID: number;
    public _createguid: string;
    public EmployeeCategory: EmployeeCategory;
    public Employee: Employee;
    public CustomFields: any;
}


export class Employee extends UniEntity {
    public static RelativeUrl = 'employees';
    public static EntityType = 'Employee';

    public UserID: number;
    public TypeOfPaymentOtp: TypeOfPaymentOtp;
    public CreatedAt: Date;
    public ForeignWorker: ForeignWorker;
    public PhotoID: number;
    public EmploymentDate: Date;
    public AdvancePaymentAmount: number;
    public MunicipalityNo: string;
    public PaymentInterval: PaymentInterval;
    public OtpExport: boolean;
    public EmployeeNumber: number;
    public BusinessRelationID: number;
    public InternasjonalIDCountry: string;
    public InternasjonalIDType: InternationalIDType;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public ID: number;
    public SocialSecurityNumber: string;
    public UpdatedBy: string;
    public BirthDate: Date;
    public Active: boolean;
    public UpdatedAt: Date;
    public FreeText: string;
    public OtpStatus: OtpStatus;
    public EmployeeLanguageID: number;
    public Sex: GenderEnum;
    public InternationalID: string;
    public IncludeOtpUntilYear: number;
    public SubEntityID: number;
    public EmploymentDateOtp: LocalDate;
    public EndDateOtp: LocalDate;
    public IncludeOtpUntilMonth: number;
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

    public IssueDate: Date;
    public Percent: number;
    public loennTilUtenrikstjenestemannID: number;
    public ufoereYtelserAndreID: number;
    public CreatedAt: Date;
    public SKDXml: string;
    public EmployeeNumber: number;
    public Tilleggsopplysning: string;
    public loennKunTrygdeavgiftTilUtenlandskBorgerID: number;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public loennFraBiarbeidsgiverID: number;
    public ID: number;
    public loennFraHovedarbeidsgiverID: number;
    public NonTaxableAmount: number;
    public Year: number;
    public SecondaryTable: string;
    public UpdatedBy: string;
    public pensjonID: number;
    public TaxcardId: number;
    public UpdatedAt: Date;
    public loennKunTrygdeavgiftTilUtenlandskBorgerSomGrensegjengerID: number;
    public NotMainEmployer: boolean;
    public ResultatStatus: string;
    public Table: string;
    public EmployeeID: number;
    public SecondaryPercent: number;
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
    public Percent: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public CreatedBy: string;
    public ID: number;
    public NonTaxableAmount: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public Table: string;
    public tabellType: TabellType;
    public freeAmountType: FreeAmountType;
    public _createguid: string;
    public CustomFields: any;
}


export class EmployeeLeave extends UniEntity {
    public static RelativeUrl = 'EmployeeLeave';
    public static EntityType = 'EmployeeLeave';

    public EmploymentID: number;
    public LeavePercent: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public Description: string;
    public ID: number;
    public UpdatedBy: string;
    public LeaveType: Leavetype;
    public AffectsOtp: boolean;
    public UpdatedAt: Date;
    public ToDate: Date;
    public FromDate: Date;
    public _createguid: string;
    public Employment: Employment;
    public CustomFields: any;
}


export class Employment extends UniEntity {
    public static RelativeUrl = 'employments';
    public static EntityType = 'Employment';

    public ShipType: ShipTypeOfShip;
    public JobCode: string;
    public LedgerAccount: string;
    public EmploymentType: EmploymentType;
    public CreatedAt: Date;
    public EndDate: Date;
    public SeniorityDate: Date;
    public PayGrade: string;
    public RegulativeStepNr: number;
    public HourRate: number;
    public HoursPerWeek: number;
    public TypeOfEmployment: TypeOfEmployment;
    public EmployeeNumber: number;
    public RegulativeGroupID: number;
    public WorkPercent: number;
    public LastWorkPercentChangeDate: Date;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public WorkingHoursScheme: WorkingHoursScheme;
    public ID: number;
    public EndDateReason: EndDateReason;
    public RemunerationType: RemunerationType;
    public UpdatedBy: string;
    public LastSalaryChangeDate: Date;
    public UpdatedAt: Date;
    public JobName: string;
    public UserDefinedRate: number;
    public ShipReg: ShipRegistry;
    public Standard: boolean;
    public MonthRate: number;
    public DimensionsID: number;
    public StartDate: Date;
    public TradeArea: ShipTradeArea;
    public SubEntityID: number;
    public EmployeeID: number;
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
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public Description: string;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public AffectsAGA: boolean;
    public SubentityID: number;
    public FromDate: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class IncomeReportData extends UniEntity {
    public static RelativeUrl = 'income-reports';
    public static EntityType = 'IncomeReportData';

    public EmploymentID: number;
    public CreatedAt: Date;
    public AltinnReceiptID: number;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public MonthlyRefund: number;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public Xml: string;
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
    public CreatedAt: Date;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class PayrollRun extends UniEntity {
    public static RelativeUrl = 'payrollrun';
    public static EntityType = 'PayrollRun';

    public AGAonRun: number;
    public taxdrawfactor: TaxDrawFactor;
    public CreatedAt: Date;
    public PaycheckFileID: number;
    public JournalEntryNumber: string;
    public PayDate: Date;
    public Deleted: boolean;
    public CreatedBy: string;
    public HolidayPayDeduction: boolean;
    public StatusCode: number;
    public Description: string;
    public ID: number;
    public AGAFreeAmount: number;
    public SettlementDate: Date;
    public UpdatedBy: string;
    public needsRecalc: boolean;
    public ExcludeRecurringPosts: boolean;
    public UpdatedAt: Date;
    public FreeText: string;
    public ToDate: Date;
    public FromDate: Date;
    public _createguid: string;
    public transactions: Array<SalaryTransaction>;
    public agacalculation: Array<AGACalculation>;
    public CustomFields: any;
}


export class PayrollRunCategoryLink extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'PayrollRunCategoryLink';

    public EmployeeCategoryID: number;
    public CreatedAt: Date;
    public PayrollRunID: number;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public _createguid: string;
    public EmployeeCategory: EmployeeCategory;
    public PayrollRun: PayrollRun;
    public CustomFields: any;
}


export class PostingSummaryDraft extends UniEntity {
    public draftBasic: string;
    public draftWithDims: string;
    public draftWithDimsOnBalance: string;
    public ID: number;
    public PayrollID: number;
    public statusTime: Date;
    public JobInfoID: number;
    public status: SummaryJobStatus;
}


export class Regulative extends UniEntity {
    public static RelativeUrl = 'regulatives';
    public static EntityType = 'Regulative';

    public CreatedAt: Date;
    public RegulativeGroupID: number;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public StartDate: LocalDate;
    public _createguid: string;
    public Steps: Array<RegulativeStep>;
    public CustomFields: any;
}


export class RegulativeGroup extends UniEntity {
    public static RelativeUrl = 'regulativegroups';
    public static EntityType = 'RegulativeGroup';

    public CreatedAt: Date;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public ID: number;
    public UpdatedBy: string;
    public Name: string;
    public UpdatedAt: Date;
    public _createguid: string;
    public Regulatives: Array<Regulative>;
    public CustomFields: any;
}


export class RegulativeStep extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'RegulativeStep';

    public CreatedAt: Date;
    public Step: number;
    public Amount: number;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public RegulativeID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class SalaryBalance extends UniEntity {
    public static RelativeUrl = 'salarybalances';
    public static EntityType = 'SalaryBalance';

    public EmploymentID: number;
    public SalaryBalanceTemplateID: number;
    public InstalmentPercent: number;
    public Instalment: number;
    public WageTypeNumber: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public ID: number;
    public SupplierID: number;
    public InstalmentType: SalBalType;
    public MaxAmount: number;
    public Source: SalBalSource;
    public KID: string;
    public UpdatedBy: string;
    public Name: string;
    public UpdatedAt: Date;
    public MinAmount: number;
    public ToDate: Date;
    public CreatePayment: boolean;
    public Type: SalBalDrawType;
    public FromDate: Date;
    public EmployeeID: number;
    public Balance: number;
    public Amount: number;
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

    public SalaryTransactionID: number;
    public Date: LocalDate;
    public CreatedAt: Date;
    public Amount: number;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public Description: string;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public SalaryBalanceID: number;
    public _createguid: string;
    public SalaryTransaction: SalaryTransaction;
    public SalaryBalance: SalaryBalance;
    public CustomFields: any;
}


export class SalaryBalanceTemplate extends UniEntity {
    public static RelativeUrl = 'salarybalancetemplates';
    public static EntityType = 'SalaryBalanceTemplate';

    public InstalmentPercent: number;
    public Instalment: number;
    public WageTypeNumber: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public Account: number;
    public CreatedBy: string;
    public StatusCode: number;
    public ID: number;
    public SupplierID: number;
    public InstalmentType: SalBalType;
    public MaxAmount: number;
    public KID: string;
    public UpdatedBy: string;
    public Name: string;
    public UpdatedAt: Date;
    public MinAmount: number;
    public CreatePayment: boolean;
    public SalarytransactionDescription: string;
    public _createguid: string;
    public Supplier: Supplier;
    public SalaryBalances: Array<SalaryBalance>;
    public CustomFields: any;
}


export class SalaryTransaction extends UniEntity {
    public static RelativeUrl = 'salarytrans';
    public static EntityType = 'SalaryTransaction';

    public EmploymentID: number;
    public TaxbasisID: number;
    public SalaryTransactionCarInfoID: number;
    public WageTypeNumber: number;
    public CreatedAt: Date;
    public PayrollRunID: number;
    public RecurringID: number;
    public SystemType: StdSystemType;
    public MunicipalityNo: string;
    public Sum: number;
    public EmployeeNumber: number;
    public Amount: number;
    public Text: string;
    public recurringPostValidTo: Date;
    public Deleted: boolean;
    public Account: number;
    public CreatedBy: string;
    public HolidayPayDeduction: boolean;
    public StatusCode: number;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public VatTypeID: number;
    public recurringPostValidFrom: Date;
    public IsRecurringPost: boolean;
    public ToDate: Date;
    public Rate: number;
    public DimensionsID: number;
    public SalaryBalanceID: number;
    public calcAGA: number;
    public ChildSalaryTransactionID: number;
    public FromDate: Date;
    public EmployeeID: number;
    public WageTypeID: number;
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

    public CreatedAt: Date;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public ID: number;
    public UpdatedBy: string;
    public RegistrationYear: number;
    public UpdatedAt: Date;
    public IsElectric: boolean;
    public IsLongRange: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class SalaryTransactionSupplement extends UniEntity {
    public static RelativeUrl = 'supplements';
    public static EntityType = 'SalaryTransactionSupplement';

    public SalaryTransactionID: number;
    public CreatedAt: Date;
    public ValueDate2: Date;
    public WageTypeSupplementID: number;
    public ValueDate: Date;
    public ValueBool: boolean;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public ValueString: string;
    public ValueMoney: number;
    public _createguid: string;
    public WageTypeSupplement: WageTypeSupplement;
    public CustomFields: any;
}


export class SalaryYear extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'SalaryYear';

    public CreatedAt: Date;
    public CurrentYear: number;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class SubEntity extends UniEntity {
    public static RelativeUrl = 'subentities';
    public static EntityType = 'SubEntity';

    public CreatedAt: Date;
    public MunicipalityNo: string;
    public BusinessRelationID: number;
    public freeAmount: number;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public SuperiorOrganizationID: number;
    public ID: number;
    public UpdatedBy: string;
    public AgaZone: number;
    public UpdatedAt: Date;
    public AgaRule: number;
    public OrgNumber: string;
    public _createguid: string;
    public BusinessRelationInfo: BusinessRelation;
    public SuperiorOrganization: SubEntity;
    public CustomFields: any;
}


export class TaxBasis extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'TaxBasis';

    public SalaryTransactionID: number;
    public CreatedAt: Date;
    public Basis: number;
    public SailorBasis: number;
    public PensionSourcetaxBasis: number;
    public ForeignBorderCommuterBasis: number;
    public DisabilityOtherBasis: number;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public ID: number;
    public PensionBasis: number;
    public UpdatedBy: string;
    public ForeignCitizenInsuranceBasis: number;
    public UpdatedAt: Date;
    public SvalbardBasis: number;
    public JanMayenBasis: number;
    public _createguid: string;
    public CustomFields: any;
}


export class Travel extends UniEntity {
    public static RelativeUrl = 'travels';
    public static EntityType = 'Travel';

    public CreatedAt: Date;
    public Purpose: string;
    public SourceSystem: string;
    public Email: string;
    public EmployeeNumber: number;
    public PersonID: string;
    public Phone: string;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public Description: string;
    public ID: number;
    public TravelIdentificator: string;
    public SupplierID: number;
    public Comment: string;
    public UpdatedBy: string;
    public Name: string;
    public State: state;
    public UpdatedAt: Date;
    public DimensionsID: number;
    public AdvanceAmount: number;
    public _createguid: string;
    public TravelLines: Array<TravelLine>;
    public Dimensions: Dimensions;
    public CustomFields: any;
}


export class TravelLine extends UniEntity {
    public static RelativeUrl = 'travellines';
    public static EntityType = 'TravelLine';

    public LineState: linestate;
    public TypeID: number;
    public InvoiceAccount: number;
    public From: Date;
    public CreatedAt: Date;
    public TravelID: number;
    public CostType: costtype;
    public To: Date;
    public Amount: number;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public Description: string;
    public ID: number;
    public TravelIdentificator: string;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public VatTypeID: number;
    public AccountNumber: number;
    public Rate: number;
    public DimensionsID: number;
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
    public ForeignTypeID: string;
    public WageTypeNumber: number;
    public CreatedAt: Date;
    public ForeignDescription: string;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public Description: string;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class VacationPayLine extends UniEntity {
    public static RelativeUrl = 'VacationPayLines';
    public static EntityType = 'VacationPayLine';

    public CreatedAt: Date;
    public ManualVacationPayBase: number;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public ID: number;
    public Year: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public EmployeeID: number;
    public PaidTaxFreeVacationPay: number;
    public VacationPay: number;
    public Rate60: number;
    public PaidVacationPay: number;
    public MissingEarlierVacationPay: number;
    public SystemVacationPayBase: number;
    public VacationPay60: number;
    public Age: number;
    public Withdrawal: number;
    public Rate: number;
    public _createguid: string;
    public Employee: Employee;
    public CustomFields: any;
}


export class VacationRateEmployee extends UniEntity {
    public static RelativeUrl = 'employeevacationrates';
    public static EntityType = 'VacationRateEmployee';

    public CreatedAt: Date;
    public EndDate: Date;
    public Rate60: number;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public Rate: number;
    public StartDate: Date;
    public EmployeeID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class WageType extends UniEntity {
    public static RelativeUrl = 'wagetypes';
    public static EntityType = 'WageType';

    public Limit_newRate: number;
    public RateFactor: number;
    public Base_EmploymentTax: boolean;
    public StandardWageTypeFor: StdWageType;
    public NoNumberOfHours: boolean;
    public Limit_value: number;
    public DaysOnBoard: boolean;
    public GetRateFrom: GetRateFrom;
    public Base_div3: boolean;
    public WageTypeNumber: number;
    public CreatedAt: Date;
    public AccountNumber_balance: number;
    public Systemtype: string;
    public IncomeType: string;
    public taxtype: TaxType;
    public SystemRequiredWageType: number;
    public HideFromPaycheck: boolean;
    public Base_Payment: boolean;
    public SpecialAgaRule: SpecialAgaRule;
    public SpecialTaxAndContributionsRule: SpecialTaxAndContributionsRule;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public Description: string;
    public ValidYear: number;
    public ID: number;
    public Base_div2: boolean;
    public Base_Vacation: boolean;
    public Limit_WageTypeNumber: number;
    public UpdatedBy: string;
    public Benefit: string;
    public RatetypeColumn: RateTypeColumn;
    public UpdatedAt: Date;
    public FixedSalaryHolidayDeduction: boolean;
    public SpecialTaxHandling: string;
    public WageTypeName: string;
    public AccountNumber: number;
    public Rate: number;
    public Postnr: string;
    public SupplementPackage: string;
    public Limit_type: LimitType;
    public _createguid: string;
    public SupplementaryInformations: Array<WageTypeSupplement>;
    public CustomFields: any;
}


export class WageTypeSupplement extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'WageTypeSupplement';

    public CreatedAt: Date;
    public GetValueFromTrans: boolean;
    public SuggestedValue: string;
    public ameldingType: string;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public ValueType: Valuetype;
    public Description: string;
    public ID: number;
    public UpdatedBy: string;
    public Name: string;
    public UpdatedAt: Date;
    public WageTypeID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class WageTypeTranslation extends UniEntity {
    public static RelativeUrl = 'wagetypetranslations';
    public static EntityType = 'WageTypeTranslation';

    public WageTypeNumber: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public WageTypeName: string;
    public EmployeeLanguageID: number;
    public _createguid: string;
    public EmployeeLanguage: EmployeeLanguage;
    public CustomFields: any;
}


export class PensionScheme extends UniEntity {
    public static RelativeUrl = 'pensionschemes';
    public static EntityType = 'PensionScheme';

    public Identificator: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public Period: number;
    public ID: number;
    public Year: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class PensionSchemeSupplier extends UniEntity {
    public static RelativeUrl = 'pensionschemesuppliers';
    public static EntityType = 'PensionSchemeSupplier';

    public Identificator: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public ID: number;
    public UpdatedBy: string;
    public Name: string;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class StandardPensionSchemeSupplier extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'StandardPensionSchemeSupplier';

    public Identificator: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public CreatedBy: string;
    public ID: number;
    public UpdatedBy: string;
    public Name: string;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class EmployeeLanguage extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'EmployeeLanguage';

    public LanguageCode: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class ComponentLayout extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ComponentLayout';

    public CreatedAt: Date;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public BaseEntity: string;
    public ID: number;
    public UpdatedBy: string;
    public Name: string;
    public UpdatedAt: Date;
    public _createguid: string;
    public Fields: Array<FieldLayout>;
    public CustomFields: any;
}


export class FieldLayout extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'FieldLayout';

    public Alignment: Alignment;
    public Label: string;
    public HelpText: string;
    public CreatedAt: Date;
    public ReadOnly: boolean;
    public LineBreak: boolean;
    public FieldType: FieldType;
    public DisplayField: string;
    public Width: string;
    public LookupField: boolean;
    public FieldSet: number;
    public Section: number;
    public Placeholder: string;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public Description: string;
    public ID: number;
    public Hidden: boolean;
    public UpdatedBy: string;
    public Placement: number;
    public Combo: number;
    public UpdatedAt: Date;
    public Sectionheader: string;
    public EntityType: string;
    public Options: string;
    public Property: string;
    public Legend: string;
    public ComponentLayoutID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class CurrencyOverride extends UniEntity {
    public static RelativeUrl = 'currencyoverrides';
    public static EntityType = 'CurrencyOverride';

    public Factor: number;
    public FromCurrencyCodeID: number;
    public CreatedAt: Date;
    public ExchangeRate: number;
    public ToCurrencyCodeID: number;
    public Deleted: boolean;
    public CreatedBy: string;
    public ID: number;
    public Source: CurrencySourceEnum;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public ToDate: LocalDate;
    public FromDate: LocalDate;
    public _createguid: string;
    public FromCurrencyCode: CurrencyCode;
    public ToCurrencyCode: CurrencyCode;
    public CustomFields: any;
}


export class AccountAssetGroup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AccountAssetGroup';

    public FromAccountNumber: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public CreatedBy: string;
    public ID: number;
    public UpdatedBy: string;
    public ToAccountNumber: number;
    public UpdatedAt: Date;
    public AssetGroupCode: string;
    public _createguid: string;
    public CustomFields: any;
}


export class AccountGroupSetup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AccountGroupSetup';

    public CreatedAt: Date;
    public ExternalReference: string;
    public PlanType: PlanTypeEnum;
    public Deleted: boolean;
    public CreatedBy: string;
    public ID: number;
    public ParentID: number;
    public UpdatedBy: string;
    public Name: string;
    public UpdatedAt: Date;
    public _createguid: string;
    public Parent: AccountGroupSetup;
    public CustomFields: any;
}


export class AccountSetup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AccountSetup';

    public ExpectedDebitBalance: boolean;
    public AccountName: string;
    public CreatedAt: Date;
    public Visible: boolean;
    public PlanType: PlanTypeEnum;
    public Deleted: boolean;
    public CreatedBy: string;
    public ID: number;
    public SaftMappingAccountID: number;
    public AccountGroupSetupID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public VatCode: string;
    public AccountNumber: number;
    public _createguid: string;
    public AccountGroup: AccountGroupSetup;
    public SaftMappingAccount: SaftMappingAccount;
    public CustomFields: any;
}


export class AccountVisibilityGroup extends UniEntity {
    public static RelativeUrl = 'accountvisibilitygroups';
    public static EntityType = 'AccountVisibilityGroup';

    public CreatedAt: Date;
    public Deleted: boolean;
    public CreatedBy: string;
    public ID: number;
    public UpdatedBy: string;
    public Name: string;
    public UpdatedAt: Date;
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
    public Deleted: boolean;
    public CreatedBy: string;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public AccountSetupID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class AGARate extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AGARate';

    public CreatedAt: Date;
    public ZoneID: number;
    public Deleted: boolean;
    public CreatedBy: string;
    public ID: number;
    public RateValidFrom: Date;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public Rate: number;
    public _createguid: string;
    public sector: Array<AGASector>;
    public CustomFields: any;
}


export class AGASector extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AGASector';

    public CreatedAt: Date;
    public SectorID: number;
    public freeAmount: number;
    public Deleted: boolean;
    public CreatedBy: string;
    public ID: number;
    public RateID: number;
    public Sector: string;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public Rate: number;
    public ValidFrom: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class AGAZone extends UniEntity {
    public static RelativeUrl = 'AGAZones';
    public static EntityType = 'AGAZone';

    public ZoneName: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public CreatedBy: string;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public _createguid: string;
    public rates: Array<AGARate>;
    public municipalsOnZone: Array<MunicipalAGAZone>;
    public CustomFields: any;
}


export class Agreement extends UniEntity {
    public static RelativeUrl = 'agreements';
    public static EntityType = 'Agreement';

    public CreatedAt: Date;
    public Template: string;
    public Deleted: boolean;
    public CreatedBy: string;
    public ID: number;
    public AppliesTo: number;
    public UpdatedBy: string;
    public Name: string;
    public UpdatedAt: Date;
    public ValidFrom: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class AssetGroup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AssetGroup';

    public CreatedAt: Date;
    public DepreciationYears: number;
    public DepreciationRate: number;
    public Deleted: boolean;
    public CreatedBy: string;
    public ID: number;
    public DepreciationAccountNumber: number;
    public UpdatedBy: string;
    public Name: string;
    public UpdatedAt: Date;
    public ToDate: Date;
    public Code: string;
    public _createguid: string;
    public CustomFields: any;
}


export class BankIdentifierCode extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'BankIdentifierCode';

    public BankName: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public CreatedBy: string;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public Bic: string;
    public BankIdentifier: string;
    public _createguid: string;
    public CustomFields: any;
}


export class CompanyType extends UniEntity {
    public static RelativeUrl = 'companytypes';
    public static EntityType = 'CompanyType';

    public DefaultAccountVisibilityGroupID: number;
    public Priority: boolean;
    public CreatedAt: Date;
    public FullName: string;
    public Deleted: boolean;
    public CreatedBy: string;
    public Description: string;
    public ID: number;
    public UpdatedBy: string;
    public Name: string;
    public UpdatedAt: Date;
    public DefaultPlanType: PlanTypeEnum;
    public _createguid: string;
    public CustomFields: any;
}


export class Confirmation extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Confirmation';

    public PostalCode: string;
    public CreatedAt: Date;
    public DisplayName: string;
    public Email: string;
    public ContractType: string;
    public Phone: string;
    public ExpirationDate: Date;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public SignUpReferrer: string;
    public CompanyName: string;
    public Code: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Country extends UniEntity {
    public static RelativeUrl = 'countries';
    public static EntityType = 'Country';

    public CountryCode: string;
    public CurrencyRateSource: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public CreatedBy: string;
    public ID: number;
    public UpdatedBy: string;
    public Name: string;
    public UpdatedAt: Date;
    public DefaultCurrencyCode: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Currency extends UniEntity {
    public static RelativeUrl = 'currencies';
    public static EntityType = 'Currency';

    public Factor: number;
    public FromCurrencyCodeID: number;
    public CreatedAt: Date;
    public ExchangeRate: number;
    public ToCurrencyCodeID: number;
    public Deleted: boolean;
    public CreatedBy: string;
    public ID: number;
    public Source: CurrencySourceEnum;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public CurrencyDate: LocalDate;
    public _createguid: string;
    public FromCurrencyCode: CurrencyCode;
    public ToCurrencyCode: CurrencyCode;
    public CustomFields: any;
}


export class CurrencyCode extends UniEntity {
    public static RelativeUrl = 'currencycodes';
    public static EntityType = 'CurrencyCode';

    public CreatedAt: Date;
    public Deleted: boolean;
    public CreatedBy: string;
    public Description: string;
    public ID: number;
    public ShortCode: string;
    public UpdatedBy: string;
    public Name: string;
    public UpdatedAt: Date;
    public Code: string;
    public _createguid: string;
    public CustomFields: any;
}


export class DebtCollectionAutomation extends UniEntity {
    public static RelativeUrl = 'debtcollectionautomation';
    public static EntityType = 'DebtCollectionAutomation';

    public CreatedAt: Date;
    public Deleted: boolean;
    public CreatedBy: string;
    public Description: string;
    public ID: number;
    public UpdatedBy: string;
    public Name: string;
    public UpdatedAt: Date;
    public DebtCollectionSettingsID: number;
    public _createguid: string;
    public DebtCollectionSettings: DebtCollectionSettings;
    public CustomFields: any;
}


export class EmploymentValidValues extends UniEntity {
    public static RelativeUrl = 'employmentvalidvalues';
    public static EntityType = 'EmploymentValidValues';

    public ShipType: boolean;
    public JobCode: boolean;
    public CreatedAt: Date;
    public EndDate: boolean;
    public SeniorityDate: boolean;
    public HourRate: boolean;
    public HoursPerWeek: boolean;
    public typeOfEmployment: boolean;
    public LastWorkPercentChange: boolean;
    public WorkPercent: boolean;
    public Deleted: boolean;
    public CreatedBy: string;
    public WorkingHoursScheme: boolean;
    public ID: number;
    public RemunerationType: boolean;
    public UpdatedBy: string;
    public PaymentType: RemunerationType;
    public LastSalaryChangeDate: boolean;
    public employment: TypeOfEmployment;
    public UpdatedAt: Date;
    public JobName: boolean;
    public UserDefinedRate: boolean;
    public ShipReg: boolean;
    public MonthRate: boolean;
    public StartDate: boolean;
    public TradeArea: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class FinancialDeadline extends UniEntity {
    public static RelativeUrl = 'deadlines';
    public static EntityType = 'FinancialDeadline';

    public Deadline: LocalDate;
    public CreatedAt: Date;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public ID: number;
    public UpdatedBy: string;
    public Name: string;
    public UpdatedAt: Date;
    public AdditionalInfo: string;
    public PassableDueDate: number;
    public Type: FinancialDeadlineType;
    public _createguid: string;
    public CustomFields: any;
}


export class JobTicket extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'JobTicket';

    public CreatedAt: Date;
    public JobStatus: string;
    public GlobalIdentity: string;
    public Deleted: boolean;
    public CreatedBy: string;
    public ID: number;
    public JobId: string;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public JobName: string;
    public _createguid: string;
    public CustomFields: any;
}


export class LanguageCode extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'LanguageCode';

    public CreatedAt: Date;
    public Deleted: boolean;
    public CreatedBy: string;
    public ID: number;
    public UpdatedBy: string;
    public Name: string;
    public UpdatedAt: Date;
    public Code: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Municipal extends UniEntity {
    public static RelativeUrl = 'Municipals';
    public static EntityType = 'Municipal';

    public CreatedAt: Date;
    public CountyNo: string;
    public MunicipalityNo: string;
    public Deleted: boolean;
    public CreatedBy: string;
    public ID: number;
    public CountyName: string;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public MunicipalityName: string;
    public Retired: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class MunicipalAGAZone extends UniEntity {
    public static RelativeUrl = 'MunicipalAGAZones';
    public static EntityType = 'MunicipalAGAZone';

    public CreatedAt: Date;
    public MunicipalityNo: string;
    public ZoneID: number;
    public Deleted: boolean;
    public CreatedBy: string;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public Startdate: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class PaymentBatchType extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'PaymentBatchType';

    public CreatedAt: Date;
    public Deleted: boolean;
    public CreatedBy: string;
    public Description: string;
    public ID: number;
    public UpdatedBy: string;
    public Name: string;
    public UpdatedAt: Date;
    public Code: number;
    public _createguid: string;
    public CustomFields: any;
}


export class PaymentCode extends UniEntity {
    public static RelativeUrl = 'paymentCodes';
    public static EntityType = 'PaymentCode';

    public PaymentGroup: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public CreatedBy: string;
    public Description: string;
    public ID: number;
    public UpdatedBy: string;
    public Name: string;
    public UpdatedAt: Date;
    public Code: number;
    public _createguid: string;
    public CustomFields: any;
}


export class PostalCode extends UniEntity {
    public static RelativeUrl = 'postalcodes';
    public static EntityType = 'PostalCode';

    public CreatedAt: Date;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public ID: number;
    public City: string;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public Code: string;
    public _createguid: string;
    public CustomFields: any;
}


export class SaftMappingAccount extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'SaftMappingAccount';

    public CreatedAt: Date;
    public Deleted: boolean;
    public CreatedBy: string;
    public Description: string;
    public ID: number;
    public AccountID: string;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class StaticRegister extends UniEntity {
    public static RelativeUrl = 'StaticRegister';
    public static EntityType = 'StaticRegister';

    public stamp: Date;
    public Registry: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public CreatedBy: string;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class STYRKCode extends UniEntity {
    public static RelativeUrl = 'STYRK';
    public static EntityType = 'STYRKCode';

    public lnr: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public CreatedBy: string;
    public ID: number;
    public UpdatedBy: string;
    public ynr: number;
    public UpdatedAt: Date;
    public styrk: string;
    public tittel: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Language extends UniEntity {
    public static RelativeUrl = 'languages';
    public static EntityType = 'Language';

    public CreatedAt: Date;
    public Deleted: boolean;
    public CreatedBy: string;
    public ID: number;
    public UpdatedBy: string;
    public Name: string;
    public UpdatedAt: Date;
    public FallBackLanguageID: number;
    public Code: string;
    public _createguid: string;
    public Translations: Array<Translation>;
    public CustomFields: any;
}


export class Translatable extends UniEntity {
    public static RelativeUrl = 'translatables';
    public static EntityType = 'Translatable';

    public CreatedAt: Date;
    public Meaning: string;
    public Model: string;
    public Deleted: boolean;
    public Module: i18nModule;
    public CreatedBy: string;
    public Description: string;
    public ID: number;
    public Column: string;
    public Static: boolean;
    public UpdatedBy: string;
    public Value: string;
    public UpdatedAt: Date;
    public _createguid: string;
    public Translations: Array<Translation>;
    public CustomFields: any;
}


export class Translation extends UniEntity {
    public static RelativeUrl = 'translations';
    public static EntityType = 'Translation';

    public CreatedAt: Date;
    public Deleted: boolean;
    public CreatedBy: string;
    public LanguageID: number;
    public ID: number;
    public TranslatableID: number;
    public UpdatedBy: string;
    public Value: string;
    public UpdatedAt: Date;
    public _createguid: string;
    public Language: Language;
    public Translatable: Translatable;
    public CustomFields: any;
}


export class VatCodeGroupSetup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'VatCodeGroupSetup';

    public CreatedAt: Date;
    public Deleted: boolean;
    public CreatedBy: string;
    public ID: number;
    public UpdatedBy: string;
    public Name: string;
    public UpdatedAt: Date;
    public No: string;
    public _createguid: string;
    public CustomFields: any;
}


export class VatPostSetup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'VatPostSetup';

    public VatCodeGroupSetupNo: string;
    public ReportAsNegativeAmount: boolean;
    public CreatedAt: Date;
    public HasTaxAmount: boolean;
    public Deleted: boolean;
    public CreatedBy: string;
    public ID: number;
    public UpdatedBy: string;
    public Name: string;
    public UpdatedAt: Date;
    public No: string;
    public HasTaxBasis: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class VatReportForm extends UniEntity {
    public static RelativeUrl = 'vatreportforms';
    public static EntityType = 'VatReportForm';

    public CreatedAt: Date;
    public Deleted: boolean;
    public CreatedBy: string;
    public Description: string;
    public ID: number;
    public UpdatedBy: string;
    public Name: string;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class VatReportReferenceSetup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'VatReportReferenceSetup';

    public CreatedAt: Date;
    public Deleted: boolean;
    public CreatedBy: string;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public VatCode: string;
    public VatPostNo: string;
    public AccountNumber: number;
    public _createguid: string;
    public CustomFields: any;
}


export class VatTypeSetup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'VatTypeSetup';

    public OutputVat: boolean;
    public CreatedAt: Date;
    public IncomingAccountNumber: number;
    public VatCodeGroupNo: string;
    public IsCompensated: boolean;
    public DefaultVisible: boolean;
    public IsNotVatRegistered: boolean;
    public Deleted: boolean;
    public CreatedBy: string;
    public OutgoingAccountNumber: number;
    public ID: number;
    public UpdatedBy: string;
    public Name: string;
    public UpdatedAt: Date;
    public ReversedTaxDutyVat: boolean;
    public VatCode: string;
    public DirectJournalEntryOnly: boolean;
    public _createguid: string;
    public VatTypeSetupPercentages: Array<VatTypeSetupPercentage>;
    public CustomFields: any;
}


export class VatTypeSetupPercentage extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'VatTypeSetupPercentage';

    public VatTypeSetupID: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public CreatedBy: string;
    public ID: number;
    public VatPercent: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public ValidTo: LocalDate;
    public ValidFrom: LocalDate;
    public _createguid: string;
    public CustomFields: any;
}


export class CompanyReport extends UniEntity {
    public static RelativeUrl = 'company-report';
    public static EntityType = 'CompanyReport';

    public ReportDefinitionID: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public CreatedBy: string;
    public ID: number;
    public ContractId: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public CompanyKey: string;
    public _createguid: string;
    public CustomFields: any;
}


export class ReportDefinition extends UniEntity {
    public static RelativeUrl = 'report-definitions';
    public static EntityType = 'ReportDefinition';

    public CreatedAt: Date;
    public Visible: boolean;
    public CategoryLabel: string;
    public IsStandard: boolean;
    public Deleted: boolean;
    public CreatedBy: string;
    public Description: string;
    public ID: number;
    public ReportSource: string;
    public Md5: string;
    public UpdatedBy: string;
    public Name: string;
    public ReportType: number;
    public UpdatedAt: Date;
    public UniqueReportID: string;
    public Version: string;
    public Category: string;
    public TemplateLinkId: string;
    public _createguid: string;
    public CustomFields: any;
}


export class ReportDefinitionDataSource extends UniEntity {
    public static RelativeUrl = 'report-definition-data-sources';
    public static EntityType = 'ReportDefinitionDataSource';

    public ReportDefinitionId: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public CreatedBy: string;
    public ID: number;
    public UpdatedBy: string;
    public Name: string;
    public UpdatedAt: Date;
    public DataSourceUrl: string;
    public _createguid: string;
    public CustomFields: any;
}


export class ReportDefinitionParameter extends UniEntity {
    public static RelativeUrl = 'report-definition-parameters';
    public static EntityType = 'ReportDefinitionParameter';

    public Label: string;
    public ReportDefinitionId: number;
    public CreatedAt: Date;
    public DefaultValueSource: string;
    public Visible: boolean;
    public DefaultValueLookupType: string;
    public DefaultValueList: string;
    public Deleted: boolean;
    public CreatedBy: string;
    public ID: number;
    public UpdatedBy: string;
    public DefaultValue: string;
    public Name: string;
    public UpdatedAt: Date;
    public SortIndex: number;
    public Type: string;
    public _createguid: string;
    public CustomFields: any;
}


export class PeriodSeries extends UniEntity {
    public static RelativeUrl = 'period-series';
    public static EntityType = 'PeriodSeries';

    public CreatedAt: Date;
    public Deleted: boolean;
    public CreatedBy: string;
    public ID: number;
    public UpdatedBy: string;
    public Name: string;
    public SeriesType: PeriodSeriesType;
    public Active: boolean;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class PeriodTemplate extends UniEntity {
    public static RelativeUrl = 'period-templates';
    public static EntityType = 'PeriodTemplate';

    public CreatedAt: Date;
    public Deleted: boolean;
    public CreatedBy: string;
    public ID: number;
    public UpdatedBy: string;
    public Name: string;
    public PeriodSeriesID: number;
    public UpdatedAt: Date;
    public ToDate: LocalDate;
    public No: number;
    public FromDate: LocalDate;
    public _createguid: string;
    public PeriodSeries: PeriodSeries;
    public CustomFields: any;
}


export class Model extends UniEntity {
    public static RelativeUrl = 'models';
    public static EntityType = 'Model';

    public Label: string;
    public Admin: boolean;
    public CreatedAt: Date;
    public Deleted: boolean;
    public CreatedBy: string;
    public Description: string;
    public ID: number;
    public UpdatedBy: string;
    public Name: string;
    public UpdatedAt: Date;
    public Shared: boolean;
    public LabelPlural: string;
    public _createguid: string;
    public Fields: Array<Field>;
    public CustomFields: any;
}


export class Field extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Field';

    public Label: string;
    public HelpText: string;
    public CreatedAt: Date;
    public ModelID: number;
    public Deleted: boolean;
    public CreatedBy: string;
    public Description: string;
    public ID: number;
    public UpdatedBy: string;
    public Name: string;
    public UpdatedAt: Date;
    public _createguid: string;
    public Model: Model;
    public CustomFields: any;
}


export class Notification extends UniEntity {
    public static RelativeUrl = 'notifications';
    public static EntityType = 'Notification';

    public CreatedAt: Date;
    public SourceEntityType: string;
    public SenderDisplayName: string;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public Message: string;
    public ID: number;
    public UpdatedBy: string;
    public RecipientID: string;
    public UpdatedAt: Date;
    public EntityType: string;
    public SourceEntityID: number;
    public EntityID: number;
    public CompanyName: string;
    public CompanyKey: string;
    public _createguid: string;
    public CustomFields: any;
}


export class CompanySettings extends UniEntity {
    public static RelativeUrl = 'companysettings';
    public static EntityType = 'CompanySettings';

    public EnableArchiveSupplierInvoice: boolean;
    public OfficeMunicipalityNo: string;
    public ShowNumberOfDecimals: number;
    public EnableSendPaymentBeforeJournaled: boolean;
    public HideInActiveSuppliers: boolean;
    public CustomerAccountID: number;
    public APIncludeAttachment: boolean;
    public LogoHideField: number;
    public InterrimPaymentAccountID: number;
    public CreatedAt: Date;
    public BankChargeAccountID: number;
    public StoreDistributedInvoice: boolean;
    public AccountVisibilityGroupID: number;
    public UseNetsIntegration: boolean;
    public PeriodSeriesVatID: number;
    public LogoAlign: number;
    public SettlementVatAccountID: number;
    public FactoringEmailID: number;
    public APContactID: number;
    public TaxMandatoryType: number;
    public OrganizationNumber: string;
    public TaxableFromDate: LocalDate;
    public DefaultEmailID: number;
    public DefaultCustomerOrderReportID: number;
    public CompanyRegistered: boolean;
    public CustomerCreditDays: number;
    public EnableCheckboxesForSupplierInvoiceList: boolean;
    public AcceptableDelta4CustomerPayment: number;
    public DefaultSalesAccountID: number;
    public ShowKIDOnCustomerInvoice: boolean;
    public TaxBankAccountID: number;
    public HideInActiveCustomers: boolean;
    public SAFTimportAccountID: number;
    public AcceptableDelta4CustomerPaymentAccountID: number;
    public RoundingType: RoundingType;
    public RoundingNumberOfDecimals: number;
    public CustomerInvoiceReminderSettingsID: number;
    public BookCustomerInvoiceOnDeliveryDate: boolean;
    public GLN: string;
    public CompanyTypeID: number;
    public APGuid: string;
    public HasAutobank: boolean;
    public Deleted: boolean;
    public DefaultPhoneID: number;
    public CreatedBy: string;
    public StatusCode: number;
    public Factoring: number;
    public UseOcrInterpretation: boolean;
    public ID: number;
    public DefaultAccrualAccountID: number;
    public InterrimRemitAccountID: number;
    public AccountingLockedDate: LocalDate;
    public DefaultDistributionsID: number;
    public UseAssetRegister: boolean;
    public AutoDistributeInvoice: boolean;
    public TwoStageAutobankEnabled: boolean;
    public DefaultTOFCurrencySettingsID: number;
    public UpdatedBy: string;
    public AgioLossAccountID: number;
    public IgnorePaymentsWithoutEndToEndID: boolean;
    public PeriodSeriesAccountID: number;
    public VatReportFormID: number;
    public UpdatedAt: Date;
    public TaxMandatory: boolean;
    public OnlyJournalMatchedPayments: boolean;
    public DefaultCustomerInvoiceReminderReportID: number;
    public BatchInvoiceMinAmount: number;
    public SupplierAccountID: number;
    public VatLockedDate: LocalDate;
    public AutoJournalPayment: string;
    public AccountGroupSetID: number;
    public ForceSupplierInvoiceApproval: boolean;
    public LogoFileID: number;
    public UseFinancialDateToCalculateVatPercent: boolean;
    public EnableAdvancedJournalEntry: boolean;
    public BaseCurrencyCodeID: number;
    public PaymentBankIdentification: string;
    public PaymentBankAgreementNumber: string;
    public WebAddress: string;
    public UsePaymentBankValues: boolean;
    public DefaultAddressID: number;
    public AgioGainAccountID: number;
    public APActivated: boolean;
    public SalaryBankAccountID: number;
    public NetsIntegrationActivated: boolean;
    public CompanyBankAccountID: number;
    public XtraPaymentOrgXmlTagValue: string;
    public UseXtraPaymentOrgXmlTag: boolean;
    public DefaultCustomerQuoteReportID: number;
    public CompanyName: string;
    public TaxableFromLimit: number;
    public Localization: string;
    public EnableApprovalFlow: boolean;
    public DefaultCustomerInvoiceReportID: number;
    public AllowAvtalegiroRegularInvoice: boolean;
    public FactoringNumber: number;
    public SaveCustomersFromQuoteAsLead: boolean;
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

    public CreatedAt: Date;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public ID: number;
    public UpdatedBy: string;
    public Name: string;
    public UpdatedAt: Date;
    public EntityType: string;
    public _createguid: string;
    public Elements: Array<DistributionPlanElement>;
    public CustomFields: any;
}


export class DistributionPlanElement extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'DistributionPlanElement';

    public Priority: number;
    public CreatedAt: Date;
    public DistributionPlanElementTypeID: number;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public DistributionPlanID: number;
    public _createguid: string;
    public ElementType: DistributionPlanElementType;
    public CustomFields: any;
}


export class DistributionPlanElementType extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'DistributionPlanElementType';

    public CreatedAt: Date;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public ID: number;
    public UpdatedBy: string;
    public Name: string;
    public UpdatedAt: Date;
    public _createguid: string;
    public LegalEntities: Array<DistributionPlanElementTypeLegalEntity>;
    public CustomFields: any;
}


export class DistributionPlanElementTypeLegalEntity extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'DistributionPlanElementTypeLegalEntity';

    public CreatedAt: Date;
    public DistributionPlanElementTypeID: number;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public EntityType: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Distributions extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Distributions';

    public AnnualStatementDistributionPlanID: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public CustomerInvoiceReminderDistributionPlanID: number;
    public ID: number;
    public CustomerOrderDistributionPlanID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public CustomerInvoiceDistributionPlanID: number;
    public PayCheckDistributionPlanID: number;
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
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public ID: number;
    public UpdatedBy: string;
    public Name: string;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class EmailLog extends UniEntity {
    public static RelativeUrl = 'emails';
    public static EntityType = 'EmailLog';

    public DistributeAt: LocalDate;
    public From: string;
    public CreatedAt: Date;
    public Subject: string;
    public To: string;
    public ExternalMessage: string;
    public ExternalReference: string;
    public JobRunExternalRef: string;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public ID: number;
    public EntityDisplayValue: string;
    public JobRunID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public EntityType: string;
    public EntityID: number;
    public Type: SharingType;
    public _createguid: string;
    public CustomFields: any;
}


export class Eventplan extends UniEntity {
    public static RelativeUrl = 'eventplans';
    public static EntityType = 'Eventplan';

    public Cargo: string;
    public IsSystemPlan: boolean;
    public ModelFilter: string;
    public CreatedAt: Date;
    public SigningKey: string;
    public PlanType: EventplanType;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public ID: number;
    public JobNames: string;
    public UpdatedBy: string;
    public Name: string;
    public Active: boolean;
    public UpdatedAt: Date;
    public OperationFilter: string;
    public _createguid: string;
    public ExpressionFilters: Array<ExpressionFilter>;
    public Subscribers: Array<EventSubscriber>;
    public CustomFields: any;
}


export class EventSubscriber extends UniEntity {
    public static RelativeUrl = 'eventsubscribers';
    public static EntityType = 'EventSubscriber';

    public CreatedAt: Date;
    public Endpoint: string;
    public Headers: string;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public ID: number;
    public EventplanID: number;
    public UpdatedBy: string;
    public Name: string;
    public Active: boolean;
    public UpdatedAt: Date;
    public Authorization: string;
    public _createguid: string;
    public Eventplan: Eventplan;
    public CustomFields: any;
}


export class ExpressionFilter extends UniEntity {
    public static RelativeUrl = 'expressionfilters';
    public static EntityType = 'ExpressionFilter';

    public CreatedAt: Date;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public ID: number;
    public EventplanID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public Expression: string;
    public EntityName: string;
    public _createguid: string;
    public Eventplan: Eventplan;
    public CustomFields: any;
}


export class Period extends UniEntity {
    public static RelativeUrl = 'periodes';
    public static EntityType = 'Period';

    public CreatedAt: Date;
    public PeriodTemplateID: number;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public ID: number;
    public UpdatedBy: string;
    public Name: string;
    public PeriodSeriesID: number;
    public UpdatedAt: Date;
    public AccountYear: number;
    public ToDate: LocalDate;
    public No: number;
    public FromDate: LocalDate;
    public _createguid: string;
    public PeriodTemplate: PeriodTemplate;
    public PeriodSeries: PeriodSeries;
    public CustomFields: any;
}


export class PredefinedDescription extends UniEntity {
    public static RelativeUrl = 'predefineddescriptions';
    public static EntityType = 'PredefinedDescription';

    public CreatedAt: Date;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public Description: string;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public Type: PredefinedDescriptionType;
    public Code: string;
    public _createguid: string;
    public CustomFields: any;
}


export class ProductCategory extends UniEntity {
    public static RelativeUrl = 'productcategories';
    public static EntityType = 'ProductCategory';

    public CreatedAt: Date;
    public Lft: number;
    public Depth: number;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public Description: string;
    public ID: number;
    public Rght: number;
    public Comment: string;
    public ParentID: number;
    public UpdatedBy: string;
    public Name: string;
    public UpdatedAt: Date;
    public Status: number;
    public _createguid: string;
    public CustomFields: any;
}


export class ProductCategoryLink extends UniEntity {
    public static RelativeUrl = 'productcategorylinks';
    public static EntityType = 'ProductCategoryLink';

    public CreatedAt: Date;
    public ProductID: number;
    public ProductCategoryID: number;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public _createguid: string;
    public ProductCategory: ProductCategory;
    public CustomFields: any;
}


export class Sharing extends UniEntity {
    public static RelativeUrl = 'sharings';
    public static EntityType = 'Sharing';

    public DistributeAt: LocalDate;
    public From: string;
    public CreatedAt: Date;
    public Subject: string;
    public To: string;
    public ExternalMessage: string;
    public ExternalReference: string;
    public JobRunExternalRef: string;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public ID: number;
    public EntityDisplayValue: string;
    public JobRunID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public EntityType: string;
    public EntityID: number;
    public Type: SharingType;
    public _createguid: string;
    public CustomFields: any;
}


export class StatusLog extends UniEntity {
    public static RelativeUrl = 'statuslogs';
    public static EntityType = 'StatusLog';

    public FromStatus: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public CreatedBy: string;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public EntityType: string;
    public ToStatus: number;
    public EntityID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class Tracelink extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Tracelink';

    public Date: Date;
    public CreatedAt: Date;
    public DestinationInstanceID: number;
    public SourceEntityName: string;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public DestinationEntityName: string;
    public SourceInstanceID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class User extends UniEntity {
    public static RelativeUrl = 'users';
    public static EntityType = 'User';

    public LastLogin: Date;
    public CreatedAt: Date;
    public DisplayName: string;
    public Email: string;
    public GlobalIdentity: string;
    public Protected: boolean;
    public IsAutobankAdmin: boolean;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public ID: number;
    public UserName: string;
    public UpdatedBy: string;
    public PhoneNumber: string;
    public UpdatedAt: Date;
    public HasAgreedToImportDisclaimer: boolean;
    public BankIntegrationUserName: string;
    public EndDate: Date;
    public TwoFactorEnabled: boolean;
    public AuthPhoneNumber: string;
    public _createguid: string;
    public CustomFields: any;
}


export class UniQueryDefinition extends UniEntity {
    public static RelativeUrl = 'uniquerydefinitions';
    public static EntityType = 'UniQueryDefinition';

    public SystemGeneratedQuery: boolean;
    public UserID: number;
    public IsShared: boolean;
    public CreatedAt: Date;
    public ClickParam: string;
    public ModuleID: number;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public Description: string;
    public ID: number;
    public ClickUrl: string;
    public UpdatedBy: string;
    public Name: string;
    public MainModelName: string;
    public UpdatedAt: Date;
    public SortIndex: number;
    public Code: string;
    public Category: string;
    public _createguid: string;
    public UniQueryFilters: Array<UniQueryFilter>;
    public UniQueryFields: Array<UniQueryField>;
    public CustomFields: any;
}


export class UniQueryField extends UniEntity {
    public static RelativeUrl = 'uniqueryfields';
    public static EntityType = 'UniQueryField';

    public Alias: string;
    public Field: string;
    public SumFunction: string;
    public CreatedAt: Date;
    public Index: number;
    public FieldType: number;
    public Width: string;
    public Path: string;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public ID: number;
    public UniQueryDefinitionID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public Header: string;
    public _createguid: string;
    public CustomFields: any;
}


export class UniQueryFilter extends UniEntity {
    public static RelativeUrl = 'uniqueryfilters';
    public static EntityType = 'UniQueryFilter';

    public Field: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public ID: number;
    public UniQueryDefinitionID: number;
    public UpdatedBy: string;
    public Value: string;
    public UpdatedAt: Date;
    public Group: number;
    public Operator: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Team extends UniEntity {
    public static RelativeUrl = 'teams';
    public static EntityType = 'Team';

    public CreatedAt: Date;
    public Lft: number;
    public Depth: number;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public ID: number;
    public Rght: number;
    public ParentID: number;
    public UpdatedBy: string;
    public Name: string;
    public UpdatedAt: Date;
    public DimensionsID: number;
    public _createguid: string;
    public Dimensions: Dimensions;
    public Positions: Array<TeamPosition>;
    public CustomFields: any;
}


export class TeamPosition extends UniEntity {
    public static RelativeUrl = 'teampositions';
    public static EntityType = 'TeamPosition';

    public UserID: number;
    public CreatedAt: Date;
    public Position: TeamPositionEnum;
    public ApproveOrder: number;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public ID: number;
    public TeamID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public RelatedSharedRoleId: number;
    public ToDate: LocalDate;
    public FromDate: LocalDate;
    public _createguid: string;
    public Team: Team;
    public CustomFields: any;
}


export class ApprovalRule extends UniEntity {
    public static RelativeUrl = 'approvalrules';
    public static EntityType = 'ApprovalRule';

    public CreatedAt: Date;
    public RuleType: ApprovalRuleType;
    public IndustryCodes: string;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public Description: string;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public Keywords: string;
    public _createguid: string;
    public Steps: Array<ApprovalRuleStep>;
    public CustomFields: any;
}


export class ApprovalRuleStep extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ApprovalRuleStep';

    public UserID: number;
    public ApprovalRuleID: number;
    public CreatedAt: Date;
    public StepNumber: number;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
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
    public CreatedAt: Date;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public SubstituteUserID: number;
    public ToDate: LocalDate;
    public FromDate: LocalDate;
    public _createguid: string;
    public User: User;
    public SubstituteUser: User;
    public CustomFields: any;
}


export class TaskApprovalPlan extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'TaskApprovalPlan';

    public UserID: number;
    public ApprovalRuleID: number;
    public CreatedAt: Date;
    public Amount: number;
    public StepNumber: number;
    public ApprovalID: number;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public ID: number;
    public Comment: string;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public TaskID: number;
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

    public CreatedAt: Date;
    public StatusCategoryID: number;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public Description: string;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public EntityType: string;
    public System: boolean;
    public Order: number;
    public IsDepricated: boolean;
    public _createguid: string;
    public StatusCategory: StatusCategory;
    public CustomFields: any;
}


export class StatusCategory extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'StatusCategory';

    public CreatedAt: Date;
    public StatusCategoryCode: StatusCategoryCode;
    public Deleted: boolean;
    public CreatedBy: string;
    public ID: number;
    public UpdatedBy: string;
    public Name: string;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class StatusRemark extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'StatusRemark';

    public CreatedAt: Date;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public EntityType: string;
    public Remark: string;
    public EntityID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class Transition extends UniEntity {
    public static RelativeUrl = 'transitions';
    public static EntityType = 'Transition';

    public CreatedAt: Date;
    public Deleted: boolean;
    public CreatedBy: string;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public Controller: string;
    public EntityType: string;
    public MethodName: string;
    public _createguid: string;
    public CustomFields: any;
}


export class TransitionThreshold extends UniEntity {
    public static RelativeUrl = 'thresholds';
    public static EntityType = 'TransitionThreshold';

    public Disabled: boolean;
    public CreatedAt: Date;
    public SharedApproveTransitionId: number;
    public SharedRejectTransitionId: number;
    public Operation: OperationType;
    public Deleted: boolean;
    public CreatedBy: string;
    public ID: number;
    public UpdatedBy: string;
    public Value: string;
    public UpdatedAt: Date;
    public RejectStatusCode: number;
    public Operator: Operator;
    public SharedRoleId: number;
    public PropertyName: string;
    public _createguid: string;
    public CustomFields: any;
}


export class TransitionThresholdApproval extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'TransitionThresholdApproval';

    public CreatedAt: Date;
    public SharedApproveTransitionId: number;
    public SharedRejectTransitionId: number;
    public Operation: OperationType;
    public ApprovalID: number;
    public Deleted: boolean;
    public CreatedBy: string;
    public ID: number;
    public UpdatedBy: string;
    public Value: string;
    public UpdatedAt: Date;
    public RejectStatusCode: number;
    public Operator: Operator;
    public SharedRoleId: number;
    public PropertyName: string;
    public _createguid: string;
    public Approval: Approval;
    public CustomFields: any;
}


export class Approval extends UniEntity {
    public static RelativeUrl = 'approvals';
    public static EntityType = 'Approval';

    public UserID: number;
    public CreatedAt: Date;
    public Amount: number;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public TaskID: number;
    public SharedRoleId: number;
    public _createguid: string;
    public Task: Task;
    public Thresholds: Array<TransitionThresholdApproval>;
    public User: User;
    public CustomFields: any;
}


export class Task extends UniEntity {
    public static RelativeUrl = 'tasks';
    public static EntityType = 'Task';

    public UserID: number;
    public CreatedAt: Date;
    public SharedApproveTransitionId: number;
    public SharedRejectTransitionId: number;
    public ModelID: number;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public ID: number;
    public UpdatedBy: string;
    public Title: string;
    public UpdatedAt: Date;
    public RejectStatusCode: number;
    public EntityID: number;
    public Type: TaskType;
    public SharedRoleId: number;
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
    public ToStatusID: number;
    public FromStatusID: number;
    public TransitionID: number;
    public Deleted: boolean;
    public CreatedBy: string;
    public ExpiresDate: Date;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public EntityType: string;
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

    public WorkPlaceAddressID: number;
    public CreatedAt: Date;
    public EndDate: LocalDate;
    public CostPrice: number;
    public ProjectNumberNumeric: number;
    public Amount: number;
    public ProjectCustomerID: number;
    public PlannedStartdate: LocalDate;
    public ProjectNumber: string;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public Description: string;
    public ID: number;
    public Total: number;
    public Price: number;
    public UpdatedBy: string;
    public Name: string;
    public UpdatedAt: Date;
    public ProjectLeadName: string;
    public ProjectNumberSeriesID: number;
    public PlannedEnddate: LocalDate;
    public DimensionsID: number;
    public StartDate: LocalDate;
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
    public Responsibility: string;
    public CreatedAt: Date;
    public ProjectID: number;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public ID: number;
    public UpdatedBy: string;
    public Name: string;
    public UpdatedAt: Date;
    public _createguid: string;
    public ProjectUser: User;
    public CustomFields: any;
}


export class ProjectResourceSchedule extends UniEntity {
    public static RelativeUrl = 'projects-schedules-resources';
    public static EntityType = 'ProjectResourceSchedule';

    public CreatedAt: Date;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public ID: number;
    public ProjectResourceID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public ProjectTaskID: number;
    public ProjectTaskScheduleID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class ProjectTask extends UniEntity {
    public static RelativeUrl = 'projects-tasks';
    public static EntityType = 'ProjectTask';

    public CreatedAt: Date;
    public EndDate: LocalDate;
    public CostPrice: number;
    public Amount: number;
    public ProjectID: number;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public Description: string;
    public ID: number;
    public Total: number;
    public Price: number;
    public UpdatedBy: string;
    public Name: string;
    public UpdatedAt: Date;
    public StartDate: LocalDate;
    public SuggestedNumber: string;
    public Number: string;
    public _createguid: string;
    public ProjectTaskSchedules: Array<ProjectTaskSchedule>;
    public ProjectTaskResources: Array<ProjectResourceSchedule>;
    public CustomFields: any;
}


export class ProjectTaskSchedule extends UniEntity {
    public static RelativeUrl = 'projects-tasks-schedules';
    public static EntityType = 'ProjectTaskSchedule';

    public CreatedAt: Date;
    public EndDate: LocalDate;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public ProjectTaskID: number;
    public StartDate: LocalDate;
    public _createguid: string;
    public ScheduleResources: Array<ProjectResourceSchedule>;
    public CustomFields: any;
}


export class BarnepassProduct extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'BarnepassProduct';

    public CreatedAt: Date;
    public ProductID: number;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public _createguid: string;
    public Product: Product;
    public CustomFields: any;
}


export class Product extends UniEntity {
    public static RelativeUrl = 'products';
    public static EntityType = 'Product';

    public PartName: string;
    public CreatedAt: Date;
    public CostPrice: number;
    public Unit: string;
    public PriceExVat: number;
    public AverageCost: number;
    public PriceIncVat: number;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public ImageFileID: number;
    public Description: string;
    public ID: number;
    public AccountID: number;
    public DefaultProductCategoryID: number;
    public UpdatedBy: string;
    public Name: string;
    public UpdatedAt: Date;
    public VatTypeID: number;
    public VariansParentID: number;
    public DimensionsID: number;
    public ListPrice: number;
    public CalculateGrossPriceBasedOnNetPrice: boolean;
    public Type: ProductTypeEnum;
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
    public IsDefaultForTask: boolean;
    public FromNumber: number;
    public CreatedAt: Date;
    public DisplayName: string;
    public NextNumber: number;
    public NumberSeriesTypeID: number;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public ID: number;
    public NumberLock: boolean;
    public ToNumber: number;
    public UseNumbersFromNumberSeriesID: number;
    public Comment: string;
    public UpdatedBy: string;
    public Name: string;
    public MainAccountID: number;
    public UpdatedAt: Date;
    public Empty: boolean;
    public AccountYear: number;
    public NumberSeriesTaskID: number;
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

    public CreatedAt: Date;
    public NumberSerieTypeBID: number;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public NumberSerieTypeAID: number;
    public _createguid: string;
    public NumberSerieTypeA: NumberSeriesType;
    public NumberSerieTypeB: NumberSeriesType;
    public CustomFields: any;
}


export class NumberSeriesTask extends UniEntity {
    public static RelativeUrl = 'number-series-tasks';
    public static EntityType = 'NumberSeriesTask';

    public CreatedAt: Date;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public ID: number;
    public UpdatedBy: string;
    public Name: string;
    public UpdatedAt: Date;
    public EntityType: string;
    public _createguid: string;
    public NumberSeries: Array<NumberSeries>;
    public CustomFields: any;
}


export class NumberSeriesType extends UniEntity {
    public static RelativeUrl = 'number-series-types';
    public static EntityType = 'NumberSeriesType';

    public CreatedAt: Date;
    public EntityField: string;
    public Yearly: boolean;
    public CanHaveSeveralActiveSeries: boolean;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public ID: number;
    public UpdatedBy: string;
    public Name: string;
    public UpdatedAt: Date;
    public EntityType: string;
    public EntitySeriesIDField: string;
    public System: boolean;
    public _createguid: string;
    public Series: Array<NumberSeries>;
    public CustomFields: any;
}


export class EncryptionInfo extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'EncryptionInfo';

    public CreatedAt: Date;
    public Deleted: boolean;
    public CreatedBy: string;
    public description: string;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public password: string;
    public type: Type;
    public _createguid: string;
    public CustomFields: any;
}


export class File extends UniEntity {
    public static RelativeUrl = 'files/{entitytype}/{entityid}';
    public static EntityType = 'File';

    public encryptionID: number;
    public OCRData: string;
    public StorageReference: string;
    public CreatedAt: Date;
    public PermaLink: string;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public Description: string;
    public ID: number;
    public ContentType: string;
    public Md5: string;
    public UpdatedBy: string;
    public Name: string;
    public Pages: number;
    public Size: string;
    public UpdatedAt: Date;
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
    public FileID: number;
    public Deleted: boolean;
    public CreatedBy: string;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public TagName: string;
    public Status: number;
    public _createguid: string;
    public File: File;
    public CustomFields: any;
}


export class FileEntityLink extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'FileEntityLink';

    public CreatedAt: Date;
    public FileID: number;
    public IsAttachment: boolean;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public EntityType: string;
    public EntityID: number;
    public _createguid: string;
    public File: File;
    public CustomFields: any;
}


export class ElsaUsageLog extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ElsaUsageLog';

    public CreatedAt: Date;
    public ExternalReference: string;
    public Deleted: boolean;
    public CreatedBy: string;
    public ID: number;
    public Quantity: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public ProductType: string;
    public DateLogged: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class AccessPointFormat extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AccessPointFormat';

    public Label: string;
    public CreatedAt: Date;
    public OutgoingID: number;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public ID: number;
    public IncommingID: number;
    public UpdatedBy: string;
    public Name: string;
    public ResourceName: string;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class EHFLog extends UniEntity {
    public static RelativeUrl = 'ehf';
    public static EntityType = 'EHFLog';

    public DistributeAt: LocalDate;
    public From: string;
    public CreatedAt: Date;
    public Subject: string;
    public To: string;
    public ExternalMessage: string;
    public ExternalReference: string;
    public JobRunExternalRef: string;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public ID: number;
    public EntityDisplayValue: string;
    public JobRunID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public EntityType: string;
    public EntityID: number;
    public Type: SharingType;
    public _createguid: string;
    public CustomFields: any;
}


export class Department extends UniEntity {
    public static RelativeUrl = 'departments';
    public static EntityType = 'Department';

    public DepartmentNumberSeriesID: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public Description: string;
    public ID: number;
    public DepartmentNumberNumeric: number;
    public UpdatedBy: string;
    public Name: string;
    public UpdatedAt: Date;
    public DepartmentNumber: string;
    public DepartmentManagerName: string;
    public _createguid: string;
    public DepartmentNumberSeries: NumberSeries;
    public CustomFields: any;
}


export class Dimension10 extends UniEntity {
    public static RelativeUrl = 'Dimension10';
    public static EntityType = 'Dimension10';

    public CreatedAt: Date;
    public NumberNumeric: number;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public Description: string;
    public ID: number;
    public UpdatedBy: string;
    public Name: string;
    public UpdatedAt: Date;
    public Number: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Dimension5 extends UniEntity {
    public static RelativeUrl = 'Dimension5';
    public static EntityType = 'Dimension5';

    public CreatedAt: Date;
    public NumberNumeric: number;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public Description: string;
    public ID: number;
    public UpdatedBy: string;
    public Name: string;
    public UpdatedAt: Date;
    public Number: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Dimension6 extends UniEntity {
    public static RelativeUrl = 'Dimension6';
    public static EntityType = 'Dimension6';

    public CreatedAt: Date;
    public NumberNumeric: number;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public Description: string;
    public ID: number;
    public UpdatedBy: string;
    public Name: string;
    public UpdatedAt: Date;
    public Number: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Dimension7 extends UniEntity {
    public static RelativeUrl = 'Dimension7';
    public static EntityType = 'Dimension7';

    public CreatedAt: Date;
    public NumberNumeric: number;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public Description: string;
    public ID: number;
    public UpdatedBy: string;
    public Name: string;
    public UpdatedAt: Date;
    public Number: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Dimension8 extends UniEntity {
    public static RelativeUrl = 'Dimension8';
    public static EntityType = 'Dimension8';

    public CreatedAt: Date;
    public NumberNumeric: number;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public Description: string;
    public ID: number;
    public UpdatedBy: string;
    public Name: string;
    public UpdatedAt: Date;
    public Number: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Dimension9 extends UniEntity {
    public static RelativeUrl = 'Dimension9';
    public static EntityType = 'Dimension9';

    public CreatedAt: Date;
    public NumberNumeric: number;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public Description: string;
    public ID: number;
    public UpdatedBy: string;
    public Name: string;
    public UpdatedAt: Date;
    public Number: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Dimensions extends UniEntity {
    public static RelativeUrl = 'dimensions';
    public static EntityType = 'Dimensions';

    public RegionID: number;
    public Dimension6ID: number;
    public Dimension5ID: number;
    public CreatedAt: Date;
    public DepartmentID: number;
    public Dimension9ID: number;
    public ProjectID: number;
    public Dimension8ID: number;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public ID: number;
    public Dimension7ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public ProjectTaskID: number;
    public ResponsibleID: number;
    public Dimension10ID: number;
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
    public Dimension9Name: string;
    public Dimension10Number: string;
    public RegionCode: string;
    public Dimension9Number: string;
    public Dimension10Name: string;
    public Dimension7Number: string;
    public Dimension5Number: string;
    public Dimension5Name: string;
    public ProjectNumber: string;
    public ID: number;
    public ProjectTaskNumber: string;
    public ResponsibleName: string;
    public ProjectTaskName: string;
    public Dimension7Name: string;
    public Dimension6Number: string;
    public RegionName: string;
    public DepartmentNumber: string;
    public ProjectName: string;
    public Dimension8Name: string;
    public DimensionsID: number;
    public Dimension8Number: string;
    public Dimension6Name: string;
    public DepartmentName: string;
}


export class DimensionSettings extends UniEntity {
    public static RelativeUrl = 'dimensionsettings';
    public static EntityType = 'DimensionSettings';

    public Label: string;
    public Dimension: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public IsActive: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class Region extends UniEntity {
    public static RelativeUrl = 'regions';
    public static EntityType = 'Region';

    public CountryCode: string;
    public RegionCode: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public Description: string;
    public ID: number;
    public UpdatedBy: string;
    public Name: string;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class Responsible extends UniEntity {
    public static RelativeUrl = 'responsibles';
    public static EntityType = 'Responsible';

    public NameOfResponsible: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public Description: string;
    public ID: number;
    public UpdatedBy: string;
    public Name: string;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class Contract extends UniEntity {
    public static RelativeUrl = 'contracts';
    public static EntityType = 'Contract';

    public TeamsUri: string;
    public CreatedAt: Date;
    public ContractCode: string;
    public Hash: string;
    public HashTransactionAddress: string;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public Description: string;
    public ID: number;
    public UpdatedBy: string;
    public Name: string;
    public UpdatedAt: Date;
    public Engine: ContractEngine;
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
    public Address: string;
    public Amount: number;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public ID: number;
    public ContractAssetID: number;
    public AssetAddress: string;
    public ContractID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public EntityType: string;
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

    public IsFixedDenominations: boolean;
    public IsPrivate: boolean;
    public CreatedAt: Date;
    public IsCosignedByDefiner: boolean;
    public IsTransferrable: boolean;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public ID: number;
    public ContractID: number;
    public UpdatedBy: string;
    public Cap: number;
    public UpdatedAt: Date;
    public IsIssuedByDefinerOnly: boolean;
    public IsAutoDestroy: boolean;
    public SpenderAttested: boolean;
    public Type: AddressType;
    public _createguid: string;
    public Contract: Contract;
    public CustomFields: any;
}


export class ContractDebugLog extends UniEntity {
    public static RelativeUrl = 'contractdebuglogs';
    public static EntityType = 'ContractDebugLog';

    public CreatedAt: Date;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public Message: string;
    public ID: number;
    public ContractID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public ContractRunLogID: number;
    public Type: ContractEventType;
    public _createguid: string;
    public Contract: Contract;
    public ContractRunLog: ContractRunLog;
    public CustomFields: any;
}


export class ContractParameter extends UniEntity {
    public static RelativeUrl = 'contractparameters';
    public static EntityType = 'ContractParameter';

    public CreatedAt: Date;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public ID: number;
    public ContractID: number;
    public UpdatedBy: string;
    public Name: string;
    public Value: string;
    public UpdatedAt: Date;
    public _createguid: string;
    public Contract: Contract;
    public CustomFields: any;
}


export class ContractRunLog extends UniEntity {
    public static RelativeUrl = 'contractrunlogs';
    public static EntityType = 'ContractRunLog';

    public RunTime: string;
    public CreatedAt: Date;
    public ContractTriggerID: number;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public Message: string;
    public ID: number;
    public ContractID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public Type: ContractEventType;
    public _createguid: string;
    public Contract: Contract;
    public CustomFields: any;
}


export class ContractTransaction extends UniEntity {
    public static RelativeUrl = 'contracttransactions';
    public static EntityType = 'ContractTransaction';

    public ContractAddressID: number;
    public ReceiverAddress: string;
    public CreatedAt: Date;
    public Amount: number;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public ID: number;
    public AssetAddress: string;
    public ContractID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public SenderAddress: string;
    public _createguid: string;
    public Contract: Contract;
    public ContractAddress: ContractAddress;
    public CustomFields: any;
}


export class ContractTrigger extends UniEntity {
    public static RelativeUrl = 'contracttriggers';
    public static EntityType = 'ContractTrigger';

    public ModelFilter: string;
    public ExpressionFilter: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public ID: number;
    public ContractID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public OperationFilter: string;
    public Type: ContractEventType;
    public _createguid: string;
    public Contract: Contract;
    public CustomFields: any;
}


export class Comment extends UniEntity {
    public static RelativeUrl = 'comments';
    public static EntityType = 'Comment';

    public CreatedAt: Date;
    public Text: string;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public ID: number;
    public AuthorID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public EntityType: string;
    public EntityID: number;
    public _createguid: string;
    public Mentioned: Array<Mentioned>;
    public Author: User;
    public CustomFields: any;
}


export class Mentioned extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Mentioned';

    public UserID: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public ID: number;
    public UpdatedBy: string;
    public CommentID: number;
    public UpdatedAt: Date;
    public _createguid: string;
    public User: User;
    public CustomFields: any;
}


export class ApiKey extends UniEntity {
    public static RelativeUrl = 'apikeys';
    public static EntityType = 'ApiKey';

    public IntegrationKey: string;
    public CreatedAt: Date;
    public ExternalId: string;
    public IntegrationType: TypeOfIntegration;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public Description: string;
    public ID: number;
    public Url: string;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public FilterDate: LocalDate;
    public Encrypt: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class Altinn extends UniEntity {
    public static RelativeUrl = 'altinn';
    public static EntityType = 'Altinn';

    public CreatedAt: Date;
    public SystemPw: string;
    public SystemID: string;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public Language: string;
    public PreferredLogin: TypeOfLogin;
    public _createguid: string;
    public CustomFields: any;
}


export class AltinnReceipt extends UniEntity {
    public static RelativeUrl = 'altinnreceipts';
    public static EntityType = 'AltinnReceipt';

    public HasBeenRegistered: boolean;
    public ErrorText: string;
    public ReceiptID: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public ID: number;
    public TimeStamp: Date;
    public UpdatedBy: string;
    public XmlReceipt: string;
    public Form: string;
    public UpdatedAt: Date;
    public UserSign: string;
    public AltinnResponseData: string;
    public _createguid: string;
    public Signings: Array<AltinnSigning>;
    public CustomFields: any;
}


export class AltinnSigning extends UniEntity {
    public static RelativeUrl = 'altinnsigning';
    public static EntityType = 'AltinnSigning';

    public SignatureText: string;
    public CreatedAt: Date;
    public AltinnReceiptID: number;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public ID: number;
    public StatusText: string;
    public SignatureReference: string;
    public UpdatedBy: string;
    public DateSigned: Date;
    public UpdatedAt: Date;
    public _createguid: string;
    public AltinnReceipt: AltinnReceipt;
    public CustomFields: any;
}


export class Barnepass extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Barnepass';

    public CreatedAt: Date;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public ID: number;
    public UpdatedBy: string;
    public inntektsaar: number;
    public UpdatedAt: Date;
    public _createguid: string;
    public oppgave: Array<BarnepassOppgave>;
    public CustomFields: any;
}


export class BarnepassOppgave extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'BarnepassOppgave';

    public BarnepassID: number;
    public navn: string;
    public CreatedAt: Date;
    public email: string;
    public foedselsnummer: string;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public ID: number;
    public UpdatedBy: string;
    public paaloeptBeloep: number;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class UserRole extends UniEntity {
    public static RelativeUrl = 'userroles';
    public static EntityType = 'UserRole';

    public UserID: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public CreatedBy: string;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public SharedRoleName: string;
    public SharedRoleId: number;
    public _createguid: string;
    public User: User;
    public CustomFields: any;
}


export class Role extends UniEntity {
    public static RelativeUrl = 'roles';
    public static EntityType = 'Role';

    public Label: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public CreatedBy: string;
    public Description: string;
    public ID: number;
    public UpdatedBy: string;
    public Name: string;
    public UpdatedAt: Date;
    public _createguid: string;
    public RolePermissions: Array<RolePermission>;
    public CustomFields: any;
}


export class RolePermission extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'RolePermission';

    public CreatedAt: Date;
    public Deleted: boolean;
    public CreatedBy: string;
    public RoleID: number;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public PermissionID: number;
    public _createguid: string;
    public Role: Role;
    public Permission: Permission;
    public CustomFields: any;
}


export class Permission extends UniEntity {
    public static RelativeUrl = 'permissions';
    public static EntityType = 'Permission';

    public CreatedAt: Date;
    public Deleted: boolean;
    public CreatedBy: string;
    public ID: number;
    public UpdatedBy: string;
    public Name: string;
    public UpdatedAt: Date;
    public _createguid: string;
    public RolePermissions: Array<RolePermission>;
    public CustomFields: any;
}


export class ApiMessage extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ApiMessage';

    public CreatedAt: Date;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public Message: string;
    public ID: number;
    public Service: string;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public ToDate: Date;
    public Type: ApiMessageType;
    public FromDate: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class AvtaleGiroAgreement extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AvtaleGiroAgreement';

    public DataSender: string;
    public Thumbprint: string;
    public CreatedAt: Date;
    public NextNumber: number;
    public Deleted: boolean;
    public CreatedBy: string;
    public Description: string;
    public KeyPath: string;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class AvtaleGiroBankAccount extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AvtaleGiroBankAccount';

    public BankAccountNumber: string;
    public CreatedAt: Date;
    public AvtaleGiroAgreementID: number;
    public Deleted: boolean;
    public CreatedBy: string;
    public ID: number;
    public UpdatedBy: string;
    public CompanyID: number;
    public UpdatedAt: Date;
    public _createguid: string;
    public Company: Company;
    public CustomFields: any;
}


export class AvtaleGiroFile extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AvtaleGiroFile';

    public CreatedAt: Date;
    public FileID: number;
    public AvtaleGiroMergedFileID: number;
    public AvtaleGiroAgreementID: number;
    public Deleted: boolean;
    public CreatedBy: string;
    public ID: number;
    public UpdatedBy: string;
    public CompanyID: number;
    public UpdatedAt: Date;
    public AvtaleGiroContent: string;
    public _createguid: string;
    public Company: Company;
    public CustomFields: any;
}


export class AvtaleGiroMergedFile extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AvtaleGiroMergedFile';

    public CreatedAt: Date;
    public Deleted: boolean;
    public CreatedBy: string;
    public ID: number;
    public TransmissionNumber: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class BankAgreement extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'BankAgreement';

    public OrderEmail: string;
    public AccountOwnerOrgNumber: string;
    public AccountOwnerName: string;
    public ReceiptID: string;
    public CreatedAt: Date;
    public ReceiptDate: Date;
    public CustomerName: string;
    public OrderName: string;
    public Deleted: boolean;
    public CreatedBy: string;
    public ID: number;
    public OrderMobile: string;
    public UpdatedBy: string;
    public CompanyID: number;
    public UpdatedAt: Date;
    public ServiceID: string;
    public CustomerOrgNumber: string;
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

    public DivisionName: string;
    public CreatedAt: Date;
    public DivisionID: number;
    public ServiceType: number;
    public Deleted: boolean;
    public CreatedBy: string;
    public ID: number;
    public FileType: string;
    public ConfirmInNetbank: boolean;
    public BankAgreementID: number;
    public UpdatedBy: string;
    public KidRule: string;
    public UpdatedAt: Date;
    public _createguid: string;
    public BankAgreement: BankAgreement;
    public BankAccounts: Array<BankServiceBankAccount>;
    public CustomFields: any;
}


export class BankServiceBankAccount extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'BankServiceBankAccount';

    public CreatedAt: Date;
    public Deleted: boolean;
    public CreatedBy: string;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public AccountNumber: string;
    public BankServiceID: number;
    public _createguid: string;
    public BankService: BankService;
    public CustomFields: any;
}


export class Company extends UniEntity {
    public static RelativeUrl = 'companies';
    public static EntityType = 'Company';

    public IsTest: boolean;
    public ConnectionString: string;
    public ClientNumber: number;
    public CreatedAt: Date;
    public OrganizationNumber: string;
    public FileFlowOrgnrEmail: string;
    public IsGlobalTemplate: boolean;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: CompanyStatusCode;
    public MigrationVersion: string;
    public ID: number;
    public Key: string;
    public UpdatedBy: string;
    public Name: string;
    public UpdatedAt: Date;
    public SchemaName: string;
    public FileFlowEmail: string;
    public IsTemplate: boolean;
    public LastActivity: Date;
    public WebHookSubscriberId: string;
    public _createguid: string;
    public CustomFields: any;
}


export class CompanyAccess extends UniEntity {
    public static RelativeUrl = 'companies-access';
    public static EntityType = 'CompanyAccess';

    public Roles: string;
    public CreatedAt: Date;
    public EndDate: Date;
    public GlobalIdentity: string;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public ID: number;
    public UpdatedBy: string;
    public CompanyID: number;
    public UpdatedAt: Date;
    public StartDate: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class CompanyBackup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'CompanyBackup';

    public ScheduledForDeleteAt: Date;
    public CreatedAt: Date;
    public Environment: string;
    public CustomerName: string;
    public ContainerName: string;
    public ContractType: number;
    public Deleted: boolean;
    public CreatedBy: string;
    public Message: string;
    public ID: number;
    public ContractID: number;
    public Reason: string;
    public UpdatedBy: string;
    public CopyFiles: boolean;
    public UpdatedAt: Date;
    public BackupStatus: BackupStatus;
    public SchemaName: string;
    public OrgNumber: string;
    public CloudBlobName: string;
    public CompanyName: string;
    public CompanyKey: string;
    public DeletedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class ContractCron extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ContractCron';

    public CreatedAt: Date;
    public ContractTriggerID: number;
    public Deleted: boolean;
    public CreatedBy: string;
    public ID: number;
    public ContractID: number;
    public UpdatedBy: string;
    public CompanyID: number;
    public UpdatedAt: Date;
    public Expression: string;
    public CompanyDbName: string;
    public _createguid: string;
    public CompanyKey: string;
    public CustomFields: any;
}


export class ContractObyte extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ContractObyte';

    public ContractAddressID: number;
    public CreatedAt: Date;
    public Address: string;
    public Deleted: boolean;
    public CreatedBy: string;
    public ID: number;
    public AssetAddress: string;
    public ContractID: number;
    public UpdatedBy: string;
    public CompanyID: number;
    public UpdatedAt: Date;
    public CompanyDbName: string;
    public _createguid: string;
    public CompanyKey: string;
    public CustomFields: any;
}


export class DeniedUserAccessLog extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'DeniedUserAccessLog';

    public Occurred: Date;
    public CreatedAt: Date;
    public Email: string;
    public Deleted: boolean;
    public CreatedBy: string;
    public Message: string;
    public ID: number;
    public Username: string;
    public UpdatedBy: string;
    public CompanyID: number;
    public UpdatedAt: Date;
    public CompanyName: string;
    public _createguid: string;
    public Company: Company;
    public CustomFields: any;
}


export class FailedBankFile extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'FailedBankFile';

    public CreatedAt: Date;
    public FileName: string;
    public FailedReason: FailedReasonEnum;
    public FileContent: string;
    public Deleted: boolean;
    public CreatedBy: string;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public CompanyKey: string;
    public _createguid: string;
    public CustomFields: any;
}


export class HangfireJob extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'HangfireJob';

    public Completed: boolean;
    public CreatedAt: Date;
    public GlobalIdentity: string;
    public ID: number;
    public Year: number;
    public JobId: string;
    public CompanyID: number;
    public UpdatedAt: Date;
    public HasError: boolean;
    public Status: number;
    public CompanyKey: string;
    public CustomFields: any;
}


export class HangfireJobContext extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'HangfireJobContext';

    public Completed: boolean;
    public CreatedAt: Date;
    public GlobalIdentity: string;
    public ID: number;
    public Year: number;
    public JobId: string;
    public CompanyID: number;
    public UpdatedAt: Date;
    public HasError: boolean;
    public SchemaName: string;
    public Status: number;
    public CompanyKey: string;
    public CustomFields: any;
}


export class HangfireResponse extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'HangfireResponse';

    public Completed: boolean;
    public CreatedAt: Date;
    public ProgressUrl: string;
    public GlobalIdentity: string;
    public ID: number;
    public Year: number;
    public JobId: string;
    public State: string;
    public CompanyID: number;
    public UpdatedAt: Date;
    public HasError: boolean;
    public Status: number;
    public CompanyKey: string;
    public CustomFields: any;
}


export class KpiDefinition extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'KpiDefinition';

    public CreatedAt: Date;
    public IsPerUser: boolean;
    public RoleNames: string;
    public Deleted: boolean;
    public CreatedBy: string;
    public ValueType: KpiValueType;
    public ID: number;
    public RefreshModels: string;
    public Application: string;
    public UpdatedBy: string;
    public Route: string;
    public Name: string;
    public CompanyID: number;
    public SourceType: KpiSourceType;
    public UpdatedAt: Date;
    public Interval: string;
    public _createguid: string;
    public CustomFields: any;
}


export class KpiValue extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'KpiValue';

    public Counter: number;
    public CreatedAt: Date;
    public LastUpdated: Date;
    public Text: string;
    public KpiName: string;
    public ValueStatus: KpiValueStatus;
    public Deleted: boolean;
    public CreatedBy: string;
    public ID: number;
    public Total: number;
    public UpdatedBy: string;
    public CompanyID: number;
    public KpiDefinitionID: number;
    public UpdatedAt: Date;
    public UserIdentity: string;
    public _createguid: string;
    public CustomFields: any;
}


export class OutgoingInvoice extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'OutgoingInvoice';

    public CreatedAt: Date;
    public RecipientOrganizationNumber: string;
    public InvoiceID: number;
    public Amount: number;
    public InvoiceType: OutgoingInvoiceType;
    public ExternalReference: string;
    public DueDate: Date;
    public Deleted: boolean;
    public CreatedBy: string;
    public RecipientPhoneNumber: string;
    public StatusCode: number;
    public ID: number;
    public MetaJson: string;
    public UpdatedBy: string;
    public CompanyID: number;
    public UpdatedAt: Date;
    public ISPOrganizationNumber: string;
    public Status: number;
    public _createguid: string;
    public Company: Company;
    public CustomFields: any;
}


export class ProcessFileLog extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ProcessFileLog';

    public CreatedAt: Date;
    public FileName: string;
    public FileID: number;
    public EntityCount: number;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public Message: string;
    public ID: number;
    public FileType: number;
    public UpdatedBy: string;
    public CompanyID: number;
    public UpdatedAt: Date;
    public EntityInstanceID: string;
    public EntityName: string;
    public CompanyName: string;
    public UserIdentity: string;
    public CompanyKey: string;
    public _createguid: string;
    public Company: Company;
    public CustomFields: any;
}


export class ServiceAccount extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ServiceAccount';

    public DataSender: string;
    public Thumbprint: string;
    public CreatedAt: Date;
    public NextNumber: number;
    public Deleted: boolean;
    public CreatedBy: string;
    public Description: string;
    public KeyPath: string;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class UserVerification extends UniEntity {
    public static RelativeUrl = 'user-verifications';
    public static EntityType = 'UserVerification';

    public UserId: number;
    public UserType: UserVerificationUserType;
    public CreatedAt: Date;
    public DisplayName: string;
    public Email: string;
    public VerificationCode: string;
    public VerificationDate: Date;
    public ExpirationDate: Date;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public ID: number;
    public UpdatedBy: string;
    public CompanyId: number;
    public RequestOrigin: UserVerificationRequestOrigin;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class Account extends UniEntity {
    public static RelativeUrl = 'accounts';
    public static EntityType = 'Account';

    public Locked: boolean;
    public UsePostPost: boolean;
    public AccountName: string;
    public CreatedAt: Date;
    public TopLevelAccountGroupID: number;
    public CustomerID: number;
    public Visible: boolean;
    public CostAllocationID: number;
    public DoSynchronize: boolean;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public Description: string;
    public ID: number;
    public SaftMappingAccountID: number;
    public AccountID: number;
    public SupplierID: number;
    public UseVatDeductionGroupID: number;
    public UpdatedBy: string;
    public Active: boolean;
    public UpdatedAt: Date;
    public VatTypeID: number;
    public AccountNumber: number;
    public DimensionsID: number;
    public LockManualPosts: boolean;
    public AccountGroupID: number;
    public AccountSetupID: number;
    public SystemAccount: boolean;
    public EmployeeID: number;
    public CurrencyCodeID: number;
    public Keywords: string;
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
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public ID: number;
    public AccountID: number;
    public UpdatedBy: string;
    public Name: string;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class AccountGroup extends UniEntity {
    public static RelativeUrl = 'accountgroups';
    public static EntityType = 'AccountGroup';

    public CreatedAt: Date;
    public CompatibleAccountID: number;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public ID: number;
    public AccountID: number;
    public GroupNumber: string;
    public AccountGroupSetupID: number;
    public UpdatedBy: string;
    public Name: string;
    public UpdatedAt: Date;
    public MainGroupID: number;
    public AccountGroupSetID: number;
    public Summable: boolean;
    public _createguid: string;
    public MainGroup: AccountGroup;
    public AccountGroupSet: AccountGroupSet;
    public CustomFields: any;
}


export class AccountGroupSet extends UniEntity {
    public static RelativeUrl = 'accountgroupsets';
    public static EntityType = 'AccountGroupSet';

    public SubAccountAllowed: boolean;
    public FromAccountNumber: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public ID: number;
    public UpdatedBy: string;
    public Name: string;
    public ToAccountNumber: number;
    public UpdatedAt: Date;
    public Shared: boolean;
    public System: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class AccountMandatoryDimension extends UniEntity {
    public static RelativeUrl = 'accountmandatorydimension';
    public static EntityType = 'AccountMandatoryDimension';

    public CreatedAt: Date;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public ID: number;
    public AccountID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public MandatoryType: number;
    public DimensionNo: number;
    public _createguid: string;
    public CustomFields: any;
}


export class Accrual extends UniEntity {
    public static RelativeUrl = 'accruals';
    public static EntityType = 'Accrual';

    public JournalEntryLineDraftID: number;
    public CreatedAt: Date;
    public AccrualAmount: number;
    public BalanceAccountID: number;
    public ResultAccountID: number;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public AccrualJournalEntryMode: number;
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
    public CreatedAt: Date;
    public Amount: number;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public PeriodNo: number;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public AccountYear: number;
    public JournalEntryDraftLineID: number;
    public _createguid: string;
    public Accrual: Accrual;
    public JournalEntryLineDraft: JournalEntryLineDraft;
    public CustomFields: any;
}


export class ApprovalData extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ApprovalData';

    public EntityHash: string;
    public CreatedAt: Date;
    public EntityCount: number;
    public Deleted: boolean;
    public CreatedBy: string;
    public ID: number;
    public UpdatedBy: string;
    public VerificationReference: string;
    public UpdatedAt: Date;
    public VerificationMethod: string;
    public EntityName: string;
    public EntityID: number;
    public EntityReference: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Asset extends UniEntity {
    public static RelativeUrl = 'assets';
    public static EntityType = 'Asset';

    public NetFinancialValue: number;
    public AutoDepreciation: boolean;
    public Lifetime: number;
    public CreatedAt: Date;
    public BalanceAccountID: number;
    public DepreciationAccountID: number;
    public DepreciationStartDate: LocalDate;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public ID: number;
    public PurchaseAmount: number;
    public UpdatedBy: string;
    public PurchaseDate: LocalDate;
    public Name: string;
    public UpdatedAt: Date;
    public ScrapValue: number;
    public DepreciationCycle: number;
    public DimensionsID: number;
    public AssetGroupCode: string;
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

    public EmailID: number;
    public AddressID: number;
    public CreatedAt: Date;
    public PhoneID: number;
    public Web: string;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public ID: number;
    public InitialBIC: string;
    public UpdatedBy: string;
    public Name: string;
    public UpdatedAt: Date;
    public BIC: string;
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
    public Locked: boolean;
    public IBAN: string;
    public CompanySettingsID: number;
    public CreatedAt: Date;
    public BusinessRelationID: number;
    public BankAccountType: string;
    public BankID: number;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public IntegrationSettings: string;
    public ID: number;
    public AccountID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public AccountNumber: string;
    public IntegrationStatus: number;
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
    public IsInbound: boolean;
    public CreatedAt: Date;
    public ServiceProvider: number;
    public ServiceTemplateID: string;
    public DefaultAgreement: boolean;
    public IsOutgoing: boolean;
    public HasNewAccountInformation: boolean;
    public Email: string;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public BankAccountID: number;
    public BankAcceptance: boolean;
    public ID: number;
    public UpdatedBy: string;
    public Name: string;
    public UpdatedAt: Date;
    public ServiceID: string;
    public PropertiesJson: string;
    public IsBankBalance: boolean;
    public Password: string;
    public _createguid: string;
    public BankAccount: BankAccount;
    public CustomFields: any;
}


export class BankRule extends UniEntity {
    public static RelativeUrl = 'bankrules';
    public static EntityType = 'BankRule';

    public ActionCode: ActionCodeBankRule;
    public Priority: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public ID: number;
    public AccountID: number;
    public Rule: string;
    public UpdatedBy: string;
    public Name: string;
    public UpdatedAt: Date;
    public IsActive: boolean;
    public _createguid: string;
    public Account: Account;
    public CustomFields: any;
}


export class BankStatement extends UniEntity {
    public static RelativeUrl = 'bankstatements';
    public static EntityType = 'BankStatement';

    public CreatedAt: Date;
    public EndBalance: number;
    public AmountCurrency: number;
    public FileID: number;
    public Amount: number;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public BankAccountID: number;
    public ID: number;
    public AccountID: number;
    public CurrencyCode: string;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public ArchiveReference: string;
    public ToDate: LocalDate;
    public StartBalance: number;
    public FromDate: LocalDate;
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
    public CID: string;
    public CreatedAt: Date;
    public StructuredReference: string;
    public AmountCurrency: number;
    public ValueDate: LocalDate;
    public Amount: number;
    public BankStatementID: number;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public Description: string;
    public ID: number;
    public CurrencyCode: string;
    public UpdatedBy: string;
    public InvoiceNumber: string;
    public BookingDate: LocalDate;
    public SenderAccount: string;
    public UpdatedAt: Date;
    public SenderName: string;
    public ArchiveReference: string;
    public ReceiverAccount: string;
    public Receivername: string;
    public TransactionId: string;
    public OpenAmount: number;
    public Category: string;
    public _createguid: string;
    public BankStatement: BankStatement;
    public CustomFields: any;
}


export class BankStatementMatch extends UniEntity {
    public static RelativeUrl = 'bankstatementmatch';
    public static EntityType = 'BankStatementMatch';

    public CreatedAt: Date;
    public Amount: number;
    public Batch: string;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public BankStatementEntryID: number;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
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

    public Priority: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public ID: number;
    public AccountID: number;
    public Rule: string;
    public UpdatedBy: string;
    public Name: string;
    public UpdatedAt: Date;
    public IsActive: boolean;
    public EntryText: string;
    public DimensionsID: number;
    public _createguid: string;
    public Dimensions: Dimensions;
    public Account: Account;
    public CustomFields: any;
}


export class Budget extends UniEntity {
    public static RelativeUrl = 'budgets';
    public static EntityType = 'Budget';

    public AccountingYear: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public ID: number;
    public UpdatedBy: string;
    public Name: string;
    public UpdatedAt: Date;
    public _createguid: string;
    public Entries: Array<BudgetEntry>;
    public CustomFields: any;
}


export class BudgetEntry extends UniEntity {
    public static RelativeUrl = 'budgetentries';
    public static EntityType = 'BudgetEntry';

    public CreatedAt: Date;
    public PeriodNumber: number;
    public Amount: number;
    public BudgetID: number;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public ID: number;
    public AccountID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
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

    public AssetSaleLossVatAccountID: number;
    public CreatedAt: Date;
    public AssetSaleProfitVatAccountID: number;
    public ReInvoicingTurnoverProductID: number;
    public AssetSaleProfitNoVatAccountID: number;
    public AssetSaleProductID: number;
    public AssetSaleLossBalancingAccountID: number;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public ID: number;
    public AssetSaleProfitBalancingAccountID: number;
    public UpdatedBy: string;
    public ReInvoicingMethod: number;
    public UpdatedAt: Date;
    public AssetWriteoffAccountID: number;
    public ReInvoicingCostsharingProductID: number;
    public AssetSaleLossNoVatAccountID: number;
    public _createguid: string;
    public ReInvoicingCostsharingProduct: Product;
    public ReInvoicingTurnoverProduct: Product;
    public CustomFields: any;
}


export class CompanyBankAccount extends UniEntity {
    public static RelativeUrl = 'companybankaccounts';
    public static EntityType = 'CompanyBankAccount';

    public CreatedAt: Date;
    public IsSalary: boolean;
    public IsOutgoing: boolean;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public BankAccountID: number;
    public ID: number;
    public AccountID: number;
    public UpdatedBy: string;
    public Name: string;
    public UpdatedAt: Date;
    public CreditAmount: number;
    public IsTax: boolean;
    public IsIncomming: boolean;
    public _createguid: string;
    public BankAccount: BankAccount;
    public Account: Account;
    public CustomFields: any;
}


export class CostAllocation extends UniEntity {
    public static RelativeUrl = 'costallocations';
    public static EntityType = 'CostAllocation';

    public CreatedAt: Date;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public ID: number;
    public UpdatedBy: string;
    public Name: string;
    public UpdatedAt: Date;
    public _createguid: string;
    public Items: Array<CostAllocationItem>;
    public CustomFields: any;
}


export class CostAllocationItem extends UniEntity {
    public static RelativeUrl = 'costallocationitems';
    public static EntityType = 'CostAllocationItem';

    public Percent: number;
    public CreatedAt: Date;
    public Amount: number;
    public CostAllocationID: number;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public Description: string;
    public ID: number;
    public AccountID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public VatTypeID: number;
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

    public IsCustomerPayment: boolean;
    public CreatedAt: Date;
    public EndDate: LocalDate;
    public AmountCurrency: number;
    public CustomLiquidityPaymentType: CustomLiquidityPaymentInterval;
    public Amount: number;
    public DueDate: LocalDate;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public Description: string;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public CurrencyCodeID: number;
    public _createguid: string;
    public currency: CurrencyCode;
    public CustomFields: any;
}


export class DepreciationLine extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'DepreciationLine';

    public DepreciationType: number;
    public DepreciationJELineID: number;
    public CreatedAt: Date;
    public AssetID: number;
    public AssetJELineID: number;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public _createguid: string;
    public DepreciationJELine: JournalEntryLine;
    public AssetJELine: JournalEntryLine;
    public CustomFields: any;
}


export class FinancialYear extends UniEntity {
    public static RelativeUrl = 'financialyears';
    public static EntityType = 'FinancialYear';

    public CreatedAt: Date;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public ID: number;
    public Year: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public ValidTo: LocalDate;
    public ValidFrom: LocalDate;
    public _createguid: string;
    public CustomFields: any;
}


export class JournalEntry extends UniEntity {
    public static RelativeUrl = 'journalentries';
    public static EntityType = 'JournalEntry';

    public NumberSeriesID: number;
    public CreatedAt: Date;
    public JournalEntryNumber: string;
    public JournalEntryAccrualID: number;
    public FinancialYearID: number;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public Description: string;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public JournalEntryDraftGroup: string;
    public JournalEntryNumberNumeric: number;
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

    public JournalEntryLineDraftID: number;
    public VatReportID: number;
    public RestAmountCurrency: number;
    public AccrualID: number;
    public TaxBasisAmountCurrency: number;
    public SubAccountID: number;
    public CreatedAt: Date;
    public RestAmount: number;
    public AmountCurrency: number;
    public BatchNumber: number;
    public VatPeriodID: number;
    public PeriodID: number;
    public ReferenceCreditPostID: number;
    public Amount: number;
    public PaymentReferenceID: number;
    public JournalEntryNumber: string;
    public TaxBasisAmount: number;
    public CurrencyExchangeRate: number;
    public Signature: string;
    public VatDate: LocalDate;
    public DueDate: LocalDate;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public RegisteredDate: LocalDate;
    public Description: string;
    public ID: number;
    public PostPostJournalEntryLineID: number;
    public AccountID: number;
    public VatJournalEntryPostID: number;
    public OriginalReferencePostID: number;
    public VatPercent: number;
    public UpdatedBy: string;
    public InvoiceNumber: string;
    public CustomerInvoiceID: number;
    public PaymentInfoTypeID: number;
    public FinancialDate: LocalDate;
    public UpdatedAt: Date;
    public VatTypeID: number;
    public SupplierInvoiceID: number;
    public JournalEntryNumberNumeric: number;
    public PaymentID: string;
    public JournalEntryID: number;
    public DimensionsID: number;
    public VatDeductionPercent: number;
    public CustomerOrderID: number;
    public ReferenceOriginalPostID: number;
    public JournalEntryTypeID: number;
    public OriginalJournalEntryPost: number;
    public CurrencyCodeID: number;
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

    public AccrualID: number;
    public TaxBasisAmountCurrency: number;
    public SubAccountID: number;
    public CreatedAt: Date;
    public AmountCurrency: number;
    public BatchNumber: number;
    public VatPeriodID: number;
    public PeriodID: number;
    public Amount: number;
    public PaymentReferenceID: number;
    public JournalEntryNumber: string;
    public TaxBasisAmount: number;
    public CurrencyExchangeRate: number;
    public Signature: string;
    public VatDate: LocalDate;
    public DueDate: LocalDate;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public RegisteredDate: LocalDate;
    public Description: string;
    public ID: number;
    public PostPostJournalEntryLineID: number;
    public AccountID: number;
    public VatPercent: number;
    public UpdatedBy: string;
    public InvoiceNumber: string;
    public CustomerInvoiceID: number;
    public PaymentInfoTypeID: number;
    public FinancialDate: LocalDate;
    public UpdatedAt: Date;
    public VatTypeID: number;
    public SupplierInvoiceID: number;
    public JournalEntryNumberNumeric: number;
    public PaymentID: string;
    public JournalEntryID: number;
    public DimensionsID: number;
    public VatDeductionPercent: number;
    public CustomerOrderID: number;
    public JournalEntryTypeID: number;
    public CurrencyCodeID: number;
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

    public VisibleModules: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public ID: number;
    public ColumnSetUp: string;
    public TraceLinkTypes: string;
    public UpdatedBy: string;
    public Name: string;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class JournalEntrySourceSerie extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'JournalEntrySourceSerie';

    public CreatedAt: Date;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public JournalEntrySourceID: number;
    public JournalEntrySourceEntityName: string;
    public JournalEntrySourceInstanceID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class JournalEntryType extends UniEntity {
    public static RelativeUrl = 'journalentrytypes';
    public static EntityType = 'JournalEntryType';

    public MainName: string;
    public CreatedAt: Date;
    public DisplayName: string;
    public Deleted: boolean;
    public CreatedBy: string;
    public ID: number;
    public UpdatedBy: string;
    public Name: string;
    public UpdatedAt: Date;
    public ExpectNegativeAmount: boolean;
    public Number: number;
    public _createguid: string;
    public CustomFields: any;
}


export class LedgerSuggestion extends UniEntity {
    public BusinessType: string;
    public ID: number;
    public Source: SuggestionSource;
    public Name: string;
    public IndustryName: string;
    public OrgNumber: string;
    public IndustryCode: string;
}


export class Payment extends UniEntity {
    public static RelativeUrl = 'payments';
    public static EntityType = 'Payment';

    public IsPaymentCancellationRequest: boolean;
    public CustomerInvoiceReminderID: number;
    public XmlTagPmtInfIdReference: string;
    public IsPaymentClaim: boolean;
    public IsCustomerPayment: boolean;
    public CreatedAt: Date;
    public AmountCurrency: number;
    public PaymentDate: LocalDate;
    public Debtor: string;
    public FromBankAccountID: number;
    public InPaymentID: string;
    public Domain: string;
    public BusinessRelationID: number;
    public Amount: number;
    public SerialNumberOrAcctSvcrRef: string;
    public XmlTagEndToEndIdReference: string;
    public CurrencyExchangeRate: number;
    public ReconcilePayment: boolean;
    public DueDate: LocalDate;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public Description: string;
    public ID: number;
    public PaymentNotificationReportFileID: number;
    public StatusText: string;
    public UpdatedBy: string;
    public InvoiceNumber: string;
    public BankChargeAmount: number;
    public CustomerInvoiceID: number;
    public OcrPaymentStrings: string;
    public Proprietary: string;
    public UpdatedAt: Date;
    public SupplierInvoiceID: number;
    public AutoJournal: boolean;
    public PaymentID: string;
    public JournalEntryID: number;
    public ToBankAccountID: number;
    public PaymentCodeID: number;
    public PaymentBatchID: number;
    public ExternalBankAccountNumber: string;
    public CurrencyCodeID: number;
    public IsExternal: boolean;
    public PaymentStatusReportFileID: number;
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

    public PaymentFileID: number;
    public IsCustomerPayment: boolean;
    public CreatedAt: Date;
    public ReceiptDate: Date;
    public NumberOfPayments: number;
    public HashValue: string;
    public PaymentReferenceID: string;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public TotalAmount: number;
    public ID: number;
    public UpdatedBy: string;
    public OcrTransmissionNumber: number;
    public UpdatedAt: Date;
    public PaymentBatchTypeID: number;
    public OcrHeadingStrings: string;
    public TransferredDate: Date;
    public Camt054CMsgId: string;
    public PaymentStatusReportFileID: number;
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
    public CurrencyExchangeRate: number;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public JournalEntryLine1ID: number;
    public JournalEntryLine2ID: number;
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

    public CreatedAt: Date;
    public ProductID: number;
    public OwnCostShare: number;
    public OwnCostAmount: number;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public ReInvoicingType: number;
    public SupplierInvoiceID: number;
    public TaxInclusiveAmount: number;
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

    public ReInvoiceID: number;
    public CreatedAt: Date;
    public CustomerID: number;
    public Vat: number;
    public GrossAmount: number;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public ID: number;
    public UpdatedBy: string;
    public NetAmount: number;
    public UpdatedAt: Date;
    public Surcharge: number;
    public Share: number;
    public _createguid: string;
    public Customer: Customer;
    public CustomFields: any;
}


export class SupplierInvoice extends UniEntity {
    public static RelativeUrl = 'supplierinvoices';
    public static EntityType = 'SupplierInvoice';

    public ReInvoiced: boolean;
    public PaymentTermsID: number;
    public InvoiceReceiverName: string;
    public DeliveryTerm: string;
    public ReInvoiceID: number;
    public RestAmountCurrency: number;
    public CreatedAt: Date;
    public RestAmount: number;
    public Payment: string;
    public ShippingCountryCode: string;
    public SupplierOrgNumber: string;
    public InvoiceCity: string;
    public DeliveryDate: LocalDate;
    public InvoiceCountry: string;
    public CustomerPerson: string;
    public PaymentInformation: string;
    public TaxInclusiveAmountCurrency: number;
    public FreeTxt: string;
    public InvoiceCountryCode: string;
    public InvoiceAddressLine1: string;
    public InvoiceType: number;
    public PaymentStatus: number;
    public CurrencyExchangeRate: number;
    public CreditedAmountCurrency: number;
    public InvoiceOriginType: SupplierInvoiceOriginType;
    public ShippingAddressLine1: string;
    public ProjectID: number;
    public ShippingCity: string;
    public OurReference: string;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public BankAccountID: number;
    public YourReference: string;
    public ID: number;
    public Requisition: string;
    public DeliveryName: string;
    public InvoiceReferenceID: number;
    public SupplierID: number;
    public ShippingAddressLine2: string;
    public PaymentDueDate: LocalDate;
    public Comment: string;
    public UpdatedBy: string;
    public ShippingCountry: string;
    public InvoiceNumber: string;
    public TaxExclusiveAmountCurrency: number;
    public InvoicePostalCode: string;
    public InvoiceAddressLine2: string;
    public InvoiceAddressLine3: string;
    public IsSentToPayment: boolean;
    public UpdatedAt: Date;
    public SalesPerson: string;
    public DefaultDimensionsID: number;
    public PrintStatus: number;
    public CustomerOrgNumber: string;
    public Credited: boolean;
    public PayableRoundingAmount: number;
    public AmountRegards: string;
    public PaymentID: string;
    public CreditedAmount: number;
    public DeliveryTermsID: number;
    public VatTotalsAmount: number;
    public PaymentTerm: string;
    public PayableRoundingCurrencyAmount: number;
    public JournalEntryID: number;
    public ShippingPostalCode: string;
    public InvoiceDate: LocalDate;
    public TaxInclusiveAmount: number;
    public CreditDays: number;
    public TaxExclusiveAmount: number;
    public VatTotalsAmountCurrency: number;
    public CurrencyCodeID: number;
    public DeliveryMethod: string;
    public ShippingAddressLine3: string;
    public InternalNote: string;
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

    public SumTotalIncVatCurrency: number;
    public SumVatCurrency: number;
    public CreatedAt: Date;
    public ProductID: number;
    public InvoicePeriodEndDate: LocalDate;
    public AccountingCost: string;
    public DiscountPercent: number;
    public Unit: string;
    public DiscountCurrency: number;
    public CurrencyExchangeRate: number;
    public PriceExVat: number;
    public ItemText: string;
    public PriceIncVat: number;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public ID: number;
    public VatPercent: number;
    public Comment: string;
    public UpdatedBy: string;
    public InvoicePeriodStartDate: LocalDate;
    public NumberOfItems: number;
    public PriceSetByUser: boolean;
    public UpdatedAt: Date;
    public VatTypeID: number;
    public SumVat: number;
    public Discount: number;
    public SupplierInvoiceID: number;
    public SumTotalExVat: number;
    public DimensionsID: number;
    public SortIndex: number;
    public SumTotalIncVat: number;
    public CalculateGrossPriceBasedOnNetPrice: boolean;
    public CurrencyCodeID: number;
    public PriceExVatCurrency: number;
    public SumTotalExVatCurrency: number;
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
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public ID: number;
    public UpdatedBy: string;
    public Name: string;
    public UpdatedAt: Date;
    public No: string;
    public _createguid: string;
    public CustomFields: any;
}


export class VatDeduction extends UniEntity {
    public static RelativeUrl = 'vatdeductions';
    public static EntityType = 'VatDeduction';

    public CreatedAt: Date;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public ID: number;
    public UpdatedBy: string;
    public DeductionPercent: number;
    public UpdatedAt: Date;
    public ValidTo: LocalDate;
    public ValidFrom: LocalDate;
    public VatDeductionGroupID: number;
    public _createguid: string;
    public VatDeductionGroup: VatDeductionGroup;
    public CustomFields: any;
}


export class VatDeductionGroup extends UniEntity {
    public static RelativeUrl = 'vatdeductiongroups';
    public static EntityType = 'VatDeductionGroup';

    public CreatedAt: Date;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public ID: number;
    public UpdatedBy: string;
    public Name: string;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class VatPost extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'VatPost';

    public ReportAsNegativeAmount: boolean;
    public CreatedAt: Date;
    public HasTaxAmount: boolean;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public ID: number;
    public UpdatedBy: string;
    public Name: string;
    public UpdatedAt: Date;
    public No: string;
    public HasTaxBasis: boolean;
    public VatCodeGroupID: number;
    public _createguid: string;
    public VatCodeGroup: VatCodeGroup;
    public VatReportReferences: Array<VatReportReference>;
    public CustomFields: any;
}


export class VatReport extends UniEntity {
    public static RelativeUrl = 'vatreports';
    public static EntityType = 'VatReport';

    public CreatedAt: Date;
    public TerminPeriodID: number;
    public ExternalRefNo: string;
    public ReportedDate: Date;
    public VatReportArchivedSummaryID: number;
    public InternalComment: string;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public ID: number;
    public Comment: string;
    public UpdatedBy: string;
    public Title: string;
    public UpdatedAt: Date;
    public ExecutedDate: Date;
    public VatReportTypeID: number;
    public JournalEntryID: number;
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

    public AmountToBePayed: number;
    public PaymentPeriod: string;
    public CreatedAt: Date;
    public AmountToBeReceived: number;
    public SummaryHeader: string;
    public PaymentYear: number;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public ID: number;
    public PaymentToDescription: string;
    public PaymentDueDate: Date;
    public UpdatedBy: string;
    public ReportName: string;
    public UpdatedAt: Date;
    public PaymentID: string;
    public PaymentBankAccountNumber: string;
    public _createguid: string;
    public CustomFields: any;
}


export class VatReportReference extends UniEntity {
    public static RelativeUrl = 'vatreportreferences';
    public static EntityType = 'VatReportReference';

    public CreatedAt: Date;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public ID: number;
    public AccountID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public VatTypeID: number;
    public VatPostID: number;
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
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public ID: number;
    public UpdatedBy: string;
    public Name: string;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class VatType extends UniEntity {
    public static RelativeUrl = 'vattypes';
    public static EntityType = 'VatType';

    public Alias: string;
    public OutputVat: boolean;
    public Locked: boolean;
    public VatTypeSetupID: number;
    public IncomingAccountID: number;
    public CreatedAt: Date;
    public VatCodeGroupingValue: VatCodeGroupingValueEnum;
    public Visible: boolean;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public ID: number;
    public InUse: boolean;
    public UpdatedBy: string;
    public Name: string;
    public UpdatedAt: Date;
    public ReversedTaxDutyVat: boolean;
    public VatCode: string;
    public OutgoingAccountID: number;
    public AvailableInModules: boolean;
    public VatCodeGroupID: number;
    public DirectJournalEntryOnly: boolean;
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

    public CreatedAt: Date;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public ID: number;
    public VatPercent: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public VatTypeID: number;
    public ValidTo: LocalDate;
    public ValidFrom: LocalDate;
    public _createguid: string;
    public CustomFields: any;
}


export class EntityValidationRule extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'EntityValidationRule';

    public OnConflict: OnConflict;
    public CreatedAt: Date;
    public Operation: OperationType;
    public Deleted: boolean;
    public CreatedBy: string;
    public Message: string;
    public ID: number;
    public UpdatedBy: string;
    public Value: string;
    public UpdatedAt: Date;
    public EntityType: string;
    public SyncKey: string;
    public Level: ValidationLevel;
    public Operator: Operator;
    public System: boolean;
    public PropertyName: string;
    public ChangedByCompany: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class EntityValidationRuleTemplate extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'EntityValidationRuleTemplate';

    public OnConflict: OnConflict;
    public CreatedAt: Date;
    public Operation: OperationType;
    public Deleted: boolean;
    public CreatedBy: string;
    public Message: string;
    public ID: number;
    public UpdatedBy: string;
    public Value: string;
    public UpdatedAt: Date;
    public EntityType: string;
    public SyncKey: string;
    public Level: ValidationLevel;
    public Operator: Operator;
    public System: boolean;
    public PropertyName: string;
    public ChangedByCompany: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class ComplexValidationRule extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ComplexValidationRule';

    public OnConflict: OnConflict;
    public CreatedAt: Date;
    public ValidationCode: number;
    public Operation: OperationType;
    public Deleted: boolean;
    public CreatedBy: string;
    public Message: string;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public EntityType: string;
    public SyncKey: string;
    public Level: ValidationLevel;
    public System: boolean;
    public ChangedByCompany: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class ComplexValidationRuleTemplate extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ComplexValidationRuleTemplate';

    public OnConflict: OnConflict;
    public CreatedAt: Date;
    public ValidationCode: number;
    public Operation: OperationType;
    public Deleted: boolean;
    public CreatedBy: string;
    public Message: string;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public EntityType: string;
    public SyncKey: string;
    public Level: ValidationLevel;
    public System: boolean;
    public ChangedByCompany: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class CustomField extends UniEntity {
    public static RelativeUrl = 'custom-fields';
    public static EntityType = 'CustomField';

    public CreatedAt: Date;
    public ModelID: number;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public ID: number;
    public UpdatedBy: string;
    public Name: string;
    public UpdatedAt: Date;
    public DataType: string;
    public Nullable: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class ValueList extends UniEntity {
    public static RelativeUrl = 'valuelists';
    public static EntityType = 'ValueList';

    public CreatedAt: Date;
    public Deleted: boolean;
    public CreatedBy: string;
    public Description: string;
    public ID: number;
    public UpdatedBy: string;
    public Name: string;
    public UpdatedAt: Date;
    public Code: string;
    public _createguid: string;
    public Items: Array<ValueItem>;
    public CustomFields: any;
}


export class ValueItem extends UniEntity {
    public static RelativeUrl = 'valueitems';
    public static EntityType = 'ValueItem';

    public CreatedAt: Date;
    public Index: number;
    public Deleted: boolean;
    public CreatedBy: string;
    public Description: string;
    public ID: number;
    public UpdatedBy: string;
    public Name: string;
    public ValueListID: number;
    public Value: string;
    public UpdatedAt: Date;
    public Code: string;
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

    public Alignment: Alignment;
    public Label: string;
    public ValueList: string;
    public HelpText: string;
    public CreatedAt: Date;
    public ReadOnly: boolean;
    public LineBreak: boolean;
    public LookupEntityType: string;
    public FieldType: FieldType;
    public DisplayField: string;
    public Width: string;
    public LookupField: boolean;
    public FieldSet: number;
    public Section: number;
    public Placeholder: string;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public Description: string;
    public ID: number;
    public Hidden: boolean;
    public Url: string;
    public UpdatedBy: string;
    public Placement: number;
    public Combo: number;
    public UpdatedAt: Date;
    public Sectionheader: string;
    public EntityType: string;
    public Options: string;
    public Property: string;
    public Legend: string;
    public ComponentLayoutID: number;
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
    public WeekDay: number;
    public Date: Date;
    public StartTime: Date;
    public Projecttime: number;
    public EndTime: Date;
    public WeekNumber: number;
    public Flextime: number;
    public ExpectedTime: number;
    public TotalTime: number;
    public ValidTime: number;
    public Overtime: number;
    public Workflow: TimesheetWorkflow;
    public SickTime: number;
    public ValidTimeOff: number;
    public Invoicable: number;
    public TimeOff: number;
    public Status: WorkStatus;
    public IsWeekend: boolean;
}


export class WorkBalanceDto extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'WorkBalanceDto';

    public BalanceFrom: Date;
    public CreatedAt: Date;
    public ExpectedMinutes: number;
    public ActualMinutes: number;
    public LastDayActual: number;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public Description: string;
    public ID: number;
    public BalanceDate: Date;
    public Minutes: number;
    public Balancetype: WorkBalanceTypeEnum;
    public UpdatedBy: string;
    public SumOvertime: number;
    public UpdatedAt: Date;
    public IsStartBalance: boolean;
    public WorkRelationID: number;
    public ValidTimeOff: number;
    public ValidFrom: Date;
    public Days: number;
    public LastDayExpected: number;
    public _createguid: string;
    public Previous: BalanceInfo;
    public Details: Array<FlexDetail>;
    public WorkRelation: WorkRelation;
    public CustomFields: any;
}


export class BalanceInfo extends UniEntity {
    public Description: string;
    public ID: number;
    public BalanceDate: Date;
    public Minutes: number;
}


export class FlexDetail extends UniEntity {
    public Date: Date;
    public ExpectedMinutes: number;
    public WorkedMinutes: number;
    public ValidTimeOff: number;
    public IsWeekend: boolean;
}


export class ContactSearchServiceResponse extends UniEntity {
    public Method: string;
    public Success: boolean;
    public ObjectName: string;
    public ErrorMessage: string;
    public ErrorCode: number;
}


export class InvoicesAndRemindersReadyToRemind extends UniEntity {
    public CustomerInvoiceReminderID: number;
    public RestAmountCurrency: number;
    public RestAmount: number;
    public CustomerID: number;
    public CustomerName: string;
    public TaxInclusiveAmountCurrency: number;
    public CurrencyExchangeRate: number;
    public ExternalReference: string;
    public DueDate: Date;
    public StatusCode: number;
    public EmailAddress: string;
    public Interest: number;
    public InvoiceNumber: number;
    public CustomerInvoiceID: number;
    public ReminderNumber: number;
    public CurrencyCodeShortCode: string;
    public InvoiceDate: Date;
    public TaxInclusiveAmount: number;
    public CustomerNumber: number;
    public Fee: number;
    public DontSendReminders: boolean;
    public CurrencyCodeCode: string;
    public CurrencyCodeID: number;
}


export class TradeHeaderCalculationSummary extends UniEntity {
    public SumTotalIncVatCurrency: number;
    public SumDiscountCurrency: number;
    public SumDiscount: number;
    public SumVatCurrency: number;
    public DecimalRoundingCurrency: number;
    public SumNoVatBasisCurrency: number;
    public SumVatBasis: number;
    public SumVatBasisCurrency: number;
    public DecimalRounding: number;
    public SumVat: number;
    public SumTotalExVat: number;
    public SumNoVatBasis: number;
    public SumTotalIncVat: number;
    public SumTotalExVatCurrency: number;
}


export class VatCalculationSummary extends UniEntity {
    public SumVatCurrency: number;
    public VatPercent: number;
    public SumVatBasis: number;
    public SumVatBasisCurrency: number;
    public SumVat: number;
}


export class InvoicePaymentData extends UniEntity {
    public BankChargeAccountID: number;
    public AmountCurrency: number;
    public AgioAccountID: number;
    public PaymentDate: LocalDate;
    public FromBankAccountID: number;
    public Amount: number;
    public CurrencyExchangeRate: number;
    public AccountID: number;
    public BankChargeAmount: number;
    public AgioAmount: number;
    public PaymentID: string;
    public DimensionsID: number;
    public CurrencyCodeID: number;
}


export class InvoiceSummary extends UniEntity {
    public SumTotalAmount: number;
    public SumRestAmount: number;
    public SumCreditedAmount: number;
}


export class CustomerNoAndName extends UniEntity {
    public Name: string;
    public Number: string;
}


export class InvoicePayment extends UniEntity {
    public AmountCurrency: number;
    public Amount: number;
    public JournalEntryNumber: string;
    public Description: string;
    public FinancialDate: LocalDate;
    public JournalEntryLineID: number;
    public JournalEntryID: number;
}


export class OrderOffer extends UniEntity {
    public CostPercentage: number;
    public Message: string;
    public OrderId: string;
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
    public Currency: string;
    public Amount: number;
}


export class Limits extends UniEntity {
    public MaxInvoiceAmount: number;
    public RemainingLimit: number;
    public Limit: number;
}


export class AmeldingAgaAndTaxSums extends UniEntity {
    public EmploymentTax: number;
    public MessageID: string;
    public KIDEmploymentTax: string;
    public KIDTaxDraw: string;
    public KIDFinancialTax: string;
    public KIDGarnishment: string;
    public DueDate: Date;
    public period: number;
    public GarnishmentTax: number;
    public FinancialTax: number;
    public TaxDraw: number;
    public AccountNumber: string;
}


export class PayrollRunInAmeldingPeriod extends UniEntity {
    public CanGenerateAddition: boolean;
    public PayrollrunID: number;
    public AmeldingSentdate: Date;
    public PayrollrunPaydate: Date;
    public PayrollrunDescription: string;
}


export class PayAgaTaxDTO extends UniEntity {
    public payAga: boolean;
    public payDate: Date;
    public payGarnishment: boolean;
    public correctPennyDiff: boolean;
    public payFinancialTax: boolean;
    public payTaxDraw: boolean;
}


export class AmeldingSumUp extends UniEntity {
    public LegalEntityNo: string;
    public altInnStatus: string;
    public meldingsID: string;
    public ReplacesAMeldingID: number;
    public Replaces: string;
    public period: number;
    public ID: number;
    public year: number;
    public generated: Date;
    public sent: Date;
    public status: AmeldingStatus;
    public type: AmeldingType;
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
    public endDate: Date;
    public arbeidsforholdId: string;
    public startDate: Date;
    public type: string;
    public permisjon: Array<EmploymentLeaves>;
}


export class EmploymentLeaves extends UniEntity {
    public permisjonsprosent: string;
    public startdato: Date;
    public beskrivelse: string;
    public sluttdato: Date;
    public permisjonsId: string;
}


export class TransactionTypes extends UniEntity {
    public Base_EmploymentTax: boolean;
    public incomeType: string;
    public tax: boolean;
    public amount: number;
    public description: string;
    public benefit: string;
}


export class AGADetails extends UniEntity {
    public baseAmount: number;
    public sectorName: string;
    public zoneName: string;
    public rate: number;
    public type: string;
}


export class Totals extends UniEntity {
    public sumAGA: number;
    public sumTax: number;
    public sumUtleggstrekk: number;
}


export class AnnualStatement extends UniEntity {
    public EmployerCountryCode: string;
    public EmployeeCity: string;
    public EmployerEmail: string;
    public EmployerPostCode: string;
    public EmployeeNumber: number;
    public EmployeeAddress: string;
    public EmployeeMunicipalName: string;
    public Year: number;
    public EmployerCity: string;
    public VacationPayBase: number;
    public EmployerName: string;
    public EmployeeName: string;
    public EmployeeSSn: string;
    public EmployerWebAddress: string;
    public EmployerCountry: string;
    public EmployerOrgNr: string;
    public EmployerTaxMandatory: boolean;
    public EmployerAddress: string;
    public EmployerPhoneNumber: string;
    public EmployeeMunicipalNumber: string;
    public EmployeePostCode: string;
    public Contributions: Array<AnnualStatementLine>;
    public PensionOrBenefits: Array<AnnualStatementLine>;
    public Deductions: Array<AnnualStatementLine>;
    public Draws: Array<AnnualStatementLine>;
}


export class AnnualStatementLine extends UniEntity {
    public IsDeduction: boolean;
    public Sum: number;
    public LineIndex: number;
    public Amount: number;
    public Description: string;
    public SupplementPackageName: string;
    public TaxReturnPost: string;
    public Supplements: Array<SupplementInfo>;
}


export class SupplementInfo extends UniEntity {
    public ValueDate2: Date;
    public WageTypeSupplementID: number;
    public ValueDate: Date;
    public ValueBool: boolean;
    public ValueType: Valuetype;
    public Name: string;
    public ValueString: string;
    public ValueMoney: number;
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
    public IsJob: boolean;
    public Text: string;
    public Title: string;
    public mainStatus: string;
    public employeestatus: Array<EmployeeStatus>;
}


export class EmployeeStatus extends UniEntity {
    public info: string;
    public employeeNumber: number;
    public year: number;
    public ssn: string;
    public status: string;
    public employeeID: number;
    public changedFields: Array<FieldsChanged>;
}


export class FieldsChanged extends UniEntity {
    public valTo: string;
    public valFrom: string;
    public fieldName: string;
}


export class EmploymentHistoryRecord extends UniEntity {
    public RegulativeStepNr: number;
    public HourRate: number;
    public RegulativeGroupID: number;
    public ChangedAt: Date;
    public WorkPercent: number;
    public MonthRate: number;
}


export class CodeListRowsCodeListRow extends UniEntity {
    public Value1: string;
    public Value3: string;
    public Value2: string;
    public Code: string;
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
    public grossPayment: number;
    public netPayment: number;
    public employeeID: number;
}


export class SumOnYear extends UniEntity {
    public taxBase: number;
    public advancePayment: number;
    public grossPayment: number;
    public usedNonTaxableAmount: number;
    public nonTaxableAmount: number;
    public netPayment: number;
    public baseVacation: number;
    public sumTax: number;
    public pension: number;
    public employeeID: number;
    public paidHolidaypay: number;
}


export class VacationPayLastYear extends UniEntity {
    public baseVacation: number;
    public employeeID: number;
    public paidHolidayPay: number;
}


export class SalaryTransactionPay extends UniEntity {
    public Withholding: number;
    public PaymentDate: Date;
    public TaxBankAccountID: number;
    public CompanyAddress: string;
    public CompanyPostalCode: string;
    public CompanyCity: string;
    public SalaryBankAccountID: number;
    public CompanyBankAccountID: number;
    public CompanyName: string;
    public PayList: Array<SalaryTransactionPayLine>;
    public SalaryBalancePayList: Array<SalaryBalancePayLine>;
}


export class SalaryTransactionPayLine extends UniEntity {
    public PostalCode: string;
    public EmployeeNumber: number;
    public Address: string;
    public Tax: number;
    public Account: string;
    public City: string;
    public NetPayment: number;
    public EmployeeName: string;
}


export class SalaryBalancePayLine extends UniEntity {
    public Sum: number;
    public Text: string;
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
    public Subject: string;
    public GroupByWageType: boolean;
    public Message: string;
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
    public ToPeriod: number;
    public BookedPayruns: number;
    public Year: number;
    public FromPeriod: number;
    public CreatedPayruns: number;
    public CalculatedPayruns: number;
    public Groups: Array<ReconciliationGroup>;
}


export class ReconciliationGroup extends UniEntity {
    public Sum: number;
    public AccountNumber: string;
    public Lines: Array<ReconciliationLine>;
}


export class ReconciliationLine extends UniEntity {
    public HasEmploymentTax: boolean;
    public WageTypeNumber: number;
    public IncomeType: string;
    public Sum: number;
    public Description: string;
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
    public MemberNumber: string;
    public OUO: number;
    public UnionDraw: number;
    public Name: string;
    public Ensurance: number;
}


export class SalaryTransactionSums extends UniEntity {
    public calculatedVacationPay: number;
    public grossPayment: number;
    public netPayment: number;
    public tableTax: number;
    public baseVacation: number;
    public baseAGA: number;
    public manualTax: number;
    public paidPension: number;
    public paidAdvance: number;
    public Employee: number;
    public calculatedAGA: number;
    public calculatedFinancialTax: number;
    public Payrun: number;
    public basePercentTax: number;
    public baseTableTax: number;
    public percentTax: number;
}


export class SalaryTransactionPeriodSums extends UniEntity {
    public ToPeriod: number;
    public AgaRate: number;
    public MunicipalName: string;
    public Year: number;
    public AgaZone: string;
    public FromPeriod: number;
    public OrgNumber: string;
    public Sums: SalaryTransactionSums;
    public Aga: AGACalculation;
}


export class code extends UniEntity {
    public kunfranav: string;
    public gyldigtil: string;
    public utloeserArbeidsgiveravgift: string;
    public skatteOgAvgiftregel: string;
    public gyldigfom: string;
    public uninavn: string;
    public fordel: string;
    public inngaarIGrunnlagForTrekk: string;
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
    public IsTest: boolean;
    public TemplateCompanyKey: string;
    public ContractType: number;
    public LicenseKey: string;
    public ContractID: number;
    public CopyFiles: boolean;
    public ProductNames: string;
    public IsTemplate: boolean;
    public CompanyName: string;
    public CompanySettings: CompanySettings;
}


export class UserDto extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'UserDto';

    public LastLogin: Date;
    public CreatedAt: Date;
    public DisplayName: string;
    public Email: string;
    public PermissionHandling: string;
    public GlobalIdentity: string;
    public Protected: boolean;
    public IsAutobankAdmin: boolean;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public ID: number;
    public UserName: string;
    public UpdatedBy: string;
    public PhoneNumber: string;
    public UpdatedAt: Date;
    public HasAgreedToImportDisclaimer: boolean;
    public BankIntegrationUserName: string;
    public EndDate: Date;
    public TwoFactorEnabled: boolean;
    public AuthPhoneNumber: string;
    public _createguid: string;
    public License: UserLicenseInformation;
    public CustomFields: any;
}


export class UserLicenseInformation extends UniEntity {
    public GlobalIdentity: string;
    public Comment: string;
    public Name: string;
    public UserLicenseEndDate: Date;
    public UserLicenseKey: string;
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
    public TypeID: number;
    public EndDate: Date;
    public TypeName: string;
}


export class CompanyLicenseInfomation extends UniEntity {
    public EndDate: Date;
    public StatusCode: LicenseEntityStatus;
    public ID: number;
    public ContractID: number;
    public Key: string;
    public Name: string;
    public ContactEmail: string;
    public ContactPerson: string;
    public Agency: Agency;
}


export class Agency extends UniEntity {
    public Name: string;
    public CompanyKey: string;
}


export class ContractLicenseType extends UniEntity {
    public TypeID: number;
    public TrialExpiration: Date;
    public TypeName: string;
    public StartDate: Date;
}


export class LicenseAgreementInfo extends UniEntity {
    public AgreementId: number;
    public HasAgreedToLicense: boolean;
}


export class CreateBankUserDTO extends UniEntity {
    public AdminUserId: number;
    public Phone: string;
    public AdminPassword: string;
    public IsAdmin: boolean;
    public Password: string;
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
    public ValidTo: Date;
    public ValidFrom: Date;
    public Status: ChallengeRequestResult;
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
    public IncludeInfoPerPerson: boolean;
    public ReportType: ReportType;
    public FromPeriod: Maaned;
    public IncludeEmployments: boolean;
    public IncludeIncome: boolean;
}


export class A07Response extends UniEntity {
    public Data: string;
    public Text: string;
    public Title: string;
    public mainStatus: string;
    public DataName: string;
    public DataType: string;
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
    public IntegrationKey: string;
    public ExternalId: string;
}


export class CurrencyRateData extends UniEntity {
    public Factor: number;
    public ExchangeRate: number;
    public IsOverrideRate: boolean;
    public RateDate: LocalDate;
    public RateDateOld: LocalDate;
    public ExchangeRateOld: number;
    public FromCurrencyCode: CurrencyCode;
}


export class EmailDTO extends UniEntity {
    public Subject: string;
    public FromAddress: string;
    public CopyAddress: string;
    public Message: string;
    public Format: string;
    public ReportID: number;
    public Parameters: Array<ReportParameter>;
}


export class ReportParameter extends UniEntity {
    public Name: string;
    public Value: string;
}


export class DistributionPlanElementValidation extends UniEntity {
    public Priority: number;
    public IsValid: boolean;
    public ElementTypeName: string;
    public ElementType: DistributionPlanElementTypes;
    public PlanElement: DistributionPlanElement;
}


export class SendEmail extends UniEntity {
    public Subject: string;
    public FromAddress: string;
    public CopyAddress: string;
    public ExternalReference: string;
    public Message: string;
    public ReportName: string;
    public ReportID: number;
    public EntityType: string;
    public EntityID: number;
    public Localization: string;
    public Attachments: Array<SendEmailAttachment>;
    public Parameters: Array<ReportParameter>;
}


export class SendEmailAttachment extends UniEntity {
    public FileName: string;
    public FileID: number;
    public Attachment: string;
}


export class RssList extends UniEntity {
    public Description: string;
    public Url: string;
    public Title: string;
    public Items: Array<RssItem>;
}


export class RssItem extends UniEntity {
    public Link: string;
    public Description: string;
    public PubDate: string;
    public Title: string;
    public Guid: string;
    public Category: string;
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
    public ExpectedMinutes: number;
    public ReportBalance: number;
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
    public orgname: string;
    public contactname: string;
    public contactphone: string;
    public orgno: string;
    public contactemail: string;
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

    public journalEntryLineDraftID: number;
    public CreatedAt: Date;
    public MissingRequiredDimensionsMessage: string;
    public MissingOnlyWarningsDimensionsMessage: string;
    public Deleted: boolean;
    public CreatedBy: string;
    public StatusCode: number;
    public ID: number;
    public AccountID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public AccountNumber: string;
    public DimensionsID: number;
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
    public CurrentValue: number;
    public Lifetime: number;
    public BalanceAccountName: string;
    public LastDepreciation: LocalDate;
    public DepreciationAccountNumber: number;
    public Name: string;
    public GroupCode: string;
    public BalanceAccountNumber: number;
    public GroupName: string;
    public Number: number;
    public Lines: Array<AssetReportLineDTO>;
}


export class AssetReportLineDTO extends UniEntity {
    public TypeID: number;
    public Date: LocalDate;
    public Value: number;
    public Type: string;
}


export class BankBalanceDto extends UniEntity {
    public Date: Date;
    public Comment: string;
    public BalanceBooked: number;
    public BalanceAvailable: number;
    public AccountNumber: string;
    public IsTestData: boolean;
}


export class BankData extends UniEntity {
    public IBAN: string;
    public AccountNumber: string;
    public Bank: Bank;
}


export class CreateBankIntegrationDTO extends UniEntity {
    public TuserName: string;
    public BankApproval: boolean;
    public IsInbound: boolean;
    public ServiceProvider: number;
    public DisplayName: string;
    public IsOutgoing: boolean;
    public Email: string;
    public Phone: string;
    public BankAccountID: number;
    public BankAcceptance: boolean;
    public UserName: string;
    public Password: string;
    public IsBankStatement: boolean;
    public IsBankBalance: boolean;
    public RequireTwoStage: boolean;
    public Bank: string;
    public BankAccounts: Array<BankAccountDTO>;
}


export class BankAccountDTO extends UniEntity {
    public IBAN: string;
    public IsInbound: boolean;
    public IsOutgoing: boolean;
    public IsBankStatement: boolean;
    public IsBankBalance: boolean;
    public Bic: string;
    public BBAN: string;
}


export class ZdataUpdateBankProperties extends UniEntity {
    public IsInbound: boolean;
    public IsOutgoing: boolean;
    public ServiceID: string;
    public Password: string;
    public IsBankStatement: boolean;
    public IsBankBalance: boolean;
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
    public Date: Date;
    public IsBankEntry: boolean;
    public Amount: number;
    public Closed: boolean;
    public ID: number;
}


export class MatchSettings extends UniEntity {
    public MaxDelta: number;
    public MaxDayOffset: number;
}


export class ReconciliationStatus extends UniEntity {
    public NumberOfUnReconciled: number;
    public TotalAmount: number;
    public AccountID: number;
    public NumberOfItems: number;
    public IsReconciled: boolean;
    public Todate: Date;
    public FromDate: Date;
    public TotalUnreconciled: number;
}


export class BalanceDto extends UniEntity {
    public Balance: number;
    public EndDate: Date;
    public BalanceInStatement: number;
    public StartDate: Date;
}


export class BankfileFormat extends UniEntity {
    public CustomFormat: BankFileCustomFormat;
    public IsFixed: boolean;
    public SkipRows: number;
    public LinePrefix: string;
    public IsXml: boolean;
    public Separator: string;
    public Name: string;
    public FileExtension: string;
    public Columns: Array<BankfileColumn>;
}


export class BankfileColumn extends UniEntity {
    public FieldMapping: BankfileField;
    public Length: number;
    public IsFallBack: boolean;
    public DataType: BankfileDataType;
    public StartPos: number;
}


export class JournalSuggestion extends UniEntity {
    public Amount: number;
    public MatchWithEntryID: number;
    public Description: string;
    public AccountID: number;
    public FinancialDate: LocalDate;
    public BankStatementRuleID: number;
    public Account: Account;
}


export class ReportRow extends UniEntity {
    public BudPeriod2: number;
    public SumPeriod: number;
    public AccountName: string;
    public SumPeriodAccumulated: number;
    public SumPeriodLastYear: number;
    public BudPeriod11: number;
    public BudPeriod7: number;
    public BudPeriod12: number;
    public Period6: number;
    public BudPeriod3: number;
    public Period3: number;
    public Sum: number;
    public IsSubTotal: boolean;
    public SumLastYear: number;
    public SubGroupNumber: number;
    public Period1: number;
    public BudPeriod9: number;
    public Period7: number;
    public ID: number;
    public Period9: number;
    public GroupNumber: number;
    public SumPeriodLastYearAccumulated: number;
    public BudgetSum: number;
    public BudPeriod1: number;
    public Period4: number;
    public BudPeriod8: number;
    public PrecedingBalance: number;
    public Period8: number;
    public Period12: number;
    public SubGroupName: string;
    public BudPeriod10: number;
    public BudPeriod4: number;
    public AccountNumber: number;
    public AccountYear: number;
    public BudgetAccumulated: number;
    public Period11: number;
    public Period5: number;
    public BudPeriod6: number;
    public Period2: number;
    public GroupName: string;
    public BudPeriod5: number;
    public Period10: number;
}


export class BudgetImport extends UniEntity {
    public Budget: Budget;
}


export class LiquidityTableDTO extends UniEntity {
    public BankBalanceRefferance: BankBalanceType;
    public BankBalance: number;
    public OverdueCustomerInvoices: number;
    public OverdueSupplierInvoices: number;
    public Period: Array<DetailsDTO>;
}


export class DetailsDTO extends UniEntity {
    public Supplier: number;
    public Sum: number;
    public Liquidity: number;
    public VAT: number;
    public CustomPayments: number;
    public Custumer: number;
}


export class JournalEntryData extends UniEntity {
    public NumberSeriesID: number;
    public AmountCurrency: number;
    public SupplierInvoiceNo: string;
    public JournalEntryDataAccrualID: number;
    public Amount: number;
    public CurrencyExchangeRate: number;
    public JournalEntryNo: string;
    public VatDate: LocalDate;
    public DueDate: LocalDate;
    public CreditAccountID: number;
    public StatusCode: number;
    public Description: string;
    public PostPostJournalEntryLineID: number;
    public InvoiceNumber: string;
    public CustomerInvoiceID: number;
    public CreditVatTypeID: number;
    public FinancialDate: LocalDate;
    public DebitAccountNumber: number;
    public SupplierInvoiceID: number;
    public CreditAccountNumber: number;
    public DebitAccountID: number;
    public PaymentID: string;
    public DebitVatTypeID: number;
    public JournalEntryID: number;
    public VatDeductionPercent: number;
    public CustomerOrderID: number;
    public CurrencyID: number;
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
    public PeriodSumYear2: number;
    public PeriodNo: number;
    public PeriodSumYear1: number;
    public PeriodName: string;
}


export class JournalEntryLineRequestSummary extends UniEntity {
    public SumBalance: number;
    public SumCredit: number;
    public SumLedger: number;
    public SumTaxBasisAmount: number;
    public SumDebit: number;
}


export class JournalEntryLinePostPostData extends UniEntity {
    public JournalEntryTypeName: string;
    public RestAmountCurrency: number;
    public RestAmount: number;
    public MarkedAgainstJournalEntryLineID: number;
    public AmountCurrency: number;
    public NumberOfPayments: number;
    public Amount: number;
    public JournalEntryNumber: string;
    public SumPostPostAmount: number;
    public CurrencyExchangeRate: number;
    public DueDate: Date;
    public StatusCode: number;
    public Description: string;
    public PeriodNo: number;
    public ID: number;
    public SubAccountNumber: number;
    public InvoiceNumber: string;
    public FinancialDate: Date;
    public SumPostPostAmountCurrency: number;
    public MarkedAgainstJournalEntryNumber: string;
    public JournalEntryNumberNumeric: number;
    public AccountYear: number;
    public PaymentID: string;
    public JournalEntryID: number;
    public CurrencyCodeShortCode: string;
    public CurrencyCodeCode: string;
    public CurrencyCodeID: number;
    public SubAccountName: string;
    public Markings: Array<JournalEntryLinePostPostData>;
}


export class CreatePaymentBatchDTO extends UniEntity {
    public HashValue: string;
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
    public RestAmount: number;
    public AmountCurrency: number;
    public OriginalStatusCode: StatusCodeJournalEntryLine;
    public Amount: number;
    public JournalEntryNumber: string;
    public OriginalRestAmount: number;
    public StatusCode: StatusCodeJournalEntryLine;
    public ID: number;
    public InvoiceNumber: string;
    public FinancialDate: Date;
    public Markings: Array<MarkingReference>;
}


export class MarkingReference extends UniEntity {
    public JournalEntryNumber: string;
    public ID: number;
}


export class SupplierInvoiceDetail extends UniEntity {
    public AccountName: string;
    public AmountCurrency: number;
    public VatTypeName: string;
    public DeliveryDate: Date;
    public Amount: number;
    public Description: string;
    public AccountID: number;
    public SupplierID: number;
    public VatPercent: number;
    public InvoiceNumber: string;
    public VatTypeID: number;
    public VatCode: string;
    public SupplierInvoiceID: number;
    public AccountNumber: number;
    public InvoiceDate: Date;
}


export class VatReportMessage extends UniEntity {
    public Message: string;
    public Level: ValidationLevel;
}


export class VatReportSummary extends UniEntity {
    public VatCodeGroupNo: string;
    public HasTaxAmount: boolean;
    public NumberOfJournalEntryLines: number;
    public VatCodeGroupName: string;
    public IsHistoricData: boolean;
    public SumTaxBasisAmount: number;
    public HasTaxBasis: boolean;
    public VatCodeGroupID: number;
    public SumVatAmount: number;
}


export class VatReportSummaryPerPost extends UniEntity {
    public VatCodeGroupNo: string;
    public HasTaxAmount: boolean;
    public NumberOfJournalEntryLines: number;
    public VatCodeGroupName: string;
    public IsHistoricData: boolean;
    public VatPostID: number;
    public VatPostNo: string;
    public VatPostReportAsNegativeAmount: boolean;
    public VatPostName: string;
    public SumTaxBasisAmount: number;
    public HasTaxBasis: boolean;
    public VatCodeGroupID: number;
    public SumVatAmount: number;
}


export class VatReportSummaryPerPostPerAccount extends UniEntity {
    public VatAccountName: string;
    public VatAccountID: number;
    public VatCodeGroupNo: string;
    public HasTaxAmount: boolean;
    public Amount: number;
    public JournalEntryNumber: string;
    public TaxBasisAmount: number;
    public NumberOfJournalEntryLines: number;
    public VatCodeGroupName: string;
    public VatAccountNumber: number;
    public IsHistoricData: boolean;
    public VatDate: Date;
    public Description: string;
    public VatJournalEntryPostAccountNumber: number;
    public StdVatCode: string;
    public VatJournalEntryPostAccountName: string;
    public FinancialDate: Date;
    public VatJournalEntryPostAccountID: number;
    public VatCode: string;
    public VatPostID: number;
    public VatPostNo: string;
    public VatPostReportAsNegativeAmount: boolean;
    public VatPostName: string;
    public SumTaxBasisAmount: number;
    public HasTaxBasis: boolean;
    public VatCodeGroupID: number;
    public SumVatAmount: number;
}


export class VatReportNotReportedJournalEntryData extends UniEntity {
    public TerminPeriodID: number;
    public NumberOfJournalEntryLines: number;
    public SumTaxBasisAmount: number;
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


export enum TypeOfPaymentOtp{
    FixedSalary = 0,
    HourlyPay = 1,
    PaidOnCommission = 2,
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


export enum WorkingHoursScheme{
    notSet = 0,
    NonShift = 1,
    OffshoreWork = 2,
    ContinousShiftwork336 = 3,
    DayAndNightContinous355 = 4,
    ShiftWork = 5,
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


export enum UserVerificationUserType{
    Reader = 0,
    Admin = 1,
    Owner = 2,
    Support = 3,
}


export enum UserVerificationRequestOrigin{
    AppFrontend = 0,
    DeveloperPortal = 1,
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
