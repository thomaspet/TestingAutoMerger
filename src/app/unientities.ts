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

    public ID: number;
    public UpdatedBy: string;
    public Verb: string;
    public EntityType: string;
    public EntityID: number;
    public Transaction: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Route: string;
    public Deleted: boolean;
    public Field: string;
    public UpdatedAt: Date;
    public OldValue: string;
    public Action: string;
    public NewValue: string;
    public ClientID: string;
    public _createguid: string;
    public CustomFields: any;
}


export class WorkBalance extends UniEntity {
    public static RelativeUrl = 'workbalances';
    public static EntityType = 'WorkBalance';

    public ID: number;
    public UpdatedBy: string;
    public BalanceDate: Date;
    public Balancetype: WorkBalanceTypeEnum;
    public StatusCode: number;
    public ValidFrom: Date;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public BalanceFrom: Date;
    public UpdatedAt: Date;
    public ValidTimeOff: number;
    public Minutes: number;
    public ExpectedMinutes: number;
    public IsStartBalance: boolean;
    public Description: string;
    public ActualMinutes: number;
    public Days: number;
    public WorkRelationID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class Worker extends UniEntity {
    public static RelativeUrl = 'workers';
    public static EntityType = 'Worker';

    public ID: number;
    public BusinessRelationID: number;
    public UpdatedBy: string;
    public StatusCode: number;
    public UserID: number;
    public EmployeeID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public UpdatedAt: Date;
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
    public StartTime: Date;
    public UpdatedBy: string;
    public Label: string;
    public MinutesToOrder: number;
    public StatusCode: number;
    public EndTime: Date;
    public CustomerOrderID: number;
    public CreatedBy: string;
    public Invoiceable: boolean;
    public CreatedAt: Date;
    public TransferedToPayroll: boolean;
    public WorkItemGroupID: number;
    public PayrollTrackingID: number;
    public Deleted: boolean;
    public PriceExVat: number;
    public Date: Date;
    public UpdatedAt: Date;
    public Minutes: number;
    public WorkTypeID: number;
    public DimensionsID: number;
    public LunchInMinutes: number;
    public Description: string;
    public CustomerID: number;
    public TransferedToOrder: boolean;
    public OrderItemId: number;
    public WorkRelationID: number;
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
    public StatusCode: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Deleted: boolean;
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

    public ID: number;
    public UpdatedBy: string;
    public StatusCode: number;
    public IsShared: boolean;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Name: string;
    public Deleted: boolean;
    public MinutesPerMonth: number;
    public UpdatedAt: Date;
    public LunchIncluded: boolean;
    public MinutesPerWeek: number;
    public MinutesPerYear: number;
    public _createguid: string;
    public CustomFields: any;
}


export class WorkRelation extends UniEntity {
    public static RelativeUrl = 'workrelations';
    public static EntityType = 'WorkRelation';

    public TeamID: number;
    public ID: number;
    public IsActive: boolean;
    public UpdatedBy: string;
    public CompanyID: number;
    public StatusCode: number;
    public WorkProfileID: number;
    public EndTime: Date;
    public CreatedBy: string;
    public IsPrivate: boolean;
    public CreatedAt: Date;
    public Deleted: boolean;
    public CompanyName: string;
    public UpdatedAt: Date;
    public WorkerID: number;
    public Description: string;
    public StartDate: Date;
    public WorkPercentage: number;
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
    public RegionKey: string;
    public StatusCode: number;
    public CreatedBy: string;
    public IsHalfDay: boolean;
    public CreatedAt: Date;
    public TimeoffType: number;
    public ToDate: Date;
    public FromDate: Date;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public Description: string;
    public SystemKey: string;
    public WorkRelationID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class WorkType extends UniEntity {
    public static RelativeUrl = 'worktypes';
    public static EntityType = 'WorkType';

    public SystemType: WorkTypeEnum;
    public ID: number;
    public UpdatedBy: string;
    public Price: number;
    public StatusCode: number;
    public ProductID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Name: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public WagetypeNumber: number;
    public Description: string;
    public _createguid: string;
    public Product: Product;
    public CustomFields: any;
}


export class BankFile extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'BankFile';

    public ID: number;
    public UpdatedBy: string;
    public StatusCode: number;
    public ParentFileid: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Accountnumber: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public SubCompanyID: number;
    public FileID: number;
    public _createguid: string;
    public File: File;
    public SubCompany: SubCompany;
    public CustomFields: any;
}


export class BatchInvoice extends UniEntity {
    public static RelativeUrl = 'batchinvoices';
    public static EntityType = 'BatchInvoice';

    public FreeTxt: string;
    public Operation: BatchInvoiceOperation;
    public SellerID: number;
    public YourRef: string;
    public ID: number;
    public UpdatedBy: string;
    public MinAmount: number;
    public NumberOfBatches: number;
    public StatusCode: number;
    public Processed: number;
    public CreatedBy: string;
    public NotifyEmail: boolean;
    public CreatedAt: Date;
    public OurRef: string;
    public DueDate: LocalDate;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public Comment: string;
    public InvoiceDate: LocalDate;
    public TotalToProcess: number;
    public ProjectID: number;
    public _createguid: string;
    public CustomerID: number;
    public Items: Array<BatchInvoiceItem>;
    public CustomFields: any;
}


export class BatchInvoiceItem extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'BatchInvoiceItem';

    public ID: number;
    public CustomerInvoiceID: number;
    public UpdatedBy: string;
    public BatchInvoiceID: number;
    public StatusCode: StatusCode;
    public CustomerOrderID: number;
    public CommentID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public BatchNumber: number;
    public ProjectID: number;
    public _createguid: string;
    public CustomerID: number;
    public CustomerOrder: CustomerOrder;
    public CustomerInvoice: CustomerInvoice;
    public CustomFields: any;
}


export class CampaignTemplate extends UniEntity {
    public static RelativeUrl = 'campaigntemplate';
    public static EntityType = 'CampaignTemplate';

    public ID: number;
    public UpdatedBy: string;
    public EntityName: string;
    public StatusCode: number;
    public Template: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class Customer extends UniEntity {
    public static RelativeUrl = 'customers';
    public static EntityType = 'Customer';

    public AcceptableDelta4CustomerPayment: number;
    public DefaultCustomerQuoteReportID: number;
    public DefaultCustomerInvoiceReportID: number;
    public SubAccountNumberSeriesID: number;
    public FactoringNumber: number;
    public ID: number;
    public GLN: string;
    public PaymentTermsID: number;
    public BusinessRelationID: number;
    public UpdatedBy: string;
    public DeliveryTermsID: number;
    public ReminderEmailAddress: string;
    public CustomerInvoiceReminderSettingsID: number;
    public StatusCode: number;
    public SocialSecurityNumber: string;
    public EfakturaIdentifier: string;
    public DontSendReminders: boolean;
    public AvtaleGiroNotification: boolean;
    public CreatedBy: string;
    public IsPrivate: boolean;
    public CreatedAt: Date;
    public DefaultSellerID: number;
    public WebUrl: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public CustomerNumberKidAlias: string;
    public PeppolAddress: string;
    public OrgNumber: string;
    public AcceptableDelta4CustomerPaymentAccountID: number;
    public CreditDays: number;
    public CurrencyCodeID: number;
    public DimensionsID: number;
    public CustomerNumber: number;
    public AvtaleGiro: boolean;
    public DefaultDistributionsID: number;
    public EInvoiceAgreementReference: string;
    public DefaultCustomerOrderReportID: number;
    public Localization: string;
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

    public AmountRegards: string;
    public FreeTxt: string;
    public DistributionPlanID: number;
    public InvoiceReceiverName: string;
    public ID: number;
    public InvoiceType: number;
    public TaxInclusiveAmount: number;
    public PaymentTermsID: number;
    public SalesPerson: string;
    public InvoicePostalCode: string;
    public CustomerName: string;
    public Payment: string;
    public DeliveryDate: LocalDate;
    public UpdatedBy: string;
    public DeliveryTermsID: number;
    public ShippingCountry: string;
    public ShippingCountryCode: string;
    public InvoiceCity: string;
    public CreditedAmount: number;
    public Requisition: string;
    public InvoiceAddressLine1: string;
    public StatusCode: number;
    public ShippingAddressLine2: string;
    public RestAmount: number;
    public DeliveryTerm: string;
    public PayableRoundingAmount: number;
    public CollectorStatusCode: number;
    public CurrencyExchangeRate: number;
    public DontSendReminders: boolean;
    public OurReference: string;
    public UpdateCurrencyAmountsOnDateChange: boolean;
    public CustomerPerson: string;
    public BankAccountID: number;
    public CreatedBy: string;
    public SupplierOrgNumber: string;
    public ShippingAddressLine1: string;
    public CreatedAt: Date;
    public TaxExclusiveAmountCurrency: number;
    public DefaultSellerID: number;
    public PaymentDueDate: LocalDate;
    public CreditedAmountCurrency: number;
    public UseReportID: number;
    public InvoiceNumber: string;
    public ShippingAddressLine3: string;
    public PaymentTerm: string;
    public AccrualID: number;
    public ShippingCity: string;
    public InvoiceReferenceID: number;
    public Deleted: boolean;
    public InternalNote: string;
    public PaymentID: string;
    public InvoiceAddressLine2: string;
    public UpdatedAt: Date;
    public Comment: string;
    public InvoiceNumberSeriesID: number;
    public ShippingPostalCode: string;
    public YourReference: string;
    public CustomerOrgNumber: string;
    public CreditDays: number;
    public CurrencyCodeID: number;
    public ExternalReference: string;
    public Credited: boolean;
    public InvoiceCountryCode: string;
    public RestAmountCurrency: number;
    public VatTotalsAmountCurrency: number;
    public TaxInclusiveAmountCurrency: number;
    public InvoiceCountry: string;
    public ExternalStatus: number;
    public PaymentInfoTypeID: number;
    public DeliveryMethod: string;
    public PaymentInformation: string;
    public LastPaymentDate: LocalDate;
    public CustomerID: number;
    public JournalEntryID: number;
    public VatTotalsAmount: number;
    public InvoiceAddressLine3: string;
    public InvoiceDate: LocalDate;
    public DeliveryName: string;
    public PayableRoundingCurrencyAmount: number;
    public TaxExclusiveAmount: number;
    public PrintStatus: number;
    public EmailAddress: string;
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

    public Discount: number;
    public ID: number;
    public AccountingCost: string;
    public SumTotalIncVat: number;
    public CustomerInvoiceID: number;
    public UpdatedBy: string;
    public SortIndex: number;
    public SumTotalExVatCurrency: number;
    public StatusCode: number;
    public VatPercent: number;
    public ItemText: string;
    public CurrencyExchangeRate: number;
    public PriceIncVat: number;
    public SumTotalIncVatCurrency: number;
    public ProductID: number;
    public CreatedBy: string;
    public ItemSourceID: number;
    public CreatedAt: Date;
    public SumTotalExVat: number;
    public VatTypeID: number;
    public SumVatCurrency: number;
    public InvoicePeriodStartDate: LocalDate;
    public SumVat: number;
    public Deleted: boolean;
    public PriceExVatCurrency: number;
    public PriceExVat: number;
    public UpdatedAt: Date;
    public Comment: string;
    public Unit: string;
    public CostPrice: number;
    public NumberOfItems: number;
    public DiscountCurrency: number;
    public CurrencyCodeID: number;
    public DiscountPercent: number;
    public DimensionsID: number;
    public PriceSetByUser: boolean;
    public InvoicePeriodEndDate: LocalDate;
    public CalculateGrossPriceBasedOnNetPrice: boolean;
    public AccountID: number;
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

    public ID: number;
    public CustomerInvoiceID: number;
    public DebtCollectionFee: number;
    public UpdatedBy: string;
    public InterestFee: number;
    public Title: string;
    public RemindedDate: LocalDate;
    public StatusCode: number;
    public RestAmount: number;
    public CurrencyExchangeRate: number;
    public CreatedBy: string;
    public ReminderFeeCurrency: number;
    public CreatedAt: Date;
    public DueDate: LocalDate;
    public Deleted: boolean;
    public ReminderFee: number;
    public UpdatedAt: Date;
    public CurrencyCodeID: number;
    public RestAmountCurrency: number;
    public DimensionsID: number;
    public RunNumber: number;
    public ReminderNumber: number;
    public Description: string;
    public CreatedByReminderRuleID: number;
    public InterestFeeCurrency: number;
    public Notified: boolean;
    public EmailAddress: string;
    public DebtCollectionFeeCurrency: number;
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
    public Title: string;
    public CustomerInvoiceReminderSettingsID: number;
    public StatusCode: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public MinimumDaysFromDueDate: number;
    public Deleted: boolean;
    public ReminderFee: number;
    public UpdatedAt: Date;
    public CreditDays: number;
    public UseMaximumLegalReminderFee: boolean;
    public ReminderNumber: number;
    public Description: string;
    public _createguid: string;
    public CustomerInvoiceReminderSettings: CustomerInvoiceReminderSettings;
    public CustomFields: any;
}


export class CustomerInvoiceReminderSettings extends UniEntity {
    public static RelativeUrl = 'invoiceremindersettings';
    public static EntityType = 'CustomerInvoiceReminderSettings';

    public ID: number;
    public UpdatedBy: string;
    public StatusCode: number;
    public AcceptPaymentWithoutReminderFee: boolean;
    public CreatedBy: string;
    public CreatedAt: Date;
    public MinimumAmountToRemind: number;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public DebtCollectionSettingsID: number;
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

    public FreeTxt: string;
    public DistributionPlanID: number;
    public InvoiceReceiverName: string;
    public ID: number;
    public TaxInclusiveAmount: number;
    public PaymentTermsID: number;
    public SalesPerson: string;
    public InvoicePostalCode: string;
    public CustomerName: string;
    public OrderDate: LocalDate;
    public DeliveryDate: LocalDate;
    public UpdatedBy: string;
    public DeliveryTermsID: number;
    public ShippingCountry: string;
    public RestExclusiveAmountCurrency: number;
    public ShippingCountryCode: string;
    public InvoiceCity: string;
    public Requisition: string;
    public InvoiceAddressLine1: string;
    public StatusCode: number;
    public ShippingAddressLine2: string;
    public DeliveryTerm: string;
    public PayableRoundingAmount: number;
    public CurrencyExchangeRate: number;
    public OurReference: string;
    public UpdateCurrencyAmountsOnDateChange: boolean;
    public CustomerPerson: string;
    public CreatedBy: string;
    public OrderNumber: number;
    public SupplierOrgNumber: string;
    public ShippingAddressLine1: string;
    public CreatedAt: Date;
    public TaxExclusiveAmountCurrency: number;
    public DefaultSellerID: number;
    public UseReportID: number;
    public ShippingAddressLine3: string;
    public PaymentTerm: string;
    public AccrualID: number;
    public ShippingCity: string;
    public OrderNumberSeriesID: number;
    public Deleted: boolean;
    public InternalNote: string;
    public InvoiceAddressLine2: string;
    public UpdatedAt: Date;
    public Comment: string;
    public ShippingPostalCode: string;
    public UpdateCurrencyOnToInvoice: boolean;
    public YourReference: string;
    public CustomerOrgNumber: string;
    public CreditDays: number;
    public CurrencyCodeID: number;
    public InvoiceCountryCode: string;
    public RestAmountCurrency: number;
    public VatTotalsAmountCurrency: number;
    public TaxInclusiveAmountCurrency: number;
    public InvoiceCountry: string;
    public PaymentInfoTypeID: number;
    public DeliveryMethod: string;
    public CustomerID: number;
    public VatTotalsAmount: number;
    public InvoiceAddressLine3: string;
    public ReadyToInvoice: boolean;
    public DeliveryName: string;
    public PayableRoundingCurrencyAmount: number;
    public TaxExclusiveAmount: number;
    public PrintStatus: number;
    public EmailAddress: string;
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

    public Discount: number;
    public ID: number;
    public SumTotalIncVat: number;
    public UpdatedBy: string;
    public SortIndex: number;
    public SumTotalExVatCurrency: number;
    public StatusCode: number;
    public VatPercent: number;
    public ItemText: string;
    public CurrencyExchangeRate: number;
    public PriceIncVat: number;
    public SumTotalIncVatCurrency: number;
    public ProductID: number;
    public CustomerOrderID: number;
    public CreatedBy: string;
    public ItemSourceID: number;
    public CreatedAt: Date;
    public SumTotalExVat: number;
    public VatTypeID: number;
    public SumVatCurrency: number;
    public SumVat: number;
    public Deleted: boolean;
    public PriceExVatCurrency: number;
    public PriceExVat: number;
    public UpdatedAt: Date;
    public Comment: string;
    public Unit: string;
    public CostPrice: number;
    public NumberOfItems: number;
    public DiscountCurrency: number;
    public CurrencyCodeID: number;
    public DiscountPercent: number;
    public DimensionsID: number;
    public PriceSetByUser: boolean;
    public CalculateGrossPriceBasedOnNetPrice: boolean;
    public AccountID: number;
    public ReadyToInvoice: boolean;
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

    public FreeTxt: string;
    public DistributionPlanID: number;
    public InvoiceReceiverName: string;
    public ID: number;
    public TaxInclusiveAmount: number;
    public PaymentTermsID: number;
    public SalesPerson: string;
    public InvoicePostalCode: string;
    public CustomerName: string;
    public DeliveryDate: LocalDate;
    public UpdatedBy: string;
    public DeliveryTermsID: number;
    public ShippingCountry: string;
    public ShippingCountryCode: string;
    public InvoiceCity: string;
    public InquiryReference: number;
    public Requisition: string;
    public InvoiceAddressLine1: string;
    public StatusCode: number;
    public ShippingAddressLine2: string;
    public ValidUntilDate: LocalDate;
    public QuoteNumberSeriesID: number;
    public DeliveryTerm: string;
    public PayableRoundingAmount: number;
    public CurrencyExchangeRate: number;
    public OurReference: string;
    public UpdateCurrencyAmountsOnDateChange: boolean;
    public CustomerPerson: string;
    public CreatedBy: string;
    public SupplierOrgNumber: string;
    public ShippingAddressLine1: string;
    public CreatedAt: Date;
    public TaxExclusiveAmountCurrency: number;
    public DefaultSellerID: number;
    public QuoteDate: LocalDate;
    public UseReportID: number;
    public ShippingAddressLine3: string;
    public PaymentTerm: string;
    public ShippingCity: string;
    public QuoteNumber: number;
    public Deleted: boolean;
    public InternalNote: string;
    public InvoiceAddressLine2: string;
    public UpdatedAt: Date;
    public Comment: string;
    public ShippingPostalCode: string;
    public UpdateCurrencyOnToInvoice: boolean;
    public YourReference: string;
    public CustomerOrgNumber: string;
    public CreditDays: number;
    public CurrencyCodeID: number;
    public InvoiceCountryCode: string;
    public UpdateCurrencyOnToOrder: boolean;
    public VatTotalsAmountCurrency: number;
    public TaxInclusiveAmountCurrency: number;
    public InvoiceCountry: string;
    public PaymentInfoTypeID: number;
    public DeliveryMethod: string;
    public CustomerID: number;
    public VatTotalsAmount: number;
    public InvoiceAddressLine3: string;
    public DeliveryName: string;
    public PayableRoundingCurrencyAmount: number;
    public TaxExclusiveAmount: number;
    public PrintStatus: number;
    public EmailAddress: string;
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

    public Discount: number;
    public ID: number;
    public SumTotalIncVat: number;
    public UpdatedBy: string;
    public SortIndex: number;
    public SumTotalExVatCurrency: number;
    public CustomerQuoteID: number;
    public StatusCode: number;
    public VatPercent: number;
    public ItemText: string;
    public CurrencyExchangeRate: number;
    public PriceIncVat: number;
    public SumTotalIncVatCurrency: number;
    public ProductID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public SumTotalExVat: number;
    public VatTypeID: number;
    public SumVatCurrency: number;
    public SumVat: number;
    public Deleted: boolean;
    public PriceExVatCurrency: number;
    public PriceExVat: number;
    public UpdatedAt: Date;
    public Comment: string;
    public Unit: string;
    public CostPrice: number;
    public NumberOfItems: number;
    public DiscountCurrency: number;
    public CurrencyCodeID: number;
    public DiscountPercent: number;
    public DimensionsID: number;
    public PriceSetByUser: boolean;
    public CalculateGrossPriceBasedOnNetPrice: boolean;
    public AccountID: number;
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
    public DebtCollectionFormat: number;
    public UpdatedBy: string;
    public CustomerInvoiceReminderSettingsID: number;
    public StatusCode: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public DebtCollectionAutomationID: number;
    public IntegrateWithDebtCollection: boolean;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public CreditorNumber: number;
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
    public StatusCode: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public _createguid: string;
    public Details: Array<ItemSourceDetail>;
    public CustomFields: any;
}


export class ItemSourceDetail extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ItemSourceDetail';

    public Amount: number;
    public ID: number;
    public UpdatedBy: string;
    public StatusCode: number;
    public SourceType: string;
    public CreatedBy: string;
    public ItemSourceID: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public Tag: string;
    public SourceFK: number;
    public Description: string;
    public _createguid: string;
    public CustomFields: any;
}


export class PaymentInfoType extends UniEntity {
    public static RelativeUrl = 'paymentinfotype';
    public static EntityType = 'PaymentInfoType';

    public ID: number;
    public UpdatedBy: string;
    public StatusCode: number;
    public Locked: boolean;
    public Type: PaymentInfoTypeEnum;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Name: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public Length: number;
    public Control: Modulus;
    public _createguid: string;
    public PaymentInfoTypeParts: Array<PaymentInfoTypePart>;
    public CustomFields: any;
}


