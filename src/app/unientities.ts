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
    public ID: number;
    public CreatedAt: Date;
    public Transaction: string;
    public CreatedBy: string;
    public Field: string;
    public Deleted: boolean;
    public EntityID: number;
    public UpdatedBy: string;
    public Action: string;
    public UpdatedAt: Date;
    public Route: string;
    public NewValue: string;
    public Verb: string;
    public ClientID: string;
    public OldValue: string;
    public _createguid: string;
    public CustomFields: any;
}


export class WorkBalance extends UniEntity {
    public static RelativeUrl = 'workbalances';
    public static EntityType = 'WorkBalance';

    public StatusCode: number;
    public ValidTimeOff: number;
    public ID: number;
    public CreatedAt: Date;
    public WorkRelationID: number;
    public CreatedBy: string;
    public IsStartBalance: boolean;
    public Deleted: boolean;
    public Description: string;
    public UpdatedBy: string;
    public ValidFrom: Date;
    public Days: number;
    public BalanceFrom: Date;
    public UpdatedAt: Date;
    public Balancetype: WorkBalanceTypeEnum;
    public Minutes: number;
    public BalanceDate: Date;
    public ExpectedMinutes: number;
    public ActualMinutes: number;
    public _createguid: string;
    public CustomFields: any;
}


export class Worker extends UniEntity {
    public static RelativeUrl = 'workers';
    public static EntityType = 'Worker';

    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public UserID: number;
    public Deleted: boolean;
    public UpdatedBy: string;
    public EmployeeID: number;
    public UpdatedAt: Date;
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

    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public PayrollTrackingID: number;
    public WorkRelationID: number;
    public CustomerID: number;
    public CreatedBy: string;
    public TransferedToOrder: boolean;
    public Deleted: boolean;
    public WorkItemGroupID: number;
    public OrderItemId: number;
    public Description: string;
    public EndTime: Date;
    public LunchInMinutes: number;
    public UpdatedBy: string;
    public MinutesToOrder: number;
    public UpdatedAt: Date;
    public Date: Date;
    public Invoiceable: boolean;
    public Minutes: number;
    public CustomerOrderID: number;
    public TransferedToPayroll: boolean;
    public StartTime: Date;
    public Label: string;
    public PriceExVat: number;
    public DimensionsID: number;
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

    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public WorkRelationID: number;
    public CreatedBy: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public _createguid: string;
    public WorkRelation: WorkRelation;
    public Items: Array<WorkItem>;
    public CustomFields: any;
}


export class WorkProfile extends UniEntity {
    public static RelativeUrl = 'workprofiles';
    public static EntityType = 'WorkProfile';

    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public MinutesPerWeek: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public IsShared: boolean;
    public MinutesPerYear: number;
    public LunchIncluded: boolean;
    public MinutesPerMonth: number;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class WorkRelation extends UniEntity {
    public static RelativeUrl = 'workrelations';
    public static EntityType = 'WorkRelation';

    public StatusCode: number;
    public IsPrivate: boolean;
    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public TeamID: number;
    public Deleted: boolean;
    public WorkPercentage: number;
    public WorkerID: number;
    public Description: string;
    public EndTime: Date;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public IsActive: boolean;
    public StartDate: Date;
    public CompanyID: number;
    public WorkProfileID: number;
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

    public StatusCode: number;
    public ID: number;
    public FromDate: Date;
    public CreatedAt: Date;
    public TimeoffType: number;
    public WorkRelationID: number;
    public CreatedBy: string;
    public ToDate: Date;
    public Deleted: boolean;
    public Description: string;
    public UpdatedBy: string;
    public RegionKey: string;
    public UpdatedAt: Date;
    public SystemKey: string;
    public IsHalfDay: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class WorkType extends UniEntity {
    public static RelativeUrl = 'worktypes';
    public static EntityType = 'WorkType';

    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public Price: number;
    public CreatedBy: string;
    public Deleted: boolean;
    public WagetypeNumber: number;
    public Description: string;
    public UpdatedBy: string;
    public ProductID: number;
    public UpdatedAt: Date;
    public SystemType: WorkTypeEnum;
    public Name: string;
    public _createguid: string;
    public Product: Product;
    public CustomFields: any;
}


export class BankFile extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'BankFile';

    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public Accountnumber: string;
    public SubCompanyID: number;
    public UpdatedBy: string;
    public FileID: number;
    public ParentFileid: number;
    public UpdatedAt: Date;
    public _createguid: string;
    public File: File;
    public SubCompany: SubCompany;
    public CustomFields: any;
}


export class BatchInvoice extends UniEntity {
    public static RelativeUrl = 'batchinvoices';
    public static EntityType = 'BatchInvoice';

    public StatusCode: number;
    public FreeTxt: string;
    public InvoiceDate: LocalDate;
    public ID: number;
    public CreatedAt: Date;
    public TotalToProcess: number;
    public NotifyEmail: boolean;
    public OurRef: string;
    public CreatedBy: string;
    public Comment: string;
    public Deleted: boolean;
    public MinAmount: number;
    public DueDate: LocalDate;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public YourRef: string;
    public Processed: number;
    public SellerID: number;
    public NumberOfBatches: number;
    public Operation: BatchInvoiceOperation;
    public CustomerID: number;
    public _createguid: string;
    public ProjectID: number;
    public Items: Array<BatchInvoiceItem>;
    public CustomFields: any;
}


export class BatchInvoiceItem extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'BatchInvoiceItem';

    public StatusCode: StatusCode;
    public ID: number;
    public CreatedAt: Date;
    public CustomerInvoiceID: number;
    public CreatedBy: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public CommentID: number;
    public BatchNumber: number;
    public UpdatedAt: Date;
    public CustomerOrderID: number;
    public BatchInvoiceID: number;
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

    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public EntityName: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public Template: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Customer extends UniEntity {
    public static RelativeUrl = 'customers';
    public static EntityType = 'Customer';

    public StatusCode: number;
    public IsPrivate: boolean;
    public CustomerNumberKidAlias: string;
    public DefaultCustomerQuoteReportID: number;
    public CustomerInvoiceReminderSettingsID: number;
    public ID: number;
    public CreatedAt: Date;
    public GLN: string;
    public DeliveryTermsID: number;
    public CreatedBy: string;
    public WebUrl: string;
    public AcceptableDelta4CustomerPayment: number;
    public CustomerNumber: number;
    public Deleted: boolean;
    public ReminderEmailAddress: string;
    public DefaultCustomerOrderReportID: number;
    public FactoringNumber: number;
    public OrgNumber: string;
    public DontSendReminders: boolean;
    public DefaultSellerID: number;
    public UpdatedBy: string;
    public CreditDays: number;
    public AvtaleGiro: boolean;
    public AvtaleGiroNotification: boolean;
    public AcceptableDelta4CustomerPaymentAccountID: number;
    public UpdatedAt: Date;
    public Localization: string;
    public PaymentTermsID: number;
    public SubAccountNumberSeriesID: number;
    public EfakturaIdentifier: string;
    public DefaultDistributionsID: number;
    public CurrencyCodeID: number;
    public SocialSecurityNumber: string;
    public DefaultCustomerInvoiceReportID: number;
    public EInvoiceAgreementReference: string;
    public PeppolAddress: string;
    public BusinessRelationID: number;
    public DimensionsID: number;
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

    public DeliveryDate: LocalDate;
    public StatusCode: number;
    public SalesPerson: string;
    public FreeTxt: string;
    public InvoiceDate: LocalDate;
    public UseReportID: number;
    public DistributionPlanID: number;
    public ID: number;
    public CreatedAt: Date;
    public RestAmount: number;
    public CurrencyExchangeRate: number;
    public PayableRoundingCurrencyAmount: number;
    public Requisition: string;
    public DeliveryName: string;
    public DeliveryTermsID: number;
    public CustomerID: number;
    public CustomerName: string;
    public ShippingAddressLine2: string;
    public CreatedBy: string;
    public DeliveryMethod: string;
    public PaymentInformation: string;
    public CreditedAmountCurrency: number;
    public CustomerPerson: string;
    public LastPaymentDate: LocalDate;
    public InvoiceNumberSeriesID: number;
    public PaymentID: string;
    public BankAccountID: number;
    public Comment: string;
    public InvoiceReceiverName: string;
    public Deleted: boolean;
    public ShippingCity: string;
    public PaymentInfoTypeID: number;
    public PrintStatus: number;
    public ExternalReference: string;
    public DeliveryTerm: string;
    public InvoiceType: number;
    public DontSendReminders: boolean;
    public InvoiceCity: string;
    public DefaultSellerID: number;
    public TaxExclusiveAmountCurrency: number;
    public UpdatedBy: string;
    public PayableRoundingAmount: number;
    public InternalNote: string;
    public VatTotalsAmountCurrency: number;
    public TaxInclusiveAmountCurrency: number;
    public DefaultDimensionsID: number;
    public InvoiceCountryCode: string;
    public UpdateCurrencyAmountsOnDateChange: boolean;
    public YourReference: string;
    public CreditDays: number;
    public Payment: string;
    public OurReference: string;
    public UpdatedAt: Date;
    public CustomerOrgNumber: string;
    public PaymentDueDate: LocalDate;
    public TaxInclusiveAmount: number;
    public AmountRegards: string;
    public ShippingCountryCode: string;
    public PaymentTermsID: number;
    public SupplierOrgNumber: string;
    public CurrencyCodeID: number;
    public InvoiceCountry: string;
    public InvoiceReferenceID: number;
    public CollectorStatusCode: number;
    public AccrualID: number;
    public RestAmountCurrency: number;
    public ExternalStatus: number;
    public InvoiceAddressLine1: string;
    public JournalEntryID: number;
    public ShippingPostalCode: string;
    public TaxExclusiveAmount: number;
    public InvoicePostalCode: string;
    public InvoiceNumber: string;
    public InvoiceAddressLine3: string;
    public ShippingAddressLine1: string;
    public PaymentTerm: string;
    public Credited: boolean;
    public ShippingCountry: string;
    public CreditedAmount: number;
    public VatTotalsAmount: number;
    public InvoiceAddressLine2: string;
    public ShippingAddressLine3: string;
    public EmailAddress: string;
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

    public SumTotalIncVat: number;
    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public CurrencyExchangeRate: number;
    public CustomerInvoiceID: number;
    public VatTypeID: number;
    public AccountingCost: string;
    public CreatedBy: string;
    public ItemText: string;
    public Comment: string;
    public Deleted: boolean;
    public SumVatCurrency: number;
    public ItemSourceID: number;
    public NumberOfItems: number;
    public Discount: number;
    public UpdatedBy: string;
    public InvoicePeriodStartDate: LocalDate;
    public VatPercent: number;
    public ProductID: number;
    public UpdatedAt: Date;
    public DiscountCurrency: number;
    public CalculateGrossPriceBasedOnNetPrice: boolean;
    public SumTotalExVatCurrency: number;
    public SumTotalExVat: number;
    public PriceExVatCurrency: number;
    public CurrencyCodeID: number;
    public SortIndex: number;
    public InvoicePeriodEndDate: LocalDate;
    public Unit: string;
    public DiscountPercent: number;
    public PriceIncVat: number;
    public AccountID: number;
    public PriceExVat: number;
    public CostPrice: number;
    public PriceSetByUser: boolean;
    public DimensionsID: number;
    public SumVat: number;
    public SumTotalIncVatCurrency: number;
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

    public Notified: boolean;
    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public RestAmount: number;
    public CurrencyExchangeRate: number;
    public CustomerInvoiceID: number;
    public CreatedByReminderRuleID: number;
    public CreatedBy: string;
    public DebtCollectionFeeCurrency: number;
    public Deleted: boolean;
    public ReminderNumber: number;
    public DueDate: LocalDate;
    public Description: string;
    public Title: string;
    public UpdatedBy: string;
    public RemindedDate: LocalDate;
    public UpdatedAt: Date;
    public ReminderFeeCurrency: number;
    public InterestFee: number;
    public CurrencyCodeID: number;
    public RestAmountCurrency: number;
    public InterestFeeCurrency: number;
    public RunNumber: number;
    public ReminderFee: number;
    public DebtCollectionFee: number;
    public DimensionsID: number;
    public EmailAddress: string;
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
    public CustomerInvoiceReminderSettingsID: number;
    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public MinimumDaysFromDueDate: number;
    public Deleted: boolean;
    public ReminderNumber: number;
    public Description: string;
    public Title: string;
    public UpdatedBy: string;
    public CreditDays: number;
    public UpdatedAt: Date;
    public UseMaximumLegalReminderFee: boolean;
    public ReminderFee: number;
    public _createguid: string;
    public CustomerInvoiceReminderSettings: CustomerInvoiceReminderSettings;
    public CustomFields: any;
}


export class CustomerInvoiceReminderSettings extends UniEntity {
    public static RelativeUrl = 'invoiceremindersettings';
    public static EntityType = 'CustomerInvoiceReminderSettings';

    public StatusCode: number;
    public DebtCollectionSettingsID: number;
    public ID: number;
    public CreatedAt: Date;
    public AcceptPaymentWithoutReminderFee: boolean;
    public CreatedBy: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public MinimumAmountToRemind: number;
    public DefaultReminderFeeAccountID: number;
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

    public DeliveryDate: LocalDate;
    public StatusCode: number;
    public SalesPerson: string;
    public FreeTxt: string;
    public UseReportID: number;
    public DistributionPlanID: number;
    public ID: number;
    public CreatedAt: Date;
    public RestExclusiveAmountCurrency: number;
    public CurrencyExchangeRate: number;
    public PayableRoundingCurrencyAmount: number;
    public Requisition: string;
    public DeliveryName: string;
    public DeliveryTermsID: number;
    public CustomerID: number;
    public CustomerName: string;
    public ShippingAddressLine2: string;
    public CreatedBy: string;
    public DeliveryMethod: string;
    public CustomerPerson: string;
    public OrderNumberSeriesID: number;
    public Comment: string;
    public InvoiceReceiverName: string;
    public Deleted: boolean;
    public ShippingCity: string;
    public PaymentInfoTypeID: number;
    public PrintStatus: number;
    public DeliveryTerm: string;
    public InvoiceCity: string;
    public DefaultSellerID: number;
    public TaxExclusiveAmountCurrency: number;
    public UpdatedBy: string;
    public PayableRoundingAmount: number;
    public InternalNote: string;
    public VatTotalsAmountCurrency: number;
    public TaxInclusiveAmountCurrency: number;
    public DefaultDimensionsID: number;
    public InvoiceCountryCode: string;
    public UpdateCurrencyAmountsOnDateChange: boolean;
    public YourReference: string;
    public CreditDays: number;
    public OurReference: string;
    public UpdatedAt: Date;
    public CustomerOrgNumber: string;
    public TaxInclusiveAmount: number;
    public ShippingCountryCode: string;
    public PaymentTermsID: number;
    public SupplierOrgNumber: string;
    public CurrencyCodeID: number;
    public UpdateCurrencyOnToInvoice: boolean;
    public InvoiceCountry: string;
    public OrderDate: LocalDate;
    public AccrualID: number;
    public RestAmountCurrency: number;
    public InvoiceAddressLine1: string;
    public ShippingPostalCode: string;
    public TaxExclusiveAmount: number;
    public InvoicePostalCode: string;
    public InvoiceAddressLine3: string;
    public ShippingAddressLine1: string;
    public ReadyToInvoice: boolean;
    public PaymentTerm: string;
    public ShippingCountry: string;
    public VatTotalsAmount: number;
    public InvoiceAddressLine2: string;
    public OrderNumber: number;
    public ShippingAddressLine3: string;
    public EmailAddress: string;
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

    public SumTotalIncVat: number;
    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public CurrencyExchangeRate: number;
    public VatTypeID: number;
    public CreatedBy: string;
    public ItemText: string;
    public Comment: string;
    public Deleted: boolean;
    public SumVatCurrency: number;
    public ItemSourceID: number;
    public NumberOfItems: number;
    public Discount: number;
    public UpdatedBy: string;
    public VatPercent: number;
    public ProductID: number;
    public UpdatedAt: Date;
    public DiscountCurrency: number;
    public CalculateGrossPriceBasedOnNetPrice: boolean;
    public SumTotalExVatCurrency: number;
    public SumTotalExVat: number;
    public PriceExVatCurrency: number;
    public CurrencyCodeID: number;
    public SortIndex: number;
    public Unit: string;
    public DiscountPercent: number;
    public CustomerOrderID: number;
    public PriceIncVat: number;
    public ReadyToInvoice: boolean;
    public AccountID: number;
    public PriceExVat: number;
    public CostPrice: number;
    public PriceSetByUser: boolean;
    public DimensionsID: number;
    public SumVat: number;
    public SumTotalIncVatCurrency: number;
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

    public DeliveryDate: LocalDate;
    public StatusCode: number;
    public SalesPerson: string;
    public FreeTxt: string;
    public UseReportID: number;
    public DistributionPlanID: number;
    public ID: number;
    public CreatedAt: Date;
    public CurrencyExchangeRate: number;
    public PayableRoundingCurrencyAmount: number;
    public Requisition: string;
    public DeliveryName: string;
    public ValidUntilDate: LocalDate;
    public DeliveryTermsID: number;
    public CustomerID: number;
    public CustomerName: string;
    public ShippingAddressLine2: string;
    public CreatedBy: string;
    public DeliveryMethod: string;
    public CustomerPerson: string;
    public InquiryReference: number;
    public Comment: string;
    public InvoiceReceiverName: string;
    public Deleted: boolean;
    public ShippingCity: string;
    public PaymentInfoTypeID: number;
    public PrintStatus: number;
    public DeliveryTerm: string;
    public QuoteDate: LocalDate;
    public InvoiceCity: string;
    public DefaultSellerID: number;
    public TaxExclusiveAmountCurrency: number;
    public UpdatedBy: string;
    public PayableRoundingAmount: number;
    public InternalNote: string;
    public VatTotalsAmountCurrency: number;
    public TaxInclusiveAmountCurrency: number;
    public DefaultDimensionsID: number;
    public InvoiceCountryCode: string;
    public UpdateCurrencyAmountsOnDateChange: boolean;
    public YourReference: string;
    public CreditDays: number;
    public OurReference: string;
    public UpdatedAt: Date;
    public CustomerOrgNumber: string;
    public TaxInclusiveAmount: number;
    public QuoteNumberSeriesID: number;
    public ShippingCountryCode: string;
    public PaymentTermsID: number;
    public SupplierOrgNumber: string;
    public CurrencyCodeID: number;
    public UpdateCurrencyOnToInvoice: boolean;
    public InvoiceCountry: string;
    public InvoiceAddressLine1: string;
    public ShippingPostalCode: string;
    public TaxExclusiveAmount: number;
    public QuoteNumber: number;
    public InvoicePostalCode: string;
    public InvoiceAddressLine3: string;
    public ShippingAddressLine1: string;
    public UpdateCurrencyOnToOrder: boolean;
    public PaymentTerm: string;
    public ShippingCountry: string;
    public VatTotalsAmount: number;
    public InvoiceAddressLine2: string;
    public ShippingAddressLine3: string;
    public EmailAddress: string;
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

    public SumTotalIncVat: number;
    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public CurrencyExchangeRate: number;
    public VatTypeID: number;
    public CreatedBy: string;
    public ItemText: string;
    public Comment: string;
    public Deleted: boolean;
    public SumVatCurrency: number;
    public NumberOfItems: number;
    public Discount: number;
    public UpdatedBy: string;
    public VatPercent: number;
    public CustomerQuoteID: number;
    public ProductID: number;
    public UpdatedAt: Date;
    public DiscountCurrency: number;
    public CalculateGrossPriceBasedOnNetPrice: boolean;
    public SumTotalExVatCurrency: number;
    public SumTotalExVat: number;
    public PriceExVatCurrency: number;
    public CurrencyCodeID: number;
    public SortIndex: number;
    public Unit: string;
    public DiscountPercent: number;
    public PriceIncVat: number;
    public AccountID: number;
    public PriceExVat: number;
    public CostPrice: number;
    public PriceSetByUser: boolean;
    public DimensionsID: number;
    public SumVat: number;
    public SumTotalIncVatCurrency: number;
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

    public StatusCode: number;
    public CustomerInvoiceReminderSettingsID: number;
    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public CreditorNumber: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public DebtCollectionAutomationID: number;
    public IntegrateWithDebtCollection: boolean;
    public DebtCollectionFormat: number;
    public _createguid: string;
    public DebtCollectionAutomation: Array<DebtCollectionAutomation>;
    public CustomerInvoiceReminderSettings: CustomerInvoiceReminderSettings;
    public CustomFields: any;
}


export class ItemSource extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ItemSource';

    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public _createguid: string;
    public Details: Array<ItemSourceDetail>;
    public CustomFields: any;
}


export class ItemSourceDetail extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ItemSourceDetail';

    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public SourceType: string;
    public CreatedBy: string;
    public Deleted: boolean;
    public ItemSourceID: number;
    public Description: string;
    public UpdatedBy: string;
    public Amount: number;
    public Tag: string;
    public UpdatedAt: Date;
    public SourceFK: number;
    public _createguid: string;
    public CustomFields: any;
}


export class PaymentInfoType extends UniEntity {
    public static RelativeUrl = 'paymentinfotype';
    public static EntityType = 'PaymentInfoType';

    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Type: PaymentInfoTypeEnum;
    public Deleted: boolean;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public Control: Modulus;
    public Length: number;
    public Name: string;
    public Locked: boolean;
    public _createguid: string;
    public PaymentInfoTypeParts: Array<PaymentInfoTypePart>;
    public CustomFields: any;
}


export class PaymentInfoTypePart extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'PaymentInfoTypePart';

    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public Part: string;
    public PaymentInfoTypeID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public SortIndex: number;
    public Length: number;
    public _createguid: string;
    public CustomFields: any;
}


export class RecurringInvoice extends UniEntity {
    public static RelativeUrl = 'recurringinvoices';
    public static EntityType = 'RecurringInvoice';

