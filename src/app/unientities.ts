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
    public EntityType: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public Verb: string;
    public Action: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Transaction: string;
    public Field: string;
    public OldValue: string;
    public CreatedBy: string;
    public ClientID: string;
    public Route: string;
    public NewValue: string;
    public EntityID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class WorkBalance extends UniEntity {
    public static RelativeUrl = 'workbalances';
    public static EntityType = 'WorkBalance';

    public ID: number;
    public Minutes: number;
    public Description: string;
    public UpdatedAt: Date;
    public ActualMinutes: number;
    public ValidTimeOff: number;
    public WorkRelationID: number;
    public Deleted: boolean;
    public Days: number;
    public BalanceDate: Date;
    public CreatedAt: Date;
    public Balancetype: WorkBalanceTypeEnum;
    public UpdatedBy: string;
    public StatusCode: number;
    public ExpectedMinutes: number;
    public CreatedBy: string;
    public IsStartBalance: boolean;
    public BalanceFrom: Date;
    public ValidFrom: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class Worker extends UniEntity {
    public static RelativeUrl = 'workers';
    public static EntityType = 'Worker';

    public ID: number;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public BusinessRelationID: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public EmployeeID: number;
    public CreatedBy: string;
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

    public ID: number;
    public Minutes: number;
    public Description: string;
    public UpdatedAt: Date;
    public WorkTypeID: number;
    public WorkRelationID: number;
    public Invoiceable: boolean;
    public WorkItemGroupID: number;
    public Deleted: boolean;
    public Date: Date;
    public OrderItemId: number;
    public StartTime: Date;
    public DimensionsID: number;
    public TransferedToOrder: boolean;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Label: string;
    public StatusCode: number;
    public TransferedToPayroll: boolean;
    public EndTime: Date;
    public CreatedBy: string;
    public PayrollTrackingID: number;
    public CustomerID: number;
    public CustomerOrderID: number;
    public MinutesToOrder: number;
    public LunchInMinutes: number;
    public PriceExVat: number;
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
    public WorkRelationID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public UpdatedBy: string;
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

    public ID: number;
    public Name: string;
    public UpdatedAt: Date;
    public LunchIncluded: boolean;
    public Deleted: boolean;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public MinutesPerYear: number;
    public CreatedBy: string;
    public MinutesPerWeek: number;
    public IsShared: boolean;
    public MinutesPerMonth: number;
    public _createguid: string;
    public CustomFields: any;
}


export class WorkRelation extends UniEntity {
    public static RelativeUrl = 'workrelations';
    public static EntityType = 'WorkRelation';

    public ID: number;
    public IsPrivate: boolean;
    public Description: string;
    public StartDate: Date;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public TeamID: number;
    public WorkProfileID: number;
    public WorkerID: number;
    public CompanyID: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public EndTime: Date;
    public CreatedBy: string;
    public CompanyName: string;
    public WorkPercentage: number;
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

    public ID: number;
    public Description: string;
    public UpdatedAt: Date;
    public WorkRelationID: number;
    public Deleted: boolean;
    public TimeoffType: number;
    public FromDate: Date;
    public IsHalfDay: boolean;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
    public SystemKey: string;
    public ToDate: Date;
    public RegionKey: string;
    public _createguid: string;
    public CustomFields: any;
}


export class WorkType extends UniEntity {
    public static RelativeUrl = 'worktypes';
    public static EntityType = 'WorkType';

    public ID: number;
    public Description: string;
    public Name: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public Price: number;
    public WagetypeNumber: number;
    public ProductID: number;
    public SystemType: WorkTypeEnum;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
    public _createguid: string;
    public Product: Product;
    public CustomFields: any;
}


export class BankFile extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'BankFile';

    public ID: number;
    public Accountnumber: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public FileID: number;
    public CreatedBy: string;
    public ParentFileid: number;
    public SubCompanyID: number;
    public _createguid: string;
    public File: File;
    public SubCompany: SubCompany;
    public CustomFields: any;
}


export class BatchInvoice extends UniEntity {
    public static RelativeUrl = 'batchinvoices';
    public static EntityType = 'BatchInvoice';

    public ID: number;
    public Processed: number;
    public NumberOfBatches: number;
    public DueDate: LocalDate;
    public Comment: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public Operation: BatchInvoiceOperation;
    public InvoiceDate: LocalDate;
    public SellerID: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public OurRef: string;
    public CreatedBy: string;
    public FreeTxt: string;
    public NotifyEmail: boolean;
    public YourRef: string;
    public MinAmount: number;
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
    public BatchInvoiceID: number;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public CommentID: number;
    public CustomerInvoiceID: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: StatusCode;
    public CreatedBy: string;
    public BatchNumber: number;
    public CustomerOrderID: number;
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
    public UpdatedAt: Date;
    public Deleted: boolean;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
    public EntityName: string;
    public Template: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Customer extends UniEntity {
    public static RelativeUrl = 'customers';
    public static EntityType = 'Customer';

    public ID: number;
    public PaymentTermsID: number;
    public IsPrivate: boolean;
    public DeliveryTermsID: number;
    public CustomerNumber: number;
    public DontSendReminders: boolean;
    public Localization: string;
    public FactoringNumber: number;
    public UpdatedAt: Date;
    public AvtaleGiro: boolean;
    public Deleted: boolean;
    public EInvoiceAgreementReference: string;
    public ReminderEmailAddress: string;
    public AvtaleGiroNotification: boolean;
    public BusinessRelationID: number;
    public WebUrl: string;
    public DimensionsID: number;
    public DefaultCustomerInvoiceReportID: number;
    public PeppolAddress: string;
    public DefaultDistributionsID: number;
    public SocialSecurityNumber: string;
    public DefaultCustomerQuoteReportID: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public DefaultSellerID: number;
    public CreatedBy: string;
    public SubAccountNumberSeriesID: number;
    public EfakturaIdentifier: string;
    public AcceptableDelta4CustomerPayment: number;
    public GLN: string;
    public CustomerInvoiceReminderSettingsID: number;
    public OrgNumber: string;
    public CurrencyCodeID: number;
    public AcceptableDelta4CustomerPaymentAccountID: number;
    public CustomerNumberKidAlias: string;
    public CreditDays: number;
    public DefaultCustomerOrderReportID: number;
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

    public ID: number;
    public RestAmountCurrency: number;
    public PaymentTermsID: number;
    public AmountRegards: string;
    public DeliveryName: string;
    public OurReference: string;
    public InvoiceCountry: string;
    public SupplierOrgNumber: string;
    public DeliveryTermsID: number;
    public InvoiceReferenceID: number;
    public DefaultDimensionsID: number;
    public DontSendReminders: boolean;
    public UseReportID: number;
    public InvoiceCity: string;
    public Comment: string;
    public CustomerName: string;
    public PaymentTerm: string;
    public DeliveryDate: LocalDate;
    public UpdatedAt: Date;
    public SalesPerson: string;
    public InvoiceAddressLine1: string;
    public PaymentInfoTypeID: number;
    public ShippingCountry: string;
    public InvoiceAddressLine2: string;
    public Deleted: boolean;
    public JournalEntryID: number;
    public PaymentID: string;
    public InvoiceDate: LocalDate;
    public InvoicePostalCode: string;
    public InvoiceNumberSeriesID: number;
    public DeliveryMethod: string;
    public PayableRoundingCurrencyAmount: number;
    public CreditedAmount: number;
    public PaymentInformation: string;
    public Requisition: string;
    public PaymentDueDate: LocalDate;
    public DistributionPlanID: number;
    public ShippingCity: string;
    public YourReference: string;
    public CustomerOrgNumber: string;
    public InvoiceAddressLine3: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public TaxExclusiveAmount: number;
    public AccrualID: number;
    public ShippingAddressLine1: string;
    public InvoiceNumber: string;
    public InternalNote: string;
    public BankAccountID: number;
    public InvoiceCountryCode: string;
    public DefaultSellerID: number;
    public CreatedBy: string;
    public TaxExclusiveAmountCurrency: number;
    public EmailAddress: string;
    public ShippingAddressLine2: string;
    public ShippingCountryCode: string;
    public ShippingAddressLine3: string;
    public FreeTxt: string;
    public VatTotalsAmountCurrency: number;
    public PrintStatus: number;
    public CurrencyExchangeRate: number;
    public CustomerID: number;
    public Payment: string;
    public VatTotalsAmount: number;
    public ExternalReference: string;
    public CreditedAmountCurrency: number;
    public CurrencyCodeID: number;
    public DeliveryTerm: string;
    public ShippingPostalCode: string;
    public TaxInclusiveAmountCurrency: number;
    public RestAmount: number;
    public PayableRoundingAmount: number;
    public UpdateCurrencyAmountsOnDateChange: boolean;
    public ExternalStatus: number;
    public InvoiceReceiverName: string;
    public Credited: boolean;
    public CollectorStatusCode: number;
    public CreditDays: number;
    public CustomerPerson: string;
    public TaxInclusiveAmount: number;
    public InvoiceType: number;
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
    public SumTotalExVatCurrency: number;
    public DiscountCurrency: number;
    public SumTotalExVat: number;
    public PriceIncVat: number;
    public Comment: string;
    public ItemSourceID: number;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public NumberOfItems: number;
    public ItemText: string;
    public DiscountPercent: number;
    public SortIndex: number;
    public CalculateGrossPriceBasedOnNetPrice: boolean;
    public Unit: string;
    public ProductID: number;
    public SumVatCurrency: number;
    public DimensionsID: number;
    public AccountID: number;
    public CustomerInvoiceID: number;
    public CreatedAt: Date;
    public CostPrice: number;
    public UpdatedBy: string;
    public PriceSetByUser: boolean;
    public StatusCode: number;
    public VatPercent: number;
    public Discount: number;
    public CreatedBy: string;
    public AccountingCost: string;
    public PriceExVatCurrency: number;
    public InvoicePeriodStartDate: LocalDate;
    public CurrencyExchangeRate: number;
    public InvoicePeriodEndDate: LocalDate;
    public CurrencyCodeID: number;
    public VatTypeID: number;
    public SumTotalIncVatCurrency: number;
    public SumTotalIncVat: number;
    public SumVat: number;
    public PriceExVat: number;
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

    public ID: number;
    public DebtCollectionFeeCurrency: number;
    public RestAmountCurrency: number;
    public Description: string;
    public DueDate: LocalDate;
    public ReminderNumber: number;
    public InterestFeeCurrency: number;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public CreatedByReminderRuleID: number;
    public RunNumber: number;
    public Notified: boolean;
    public DimensionsID: number;
    public CustomerInvoiceID: number;
    public InterestFee: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public Title: string;
    public DebtCollectionFee: number;
    public CreatedBy: string;
    public ReminderFeeCurrency: number;
    public EmailAddress: string;
    public CurrencyExchangeRate: number;
    public RemindedDate: LocalDate;
    public CurrencyCodeID: number;
    public RestAmount: number;
    public ReminderFee: number;
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
    public ReminderNumber: number;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public MinimumDaysFromDueDate: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public Title: string;
    public CreatedBy: string;
    public CustomerInvoiceReminderSettingsID: number;
    public ReminderFee: number;
    public UseMaximumLegalReminderFee: boolean;
    public CreditDays: number;
    public _createguid: string;
    public CustomerInvoiceReminderSettings: CustomerInvoiceReminderSettings;
    public CustomFields: any;
}


export class CustomerInvoiceReminderSettings extends UniEntity {
    public static RelativeUrl = 'invoiceremindersettings';
    public static EntityType = 'CustomerInvoiceReminderSettings';

    public ID: number;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public MinimumAmountToRemind: number;
    public StatusCode: number;
    public CreatedBy: string;
    public DefaultReminderFeeAccountID: number;
    public DebtCollectionSettingsID: number;
    public RemindersBeforeDebtCollection: number;
    public AcceptPaymentWithoutReminderFee: boolean;
    public _createguid: string;
    public CustomerInvoiceReminderRules: Array<CustomerInvoiceReminderRule>;
    public DebtCollectionSettings: DebtCollectionSettings;
    public DefaultReminderFeeAccount: Account;
    public CustomFields: any;
}


export class CustomerOrder extends UniEntity {
    public static RelativeUrl = 'orders';
    public static EntityType = 'CustomerOrder';

    public ID: number;
    public RestAmountCurrency: number;
    public PaymentTermsID: number;
    public OrderDate: LocalDate;
    public DeliveryName: string;
    public OurReference: string;
    public InvoiceCountry: string;
    public SupplierOrgNumber: string;
    public DeliveryTermsID: number;
    public DefaultDimensionsID: number;
    public UseReportID: number;
    public InvoiceCity: string;
    public Comment: string;
    public CustomerName: string;
    public PaymentTerm: string;
    public DeliveryDate: LocalDate;
    public OrderNumber: number;
    public UpdatedAt: Date;
    public SalesPerson: string;
    public InvoiceAddressLine1: string;
    public PaymentInfoTypeID: number;
    public ShippingCountry: string;
    public InvoiceAddressLine2: string;
    public Deleted: boolean;
    public InvoicePostalCode: string;
    public DeliveryMethod: string;
    public PayableRoundingCurrencyAmount: number;
    public Requisition: string;
    public DistributionPlanID: number;
    public ShippingCity: string;
    public YourReference: string;
    public CustomerOrgNumber: string;
    public InvoiceAddressLine3: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public OrderNumberSeriesID: number;
    public TaxExclusiveAmount: number;
    public AccrualID: number;
    public UpdateCurrencyOnToInvoice: boolean;
    public ShippingAddressLine1: string;
    public ReadyToInvoice: boolean;
    public InternalNote: string;
    public InvoiceCountryCode: string;
    public DefaultSellerID: number;
    public CreatedBy: string;
    public TaxExclusiveAmountCurrency: number;
    public EmailAddress: string;
    public ShippingAddressLine2: string;
    public ShippingCountryCode: string;
    public RestExclusiveAmountCurrency: number;
    public ShippingAddressLine3: string;
    public FreeTxt: string;
    public VatTotalsAmountCurrency: number;
    public PrintStatus: number;
    public CurrencyExchangeRate: number;
    public CustomerID: number;
    public VatTotalsAmount: number;
    public CurrencyCodeID: number;
    public DeliveryTerm: string;
    public ShippingPostalCode: string;
    public TaxInclusiveAmountCurrency: number;
    public PayableRoundingAmount: number;
    public UpdateCurrencyAmountsOnDateChange: boolean;
    public InvoiceReceiverName: string;
    public CreditDays: number;
    public CustomerPerson: string;
    public TaxInclusiveAmount: number;
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
    public SumTotalExVatCurrency: number;
    public DiscountCurrency: number;
    public SumTotalExVat: number;
    public PriceIncVat: number;
    public Comment: string;
    public ItemSourceID: number;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public NumberOfItems: number;
    public ItemText: string;
    public DiscountPercent: number;
    public SortIndex: number;
    public CalculateGrossPriceBasedOnNetPrice: boolean;
    public Unit: string;
    public ProductID: number;
    public SumVatCurrency: number;
    public DimensionsID: number;
    public AccountID: number;
    public CreatedAt: Date;
    public CostPrice: number;
    public UpdatedBy: string;
    public PriceSetByUser: boolean;
    public StatusCode: number;
    public VatPercent: number;
    public ReadyToInvoice: boolean;
    public Discount: number;
    public CreatedBy: string;
    public PriceExVatCurrency: number;
    public CurrencyExchangeRate: number;
    public CustomerOrderID: number;
    public CurrencyCodeID: number;
    public VatTypeID: number;
    public SumTotalIncVatCurrency: number;
    public SumTotalIncVat: number;
    public SumVat: number;
    public PriceExVat: number;
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

    public ID: number;
    public PaymentTermsID: number;
    public DeliveryName: string;
    public OurReference: string;
    public InvoiceCountry: string;
    public SupplierOrgNumber: string;
    public DeliveryTermsID: number;
    public DefaultDimensionsID: number;
    public UseReportID: number;
    public InvoiceCity: string;
    public Comment: string;
    public UpdateCurrencyOnToOrder: boolean;
    public CustomerName: string;
    public PaymentTerm: string;
    public DeliveryDate: LocalDate;
    public UpdatedAt: Date;
    public SalesPerson: string;
    public InvoiceAddressLine1: string;
    public QuoteNumberSeriesID: number;
    public PaymentInfoTypeID: number;
    public ShippingCountry: string;
    public InvoiceAddressLine2: string;
    public Deleted: boolean;
    public InvoicePostalCode: string;
    public DeliveryMethod: string;
    public PayableRoundingCurrencyAmount: number;
    public Requisition: string;
    public DistributionPlanID: number;
    public QuoteNumber: number;
    public InquiryReference: number;
    public ShippingCity: string;
    public YourReference: string;
    public CustomerOrgNumber: string;
    public InvoiceAddressLine3: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public TaxExclusiveAmount: number;
    public UpdateCurrencyOnToInvoice: boolean;
    public ShippingAddressLine1: string;
    public InternalNote: string;
    public InvoiceCountryCode: string;
    public DefaultSellerID: number;
    public CreatedBy: string;
    public TaxExclusiveAmountCurrency: number;
    public EmailAddress: string;
    public ShippingAddressLine2: string;
    public ShippingCountryCode: string;
    public ShippingAddressLine3: string;
    public FreeTxt: string;
    public VatTotalsAmountCurrency: number;
    public PrintStatus: number;
    public CurrencyExchangeRate: number;
    public CustomerID: number;
    public QuoteDate: LocalDate;
    public ValidUntilDate: LocalDate;
    public VatTotalsAmount: number;
    public CurrencyCodeID: number;
    public DeliveryTerm: string;
    public ShippingPostalCode: string;
    public TaxInclusiveAmountCurrency: number;
    public PayableRoundingAmount: number;
    public UpdateCurrencyAmountsOnDateChange: boolean;
    public InvoiceReceiverName: string;
    public CreditDays: number;
    public CustomerPerson: string;
    public TaxInclusiveAmount: number;
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
    public SumTotalExVatCurrency: number;
    public DiscountCurrency: number;
    public SumTotalExVat: number;
    public PriceIncVat: number;
    public Comment: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public NumberOfItems: number;
    public ItemText: string;
    public DiscountPercent: number;
    public SortIndex: number;
    public CalculateGrossPriceBasedOnNetPrice: boolean;
    public Unit: string;
    public ProductID: number;
    public SumVatCurrency: number;
    public DimensionsID: number;
    public AccountID: number;
    public CreatedAt: Date;
    public CostPrice: number;
    public UpdatedBy: string;
    public PriceSetByUser: boolean;
    public StatusCode: number;
    public VatPercent: number;
    public Discount: number;
    public CreatedBy: string;
    public PriceExVatCurrency: number;
    public CurrencyExchangeRate: number;
    public CustomerQuoteID: number;
    public CurrencyCodeID: number;
    public VatTypeID: number;
    public SumTotalIncVatCurrency: number;
    public SumTotalIncVat: number;
    public SumVat: number;
    public PriceExVat: number;
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
    public UpdatedAt: Date;
    public CreditorNumber: number;
    public Deleted: boolean;
    public IntegrateWithDebtCollection: boolean;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public DebtCollectionFormat: number;
    public StatusCode: number;
    public CreatedBy: string;
    public CustomerInvoiceReminderSettingsID: number;
    public DebtCollectionAutomationID: number;
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
    public Deleted: boolean;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
    public _createguid: string;
    public Details: Array<ItemSourceDetail>;
    public CustomFields: any;
}


export class ItemSourceDetail extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ItemSourceDetail';

    public ID: number;
    public Description: string;
    public Amount: number;
    public ItemSourceID: number;
    public UpdatedAt: Date;
    public Tag: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public SourceType: string;
    public CreatedBy: string;
    public SourceFK: number;
    public _createguid: string;
    public CustomFields: any;
}


export class PaymentInfoType extends UniEntity {
    public static RelativeUrl = 'paymentinfotype';
    public static EntityType = 'PaymentInfoType';

    public ID: number;
    public Length: number;
    public Name: string;
    public Type: PaymentInfoTypeEnum;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public Control: Modulus;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public Locked: boolean;
    public CreatedBy: string;
    public _createguid: string;
    public PaymentInfoTypeParts: Array<PaymentInfoTypePart>;
    public CustomFields: any;
}