export class PaymentInfoTypePart extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'PaymentInfoTypePart';

    public ID: number;
    public UpdatedBy: string;
    public SortIndex: number;
    public StatusCode: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public Part: string;
    public UpdatedAt: Date;
    public Length: number;
    public PaymentInfoTypeID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class RecurringInvoice extends UniEntity {
    public static RelativeUrl = 'recurringinvoices';
    public static EntityType = 'RecurringInvoice';

    public AmountRegards: string;
    public FreeTxt: string;
    public DistributionPlanID: number;
    public InvoiceReceiverName: string;
    public ID: number;
    public TaxInclusiveAmount: number;
    public PaymentTermsID: number;
    public SalesPerson: string;
    public InvoicePostalCode: string;
    public CustomerName: string;
    public Payment: string;
    public DeliveryDate: LocalDate;
    public UpdatedBy: string;
    public DeliveryTermsID: number;
    public ShippingCountry: string;
    public NotifyUser: string;
    public NotifyWhenOrdersArePrepared: boolean;
    public ShippingCountryCode: string;
    public InvoiceCity: string;
    public Requisition: string;
    public InvoiceAddressLine1: string;
    public StatusCode: number;
    public ShippingAddressLine2: string;
    public DeliveryTerm: string;
    public PayableRoundingAmount: number;
    public CurrencyExchangeRate: number;
    public OurReference: string;
    public UpdateCurrencyAmountsOnDateChange: boolean;
    public CustomerPerson: string;
    public CreatedBy: string;
    public MaxIterations: number;
    public SupplierOrgNumber: string;
    public Interval: number;
    public ShippingAddressLine1: string;
    public CreatedAt: Date;
    public NotifyWhenRecurringEnds: boolean;
    public TaxExclusiveAmountCurrency: number;
    public DefaultSellerID: number;
    public UseReportID: number;
    public TimePeriod: RecurringPeriod;
    public ShippingAddressLine3: string;
    public NoCreditDays: boolean;
    public PaymentTerm: string;
    public ShippingCity: string;
    public Deleted: boolean;
    public InternalNote: string;
    public InvoiceAddressLine2: string;
    public NextInvoiceDate: LocalDate;
    public UpdatedAt: Date;
    public Comment: string;
    public InvoiceNumberSeriesID: number;
    public ShippingPostalCode: string;
    public YourReference: string;
    public CustomerOrgNumber: string;
    public CreditDays: number;
    public CurrencyCodeID: number;
    public InvoiceCountryCode: string;
    public ProduceAs: RecurringResult;
    public VatTotalsAmountCurrency: number;
    public PreparationDays: number;
    public TaxInclusiveAmountCurrency: number;
    public InvoiceCountry: string;
    public PaymentInfoTypeID: number;
    public DeliveryMethod: string;
    public PaymentInformation: string;
    public StartDate: LocalDate;
    public CustomerID: number;
    public VatTotalsAmount: number;
    public InvoiceAddressLine3: string;
    public DeliveryName: string;
    public PayableRoundingCurrencyAmount: number;
    public TaxExclusiveAmount: number;
    public PrintStatus: number;
    public EmailAddress: string;
    public EndDate: LocalDate;
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

    public Discount: number;
    public ID: number;
    public SumTotalIncVat: number;
    public UpdatedBy: string;
    public SortIndex: number;
    public SumTotalExVatCurrency: number;
    public StatusCode: number;
    public ReduceIncompletePeriod: boolean;
    public VatPercent: number;
    public ItemText: string;
    public CurrencyExchangeRate: number;
    public PriceIncVat: number;
    public SumTotalIncVatCurrency: number;
    public ProductID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public TimeFactor: RecurringPeriod;
    public SumTotalExVat: number;
    public VatTypeID: number;
    public SumVatCurrency: number;
    public SumVat: number;
    public Deleted: boolean;
    public PriceExVatCurrency: number;
    public PriceExVat: number;
    public UpdatedAt: Date;
    public Comment: string;
    public Unit: string;
    public NumberOfItems: number;
    public DiscountCurrency: number;
    public CurrencyCodeID: number;
    public DiscountPercent: number;
    public DimensionsID: number;
    public PriceSetByUser: boolean;
    public PricingSource: PricingSource;
    public CalculateGrossPriceBasedOnNetPrice: boolean;
    public AccountID: number;
    public RecurringInvoiceID: number;
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
    public NotifiedOrdersPrepared: boolean;
    public StatusCode: number;
    public CreationDate: LocalDate;
    public CreatedBy: string;
    public CreatedAt: Date;
    public OrderID: number;
    public InvoiceID: number;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public Comment: string;
    public IterationNumber: number;
    public NotifiedRecurringEnds: boolean;
    public InvoiceDate: LocalDate;
    public RecurringInvoiceID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class Seller extends UniEntity {
    public static RelativeUrl = 'sellers';
    public static EntityType = 'Seller';

    public TeamID: number;
    public ID: number;
    public UpdatedBy: string;
    public StatusCode: number;
    public UserID: number;
    public EmployeeID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Name: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
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

    public Amount: number;
    public SellerID: number;
    public ID: number;
    public CustomerInvoiceID: number;
    public UpdatedBy: string;
    public CustomerQuoteID: number;
    public StatusCode: number;
    public CustomerOrderID: number;
    public Percent: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public CustomerID: number;
    public RecurringInvoiceID: number;
    public _createguid: string;
    public Seller: Seller;
    public CustomFields: any;
}


export class SubCompany extends UniEntity {
    public static RelativeUrl = 'subcompanies';
    public static EntityType = 'SubCompany';

    public CompanyKey: string;
    public ID: number;
    public UpdatedBy: string;
    public CompanyID: number;
    public StatusCode: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public CompanyType: CompanyRelation;
    public Deleted: boolean;
    public CompanyName: string;
    public UpdatedAt: Date;
    public CustomerID: number;
    public _createguid: string;
    public Customer: Customer;
    public CustomFields: any;
}


export class Supplier extends UniEntity {
    public static RelativeUrl = 'suppliers';
    public static EntityType = 'Supplier';

    public SubAccountNumberSeriesID: number;
    public ID: number;
    public GLN: string;
    public SelfEmployed: boolean;
    public BusinessRelationID: number;
    public UpdatedBy: string;
    public StatusCode: number;
    public CostAllocationID: number;
    public SupplierNumber: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public WebUrl: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public PeppolAddress: string;
    public OrgNumber: string;
    public CreditDays: number;
    public CurrencyCodeID: number;
    public DimensionsID: number;
    public Localization: string;
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
    public ID: number;
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Name: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public CreditDays: number;
    public Description: string;
    public _createguid: string;
    public CustomFields: any;
}


export class TOFCurrencySettings extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'TOFCurrencySettings';

    public ID: number;
    public UpdateCurrencyAmountsOnQuoteToInvoice: boolean;
    public UpdateCurrencyAmountsOnQuotedateChange: boolean;
    public UpdatedBy: string;
    public UpdateCurrencyAmountsOnInvoicedateChange: boolean;
    public StatusCode: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public UpdateCurrencyAmountsOnOrderToInvoice: boolean;
    public UpdateCurrencyAmountsOnQuoteToOrder: boolean;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public UpdateCurrencyAmountsOnOrderdateChange: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class Address extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Address';

    public ID: number;
    public City: string;
    public AddressLine2: string;
    public BusinessRelationID: number;
    public UpdatedBy: string;
    public Country: string;
    public StatusCode: number;
    public AddressLine3: string;
    public CreatedBy: string;
    public CountryCode: string;
    public CreatedAt: Date;
    public AddressLine1: string;
    public Deleted: boolean;
    public PostalCode: string;
    public UpdatedAt: Date;
    public Region: string;
    public _createguid: string;
    public BusinessRelation: BusinessRelation;
    public CustomFields: any;
}


export class BusinessRelation extends UniEntity {
    public static RelativeUrl = 'business-relations';
    public static EntityType = 'BusinessRelation';

    public InvoiceAddressID: number;
    public ShippingAddressID: number;
    public ID: number;
    public UpdatedBy: string;
    public StatusCode: number;
    public DefaultPhoneID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Name: string;
    public Deleted: boolean;
    public DefaultContactID: number;
    public UpdatedAt: Date;
    public DefaultBankAccountID: number;
    public DefaultEmailID: number;
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
    public UpdatedBy: string;
    public StatusCode: number;
    public ParentBusinessRelationID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public Role: string;
    public UpdatedAt: Date;
    public Comment: string;
    public InfoID: number;
    public _createguid: string;
    public ParentBusinessRelation: BusinessRelation;
    public Info: BusinessRelation;
    public CustomFields: any;
}


export class Email extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Email';

    public ID: number;
    public BusinessRelationID: number;
    public UpdatedBy: string;
    public StatusCode: number;
    public Type: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public Description: string;
    public EmailAddress: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Phone extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Phone';

    public ID: number;
    public BusinessRelationID: number;
    public UpdatedBy: string;
    public Number: string;
    public StatusCode: number;
    public Type: PhoneTypeEnum;
    public CreatedBy: string;
    public CountryCode: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public Description: string;
    public _createguid: string;
    public CustomFields: any;
}


export class AGACalculation extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AGACalculation';

    public ID: number;
    public PayrollRunID: number;
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Deleted: boolean;
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

    public SubEntityID: number;
    public ID: number;
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public freeAmount: number;
    public AGACalculationID: number;
    public _createguid: string;
    public subEntity: SubEntity;
    public CustomFields: any;
}


export class AGATax extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AGATax';

    public SubEntityID: number;
    public ID: number;
    public UpdatedBy: string;
    public agaBase: number;
    public StatusCode: number;
    public AGARateID: number;
    public CreatedBy: string;
    public beregningsKode: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public agaRate: number;
    public UpdatedAt: Date;
    public zone: number;
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

    public SubEntityID: number;
    public ID: number;
    public UpdatedBy: string;
    public agaBase: number;
    public StatusCode: number;
    public AGARateID: number;
    public CreatedBy: string;
    public beregningsKode: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public agaRate: number;
    public UpdatedAt: Date;
    public zone: number;
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

    public SubEntityID: number;
    public ID: number;
    public UpdatedBy: string;
    public agaBase: number;
    public StatusCode: number;
    public AGARateID: number;
    public CreatedBy: string;
    public beregningsKode: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public agaRate: number;
    public UpdatedAt: Date;
    public zone: number;
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

    public SubEntityID: number;
    public ID: number;
    public UpdatedBy: string;
    public agaBase: number;
    public StatusCode: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public agaRate: number;
    public UpdatedAt: Date;
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

    public SubEntityID: number;
    public ID: number;
    public UpdatedBy: string;
    public agaBase: number;
    public StatusCode: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public agaRate: number;
    public UpdatedAt: Date;
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

    public SubEntityID: number;
    public aga: number;
    public ID: number;
    public persons: number;
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public UpdatedAt: Date;
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

    public ID: number;
    public UpdatedBy: string;
    public GarnishmentTax: number;
    public StatusCode: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public WithholdingTax: number;
    public FinancialTax: number;
    public _createguid: string;
    public CustomFields: any;
}


export class AmeldingData extends UniEntity {
    public static RelativeUrl = 'amelding';
    public static EntityType = 'AmeldingData';

    public ID: number;
    public PayrollRunID: number;
    public UpdatedBy: string;
    public StatusCode: number;
    public sent: Date;
    public type: AmeldingType;
    public CreatedBy: string;
    public year: number;
    public CreatedAt: Date;
    public status: number;
    public created: Date;
    public initiated: Date;
    public altinnStatus: string;
    public period: number;
    public OppgaveHash: string;
    public messageID: string;
    public Deleted: boolean;
    public receiptID: number;
    public UpdatedAt: Date;
    public mainFileID: number;
    public replacesID: number;
    public feedbackFileID: number;
    public attachmentFileID: number;
    public _createguid: string;
    public xmlValidationErrors: string;
    public replaceThis: string;
    public log: Array<AmeldingLog>;
    public CustomFields: any;
}


export class AmeldingLog extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AmeldingLog';

    public key: number;
    public ID: number;
    public UpdatedBy: string;
    public StatusCode: number;
    public AmeldingsID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public registry: SalaryRegistry;
    public _createguid: string;
    public CustomFields: any;
}


export class BasicAmount extends UniEntity {
    public static RelativeUrl = 'basicamounts';
    public static EntityType = 'BasicAmount';

    public ID: number;
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public FromDate: Date;
    public Deleted: boolean;
    public BasicAmountPrYear: number;
    public UpdatedAt: Date;
    public ConversionFactor: number;
    public AveragePrYear: number;
    public BasicAmountPrMonth: number;
    public _createguid: string;
    public CustomFields: any;
}


export class CompanySalary extends UniEntity {
    public static RelativeUrl = 'companysalary';
    public static EntityType = 'CompanySalary';

    public WageDeductionDueToHoliday: WageDeductionDueToHolidayType;
    public MainAccountAllocatedFinancialVacation: number;
    public MainAccountAllocatedAGAVacation: number;
    public PostToTaxDraw: boolean;
    public Base_JanMayenAndBiCountries: boolean;
    public ID: number;
    public Base_NettoPaymentForMaritim: boolean;
    public UpdatedBy: string;
    public MainAccountCostFinancialVacation: number;
    public MainAccountCostVacation: number;
    public MainAccountAllocatedVacation: number;
    public Base_SpesialDeductionForMaritim: boolean;
    public StatusCode: number;
    public MainAccountAllocatedFinancial: number;
    public WagetypeAdvancePaymentAuto: number;
    public CreatedBy: string;
    public WagetypeAdvancePayment: number;
    public CreatedAt: Date;
    public MainAccountAllocatedAGA: number;
    public HourFTEs: number;
    public PostGarnishmentToTaxAccount: boolean;
    public Deleted: boolean;
    public Base_Svalbard: boolean;
    public Base_NettoPayment: boolean;
    public UpdatedAt: Date;
    public PaycheckZipReportID: number;
    public HoursPerMonth: number;
    public OtpExportActive: boolean;
    public MainAccountCostAGAVacation: number;
    public AllowOver6G: boolean;
    public FreeAmount: number;
    public CalculateFinancialTax: boolean;
    public MainAccountCostAGA: number;
    public Base_TaxFreeOrganization: boolean;
    public PaymentInterval: CompanySalaryPaymentInterval;
    public MainAccountCostFinancial: number;
    public AnnualStatementZipReportID: number;
    public Base_PayAsYouEarnTaxOnPensions: boolean;
    public RateFinancialTax: number;
    public InterrimRemitAccount: number;
    public _createguid: string;
    public CustomFields: any;
}


export class CompanyVacationRate extends UniEntity {
    public static RelativeUrl = 'companyvacationrates';
    public static EntityType = 'CompanyVacationRate';

    public Rate60: number;
    public ID: number;
    public UpdatedBy: string;
    public Rate: number;
    public StatusCode: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public FromDate: Date;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class EmployeeCategory extends UniEntity {
    public static RelativeUrl = 'employeecategories';
    public static EntityType = 'EmployeeCategory';

    public ID: number;
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public EmployeeCategoryLinkID: number;
    public Name: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class EmployeeCategoryLink extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'EmployeeCategoryLink';

    public ID: number;
    public UpdatedBy: string;
    public EmployeeNumber: number;
    public StatusCode: number;
    public EmployeeCategoryID: number;
    public EmployeeID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public _createguid: string;
    public EmployeeCategory: EmployeeCategory;
    public Employee: Employee;
    public CustomFields: any;
}


export class Employee extends UniEntity {
    public static RelativeUrl = 'employees';
    public static EntityType = 'Employee';

    public Sex: GenderEnum;
    public SubEntityID: number;
    public EmploymentDateOtp: LocalDate;
    public MunicipalityNo: string;
    public ID: number;
    public PhotoID: number;
    public TypeOfPaymentOtp: TypeOfPaymentOtp;
    public BusinessRelationID: number;
    public UpdatedBy: string;
    public EmployeeNumber: number;
    public IncludeOtpUntilYear: number;
    public StatusCode: number;
    public SocialSecurityNumber: string;
    public UserID: number;
    public EmploymentDate: Date;
    public CreatedBy: string;
    public InternasjonalIDType: InternationalIDType;
    public FreeText: string;
    public CreatedAt: Date;
    public OtpStatus: OtpStatus;
    public EndDateOtp: LocalDate;
    public Deleted: boolean;
    public InternasjonalIDCountry: string;
    public UpdatedAt: Date;
    public IncludeOtpUntilMonth: number;
    public OtpExport: boolean;
    public InternationalID: string;
    public BirthDate: Date;
    public Active: boolean;
    public ForeignWorker: ForeignWorker;
    public AdvancePaymentAmount: number;
    public EmployeeLanguageID: number;
    public PaymentInterval: PaymentInterval;
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

    public ResultatStatus: string;
    public ID: number;
    public SecondaryPercent: number;
    public SecondaryTable: string;
    public loennTilUtenrikstjenestemannID: number;
    public UpdatedBy: string;
    public IssueDate: Date;
    public loennKunTrygdeavgiftTilUtenlandskBorgerSomGrensegjengerID: number;
    public Table: string;
    public EmployeeNumber: number;
    public ufoereYtelserAndreID: number;
    public StatusCode: number;
    public loennFraHovedarbeidsgiverID: number;
    public EmployeeID: number;
    public Percent: number;
    public CreatedBy: string;
    public Year: number;
    public TaxcardId: number;
    public CreatedAt: Date;
    public NotMainEmployer: boolean;
    public SKDXml: string;
    public Deleted: boolean;
    public loennFraBiarbeidsgiverID: number;
    public Tilleggsopplysning: string;
    public NonTaxableAmount: number;
    public loennKunTrygdeavgiftTilUtenlandskBorgerID: number;
    public UpdatedAt: Date;
    public pensjonID: number;
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

    public freeAmountType: FreeAmountType;
    public ID: number;
    public UpdatedBy: string;
    public AntallMaanederForTrekk: number;
    public Table: string;
    public Percent: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public NonTaxableAmount: number;
    public UpdatedAt: Date;
    public tabellType: TabellType;
    public _createguid: string;
    public CustomFields: any;
}


export class EmployeeLeave extends UniEntity {
    public static RelativeUrl = 'EmployeeLeave';
    public static EntityType = 'EmployeeLeave';

    public ID: number;
    public LeaveType: Leavetype;
    public UpdatedBy: string;
    public StatusCode: number;
    public AffectsOtp: boolean;
    public CreatedBy: string;
    public CreatedAt: Date;
    public ToDate: Date;
    public FromDate: Date;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public EmploymentID: number;
    public Description: string;
    public LeavePercent: number;
    public _createguid: string;
    public Employment: Employment;
    public CustomFields: any;
}


export class Employment extends UniEntity {
    public static RelativeUrl = 'employments';
    public static EntityType = 'Employment';

    public HourRate: number;
    public EmploymentType: EmploymentType;
    public SubEntityID: number;
    public JobName: string;
    public ID: number;
    public TypeOfEmployment: TypeOfEmployment;
    public UpdatedBy: string;
    public EndDateReason: EndDateReason;
    public EmployeeNumber: number;
    public ShipType: ShipTypeOfShip;
    public PayGrade: string;
    public StatusCode: number;
    public UserDefinedRate: number;
    public WorkPercent: number;
    public EmployeeID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public TradeArea: ShipTradeArea;
    public JobCode: string;
    public LastSalaryChangeDate: Date;
    public RemunerationType: RemunerationType;
    public Deleted: boolean;
    public WorkingHoursScheme: WorkingHoursScheme;
    public RegulativeStepNr: number;
    public Standard: boolean;
    public UpdatedAt: Date;
    public LedgerAccount: string;
    public SeniorityDate: Date;
    public DimensionsID: number;
    public ShipReg: ShipRegistry;
    public MonthRate: number;
    public StartDate: Date;
    public HoursPerWeek: number;
    public LastWorkPercentChangeDate: Date;
    public RegulativeGroupID: number;
    public EndDate: Date;
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
    public SubentityID: number;
    public ID: number;
    public UpdatedBy: string;
    public AffectsAGA: boolean;
    public StatusCode: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public FromDate: Date;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public Description: string;
    public _createguid: string;
    public CustomFields: any;
}


export class OtpExportWagetype extends UniEntity {
    public static RelativeUrl = 'otpexportwagetypes';
    public static EntityType = 'OtpExportWagetype';

    public ID: number;
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public WageTypeNumber: number;
    public _createguid: string;
    public CustomFields: any;
}


export class PayrollRun extends UniEntity {
    public static RelativeUrl = 'payrollrun';
    public static EntityType = 'PayrollRun';

    public HolidayPayDeduction: boolean;
    public PaycheckFileID: number;
    public ID: number;
    public taxdrawfactor: TaxDrawFactor;
    public UpdatedBy: string;
    public PayDate: Date;
    public AGAonRun: number;
    public ExcludeRecurringPosts: boolean;
    public StatusCode: number;
    public CreatedBy: string;
    public FreeText: string;
    public CreatedAt: Date;
    public ToDate: Date;
    public needsRecalc: boolean;
    public SettlementDate: Date;
    public FromDate: Date;
    public Deleted: boolean;
    public AGAFreeAmount: number;
    public UpdatedAt: Date;
    public JournalEntryNumber: string;
    public Description: string;
    public _createguid: string;
    public transactions: Array<SalaryTransaction>;
    public agacalculation: Array<AGACalculation>;
    public CustomFields: any;
}


export class PayrollRunCategoryLink extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'PayrollRunCategoryLink';

    public ID: number;
    public PayrollRunID: number;
    public UpdatedBy: string;
    public StatusCode: number;
    public EmployeeCategoryID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public _createguid: string;
    public EmployeeCategory: EmployeeCategory;
    public PayrollRun: PayrollRun;
    public CustomFields: any;
}


export class PostingSummaryDraft extends UniEntity {
    public ID: number;
    public JobInfoID: number;
    public draftWithDims: string;
    public statusTime: Date;
    public PayrollID: number;
    public status: SummaryJobStatus;
    public draftWithDimsOnBalance: string;
    public draftBasic: string;
}


export class Regulative extends UniEntity {
    public static RelativeUrl = 'regulatives';
    public static EntityType = 'Regulative';

