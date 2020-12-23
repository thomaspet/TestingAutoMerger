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
    public ClientID: string;
    public ID: number;
    public NewValue: string;
    public UpdatedBy: string;
    public Transaction: string;
    public Verb: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Action: string;
    public Deleted: boolean;
    public EntityType: string;
    public Field: string;
    public Route: string;
    public EntityID: number;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class WorkBalance extends UniEntity {
    public static RelativeUrl = 'workbalances';
    public static EntityType = 'WorkBalance';

    public Description: string;
    public ID: number;
    public UpdatedBy: string;
    public WorkRelationID: number;
    public UpdatedAt: Date;
    public ActualMinutes: number;
    public ExpectedMinutes: number;
    public BalanceFrom: Date;
    public ValidTimeOff: number;
    public CreatedAt: Date;
    public Balancetype: WorkBalanceTypeEnum;
    public Deleted: boolean;
    public Days: number;
    public ValidFrom: Date;
    public BalanceDate: Date;
    public StatusCode: number;
    public CreatedBy: string;
    public Minutes: number;
    public IsStartBalance: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class Worker extends UniEntity {
    public static RelativeUrl = 'workers';
    public static EntityType = 'Worker';

    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public EmployeeID: number;
    public UserID: number;
    public CreatedAt: Date;
    public BusinessRelationID: number;
    public Deleted: boolean;
    public StatusCode: number;
    public CreatedBy: string;
    public _createguid: string;
    public Info: BusinessRelation;
    public Relations: Array<WorkRelation>;
    public Employee: Employee;
    public CustomFields: any;
}


export class WorkItem extends UniEntity {
    public static RelativeUrl = 'workitems';
    public static EntityType = 'WorkItem';

    public TransferedToOrder: boolean;
    public Date: Date;
    public Description: string;
    public ID: number;
    public DimensionsID: number;
    public CustomerID: number;
    public WorkTypeID: number;
    public UpdatedBy: string;
    public StartTime: Date;
    public PayrollTrackingID: number;
    public WorkRelationID: number;
    public WorkItemGroupID: number;
    public EndTime: Date;
    public UpdatedAt: Date;
    public CustomerOrderID: number;
    public OrderItemId: number;
    public LunchInMinutes: number;
    public MinutesToOrder: number;
    public PriceExVat: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public TransferedToPayroll: boolean;
    public Invoiceable: boolean;
    public Label: string;
    public StatusCode: number;
    public CreatedBy: string;
    public Minutes: number;
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
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public StatusCode: number;
    public CreatedBy: string;
    public _createguid: string;
    public WorkRelation: WorkRelation;
    public Items: Array<WorkItem>;
    public CustomFields: any;
}


export class WorkProfile extends UniEntity {
    public static RelativeUrl = 'workprofiles';
    public static EntityType = 'WorkProfile';

    public MinutesPerMonth: number;
    public IsShared: boolean;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public LunchIncluded: boolean;
    public MinutesPerYear: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public Name: string;
    public MinutesPerWeek: number;
    public StatusCode: number;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class WorkRelation extends UniEntity {
    public static RelativeUrl = 'workrelations';
    public static EntityType = 'WorkRelation';

    public CompanyID: number;
    public IsActive: boolean;
    public WorkerID: number;
    public Description: string;
    public ID: number;
    public WorkPercentage: number;
    public UpdatedBy: string;
    public EndTime: Date;
    public CompanyName: string;
    public TeamID: number;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public StartDate: Date;
    public IsPrivate: boolean;
    public WorkProfileID: number;
    public StatusCode: number;
    public CreatedBy: string;
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
    public ID: number;
    public UpdatedBy: string;
    public WorkRelationID: number;
    public IsHalfDay: boolean;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public FromDate: Date;
    public Deleted: boolean;
    public SystemKey: string;
    public TimeoffType: number;
    public ToDate: Date;
    public StatusCode: number;
    public RegionKey: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class WorkType extends UniEntity {
    public static RelativeUrl = 'worktypes';
    public static EntityType = 'WorkType';

    public Description: string;
    public ID: number;
    public UpdatedBy: string;
    public SystemType: WorkTypeEnum;
    public ProductID: number;
    public UpdatedAt: Date;
    public Price: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public WagetypeNumber: number;
    public Name: string;
    public StatusCode: number;
    public CreatedBy: string;
    public _createguid: string;
    public Product: Product;
    public CustomFields: any;
}


export class BankFile extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'BankFile';

    public Accountnumber: string;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public SubCompanyID: number;
    public ParentFileid: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public StatusCode: number;
    public CreatedBy: string;
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
    public Comment: string;
    public Processed: number;
    public NotifyEmail: boolean;
    public OurRef: string;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public CopyFromEntityId: number;
    public MinAmount: number;
    public InvoiceDate: LocalDate;
    public YourRef: string;
    public NumberOfBatches: number;
    public SellerID: number;
    public TotalToProcess: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public DueDate: LocalDate;
    public Operation: BatchInvoiceOperation;
    public StatusCode: number;
    public CreatedBy: string;
    public CustomerID: number;
    public ProjectID: number;
    public _createguid: string;
    public Items: Array<BatchInvoiceItem>;
    public CustomFields: any;
}


export class BatchInvoiceItem extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'BatchInvoiceItem';

    public CustomerInvoiceID: number;
    public ID: number;
    public CustomerID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public CustomerOrderID: number;
    public CommentID: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public BatchNumber: number;
    public StatusCode: StatusCode;
    public BatchInvoiceID: number;
    public CreatedBy: string;
    public ProjectID: number;
    public _createguid: string;
    public CustomerOrder: CustomerOrder;
    public CustomerInvoice: CustomerInvoice;
    public CustomFields: any;
}


export class CampaignTemplate extends UniEntity {
    public static RelativeUrl = 'campaigntemplate';
    public static EntityType = 'CampaignTemplate';

    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public EntityName: string;
    public StatusCode: number;
    public Template: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Customer extends UniEntity {
    public static RelativeUrl = 'customers';
    public static EntityType = 'Customer';

    public SocialSecurityNumber: string;
    public WebUrl: string;
    public ID: number;
    public AcceptableDelta4CustomerPaymentAccountID: number;
    public DimensionsID: number;
    public CurrencyCodeID: number;
    public UpdatedBy: string;
    public FactoringNumber: number;
    public PeppolAddress: string;
    public UpdatedAt: Date;
    public PaymentTermsID: number;
    public DeliveryTermsID: number;
    public GLN: string;
    public EfakturaIdentifier: string;
    public ReminderEmailAddress: string;
    public SubAccountNumberSeriesID: number;
    public EInvoiceAgreementReference: string;
    public AvtaleGiroNotification: boolean;
    public CustomerNumberKidAlias: string;
    public OrgNumber: string;
    public CreatedAt: Date;
    public BusinessRelationID: number;
    public AcceptableDelta4CustomerPayment: number;
    public Deleted: boolean;
    public DontSendReminders: boolean;
    public Localization: string;
    public CreditDays: number;
    public DefaultSellerID: number;
    public IsPrivate: boolean;
    public CustomerNumber: number;
    public DefaultCustomerInvoiceReportID: number;
    public DefaultCustomerQuoteReportID: number;
    public DefaultDistributionsID: number;
    public DefaultCustomerOrderReportID: number;
    public AvtaleGiro: boolean;
    public StatusCode: number;
    public CreatedBy: string;
    public _createguid: string;
    public Info: BusinessRelation;
    public Distributions: Distributions;
    public PaymentTerms: Terms;
    public DeliveryTerms: Terms;
    public Dimensions: Dimensions;
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

    public PrintStatus: number;
    public FreeTxt: string;
    public DeliveryTerm: string;
    public PaymentTerm: string;
    public InvoiceReferenceID: number;
    public Comment: string;
    public DeliveryName: string;
    public ShippingAddressLine1: string;
    public TaxInclusiveAmount: number;
    public ShippingCity: string;
    public InvoiceType: number;
    public CustomerPerson: string;
    public UpdateCurrencyAmountsOnDateChange: boolean;
    public ID: number;
    public CustomerID: number;
    public InvoiceAddressLine3: string;
    public CurrencyCodeID: number;
    public PaymentID: string;
    public UpdatedBy: string;
    public CollectorStatusCode: number;
    public ShippingCountryCode: string;
    public EmailAddress: string;
    public CreditedAmount: number;
    public UpdatedAt: Date;
    public VatTotalsAmountCurrency: number;
    public TaxExclusiveAmountCurrency: number;
    public JournalEntryID: number;
    public InvoiceDate: LocalDate;
    public ShippingCountry: string;
    public ExternalDebtCollectionNotes: string;
    public DistributionPlanID: number;
    public BankAccountID: number;
    public PaymentTermsID: number;
    public ShippingPostalCode: string;
    public DeliveryTermsID: number;
    public CustomerName: string;
    public UseReportID: number;
    public TaxInclusiveAmountCurrency: number;
    public CreditedAmountCurrency: number;
    public ShippingAddressLine2: string;
    public YourReference: string;
    public InvoiceNumber: string;
    public InvoiceCountry: string;
    public Requisition: string;
    public InternalNote: string;
    public InvoiceCity: string;
    public DefaultDimensionsID: number;
    public InvoiceReceiverName: string;
    public InvoicePostalCode: string;
    public CurrencyExchangeRate: number;
    public CreatedAt: Date;
    public PaymentInformation: string;
    public PaymentInfoTypeID: number;
    public VatTotalsAmount: number;
    public DeliveryMethod: string;
    public ExternalReference: string;
    public Deleted: boolean;
    public RestAmountCurrency: number;
    public InvoiceNumberSeriesID: number;
    public InvoiceAddressLine1: string;
    public TaxExclusiveAmount: number;
    public DontSendReminders: boolean;
    public LastPaymentDate: LocalDate;
    public CreditDays: number;
    public RestAmount: number;
    public Payment: string;
    public InvoiceCountryCode: string;
    public DefaultSellerID: number;
    public ExternalDebtCollectionReference: string;
    public ExternalStatus: number;
    public AmountRegards: string;
    public PaymentDueDate: LocalDate;
    public SupplierOrgNumber: string;
    public SalesPerson: string;
    public PayableRoundingAmount: number;
    public CustomerOrgNumber: string;
    public Credited: boolean;
    public AccrualID: number;
    public ShippingAddressLine3: string;
    public StatusCode: number;
    public DeliveryDate: LocalDate;
    public PayableRoundingCurrencyAmount: number;
    public OurReference: string;
    public CreatedBy: string;
    public InvoiceAddressLine2: string;
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
    public Comment: string;
    public CustomerInvoiceID: number;
    public ID: number;
    public DimensionsID: number;
    public CurrencyCodeID: number;
    public AccountID: number;
    public SortIndex: number;
    public UpdatedBy: string;
    public DiscountCurrency: number;
    public CostPrice: number;
    public ProductID: number;
    public SumTotalIncVatCurrency: number;
    public UpdatedAt: Date;
    public SumTotalExVat: number;
    public SumTotalExVatCurrency: number;
    public PriceExVatCurrency: number;
    public SumTotalIncVat: number;
    public Discount: number;
    public CalculateGrossPriceBasedOnNetPrice: boolean;
    public PriceExVat: number;
    public VatPercent: number;
    public CurrencyExchangeRate: number;
    public ItemText: string;
    public CreatedAt: Date;
    public Unit: string;
    public InvoicePeriodEndDate: LocalDate;
    public VatTypeID: number;
    public Deleted: boolean;
    public DiscountPercent: number;
    public InvoicePeriodStartDate: LocalDate;
    public PriceIncVat: number;
    public SumVat: number;
    public AccountingCost: string;
    public SumVatCurrency: number;
    public PriceSetByUser: boolean;
    public StatusCode: number;
    public CreatedBy: string;
    public ItemSourceID: number;
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
    public ReminderNumber: number;
    public CustomerInvoiceID: number;
    public Description: string;
    public Notified: boolean;
    public ID: number;
    public RemindedDate: LocalDate;
    public DimensionsID: number;
    public CurrencyCodeID: number;
    public UpdatedBy: string;
    public EmailAddress: string;
    public UpdatedAt: Date;
    public InterestFee: number;
    public InterestFeeCurrency: number;
    public ReminderFee: number;
    public RunNumber: number;
    public CurrencyExchangeRate: number;
    public CreatedAt: Date;
    public Title: string;
    public Deleted: boolean;
    public RestAmountCurrency: number;
    public RestAmount: number;
    public DueDate: LocalDate;
    public DebtCollectionFeeCurrency: number;
    public StatusCode: number;
    public CreatedByReminderRuleID: number;
    public CreatedBy: string;
    public DebtCollectionFee: number;
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

    public MinimumDaysFromDueDate: number;
    public ReminderNumber: number;
    public Description: string;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public ReminderFee: number;
    public CreatedAt: Date;
    public Title: string;
    public Deleted: boolean;
    public CustomerInvoiceReminderSettingsID: number;
    public CreditDays: number;
    public UseMaximumLegalReminderFee: boolean;
    public StatusCode: number;
    public CreatedBy: string;
    public _createguid: string;
    public CustomerInvoiceReminderSettings: CustomerInvoiceReminderSettings;
    public CustomFields: any;
}


export class CustomerInvoiceReminderSettings extends UniEntity {
    public static RelativeUrl = 'invoiceremindersettings';
    public static EntityType = 'CustomerInvoiceReminderSettings';

    public UseReminderRuleTextsInEmails: boolean;
    public DebtCollectionSettingsID: number;
    public ID: number;
    public RemindersBeforeDebtCollection: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public DefaultReminderFeeAccountID: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public RuleSetType: number;
    public MinimumAmountToRemind: number;
    public AcceptPaymentWithoutReminderFee: boolean;
    public StatusCode: number;
    public CreatedBy: string;
    public _createguid: string;
    public DebtCollectionSettings: DebtCollectionSettings;
    public DefaultReminderFeeAccount: Account;
    public CustomerInvoiceReminderRules: Array<CustomerInvoiceReminderRule>;
    public CustomFields: any;
}


export class CustomerOrder extends UniEntity {
    public static RelativeUrl = 'orders';
    public static EntityType = 'CustomerOrder';

    public PrintStatus: number;
    public FreeTxt: string;
    public DeliveryTerm: string;
    public PaymentTerm: string;
    public Comment: string;
    public OrderNumber: number;
    public DeliveryName: string;
    public ShippingAddressLine1: string;
    public TaxInclusiveAmount: number;
    public ShippingCity: string;
    public ReadyToInvoice: boolean;
    public OrderNumberSeriesID: number;
    public CustomerPerson: string;
    public UpdateCurrencyAmountsOnDateChange: boolean;
    public ID: number;
    public CustomerID: number;
    public InvoiceAddressLine3: string;
    public CurrencyCodeID: number;
    public UpdatedBy: string;
    public ShippingCountryCode: string;
    public EmailAddress: string;
    public UpdatedAt: Date;
    public VatTotalsAmountCurrency: number;
    public TaxExclusiveAmountCurrency: number;
    public ShippingCountry: string;
    public DistributionPlanID: number;
    public PaymentTermsID: number;
    public ShippingPostalCode: string;
    public DeliveryTermsID: number;
    public CustomerName: string;
    public UseReportID: number;
    public TaxInclusiveAmountCurrency: number;
    public ShippingAddressLine2: string;
    public YourReference: string;
    public InvoiceCountry: string;
    public Requisition: string;
    public InternalNote: string;
    public InvoiceCity: string;
    public DefaultDimensionsID: number;
    public InvoiceReceiverName: string;
    public InvoicePostalCode: string;
    public CurrencyExchangeRate: number;
    public CreatedAt: Date;
    public PaymentInfoTypeID: number;
    public VatTotalsAmount: number;
    public DeliveryMethod: string;
    public Deleted: boolean;
    public RestAmountCurrency: number;
    public InvoiceAddressLine1: string;
    public TaxExclusiveAmount: number;
    public CreditDays: number;
    public InvoiceCountryCode: string;
    public DefaultSellerID: number;
    public OrderDate: LocalDate;
    public UpdateCurrencyOnToInvoice: boolean;
    public SupplierOrgNumber: string;
    public SalesPerson: string;
    public RestExclusiveAmountCurrency: number;
    public PayableRoundingAmount: number;
    public CustomerOrgNumber: string;
    public AccrualID: number;
    public ShippingAddressLine3: string;
    public StatusCode: number;
    public DeliveryDate: LocalDate;
    public PayableRoundingCurrencyAmount: number;
    public OurReference: string;
    public CreatedBy: string;
    public InvoiceAddressLine2: string;
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
    public Comment: string;
    public ReadyToInvoice: boolean;
    public ID: number;
    public DimensionsID: number;
    public CurrencyCodeID: number;
    public AccountID: number;
    public SortIndex: number;
    public UpdatedBy: string;
    public DiscountCurrency: number;
    public CostPrice: number;
    public ProductID: number;
    public SumTotalIncVatCurrency: number;
    public UpdatedAt: Date;
    public SumTotalExVat: number;
    public SumTotalExVatCurrency: number;
    public PriceExVatCurrency: number;
    public CustomerOrderID: number;
    public SumTotalIncVat: number;
    public Discount: number;
    public CalculateGrossPriceBasedOnNetPrice: boolean;
    public PriceExVat: number;
    public VatPercent: number;
    public CurrencyExchangeRate: number;
    public ItemText: string;
    public CreatedAt: Date;
    public Unit: string;
    public VatTypeID: number;
    public Deleted: boolean;
    public DiscountPercent: number;
    public PriceIncVat: number;
    public SumVat: number;
    public SumVatCurrency: number;
    public PriceSetByUser: boolean;
    public StatusCode: number;
    public CreatedBy: string;
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

    public PrintStatus: number;
    public FreeTxt: string;
    public DeliveryTerm: string;
    public PaymentTerm: string;
    public Comment: string;
    public DeliveryName: string;
    public ShippingAddressLine1: string;
    public TaxInclusiveAmount: number;
    public ShippingCity: string;
    public CustomerPerson: string;
    public UpdateCurrencyAmountsOnDateChange: boolean;
    public ID: number;
    public CustomerID: number;
    public InvoiceAddressLine3: string;
    public CurrencyCodeID: number;
    public QuoteNumber: number;
    public UpdatedBy: string;
    public ShippingCountryCode: string;
    public EmailAddress: string;
    public InquiryReference: number;
    public UpdatedAt: Date;
    public QuoteDate: LocalDate;
    public VatTotalsAmountCurrency: number;
    public TaxExclusiveAmountCurrency: number;
    public ShippingCountry: string;
    public DistributionPlanID: number;
    public PaymentTermsID: number;
    public ShippingPostalCode: string;
    public DeliveryTermsID: number;
    public CustomerName: string;
    public QuoteNumberSeriesID: number;
    public UseReportID: number;
    public TaxInclusiveAmountCurrency: number;
    public ShippingAddressLine2: string;
    public YourReference: string;
    public InvoiceCountry: string;
    public Requisition: string;
    public InternalNote: string;
    public InvoiceCity: string;
    public DefaultDimensionsID: number;
    public InvoiceReceiverName: string;
    public InvoicePostalCode: string;
    public CurrencyExchangeRate: number;
    public CreatedAt: Date;
    public PaymentInfoTypeID: number;
    public VatTotalsAmount: number;
    public DeliveryMethod: string;
    public Deleted: boolean;
    public UpdateCurrencyOnToOrder: boolean;
    public InvoiceAddressLine1: string;
    public TaxExclusiveAmount: number;
    public CreditDays: number;
    public InvoiceCountryCode: string;
    public DefaultSellerID: number;
    public UpdateCurrencyOnToInvoice: boolean;
    public SupplierOrgNumber: string;
    public SalesPerson: string;
    public PayableRoundingAmount: number;
    public ValidUntilDate: LocalDate;
    public CustomerOrgNumber: string;
    public ShippingAddressLine3: string;
    public StatusCode: number;
    public DeliveryDate: LocalDate;
    public PayableRoundingCurrencyAmount: number;
    public OurReference: string;
    public CreatedBy: string;
    public InvoiceAddressLine2: string;
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
    public Comment: string;
    public ID: number;
    public DimensionsID: number;
    public CurrencyCodeID: number;
    public AccountID: number;
    public SortIndex: number;
    public UpdatedBy: string;
    public DiscountCurrency: number;
    public CostPrice: number;
    public ProductID: number;
    public SumTotalIncVatCurrency: number;
    public UpdatedAt: Date;
    public SumTotalExVat: number;
    public SumTotalExVatCurrency: number;
    public CustomerQuoteID: number;
    public PriceExVatCurrency: number;
    public SumTotalIncVat: number;
    public Discount: number;
    public CalculateGrossPriceBasedOnNetPrice: boolean;
    public PriceExVat: number;
    public VatPercent: number;
    public CurrencyExchangeRate: number;
    public ItemText: string;
    public CreatedAt: Date;
    public Unit: string;
    public VatTypeID: number;
    public Deleted: boolean;
    public DiscountPercent: number;
    public PriceIncVat: number;
    public SumVat: number;
    public SumVatCurrency: number;
    public PriceSetByUser: boolean;
    public StatusCode: number;
    public CreatedBy: string;
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

    public DebtCollectionFormat: number;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public CreditorNumber: number;
    public CreatedAt: Date;
    public IntegrateWithDebtCollection: boolean;
    public Deleted: boolean;
    public CustomerInvoiceReminderSettingsID: number;
    public DebtCollectionAutomationID: number;
    public StatusCode: number;
    public CreatedBy: string;
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
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public StatusCode: number;
    public CreatedBy: string;
    public _createguid: string;
    public Details: Array<ItemSourceDetail>;
    public CustomFields: any;
}


export class ItemSourceDetail extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ItemSourceDetail';

    public Description: string;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public SourceFK: number;
    public Tag: string;
    public Deleted: boolean;
    public Amount: number;
    public SourceType: string;
    public StatusCode: number;
    public CreatedBy: string;
    public ItemSourceID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class PaymentInfoType extends UniEntity {
    public static RelativeUrl = 'paymentinfotype';
    public static EntityType = 'PaymentInfoType';

    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public Length: number;
    public Control: Modulus;
    public CreatedAt: Date;
    public Type: PaymentInfoTypeEnum;
    public Deleted: boolean;
    public Name: string;
    public Locked: boolean;
    public StatusCode: number;
    public CreatedBy: string;
    public _createguid: string;
    public PaymentInfoTypeParts: Array<PaymentInfoTypePart>;
    public CustomFields: any;
}


export class PaymentInfoTypePart extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'PaymentInfoTypePart';

    public ID: number;
    public SortIndex: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public Length: number;
    public CreatedAt: Date;
    public PaymentInfoTypeID: number;
    public Part: string;
    public Deleted: boolean;
    public StatusCode: number;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class RecurringInvoice extends UniEntity {
    public static RelativeUrl = 'recurringinvoices';
    public static EntityType = 'RecurringInvoice';

    public PrintStatus: number;
    public EndDate: LocalDate;
    public NotifyWhenOrdersArePrepared: boolean;
    public FreeTxt: string;
    public DeliveryTerm: string;
    public PaymentTerm: string;
    public Comment: string;
    public DeliveryName: string;
    public ShippingAddressLine1: string;
    public TaxInclusiveAmount: number;
    public ShippingCity: string;
    public NotifyWhenRecurringEnds: boolean;
    public CustomerPerson: string;
    public UpdateCurrencyAmountsOnDateChange: boolean;
    public ID: number;
    public CustomerID: number;
    public InvoiceAddressLine3: string;
    public CurrencyCodeID: number;
    public UpdatedBy: string;
    public ShippingCountryCode: string;
    public EmailAddress: string;
    public UpdatedAt: Date;
    public VatTotalsAmountCurrency: number;
    public TaxExclusiveAmountCurrency: number;
    public ShippingCountry: string;
    public DistributionPlanID: number;
    public PaymentTermsID: number;
    public ShippingPostalCode: string;
    public TimePeriod: RecurringPeriod;
    public DeliveryTermsID: number;
    public CustomerName: string;
    public UseReportID: number;
    public TaxInclusiveAmountCurrency: number;
    public ShippingAddressLine2: string;
    public YourReference: string;
    public InvoiceCountry: string;
    public Requisition: string;
    public InternalNote: string;
    public InvoiceCity: string;
    public DefaultDimensionsID: number;
    public InvoiceReceiverName: string;
    public InvoicePostalCode: string;
    public CurrencyExchangeRate: number;
    public CreatedAt: Date;
    public PaymentInformation: string;
    public Interval: number;
    public PaymentInfoTypeID: number;
    public VatTotalsAmount: number;
    public DeliveryMethod: string;
    public Deleted: boolean;
    public InvoiceNumberSeriesID: number;
    public InvoiceAddressLine1: string;
    public TaxExclusiveAmount: number;
    public ProduceAs: RecurringResult;
    public CreditDays: number;
    public Payment: string;
    public StartDate: LocalDate;
    public InvoiceCountryCode: string;
    public MaxIterations: number;
    public DefaultSellerID: number;
    public NoCreditDays: boolean;
    public AmountRegards: string;
    public SupplierOrgNumber: string;
    public SalesPerson: string;
    public NotifyUser: string;
    public PayableRoundingAmount: number;
    public CustomerOrgNumber: string;
    public ShippingAddressLine3: string;
    public StatusCode: number;
    public DeliveryDate: LocalDate;
    public PayableRoundingCurrencyAmount: number;
    public PreparationDays: number;
    public OurReference: string;
    public CreatedBy: string;
    public InvoiceAddressLine2: string;
    public NextInvoiceDate: LocalDate;
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

    public NumberOfItems: number;
    public Comment: string;
    public ReduceIncompletePeriod: boolean;
    public TimeFactor: RecurringPeriod;
    public ID: number;
    public DimensionsID: number;
    public CurrencyCodeID: number;
    public AccountID: number;
    public SortIndex: number;
    public UpdatedBy: string;
    public DiscountCurrency: number;
    public ProductID: number;
    public SumTotalIncVatCurrency: number;
    public UpdatedAt: Date;
    public SumTotalExVat: number;
    public SumTotalExVatCurrency: number;
    public PriceExVatCurrency: number;
    public SumTotalIncVat: number;
    public Discount: number;
    public CalculateGrossPriceBasedOnNetPrice: boolean;
    public PriceExVat: number;
    public VatPercent: number;
    public CurrencyExchangeRate: number;
    public ItemText: string;
    public CreatedAt: Date;
    public Unit: string;
    public PricingSource: PricingSource;
    public VatTypeID: number;
    public Deleted: boolean;
    public DiscountPercent: number;
    public PriceIncVat: number;
    public SumVat: number;
    public RecurringInvoiceID: number;
    public SumVatCurrency: number;
    public PriceSetByUser: boolean;
    public StatusCode: number;
    public CreatedBy: string;
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

    public CreationDate: LocalDate;
    public Comment: string;
    public ID: number;
    public OrderID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public IterationNumber: number;
    public InvoiceDate: LocalDate;
    public NotifiedOrdersPrepared: boolean;
    public CreatedAt: Date;
    public InvoiceID: number;
    public Deleted: boolean;
    public RecurringInvoiceID: number;
    public NotifiedRecurringEnds: boolean;
    public StatusCode: number;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Seller extends UniEntity {
    public static RelativeUrl = 'sellers';
    public static EntityType = 'Seller';

    public ID: number;
    public UpdatedBy: string;
    public TeamID: number;
    public UpdatedAt: Date;
    public EmployeeID: number;
    public UserID: number;
    public DefaultDimensionsID: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public Name: string;
    public StatusCode: number;
    public CreatedBy: string;
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
    public ID: number;
    public CustomerID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public CustomerQuoteID: number;
    public CustomerOrderID: number;
    public Percent: number;
    public SellerID: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public Amount: number;
    public RecurringInvoiceID: number;
    public StatusCode: number;
    public CreatedBy: string;
    public _createguid: string;
    public Seller: Seller;
    public CustomFields: any;
}


export class SubCompany extends UniEntity {
    public static RelativeUrl = 'subcompanies';
    public static EntityType = 'SubCompany';

    public CompanyID: number;
    public CompanyType: CompanyRelation;
    public ID: number;
    public CustomerID: number;
    public UpdatedBy: string;
    public CompanyName: string;
    public UpdatedAt: Date;
    public CompanyKey: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public StatusCode: number;
    public CreatedBy: string;
    public _createguid: string;
    public Customer: Customer;
    public CustomFields: any;
}


export class Supplier extends UniEntity {
    public static RelativeUrl = 'suppliers';
    public static EntityType = 'Supplier';

    public WebUrl: string;
    public ID: number;
    public DimensionsID: number;
    public CurrencyCodeID: number;
    public UpdatedBy: string;
    public PeppolAddress: string;
    public UpdatedAt: Date;
    public GLN: string;
    public SubAccountNumberSeriesID: number;
    public SelfEmployed: boolean;
    public OrgNumber: string;
    public SupplierNumber: number;
    public CreatedAt: Date;
    public BusinessRelationID: number;
    public Deleted: boolean;
    public Localization: string;
    public CreditDays: number;
    public StatusCode: number;
    public CreatedBy: string;
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

    public Description: string;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public CreditDays: number;
    public Name: string;
    public TermsType: TermsType;
    public StatusCode: number;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class TOFCurrencySettings extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'TOFCurrencySettings';

    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public UpdateCurrencyAmountsOnQuotedateChange: boolean;
    public UpdateCurrencyAmountsOnOrderToInvoice: boolean;
    public UpdateCurrencyAmountsOnQuoteToOrder: boolean;
    public CreatedAt: Date;
    public UpdateCurrencyAmountsOnInvoicedateChange: boolean;
    public Deleted: boolean;
    public UpdateCurrencyAmountsOnQuoteToInvoice: boolean;
    public UpdateCurrencyAmountsOnOrderdateChange: boolean;
    public StatusCode: number;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Address extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Address';

    public AddressLine3: string;
    public PostalCode: string;
    public ID: number;
    public UpdatedBy: string;
    public City: string;
    public UpdatedAt: Date;
    public AddressLine1: string;
    public AddressLine2: string;
    public CreatedAt: Date;
    public BusinessRelationID: number;
    public Deleted: boolean;
    public Country: string;
    public Region: string;
    public CountryCode: string;
    public StatusCode: number;
    public CreatedBy: string;
    public _createguid: string;
    public BusinessRelation: BusinessRelation;
    public CustomFields: any;
}


export class BusinessRelation extends UniEntity {
    public static RelativeUrl = 'business-relations';
    public static EntityType = 'BusinessRelation';

    public DefaultContactID: number;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public DefaultBankAccountID: number;
    public InvoiceAddressID: number;
    public CreatedAt: Date;
    public ShippingAddressID: number;
    public Deleted: boolean;
    public Name: string;
    public DefaultEmailID: number;
    public DefaultPhoneID: number;
    public StatusCode: number;
    public CreatedBy: string;
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

    public Comment: string;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public InfoID: number;
    public ParentBusinessRelationID: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public StatusCode: number;
    public Role: string;
    public CreatedBy: string;
    public _createguid: string;
    public ParentBusinessRelation: BusinessRelation;
    public Info: BusinessRelation;
    public CustomFields: any;
}


export class Email extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Email';

    public Description: string;
    public ID: number;
    public UpdatedBy: string;
    public EmailAddress: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public BusinessRelationID: number;
    public Type: string;
    public Deleted: boolean;
    public StatusCode: number;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Phone extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Phone';

    public Description: string;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public BusinessRelationID: number;
    public Type: PhoneTypeEnum;
    public Deleted: boolean;
    public CountryCode: string;
    public StatusCode: number;
    public Number: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class AGACalculation extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AGACalculation';

    public PayrollRunID: number;
    public ID: number;
    public DimensionsID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public StatusCode: number;
    public CreatedBy: string;
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
    public UpdatedAt: Date;
    public AGACalculationID: number;
    public SubEntityID: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public freeAmount: number;
    public StatusCode: number;
    public CreatedBy: string;
    public _createguid: string;
    public subEntity: SubEntity;
    public CustomFields: any;
}


export class AGATax extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AGATax';

    public AGARateID: number;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public AGACalculationID: number;
    public SubEntityID: number;
    public agaBase: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public beregningsKode: number;
    public zone: number;
    public agaRate: number;
    public StatusCode: number;
    public CreatedBy: string;
    public municipalityName: string;
    public zoneName: string;
    public _createguid: string;
    public subEntity: SubEntity;
    public CustomFields: any;
}


export class AGAPension extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AGAPension';

    public AGARateID: number;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public AGACalculationID: number;
    public SubEntityID: number;
    public agaBase: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public beregningsKode: number;
    public zone: number;
    public agaRate: number;
    public StatusCode: number;
    public CreatedBy: string;
    public municipalityName: string;
    public zoneName: string;
    public _createguid: string;
    public subEntity: SubEntity;
    public CustomFields: any;
}