    public DeliveryDate: LocalDate;
    public StatusCode: number;
    public SalesPerson: string;
    public FreeTxt: string;
    public UseReportID: number;
    public DistributionPlanID: number;
    public ID: number;
    public CreatedAt: Date;
    public CurrencyExchangeRate: number;
    public PayableRoundingCurrencyAmount: number;
    public Requisition: string;
    public DeliveryName: string;
    public NotifyUser: string;
    public NotifyWhenRecurringEnds: boolean;
    public DeliveryTermsID: number;
    public CustomerID: number;
    public CustomerName: string;
    public ShippingAddressLine2: string;
    public CreatedBy: string;
    public DeliveryMethod: string;
    public PaymentInformation: string;
    public CustomerPerson: string;
    public NextInvoiceDate: LocalDate;
    public InvoiceNumberSeriesID: number;
    public Interval: number;
    public TimePeriod: RecurringPeriod;
    public Comment: string;
    public InvoiceReceiverName: string;
    public Deleted: boolean;
    public ShippingCity: string;
    public PaymentInfoTypeID: number;
    public PrintStatus: number;
    public DeliveryTerm: string;
    public InvoiceCity: string;
    public DefaultSellerID: number;
    public EndDate: LocalDate;
    public TaxExclusiveAmountCurrency: number;
    public UpdatedBy: string;
    public PayableRoundingAmount: number;
    public InternalNote: string;
    public VatTotalsAmountCurrency: number;
    public TaxInclusiveAmountCurrency: number;
    public MaxIterations: number;
    public DefaultDimensionsID: number;
    public InvoiceCountryCode: string;
    public UpdateCurrencyAmountsOnDateChange: boolean;
    public YourReference: string;
    public CreditDays: number;
    public Payment: string;
    public OurReference: string;
    public UpdatedAt: Date;
    public CustomerOrgNumber: string;
    public TaxInclusiveAmount: number;
    public AmountRegards: string;
    public ShippingCountryCode: string;
    public PaymentTermsID: number;
    public StartDate: LocalDate;
    public ProduceAs: RecurringResult;
    public SupplierOrgNumber: string;
    public CurrencyCodeID: number;
    public InvoiceCountry: string;
    public InvoiceAddressLine1: string;
    public ShippingPostalCode: string;
    public TaxExclusiveAmount: number;
    public NoCreditDays: boolean;
    public NotifyWhenOrdersArePrepared: boolean;
    public InvoicePostalCode: string;
    public PreparationDays: number;
    public InvoiceAddressLine3: string;
    public ShippingAddressLine1: string;
    public PaymentTerm: string;
    public ShippingCountry: string;
    public VatTotalsAmount: number;
    public InvoiceAddressLine2: string;
    public ShippingAddressLine3: string;
    public EmailAddress: string;
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

    public SumTotalIncVat: number;
    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public CurrencyExchangeRate: number;
    public VatTypeID: number;
    public TimeFactor: RecurringPeriod;
    public CreatedBy: string;
    public ItemText: string;
    public Comment: string;
    public Deleted: boolean;
    public SumVatCurrency: number;
    public NumberOfItems: number;
    public PricingSource: PricingSource;
    public Discount: number;
    public UpdatedBy: string;
    public VatPercent: number;
    public RecurringInvoiceID: number;
    public ProductID: number;
    public UpdatedAt: Date;
    public DiscountCurrency: number;
    public CalculateGrossPriceBasedOnNetPrice: boolean;
    public SumTotalExVatCurrency: number;
    public SumTotalExVat: number;
    public PriceExVatCurrency: number;
    public CurrencyCodeID: number;
    public SortIndex: number;
    public Unit: string;
    public DiscountPercent: number;
    public PriceIncVat: number;
    public AccountID: number;
    public PriceExVat: number;
    public PriceSetByUser: boolean;
    public DimensionsID: number;
    public SumVat: number;
    public SumTotalIncVatCurrency: number;
    public ReduceIncompletePeriod: boolean;
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

    public StatusCode: number;
    public InvoiceDate: LocalDate;
    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Comment: string;
    public Deleted: boolean;
    public NotifiedOrdersPrepared: boolean;
    public UpdatedBy: string;
    public RecurringInvoiceID: number;
    public UpdatedAt: Date;
    public IterationNumber: number;
    public NotifiedRecurringEnds: boolean;
    public InvoiceID: number;
    public OrderID: number;
    public CreationDate: LocalDate;
    public _createguid: string;
    public CustomFields: any;
}


export class Seller extends UniEntity {
    public static RelativeUrl = 'sellers';
    public static EntityType = 'Seller';

    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public UserID: number;
    public TeamID: number;
    public Deleted: boolean;
    public UpdatedBy: string;
    public DefaultDimensionsID: number;
    public EmployeeID: number;
    public UpdatedAt: Date;
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

    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public CustomerInvoiceID: number;
    public CustomerID: number;
    public CreatedBy: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public Amount: number;
    public CustomerQuoteID: number;
    public RecurringInvoiceID: number;
    public UpdatedAt: Date;
    public SellerID: number;
    public CustomerOrderID: number;
    public Percent: number;
    public _createguid: string;
    public Seller: Seller;
    public CustomFields: any;
}


export class SubCompany extends UniEntity {
    public static RelativeUrl = 'subcompanies';
    public static EntityType = 'SubCompany';

    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public CompanyType: CompanyRelation;
    public CompanyKey: string;
    public CustomerID: number;
    public CreatedBy: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public CompanyID: number;
    public CompanyName: string;
    public _createguid: string;
    public Customer: Customer;
    public CustomFields: any;
}


export class Supplier extends UniEntity {
    public static RelativeUrl = 'suppliers';
    public static EntityType = 'Supplier';

    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public GLN: string;
    public CreatedBy: string;
    public WebUrl: string;
    public CostAllocationID: number;
    public SupplierNumber: number;
    public Deleted: boolean;
    public OrgNumber: string;
    public SelfEmployed: boolean;
    public UpdatedBy: string;
    public CreditDays: number;
    public UpdatedAt: Date;
    public Localization: string;
    public SubAccountNumberSeriesID: number;
    public CurrencyCodeID: number;
    public PeppolAddress: string;
    public BusinessRelationID: number;
    public DimensionsID: number;
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

    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public TermsType: TermsType;
    public Deleted: boolean;
    public Description: string;
    public UpdatedBy: string;
    public CreditDays: number;
    public UpdatedAt: Date;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class TOFCurrencySettings extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'TOFCurrencySettings';

    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public UpdateCurrencyAmountsOnInvoicedateChange: boolean;
    public Deleted: boolean;
    public UpdateCurrencyAmountsOnOrderdateChange: boolean;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public UpdateCurrencyAmountsOnQuoteToOrder: boolean;
    public UpdateCurrencyAmountsOnQuotedateChange: boolean;
    public UpdateCurrencyAmountsOnOrderToInvoice: boolean;
    public UpdateCurrencyAmountsOnQuoteToInvoice: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class Address extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Address';

    public Region: string;
    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public AddressLine1: string;
    public CreatedBy: string;
    public PostalCode: string;
    public Deleted: boolean;
    public AddressLine2: string;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public CountryCode: string;
    public City: string;
    public Country: string;
    public AddressLine3: string;
    public BusinessRelationID: number;
    public _createguid: string;
    public BusinessRelation: BusinessRelation;
    public CustomFields: any;
}


export class BusinessRelation extends UniEntity {
    public static RelativeUrl = 'business-relations';
    public static EntityType = 'BusinessRelation';

    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public DefaultPhoneID: number;
    public ShippingAddressID: number;
    public UpdatedBy: string;
    public DefaultBankAccountID: number;
    public UpdatedAt: Date;
    public DefaultEmailID: number;
    public DefaultContactID: number;
    public Name: string;
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

    public StatusCode: number;
    public Role: string;
    public ID: number;
    public CreatedAt: Date;
    public ParentBusinessRelationID: number;
    public CreatedBy: string;
    public Comment: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public InfoID: number;
    public _createguid: string;
    public ParentBusinessRelation: BusinessRelation;
    public Info: BusinessRelation;
    public CustomFields: any;
}


export class Email extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Email';

    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Type: string;
    public Deleted: boolean;
    public Description: string;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public BusinessRelationID: number;
    public EmailAddress: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Phone extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Phone';

    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public Number: string;
    public CreatedBy: string;
    public Type: PhoneTypeEnum;
    public Deleted: boolean;
    public Description: string;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public CountryCode: string;
    public BusinessRelationID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class AGACalculation extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AGACalculation';

    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public PayrollRunID: number;
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

    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public SubEntityID: number;
    public AGACalculationID: number;
    public Deleted: boolean;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public freeAmount: number;
    public _createguid: string;
    public subEntity: SubEntity;
    public CustomFields: any;
}


export class AGATax extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AGATax';

    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public SubEntityID: number;
    public AGACalculationID: number;
    public Deleted: boolean;
    public AGARateID: number;
    public zone: number;
    public UpdatedBy: string;
    public agaRate: number;
    public beregningsKode: number;
    public UpdatedAt: Date;
    public agaBase: number;
    public _createguid: string;
    public municipalityName: string;
    public zoneName: string;
    public subEntity: SubEntity;
    public CustomFields: any;
}


export class AGAPension extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AGAPension';

    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public SubEntityID: number;
    public AGACalculationID: number;
    public Deleted: boolean;
    public AGARateID: number;
    public zone: number;
    public UpdatedBy: string;
    public agaRate: number;
    public beregningsKode: number;
    public UpdatedAt: Date;
    public agaBase: number;
    public _createguid: string;
    public municipalityName: string;
    public zoneName: string;
    public subEntity: SubEntity;
    public CustomFields: any;
}


export class AGADraw extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AGADraw';

    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public SubEntityID: number;
    public AGACalculationID: number;
    public Deleted: boolean;
    public AGARateID: number;
    public zone: number;
    public UpdatedBy: string;
    public agaRate: number;
    public beregningsKode: number;
    public UpdatedAt: Date;
    public agaBase: number;
    public _createguid: string;
    public municipalityName: string;
    public zoneName: string;
    public subEntity: SubEntity;
    public CustomFields: any;
}


export class ForeignerWithPercent extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ForeignerWithPercent';

    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public SubEntityID: number;
    public AGACalculationID: number;
    public Deleted: boolean;
    public UpdatedBy: string;
    public agaRate: number;
    public UpdatedAt: Date;
    public agaBase: number;
    public _createguid: string;
    public municipalityName: string;
    public zoneName: string;
    public subEntity: SubEntity;
    public CustomFields: any;
}


export class DrawForeignerWithPercent extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'DrawForeignerWithPercent';

    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public SubEntityID: number;
    public AGACalculationID: number;
    public Deleted: boolean;
    public UpdatedBy: string;
    public agaRate: number;
    public UpdatedAt: Date;
    public agaBase: number;
    public _createguid: string;
    public municipalityName: string;
    public zoneName: string;
    public subEntity: SubEntity;
    public CustomFields: any;
}


export class ForeignerWithAmount extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ForeignerWithAmount';

    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public persons: number;
    public CreatedBy: string;
    public SubEntityID: number;
    public AGACalculationID: number;
    public Deleted: boolean;
    public aga: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public _createguid: string;
    public municipalityName: string;
    public zoneName: string;
    public subEntity: SubEntity;
    public CustomFields: any;
}


export class TaxAndAgaSums extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'TaxAndAgaSums';

    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public FinancialTax: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public WithholdingTax: number;
    public GarnishmentTax: number;
    public _createguid: string;
    public CustomFields: any;
}


export class AmeldingData extends UniEntity {
    public static RelativeUrl = 'amelding';
    public static EntityType = 'AmeldingData';

    public StatusCode: number;
    public sent: Date;
    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public receiptID: number;
    public type: AmeldingType;
    public Deleted: boolean;
    public messageID: string;
    public PayrollRunID: number;
    public altinnStatus: string;
    public replacesID: number;
    public UpdatedBy: string;
    public OppgaveHash: string;
    public attachmentFileID: number;
    public period: number;
    public UpdatedAt: Date;
    public created: Date;
    public year: number;
    public status: number;
    public initiated: Date;
    public mainFileID: number;
    public feedbackFileID: number;
    public xmlValidationErrors: string;
    public _createguid: string;
    public replaceThis: string;
    public log: Array<AmeldingLog>;
    public CustomFields: any;
}


export class AmeldingLog extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AmeldingLog';

    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public registry: SalaryRegistry;
    public CreatedBy: string;
    public Deleted: boolean;
    public key: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public AmeldingsID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class BasicAmount extends UniEntity {
    public static RelativeUrl = 'basicamounts';
    public static EntityType = 'BasicAmount';

    public StatusCode: number;
    public ID: number;
    public FromDate: Date;
    public CreatedAt: Date;
    public CreatedBy: string;
    public ConversionFactor: number;
    public Deleted: boolean;
    public BasicAmountPrYear: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public BasicAmountPrMonth: number;
    public AveragePrYear: number;
    public _createguid: string;
    public CustomFields: any;
}


export class CompanySalary extends UniEntity {
    public static RelativeUrl = 'companysalary';
    public static EntityType = 'CompanySalary';

    public StatusCode: number;
    public Base_SpesialDeductionForMaritim: boolean;
    public ID: number;
    public CreatedAt: Date;
    public MainAccountAllocatedFinancialVacation: number;
    public RateFinancialTax: number;
    public Base_NettoPayment: boolean;
    public WageDeductionDueToHoliday: WageDeductionDueToHolidayType;
    public CreatedBy: string;
    public Base_PayAsYouEarnTaxOnPensions: boolean;
    public PostToTaxDraw: boolean;
    public InterrimRemitAccount: number;
    public Deleted: boolean;
    public MainAccountCostFinancialVacation: number;
    public CalculateFinancialTax: boolean;
    public HourFTEs: number;
    public AnnualStatementZipReportID: number;
    public MainAccountAllocatedFinancial: number;
    public MainAccountAllocatedAGA: number;
    public UpdatedBy: string;
    public Base_NettoPaymentForMaritim: boolean;
    public UpdatedAt: Date;
    public Base_TaxFreeOrganization: boolean;
    public MainAccountAllocatedAGAVacation: number;
    public MainAccountCostFinancial: number;
    public WagetypeAdvancePaymentAuto: number;
    public Base_JanMayenAndBiCountries: boolean;
    public MainAccountCostVacation: number;
    public OtpExportActive: boolean;
    public MainAccountAllocatedVacation: number;
    public Base_Svalbard: boolean;
    public MainAccountCostAGAVacation: number;
    public AllowOver6G: boolean;
    public FreeAmount: number;
    public MainAccountCostAGA: number;
    public PostGarnishmentToTaxAccount: boolean;
    public PaycheckZipReportID: number;
    public PaymentInterval: CompanySalaryPaymentInterval;
    public HoursPerMonth: number;
    public WagetypeAdvancePayment: number;
    public _createguid: string;
    public CustomFields: any;
}


export class CompanyVacationRate extends UniEntity {
    public static RelativeUrl = 'companyvacationrates';
    public static EntityType = 'CompanyVacationRate';

    public StatusCode: number;
    public ID: number;
    public FromDate: Date;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public Rate: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public Rate60: number;
    public _createguid: string;
    public CustomFields: any;
}


export class EmployeeCategory extends UniEntity {
    public static RelativeUrl = 'employeecategories';
    public static EntityType = 'EmployeeCategory';

    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public EmployeeCategoryLinkID: number;
    public Deleted: boolean;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class EmployeeCategoryLink extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'EmployeeCategoryLink';

    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public EmployeeNumber: number;
    public EmployeeID: number;
    public UpdatedAt: Date;
    public EmployeeCategoryID: number;
    public _createguid: string;
    public EmployeeCategory: EmployeeCategory;
    public Employee: Employee;
    public CustomFields: any;
}


export class Employee extends UniEntity {
    public static RelativeUrl = 'employees';
    public static EntityType = 'Employee';

    public StatusCode: number;
    public AdvancePaymentAmount: number;
    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public SubEntityID: number;
    public OtpExport: boolean;
    public UserID: number;
    public Deleted: boolean;
    public MunicipalityNo: string;
    public Active: boolean;
    public EmploymentDateOtp: LocalDate;
    public FreeText: string;
    public Sex: GenderEnum;
    public EndDateOtp: LocalDate;
    public OtpStatus: OtpStatus;
    public UpdatedBy: string;
    public TypeOfPaymentOtp: TypeOfPaymentOtp;
    public EmployeeNumber: number;
    public UpdatedAt: Date;
    public BirthDate: Date;
    public ForeignWorker: ForeignWorker;
    public InternationalID: string;
    public SocialSecurityNumber: string;
    public InternasjonalIDType: InternationalIDType;
    public IncludeOtpUntilMonth: number;
    public EmployeeLanguageID: number;
    public PhotoID: number;
    public BusinessRelationID: number;
    public PaymentInterval: PaymentInterval;
    public EmploymentDate: Date;
    public InternasjonalIDCountry: string;
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

    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public pensjonID: number;
    public CreatedBy: string;
    public ResultatStatus: string;
    public Table: string;
    public loennKunTrygdeavgiftTilUtenlandskBorgerID: number;
    public loennTilUtenrikstjenestemannID: number;
    public Deleted: boolean;
    public SecondaryTable: string;
    public UpdatedBy: string;
    public SecondaryPercent: number;
    public EmployeeNumber: number;
    public IssueDate: Date;
    public TaxcardId: number;
    public EmployeeID: number;
    public NonTaxableAmount: number;
    public SKDXml: string;
    public UpdatedAt: Date;
    public loennFraHovedarbeidsgiverID: number;
    public ufoereYtelserAndreID: number;
    public NotMainEmployer: boolean;
    public Tilleggsopplysning: string;
    public Percent: number;
    public Year: number;
    public loennKunTrygdeavgiftTilUtenlandskBorgerSomGrensegjengerID: number;
    public loennFraBiarbeidsgiverID: number;
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
    public CreatedAt: Date;
    public tabellType: TabellType;
    public CreatedBy: string;
    public freeAmountType: FreeAmountType;
    public Table: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public NonTaxableAmount: number;
    public UpdatedAt: Date;
    public AntallMaanederForTrekk: number;
    public Percent: number;
    public _createguid: string;
    public CustomFields: any;
}


export class EmployeeLeave extends UniEntity {
    public static RelativeUrl = 'EmployeeLeave';
    public static EntityType = 'EmployeeLeave';

    public StatusCode: number;
    public ID: number;
    public FromDate: Date;
    public CreatedAt: Date;
    public CreatedBy: string;
    public ToDate: Date;
    public LeavePercent: number;
    public Deleted: boolean;
    public Description: string;
    public UpdatedBy: string;
    public AffectsOtp: boolean;
    public UpdatedAt: Date;
    public EmploymentID: number;
    public LeaveType: Leavetype;
    public _createguid: string;
    public Employment: Employment;
    public CustomFields: any;
}


export class Employment extends UniEntity {
    public static RelativeUrl = 'employments';
    public static EntityType = 'Employment';

    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public EmploymentType: EmploymentType;
    public CreatedBy: string;
    public SubEntityID: number;
    public TypeOfEmployment: TypeOfEmployment;
    public WorkingHoursScheme: WorkingHoursScheme;
    public Deleted: boolean;
    public RemunerationType: RemunerationType;
    public LastSalaryChangeDate: Date;
    public EndDate: Date;
    public RegulativeStepNr: number;
    public UpdatedBy: string;
    public MonthRate: number;
    public EmployeeNumber: number;
    public WorkPercent: number;
    public EmployeeID: number;
    public JobCode: string;
    public UpdatedAt: Date;
    public StartDate: Date;
    public ShipReg: ShipRegistry;
    public ShipType: ShipTypeOfShip;
    public TradeArea: ShipTradeArea;
    public HourRate: number;
    public EndDateReason: EndDateReason;
    public JobName: string;
    public UserDefinedRate: number;
    public PayGrade: string;
    public HoursPerWeek: number;
    public LastWorkPercentChangeDate: Date;
    public LedgerAccount: string;
    public Standard: boolean;
    public SeniorityDate: Date;
    public RegulativeGroupID: number;
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

    public StatusCode: number;
    public ID: number;
    public FromDate: Date;
    public CreatedAt: Date;
    public CreatedBy: string;
    public SubentityID: number;
    public Deleted: boolean;
    public Description: string;
    public UpdatedBy: string;
    public Amount: number;
    public UpdatedAt: Date;
    public AffectsAGA: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class IncomeReportData extends UniEntity {
    public static RelativeUrl = 'income-reports';
    public static EntityType = 'IncomeReportData';

    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Type: string;
    public Deleted: boolean;
    public MonthlyRefund: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public Xml: string;
    public AltinnReceiptID: number;
    public EmploymentID: number;
    public _createguid: string;
    public AltinnReceipt: AltinnReceipt;
    public Employment: Employment;
    public CustomFields: any;
}


export class OtpExportWagetype extends UniEntity {
    public static RelativeUrl = 'otpexportwagetypes';
    public static EntityType = 'OtpExportWagetype';

    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public WageTypeNumber: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class PayrollRun extends UniEntity {
    public static RelativeUrl = 'payrollrun';
    public static EntityType = 'PayrollRun';

    public StatusCode: number;
    public ID: number;
    public FromDate: Date;
    public CreatedAt: Date;
    public taxdrawfactor: TaxDrawFactor;
    public HolidayPayDeduction: boolean;
    public AGAFreeAmount: number;
    public CreatedBy: string;
    public ToDate: Date;
    public Deleted: boolean;
    public AGAonRun: number;
    public FreeText: string;
    public ExcludeRecurringPosts: boolean;
    public Description: string;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public needsRecalc: boolean;
    public PayDate: Date;
    public PaycheckFileID: number;
    public SettlementDate: Date;
    public JournalEntryNumber: string;
    public _createguid: string;
    public transactions: Array<SalaryTransaction>;
    public agacalculation: Array<AGACalculation>;
    public CustomFields: any;
}


export class PayrollRunCategoryLink extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'PayrollRunCategoryLink';

    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public PayrollRunID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public EmployeeCategoryID: number;
    public _createguid: string;
    public EmployeeCategory: EmployeeCategory;
    public PayrollRun: PayrollRun;
    public CustomFields: any;
}


export class PostingSummaryDraft extends UniEntity {
    public ID: number;
    public PayrollID: number;
    public JobInfoID: number;
    public draftWithDimsOnBalance: string;
    public draftWithDims: string;
    public draftBasic: string;
    public statusTime: Date;
    public status: SummaryJobStatus;
}


export class Regulative extends UniEntity {
    public static RelativeUrl = 'regulatives';
    public static EntityType = 'Regulative';

    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public StartDate: LocalDate;
    public RegulativeGroupID: number;
    public _createguid: string;
    public Steps: Array<RegulativeStep>;
    public CustomFields: any;
}


export class RegulativeGroup extends UniEntity {
    public static RelativeUrl = 'regulativegroups';
    public static EntityType = 'RegulativeGroup';

    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public Name: string;
    public _createguid: string;
    public Regulatives: Array<Regulative>;
    public CustomFields: any;
}


export class RegulativeStep extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'RegulativeStep';

    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public RegulativeID: number;
    public CreatedBy: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public Amount: number;
    public Step: number;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class SalaryBalance extends UniEntity {
    public static RelativeUrl = 'salarybalances';
    public static EntityType = 'SalaryBalance';

    public StatusCode: number;
    public ID: number;
    public FromDate: Date;
    public CreatedAt: Date;
    public CreatedBy: string;
    public MaxAmount: number;
    public ToDate: Date;
    public Type: SalBalDrawType;
    public CreatePayment: boolean;
    public Deleted: boolean;
    public MinAmount: number;
    public WageTypeNumber: number;
    public UpdatedBy: string;
    public Instalment: number;
    public SupplierID: number;
    public InstalmentType: SalBalType;
    public Source: SalBalSource;
    public EmployeeID: number;
    public UpdatedAt: Date;
    public KID: string;
    public EmploymentID: number;
    public InstalmentPercent: number;
    public Name: string;
    public SalaryBalanceTemplateID: number;
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

    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public Description: string;
    public SalaryBalanceID: number;
    public UpdatedBy: string;
    public Amount: number;
    public UpdatedAt: Date;
    public Date: LocalDate;
    public SalaryTransactionID: number;
    public _createguid: string;
    public SalaryTransaction: SalaryTransaction;
    public SalaryBalance: SalaryBalance;
    public CustomFields: any;
}


export class SalaryBalanceTemplate extends UniEntity {
    public static RelativeUrl = 'salarybalancetemplates';
    public static EntityType = 'SalaryBalanceTemplate';

    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public MaxAmount: number;
    public CreatePayment: boolean;
    public Deleted: boolean;
    public MinAmount: number;
    public WageTypeNumber: number;
    public UpdatedBy: string;
    public Instalment: number;
    public SupplierID: number;
    public InstalmentType: SalBalType;
    public UpdatedAt: Date;
    public Account: number;
    public KID: string;
    public SalarytransactionDescription: string;
    public InstalmentPercent: number;
    public Name: string;
    public _createguid: string;
    public Supplier: Supplier;
    public SalaryBalances: Array<SalaryBalance>;
    public CustomFields: any;
}


export class SalaryTransaction extends UniEntity {
    public static RelativeUrl = 'salarytrans';
    public static EntityType = 'SalaryTransaction';