    public ID: number;
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Deleted: boolean;
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

    public ID: number;
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Name: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public _createguid: string;
    public Regulatives: Array<Regulative>;
    public CustomFields: any;
}


export class RegulativeStep extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'RegulativeStep';

    public Amount: number;
    public ID: number;
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Step: number;
    public Deleted: boolean;
    public RegulativeID: number;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class SalaryBalance extends UniEntity {
    public static RelativeUrl = 'salarybalances';
    public static EntityType = 'SalaryBalance';

    public MaxAmount: number;
    public ID: number;
    public InstalmentPercent: number;
    public UpdatedBy: string;
    public MinAmount: number;
    public StatusCode: number;
    public Instalment: number;
    public EmployeeID: number;
    public Type: SalBalDrawType;
    public CreatedBy: string;
    public CreatedAt: Date;
    public ToDate: Date;
    public Name: string;
    public FromDate: Date;
    public Deleted: boolean;
    public InstalmentType: SalBalType;
    public UpdatedAt: Date;
    public CreatePayment: boolean;
    public EmploymentID: number;
    public Source: SalBalSource;
    public SalaryBalanceTemplateID: number;
    public SupplierID: number;
    public WageTypeNumber: number;
    public KID: string;
    public Amount: number;
    public Balance: number;
    public _createguid: string;
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

    public Amount: number;
    public ID: number;
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public SalaryBalanceID: number;
    public Deleted: boolean;
    public Date: LocalDate;
    public UpdatedAt: Date;
    public Description: string;
    public SalaryTransactionID: number;
    public _createguid: string;
    public SalaryTransaction: SalaryTransaction;
    public SalaryBalance: SalaryBalance;
    public CustomFields: any;
}


export class SalaryBalanceTemplate extends UniEntity {
    public static RelativeUrl = 'salarybalancetemplates';
    public static EntityType = 'SalaryBalanceTemplate';

    public MaxAmount: number;
    public ID: number;
    public InstalmentPercent: number;
    public UpdatedBy: string;
    public MinAmount: number;
    public StatusCode: number;
    public Instalment: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Name: string;
    public Deleted: boolean;
    public InstalmentType: SalBalType;
    public UpdatedAt: Date;
    public CreatePayment: boolean;
    public SalarytransactionDescription: string;
    public SupplierID: number;
    public WageTypeNumber: number;
    public Account: number;
    public KID: string;
    public _createguid: string;
    public Supplier: Supplier;
    public SalaryBalances: Array<SalaryBalance>;
    public CustomFields: any;
}


export class SalaryTransaction extends UniEntity {
    public static RelativeUrl = 'salarytrans';
    public static EntityType = 'SalaryTransaction';

    public Amount: number;
    public MunicipalityNo: string;
    public SystemType: StdSystemType;
    public HolidayPayDeduction: boolean;
    public ID: number;
    public PayrollRunID: number;
    public UpdatedBy: string;
    public Rate: number;
    public EmployeeNumber: number;
    public StatusCode: number;
    public recurringPostValidFrom: Date;
    public EmployeeID: number;
    public CreatedBy: string;
    public Sum: number;
    public CreatedAt: Date;
    public ToDate: Date;
    public VatTypeID: number;
    public SalaryBalanceID: number;
    public FromDate: Date;
    public Deleted: boolean;
    public ChildSalaryTransactionID: number;
    public recurringPostValidTo: Date;
    public UpdatedAt: Date;
    public IsRecurringPost: boolean;
    public RecurringID: number;
    public EmploymentID: number;
    public DimensionsID: number;
    public WageTypeNumber: number;
    public Text: string;
    public Account: number;
    public WageTypeID: number;
    public calcAGA: number;
    public TaxbasisID: number;
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
    public ValueString: string;
    public ValueBool: boolean;
    public StatusCode: number;
    public ValueDate: Date;
    public ValueDate2: Date;
    public CreatedBy: string;
    public ValueMoney: number;
    public CreatedAt: Date;
    public WageTypeSupplementID: number;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public SalaryTransactionID: number;
    public _createguid: string;
    public WageTypeSupplement: WageTypeSupplement;
    public CustomFields: any;
}


export class SalaryYear extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'SalaryYear';

    public ID: number;
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public CurrentYear: number;
    public _createguid: string;
    public CustomFields: any;
}


export class SubEntity extends UniEntity {
    public static RelativeUrl = 'subentities';
    public static EntityType = 'SubEntity';

    public MunicipalityNo: string;
    public ID: number;
    public BusinessRelationID: number;
    public UpdatedBy: string;
    public StatusCode: number;
    public AgaZone: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public OrgNumber: string;
    public AgaRule: number;
    public SuperiorOrganizationID: number;
    public freeAmount: number;
    public _createguid: string;
    public BusinessRelationInfo: BusinessRelation;
    public SuperiorOrganization: SubEntity;
    public CustomFields: any;
}


export class TaxBasis extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'TaxBasis';

    public ForeignCitizenInsuranceBasis: number;
    public ID: number;
    public UpdatedBy: string;
    public PensionBasis: number;
    public SvalbardBasis: number;
    public StatusCode: number;
    public ForeignBorderCommuterBasis: number;
    public SailorBasis: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public DisabilityOtherBasis: number;
    public Basis: number;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public PensionSourcetaxBasis: number;
    public JanMayenBasis: number;
    public SalaryTransactionID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class Travel extends UniEntity {
    public static RelativeUrl = 'travels';
    public static EntityType = 'Travel';

    public State: state;
    public ID: number;
    public UpdatedBy: string;
    public SourceSystem: string;
    public EmployeeNumber: number;
    public StatusCode: number;
    public CreatedBy: string;
    public Email: string;
    public CreatedAt: Date;
    public TravelIdentificator: string;
    public Name: string;
    public Deleted: boolean;
    public Phone: string;
    public UpdatedAt: Date;
    public Comment: string;
    public Purpose: string;
    public DimensionsID: number;
    public SupplierID: number;
    public Description: string;
    public PersonID: string;
    public _createguid: string;
    public AdvanceAmount: number;
    public TravelLines: Array<TravelLine>;
    public Dimensions: Dimensions;
    public CustomFields: any;
}


export class TravelLine extends UniEntity {
    public static RelativeUrl = 'travellines';
    public static EntityType = 'TravelLine';

    public Amount: number;
    public ID: number;
    public From: Date;
    public UpdatedBy: string;
    public Rate: number;
    public InvoiceAccount: number;
    public StatusCode: number;
    public CostType: costtype;
    public TravelID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public AccountNumber: number;
    public VatTypeID: number;
    public TravelIdentificator: string;
    public Deleted: boolean;
    public paytransID: number;
    public UpdatedAt: Date;
    public To: Date;
    public DimensionsID: number;
    public TypeID: number;
    public Description: string;
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
    public InvoiceAccount: number;
    public StatusCode: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public ForeignDescription: string;
    public WageTypeNumber: number;
    public ForeignTypeID: string;
    public Description: string;
    public _createguid: string;
    public CustomFields: any;
}


export class VacationPayLine extends UniEntity {
    public static RelativeUrl = 'VacationPayLines';
    public static EntityType = 'VacationPayLine';

    public ID: number;
    public UpdatedBy: string;
    public StatusCode: number;
    public EmployeeID: number;
    public CreatedBy: string;
    public Year: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public ManualVacationPayBase: number;
    public MissingEarlierVacationPay: number;
    public Rate60: number;
    public PaidTaxFreeVacationPay: number;
    public Rate: number;
    public Age: number;
    public SystemVacationPayBase: number;
    public VacationPay60: number;
    public _createguid: string;
    public VacationPay: number;
    public Withdrawal: number;
    public PaidVacationPay: number;
    public Employee: Employee;
    public CustomFields: any;
}


export class VacationRateEmployee extends UniEntity {
    public static RelativeUrl = 'employeevacationrates';
    public static EntityType = 'VacationRateEmployee';

    public Rate60: number;
    public ID: number;
    public UpdatedBy: string;
    public Rate: number;
    public StatusCode: number;
    public EmployeeID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public StartDate: Date;
    public EndDate: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class WageType extends UniEntity {
    public static RelativeUrl = 'wagetypes';
    public static EntityType = 'WageType';

    public RateFactor: number;
    public Limit_WageTypeNumber: number;
    public SupplementPackage: string;
    public Systemtype: string;
    public SystemRequiredWageType: number;
    public ID: number;
    public Base_Payment: boolean;
    public Limit_value: number;
    public UpdatedBy: string;
    public DaysOnBoard: boolean;
    public Rate: number;
    public IncomeType: string;
    public Limit_type: LimitType;
    public Base_Vacation: boolean;
    public StatusCode: number;
    public GetRateFrom: GetRateFrom;
    public SpecialTaxAndContributionsRule: SpecialTaxAndContributionsRule;
    public Limit_newRate: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public AccountNumber_balance: number;
    public AccountNumber: number;
    public Base_div3: boolean;
    public WageTypeName: string;
    public RatetypeColumn: RateTypeColumn;
    public StandardWageTypeFor: StdWageType;
    public Deleted: boolean;
    public Postnr: string;
    public SpecialAgaRule: SpecialAgaRule;
    public Base_EmploymentTax: boolean;
    public UpdatedAt: Date;
    public NoNumberOfHours: boolean;
    public taxtype: TaxType;
    public FixedSalaryHolidayDeduction: boolean;
    public HideFromPaycheck: boolean;
    public Base_div2: boolean;
    public SpecialTaxHandling: string;
    public WageTypeNumber: number;
    public Description: string;
    public ValidYear: number;
    public Benefit: string;
    public _createguid: string;
    public SupplementaryInformations: Array<WageTypeSupplement>;
    public CustomFields: any;
}


export class WageTypeSupplement extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'WageTypeSupplement';

    public ID: number;
    public UpdatedBy: string;
    public ameldingType: string;
    public StatusCode: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public ValueType: Valuetype;
    public Name: string;
    public Deleted: boolean;
    public GetValueFromTrans: boolean;
    public UpdatedAt: Date;
    public Description: string;
    public WageTypeID: number;
    public SuggestedValue: string;
    public _createguid: string;
    public CustomFields: any;
}


export class WageTypeTranslation extends UniEntity {
    public static RelativeUrl = 'wagetypetranslations';
    public static EntityType = 'WageTypeTranslation';

    public ID: number;
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public WageTypeName: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public WageTypeNumber: number;
    public EmployeeLanguageID: number;
    public _createguid: string;
    public EmployeeLanguage: EmployeeLanguage;
    public CustomFields: any;
}


export class PensionScheme extends UniEntity {
    public static RelativeUrl = 'pensionschemes';
    public static EntityType = 'PensionScheme';

    public ID: number;
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
    public Year: number;
    public CreatedAt: Date;
    public Identificator: string;
    public Period: number;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class PensionSchemeSupplier extends UniEntity {
    public static RelativeUrl = 'pensionschemesuppliers';
    public static EntityType = 'PensionSchemeSupplier';

    public ID: number;
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Identificator: string;
    public Name: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class StandardPensionSchemeSupplier extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'StandardPensionSchemeSupplier';

    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Identificator: string;
    public Name: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class EmployeeLanguage extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'EmployeeLanguage';

    public LanguageCode: string;
    public ID: number;
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class ComponentLayout extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ComponentLayout';

    public ID: number;
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Name: string;
    public BaseEntity: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public _createguid: string;
    public Fields: Array<FieldLayout>;
    public CustomFields: any;
}


export class FieldLayout extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'FieldLayout';

    public ID: number;
    public UpdatedBy: string;
    public EntityType: string;
    public FieldSet: number;
    public LookupField: boolean;
    public Sectionheader: string;
    public Width: string;
    public Label: string;
    public Options: string;
    public Combo: number;
    public StatusCode: number;
    public CreatedBy: string;
    public HelpText: string;
    public CreatedAt: Date;
    public Placeholder: string;
    public Section: number;
    public ComponentLayoutID: number;
    public ReadOnly: boolean;
    public Deleted: boolean;
    public FieldType: FieldType;
    public UpdatedAt: Date;
    public DisplayField: string;
    public Alignment: Alignment;
    public LineBreak: boolean;
    public Description: string;
    public Placement: number;
    public Property: string;
    public Hidden: boolean;
    public Legend: string;
    public _createguid: string;
    public CustomFields: any;
}


export class CurrencyOverride extends UniEntity {
    public static RelativeUrl = 'currencyoverrides';
    public static EntityType = 'CurrencyOverride';

    public ID: number;
    public UpdatedBy: string;
    public Factor: number;
    public CreatedBy: string;
    public ExchangeRate: number;
    public CreatedAt: Date;
    public ToDate: LocalDate;
    public FromDate: LocalDate;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public Source: CurrencySourceEnum;
    public ToCurrencyCodeID: number;
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
    public UpdatedBy: string;
    public AssetGroupCode: string;
    public ToAccountNumber: number;
    public FromAccountNumber: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class AccountGroupSetup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AccountGroupSetup';

    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Name: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public PlanType: PlanTypeEnum;
    public ExternalReference: string;
    public ParentID: number;
    public _createguid: string;
    public Parent: AccountGroupSetup;
    public CustomFields: any;
}


export class AccountSetup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AccountSetup';

    public AccountGroupSetupID: number;
    public ID: number;
    public UpdatedBy: string;
    public Visible: boolean;
    public CreatedBy: string;
    public CreatedAt: Date;
    public AccountNumber: number;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public VatCode: string;
    public PlanType: PlanTypeEnum;
    public SaftMappingAccountID: number;
    public ExpectedDebitBalance: boolean;
    public AccountName: string;
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
    public CreatedAt: Date;
    public Name: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
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
    public AccountVisibilityGroupID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public AccountSetupID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class AGARate extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AGARate';

    public ID: number;
    public UpdatedBy: string;
    public Rate: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public RateValidFrom: Date;
    public ZoneID: number;
    public _createguid: string;
    public sector: Array<AGASector>;
    public CustomFields: any;
}


export class AGASector extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AGASector';

    public ID: number;
    public UpdatedBy: string;
    public Rate: number;
    public ValidFrom: Date;
    public CreatedBy: string;
    public CreatedAt: Date;
    public SectorID: number;
    public Sector: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public freeAmount: number;
    public RateID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class AGAZone extends UniEntity {
    public static RelativeUrl = 'AGAZones';
    public static EntityType = 'AGAZone';

    public ID: number;
    public UpdatedBy: string;
    public ZoneName: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public _createguid: string;
    public rates: Array<AGARate>;
    public municipalsOnZone: Array<MunicipalAGAZone>;
    public CustomFields: any;
}


export class Agreement extends UniEntity {
    public static RelativeUrl = 'agreements';
    public static EntityType = 'Agreement';

    public ID: number;
    public UpdatedBy: string;
    public Template: string;
    public ValidFrom: Date;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Name: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public AppliesTo: number;
    public _createguid: string;
    public CustomFields: any;
}


export class AssetGroup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AssetGroup';

    public ID: number;
    public UpdatedBy: string;
    public DepreciationYears: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public ToDate: Date;
    public Name: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public DepreciationRate: number;
    public Code: string;
    public DepreciationAccountNumber: number;
    public _createguid: string;
    public CustomFields: any;
}


export class BankIdentifierCode extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'BankIdentifierCode';

    public BankIdentifier: string;
    public ID: number;
    public UpdatedBy: string;
    public Bic: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public BankName: string;
    public _createguid: string;
    public CustomFields: any;
}


export class CompanyType extends UniEntity {
    public static RelativeUrl = 'companytypes';
    public static EntityType = 'CompanyType';

    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Name: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public Priority: boolean;
    public FullName: string;
    public DefaultPlanType: PlanTypeEnum;
    public Description: string;
    public DefaultAccountVisibilityGroupID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class Confirmation extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Confirmation';

