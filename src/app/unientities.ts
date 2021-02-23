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
    public Deleted: boolean;
    public CreatedBy: string;
    public EntityID: number;
    public UpdatedAt: Date;
    public Field: string;
    public EntityType: string;
    public Verb: string;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public OldValue: string;
    public ClientID: string;
    public Route: string;
    public Transaction: string;
    public ID: number;
    public NewValue: string;
    public _createguid: string;
    public CustomFields: any;
}


export class WorkBalance extends UniEntity {
    public static RelativeUrl = 'workbalances';
    public static EntityType = 'WorkBalance';

    public Deleted: boolean;
    public CreatedBy: string;
    public WorkRelationID: number;
    public BalanceFrom: Date;
    public ValidFrom: Date;
    public ValidTimeOff: number;
    public UpdatedAt: Date;
    public Description: string;
    public Days: number;
    public StatusCode: number;
    public IsStartBalance: boolean;
    public BalanceDate: Date;
    public UpdatedBy: string;
    public Balancetype: WorkBalanceTypeEnum;
    public ExpectedMinutes: number;
    public CreatedAt: Date;
    public ID: number;
    public ActualMinutes: number;
    public Minutes: number;
    public _createguid: string;
    public CustomFields: any;
}


export class Worker extends UniEntity {
    public static RelativeUrl = 'workers';
    public static EntityType = 'Worker';

    public Deleted: boolean;
    public CreatedBy: string;
    public BusinessRelationID: number;
    public UpdatedAt: Date;
    public UserID: number;
    public EmployeeID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public ID: number;
    public _createguid: string;
    public Info: BusinessRelation;
    public Relations: Array<WorkRelation>;
    public Employee: Employee;
    public CustomFields: any;
}


export class WorkItem extends UniEntity {
    public static RelativeUrl = 'workitems';
    public static EntityType = 'WorkItem';

    public Deleted: boolean;
    public EndTime: Date;
    public CreatedBy: string;
    public Date: Date;
    public Label: string;
    public WorkRelationID: number;
    public OrderItemId: number;
    public CustomerOrderID: number;
    public StartTime: Date;
    public PayrollTrackingID: number;
    public UpdatedAt: Date;
    public Description: string;
    public PriceExVat: number;
    public DimensionsID: number;
    public WorkItemGroupID: number;
    public Invoiceable: boolean;
    public WorkTypeID: number;
    public StatusCode: number;
    public CustomerID: number;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public MinutesToOrder: number;
    public ID: number;
    public TransferedToOrder: boolean;
    public LunchInMinutes: number;
    public TransferedToPayroll: boolean;
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

    public Deleted: boolean;
    public CreatedBy: string;
    public WorkRelationID: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public ID: number;
    public _createguid: string;
    public WorkRelation: WorkRelation;
    public Items: Array<WorkItem>;
    public CustomFields: any;
}


export class WorkProfile extends UniEntity {
    public static RelativeUrl = 'workprofiles';
    public static EntityType = 'WorkProfile';

    public Deleted: boolean;
    public CreatedBy: string;
    public IsShared: boolean;
    public LunchIncluded: boolean;
    public MinutesPerYear: number;
    public MinutesPerWeek: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public UpdatedBy: string;
    public Name: string;
    public CreatedAt: Date;
    public MinutesPerMonth: number;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class WorkRelation extends UniEntity {
    public static RelativeUrl = 'workrelations';
    public static EntityType = 'WorkRelation';

    public Deleted: boolean;
    public EndTime: Date;
    public CreatedBy: string;
    public TeamID: number;
    public WorkProfileID: number;
    public CompanyName: string;
    public StartDate: Date;
    public UpdatedAt: Date;
    public CompanyID: number;
    public Description: string;
    public WorkerID: number;
    public IsPrivate: boolean;
    public StatusCode: number;
    public UpdatedBy: string;
    public WorkPercentage: number;
    public CreatedAt: Date;
    public ID: number;
    public IsActive: boolean;
    public _createguid: string;
    public WorkProfile: WorkProfile;
    public Worker: Worker;
    public Items: Array<WorkItem>;
    public Team: Team;
    public CustomFields: any;
}


export class WorkTimeOff extends UniEntity {
    public static RelativeUrl = 'worktimeoff';
    public static EntityType = 'WorkTimeOff';

    public IsHalfDay: boolean;
    public Deleted: boolean;
    public CreatedBy: string;
    public WorkRelationID: number;
    public FromDate: Date;
    public UpdatedAt: Date;
    public TimeoffType: number;
    public Description: string;
    public RegionKey: string;
    public ToDate: Date;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public ID: number;
    public SystemKey: string;
    public _createguid: string;
    public CustomFields: any;
}


export class WorkType extends UniEntity {
    public static RelativeUrl = 'worktypes';
    public static EntityType = 'WorkType';

    public Deleted: boolean;
    public CreatedBy: string;
    public WagetypeNumber: number;
    public SystemType: WorkTypeEnum;
    public UpdatedAt: Date;
    public Description: string;
    public ProductID: number;
    public Price: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public Name: string;
    public CreatedAt: Date;
    public ID: number;
    public _createguid: string;
    public Product: Product;
    public CustomFields: any;
}


export class BankFile extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'BankFile';

    public Deleted: boolean;
    public CreatedBy: string;
    public SubCompanyID: number;
    public Accountnumber: string;
    public UpdatedAt: Date;
    public ParentFileid: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public FileID: number;
    public CreatedAt: Date;
    public ID: number;
    public _createguid: string;
    public File: File;
    public SubCompany: SubCompany;
    public CustomFields: any;
}


export class BatchInvoice extends UniEntity {
    public static RelativeUrl = 'batchinvoices';
    public static EntityType = 'BatchInvoice';

    public Deleted: boolean;
    public CreatedBy: string;
    public YourRef: string;
    public NumberOfBatches: number;
    public DueDate: LocalDate;
    public UpdatedAt: Date;
    public TotalToProcess: number;
    public SellerID: number;
    public InvoiceDate: LocalDate;
    public Comment: string;
    public CopyFromEntityId: number;
    public OurRef: string;
    public StatusCode: number;
    public FreeTxt: string;
    public Processed: number;
    public Operation: BatchInvoiceOperation;
    public NotifyEmail: boolean;
    public UpdatedBy: string;
    public MinAmount: number;
    public CreatedAt: Date;
    public ID: number;
    public _createguid: string;
    public CustomerID: number;
    public ProjectID: number;
    public Items: Array<BatchInvoiceItem>;
    public CustomFields: any;
}


export class BatchInvoiceItem extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'BatchInvoiceItem';

    public Deleted: boolean;
    public CreatedBy: string;
    public CustomerOrderID: number;
    public BatchInvoiceID: number;
    public CommentID: number;
    public UpdatedAt: Date;
    public CustomerInvoiceID: number;
    public StatusCode: StatusCode;
    public BatchNumber: number;
    public CustomerID: number;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public ID: number;
    public _createguid: string;
    public ProjectID: number;
    public CustomerOrder: CustomerOrder;
    public CustomerInvoice: CustomerInvoice;
    public CustomFields: any;
}


export class CampaignTemplate extends UniEntity {
    public static RelativeUrl = 'campaigntemplate';
    public static EntityType = 'CampaignTemplate';

    public Deleted: boolean;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Template: string;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public ID: number;
    public EntityName: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Customer extends UniEntity {
    public static RelativeUrl = 'customers';
    public static EntityType = 'Customer';

    public Deleted: boolean;
    public OrgNumber: string;
    public DefaultCustomerQuoteReportID: number;
    public CreatedBy: string;
    public CustomerNumber: number;
    public SocialSecurityNumber: string;
    public DeliveryTermsID: number;
    public EInvoiceAgreementReference: string;
    public PaymentTermsID: number;
    public BusinessRelationID: number;
    public DefaultCustomerInvoiceReportID: number;
    public PeppolAddress: string;
    public CurrencyCodeID: number;
    public AcceptableDelta4CustomerPayment: number;
    public UpdatedAt: Date;
    public EfakturaIdentifier: string;
    public WebUrl: string;
    public GLN: string;
    public AcceptableDelta4CustomerPaymentAccountID: number;
    public DefaultSellerID: number;
    public DimensionsID: number;
    public IsPrivate: boolean;
    public StatusCode: number;
    public DefaultDistributionsID: number;
    public CustomerNumberKidAlias: string;
    public Localization: string;
    public UpdatedBy: string;
    public DontSendReminders: boolean;
    public ReminderEmailAddress: string;
    public CreatedAt: Date;
    public SubAccountNumberSeriesID: number;
    public AvtaleGiro: boolean;
    public CreditDays: number;
    public ID: number;
    public AvtaleGiroNotification: boolean;
    public DefaultCustomerOrderReportID: number;
    public FactoringNumber: number;
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

    public Deleted: boolean;
    public PaymentInformation: string;
    public CreatedBy: string;
    public InternalNote: string;
    public RestAmountCurrency: number;
    public LastPaymentDate: LocalDate;
    public AccrualID: number;
    public UseReportID: number;
    public TaxInclusiveAmountCurrency: number;
    public DefaultDimensionsID: number;
    public CreditedAmount: number;
    public SupplierOrgNumber: string;
    public DeliveryMethod: string;
    public DeliveryTermsID: number;
    public BankAccountID: number;
    public PaymentDueDate: LocalDate;
    public InvoiceAddressLine1: string;
    public InvoiceReferenceID: number;
    public InvoiceAddressLine3: string;
    public PaymentTermsID: number;
    public Credited: boolean;
    public ShippingCountryCode: string;
    public DeliveryName: string;
    public RestAmount: number;
    public InvoiceNumber: string;
    public PrintStatus: number;
    public ShippingAddressLine2: string;
    public CurrencyCodeID: number;
    public UpdatedAt: Date;
    public DeliveryTerm: string;
    public Requisition: string;
    public CustomerName: string;
    public InvoiceAddressLine2: string;
    public InvoiceReceiverName: string;
    public DefaultSellerID: number;
    public PayableRoundingAmount: number;
    public AmountRegards: string;
    public InvoicePostalCode: string;
    public CreditedAmountCurrency: number;
    public InvoiceDate: LocalDate;
    public ShippingCity: string;
    public InvoiceNumberSeriesID: number;
    public CustomerOrgNumber: string;
    public CollectorStatusCode: number;
    public ExternalReference: string;
    public EmailAddress: string;
    public YourReference: string;
    public PaymentInfoTypeID: number;
    public ShippingCountry: string;
    public UpdateCurrencyAmountsOnDateChange: boolean;
    public Comment: string;
    public InvoiceCountryCode: string;
    public DistributionPlanID: number;
    public CustomerPerson: string;
    public TaxExclusiveAmount: number;
    public StatusCode: number;
    public PaymentTerm: string;
    public DeliveryDate: LocalDate;
    public VatTotalsAmount: number;
    public ShippingPostalCode: string;
    public VatTotalsAmountCurrency: number;
    public FreeTxt: string;
    public Payment: string;
    public CustomerID: number;
    public PaymentID: string;
    public JournalEntryID: number;
    public PayableRoundingCurrencyAmount: number;
    public ExternalStatus: number;
    public ShippingAddressLine1: string;
    public TaxInclusiveAmount: number;
    public ExternalDebtCollectionReference: string;
    public InvoiceCity: string;
    public UpdatedBy: string;
    public DontSendReminders: boolean;
    public CurrencyExchangeRate: number;
    public ExternalDebtCollectionNotes: string;
    public OurReference: string;
    public ShippingAddressLine3: string;
    public CreatedAt: Date;
    public SalesPerson: string;
    public CreditDays: number;
    public ID: number;
    public InvoiceType: number;
    public TaxExclusiveAmountCurrency: number;
    public InvoiceCountry: string;
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

    public Deleted: boolean;
    public Unit: string;
    public SumVat: number;
    public CreatedBy: string;
    public SumVatCurrency: number;
    public VatPercent: number;
    public InvoicePeriodEndDate: LocalDate;
    public CurrencyCodeID: number;
    public SumTotalIncVat: number;
    public UpdatedAt: Date;
    public PriceSetByUser: boolean;
    public CustomerInvoiceID: number;
    public CalculateGrossPriceBasedOnNetPrice: boolean;
    public VatTypeID: number;
    public DiscountCurrency: number;
    public PriceExVat: number;
    public DimensionsID: number;
    public SumTotalExVat: number;
    public Discount: number;
    public AccountID: number;
    public ItemText: string;
    public Comment: string;
    public ProductID: number;
    public ItemSourceID: number;
    public StatusCode: number;
    public CostPrice: number;
    public DiscountPercent: number;
    public SumTotalIncVatCurrency: number;
    public NumberOfItems: number;
    public UpdatedBy: string;
    public CurrencyExchangeRate: number;
    public CreatedAt: Date;
    public AccountingCost: string;
    public SortIndex: number;
    public InvoicePeriodStartDate: LocalDate;
    public ID: number;
    public PriceIncVat: number;
    public PriceExVatCurrency: number;
    public SumTotalExVatCurrency: number;
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

    public Deleted: boolean;
    public CreatedBy: string;
    public RestAmountCurrency: number;
    public InterestFeeCurrency: number;
    public ReminderNumber: number;
    public DueDate: LocalDate;
    public DebtCollectionFeeCurrency: number;
    public ReminderFeeCurrency: number;
    public RestAmount: number;
    public DebtCollectionFee: number;
    public CreatedByReminderRuleID: number;
    public CurrencyCodeID: number;
    public UpdatedAt: Date;
    public CustomerInvoiceID: number;
    public Notified: boolean;
    public Description: string;
    public DimensionsID: number;
    public EmailAddress: string;
    public RemindedDate: LocalDate;
    public StatusCode: number;
    public RunNumber: number;
    public Title: string;
    public UpdatedBy: string;
    public CurrencyExchangeRate: number;
    public ReminderFee: number;
    public CreatedAt: Date;
    public InterestFee: number;
    public ID: number;
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

    public Deleted: boolean;
    public CreatedBy: string;
    public CustomerInvoiceReminderSettingsID: number;
    public ReminderNumber: number;
    public RunAutomatically: boolean;
    public UpdatedAt: Date;
    public Description: string;
    public ReminderRuleType: number;
    public StatusCode: number;
    public Title: string;
    public MinimumDaysFromDueDate: number;
    public UpdatedBy: string;
    public ReminderFee: number;
    public CreatedAt: Date;
    public CreditDays: number;
    public ID: number;
    public UseMaximumLegalReminderFee: boolean;
    public _createguid: string;
    public CustomerInvoiceReminderSettings: CustomerInvoiceReminderSettings;
    public CustomFields: any;
}


export class CustomerInvoiceReminderSettings extends UniEntity {
    public static RelativeUrl = 'invoiceremindersettings';
    public static EntityType = 'CustomerInvoiceReminderSettings';

    public Deleted: boolean;
    public RemindersBeforeDebtCollection: number;
    public CreatedBy: string;
    public DefaultReminderFeeAccountID: number;
    public UpdatedAt: Date;
    public MinimumAmountToRemind: number;
    public DebtCollectionSettingsID: number;
    public RuleSetType: number;
    public UseReminderRuleTextsInEmails: boolean;
    public StatusCode: number;
    public AcceptPaymentWithoutReminderFee: boolean;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public ID: number;
    public _createguid: string;
    public CustomerInvoiceReminderRules: Array<CustomerInvoiceReminderRule>;
    public DebtCollectionSettings: DebtCollectionSettings;
    public DefaultReminderFeeAccount: Account;
    public CustomFields: any;
}


export class CustomerOrder extends UniEntity {
    public static RelativeUrl = 'orders';
    public static EntityType = 'CustomerOrder';

    public Deleted: boolean;
    public CreatedBy: string;
    public InternalNote: string;
    public RestAmountCurrency: number;
    public AccrualID: number;
    public UseReportID: number;
    public TaxInclusiveAmountCurrency: number;
    public DefaultDimensionsID: number;
    public SupplierOrgNumber: string;
    public DeliveryMethod: string;
    public DeliveryTermsID: number;
    public InvoiceAddressLine1: string;
    public InvoiceAddressLine3: string;
    public PaymentTermsID: number;
    public ShippingCountryCode: string;
    public DeliveryName: string;
    public PrintStatus: number;
    public ShippingAddressLine2: string;
    public CurrencyCodeID: number;
    public UpdatedAt: Date;
    public DeliveryTerm: string;
    public Requisition: string;
    public OrderNumberSeriesID: number;
    public CustomerName: string;
    public InvoiceAddressLine2: string;
    public InvoiceReceiverName: string;
    public DefaultSellerID: number;
    public ReadyToInvoice: boolean;
    public PayableRoundingAmount: number;
    public InvoicePostalCode: string;
    public ShippingCity: string;
    public CustomerOrgNumber: string;
    public OrderNumber: number;
    public EmailAddress: string;
    public YourReference: string;
    public UpdateCurrencyOnToInvoice: boolean;
    public PaymentInfoTypeID: number;
    public ShippingCountry: string;
    public UpdateCurrencyAmountsOnDateChange: boolean;
    public Comment: string;
    public InvoiceCountryCode: string;
    public DistributionPlanID: number;
    public CustomerPerson: string;
    public TaxExclusiveAmount: number;
    public StatusCode: number;
    public PaymentTerm: string;
    public DeliveryDate: LocalDate;
    public VatTotalsAmount: number;
    public ShippingPostalCode: string;
    public VatTotalsAmountCurrency: number;
    public FreeTxt: string;
    public CustomerID: number;
    public PayableRoundingCurrencyAmount: number;
    public ShippingAddressLine1: string;
    public RestExclusiveAmountCurrency: number;
    public TaxInclusiveAmount: number;
    public InvoiceCity: string;
    public UpdatedBy: string;
    public OrderDate: LocalDate;
    public CurrencyExchangeRate: number;
    public OurReference: string;
    public ShippingAddressLine3: string;
    public CreatedAt: Date;
    public SalesPerson: string;
    public CreditDays: number;
    public ID: number;
    public TaxExclusiveAmountCurrency: number;
    public InvoiceCountry: string;
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

    public Deleted: boolean;
    public Unit: string;
    public SumVat: number;
    public CreatedBy: string;
    public SumVatCurrency: number;
    public CustomerOrderID: number;
    public VatPercent: number;
    public CurrencyCodeID: number;
    public SumTotalIncVat: number;
    public UpdatedAt: Date;
    public PriceSetByUser: boolean;
    public CalculateGrossPriceBasedOnNetPrice: boolean;
    public VatTypeID: number;
    public DiscountCurrency: number;
    public ReadyToInvoice: boolean;
    public PriceExVat: number;
    public DimensionsID: number;
    public SumTotalExVat: number;
    public Discount: number;
    public AccountID: number;
    public ItemText: string;
    public Comment: string;
    public ProductID: number;
    public ItemSourceID: number;
    public StatusCode: number;
    public CostPrice: number;
    public DiscountPercent: number;
    public SumTotalIncVatCurrency: number;
    public NumberOfItems: number;
    public UpdatedBy: string;
    public CurrencyExchangeRate: number;
    public CreatedAt: Date;
    public SortIndex: number;
    public ID: number;
    public PriceIncVat: number;
    public PriceExVatCurrency: number;
    public SumTotalExVatCurrency: number;
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

    public Deleted: boolean;
    public UpdateCurrencyOnToOrder: boolean;
    public CreatedBy: string;
    public InternalNote: string;
    public UseReportID: number;
    public TaxInclusiveAmountCurrency: number;
    public DefaultDimensionsID: number;
    public SupplierOrgNumber: string;
    public DeliveryMethod: string;
    public DeliveryTermsID: number;
    public InvoiceAddressLine1: string;
    public InvoiceAddressLine3: string;
    public PaymentTermsID: number;
    public ShippingCountryCode: string;
    public DeliveryName: string;
    public PrintStatus: number;
    public ShippingAddressLine2: string;
    public CurrencyCodeID: number;
    public UpdatedAt: Date;
    public DeliveryTerm: string;
    public Requisition: string;
    public QuoteNumber: number;
    public CustomerName: string;
    public InvoiceAddressLine2: string;
    public InvoiceReceiverName: string;
    public DefaultSellerID: number;
    public PayableRoundingAmount: number;
    public InvoicePostalCode: string;
    public ShippingCity: string;
    public CustomerOrgNumber: string;
    public EmailAddress: string;
    public YourReference: string;
    public UpdateCurrencyOnToInvoice: boolean;
    public PaymentInfoTypeID: number;
    public ShippingCountry: string;
    public UpdateCurrencyAmountsOnDateChange: boolean;
    public Comment: string;
    public InvoiceCountryCode: string;
    public DistributionPlanID: number;
    public CustomerPerson: string;
    public TaxExclusiveAmount: number;
    public QuoteNumberSeriesID: number;
    public StatusCode: number;
    public PaymentTerm: string;
    public DeliveryDate: LocalDate;
    public VatTotalsAmount: number;
    public ShippingPostalCode: string;
    public VatTotalsAmountCurrency: number;
    public FreeTxt: string;
    public InquiryReference: number;
    public CustomerID: number;
    public PayableRoundingCurrencyAmount: number;
    public ShippingAddressLine1: string;
    public TaxInclusiveAmount: number;
    public InvoiceCity: string;
    public UpdatedBy: string;
    public QuoteDate: LocalDate;
    public CurrencyExchangeRate: number;
    public OurReference: string;
    public ShippingAddressLine3: string;
    public CreatedAt: Date;
    public ValidUntilDate: LocalDate;
    public SalesPerson: string;
    public CreditDays: number;
    public ID: number;
    public TaxExclusiveAmountCurrency: number;
    public InvoiceCountry: string;
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

    public Deleted: boolean;
    public Unit: string;
    public SumVat: number;
    public CreatedBy: string;
    public SumVatCurrency: number;
    public VatPercent: number;
    public CurrencyCodeID: number;
    public SumTotalIncVat: number;
    public UpdatedAt: Date;
    public PriceSetByUser: boolean;
    public CalculateGrossPriceBasedOnNetPrice: boolean;
    public VatTypeID: number;
    public DiscountCurrency: number;
    public PriceExVat: number;
    public CustomerQuoteID: number;
    public DimensionsID: number;
    public SumTotalExVat: number;
    public Discount: number;
    public AccountID: number;
    public ItemText: string;
    public Comment: string;
    public ProductID: number;
    public StatusCode: number;
    public CostPrice: number;
    public DiscountPercent: number;
    public SumTotalIncVatCurrency: number;
    public NumberOfItems: number;
    public UpdatedBy: string;
    public CurrencyExchangeRate: number;
    public CreatedAt: Date;
    public SortIndex: number;
    public ID: number;
    public PriceIncVat: number;
    public PriceExVatCurrency: number;
    public SumTotalExVatCurrency: number;
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

    public Deleted: boolean;
    public CreatedBy: string;
    public CustomerInvoiceReminderSettingsID: number;
    public IntegrateWithDebtCollection: boolean;
    public UpdatedAt: Date;
    public CreditorNumber: number;
    public StatusCode: number;
    public DebtCollectionFormat: number;
    public UpdatedBy: string;
    public DebtCollectionAutomationID: number;
    public CreatedAt: Date;
    public ID: number;
    public _createguid: string;
    public CustomerInvoiceReminderSettings: CustomerInvoiceReminderSettings;
    public DebtCollectionAutomation: Array<DebtCollectionAutomation>;
    public CustomFields: any;
}


export class ItemSource extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ItemSource';

    public Deleted: boolean;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public ID: number;
    public _createguid: string;
    public Details: Array<ItemSourceDetail>;
    public CustomFields: any;
}


export class ItemSourceDetail extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ItemSourceDetail';

    public Deleted: boolean;
    public CreatedBy: string;
    public Tag: string;
    public UpdatedAt: Date;
    public Description: string;
    public SourceType: string;
    public SourceFK: number;
    public ItemSourceID: number;
    public StatusCode: number;
    public Amount: number;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class PaymentInfoType extends UniEntity {
    public static RelativeUrl = 'paymentinfotype';
    public static EntityType = 'PaymentInfoType';

    public Deleted: boolean;
    public Type: PaymentInfoTypeEnum;
    public Control: Modulus;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Locked: boolean;
    public StatusCode: number;
    public Length: number;
    public UpdatedBy: string;
    public Name: string;
    public CreatedAt: Date;
    public ID: number;
    public _createguid: string;
    public PaymentInfoTypeParts: Array<PaymentInfoTypePart>;
    public CustomFields: any;
}