export class AGADraw extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AGADraw';

    public AGARateID: number;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public AGACalculationID: number;
    public SubEntityID: number;
    public agaBase: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public beregningsKode: number;
    public zone: number;
    public agaRate: number;
    public StatusCode: number;
    public CreatedBy: string;
    public municipalityName: string;
    public zoneName: string;
    public _createguid: string;
    public subEntity: SubEntity;
    public CustomFields: any;
}


export class ForeignerWithPercent extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ForeignerWithPercent';

    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public AGACalculationID: number;
    public SubEntityID: number;
    public agaBase: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public agaRate: number;
    public StatusCode: number;
    public CreatedBy: string;
    public municipalityName: string;
    public zoneName: string;
    public _createguid: string;
    public subEntity: SubEntity;
    public CustomFields: any;
}


export class DrawForeignerWithPercent extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'DrawForeignerWithPercent';

    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public AGACalculationID: number;
    public SubEntityID: number;
    public agaBase: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public agaRate: number;
    public StatusCode: number;
    public CreatedBy: string;
    public municipalityName: string;
    public zoneName: string;
    public _createguid: string;
    public subEntity: SubEntity;
    public CustomFields: any;
}


export class ForeignerWithAmount extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ForeignerWithAmount';

    public ID: number;
    public UpdatedBy: string;
    public persons: number;
    public UpdatedAt: Date;
    public AGACalculationID: number;
    public SubEntityID: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public aga: number;
    public StatusCode: number;
    public CreatedBy: string;
    public municipalityName: string;
    public zoneName: string;
    public _createguid: string;
    public subEntity: SubEntity;
    public CustomFields: any;
}


export class TaxAndAgaSums extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'TaxAndAgaSums';

    public GarnishmentTax: number;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public WithholdingTax: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public FinancialTax: number;
    public StatusCode: number;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class AmeldingData extends UniEntity {
    public static RelativeUrl = 'amelding';
    public static EntityType = 'AmeldingData';

    public receiptID: number;
    public status: number;
    public PayrollRunID: number;
    public ID: number;
    public period: number;
    public year: number;
    public UpdatedBy: string;
    public created: Date;
    public replacesID: number;
    public UpdatedAt: Date;
    public messageID: string;
    public mainFileID: number;
    public OppgaveHash: string;
    public attachmentFileID: number;
    public sent: Date;
    public CreatedAt: Date;
    public type: AmeldingType;
    public Deleted: boolean;
    public feedbackFileID: number;
    public altinnStatus: string;
    public initiated: Date;
    public StatusCode: number;
    public CreatedBy: string;
    public replaceThis: string;
    public xmlValidationErrors: string;
    public _createguid: string;
    public log: Array<AmeldingLog>;
    public CustomFields: any;
}