    public ID: number;
    public UpdatedBy: string;
    public ContractType: string;
    public StatusCode: number;
    public CreatedBy: string;
    public Email: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public PostalCode: string;
    public CompanyName: string;
    public Phone: string;
    public UpdatedAt: Date;
    public ExpirationDate: Date;
    public SignUpReferrer: string;
    public Code: string;
    public DisplayName: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Country extends UniEntity {
    public static RelativeUrl = 'countries';
    public static EntityType = 'Country';

    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CountryCode: string;
    public CreatedAt: Date;
    public Name: string;
    public Deleted: boolean;
    public CurrencyRateSource: string;
    public UpdatedAt: Date;
    public DefaultCurrencyCode: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Currency extends UniEntity {
    public static RelativeUrl = 'currencies';
    public static EntityType = 'Currency';

    public ID: number;
    public UpdatedBy: string;
    public Factor: number;
    public CreatedBy: string;
    public ExchangeRate: number;
    public CreatedAt: Date;
    public CurrencyDate: LocalDate;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public Source: CurrencySourceEnum;
    public ToCurrencyCodeID: number;
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
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public ShortCode: string;
    public Name: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public Description: string;
    public Code: string;
    public _createguid: string;
    public CustomFields: any;
}


export class DebtCollectionAutomation extends UniEntity {
    public static RelativeUrl = 'debtcollectionautomation';
    public static EntityType = 'DebtCollectionAutomation';

    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Name: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public DebtCollectionSettingsID: number;
    public Description: string;
    public _createguid: string;
    public DebtCollectionSettings: DebtCollectionSettings;
    public CustomFields: any;
}


export class EmploymentValidValues extends UniEntity {
    public static RelativeUrl = 'employmentvalidvalues';
    public static EntityType = 'EmploymentValidValues';

    public HourRate: boolean;
    public JobName: boolean;
    public ID: number;
    public typeOfEmployment: boolean;
    public UpdatedBy: string;
    public LastWorkPercentChange: boolean;
    public ShipType: boolean;
    public UserDefinedRate: boolean;
    public WorkPercent: boolean;
    public CreatedBy: string;
    public CreatedAt: Date;
    public TradeArea: boolean;
    public JobCode: boolean;
    public LastSalaryChangeDate: boolean;
    public RemunerationType: boolean;
    public Deleted: boolean;
    public WorkingHoursScheme: boolean;
    public UpdatedAt: Date;
    public SeniorityDate: boolean;
    public PaymentType: RemunerationType;
    public ShipReg: boolean;
    public MonthRate: boolean;
    public StartDate: boolean;
    public HoursPerWeek: boolean;
    public employment: TypeOfEmployment;
    public EndDate: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class FinancialDeadline extends UniEntity {
    public static RelativeUrl = 'deadlines';
    public static EntityType = 'FinancialDeadline';

    public ID: number;
    public UpdatedBy: string;
    public PassableDueDate: number;
    public StatusCode: number;
    public Type: FinancialDeadlineType;
    public Deadline: LocalDate;
    public CreatedBy: string;
    public CreatedAt: Date;
    public AdditionalInfo: string;
    public Name: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class LanguageCode extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'LanguageCode';

    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Name: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public Code: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Municipal extends UniEntity {
    public static RelativeUrl = 'Municipals';
    public static EntityType = 'Municipal';

    public MunicipalityNo: string;
    public Retired: boolean;
    public ID: number;
    public UpdatedBy: string;
    public CountyName: string;
    public CreatedBy: string;
    public CountyNo: string;
    public MunicipalityName: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class MunicipalAGAZone extends UniEntity {
    public static RelativeUrl = 'MunicipalAGAZones';
    public static EntityType = 'MunicipalAGAZone';

    public MunicipalityNo: string;
    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public ZoneID: number;
    public Startdate: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class PaymentBatchType extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'PaymentBatchType';

    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Name: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public Description: string;
    public Code: number;
    public _createguid: string;
    public CustomFields: any;
}


export class PaymentCode extends UniEntity {
    public static RelativeUrl = 'paymentCodes';
    public static EntityType = 'PaymentCode';

    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public PaymentGroup: string;
    public Name: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public Description: string;
    public Code: number;
    public _createguid: string;
    public CustomFields: any;
}


export class PostalCode extends UniEntity {
    public static RelativeUrl = 'postalcodes';
    public static EntityType = 'PostalCode';

    public ID: number;
    public City: string;
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public Code: string;
    public _createguid: string;
    public CustomFields: any;
}


export class SaftMappingAccount extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'SaftMappingAccount';

    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public Description: string;
    public AccountID: string;
    public _createguid: string;
    public CustomFields: any;
}


export class StaticRegister extends UniEntity {
    public static RelativeUrl = 'StaticRegister';
    public static EntityType = 'StaticRegister';

    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public stamp: Date;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public Registry: string;
    public _createguid: string;
    public CustomFields: any;
}


export class STYRKCode extends UniEntity {
    public static RelativeUrl = 'STYRK';
    public static EntityType = 'STYRKCode';

    public styrk: string;
    public ID: number;
    public UpdatedBy: string;
    public lnr: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public tittel: string;
    public UpdatedAt: Date;
    public ynr: number;
    public _createguid: string;
    public CustomFields: any;
}


export class Language extends UniEntity {
    public static RelativeUrl = 'languages';
    public static EntityType = 'Language';

    public ID: number;
    public UpdatedBy: string;
    public FallBackLanguageID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Name: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public Code: string;
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
    public Module: i18nModule;
    public Meaning: string;
    public Value: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public Model: string;
    public Static: boolean;
    public Description: string;
    public _createguid: string;
    public Translations: Array<Translation>;
    public CustomFields: any;
}


export class Translation extends UniEntity {
    public static RelativeUrl = 'translations';
    public static EntityType = 'Translation';

    public LanguageID: number;
    public ID: number;
    public UpdatedBy: string;
    public Value: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public TranslatableID: number;
    public Deleted: boolean;
    public UpdatedAt: Date;
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
    public No: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Name: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class VatPostSetup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'VatPostSetup';

    public ID: number;
    public UpdatedBy: string;
    public No: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public HasTaxBasis: boolean;
    public VatCodeGroupSetupNo: string;
    public Name: string;
    public ReportAsNegativeAmount: boolean;
    public Deleted: boolean;
    public HasTaxAmount: boolean;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class VatReportForm extends UniEntity {
    public static RelativeUrl = 'vatreportforms';
    public static EntityType = 'VatReportForm';

    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Name: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public Description: string;
    public _createguid: string;
    public CustomFields: any;
}


export class VatReportReferenceSetup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'VatReportReferenceSetup';

    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public AccountNumber: number;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public VatCode: string;
    public VatPostNo: string;
    public _createguid: string;
    public CustomFields: any;
}


export class VatTypeSetup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'VatTypeSetup';

    public OutputVat: boolean;
    public ID: number;
    public UpdatedBy: string;
    public IsCompensated: boolean;
    public DefaultVisible: boolean;
    public CreatedBy: string;
    public CreatedAt: Date;
    public VatCodeGroupNo: string;
    public IncomingAccountNumber: number;
    public Name: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public VatCode: string;
    public DirectJournalEntryOnly: boolean;
    public IsNotVatRegistered: boolean;
    public ReversedTaxDutyVat: boolean;
    public OutgoingAccountNumber: number;
    public _createguid: string;
    public VatTypeSetupPercentages: Array<VatTypeSetupPercentage>;
    public CustomFields: any;
}


export class VatTypeSetupPercentage extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'VatTypeSetupPercentage';

    public ID: number;
    public UpdatedBy: string;
    public VatPercent: number;
    public ValidFrom: LocalDate;
    public CreatedBy: string;
    public VatTypeSetupID: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public ValidTo: LocalDate;
    public _createguid: string;
    public CustomFields: any;
}


export class CompanyReport extends UniEntity {
    public static RelativeUrl = 'company-report';
    public static EntityType = 'CompanyReport';

    public CompanyKey: string;
    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public ContractId: number;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public ReportDefinitionID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class ReportDefinition extends UniEntity {
    public static RelativeUrl = 'report-definitions';
    public static EntityType = 'ReportDefinition';

    public Category: string;
    public ID: number;
    public UpdatedBy: string;
    public UniqueReportID: string;
    public Visible: boolean;
    public CreatedBy: string;
    public CreatedAt: Date;
    public CategoryLabel: string;
    public IsStandard: boolean;
    public ReportSource: string;
    public Name: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public Description: string;
    public Version: string;
    public ReportType: number;
    public Md5: string;
    public TemplateLinkId: string;
    public _createguid: string;
    public CustomFields: any;
}


export class ReportDefinitionDataSource extends UniEntity {
    public static RelativeUrl = 'report-definition-data-sources';
    public static EntityType = 'ReportDefinitionDataSource';

    public ID: number;
    public DataSourceUrl: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Name: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public ReportDefinitionId: number;
    public _createguid: string;
    public CustomFields: any;
}


export class ReportDefinitionParameter extends UniEntity {
    public static RelativeUrl = 'report-definition-parameters';
    public static EntityType = 'ReportDefinitionParameter';

    public DefaultValue: string;
    public ID: number;
    public UpdatedBy: string;
    public SortIndex: number;
    public Label: string;
    public Type: string;
    public Visible: boolean;
    public CreatedBy: string;
    public CreatedAt: Date;
    public DefaultValueSource: string;
    public Name: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public DefaultValueList: string;
    public ReportDefinitionId: number;
    public DefaultValueLookupType: string;
    public _createguid: string;
    public CustomFields: any;
}


export class PeriodSeries extends UniEntity {
    public static RelativeUrl = 'period-series';
    public static EntityType = 'PeriodSeries';

    public ID: number;
    public SeriesType: PeriodSeriesType;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Name: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public Active: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class PeriodTemplate extends UniEntity {
    public static RelativeUrl = 'period-templates';
    public static EntityType = 'PeriodTemplate';

    public ID: number;
    public UpdatedBy: string;
    public No: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public ToDate: LocalDate;
    public Name: string;
    public FromDate: LocalDate;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public PeriodSeriesID: number;
    public _createguid: string;
    public PeriodSeries: PeriodSeries;
    public CustomFields: any;
}


export class Model extends UniEntity {
    public static RelativeUrl = 'models';
    public static EntityType = 'Model';

    public ID: number;
    public Shared: boolean;
    public UpdatedBy: string;
    public Admin: boolean;
    public Label: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Name: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public Description: string;
    public LabelPlural: string;
    public _createguid: string;
    public Fields: Array<Field>;
    public CustomFields: any;
}


export class Field extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Field';

    public ID: number;
    public UpdatedBy: string;
    public Label: string;
    public ModelID: number;
    public CreatedBy: string;
    public HelpText: string;
    public CreatedAt: Date;
    public Name: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public Description: string;
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
    public UpdatedBy: string;
    public EntityType: string;
    public RecipientID: string;
    public EntityID: number;
    public StatusCode: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public SourceEntityID: number;
    public Deleted: boolean;
    public CompanyName: string;
    public SenderDisplayName: string;
    public UpdatedAt: Date;
    public Message: string;
    public _createguid: string;
    public CustomFields: any;
}


export class CompanySettings extends UniEntity {
    public static RelativeUrl = 'companysettings';
    public static EntityType = 'CompanySettings';

    public AcceptableDelta4CustomerPayment: number;
    public DefaultCustomerQuoteReportID: number;
    public DefaultAddressID: number;
    public NetsIntegrationActivated: boolean;
    public DefaultCustomerInvoiceReportID: number;
    public CustomerCreditDays: number;
    public VatLockedDate: LocalDate;
    public FactoringNumber: number;
    public XtraPaymentOrgXmlTagValue: string;
    public HasAutobank: boolean;
    public BookCustomerInvoiceOnDeliveryDate: boolean;
    public ID: number;
    public GLN: string;
    public UseFinancialDateToCalculateVatPercent: boolean;
    public BatchInvoiceMinAmount: number;
    public DefaultAccrualAccountID: number;
    public RoundingType: RoundingType;
    public APGuid: string;
    public AccountGroupSetID: number;
    public UpdatedBy: string;
    public UseAssetRegister: boolean;
    public InterrimRemitAccountID: number;
    public AccountVisibilityGroupID: number;
    public APActivated: boolean;
    public RoundingNumberOfDecimals: number;
    public TaxableFromLimit: number;
    public AutoJournalPayment: string;
    public UseOcrInterpretation: boolean;
    public CustomerInvoiceReminderSettingsID: number;
    public TaxableFromDate: LocalDate;
    public SAFTimportAccountID: number;
    public AccountingLockedDate: LocalDate;
    public SalaryBankAccountID: number;
    public StatusCode: number;
    public DefaultSalesAccountID: number;
    public UsePaymentBankValues: boolean;
    public WebAddress: string;
    public FactoringEmailID: number;
    public ForceSupplierInvoiceApproval: boolean;
    public TwoStageAutobankEnabled: boolean;
    public InterrimPaymentAccountID: number;
    public VatReportFormID: number;
    public DefaultPhoneID: number;
    public SettlementVatAccountID: number;
    public CreatedBy: string;
    public SupplierAccountID: number;
    public DefaultCustomerInvoiceReminderReportID: number;
    public PeriodSeriesVatID: number;
    public CreatedAt: Date;
    public DefaultTOFCurrencySettingsID: number;
    public UseNetsIntegration: boolean;
    public ShowKIDOnCustomerInvoice: boolean;
    public CompanyBankAccountID: number;
    public AgioLossAccountID: number;
    public OfficeMunicipalityNo: string;
    public IgnorePaymentsWithoutEndToEndID: boolean;
    public OrganizationNumber: string;
    public AgioGainAccountID: number;
    public CustomerAccountID: number;
    public APContactID: number;
    public TaxBankAccountID: number;
    public Deleted: boolean;
    public CompanyRegistered: boolean;
    public UseXtraPaymentOrgXmlTag: boolean;
    public CompanyName: string;
    public BankChargeAccountID: number;
    public CompanyTypeID: number;
    public UpdatedAt: Date;
    public AutoDistributeInvoice: boolean;
    public AllowAvtalegiroRegularInvoice: boolean;
    public StoreDistributedInvoice: boolean;
    public APIncludeAttachment: boolean;
    public AcceptableDelta4CustomerPaymentAccountID: number;
    public BaseCurrencyCodeID: number;
    public PaymentBankAgreementNumber: string;
    public TaxMandatoryType: number;
    public PeriodSeriesAccountID: number;
    public TaxMandatory: boolean;
    public PaymentBankIdentification: string;
    public LogoFileID: number;
    public Factoring: number;
    public ShowNumberOfDecimals: number;
    public HideInActiveSuppliers: boolean;
    public DefaultDistributionsID: number;
    public SaveCustomersFromQuoteAsLead: boolean;
    public LogoHideField: number;
    public LogoAlign: number;
    public DefaultCustomerOrderReportID: number;
    public Localization: string;
    public HideInActiveCustomers: boolean;
    public DefaultEmailID: number;
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

    public ID: number;
    public UpdatedBy: string;
    public EntityType: string;
    public StatusCode: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Name: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public _createguid: string;
    public Elements: Array<DistributionPlanElement>;
    public CustomFields: any;
}


export class DistributionPlanElement extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'DistributionPlanElement';

    public DistributionPlanID: number;
    public ID: number;
    public UpdatedBy: string;
    public DistributionPlanElementTypeID: number;
    public StatusCode: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public Priority: number;
    public _createguid: string;
    public ElementType: DistributionPlanElementType;
    public CustomFields: any;
}


export class DistributionPlanElementType extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'DistributionPlanElementType';

    public ID: number;
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Name: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public _createguid: string;
    public LegalEntities: Array<DistributionPlanElementTypeLegalEntity>;
    public CustomFields: any;
}


export class DistributionPlanElementTypeLegalEntity extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'DistributionPlanElementTypeLegalEntity';

    public ID: number;
    public UpdatedBy: string;
    public EntityType: string;
    public DistributionPlanElementTypeID: number;
    public StatusCode: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class Distributions extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Distributions';

    public ID: number;
    public CustomerOrderDistributionPlanID: number;
    public UpdatedBy: string;
    public StatusCode: number;
    public PayCheckDistributionPlanID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public CustomerQuoteDistributionPlanID: number;
    public CustomerInvoiceReminderDistributionPlanID: number;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public AnnualStatementDistributionPlanID: number;
    public CustomerInvoiceDistributionPlanID: number;
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
    public StatusCode: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Name: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class EmailLog extends UniEntity {
    public static RelativeUrl = 'emails';
    public static EntityType = 'EmailLog';

    public EntityDisplayValue: string;
    public ExternalMessage: string;
    public ID: number;
    public From: string;
    public UpdatedBy: string;
    public EntityType: string;
    public EntityID: number;
    public StatusCode: number;
    public JobRunID: number;
    public Type: SharingType;
    public CreatedBy: string;
    public CreatedAt: Date;
    public DistributeAt: LocalDate;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public To: string;
    public ExternalReference: string;
    public Subject: string;
    public JobRunExternalRef: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Eventplan extends UniEntity {
    public static RelativeUrl = 'eventplans';
    public static EntityType = 'Eventplan';

    public IsSystemPlan: boolean;
    public ID: number;
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Name: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public Cargo: string;
    public PlanType: EventplanType;
    public Active: boolean;
    public JobNames: string;
    public SigningKey: string;
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
    public UpdatedBy: string;
    public Endpoint: string;
    public StatusCode: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Name: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public Headers: string;
    public Active: boolean;
    public Authorization: string;
    public _createguid: string;
    public Eventplan: Eventplan;
    public CustomFields: any;
}


export class ExpressionFilter extends UniEntity {
    public static RelativeUrl = 'expressionfilters';
    public static EntityType = 'ExpressionFilter';

    public ID: number;
    public EventplanID: number;
    public UpdatedBy: string;
    public EntityName: string;
    public Expression: string;
    public StatusCode: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public _createguid: string;
    public Eventplan: Eventplan;
    public CustomFields: any;
}


export class Period extends UniEntity {
    public static RelativeUrl = 'periodes';
    public static EntityType = 'Period';

    public ID: number;
    public AccountYear: number;
    public UpdatedBy: string;
    public No: number;
    public StatusCode: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public ToDate: LocalDate;
    public Name: string;
    public FromDate: LocalDate;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public PeriodSeriesID: number;
    public PeriodTemplateID: number;
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
    public StatusCode: number;
    public Type: PredefinedDescriptionType;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public Description: string;
    public Code: string;
    public _createguid: string;
    public CustomFields: any;
}


export class ProductCategory extends UniEntity {
    public static RelativeUrl = 'productcategories';
    public static EntityType = 'ProductCategory';

    public ID: number;
    public UpdatedBy: string;
    public Depth: number;
    public StatusCode: number;
    public Rght: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Status: number;
    public Name: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public Comment: string;
    public Description: string;
    public Lft: number;
    public ParentID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class ProductCategoryLink extends UniEntity {
    public static RelativeUrl = 'productcategorylinks';
    public static EntityType = 'ProductCategoryLink';

    public ID: number;
    public UpdatedBy: string;
    public StatusCode: number;
    public ProductCategoryID: number;
    public ProductID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public _createguid: string;
    public ProductCategory: ProductCategory;
    public CustomFields: any;
}


export class Sharing extends UniEntity {
    public static RelativeUrl = 'sharings';
    public static EntityType = 'Sharing';

    public EntityDisplayValue: string;
    public ExternalMessage: string;
    public ID: number;
    public From: string;
    public UpdatedBy: string;
    public EntityType: string;
    public EntityID: number;
    public StatusCode: number;
    public JobRunID: number;
    public Type: SharingType;
    public CreatedBy: string;
    public CreatedAt: Date;
    public DistributeAt: LocalDate;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public To: string;
    public ExternalReference: string;
    public Subject: string;
    public JobRunExternalRef: string;
    public _createguid: string;
    public CustomFields: any;
}


export class StatusLog extends UniEntity {
    public static RelativeUrl = 'statuslogs';
    public static EntityType = 'StatusLog';

    public ID: number;
    public UpdatedBy: string;
    public EntityType: string;
    public FromStatus: number;
    public EntityID: number;
    public CreatedBy: string;
    public ToStatus: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class Tracelink extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Tracelink';

    public SourceInstanceID: number;
    public ID: number;
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
    public DestinationEntityName: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public Date: Date;
    public UpdatedAt: Date;
    public DestinationInstanceID: number;
    public SourceEntityName: string;
    public _createguid: string;
    public CustomFields: any;
}


export class User extends UniEntity {
    public static RelativeUrl = 'users';
    public static EntityType = 'User';

    public LastLogin: Date;
    public PhoneNumber: string;
    public ID: number;
    public UpdatedBy: string;
    public Protected: boolean;
    public UserName: string;
    public StatusCode: number;
    public CreatedBy: string;
    public Email: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public GlobalIdentity: string;
    public UpdatedAt: Date;
    public BankIntegrationUserName: string;
    public HasAgreedToImportDisclaimer: boolean;
    public IsAutobankAdmin: boolean;
    public DisplayName: string;
    public TwoFactorEnabled: boolean;
    public AuthPhoneNumber: string;
    public _createguid: string;
    public EndDate: Date;
    public CustomFields: any;
}


export class UniQueryDefinition extends UniEntity {
    public static RelativeUrl = 'uniquerydefinitions';
    public static EntityType = 'UniQueryDefinition';

    public ClickUrl: string;
    public Category: string;
    public ID: number;
    public UpdatedBy: string;
    public SortIndex: number;
    public StatusCode: number;
    public UserID: number;
    public IsShared: boolean;
    public ClickParam: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Name: string;
    public ModuleID: number;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public MainModelName: string;
    public SystemGeneratedQuery: boolean;
    public Description: string;
    public Code: string;
    public _createguid: string;
    public UniQueryFilters: Array<UniQueryFilter>;
    public UniQueryFields: Array<UniQueryField>;
    public CustomFields: any;
}


export class UniQueryField extends UniEntity {
    public static RelativeUrl = 'uniqueryfields';
    public static EntityType = 'UniQueryField';

    public ID: number;
    public UpdatedBy: string;
    public UniQueryDefinitionID: number;
    public SumFunction: string;
    public Width: string;
    public StatusCode: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Alias: string;
    public Deleted: boolean;
    public FieldType: number;
    public Field: string;
    public UpdatedAt: Date;
    public Path: string;
    public Index: number;
    public Header: string;
    public _createguid: string;
    public CustomFields: any;
}


export class UniQueryFilter extends UniEntity {
    public static RelativeUrl = 'uniqueryfilters';
    public static EntityType = 'UniQueryFilter';

    public ID: number;
    public UpdatedBy: string;
    public UniQueryDefinitionID: number;
    public StatusCode: number;
    public Value: string;
    public Group: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public Field: string;
    public UpdatedAt: Date;
    public Operator: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Team extends UniEntity {
    public static RelativeUrl = 'teams';
    public static EntityType = 'Team';

    public ID: number;
    public UpdatedBy: string;
    public Depth: number;
    public StatusCode: number;
    public Rght: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Name: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public DimensionsID: number;
    public Lft: number;
    public ParentID: number;
    public _createguid: string;
    public Dimensions: Dimensions;
    public Positions: Array<TeamPosition>;
    public CustomFields: any;
}


export class TeamPosition extends UniEntity {
    public static RelativeUrl = 'teampositions';
    public static EntityType = 'TeamPosition';

    public TeamID: number;
    public ID: number;
    public UpdatedBy: string;
    public StatusCode: number;
    public UserID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public ToDate: LocalDate;
    public FromDate: LocalDate;
    public Deleted: boolean;
    public Position: TeamPositionEnum;
    public UpdatedAt: Date;
    public RelatedSharedRoleId: number;
    public ApproveOrder: number;
    public _createguid: string;
    public Team: Team;
    public CustomFields: any;
}


export class ApprovalRule extends UniEntity {
    public static RelativeUrl = 'approvalrules';
    public static EntityType = 'ApprovalRule';

    public Keywords: string;
    public ID: number;
    public UpdatedBy: string;
    public IndustryCodes: string;
    public StatusCode: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public RuleType: ApprovalRuleType;
    public UpdatedAt: Date;
    public Description: string;
    public _createguid: string;
    public Steps: Array<ApprovalRuleStep>;
    public CustomFields: any;
}


export class ApprovalRuleStep extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ApprovalRuleStep';

    public ID: number;
    public UpdatedBy: string;
    public ApprovalRuleID: number;
    public StatusCode: number;
    public UserID: number;
    public CreatedBy: string;
    public Limit: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public StepNumber: number;
    public _createguid: string;
    public ApprovalRule: ApprovalRule;
    public User: User;
    public CustomFields: any;
}


export class ApprovalSubstitute extends UniEntity {
    public static RelativeUrl = 'approvalsubstitutes';
    public static EntityType = 'ApprovalSubstitute';

    public ID: number;
    public UpdatedBy: string;
    public StatusCode: number;
    public UserID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public ToDate: LocalDate;
    public FromDate: LocalDate;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public SubstituteUserID: number;
    public _createguid: string;
    public User: User;
    public SubstituteUser: User;
    public CustomFields: any;
}


export class TaskApprovalPlan extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'TaskApprovalPlan';

    public Amount: number;
    public ID: number;
    public UpdatedBy: string;
    public ApprovalID: number;
    public ApprovalRuleID: number;
    public StatusCode: number;
    public UserID: number;
    public CreatedBy: string;
    public Limit: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public Comment: string;
    public StepNumber: number;
    public TaskID: number;
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
    public EntityType: string;
    public StatusCode: number;
    public Order: number;
    public CreatedBy: string;
    public IsDepricated: boolean;
    public CreatedAt: Date;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public StatusCategoryID: number;
    public Description: string;
    public System: boolean;
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
    public CreatedAt: Date;
    public Name: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public StatusCategoryCode: StatusCategoryCode;
    public _createguid: string;
    public CustomFields: any;
}


export class StatusRemark extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'StatusRemark';

    public ID: number;
    public UpdatedBy: string;
    public EntityType: string;
    public EntityID: number;
    public StatusCode: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public Remark: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Transition extends UniEntity {
    public static RelativeUrl = 'transitions';
    public static EntityType = 'Transition';

    public ID: number;
    public UpdatedBy: string;
    public EntityType: string;
    public CreatedBy: string;
    public Controller: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public MethodName: string;
    public _createguid: string;
    public CustomFields: any;
}


export class TransitionThreshold extends UniEntity {
    public static RelativeUrl = 'thresholds';
    public static EntityType = 'TransitionThreshold';

    public Operation: OperationType;
    public ID: number;
    public RejectStatusCode: number;
    public UpdatedBy: string;
    public Disabled: boolean;
    public Value: string;
    public SharedApproveTransitionId: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public PropertyName: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public SharedRoleId: number;
    public Operator: Operator;
    public SharedRejectTransitionId: number;
    public _createguid: string;
    public CustomFields: any;
}


export class TransitionThresholdApproval extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'TransitionThresholdApproval';

    public Operation: OperationType;
    public ID: number;
    public RejectStatusCode: number;
    public UpdatedBy: string;
    public ApprovalID: number;
    public Value: string;
    public SharedApproveTransitionId: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public PropertyName: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public SharedRoleId: number;
    public Operator: Operator;
    public SharedRejectTransitionId: number;
    public _createguid: string;
    public Approval: Approval;
    public CustomFields: any;
}


export class Approval extends UniEntity {
    public static RelativeUrl = 'approvals';
    public static EntityType = 'Approval';

    public Amount: number;
    public ID: number;
    public UpdatedBy: string;
    public StatusCode: number;
    public UserID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public SharedRoleId: number;
    public TaskID: number;
    public _createguid: string;
    public Thresholds: Array<TransitionThresholdApproval>;
    public Task: Task;
    public User: User;
    public CustomFields: any;
}


export class Task extends UniEntity {
    public static RelativeUrl = 'tasks';
    public static EntityType = 'Task';