export class PaymentInfoTypePart extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'PaymentInfoTypePart';

    public Deleted: boolean;
    public CreatedBy: string;
    public Part: string;
    public UpdatedAt: Date;
    public PaymentInfoTypeID: number;
    public StatusCode: number;
    public Length: number;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public SortIndex: number;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class RecurringInvoice extends UniEntity {
    public static RelativeUrl = 'recurringinvoices';
    public static EntityType = 'RecurringInvoice';

    public Deleted: boolean;
    public PaymentInformation: string;
    public CreatedBy: string;
    public InternalNote: string;
    public NotifyWhenOrdersArePrepared: boolean;
    public UseReportID: number;
    public TaxInclusiveAmountCurrency: number;
    public DefaultDimensionsID: number;
    public SupplierOrgNumber: string;
    public DeliveryMethod: string;
    public DeliveryTermsID: number;
    public PreparationDays: number;
    public InvoiceAddressLine1: string;
    public NextInvoiceDate: LocalDate;
    public InvoiceAddressLine3: string;
    public PaymentTermsID: number;
    public EndDate: LocalDate;
    public ShippingCountryCode: string;
    public DeliveryName: string;
    public NotifyWhenRecurringEnds: boolean;
    public StartDate: LocalDate;
    public PrintStatus: number;
    public ShippingAddressLine2: string;
    public CurrencyCodeID: number;
    public UpdatedAt: Date;
    public DeliveryTerm: string;
    public Requisition: string;
    public TimePeriod: RecurringPeriod;
    public CustomerName: string;
    public InvoiceAddressLine2: string;
    public InvoiceReceiverName: string;
    public DefaultSellerID: number;
    public PayableRoundingAmount: number;
    public AmountRegards: string;
    public InvoicePostalCode: string;
    public ShippingCity: string;
    public InvoiceNumberSeriesID: number;
    public NotifyUser: string;
    public CustomerOrgNumber: string;
    public EmailAddress: string;
    public YourReference: string;
    public PaymentInfoTypeID: number;
    public ShippingCountry: string;
    public UpdateCurrencyAmountsOnDateChange: boolean;
    public Comment: string;
    public InvoiceCountryCode: string;
    public DistributionPlanID: number;
    public CustomerPerson: string;
    public TaxExclusiveAmount: number;
    public StatusCode: number;
    public PaymentTerm: string;
    public DeliveryDate: LocalDate;
    public VatTotalsAmount: number;
    public ShippingPostalCode: string;
    public VatTotalsAmountCurrency: number;
    public FreeTxt: string;
    public Payment: string;
    public CustomerID: number;
    public PayableRoundingCurrencyAmount: number;
    public ShippingAddressLine1: string;
    public ProduceAs: RecurringResult;
    public TaxInclusiveAmount: number;
    public InvoiceCity: string;
    public UpdatedBy: string;
    public CurrencyExchangeRate: number;
    public NoCreditDays: boolean;
    public OurReference: string;
    public ShippingAddressLine3: string;
    public CreatedAt: Date;
    public Interval: number;
    public SalesPerson: string;
    public CreditDays: number;
    public ID: number;
    public TaxExclusiveAmountCurrency: number;
    public InvoiceCountry: string;
    public MaxIterations: number;
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

    public Deleted: boolean;
    public Unit: string;
    public SumVat: number;
    public CreatedBy: string;
    public SumVatCurrency: number;
    public VatPercent: number;
    public CurrencyCodeID: number;
    public SumTotalIncVat: number;
    public UpdatedAt: Date;
    public PriceSetByUser: boolean;
    public CalculateGrossPriceBasedOnNetPrice: boolean;
    public VatTypeID: number;
    public DiscountCurrency: number;
    public RecurringInvoiceID: number;
    public PriceExVat: number;
    public DimensionsID: number;
    public SumTotalExVat: number;
    public Discount: number;
    public AccountID: number;
    public ItemText: string;
    public Comment: string;
    public ProductID: number;
    public StatusCode: number;
    public TimeFactor: RecurringPeriod;
    public ReduceIncompletePeriod: boolean;
    public DiscountPercent: number;
    public PricingSource: PricingSource;
    public SumTotalIncVatCurrency: number;
    public NumberOfItems: number;
    public UpdatedBy: string;
    public CurrencyExchangeRate: number;
    public CreatedAt: Date;
    public SortIndex: number;
    public ID: number;
    public PriceIncVat: number;
    public PriceExVatCurrency: number;
    public SumTotalExVatCurrency: number;
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

    public Deleted: boolean;
    public CreatedBy: string;
    public CreationDate: LocalDate;
    public OrderID: number;
    public IterationNumber: number;
    public NotifiedOrdersPrepared: boolean;
    public UpdatedAt: Date;
    public RecurringInvoiceID: number;
    public InvoiceDate: LocalDate;
    public Comment: string;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public InvoiceID: number;
    public ID: number;
    public NotifiedRecurringEnds: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class Seller extends UniEntity {
    public static RelativeUrl = 'sellers';
    public static EntityType = 'Seller';

    public Deleted: boolean;
    public CreatedBy: string;
    public TeamID: number;
    public DefaultDimensionsID: number;
    public UpdatedAt: Date;
    public UserID: number;
    public EmployeeID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public Name: string;
    public CreatedAt: Date;
    public ID: number;
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

    public Deleted: boolean;
    public CreatedBy: string;
    public CustomerOrderID: number;
    public UpdatedAt: Date;
    public CustomerInvoiceID: number;
    public SellerID: number;
    public RecurringInvoiceID: number;
    public CustomerQuoteID: number;
    public Percent: number;
    public StatusCode: number;
    public Amount: number;
    public CustomerID: number;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public ID: number;
    public _createguid: string;
    public Seller: Seller;
    public CustomFields: any;
}


export class SubCompany extends UniEntity {
    public static RelativeUrl = 'subcompanies';
    public static EntityType = 'SubCompany';

    public Deleted: boolean;
    public CreatedBy: string;
    public CompanyKey: string;
    public CompanyName: string;
    public UpdatedAt: Date;
    public CompanyID: number;
    public StatusCode: number;
    public CustomerID: number;
    public CompanyType: CompanyRelation;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public ID: number;
    public _createguid: string;
    public Customer: Customer;
    public CustomFields: any;
}


export class Supplier extends UniEntity {
    public static RelativeUrl = 'suppliers';
    public static EntityType = 'Supplier';

    public Deleted: boolean;
    public OrgNumber: string;
    public CreatedBy: string;
    public BusinessRelationID: number;
    public PeppolAddress: string;
    public CurrencyCodeID: number;
    public UpdatedAt: Date;
    public WebUrl: string;
    public GLN: string;
    public DimensionsID: number;
    public CostAllocationID: number;
    public StatusCode: number;
    public SupplierNumber: number;
    public Localization: string;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public SubAccountNumberSeriesID: number;
    public CreditDays: number;
    public ID: number;
    public SelfEmployed: boolean;
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
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Description: string;
    public StatusCode: number;
    public UpdatedBy: string;
    public Name: string;
    public TermsType: TermsType;
    public CreatedAt: Date;
    public CreditDays: number;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class TOFCurrencySettings extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'TOFCurrencySettings';

    public Deleted: boolean;
    public UpdateCurrencyAmountsOnQuotedateChange: boolean;
    public CreatedBy: string;
    public UpdateCurrencyAmountsOnQuoteToOrder: boolean;
    public UpdateCurrencyAmountsOnQuoteToInvoice: boolean;
    public UpdatedAt: Date;
    public UpdateCurrencyAmountsOnInvoicedateChange: boolean;
    public UpdateCurrencyAmountsOnOrderdateChange: boolean;
    public StatusCode: number;
    public UpdateCurrencyAmountsOnOrderToInvoice: boolean;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class Address extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Address';

    public Deleted: boolean;
    public CreatedBy: string;
    public PostalCode: string;
    public Country: string;
    public AddressLine3: string;
    public BusinessRelationID: number;
    public CountryCode: string;
    public UpdatedAt: Date;
    public Region: string;
    public AddressLine2: string;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public AddressLine1: string;
    public City: string;
    public ID: number;
    public _createguid: string;
    public BusinessRelation: BusinessRelation;
    public CustomFields: any;
}


export class BusinessRelation extends UniEntity {
    public static RelativeUrl = 'business-relations';
    public static EntityType = 'BusinessRelation';

    public Deleted: boolean;
    public DefaultBankAccountID: number;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public DefaultPhoneID: number;
    public InvoiceAddressID: number;
    public ShippingAddressID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public Name: string;
    public CreatedAt: Date;
    public DefaultEmailID: number;
    public ID: number;
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
    public CreatedBy: string;
    public ParentBusinessRelationID: number;
    public UpdatedAt: Date;
    public InfoID: number;
    public Comment: string;
    public Role: string;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public ID: number;
    public _createguid: string;
    public ParentBusinessRelation: BusinessRelation;
    public Info: BusinessRelation;
    public CustomFields: any;
}


export class Email extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Email';

    public Deleted: boolean;
    public Type: string;
    public CreatedBy: string;
    public BusinessRelationID: number;
    public UpdatedAt: Date;
    public Description: string;
    public EmailAddress: string;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class Phone extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Phone';

    public Deleted: boolean;
    public Type: PhoneTypeEnum;
    public CreatedBy: string;
    public BusinessRelationID: number;
    public CountryCode: string;
    public UpdatedAt: Date;
    public Description: string;
    public StatusCode: number;
    public Number: string;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class AGACalculation extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AGACalculation';

    public Deleted: boolean;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public DimensionsID: number;
    public StatusCode: number;
    public PayrollRunID: number;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public ID: number;
    public _createguid: string;
    public agaDraw: Array<AGADraw>;
    public agaPension: Array<AGAPension>;
    public agaTax: Array<AGATax>;
    public freeAmountUsed: Array<FreeAmountUsed>;
    public foreignerWithAmount: Array<ForeignerWithAmount>;
    public foreignerWithPercent: Array<ForeignerWithPercent>;
    public drawForeignerWithPercent: Array<DrawForeignerWithPercent>;
    public payrollRun: PayrollRun;
    public Dimensions: Dimensions;
    public CustomFields: any;
}


export class FreeAmountUsed extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'FreeAmountUsed';

    public Deleted: boolean;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public SubEntityID: number;
    public AGACalculationID: number;
    public freeAmount: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public ID: number;
    public _createguid: string;
    public subEntity: SubEntity;
    public CustomFields: any;
}


export class AGATax extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AGATax';

    public Deleted: boolean;
    public CreatedBy: string;
    public agaBase: number;
    public UpdatedAt: Date;
    public beregningsKode: number;
    public SubEntityID: number;
    public AGARateID: number;
    public AGACalculationID: number;
    public agaRate: number;
    public zone: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public ID: number;
    public municipalityName: string;
    public _createguid: string;
    public zoneName: string;
    public subEntity: SubEntity;
    public CustomFields: any;
}


export class AGAPension extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AGAPension';

    public Deleted: boolean;
    public CreatedBy: string;
    public agaBase: number;
    public UpdatedAt: Date;
    public beregningsKode: number;
    public SubEntityID: number;
    public AGARateID: number;
    public AGACalculationID: number;
    public agaRate: number;
    public zone: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public ID: number;
    public municipalityName: string;
    public _createguid: string;
    public zoneName: string;
    public subEntity: SubEntity;
    public CustomFields: any;
}


export class AGADraw extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AGADraw';

    public Deleted: boolean;
    public CreatedBy: string;
    public agaBase: number;
    public UpdatedAt: Date;
    public beregningsKode: number;
    public SubEntityID: number;
    public AGARateID: number;
    public AGACalculationID: number;
    public agaRate: number;
    public zone: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public ID: number;
    public municipalityName: string;
    public _createguid: string;
    public zoneName: string;
    public subEntity: SubEntity;
    public CustomFields: any;
}


export class ForeignerWithPercent extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ForeignerWithPercent';

    public Deleted: boolean;
    public CreatedBy: string;
    public agaBase: number;
    public UpdatedAt: Date;
    public SubEntityID: number;
    public AGACalculationID: number;
    public agaRate: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public ID: number;
    public municipalityName: string;
    public _createguid: string;
    public zoneName: string;
    public subEntity: SubEntity;
    public CustomFields: any;
}


export class DrawForeignerWithPercent extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'DrawForeignerWithPercent';

    public Deleted: boolean;
    public CreatedBy: string;
    public agaBase: number;
    public UpdatedAt: Date;
    public SubEntityID: number;
    public AGACalculationID: number;
    public agaRate: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public ID: number;
    public municipalityName: string;
    public _createguid: string;
    public zoneName: string;
    public subEntity: SubEntity;
    public CustomFields: any;
}


export class ForeignerWithAmount extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ForeignerWithAmount';

    public Deleted: boolean;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public SubEntityID: number;
    public AGACalculationID: number;
    public persons: number;
    public aga: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public ID: number;
    public municipalityName: string;
    public _createguid: string;
    public zoneName: string;
    public subEntity: SubEntity;
    public CustomFields: any;
}


export class TaxAndAgaSums extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'TaxAndAgaSums';

    public Deleted: boolean;
    public CreatedBy: string;
    public GarnishmentTax: number;
    public UpdatedAt: Date;
    public WithholdingTax: number;
    public FinancialTax: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class AmeldingData extends UniEntity {
    public static RelativeUrl = 'amelding';
    public static EntityType = 'AmeldingData';

    public Deleted: boolean;
    public type: AmeldingType;
    public CreatedBy: string;
    public OppgaveHash: string;
    public status: number;
    public period: number;
    public mainFileID: number;
    public altinnStatus: string;
    public replacesID: number;
    public UpdatedAt: Date;
    public messageID: string;
    public attachmentFileID: number;
    public feedbackFileID: number;
    public created: Date;
    public StatusCode: number;
    public PayrollRunID: number;
    public year: number;
    public initiated: Date;
    public UpdatedBy: string;
    public sent: Date;
    public CreatedAt: Date;
    public ID: number;
    public receiptID: number;
    public _createguid: string;
    public replaceThis: string;
    public xmlValidationErrors: string;
    public log: Array<AmeldingLog>;
    public CustomFields: any;
}


export class AmeldingLog extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AmeldingLog';

    public Deleted: boolean;
    public CreatedBy: string;
    public AmeldingsID: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public UpdatedBy: string;
    public key: number;
    public CreatedAt: Date;
    public ID: number;
    public registry: SalaryRegistry;
    public _createguid: string;
    public CustomFields: any;
}


export class BasicAmount extends UniEntity {
    public static RelativeUrl = 'basicamounts';
    public static EntityType = 'BasicAmount';