export class PaymentInfoTypePart extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'PaymentInfoTypePart';

    public ID: number;
    public Length: number;
    public UpdatedAt: Date;
    public PaymentInfoTypeID: number;
    public Deleted: boolean;
    public Part: string;
    public SortIndex: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class RecurringInvoice extends UniEntity {
    public static RelativeUrl = 'recurringinvoices';
    public static EntityType = 'RecurringInvoice';

    public ID: number;
    public PaymentTermsID: number;
    public AmountRegards: string;
    public DeliveryName: string;
    public OurReference: string;
    public InvoiceCountry: string;
    public SupplierOrgNumber: string;
    public DeliveryTermsID: number;
    public DefaultDimensionsID: number;
    public NoCreditDays: boolean;
    public Interval: number;
    public UseReportID: number;
    public InvoiceCity: string;
    public Comment: string;
    public CustomerName: string;
    public PaymentTerm: string;
    public DeliveryDate: LocalDate;
    public EndDate: LocalDate;
    public StartDate: LocalDate;
    public UpdatedAt: Date;
    public NotifyWhenRecurringEnds: boolean;
    public SalesPerson: string;
    public InvoiceAddressLine1: string;
    public PaymentInfoTypeID: number;
    public ShippingCountry: string;
    public InvoiceAddressLine2: string;
    public Deleted: boolean;
    public InvoicePostalCode: string;
    public InvoiceNumberSeriesID: number;
    public DeliveryMethod: string;
    public PayableRoundingCurrencyAmount: number;
    public PaymentInformation: string;
    public TimePeriod: RecurringPeriod;
    public Requisition: string;
    public NotifyWhenOrdersArePrepared: boolean;
    public DistributionPlanID: number;
    public MaxIterations: number;
    public ShippingCity: string;
    public YourReference: string;
    public CustomerOrgNumber: string;
    public InvoiceAddressLine3: string;
    public CreatedAt: Date;
    public NextInvoiceDate: LocalDate;
    public UpdatedBy: string;
    public StatusCode: number;
    public ProduceAs: RecurringResult;
    public TaxExclusiveAmount: number;
    public ShippingAddressLine1: string;
    public InternalNote: string;
    public InvoiceCountryCode: string;
    public DefaultSellerID: number;
    public CreatedBy: string;
    public PreparationDays: number;
    public NotifyUser: string;
    public TaxExclusiveAmountCurrency: number;
    public EmailAddress: string;
    public ShippingAddressLine2: string;
    public ShippingCountryCode: string;
    public ShippingAddressLine3: string;
    public FreeTxt: string;
    public VatTotalsAmountCurrency: number;
    public PrintStatus: number;
    public CurrencyExchangeRate: number;
    public CustomerID: number;
    public Payment: string;
    public VatTotalsAmount: number;
    public CurrencyCodeID: number;
    public DeliveryTerm: string;
    public ShippingPostalCode: string;
    public TaxInclusiveAmountCurrency: number;
    public PayableRoundingAmount: number;
    public UpdateCurrencyAmountsOnDateChange: boolean;
    public InvoiceReceiverName: string;
    public CreditDays: number;
    public CustomerPerson: string;
    public TaxInclusiveAmount: number;
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
    public SumTotalExVatCurrency: number;
    public DiscountCurrency: number;
    public SumTotalExVat: number;
    public PriceIncVat: number;
    public Comment: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public NumberOfItems: number;
    public ItemText: string;
    public ReduceIncompletePeriod: boolean;
    public DiscountPercent: number;
    public SortIndex: number;
    public CalculateGrossPriceBasedOnNetPrice: boolean;
    public Unit: string;
    public ProductID: number;
    public SumVatCurrency: number;
    public DimensionsID: number;
    public AccountID: number;
    public CreatedAt: Date;
    public TimeFactor: RecurringPeriod;
    public UpdatedBy: string;
    public PriceSetByUser: boolean;
    public StatusCode: number;
    public VatPercent: number;
    public RecurringInvoiceID: number;
    public Discount: number;
    public PricingSource: PricingSource;
    public CreatedBy: string;
    public PriceExVatCurrency: number;
    public CurrencyExchangeRate: number;
    public CurrencyCodeID: number;
    public VatTypeID: number;
    public SumTotalIncVatCurrency: number;
    public SumTotalIncVat: number;
    public SumVat: number;
    public PriceExVat: number;
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

    public ID: number;
    public NotifiedOrdersPrepared: boolean;
    public Comment: string;
    public UpdatedAt: Date;
    public IterationNumber: number;
    public Deleted: boolean;
    public InvoiceDate: LocalDate;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public OrderID: number;
    public RecurringInvoiceID: number;
    public CreatedBy: string;
    public NotifiedRecurringEnds: boolean;
    public CreationDate: LocalDate;
    public InvoiceID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class Seller extends UniEntity {
    public static RelativeUrl = 'sellers';
    public static EntityType = 'Seller';

    public ID: number;
    public DefaultDimensionsID: number;
    public Name: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public TeamID: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public EmployeeID: number;
    public CreatedBy: string;
    public UserID: number;
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
    public Percent: number;
    public Amount: number;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public CustomerInvoiceID: number;
    public SellerID: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public RecurringInvoiceID: number;
    public CreatedBy: string;
    public CustomerID: number;
    public CustomerQuoteID: number;
    public CustomerOrderID: number;
    public _createguid: string;
    public Seller: Seller;
    public CustomFields: any;
}


export class SubCompany extends UniEntity {
    public static RelativeUrl = 'subcompanies';
    public static EntityType = 'SubCompany';

    public ID: number;
    public CompanyType: CompanyRelation;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public CompanyID: number;
    public CreatedAt: Date;
    public CompanyKey: string;
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
    public CustomerID: number;
    public CompanyName: string;
    public _createguid: string;
    public Customer: Customer;
    public CustomFields: any;
}


export class Supplier extends UniEntity {
    public static RelativeUrl = 'suppliers';
    public static EntityType = 'Supplier';

    public ID: number;
    public SelfEmployed: boolean;
    public Localization: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public BusinessRelationID: number;
    public WebUrl: string;
    public DimensionsID: number;
    public PeppolAddress: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public SupplierNumber: number;
    public StatusCode: number;
    public CreatedBy: string;
    public SubAccountNumberSeriesID: number;
    public GLN: string;
    public OrgNumber: string;
    public CostAllocationID: number;
    public CurrencyCodeID: number;
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

    public ID: number;
    public Description: string;
    public Name: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
    public TermsType: TermsType;
    public CreditDays: number;
    public _createguid: string;
    public CustomFields: any;
}


export class TOFCurrencySettings extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'TOFCurrencySettings';

    public ID: number;
    public UpdatedAt: Date;
    public UpdateCurrencyAmountsOnQuoteToInvoice: boolean;
    public Deleted: boolean;
    public UpdateCurrencyAmountsOnQuotedateChange: boolean;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
    public UpdateCurrencyAmountsOnOrderToInvoice: boolean;
    public UpdateCurrencyAmountsOnOrderdateChange: boolean;
    public UpdateCurrencyAmountsOnInvoicedateChange: boolean;
    public UpdateCurrencyAmountsOnQuoteToOrder: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class Address extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Address';

    public ID: number;
    public Region: string;
    public UpdatedAt: Date;
    public AddressLine3: string;
    public Deleted: boolean;
    public AddressLine2: string;
    public BusinessRelationID: number;
    public PostalCode: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public Country: string;
    public City: string;
    public CountryCode: string;
    public CreatedBy: string;
    public AddressLine1: string;
    public _createguid: string;
    public BusinessRelation: BusinessRelation;
    public CustomFields: any;
}


export class BusinessRelation extends UniEntity {
    public static RelativeUrl = 'business-relations';
    public static EntityType = 'BusinessRelation';

    public ID: number;
    public DefaultPhoneID: number;
    public Name: string;
    public InvoiceAddressID: number;
    public UpdatedAt: Date;
    public ShippingAddressID: number;
    public Deleted: boolean;
    public DefaultEmailID: number;
    public CreatedAt: Date;
    public DefaultBankAccountID: number;
    public UpdatedBy: string;
    public StatusCode: number;
    public DefaultContactID: number;
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

    public ID: number;
    public ParentBusinessRelationID: number;
    public Comment: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public InfoID: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
    public Role: string;
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
    public Type: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public BusinessRelationID: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
    public EmailAddress: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Phone extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Phone';

    public ID: number;
    public Number: string;
    public Description: string;
    public Type: PhoneTypeEnum;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public BusinessRelationID: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public CountryCode: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class AGACalculation extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AGACalculation';

    public ID: number;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public DimensionsID: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
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

    public ID: number;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public SubEntityID: number;
    public freeAmount: number;
    public CreatedBy: string;
    public AGACalculationID: number;
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
    public Deleted: boolean;
    public beregningsKode: number;
    public agaBase: number;
    public zone: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public SubEntityID: number;
    public CreatedBy: string;
    public AGARateID: number;
    public AGACalculationID: number;
    public _createguid: string;
    public zoneName: string;
    public municipalityName: string;
    public subEntity: SubEntity;
    public CustomFields: any;
}


export class AGAPension extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AGAPension';

    public ID: number;
    public agaRate: number;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public beregningsKode: number;
    public agaBase: number;
    public zone: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public SubEntityID: number;
    public CreatedBy: string;
    public AGARateID: number;
    public AGACalculationID: number;
    public _createguid: string;
    public zoneName: string;
    public municipalityName: string;
    public subEntity: SubEntity;
    public CustomFields: any;
}


export class AGADraw extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AGADraw';

    public ID: number;
    public agaRate: number;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public beregningsKode: number;
    public agaBase: number;
    public zone: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public SubEntityID: number;
    public CreatedBy: string;
    public AGARateID: number;
    public AGACalculationID: number;
    public _createguid: string;
    public zoneName: string;
    public municipalityName: string;
    public subEntity: SubEntity;
    public CustomFields: any;
}


export class ForeignerWithPercent extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ForeignerWithPercent';

    public ID: number;
    public agaRate: number;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public agaBase: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public SubEntityID: number;
    public CreatedBy: string;
    public AGACalculationID: number;
    public _createguid: string;
    public zoneName: string;
    public municipalityName: string;
    public subEntity: SubEntity;
    public CustomFields: any;
}


export class DrawForeignerWithPercent extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'DrawForeignerWithPercent';

    public ID: number;
    public agaRate: number;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public agaBase: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public SubEntityID: number;
    public CreatedBy: string;
    public AGACalculationID: number;
    public _createguid: string;
    public zoneName: string;
    public municipalityName: string;
    public subEntity: SubEntity;
    public CustomFields: any;
}


export class ForeignerWithAmount extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ForeignerWithAmount';

    public ID: number;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public SubEntityID: number;
    public CreatedBy: string;
    public persons: number;
    public aga: number;
    public AGACalculationID: number;
    public _createguid: string;
    public zoneName: string;
    public municipalityName: string;
    public subEntity: SubEntity;
    public CustomFields: any;
}


export class TaxAndAgaSums extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'TaxAndAgaSums';

    public ID: number;
    public WithholdingTax: number;
    public GarnishmentTax: number;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public FinancialTax: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class AmeldingData extends UniEntity {
    public static RelativeUrl = 'amelding';
    public static EntityType = 'AmeldingData';

    public ID: number;
    public sent: Date;
    public created: Date;
    public attachmentFileID: number;
    public messageID: string;
    public type: AmeldingType;
    public receiptID: number;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public status: number;
    public year: number;
    public initiated: Date;
    public CreatedAt: Date;
    public OppgaveHash: string;
    public UpdatedBy: string;
    public StatusCode: number;
    public altinnStatus: string;
    public CreatedBy: string;
    public feedbackFileID: number;
    public mainFileID: number;
    public period: number;
    public PayrollRunID: number;
    public replacesID: number;
    public xmlValidationErrors: string;
    public replaceThis: string;
    public _createguid: string;
    public log: Array<AmeldingLog>;
    public CustomFields: any;
}


export class AmeldingLog extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AmeldingLog';

    public ID: number;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public AmeldingsID: number;
    public registry: SalaryRegistry;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public key: number;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class BasicAmount extends UniEntity {
    public static RelativeUrl = 'basicamounts';
    public static EntityType = 'BasicAmount';

    public ID: number;
    public BasicAmountPrYear: number;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public FromDate: Date;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
    public AveragePrYear: number;
    public ConversionFactor: number;
    public BasicAmountPrMonth: number;
    public _createguid: string;
    public CustomFields: any;
}


export class CompanySalary extends UniEntity {
    public static RelativeUrl = 'companysalary';
    public static EntityType = 'CompanySalary';

    public ID: number;
    public OtpExportActive: boolean;
    public MainAccountCostFinancial: number;
    public UpdatedAt: Date;
    public MainAccountAllocatedAGA: number;
    public WagetypeAdvancePaymentAuto: number;
    public Deleted: boolean;
    public MainAccountCostAGAVacation: number;
    public WagetypeAdvancePayment: number;
    public PaymentInterval: CompanySalaryPaymentInterval;
    public MainAccountAllocatedAGAVacation: number;
    public HoursPerMonth: number;
    public PostGarnishmentToTaxAccount: boolean;
    public Base_TaxFreeOrganization: boolean;
    public WageDeductionDueToHoliday: WageDeductionDueToHolidayType;
    public AllowOver6G: boolean;
    public InterrimRemitAccount: number;
    public Base_NettoPaymentForMaritim: boolean;
    public CreatedAt: Date;
    public MainAccountCostVacation: number;
    public Base_Svalbard: boolean;
    public UpdatedBy: string;
    public StatusCode: number;
    public FreeAmount: number;
    public PaycheckZipReportID: number;
    public HourFTEs: number;
    public CreatedBy: string;
    public MainAccountAllocatedFinancial: number;
    public CalculateFinancialTax: boolean;
    public MainAccountCostFinancialVacation: number;
    public MainAccountCostAGA: number;
    public RateFinancialTax: number;
    public Base_JanMayenAndBiCountries: boolean;
    public Base_PayAsYouEarnTaxOnPensions: boolean;
    public MainAccountAllocatedFinancialVacation: number;
    public Base_NettoPayment: boolean;
    public MainAccountAllocatedVacation: number;
    public PostToTaxDraw: boolean;
    public Base_SpesialDeductionForMaritim: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class CompanyVacationRate extends UniEntity {
    public static RelativeUrl = 'companyvacationrates';
    public static EntityType = 'CompanyVacationRate';

    public ID: number;
    public Rate: number;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public FromDate: Date;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
    public Rate60: number;
    public _createguid: string;
    public CustomFields: any;
}


export class EmployeeCategory extends UniEntity {
    public static RelativeUrl = 'employeecategories';
    public static EntityType = 'EmployeeCategory';

    public ID: number;
    public Name: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public EmployeeCategoryLinkID: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class EmployeeCategoryLink extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'EmployeeCategoryLink';

    public ID: number;
    public UpdatedAt: Date;
    public EmployeeCategoryID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public EmployeeID: number;
    public CreatedBy: string;
    public EmployeeNumber: number;
    public _createguid: string;
    public EmployeeCategory: EmployeeCategory;
    public Employee: Employee;
    public CustomFields: any;
}


export class Employee extends UniEntity {
    public static RelativeUrl = 'employees';
    public static EntityType = 'Employee';

    public ID: number;
    public ForeignWorker: ForeignWorker;
    public Active: boolean;
    public UpdatedAt: Date;
    public FreeText: string;
    public OtpExport: boolean;
    public TypeOfPaymentOtp: TypeOfPaymentOtp;
    public InternasjonalIDCountry: string;
    public Deleted: boolean;
    public Sex: GenderEnum;
    public PaymentInterval: PaymentInterval;
    public BusinessRelationID: number;
    public AdvancePaymentAmount: number;
    public SocialSecurityNumber: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public SubEntityID: number;
    public IncludeOtpUntilMonth: number;
    public CreatedBy: string;
    public PhotoID: number;
    public EmploymentDateOtp: LocalDate;
    public BirthDate: Date;
    public MunicipalityNo: string;
    public IncludeOtpUntilYear: number;
    public InternasjonalIDType: InternationalIDType;
    public EmployeeNumber: number;
    public EndDateOtp: LocalDate;
    public EmploymentDate: Date;
    public EmployeeLanguageID: number;
    public UserID: number;
    public InternationalID: string;
    public OtpStatus: OtpStatus;
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

    public ID: number;
    public ufoereYtelserAndreID: number;
    public loennTilUtenrikstjenestemannID: number;
    public SecondaryPercent: number;
    public loennKunTrygdeavgiftTilUtenlandskBorgerID: number;
    public Percent: number;
    public NonTaxableAmount: number;
    public ResultatStatus: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public loennFraBiarbeidsgiverID: number;
    public Year: number;
    public NotMainEmployer: boolean;
    public SecondaryTable: string;
    public TaxcardId: number;
    public CreatedAt: Date;
    public Table: string;
    public UpdatedBy: string;
    public StatusCode: number;
    public EmployeeID: number;
    public IssueDate: Date;
    public loennFraHovedarbeidsgiverID: number;
    public CreatedBy: string;
    public EmployeeNumber: number;
    public SKDXml: string;
    public pensjonID: number;
    public loennKunTrygdeavgiftTilUtenlandskBorgerSomGrensegjengerID: number;
    public Tilleggsopplysning: string;
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
    public Percent: number;
    public NonTaxableAmount: number;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public tabellType: TabellType;
    public freeAmountType: FreeAmountType;
    public AntallMaanederForTrekk: number;
    public CreatedAt: Date;
    public Table: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class EmployeeLeave extends UniEntity {
    public static RelativeUrl = 'EmployeeLeave';
    public static EntityType = 'EmployeeLeave';

    public ID: number;
    public Description: string;
    public UpdatedAt: Date;
    public LeaveType: Leavetype;
    public Deleted: boolean;
    public FromDate: Date;
    public CreatedAt: Date;
    public LeavePercent: number;
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
    public EmploymentID: number;
    public ToDate: Date;
    public AffectsOtp: boolean;
    public _createguid: string;
    public Employment: Employment;
    public CustomFields: any;
}


export class Employment extends UniEntity {
    public static RelativeUrl = 'employments';
    public static EntityType = 'Employment';

    public TypeOfEmployment: TypeOfEmployment;
    public ID: number;
    public PayGrade: string;
    public LedgerAccount: string;
    public ShipReg: ShipRegistry;
    public WorkPercent: number;
    public UserDefinedRate: number;
    public EndDate: Date;
    public StartDate: Date;
    public UpdatedAt: Date;
    public LastSalaryChangeDate: Date;
    public JobName: string;
    public Deleted: boolean;
    public HourRate: number;
    public RegulativeGroupID: number;
    public DimensionsID: number;
    public TradeArea: ShipTradeArea;
    public RegulativeStepNr: number;
    public MonthRate: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public WorkingHoursScheme: WorkingHoursScheme;
    public StatusCode: number;
    public EmployeeID: number;
    public SubEntityID: number;
    public ShipType: ShipTypeOfShip;
    public HoursPerWeek: number;
    public CreatedBy: string;
    public LastWorkPercentChangeDate: Date;
    public SeniorityDate: Date;
    public RemunerationType: RemunerationType;
    public EmployeeNumber: number;
    public Standard: boolean;
    public JobCode: string;
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
    public Amount: number;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public FromDate: Date;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public SubentityID: number;
    public CreatedBy: string;
    public AffectsAGA: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class OtpExportWagetype extends UniEntity {
    public static RelativeUrl = 'otpexportwagetypes';
    public static EntityType = 'OtpExportWagetype';

    public ID: number;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public WageTypeNumber: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class PayrollRun extends UniEntity {
    public static RelativeUrl = 'payrollrun';
    public static EntityType = 'PayrollRun';

    public ID: number;
    public Description: string;
    public AGAonRun: number;
    public AGAFreeAmount: number;
    public UpdatedAt: Date;
    public FreeText: string;
    public HolidayPayDeduction: boolean;
    public Deleted: boolean;
    public FromDate: Date;
    public ExcludeRecurringPosts: boolean;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public taxdrawfactor: TaxDrawFactor;
    public CreatedBy: string;
    public PaycheckFileID: number;
    public SettlementDate: Date;
    public PayDate: Date;
    public JournalEntryNumber: string;
    public ToDate: Date;
    public needsRecalc: boolean;
    public _createguid: string;
    public transactions: Array<SalaryTransaction>;
    public agacalculation: Array<AGACalculation>;
    public CustomFields: any;
}


export class PayrollRunCategoryLink extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'PayrollRunCategoryLink';

    public ID: number;
    public UpdatedAt: Date;
    public EmployeeCategoryID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
    public PayrollRunID: number;
    public _createguid: string;
    public EmployeeCategory: EmployeeCategory;
    public PayrollRun: PayrollRun;
    public CustomFields: any;
}


export class PostingSummaryDraft extends UniEntity {
    public ID: number;
    public draftWithDimsOnBalance: string;
    public status: SummaryJobStatus;
    public draftBasic: string;
    public draftWithDims: string;
    public JobInfoID: number;
    public PayrollID: number;
    public statusTime: Date;
}


export class Regulative extends UniEntity {
    public static RelativeUrl = 'regulatives';
    public static EntityType = 'Regulative';