    public ID: number;
    public RejectStatusCode: number;
    public UpdatedBy: string;
    public Title: string;
    public EntityID: number;
    public StatusCode: number;
    public UserID: number;
    public Type: TaskType;
    public SharedApproveTransitionId: number;
    public ModelID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public SharedRoleId: number;
    public SharedRejectTransitionId: number;
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
    public UpdatedBy: string;
    public EntityType: string;
    public FromStatusID: number;
    public TransitionID: number;
    public CreatedBy: string;
    public IsDepricated: boolean;
    public CreatedAt: Date;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public ExpiresDate: Date;
    public ToStatusID: number;
    public _createguid: string;
    public FromStatus: Status;
    public ToStatus: Status;
    public Transition: Transition;
    public CustomFields: any;
}


export class Project extends UniEntity {
    public static RelativeUrl = 'projects';
    public static EntityType = 'Project';

    public Amount: number;
    public ID: number;
    public UpdatedBy: string;
    public PlannedStartdate: LocalDate;
    public Price: number;
    public StatusCode: number;
    public PlannedEnddate: LocalDate;
    public ProjectNumberNumeric: number;
    public ProjectNumberSeriesID: number;
    public CreatedBy: string;
    public ProjectCustomerID: number;
    public CreatedAt: Date;
    public Name: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public CostPrice: number;
    public ProjectNumber: string;
    public DimensionsID: number;
    public Total: number;
    public WorkPlaceAddressID: number;
    public Description: string;
    public StartDate: LocalDate;
    public ProjectLeadName: string;
    public EndDate: LocalDate;
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
    public UpdatedBy: string;
    public StatusCode: number;
    public UserID: number;
    public ProjectID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Name: string;
    public Deleted: boolean;
    public Responsibility: string;
    public UpdatedAt: Date;
    public _createguid: string;
    public ProjectUser: User;
    public CustomFields: any;
}


export class ProjectResourceSchedule extends UniEntity {
    public static RelativeUrl = 'projects-schedules-resources';
    public static EntityType = 'ProjectResourceSchedule';

    public ID: number;
    public UpdatedBy: string;
    public StatusCode: number;
    public ProjectTaskScheduleID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public ProjectTaskID: number;
    public UpdatedAt: Date;
    public ProjectResourceID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class ProjectTask extends UniEntity {
    public static RelativeUrl = 'projects-tasks';
    public static EntityType = 'ProjectTask';

    public Amount: number;
    public ID: number;
    public UpdatedBy: string;
    public Number: string;
    public Price: number;
    public StatusCode: number;
    public ProjectID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Name: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public CostPrice: number;
    public Total: number;
    public SuggestedNumber: string;
    public Description: string;
    public StartDate: LocalDate;
    public EndDate: LocalDate;
    public _createguid: string;
    public ProjectTaskSchedules: Array<ProjectTaskSchedule>;
    public ProjectTaskResources: Array<ProjectResourceSchedule>;
    public CustomFields: any;
}


export class ProjectTaskSchedule extends UniEntity {
    public static RelativeUrl = 'projects-tasks-schedules';
    public static EntityType = 'ProjectTaskSchedule';

    public ID: number;
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public ProjectTaskID: number;
    public UpdatedAt: Date;
    public StartDate: LocalDate;
    public EndDate: LocalDate;
    public _createguid: string;
    public ScheduleResources: Array<ProjectResourceSchedule>;
    public CustomFields: any;
}


export class BarnepassProduct extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'BarnepassProduct';

    public ID: number;
    public UpdatedBy: string;
    public StatusCode: number;
    public ProductID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public _createguid: string;
    public Product: Product;
    public CustomFields: any;
}


export class Product extends UniEntity {
    public static RelativeUrl = 'products';
    public static EntityType = 'Product';

    public ID: number;
    public UpdatedBy: string;
    public PartName: string;
    public StatusCode: number;
    public AverageCost: number;
    public PriceIncVat: number;
    public Type: ProductTypeEnum;
    public CreatedBy: string;
    public CreatedAt: Date;
    public VatTypeID: number;
    public Name: string;
    public Deleted: boolean;
    public ImageFileID: number;
    public PriceExVat: number;
    public UpdatedAt: Date;
    public Unit: string;
    public CostPrice: number;
    public ListPrice: number;
    public DimensionsID: number;
    public Description: string;
    public VariansParentID: number;
    public CalculateGrossPriceBasedOnNetPrice: boolean;
    public AccountID: number;
    public DefaultProductCategoryID: number;
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

    public NumberSeriesTypeID: number;
    public ID: number;
    public AccountYear: number;
    public UpdatedBy: string;
    public Disabled: boolean;
    public FromNumber: number;
    public NumberSeriesTaskID: number;
    public StatusCode: number;
    public CreatedBy: string;
    public IsDefaultForTask: boolean;
    public CreatedAt: Date;
    public MainAccountID: number;
    public Name: string;
    public NumberLock: boolean;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public ToNumber: number;
    public Comment: string;
    public NextNumber: number;
    public System: boolean;
    public UseNumbersFromNumberSeriesID: number;
    public Empty: boolean;
    public DisplayName: string;
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

    public ID: number;
    public UpdatedBy: string;
    public NumberSerieTypeBID: number;
    public StatusCode: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Deleted: boolean;
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

    public ID: number;
    public UpdatedBy: string;
    public EntityType: string;
    public StatusCode: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Name: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public _createguid: string;
    public NumberSeries: Array<NumberSeries>;
    public CustomFields: any;
}


export class NumberSeriesType extends UniEntity {
    public static RelativeUrl = 'number-series-types';
    public static EntityType = 'NumberSeriesType';

    public EntitySeriesIDField: string;
    public ID: number;
    public EntityField: string;
    public UpdatedBy: string;
    public EntityType: string;
    public StatusCode: number;
    public CanHaveSeveralActiveSeries: boolean;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Name: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public System: boolean;
    public Yearly: boolean;
    public _createguid: string;
    public Series: Array<NumberSeries>;
    public CustomFields: any;
}


export class EncryptionInfo extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'EncryptionInfo';

    public ID: number;
    public UpdatedBy: string;
    public type: Type;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public description: string;
    public password: string;
    public _createguid: string;
    public CustomFields: any;
}


export class File extends UniEntity {
    public static RelativeUrl = 'files/{entitytype}/{entityid}';
    public static EntityType = 'File';

    public StorageReference: string;
    public PermaLink: string;
    public ID: number;
    public ContentType: string;
    public UpdatedBy: string;
    public StatusCode: number;
    public Pages: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Size: string;
    public Name: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public OCRData: string;
    public Description: string;
    public Md5: string;
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

    public TagName: string;
    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Status: number;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public FileID: number;
    public _createguid: string;
    public File: File;
    public CustomFields: any;
}


export class FileEntityLink extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'FileEntityLink';

    public ID: number;
    public UpdatedBy: string;
    public EntityType: string;
    public EntityID: number;
    public StatusCode: number;
    public IsAttachment: boolean;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public FileID: number;
    public _createguid: string;
    public File: File;
    public CustomFields: any;
}


export class ElsaUsageLog extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ElsaUsageLog';

    public ProductType: string;
    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Quantity: number;
    public DateLogged: Date;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public ExternalReference: string;
    public _createguid: string;
    public CustomFields: any;
}


export class AccessPointFormat extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AccessPointFormat';

    public ResourceName: string;
    public IncommingID: number;
    public ID: number;
    public UpdatedBy: string;
    public Label: string;
    public StatusCode: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Name: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public OutgoingID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class EHFLog extends UniEntity {
    public static RelativeUrl = 'ehf';
    public static EntityType = 'EHFLog';

    public EntityDisplayValue: string;
    public ExternalMessage: string;
    public ID: number;
    public From: string;
    public UpdatedBy: string;
    public EntityType: string;
    public EntityID: number;
    public StatusCode: number;
    public JobRunID: number;
    public Type: SharingType;
    public CreatedBy: string;
    public CreatedAt: Date;
    public DistributeAt: LocalDate;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public To: string;
    public ExternalReference: string;
    public Subject: string;
    public JobRunExternalRef: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Department extends UniEntity {
    public static RelativeUrl = 'departments';
    public static EntityType = 'Department';

    public ID: number;
    public DepartmentManagerName: string;
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Name: string;
    public Deleted: boolean;
    public DepartmentNumberNumeric: number;
    public UpdatedAt: Date;
    public DepartmentNumber: string;
    public Description: string;
    public DepartmentNumberSeriesID: number;
    public _createguid: string;
    public DepartmentNumberSeries: NumberSeries;
    public CustomFields: any;
}


export class Dimension10 extends UniEntity {
    public static RelativeUrl = 'Dimension10';
    public static EntityType = 'Dimension10';

    public ID: number;
    public UpdatedBy: string;
    public Number: string;
    public StatusCode: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Name: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public NumberNumeric: number;
    public Description: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Dimension5 extends UniEntity {
    public static RelativeUrl = 'Dimension5';
    public static EntityType = 'Dimension5';

    public ID: number;
    public UpdatedBy: string;
    public Number: string;
    public StatusCode: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Name: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public NumberNumeric: number;
    public Description: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Dimension6 extends UniEntity {
    public static RelativeUrl = 'Dimension6';
    public static EntityType = 'Dimension6';

    public ID: number;
    public UpdatedBy: string;
    public Number: string;
    public StatusCode: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Name: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public NumberNumeric: number;
    public Description: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Dimension7 extends UniEntity {
    public static RelativeUrl = 'Dimension7';
    public static EntityType = 'Dimension7';

    public ID: number;
    public UpdatedBy: string;
    public Number: string;
    public StatusCode: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Name: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public NumberNumeric: number;
    public Description: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Dimension8 extends UniEntity {
    public static RelativeUrl = 'Dimension8';
    public static EntityType = 'Dimension8';

    public ID: number;
    public UpdatedBy: string;
    public Number: string;
    public StatusCode: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Name: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public NumberNumeric: number;
    public Description: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Dimension9 extends UniEntity {
    public static RelativeUrl = 'Dimension9';
    public static EntityType = 'Dimension9';

    public ID: number;
    public UpdatedBy: string;
    public Number: string;
    public StatusCode: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Name: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public NumberNumeric: number;
    public Description: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Dimensions extends UniEntity {
    public static RelativeUrl = 'dimensions';
    public static EntityType = 'Dimensions';

    public Dimension6ID: number;
    public ID: number;
    public UpdatedBy: string;
    public Dimension10ID: number;
    public StatusCode: number;
    public Dimension9ID: number;
    public DepartmentID: number;
    public ProjectID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public ResponsibleID: number;
    public Dimension7ID: number;
    public Deleted: boolean;
    public Dimension5ID: number;
    public ProjectTaskID: number;
    public Dimension8ID: number;
    public UpdatedAt: Date;
    public RegionID: number;
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
    public ID: number;
    public ProjectTaskNumber: string;
    public ResponsibleName: string;
    public RegionName: string;
    public Dimension9Name: string;
    public DepartmentName: string;
    public Dimension9Number: string;
    public Dimension6Name: string;
    public Dimension5Name: string;
    public Dimension7Name: string;
    public ProjectTaskName: string;
    public Dimension7Number: string;
    public Dimension5Number: string;
    public Dimension8Number: string;
    public RegionCode: string;
    public Dimension10Number: string;
    public ProjectNumber: string;
    public DimensionsID: number;
    public ProjectName: string;
    public Dimension6Number: string;
    public Dimension10Name: string;
    public DepartmentNumber: string;
    public Dimension8Name: string;
}


export class DimensionSettings extends UniEntity {
    public static RelativeUrl = 'dimensionsettings';
    public static EntityType = 'DimensionSettings';

    public ID: number;
    public IsActive: boolean;
    public UpdatedBy: string;
    public Dimension: number;
    public Label: string;
    public StatusCode: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class Region extends UniEntity {
    public static RelativeUrl = 'regions';
    public static EntityType = 'Region';

    public ID: number;
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
    public CountryCode: string;
    public CreatedAt: Date;
    public Name: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public RegionCode: string;
    public Description: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Responsible extends UniEntity {
    public static RelativeUrl = 'responsibles';
    public static EntityType = 'Responsible';

    public NameOfResponsible: string;
    public ID: number;
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Name: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public Description: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Contract extends UniEntity {
    public static RelativeUrl = 'contracts';
    public static EntityType = 'Contract';

    public TeamsUri: string;
    public ID: number;
    public UpdatedBy: string;
    public Hash: string;
    public HashTransactionAddress: string;
    public StatusCode: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Name: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public ContractCode: string;
    public Description: string;
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

    public Amount: number;
    public ID: number;
    public UpdatedBy: string;
    public EntityType: string;
    public ContractAssetID: number;
    public EntityID: number;
    public StatusCode: number;
    public Type: AddressType;
    public CreatedBy: string;
    public Address: string;
    public CreatedAt: Date;
    public ContractID: number;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public AssetAddress: string;
    public _createguid: string;
    public Contract: Contract;
    public ContractAsset: ContractAsset;
    public CustomFields: any;
}


export class ContractAsset extends UniEntity {
    public static RelativeUrl = 'contractassets';
    public static EntityType = 'ContractAsset';

    public IsIssuedByDefinerOnly: boolean;
    public ID: number;
    public UpdatedBy: string;
    public IsTransferrable: boolean;
    public StatusCode: number;
    public IsCosignedByDefiner: boolean;
    public IsAutoDestroy: boolean;
    public Type: AddressType;
    public CreatedBy: string;
    public IsPrivate: boolean;
    public SpenderAttested: boolean;
    public CreatedAt: Date;
    public ContractID: number;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public Cap: number;
    public IsFixedDenominations: boolean;
    public _createguid: string;
    public Contract: Contract;
    public CustomFields: any;
}


export class ContractDebugLog extends UniEntity {
    public static RelativeUrl = 'contractdebuglogs';
    public static EntityType = 'ContractDebugLog';

    public ID: number;
    public UpdatedBy: string;
    public ContractRunLogID: number;
    public StatusCode: number;
    public Type: ContractEventType;
    public CreatedBy: string;
    public CreatedAt: Date;
    public ContractID: number;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public Message: string;
    public _createguid: string;
    public Contract: Contract;
    public ContractRunLog: ContractRunLog;
    public CustomFields: any;
}


export class ContractParameter extends UniEntity {
    public static RelativeUrl = 'contractparameters';
    public static EntityType = 'ContractParameter';

    public ID: number;
    public UpdatedBy: string;
    public StatusCode: number;
    public Value: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Name: string;
    public ContractID: number;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public _createguid: string;
    public Contract: Contract;
    public CustomFields: any;
}


export class ContractRunLog extends UniEntity {
    public static RelativeUrl = 'contractrunlogs';
    public static EntityType = 'ContractRunLog';

    public ID: number;
    public UpdatedBy: string;
    public RunTime: string;
    public ContractTriggerID: number;
    public StatusCode: number;
    public Type: ContractEventType;
    public CreatedBy: string;
    public CreatedAt: Date;
    public ContractID: number;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public Message: string;
    public _createguid: string;
    public Contract: Contract;
    public CustomFields: any;
}


export class ContractTransaction extends UniEntity {
    public static RelativeUrl = 'contracttransactions';
    public static EntityType = 'ContractTransaction';

    public Amount: number;
    public ContractAddressID: number;
    public ID: number;
    public UpdatedBy: string;
    public StatusCode: number;
    public SenderAddress: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public ContractID: number;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public ReceiverAddress: string;
    public AssetAddress: string;
    public _createguid: string;
    public Contract: Contract;
    public ContractAddress: ContractAddress;
    public CustomFields: any;
}


export class ContractTrigger extends UniEntity {
    public static RelativeUrl = 'contracttriggers';
    public static EntityType = 'ContractTrigger';

    public ID: number;
    public UpdatedBy: string;
    public StatusCode: number;
    public Type: ContractEventType;
    public CreatedBy: string;
    public CreatedAt: Date;
    public ExpressionFilter: string;
    public ContractID: number;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public ModelFilter: string;
    public OperationFilter: string;
    public _createguid: string;
    public Contract: Contract;
    public CustomFields: any;
}


export class Comment extends UniEntity {
    public static RelativeUrl = 'comments';
    public static EntityType = 'Comment';

    public AuthorID: number;
    public ID: number;
    public UpdatedBy: string;
    public EntityType: string;
    public EntityID: number;
    public StatusCode: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public Text: string;
    public _createguid: string;
    public Mentioned: Array<Mentioned>;
    public Author: User;
    public CustomFields: any;
}


export class Mentioned extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Mentioned';

    public ID: number;
    public UpdatedBy: string;
    public StatusCode: number;
    public UserID: number;
    public CommentID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public _createguid: string;
    public User: User;
    public CustomFields: any;
}


export class ApiKey extends UniEntity {
    public static RelativeUrl = 'apikeys';
    public static EntityType = 'ApiKey';

    public Encrypt: boolean;
    public ID: number;
    public IntegrationType: TypeOfIntegration;
    public UpdatedBy: string;
    public IntegrationKey: string;
    public StatusCode: number;
    public Url: string;
    public ExternalId: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public FilterDate: LocalDate;
    public Description: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Altinn extends UniEntity {
    public static RelativeUrl = 'altinn';
    public static EntityType = 'Altinn';

    public ID: number;
    public PreferredLogin: TypeOfLogin;
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public Language: string;
    public UpdatedAt: Date;
    public SystemPw: string;
    public SystemID: string;
    public _createguid: string;
    public CustomFields: any;
}


export class AltinnReceipt extends UniEntity {
    public static RelativeUrl = 'altinnreceipts';
    public static EntityType = 'AltinnReceipt';

    public UserSign: string;
    public ID: number;
    public UpdatedBy: string;
    public TimeStamp: Date;
    public StatusCode: number;
    public AltinnResponseData: string;
    public HasBeenRegistered: boolean;
    public CreatedBy: string;
    public ErrorText: string;
    public CreatedAt: Date;
    public Form: string;
    public Deleted: boolean;
    public ReceiptID: number;
    public UpdatedAt: Date;
    public XmlReceipt: string;
    public _createguid: string;
    public Signings: Array<AltinnSigning>;
    public CustomFields: any;
}


export class AltinnSigning extends UniEntity {
    public static RelativeUrl = 'altinnsigning';
    public static EntityType = 'AltinnSigning';

    public ID: number;
    public UpdatedBy: string;
    public StatusText: string;
    public StatusCode: number;
    public SignatureReference: string;
    public AltinnReceiptID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public SignatureText: string;
    public UpdatedAt: Date;
    public DateSigned: Date;
    public _createguid: string;
    public AltinnReceipt: AltinnReceipt;
    public CustomFields: any;
}


export class Barnepass extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Barnepass';

    public ID: number;
    public UpdatedBy: string;
    public inntektsaar: number;
    public StatusCode: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public _createguid: string;
    public oppgave: Array<BarnepassOppgave>;
    public CustomFields: any;
}


export class BarnepassOppgave extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'BarnepassOppgave';

    public BarnepassID: number;
    public ID: number;
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
    public email: string;
    public CreatedAt: Date;
    public paaloeptBeloep: number;
    public Deleted: boolean;
    public navn: string;
    public UpdatedAt: Date;
    public foedselsnummer: string;
    public _createguid: string;
    public CustomFields: any;
}


export class UserRole extends UniEntity {
    public static RelativeUrl = 'userroles';
    public static EntityType = 'UserRole';

    public ID: number;
    public UpdatedBy: string;
    public UserID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public SharedRoleId: number;
    public SharedRoleName: string;
    public _createguid: string;
    public User: User;
    public CustomFields: any;
}


export class Role extends UniEntity {
    public static RelativeUrl = 'roles';
    public static EntityType = 'Role';

    public ID: number;
    public UpdatedBy: string;
    public Label: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Name: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public Description: string;
    public _createguid: string;
    public RolePermissions: Array<RolePermission>;
    public CustomFields: any;
}


export class RolePermission extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'RolePermission';

    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public RoleID: number;
    public PermissionID: number;
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
    public CreatedAt: Date;
    public Name: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public _createguid: string;
    public RolePermissions: Array<RolePermission>;
    public CustomFields: any;
}


export class ApiMessage extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ApiMessage';

    public ID: number;
    public UpdatedBy: string;
    public Service: string;
    public StatusCode: number;
    public Type: ApiMessageType;
    public CreatedBy: string;
    public CreatedAt: Date;
    public ToDate: Date;
    public FromDate: Date;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public Message: string;
    public _createguid: string;
    public CustomFields: any;
}


export class AvtaleGiroAgreement extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AvtaleGiroAgreement';

    public ID: number;
    public UpdatedBy: string;
    public KeyPath: string;
    public Thumbprint: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public DataSender: string;
    public UpdatedAt: Date;
    public Description: string;
    public NextNumber: number;
    public _createguid: string;
    public CustomFields: any;
}


export class AvtaleGiroBankAccount extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AvtaleGiroBankAccount';

    public ID: number;
    public UpdatedBy: string;
    public CompanyID: number;
    public BankAccountNumber: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public AvtaleGiroAgreementID: number;
    public _createguid: string;
    public Company: Company;
    public CustomFields: any;
}


export class AvtaleGiroFile extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AvtaleGiroFile';

    public ID: number;
    public UpdatedBy: string;
    public CompanyID: number;
    public AvtaleGiroContent: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public AvtaleGiroMergedFileID: number;
    public AvtaleGiroAgreementID: number;
    public FileID: number;
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
    public CreatedAt: Date;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public TransmissionNumber: number;
    public _createguid: string;
    public CustomFields: any;
}


export class BankAgreement extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'BankAgreement';

    public ServiceAccountID: number;
    public ReceiptDate: Date;
    public OrderMobile: string;
    public ID: number;
    public ServiceID: string;
    public CustomerName: string;
    public OrderName: string;
    public UpdatedBy: string;
    public AccountOwnerOrgNumber: string;
    public CompanyID: number;
    public AccountOwnerName: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public ReceiptID: string;
    public UpdatedAt: Date;
    public CustomerOrgNumber: string;
    public OrderEmail: string;
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
    public UpdatedBy: string;
    public ConfirmInNetbank: boolean;
    public DivisionID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public BankAgreementID: number;
    public KidRule: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public DivisionName: string;
    public FileType: string;
    public ServiceType: number;
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
    public BankServiceID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public AccountNumber: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public _createguid: string;
    public BankService: BankService;
    public CustomFields: any;
}


export class Company extends UniEntity {
    public static RelativeUrl = 'companies';
    public static EntityType = 'Company';

    public LastActivity: Date;
    public Key: string;
    public IsTemplate: boolean;
    public ID: number;
    public MigrationVersion: string;
    public UpdatedBy: string;
    public WebHookSubscriberId: string;
    public ClientNumber: number;
    public FileFlowEmail: string;
    public StatusCode: CompanyStatusCode;
    public ConnectionString: string;
    public SchemaName: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public OrganizationNumber: string;
    public Name: string;
    public Deleted: boolean;
    public IsGlobalTemplate: boolean;
    public UpdatedAt: Date;
    public IsTest: boolean;
    public FileFlowOrgnrEmail: string;
    public _createguid: string;
    public CustomFields: any;
}


export class CompanyAccess extends UniEntity {
    public static RelativeUrl = 'companies-access';
    public static EntityType = 'CompanyAccess';

    public Roles: string;
    public ID: number;
    public UpdatedBy: string;
    public CompanyID: number;
    public StatusCode: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public GlobalIdentity: string;
    public UpdatedAt: Date;
    public StartDate: Date;
    public EndDate: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class CompanyBackup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'CompanyBackup';

    public CompanyKey: string;
    public Reason: string;
    public ID: number;
    public CustomerName: string;
    public UpdatedBy: string;
    public ContractType: number;
    public ContainerName: string;
    public ScheduledForDeleteAt: Date;
    public BackupStatus: BackupStatus;
    public SchemaName: string;
    public CreatedBy: string;
    public Environment: string;
    public CreatedAt: Date;
    public DeletedAt: Date;
    public ContractID: number;
    public Deleted: boolean;
    public CompanyName: string;
    public UpdatedAt: Date;
    public OrgNumber: string;
    public CloudBlobName: string;
    public CopyFiles: boolean;
    public Message: string;
    public _createguid: string;
    public CustomFields: any;
}


export class ContractCron extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ContractCron';

    public ID: number;
    public UpdatedBy: string;
    public ContractTriggerID: number;
    public CompanyID: number;
    public Expression: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public ContractID: number;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public CompanyKey: string;
    public CompanyDbName: string;
    public _createguid: string;
    public CustomFields: any;
}


export class ContractObyte extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ContractObyte';

    public ContractAddressID: number;
    public ID: number;
    public UpdatedBy: string;
    public CompanyID: number;
    public CreatedBy: string;
    public Address: string;
    public CreatedAt: Date;
    public ContractID: number;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public AssetAddress: string;
    public CompanyKey: string;
    public CompanyDbName: string;
    public _createguid: string;
    public CustomFields: any;
}