    public StatusCode: number;
    public ID: number;
    public FromDate: Date;
    public CreatedAt: Date;
    public HolidayPayDeduction: boolean;
    public VatTypeID: number;
    public calcAGA: number;
    public CreatedBy: string;
    public ToDate: Date;
    public Deleted: boolean;
    public MunicipalityNo: string;
    public WageTypeNumber: number;
    public Text: string;
    public Rate: number;
    public PayrollRunID: number;
    public RecurringID: number;
    public SalaryBalanceID: number;
    public UpdatedBy: string;
    public Amount: number;
    public recurringPostValidTo: Date;
    public EmployeeNumber: number;
    public SalaryTransactionCarInfoID: number;
    public recurringPostValidFrom: Date;
    public EmployeeID: number;
    public UpdatedAt: Date;
    public ChildSalaryTransactionID: number;
    public Account: number;
    public IsRecurringPost: boolean;
    public TaxbasisID: number;
    public EmploymentID: number;
    public Sum: number;
    public SystemType: StdSystemType;
    public WageTypeID: number;
    public DimensionsID: number;
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

    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public IsElectric: boolean;
    public CreatedBy: string;
    public Deleted: boolean;
    public RegistrationYear: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public IsLongRange: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class SalaryTransactionSupplement extends UniEntity {
    public static RelativeUrl = 'supplements';
    public static EntityType = 'SalaryTransactionSupplement';

    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public ValueBool: boolean;
    public CreatedBy: string;
    public Deleted: boolean;
    public ValueDate2: Date;
    public ValueString: string;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public SalaryTransactionID: number;
    public ValueDate: Date;
    public ValueMoney: number;
    public WageTypeSupplementID: number;
    public _createguid: string;
    public WageTypeSupplement: WageTypeSupplement;
    public CustomFields: any;
}


export class SalaryYear extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'SalaryYear';

    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public CurrentYear: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class SubEntity extends UniEntity {
    public static RelativeUrl = 'subentities';
    public static EntityType = 'SubEntity';

    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public AgaRule: number;
    public MunicipalityNo: string;
    public OrgNumber: string;
    public SuperiorOrganizationID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public freeAmount: number;
    public AgaZone: number;
    public BusinessRelationID: number;
    public _createguid: string;
    public BusinessRelationInfo: BusinessRelation;
    public SuperiorOrganization: SubEntity;
    public CustomFields: any;
}


export class TaxBasis extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'TaxBasis';

    public StatusCode: number;
    public JanMayenBasis: number;
    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public Basis: number;
    public UpdatedBy: string;
    public ForeignCitizenInsuranceBasis: number;
    public UpdatedAt: Date;
    public SailorBasis: number;
    public PensionSourcetaxBasis: number;
    public ForeignBorderCommuterBasis: number;
    public SalaryTransactionID: number;
    public SvalbardBasis: number;
    public PensionBasis: number;
    public DisabilityOtherBasis: number;
    public _createguid: string;
    public CustomFields: any;
}


export class Travel extends UniEntity {
    public static RelativeUrl = 'travels';
    public static EntityType = 'Travel';

    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Email: string;
    public Comment: string;
    public Deleted: boolean;
    public PersonID: string;
    public SourceSystem: string;
    public Description: string;
    public UpdatedBy: string;
    public EmployeeNumber: number;
    public SupplierID: number;
    public UpdatedAt: Date;
    public Purpose: string;
    public Phone: string;
    public DimensionsID: number;
    public Name: string;
    public TravelIdentificator: string;
    public State: state;
    public _createguid: string;
    public AdvanceAmount: number;
    public TravelLines: Array<TravelLine>;
    public Dimensions: Dimensions;
    public CustomFields: any;
}


export class TravelLine extends UniEntity {
    public static RelativeUrl = 'travellines';
    public static EntityType = 'TravelLine';

    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public VatTypeID: number;
    public From: Date;
    public TravelID: number;
    public CreatedBy: string;
    public To: Date;
    public LineState: linestate;
    public Deleted: boolean;
    public paytransID: number;
    public AccountNumber: number;
    public CostType: costtype;
    public Description: string;
    public Rate: number;
    public UpdatedBy: string;
    public Amount: number;
    public TypeID: number;
    public UpdatedAt: Date;
    public InvoiceAccount: number;
    public DimensionsID: number;
    public TravelIdentificator: string;
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
    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public ForeignTypeID: string;
    public Deleted: boolean;
    public WageTypeNumber: number;
    public Description: string;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public ForeignDescription: string;
    public InvoiceAccount: number;
    public _createguid: string;
    public CustomFields: any;
}


export class VacationPayLine extends UniEntity {
    public static RelativeUrl = 'VacationPayLines';
    public static EntityType = 'VacationPayLine';

    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public ManualVacationPayBase: number;
    public CreatedBy: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public EmployeeID: number;
    public UpdatedAt: Date;
    public Year: number;
    public Age: number;
    public VacationPay: number;
    public PaidVacationPay: number;
    public _createguid: string;
    public SystemVacationPayBase: number;
    public Rate: number;
    public PaidTaxFreeVacationPay: number;
    public MissingEarlierVacationPay: number;
    public Withdrawal: number;
    public Rate60: number;
    public VacationPay60: number;
    public Employee: Employee;
    public CustomFields: any;
}


export class VacationRateEmployee extends UniEntity {
    public static RelativeUrl = 'employeevacationrates';
    public static EntityType = 'VacationRateEmployee';

    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public EndDate: Date;
    public Rate: number;
    public UpdatedBy: string;
    public EmployeeID: number;
    public UpdatedAt: Date;
    public StartDate: Date;
    public Rate60: number;
    public _createguid: string;
    public CustomFields: any;
}


export class WageType extends UniEntity {
    public static RelativeUrl = 'wagetypes';
    public static EntityType = 'WageType';

    public StatusCode: number;
    public SupplementPackage: string;
    public ID: number;
    public CreatedAt: Date;
    public Base_Vacation: boolean;
    public Postnr: string;
    public FixedSalaryHolidayDeduction: boolean;
    public ValidYear: number;
    public Benefit: string;
    public CreatedBy: string;
    public NoNumberOfHours: boolean;
    public Base_EmploymentTax: boolean;
    public taxtype: TaxType;
    public Limit_value: number;
    public Deleted: boolean;
    public AccountNumber_balance: number;
    public AccountNumber: number;
    public WageTypeNumber: number;
    public SpecialTaxAndContributionsRule: SpecialTaxAndContributionsRule;
    public IncomeType: string;
    public StandardWageTypeFor: StdWageType;
    public Description: string;
    public Rate: number;
    public SpecialAgaRule: SpecialAgaRule;
    public UpdatedBy: string;
    public Limit_type: LimitType;
    public DaysOnBoard: boolean;
    public GetRateFrom: GetRateFrom;
    public WageTypeName: string;
    public UpdatedAt: Date;
    public Base_Payment: boolean;
    public Limit_WageTypeNumber: number;
    public Limit_newRate: number;
    public SystemRequiredWageType: number;
    public Systemtype: string;
    public HideFromPaycheck: boolean;
    public Base_div2: boolean;
    public RateFactor: number;
    public RatetypeColumn: RateTypeColumn;
    public Base_div3: boolean;
    public SpecialTaxHandling: string;
    public _createguid: string;
    public SupplementaryInformations: Array<WageTypeSupplement>;
    public CustomFields: any;
}


export class WageTypeSupplement extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'WageTypeSupplement';

    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public SuggestedValue: string;
    public ameldingType: string;
    public CreatedBy: string;
    public Deleted: boolean;
    public Description: string;
    public ValueType: Valuetype;
    public UpdatedBy: string;
    public GetValueFromTrans: boolean;
    public UpdatedAt: Date;
    public WageTypeID: number;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class WageTypeTranslation extends UniEntity {
    public static RelativeUrl = 'wagetypetranslations';
    public static EntityType = 'WageTypeTranslation';

    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public WageTypeNumber: number;
    public UpdatedBy: string;
    public WageTypeName: string;
    public UpdatedAt: Date;
    public EmployeeLanguageID: number;
    public _createguid: string;
    public EmployeeLanguage: EmployeeLanguage;
    public CustomFields: any;
}


export class PensionScheme extends UniEntity {
    public static RelativeUrl = 'pensionschemes';
    public static EntityType = 'PensionScheme';

    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public Period: number;
    public UpdatedAt: Date;
    public Identificator: string;
    public Year: number;
    public _createguid: string;
    public CustomFields: any;
}


export class PensionSchemeSupplier extends UniEntity {
    public static RelativeUrl = 'pensionschemesuppliers';
    public static EntityType = 'PensionSchemeSupplier';

    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public Identificator: string;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class StandardPensionSchemeSupplier extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'StandardPensionSchemeSupplier';

    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public Identificator: string;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class EmployeeLanguage extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'EmployeeLanguage';

    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public LanguageCode: string;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class ComponentLayout extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ComponentLayout';

    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public BaseEntity: string;
    public Name: string;
    public _createguid: string;
    public Fields: Array<FieldLayout>;
    public CustomFields: any;
}


export class FieldLayout extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'FieldLayout';

    public StatusCode: number;
    public EntityType: string;
    public DisplayField: string;
    public Options: string;
    public ID: number;
    public CreatedAt: Date;
    public Legend: string;
    public CreatedBy: string;
    public Placement: number;
    public Sectionheader: string;
    public Deleted: boolean;
    public Description: string;
    public ReadOnly: boolean;
    public UpdatedBy: string;
    public ComponentLayoutID: number;
    public LineBreak: boolean;
    public Property: string;
    public LookupField: boolean;
    public Placeholder: string;
    public UpdatedAt: Date;
    public Combo: number;
    public HelpText: string;
    public Hidden: boolean;
    public Alignment: Alignment;
    public Label: string;
    public FieldType: FieldType;
    public Section: number;
    public FieldSet: number;
    public Width: string;
    public _createguid: string;
    public CustomFields: any;
}


export class CurrencyOverride extends UniEntity {
    public static RelativeUrl = 'currencyoverrides';
    public static EntityType = 'CurrencyOverride';

    public ID: number;
    public FromDate: LocalDate;
    public CreatedAt: Date;
    public CreatedBy: string;
    public ToDate: LocalDate;
    public Deleted: boolean;
    public Factor: number;
    public ToCurrencyCodeID: number;
    public UpdatedBy: string;
    public Source: CurrencySourceEnum;
    public UpdatedAt: Date;
    public ExchangeRate: number;
    public FromCurrencyCodeID: number;
    public _createguid: string;
    public FromCurrencyCode: CurrencyCode;
    public ToCurrencyCode: CurrencyCode;
    public CustomFields: any;
}


export class AccountAssetGroup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AccountAssetGroup';

    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ToAccountNumber: number;
    public AssetGroupCode: string;
    public UpdatedAt: Date;
    public FromAccountNumber: number;
    public _createguid: string;
    public CustomFields: any;
}


export class AccountGroupSetup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AccountGroupSetup';

    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public ExternalReference: string;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public ParentID: number;
    public Name: string;
    public PlanType: PlanTypeEnum;
    public _createguid: string;
    public Parent: AccountGroupSetup;
    public CustomFields: any;
}


export class AccountSetup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AccountSetup';

    public ID: number;
    public CreatedAt: Date;
    public ExpectedDebitBalance: boolean;
    public CreatedBy: string;
    public Deleted: boolean;
    public AccountGroupSetupID: number;
    public AccountNumber: number;
    public SaftMappingAccountID: number;
    public UpdatedBy: string;
    public VatCode: string;
    public UpdatedAt: Date;
    public Visible: boolean;
    public AccountName: string;
    public PlanType: PlanTypeEnum;
    public _createguid: string;
    public AccountGroup: AccountGroupSetup;
    public SaftMappingAccount: SaftMappingAccount;
    public CustomFields: any;
}


export class AccountVisibilityGroup extends UniEntity {
    public static RelativeUrl = 'accountvisibilitygroups';
    public static EntityType = 'AccountVisibilityGroup';

    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public Name: string;
    public _createguid: string;
    public Accounts: Array<AccountVisibilityGroupAccount>;
    public CompanyTypes: Array<CompanyType>;
    public CustomFields: any;
}


export class AccountVisibilityGroupAccount extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AccountVisibilityGroupAccount';

    public ID: number;
    public CreatedAt: Date;
    public AccountSetupID: number;
    public CreatedBy: string;
    public Deleted: boolean;
    public AccountVisibilityGroupID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class AGARate extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AGARate';

    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public ZoneID: number;
    public Rate: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public RateValidFrom: Date;
    public _createguid: string;
    public sector: Array<AGASector>;
    public CustomFields: any;
}


export class AGASector extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AGASector';

    public SectorID: number;
    public ID: number;
    public CreatedAt: Date;
    public RateID: number;
    public CreatedBy: string;
    public Deleted: boolean;
    public Rate: number;
    public UpdatedBy: string;
    public ValidFrom: Date;
    public UpdatedAt: Date;
    public Sector: string;
    public freeAmount: number;
    public _createguid: string;
    public CustomFields: any;
}


export class AGAZone extends UniEntity {
    public static RelativeUrl = 'AGAZones';
    public static EntityType = 'AGAZone';

    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public ZoneName: string;
    public _createguid: string;
    public rates: Array<AGARate>;
    public municipalsOnZone: Array<MunicipalAGAZone>;
    public CustomFields: any;
}


export class Agreement extends UniEntity {
    public static RelativeUrl = 'agreements';
    public static EntityType = 'Agreement';

    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public AppliesTo: number;
    public UpdatedBy: string;
    public ValidFrom: Date;
    public UpdatedAt: Date;
    public Template: string;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class AssetGroup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AssetGroup';

    public ID: number;
    public CreatedAt: Date;
    public DepreciationRate: number;
    public CreatedBy: string;
    public DepreciationAccountNumber: number;
    public ToDate: Date;
    public Deleted: boolean;
    public Code: string;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public Name: string;
    public DepreciationYears: number;
    public _createguid: string;
    public CustomFields: any;
}


export class BankIdentifierCode extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'BankIdentifierCode';

    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public BankIdentifier: string;
    public UpdatedAt: Date;
    public BankName: string;
    public Bic: string;
    public _createguid: string;
    public CustomFields: any;
}


