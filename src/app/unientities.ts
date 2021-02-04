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
    public Action: string;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Verb: string;
    public EntityType: string;
    public Deleted: boolean;
    public Transaction: string;
    public NewValue: string;
    public ClientID: string;
    public EntityID: number;
    public Route: string;
    public OldValue: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class WorkBalance extends UniEntity {
    public static RelativeUrl = 'workbalances';
    public static EntityType = 'WorkBalance';

    public ValidFrom: Date;
    public ID: number;
    public ValidTimeOff: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Minutes: number;
    public Description: string;
    public IsStartBalance: boolean;
    public StatusCode: number;
    public ExpectedMinutes: number;
    public Days: number;
    public Balancetype: WorkBalanceTypeEnum;
    public Deleted: boolean;
    public BalanceDate: Date;
    public WorkRelationID: number;
    public ActualMinutes: number;
    public UpdatedAt: Date;
    public BalanceFrom: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Worker extends UniEntity {
    public static RelativeUrl = 'workers';
    public static EntityType = 'Worker';

    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public StatusCode: number;
    public EmployeeID: number;
    public Deleted: boolean;
    public UserID: number;
    public BusinessRelationID: number;
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

    public CustomerID: number;
    public EndTime: Date;
    public PriceExVat: number;
    public TransferedToPayroll: boolean;
    public WorkTypeID: number;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Minutes: number;
    public DimensionsID: number;
    public Description: string;
    public StatusCode: number;
    public StartTime: Date;
    public Deleted: boolean;
    public PayrollTrackingID: number;
    public Invoiceable: boolean;
    public LunchInMinutes: number;
    public TransferedToOrder: boolean;
    public WorkRelationID: number;
    public Label: string;
    public Date: Date;
    public OrderItemId: number;
    public WorkItemGroupID: number;
    public UpdatedAt: Date;
    public CustomerOrderID: number;
    public MinutesToOrder: number;
    public UpdatedBy: string;
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
    public CreatedBy: string;
    public CreatedAt: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public WorkRelationID: number;
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

    public LunchIncluded: boolean;
    public MinutesPerYear: number;
    public ID: number;
    public MinutesPerWeek: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public StatusCode: number;
    public IsShared: boolean;
    public Deleted: boolean;
    public MinutesPerMonth: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class WorkRelation extends UniEntity {
    public static RelativeUrl = 'workrelations';
    public static EntityType = 'WorkRelation';

    public EndTime: Date;
    public IsActive: boolean;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public StartDate: Date;
    public Description: string;
    public StatusCode: number;
    public Deleted: boolean;
    public WorkerID: number;
    public CompanyName: string;
    public WorkProfileID: number;
    public IsPrivate: boolean;
    public UpdatedAt: Date;
    public CompanyID: number;
    public WorkPercentage: number;
    public TeamID: number;
    public UpdatedBy: string;
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
    public FromDate: Date;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Description: string;
    public StatusCode: number;
    public RegionKey: string;
    public Deleted: boolean;
    public SystemKey: string;
    public IsHalfDay: boolean;
    public TimeoffType: number;
    public WorkRelationID: number;
    public ToDate: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class WorkType extends UniEntity {
    public static RelativeUrl = 'worktypes';
    public static EntityType = 'WorkType';

    public ID: number;
    public CreatedBy: string;
    public Price: number;
    public CreatedAt: Date;
    public Description: string;
    public StatusCode: number;
    public Deleted: boolean;
    public ProductID: number;
    public WagetypeNumber: number;
    public SystemType: WorkTypeEnum;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public Product: Product;
    public CustomFields: any;
}


export class BankFile extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'BankFile';

    public ID: number;
    public SubCompanyID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public Accountnumber: string;
    public FileID: number;
    public UpdatedAt: Date;
    public ParentFileid: number;
    public UpdatedBy: string;
    public _createguid: string;
    public File: File;
    public SubCompany: SubCompany;
    public CustomFields: any;
}


export class BatchInvoice extends UniEntity {
    public static RelativeUrl = 'batchinvoices';
    public static EntityType = 'BatchInvoice';

    public Comment: string;
    public Operation: BatchInvoiceOperation;
    public ID: number;
    public CreatedBy: string;
    public NotifyEmail: boolean;
    public CreatedAt: Date;
    public FreeTxt: string;
    public StatusCode: number;
    public DueDate: LocalDate;
    public NumberOfBatches: number;
    public TotalToProcess: number;
    public Deleted: boolean;
    public YourRef: string;
    public Processed: number;
    public InvoiceDate: LocalDate;
    public OurRef: string;
    public MinAmount: number;
    public SellerID: number;
    public UpdatedAt: Date;
    public CopyFromEntityId: number;
    public UpdatedBy: string;
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
    public CustomerID: number;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public StatusCode: StatusCode;
    public CommentID: number;
    public BatchInvoiceID: number;
    public Deleted: boolean;
    public BatchNumber: number;
    public UpdatedAt: Date;
    public CustomerOrderID: number;
    public UpdatedBy: string;
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
    public CreatedBy: string;
    public EntityName: string;
    public CreatedAt: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public Template: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Customer extends UniEntity {
    public static RelativeUrl = 'customers';
    public static EntityType = 'Customer';

    public DefaultCustomerQuoteReportID: number;
    public CustomerNumber: number;
    public PeppolAddress: string;
    public DefaultDistributionsID: number;
    public SubAccountNumberSeriesID: number;
    public AcceptableDelta4CustomerPayment: number;
    public DefaultSellerID: number;
    public CustomerNumberKidAlias: string;
    public ID: number;
    public PaymentTermsID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public AcceptableDelta4CustomerPaymentAccountID: number;
    public ReminderEmailAddress: string;
    public DeliveryTermsID: number;
    public DimensionsID: number;
    public EfakturaIdentifier: string;
    public StatusCode: number;
    public CreditDays: number;
    public CurrencyCodeID: number;
    public FactoringNumber: number;
    public Deleted: boolean;
    public DefaultCustomerOrderReportID: number;
    public Localization: string;
    public SocialSecurityNumber: string;
    public DefaultCustomerInvoiceReportID: number;
    public AvtaleGiro: boolean;
    public WebUrl: string;
    public AvtaleGiroNotification: boolean;
    public DontSendReminders: boolean;
    public OrgNumber: string;
    public GLN: string;
    public BusinessRelationID: number;
    public IsPrivate: boolean;
    public UpdatedAt: Date;
    public EInvoiceAgreementReference: string;
    public UpdatedBy: string;
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

    public Comment: string;
    public Requisition: string;
    public InvoiceAddressLine3: string;
    public CustomerID: number;
    public DistributionPlanID: number;
    public PayableRoundingCurrencyAmount: number;
    public SupplierOrgNumber: string;
    public SalesPerson: string;
    public CollectorStatusCode: number;
    public DefaultSellerID: number;
    public ShippingCity: string;
    public InvoiceType: number;
    public ShippingAddressLine1: string;
    public ShippingCountryCode: string;
    public ID: number;
    public ShippingAddressLine2: string;
    public DeliveryTerm: string;
    public TaxExclusiveAmountCurrency: number;
    public RestAmount: number;
    public PaymentTermsID: number;
    public UseReportID: number;
    public ShippingCountry: string;
    public CurrencyExchangeRate: number;
    public ShippingAddressLine3: string;
    public InvoiceReferenceID: number;
    public InvoiceCountry: string;
    public CreatedBy: string;
    public ExternalDebtCollectionNotes: string;
    public RestAmountCurrency: number;
    public AccrualID: number;
    public VatTotalsAmount: number;
    public TaxExclusiveAmount: number;
    public CreatedAt: Date;
    public InvoiceCity: string;
    public InvoiceCountryCode: string;
    public DeliveryTermsID: number;
    public CreditedAmountCurrency: number;
    public FreeTxt: string;
    public YourReference: string;
    public StatusCode: number;
    public CreditDays: number;
    public DeliveryDate: LocalDate;
    public CurrencyCodeID: number;
    public PaymentInformation: string;
    public InvoiceNumber: string;
    public InvoiceNumberSeriesID: number;
    public BankAccountID: number;
    public PaymentInfoTypeID: number;
    public InternalNote: string;
    public DeliveryMethod: string;
    public InvoiceAddressLine1: string;
    public TaxInclusiveAmountCurrency: number;
    public PayableRoundingAmount: number;
    public Deleted: boolean;
    public CreditedAmount: number;
    public AmountRegards: string;
    public LastPaymentDate: LocalDate;
    public ExternalStatus: number;
    public OurReference: string;
    public ExternalReference: string;
    public ShippingPostalCode: string;
    public CustomerPerson: string;
    public VatTotalsAmountCurrency: number;
    public ExternalDebtCollectionReference: string;
    public InvoicePostalCode: string;
    public EmailAddress: string;
    public PaymentTerm: string;
    public PrintStatus: number;
    public InvoiceDate: LocalDate;
    public UpdateCurrencyAmountsOnDateChange: boolean;
    public DeliveryName: string;
    public DefaultDimensionsID: number;
    public PaymentDueDate: LocalDate;
    public Payment: string;
    public CustomerName: string;
    public JournalEntryID: number;
    public PaymentID: string;
    public DontSendReminders: boolean;
    public TaxInclusiveAmount: number;
    public InvoiceAddressLine2: string;
    public InvoiceReceiverName: string;
    public UpdatedAt: Date;
    public CustomerOrgNumber: string;
    public UpdatedBy: string;
    public Credited: boolean;
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

    public SumTotalExVat: number;
    public Comment: string;
    public CustomerInvoiceID: number;
    public SumTotalIncVatCurrency: number;
    public SumTotalIncVat: number;
    public ItemText: string;
    public VatTypeID: number;
    public NumberOfItems: number;
    public PriceExVat: number;
    public ID: number;
    public CurrencyExchangeRate: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public DiscountPercent: number;
    public Unit: string;
    public DimensionsID: number;
    public PriceIncVat: number;
    public StatusCode: number;
    public CurrencyCodeID: number;
    public DiscountCurrency: number;
    public CostPrice: number;
    public Deleted: boolean;
    public PriceSetByUser: boolean;
    public ProductID: number;
    public InvoicePeriodStartDate: LocalDate;
    public ItemSourceID: number;
    public VatPercent: number;
    public AccountID: number;
    public InvoicePeriodEndDate: LocalDate;
    public CalculateGrossPriceBasedOnNetPrice: boolean;
    public SortIndex: number;
    public AccountingCost: string;
    public SumTotalExVatCurrency: number;
    public UpdatedAt: Date;
    public SumVatCurrency: number;
    public SumVat: number;
    public PriceExVatCurrency: number;
    public UpdatedBy: string;
    public Discount: number;
    public VatDate: LocalDate;
    public _createguid: string;
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

    public InterestFee: number;
    public CustomerInvoiceID: number;
    public ReminderFee: number;
    public RemindedDate: LocalDate;
    public DebtCollectionFee: number;
    public ID: number;
    public Title: string;
    public RestAmount: number;
    public CurrencyExchangeRate: number;
    public CreatedBy: string;
    public CreatedByReminderRuleID: number;
    public RestAmountCurrency: number;
    public CreatedAt: Date;
    public DimensionsID: number;
    public Description: string;
    public StatusCode: number;
    public DueDate: LocalDate;
    public CurrencyCodeID: number;
    public Notified: boolean;
    public Deleted: boolean;
    public DebtCollectionFeeCurrency: number;
    public EmailAddress: string;
    public RunNumber: number;
    public ReminderNumber: number;
    public ReminderFeeCurrency: number;
    public InterestFeeCurrency: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
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

    public ReminderFee: number;
    public MinimumDaysFromDueDate: number;
    public ID: number;
    public Title: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Description: string;
    public StatusCode: number;
    public CreditDays: number;
    public Deleted: boolean;
    public ReminderNumber: number;
    public UseMaximumLegalReminderFee: boolean;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CustomerInvoiceReminderSettingsID: number;
    public _createguid: string;
    public CustomerInvoiceReminderSettings: CustomerInvoiceReminderSettings;
    public CustomFields: any;
}


export class CustomerInvoiceReminderSettings extends UniEntity {
    public static RelativeUrl = 'invoiceremindersettings';
    public static EntityType = 'CustomerInvoiceReminderSettings';

    public MinimumAmountToRemind: number;
    public UseReminderRuleTextsInEmails: boolean;
    public AcceptPaymentWithoutReminderFee: boolean;
    public ID: number;
    public CreatedBy: string;
    public DebtCollectionSettingsID: number;
    public CreatedAt: Date;
    public StatusCode: number;
    public RemindersBeforeDebtCollection: number;
    public RuleSetType: number;
    public Deleted: boolean;
    public DefaultReminderFeeAccountID: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public DebtCollectionSettings: DebtCollectionSettings;
    public DefaultReminderFeeAccount: Account;
    public CustomerInvoiceReminderRules: Array<CustomerInvoiceReminderRule>;
    public CustomFields: any;
}


export class CustomerOrder extends UniEntity {
    public static RelativeUrl = 'orders';
    public static EntityType = 'CustomerOrder';

    public Comment: string;
    public Requisition: string;
    public InvoiceAddressLine3: string;
    public CustomerID: number;
    public DistributionPlanID: number;
    public PayableRoundingCurrencyAmount: number;
    public SupplierOrgNumber: string;
    public SalesPerson: string;
    public DefaultSellerID: number;
    public ShippingCity: string;
    public ShippingAddressLine1: string;
    public ShippingCountryCode: string;
    public ID: number;
    public ShippingAddressLine2: string;
    public DeliveryTerm: string;
    public TaxExclusiveAmountCurrency: number;
    public OrderNumberSeriesID: number;
    public PaymentTermsID: number;
    public UseReportID: number;
    public ShippingCountry: string;
    public CurrencyExchangeRate: number;
    public ShippingAddressLine3: string;
    public OrderNumber: number;
    public InvoiceCountry: string;
    public CreatedBy: string;
    public RestAmountCurrency: number;
    public AccrualID: number;
    public VatTotalsAmount: number;
    public TaxExclusiveAmount: number;
    public CreatedAt: Date;
    public InvoiceCity: string;
    public InvoiceCountryCode: string;
    public DeliveryTermsID: number;
    public FreeTxt: string;
    public YourReference: string;
    public StatusCode: number;
    public CreditDays: number;
    public DeliveryDate: LocalDate;
    public CurrencyCodeID: number;
    public PaymentInfoTypeID: number;
    public InternalNote: string;
    public DeliveryMethod: string;
    public InvoiceAddressLine1: string;
    public TaxInclusiveAmountCurrency: number;
    public PayableRoundingAmount: number;
    public Deleted: boolean;
    public ReadyToInvoice: boolean;
    public RestExclusiveAmountCurrency: number;
    public OurReference: string;
    public ShippingPostalCode: string;
    public CustomerPerson: string;
    public VatTotalsAmountCurrency: number;
    public InvoicePostalCode: string;
    public OrderDate: LocalDate;
    public EmailAddress: string;
    public PaymentTerm: string;
    public PrintStatus: number;
    public UpdateCurrencyAmountsOnDateChange: boolean;
    public DeliveryName: string;
    public DefaultDimensionsID: number;
    public UpdateCurrencyOnToInvoice: boolean;
    public CustomerName: string;
    public TaxInclusiveAmount: number;
    public InvoiceAddressLine2: string;
    public InvoiceReceiverName: string;
    public UpdatedAt: Date;
    public CustomerOrgNumber: string;
    public UpdatedBy: string;
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

    public SumTotalExVat: number;
    public Comment: string;
    public SumTotalIncVatCurrency: number;
    public SumTotalIncVat: number;
    public ItemText: string;
    public VatTypeID: number;
    public NumberOfItems: number;
    public PriceExVat: number;
    public ID: number;
    public CurrencyExchangeRate: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public DiscountPercent: number;
    public Unit: string;
    public DimensionsID: number;
    public PriceIncVat: number;
    public StatusCode: number;
    public CurrencyCodeID: number;
    public DiscountCurrency: number;
    public CostPrice: number;
    public Deleted: boolean;
    public PriceSetByUser: boolean;
    public ProductID: number;
    public ReadyToInvoice: boolean;
    public ItemSourceID: number;
    public VatPercent: number;
    public AccountID: number;
    public CalculateGrossPriceBasedOnNetPrice: boolean;
    public SortIndex: number;
    public SumTotalExVatCurrency: number;
    public UpdatedAt: Date;
    public CustomerOrderID: number;
    public SumVatCurrency: number;
    public SumVat: number;
    public PriceExVatCurrency: number;
    public UpdatedBy: string;
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

    public Comment: string;
    public Requisition: string;
    public InvoiceAddressLine3: string;
    public CustomerID: number;
    public DistributionPlanID: number;
    public PayableRoundingCurrencyAmount: number;
    public SupplierOrgNumber: string;
    public SalesPerson: string;
    public DefaultSellerID: number;
    public ShippingCity: string;
    public QuoteNumber: number;
    public ShippingAddressLine1: string;
    public ShippingCountryCode: string;
    public ID: number;
    public ShippingAddressLine2: string;
    public DeliveryTerm: string;
    public TaxExclusiveAmountCurrency: number;
    public PaymentTermsID: number;
    public UseReportID: number;
    public ShippingCountry: string;
    public CurrencyExchangeRate: number;
    public ShippingAddressLine3: string;
    public InvoiceCountry: string;
    public CreatedBy: string;
    public VatTotalsAmount: number;
    public TaxExclusiveAmount: number;
    public CreatedAt: Date;
    public InvoiceCity: string;
    public InvoiceCountryCode: string;
    public DeliveryTermsID: number;
    public FreeTxt: string;
    public YourReference: string;
    public StatusCode: number;
    public QuoteNumberSeriesID: number;
    public CreditDays: number;
    public DeliveryDate: LocalDate;
    public CurrencyCodeID: number;
    public ValidUntilDate: LocalDate;
    public PaymentInfoTypeID: number;
    public InternalNote: string;
    public DeliveryMethod: string;
    public InvoiceAddressLine1: string;
    public TaxInclusiveAmountCurrency: number;
    public QuoteDate: LocalDate;
    public PayableRoundingAmount: number;
    public Deleted: boolean;
    public OurReference: string;
    public ShippingPostalCode: string;
    public CustomerPerson: string;
    public VatTotalsAmountCurrency: number;
    public InquiryReference: number;
    public InvoicePostalCode: string;
    public EmailAddress: string;
    public PaymentTerm: string;
    public PrintStatus: number;
    public UpdateCurrencyAmountsOnDateChange: boolean;
    public DeliveryName: string;
    public DefaultDimensionsID: number;
    public UpdateCurrencyOnToInvoice: boolean;
    public CustomerName: string;
    public UpdateCurrencyOnToOrder: boolean;
    public TaxInclusiveAmount: number;
    public InvoiceAddressLine2: string;
    public InvoiceReceiverName: string;
    public UpdatedAt: Date;
    public CustomerOrgNumber: string;
    public UpdatedBy: string;
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

    public SumTotalExVat: number;
    public Comment: string;
    public SumTotalIncVatCurrency: number;
    public SumTotalIncVat: number;
    public ItemText: string;
    public VatTypeID: number;
    public NumberOfItems: number;
    public PriceExVat: number;
    public ID: number;
    public CurrencyExchangeRate: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public DiscountPercent: number;
    public Unit: string;
    public DimensionsID: number;
    public PriceIncVat: number;
    public StatusCode: number;
    public CurrencyCodeID: number;
    public DiscountCurrency: number;
    public CostPrice: number;
    public Deleted: boolean;
    public PriceSetByUser: boolean;
    public ProductID: number;
    public VatPercent: number;
    public AccountID: number;
    public CalculateGrossPriceBasedOnNetPrice: boolean;
    public SortIndex: number;
    public SumTotalExVatCurrency: number;
    public UpdatedAt: Date;
    public SumVatCurrency: number;
    public SumVat: number;
    public CustomerQuoteID: number;
    public PriceExVatCurrency: number;
    public UpdatedBy: string;
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

    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public StatusCode: number;
    public DebtCollectionAutomationID: number;
    public Deleted: boolean;
    public IntegrateWithDebtCollection: boolean;
    public DebtCollectionFormat: number;
    public CreditorNumber: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CustomerInvoiceReminderSettingsID: number;
    public _createguid: string;
    public DebtCollectionAutomation: Array<DebtCollectionAutomation>;
    public CustomerInvoiceReminderSettings: CustomerInvoiceReminderSettings;
    public CustomFields: any;
}


export class ItemSource extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ItemSource';

    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public Details: Array<ItemSourceDetail>;
    public CustomFields: any;
}


export class ItemSourceDetail extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ItemSourceDetail';

    public Tag: string;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Description: string;
    public StatusCode: number;
    public Deleted: boolean;
    public SourceType: string;
    public ItemSourceID: number;
    public Amount: number;
    public SourceFK: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class PaymentInfoType extends UniEntity {
    public static RelativeUrl = 'paymentinfotype';
    public static EntityType = 'PaymentInfoType';

    public Length: number;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Type: PaymentInfoTypeEnum;
    public StatusCode: number;
    public Deleted: boolean;
    public Locked: boolean;
    public Control: Modulus;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public PaymentInfoTypeParts: Array<PaymentInfoTypePart>;
    public CustomFields: any;
}


export class PaymentInfoTypePart extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'PaymentInfoTypePart';

    public Length: number;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public StatusCode: number;
    public PaymentInfoTypeID: number;
    public Deleted: boolean;
    public Part: string;
    public SortIndex: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class RecurringInvoice extends UniEntity {
    public static RelativeUrl = 'recurringinvoices';
    public static EntityType = 'RecurringInvoice';

    public Comment: string;
    public Requisition: string;
    public InvoiceAddressLine3: string;
    public CustomerID: number;
    public DistributionPlanID: number;
    public PayableRoundingCurrencyAmount: number;
    public SupplierOrgNumber: string;
    public SalesPerson: string;
    public DefaultSellerID: number;
    public ShippingCity: string;
    public ShippingAddressLine1: string;
    public ShippingCountryCode: string;
    public ID: number;
    public ShippingAddressLine2: string;
    public DeliveryTerm: string;
    public TaxExclusiveAmountCurrency: number;
    public PaymentTermsID: number;
    public UseReportID: number;
    public ShippingCountry: string;
    public CurrencyExchangeRate: number;
    public ShippingAddressLine3: string;
    public InvoiceCountry: string;
    public NextInvoiceDate: LocalDate;
    public CreatedBy: string;
    public VatTotalsAmount: number;
    public TaxExclusiveAmount: number;
    public CreatedAt: Date;
    public InvoiceCity: string;
    public InvoiceCountryCode: string;
    public StartDate: LocalDate;
    public DeliveryTermsID: number;
    public FreeTxt: string;
    public YourReference: string;
    public StatusCode: number;
    public CreditDays: number;
    public DeliveryDate: LocalDate;
    public CurrencyCodeID: number;
    public PaymentInformation: string;
    public InvoiceNumberSeriesID: number;
    public MaxIterations: number;
    public PaymentInfoTypeID: number;
    public InternalNote: string;
    public DeliveryMethod: string;
    public InvoiceAddressLine1: string;
    public ProduceAs: RecurringResult;
    public TaxInclusiveAmountCurrency: number;
    public PayableRoundingAmount: number;
    public Deleted: boolean;
    public AmountRegards: string;
    public OurReference: string;
    public NotifyWhenOrdersArePrepared: boolean;
    public ShippingPostalCode: string;
    public CustomerPerson: string;
    public VatTotalsAmountCurrency: number;
    public InvoicePostalCode: string;
    public EmailAddress: string;
    public PaymentTerm: string;
    public PrintStatus: number;
    public EndDate: LocalDate;
    public UpdateCurrencyAmountsOnDateChange: boolean;
    public DeliveryName: string;
    public Interval: number;
    public DefaultDimensionsID: number;
    public Payment: string;
    public CustomerName: string;
    public TaxInclusiveAmount: number;
    public InvoiceAddressLine2: string;
    public InvoiceReceiverName: string;
    public PreparationDays: number;
    public UpdatedAt: Date;
    public TimePeriod: RecurringPeriod;
    public NotifyWhenRecurringEnds: boolean;
    public CustomerOrgNumber: string;
    public NotifyUser: string;
    public UpdatedBy: string;
    public NoCreditDays: boolean;
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

    public SumTotalExVat: number;
    public Comment: string;
    public SumTotalIncVatCurrency: number;
    public SumTotalIncVat: number;
    public ItemText: string;
    public VatTypeID: number;
    public ReduceIncompletePeriod: boolean;
    public TimeFactor: RecurringPeriod;
    public PricingSource: PricingSource;
    public NumberOfItems: number;
    public PriceExVat: number;
    public ID: number;
    public CurrencyExchangeRate: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public DiscountPercent: number;
    public Unit: string;
    public DimensionsID: number;
    public PriceIncVat: number;
    public StatusCode: number;
    public CurrencyCodeID: number;
    public DiscountCurrency: number;
    public Deleted: boolean;
    public PriceSetByUser: boolean;
    public ProductID: number;
    public RecurringInvoiceID: number;
    public VatPercent: number;
    public AccountID: number;
    public CalculateGrossPriceBasedOnNetPrice: boolean;
    public SortIndex: number;
    public SumTotalExVatCurrency: number;
    public UpdatedAt: Date;
    public SumVatCurrency: number;
    public SumVat: number;
    public PriceExVatCurrency: number;
    public UpdatedBy: string;
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

    public Comment: string;
    public CreationDate: LocalDate;
    public OrderID: number;
    public NotifiedOrdersPrepared: boolean;
    public ID: number;
    public IterationNumber: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public NotifiedRecurringEnds: boolean;
    public InvoiceDate: LocalDate;
    public RecurringInvoiceID: number;
    public InvoiceID: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Seller extends UniEntity {
    public static RelativeUrl = 'sellers';
    public static EntityType = 'Seller';

    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public StatusCode: number;
    public EmployeeID: number;
    public Deleted: boolean;
    public UserID: number;
    public DefaultDimensionsID: number;
    public UpdatedAt: Date;
    public TeamID: number;
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
    public CustomerID: number;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public Amount: number;
    public RecurringInvoiceID: number;
    public SellerID: number;
    public UpdatedAt: Date;
    public CustomerOrderID: number;
    public CustomerQuoteID: number;
    public Percent: number;
    public UpdatedBy: string;
    public _createguid: string;
    public Seller: Seller;
    public CustomFields: any;
}


export class SubCompany extends UniEntity {
    public static RelativeUrl = 'subcompanies';
    public static EntityType = 'SubCompany';

    public CustomerID: number;
    public ID: number;
    public CompanyType: CompanyRelation;
    public CreatedBy: string;
    public CreatedAt: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public CompanyKey: string;
    public CompanyName: string;
    public UpdatedAt: Date;
    public CompanyID: number;
    public UpdatedBy: string;
    public _createguid: string;
    public Customer: Customer;
    public CustomFields: any;
}


export class Supplier extends UniEntity {
    public static RelativeUrl = 'suppliers';
    public static EntityType = 'Supplier';

    public PeppolAddress: string;
    public SubAccountNumberSeriesID: number;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public SelfEmployed: boolean;
    public DimensionsID: number;
    public StatusCode: number;
    public CreditDays: number;
    public CurrencyCodeID: number;
    public Deleted: boolean;
    public Localization: string;
    public SupplierNumber: number;
    public CostAllocationID: number;
    public WebUrl: string;
    public OrgNumber: string;
    public GLN: string;
    public BusinessRelationID: number;
    public UpdatedAt: Date;
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

    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Description: string;
    public StatusCode: number;
    public CreditDays: number;
    public Deleted: boolean;
    public TermsType: TermsType;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class TOFCurrencySettings extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'TOFCurrencySettings';

    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public StatusCode: number;
    public UpdateCurrencyAmountsOnOrderdateChange: boolean;
    public UpdateCurrencyAmountsOnQuoteToInvoice: boolean;
    public Deleted: boolean;
    public UpdateCurrencyAmountsOnQuotedateChange: boolean;
    public UpdateCurrencyAmountsOnInvoicedateChange: boolean;
    public UpdateCurrencyAmountsOnOrderToInvoice: boolean;
    public UpdateCurrencyAmountsOnQuoteToOrder: boolean;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Address extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Address';

    public ID: number;
    public City: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public CountryCode: string;
    public AddressLine2: string;
    public StatusCode: number;
    public Deleted: boolean;
    public AddressLine3: string;
    public PostalCode: string;
    public Region: string;
    public Country: string;
    public AddressLine1: string;
    public BusinessRelationID: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public BusinessRelation: BusinessRelation;
    public CustomFields: any;
}


export class BusinessRelation extends UniEntity {
    public static RelativeUrl = 'business-relations';
    public static EntityType = 'BusinessRelation';

    public DefaultEmailID: number;
    public ID: number;
    public CreatedBy: string;
    public ShippingAddressID: number;
    public CreatedAt: Date;
    public StatusCode: number;
    public DefaultPhoneID: number;
    public Deleted: boolean;
    public DefaultContactID: number;
    public InvoiceAddressID: number;
    public DefaultBankAccountID: number;
    public UpdatedAt: Date;
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

    public Comment: string;
    public ParentBusinessRelationID: number;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public StatusCode: number;
    public Role: string;
    public Deleted: boolean;
    public InfoID: number;
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

    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Description: string;
    public Type: string;
    public StatusCode: number;
    public Deleted: boolean;
    public EmailAddress: string;
    public BusinessRelationID: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Phone extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Phone';

    public Number: string;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public CountryCode: string;
    public Description: string;
    public Type: PhoneTypeEnum;
    public StatusCode: number;
    public Deleted: boolean;
    public BusinessRelationID: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class AGACalculation extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AGACalculation';

    public PayrollRunID: number;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public DimensionsID: number;
    public StatusCode: number;
    public Deleted: boolean;
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

    public AGACalculationID: number;
    public ID: number;
    public CreatedBy: string;
    public freeAmount: number;
    public CreatedAt: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public SubEntityID: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public subEntity: SubEntity;
    public CustomFields: any;
}


export class AGATax extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AGATax';

    public AGARateID: number;
    public AGACalculationID: number;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public beregningsKode: number;
    public StatusCode: number;
    public Deleted: boolean;
    public SubEntityID: number;
    public zone: number;
    public agaRate: number;
    public UpdatedAt: Date;
    public agaBase: number;
    public UpdatedBy: string;
    public zoneName: string;
    public municipalityName: string;
    public _createguid: string;
    public subEntity: SubEntity;
    public CustomFields: any;
}


export class AGAPension extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AGAPension';

    public AGARateID: number;
    public AGACalculationID: number;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public beregningsKode: number;
    public StatusCode: number;
    public Deleted: boolean;
    public SubEntityID: number;
    public zone: number;
    public agaRate: number;
    public UpdatedAt: Date;
    public agaBase: number;
    public UpdatedBy: string;
    public zoneName: string;
    public municipalityName: string;
    public _createguid: string;
    public subEntity: SubEntity;
    public CustomFields: any;
}


export class AGADraw extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AGADraw';

    public AGARateID: number;
    public AGACalculationID: number;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public beregningsKode: number;
    public StatusCode: number;
    public Deleted: boolean;
    public SubEntityID: number;
    public zone: number;
    public agaRate: number;
    public UpdatedAt: Date;
    public agaBase: number;
    public UpdatedBy: string;
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
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public SubEntityID: number;
    public agaRate: number;
    public UpdatedAt: Date;
    public agaBase: number;
    public UpdatedBy: string;
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
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public SubEntityID: number;
    public agaRate: number;
    public UpdatedAt: Date;
    public agaBase: number;
    public UpdatedBy: string;
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
    public ID: number;
    public persons: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public SubEntityID: number;
    public aga: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
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
    public CreatedBy: string;
    public CreatedAt: Date;
    public StatusCode: number;
    public GarnishmentTax: number;
    public Deleted: boolean;
    public WithholdingTax: number;
    public UpdatedAt: Date;
    public FinancialTax: number;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class AmeldingData extends UniEntity {
    public static RelativeUrl = 'amelding';
    public static EntityType = 'AmeldingData';

    public mainFileID: number;
    public OppgaveHash: string;
    public receiptID: number;
    public PayrollRunID: number;
    public year: number;
    public sent: Date;
    public ID: number;
    public period: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public type: AmeldingType;
    public StatusCode: number;
    public created: Date;
    public attachmentFileID: number;
    public Deleted: boolean;
    public feedbackFileID: number;
    public messageID: string;
    public replacesID: number;
    public initiated: Date;
    public status: number;
    public altinnStatus: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public xmlValidationErrors: string;
    public replaceThis: string;
    public log: Array<AmeldingLog>;
    public CustomFields: any;
}


export class AmeldingLog extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AmeldingLog';

    public registry: SalaryRegistry;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public AmeldingsID: number;
    public StatusCode: number;
    public key: number;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class BasicAmount extends UniEntity {
    public static RelativeUrl = 'basicamounts';
    public static EntityType = 'BasicAmount';

    public ID: number;
    public FromDate: Date;
    public CreatedBy: string;
    public BasicAmountPrYear: number;
    public CreatedAt: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public ConversionFactor: number;
    public UpdatedAt: Date;
    public AveragePrYear: number;
    public BasicAmountPrMonth: number;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class CompanySalary extends UniEntity {
    public static RelativeUrl = 'companysalary';
    public static EntityType = 'CompanySalary';

    public HourFTEs: number;
    public Base_TaxFreeOrganization: boolean;
    public Base_NettoPayment: boolean;
    public Base_JanMayenAndBiCountries: boolean;
    public WagetypeAdvancePayment: number;
    public MainAccountCostVacation: number;
    public PostToTaxDraw: boolean;
    public AllowOver6G: boolean;
    public ID: number;
    public PostGarnishmentToTaxAccount: boolean;
    public CalculateFinancialTax: boolean;
    public CreatedBy: string;
    public FreeAmount: number;
    public MainAccountCostAGA: number;
    public CreatedAt: Date;
    public HoursPerMonth: number;
    public PaymentInterval: CompanySalaryPaymentInterval;
    public MainAccountAllocatedVacation: number;
    public StatusCode: number;
    public MainAccountAllocatedFinancialVacation: number;
    public PaycheckZipReportID: number;
    public Deleted: boolean;
    public RateFinancialTax: number;
    public OtpExportActive: boolean;
    public MainAccountAllocatedFinancial: number;
    public MainAccountAllocatedAGAVacation: number;
    public Base_Svalbard: boolean;
    public MainAccountCostFinancialVacation: number;
    public MainAccountCostFinancial: number;
    public WagetypeAdvancePaymentAuto: number;
    public MainAccountCostAGAVacation: number;
    public WageDeductionDueToHoliday: WageDeductionDueToHolidayType;
    public Base_NettoPaymentForMaritim: boolean;
    public InterrimRemitAccount: number;
    public Base_SpesialDeductionForMaritim: boolean;
    public UpdatedAt: Date;
    public AnnualStatementZipReportID: number;
    public UpdatedBy: string;
    public MainAccountAllocatedAGA: number;
    public Base_PayAsYouEarnTaxOnPensions: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class CompanyVacationRate extends UniEntity {
    public static RelativeUrl = 'companyvacationrates';
    public static EntityType = 'CompanyVacationRate';

    public ID: number;
    public FromDate: Date;
    public CreatedBy: string;
    public CreatedAt: Date;
    public StatusCode: number;
    public Rate: number;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public Rate60: number;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class EmployeeCategory extends UniEntity {
    public static RelativeUrl = 'employeecategories';
    public static EntityType = 'EmployeeCategory';

    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public EmployeeCategoryLinkID: number;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class EmployeeCategoryLink extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'EmployeeCategoryLink';

    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public EmployeeNumber: number;
    public StatusCode: number;
    public EmployeeID: number;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public EmployeeCategoryID: number;
    public _createguid: string;
    public EmployeeCategory: EmployeeCategory;
    public Employee: Employee;
    public CustomFields: any;
}


export class Employee extends UniEntity {
    public static RelativeUrl = 'employees';
    public static EntityType = 'Employee';

    public InternasjonalIDType: InternationalIDType;
    public Sex: GenderEnum;
    public BirthDate: Date;
    public OtpStatus: OtpStatus;
    public MunicipalityNo: string;
    public EmploymentDateOtp: LocalDate;
    public ID: number;
    public TypeOfPaymentOtp: TypeOfPaymentOtp;
    public IncludeOtpUntilMonth: number;
    public InternationalID: string;
    public OtpExport: boolean;
    public CreatedBy: string;
    public CreatedAt: Date;
    public EmployeeNumber: number;
    public PaymentInterval: PaymentInterval;
    public StatusCode: number;
    public Deleted: boolean;
    public UserID: number;
    public Active: boolean;
    public ForeignWorker: ForeignWorker;
    public SubEntityID: number;
    public EndDateOtp: LocalDate;
    public SocialSecurityNumber: string;
    public InternasjonalIDCountry: string;
    public AdvancePaymentAmount: number;
    public IncludeOtpUntilYear: number;
    public PhotoID: number;
    public EmployeeLanguageID: number;
    public FreeText: string;
    public BusinessRelationID: number;
    public EmploymentDate: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
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

    public Tilleggsopplysning: string;
    public loennKunTrygdeavgiftTilUtenlandskBorgerSomGrensegjengerID: number;
    public Year: number;
    public ResultatStatus: string;
    public NonTaxableAmount: number;
    public ID: number;
    public loennFraHovedarbeidsgiverID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public EmployeeNumber: number;
    public ufoereYtelserAndreID: number;
    public StatusCode: number;
    public loennKunTrygdeavgiftTilUtenlandskBorgerID: number;
    public Table: string;
    public TaxcardId: number;
    public EmployeeID: number;
    public Deleted: boolean;
    public NotMainEmployer: boolean;
    public SecondaryTable: string;
    public loennTilUtenrikstjenestemannID: number;
    public loennFraBiarbeidsgiverID: number;
    public SKDXml: string;
    public SecondaryPercent: number;
    public IssueDate: Date;
    public UpdatedAt: Date;
    public Percent: number;
    public UpdatedBy: string;
    public pensjonID: number;
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

    public NonTaxableAmount: number;
    public tabellType: TabellType;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public freeAmountType: FreeAmountType;
    public AntallMaanederForTrekk: number;
    public Table: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public Percent: number;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class EmployeeLeave extends UniEntity {
    public static RelativeUrl = 'EmployeeLeave';
    public static EntityType = 'EmployeeLeave';

    public EmploymentID: number;
    public ID: number;
    public AffectsOtp: boolean;
    public FromDate: Date;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Description: string;
    public LeavePercent: number;
    public StatusCode: number;
    public LeaveType: Leavetype;
    public Deleted: boolean;
    public ToDate: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public Employment: Employment;
    public CustomFields: any;
}


export class Employment extends UniEntity {
    public static RelativeUrl = 'employments';
    public static EntityType = 'Employment';

    public SeniorityDate: Date;
    public RemunerationType: RemunerationType;
    public MonthRate: number;
    public EmploymentType: EmploymentType;
    public ID: number;
    public CreatedBy: string;
    public EndDateReason: EndDateReason;
    public CreatedAt: Date;
    public EmployeeNumber: number;
    public StartDate: Date;
    public DimensionsID: number;
    public StatusCode: number;
    public ShipReg: ShipRegistry;
    public LedgerAccount: string;
    public EmployeeID: number;
    public Deleted: boolean;
    public SubEntityID: number;
    public UserDefinedRate: number;
    public PayGrade: string;
    public EndDate: Date;
    public WorkingHoursScheme: WorkingHoursScheme;
    public JobCode: string;
    public RegulativeGroupID: number;
    public LastSalaryChangeDate: Date;
    public Standard: boolean;
    public LastWorkPercentChangeDate: Date;
    public JobName: string;
    public TradeArea: ShipTradeArea;
    public TypeOfEmployment: TypeOfEmployment;
    public UpdatedAt: Date;
    public RegulativeStepNr: number;
    public HourRate: number;
    public HoursPerWeek: number;
    public ShipType: ShipTypeOfShip;
    public WorkPercent: number;
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

    public AffectsAGA: boolean;
    public ID: number;
    public FromDate: Date;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Description: string;
    public StatusCode: number;
    public Deleted: boolean;
    public SubentityID: number;
    public Amount: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class IncomeReportData extends UniEntity {
    public static RelativeUrl = 'income-reports';
    public static EntityType = 'IncomeReportData';

    public EmploymentID: number;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Type: string;
    public StatusCode: number;
    public Deleted: boolean;
    public Xml: string;
    public MonthlyRefund: number;
    public AltinnReceiptID: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public AltinnReceipt: AltinnReceipt;
    public Employment: Employment;
    public CustomFields: any;
}


export class OtpExportWagetype extends UniEntity {
    public static RelativeUrl = 'otpexportwagetypes';
    public static EntityType = 'OtpExportWagetype';

    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public WageTypeNumber: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class PayrollRun extends UniEntity {
    public static RelativeUrl = 'payrollrun';
    public static EntityType = 'PayrollRun';

    public PayDate: Date;
    public ID: number;
    public PaycheckFileID: number;
    public FromDate: Date;
    public HolidayPayDeduction: boolean;
    public CreatedBy: string;
    public ExcludeRecurringPosts: boolean;
    public CreatedAt: Date;
    public Description: string;
    public StatusCode: number;
    public Deleted: boolean;
    public AGAonRun: number;
    public SettlementDate: Date;
    public needsRecalc: boolean;
    public ToDate: Date;
    public taxdrawfactor: TaxDrawFactor;
    public AGAFreeAmount: number;
    public FreeText: string;
    public JournalEntryNumber: string;
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

    public PayrollRunID: number;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public EmployeeCategoryID: number;
    public _createguid: string;
    public EmployeeCategory: EmployeeCategory;
    public PayrollRun: PayrollRun;
    public CustomFields: any;
}


export class PostingSummaryDraft extends UniEntity {
    public draftWithDims: string;
    public ID: number;
    public draftWithDimsOnBalance: string;
    public draftBasic: string;
    public JobInfoID: number;
    public PayrollID: number;
    public status: SummaryJobStatus;
    public statusTime: Date;
}


export class Regulative extends UniEntity {
    public static RelativeUrl = 'regulatives';
    public static EntityType = 'Regulative';

    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public StartDate: LocalDate;
    public StatusCode: number;
    public Deleted: boolean;
    public RegulativeGroupID: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public Steps: Array<RegulativeStep>;
    public CustomFields: any;
}


export class RegulativeGroup extends UniEntity {
    public static RelativeUrl = 'regulativegroups';
    public static EntityType = 'RegulativeGroup';

    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public Regulatives: Array<Regulative>;
    public CustomFields: any;
}


export class RegulativeStep extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'RegulativeStep';

    public ID: number;
    public CreatedBy: string;
    public Step: number;
    public CreatedAt: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public Amount: number;
    public RegulativeID: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class SalaryBalance extends UniEntity {
    public static RelativeUrl = 'salarybalances';
    public static EntityType = 'SalaryBalance';

    public KID: string;
    public EmploymentID: number;
    public ID: number;
    public InstalmentPercent: number;
    public FromDate: Date;
    public CreatedBy: string;
    public SupplierID: number;
    public CreatedAt: Date;
    public MaxAmount: number;
    public Type: SalBalDrawType;
    public StatusCode: number;
    public InstalmentType: SalBalType;
    public EmployeeID: number;
    public Deleted: boolean;
    public Source: SalBalSource;
    public Instalment: number;
    public WageTypeNumber: number;
    public ToDate: Date;
    public CreatePayment: boolean;
    public MinAmount: number;
    public SalaryBalanceTemplateID: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Name: string;
    public Balance: number;
    public CalculatedBalance: number;
    public _createguid: string;
    public Amount: number;
    public Employment: Employment;
    public Transactions: Array<SalaryBalanceLine>;
    public Employee: Employee;
    public Supplier: Supplier;
    public CustomFields: any;
}


export class SalaryBalanceLine extends UniEntity {
    public static RelativeUrl = 'salarybalancelines';
    public static EntityType = 'SalaryBalanceLine';

    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Description: string;
    public StatusCode: number;
    public SalaryBalanceID: number;
    public Deleted: boolean;
    public Amount: number;
    public Date: LocalDate;
    public SalaryTransactionID: number;
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
    public ID: number;
    public InstalmentPercent: number;
    public CreatedBy: string;
    public SupplierID: number;
    public CreatedAt: Date;
    public MaxAmount: number;
    public Account: number;
    public StatusCode: number;
    public InstalmentType: SalBalType;
    public Deleted: boolean;
    public SalarytransactionDescription: string;
    public Instalment: number;
    public WageTypeNumber: number;
    public CreatePayment: boolean;
    public MinAmount: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public Supplier: Supplier;
    public SalaryBalances: Array<SalaryBalance>;
    public CustomFields: any;
}


export class SalaryTransaction extends UniEntity {
    public static RelativeUrl = 'salarytrans';
    public static EntityType = 'SalaryTransaction';

    public TaxbasisID: number;
    public PayrollRunID: number;
    public WageTypeID: number;
    public MunicipalityNo: string;
    public VatTypeID: number;
    public EmploymentID: number;
    public calcAGA: number;
    public ID: number;
    public FromDate: Date;
    public HolidayPayDeduction: boolean;
    public CreatedBy: string;
    public CreatedAt: Date;
    public EmployeeNumber: number;
    public DimensionsID: number;
    public Account: number;
    public StatusCode: number;
    public IsRecurringPost: boolean;
    public SalaryBalanceID: number;
    public Rate: number;
    public recurringPostValidFrom: Date;
    public EmployeeID: number;
    public Deleted: boolean;
    public ChildSalaryTransactionID: number;
    public Sum: number;
    public Amount: number;
    public WageTypeNumber: number;
    public RecurringID: number;
    public ToDate: Date;
    public recurringPostValidTo: Date;
    public SystemType: StdSystemType;
    public SalaryTransactionCarInfoID: number;
    public Text: string;
    public UpdatedAt: Date;
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
    public CarInfo: SalaryTransactionCarInfo;
    public CustomFields: any;
}


export class SalaryTransactionCarInfo extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'SalaryTransactionCarInfo';

    public IsElectric: boolean;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public IsLongRange: boolean;
    public RegistrationYear: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class SalaryTransactionSupplement extends UniEntity {
    public static RelativeUrl = 'supplements';
    public static EntityType = 'SalaryTransactionSupplement';

    public ID: number;
    public ValueBool: boolean;
    public CreatedBy: string;
    public CreatedAt: Date;
    public ValueString: string;
    public StatusCode: number;
    public Deleted: boolean;
    public ValueMoney: number;
    public ValueDate2: Date;
    public SalaryTransactionID: number;
    public WageTypeSupplementID: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public ValueDate: Date;
    public _createguid: string;
    public WageTypeSupplement: WageTypeSupplement;
    public CustomFields: any;
}


export class SalaryYear extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'SalaryYear';

    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public CurrentYear: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class SubEntity extends UniEntity {
    public static RelativeUrl = 'subentities';
    public static EntityType = 'SubEntity';

    public MunicipalityNo: string;
    public ID: number;
    public CreatedBy: string;
    public freeAmount: number;
    public CreatedAt: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public AgaRule: number;
    public AgaZone: number;
    public SuperiorOrganizationID: number;
    public OrgNumber: string;
    public BusinessRelationID: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public BusinessRelationInfo: BusinessRelation;
    public SuperiorOrganization: SubEntity;
    public CustomFields: any;
}


export class TaxBasis extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'TaxBasis';

    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public StatusCode: number;
    public DisabilityOtherBasis: number;
    public Deleted: boolean;
    public PensionSourcetaxBasis: number;
    public SvalbardBasis: number;
    public SalaryTransactionID: number;
    public PensionBasis: number;
    public SailorBasis: number;
    public Basis: number;
    public JanMayenBasis: number;
    public UpdatedAt: Date;
    public ForeignCitizenInsuranceBasis: number;
    public ForeignBorderCommuterBasis: number;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Travel extends UniEntity {
    public static RelativeUrl = 'travels';
    public static EntityType = 'Travel';

    public Comment: string;
    public TravelIdentificator: string;
    public ID: number;
    public CreatedBy: string;
    public SupplierID: number;
    public CreatedAt: Date;
    public EmployeeNumber: number;
    public State: state;
    public DimensionsID: number;
    public Description: string;
    public StatusCode: number;
    public Email: string;
    public Deleted: boolean;
    public Phone: string;
    public SourceSystem: string;
    public PersonID: string;
    public Purpose: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public AdvanceAmount: number;
    public TravelLines: Array<TravelLine>;
    public Dimensions: Dimensions;
    public CustomFields: any;
}


export class TravelLine extends UniEntity {
    public static RelativeUrl = 'travellines';
    public static EntityType = 'TravelLine';

    public paytransID: number;
    public VatTypeID: number;
    public TravelIdentificator: string;
    public ID: number;
    public TypeID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public DimensionsID: number;
    public Description: string;
    public StatusCode: number;
    public Rate: number;
    public Deleted: boolean;
    public From: Date;
    public InvoiceAccount: number;
    public LineState: linestate;
    public CostType: costtype;
    public Amount: number;
    public TravelID: number;
    public AccountNumber: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public To: Date;
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
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Description: string;
    public StatusCode: number;
    public Deleted: boolean;
    public InvoiceAccount: number;
    public ForeignTypeID: string;
    public WageTypeNumber: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class VacationPayLine extends UniEntity {
    public static RelativeUrl = 'VacationPayLines';
    public static EntityType = 'VacationPayLine';

    public Year: number;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public StatusCode: number;
    public EmployeeID: number;
    public Deleted: boolean;
    public ManualVacationPayBase: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public VacationPay60: number;
    public SystemVacationPayBase: number;
    public Withdrawal: number;
    public Rate: number;
    public PaidVacationPay: number;
    public _createguid: string;
    public VacationPay: number;
    public PaidTaxFreeVacationPay: number;
    public Age: number;
    public MissingEarlierVacationPay: number;
    public Rate60: number;
    public Employee: Employee;
    public CustomFields: any;
}


export class VacationRateEmployee extends UniEntity {
    public static RelativeUrl = 'employeevacationrates';
    public static EntityType = 'VacationRateEmployee';

    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public StartDate: Date;
    public StatusCode: number;
    public Rate: number;
    public EmployeeID: number;
    public Deleted: boolean;
    public EndDate: Date;
    public UpdatedAt: Date;
    public Rate60: number;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class WageType extends UniEntity {
    public static RelativeUrl = 'wagetypes';
    public static EntityType = 'WageType';

    public IncomeType: string;
    public Limit_value: number;
    public SpecialAgaRule: SpecialAgaRule;
    public FixedSalaryHolidayDeduction: boolean;
    public RatetypeColumn: RateTypeColumn;
    public Limit_WageTypeNumber: number;
    public ID: number;
    public Base_EmploymentTax: boolean;
    public Base_div2: boolean;
    public CreatedBy: string;
    public CreatedAt: Date;
    public HideFromPaycheck: boolean;
    public Description: string;
    public SpecialTaxAndContributionsRule: SpecialTaxAndContributionsRule;
    public SpecialTaxHandling: string;
    public AccountNumber_balance: number;
    public StatusCode: number;
    public Base_div3: boolean;
    public ValidYear: number;
    public Base_Payment: boolean;
    public Benefit: string;
    public Rate: number;
    public Deleted: boolean;
    public GetRateFrom: GetRateFrom;
    public SupplementPackage: string;
    public Limit_newRate: number;
    public RateFactor: number;
    public WageTypeNumber: number;
    public DaysOnBoard: boolean;
    public StandardWageTypeFor: StdWageType;
    public Limit_type: LimitType;
    public Postnr: string;
    public Systemtype: string;
    public NoNumberOfHours: boolean;
    public taxtype: TaxType;
    public Base_Vacation: boolean;
    public SystemRequiredWageType: number;
    public AccountNumber: number;
    public UpdatedAt: Date;
    public WageTypeName: string;
    public UpdatedBy: string;
    public _createguid: string;
    public SupplementaryInformations: Array<WageTypeSupplement>;
    public CustomFields: any;
}


export class WageTypeSupplement extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'WageTypeSupplement';

    public WageTypeID: number;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Description: string;
    public StatusCode: number;
    public ameldingType: string;
    public GetValueFromTrans: boolean;
    public Deleted: boolean;
    public SuggestedValue: string;
    public ValueType: Valuetype;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class WageTypeTranslation extends UniEntity {
    public static RelativeUrl = 'wagetypetranslations';
    public static EntityType = 'WageTypeTranslation';

    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public WageTypeNumber: number;
    public EmployeeLanguageID: number;
    public UpdatedAt: Date;
    public WageTypeName: string;
    public UpdatedBy: string;
    public _createguid: string;
    public EmployeeLanguage: EmployeeLanguage;
    public CustomFields: any;
}


export class PensionScheme extends UniEntity {
    public static RelativeUrl = 'pensionschemes';
    public static EntityType = 'PensionScheme';

    public Year: number;
    public ID: number;
    public Period: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public Identificator: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class PensionSchemeSupplier extends UniEntity {
    public static RelativeUrl = 'pensionschemesuppliers';
    public static EntityType = 'PensionSchemeSupplier';

    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public Identificator: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class StandardPensionSchemeSupplier extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'StandardPensionSchemeSupplier';

    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public Identificator: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class EmployeeLanguage extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'EmployeeLanguage';

    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public LanguageCode: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class ComponentLayout extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ComponentLayout';

    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public BaseEntity: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public Fields: Array<FieldLayout>;
    public CustomFields: any;
}


export class FieldLayout extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'FieldLayout';

    public LookupField: boolean;
    public ReadOnly: boolean;
    public FieldType: FieldType;
    public Section: number;
    public ID: number;
    public Property: string;
    public CreatedBy: string;
    public LineBreak: boolean;
    public CreatedAt: Date;
    public Description: string;
    public Legend: string;
    public StatusCode: number;
    public HelpText: string;
    public Width: string;
    public EntityType: string;
    public DisplayField: string;
    public Deleted: boolean;
    public Hidden: boolean;
    public Alignment: Alignment;
    public Placeholder: string;
    public Sectionheader: string;
    public Placement: number;
    public ComponentLayoutID: number;
    public Label: string;
    public FieldSet: number;
    public Combo: number;
    public Options: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class CurrencyOverride extends UniEntity {
    public static RelativeUrl = 'currencyoverrides';
    public static EntityType = 'CurrencyOverride';

    public ExchangeRate: number;
    public ID: number;
    public Factor: number;
    public FromDate: LocalDate;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public Source: CurrencySourceEnum;
    public ToCurrencyCodeID: number;
    public ToDate: LocalDate;
    public FromCurrencyCodeID: number;
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

    public AssetGroupCode: string;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public FromAccountNumber: number;
    public ToAccountNumber: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class AccountGroupSetup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AccountGroupSetup';

    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public ParentID: number;
    public ExternalReference: string;
    public PlanType: PlanTypeEnum;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public Parent: AccountGroupSetup;
    public CustomFields: any;
}


export class AccountSetup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AccountSetup';

    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public VatCode: string;
    public Deleted: boolean;
    public ExpectedDebitBalance: boolean;
    public AccountGroupSetupID: number;
    public AccountName: string;
    public SaftMappingAccountID: number;
    public AccountNumber: number;
    public PlanType: PlanTypeEnum;
    public UpdatedAt: Date;
    public Visible: boolean;
    public UpdatedBy: string;
    public _createguid: string;
    public AccountGroup: AccountGroupSetup;
    public SaftMappingAccount: SaftMappingAccount;
    public CustomFields: any;
}


export class AccountVisibilityGroup extends UniEntity {
    public static RelativeUrl = 'accountvisibilitygroups';
    public static EntityType = 'AccountVisibilityGroup';

    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public UpdatedAt: Date;
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

    public AccountSetupID: number;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public AccountVisibilityGroupID: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class AGARate extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AGARate';

    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Rate: number;
    public Deleted: boolean;
    public ZoneID: number;
    public RateValidFrom: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public sector: Array<AGASector>;
    public CustomFields: any;
}


export class AGASector extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AGASector';

    public ValidFrom: Date;
    public ID: number;
    public CreatedBy: string;
    public freeAmount: number;
    public CreatedAt: Date;
    public Rate: number;
    public SectorID: number;
    public Deleted: boolean;
    public RateID: number;
    public Sector: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class AGAZone extends UniEntity {
    public static RelativeUrl = 'AGAZones';
    public static EntityType = 'AGAZone';

    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public ZoneName: string;
    public Deleted: boolean;
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

    public ValidFrom: Date;
    public AppliesTo: number;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public Template: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class AssetGroup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AssetGroup';

    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public DepreciationRate: number;
    public Code: string;
    public DepreciationYears: number;
    public ToDate: Date;
    public UpdatedAt: Date;
    public DepreciationAccountNumber: number;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class BankIdentifierCode extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'BankIdentifierCode';

    public Bic: string;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public BankIdentifier: string;
    public UpdatedAt: Date;
    public BankName: string;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class CompanyType extends UniEntity {
    public static RelativeUrl = 'companytypes';
    public static EntityType = 'CompanyType';

    public DefaultPlanType: PlanTypeEnum;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Description: string;
    public DefaultAccountVisibilityGroupID: number;
    public Deleted: boolean;
    public Priority: boolean;
    public FullName: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Confirmation extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Confirmation';

    public SignUpReferrer: string;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public StatusCode: number;
    public Email: string;
    public Deleted: boolean;
    public PostalCode: string;
    public Phone: string;
    public Code: string;
    public ExpirationDate: Date;
    public ContractType: string;
    public CompanyName: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public DisplayName: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Country extends UniEntity {
    public static RelativeUrl = 'countries';
    public static EntityType = 'Country';

    public CurrencyRateSource: string;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public CountryCode: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public DefaultCurrencyCode: string;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Currency extends UniEntity {
    public static RelativeUrl = 'currencies';
    public static EntityType = 'Currency';

    public ExchangeRate: number;
    public ID: number;
    public Factor: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public Source: CurrencySourceEnum;
    public ToCurrencyCodeID: number;
    public FromCurrencyCodeID: number;
    public CurrencyDate: LocalDate;
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

    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Description: string;
    public Deleted: boolean;
    public Code: string;
    public ShortCode: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class DebtCollectionAutomation extends UniEntity {
    public static RelativeUrl = 'debtcollectionautomation';
    public static EntityType = 'DebtCollectionAutomation';

    public ID: number;
    public CreatedBy: string;
    public DebtCollectionSettingsID: number;
    public CreatedAt: Date;
    public Description: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public DebtCollectionSettings: DebtCollectionSettings;
    public CustomFields: any;
}


export class EmploymentValidValues extends UniEntity {
    public static RelativeUrl = 'employmentvalidvalues';
    public static EntityType = 'EmploymentValidValues';

    public SeniorityDate: boolean;
    public RemunerationType: boolean;
    public MonthRate: boolean;
    public ID: number;
    public CreatedBy: string;
    public PaymentType: RemunerationType;
    public CreatedAt: Date;
    public employment: TypeOfEmployment;
    public StartDate: boolean;
    public ShipReg: boolean;
    public LastWorkPercentChange: boolean;
    public Deleted: boolean;
    public UserDefinedRate: boolean;
    public EndDate: boolean;
    public WorkingHoursScheme: boolean;
    public JobCode: boolean;
    public LastSalaryChangeDate: boolean;
    public JobName: boolean;
    public TradeArea: boolean;
    public typeOfEmployment: boolean;
    public UpdatedAt: Date;
    public HourRate: boolean;
    public HoursPerWeek: boolean;
    public ShipType: boolean;
    public WorkPercent: boolean;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class FinancialDeadline extends UniEntity {
    public static RelativeUrl = 'deadlines';
    public static EntityType = 'FinancialDeadline';

    public PassableDueDate: number;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Type: FinancialDeadlineType;
    public StatusCode: number;
    public AdditionalInfo: string;
    public Deleted: boolean;
    public Deadline: LocalDate;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class JobTicket extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'JobTicket';

    public JobId: string;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public GlobalIdentity: string;
    public JobStatus: string;
    public Deleted: boolean;
    public JobName: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class LanguageCode extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'LanguageCode';

    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public Code: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Municipal extends UniEntity {
    public static RelativeUrl = 'Municipals';
    public static EntityType = 'Municipal';

    public MunicipalityNo: string;
    public Retired: boolean;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public CountyName: string;
    public Deleted: boolean;
    public MunicipalityName: string;
    public CountyNo: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class MunicipalAGAZone extends UniEntity {
    public static RelativeUrl = 'MunicipalAGAZones';
    public static EntityType = 'MunicipalAGAZone';

    public MunicipalityNo: string;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Startdate: Date;
    public Deleted: boolean;
    public ZoneID: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class PaymentBatchType extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'PaymentBatchType';

    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Description: string;
    public Deleted: boolean;
    public Code: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class PaymentCode extends UniEntity {
    public static RelativeUrl = 'paymentCodes';
    public static EntityType = 'PaymentCode';

    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Description: string;
    public Deleted: boolean;
    public Code: number;
    public PaymentGroup: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class PostalCode extends UniEntity {
    public static RelativeUrl = 'postalcodes';
    public static EntityType = 'PostalCode';

    public ID: number;
    public City: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public Code: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class SaftMappingAccount extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'SaftMappingAccount';

    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Description: string;
    public Deleted: boolean;
    public AccountID: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class StaticRegister extends UniEntity {
    public static RelativeUrl = 'StaticRegister';
    public static EntityType = 'StaticRegister';

    public Registry: string;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public stamp: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class STYRKCode extends UniEntity {
    public static RelativeUrl = 'STYRK';
    public static EntityType = 'STYRKCode';

    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public tittel: string;
    public Deleted: boolean;
    public ynr: number;
    public lnr: number;
    public styrk: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Language extends UniEntity {
    public static RelativeUrl = 'languages';
    public static EntityType = 'Language';

    public FallBackLanguageID: number;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public Code: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public Translations: Array<Translation>;
    public CustomFields: any;
}


export class Translatable extends UniEntity {
    public static RelativeUrl = 'translatables';
    public static EntityType = 'Translatable';

    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Description: string;
    public Column: string;
    public Deleted: boolean;
    public Static: boolean;
    public Meaning: string;
    public Module: i18nModule;
    public Value: string;
    public Model: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public Translations: Array<Translation>;
    public CustomFields: any;
}


export class Translation extends UniEntity {
    public static RelativeUrl = 'translations';
    public static EntityType = 'Translation';

    public ID: number;
    public CreatedBy: string;
    public LanguageID: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public Value: string;
    public TranslatableID: number;
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

    public ID: number;
    public CreatedBy: string;
    public No: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class VatPostSetup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'VatPostSetup';

    public ReportAsNegativeAmount: boolean;
    public ID: number;
    public CreatedBy: string;
    public No: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public VatCodeGroupSetupNo: string;
    public HasTaxBasis: boolean;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Name: string;
    public HasTaxAmount: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class VatReportForm extends UniEntity {
    public static RelativeUrl = 'vatreportforms';
    public static EntityType = 'VatReportForm';

    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Description: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class VatReportReferenceSetup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'VatReportReferenceSetup';

    public VatPostNo: string;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public VatCode: string;
    public Deleted: boolean;
    public AccountNumber: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class VatTypeSetup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'VatTypeSetup';

    public OutputVat: boolean;
    public VatCodeGroupNo: string;
    public ID: number;
    public ReversedTaxDutyVat: boolean;
    public CreatedBy: string;
    public DefaultVisible: boolean;
    public IsCompensated: boolean;
    public CreatedAt: Date;
    public IsNotVatRegistered: boolean;
    public VatCode: string;
    public OutgoingAccountNumber: number;
    public Deleted: boolean;
    public IncomingAccountNumber: number;
    public DirectJournalEntryOnly: boolean;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public VatTypeSetupPercentages: Array<VatTypeSetupPercentage>;
    public CustomFields: any;
}


export class VatTypeSetupPercentage extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'VatTypeSetupPercentage';

    public ValidFrom: LocalDate;
    public ID: number;
    public CreatedBy: string;
    public VatTypeSetupID: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public VatPercent: number;
    public ValidTo: LocalDate;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class CompanyReport extends UniEntity {
    public static RelativeUrl = 'company-report';
    public static EntityType = 'CompanyReport';

    public ID: number;
    public ReportDefinitionID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public ContractId: number;
    public CompanyKey: string;
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
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Description: string;
    public Version: string;
    public Deleted: boolean;
    public Md5: string;
    public Category: string;
    public TemplateLinkId: string;
    public CategoryLabel: string;
    public ReportSource: string;
    public UpdatedAt: Date;
    public Visible: boolean;
    public UniqueReportID: string;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class ReportDefinitionDataSource extends UniEntity {
    public static RelativeUrl = 'report-definition-data-sources';
    public static EntityType = 'ReportDefinitionDataSource';

    public ID: number;
    public ReportDefinitionId: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public DataSourceUrl: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class ReportDefinitionParameter extends UniEntity {
    public static RelativeUrl = 'report-definition-parameters';
    public static EntityType = 'ReportDefinitionParameter';

    public ID: number;
    public DefaultValue: string;
    public ReportDefinitionId: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Type: string;
    public DefaultValueLookupType: string;
    public Deleted: boolean;
    public DefaultValueList: string;
    public DefaultValueSource: string;
    public Label: string;
    public SortIndex: number;
    public UpdatedAt: Date;
    public Visible: boolean;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class PeriodSeries extends UniEntity {
    public static RelativeUrl = 'period-series';
    public static EntityType = 'PeriodSeries';

    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public Active: boolean;
    public SeriesType: PeriodSeriesType;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class PeriodTemplate extends UniEntity {
    public static RelativeUrl = 'period-templates';
    public static EntityType = 'PeriodTemplate';

    public ID: number;
    public FromDate: LocalDate;
    public CreatedBy: string;
    public No: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public ToDate: LocalDate;
    public PeriodSeriesID: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public PeriodSeries: PeriodSeries;
    public CustomFields: any;
}


export class Model extends UniEntity {
    public static RelativeUrl = 'models';
    public static EntityType = 'Model';

    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Description: string;
    public LabelPlural: string;
    public Admin: boolean;
    public Deleted: boolean;
    public Shared: boolean;
    public Label: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public Fields: Array<Field>;
    public CustomFields: any;
}


export class Field extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Field';

    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Description: string;
    public HelpText: string;
    public Deleted: boolean;
    public ModelID: number;
    public Label: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public Model: Model;
    public CustomFields: any;
}


export class Notification extends UniEntity {
    public static RelativeUrl = 'notifications';
    public static EntityType = 'Notification';

    public RecipientID: string;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public StatusCode: number;
    public EntityType: string;
    public SourceEntityID: number;
    public Deleted: boolean;
    public SourceEntityType: string;
    public SenderDisplayName: string;
    public CompanyKey: string;
    public EntityID: number;
    public CompanyName: string;
    public Message: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class CompanySettings extends UniEntity {
    public static RelativeUrl = 'companysettings';
    public static EntityType = 'CompanySettings';

    public UseNetsIntegration: boolean;
    public DefaultEmailID: number;
    public Factoring: number;
    public InterrimRemitAccountID: number;
    public APIncludeAttachment: boolean;
    public DefaultCustomerQuoteReportID: number;
    public BookCustomerInvoiceOnDeliveryDate: boolean;
    public AgioLossAccountID: number;
    public DefaultDistributionsID: number;
    public UseXtraPaymentOrgXmlTag: boolean;
    public AccountingLockedDate: LocalDate;
    public CustomerAccountID: number;
    public VatLockedDate: LocalDate;
    public AgioGainAccountID: number;
    public DefaultTOFCurrencySettingsID: number;
    public AcceptableDelta4CustomerPayment: number;
    public DefaultAddressID: number;
    public PaymentBankIdentification: string;
    public EnableAdvancedJournalEntry: boolean;
    public ID: number;
    public OrganizationNumber: string;
    public UseAssetRegister: boolean;
    public AccountGroupSetID: number;
    public ShowKIDOnCustomerInvoice: boolean;
    public SaveCustomersFromQuoteAsLead: boolean;
    public AutoJournalPayment: string;
    public TaxMandatoryType: number;
    public AutoDistributeInvoice: boolean;
    public ForceSupplierInvoiceApproval: boolean;
    public CreatedBy: string;
    public APContactID: number;
    public CreatedAt: Date;
    public LogoAlign: number;
    public UsePaymentBankValues: boolean;
    public AcceptableDelta4CustomerPaymentAccountID: number;
    public TwoStageAutobankEnabled: boolean;
    public SettlementVatAccountID: number;
    public AllowAvtalegiroRegularInvoice: boolean;
    public SupplierAccountID: number;
    public XtraPaymentOrgXmlTagValue: string;
    public RoundingType: RoundingType;
    public StatusCode: number;
    public StoreDistributedInvoice: boolean;
    public PeriodSeriesAccountID: number;
    public EnableArchiveSupplierInvoice: boolean;
    public TaxableFromDate: LocalDate;
    public DefaultPhoneID: number;
    public TaxableFromLimit: number;
    public FactoringNumber: number;
    public DefaultCustomerInvoiceReminderReportID: number;
    public WebAddress: string;
    public OfficeMunicipalityNo: string;
    public PeriodSeriesVatID: number;
    public Deleted: boolean;
    public SalaryBankAccountID: number;
    public InterrimPaymentAccountID: number;
    public BatchInvoiceMinAmount: number;
    public DefaultCustomerOrderReportID: number;
    public CustomerCreditDays: number;
    public Localization: string;
    public DefaultSalesAccountID: number;
    public LogoFileID: number;
    public UseFinancialDateToCalculateVatPercent: boolean;
    public OnlyJournalMatchedPayments: boolean;
    public EnableCheckboxesForSupplierInvoiceList: boolean;
    public BankChargeAccountID: number;
    public RoundingNumberOfDecimals: number;
    public DefaultAccrualAccountID: number;
    public UseOcrInterpretation: boolean;
    public IgnorePaymentsWithoutEndToEndID: boolean;
    public HasAutobank: boolean;
    public DefaultCustomerInvoiceReportID: number;
    public ShowNumberOfDecimals: number;
    public VatReportFormID: number;
    public CompanyTypeID: number;
    public HideInActiveCustomers: boolean;
    public AccountVisibilityGroupID: number;
    public EnableSendPaymentBeforeJournaled: boolean;
    public NetsIntegrationActivated: boolean;
    public PaymentBankAgreementNumber: string;
    public APActivated: boolean;
    public CompanyName: string;
    public BaseCurrencyCodeID: number;
    public LogoHideField: number;
    public CompanyBankAccountID: number;
    public TaxMandatory: boolean;
    public CompanyRegistered: boolean;
    public FactoringEmailID: number;
    public EnableApprovalFlow: boolean;
    public TaxBankAccountID: number;
    public SAFTimportAccountID: number;
    public HideInActiveSuppliers: boolean;
    public APGuid: string;
    public GLN: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CustomerInvoiceReminderSettingsID: number;
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
    public CreatedBy: string;
    public CreatedAt: Date;
    public StatusCode: number;
    public EntityType: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public Elements: Array<DistributionPlanElement>;
    public CustomFields: any;
}


export class DistributionPlanElement extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'DistributionPlanElement';

    public DistributionPlanID: number;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public DistributionPlanElementTypeID: number;
    public Priority: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public ElementType: DistributionPlanElementType;
    public CustomFields: any;
}


export class DistributionPlanElementType extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'DistributionPlanElementType';

    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public LegalEntities: Array<DistributionPlanElementTypeLegalEntity>;
    public CustomFields: any;
}


export class DistributionPlanElementTypeLegalEntity extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'DistributionPlanElementTypeLegalEntity';

    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public StatusCode: number;
    public EntityType: string;
    public Deleted: boolean;
    public DistributionPlanElementTypeID: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Distributions extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Distributions';

    public ID: number;
    public AnnualStatementDistributionPlanID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public CustomerInvoiceReminderDistributionPlanID: number;
    public PayCheckDistributionPlanID: number;
    public CustomerOrderDistributionPlanID: number;
    public CustomerInvoiceDistributionPlanID: number;
    public CustomerQuoteDistributionPlanID: number;
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

    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class EmailLog extends UniEntity {
    public static RelativeUrl = 'emails';
    public static EntityType = 'EmailLog';

    public ExternalMessage: string;
    public JobRunID: number;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Type: SharingType;
    public StatusCode: number;
    public EntityType: string;
    public Deleted: boolean;
    public From: string;
    public Subject: string;
    public ExternalReference: string;
    public DistributeAt: LocalDate;
    public EntityID: number;
    public EntityDisplayValue: string;
    public UpdatedAt: Date;
    public JobRunExternalRef: string;
    public UpdatedBy: string;
    public To: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Eventplan extends UniEntity {
    public static RelativeUrl = 'eventplans';
    public static EntityType = 'Eventplan';

    public IsSystemPlan: boolean;
    public ID: number;
    public CreatedBy: string;
    public SigningKey: string;
    public CreatedAt: Date;
    public StatusCode: number;
    public JobNames: string;
    public Deleted: boolean;
    public Active: boolean;
    public ModelFilter: string;
    public OperationFilter: string;
    public Cargo: string;
    public PlanType: EventplanType;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public ExpressionFilters: Array<ExpressionFilter>;
    public Subscribers: Array<EventSubscriber>;
    public CustomFields: any;
}


export class EventSubscriber extends UniEntity {
    public static RelativeUrl = 'eventsubscribers';
    public static EntityType = 'EventSubscriber';

    public ID: number;
    public Authorization: string;
    public CreatedBy: string;
    public Endpoint: string;
    public CreatedAt: Date;
    public EventplanID: number;
    public Headers: string;
    public StatusCode: number;
    public Deleted: boolean;
    public Active: boolean;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public Eventplan: Eventplan;
    public CustomFields: any;
}


export class ExpressionFilter extends UniEntity {
    public static RelativeUrl = 'expressionfilters';
    public static EntityType = 'ExpressionFilter';

    public ID: number;
    public CreatedBy: string;
    public EntityName: string;
    public CreatedAt: Date;
    public EventplanID: number;
    public StatusCode: number;
    public Deleted: boolean;
    public Expression: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public Eventplan: Eventplan;
    public CustomFields: any;
}


export class Period extends UniEntity {
    public static RelativeUrl = 'periodes';
    public static EntityType = 'Period';

    public PeriodTemplateID: number;
    public ID: number;
    public FromDate: LocalDate;
    public CreatedBy: string;
    public No: number;
    public CreatedAt: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public AccountYear: number;
    public ToDate: LocalDate;
    public PeriodSeriesID: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public PeriodTemplate: PeriodTemplate;
    public PeriodSeries: PeriodSeries;
    public CustomFields: any;
}


export class PredefinedDescription extends UniEntity {
    public static RelativeUrl = 'predefineddescriptions';
    public static EntityType = 'PredefinedDescription';

    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Description: string;
    public Type: PredefinedDescriptionType;
    public StatusCode: number;
    public Deleted: boolean;
    public Code: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class ProductCategory extends UniEntity {
    public static RelativeUrl = 'productcategories';
    public static EntityType = 'ProductCategory';

    public Comment: string;
    public Depth: number;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Description: string;
    public StatusCode: number;
    public Lft: number;
    public Deleted: boolean;
    public Rght: number;
    public ParentID: number;
    public Status: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class ProductCategoryLink extends UniEntity {
    public static RelativeUrl = 'productcategorylinks';
    public static EntityType = 'ProductCategoryLink';

    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public ProductID: number;
    public UpdatedAt: Date;
    public ProductCategoryID: number;
    public UpdatedBy: string;
    public _createguid: string;
    public ProductCategory: ProductCategory;
    public CustomFields: any;
}


export class Sharing extends UniEntity {
    public static RelativeUrl = 'sharings';
    public static EntityType = 'Sharing';

    public ExternalMessage: string;
    public JobRunID: number;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Type: SharingType;
    public StatusCode: number;
    public EntityType: string;
    public Deleted: boolean;
    public From: string;
    public Subject: string;
    public ExternalReference: string;
    public DistributeAt: LocalDate;
    public EntityID: number;
    public EntityDisplayValue: string;
    public UpdatedAt: Date;
    public JobRunExternalRef: string;
    public UpdatedBy: string;
    public To: string;
    public _createguid: string;
    public CustomFields: any;
}


export class StatusLog extends UniEntity {
    public static RelativeUrl = 'statuslogs';
    public static EntityType = 'StatusLog';

    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public EntityType: string;
    public Deleted: boolean;
    public EntityID: number;
    public ToStatus: number;
    public FromStatus: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Tracelink extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Tracelink';

    public ID: number;
    public SourceInstanceID: number;
    public DestinationInstanceID: number;
    public CreatedBy: string;
    public SourceEntityName: string;
    public CreatedAt: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public DestinationEntityName: string;
    public Date: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class User extends UniEntity {
    public static RelativeUrl = 'users';
    public static EntityType = 'User';

    public ID: number;
    public PhoneNumber: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public GlobalIdentity: string;
    public StatusCode: number;
    public Email: string;
    public Deleted: boolean;
    public BankIntegrationUserName: string;
    public IsAutobankAdmin: boolean;
    public LastLogin: Date;
    public UserName: string;
    public Protected: boolean;
    public HasAgreedToImportDisclaimer: boolean;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public DisplayName: string;
    public AuthPhoneNumber: string;
    public TwoFactorEnabled: boolean;
    public _createguid: string;
    public EndDate: Date;
    public CustomFields: any;
}


export class UniQueryDefinition extends UniEntity {
    public static RelativeUrl = 'uniquerydefinitions';
    public static EntityType = 'UniQueryDefinition';

    public ClickParam: string;
    public SystemGeneratedQuery: boolean;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public MainModelName: string;
    public Description: string;
    public StatusCode: number;
    public IsShared: boolean;
    public ModuleID: number;
    public Deleted: boolean;
    public UserID: number;
    public ClickUrl: string;
    public Code: string;
    public Category: string;
    public SortIndex: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public UniQueryFilters: Array<UniQueryFilter>;
    public UniQueryFields: Array<UniQueryField>;
    public CustomFields: any;
}


export class UniQueryField extends UniEntity {
    public static RelativeUrl = 'uniqueryfields';
    public static EntityType = 'UniQueryField';

    public Field: string;
    public FieldType: number;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Header: string;
    public StatusCode: number;
    public Width: string;
    public Path: string;
    public Index: number;
    public Deleted: boolean;
    public SumFunction: string;
    public UniQueryDefinitionID: number;
    public Alias: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class UniQueryFilter extends UniEntity {
    public static RelativeUrl = 'uniqueryfilters';
    public static EntityType = 'UniQueryFilter';

    public Field: string;
    public Operator: string;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public Value: string;
    public UniQueryDefinitionID: number;
    public UpdatedAt: Date;
    public Group: number;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Team extends UniEntity {
    public static RelativeUrl = 'teams';
    public static EntityType = 'Team';

    public Depth: number;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public DimensionsID: number;
    public StatusCode: number;
    public Lft: number;
    public Deleted: boolean;
    public Rght: number;
    public ParentID: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public Dimensions: Dimensions;
    public Positions: Array<TeamPosition>;
    public CustomFields: any;
}


export class TeamPosition extends UniEntity {
    public static RelativeUrl = 'teampositions';
    public static EntityType = 'TeamPosition';

    public ApproveOrder: number;
    public ID: number;
    public FromDate: LocalDate;
    public RelatedSharedRoleId: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public UserID: number;
    public ToDate: LocalDate;
    public UpdatedAt: Date;
    public TeamID: number;
    public Position: TeamPositionEnum;
    public UpdatedBy: string;
    public _createguid: string;
    public Team: Team;
    public CustomFields: any;
}


export class ApprovalRule extends UniEntity {
    public static RelativeUrl = 'approvalrules';
    public static EntityType = 'ApprovalRule';

    public ID: number;
    public IndustryCodes: string;
    public Keywords: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Description: string;
    public StatusCode: number;
    public RuleType: ApprovalRuleType;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public Steps: Array<ApprovalRuleStep>;
    public CustomFields: any;
}


export class ApprovalRuleStep extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ApprovalRuleStep';

    public Limit: number;
    public ApprovalRuleID: number;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public StepNumber: number;
    public UserID: number;
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

    public ID: number;
    public FromDate: LocalDate;
    public CreatedBy: string;
    public CreatedAt: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public UserID: number;
    public ToDate: LocalDate;
    public SubstituteUserID: number;
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

    public Comment: string;
    public Limit: number;
    public ApprovalRuleID: number;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public CurrencyCode: string;
    public StatusCode: number;
    public Deleted: boolean;
    public StepNumber: number;
    public UserID: number;
    public TaskID: number;
    public ApprovalID: number;
    public Amount: number;
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

    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Description: string;
    public StatusCode: number;
    public EntityType: string;
    public Deleted: boolean;
    public IsDepricated: boolean;
    public System: boolean;
    public StatusCategoryID: number;
    public Order: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public StatusCategory: StatusCategory;
    public CustomFields: any;
}


export class StatusCategory extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'StatusCategory';

    public StatusCategoryCode: StatusCategoryCode;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class StatusRemark extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'StatusRemark';

    public ID: number;
    public Remark: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public StatusCode: number;
    public EntityType: string;
    public Deleted: boolean;
    public EntityID: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Transition extends UniEntity {
    public static RelativeUrl = 'transitions';
    public static EntityType = 'Transition';

    public ID: number;
    public MethodName: string;
    public CreatedBy: string;
    public Controller: string;
    public CreatedAt: Date;
    public EntityType: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class TransitionThreshold extends UniEntity {
    public static RelativeUrl = 'thresholds';
    public static EntityType = 'TransitionThreshold';

    public RejectStatusCode: number;
    public Operation: OperationType;
    public Operator: Operator;
    public SharedRejectTransitionId: number;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public SharedRoleId: number;
    public Value: string;
    public PropertyName: string;
    public Disabled: boolean;
    public SharedApproveTransitionId: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class TransitionThresholdApproval extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'TransitionThresholdApproval';

    public RejectStatusCode: number;
    public Operation: OperationType;
    public Operator: Operator;
    public SharedRejectTransitionId: number;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public ApprovalID: number;
    public SharedRoleId: number;
    public Value: string;
    public PropertyName: string;
    public SharedApproveTransitionId: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public Approval: Approval;
    public CustomFields: any;
}


export class Approval extends UniEntity {
    public static RelativeUrl = 'approvals';
    public static EntityType = 'Approval';

    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public CurrencyCode: string;
    public StatusCode: number;
    public Deleted: boolean;
    public UserID: number;
    public TaskID: number;
    public SharedRoleId: number;
    public Amount: number;
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

    public RejectStatusCode: number;
    public SharedRejectTransitionId: number;
    public ID: number;
    public Title: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Type: TaskType;
    public StatusCode: number;
    public Deleted: boolean;
    public ModelID: number;
    public UserID: number;
    public SharedRoleId: number;
    public EntityID: number;
    public SharedApproveTransitionId: number;
    public UpdatedAt: Date;
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

    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public TransitionID: number;
    public EntityType: string;
    public Deleted: boolean;
    public IsDepricated: boolean;
    public ToStatusID: number;
    public FromStatusID: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public ExpiresDate: Date;
    public _createguid: string;
    public FromStatus: Status;
    public ToStatus: Status;
    public Transition: Transition;
    public CustomFields: any;
}


export class Project extends UniEntity {
    public static RelativeUrl = 'projects';
    public static EntityType = 'Project';

    public ProjectNumberSeriesID: number;
    public PlannedEnddate: LocalDate;
    public ProjectNumberNumeric: number;
    public ProjectLeadName: string;
    public ID: number;
    public CreatedBy: string;
    public Total: number;
    public Price: number;
    public CreatedAt: Date;
    public StartDate: LocalDate;
    public DimensionsID: number;
    public Description: string;
    public StatusCode: number;
    public WorkPlaceAddressID: number;
    public CostPrice: number;
    public Deleted: boolean;
    public PlannedStartdate: LocalDate;
    public Amount: number;
    public EndDate: LocalDate;
    public ProjectCustomerID: number;
    public UpdatedAt: Date;
    public ProjectNumber: string;
    public UpdatedBy: string;
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

    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public UserID: number;
    public ProjectID: number;
    public Responsibility: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public ProjectUser: User;
    public CustomFields: any;
}


export class ProjectResourceSchedule extends UniEntity {
    public static RelativeUrl = 'projects-schedules-resources';
    public static EntityType = 'ProjectResourceSchedule';

    public ProjectTaskScheduleID: number;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public StatusCode: number;
    public ProjectTaskID: number;
    public ProjectResourceID: number;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class ProjectTask extends UniEntity {
    public static RelativeUrl = 'projects-tasks';
    public static EntityType = 'ProjectTask';

    public Number: string;
    public ID: number;
    public SuggestedNumber: string;
    public CreatedBy: string;
    public Total: number;
    public Price: number;
    public CreatedAt: Date;
    public StartDate: LocalDate;
    public Description: string;
    public StatusCode: number;
    public CostPrice: number;
    public Deleted: boolean;
    public ProjectID: number;
    public Amount: number;
    public EndDate: LocalDate;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public ProjectTaskSchedules: Array<ProjectTaskSchedule>;
    public ProjectTaskResources: Array<ProjectResourceSchedule>;
    public CustomFields: any;
}


export class ProjectTaskSchedule extends UniEntity {
    public static RelativeUrl = 'projects-tasks-schedules';
    public static EntityType = 'ProjectTaskSchedule';

    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public StartDate: LocalDate;
    public StatusCode: number;
    public ProjectTaskID: number;
    public Deleted: boolean;
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

    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public ProductID: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public Product: Product;
    public CustomFields: any;
}


export class Product extends UniEntity {
    public static RelativeUrl = 'products';
    public static EntityType = 'Product';

    public VatTypeID: number;
    public ListPrice: number;
    public PartName: string;
    public VariansParentID: number;
    public PriceExVat: number;
    public ID: number;
    public ImageFileID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Unit: string;
    public DimensionsID: number;
    public Description: string;
    public Type: ProductTypeEnum;
    public PriceIncVat: number;
    public StatusCode: number;
    public CostPrice: number;
    public Deleted: boolean;
    public AverageCost: number;
    public DefaultProductCategoryID: number;
    public AccountID: number;
    public CalculateGrossPriceBasedOnNetPrice: boolean;
    public UpdatedAt: Date;
    public UpdatedBy: string;
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

    public Comment: string;
    public Empty: boolean;
    public ID: number;
    public CreatedBy: string;
    public NumberSeriesTypeID: number;
    public CreatedAt: Date;
    public StatusCode: number;
    public FromNumber: number;
    public Deleted: boolean;
    public System: boolean;
    public IsDefaultForTask: boolean;
    public AccountYear: number;
    public NumberSeriesTaskID: number;
    public Disabled: boolean;
    public UseNumbersFromNumberSeriesID: number;
    public ToNumber: number;
    public NextNumber: number;
    public UpdatedAt: Date;
    public NumberLock: boolean;
    public MainAccountID: number;
    public UpdatedBy: string;
    public Name: string;
    public DisplayName: string;
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

    public NumberSerieTypeBID: number;
    public NumberSerieTypeAID: number;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public StatusCode: number;
    public Deleted: boolean;
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

    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public StatusCode: number;
    public EntityType: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public NumberSeries: Array<NumberSeries>;
    public CustomFields: any;
}


export class NumberSeriesType extends UniEntity {
    public static RelativeUrl = 'number-series-types';
    public static EntityType = 'NumberSeriesType';

    public CanHaveSeveralActiveSeries: boolean;
    public EntityField: string;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public StatusCode: number;
    public Yearly: boolean;
    public EntityType: string;
    public Deleted: boolean;
    public System: boolean;
    public EntitySeriesIDField: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public Series: Array<NumberSeries>;
    public CustomFields: any;
}


export class EncryptionInfo extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'EncryptionInfo';

    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public description: string;
    public type: Type;
    public Deleted: boolean;
    public password: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class File extends UniEntity {
    public static RelativeUrl = 'files/{entitytype}/{entityid}';
    public static EntityType = 'File';

    public Pages: number;
    public Size: string;
    public ID: number;
    public CreatedBy: string;
    public OCRData: string;
    public CreatedAt: Date;
    public Description: string;
    public StatusCode: number;
    public StorageReference: string;
    public encryptionID: number;
    public Deleted: boolean;
    public Md5: string;
    public PermaLink: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Name: string;
    public ContentType: string;
    public UploadSlot: string;
    public _createguid: string;
    public FileTags: Array<FileTag>;
    public EntityLinks: Array<FileEntityLink>;
    public CustomFields: any;
}


export class FileTag extends UniEntity {
    public static RelativeUrl = 'filetags';
    public static EntityType = 'FileTag';

    public ID: number;
    public CreatedBy: string;
    public TagName: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public Status: number;
    public FileID: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public File: File;
    public CustomFields: any;
}


export class FileEntityLink extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'FileEntityLink';

    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public StatusCode: number;
    public EntityType: string;
    public Deleted: boolean;
    public EntityID: number;
    public IsAttachment: boolean;
    public FileID: number;
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
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public ProductType: string;
    public ExternalReference: string;
    public DateLogged: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class AccessPointFormat extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AccessPointFormat';

    public IncommingID: number;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public OutgoingID: number;
    public StatusCode: number;
    public Deleted: boolean;
    public ResourceName: string;
    public Label: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class EHFLog extends UniEntity {
    public static RelativeUrl = 'ehf';
    public static EntityType = 'EHFLog';

    public ExternalMessage: string;
    public JobRunID: number;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Type: SharingType;
    public StatusCode: number;
    public EntityType: string;
    public Deleted: boolean;
    public From: string;
    public Subject: string;
    public ExternalReference: string;
    public DistributeAt: LocalDate;
    public EntityID: number;
    public EntityDisplayValue: string;
    public UpdatedAt: Date;
    public JobRunExternalRef: string;
    public UpdatedBy: string;
    public To: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Department extends UniEntity {
    public static RelativeUrl = 'departments';
    public static EntityType = 'Department';

    public DepartmentManagerName: string;
    public DepartmentNumberNumeric: number;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public DepartmentNumberSeriesID: number;
    public Description: string;
    public StatusCode: number;
    public Deleted: boolean;
    public DepartmentNumber: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public DepartmentNumberSeries: NumberSeries;
    public CustomFields: any;
}


export class Dimension10 extends UniEntity {
    public static RelativeUrl = 'Dimension10';
    public static EntityType = 'Dimension10';

    public Number: string;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Description: string;
    public StatusCode: number;
    public Deleted: boolean;
    public NumberNumeric: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Dimension5 extends UniEntity {
    public static RelativeUrl = 'Dimension5';
    public static EntityType = 'Dimension5';

    public Number: string;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Description: string;
    public StatusCode: number;
    public Deleted: boolean;
    public NumberNumeric: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Dimension6 extends UniEntity {
    public static RelativeUrl = 'Dimension6';
    public static EntityType = 'Dimension6';

    public Number: string;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Description: string;
    public StatusCode: number;
    public Deleted: boolean;
    public NumberNumeric: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Dimension7 extends UniEntity {
    public static RelativeUrl = 'Dimension7';
    public static EntityType = 'Dimension7';

    public Number: string;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Description: string;
    public StatusCode: number;
    public Deleted: boolean;
    public NumberNumeric: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Dimension8 extends UniEntity {
    public static RelativeUrl = 'Dimension8';
    public static EntityType = 'Dimension8';

    public Number: string;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Description: string;
    public StatusCode: number;
    public Deleted: boolean;
    public NumberNumeric: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Dimension9 extends UniEntity {
    public static RelativeUrl = 'Dimension9';
    public static EntityType = 'Dimension9';

    public Number: string;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Description: string;
    public StatusCode: number;
    public Deleted: boolean;
    public NumberNumeric: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Dimensions extends UniEntity {
    public static RelativeUrl = 'dimensions';
    public static EntityType = 'Dimensions';

    public RegionID: number;
    public Dimension10ID: number;
    public Dimension9ID: number;
    public ID: number;
    public Dimension5ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public StatusCode: number;
    public ProjectTaskID: number;
    public Deleted: boolean;
    public ProjectID: number;
    public ResponsibleID: number;
    public DepartmentID: number;
    public Dimension7ID: number;
    public Dimension8ID: number;
    public Dimension6ID: number;
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
    public Dimension7Name: string;
    public DepartmentName: string;
    public RegionCode: string;
    public ID: number;
    public Dimension8Name: string;
    public RegionName: string;
    public Dimension5Number: string;
    public DimensionsID: number;
    public Dimension6Name: string;
    public Dimension10Name: string;
    public Dimension10Number: string;
    public DepartmentNumber: string;
    public Dimension6Number: string;
    public ProjectTaskName: string;
    public ProjectTaskNumber: string;
    public Dimension9Number: string;
    public Dimension8Number: string;
    public Dimension7Number: string;
    public Dimension9Name: string;
    public ResponsibleName: string;
    public ProjectNumber: string;
    public Dimension5Name: string;
    public ProjectName: string;
}


export class DimensionSettings extends UniEntity {
    public static RelativeUrl = 'dimensionsettings';
    public static EntityType = 'DimensionSettings';

    public IsActive: boolean;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public Dimension: number;
    public Label: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Region extends UniEntity {
    public static RelativeUrl = 'regions';
    public static EntityType = 'Region';

    public RegionCode: string;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public CountryCode: string;
    public Description: string;
    public StatusCode: number;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Responsible extends UniEntity {
    public static RelativeUrl = 'responsibles';
    public static EntityType = 'Responsible';

    public ID: number;
    public NameOfResponsible: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Description: string;
    public StatusCode: number;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Contract extends UniEntity {
    public static RelativeUrl = 'contracts';
    public static EntityType = 'Contract';

    public Engine: ContractEngine;
    public ID: number;
    public HashTransactionAddress: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public ContractCode: string;
    public Description: string;
    public StatusCode: number;
    public Deleted: boolean;
    public TeamsUri: string;
    public Hash: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
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

    public ID: number;
    public Address: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Type: AddressType;
    public StatusCode: number;
    public EntityType: string;
    public Deleted: boolean;
    public ContractID: number;
    public ContractAssetID: number;
    public Amount: number;
    public EntityID: number;
    public AssetAddress: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public Contract: Contract;
    public ContractAsset: ContractAsset;
    public CustomFields: any;
}


export class ContractAsset extends UniEntity {
    public static RelativeUrl = 'contractassets';
    public static EntityType = 'ContractAsset';

    public IsAutoDestroy: boolean;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public IsCosignedByDefiner: boolean;
    public Type: AddressType;
    public StatusCode: number;
    public IsIssuedByDefinerOnly: boolean;
    public Deleted: boolean;
    public ContractID: number;
    public Cap: number;
    public IsTransferrable: boolean;
    public SpenderAttested: boolean;
    public IsPrivate: boolean;
    public UpdatedAt: Date;
    public IsFixedDenominations: boolean;
    public UpdatedBy: string;
    public _createguid: string;
    public Contract: Contract;
    public CustomFields: any;
}


export class ContractDebugLog extends UniEntity {
    public static RelativeUrl = 'contractdebuglogs';
    public static EntityType = 'ContractDebugLog';

    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Type: ContractEventType;
    public StatusCode: number;
    public Deleted: boolean;
    public ContractID: number;
    public ContractRunLogID: number;
    public Message: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public Contract: Contract;
    public ContractRunLog: ContractRunLog;
    public CustomFields: any;
}


export class ContractParameter extends UniEntity {
    public static RelativeUrl = 'contractparameters';
    public static EntityType = 'ContractParameter';

    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public ContractID: number;
    public Value: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public Contract: Contract;
    public CustomFields: any;
}


export class ContractRunLog extends UniEntity {
    public static RelativeUrl = 'contractrunlogs';
    public static EntityType = 'ContractRunLog';

    public ContractTriggerID: number;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Type: ContractEventType;
    public StatusCode: number;
    public Deleted: boolean;
    public ContractID: number;
    public RunTime: string;
    public Message: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public Contract: Contract;
    public CustomFields: any;
}


export class ContractTransaction extends UniEntity {
    public static RelativeUrl = 'contracttransactions';
    public static EntityType = 'ContractTransaction';

    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public ContractID: number;
    public Amount: number;
    public ContractAddressID: number;
    public SenderAddress: string;
    public AssetAddress: string;
    public ReceiverAddress: string;
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

    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Type: ContractEventType;
    public StatusCode: number;
    public Deleted: boolean;
    public ModelFilter: string;
    public ContractID: number;
    public ExpressionFilter: string;
    public OperationFilter: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public Contract: Contract;
    public CustomFields: any;
}


export class Comment extends UniEntity {
    public static RelativeUrl = 'comments';
    public static EntityType = 'Comment';

    public ID: number;
    public AuthorID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public StatusCode: number;
    public EntityType: string;
    public Deleted: boolean;
    public EntityID: number;
    public Text: string;
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

    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public StatusCode: number;
    public CommentID: number;
    public Deleted: boolean;
    public UserID: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public User: User;
    public CustomFields: any;
}


export class ApiKey extends UniEntity {
    public static RelativeUrl = 'apikeys';
    public static EntityType = 'ApiKey';

    public FilterDate: LocalDate;
    public Encrypt: boolean;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Description: string;
    public StatusCode: number;
    public Deleted: boolean;
    public ExternalId: string;
    public IntegrationType: TypeOfIntegration;
    public Url: string;
    public UpdatedAt: Date;
    public IntegrationKey: string;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Altinn extends UniEntity {
    public static RelativeUrl = 'altinn';
    public static EntityType = 'Altinn';

    public Language: string;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public StatusCode: number;
    public PreferredLogin: TypeOfLogin;
    public Deleted: boolean;
    public SystemPw: string;
    public SystemID: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class AltinnReceipt extends UniEntity {
    public static RelativeUrl = 'altinnreceipts';
    public static EntityType = 'AltinnReceipt';

    public ReceiptID: number;
    public ID: number;
    public CreatedBy: string;
    public TimeStamp: Date;
    public CreatedAt: Date;
    public ErrorText: string;
    public StatusCode: number;
    public Deleted: boolean;
    public UserSign: string;
    public AltinnResponseData: string;
    public HasBeenRegistered: boolean;
    public Form: string;
    public XmlReceipt: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public Signings: Array<AltinnSigning>;
    public CustomFields: any;
}


export class AltinnSigning extends UniEntity {
    public static RelativeUrl = 'altinnsigning';
    public static EntityType = 'AltinnSigning';

    public ID: number;
    public SignatureReference: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public SignatureText: string;
    public StatusText: string;
    public DateSigned: Date;
    public AltinnReceiptID: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public AltinnReceipt: AltinnReceipt;
    public CustomFields: any;
}


export class Barnepass extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Barnepass';

    public inntektsaar: number;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public oppgave: Array<BarnepassOppgave>;
    public CustomFields: any;
}


export class BarnepassOppgave extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'BarnepassOppgave';

    public navn: string;
    public BarnepassID: number;
    public foedselsnummer: string;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public StatusCode: number;
    public email: string;
    public Deleted: boolean;
    public paaloeptBeloep: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class UserRole extends UniEntity {
    public static RelativeUrl = 'userroles';
    public static EntityType = 'UserRole';

    public SharedRoleName: string;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public UserID: number;
    public SharedRoleId: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public User: User;
    public CustomFields: any;
}


export class Role extends UniEntity {
    public static RelativeUrl = 'roles';
    public static EntityType = 'Role';

    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Description: string;
    public Deleted: boolean;
    public Label: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public RolePermissions: Array<RolePermission>;
    public CustomFields: any;
}


export class RolePermission extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'RolePermission';

    public PermissionID: number;
    public ID: number;
    public CreatedBy: string;
    public RoleID: number;
    public CreatedAt: Date;
    public Deleted: boolean;
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

    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public RolePermissions: Array<RolePermission>;
    public CustomFields: any;
}


export class ApiMessage extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ApiMessage';

    public ID: number;
    public FromDate: Date;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Type: ApiMessageType;
    public StatusCode: number;
    public Deleted: boolean;
    public ToDate: Date;
    public Service: string;
    public Message: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class AutobankTransferLog extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AutobankTransferLog';

    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public DocumentsId: number;
    public DateInserted: Date;
    public Status: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class AvtaleGiroAgreement extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AvtaleGiroAgreement';

    public DataSender: string;
    public Thumbprint: string;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Description: string;
    public Deleted: boolean;
    public KeyPath: string;
    public NextNumber: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class AvtaleGiroBankAccount extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AvtaleGiroBankAccount';

    public BankAccountNumber: string;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public AvtaleGiroAgreementID: number;
    public UpdatedAt: Date;
    public CompanyID: number;
    public UpdatedBy: string;
    public _createguid: string;
    public Company: Company;
    public CustomFields: any;
}


export class AvtaleGiroFile extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AvtaleGiroFile';

    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public AvtaleGiroMergedFileID: number;
    public AvtaleGiroAgreementID: number;
    public FileID: number;
    public AvtaleGiroContent: string;
    public UpdatedAt: Date;
    public CompanyID: number;
    public UpdatedBy: string;
    public _createguid: string;
    public Company: Company;
    public CustomFields: any;
}


export class AvtaleGiroMergedFile extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AvtaleGiroMergedFile';

    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public TransmissionNumber: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class BankAgreement extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'BankAgreement';

    public ReceiptID: string;
    public ServiceID: string;
    public AccountOwnerOrgNumber: string;
    public ServiceAccountID: number;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public AccountOwnerName: string;
    public OrderName: string;
    public Deleted: boolean;
    public OrderMobile: string;
    public CustomerName: string;
    public OrderEmail: string;
    public ReceiptDate: Date;
    public UpdatedAt: Date;
    public CompanyID: number;
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

    public FileType: string;
    public ID: number;
    public DivisionID: number;
    public CreatedBy: string;
    public BankAgreementID: number;
    public CreatedAt: Date;
    public Deleted: boolean;
    public KidRule: string;
    public DivisionName: string;
    public ConfirmInNetbank: boolean;
    public UpdatedAt: Date;
    public ServiceType: number;
    public UpdatedBy: string;
    public _createguid: string;
    public BankAgreement: BankAgreement;
    public BankAccounts: Array<BankServiceBankAccount>;
    public CustomFields: any;
}


export class BankServiceBankAccount extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'BankServiceBankAccount';

    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public BankServiceID: number;
    public AccountNumber: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public BankService: BankService;
    public CustomFields: any;
}


export class Company extends UniEntity {
    public static RelativeUrl = 'companies';
    public static EntityType = 'Company';

    public SchemaName: string;
    public ClientNumber: number;
    public ID: number;
    public OrganizationNumber: string;
    public IsTemplate: boolean;
    public CreatedBy: string;
    public LastActivity: Date;
    public CreatedAt: Date;
    public FileFlowOrgnrEmail: string;
    public MigrationVersion: string;
    public StatusCode: CompanyStatusCode;
    public Key: string;
    public Deleted: boolean;
    public WebHookSubscriberId: string;
    public IsGlobalTemplate: boolean;
    public IsTest: boolean;
    public FileFlowEmail: string;
    public ConnectionString: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class CompanyAccess extends UniEntity {
    public static RelativeUrl = 'companies-access';
    public static EntityType = 'CompanyAccess';

    public Roles: string;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public GlobalIdentity: string;
    public StartDate: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public EndDate: Date;
    public UpdatedAt: Date;
    public CompanyID: number;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class CompanyBackup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'CompanyBackup';

    public SchemaName: string;
    public Reason: string;
    public ID: number;
    public DeletedAt: Date;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public ScheduledForDeleteAt: Date;
    public BackupStatus: BackupStatus;
    public ContractID: number;
    public CompanyKey: string;
    public ContainerName: string;
    public ContractType: number;
    public CustomerName: string;
    public CopyFiles: boolean;
    public CompanyName: string;
    public CloudBlobName: string;
    public Environment: string;
    public OrgNumber: string;
    public Message: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class ContractCron extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ContractCron';

    public ContractTriggerID: number;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public ContractID: number;
    public Expression: string;
    public UpdatedAt: Date;
    public CompanyID: number;
    public UpdatedBy: string;
    public CompanyKey: string;
    public _createguid: string;
    public CompanyDbName: string;
    public CustomFields: any;
}


export class ContractObyte extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ContractObyte';

    public ID: number;
    public Address: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public ContractID: number;
    public ContractAddressID: number;
    public AssetAddress: string;
    public UpdatedAt: Date;
    public CompanyID: number;
    public UpdatedBy: string;
    public CompanyKey: string;
    public _createguid: string;
    public CompanyDbName: string;
    public CustomFields: any;
}


export class DeniedUserAccessLog extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'DeniedUserAccessLog';

    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Email: string;
    public Deleted: boolean;
    public Occurred: Date;
    public CompanyName: string;
    public Username: string;
    public Message: string;
    public UpdatedAt: Date;
    public CompanyID: number;
    public UpdatedBy: string;
    public _createguid: string;
    public Company: Company;
    public CustomFields: any;
}


export class FailedBankFile extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'FailedBankFile';

    public FileName: string;
    public FailedReason: FailedReasonEnum;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public FileContent: string;
    public Deleted: boolean;
    public CompanyKey: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class HangfireJob extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'HangfireJob';

    public JobId: string;
    public Year: number;
    public ID: number;
    public CreatedAt: Date;
    public GlobalIdentity: string;
    public HasError: boolean;
    public Completed: boolean;
    public CompanyKey: string;
    public Status: number;
    public UpdatedAt: Date;
    public CompanyID: number;
    public CustomFields: any;
}


export class HangfireJobContext extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'HangfireJobContext';

    public SchemaName: string;
    public JobId: string;
    public Year: number;
    public ID: number;
    public CreatedAt: Date;
    public GlobalIdentity: string;
    public HasError: boolean;
    public Completed: boolean;
    public CompanyKey: string;
    public Status: number;
    public UpdatedAt: Date;
    public CompanyID: number;
    public CustomFields: any;
}


export class HangfireResponse extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'HangfireResponse';

    public JobId: string;
    public Year: number;
    public ID: number;
    public CreatedAt: Date;
    public GlobalIdentity: string;
    public HasError: boolean;
    public State: string;
    public Completed: boolean;
    public ProgressUrl: string;
    public CompanyKey: string;
    public Status: number;
    public UpdatedAt: Date;
    public CompanyID: number;
    public CustomFields: any;
}


export class KpiDefinition extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'KpiDefinition';

    public ID: number;
    public RoleNames: string;
    public Application: string;
    public CreatedBy: string;
    public RefreshModels: string;
    public CreatedAt: Date;
    public IsPerUser: boolean;
    public Deleted: boolean;
    public SourceType: KpiSourceType;
    public Interval: string;
    public ValueType: KpiValueType;
    public Route: string;
    public UpdatedAt: Date;
    public CompanyID: number;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class KpiValue extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'KpiValue';

    public LastUpdated: Date;
    public ID: number;
    public UserIdentity: string;
    public CreatedBy: string;
    public Total: number;
    public CreatedAt: Date;
    public ValueStatus: KpiValueStatus;
    public Deleted: boolean;
    public KpiName: string;
    public KpiDefinitionID: number;
    public Text: string;
    public UpdatedAt: Date;
    public CompanyID: number;
    public UpdatedBy: string;
    public Counter: number;
    public _createguid: string;
    public CustomFields: any;
}


export class OutgoingInvoice extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'OutgoingInvoice';

    public MetaJson: string;
    public InvoiceType: OutgoingInvoiceType;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public StatusCode: number;
    public DueDate: Date;
    public RecipientPhoneNumber: string;
    public ISPOrganizationNumber: string;
    public Deleted: boolean;
    public ExternalReference: string;
    public Amount: number;
    public RecipientOrganizationNumber: string;
    public Status: number;
    public InvoiceID: number;
    public UpdatedAt: Date;
    public CompanyID: number;
    public UpdatedBy: string;
    public _createguid: string;
    public Company: Company;
    public CustomFields: any;
}


export class ProcessFileLog extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ProcessFileLog';

    public FileName: string;
    public FileType: number;
    public EntityCount: number;
    public EntityInstanceID: string;
    public ID: number;
    public UserIdentity: string;
    public CreatedBy: string;
    public EntityName: string;
    public CreatedAt: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public CompanyKey: string;
    public CompanyName: string;
    public FileID: number;
    public Message: string;
    public UpdatedAt: Date;
    public CompanyID: number;
    public UpdatedBy: string;
    public _createguid: string;
    public Company: Company;
    public CustomFields: any;
}


export class ServiceAccount extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ServiceAccount';

    public DataSender: string;
    public Thumbprint: string;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Description: string;
    public Deleted: boolean;
    public KeyPath: string;
    public NextNumber: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class UserVerification extends UniEntity {
    public static RelativeUrl = 'user-verifications';
    public static EntityType = 'UserVerification';

    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public StatusCode: number;
    public Email: string;
    public Deleted: boolean;
    public UserId: number;
    public VerificationDate: Date;
    public ExpirationDate: Date;
    public VerificationCode: string;
    public RequestOrigin: UserVerificationRequestOrigin;
    public UserType: UserVerificationUserType;
    public UpdatedAt: Date;
    public CompanyId: number;
    public UpdatedBy: string;
    public DisplayName: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Account extends UniEntity {
    public static RelativeUrl = 'accounts';
    public static EntityType = 'Account';

    public AccountSetupID: number;
    public CustomerID: number;
    public VatTypeID: number;
    public DoSynchronize: boolean;
    public UseVatDeductionGroupID: number;
    public ID: number;
    public Keywords: string;
    public TopLevelAccountGroupID: number;
    public CreatedBy: string;
    public SupplierID: number;
    public CreatedAt: Date;
    public DimensionsID: number;
    public Description: string;
    public StatusCode: number;
    public CurrencyCodeID: number;
    public EmployeeID: number;
    public Deleted: boolean;
    public SystemAccount: boolean;
    public UsePostPost: boolean;
    public Active: boolean;
    public Locked: boolean;
    public LockManualPosts: boolean;
    public AccountName: string;
    public CostAllocationID: number;
    public AccountGroupID: number;
    public AccountID: number;
    public SaftMappingAccountID: number;
    public AccountNumber: number;
    public UpdatedAt: Date;
    public Visible: boolean;
    public UpdatedBy: string;
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
    public CreatedBy: string;
    public CreatedAt: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public AccountID: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class AccountGroup extends UniEntity {
    public static RelativeUrl = 'accountgroups';
    public static EntityType = 'AccountGroup';

    public GroupNumber: string;
    public MainGroupID: number;
    public ID: number;
    public AccountGroupSetID: number;
    public CompatibleAccountID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public AccountGroupSetupID: number;
    public AccountID: number;
    public Summable: boolean;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public MainGroup: AccountGroup;
    public AccountGroupSet: AccountGroupSet;
    public CustomFields: any;
}


export class AccountGroupSet extends UniEntity {
    public static RelativeUrl = 'accountgroupsets';
    public static EntityType = 'AccountGroupSet';

    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public SubAccountAllowed: boolean;
    public StatusCode: number;
    public Deleted: boolean;
    public FromAccountNumber: number;
    public System: boolean;
    public Shared: boolean;
    public ToAccountNumber: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class AccountMandatoryDimension extends UniEntity {
    public static RelativeUrl = 'accountmandatorydimension';
    public static EntityType = 'AccountMandatoryDimension';

    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public StatusCode: number;
    public MandatoryType: number;
    public Deleted: boolean;
    public DimensionNo: number;
    public AccountID: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Accrual extends UniEntity {
    public static RelativeUrl = 'accruals';
    public static EntityType = 'Accrual';

    public AccrualJournalEntryMode: number;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public StatusCode: number;
    public JournalEntryLineDraftID: number;
    public ResultAccountID: number;
    public BalanceAccountID: number;
    public Deleted: boolean;
    public AccrualAmount: number;
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

    public ID: number;
    public CreatedBy: string;
    public AccrualID: number;
    public CreatedAt: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public JournalEntryDraftLineID: number;
    public Amount: number;
    public AccountYear: number;
    public PeriodNo: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public Accrual: Accrual;
    public JournalEntryLineDraft: JournalEntryLineDraft;
    public CustomFields: any;
}


export class ApprovalData extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ApprovalData';

    public IPAddress: string;
    public EntityReference: string;
    public EntityCount: number;
    public ID: number;
    public CreatedBy: string;
    public EntityName: string;
    public VerificationMethod: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public EntityID: number;
    public UpdatedAt: Date;
    public EntityHash: string;
    public VerificationReference: string;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Asset extends UniEntity {
    public static RelativeUrl = 'assets';
    public static EntityType = 'Asset';

    public DepreciationCycle: number;
    public AssetGroupCode: string;
    public ID: number;
    public PurchaseAmount: number;
    public DepreciationAccountID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public DimensionsID: number;
    public StatusCode: number;
    public BalanceAccountID: number;
    public DepreciationStartDate: LocalDate;
    public Deleted: boolean;
    public ScrapValue: number;
    public NetFinancialValue: number;
    public AutoDepreciation: boolean;
    public Lifetime: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Name: string;
    public PurchaseDate: LocalDate;
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

    public PhoneID: number;
    public EmailID: number;
    public BIC: string;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public Web: string;
    public InitialBIC: string;
    public AddressID: number;
    public UpdatedAt: Date;
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

    public BankAccountType: string;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public IntegrationSettings: string;
    public Locked: boolean;
    public BankID: number;
    public IntegrationStatus: number;
    public AccountID: number;
    public Label: string;
    public CompanySettingsID: number;
    public AccountNumber: string;
    public BusinessRelationID: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public IBAN: string;
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
    public BankAcceptance: boolean;
    public ServiceID: string;
    public PreApprovedBankPayments: PreApprovedBankPayments;
    public ServiceProvider: number;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public StatusCode: number;
    public BankAccountID: number;
    public Email: string;
    public Deleted: boolean;
    public HasNewAccountInformation: boolean;
    public IsOutgoing: boolean;
    public IsInbound: boolean;
    public DefaultAgreement: boolean;
    public IsBankBalance: boolean;
    public HasOrderedIntegrationChange: boolean;
    public ServiceTemplateID: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Name: string;
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
    public CreatedBy: string;
    public ActionCode: ActionCodeBankRule;
    public CreatedAt: Date;
    public Rule: string;
    public StatusCode: number;
    public Deleted: boolean;
    public Priority: number;
    public AccountID: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public Account: Account;
    public CustomFields: any;
}


export class BankStatement extends UniEntity {
    public static RelativeUrl = 'bankstatements';
    public static EntityType = 'BankStatement';

    public ID: number;
    public FromDate: LocalDate;
    public CreatedBy: string;
    public CreatedAt: Date;
    public CurrencyCode: string;
    public StatusCode: number;
    public BankAccountID: number;
    public AmountCurrency: number;
    public Deleted: boolean;
    public StartBalance: number;
    public EndBalance: number;
    public Amount: number;
    public AccountID: number;
    public ToDate: LocalDate;
    public FileID: number;
    public ArchiveReference: string;
    public UpdatedAt: Date;
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
    public StructuredReference: string;
    public ID: number;
    public CreatedBy: string;
    public BookingDate: LocalDate;
    public CreatedAt: Date;
    public CurrencyCode: string;
    public BankStatementID: number;
    public Description: string;
    public StatusCode: number;
    public InvoiceNumber: string;
    public CID: string;
    public AmountCurrency: number;
    public Deleted: boolean;
    public TransactionId: string;
    public ReceiverAccount: string;
    public OpenAmount: number;
    public Amount: number;
    public Category: string;
    public ArchiveReference: string;
    public SenderName: string;
    public UpdatedAt: Date;
    public Receivername: string;
    public SenderAccount: string;
    public UpdatedBy: string;
    public ValueDate: LocalDate;
    public _createguid: string;
    public BankStatement: BankStatement;
    public CustomFields: any;
}


export class BankStatementMatch extends UniEntity {
    public static RelativeUrl = 'bankstatementmatch';
    public static EntityType = 'BankStatementMatch';

    public JournalEntryLineID: number;
    public ID: number;
    public BankStatementEntryID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public Batch: string;
    public Amount: number;
    public UpdatedAt: Date;
    public Group: string;
    public UpdatedBy: string;
    public _createguid: string;
    public BankStatementEntry: BankStatementEntry;
    public JournalEntryLine: JournalEntryLine;
    public CustomFields: any;
}


export class BankStatementRule extends UniEntity {
    public static RelativeUrl = 'bankstatementrules';
    public static EntityType = 'BankStatementRule';

    public IsActive: boolean;
    public ID: number;
    public EntryText: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Rule: string;
    public DimensionsID: number;
    public StatusCode: number;
    public Deleted: boolean;
    public Priority: number;
    public AccountID: number;
    public UpdatedAt: Date;
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

    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public AccountingYear: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public Entries: Array<BudgetEntry>;
    public CustomFields: any;
}


export class BudgetEntry extends UniEntity {
    public static RelativeUrl = 'budgetentries';
    public static EntityType = 'BudgetEntry';

    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public DimensionsID: number;
    public StatusCode: number;
    public Deleted: boolean;
    public Amount: number;
    public BudgetID: number;
    public AccountID: number;
    public PeriodNumber: number;
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

    public AssetSaleProductID: number;
    public AssetSaleProfitBalancingAccountID: number;
    public AssetSaleProfitVatAccountID: number;
    public ReInvoicingTurnoverProductID: number;
    public ID: number;
    public AssetWriteoffAccountID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public ReInvoicingMethod: number;
    public StatusCode: number;
    public AssetSaleLossNoVatAccountID: number;
    public ReInvoicingCostsharingProductID: number;
    public Deleted: boolean;
    public AssetSaleLossVatAccountID: number;
    public AssetSaleProfitNoVatAccountID: number;
    public AssetSaleLossBalancingAccountID: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
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
    public CreatedBy: string;
    public CreatedAt: Date;
    public CreditAmount: number;
    public StatusCode: number;
    public BankAccountID: number;
    public Deleted: boolean;
    public IsTax: boolean;
    public IsOutgoing: boolean;
    public AccountID: number;
    public UpdatedAt: Date;
    public IsIncomming: boolean;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public BankAccount: BankAccount;
    public Account: Account;
    public CustomFields: any;
}


export class CostAllocation extends UniEntity {
    public static RelativeUrl = 'costallocations';
    public static EntityType = 'CostAllocation';

    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public Items: Array<CostAllocationItem>;
    public CustomFields: any;
}


export class CostAllocationItem extends UniEntity {
    public static RelativeUrl = 'costallocationitems';
    public static EntityType = 'CostAllocationItem';

    public VatTypeID: number;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public DimensionsID: number;
    public Description: string;
    public StatusCode: number;
    public Deleted: boolean;
    public Amount: number;
    public CostAllocationID: number;
    public AccountID: number;
    public UpdatedAt: Date;
    public Percent: number;
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

    public CustomLiquidityPaymentType: CustomLiquidityPaymentInterval;
    public ID: number;
    public IsCustomerPayment: boolean;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Description: string;
    public StatusCode: number;
    public DueDate: LocalDate;
    public CurrencyCodeID: number;
    public AmountCurrency: number;
    public Deleted: boolean;
    public Amount: number;
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

    public ID: number;
    public CreatedBy: string;
    public DepreciationType: number;
    public CreatedAt: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public AssetID: number;
    public AssetJELineID: number;
    public DepreciationJELineID: number;
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

    public ValidFrom: LocalDate;
    public Year: number;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public ValidTo: LocalDate;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class JournalEntry extends UniEntity {
    public static RelativeUrl = 'journalentries';
    public static EntityType = 'JournalEntry';

    public NumberSeriesID: number;
    public JournalEntryDraftGroup: string;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Description: string;
    public FinancialYearID: number;
    public StatusCode: number;
    public Deleted: boolean;
    public JournalEntryNumberNumeric: number;
    public NumberSeriesTaskID: number;
    public JournalEntryNumber: string;
    public UpdatedAt: Date;
    public JournalEntryAccrualID: number;
    public UpdatedBy: string;
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
    public VatPeriodID: number;
    public VatDate: LocalDate;
    public VatTypeID: number;
    public ID: number;
    public FinancialDate: LocalDate;
    public RestAmount: number;
    public CurrencyExchangeRate: number;
    public CreatedBy: string;
    public RestAmountCurrency: number;
    public AccrualID: number;
    public CreatedAt: Date;
    public DimensionsID: number;
    public Description: string;
    public OriginalJournalEntryPost: number;
    public StatusCode: number;
    public DueDate: LocalDate;
    public JournalEntryTypeID: number;
    public JournalEntryLineDraftID: number;
    public CurrencyCodeID: number;
    public InvoiceNumber: string;
    public SubAccountID: number;
    public PostPostJournalEntryLineID: number;
    public PaymentInfoTypeID: number;
    public AmountCurrency: number;
    public Deleted: boolean;
    public VatReportID: number;
    public ReferenceOriginalPostID: number;
    public RegisteredDate: LocalDate;
    public BatchNumber: number;
    public Amount: number;
    public ReferenceCreditPostID: number;
    public Signature: string;
    public VatPercent: number;
    public AccountID: number;
    public PeriodID: number;
    public JournalEntryNumberNumeric: number;
    public VatDeductionPercent: number;
    public JournalEntryID: number;
    public PaymentID: string;
    public VatJournalEntryPostID: number;
    public OriginalReferencePostID: number;
    public JournalEntryNumber: string;
    public TaxBasisAmountCurrency: number;
    public UpdatedAt: Date;
    public CustomerOrderID: number;
    public SupplierInvoiceID: number;
    public UpdatedBy: string;
    public PaymentReferenceID: number;
    public TaxBasisAmount: number;
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
    public VatPeriodID: number;
    public VatDate: LocalDate;
    public VatTypeID: number;
    public ID: number;
    public FinancialDate: LocalDate;
    public CurrencyExchangeRate: number;
    public CreatedBy: string;
    public AccrualID: number;
    public CreatedAt: Date;
    public DimensionsID: number;
    public Description: string;
    public StatusCode: number;
    public DueDate: LocalDate;
    public JournalEntryTypeID: number;
    public CurrencyCodeID: number;
    public InvoiceNumber: string;
    public SubAccountID: number;
    public PostPostJournalEntryLineID: number;
    public PaymentInfoTypeID: number;
    public AmountCurrency: number;
    public Deleted: boolean;
    public RegisteredDate: LocalDate;
    public BatchNumber: number;
    public Amount: number;
    public Signature: string;
    public VatPercent: number;
    public AccountID: number;
    public PeriodID: number;
    public JournalEntryNumberNumeric: number;
    public VatDeductionPercent: number;
    public JournalEntryID: number;
    public PaymentID: string;
    public JournalEntryNumber: string;
    public TaxBasisAmountCurrency: number;
    public UpdatedAt: Date;
    public CustomerOrderID: number;
    public SupplierInvoiceID: number;
    public UpdatedBy: string;
    public PaymentReferenceID: number;
    public TaxBasisAmount: number;
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
    public ColumnSetUp: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public TraceLinkTypes: string;
    public VisibleModules: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class JournalEntrySourceSerie extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'JournalEntrySourceSerie';

    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public JournalEntrySourceID: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public JournalEntrySourceEntityName: string;
    public JournalEntrySourceInstanceID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class JournalEntryType extends UniEntity {
    public static RelativeUrl = 'journalentrytypes';
    public static EntityType = 'JournalEntryType';

    public Number: number;
    public ID: number;
    public CreatedBy: string;
    public ExpectNegativeAmount: boolean;
    public CreatedAt: Date;
    public MainName: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Name: string;
    public DisplayName: string;
    public _createguid: string;
    public CustomFields: any;
}


export class LedgerSuggestion extends UniEntity {
    public IndustryCode: string;
    public BusinessType: string;
    public ID: number;
    public Source: SuggestionSource;
    public IndustryName: string;
    public OrgNumber: string;
    public Name: string;
}


export class Payment extends UniEntity {
    public static RelativeUrl = 'payments';
    public static EntityType = 'Payment';

    public AutoJournal: boolean;
    public CustomerInvoiceID: number;
    public SerialNumberOrAcctSvcrRef: string;
    public IsPaymentClaim: boolean;
    public Proprietary: string;
    public PaymentStatusReportFileID: number;
    public ID: number;
    public InPaymentID: string;
    public CurrencyExchangeRate: number;
    public IsCustomerPayment: boolean;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Description: string;
    public ExternalBankAccountNumber: string;
    public StatusCode: number;
    public DueDate: LocalDate;
    public ToBankAccountID: number;
    public CurrencyCodeID: number;
    public InvoiceNumber: string;
    public AmountCurrency: number;
    public Deleted: boolean;
    public BankChargeAmount: number;
    public OcrPaymentStrings: string;
    public IsExternal: boolean;
    public PaymentDate: LocalDate;
    public XmlTagEndToEndIdReference: string;
    public FromBankAccountID: number;
    public Domain: string;
    public Debtor: string;
    public Amount: number;
    public PaymentNotificationReportFileID: number;
    public JournalEntryID: number;
    public PaymentID: string;
    public PaymentCodeID: number;
    public CustomerInvoiceReminderID: number;
    public StatusText: string;
    public XmlTagPmtInfIdReference: string;
    public BusinessRelationID: number;
    public UpdatedAt: Date;
    public PaymentBatchID: number;
    public SupplierInvoiceID: number;
    public IsPaymentCancellationRequest: boolean;
    public ReconcilePayment: boolean;
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

    public TransferredDate: Date;
    public HashValue: string;
    public PaymentStatusReportFileID: number;
    public ID: number;
    public IsCustomerPayment: boolean;
    public CreatedBy: string;
    public Camt054CMsgId: string;
    public OcrHeadingStrings: string;
    public CreatedAt: Date;
    public OcrTransmissionNumber: number;
    public StatusCode: number;
    public Deleted: boolean;
    public TotalAmount: number;
    public PaymentBatchTypeID: number;
    public NumberOfPayments: number;
    public ReceiptDate: Date;
    public PaymentFileID: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public PaymentReferenceID: string;
    public _createguid: string;
    public Payments: Array<Payment>;
    public PaymentBatchType: PaymentBatchType;
    public CustomFields: any;
}


export class PostPost extends UniEntity {
    public static RelativeUrl = 'postposts';
    public static EntityType = 'PostPost';

    public JournalEntryLine2ID: number;
    public ID: number;
    public CurrencyExchangeRate: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public StatusCode: number;
    public CurrencyCodeID: number;
    public AmountCurrency: number;
    public Deleted: boolean;
    public Amount: number;
    public Date: LocalDate;
    public JournalEntryLine1ID: number;
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

    public OwnCostAmount: number;
    public ReInvoicingType: number;
    public ID: number;
    public CreatedBy: string;
    public TaxExclusiveAmount: number;
    public CreatedAt: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public OwnCostShare: number;
    public ProductID: number;
    public TaxInclusiveAmount: number;
    public UpdatedAt: Date;
    public SupplierInvoiceID: number;
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

    public ReInvoiceID: number;
    public CustomerID: number;
    public Surcharge: number;
    public Vat: number;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public GrossAmount: number;
    public NetAmount: number;
    public StatusCode: number;
    public Deleted: boolean;
    public Share: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public Customer: Customer;
    public CustomFields: any;
}


export class SupplierInvoice extends UniEntity {
    public static RelativeUrl = 'supplierinvoices';
    public static EntityType = 'SupplierInvoice';

    public IsSentToPayment: boolean;
    public Comment: string;
    public Requisition: string;
    public ReInvoiceID: number;
    public InvoiceAddressLine3: string;
    public PayableRoundingCurrencyAmount: number;
    public SupplierOrgNumber: string;
    public SalesPerson: string;
    public ShippingCity: string;
    public InvoiceType: number;
    public ShippingAddressLine1: string;
    public ShippingCountryCode: string;
    public ID: number;
    public ShippingAddressLine2: string;
    public DeliveryTerm: string;
    public TaxExclusiveAmountCurrency: number;
    public RestAmount: number;
    public PaymentTermsID: number;
    public ShippingCountry: string;
    public CurrencyExchangeRate: number;
    public ShippingAddressLine3: string;
    public InvoiceReferenceID: number;
    public InvoiceCountry: string;
    public CreatedBy: string;
    public RestAmountCurrency: number;
    public VatTotalsAmount: number;
    public TaxExclusiveAmount: number;
    public SupplierID: number;
    public CreatedAt: Date;
    public InvoiceCity: string;
    public InvoiceCountryCode: string;
    public DeliveryTermsID: number;
    public CreditedAmountCurrency: number;
    public FreeTxt: string;
    public YourReference: string;
    public StatusCode: number;
    public CreditDays: number;
    public DeliveryDate: LocalDate;
    public CurrencyCodeID: number;
    public PaymentInformation: string;
    public InvoiceNumber: string;
    public BankAccountID: number;
    public InternalNote: string;
    public DeliveryMethod: string;
    public InvoiceAddressLine1: string;
    public TaxInclusiveAmountCurrency: number;
    public PayableRoundingAmount: number;
    public Deleted: boolean;
    public CreditedAmount: number;
    public AmountRegards: string;
    public ProjectID: number;
    public OurReference: string;
    public ShippingPostalCode: string;
    public CustomerPerson: string;
    public VatTotalsAmountCurrency: number;
    public PaymentStatus: number;
    public InvoicePostalCode: string;
    public PaymentTerm: string;
    public PrintStatus: number;
    public InvoiceDate: LocalDate;
    public DeliveryName: string;
    public DefaultDimensionsID: number;
    public PaymentDueDate: LocalDate;
    public Payment: string;
    public JournalEntryID: number;
    public PaymentID: string;
    public ReInvoiced: boolean;
    public InvoiceOriginType: SupplierInvoiceOriginType;
    public TaxInclusiveAmount: number;
    public InvoiceAddressLine2: string;
    public InvoiceReceiverName: string;
    public UpdatedAt: Date;
    public CustomerOrgNumber: string;
    public UpdatedBy: string;
    public Credited: boolean;
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

    public SumTotalExVat: number;
    public Comment: string;
    public SumTotalIncVatCurrency: number;
    public SumTotalIncVat: number;
    public ItemText: string;
    public VatTypeID: number;
    public NumberOfItems: number;
    public PriceExVat: number;
    public ID: number;
    public CurrencyExchangeRate: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public DiscountPercent: number;
    public Unit: string;
    public DimensionsID: number;
    public PriceIncVat: number;
    public StatusCode: number;
    public CurrencyCodeID: number;
    public DiscountCurrency: number;
    public Deleted: boolean;
    public PriceSetByUser: boolean;
    public ProductID: number;
    public InvoicePeriodStartDate: LocalDate;
    public VatPercent: number;
    public InvoicePeriodEndDate: LocalDate;
    public CalculateGrossPriceBasedOnNetPrice: boolean;
    public SortIndex: number;
    public AccountingCost: string;
    public SumTotalExVatCurrency: number;
    public UpdatedAt: Date;
    public SumVatCurrency: number;
    public SumVat: number;
    public SupplierInvoiceID: number;
    public PriceExVatCurrency: number;
    public UpdatedBy: string;
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

    public ID: number;
    public CreatedBy: string;
    public No: string;
    public CreatedAt: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class VatDeduction extends UniEntity {
    public static RelativeUrl = 'vatdeductions';
    public static EntityType = 'VatDeduction';

    public ValidFrom: LocalDate;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public ValidTo: LocalDate;
    public DeductionPercent: number;
    public UpdatedAt: Date;
    public VatDeductionGroupID: number;
    public UpdatedBy: string;
    public _createguid: string;
    public VatDeductionGroup: VatDeductionGroup;
    public CustomFields: any;
}


export class VatDeductionGroup extends UniEntity {
    public static RelativeUrl = 'vatdeductiongroups';
    public static EntityType = 'VatDeductionGroup';

    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class VatPost extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'VatPost';

    public VatCodeGroupID: number;
    public ReportAsNegativeAmount: boolean;
    public ID: number;
    public CreatedBy: string;
    public No: string;
    public CreatedAt: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public HasTaxBasis: boolean;
    public UpdatedAt: Date;
    public UpdatedBy: string;
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

    public Comment: string;
    public ID: number;
    public Title: string;
    public ReportedDate: Date;
    public CreatedBy: string;
    public CreatedAt: Date;
    public VatReportArchivedSummaryID: number;
    public StatusCode: number;
    public Deleted: boolean;
    public InternalComment: string;
    public ExternalRefNo: string;
    public TerminPeriodID: number;
    public JournalEntryID: number;
    public ExecutedDate: Date;
    public VatReportTypeID: number;
    public UpdatedAt: Date;
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

    public PaymentPeriod: string;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public PaymentBankAccountNumber: string;
    public PaymentToDescription: string;
    public PaymentYear: number;
    public PaymentDueDate: Date;
    public AmountToBeReceived: number;
    public PaymentID: string;
    public ReportName: string;
    public SummaryHeader: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public AmountToBePayed: number;
    public _createguid: string;
    public CustomFields: any;
}


export class VatReportReference extends UniEntity {
    public static RelativeUrl = 'vatreportreferences';
    public static EntityType = 'VatReportReference';

    public VatTypeID: number;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public StatusCode: number;
    public VatPostID: number;
    public Deleted: boolean;
    public AccountID: number;
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

    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class VatType extends UniEntity {
    public static RelativeUrl = 'vattypes';
    public static EntityType = 'VatType';

    public OutgoingAccountID: number;
    public VatCodeGroupID: number;
    public OutputVat: boolean;
    public ID: number;
    public ReversedTaxDutyVat: boolean;
    public CreatedBy: string;
    public AvailableInModules: boolean;
    public VatTypeSetupID: number;
    public CreatedAt: Date;
    public VatCode: string;
    public StatusCode: number;
    public IncomingAccountID: number;
    public Deleted: boolean;
    public InUse: boolean;
    public Locked: boolean;
    public DirectJournalEntryOnly: boolean;
    public VatCodeGroupingValue: VatCodeGroupingValueEnum;
    public Alias: string;
    public UpdatedAt: Date;
    public Visible: boolean;
    public UpdatedBy: string;
    public Name: string;
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

    public ValidFrom: LocalDate;
    public VatTypeID: number;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public VatPercent: number;
    public ValidTo: LocalDate;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class EntityValidationRule extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'EntityValidationRule';

    public Operation: OperationType;
    public Operator: Operator;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public EntityType: string;
    public ChangedByCompany: boolean;
    public Deleted: boolean;
    public System: boolean;
    public Value: string;
    public Level: ValidationLevel;
    public PropertyName: string;
    public OnConflict: OnConflict;
    public Message: string;
    public UpdatedAt: Date;
    public SyncKey: string;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class EntityValidationRuleTemplate extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'EntityValidationRuleTemplate';

    public Operation: OperationType;
    public Operator: Operator;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public EntityType: string;
    public ChangedByCompany: boolean;
    public Deleted: boolean;
    public System: boolean;
    public Value: string;
    public Level: ValidationLevel;
    public PropertyName: string;
    public OnConflict: OnConflict;
    public Message: string;
    public UpdatedAt: Date;
    public SyncKey: string;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class ComplexValidationRule extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ComplexValidationRule';

    public Operation: OperationType;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public ValidationCode: number;
    public EntityType: string;
    public ChangedByCompany: boolean;
    public Deleted: boolean;
    public System: boolean;
    public Level: ValidationLevel;
    public OnConflict: OnConflict;
    public Message: string;
    public UpdatedAt: Date;
    public SyncKey: string;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class ComplexValidationRuleTemplate extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ComplexValidationRuleTemplate';

    public Operation: OperationType;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public ValidationCode: number;
    public EntityType: string;
    public ChangedByCompany: boolean;
    public Deleted: boolean;
    public System: boolean;
    public Level: ValidationLevel;
    public OnConflict: OnConflict;
    public Message: string;
    public UpdatedAt: Date;
    public SyncKey: string;
    public UpdatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class CustomField extends UniEntity {
    public static RelativeUrl = 'custom-fields';
    public static EntityType = 'CustomField';

    public DataType: string;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public ModelID: number;
    public Nullable: boolean;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public CustomFields: any;
}


export class ValueList extends UniEntity {
    public static RelativeUrl = 'valuelists';
    public static EntityType = 'ValueList';

    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Description: string;
    public Deleted: boolean;
    public Code: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Name: string;
    public _createguid: string;
    public Items: Array<ValueItem>;
    public CustomFields: any;
}


export class ValueItem extends UniEntity {
    public static RelativeUrl = 'valueitems';
    public static EntityType = 'ValueItem';

    public ID: number;
    public ValueListID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Description: string;
    public Index: number;
    public Deleted: boolean;
    public Code: string;
    public Value: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Name: string;
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

    public LookupField: boolean;
    public ReadOnly: boolean;
    public FieldType: FieldType;
    public Section: number;
    public ID: number;
    public Property: string;
    public CreatedBy: string;
    public LineBreak: boolean;
    public CreatedAt: Date;
    public ValueList: string;
    public Description: string;
    public Legend: string;
    public StatusCode: number;
    public HelpText: string;
    public Width: string;
    public EntityType: string;
    public DisplayField: string;
    public Deleted: boolean;
    public Hidden: boolean;
    public Alignment: Alignment;
    public Placeholder: string;
    public Sectionheader: string;
    public Placement: number;
    public ComponentLayoutID: number;
    public Label: string;
    public FieldSet: number;
    public Combo: number;
    public Options: string;
    public Url: string;
    public UpdatedAt: Date;
    public LookupEntityType: string;
    public UpdatedBy: string;
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
    public Overtime: number;
    public IsWeekend: boolean;
    public EndTime: Date;
    public ValidTimeOff: number;
    public Flextime: number;
    public WeekDay: number;
    public WeekNumber: number;
    public StartTime: Date;
    public Workflow: TimesheetWorkflow;
    public Projecttime: number;
    public TotalTime: number;
    public ValidTime: number;
    public TimeOff: number;
    public Invoicable: number;
    public SickTime: number;
    public Date: Date;
    public Status: WorkStatus;
    public ExpectedTime: number;
}


export class WorkBalanceDto extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'WorkBalanceDto';

    public ValidFrom: Date;
    public ID: number;
    public ValidTimeOff: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Minutes: number;
    public Description: string;
    public IsStartBalance: boolean;
    public StatusCode: number;
    public ExpectedMinutes: number;
    public Days: number;
    public Balancetype: WorkBalanceTypeEnum;
    public Deleted: boolean;
    public SumOvertime: number;
    public BalanceDate: Date;
    public WorkRelationID: number;
    public LastDayActual: number;
    public LastDayExpected: number;
    public ActualMinutes: number;
    public UpdatedAt: Date;
    public BalanceFrom: Date;
    public UpdatedBy: string;
    public _createguid: string;
    public Previous: BalanceInfo;
    public Details: Array<FlexDetail>;
    public WorkRelation: WorkRelation;
    public CustomFields: any;
}


export class BalanceInfo extends UniEntity {
    public ID: number;
    public Minutes: number;
    public Description: string;
    public BalanceDate: Date;
}


export class FlexDetail extends UniEntity {
    public WorkedMinutes: number;
    public IsWeekend: boolean;
    public ValidTimeOff: number;
    public ExpectedMinutes: number;
    public Date: Date;
}


export class ContactSearchServiceResponse extends UniEntity {
    public ErrorMessage: string;
    public Success: boolean;
    public Method: string;
    public ObjectName: string;
    public ErrorCode: number;
}


export class InvoicesAndRemindersReadyToRemind extends UniEntity {
    public CustomerInvoiceID: number;
    public CustomerNumber: number;
    public CustomerID: number;
    public CurrencyCodeShortCode: string;
    public RestAmount: number;
    public CurrencyExchangeRate: number;
    public RestAmountCurrency: number;
    public StatusCode: number;
    public DueDate: Date;
    public CurrencyCodeID: number;
    public InvoiceNumber: number;
    public TaxInclusiveAmountCurrency: number;
    public ExternalReference: string;
    public EmailAddress: string;
    public InvoiceDate: Date;
    public ReminderNumber: number;
    public CurrencyCodeCode: string;
    public CustomerName: string;
    public Fee: number;
    public DontSendReminders: boolean;
    public CustomerInvoiceReminderID: number;
    public TaxInclusiveAmount: number;
    public Interest: number;
}


export class CanDistributeReminderResult extends UniEntity {
    public HasPrintService: boolean;
    public CanDistributeAllRemindersUsingPlan: boolean;
    public AlreadySentCount: number;
    public RemindersWithDistributionPlan: number;
    public RemindersWithEmail: number;
    public RemindersWithPrint: number;
}


export class DistributeInvoiceReminderInput extends UniEntity {
    public SendByDistributionPlanFirst: boolean;
    public CasehandlerEmail: string;
    public SendByEmailIfPossible: boolean;
    public SendByPrintServiceIfPossible: boolean;
    public SendRemainingToCasehandler: boolean;
}


export class TradeHeaderCalculationSummary extends UniEntity {
    public SumTotalExVat: number;
    public DecimalRoundingCurrency: number;
    public SumTotalIncVatCurrency: number;
    public SumTotalIncVat: number;
    public SumNoVatBasis: number;
    public DecimalRounding: number;
    public SumVatBasis: number;
    public SumNoVatBasisCurrency: number;
    public SumDiscount: number;
    public SumVatBasisCurrency: number;
    public SumDiscountCurrency: number;
    public SumTotalExVatCurrency: number;
    public SumVatCurrency: number;
    public SumVat: number;
}


export class VatCalculationSummary extends UniEntity {
    public SumVatBasis: number;
    public SumVatBasisCurrency: number;
    public VatPercent: number;
    public SumVatCurrency: number;
    public SumVat: number;
}


export class InvoicePaymentData extends UniEntity {
    public CurrencyExchangeRate: number;
    public AgioAccountID: number;
    public DimensionsID: number;
    public CurrencyCodeID: number;
    public AmountCurrency: number;
    public BankChargeAmount: number;
    public PaymentDate: LocalDate;
    public FromBankAccountID: number;
    public BankChargeAccountID: number;
    public Amount: number;
    public AgioAmount: number;
    public AccountID: number;
    public PaymentID: string;
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
    public JournalEntryLineID: number;
    public FinancialDate: LocalDate;
    public Description: string;
    public AmountCurrency: number;
    public Amount: number;
    public JournalEntryID: number;
    public JournalEntryNumber: string;
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
    public ReasonDescription: string;
    public ReasonCode: string;
    public ReasonHelpLink: string;
}


export class AmountDetail extends UniEntity {
    public Currency: string;
    public Amount: number;
}


export class Limits extends UniEntity {
    public Limit: number;
    public RemainingLimit: number;
    public MaxInvoiceAmount: number;
}


export class AmeldingAgaAndTaxSums extends UniEntity {
    public period: number;
    public TaxDraw: number;
    public DueDate: Date;
    public GarnishmentTax: number;
    public KIDFinancialTax: string;
    public EmploymentTax: number;
    public MessageID: string;
    public KIDGarnishment: string;
    public AccountNumber: string;
    public KIDTaxDraw: string;
    public KIDEmploymentTax: string;
    public FinancialTax: number;
}


export class PayrollRunInAmeldingPeriod extends UniEntity {
    public PayrollrunID: number;
    public PayrollrunDescription: string;
    public AmeldingSentdate: Date;
    public CanGenerateAddition: boolean;
    public PayrollrunPaydate: Date;
}


export class PayAgaTaxDTO extends UniEntity {
    public payDate: Date;
    public correctPennyDiff: boolean;
    public payGarnishment: boolean;
    public payAga: boolean;
    public payTaxDraw: boolean;
    public payFinancialTax: boolean;
}


export class AmeldingSumUp extends UniEntity {
    public LegalEntityNo: string;
    public year: number;
    public sent: Date;
    public ID: number;
    public period: number;
    public type: AmeldingType;
    public generated: Date;
    public Replaces: string;
    public status: AmeldingStatus;
    public meldingsID: string;
    public ReplacesAMeldingID: number;
    public altInnStatus: string;
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
    public startDate: Date;
    public type: string;
    public endDate: Date;
    public permisjon: Array<EmploymentLeaves>;
}


export class EmploymentLeaves extends UniEntity {
    public permisjonsId: string;
    public sluttdato: Date;
    public startdato: Date;
    public beskrivelse: string;
    public permisjonsprosent: string;
}


export class TransactionTypes extends UniEntity {
    public incomeType: string;
    public tax: boolean;
    public Base_EmploymentTax: boolean;
    public description: string;
    public benefit: string;
    public amount: number;
}


export class AGADetails extends UniEntity {
    public baseAmount: number;
    public zoneName: string;
    public type: string;
    public rate: number;
    public sectorName: string;
}


export class Totals extends UniEntity {
    public sumTax: number;
    public sumAGA: number;
    public sumUtleggstrekk: number;
}


export class AnnualStatement extends UniEntity {
    public EmployeeMunicipalNumber: string;
    public EmployerCity: string;
    public Year: number;
    public EmployerPostCode: string;
    public EmployeeSSn: string;
    public EmployeeNumber: number;
    public EmployeeAddress: string;
    public EmployerName: string;
    public VacationPayBase: number;
    public EmployerOrgNr: string;
    public EmployerAddress: string;
    public EmployeeMunicipalName: string;
    public EmployerCountryCode: string;
    public EmployerPhoneNumber: string;
    public EmployeePostCode: string;
    public EmployerWebAddress: string;
    public EmployerEmail: string;
    public EmployerTaxMandatory: boolean;
    public EmployeeCity: string;
    public EmployeeName: string;
    public EmployerCountry: string;
    public Contributions: Array<AnnualStatementLine>;
    public PensionOrBenefits: Array<AnnualStatementLine>;
    public Deductions: Array<AnnualStatementLine>;
    public Draws: Array<AnnualStatementLine>;
}


export class AnnualStatementLine extends UniEntity {
    public SupplementPackageName: string;
    public Description: string;
    public Sum: number;
    public Amount: number;
    public LineIndex: number;
    public IsDeduction: boolean;
    public TaxReturnPost: string;
    public Supplements: Array<SupplementInfo>;
}


export class SupplementInfo extends UniEntity {
    public ValueBool: boolean;
    public ValueString: string;
    public ValueMoney: number;
    public ValueType: Valuetype;
    public ValueDate2: Date;
    public WageTypeSupplementID: number;
    public Name: string;
    public ValueDate: Date;
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
    public info: string;
    public year: number;
    public employeeNumber: number;
    public employeeID: number;
    public status: string;
    public ssn: string;
    public changedFields: Array<FieldsChanged>;
}


export class FieldsChanged extends UniEntity {
    public fieldName: string;
    public valFrom: string;
    public valTo: string;
}


export class EmploymentHistoryRecord extends UniEntity {
    public MonthRate: number;
    public RegulativeGroupID: number;
    public ChangedAt: Date;
    public RegulativeStepNr: number;
    public HourRate: number;
    public WorkPercent: number;
}


export class CodeListRowsCodeListRow extends UniEntity {
    public Value2: string;
    public Value1: string;
    public Value3: string;
    public Code: string;
}


export class MonthlyPay extends UniEntity {
    public Period: number;
    public PeriodText: string;
    public BasicPay: number;
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
    public employeeID: number;
    public netPayment: number;
}


export class SumOnYear extends UniEntity {
    public advancePayment: number;
    public taxBase: number;
    public nonTaxableAmount: number;
    public grossPayment: number;
    public baseVacation: number;
    public employeeID: number;
    public paidHolidaypay: number;
    public pension: number;
    public sumTax: number;
    public netPayment: number;
    public usedNonTaxableAmount: number;
}


export class VacationPayLastYear extends UniEntity {
    public baseVacation: number;
    public employeeID: number;
    public paidHolidayPay: number;
}


export class SalaryTransactionPay extends UniEntity {
    public Withholding: number;
    public CompanyCity: string;
    public SalaryBankAccountID: number;
    public PaymentDate: Date;
    public CompanyName: string;
    public CompanyPostalCode: string;
    public CompanyBankAccountID: number;
    public TaxBankAccountID: number;
    public CompanyAddress: string;
    public PayList: Array<SalaryTransactionPayLine>;
    public SalaryBalancePayList: Array<SalaryBalancePayLine>;
}


export class SalaryTransactionPayLine extends UniEntity {
    public Tax: number;
    public City: string;
    public Address: string;
    public EmployeeNumber: number;
    public Account: string;
    public PostalCode: string;
    public EmployeeName: string;
    public NetPayment: number;
}


export class SalaryBalancePayLine extends UniEntity {
    public Kid: string;
    public Account: string;
    public Sum: number;
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
    public GroupByWageType: boolean;
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
    public CalculatedPayruns: number;
    public ToPeriod: number;
    public Year: number;
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
    public IncomeType: string;
    public HasEmploymentTax: boolean;
    public Description: string;
    public Benefit: string;
    public Sum: number;
    public WageTypeNumber: number;
    public WageTypeName: string;
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
    public UnionDraw: number;
    public OUO: number;
    public Name: string;
}


export class SalaryTransactionSums extends UniEntity {
    public paidPension: number;
    public Employee: number;
    public paidAdvance: number;
    public baseAGA: number;
    public tableTax: number;
    public grossPayment: number;
    public baseVacation: number;
    public calculatedFinancialTax: number;
    public calculatedAGA: number;
    public manualTax: number;
    public percentTax: number;
    public calculatedVacationPay: number;
    public basePercentTax: number;
    public baseTableTax: number;
    public Payrun: number;
    public netPayment: number;
}


export class SalaryTransactionPeriodSums extends UniEntity {
    public ToPeriod: number;
    public Year: number;
    public FromPeriod: number;
    public MunicipalName: string;
    public AgaZone: string;
    public AgaRate: number;
    public OrgNumber: string;
    public Sums: SalaryTransactionSums;
    public Aga: AGACalculation;
}


export class code extends UniEntity {
    public fordel: string;
    public inngaarIGrunnlagForTrekk: string;
    public utloeserArbeidsgiveravgift: string;
    public skatteOgAvgiftregel: string;
    public gmlcode: string;
    public gyldigfom: string;
    public postnr: string;
    public uninavn: string;
    public kunfranav: string;
    public gyldigtil: string;
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
    public LicenseKey: string;
    public ContractID: number;
    public IsTest: boolean;
    public ProductNames: string;
    public ContractType: number;
    public CopyFiles: boolean;
    public CompanyName: string;
    public TemplateCompanyKey: string;
    public CompanySettings: CompanySettings;
}


export class UserDto extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'UserDto';

    public ID: number;
    public PhoneNumber: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public GlobalIdentity: string;
    public StatusCode: number;
    public Email: string;
    public Deleted: boolean;
    public PermissionHandling: string;
    public BankIntegrationUserName: string;
    public IsAutobankAdmin: boolean;
    public LastLogin: Date;
    public UserName: string;
    public Protected: boolean;
    public HasAgreedToImportDisclaimer: boolean;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public DisplayName: string;
    public AuthPhoneNumber: string;
    public TwoFactorEnabled: boolean;
    public _createguid: string;
    public EndDate: Date;
    public License: UserLicenseInformation;
    public CustomFields: any;
}


export class UserLicenseInformation extends UniEntity {
    public Comment: string;
    public UserLicenseEndDate: Date;
    public UserLicenseKey: string;
    public GlobalIdentity: string;
    public Name: string;
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
    public ID: number;
    public StatusCode: LicenseEntityStatus;
    public Key: string;
    public ContactEmail: string;
    public ContractID: number;
    public EndDate: Date;
    public ContactPerson: string;
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
    public AgreementId: number;
    public HasAgreedToLicense: boolean;
}


export class CreateBankUserDTO extends UniEntity {
    public AdminPassword: string;
    public Password: string;
    public Phone: string;
    public AdminUserId: number;
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
    public PreferredLogin: string;
    public UserID: string;
    public UserPassword: string;
}


export class A06Options extends UniEntity {
    public ToPeriod: Maaned;
    public Year: number;
    public ReportType: ReportType;
    public IncludeEmployments: boolean;
    public FromPeriod: Maaned;
    public IncludeIncome: boolean;
    public IncludeInfoPerPerson: boolean;
}


export class A07Response extends UniEntity {
    public DataType: string;
    public Title: string;
    public Data: string;
    public DataName: string;
    public mainStatus: string;
    public Text: string;
}


export class SelfEmployed extends UniEntity {
    public year: number;
    public items: Array<SelfEmployedItem>;
}


export class SelfEmployedItem extends UniEntity {
    public number: string;
    public supplierID: number;
    public amount: number;
    public name: string;
}


export class SetIntegrationDataDto extends UniEntity {
    public ExternalId: string;
    public IntegrationKey: string;
}


export class CurrencyRateData extends UniEntity {
    public ExchangeRate: number;
    public Factor: number;
    public RateDateOld: LocalDate;
    public IsOverrideRate: boolean;
    public ExchangeRateOld: number;
    public RateDate: LocalDate;
    public FromCurrencyCode: CurrencyCode;
}


export class EmailDTO extends UniEntity {
    public ReportID: number;
    public FromAddress: string;
    public Subject: string;
    public Format: string;
    public CopyAddress: string;
    public Message: string;
    public Parameters: Array<ReportParameter>;
}


export class ReportParameter extends UniEntity {
    public Value: string;
    public Name: string;
}


export class DistributionPlanElementValidation extends UniEntity {
    public ElementType: DistributionPlanElementTypes;
    public Priority: number;
    public IsValid: boolean;
    public ElementTypeName: string;
    public PlanElement: DistributionPlanElement;
}


export class SendEmail extends UniEntity {
    public ReportID: number;
    public FromAddress: string;
    public EntityType: string;
    public Localization: string;
    public Subject: string;
    public ExternalReference: string;
    public EntityID: number;
    public CopyAddress: string;
    public ReportName: string;
    public Message: string;
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
    public Guid: string;
    public Title: string;
    public Description: string;
    public PubDate: string;
    public Category: string;
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
    public ExpectedMinutes: number;
    public ReportBalance: number;
    public TotalBalance: number;
    public MinutesWorked: number;
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
    public contactname: string;
    public contactemail: string;
    public contactphone: string;
    public orgno: string;
    public orgname: string;
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

    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public DimensionsID: number;
    public StatusCode: number;
    public journalEntryLineDraftID: number;
    public MissingOnlyWarningsDimensionsMessage: string;
    public Deleted: boolean;
    public MissingRequiredDimensionsMessage: string;
    public AccountID: number;
    public AccountNumber: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
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
    public LastDepreciation: LocalDate;
    public GroupCode: string;
    public Number: number;
    public CurrentValue: number;
    public BalanceAccountName: string;
    public GroupName: string;
    public BalanceAccountNumber: number;
    public Lifetime: number;
    public DepreciationAccountNumber: number;
    public Name: string;
    public Lines: Array<AssetReportLineDTO>;
}


export class AssetReportLineDTO extends UniEntity {
    public TypeID: number;
    public Type: string;
    public Value: number;
    public Date: LocalDate;
}


export class BankBalanceDto extends UniEntity {
    public IsMainAccountBalance: boolean;
    public Comment: string;
    public BalanceBooked: number;
    public IsTestData: boolean;
    public Date: Date;
    public AccountNumber: string;
    public BalanceAvailable: number;
}


export class BankData extends UniEntity {
    public AccountNumber: string;
    public IBAN: string;
    public Bank: Bank;
}


export class CreateBankIntegrationDTO extends UniEntity {
    public BankAcceptance: boolean;
    public ServiceProvider: number;
    public Bank: string;
    public BankAccountID: number;
    public TuserName: string;
    public Email: string;
    public Password: string;
    public RequireTwoStage: boolean;
    public Phone: string;
    public IsBankStatement: boolean;
    public IsOutgoing: boolean;
    public IsInbound: boolean;
    public IsBankBalance: boolean;
    public BankApproval: boolean;
    public UserName: string;
    public DisplayName: string;
    public BankAccounts: Array<BankAccountDTO>;
}


export class BankAccountDTO extends UniEntity {
    public Bic: string;
    public BBAN: string;
    public IsBankStatement: boolean;
    public IsOutgoing: boolean;
    public IsInbound: boolean;
    public IsBankBalance: boolean;
    public IBAN: string;
}


export class ZdataUpdateBankProperties extends UniEntity {
    public ServiceID: string;
    public Password: string;
    public IsBankStatement: boolean;
    public IsOutgoing: boolean;
    public IsInbound: boolean;
    public IsBankBalance: boolean;
}


export class AutobankUserDTO extends UniEntity {
    public UserID: number;
    public Password: string;
    public Phone: string;
    public IsAdmin: boolean;
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
    public JournalEntryLineID: number;
    public BankStatementEntryID: number;
    public Amount: number;
    public Group: string;
}


export class MatchRequest extends UniEntity {
    public JournalEntries: Array<MatchCandidate>;
    public BankEntries: Array<MatchCandidate>;
    public Settings: MatchSettings;
}


export class MatchCandidate extends UniEntity {
    public Closed: boolean;
    public ID: number;
    public IsBankEntry: boolean;
    public Amount: number;
    public Date: Date;
}


export class MatchSettings extends UniEntity {
    public MaxDayOffset: number;
    public MaxDelta: number;
}


export class ReconciliationStatus extends UniEntity {
    public NumberOfItems: number;
    public NumberOfUnReconciled: number;
    public FromDate: Date;
    public IsReconciled: boolean;
    public TotalUnreconciled: number;
    public TotalAmount: number;
    public AccountID: number;
    public Todate: Date;
}


export class BalanceDto extends UniEntity {
    public StartDate: Date;
    public Balance: number;
    public BalanceInStatement: number;
    public EndDate: Date;
}


export class BankfileFormat extends UniEntity {
    public FileExtension: string;
    public IsFixed: boolean;
    public LinePrefix: string;
    public IsXml: boolean;
    public Separator: string;
    public SkipRows: number;
    public Name: string;
    public CustomFormat: BankFileCustomFormat;
    public Columns: Array<BankfileColumn>;
}


export class BankfileColumn extends UniEntity {
    public FieldMapping: BankfileField;
    public Length: number;
    public DataType: BankfileDataType;
    public IsFallBack: boolean;
    public StartPos: number;
}


export class JournalSuggestion extends UniEntity {
    public BankStatementRuleID: number;
    public FinancialDate: LocalDate;
    public Description: string;
    public MatchWithEntryID: number;
    public Amount: number;
    public AccountID: number;
    public Account: Account;
}


export class ReportRow extends UniEntity {
    public Period11: number;
    public Period1: number;
    public Period8: number;
    public Period12: number;
    public SubGroupName: string;
    public BudPeriod4: number;
    public GroupNumber: number;
    public BudPeriod11: number;
    public ID: number;
    public Period4: number;
    public BudPeriod8: number;
    public Period10: number;
    public BudPeriod10: number;
    public BudPeriod1: number;
    public BudPeriod6: number;
    public BudgetAccumulated: number;
    public SumPeriodLastYear: number;
    public Period5: number;
    public SumPeriodAccumulated: number;
    public SumPeriod: number;
    public SumLastYear: number;
    public SumPeriodLastYearAccumulated: number;
    public BudPeriod2: number;
    public BudPeriod12: number;
    public BudPeriod3: number;
    public Sum: number;
    public Period7: number;
    public AccountName: string;
    public AccountYear: number;
    public Period9: number;
    public BudPeriod7: number;
    public PrecedingBalance: number;
    public Period2: number;
    public GroupName: string;
    public Period6: number;
    public AccountNumber: number;
    public BudPeriod5: number;
    public BudPeriod9: number;
    public IsSubTotal: boolean;
    public Period3: number;
    public BudgetSum: number;
    public SubGroupNumber: number;
}


export class BudgetImport extends UniEntity {
    public Budget: Budget;
}


export class LiquidityTableDTO extends UniEntity {
    public BankBalanceRefferance: BankBalanceType;
    public OverdueCustomerInvoices: number;
    public BankBalance: number;
    public OverdueSupplierInvoices: number;
    public Period: Array<DetailsDTO>;
}


export class DetailsDTO extends UniEntity {
    public Liquidity: number;
    public CustomPayments: number;
    public VAT: number;
    public Custumer: number;
    public Supplier: number;
    public Sum: number;
}


export class JournalEntryData extends UniEntity {
    public CustomerInvoiceID: number;
    public DebitVatTypeID: number;
    public VatDate: LocalDate;
    public NumberSeriesID: number;
    public SupplierInvoiceNo: string;
    public CurrencyID: number;
    public DebitAccountID: number;
    public CreditVatTypeID: number;
    public CreditAccountNumber: number;
    public FinancialDate: LocalDate;
    public CurrencyExchangeRate: number;
    public CreditAccountID: number;
    public JournalEntryNo: string;
    public Description: string;
    public StatusCode: number;
    public DueDate: LocalDate;
    public InvoiceNumber: string;
    public PostPostJournalEntryLineID: number;
    public AmountCurrency: number;
    public DebitAccountNumber: number;
    public JournalEntryDataAccrualID: number;
    public Amount: number;
    public VatDeductionPercent: number;
    public NumberSeriesTaskID: number;
    public JournalEntryID: number;
    public PaymentID: string;
    public CustomerOrderID: number;
    public SupplierInvoiceID: number;
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
    public SumCredit: number;
    public SumDebit: number;
    public SumBalance: number;
    public SumLedger: number;
    public SumTaxBasisAmount: number;
}


export class JournalEntryLinePostPostData extends UniEntity {
    public SumPostPostAmountCurrency: number;
    public MarkedAgainstJournalEntryNumber: string;
    public CurrencyCodeShortCode: string;
    public SubAccountName: string;
    public ID: number;
    public FinancialDate: Date;
    public RestAmount: number;
    public CurrencyExchangeRate: number;
    public RestAmountCurrency: number;
    public Description: string;
    public StatusCode: number;
    public DueDate: Date;
    public CurrencyCodeID: number;
    public MarkedAgainstJournalEntryLineID: number;
    public InvoiceNumber: string;
    public AmountCurrency: number;
    public SumPostPostAmount: number;
    public Amount: number;
    public AccountYear: number;
    public SubAccountNumber: number;
    public JournalEntryTypeName: string;
    public CurrencyCodeCode: string;
    public JournalEntryNumberNumeric: number;
    public PeriodNo: number;
    public NumberOfPayments: number;
    public JournalEntryID: number;
    public PaymentID: string;
    public JournalEntryNumber: string;
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
    public ID: number;
    public FinancialDate: Date;
    public RestAmount: number;
    public RestAmountCurrency: number;
    public StatusCode: StatusCodeJournalEntryLine;
    public InvoiceNumber: string;
    public AmountCurrency: number;
    public OriginalStatusCode: StatusCodeJournalEntryLine;
    public Amount: number;
    public OriginalRestAmount: number;
    public JournalEntryNumber: string;
    public Markings: Array<MarkingReference>;
}


export class MarkingReference extends UniEntity {
    public ID: number;
    public JournalEntryNumber: string;
}


export class SupplierInvoiceDetail extends UniEntity {
    public VatTypeID: number;
    public SupplierID: number;
    public VatCode: string;
    public Description: string;
    public DeliveryDate: Date;
    public InvoiceNumber: string;
    public AmountCurrency: number;
    public InvoiceDate: Date;
    public AccountName: string;
    public Amount: number;
    public VatPercent: number;
    public AccountID: number;
    public VatTypeName: string;
    public AccountNumber: number;
    public SupplierInvoiceID: number;
}


export class VatReportMessage extends UniEntity {
    public Level: ValidationLevel;
    public Message: string;
}


export class VatReportSummary extends UniEntity {
    public VatCodeGroupID: number;
    public VatCodeGroupNo: string;
    public SumVatAmount: number;
    public IsHistoricData: boolean;
    public NumberOfJournalEntryLines: number;
    public SumTaxBasisAmount: number;
    public VatCodeGroupName: string;
    public HasTaxBasis: boolean;
    public HasTaxAmount: boolean;
}


export class VatReportSummaryPerPost extends UniEntity {
    public VatPostReportAsNegativeAmount: boolean;
    public VatCodeGroupID: number;
    public VatPostNo: string;
    public VatCodeGroupNo: string;
    public SumVatAmount: number;
    public VatPostID: number;
    public IsHistoricData: boolean;
    public NumberOfJournalEntryLines: number;
    public SumTaxBasisAmount: number;
    public VatCodeGroupName: string;
    public HasTaxBasis: boolean;
    public VatPostName: string;
    public HasTaxAmount: boolean;
}


export class VatReportSummaryPerPostPerAccount extends UniEntity {
    public VatPostReportAsNegativeAmount: boolean;
    public VatCodeGroupID: number;
    public VatDate: Date;
    public VatJournalEntryPostAccountNumber: number;
    public VatPostNo: string;
    public VatJournalEntryPostAccountName: string;
    public VatCodeGroupNo: string;
    public SumVatAmount: number;
    public FinancialDate: Date;
    public VatAccountNumber: number;
    public VatJournalEntryPostAccountID: number;
    public VatCode: string;
    public Description: string;
    public VatAccountName: string;
    public VatPostID: number;
    public IsHistoricData: boolean;
    public NumberOfJournalEntryLines: number;
    public VatAccountID: number;
    public SumTaxBasisAmount: number;
    public Amount: number;
    public StdVatCode: string;
    public VatCodeGroupName: string;
    public HasTaxBasis: boolean;
    public JournalEntryNumber: string;
    public VatPostName: string;
    public HasTaxAmount: boolean;
    public TaxBasisAmount: number;
}


export class VatReportNotReportedJournalEntryData extends UniEntity {
    public SumVatAmount: number;
    public NumberOfJournalEntryLines: number;
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


export enum ForeignWorker{
    notSet = 0,
    ForeignWorkerUSA_Canada = 1,
    ForeignWorkerFixedAga = 2,
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


export enum ShipTradeArea{
    notSet = 0,
    Domestic = 1,
    Foreign = 2,
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
