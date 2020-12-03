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
    public ClientID: string;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public Transaction: string;
    public Action: string;
    public Route: string;
    public Verb: string;
    public Deleted: boolean;
    public EntityID: number;
    public OldValue: string;
    public NewValue: string;
    public UpdatedBy: string;
    public EntityType: string;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class WorkBalance extends UniEntity {
    public static RelativeUrl = 'workbalances';
    public static EntityType = 'WorkBalance';

    public BalanceFrom: Date;
    public ValidTimeOff: number;
    public Days: number;
    public CreatedAt: Date;
    public ActualMinutes: number;
    public WorkRelationID: number;
    public ExpectedMinutes: number;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public StatusCode: number;
    public IsStartBalance: boolean;
    public Deleted: boolean;
    public BalanceDate: Date;
    public ValidFrom: Date;
    public Minutes: number;
    public Balancetype: WorkBalanceTypeEnum;
    public UpdatedBy: string;
    public ID: number;
    public Description: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Worker extends UniEntity {
    public static RelativeUrl = 'workers';
    public static EntityType = 'Worker';

    public BusinessRelationID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public StatusCode: number;
    public EmployeeID: number;
    public Deleted: boolean;
    public UserID: number;
    public UpdatedBy: string;
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

    public DimensionsID: number;
    public TransferedToPayroll: boolean;
    public CustomerID: number;
    public CreatedAt: Date;
    public PriceExVat: number;
    public OrderItemId: number;
    public TransferedToOrder: boolean;
    public WorkRelationID: number;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public WorkItemGroupID: number;
    public StatusCode: number;
    public Date: Date;
    public Deleted: boolean;
    public PayrollTrackingID: number;
    public Minutes: number;
    public Label: string;
    public StartTime: Date;
    public LunchInMinutes: number;
    public UpdatedBy: string;
    public Invoiceable: boolean;
    public EndTime: Date;
    public ID: number;
    public Description: string;
    public MinutesToOrder: number;
    public CustomerOrderID: number;
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

    public CreatedAt: Date;
    public WorkRelationID: number;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public StatusCode: number;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public _createguid: string;
    public WorkRelation: WorkRelation;
    public Items: Array<WorkItem>;
    public CustomFields: any;
}


export class WorkProfile extends UniEntity {
    public static RelativeUrl = 'workprofiles';
    public static EntityType = 'WorkProfile';

    public CreatedAt: Date;
    public MinutesPerYear: number;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public LunchIncluded: boolean;
    public MinutesPerWeek: number;
    public StatusCode: number;
    public Name: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public IsShared: boolean;
    public MinutesPerMonth: number;
    public _createguid: string;
    public CustomFields: any;
}


export class WorkRelation extends UniEntity {
    public static RelativeUrl = 'workrelations';
    public static EntityType = 'WorkRelation';

    public CreatedAt: Date;
    public WorkerID: number;
    public TeamID: number;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public StatusCode: number;
    public StartDate: Date;
    public Deleted: boolean;
    public IsActive: boolean;
    public IsPrivate: boolean;
    public CompanyID: number;
    public UpdatedBy: string;
    public CompanyName: string;
    public WorkProfileID: number;
    public WorkPercentage: number;
    public EndTime: Date;
    public ID: number;
    public Description: string;
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

    public IsHalfDay: boolean;
    public FromDate: Date;
    public CreatedAt: Date;
    public RegionKey: string;
    public WorkRelationID: number;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public StatusCode: number;
    public Deleted: boolean;
    public ToDate: Date;
    public SystemKey: string;
    public UpdatedBy: string;
    public TimeoffType: number;
    public ID: number;
    public Description: string;
    public _createguid: string;
    public CustomFields: any;
}


export class WorkType extends UniEntity {
    public static RelativeUrl = 'worktypes';
    public static EntityType = 'WorkType';

    public ProductID: number;
    public WagetypeNumber: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public Price: number;
    public StatusCode: number;
    public Name: string;
    public Deleted: boolean;
    public SystemType: WorkTypeEnum;
    public UpdatedBy: string;
    public ID: number;
    public Description: string;
    public _createguid: string;
    public Product: Product;
    public CustomFields: any;
}


export class BankFile extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'BankFile';

    public CreatedAt: Date;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public SubCompanyID: number;
    public StatusCode: number;
    public Deleted: boolean;
    public ParentFileid: number;
    public UpdatedBy: string;
    public ID: number;
    public FileID: number;
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
    public Processed: number;
    public NotifyEmail: boolean;
    public CreatedAt: Date;
    public YourRef: string;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public Operation: BatchInvoiceOperation;
    public DueDate: LocalDate;
    public StatusCode: number;
    public Deleted: boolean;
    public TotalToProcess: number;
    public Comment: string;
    public InvoiceDate: LocalDate;
    public UpdatedBy: string;
    public MinAmount: number;
    public NumberOfBatches: number;
    public ID: number;
    public SellerID: number;
    public FreeTxt: string;
    public _createguid: string;
    public CustomerID: number;
    public ProjectID: number;
    public Items: Array<BatchInvoiceItem>;
    public CustomFields: any;
}


export class BatchInvoiceItem extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'BatchInvoiceItem';

    public BatchNumber: number;
    public CreatedAt: Date;
    public CommentID: number;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public StatusCode: StatusCode;
    public Deleted: boolean;
    public CustomerInvoiceID: number;
    public UpdatedBy: string;
    public BatchInvoiceID: number;
    public ID: number;
    public CustomerOrderID: number;
    public _createguid: string;
    public CustomerID: number;
    public ProjectID: number;
    public CustomerOrder: CustomerOrder;
    public CustomerInvoice: CustomerInvoice;
    public CustomFields: any;
}


export class CampaignTemplate extends UniEntity {
    public static RelativeUrl = 'campaigntemplate';
    public static EntityType = 'CampaignTemplate';

    public CreatedAt: Date;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public StatusCode: number;
    public EntityName: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public Template: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Customer extends UniEntity {
    public static RelativeUrl = 'customers';
    public static EntityType = 'Customer';

    public AvtaleGiroNotification: boolean;
    public SocialSecurityNumber: string;
    public DimensionsID: number;
    public EInvoiceAgreementReference: string;
    public WebUrl: string;
    public CustomerNumber: number;
    public BusinessRelationID: number;
    public CreatedAt: Date;
    public PeppolAddress: string;
    public SubAccountNumberSeriesID: number;
    public AcceptableDelta4CustomerPayment: number;
    public DefaultCustomerInvoiceReportID: number;
    public GLN: string;
    public DefaultCustomerQuoteReportID: number;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public AcceptableDelta4CustomerPaymentAccountID: number;
    public DefaultCustomerOrderReportID: number;
    public EfakturaIdentifier: string;
    public StatusCode: number;
    public Localization: string;
    public CurrencyCodeID: number;
    public AvtaleGiro: boolean;
    public Deleted: boolean;
    public IsPrivate: boolean;
    public ReminderEmailAddress: string;
    public FactoringNumber: number;
    public DefaultDistributionsID: number;
    public OrgNumber: string;
    public UpdatedBy: string;
    public PaymentTermsID: number;
    public CustomerInvoiceReminderSettingsID: number;
    public ID: number;
    public CustomerNumberKidAlias: string;
    public DeliveryTermsID: number;
    public CreditDays: number;
    public DontSendReminders: boolean;
    public DefaultSellerID: number;
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

    public InvoicePostalCode: string;
    public PaymentID: string;
    public InvoiceReferenceID: number;
    public SalesPerson: string;
    public TaxExclusiveAmountCurrency: number;
    public PaymentInfoTypeID: number;
    public UseReportID: number;
    public ShippingAddressLine3: string;
    public DefaultDimensionsID: number;
    public EmailAddress: string;
    public DistributionPlanID: number;
    public CustomerID: number;
    public CollectorStatusCode: number;
    public VatTotalsAmount: number;
    public PaymentTerm: string;
    public CreatedAt: Date;
    public InternalNote: string;
    public OurReference: string;
    public YourReference: string;
    public PaymentInformation: string;
    public InvoiceType: number;
    public DeliveryName: string;
    public CustomerPerson: string;
    public ShippingAddressLine2: string;
    public DeliveryDate: LocalDate;
    public UpdateCurrencyAmountsOnDateChange: boolean;
    public PayableRoundingAmount: number;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public ExternalReference: string;
    public SupplierOrgNumber: string;
    public Requisition: string;
    public ShippingAddressLine1: string;
    public TaxInclusiveAmount: number;
    public StatusCode: number;
    public ShippingPostalCode: string;
    public JournalEntryID: number;
    public PaymentDueDate: LocalDate;
    public TaxExclusiveAmount: number;
    public CurrencyCodeID: number;
    public VatTotalsAmountCurrency: number;
    public InvoiceCountryCode: string;
    public InvoiceAddressLine2: string;
    public RestAmountCurrency: number;
    public PrintStatus: number;
    public ShippingCountry: string;
    public DeliveryTerm: string;
    public CreditedAmountCurrency: number;
    public RestAmount: number;
    public Deleted: boolean;
    public CustomerName: string;
    public Comment: string;
    public ExternalStatus: number;
    public CreditedAmount: number;
    public ShippingCountryCode: string;
    public InvoiceDate: LocalDate;
    public Credited: boolean;
    public AccrualID: number;
    public TaxInclusiveAmountCurrency: number;
    public CustomerOrgNumber: string;
    public Payment: string;
    public DeliveryMethod: string;
    public UpdatedBy: string;
    public InvoiceAddressLine3: string;
    public CurrencyExchangeRate: number;
    public PayableRoundingCurrencyAmount: number;
    public InvoiceNumberSeriesID: number;
    public PaymentTermsID: number;
    public InvoiceNumber: string;
    public ShippingCity: string;
    public ID: number;
    public InvoiceAddressLine1: string;
    public DeliveryTermsID: number;
    public InvoiceCity: string;
    public CreditDays: number;
    public InvoiceReceiverName: string;
    public FreeTxt: string;
    public BankAccountID: number;
    public InvoiceCountry: string;
    public AmountRegards: string;
    public LastPaymentDate: LocalDate;
    public DontSendReminders: boolean;
    public DefaultSellerID: number;
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

    public SumTotalExVatCurrency: number;
    public DimensionsID: number;
    public ProductID: number;
    public ItemText: string;
    public Discount: number;
    public SumVat: number;
    public SumVatCurrency: number;
    public SortIndex: number;
    public CreatedAt: Date;
    public PriceExVat: number;
    public PriceExVatCurrency: number;
    public SumTotalExVat: number;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public DiscountPercent: number;
    public SumTotalIncVatCurrency: number;
    public PriceIncVat: number;
    public StatusCode: number;
    public VatPercent: number;
    public CurrencyCodeID: number;
    public AccountingCost: string;
    public DiscountCurrency: number;
    public InvoicePeriodEndDate: LocalDate;
    public Deleted: boolean;
    public CalculateGrossPriceBasedOnNetPrice: boolean;
    public VatTypeID: number;
    public Comment: string;
    public NumberOfItems: number;
    public InvoicePeriodStartDate: LocalDate;
    public SumTotalIncVat: number;
    public CustomerInvoiceID: number;
    public AccountID: number;
    public CostPrice: number;
    public UpdatedBy: string;
    public CurrencyExchangeRate: number;
    public ID: number;
    public Unit: string;
    public PriceSetByUser: boolean;
    public ItemSourceID: number;
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

    public RunNumber: number;
    public DimensionsID: number;
    public EmailAddress: string;
    public DebtCollectionFee: number;
    public CreatedAt: Date;
    public Notified: boolean;
    public ReminderNumber: number;
    public CreatedByReminderRuleID: number;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public DueDate: LocalDate;
    public StatusCode: number;
    public CurrencyCodeID: number;
    public RestAmountCurrency: number;
    public Title: string;
    public RemindedDate: LocalDate;
    public RestAmount: number;
    public Deleted: boolean;
    public InterestFeeCurrency: number;
    public InterestFee: number;
    public ReminderFeeCurrency: number;
    public ReminderFee: number;
    public CustomerInvoiceID: number;
    public UpdatedBy: string;
    public CurrencyExchangeRate: number;
    public DebtCollectionFeeCurrency: number;
    public ID: number;
    public Description: string;
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
    public MinimumDaysFromDueDate: number;
    public ReminderNumber: number;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public UseMaximumLegalReminderFee: boolean;
    public StatusCode: number;
    public Title: string;
    public Deleted: boolean;
    public ReminderFee: number;
    public UpdatedBy: string;
    public CustomerInvoiceReminderSettingsID: number;
    public ID: number;
    public Description: string;
    public CreditDays: number;
    public _createguid: string;
    public CustomerInvoiceReminderSettings: CustomerInvoiceReminderSettings;
    public CustomFields: any;
}


export class CustomerInvoiceReminderSettings extends UniEntity {
    public static RelativeUrl = 'invoiceremindersettings';
    public static EntityType = 'CustomerInvoiceReminderSettings';

    public DebtCollectionSettingsID: number;
    public CreatedAt: Date;
    public DefaultReminderFeeAccountID: number;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public RemindersBeforeDebtCollection: number;
    public MinimumAmountToRemind: number;
    public StatusCode: number;
    public Deleted: boolean;
    public UpdatedBy: string;
    public AcceptPaymentWithoutReminderFee: boolean;
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

    public InvoicePostalCode: string;
    public SalesPerson: string;
    public TaxExclusiveAmountCurrency: number;
    public PaymentInfoTypeID: number;
    public UseReportID: number;
    public ShippingAddressLine3: string;
    public DefaultDimensionsID: number;
    public EmailAddress: string;
    public ReadyToInvoice: boolean;
    public UpdateCurrencyOnToInvoice: boolean;
    public DistributionPlanID: number;
    public CustomerID: number;
    public VatTotalsAmount: number;
    public PaymentTerm: string;
    public CreatedAt: Date;
    public InternalNote: string;
    public OurReference: string;
    public YourReference: string;
    public DeliveryName: string;
    public CustomerPerson: string;
    public ShippingAddressLine2: string;
    public DeliveryDate: LocalDate;
    public UpdateCurrencyAmountsOnDateChange: boolean;
    public PayableRoundingAmount: number;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public SupplierOrgNumber: string;
    public Requisition: string;
    public ShippingAddressLine1: string;
    public TaxInclusiveAmount: number;
    public StatusCode: number;
    public ShippingPostalCode: string;
    public TaxExclusiveAmount: number;
    public CurrencyCodeID: number;
    public VatTotalsAmountCurrency: number;
    public InvoiceCountryCode: string;
    public InvoiceAddressLine2: string;
    public RestAmountCurrency: number;
    public PrintStatus: number;
    public ShippingCountry: string;
    public DeliveryTerm: string;
    public Deleted: boolean;
    public CustomerName: string;
    public Comment: string;
    public RestExclusiveAmountCurrency: number;
    public ShippingCountryCode: string;
    public AccrualID: number;
    public TaxInclusiveAmountCurrency: number;
    public CustomerOrgNumber: string;
    public DeliveryMethod: string;
    public UpdatedBy: string;
    public InvoiceAddressLine3: string;
    public CurrencyExchangeRate: number;
    public PayableRoundingCurrencyAmount: number;
    public PaymentTermsID: number;
    public ShippingCity: string;
    public ID: number;
    public InvoiceAddressLine1: string;
    public OrderNumberSeriesID: number;
    public OrderDate: LocalDate;
    public DeliveryTermsID: number;
    public InvoiceCity: string;
    public OrderNumber: number;
    public CreditDays: number;
    public InvoiceReceiverName: string;
    public FreeTxt: string;
    public InvoiceCountry: string;
    public DefaultSellerID: number;
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

    public SumTotalExVatCurrency: number;
    public DimensionsID: number;
    public ProductID: number;
    public ItemText: string;
    public Discount: number;
    public ReadyToInvoice: boolean;
    public SumVat: number;
    public SumVatCurrency: number;
    public SortIndex: number;
    public CreatedAt: Date;
    public PriceExVat: number;
    public PriceExVatCurrency: number;
    public SumTotalExVat: number;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public DiscountPercent: number;
    public SumTotalIncVatCurrency: number;
    public PriceIncVat: number;
    public StatusCode: number;
    public VatPercent: number;
    public CurrencyCodeID: number;
    public DiscountCurrency: number;
    public Deleted: boolean;
    public CalculateGrossPriceBasedOnNetPrice: boolean;
    public VatTypeID: number;
    public Comment: string;
    public NumberOfItems: number;
    public SumTotalIncVat: number;
    public AccountID: number;
    public CostPrice: number;
    public UpdatedBy: string;
    public CurrencyExchangeRate: number;
    public ID: number;
    public Unit: string;
    public PriceSetByUser: boolean;
    public ItemSourceID: number;
    public CustomerOrderID: number;
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

    public InvoicePostalCode: string;
    public SalesPerson: string;
    public TaxExclusiveAmountCurrency: number;
    public PaymentInfoTypeID: number;
    public UseReportID: number;
    public ShippingAddressLine3: string;
    public DefaultDimensionsID: number;
    public EmailAddress: string;
    public UpdateCurrencyOnToInvoice: boolean;
    public DistributionPlanID: number;
    public CustomerID: number;
    public VatTotalsAmount: number;
    public PaymentTerm: string;
    public CreatedAt: Date;
    public InquiryReference: number;
    public InternalNote: string;
    public OurReference: string;
    public YourReference: string;
    public DeliveryName: string;
    public CustomerPerson: string;
    public ValidUntilDate: LocalDate;
    public ShippingAddressLine2: string;
    public DeliveryDate: LocalDate;
    public UpdateCurrencyAmountsOnDateChange: boolean;
    public PayableRoundingAmount: number;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public SupplierOrgNumber: string;
    public Requisition: string;
    public ShippingAddressLine1: string;
    public TaxInclusiveAmount: number;
    public StatusCode: number;
    public ShippingPostalCode: string;
    public QuoteDate: LocalDate;
    public TaxExclusiveAmount: number;
    public CurrencyCodeID: number;
    public VatTotalsAmountCurrency: number;
    public InvoiceCountryCode: string;
    public InvoiceAddressLine2: string;
    public PrintStatus: number;
    public ShippingCountry: string;
    public DeliveryTerm: string;
    public Deleted: boolean;
    public CustomerName: string;
    public UpdateCurrencyOnToOrder: boolean;
    public Comment: string;
    public ShippingCountryCode: string;
    public TaxInclusiveAmountCurrency: number;
    public CustomerOrgNumber: string;
    public DeliveryMethod: string;
    public UpdatedBy: string;
    public InvoiceAddressLine3: string;
    public CurrencyExchangeRate: number;
    public PayableRoundingCurrencyAmount: number;
    public PaymentTermsID: number;
    public ShippingCity: string;
    public ID: number;
    public InvoiceAddressLine1: string;
    public DeliveryTermsID: number;
    public InvoiceCity: string;
    public QuoteNumber: number;
    public CreditDays: number;
    public InvoiceReceiverName: string;
    public FreeTxt: string;
    public QuoteNumberSeriesID: number;
    public InvoiceCountry: string;
    public DefaultSellerID: number;
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

    public SumTotalExVatCurrency: number;
    public DimensionsID: number;
    public ProductID: number;
    public ItemText: string;
    public Discount: number;
    public SumVat: number;
    public SumVatCurrency: number;
    public SortIndex: number;
    public CreatedAt: Date;
    public PriceExVat: number;
    public PriceExVatCurrency: number;
    public SumTotalExVat: number;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public DiscountPercent: number;
    public SumTotalIncVatCurrency: number;
    public PriceIncVat: number;
    public StatusCode: number;
    public VatPercent: number;
    public CurrencyCodeID: number;
    public DiscountCurrency: number;
    public Deleted: boolean;
    public CalculateGrossPriceBasedOnNetPrice: boolean;
    public VatTypeID: number;
    public Comment: string;
    public CustomerQuoteID: number;
    public NumberOfItems: number;
    public SumTotalIncVat: number;
    public AccountID: number;
    public CostPrice: number;
    public UpdatedBy: string;
    public CurrencyExchangeRate: number;
    public ID: number;
    public Unit: string;
    public PriceSetByUser: boolean;
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

    public CreditorNumber: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public StatusCode: number;
    public Deleted: boolean;
    public DebtCollectionAutomationID: number;
    public IntegrateWithDebtCollection: boolean;
    public DebtCollectionFormat: number;
    public UpdatedBy: string;
    public CustomerInvoiceReminderSettingsID: number;
    public ID: number;
    public _createguid: string;
    public CustomerInvoiceReminderSettings: CustomerInvoiceReminderSettings;
    public DebtCollectionAutomation: Array<DebtCollectionAutomation>;
    public CustomFields: any;
}


export class ItemSource extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ItemSource';

    public CreatedAt: Date;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public StatusCode: number;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public _createguid: string;
    public Details: Array<ItemSourceDetail>;
    public CustomFields: any;
}


export class ItemSourceDetail extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ItemSourceDetail';

    public SourceType: string;
    public CreatedAt: Date;
    public Amount: number;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public SourceFK: number;
    public StatusCode: number;
    public Tag: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public Description: string;
    public ItemSourceID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class PaymentInfoType extends UniEntity {
    public static RelativeUrl = 'paymentinfotype';
    public static EntityType = 'PaymentInfoType';

    public Length: number;
    public CreatedAt: Date;
    public Locked: boolean;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public Type: PaymentInfoTypeEnum;
    public StatusCode: number;
    public Name: string;
    public Deleted: boolean;
    public Control: Modulus;
    public UpdatedBy: string;
    public ID: number;
    public _createguid: string;
    public PaymentInfoTypeParts: Array<PaymentInfoTypePart>;
    public CustomFields: any;
}