export class CompanyType extends UniEntity {
    public static RelativeUrl = 'companytypes';
    public static EntityType = 'CompanyType';

    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public Description: string;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public DefaultAccountVisibilityGroupID: number;
    public Priority: boolean;
    public DefaultPlanType: PlanTypeEnum;
    public FullName: string;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Confirmation extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Confirmation';

    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Email: string;
    public PostalCode: string;
    public Deleted: boolean;
    public SignUpReferrer: string;
    public Code: string;
    public UpdatedBy: string;
    public DisplayName: string;
    public ContractType: string;
    public UpdatedAt: Date;
    public ExpirationDate: Date;
    public Phone: string;
    public CompanyName: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Country extends UniEntity {
    public static RelativeUrl = 'countries';
    public static EntityType = 'Country';

    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public DefaultCurrencyCode: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public CountryCode: string;
    public CurrencyRateSource: string;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Currency extends UniEntity {
    public static RelativeUrl = 'currencies';
    public static EntityType = 'Currency';

    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public Factor: number;
    public ToCurrencyCodeID: number;
    public UpdatedBy: string;
    public Source: CurrencySourceEnum;
    public UpdatedAt: Date;
    public CurrencyDate: LocalDate;
    public ExchangeRate: number;
    public FromCurrencyCodeID: number;
    public _createguid: string;
    public FromCurrencyCode: CurrencyCode;
    public ToCurrencyCode: CurrencyCode;
    public CustomFields: any;
}


export class CurrencyCode extends UniEntity {
    public static RelativeUrl = 'currencycodes';
    public static EntityType = 'CurrencyCode';

    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public Description: string;
    public Code: string;
    public UpdatedBy: string;
    public ShortCode: string;
    public UpdatedAt: Date;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class DebtCollectionAutomation extends UniEntity {
    public static RelativeUrl = 'debtcollectionautomation';
    public static EntityType = 'DebtCollectionAutomation';

    public DebtCollectionSettingsID: number;
    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public Description: string;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public Name: string;
    public _createguid: string;
    public DebtCollectionSettings: DebtCollectionSettings;
    public CustomFields: any;
}


export class EmploymentValidValues extends UniEntity {
    public static RelativeUrl = 'employmentvalidvalues';
    public static EntityType = 'EmploymentValidValues';

    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public typeOfEmployment: boolean;
    public WorkingHoursScheme: boolean;
    public Deleted: boolean;
    public RemunerationType: boolean;
    public LastSalaryChangeDate: boolean;
    public LastWorkPercentChange: boolean;
    public EndDate: boolean;
    public UpdatedBy: string;
    public MonthRate: boolean;
    public WorkPercent: boolean;
    public JobCode: boolean;
    public PaymentType: RemunerationType;
    public UpdatedAt: Date;
    public employment: TypeOfEmployment;
    public StartDate: boolean;
    public ShipReg: boolean;
    public ShipType: boolean;
    public TradeArea: boolean;
    public HourRate: boolean;
    public JobName: boolean;
    public UserDefinedRate: boolean;
    public HoursPerWeek: boolean;
    public SeniorityDate: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class FinancialDeadline extends UniEntity {
    public static RelativeUrl = 'deadlines';
    public static EntityType = 'FinancialDeadline';

    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public AdditionalInfo: string;
    public PassableDueDate: number;
    public Type: FinancialDeadlineType;
    public Deleted: boolean;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public Deadline: LocalDate;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class JobTicket extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'JobTicket';

    public GlobalIdentity: string;
    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public JobId: string;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public JobName: string;
    public JobStatus: string;
    public _createguid: string;
    public CustomFields: any;
}


export class LanguageCode extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'LanguageCode';

    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public Code: string;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Municipal extends UniEntity {
    public static RelativeUrl = 'Municipals';
    public static EntityType = 'Municipal';

    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public CountyNo: string;
    public Deleted: boolean;
    public MunicipalityNo: string;
    public UpdatedBy: string;
    public MunicipalityName: string;
    public UpdatedAt: Date;
    public Retired: boolean;
    public CountyName: string;
    public _createguid: string;
    public CustomFields: any;
}


export class MunicipalAGAZone extends UniEntity {
    public static RelativeUrl = 'MunicipalAGAZones';
    public static EntityType = 'MunicipalAGAZone';

    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public MunicipalityNo: string;
    public ZoneID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public Startdate: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class PaymentBatchType extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'PaymentBatchType';

    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public Description: string;
    public Code: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class PaymentCode extends UniEntity {
    public static RelativeUrl = 'paymentCodes';
    public static EntityType = 'PaymentCode';

    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public Description: string;
    public Code: number;
    public UpdatedBy: string;
    public PaymentGroup: string;
    public UpdatedAt: Date;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class PostalCode extends UniEntity {
    public static RelativeUrl = 'postalcodes';
    public static EntityType = 'PostalCode';

    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public Code: string;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public City: string;
    public _createguid: string;
    public CustomFields: any;
}


export class SaftMappingAccount extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'SaftMappingAccount';

    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public Description: string;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public AccountID: string;
    public _createguid: string;
    public CustomFields: any;
}


export class StaticRegister extends UniEntity {
    public static RelativeUrl = 'StaticRegister';
    public static EntityType = 'StaticRegister';

    public ID: number;
    public CreatedAt: Date;
    public stamp: Date;
    public Registry: string;
    public CreatedBy: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class STYRKCode extends UniEntity {
    public static RelativeUrl = 'STYRK';
    public static EntityType = 'STYRKCode';

    public ID: number;
    public CreatedAt: Date;
    public styrk: string;
    public lnr: number;
    public CreatedBy: string;
    public Deleted: boolean;
    public ynr: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public tittel: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Language extends UniEntity {
    public static RelativeUrl = 'languages';
    public static EntityType = 'Language';

    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public Code: string;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public FallBackLanguageID: number;
    public Name: string;
    public _createguid: string;
    public Translations: Array<Translation>;
    public CustomFields: any;
}


export class Translatable extends UniEntity {
    public static RelativeUrl = 'translatables';
    public static EntityType = 'Translatable';

    public ID: number;
    public Meaning: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Module: i18nModule;
    public Deleted: boolean;
    public Description: string;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public Value: string;
    public Static: boolean;
    public Model: string;
    public Column: string;
    public _createguid: string;
    public Translations: Array<Translation>;
    public CustomFields: any;
}


export class Translation extends UniEntity {
    public static RelativeUrl = 'translations';
    public static EntityType = 'Translation';

    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public TranslatableID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
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

    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public No: string;
    public UpdatedAt: Date;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class VatPostSetup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'VatPostSetup';

    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public VatCodeGroupSetupNo: string;
    public HasTaxBasis: boolean;
    public UpdatedBy: string;
    public No: string;
    public ReportAsNegativeAmount: boolean;
    public UpdatedAt: Date;
    public Name: string;
    public HasTaxAmount: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class VatReportForm extends UniEntity {
    public static RelativeUrl = 'vatreportforms';
    public static EntityType = 'VatReportForm';

    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public Description: string;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class VatReportReferenceSetup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'VatReportReferenceSetup';

    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public AccountNumber: number;
    public UpdatedBy: string;
    public VatCode: string;
    public UpdatedAt: Date;
    public VatPostNo: string;
    public _createguid: string;
    public CustomFields: any;
}


export class VatTypeSetup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'VatTypeSetup';

    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public DirectJournalEntryOnly: boolean;
    public UpdatedBy: string;
    public OutputVat: boolean;
    public ReversedTaxDutyVat: boolean;
    public VatCode: string;
    public VatCodeGroupNo: string;
    public UpdatedAt: Date;
    public OutgoingAccountNumber: number;
    public IsCompensated: boolean;
    public DefaultVisible: boolean;
    public IncomingAccountNumber: number;
    public Name: string;
    public IsNotVatRegistered: boolean;
    public _createguid: string;
    public VatTypeSetupPercentages: Array<VatTypeSetupPercentage>;
    public CustomFields: any;
}


export class VatTypeSetupPercentage extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'VatTypeSetupPercentage';

    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ValidFrom: LocalDate;
    public VatPercent: number;
    public UpdatedAt: Date;
    public VatTypeSetupID: number;
    public ValidTo: LocalDate;
    public _createguid: string;
    public CustomFields: any;
}


export class CompanyReport extends UniEntity {
    public static RelativeUrl = 'company-report';
    public static EntityType = 'CompanyReport';

    public ID: number;
    public CreatedAt: Date;
    public CompanyKey: string;
    public CreatedBy: string;
    public ReportDefinitionID: number;
    public ContractId: number;
    public Deleted: boolean;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class ReportDefinition extends UniEntity {
    public static RelativeUrl = 'report-definitions';
    public static EntityType = 'ReportDefinition';

    public ID: number;
    public CreatedAt: Date;
    public ReportType: number;
    public CreatedBy: string;
    public IsStandard: boolean;
    public ReportSource: string;
    public Deleted: boolean;
    public Description: string;
    public CategoryLabel: string;
    public UpdatedBy: string;
    public Version: string;
    public UpdatedAt: Date;
    public TemplateLinkId: string;
    public Category: string;
    public Visible: boolean;
    public Md5: string;
    public UniqueReportID: string;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class ReportDefinitionDataSource extends UniEntity {
    public static RelativeUrl = 'report-definition-data-sources';
    public static EntityType = 'ReportDefinitionDataSource';

    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public ReportDefinitionId: number;
    public Deleted: boolean;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public DataSourceUrl: string;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class ReportDefinitionParameter extends UniEntity {
    public static RelativeUrl = 'report-definition-parameters';
    public static EntityType = 'ReportDefinitionParameter';

    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public ReportDefinitionId: number;
    public DefaultValueSource: string;
    public Type: string;
    public Deleted: boolean;
    public DefaultValue: string;
    public DefaultValueList: string;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public SortIndex: number;
    public Visible: boolean;
    public DefaultValueLookupType: string;
    public Label: string;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class PeriodSeries extends UniEntity {
    public static RelativeUrl = 'period-series';
    public static EntityType = 'PeriodSeries';

    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public Active: boolean;
    public SeriesType: PeriodSeriesType;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class PeriodTemplate extends UniEntity {
    public static RelativeUrl = 'period-templates';
    public static EntityType = 'PeriodTemplate';

    public ID: number;
    public FromDate: LocalDate;
    public CreatedAt: Date;
    public CreatedBy: string;
    public ToDate: LocalDate;
    public Deleted: boolean;
    public PeriodSeriesID: number;
    public UpdatedBy: string;
    public No: number;
    public UpdatedAt: Date;
    public Name: string;
    public _createguid: string;
    public PeriodSeries: PeriodSeries;
    public CustomFields: any;
}


export class Model extends UniEntity {
    public static RelativeUrl = 'models';
    public static EntityType = 'Model';

    public ID: number;
    public CreatedAt: Date;
    public Admin: boolean;
    public CreatedBy: string;
    public Deleted: boolean;
    public Shared: boolean;
    public Description: string;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public LabelPlural: string;
    public Label: string;
    public Name: string;
    public _createguid: string;
    public Fields: Array<Field>;
    public CustomFields: any;
}


export class Field extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Field';

    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public Description: string;
    public ModelID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public HelpText: string;
    public Label: string;
    public Name: string;
    public _createguid: string;
    public Model: Model;
    public CustomFields: any;
}


export class Notification extends UniEntity {
    public static RelativeUrl = 'notifications';
    public static EntityType = 'Notification';

    public StatusCode: number;
    public EntityType: string;
    public ID: number;
    public CreatedAt: Date;
    public Message: string;
    public CompanyKey: string;
    public CreatedBy: string;
    public Deleted: boolean;
    public EntityID: number;
    public UpdatedBy: string;
    public RecipientID: string;
    public SourceEntityID: number;
    public UpdatedAt: Date;
    public SenderDisplayName: string;
    public SourceEntityType: string;
    public CompanyName: string;
    public _createguid: string;
    public CustomFields: any;
}


export class CompanySettings extends UniEntity {
    public static RelativeUrl = 'companysettings';
    public static EntityType = 'CompanySettings';

    public StatusCode: number;
    public DefaultCustomerQuoteReportID: number;
    public CustomerInvoiceReminderSettingsID: number;
    public AutoDistributeInvoice: boolean;
    public ID: number;
    public CreatedAt: Date;
    public GLN: string;
    public SaveCustomersFromQuoteAsLead: boolean;
    public UsePaymentBankValues: boolean;
    public TaxableFromDate: LocalDate;
    public APGuid: string;
    public FactoringEmailID: number;
    public APContactID: number;
    public CreatedBy: string;
    public AutoJournalPayment: string;
    public EnableAdvancedJournalEntry: boolean;
    public AcceptableDelta4CustomerPayment: number;
    public SAFTimportAccountID: number;
    public DefaultAccrualAccountID: number;
    public ShowKIDOnCustomerInvoice: boolean;
    public VatLockedDate: LocalDate;
    public RoundingNumberOfDecimals: number;
    public UseFinancialDateToCalculateVatPercent: boolean;
    public UseXtraPaymentOrgXmlTag: boolean;
    public Deleted: boolean;
    public SettlementVatAccountID: number;
    public BookCustomerInvoiceOnDeliveryDate: boolean;
    public DefaultCustomerOrderReportID: number;
    public OrganizationNumber: string;
    public XtraPaymentOrgXmlTagValue: string;
    public ForceSupplierInvoiceApproval: boolean;
    public ShowNumberOfDecimals: number;
    public AccountGroupSetID: number;
    public FactoringNumber: number;
    public CustomerAccountID: number;
    public CustomerCreditDays: number;
    public TaxMandatoryType: number;
    public NetsIntegrationActivated: boolean;
    public TaxMandatory: boolean;
    public PeriodSeriesAccountID: number;
    public BankChargeAccountID: number;
    public EnableArchiveSupplierInvoice: boolean;
    public HideInActiveCustomers: boolean;
    public EnableSendPaymentBeforeJournaled: boolean;
    public DefaultPhoneID: number;
    public OnlyJournalMatchedPayments: boolean;
    public AccountVisibilityGroupID: number;
    public UpdatedBy: string;
    public APIncludeAttachment: boolean;
    public CompanyTypeID: number;
    public DefaultTOFCurrencySettingsID: number;
    public SalaryBankAccountID: number;
    public AcceptableDelta4CustomerPaymentAccountID: number;
    public UpdatedAt: Date;
    public Localization: string;
    public DefaultEmailID: number;
    public BaseCurrencyCodeID: number;
    public IgnorePaymentsWithoutEndToEndID: boolean;
    public LogoHideField: number;
    public InterrimPaymentAccountID: number;
    public PeriodSeriesVatID: number;
    public VatReportFormID: number;
    public AllowAvtalegiroRegularInvoice: boolean;
    public StoreDistributedInvoice: boolean;
    public EnableApprovalFlow: boolean;
    public APActivated: boolean;
    public DefaultDistributionsID: number;
    public TwoStageAutobankEnabled: boolean;
    public AccountingLockedDate: LocalDate;
    public DefaultCustomerInvoiceReportID: number;
    public EnableCheckboxesForSupplierInvoiceList: boolean;
    public BatchInvoiceMinAmount: number;
    public UseNetsIntegration: boolean;
    public AgioLossAccountID: number;
    public PaymentBankIdentification: string;
    public UseAssetRegister: boolean;
    public DefaultSalesAccountID: number;
    public Factoring: number;
    public LogoFileID: number;
    public WebAddress: string;
    public CompanyBankAccountID: number;
    public InterrimRemitAccountID: number;
    public TaxableFromLimit: number;
    public PaymentBankAgreementNumber: string;
    public SupplierAccountID: number;
    public OfficeMunicipalityNo: string;
    public AgioGainAccountID: number;
    public DefaultCustomerInvoiceReminderReportID: number;
    public UseOcrInterpretation: boolean;
    public CompanyRegistered: boolean;
    public HasAutobank: boolean;
    public RoundingType: RoundingType;
    public TaxBankAccountID: number;
    public CompanyName: string;
    public HideInActiveSuppliers: boolean;
    public LogoAlign: number;
    public DefaultAddressID: number;
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

    public StatusCode: number;
    public EntityType: string;
    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public Name: string;
    public _createguid: string;
    public Elements: Array<DistributionPlanElement>;
    public CustomFields: any;
}


export class DistributionPlanElement extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'DistributionPlanElement';

    public StatusCode: number;
    public DistributionPlanID: number;
    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public Priority: number;
    public DistributionPlanElementTypeID: number;
    public _createguid: string;
    public ElementType: DistributionPlanElementType;
    public CustomFields: any;
}


export class DistributionPlanElementType extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'DistributionPlanElementType';

    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public Name: string;
    public _createguid: string;
    public LegalEntities: Array<DistributionPlanElementTypeLegalEntity>;
    public CustomFields: any;
}


export class DistributionPlanElementTypeLegalEntity extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'DistributionPlanElementTypeLegalEntity';

    public StatusCode: number;
    public EntityType: string;
    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public DistributionPlanElementTypeID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class Distributions extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Distributions';

    public StatusCode: number;
    public CustomerQuoteDistributionPlanID: number;
    public ID: number;
    public CreatedAt: Date;
    public CustomerInvoiceReminderDistributionPlanID: number;
    public CreatedBy: string;
    public Deleted: boolean;
    public CustomerOrderDistributionPlanID: number;
    public UpdatedBy: string;
    public AnnualStatementDistributionPlanID: number;
    public UpdatedAt: Date;
    public CustomerInvoiceDistributionPlanID: number;
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

    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class EmailLog extends UniEntity {
    public static RelativeUrl = 'emails';
    public static EntityType = 'EmailLog';

    public StatusCode: number;
    public EntityType: string;
    public ID: number;
    public CreatedAt: Date;
    public JobRunID: number;
    public From: string;
    public CreatedBy: string;
    public Subject: string;
    public To: string;
    public Type: SharingType;
    public Deleted: boolean;
    public JobRunExternalRef: string;
    public ExternalReference: string;
    public EntityID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public DistributeAt: LocalDate;
    public ExternalMessage: string;
    public EntityDisplayValue: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Eventplan extends UniEntity {
    public static RelativeUrl = 'eventplans';
    public static EntityType = 'Eventplan';

    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public OperationFilter: string;
    public CreatedBy: string;
    public IsSystemPlan: boolean;
    public Deleted: boolean;
    public Active: boolean;
    public SigningKey: string;
    public UpdatedBy: string;
    public Cargo: string;
    public UpdatedAt: Date;
    public JobNames: string;
    public Name: string;
    public PlanType: EventplanType;
    public ModelFilter: string;
    public _createguid: string;
    public ExpressionFilters: Array<ExpressionFilter>;
    public Subscribers: Array<EventSubscriber>;
    public CustomFields: any;
}


export class EventSubscriber extends UniEntity {
    public static RelativeUrl = 'eventsubscribers';
    public static EntityType = 'EventSubscriber';

    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public Active: boolean;
    public EventplanID: number;
    public Headers: string;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public Endpoint: string;
    public Authorization: string;
    public Name: string;
    public _createguid: string;
    public Eventplan: Eventplan;
    public CustomFields: any;
}


export class ExpressionFilter extends UniEntity {
    public static RelativeUrl = 'expressionfilters';
    public static EntityType = 'ExpressionFilter';

    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public EntityName: string;
    public Deleted: boolean;
    public EventplanID: number;
    public UpdatedBy: string;
    public Expression: string;
    public UpdatedAt: Date;
    public _createguid: string;
    public Eventplan: Eventplan;
    public CustomFields: any;
}


export class Period extends UniEntity {
    public static RelativeUrl = 'periodes';
    public static EntityType = 'Period';

    public StatusCode: number;
    public ID: number;
    public FromDate: LocalDate;
    public CreatedAt: Date;
    public CreatedBy: string;
    public ToDate: LocalDate;
    public Deleted: boolean;
    public PeriodSeriesID: number;
    public UpdatedBy: string;
    public No: number;
    public UpdatedAt: Date;
    public PeriodTemplateID: number;
    public AccountYear: number;
    public Name: string;
    public _createguid: string;
    public PeriodTemplate: PeriodTemplate;
    public PeriodSeries: PeriodSeries;
    public CustomFields: any;
}


export class PredefinedDescription extends UniEntity {
    public static RelativeUrl = 'predefineddescriptions';
    public static EntityType = 'PredefinedDescription';

    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Type: PredefinedDescriptionType;
    public Deleted: boolean;
    public Description: string;
    public Code: string;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class ProductCategory extends UniEntity {
    public static RelativeUrl = 'productcategories';
    public static EntityType = 'ProductCategory';

    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Lft: number;
    public Comment: string;
    public Deleted: boolean;
    public Description: string;
    public UpdatedBy: string;
    public Depth: number;
    public UpdatedAt: Date;
    public ParentID: number;
    public Rght: number;
    public Status: number;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class ProductCategoryLink extends UniEntity {
    public static RelativeUrl = 'productcategorylinks';
    public static EntityType = 'ProductCategoryLink';

    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ProductID: number;
    public UpdatedAt: Date;
    public ProductCategoryID: number;
    public _createguid: string;
    public ProductCategory: ProductCategory;
    public CustomFields: any;
}


export class Sharing extends UniEntity {
    public static RelativeUrl = 'sharings';
    public static EntityType = 'Sharing';

    public StatusCode: number;
    public EntityType: string;
    public ID: number;
    public CreatedAt: Date;
    public JobRunID: number;
    public From: string;
    public CreatedBy: string;
    public Subject: string;
    public To: string;
    public Type: SharingType;
    public Deleted: boolean;
    public JobRunExternalRef: string;
    public ExternalReference: string;
    public EntityID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public DistributeAt: LocalDate;
    public ExternalMessage: string;
    public EntityDisplayValue: string;
    public _createguid: string;
    public CustomFields: any;
}


export class StatusLog extends UniEntity {
    public static RelativeUrl = 'statuslogs';
    public static EntityType = 'StatusLog';

    public EntityType: string;
    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public EntityID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public FromStatus: number;
    public ToStatus: number;
    public _createguid: string;
    public CustomFields: any;
}


export class Tracelink extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Tracelink';

    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public DestinationEntityName: string;
    public CreatedBy: string;
    public SourceEntityName: string;
    public Deleted: boolean;
    public DestinationInstanceID: number;
    public SourceInstanceID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public Date: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class User extends UniEntity {
    public static RelativeUrl = 'users';
    public static EntityType = 'User';

    public StatusCode: number;
    public GlobalIdentity: string;
    public ID: number;
    public CreatedAt: Date;
    public LastLogin: Date;
    public Protected: boolean;
    public BankIntegrationUserName: string;
    public CreatedBy: string;
    public Email: string;
    public Deleted: boolean;
    public PhoneNumber: string;
    public UpdatedBy: string;
    public DisplayName: string;
    public HasAgreedToImportDisclaimer: boolean;
    public UpdatedAt: Date;
    public UserName: string;
    public IsAutobankAdmin: boolean;
    public AuthPhoneNumber: string;
    public TwoFactorEnabled: boolean;
    public _createguid: string;
    public EndDate: Date;
    public CustomFields: any;
}


export class UniQueryDefinition extends UniEntity {
    public static RelativeUrl = 'uniquerydefinitions';
    public static EntityType = 'UniQueryDefinition';

    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public ModuleID: number;
    public CreatedBy: string;
    public UserID: number;
    public Deleted: boolean;
    public MainModelName: string;
    public Description: string;
    public Code: string;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public IsShared: boolean;
    public Category: string;
    public SortIndex: number;
    public ClickParam: string;
    public ClickUrl: string;
    public SystemGeneratedQuery: boolean;
    public Name: string;
    public _createguid: string;
    public UniQueryFilters: Array<UniQueryFilter>;
    public UniQueryFields: Array<UniQueryField>;
    public CustomFields: any;
}


export class UniQueryField extends UniEntity {
    public static RelativeUrl = 'uniqueryfields';
    public static EntityType = 'UniQueryField';

    public StatusCode: number;
    public Header: string;
    public ID: number;
    public CreatedAt: Date;
    public Index: number;
    public CreatedBy: string;
    public Field: string;
    public Deleted: boolean;
    public Alias: string;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public Path: string;
    public SumFunction: string;
    public UniQueryDefinitionID: number;
    public FieldType: number;
    public Width: string;
    public _createguid: string;
    public CustomFields: any;
}


export class UniQueryFilter extends UniEntity {
    public static RelativeUrl = 'uniqueryfilters';
    public static EntityType = 'UniQueryFilter';

    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Field: string;
    public Deleted: boolean;
    public Group: number;
    public UpdatedBy: string;
    public Operator: string;
    public UpdatedAt: Date;
    public Value: string;
    public UniQueryDefinitionID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class Team extends UniEntity {
    public static RelativeUrl = 'teams';
    public static EntityType = 'Team';

    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Lft: number;
    public Deleted: boolean;
    public UpdatedBy: string;
    public Depth: number;
    public UpdatedAt: Date;
    public ParentID: number;
    public Rght: number;
    public DimensionsID: number;
    public Name: string;
    public _createguid: string;
    public Dimensions: Dimensions;
    public Positions: Array<TeamPosition>;
    public CustomFields: any;
}


export class TeamPosition extends UniEntity {
    public static RelativeUrl = 'teampositions';
    public static EntityType = 'TeamPosition';

    public StatusCode: number;
    public ID: number;
    public FromDate: LocalDate;
    public CreatedAt: Date;
    public CreatedBy: string;
    public ToDate: LocalDate;
    public UserID: number;
    public TeamID: number;
    public Deleted: boolean;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public RelatedSharedRoleId: number;
    public Position: TeamPositionEnum;
    public ApproveOrder: number;
    public _createguid: string;
    public Team: Team;
    public CustomFields: any;
}


export class ApprovalRule extends UniEntity {
    public static RelativeUrl = 'approvalrules';
    public static EntityType = 'ApprovalRule';

    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public Description: string;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public RuleType: ApprovalRuleType;
    public Keywords: string;
    public IndustryCodes: string;
    public _createguid: string;
    public Steps: Array<ApprovalRuleStep>;
    public CustomFields: any;
}


export class ApprovalRuleStep extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ApprovalRuleStep';

    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public UserID: number;
    public Deleted: boolean;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public Limit: number;
    public ApprovalRuleID: number;
    public StepNumber: number;
    public _createguid: string;
    public ApprovalRule: ApprovalRule;
    public User: User;
    public CustomFields: any;
}


export class ApprovalSubstitute extends UniEntity {
    public static RelativeUrl = 'approvalsubstitutes';
    public static EntityType = 'ApprovalSubstitute';

    public StatusCode: number;
    public ID: number;
    public FromDate: LocalDate;
    public CreatedAt: Date;
    public CreatedBy: string;
    public ToDate: LocalDate;
    public UserID: number;
    public Deleted: boolean;
    public UpdatedBy: string;
    public SubstituteUserID: number;
    public UpdatedAt: Date;
    public _createguid: string;
    public User: User;
    public SubstituteUser: User;
    public CustomFields: any;
}


export class TaskApprovalPlan extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'TaskApprovalPlan';

    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public UserID: number;
    public Comment: string;
    public Deleted: boolean;
    public TaskID: number;
    public UpdatedBy: string;
    public Amount: number;
    public ApprovalID: number;
    public UpdatedAt: Date;
    public Limit: number;
    public ApprovalRuleID: number;
    public StepNumber: number;
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
    public EntityType: string;
    public ID: number;
    public CreatedAt: Date;
    public Order: number;
    public StatusCategoryID: number;
    public CreatedBy: string;
    public Deleted: boolean;
    public IsDepricated: boolean;
    public Description: string;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public System: boolean;
    public _createguid: string;
    public StatusCategory: StatusCategory;
    public CustomFields: any;
}


export class StatusCategory extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'StatusCategory';

    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public StatusCategoryCode: StatusCategoryCode;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class StatusRemark extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'StatusRemark';

    public StatusCode: number;
    public EntityType: string;
    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public EntityID: number;
    public UpdatedBy: string;
    public Remark: string;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class Transition extends UniEntity {
    public static RelativeUrl = 'transitions';
    public static EntityType = 'Transition';

    public EntityType: string;
    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public Controller: string;
    public UpdatedAt: Date;
    public MethodName: string;
    public _createguid: string;
    public CustomFields: any;
}


export class TransitionThreshold extends UniEntity {
    public static RelativeUrl = 'thresholds';
    public static EntityType = 'TransitionThreshold';

    public ID: number;
    public CreatedAt: Date;
    public SharedRoleId: number;
    public CreatedBy: string;
    public Deleted: boolean;
    public SharedApproveTransitionId: number;
    public UpdatedBy: string;
    public Operator: Operator;
    public Disabled: boolean;
    public UpdatedAt: Date;
    public Value: string;
    public SharedRejectTransitionId: number;
    public PropertyName: string;
    public RejectStatusCode: number;
    public Operation: OperationType;
    public _createguid: string;
    public CustomFields: any;
}


export class TransitionThresholdApproval extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'TransitionThresholdApproval';

    public ID: number;
    public CreatedAt: Date;
    public SharedRoleId: number;
    public CreatedBy: string;
    public Deleted: boolean;
    public SharedApproveTransitionId: number;
    public UpdatedBy: string;
    public Operator: Operator;
    public ApprovalID: number;
    public UpdatedAt: Date;
    public Value: string;
    public SharedRejectTransitionId: number;
    public PropertyName: string;
    public RejectStatusCode: number;
    public Operation: OperationType;
    public _createguid: string;
    public Approval: Approval;
    public CustomFields: any;
}


export class Approval extends UniEntity {
    public static RelativeUrl = 'approvals';
    public static EntityType = 'Approval';

    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public SharedRoleId: number;
    public CreatedBy: string;
    public UserID: number;
    public Deleted: boolean;
    public TaskID: number;
    public UpdatedBy: string;
    public Amount: number;
    public UpdatedAt: Date;
    public _createguid: string;
    public Thresholds: Array<TransitionThresholdApproval>;
    public Task: Task;
    public User: User;
    public CustomFields: any;
}


export class Task extends UniEntity {
    public static RelativeUrl = 'tasks';
    public static EntityType = 'Task';

    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public SharedRoleId: number;
    public CreatedBy: string;
    public UserID: number;
    public Type: TaskType;
    public Deleted: boolean;
    public SharedApproveTransitionId: number;
    public Title: string;
    public EntityID: number;
    public ModelID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public SharedRejectTransitionId: number;
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
    public EntityType: string;
    public ExpiresDate: Date;
    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public IsDepricated: boolean;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public ToStatusID: number;
    public FromStatusID: number;
    public _createguid: string;
    public FromStatus: Status;
    public ToStatus: Status;
    public Transition: Transition;
    public CustomFields: any;
}


export class Project extends UniEntity {
    public static RelativeUrl = 'projects';
    public static EntityType = 'Project';

    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public Price: number;
    public ProjectNumber: string;
    public CreatedBy: string;
    public Deleted: boolean;
    public PlannedStartdate: LocalDate;
    public WorkPlaceAddressID: number;
    public EndDate: LocalDate;
    public Description: string;
    public ProjectLeadName: string;
    public UpdatedBy: string;
    public Amount: number;
    public UpdatedAt: Date;
    public StartDate: LocalDate;
    public ProjectNumberNumeric: number;
    public ProjectNumberSeriesID: number;
    public PlannedEnddate: LocalDate;
    public Total: number;
    public CostPrice: number;
    public ProjectCustomerID: number;
    public DimensionsID: number;
    public Name: string;
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

    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public UserID: number;
    public Deleted: boolean;
    public ProjectID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public Responsibility: string;
    public Name: string;
    public _createguid: string;
    public ProjectUser: User;
    public CustomFields: any;
}


export class ProjectResourceSchedule extends UniEntity {
    public static RelativeUrl = 'projects-schedules-resources';
    public static EntityType = 'ProjectResourceSchedule';

    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public ProjectTaskScheduleID: number;
    public ProjectResourceID: number;
    public CreatedBy: string;
    public Deleted: boolean;
    public ProjectTaskID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class ProjectTask extends UniEntity {
    public static RelativeUrl = 'projects-tasks';
    public static EntityType = 'ProjectTask';

    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public Price: number;
    public Number: string;
    public CreatedBy: string;
    public Deleted: boolean;
    public EndDate: LocalDate;
    public Description: string;
    public ProjectID: number;
    public UpdatedBy: string;
    public Amount: number;
    public UpdatedAt: Date;
    public StartDate: LocalDate;
    public SuggestedNumber: string;
    public Total: number;
    public CostPrice: number;
    public Name: string;
    public _createguid: string;
    public ProjectTaskSchedules: Array<ProjectTaskSchedule>;
    public ProjectTaskResources: Array<ProjectResourceSchedule>;
    public CustomFields: any;
}


export class ProjectTaskSchedule extends UniEntity {
    public static RelativeUrl = 'projects-tasks-schedules';
    public static EntityType = 'ProjectTaskSchedule';

    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public EndDate: LocalDate;
    public ProjectTaskID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public StartDate: LocalDate;
    public _createguid: string;
    public ScheduleResources: Array<ProjectResourceSchedule>;
    public CustomFields: any;
}


export class BarnepassProduct extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'BarnepassProduct';

    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ProductID: number;
    public UpdatedAt: Date;
    public _createguid: string;
    public Product: Product;
    public CustomFields: any;
}


export class Product extends UniEntity {
    public static RelativeUrl = 'products';
    public static EntityType = 'Product';

    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public ImageFileID: number;
    public VatTypeID: number;
    public AverageCost: number;
    public CreatedBy: string;
    public Type: ProductTypeEnum;
    public Deleted: boolean;
    public Description: string;
    public UpdatedBy: string;
    public ListPrice: number;
    public UpdatedAt: Date;
    public DefaultProductCategoryID: number;
    public CalculateGrossPriceBasedOnNetPrice: boolean;
    public PartName: string;
    public Unit: string;
    public VariansParentID: number;
    public PriceIncVat: number;
    public AccountID: number;
    public PriceExVat: number;
    public CostPrice: number;
    public DimensionsID: number;
    public Name: string;
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
    public ID: number;
    public CreatedAt: Date;
    public NumberSeriesTaskID: number;
    public ToNumber: number;
    public CreatedBy: string;
    public Comment: string;
    public Deleted: boolean;
    public NumberLock: boolean;
    public UpdatedBy: string;
    public Empty: boolean;
    public DisplayName: string;
    public NumberSeriesTypeID: number;
    public Disabled: boolean;
    public UpdatedAt: Date;
    public MainAccountID: number;
    public IsDefaultForTask: boolean;
    public NextNumber: number;
    public System: boolean;
    public UseNumbersFromNumberSeriesID: number;
    public FromNumber: number;
    public AccountYear: number;
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

    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public NumberSerieTypeBID: number;
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

    public StatusCode: number;
    public EntityType: string;
    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public Name: string;
    public _createguid: string;
    public NumberSeries: Array<NumberSeries>;
    public CustomFields: any;
}


export class NumberSeriesType extends UniEntity {
    public static RelativeUrl = 'number-series-types';
    public static EntityType = 'NumberSeriesType';

    public StatusCode: number;
    public EntityType: string;
    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public Yearly: boolean;
    public UpdatedBy: string;
    public EntityField: string;
    public UpdatedAt: Date;
    public CanHaveSeveralActiveSeries: boolean;
    public System: boolean;
    public EntitySeriesIDField: string;
    public Name: string;
    public _createguid: string;
    public Series: Array<NumberSeries>;
    public CustomFields: any;
}


export class EncryptionInfo extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'EncryptionInfo';

    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public type: Type;
    public Deleted: boolean;
    public description: string;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public password: string;
    public _createguid: string;
    public CustomFields: any;
}


export class File extends UniEntity {
    public static RelativeUrl = 'files/{entitytype}/{entityid}';
    public static EntityType = 'File';

    public ContentType: string;
    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public PermaLink: string;
    public CreatedBy: string;
    public StorageReference: string;
    public Deleted: boolean;
    public Pages: number;
    public OCRData: string;
    public Description: string;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public Size: string;
    public Md5: string;
    public encryptionID: number;
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

    public TagName: string;
    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public FileID: number;
    public UpdatedAt: Date;
    public Status: number;
    public _createguid: string;
    public File: File;
    public CustomFields: any;
}


export class FileEntityLink extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'FileEntityLink';

    public StatusCode: number;
    public EntityType: string;
    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public EntityID: number;
    public UpdatedBy: string;
    public FileID: number;
    public UpdatedAt: Date;
    public IsAttachment: boolean;
    public _createguid: string;
    public File: File;
    public CustomFields: any;
}


export class ElsaUsageLog extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ElsaUsageLog';

    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public ExternalReference: string;
    public ProductType: string;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public Quantity: number;
    public DateLogged: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class AccessPointFormat extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AccessPointFormat';

    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public OutgoingID: number;
    public CreatedBy: string;
    public ResourceName: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public IncommingID: number;
    public UpdatedAt: Date;
    public Label: string;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class EHFLog extends UniEntity {
    public static RelativeUrl = 'ehf';
    public static EntityType = 'EHFLog';

    public StatusCode: number;
    public EntityType: string;
    public ID: number;
    public CreatedAt: Date;
    public JobRunID: number;
    public From: string;
    public CreatedBy: string;
    public Subject: string;
    public To: string;
    public Type: SharingType;
    public Deleted: boolean;
    public JobRunExternalRef: string;
    public ExternalReference: string;
    public EntityID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public DistributeAt: LocalDate;
    public ExternalMessage: string;
    public EntityDisplayValue: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Department extends UniEntity {
    public static RelativeUrl = 'departments';
    public static EntityType = 'Department';

    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public DepartmentManagerName: string;
    public CreatedBy: string;
    public DepartmentNumber: string;
    public Deleted: boolean;
    public Description: string;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public DepartmentNumberSeriesID: number;
    public DepartmentNumberNumeric: number;
    public Name: string;
    public _createguid: string;
    public DepartmentNumberSeries: NumberSeries;
    public CustomFields: any;
}


export class Dimension10 extends UniEntity {
    public static RelativeUrl = 'Dimension10';
    public static EntityType = 'Dimension10';

    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public Number: string;
    public CreatedBy: string;
    public Deleted: boolean;
    public Description: string;
    public NumberNumeric: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Dimension5 extends UniEntity {
    public static RelativeUrl = 'Dimension5';
    public static EntityType = 'Dimension5';

    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public Number: string;
    public CreatedBy: string;
    public Deleted: boolean;
    public Description: string;
    public NumberNumeric: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Dimension6 extends UniEntity {
    public static RelativeUrl = 'Dimension6';
    public static EntityType = 'Dimension6';

    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public Number: string;
    public CreatedBy: string;
    public Deleted: boolean;
    public Description: string;
    public NumberNumeric: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Dimension7 extends UniEntity {
    public static RelativeUrl = 'Dimension7';
    public static EntityType = 'Dimension7';

    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public Number: string;
    public CreatedBy: string;
    public Deleted: boolean;
    public Description: string;
    public NumberNumeric: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Dimension8 extends UniEntity {
    public static RelativeUrl = 'Dimension8';
    public static EntityType = 'Dimension8';

    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public Number: string;
    public CreatedBy: string;
    public Deleted: boolean;
    public Description: string;
    public NumberNumeric: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Dimension9 extends UniEntity {
    public static RelativeUrl = 'Dimension9';
    public static EntityType = 'Dimension9';

    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public Number: string;
    public CreatedBy: string;
    public Deleted: boolean;
    public Description: string;
    public NumberNumeric: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Dimensions extends UniEntity {
    public static RelativeUrl = 'dimensions';
    public static EntityType = 'Dimensions';

    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public Dimension6ID: number;
    public CreatedBy: string;
    public Dimension9ID: number;
    public RegionID: number;
    public Deleted: boolean;
    public ProjectTaskID: number;
    public ProjectID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public Dimension7ID: number;
    public ResponsibleID: number;
    public Dimension5ID: number;
    public Dimension8ID: number;
    public DepartmentID: number;
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
    public RegionCode: string;
    public ID: number;
    public Dimension9Number: string;
    public Dimension5Number: string;
    public ProjectTaskName: string;
    public ProjectNumber: string;
    public DepartmentNumber: string;
    public Dimension5Name: string;
    public Dimension7Name: string;
    public Dimension8Number: string;
    public Dimension8Name: string;
    public RegionName: string;
    public Dimension6Name: string;
    public ProjectTaskNumber: string;
    public Dimension7Number: string;
    public Dimension10Number: string;
    public Dimension6Number: string;
    public ResponsibleName: string;
    public DepartmentName: string;
    public ProjectName: string;
    public Dimension9Name: string;
    public Dimension10Name: string;
    public DimensionsID: number;
}


export class DimensionSettings extends UniEntity {
    public static RelativeUrl = 'dimensionsettings';
    public static EntityType = 'DimensionSettings';

    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public Dimension: number;
    public UpdatedAt: Date;
    public IsActive: boolean;
    public Label: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Region extends UniEntity {
    public static RelativeUrl = 'regions';
    public static EntityType = 'Region';

    public StatusCode: number;
    public RegionCode: string;
    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public Description: string;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public CountryCode: string;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Responsible extends UniEntity {
    public static RelativeUrl = 'responsibles';
    public static EntityType = 'Responsible';

    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public NameOfResponsible: string;
    public Deleted: boolean;
    public Description: string;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Contract extends UniEntity {
    public static RelativeUrl = 'contracts';
    public static EntityType = 'Contract';

    public StatusCode: number;
    public ContractCode: string;
    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public Hash: string;
    public Description: string;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public TeamsUri: string;
    public HashTransactionAddress: string;
    public Engine: ContractEngine;
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

    public StatusCode: number;
    public EntityType: string;
    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public ContractID: number;
    public Type: AddressType;
    public Deleted: boolean;
    public Address: string;
    public AssetAddress: string;
    public EntityID: number;
    public UpdatedBy: string;
    public Amount: number;
    public ContractAssetID: number;
    public UpdatedAt: Date;
    public _createguid: string;
    public Contract: Contract;
    public ContractAsset: ContractAsset;
    public CustomFields: any;
}


export class ContractAsset extends UniEntity {
    public static RelativeUrl = 'contractassets';
    public static EntityType = 'ContractAsset';

    public StatusCode: number;
    public IsPrivate: boolean;
    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public IsAutoDestroy: boolean;
    public ContractID: number;
    public Cap: number;
    public Type: AddressType;
    public SpenderAttested: boolean;
    public Deleted: boolean;
    public IsIssuedByDefinerOnly: boolean;
    public IsFixedDenominations: boolean;
    public IsTransferrable: boolean;
    public UpdatedBy: string;
    public IsCosignedByDefiner: boolean;
    public UpdatedAt: Date;
    public _createguid: string;
    public Contract: Contract;
    public CustomFields: any;
}


export class ContractDebugLog extends UniEntity {
    public static RelativeUrl = 'contractdebuglogs';
    public static EntityType = 'ContractDebugLog';

    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public Message: string;
    public CreatedBy: string;
    public ContractID: number;
    public Type: ContractEventType;
    public Deleted: boolean;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public ContractRunLogID: number;
    public _createguid: string;
    public Contract: Contract;
    public ContractRunLog: ContractRunLog;
    public CustomFields: any;
}


export class ContractParameter extends UniEntity {
    public static RelativeUrl = 'contractparameters';
    public static EntityType = 'ContractParameter';

    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public ContractID: number;
    public Deleted: boolean;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public Value: string;
    public Name: string;
    public _createguid: string;
    public Contract: Contract;
    public CustomFields: any;
}


export class ContractRunLog extends UniEntity {
    public static RelativeUrl = 'contractrunlogs';
    public static EntityType = 'ContractRunLog';

    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public ContractTriggerID: number;
    public Message: string;
    public CreatedBy: string;
    public RunTime: string;
    public ContractID: number;
    public Type: ContractEventType;
    public Deleted: boolean;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public _createguid: string;
    public Contract: Contract;
    public CustomFields: any;
}


export class ContractTransaction extends UniEntity {
    public static RelativeUrl = 'contracttransactions';
    public static EntityType = 'ContractTransaction';

    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public SenderAddress: string;
    public CreatedBy: string;
    public ContractID: number;
    public Deleted: boolean;
    public AssetAddress: string;
    public UpdatedBy: string;
    public Amount: number;
    public UpdatedAt: Date;
    public ContractAddressID: number;
    public ReceiverAddress: string;
    public _createguid: string;
    public Contract: Contract;
    public ContractAddress: ContractAddress;
    public CustomFields: any;
}


export class ContractTrigger extends UniEntity {
    public static RelativeUrl = 'contracttriggers';
    public static EntityType = 'ContractTrigger';

    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public OperationFilter: string;
    public CreatedBy: string;
    public ContractID: number;
    public Type: ContractEventType;
    public Deleted: boolean;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public ExpressionFilter: string;
    public ModelFilter: string;
    public _createguid: string;
    public Contract: Contract;
    public CustomFields: any;
}


export class Comment extends UniEntity {
    public static RelativeUrl = 'comments';
    public static EntityType = 'Comment';

    public StatusCode: number;
    public EntityType: string;
    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public Text: string;
    public EntityID: number;
    public UpdatedBy: string;
    public AuthorID: number;
    public UpdatedAt: Date;
    public _createguid: string;
    public Mentioned: Array<Mentioned>;
    public Author: User;
    public CustomFields: any;
}


export class Mentioned extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Mentioned';

    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public UserID: number;
    public Deleted: boolean;
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

    public StatusCode: number;
    public IntegrationKey: string;
    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Url: string;
    public Deleted: boolean;
    public Description: string;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public IntegrationType: TypeOfIntegration;
    public FilterDate: LocalDate;
    public Encrypt: boolean;
    public ExternalId: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Altinn extends UniEntity {
    public static RelativeUrl = 'altinn';
    public static EntityType = 'Altinn';

    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Language: string;
    public SystemPw: string;
    public Deleted: boolean;
    public PreferredLogin: TypeOfLogin;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public SystemID: string;
    public _createguid: string;
    public CustomFields: any;
}


export class AltinnReceipt extends UniEntity {
    public static RelativeUrl = 'altinnreceipts';
    public static EntityType = 'AltinnReceipt';

    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public HasBeenRegistered: boolean;
    public CreatedBy: string;
    public ReceiptID: number;
    public XmlReceipt: string;
    public UserSign: string;
    public Deleted: boolean;
    public TimeStamp: Date;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public ErrorText: string;
    public Form: string;
    public AltinnResponseData: string;
    public _createguid: string;
    public Signings: Array<AltinnSigning>;
    public CustomFields: any;
}


export class AltinnSigning extends UniEntity {
    public static RelativeUrl = 'altinnsigning';
    public static EntityType = 'AltinnSigning';

    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public DateSigned: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public SignatureReference: string;
    public SignatureText: string;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public AltinnReceiptID: number;
    public StatusText: string;
    public _createguid: string;
    public AltinnReceipt: AltinnReceipt;
    public CustomFields: any;
}


export class Barnepass extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Barnepass';

    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public inntektsaar: number;
    public _createguid: string;
    public oppgave: Array<BarnepassOppgave>;
    public CustomFields: any;
}


export class BarnepassOppgave extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'BarnepassOppgave';

    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public email: string;
    public foedselsnummer: string;
    public Deleted: boolean;
    public navn: string;
    public paaloeptBeloep: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public BarnepassID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class UserRole extends UniEntity {
    public static RelativeUrl = 'userroles';
    public static EntityType = 'UserRole';

    public ID: number;
    public CreatedAt: Date;
    public SharedRoleId: number;
    public CreatedBy: string;
    public UserID: number;
    public Deleted: boolean;
    public SharedRoleName: string;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public _createguid: string;
    public User: User;
    public CustomFields: any;
}


export class Role extends UniEntity {
    public static RelativeUrl = 'roles';
    public static EntityType = 'Role';

    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public Description: string;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public Label: string;
    public Name: string;
    public _createguid: string;
    public RolePermissions: Array<RolePermission>;
    public CustomFields: any;
}


export class RolePermission extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'RolePermission';

    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public PermissionID: number;
    public Deleted: boolean;
    public UpdatedBy: string;
    public UpdatedAt: Date;
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
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public Name: string;
    public _createguid: string;
    public RolePermissions: Array<RolePermission>;
    public CustomFields: any;
}


export class ApiMessage extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ApiMessage';

    public StatusCode: number;
    public ID: number;
    public FromDate: Date;
    public CreatedAt: Date;
    public Message: string;
    public CreatedBy: string;
    public ToDate: Date;
    public Type: ApiMessageType;
    public Deleted: boolean;
    public UpdatedBy: string;
    public Service: string;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class AvtaleGiroAgreement extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AvtaleGiroAgreement';

    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public KeyPath: string;
    public Description: string;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public NextNumber: number;
    public DataSender: string;
    public Thumbprint: string;
    public _createguid: string;
    public CustomFields: any;
}


export class AvtaleGiroBankAccount extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AvtaleGiroBankAccount';

    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public AvtaleGiroAgreementID: number;
    public BankAccountNumber: string;
    public CompanyID: number;
    public _createguid: string;
    public Company: Company;
    public CustomFields: any;
}


export class AvtaleGiroFile extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AvtaleGiroFile';

    public ID: number;
    public CreatedAt: Date;
    public AvtaleGiroMergedFileID: number;
    public CreatedBy: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public FileID: number;
    public AvtaleGiroContent: string;
    public UpdatedAt: Date;
    public AvtaleGiroAgreementID: number;
    public CompanyID: number;
    public _createguid: string;
    public Company: Company;
    public CustomFields: any;
}


export class AvtaleGiroMergedFile extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AvtaleGiroMergedFile';

    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public TransmissionNumber: number;
    public _createguid: string;
    public CustomFields: any;
}


export class BankAgreement extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'BankAgreement';

    public ID: number;
    public CreatedAt: Date;
    public AccountOwnerName: string;
    public CustomerName: string;
    public OrderMobile: string;
    public CreatedBy: string;
    public ReceiptID: string;
    public Deleted: boolean;
    public OrderName: string;
    public OrderEmail: string;
    public UpdatedBy: string;
    public ServiceAccountID: number;
    public ReceiptDate: Date;
    public UpdatedAt: Date;
    public CustomerOrgNumber: string;
    public ServiceID: string;
    public AccountOwnerOrgNumber: string;
    public CompanyID: number;
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
    public ID: number;
    public CreatedAt: Date;
    public DivisionID: number;
    public ServiceType: number;
    public CreatedBy: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ConfirmInNetbank: boolean;
    public BankAgreementID: number;
    public UpdatedAt: Date;
    public KidRule: string;
    public FileType: string;
    public _createguid: string;
    public BankAgreement: BankAgreement;
    public BankAccounts: Array<BankServiceBankAccount>;
    public CustomFields: any;
}


export class BankServiceBankAccount extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'BankServiceBankAccount';

    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public AccountNumber: string;
    public BankServiceID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public _createguid: string;
    public BankService: BankService;
    public CustomFields: any;
}


export class Company extends UniEntity {
    public static RelativeUrl = 'companies';
    public static EntityType = 'Company';

    public StatusCode: CompanyStatusCode;
    public IsTest: boolean;
    public ID: number;
    public CreatedAt: Date;
    public MigrationVersion: string;
    public CreatedBy: string;
    public IsGlobalTemplate: boolean;
    public IsTemplate: boolean;
    public Deleted: boolean;
    public OrganizationNumber: string;
    public ConnectionString: string;
    public LastActivity: Date;
    public Key: string;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public FileFlowOrgnrEmail: string;
    public SchemaName: string;
    public FileFlowEmail: string;
    public ClientNumber: number;
    public Name: string;
    public WebHookSubscriberId: string;
    public _createguid: string;
    public CustomFields: any;
}


export class CompanyAccess extends UniEntity {
    public static RelativeUrl = 'companies-access';
    public static EntityType = 'CompanyAccess';

    public StatusCode: number;
    public GlobalIdentity: string;
    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public EndDate: Date;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public StartDate: Date;
    public CompanyID: number;
    public Roles: string;
    public _createguid: string;
    public CustomFields: any;
}


export class CompanyBackup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'CompanyBackup';

    public ID: number;
    public CreatedAt: Date;
    public Message: string;
    public CompanyKey: string;
    public ScheduledForDeleteAt: Date;
    public Environment: string;
    public CustomerName: string;
    public CreatedBy: string;
    public CopyFiles: boolean;
    public ContractID: number;
    public Deleted: boolean;
    public OrgNumber: string;
    public DeletedAt: Date;
    public UpdatedBy: string;
    public BackupStatus: BackupStatus;
    public ContractType: number;
    public UpdatedAt: Date;
    public Reason: string;
    public CloudBlobName: string;
    public SchemaName: string;
    public ContainerName: string;
    public CompanyName: string;
    public _createguid: string;
    public CustomFields: any;
}


export class ContractCron extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ContractCron';

    public ID: number;
    public CreatedAt: Date;
    public ContractTriggerID: number;
    public CreatedBy: string;
    public ContractID: number;
    public Deleted: boolean;
    public UpdatedBy: string;
    public Expression: string;
    public UpdatedAt: Date;
    public CompanyID: number;
    public CompanyKey: string;
    public _createguid: string;
    public CompanyDbName: string;
    public CustomFields: any;
}


export class ContractObyte extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ContractObyte';

    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public ContractID: number;
    public Deleted: boolean;
    public Address: string;
    public AssetAddress: string;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public ContractAddressID: number;
    public CompanyID: number;
    public CompanyKey: string;
    public _createguid: string;
    public CompanyDbName: string;
    public CustomFields: any;
}


export class DeniedUserAccessLog extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'DeniedUserAccessLog';

    public ID: number;
    public CreatedAt: Date;
    public Message: string;
    public Occurred: Date;
    public CreatedBy: string;
    public Email: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public Username: string;
    public CompanyID: number;
    public CompanyName: string;
    public _createguid: string;
    public Company: Company;
    public CustomFields: any;
}


export class FailedBankFile extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'FailedBankFile';

    public ID: number;
    public CreatedAt: Date;
    public CompanyKey: string;
    public CreatedBy: string;
    public FailedReason: FailedReasonEnum;
    public FileName: string;
    public Deleted: boolean;
    public FileContent: string;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class HangfireJob extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'HangfireJob';

    public GlobalIdentity: string;
    public ID: number;
    public CreatedAt: Date;
    public CompanyKey: string;
    public JobId: string;
    public UpdatedAt: Date;
    public Completed: boolean;
    public Year: number;
    public Status: number;
    public CompanyID: number;
    public HasError: boolean;
    public CustomFields: any;
}


export class HangfireJobContext extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'HangfireJobContext';

    public GlobalIdentity: string;
    public ID: number;
    public CreatedAt: Date;
    public CompanyKey: string;
    public JobId: string;
    public UpdatedAt: Date;
    public SchemaName: string;
    public Completed: boolean;
    public Year: number;
    public Status: number;
    public CompanyID: number;
    public HasError: boolean;
    public CustomFields: any;
}


export class HangfireResponse extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'HangfireResponse';

    public GlobalIdentity: string;
    public ID: number;
    public CreatedAt: Date;
    public CompanyKey: string;
    public JobId: string;
    public UpdatedAt: Date;
    public Completed: boolean;
    public ProgressUrl: string;
    public Year: number;
    public Status: number;
    public CompanyID: number;
    public HasError: boolean;
    public State: string;
    public CustomFields: any;
}


export class KpiDefinition extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'KpiDefinition';

    public ID: number;
    public CreatedAt: Date;
    public SourceType: KpiSourceType;
    public CreatedBy: string;
    public Application: string;
    public RoleNames: string;
    public Interval: string;
    public Deleted: boolean;
    public ValueType: KpiValueType;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public Route: string;
    public CompanyID: number;
    public Name: string;
    public IsPerUser: boolean;
    public RefreshModels: string;
    public _createguid: string;
    public CustomFields: any;
}


export class KpiValue extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'KpiValue';