    public ID: number;
    public StartDate: LocalDate;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public RegulativeGroupID: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
    public _createguid: string;
    public Steps: Array<RegulativeStep>;
    public CustomFields: any;
}


export class RegulativeGroup extends UniEntity {
    public static RelativeUrl = 'regulativegroups';
    public static EntityType = 'RegulativeGroup';

    public ID: number;
    public Name: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public CreatedAt: Date;
    public UpdatedBy: string;
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
    public Amount: number;
    public Step: number;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
    public RegulativeID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class SalaryBalance extends UniEntity {
    public static RelativeUrl = 'salarybalances';
    public static EntityType = 'SalaryBalance';

    public ID: number;
    public MaxAmount: number;
    public Source: SalBalSource;
    public Name: string;
    public Type: SalBalDrawType;
    public UpdatedAt: Date;
    public Instalment: number;
    public Deleted: boolean;
    public InstalmentPercent: number;
    public InstalmentType: SalBalType;
    public FromDate: Date;
    public WageTypeNumber: number;
    public SupplierID: number;
    public CreatePayment: boolean;
    public SalaryBalanceTemplateID: number;
    public KID: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public EmployeeID: number;
    public CreatedBy: string;
    public EmploymentID: number;
    public ToDate: Date;
    public MinAmount: number;
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

    public ID: number;
    public SalaryBalanceID: number;
    public Description: string;
    public Amount: number;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public Date: LocalDate;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
    public SalaryTransactionID: number;
    public _createguid: string;
    public SalaryTransaction: SalaryTransaction;
    public SalaryBalance: SalaryBalance;
    public CustomFields: any;
}


export class SalaryBalanceTemplate extends UniEntity {
    public static RelativeUrl = 'salarybalancetemplates';
    public static EntityType = 'SalaryBalanceTemplate';

    public ID: number;
    public MaxAmount: number;
    public Name: string;
    public UpdatedAt: Date;
    public Instalment: number;
    public Deleted: boolean;
    public InstalmentPercent: number;
    public InstalmentType: SalBalType;
    public SalarytransactionDescription: string;
    public WageTypeNumber: number;
    public SupplierID: number;
    public CreatePayment: boolean;
    public KID: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
    public Account: number;
    public MinAmount: number;
    public _createguid: string;
    public Supplier: Supplier;
    public SalaryBalances: Array<SalaryBalance>;
    public CustomFields: any;
}


export class SalaryTransaction extends UniEntity {
    public static RelativeUrl = 'salarytrans';
    public static EntityType = 'SalaryTransaction';

    public ID: number;
    public Rate: number;
    public SalaryBalanceID: number;
    public Sum: number;
    public Amount: number;
    public UpdatedAt: Date;
    public HolidayPayDeduction: boolean;
    public Deleted: boolean;
    public recurringPostValidTo: Date;
    public IsRecurringPost: boolean;
    public FromDate: Date;
    public ChildSalaryTransactionID: number;
    public TaxbasisID: number;
    public WageTypeNumber: number;
    public Text: string;
    public DimensionsID: number;
    public calcAGA: number;
    public RecurringID: number;
    public SystemType: StdSystemType;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public EmployeeID: number;
    public WageTypeID: number;
    public CreatedBy: string;
    public MunicipalityNo: string;
    public Account: number;
    public EmployeeNumber: number;
    public EmploymentID: number;
    public recurringPostValidFrom: Date;
    public VatTypeID: number;
    public PayrollRunID: number;
    public ToDate: Date;
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
    public ValueDate2: Date;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public WageTypeSupplementID: number;
    public ValueString: string;
    public ValueBool: boolean;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
    public ValueMoney: number;
    public SalaryTransactionID: number;
    public ValueDate: Date;
    public _createguid: string;
    public WageTypeSupplement: WageTypeSupplement;
    public CustomFields: any;
}


export class SalaryYear extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'SalaryYear';

    public ID: number;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
    public CurrentYear: number;
    public _createguid: string;
    public CustomFields: any;
}


export class SubEntity extends UniEntity {
    public static RelativeUrl = 'subentities';
    public static EntityType = 'SubEntity';

    public ID: number;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public BusinessRelationID: number;
    public AgaZone: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public freeAmount: number;
    public CreatedBy: string;
    public OrgNumber: string;
    public MunicipalityNo: string;
    public AgaRule: number;
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
    public ForeignCitizenInsuranceBasis: number;
    public SailorBasis: number;
    public UpdatedAt: Date;
    public PensionBasis: number;
    public Deleted: boolean;
    public ForeignBorderCommuterBasis: number;
    public JanMayenBasis: number;
    public Basis: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
    public SvalbardBasis: number;
    public SalaryTransactionID: number;
    public DisabilityOtherBasis: number;
    public PensionSourcetaxBasis: number;
    public _createguid: string;
    public CustomFields: any;
}


export class Travel extends UniEntity {
    public static RelativeUrl = 'travels';
    public static EntityType = 'Travel';

    public ID: number;
    public Description: string;
    public Name: string;
    public Comment: string;
    public Purpose: string;
    public UpdatedAt: Date;
    public SourceSystem: string;
    public Deleted: boolean;
    public SupplierID: number;
    public DimensionsID: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public State: state;
    public StatusCode: number;
    public PersonID: string;
    public TravelIdentificator: string;
    public CreatedBy: string;
    public EmployeeNumber: number;
    public Email: string;
    public Phone: string;
    public _createguid: string;
    public AdvanceAmount: number;
    public TravelLines: Array<TravelLine>;
    public Dimensions: Dimensions;
    public CustomFields: any;
}


export class TravelLine extends UniEntity {
    public static RelativeUrl = 'travellines';
    public static EntityType = 'TravelLine';

    public ID: number;
    public To: Date;
    public AccountNumber: number;
    public Rate: number;
    public Description: string;
    public From: Date;
    public Amount: number;
    public UpdatedAt: Date;
    public TravelID: number;
    public Deleted: boolean;
    public DimensionsID: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public TravelIdentificator: string;
    public TypeID: number;
    public InvoiceAccount: number;
    public CostType: costtype;
    public CreatedBy: string;
    public LineState: linestate;
    public VatTypeID: number;
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

    public ForeignDescription: string;
    public ID: number;
    public Description: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public WageTypeNumber: number;
    public ForeignTypeID: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public InvoiceAccount: number;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class VacationPayLine extends UniEntity {
    public static RelativeUrl = 'VacationPayLines';
    public static EntityType = 'VacationPayLine';

    public ID: number;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public Year: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public EmployeeID: number;
    public CreatedBy: string;
    public ManualVacationPayBase: number;
    public SystemVacationPayBase: number;
    public PaidVacationPay: number;
    public Rate: number;
    public PaidTaxFreeVacationPay: number;
    public MissingEarlierVacationPay: number;
    public Age: number;
    public _createguid: string;
    public VacationPay60: number;
    public Withdrawal: number;
    public Rate60: number;
    public VacationPay: number;
    public Employee: Employee;
    public CustomFields: any;
}


export class VacationRateEmployee extends UniEntity {
    public static RelativeUrl = 'employeevacationrates';
    public static EntityType = 'VacationRateEmployee';

    public ID: number;
    public Rate: number;
    public EndDate: Date;
    public StartDate: Date;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public EmployeeID: number;
    public CreatedBy: string;
    public Rate60: number;
    public _createguid: string;
    public CustomFields: any;
}


export class WageType extends UniEntity {
    public static RelativeUrl = 'wagetypes';
    public static EntityType = 'WageType';

    public ID: number;
    public AccountNumber_balance: number;
    public AccountNumber: number;
    public Rate: number;
    public SystemRequiredWageType: number;
    public NoNumberOfHours: boolean;
    public Description: string;
    public Limit_type: LimitType;
    public ValidYear: number;
    public UpdatedAt: Date;
    public HideFromPaycheck: boolean;
    public Base_div3: boolean;
    public Benefit: string;
    public Deleted: boolean;
    public Limit_newRate: number;
    public IncomeType: string;
    public RatetypeColumn: RateTypeColumn;
    public WageTypeNumber: number;
    public SpecialTaxAndContributionsRule: SpecialTaxAndContributionsRule;
    public taxtype: TaxType;
    public SupplementPackage: string;
    public Base_EmploymentTax: boolean;
    public GetRateFrom: GetRateFrom;
    public DaysOnBoard: boolean;
    public SpecialTaxHandling: string;
    public Systemtype: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
    public Base_Vacation: boolean;
    public Limit_value: number;
    public WageTypeName: string;
    public SpecialAgaRule: SpecialAgaRule;
    public Limit_WageTypeNumber: number;
    public Postnr: string;
    public Base_div2: boolean;
    public RateFactor: number;
    public FixedSalaryHolidayDeduction: boolean;
    public Base_Payment: boolean;
    public StandardWageTypeFor: StdWageType;
    public _createguid: string;
    public SupplementaryInformations: Array<WageTypeSupplement>;
    public CustomFields: any;
}


export class WageTypeSupplement extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'WageTypeSupplement';

    public ID: number;
    public Description: string;
    public Name: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public GetValueFromTrans: boolean;
    public ameldingType: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public WageTypeID: number;
    public CreatedBy: string;
    public ValueType: Valuetype;
    public SuggestedValue: string;
    public _createguid: string;
    public CustomFields: any;
}


export class WageTypeTranslation extends UniEntity {
    public static RelativeUrl = 'wagetypetranslations';
    public static EntityType = 'WageTypeTranslation';

    public ID: number;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public WageTypeNumber: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
    public WageTypeName: string;
    public EmployeeLanguageID: number;
    public _createguid: string;
    public EmployeeLanguage: EmployeeLanguage;
    public CustomFields: any;
}


export class EmployeeLanguage extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'EmployeeLanguage';

    public ID: number;
    public LanguageCode: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class ComponentLayout extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ComponentLayout';

    public ID: number;
    public Name: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public BaseEntity: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
    public _createguid: string;
    public Fields: Array<FieldLayout>;
    public CustomFields: any;
}


export class FieldLayout extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'FieldLayout';

    public ID: number;
    public FieldSet: number;
    public Description: string;
    public Combo: number;
    public Options: string;
    public EntityType: string;
    public UpdatedAt: Date;
    public Section: number;
    public Legend: string;
    public Property: string;
    public Deleted: boolean;
    public LineBreak: boolean;
    public LookupField: boolean;
    public Placeholder: string;
    public Placement: number;
    public CreatedAt: Date;
    public ComponentLayoutID: number;
    public Hidden: boolean;
    public UpdatedBy: string;
    public Label: string;
    public StatusCode: number;
    public DisplayField: string;
    public ReadOnly: boolean;
    public Alignment: Alignment;
    public CreatedBy: string;
    public FieldType: FieldType;
    public HelpText: string;
    public Sectionheader: string;
    public Width: string;
    public _createguid: string;
    public CustomFields: any;
}


export class CurrencyOverride extends UniEntity {
    public static RelativeUrl = 'currencyoverrides';
    public static EntityType = 'CurrencyOverride';

    public ID: number;
    public Source: CurrencySourceEnum;
    public Factor: number;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public FromDate: LocalDate;
    public FromCurrencyCodeID: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public ToCurrencyCodeID: number;
    public ToDate: LocalDate;
    public ExchangeRate: number;
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
    public Deleted: boolean;
    public ToAccountNumber: number;
    public AssetGroupCode: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public FromAccountNumber: number;
    public _createguid: string;
    public CustomFields: any;
}


export class AccountGroupSetup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AccountGroupSetup';

    public ID: number;
    public Name: string;
    public ParentID: number;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public PlanType: PlanTypeEnum;
    public CreatedBy: string;
    public ExternalReference: string;
    public _createguid: string;
    public Parent: AccountGroupSetup;
    public CustomFields: any;
}


export class AccountSetup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AccountSetup';

    public Visible: boolean;
    public ID: number;
    public AccountNumber: number;
    public UpdatedAt: Date;
    public VatCode: string;
    public SaftMappingAccountID: number;
    public Deleted: boolean;
    public AccountGroupSetupID: number;
    public CreatedAt: Date;
    public ExpectedDebitBalance: boolean;
    public UpdatedBy: string;
    public PlanType: PlanTypeEnum;
    public CreatedBy: string;
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
    public Name: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public CreatedAt: Date;
    public UpdatedBy: string;
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
    public UpdatedAt: Date;
    public Deleted: boolean;
    public AccountVisibilityGroupID: number;
    public AccountSetupID: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class AGARate extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AGARate';

    public ID: number;
    public Rate: number;
    public ZoneID: number;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public RateValidFrom: Date;
    public _createguid: string;
    public sector: Array<AGASector>;
    public CustomFields: any;
}


export class AGASector extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AGASector';

    public ID: number;
    public Rate: number;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public Sector: string;
    public RateID: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public freeAmount: number;
    public CreatedBy: string;
    public ValidFrom: Date;
    public SectorID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class AGAZone extends UniEntity {
    public static RelativeUrl = 'AGAZones';
    public static EntityType = 'AGAZone';

    public ID: number;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public ZoneName: string;
    public CreatedBy: string;
    public _createguid: string;
    public rates: Array<AGARate>;
    public municipalsOnZone: Array<MunicipalAGAZone>;
    public CustomFields: any;
}


export class Agreement extends UniEntity {
    public static RelativeUrl = 'agreements';
    public static EntityType = 'Agreement';

    public ID: number;
    public Name: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public ValidFrom: Date;
    public Template: string;
    public AppliesTo: number;
    public _createguid: string;
    public CustomFields: any;
}