export class AmeldingLog extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AmeldingLog';

    public registry: SalaryRegistry;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public AmeldingsID: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public key: number;
    public StatusCode: number;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class BasicAmount extends UniEntity {
    public static RelativeUrl = 'basicamounts';
    public static EntityType = 'BasicAmount';

    public BasicAmountPrYear: number;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public BasicAmountPrMonth: number;
    public CreatedAt: Date;
    public FromDate: Date;
    public Deleted: boolean;
    public ConversionFactor: number;
    public AveragePrYear: number;
    public StatusCode: number;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class CompanySalary extends UniEntity {
    public static RelativeUrl = 'companysalary';
    public static EntityType = 'CompanySalary';

    public Base_JanMayenAndBiCountries: boolean;
    public PostGarnishmentToTaxAccount: boolean;
    public WagetypeAdvancePayment: number;
    public RateFinancialTax: number;
    public Base_SpesialDeductionForMaritim: boolean;
    public PostToTaxDraw: boolean;
    public ID: number;
    public MainAccountCostAGA: number;
    public UpdatedBy: string;
    public Base_TaxFreeOrganization: boolean;
    public UpdatedAt: Date;
    public CalculateFinancialTax: boolean;
    public Base_PayAsYouEarnTaxOnPensions: boolean;
    public MainAccountAllocatedAGA: number;
    public HoursPerMonth: number;
    public OtpExportActive: boolean;
    public InterrimRemitAccount: number;
    public AnnualStatementZipReportID: number;
    public Base_Svalbard: boolean;
    public AllowOver6G: boolean;
    public Base_NettoPaymentForMaritim: boolean;
    public MainAccountAllocatedAGAVacation: number;
    public MainAccountCostFinancialVacation: number;
    public PaycheckZipReportID: number;
    public MainAccountAllocatedFinancial: number;
    public CreatedAt: Date;
    public MainAccountCostVacation: number;
    public Base_NettoPayment: boolean;
    public Deleted: boolean;
    public MainAccountAllocatedVacation: number;
    public PaymentInterval: CompanySalaryPaymentInterval;
    public WagetypeAdvancePaymentAuto: number;
    public MainAccountCostFinancial: number;
    public FreeAmount: number;
    public HourFTEs: number;
    public WageDeductionDueToHoliday: WageDeductionDueToHolidayType;
    public MainAccountCostAGAVacation: number;
    public StatusCode: number;
    public MainAccountAllocatedFinancialVacation: number;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class CompanyVacationRate extends UniEntity {
    public static RelativeUrl = 'companyvacationrates';
    public static EntityType = 'CompanyVacationRate';

    public Rate: number;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public Rate60: number;
    public CreatedAt: Date;
    public FromDate: Date;
    public Deleted: boolean;
    public StatusCode: number;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class EmployeeCategory extends UniEntity {
    public static RelativeUrl = 'employeecategories';
    public static EntityType = 'EmployeeCategory';

    public EmployeeCategoryLinkID: number;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public Name: string;
    public StatusCode: number;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class EmployeeCategoryLink extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'EmployeeCategoryLink';

    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public EmployeeCategoryID: number;
    public EmployeeID: number;
    public EmployeeNumber: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public StatusCode: number;
    public CreatedBy: string;
    public _createguid: string;
    public EmployeeCategory: EmployeeCategory;
    public Employee: Employee;
    public CustomFields: any;
}


export class Employee extends UniEntity {
    public static RelativeUrl = 'employees';
    public static EntityType = 'Employee';

    public SocialSecurityNumber: string;
    public IncludeOtpUntilYear: number;
    public FreeText: string;
    public ID: number;
    public UpdatedBy: string;
    public EmployeeLanguageID: number;
    public UpdatedAt: Date;
    public EmploymentDate: Date;
    public OtpStatus: OtpStatus;
    public UserID: number;
    public PhotoID: number;
    public Sex: GenderEnum;
    public AdvancePaymentAmount: number;
    public SubEntityID: number;
    public MunicipalityNo: string;
    public EmployeeNumber: number;
    public TypeOfPaymentOtp: TypeOfPaymentOtp;
    public CreatedAt: Date;
    public BusinessRelationID: number;
    public BirthDate: Date;
    public Deleted: boolean;
    public PaymentInterval: PaymentInterval;
    public Active: boolean;
    public EmploymentDateOtp: LocalDate;
    public IncludeOtpUntilMonth: number;
    public ForeignWorker: ForeignWorker;
    public EndDateOtp: LocalDate;
    public InternationalID: string;
    public InternasjonalIDType: InternationalIDType;
    public OtpExport: boolean;
    public StatusCode: number;
    public InternasjonalIDCountry: string;
    public CreatedBy: string;
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
    public pensjonID: number;
    public IssueDate: Date;
    public ID: number;
    public Year: number;
    public UpdatedBy: string;
    public SKDXml: string;
    public UpdatedAt: Date;
    public ufoereYtelserAndreID: number;
    public EmployeeID: number;
    public loennFraHovedarbeidsgiverID: number;
    public Percent: number;
    public EmployeeNumber: number;
    public loennFraBiarbeidsgiverID: number;
    public SecondaryPercent: number;
    public CreatedAt: Date;
    public SecondaryTable: string;
    public Deleted: boolean;
    public NonTaxableAmount: number;
    public Table: string;
    public Tilleggsopplysning: string;
    public loennTilUtenrikstjenestemannID: number;
    public loennKunTrygdeavgiftTilUtenlandskBorgerID: number;
    public TaxcardId: number;
    public NotMainEmployer: boolean;
    public StatusCode: number;
    public loennKunTrygdeavgiftTilUtenlandskBorgerSomGrensegjengerID: number;
    public CreatedBy: string;
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

    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public AntallMaanederForTrekk: number;
    public Percent: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public tabellType: TabellType;
    public NonTaxableAmount: number;
    public Table: string;
    public freeAmountType: FreeAmountType;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class EmployeeLeave extends UniEntity {
    public static RelativeUrl = 'EmployeeLeave';
    public static EntityType = 'EmployeeLeave';

    public AffectsOtp: boolean;
    public Description: string;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public LeavePercent: number;
    public EmploymentID: number;
    public CreatedAt: Date;
    public FromDate: Date;
    public Deleted: boolean;
    public LeaveType: Leavetype;
    public ToDate: Date;
    public StatusCode: number;
    public CreatedBy: string;
    public _createguid: string;
    public Employment: Employment;
    public CustomFields: any;
}


export class Employment extends UniEntity {
    public static RelativeUrl = 'employments';
    public static EntityType = 'Employment';

    public PayGrade: string;
    public EndDate: Date;
    public TradeArea: ShipTradeArea;
    public JobCode: string;
    public LedgerAccount: string;
    public JobName: string;
    public ID: number;
    public DimensionsID: number;
    public UpdatedBy: string;
    public MonthRate: number;
    public ShipType: ShipTypeOfShip;
    public RegulativeStepNr: number;
    public UpdatedAt: Date;
    public HoursPerWeek: number;
    public EmployeeID: number;
    public Standard: boolean;
    public WorkPercent: number;
    public WorkingHoursScheme: WorkingHoursScheme;
    public SubEntityID: number;
    public LastWorkPercentChangeDate: Date;
    public EmployeeNumber: number;
    public EndDateReason: EndDateReason;
    public ShipReg: ShipRegistry;
    public CreatedAt: Date;
    public Deleted: boolean;
    public LastSalaryChangeDate: Date;
    public StartDate: Date;
    public UserDefinedRate: number;
    public SeniorityDate: Date;
    public HourRate: number;
    public EmploymentType: EmploymentType;
    public RemunerationType: RemunerationType;
    public StatusCode: number;
    public RegulativeGroupID: number;
    public CreatedBy: string;
    public TypeOfEmployment: TypeOfEmployment;
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
    public ID: number;
    public UpdatedBy: string;
    public AffectsAGA: boolean;
    public UpdatedAt: Date;
    public SubentityID: number;
    public CreatedAt: Date;
    public FromDate: Date;
    public Deleted: boolean;
    public Amount: number;
    public StatusCode: number;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class IncomeReportData extends UniEntity {
    public static RelativeUrl = 'income-reports';
    public static EntityType = 'IncomeReportData';

    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public MonthlyRefund: number;
    public EmploymentID: number;
    public Xml: string;
    public CreatedAt: Date;
    public Type: string;
    public Deleted: boolean;
    public AltinnReceiptID: number;
    public StatusCode: number;
    public CreatedBy: string;
    public _createguid: string;
    public AltinnReceipt: AltinnReceipt;
    public Employment: Employment;
    public CustomFields: any;
}


export class OtpExportWagetype extends UniEntity {
    public static RelativeUrl = 'otpexportwagetypes';
    public static EntityType = 'OtpExportWagetype';

    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public WageTypeNumber: number;
    public StatusCode: number;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class PayrollRun extends UniEntity {
    public static RelativeUrl = 'payrollrun';
    public static EntityType = 'PayrollRun';

    public JournalEntryNumber: string;
    public PaycheckFileID: number;
    public Description: string;
    public FreeText: string;
    public ID: number;
    public taxdrawfactor: TaxDrawFactor;
    public UpdatedBy: string;
    public ExcludeRecurringPosts: boolean;
    public UpdatedAt: Date;
    public SettlementDate: Date;
    public AGAFreeAmount: number;
    public CreatedAt: Date;
    public HolidayPayDeduction: boolean;
    public FromDate: Date;
    public Deleted: boolean;
    public AGAonRun: number;
    public PayDate: Date;
    public needsRecalc: boolean;
    public ToDate: Date;
    public StatusCode: number;
    public CreatedBy: string;
    public _createguid: string;
    public transactions: Array<SalaryTransaction>;
    public agacalculation: Array<AGACalculation>;
    public CustomFields: any;
}


export class PayrollRunCategoryLink extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'PayrollRunCategoryLink';

    public PayrollRunID: number;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public EmployeeCategoryID: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public StatusCode: number;
    public CreatedBy: string;
    public _createguid: string;
    public EmployeeCategory: EmployeeCategory;
    public PayrollRun: PayrollRun;
    public CustomFields: any;
}


export class PostingSummaryDraft extends UniEntity {
    public status: SummaryJobStatus;
    public draftWithDimsOnBalance: string;
    public JobInfoID: number;
    public ID: number;
    public statusTime: Date;
    public PayrollID: number;
    public draftWithDims: string;
    public draftBasic: string;
}


export class Regulative extends UniEntity {
    public static RelativeUrl = 'regulatives';
    public static EntityType = 'Regulative';

    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public StartDate: LocalDate;
    public StatusCode: number;
    public RegulativeGroupID: number;
    public CreatedBy: string;
    public _createguid: string;
    public Steps: Array<RegulativeStep>;
    public CustomFields: any;
}


export class RegulativeGroup extends UniEntity {
    public static RelativeUrl = 'regulativegroups';
    public static EntityType = 'RegulativeGroup';

    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public Name: string;
    public StatusCode: number;
    public CreatedBy: string;
    public _createguid: string;
    public Regulatives: Array<Regulative>;
    public CustomFields: any;
}


export class RegulativeStep extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'RegulativeStep';

    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public Step: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public Amount: number;
    public RegulativeID: number;
    public StatusCode: number;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class SalaryBalance extends UniEntity {
    public static RelativeUrl = 'salarybalances';
    public static EntityType = 'SalaryBalance';

    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public MinAmount: number;
    public EmployeeID: number;
    public SalaryBalanceTemplateID: number;
    public EmploymentID: number;
    public InstalmentType: SalBalType;
    public CreatedAt: Date;
    public Type: SalBalDrawType;
    public FromDate: Date;
    public Deleted: boolean;
    public WageTypeNumber: number;
    public Name: string;
    public Source: SalBalSource;
    public CreatePayment: boolean;
    public KID: string;
    public ToDate: Date;
    public InstalmentPercent: number;
    public Instalment: number;
    public SupplierID: number;
    public StatusCode: number;
    public CreatedBy: string;
    public MaxAmount: number;
    public CalculatedBalance: number;
    public Balance: number;
    public Amount: number;
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
    public Description: string;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public SalaryTransactionID: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public Amount: number;
    public SalaryBalanceID: number;
    public StatusCode: number;
    public CreatedBy: string;
    public _createguid: string;
    public SalaryTransaction: SalaryTransaction;
    public SalaryBalance: SalaryBalance;
    public CustomFields: any;
}


export class SalaryBalanceTemplate extends UniEntity {
    public static RelativeUrl = 'salarybalancetemplates';
    public static EntityType = 'SalaryBalanceTemplate';

    public SalarytransactionDescription: string;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public MinAmount: number;
    public InstalmentType: SalBalType;
    public CreatedAt: Date;
    public Deleted: boolean;
    public WageTypeNumber: number;
    public Name: string;
    public CreatePayment: boolean;
    public KID: string;
    public InstalmentPercent: number;
    public Instalment: number;
    public SupplierID: number;
    public Account: number;
    public StatusCode: number;
    public CreatedBy: string;
    public MaxAmount: number;
    public _createguid: string;
    public Supplier: Supplier;
    public SalaryBalances: Array<SalaryBalance>;
    public CustomFields: any;
}


export class SalaryTransaction extends UniEntity {
    public static RelativeUrl = 'salarytrans';
    public static EntityType = 'SalaryTransaction';

    public WageTypeID: number;
    public IsRecurringPost: boolean;
    public Sum: number;
    public PayrollRunID: number;
    public recurringPostValidFrom: Date;
    public Rate: number;
    public ID: number;
    public DimensionsID: number;
    public UpdatedBy: string;
    public SystemType: StdSystemType;
    public calcAGA: number;
    public UpdatedAt: Date;
    public EmployeeID: number;
    public SalaryTransactionCarInfoID: number;
    public MunicipalityNo: string;
    public EmployeeNumber: number;
    public TaxbasisID: number;
    public ChildSalaryTransactionID: number;
    public EmploymentID: number;
    public CreatedAt: Date;
    public HolidayPayDeduction: boolean;
    public VatTypeID: number;
    public FromDate: Date;
    public Deleted: boolean;
    public Amount: number;
    public recurringPostValidTo: Date;
    public WageTypeNumber: number;
    public SalaryBalanceID: number;
    public ToDate: Date;
    public Account: number;
    public StatusCode: number;
    public RecurringID: number;
    public Text: string;
    public CreatedBy: string;
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
    public RegistrationYear: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public IsLongRange: boolean;
    public CreatedAt: Date;
    public Deleted: boolean;
    public IsElectric: boolean;
    public StatusCode: number;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class SalaryTransactionSupplement extends UniEntity {
    public static RelativeUrl = 'supplements';
    public static EntityType = 'SalaryTransactionSupplement';

    public ID: number;
    public ValueDate: Date;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public ValueBool: boolean;
    public ValueDate2: Date;
    public ValueString: string;
    public SalaryTransactionID: number;
    public WageTypeSupplementID: number;
    public CreatedAt: Date;
    public ValueMoney: number;
    public Deleted: boolean;
    public StatusCode: number;
    public CreatedBy: string;
    public _createguid: string;
    public WageTypeSupplement: WageTypeSupplement;
    public CustomFields: any;
}


export class SalaryYear extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'SalaryYear';

    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public CurrentYear: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public StatusCode: number;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class SubEntity extends UniEntity {
    public static RelativeUrl = 'subentities';
    public static EntityType = 'SubEntity';

    public AgaZone: number;
    public ID: number;
    public UpdatedBy: string;
    public SuperiorOrganizationID: number;
    public UpdatedAt: Date;
    public MunicipalityNo: string;
    public OrgNumber: string;
    public CreatedAt: Date;
    public BusinessRelationID: number;
    public Deleted: boolean;
    public AgaRule: number;
    public freeAmount: number;
    public StatusCode: number;
    public CreatedBy: string;
    public _createguid: string;
    public BusinessRelationInfo: BusinessRelation;
    public SuperiorOrganization: SubEntity;
    public CustomFields: any;
}


export class TaxBasis extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'TaxBasis';

    public Basis: number;
    public ID: number;
    public UpdatedBy: string;
    public PensionBasis: number;
    public UpdatedAt: Date;
    public PensionSourcetaxBasis: number;
    public JanMayenBasis: number;
    public SvalbardBasis: number;
    public SailorBasis: number;
    public SalaryTransactionID: number;
    public CreatedAt: Date;
    public ForeignCitizenInsuranceBasis: number;
    public Deleted: boolean;
    public ForeignBorderCommuterBasis: number;
    public StatusCode: number;
    public CreatedBy: string;
    public DisabilityOtherBasis: number;
    public _createguid: string;
    public CustomFields: any;
}


export class Travel extends UniEntity {
    public static RelativeUrl = 'travels';
    public static EntityType = 'Travel';

    public Comment: string;
    public PersonID: string;
    public State: state;
    public Description: string;
    public ID: number;
    public DimensionsID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public Phone: string;
    public Purpose: string;
    public EmployeeNumber: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public Email: string;
    public SourceSystem: string;
    public Name: string;
    public TravelIdentificator: string;
    public SupplierID: number;
    public StatusCode: number;
    public CreatedBy: string;
    public AdvanceAmount: number;
    public _createguid: string;
    public TravelLines: Array<TravelLine>;
    public Dimensions: Dimensions;
    public CustomFields: any;
}


export class TravelLine extends UniEntity {
    public static RelativeUrl = 'travellines';
    public static EntityType = 'TravelLine';

    public TravelID: number;
    public Description: string;
    public AccountNumber: number;
    public Rate: number;
    public ID: number;
    public DimensionsID: number;
    public UpdatedBy: string;
    public paytransID: number;
    public UpdatedAt: Date;
    public CostType: costtype;
    public From: Date;
    public To: Date;
    public CreatedAt: Date;
    public VatTypeID: number;
    public Deleted: boolean;
    public InvoiceAccount: number;
    public Amount: number;
    public LineState: linestate;
    public TypeID: number;
    public TravelIdentificator: string;
    public StatusCode: number;
    public CreatedBy: string;
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

    public ForeignTypeID: string;
    public ForeignDescription: string;
    public Description: string;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public InvoiceAccount: number;
    public WageTypeNumber: number;
    public StatusCode: number;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class VacationPayLine extends UniEntity {
    public static RelativeUrl = 'VacationPayLines';
    public static EntityType = 'VacationPayLine';

    public ID: number;
    public Year: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public EmployeeID: number;
    public ManualVacationPayBase: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public StatusCode: number;
    public CreatedBy: string;
    public SystemVacationPayBase: number;
    public Rate: number;
    public VacationPay: number;
    public PaidTaxFreeVacationPay: number;
    public PaidVacationPay: number;
    public VacationPay60: number;
    public Withdrawal: number;
    public Rate60: number;
    public MissingEarlierVacationPay: number;
    public Age: number;
    public _createguid: string;
    public Employee: Employee;
    public CustomFields: any;
}


export class VacationRateEmployee extends UniEntity {
    public static RelativeUrl = 'employeevacationrates';
    public static EntityType = 'VacationRateEmployee';

    public EndDate: Date;
    public Rate: number;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public EmployeeID: number;
    public Rate60: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public StartDate: Date;
    public StatusCode: number;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class WageType extends UniEntity {
    public static RelativeUrl = 'wagetypes';
    public static EntityType = 'WageType';

    public Base_Payment: boolean;
    public Limit_WageTypeNumber: number;
    public Limit_type: LimitType;
    public Description: string;
    public AccountNumber: number;
    public Rate: number;
    public ID: number;
    public DaysOnBoard: boolean;
    public StandardWageTypeFor: StdWageType;
    public SpecialTaxAndContributionsRule: SpecialTaxAndContributionsRule;
    public UpdatedBy: string;
    public SupplementPackage: string;
    public Base_Vacation: boolean;
    public Systemtype: string;
    public UpdatedAt: Date;
    public taxtype: TaxType;
    public Limit_newRate: number;
    public AccountNumber_balance: number;
    public SpecialTaxHandling: string;
    public Base_div2: boolean;
    public NoNumberOfHours: boolean;
    public Postnr: string;
    public CreatedAt: Date;
    public FixedSalaryHolidayDeduction: boolean;
    public Deleted: boolean;
    public SystemRequiredWageType: number;
    public Limit_value: number;
    public Base_EmploymentTax: boolean;
    public GetRateFrom: GetRateFrom;
    public WageTypeNumber: number;
    public WageTypeName: string;
    public HideFromPaycheck: boolean;
    public ValidYear: number;
    public RateFactor: number;
    public SpecialAgaRule: SpecialAgaRule;
    public IncomeType: string;
    public StatusCode: number;
    public RatetypeColumn: RateTypeColumn;
    public CreatedBy: string;
    public Benefit: string;
    public Base_div3: boolean;
    public _createguid: string;
    public SupplementaryInformations: Array<WageTypeSupplement>;
    public CustomFields: any;
}


export class WageTypeSupplement extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'WageTypeSupplement';

    public WageTypeID: number;
    public SuggestedValue: string;
    public GetValueFromTrans: boolean;
    public Description: string;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public ValueType: Valuetype;
    public ameldingType: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public Name: string;
    public StatusCode: number;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class WageTypeTranslation extends UniEntity {
    public static RelativeUrl = 'wagetypetranslations';
    public static EntityType = 'WageTypeTranslation';

    public ID: number;
    public UpdatedBy: string;
    public EmployeeLanguageID: number;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public WageTypeNumber: number;
    public WageTypeName: string;
    public StatusCode: number;
    public CreatedBy: string;
    public _createguid: string;
    public EmployeeLanguage: EmployeeLanguage;
    public CustomFields: any;
}


export class PensionScheme extends UniEntity {
    public static RelativeUrl = 'pensionschemes';
    public static EntityType = 'PensionScheme';

    public ID: number;
    public Period: number;
    public Year: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public Identificator: string;
    public StatusCode: number;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class PensionSchemeSupplier extends UniEntity {
    public static RelativeUrl = 'pensionschemesuppliers';
    public static EntityType = 'PensionSchemeSupplier';

    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public Identificator: string;
    public Name: string;
    public StatusCode: number;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class StandardPensionSchemeSupplier extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'StandardPensionSchemeSupplier';

    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public Identificator: string;
    public Name: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class EmployeeLanguage extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'EmployeeLanguage';

    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public LanguageCode: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public StatusCode: number;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class ComponentLayout extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ComponentLayout';

    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public BaseEntity: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public Name: string;
    public StatusCode: number;
    public CreatedBy: string;
    public _createguid: string;
    public Fields: Array<FieldLayout>;
    public CustomFields: any;
}


export class FieldLayout extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'FieldLayout';

    public Property: string;
    public Description: string;
    public LineBreak: boolean;
    public ID: number;
    public FieldType: FieldType;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public ComponentLayoutID: number;
    public Sectionheader: string;
    public CreatedAt: Date;
    public Width: string;
    public Section: number;
    public LookupField: boolean;
    public Deleted: boolean;
    public Placeholder: string;
    public HelpText: string;
    public DisplayField: string;
    public Hidden: boolean;
    public ReadOnly: boolean;
    public Combo: number;
    public EntityType: string;
    public Placement: number;
    public Label: string;
    public Alignment: Alignment;
    public FieldSet: number;
    public Options: string;
    public StatusCode: number;
    public CreatedBy: string;
    public Legend: string;
    public _createguid: string;
    public CustomFields: any;
}


export class CurrencyOverride extends UniEntity {
    public static RelativeUrl = 'currencyoverrides';
    public static EntityType = 'CurrencyOverride';

    public ToCurrencyCodeID: number;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public Factor: number;
    public CreatedAt: Date;
    public FromDate: LocalDate;
    public Deleted: boolean;
    public Source: CurrencySourceEnum;
    public FromCurrencyCodeID: number;
    public ExchangeRate: number;
    public ToDate: LocalDate;
    public CreatedBy: string;
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
    public UpdatedAt: Date;
    public AssetGroupCode: string;
    public CreatedAt: Date;
    public ToAccountNumber: number;
    public Deleted: boolean;
    public CreatedBy: string;
    public FromAccountNumber: number;
    public _createguid: string;
    public CustomFields: any;
}


export class AccountGroupSetup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AccountGroupSetup';

    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public ParentID: number;
    public CreatedAt: Date;
    public ExternalReference: string;
    public Deleted: boolean;
    public Name: string;
    public PlanType: PlanTypeEnum;
    public CreatedBy: string;
    public _createguid: string;
    public Parent: AccountGroupSetup;
    public CustomFields: any;
}


export class AccountSetup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AccountSetup';

    public AccountName: string;
    public AccountGroupSetupID: number;
    public AccountNumber: number;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public SaftMappingAccountID: number;
    public ExpectedDebitBalance: boolean;
    public CreatedAt: Date;
    public VatCode: string;
    public Deleted: boolean;
    public Visible: boolean;
    public PlanType: PlanTypeEnum;
    public CreatedBy: string;
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
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public Name: string;
    public CreatedBy: string;
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
    public AccountSetupID: number;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public AccountVisibilityGroupID: number;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class AGARate extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AGARate';

    public Rate: number;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public ZoneID: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public CreatedBy: string;
    public RateValidFrom: Date;
    public _createguid: string;
    public sector: Array<AGASector>;
    public CustomFields: any;
}


export class AGASector extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AGASector';

    public SectorID: number;
    public Rate: number;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public ValidFrom: Date;
    public Sector: string;
    public freeAmount: number;
    public RateID: number;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class AGAZone extends UniEntity {
    public static RelativeUrl = 'AGAZones';
    public static EntityType = 'AGAZone';

    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public ZoneName: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public CreatedBy: string;
    public _createguid: string;
    public rates: Array<AGARate>;
    public municipalsOnZone: Array<MunicipalAGAZone>;
    public CustomFields: any;
}


export class Agreement extends UniEntity {
    public static RelativeUrl = 'agreements';
    public static EntityType = 'Agreement';

    public AppliesTo: number;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public ValidFrom: Date;
    public Name: string;
    public Template: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class AssetGroup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AssetGroup';

    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public Code: string;
    public DepreciationRate: number;
    public DepreciationAccountNumber: number;
    public DepreciationYears: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public Name: string;
    public ToDate: Date;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class BankIdentifierCode extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'BankIdentifierCode';

    public BankName: string;
    public ID: number;
    public UpdatedBy: string;
    public BankIdentifier: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public Bic: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class CompanyType extends UniEntity {
    public static RelativeUrl = 'companytypes';
    public static EntityType = 'CompanyType';

    public Description: string;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public Priority: boolean;
    public DefaultPlanType: PlanTypeEnum;
    public FullName: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public Name: string;
    public DefaultAccountVisibilityGroupID: number;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Confirmation extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Confirmation';

    public PostalCode: string;
    public ContractType: string;
    public ID: number;
    public UpdatedBy: string;
    public DisplayName: string;
    public CompanyName: string;
    public UpdatedAt: Date;
    public Phone: string;
    public Code: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public Email: string;
    public ExpirationDate: Date;
    public StatusCode: number;
    public SignUpReferrer: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Country extends UniEntity {
    public static RelativeUrl = 'countries';
    public static EntityType = 'Country';

    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public Name: string;
    public DefaultCurrencyCode: string;
    public CountryCode: string;
    public CurrencyRateSource: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Currency extends UniEntity {
    public static RelativeUrl = 'currencies';
    public static EntityType = 'Currency';

    public CurrencyDate: LocalDate;
    public ToCurrencyCodeID: number;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public Factor: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public Source: CurrencySourceEnum;
    public FromCurrencyCodeID: number;
    public ExchangeRate: number;
    public CreatedBy: string;
    public _createguid: string;
    public FromCurrencyCode: CurrencyCode;
    public ToCurrencyCode: CurrencyCode;
    public CustomFields: any;
}


export class CurrencyCode extends UniEntity {
    public static RelativeUrl = 'currencycodes';
    public static EntityType = 'CurrencyCode';

    public ShortCode: string;
    public Description: string;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public Code: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public Name: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class DebtCollectionAutomation extends UniEntity {
    public static RelativeUrl = 'debtcollectionautomation';
    public static EntityType = 'DebtCollectionAutomation';

    public DebtCollectionSettingsID: number;
    public Description: string;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public Name: string;
    public CreatedBy: string;
    public _createguid: string;
    public DebtCollectionSettings: DebtCollectionSettings;
    public CustomFields: any;
}


export class EmploymentValidValues extends UniEntity {
    public static RelativeUrl = 'employmentvalidvalues';
    public static EntityType = 'EmploymentValidValues';

    public EndDate: boolean;
    public TradeArea: boolean;
    public JobCode: boolean;
    public JobName: boolean;
    public ID: number;
    public UpdatedBy: string;
    public MonthRate: boolean;
    public ShipType: boolean;
    public UpdatedAt: Date;
    public HoursPerWeek: boolean;
    public WorkPercent: boolean;
    public WorkingHoursScheme: boolean;
    public ShipReg: boolean;
    public employment: TypeOfEmployment;
    public CreatedAt: Date;
    public Deleted: boolean;
    public LastSalaryChangeDate: boolean;
    public StartDate: boolean;
    public UserDefinedRate: boolean;
    public LastWorkPercentChange: boolean;
    public SeniorityDate: boolean;
    public PaymentType: RemunerationType;
    public HourRate: boolean;
    public RemunerationType: boolean;
    public CreatedBy: string;
    public typeOfEmployment: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class FinancialDeadline extends UniEntity {
    public static RelativeUrl = 'deadlines';
    public static EntityType = 'FinancialDeadline';

    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public PassableDueDate: number;
    public CreatedAt: Date;
    public Type: FinancialDeadlineType;
    public Deleted: boolean;
    public Deadline: LocalDate;
    public Name: string;
    public StatusCode: number;
    public CreatedBy: string;
    public AdditionalInfo: string;
    public _createguid: string;
    public CustomFields: any;
}


export class JobTicket extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'JobTicket';

    public JobName: string;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public JobId: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public JobStatus: string;
    public GlobalIdentity: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class LanguageCode extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'LanguageCode';

    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public Code: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public Name: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Municipal extends UniEntity {
    public static RelativeUrl = 'Municipals';
    public static EntityType = 'Municipal';

    public CountyName: string;
    public MunicipalityName: string;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public MunicipalityNo: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public CountyNo: string;
    public Retired: boolean;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class MunicipalAGAZone extends UniEntity {
    public static RelativeUrl = 'MunicipalAGAZones';
    public static EntityType = 'MunicipalAGAZone';

    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public MunicipalityNo: string;
    public ZoneID: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public Startdate: Date;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class PaymentBatchType extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'PaymentBatchType';

    public Description: string;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public Code: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public Name: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class PaymentCode extends UniEntity {
    public static RelativeUrl = 'paymentCodes';
    public static EntityType = 'PaymentCode';

    public Description: string;
    public PaymentGroup: string;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public Code: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public Name: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class PostalCode extends UniEntity {
    public static RelativeUrl = 'postalcodes';
    public static EntityType = 'PostalCode';

    public ID: number;
    public UpdatedBy: string;
    public City: string;
    public UpdatedAt: Date;
    public Code: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public StatusCode: number;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class SaftMappingAccount extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'SaftMappingAccount';

    public Description: string;
    public ID: number;
    public AccountID: string;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class StaticRegister extends UniEntity {
    public static RelativeUrl = 'StaticRegister';
    public static EntityType = 'StaticRegister';

    public stamp: Date;
    public Registry: string;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class STYRKCode extends UniEntity {
    public static RelativeUrl = 'STYRK';
    public static EntityType = 'STYRKCode';

    public lnr: number;
    public tittel: string;
    public styrk: string;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public ynr: number;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Language extends UniEntity {
    public static RelativeUrl = 'languages';
    public static EntityType = 'Language';

    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public Code: string;
    public FallBackLanguageID: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public Name: string;
    public CreatedBy: string;
    public _createguid: string;
    public Translations: Array<Translation>;
    public CustomFields: any;
}


export class Translatable extends UniEntity {
    public static RelativeUrl = 'translatables';
    public static EntityType = 'Translatable';

    public Module: i18nModule;
    public Description: string;
    public ID: number;
    public Model: string;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public Value: string;
    public Column: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public Static: boolean;
    public Meaning: string;
    public CreatedBy: string;
    public _createguid: string;
    public Translations: Array<Translation>;
    public CustomFields: any;
}


export class Translation extends UniEntity {
    public static RelativeUrl = 'translations';
    public static EntityType = 'Translation';

    public ID: number;
    public LanguageID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public TranslatableID: number;
    public Value: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public CreatedBy: string;
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
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public No: string;
    public Name: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class VatPostSetup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'VatPostSetup';

    public HasTaxAmount: boolean;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public ReportAsNegativeAmount: boolean;
    public CreatedAt: Date;
    public Deleted: boolean;
    public No: string;
    public Name: string;
    public VatCodeGroupSetupNo: string;
    public HasTaxBasis: boolean;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class VatReportForm extends UniEntity {
    public static RelativeUrl = 'vatreportforms';
    public static EntityType = 'VatReportForm';

    public Description: string;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public Name: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class VatReportReferenceSetup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'VatReportReferenceSetup';

    public AccountNumber: number;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public VatPostNo: string;
    public CreatedAt: Date;
    public VatCode: string;
    public Deleted: boolean;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class VatTypeSetup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'VatTypeSetup';

    public IsCompensated: boolean;
    public OutgoingAccountNumber: number;
    public VatCodeGroupNo: string;
    public ID: number;
    public IncomingAccountNumber: number;
    public OutputVat: boolean;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public ReversedTaxDutyVat: boolean;
    public CreatedAt: Date;
    public VatCode: string;
    public IsNotVatRegistered: boolean;
    public Deleted: boolean;
    public Name: string;
    public DirectJournalEntryOnly: boolean;
    public CreatedBy: string;
    public DefaultVisible: boolean;
    public _createguid: string;
    public VatTypeSetupPercentages: Array<VatTypeSetupPercentage>;
    public CustomFields: any;
}


export class VatTypeSetupPercentage extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'VatTypeSetupPercentage';

    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public ValidTo: LocalDate;
    public VatPercent: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public ValidFrom: LocalDate;
    public VatTypeSetupID: number;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class CompanyReport extends UniEntity {
    public static RelativeUrl = 'company-report';
    public static EntityType = 'CompanyReport';

    public ContractId: number;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public CompanyKey: string;
    public CreatedAt: Date;
    public ReportDefinitionID: number;
    public Deleted: boolean;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class ReportDefinition extends UniEntity {
    public static RelativeUrl = 'report-definitions';
    public static EntityType = 'ReportDefinition';

    public ReportSource: string;
    public Description: string;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public Category: string;
    public CategoryLabel: string;
    public ReportType: number;
    public Md5: string;
    public CreatedAt: Date;
    public TemplateLinkId: string;
    public Deleted: boolean;
    public Visible: boolean;
    public Version: string;
    public IsStandard: boolean;
    public Name: string;
    public UniqueReportID: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class ReportDefinitionDataSource extends UniEntity {
    public static RelativeUrl = 'report-definition-data-sources';
    public static EntityType = 'ReportDefinitionDataSource';

    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public ReportDefinitionId: number;
    public Deleted: boolean;
    public Name: string;
    public DataSourceUrl: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class ReportDefinitionParameter extends UniEntity {
    public static RelativeUrl = 'report-definition-parameters';
    public static EntityType = 'ReportDefinitionParameter';

    public ID: number;
    public SortIndex: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public DefaultValueSource: string;
    public DefaultValue: string;
    public CreatedAt: Date;
    public Type: string;
    public ReportDefinitionId: number;
    public Deleted: boolean;
    public Visible: boolean;
    public DefaultValueLookupType: string;
    public DefaultValueList: string;
    public Name: string;
    public Label: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class PeriodSeries extends UniEntity {
    public static RelativeUrl = 'period-series';
    public static EntityType = 'PeriodSeries';

    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public Active: boolean;
    public Name: string;
    public SeriesType: PeriodSeriesType;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class PeriodTemplate extends UniEntity {
    public static RelativeUrl = 'period-templates';
    public static EntityType = 'PeriodTemplate';

    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public PeriodSeriesID: number;
    public CreatedAt: Date;
    public FromDate: LocalDate;
    public Deleted: boolean;
    public No: number;
    public Name: string;
    public ToDate: LocalDate;
    public CreatedBy: string;
    public _createguid: string;
    public PeriodSeries: PeriodSeries;
    public CustomFields: any;
}


export class Model extends UniEntity {
    public static RelativeUrl = 'models';
    public static EntityType = 'Model';

    public Shared: boolean;
    public Description: string;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public Admin: boolean;
    public CreatedAt: Date;
    public Deleted: boolean;
    public LabelPlural: string;
    public Name: string;
    public Label: string;
    public CreatedBy: string;
    public _createguid: string;
    public Fields: Array<Field>;
    public CustomFields: any;
}


export class Field extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Field';

    public Description: string;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public HelpText: string;
    public Name: string;
    public Label: string;
    public ModelID: number;
    public CreatedBy: string;
    public _createguid: string;
    public Model: Model;
    public CustomFields: any;
}


export class Notification extends UniEntity {
    public static RelativeUrl = 'notifications';
    public static EntityType = 'Notification';

    public RecipientID: string;
    public ID: number;
    public UpdatedBy: string;
    public Message: string;
    public CompanyName: string;
    public UpdatedAt: Date;
    public CompanyKey: string;
    public CreatedAt: Date;
    public SourceEntityID: number;
    public Deleted: boolean;
    public SourceEntityType: string;
    public EntityType: string;
    public StatusCode: number;
    public SenderDisplayName: string;
    public EntityID: number;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class CompanySettings extends UniEntity {
    public static RelativeUrl = 'companysettings';
    public static EntityType = 'CompanySettings';

    public InterrimPaymentAccountID: number;
    public HideInActiveCustomers: boolean;
    public WebAddress: string;
    public APIncludeAttachment: boolean;
    public TaxMandatory: boolean;
    public UseOcrInterpretation: boolean;
    public HideInActiveSuppliers: boolean;
    public StoreDistributedInvoice: boolean;
    public RoundingNumberOfDecimals: number;
    public FactoringEmailID: number;
    public AutoDistributeInvoice: boolean;
    public TaxMandatoryType: number;
    public LogoAlign: number;
    public SalaryBankAccountID: number;
    public ShowNumberOfDecimals: number;
    public ID: number;
    public AcceptableDelta4CustomerPaymentAccountID: number;
    public UsePaymentBankValues: boolean;
    public CompanyBankAccountID: number;
    public APActivated: boolean;
    public UpdatedBy: string;
    public FactoringNumber: number;
    public OnlyJournalMatchedPayments: boolean;
    public TwoStageAutobankEnabled: boolean;
    public HasAutobank: boolean;
    public AgioGainAccountID: number;
    public EnableCheckboxesForSupplierInvoiceList: boolean;
    public DefaultAddressID: number;
    public PeriodSeriesVatID: number;
    public EnableSendPaymentBeforeJournaled: boolean;
    public VatReportFormID: number;
    public CompanyTypeID: number;
    public CompanyName: string;
    public UpdatedAt: Date;
    public LogoHideField: number;
    public Factoring: number;
    public CustomerCreditDays: number;
    public UseNetsIntegration: boolean;
    public APGuid: string;
    public GLN: string;
    public RoundingType: RoundingType;
    public DefaultCustomerInvoiceReminderReportID: number;
    public DefaultSalesAccountID: number;
    public SaveCustomersFromQuoteAsLead: boolean;
    public NetsIntegrationActivated: boolean;
    public ShowKIDOnCustomerInvoice: boolean;
    public SAFTimportAccountID: number;
    public TaxableFromDate: LocalDate;
    public OfficeMunicipalityNo: string;
    public DefaultTOFCurrencySettingsID: number;
    public LogoFileID: number;
    public CreatedAt: Date;
    public IgnorePaymentsWithoutEndToEndID: boolean;
    public BankChargeAccountID: number;
    public AcceptableDelta4CustomerPayment: number;
    public VatLockedDate: LocalDate;
    public Deleted: boolean;
    public SupplierAccountID: number;
    public TaxBankAccountID: number;
    public OrganizationNumber: string;
    public CompanyRegistered: boolean;
    public AgioLossAccountID: number;
    public CustomerInvoiceReminderSettingsID: number;
    public Localization: string;
    public XtraPaymentOrgXmlTagValue: string;
    public UseAssetRegister: boolean;
    public APContactID: number;
    public EnableArchiveSupplierInvoice: boolean;
    public PaymentBankIdentification: string;
    public PaymentBankAgreementNumber: string;
    public DefaultEmailID: number;
    public SettlementVatAccountID: number;
    public DefaultCustomerInvoiceReportID: number;
    public AccountingLockedDate: LocalDate;
    public DefaultPhoneID: number;
    public TaxableFromLimit: number;
    public DefaultCustomerQuoteReportID: number;
    public AccountVisibilityGroupID: number;
    public BatchInvoiceMinAmount: number;
    public BookCustomerInvoiceOnDeliveryDate: boolean;
    public DefaultDistributionsID: number;
    public AllowAvtalegiroRegularInvoice: boolean;
    public ForceSupplierInvoiceApproval: boolean;
    public AutoJournalPayment: string;
    public DefaultCustomerOrderReportID: number;
    public CustomerAccountID: number;
    public PeriodSeriesAccountID: number;
    public BaseCurrencyCodeID: number;
    public InterrimRemitAccountID: number;
    public EnableApprovalFlow: boolean;
    public UseXtraPaymentOrgXmlTag: boolean;
    public StatusCode: number;
    public UseFinancialDateToCalculateVatPercent: boolean;
    public EnableAdvancedJournalEntry: boolean;
    public DefaultAccrualAccountID: number;
    public CreatedBy: string;
    public AccountGroupSetID: number;
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
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public Name: string;
    public EntityType: string;
    public StatusCode: number;
    public CreatedBy: string;
    public _createguid: string;
    public Elements: Array<DistributionPlanElement>;
    public CustomFields: any;
}


export class DistributionPlanElement extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'DistributionPlanElement';

    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public Priority: number;
    public DistributionPlanID: number;
    public CreatedAt: Date;
    public DistributionPlanElementTypeID: number;
    public Deleted: boolean;
    public StatusCode: number;
    public CreatedBy: string;
    public _createguid: string;
    public ElementType: DistributionPlanElementType;
    public CustomFields: any;
}


export class DistributionPlanElementType extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'DistributionPlanElementType';

    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public Name: string;
    public StatusCode: number;
    public CreatedBy: string;
    public _createguid: string;
    public LegalEntities: Array<DistributionPlanElementTypeLegalEntity>;
    public CustomFields: any;
}


export class DistributionPlanElementTypeLegalEntity extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'DistributionPlanElementTypeLegalEntity';

    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public DistributionPlanElementTypeID: number;
    public Deleted: boolean;
    public EntityType: string;
    public StatusCode: number;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Distributions extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Distributions';

    public CustomerInvoiceReminderDistributionPlanID: number;
    public CustomerOrderDistributionPlanID: number;
    public ID: number;
    public PayCheckDistributionPlanID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public CustomerQuoteDistributionPlanID: number;
    public AnnualStatementDistributionPlanID: number;
    public CustomerInvoiceDistributionPlanID: number;
    public StatusCode: number;
    public CreatedBy: string;
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
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public Name: string;
    public StatusCode: number;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class EmailLog extends UniEntity {
    public static RelativeUrl = 'emails';
    public static EntityType = 'EmailLog';

    public EntityDisplayValue: string;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public DistributeAt: LocalDate;
    public From: string;
    public ExternalMessage: string;
    public To: string;
    public CreatedAt: Date;
    public Type: SharingType;
    public ExternalReference: string;
    public Deleted: boolean;
    public EntityType: string;
    public JobRunID: number;
    public Subject: string;
    public JobRunExternalRef: string;
    public StatusCode: number;
    public EntityID: number;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Eventplan extends UniEntity {
    public static RelativeUrl = 'eventplans';
    public static EntityType = 'Eventplan';

    public SigningKey: string;
    public ModelFilter: string;
    public JobNames: string;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public OperationFilter: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public Active: boolean;
    public Name: string;
    public StatusCode: number;
    public IsSystemPlan: boolean;
    public PlanType: EventplanType;
    public CreatedBy: string;
    public Cargo: string;
    public _createguid: string;
    public ExpressionFilters: Array<ExpressionFilter>;
    public Subscribers: Array<EventSubscriber>;
    public CustomFields: any;
}


export class EventSubscriber extends UniEntity {
    public static RelativeUrl = 'eventsubscribers';
    public static EntityType = 'EventSubscriber';

    public EventplanID: number;
    public ID: number;
    public UpdatedBy: string;
    public Authorization: string;
    public UpdatedAt: Date;
    public Endpoint: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public Headers: string;
    public Active: boolean;
    public Name: string;
    public StatusCode: number;
    public CreatedBy: string;
    public _createguid: string;
    public Eventplan: Eventplan;
    public CustomFields: any;
}


export class ExpressionFilter extends UniEntity {
    public static RelativeUrl = 'expressionfilters';
    public static EntityType = 'ExpressionFilter';

    public Expression: string;
    public EventplanID: number;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public EntityName: string;
    public StatusCode: number;
    public CreatedBy: string;
    public _createguid: string;
    public Eventplan: Eventplan;
    public CustomFields: any;
}


export class Period extends UniEntity {
    public static RelativeUrl = 'periodes';
    public static EntityType = 'Period';

    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public AccountYear: number;
    public PeriodSeriesID: number;
    public CreatedAt: Date;
    public FromDate: LocalDate;
    public Deleted: boolean;
    public No: number;
    public Name: string;
    public ToDate: LocalDate;
    public StatusCode: number;
    public PeriodTemplateID: number;
    public CreatedBy: string;
    public _createguid: string;
    public PeriodTemplate: PeriodTemplate;
    public PeriodSeries: PeriodSeries;
    public CustomFields: any;
}


export class PredefinedDescription extends UniEntity {
    public static RelativeUrl = 'predefineddescriptions';
    public static EntityType = 'PredefinedDescription';

    public Description: string;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public Code: string;
    public CreatedAt: Date;
    public Type: PredefinedDescriptionType;
    public Deleted: boolean;
    public StatusCode: number;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class ProductCategory extends UniEntity {
    public static RelativeUrl = 'productcategories';
    public static EntityType = 'ProductCategory';

    public Status: number;
    public Comment: string;
    public Depth: number;
    public Description: string;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public ParentID: number;
    public Rght: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public Name: string;
    public Lft: number;
    public StatusCode: number;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class ProductCategoryLink extends UniEntity {
    public static RelativeUrl = 'productcategorylinks';
    public static EntityType = 'ProductCategoryLink';

    public ID: number;
    public UpdatedBy: string;
    public ProductID: number;
    public UpdatedAt: Date;
    public ProductCategoryID: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public StatusCode: number;
    public CreatedBy: string;
    public _createguid: string;
    public ProductCategory: ProductCategory;
    public CustomFields: any;
}


export class Sharing extends UniEntity {
    public static RelativeUrl = 'sharings';
    public static EntityType = 'Sharing';

    public EntityDisplayValue: string;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public DistributeAt: LocalDate;
    public From: string;
    public ExternalMessage: string;
    public To: string;
    public CreatedAt: Date;
    public Type: SharingType;
    public ExternalReference: string;
    public Deleted: boolean;
    public EntityType: string;
    public JobRunID: number;
    public Subject: string;
    public JobRunExternalRef: string;
    public StatusCode: number;
    public EntityID: number;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class StatusLog extends UniEntity {
    public static RelativeUrl = 'statuslogs';
    public static EntityType = 'StatusLog';

    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public ToStatus: number;
    public EntityType: string;
    public FromStatus: number;
    public EntityID: number;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Tracelink extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Tracelink';

    public DestinationInstanceID: number;
    public Date: Date;
    public SourceInstanceID: number;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public SourceEntityName: string;
    public DestinationEntityName: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public StatusCode: number;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class User extends UniEntity {
    public static RelativeUrl = 'users';
    public static EntityType = 'User';

    public ID: number;
    public Protected: boolean;
    public HasAgreedToImportDisclaimer: boolean;
    public UpdatedBy: string;
    public DisplayName: string;
    public PhoneNumber: string;
    public UpdatedAt: Date;
    public LastLogin: Date;
    public IsAutobankAdmin: boolean;
    public CreatedAt: Date;
    public Deleted: boolean;
    public Email: string;
    public GlobalIdentity: string;
    public UserName: string;
    public BankIntegrationUserName: string;
    public StatusCode: number;
    public CreatedBy: string;
    public EndDate: Date;
    public AuthPhoneNumber: string;
    public TwoFactorEnabled: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class UniQueryDefinition extends UniEntity {
    public static RelativeUrl = 'uniquerydefinitions';
    public static EntityType = 'UniQueryDefinition';

    public SystemGeneratedQuery: boolean;
    public Description: string;
    public IsShared: boolean;
    public ID: number;
    public SortIndex: number;
    public MainModelName: string;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public Category: string;
    public UserID: number;
    public ModuleID: number;
    public ClickUrl: string;
    public Code: string;
    public ClickParam: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public Name: string;
    public StatusCode: number;
    public CreatedBy: string;
    public _createguid: string;
    public UniQueryFilters: Array<UniQueryFilter>;
    public UniQueryFields: Array<UniQueryField>;
    public CustomFields: any;
}


export class UniQueryField extends UniEntity {
    public static RelativeUrl = 'uniqueryfields';
    public static EntityType = 'UniQueryField';

    public SumFunction: string;
    public UniQueryDefinitionID: number;
    public ID: number;
    public FieldType: number;
    public UpdatedBy: string;
    public Header: string;
    public UpdatedAt: Date;
    public Alias: string;
    public Index: number;
    public CreatedAt: Date;
    public Width: string;
    public Deleted: boolean;
    public Path: string;
    public Field: string;
    public StatusCode: number;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class UniQueryFilter extends UniEntity {
    public static RelativeUrl = 'uniqueryfilters';
    public static EntityType = 'UniQueryFilter';

    public UniQueryDefinitionID: number;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public Operator: string;
    public Value: string;
    public Group: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public Field: string;
    public StatusCode: number;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Team extends UniEntity {
    public static RelativeUrl = 'teams';
    public static EntityType = 'Team';

    public Depth: number;
    public ID: number;
    public DimensionsID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public ParentID: number;
    public Rght: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public Name: string;
    public Lft: number;
    public StatusCode: number;
    public CreatedBy: string;
    public _createguid: string;
    public Dimensions: Dimensions;
    public Positions: Array<TeamPosition>;
    public CustomFields: any;
}


export class TeamPosition extends UniEntity {
    public static RelativeUrl = 'teampositions';
    public static EntityType = 'TeamPosition';

    public ID: number;
    public UpdatedBy: string;
    public TeamID: number;
    public UpdatedAt: Date;
    public UserID: number;
    public ApproveOrder: number;
    public CreatedAt: Date;
    public FromDate: LocalDate;
    public Deleted: boolean;
    public RelatedSharedRoleId: number;
    public ToDate: LocalDate;
    public StatusCode: number;
    public CreatedBy: string;
    public Position: TeamPositionEnum;
    public _createguid: string;
    public Team: Team;
    public CustomFields: any;
}


export class ApprovalRule extends UniEntity {
    public static RelativeUrl = 'approvalrules';
    public static EntityType = 'ApprovalRule';

    public Description: string;
    public ID: number;
    public UpdatedBy: string;
    public Keywords: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public StatusCode: number;
    public IndustryCodes: string;
    public CreatedBy: string;
    public RuleType: ApprovalRuleType;
    public _createguid: string;
    public Steps: Array<ApprovalRuleStep>;
    public CustomFields: any;
}


export class ApprovalRuleStep extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ApprovalRuleStep';

    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public Limit: number;
    public UserID: number;
    public StepNumber: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public ApprovalRuleID: number;
    public StatusCode: number;
    public CreatedBy: string;
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
    public UpdatedAt: Date;
    public UserID: number;
    public CreatedAt: Date;
    public SubstituteUserID: number;
    public FromDate: LocalDate;
    public Deleted: boolean;
    public ToDate: LocalDate;
    public StatusCode: number;
    public CreatedBy: string;
    public _createguid: string;
    public User: User;
    public SubstituteUser: User;
    public CustomFields: any;
}


export class TaskApprovalPlan extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'TaskApprovalPlan';

    public Comment: string;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public Limit: number;
    public UserID: number;
    public StepNumber: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public Amount: number;
    public TaskID: number;
    public ApprovalRuleID: number;
    public StatusCode: number;
    public ApprovalID: number;
    public CreatedBy: string;
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
    public ID: number;
    public UpdatedBy: string;
    public StatusCategoryID: number;
    public UpdatedAt: Date;
    public System: boolean;
    public IsDepricated: boolean;
    public CreatedAt: Date;
    public Deleted: boolean;
    public EntityType: string;
    public Order: number;
    public StatusCode: number;
    public CreatedBy: string;
    public _createguid: string;
    public StatusCategory: StatusCategory;
    public CustomFields: any;
}


export class StatusCategory extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'StatusCategory';

    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public StatusCategoryCode: StatusCategoryCode;
    public CreatedAt: Date;
    public Deleted: boolean;
    public Name: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class StatusRemark extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'StatusRemark';

    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public Remark: string;
    public EntityType: string;
    public StatusCode: number;
    public EntityID: number;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Transition extends UniEntity {
    public static RelativeUrl = 'transitions';
    public static EntityType = 'Transition';

    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public Controller: string;
    public CreatedAt: Date;
    public MethodName: string;
    public Deleted: boolean;
    public EntityType: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class TransitionThreshold extends UniEntity {
    public static RelativeUrl = 'thresholds';
    public static EntityType = 'TransitionThreshold';

    public SharedApproveTransitionId: number;
    public PropertyName: string;
    public SharedRejectTransitionId: number;
    public ID: number;
    public SharedRoleId: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public Disabled: boolean;
    public Operator: Operator;
    public Value: string;
    public CreatedAt: Date;
    public RejectStatusCode: number;
    public Deleted: boolean;
    public Operation: OperationType;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class TransitionThresholdApproval extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'TransitionThresholdApproval';

    public SharedApproveTransitionId: number;
    public PropertyName: string;
    public SharedRejectTransitionId: number;
    public ID: number;
    public SharedRoleId: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public Operator: Operator;
    public Value: string;
    public CreatedAt: Date;
    public RejectStatusCode: number;
    public Deleted: boolean;
    public Operation: OperationType;
    public ApprovalID: number;
    public CreatedBy: string;
    public _createguid: string;
    public Approval: Approval;
    public CustomFields: any;
}


export class Approval extends UniEntity {
    public static RelativeUrl = 'approvals';
    public static EntityType = 'Approval';

    public ID: number;
    public SharedRoleId: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public UserID: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public Amount: number;
    public TaskID: number;
    public StatusCode: number;
    public CreatedBy: string;
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
    public SharedRejectTransitionId: number;
    public ID: number;
    public SharedRoleId: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public UserID: number;
    public CreatedAt: Date;
    public RejectStatusCode: number;
    public Type: TaskType;
    public Title: string;
    public Deleted: boolean;
    public StatusCode: number;
    public ModelID: number;
    public EntityID: number;
    public CreatedBy: string;
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

    public FromStatusID: number;
    public ExpiresDate: Date;
    public ID: number;
    public UpdatedBy: string;
    public ToStatusID: number;
    public UpdatedAt: Date;
    public TransitionID: number;
    public IsDepricated: boolean;
    public CreatedAt: Date;
    public Deleted: boolean;
    public EntityType: string;
    public CreatedBy: string;
    public _createguid: string;
    public FromStatus: Status;
    public ToStatus: Status;
    public Transition: Transition;
    public CustomFields: any;
}


export class Project extends UniEntity {
    public static RelativeUrl = 'projects';
    public static EntityType = 'Project';

    public EndDate: LocalDate;
    public WorkPlaceAddressID: number;
    public Description: string;
    public ID: number;
    public DimensionsID: number;
    public UpdatedBy: string;
    public ProjectLeadName: string;
    public Total: number;
    public CostPrice: number;
    public UpdatedAt: Date;
    public ProjectNumberSeriesID: number;
    public Price: number;
    public PlannedEnddate: LocalDate;
    public ProjectNumber: string;
    public ProjectCustomerID: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public Amount: number;
    public PlannedStartdate: LocalDate;
    public StartDate: LocalDate;
    public Name: string;
    public ProjectNumberNumeric: number;
    public StatusCode: number;
    public CreatedBy: string;
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

    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public UserID: number;
    public ProjectID: number;
    public Responsibility: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public Name: string;
    public StatusCode: number;
    public CreatedBy: string;
    public _createguid: string;
    public ProjectUser: User;
    public CustomFields: any;
}


export class ProjectResourceSchedule extends UniEntity {
    public static RelativeUrl = 'projects-schedules-resources';
    public static EntityType = 'ProjectResourceSchedule';

    public ProjectTaskID: number;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public ProjectTaskScheduleID: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public ProjectResourceID: number;
    public StatusCode: number;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class ProjectTask extends UniEntity {
    public static RelativeUrl = 'projects-tasks';
    public static EntityType = 'ProjectTask';

    public EndDate: LocalDate;
    public Description: string;
    public ID: number;
    public SuggestedNumber: string;
    public UpdatedBy: string;
    public Total: number;
    public CostPrice: number;
    public UpdatedAt: Date;
    public Price: number;
    public ProjectID: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public Amount: number;
    public StartDate: LocalDate;
    public Name: string;
    public StatusCode: number;
    public Number: string;
    public CreatedBy: string;
    public _createguid: string;
    public ProjectTaskSchedules: Array<ProjectTaskSchedule>;
    public ProjectTaskResources: Array<ProjectResourceSchedule>;
    public CustomFields: any;
}


export class ProjectTaskSchedule extends UniEntity {
    public static RelativeUrl = 'projects-tasks-schedules';
    public static EntityType = 'ProjectTaskSchedule';

    public EndDate: LocalDate;
    public ProjectTaskID: number;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public StartDate: LocalDate;
    public StatusCode: number;
    public CreatedBy: string;
    public _createguid: string;
    public ScheduleResources: Array<ProjectResourceSchedule>;
    public CustomFields: any;
}


export class BarnepassProduct extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'BarnepassProduct';

    public ID: number;
    public UpdatedBy: string;
    public ProductID: number;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public StatusCode: number;
    public CreatedBy: string;
    public _createguid: string;
    public Product: Product;
    public CustomFields: any;
}


export class Product extends UniEntity {
    public static RelativeUrl = 'products';
    public static EntityType = 'Product';

    public ImageFileID: number;
    public VariansParentID: number;
    public Description: string;
    public ID: number;
    public DimensionsID: number;
    public AccountID: number;
    public UpdatedBy: string;
    public CostPrice: number;
    public UpdatedAt: Date;
    public CalculateGrossPriceBasedOnNetPrice: boolean;
    public PartName: string;
    public DefaultProductCategoryID: number;
    public PriceExVat: number;
    public CreatedAt: Date;
    public Unit: string;
    public Type: ProductTypeEnum;
    public VatTypeID: number;
    public Deleted: boolean;
    public PriceIncVat: number;
    public Name: string;
    public ListPrice: number;
    public StatusCode: number;
    public AverageCost: number;
    public CreatedBy: string;
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

    public Comment: string;
    public NumberSeriesTaskID: number;
    public ID: number;
    public FromNumber: number;
    public UpdatedBy: string;
    public DisplayName: string;
    public NumberLock: boolean;
    public UpdatedAt: Date;
    public AccountYear: number;
    public Disabled: boolean;
    public IsDefaultForTask: boolean;
    public System: boolean;
    public CreatedAt: Date;
    public NextNumber: number;
    public MainAccountID: number;
    public Deleted: boolean;
    public UseNumbersFromNumberSeriesID: number;
    public Name: string;
    public NumberSeriesTypeID: number;
    public Empty: boolean;
    public ToNumber: number;
    public StatusCode: number;
    public CreatedBy: string;
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
    public UpdatedAt: Date;
    public NumberSerieTypeBID: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public NumberSerieTypeAID: number;
    public StatusCode: number;
    public CreatedBy: string;
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
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public Name: string;
    public EntityType: string;
    public StatusCode: number;
    public CreatedBy: string;
    public _createguid: string;
    public NumberSeries: Array<NumberSeries>;
    public CustomFields: any;
}


export class NumberSeriesType extends UniEntity {
    public static RelativeUrl = 'number-series-types';
    public static EntityType = 'NumberSeriesType';

    public CanHaveSeveralActiveSeries: boolean;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public EntityField: string;
    public System: boolean;
    public CreatedAt: Date;
    public Deleted: boolean;
    public Yearly: boolean;
    public Name: string;
    public EntityType: string;
    public StatusCode: number;
    public EntitySeriesIDField: string;
    public CreatedBy: string;
    public _createguid: string;
    public Series: Array<NumberSeries>;
    public CustomFields: any;
}


export class EncryptionInfo extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'EncryptionInfo';

    public description: string;
    public ID: number;
    public password: string;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public type: Type;
    public Deleted: boolean;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class File extends UniEntity {
    public static RelativeUrl = 'files/{entitytype}/{entityid}';
    public static EntityType = 'File';

    public Size: string;
    public ContentType: string;
    public Description: string;
    public ID: number;
    public StorageReference: string;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public OCRData: string;
    public Md5: string;
    public CreatedAt: Date;
    public Pages: number;
    public Deleted: boolean;
    public PermaLink: string;
    public Name: string;
    public StatusCode: number;
    public encryptionID: number;
    public CreatedBy: string;
    public UploadSlot: string;
    public _createguid: string;
    public FileTags: Array<FileTag>;
    public EntityLinks: Array<FileEntityLink>;
    public CustomFields: any;
}


export class FileTag extends UniEntity {
    public static RelativeUrl = 'filetags';
    public static EntityType = 'FileTag';

    public Status: number;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public TagName: string;
    public CreatedBy: string;
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
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public EntityType: string;
    public IsAttachment: boolean;
    public StatusCode: number;
    public EntityID: number;
    public CreatedBy: string;
    public FileID: number;
    public _createguid: string;
    public File: File;
    public CustomFields: any;
}


export class ElsaUsageLog extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ElsaUsageLog';

    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public Quantity: number;
    public DateLogged: Date;
    public CreatedAt: Date;
    public ExternalReference: string;
    public Deleted: boolean;
    public ProductType: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class AccessPointFormat extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AccessPointFormat';

    public IncommingID: number;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public OutgoingID: number;
    public ResourceName: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public Name: string;
    public Label: string;
    public StatusCode: number;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class EHFLog extends UniEntity {
    public static RelativeUrl = 'ehf';
    public static EntityType = 'EHFLog';

    public EntityDisplayValue: string;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public DistributeAt: LocalDate;
    public From: string;
    public ExternalMessage: string;
    public To: string;
    public CreatedAt: Date;
    public Type: SharingType;
    public ExternalReference: string;
    public Deleted: boolean;
    public EntityType: string;
    public JobRunID: number;
    public Subject: string;
    public JobRunExternalRef: string;
    public StatusCode: number;
    public EntityID: number;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Department extends UniEntity {
    public static RelativeUrl = 'departments';
    public static EntityType = 'Department';

    public Description: string;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public DepartmentManagerName: string;
    public DepartmentNumber: string;
    public CreatedAt: Date;
    public DepartmentNumberNumeric: number;
    public Deleted: boolean;
    public Name: string;
    public StatusCode: number;
    public CreatedBy: string;
    public DepartmentNumberSeriesID: number;
    public _createguid: string;
    public DepartmentNumberSeries: NumberSeries;
    public CustomFields: any;
}


export class Dimension10 extends UniEntity {
    public static RelativeUrl = 'Dimension10';
    public static EntityType = 'Dimension10';

    public Description: string;
    public NumberNumeric: number;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public Name: string;
    public StatusCode: number;
    public Number: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Dimension5 extends UniEntity {
    public static RelativeUrl = 'Dimension5';
    public static EntityType = 'Dimension5';

    public Description: string;
    public NumberNumeric: number;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public Name: string;
    public StatusCode: number;
    public Number: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Dimension6 extends UniEntity {
    public static RelativeUrl = 'Dimension6';
    public static EntityType = 'Dimension6';

    public Description: string;
    public NumberNumeric: number;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public Name: string;
    public StatusCode: number;
    public Number: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Dimension7 extends UniEntity {
    public static RelativeUrl = 'Dimension7';
    public static EntityType = 'Dimension7';

    public Description: string;
    public NumberNumeric: number;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public Name: string;
    public StatusCode: number;
    public Number: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Dimension8 extends UniEntity {
    public static RelativeUrl = 'Dimension8';
    public static EntityType = 'Dimension8';

    public Description: string;
    public NumberNumeric: number;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public Name: string;
    public StatusCode: number;
    public Number: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Dimension9 extends UniEntity {
    public static RelativeUrl = 'Dimension9';
    public static EntityType = 'Dimension9';

    public Description: string;
    public NumberNumeric: number;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public Name: string;
    public StatusCode: number;
    public Number: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Dimensions extends UniEntity {
    public static RelativeUrl = 'dimensions';
    public static EntityType = 'Dimensions';

    public DepartmentID: number;
    public Dimension7ID: number;
    public ProjectTaskID: number;
    public Dimension6ID: number;
    public Dimension5ID: number;
    public ID: number;
    public RegionID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public ProjectID: number;
    public Dimension9ID: number;
    public ResponsibleID: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public Dimension8ID: number;
    public StatusCode: number;
    public Dimension10ID: number;
    public CreatedBy: string;
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
    public Dimension9Number: string;
    public ID: number;
    public Dimension5Name: string;
    public DimensionsID: number;
    public DepartmentName: string;
    public ProjectTaskNumber: string;
    public Dimension5Number: string;
    public ProjectName: string;
    public RegionCode: string;
    public Dimension6Number: string;
    public Dimension10Number: string;
    public Dimension7Number: string;
    public DepartmentNumber: string;
    public ProjectNumber: string;
    public ResponsibleName: string;
    public Dimension6Name: string;
    public Dimension8Name: string;
    public Dimension10Name: string;
    public Dimension7Name: string;
    public Dimension8Number: string;
    public ProjectTaskName: string;
    public RegionName: string;
    public Dimension9Name: string;
}


export class DimensionSettings extends UniEntity {
    public static RelativeUrl = 'dimensionsettings';
    public static EntityType = 'DimensionSettings';

    public IsActive: boolean;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public Dimension: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public Label: string;
    public StatusCode: number;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Region extends UniEntity {
    public static RelativeUrl = 'regions';
    public static EntityType = 'Region';

    public Description: string;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public RegionCode: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public Name: string;
    public CountryCode: string;
    public StatusCode: number;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Responsible extends UniEntity {
    public static RelativeUrl = 'responsibles';
    public static EntityType = 'Responsible';

    public Description: string;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public NameOfResponsible: string;
    public Name: string;
    public StatusCode: number;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Contract extends UniEntity {
    public static RelativeUrl = 'contracts';
    public static EntityType = 'Contract';

    public Hash: string;
    public Description: string;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public ContractCode: string;
    public Engine: ContractEngine;
    public CreatedAt: Date;
    public Deleted: boolean;
    public HashTransactionAddress: string;
    public Name: string;
    public StatusCode: number;
    public TeamsUri: string;
    public CreatedBy: string;
    public _createguid: string;
    public Parameters: Array<ContractParameter>;
    public Triggers: Array<ContractTrigger>;
    public RunLogs: Array<ContractRunLog>;
    public CustomFields: any;
}


export class ContractAddress extends UniEntity {
    public static RelativeUrl = 'contractaddresses';
    public static EntityType = 'ContractAddress';

    public ContractID: number;
    public ID: number;
    public AssetAddress: string;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public ContractAssetID: number;
    public CreatedAt: Date;
    public Type: AddressType;
    public Deleted: boolean;
    public Amount: number;
    public EntityType: string;
    public Address: string;
    public StatusCode: number;
    public EntityID: number;
    public CreatedBy: string;
    public _createguid: string;
    public Contract: Contract;
    public ContractAsset: ContractAsset;
    public CustomFields: any;
}


export class ContractAsset extends UniEntity {
    public static RelativeUrl = 'contractassets';
    public static EntityType = 'ContractAsset';

    public ContractID: number;
    public IsTransferrable: boolean;
    public Cap: number;
    public ID: number;
    public IsFixedDenominations: boolean;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public IsAutoDestroy: boolean;
    public SpenderAttested: boolean;
    public CreatedAt: Date;
    public Type: AddressType;
    public Deleted: boolean;
    public IsIssuedByDefinerOnly: boolean;
    public IsPrivate: boolean;
    public IsCosignedByDefiner: boolean;
    public StatusCode: number;
    public CreatedBy: string;
    public _createguid: string;
    public Contract: Contract;
    public CustomFields: any;
}


export class ContractDebugLog extends UniEntity {
    public static RelativeUrl = 'contractdebuglogs';
    public static EntityType = 'ContractDebugLog';

    public ContractID: number;
    public ID: number;
    public UpdatedBy: string;
    public Message: string;
    public UpdatedAt: Date;
    public ContractRunLogID: number;
    public CreatedAt: Date;
    public Type: ContractEventType;
    public Deleted: boolean;
    public StatusCode: number;
    public CreatedBy: string;
    public _createguid: string;
    public Contract: Contract;
    public ContractRunLog: ContractRunLog;
    public CustomFields: any;
}


export class ContractParameter extends UniEntity {
    public static RelativeUrl = 'contractparameters';
    public static EntityType = 'ContractParameter';

    public ContractID: number;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public Value: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public Name: string;
    public StatusCode: number;
    public CreatedBy: string;
    public _createguid: string;
    public Contract: Contract;
    public CustomFields: any;
}


export class ContractRunLog extends UniEntity {
    public static RelativeUrl = 'contractrunlogs';
    public static EntityType = 'ContractRunLog';

    public ContractID: number;
    public ID: number;
    public RunTime: string;
    public UpdatedBy: string;
    public Message: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Type: ContractEventType;
    public Deleted: boolean;
    public ContractTriggerID: number;
    public StatusCode: number;
    public CreatedBy: string;
    public _createguid: string;
    public Contract: Contract;
    public CustomFields: any;
}


export class ContractTransaction extends UniEntity {
    public static RelativeUrl = 'contracttransactions';
    public static EntityType = 'ContractTransaction';

    public ContractID: number;
    public ID: number;
    public AssetAddress: string;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public ContractAddressID: number;
    public ReceiverAddress: string;
    public CreatedAt: Date;
    public SenderAddress: string;
    public Deleted: boolean;
    public Amount: number;
    public StatusCode: number;
    public CreatedBy: string;
    public _createguid: string;
    public Contract: Contract;
    public ContractAddress: ContractAddress;
    public CustomFields: any;
}


export class ContractTrigger extends UniEntity {
    public static RelativeUrl = 'contracttriggers';
    public static EntityType = 'ContractTrigger';

    public ContractID: number;
    public ModelFilter: string;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public OperationFilter: string;
    public ExpressionFilter: string;
    public CreatedAt: Date;
    public Type: ContractEventType;
    public Deleted: boolean;
    public StatusCode: number;
    public CreatedBy: string;
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
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public EntityType: string;
    public StatusCode: number;
    public Text: string;
    public EntityID: number;
    public CreatedBy: string;
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
    public UpdatedAt: Date;
    public UserID: number;
    public CommentID: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public StatusCode: number;
    public CreatedBy: string;
    public _createguid: string;
    public User: User;
    public CustomFields: any;
}


export class ApiKey extends UniEntity {
    public static RelativeUrl = 'apikeys';
    public static EntityType = 'ApiKey';

    public IntegrationKey: string;
    public Description: string;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public ExternalId: string;
    public Encrypt: boolean;
    public IntegrationType: TypeOfIntegration;
    public Url: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public FilterDate: LocalDate;
    public StatusCode: number;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Altinn extends UniEntity {
    public static RelativeUrl = 'altinn';
    public static EntityType = 'Altinn';

    public ID: number;
    public Language: string;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public SystemID: string;
    public SystemPw: string;
    public StatusCode: number;
    public PreferredLogin: TypeOfLogin;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class AltinnReceipt extends UniEntity {
    public static RelativeUrl = 'altinnreceipts';
    public static EntityType = 'AltinnReceipt';

    public TimeStamp: Date;
    public ReceiptID: number;
    public ID: number;
    public HasBeenRegistered: boolean;
    public XmlReceipt: string;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public ErrorText: string;
    public UserSign: string;
    public Form: string;
    public AltinnResponseData: string;
    public StatusCode: number;
    public CreatedBy: string;
    public _createguid: string;
    public Signings: Array<AltinnSigning>;
    public CustomFields: any;
}


export class AltinnSigning extends UniEntity {
    public static RelativeUrl = 'altinnsigning';
    public static EntityType = 'AltinnSigning';

    public SignatureText: string;
    public ID: number;
    public StatusText: string;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public AltinnReceiptID: number;
    public SignatureReference: string;
    public StatusCode: number;
    public DateSigned: Date;
    public CreatedBy: string;
    public _createguid: string;
    public AltinnReceipt: AltinnReceipt;
    public CustomFields: any;
}


export class Barnepass extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Barnepass';

    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public inntektsaar: number;
    public StatusCode: number;
    public CreatedBy: string;
    public _createguid: string;
    public oppgave: Array<BarnepassOppgave>;
    public CustomFields: any;
}


export class BarnepassOppgave extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'BarnepassOppgave';

    public ID: number;
    public navn: string;
    public UpdatedBy: string;
    public paaloeptBeloep: number;
    public UpdatedAt: Date;
    public BarnepassID: number;
    public foedselsnummer: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public email: string;
    public StatusCode: number;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class UserRole extends UniEntity {
    public static RelativeUrl = 'userroles';
    public static EntityType = 'UserRole';

    public ID: number;
    public SharedRoleId: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public UserID: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public SharedRoleName: string;
    public CreatedBy: string;
    public _createguid: string;
    public User: User;
    public CustomFields: any;
}


export class Role extends UniEntity {
    public static RelativeUrl = 'roles';
    public static EntityType = 'Role';

    public Description: string;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public Name: string;
    public Label: string;
    public CreatedBy: string;
    public _createguid: string;
    public RolePermissions: Array<RolePermission>;
    public CustomFields: any;
}


export class RolePermission extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'RolePermission';

    public ID: number;
    public UpdatedBy: string;
    public PermissionID: number;
    public UpdatedAt: Date;
    public RoleID: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public CreatedBy: string;
    public _createguid: string;
    public Role: Role;
    public Permission: Permission;
    public CustomFields: any;
}


export class Permission extends UniEntity {
    public static RelativeUrl = 'permissions';
    public static EntityType = 'Permission';

    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public Name: string;
    public CreatedBy: string;
    public _createguid: string;
    public RolePermissions: Array<RolePermission>;
    public CustomFields: any;
}


export class ApiMessage extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ApiMessage';

    public ID: number;
    public UpdatedBy: string;
    public Message: string;
    public UpdatedAt: Date;
    public Service: string;
    public CreatedAt: Date;
    public Type: ApiMessageType;
    public FromDate: Date;
    public Deleted: boolean;
    public ToDate: Date;
    public StatusCode: number;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class AvtaleGiroAgreement extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AvtaleGiroAgreement';

    public DataSender: string;
    public KeyPath: string;
    public Description: string;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public Thumbprint: string;
    public CreatedAt: Date;
    public NextNumber: number;
    public Deleted: boolean;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class AvtaleGiroBankAccount extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AvtaleGiroBankAccount';

    public CompanyID: number;
    public AvtaleGiroAgreementID: number;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public BankAccountNumber: string;
    public CreatedBy: string;
    public _createguid: string;
    public Company: Company;
    public CustomFields: any;
}


export class AvtaleGiroFile extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AvtaleGiroFile';

    public CompanyID: number;
    public AvtaleGiroAgreementID: number;
    public ID: number;
    public AvtaleGiroContent: string;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public AvtaleGiroMergedFileID: number;
    public CreatedBy: string;
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
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public TransmissionNumber: number;
    public Deleted: boolean;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class BankAgreement extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'BankAgreement';

    public ReceiptID: string;
    public CompanyID: number;
    public ID: number;
    public UpdatedBy: string;
    public OrderName: string;
    public UpdatedAt: Date;
    public OrderEmail: string;
    public AccountOwnerName: string;
    public ReceiptDate: Date;
    public CustomerName: string;
    public OrderMobile: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public ServiceAccountID: number;
    public ServiceID: string;
    public CustomerOrgNumber: string;
    public AccountOwnerOrgNumber: string;
    public CreatedBy: string;
    public _createguid: string;
    public ServiceAccount: ServiceAccount;
    public Company: Company;
    public Services: Array<BankService>;
    public CustomFields: any;
}


export class BankService extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'BankService';

    public DivisionID: number;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public BankAgreementID: number;
    public KidRule: string;
    public CreatedAt: Date;
    public FileType: string;
    public Deleted: boolean;
    public ConfirmInNetbank: boolean;
    public DivisionName: string;
    public ServiceType: number;
    public CreatedBy: string;
    public _createguid: string;
    public BankAgreement: BankAgreement;
    public BankAccounts: Array<BankServiceBankAccount>;
    public CustomFields: any;
}


export class BankServiceBankAccount extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'BankServiceBankAccount';

    public BankServiceID: number;
    public AccountNumber: string;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public CreatedBy: string;
    public _createguid: string;
    public BankService: BankService;
    public CustomFields: any;
}


export class Company extends UniEntity {
    public static RelativeUrl = 'companies';
    public static EntityType = 'Company';

    public FileFlowEmail: string;
    public LastActivity: Date;
    public ID: number;
    public UpdatedBy: string;
    public IsTemplate: boolean;
    public ClientNumber: number;
    public UpdatedAt: Date;
    public WebHookSubscriberId: string;
    public MigrationVersion: string;
    public ConnectionString: string;
    public FileFlowOrgnrEmail: string;
    public SchemaName: string;
    public IsGlobalTemplate: boolean;
    public CreatedAt: Date;
    public Deleted: boolean;
    public OrganizationNumber: string;
    public Name: string;
    public Key: string;
    public IsTest: boolean;
    public StatusCode: CompanyStatusCode;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class CompanyAccess extends UniEntity {
    public static RelativeUrl = 'companies-access';
    public static EntityType = 'CompanyAccess';

    public EndDate: Date;
    public CompanyID: number;
    public Roles: string;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public GlobalIdentity: string;
    public StartDate: Date;
    public StatusCode: number;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class CompanyBackup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'CompanyBackup';

    public ContractID: number;
    public ContainerName: string;
    public ContractType: number;
    public ID: number;
    public UpdatedBy: string;
    public Message: string;
    public DeletedAt: Date;
    public CompanyName: string;
    public UpdatedAt: Date;
    public CustomerName: string;
    public SchemaName: string;
    public Environment: string;
    public BackupStatus: BackupStatus;
    public CompanyKey: string;
    public OrgNumber: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public Reason: string;
    public CopyFiles: boolean;
    public ScheduledForDeleteAt: Date;
    public CloudBlobName: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class ContractCron extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ContractCron';

    public ContractID: number;
    public CompanyID: number;
    public Expression: string;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public ContractTriggerID: number;
    public CreatedBy: string;
    public CompanyDbName: string;
    public CompanyKey: string;
    public _createguid: string;
    public CustomFields: any;
}


export class ContractObyte extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ContractObyte';

    public ContractID: number;
    public CompanyID: number;
    public ID: number;
    public AssetAddress: string;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public ContractAddressID: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public Address: string;
    public CreatedBy: string;
    public CompanyDbName: string;
    public CompanyKey: string;
    public _createguid: string;
    public CustomFields: any;
}


export class DeniedUserAccessLog extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'DeniedUserAccessLog';

    public CompanyID: number;
    public ID: number;
    public UpdatedBy: string;
    public Message: string;
    public CompanyName: string;
    public UpdatedAt: Date;
    public Occurred: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public Email: string;
    public Username: string;
    public CreatedBy: string;
    public _createguid: string;
    public Company: Company;
    public CustomFields: any;
}


export class FailedBankFile extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'FailedBankFile';

    public FailedReason: FailedReasonEnum;
    public ID: number;
    public UpdatedBy: string;
    public FileName: string;
    public UpdatedAt: Date;
    public FileContent: string;
    public CompanyKey: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class HangfireJob extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'HangfireJob';

    public CompanyID: number;
    public Status: number;
    public ID: number;
    public Year: number;
    public UpdatedAt: Date;
    public JobId: string;
    public HasError: boolean;
    public CompanyKey: string;
    public CreatedAt: Date;
    public GlobalIdentity: string;
    public Completed: boolean;
    public CustomFields: any;
}


export class HangfireJobContext extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'HangfireJobContext';

    public CompanyID: number;
    public Status: number;
    public ID: number;
    public Year: number;
    public UpdatedAt: Date;
    public JobId: string;
    public SchemaName: string;
    public HasError: boolean;
    public CompanyKey: string;
    public CreatedAt: Date;
    public GlobalIdentity: string;
    public Completed: boolean;
    public CustomFields: any;
}


export class HangfireResponse extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'HangfireResponse';

    public CompanyID: number;
    public Status: number;
    public State: string;
    public ID: number;
    public Year: number;
    public UpdatedAt: Date;
    public JobId: string;
    public HasError: boolean;
    public CompanyKey: string;
    public CreatedAt: Date;
    public ProgressUrl: string;
    public GlobalIdentity: string;
    public Completed: boolean;
    public CustomFields: any;
}


export class KpiDefinition extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'KpiDefinition';

    public CompanyID: number;
    public RoleNames: string;
    public RefreshModels: string;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public ValueType: KpiValueType;
    public CreatedAt: Date;
    public Interval: string;
    public Deleted: boolean;
    public IsPerUser: boolean;
    public Name: string;
    public SourceType: KpiSourceType;
    public Application: string;
    public Route: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class KpiValue extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'KpiValue';

    public CompanyID: number;
    public KpiName: string;
    public ID: number;
    public UpdatedBy: string;
    public Total: number;
    public UpdatedAt: Date;
    public ValueStatus: KpiValueStatus;
    public Counter: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public LastUpdated: Date;
    public UserIdentity: string;
    public KpiDefinitionID: number;
    public Text: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class OutgoingInvoice extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'OutgoingInvoice';

    public RecipientPhoneNumber: string;
    public CompanyID: number;
    public Status: number;
    public InvoiceType: OutgoingInvoiceType;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public ISPOrganizationNumber: string;
    public CreatedAt: Date;
    public InvoiceID: number;
    public ExternalReference: string;
    public RecipientOrganizationNumber: string;
    public Deleted: boolean;
    public Amount: number;
    public MetaJson: string;
    public DueDate: Date;
    public StatusCode: number;
    public CreatedBy: string;
    public _createguid: string;
    public Company: Company;
    public CustomFields: any;
}


export class ProcessFileLog extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ProcessFileLog';

    public EntityCount: number;
    public CompanyID: number;
    public ID: number;
    public UpdatedBy: string;
    public Message: string;
    public CompanyName: string;
    public FileName: string;
    public UpdatedAt: Date;
    public EntityInstanceID: string;
    public CompanyKey: string;
    public CreatedAt: Date;
    public FileType: number;
    public Deleted: boolean;
    public EntityName: string;
    public UserIdentity: string;
    public StatusCode: number;
    public CreatedBy: string;
    public FileID: number;
    public _createguid: string;
    public Company: Company;
    public CustomFields: any;
}


export class ServiceAccount extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ServiceAccount';

    public DataSender: string;
    public KeyPath: string;
    public Description: string;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public Thumbprint: string;
    public CreatedAt: Date;
    public NextNumber: number;
    public Deleted: boolean;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class UserVerification extends UniEntity {
    public static RelativeUrl = 'user-verifications';
    public static EntityType = 'UserVerification';

    public CompanyId: number;
    public ID: number;
    public UpdatedBy: string;
    public DisplayName: string;
    public RequestOrigin: UserVerificationRequestOrigin;
    public UpdatedAt: Date;
    public UserId: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public Email: string;
    public UserType: UserVerificationUserType;
    public VerificationDate: Date;
    public ExpirationDate: Date;
    public VerificationCode: string;
    public StatusCode: number;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Account extends UniEntity {
    public static RelativeUrl = 'accounts';
    public static EntityType = 'Account';

    public AccountName: string;
    public Description: string;
    public AccountNumber: number;
    public ID: number;
    public DimensionsID: number;
    public CustomerID: number;
    public CurrencyCodeID: number;
    public AccountID: number;
    public UseVatDeductionGroupID: number;
    public UpdatedBy: string;
    public UsePostPost: boolean;
    public AccountSetupID: number;
    public Keywords: string;
    public UpdatedAt: Date;
    public EmployeeID: number;
    public SaftMappingAccountID: number;
    public CreatedAt: Date;
    public AccountGroupID: number;
    public VatTypeID: number;
    public Deleted: boolean;
    public Visible: boolean;
    public TopLevelAccountGroupID: number;
    public Active: boolean;
    public DoSynchronize: boolean;
    public Locked: boolean;
    public SystemAccount: boolean;
    public SupplierID: number;
    public StatusCode: number;
    public LockManualPosts: boolean;
    public CreatedBy: string;
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

    public ID: number;
    public AccountID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public Name: string;
    public StatusCode: number;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class AccountGroup extends UniEntity {
    public static RelativeUrl = 'accountgroups';
    public static EntityType = 'AccountGroup';

    public AccountGroupSetupID: number;
    public Summable: boolean;
    public ID: number;
    public AccountID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public CompatibleAccountID: number;
    public CreatedAt: Date;
    public MainGroupID: number;
    public Deleted: boolean;
    public GroupNumber: string;
    public Name: string;
    public StatusCode: number;
    public CreatedBy: string;
    public AccountGroupSetID: number;
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
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public System: boolean;
    public CreatedAt: Date;
    public ToAccountNumber: number;
    public Deleted: boolean;
    public Name: string;
    public SubAccountAllowed: boolean;
    public StatusCode: number;
    public CreatedBy: string;
    public FromAccountNumber: number;
    public _createguid: string;
    public CustomFields: any;
}


export class AccountMandatoryDimension extends UniEntity {
    public static RelativeUrl = 'accountmandatorydimension';
    public static EntityType = 'AccountMandatoryDimension';

    public MandatoryType: number;
    public ID: number;
    public AccountID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public DimensionNo: number;
    public StatusCode: number;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Accrual extends UniEntity {
    public static RelativeUrl = 'accruals';
    public static EntityType = 'Accrual';

    public BalanceAccountID: number;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public ResultAccountID: number;
    public AccrualJournalEntryMode: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public AccrualAmount: number;
    public StatusCode: number;
    public CreatedBy: string;
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

    public PeriodNo: number;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public AccountYear: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public Amount: number;
    public JournalEntryDraftLineID: number;
    public AccrualID: number;
    public StatusCode: number;
    public CreatedBy: string;
    public _createguid: string;
    public Accrual: Accrual;
    public JournalEntryLineDraft: JournalEntryLineDraft;
    public CustomFields: any;
}


export class ApprovalData extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ApprovalData';

    public EntityCount: number;
    public ID: number;
    public VerificationMethod: string;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public EntityReference: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public EntityName: string;
    public EntityHash: string;
    public VerificationReference: string;
    public EntityID: number;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Asset extends UniEntity {
    public static RelativeUrl = 'assets';
    public static EntityType = 'Asset';

    public BalanceAccountID: number;
    public ID: number;
    public DimensionsID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public AutoDepreciation: boolean;
    public AssetGroupCode: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public PurchaseAmount: number;
    public NetFinancialValue: number;
    public ScrapValue: number;
    public Name: string;
    public DepreciationCycle: number;
    public DepreciationStartDate: LocalDate;
    public DepreciationAccountID: number;
    public Lifetime: number;
    public PurchaseDate: LocalDate;
    public StatusCode: number;
    public CreatedBy: string;
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

    public ID: number;
    public UpdatedBy: string;
    public Web: string;
    public UpdatedAt: Date;
    public EmailID: number;
    public AddressID: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public PhoneID: number;
    public Name: string;
    public InitialBIC: string;
    public StatusCode: number;
    public BIC: string;
    public CreatedBy: string;
    public _createguid: string;
    public Address: Address;
    public Phone: Phone;
    public Email: Email;
    public CustomFields: any;
}


export class BankAccount extends UniEntity {
    public static RelativeUrl = 'bankaccounts';
    public static EntityType = 'BankAccount';

    public BankAccountType: string;
    public BankID: number;
    public AccountNumber: string;
    public ID: number;
    public AccountID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public CompanySettingsID: number;
    public IBAN: string;
    public CreatedAt: Date;
    public BusinessRelationID: number;
    public IntegrationSettings: string;
    public Deleted: boolean;
    public IntegrationStatus: number;
    public Locked: boolean;
    public Label: string;
    public StatusCode: number;
    public CreatedBy: string;
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

    public PreApprovedBankPayments: PreApprovedBankPayments;
    public ID: number;
    public UpdatedBy: string;
    public BankAcceptance: boolean;
    public IsBankBalance: boolean;
    public UpdatedAt: Date;
    public BankAccountID: number;
    public IsInbound: boolean;
    public DefaultAgreement: boolean;
    public IsOutgoing: boolean;
    public PropertiesJson: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public Email: string;
    public HasNewAccountInformation: boolean;
    public HasOrderedIntegrationChange: boolean;
    public Name: string;
    public ServiceID: string;
    public ServiceProvider: number;
    public ServiceTemplateID: string;
    public StatusCode: number;
    public CreatedBy: string;
    public Password: string;
    public _createguid: string;
    public BankAccount: BankAccount;
    public CustomFields: any;
}


export class BankRule extends UniEntity {
    public static RelativeUrl = 'bankrules';
    public static EntityType = 'BankRule';

    public IsActive: boolean;
    public ID: number;
    public AccountID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public Priority: number;
    public Rule: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public Name: string;
    public ActionCode: ActionCodeBankRule;
    public StatusCode: number;
    public CreatedBy: string;
    public _createguid: string;
    public Account: Account;
    public CustomFields: any;
}


export class BankStatement extends UniEntity {
    public static RelativeUrl = 'bankstatements';
    public static EntityType = 'BankStatement';

    public ID: number;
    public EndBalance: number;
    public AccountID: number;
    public UpdatedBy: string;
    public AmountCurrency: number;
    public UpdatedAt: Date;
    public BankAccountID: number;
    public CurrencyCode: string;
    public CreatedAt: Date;
    public FromDate: LocalDate;
    public Deleted: boolean;
    public Amount: number;
    public ArchiveReference: string;
    public ToDate: LocalDate;
    public StartBalance: number;
    public StatusCode: number;
    public CreatedBy: string;
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

    public SenderName: string;
    public Description: string;
    public StructuredReference: string;
    public BookingDate: LocalDate;
    public ID: number;
    public ValueDate: LocalDate;
    public OpenAmountCurrency: number;
    public UpdatedBy: string;
    public AmountCurrency: number;
    public UpdatedAt: Date;
    public BankStatementID: number;
    public Category: string;
    public TransactionId: string;
    public InvoiceNumber: string;
    public ReceiverAccount: string;
    public CurrencyCode: string;
    public CreatedAt: Date;
    public CID: string;
    public Deleted: boolean;
    public OpenAmount: number;
    public Amount: number;
    public ArchiveReference: string;
    public Receivername: string;
    public SenderAccount: string;
    public StatusCode: number;
    public CreatedBy: string;
    public _createguid: string;
    public BankStatement: BankStatement;
    public CustomFields: any;
}


export class BankStatementMatch extends UniEntity {
    public static RelativeUrl = 'bankstatementmatch';
    public static EntityType = 'BankStatementMatch';

    public BankStatementEntryID: number;
    public ID: number;
    public UpdatedBy: string;
    public JournalEntryLineID: number;
    public UpdatedAt: Date;
    public Group: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public Amount: number;
    public Batch: string;
    public StatusCode: number;
    public CreatedBy: string;
    public _createguid: string;
    public BankStatementEntry: BankStatementEntry;
    public JournalEntryLine: JournalEntryLine;
    public CustomFields: any;
}


export class BankStatementRule extends UniEntity {
    public static RelativeUrl = 'bankstatementrules';
    public static EntityType = 'BankStatementRule';

    public IsActive: boolean;
    public EntryText: string;
    public ID: number;
    public DimensionsID: number;
    public AccountID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public Priority: number;
    public Rule: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public Name: string;
    public StatusCode: number;
    public CreatedBy: string;
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
    public UpdatedAt: Date;
    public AccountingYear: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public Name: string;
    public StatusCode: number;
    public CreatedBy: string;
    public _createguid: string;
    public Entries: Array<BudgetEntry>;
    public CustomFields: any;
}


export class BudgetEntry extends UniEntity {
    public static RelativeUrl = 'budgetentries';
    public static EntityType = 'BudgetEntry';

    public ID: number;
    public DimensionsID: number;
    public AccountID: number;
    public UpdatedBy: string;
    public PeriodNumber: number;
    public UpdatedAt: Date;
    public BudgetID: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public Amount: number;
    public StatusCode: number;
    public CreatedBy: string;
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
    public AssetSaleLossNoVatAccountID: number;
    public AssetSaleLossBalancingAccountID: number;
    public ID: number;
    public ReInvoicingTurnoverProductID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public AssetSaleLossVatAccountID: number;
    public AssetSaleProfitNoVatAccountID: number;
    public ReInvoicingCostsharingProductID: number;
    public CreatedAt: Date;
    public AssetSaleProfitVatAccountID: number;
    public ReInvoicingMethod: number;
    public Deleted: boolean;
    public AssetSaleProfitBalancingAccountID: number;
    public AssetWriteoffAccountID: number;
    public StatusCode: number;
    public CreatedBy: string;
    public _createguid: string;
    public ReInvoicingCostsharingProduct: Product;
    public ReInvoicingTurnoverProduct: Product;
    public CustomFields: any;
}


export class CompanyBankAccount extends UniEntity {
    public static RelativeUrl = 'companybankaccounts';
    public static EntityType = 'CompanyBankAccount';

    public IsTax: boolean;
    public ID: number;
    public AccountID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public IsSalary: boolean;
    public BankAccountID: number;
    public IsOutgoing: boolean;
    public CreatedAt: Date;
    public CreditAmount: number;
    public Deleted: boolean;
    public Name: string;
    public StatusCode: number;
    public IsIncomming: boolean;
    public CreatedBy: string;
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
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public Name: string;
    public StatusCode: number;
    public CreatedBy: string;
    public _createguid: string;
    public Items: Array<CostAllocationItem>;
    public CustomFields: any;
}


export class CostAllocationItem extends UniEntity {
    public static RelativeUrl = 'costallocationitems';
    public static EntityType = 'CostAllocationItem';

    public Description: string;
    public ID: number;
    public DimensionsID: number;
    public AccountID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public Percent: number;
    public CreatedAt: Date;
    public VatTypeID: number;
    public Deleted: boolean;
    public Amount: number;
    public StatusCode: number;
    public CreatedBy: string;
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

    public EndDate: LocalDate;
    public Description: string;
    public ID: number;
    public CurrencyCodeID: number;
    public UpdatedBy: string;
    public AmountCurrency: number;
    public UpdatedAt: Date;
    public IsCustomerPayment: boolean;
    public CreatedAt: Date;
    public Deleted: boolean;
    public Amount: number;
    public DueDate: LocalDate;
    public CustomLiquidityPaymentType: CustomLiquidityPaymentInterval;
    public StatusCode: number;
    public CreatedBy: string;
    public _createguid: string;
    public currency: CurrencyCode;
    public CustomFields: any;
}


export class DepreciationLine extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'DepreciationLine';

    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public DepreciationJELineID: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public AssetID: number;
    public AssetJELineID: number;
    public DepreciationType: number;
    public StatusCode: number;
    public CreatedBy: string;
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
    public UpdatedAt: Date;
    public ValidTo: LocalDate;
    public CreatedAt: Date;
    public Deleted: boolean;
    public ValidFrom: LocalDate;
    public StatusCode: number;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class JournalEntry extends UniEntity {
    public static RelativeUrl = 'journalentries';
    public static EntityType = 'JournalEntry';

    public NumberSeriesID: number;
    public JournalEntryNumber: string;
    public Description: string;
    public JournalEntryAccrualID: number;
    public NumberSeriesTaskID: number;
    public ID: number;
    public UpdatedBy: string;
    public FinancialYearID: number;
    public UpdatedAt: Date;
    public JournalEntryNumberNumeric: number;
    public JournalEntryDraftGroup: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public StatusCode: number;
    public CreatedBy: string;
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

    public VatReportID: number;
    public JournalEntryNumber: string;
    public Signature: string;
    public SubAccountID: number;
    public OriginalJournalEntryPost: number;
    public CustomerInvoiceID: number;
    public TaxBasisAmountCurrency: number;
    public Description: string;
    public ReferenceOriginalPostID: number;
    public ID: number;
    public DimensionsID: number;
    public CurrencyCodeID: number;
    public PaymentID: string;
    public AccountID: number;
    public PaymentReferenceID: number;
    public UpdatedBy: string;
    public VatJournalEntryPostID: number;
    public AmountCurrency: number;
    public UpdatedAt: Date;
    public FinancialDate: LocalDate;
    public JournalEntryID: number;
    public CustomerOrderID: number;
    public OriginalReferencePostID: number;
    public ReferenceCreditPostID: number;
    public PostPostJournalEntryLineID: number;
    public JournalEntryTypeID: number;
    public JournalEntryNumberNumeric: number;
    public RegisteredDate: LocalDate;
    public InvoiceNumber: string;
    public VatPercent: number;
    public CurrencyExchangeRate: number;
    public CreatedAt: Date;
    public PeriodID: number;
    public PaymentInfoTypeID: number;
    public VatTypeID: number;
    public Deleted: boolean;
    public RestAmountCurrency: number;
    public VatDate: LocalDate;
    public Amount: number;
    public RestAmount: number;
    public TaxBasisAmount: number;
    public BatchNumber: number;
    public DueDate: LocalDate;
    public SupplierInvoiceID: number;
    public AccrualID: number;
    public StatusCode: number;
    public VatDeductionPercent: number;
    public VatPeriodID: number;
    public CreatedBy: string;
    public JournalEntryLineDraftID: number;
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

    public JournalEntryNumber: string;
    public Signature: string;
    public SubAccountID: number;
    public CustomerInvoiceID: number;
    public TaxBasisAmountCurrency: number;
    public Description: string;
    public ID: number;
    public DimensionsID: number;
    public CurrencyCodeID: number;
    public PaymentID: string;
    public AccountID: number;
    public PaymentReferenceID: number;
    public UpdatedBy: string;
    public AmountCurrency: number;
    public UpdatedAt: Date;
    public FinancialDate: LocalDate;
    public JournalEntryID: number;
    public CustomerOrderID: number;
    public PostPostJournalEntryLineID: number;
    public JournalEntryTypeID: number;
    public JournalEntryNumberNumeric: number;
    public RegisteredDate: LocalDate;
    public InvoiceNumber: string;
    public VatPercent: number;
    public CurrencyExchangeRate: number;
    public CreatedAt: Date;
    public PeriodID: number;
    public PaymentInfoTypeID: number;
    public VatTypeID: number;
    public Deleted: boolean;
    public VatDate: LocalDate;
    public Amount: number;
    public TaxBasisAmount: number;
    public BatchNumber: number;
    public DueDate: LocalDate;
    public SupplierInvoiceID: number;
    public AccrualID: number;
    public StatusCode: number;
    public VatDeductionPercent: number;
    public VatPeriodID: number;
    public CreatedBy: string;
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

    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public ColumnSetUp: string;
    public TraceLinkTypes: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public Name: string;
    public VisibleModules: string;
    public StatusCode: number;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class JournalEntrySourceSerie extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'JournalEntrySourceSerie';

    public JournalEntrySourceID: number;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public StatusCode: number;
    public CreatedBy: string;
    public JournalEntrySourceEntityName: string;
    public JournalEntrySourceInstanceID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class JournalEntryType extends UniEntity {
    public static RelativeUrl = 'journalentrytypes';
    public static EntityType = 'JournalEntryType';

    public MainName: string;
    public ID: number;
    public ExpectNegativeAmount: boolean;
    public UpdatedBy: string;
    public DisplayName: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public Name: string;
    public Number: number;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class LedgerSuggestion extends UniEntity {
    public ID: number;
    public BusinessType: string;
    public IndustryCode: string;
    public OrgNumber: string;
    public Name: string;
    public Source: SuggestionSource;
    public IndustryName: string;
}


export class Payment extends UniEntity {
    public static RelativeUrl = 'payments';
    public static EntityType = 'Payment';

    public CustomerInvoiceID: number;
    public Description: string;
    public OcrPaymentStrings: string;
    public Proprietary: string;
    public ID: number;
    public StatusText: string;
    public CurrencyCodeID: number;
    public PaymentID: string;
    public UpdatedBy: string;
    public AmountCurrency: number;
    public IsExternal: boolean;
    public UpdatedAt: Date;
    public JournalEntryID: number;
    public InPaymentID: string;
    public IsPaymentCancellationRequest: boolean;
    public SerialNumberOrAcctSvcrRef: string;
    public InvoiceNumber: string;
    public IsCustomerPayment: boolean;
    public PaymentNotificationReportFileID: number;
    public ToBankAccountID: number;
    public PaymentCodeID: number;
    public ReconcilePayment: boolean;
    public PaymentBatchID: number;
    public CurrencyExchangeRate: number;
    public CreatedAt: Date;
    public BusinessRelationID: number;
    public AutoJournal: boolean;
    public Domain: string;
    public Deleted: boolean;
    public CustomerInvoiceReminderID: number;
    public BankChargeAmount: number;
    public PaymentDate: LocalDate;
    public Amount: number;
    public IsPaymentClaim: boolean;
    public XmlTagPmtInfIdReference: string;
    public DueDate: LocalDate;
    public SupplierInvoiceID: number;
    public XmlTagEndToEndIdReference: string;
    public Debtor: string;
    public ExternalBankAccountNumber: string;
    public PaymentStatusReportFileID: number;
    public FromBankAccountID: number;
    public StatusCode: number;
    public CreatedBy: string;
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

    public ID: number;
    public PaymentReferenceID: string;
    public HashValue: string;
    public UpdatedBy: string;
    public OcrTransmissionNumber: number;
    public TransferredDate: Date;
    public UpdatedAt: Date;
    public NumberOfPayments: number;
    public ReceiptDate: Date;
    public IsCustomerPayment: boolean;
    public Camt054CMsgId: string;
    public PaymentBatchTypeID: number;
    public CreatedAt: Date;
    public PaymentFileID: number;
    public Deleted: boolean;
    public TotalAmount: number;
    public PaymentStatusReportFileID: number;
    public OcrHeadingStrings: string;
    public StatusCode: number;
    public CreatedBy: string;
    public _createguid: string;
    public Payments: Array<Payment>;
    public PaymentBatchType: PaymentBatchType;
    public CustomFields: any;
}


export class PostPost extends UniEntity {
    public static RelativeUrl = 'postposts';
    public static EntityType = 'PostPost';

    public Date: LocalDate;
    public ID: number;
    public CurrencyCodeID: number;
    public UpdatedBy: string;
    public AmountCurrency: number;
    public UpdatedAt: Date;
    public CurrencyExchangeRate: number;
    public CreatedAt: Date;
    public JournalEntryLine2ID: number;
    public Deleted: boolean;
    public Amount: number;
    public JournalEntryLine1ID: number;
    public StatusCode: number;
    public CreatedBy: string;
    public _createguid: string;
    public JournalEntryLine1: JournalEntryLine;
    public JournalEntryLine2: JournalEntryLine;
    public CurrencyCode: CurrencyCode;
    public CustomFields: any;
}


export class ReInvoice extends UniEntity {
    public static RelativeUrl = 'reinvoicing';
    public static EntityType = 'ReInvoice';

    public TaxInclusiveAmount: number;
    public ID: number;
    public UpdatedBy: string;
    public ProductID: number;
    public UpdatedAt: Date;
    public OwnCostAmount: number;
    public ReInvoicingType: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public TaxExclusiveAmount: number;
    public SupplierInvoiceID: number;
    public OwnCostShare: number;
    public StatusCode: number;
    public CreatedBy: string;
    public _createguid: string;
    public SupplierInvoice: SupplierInvoice;
    public Product: Product;
    public Items: Array<ReInvoiceItem>;
    public CustomFields: any;
}


export class ReInvoiceItem extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ReInvoiceItem';

    public GrossAmount: number;
    public ID: number;
    public CustomerID: number;
    public NetAmount: number;
    public UpdatedBy: string;
    public ReInvoiceID: number;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public Vat: number;
    public Surcharge: number;
    public Share: number;
    public StatusCode: number;
    public CreatedBy: string;
    public _createguid: string;
    public Customer: Customer;
    public CustomFields: any;
}


export class SupplierInvoice extends UniEntity {
    public static RelativeUrl = 'supplierinvoices';
    public static EntityType = 'SupplierInvoice';

    public PrintStatus: number;
    public FreeTxt: string;
    public DeliveryTerm: string;
    public IsSentToPayment: boolean;
    public PaymentTerm: string;
    public InvoiceReferenceID: number;
    public Comment: string;
    public DeliveryName: string;
    public ShippingAddressLine1: string;
    public TaxInclusiveAmount: number;
    public ShippingCity: string;
    public InvoiceType: number;
    public CustomerPerson: string;
    public InvoiceOriginType: SupplierInvoiceOriginType;
    public ID: number;
    public InvoiceAddressLine3: string;
    public CurrencyCodeID: number;
    public PaymentID: string;
    public UpdatedBy: string;
    public ShippingCountryCode: string;
    public CreditedAmount: number;
    public ReInvoiceID: number;
    public UpdatedAt: Date;
    public VatTotalsAmountCurrency: number;
    public TaxExclusiveAmountCurrency: number;
    public JournalEntryID: number;
    public InvoiceDate: LocalDate;
    public ShippingCountry: string;
    public ReInvoiced: boolean;
    public BankAccountID: number;
    public PaymentTermsID: number;
    public ProjectID: number;
    public ShippingPostalCode: string;
    public DeliveryTermsID: number;
    public TaxInclusiveAmountCurrency: number;
    public CreditedAmountCurrency: number;
    public ShippingAddressLine2: string;
    public YourReference: string;
    public InvoiceNumber: string;
    public InvoiceCountry: string;
    public Requisition: string;
    public InternalNote: string;
    public InvoiceCity: string;
    public DefaultDimensionsID: number;
    public InvoiceReceiverName: string;
    public InvoicePostalCode: string;
    public CurrencyExchangeRate: number;
    public CreatedAt: Date;
    public PaymentInformation: string;
    public PaymentStatus: number;
    public VatTotalsAmount: number;
    public DeliveryMethod: string;
    public Deleted: boolean;
    public RestAmountCurrency: number;
    public InvoiceAddressLine1: string;
    public TaxExclusiveAmount: number;
    public CreditDays: number;
    public RestAmount: number;
    public Payment: string;
    public InvoiceCountryCode: string;
    public AmountRegards: string;
    public PaymentDueDate: LocalDate;
    public SupplierOrgNumber: string;
    public SalesPerson: string;
    public PayableRoundingAmount: number;
    public CustomerOrgNumber: string;
    public SupplierID: number;
    public Credited: boolean;
    public ShippingAddressLine3: string;
    public StatusCode: number;
    public DeliveryDate: LocalDate;
    public PayableRoundingCurrencyAmount: number;
    public OurReference: string;
    public CreatedBy: string;
    public InvoiceAddressLine2: string;
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
    public Comment: string;
    public ID: number;
    public DimensionsID: number;
    public CurrencyCodeID: number;
    public SortIndex: number;
    public UpdatedBy: string;
    public DiscountCurrency: number;
    public ProductID: number;
    public SumTotalIncVatCurrency: number;
    public UpdatedAt: Date;
    public SumTotalExVat: number;
    public SumTotalExVatCurrency: number;
    public PriceExVatCurrency: number;
    public SumTotalIncVat: number;
    public Discount: number;
    public CalculateGrossPriceBasedOnNetPrice: boolean;
    public PriceExVat: number;
    public VatPercent: number;
    public CurrencyExchangeRate: number;
    public ItemText: string;
    public CreatedAt: Date;
    public Unit: string;
    public InvoicePeriodEndDate: LocalDate;
    public VatTypeID: number;
    public Deleted: boolean;
    public DiscountPercent: number;
    public InvoicePeriodStartDate: LocalDate;
    public PriceIncVat: number;
    public SumVat: number;
    public AccountingCost: string;
    public SumVatCurrency: number;
    public SupplierInvoiceID: number;
    public PriceSetByUser: boolean;
    public StatusCode: number;
    public CreatedBy: string;
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

    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public No: string;
    public Name: string;
    public StatusCode: number;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class VatDeduction extends UniEntity {
    public static RelativeUrl = 'vatdeductions';
    public static EntityType = 'VatDeduction';

    public DeductionPercent: number;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public ValidTo: LocalDate;
    public VatDeductionGroupID: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public ValidFrom: LocalDate;
    public StatusCode: number;
    public CreatedBy: string;
    public _createguid: string;
    public VatDeductionGroup: VatDeductionGroup;
    public CustomFields: any;
}


export class VatDeductionGroup extends UniEntity {
    public static RelativeUrl = 'vatdeductiongroups';
    public static EntityType = 'VatDeductionGroup';

    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public Name: string;
    public StatusCode: number;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class VatPost extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'VatPost';

    public HasTaxAmount: boolean;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public VatCodeGroupID: number;
    public ReportAsNegativeAmount: boolean;
    public CreatedAt: Date;
    public Deleted: boolean;
    public No: string;
    public Name: string;
    public StatusCode: number;
    public HasTaxBasis: boolean;
    public CreatedBy: string;
    public _createguid: string;
    public VatCodeGroup: VatCodeGroup;
    public VatReportReferences: Array<VatReportReference>;
    public CustomFields: any;
}


export class VatReport extends UniEntity {
    public static RelativeUrl = 'vatreports';
    public static EntityType = 'VatReport';

    public Comment: string;
    public ID: number;
    public VatReportTypeID: number;
    public InternalComment: string;
    public UpdatedBy: string;
    public VatReportArchivedSummaryID: number;
    public UpdatedAt: Date;
    public JournalEntryID: number;
    public ExecutedDate: Date;
    public CreatedAt: Date;
    public Title: string;
    public Deleted: boolean;
    public ReportedDate: Date;
    public TerminPeriodID: number;
    public StatusCode: number;
    public ExternalRefNo: string;
    public CreatedBy: string;
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

    public ReportName: string;
    public ID: number;
    public PaymentID: string;
    public UpdatedBy: string;
    public PaymentToDescription: string;
    public PaymentBankAccountNumber: string;
    public UpdatedAt: Date;
    public PaymentYear: number;
    public PaymentPeriod: string;
    public CreatedAt: Date;
    public AmountToBeReceived: number;
    public Deleted: boolean;
    public PaymentDueDate: Date;
    public SummaryHeader: string;
    public AmountToBePayed: number;
    public StatusCode: number;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class VatReportReference extends UniEntity {
    public static RelativeUrl = 'vatreportreferences';
    public static EntityType = 'VatReportReference';

    public VatPostID: number;
    public ID: number;
    public AccountID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public VatTypeID: number;
    public Deleted: boolean;
    public StatusCode: number;
    public CreatedBy: string;
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
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public Deleted: boolean;
    public Name: string;
    public StatusCode: number;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class VatType extends UniEntity {
    public static RelativeUrl = 'vattypes';
    public static EntityType = 'VatType';

    public OutgoingAccountID: number;
    public AvailableInModules: boolean;
    public ID: number;
    public OutputVat: boolean;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public VatCodeGroupingValue: VatCodeGroupingValueEnum;
    public ReversedTaxDutyVat: boolean;
    public Alias: string;
    public VatCodeGroupID: number;
    public CreatedAt: Date;
    public VatCode: string;
    public IncomingAccountID: number;
    public Deleted: boolean;
    public Visible: boolean;
    public Name: string;
    public VatTypeSetupID: number;
    public InUse: boolean;
    public Locked: boolean;
    public DirectJournalEntryOnly: boolean;
    public StatusCode: number;
    public CreatedBy: string;
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
    public UpdatedAt: Date;
    public ValidTo: LocalDate;
    public VatPercent: number;
    public CreatedAt: Date;
    public VatTypeID: number;
    public Deleted: boolean;
    public ValidFrom: LocalDate;
    public StatusCode: number;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class EntityValidationRule extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'EntityValidationRule';

    public Level: ValidationLevel;
    public PropertyName: string;
    public ChangedByCompany: boolean;
    public ID: number;
    public UpdatedBy: string;
    public Message: string;
    public UpdatedAt: Date;
    public Operator: Operator;
    public Value: string;
    public OnConflict: OnConflict;
    public System: boolean;
    public CreatedAt: Date;
    public Deleted: boolean;
    public EntityType: string;
    public Operation: OperationType;
    public SyncKey: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class EntityValidationRuleTemplate extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'EntityValidationRuleTemplate';

    public Level: ValidationLevel;
    public PropertyName: string;
    public ChangedByCompany: boolean;
    public ID: number;
    public UpdatedBy: string;
    public Message: string;
    public UpdatedAt: Date;
    public Operator: Operator;
    public Value: string;
    public OnConflict: OnConflict;
    public System: boolean;
    public CreatedAt: Date;
    public Deleted: boolean;
    public EntityType: string;
    public Operation: OperationType;
    public SyncKey: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class ComplexValidationRule extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ComplexValidationRule';

    public Level: ValidationLevel;
    public ChangedByCompany: boolean;
    public ID: number;
    public UpdatedBy: string;
    public Message: string;
    public UpdatedAt: Date;
    public OnConflict: OnConflict;
    public System: boolean;
    public ValidationCode: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public EntityType: string;
    public Operation: OperationType;
    public SyncKey: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class ComplexValidationRuleTemplate extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ComplexValidationRuleTemplate';

    public Level: ValidationLevel;
    public ChangedByCompany: boolean;
    public ID: number;
    public UpdatedBy: string;
    public Message: string;
    public UpdatedAt: Date;
    public OnConflict: OnConflict;
    public System: boolean;
    public ValidationCode: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public EntityType: string;
    public Operation: OperationType;
    public SyncKey: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class CustomField extends UniEntity {
    public static RelativeUrl = 'custom-fields';
    public static EntityType = 'CustomField';

    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public Nullable: boolean;
    public CreatedAt: Date;
    public Deleted: boolean;
    public Name: string;
    public StatusCode: number;
    public ModelID: number;
    public DataType: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class ValueList extends UniEntity {
    public static RelativeUrl = 'valuelists';
    public static EntityType = 'ValueList';

    public Description: string;
    public ID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public Code: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public Name: string;
    public CreatedBy: string;
    public _createguid: string;
    public Items: Array<ValueItem>;
    public CustomFields: any;
}


export class ValueItem extends UniEntity {
    public static RelativeUrl = 'valueitems';
    public static EntityType = 'ValueItem';

    public Description: string;
    public ID: number;
    public UpdatedBy: string;
    public ValueListID: number;
    public UpdatedAt: Date;
    public Code: string;
    public Value: string;
    public Index: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public Name: string;
    public CreatedBy: string;
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

    public Property: string;
    public ValueList: string;
    public Description: string;
    public LineBreak: boolean;
    public ID: number;
    public FieldType: FieldType;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public ComponentLayoutID: number;
    public Sectionheader: string;
    public LookupEntityType: string;
    public Url: string;
    public CreatedAt: Date;
    public Width: string;
    public Section: number;
    public LookupField: boolean;
    public Deleted: boolean;
    public Placeholder: string;
    public HelpText: string;
    public DisplayField: string;
    public Hidden: boolean;
    public ReadOnly: boolean;
    public Combo: number;
    public EntityType: string;
    public Placement: number;
    public Label: string;
    public Alignment: Alignment;
    public FieldSet: number;
    public Options: string;
    public StatusCode: number;
    public CreatedBy: string;
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
    public FromDate: Date;
    public ToDate: Date;
    public Relation: WorkRelation;
    public Items: Array<TimeSheetItem>;
}


export class TimeSheetItem extends UniEntity {
    public Status: WorkStatus;
    public Date: Date;
    public StartTime: Date;
    public ExpectedTime: number;
    public Workflow: TimesheetWorkflow;
    public TotalTime: number;
    public EndTime: Date;
    public ValidTime: number;
    public Flextime: number;
    public IsWeekend: boolean;
    public ValidTimeOff: number;
    public SickTime: number;
    public WeekNumber: number;
    public Projecttime: number;
    public TimeOff: number;
    public WeekDay: number;
    public Overtime: number;
    public Invoicable: number;
}


export class WorkBalanceDto extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'WorkBalanceDto';

    public Description: string;
    public ID: number;
    public LastDayExpected: number;
    public UpdatedBy: string;
    public WorkRelationID: number;
    public UpdatedAt: Date;
    public ActualMinutes: number;
    public ExpectedMinutes: number;
    public BalanceFrom: Date;
    public SumOvertime: number;
    public ValidTimeOff: number;
    public CreatedAt: Date;
    public Balancetype: WorkBalanceTypeEnum;
    public Deleted: boolean;
    public Days: number;
    public ValidFrom: Date;
    public LastDayActual: number;
    public BalanceDate: Date;
    public StatusCode: number;
    public CreatedBy: string;
    public Minutes: number;
    public IsStartBalance: boolean;
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
    public IsWeekend: boolean;
    public ValidTimeOff: number;
    public WorkedMinutes: number;
}


export class ContactSearchServiceResponse extends UniEntity {
    public Success: boolean;
    public ErrorCode: number;
    public Method: string;
    public ObjectName: string;
    public ErrorMessage: string;
}


export class InvoicesAndRemindersReadyToRemind extends UniEntity {
    public CurrencyCodeCode: string;
    public ReminderNumber: number;
    public TaxInclusiveAmount: number;
    public CustomerInvoiceID: number;
    public Interest: number;
    public CustomerID: number;
    public CurrencyCodeID: number;
    public EmailAddress: string;
    public InvoiceDate: Date;
    public CustomerName: string;
    public TaxInclusiveAmountCurrency: number;
    public InvoiceNumber: number;
    public CurrencyExchangeRate: number;
    public ExternalReference: string;
    public CustomerInvoiceReminderID: number;
    public RestAmountCurrency: number;
    public DontSendReminders: boolean;
    public RestAmount: number;
    public DueDate: Date;
    public CurrencyCodeShortCode: string;
    public CustomerNumber: number;
    public Fee: number;
    public StatusCode: number;
}


export class CanDistributeReminderResult extends UniEntity {
    public RemindersWithPrint: number;
    public HasPrintService: boolean;
    public AlreadySentCount: number;
    public RemindersWithEmail: number;
    public RemindersWithDistributionPlan: number;
    public CanDistributeAllRemindersUsingPlan: boolean;
}


export class DistributeInvoiceReminderInput extends UniEntity {
    public SendRemainingToCasehandler: boolean;
    public CasehandlerEmail: string;
    public SendByPrintServiceIfPossible: boolean;
    public SendByEmailIfPossible: boolean;
    public SendByDistributionPlanFirst: boolean;
}


export class TradeHeaderCalculationSummary extends UniEntity {
    public SumVatBasisCurrency: number;
    public SumDiscount: number;
    public DecimalRounding: number;
    public SumNoVatBasis: number;
    public SumTotalIncVatCurrency: number;
    public SumTotalExVat: number;
    public SumTotalExVatCurrency: number;
    public SumTotalIncVat: number;
    public SumVatBasis: number;
    public SumNoVatBasisCurrency: number;
    public SumVat: number;
    public SumDiscountCurrency: number;
    public SumVatCurrency: number;
    public DecimalRoundingCurrency: number;
}


export class VatCalculationSummary extends UniEntity {
    public SumVatBasisCurrency: number;
    public SumVatBasis: number;
    public VatPercent: number;
    public SumVat: number;
    public SumVatCurrency: number;
}


export class InvoicePaymentData extends UniEntity {
    public DimensionsID: number;
    public CurrencyCodeID: number;
    public PaymentID: string;
    public AccountID: number;
    public AmountCurrency: number;
    public CurrencyExchangeRate: number;
    public BankChargeAccountID: number;
    public AgioAmount: number;
    public BankChargeAmount: number;
    public PaymentDate: LocalDate;
    public Amount: number;
    public AgioAccountID: number;
    public FromBankAccountID: number;
}


export class InvoiceSummary extends UniEntity {
    public SumTotalAmount: number;
    public SumCreditedAmount: number;
    public SumRestAmount: number;
}


export class CustomerNoAndName extends UniEntity {
    public Name: string;
    public Number: string;
}


export class InvoicePayment extends UniEntity {
    public JournalEntryNumber: string;
    public Description: string;
    public AmountCurrency: number;
    public JournalEntryLineID: number;
    public FinancialDate: LocalDate;
    public JournalEntryID: number;
    public Amount: number;
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
    public TaxDraw: number;
    public GarnishmentTax: number;
    public EmploymentTax: number;
    public AccountNumber: string;
    public period: number;
    public KIDGarnishment: string;
    public MessageID: string;
    public KIDEmploymentTax: string;
    public KIDFinancialTax: string;
    public DueDate: Date;
    public KIDTaxDraw: string;
    public FinancialTax: number;
}


export class PayrollRunInAmeldingPeriod extends UniEntity {
    public PayrollrunID: number;
    public PayrollrunPaydate: Date;
    public CanGenerateAddition: boolean;
    public PayrollrunDescription: string;
    public AmeldingSentdate: Date;
}


export class PayAgaTaxDTO extends UniEntity {
    public payFinancialTax: boolean;
    public payGarnishment: boolean;
    public payTaxDraw: boolean;
    public payDate: Date;
    public payAga: boolean;
    public correctPennyDiff: boolean;
}


export class AmeldingSumUp extends UniEntity {
    public status: AmeldingStatus;
    public Replaces: string;
    public ID: number;
    public period: number;
    public year: number;
    public generated: Date;
    public sent: Date;
    public meldingsID: string;
    public type: AmeldingType;
    public altInnStatus: string;
    public ReplacesAMeldingID: number;
    public LegalEntityNo: string;
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
    public arbeidsforholdId: string;
    public type: string;
    public startDate: Date;
    public permisjon: Array<EmploymentLeaves>;
}


export class EmploymentLeaves extends UniEntity {
    public sluttdato: Date;
    public permisjonsId: string;
    public permisjonsprosent: string;
    public startdato: Date;
    public beskrivelse: string;
}


export class TransactionTypes extends UniEntity {
    public description: string;
    public tax: boolean;
    public Base_EmploymentTax: boolean;
    public amount: number;
    public incomeType: string;
    public benefit: string;
}


export class AGADetails extends UniEntity {
    public rate: number;
    public zoneName: string;
    public type: string;
    public baseAmount: number;
    public sectorName: string;
}


export class Totals extends UniEntity {
    public sumAGA: number;
    public sumTax: number;
    public sumUtleggstrekk: number;
}


export class AnnualStatement extends UniEntity {
    public EmployeePostCode: string;
    public EmployerCity: string;
    public EmployerAddress: string;
    public Year: number;
    public EmployeeName: string;
    public EmployeeMunicipalNumber: string;
    public EmployerPostCode: string;
    public EmployerOrgNr: string;
    public EmployerName: string;
    public EmployerEmail: string;
    public EmployeeNumber: number;
    public EmployerPhoneNumber: string;
    public EmployerTaxMandatory: boolean;
    public EmployeeAddress: string;
    public EmployerWebAddress: string;
    public VacationPayBase: number;
    public EmployeeSSn: string;
    public EmployeeMunicipalName: string;
    public EmployeeCity: string;
    public EmployerCountry: string;
    public EmployerCountryCode: string;
    public Contributions: Array<AnnualStatementLine>;
    public PensionOrBenefits: Array<AnnualStatementLine>;
    public Deductions: Array<AnnualStatementLine>;
    public Draws: Array<AnnualStatementLine>;
}


export class AnnualStatementLine extends UniEntity {
    public LineIndex: number;
    public SupplementPackageName: string;
    public IsDeduction: boolean;
    public Sum: number;
    public Description: string;
    public TaxReturnPost: string;
    public Amount: number;
    public Supplements: Array<SupplementInfo>;
}


export class SupplementInfo extends UniEntity {
    public ValueDate: Date;
    public ValueBool: boolean;
    public ValueDate2: Date;
    public ValueType: Valuetype;
    public ValueString: string;
    public WageTypeSupplementID: number;
    public ValueMoney: number;
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
    public Title: string;
    public Text: string;
    public mainStatus: string;
    public employeestatus: Array<EmployeeStatus>;
}


export class EmployeeStatus extends UniEntity {
    public status: string;
    public year: number;
    public employeeID: number;
    public employeeNumber: number;
    public ssn: string;
    public info: string;
    public changedFields: Array<FieldsChanged>;
}


export class FieldsChanged extends UniEntity {
    public fieldName: string;
    public valFrom: string;
    public valTo: string;
}


export class EmploymentHistoryRecord extends UniEntity {
    public MonthRate: number;
    public RegulativeStepNr: number;
    public ChangedAt: Date;
    public WorkPercent: number;
    public HourRate: number;
    public RegulativeGroupID: number;
}


export class CodeListRowsCodeListRow extends UniEntity {
    public Value3: string;
    public Value1: string;
    public Code: string;
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
    public netPayment: number;
    public employeeID: number;
    public grossPayment: number;
}


export class SumOnYear extends UniEntity {
    public netPayment: number;
    public pension: number;
    public employeeID: number;
    public paidHolidaypay: number;
    public sumTax: number;
    public advancePayment: number;
    public grossPayment: number;
    public usedNonTaxableAmount: number;
    public baseVacation: number;
    public nonTaxableAmount: number;
    public taxBase: number;
}


export class VacationPayLastYear extends UniEntity {
    public employeeID: number;
    public paidHolidayPay: number;
    public baseVacation: number;
}


export class SalaryTransactionPay extends UniEntity {
    public CompanyAddress: string;
    public SalaryBankAccountID: number;
    public CompanyBankAccountID: number;
    public CompanyName: string;
    public CompanyPostalCode: string;
    public Withholding: number;
    public TaxBankAccountID: number;
    public PaymentDate: Date;
    public CompanyCity: string;
    public PayList: Array<SalaryTransactionPayLine>;
    public SalaryBalancePayList: Array<SalaryBalancePayLine>;
}


export class SalaryTransactionPayLine extends UniEntity {
    public PostalCode: string;
    public Tax: number;
    public NetPayment: number;
    public EmployeeName: string;
    public City: string;
    public EmployeeNumber: number;
    public Address: string;
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
    public Message: string;
    public GroupByWageType: boolean;
    public ReportID: number;
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
    public FromPeriod: number;
    public CreatedPayruns: number;
    public Year: number;
    public BookedPayruns: number;
    public CalculatedPayruns: number;
    public ToPeriod: number;
    public Groups: Array<ReconciliationGroup>;
}


export class ReconciliationGroup extends UniEntity {
    public Sum: number;
    public AccountNumber: string;
    public Lines: Array<ReconciliationLine>;
}


export class ReconciliationLine extends UniEntity {
    public Sum: number;
    public Description: string;
    public WageTypeNumber: number;
    public WageTypeName: string;
    public IncomeType: string;
    public HasEmploymentTax: boolean;
    public Benefit: string;
}


export class UnionReport extends UniEntity {
    public Year: number;
    public FromDate: LocalDate;
    public ToDate: LocalDate;
    public Summaries: Array<UnionSummary>;
}


export class UnionSummary extends UniEntity {
    public SupplierID: number;
    public Supplier: Supplier;
    public Members: Array<UnionMember>;
}


export class UnionMember extends UniEntity {
    public Ensurance: number;
    public MemberNumber: string;
    public OUO: number;
    public Name: string;
    public UnionDraw: number;
}


export class SalaryTransactionSums extends UniEntity {
    public percentTax: number;
    public netPayment: number;
    public manualTax: number;
    public calculatedAGA: number;
    public paidPension: number;
    public Payrun: number;
    public grossPayment: number;
    public basePercentTax: number;
    public baseVacation: number;
    public baseTableTax: number;
    public calculatedVacationPay: number;
    public paidAdvance: number;
    public baseAGA: number;
    public tableTax: number;
    public calculatedFinancialTax: number;
    public Employee: number;
}


export class SalaryTransactionPeriodSums extends UniEntity {
    public AgaZone: string;
    public FromPeriod: number;
    public MunicipalName: string;
    public Year: number;
    public OrgNumber: string;
    public ToPeriod: number;
    public AgaRate: number;
    public Sums: SalaryTransactionSums;
    public Aga: AGACalculation;
}


export class code extends UniEntity {
    public uninavn: string;
    public utloeserArbeidsgiveravgift: string;
    public kunfranav: string;
    public gmlcode: string;
    public gyldigtil: string;
    public postnr: string;
    public fordel: string;
    public gyldigfom: string;
    public skatteOgAvgiftregel: string;
    public inngaarIGrunnlagForTrekk: string;
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
    public ContractID: number;
    public LicenseKey: string;
    public ProductNames: string;
    public ContractType: number;
    public IsTemplate: boolean;
    public CompanyName: string;
    public TemplateCompanyKey: string;
    public CopyFiles: boolean;
    public IsTest: boolean;
    public CompanySettings: CompanySettings;
}


export class UserDto extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'UserDto';

    public ID: number;
    public Protected: boolean;
    public HasAgreedToImportDisclaimer: boolean;
    public UpdatedBy: string;
    public DisplayName: string;
    public PhoneNumber: string;
    public UpdatedAt: Date;
    public PermissionHandling: string;
    public LastLogin: Date;
    public IsAutobankAdmin: boolean;
    public CreatedAt: Date;
    public Deleted: boolean;
    public Email: string;
    public GlobalIdentity: string;
    public UserName: string;
    public BankIntegrationUserName: string;
    public StatusCode: number;
    public CreatedBy: string;
    public EndDate: Date;
    public AuthPhoneNumber: string;
    public TwoFactorEnabled: boolean;
    public _createguid: string;
    public License: UserLicenseInformation;
    public CustomFields: any;
}


export class UserLicenseInformation extends UniEntity {
    public UserLicenseKey: string;
    public Comment: string;
    public GlobalIdentity: string;
    public UserLicenseEndDate: Date;
    public Name: string;
    public CustomerInfo: CustomerInfo;
    public CustomerAgreement: CustomerLicenseAgreementInfo;
    public UserType: UserLicenseType;
    public Company: CompanyLicenseInfomation;
    public ContractType: ContractLicenseType;
    public UserLicenseAgreement: LicenseAgreementInfo;
}


export class CustomerInfo extends UniEntity {
    public CustomerType: number;
    public IsRoamingUser: boolean;
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
    public ContractID: number;
    public ContactPerson: string;
    public EndDate: Date;
    public ID: number;
    public ContactEmail: string;
    public Name: string;
    public Key: string;
    public StatusCode: LicenseEntityStatus;
    public Agency: Agency;
}


export class Agency extends UniEntity {
    public CompanyKey: string;
    public Name: string;
}


export class ContractLicenseType extends UniEntity {
    public StartDate: Date;
    public TypeID: number;
    public TrialExpiration: Date;
    public TypeName: string;
}


export class LicenseAgreementInfo extends UniEntity {
    public HasAgreedToLicense: boolean;
    public AgreementId: number;
}


export class CreateBankUserDTO extends UniEntity {
    public Password: string;
    public AdminPassword: string;
    public Phone: string;
    public IsAdmin: boolean;
    public AdminUserId: number;
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
    public MaxFreeAmount: number;
    public UsedFreeAmount: number;
}


export class AuthenticationChallengeBE extends UniEntity {
    public Status: ChallengeRequestResult;
    public Message: string;
    public ValidTo: Date;
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
    public IncludeInfoPerPerson: boolean;
    public FromPeriod: Maaned;
    public IncludeEmployments: boolean;
    public IncludeIncome: boolean;
    public Year: number;
    public ReportType: ReportType;
    public ToPeriod: Maaned;
}


export class A07Response extends UniEntity {
    public Data: string;
    public Title: string;
    public Text: string;
    public DataType: string;
    public DataName: string;
    public mainStatus: string;
}


export class SelfEmployed extends UniEntity {
    public year: number;
    public items: Array<SelfEmployedItem>;
}


export class SelfEmployedItem extends UniEntity {
    public amount: number;
    public name: string;
    public supplierID: number;
    public number: string;
}


export class SetIntegrationDataDto extends UniEntity {
    public IntegrationKey: string;
    public ExternalId: string;
}


export class CurrencyRateData extends UniEntity {
    public RateDate: LocalDate;
    public Factor: number;
    public ExchangeRateOld: number;
    public IsOverrideRate: boolean;
    public RateDateOld: LocalDate;
    public ExchangeRate: number;
    public FromCurrencyCode: CurrencyCode;
}


export class EmailDTO extends UniEntity {
    public Format: string;
    public CopyAddress: string;
    public FromAddress: string;
    public Message: string;
    public ReportID: number;
    public Subject: string;
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
    public ReportName: string;
    public CopyAddress: string;
    public FromAddress: string;
    public Message: string;
    public ExternalReference: string;
    public Localization: string;
    public EntityType: string;
    public ReportID: number;
    public Subject: string;
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
    public Description: string;
    public Url: string;
    public Title: string;
    public Items: Array<RssItem>;
}


export class RssItem extends UniEntity {
    public Description: string;
    public Link: string;
    public PubDate: string;
    public Category: string;
    public Title: string;
    public Guid: string;
    public Enclosure: Enclosure;
}


export class Enclosure extends UniEntity {
    public Length: string;
    public Url: string;
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
    public FromDate: LocalDate;
    public ToDate: LocalDate;
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
    public PositionName: string;
    public Position: TeamPositionEnum;
}


export class EHFCustomer extends UniEntity {
    public contactphone: string;
    public orgname: string;
    public contactemail: string;
    public contactname: string;
    public orgno: string;
}


export class ServiceMetadataDto extends UniEntity {
    public SupportEmail: string;
    public ServiceName: string;
}


export class AccountUsageReference extends UniEntity {
    public Entity: string;
    public Info: string;
    public EntityID: number;
}


export class MandatoryDimensionAccountReport extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'MandatoryDimensionAccountReport';

    public AccountNumber: string;
    public ID: number;
    public DimensionsID: number;
    public AccountID: number;
    public UpdatedBy: string;
    public UpdatedAt: Date;
    public CreatedAt: Date;
    public MissingRequiredDimensionsMessage: string;
    public Deleted: boolean;
    public MissingOnlyWarningsDimensionsMessage: string;
    public StatusCode: number;
    public CreatedBy: string;
    public journalEntryLineDraftID: number;
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
    public GroupCode: string;
    public LastDepreciation: LocalDate;
    public GroupName: string;
    public DepreciationAccountNumber: number;
    public BalanceAccountNumber: number;
    public CurrentValue: number;
    public BalanceAccountName: string;
    public Name: string;
    public Lifetime: number;
    public Number: number;
    public Lines: Array<AssetReportLineDTO>;
}


export class AssetReportLineDTO extends UniEntity {
    public Date: LocalDate;
    public Value: number;
    public Type: string;
    public TypeID: number;
}


export class BankBalanceDto extends UniEntity {
    public Comment: string;
    public Date: Date;
    public BalanceAvailable: number;
    public AccountNumber: string;
    public BalanceBooked: number;
    public IsTestData: boolean;
    public IsMainAccountBalance: boolean;
}


export class BankData extends UniEntity {
    public AccountNumber: string;
    public IBAN: string;
    public Bank: Bank;
}


export class CreateBankIntegrationDTO extends UniEntity {
    public RequireTwoStage: boolean;
    public Password: string;
    public BankAcceptance: boolean;
    public DisplayName: string;
    public IsBankBalance: boolean;
    public Phone: string;
    public BankAccountID: number;
    public IsInbound: boolean;
    public Bank: string;
    public IsOutgoing: boolean;
    public BankApproval: boolean;
    public TuserName: string;
    public Email: string;
    public IsBankStatement: boolean;
    public UserName: string;
    public ServiceProvider: number;
    public BankAccounts: Array<BankAccountDTO>;
}


export class BankAccountDTO extends UniEntity {
    public IsBankBalance: boolean;
    public IBAN: string;
    public IsInbound: boolean;
    public IsOutgoing: boolean;
    public BBAN: string;
    public IsBankStatement: boolean;
    public Bic: string;
}


export class ZdataUpdateBankProperties extends UniEntity {
    public Password: string;
    public IsBankBalance: boolean;
    public IsInbound: boolean;
    public IsOutgoing: boolean;
    public IsBankStatement: boolean;
    public ServiceID: string;
}


export class AutobankUserDTO extends UniEntity {
    public Password: string;
    public Phone: string;
    public UserID: number;
    public IsAdmin: boolean;
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
    public Closed: boolean;
    public Date: Date;
    public ID: number;
    public Amount: number;
    public IsBankEntry: boolean;
}


export class MatchSettings extends UniEntity {
    public MaxDelta: number;
    public MaxDayOffset: number;
}


export class ReconciliationStatus extends UniEntity {
    public NumberOfItems: number;
    public NumberOfUnReconciled: number;
    public AccountID: number;
    public IsReconciled: boolean;
    public FromDate: Date;
    public TotalUnreconciled: number;
    public TotalAmount: number;
    public Todate: Date;
}


export class BalanceDto extends UniEntity {
    public EndDate: Date;
    public BalanceInStatement: number;
    public Balance: number;
    public StartDate: Date;
}


export class BankfileFormat extends UniEntity {
    public IsXml: boolean;
    public FileExtension: string;
    public SkipRows: number;
    public IsFixed: boolean;
    public Name: string;
    public CustomFormat: BankFileCustomFormat;
    public Separator: string;
    public LinePrefix: string;
    public Columns: Array<BankfileColumn>;
}


export class BankfileColumn extends UniEntity {
    public Length: number;
    public StartPos: number;
    public IsFallBack: boolean;
    public FieldMapping: BankfileField;
    public DataType: BankfileDataType;
}


export class JournalSuggestion extends UniEntity {
    public Description: string;
    public AccountID: number;
    public BankStatementRuleID: number;
    public FinancialDate: LocalDate;
    public Amount: number;
    public MatchWithEntryID: number;
    public Account: Account;
}


export class ReportRow extends UniEntity {
    public Period8: number;
    public Period2: number;
    public BudgetAccumulated: number;
    public Period9: number;
    public AccountName: string;
    public Sum: number;
    public BudPeriod10: number;
    public Period12: number;
    public AccountNumber: number;
    public ID: number;
    public Period1: number;
    public BudPeriod1: number;
    public SumPeriodLastYearAccumulated: number;
    public BudPeriod4: number;
    public BudPeriod6: number;
    public SumLastYear: number;
    public AccountYear: number;
    public SubGroupName: string;
    public Period10: number;
    public SubGroupNumber: number;
    public GroupName: string;
    public IsSubTotal: boolean;
    public BudgetSum: number;
    public SumPeriod: number;
    public Period11: number;
    public BudPeriod7: number;
    public Period6: number;
    public BudPeriod8: number;
    public BudPeriod12: number;
    public SumPeriodLastYear: number;
    public GroupNumber: number;
    public BudPeriod9: number;
    public Period5: number;
    public BudPeriod5: number;
    public BudPeriod3: number;
    public Period7: number;
    public BudPeriod11: number;
    public Period3: number;
    public SumPeriodAccumulated: number;
    public Period4: number;
    public BudPeriod2: number;
    public PrecedingBalance: number;
}


export class BudgetImport extends UniEntity {
    public Budget: Budget;
}


export class LiquidityTableDTO extends UniEntity {
    public OverdueCustomerInvoices: number;
    public OverdueSupplierInvoices: number;
    public BankBalance: number;
    public BankBalanceRefferance: BankBalanceType;
    public Period: Array<DetailsDTO>;
}


export class DetailsDTO extends UniEntity {
    public Liquidity: number;
    public Sum: number;
    public Custumer: number;
    public Supplier: number;
    public CustomPayments: number;
    public VAT: number;
}


export class JournalEntryData extends UniEntity {
    public NumberSeriesID: number;
    public CustomerInvoiceID: number;
    public Description: string;
    public NumberSeriesTaskID: number;
    public PaymentID: string;
    public CreditAccountID: number;
    public CreditAccountNumber: number;
    public AmountCurrency: number;
    public JournalEntryNo: string;
    public FinancialDate: LocalDate;
    public JournalEntryID: number;
    public SupplierInvoiceNo: string;
    public CustomerOrderID: number;
    public DebitAccountID: number;
    public PostPostJournalEntryLineID: number;
    public CurrencyID: number;
    public InvoiceNumber: string;
    public CurrencyExchangeRate: number;
    public VatDate: LocalDate;
    public Amount: number;
    public JournalEntryDataAccrualID: number;
    public DueDate: LocalDate;
    public CreditVatTypeID: number;
    public SupplierInvoiceID: number;
    public DebitVatTypeID: number;
    public StatusCode: number;
    public DebitAccountNumber: number;
    public VatDeductionPercent: number;
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
    public SumBalance: number;
    public SumCredit: number;
    public SumLedger: number;
    public SumTaxBasisAmount: number;
    public SumDebit: number;
}


export class JournalEntryLinePostPostData extends UniEntity {
    public CurrencyCodeCode: string;
    public JournalEntryNumber: string;
    public PeriodNo: number;
    public Description: string;
    public ID: number;
    public CurrencyCodeID: number;
    public PaymentID: string;
    public AmountCurrency: number;
    public NumberOfPayments: number;
    public FinancialDate: Date;
    public AccountYear: number;
    public JournalEntryID: number;
    public SumPostPostAmount: number;
    public JournalEntryNumberNumeric: number;
    public SubAccountNumber: number;
    public InvoiceNumber: string;
    public JournalEntryTypeName: string;
    public MarkedAgainstJournalEntryLineID: number;
    public CurrencyExchangeRate: number;
    public SumPostPostAmountCurrency: number;
    public MarkedAgainstJournalEntryNumber: string;
    public RestAmountCurrency: number;
    public Amount: number;
    public RestAmount: number;
    public DueDate: Date;
    public CurrencyCodeShortCode: string;
    public SubAccountName: string;
    public StatusCode: number;
    public Markings: Array<JournalEntryLinePostPostData>;
}


export class CreatePaymentBatchDTO extends UniEntity {
    public Password: string;
    public HashValue: string;
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
    public JournalEntryNumber: string;
    public ID: number;
    public OriginalRestAmount: number;
    public AmountCurrency: number;
    public FinancialDate: Date;
    public InvoiceNumber: string;
    public RestAmountCurrency: number;
    public Amount: number;
    public RestAmount: number;
    public OriginalStatusCode: StatusCodeJournalEntryLine;
    public StatusCode: StatusCodeJournalEntryLine;
    public Markings: Array<MarkingReference>;
}


export class MarkingReference extends UniEntity {
    public JournalEntryNumber: string;
    public ID: number;
}


export class SupplierInvoiceDetail extends UniEntity {
    public AccountName: string;
    public Description: string;
    public VatTypeName: string;
    public AccountNumber: number;
    public AccountID: number;
    public AmountCurrency: number;
    public InvoiceDate: Date;
    public InvoiceNumber: string;
    public VatPercent: number;
    public VatCode: string;
    public VatTypeID: number;
    public Amount: number;
    public SupplierInvoiceID: number;
    public SupplierID: number;
    public DeliveryDate: Date;
}


export class VatReportMessage extends UniEntity {
    public Level: ValidationLevel;
    public Message: string;
}


export class VatReportSummary extends UniEntity {
    public IsHistoricData: boolean;
    public HasTaxAmount: boolean;
    public VatCodeGroupNo: string;
    public VatCodeGroupID: number;
    public VatCodeGroupName: string;
    public SumTaxBasisAmount: number;
    public NumberOfJournalEntryLines: number;
    public SumVatAmount: number;
    public HasTaxBasis: boolean;
}


export class VatReportSummaryPerPost extends UniEntity {
    public VatPostID: number;
    public IsHistoricData: boolean;
    public HasTaxAmount: boolean;
    public VatCodeGroupNo: string;
    public VatPostNo: string;
    public VatCodeGroupID: number;
    public VatCodeGroupName: string;
    public SumTaxBasisAmount: number;
    public NumberOfJournalEntryLines: number;
    public VatPostReportAsNegativeAmount: boolean;
    public VatPostName: string;
    public SumVatAmount: number;
    public HasTaxBasis: boolean;
}


export class VatReportSummaryPerPostPerAccount extends UniEntity {
    public JournalEntryNumber: string;
    public VatPostID: number;
    public VatJournalEntryPostAccountID: number;
    public IsHistoricData: boolean;
    public Description: string;
    public HasTaxAmount: boolean;
    public VatCodeGroupNo: string;
    public VatJournalEntryPostAccountName: string;
    public VatPostNo: string;
    public FinancialDate: Date;
    public VatCodeGroupID: number;
    public VatCodeGroupName: string;
    public SumTaxBasisAmount: number;
    public NumberOfJournalEntryLines: number;
    public VatPostReportAsNegativeAmount: boolean;
    public VatPostName: string;
    public VatAccountName: string;
    public VatCode: string;
    public StdVatCode: string;
    public VatAccountID: number;
    public VatDate: Date;
    public Amount: number;
    public VatAccountNumber: number;
    public TaxBasisAmount: number;
    public SumVatAmount: number;
    public VatJournalEntryPostAccountNumber: number;
    public HasTaxBasis: boolean;
}


export class VatReportNotReportedJournalEntryData extends UniEntity {
    public SumTaxBasisAmount: number;
    public NumberOfJournalEntryLines: number;
    public TerminPeriodID: number;
    public SumVatAmount: number;
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
    InvoiceMultipleCustomerByDraft = 3,
    MultipleOrderEachCustomer = 4,
    MultipleRecurringEachCustomer = 5,
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


export enum PaymentInterval{
    Standard = 0,
    Monthly = 1,
    Pr14Days = 2,
    Weekly = 3,
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


export enum EndDateReason{
    NotSet = 0,
    ShouldNotHaveBeenReported = 1,
    EmployerHasResignedEmployee = 2,
    EmployeeHasResigned = 3,
    ChangedAccountingSystemOrAccountant = 4,
    ChangeInOrganizationStructureOrChangedJobInternally = 5,
    TemporaryEmploymentHasExpired = 6,
}


export enum ShipRegistry{
    notSet = 0,
    NorwegianInternationalShipRegister = 1,
    NorwegianOrdinaryShipRegister = 2,
    ForeignShipRegister = 3,
}


export enum EmploymentType{
    notSet = 0,
    Permanent = 1,
    Temporary = 2,
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


export enum TaxType{
    Tax_None = 0,
    Tax_Table = 1,
    Tax_Percent = 2,
    Tax_0 = 3,
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


export enum PreApprovedBankPayments{
    InActive = 700000,
    WaitForBankApprove = 700003,
    Active = 700005,
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
    regnearkOdsV2_2 = 4,
    xmlFormatV2_2 = 5,
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
    Sent = 49002,
    Rejected = 49003,
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