    public Deleted: boolean;
    public CreatedBy: string;
    public FromDate: Date;
    public ConversionFactor: number;
    public UpdatedAt: Date;
    public BasicAmountPrMonth: number;
    public AveragePrYear: number;
    public StatusCode: number;
    public BasicAmountPrYear: number;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class CompanySalary extends UniEntity {
    public static RelativeUrl = 'companysalary';
    public static EntityType = 'CompanySalary';

    public Deleted: boolean;
    public CreatedBy: string;
    public Base_NettoPaymentForMaritim: boolean;
    public PaycheckZipReportID: number;
    public MainAccountCostFinancial: number;
    public MainAccountAllocatedFinancialVacation: number;
    public Base_SpesialDeductionForMaritim: boolean;
    public UpdatedAt: Date;
    public Base_TaxFreeOrganization: boolean;
    public OtpExportActive: boolean;
    public Base_JanMayenAndBiCountries: boolean;
    public PostToTaxDraw: boolean;
    public AnnualStatementZipReportID: number;
    public HoursPerMonth: number;
    public WagetypeAdvancePayment: number;
    public MainAccountCostFinancialVacation: number;
    public MainAccountCostAGAVacation: number;
    public CalculateFinancialTax: boolean;
    public PostGarnishmentToTaxAccount: boolean;
    public FreeAmount: number;
    public MainAccountAllocatedAGAVacation: number;
    public InterrimRemitAccount: number;
    public HourFTEs: number;
    public Base_Svalbard: boolean;
    public MainAccountCostAGA: number;
    public MainAccountAllocatedVacation: number;
    public StatusCode: number;
    public WagetypeAdvancePaymentAuto: number;
    public PaymentInterval: CompanySalaryPaymentInterval;
    public MainAccountAllocatedAGA: number;
    public Base_PayAsYouEarnTaxOnPensions: boolean;
    public UpdatedBy: string;
    public Base_NettoPayment: boolean;
    public RateFinancialTax: number;
    public WageDeductionDueToHoliday: WageDeductionDueToHolidayType;
    public CreatedAt: Date;
    public MainAccountCostVacation: number;
    public MainAccountAllocatedFinancial: number;
    public AllowOver6G: boolean;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class CompanyVacationRate extends UniEntity {
    public static RelativeUrl = 'companyvacationrates';
    public static EntityType = 'CompanyVacationRate';

    public Deleted: boolean;
    public Rate: number;
    public CreatedBy: string;
    public FromDate: Date;
    public UpdatedAt: Date;
    public Rate60: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class EmployeeCategory extends UniEntity {
    public static RelativeUrl = 'employeecategories';
    public static EntityType = 'EmployeeCategory';

    public Deleted: boolean;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public EmployeeCategoryLinkID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public Name: string;
    public CreatedAt: Date;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class EmployeeCategoryLink extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'EmployeeCategoryLink';

    public Deleted: boolean;
    public CreatedBy: string;
    public EmployeeCategoryID: number;
    public UpdatedAt: Date;
    public EmployeeNumber: number;
    public EmployeeID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public ID: number;
    public _createguid: string;
    public EmployeeCategory: EmployeeCategory;
    public Employee: Employee;
    public CustomFields: any;
}


export class Employee extends UniEntity {
    public static RelativeUrl = 'employees';
    public static EntityType = 'Employee';

    public Deleted: boolean;
    public CreatedBy: string;
    public InternationalID: string;
    public SocialSecurityNumber: string;
    public FreeText: string;
    public MunicipalityNo: string;
    public IncludeOtpUntilYear: number;
    public BusinessRelationID: number;
    public EndDate: LocalDate;
    public UpdatedAt: Date;
    public UserID: number;
    public EmployeeNumber: number;
    public PhotoID: number;
    public SubEntityID: number;
    public InternasjonalIDCountry: string;
    public IncludeOtpUntilMonth: number;
    public ForeignWorker: ForeignWorker;
    public Active: boolean;
    public AdvancePaymentAmount: number;
    public Sex: GenderEnum;
    public EndDateOtp: LocalDate;
    public StatusCode: number;
    public BirthDate: Date;
    public OtpStatus: OtpStatus;
    public TypeOfPaymentOtp: TypeOfPaymentOtp;
    public PaymentInterval: PaymentInterval;
    public UpdatedBy: string;
    public EmploymentDateOtp: LocalDate;
    public OtpExport: boolean;
    public InternasjonalIDType: InternationalIDType;
    public EmploymentDate: Date;
    public EmployeeLanguageID: number;
    public CreatedAt: Date;
    public ID: number;
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

    public Deleted: boolean;
    public IssueDate: Date;
    public CreatedBy: string;
    public TaxcardId: number;
    public SecondaryTable: string;
    public loennKunTrygdeavgiftTilUtenlandskBorgerSomGrensegjengerID: number;
    public SecondaryPercent: number;
    public loennFraBiarbeidsgiverID: number;
    public Tilleggsopplysning: string;
    public UpdatedAt: Date;
    public ufoereYtelserAndreID: number;
    public Table: string;
    public EmployeeNumber: number;
    public ResultatStatus: string;
    public Percent: number;
    public NotMainEmployer: boolean;
    public EmployeeID: number;
    public StatusCode: number;
    public loennTilUtenrikstjenestemannID: number;
    public pensjonID: number;
    public Year: number;
    public SKDXml: string;
    public loennFraHovedarbeidsgiverID: number;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public ID: number;
    public NonTaxableAmount: number;
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

    public Deleted: boolean;
    public CreatedBy: string;
    public freeAmountType: FreeAmountType;
    public AntallMaanederForTrekk: number;
    public UpdatedAt: Date;
    public Table: string;
    public tabellType: TabellType;
    public Percent: number;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public ID: number;
    public NonTaxableAmount: number;
    public _createguid: string;
    public CustomFields: any;
}


export class EmployeeLeave extends UniEntity {
    public static RelativeUrl = 'EmployeeLeave';
    public static EntityType = 'EmployeeLeave';

    public Deleted: boolean;
    public CreatedBy: string;
    public FromDate: Date;
    public LeavePercent: number;
    public LeaveType: Leavetype;
    public UpdatedAt: Date;
    public EmploymentID: number;
    public Description: string;
    public ToDate: Date;
    public AffectsOtp: boolean;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public ID: number;
    public _createguid: string;
    public Employment: Employment;
    public CustomFields: any;
}


export class Employment extends UniEntity {
    public static RelativeUrl = 'employments';
    public static EntityType = 'Employment';

    public Deleted: boolean;
    public RegulativeGroupID: number;
    public CreatedBy: string;
    public Standard: boolean;
    public EmploymentType: EmploymentType;
    public RegulativeStepNr: number;
    public ShipReg: ShipRegistry;
    public TradeArea: ShipTradeArea;
    public RemunerationType: RemunerationType;
    public EndDate: Date;
    public JobCode: string;
    public StartDate: Date;
    public UpdatedAt: Date;
    public SeniorityDate: Date;
    public WorkingHoursScheme: WorkingHoursScheme;
    public WorkPercent: number;
    public EmployeeNumber: number;
    public DimensionsID: number;
    public LastWorkPercentChangeDate: Date;
    public EndDateReason: EndDateReason;
    public SubEntityID: number;
    public EmployeeID: number;
    public StatusCode: number;
    public PayGrade: string;
    public TypeOfEmployment: TypeOfEmployment;
    public JobName: string;
    public UserDefinedRate: number;
    public HoursPerWeek: number;
    public UpdatedBy: string;
    public LastSalaryChangeDate: Date;
    public LedgerAccount: string;
    public HourRate: number;
    public CreatedAt: Date;
    public ID: number;
    public ShipType: ShipTypeOfShip;
    public MonthRate: number;
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
    public CreatedBy: string;
    public AffectsAGA: boolean;
    public FromDate: Date;
    public UpdatedAt: Date;
    public Description: string;
    public SubentityID: number;
    public StatusCode: number;
    public Amount: number;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class IncomeReportData extends UniEntity {
    public static RelativeUrl = 'income-reports';
    public static EntityType = 'IncomeReportData';

    public Deleted: boolean;
    public Type: string;
    public CreatedBy: string;
    public Xml: string;
    public UpdatedAt: Date;
    public AltinnReceiptID: number;
    public EmploymentID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public MonthlyRefund: number;
    public CreatedAt: Date;
    public ID: number;
    public _createguid: string;
    public AltinnReceipt: AltinnReceipt;
    public Employment: Employment;
    public CustomFields: any;
}


export class OtpExportWagetype extends UniEntity {
    public static RelativeUrl = 'otpexportwagetypes';
    public static EntityType = 'OtpExportWagetype';

    public Deleted: boolean;
    public CreatedBy: string;
    public WageTypeNumber: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class PayrollRun extends UniEntity {
    public static RelativeUrl = 'payrollrun';
    public static EntityType = 'PayrollRun';

    public Deleted: boolean;
    public CreatedBy: string;
    public PaycheckFileID: number;
    public FromDate: Date;
    public FreeText: string;
    public UpdatedAt: Date;
    public SettlementDate: Date;
    public Description: string;
    public needsRecalc: boolean;
    public HolidayPayDeduction: boolean;
    public ToDate: Date;
    public taxdrawfactor: TaxDrawFactor;
    public StatusCode: number;
    public UpdatedBy: string;
    public PayDate: Date;
    public ExcludeRecurringPosts: boolean;
    public AGAonRun: number;
    public CreatedAt: Date;
    public ID: number;
    public JournalEntryNumber: string;
    public AGAFreeAmount: number;
    public _createguid: string;
    public transactions: Array<SalaryTransaction>;
    public agacalculation: Array<AGACalculation>;
    public CustomFields: any;
}


export class PayrollRunCategoryLink extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'PayrollRunCategoryLink';

    public Deleted: boolean;
    public CreatedBy: string;
    public EmployeeCategoryID: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public PayrollRunID: number;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public ID: number;
    public _createguid: string;
    public EmployeeCategory: EmployeeCategory;
    public PayrollRun: PayrollRun;
    public CustomFields: any;
}


export class PostingSummaryDraft extends UniEntity {
    public status: SummaryJobStatus;
    public draftWithDims: string;
    public statusTime: Date;
    public PayrollID: number;
    public draftBasic: string;
    public draftWithDimsOnBalance: string;
    public JobInfoID: number;
    public ID: number;
}


export class Regulative extends UniEntity {
    public static RelativeUrl = 'regulatives';
    public static EntityType = 'Regulative';

    public Deleted: boolean;
    public RegulativeGroupID: number;
    public CreatedBy: string;
    public StartDate: LocalDate;
    public UpdatedAt: Date;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public ID: number;
    public _createguid: string;
    public Steps: Array<RegulativeStep>;
    public CustomFields: any;
}


export class RegulativeGroup extends UniEntity {
    public static RelativeUrl = 'regulativegroups';
    public static EntityType = 'RegulativeGroup';

    public Deleted: boolean;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public UpdatedBy: string;
    public Name: string;
    public CreatedAt: Date;
    public ID: number;
    public _createguid: string;
    public Regulatives: Array<Regulative>;
    public CustomFields: any;
}


export class RegulativeStep extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'RegulativeStep';

    public Deleted: boolean;
    public CreatedBy: string;
    public RegulativeID: number;
    public UpdatedAt: Date;
    public Step: number;
    public StatusCode: number;
    public Amount: number;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class SalaryBalance extends UniEntity {
    public static RelativeUrl = 'salarybalances';
    public static EntityType = 'SalaryBalance';

    public Deleted: boolean;
    public Type: SalBalDrawType;
    public CreatedBy: string;
    public FromDate: Date;
    public Instalment: number;
    public WageTypeNumber: number;
    public SalaryBalanceTemplateID: number;
    public UpdatedAt: Date;
    public InstalmentType: SalBalType;
    public SupplierID: number;
    public EmploymentID: number;
    public ToDate: Date;
    public Source: SalBalSource;
    public EmployeeID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public MinAmount: number;
    public Name: string;
    public CreatePayment: boolean;
    public MaxAmount: number;
    public KID: string;
    public CreatedAt: Date;
    public ID: number;
    public InstalmentPercent: number;
    public CalculatedBalance: number;
    public _createguid: string;
    public Amount: number;
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

    public Deleted: boolean;
    public CreatedBy: string;
    public Date: LocalDate;
    public SalaryTransactionID: number;
    public UpdatedAt: Date;
    public Description: string;
    public SalaryBalanceID: number;
    public StatusCode: number;
    public Amount: number;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public ID: number;
    public _createguid: string;
    public SalaryTransaction: SalaryTransaction;
    public SalaryBalance: SalaryBalance;
    public CustomFields: any;
}


export class SalaryBalanceTemplate extends UniEntity {
    public static RelativeUrl = 'salarybalancetemplates';
    public static EntityType = 'SalaryBalanceTemplate';

    public Deleted: boolean;
    public CreatedBy: string;
    public Account: number;
    public Instalment: number;
    public WageTypeNumber: number;
    public UpdatedAt: Date;
    public InstalmentType: SalBalType;
    public SupplierID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public MinAmount: number;
    public Name: string;
    public CreatePayment: boolean;
    public MaxAmount: number;
    public KID: string;
    public CreatedAt: Date;
    public ID: number;
    public SalarytransactionDescription: string;
    public InstalmentPercent: number;
    public _createguid: string;
    public Supplier: Supplier;
    public SalaryBalances: Array<SalaryBalance>;
    public CustomFields: any;
}


export class SalaryTransaction extends UniEntity {
    public static RelativeUrl = 'salarytrans';
    public static EntityType = 'SalaryTransaction';

    public Deleted: boolean;
    public TaxbasisID: number;
    public Rate: number;
    public CreatedBy: string;
    public Account: number;
    public FromDate: Date;
    public calcAGA: number;
    public MunicipalityNo: string;
    public WageTypeNumber: number;
    public SystemType: StdSystemType;
    public Sum: number;
    public UpdatedAt: Date;
    public EmploymentID: number;
    public VatTypeID: number;
    public EmployeeNumber: number;
    public DimensionsID: number;
    public SalaryBalanceID: number;
    public recurringPostValidFrom: Date;
    public Text: string;
    public HolidayPayDeduction: boolean;
    public ToDate: Date;
    public SalaryTransactionCarInfoID: number;
    public RecurringID: number;
    public recurringPostValidTo: Date;
    public EmployeeID: number;
    public StatusCode: number;
    public IsRecurringPost: boolean;
    public Amount: number;
    public PayrollRunID: number;
    public UpdatedBy: string;
    public WageTypeID: number;
    public CreatedAt: Date;
    public ID: number;
    public ChildSalaryTransactionID: number;
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

    public Deleted: boolean;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public IsElectric: boolean;
    public UpdatedBy: string;
    public RegistrationYear: number;
    public CreatedAt: Date;
    public IsLongRange: boolean;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class SalaryTransactionSupplement extends UniEntity {
    public static RelativeUrl = 'supplements';
    public static EntityType = 'SalaryTransactionSupplement';

    public Deleted: boolean;
    public ValueDate2: Date;
    public CreatedBy: string;
    public ValueDate: Date;
    public SalaryTransactionID: number;
    public UpdatedAt: Date;
    public ValueBool: boolean;
    public ValueMoney: number;
    public WageTypeSupplementID: number;
    public ValueString: string;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public ID: number;
    public _createguid: string;
    public WageTypeSupplement: WageTypeSupplement;
    public CustomFields: any;
}


export class SalaryYear extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'SalaryYear';

    public Deleted: boolean;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public CurrentYear: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class SubEntity extends UniEntity {
    public static RelativeUrl = 'subentities';
    public static EntityType = 'SubEntity';

    public Deleted: boolean;
    public OrgNumber: string;
    public CreatedBy: string;
    public MunicipalityNo: string;
    public SuperiorOrganizationID: number;
    public AgaZone: number;
    public BusinessRelationID: number;
    public UpdatedAt: Date;
    public freeAmount: number;
    public StatusCode: number;
    public AgaRule: number;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public ID: number;
    public _createguid: string;
    public BusinessRelationInfo: BusinessRelation;
    public SuperiorOrganization: SubEntity;
    public CustomFields: any;
}


export class TaxBasis extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'TaxBasis';

    public Deleted: boolean;
    public CreatedBy: string;
    public DisabilityOtherBasis: number;
    public SailorBasis: number;
    public ForeignBorderCommuterBasis: number;
    public SalaryTransactionID: number;
    public UpdatedAt: Date;
    public PensionBasis: number;
    public ForeignCitizenInsuranceBasis: number;
    public StatusCode: number;
    public JanMayenBasis: number;
    public SvalbardBasis: number;
    public UpdatedBy: string;
    public PensionSourcetaxBasis: number;
    public Basis: number;
    public CreatedAt: Date;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class Travel extends UniEntity {
    public static RelativeUrl = 'travels';
    public static EntityType = 'Travel';

    public Deleted: boolean;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public SupplierID: number;
    public Description: string;
    public EmployeeNumber: number;
    public DimensionsID: number;
    public SourceSystem: string;
    public Comment: string;
    public State: state;
    public StatusCode: number;
    public UpdatedBy: string;
    public Phone: string;
    public Name: string;
    public TravelIdentificator: string;
    public PersonID: string;
    public CreatedAt: Date;
    public Purpose: string;
    public Email: string;
    public ID: number;
    public _createguid: string;
    public AdvanceAmount: number;
    public TravelLines: Array<TravelLine>;
    public Dimensions: Dimensions;
    public CustomFields: any;
}


export class TravelLine extends UniEntity {
    public static RelativeUrl = 'travellines';
    public static EntityType = 'TravelLine';

    public Deleted: boolean;
    public Rate: number;
    public CreatedBy: string;
    public AccountNumber: number;
    public LineState: linestate;
    public paytransID: number;
    public UpdatedAt: Date;
    public VatTypeID: number;
    public Description: string;
    public TypeID: number;
    public DimensionsID: number;
    public CostType: costtype;
    public TravelID: number;
    public From: Date;
    public StatusCode: number;
    public Amount: number;
    public InvoiceAccount: number;
    public UpdatedBy: string;
    public To: Date;
    public TravelIdentificator: string;
    public CreatedAt: Date;
    public ID: number;
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

    public Deleted: boolean;
    public CreatedBy: string;
    public WageTypeNumber: number;
    public UpdatedAt: Date;
    public Description: string;
    public StatusCode: number;
    public InvoiceAccount: number;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public ID: number;
    public ForeignDescription: string;
    public ForeignTypeID: string;
    public _createguid: string;
    public CustomFields: any;
}


export class VacationPayLine extends UniEntity {
    public static RelativeUrl = 'VacationPayLines';
    public static EntityType = 'VacationPayLine';

    public Deleted: boolean;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public EmployeeID: number;
    public StatusCode: number;
    public Year: number;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public ID: number;
    public ManualVacationPayBase: number;
    public Rate: number;
    public SystemVacationPayBase: number;
    public PaidVacationPay: number;
    public MissingEarlierVacationPay: number;
    public VacationPay: number;
    public Age: number;
    public Withdrawal: number;
    public Rate60: number;
    public _createguid: string;
    public PaidTaxFreeVacationPay: number;
    public VacationPay60: number;
    public Employee: Employee;
    public CustomFields: any;
}


export class VacationRateEmployee extends UniEntity {
    public static RelativeUrl = 'employeevacationrates';
    public static EntityType = 'VacationRateEmployee';

    public Deleted: boolean;
    public Rate: number;
    public CreatedBy: string;
    public EndDate: Date;
    public StartDate: Date;
    public UpdatedAt: Date;
    public Rate60: number;
    public EmployeeID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class WageType extends UniEntity {
    public static RelativeUrl = 'wagetypes';
    public static EntityType = 'WageType';

    public Deleted: boolean;
    public FixedSalaryHolidayDeduction: boolean;
    public Rate: number;
    public CreatedBy: string;
    public Base_Vacation: boolean;
    public AccountNumber: number;
    public SpecialTaxHandling: string;
    public WageTypeNumber: number;
    public Systemtype: string;
    public Postnr: string;
    public Limit_type: LimitType;
    public taxtype: TaxType;
    public UpdatedAt: Date;
    public ValidYear: number;
    public Benefit: string;
    public IncomeType: string;
    public Limit_value: number;
    public Description: string;
    public SpecialAgaRule: SpecialAgaRule;
    public Limit_WageTypeNumber: number;
    public GetRateFrom: GetRateFrom;
    public RateFactor: number;
    public DaysOnBoard: boolean;
    public NoNumberOfHours: boolean;
    public SpecialTaxAndContributionsRule: SpecialTaxAndContributionsRule;
    public StatusCode: number;
    public SystemRequiredWageType: number;
    public UpdatedBy: string;
    public HideFromPaycheck: boolean;
    public Limit_newRate: number;
    public RatetypeColumn: RateTypeColumn;
    public StandardWageTypeFor: StdWageType;
    public CreatedAt: Date;
    public Base_div2: boolean;
    public Base_div3: boolean;
    public WageTypeName: string;
    public ID: number;
    public AccountNumber_balance: number;
    public SupplementPackage: string;
    public Base_Payment: boolean;
    public Base_EmploymentTax: boolean;
    public _createguid: string;
    public SupplementaryInformations: Array<WageTypeSupplement>;
    public CustomFields: any;
}


export class WageTypeSupplement extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'WageTypeSupplement';

    public Deleted: boolean;
    public ameldingType: string;
    public CreatedBy: string;
    public GetValueFromTrans: boolean;
    public UpdatedAt: Date;
    public Description: string;
    public SuggestedValue: string;
    public StatusCode: number;
    public UpdatedBy: string;
    public Name: string;
    public WageTypeID: number;
    public CreatedAt: Date;
    public ValueType: Valuetype;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class WageTypeTranslation extends UniEntity {
    public static RelativeUrl = 'wagetypetranslations';
    public static EntityType = 'WageTypeTranslation';

    public Deleted: boolean;
    public CreatedBy: string;
    public WageTypeNumber: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public UpdatedBy: string;
    public EmployeeLanguageID: number;
    public CreatedAt: Date;
    public WageTypeName: string;
    public ID: number;
    public _createguid: string;
    public EmployeeLanguage: EmployeeLanguage;
    public CustomFields: any;
}


export class PensionScheme extends UniEntity {
    public static RelativeUrl = 'pensionschemes';
    public static EntityType = 'PensionScheme';

    public Deleted: boolean;
    public Identificator: string;
    public CreatedBy: string;
    public Period: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public Year: number;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class PensionSchemeSupplier extends UniEntity {
    public static RelativeUrl = 'pensionschemesuppliers';
    public static EntityType = 'PensionSchemeSupplier';

    public Deleted: boolean;
    public Identificator: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public UpdatedBy: string;
    public Name: string;
    public CreatedAt: Date;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class StandardPensionSchemeSupplier extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'StandardPensionSchemeSupplier';

    public Deleted: boolean;
    public Identificator: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Name: string;
    public CreatedAt: Date;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class EmployeeLanguage extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'EmployeeLanguage';

    public Deleted: boolean;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public LanguageCode: string;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class ComponentLayout extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ComponentLayout';

    public Deleted: boolean;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public BaseEntity: string;
    public StatusCode: number;
    public UpdatedBy: string;
    public Name: string;
    public CreatedAt: Date;
    public ID: number;
    public _createguid: string;
    public Fields: Array<FieldLayout>;
    public CustomFields: any;
}


export class FieldLayout extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'FieldLayout';

    public Deleted: boolean;
    public LineBreak: boolean;
    public CreatedBy: string;
    public Label: string;
    public LookupField: boolean;
    public Sectionheader: string;
    public Legend: string;
    public UpdatedAt: Date;
    public Description: string;
    public EntityType: string;
    public Property: string;
    public HelpText: string;
    public FieldSet: number;
    public Section: number;
    public ReadOnly: boolean;
    public StatusCode: number;
    public Placement: number;
    public Placeholder: string;
    public Combo: number;
    public Alignment: Alignment;
    public UpdatedBy: string;
    public FieldType: FieldType;
    public Hidden: boolean;
    public Width: string;
    public CreatedAt: Date;
    public DisplayField: string;
    public ID: number;
    public Options: string;
    public ComponentLayoutID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class CurrencyOverride extends UniEntity {
    public static RelativeUrl = 'currencyoverrides';
    public static EntityType = 'CurrencyOverride';

    public Deleted: boolean;
    public CreatedBy: string;
    public FromDate: LocalDate;
    public UpdatedAt: Date;
    public ExchangeRate: number;
    public ToDate: LocalDate;
    public Source: CurrencySourceEnum;
    public FromCurrencyCodeID: number;
    public ToCurrencyCodeID: number;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public Factor: number;
    public ID: number;
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
    public UpdatedAt: Date;
    public FromAccountNumber: number;
    public ToAccountNumber: number;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class AccountGroupSetup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AccountGroupSetup';

    public Deleted: boolean;
    public CreatedBy: string;
    public PlanType: PlanTypeEnum;
    public UpdatedAt: Date;
    public ExternalReference: string;
    public ParentID: number;
    public UpdatedBy: string;
    public Name: string;
    public CreatedAt: Date;
    public ID: number;
    public _createguid: string;
    public Parent: AccountGroupSetup;
    public CustomFields: any;
}


export class AccountSetup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AccountSetup';

    public Deleted: boolean;
    public CreatedBy: string;
    public PlanType: PlanTypeEnum;
    public AccountNumber: number;
    public UpdatedAt: Date;
    public Visible: boolean;
    public AccountGroupSetupID: number;
    public SaftMappingAccountID: number;
    public UpdatedBy: string;
    public ExpectedDebitBalance: boolean;
    public CreatedAt: Date;
    public AccountName: string;
    public ID: number;
    public VatCode: string;
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
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Name: string;
    public CreatedAt: Date;
    public ID: number;
    public _createguid: string;
    public Accounts: Array<AccountVisibilityGroupAccount>;
    public CompanyTypes: Array<CompanyType>;
    public CustomFields: any;
}


export class AccountVisibilityGroupAccount extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AccountVisibilityGroupAccount';

    public Deleted: boolean;
    public AccountSetupID: number;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public ID: number;
    public AccountVisibilityGroupID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class AGARate extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AGARate';

    public Deleted: boolean;
    public Rate: number;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public ZoneID: number;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public RateValidFrom: Date;
    public ID: number;
    public _createguid: string;
    public sector: Array<AGASector>;
    public CustomFields: any;
}


export class AGASector extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AGASector';

    public Deleted: boolean;
    public Rate: number;
    public CreatedBy: string;
    public ValidFrom: Date;
    public SectorID: number;
    public UpdatedAt: Date;
    public RateID: number;
    public freeAmount: number;
    public Sector: string;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class AGAZone extends UniEntity {
    public static RelativeUrl = 'AGAZones';
    public static EntityType = 'AGAZone';

    public Deleted: boolean;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public ZoneName: string;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public ID: number;
    public _createguid: string;
    public rates: Array<AGARate>;
    public municipalsOnZone: Array<MunicipalAGAZone>;
    public CustomFields: any;
}


export class Agreement extends UniEntity {
    public static RelativeUrl = 'agreements';
    public static EntityType = 'Agreement';

    public Deleted: boolean;
    public CreatedBy: string;
    public ValidFrom: Date;
    public UpdatedAt: Date;
    public AppliesTo: number;
    public Template: string;
    public UpdatedBy: string;
    public Name: string;
    public CreatedAt: Date;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class AltinnAccountFormLink extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AltinnAccountFormLink';

    public Deleted: boolean;
    public CreatedBy: string;
    public AccountNumber: number;
    public UpdatedAt: Date;
    public Ref: string;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class AssetGroup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AssetGroup';

    public Deleted: boolean;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public DepreciationAccountNumber: number;
    public ToDate: Date;
    public DepreciationYears: number;
    public UpdatedBy: string;
    public Name: string;
    public DepreciationRate: number;
    public CreatedAt: Date;
    public ID: number;
    public Code: string;
    public _createguid: string;
    public CustomFields: any;
}


export class BankIdentifierCode extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'BankIdentifierCode';

    public Deleted: boolean;
    public CreatedBy: string;
    public BankIdentifier: string;
    public UpdatedAt: Date;
    public Bic: string;
    public UpdatedBy: string;
    public BankName: string;
    public CreatedAt: Date;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class CompanyType extends UniEntity {
    public static RelativeUrl = 'companytypes';
    public static EntityType = 'CompanyType';

    public Deleted: boolean;
    public CreatedBy: string;
    public FullName: string;
    public UpdatedAt: Date;
    public Description: string;
    public DefaultPlanType: PlanTypeEnum;
    public Priority: boolean;
    public DefaultAccountVisibilityGroupID: number;
    public UpdatedBy: string;
    public Name: string;
    public CreatedAt: Date;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class Confirmation extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Confirmation';

    public Deleted: boolean;
    public CreatedBy: string;
    public PostalCode: string;
    public CompanyName: string;
    public UpdatedAt: Date;
    public ContractType: string;
    public StatusCode: number;
    public SignUpReferrer: string;
    public UpdatedBy: string;
    public Phone: string;
    public CreatedAt: Date;
    public DisplayName: string;
    public ExpirationDate: Date;
    public Email: string;
    public ID: number;
    public Code: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Country extends UniEntity {
    public static RelativeUrl = 'countries';
    public static EntityType = 'Country';

    public Deleted: boolean;
    public CreatedBy: string;
    public CountryCode: string;
    public UpdatedAt: Date;
    public CurrencyRateSource: string;
    public DefaultCurrencyCode: string;
    public UpdatedBy: string;
    public Name: string;
    public CreatedAt: Date;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class Currency extends UniEntity {
    public static RelativeUrl = 'currencies';
    public static EntityType = 'Currency';

    public Deleted: boolean;
    public CreatedBy: string;
    public CurrencyDate: LocalDate;
    public UpdatedAt: Date;
    public ExchangeRate: number;
    public Source: CurrencySourceEnum;
    public FromCurrencyCodeID: number;
    public ToCurrencyCodeID: number;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public Factor: number;
    public ID: number;
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
    public UpdatedAt: Date;
    public Description: string;
    public UpdatedBy: string;
    public Name: string;
    public CreatedAt: Date;
    public ID: number;
    public ShortCode: string;
    public Code: string;
    public _createguid: string;
    public CustomFields: any;
}


export class DebtCollectionAutomation extends UniEntity {
    public static RelativeUrl = 'debtcollectionautomation';
    public static EntityType = 'DebtCollectionAutomation';

    public Deleted: boolean;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Description: string;
    public DebtCollectionSettingsID: number;
    public UpdatedBy: string;
    public Name: string;
    public CreatedAt: Date;
    public ID: number;
    public _createguid: string;
    public DebtCollectionSettings: DebtCollectionSettings;
    public CustomFields: any;
}


export class EmploymentValidValues extends UniEntity {
    public static RelativeUrl = 'employmentvalidvalues';
    public static EntityType = 'EmploymentValidValues';

    public Deleted: boolean;
    public CreatedBy: string;
    public ShipReg: boolean;
    public employment: TypeOfEmployment;
    public TradeArea: boolean;
    public RemunerationType: boolean;
    public LastWorkPercentChange: boolean;
    public EndDate: boolean;
    public JobCode: boolean;
    public StartDate: boolean;
    public UpdatedAt: Date;
    public SeniorityDate: boolean;
    public WorkingHoursScheme: boolean;
    public WorkPercent: boolean;
    public typeOfEmployment: boolean;
    public JobName: boolean;
    public UserDefinedRate: boolean;
    public HoursPerWeek: boolean;
    public UpdatedBy: string;
    public LastSalaryChangeDate: boolean;
    public HourRate: boolean;
    public CreatedAt: Date;
    public ID: number;
    public ShipType: boolean;
    public MonthRate: boolean;
    public PaymentType: RemunerationType;
    public _createguid: string;
    public CustomFields: any;
}


export class FinancialDeadline extends UniEntity {
    public static RelativeUrl = 'deadlines';
    public static EntityType = 'FinancialDeadline';

    public Deleted: boolean;
    public Type: FinancialDeadlineType;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public AdditionalInfo: string;
    public PassableDueDate: number;
    public StatusCode: number;
    public Deadline: LocalDate;
    public UpdatedBy: string;
    public Name: string;
    public CreatedAt: Date;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class JobTicket extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'JobTicket';

    public Deleted: boolean;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public JobId: string;
    public JobName: string;
    public UpdatedBy: string;
    public JobStatus: string;
    public CreatedAt: Date;
    public ID: number;
    public GlobalIdentity: string;
    public _createguid: string;
    public CustomFields: any;
}


export class LanguageCode extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'LanguageCode';

    public Deleted: boolean;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Name: string;
    public CreatedAt: Date;
    public ID: number;
    public Code: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Municipal extends UniEntity {
    public static RelativeUrl = 'Municipals';
    public static EntityType = 'Municipal';

    public Deleted: boolean;
    public CreatedBy: string;
    public MunicipalityNo: string;
    public MunicipalityName: string;
    public Retired: boolean;
    public CountyName: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public ID: number;
    public CountyNo: string;
    public _createguid: string;
    public CustomFields: any;
}


export class MunicipalAGAZone extends UniEntity {
    public static RelativeUrl = 'MunicipalAGAZones';
    public static EntityType = 'MunicipalAGAZone';

    public Deleted: boolean;
    public CreatedBy: string;
    public MunicipalityNo: string;
    public Startdate: Date;
    public UpdatedAt: Date;
    public ZoneID: number;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class PaymentBatchType extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'PaymentBatchType';

    public Deleted: boolean;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Description: string;
    public UpdatedBy: string;
    public Name: string;
    public CreatedAt: Date;
    public ID: number;
    public Code: number;
    public _createguid: string;
    public CustomFields: any;
}


export class PaymentCode extends UniEntity {
    public static RelativeUrl = 'paymentCodes';
    public static EntityType = 'PaymentCode';

    public Deleted: boolean;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Description: string;
    public PaymentGroup: string;
    public UpdatedBy: string;
    public Name: string;
    public CreatedAt: Date;
    public ID: number;
    public Code: number;
    public _createguid: string;
    public CustomFields: any;
}


export class PostalCode extends UniEntity {
    public static RelativeUrl = 'postalcodes';
    public static EntityType = 'PostalCode';

    public Deleted: boolean;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public City: string;
    public ID: number;
    public Code: string;
    public _createguid: string;
    public CustomFields: any;
}


export class ReconcileType extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ReconcileType';

    public Deleted: boolean;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public MaxIntervalNumber: number;
    public ReconcileName: string;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public Interval: ReconcileInterval;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class SaftMappingAccount extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'SaftMappingAccount';

    public Deleted: boolean;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Description: string;
    public AccountID: string;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class StaticRegister extends UniEntity {
    public static RelativeUrl = 'StaticRegister';
    public static EntityType = 'StaticRegister';

    public Deleted: boolean;
    public CreatedBy: string;
    public stamp: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public ID: number;
    public Registry: string;
    public _createguid: string;
    public CustomFields: any;
}


export class STYRKCode extends UniEntity {
    public static RelativeUrl = 'STYRK';
    public static EntityType = 'STYRKCode';

    public Deleted: boolean;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public lnr: number;
    public tittel: string;
    public ynr: number;
    public styrk: string;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class Language extends UniEntity {
    public static RelativeUrl = 'languages';
    public static EntityType = 'Language';

    public Deleted: boolean;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public FallBackLanguageID: number;
    public UpdatedBy: string;
    public Name: string;
    public CreatedAt: Date;
    public ID: number;
    public Code: string;
    public _createguid: string;
    public Translations: Array<Translation>;
    public CustomFields: any;
}


export class Translatable extends UniEntity {
    public static RelativeUrl = 'translatables';
    public static EntityType = 'Translatable';

    public Deleted: boolean;
    public CreatedBy: string;
    public Model: string;
    public Module: i18nModule;
    public UpdatedAt: Date;
    public Description: string;
    public Column: string;
    public Value: string;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public Meaning: string;
    public ID: number;
    public Static: boolean;
    public _createguid: string;
    public Translations: Array<Translation>;
    public CustomFields: any;
}


export class Translation extends UniEntity {
    public static RelativeUrl = 'translations';
    public static EntityType = 'Translation';

    public Deleted: boolean;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public TranslatableID: number;
    public LanguageID: number;
    public Value: string;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public ID: number;
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
    public UpdatedAt: Date;
    public No: string;
    public UpdatedBy: string;
    public Name: string;
    public CreatedAt: Date;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class VatPostSetup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'VatPostSetup';

    public Deleted: boolean;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public HasTaxBasis: boolean;
    public No: string;
    public VatCodeGroupSetupNo: string;
    public UpdatedBy: string;
    public Name: string;
    public ReportAsNegativeAmount: boolean;
    public CreatedAt: Date;
    public ID: number;
    public HasTaxAmount: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class VatReportForm extends UniEntity {
    public static RelativeUrl = 'vatreportforms';
    public static EntityType = 'VatReportForm';

    public Deleted: boolean;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Description: string;
    public UpdatedBy: string;
    public Name: string;
    public CreatedAt: Date;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class VatReportReferenceSetup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'VatReportReferenceSetup';

    public Deleted: boolean;
    public CreatedBy: string;
    public AccountNumber: number;
    public UpdatedAt: Date;
    public VatPostNo: string;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public ID: number;
    public VatCode: string;
    public _createguid: string;
    public CustomFields: any;
}


export class VatTypeSetup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'VatTypeSetup';

    public Deleted: boolean;
    public CreatedBy: string;
    public OutputVat: boolean;
    public OutgoingAccountNumber: number;
    public DirectJournalEntryOnly: boolean;
    public ReversedTaxDutyVat: boolean;
    public UpdatedAt: Date;
    public DefaultVisible: boolean;
    public IsCompensated: boolean;
    public IsNotVatRegistered: boolean;
    public UpdatedBy: string;
    public Name: string;
    public IncomingAccountNumber: number;
    public VatCodeGroupNo: string;
    public CreatedAt: Date;
    public ID: number;
    public VatCode: string;
    public _createguid: string;
    public VatTypeSetupPercentages: Array<VatTypeSetupPercentage>;
    public CustomFields: any;
}


export class VatTypeSetupPercentage extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'VatTypeSetupPercentage';

    public Deleted: boolean;
    public CreatedBy: string;
    public ValidTo: LocalDate;
    public VatPercent: number;
    public ValidFrom: LocalDate;
    public UpdatedAt: Date;
    public VatTypeSetupID: number;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class CompanyReport extends UniEntity {
    public static RelativeUrl = 'company-report';
    public static EntityType = 'CompanyReport';

    public Deleted: boolean;
    public CreatedBy: string;
    public CompanyKey: string;
    public UpdatedAt: Date;
    public ContractId: number;
    public ReportDefinitionID: number;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class ReportDefinition extends UniEntity {
    public static RelativeUrl = 'report-definitions';
    public static EntityType = 'ReportDefinition';

    public Deleted: boolean;
    public Version: string;
    public CreatedBy: string;
    public ReportSource: string;
    public TemplateLinkId: string;
    public UniqueReportID: string;
    public ReportType: number;
    public UpdatedAt: Date;
    public Visible: boolean;
    public Description: string;
    public Category: string;
    public Md5: string;
    public CategoryLabel: string;
    public IsStandard: boolean;
    public UpdatedBy: string;
    public Name: string;
    public CreatedAt: Date;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class ReportDefinitionDataSource extends UniEntity {
    public static RelativeUrl = 'report-definition-data-sources';
    public static EntityType = 'ReportDefinitionDataSource';

    public Deleted: boolean;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public ReportDefinitionId: number;
    public UpdatedBy: string;
    public Name: string;
    public CreatedAt: Date;
    public DataSourceUrl: string;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class ReportDefinitionParameter extends UniEntity {
    public static RelativeUrl = 'report-definition-parameters';
    public static EntityType = 'ReportDefinitionParameter';

    public Deleted: boolean;
    public Type: string;
    public CreatedBy: string;
    public Label: string;
    public DefaultValue: string;
    public DefaultValueLookupType: string;
    public DefaultValueSource: string;
    public UpdatedAt: Date;
    public Visible: boolean;
    public DefaultValueList: string;
    public ReportDefinitionId: number;
    public UpdatedBy: string;
    public Name: string;
    public CreatedAt: Date;
    public SortIndex: number;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class PeriodSeries extends UniEntity {
    public static RelativeUrl = 'period-series';
    public static EntityType = 'PeriodSeries';

    public Deleted: boolean;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Active: boolean;
    public UpdatedBy: string;
    public Name: string;
    public CreatedAt: Date;
    public SeriesType: PeriodSeriesType;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class PeriodTemplate extends UniEntity {
    public static RelativeUrl = 'period-templates';
    public static EntityType = 'PeriodTemplate';

    public Deleted: boolean;
    public CreatedBy: string;
    public FromDate: LocalDate;
    public UpdatedAt: Date;
    public PeriodSeriesID: number;
    public ToDate: LocalDate;
    public No: number;
    public UpdatedBy: string;
    public Name: string;
    public CreatedAt: Date;
    public ID: number;
    public _createguid: string;
    public PeriodSeries: PeriodSeries;
    public CustomFields: any;
}


export class Model extends UniEntity {
    public static RelativeUrl = 'models';
    public static EntityType = 'Model';

    public Deleted: boolean;
    public CreatedBy: string;
    public Label: string;
    public Admin: boolean;
    public UpdatedAt: Date;
    public Description: string;
    public Shared: boolean;
    public LabelPlural: string;
    public UpdatedBy: string;
    public Name: string;
    public CreatedAt: Date;
    public ID: number;
    public _createguid: string;
    public Fields: Array<Field>;
    public CustomFields: any;
}


export class Field extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Field';

    public Deleted: boolean;
    public CreatedBy: string;
    public Label: string;
    public UpdatedAt: Date;
    public Description: string;
    public HelpText: string;
    public ModelID: number;
    public UpdatedBy: string;
    public Name: string;
    public CreatedAt: Date;
    public ID: number;
    public _createguid: string;
    public Model: Model;
    public CustomFields: any;
}


export class Notification extends UniEntity {
    public static RelativeUrl = 'notifications';
    public static EntityType = 'Notification';

    public Deleted: boolean;
    public CreatedBy: string;
    public EntityID: number;
    public CompanyKey: string;
    public CompanyName: string;
    public SourceEntityID: number;
    public UpdatedAt: Date;
    public SourceEntityType: string;
    public Message: string;
    public EntityType: string;
    public StatusCode: number;
    public SenderDisplayName: string;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public ID: number;
    public RecipientID: string;
    public _createguid: string;
    public CustomFields: any;
}


export class CompanySettings extends UniEntity {
    public static RelativeUrl = 'companysettings';
    public static EntityType = 'CompanySettings';

    public Deleted: boolean;
    public BookCustomerInvoiceOnDeliveryDate: boolean;
    public HasAutobank: boolean;
    public DefaultCustomerQuoteReportID: number;
    public SAFTimportAccountID: number;
    public CreatedBy: string;
    public LogoHideField: number;
    public VatLockedDate: LocalDate;
    public AutoJournalPayment: string;
    public CustomerInvoiceReminderSettingsID: number;
    public InterrimPaymentAccountID: number;
    public PersonNumber: string;
    public FactoringEmailID: number;
    public DefaultCustomerInvoiceReminderReportID: number;
    public UsePaymentBankValues: boolean;
    public CustomerCreditDays: number;
    public CompanyRegistered: boolean;
    public APIncludeAttachment: boolean;
    public BankChargeAccountID: number;
    public UseFinancialDateToCalculateVatPercent: boolean;
    public RoundingType: RoundingType;
    public ShowNumberOfDecimals: number;
    public XtraPaymentOrgXmlTagValue: string;
    public UseXtraPaymentOrgXmlTag: boolean;
    public CompanyTypeID: number;
    public CompanyName: string;
    public TaxMandatoryType: number;
    public SettlementVatAccountID: number;
    public DefaultCustomerInvoiceReportID: number;
    public AutoDistributeInvoice: boolean;
    public APActivated: boolean;
    public AcceptableDelta4CustomerPayment: number;
    public TaxBankAccountID: number;
    public UpdatedAt: Date;
    public UseAssetRegister: boolean;
    public HideInActiveSuppliers: boolean;
    public PeriodSeriesVatID: number;
    public GLN: string;
    public AccountingLockedDate: LocalDate;
    public AcceptableDelta4CustomerPaymentAccountID: number;
    public Factoring: number;
    public NetsIntegrationActivated: boolean;
    public CustomerAccountID: number;
    public SalaryBankAccountID: number;
    public DefaultTOFCurrencySettingsID: number;
    public APGuid: string;
    public DefaultPhoneID: number;
    public ShowKIDOnCustomerInvoice: boolean;
    public AllowAvtalegiroRegularInvoice: boolean;
    public RoundingNumberOfDecimals: number;
    public TaxMandatory: boolean;
    public TaxableFromLimit: number;
    public OfficeMunicipalityNo: string;
    public AccountGroupSetID: number;
    public StoreDistributedInvoice: boolean;
    public HideInActiveCustomers: boolean;
    public WebAddress: string;
    public BatchInvoiceMinAmount: number;
    public StatusCode: number;
    public TwoStageAutobankEnabled: boolean;
    public DefaultSalesAccountID: number;
    public PaymentBankIdentification: string;
    public DefaultDistributionsID: number;
    public SupplierAccountID: number;
    public DefaultAddressID: number;
    public OrganizationNumber: string;
    public BaseCurrencyCodeID: number;
    public VatReportFormID: number;
    public APContactID: number;
    public EnableApprovalFlow: boolean;
    public ForceSupplierInvoiceApproval: boolean;
    public UseOcrInterpretation: boolean;
    public CompanyBankAccountID: number;
    public Localization: string;
    public UpdatedBy: string;
    public PeriodSeriesAccountID: number;
    public EnableSendPaymentBeforeJournaled: boolean;
    public SaveCustomersFromQuoteAsLead: boolean;
    public UseNetsIntegration: boolean;
    public OnlyJournalMatchedPayments: boolean;
    public InterrimRemitAccountID: number;
    public CreatedAt: Date;
    public LogoFileID: number;
    public DefaultEmailID: number;
    public EnableAdvancedJournalEntry: boolean;
    public EnableCheckboxesForSupplierInvoiceList: boolean;
    public AgioLossAccountID: number;
    public IgnorePaymentsWithoutEndToEndID: boolean;
    public DefaultAccrualAccountID: number;
    public LogoAlign: number;
    public ID: number;
    public PaymentBankAgreementNumber: string;
    public AgioGainAccountID: number;
    public DefaultCustomerOrderReportID: number;
    public TaxableFromDate: LocalDate;
    public EnableArchiveSupplierInvoice: boolean;
    public FactoringNumber: number;
    public AccountVisibilityGroupID: number;
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

    public Deleted: boolean;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public EntityType: string;
    public StatusCode: number;
    public UpdatedBy: string;
    public Name: string;
    public CreatedAt: Date;
    public ID: number;
    public _createguid: string;
    public Elements: Array<DistributionPlanElement>;
    public CustomFields: any;
}


export class DistributionPlanElement extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'DistributionPlanElement';

    public Deleted: boolean;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Priority: number;
    public DistributionPlanID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public ID: number;
    public DistributionPlanElementTypeID: number;
    public _createguid: string;
    public ElementType: DistributionPlanElementType;
    public CustomFields: any;
}


export class DistributionPlanElementType extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'DistributionPlanElementType';

    public Deleted: boolean;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public UpdatedBy: string;
    public Name: string;
    public CreatedAt: Date;
    public ID: number;
    public _createguid: string;
    public LegalEntities: Array<DistributionPlanElementTypeLegalEntity>;
    public CustomFields: any;
}


export class DistributionPlanElementTypeLegalEntity extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'DistributionPlanElementTypeLegalEntity';

    public Deleted: boolean;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public EntityType: string;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public ID: number;
    public DistributionPlanElementTypeID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class Distributions extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Distributions';

    public Deleted: boolean;
    public CustomerQuoteDistributionPlanID: number;
    public CreatedBy: string;
    public CustomerInvoiceDistributionPlanID: number;
    public UpdatedAt: Date;
    public PayCheckDistributionPlanID: number;
    public CustomerInvoiceReminderDistributionPlanID: number;
    public StatusCode: number;
    public CustomerOrderDistributionPlanID: number;
    public AnnualStatementDistributionPlanID: number;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public ID: number;
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
    public CreatedBy: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public UpdatedBy: string;
    public Name: string;
    public CreatedAt: Date;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class EmailLog extends UniEntity {
    public static RelativeUrl = 'emails';
    public static EntityType = 'EmailLog';

    public Deleted: boolean;
    public JobRunID: number;
    public Type: SharingType;
    public CreatedBy: string;
    public EntityID: number;
    public ExternalMessage: string;
    public UpdatedAt: Date;
    public EntityType: string;
    public JobRunExternalRef: string;
    public ExternalReference: string;
    public Subject: string;
    public From: string;
    public StatusCode: number;
    public EntityDisplayValue: string;
    public UpdatedBy: string;
    public To: string;
    public CreatedAt: Date;
    public ID: number;
    public DistributeAt: LocalDate;
    public _createguid: string;
    public CustomFields: any;
}


export class Eventplan extends UniEntity {
    public static RelativeUrl = 'eventplans';
    public static EntityType = 'Eventplan';

    public Deleted: boolean;
    public CreatedBy: string;
    public PlanType: EventplanType;
    public UpdatedAt: Date;
    public IsSystemPlan: boolean;
    public SigningKey: string;
    public Active: boolean;
    public ModelFilter: string;
    public StatusCode: number;
    public JobNames: string;
    public Cargo: string;
    public UpdatedBy: string;
    public OperationFilter: string;
    public Name: string;
    public CreatedAt: Date;
    public ID: number;
    public _createguid: string;
    public ExpressionFilters: Array<ExpressionFilter>;
    public Subscribers: Array<EventSubscriber>;
    public CustomFields: any;
}


export class EventSubscriber extends UniEntity {
    public static RelativeUrl = 'eventsubscribers';
    public static EntityType = 'EventSubscriber';

    public Deleted: boolean;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Endpoint: string;
    public Active: boolean;
    public StatusCode: number;
    public UpdatedBy: string;
    public Name: string;
    public Authorization: string;
    public CreatedAt: Date;
    public Headers: string;
    public ID: number;
    public EventplanID: number;
    public _createguid: string;
    public Eventplan: Eventplan;
    public CustomFields: any;
}


export class ExpressionFilter extends UniEntity {
    public static RelativeUrl = 'expressionfilters';
    public static EntityType = 'ExpressionFilter';

    public Deleted: boolean;
    public CreatedBy: string;
    public Expression: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public ID: number;
    public EntityName: string;
    public EventplanID: number;
    public _createguid: string;
    public Eventplan: Eventplan;
    public CustomFields: any;
}


export class Period extends UniEntity {
    public static RelativeUrl = 'periodes';
    public static EntityType = 'Period';

    public Deleted: boolean;
    public CreatedBy: string;
    public FromDate: LocalDate;
    public UpdatedAt: Date;
    public PeriodSeriesID: number;
    public ToDate: LocalDate;
    public StatusCode: number;
    public No: number;
    public UpdatedBy: string;
    public Name: string;
    public CreatedAt: Date;
    public ID: number;
    public PeriodTemplateID: number;
    public AccountYear: number;
    public _createguid: string;
    public PeriodTemplate: PeriodTemplate;
    public PeriodSeries: PeriodSeries;
    public CustomFields: any;
}


export class PredefinedDescription extends UniEntity {
    public static RelativeUrl = 'predefineddescriptions';
    public static EntityType = 'PredefinedDescription';

    public Deleted: boolean;
    public Type: PredefinedDescriptionType;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Description: string;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public ID: number;
    public Code: string;
    public _createguid: string;
    public CustomFields: any;
}


export class ProductCategory extends UniEntity {
    public static RelativeUrl = 'productcategories';
    public static EntityType = 'ProductCategory';

    public Deleted: boolean;
    public CreatedBy: string;
    public Status: number;
    public Lft: number;
    public Rght: number;
    public UpdatedAt: Date;
    public Description: string;
    public Comment: string;
    public StatusCode: number;
    public Depth: number;
    public ParentID: number;
    public UpdatedBy: string;
    public Name: string;
    public CreatedAt: Date;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class ProductCategoryLink extends UniEntity {
    public static RelativeUrl = 'productcategorylinks';
    public static EntityType = 'ProductCategoryLink';

    public Deleted: boolean;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public ProductID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public ProductCategoryID: number;
    public CreatedAt: Date;
    public ID: number;
    public _createguid: string;
    public ProductCategory: ProductCategory;
    public CustomFields: any;
}


export class Sharing extends UniEntity {
    public static RelativeUrl = 'sharings';
    public static EntityType = 'Sharing';

    public Deleted: boolean;
    public JobRunID: number;
    public Type: SharingType;
    public CreatedBy: string;
    public EntityID: number;
    public ExternalMessage: string;
    public UpdatedAt: Date;
    public EntityType: string;
    public JobRunExternalRef: string;
    public ExternalReference: string;
    public Subject: string;
    public From: string;
    public StatusCode: number;
    public EntityDisplayValue: string;
    public UpdatedBy: string;
    public To: string;
    public CreatedAt: Date;
    public ID: number;
    public DistributeAt: LocalDate;
    public _createguid: string;
    public CustomFields: any;
}


export class StatusLog extends UniEntity {
    public static RelativeUrl = 'statuslogs';
    public static EntityType = 'StatusLog';

    public Deleted: boolean;
    public CreatedBy: string;
    public EntityID: number;
    public UpdatedAt: Date;
    public EntityType: string;
    public FromStatus: number;
    public ToStatus: number;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class Tracelink extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Tracelink';

    public Deleted: boolean;
    public CreatedBy: string;
    public Date: Date;
    public UpdatedAt: Date;
    public SourceInstanceID: number;
    public StatusCode: number;
    public DestinationEntityName: string;
    public UpdatedBy: string;
    public DestinationInstanceID: number;
    public CreatedAt: Date;
    public ID: number;
    public SourceEntityName: string;
    public _createguid: string;
    public CustomFields: any;
}


export class User extends UniEntity {
    public static RelativeUrl = 'users';
    public static EntityType = 'User';

    public Deleted: boolean;
    public CreatedBy: string;
    public UserName: string;
    public HasAgreedToImportDisclaimer: boolean;
    public UpdatedAt: Date;
    public Protected: boolean;
    public PhoneNumber: string;
    public StatusCode: number;
    public LastLogin: Date;
    public UpdatedBy: string;
    public IsAutobankAdmin: boolean;
    public CreatedAt: Date;
    public DisplayName: string;
    public Email: string;
    public ID: number;
    public GlobalIdentity: string;
    public BankIntegrationUserName: string;
    public TwoFactorEnabled: boolean;
    public EndDate: Date;
    public _createguid: string;
    public AuthPhoneNumber: string;
    public CustomFields: any;
}


export class UniQueryDefinition extends UniEntity {
    public static RelativeUrl = 'uniquerydefinitions';
    public static EntityType = 'UniQueryDefinition';

    public Deleted: boolean;
    public CreatedBy: string;
    public IsShared: boolean;
    public SystemGeneratedQuery: boolean;
    public UpdatedAt: Date;
    public ClickUrl: string;
    public Description: string;
    public UserID: number;
    public Category: string;
    public ModuleID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public MainModelName: string;
    public Name: string;
    public CreatedAt: Date;
    public SortIndex: number;
    public ID: number;
    public Code: string;
    public ClickParam: string;
    public _createguid: string;
    public UniQueryFilters: Array<UniQueryFilter>;
    public UniQueryFields: Array<UniQueryField>;
    public CustomFields: any;
}


export class UniQueryField extends UniEntity {
    public static RelativeUrl = 'uniqueryfields';
    public static EntityType = 'UniQueryField';

    public Deleted: boolean;
    public CreatedBy: string;
    public UniQueryDefinitionID: number;
    public Index: number;
    public UpdatedAt: Date;
    public Field: string;
    public StatusCode: number;
    public Alias: string;
    public Header: string;
    public UpdatedBy: string;
    public FieldType: number;
    public SumFunction: string;
    public Width: string;
    public CreatedAt: Date;
    public Path: string;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class UniQueryFilter extends UniEntity {
    public static RelativeUrl = 'uniqueryfilters';
    public static EntityType = 'UniQueryFilter';

    public Deleted: boolean;
    public CreatedBy: string;
    public UniQueryDefinitionID: number;
    public Operator: string;
    public UpdatedAt: Date;
    public Field: string;
    public Group: number;
    public StatusCode: number;
    public Value: string;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class Team extends UniEntity {
    public static RelativeUrl = 'teams';
    public static EntityType = 'Team';

    public Deleted: boolean;
    public CreatedBy: string;
    public Lft: number;
    public Rght: number;
    public UpdatedAt: Date;
    public DimensionsID: number;
    public StatusCode: number;
    public Depth: number;
    public ParentID: number;
    public UpdatedBy: string;
    public Name: string;
    public CreatedAt: Date;
    public ID: number;
    public _createguid: string;
    public Dimensions: Dimensions;
    public Positions: Array<TeamPosition>;
    public CustomFields: any;
}


export class TeamPosition extends UniEntity {
    public static RelativeUrl = 'teampositions';
    public static EntityType = 'TeamPosition';

    public Deleted: boolean;
    public CreatedBy: string;
    public ApproveOrder: number;
    public TeamID: number;
    public FromDate: LocalDate;
    public RelatedSharedRoleId: number;
    public UpdatedAt: Date;
    public UserID: number;
    public ToDate: LocalDate;
    public Position: TeamPositionEnum;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public ID: number;
    public _createguid: string;
    public Team: Team;
    public CustomFields: any;
}


export class ApprovalRule extends UniEntity {
    public static RelativeUrl = 'approvalrules';
    public static EntityType = 'ApprovalRule';

    public Deleted: boolean;
    public CreatedBy: string;
    public Keywords: string;
    public RuleType: ApprovalRuleType;
    public UpdatedAt: Date;
    public Description: string;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public IndustryCodes: string;
    public ID: number;
    public _createguid: string;
    public Steps: Array<ApprovalRuleStep>;
    public CustomFields: any;
}


export class ApprovalRuleStep extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ApprovalRuleStep';

    public Deleted: boolean;
    public CreatedBy: string;
    public StepNumber: number;
    public UpdatedAt: Date;
    public UserID: number;
    public Limit: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public ApprovalRuleID: number;
    public ID: number;
    public _createguid: string;
    public ApprovalRule: ApprovalRule;
    public User: User;
    public CustomFields: any;
}


export class ApprovalSubstitute extends UniEntity {
    public static RelativeUrl = 'approvalsubstitutes';
    public static EntityType = 'ApprovalSubstitute';

    public Deleted: boolean;
    public CreatedBy: string;
    public FromDate: LocalDate;
    public UpdatedAt: Date;
    public UserID: number;
    public SubstituteUserID: number;
    public ToDate: LocalDate;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public ID: number;
    public _createguid: string;
    public User: User;
    public SubstituteUser: User;
    public CustomFields: any;
}


export class TaskApprovalPlan extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'TaskApprovalPlan';

    public Deleted: boolean;
    public CreatedBy: string;
    public StepNumber: number;
    public UpdatedAt: Date;
    public TaskID: number;
    public UserID: number;
    public CurrencyCode: string;
    public Limit: number;
    public Comment: string;
    public StatusCode: number;
    public Amount: number;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public ApprovalID: number;
    public ApprovalRuleID: number;
    public ID: number;
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

    public Deleted: boolean;
    public CreatedBy: string;
    public IsDepricated: boolean;
    public UpdatedAt: Date;
    public Description: string;
    public EntityType: string;
    public Order: number;
    public StatusCategoryID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public ID: number;
    public System: boolean;
    public _createguid: string;
    public StatusCategory: StatusCategory;
    public CustomFields: any;
}


export class StatusCategory extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'StatusCategory';

    public Deleted: boolean;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public StatusCategoryCode: StatusCategoryCode;
    public UpdatedBy: string;
    public Name: string;
    public CreatedAt: Date;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class StatusRemark extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'StatusRemark';

    public Deleted: boolean;
    public CreatedBy: string;
    public EntityID: number;
    public UpdatedAt: Date;
    public EntityType: string;
    public Remark: string;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class Transition extends UniEntity {
    public static RelativeUrl = 'transitions';
    public static EntityType = 'Transition';

    public Deleted: boolean;
    public MethodName: string;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public EntityType: string;
    public Controller: string;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class TransitionThreshold extends UniEntity {
    public static RelativeUrl = 'thresholds';
    public static EntityType = 'TransitionThreshold';

    public Deleted: boolean;
    public CreatedBy: string;
    public PropertyName: string;
    public Operator: Operator;
    public UpdatedAt: Date;
    public SharedRoleId: number;
    public SharedRejectTransitionId: number;
    public Operation: OperationType;
    public Disabled: boolean;
    public Value: string;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public SharedApproveTransitionId: number;
    public ID: number;
    public RejectStatusCode: number;
    public _createguid: string;
    public CustomFields: any;
}


export class TransitionThresholdApproval extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'TransitionThresholdApproval';

    public Deleted: boolean;
    public CreatedBy: string;
    public PropertyName: string;
    public Operator: Operator;
    public UpdatedAt: Date;
    public SharedRoleId: number;
    public SharedRejectTransitionId: number;
    public Operation: OperationType;
    public Value: string;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public ApprovalID: number;
    public SharedApproveTransitionId: number;
    public ID: number;
    public RejectStatusCode: number;
    public _createguid: string;
    public Approval: Approval;
    public CustomFields: any;
}


export class Approval extends UniEntity {
    public static RelativeUrl = 'approvals';
    public static EntityType = 'Approval';

    public Deleted: boolean;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public TaskID: number;
    public UserID: number;
    public SharedRoleId: number;
    public CurrencyCode: string;
    public StatusCode: number;
    public Amount: number;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public ID: number;
    public _createguid: string;
    public Thresholds: Array<TransitionThresholdApproval>;
    public Task: Task;
    public User: User;
    public CustomFields: any;
}


export class Task extends UniEntity {
    public static RelativeUrl = 'tasks';
    public static EntityType = 'Task';

    public Deleted: boolean;
    public Type: TaskType;
    public CreatedBy: string;
    public EntityID: number;
    public UpdatedAt: Date;
    public UserID: number;
    public SharedRoleId: number;
    public StatusCode: number;
    public SharedRejectTransitionId: number;
    public ModelID: number;
    public Title: string;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public SharedApproveTransitionId: number;
    public ID: number;
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

    public Deleted: boolean;
    public CreatedBy: string;
    public ExpiresDate: Date;
    public FromStatusID: number;
    public IsDepricated: boolean;
    public UpdatedAt: Date;
    public TransitionID: number;
    public EntityType: string;
    public ToStatusID: number;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public ID: number;
    public _createguid: string;
    public FromStatus: Status;
    public ToStatus: Status;
    public Transition: Transition;
    public CustomFields: any;
}


export class Project extends UniEntity {
    public static RelativeUrl = 'projects';
    public static EntityType = 'Project';

    public Deleted: boolean;
    public CreatedBy: string;
    public WorkPlaceAddressID: number;
    public PlannedEnddate: LocalDate;
    public EndDate: LocalDate;
    public ProjectNumberNumeric: number;
    public StartDate: LocalDate;
    public UpdatedAt: Date;
    public Total: number;
    public PlannedStartdate: LocalDate;
    public Description: string;
    public ProjectCustomerID: number;
    public DimensionsID: number;
    public ProjectLeadName: string;
    public ProjectNumber: string;
    public Price: number;
    public StatusCode: number;
    public Amount: number;
    public CostPrice: number;
    public ProjectNumberSeriesID: number;
    public UpdatedBy: string;
    public Name: string;
    public CreatedAt: Date;
    public ID: number;
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

    public Deleted: boolean;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Responsibility: string;
    public UserID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public Name: string;
    public CreatedAt: Date;
    public ProjectID: number;
    public ID: number;
    public _createguid: string;
    public ProjectUser: User;
    public CustomFields: any;
}


export class ProjectResourceSchedule extends UniEntity {
    public static RelativeUrl = 'projects-schedules-resources';
    public static EntityType = 'ProjectResourceSchedule';

    public Deleted: boolean;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public ProjectTaskScheduleID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public ProjectResourceID: number;
    public CreatedAt: Date;
    public ID: number;
    public ProjectTaskID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class ProjectTask extends UniEntity {
    public static RelativeUrl = 'projects-tasks';
    public static EntityType = 'ProjectTask';

    public Deleted: boolean;
    public CreatedBy: string;
    public EndDate: LocalDate;
    public StartDate: LocalDate;
    public UpdatedAt: Date;
    public Total: number;
    public Description: string;
    public Price: number;
    public StatusCode: number;
    public Amount: number;
    public Number: string;
    public CostPrice: number;
    public UpdatedBy: string;
    public Name: string;
    public SuggestedNumber: string;
    public CreatedAt: Date;
    public ProjectID: number;
    public ID: number;
    public _createguid: string;
    public ProjectTaskSchedules: Array<ProjectTaskSchedule>;
    public ProjectTaskResources: Array<ProjectResourceSchedule>;
    public CustomFields: any;
}


export class ProjectTaskSchedule extends UniEntity {
    public static RelativeUrl = 'projects-tasks-schedules';
    public static EntityType = 'ProjectTaskSchedule';

    public Deleted: boolean;
    public CreatedBy: string;
    public EndDate: LocalDate;
    public StartDate: LocalDate;
    public UpdatedAt: Date;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public ID: number;
    public ProjectTaskID: number;
    public _createguid: string;
    public ScheduleResources: Array<ProjectResourceSchedule>;
    public CustomFields: any;
}


export class BarnepassProduct extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'BarnepassProduct';

    public Deleted: boolean;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public ProductID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public ID: number;
    public _createguid: string;
    public Product: Product;
    public CustomFields: any;
}


export class Product extends UniEntity {
    public static RelativeUrl = 'products';
    public static EntityType = 'Product';

    public Deleted: boolean;
    public Unit: string;
    public Type: ProductTypeEnum;
    public CreatedBy: string;
    public ImageFileID: number;
    public DefaultProductCategoryID: number;
    public ListPrice: number;
    public UpdatedAt: Date;
    public CalculateGrossPriceBasedOnNetPrice: boolean;
    public VatTypeID: number;
    public Description: string;
    public PriceExVat: number;
    public DimensionsID: number;
    public AverageCost: number;
    public AccountID: number;
    public VariansParentID: number;
    public StatusCode: number;
    public CostPrice: number;
    public UpdatedBy: string;
    public Name: string;
    public CreatedAt: Date;
    public PartName: string;
    public ID: number;
    public PriceIncVat: number;
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
    public CreatedBy: string;
    public Empty: boolean;
    public ToNumber: number;
    public UseNumbersFromNumberSeriesID: number;
    public UpdatedAt: Date;
    public NumberSeriesTaskID: number;
    public NextNumber: number;
    public NumberLock: boolean;
    public Comment: string;
    public StatusCode: number;
    public IsDefaultForTask: boolean;
    public Disabled: boolean;
    public FromNumber: number;
    public MainAccountID: number;
    public UpdatedBy: string;
    public Name: string;
    public CreatedAt: Date;
    public DisplayName: string;
    public ID: number;
    public System: boolean;
    public NumberSeriesTypeID: number;
    public AccountYear: number;
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
    public CreatedBy: string;
    public NumberSerieTypeAID: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public NumberSerieTypeBID: number;
    public ID: number;
    public _createguid: string;
    public NumberSerieTypeA: NumberSeriesType;
    public NumberSerieTypeB: NumberSeriesType;
    public CustomFields: any;
}


export class NumberSeriesTask extends UniEntity {
    public static RelativeUrl = 'number-series-tasks';
    public static EntityType = 'NumberSeriesTask';

    public Deleted: boolean;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public EntityType: string;
    public StatusCode: number;
    public UpdatedBy: string;
    public Name: string;
    public CreatedAt: Date;
    public ID: number;
    public _createguid: string;
    public NumberSeries: Array<NumberSeries>;
    public CustomFields: any;
}


export class NumberSeriesType extends UniEntity {
    public static RelativeUrl = 'number-series-types';
    public static EntityType = 'NumberSeriesType';

    public Deleted: boolean;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public EntityField: string;
    public EntityType: string;
    public Yearly: boolean;
    public CanHaveSeveralActiveSeries: boolean;
    public EntitySeriesIDField: string;
    public StatusCode: number;
    public UpdatedBy: string;
    public Name: string;
    public CreatedAt: Date;
    public ID: number;
    public System: boolean;
    public _createguid: string;
    public Series: Array<NumberSeries>;
    public CustomFields: any;
}


export class EncryptionInfo extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'EncryptionInfo';

    public Deleted: boolean;
    public type: Type;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public description: string;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public password: string;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class File extends UniEntity {
    public static RelativeUrl = 'files/{entitytype}/{entityid}';
    public static EntityType = 'File';

    public Deleted: boolean;
    public encryptionID: number;
    public PermaLink: string;
    public CreatedBy: string;
    public Pages: number;
    public UpdatedAt: Date;
    public Description: string;
    public Size: string;
    public Md5: string;
    public StatusCode: number;
    public UpdatedBy: string;
    public Name: string;
    public CreatedAt: Date;
    public ID: number;
    public StorageReference: string;
    public OCRData: string;
    public ContentType: string;
    public _createguid: string;
    public UploadSlot: string;
    public FileTags: Array<FileTag>;
    public EntityLinks: Array<FileEntityLink>;
    public CustomFields: any;
}


export class FileTag extends UniEntity {
    public static RelativeUrl = 'filetags';
    public static EntityType = 'FileTag';

    public Deleted: boolean;
    public CreatedBy: string;
    public Status: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public FileID: number;
    public TagName: string;
    public CreatedAt: Date;
    public ID: number;
    public _createguid: string;
    public File: File;
    public CustomFields: any;
}


export class FileEntityLink extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'FileEntityLink';

    public Deleted: boolean;
    public CreatedBy: string;
    public EntityID: number;
    public UpdatedAt: Date;
    public EntityType: string;
    public StatusCode: number;
    public IsAttachment: boolean;
    public UpdatedBy: string;
    public FileID: number;
    public CreatedAt: Date;
    public ID: number;
    public _createguid: string;
    public File: File;
    public CustomFields: any;
}


export class ElsaUsageLog extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ElsaUsageLog';

    public Deleted: boolean;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public ExternalReference: string;
    public ProductType: string;
    public Quantity: number;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public DateLogged: Date;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class AccessPointFormat extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AccessPointFormat';

    public Deleted: boolean;
    public CreatedBy: string;
    public Label: string;
    public ResourceName: string;
    public UpdatedAt: Date;
    public OutgoingID: number;
    public IncommingID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public Name: string;
    public CreatedAt: Date;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class EHFLog extends UniEntity {
    public static RelativeUrl = 'ehf';
    public static EntityType = 'EHFLog';

    public Deleted: boolean;
    public JobRunID: number;
    public Type: SharingType;
    public CreatedBy: string;
    public EntityID: number;
    public ExternalMessage: string;
    public UpdatedAt: Date;
    public EntityType: string;
    public JobRunExternalRef: string;
    public ExternalReference: string;
    public Subject: string;
    public From: string;
    public StatusCode: number;
    public EntityDisplayValue: string;
    public UpdatedBy: string;
    public To: string;
    public CreatedAt: Date;
    public ID: number;
    public DistributeAt: LocalDate;
    public _createguid: string;
    public CustomFields: any;
}


export class Department extends UniEntity {
    public static RelativeUrl = 'departments';
    public static EntityType = 'Department';

    public Deleted: boolean;
    public CreatedBy: string;
    public DepartmentNumberSeriesID: number;
    public UpdatedAt: Date;
    public Description: string;
    public StatusCode: number;
    public DepartmentManagerName: string;
    public UpdatedBy: string;
    public Name: string;
    public DepartmentNumber: string;
    public CreatedAt: Date;
    public DepartmentNumberNumeric: number;
    public ID: number;
    public _createguid: string;
    public DepartmentNumberSeries: NumberSeries;
    public CustomFields: any;
}


export class Dimension10 extends UniEntity {
    public static RelativeUrl = 'Dimension10';
    public static EntityType = 'Dimension10';

    public Deleted: boolean;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Description: string;
    public StatusCode: number;
    public Number: string;
    public NumberNumeric: number;
    public UpdatedBy: string;
    public Name: string;
    public CreatedAt: Date;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class Dimension5 extends UniEntity {
    public static RelativeUrl = 'Dimension5';
    public static EntityType = 'Dimension5';

    public Deleted: boolean;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Description: string;
    public StatusCode: number;
    public Number: string;
    public NumberNumeric: number;
    public UpdatedBy: string;
    public Name: string;
    public CreatedAt: Date;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class Dimension6 extends UniEntity {
    public static RelativeUrl = 'Dimension6';
    public static EntityType = 'Dimension6';

    public Deleted: boolean;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Description: string;
    public StatusCode: number;
    public Number: string;
    public NumberNumeric: number;
    public UpdatedBy: string;
    public Name: string;
    public CreatedAt: Date;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class Dimension7 extends UniEntity {
    public static RelativeUrl = 'Dimension7';
    public static EntityType = 'Dimension7';

    public Deleted: boolean;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Description: string;
    public StatusCode: number;
    public Number: string;
    public NumberNumeric: number;
    public UpdatedBy: string;
    public Name: string;
    public CreatedAt: Date;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class Dimension8 extends UniEntity {
    public static RelativeUrl = 'Dimension8';
    public static EntityType = 'Dimension8';

    public Deleted: boolean;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Description: string;
    public StatusCode: number;
    public Number: string;
    public NumberNumeric: number;
    public UpdatedBy: string;
    public Name: string;
    public CreatedAt: Date;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class Dimension9 extends UniEntity {
    public static RelativeUrl = 'Dimension9';
    public static EntityType = 'Dimension9';

    public Deleted: boolean;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Description: string;
    public StatusCode: number;
    public Number: string;
    public NumberNumeric: number;
    public UpdatedBy: string;
    public Name: string;
    public CreatedAt: Date;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class Dimensions extends UniEntity {
    public static RelativeUrl = 'dimensions';
    public static EntityType = 'Dimensions';

    public Deleted: boolean;
    public CreatedBy: string;
    public RegionID: number;
    public UpdatedAt: Date;
    public Dimension8ID: number;
    public StatusCode: number;
    public ResponsibleID: number;
    public Dimension9ID: number;
    public Dimension10ID: number;
    public UpdatedBy: string;
    public Dimension7ID: number;
    public CreatedAt: Date;
    public ProjectID: number;
    public Dimension6ID: number;
    public ID: number;
    public ProjectTaskID: number;
    public DepartmentID: number;
    public Dimension5ID: number;
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
    public ProjectTaskName: string;
    public Dimension10Name: string;
    public RegionName: string;
    public Dimension6Name: string;
    public Dimension9Name: string;
    public ProjectTaskNumber: string;
    public DepartmentName: string;
    public Dimension10Number: string;
    public DimensionsID: number;
    public Dimension9Number: string;
    public Dimension8Name: string;
    public Dimension7Name: string;
    public ProjectNumber: string;
    public Dimension7Number: string;
    public Dimension6Number: string;
    public Dimension8Number: string;
    public ProjectName: string;
    public Dimension5Name: string;
    public DepartmentNumber: string;
    public Dimension5Number: string;
    public RegionCode: string;
    public ID: number;
    public ResponsibleName: string;
}


export class DimensionSettings extends UniEntity {
    public static RelativeUrl = 'dimensionsettings';
    public static EntityType = 'DimensionSettings';

    public Deleted: boolean;
    public CreatedBy: string;
    public Label: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public ID: number;
    public Dimension: number;
    public IsActive: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class Region extends UniEntity {
    public static RelativeUrl = 'regions';
    public static EntityType = 'Region';

    public Deleted: boolean;
    public CreatedBy: string;
    public CountryCode: string;
    public UpdatedAt: Date;
    public Description: string;
    public StatusCode: number;
    public UpdatedBy: string;
    public Name: string;
    public CreatedAt: Date;
    public RegionCode: string;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class Responsible extends UniEntity {
    public static RelativeUrl = 'responsibles';
    public static EntityType = 'Responsible';

    public Deleted: boolean;
    public CreatedBy: string;
    public NameOfResponsible: string;
    public UpdatedAt: Date;
    public Description: string;
    public StatusCode: number;
    public UpdatedBy: string;
    public Name: string;
    public CreatedAt: Date;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class Contract extends UniEntity {
    public static RelativeUrl = 'contracts';
    public static EntityType = 'Contract';

    public Deleted: boolean;
    public CreatedBy: string;
    public ContractCode: string;
    public Hash: string;
    public HashTransactionAddress: string;
    public UpdatedAt: Date;
    public Engine: ContractEngine;
    public Description: string;
    public StatusCode: number;
    public UpdatedBy: string;
    public Name: string;
    public TeamsUri: string;
    public CreatedAt: Date;
    public ID: number;
    public _createguid: string;
    public Parameters: Array<ContractParameter>;
    public Triggers: Array<ContractTrigger>;
    public RunLogs: Array<ContractRunLog>;
    public CustomFields: any;
}


export class ContractAddress extends UniEntity {
    public static RelativeUrl = 'contractaddresses';
    public static EntityType = 'ContractAddress';

    public Deleted: boolean;
    public Type: AddressType;
    public CreatedBy: string;
    public EntityID: number;
    public UpdatedAt: Date;
    public ContractAssetID: number;
    public ContractID: number;
    public EntityType: string;
    public StatusCode: number;
    public Address: string;
    public Amount: number;
    public AssetAddress: string;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public ID: number;
    public _createguid: string;
    public Contract: Contract;
    public ContractAsset: ContractAsset;
    public CustomFields: any;
}


export class ContractAsset extends UniEntity {
    public static RelativeUrl = 'contractassets';
    public static EntityType = 'ContractAsset';

    public Deleted: boolean;
    public IsTransferrable: boolean;
    public Type: AddressType;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public IsCosignedByDefiner: boolean;
    public IsAutoDestroy: boolean;
    public ContractID: number;
    public IsFixedDenominations: boolean;
    public IsPrivate: boolean;
    public StatusCode: number;
    public Cap: number;
    public UpdatedBy: string;
    public SpenderAttested: boolean;
    public CreatedAt: Date;
    public ID: number;
    public IsIssuedByDefinerOnly: boolean;
    public _createguid: string;
    public Contract: Contract;
    public CustomFields: any;
}


export class ContractDebugLog extends UniEntity {
    public static RelativeUrl = 'contractdebuglogs';
    public static EntityType = 'ContractDebugLog';

    public Deleted: boolean;
    public ContractRunLogID: number;
    public Type: ContractEventType;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Message: string;
    public ContractID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public ID: number;
    public _createguid: string;
    public Contract: Contract;
    public ContractRunLog: ContractRunLog;
    public CustomFields: any;
}


export class ContractParameter extends UniEntity {
    public static RelativeUrl = 'contractparameters';
    public static EntityType = 'ContractParameter';

    public Deleted: boolean;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public ContractID: number;
    public StatusCode: number;
    public Value: string;
    public UpdatedBy: string;
    public Name: string;
    public CreatedAt: Date;
    public ID: number;
    public _createguid: string;
    public Contract: Contract;
    public CustomFields: any;
}


export class ContractRunLog extends UniEntity {
    public static RelativeUrl = 'contractrunlogs';
    public static EntityType = 'ContractRunLog';

    public Deleted: boolean;
    public Type: ContractEventType;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Message: string;
    public ContractID: number;
    public StatusCode: number;
    public RunTime: string;
    public ContractTriggerID: number;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public ID: number;
    public _createguid: string;
    public Contract: Contract;
    public CustomFields: any;
}


export class ContractTransaction extends UniEntity {
    public static RelativeUrl = 'contracttransactions';
    public static EntityType = 'ContractTransaction';

    public Deleted: boolean;
    public CreatedBy: string;
    public SenderAddress: string;
    public UpdatedAt: Date;
    public ContractID: number;
    public ReceiverAddress: string;
    public StatusCode: number;
    public Amount: number;
    public AssetAddress: string;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public ID: number;
    public ContractAddressID: number;
    public _createguid: string;
    public Contract: Contract;
    public ContractAddress: ContractAddress;
    public CustomFields: any;
}


export class ContractTrigger extends UniEntity {
    public static RelativeUrl = 'contracttriggers';
    public static EntityType = 'ContractTrigger';

    public Deleted: boolean;
    public Type: ContractEventType;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public ContractID: number;
    public ModelFilter: string;
    public ExpressionFilter: string;
    public StatusCode: number;
    public UpdatedBy: string;
    public OperationFilter: string;
    public CreatedAt: Date;
    public ID: number;
    public _createguid: string;
    public Contract: Contract;
    public CustomFields: any;
}


export class Comment extends UniEntity {
    public static RelativeUrl = 'comments';
    public static EntityType = 'Comment';

    public Deleted: boolean;
    public CreatedBy: string;
    public EntityID: number;
    public UpdatedAt: Date;
    public EntityType: string;
    public Text: string;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public ID: number;
    public AuthorID: number;
    public _createguid: string;
    public Mentioned: Array<Mentioned>;
    public Author: User;
    public CustomFields: any;
}


export class Mentioned extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Mentioned';

    public Deleted: boolean;
    public CreatedBy: string;
    public CommentID: number;
    public UpdatedAt: Date;
    public UserID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public ID: number;
    public _createguid: string;
    public User: User;
    public CustomFields: any;
}


export class ApiKey extends UniEntity {
    public static RelativeUrl = 'apikeys';
    public static EntityType = 'ApiKey';

    public Deleted: boolean;
    public CreatedBy: string;
    public FilterDate: LocalDate;
    public Encrypt: boolean;
    public Url: string;
    public IntegrationKey: string;
    public UpdatedAt: Date;
    public Description: string;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public IntegrationType: TypeOfIntegration;
    public ExternalId: string;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class Altinn extends UniEntity {
    public static RelativeUrl = 'altinn';
    public static EntityType = 'Altinn';

    public Deleted: boolean;
    public CreatedBy: string;
    public SystemPw: string;
    public SystemID: string;
    public Language: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public PreferredLogin: TypeOfLogin;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class AltinnReceipt extends UniEntity {
    public static RelativeUrl = 'altinnreceipts';
    public static EntityType = 'AltinnReceipt';

    public Deleted: boolean;
    public CreatedBy: string;
    public UserSign: string;
    public Form: string;
    public HasBeenRegistered: boolean;
    public UpdatedAt: Date;
    public ErrorText: string;
    public TimeStamp: Date;
    public StatusCode: number;
    public XmlReceipt: string;
    public AltinnResponseData: string;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public ID: number;
    public ReceiptID: number;
    public _createguid: string;
    public Signings: Array<AltinnSigning>;
    public CustomFields: any;
}


export class AltinnSigning extends UniEntity {
    public static RelativeUrl = 'altinnsigning';
    public static EntityType = 'AltinnSigning';

    public Deleted: boolean;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public SignatureText: string;
    public AltinnReceiptID: number;
    public SignatureReference: string;
    public StatusCode: number;
    public UpdatedBy: string;
    public DateSigned: Date;
    public CreatedAt: Date;
    public ID: number;
    public StatusText: string;
    public _createguid: string;
    public AltinnReceipt: AltinnReceipt;
    public CustomFields: any;
}


export class Barnepass extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Barnepass';

    public Deleted: boolean;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public inntektsaar: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public ID: number;
    public _createguid: string;
    public oppgave: Array<BarnepassOppgave>;
    public CustomFields: any;
}


export class BarnepassOppgave extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'BarnepassOppgave';

    public Deleted: boolean;
    public navn: string;
    public CreatedBy: string;
    public foedselsnummer: string;
    public UpdatedAt: Date;
    public paaloeptBeloep: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public email: string;
    public ID: number;
    public BarnepassID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class UserRole extends UniEntity {
    public static RelativeUrl = 'userroles';
    public static EntityType = 'UserRole';

    public Deleted: boolean;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public SharedRoleName: string;
    public UserID: number;
    public SharedRoleId: number;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public ID: number;
    public _createguid: string;
    public User: User;
    public CustomFields: any;
}


export class Role extends UniEntity {
    public static RelativeUrl = 'roles';
    public static EntityType = 'Role';

    public Deleted: boolean;
    public CreatedBy: string;
    public Label: string;
    public UpdatedAt: Date;
    public Description: string;
    public UpdatedBy: string;
    public Name: string;
    public CreatedAt: Date;
    public ID: number;
    public _createguid: string;
    public RolePermissions: Array<RolePermission>;
    public CustomFields: any;
}


export class RolePermission extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'RolePermission';

    public Deleted: boolean;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public RoleID: number;
    public PermissionID: number;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public ID: number;
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
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Name: string;
    public CreatedAt: Date;
    public ID: number;
    public _createguid: string;
    public RolePermissions: Array<RolePermission>;
    public CustomFields: any;
}


export class ApiMessage extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ApiMessage';

    public Deleted: boolean;
    public Type: ApiMessageType;
    public CreatedBy: string;
    public FromDate: Date;
    public UpdatedAt: Date;
    public Message: string;
    public Service: string;
    public ToDate: Date;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class AutobankTransferLog extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AutobankTransferLog';

    public Deleted: boolean;
    public CreatedBy: string;
    public Status: number;
    public UpdatedAt: Date;
    public DocumentsId: number;
    public DateInserted: Date;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class AvtaleGiroAgreement extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AvtaleGiroAgreement';

    public Deleted: boolean;
    public CreatedBy: string;
    public KeyPath: string;
    public DataSender: string;
    public UpdatedAt: Date;
    public Description: string;
    public NextNumber: number;
    public UpdatedBy: string;
    public Thumbprint: string;
    public CreatedAt: Date;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class AvtaleGiroBankAccount extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AvtaleGiroBankAccount';

    public Deleted: boolean;
    public CreatedBy: string;
    public BankAccountNumber: string;
    public UpdatedAt: Date;
    public CompanyID: number;
    public AvtaleGiroAgreementID: number;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public ID: number;
    public _createguid: string;
    public Company: Company;
    public CustomFields: any;
}


export class AvtaleGiroFile extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AvtaleGiroFile';

    public Deleted: boolean;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public CompanyID: number;
    public AvtaleGiroAgreementID: number;
    public AvtaleGiroMergedFileID: number;
    public UpdatedBy: string;
    public FileID: number;
    public CreatedAt: Date;
    public AvtaleGiroContent: string;
    public ID: number;
    public _createguid: string;
    public Company: Company;
    public CustomFields: any;
}


export class AvtaleGiroMergedFile extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AvtaleGiroMergedFile';

    public Deleted: boolean;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public TransmissionNumber: number;
    public CreatedAt: Date;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class BankAgreement extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'BankAgreement';

    public Deleted: boolean;
    public CreatedBy: string;
    public AccountOwnerOrgNumber: string;
    public ReceiptDate: Date;
    public UpdatedAt: Date;
    public OrderName: string;
    public CompanyID: number;
    public CustomerName: string;
    public OrderMobile: string;
    public CustomerOrgNumber: string;
    public OrderEmail: string;
    public ServiceID: string;
    public UpdatedBy: string;
    public ServiceAccountID: number;
    public AccountOwnerName: string;
    public CreatedAt: Date;
    public ID: number;
    public ReceiptID: string;
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
    public CreatedBy: string;
    public FileType: string;
    public UpdatedAt: Date;
    public ServiceType: number;
    public DivisionID: number;
    public KidRule: string;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public ConfirmInNetbank: boolean;
    public BankAgreementID: number;
    public ID: number;
    public DivisionName: string;
    public _createguid: string;
    public BankAgreement: BankAgreement;
    public BankAccounts: Array<BankServiceBankAccount>;
    public CustomFields: any;
}


export class BankServiceBankAccount extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'BankServiceBankAccount';

    public Deleted: boolean;
    public CreatedBy: string;
    public BankServiceID: number;
    public AccountNumber: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public ID: number;
    public _createguid: string;
    public BankService: BankService;
    public CustomFields: any;
}


export class Company extends UniEntity {
    public static RelativeUrl = 'companies';
    public static EntityType = 'Company';

    public Deleted: boolean;
    public CreatedBy: string;
    public ConnectionString: string;
    public MigrationVersion: string;
    public IsTemplate: boolean;
    public UpdatedAt: Date;
    public ClientNumber: number;
    public IsGlobalTemplate: boolean;
    public SchemaName: string;
    public FileFlowOrgnrEmail: string;
    public IsTest: boolean;
    public LastActivity: Date;
    public WebHookSubscriberId: string;
    public StatusCode: CompanyStatusCode;
    public OrganizationNumber: string;
    public UpdatedBy: string;
    public Key: string;
    public Name: string;
    public CreatedAt: Date;
    public ID: number;
    public FileFlowEmail: string;
    public _createguid: string;
    public CustomFields: any;
}


export class CompanyAccess extends UniEntity {
    public static RelativeUrl = 'companies-access';
    public static EntityType = 'CompanyAccess';

    public Deleted: boolean;
    public CreatedBy: string;
    public EndDate: Date;
    public StartDate: Date;
    public UpdatedAt: Date;
    public CompanyID: number;
    public Roles: string;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public ID: number;
    public GlobalIdentity: string;
    public _createguid: string;
    public CustomFields: any;
}


export class CompanyBackup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'CompanyBackup';

    public Deleted: boolean;
    public OrgNumber: string;
    public CreatedBy: string;
    public Reason: string;
    public CompanyKey: string;
    public CompanyName: string;
    public UpdatedAt: Date;
    public CustomerName: string;
    public Message: string;
    public SchemaName: string;
    public ContractID: number;
    public Environment: string;
    public DeletedAt: Date;
    public ContractType: number;
    public CloudBlobName: string;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public BackupStatus: BackupStatus;
    public ID: number;
    public ContainerName: string;
    public CopyFiles: boolean;
    public ScheduledForDeleteAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class ContractCron extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ContractCron';

    public Deleted: boolean;
    public CreatedBy: string;
    public Expression: string;
    public UpdatedAt: Date;
    public CompanyID: number;
    public ContractID: number;
    public ContractTriggerID: number;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public ID: number;
    public CompanyKey: string;
    public CompanyDbName: string;
    public _createguid: string;
    public CustomFields: any;
}


export class ContractObyte extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ContractObyte';

    public Deleted: boolean;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public CompanyID: number;
    public ContractID: number;
    public Address: string;
    public AssetAddress: string;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public ID: number;
    public ContractAddressID: number;
    public CompanyKey: string;
    public CompanyDbName: string;
    public _createguid: string;
    public CustomFields: any;
}


export class DeniedUserAccessLog extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'DeniedUserAccessLog';

    public Deleted: boolean;
    public CreatedBy: string;
    public Username: string;
    public CompanyName: string;
    public UpdatedAt: Date;
    public CompanyID: number;
    public Occurred: Date;
    public Message: string;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public Email: string;
    public ID: number;
    public _createguid: string;
    public Company: Company;
    public CustomFields: any;
}


export class FailedBankFile extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'FailedBankFile';

    public Deleted: boolean;
    public CreatedBy: string;
    public FailedReason: FailedReasonEnum;
    public CompanyKey: string;
    public UpdatedAt: Date;
    public FileContent: string;
    public FileName: string;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class HangfireJob extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'HangfireJob';

    public Status: number;
    public CompanyKey: string;
    public UpdatedAt: Date;
    public CompanyID: number;
    public JobId: string;
    public Year: number;
    public HasError: boolean;
    public CreatedAt: Date;
    public Completed: boolean;
    public ID: number;
    public GlobalIdentity: string;
    public CustomFields: any;
}


export class HangfireJobContext extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'HangfireJobContext';

    public Status: number;
    public CompanyKey: string;
    public UpdatedAt: Date;
    public CompanyID: number;
    public SchemaName: string;
    public JobId: string;
    public Year: number;
    public HasError: boolean;
    public CreatedAt: Date;
    public Completed: boolean;
    public ID: number;
    public GlobalIdentity: string;
    public CustomFields: any;
}


export class HangfireResponse extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'HangfireResponse';

    public Status: number;
    public CompanyKey: string;
    public UpdatedAt: Date;
    public CompanyID: number;
    public JobId: string;
    public State: string;
    public Year: number;
    public HasError: boolean;
    public CreatedAt: Date;
    public Completed: boolean;
    public ID: number;
    public ProgressUrl: string;
    public GlobalIdentity: string;
    public CustomFields: any;
}


export class KpiDefinition extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'KpiDefinition';

    public Deleted: boolean;
    public CreatedBy: string;
    public Application: string;
    public RoleNames: string;
    public UpdatedAt: Date;
    public CompanyID: number;
    public SourceType: KpiSourceType;
    public RefreshModels: string;
    public UpdatedBy: string;
    public Name: string;
    public CreatedAt: Date;
    public Interval: string;
    public ValueType: KpiValueType;
    public Route: string;
    public ID: number;
    public IsPerUser: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class KpiValue extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'KpiValue';

    public Deleted: boolean;
    public CreatedBy: string;
    public LastUpdated: Date;
    public UserIdentity: string;
    public UpdatedAt: Date;
    public CompanyID: number;
    public Total: number;
    public KpiDefinitionID: number;
    public Text: string;
    public KpiName: string;
    public Counter: number;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public ID: number;
    public ValueStatus: KpiValueStatus;
    public _createguid: string;
    public CustomFields: any;
}


export class OutgoingInvoice extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'OutgoingInvoice';

    public Deleted: boolean;
    public CreatedBy: string;
    public Status: number;
    public DueDate: Date;
    public RecipientPhoneNumber: string;
    public UpdatedAt: Date;
    public CompanyID: number;
    public ExternalReference: string;
    public StatusCode: number;
    public RecipientOrganizationNumber: string;
    public Amount: number;
    public ISPOrganizationNumber: string;
    public MetaJson: string;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public InvoiceID: number;
    public ID: number;
    public InvoiceType: OutgoingInvoiceType;
    public _createguid: string;
    public Company: Company;
    public CustomFields: any;
}


export class ProcessFileLog extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ProcessFileLog';

    public Deleted: boolean;
    public EntityCount: number;
    public CreatedBy: string;
    public EntityInstanceID: string;
    public CompanyKey: string;
    public UserIdentity: string;
    public CompanyName: string;
    public FileType: number;
    public UpdatedAt: Date;
    public CompanyID: number;
    public Message: string;
    public StatusCode: number;
    public FileName: string;
    public UpdatedBy: string;
    public FileID: number;
    public CreatedAt: Date;
    public ID: number;
    public EntityName: string;
    public _createguid: string;
    public Company: Company;
    public CustomFields: any;
}


export class ServiceAccount extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ServiceAccount';

    public Deleted: boolean;
    public CreatedBy: string;
    public KeyPath: string;
    public DataSender: string;
    public UpdatedAt: Date;
    public Description: string;
    public NextNumber: number;
    public UpdatedBy: string;
    public Thumbprint: string;
    public CreatedAt: Date;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class UserVerification extends UniEntity {
    public static RelativeUrl = 'user-verifications';
    public static EntityType = 'UserVerification';

    public Deleted: boolean;
    public CreatedBy: string;
    public RequestOrigin: UserVerificationRequestOrigin;
    public UpdatedAt: Date;
    public CompanyId: number;
    public UserId: number;
    public VerificationDate: Date;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public DisplayName: string;
    public VerificationCode: string;
    public ExpirationDate: Date;
    public UserType: UserVerificationUserType;
    public Email: string;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class Account extends UniEntity {
    public static RelativeUrl = 'accounts';
    public static EntityType = 'Account';

    public Deleted: boolean;
    public AccountSetupID: number;
    public CreatedBy: string;
    public Keywords: string;
    public AccountNumber: number;
    public LockManualPosts: boolean;
    public SystemAccount: boolean;
    public CurrencyCodeID: number;
    public UpdatedAt: Date;
    public Visible: boolean;
    public SupplierID: number;
    public UsePostPost: boolean;
    public VatTypeID: number;
    public Description: string;
    public Locked: boolean;
    public DimensionsID: number;
    public CostAllocationID: number;
    public TopLevelAccountGroupID: number;
    public AccountID: number;
    public SaftMappingAccountID: number;
    public Active: boolean;
    public EmployeeID: number;
    public StatusCode: number;
    public CustomerID: number;
    public DoSynchronize: boolean;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public AccountName: string;
    public ID: number;
    public AccountGroupID: number;
    public UseVatDeductionGroupID: number;
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
    public CreatedBy: string;
    public UpdatedAt: Date;
    public AccountID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public Name: string;
    public CreatedAt: Date;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class AccountGroup extends UniEntity {
    public static RelativeUrl = 'accountgroups';
    public static EntityType = 'AccountGroup';

    public Deleted: boolean;
    public CreatedBy: string;
    public Summable: boolean;
    public UpdatedAt: Date;
    public AccountGroupSetupID: number;
    public AccountID: number;
    public AccountGroupSetID: number;
    public StatusCode: number;
    public GroupNumber: string;
    public MainGroupID: number;
    public UpdatedBy: string;
    public CompatibleAccountID: number;
    public Name: string;
    public CreatedAt: Date;
    public ID: number;
    public _createguid: string;
    public MainGroup: AccountGroup;
    public AccountGroupSet: AccountGroupSet;
    public CustomFields: any;
}


export class AccountGroupSet extends UniEntity {
    public static RelativeUrl = 'accountgroupsets';
    public static EntityType = 'AccountGroupSet';

    public Deleted: boolean;
    public CreatedBy: string;
    public SubAccountAllowed: boolean;
    public UpdatedAt: Date;
    public FromAccountNumber: number;
    public StatusCode: number;
    public ToAccountNumber: number;
    public Shared: boolean;
    public UpdatedBy: string;
    public Name: string;
    public CreatedAt: Date;
    public ID: number;
    public System: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class AccountMandatoryDimension extends UniEntity {
    public static RelativeUrl = 'accountmandatorydimension';
    public static EntityType = 'AccountMandatoryDimension';

    public Deleted: boolean;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public MandatoryType: number;
    public AccountID: number;
    public DimensionNo: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class Accrual extends UniEntity {
    public static RelativeUrl = 'accruals';
    public static EntityType = 'Accrual';

    public Deleted: boolean;
    public CreatedBy: string;
    public BalanceAccountID: number;
    public UpdatedAt: Date;
    public AccrualJournalEntryMode: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public AccrualAmount: number;
    public CreatedAt: Date;
    public ResultAccountID: number;
    public ID: number;
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

    public Deleted: boolean;
    public CreatedBy: string;
    public AccrualID: number;
    public UpdatedAt: Date;
    public PeriodNo: number;
    public StatusCode: number;
    public Amount: number;
    public JournalEntryDraftLineID: number;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public ID: number;
    public AccountYear: number;
    public _createguid: string;
    public Accrual: Accrual;
    public JournalEntryLineDraft: JournalEntryLineDraft;
    public CustomFields: any;
}


export class AltinnAccountLink extends UniEntity {
    public static RelativeUrl = 'altinnaccountlinks';
    public static EntityType = 'AltinnAccountLink';

    public Deleted: boolean;
    public CreatedBy: string;
    public AccountNumber: number;
    public AltinnAccountNumber: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class ApprovalData extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ApprovalData';

    public Deleted: boolean;
    public EntityCount: number;
    public CreatedBy: string;
    public EntityID: number;
    public IPAddress: string;
    public UpdatedAt: Date;
    public VerificationReference: string;
    public VerificationMethod: string;
    public EntityReference: string;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public EntityHash: string;
    public ID: number;
    public EntityName: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Asset extends UniEntity {
    public static RelativeUrl = 'assets';
    public static EntityType = 'Asset';

    public Deleted: boolean;
    public PurchaseDate: LocalDate;
    public CreatedBy: string;
    public DepreciationCycle: number;
    public BalanceAccountID: number;
    public IncomingFinancialValue: number;
    public Knr: number;
    public AssetGroupCode: string;
    public AutoDepreciation: boolean;
    public UpdatedAt: Date;
    public ScrapValue: number;
    public IBValue1984: number;
    public DepreciationAccountID: number;
    public DimensionsID: number;
    public Gnr: number;
    public Bnr: number;
    public PurchaseAmount: number;
    public HistoricalCostPrice: number;
    public StatusCode: number;
    public Lifetime: number;
    public UpdatedBy: string;
    public LowerDepreciationValue: number;
    public Name: string;
    public CreatedAt: Date;
    public DepreciationStartDate: LocalDate;
    public ID: number;
    public NetFinancialValue: number;
    public Status: string;
    public CurrentNetFinancialValue: number;
    public _createguid: string;
    public BalanceAccount: Account;
    public DepreciationAccount: Account;
    public Dimensions: Dimensions;
    public DepreciationLines: Array<DepreciationLine>;
    public CustomFields: any;
}


export class AssetTaxbasedIB extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AssetTaxbasedIB';

    public Deleted: boolean;
    public CreatedBy: string;
    public GroupCode: string;
    public UpdatedAt: Date;
    public Movement: number;
    public PurchaseAmount: number;
    public PurchaseYear: number;
    public StatusCode: number;
    public AssetID: number;
    public Year: number;
    public Value: number;
    public UpdatedBy: string;
    public Name: string;
    public TaxbasedDepreciation: number;
    public DepreciationRate: number;
    public CreatedAt: Date;
    public ID: number;
    public TaxBasedUB: number;
    public _createguid: string;
    public CustomFields: any;
}


export class Bank extends UniEntity {
    public static RelativeUrl = 'banks';
    public static EntityType = 'Bank';

    public Deleted: boolean;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public InitialBIC: string;
    public AddressID: number;
    public EmailID: number;
    public PhoneID: number;
    public StatusCode: number;
    public BIC: string;
    public Web: string;
    public UpdatedBy: string;
    public Name: string;
    public CreatedAt: Date;
    public ID: number;
    public _createguid: string;
    public Address: Address;
    public Phone: Phone;
    public Email: Email;
    public CustomFields: any;
}


export class BankAccount extends UniEntity {
    public static RelativeUrl = 'bankaccounts';
    public static EntityType = 'BankAccount';

    public Deleted: boolean;
    public IntegrationStatus: number;
    public BankAccountType: string;
    public CreatedBy: string;
    public Label: string;
    public AccountNumber: string;
    public BankID: number;
    public BusinessRelationID: number;
    public IntegrationSettings: string;
    public IBAN: string;
    public UpdatedAt: Date;
    public Locked: boolean;
    public AccountID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public CompanySettingsID: number;
    public CreatedAt: Date;
    public ID: number;
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

    public Deleted: boolean;
    public CreatedBy: string;
    public HasOrderedIntegrationChange: boolean;
    public BankAccountID: number;
    public BankAcceptance: boolean;
    public UpdatedAt: Date;
    public IsOutgoing: boolean;
    public PropertiesJson: string;
    public ServiceProvider: number;
    public StatusCode: number;
    public ServiceID: string;
    public IsInbound: boolean;
    public DefaultAgreement: boolean;
    public UpdatedBy: string;
    public ServiceTemplateID: string;
    public Name: string;
    public CreatedAt: Date;
    public PreApprovedBankPayments: PreApprovedBankPayments;
    public Email: string;
    public ID: number;
    public HasNewAccountInformation: boolean;
    public IsBankBalance: boolean;
    public _createguid: string;
    public Password: string;
    public BankAccount: BankAccount;
    public CustomFields: any;
}


export class BankRule extends UniEntity {
    public static RelativeUrl = 'bankrules';
    public static EntityType = 'BankRule';

    public Deleted: boolean;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public AccountID: number;
    public Priority: number;
    public StatusCode: number;
    public Rule: string;
    public UpdatedBy: string;
    public Name: string;
    public CreatedAt: Date;
    public ID: number;
    public IsActive: boolean;
    public ActionCode: ActionCodeBankRule;
    public _createguid: string;
    public Account: Account;
    public CustomFields: any;
}


export class BankStatement extends UniEntity {
    public static RelativeUrl = 'bankstatements';
    public static EntityType = 'BankStatement';

    public Deleted: boolean;
    public CreatedBy: string;
    public ArchiveReference: string;
    public FromDate: LocalDate;
    public StartBalance: number;
    public BankAccountID: number;
    public EndBalance: number;
    public UpdatedAt: Date;
    public AccountID: number;
    public ToDate: LocalDate;
    public CurrencyCode: string;
    public StatusCode: number;
    public AmountCurrency: number;
    public Amount: number;
    public UpdatedBy: string;
    public FileID: number;
    public CreatedAt: Date;
    public ID: number;
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

    public Deleted: boolean;
    public Receivername: string;
    public CreatedBy: string;
    public ArchiveReference: string;
    public BankStatementID: number;
    public OpenAmount: number;
    public ValueDate: LocalDate;
    public BookingDate: LocalDate;
    public InvoiceNumber: string;
    public TransactionId: string;
    public UpdatedAt: Date;
    public Description: string;
    public Category: string;
    public CID: string;
    public CurrencyCode: string;
    public OpenAmountCurrency: number;
    public StatusCode: number;
    public AmountCurrency: number;
    public Amount: number;
    public SenderName: string;
    public StructuredReference: string;
    public UpdatedBy: string;
    public ReceiverAccount: string;
    public CreatedAt: Date;
    public SenderAccount: string;
    public ID: number;
    public _createguid: string;
    public BankStatement: BankStatement;
    public CustomFields: any;
}


export class BankStatementMatch extends UniEntity {
    public static RelativeUrl = 'bankstatementmatch';
    public static EntityType = 'BankStatementMatch';

    public Deleted: boolean;
    public CreatedBy: string;
    public Batch: string;
    public JournalEntryLineID: number;
    public UpdatedAt: Date;
    public BankStatementEntryID: number;
    public Group: string;
    public StatusCode: number;
    public Amount: number;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public ID: number;
    public _createguid: string;
    public BankStatementEntry: BankStatementEntry;
    public JournalEntryLine: JournalEntryLine;
    public CustomFields: any;
}


export class BankStatementRule extends UniEntity {
    public static RelativeUrl = 'bankstatementrules';
    public static EntityType = 'BankStatementRule';

    public Deleted: boolean;
    public CreatedBy: string;
    public EntryText: string;
    public UpdatedAt: Date;
    public DimensionsID: number;
    public AccountID: number;
    public Priority: number;
    public StatusCode: number;
    public Rule: string;
    public UpdatedBy: string;
    public Name: string;
    public CreatedAt: Date;
    public ID: number;
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
    public CreatedBy: string;
    public UpdatedAt: Date;
    public AccountingYear: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public Name: string;
    public CreatedAt: Date;
    public ID: number;
    public _createguid: string;
    public Entries: Array<BudgetEntry>;
    public CustomFields: any;
}


export class BudgetEntry extends UniEntity {
    public static RelativeUrl = 'budgetentries';
    public static EntityType = 'BudgetEntry';

    public Deleted: boolean;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public BudgetID: number;
    public DimensionsID: number;
    public AccountID: number;
    public StatusCode: number;
    public Amount: number;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public PeriodNumber: number;
    public ID: number;
    public _createguid: string;
    public Budget: Budget;
    public Account: Account;
    public Dimensions: Dimensions;
    public CustomFields: any;
}


export class CompanyAccountingSettings extends UniEntity {
    public static RelativeUrl = 'companyaccountingsettings';
    public static EntityType = 'CompanyAccountingSettings';

    public Deleted: boolean;
    public CreatedBy: string;
    public AssetSaleLossNoVatAccountID: number;
    public ReInvoicingMethod: number;
    public UpdatedAt: Date;
    public AssetSaleProfitVatAccountID: number;
    public ReInvoicingCostsharingProductID: number;
    public AssetSaleProfitNoVatAccountID: number;
    public StatusCode: number;
    public AssetSaleLossVatAccountID: number;
    public ReInvoicingTurnoverProductID: number;
    public AssetSaleProfitBalancingAccountID: number;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public AssetWriteoffAccountID: number;
    public ID: number;
    public AssetSaleLossBalancingAccountID: number;
    public AssetSaleProductID: number;
    public _createguid: string;
    public ReInvoicingCostsharingProduct: Product;
    public ReInvoicingTurnoverProduct: Product;
    public CustomFields: any;
}


export class CompanyBankAccount extends UniEntity {
    public static RelativeUrl = 'companybankaccounts';
    public static EntityType = 'CompanyBankAccount';

    public Deleted: boolean;
    public CreatedBy: string;
    public BankAccountID: number;
    public IsSalary: boolean;
    public UpdatedAt: Date;
    public IsOutgoing: boolean;
    public AccountID: number;
    public IsTax: boolean;
    public StatusCode: number;
    public CreditAmount: number;
    public UpdatedBy: string;
    public Name: string;
    public CreatedAt: Date;
    public ID: number;
    public IsIncomming: boolean;
    public _createguid: string;
    public BankAccount: BankAccount;
    public Account: Account;
    public CustomFields: any;
}


export class CostAllocation extends UniEntity {
    public static RelativeUrl = 'costallocations';
    public static EntityType = 'CostAllocation';

    public Deleted: boolean;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public UpdatedBy: string;
    public Name: string;
    public CreatedAt: Date;
    public ID: number;
    public _createguid: string;
    public Items: Array<CostAllocationItem>;
    public CustomFields: any;
}


export class CostAllocationItem extends UniEntity {
    public static RelativeUrl = 'costallocationitems';
    public static EntityType = 'CostAllocationItem';

    public Deleted: boolean;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public VatTypeID: number;
    public Description: string;
    public DimensionsID: number;
    public Percent: number;
    public CostAllocationID: number;
    public AccountID: number;
    public StatusCode: number;
    public Amount: number;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public ID: number;
    public _createguid: string;
    public Account: Account;
    public VatType: VatType;
    public Dimensions: Dimensions;
    public CustomFields: any;
}


export class CustomLiquidityPayment extends UniEntity {
    public static RelativeUrl = 'liquiditypayment';
    public static EntityType = 'CustomLiquidityPayment';

    public Deleted: boolean;
    public CreatedBy: string;
    public DueDate: LocalDate;
    public EndDate: LocalDate;
    public CurrencyCodeID: number;
    public UpdatedAt: Date;
    public Description: string;
    public StatusCode: number;
    public AmountCurrency: number;
    public Amount: number;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public IsCustomerPayment: boolean;
    public ID: number;
    public CustomLiquidityPaymentType: CustomLiquidityPaymentInterval;
    public _createguid: string;
    public currency: CurrencyCode;
    public CustomFields: any;
}


export class DepreciationLine extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'DepreciationLine';

    public Deleted: boolean;
    public CreatedBy: string;
    public AssetJELineID: number;
    public DepreciationJELineID: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public AssetID: number;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public ID: number;
    public DepreciationType: number;
    public _createguid: string;
    public DepreciationJELine: JournalEntryLine;
    public AssetJELine: JournalEntryLine;
    public CustomFields: any;
}


export class FinancialYear extends UniEntity {
    public static RelativeUrl = 'financialyears';
    public static EntityType = 'FinancialYear';

    public Deleted: boolean;
    public CreatedBy: string;
    public ValidTo: LocalDate;
    public ValidFrom: LocalDate;
    public UpdatedAt: Date;
    public StatusCode: number;
    public Year: number;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class JournalEntry extends UniEntity {
    public static RelativeUrl = 'journalentries';
    public static EntityType = 'JournalEntry';

    public Deleted: boolean;
    public CreatedBy: string;
    public NumberSeriesID: number;
    public JournalEntryAccrualID: number;
    public UpdatedAt: Date;
    public NumberSeriesTaskID: number;
    public JournalEntryDraftGroup: string;
    public Description: string;
    public FinancialYearID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public JournalEntryNumberNumeric: number;
    public ID: number;
    public JournalEntryNumber: string;
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

    public Deleted: boolean;
    public CreatedBy: string;
    public RestAmountCurrency: number;
    public AccrualID: number;
    public Signature: string;
    public OriginalJournalEntryPost: number;
    public DueDate: LocalDate;
    public CustomerOrderID: number;
    public VatPercent: number;
    public RestAmount: number;
    public InvoiceNumber: string;
    public VatReportID: number;
    public CurrencyCodeID: number;
    public UpdatedAt: Date;
    public FinancialDate: LocalDate;
    public CustomerInvoiceID: number;
    public VatJournalEntryPostID: number;
    public ReferenceOriginalPostID: number;
    public VatTypeID: number;
    public Description: string;
    public DimensionsID: number;
    public SubAccountID: number;
    public ReferenceCreditPostID: number;
    public AccountID: number;
    public TaxBasisAmount: number;
    public PaymentReferenceID: number;
    public PaymentInfoTypeID: number;
    public PostPostJournalEntryLineID: number;
    public StatusCode: number;
    public BatchNumber: number;
    public AmountCurrency: number;
    public Amount: number;
    public PaymentID: string;
    public JournalEntryID: number;
    public PeriodID: number;
    public TaxBasisAmountCurrency: number;
    public JournalEntryTypeID: number;
    public RegisteredDate: LocalDate;
    public SupplierInvoiceID: number;
    public VatDate: LocalDate;
    public UpdatedBy: string;
    public CurrencyExchangeRate: number;
    public CreatedAt: Date;
    public JournalEntryNumberNumeric: number;
    public VatDeductionPercent: number;
    public ID: number;
    public OriginalReferencePostID: number;
    public VatPeriodID: number;
    public JournalEntryLineDraftID: number;
    public JournalEntryNumber: string;
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

    public Deleted: boolean;
    public CreatedBy: string;
    public AccrualID: number;
    public Signature: string;
    public DueDate: LocalDate;
    public CustomerOrderID: number;
    public VatPercent: number;
    public InvoiceNumber: string;
    public CurrencyCodeID: number;
    public UpdatedAt: Date;
    public FinancialDate: LocalDate;
    public CustomerInvoiceID: number;
    public VatTypeID: number;
    public Description: string;
    public DimensionsID: number;
    public SubAccountID: number;
    public AccountID: number;
    public TaxBasisAmount: number;
    public PaymentReferenceID: number;
    public PaymentInfoTypeID: number;
    public PostPostJournalEntryLineID: number;
    public StatusCode: number;
    public BatchNumber: number;
    public AmountCurrency: number;
    public Amount: number;
    public PaymentID: string;
    public JournalEntryID: number;
    public PeriodID: number;
    public TaxBasisAmountCurrency: number;
    public JournalEntryTypeID: number;
    public RegisteredDate: LocalDate;
    public SupplierInvoiceID: number;
    public VatDate: LocalDate;
    public UpdatedBy: string;
    public CurrencyExchangeRate: number;
    public CreatedAt: Date;
    public JournalEntryNumberNumeric: number;
    public VatDeductionPercent: number;
    public ID: number;
    public VatPeriodID: number;
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

    public Deleted: boolean;
    public CreatedBy: string;
    public ColumnSetUp: string;
    public UpdatedAt: Date;
    public TraceLinkTypes: string;
    public VisibleModules: string;
    public StatusCode: number;
    public UpdatedBy: string;
    public Name: string;
    public CreatedAt: Date;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class JournalEntrySourceSerie extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'JournalEntrySourceSerie';

    public Deleted: boolean;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public JournalEntrySourceID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public ID: number;
    public JournalEntrySourceEntityName: string;
    public _createguid: string;
    public JournalEntrySourceInstanceID: number;
    public CustomFields: any;
}


export class JournalEntryType extends UniEntity {
    public static RelativeUrl = 'journalentrytypes';
    public static EntityType = 'JournalEntryType';

    public Deleted: boolean;
    public MainName: string;
    public CreatedBy: string;
    public ExpectNegativeAmount: boolean;
    public UpdatedAt: Date;
    public Number: number;
    public UpdatedBy: string;
    public Name: string;
    public CreatedAt: Date;
    public DisplayName: string;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class LedgerSuggestion extends UniEntity {
    public OrgNumber: string;
    public IndustryName: string;
    public Source: SuggestionSource;
    public IndustryCode: string;
    public BusinessType: string;
    public Name: string;
    public ID: number;
}


export class Payment extends UniEntity {
    public static RelativeUrl = 'payments';
    public static EntityType = 'Payment';

    public Deleted: boolean;
    public CreatedBy: string;
    public Debtor: string;
    public DueDate: LocalDate;
    public IsPaymentCancellationRequest: boolean;
    public BusinessRelationID: number;
    public InvoiceNumber: string;
    public CurrencyCodeID: number;
    public UpdatedAt: Date;
    public CustomerInvoiceID: number;
    public ReconcilePayment: boolean;
    public Description: string;
    public PaymentStatusReportFileID: number;
    public FromBankAccountID: number;
    public PaymentNotificationReportFileID: number;
    public SerialNumberOrAcctSvcrRef: string;
    public PaymentCodeID: number;
    public ExternalBankAccountNumber: string;
    public Proprietary: string;
    public OcrPaymentStrings: string;
    public XmlTagEndToEndIdReference: string;
    public StatusCode: number;
    public AmountCurrency: number;
    public Amount: number;
    public PaymentID: string;
    public JournalEntryID: number;
    public CustomerInvoiceReminderID: number;
    public AutoJournal: boolean;
    public ToBankAccountID: number;
    public SupplierInvoiceID: number;
    public UpdatedBy: string;
    public CurrencyExchangeRate: number;
    public IsPaymentClaim: boolean;
    public IsExternal: boolean;
    public CreatedAt: Date;
    public BankChargeAmount: number;
    public XmlTagPmtInfIdReference: string;
    public IsCustomerPayment: boolean;
    public InPaymentID: string;
    public PaymentDate: LocalDate;
    public ID: number;
    public StatusText: string;
    public PaymentBatchID: number;
    public Domain: string;
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
    public CreatedBy: string;
    public ReceiptDate: Date;
    public HashValue: string;
    public UpdatedAt: Date;
    public PaymentStatusReportFileID: number;
    public PaymentBatchTypeID: number;
    public PaymentReferenceID: string;
    public TotalAmount: number;
    public StatusCode: number;
    public OcrTransmissionNumber: number;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public IsCustomerPayment: boolean;
    public PaymentFileID: number;
    public Camt054CMsgId: string;
    public ID: number;
    public NumberOfPayments: number;
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

    public Deleted: boolean;
    public CreatedBy: string;
    public Date: LocalDate;
    public JournalEntryLine2ID: number;
    public CurrencyCodeID: number;
    public UpdatedAt: Date;
    public StatusCode: number;
    public AmountCurrency: number;
    public Amount: number;
    public JournalEntryLine1ID: number;
    public UpdatedBy: string;
    public CurrencyExchangeRate: number;
    public CreatedAt: Date;
    public ID: number;
    public _createguid: string;
    public JournalEntryLine1: JournalEntryLine;
    public JournalEntryLine2: JournalEntryLine;
    public CurrencyCode: CurrencyCode;
    public CustomFields: any;
}


export class ReInvoice extends UniEntity {
    public static RelativeUrl = 'reinvoicing';
    public static EntityType = 'ReInvoice';

    public Deleted: boolean;
    public OwnCostShare: number;
    public CreatedBy: string;
    public ReInvoicingType: number;
    public UpdatedAt: Date;
    public ProductID: number;
    public TaxExclusiveAmount: number;
    public StatusCode: number;
    public SupplierInvoiceID: number;
    public TaxInclusiveAmount: number;
    public UpdatedBy: string;
    public OwnCostAmount: number;
    public CreatedAt: Date;
    public ID: number;
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
    public CreatedBy: string;
    public UpdatedAt: Date;
    public GrossAmount: number;
    public StatusCode: number;
    public Share: number;
    public ReInvoiceID: number;
    public CustomerID: number;
    public NetAmount: number;
    public UpdatedBy: string;
    public Surcharge: number;
    public CreatedAt: Date;
    public Vat: number;
    public ID: number;
    public _createguid: string;
    public Customer: Customer;
    public CustomFields: any;
}


export class SupplierInvoice extends UniEntity {
    public static RelativeUrl = 'supplierinvoices';
    public static EntityType = 'SupplierInvoice';

    public Deleted: boolean;
    public PaymentInformation: string;
    public ReInvoiced: boolean;
    public CreatedBy: string;
    public InternalNote: string;
    public RestAmountCurrency: number;
    public TaxInclusiveAmountCurrency: number;
    public DefaultDimensionsID: number;
    public CreditedAmount: number;
    public IsSentToPayment: boolean;
    public SupplierOrgNumber: string;
    public DeliveryMethod: string;
    public DeliveryTermsID: number;
    public BankAccountID: number;
    public PaymentDueDate: LocalDate;
    public InvoiceAddressLine1: string;
    public InvoiceReferenceID: number;
    public InvoiceAddressLine3: string;
    public PaymentTermsID: number;
    public Credited: boolean;
    public ShippingCountryCode: string;
    public DeliveryName: string;
    public RestAmount: number;
    public InvoiceNumber: string;
    public PrintStatus: number;
    public ShippingAddressLine2: string;
    public CurrencyCodeID: number;
    public UpdatedAt: Date;
    public DeliveryTerm: string;
    public Requisition: string;
    public SupplierID: number;
    public InvoiceAddressLine2: string;
    public InvoiceReceiverName: string;
    public PayableRoundingAmount: number;
    public AmountRegards: string;
    public InvoicePostalCode: string;
    public CreditedAmountCurrency: number;
    public InvoiceDate: LocalDate;
    public ShippingCity: string;
    public CustomerOrgNumber: string;
    public YourReference: string;
    public PaymentStatus: number;
    public ShippingCountry: string;
    public Comment: string;
    public InvoiceCountryCode: string;
    public CustomerPerson: string;
    public TaxExclusiveAmount: number;
    public StatusCode: number;
    public PaymentTerm: string;
    public DeliveryDate: LocalDate;
    public VatTotalsAmount: number;
    public ShippingPostalCode: string;
    public ReInvoiceID: number;
    public VatTotalsAmountCurrency: number;
    public FreeTxt: string;
    public Payment: string;
    public PaymentID: string;
    public JournalEntryID: number;
    public PayableRoundingCurrencyAmount: number;
    public ShippingAddressLine1: string;
    public TaxInclusiveAmount: number;
    public InvoiceCity: string;
    public UpdatedBy: string;
    public CurrencyExchangeRate: number;
    public OurReference: string;
    public ShippingAddressLine3: string;
    public CreatedAt: Date;
    public SalesPerson: string;
    public ProjectID: number;
    public CreditDays: number;
    public ID: number;
    public InvoiceType: number;
    public InvoiceOriginType: SupplierInvoiceOriginType;
    public TaxExclusiveAmountCurrency: number;
    public InvoiceCountry: string;
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

    public Deleted: boolean;
    public Unit: string;
    public SumVat: number;
    public CreatedBy: string;
    public SumVatCurrency: number;
    public VatPercent: number;
    public InvoicePeriodEndDate: LocalDate;
    public CurrencyCodeID: number;
    public SumTotalIncVat: number;
    public UpdatedAt: Date;
    public PriceSetByUser: boolean;
    public CalculateGrossPriceBasedOnNetPrice: boolean;
    public VatTypeID: number;
    public DiscountCurrency: number;
    public PriceExVat: number;
    public DimensionsID: number;
    public SumTotalExVat: number;
    public Discount: number;
    public ItemText: string;
    public Comment: string;
    public ProductID: number;
    public StatusCode: number;
    public DiscountPercent: number;
    public SumTotalIncVatCurrency: number;
    public SupplierInvoiceID: number;
    public NumberOfItems: number;
    public UpdatedBy: string;
    public CurrencyExchangeRate: number;
    public CreatedAt: Date;
    public AccountingCost: string;
    public SortIndex: number;
    public InvoicePeriodStartDate: LocalDate;
    public ID: number;
    public PriceIncVat: number;
    public PriceExVatCurrency: number;
    public SumTotalExVatCurrency: number;
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

    public Deleted: boolean;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public No: string;
    public UpdatedBy: string;
    public Name: string;
    public CreatedAt: Date;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class VatDeduction extends UniEntity {
    public static RelativeUrl = 'vatdeductions';
    public static EntityType = 'VatDeduction';

    public Deleted: boolean;
    public CreatedBy: string;
    public ValidTo: LocalDate;
    public ValidFrom: LocalDate;
    public UpdatedAt: Date;
    public VatDeductionGroupID: number;
    public StatusCode: number;
    public DeductionPercent: number;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public ID: number;
    public _createguid: string;
    public VatDeductionGroup: VatDeductionGroup;
    public CustomFields: any;
}


export class VatDeductionGroup extends UniEntity {
    public static RelativeUrl = 'vatdeductiongroups';
    public static EntityType = 'VatDeductionGroup';

    public Deleted: boolean;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public UpdatedBy: string;
    public Name: string;
    public CreatedAt: Date;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class VatPost extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'VatPost';

    public Deleted: boolean;
    public CreatedBy: string;
    public VatCodeGroupID: number;
    public UpdatedAt: Date;
    public HasTaxBasis: boolean;
    public StatusCode: number;
    public No: string;
    public UpdatedBy: string;
    public Name: string;
    public ReportAsNegativeAmount: boolean;
    public CreatedAt: Date;
    public ID: number;
    public HasTaxAmount: boolean;
    public _createguid: string;
    public VatCodeGroup: VatCodeGroup;
    public VatReportReferences: Array<VatReportReference>;
    public CustomFields: any;
}


export class VatReport extends UniEntity {
    public static RelativeUrl = 'vatreports';
    public static EntityType = 'VatReport';

    public InternalComment: string;
    public Deleted: boolean;
    public CreatedBy: string;
    public ReportedDate: Date;
    public VatReportTypeID: number;
    public VatReportArchivedSummaryID: number;
    public UpdatedAt: Date;
    public Comment: string;
    public TerminPeriodID: number;
    public StatusCode: number;
    public ExternalRefNo: string;
    public Title: string;
    public JournalEntryID: number;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public ExecutedDate: Date;
    public ID: number;
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
    public CreatedBy: string;
    public PaymentYear: number;
    public SummaryHeader: string;
    public PaymentDueDate: Date;
    public PaymentBankAccountNumber: string;
    public PaymentPeriod: string;
    public UpdatedAt: Date;
    public AmountToBePayed: number;
    public AmountToBeReceived: number;
    public PaymentToDescription: string;
    public StatusCode: number;
    public PaymentID: string;
    public UpdatedBy: string;
    public ReportName: string;
    public CreatedAt: Date;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class VatReportReference extends UniEntity {
    public static RelativeUrl = 'vatreportreferences';
    public static EntityType = 'VatReportReference';

    public Deleted: boolean;
    public CreatedBy: string;
    public VatPostID: number;
    public UpdatedAt: Date;
    public VatTypeID: number;
    public AccountID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public ID: number;
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
    public CreatedBy: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public UpdatedBy: string;
    public Name: string;
    public CreatedAt: Date;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class VatType extends UniEntity {
    public static RelativeUrl = 'vattypes';
    public static EntityType = 'VatType';

    public Deleted: boolean;
    public CreatedBy: string;
    public VatCodeGroupID: number;
    public OutputVat: boolean;
    public InUse: boolean;
    public DirectJournalEntryOnly: boolean;
    public IncomingAccountID: number;
    public ReversedTaxDutyVat: boolean;
    public UpdatedAt: Date;
    public Visible: boolean;
    public VatCodeGroupingValue: VatCodeGroupingValueEnum;
    public Locked: boolean;
    public VatTypeSetupID: number;
    public AvailableInModules: boolean;
    public OutgoingAccountID: number;
    public StatusCode: number;
    public Alias: string;
    public UpdatedBy: string;
    public Name: string;
    public CreatedAt: Date;
    public ID: number;
    public VatCode: string;
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

    public Deleted: boolean;
    public CreatedBy: string;
    public ValidTo: LocalDate;
    public VatPercent: number;
    public ValidFrom: LocalDate;
    public UpdatedAt: Date;
    public VatTypeID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class Reconcile extends UniEntity {
    public static RelativeUrl = 'reconcile';
    public static EntityType = 'Reconcile';

    public Deleted: boolean;
    public CreatedBy: string;
    public FromDate: LocalDate;
    public UpdatedAt: Date;
    public ToDate: LocalDate;
    public StatusCode: number;
    public IntervalNumber: number;
    public ReconcileType: string;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public Interval: ReconcileInterval;
    public ID: number;
    public AccountYear: number;
    public _createguid: string;
    public Accounts: Array<ReconcileAccount>;
    public CustomFields: any;
}


export class ReconcileAccount extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ReconcileAccount';

    public Deleted: boolean;
    public CreatedBy: string;
    public IsApproved: boolean;
    public ApprovedBy: string;
    public ReconcileID: number;
    public UpdatedAt: Date;
    public AccountID: number;
    public HasAttachements: boolean;
    public Comment: string;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public ID: number;
    public Balance: number;
    public ApprovedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class AnnualSettlement extends UniEntity {
    public static RelativeUrl = 'annualsettlement';
    public static EntityType = 'AnnualSettlement';

    public Deleted: boolean;
    public Type: number;
    public CreatedBy: string;
    public AutoJournalPostPonedTax: boolean;
    public AnnualSettlementCheckListID: number;
    public ReconcileID: number;
    public AnnualSettlementJSONData: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public JournalEntryID: number;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public ID: number;
    public AccountYear: number;
    public _createguid: string;
    public Reconcile: Reconcile;
    public AnnualSettlementCheckList: AnnualSettlementCheckList;
    public CustomFields: any;
}


export class AnnualSettlementCheckList extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AnnualSettlementCheckList';

    public Deleted: boolean;
    public IsAllSupplierInvoicesPaid: boolean;
    public IsAmeldingOK: boolean;
    public CreatedBy: string;
    public IsStockOK: boolean;
    public UpdatedAt: Date;
    public AreAllPreviousYearsEndedAndBalances: boolean;
    public StatusCode: number;
    public IsAllCustomerInvoicesPaid: boolean;
    public IsAllJournalsDone: boolean;
    public UpdatedBy: string;
    public IsAssetsOK: boolean;
    public IsShareCapitalOK: boolean;
    public CreatedAt: Date;
    public IsVatReportOK: boolean;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class TaxReport extends UniEntity {
    public static RelativeUrl = 'taxreport';
    public static EntityType = 'TaxReport';

    public Deleted: boolean;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public StatusCode: number;
    public Data: string;
    public AnnualSettlementID: number;
    public Year: number;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public ID: number;
    public Code: string;
    public _createguid: string;
    public CustomFields: any;
}


export class EntityValidationRule extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'EntityValidationRule';

    public Deleted: boolean;
    public CreatedBy: string;
    public PropertyName: string;
    public Operator: Operator;
    public UpdatedAt: Date;
    public Message: string;
    public ChangedByCompany: boolean;
    public EntityType: string;
    public Level: ValidationLevel;
    public SyncKey: string;
    public Operation: OperationType;
    public Value: string;
    public UpdatedBy: string;
    public OnConflict: OnConflict;
    public CreatedAt: Date;
    public ID: number;
    public System: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class EntityValidationRuleTemplate extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'EntityValidationRuleTemplate';

    public Deleted: boolean;
    public CreatedBy: string;
    public PropertyName: string;
    public Operator: Operator;
    public UpdatedAt: Date;
    public Message: string;
    public ChangedByCompany: boolean;
    public EntityType: string;
    public Level: ValidationLevel;
    public SyncKey: string;
    public Operation: OperationType;
    public Value: string;
    public UpdatedBy: string;
    public OnConflict: OnConflict;
    public CreatedAt: Date;
    public ID: number;
    public System: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class ComplexValidationRule extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ComplexValidationRule';

    public Deleted: boolean;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Message: string;
    public ChangedByCompany: boolean;
    public EntityType: string;
    public ValidationCode: number;
    public Level: ValidationLevel;
    public SyncKey: string;
    public Operation: OperationType;
    public UpdatedBy: string;
    public OnConflict: OnConflict;
    public CreatedAt: Date;
    public ID: number;
    public System: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class ComplexValidationRuleTemplate extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ComplexValidationRuleTemplate';

    public Deleted: boolean;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Message: string;
    public ChangedByCompany: boolean;
    public EntityType: string;
    public ValidationCode: number;
    public Level: ValidationLevel;
    public SyncKey: string;
    public Operation: OperationType;
    public UpdatedBy: string;
    public OnConflict: OnConflict;
    public CreatedAt: Date;
    public ID: number;
    public System: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class CustomField extends UniEntity {
    public static RelativeUrl = 'custom-fields';
    public static EntityType = 'CustomField';

    public Deleted: boolean;
    public CreatedBy: string;
    public Nullable: boolean;
    public UpdatedAt: Date;
    public StatusCode: number;
    public DataType: string;
    public ModelID: number;
    public UpdatedBy: string;
    public Name: string;
    public CreatedAt: Date;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class ValueList extends UniEntity {
    public static RelativeUrl = 'valuelists';
    public static EntityType = 'ValueList';

    public Deleted: boolean;
    public CreatedBy: string;
    public UpdatedAt: Date;
    public Description: string;
    public UpdatedBy: string;
    public Name: string;
    public CreatedAt: Date;
    public ID: number;
    public Code: string;
    public _createguid: string;
    public Items: Array<ValueItem>;
    public CustomFields: any;
}


export class ValueItem extends UniEntity {
    public static RelativeUrl = 'valueitems';
    public static EntityType = 'ValueItem';

    public Deleted: boolean;
    public CreatedBy: string;
    public Index: number;
    public UpdatedAt: Date;
    public Description: string;
    public ValueListID: number;
    public Value: string;
    public UpdatedBy: string;
    public Name: string;
    public CreatedAt: Date;
    public ID: number;
    public Code: string;
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

    public Deleted: boolean;
    public LineBreak: boolean;
    public CreatedBy: string;
    public Label: string;
    public LookupField: boolean;
    public Sectionheader: string;
    public ValueList: string;
    public Legend: string;
    public Url: string;
    public UpdatedAt: Date;
    public Description: string;
    public EntityType: string;
    public Property: string;
    public HelpText: string;
    public FieldSet: number;
    public Section: number;
    public LookupEntityType: string;
    public ReadOnly: boolean;
    public StatusCode: number;
    public Placement: number;
    public Placeholder: string;
    public Combo: number;
    public Alignment: Alignment;
    public UpdatedBy: string;
    public FieldType: FieldType;
    public Hidden: boolean;
    public Width: string;
    public CreatedAt: Date;
    public DisplayField: string;
    public ID: number;
    public Options: string;
    public ComponentLayoutID: number;
    public _createguid: string;
    public Validations: Array<EntityValidationRule>;
    public CustomFields: any;
}


export class AssignmentDetails extends UniEntity {
    public Message: string;
}


export class TimeSheet extends UniEntity {
    public FromDate: Date;
    public Workflow: TimesheetWorkflow;
    public ToDate: Date;
    public Relation: WorkRelation;
    public Items: Array<TimeSheetItem>;
}


export class TimeSheetItem extends UniEntity {
    public EndTime: Date;
    public Status: WorkStatus;
    public Date: Date;
    public Overtime: number;
    public StartTime: Date;
    public ValidTime: number;
    public ValidTimeOff: number;
    public SickTime: number;
    public TimeOff: number;
    public WeekNumber: number;
    public ExpectedTime: number;
    public WeekDay: number;
    public Workflow: TimesheetWorkflow;
    public Flextime: number;
    public IsWeekend: boolean;
    public TotalTime: number;
    public Invoicable: number;
    public Projecttime: number;
}


export class WorkBalanceDto extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'WorkBalanceDto';

    public Deleted: boolean;
    public CreatedBy: string;
    public WorkRelationID: number;
    public LastDayActual: number;
    public BalanceFrom: Date;
    public ValidFrom: Date;
    public ValidTimeOff: number;
    public UpdatedAt: Date;
    public Description: string;
    public Days: number;
    public StatusCode: number;
    public IsStartBalance: boolean;
    public BalanceDate: Date;
    public UpdatedBy: string;
    public Balancetype: WorkBalanceTypeEnum;
    public LastDayExpected: number;
    public ExpectedMinutes: number;
    public CreatedAt: Date;
    public SumOvertime: number;
    public ID: number;
    public ActualMinutes: number;
    public Minutes: number;
    public _createguid: string;
    public WorkRelation: WorkRelation;
    public Previous: BalanceInfo;
    public Details: Array<FlexDetail>;
    public CustomFields: any;
}


export class BalanceInfo extends UniEntity {
    public Description: string;
    public BalanceDate: Date;
    public ID: number;
    public Minutes: number;
}


export class FlexDetail extends UniEntity {
    public Date: Date;
    public WorkedMinutes: number;
    public ValidTimeOff: number;
    public IsWeekend: boolean;
    public ExpectedMinutes: number;
}


export class ContactSearchServiceResponse extends UniEntity {
    public Method: string;
    public ErrorCode: number;
    public ErrorMessage: string;
    public Success: boolean;
    public ObjectName: string;
}


export class InvoiceAndReminderStatus extends UniEntity {
    public Interest: number;
    public RestAmountCurrency: number;
    public CustomerNumber: number;
    public LastDistributionStatusCode: number;
    public TaxInclusiveAmountCurrency: number;
    public RestAmount: number;
    public InvoiceNumber: number;
    public CurrencyCodeID: number;
    public CurrencyCodeCode: string;
    public LastReminderID: number;
    public CustomerInvoiceID: number;
    public CustomerName: string;
    public Fee: number;
    public InvoiceDate: LocalDate;
    public ReminderCount: number;
    public ExternalReference: string;
    public InvoiceEmailAddress: string;
    public CurrencyCodeShortCode: string;
    public NextDueDate: LocalDate;
    public StatusCode: number;
    public CreateNextReminderDate: LocalDate;
    public CustomerID: number;
    public DebtCollectionCount: number;
    public LastRemindedDate: LocalDate;
    public TaxInclusiveAmount: number;
    public DebtCollectionNoticeCount: number;
    public DontSendReminders: boolean;
    public CurrencyExchangeRate: number;
    public CustomerEmailAddress: string;
    public InvoicePaymentDueDate: LocalDate;
    public NextReminderNumber: number;
}


export class InvoicesAndRemindersReadyToRemind extends UniEntity {
    public Interest: number;
    public RestAmountCurrency: number;
    public CustomerNumber: number;
    public TaxInclusiveAmountCurrency: number;
    public ReminderNumber: number;
    public DueDate: Date;
    public RestAmount: number;
    public InvoiceNumber: number;
    public CurrencyCodeID: number;
    public CurrencyCodeCode: string;
    public CustomerInvoiceID: number;
    public CustomerName: string;
    public Fee: number;
    public InvoiceDate: Date;
    public ExternalReference: string;
    public EmailAddress: string;
    public CurrencyCodeShortCode: string;
    public StatusCode: number;
    public CustomerID: number;
    public CustomerInvoiceReminderID: number;
    public TaxInclusiveAmount: number;
    public DontSendReminders: boolean;
    public CurrencyExchangeRate: number;
}


export class CanDistributeReminderResult extends UniEntity {
    public HasPrintService: boolean;
    public RemindersWithDistributionPlan: number;
    public AlreadySentCount: number;
    public CanDistributeAllRemindersUsingPlan: boolean;
    public RemindersWithEmail: number;
    public RemindersWithPrint: number;
}


export class DistributeInvoiceReminderInput extends UniEntity {
    public SendByDistributionPlanFirst: boolean;
    public SendByEmailIfPossible: boolean;
    public SendRemainingToCasehandler: boolean;
    public CasehandlerEmail: string;
    public SendByPrintServiceIfPossible: boolean;
}


export class TradeHeaderCalculationSummary extends UniEntity {
    public SumVat: number;
    public SumVatBasis: number;
    public SumDiscount: number;
    public DecimalRoundingCurrency: number;
    public SumVatCurrency: number;
    public SumTotalIncVat: number;
    public SumNoVatBasisCurrency: number;
    public SumVatBasisCurrency: number;
    public SumTotalExVat: number;
    public SumDiscountCurrency: number;
    public DecimalRounding: number;
    public SumTotalIncVatCurrency: number;
    public SumNoVatBasis: number;
    public SumTotalExVatCurrency: number;
}


export class VatCalculationSummary extends UniEntity {
    public SumVat: number;
    public SumVatBasis: number;
    public SumVatCurrency: number;
    public VatPercent: number;
    public SumVatBasisCurrency: number;
}


export class InvoicePaymentData extends UniEntity {
    public BankChargeAccountID: number;
    public CurrencyCodeID: number;
    public DimensionsID: number;
    public AccountID: number;
    public FromBankAccountID: number;
    public AgioAccountID: number;
    public AmountCurrency: number;
    public Amount: number;
    public PaymentID: string;
    public CurrencyExchangeRate: number;
    public AgioAmount: number;
    public BankChargeAmount: number;
    public PaymentDate: LocalDate;
}


export class InvoiceSummary extends UniEntity {
    public SumTotalAmount: number;
    public SumRestAmount: number;
    public SumCreditedAmount: number;
}


export class CustomerNoAndName extends UniEntity {
    public Number: string;
    public Name: string;
}


export class InvoicePayment extends UniEntity {
    public JournalEntryLineID: number;
    public FinancialDate: LocalDate;
    public Description: string;
    public AmountCurrency: number;
    public Amount: number;
    public JournalEntryID: number;
    public JournalEntryNumber: string;
}


export class OrderOffer extends UniEntity {
    public Status: string;
    public OrderId: string;
    public CostPercentage: number;
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
    public ReasonHelpLink: string;
    public ReasonDescription: string;
}


export class AmountDetail extends UniEntity {
    public Amount: number;
    public Currency: string;
}


export class Limits extends UniEntity {
    public RemainingLimit: number;
    public MaxInvoiceAmount: number;
    public Limit: number;
}


export class AmeldingAgaAndTaxSums extends UniEntity {
    public KIDTaxDraw: string;
    public period: number;
    public AccountNumber: string;
    public KIDGarnishment: string;
    public DueDate: Date;
    public GarnishmentTax: number;
    public KIDFinancialTax: string;
    public MessageID: string;
    public KIDEmploymentTax: string;
    public TaxDraw: number;
    public FinancialTax: number;
    public EmploymentTax: number;
}


export class PayrollRunInAmeldingPeriod extends UniEntity {
    public PayrollrunPaydate: Date;
    public AmeldingSentdate: Date;
    public PayrollrunID: number;
    public CanGenerateAddition: boolean;
    public PayrollrunDescription: string;
}


export class PayAgaTaxDTO extends UniEntity {
    public correctPennyDiff: boolean;
    public payAga: boolean;
    public payGarnishment: boolean;
    public payTaxDraw: boolean;
    public payFinancialTax: boolean;
    public payDate: Date;
}


export class ValidationMessage extends UniEntity {
    public PropertyName: string;
    public EntityID: number;
    public Message: string;
    public EntityType: string;
    public Level: ValidationLevel;
    public ID: number;
    public EntityValidationRule: EntityValidationRule;
    public ComplexValidationRule: ComplexValidationRule;
}


export class AmeldingSumUp extends UniEntity {
    public type: AmeldingType;
    public status: AmeldingStatus;
    public period: number;
    public altInnStatus: string;
    public Replaces: string;
    public ReplacesAMeldingID: number;
    public generated: Date;
    public year: number;
    public LegalEntityNo: string;
    public sent: Date;
    public ID: number;
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
    public type: string;
    public endDate: Date;
    public startDate: Date;
    public arbeidsforholdId: string;
    public permisjon: Array<EmploymentLeaves>;
}


export class EmploymentLeaves extends UniEntity {
    public beskrivelse: string;
    public permisjonsId: string;
    public startdato: Date;
    public permisjonsprosent: string;
    public sluttdato: Date;
}


export class TransactionTypes extends UniEntity {
    public tax: boolean;
    public benefit: string;
    public incomeType: string;
    public description: string;
    public amount: number;
    public Base_EmploymentTax: boolean;
}


export class AGADetails extends UniEntity {
    public type: string;
    public rate: number;
    public baseAmount: number;
    public sectorName: string;
    public zoneName: string;
}


export class Totals extends UniEntity {
    public sumAGA: number;
    public sumTax: number;
    public sumUtleggstrekk: number;
}


export class AnnualStatement extends UniEntity {
    public EmployerPhoneNumber: string;
    public EmployerPostCode: string;
    public EmployerCountryCode: string;
    public EmployeeName: string;
    public EmployeeAddress: string;
    public EmployeeMunicipalName: string;
    public EmployerOrgNr: string;
    public EmployeeMunicipalNumber: string;
    public EmployerCountry: string;
    public EmployeeNumber: number;
    public EmployerEmail: string;
    public EmployeeSSn: string;
    public EmployeePostCode: string;
    public EmployerTaxMandatory: boolean;
    public EmployerAddress: string;
    public EmployerWebAddress: string;
    public Year: number;
    public EmployeeCity: string;
    public EmployerName: string;
    public VacationPayBase: number;
    public EmployerCity: string;
    public Contributions: Array<AnnualStatementLine>;
    public PensionOrBenefits: Array<AnnualStatementLine>;
    public Deductions: Array<AnnualStatementLine>;
    public Draws: Array<AnnualStatementLine>;
}


export class AnnualStatementLine extends UniEntity {
    public SupplementPackageName: string;
    public IsDeduction: boolean;
    public Sum: number;
    public Description: string;
    public TaxReturnPost: string;
    public LineIndex: number;
    public Amount: number;
    public Supplements: Array<SupplementInfo>;
}


export class SupplementInfo extends UniEntity {
    public ValueDate2: Date;
    public ValueDate: Date;
    public ValueBool: boolean;
    public ValueMoney: number;
    public WageTypeSupplementID: number;
    public ValueString: string;
    public Name: string;
    public ValueType: Valuetype;
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
    public mainStatus: string;
    public Title: string;
    public employeestatus: Array<EmployeeStatus>;
}


export class EmployeeStatus extends UniEntity {
    public status: string;
    public info: string;
    public employeeNumber: number;
    public employeeID: number;
    public year: number;
    public ssn: string;
    public changedFields: Array<FieldsChanged>;
}


export class FieldsChanged extends UniEntity {
    public valFrom: string;
    public fieldName: string;
    public valTo: string;
}


export class EmploymentHistoryRecord extends UniEntity {
    public RegulativeGroupID: number;
    public ChangedAt: Date;
    public RegulativeStepNr: number;
    public WorkPercent: number;
    public HourRate: number;
    public MonthRate: number;
}


export class CodeListRowsCodeListRow extends UniEntity {
    public Value2: string;
    public Value3: string;
    public Value1: string;
    public Code: string;
}


export class MonthlyPay extends UniEntity {
    public Period: number;
    public BasicPay: number;
    public PeriodText: string;
    public SalaryTransactions: Array<SalaryTransaction>;
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
    public usedNonTaxableAmount: number;
    public paidHolidaypay: number;
    public grossPayment: number;
    public taxBase: number;
    public pension: number;
    public netPayment: number;
    public baseVacation: number;
    public advancePayment: number;
    public sumTax: number;
    public employeeID: number;
    public nonTaxableAmount: number;
}


export class VacationPayLastYear extends UniEntity {
    public paidHolidayPay: number;
    public baseVacation: number;
    public employeeID: number;
}


export class SalaryTransactionPay extends UniEntity {
    public CompanyCity: string;
    public Withholding: number;
    public CompanyAddress: string;
    public CompanyName: string;
    public TaxBankAccountID: number;
    public SalaryBankAccountID: number;
    public CompanyBankAccountID: number;
    public PaymentDate: Date;
    public CompanyPostalCode: string;
    public PayList: Array<SalaryTransactionPayLine>;
    public SalaryBalancePayList: Array<SalaryBalancePayLine>;
}


export class SalaryTransactionPayLine extends UniEntity {
    public Account: string;
    public EmployeeName: string;
    public PostalCode: string;
    public Tax: number;
    public NetPayment: number;
    public EmployeeNumber: number;
    public Address: string;
    public City: string;
}


export class SalaryBalancePayLine extends UniEntity {
    public Account: string;
    public Sum: number;
    public Text: string;
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
    public Message: string;
    public Subject: string;
    public ReportID: number;
}


export class WorkItemToSalary extends UniEntity {
    public Rate: number;
    public PayrollRunID: number;
    public WageType: WageType;
    public Employment: Employment;
    public WorkItems: Array<WorkItem>;
}


export class Reconciliation extends UniEntity {
    public ToPeriod: number;
    public FromPeriod: number;
    public CalculatedPayruns: number;
    public Year: number;
    public CreatedPayruns: number;
    public BookedPayruns: number;
    public Groups: Array<ReconciliationGroup>;
}


export class ReconciliationGroup extends UniEntity {
    public AccountNumber: string;
    public Sum: number;
    public Lines: Array<ReconciliationLine>;
}


export class ReconciliationLine extends UniEntity {
    public WageTypeNumber: number;
    public HasEmploymentTax: boolean;
    public Sum: number;
    public Benefit: string;
    public IncomeType: string;
    public Description: string;
    public WageTypeName: string;
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
    public MemberNumber: string;
    public OUO: number;
    public UnionDraw: number;
    public Name: string;
}


export class SalaryTransactionSums extends UniEntity {
    public calculatedAGA: number;
    public percentTax: number;
    public grossPayment: number;
    public netPayment: number;
    public baseVacation: number;
    public calculatedVacationPay: number;
    public baseTableTax: number;
    public manualTax: number;
    public paidAdvance: number;
    public Payrun: number;
    public baseAGA: number;
    public paidPension: number;
    public Employee: number;
    public basePercentTax: number;
    public calculatedFinancialTax: number;
    public tableTax: number;
}


export class SalaryTransactionPeriodSums extends UniEntity {
    public OrgNumber: string;
    public ToPeriod: number;
    public FromPeriod: number;
    public AgaZone: string;
    public AgaRate: number;
    public MunicipalName: string;
    public Year: number;
    public Sums: SalaryTransactionSums;
    public Aga: AGACalculation;
}


export class code extends UniEntity {
    public gyldigfom: string;
    public gyldigtil: string;
    public gmlcode: string;
    public inngaarIGrunnlagForTrekk: string;
    public postnr: string;
    public kunfranav: string;
    public skatteOgAvgiftregel: string;
    public fordel: string;
    public uninavn: string;
    public utloeserArbeidsgiveravgift: string;
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
    public IsTemplate: boolean;
    public CompanyName: string;
    public ContractID: number;
    public ProductNames: string;
    public IsTest: boolean;
    public ContractType: number;
    public LicenseKey: string;
    public TemplateCompanyKey: string;
    public CopyFiles: boolean;
    public CompanySettings: CompanySettings;
}


export class UserDto extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'UserDto';

    public Deleted: boolean;
    public CreatedBy: string;
    public UserName: string;
    public HasAgreedToImportDisclaimer: boolean;
    public UpdatedAt: Date;
    public Protected: boolean;
    public PhoneNumber: string;
    public StatusCode: number;
    public LastLogin: Date;
    public PermissionHandling: string;
    public UpdatedBy: string;
    public IsAutobankAdmin: boolean;
    public CreatedAt: Date;
    public DisplayName: string;
    public Email: string;
    public ID: number;
    public GlobalIdentity: string;
    public BankIntegrationUserName: string;
    public TwoFactorEnabled: boolean;
    public EndDate: Date;
    public _createguid: string;
    public AuthPhoneNumber: string;
    public License: UserLicenseInformation;
    public CustomFields: any;
}


export class UserLicenseInformation extends UniEntity {
    public Comment: string;
    public UserLicenseEndDate: Date;
    public UserLicenseKey: string;
    public Name: string;
    public GlobalIdentity: string;
    public CustomerInfo: CustomerInfo;
    public CustomerAgreement: CustomerLicenseAgreementInfo;
    public UserType: UserLicenseType;
    public Company: CompanyLicenseInfomation;
    public ContractType: ContractLicenseType;
    public UserLicenseAgreement: LicenseAgreementInfo;
}


export class CustomerInfo extends UniEntity {
    public IsRoamingUser: boolean;
    public HasExternalAccountant: boolean;
    public CustomerType: number;
}


export class CustomerLicenseAgreementInfo extends UniEntity {
    public HasAgreedToLicense: boolean;
    public AgreementId: number;
    public CanAgreeToLicense: boolean;
}


export class UserLicenseType extends UniEntity {
    public EndDate: Date;
    public TypeName: string;
    public TypeID: number;
}


export class CompanyLicenseInfomation extends UniEntity {
    public EndDate: Date;
    public ContactEmail: string;
    public ContractID: number;
    public ContactPerson: string;
    public StatusCode: LicenseEntityStatus;
    public Key: string;
    public Name: string;
    public ID: number;
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
    public HasAgreedToLicense: boolean;
    public AgreementId: number;
}


export class CreateBankUserDTO extends UniEntity {
    public AdminUserId: number;
    public AdminPassword: string;
    public Phone: string;
    public Password: string;
    public IsAdmin: boolean;
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
    public MaxFreeAmount: number;
    public GrantSum: number;
}


export class AuthenticationChallengeBE extends UniEntity {
    public Status: ChallengeRequestResult;
    public ValidTo: Date;
    public ValidFrom: Date;
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
    public ToPeriod: Maaned;
    public IncludeInfoPerPerson: boolean;
    public FromPeriod: Maaned;
    public ReportType: ReportType;
    public IncludeIncome: boolean;
    public IncludeEmployments: boolean;
    public Year: number;
}


export class A07Response extends UniEntity {
    public Text: string;
    public mainStatus: string;
    public DataType: string;
    public Data: string;
    public Title: string;
    public DataName: string;
}


export class SelfEmployed extends UniEntity {
    public year: number;
    public items: Array<SelfEmployedItem>;
}


export class SelfEmployedItem extends UniEntity {
    public supplierID: number;
    public amount: number;
    public number: string;
    public name: string;
}


export class SetIntegrationDataDto extends UniEntity {
    public IntegrationKey: string;
    public ExternalId: string;
}


export class CurrencyRateData extends UniEntity {
    public RateDate: LocalDate;
    public ExchangeRate: number;
    public ExchangeRateOld: number;
    public IsOverrideRate: boolean;
    public RateDateOld: LocalDate;
    public Factor: number;
    public FromCurrencyCode: CurrencyCode;
}


export class EmailDTO extends UniEntity {
    public Format: string;
    public FromAddress: string;
    public CopyAddress: string;
    public Message: string;
    public Subject: string;
    public ReportID: number;
    public Parameters: Array<ReportParameter>;
}


export class ReportParameter extends UniEntity {
    public Value: string;
    public Name: string;
}


export class DistributionPlanElementValidation extends UniEntity {
    public ElementType: DistributionPlanElementTypes;
    public Priority: number;
    public ElementTypeName: string;
    public IsValid: boolean;
    public PlanElement: DistributionPlanElement;
}


export class SendEmail extends UniEntity {
    public EntityID: number;
    public FromAddress: string;
    public CopyAddress: string;
    public Message: string;
    public EntityType: string;
    public ExternalReference: string;
    public Subject: string;
    public ReportID: number;
    public Localization: string;
    public ReportName: string;
    public Attachments: Array<SendEmailAttachment>;
    public Parameters: Array<ReportParameter>;
}


export class SendEmailAttachment extends UniEntity {
    public Attachment: string;
    public FileName: string;
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
    public Description: string;
    public Category: string;
    public Guid: string;
    public Link: string;
    public Title: string;
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
    public ReportBalance: number;
    public TotalBalance: number;
    public MinutesWorked: number;
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
    public contactname: string;
    public contactemail: string;
    public orgno: string;
    public contactphone: string;
    public orgname: string;
}


export class ServiceMetadataDto extends UniEntity {
    public ServiceName: string;
    public SupportEmail: string;
}


export class AccountUsageReference extends UniEntity {
    public EntityID: number;
    public Entity: string;
    public Info: string;
}


export class MandatoryDimensionAccountReport extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'MandatoryDimensionAccountReport';

    public Deleted: boolean;
    public CreatedBy: string;
    public MissingRequiredDimensionsMessage: string;
    public AccountNumber: string;
    public UpdatedAt: Date;
    public MissingOnlyWarningsDimensionsMessage: string;
    public DimensionsID: number;
    public AccountID: number;
    public StatusCode: number;
    public UpdatedBy: string;
    public CreatedAt: Date;
    public ID: number;
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
    public LastDepreciation: LocalDate;
    public CurrentValue: number;
    public BalanceAccountNumber: number;
    public GroupCode: string;
    public DepreciationAccountNumber: number;
    public GroupName: string;
    public BalanceAccountName: string;
    public Number: number;
    public Lifetime: number;
    public Name: string;
    public Lines: Array<AssetReportLineDTO>;
}


export class AssetReportLineDTO extends UniEntity {
    public Type: string;
    public Date: LocalDate;
    public TypeID: number;
    public Value: number;
}


export class AssetDto extends UniEntity {
    public PurchaseDate: LocalDate;
    public IncomingFinancialValue: number;
    public Name: string;
    public ID: number;
}


export class BankBalanceDto extends UniEntity {
    public BalanceAvailable: number;
    public Date: Date;
    public AccountNumber: string;
    public MainAccountName: string;
    public BalanceBooked: number;
    public Comment: string;
    public IsTestData: boolean;
    public IsMainAccountBalance: boolean;
    public AccountName: string;
}


export class BankData extends UniEntity {
    public AccountNumber: string;
    public IBAN: string;
    public Bank: Bank;
}


export class CreateBankIntegrationDTO extends UniEntity {
    public UserName: string;
    public BankAccountID: number;
    public BankAcceptance: boolean;
    public IsOutgoing: boolean;
    public BankApproval: boolean;
    public RequireTwoStage: boolean;
    public ServiceProvider: number;
    public IsInbound: boolean;
    public Phone: string;
    public DisplayName: string;
    public Bank: string;
    public Password: string;
    public Email: string;
    public IsBankStatement: boolean;
    public TuserName: string;
    public IsBankBalance: boolean;
    public BankAccounts: Array<BankAccountDTO>;
}


export class BankAccountDTO extends UniEntity {
    public IBAN: string;
    public IsOutgoing: boolean;
    public IsInbound: boolean;
    public Bic: string;
    public BBAN: string;
    public IsBankStatement: boolean;
    public IsBankBalance: boolean;
}


export class ZdataUpdateBankProperties extends UniEntity {
    public IsOutgoing: boolean;
    public ServiceID: string;
    public IsInbound: boolean;
    public Password: string;
    public IsBankStatement: boolean;
    public IsBankBalance: boolean;
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
    public ServiceID: string;
    public NewServiceID: string;
}


export class BankMatchSuggestion extends UniEntity {
    public JournalEntryLineID: number;
    public BankStatementEntryID: number;
    public Group: string;
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
    public Closed: boolean;
    public ID: number;
}


export class MatchSettings extends UniEntity {
    public MaxDelta: number;
    public MaxDayOffset: number;
}


export class ReconciliationStatus extends UniEntity {
    public TotalUnreconciled: number;
    public FromDate: Date;
    public IsReconciled: boolean;
    public AccountID: number;
    public Todate: Date;
    public TotalAmount: number;
    public NumberOfUnReconciled: number;
    public NumberOfItems: number;
}


export class BalanceDto extends UniEntity {
    public EndDate: Date;
    public BalanceInStatement: number;
    public StartDate: Date;
    public Balance: number;
}


export class BankfileFormat extends UniEntity {
    public FileExtension: string;
    public IsFixed: boolean;
    public Separator: string;
    public SkipRows: number;
    public LinePrefix: string;
    public CustomFormat: BankFileCustomFormat;
    public Name: string;
    public IsXml: boolean;
    public Columns: Array<BankfileColumn>;
}


export class BankfileColumn extends UniEntity {
    public StartPos: number;
    public FieldMapping: BankfileField;
    public DataType: BankfileDataType;
    public Length: number;
    public IsFallBack: boolean;
}


export class JournalSuggestion extends UniEntity {
    public MatchWithEntryID: number;
    public FinancialDate: LocalDate;
    public Description: string;
    public AccountID: number;
    public BankStatementRuleID: number;
    public Amount: number;
    public Account: Account;
}


export class ReportRow extends UniEntity {
    public Period7: number;
    public Period3: number;
    public BudPeriod7: number;
    public SubGroupName: string;
    public AccountNumber: number;
    public BudPeriod3: number;
    public SubGroupNumber: number;
    public BudPeriod12: number;
    public Sum: number;
    public Period2: number;
    public SumPeriodLastYearAccumulated: number;
    public SumLastYear: number;
    public SumPeriodLastYear: number;
    public Period6: number;
    public Period11: number;
    public SumPeriodAccumulated: number;
    public BudPeriod4: number;
    public IsSubTotal: boolean;
    public Period5: number;
    public Period12: number;
    public GroupName: string;
    public BudPeriod6: number;
    public BudPeriod2: number;
    public Period10: number;
    public BudPeriod10: number;
    public Period9: number;
    public BudPeriod11: number;
    public GroupNumber: number;
    public BudgetSum: number;
    public BudPeriod1: number;
    public Period4: number;
    public Period1: number;
    public BudgetAccumulated: number;
    public BudPeriod5: number;
    public AccountName: string;
    public Period8: number;
    public PrecedingBalance: number;
    public ID: number;
    public BudPeriod9: number;
    public SumPeriod: number;
    public AccountYear: number;
    public BudPeriod8: number;
}


export class BudgetImport extends UniEntity {
    public Budget: Budget;
}


export class LiquidityTableDTO extends UniEntity {
    public OverdueSupplierInvoices: number;
    public BankBalance: number;
    public BankBalanceRefferance: BankBalanceType;
    public OverdueCustomerInvoices: number;
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
    public DebitVatTypeID: number;
    public NumberSeriesID: number;
    public DueDate: LocalDate;
    public CustomerOrderID: number;
    public JournalEntryDataAccrualID: number;
    public InvoiceNumber: string;
    public FinancialDate: LocalDate;
    public CustomerInvoiceID: number;
    public NumberSeriesTaskID: number;
    public Description: string;
    public CreditAccountNumber: number;
    public PostPostJournalEntryLineID: number;
    public StatusCode: number;
    public AmountCurrency: number;
    public Amount: number;
    public CurrencyID: number;
    public PaymentID: string;
    public JournalEntryID: number;
    public CreditAccountID: number;
    public JournalEntryNo: string;
    public SupplierInvoiceID: number;
    public DebitAccountNumber: number;
    public VatDate: LocalDate;
    public SupplierInvoiceNo: string;
    public CurrencyExchangeRate: number;
    public VatDeductionPercent: number;
    public DebitAccountID: number;
    public CreditVatTypeID: number;
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
    public PeriodName: string;
    public PeriodSumYear1: number;
}


export class JournalEntryLineRequestSummary extends UniEntity {
    public SumCredit: number;
    public SumTaxBasisAmount: number;
    public SumLedger: number;
    public SumDebit: number;
    public SumBalance: number;
}


export class JournalEntryLinePostPostData extends UniEntity {
    public RestAmountCurrency: number;
    public DueDate: Date;
    public SumPostPostAmount: number;
    public RestAmount: number;
    public InvoiceNumber: string;
    public CurrencyCodeID: number;
    public CurrencyCodeCode: string;
    public PeriodNo: number;
    public FinancialDate: Date;
    public SubAccountNumber: number;
    public Description: string;
    public CurrencyCodeShortCode: string;
    public StatusCode: number;
    public AmountCurrency: number;
    public Amount: number;
    public PaymentID: string;
    public JournalEntryID: number;
    public CurrencyExchangeRate: number;
    public JournalEntryTypeName: string;
    public JournalEntryNumberNumeric: number;
    public ID: number;
    public SumPostPostAmountCurrency: number;
    public NumberOfPayments: number;
    public MarkedAgainstJournalEntryNumber: string;
    public JournalEntryNumber: string;
    public AccountYear: number;
    public MarkedAgainstJournalEntryLineID: number;
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
    public InvoiceNumber: string;
    public OriginalRestAmount: number;
    public FinancialDate: Date;
    public StatusCode: StatusCodeJournalEntryLine;
    public AmountCurrency: number;
    public Amount: number;
    public OriginalStatusCode: StatusCodeJournalEntryLine;
    public ID: number;
    public JournalEntryNumber: string;
    public Markings: Array<MarkingReference>;
}


export class MarkingReference extends UniEntity {
    public ID: number;
    public JournalEntryNumber: string;
}


export class SupplierInvoiceDetail extends UniEntity {
    public AccountNumber: number;
    public VatPercent: number;
    public InvoiceNumber: string;
    public SupplierID: number;
    public VatTypeID: number;
    public Description: string;
    public InvoiceDate: Date;
    public AccountID: number;
    public AmountCurrency: number;
    public DeliveryDate: Date;
    public Amount: number;
    public VatTypeName: string;
    public SupplierInvoiceID: number;
    public AccountName: string;
    public VatCode: string;
}


export class VatReportMessage extends UniEntity {
    public Message: string;
    public Level: ValidationLevel;
}


export class VatReportSummary extends UniEntity {
    public SumVatAmount: number;
    public VatCodeGroupID: number;
    public HasTaxBasis: boolean;
    public SumTaxBasisAmount: number;
    public VatCodeGroupName: string;
    public VatCodeGroupNo: string;
    public NumberOfJournalEntryLines: number;
    public IsHistoricData: boolean;
    public HasTaxAmount: boolean;
}


export class VatReportSummaryPerPost extends UniEntity {
    public SumVatAmount: number;
    public VatCodeGroupID: number;
    public VatPostName: string;
    public VatPostID: number;
    public HasTaxBasis: boolean;
    public SumTaxBasisAmount: number;
    public VatCodeGroupName: string;
    public VatPostNo: string;
    public VatPostReportAsNegativeAmount: boolean;
    public VatCodeGroupNo: string;
    public NumberOfJournalEntryLines: number;
    public IsHistoricData: boolean;
    public HasTaxAmount: boolean;
}


export class VatReportSummaryPerPostPerAccount extends UniEntity {
    public SumVatAmount: number;
    public VatCodeGroupID: number;
    public VatJournalEntryPostAccountID: number;
    public VatJournalEntryPostAccountNumber: number;
    public VatPostName: string;
    public VatAccountNumber: number;
    public VatAccountID: number;
    public VatPostID: number;
    public FinancialDate: Date;
    public Description: string;
    public HasTaxBasis: boolean;
    public TaxBasisAmount: number;
    public SumTaxBasisAmount: number;
    public VatCodeGroupName: string;
    public VatAccountName: string;
    public VatPostNo: string;
    public Amount: number;
    public VatPostReportAsNegativeAmount: boolean;
    public StdVatCode: string;
    public VatDate: Date;
    public VatCodeGroupNo: string;
    public NumberOfJournalEntryLines: number;
    public IsHistoricData: boolean;
    public VatJournalEntryPostAccountName: string;
    public VatCode: string;
    public HasTaxAmount: boolean;
    public JournalEntryNumber: string;
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
    public Status: AltinnGetVatReportDataFromAltinnStatus;
    public Message: string;
}


export class AnnualSettlementDisposalDisplayItem extends UniEntity {
    public Item: string;
    public Amount: number;
}


export class AnnualSettlementAccountIBAndUBDisplayItem extends UniEntity {
    public AccountNumber: string;
    public IB: number;
    public Year: number;
    public UB: number;
    public AccountName: string;
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


export enum SpecialAgaRule{
    Regular = 0,
    AgaRefund = 1,
    AgaPension = 2,
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
    Unknown = 0,
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
    Deleted = 49004,
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