export class DeniedUserAccessLog extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'DeniedUserAccessLog';

    public ID: number;
    public UpdatedBy: string;
    public Username: string;
    public CompanyID: number;
    public CreatedBy: string;
    public Email: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public CompanyName: string;
    public UpdatedAt: Date;
    public Occurred: Date;
    public Message: string;
    public _createguid: string;
    public Company: Company;
    public CustomFields: any;
}


export class FailedBankFile extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'FailedBankFile';

    public CompanyKey: string;
    public ID: number;
    public UpdatedBy: string;
    public FailedReason: FailedReasonEnum;
    public CreatedBy: string;
    public CreatedAt: Date;
    public FileName: string;
    public FileContent: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class HangfireJob extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'HangfireJob';

    public CompanyKey: string;
    public ID: number;
    public CompanyID: number;
    public Year: number;
    public CreatedAt: Date;
    public Status: number;
    public GlobalIdentity: string;
    public UpdatedAt: Date;
    public JobId: string;
    public HasError: boolean;
    public Completed: boolean;
    public CustomFields: any;
}


export class HangfireJobContext extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'HangfireJobContext';

    public CompanyKey: string;
    public ID: number;
    public CompanyID: number;
    public SchemaName: string;
    public Year: number;
    public CreatedAt: Date;
    public Status: number;
    public GlobalIdentity: string;
    public UpdatedAt: Date;
    public JobId: string;
    public HasError: boolean;
    public Completed: boolean;
    public CustomFields: any;
}


export class HangfireResponse extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'HangfireResponse';

    public CompanyKey: string;
    public State: string;
    public ID: number;
    public CompanyID: number;
    public ProgressUrl: string;
    public Year: number;
    public CreatedAt: Date;
    public Status: number;
    public GlobalIdentity: string;
    public UpdatedAt: Date;
    public JobId: string;
    public HasError: boolean;
    public Completed: boolean;
    public CustomFields: any;
}


export class KpiDefinition extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'KpiDefinition';

    public IsPerUser: boolean;
    public ID: number;
    public UpdatedBy: string;
    public CompanyID: number;
    public SourceType: KpiSourceType;
    public RoleNames: string;
    public CreatedBy: string;
    public Interval: string;
    public CreatedAt: Date;
    public ValueType: KpiValueType;
    public RefreshModels: string;
    public Route: string;
    public Name: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public Application: string;
    public _createguid: string;
    public CustomFields: any;
}


export class KpiValue extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'KpiValue';

    public KpiDefinitionID: number;
    public ID: number;
    public UpdatedBy: string;
    public CompanyID: number;
    public UserIdentity: string;
    public KpiName: string;
    public CreatedBy: string;
    public Counter: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public LastUpdated: Date;
    public Total: number;
    public Text: string;
    public ValueStatus: KpiValueStatus;
    public _createguid: string;
    public CustomFields: any;
}


export class OutgoingInvoice extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'OutgoingInvoice';

    public Amount: number;
    public MetaJson: string;
    public ID: number;
    public InvoiceType: OutgoingInvoiceType;
    public UpdatedBy: string;
    public RecipientOrganizationNumber: string;
    public CompanyID: number;
    public StatusCode: number;
    public ISPOrganizationNumber: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Status: number;
    public DueDate: Date;
    public InvoiceID: number;
    public Deleted: boolean;
    public RecipientPhoneNumber: string;
    public UpdatedAt: Date;
    public ExternalReference: string;
    public _createguid: string;
    public Company: Company;
    public CustomFields: any;
}


export class ProcessFileLog extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ProcessFileLog';

    public CompanyKey: string;
    public ID: number;
    public UpdatedBy: string;
    public EntityName: string;
    public CompanyID: number;
    public UserIdentity: string;
    public StatusCode: number;
    public CreatedBy: string;
    public EntityInstanceID: string;
    public CreatedAt: Date;
    public FileName: string;
    public Deleted: boolean;
    public CompanyName: string;
    public UpdatedAt: Date;
    public EntityCount: number;
    public FileType: number;
    public Message: string;
    public FileID: number;
    public _createguid: string;
    public Company: Company;
    public CustomFields: any;
}


export class ServiceAccount extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ServiceAccount';

    public ID: number;
    public UpdatedBy: string;
    public KeyPath: string;
    public Thumbprint: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public DataSender: string;
    public UpdatedAt: Date;
    public Description: string;
    public NextNumber: number;
    public _createguid: string;
    public CustomFields: any;
}


export class UserVerification extends UniEntity {
    public static RelativeUrl = 'user-verifications';
    public static EntityType = 'UserVerification';

    public ID: number;
    public UpdatedBy: string;
    public VerificationCode: string;
    public VerificationDate: Date;
    public CompanyId: number;
    public StatusCode: number;
    public UserId: number;
    public CreatedBy: string;
    public Email: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public ExpirationDate: Date;
    public DisplayName: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Account extends UniEntity {
    public static RelativeUrl = 'accounts';
    public static EntityType = 'Account';

    public Keywords: string;
    public ID: number;
    public UpdatedBy: string;
    public TopLevelAccountGroupID: number;
    public StatusCode: number;
    public CostAllocationID: number;
    public EmployeeID: number;
    public Locked: boolean;
    public Visible: boolean;
    public CreatedBy: string;
    public CreatedAt: Date;
    public AccountNumber: number;
    public LockManualPosts: boolean;
    public VatTypeID: number;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public CurrencyCodeID: number;
    public SaftMappingAccountID: number;
    public AccountSetupID: number;
    public UsePostPost: boolean;
    public DimensionsID: number;
    public Active: boolean;
    public SupplierID: number;
    public SystemAccount: boolean;
    public UseVatDeductionGroupID: number;
    public Description: string;
    public AccountName: string;
    public DoSynchronize: boolean;
    public CustomerID: number;
    public AccountID: number;
    public AccountGroupID: number;
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

    public ID: number;
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Name: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public AccountID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class AccountGroup extends UniEntity {
    public static RelativeUrl = 'accountgroups';
    public static EntityType = 'AccountGroup';

    public AccountGroupSetupID: number;
    public ID: number;
    public AccountGroupSetID: number;
    public UpdatedBy: string;
    public GroupNumber: string;
    public StatusCode: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Name: string;
    public CompatibleAccountID: number;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public Summable: boolean;
    public MainGroupID: number;
    public AccountID: number;
    public _createguid: string;
    public MainGroup: AccountGroup;
    public AccountGroupSet: AccountGroupSet;
    public CustomFields: any;
}


export class AccountGroupSet extends UniEntity {
    public static RelativeUrl = 'accountgroupsets';
    public static EntityType = 'AccountGroupSet';

    public ID: number;
    public Shared: boolean;
    public UpdatedBy: string;
    public StatusCode: number;
    public ToAccountNumber: number;
    public FromAccountNumber: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public SubAccountAllowed: boolean;
    public Name: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public System: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class AccountMandatoryDimension extends UniEntity {
    public static RelativeUrl = 'accountmandatorydimension';
    public static EntityType = 'AccountMandatoryDimension';

    public ID: number;
    public UpdatedBy: string;
    public StatusCode: number;
    public MandatoryType: number;
    public CreatedBy: string;
    public DimensionNo: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public AccountID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class Accrual extends UniEntity {
    public static RelativeUrl = 'accruals';
    public static EntityType = 'Accrual';

    public ID: number;
    public UpdatedBy: string;
    public BalanceAccountID: number;
    public StatusCode: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public JournalEntryLineDraftID: number;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public AccrualJournalEntryMode: number;
    public ResultAccountID: number;
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

    public Amount: number;
    public ID: number;
    public AccountYear: number;
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public AccrualID: number;
    public Deleted: boolean;
    public JournalEntryDraftLineID: number;
    public UpdatedAt: Date;
    public PeriodNo: number;
    public _createguid: string;
    public Accrual: Accrual;
    public JournalEntryLineDraft: JournalEntryLineDraft;
    public CustomFields: any;
}


export class Asset extends UniEntity {
    public static RelativeUrl = 'assets';
    public static EntityType = 'Asset';

    public AutoDepreciation: boolean;
    public ID: number;
    public UpdatedBy: string;
    public BalanceAccountID: number;
    public AssetGroupCode: string;
    public PurchaseAmount: number;
    public StatusCode: number;
    public DepreciationAccountID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public DepreciationCycle: number;
    public PurchaseDate: LocalDate;
    public Name: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public DimensionsID: number;
    public ScrapValue: number;
    public DepreciationStartDate: LocalDate;
    public Lifetime: number;
    public NetFinancialValue: number;
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

    public ID: number;
    public UpdatedBy: string;
    public BIC: string;
    public InitialBIC: string;
    public StatusCode: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public PhoneID: number;
    public Name: string;
    public AddressID: number;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public Web: string;
    public EmailID: number;
    public _createguid: string;
    public Address: Address;
    public Phone: Phone;
    public Email: Email;
    public CustomFields: any;
}


export class BankAccount extends UniEntity {
    public static RelativeUrl = 'bankaccounts';
    public static EntityType = 'BankAccount';

    public IBAN: string;
    public ID: number;
    public BankAccountType: string;
    public BusinessRelationID: number;
    public UpdatedBy: string;
    public IntegrationSettings: string;
    public Label: string;
    public CompanySettingsID: number;
    public StatusCode: number;
    public BankID: number;
    public Locked: boolean;
    public CreatedBy: string;
    public CreatedAt: Date;
    public IntegrationStatus: number;
    public AccountNumber: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
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
    public ServiceID: string;
    public UpdatedBy: string;
    public BankAcceptance: boolean;
    public IsBankBalance: boolean;
    public ServiceProvider: number;
    public IsInbound: boolean;
    public StatusCode: number;
    public PropertiesJson: string;
    public BankAccountID: number;
    public CreatedBy: string;
    public Email: string;
    public CreatedAt: Date;
    public IsOutgoing: boolean;
    public Name: string;
    public Deleted: boolean;
    public HasNewAccountInformation: boolean;
    public UpdatedAt: Date;
    public ServiceTemplateID: string;
    public DefaultAgreement: boolean;
    public HasOrderedIntegrationChange: boolean;
    public _createguid: string;
    public Password: string;
    public BankAccount: BankAccount;
    public CustomFields: any;
}


export class BankRule extends UniEntity {
    public static RelativeUrl = 'bankrules';
    public static EntityType = 'BankRule';

    public ID: number;
    public IsActive: boolean;
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Name: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public Rule: string;
    public Priority: number;
    public ActionCode: ActionCodeBankRule;
    public AccountID: number;
    public _createguid: string;
    public Account: Account;
    public CustomFields: any;
}


export class BankStatement extends UniEntity {
    public static RelativeUrl = 'bankstatements';
    public static EntityType = 'BankStatement';

    public Amount: number;
    public ID: number;
    public UpdatedBy: string;
    public StatusCode: number;
    public CurrencyCode: string;
    public AmountCurrency: number;
    public BankAccountID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public ToDate: LocalDate;
    public FromDate: LocalDate;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public ArchiveReference: string;
    public EndBalance: number;
    public StartBalance: number;
    public AccountID: number;
    public FileID: number;
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

    public Amount: number;
    public Category: string;
    public TransactionId: string;
    public OpenAmount: number;
    public ID: number;
    public SenderName: string;
    public BookingDate: LocalDate;
    public UpdatedBy: string;
    public StructuredReference: string;
    public CID: string;
    public StatusCode: number;
    public ValueDate: LocalDate;
    public CurrencyCode: string;
    public ReceiverAccount: string;
    public AmountCurrency: number;
    public OpenAmountCurrency: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public InvoiceNumber: string;
    public Deleted: boolean;
    public Receivername: string;
    public UpdatedAt: Date;
    public ArchiveReference: string;
    public SenderAccount: string;
    public Description: string;
    public BankStatementID: number;
    public _createguid: string;
    public BankStatement: BankStatement;
    public CustomFields: any;
}


export class BankStatementMatch extends UniEntity {
    public static RelativeUrl = 'bankstatementmatch';
    public static EntityType = 'BankStatementMatch';

    public Amount: number;
    public ID: number;
    public UpdatedBy: string;
    public StatusCode: number;
    public BankStatementEntryID: number;
    public Group: string;
    public JournalEntryLineID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Deleted: boolean;
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

    public ID: number;
    public IsActive: boolean;
    public UpdatedBy: string;
    public EntryText: string;
    public StatusCode: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Name: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public Rule: string;
    public Priority: number;
    public DimensionsID: number;
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
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Name: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public AccountingYear: number;
    public _createguid: string;
    public Entries: Array<BudgetEntry>;
    public CustomFields: any;
}


export class BudgetEntry extends UniEntity {
    public static RelativeUrl = 'budgetentries';
    public static EntityType = 'BudgetEntry';

    public Amount: number;
    public ID: number;
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public BudgetID: number;
    public DimensionsID: number;
    public AccountID: number;
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

    public ID: number;
    public AssetSaleProfitBalancingAccountID: number;
    public UpdatedBy: string;
    public AssetSaleLossNoVatAccountID: number;
    public StatusCode: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public ReInvoicingCostsharingProductID: number;
    public AssetSaleLossVatAccountID: number;
    public ReInvoicingMethod: number;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public ReInvoicingTurnoverProductID: number;
    public AssetSaleLossBalancingAccountID: number;
    public AssetSaleProfitVatAccountID: number;
    public AssetWriteoffAccountID: number;
    public AssetSaleProfitNoVatAccountID: number;
    public AssetSaleProductID: number;
    public _createguid: string;
    public ReInvoicingCostsharingProduct: Product;
    public ReInvoicingTurnoverProduct: Product;
    public CustomFields: any;
}


export class CompanyBankAccount extends UniEntity {
    public static RelativeUrl = 'companybankaccounts';
    public static EntityType = 'CompanyBankAccount';

    public ID: number;
    public UpdatedBy: string;
    public StatusCode: number;
    public BankAccountID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public IsOutgoing: boolean;
    public Name: string;
    public IsSalary: boolean;
    public Deleted: boolean;
    public CreditAmount: number;
    public UpdatedAt: Date;
    public IsTax: boolean;
    public IsIncomming: boolean;
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
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Name: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public _createguid: string;
    public Items: Array<CostAllocationItem>;
    public CustomFields: any;
}


export class CostAllocationItem extends UniEntity {
    public static RelativeUrl = 'costallocationitems';
    public static EntityType = 'CostAllocationItem';

    public Amount: number;
    public ID: number;
    public UpdatedBy: string;
    public StatusCode: number;
    public CostAllocationID: number;
    public Percent: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public VatTypeID: number;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public DimensionsID: number;
    public Description: string;
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

    public Amount: number;
    public IsCustomerPayment: boolean;
    public ID: number;
    public CustomLiquidityPaymentType: CustomLiquidityPaymentInterval;
    public UpdatedBy: string;
    public StatusCode: number;
    public AmountCurrency: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public DueDate: LocalDate;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public CurrencyCodeID: number;
    public Description: string;
    public EndDate: LocalDate;
    public _createguid: string;
    public currency: CurrencyCode;
    public CustomFields: any;
}


export class DepreciationLine extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'DepreciationLine';

    public ID: number;
    public UpdatedBy: string;
    public StatusCode: number;
    public AssetID: number;
    public DepreciationJELineID: number;
    public AssetJELineID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public DepreciationType: number;
    public _createguid: string;
    public DepreciationJELine: JournalEntryLine;
    public AssetJELine: JournalEntryLine;
    public CustomFields: any;
}


export class FinancialYear extends UniEntity {
    public static RelativeUrl = 'financialyears';
    public static EntityType = 'FinancialYear';

    public ID: number;
    public UpdatedBy: string;
    public StatusCode: number;
    public ValidFrom: LocalDate;
    public CreatedBy: string;
    public Year: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public ValidTo: LocalDate;
    public _createguid: string;
    public CustomFields: any;
}


export class JournalEntry extends UniEntity {
    public static RelativeUrl = 'journalentries';
    public static EntityType = 'JournalEntry';

    public ID: number;
    public UpdatedBy: string;
    public FinancialYearID: number;
    public NumberSeriesTaskID: number;
    public StatusCode: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public JournalEntryNumberNumeric: number;
    public JournalEntryAccrualID: number;
    public UpdatedAt: Date;
    public NumberSeriesID: number;
    public JournalEntryNumber: string;
    public Description: string;
    public JournalEntryDraftGroup: string;
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

    public Amount: number;
    public SupplierInvoiceID: number;
    public ID: number;
    public CustomerInvoiceID: number;
    public SubAccountID: number;
    public UpdatedBy: string;
    public VatReportID: number;
    public StatusCode: number;
    public RestAmount: number;
    public VatDeductionPercent: number;
    public VatPercent: number;
    public CurrencyExchangeRate: number;
    public AmountCurrency: number;
    public RegisteredDate: LocalDate;
    public CustomerOrderID: number;
    public TaxBasisAmount: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public ReferenceOriginalPostID: number;
    public JournalEntryLineDraftID: number;
    public DueDate: LocalDate;
    public InvoiceNumber: string;
    public VatTypeID: number;
    public AccrualID: number;
    public OriginalReferencePostID: number;
    public Deleted: boolean;
    public JournalEntryNumberNumeric: number;
    public PaymentID: string;
    public OriginalJournalEntryPost: number;
    public UpdatedAt: Date;
    public VatPeriodID: number;
    public PaymentReferenceID: number;
    public PeriodID: number;
    public JournalEntryTypeID: number;
    public BatchNumber: number;
    public FinancialDate: LocalDate;
    public CurrencyCodeID: number;
    public RestAmountCurrency: number;
    public DimensionsID: number;
    public JournalEntryNumber: string;
    public PostPostJournalEntryLineID: number;
    public ReferenceCreditPostID: number;
    public TaxBasisAmountCurrency: number;
    public VatJournalEntryPostID: number;
    public Description: string;
    public PaymentInfoTypeID: number;
    public JournalEntryID: number;
    public AccountID: number;
    public Signature: string;
    public VatDate: LocalDate;
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

    public Amount: number;
    public SupplierInvoiceID: number;
    public ID: number;
    public CustomerInvoiceID: number;
    public SubAccountID: number;
    public UpdatedBy: string;
    public StatusCode: number;
    public VatDeductionPercent: number;
    public VatPercent: number;
    public CurrencyExchangeRate: number;
    public AmountCurrency: number;
    public RegisteredDate: LocalDate;
    public CustomerOrderID: number;
    public TaxBasisAmount: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public DueDate: LocalDate;
    public InvoiceNumber: string;
    public VatTypeID: number;
    public AccrualID: number;
    public Deleted: boolean;
    public JournalEntryNumberNumeric: number;
    public PaymentID: string;
    public UpdatedAt: Date;
    public VatPeriodID: number;
    public PaymentReferenceID: number;
    public PeriodID: number;
    public JournalEntryTypeID: number;
    public BatchNumber: number;
    public FinancialDate: LocalDate;
    public CurrencyCodeID: number;
    public DimensionsID: number;
    public JournalEntryNumber: string;
    public PostPostJournalEntryLineID: number;
    public TaxBasisAmountCurrency: number;
    public Description: string;
    public PaymentInfoTypeID: number;
    public JournalEntryID: number;
    public AccountID: number;
    public Signature: string;
    public VatDate: LocalDate;
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
    public StatusCode: number;
    public VisibleModules: string;
    public ColumnSetUp: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Name: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class JournalEntrySourceSerie extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'JournalEntrySourceSerie';

    public ID: number;
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public JournalEntrySourceID: number;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public JournalEntrySourceEntityName: string;
    public _createguid: string;
    public JournalEntrySourceInstanceID: number;
    public CustomFields: any;
}


export class JournalEntryType extends UniEntity {
    public static RelativeUrl = 'journalentrytypes';
    public static EntityType = 'JournalEntryType';

    public ID: number;
    public UpdatedBy: string;
    public Number: number;
    public CreatedBy: string;
    public MainName: string;
    public CreatedAt: Date;
    public Name: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public ExpectNegativeAmount: boolean;
    public DisplayName: string;
    public _createguid: string;
    public CustomFields: any;
}


export class LedgerSuggestion extends UniEntity {
    public ID: number;
    public IndustryName: string;
    public Name: string;
    public BusinessType: string;
    public OrgNumber: string;
    public Source: SuggestionSource;
    public IndustryCode: string;
}


export class Payment extends UniEntity {
    public static RelativeUrl = 'payments';
    public static EntityType = 'Payment';

    public Amount: number;
    public Debtor: string;
    public PaymentBatchID: number;
    public IsCustomerPayment: boolean;
    public SupplierInvoiceID: number;
    public IsExternal: boolean;
    public ID: number;
    public CustomerInvoiceID: number;
    public OcrPaymentStrings: string;
    public BusinessRelationID: number;
    public UpdatedBy: string;
    public SerialNumberOrAcctSvcrRef: string;
    public PaymentCodeID: number;
    public InPaymentID: string;
    public StatusText: string;
    public StatusCode: number;
    public CurrencyExchangeRate: number;
    public AmountCurrency: number;
    public IsPaymentCancellationRequest: boolean;
    public ToBankAccountID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public IsPaymentClaim: boolean;
    public BankChargeAmount: number;
    public DueDate: LocalDate;
    public InvoiceNumber: string;
    public XmlTagEndToEndIdReference: string;
    public Domain: string;
    public Proprietary: string;
    public Deleted: boolean;
    public XmlTagPmtInfIdReference: string;
    public PaymentID: string;
    public UpdatedAt: Date;
    public PaymentNotificationReportFileID: number;
    public FromBankAccountID: number;
    public CurrencyCodeID: number;
    public Description: string;
    public PaymentStatusReportFileID: number;
    public JournalEntryID: number;
    public CustomerInvoiceReminderID: number;
    public ReconcilePayment: boolean;
    public AutoJournal: boolean;
    public PaymentDate: LocalDate;
    public ExternalBankAccountNumber: string;
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

    public IsCustomerPayment: boolean;
    public ReceiptDate: Date;
    public ID: number;
    public TransferredDate: Date;
    public UpdatedBy: string;
    public PaymentBatchTypeID: number;
    public StatusCode: number;
    public CreatedBy: string;
    public OcrTransmissionNumber: number;
    public CreatedAt: Date;
    public NumberOfPayments: number;
    public OcrHeadingStrings: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public TotalAmount: number;
    public PaymentReferenceID: string;
    public PaymentFileID: number;
    public PaymentStatusReportFileID: number;
    public Camt054CMsgId: string;
    public _createguid: string;
    public Payments: Array<Payment>;
    public PaymentBatchType: PaymentBatchType;
    public CustomFields: any;
}


export class PostPost extends UniEntity {
    public static RelativeUrl = 'postposts';
    public static EntityType = 'PostPost';

    public Amount: number;
    public ID: number;
    public UpdatedBy: string;
    public StatusCode: number;
    public CurrencyExchangeRate: number;
    public AmountCurrency: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public JournalEntryLine1ID: number;
    public Deleted: boolean;
    public Date: LocalDate;
    public UpdatedAt: Date;
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

    public SupplierInvoiceID: number;
    public ID: number;
    public TaxInclusiveAmount: number;
    public UpdatedBy: string;
    public OwnCostShare: number;
    public ReInvoicingType: number;
    public StatusCode: number;
    public ProductID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public OwnCostAmount: number;
    public Deleted: boolean;
    public UpdatedAt: Date;
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

    public NetAmount: number;
    public ID: number;
    public Surcharge: number;
    public UpdatedBy: string;
    public ReInvoiceID: number;
    public StatusCode: number;
    public Share: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Vat: number;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public GrossAmount: number;
    public CustomerID: number;
    public _createguid: string;
    public Customer: Customer;
    public CustomFields: any;
}


export class SupplierInvoice extends UniEntity {
    public static RelativeUrl = 'supplierinvoices';
    public static EntityType = 'SupplierInvoice';

    public AmountRegards: string;
    public FreeTxt: string;
    public InvoiceReceiverName: string;
    public ID: number;
    public InvoiceType: number;
    public TaxInclusiveAmount: number;
    public PaymentTermsID: number;
    public SalesPerson: string;
    public InvoicePostalCode: string;
    public Payment: string;
    public DeliveryDate: LocalDate;
    public UpdatedBy: string;
    public DeliveryTermsID: number;
    public ShippingCountry: string;
    public ShippingCountryCode: string;
    public InvoiceCity: string;
    public ReInvoiceID: number;
    public CreditedAmount: number;
    public Requisition: string;
    public InvoiceAddressLine1: string;
    public StatusCode: number;
    public ShippingAddressLine2: string;
    public InvoiceOriginType: SupplierInvoiceOriginType;
    public RestAmount: number;
    public DeliveryTerm: string;
    public PayableRoundingAmount: number;
    public CurrencyExchangeRate: number;
    public ProjectID: number;
    public OurReference: string;
    public CustomerPerson: string;
    public BankAccountID: number;
    public CreatedBy: string;
    public SupplierOrgNumber: string;
    public ShippingAddressLine1: string;
    public CreatedAt: Date;
    public TaxExclusiveAmountCurrency: number;
    public PaymentDueDate: LocalDate;
    public CreditedAmountCurrency: number;
    public InvoiceNumber: string;
    public ShippingAddressLine3: string;
    public PaymentTerm: string;
    public ShippingCity: string;
    public InvoiceReferenceID: number;
    public Deleted: boolean;
    public InternalNote: string;
    public PaymentID: string;
    public InvoiceAddressLine2: string;
    public PaymentStatus: number;
    public UpdatedAt: Date;
    public Comment: string;
    public ShippingPostalCode: string;
    public YourReference: string;
    public CustomerOrgNumber: string;
    public CreditDays: number;
    public CurrencyCodeID: number;
    public Credited: boolean;
    public InvoiceCountryCode: string;
    public RestAmountCurrency: number;
    public VatTotalsAmountCurrency: number;
    public SupplierID: number;
    public TaxInclusiveAmountCurrency: number;
    public InvoiceCountry: string;
    public DeliveryMethod: string;
    public PaymentInformation: string;
    public JournalEntryID: number;
    public VatTotalsAmount: number;
    public InvoiceAddressLine3: string;
    public InvoiceDate: LocalDate;
    public IsSentToPayment: boolean;
    public DeliveryName: string;
    public PayableRoundingCurrencyAmount: number;
    public TaxExclusiveAmount: number;
    public PrintStatus: number;
    public DefaultDimensionsID: number;
    public ReInvoiced: boolean;
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

    public SupplierInvoiceID: number;
    public Discount: number;
    public ID: number;
    public AccountingCost: string;
    public SumTotalIncVat: number;
    public UpdatedBy: string;
    public SortIndex: number;
    public SumTotalExVatCurrency: number;
    public StatusCode: number;
    public VatPercent: number;
    public ItemText: string;
    public CurrencyExchangeRate: number;
    public PriceIncVat: number;
    public SumTotalIncVatCurrency: number;
    public ProductID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public SumTotalExVat: number;
    public VatTypeID: number;
    public SumVatCurrency: number;
    public InvoicePeriodStartDate: LocalDate;
    public SumVat: number;
    public Deleted: boolean;
    public PriceExVatCurrency: number;
    public PriceExVat: number;
    public UpdatedAt: Date;
    public Comment: string;
    public Unit: string;
    public NumberOfItems: number;
    public DiscountCurrency: number;
    public CurrencyCodeID: number;
    public DiscountPercent: number;
    public DimensionsID: number;
    public PriceSetByUser: boolean;
    public InvoicePeriodEndDate: LocalDate;
    public CalculateGrossPriceBasedOnNetPrice: boolean;
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
    public No: string;
    public StatusCode: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Name: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class VatDeduction extends UniEntity {
    public static RelativeUrl = 'vatdeductions';
    public static EntityType = 'VatDeduction';

    public ID: number;
    public UpdatedBy: string;
    public StatusCode: number;
    public ValidFrom: LocalDate;
    public CreatedBy: string;
    public DeductionPercent: number;
    public CreatedAt: Date;
    public VatDeductionGroupID: number;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public ValidTo: LocalDate;
    public _createguid: string;
    public VatDeductionGroup: VatDeductionGroup;
    public CustomFields: any;
}


export class VatDeductionGroup extends UniEntity {
    public static RelativeUrl = 'vatdeductiongroups';
    public static EntityType = 'VatDeductionGroup';

    public ID: number;
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Name: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class VatPost extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'VatPost';

    public ID: number;
    public UpdatedBy: string;
    public No: string;
    public StatusCode: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public HasTaxBasis: boolean;
    public Name: string;
    public ReportAsNegativeAmount: boolean;
    public VatCodeGroupID: number;
    public Deleted: boolean;
    public HasTaxAmount: boolean;
    public UpdatedAt: Date;
    public _createguid: string;
    public VatCodeGroup: VatCodeGroup;
    public VatReportReferences: Array<VatReportReference>;
    public CustomFields: any;
}


export class VatReport extends UniEntity {
    public static RelativeUrl = 'vatreports';
    public static EntityType = 'VatReport';

    public ID: number;
    public UpdatedBy: string;
    public Title: string;
    public StatusCode: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public VatReportArchivedSummaryID: number;
    public InternalComment: string;
    public Deleted: boolean;
    public VatReportTypeID: number;
    public UpdatedAt: Date;
    public Comment: string;
    public ExternalRefNo: string;
    public ReportedDate: Date;
    public TerminPeriodID: number;
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

    public PaymentBankAccountNumber: string;
    public ID: number;
    public AmountToBePayed: number;
    public UpdatedBy: string;
    public ReportName: string;
    public StatusCode: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public PaymentDueDate: Date;
    public AmountToBeReceived: number;
    public Deleted: boolean;
    public PaymentID: string;
    public UpdatedAt: Date;
    public SummaryHeader: string;
    public PaymentPeriod: string;
    public PaymentYear: number;
    public PaymentToDescription: string;
    public _createguid: string;
    public CustomFields: any;
}


export class VatReportReference extends UniEntity {
    public static RelativeUrl = 'vatreportreferences';
    public static EntityType = 'VatReportReference';

    public ID: number;
    public UpdatedBy: string;
    public VatPostID: number;
    public StatusCode: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public VatTypeID: number;
    public Deleted: boolean;
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

    public ID: number;
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Name: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class VatType extends UniEntity {
    public static RelativeUrl = 'vattypes';
    public static EntityType = 'VatType';

    public AvailableInModules: boolean;
    public OutputVat: boolean;
    public ID: number;
    public UpdatedBy: string;
    public OutgoingAccountID: number;
    public StatusCode: number;
    public Locked: boolean;
    public IncomingAccountID: number;
    public Visible: boolean;
    public CreatedBy: string;
    public VatTypeSetupID: number;
    public InUse: boolean;
    public CreatedAt: Date;
    public Alias: string;
    public Name: string;
    public VatCodeGroupID: number;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public VatCode: string;
    public DirectJournalEntryOnly: boolean;
    public VatCodeGroupingValue: VatCodeGroupingValueEnum;
    public ReversedTaxDutyVat: boolean;
    public VatPercent: number;
    public _createguid: string;
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

    public ID: number;
    public UpdatedBy: string;
    public StatusCode: number;
    public VatPercent: number;
    public ValidFrom: LocalDate;
    public CreatedBy: string;
    public CreatedAt: Date;
    public VatTypeID: number;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public ValidTo: LocalDate;
    public _createguid: string;
    public CustomFields: any;
}


export class EntityValidationRule extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'EntityValidationRule';

    public ChangedByCompany: boolean;
    public SyncKey: string;
    public Operation: OperationType;
    public ID: number;
    public UpdatedBy: string;
    public EntityType: string;
    public Level: ValidationLevel;
    public Value: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public PropertyName: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public OnConflict: OnConflict;
    public Operator: Operator;
    public System: boolean;
    public Message: string;
    public _createguid: string;
    public CustomFields: any;
}


export class EntityValidationRuleTemplate extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'EntityValidationRuleTemplate';

    public ChangedByCompany: boolean;
    public SyncKey: string;
    public Operation: OperationType;
    public ID: number;
    public UpdatedBy: string;
    public EntityType: string;
    public Level: ValidationLevel;
    public Value: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public PropertyName: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public OnConflict: OnConflict;
    public Operator: Operator;
    public System: boolean;
    public Message: string;
    public _createguid: string;
    public CustomFields: any;
}


export class ComplexValidationRule extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ComplexValidationRule';

    public ChangedByCompany: boolean;
    public SyncKey: string;
    public Operation: OperationType;
    public ID: number;
    public UpdatedBy: string;
    public EntityType: string;
    public Level: ValidationLevel;
    public CreatedBy: string;
    public ValidationCode: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public OnConflict: OnConflict;
    public System: boolean;
    public Message: string;
    public _createguid: string;
    public CustomFields: any;
}


export class ComplexValidationRuleTemplate extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ComplexValidationRuleTemplate';

    public ChangedByCompany: boolean;
    public SyncKey: string;
    public Operation: OperationType;
    public ID: number;
    public UpdatedBy: string;
    public EntityType: string;
    public Level: ValidationLevel;
    public CreatedBy: string;
    public ValidationCode: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public OnConflict: OnConflict;
    public System: boolean;
    public Message: string;
    public _createguid: string;
    public CustomFields: any;
}


export class CustomField extends UniEntity {
    public static RelativeUrl = 'custom-fields';
    public static EntityType = 'CustomField';