    public ID: number;
    public CreatedAt: Date;
    public ValueStatus: KpiValueStatus;
    public KpiDefinitionID: number;
    public CreatedBy: string;
    public UserIdentity: string;
    public Deleted: boolean;
    public Text: string;
    public UpdatedBy: string;
    public LastUpdated: Date;
    public UpdatedAt: Date;
    public Counter: number;
    public KpiName: string;
    public CompanyID: number;
    public Total: number;
    public _createguid: string;
    public CustomFields: any;
}


export class OutgoingInvoice extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'OutgoingInvoice';

    public StatusCode: number;
    public ID: number;
    public RecipientPhoneNumber: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public ISPOrganizationNumber: string;
    public Deleted: boolean;
    public ExternalReference: string;
    public InvoiceType: OutgoingInvoiceType;
    public DueDate: Date;
    public RecipientOrganizationNumber: string;
    public UpdatedBy: string;
    public Amount: number;
    public UpdatedAt: Date;
    public MetaJson: string;
    public Status: number;
    public CompanyID: number;
    public InvoiceID: number;
    public _createguid: string;
    public Company: Company;
    public CustomFields: any;
}


export class ProcessFileLog extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ProcessFileLog';

    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public Message: string;
    public CompanyKey: string;
    public CreatedBy: string;
    public UserIdentity: string;
    public EntityName: string;
    public FileName: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public FileID: number;
    public EntityCount: number;
    public UpdatedAt: Date;
    public EntityInstanceID: string;
    public CompanyID: number;
    public CompanyName: string;
    public FileType: number;
    public _createguid: string;
    public Company: Company;
    public CustomFields: any;
}