export class PaymentInfoTypePart extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'PaymentInfoTypePart';

    public Length: number;
    public Part: string;
    public PaymentInfoTypeID: number;
    public SortIndex: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public StatusCode: number;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class RecurringInvoice extends UniEntity {
    public static RelativeUrl = 'recurringinvoices';
    public static EntityType = 'RecurringInvoice';

    public InvoicePostalCode: string;
    public SalesPerson: string;
    public TaxExclusiveAmountCurrency: number;
    public PaymentInfoTypeID: number;
    public UseReportID: number;
    public ShippingAddressLine3: string;
    public DefaultDimensionsID: number;
    public EmailAddress: string;
    public DistributionPlanID: number;
    public CustomerID: number;
    public VatTotalsAmount: number;
    public PaymentTerm: string;
    public CreatedAt: Date;
    public InternalNote: string;
    public OurReference: string;
    public YourReference: string;
    public TimePeriod: RecurringPeriod;
    public PaymentInformation: string;
    public ProduceAs: RecurringResult;
    public DeliveryName: string;
    public NotifyUser: string;
    public CustomerPerson: string;
    public Interval: number;
    public ShippingAddressLine2: string;
    public DeliveryDate: LocalDate;
    public UpdateCurrencyAmountsOnDateChange: boolean;
    public NotifyWhenRecurringEnds: boolean;
    public PayableRoundingAmount: number;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public SupplierOrgNumber: string;
    public PreparationDays: number;
    public Requisition: string;
    public ShippingAddressLine1: string;
    public TaxInclusiveAmount: number;
    public StatusCode: number;
    public ShippingPostalCode: string;
    public TaxExclusiveAmount: number;
    public CurrencyCodeID: number;
    public VatTotalsAmountCurrency: number;
    public InvoiceCountryCode: string;
    public InvoiceAddressLine2: string;
    public PrintStatus: number;
    public ShippingCountry: string;
    public DeliveryTerm: string;
    public StartDate: LocalDate;
    public Deleted: boolean;
    public CustomerName: string;
    public Comment: string;
    public MaxIterations: number;
    public ShippingCountryCode: string;
    public TaxInclusiveAmountCurrency: number;
    public CustomerOrgNumber: string;
    public Payment: string;
    public DeliveryMethod: string;
    public UpdatedBy: string;
    public InvoiceAddressLine3: string;
    public CurrencyExchangeRate: number;
    public PayableRoundingCurrencyAmount: number;
    public InvoiceNumberSeriesID: number;
    public NextInvoiceDate: LocalDate;
    public PaymentTermsID: number;
    public ShippingCity: string;
    public ID: number;
    public InvoiceAddressLine1: string;
    public NoCreditDays: boolean;
    public DeliveryTermsID: number;
    public InvoiceCity: string;
    public NotifyWhenOrdersArePrepared: boolean;
    public CreditDays: number;
    public InvoiceReceiverName: string;
    public FreeTxt: string;
    public InvoiceCountry: string;
    public AmountRegards: string;
    public DefaultSellerID: number;
    public EndDate: LocalDate;
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

    public SumTotalExVatCurrency: number;
    public DimensionsID: number;
    public RecurringInvoiceID: number;
    public ProductID: number;
    public ItemText: string;
    public Discount: number;
    public SumVat: number;
    public SumVatCurrency: number;
    public SortIndex: number;
    public CreatedAt: Date;
    public PriceExVat: number;
    public PriceExVatCurrency: number;
    public SumTotalExVat: number;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public DiscountPercent: number;
    public SumTotalIncVatCurrency: number;
    public PriceIncVat: number;
    public StatusCode: number;
    public VatPercent: number;
    public CurrencyCodeID: number;
    public DiscountCurrency: number;
    public Deleted: boolean;
    public CalculateGrossPriceBasedOnNetPrice: boolean;
    public VatTypeID: number;
    public Comment: string;
    public TimeFactor: RecurringPeriod;
    public NumberOfItems: number;
    public SumTotalIncVat: number;
    public AccountID: number;
    public PricingSource: PricingSource;
    public UpdatedBy: string;
    public CurrencyExchangeRate: number;
    public ReduceIncompletePeriod: boolean;
    public ID: number;
    public Unit: string;
    public PriceSetByUser: boolean;
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

    public RecurringInvoiceID: number;
    public CreatedAt: Date;
    public NotifiedOrdersPrepared: boolean;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public StatusCode: number;
    public CreationDate: LocalDate;
    public IterationNumber: number;
    public Deleted: boolean;
    public Comment: string;
    public OrderID: number;
    public InvoiceDate: LocalDate;
    public UpdatedBy: string;
    public InvoiceID: number;
    public ID: number;
    public NotifiedRecurringEnds: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class Seller extends UniEntity {
    public static RelativeUrl = 'sellers';
    public static EntityType = 'Seller';

    public DefaultDimensionsID: number;
    public CreatedAt: Date;
    public TeamID: number;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public StatusCode: number;
    public Name: string;
    public EmployeeID: number;
    public Deleted: boolean;
    public UserID: number;
    public UpdatedBy: string;
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

    public RecurringInvoiceID: number;
    public Percent: number;
    public CustomerID: number;
    public CreatedAt: Date;
    public Amount: number;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public StatusCode: number;
    public Deleted: boolean;
    public CustomerQuoteID: number;
    public CustomerInvoiceID: number;
    public UpdatedBy: string;
    public ID: number;
    public CustomerOrderID: number;
    public SellerID: number;
    public _createguid: string;
    public Seller: Seller;
    public CustomFields: any;
}


export class SubCompany extends UniEntity {
    public static RelativeUrl = 'subcompanies';
    public static EntityType = 'SubCompany';

    public CompanyType: CompanyRelation;
    public CustomerID: number;
    public CreatedAt: Date;
    public CompanyKey: string;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public StatusCode: number;
    public Deleted: boolean;
    public CompanyID: number;
    public UpdatedBy: string;
    public CompanyName: string;
    public ID: number;
    public _createguid: string;
    public Customer: Customer;
    public CustomFields: any;
}


export class Supplier extends UniEntity {
    public static RelativeUrl = 'suppliers';
    public static EntityType = 'Supplier';

    public CostAllocationID: number;
    public DimensionsID: number;
    public WebUrl: string;
    public SupplierNumber: number;
    public BusinessRelationID: number;
    public CreatedAt: Date;
    public PeppolAddress: string;
    public SubAccountNumberSeriesID: number;
    public GLN: string;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public SelfEmployed: boolean;
    public StatusCode: number;
    public Localization: string;
    public CurrencyCodeID: number;
    public Deleted: boolean;
    public OrgNumber: string;
    public UpdatedBy: string;
    public ID: number;
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

    public TermsType: TermsType;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public StatusCode: number;
    public Name: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public Description: string;
    public CreditDays: number;
    public _createguid: string;
    public CustomFields: any;
}


export class TOFCurrencySettings extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'TOFCurrencySettings';

    public UpdateCurrencyAmountsOnOrderdateChange: boolean;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public StatusCode: number;
    public UpdateCurrencyAmountsOnOrderToInvoice: boolean;
    public Deleted: boolean;
    public UpdateCurrencyAmountsOnInvoicedateChange: boolean;
    public UpdateCurrencyAmountsOnQuotedateChange: boolean;
    public UpdateCurrencyAmountsOnQuoteToOrder: boolean;
    public UpdatedBy: string;
    public ID: number;
    public UpdateCurrencyAmountsOnQuoteToInvoice: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class Address extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Address';

    public BusinessRelationID: number;
    public CreatedAt: Date;
    public AddressLine2: string;
    public CountryCode: string;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public PostalCode: string;
    public StatusCode: number;
    public AddressLine1: string;
    public Deleted: boolean;
    public AddressLine3: string;
    public Country: string;
    public UpdatedBy: string;
    public Region: string;
    public ID: number;
    public City: string;
    public _createguid: string;
    public BusinessRelation: BusinessRelation;
    public CustomFields: any;
}


export class BusinessRelation extends UniEntity {
    public static RelativeUrl = 'business-relations';
    public static EntityType = 'BusinessRelation';

    public DefaultPhoneID: number;
    public InvoiceAddressID: number;
    public CreatedAt: Date;
    public DefaultContactID: number;
    public ShippingAddressID: number;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public DefaultBankAccountID: number;
    public StatusCode: number;
    public Name: string;
    public Deleted: boolean;
    public DefaultEmailID: number;
    public UpdatedBy: string;
    public ID: number;
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
    public UpdatedAt: Date;
    public CreatedBy: string;
    public StatusCode: number;
    public Role: string;
    public Deleted: boolean;
    public Comment: string;
    public UpdatedBy: string;
    public ParentBusinessRelationID: number;
    public InfoID: number;
    public ID: number;
    public _createguid: string;
    public ParentBusinessRelation: BusinessRelation;
    public Info: BusinessRelation;
    public CustomFields: any;
}


export class Email extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Email';

    public EmailAddress: string;
    public BusinessRelationID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public Type: string;
    public StatusCode: number;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public Description: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Phone extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Phone';

    public BusinessRelationID: number;
    public CreatedAt: Date;
    public CountryCode: string;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public Type: PhoneTypeEnum;
    public StatusCode: number;
    public Deleted: boolean;
    public Number: string;
    public UpdatedBy: string;
    public ID: number;
    public Description: string;
    public _createguid: string;
    public CustomFields: any;
}


export class AGACalculation extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AGACalculation';

    public DimensionsID: number;
    public CreatedAt: Date;
    public PayrollRunID: number;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public StatusCode: number;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
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

    public freeAmount: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public StatusCode: number;
    public Deleted: boolean;
    public SubEntityID: number;
    public UpdatedBy: string;
    public ID: number;
    public AGACalculationID: number;
    public _createguid: string;
    public subEntity: SubEntity;
    public CustomFields: any;
}


export class AGATax extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AGATax';

    public zone: number;
    public CreatedAt: Date;
    public agaRate: number;
    public AGARateID: number;
    public beregningsKode: number;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public StatusCode: number;
    public Deleted: boolean;
    public agaBase: number;
    public SubEntityID: number;
    public UpdatedBy: string;
    public ID: number;
    public AGACalculationID: number;
    public _createguid: string;
    public municipalityName: string;
    public zoneName: string;
    public subEntity: SubEntity;
    public CustomFields: any;
}


export class AGAPension extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AGAPension';

    public zone: number;
    public CreatedAt: Date;
    public agaRate: number;
    public AGARateID: number;
    public beregningsKode: number;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public StatusCode: number;
    public Deleted: boolean;
    public agaBase: number;
    public SubEntityID: number;
    public UpdatedBy: string;
    public ID: number;
    public AGACalculationID: number;
    public _createguid: string;
    public municipalityName: string;
    public zoneName: string;
    public subEntity: SubEntity;
    public CustomFields: any;
}


export class AGADraw extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AGADraw';

    public zone: number;
    public CreatedAt: Date;
    public agaRate: number;
    public AGARateID: number;
    public beregningsKode: number;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public StatusCode: number;
    public Deleted: boolean;
    public agaBase: number;
    public SubEntityID: number;
    public UpdatedBy: string;
    public ID: number;
    public AGACalculationID: number;
    public _createguid: string;
    public municipalityName: string;
    public zoneName: string;
    public subEntity: SubEntity;
    public CustomFields: any;
}


export class ForeignerWithPercent extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ForeignerWithPercent';

    public CreatedAt: Date;
    public agaRate: number;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public StatusCode: number;
    public Deleted: boolean;
    public agaBase: number;
    public SubEntityID: number;
    public UpdatedBy: string;
    public ID: number;
    public AGACalculationID: number;
    public _createguid: string;
    public municipalityName: string;
    public zoneName: string;
    public subEntity: SubEntity;
    public CustomFields: any;
}


export class DrawForeignerWithPercent extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'DrawForeignerWithPercent';

    public CreatedAt: Date;
    public agaRate: number;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public StatusCode: number;
    public Deleted: boolean;
    public agaBase: number;
    public SubEntityID: number;
    public UpdatedBy: string;
    public ID: number;
    public AGACalculationID: number;
    public _createguid: string;
    public municipalityName: string;
    public zoneName: string;
    public subEntity: SubEntity;
    public CustomFields: any;
}


export class ForeignerWithAmount extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ForeignerWithAmount';

    public persons: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public StatusCode: number;
    public aga: number;
    public Deleted: boolean;
    public SubEntityID: number;
    public UpdatedBy: string;
    public ID: number;
    public AGACalculationID: number;
    public _createguid: string;
    public municipalityName: string;
    public zoneName: string;
    public subEntity: SubEntity;
    public CustomFields: any;
}