    public ID: number;
    public UpdatedBy: string;
    public StatusCode: number;
    public ModelID: number;
    public CreatedBy: string;
    public Nullable: boolean;
    public CreatedAt: Date;
    public Name: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public DataType: string;
    public _createguid: string;
    public CustomFields: any;
}


export class ValueList extends UniEntity {
    public static RelativeUrl = 'valuelists';
    public static EntityType = 'ValueList';

    public ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Name: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public Description: string;
    public Code: string;
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
    public CreatedAt: Date;
    public Name: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public ValueListID: number;
    public Description: string;
    public Index: number;
    public Code: string;
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

    public ID: number;
    public ValueList: string;
    public UpdatedBy: string;
    public EntityType: string;
    public FieldSet: number;
    public LookupField: boolean;
    public LookupEntityType: string;
    public Sectionheader: string;
    public Width: string;
    public Label: string;
    public Options: string;
    public Combo: number;
    public StatusCode: number;
    public Url: string;
    public CreatedBy: string;
    public HelpText: string;
    public CreatedAt: Date;
    public Placeholder: string;
    public Section: number;
    public ComponentLayoutID: number;
    public ReadOnly: boolean;
    public Deleted: boolean;
    public FieldType: FieldType;
    public UpdatedAt: Date;
    public DisplayField: string;
    public Alignment: Alignment;
    public LineBreak: boolean;
    public Description: string;
    public Placement: number;
    public Property: string;
    public Hidden: boolean;
    public Legend: string;
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
    public Flextime: number;
    public WeekDay: number;
    public Invoicable: number;
    public StartTime: Date;
    public WeekNumber: number;
    public Workflow: TimesheetWorkflow;
    public Projecttime: number;
    public EndTime: Date;
    public Overtime: number;
    public SickTime: number;
    public ValidTime: number;
    public Status: WorkStatus;
    public ExpectedTime: number;
    public Date: Date;
    public ValidTimeOff: number;
    public TotalTime: number;
    public TimeOff: number;
    public IsWeekend: boolean;
}


export class WorkBalanceDto extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'WorkBalanceDto';

    public ID: number;
    public UpdatedBy: string;
    public BalanceDate: Date;
    public Balancetype: WorkBalanceTypeEnum;
    public StatusCode: number;
    public SumOvertime: number;
    public ValidFrom: Date;
    public CreatedBy: string;
    public CreatedAt: Date;
    public LastDayActual: number;
    public Deleted: boolean;
    public BalanceFrom: Date;
    public UpdatedAt: Date;
    public ValidTimeOff: number;
    public LastDayExpected: number;
    public Minutes: number;
    public ExpectedMinutes: number;
    public IsStartBalance: boolean;
    public Description: string;
    public ActualMinutes: number;
    public Days: number;
    public WorkRelationID: number;
    public _createguid: string;
    public Previous: BalanceInfo;
    public Details: Array<FlexDetail>;
    public WorkRelation: WorkRelation;
    public CustomFields: any;
}


export class BalanceInfo extends UniEntity {
    public ID: number;
    public BalanceDate: Date;
    public Minutes: number;
    public Description: string;
}


export class FlexDetail extends UniEntity {
    public Date: Date;
    public ValidTimeOff: number;
    public ExpectedMinutes: number;
    public WorkedMinutes: number;
    public IsWeekend: boolean;
}


export class ContactSearchServiceResponse extends UniEntity {
    public Method: string;
    public ObjectName: string;
    public ErrorCode: number;
    public ErrorMessage: string;
    public Success: boolean;
}


export class InvoicesAndRemindersReadyToRemind extends UniEntity {
    public TaxInclusiveAmount: number;
    public CustomerInvoiceID: number;
    public CustomerName: string;
    public StatusCode: number;
    public RestAmount: number;
    public CurrencyExchangeRate: number;
    public CurrencyCodeCode: string;
    public DontSendReminders: boolean;
    public Interest: number;
    public DueDate: Date;
    public InvoiceNumber: number;
    public CurrencyCodeShortCode: string;
    public Fee: number;
    public CurrencyCodeID: number;
    public ExternalReference: string;
    public RestAmountCurrency: number;
    public CustomerNumber: number;
    public ReminderNumber: number;
    public TaxInclusiveAmountCurrency: number;
    public CustomerID: number;
    public CustomerInvoiceReminderID: number;
    public InvoiceDate: Date;
    public EmailAddress: string;
}


export class TradeHeaderCalculationSummary extends UniEntity {
    public SumNoVatBasisCurrency: number;
    public SumTotalIncVat: number;
    public SumTotalExVatCurrency: number;
    public SumDiscountCurrency: number;
    public SumTotalIncVatCurrency: number;
    public SumTotalExVat: number;
    public SumVatCurrency: number;
    public SumVat: number;
    public SumNoVatBasis: number;
    public SumVatBasis: number;
    public SumDiscount: number;
    public SumVatBasisCurrency: number;
    public DecimalRoundingCurrency: number;
    public DecimalRounding: number;
}


export class VatCalculationSummary extends UniEntity {
    public VatPercent: number;
    public SumVatCurrency: number;
    public SumVat: number;
    public SumVatBasis: number;
    public SumVatBasisCurrency: number;
}


export class InvoicePaymentData extends UniEntity {
    public Amount: number;
    public AgioAccountID: number;
    public AgioAmount: number;
    public CurrencyExchangeRate: number;
    public AmountCurrency: number;
    public BankChargeAmount: number;
    public PaymentID: string;
    public BankChargeAccountID: number;
    public FromBankAccountID: number;
    public CurrencyCodeID: number;
    public DimensionsID: number;
    public AccountID: number;
    public PaymentDate: LocalDate;
}


export class InvoiceSummary extends UniEntity {
    public SumCreditedAmount: number;
    public SumTotalAmount: number;
    public SumRestAmount: number;
}


export class CustomerNoAndName extends UniEntity {
    public Number: string;
    public Name: string;
}


export class InvoicePayment extends UniEntity {
    public Amount: number;
    public AmountCurrency: number;
    public JournalEntryLineID: number;
    public FinancialDate: LocalDate;
    public JournalEntryNumber: string;
    public Description: string;
    public JournalEntryID: number;
}


export class OrderOffer extends UniEntity {
    public Status: string;
    public OrderId: string;
    public Message: string;
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
    public ReasonCode: string;
    public ReasonDescription: string;
    public ReasonHelpLink: string;
}


export class AmountDetail extends UniEntity {
    public Amount: number;
    public Currency: string;
}


export class Limits extends UniEntity {
    public Limit: number;
    public RemainingLimit: number;
    public MaxInvoiceAmount: number;
}


export class AmeldingAgaAndTaxSums extends UniEntity {
    public KIDFinancialTax: string;
    public EmploymentTax: number;
    public GarnishmentTax: number;
    public TaxDraw: number;
    public KIDGarnishment: string;
    public AccountNumber: string;
    public DueDate: Date;
    public period: number;
    public MessageID: string;
    public KIDEmploymentTax: string;
    public KIDTaxDraw: string;
    public FinancialTax: number;
}


export class PayrollRunInAmeldingPeriod extends UniEntity {
    public CanGenerateAddition: boolean;
    public PayrollrunID: number;
    public AmeldingSentdate: Date;
    public PayrollrunDescription: string;
    public PayrollrunPaydate: Date;
}


export class PayAgaTaxDTO extends UniEntity {
    public payDate: Date;
    public payGarnishment: boolean;
    public correctPennyDiff: boolean;
    public payAga: boolean;
    public payTaxDraw: boolean;
    public payFinancialTax: boolean;
}