export class ServiceAccount extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ServiceAccount';

    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public KeyPath: string;
    public Description: string;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public NextNumber: number;
    public DataSender: string;
    public Thumbprint: string;
    public _createguid: string;
    public CustomFields: any;
}


export class UserVerification extends UniEntity {
    public static RelativeUrl = 'user-verifications';
    public static EntityType = 'UserVerification';

    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Email: string;
    public VerificationDate: Date;
    public UserId: number;
    public Deleted: boolean;
    public RequestOrigin: UserVerificationRequestOrigin;
    public UpdatedBy: string;
    public VerificationCode: string;
    public DisplayName: string;
    public UpdatedAt: Date;
    public UserType: UserVerificationUserType;
    public ExpirationDate: Date;
    public CompanyId: number;
    public _createguid: string;
    public CustomFields: any;
}


export class Account extends UniEntity {
    public static RelativeUrl = 'accounts';
    public static EntityType = 'Account';

    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public UseVatDeductionGroupID: number;
    public VatTypeID: number;
    public AccountSetupID: number;
    public CustomerID: number;
    public CreatedBy: string;
    public CostAllocationID: number;
    public Deleted: boolean;
    public LockManualPosts: boolean;
    public Active: boolean;
    public AccountNumber: number;
    public SaftMappingAccountID: number;
    public Description: string;
    public UpdatedBy: string;
    public SupplierID: number;
    public EmployeeID: number;
    public UpdatedAt: Date;
    public CurrencyCodeID: number;
    public TopLevelAccountGroupID: number;
    public DoSynchronize: boolean;
    public AccountGroupID: number;
    public Visible: boolean;
    public AccountName: string;
    public UsePostPost: boolean;
    public Keywords: string;
    public SystemAccount: boolean;
    public AccountID: number;
    public DimensionsID: number;
    public Locked: boolean;
    public _createguid: string;
    public VatType: VatType;
    public MainAccount: Account;
    public MandatoryDimensions: Array<AccountMandatoryDimension>;
    public TopLevelAccountGroup: AccountGroup;
    public AccountGroup: AccountGroup;
    public Customer: Customer;
    public Supplier: Supplier;
    public Employee: Employee;
    public Dimensions: Dimensions;
    public Alias: Array<AccountAlias>;
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
    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public AccountID: number;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class AccountGroup extends UniEntity {
    public static RelativeUrl = 'accountgroups';
    public static EntityType = 'AccountGroup';

    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public MainGroupID: number;
    public CreatedBy: string;
    public Deleted: boolean;
    public AccountGroupSetupID: number;
    public AccountGroupSetID: number;
    public UpdatedBy: string;
    public CompatibleAccountID: number;
    public UpdatedAt: Date;
    public Summable: boolean;
    public GroupNumber: string;
    public AccountID: number;
    public Name: string;
    public _createguid: string;
    public MainGroup: AccountGroup;
    public AccountGroupSet: AccountGroupSet;
    public CustomFields: any;
}


export class AccountGroupSet extends UniEntity {
    public static RelativeUrl = 'accountgroupsets';
    public static EntityType = 'AccountGroupSet';

    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public Shared: boolean;
    public UpdatedBy: string;
    public ToAccountNumber: number;
    public UpdatedAt: Date;
    public System: boolean;
    public FromAccountNumber: number;
    public SubAccountAllowed: boolean;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class AccountMandatoryDimension extends UniEntity {
    public static RelativeUrl = 'accountmandatorydimension';
    public static EntityType = 'AccountMandatoryDimension';

    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public MandatoryType: number;
    public CreatedBy: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public DimensionNo: number;
    public AccountID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class Accrual extends UniEntity {
    public static RelativeUrl = 'accruals';
    public static EntityType = 'Accrual';

    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public AccrualJournalEntryMode: number;
    public ResultAccountID: number;
    public CreatedBy: string;
    public Deleted: boolean;
    public JournalEntryLineDraftID: number;
    public UpdatedBy: string;
    public BalanceAccountID: number;
    public UpdatedAt: Date;
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
    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public JournalEntryDraftLineID: number;
    public UpdatedBy: string;
    public Amount: number;
    public UpdatedAt: Date;
    public AccrualID: number;
    public PeriodNo: number;
    public AccountYear: number;
    public _createguid: string;
    public Accrual: Accrual;
    public JournalEntryLineDraft: JournalEntryLineDraft;
    public CustomFields: any;
}


export class ApprovalData extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ApprovalData';

    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public EntityName: string;
    public Deleted: boolean;
    public EntityID: number;
    public UpdatedBy: string;
    public EntityCount: number;
    public VerificationMethod: string;
    public EntityHash: string;
    public UpdatedAt: Date;
    public VerificationReference: string;
    public EntityReference: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Asset extends UniEntity {
    public static RelativeUrl = 'assets';
    public static EntityType = 'Asset';

    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public ScrapValue: number;
    public PurchaseAmount: number;
    public Deleted: boolean;
    public DepreciationCycle: number;
    public AutoDepreciation: boolean;
    public UpdatedBy: string;
    public Lifetime: number;
    public BalanceAccountID: number;
    public AssetGroupCode: string;
    public UpdatedAt: Date;
    public DepreciationAccountID: number;
    public NetFinancialValue: number;
    public DepreciationStartDate: LocalDate;
    public PurchaseDate: LocalDate;
    public DimensionsID: number;
    public Name: string;
    public _createguid: string;
    public Status: string;
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

    public StatusCode: number;
    public InitialBIC: string;
    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Web: string;
    public EmailID: number;
    public Deleted: boolean;
    public UpdatedBy: string;
    public PhoneID: number;
    public UpdatedAt: Date;
    public BIC: string;
    public AddressID: number;
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

    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public BankAccountType: string;
    public IBAN: string;
    public Deleted: boolean;
    public CompanySettingsID: number;
    public AccountNumber: string;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public IntegrationSettings: string;
    public BankID: number;
    public Label: string;
    public AccountID: number;
    public BusinessRelationID: number;
    public IntegrationStatus: number;
    public Locked: boolean;
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
    public ID: number;
    public CreatedAt: Date;
    public PropertiesJson: string;
    public CreatedBy: string;
    public ServiceProvider: number;
    public Email: string;
    public BankAccountID: number;
    public IsBankBalance: boolean;
    public DefaultAgreement: boolean;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ServiceTemplateID: string;
    public HasNewAccountInformation: boolean;
    public UpdatedAt: Date;
    public IsInbound: boolean;
    public IsOutgoing: boolean;
    public ServiceID: string;
    public HasOrderedIntegrationChange: boolean;
    public BankAcceptance: boolean;
    public Name: string;
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
    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public Priority: number;
    public IsActive: boolean;
    public Rule: string;
    public AccountID: number;
    public Name: string;
    public _createguid: string;
    public Account: Account;
    public CustomFields: any;
}


export class BankStatement extends UniEntity {
    public static RelativeUrl = 'bankstatements';
    public static EntityType = 'BankStatement';

    public EndBalance: number;
    public StatusCode: number;
    public ID: number;
    public FromDate: LocalDate;
    public CreatedAt: Date;
    public CreatedBy: string;
    public ToDate: LocalDate;
    public BankAccountID: number;
    public CurrencyCode: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public Amount: number;
    public FileID: number;
    public UpdatedAt: Date;
    public ArchiveReference: string;
    public StartBalance: number;
    public AccountID: number;
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

    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public CurrencyCode: string;
    public Deleted: boolean;
    public CID: string;
    public Description: string;
    public UpdatedBy: string;
    public Amount: number;
    public ReceiverAccount: string;
    public UpdatedAt: Date;
    public OpenAmount: number;
    public BookingDate: LocalDate;
    public OpenAmountCurrency: number;
    public ArchiveReference: string;
    public StructuredReference: string;
    public Category: string;
    public SenderAccount: string;
    public ValueDate: LocalDate;
    public Receivername: string;
    public TransactionId: string;
    public BankStatementID: number;
    public InvoiceNumber: string;
    public AmountCurrency: number;
    public SenderName: string;
    public _createguid: string;
    public BankStatement: BankStatement;
    public CustomFields: any;
}


export class BankStatementMatch extends UniEntity {
    public static RelativeUrl = 'bankstatementmatch';
    public static EntityType = 'BankStatementMatch';

    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public BankStatementEntryID: number;
    public JournalEntryLineID: number;
    public Group: string;
    public UpdatedBy: string;
    public Amount: number;
    public UpdatedAt: Date;
    public Batch: string;
    public _createguid: string;
    public BankStatementEntry: BankStatementEntry;
    public JournalEntryLine: JournalEntryLine;
    public CustomFields: any;
}


export class BankStatementRule extends UniEntity {
    public static RelativeUrl = 'bankstatementrules';
    public static EntityType = 'BankStatementRule';

    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public EntryText: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public Priority: number;
    public IsActive: boolean;
    public Rule: string;
    public AccountID: number;
    public DimensionsID: number;
    public Name: string;
    public _createguid: string;
    public Dimensions: Dimensions;
    public Account: Account;
    public CustomFields: any;
}


export class Budget extends UniEntity {
    public static RelativeUrl = 'budgets';
    public static EntityType = 'Budget';

    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public AccountingYear: number;
    public Name: string;
    public _createguid: string;
    public Entries: Array<BudgetEntry>;
    public CustomFields: any;
}


export class BudgetEntry extends UniEntity {
    public static RelativeUrl = 'budgetentries';
    public static EntityType = 'BudgetEntry';

    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public BudgetID: number;
    public Deleted: boolean;
    public UpdatedBy: string;
    public Amount: number;
    public UpdatedAt: Date;
    public AccountID: number;
    public DimensionsID: number;
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

    public StatusCode: number;
    public ReInvoicingTurnoverProductID: number;
    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public AssetWriteoffAccountID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public ReInvoicingMethod: number;
    public AssetSaleProfitBalancingAccountID: number;
    public AssetSaleProfitNoVatAccountID: number;
    public AssetSaleLossVatAccountID: number;
    public AssetSaleLossBalancingAccountID: number;
    public AssetSaleProductID: number;
    public ReInvoicingCostsharingProductID: number;
    public AssetSaleProfitVatAccountID: number;
    public AssetSaleLossNoVatAccountID: number;
    public _createguid: string;
    public ReInvoicingCostsharingProduct: Product;
    public ReInvoicingTurnoverProduct: Product;
    public CustomFields: any;
}


export class CompanyBankAccount extends UniEntity {
    public static RelativeUrl = 'companybankaccounts';
    public static EntityType = 'CompanyBankAccount';

    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public IsIncomming: boolean;
    public CreatedBy: string;
    public IsSalary: boolean;
    public BankAccountID: number;
    public Deleted: boolean;
    public UpdatedBy: string;
    public CreditAmount: number;
    public UpdatedAt: Date;
    public IsOutgoing: boolean;
    public AccountID: number;
    public Name: string;
    public IsTax: boolean;
    public _createguid: string;
    public BankAccount: BankAccount;
    public Account: Account;
    public CustomFields: any;
}


export class CostAllocation extends UniEntity {
    public static RelativeUrl = 'costallocations';
    public static EntityType = 'CostAllocation';

    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public Name: string;
    public _createguid: string;
    public Items: Array<CostAllocationItem>;
    public CustomFields: any;
}


export class CostAllocationItem extends UniEntity {
    public static RelativeUrl = 'costallocationitems';
    public static EntityType = 'CostAllocationItem';

    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public VatTypeID: number;
    public CreatedBy: string;
    public CostAllocationID: number;
    public Deleted: boolean;
    public Description: string;
    public UpdatedBy: string;
    public Amount: number;
    public UpdatedAt: Date;
    public Percent: number;
    public AccountID: number;
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

    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public DueDate: LocalDate;
    public EndDate: LocalDate;
    public Description: string;
    public UpdatedBy: string;
    public Amount: number;
    public IsCustomerPayment: boolean;
    public UpdatedAt: Date;
    public CurrencyCodeID: number;
    public CustomLiquidityPaymentType: CustomLiquidityPaymentInterval;
    public AmountCurrency: number;
    public _createguid: string;
    public currency: CurrencyCode;
    public CustomFields: any;
}


export class DepreciationLine extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'DepreciationLine';

    public StatusCode: number;
    public DepreciationJELineID: number;
    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public DepreciationType: number;
    public Deleted: boolean;
    public UpdatedBy: string;
    public AssetJELineID: number;
    public UpdatedAt: Date;
    public AssetID: number;
    public _createguid: string;
    public DepreciationJELine: JournalEntryLine;
    public AssetJELine: JournalEntryLine;
    public CustomFields: any;
}


export class FinancialYear extends UniEntity {
    public static RelativeUrl = 'financialyears';
    public static EntityType = 'FinancialYear';

    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ValidFrom: LocalDate;
    public UpdatedAt: Date;
    public ValidTo: LocalDate;
    public Year: number;
    public _createguid: string;
    public CustomFields: any;
}


export class JournalEntry extends UniEntity {
    public static RelativeUrl = 'journalentries';
    public static EntityType = 'JournalEntry';

    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public NumberSeriesID: number;
    public NumberSeriesTaskID: number;
    public CreatedBy: string;
    public Deleted: boolean;
    public Description: string;
    public JournalEntryDraftGroup: string;
    public UpdatedBy: string;
    public FinancialYearID: number;
    public UpdatedAt: Date;
    public JournalEntryAccrualID: number;
    public JournalEntryNumberNumeric: number;
    public JournalEntryNumber: string;
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

    public StatusCode: number;
    public PeriodID: number;
    public FinancialDate: LocalDate;
    public OriginalJournalEntryPost: number;
    public ID: number;
    public CreatedAt: Date;
    public RestAmount: number;
    public CurrencyExchangeRate: number;
    public CustomerInvoiceID: number;
    public VatTypeID: number;
    public CreatedBy: string;
    public ReferenceCreditPostID: number;
    public ReferenceOriginalPostID: number;
    public SubAccountID: number;
    public VatDeductionPercent: number;
    public PaymentID: string;
    public Deleted: boolean;
    public VatDate: LocalDate;
    public PaymentInfoTypeID: number;
    public DueDate: LocalDate;
    public JournalEntryTypeID: number;
    public Description: string;
    public JournalEntryLineDraftID: number;
    public UpdatedBy: string;
    public Amount: number;
    public BatchNumber: number;
    public VatPercent: number;
    public UpdatedAt: Date;
    public Signature: string;
    public VatPeriodID: number;
    public CurrencyCodeID: number;
    public SupplierInvoiceID: number;
    public VatJournalEntryPostID: number;
    public AccrualID: number;
    public RestAmountCurrency: number;
    public VatReportID: number;
    public JournalEntryID: number;
    public CustomerOrderID: number;
    public PostPostJournalEntryLineID: number;
    public InvoiceNumber: string;
    public TaxBasisAmountCurrency: number;
    public TaxBasisAmount: number;
    public AccountID: number;
    public AmountCurrency: number;
    public PaymentReferenceID: number;
    public DimensionsID: number;
    public JournalEntryNumberNumeric: number;
    public RegisteredDate: LocalDate;
    public JournalEntryNumber: string;
    public OriginalReferencePostID: number;
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

    public StatusCode: number;
    public PeriodID: number;
    public FinancialDate: LocalDate;
    public ID: number;
    public CreatedAt: Date;
    public CurrencyExchangeRate: number;
    public CustomerInvoiceID: number;
    public VatTypeID: number;
    public CreatedBy: string;
    public SubAccountID: number;
    public VatDeductionPercent: number;
    public PaymentID: string;
    public Deleted: boolean;
    public VatDate: LocalDate;
    public PaymentInfoTypeID: number;
    public DueDate: LocalDate;
    public JournalEntryTypeID: number;
    public Description: string;
    public UpdatedBy: string;
    public Amount: number;
    public BatchNumber: number;
    public VatPercent: number;
    public UpdatedAt: Date;
    public Signature: string;
    public VatPeriodID: number;
    public CurrencyCodeID: number;
    public SupplierInvoiceID: number;
    public AccrualID: number;
    public JournalEntryID: number;
    public CustomerOrderID: number;
    public PostPostJournalEntryLineID: number;
    public InvoiceNumber: string;
    public TaxBasisAmountCurrency: number;
    public TaxBasisAmount: number;
    public AccountID: number;
    public AmountCurrency: number;
    public PaymentReferenceID: number;
    public DimensionsID: number;
    public JournalEntryNumberNumeric: number;
    public RegisteredDate: LocalDate;
    public JournalEntryNumber: string;
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
    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public VisibleModules: string;
    public TraceLinkTypes: string;
    public Name: string;
    public ColumnSetUp: string;
    public _createguid: string;
    public CustomFields: any;
}


export class JournalEntrySourceSerie extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'JournalEntrySourceSerie';

    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public JournalEntrySourceID: number;
    public _createguid: string;
    public JournalEntrySourceEntityName: string;
    public JournalEntrySourceInstanceID: number;
    public CustomFields: any;
}


export class JournalEntryType extends UniEntity {
    public static RelativeUrl = 'journalentrytypes';
    public static EntityType = 'JournalEntryType';