export class TaxAndAgaSums extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'TaxAndAgaSums';

    public CreatedAt: Date;
    public WithholdingTax: number;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public FinancialTax: number;
    public StatusCode: number;
    public Deleted: boolean;
    public GarnishmentTax: number;
    public UpdatedBy: string;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class AmeldingData extends UniEntity {
    public static RelativeUrl = 'amelding';
    public static EntityType = 'AmeldingData';

    public year: number;
    public initiated: Date;
    public altinnStatus: string;
    public status: number;
    public CreatedAt: Date;
    public messageID: string;
    public sent: Date;
    public PayrollRunID: number;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public type: AmeldingType;
    public period: number;
    public StatusCode: number;
    public mainFileID: number;
    public replacesID: number;
    public Deleted: boolean;
    public created: Date;
    public feedbackFileID: number;
    public UpdatedBy: string;
    public OppgaveHash: string;
    public attachmentFileID: number;
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

    public CreatedAt: Date;
    public AmeldingsID: number;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public StatusCode: number;
    public key: number;
    public registry: SalaryRegistry;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class BasicAmount extends UniEntity {
    public static RelativeUrl = 'basicamounts';
    public static EntityType = 'BasicAmount';

    public FromDate: Date;
    public CreatedAt: Date;
    public AveragePrYear: number;
    public BasicAmountPrMonth: number;
    public BasicAmountPrYear: number;
    public ConversionFactor: number;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public StatusCode: number;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class CompanySalary extends UniEntity {
    public static RelativeUrl = 'companysalary';
    public static EntityType = 'CompanySalary';

    public InterrimRemitAccount: number;
    public FreeAmount: number;
    public Base_SpesialDeductionForMaritim: boolean;
    public CreatedAt: Date;
    public PostToTaxDraw: boolean;
    public RateFinancialTax: number;
    public OtpExportActive: boolean;
    public MainAccountCostAGA: number;
    public WageDeductionDueToHoliday: WageDeductionDueToHolidayType;
    public MainAccountCostFinancialVacation: number;
    public MainAccountCostFinancial: number;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public MainAccountAllocatedFinancialVacation: number;
    public PaycheckZipReportID: number;
    public StatusCode: number;
    public PaymentInterval: CompanySalaryPaymentInterval;
    public PostGarnishmentToTaxAccount: boolean;
    public MainAccountCostVacation: number;
    public HoursPerMonth: number;
    public WagetypeAdvancePaymentAuto: number;
    public HourFTEs: number;
    public Deleted: boolean;
    public MainAccountAllocatedVacation: number;
    public AllowOver6G: boolean;
    public CalculateFinancialTax: boolean;
    public UpdatedBy: string;
    public MainAccountAllocatedAGA: number;
    public Base_NettoPayment: boolean;
    public Base_NettoPaymentForMaritim: boolean;
    public MainAccountAllocatedAGAVacation: number;
    public Base_TaxFreeOrganization: boolean;
    public WagetypeAdvancePayment: number;
    public MainAccountAllocatedFinancial: number;
    public Base_JanMayenAndBiCountries: boolean;
    public ID: number;
    public MainAccountCostAGAVacation: number;
    public Base_Svalbard: boolean;
    public Base_PayAsYouEarnTaxOnPensions: boolean;
    public AnnualStatementZipReportID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class CompanyVacationRate extends UniEntity {
    public static RelativeUrl = 'companyvacationrates';
    public static EntityType = 'CompanyVacationRate';

    public FromDate: Date;
    public Rate60: number;
    public CreatedAt: Date;
    public Rate: number;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public StatusCode: number;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class EmployeeCategory extends UniEntity {
    public static RelativeUrl = 'employeecategories';
    public static EntityType = 'EmployeeCategory';

    public CreatedAt: Date;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public StatusCode: number;
    public Name: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public EmployeeCategoryLinkID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class EmployeeCategoryLink extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'EmployeeCategoryLink';

    public CreatedAt: Date;
    public EmployeeCategoryID: number;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public StatusCode: number;
    public EmployeeID: number;
    public Deleted: boolean;
    public EmployeeNumber: number;
    public UpdatedBy: string;
    public ID: number;
    public _createguid: string;
    public EmployeeCategory: EmployeeCategory;
    public Employee: Employee;
    public CustomFields: any;
}


export class Employee extends UniEntity {
    public static RelativeUrl = 'employees';
    public static EntityType = 'Employee';

    public EmployeeLanguageID: number;
    public SocialSecurityNumber: string;
    public EmploymentDate: Date;
    public InternasjonalIDType: InternationalIDType;
    public BusinessRelationID: number;
    public CreatedAt: Date;
    public InternationalID: string;
    public EmploymentDateOtp: LocalDate;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public IncludeOtpUntilYear: number;
    public Active: boolean;
    public ForeignWorker: ForeignWorker;
    public StatusCode: number;
    public IncludeOtpUntilMonth: number;
    public PaymentInterval: PaymentInterval;
    public OtpExport: boolean;
    public BirthDate: Date;
    public FreeText: string;
    public Deleted: boolean;
    public SubEntityID: number;
    public Sex: GenderEnum;
    public EmployeeNumber: number;
    public UserID: number;
    public UpdatedBy: string;
    public PhotoID: number;
    public EndDateOtp: LocalDate;
    public ID: number;
    public MunicipalityNo: string;
    public TypeOfPaymentOtp: TypeOfPaymentOtp;
    public AdvancePaymentAmount: number;
    public InternasjonalIDCountry: string;
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

    public Year: number;
    public Percent: number;
    public SKDXml: string;
    public CreatedAt: Date;
    public NotMainEmployer: boolean;
    public Tilleggsopplysning: string;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public loennFraHovedarbeidsgiverID: number;
    public pensjonID: number;
    public ResultatStatus: string;
    public StatusCode: number;
    public loennTilUtenrikstjenestemannID: number;
    public loennKunTrygdeavgiftTilUtenlandskBorgerSomGrensegjengerID: number;
    public EmployeeID: number;
    public NonTaxableAmount: number;
    public Deleted: boolean;
    public EmployeeNumber: number;
    public SecondaryTable: string;
    public Table: string;
    public loennFraBiarbeidsgiverID: number;
    public IssueDate: Date;
    public UpdatedBy: string;
    public loennKunTrygdeavgiftTilUtenlandskBorgerID: number;
    public TaxcardId: number;
    public ID: number;
    public SecondaryPercent: number;
    public ufoereYtelserAndreID: number;
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

    public Percent: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public tabellType: TabellType;
    public NonTaxableAmount: number;
    public AntallMaanederForTrekk: number;
    public Deleted: boolean;
    public freeAmountType: FreeAmountType;
    public Table: string;
    public UpdatedBy: string;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class EmployeeLeave extends UniEntity {
    public static RelativeUrl = 'EmployeeLeave';
    public static EntityType = 'EmployeeLeave';

    public FromDate: Date;
    public CreatedAt: Date;
    public EmploymentID: number;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public LeaveType: Leavetype;
    public StatusCode: number;
    public AffectsOtp: boolean;
    public Deleted: boolean;
    public ToDate: Date;
    public LeavePercent: number;
    public UpdatedBy: string;
    public ID: number;
    public Description: string;
    public _createguid: string;
    public Employment: Employment;
    public CustomFields: any;
}


export class Employment extends UniEntity {
    public static RelativeUrl = 'employments';
    public static EntityType = 'Employment';

    public DimensionsID: number;
    public RegulativeGroupID: number;
    public CreatedAt: Date;
    public TypeOfEmployment: TypeOfEmployment;
    public HourRate: number;
    public LastSalaryChangeDate: Date;
    public TradeArea: ShipTradeArea;
    public EmploymentType: EmploymentType;
    public RegulativeStepNr: number;
    public WorkPercent: number;
    public UserDefinedRate: number;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public WorkingHoursScheme: WorkingHoursScheme;
    public EndDateReason: EndDateReason;
    public StatusCode: number;
    public StartDate: Date;
    public EmployeeID: number;
    public JobCode: string;
    public Deleted: boolean;
    public SubEntityID: number;
    public EmployeeNumber: number;
    public SeniorityDate: Date;
    public JobName: string;
    public ShipReg: ShipRegistry;
    public HoursPerWeek: number;
    public Standard: boolean;
    public PayGrade: string;
    public UpdatedBy: string;
    public RemunerationType: RemunerationType;
    public ShipType: ShipTypeOfShip;
    public LastWorkPercentChangeDate: Date;
    public LedgerAccount: string;
    public ID: number;
    public MonthRate: number;
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

    public FromDate: Date;
    public CreatedAt: Date;
    public Amount: number;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public StatusCode: number;
    public Deleted: boolean;
    public SubentityID: number;
    public UpdatedBy: string;
    public ID: number;
    public Description: string;
    public AffectsAGA: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class IncomeReportData extends UniEntity {
    public static RelativeUrl = 'income-reports';
    public static EntityType = 'IncomeReportData';

    public Xml: string;
    public CreatedAt: Date;
    public EmploymentID: number;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public Type: string;
    public StatusCode: number;
    public Deleted: boolean;
    public AltinnReceiptID: number;
    public UpdatedBy: string;
    public MonthlyRefund: number;
    public ID: number;
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
    public UpdatedAt: Date;
    public CreatedBy: string;
    public StatusCode: number;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class PayrollRun extends UniEntity {
    public static RelativeUrl = 'payrollrun';
    public static EntityType = 'PayrollRun';

    public FromDate: Date;
    public JournalEntryNumber: string;
    public CreatedAt: Date;
    public ExcludeRecurringPosts: boolean;
    public HolidayPayDeduction: boolean;
    public needsRecalc: boolean;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public taxdrawfactor: TaxDrawFactor;
    public PaycheckFileID: number;
    public StatusCode: number;
    public AGAonRun: number;
    public FreeText: string;
    public Deleted: boolean;
    public ToDate: Date;
    public AGAFreeAmount: number;
    public UpdatedBy: string;
    public PayDate: Date;
    public ID: number;
    public Description: string;
    public SettlementDate: Date;
    public _createguid: string;
    public transactions: Array<SalaryTransaction>;
    public agacalculation: Array<AGACalculation>;
    public CustomFields: any;
}


export class PayrollRunCategoryLink extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'PayrollRunCategoryLink';

    public CreatedAt: Date;
    public EmployeeCategoryID: number;
    public PayrollRunID: number;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public StatusCode: number;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public _createguid: string;
    public EmployeeCategory: EmployeeCategory;
    public PayrollRun: PayrollRun;
    public CustomFields: any;
}


export class PostingSummaryDraft extends UniEntity {
    public status: SummaryJobStatus;
    public JobInfoID: number;
    public statusTime: Date;
    public draftWithDimsOnBalance: string;
    public draftBasic: string;
    public draftWithDims: string;
    public PayrollID: number;
    public ID: number;
}


export class Regulative extends UniEntity {
    public static RelativeUrl = 'regulatives';
    public static EntityType = 'Regulative';

    public RegulativeGroupID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public StatusCode: number;
    public StartDate: LocalDate;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public _createguid: string;
    public Steps: Array<RegulativeStep>;
    public CustomFields: any;
}


export class RegulativeGroup extends UniEntity {
    public static RelativeUrl = 'regulativegroups';
    public static EntityType = 'RegulativeGroup';

    public CreatedAt: Date;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public StatusCode: number;
    public Name: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public _createguid: string;
    public Regulatives: Array<Regulative>;
    public CustomFields: any;
}


export class RegulativeStep extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'RegulativeStep';

    public CreatedAt: Date;
    public Amount: number;
    public Step: number;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public StatusCode: number;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public RegulativeID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class SalaryBalance extends UniEntity {
    public static RelativeUrl = 'salarybalances';
    public static EntityType = 'SalaryBalance';

    public FromDate: Date;
    public SalaryBalanceTemplateID: number;
    public WageTypeNumber: number;
    public CreatedAt: Date;
    public MaxAmount: number;
    public Source: SalBalSource;
    public EmploymentID: number;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public Type: SalBalDrawType;
    public StatusCode: number;
    public Name: string;
    public KID: string;
    public InstalmentPercent: number;
    public EmployeeID: number;
    public Deleted: boolean;
    public ToDate: Date;
    public UpdatedBy: string;
    public CreatePayment: boolean;
    public InstalmentType: SalBalType;
    public SupplierID: number;
    public Instalment: number;
    public MinAmount: number;
    public ID: number;
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

    public CreatedAt: Date;
    public Amount: number;
    public SalaryTransactionID: number;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public StatusCode: number;
    public Date: LocalDate;
    public SalaryBalanceID: number;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public Description: string;
    public _createguid: string;
    public SalaryTransaction: SalaryTransaction;
    public SalaryBalance: SalaryBalance;
    public CustomFields: any;
}


export class SalaryBalanceTemplate extends UniEntity {
    public static RelativeUrl = 'salarybalancetemplates';
    public static EntityType = 'SalaryBalanceTemplate';

    public Account: number;
    public WageTypeNumber: number;
    public CreatedAt: Date;
    public MaxAmount: number;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public StatusCode: number;
    public Name: string;
    public KID: string;
    public InstalmentPercent: number;
    public Deleted: boolean;
    public UpdatedBy: string;
    public CreatePayment: boolean;
    public InstalmentType: SalBalType;
    public SupplierID: number;
    public Instalment: number;
    public MinAmount: number;
    public ID: number;
    public SalarytransactionDescription: string;
    public _createguid: string;
    public Supplier: Supplier;
    public SalaryBalances: Array<SalaryBalance>;
    public CustomFields: any;
}


export class SalaryTransaction extends UniEntity {
    public static RelativeUrl = 'salarytrans';
    public static EntityType = 'SalaryTransaction';

    public FromDate: Date;
    public WageTypeID: number;
    public DimensionsID: number;
    public Account: number;
    public calcAGA: number;
    public SalaryTransactionCarInfoID: number;
    public Text: string;
    public ChildSalaryTransactionID: number;
    public WageTypeNumber: number;
    public CreatedAt: Date;
    public HolidayPayDeduction: boolean;
    public Amount: number;
    public Rate: number;
    public PayrollRunID: number;
    public EmploymentID: number;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public StatusCode: number;
    public SalaryBalanceID: number;
    public recurringPostValidFrom: Date;
    public EmployeeID: number;
    public Deleted: boolean;
    public ToDate: Date;
    public EmployeeNumber: number;
    public VatTypeID: number;
    public IsRecurringPost: boolean;
    public SystemType: StdSystemType;
    public recurringPostValidTo: Date;
    public Sum: number;
    public UpdatedBy: string;
    public TaxbasisID: number;
    public ID: number;
    public MunicipalityNo: string;
    public RecurringID: number;
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

    public IsLongRange: boolean;
    public CreatedAt: Date;
    public RegistrationYear: number;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public StatusCode: number;
    public Deleted: boolean;
    public IsElectric: boolean;
    public UpdatedBy: string;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class SalaryTransactionSupplement extends UniEntity {
    public static RelativeUrl = 'supplements';
    public static EntityType = 'SalaryTransactionSupplement';

    public ValueBool: boolean;
    public CreatedAt: Date;
    public ValueDate: Date;
    public WageTypeSupplementID: number;
    public ValueString: string;
    public SalaryTransactionID: number;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public ValueDate2: Date;
    public StatusCode: number;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
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
    public UpdatedAt: Date;
    public CreatedBy: string;
    public StatusCode: number;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class SubEntity extends UniEntity {
    public static RelativeUrl = 'subentities';
    public static EntityType = 'SubEntity';

    public freeAmount: number;
    public BusinessRelationID: number;
    public CreatedAt: Date;
    public AgaZone: number;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public AgaRule: number;
    public StatusCode: number;
    public Deleted: boolean;
    public OrgNumber: string;
    public SuperiorOrganizationID: number;
    public UpdatedBy: string;
    public ID: number;
    public MunicipalityNo: string;
    public _createguid: string;
    public BusinessRelationInfo: BusinessRelation;
    public SuperiorOrganization: SubEntity;
    public CustomFields: any;
}


export class TaxBasis extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'TaxBasis';

    public DisabilityOtherBasis: number;
    public PensionSourcetaxBasis: number;
    public CreatedAt: Date;
    public SailorBasis: number;
    public PensionBasis: number;
    public ForeignBorderCommuterBasis: number;
    public Basis: number;
    public SalaryTransactionID: number;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public StatusCode: number;
    public ForeignCitizenInsuranceBasis: number;
    public Deleted: boolean;
    public JanMayenBasis: number;
    public UpdatedBy: string;
    public SvalbardBasis: number;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class Travel extends UniEntity {
    public static RelativeUrl = 'travels';
    public static EntityType = 'Travel';

    public DimensionsID: number;
    public Email: string;
    public SourceSystem: string;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public Purpose: string;
    public StatusCode: number;
    public Name: string;
    public Deleted: boolean;
    public EmployeeNumber: number;
    public State: state;
    public Phone: string;
    public Comment: string;
    public PersonID: string;
    public UpdatedBy: string;
    public SupplierID: number;
    public ID: number;
    public Description: string;
    public TravelIdentificator: string;
    public _createguid: string;
    public AdvanceAmount: number;
    public TravelLines: Array<TravelLine>;
    public Dimensions: Dimensions;
    public CustomFields: any;
}


export class TravelLine extends UniEntity {
    public static RelativeUrl = 'travellines';
    public static EntityType = 'TravelLine';

    public DimensionsID: number;
    public TypeID: number;
    public CreatedAt: Date;
    public InvoiceAccount: number;
    public Amount: number;
    public Rate: number;
    public LineState: linestate;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public To: Date;
    public StatusCode: number;
    public CostType: costtype;
    public Deleted: boolean;
    public VatTypeID: number;
    public paytransID: number;
    public From: Date;
    public UpdatedBy: string;
    public ID: number;
    public Description: string;
    public TravelID: number;
    public TravelIdentificator: string;
    public AccountNumber: number;
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
    public CreatedAt: Date;
    public InvoiceAccount: number;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public StatusCode: number;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ForeignDescription: string;
    public ID: number;
    public Description: string;
    public ForeignTypeID: string;
    public _createguid: string;
    public CustomFields: any;
}


export class VacationPayLine extends UniEntity {
    public static RelativeUrl = 'VacationPayLines';
    public static EntityType = 'VacationPayLine';

    public Year: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public StatusCode: number;
    public EmployeeID: number;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public ManualVacationPayBase: number;
    public Rate60: number;
    public Withdrawal: number;
    public _createguid: string;
    public PaidVacationPay: number;
    public PaidTaxFreeVacationPay: number;
    public MissingEarlierVacationPay: number;
    public Rate: number;
    public VacationPay: number;
    public VacationPay60: number;
    public SystemVacationPayBase: number;
    public Age: number;
    public Employee: Employee;
    public CustomFields: any;
}


export class VacationRateEmployee extends UniEntity {
    public static RelativeUrl = 'employeevacationrates';
    public static EntityType = 'VacationRateEmployee';

    public Rate60: number;
    public CreatedAt: Date;
    public Rate: number;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public StatusCode: number;
    public StartDate: Date;
    public EmployeeID: number;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public EndDate: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class WageType extends UniEntity {
    public static RelativeUrl = 'wagetypes';
    public static EntityType = 'WageType';

    public Base_Vacation: boolean;
    public SpecialTaxAndContributionsRule: SpecialTaxAndContributionsRule;
    public Limit_value: number;
    public RateFactor: number;
    public WageTypeNumber: number;
    public CreatedAt: Date;
    public FixedSalaryHolidayDeduction: boolean;
    public Limit_WageTypeNumber: number;
    public IncomeType: string;
    public Base_div3: boolean;
    public Rate: number;
    public taxtype: TaxType;
    public Limit_type: LimitType;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public Base_Payment: boolean;
    public GetRateFrom: GetRateFrom;
    public Base_EmploymentTax: boolean;
    public StatusCode: number;
    public Postnr: string;
    public SpecialAgaRule: SpecialAgaRule;
    public NoNumberOfHours: boolean;
    public ValidYear: number;
    public SpecialTaxHandling: string;
    public Benefit: string;
    public Deleted: boolean;
    public SystemRequiredWageType: number;
    public Limit_newRate: number;
    public Systemtype: string;
    public UpdatedBy: string;
    public Base_div2: boolean;
    public WageTypeName: string;
    public RatetypeColumn: RateTypeColumn;
    public ID: number;
    public Description: string;
    public DaysOnBoard: boolean;
    public AccountNumber_balance: number;
    public SupplementPackage: string;
    public HideFromPaycheck: boolean;
    public AccountNumber: number;
    public StandardWageTypeFor: StdWageType;
    public _createguid: string;
    public SupplementaryInformations: Array<WageTypeSupplement>;
    public CustomFields: any;
}


export class WageTypeSupplement extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'WageTypeSupplement';

    public WageTypeID: number;
    public CreatedAt: Date;
    public ValueType: Valuetype;
    public SuggestedValue: string;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public ameldingType: string;
    public StatusCode: number;
    public Name: string;
    public Deleted: boolean;
    public GetValueFromTrans: boolean;
    public UpdatedBy: string;
    public ID: number;
    public Description: string;
    public _createguid: string;
    public CustomFields: any;
}


export class WageTypeTranslation extends UniEntity {
    public static RelativeUrl = 'wagetypetranslations';
    public static EntityType = 'WageTypeTranslation';

    public EmployeeLanguageID: number;
    public WageTypeNumber: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public StatusCode: number;
    public Deleted: boolean;
    public UpdatedBy: string;
    public WageTypeName: string;
    public ID: number;
    public _createguid: string;
    public EmployeeLanguage: EmployeeLanguage;
    public CustomFields: any;
}


export class PensionScheme extends UniEntity {
    public static RelativeUrl = 'pensionschemes';
    public static EntityType = 'PensionScheme';

    public Year: number;
    public Identificator: string;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public Period: number;
    public StatusCode: number;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class PensionSchemeSupplier extends UniEntity {
    public static RelativeUrl = 'pensionschemesuppliers';
    public static EntityType = 'PensionSchemeSupplier';

    public Identificator: string;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public StatusCode: number;
    public Name: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class StandardPensionSchemeSupplier extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'StandardPensionSchemeSupplier';

    public Identificator: string;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public Name: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class EmployeeLanguage extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'EmployeeLanguage';

    public CreatedAt: Date;
    public LanguageCode: string;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public StatusCode: number;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class ComponentLayout extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ComponentLayout';

    public BaseEntity: string;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public StatusCode: number;
    public Name: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public _createguid: string;
    public Fields: Array<FieldLayout>;
    public CustomFields: any;
}


export class FieldLayout extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'FieldLayout';

    public Combo: number;
    public Alignment: Alignment;
    public ReadOnly: boolean;
    public LineBreak: boolean;
    public CreatedAt: Date;
    public Hidden: boolean;
    public Width: string;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public Section: number;
    public FieldType: FieldType;
    public HelpText: string;
    public Property: string;
    public FieldSet: number;
    public StatusCode: number;
    public Legend: string;
    public Sectionheader: string;
    public Deleted: boolean;
    public Label: string;
    public Options: string;
    public Placement: number;
    public LookupField: boolean;
    public UpdatedBy: string;
    public Placeholder: string;
    public ComponentLayoutID: number;
    public EntityType: string;
    public ID: number;
    public Description: string;
    public DisplayField: string;
    public _createguid: string;
    public CustomFields: any;
}


export class CurrencyOverride extends UniEntity {
    public static RelativeUrl = 'currencyoverrides';
    public static EntityType = 'CurrencyOverride';

    public FromDate: LocalDate;
    public CreatedAt: Date;
    public ToCurrencyCodeID: number;
    public Source: CurrencySourceEnum;
    public Factor: number;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public ToDate: LocalDate;
    public FromCurrencyCodeID: number;
    public UpdatedBy: string;
    public ID: number;
    public ExchangeRate: number;
    public _createguid: string;
    public FromCurrencyCode: CurrencyCode;
    public ToCurrencyCode: CurrencyCode;
    public CustomFields: any;
}


export class AccountAssetGroup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AccountAssetGroup';

    public CreatedAt: Date;
    public ToAccountNumber: number;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public AssetGroupCode: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public FromAccountNumber: number;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class AccountGroupSetup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AccountGroupSetup';

    public PlanType: PlanTypeEnum;
    public CreatedAt: Date;
    public ParentID: number;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public ExternalReference: string;
    public Name: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public _createguid: string;
    public Parent: AccountGroupSetup;
    public CustomFields: any;
}


export class AccountSetup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AccountSetup';

    public PlanType: PlanTypeEnum;
    public CreatedAt: Date;
    public AccountGroupSetupID: number;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public ExpectedDebitBalance: boolean;
    public AccountName: string;
    public Deleted: boolean;
    public Visible: boolean;
    public UpdatedBy: string;
    public ID: number;
    public SaftMappingAccountID: number;
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
    public UpdatedAt: Date;
    public CreatedBy: string;
    public Name: string;
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

    public AccountSetupID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public AccountVisibilityGroupID: number;
    public UpdatedBy: string;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class AGARate extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AGARate';

    public ZoneID: number;
    public CreatedAt: Date;
    public Rate: number;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public RateValidFrom: Date;
    public ID: number;
    public _createguid: string;
    public sector: Array<AGASector>;
    public CustomFields: any;
}


export class AGASector extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AGASector';

    public freeAmount: number;
    public RateID: number;
    public CreatedAt: Date;
    public Rate: number;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public SectorID: number;
    public Deleted: boolean;
    public ValidFrom: Date;
    public UpdatedBy: string;
    public Sector: string;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class AGAZone extends UniEntity {
    public static RelativeUrl = 'AGAZones';
    public static EntityType = 'AGAZone';

    public CreatedAt: Date;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ZoneName: string;
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
    public UpdatedAt: Date;
    public CreatedBy: string;
    public Name: string;
    public Deleted: boolean;
    public AppliesTo: number;
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
    public UpdatedAt: Date;
    public CreatedBy: string;
    public Code: string;
    public DepreciationRate: number;
    public Name: string;
    public Deleted: boolean;
    public ToDate: Date;
    public UpdatedBy: string;
    public ID: number;
    public DepreciationAccountNumber: number;
    public _createguid: string;
    public CustomFields: any;
}


export class BankIdentifierCode extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'BankIdentifierCode';

    public CreatedAt: Date;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public BankName: string;
    public Deleted: boolean;
    public Bic: string;
    public UpdatedBy: string;
    public ID: number;
    public BankIdentifier: string;
    public _createguid: string;
    public CustomFields: any;
}


export class CompanyType extends UniEntity {
    public static RelativeUrl = 'companytypes';
    public static EntityType = 'CompanyType';

    public CreatedAt: Date;
    public FullName: string;
    public Priority: boolean;
    public DefaultAccountVisibilityGroupID: number;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public Name: string;
    public DefaultPlanType: PlanTypeEnum;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public Description: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Confirmation extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Confirmation';

    public Email: string;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public Code: string;
    public PostalCode: string;
    public DisplayName: string;
    public StatusCode: number;
    public ContractType: string;
    public Deleted: boolean;
    public Phone: string;
    public ExpirationDate: Date;
    public UpdatedBy: string;
    public CompanyName: string;
    public ID: number;
    public SignUpReferrer: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Country extends UniEntity {
    public static RelativeUrl = 'countries';
    public static EntityType = 'Country';

    public CurrencyRateSource: string;
    public CreatedAt: Date;
    public CountryCode: string;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public Name: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public DefaultCurrencyCode: string;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class Currency extends UniEntity {
    public static RelativeUrl = 'currencies';
    public static EntityType = 'Currency';

    public CreatedAt: Date;
    public ToCurrencyCodeID: number;
    public Source: CurrencySourceEnum;
    public Factor: number;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public CurrencyDate: LocalDate;
    public Deleted: boolean;
    public FromCurrencyCodeID: number;
    public UpdatedBy: string;
    public ID: number;
    public ExchangeRate: number;
    public _createguid: string;
    public FromCurrencyCode: CurrencyCode;
    public ToCurrencyCode: CurrencyCode;
    public CustomFields: any;
}


export class CurrencyCode extends UniEntity {
    public static RelativeUrl = 'currencycodes';
    public static EntityType = 'CurrencyCode';

    public CreatedAt: Date;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public Code: string;
    public Name: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public Description: string;
    public ShortCode: string;
    public _createguid: string;
    public CustomFields: any;
}


export class DebtCollectionAutomation extends UniEntity {
    public static RelativeUrl = 'debtcollectionautomation';
    public static EntityType = 'DebtCollectionAutomation';

    public DebtCollectionSettingsID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public Name: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public Description: string;
    public _createguid: string;
    public DebtCollectionSettings: DebtCollectionSettings;
    public CustomFields: any;
}


export class EmploymentValidValues extends UniEntity {
    public static RelativeUrl = 'employmentvalidvalues';
    public static EntityType = 'EmploymentValidValues';

    public CreatedAt: Date;
    public LastWorkPercentChange: boolean;
    public typeOfEmployment: boolean;
    public HourRate: boolean;
    public employment: TypeOfEmployment;
    public LastSalaryChangeDate: boolean;
    public TradeArea: boolean;
    public WorkPercent: boolean;
    public UserDefinedRate: boolean;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public WorkingHoursScheme: boolean;
    public PaymentType: RemunerationType;
    public StartDate: boolean;
    public JobCode: boolean;
    public Deleted: boolean;
    public SeniorityDate: boolean;
    public JobName: boolean;
    public ShipReg: boolean;
    public HoursPerWeek: boolean;
    public UpdatedBy: string;
    public RemunerationType: boolean;
    public ShipType: boolean;
    public ID: number;
    public MonthRate: boolean;
    public EndDate: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class FinancialDeadline extends UniEntity {
    public static RelativeUrl = 'deadlines';
    public static EntityType = 'FinancialDeadline';

    public Deadline: LocalDate;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public Type: FinancialDeadlineType;
    public StatusCode: number;
    public Name: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public PassableDueDate: number;
    public AdditionalInfo: string;
    public _createguid: string;
    public CustomFields: any;
}


export class JobTicket extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'JobTicket';

    public JobId: string;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public JobName: string;
    public JobStatus: string;
    public UpdatedBy: string;
    public ID: number;
    public GlobalIdentity: string;
    public _createguid: string;
    public CustomFields: any;
}


export class LanguageCode extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'LanguageCode';

    public CreatedAt: Date;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public Code: string;
    public Name: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class Municipal extends UniEntity {
    public static RelativeUrl = 'Municipals';
    public static EntityType = 'Municipal';

    public Retired: boolean;
    public CreatedAt: Date;
    public CountyNo: string;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public MunicipalityName: string;
    public CountyName: string;
    public UpdatedBy: string;
    public ID: number;
    public MunicipalityNo: string;
    public _createguid: string;
    public CustomFields: any;
}


export class MunicipalAGAZone extends UniEntity {
    public static RelativeUrl = 'MunicipalAGAZones';
    public static EntityType = 'MunicipalAGAZone';

    public ZoneID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public Startdate: Date;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public MunicipalityNo: string;
    public _createguid: string;
    public CustomFields: any;
}


export class PaymentBatchType extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'PaymentBatchType';

    public CreatedAt: Date;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public Code: number;
    public Name: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public Description: string;
    public _createguid: string;
    public CustomFields: any;
}


export class PaymentCode extends UniEntity {
    public static RelativeUrl = 'paymentCodes';
    public static EntityType = 'PaymentCode';

    public CreatedAt: Date;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public Code: number;
    public PaymentGroup: string;
    public Name: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public Description: string;
    public _createguid: string;
    public CustomFields: any;
}


export class PostalCode extends UniEntity {
    public static RelativeUrl = 'postalcodes';
    public static EntityType = 'PostalCode';

    public CreatedAt: Date;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public Code: string;
    public StatusCode: number;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public City: string;
    public _createguid: string;
    public CustomFields: any;
}


export class SaftMappingAccount extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'SaftMappingAccount';

    public CreatedAt: Date;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public AccountID: string;
    public UpdatedBy: string;
    public ID: number;
    public Description: string;
    public _createguid: string;
    public CustomFields: any;
}


export class StaticRegister extends UniEntity {
    public static RelativeUrl = 'StaticRegister';
    public static EntityType = 'StaticRegister';

    public CreatedAt: Date;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public stamp: Date;
    public Registry: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class STYRKCode extends UniEntity {
    public static RelativeUrl = 'STYRK';
    public static EntityType = 'STYRKCode';

    public CreatedAt: Date;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public styrk: string;
    public lnr: number;
    public ynr: number;
    public UpdatedBy: string;
    public ID: number;
    public tittel: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Language extends UniEntity {
    public static RelativeUrl = 'languages';
    public static EntityType = 'Language';

    public CreatedAt: Date;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public Code: string;
    public Name: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public FallBackLanguageID: number;
    public ID: number;
    public _createguid: string;
    public Translations: Array<Translation>;
    public CustomFields: any;
}


export class Translatable extends UniEntity {
    public static RelativeUrl = 'translatables';
    public static EntityType = 'Translatable';

    public Module: i18nModule;
    public Value: string;
    public Column: string;
    public CreatedAt: Date;
    public Static: boolean;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public Model: string;
    public UpdatedBy: string;
    public ID: number;
    public Description: string;
    public Meaning: string;
    public _createguid: string;
    public Translations: Array<Translation>;
    public CustomFields: any;
}


export class Translation extends UniEntity {
    public static RelativeUrl = 'translations';
    public static EntityType = 'Translation';

    public Value: string;
    public CreatedAt: Date;
    public LanguageID: number;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public TranslatableID: number;
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

    public No: string;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public Name: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class VatPostSetup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'VatPostSetup';

    public VatCodeGroupSetupNo: string;
    public No: string;
    public HasTaxAmount: boolean;
    public CreatedAt: Date;
    public ReportAsNegativeAmount: boolean;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public Name: string;
    public HasTaxBasis: boolean;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class VatReportForm extends UniEntity {
    public static RelativeUrl = 'vatreportforms';
    public static EntityType = 'VatReportForm';

    public CreatedAt: Date;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public Name: string;
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

    public CreatedAt: Date;
    public VatPostNo: string;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public VatCode: string;
    public AccountNumber: number;
    public _createguid: string;
    public CustomFields: any;
}


export class VatTypeSetup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'VatTypeSetup';

    public OutgoingAccountNumber: number;
    public CreatedAt: Date;
    public IsNotVatRegistered: boolean;
    public OutputVat: boolean;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public IncomingAccountNumber: number;
    public IsCompensated: boolean;
    public ReversedTaxDutyVat: boolean;
    public Name: string;
    public DefaultVisible: boolean;
    public VatCodeGroupNo: string;
    public Deleted: boolean;
    public DirectJournalEntryOnly: boolean;
    public UpdatedBy: string;
    public ID: number;
    public VatCode: string;
    public _createguid: string;
    public VatTypeSetupPercentages: Array<VatTypeSetupPercentage>;
    public CustomFields: any;
}


export class VatTypeSetupPercentage extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'VatTypeSetupPercentage';

    public CreatedAt: Date;
    public VatTypeSetupID: number;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public VatPercent: number;
    public Deleted: boolean;
    public ValidFrom: LocalDate;
    public ValidTo: LocalDate;
    public UpdatedBy: string;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class CompanyReport extends UniEntity {
    public static RelativeUrl = 'company-report';
    public static EntityType = 'CompanyReport';

    public CreatedAt: Date;
    public CompanyKey: string;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public ReportDefinitionID: number;
    public ContractId: number;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class ReportDefinition extends UniEntity {
    public static RelativeUrl = 'report-definitions';
    public static EntityType = 'ReportDefinition';

    public CreatedAt: Date;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public ReportSource: string;
    public UniqueReportID: string;
    public CategoryLabel: string;
    public Name: string;
    public Deleted: boolean;
    public Category: string;
    public ReportType: number;
    public Visible: boolean;
    public IsStandard: boolean;
    public UpdatedBy: string;
    public Md5: string;
    public TemplateLinkId: string;
    public ID: number;
    public Version: string;
    public Description: string;
    public _createguid: string;
    public CustomFields: any;
}


export class ReportDefinitionDataSource extends UniEntity {
    public static RelativeUrl = 'report-definition-data-sources';
    public static EntityType = 'ReportDefinitionDataSource';

    public CreatedAt: Date;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public DataSourceUrl: string;
    public ReportDefinitionId: number;
    public Name: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class ReportDefinitionParameter extends UniEntity {
    public static RelativeUrl = 'report-definition-parameters';
    public static EntityType = 'ReportDefinitionParameter';

    public DefaultValueList: string;
    public DefaultValueLookupType: string;
    public SortIndex: number;
    public CreatedAt: Date;
    public DefaultValue: string;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public Type: string;
    public ReportDefinitionId: number;
    public Name: string;
    public Deleted: boolean;
    public Label: string;
    public Visible: boolean;
    public DefaultValueSource: string;
    public UpdatedBy: string;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class PeriodSeries extends UniEntity {
    public static RelativeUrl = 'period-series';
    public static EntityType = 'PeriodSeries';

    public CreatedAt: Date;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public Active: boolean;
    public Name: string;
    public Deleted: boolean;
    public SeriesType: PeriodSeriesType;
    public UpdatedBy: string;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class PeriodTemplate extends UniEntity {
    public static RelativeUrl = 'period-templates';
    public static EntityType = 'PeriodTemplate';

    public FromDate: LocalDate;
    public PeriodSeriesID: number;
    public No: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public Name: string;
    public Deleted: boolean;
    public ToDate: LocalDate;
    public UpdatedBy: string;
    public ID: number;
    public _createguid: string;
    public PeriodSeries: PeriodSeries;
    public CustomFields: any;
}


export class Model extends UniEntity {
    public static RelativeUrl = 'models';
    public static EntityType = 'Model';

    public Shared: boolean;
    public LabelPlural: string;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public Name: string;
    public Deleted: boolean;
    public Label: string;
    public UpdatedBy: string;
    public ID: number;
    public Description: string;
    public Admin: boolean;
    public _createguid: string;
    public Fields: Array<Field>;
    public CustomFields: any;
}


export class Field extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Field';

    public CreatedAt: Date;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public HelpText: string;
    public Name: string;
    public Deleted: boolean;
    public Label: string;
    public UpdatedBy: string;
    public ID: number;
    public Description: string;
    public ModelID: number;
    public _createguid: string;
    public Model: Model;
    public CustomFields: any;
}


export class Notification extends UniEntity {
    public static RelativeUrl = 'notifications';
    public static EntityType = 'Notification';

    public SourceEntityID: number;
    public CreatedAt: Date;
    public CompanyKey: string;
    public Message: string;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public RecipientID: string;
    public StatusCode: number;
    public Deleted: boolean;
    public SourceEntityType: string;
    public EntityID: number;
    public UpdatedBy: string;
    public CompanyName: string;
    public EntityType: string;
    public ID: number;
    public SenderDisplayName: string;
    public _createguid: string;
    public CustomFields: any;
}


export class CompanySettings extends UniEntity {
    public static RelativeUrl = 'companysettings';
    public static EntityType = 'CompanySettings';

    public EnableSendPaymentBeforeJournaled: boolean;
    public DefaultAccrualAccountID: number;
    public AutoJournalPayment: string;
    public TwoStageAutobankEnabled: boolean;
    public APIncludeAttachment: boolean;
    public WebAddress: string;
    public CustomerCreditDays: number;
    public UseXtraPaymentOrgXmlTag: boolean;
    public EnableAdvancedJournalEntry: boolean;
    public NetsIntegrationActivated: boolean;
    public DefaultSalesAccountID: number;
    public SettlementVatAccountID: number;
    public LogoAlign: number;
    public SupplierAccountID: number;
    public BankChargeAccountID: number;
    public DefaultPhoneID: number;
    public CreatedAt: Date;
    public ForceSupplierInvoiceApproval: boolean;
    public SalaryBankAccountID: number;
    public BatchInvoiceMinAmount: number;
    public IgnorePaymentsWithoutEndToEndID: boolean;
    public FactoringEmailID: number;
    public APContactID: number;
    public HideInActiveCustomers: boolean;
    public CompanyTypeID: number;
    public InterrimRemitAccountID: number;
    public AccountingLockedDate: LocalDate;
    public AcceptableDelta4CustomerPayment: number;
    public DefaultCustomerInvoiceReportID: number;
    public TaxBankAccountID: number;
    public BaseCurrencyCodeID: number;
    public DefaultTOFCurrencySettingsID: number;
    public Factoring: number;
    public GLN: string;
    public DefaultCustomerQuoteReportID: number;
    public APGuid: string;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public InterrimPaymentAccountID: number;
    public BookCustomerInvoiceOnDeliveryDate: boolean;
    public AcceptableDelta4CustomerPaymentAccountID: number;
    public DefaultCustomerOrderReportID: number;
    public DefaultAddressID: number;
    public XtraPaymentOrgXmlTagValue: string;
    public PeriodSeriesVatID: number;
    public VatReportFormID: number;
    public HideInActiveSuppliers: boolean;
    public StatusCode: number;
    public UseOcrInterpretation: boolean;
    public CompanyBankAccountID: number;
    public CompanyRegistered: boolean;
    public PeriodSeriesAccountID: number;
    public Localization: string;
    public UseNetsIntegration: boolean;
    public UseAssetRegister: boolean;
    public PaymentBankIdentification: string;
    public UseFinancialDateToCalculateVatPercent: boolean;
    public OrganizationNumber: string;
    public Deleted: boolean;
    public EnableApprovalFlow: boolean;
    public HasAutobank: boolean;
    public EnableArchiveSupplierInvoice: boolean;
    public TaxableFromLimit: number;
    public VatLockedDate: LocalDate;
    public AccountVisibilityGroupID: number;
    public DefaultEmailID: number;
    public TaxableFromDate: LocalDate;
    public AgioGainAccountID: number;
    public FactoringNumber: number;
    public DefaultDistributionsID: number;
    public AllowAvtalegiroRegularInvoice: boolean;
    public PaymentBankAgreementNumber: string;
    public AccountGroupSetID: number;
    public APActivated: boolean;
    public RoundingNumberOfDecimals: number;
    public TaxMandatoryType: number;
    public UpdatedBy: string;
    public CompanyName: string;
    public ShowKIDOnCustomerInvoice: boolean;
    public OfficeMunicipalityNo: string;
    public DefaultCustomerInvoiceReminderReportID: number;
    public EnableCheckboxesForSupplierInvoiceList: boolean;
    public StoreDistributedInvoice: boolean;
    public CustomerInvoiceReminderSettingsID: number;
    public SaveCustomersFromQuoteAsLead: boolean;
    public AutoDistributeInvoice: boolean;
    public LogoHideField: number;
    public CustomerAccountID: number;
    public TaxMandatory: boolean;
    public ID: number;
    public ShowNumberOfDecimals: number;
    public AgioLossAccountID: number;
    public OnlyJournalMatchedPayments: boolean;
    public LogoFileID: number;
    public SAFTimportAccountID: number;
    public RoundingType: RoundingType;
    public UsePaymentBankValues: boolean;
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
    public UpdatedAt: Date;
    public CreatedBy: string;
    public StatusCode: number;
    public Name: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public EntityType: string;
    public ID: number;
    public _createguid: string;
    public Elements: Array<DistributionPlanElement>;
    public CustomFields: any;
}


export class DistributionPlanElement extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'DistributionPlanElement';

    public DistributionPlanID: number;
    public CreatedAt: Date;
    public Priority: number;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public StatusCode: number;
    public Deleted: boolean;
    public UpdatedBy: string;
    public DistributionPlanElementTypeID: number;
    public ID: number;
    public _createguid: string;
    public ElementType: DistributionPlanElementType;
    public CustomFields: any;
}


export class DistributionPlanElementType extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'DistributionPlanElementType';

    public CreatedAt: Date;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public StatusCode: number;
    public Name: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public _createguid: string;
    public LegalEntities: Array<DistributionPlanElementTypeLegalEntity>;
    public CustomFields: any;
}


export class DistributionPlanElementTypeLegalEntity extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'DistributionPlanElementTypeLegalEntity';

    public CreatedAt: Date;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public StatusCode: number;
    public Deleted: boolean;
    public UpdatedBy: string;
    public DistributionPlanElementTypeID: number;
    public EntityType: string;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class Distributions extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Distributions';

    public CreatedAt: Date;
    public CustomerQuoteDistributionPlanID: number;
    public PayCheckDistributionPlanID: number;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public StatusCode: number;
    public CustomerOrderDistributionPlanID: number;
    public AnnualStatementDistributionPlanID: number;
    public CustomerInvoiceReminderDistributionPlanID: number;
    public Deleted: boolean;
    public CustomerInvoiceDistributionPlanID: number;
    public UpdatedBy: string;
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

    public CreatedAt: Date;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public StatusCode: number;
    public Name: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class EmailLog extends UniEntity {
    public static RelativeUrl = 'emails';
    public static EntityType = 'EmailLog';

    public JobRunID: number;
    public CreatedAt: Date;
    public EntityDisplayValue: string;
    public DistributeAt: LocalDate;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public ExternalReference: string;
    public JobRunExternalRef: string;
    public Type: SharingType;
    public To: string;
    public StatusCode: number;
    public Deleted: boolean;
    public Subject: string;
    public EntityID: number;
    public From: string;
    public UpdatedBy: string;
    public EntityType: string;
    public ID: number;
    public ExternalMessage: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Eventplan extends UniEntity {
    public static RelativeUrl = 'eventplans';
    public static EntityType = 'Eventplan';

    public PlanType: EventplanType;
    public SigningKey: string;
    public CreatedAt: Date;
    public JobNames: string;
    public IsSystemPlan: boolean;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public Active: boolean;
    public StatusCode: number;
    public ModelFilter: string;
    public Name: string;
    public Deleted: boolean;
    public OperationFilter: string;
    public UpdatedBy: string;
    public ID: number;
    public Cargo: string;
    public _createguid: string;
    public ExpressionFilters: Array<ExpressionFilter>;
    public Subscribers: Array<EventSubscriber>;
    public CustomFields: any;
}


export class EventSubscriber extends UniEntity {
    public static RelativeUrl = 'eventsubscribers';
    public static EntityType = 'EventSubscriber';

    public CreatedAt: Date;
    public Authorization: string;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public Active: boolean;
    public StatusCode: number;
    public Name: string;
    public EventplanID: number;
    public Deleted: boolean;
    public Headers: string;
    public UpdatedBy: string;
    public Endpoint: string;
    public ID: number;
    public _createguid: string;
    public Eventplan: Eventplan;
    public CustomFields: any;
}


export class ExpressionFilter extends UniEntity {
    public static RelativeUrl = 'expressionfilters';
    public static EntityType = 'ExpressionFilter';

    public CreatedAt: Date;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public StatusCode: number;
    public EventplanID: number;
    public EntityName: string;
    public Deleted: boolean;
    public Expression: string;
    public UpdatedBy: string;
    public ID: number;
    public _createguid: string;
    public Eventplan: Eventplan;
    public CustomFields: any;
}


export class Period extends UniEntity {
    public static RelativeUrl = 'periodes';
    public static EntityType = 'Period';

    public FromDate: LocalDate;
    public PeriodTemplateID: number;
    public PeriodSeriesID: number;
    public No: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public StatusCode: number;
    public Name: string;
    public Deleted: boolean;
    public ToDate: LocalDate;
    public UpdatedBy: string;
    public AccountYear: number;
    public ID: number;
    public _createguid: string;
    public PeriodTemplate: PeriodTemplate;
    public PeriodSeries: PeriodSeries;
    public CustomFields: any;
}


export class PredefinedDescription extends UniEntity {
    public static RelativeUrl = 'predefineddescriptions';
    public static EntityType = 'PredefinedDescription';

    public CreatedAt: Date;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public Code: string;
    public Type: PredefinedDescriptionType;
    public StatusCode: number;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public Description: string;
    public _createguid: string;
    public CustomFields: any;
}


export class ProductCategory extends UniEntity {
    public static RelativeUrl = 'productcategories';
    public static EntityType = 'ProductCategory';

    public Status: number;
    public CreatedAt: Date;
    public ParentID: number;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public StatusCode: number;
    public Name: string;
    public Deleted: boolean;
    public Depth: number;
    public Comment: string;
    public Lft: number;
    public UpdatedBy: string;
    public Rght: number;
    public ID: number;
    public Description: string;
    public _createguid: string;
    public CustomFields: any;
}


export class ProductCategoryLink extends UniEntity {
    public static RelativeUrl = 'productcategorylinks';
    public static EntityType = 'ProductCategoryLink';

    public ProductID: number;
    public ProductCategoryID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public StatusCode: number;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public _createguid: string;
    public ProductCategory: ProductCategory;
    public CustomFields: any;
}


export class Sharing extends UniEntity {
    public static RelativeUrl = 'sharings';
    public static EntityType = 'Sharing';

    public JobRunID: number;
    public CreatedAt: Date;
    public EntityDisplayValue: string;
    public DistributeAt: LocalDate;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public ExternalReference: string;
    public JobRunExternalRef: string;
    public Type: SharingType;
    public To: string;
    public StatusCode: number;
    public Deleted: boolean;
    public Subject: string;
    public EntityID: number;
    public From: string;
    public UpdatedBy: string;
    public EntityType: string;
    public ID: number;
    public ExternalMessage: string;
    public _createguid: string;
    public CustomFields: any;
}


export class StatusLog extends UniEntity {
    public static RelativeUrl = 'statuslogs';
    public static EntityType = 'StatusLog';

    public FromStatus: number;
    public CreatedAt: Date;
    public ToStatus: number;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public EntityID: number;
    public UpdatedBy: string;
    public EntityType: string;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class Tracelink extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Tracelink';

    public CreatedAt: Date;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public StatusCode: number;
    public Date: Date;
    public SourceEntityName: string;
    public Deleted: boolean;
    public SourceInstanceID: number;
    public DestinationEntityName: string;
    public UpdatedBy: string;
    public ID: number;
    public DestinationInstanceID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class User extends UniEntity {
    public static RelativeUrl = 'users';
    public static EntityType = 'User';

    public Protected: boolean;
    public IsAutobankAdmin: boolean;
    public Email: string;
    public PhoneNumber: string;
    public HasAgreedToImportDisclaimer: boolean;
    public CreatedAt: Date;
    public UserName: string;
    public BankIntegrationUserName: string;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public DisplayName: string;
    public StatusCode: number;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public LastLogin: Date;
    public GlobalIdentity: string;
    public _createguid: string;
    public TwoFactorEnabled: boolean;
    public AuthPhoneNumber: string;
    public EndDate: Date;
    public CustomFields: any;
}


export class UniQueryDefinition extends UniEntity {
    public static RelativeUrl = 'uniquerydefinitions';
    public static EntityType = 'UniQueryDefinition';

    public SystemGeneratedQuery: boolean;
    public SortIndex: number;
    public CreatedAt: Date;
    public ClickUrl: string;
    public MainModelName: string;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public ModuleID: number;
    public Code: string;
    public StatusCode: number;
    public Name: string;
    public Deleted: boolean;
    public UserID: number;
    public Category: string;
    public UpdatedBy: string;
    public ClickParam: string;
    public ID: number;
    public Description: string;
    public IsShared: boolean;
    public _createguid: string;
    public UniQueryFilters: Array<UniQueryFilter>;
    public UniQueryFields: Array<UniQueryField>;
    public CustomFields: any;
}


export class UniQueryField extends UniEntity {
    public static RelativeUrl = 'uniqueryfields';
    public static EntityType = 'UniQueryField';

    public UniQueryDefinitionID: number;
    public Field: string;
    public CreatedAt: Date;
    public Width: string;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public FieldType: number;
    public Header: string;
    public Path: string;
    public StatusCode: number;
    public Deleted: boolean;
    public SumFunction: string;
    public UpdatedBy: string;
    public ID: number;
    public Alias: string;
    public Index: number;
    public _createguid: string;
    public CustomFields: any;
}


export class UniQueryFilter extends UniEntity {
    public static RelativeUrl = 'uniqueryfilters';
    public static EntityType = 'UniQueryFilter';

    public UniQueryDefinitionID: number;
    public Value: string;
    public Field: string;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public StatusCode: number;
    public Operator: string;
    public Deleted: boolean;
    public Group: number;
    public UpdatedBy: string;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class Team extends UniEntity {
    public static RelativeUrl = 'teams';
    public static EntityType = 'Team';

    public DimensionsID: number;
    public CreatedAt: Date;
    public ParentID: number;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public StatusCode: number;
    public Name: string;
    public Deleted: boolean;
    public Depth: number;
    public Lft: number;
    public UpdatedBy: string;
    public Rght: number;
    public ID: number;
    public _createguid: string;
    public Dimensions: Dimensions;
    public Positions: Array<TeamPosition>;
    public CustomFields: any;
}


export class TeamPosition extends UniEntity {
    public static RelativeUrl = 'teampositions';
    public static EntityType = 'TeamPosition';

    public FromDate: LocalDate;
    public CreatedAt: Date;
    public TeamID: number;
    public Position: TeamPositionEnum;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public RelatedSharedRoleId: number;
    public StatusCode: number;
    public Deleted: boolean;
    public ToDate: LocalDate;
    public UserID: number;
    public UpdatedBy: string;
    public ID: number;
    public ApproveOrder: number;
    public _createguid: string;
    public Team: Team;
    public CustomFields: any;
}


export class ApprovalRule extends UniEntity {
    public static RelativeUrl = 'approvalrules';
    public static EntityType = 'ApprovalRule';

    public Keywords: string;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public RuleType: ApprovalRuleType;
    public StatusCode: number;
    public IndustryCodes: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public Description: string;
    public _createguid: string;
    public Steps: Array<ApprovalRuleStep>;
    public CustomFields: any;
}


export class ApprovalRuleStep extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ApprovalRuleStep';

    public CreatedAt: Date;
    public Limit: number;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public StepNumber: number;
    public StatusCode: number;
    public Deleted: boolean;
    public UserID: number;
    public ApprovalRuleID: number;
    public UpdatedBy: string;
    public ID: number;
    public _createguid: string;
    public ApprovalRule: ApprovalRule;
    public User: User;
    public CustomFields: any;
}


export class ApprovalSubstitute extends UniEntity {
    public static RelativeUrl = 'approvalsubstitutes';
    public static EntityType = 'ApprovalSubstitute';

    public FromDate: LocalDate;
    public SubstituteUserID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public StatusCode: number;
    public Deleted: boolean;
    public ToDate: LocalDate;
    public UserID: number;
    public UpdatedBy: string;
    public ID: number;
    public _createguid: string;
    public User: User;
    public SubstituteUser: User;
    public CustomFields: any;
}


export class TaskApprovalPlan extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'TaskApprovalPlan';

    public CreatedAt: Date;
    public Limit: number;
    public Amount: number;
    public TaskID: number;
    public ApprovalID: number;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public StepNumber: number;
    public StatusCode: number;
    public Deleted: boolean;
    public Comment: string;
    public UserID: number;
    public ApprovalRuleID: number;
    public UpdatedBy: string;
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

    public IsDepricated: boolean;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public Order: number;
    public StatusCode: number;
    public Deleted: boolean;
    public UpdatedBy: string;
    public EntityType: string;
    public ID: number;
    public Description: string;
    public StatusCategoryID: number;
    public System: boolean;
    public _createguid: string;
    public StatusCategory: StatusCategory;
    public CustomFields: any;
}


export class StatusCategory extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'StatusCategory';

    public CreatedAt: Date;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public StatusCategoryCode: StatusCategoryCode;
    public Name: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class StatusRemark extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'StatusRemark';

    public CreatedAt: Date;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public StatusCode: number;
    public Deleted: boolean;
    public EntityID: number;
    public UpdatedBy: string;
    public Remark: string;
    public EntityType: string;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class Transition extends UniEntity {
    public static RelativeUrl = 'transitions';
    public static EntityType = 'Transition';

    public CreatedAt: Date;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public EntityType: string;
    public ID: number;
    public Controller: string;
    public MethodName: string;
    public _createguid: string;
    public CustomFields: any;
}


export class TransitionThreshold extends UniEntity {
    public static RelativeUrl = 'thresholds';
    public static EntityType = 'TransitionThreshold';

    public RejectStatusCode: number;
    public Value: string;
    public SharedRejectTransitionId: number;
    public CreatedAt: Date;
    public PropertyName: string;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public Operation: OperationType;
    public SharedRoleId: number;
    public Operator: Operator;
    public Deleted: boolean;
    public SharedApproveTransitionId: number;
    public UpdatedBy: string;
    public Disabled: boolean;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class TransitionThresholdApproval extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'TransitionThresholdApproval';

    public RejectStatusCode: number;
    public Value: string;
    public SharedRejectTransitionId: number;
    public CreatedAt: Date;
    public PropertyName: string;
    public ApprovalID: number;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public Operation: OperationType;
    public SharedRoleId: number;
    public Operator: Operator;
    public Deleted: boolean;
    public SharedApproveTransitionId: number;
    public UpdatedBy: string;
    public ID: number;
    public _createguid: string;
    public Approval: Approval;
    public CustomFields: any;
}


export class Approval extends UniEntity {
    public static RelativeUrl = 'approvals';
    public static EntityType = 'Approval';

    public CreatedAt: Date;
    public Amount: number;
    public TaskID: number;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public SharedRoleId: number;
    public StatusCode: number;
    public Deleted: boolean;
    public UserID: number;
    public UpdatedBy: string;
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

    public RejectStatusCode: number;
    public SharedRejectTransitionId: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public Type: TaskType;
    public SharedRoleId: number;
    public StatusCode: number;
    public Title: string;
    public Deleted: boolean;
    public SharedApproveTransitionId: number;
    public EntityID: number;
    public UserID: number;
    public UpdatedBy: string;
    public ID: number;
    public ModelID: number;
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

    public IsDepricated: boolean;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public TransitionID: number;
    public Deleted: boolean;
    public ExpiresDate: Date;
    public UpdatedBy: string;
    public EntityType: string;
    public ID: number;
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

    public DimensionsID: number;
    public ProjectNumberSeriesID: number;
    public CreatedAt: Date;
    public Amount: number;
    public Total: number;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public ProjectNumber: string;
    public Price: number;
    public ProjectLeadName: string;
    public ProjectCustomerID: number;
    public StatusCode: number;
    public PlannedStartdate: LocalDate;
    public Name: string;
    public StartDate: LocalDate;
    public Deleted: boolean;
    public WorkPlaceAddressID: number;
    public CostPrice: number;
    public UpdatedBy: string;
    public ProjectNumberNumeric: number;
    public PlannedEnddate: LocalDate;
    public ID: number;
    public Description: string;
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

    public CreatedAt: Date;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public StatusCode: number;
    public Name: string;
    public Deleted: boolean;
    public UserID: number;
    public Responsibility: string;
    public UpdatedBy: string;
    public ProjectID: number;
    public ID: number;
    public _createguid: string;
    public ProjectUser: User;
    public CustomFields: any;
}


export class ProjectResourceSchedule extends UniEntity {
    public static RelativeUrl = 'projects-schedules-resources';
    public static EntityType = 'ProjectResourceSchedule';

    public ProjectTaskID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public ProjectTaskScheduleID: number;
    public StatusCode: number;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public ProjectResourceID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class ProjectTask extends UniEntity {
    public static RelativeUrl = 'projects-tasks';
    public static EntityType = 'ProjectTask';

    public CreatedAt: Date;
    public Amount: number;
    public Total: number;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public SuggestedNumber: string;
    public Price: number;
    public StatusCode: number;
    public Name: string;
    public StartDate: LocalDate;
    public Deleted: boolean;
    public Number: string;
    public CostPrice: number;
    public UpdatedBy: string;
    public ProjectID: number;
    public ID: number;
    public Description: string;
    public EndDate: LocalDate;
    public _createguid: string;
    public ProjectTaskSchedules: Array<ProjectTaskSchedule>;
    public ProjectTaskResources: Array<ProjectResourceSchedule>;
    public CustomFields: any;
}


export class ProjectTaskSchedule extends UniEntity {
    public static RelativeUrl = 'projects-tasks-schedules';
    public static EntityType = 'ProjectTaskSchedule';

    public ProjectTaskID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public StatusCode: number;
    public StartDate: LocalDate;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public EndDate: LocalDate;
    public _createguid: string;
    public ScheduleResources: Array<ProjectResourceSchedule>;
    public CustomFields: any;
}


export class BarnepassProduct extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'BarnepassProduct';

    public ProductID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public StatusCode: number;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public _createguid: string;
    public Product: Product;
    public CustomFields: any;
}


export class Product extends UniEntity {
    public static RelativeUrl = 'products';
    public static EntityType = 'Product';

    public ListPrice: number;
    public DimensionsID: number;
    public CreatedAt: Date;
    public PriceExVat: number;
    public ImageFileID: number;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public Type: ProductTypeEnum;
    public PriceIncVat: number;
    public StatusCode: number;
    public Name: string;
    public PartName: string;
    public Deleted: boolean;
    public CalculateGrossPriceBasedOnNetPrice: boolean;
    public VatTypeID: number;
    public AverageCost: number;
    public AccountID: number;
    public CostPrice: number;
    public UpdatedBy: string;
    public DefaultProductCategoryID: number;
    public ID: number;
    public Unit: string;
    public Description: string;
    public VariansParentID: number;
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

    public ToNumber: number;
    public FromNumber: number;
    public MainAccountID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public NextNumber: number;
    public NumberLock: boolean;
    public IsDefaultForTask: boolean;
    public DisplayName: string;
    public StatusCode: number;
    public Name: string;
    public Deleted: boolean;
    public NumberSeriesTaskID: number;
    public Comment: string;
    public UpdatedBy: string;
    public Disabled: boolean;
    public AccountYear: number;
    public Empty: boolean;
    public UseNumbersFromNumberSeriesID: number;
    public ID: number;
    public NumberSeriesTypeID: number;
    public System: boolean;
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

    public CreatedAt: Date;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public StatusCode: number;
    public NumberSerieTypeAID: number;
    public Deleted: boolean;
    public NumberSerieTypeBID: number;
    public UpdatedBy: string;
    public ID: number;
    public _createguid: string;
    public NumberSerieTypeA: NumberSeriesType;
    public NumberSerieTypeB: NumberSeriesType;
    public CustomFields: any;
}


export class NumberSeriesTask extends UniEntity {
    public static RelativeUrl = 'number-series-tasks';
    public static EntityType = 'NumberSeriesTask';

    public CreatedAt: Date;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public StatusCode: number;
    public Name: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public EntityType: string;
    public ID: number;
    public _createguid: string;
    public NumberSeries: Array<NumberSeries>;
    public CustomFields: any;
}


export class NumberSeriesType extends UniEntity {
    public static RelativeUrl = 'number-series-types';
    public static EntityType = 'NumberSeriesType';

    public CanHaveSeveralActiveSeries: boolean;
    public CreatedAt: Date;
    public EntityField: string;
    public EntitySeriesIDField: string;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public StatusCode: number;
    public Name: string;
    public Deleted: boolean;
    public Yearly: boolean;
    public UpdatedBy: string;
    public EntityType: string;
    public ID: number;
    public System: boolean;
    public _createguid: string;
    public Series: Array<NumberSeries>;
    public CustomFields: any;
}


export class EncryptionInfo extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'EncryptionInfo';

    public CreatedAt: Date;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public type: Type;
    public Deleted: boolean;
    public UpdatedBy: string;
    public password: string;
    public ID: number;
    public description: string;
    public _createguid: string;
    public CustomFields: any;
}


export class File extends UniEntity {
    public static RelativeUrl = 'files/{entitytype}/{entityid}';
    public static EntityType = 'File';

    public ContentType: string;
    public StorageReference: string;
    public encryptionID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public OCRData: string;
    public StatusCode: number;
    public Name: string;
    public Size: string;
    public Deleted: boolean;
    public Pages: number;
    public UpdatedBy: string;
    public Md5: string;
    public ID: number;
    public Description: string;
    public PermaLink: string;
    public _createguid: string;
    public UploadSlot: string;
    public FileTags: Array<FileTag>;
    public EntityLinks: Array<FileEntityLink>;
    public CustomFields: any;
}


export class FileTag extends UniEntity {
    public static RelativeUrl = 'filetags';
    public static EntityType = 'FileTag';

    public Status: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public TagName: string;
    public ID: number;
    public FileID: number;
    public _createguid: string;
    public File: File;
    public CustomFields: any;
}


export class FileEntityLink extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'FileEntityLink';

    public CreatedAt: Date;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public IsAttachment: boolean;
    public StatusCode: number;
    public Deleted: boolean;
    public EntityID: number;
    public UpdatedBy: string;
    public EntityType: string;
    public ID: number;
    public FileID: number;
    public _createguid: string;
    public File: File;
    public CustomFields: any;
}


export class ElsaUsageLog extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ElsaUsageLog';

    public ProductType: string;
    public Quantity: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public ExternalReference: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public DateLogged: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class AccessPointFormat extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AccessPointFormat';

    public CreatedAt: Date;
    public IncommingID: number;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public OutgoingID: number;
    public StatusCode: number;
    public Name: string;
    public Deleted: boolean;
    public Label: string;
    public ResourceName: string;
    public UpdatedBy: string;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class EHFLog extends UniEntity {
    public static RelativeUrl = 'ehf';
    public static EntityType = 'EHFLog';

    public JobRunID: number;
    public CreatedAt: Date;
    public EntityDisplayValue: string;
    public DistributeAt: LocalDate;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public ExternalReference: string;
    public JobRunExternalRef: string;
    public Type: SharingType;
    public To: string;
    public StatusCode: number;
    public Deleted: boolean;
    public Subject: string;
    public EntityID: number;
    public From: string;
    public UpdatedBy: string;
    public EntityType: string;
    public ID: number;
    public ExternalMessage: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Department extends UniEntity {
    public static RelativeUrl = 'departments';
    public static EntityType = 'Department';

    public DepartmentManagerName: string;
    public DepartmentNumber: string;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public DepartmentNumberSeriesID: number;
    public StatusCode: number;
    public DepartmentNumberNumeric: number;
    public Name: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public Description: string;
    public _createguid: string;
    public DepartmentNumberSeries: NumberSeries;
    public CustomFields: any;
}


export class Dimension10 extends UniEntity {
    public static RelativeUrl = 'Dimension10';
    public static EntityType = 'Dimension10';

    public CreatedAt: Date;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public NumberNumeric: number;
    public StatusCode: number;
    public Name: string;
    public Deleted: boolean;
    public Number: string;
    public UpdatedBy: string;
    public ID: number;
    public Description: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Dimension5 extends UniEntity {
    public static RelativeUrl = 'Dimension5';
    public static EntityType = 'Dimension5';

    public CreatedAt: Date;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public NumberNumeric: number;
    public StatusCode: number;
    public Name: string;
    public Deleted: boolean;
    public Number: string;
    public UpdatedBy: string;
    public ID: number;
    public Description: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Dimension6 extends UniEntity {
    public static RelativeUrl = 'Dimension6';
    public static EntityType = 'Dimension6';

    public CreatedAt: Date;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public NumberNumeric: number;
    public StatusCode: number;
    public Name: string;
    public Deleted: boolean;
    public Number: string;
    public UpdatedBy: string;
    public ID: number;
    public Description: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Dimension7 extends UniEntity {
    public static RelativeUrl = 'Dimension7';
    public static EntityType = 'Dimension7';

    public CreatedAt: Date;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public NumberNumeric: number;
    public StatusCode: number;
    public Name: string;
    public Deleted: boolean;
    public Number: string;
    public UpdatedBy: string;
    public ID: number;
    public Description: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Dimension8 extends UniEntity {
    public static RelativeUrl = 'Dimension8';
    public static EntityType = 'Dimension8';

    public CreatedAt: Date;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public NumberNumeric: number;
    public StatusCode: number;
    public Name: string;
    public Deleted: boolean;
    public Number: string;
    public UpdatedBy: string;
    public ID: number;
    public Description: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Dimension9 extends UniEntity {
    public static RelativeUrl = 'Dimension9';
    public static EntityType = 'Dimension9';

    public CreatedAt: Date;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public NumberNumeric: number;
    public StatusCode: number;
    public Name: string;
    public Deleted: boolean;
    public Number: string;
    public UpdatedBy: string;
    public ID: number;
    public Description: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Dimensions extends UniEntity {
    public static RelativeUrl = 'dimensions';
    public static EntityType = 'Dimensions';

    public DepartmentID: number;
    public Dimension6ID: number;
    public ProjectTaskID: number;
    public Dimension10ID: number;
    public CreatedAt: Date;
    public Dimension9ID: number;
    public Dimension7ID: number;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public RegionID: number;
    public StatusCode: number;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ProjectID: number;
    public ResponsibleID: number;
    public Dimension8ID: number;
    public ID: number;
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
    public Dimension6Number: string;
    public DepartmentNumber: string;
    public DimensionsID: number;
    public RegionName: string;
    public Dimension6Name: string;
    public Dimension9Number: string;
    public Dimension7Name: string;
    public ProjectName: string;
    public Dimension10Number: string;
    public ResponsibleName: string;
    public Dimension7Number: string;
    public ProjectNumber: string;
    public Dimension8Name: string;
    public RegionCode: string;
    public Dimension5Name: string;
    public ProjectTaskName: string;
    public ProjectTaskNumber: string;
    public Dimension10Name: string;
    public Dimension5Number: string;
    public DepartmentName: string;
    public ID: number;
    public Dimension9Name: string;
    public Dimension8Number: string;
}


export class DimensionSettings extends UniEntity {
    public static RelativeUrl = 'dimensionsettings';
    public static EntityType = 'DimensionSettings';

    public CreatedAt: Date;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public StatusCode: number;
    public Deleted: boolean;
    public IsActive: boolean;
    public Label: string;
    public UpdatedBy: string;
    public Dimension: number;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class Region extends UniEntity {
    public static RelativeUrl = 'regions';
    public static EntityType = 'Region';

    public CreatedAt: Date;
    public CountryCode: string;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public RegionCode: string;
    public StatusCode: number;
    public Name: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public Description: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Responsible extends UniEntity {
    public static RelativeUrl = 'responsibles';
    public static EntityType = 'Responsible';

    public CreatedAt: Date;
    public NameOfResponsible: string;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public StatusCode: number;
    public Name: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public Description: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Contract extends UniEntity {
    public static RelativeUrl = 'contracts';
    public static EntityType = 'Contract';

    public CreatedAt: Date;
    public Hash: string;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public StatusCode: number;
    public Name: string;
    public Deleted: boolean;
    public HashTransactionAddress: string;
    public TeamsUri: string;
    public UpdatedBy: string;
    public Engine: ContractEngine;
    public ID: number;
    public Description: string;
    public ContractCode: string;
    public _createguid: string;
    public Parameters: Array<ContractParameter>;
    public Triggers: Array<ContractTrigger>;
    public RunLogs: Array<ContractRunLog>;
    public CustomFields: any;
}


export class ContractAddress extends UniEntity {
    public static RelativeUrl = 'contractaddresses';
    public static EntityType = 'ContractAddress';

    public ContractAssetID: number;
    public CreatedAt: Date;
    public Amount: number;
    public Address: string;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public Type: AddressType;
    public StatusCode: number;
    public ContractID: number;
    public Deleted: boolean;
    public EntityID: number;
    public UpdatedBy: string;
    public EntityType: string;
    public ID: number;
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
    public IsTransferrable: boolean;
    public IsCosignedByDefiner: boolean;
    public SpenderAttested: boolean;
    public CreatedAt: Date;
    public IsFixedDenominations: boolean;
    public Cap: number;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public Type: AddressType;
    public StatusCode: number;
    public IsAutoDestroy: boolean;
    public ContractID: number;
    public Deleted: boolean;
    public IsPrivate: boolean;
    public UpdatedBy: string;
    public ID: number;
    public _createguid: string;
    public Contract: Contract;
    public CustomFields: any;
}


export class ContractDebugLog extends UniEntity {
    public static RelativeUrl = 'contractdebuglogs';
    public static EntityType = 'ContractDebugLog';

    public CreatedAt: Date;
    public Message: string;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public Type: ContractEventType;
    public StatusCode: number;
    public ContractID: number;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ContractRunLogID: number;
    public ID: number;
    public _createguid: string;
    public Contract: Contract;
    public ContractRunLog: ContractRunLog;
    public CustomFields: any;
}


export class ContractParameter extends UniEntity {
    public static RelativeUrl = 'contractparameters';
    public static EntityType = 'ContractParameter';

    public Value: string;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public StatusCode: number;
    public Name: string;
    public ContractID: number;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public _createguid: string;
    public Contract: Contract;
    public CustomFields: any;
}


export class ContractRunLog extends UniEntity {
    public static RelativeUrl = 'contractrunlogs';
    public static EntityType = 'ContractRunLog';

    public CreatedAt: Date;
    public Message: string;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public Type: ContractEventType;
    public StatusCode: number;
    public ContractID: number;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ContractTriggerID: number;
    public ID: number;
    public RunTime: string;
    public _createguid: string;
    public Contract: Contract;
    public CustomFields: any;
}


export class ContractTransaction extends UniEntity {
    public static RelativeUrl = 'contracttransactions';
    public static EntityType = 'ContractTransaction';

    public CreatedAt: Date;
    public Amount: number;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public StatusCode: number;
    public ContractID: number;
    public Deleted: boolean;
    public SenderAddress: string;
    public ContractAddressID: number;
    public UpdatedBy: string;
    public ReceiverAddress: string;
    public ID: number;
    public AssetAddress: string;
    public _createguid: string;
    public Contract: Contract;
    public ContractAddress: ContractAddress;
    public CustomFields: any;
}


export class ContractTrigger extends UniEntity {
    public static RelativeUrl = 'contracttriggers';
    public static EntityType = 'ContractTrigger';

    public CreatedAt: Date;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public Type: ContractEventType;
    public StatusCode: number;
    public ModelFilter: string;
    public ExpressionFilter: string;
    public ContractID: number;
    public Deleted: boolean;
    public OperationFilter: string;
    public UpdatedBy: string;
    public ID: number;
    public _createguid: string;
    public Contract: Contract;
    public CustomFields: any;
}


export class Comment extends UniEntity {
    public static RelativeUrl = 'comments';
    public static EntityType = 'Comment';

    public Text: string;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public AuthorID: number;
    public StatusCode: number;
    public Deleted: boolean;
    public EntityID: number;
    public UpdatedBy: string;
    public EntityType: string;
    public ID: number;
    public _createguid: string;
    public Mentioned: Array<Mentioned>;
    public Author: User;
    public CustomFields: any;
}


export class Mentioned extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Mentioned';

    public CreatedAt: Date;
    public CommentID: number;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public StatusCode: number;
    public Deleted: boolean;
    public UserID: number;
    public UpdatedBy: string;
    public ID: number;
    public _createguid: string;
    public User: User;
    public CustomFields: any;
}


export class ApiKey extends UniEntity {
    public static RelativeUrl = 'apikeys';
    public static EntityType = 'ApiKey';

    public Url: string;
    public Encrypt: boolean;
    public IntegrationKey: string;
    public FilterDate: LocalDate;
    public CreatedAt: Date;
    public IntegrationType: TypeOfIntegration;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public ExternalId: string;
    public StatusCode: number;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public Description: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Altinn extends UniEntity {
    public static RelativeUrl = 'altinn';
    public static EntityType = 'Altinn';

    public CreatedAt: Date;
    public SystemID: string;
    public PreferredLogin: TypeOfLogin;
    public SystemPw: string;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public StatusCode: number;
    public Deleted: boolean;
    public UpdatedBy: string;
    public Language: string;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class AltinnReceipt extends UniEntity {
    public static RelativeUrl = 'altinnreceipts';
    public static EntityType = 'AltinnReceipt';

    public Form: string;
    public CreatedAt: Date;
    public XmlReceipt: string;
    public AltinnResponseData: string;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public HasBeenRegistered: boolean;
    public StatusCode: number;
    public TimeStamp: Date;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ErrorText: string;
    public ID: number;
    public UserSign: string;
    public ReceiptID: number;
    public _createguid: string;
    public Signings: Array<AltinnSigning>;
    public CustomFields: any;
}


export class AltinnSigning extends UniEntity {
    public static RelativeUrl = 'altinnsigning';
    public static EntityType = 'AltinnSigning';

    public SignatureReference: string;
    public CreatedAt: Date;
    public SignatureText: string;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public StatusCode: number;
    public Deleted: boolean;
    public DateSigned: Date;
    public AltinnReceiptID: number;
    public UpdatedBy: string;
    public ID: number;
    public StatusText: string;
    public _createguid: string;
    public AltinnReceipt: AltinnReceipt;
    public CustomFields: any;
}


export class Barnepass extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Barnepass';

    public CreatedAt: Date;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public inntektsaar: number;
    public StatusCode: number;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public _createguid: string;
    public oppgave: Array<BarnepassOppgave>;
    public CustomFields: any;
}


export class BarnepassOppgave extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'BarnepassOppgave';

    public email: string;
    public BarnepassID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public paaloeptBeloep: number;
    public navn: string;
    public StatusCode: number;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public foedselsnummer: string;
    public _createguid: string;
    public CustomFields: any;
}


export class UserRole extends UniEntity {
    public static RelativeUrl = 'userroles';
    public static EntityType = 'UserRole';

    public SharedRoleName: string;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public SharedRoleId: number;
    public Deleted: boolean;
    public UserID: number;
    public UpdatedBy: string;
    public ID: number;
    public _createguid: string;
    public User: User;
    public CustomFields: any;
}


export class Role extends UniEntity {
    public static RelativeUrl = 'roles';
    public static EntityType = 'Role';

    public CreatedAt: Date;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public Name: string;
    public Deleted: boolean;
    public Label: string;
    public UpdatedBy: string;
    public ID: number;
    public Description: string;
    public _createguid: string;
    public RolePermissions: Array<RolePermission>;
    public CustomFields: any;
}


export class RolePermission extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'RolePermission';

    public RoleID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public PermissionID: number;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public _createguid: string;
    public Role: Role;
    public Permission: Permission;
    public CustomFields: any;
}


export class Permission extends UniEntity {
    public static RelativeUrl = 'permissions';
    public static EntityType = 'Permission';

    public CreatedAt: Date;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public Name: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public _createguid: string;
    public RolePermissions: Array<RolePermission>;
    public CustomFields: any;
}


export class ApiMessage extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ApiMessage';

    public FromDate: Date;
    public CreatedAt: Date;
    public Service: string;
    public Message: string;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public Type: ApiMessageType;
    public StatusCode: number;
    public Deleted: boolean;
    public ToDate: Date;
    public UpdatedBy: string;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class AvtaleGiroAgreement extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AvtaleGiroAgreement';

    public Thumbprint: string;
    public CreatedAt: Date;
    public KeyPath: string;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public NextNumber: number;
    public DataSender: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public Description: string;
    public _createguid: string;
    public CustomFields: any;
}


export class AvtaleGiroBankAccount extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AvtaleGiroBankAccount';

    public AvtaleGiroAgreementID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public BankAccountNumber: string;
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

    public AvtaleGiroAgreementID: number;
    public CreatedAt: Date;
    public AvtaleGiroMergedFileID: number;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public CompanyID: number;
    public UpdatedBy: string;
    public AvtaleGiroContent: string;
    public ID: number;
    public FileID: number;
    public _createguid: string;
    public Company: Company;
    public CustomFields: any;
}


export class AvtaleGiroMergedFile extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AvtaleGiroMergedFile';

    public CreatedAt: Date;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public TransmissionNumber: number;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class BankAgreement extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'BankAgreement';

    public ReceiptDate: Date;
    public AccountOwnerName: string;
    public ServiceAccountID: number;
    public AccountOwnerOrgNumber: string;
    public CreatedAt: Date;
    public OrderName: string;
    public OrderEmail: string;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public ServiceID: string;
    public Deleted: boolean;
    public CustomerName: string;
    public OrderMobile: string;
    public CustomerOrgNumber: string;
    public CompanyID: number;
    public UpdatedBy: string;
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

    public CreatedAt: Date;
    public ServiceType: number;
    public FileType: string;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public ConfirmInNetbank: boolean;
    public KidRule: string;
    public Deleted: boolean;
    public DivisionName: string;
    public BankAgreementID: number;
    public UpdatedBy: string;
    public ID: number;
    public DivisionID: number;
    public _createguid: string;
    public BankAgreement: BankAgreement;
    public BankAccounts: Array<BankServiceBankAccount>;
    public CustomFields: any;
}


export class BankServiceBankAccount extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'BankServiceBankAccount';

    public CreatedAt: Date;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public BankServiceID: number;
    public ID: number;
    public AccountNumber: string;
    public _createguid: string;
    public BankService: BankService;
    public CustomFields: any;
}


export class Company extends UniEntity {
    public static RelativeUrl = 'companies';
    public static EntityType = 'Company';

    public IsTest: boolean;
    public WebHookSubscriberId: string;
    public CreatedAt: Date;
    public ConnectionString: string;
    public SchemaName: string;
    public IsGlobalTemplate: boolean;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public FileFlowEmail: string;
    public StatusCode: CompanyStatusCode;
    public Key: string;
    public Name: string;
    public OrganizationNumber: string;
    public Deleted: boolean;
    public MigrationVersion: string;
    public LastActivity: Date;
    public UpdatedBy: string;
    public ClientNumber: number;
    public ID: number;
    public IsTemplate: boolean;
    public FileFlowOrgnrEmail: string;
    public _createguid: string;
    public CustomFields: any;
}


export class CompanyAccess extends UniEntity {
    public static RelativeUrl = 'companies-access';
    public static EntityType = 'CompanyAccess';

    public CreatedAt: Date;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public StatusCode: number;
    public StartDate: Date;
    public Deleted: boolean;
    public CompanyID: number;
    public UpdatedBy: string;
    public Roles: string;
    public ID: number;
    public EndDate: Date;
    public GlobalIdentity: string;
    public _createguid: string;
    public CustomFields: any;
}


export class CompanyBackup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'CompanyBackup';

    public CopyFiles: boolean;
    public Environment: string;
    public CreatedAt: Date;
    public CompanyKey: string;
    public Message: string;
    public ScheduledForDeleteAt: Date;
    public SchemaName: string;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public CloudBlobName: string;
    public ContractType: number;
    public ContractID: number;
    public Deleted: boolean;
    public CustomerName: string;
    public ContainerName: string;
    public Reason: string;
    public OrgNumber: string;
    public BackupStatus: BackupStatus;
    public UpdatedBy: string;
    public CompanyName: string;
    public ID: number;
    public DeletedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class ContractCron extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ContractCron';

    public CreatedAt: Date;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public ContractID: number;
    public Deleted: boolean;
    public Expression: string;
    public CompanyID: number;
    public UpdatedBy: string;
    public ContractTriggerID: number;
    public ID: number;
    public _createguid: string;
    public CompanyKey: string;
    public CompanyDbName: string;
    public CustomFields: any;
}


export class ContractObyte extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ContractObyte';

    public CreatedAt: Date;
    public Address: string;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public ContractID: number;
    public Deleted: boolean;
    public CompanyID: number;
    public ContractAddressID: number;
    public UpdatedBy: string;
    public ID: number;
    public AssetAddress: string;
    public _createguid: string;
    public CompanyKey: string;
    public CompanyDbName: string;
    public CustomFields: any;
}


export class DeniedUserAccessLog extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'DeniedUserAccessLog';

    public Email: string;
    public CreatedAt: Date;
    public Username: string;
    public Message: string;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public Occurred: Date;
    public Deleted: boolean;
    public CompanyID: number;
    public UpdatedBy: string;
    public CompanyName: string;
    public ID: number;
    public _createguid: string;
    public Company: Company;
    public CustomFields: any;
}


export class FailedBankFile extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'FailedBankFile';

    public FileContent: string;
    public CreatedAt: Date;
    public CompanyKey: string;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public FileName: string;
    public FailedReason: FailedReasonEnum;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class HangfireJob extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'HangfireJob';

    public Year: number;
    public JobId: string;
    public Status: number;
    public CreatedAt: Date;
    public Completed: boolean;
    public CompanyKey: string;
    public UpdatedAt: Date;
    public HasError: boolean;
    public CompanyID: number;
    public ID: number;
    public GlobalIdentity: string;
    public CustomFields: any;
}


export class HangfireJobContext extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'HangfireJobContext';

    public Year: number;
    public JobId: string;
    public Status: number;
    public CreatedAt: Date;
    public Completed: boolean;
    public CompanyKey: string;
    public SchemaName: string;
    public UpdatedAt: Date;
    public HasError: boolean;
    public CompanyID: number;
    public ID: number;
    public GlobalIdentity: string;
    public CustomFields: any;
}


export class HangfireResponse extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'HangfireResponse';

    public Year: number;
    public JobId: string;
    public Status: number;
    public CreatedAt: Date;
    public Completed: boolean;
    public CompanyKey: string;
    public ProgressUrl: string;
    public UpdatedAt: Date;
    public HasError: boolean;
    public State: string;
    public CompanyID: number;
    public ID: number;
    public GlobalIdentity: string;
    public CustomFields: any;
}


export class KpiDefinition extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'KpiDefinition';

    public SourceType: KpiSourceType;
    public RoleNames: string;
    public CreatedAt: Date;
    public ValueType: KpiValueType;
    public Application: string;
    public Interval: string;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public Route: string;
    public Name: string;
    public Deleted: boolean;
    public RefreshModels: string;
    public CompanyID: number;
    public UpdatedBy: string;
    public IsPerUser: boolean;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class KpiValue extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'KpiValue';

    public KpiName: string;
    public Text: string;
    public LastUpdated: Date;
    public CreatedAt: Date;
    public ValueStatus: KpiValueStatus;
    public Total: number;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public UserIdentity: string;
    public CompanyID: number;
    public UpdatedBy: string;
    public KpiDefinitionID: number;
    public ID: number;
    public Counter: number;
    public _createguid: string;
    public CustomFields: any;
}


export class OutgoingInvoice extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'OutgoingInvoice';

    public Status: number;
    public CreatedAt: Date;
    public Amount: number;
    public InvoiceType: OutgoingInvoiceType;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public ExternalReference: string;
    public DueDate: Date;
    public StatusCode: number;
    public RecipientPhoneNumber: string;
    public RecipientOrganizationNumber: string;
    public ISPOrganizationNumber: string;
    public Deleted: boolean;
    public MetaJson: string;
    public CompanyID: number;
    public UpdatedBy: string;
    public InvoiceID: number;
    public ID: number;
    public _createguid: string;
    public Company: Company;
    public CustomFields: any;
}


export class ProcessFileLog extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ProcessFileLog';

    public CreatedAt: Date;
    public EntityInstanceID: string;
    public CompanyKey: string;
    public Message: string;
    public FileType: number;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public FileName: string;
    public StatusCode: number;
    public EntityName: string;
    public Deleted: boolean;
    public EntityCount: number;
    public UserIdentity: string;
    public CompanyID: number;
    public UpdatedBy: string;
    public CompanyName: string;
    public ID: number;
    public FileID: number;
    public _createguid: string;
    public Company: Company;
    public CustomFields: any;
}


export class ServiceAccount extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ServiceAccount';

    public Thumbprint: string;
    public CreatedAt: Date;
    public KeyPath: string;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public NextNumber: number;
    public DataSender: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public Description: string;
    public _createguid: string;
    public CustomFields: any;
}


export class UserVerification extends UniEntity {
    public static RelativeUrl = 'user-verifications';
    public static EntityType = 'UserVerification';

    public Email: string;
    public VerificationDate: Date;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public VerificationCode: string;
    public DisplayName: string;
    public StatusCode: number;
    public UserType: UserVerificationUserType;
    public Deleted: boolean;
    public UserId: number;
    public ExpirationDate: Date;
    public CompanyId: number;
    public UpdatedBy: string;
    public RequestOrigin: UserVerificationRequestOrigin;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class Account extends UniEntity {
    public static RelativeUrl = 'accounts';
    public static EntityType = 'Account';

    public SystemAccount: boolean;
    public CostAllocationID: number;
    public DimensionsID: number;
    public AccountSetupID: number;
    public Keywords: string;
    public CustomerID: number;
    public CreatedAt: Date;
    public TopLevelAccountGroupID: number;
    public Locked: boolean;
    public LockManualPosts: boolean;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public DoSynchronize: boolean;
    public Active: boolean;
    public StatusCode: number;
    public CurrencyCodeID: number;
    public AccountName: string;
    public EmployeeID: number;
    public Deleted: boolean;
    public UseVatDeductionGroupID: number;
    public VatTypeID: number;
    public AccountGroupID: number;
    public UsePostPost: boolean;
    public Visible: boolean;
    public AccountID: number;
    public UpdatedBy: string;
    public SupplierID: number;
    public ID: number;
    public Description: string;
    public SaftMappingAccountID: number;
    public AccountNumber: number;
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
    public UpdatedAt: Date;
    public CreatedBy: string;
    public StatusCode: number;
    public Name: string;
    public Deleted: boolean;
    public AccountID: number;
    public UpdatedBy: string;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class AccountGroup extends UniEntity {
    public static RelativeUrl = 'accountgroups';
    public static EntityType = 'AccountGroup';

    public MainGroupID: number;
    public CreatedAt: Date;
    public AccountGroupSetupID: number;
    public Summable: boolean;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public GroupNumber: string;
    public StatusCode: number;
    public Name: string;
    public Deleted: boolean;
    public AccountGroupSetID: number;
    public AccountID: number;
    public UpdatedBy: string;
    public ID: number;
    public CompatibleAccountID: number;
    public _createguid: string;
    public MainGroup: AccountGroup;
    public AccountGroupSet: AccountGroupSet;
    public CustomFields: any;
}


export class AccountGroupSet extends UniEntity {
    public static RelativeUrl = 'accountgroupsets';
    public static EntityType = 'AccountGroupSet';

    public Shared: boolean;
    public CreatedAt: Date;
    public ToAccountNumber: number;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public StatusCode: number;
    public Name: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public FromAccountNumber: number;
    public ID: number;
    public System: boolean;
    public SubAccountAllowed: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class AccountMandatoryDimension extends UniEntity {
    public static RelativeUrl = 'accountmandatorydimension';
    public static EntityType = 'AccountMandatoryDimension';

    public MandatoryType: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public StatusCode: number;
    public Deleted: boolean;
    public DimensionNo: number;
    public AccountID: number;
    public UpdatedBy: string;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class Accrual extends UniEntity {
    public static RelativeUrl = 'accruals';
    public static EntityType = 'Accrual';

    public CreatedAt: Date;
    public BalanceAccountID: number;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public StatusCode: number;
    public Deleted: boolean;
    public ResultAccountID: number;
    public JournalEntryLineDraftID: number;
    public UpdatedBy: string;
    public ID: number;
    public AccrualJournalEntryMode: number;
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

    public CreatedAt: Date;
    public Amount: number;
    public JournalEntryDraftLineID: number;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public StatusCode: number;
    public Deleted: boolean;
    public AccrualID: number;
    public UpdatedBy: string;
    public AccountYear: number;
    public PeriodNo: number;
    public ID: number;
    public _createguid: string;
    public Accrual: Accrual;
    public JournalEntryLineDraft: JournalEntryLineDraft;
    public CustomFields: any;
}


export class ApprovalData extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ApprovalData';

    public EntityHash: string;
    public EntityReference: string;
    public CreatedAt: Date;
    public VerificationMethod: string;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public EntityName: string;
    public Deleted: boolean;
    public VerificationReference: string;
    public EntityID: number;
    public EntityCount: number;
    public UpdatedBy: string;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class Asset extends UniEntity {
    public static RelativeUrl = 'assets';
    public static EntityType = 'Asset';

    public DimensionsID: number;
    public ScrapValue: number;
    public DepreciationStartDate: LocalDate;
    public CreatedAt: Date;
    public PurchaseAmount: number;
    public PurchaseDate: LocalDate;
    public BalanceAccountID: number;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public DepreciationCycle: number;
    public StatusCode: number;
    public Name: string;
    public AssetGroupCode: string;
    public AutoDepreciation: boolean;
    public Lifetime: number;
    public Deleted: boolean;
    public NetFinancialValue: number;
    public UpdatedBy: string;
    public ID: number;
    public DepreciationAccountID: number;
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

    public CreatedAt: Date;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public EmailID: number;
    public InitialBIC: string;
    public StatusCode: number;
    public Name: string;
    public Web: string;
    public Deleted: boolean;
    public AddressID: number;
    public BIC: string;
    public UpdatedBy: string;
    public ID: number;
    public PhoneID: number;
    public _createguid: string;
    public Address: Address;
    public Phone: Phone;
    public Email: Email;
    public CustomFields: any;
}


export class BankAccount extends UniEntity {
    public static RelativeUrl = 'bankaccounts';
    public static EntityType = 'BankAccount';

    public IntegrationStatus: number;
    public BusinessRelationID: number;
    public CreatedAt: Date;
    public Locked: boolean;
    public BankID: number;
    public IBAN: string;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public BankAccountType: string;
    public StatusCode: number;
    public Deleted: boolean;
    public IntegrationSettings: string;
    public Label: string;
    public CompanySettingsID: number;
    public AccountID: number;
    public UpdatedBy: string;
    public ID: number;
    public AccountNumber: string;
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

    public DefaultAgreement: boolean;
    public IsOutgoing: boolean;
    public HasOrderedIntegrationChange: boolean;
    public Email: string;
    public HasNewAccountInformation: boolean;
    public CreatedAt: Date;
    public BankAcceptance: boolean;
    public IsBankBalance: boolean;
    public ServiceTemplateID: string;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public ServiceID: string;
    public StatusCode: number;
    public Name: string;
    public Deleted: boolean;
    public PropertiesJson: string;
    public IsInbound: boolean;
    public UpdatedBy: string;
    public ServiceProvider: number;
    public ID: number;
    public BankAccountID: number;
    public _createguid: string;
    public Password: string;
    public BankAccount: BankAccount;
    public CustomFields: any;
}


export class BankRule extends UniEntity {
    public static RelativeUrl = 'bankrules';
    public static EntityType = 'BankRule';

    public Rule: string;
    public CreatedAt: Date;
    public Priority: number;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public StatusCode: number;
    public Name: string;
    public Deleted: boolean;
    public IsActive: boolean;
    public AccountID: number;
    public UpdatedBy: string;
    public ActionCode: ActionCodeBankRule;
    public ID: number;
    public _createguid: string;
    public Account: Account;
    public CustomFields: any;
}


export class BankStatement extends UniEntity {
    public static RelativeUrl = 'bankstatements';
    public static EntityType = 'BankStatement';

    public FromDate: LocalDate;
    public CreatedAt: Date;
    public Amount: number;
    public AmountCurrency: number;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public StartBalance: number;
    public StatusCode: number;
    public Deleted: boolean;
    public ToDate: LocalDate;
    public EndBalance: number;
    public AccountID: number;
    public UpdatedBy: string;
    public CurrencyCode: string;
    public ID: number;
    public ArchiveReference: string;
    public FileID: number;
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

    public BookingDate: LocalDate;
    public CreatedAt: Date;
    public TransactionId: string;
    public OpenAmountCurrency: number;
    public Amount: number;
    public AmountCurrency: number;
    public ValueDate: LocalDate;
    public StructuredReference: string;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public SenderName: string;
    public StatusCode: number;
    public SenderAccount: string;
    public ReceiverAccount: string;
    public BankStatementID: number;
    public Deleted: boolean;
    public Receivername: string;
    public Category: string;
    public UpdatedBy: string;
    public CID: string;
    public InvoiceNumber: string;
    public CurrencyCode: string;
    public ID: number;
    public Description: string;
    public ArchiveReference: string;
    public OpenAmount: number;
    public _createguid: string;
    public BankStatement: BankStatement;
    public CustomFields: any;
}


export class BankStatementMatch extends UniEntity {
    public static RelativeUrl = 'bankstatementmatch';
    public static EntityType = 'BankStatementMatch';

    public CreatedAt: Date;
    public Amount: number;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public JournalEntryLineID: number;
    public StatusCode: number;
    public Batch: string;
    public Deleted: boolean;
    public BankStatementEntryID: number;
    public Group: string;
    public UpdatedBy: string;
    public ID: number;
    public _createguid: string;
    public BankStatementEntry: BankStatementEntry;
    public JournalEntryLine: JournalEntryLine;
    public CustomFields: any;
}


export class BankStatementRule extends UniEntity {
    public static RelativeUrl = 'bankstatementrules';
    public static EntityType = 'BankStatementRule';

    public Rule: string;
    public DimensionsID: number;
    public CreatedAt: Date;
    public Priority: number;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public EntryText: string;
    public StatusCode: number;
    public Name: string;
    public Deleted: boolean;
    public IsActive: boolean;
    public AccountID: number;
    public UpdatedBy: string;
    public ID: number;
    public _createguid: string;
    public Dimensions: Dimensions;
    public Account: Account;
    public CustomFields: any;
}


export class Budget extends UniEntity {
    public static RelativeUrl = 'budgets';
    public static EntityType = 'Budget';

    public CreatedAt: Date;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public StatusCode: number;
    public Name: string;
    public Deleted: boolean;
    public AccountingYear: number;
    public UpdatedBy: string;
    public ID: number;
    public _createguid: string;
    public Entries: Array<BudgetEntry>;
    public CustomFields: any;
}


export class BudgetEntry extends UniEntity {
    public static RelativeUrl = 'budgetentries';
    public static EntityType = 'BudgetEntry';

    public DimensionsID: number;
    public BudgetID: number;
    public CreatedAt: Date;
    public Amount: number;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public StatusCode: number;
    public Deleted: boolean;
    public AccountID: number;
    public PeriodNumber: number;
    public UpdatedBy: string;
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

    public AssetSaleProductID: number;
    public AssetSaleLossBalancingAccountID: number;
    public CreatedAt: Date;
    public AssetSaleLossNoVatAccountID: number;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public ReInvoicingTurnoverProductID: number;
    public ReInvoicingMethod: number;
    public StatusCode: number;
    public ReInvoicingCostsharingProductID: number;
    public AssetSaleProfitVatAccountID: number;
    public Deleted: boolean;
    public AssetSaleProfitNoVatAccountID: number;
    public AssetSaleLossVatAccountID: number;
    public UpdatedBy: string;
    public ID: number;
    public AssetSaleProfitBalancingAccountID: number;
    public AssetWriteoffAccountID: number;
    public _createguid: string;
    public ReInvoicingCostsharingProduct: Product;
    public ReInvoicingTurnoverProduct: Product;
    public CustomFields: any;
}


export class CompanyBankAccount extends UniEntity {
    public static RelativeUrl = 'companybankaccounts';
    public static EntityType = 'CompanyBankAccount';

    public IsOutgoing: boolean;
    public IsSalary: boolean;
    public CreatedAt: Date;
    public IsIncomming: boolean;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public StatusCode: number;
    public Name: string;
    public IsTax: boolean;
    public Deleted: boolean;
    public CreditAmount: number;
    public AccountID: number;
    public UpdatedBy: string;
    public ID: number;
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
    public UpdatedAt: Date;
    public CreatedBy: string;
    public StatusCode: number;
    public Name: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public _createguid: string;
    public Items: Array<CostAllocationItem>;
    public CustomFields: any;
}


export class CostAllocationItem extends UniEntity {
    public static RelativeUrl = 'costallocationitems';
    public static EntityType = 'CostAllocationItem';

    public CostAllocationID: number;
    public DimensionsID: number;
    public Percent: number;
    public CreatedAt: Date;
    public Amount: number;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public StatusCode: number;
    public Deleted: boolean;
    public VatTypeID: number;
    public AccountID: number;
    public UpdatedBy: string;
    public ID: number;
    public Description: string;
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
    public IsCustomerPayment: boolean;
    public CreatedAt: Date;
    public Amount: number;
    public AmountCurrency: number;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public DueDate: LocalDate;
    public StatusCode: number;
    public CurrencyCodeID: number;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public Description: string;
    public EndDate: LocalDate;
    public _createguid: string;
    public currency: CurrencyCode;
    public CustomFields: any;
}


export class DepreciationLine extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'DepreciationLine';

    public AssetJELineID: number;
    public CreatedAt: Date;
    public DepreciationType: number;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public StatusCode: number;
    public DepreciationJELineID: number;
    public Deleted: boolean;
    public AssetID: number;
    public UpdatedBy: string;
    public ID: number;
    public _createguid: string;
    public DepreciationJELine: JournalEntryLine;
    public AssetJELine: JournalEntryLine;
    public CustomFields: any;
}


export class FinancialYear extends UniEntity {
    public static RelativeUrl = 'financialyears';
    public static EntityType = 'FinancialYear';

    public Year: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public StatusCode: number;
    public Deleted: boolean;
    public ValidFrom: LocalDate;
    public ValidTo: LocalDate;
    public UpdatedBy: string;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class JournalEntry extends UniEntity {
    public static RelativeUrl = 'journalentries';
    public static EntityType = 'JournalEntry';

    public NumberSeriesID: number;
    public JournalEntryNumber: string;
    public JournalEntryAccrualID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public StatusCode: number;
    public Deleted: boolean;
    public NumberSeriesTaskID: number;
    public FinancialYearID: number;
    public UpdatedBy: string;
    public JournalEntryDraftGroup: string;
    public JournalEntryNumberNumeric: number;
    public ID: number;
    public Description: string;
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

    public DimensionsID: number;
    public ReferenceCreditPostID: number;
    public PaymentID: string;
    public PaymentInfoTypeID: number;
    public ReferenceOriginalPostID: number;
    public PaymentReferenceID: number;
    public BatchNumber: number;
    public VatPeriodID: number;
    public JournalEntryNumber: string;
    public CreatedAt: Date;
    public VatDate: LocalDate;
    public Amount: number;
    public AmountCurrency: number;
    public TaxBasisAmountCurrency: number;
    public RegisteredDate: LocalDate;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public OriginalReferencePostID: number;
    public SubAccountID: number;
    public DueDate: LocalDate;
    public VatJournalEntryPostID: number;
    public SupplierInvoiceID: number;
    public StatusCode: number;
    public PeriodID: number;
    public VatPercent: number;
    public JournalEntryID: number;
    public Signature: string;
    public JournalEntryTypeID: number;
    public CurrencyCodeID: number;
    public RestAmountCurrency: number;
    public PostPostJournalEntryLineID: number;
    public TaxBasisAmount: number;
    public RestAmount: number;
    public Deleted: boolean;
    public VatReportID: number;
    public VatTypeID: number;
    public OriginalJournalEntryPost: number;
    public AccrualID: number;
    public CustomerInvoiceID: number;
    public JournalEntryLineDraftID: number;
    public AccountID: number;
    public UpdatedBy: string;
    public VatDeductionPercent: number;
    public CurrencyExchangeRate: number;
    public JournalEntryNumberNumeric: number;
    public InvoiceNumber: string;
    public ID: number;
    public Description: string;
    public CustomerOrderID: number;
    public FinancialDate: LocalDate;
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

    public DimensionsID: number;
    public PaymentID: string;
    public PaymentInfoTypeID: number;
    public PaymentReferenceID: number;
    public BatchNumber: number;
    public VatPeriodID: number;
    public JournalEntryNumber: string;
    public CreatedAt: Date;
    public VatDate: LocalDate;
    public Amount: number;
    public AmountCurrency: number;
    public TaxBasisAmountCurrency: number;
    public RegisteredDate: LocalDate;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public SubAccountID: number;
    public DueDate: LocalDate;
    public SupplierInvoiceID: number;
    public StatusCode: number;
    public PeriodID: number;
    public VatPercent: number;
    public JournalEntryID: number;
    public Signature: string;
    public JournalEntryTypeID: number;
    public CurrencyCodeID: number;
    public PostPostJournalEntryLineID: number;
    public TaxBasisAmount: number;
    public Deleted: boolean;
    public VatTypeID: number;
    public AccrualID: number;
    public CustomerInvoiceID: number;
    public AccountID: number;
    public UpdatedBy: string;
    public VatDeductionPercent: number;
    public CurrencyExchangeRate: number;
    public JournalEntryNumberNumeric: number;
    public InvoiceNumber: string;
    public ID: number;
    public Description: string;
    public CustomerOrderID: number;
    public FinancialDate: LocalDate;
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

    public ColumnSetUp: string;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public StatusCode: number;
    public TraceLinkTypes: string;
    public Name: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public VisibleModules: string;
    public _createguid: string;
    public CustomFields: any;
}


export class JournalEntrySourceSerie extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'JournalEntrySourceSerie';

    public CreatedAt: Date;
    public JournalEntrySourceID: number;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public StatusCode: number;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public JournalEntrySourceEntityName: string;
    public _createguid: string;
    public JournalEntrySourceInstanceID: number;
    public CustomFields: any;
}


export class JournalEntryType extends UniEntity {
    public static RelativeUrl = 'journalentrytypes';
    public static EntityType = 'JournalEntryType';

    public CreatedAt: Date;
    public MainName: string;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public DisplayName: string;
    public Name: string;
    public Deleted: boolean;
    public Number: number;
    public UpdatedBy: string;
    public ExpectNegativeAmount: boolean;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class LedgerSuggestion extends UniEntity {
    public Source: SuggestionSource;
    public BusinessType: string;
    public IndustryName: string;
    public IndustryCode: string;
    public Name: string;
    public OrgNumber: string;
    public ID: number;
}


export class Payment extends UniEntity {
    public static RelativeUrl = 'payments';
    public static EntityType = 'Payment';

    public PaymentID: string;
    public IsCustomerPayment: boolean;
    public BusinessRelationID: number;
    public CreatedAt: Date;
    public PaymentCodeID: number;
    public AutoJournal: boolean;
    public BankChargeAmount: number;
    public Amount: number;
    public AmountCurrency: number;
    public ReconcilePayment: boolean;
    public Proprietary: string;
    public Debtor: string;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public PaymentDate: LocalDate;
    public InPaymentID: string;
    public DueDate: LocalDate;
    public SerialNumberOrAcctSvcrRef: string;
    public SupplierInvoiceID: number;
    public StatusCode: number;
    public JournalEntryID: number;
    public CurrencyCodeID: number;
    public IsPaymentCancellationRequest: boolean;
    public XmlTagPmtInfIdReference: string;
    public Deleted: boolean;
    public Domain: string;
    public IsPaymentClaim: boolean;
    public OcrPaymentStrings: string;
    public IsExternal: boolean;
    public PaymentStatusReportFileID: number;
    public CustomerInvoiceID: number;
    public ExternalBankAccountNumber: string;
    public UpdatedBy: string;
    public CurrencyExchangeRate: number;
    public FromBankAccountID: number;
    public XmlTagEndToEndIdReference: string;
    public InvoiceNumber: string;
    public PaymentNotificationReportFileID: number;
    public PaymentBatchID: number;
    public ID: number;
    public ToBankAccountID: number;
    public Description: string;
    public CustomerInvoiceReminderID: number;
    public StatusText: string;
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

    public PaymentFileID: number;
    public ReceiptDate: Date;
    public PaymentReferenceID: string;
    public IsCustomerPayment: boolean;
    public CreatedAt: Date;
    public NumberOfPayments: number;
    public TransferredDate: Date;
    public OcrHeadingStrings: string;
    public PaymentBatchTypeID: number;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public StatusCode: number;
    public TotalAmount: number;
    public Deleted: boolean;
    public PaymentStatusReportFileID: number;
    public OcrTransmissionNumber: number;
    public UpdatedBy: string;
    public HashValue: string;
    public ID: number;
    public Camt054CMsgId: string;
    public _createguid: string;
    public Payments: Array<Payment>;
    public PaymentBatchType: PaymentBatchType;
    public CustomFields: any;
}


export class PostPost extends UniEntity {
    public static RelativeUrl = 'postposts';
    public static EntityType = 'PostPost';

    public CreatedAt: Date;
    public Amount: number;
    public AmountCurrency: number;
    public JournalEntryLine1ID: number;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public StatusCode: number;
    public CurrencyCodeID: number;
    public Date: LocalDate;
    public Deleted: boolean;
    public JournalEntryLine2ID: number;
    public UpdatedBy: string;
    public CurrencyExchangeRate: number;
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

    public ProductID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public OwnCostAmount: number;
    public SupplierInvoiceID: number;
    public TaxInclusiveAmount: number;
    public StatusCode: number;
    public TaxExclusiveAmount: number;
    public OwnCostShare: number;
    public Deleted: boolean;
    public ReInvoicingType: number;
    public UpdatedBy: string;
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

    public GrossAmount: number;
    public Surcharge: number;
    public CustomerID: number;
    public CreatedAt: Date;
    public NetAmount: number;
    public Vat: number;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public StatusCode: number;
    public Deleted: boolean;
    public ReInvoiceID: number;
    public UpdatedBy: string;
    public ID: number;
    public Share: number;
    public _createguid: string;
    public Customer: Customer;
    public CustomFields: any;
}


export class SupplierInvoice extends UniEntity {
    public static RelativeUrl = 'supplierinvoices';
    public static EntityType = 'SupplierInvoice';

    public InvoicePostalCode: string;
    public PaymentID: string;
    public InvoiceReferenceID: number;
    public SalesPerson: string;
    public TaxExclusiveAmountCurrency: number;
    public PaymentStatus: number;
    public ShippingAddressLine3: string;
    public DefaultDimensionsID: number;
    public VatTotalsAmount: number;
    public PaymentTerm: string;
    public CreatedAt: Date;
    public InternalNote: string;
    public InvoiceOriginType: SupplierInvoiceOriginType;
    public OurReference: string;
    public YourReference: string;
    public PaymentInformation: string;
    public InvoiceType: number;
    public DeliveryName: string;
    public CustomerPerson: string;
    public ShippingAddressLine2: string;
    public DeliveryDate: LocalDate;
    public PayableRoundingAmount: number;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public SupplierOrgNumber: string;
    public Requisition: string;
    public ShippingAddressLine1: string;
    public TaxInclusiveAmount: number;
    public StatusCode: number;
    public ShippingPostalCode: string;
    public JournalEntryID: number;
    public PaymentDueDate: LocalDate;
    public TaxExclusiveAmount: number;
    public CurrencyCodeID: number;
    public VatTotalsAmountCurrency: number;
    public InvoiceCountryCode: string;
    public InvoiceAddressLine2: string;
    public RestAmountCurrency: number;
    public PrintStatus: number;
    public ShippingCountry: string;
    public DeliveryTerm: string;
    public CreditedAmountCurrency: number;
    public RestAmount: number;
    public Deleted: boolean;
    public Comment: string;
    public CreditedAmount: number;
    public ShippingCountryCode: string;
    public InvoiceDate: LocalDate;
    public ReInvoiceID: number;
    public ReInvoiced: boolean;
    public Credited: boolean;
    public TaxInclusiveAmountCurrency: number;
    public CustomerOrgNumber: string;
    public Payment: string;
    public DeliveryMethod: string;
    public UpdatedBy: string;
    public InvoiceAddressLine3: string;
    public CurrencyExchangeRate: number;
    public PayableRoundingCurrencyAmount: number;
    public ProjectID: number;
    public SupplierID: number;
    public PaymentTermsID: number;
    public InvoiceNumber: string;
    public ShippingCity: string;
    public ID: number;
    public InvoiceAddressLine1: string;
    public DeliveryTermsID: number;
    public InvoiceCity: string;
    public IsSentToPayment: boolean;
    public CreditDays: number;
    public InvoiceReceiverName: string;
    public FreeTxt: string;
    public BankAccountID: number;
    public InvoiceCountry: string;
    public AmountRegards: string;
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

    public SumTotalExVatCurrency: number;
    public DimensionsID: number;
    public ProductID: number;
    public ItemText: string;
    public Discount: number;
    public SumVat: number;
    public SumVatCurrency: number;
    public SortIndex: number;
    public CreatedAt: Date;
    public PriceExVat: number;
    public PriceExVatCurrency: number;
    public SumTotalExVat: number;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public DiscountPercent: number;
    public SumTotalIncVatCurrency: number;
    public PriceIncVat: number;
    public SupplierInvoiceID: number;
    public StatusCode: number;
    public VatPercent: number;
    public CurrencyCodeID: number;
    public AccountingCost: string;
    public DiscountCurrency: number;
    public InvoicePeriodEndDate: LocalDate;
    public Deleted: boolean;
    public CalculateGrossPriceBasedOnNetPrice: boolean;
    public VatTypeID: number;
    public Comment: string;
    public NumberOfItems: number;
    public InvoicePeriodStartDate: LocalDate;
    public SumTotalIncVat: number;
    public UpdatedBy: string;
    public CurrencyExchangeRate: number;
    public ID: number;
    public Unit: string;
    public PriceSetByUser: boolean;
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

    public No: string;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public StatusCode: number;
    public Name: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class VatDeduction extends UniEntity {
    public static RelativeUrl = 'vatdeductions';
    public static EntityType = 'VatDeduction';

    public DeductionPercent: number;
    public CreatedAt: Date;
    public VatDeductionGroupID: number;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public StatusCode: number;
    public Deleted: boolean;
    public ValidFrom: LocalDate;
    public ValidTo: LocalDate;
    public UpdatedBy: string;
    public ID: number;
    public _createguid: string;
    public VatDeductionGroup: VatDeductionGroup;
    public CustomFields: any;
}


export class VatDeductionGroup extends UniEntity {
    public static RelativeUrl = 'vatdeductiongroups';
    public static EntityType = 'VatDeductionGroup';

    public CreatedAt: Date;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public StatusCode: number;
    public Name: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class VatPost extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'VatPost';

    public No: string;
    public HasTaxAmount: boolean;
    public CreatedAt: Date;
    public ReportAsNegativeAmount: boolean;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public VatCodeGroupID: number;
    public StatusCode: number;
    public Name: string;
    public HasTaxBasis: boolean;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public _createguid: string;
    public VatCodeGroup: VatCodeGroup;
    public VatReportReferences: Array<VatReportReference>;
    public CustomFields: any;
}


export class VatReport extends UniEntity {
    public static RelativeUrl = 'vatreports';
    public static EntityType = 'VatReport';

    public ExternalRefNo: string;
    public TerminPeriodID: number;
    public CreatedAt: Date;
    public ReportedDate: Date;
    public ExecutedDate: Date;
    public VatReportTypeID: number;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public InternalComment: string;
    public StatusCode: number;
    public JournalEntryID: number;
    public Title: string;
    public Deleted: boolean;
    public Comment: string;
    public VatReportArchivedSummaryID: number;
    public UpdatedBy: string;
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

    public PaymentID: string;
    public AmountToBeReceived: number;
    public CreatedAt: Date;
    public SummaryHeader: string;
    public PaymentToDescription: string;
    public PaymentYear: number;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public StatusCode: number;
    public PaymentBankAccountNumber: string;
    public PaymentDueDate: Date;
    public Deleted: boolean;
    public AmountToBePayed: number;
    public PaymentPeriod: string;
    public ReportName: string;
    public UpdatedBy: string;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class VatReportReference extends UniEntity {
    public static RelativeUrl = 'vatreportreferences';
    public static EntityType = 'VatReportReference';

    public CreatedAt: Date;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public StatusCode: number;
    public Deleted: boolean;
    public VatTypeID: number;
    public VatPostID: number;
    public AccountID: number;
    public UpdatedBy: string;
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

    public CreatedAt: Date;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public StatusCode: number;
    public Name: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class VatType extends UniEntity {
    public static RelativeUrl = 'vattypes';
    public static EntityType = 'VatType';

    public AvailableInModules: boolean;
    public OutgoingAccountID: number;
    public CreatedAt: Date;
    public VatTypeSetupID: number;
    public Locked: boolean;
    public InUse: boolean;
    public OutputVat: boolean;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public IncomingAccountID: number;
    public ReversedTaxDutyVat: boolean;
    public VatCodeGroupID: number;
    public StatusCode: number;
    public Name: string;
    public Deleted: boolean;
    public DirectJournalEntryOnly: boolean;
    public Visible: boolean;
    public UpdatedBy: string;
    public VatCodeGroupingValue: VatCodeGroupingValueEnum;
    public ID: number;
    public Alias: string;
    public VatCode: string;
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

    public CreatedAt: Date;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public StatusCode: number;
    public VatPercent: number;
    public Deleted: boolean;
    public VatTypeID: number;
    public ValidFrom: LocalDate;
    public ValidTo: LocalDate;
    public UpdatedBy: string;
    public ID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class EntityValidationRule extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'EntityValidationRule';

    public Value: string;
    public CreatedAt: Date;
    public OnConflict: OnConflict;
    public PropertyName: string;
    public Message: string;
    public SyncKey: string;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public Operation: OperationType;
    public Operator: Operator;
    public Level: ValidationLevel;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ChangedByCompany: boolean;
    public EntityType: string;
    public ID: number;
    public System: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class EntityValidationRuleTemplate extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'EntityValidationRuleTemplate';

    public Value: string;
    public CreatedAt: Date;
    public OnConflict: OnConflict;
    public PropertyName: string;
    public Message: string;
    public SyncKey: string;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public Operation: OperationType;
    public Operator: Operator;
    public Level: ValidationLevel;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ChangedByCompany: boolean;
    public EntityType: string;
    public ID: number;
    public System: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class ComplexValidationRule extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ComplexValidationRule';

    public ValidationCode: number;
    public CreatedAt: Date;
    public OnConflict: OnConflict;
    public Message: string;
    public SyncKey: string;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public Operation: OperationType;
    public Level: ValidationLevel;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ChangedByCompany: boolean;
    public EntityType: string;
    public ID: number;
    public System: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class ComplexValidationRuleTemplate extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ComplexValidationRuleTemplate';

    public ValidationCode: number;
    public CreatedAt: Date;
    public OnConflict: OnConflict;
    public Message: string;
    public SyncKey: string;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public Operation: OperationType;
    public Level: ValidationLevel;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ChangedByCompany: boolean;
    public EntityType: string;
    public ID: number;
    public System: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class CustomField extends UniEntity {
    public static RelativeUrl = 'custom-fields';
    public static EntityType = 'CustomField';

    public DataType: string;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public StatusCode: number;
    public Nullable: boolean;
    public Name: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public ModelID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class ValueList extends UniEntity {
    public static RelativeUrl = 'valuelists';
    public static EntityType = 'ValueList';

    public CreatedAt: Date;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public Code: string;
    public Name: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public Description: string;
    public _createguid: string;
    public Items: Array<ValueItem>;
    public CustomFields: any;
}


export class ValueItem extends UniEntity {
    public static RelativeUrl = 'valueitems';
    public static EntityType = 'ValueItem';

    public Value: string;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public Code: string;
    public Name: string;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public Description: string;
    public ValueListID: number;
    public Index: number;
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

    public Url: string;
    public Combo: number;
    public Alignment: Alignment;
    public ReadOnly: boolean;
    public LineBreak: boolean;
    public CreatedAt: Date;
    public Hidden: boolean;
    public Width: string;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public Section: number;
    public ValueList: string;
    public FieldType: FieldType;
    public HelpText: string;
    public Property: string;
    public FieldSet: number;
    public StatusCode: number;
    public Legend: string;
    public Sectionheader: string;
    public Deleted: boolean;
    public Label: string;
    public Options: string;
    public Placement: number;
    public LookupField: boolean;
    public UpdatedBy: string;
    public Placeholder: string;
    public ComponentLayoutID: number;
    public EntityType: string;
    public ID: number;
    public Description: string;
    public DisplayField: string;
    public LookupEntityType: string;
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
    public Invoicable: number;
    public WeekNumber: number;
    public TimeOff: number;
    public WeekDay: number;
    public ValidTimeOff: number;
    public Flextime: number;
    public Projecttime: number;
    public Status: WorkStatus;
    public Workflow: TimesheetWorkflow;
    public TotalTime: number;
    public SickTime: number;
    public Date: Date;
    public ValidTime: number;
    public ExpectedTime: number;
    public StartTime: Date;
    public IsWeekend: boolean;
    public EndTime: Date;
    public Overtime: number;
}


export class WorkBalanceDto extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'WorkBalanceDto';

    public BalanceFrom: Date;
    public ValidTimeOff: number;
    public Days: number;
    public CreatedAt: Date;
    public ActualMinutes: number;
    public WorkRelationID: number;
    public ExpectedMinutes: number;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public StatusCode: number;
    public IsStartBalance: boolean;
    public LastDayExpected: number;
    public Deleted: boolean;
    public BalanceDate: Date;
    public ValidFrom: Date;
    public Minutes: number;
    public LastDayActual: number;
    public Balancetype: WorkBalanceTypeEnum;
    public SumOvertime: number;
    public UpdatedBy: string;
    public ID: number;
    public Description: string;
    public _createguid: string;
    public Previous: BalanceInfo;
    public Details: Array<FlexDetail>;
    public WorkRelation: WorkRelation;
    public CustomFields: any;
}


export class BalanceInfo extends UniEntity {
    public BalanceDate: Date;
    public Minutes: number;
    public ID: number;
    public Description: string;
}


export class FlexDetail extends UniEntity {
    public ValidTimeOff: number;
    public ExpectedMinutes: number;
    public Date: Date;
    public IsWeekend: boolean;
    public WorkedMinutes: number;
}


export class ContactSearchServiceResponse extends UniEntity {
    public ErrorMessage: string;
    public ErrorCode: number;
    public Method: string;
    public ObjectName: string;
    public Success: boolean;
}


export class InvoicesAndRemindersReadyToRemind extends UniEntity {
    public CustomerNumber: number;
    public EmailAddress: string;
    public CustomerID: number;
    public CurrencyCodeCode: string;
    public ReminderNumber: number;
    public Interest: number;
    public ExternalReference: string;
    public DueDate: Date;
    public TaxInclusiveAmount: number;
    public StatusCode: number;
    public CurrencyCodeID: number;
    public RestAmountCurrency: number;
    public RestAmount: number;
    public CustomerName: string;
    public Fee: number;
    public InvoiceDate: Date;
    public TaxInclusiveAmountCurrency: number;
    public CustomerInvoiceID: number;
    public CurrencyExchangeRate: number;
    public InvoiceNumber: number;
    public CustomerInvoiceReminderID: number;
    public CurrencyCodeShortCode: string;
    public DontSendReminders: boolean;
}


export class TradeHeaderCalculationSummary extends UniEntity {
    public SumVatBasisCurrency: number;
    public SumTotalExVatCurrency: number;
    public DecimalRounding: number;
    public SumVat: number;
    public SumVatCurrency: number;
    public SumDiscount: number;
    public SumTotalExVat: number;
    public DecimalRoundingCurrency: number;
    public SumTotalIncVatCurrency: number;
    public SumNoVatBasis: number;
    public SumTotalIncVat: number;
    public SumNoVatBasisCurrency: number;
    public SumVatBasis: number;
    public SumDiscountCurrency: number;
}


export class VatCalculationSummary extends UniEntity {
    public SumVatBasisCurrency: number;
    public SumVat: number;
    public SumVatCurrency: number;
    public VatPercent: number;
    public SumVatBasis: number;
}


export class InvoicePaymentData extends UniEntity {
    public DimensionsID: number;
    public PaymentID: string;
    public AgioAccountID: number;
    public BankChargeAccountID: number;
    public BankChargeAmount: number;
    public Amount: number;
    public AmountCurrency: number;
    public PaymentDate: LocalDate;
    public CurrencyCodeID: number;
    public AgioAmount: number;
    public AccountID: number;
    public CurrencyExchangeRate: number;
    public FromBankAccountID: number;
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
    public JournalEntryNumber: string;
    public Amount: number;
    public AmountCurrency: number;
    public JournalEntryLineID: number;
    public JournalEntryID: number;
    public Description: string;
    public FinancialDate: LocalDate;
}


export class OrderOffer extends UniEntity {
    public Status: string;
    public Message: string;
    public CostPercentage: number;
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
    public KIDGarnishment: string;
    public TaxDraw: number;
    public MessageID: string;
    public period: number;
    public EmploymentTax: number;
    public DueDate: Date;
    public FinancialTax: number;
    public KIDTaxDraw: string;
    public KIDEmploymentTax: string;
    public GarnishmentTax: number;
    public KIDFinancialTax: string;
    public AccountNumber: string;
}


export class PayrollRunInAmeldingPeriod extends UniEntity {
    public CanGenerateAddition: boolean;
    public PayrollrunPaydate: Date;
    public PayrollrunID: number;
    public PayrollrunDescription: string;
    public AmeldingSentdate: Date;
}


export class PayAgaTaxDTO extends UniEntity {
    public payAga: boolean;
    public payTaxDraw: boolean;
    public payFinancialTax: boolean;
    public correctPennyDiff: boolean;
    public payDate: Date;
    public payGarnishment: boolean;
}


export class AmeldingSumUp extends UniEntity {
    public year: number;
    public generated: Date;
    public altInnStatus: string;
    public Replaces: string;
    public LegalEntityNo: string;
    public status: AmeldingStatus;
    public ReplacesAMeldingID: number;
    public sent: Date;
    public type: AmeldingType;
    public period: number;
    public ID: number;
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
    public arbeidsforholdId: string;
    public type: string;
    public startDate: Date;
    public endDate: Date;
    public permisjon: Array<EmploymentLeaves>;
}


export class EmploymentLeaves extends UniEntity {
    public startdato: Date;
    public permisjonsprosent: string;
    public permisjonsId: string;
    public beskrivelse: string;
    public sluttdato: Date;
}


export class TransactionTypes extends UniEntity {
    public amount: number;
    public incomeType: string;
    public Base_EmploymentTax: boolean;
    public benefit: string;
    public tax: boolean;
    public description: string;
}


export class AGADetails extends UniEntity {
    public rate: number;
    public baseAmount: number;
    public type: string;
    public zoneName: string;
    public sectorName: string;
}


export class Totals extends UniEntity {
    public sumAGA: number;
    public sumTax: number;
    public sumUtleggstrekk: number;
}


export class AnnualStatement extends UniEntity {
    public VacationPayBase: number;
    public Year: number;
    public EmployerEmail: string;
    public EmployerCity: string;
    public EmployerPhoneNumber: string;
    public EmployeeCity: string;
    public EmployeeAddress: string;
    public EmployeeSSn: string;
    public EmployeeMunicipalName: string;
    public EmployerCountry: string;
    public EmployerName: string;
    public EmployeeName: string;
    public EmployerCountryCode: string;
    public EmployerWebAddress: string;
    public EmployeeMunicipalNumber: string;
    public EmployeeNumber: number;
    public EmployerPostCode: string;
    public EmployerTaxMandatory: boolean;
    public EmployerOrgNr: string;
    public EmployerAddress: string;
    public EmployeePostCode: string;
    public Contributions: Array<AnnualStatementLine>;
    public PensionOrBenefits: Array<AnnualStatementLine>;
    public Deductions: Array<AnnualStatementLine>;
    public Draws: Array<AnnualStatementLine>;
}


export class AnnualStatementLine extends UniEntity {
    public TaxReturnPost: string;
    public Amount: number;
    public IsDeduction: boolean;
    public LineIndex: number;
    public SupplementPackageName: string;
    public Sum: number;
    public Description: string;
    public Supplements: Array<SupplementInfo>;
}


export class SupplementInfo extends UniEntity {
    public ValueBool: boolean;
    public ValueType: Valuetype;
    public ValueDate: Date;
    public WageTypeSupplementID: number;
    public ValueString: string;
    public ValueDate2: Date;
    public Name: string;
    public ValueMoney: number;
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
    public Text: string;
    public mainStatus: string;
    public Title: string;
    public IsJob: boolean;
    public employeestatus: Array<EmployeeStatus>;
}


export class EmployeeStatus extends UniEntity {
    public year: number;
    public info: string;
    public status: string;
    public ssn: string;
    public employeeID: number;
    public employeeNumber: number;
    public changedFields: Array<FieldsChanged>;
}


export class FieldsChanged extends UniEntity {
    public fieldName: string;
    public valFrom: string;
    public valTo: string;
}


export class EmploymentHistoryRecord extends UniEntity {
    public ChangedAt: Date;
    public RegulativeGroupID: number;
    public HourRate: number;
    public RegulativeStepNr: number;
    public WorkPercent: number;
    public MonthRate: number;
}


export class CodeListRowsCodeListRow extends UniEntity {
    public Value3: string;
    public Value2: string;
    public Code: string;
    public Value1: string;
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
    public sumTax: number;
    public pension: number;
    public netPayment: number;
    public paidHolidaypay: number;
    public employeeID: number;
    public nonTaxableAmount: number;
    public grossPayment: number;
    public taxBase: number;
    public baseVacation: number;
    public usedNonTaxableAmount: number;
    public advancePayment: number;
}


export class VacationPayLastYear extends UniEntity {
    public paidHolidayPay: number;
    public employeeID: number;
    public baseVacation: number;
}


export class SalaryTransactionPay extends UniEntity {
    public CompanyPostalCode: string;
    public Withholding: number;
    public SalaryBankAccountID: number;
    public TaxBankAccountID: number;
    public PaymentDate: Date;
    public CompanyBankAccountID: number;
    public CompanyAddress: string;
    public CompanyName: string;
    public CompanyCity: string;
    public PayList: Array<SalaryTransactionPayLine>;
    public SalaryBalancePayList: Array<SalaryBalancePayLine>;
}


export class SalaryTransactionPayLine extends UniEntity {
    public Account: string;
    public Address: string;
    public NetPayment: number;
    public EmployeeName: string;
    public PostalCode: string;
    public EmployeeNumber: number;
    public Tax: number;
    public City: string;
}


export class SalaryBalancePayLine extends UniEntity {
    public Account: string;
    public Text: string;
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
    public Message: string;
    public ReportID: number;
    public GroupByWageType: boolean;
    public Subject: string;
}


export class WorkItemToSalary extends UniEntity {
    public Rate: number;
    public PayrollRunID: number;
    public WageType: WageType;
    public Employment: Employment;
    public WorkItems: Array<WorkItem>;
}


export class Reconciliation extends UniEntity {
    public CalculatedPayruns: number;
    public Year: number;
    public BookedPayruns: number;
    public ToPeriod: number;
    public FromPeriod: number;
    public CreatedPayruns: number;
    public Groups: Array<ReconciliationGroup>;
}


export class ReconciliationGroup extends UniEntity {
    public Sum: number;
    public AccountNumber: string;
    public Lines: Array<ReconciliationLine>;
}


export class ReconciliationLine extends UniEntity {
    public WageTypeNumber: number;
    public IncomeType: string;
    public HasEmploymentTax: boolean;
    public Benefit: string;
    public Sum: number;
    public WageTypeName: string;
    public Description: string;
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
    public OUO: number;
    public Ensurance: number;
    public UnionDraw: number;
    public Name: string;
    public MemberNumber: string;
}


export class SalaryTransactionSums extends UniEntity {
    public calculatedAGA: number;
    public basePercentTax: number;
    public calculatedFinancialTax: number;
    public baseTableTax: number;
    public paidPension: number;
    public Employee: number;
    public Payrun: number;
    public netPayment: number;
    public manualTax: number;
    public grossPayment: number;
    public baseVacation: number;
    public calculatedVacationPay: number;
    public percentTax: number;
    public baseAGA: number;
    public paidAdvance: number;
    public tableTax: number;
}


export class SalaryTransactionPeriodSums extends UniEntity {
    public Year: number;
    public AgaRate: number;
    public AgaZone: string;
    public ToPeriod: number;
    public MunicipalName: string;
    public OrgNumber: string;
    public FromPeriod: number;
    public Sums: SalaryTransactionSums;
    public Aga: AGACalculation;
}


export class code extends UniEntity {
    public inngaarIGrunnlagForTrekk: string;
    public gmlcode: string;
    public gyldigfom: string;
    public postnr: string;
    public fordel: string;
    public kunfranav: string;
    public utloeserArbeidsgiveravgift: string;
    public gyldigtil: string;
    public skatteOgAvgiftregel: string;
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
    public CopyFiles: boolean;
    public IsTest: boolean;
    public LicenseKey: string;
    public ContractType: number;
    public ContractID: number;
    public ProductNames: string;
    public CompanyName: string;
    public IsTemplate: boolean;
    public TemplateCompanyKey: string;
    public CompanySettings: CompanySettings;
}


export class UserDto extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'UserDto';

    public Protected: boolean;
    public IsAutobankAdmin: boolean;
    public Email: string;
    public PhoneNumber: string;
    public HasAgreedToImportDisclaimer: boolean;
    public CreatedAt: Date;
    public UserName: string;
    public PermissionHandling: string;
    public BankIntegrationUserName: string;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public DisplayName: string;
    public StatusCode: number;
    public Deleted: boolean;
    public UpdatedBy: string;
    public ID: number;
    public LastLogin: Date;
    public GlobalIdentity: string;
    public _createguid: string;
    public TwoFactorEnabled: boolean;
    public AuthPhoneNumber: string;
    public EndDate: Date;
    public License: UserLicenseInformation;
    public CustomFields: any;
}


export class UserLicenseInformation extends UniEntity {
    public Name: string;
    public UserLicenseKey: string;
    public Comment: string;
    public UserLicenseEndDate: Date;
    public GlobalIdentity: string;
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
    public TypeName: string;
    public TypeID: number;
    public EndDate: Date;
}


export class CompanyLicenseInfomation extends UniEntity {
    public ContactPerson: string;
    public ContactEmail: string;
    public StatusCode: LicenseEntityStatus;
    public Key: string;
    public Name: string;
    public ContractID: number;
    public ID: number;
    public EndDate: Date;
    public Agency: Agency;
}


export class Agency extends UniEntity {
    public CompanyKey: string;
    public Name: string;
}


export class ContractLicenseType extends UniEntity {
    public TypeName: string;
    public TypeID: number;
    public TrialExpiration: Date;
    public StartDate: Date;
}


export class LicenseAgreementInfo extends UniEntity {
    public HasAgreedToLicense: boolean;
    public AgreementId: number;
}


export class CreateBankUserDTO extends UniEntity {
    public AdminUserId: number;
    public AdminPassword: string;
    public IsAdmin: boolean;
    public Phone: string;
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
    public UsedFreeAmount: number;
    public GrantSum: number;
}


export class AuthenticationChallengeBE extends UniEntity {
    public Status: ChallengeRequestResult;
    public Message: string;
    public ValidFrom: Date;
    public ValidTo: Date;
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
    public Year: number;
    public IncludeEmployments: boolean;
    public IncludeInfoPerPerson: boolean;
    public ToPeriod: Maaned;
    public IncludeIncome: boolean;
    public ReportType: ReportType;
    public FromPeriod: Maaned;
}


export class A07Response extends UniEntity {
    public Text: string;
    public DataType: string;
    public Data: string;
    public mainStatus: string;
    public Title: string;
    public DataName: string;
}


export class SelfEmployed extends UniEntity {
    public year: number;
    public items: Array<SelfEmployedItem>;
}


export class SelfEmployedItem extends UniEntity {
    public amount: number;
    public name: string;
    public number: string;
    public supplierID: number;
}


export class SetIntegrationDataDto extends UniEntity {
    public IntegrationKey: string;
    public ExternalId: string;
}


export class CurrencyRateData extends UniEntity {
    public ExchangeRateOld: number;
    public RateDateOld: LocalDate;
    public Factor: number;
    public IsOverrideRate: boolean;
    public RateDate: LocalDate;
    public ExchangeRate: number;
    public FromCurrencyCode: CurrencyCode;
}


export class EmailDTO extends UniEntity {
    public CopyAddress: string;
    public Message: string;
    public ReportID: number;
    public Subject: string;
    public FromAddress: string;
    public Format: string;
    public Parameters: Array<ReportParameter>;
}


export class ReportParameter extends UniEntity {
    public Value: string;
    public Name: string;
}


export class DistributionPlanElementValidation extends UniEntity {
    public ElementTypeName: string;
    public Priority: number;
    public IsValid: boolean;
    public ElementType: DistributionPlanElementTypes;
    public PlanElement: DistributionPlanElement;
}


export class SendEmail extends UniEntity {
    public CopyAddress: string;
    public Message: string;
    public ExternalReference: string;
    public ReportID: number;
    public Localization: string;
    public Subject: string;
    public EntityID: number;
    public ReportName: string;
    public EntityType: string;
    public FromAddress: string;
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
    public Title: string;
    public Description: string;
    public Items: Array<RssItem>;
}


export class RssItem extends UniEntity {
    public PubDate: string;
    public Link: string;
    public Guid: string;
    public Title: string;
    public Category: string;
    public Description: string;
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
    public FromDate: LocalDate;
    public ToDate: LocalDate;
    public Team: Team;
    public Members: Array<MemberDetails>;
}


export class MemberDetails extends UniEntity {
    public ReportBalance: number;
    public ExpectedMinutes: number;
    public Name: string;
    public TotalBalance: number;
    public MinutesWorked: number;
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
    public orgname: string;
    public contactphone: string;
    public orgno: string;
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

    public DimensionsID: number;
    public CreatedAt: Date;
    public UpdatedAt: Date;
    public CreatedBy: string;
    public StatusCode: number;
    public Deleted: boolean;
    public MissingOnlyWarningsDimensionsMessage: string;
    public journalEntryLineDraftID: number;
    public AccountID: number;
    public MissingRequiredDimensionsMessage: string;
    public UpdatedBy: string;
    public ID: number;
    public AccountNumber: string;
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
    public BalanceAccountName: string;
    public BalanceAccountNumber: number;
    public Name: string;
    public LastDepreciation: LocalDate;
    public Lifetime: number;
    public Number: number;
    public GroupCode: string;
    public GroupName: string;
    public CurrentValue: number;
    public DepreciationAccountNumber: number;
    public Lines: Array<AssetReportLineDTO>;
}


export class AssetReportLineDTO extends UniEntity {
    public Value: number;
    public TypeID: number;
    public Type: string;
    public Date: LocalDate;
}


export class BankBalanceDto extends UniEntity {
    public BalanceAvailable: number;
    public BalanceBooked: number;
    public IsTestData: boolean;
    public Date: Date;
    public Comment: string;
    public AccountNumber: string;
}


export class BankData extends UniEntity {
    public IBAN: string;
    public AccountNumber: string;
    public Bank: Bank;
}


export class CreateBankIntegrationDTO extends UniEntity {
    public IsOutgoing: boolean;
    public TuserName: string;
    public Email: string;
    public Bank: string;
    public UserName: string;
    public BankAcceptance: boolean;
    public IsBankBalance: boolean;
    public IsBankStatement: boolean;
    public DisplayName: string;
    public Phone: string;
    public RequireTwoStage: boolean;
    public IsInbound: boolean;
    public Password: string;
    public BankApproval: boolean;
    public ServiceProvider: number;
    public BankAccountID: number;
    public BankAccounts: Array<BankAccountDTO>;
}


export class BankAccountDTO extends UniEntity {
    public IsOutgoing: boolean;
    public IBAN: string;
    public IsBankBalance: boolean;
    public IsBankStatement: boolean;
    public Bic: string;
    public IsInbound: boolean;
    public BBAN: string;
}


export class ZdataUpdateBankProperties extends UniEntity {
    public IsOutgoing: boolean;
    public IsBankBalance: boolean;
    public IsBankStatement: boolean;
    public ServiceID: string;
    public IsInbound: boolean;
    public Password: string;
}


export class AutobankUserDTO extends UniEntity {
    public IsAdmin: boolean;
    public Phone: string;
    public UserID: number;
    public Password: string;
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
    public Amount: number;
    public JournalEntryLineID: number;
    public BankStatementEntryID: number;
    public Group: string;
}


export class MatchRequest extends UniEntity {
    public JournalEntries: Array<MatchCandidate>;
    public BankEntries: Array<MatchCandidate>;
    public Settings: MatchSettings;
}


export class MatchCandidate extends UniEntity {
    public Closed: boolean;
    public Amount: number;
    public IsBankEntry: boolean;
    public Date: Date;
    public ID: number;
}


export class MatchSettings extends UniEntity {
    public MaxDelta: number;
    public MaxDayOffset: number;
}


export class ReconciliationStatus extends UniEntity {
    public FromDate: Date;
    public NumberOfUnReconciled: number;
    public IsReconciled: boolean;
    public TotalAmount: number;
    public Todate: Date;
    public NumberOfItems: number;
    public AccountID: number;
    public TotalUnreconciled: number;
}


export class BalanceDto extends UniEntity {
    public Balance: number;
    public StartDate: Date;
    public BalanceInStatement: number;
    public EndDate: Date;
}


export class BankfileFormat extends UniEntity {
    public LinePrefix: string;
    public IsXml: boolean;
    public CustomFormat: BankFileCustomFormat;
    public Separator: string;
    public Name: string;
    public IsFixed: boolean;
    public SkipRows: number;
    public FileExtension: string;
    public Columns: Array<BankfileColumn>;
}


export class BankfileColumn extends UniEntity {
    public Length: number;
    public StartPos: number;
    public DataType: BankfileDataType;
    public IsFallBack: boolean;
    public FieldMapping: BankfileField;
}


export class JournalSuggestion extends UniEntity {
    public BankStatementRuleID: number;
    public Amount: number;
    public MatchWithEntryID: number;
    public AccountID: number;
    public Description: string;
    public FinancialDate: LocalDate;
    public Account: Account;
}


export class ReportRow extends UniEntity {
    public BudgetAccumulated: number;
    public Period12: number;
    public Period4: number;
    public PrecedingBalance: number;
    public SumPeriodAccumulated: number;
    public BudPeriod9: number;
    public BudPeriod1: number;
    public SumPeriodLastYear: number;
    public BudPeriod11: number;
    public Period6: number;
    public Period9: number;
    public BudPeriod4: number;
    public SumPeriod: number;
    public BudPeriod6: number;
    public GroupNumber: number;
    public BudPeriod12: number;
    public Period7: number;
    public Period11: number;
    public IsSubTotal: boolean;
    public AccountName: string;
    public Period2: number;
    public Period3: number;
    public BudPeriod5: number;
    public Period5: number;
    public Period1: number;
    public BudPeriod8: number;
    public BudPeriod7: number;
    public BudPeriod10: number;
    public SumLastYear: number;
    public BudgetSum: number;
    public Sum: number;
    public AccountYear: number;
    public SubGroupNumber: number;
    public Period10: number;
    public SubGroupName: string;
    public GroupName: string;
    public Period8: number;
    public BudPeriod2: number;
    public ID: number;
    public SumPeriodLastYearAccumulated: number;
    public AccountNumber: number;
    public BudPeriod3: number;
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
    public Liquidity: number;
    public CustomPayments: number;
    public VAT: number;
    public Supplier: number;
    public Sum: number;
    public Custumer: number;
}


export class JournalEntryData extends UniEntity {
    public PaymentID: string;
    public NumberSeriesID: number;
    public JournalEntryNo: string;
    public VatDate: LocalDate;
    public Amount: number;
    public AmountCurrency: number;
    public DebitVatTypeID: number;
    public CreditAccountNumber: number;
    public DueDate: LocalDate;
    public SupplierInvoiceID: number;
    public StatusCode: number;
    public JournalEntryID: number;
    public PostPostJournalEntryLineID: number;
    public NumberSeriesTaskID: number;
    public DebitAccountNumber: number;
    public CreditVatTypeID: number;
    public CustomerInvoiceID: number;
    public JournalEntryDataAccrualID: number;
    public SupplierInvoiceNo: string;
    public CurrencyID: number;
    public VatDeductionPercent: number;
    public CurrencyExchangeRate: number;
    public InvoiceNumber: string;
    public Description: string;
    public CustomerOrderID: number;
    public CreditAccountID: number;
    public DebitAccountID: number;
    public FinancialDate: LocalDate;
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
    public SumBalance: number;
    public SumTaxBasisAmount: number;
    public SumLedger: number;
    public SumCredit: number;
    public SumDebit: number;
}


export class JournalEntryLinePostPostData extends UniEntity {
    public PaymentID: string;
    public MarkedAgainstJournalEntryLineID: number;
    public JournalEntryNumber: string;
    public NumberOfPayments: number;
    public Amount: number;
    public AmountCurrency: number;
    public CurrencyCodeCode: string;
    public JournalEntryTypeName: string;
    public SumPostPostAmountCurrency: number;
    public DueDate: Date;
    public StatusCode: number;
    public JournalEntryID: number;
    public CurrencyCodeID: number;
    public RestAmountCurrency: number;
    public RestAmount: number;
    public SubAccountName: string;
    public AccountYear: number;
    public CurrencyExchangeRate: number;
    public JournalEntryNumberNumeric: number;
    public InvoiceNumber: string;
    public SubAccountNumber: number;
    public PeriodNo: number;
    public SumPostPostAmount: number;
    public ID: number;
    public Description: string;
    public MarkedAgainstJournalEntryNumber: string;
    public FinancialDate: Date;
    public CurrencyCodeShortCode: string;
    public Markings: Array<JournalEntryLinePostPostData>;
}


export class CreatePaymentBatchDTO extends UniEntity {
    public Code: string;
    public Password: string;
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
    public OriginalStatusCode: StatusCodeJournalEntryLine;
    public JournalEntryNumber: string;
    public Amount: number;
    public AmountCurrency: number;
    public OriginalRestAmount: number;
    public StatusCode: StatusCodeJournalEntryLine;
    public RestAmountCurrency: number;
    public RestAmount: number;
    public InvoiceNumber: string;
    public ID: number;
    public FinancialDate: Date;
    public Markings: Array<MarkingReference>;
}


export class MarkingReference extends UniEntity {
    public JournalEntryNumber: string;
    public ID: number;
}


export class SupplierInvoiceDetail extends UniEntity {
    public Amount: number;
    public AmountCurrency: number;
    public DeliveryDate: Date;
    public SupplierInvoiceID: number;
    public VatPercent: number;
    public AccountName: string;
    public VatTypeID: number;
    public InvoiceDate: Date;
    public AccountID: number;
    public SupplierID: number;
    public InvoiceNumber: string;
    public VatTypeName: string;
    public Description: string;
    public VatCode: string;
    public AccountNumber: number;
}


export class VatReportMessage extends UniEntity {
    public Message: string;
    public Level: ValidationLevel;
}


export class VatReportSummary extends UniEntity {
    public SumTaxBasisAmount: number;
    public HasTaxAmount: boolean;
    public VatCodeGroupName: string;
    public NumberOfJournalEntryLines: number;
    public VatCodeGroupID: number;
    public HasTaxBasis: boolean;
    public VatCodeGroupNo: string;
    public IsHistoricData: boolean;
    public SumVatAmount: number;
}


export class VatReportSummaryPerPost extends UniEntity {
    public SumTaxBasisAmount: number;
    public HasTaxAmount: boolean;
    public VatPostReportAsNegativeAmount: boolean;
    public VatPostNo: string;
    public VatCodeGroupName: string;
    public NumberOfJournalEntryLines: number;
    public VatCodeGroupID: number;
    public HasTaxBasis: boolean;
    public VatCodeGroupNo: string;
    public IsHistoricData: boolean;
    public SumVatAmount: number;
    public VatPostID: number;
    public VatPostName: string;
}


export class VatReportSummaryPerPostPerAccount extends UniEntity {
    public SumTaxBasisAmount: number;
    public HasTaxAmount: boolean;
    public JournalEntryNumber: string;
    public VatDate: Date;
    public Amount: number;
    public VatPostReportAsNegativeAmount: boolean;
    public VatJournalEntryPostAccountNumber: number;
    public VatPostNo: string;
    public VatCodeGroupName: string;
    public NumberOfJournalEntryLines: number;
    public VatCodeGroupID: number;
    public VatJournalEntryPostAccountID: number;
    public HasTaxBasis: boolean;
    public VatAccountID: number;
    public TaxBasisAmount: number;
    public VatCodeGroupNo: string;
    public IsHistoricData: boolean;
    public VatJournalEntryPostAccountName: string;
    public SumVatAmount: number;
    public VatAccountName: string;
    public VatPostID: number;
    public Description: string;
    public VatPostName: string;
    public StdVatCode: string;
    public FinancialDate: Date;
    public VatCode: string;
    public VatAccountNumber: number;
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


export enum RemunerationType{
    notSet = 0,
    FixedSalary = 1,
    HourlyPaid = 2,
    PaidOnCommission = 3,
    OnAgreement_Honorar = 4,
    ByPerformance = 5,
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


export enum linestate{
    Received = 0,
    Processed = 1,
    Rejected = 3,
}


export enum costtype{
    Travel = 0,
    Expense = 1,
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