export class AssetGroup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AssetGroup';

    public ID: number;
    public Name: string;
    public DepreciationAccountNumber: number;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public DepreciationRate: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public DepreciationYears: number;
    public Code: string;
    public ToDate: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class BankIdentifierCode extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'BankIdentifierCode';

    public ID: number;
    public Bic: string;
    public BankName: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public BankIdentifier: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class CompanyType extends UniEntity {
    public static RelativeUrl = 'companytypes';
    public static EntityType = 'CompanyType';

    public ID: number;
    public Description: string;
    public FullName: string;
    public Name: string;
    public UpdatedAt: Date;
    public Priority: boolean;
    public Deleted: boolean;
    public DefaultAccountVisibilityGroupID: number;
    public DefaultPlanType: PlanTypeEnum;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Confirmation extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Confirmation';

    public ID: number;
    public UpdatedAt: Date;
    public ExpirationDate: Date;
    public Deleted: boolean;
    public PostalCode: string;
    public SignUpReferrer: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
    public Code: string;
    public DisplayName: string;
    public Email: string;
    public ContractType: string;
    public Phone: string;
    public CompanyName: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Country extends UniEntity {
    public static RelativeUrl = 'countries';
    public static EntityType = 'Country';

    public ID: number;
    public CurrencyRateSource: string;
    public Name: string;
    public DefaultCurrencyCode: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public CountryCode: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Currency extends UniEntity {
    public static RelativeUrl = 'currencies';
    public static EntityType = 'Currency';

    public ID: number;
    public Source: CurrencySourceEnum;
    public Factor: number;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public CurrencyDate: LocalDate;
    public FromCurrencyCodeID: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public ToCurrencyCodeID: number;
    public ExchangeRate: number;
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
    public Name: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public ShortCode: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Code: string;
    public _createguid: string;
    public CustomFields: any;
}


export class DebtCollectionAutomation extends UniEntity {
    public static RelativeUrl = 'debtcollectionautomation';
    public static EntityType = 'DebtCollectionAutomation';

    public ID: number;
    public Description: string;
    public Name: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public DebtCollectionSettingsID: number;
    public _createguid: string;
    public DebtCollectionSettings: DebtCollectionSettings;
    public CustomFields: any;
}


export class EmploymentValidValues extends UniEntity {
    public static RelativeUrl = 'employmentvalidvalues';
    public static EntityType = 'EmploymentValidValues';

    public typeOfEmployment: boolean;
    public ID: number;
    public ShipReg: boolean;
    public WorkPercent: boolean;
    public UserDefinedRate: boolean;
    public EndDate: boolean;
    public StartDate: boolean;
    public UpdatedAt: Date;
    public LastSalaryChangeDate: boolean;
    public JobName: boolean;
    public employment: TypeOfEmployment;
    public Deleted: boolean;
    public HourRate: boolean;
    public TradeArea: boolean;
    public MonthRate: boolean;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public WorkingHoursScheme: boolean;
    public ShipType: boolean;
    public HoursPerWeek: boolean;
    public CreatedBy: string;
    public PaymentType: RemunerationType;
    public SeniorityDate: boolean;
    public RemunerationType: boolean;
    public LastWorkPercentChange: boolean;
    public JobCode: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class FinancialDeadline extends UniEntity {
    public static RelativeUrl = 'deadlines';
    public static EntityType = 'FinancialDeadline';

    public ID: number;
    public Name: string;
    public Type: FinancialDeadlineType;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
    public Deadline: LocalDate;
    public PassableDueDate: number;
    public AdditionalInfo: string;
    public _createguid: string;
    public CustomFields: any;
}


export class LanguageCode extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'LanguageCode';

    public ID: number;
    public Name: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Code: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Municipal extends UniEntity {
    public static RelativeUrl = 'Municipals';
    public static EntityType = 'Municipal';

    public ID: number;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public CountyNo: string;
    public Retired: boolean;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public MunicipalityName: string;
    public CreatedBy: string;
    public CountyName: string;
    public MunicipalityNo: string;
    public _createguid: string;
    public CustomFields: any;
}


export class MunicipalAGAZone extends UniEntity {
    public static RelativeUrl = 'MunicipalAGAZones';
    public static EntityType = 'MunicipalAGAZone';

    public ID: number;
    public ZoneID: number;
    public Startdate: Date;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public MunicipalityNo: string;
    public _createguid: string;
    public CustomFields: any;
}


export class PaymentBatchType extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'PaymentBatchType';

    public ID: number;
    public Description: string;
    public Name: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Code: number;
    public _createguid: string;
    public CustomFields: any;
}


export class PaymentCode extends UniEntity {
    public static RelativeUrl = 'paymentCodes';
    public static EntityType = 'PaymentCode';

    public ID: number;
    public PaymentGroup: string;
    public Description: string;
    public Name: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Code: number;
    public _createguid: string;
    public CustomFields: any;
}


export class PostalCode extends UniEntity {
    public static RelativeUrl = 'postalcodes';
    public static EntityType = 'PostalCode';

    public ID: number;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public City: string;
    public CreatedBy: string;
    public Code: string;
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
    public AccountID: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class StaticRegister extends UniEntity {
    public static RelativeUrl = 'StaticRegister';
    public static EntityType = 'StaticRegister';

    public ID: number;
    public stamp: Date;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public Registry: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class STYRKCode extends UniEntity {
    public static RelativeUrl = 'STYRK';
    public static EntityType = 'STYRKCode';

    public ID: number;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public lnr: number;
    public tittel: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public styrk: string;
    public ynr: number;
    public _createguid: string;
    public CustomFields: any;
}


export class Language extends UniEntity {
    public static RelativeUrl = 'languages';
    public static EntityType = 'Language';

    public ID: number;
    public Name: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public FallBackLanguageID: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Code: string;
    public _createguid: string;
    public Translations: Array<Translation>;
    public CustomFields: any;
}


export class Translatable extends UniEntity {
    public static RelativeUrl = 'translatables';
    public static EntityType = 'Translatable';

    public ID: number;
    public Module: i18nModule;
    public Description: string;
    public Value: string;
    public UpdatedAt: Date;
    public Static: boolean;
    public Column: string;
    public Deleted: boolean;
    public Meaning: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Model: string;
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
    public Deleted: boolean;
    public LanguageID: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public TranslatableID: number;
    public _createguid: string;
    public Language: Language;
    public Translatable: Translatable;
    public CustomFields: any;
}


export class VatCodeGroupSetup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'VatCodeGroupSetup';

    public ID: number;
    public Name: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public No: string;
    public _createguid: string;
    public CustomFields: any;
}


export class VatPostSetup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'VatPostSetup';

    public ID: number;
    public ReportAsNegativeAmount: boolean;
    public Name: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public HasTaxBasis: boolean;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public VatCodeGroupSetupNo: string;
    public No: string;
    public HasTaxAmount: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class VatReportForm extends UniEntity {
    public static RelativeUrl = 'vatreportforms';
    public static EntityType = 'VatReportForm';

    public ID: number;
    public Description: string;
    public Name: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class VatReportReferenceSetup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'VatReportReferenceSetup';

    public ID: number;
    public VatPostNo: string;
    public AccountNumber: number;
    public UpdatedAt: Date;
    public VatCode: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class VatTypeSetup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'VatTypeSetup';

    public ID: number;
    public Name: string;
    public UpdatedAt: Date;
    public VatCode: string;
    public Deleted: boolean;
    public OutputVat: boolean;
    public IsNotVatRegistered: boolean;
    public OutgoingAccountNumber: number;
    public DirectJournalEntryOnly: boolean;
    public DefaultVisible: boolean;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public IsCompensated: boolean;
    public IncomingAccountNumber: number;
    public VatCodeGroupNo: string;
    public ReversedTaxDutyVat: boolean;
    public _createguid: string;
    public VatTypeSetupPercentages: Array<VatTypeSetupPercentage>;
    public CustomFields: any;
}


export class VatTypeSetupPercentage extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'VatTypeSetupPercentage';

    public ID: number;
    public UpdatedAt: Date;
    public ValidTo: LocalDate;
    public Deleted: boolean;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public VatPercent: number;
    public CreatedBy: string;
    public ValidFrom: LocalDate;
    public VatTypeSetupID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class CompanyReport extends UniEntity {
    public static RelativeUrl = 'company-report';
    public static EntityType = 'CompanyReport';

    public ID: number;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public CreatedAt: Date;
    public CompanyKey: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public ReportDefinitionID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class ReportDefinition extends UniEntity {
    public static RelativeUrl = 'report-definitions';
    public static EntityType = 'ReportDefinition';

    public Visible: boolean;
    public ID: number;
    public Description: string;
    public Name: string;
    public Category: string;
    public UpdatedAt: Date;
    public ReportType: number;
    public Deleted: boolean;
    public IsStandard: boolean;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public ReportSource: string;
    public UniqueReportID: string;
    public CreatedBy: string;
    public Md5: string;
    public TemplateLinkId: string;
    public CategoryLabel: string;
    public Version: string;
    public _createguid: string;
    public CustomFields: any;
}


export class ReportDefinitionDataSource extends UniEntity {
    public static RelativeUrl = 'report-definition-data-sources';
    public static EntityType = 'ReportDefinitionDataSource';

    public ID: number;
    public Name: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public DataSourceUrl: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public ReportDefinitionId: number;
    public _createguid: string;
    public CustomFields: any;
}


export class ReportDefinitionParameter extends UniEntity {
    public static RelativeUrl = 'report-definition-parameters';
    public static EntityType = 'ReportDefinitionParameter';

    public Visible: boolean;
    public ID: number;
    public Name: string;
    public Type: string;
    public DefaultValueList: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public DefaultValueLookupType: string;
    public DefaultValueSource: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Label: string;
    public CreatedBy: string;
    public ReportDefinitionId: number;
    public DefaultValue: string;
    public _createguid: string;
    public CustomFields: any;
}


export class PeriodSeries extends UniEntity {
    public static RelativeUrl = 'period-series';
    public static EntityType = 'PeriodSeries';

    public ID: number;
    public Active: boolean;
    public Name: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public SeriesType: PeriodSeriesType;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class PeriodTemplate extends UniEntity {
    public static RelativeUrl = 'period-templates';
    public static EntityType = 'PeriodTemplate';

    public ID: number;
    public Name: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public FromDate: LocalDate;
    public PeriodSeriesID: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public No: number;
    public ToDate: LocalDate;
    public _createguid: string;
    public PeriodSeries: PeriodSeries;
    public CustomFields: any;
}


export class Model extends UniEntity {
    public static RelativeUrl = 'models';
    public static EntityType = 'Model';

    public ID: number;
    public Description: string;
    public Name: string;
    public UpdatedAt: Date;
    public Admin: boolean;
    public Deleted: boolean;
    public LabelPlural: string;
    public Shared: boolean;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Label: string;
    public CreatedBy: string;
    public _createguid: string;
    public Fields: Array<Field>;
    public CustomFields: any;
}


export class Field extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Field';

    public ID: number;
    public Description: string;
    public Name: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Label: string;
    public CreatedBy: string;
    public HelpText: string;
    public ModelID: number;
    public _createguid: string;
    public Model: Model;
    public CustomFields: any;
}


export class Notification extends UniEntity {
    public static RelativeUrl = 'notifications';
    public static EntityType = 'Notification';

    public ID: number;
    public SourceEntityType: string;
    public RecipientID: string;
    public EntityType: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public SenderDisplayName: string;
    public SourceEntityID: number;
    public CreatedAt: Date;
    public CompanyKey: string;
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
    public Message: string;
    public CompanyName: string;
    public EntityID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class CompanySettings extends UniEntity {
    public static RelativeUrl = 'companysettings';
    public static EntityType = 'CompanySettings';

    public ID: number;
    public DefaultPhoneID: number;
    public AgioLossAccountID: number;
    public APIncludeAttachment: boolean;
    public ShowNumberOfDecimals: number;
    public UseNetsIntegration: boolean;
    public PeriodSeriesVatID: number;
    public AccountingLockedDate: LocalDate;
    public XtraPaymentOrgXmlTagValue: string;
    public AutoJournalPayment: string;
    public FactoringEmailID: number;
    public AllowAvtalegiroRegularInvoice: boolean;
    public SettlementVatAccountID: number;
    public CustomerCreditDays: number;
    public Localization: string;
    public FactoringNumber: number;
    public AgioGainAccountID: number;
    public LogoFileID: number;
    public UpdatedAt: Date;
    public HasAutobank: boolean;
    public InterrimPaymentAccountID: number;
    public HideInActiveCustomers: boolean;
    public ForceSupplierInvoiceApproval: boolean;
    public UseOcrInterpretation: boolean;
    public Deleted: boolean;
    public DefaultCustomerInvoiceReminderReportID: number;
    public BatchInvoiceMinAmount: number;
    public CompanyTypeID: number;
    public OrganizationNumber: string;
    public InterrimRemitAccountID: number;
    public UsePaymentBankValues: boolean;
    public RoundingNumberOfDecimals: number;
    public AccountVisibilityGroupID: number;
    public TaxableFromLimit: number;
    public AccountGroupSetID: number;
    public StoreDistributedInvoice: boolean;
    public PeriodSeriesAccountID: number;
    public DefaultTOFCurrencySettingsID: number;
    public ShowKIDOnCustomerInvoice: boolean;
    public DefaultEmailID: number;
    public DefaultCustomerInvoiceReportID: number;
    public APGuid: string;
    public DefaultSalesAccountID: number;
    public UseXtraPaymentOrgXmlTag: boolean;
    public LogoAlign: number;
    public LogoHideField: number;
    public BankChargeAccountID: number;
    public DefaultDistributionsID: number;
    public AutoDistributeInvoice: boolean;
    public DefaultCustomerQuoteReportID: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public SAFTimportAccountID: number;
    public StatusCode: number;
    public VatLockedDate: LocalDate;
    public Factoring: number;
    public HideInActiveSuppliers: boolean;
    public RoundingType: RoundingType;
    public TaxMandatoryType: number;
    public BaseCurrencyCodeID: number;
    public IgnorePaymentsWithoutEndToEndID: boolean;
    public BookCustomerInvoiceOnDeliveryDate: boolean;
    public CreatedBy: string;
    public UseFinancialDateToCalculateVatPercent: boolean;
    public PaymentBankAgreementNumber: string;
    public OfficeMunicipalityNo: string;
    public AcceptableDelta4CustomerPayment: number;
    public GLN: string;
    public TwoStageAutobankEnabled: boolean;
    public APContactID: number;
    public UseAssetRegister: boolean;
    public CompanyRegistered: boolean;
    public CustomerInvoiceReminderSettingsID: number;
    public PaymentBankIdentification: string;
    public TaxBankAccountID: number;
    public SalaryBankAccountID: number;
    public NetsIntegrationActivated: boolean;
    public TaxMandatory: boolean;
    public SaveCustomersFromQuoteAsLead: boolean;
    public AcceptableDelta4CustomerPaymentAccountID: number;
    public DefaultAddressID: number;
    public VatReportFormID: number;
    public CompanyName: string;
    public CustomerAccountID: number;
    public CompanyBankAccountID: number;
    public APActivated: boolean;
    public DefaultCustomerOrderReportID: number;
    public TaxableFromDate: LocalDate;
    public SupplierAccountID: number;
    public WebAddress: string;
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

    public ID: number;
    public Name: string;
    public EntityType: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public CreatedAt: Date;
    public UpdatedBy: string;
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
    public UpdatedAt: Date;
    public Priority: number;
    public Deleted: boolean;
    public DistributionPlanID: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
    public DistributionPlanElementTypeID: number;
    public _createguid: string;
    public ElementType: DistributionPlanElementType;
    public CustomFields: any;
}


export class DistributionPlanElementType extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'DistributionPlanElementType';

    public ID: number;
    public Name: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public CreatedAt: Date;
    public UpdatedBy: string;
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
    public EntityType: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
    public DistributionPlanElementTypeID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class Distributions extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Distributions';

    public ID: number;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public CustomerOrderDistributionPlanID: number;
    public AnnualStatementDistributionPlanID: number;
    public CustomerInvoiceReminderDistributionPlanID: number;
    public PayCheckDistributionPlanID: number;
    public CreatedAt: Date;
    public CustomerInvoiceDistributionPlanID: number;
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
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

    public ID: number;
    public Name: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class EmailLog extends UniEntity {
    public static RelativeUrl = 'emails';
    public static EntityType = 'EmailLog';

    public ID: number;
    public Subject: string;
    public To: string;
    public From: string;
    public JobRunExternalRef: string;
    public Type: SharingType;
    public EntityType: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public EntityDisplayValue: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
    public DistributeAt: LocalDate;
    public ExternalMessage: string;
    public ExternalReference: string;
    public EntityID: number;
    public JobRunID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class Eventplan extends UniEntity {
    public static RelativeUrl = 'eventplans';
    public static EntityType = 'Eventplan';

    public ID: number;
    public ModelFilter: string;
    public OperationFilter: string;
    public Active: boolean;
    public Name: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public Cargo: string;
    public JobNames: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public PlanType: EventplanType;
    public CreatedBy: string;
    public IsSystemPlan: boolean;
    public ExpressionFilter: string;
    public _createguid: string;
    public Subscribers: Array<EventSubscriber>;
    public CustomFields: any;
}


export class EventSubscriber extends UniEntity {
    public static RelativeUrl = 'eventsubscribers';
    public static EntityType = 'EventSubscriber';

    public ID: number;
    public Active: boolean;
    public Name: string;
    public Headers: string;
    public UpdatedAt: Date;
    public Endpoint: string;
    public Deleted: boolean;
    public Authorization: string;
    public EventplanID: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
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
    public Name: string;
    public UpdatedAt: Date;
    public PeriodTemplateID: number;
    public AccountYear: number;
    public Deleted: boolean;
    public FromDate: LocalDate;
    public PeriodSeriesID: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
    public No: number;
    public ToDate: LocalDate;
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
    public Type: PredefinedDescriptionType;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
    public Code: string;
    public _createguid: string;
    public CustomFields: any;
}


export class ProductCategory extends UniEntity {
    public static RelativeUrl = 'productcategories';
    public static EntityType = 'ProductCategory';

    public ID: number;
    public Description: string;
    public Name: string;
    public ParentID: number;
    public Comment: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public Status: number;
    public Lft: number;
    public Depth: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
    public Rght: number;
    public _createguid: string;
    public CustomFields: any;
}


export class ProductCategoryLink extends UniEntity {
    public static RelativeUrl = 'productcategorylinks';
    public static EntityType = 'ProductCategoryLink';

    public ID: number;
    public ProductCategoryID: number;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public ProductID: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
    public _createguid: string;
    public ProductCategory: ProductCategory;
    public CustomFields: any;
}


export class Sharing extends UniEntity {
    public static RelativeUrl = 'sharings';
    public static EntityType = 'Sharing';

    public ID: number;
    public Subject: string;
    public To: string;
    public From: string;
    public JobRunExternalRef: string;
    public Type: SharingType;
    public EntityType: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public EntityDisplayValue: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
    public DistributeAt: LocalDate;
    public ExternalMessage: string;
    public ExternalReference: string;
    public EntityID: number;
    public JobRunID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class StatusLog extends UniEntity {
    public static RelativeUrl = 'statuslogs';
    public static EntityType = 'StatusLog';

    public ID: number;
    public EntityType: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public ToStatus: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public FromStatus: number;
    public EntityID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class Tracelink extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Tracelink';

    public ID: number;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public Date: Date;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
    public DestinationEntityName: string;
    public SourceInstanceID: number;
    public SourceEntityName: string;
    public DestinationInstanceID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class User extends UniEntity {
    public static RelativeUrl = 'users';
    public static EntityType = 'User';

    public ID: number;
    public Protected: boolean;
    public IsAutobankAdmin: boolean;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public PhoneNumber: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public HasAgreedToImportDisclaimer: boolean;
    public CreatedBy: string;
    public UserName: string;
    public GlobalIdentity: string;
    public BankIntegrationUserName: string;
    public LastLogin: Date;
    public DisplayName: string;
    public Email: string;
    public EndDate: Date;
    public TwoFactorEnabled: boolean;
    public _createguid: string;
    public AuthPhoneNumber: string;
    public CustomFields: any;
}


export class UniQueryDefinition extends UniEntity {
    public static RelativeUrl = 'uniquerydefinitions';
    public static EntityType = 'UniQueryDefinition';

    public ID: number;
    public Description: string;
    public Name: string;
    public Category: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public SortIndex: number;
    public ClickUrl: string;
    public CreatedAt: Date;
    public ClickParam: string;
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
    public ModuleID: number;
    public IsShared: boolean;
    public SystemGeneratedQuery: boolean;
    public Code: string;
    public MainModelName: string;
    public UserID: number;
    public _createguid: string;
    public UniQueryFilters: Array<UniQueryFilter>;
    public UniQueryFields: Array<UniQueryField>;
    public CustomFields: any;
}


export class UniQueryField extends UniEntity {
    public static RelativeUrl = 'uniqueryfields';
    public static EntityType = 'UniQueryField';

    public ID: number;
    public UniQueryDefinitionID: number;
    public UpdatedAt: Date;
    public Path: string;
    public Deleted: boolean;
    public SumFunction: string;
    public Header: string;
    public Alias: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public Field: string;
    public CreatedBy: string;
    public FieldType: number;
    public Width: string;
    public Index: number;
    public _createguid: string;
    public CustomFields: any;
}


export class UniQueryFilter extends UniEntity {
    public static RelativeUrl = 'uniqueryfilters';
    public static EntityType = 'UniQueryFilter';

    public ID: number;
    public UniQueryDefinitionID: number;
    public Value: string;
    public UpdatedAt: Date;
    public Group: number;
    public Operator: string;
    public Deleted: boolean;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public Field: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Team extends UniEntity {
    public static RelativeUrl = 'teams';
    public static EntityType = 'Team';

    public ID: number;
    public Name: string;
    public ParentID: number;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public Lft: number;
    public DimensionsID: number;
    public Depth: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
    public Rght: number;
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
    public Deleted: boolean;
    public FromDate: LocalDate;
    public RelatedSharedRoleId: number;
    public TeamID: number;
    public ApproveOrder: number;
    public Position: TeamPositionEnum;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
    public UserID: number;
    public ToDate: LocalDate;
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
    public Deleted: boolean;
    public Keywords: string;
    public RuleType: ApprovalRuleType;
    public IndustryCodes: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
    public _createguid: string;
    public Steps: Array<ApprovalRuleStep>;
    public CustomFields: any;
}


export class ApprovalRuleStep extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ApprovalRuleStep';

    public ID: number;
    public StepNumber: number;
    public UpdatedAt: Date;
    public Limit: number;
    public Deleted: boolean;
    public ApprovalRuleID: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
    public UserID: number;
    public _createguid: string;
    public ApprovalRule: ApprovalRule;
    public User: User;
    public CustomFields: any;
}


export class ApprovalSubstitute extends UniEntity {
    public static RelativeUrl = 'approvalsubstitutes';
    public static EntityType = 'ApprovalSubstitute';

    public ID: number;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public FromDate: LocalDate;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
    public SubstituteUserID: number;
    public UserID: number;
    public ToDate: LocalDate;
    public _createguid: string;
    public User: User;
    public SubstituteUser: User;
    public CustomFields: any;
}


export class TaskApprovalPlan extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'TaskApprovalPlan';

    public ID: number;
    public StepNumber: number;
    public Amount: number;
    public Comment: string;
    public UpdatedAt: Date;
    public Limit: number;
    public Deleted: boolean;
    public ApprovalRuleID: number;
    public TaskID: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
    public ApprovalID: number;
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

    public ID: number;
    public System: boolean;
    public StatusCategoryID: number;
    public Description: string;
    public EntityType: string;
    public UpdatedAt: Date;
    public Order: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public IsDepricated: boolean;
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
    public Name: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public StatusCategoryCode: StatusCategoryCode;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class StatusRemark extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'StatusRemark';

    public ID: number;
    public EntityType: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
    public Remark: string;
    public EntityID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class Transition extends UniEntity {
    public static RelativeUrl = 'transitions';
    public static EntityType = 'Transition';

    public ID: number;
    public EntityType: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public MethodName: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Controller: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class TransitionThreshold extends UniEntity {
    public static RelativeUrl = 'thresholds';
    public static EntityType = 'TransitionThreshold';

    public ID: number;
    public Value: string;
    public SharedRoleId: number;
    public UpdatedAt: Date;
    public Operator: Operator;
    public Deleted: boolean;
    public Operation: OperationType;
    public SharedApproveTransitionId: number;
    public PropertyName: string;
    public RejectStatusCode: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Disabled: boolean;
    public SharedRejectTransitionId: number;
    public _createguid: string;
    public CustomFields: any;
}


export class TransitionThresholdApproval extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'TransitionThresholdApproval';

    public ID: number;
    public Value: string;
    public SharedRoleId: number;
    public UpdatedAt: Date;
    public Operator: Operator;
    public Deleted: boolean;
    public Operation: OperationType;
    public SharedApproveTransitionId: number;
    public PropertyName: string;
    public RejectStatusCode: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public ApprovalID: number;
    public SharedRejectTransitionId: number;
    public _createguid: string;
    public Approval: Approval;
    public CustomFields: any;
}


export class Approval extends UniEntity {
    public static RelativeUrl = 'approvals';
    public static EntityType = 'Approval';

    public ID: number;
    public SharedRoleId: number;
    public Amount: number;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public TaskID: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
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

    public ID: number;
    public SharedRoleId: number;
    public Type: TaskType;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public SharedApproveTransitionId: number;
    public RejectStatusCode: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public Title: string;
    public CreatedBy: string;
    public UserID: number;
    public SharedRejectTransitionId: number;
    public ModelID: number;
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

    public ID: number;
    public EntityType: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public FromStatusID: number;
    public ExpiresDate: Date;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public IsDepricated: boolean;
    public CreatedBy: string;
    public TransitionID: number;
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

    public ID: number;
    public ProjectNumberNumeric: number;
    public Description: string;
    public Name: string;
    public Amount: number;
    public EndDate: LocalDate;
    public StartDate: LocalDate;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public Price: number;
    public Total: number;
    public DimensionsID: number;
    public ProjectNumberSeriesID: number;
    public PlannedStartdate: LocalDate;
    public CreatedAt: Date;
    public CostPrice: number;
    public UpdatedBy: string;
    public StatusCode: number;
    public WorkPlaceAddressID: number;
    public CreatedBy: string;
    public ProjectLeadName: string;
    public ProjectNumber: string;
    public ProjectCustomerID: number;
    public PlannedEnddate: LocalDate;
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
    public Responsibility: string;
    public Name: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public ProjectID: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
    public UserID: number;
    public _createguid: string;
    public ProjectUser: User;
    public CustomFields: any;
}


export class ProjectResourceSchedule extends UniEntity {
    public static RelativeUrl = 'projects-schedules-resources';
    public static EntityType = 'ProjectResourceSchedule';

    public ID: number;
    public UpdatedAt: Date;
    public ProjectTaskID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
    public ProjectResourceID: number;
    public ProjectTaskScheduleID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class ProjectTask extends UniEntity {
    public static RelativeUrl = 'projects-tasks';
    public static EntityType = 'ProjectTask';

    public ID: number;
    public Number: string;
    public Description: string;
    public Name: string;
    public Amount: number;
    public EndDate: LocalDate;
    public StartDate: LocalDate;
    public UpdatedAt: Date;
    public SuggestedNumber: string;
    public Deleted: boolean;
    public Price: number;
    public Total: number;
    public ProjectID: number;
    public CreatedAt: Date;
    public CostPrice: number;
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
    public _createguid: string;
    public ProjectTaskSchedules: Array<ProjectTaskSchedule>;
    public ProjectTaskResources: Array<ProjectResourceSchedule>;
    public CustomFields: any;
}


export class ProjectTaskSchedule extends UniEntity {
    public static RelativeUrl = 'projects-tasks-schedules';
    public static EntityType = 'ProjectTaskSchedule';

    public ID: number;
    public EndDate: LocalDate;
    public StartDate: LocalDate;
    public UpdatedAt: Date;
    public ProjectTaskID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public UpdatedBy: string;
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
    public UpdatedAt: Date;
    public Deleted: boolean;
    public ProductID: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
    public _createguid: string;
    public Product: Product;
    public CustomFields: any;
}


export class Product extends UniEntity {
    public static RelativeUrl = 'products';
    public static EntityType = 'Product';

    public ID: number;
    public ImageFileID: number;
    public PriceIncVat: number;
    public Description: string;
    public Name: string;
    public Type: ProductTypeEnum;
    public ListPrice: number;
    public UpdatedAt: Date;
    public VariansParentID: number;
    public AverageCost: number;
    public Deleted: boolean;
    public CalculateGrossPriceBasedOnNetPrice: boolean;
    public Unit: string;
    public DimensionsID: number;
    public AccountID: number;
    public CreatedAt: Date;
    public CostPrice: number;
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
    public PartName: string;
    public DefaultProductCategoryID: number;
    public VatTypeID: number;
    public PriceExVat: number;
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
    public System: boolean;
    public Name: string;
    public FromNumber: number;
    public IsDefaultForTask: boolean;
    public Comment: string;
    public UpdatedAt: Date;
    public AccountYear: number;
    public Deleted: boolean;
    public Empty: boolean;
    public UseNumbersFromNumberSeriesID: number;
    public NumberSeriesTypeID: number;
    public CreatedAt: Date;
    public MainAccountID: number;
    public UpdatedBy: string;
    public StatusCode: number;
    public ToNumber: number;
    public NumberSeriesTaskID: number;
    public CreatedBy: string;
    public Disabled: boolean;
    public DisplayName: string;
    public NumberLock: boolean;
    public NextNumber: number;
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
    public UpdatedAt: Date;
    public NumberSerieTypeBID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
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
    public Name: string;
    public EntityType: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
    public _createguid: string;
    public NumberSeries: Array<NumberSeries>;
    public CustomFields: any;
}


export class NumberSeriesType extends UniEntity {
    public static RelativeUrl = 'number-series-types';
    public static EntityType = 'NumberSeriesType';

    public ID: number;
    public System: boolean;
    public Name: string;
    public EntityField: string;
    public EntityType: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public Yearly: boolean;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
    public CanHaveSeveralActiveSeries: boolean;
    public EntitySeriesIDField: string;
    public _createguid: string;
    public Series: Array<NumberSeries>;
    public CustomFields: any;
}


export class EncryptionInfo extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'EncryptionInfo';

    public ID: number;
    public description: string;
    public type: Type;
    public password: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class File extends UniEntity {
    public static RelativeUrl = 'files/{entitytype}/{entityid}';
    public static EntityType = 'File';

    public ID: number;
    public ContentType: string;
    public Pages: number;
    public Description: string;
    public Name: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public StorageReference: string;
    public OCRData: string;
    public encryptionID: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
    public Md5: string;
    public PermaLink: string;
    public Size: string;
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
    public UpdatedAt: Date;
    public Deleted: boolean;
    public Status: number;
    public TagName: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public FileID: number;
    public CreatedBy: string;
    public _createguid: string;
    public File: File;
    public CustomFields: any;
}


export class FileEntityLink extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'FileEntityLink';

    public ID: number;
    public EntityType: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public FileID: number;
    public CreatedBy: string;
    public IsAttachment: boolean;
    public EntityID: number;
    public _createguid: string;
    public File: File;
    public CustomFields: any;
}


export class ElsaUsageLog extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ElsaUsageLog';

    public ID: number;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public DateLogged: Date;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Quantity: number;
    public ProductType: string;
    public ExternalReference: string;
    public _createguid: string;
    public CustomFields: any;
}


export class AccessPointFormat extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AccessPointFormat';

    public ID: number;
    public Name: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Label: string;
    public ResourceName: string;
    public StatusCode: number;
    public CreatedBy: string;
    public OutgoingID: number;
    public IncommingID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class EHFLog extends UniEntity {
    public static RelativeUrl = 'ehf';
    public static EntityType = 'EHFLog';

    public ID: number;
    public Subject: string;
    public To: string;
    public From: string;
    public JobRunExternalRef: string;
    public Type: SharingType;
    public EntityType: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public EntityDisplayValue: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
    public DistributeAt: LocalDate;
    public ExternalMessage: string;
    public ExternalReference: string;
    public EntityID: number;
    public JobRunID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class Department extends UniEntity {
    public static RelativeUrl = 'departments';
    public static EntityType = 'Department';

    public ID: number;
    public DepartmentManagerName: string;
    public Description: string;
    public Name: string;
    public DepartmentNumberNumeric: number;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
    public DepartmentNumberSeriesID: number;
    public DepartmentNumber: string;
    public _createguid: string;
    public DepartmentNumberSeries: NumberSeries;
    public CustomFields: any;
}


export class Dimension10 extends UniEntity {
    public static RelativeUrl = 'Dimension10';
    public static EntityType = 'Dimension10';

    public ID: number;
    public Number: string;
    public Description: string;
    public Name: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public NumberNumeric: number;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Dimension5 extends UniEntity {
    public static RelativeUrl = 'Dimension5';
    public static EntityType = 'Dimension5';

    public ID: number;
    public Number: string;
    public Description: string;
    public Name: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public NumberNumeric: number;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Dimension6 extends UniEntity {
    public static RelativeUrl = 'Dimension6';
    public static EntityType = 'Dimension6';

    public ID: number;
    public Number: string;
    public Description: string;
    public Name: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public NumberNumeric: number;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Dimension7 extends UniEntity {
    public static RelativeUrl = 'Dimension7';
    public static EntityType = 'Dimension7';

    public ID: number;
    public Number: string;
    public Description: string;
    public Name: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public NumberNumeric: number;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Dimension8 extends UniEntity {
    public static RelativeUrl = 'Dimension8';
    public static EntityType = 'Dimension8';

    public ID: number;
    public Number: string;
    public Description: string;
    public Name: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public NumberNumeric: number;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Dimension9 extends UniEntity {
    public static RelativeUrl = 'Dimension9';
    public static EntityType = 'Dimension9';

    public ID: number;
    public Number: string;
    public Description: string;
    public Name: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public NumberNumeric: number;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Dimensions extends UniEntity {
    public static RelativeUrl = 'dimensions';
    public static EntityType = 'Dimensions';

    public ID: number;
    public Dimension7ID: number;
    public Dimension8ID: number;
    public UpdatedAt: Date;
    public ProjectTaskID: number;
    public Deleted: boolean;
    public Dimension10ID: number;
    public RegionID: number;
    public Dimension9ID: number;
    public ProjectID: number;
    public CreatedAt: Date;
    public Dimension6ID: number;
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
    public Dimension5ID: number;
    public ResponsibleID: number;
    public DepartmentID: number;
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
    public ProjectTaskName: string;
    public RegionName: string;
    public Dimension5Name: string;
    public ResponsibleName: string;
    public Dimension8Name: string;
    public ProjectTaskNumber: string;
    public DimensionsID: number;
    public Dimension6Name: string;
    public Dimension10Name: string;
    public Dimension6Number: string;
    public Dimension9Number: string;
    public Dimension10Number: string;
    public DepartmentName: string;
    public RegionCode: string;
    public ProjectNumber: string;
    public ProjectName: string;
    public Dimension5Number: string;
    public DepartmentNumber: string;
    public Dimension8Number: string;
    public Dimension9Name: string;
    public Dimension7Name: string;
    public Dimension7Number: string;
}


export class DimensionSettings extends UniEntity {
    public static RelativeUrl = 'dimensionsettings';
    public static EntityType = 'DimensionSettings';

    public ID: number;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Label: string;
    public StatusCode: number;
    public Dimension: number;
    public CreatedBy: string;
    public IsActive: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class Region extends UniEntity {
    public static RelativeUrl = 'regions';
    public static EntityType = 'Region';

    public ID: number;
    public Description: string;
    public Name: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public CountryCode: string;
    public CreatedBy: string;
    public RegionCode: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Responsible extends UniEntity {
    public static RelativeUrl = 'responsibles';
    public static EntityType = 'Responsible';

    public ID: number;
    public Description: string;
    public Name: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public NameOfResponsible: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Contract extends UniEntity {
    public static RelativeUrl = 'contracts';
    public static EntityType = 'Contract';

    public ID: number;
    public Description: string;
    public Name: string;
    public UpdatedAt: Date;
    public Engine: ContractEngine;
    public Deleted: boolean;
    public TeamsUri: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
    public HashTransactionAddress: string;
    public ContractCode: string;
    public Hash: string;
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
    public Type: AddressType;
    public Amount: number;
    public EntityType: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public AssetAddress: string;
    public Address: string;
    public ContractAssetID: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
    public ContractID: number;
    public EntityID: number;
    public _createguid: string;
    public Contract: Contract;
    public ContractAsset: ContractAsset;
    public CustomFields: any;
}


export class ContractAsset extends UniEntity {
    public static RelativeUrl = 'contractassets';
    public static EntityType = 'ContractAsset';

    public ID: number;
    public IsPrivate: boolean;
    public Type: AddressType;
    public UpdatedAt: Date;
    public IsCosignedByDefiner: boolean;
    public SpenderAttested: boolean;
    public Deleted: boolean;
    public IsAutoDestroy: boolean;
    public IsFixedDenominations: boolean;
    public CreatedAt: Date;
    public Cap: number;
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
    public IsIssuedByDefinerOnly: boolean;
    public ContractID: number;
    public IsTransferrable: boolean;
    public _createguid: string;
    public Contract: Contract;
    public CustomFields: any;
}


export class ContractDebugLog extends UniEntity {
    public static RelativeUrl = 'contractdebuglogs';
    public static EntityType = 'ContractDebugLog';

    public ID: number;
    public Type: ContractEventType;
    public UpdatedAt: Date;
    public ContractRunLogID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
    public ContractID: number;
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
    public Name: string;
    public Value: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
    public ContractID: number;
    public _createguid: string;
    public Contract: Contract;
    public CustomFields: any;
}


export class ContractRunLog extends UniEntity {
    public static RelativeUrl = 'contractrunlogs';
    public static EntityType = 'ContractRunLog';

    public ID: number;
    public Type: ContractEventType;
    public RunTime: string;
    public UpdatedAt: Date;
    public ContractTriggerID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
    public ContractID: number;
    public Message: string;
    public _createguid: string;
    public Contract: Contract;
    public CustomFields: any;
}


export class ContractTransaction extends UniEntity {
    public static RelativeUrl = 'contracttransactions';
    public static EntityType = 'ContractTransaction';

    public ID: number;
    public SenderAddress: string;
    public Amount: number;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public AssetAddress: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public ContractAddressID: number;
    public CreatedBy: string;
    public ReceiverAddress: string;
    public ContractID: number;
    public _createguid: string;
    public Contract: Contract;
    public ContractAddress: ContractAddress;
    public CustomFields: any;
}


export class ContractTrigger extends UniEntity {
    public static RelativeUrl = 'contracttriggers';
    public static EntityType = 'ContractTrigger';

    public ID: number;
    public ModelFilter: string;
    public OperationFilter: string;
    public Type: ContractEventType;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
    public ContractID: number;
    public ExpressionFilter: string;
    public _createguid: string;
    public Contract: Contract;
    public CustomFields: any;
}


export class Comment extends UniEntity {
    public static RelativeUrl = 'comments';
    public static EntityType = 'Comment';

    public ID: number;
    public EntityType: string;
    public UpdatedAt: Date;
    public AuthorID: number;
    public Deleted: boolean;
    public Text: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
    public EntityID: number;
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
    public Deleted: boolean;
    public CommentID: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
    public UserID: number;
    public _createguid: string;
    public User: User;
    public CustomFields: any;
}


export class ApiKey extends UniEntity {
    public static RelativeUrl = 'apikeys';
    public static EntityType = 'ApiKey';

    public ID: number;
    public Description: string;
    public IntegrationType: TypeOfIntegration;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public ExternalId: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public IntegrationKey: string;
    public CreatedBy: string;
    public Url: string;
    public FilterDate: LocalDate;
    public Encrypt: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class Altinn extends UniEntity {
    public static RelativeUrl = 'altinn';
    public static EntityType = 'Altinn';

    public ID: number;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public PreferredLogin: TypeOfLogin;
    public SystemPw: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public SystemID: string;
    public CreatedBy: string;
    public Language: string;
    public _createguid: string;
    public CustomFields: any;
}


export class AltinnReceipt extends UniEntity {
    public static RelativeUrl = 'altinnreceipts';
    public static EntityType = 'AltinnReceipt';

    public ID: number;
    public ReceiptID: number;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public Form: string;
    public UserSign: string;
    public CreatedAt: Date;
    public TimeStamp: Date;
    public XmlReceipt: string;
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
    public HasBeenRegistered: boolean;
    public ErrorText: string;
    public AltinnResponseData: string;
    public _createguid: string;
    public Signings: Array<AltinnSigning>;
    public CustomFields: any;
}


export class AltinnSigning extends UniEntity {
    public static RelativeUrl = 'altinnsigning';
    public static EntityType = 'AltinnSigning';

    public ID: number;
    public SignatureText: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public AltinnReceiptID: number;
    public DateSigned: Date;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
    public StatusText: string;
    public SignatureReference: string;
    public _createguid: string;
    public AltinnReceipt: AltinnReceipt;
    public CustomFields: any;
}


export class Barnepass extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Barnepass';

    public ID: number;
    public UpdatedAt: Date;
    public inntektsaar: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public UpdatedBy: string;
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
    public UpdatedAt: Date;
    public foedselsnummer: string;
    public Deleted: boolean;
    public BarnepassID: number;
    public navn: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
    public email: string;
    public paaloeptBeloep: number;
    public _createguid: string;
    public CustomFields: any;
}


export class UserRole extends UniEntity {
    public static RelativeUrl = 'userroles';
    public static EntityType = 'UserRole';

    public ID: number;
    public SharedRoleId: number;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public SharedRoleName: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UserID: number;
    public _createguid: string;
    public User: User;
    public CustomFields: any;
}


export class Role extends UniEntity {
    public static RelativeUrl = 'roles';
    public static EntityType = 'Role';

    public ID: number;
    public Description: string;
    public Name: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public CreatedAt: Date;
    public UpdatedBy: string;
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
    public UpdatedAt: Date;
    public Deleted: boolean;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public RoleID: number;
    public CreatedBy: string;
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
    public Name: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public RolePermissions: Array<RolePermission>;
    public CustomFields: any;
}


export class AvtaleGiroAgreement extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AvtaleGiroAgreement';

    public ID: number;
    public Description: string;
    public UpdatedAt: Date;
    public Thumbprint: string;
    public Deleted: boolean;
    public DataSender: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public KeyPath: string;
    public NextNumber: number;
    public _createguid: string;
    public CustomFields: any;
}


export class AvtaleGiroBankAccount extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AvtaleGiroBankAccount';

    public ID: number;
    public UpdatedAt: Date;
    public BankAccountNumber: string;
    public Deleted: boolean;
    public CompanyID: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public AvtaleGiroAgreementID: number;
    public _createguid: string;
    public Company: Company;
    public CustomFields: any;
}


export class AvtaleGiroFile extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AvtaleGiroFile';

    public ID: number;
    public UpdatedAt: Date;
    public AvtaleGiroMergedFileID: number;
    public Deleted: boolean;
    public CompanyID: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public FileID: number;
    public CreatedBy: string;
    public AvtaleGiroContent: string;
    public AvtaleGiroAgreementID: number;
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
    public CreatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public TransmissionNumber: number;
    public _createguid: string;
    public CustomFields: any;
}


export class BankAgreement extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'BankAgreement';

    public ID: number;
    public CustomerName: string;
    public ReceiptID: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public OrderMobile: string;
    public ReceiptDate: Date;
    public ServiceID: string;
    public ServiceAccountID: number;
    public OrderName: string;
    public CompanyID: number;
    public CustomerOrgNumber: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public AccountOwnerOrgNumber: string;
    public AccountOwnerName: string;
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
    public UpdatedAt: Date;
    public Deleted: boolean;
    public ServiceType: number;
    public DivisionID: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public KidRule: string;
    public DivisionName: string;
    public CreatedBy: string;
    public ConfirmInNetbank: boolean;
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

    public ID: number;
    public AccountNumber: string;
    public UpdatedAt: Date;
    public BankServiceID: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public BankService: BankService;
    public CustomFields: any;
}


export class Company extends UniEntity {
    public static RelativeUrl = 'companies';
    public static EntityType = 'Company';

    public ID: number;
    public IsTemplate: boolean;
    public Name: string;
    public ConnectionString: string;
    public UpdatedAt: Date;
    public IsGlobalTemplate: boolean;
    public Deleted: boolean;
    public OrganizationNumber: string;
    public CreatedAt: Date;
    public FileFlowOrgnrEmail: string;
    public UpdatedBy: string;
    public Key: string;
    public CreatedBy: string;
    public IsTest: boolean;
    public FileFlowEmail: string;
    public ClientNumber: number;
    public WebHookSubscriberId: string;
    public LastActivity: Date;
    public SchemaName: string;
    public _createguid: string;
    public CustomFields: any;
}


export class CompanyAccess extends UniEntity {
    public static RelativeUrl = 'companies-access';
    public static EntityType = 'CompanyAccess';

    public ID: number;
    public Roles: string;
    public EndDate: Date;
    public StartDate: Date;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public CompanyID: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
    public GlobalIdentity: string;
    public _createguid: string;
    public CustomFields: any;
}


export class CompanyBackup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'CompanyBackup';

    public ID: number;
    public Environment: string;
    public BackupStatus: BackupStatus;
    public CustomerName: string;
    public UpdatedAt: Date;
    public Reason: string;
    public CloudBlobName: string;
    public Deleted: boolean;
    public ContainerName: string;
    public ScheduledForDeleteAt: Date;
    public CreatedAt: Date;
    public CompanyKey: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public OrgNumber: string;
    public ContractID: number;
    public CopyFiles: boolean;
    public Message: string;
    public ContractType: number;
    public CompanyName: string;
    public SchemaName: string;
    public DeletedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class ContractCron extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ContractCron';

    public ID: number;
    public UpdatedAt: Date;
    public ContractTriggerID: number;
    public Deleted: boolean;
    public Expression: string;
    public CompanyID: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public ContractID: number;
    public CompanyKey: string;
    public _createguid: string;
    public CompanyDbName: string;
    public CustomFields: any;
}


export class ContractObyte extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ContractObyte';

    public ID: number;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public AssetAddress: string;
    public Address: string;
    public CompanyID: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public ContractAddressID: number;
    public CreatedBy: string;
    public ContractID: number;
    public CompanyKey: string;
    public _createguid: string;
    public CompanyDbName: string;
    public CustomFields: any;
}


export class DeniedUserAccessLog extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'DeniedUserAccessLog';

    public ID: number;
    public Occurred: Date;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public CompanyID: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Username: string;
    public Message: string;
    public Email: string;
    public CompanyName: string;
    public _createguid: string;
    public Company: Company;
    public CustomFields: any;
}


export class FailedBankFile extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'FailedBankFile';

    public ID: number;
    public FileName: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public CreatedAt: Date;
    public CompanyKey: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public FailedReason: FailedReasonEnum;
    public FileContent: string;
    public _createguid: string;
    public CustomFields: any;
}


export class HangfireJob extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'HangfireJob';

    public ID: number;
    public HasError: boolean;
    public UpdatedAt: Date;
    public Status: number;
    public Year: number;
    public Completed: boolean;
    public CompanyID: number;
    public CreatedAt: Date;
    public CompanyKey: string;
    public GlobalIdentity: string;
    public JobId: string;
    public CustomFields: any;
}


export class HangfireJobContext extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'HangfireJobContext';

    public ID: number;
    public HasError: boolean;
    public UpdatedAt: Date;
    public Status: number;
    public Year: number;
    public Completed: boolean;
    public CompanyID: number;
    public CreatedAt: Date;
    public CompanyKey: string;
    public GlobalIdentity: string;
    public JobId: string;
    public SchemaName: string;
    public CustomFields: any;
}


export class HangfireResponse extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'HangfireResponse';

    public ID: number;
    public ProgressUrl: string;
    public HasError: boolean;
    public UpdatedAt: Date;
    public Status: number;
    public Year: number;
    public Completed: boolean;
    public CompanyID: number;
    public CreatedAt: Date;
    public CompanyKey: string;
    public State: string;
    public GlobalIdentity: string;
    public JobId: string;
    public CustomFields: any;
}


export class KpiDefinition extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'KpiDefinition';

    public ID: number;
    public Name: string;
    public Interval: string;
    public RefreshModels: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public CompanyID: number;
    public CreatedAt: Date;
    public Application: string;
    public UpdatedBy: string;
    public SourceType: KpiSourceType;
    public CreatedBy: string;
    public RoleNames: string;
    public Route: string;
    public ValueType: KpiValueType;
    public IsPerUser: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class KpiValue extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'KpiValue';

    public ID: number;
    public KpiName: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public Total: number;
    public Text: string;
    public LastUpdated: Date;
    public KpiDefinitionID: number;
    public CompanyID: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public ValueStatus: KpiValueStatus;
    public CreatedBy: string;
    public Counter: number;
    public UserIdentity: string;
    public _createguid: string;
    public CustomFields: any;
}


export class OutgoingInvoice extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'OutgoingInvoice';

    public ID: number;
    public DueDate: Date;
    public Amount: number;
    public MetaJson: string;
    public RecipientPhoneNumber: string;
    public UpdatedAt: Date;
    public ISPOrganizationNumber: string;
    public Deleted: boolean;
    public Status: number;
    public CompanyID: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
    public ExternalReference: string;
    public InvoiceID: number;
    public RecipientOrganizationNumber: string;
    public InvoiceType: OutgoingInvoiceType;
    public _createguid: string;
    public Company: Company;
    public CustomFields: any;
}


export class ProcessFileLog extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ProcessFileLog';

    public ID: number;
    public FileName: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public EntityCount: number;
    public CompanyID: number;
    public CreatedAt: Date;
    public EntityInstanceID: string;
    public CompanyKey: string;
    public UpdatedBy: string;
    public StatusCode: number;
    public FileID: number;
    public CreatedBy: string;
    public EntityName: string;
    public Message: string;
    public UserIdentity: string;
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
    public Description: string;
    public UpdatedAt: Date;
    public Thumbprint: string;
    public Deleted: boolean;
    public DataSender: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public KeyPath: string;
    public NextNumber: number;
    public _createguid: string;
    public CustomFields: any;
}


export class UserVerification extends UniEntity {
    public static RelativeUrl = 'user-verifications';
    public static EntityType = 'UserVerification';

    public ID: number;
    public VerificationCode: string;
    public UpdatedAt: Date;
    public ExpirationDate: Date;
    public Deleted: boolean;
    public VerificationDate: Date;
    public CompanyId: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
    public DisplayName: string;
    public Email: string;
    public UserId: number;
    public _createguid: string;
    public CustomFields: any;
}


export class Account extends UniEntity {
    public static RelativeUrl = 'accounts';
    public static EntityType = 'Account';

    public Visible: boolean;
    public ID: number;
    public UsePostPost: boolean;
    public DoSynchronize: boolean;
    public AccountNumber: number;
    public Description: string;
    public Active: boolean;
    public LockManualPosts: boolean;
    public UpdatedAt: Date;
    public SaftMappingAccountID: number;
    public Deleted: boolean;
    public Keywords: string;
    public TopLevelAccountGroupID: number;
    public AccountSetupID: number;
    public AccountGroupID: number;
    public SupplierID: number;
    public DimensionsID: number;
    public AccountID: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public EmployeeID: number;
    public Locked: boolean;
    public CreatedBy: string;
    public UseVatDeductionGroupID: number;
    public CostAllocationID: number;
    public SystemAccount: boolean;
    public CustomerID: number;
    public CurrencyCodeID: number;
    public VatTypeID: number;
    public AccountName: string;
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
    public Name: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public AccountID: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class AccountGroup extends UniEntity {
    public static RelativeUrl = 'accountgroups';
    public static EntityType = 'AccountGroup';

    public ID: number;
    public Name: string;
    public UpdatedAt: Date;
    public GroupNumber: string;
    public MainGroupID: number;
    public Deleted: boolean;
    public AccountGroupSetupID: number;
    public AccountGroupSetID: number;
    public AccountID: number;
    public CompatibleAccountID: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
    public Summable: boolean;
    public _createguid: string;
    public MainGroup: AccountGroup;
    public AccountGroupSet: AccountGroupSet;
    public CustomFields: any;
}


export class AccountGroupSet extends UniEntity {
    public static RelativeUrl = 'accountgroupsets';
    public static EntityType = 'AccountGroupSet';

    public ID: number;
    public System: boolean;
    public Name: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public ToAccountNumber: number;
    public Shared: boolean;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
    public SubAccountAllowed: boolean;
    public FromAccountNumber: number;
    public _createguid: string;
    public CustomFields: any;
}


export class AccountMandatoryDimension extends UniEntity {
    public static RelativeUrl = 'accountmandatorydimension';
    public static EntityType = 'AccountMandatoryDimension';

    public ID: number;
    public DimensionNo: number;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public MandatoryType: number;
    public AccountID: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Accrual extends UniEntity {
    public static RelativeUrl = 'accruals';
    public static EntityType = 'Accrual';

    public ID: number;
    public ResultAccountID: number;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public AccrualJournalEntryMode: number;
    public BalanceAccountID: number;
    public JournalEntryLineDraftID: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
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

    public ID: number;
    public JournalEntryDraftLineID: number;
    public Amount: number;
    public UpdatedAt: Date;
    public AccountYear: number;
    public Deleted: boolean;
    public PeriodNo: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public AccrualID: number;
    public CreatedBy: string;
    public _createguid: string;
    public Accrual: Accrual;
    public JournalEntryLineDraft: JournalEntryLineDraft;
    public CustomFields: any;
}


export class Asset extends UniEntity {
    public static RelativeUrl = 'assets';
    public static EntityType = 'Asset';

    public ID: number;
    public Name: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public NetFinancialValue: number;
    public AssetGroupCode: string;
    public BalanceAccountID: number;
    public DimensionsID: number;
    public AutoDepreciation: boolean;
    public ScrapValue: number;
    public DepreciationAccountID: number;
    public CreatedAt: Date;
    public PurchaseAmount: number;
    public UpdatedBy: string;
    public StatusCode: number;
    public DepreciationCycle: number;
    public DepreciationStartDate: LocalDate;
    public PurchaseDate: LocalDate;
    public CreatedBy: string;
    public Lifetime: number;
    public CurrentNetFinancialValue: number;
    public Status: string;
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
    public EmailID: number;
    public BIC: string;
    public Name: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public AddressID: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public PhoneID: number;
    public CreatedBy: string;
    public InitialBIC: string;
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

    public ID: number;
    public AccountNumber: string;
    public IBAN: string;
    public IntegrationStatus: number;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public BusinessRelationID: number;
    public BankID: number;
    public AccountID: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Label: string;
    public StatusCode: number;
    public Locked: boolean;
    public CreatedBy: string;
    public CompanySettingsID: number;
    public BankAccountType: string;
    public IntegrationSettings: string;
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

    public ID: number;
    public Name: string;
    public DefaultAgreement: boolean;
    public UpdatedAt: Date;
    public IsOutgoing: boolean;
    public Deleted: boolean;
    public HasOrderedIntegrationChange: boolean;
    public ServiceID: string;
    public PropertiesJson: string;
    public IsBankBalance: boolean;
    public ServiceProvider: number;
    public BankAcceptance: boolean;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public HasNewAccountInformation: boolean;
    public BankAccountID: number;
    public CreatedBy: string;
    public IsInbound: boolean;
    public ServiceTemplateID: string;
    public Email: string;
    public Password: string;
    public _createguid: string;
    public BankAccount: BankAccount;
    public CustomFields: any;
}


export class BankRule extends UniEntity {
    public static RelativeUrl = 'bankrules';
    public static EntityType = 'BankRule';

    public ID: number;
    public Rule: string;
    public Name: string;
    public UpdatedAt: Date;
    public Priority: number;
    public Deleted: boolean;
    public AccountID: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
    public ActionCode: ActionCodeBankRule;
    public IsActive: boolean;
    public _createguid: string;
    public Account: Account;
    public CustomFields: any;
}


export class BankStatement extends UniEntity {
    public static RelativeUrl = 'bankstatements';
    public static EntityType = 'BankStatement';

    public ID: number;
    public Amount: number;
    public StartBalance: number;
    public UpdatedAt: Date;
    public EndBalance: number;
    public CurrencyCode: string;
    public Deleted: boolean;
    public FromDate: LocalDate;
    public AmountCurrency: number;
    public AccountID: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public FileID: number;
    public BankAccountID: number;
    public CreatedBy: string;
    public ArchiveReference: string;
    public ToDate: LocalDate;
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

    public ID: number;
    public OpenAmount: number;
    public Description: string;
    public Amount: number;
    public OpenAmountCurrency: number;
    public Category: string;
    public UpdatedAt: Date;
    public CurrencyCode: string;
    public Deleted: boolean;
    public BankStatementID: number;
    public AmountCurrency: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public StructuredReference: string;
    public InvoiceNumber: string;
    public CreatedBy: string;
    public TransactionId: string;
    public CID: string;
    public ArchiveReference: string;
    public Receivername: string;
    public ValueDate: LocalDate;
    public ReceiverAccount: string;
    public BookingDate: LocalDate;
    public SenderAccount: string;
    public SenderName: string;
    public _createguid: string;
    public BankStatement: BankStatement;
    public CustomFields: any;
}


export class BankStatementMatch extends UniEntity {
    public static RelativeUrl = 'bankstatementmatch';
    public static EntityType = 'BankStatementMatch';

    public ID: number;
    public Batch: string;
    public Amount: number;
    public UpdatedAt: Date;
    public Group: string;
    public Deleted: boolean;
    public JournalEntryLineID: number;
    public CreatedAt: Date;
    public BankStatementEntryID: number;
    public UpdatedBy: string;
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

    public ID: number;
    public Rule: string;
    public Name: string;
    public UpdatedAt: Date;
    public Priority: number;
    public Deleted: boolean;
    public DimensionsID: number;
    public AccountID: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public EntryText: string;
    public CreatedBy: string;
    public IsActive: boolean;
    public _createguid: string;
    public Dimensions: Dimensions;
    public Account: Account;
    public CustomFields: any;
}


export class Budget extends UniEntity {
    public static RelativeUrl = 'budgets';
    public static EntityType = 'Budget';

    public ID: number;
    public Name: string;
    public UpdatedAt: Date;
    public AccountingYear: number;
    public Deleted: boolean;
    public CreatedAt: Date;
    public UpdatedBy: string;
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
    public Amount: number;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public BudgetID: number;
    public DimensionsID: number;
    public AccountID: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public PeriodNumber: number;
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

    public ID: number;
    public AssetSaleProfitBalancingAccountID: number;
    public UpdatedAt: Date;
    public AssetSaleProductID: number;
    public Deleted: boolean;
    public AssetSaleLossBalancingAccountID: number;
    public ReInvoicingMethod: number;
    public AssetSaleLossVatAccountID: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public ReInvoicingCostsharingProductID: number;
    public AssetWriteoffAccountID: number;
    public CreatedBy: string;
    public AssetSaleProfitVatAccountID: number;
    public AssetSaleProfitNoVatAccountID: number;
    public ReInvoicingTurnoverProductID: number;
    public AssetSaleLossNoVatAccountID: number;
    public _createguid: string;
    public ReInvoicingCostsharingProduct: Product;
    public ReInvoicingTurnoverProduct: Product;
    public CustomFields: any;
}


export class CompanyBankAccount extends UniEntity {
    public static RelativeUrl = 'companybankaccounts';
    public static EntityType = 'CompanyBankAccount';

    public ID: number;
    public Name: string;
    public UpdatedAt: Date;
    public IsOutgoing: boolean;
    public IsIncomming: boolean;
    public Deleted: boolean;
    public IsSalary: boolean;
    public IsTax: boolean;
    public AccountID: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public BankAccountID: number;
    public CreatedBy: string;
    public CreditAmount: number;
    public _createguid: string;
    public BankAccount: BankAccount;
    public Account: Account;
    public CustomFields: any;
}


export class CostAllocation extends UniEntity {
    public static RelativeUrl = 'costallocations';
    public static EntityType = 'CostAllocation';

    public ID: number;
    public Name: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
    public _createguid: string;
    public Items: Array<CostAllocationItem>;
    public CustomFields: any;
}


export class CostAllocationItem extends UniEntity {
    public static RelativeUrl = 'costallocationitems';
    public static EntityType = 'CostAllocationItem';

    public ID: number;
    public Description: string;
    public Percent: number;
    public Amount: number;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public DimensionsID: number;
    public AccountID: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
    public CostAllocationID: number;
    public VatTypeID: number;
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
    public CustomLiquidityPaymentType: CustomLiquidityPaymentInterval;
    public Description: string;
    public DueDate: LocalDate;
    public Amount: number;
    public EndDate: LocalDate;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public AmountCurrency: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public IsCustomerPayment: boolean;
    public CreatedBy: string;
    public CurrencyCodeID: number;
    public _createguid: string;
    public currency: CurrencyCode;
    public CustomFields: any;
}


export class DepreciationLine extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'DepreciationLine';

    public ID: number;
    public AssetJELineID: number;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public DepreciationJELineID: number;
    public CreatedAt: Date;
    public AssetID: number;
    public UpdatedBy: string;
    public StatusCode: number;
    public DepreciationType: number;
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
    public UpdatedAt: Date;
    public ValidTo: LocalDate;
    public Deleted: boolean;
    public Year: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
    public ValidFrom: LocalDate;
    public _createguid: string;
    public CustomFields: any;
}


export class JournalEntry extends UniEntity {
    public static RelativeUrl = 'journalentries';
    public static EntityType = 'JournalEntry';

    public ID: number;
    public JournalEntryDraftGroup: string;
    public Description: string;
    public UpdatedAt: Date;
    public JournalEntryNumberNumeric: number;
    public Deleted: boolean;
    public JournalEntryAccrualID: number;
    public FinancialYearID: number;
    public NumberSeriesID: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public NumberSeriesTaskID: number;
    public CreatedBy: string;
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

    public ID: number;
    public RestAmountCurrency: number;
    public VatDate: LocalDate;
    public OriginalReferencePostID: number;
    public OriginalJournalEntryPost: number;
    public Description: string;
    public DueDate: LocalDate;
    public VatReportID: number;
    public Amount: number;
    public VatPeriodID: number;
    public UpdatedAt: Date;
    public FinancialDate: LocalDate;
    public PaymentInfoTypeID: number;
    public JournalEntryNumberNumeric: number;
    public SubAccountID: number;
    public Deleted: boolean;
    public TaxBasisAmount: number;
    public JournalEntryID: number;
    public PaymentID: string;
    public PaymentReferenceID: number;
    public TaxBasisAmountCurrency: number;
    public JournalEntryTypeID: number;
    public ReferenceCreditPostID: number;
    public AmountCurrency: number;
    public DimensionsID: number;
    public JournalEntryLineDraftID: number;
    public AccountID: number;
    public CustomerInvoiceID: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public VatPercent: number;
    public AccrualID: number;
    public ReferenceOriginalPostID: number;
    public InvoiceNumber: string;
    public CreatedBy: string;
    public PeriodID: number;
    public RegisteredDate: LocalDate;
    public BatchNumber: number;
    public CurrencyExchangeRate: number;
    public Signature: string;
    public CustomerOrderID: number;
    public VatJournalEntryPostID: number;
    public CurrencyCodeID: number;
    public VatTypeID: number;
    public RestAmount: number;
    public JournalEntryNumber: string;
    public VatDeductionPercent: number;
    public PostPostJournalEntryLineID: number;
    public SupplierInvoiceID: number;
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
    public VatDate: LocalDate;
    public Description: string;
    public DueDate: LocalDate;
    public Amount: number;
    public VatPeriodID: number;
    public UpdatedAt: Date;
    public FinancialDate: LocalDate;
    public PaymentInfoTypeID: number;
    public JournalEntryNumberNumeric: number;
    public SubAccountID: number;
    public Deleted: boolean;
    public TaxBasisAmount: number;
    public JournalEntryID: number;
    public PaymentID: string;
    public PaymentReferenceID: number;
    public TaxBasisAmountCurrency: number;
    public JournalEntryTypeID: number;
    public AmountCurrency: number;
    public DimensionsID: number;
    public AccountID: number;
    public CustomerInvoiceID: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public VatPercent: number;
    public AccrualID: number;
    public InvoiceNumber: string;
    public CreatedBy: string;
    public PeriodID: number;
    public RegisteredDate: LocalDate;
    public BatchNumber: number;
    public CurrencyExchangeRate: number;
    public Signature: string;
    public CustomerOrderID: number;
    public CurrencyCodeID: number;
    public VatTypeID: number;
    public JournalEntryNumber: string;
    public VatDeductionPercent: number;
    public PostPostJournalEntryLineID: number;
    public SupplierInvoiceID: number;
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
    public Name: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public VisibleModules: string;
    public ColumnSetUp: string;
    public CreatedAt: Date;
    public TraceLinkTypes: string;
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class JournalEntrySourceSerie extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'JournalEntrySourceSerie';

    public ID: number;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
    public JournalEntrySourceID: number;
    public _createguid: string;
    public JournalEntrySourceInstanceID: number;
    public JournalEntrySourceEntityName: string;
    public CustomFields: any;
}


export class JournalEntryType extends UniEntity {
    public static RelativeUrl = 'journalentrytypes';
    public static EntityType = 'JournalEntryType';

    public ID: number;
    public Number: number;
    public Name: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public MainName: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public ExpectNegativeAmount: boolean;
    public DisplayName: string;
    public _createguid: string;
    public CustomFields: any;
}


export class LedgerSuggestion extends UniEntity {
    public ID: number;
    public Source: SuggestionSource;
    public Name: string;
    public IndustryCode: string;
    public BusinessType: string;
    public OrgNumber: string;
    public IndustryName: string;
}


export class Payment extends UniEntity {
    public static RelativeUrl = 'payments';
    public static EntityType = 'Payment';

    public ID: number;
    public Description: string;
    public DueDate: LocalDate;
    public Amount: number;
    public UpdatedAt: Date;
    public PaymentCodeID: number;
    public PaymentNotificationReportFileID: number;
    public Deleted: boolean;
    public JournalEntryID: number;
    public PaymentID: string;
    public CustomerInvoiceReminderID: number;
    public BusinessRelationID: number;
    public PaymentBatchID: number;
    public FromBankAccountID: number;
    public OcrPaymentStrings: string;
    public ExternalBankAccountNumber: string;
    public PaymentDate: LocalDate;
    public AmountCurrency: number;
    public XmlTagPmtInfIdReference: string;
    public Domain: string;
    public IsExternal: boolean;
    public CustomerInvoiceID: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public AutoJournal: boolean;
    public BankChargeAmount: number;
    public IsCustomerPayment: boolean;
    public InvoiceNumber: string;
    public ReconcilePayment: boolean;
    public IsPaymentClaim: boolean;
    public CreatedBy: string;
    public Proprietary: string;
    public XmlTagEndToEndIdReference: string;
    public Debtor: string;
    public InPaymentID: string;
    public StatusText: string;
    public CurrencyExchangeRate: number;
    public PaymentStatusReportFileID: number;
    public IsPaymentCancellationRequest: boolean;
    public CurrencyCodeID: number;
    public ToBankAccountID: number;
    public SupplierInvoiceID: number;
    public SerialNumberOrAcctSvcrRef: string;
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
    public TransferredDate: Date;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public PaymentReferenceID: string;
    public ReceiptDate: Date;
    public PaymentFileID: number;
    public NumberOfPayments: number;
    public PaymentBatchTypeID: number;
    public OcrHeadingStrings: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public TotalAmount: number;
    public StatusCode: number;
    public IsCustomerPayment: boolean;
    public CreatedBy: string;
    public PaymentStatusReportFileID: number;
    public Camt054CMsgId: string;
    public OcrTransmissionNumber: number;
    public _createguid: string;
    public Payments: Array<Payment>;
    public PaymentBatchType: PaymentBatchType;
    public CustomFields: any;
}


export class PostPost extends UniEntity {
    public static RelativeUrl = 'postposts';
    public static EntityType = 'PostPost';

    public ID: number;
    public Amount: number;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public JournalEntryLine2ID: number;
    public Date: LocalDate;
    public AmountCurrency: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
    public JournalEntryLine1ID: number;
    public CurrencyExchangeRate: number;
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

    public ID: number;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public OwnCostAmount: number;
    public ProductID: number;
    public OwnCostShare: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public TaxExclusiveAmount: number;
    public CreatedBy: string;
    public ReInvoicingType: number;
    public SupplierInvoiceID: number;
    public TaxInclusiveAmount: number;
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
    public Surcharge: number;
    public Share: number;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public NetAmount: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
    public Vat: number;
    public CustomerID: number;
    public ReInvoiceID: number;
    public GrossAmount: number;
    public _createguid: string;
    public Customer: Customer;
    public CustomFields: any;
}


export class SupplierInvoice extends UniEntity {
    public static RelativeUrl = 'supplierinvoices';
    public static EntityType = 'SupplierInvoice';

    public ID: number;
    public RestAmountCurrency: number;
    public PaymentTermsID: number;
    public AmountRegards: string;
    public DeliveryName: string;
    public OurReference: string;
    public InvoiceCountry: string;
    public SupplierOrgNumber: string;
    public DeliveryTermsID: number;
    public InvoiceReferenceID: number;
    public DefaultDimensionsID: number;
    public InvoiceCity: string;
    public ReInvoiced: boolean;
    public Comment: string;
    public PaymentTerm: string;
    public DeliveryDate: LocalDate;
    public UpdatedAt: Date;
    public SalesPerson: string;
    public InvoiceAddressLine1: string;
    public ShippingCountry: string;
    public InvoiceAddressLine2: string;
    public Deleted: boolean;
    public JournalEntryID: number;
    public PaymentID: string;
    public InvoiceDate: LocalDate;
    public InvoicePostalCode: string;
    public DeliveryMethod: string;
    public PayableRoundingCurrencyAmount: number;
    public CreditedAmount: number;
    public PaymentInformation: string;
    public SupplierID: number;
    public Requisition: string;
    public PaymentDueDate: LocalDate;
    public ShippingCity: string;
    public YourReference: string;
    public ProjectID: number;
    public CustomerOrgNumber: string;
    public InvoiceAddressLine3: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public TaxExclusiveAmount: number;
    public ShippingAddressLine1: string;
    public InvoiceNumber: string;
    public InternalNote: string;
    public BankAccountID: number;
    public InvoiceCountryCode: string;
    public CreatedBy: string;
    public TaxExclusiveAmountCurrency: number;
    public ShippingAddressLine2: string;
    public ShippingCountryCode: string;
    public ShippingAddressLine3: string;
    public FreeTxt: string;
    public VatTotalsAmountCurrency: number;
    public PrintStatus: number;
    public CurrencyExchangeRate: number;
    public InvoiceOriginType: SupplierInvoiceOriginType;
    public IsSentToPayment: boolean;
    public Payment: string;
    public PaymentStatus: number;
    public VatTotalsAmount: number;
    public CreditedAmountCurrency: number;
    public CurrencyCodeID: number;
    public DeliveryTerm: string;
    public ShippingPostalCode: string;
    public TaxInclusiveAmountCurrency: number;
    public RestAmount: number;
    public ReInvoiceID: number;
    public PayableRoundingAmount: number;
    public InvoiceReceiverName: string;
    public Credited: boolean;
    public CreditDays: number;
    public CustomerPerson: string;
    public TaxInclusiveAmount: number;
    public InvoiceType: number;
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
    public SumTotalExVatCurrency: number;
    public DiscountCurrency: number;
    public SumTotalExVat: number;
    public PriceIncVat: number;
    public Comment: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public NumberOfItems: number;
    public ItemText: string;
    public DiscountPercent: number;
    public SortIndex: number;
    public CalculateGrossPriceBasedOnNetPrice: boolean;
    public Unit: string;
    public ProductID: number;
    public SumVatCurrency: number;
    public DimensionsID: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public PriceSetByUser: boolean;
    public StatusCode: number;
    public VatPercent: number;
    public Discount: number;
    public CreatedBy: string;
    public AccountingCost: string;
    public PriceExVatCurrency: number;
    public InvoicePeriodStartDate: LocalDate;
    public CurrencyExchangeRate: number;
    public InvoicePeriodEndDate: LocalDate;
    public CurrencyCodeID: number;
    public VatTypeID: number;
    public SumTotalIncVatCurrency: number;
    public SumTotalIncVat: number;
    public SumVat: number;
    public SupplierInvoiceID: number;
    public PriceExVat: number;
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
    public Name: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
    public No: string;
    public _createguid: string;
    public CustomFields: any;
}


export class VatDeduction extends UniEntity {
    public static RelativeUrl = 'vatdeductions';
    public static EntityType = 'VatDeduction';

    public ID: number;
    public VatDeductionGroupID: number;
    public UpdatedAt: Date;
    public ValidTo: LocalDate;
    public Deleted: boolean;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
    public DeductionPercent: number;
    public ValidFrom: LocalDate;
    public _createguid: string;
    public VatDeductionGroup: VatDeductionGroup;
    public CustomFields: any;
}


export class VatDeductionGroup extends UniEntity {
    public static RelativeUrl = 'vatdeductiongroups';
    public static EntityType = 'VatDeductionGroup';

    public ID: number;
    public Name: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class VatPost extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'VatPost';

    public ID: number;
    public ReportAsNegativeAmount: boolean;
    public Name: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public HasTaxBasis: boolean;
    public VatCodeGroupID: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
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

    public ID: number;
    public Comment: string;
    public UpdatedAt: Date;
    public ExecutedDate: Date;
    public ExternalRefNo: string;
    public Deleted: boolean;
    public JournalEntryID: number;
    public InternalComment: string;
    public ReportedDate: Date;
    public VatReportTypeID: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public Title: string;
    public CreatedBy: string;
    public VatReportArchivedSummaryID: number;
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

    public ID: number;
    public AmountToBePayed: number;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public PaymentID: string;
    public PaymentToDescription: string;
    public PaymentPeriod: string;
    public AmountToBeReceived: number;
    public SummaryHeader: string;
    public PaymentDueDate: Date;
    public PaymentYear: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public ReportName: string;
    public CreatedBy: string;
    public PaymentBankAccountNumber: string;
    public _createguid: string;
    public CustomFields: any;
}


export class VatReportReference extends UniEntity {
    public static RelativeUrl = 'vatreportreferences';
    public static EntityType = 'VatReportReference';

    public ID: number;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public AccountID: number;
    public VatPostID: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
    public VatTypeID: number;
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
    public Name: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class VatType extends UniEntity {
    public static RelativeUrl = 'vattypes';
    public static EntityType = 'VatType';

    public Visible: boolean;
    public ID: number;
    public Name: string;
    public UpdatedAt: Date;
    public VatCode: string;
    public InUse: boolean;
    public Deleted: boolean;
    public OutputVat: boolean;
    public VatCodeGroupingValue: VatCodeGroupingValueEnum;
    public DirectJournalEntryOnly: boolean;
    public VatCodeGroupID: number;
    public Alias: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public OutgoingAccountID: number;
    public StatusCode: number;
    public Locked: boolean;
    public CreatedBy: string;
    public VatTypeSetupID: number;
    public AvailableInModules: boolean;
    public ReversedTaxDutyVat: boolean;
    public IncomingAccountID: number;
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
    public UpdatedAt: Date;
    public ValidTo: LocalDate;
    public Deleted: boolean;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public VatPercent: number;
    public CreatedBy: string;
    public VatTypeID: number;
    public ValidFrom: LocalDate;
    public _createguid: string;
    public CustomFields: any;
}


export class EntityValidationRule extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'EntityValidationRule';

    public ID: number;
    public System: boolean;
    public Value: string;
    public EntityType: string;
    public UpdatedAt: Date;
    public Operator: Operator;
    public Deleted: boolean;
    public Operation: OperationType;
    public OnConflict: OnConflict;
    public PropertyName: string;
    public CreatedAt: Date;
    public ChangedByCompany: boolean;
    public UpdatedBy: string;
    public Level: ValidationLevel;
    public CreatedBy: string;
    public Message: string;
    public SyncKey: string;
    public _createguid: string;
    public CustomFields: any;
}


export class EntityValidationRuleTemplate extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'EntityValidationRuleTemplate';

    public ID: number;
    public System: boolean;
    public Value: string;
    public EntityType: string;
    public UpdatedAt: Date;
    public Operator: Operator;
    public Deleted: boolean;
    public Operation: OperationType;
    public OnConflict: OnConflict;
    public PropertyName: string;
    public CreatedAt: Date;
    public ChangedByCompany: boolean;
    public UpdatedBy: string;
    public Level: ValidationLevel;
    public CreatedBy: string;
    public Message: string;
    public SyncKey: string;
    public _createguid: string;
    public CustomFields: any;
}


export class ComplexValidationRule extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ComplexValidationRule';

    public ID: number;
    public System: boolean;
    public EntityType: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public Operation: OperationType;
    public OnConflict: OnConflict;
    public ValidationCode: number;
    public CreatedAt: Date;
    public ChangedByCompany: boolean;
    public UpdatedBy: string;
    public Level: ValidationLevel;
    public CreatedBy: string;
    public Message: string;
    public SyncKey: string;
    public _createguid: string;
    public CustomFields: any;
}


export class ComplexValidationRuleTemplate extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ComplexValidationRuleTemplate';

    public ID: number;
    public System: boolean;
    public EntityType: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public Operation: OperationType;
    public OnConflict: OnConflict;
    public ValidationCode: number;
    public CreatedAt: Date;
    public ChangedByCompany: boolean;
    public UpdatedBy: string;
    public Level: ValidationLevel;
    public CreatedBy: string;
    public Message: string;
    public SyncKey: string;
    public _createguid: string;
    public CustomFields: any;
}


export class CustomField extends UniEntity {
    public static RelativeUrl = 'custom-fields';
    public static EntityType = 'CustomField';

    public ID: number;
    public Name: string;
    public UpdatedAt: Date;
    public Nullable: boolean;
    public Deleted: boolean;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
    public DataType: string;
    public ModelID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class ValueList extends UniEntity {
    public static RelativeUrl = 'valuelists';
    public static EntityType = 'ValueList';

    public ID: number;
    public Description: string;
    public Name: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Code: string;
    public _createguid: string;
    public Items: Array<ValueItem>;
    public CustomFields: any;
}


export class ValueItem extends UniEntity {
    public static RelativeUrl = 'valueitems';
    public static EntityType = 'ValueItem';

    public ID: number;
    public Description: string;
    public Name: string;
    public Value: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public ValueListID: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Code: string;
    public Index: number;
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
    public FieldSet: number;
    public Description: string;
    public Combo: number;
    public LookupEntityType: string;
    public Options: string;
    public EntityType: string;
    public UpdatedAt: Date;
    public Section: number;
    public Legend: string;
    public Property: string;
    public Deleted: boolean;
    public ValueList: string;
    public LineBreak: boolean;
    public LookupField: boolean;
    public Placeholder: string;
    public Placement: number;
    public CreatedAt: Date;
    public ComponentLayoutID: number;
    public Hidden: boolean;
    public UpdatedBy: string;
    public Label: string;
    public StatusCode: number;
    public DisplayField: string;
    public ReadOnly: boolean;
    public Alignment: Alignment;
    public CreatedBy: string;
    public FieldType: FieldType;
    public HelpText: string;
    public Url: string;
    public Sectionheader: string;
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
    public Workflow: TimesheetWorkflow;
    public ToDate: Date;
    public Relation: WorkRelation;
    public Items: Array<TimeSheetItem>;
}


export class TimeSheetItem extends UniEntity {
    public Overtime: number;
    public Projecttime: number;
    public Flextime: number;
    public ValidTimeOff: number;
    public Status: WorkStatus;
    public WeekDay: number;
    public Date: Date;
    public TotalTime: number;
    public Invoicable: number;
    public StartTime: Date;
    public TimeOff: number;
    public ExpectedTime: number;
    public EndTime: Date;
    public Workflow: TimesheetWorkflow;
    public IsWeekend: boolean;
    public ValidTime: number;
    public WeekNumber: number;
    public SickTime: number;
}


export class WorkBalanceDto extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'WorkBalanceDto';

    public ID: number;
    public Minutes: number;
    public Description: string;
    public UpdatedAt: Date;
    public ActualMinutes: number;
    public ValidTimeOff: number;
    public WorkRelationID: number;
    public Deleted: boolean;
    public Days: number;
    public BalanceDate: Date;
    public LastDayExpected: number;
    public LastDayActual: number;
    public CreatedAt: Date;
    public Balancetype: WorkBalanceTypeEnum;
    public UpdatedBy: string;
    public StatusCode: number;
    public SumOvertime: number;
    public ExpectedMinutes: number;
    public CreatedBy: string;
    public IsStartBalance: boolean;
    public BalanceFrom: Date;
    public ValidFrom: Date;
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
    public ValidTimeOff: number;
    public Date: Date;
    public ExpectedMinutes: number;
    public IsWeekend: boolean;
    public WorkedMinutes: number;
}


export class ContactSearchServiceResponse extends UniEntity {
    public ErrorCode: number;
    public Success: boolean;
    public ErrorMessage: string;
    public Method: string;
    public ObjectName: string;
}


export class InvoicesAndRemindersReadyToRemind extends UniEntity {
    public RestAmountCurrency: number;
    public CustomerNumber: number;
    public DontSendReminders: boolean;
    public DueDate: Date;
    public CustomerName: string;
    public ReminderNumber: number;
    public Interest: number;
    public CustomerInvoiceReminderID: number;
    public InvoiceDate: Date;
    public CustomerInvoiceID: number;
    public StatusCode: number;
    public InvoiceNumber: number;
    public EmailAddress: string;
    public CurrencyExchangeRate: number;
    public CustomerID: number;
    public CurrencyCodeCode: string;
    public ExternalReference: string;
    public CurrencyCodeID: number;
    public Fee: number;
    public TaxInclusiveAmountCurrency: number;
    public RestAmount: number;
    public CurrencyCodeShortCode: string;
    public TaxInclusiveAmount: number;
}


export class TradeHeaderCalculationSummary extends UniEntity {
    public SumTotalExVatCurrency: number;
    public SumTotalExVat: number;
    public SumDiscount: number;
    public SumVatCurrency: number;
    public SumNoVatBasis: number;
    public SumNoVatBasisCurrency: number;
    public SumVatBasisCurrency: number;
    public SumVatBasis: number;
    public SumDiscountCurrency: number;
    public DecimalRoundingCurrency: number;
    public DecimalRounding: number;
    public SumTotalIncVatCurrency: number;
    public SumTotalIncVat: number;
    public SumVat: number;
}


export class VatCalculationSummary extends UniEntity {
    public SumVatCurrency: number;
    public VatPercent: number;
    public SumVatBasisCurrency: number;
    public SumVatBasis: number;
    public SumVat: number;
}


export class InvoicePaymentData extends UniEntity {
    public AgioAccountID: number;
    public Amount: number;
    public PaymentID: string;
    public FromBankAccountID: number;
    public PaymentDate: LocalDate;
    public AmountCurrency: number;
    public DimensionsID: number;
    public AccountID: number;
    public BankChargeAccountID: number;
    public BankChargeAmount: number;
    public CurrencyExchangeRate: number;
    public AgioAmount: number;
    public CurrencyCodeID: number;
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


export class OrderOffer extends UniEntity {
    public Status: string;
    public CostPercentage: number;
    public OrderId: string;
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
    public Amount: number;
    public Currency: string;
}


export class Limits extends UniEntity {
    public Limit: number;
    public RemainingLimit: number;
    public MaxInvoiceAmount: number;
}


export class AmeldingAgaAndTaxSums extends UniEntity {
    public AccountNumber: string;
    public KIDTaxDraw: string;
    public MessageID: string;
    public GarnishmentTax: number;
    public DueDate: Date;
    public FinancialTax: number;
    public TaxDraw: number;
    public KIDGarnishment: string;
    public EmploymentTax: number;
    public KIDFinancialTax: string;
    public period: number;
    public KIDEmploymentTax: string;
}


export class PayrollRunInAmeldingPeriod extends UniEntity {
    public CanGenerateAddition: boolean;
    public PayrollrunDescription: string;
    public PayrollrunPaydate: Date;
    public AmeldingSentdate: Date;
    public PayrollrunID: number;
}


export class PayAgaTaxDTO extends UniEntity {
    public correctPennyDiff: boolean;
    public payGarnishment: boolean;
    public payFinancialTax: boolean;
    public payTaxDraw: boolean;
    public payDate: Date;
    public payAga: boolean;
}


export class AmeldingSumUp extends UniEntity {
    public ID: number;
    public sent: Date;
    public generated: Date;
    public type: AmeldingType;
    public status: AmeldingStatus;
    public year: number;
    public meldingsID: string;
    public altInnStatus: string;
    public LegalEntityNo: string;
    public period: number;
    public ReplacesAMeldingID: number;
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
    public name: string;
    public employeeNumber: number;
    public arbeidsforhold: Array<Employments>;
}


export class Employments extends UniEntity {
    public endDate: Date;
    public startDate: Date;
    public arbeidsforholdId: string;
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
    public description: string;
    public tax: boolean;
    public amount: number;
    public benefit: string;
    public incomeType: string;
    public Base_EmploymentTax: boolean;
}


export class AGADetails extends UniEntity {
    public rate: number;
    public type: string;
    public sectorName: string;
    public baseAmount: number;
    public zoneName: string;
}


export class Totals extends UniEntity {
    public sumUtleggstrekk: number;
    public sumTax: number;
    public sumAGA: number;
}


export class AnnualStatement extends UniEntity {
    public EmployerTaxMandatory: boolean;
    public EmployerEmail: string;
    public EmployeeMunicipalNumber: string;
    public EmployerWebAddress: string;
    public EmployerPhoneNumber: string;
    public VacationPayBase: number;
    public Year: number;
    public EmployeeCity: string;
    public EmployeeMunicipalName: string;
    public EmployeeSSn: string;
    public EmployerOrgNr: string;
    public EmployerName: string;
    public EmployerCity: string;
    public EmployeeName: string;
    public EmployerPostCode: string;
    public EmployerCountry: string;
    public EmployeeNumber: number;
    public EmployeeAddress: string;
    public EmployerAddress: string;
    public EmployerCountryCode: string;
    public EmployeePostCode: string;
    public Contributions: Array<AnnualStatementLine>;
    public PensionOrBenefits: Array<AnnualStatementLine>;
    public Deductions: Array<AnnualStatementLine>;
    public Draws: Array<AnnualStatementLine>;
}


export class AnnualStatementLine extends UniEntity {
    public Description: string;
    public Sum: number;
    public Amount: number;
    public LineIndex: number;
    public TaxReturnPost: string;
    public IsDeduction: boolean;
    public SupplementPackageName: string;
    public Supplements: Array<SupplementInfo>;
}


export class SupplementInfo extends UniEntity {
    public ValueDate2: Date;
    public Name: string;
    public WageTypeSupplementID: number;
    public ValueString: string;
    public ValueBool: boolean;
    public ValueMoney: number;
    public ValueType: Valuetype;
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
    public IsJob: boolean;
    public mainStatus: string;
    public Text: string;
    public Title: string;
    public employeestatus: Array<EmployeeStatus>;
}


export class EmployeeStatus extends UniEntity {
    public status: string;
    public year: number;
    public info: string;
    public employeeID: number;
    public ssn: string;
    public employeeNumber: number;
    public changedFields: Array<FieldsChanged>;
}


export class FieldsChanged extends UniEntity {
    public valFrom: string;
    public valTo: string;
    public fieldName: string;
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
    public baseVacation: number;
    public grossPayment: number;
    public advancePayment: number;
    public nonTaxableAmount: number;
    public taxBase: number;
    public paidHolidaypay: number;
    public employeeID: number;
    public sumTax: number;
    public netPayment: number;
    public pension: number;
    public usedNonTaxableAmount: number;
}


export class VacationPayLastYear extends UniEntity {
    public baseVacation: number;
    public paidHolidayPay: number;
    public employeeID: number;
}


export class SalaryTransactionPay extends UniEntity {
    public CompanyPostalCode: string;
    public PaymentDate: Date;
    public CompanyCity: string;
    public TaxBankAccountID: number;
    public Withholding: number;
    public SalaryBankAccountID: number;
    public CompanyAddress: string;
    public CompanyName: string;
    public CompanyBankAccountID: number;
    public PayList: Array<SalaryTransactionPayLine>;
    public SalaryBalancePayList: Array<SalaryBalancePayLine>;
}


export class SalaryTransactionPayLine extends UniEntity {
    public Tax: number;
    public PostalCode: string;
    public Address: string;
    public EmployeeName: string;
    public City: string;
    public NetPayment: number;
    public Account: string;
    public EmployeeNumber: number;
}


export class SalaryBalancePayLine extends UniEntity {
    public Sum: number;
    public Text: string;
    public Kid: string;
    public Account: string;
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
    public ReportID: number;
    public GroupByWageType: boolean;
    public Message: string;
}


export class WorkItemToSalary extends UniEntity {
    public Rate: number;
    public PayrollRunID: number;
    public WageType: WageType;
    public Employment: Employment;
    public WorkItems: Array<WorkItem>;
}


export class Reconciliation extends UniEntity {
    public FromPeriod: number;
    public Year: number;
    public CalculatedPayruns: number;
    public CreatedPayruns: number;
    public BookedPayruns: number;
    public ToPeriod: number;
    public Groups: Array<ReconciliationGroup>;
}


export class ReconciliationGroup extends UniEntity {
    public AccountNumber: string;
    public Sum: number;
    public Lines: Array<ReconciliationLine>;
}


export class ReconciliationLine extends UniEntity {
    public Description: string;
    public Sum: number;
    public Benefit: string;
    public IncomeType: string;
    public WageTypeNumber: number;
    public HasEmploymentTax: boolean;
    public WageTypeName: string;
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
    public Ensurance: number;
    public MemberNumber: string;
    public UnionDraw: number;
    public OUO: number;
}


export class SalaryTransactionSums extends UniEntity {
    public baseVacation: number;
    public Employee: number;
    public grossPayment: number;
    public baseAGA: number;
    public percentTax: number;
    public manualTax: number;
    public calculatedAGA: number;
    public paidPension: number;
    public baseTableTax: number;
    public calculatedVacationPay: number;
    public calculatedFinancialTax: number;
    public netPayment: number;
    public paidAdvance: number;
    public basePercentTax: number;
    public Payrun: number;
    public tableTax: number;
}


export class SalaryTransactionPeriodSums extends UniEntity {
    public AgaRate: number;
    public FromPeriod: number;
    public Year: number;
    public AgaZone: string;
    public OrgNumber: string;
    public MunicipalName: string;
    public ToPeriod: number;
    public Sums: SalaryTransactionSums;
    public Aga: AGACalculation;
}


export class code extends UniEntity {
    public kunfranav: string;
    public skatteOgAvgiftregel: string;
    public uninavn: string;
    public utloeserArbeidsgiveravgift: string;
    public gyldigfom: string;
    public fordel: string;
    public gyldigtil: string;
    public gmlcode: string;
    public postnr: string;
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
    public IsTemplate: boolean;
    public LicenseKey: string;
    public TemplateCompanyKey: string;
    public ProductNames: string;
    public IsTest: boolean;
    public ContractID: number;
    public CopyFiles: boolean;
    public ContractType: number;
    public CompanyName: string;
    public CompanySettings: CompanySettings;
}


export class UserDto extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'UserDto';

    public ID: number;
    public Protected: boolean;
    public IsAutobankAdmin: boolean;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public PhoneNumber: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public HasAgreedToImportDisclaimer: boolean;
    public CreatedBy: string;
    public UserName: string;
    public GlobalIdentity: string;
    public PermissionHandling: string;
    public BankIntegrationUserName: string;
    public LastLogin: Date;
    public DisplayName: string;
    public Email: string;
    public EndDate: Date;
    public TwoFactorEnabled: boolean;
    public _createguid: string;
    public AuthPhoneNumber: string;
    public License: UserLicenseInformation;
    public CustomFields: any;
}


export class UserLicenseInformation extends UniEntity {
    public Name: string;
    public Comment: string;
    public UserLicenseKey: string;
    public GlobalIdentity: string;
    public CustomerAgreement: CustomerLicenseAgreementInfo;
    public UserType: UserLicenseType;
    public Company: CompanyLicenseInfomation;
    public ContractType: ContractLicenseType;
    public UserLicenseAgreement: LicenseAgreementInfo;
}


export class CustomerLicenseAgreementInfo extends UniEntity {
    public HasAgreedToLicense: boolean;
    public CanAgreeToLicense: boolean;
    public AgreementId: number;
}


export class UserLicenseType extends UniEntity {
    public TypeName: string;
    public EndDate: Date;
    public TypeID: number;
}


export class CompanyLicenseInfomation extends UniEntity {
    public ID: number;
    public Name: string;
    public ContactEmail: string;
    public EndDate: Date;
    public ContactPerson: string;
    public StatusCode: LicenseEntityStatus;
    public Key: string;
    public ContractID: number;
    public Agency: Agency;
}


export class Agency extends UniEntity {
    public Name: string;
    public CompanyKey: string;
}


export class ContractLicenseType extends UniEntity {
    public TypeName: string;
    public StartDate: Date;
    public TrialExpiration: Date;
    public TypeID: number;
}


export class LicenseAgreementInfo extends UniEntity {
    public HasAgreedToLicense: boolean;
    public AgreementId: number;
}


export class CreateBankUserDTO extends UniEntity {
    public Password: string;
    public IsAdmin: boolean;
    public AdminUserId: number;
    public AdminPassword: string;
    public Phone: string;
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
    public ValidTo: Date;
    public Status: ChallengeRequestResult;
    public Message: string;
    public ValidFrom: Date;
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
    public IncludeInfoPerPerson: boolean;
    public ReportType: ReportType;
    public FromPeriod: Maaned;
    public Year: number;
    public IncludeIncome: boolean;
    public ToPeriod: Maaned;
    public IncludeEmployments: boolean;
}


export class A07Response extends UniEntity {
    public Data: string;
    public mainStatus: string;
    public Text: string;
    public Title: string;
    public DataType: string;
    public DataName: string;
}


export class SelfEmployed extends UniEntity {
    public year: number;
    public items: Array<SelfEmployedItem>;
}


export class SelfEmployedItem extends UniEntity {
    public number: string;
    public name: string;
    public amount: number;
    public supplierID: number;
}


export class SetIntegrationDataDto extends UniEntity {
    public ExternalId: string;
    public IntegrationKey: string;
}


export class CurrencyRateData extends UniEntity {
    public Factor: number;
    public IsOverrideRate: boolean;
    public ExchangeRate: number;
    public FromCurrencyCode: CurrencyCode;
}


export class EmailDTO extends UniEntity {
    public Subject: string;
    public Format: string;
    public FromAddress: string;
    public ReportID: number;
    public CopyAddress: string;
    public Message: string;
    public Parameters: Array<ReportParameter>;
}


export class ReportParameter extends UniEntity {
    public Name: string;
    public Value: string;
}


export class SendEmail extends UniEntity {
    public Subject: string;
    public Localization: string;
    public EntityType: string;
    public FromAddress: string;
    public ReportID: number;
    public CopyAddress: string;
    public ReportName: string;
    public ExternalReference: string;
    public Message: string;
    public EntityID: number;
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
    public Title: string;
    public Url: string;
    public Items: Array<RssItem>;
}


export class RssItem extends UniEntity {
    public Description: string;
    public Link: string;
    public Category: string;
    public PubDate: string;
    public Title: string;
    public Guid: string;
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
    public ReportBalance: number;
    public Name: string;
    public MinutesWorked: number;
    public TotalBalance: number;
    public ExpectedMinutes: number;
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
    public orgname: string;
    public contactphone: string;
    public contactname: string;
    public orgno: string;
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
    public AccountNumber: string;
    public UpdatedAt: Date;
    public Deleted: boolean;
    public DimensionsID: number;
    public MissingRequiredDimensionsMessage: string;
    public journalEntryLineDraftID: number;
    public AccountID: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public StatusCode: number;
    public CreatedBy: string;
    public MissingOnlyWarningsDimensionsMessage: string;
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
    public Number: number;
    public LastDepreciation: LocalDate;
    public Name: string;
    public DepreciationAccountNumber: number;
    public BalanceAccountName: string;
    public BalanceAccountNumber: number;
    public GroupName: string;
    public CurrentValue: number;
    public GroupCode: string;
    public Lifetime: number;
    public Lines: Array<AssetReportLineDTO>;
}


export class AssetReportLineDTO extends UniEntity {
    public Value: number;
    public Type: string;
    public Date: LocalDate;
    public TypeID: number;
}


export class BankData extends UniEntity {
    public AccountNumber: string;
    public IBAN: string;
    public Bank: Bank;
}


export class CreateBankIntegrationDTO extends UniEntity {
    public Password: string;
    public IsOutgoing: boolean;
    public BankApproval: boolean;
    public IsBankBalance: boolean;
    public ServiceProvider: number;
    public BankAcceptance: boolean;
    public RequireTwoStage: boolean;
    public BankAccountID: number;
    public IsBankStatement: boolean;
    public IsInbound: boolean;
    public UserName: string;
    public Bank: string;
    public DisplayName: string;
    public Email: string;
    public Phone: string;
    public TuserName: string;
    public BankAccounts: Array<BankAccountDTO>;
}


export class BankAccountDTO extends UniEntity {
    public Bic: string;
    public IBAN: string;
    public IsOutgoing: boolean;
    public IsBankBalance: boolean;
    public IsBankStatement: boolean;
    public BBAN: string;
    public IsInbound: boolean;
}


export class ZdataUpdateBankProperties extends UniEntity {
    public Password: string;
    public IsOutgoing: boolean;
    public ServiceID: string;
    public IsBankBalance: boolean;
    public IsBankStatement: boolean;
    public IsInbound: boolean;
}


export class AutobankUserDTO extends UniEntity {
    public Password: string;
    public IsAdmin: boolean;
    public Phone: string;
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
    public Amount: number;
    public Group: string;
    public JournalEntryLineID: number;
    public BankStatementEntryID: number;
}


export class MatchRequest extends UniEntity {
    public JournalEntries: Array<MatchCandidate>;
    public BankEntries: Array<MatchCandidate>;
    public Settings: MatchSettings;
}


export class MatchCandidate extends UniEntity {
    public ID: number;
    public Amount: number;
    public IsBankEntry: boolean;
    public Date: Date;
    public Closed: boolean;
}


export class MatchSettings extends UniEntity {
    public MaxDayOffset: number;
    public MaxDelta: number;
}


export class ReconciliationStatus extends UniEntity {
    public NumberOfUnReconciled: number;
    public TotalUnreconciled: number;
    public NumberOfItems: number;
    public FromDate: Date;
    public AccountID: number;
    public IsReconciled: boolean;
    public TotalAmount: number;
    public Todate: Date;
}


export class BalanceDto extends UniEntity {
    public EndDate: Date;
    public StartDate: Date;
    public Balance: number;
    public BalanceInStatement: number;
}


export class BankfileFormat extends UniEntity {
    public Name: string;
    public Separator: string;
    public IsXml: boolean;
    public IsFixed: boolean;
    public FileExtension: string;
    public SkipRows: number;
    public LinePrefix: string;
    public CustomFormat: BankFileCustomFormat;
    public Columns: Array<BankfileColumn>;
}


export class BankfileColumn extends UniEntity {
    public IsFallBack: boolean;
    public Length: number;
    public FieldMapping: BankfileField;
    public DataType: BankfileDataType;
    public StartPos: number;
}


export class JournalSuggestion extends UniEntity {
    public Description: string;
    public Amount: number;
    public FinancialDate: LocalDate;
    public AccountID: number;
    public BankStatementRuleID: number;
    public MatchWithEntryID: number;
    public Account: Account;
}


export class ReportRow extends UniEntity {
    public ID: number;
    public Period1: number;
    public BudgetAccumulated: number;
    public AccountNumber: number;
    public IsSubTotal: boolean;
    public SumPeriod: number;
    public Period3: number;
    public Sum: number;
    public BudPeriod9: number;
    public Period6: number;
    public GroupNumber: number;
    public AccountYear: number;
    public Period8: number;
    public Period10: number;
    public SumPeriodLastYearAccumulated: number;
    public BudPeriod12: number;
    public SubGroupName: string;
    public Period5: number;
    public Period2: number;
    public Period9: number;
    public BudPeriod1: number;
    public SubGroupNumber: number;
    public BudPeriod8: number;
    public BudPeriod11: number;
    public Period4: number;
    public Period11: number;
    public BudPeriod10: number;
    public BudgetSum: number;
    public BudPeriod3: number;
    public GroupName: string;
    public BudPeriod4: number;
    public PrecedingBalance: number;
    public BudPeriod6: number;
    public BudPeriod2: number;
    public SumPeriodAccumulated: number;
    public Period12: number;
    public SumPeriodLastYear: number;
    public Period7: number;
    public BudPeriod5: number;
    public AccountName: string;
    public BudPeriod7: number;
    public SumLastYear: number;
}


export class BudgetImport extends UniEntity {
    public Budget: Budget;
}


export class LiquidityTableDTO extends UniEntity {
    public BankBalanceRefferance: BankBalanceType;
    public OverdueSupplierInvoices: number;
    public OverdueCustomerInvoices: number;
    public BankBalance: number;
    public Period: Array<DetailsDTO>;
}


export class DetailsDTO extends UniEntity {
    public CustomPayments: number;
    public Sum: number;
    public Liquidity: number;
    public Supplier: number;
    public VAT: number;
    public Custumer: number;
}


export class JournalEntryData extends UniEntity {
    public VatDate: LocalDate;
    public JournalEntryNo: string;
    public CreditVatTypeID: number;
    public Description: string;
    public DebitVatTypeID: number;
    public DueDate: LocalDate;
    public Amount: number;
    public CurrencyID: number;
    public CreditAccountID: number;
    public JournalEntryDataAccrualID: number;
    public FinancialDate: LocalDate;
    public JournalEntryID: number;
    public PaymentID: string;
    public CreditAccountNumber: number;
    public AmountCurrency: number;
    public NumberSeriesID: number;
    public CustomerInvoiceID: number;
    public DebitAccountID: number;
    public StatusCode: number;
    public InvoiceNumber: string;
    public NumberSeriesTaskID: number;
    public DebitAccountNumber: number;
    public CurrencyExchangeRate: number;
    public SupplierInvoiceNo: string;
    public CustomerOrderID: number;
    public VatDeductionPercent: number;
    public PostPostJournalEntryLineID: number;
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
    public PeriodSumYear2: number;
    public PeriodName: string;
    public PeriodNo: number;
    public PeriodSumYear1: number;
}


export class JournalEntryLineRequestSummary extends UniEntity {
    public SumDebit: number;
    public SumTaxBasisAmount: number;
    public SumBalance: number;
    public SumLedger: number;
    public SumCredit: number;
}


export class JournalEntryLinePostPostData extends UniEntity {
    public ID: number;
    public RestAmountCurrency: number;
    public Description: string;
    public DueDate: Date;
    public Amount: number;
    public FinancialDate: Date;
    public JournalEntryNumberNumeric: number;
    public AccountYear: number;
    public JournalEntryID: number;
    public PaymentID: string;
    public SumPostPostAmountCurrency: number;
    public PeriodNo: number;
    public NumberOfPayments: number;
    public AmountCurrency: number;
    public SubAccountName: string;
    public StatusCode: number;
    public MarkedAgainstJournalEntryNumber: string;
    public InvoiceNumber: string;
    public SumPostPostAmount: number;
    public MarkedAgainstJournalEntryLineID: number;
    public JournalEntryTypeName: string;
    public CurrencyExchangeRate: number;
    public CurrencyCodeCode: string;
    public CurrencyCodeID: number;
    public RestAmount: number;
    public JournalEntryNumber: string;
    public SubAccountNumber: number;
    public CurrencyCodeShortCode: string;
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
    public ID: number;
    public RestAmountCurrency: number;
    public Amount: number;
    public OriginalRestAmount: number;
    public FinancialDate: Date;
    public AmountCurrency: number;
    public OriginalStatusCode: StatusCodeJournalEntryLine;
    public StatusCode: StatusCodeJournalEntryLine;
    public InvoiceNumber: string;
    public RestAmount: number;
    public JournalEntryNumber: string;
    public Markings: Array<MarkingReference>;
}


export class MarkingReference extends UniEntity {
    public ID: number;
    public JournalEntryNumber: string;
}


export class SupplierInvoiceDetail extends UniEntity {
    public AccountNumber: number;
    public Description: string;
    public Amount: number;
    public DeliveryDate: Date;
    public VatCode: string;
    public InvoiceDate: Date;
    public SupplierID: number;
    public AmountCurrency: number;
    public AccountID: number;
    public VatPercent: number;
    public InvoiceNumber: string;
    public VatTypeID: number;
    public VatTypeName: string;
    public SupplierInvoiceID: number;
    public AccountName: string;
}


export class VatReportMessage extends UniEntity {
    public Level: ValidationLevel;
    public Message: string;
}


export class VatReportSummary extends UniEntity {
    public SumTaxBasisAmount: number;
    public NumberOfJournalEntryLines: number;
    public HasTaxBasis: boolean;
    public VatCodeGroupID: number;
    public IsHistoricData: boolean;
    public VatCodeGroupName: string;
    public SumVatAmount: number;
    public VatCodeGroupNo: string;
    public HasTaxAmount: boolean;
}


export class VatReportSummaryPerPost extends UniEntity {
    public VatPostNo: string;
    public SumTaxBasisAmount: number;
    public NumberOfJournalEntryLines: number;
    public HasTaxBasis: boolean;
    public VatPostName: string;
    public VatPostID: number;
    public VatCodeGroupID: number;
    public IsHistoricData: boolean;
    public VatCodeGroupName: string;
    public SumVatAmount: number;
    public VatCodeGroupNo: string;
    public VatPostReportAsNegativeAmount: boolean;
    public HasTaxAmount: boolean;
}


export class VatReportSummaryPerPostPerAccount extends UniEntity {
    public VatDate: Date;
    public VatPostNo: string;
    public VatJournalEntryPostAccountName: string;
    public SumTaxBasisAmount: number;
    public Description: string;
    public NumberOfJournalEntryLines: number;
    public Amount: number;
    public VatCode: string;
    public FinancialDate: Date;
    public TaxBasisAmount: number;
    public StdVatCode: string;
    public HasTaxBasis: boolean;
    public VatPostName: string;
    public VatPostID: number;
    public VatCodeGroupID: number;
    public VatAccountID: number;
    public IsHistoricData: boolean;
    public VatAccountNumber: number;
    public VatJournalEntryPostAccountNumber: number;
    public VatCodeGroupName: string;
    public SumVatAmount: number;
    public VatJournalEntryPostAccountID: number;
    public VatCodeGroupNo: string;
    public JournalEntryNumber: string;
    public VatPostReportAsNegativeAmount: boolean;
    public HasTaxAmount: boolean;
    public VatAccountName: string;
}


export class VatReportNotReportedJournalEntryData extends UniEntity {
    public SumTaxBasisAmount: number;
    public NumberOfJournalEntryLines: number;
    public SumVatAmount: number;
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


export enum ShipTradeArea{
    notSet = 0,
    Domestic = 1,
    Foreign = 2,
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


export enum RemunerationType{
    notSet = 0,
    FixedSalary = 1,
    HourlyPaid = 2,
    PaidOnCommission = 3,
    OnAgreement_Honorar = 4,
    ByPerformance = 5,
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


export enum SalBalType{
    Advance = 1,
    Contribution = 2,
    Outlay = 3,
    Garnishment = 4,
    Other = 5,
    Union = 6,
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