export class AmeldingSumUp extends UniEntity {
    public ID: number;
    public Replaces: string;
    public LegalEntityNo: string;
    public ReplacesAMeldingID: number;
    public sent: Date;
    public type: AmeldingType;
    public year: number;
    public status: AmeldingStatus;
    public altInnStatus: string;
    public period: number;
    public generated: Date;
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
    public employeeNumber: number;
    public name: string;
    public arbeidsforhold: Array<Employments>;
}


export class Employments extends UniEntity {
    public type: string;
    public arbeidsforholdId: string;
    public startDate: Date;
    public endDate: Date;
    public permisjon: Array<EmploymentLeaves>;
}


export class EmploymentLeaves extends UniEntity {
    public beskrivelse: string;
    public permisjonsprosent: string;
    public sluttdato: Date;
    public permisjonsId: string;
    public startdato: Date;
}


export class TransactionTypes extends UniEntity {
    public amount: number;
    public incomeType: string;
    public Base_EmploymentTax: boolean;
    public description: string;
    public benefit: string;
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
    public sumTax: number;
    public sumAGA: number;
}


export class AnnualStatement extends UniEntity {
    public EmployerOrgNr: string;
    public EmployeeAddress: string;
    public EmployerEmail: string;
    public EmployerAddress: string;
    public EmployeeNumber: number;
    public EmployerCountry: string;
    public EmployerPhoneNumber: string;
    public EmployeeName: string;
    public EmployerTaxMandatory: boolean;
    public EmployerPostCode: string;
    public Year: number;
    public EmployeeCity: string;
    public EmployerCity: string;
    public EmployeeMunicipalNumber: string;
    public EmployerName: string;
    public VacationPayBase: number;
    public EmployerCountryCode: string;
    public EmployerWebAddress: string;
    public EmployeeSSn: string;
    public EmployeeMunicipalName: string;
    public EmployeePostCode: string;
    public Contributions: Array<AnnualStatementLine>;
    public PensionOrBenefits: Array<AnnualStatementLine>;
    public Deductions: Array<AnnualStatementLine>;
    public Draws: Array<AnnualStatementLine>;
}


export class AnnualStatementLine extends UniEntity {
    public Amount: number;
    public TaxReturnPost: string;
    public LineIndex: number;
    public Sum: number;
    public IsDeduction: boolean;
    public SupplementPackageName: string;
    public Description: string;
    public Supplements: Array<SupplementInfo>;
}


export class SupplementInfo extends UniEntity {
    public ValueString: string;
    public ValueBool: boolean;
    public ValueDate: Date;
    public ValueDate2: Date;
    public ValueMoney: number;
    public ValueType: Valuetype;
    public Name: string;
    public WageTypeSupplementID: number;
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
    public IsJob: boolean;
    public mainStatus: string;
    public Text: string;
    public employeestatus: Array<EmployeeStatus>;
}


export class EmployeeStatus extends UniEntity {
    public employeeNumber: number;
    public info: string;
    public employeeID: number;
    public year: number;
    public status: string;
    public ssn: string;
    public changedFields: Array<FieldsChanged>;
}


export class FieldsChanged extends UniEntity {
    public valTo: string;
    public fieldName: string;
    public valFrom: string;
}


export class EmploymentHistoryRecord extends UniEntity {
    public HourRate: number;
    public ChangedAt: Date;
    public WorkPercent: number;
    public RegulativeStepNr: number;
    public MonthRate: number;
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
    public grossPayment: number;
    public tax: number;
}


export class SumOnYear extends UniEntity {
    public netPayment: number;
    public taxBase: number;
    public employeeID: number;
    public sumTax: number;
    public advancePayment: number;
    public pension: number;
    public nonTaxableAmount: number;
    public grossPayment: number;
    public usedNonTaxableAmount: number;
    public baseVacation: number;
    public paidHolidaypay: number;
}


export class VacationPayLastYear extends UniEntity {
    public employeeID: number;
    public baseVacation: number;
    public paidHolidayPay: number;
}


export class SalaryTransactionPay extends UniEntity {
    public CompanyPostalCode: string;
    public SalaryBankAccountID: number;
    public CompanyAddress: string;
    public CompanyCity: string;
    public CompanyBankAccountID: number;
    public TaxBankAccountID: number;
    public CompanyName: string;
    public Withholding: number;
    public PaymentDate: Date;
    public PayList: Array<SalaryTransactionPayLine>;
    public SalaryBalancePayList: Array<SalaryBalancePayLine>;
}


export class SalaryTransactionPayLine extends UniEntity {
    public City: string;
    public NetPayment: number;
    public EmployeeNumber: number;
    public EmployeeName: string;
    public Address: string;
    public PostalCode: string;
    public Account: string;
    public Tax: number;
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
    public ToPeriod: number;
    public CalculatedPayruns: number;
    public BookedPayruns: number;
    public CreatedPayruns: number;
    public Groups: Array<ReconciliationGroup>;
}


export class ReconciliationGroup extends UniEntity {
    public Sum: number;
    public AccountNumber: string;
    public Lines: Array<ReconciliationLine>;
}


export class ReconciliationLine extends UniEntity {
    public IncomeType: string;
    public HasEmploymentTax: boolean;
    public Sum: number;
    public WageTypeName: string;
    public WageTypeNumber: number;
    public Description: string;
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
    public UnionDraw: number;
    public MemberNumber: string;
    public Name: string;
    public Ensurance: number;
    public OUO: number;
}


export class SalaryTransactionSums extends UniEntity {
    public baseAGA: number;
    public netPayment: number;
    public Payrun: number;
    public calculatedAGA: number;
    public tableTax: number;
    public calculatedFinancialTax: number;
    public calculatedVacationPay: number;
    public baseTableTax: number;
    public manualTax: number;
    public paidAdvance: number;
    public paidPension: number;
    public Employee: number;
    public grossPayment: number;
    public baseVacation: number;
    public percentTax: number;
    public basePercentTax: number;
}


export class SalaryTransactionPeriodSums extends UniEntity {
    public AgaZone: string;
    public FromPeriod: number;
    public Year: number;
    public AgaRate: number;
    public ToPeriod: number;
    public MunicipalName: string;
    public OrgNumber: string;
    public Sums: SalaryTransactionSums;
    public Aga: AGACalculation;
}


export class code extends UniEntity {
    public gyldigtil: string;
    public kunfranav: string;
    public utloeserArbeidsgiveravgift: string;
    public inngaarIGrunnlagForTrekk: string;
    public gyldigfom: string;
    public postnr: string;
    public gmlcode: string;
    public skatteOgAvgiftregel: string;
    public fordel: string;
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
    public IsTemplate: boolean;
    public ContractType: number;
    public ContractID: number;
    public CompanyName: string;
    public TemplateCompanyKey: string;
    public ProductNames: string;
    public IsTest: boolean;
    public CopyFiles: boolean;
    public CompanySettings: CompanySettings;
}


export class UserDto extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'UserDto';

    public LastLogin: Date;
    public PhoneNumber: string;
    public ID: number;
    public UpdatedBy: string;
    public Protected: boolean;
    public UserName: string;
    public StatusCode: number;
    public PermissionHandling: string;
    public CreatedBy: string;
    public Email: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public GlobalIdentity: string;
    public UpdatedAt: Date;
    public BankIntegrationUserName: string;
    public HasAgreedToImportDisclaimer: boolean;
    public IsAutobankAdmin: boolean;
    public DisplayName: string;
    public TwoFactorEnabled: boolean;
    public AuthPhoneNumber: string;
    public _createguid: string;
    public EndDate: Date;
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
    public HasAgreedToLicense: boolean;
    public AgreementId: number;
}


export class UserLicenseType extends UniEntity {
    public TypeName: string;
    public TypeID: number;
    public EndDate: Date;
}


export class CompanyLicenseInfomation extends UniEntity {
    public Key: string;
    public ContactEmail: string;
    public ID: number;
    public StatusCode: LicenseEntityStatus;
    public Name: string;
    public ContractID: number;
    public ContactPerson: string;
    public EndDate: Date;
    public Agency: Agency;
}


export class Agency extends UniEntity {
    public CompanyKey: string;
    public Name: string;
}


export class ContractLicenseType extends UniEntity {
    public TypeName: string;
    public TrialExpiration: Date;
    public TypeID: number;
    public StartDate: Date;
}


export class LicenseAgreementInfo extends UniEntity {
    public HasAgreedToLicense: boolean;
    public AgreementId: number;
}


export class CreateBankUserDTO extends UniEntity {
    public AdminUserId: number;
    public IsAdmin: boolean;
    public Phone: string;
    public AdminPassword: string;
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
    public MaxFreeAmount: number;
    public GrantSum: number;
    public UsedFreeAmount: number;
}


export class AuthenticationChallengeBE extends UniEntity {
    public ValidFrom: Date;
    public Status: ChallengeRequestResult;
    public ValidTo: Date;
    public Message: string;
    public ExtensionData: ExtensionDataObject;
}


export class ExtensionDataObject extends UniEntity {
}


export class AltinnAuthRequest extends UniEntity {
    public PreferredLogin: string;
    public UserID: string;
    public UserPassword: string;
}


export class A06Options extends UniEntity {
    public IncludeInfoPerPerson: boolean;
    public IncludeIncome: boolean;
    public FromPeriod: Maaned;
    public Year: number;
    public ToPeriod: Maaned;
    public IncludeEmployments: boolean;
    public ReportType: ReportType;
}


export class A07Response extends UniEntity {
    public Title: string;
    public mainStatus: string;
    public Text: string;
    public Data: string;
    public DataName: string;
    public DataType: string;
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
    public RateDateOld: LocalDate;
    public RateDate: LocalDate;
    public ExchangeRateOld: number;
    public FromCurrencyCode: CurrencyCode;
}


export class EmailDTO extends UniEntity {
    public Format: string;
    public FromAddress: string;
    public CopyAddress: string;
    public Subject: string;
    public ReportID: number;
    public Message: string;
    public Parameters: Array<ReportParameter>;
}


export class ReportParameter extends UniEntity {
    public Value: string;
    public Name: string;
}


export class DistributionPlanElementValidation extends UniEntity {
    public ElementTypeName: string;
    public IsValid: boolean;
    public ElementType: DistributionPlanElementTypes;
    public Priority: number;
    public PlanElement: DistributionPlanElement;
}


export class SendEmail extends UniEntity {
    public FromAddress: string;
    public ReportName: string;
    public EntityType: string;
    public EntityID: number;
    public CopyAddress: string;
    public ExternalReference: string;
    public Subject: string;
    public ReportID: number;
    public Message: string;
    public Localization: string;
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
    public Url: string;
    public Description: string;
    public Items: Array<RssItem>;
}


export class RssItem extends UniEntity {
    public Category: string;
    public Title: string;
    public PubDate: string;
    public Guid: string;
    public Description: string;
    public Link: string;
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
    public MinutesWorked: number;
    public TotalBalance: number;
    public Name: string;
    public ExpectedMinutes: number;
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
    public contactemail: string;
    public contactname: string;
    public orgno: string;
    public contactphone: string;
    public orgname: string;
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

    public ID: number;
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public AccountNumber: string;
    public journalEntryLineDraftID: number;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public MissingRequiredDimensionsMessage: string;
    public DimensionsID: number;
    public MissingOnlyWarningsDimensionsMessage: string;
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
    public CurrentValue: number;
    public Number: number;
    public LastDepreciation: LocalDate;
    public GroupName: string;
    public Name: string;
    public BalanceAccountName: string;
    public BalanceAccountNumber: number;
    public Lifetime: number;
    public GroupCode: string;
    public DepreciationAccountNumber: number;
    public Lines: Array<AssetReportLineDTO>;
}


export class AssetReportLineDTO extends UniEntity {
    public Value: number;
    public Type: string;
    public Date: LocalDate;
    public TypeID: number;
}


export class BankBalanceDto extends UniEntity {
    public IsTestData: boolean;
    public BalanceAvailable: number;
    public AccountNumber: string;
    public Date: Date;
    public Comment: string;
    public BalanceBooked: number;
}


export class BankData extends UniEntity {
    public IBAN: string;
    public AccountNumber: string;
    public Bank: Bank;
}


export class CreateBankIntegrationDTO extends UniEntity {
    public IsBankStatement: boolean;
    public BankAcceptance: boolean;
    public IsBankBalance: boolean;
    public ServiceProvider: number;
    public UserName: string;
    public IsInbound: boolean;
    public BankApproval: boolean;
    public BankAccountID: number;
    public Email: string;
    public IsOutgoing: boolean;
    public RequireTwoStage: boolean;
    public Phone: string;
    public Bank: string;
    public TuserName: string;
    public Password: string;
    public DisplayName: string;
    public BankAccounts: Array<BankAccountDTO>;
}


export class BankAccountDTO extends UniEntity {
    public IBAN: string;
    public IsBankStatement: boolean;
    public IsBankBalance: boolean;
    public Bic: string;
    public IsInbound: boolean;
    public IsOutgoing: boolean;
    public BBAN: string;
}


export class ZdataUpdateBankProperties extends UniEntity {
    public IsBankStatement: boolean;
    public ServiceID: string;
    public IsBankBalance: boolean;
    public IsInbound: boolean;
    public IsOutgoing: boolean;
    public Password: string;
}


export class AutobankUserDTO extends UniEntity {
    public UserID: number;
    public IsAdmin: boolean;
    public Phone: string;
    public Password: string;
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
    public ID: number;
    public IsBankEntry: boolean;
    public Date: Date;
    public Closed: boolean;
}


export class MatchSettings extends UniEntity {
    public MaxDelta: number;
    public MaxDayOffset: number;
}


export class ReconciliationStatus extends UniEntity {
    public NumberOfUnReconciled: number;
    public Todate: Date;
    public FromDate: Date;
    public TotalAmount: number;
    public NumberOfItems: number;
    public AccountID: number;
    public IsReconciled: boolean;
    public TotalUnreconciled: number;
}


export class BalanceDto extends UniEntity {
    public Balance: number;
    public BalanceInStatement: number;
    public StartDate: Date;
    public EndDate: Date;
}


export class BankfileFormat extends UniEntity {
    public CustomFormat: BankFileCustomFormat;
    public LinePrefix: string;
    public Separator: string;
    public SkipRows: number;
    public Name: string;
    public IsFixed: boolean;
    public IsXml: boolean;
    public FileExtension: string;
    public Columns: Array<BankfileColumn>;
}


export class BankfileColumn extends UniEntity {
    public FieldMapping: BankfileField;
    public Length: number;
    public IsFallBack: boolean;
    public StartPos: number;
    public DataType: BankfileDataType;
}


export class JournalSuggestion extends UniEntity {
    public Amount: number;
    public BankStatementRuleID: number;
    public MatchWithEntryID: number;
    public FinancialDate: LocalDate;
    public Description: string;
    public AccountID: number;
    public Account: Account;
}


export class ReportRow extends UniEntity {
    public Period10: number;
    public IsSubTotal: boolean;
    public Period6: number;
    public ID: number;
    public BudPeriod5: number;
    public SumPeriodLastYear: number;
    public AccountYear: number;
    public SumPeriodAccumulated: number;
    public GroupNumber: number;
    public BudPeriod7: number;
    public BudPeriod3: number;
    public Period4: number;
    public BudgetSum: number;
    public BudPeriod2: number;
    public SubGroupNumber: number;
    public SubGroupName: string;
    public Sum: number;
    public Period7: number;
    public Period11: number;
    public AccountNumber: number;
    public BudPeriod11: number;
    public Period9: number;
    public GroupName: string;
    public BudPeriod10: number;
    public BudPeriod8: number;
    public BudPeriod4: number;
    public Period2: number;
    public Period1: number;
    public SumPeriodLastYearAccumulated: number;
    public Period12: number;
    public BudPeriod6: number;
    public BudPeriod12: number;
    public SumLastYear: number;
    public BudPeriod9: number;
    public Period3: number;
    public PrecedingBalance: number;
    public Period5: number;
    public AccountName: string;
    public SumPeriod: number;
    public BudPeriod1: number;
    public Period8: number;
    public BudgetAccumulated: number;
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
    public Custumer: number;
    public CustomPayments: number;
    public Sum: number;
    public Supplier: number;
    public VAT: number;
    public Liquidity: number;
}


export class JournalEntryData extends UniEntity {
    public Amount: number;
    public SupplierInvoiceID: number;
    public CustomerInvoiceID: number;
    public JournalEntryNo: string;
    public JournalEntryDataAccrualID: number;
    public NumberSeriesTaskID: number;
    public StatusCode: number;
    public VatDeductionPercent: number;
    public CurrencyExchangeRate: number;
    public AmountCurrency: number;
    public DebitAccountID: number;
    public CustomerOrderID: number;
    public DueDate: LocalDate;
    public InvoiceNumber: string;
    public DebitAccountNumber: number;
    public SupplierInvoiceNo: string;
    public CreditAccountNumber: number;
    public PaymentID: string;
    public CurrencyID: number;
    public CreditVatTypeID: number;
    public FinancialDate: LocalDate;
    public CreditAccountID: number;
    public NumberSeriesID: number;
    public PostPostJournalEntryLineID: number;
    public DebitVatTypeID: number;
    public Description: string;
    public JournalEntryID: number;
    public VatDate: LocalDate;
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
    public PeriodSumYear2: number;
    public PeriodSumYear1: number;
    public PeriodNo: number;
}


export class JournalEntryLineRequestSummary extends UniEntity {
    public SumTaxBasisAmount: number;
    public SumDebit: number;
    public SumBalance: number;
    public SumCredit: number;
    public SumLedger: number;
}


export class JournalEntryLinePostPostData extends UniEntity {
    public Amount: number;
    public ID: number;
    public MarkedAgainstJournalEntryLineID: number;
    public AccountYear: number;
    public StatusCode: number;
    public RestAmount: number;
    public CurrencyExchangeRate: number;
    public CurrencyCodeCode: string;
    public AmountCurrency: number;
    public MarkedAgainstJournalEntryNumber: string;
    public NumberOfPayments: number;
    public SumPostPostAmountCurrency: number;
    public DueDate: Date;
    public InvoiceNumber: string;
    public JournalEntryNumberNumeric: number;
    public PaymentID: string;
    public CurrencyCodeShortCode: string;
    public SumPostPostAmount: number;
    public FinancialDate: Date;
    public CurrencyCodeID: number;
    public RestAmountCurrency: number;
    public JournalEntryNumber: string;
    public Description: string;
    public SubAccountName: string;
    public JournalEntryTypeName: string;
    public JournalEntryID: number;
    public SubAccountNumber: number;
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
    public Amount: number;
    public ID: number;
    public StatusCode: StatusCodeJournalEntryLine;
    public RestAmount: number;
    public OriginalRestAmount: number;
    public AmountCurrency: number;
    public InvoiceNumber: string;
    public FinancialDate: Date;
    public RestAmountCurrency: number;
    public JournalEntryNumber: string;
    public OriginalStatusCode: StatusCodeJournalEntryLine;
    public Markings: Array<MarkingReference>;
}


export class MarkingReference extends UniEntity {
    public ID: number;
    public JournalEntryNumber: string;
}


export class SupplierInvoiceDetail extends UniEntity {
    public Amount: number;
    public SupplierInvoiceID: number;
    public DeliveryDate: Date;
    public VatPercent: number;
    public AmountCurrency: number;
    public AccountNumber: number;
    public InvoiceNumber: string;
    public VatTypeID: number;
    public VatCode: string;
    public VatTypeName: string;
    public SupplierID: number;
    public Description: string;
    public AccountName: string;
    public InvoiceDate: Date;
    public AccountID: number;
}


export class VatReportMessage extends UniEntity {
    public Level: ValidationLevel;
    public Message: string;
}


export class VatReportSummary extends UniEntity {
    public SumTaxBasisAmount: number;
    public SumVatAmount: number;
    public HasTaxBasis: boolean;
    public NumberOfJournalEntryLines: number;
    public VatCodeGroupNo: string;
    public VatCodeGroupID: number;
    public HasTaxAmount: boolean;
    public VatCodeGroupName: string;
    public IsHistoricData: boolean;
}


export class VatReportSummaryPerPost extends UniEntity {
    public SumTaxBasisAmount: number;
    public VatPostID: number;
    public SumVatAmount: number;
    public HasTaxBasis: boolean;
    public NumberOfJournalEntryLines: number;
    public VatCodeGroupNo: string;
    public VatCodeGroupID: number;
    public HasTaxAmount: boolean;
    public VatCodeGroupName: string;
    public VatPostReportAsNegativeAmount: boolean;
    public VatPostNo: string;
    public IsHistoricData: boolean;
    public VatPostName: string;
}


export class VatReportSummaryPerPostPerAccount extends UniEntity {
    public Amount: number;
    public SumTaxBasisAmount: number;
    public VatAccountID: number;
    public VatPostID: number;
    public StdVatCode: string;
    public TaxBasisAmount: number;
    public VatJournalEntryPostAccountNumber: number;
    public VatJournalEntryPostAccountName: string;
    public SumVatAmount: number;
    public HasTaxBasis: boolean;
    public NumberOfJournalEntryLines: number;
    public VatCodeGroupNo: string;
    public VatAccountName: string;
    public VatCodeGroupID: number;
    public VatJournalEntryPostAccountID: number;
    public HasTaxAmount: boolean;
    public VatCodeGroupName: string;
    public VatCode: string;
    public VatPostReportAsNegativeAmount: boolean;
    public FinancialDate: Date;
    public VatPostNo: string;
    public IsHistoricData: boolean;
    public JournalEntryNumber: string;
    public VatPostName: string;
    public VatAccountNumber: number;
    public Description: string;
    public VatDate: Date;
}


export class VatReportNotReportedJournalEntryData extends UniEntity {
    public SumTaxBasisAmount: number;
    public SumVatAmount: number;
    public NumberOfJournalEntryLines: number;
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


export enum GenderEnum{
    NotDefined = 0,
    Woman = 1,
    Man = 2,
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