    public ID: number;
    public CreatedAt: Date;
    public Number: number;
    public MainName: string;
    public CreatedBy: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public DisplayName: string;
    public UpdatedAt: Date;
    public ExpectNegativeAmount: boolean;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class LedgerSuggestion extends UniEntity {
    public ID: number;
    public OrgNumber: string;
    public IndustryCode: string;
    public Source: SuggestionSource;
    public BusinessType: string;
    public IndustryName: string;
    public Name: string;
}


export class Payment extends UniEntity {
    public static RelativeUrl = 'payments';
    public static EntityType = 'Payment';

    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public CurrencyExchangeRate: number;
    public CustomerInvoiceID: number;
    public PaymentStatusReportFileID: number;
    public CreatedBy: string;
    public Proprietary: string;
    public Debtor: string;
    public ExternalBankAccountNumber: string;
    public IsExternal: boolean;
    public ReconcilePayment: boolean;
    public PaymentID: string;
    public PaymentDate: LocalDate;
    public Deleted: boolean;
    public IsPaymentClaim: boolean;
    public AutoJournal: boolean;
    public DueDate: LocalDate;
    public CustomerInvoiceReminderID: number;
    public Description: string;
    public PaymentBatchID: number;
    public UpdatedBy: string;
    public Amount: number;
    public IsCustomerPayment: boolean;
    public SerialNumberOrAcctSvcrRef: string;
    public OcrPaymentStrings: string;
    public PaymentNotificationReportFileID: number;
    public UpdatedAt: Date;
    public InPaymentID: string;
    public Domain: string;
    public CurrencyCodeID: number;
    public StatusText: string;
    public SupplierInvoiceID: number;
    public JournalEntryID: number;
    public BankChargeAmount: number;
    public XmlTagPmtInfIdReference: string;
    public FromBankAccountID: number;
    public InvoiceNumber: string;
    public ToBankAccountID: number;
    public AmountCurrency: number;
    public BusinessRelationID: number;
    public IsPaymentCancellationRequest: boolean;
    public PaymentCodeID: number;
    public XmlTagEndToEndIdReference: string;
    public _createguid: string;
    public DimensionsID: number;
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

    public StatusCode: number;
    public Camt054CMsgId: string;
    public ID: number;
    public CreatedAt: Date;
    public NumberOfPayments: number;
    public PaymentStatusReportFileID: number;
    public CreatedBy: string;
    public PaymentBatchTypeID: number;
    public HashValue: string;
    public Deleted: boolean;
    public OcrTransmissionNumber: number;
    public OcrHeadingStrings: string;
    public UpdatedBy: string;
    public IsCustomerPayment: boolean;
    public ReceiptDate: Date;
    public UpdatedAt: Date;
    public TotalAmount: number;
    public PaymentFileID: number;
    public TransferredDate: Date;
    public PaymentReferenceID: string;
    public _createguid: string;
    public Payments: Array<Payment>;
    public PaymentBatchType: PaymentBatchType;
    public CustomFields: any;
}


export class PostPost extends UniEntity {
    public static RelativeUrl = 'postposts';
    public static EntityType = 'PostPost';

    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public CurrencyExchangeRate: number;
    public CreatedBy: string;
    public Deleted: boolean;
    public JournalEntryLine2ID: number;
    public UpdatedBy: string;
    public Amount: number;
    public UpdatedAt: Date;
    public Date: LocalDate;
    public CurrencyCodeID: number;
    public AmountCurrency: number;
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

    public StatusCode: number;
    public OwnCostShare: number;
    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ProductID: number;
    public UpdatedAt: Date;
    public TaxInclusiveAmount: number;
    public OwnCostAmount: number;
    public SupplierInvoiceID: number;
    public TaxExclusiveAmount: number;
    public ReInvoicingType: number;
    public _createguid: string;
    public SupplierInvoice: SupplierInvoice;
    public Product: Product;
    public Items: Array<ReInvoiceItem>;
    public CustomFields: any;
}


export class ReInvoiceItem extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ReInvoiceItem';

    public Surcharge: number;
    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public CustomerID: number;
    public CreatedBy: string;
    public Vat: number;
    public Deleted: boolean;
    public Share: number;
    public GrossAmount: number;
    public ReInvoiceID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public NetAmount: number;
    public _createguid: string;
    public Customer: Customer;
    public CustomFields: any;
}


export class SupplierInvoice extends UniEntity {
    public static RelativeUrl = 'supplierinvoices';
    public static EntityType = 'SupplierInvoice';

    public DeliveryDate: LocalDate;
    public StatusCode: number;
    public SalesPerson: string;
    public FreeTxt: string;
    public InvoiceDate: LocalDate;
    public ID: number;
    public CreatedAt: Date;
    public RestAmount: number;
    public CurrencyExchangeRate: number;
    public PayableRoundingCurrencyAmount: number;
    public Requisition: string;
    public DeliveryName: string;
    public DeliveryTermsID: number;
    public ReInvoiced: boolean;
    public ShippingAddressLine2: string;
    public CreatedBy: string;
    public DeliveryMethod: string;
    public PaymentInformation: string;
    public CreditedAmountCurrency: number;
    public CustomerPerson: string;
    public PaymentID: string;
    public BankAccountID: number;
    public Comment: string;
    public InvoiceReceiverName: string;
    public Deleted: boolean;
    public ShippingCity: string;
    public PrintStatus: number;
    public DeliveryTerm: string;
    public InvoiceType: number;
    public IsSentToPayment: boolean;
    public InvoiceCity: string;
    public ProjectID: number;
    public ReInvoiceID: number;
    public TaxExclusiveAmountCurrency: number;
    public UpdatedBy: string;
    public PayableRoundingAmount: number;
    public InternalNote: string;
    public PaymentStatus: number;
    public VatTotalsAmountCurrency: number;
    public TaxInclusiveAmountCurrency: number;
    public DefaultDimensionsID: number;
    public InvoiceCountryCode: string;
    public YourReference: string;
    public CreditDays: number;
    public SupplierID: number;
    public Payment: string;
    public OurReference: string;
    public UpdatedAt: Date;
    public CustomerOrgNumber: string;
    public PaymentDueDate: LocalDate;
    public TaxInclusiveAmount: number;
    public AmountRegards: string;
    public ShippingCountryCode: string;
    public PaymentTermsID: number;
    public SupplierOrgNumber: string;
    public CurrencyCodeID: number;
    public InvoiceCountry: string;
    public InvoiceReferenceID: number;
    public RestAmountCurrency: number;
    public InvoiceOriginType: SupplierInvoiceOriginType;
    public InvoiceAddressLine1: string;
    public JournalEntryID: number;
    public ShippingPostalCode: string;
    public TaxExclusiveAmount: number;
    public InvoicePostalCode: string;
    public InvoiceNumber: string;
    public InvoiceAddressLine3: string;
    public ShippingAddressLine1: string;
    public PaymentTerm: string;
    public Credited: boolean;
    public ShippingCountry: string;
    public CreditedAmount: number;
    public VatTotalsAmount: number;
    public InvoiceAddressLine2: string;
    public ShippingAddressLine3: string;
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

    public SumTotalIncVat: number;
    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public CurrencyExchangeRate: number;
    public VatTypeID: number;
    public AccountingCost: string;
    public CreatedBy: string;
    public ItemText: string;
    public Comment: string;
    public Deleted: boolean;
    public SumVatCurrency: number;
    public NumberOfItems: number;
    public Discount: number;
    public UpdatedBy: string;
    public InvoicePeriodStartDate: LocalDate;
    public VatPercent: number;
    public ProductID: number;
    public UpdatedAt: Date;
    public DiscountCurrency: number;
    public CalculateGrossPriceBasedOnNetPrice: boolean;
    public SumTotalExVatCurrency: number;
    public SumTotalExVat: number;
    public PriceExVatCurrency: number;
    public CurrencyCodeID: number;
    public SortIndex: number;
    public SupplierInvoiceID: number;
    public InvoicePeriodEndDate: LocalDate;
    public Unit: string;
    public DiscountPercent: number;
    public PriceIncVat: number;
    public PriceExVat: number;
    public PriceSetByUser: boolean;
    public DimensionsID: number;
    public SumVat: number;
    public SumTotalIncVatCurrency: number;
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

    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public No: string;
    public UpdatedAt: Date;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class VatDeduction extends UniEntity {
    public static RelativeUrl = 'vatdeductions';
    public static EntityType = 'VatDeduction';

    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public DeductionPercent: number;
    public UpdatedBy: string;
    public ValidFrom: LocalDate;
    public VatDeductionGroupID: number;
    public UpdatedAt: Date;
    public ValidTo: LocalDate;
    public _createguid: string;
    public VatDeductionGroup: VatDeductionGroup;
    public CustomFields: any;
}


export class VatDeductionGroup extends UniEntity {
    public static RelativeUrl = 'vatdeductiongroups';
    public static EntityType = 'VatDeductionGroup';

    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class VatPost extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'VatPost';

    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public HasTaxBasis: boolean;
    public UpdatedBy: string;
    public No: string;
    public ReportAsNegativeAmount: boolean;
    public UpdatedAt: Date;
    public VatCodeGroupID: number;
    public Name: string;
    public HasTaxAmount: boolean;
    public _createguid: string;
    public VatCodeGroup: VatCodeGroup;
    public VatReportReferences: Array<VatReportReference>;
    public CustomFields: any;
}


export class VatReport extends UniEntity {
    public static RelativeUrl = 'vatreports';
    public static EntityType = 'VatReport';

    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Comment: string;
    public Deleted: boolean;
    public Title: string;
    public UpdatedBy: string;
    public ReportedDate: Date;
    public VatReportArchivedSummaryID: number;
    public UpdatedAt: Date;
    public TerminPeriodID: number;
    public InternalComment: string;
    public VatReportTypeID: number;
    public ExternalRefNo: string;
    public JournalEntryID: number;
    public ExecutedDate: Date;
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
    public ID: number;
    public CreatedAt: Date;
    public AmountToBePayed: number;
    public CreatedBy: string;
    public PaymentBankAccountNumber: string;
    public PaymentID: string;
    public PaymentToDescription: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public PaymentDueDate: Date;
    public PaymentPeriod: string;
    public SummaryHeader: string;
    public PaymentYear: number;
    public AmountToBeReceived: number;
    public ReportName: string;
    public _createguid: string;
    public CustomFields: any;
}


export class VatReportReference extends UniEntity {
    public static RelativeUrl = 'vatreportreferences';
    public static EntityType = 'VatReportReference';

    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public VatTypeID: number;
    public CreatedBy: string;
    public Deleted: boolean;
    public VatPostID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
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
    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class VatType extends UniEntity {
    public static RelativeUrl = 'vattypes';
    public static EntityType = 'VatType';

    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public Alias: string;
    public DirectJournalEntryOnly: boolean;
    public VatCodeGroupingValue: VatCodeGroupingValueEnum;
    public UpdatedBy: string;
    public OutputVat: boolean;
    public ReversedTaxDutyVat: boolean;
    public VatCode: string;
    public AvailableInModules: boolean;
    public UpdatedAt: Date;
    public VatTypeSetupID: number;
    public VatCodeGroupID: number;
    public OutgoingAccountID: number;
    public InUse: boolean;
    public Visible: boolean;
    public IncomingAccountID: number;
    public Name: string;
    public Locked: boolean;
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

    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public VatTypeID: number;
    public CreatedBy: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ValidFrom: LocalDate;
    public VatPercent: number;
    public UpdatedAt: Date;
    public ValidTo: LocalDate;
    public _createguid: string;
    public CustomFields: any;
}


export class EntityValidationRule extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'EntityValidationRule';

    public EntityType: string;
    public ID: number;
    public CreatedAt: Date;
    public OnConflict: OnConflict;
    public Message: string;
    public CreatedBy: string;
    public ChangedByCompany: boolean;
    public Deleted: boolean;
    public SyncKey: string;
    public UpdatedBy: string;
    public Operator: Operator;
    public UpdatedAt: Date;
    public Value: string;
    public PropertyName: string;
    public System: boolean;
    public Level: ValidationLevel;
    public Operation: OperationType;
    public _createguid: string;
    public CustomFields: any;
}


export class EntityValidationRuleTemplate extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'EntityValidationRuleTemplate';

    public EntityType: string;
    public ID: number;
    public CreatedAt: Date;
    public OnConflict: OnConflict;
    public Message: string;
    public CreatedBy: string;
    public ChangedByCompany: boolean;
    public Deleted: boolean;
    public SyncKey: string;
    public UpdatedBy: string;
    public Operator: Operator;
    public UpdatedAt: Date;
    public Value: string;
    public PropertyName: string;
    public System: boolean;
    public Level: ValidationLevel;
    public Operation: OperationType;
    public _createguid: string;
    public CustomFields: any;
}


export class ComplexValidationRule extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ComplexValidationRule';

    public EntityType: string;
    public ID: number;
    public CreatedAt: Date;
    public OnConflict: OnConflict;
    public Message: string;
    public CreatedBy: string;
    public ChangedByCompany: boolean;
    public Deleted: boolean;
    public ValidationCode: number;
    public SyncKey: string;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public System: boolean;
    public Level: ValidationLevel;
    public Operation: OperationType;
    public _createguid: string;
    public CustomFields: any;
}


export class ComplexValidationRuleTemplate extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ComplexValidationRuleTemplate';

    public EntityType: string;
    public ID: number;
    public CreatedAt: Date;
    public OnConflict: OnConflict;
    public Message: string;
    public CreatedBy: string;
    public ChangedByCompany: boolean;
    public Deleted: boolean;
    public ValidationCode: number;
    public SyncKey: string;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public System: boolean;
    public Level: ValidationLevel;
    public Operation: OperationType;
    public _createguid: string;
    public CustomFields: any;
}


export class CustomField extends UniEntity {
    public static RelativeUrl = 'custom-fields';
    public static EntityType = 'CustomField';

    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public Nullable: boolean;
    public CreatedBy: string;
    public Deleted: boolean;
    public ModelID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public DataType: string;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class ValueList extends UniEntity {
    public static RelativeUrl = 'valuelists';
    public static EntityType = 'ValueList';

    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public Description: string;
    public Code: string;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public Name: string;
    public _createguid: string;
    public Items: Array<ValueItem>;
    public CustomFields: any;
}


export class ValueItem extends UniEntity {
    public static RelativeUrl = 'valueitems';
    public static EntityType = 'ValueItem';

    public ID: number;
    public CreatedAt: Date;
    public Index: number;
    public CreatedBy: string;
    public Deleted: boolean;
    public Description: string;
    public Code: string;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public Value: string;
    public ValueListID: number;
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

    public StatusCode: number;
    public EntityType: string;
    public DisplayField: string;
    public Options: string;
    public ID: number;
    public CreatedAt: Date;
    public Legend: string;
    public CreatedBy: string;
    public Placement: number;
    public Sectionheader: string;
    public Url: string;
    public Deleted: boolean;
    public Description: string;
    public ReadOnly: boolean;
    public UpdatedBy: string;
    public ComponentLayoutID: number;
    public LineBreak: boolean;
    public Property: string;
    public LookupField: boolean;
    public Placeholder: string;
    public UpdatedAt: Date;
    public Combo: number;
    public HelpText: string;
    public Hidden: boolean;
    public Alignment: Alignment;
    public ValueList: string;
    public LookupEntityType: string;
    public Label: string;
    public FieldType: FieldType;
    public Section: number;
    public FieldSet: number;
    public Width: string;
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
    public ValidTimeOff: number;
    public ExpectedTime: number;
    public WeekNumber: number;
    public WeekDay: number;
    public IsWeekend: boolean;
    public Projecttime: number;
    public Workflow: TimesheetWorkflow;
    public EndTime: Date;
    public TotalTime: number;
    public SickTime: number;
    public Date: Date;
    public Overtime: number;
    public Invoicable: number;
    public ValidTime: number;
    public StartTime: Date;
    public Status: WorkStatus;
    public Flextime: number;
    public TimeOff: number;
}


export class WorkBalanceDto extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'WorkBalanceDto';

    public StatusCode: number;
    public ValidTimeOff: number;
    public ID: number;
    public CreatedAt: Date;
    public WorkRelationID: number;
    public CreatedBy: string;
    public IsStartBalance: boolean;
    public Deleted: boolean;
    public LastDayActual: number;
    public Description: string;
    public UpdatedBy: string;
    public ValidFrom: Date;
    public Days: number;
    public BalanceFrom: Date;
    public UpdatedAt: Date;
    public Balancetype: WorkBalanceTypeEnum;
    public Minutes: number;
    public SumOvertime: number;
    public BalanceDate: Date;
    public ExpectedMinutes: number;
    public LastDayExpected: number;
    public ActualMinutes: number;
    public _createguid: string;
    public Previous: BalanceInfo;
    public Details: Array<FlexDetail>;
    public WorkRelation: WorkRelation;
    public CustomFields: any;
}


export class BalanceInfo extends UniEntity {
    public ID: number;
    public Description: string;
    public Minutes: number;
    public BalanceDate: Date;
}


export class FlexDetail extends UniEntity {
    public ValidTimeOff: number;
    public WorkedMinutes: number;
    public IsWeekend: boolean;
    public Date: Date;
    public ExpectedMinutes: number;
}


export class ContactSearchServiceResponse extends UniEntity {
    public Success: boolean;
    public ObjectName: string;
    public ErrorCode: number;
    public ErrorMessage: string;
    public Method: string;
}


export class InvoicesAndRemindersReadyToRemind extends UniEntity {
    public StatusCode: number;
    public InvoiceDate: Date;
    public RestAmount: number;
    public CurrencyExchangeRate: number;
    public CustomerInvoiceID: number;
    public CustomerID: number;
    public CustomerName: string;
    public Interest: number;
    public CustomerNumber: number;
    public ReminderNumber: number;
    public CurrencyCodeShortCode: string;
    public ExternalReference: string;
    public DontSendReminders: boolean;
    public DueDate: Date;
    public CustomerInvoiceReminderID: number;
    public TaxInclusiveAmountCurrency: number;
    public CurrencyCodeCode: string;
    public Fee: number;
    public TaxInclusiveAmount: number;
    public CurrencyCodeID: number;
    public RestAmountCurrency: number;
    public InvoiceNumber: number;
    public EmailAddress: string;
}


export class TradeHeaderCalculationSummary extends UniEntity {
    public SumTotalIncVat: number;
    public DecimalRoundingCurrency: number;
    public SumVatCurrency: number;
    public SumDiscount: number;
    public SumNoVatBasis: number;
    public SumNoVatBasisCurrency: number;
    public DecimalRounding: number;
    public SumTotalExVatCurrency: number;
    public SumTotalExVat: number;
    public SumDiscountCurrency: number;
    public SumVatBasisCurrency: number;
    public SumVatBasis: number;
    public SumVat: number;
    public SumTotalIncVatCurrency: number;
}


export class VatCalculationSummary extends UniEntity {
    public SumVatCurrency: number;
    public VatPercent: number;
    public SumVatBasisCurrency: number;
    public SumVatBasis: number;
    public SumVat: number;
}


export class InvoicePaymentData extends UniEntity {
    public CurrencyExchangeRate: number;
    public PaymentID: string;
    public PaymentDate: LocalDate;
    public AgioAmount: number;
    public BankChargeAccountID: number;
    public Amount: number;
    public AgioAccountID: number;
    public CurrencyCodeID: number;
    public BankChargeAmount: number;
    public FromBankAccountID: number;
    public AccountID: number;
    public AmountCurrency: number;
    public DimensionsID: number;
}


export class InvoiceSummary extends UniEntity {
    public SumRestAmount: number;
    public SumCreditedAmount: number;
    public SumTotalAmount: number;
}


export class CustomerNoAndName extends UniEntity {
    public Number: string;
    public Name: string;
}


export class InvoicePayment extends UniEntity {
    public FinancialDate: LocalDate;
    public JournalEntryLineID: number;
    public Description: string;
    public Amount: number;
    public JournalEntryID: number;
    public AmountCurrency: number;
    public JournalEntryNumber: string;
}


export class OrderOffer extends UniEntity {
    public Message: string;
    public CostPercentage: number;
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
    public ReasonDescription: string;
    public ReasonHelpLink: string;
    public ReasonCode: string;
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
    public KIDGarnishment: string;
    public KIDEmploymentTax: string;
    public KIDTaxDraw: string;
    public FinancialTax: number;
    public AccountNumber: string;
    public MessageID: string;
    public TaxDraw: number;
    public DueDate: Date;
    public period: number;
    public EmploymentTax: number;
    public GarnishmentTax: number;
    public KIDFinancialTax: string;
}


export class PayrollRunInAmeldingPeriod extends UniEntity {
    public PayrollrunDescription: string;
    public PayrollrunID: number;
    public PayrollrunPaydate: Date;
    public AmeldingSentdate: Date;
    public CanGenerateAddition: boolean;
}


export class PayAgaTaxDTO extends UniEntity {
    public payAga: boolean;
    public payGarnishment: boolean;
    public payFinancialTax: boolean;
    public payDate: Date;
    public payTaxDraw: boolean;
    public correctPennyDiff: boolean;
}


export class AmeldingSumUp extends UniEntity {
    public sent: Date;
    public ID: number;
    public LegalEntityNo: string;
    public type: AmeldingType;
    public meldingsID: string;
    public altInnStatus: string;
    public period: number;
    public ReplacesAMeldingID: number;
    public generated: Date;
    public year: number;
    public status: AmeldingStatus;
    public Replaces: string;
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
    public type: string;
    public endDate: Date;
    public startDate: Date;
    public permisjon: Array<EmploymentLeaves>;
}


export class EmploymentLeaves extends UniEntity {
    public startdato: Date;
    public permisjonsId: string;
    public beskrivelse: string;
    public sluttdato: Date;
    public permisjonsprosent: string;
}


export class TransactionTypes extends UniEntity {
    public tax: boolean;
    public benefit: string;
    public Base_EmploymentTax: boolean;
    public incomeType: string;
    public description: string;
    public amount: number;
}


export class AGADetails extends UniEntity {
    public type: string;
    public rate: number;
    public zoneName: string;
    public baseAmount: number;
    public sectorName: string;
}


export class Totals extends UniEntity {
    public sumTax: number;
    public sumUtleggstrekk: number;
    public sumAGA: number;
}


export class AnnualStatement extends UniEntity {
    public EmployerOrgNr: string;
    public EmployeeMunicipalName: string;
    public EmployerCity: string;
    public EmployeeSSn: string;
    public EmployerCountryCode: string;
    public EmployerTaxMandatory: boolean;
    public EmployerEmail: string;
    public EmployeeAddress: string;
    public EmployeeName: string;
    public EmployeeNumber: number;
    public EmployerPostCode: string;
    public EmployerPhoneNumber: string;
    public EmployerAddress: string;
    public EmployerCountry: string;
    public EmployeePostCode: string;
    public VacationPayBase: number;
    public EmployeeMunicipalNumber: string;
    public EmployeeCity: string;
    public EmployerWebAddress: string;
    public Year: number;
    public EmployerName: string;
    public Contributions: Array<AnnualStatementLine>;
    public PensionOrBenefits: Array<AnnualStatementLine>;
    public Deductions: Array<AnnualStatementLine>;
    public Draws: Array<AnnualStatementLine>;
}


export class AnnualStatementLine extends UniEntity {
    public IsDeduction: boolean;
    public LineIndex: number;
    public Description: string;
    public Amount: number;
    public SupplementPackageName: string;
    public Sum: number;
    public TaxReturnPost: string;
    public Supplements: Array<SupplementInfo>;
}


export class SupplementInfo extends UniEntity {
    public ValueBool: boolean;
    public ValueType: Valuetype;
    public ValueDate2: Date;
    public ValueString: string;
    public ValueDate: Date;
    public ValueMoney: number;
    public WageTypeSupplementID: number;
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
    public IsJob: boolean;
    public Text: string;
    public Title: string;
    public mainStatus: string;
    public employeestatus: Array<EmployeeStatus>;
}


export class EmployeeStatus extends UniEntity {
    public info: string;
    public ssn: string;
    public employeeNumber: number;
    public employeeID: number;
    public year: number;
    public status: string;
    public changedFields: Array<FieldsChanged>;
}


export class FieldsChanged extends UniEntity {
    public fieldName: string;
    public valFrom: string;
    public valTo: string;
}


export class EmploymentHistoryRecord extends UniEntity {
    public RegulativeStepNr: number;
    public MonthRate: number;
    public WorkPercent: number;
    public ChangedAt: Date;
    public HourRate: number;
    public RegulativeGroupID: number;
}


export class CodeListRowsCodeListRow extends UniEntity {
    public Code: string;
    public Value3: string;
    public Value1: string;
    public Value2: string;
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
    public grossPayment: number;
}


export class SumOnYear extends UniEntity {
    public advancePayment: number;
    public sumTax: number;
    public taxBase: number;
    public employeeID: number;
    public nonTaxableAmount: number;
    public netPayment: number;
    public baseVacation: number;
    public pension: number;
    public usedNonTaxableAmount: number;
    public grossPayment: number;
    public paidHolidaypay: number;
}


export class VacationPayLastYear extends UniEntity {
    public employeeID: number;
    public baseVacation: number;
    public paidHolidayPay: number;
}


export class SalaryTransactionPay extends UniEntity {
    public Withholding: number;
    public CompanyCity: string;
    public CompanyAddress: string;
    public PaymentDate: Date;
    public CompanyPostalCode: string;
    public SalaryBankAccountID: number;
    public CompanyBankAccountID: number;
    public TaxBankAccountID: number;
    public CompanyName: string;
    public PayList: Array<SalaryTransactionPayLine>;
    public SalaryBalancePayList: Array<SalaryBalancePayLine>;
}


export class SalaryTransactionPayLine extends UniEntity {
    public Tax: number;
    public PostalCode: string;
    public EmployeeName: string;
    public Address: string;
    public EmployeeNumber: number;
    public Account: string;
    public City: string;
    public NetPayment: number;
}


export class SalaryBalancePayLine extends UniEntity {
    public Text: string;
    public Account: string;
    public Kid: string;
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
    public ReportID: number;
    public Message: string;
    public Subject: string;
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
    public CreatedPayruns: number;
    public BookedPayruns: number;
    public ToPeriod: number;
    public FromPeriod: number;
    public Year: number;
    public CalculatedPayruns: number;
    public Groups: Array<ReconciliationGroup>;
}


export class ReconciliationGroup extends UniEntity {
    public AccountNumber: string;
    public Sum: number;
    public Lines: Array<ReconciliationLine>;
}


export class ReconciliationLine extends UniEntity {
    public Benefit: string;
    public WageTypeNumber: number;
    public IncomeType: string;
    public Description: string;
    public HasEmploymentTax: boolean;
    public WageTypeName: string;
    public Sum: number;
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
    public OUO: number;
    public UnionDraw: number;
    public Name: string;
    public MemberNumber: string;
}


export class SalaryTransactionSums extends UniEntity {
    public baseAGA: number;
    public Payrun: number;
    public paidAdvance: number;
    public calculatedAGA: number;
    public paidPension: number;
    public Employee: number;
    public tableTax: number;
    public basePercentTax: number;
    public netPayment: number;
    public manualTax: number;
    public baseVacation: number;
    public baseTableTax: number;
    public grossPayment: number;
    public calculatedFinancialTax: number;
    public calculatedVacationPay: number;
    public percentTax: number;
}


export class SalaryTransactionPeriodSums extends UniEntity {
    public ToPeriod: number;
    public OrgNumber: string;
    public FromPeriod: number;
    public AgaRate: number;
    public MunicipalName: string;
    public Year: number;
    public AgaZone: string;
    public Sums: SalaryTransactionSums;
    public Aga: AGACalculation;
}


export class code extends UniEntity {
    public gyldigtil: string;
    public postnr: string;
    public gmlcode: string;
    public kunfranav: string;
    public skatteOgAvgiftregel: string;
    public utloeserArbeidsgiveravgift: string;
    public gyldigfom: string;
    public uninavn: string;
    public inngaarIGrunnlagForTrekk: string;
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
    public IsTest: boolean;
    public LicenseKey: string;
    public CopyFiles: boolean;
    public IsTemplate: boolean;
    public ContractID: number;
    public ContractType: number;
    public ProductNames: string;
    public CompanyName: string;
    public TemplateCompanyKey: string;
    public CompanySettings: CompanySettings;
}


export class UserDto extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'UserDto';

    public StatusCode: number;
    public GlobalIdentity: string;
    public ID: number;
    public CreatedAt: Date;
    public LastLogin: Date;
    public Protected: boolean;
    public BankIntegrationUserName: string;
    public CreatedBy: string;
    public Email: string;
    public PermissionHandling: string;
    public Deleted: boolean;
    public PhoneNumber: string;
    public UpdatedBy: string;
    public DisplayName: string;
    public HasAgreedToImportDisclaimer: boolean;
    public UpdatedAt: Date;
    public UserName: string;
    public IsAutobankAdmin: boolean;
    public AuthPhoneNumber: string;
    public TwoFactorEnabled: boolean;
    public _createguid: string;
    public EndDate: Date;
    public License: UserLicenseInformation;
    public CustomFields: any;
}


export class UserLicenseInformation extends UniEntity {
    public GlobalIdentity: string;
    public Comment: string;
    public UserLicenseEndDate: Date;
    public Name: string;
    public UserLicenseKey: string;
    public CustomerAgreement: CustomerLicenseAgreementInfo;
    public UserType: UserLicenseType;
    public Company: CompanyLicenseInfomation;
    public ContractType: ContractLicenseType;
    public UserLicenseAgreement: LicenseAgreementInfo;
}


export class CustomerLicenseAgreementInfo extends UniEntity {
    public HasAgreedToLicense: boolean;
    public AgreementId: number;
    public CanAgreeToLicense: boolean;
}


export class UserLicenseType extends UniEntity {
    public EndDate: Date;
    public TypeID: number;
    public TypeName: string;
}


export class CompanyLicenseInfomation extends UniEntity {
    public StatusCode: LicenseEntityStatus;
    public ID: number;
    public ContractID: number;
    public ContactEmail: string;
    public ContactPerson: string;
    public EndDate: Date;
    public Key: string;
    public Name: string;
    public Agency: Agency;
}


export class Agency extends UniEntity {
    public CompanyKey: string;
    public Name: string;
}


export class ContractLicenseType extends UniEntity {
    public TrialExpiration: Date;
    public TypeID: number;
    public StartDate: Date;
    public TypeName: string;
}


export class LicenseAgreementInfo extends UniEntity {
    public HasAgreedToLicense: boolean;
    public AgreementId: number;
}


export class CreateBankUserDTO extends UniEntity {
    public AdminPassword: string;
    public Phone: string;
    public Password: string;
    public IsAdmin: boolean;
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
    public UsedFreeAmount: number;
    public GrantSum: number;
    public MaxFreeAmount: number;
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
    public UserID: string;
    public PreferredLogin: string;
    public UserPassword: string;
}


export class A06Options extends UniEntity {
    public ReportType: ReportType;
    public ToPeriod: Maaned;
    public IncludeInfoPerPerson: boolean;
    public FromPeriod: Maaned;
    public IncludeEmployments: boolean;
    public IncludeIncome: boolean;
    public Year: number;
}


export class A07Response extends UniEntity {
    public Text: string;
    public Title: string;
    public Data: string;
    public mainStatus: string;
    public DataType: string;
    public DataName: string;
}


export class SelfEmployed extends UniEntity {
    public year: number;
    public items: Array<SelfEmployedItem>;
}


export class SelfEmployedItem extends UniEntity {
    public number: string;
    public amount: number;
    public supplierID: number;
    public name: string;
}


export class SetIntegrationDataDto extends UniEntity {
    public IntegrationKey: string;
    public ExternalId: string;
}


export class CurrencyRateData extends UniEntity {
    public Factor: number;
    public ExchangeRate: number;
    public RateDate: LocalDate;
    public RateDateOld: LocalDate;
    public IsOverrideRate: boolean;
    public ExchangeRateOld: number;
    public FromCurrencyCode: CurrencyCode;
}


export class EmailDTO extends UniEntity {
    public ReportID: number;
    public Message: string;
    public Subject: string;
    public FromAddress: string;
    public CopyAddress: string;
    public Format: string;
    public Parameters: Array<ReportParameter>;
}


export class ReportParameter extends UniEntity {
    public Value: string;
    public Name: string;
}


export class DistributionPlanElementValidation extends UniEntity {
    public ElementTypeName: string;
    public IsValid: boolean;
    public Priority: number;
    public ElementType: DistributionPlanElementTypes;
    public PlanElement: DistributionPlanElement;
}


export class SendEmail extends UniEntity {
    public EntityType: string;
    public ReportID: number;
    public Message: string;
    public Subject: string;
    public FromAddress: string;
    public ExternalReference: string;
    public EntityID: number;
    public CopyAddress: string;
    public Localization: string;
    public ReportName: string;
    public Attachments: Array<SendEmailAttachment>;
    public Parameters: Array<ReportParameter>;
}


export class SendEmailAttachment extends UniEntity {
    public FileName: string;
    public Attachment: string;
    public FileID: number;
}


export class RssList extends UniEntity {
    public Url: string;
    public Description: string;
    public Title: string;
    public Items: Array<RssItem>;
}


export class RssItem extends UniEntity {
    public PubDate: string;
    public Link: string;
    public Description: string;
    public Title: string;
    public Guid: string;
    public Category: string;
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
    public FromDate: LocalDate;
    public ToDate: LocalDate;
    public Team: Team;
    public Members: Array<MemberDetails>;
}


export class MemberDetails extends UniEntity {
    public ReportBalance: number;
    public MinutesWorked: number;
    public ExpectedMinutes: number;
    public TotalBalance: number;
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
    public orgno: string;
    public contactname: string;
    public contactemail: string;
    public contactphone: string;
    public orgname: string;
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

    public StatusCode: number;
    public ID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public AccountNumber: string;
    public MissingRequiredDimensionsMessage: string;
    public journalEntryLineDraftID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public AccountID: number;
    public DimensionsID: number;
    public MissingOnlyWarningsDimensionsMessage: string;
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
    public CurrentValue: number;
    public Number: number;
    public DepreciationAccountNumber: number;
    public Lifetime: number;
    public GroupName: string;
    public GroupCode: string;
    public BalanceAccountNumber: number;
    public BalanceAccountName: string;
    public Name: string;
    public LastDepreciation: LocalDate;
    public Lines: Array<AssetReportLineDTO>;
}


export class AssetReportLineDTO extends UniEntity {
    public Type: string;
    public TypeID: number;
    public Date: LocalDate;
    public Value: number;
}


export class BankBalanceDto extends UniEntity {
    public Comment: string;
    public AccountNumber: string;
    public BalanceAvailable: number;
    public BalanceBooked: number;
    public Date: Date;
    public IsTestData: boolean;
}


export class BankData extends UniEntity {
    public IBAN: string;
    public AccountNumber: string;
    public Bank: Bank;
}


export class CreateBankIntegrationDTO extends UniEntity {
    public ServiceProvider: number;
    public Email: string;
    public BankAccountID: number;
    public IsBankBalance: boolean;
    public IsBankStatement: boolean;
    public Bank: string;
    public DisplayName: string;
    public BankApproval: boolean;
    public RequireTwoStage: boolean;
    public UserName: string;
    public IsInbound: boolean;
    public IsOutgoing: boolean;
    public Phone: string;
    public BankAcceptance: boolean;
    public Password: string;
    public TuserName: string;
    public BankAccounts: Array<BankAccountDTO>;
}


export class BankAccountDTO extends UniEntity {
    public IBAN: string;
    public BBAN: string;
    public IsBankBalance: boolean;
    public IsBankStatement: boolean;
    public IsInbound: boolean;
    public IsOutgoing: boolean;
    public Bic: string;
}


export class ZdataUpdateBankProperties extends UniEntity {
    public IsBankBalance: boolean;
    public IsBankStatement: boolean;
    public IsInbound: boolean;
    public IsOutgoing: boolean;
    public ServiceID: string;
    public Password: string;
}


export class AutobankUserDTO extends UniEntity {
    public UserID: number;
    public Phone: string;
    public Password: string;
    public IsAdmin: boolean;
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
    public BankStatementEntryID: number;
    public JournalEntryLineID: number;
    public Group: string;
    public Amount: number;
}


export class MatchRequest extends UniEntity {
    public JournalEntries: Array<MatchCandidate>;
    public BankEntries: Array<MatchCandidate>;
    public Settings: MatchSettings;
}


export class MatchCandidate extends UniEntity {
    public ID: number;
    public IsBankEntry: boolean;
    public Closed: boolean;
    public Amount: number;
    public Date: Date;
}


export class MatchSettings extends UniEntity {
    public MaxDelta: number;
    public MaxDayOffset: number;
}


export class ReconciliationStatus extends UniEntity {
    public FromDate: Date;
    public Todate: Date;
    public NumberOfItems: number;
    public TotalUnreconciled: number;
    public NumberOfUnReconciled: number;
    public TotalAmount: number;
    public IsReconciled: boolean;
    public AccountID: number;
}


export class BalanceDto extends UniEntity {
    public EndDate: Date;
    public Balance: number;
    public StartDate: Date;
    public BalanceInStatement: number;
}


export class BankfileFormat extends UniEntity {
    public SkipRows: number;
    public CustomFormat: BankFileCustomFormat;
    public IsXml: boolean;
    public LinePrefix: string;
    public IsFixed: boolean;
    public Separator: string;
    public Name: string;
    public FileExtension: string;
    public Columns: Array<BankfileColumn>;
}


export class BankfileColumn extends UniEntity {
    public IsFallBack: boolean;
    public FieldMapping: BankfileField;
    public DataType: BankfileDataType;
    public Length: number;
    public StartPos: number;
}


export class JournalSuggestion extends UniEntity {
    public FinancialDate: LocalDate;
    public BankStatementRuleID: number;
    public MatchWithEntryID: number;
    public Description: string;
    public Amount: number;
    public AccountID: number;
    public Account: Account;
}


export class ReportRow extends UniEntity {
    public Period11: number;
    public ID: number;
    public BudgetAccumulated: number;
    public SumLastYear: number;
    public Period10: number;
    public BudPeriod4: number;
    public BudPeriod1: number;
    public Period1: number;
    public AccountNumber: number;
    public BudPeriod12: number;
    public SumPeriodLastYearAccumulated: number;
    public Period6: number;
    public Period5: number;
    public Period12: number;
    public Period4: number;
    public BudPeriod10: number;
    public SumPeriodAccumulated: number;
    public Period9: number;
    public SubGroupName: string;
    public BudPeriod2: number;
    public BudPeriod5: number;
    public BudPeriod6: number;
    public Period2: number;
    public BudPeriod7: number;
    public Period7: number;
    public GroupName: string;
    public BudPeriod3: number;
    public PrecedingBalance: number;
    public BudPeriod11: number;
    public SubGroupNumber: number;
    public Period3: number;
    public Sum: number;
    public BudgetSum: number;
    public AccountName: string;
    public BudPeriod8: number;
    public GroupNumber: number;
    public SumPeriod: number;
    public AccountYear: number;
    public SumPeriodLastYear: number;
    public Period8: number;
    public IsSubTotal: boolean;
    public BudPeriod9: number;
}


export class BudgetImport extends UniEntity {
    public Budget: Budget;
}


export class LiquidityTableDTO extends UniEntity {
    public OverdueSupplierInvoices: number;
    public OverdueCustomerInvoices: number;
    public BankBalance: number;
    public BankBalanceRefferance: BankBalanceType;
    public Period: Array<DetailsDTO>;
}


export class DetailsDTO extends UniEntity {
    public Custumer: number;
    public VAT: number;
    public Supplier: number;
    public CustomPayments: number;
    public Liquidity: number;
    public Sum: number;
}


export class JournalEntryData extends UniEntity {
    public StatusCode: number;
    public FinancialDate: LocalDate;
    public NumberSeriesID: number;
    public CurrencyExchangeRate: number;
    public CustomerInvoiceID: number;
    public NumberSeriesTaskID: number;
    public CreditAccountID: number;
    public CreditAccountNumber: number;
    public VatDeductionPercent: number;
    public PaymentID: string;
    public VatDate: LocalDate;
    public DueDate: LocalDate;
    public Description: string;
    public JournalEntryNo: string;
    public CurrencyID: number;
    public DebitAccountID: number;
    public Amount: number;
    public SupplierInvoiceNo: string;
    public JournalEntryDataAccrualID: number;
    public DebitAccountNumber: number;
    public CreditVatTypeID: number;
    public SupplierInvoiceID: number;
    public JournalEntryID: number;
    public CustomerOrderID: number;
    public PostPostJournalEntryLineID: number;
    public InvoiceNumber: string;
    public AmountCurrency: number;
    public DebitVatTypeID: number;
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
    public PeriodSumYear1: number;
    public PeriodSumYear2: number;
}


export class JournalEntryLineRequestSummary extends UniEntity {
    public SumBalance: number;
    public SumDebit: number;
    public SumCredit: number;
    public SumLedger: number;
    public SumTaxBasisAmount: number;
}


export class JournalEntryLinePostPostData extends UniEntity {
    public StatusCode: number;
    public FinancialDate: Date;
    public ID: number;
    public RestAmount: number;
    public NumberOfPayments: number;
    public CurrencyExchangeRate: number;
    public SubAccountNumber: number;
    public PaymentID: string;
    public CurrencyCodeShortCode: string;
    public SumPostPostAmount: number;
    public DueDate: Date;
    public Description: string;
    public Amount: number;
    public CurrencyCodeCode: string;
    public SubAccountName: string;
    public CurrencyCodeID: number;
    public RestAmountCurrency: number;
    public PeriodNo: number;
    public JournalEntryTypeName: string;
    public JournalEntryID: number;
    public MarkedAgainstJournalEntryNumber: string;
    public InvoiceNumber: string;
    public MarkedAgainstJournalEntryLineID: number;
    public AmountCurrency: number;
    public AccountYear: number;
    public JournalEntryNumberNumeric: number;
    public SumPostPostAmountCurrency: number;
    public JournalEntryNumber: string;
    public Markings: Array<JournalEntryLinePostPostData>;
}


export class CreatePaymentBatchDTO extends UniEntity {
    public HashValue: string;
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
    public StatusCode: StatusCodeJournalEntryLine;
    public FinancialDate: Date;
    public ID: number;
    public RestAmount: number;
    public OriginalStatusCode: StatusCodeJournalEntryLine;
    public Amount: number;
    public RestAmountCurrency: number;
    public InvoiceNumber: string;
    public AmountCurrency: number;
    public OriginalRestAmount: number;
    public JournalEntryNumber: string;
    public Markings: Array<MarkingReference>;
}


export class MarkingReference extends UniEntity {
    public ID: number;
    public JournalEntryNumber: string;
}


export class SupplierInvoiceDetail extends UniEntity {
    public DeliveryDate: Date;
    public InvoiceDate: Date;
    public VatTypeID: number;
    public AccountNumber: number;
    public Description: string;
    public Amount: number;
    public VatPercent: number;
    public SupplierID: number;
    public VatCode: string;
    public SupplierInvoiceID: number;
    public VatTypeName: string;
    public AccountName: string;
    public InvoiceNumber: string;
    public AccountID: number;
    public AmountCurrency: number;
}


export class VatReportMessage extends UniEntity {
    public Message: string;
    public Level: ValidationLevel;
}


export class VatReportSummary extends UniEntity {
    public HasTaxBasis: boolean;
    public IsHistoricData: boolean;
    public VatCodeGroupNo: string;
    public VatCodeGroupID: number;
    public SumTaxBasisAmount: number;
    public SumVatAmount: number;
    public VatCodeGroupName: string;
    public NumberOfJournalEntryLines: number;
    public HasTaxAmount: boolean;
}


export class VatReportSummaryPerPost extends UniEntity {
    public VatPostID: number;
    public HasTaxBasis: boolean;
    public IsHistoricData: boolean;
    public VatPostReportAsNegativeAmount: boolean;
    public VatCodeGroupNo: string;
    public VatCodeGroupID: number;
    public SumTaxBasisAmount: number;
    public VatPostNo: string;
    public VatPostName: string;
    public SumVatAmount: number;
    public VatCodeGroupName: string;
    public NumberOfJournalEntryLines: number;
    public HasTaxAmount: boolean;
}


export class VatReportSummaryPerPostPerAccount extends UniEntity {
    public FinancialDate: Date;
    public VatJournalEntryPostAccountID: number;
    public StdVatCode: string;
    public VatDate: Date;
    public Description: string;
    public VatJournalEntryPostAccountName: string;
    public VatPostID: number;
    public HasTaxBasis: boolean;
    public Amount: number;
    public IsHistoricData: boolean;
    public VatPostReportAsNegativeAmount: boolean;
    public VatCode: string;
    public VatCodeGroupNo: string;
    public VatCodeGroupID: number;
    public SumTaxBasisAmount: number;
    public VatPostNo: string;
    public VatPostName: string;
    public SumVatAmount: number;
    public VatAccountNumber: number;
    public VatAccountName: string;
    public VatJournalEntryPostAccountNumber: number;
    public VatCodeGroupName: string;
    public VatAccountID: number;
    public TaxBasisAmount: number;
    public NumberOfJournalEntryLines: number;
    public JournalEntryNumber: string;
    public HasTaxAmount: boolean;
}


export class VatReportNotReportedJournalEntryData extends UniEntity {
    public TerminPeriodID: number;
    public SumTaxBasisAmount: number;
    public SumVatAmount: number;
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


export enum InternationalIDType{
    notSet = 0,
    Passportnumber = 1,
    SocialSecurityNumber = 2,
    TaxIdentificationNumber = 3,
    ValueAddedTaxNumber = 4,
}


export enum PaymentInterval{
    Standard = 0,
    Monthly = 1,
    Pr14Days = 2,
    Weekly = 3,
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


export enum linestate{
    Received = 0,
    Processed = 1,
    Rejected = 3,
}


export enum costtype{
    Travel = 0,
    Expense = 1,
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