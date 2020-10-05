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
    public Deleted: boolean;
    public ClientID: string;
    public ID: number;
    public EntityType: string;
    public Action: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public EntityID: number;
    public NewValue: string;
    public Transaction: string;
    public OldValue: string;
    public Route: string;
    public Verb: string;
    public Field: string;
    public _createguid: string;
    public CustomFields: any;
}


export class WorkBalance extends UniEntity {
    public static RelativeUrl = 'workbalances';
    public static EntityType = 'WorkBalance';

    public CreatedAt: Date;
    public Description: string;
    public Deleted: boolean;
    public Balancetype: WorkBalanceTypeEnum;
    public Days: number;
    public IsStartBalance: boolean;
    public ID: number;
    public StatusCode: number;
    public ExpectedMinutes: number;
    public ActualMinutes: number;
    public WorkRelationID: number;
    public BalanceFrom: Date;
    public ValidFrom: Date;
    public UpdatedAt: Date;
    public Minutes: number;
    public UpdatedBy: string;
    public BalanceDate: Date;
    public CreatedBy: string;
    public ValidTimeOff: number;
    public _createguid: string;
    public CustomFields: any;
}


export class Worker extends UniEntity {
    public static RelativeUrl = 'workers';
    public static EntityType = 'Worker';

    public CreatedAt: Date;
    public Deleted: boolean;
    public UserID: number;
    public ID: number;
    public EmployeeID: number;
    public StatusCode: number;
    public UpdatedAt: Date;
    public BusinessRelationID: number;
    public UpdatedBy: string;
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

    public CreatedAt: Date;
    public Description: string;
    public Deleted: boolean;
    public CustomerID: number;
    public TransferedToOrder: boolean;
    public WorkItemGroupID: number;
    public ID: number;
    public StatusCode: number;
    public OrderItemId: number;
    public PriceExVat: number;
    public WorkTypeID: number;
    public WorkRelationID: number;
    public MinutesToOrder: number;
    public StartTime: Date;
    public DimensionsID: number;
    public CustomerOrderID: number;
    public UpdatedAt: Date;
    public Label: string;
    public Minutes: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public EndTime: Date;
    public LunchInMinutes: number;
    public PayrollTrackingID: number;
    public TransferedToPayroll: boolean;
    public Invoiceable: boolean;
    public Date: Date;
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
    public ID: number;
    public StatusCode: number;
    public WorkRelationID: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public WorkRelation: WorkRelation;
    public Items: Array<WorkItem>;
    public CustomFields: any;
}


export class WorkProfile extends UniEntity {
    public static RelativeUrl = 'workprofiles';
    public static EntityType = 'WorkProfile';

    public CreatedAt: Date;
    public Deleted: boolean;
    public ID: number;
    public StatusCode: number;
    public Name: string;
    public LunchIncluded: boolean;
    public MinutesPerYear: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public MinutesPerMonth: number;
    public CreatedBy: string;
    public MinutesPerWeek: number;
    public IsShared: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class WorkRelation extends UniEntity {
    public static RelativeUrl = 'workrelations';
    public static EntityType = 'WorkRelation';

    public CreatedAt: Date;
    public WorkerID: number;
    public Description: string;
    public CompanyID: number;
    public Deleted: boolean;
    public ID: number;
    public StatusCode: number;
    public IsActive: boolean;
    public TeamID: number;
    public CompanyName: string;
    public UpdatedAt: Date;
    public WorkPercentage: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public EndTime: Date;
    public WorkProfileID: number;
    public StartDate: Date;
    public IsPrivate: boolean;
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
    public Description: string;
    public Deleted: boolean;
    public RegionKey: string;
    public ID: number;
    public StatusCode: number;
    public WorkRelationID: number;
    public UpdatedAt: Date;
    public SystemKey: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public IsHalfDay: boolean;
    public ToDate: Date;
    public TimeoffType: number;
    public FromDate: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class WorkType extends UniEntity {
    public static RelativeUrl = 'worktypes';
    public static EntityType = 'WorkType';

    public CreatedAt: Date;
    public Description: string;
    public Deleted: boolean;
    public Price: number;
    public ID: number;
    public StatusCode: number;
    public Name: string;
    public SystemType: WorkTypeEnum;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public ProductID: number;
    public WagetypeNumber: number;
    public _createguid: string;
    public Product: Product;
    public CustomFields: any;
}


export class BankFile extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'BankFile';

    public CreatedAt: Date;
    public Deleted: boolean;
    public ID: number;
    public StatusCode: number;
    public Accountnumber: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public SubCompanyID: number;
    public FileID: number;
    public ParentFileid: number;
    public _createguid: string;
    public File: File;
    public SubCompany: SubCompany;
    public CustomFields: any;
}


export class BatchInvoice extends UniEntity {
    public static RelativeUrl = 'batchinvoices';
    public static EntityType = 'BatchInvoice';

    public CreatedAt: Date;
    public Deleted: boolean;
    public YourRef: string;
    public DueDate: LocalDate;
    public ID: number;
    public NumberOfBatches: number;
    public FreeTxt: string;
    public Processed: number;
    public StatusCode: number;
    public TotalToProcess: number;
    public NotifyEmail: boolean;
    public Comment: string;
    public Operation: BatchInvoiceOperation;
    public UpdatedAt: Date;
    public MinAmount: number;
    public InvoiceDate: LocalDate;
    public UpdatedBy: string;
    public CreatedBy: string;
    public SellerID: number;
    public OurRef: string;
    public CustomerID: number;
    public ProjectID: number;
    public _createguid: string;
    public Items: Array<BatchInvoiceItem>;
    public CustomFields: any;
}


export class BatchInvoiceItem extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'BatchInvoiceItem';

    public CreatedAt: Date;
    public Deleted: boolean;
    public ID: number;
    public StatusCode: StatusCode;
    public CustomerInvoiceID: number;
    public BatchInvoiceID: number;
    public CommentID: number;
    public CustomerOrderID: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public BatchNumber: number;
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
    public EntityName: string;
    public Deleted: boolean;
    public ID: number;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Template: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Customer extends UniEntity {
    public static RelativeUrl = 'customers';
    public static EntityType = 'Customer';

    public CreatedAt: Date;
    public Localization: string;
    public Deleted: boolean;
    public FactoringNumber: number;
    public CustomerInvoiceReminderSettingsID: number;
    public CustomerNumberKidAlias: string;
    public ID: number;
    public GLN: string;
    public ReminderEmailAddress: string;
    public DefaultCustomerOrderReportID: number;
    public EfakturaIdentifier: string;
    public StatusCode: number;
    public DefaultCustomerQuoteReportID: number;
    public AcceptableDelta4CustomerPayment: number;
    public PeppolAddress: string;
    public EInvoiceAgreementReference: string;
    public AvtaleGiroNotification: boolean;
    public DefaultSellerID: number;
    public CurrencyCodeID: number;
    public DimensionsID: number;
    public SubAccountNumberSeriesID: number;
    public UpdatedAt: Date;
    public BusinessRelationID: number;
    public PaymentTermsID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreditDays: number;
    public DefaultDistributionsID: number;
    public AcceptableDelta4CustomerPaymentAccountID: number;
    public CustomerNumber: number;
    public DefaultCustomerInvoiceReportID: number;
    public SocialSecurityNumber: string;
    public DeliveryTermsID: number;
    public DontSendReminders: boolean;
    public WebUrl: string;
    public IsPrivate: boolean;
    public OrgNumber: string;
    public AvtaleGiro: boolean;
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

    public CreatedAt: Date;
    public InvoiceReferenceID: number;
    public CustomerPerson: string;
    public TaxExclusiveAmount: number;
    public InternalNote: string;
    public Deleted: boolean;
    public CustomerName: string;
    public CustomerOrgNumber: string;
    public ShippingCountryCode: string;
    public SalesPerson: string;
    public ShippingPostalCode: string;
    public ShippingAddressLine1: string;
    public InvoicePostalCode: string;
    public DistributionPlanID: number;
    public CustomerID: number;
    public PaymentTerm: string;
    public CurrencyExchangeRate: number;
    public PaymentDueDate: LocalDate;
    public ID: number;
    public InvoiceCity: string;
    public VatTotalsAmount: number;
    public InvoiceNumber: string;
    public ExternalStatus: number;
    public DeliveryName: string;
    public Requisition: string;
    public ExternalReference: string;
    public VatTotalsAmountCurrency: number;
    public FreeTxt: string;
    public ShippingAddressLine3: string;
    public StatusCode: number;
    public InvoiceType: number;
    public ShippingCity: string;
    public TaxInclusiveAmount: number;
    public PayableRoundingAmount: number;
    public UpdateCurrencyAmountsOnDateChange: boolean;
    public CreditedAmount: number;
    public AccrualID: number;
    public ShippingCountry: string;
    public Comment: string;
    public ShippingAddressLine2: string;
    public DeliveryTerm: string;
    public TaxInclusiveAmountCurrency: number;
    public DefaultSellerID: number;
    public CollectorStatusCode: number;
    public InvoiceReceiverName: string;
    public CurrencyCodeID: number;
    public EmailAddress: string;
    public SupplierOrgNumber: string;
    public Payment: string;
    public PrintStatus: number;
    public InvoiceAddressLine2: string;
    public UpdatedAt: Date;
    public UseReportID: number;
    public Credited: boolean;
    public YourReference: string;
    public InvoiceDate: LocalDate;
    public PaymentTermsID: number;
    public UpdatedBy: string;
    public InvoiceAddressLine1: string;
    public DefaultDimensionsID: number;
    public CreatedBy: string;
    public CreditDays: number;
    public JournalEntryID: number;
    public AmountRegards: string;
    public PaymentInformation: string;
    public OurReference: string;
    public DeliveryDate: LocalDate;
    public BankAccountID: number;
    public TaxExclusiveAmountCurrency: number;
    public PaymentInfoTypeID: number;
    public CreditedAmountCurrency: number;
    public PaymentID: string;
    public PayableRoundingCurrencyAmount: number;
    public DeliveryMethod: string;
    public DeliveryTermsID: number;
    public DontSendReminders: boolean;
    public InvoiceAddressLine3: string;
    public RestAmount: number;
    public RestAmountCurrency: number;
    public InvoiceCountry: string;
    public InvoiceNumberSeriesID: number;
    public InvoiceCountryCode: string;
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
    public Unit: string;
    public SumTotalIncVat: number;
    public NumberOfItems: number;
    public Deleted: boolean;
    public DiscountCurrency: number;
    public PriceExVatCurrency: number;
    public SumTotalExVat: number;
    public CalculateGrossPriceBasedOnNetPrice: boolean;
    public VatTypeID: number;
    public CurrencyExchangeRate: number;
    public ID: number;
    public ItemSourceID: number;
    public StatusCode: number;
    public ItemText: string;
    public PriceSetByUser: boolean;
    public CustomerInvoiceID: number;
    public PriceExVat: number;
    public VatPercent: number;
    public Comment: string;
    public SumVatCurrency: number;
    public CurrencyCodeID: number;
    public AccountingCost: string;
    public DiscountPercent: number;
    public DimensionsID: number;
    public Discount: number;
    public UpdatedAt: Date;
    public SortIndex: number;
    public AccountID: number;
    public CostPrice: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public SumTotalIncVatCurrency: number;
    public InvoicePeriodEndDate: LocalDate;
    public SumVat: number;
    public ProductID: number;
    public PriceIncVat: number;
    public SumTotalExVatCurrency: number;
    public InvoicePeriodStartDate: LocalDate;
    public _createguid: string;
    public OrderItemId: number;
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

    public CreatedAt: Date;
    public Description: string;
    public CreatedByReminderRuleID: number;
    public Deleted: boolean;
    public Notified: boolean;
    public DueDate: LocalDate;
    public InterestFee: number;
    public CurrencyExchangeRate: number;
    public ID: number;
    public ReminderFeeCurrency: number;
    public Title: string;
    public RemindedDate: LocalDate;
    public StatusCode: number;
    public CustomerInvoiceID: number;
    public ReminderNumber: number;
    public CurrencyCodeID: number;
    public EmailAddress: string;
    public DimensionsID: number;
    public UpdatedAt: Date;
    public ReminderFee: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public DebtCollectionFee: number;
    public RunNumber: number;
    public RestAmount: number;
    public RestAmountCurrency: number;
    public DebtCollectionFeeCurrency: number;
    public InterestFeeCurrency: number;
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
    public Description: string;
    public Deleted: boolean;
    public MinimumDaysFromDueDate: number;
    public CustomerInvoiceReminderSettingsID: number;
    public ID: number;
    public Title: string;
    public StatusCode: number;
    public UseMaximumLegalReminderFee: boolean;
    public ReminderNumber: number;
    public UpdatedAt: Date;
    public ReminderFee: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreditDays: number;
    public _createguid: string;
    public CustomerInvoiceReminderSettings: CustomerInvoiceReminderSettings;
    public CustomFields: any;
}


export class CustomerInvoiceReminderSettings extends UniEntity {
    public static RelativeUrl = 'invoiceremindersettings';
    public static EntityType = 'CustomerInvoiceReminderSettings';

    public CreatedAt: Date;
    public Deleted: boolean;
    public ID: number;
    public RemindersBeforeDebtCollection: number;
    public StatusCode: number;
    public MinimumAmountToRemind: number;
    public UpdatedAt: Date;
    public DebtCollectionSettingsID: number;
    public AcceptPaymentWithoutReminderFee: boolean;
    public UpdatedBy: string;
    public CreatedBy: string;
    public DefaultReminderFeeAccountID: number;
    public _createguid: string;
    public CustomerInvoiceReminderRules: Array<CustomerInvoiceReminderRule>;
    public DebtCollectionSettings: DebtCollectionSettings;
    public DefaultReminderFeeAccount: Account;
    public CustomFields: any;
}


export class CustomerOrder extends UniEntity {
    public static RelativeUrl = 'orders';
    public static EntityType = 'CustomerOrder';

    public CreatedAt: Date;
    public CustomerPerson: string;
    public TaxExclusiveAmount: number;
    public InternalNote: string;
    public Deleted: boolean;
    public CustomerName: string;
    public CustomerOrgNumber: string;
    public ShippingCountryCode: string;
    public SalesPerson: string;
    public ShippingPostalCode: string;
    public ShippingAddressLine1: string;
    public InvoicePostalCode: string;
    public DistributionPlanID: number;
    public CustomerID: number;
    public PaymentTerm: string;
    public CurrencyExchangeRate: number;
    public ID: number;
    public InvoiceCity: string;
    public VatTotalsAmount: number;
    public DeliveryName: string;
    public Requisition: string;
    public VatTotalsAmountCurrency: number;
    public FreeTxt: string;
    public ShippingAddressLine3: string;
    public StatusCode: number;
    public ShippingCity: string;
    public TaxInclusiveAmount: number;
    public PayableRoundingAmount: number;
    public UpdateCurrencyAmountsOnDateChange: boolean;
    public AccrualID: number;
    public ShippingCountry: string;
    public Comment: string;
    public ShippingAddressLine2: string;
    public DeliveryTerm: string;
    public TaxInclusiveAmountCurrency: number;
    public DefaultSellerID: number;
    public InvoiceReceiverName: string;
    public CurrencyCodeID: number;
    public EmailAddress: string;
    public SupplierOrgNumber: string;
    public PrintStatus: number;
    public InvoiceAddressLine2: string;
    public UpdatedAt: Date;
    public UseReportID: number;
    public RestExclusiveAmountCurrency: number;
    public YourReference: string;
    public PaymentTermsID: number;
    public UpdateCurrencyOnToInvoice: boolean;
    public UpdatedBy: string;
    public InvoiceAddressLine1: string;
    public DefaultDimensionsID: number;
    public CreatedBy: string;
    public CreditDays: number;
    public OrderNumberSeriesID: number;
    public ReadyToInvoice: boolean;
    public OurReference: string;
    public DeliveryDate: LocalDate;
    public TaxExclusiveAmountCurrency: number;
    public PaymentInfoTypeID: number;
    public PayableRoundingCurrencyAmount: number;
    public DeliveryMethod: string;
    public DeliveryTermsID: number;
    public InvoiceAddressLine3: string;
    public RestAmountCurrency: number;
    public InvoiceCountry: string;
    public OrderNumber: number;
    public InvoiceCountryCode: string;
    public OrderDate: LocalDate;
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
    public Unit: string;
    public SumTotalIncVat: number;
    public NumberOfItems: number;
    public Deleted: boolean;
    public DiscountCurrency: number;
    public PriceExVatCurrency: number;
    public SumTotalExVat: number;
    public CalculateGrossPriceBasedOnNetPrice: boolean;
    public VatTypeID: number;
    public CurrencyExchangeRate: number;
    public ID: number;
    public ItemSourceID: number;
    public StatusCode: number;
    public ItemText: string;
    public PriceSetByUser: boolean;
    public PriceExVat: number;
    public VatPercent: number;
    public Comment: string;
    public SumVatCurrency: number;
    public CurrencyCodeID: number;
    public DiscountPercent: number;
    public DimensionsID: number;
    public Discount: number;
    public CustomerOrderID: number;
    public UpdatedAt: Date;
    public SortIndex: number;
    public AccountID: number;
    public CostPrice: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public SumTotalIncVatCurrency: number;
    public SumVat: number;
    public ReadyToInvoice: boolean;
    public ProductID: number;
    public PriceIncVat: number;
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

    public CreatedAt: Date;
    public InquiryReference: number;
    public CustomerPerson: string;
    public TaxExclusiveAmount: number;
    public InternalNote: string;
    public Deleted: boolean;
    public CustomerName: string;
    public CustomerOrgNumber: string;
    public ShippingCountryCode: string;
    public SalesPerson: string;
    public ShippingPostalCode: string;
    public ShippingAddressLine1: string;
    public InvoicePostalCode: string;
    public DistributionPlanID: number;
    public CustomerID: number;
    public PaymentTerm: string;
    public CurrencyExchangeRate: number;
    public ID: number;
    public InvoiceCity: string;
    public VatTotalsAmount: number;
    public DeliveryName: string;
    public Requisition: string;
    public VatTotalsAmountCurrency: number;
    public FreeTxt: string;
    public ShippingAddressLine3: string;
    public StatusCode: number;
    public ShippingCity: string;
    public TaxInclusiveAmount: number;
    public PayableRoundingAmount: number;
    public UpdateCurrencyAmountsOnDateChange: boolean;
    public QuoteNumberSeriesID: number;
    public ShippingCountry: string;
    public Comment: string;
    public ShippingAddressLine2: string;
    public DeliveryTerm: string;
    public TaxInclusiveAmountCurrency: number;
    public DefaultSellerID: number;
    public InvoiceReceiverName: string;
    public CurrencyCodeID: number;
    public UpdateCurrencyOnToOrder: boolean;
    public EmailAddress: string;
    public SupplierOrgNumber: string;
    public QuoteDate: LocalDate;
    public PrintStatus: number;
    public InvoiceAddressLine2: string;
    public UpdatedAt: Date;
    public UseReportID: number;
    public YourReference: string;
    public PaymentTermsID: number;
    public UpdateCurrencyOnToInvoice: boolean;
    public UpdatedBy: string;
    public InvoiceAddressLine1: string;
    public DefaultDimensionsID: number;
    public CreatedBy: string;
    public CreditDays: number;
    public ValidUntilDate: LocalDate;
    public OurReference: string;
    public DeliveryDate: LocalDate;
    public TaxExclusiveAmountCurrency: number;
    public PaymentInfoTypeID: number;
    public QuoteNumber: number;
    public PayableRoundingCurrencyAmount: number;
    public DeliveryMethod: string;
    public DeliveryTermsID: number;
    public InvoiceAddressLine3: string;
    public InvoiceCountry: string;
    public InvoiceCountryCode: string;
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
    public Unit: string;
    public SumTotalIncVat: number;
    public NumberOfItems: number;
    public Deleted: boolean;
    public DiscountCurrency: number;
    public PriceExVatCurrency: number;
    public SumTotalExVat: number;
    public CalculateGrossPriceBasedOnNetPrice: boolean;
    public VatTypeID: number;
    public CurrencyExchangeRate: number;
    public ID: number;
    public CustomerQuoteID: number;
    public StatusCode: number;
    public ItemText: string;
    public PriceSetByUser: boolean;
    public PriceExVat: number;
    public VatPercent: number;
    public Comment: string;
    public SumVatCurrency: number;
    public CurrencyCodeID: number;
    public DiscountPercent: number;
    public DimensionsID: number;
    public Discount: number;
    public UpdatedAt: Date;
    public SortIndex: number;
    public AccountID: number;
    public CostPrice: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public SumTotalIncVatCurrency: number;
    public SumVat: number;
    public ProductID: number;
    public PriceIncVat: number;
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

    public CreatedAt: Date;
    public Deleted: boolean;
    public CustomerInvoiceReminderSettingsID: number;
    public ID: number;
    public StatusCode: number;
    public DebtCollectionFormat: number;
    public IntegrateWithDebtCollection: boolean;
    public UpdatedAt: Date;
    public DebtCollectionAutomationID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreditorNumber: number;
    public _createguid: string;
    public CustomerInvoiceReminderSettings: CustomerInvoiceReminderSettings;
    public DebtCollectionAutomation: Array<DebtCollectionAutomation>;
    public CustomFields: any;
}


export class ItemSource extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ItemSource';

    public CreatedAt: Date;
    public Deleted: boolean;
    public ID: number;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public Details: Array<ItemSourceDetail>;
    public CustomFields: any;
}


export class ItemSourceDetail extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ItemSourceDetail';

    public CreatedAt: Date;
    public Description: string;
    public Deleted: boolean;
    public ID: number;
    public ItemSourceID: number;
    public StatusCode: number;
    public SourceFK: number;
    public Tag: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public SourceType: string;
    public Amount: number;
    public _createguid: string;
    public CustomFields: any;
}


export class PaymentInfoType extends UniEntity {
    public static RelativeUrl = 'paymentinfotype';
    public static EntityType = 'PaymentInfoType';

    public CreatedAt: Date;
    public Deleted: boolean;
    public ID: number;
    public StatusCode: number;
    public Name: string;
    public Length: number;
    public Control: Modulus;
    public Locked: boolean;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Type: PaymentInfoTypeEnum;
    public _createguid: string;
    public PaymentInfoTypeParts: Array<PaymentInfoTypePart>;
    public CustomFields: any;
}


export class PaymentInfoTypePart extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'PaymentInfoTypePart';

    public CreatedAt: Date;
    public Part: string;
    public Deleted: boolean;
    public ID: number;
    public StatusCode: number;
    public Length: number;
    public UpdatedAt: Date;
    public SortIndex: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public PaymentInfoTypeID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class RecurringInvoice extends UniEntity {
    public static RelativeUrl = 'recurringinvoices';
    public static EntityType = 'RecurringInvoice';

    public CreatedAt: Date;
    public NotifyUser: string;
    public CustomerPerson: string;
    public TaxExclusiveAmount: number;
    public PreparationDays: number;
    public InternalNote: string;
    public Deleted: boolean;
    public CustomerName: string;
    public CustomerOrgNumber: string;
    public ShippingCountryCode: string;
    public SalesPerson: string;
    public ShippingPostalCode: string;
    public ShippingAddressLine1: string;
    public InvoicePostalCode: string;
    public DistributionPlanID: number;
    public CustomerID: number;
    public PaymentTerm: string;
    public CurrencyExchangeRate: number;
    public ID: number;
    public InvoiceCity: string;
    public VatTotalsAmount: number;
    public DeliveryName: string;
    public Requisition: string;
    public VatTotalsAmountCurrency: number;
    public FreeTxt: string;
    public NextInvoiceDate: LocalDate;
    public ShippingAddressLine3: string;
    public StatusCode: number;
    public ShippingCity: string;
    public TaxInclusiveAmount: number;
    public PayableRoundingAmount: number;
    public UpdateCurrencyAmountsOnDateChange: boolean;
    public ShippingCountry: string;
    public Comment: string;
    public ShippingAddressLine2: string;
    public DeliveryTerm: string;
    public TaxInclusiveAmountCurrency: number;
    public DefaultSellerID: number;
    public ProduceAs: RecurringResult;
    public InvoiceReceiverName: string;
    public CurrencyCodeID: number;
    public NoCreditDays: boolean;
    public EmailAddress: string;
    public SupplierOrgNumber: string;
    public Payment: string;
    public PrintStatus: number;
    public InvoiceAddressLine2: string;
    public UpdatedAt: Date;
    public UseReportID: number;
    public YourReference: string;
    public TimePeriod: RecurringPeriod;
    public PaymentTermsID: number;
    public UpdatedBy: string;
    public InvoiceAddressLine1: string;
    public DefaultDimensionsID: number;
    public CreatedBy: string;
    public CreditDays: number;
    public EndDate: LocalDate;
    public AmountRegards: string;
    public PaymentInformation: string;
    public StartDate: LocalDate;
    public OurReference: string;
    public DeliveryDate: LocalDate;
    public TaxExclusiveAmountCurrency: number;
    public PaymentInfoTypeID: number;
    public NotifyWhenRecurringEnds: boolean;
    public PayableRoundingCurrencyAmount: number;
    public DeliveryMethod: string;
    public DeliveryTermsID: number;
    public Interval: number;
    public InvoiceAddressLine3: string;
    public MaxIterations: number;
    public InvoiceCountry: string;
    public InvoiceNumberSeriesID: number;
    public InvoiceCountryCode: string;
    public NotifyWhenOrdersArePrepared: boolean;
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

    public CreatedAt: Date;
    public Unit: string;
    public SumTotalIncVat: number;
    public RecurringInvoiceID: number;
    public NumberOfItems: number;
    public Deleted: boolean;
    public DiscountCurrency: number;
    public PriceExVatCurrency: number;
    public SumTotalExVat: number;
    public CalculateGrossPriceBasedOnNetPrice: boolean;
    public VatTypeID: number;
    public CurrencyExchangeRate: number;
    public ID: number;
    public ReduceIncompletePeriod: boolean;
    public PricingSource: PricingSource;
    public StatusCode: number;
    public ItemText: string;
    public PriceSetByUser: boolean;
    public PriceExVat: number;
    public VatPercent: number;
    public Comment: string;
    public TimeFactor: RecurringPeriod;
    public SumVatCurrency: number;
    public CurrencyCodeID: number;
    public DiscountPercent: number;
    public DimensionsID: number;
    public Discount: number;
    public UpdatedAt: Date;
    public SortIndex: number;
    public AccountID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public SumTotalIncVatCurrency: number;
    public SumVat: number;
    public ProductID: number;
    public PriceIncVat: number;
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

    public CreatedAt: Date;
    public RecurringInvoiceID: number;
    public Deleted: boolean;
    public ID: number;
    public NotifiedOrdersPrepared: boolean;
    public CreationDate: LocalDate;
    public StatusCode: number;
    public Comment: string;
    public NotifiedRecurringEnds: boolean;
    public IterationNumber: number;
    public UpdatedAt: Date;
    public OrderID: number;
    public InvoiceDate: LocalDate;
    public UpdatedBy: string;
    public CreatedBy: string;
    public InvoiceID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class Seller extends UniEntity {
    public static RelativeUrl = 'sellers';
    public static EntityType = 'Seller';

    public CreatedAt: Date;
    public Deleted: boolean;
    public UserID: number;
    public ID: number;
    public EmployeeID: number;
    public StatusCode: number;
    public Name: string;
    public TeamID: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public DefaultDimensionsID: number;
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

    public CreatedAt: Date;
    public RecurringInvoiceID: number;
    public Deleted: boolean;
    public CustomerID: number;
    public ID: number;
    public CustomerQuoteID: number;
    public StatusCode: number;
    public CustomerInvoiceID: number;
    public CustomerOrderID: number;
    public UpdatedAt: Date;
    public Percent: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public SellerID: number;
    public Amount: number;
    public _createguid: string;
    public Seller: Seller;
    public CustomFields: any;
}


export class SubCompany extends UniEntity {
    public static RelativeUrl = 'subcompanies';
    public static EntityType = 'SubCompany';

    public CreatedAt: Date;
    public CompanyID: number;
    public Deleted: boolean;
    public CustomerID: number;
    public ID: number;
    public CompanyKey: string;
    public StatusCode: number;
    public CompanyName: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CompanyType: CompanyRelation;
    public _createguid: string;
    public Customer: Customer;
    public CustomFields: any;
}


export class Supplier extends UniEntity {
    public static RelativeUrl = 'suppliers';
    public static EntityType = 'Supplier';

    public CreatedAt: Date;
    public Localization: string;
    public Deleted: boolean;
    public ID: number;
    public GLN: string;
    public StatusCode: number;
    public CostAllocationID: number;
    public PeppolAddress: string;
    public CurrencyCodeID: number;
    public DimensionsID: number;
    public SubAccountNumberSeriesID: number;
    public UpdatedAt: Date;
    public BusinessRelationID: number;
    public SelfEmployed: boolean;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreditDays: number;
    public SupplierNumber: number;
    public WebUrl: string;
    public OrgNumber: string;
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
    public Description: string;
    public Deleted: boolean;
    public ID: number;
    public StatusCode: number;
    public Name: string;
    public TermsType: TermsType;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CreditDays: number;
    public _createguid: string;
    public CustomFields: any;
}


export class TOFCurrencySettings extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'TOFCurrencySettings';

    public CreatedAt: Date;
    public Deleted: boolean;
    public UpdateCurrencyAmountsOnQuoteToInvoice: boolean;
    public ID: number;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdateCurrencyAmountsOnQuotedateChange: boolean;
    public UpdateCurrencyAmountsOnInvoicedateChange: boolean;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UpdateCurrencyAmountsOnQuoteToOrder: boolean;
    public UpdateCurrencyAmountsOnOrderToInvoice: boolean;
    public UpdateCurrencyAmountsOnOrderdateChange: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class Address extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Address';

    public CreatedAt: Date;
    public AddressLine2: string;
    public Deleted: boolean;
    public ID: number;
    public StatusCode: number;
    public Country: string;
    public CountryCode: string;
    public UpdatedAt: Date;
    public BusinessRelationID: number;
    public City: string;
    public AddressLine1: string;
    public UpdatedBy: string;
    public PostalCode: string;
    public CreatedBy: string;
    public AddressLine3: string;
    public Region: string;
    public _createguid: string;
    public BusinessRelation: BusinessRelation;
    public CustomFields: any;
}


export class BusinessRelation extends UniEntity {
    public static RelativeUrl = 'business-relations';
    public static EntityType = 'BusinessRelation';

    public CreatedAt: Date;
    public Deleted: boolean;
    public ID: number;
    public StatusCode: number;
    public Name: string;
    public ShippingAddressID: number;
    public DefaultEmailID: number;
    public UpdatedAt: Date;
    public DefaultContactID: number;
    public DefaultBankAccountID: number;
    public InvoiceAddressID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public DefaultPhoneID: number;
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

    public Role: string;
    public CreatedAt: Date;
    public Deleted: boolean;
    public ID: number;
    public StatusCode: number;
    public Comment: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public InfoID: number;
    public ParentBusinessRelationID: number;
    public _createguid: string;
    public ParentBusinessRelation: BusinessRelation;
    public Info: BusinessRelation;
    public CustomFields: any;
}


export class Email extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Email';

    public CreatedAt: Date;
    public Description: string;
    public Deleted: boolean;
    public ID: number;
    public StatusCode: number;
    public EmailAddress: string;
    public UpdatedAt: Date;
    public BusinessRelationID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Type: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Phone extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Phone';

    public CreatedAt: Date;
    public Description: string;
    public Deleted: boolean;
    public ID: number;
    public StatusCode: number;
    public Number: string;
    public CountryCode: string;
    public UpdatedAt: Date;
    public BusinessRelationID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Type: PhoneTypeEnum;
    public _createguid: string;
    public CustomFields: any;
}


export class AGACalculation extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AGACalculation';

    public CreatedAt: Date;
    public Deleted: boolean;
    public ID: number;
    public StatusCode: number;
    public DimensionsID: number;
    public UpdatedAt: Date;
    public PayrollRunID: number;
    public UpdatedBy: string;
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

    public CreatedAt: Date;
    public Deleted: boolean;
    public ID: number;
    public StatusCode: number;
    public UpdatedAt: Date;
    public AGACalculationID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public SubEntityID: number;
    public freeAmount: number;
    public _createguid: string;
    public subEntity: SubEntity;
    public CustomFields: any;
}


export class AGATax extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AGATax';

    public CreatedAt: Date;
    public Deleted: boolean;
    public ID: number;
    public StatusCode: number;
    public AGARateID: number;
    public UpdatedAt: Date;
    public AGACalculationID: number;
    public agaBase: number;
    public beregningsKode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public agaRate: number;
    public SubEntityID: number;
    public zone: number;
    public _createguid: string;
    public zoneName: string;
    public municipalityName: string;
    public subEntity: SubEntity;
    public CustomFields: any;
}


export class AGAPension extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AGAPension';

    public CreatedAt: Date;
    public Deleted: boolean;
    public ID: number;
    public StatusCode: number;
    public AGARateID: number;
    public UpdatedAt: Date;
    public AGACalculationID: number;
    public agaBase: number;
    public beregningsKode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public agaRate: number;
    public SubEntityID: number;
    public zone: number;
    public _createguid: string;
    public zoneName: string;
    public municipalityName: string;
    public subEntity: SubEntity;
    public CustomFields: any;
}


export class AGADraw extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AGADraw';

    public CreatedAt: Date;
    public Deleted: boolean;
    public ID: number;
    public StatusCode: number;
    public AGARateID: number;
    public UpdatedAt: Date;
    public AGACalculationID: number;
    public agaBase: number;
    public beregningsKode: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public agaRate: number;
    public SubEntityID: number;
    public zone: number;
    public _createguid: string;
    public zoneName: string;
    public municipalityName: string;
    public subEntity: SubEntity;
    public CustomFields: any;
}


export class ForeignerWithPercent extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ForeignerWithPercent';

    public CreatedAt: Date;
    public Deleted: boolean;
    public ID: number;
    public StatusCode: number;
    public UpdatedAt: Date;
    public AGACalculationID: number;
    public agaBase: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public agaRate: number;
    public SubEntityID: number;
    public _createguid: string;
    public zoneName: string;
    public municipalityName: string;
    public subEntity: SubEntity;
    public CustomFields: any;
}


export class DrawForeignerWithPercent extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'DrawForeignerWithPercent';

    public CreatedAt: Date;
    public Deleted: boolean;
    public ID: number;
    public StatusCode: number;
    public UpdatedAt: Date;
    public AGACalculationID: number;
    public agaBase: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public agaRate: number;
    public SubEntityID: number;
    public _createguid: string;
    public zoneName: string;
    public municipalityName: string;
    public subEntity: SubEntity;
    public CustomFields: any;
}


export class ForeignerWithAmount extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ForeignerWithAmount';

    public CreatedAt: Date;
    public Deleted: boolean;
    public ID: number;
    public persons: number;
    public StatusCode: number;
    public UpdatedAt: Date;
    public AGACalculationID: number;
    public aga: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public SubEntityID: number;
    public _createguid: string;
    public zoneName: string;
    public municipalityName: string;
    public subEntity: SubEntity;
    public CustomFields: any;
}


export class TaxAndAgaSums extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'TaxAndAgaSums';

    public CreatedAt: Date;
    public Deleted: boolean;
    public ID: number;
    public FinancialTax: number;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public WithholdingTax: number;
    public GarnishmentTax: number;
    public _createguid: string;
    public CustomFields: any;
}


export class AmeldingData extends UniEntity {
    public static RelativeUrl = 'amelding';
    public static EntityType = 'AmeldingData';

    public CreatedAt: Date;
    public altinnStatus: string;
    public attachmentFileID: number;
    public Deleted: boolean;
    public feedbackFileID: number;
    public messageID: string;
    public ID: number;
    public mainFileID: number;
    public StatusCode: number;
    public year: number;
    public initiated: Date;
    public OppgaveHash: string;
    public created: Date;
    public UpdatedAt: Date;
    public PayrollRunID: number;
    public period: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public receiptID: number;
    public status: number;
    public replacesID: number;
    public type: AmeldingType;
    public sent: Date;
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
    public registry: SalaryRegistry;
    public Deleted: boolean;
    public AmeldingsID: number;
    public ID: number;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public key: number;
    public _createguid: string;
    public CustomFields: any;
}


export class BasicAmount extends UniEntity {
    public static RelativeUrl = 'basicamounts';
    public static EntityType = 'BasicAmount';

    public CreatedAt: Date;
    public Deleted: boolean;
    public BasicAmountPrYear: number;
    public ID: number;
    public StatusCode: number;
    public ConversionFactor: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public AveragePrYear: number;
    public BasicAmountPrMonth: number;
    public FromDate: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class CompanySalary extends UniEntity {
    public static RelativeUrl = 'companysalary';
    public static EntityType = 'CompanySalary';

    public CreatedAt: Date;
    public OtpExportActive: boolean;
    public PaycheckZipReportID: number;
    public Deleted: boolean;
    public RateFinancialTax: number;
    public ID: number;
    public MainAccountCostAGA: number;
    public Base_NettoPayment: boolean;
    public MainAccountCostFinancial: number;
    public MainAccountAllocatedVacation: number;
    public MainAccountCostVacation: number;
    public WageDeductionDueToHoliday: WageDeductionDueToHolidayType;
    public StatusCode: number;
    public InterrimRemitAccount: number;
    public Base_SpesialDeductionForMaritim: boolean;
    public MainAccountAllocatedAGAVacation: number;
    public Base_Svalbard: boolean;
    public Base_JanMayenAndBiCountries: boolean;
    public MainAccountAllocatedFinancial: number;
    public MainAccountAllocatedFinancialVacation: number;
    public UpdatedAt: Date;
    public PostGarnishmentToTaxAccount: boolean;
    public CalculateFinancialTax: boolean;
    public HourFTEs: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public WagetypeAdvancePaymentAuto: number;
    public AllowOver6G: boolean;
    public MainAccountAllocatedAGA: number;
    public PaymentInterval: CompanySalaryPaymentInterval;
    public Base_TaxFreeOrganization: boolean;
    public MainAccountCostFinancialVacation: number;
    public Base_PayAsYouEarnTaxOnPensions: boolean;
    public HoursPerMonth: number;
    public PostToTaxDraw: boolean;
    public WagetypeAdvancePayment: number;
    public MainAccountCostAGAVacation: number;
    public FreeAmount: number;
    public Base_NettoPaymentForMaritim: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class CompanyVacationRate extends UniEntity {
    public static RelativeUrl = 'companyvacationrates';
    public static EntityType = 'CompanyVacationRate';

    public CreatedAt: Date;
    public Deleted: boolean;
    public ID: number;
    public StatusCode: number;
    public Rate: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Rate60: number;
    public CreatedBy: string;
    public FromDate: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class EmployeeCategory extends UniEntity {
    public static RelativeUrl = 'employeecategories';
    public static EntityType = 'EmployeeCategory';

    public CreatedAt: Date;
    public Deleted: boolean;
    public ID: number;
    public StatusCode: number;
    public Name: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public EmployeeCategoryLinkID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class EmployeeCategoryLink extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'EmployeeCategoryLink';

    public CreatedAt: Date;
    public Deleted: boolean;
    public ID: number;
    public EmployeeID: number;
    public StatusCode: number;
    public EmployeeNumber: number;
    public EmployeeCategoryID: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public EmployeeCategory: EmployeeCategory;
    public Employee: Employee;
    public CustomFields: any;
}


export class Employee extends UniEntity {
    public static RelativeUrl = 'employees';
    public static EntityType = 'Employee';

    public CreatedAt: Date;
    public Deleted: boolean;
    public UserID: number;
    public EmploymentDateOtp: LocalDate;
    public BirthDate: Date;
    public ID: number;
    public EmploymentDate: Date;
    public MunicipalityNo: string;
    public IncludeOtpUntilYear: number;
    public StatusCode: number;
    public InternationalID: string;
    public EmployeeNumber: number;
    public UpdatedAt: Date;
    public EndDateOtp: LocalDate;
    public IncludeOtpUntilMonth: number;
    public OtpExport: boolean;
    public BusinessRelationID: number;
    public Active: boolean;
    public EmployeeLanguageID: number;
    public ForeignWorker: ForeignWorker;
    public PhotoID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Sex: GenderEnum;
    public PaymentInterval: PaymentInterval;
    public AdvancePaymentAmount: number;
    public FreeText: string;
    public SubEntityID: number;
    public InternasjonalIDType: InternationalIDType;
    public InternasjonalIDCountry: string;
    public SocialSecurityNumber: string;
    public OtpStatus: OtpStatus;
    public TypeOfPaymentOtp: TypeOfPaymentOtp;
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

    public CreatedAt: Date;
    public loennTilUtenrikstjenestemannID: number;
    public Deleted: boolean;
    public IssueDate: Date;
    public ID: number;
    public SecondaryPercent: number;
    public Tilleggsopplysning: string;
    public EmployeeID: number;
    public StatusCode: number;
    public ResultatStatus: string;
    public loennFraBiarbeidsgiverID: number;
    public EmployeeNumber: number;
    public NotMainEmployer: boolean;
    public Year: number;
    public UpdatedAt: Date;
    public loennKunTrygdeavgiftTilUtenlandskBorgerID: number;
    public SecondaryTable: string;
    public loennKunTrygdeavgiftTilUtenlandskBorgerSomGrensegjengerID: number;
    public Percent: number;
    public NonTaxableAmount: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public pensjonID: number;
    public TaxcardId: number;
    public Table: string;
    public loennFraHovedarbeidsgiverID: number;
    public ufoereYtelserAndreID: number;
    public SKDXml: string;
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

    public CreatedAt: Date;
    public Deleted: boolean;
    public ID: number;
    public UpdatedAt: Date;
    public freeAmountType: FreeAmountType;
    public Percent: number;
    public NonTaxableAmount: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Table: string;
    public AntallMaanederForTrekk: number;
    public tabellType: TabellType;
    public _createguid: string;
    public CustomFields: any;
}


export class EmployeeLeave extends UniEntity {
    public static RelativeUrl = 'EmployeeLeave';
    public static EntityType = 'EmployeeLeave';

    public CreatedAt: Date;
    public Description: string;
    public Deleted: boolean;
    public LeavePercent: number;
    public ID: number;
    public AffectsOtp: boolean;
    public EmploymentID: number;
    public StatusCode: number;
    public LeaveType: Leavetype;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public ToDate: Date;
    public FromDate: Date;
    public _createguid: string;
    public Employment: Employment;
    public CustomFields: any;
}


export class Employment extends UniEntity {
    public static RelativeUrl = 'employments';
    public static EntityType = 'Employment';

    public CreatedAt: Date;
    public LedgerAccount: string;
    public Deleted: boolean;
    public JobName: string;
    public PayGrade: string;
    public ID: number;
    public LastSalaryChangeDate: Date;
    public TradeArea: ShipTradeArea;
    public WorkingHoursScheme: WorkingHoursScheme;
    public EmployeeID: number;
    public EmploymentType: EmploymentType;
    public StatusCode: number;
    public EmployeeNumber: number;
    public JobCode: string;
    public SeniorityDate: Date;
    public DimensionsID: number;
    public RegulativeStepNr: number;
    public UserDefinedRate: number;
    public ShipType: ShipTypeOfShip;
    public UpdatedAt: Date;
    public RemunerationType: RemunerationType;
    public EndDateReason: EndDateReason;
    public WorkPercent: number;
    public Standard: boolean;
    public ShipReg: ShipRegistry;
    public UpdatedBy: string;
    public CreatedBy: string;
    public EndDate: Date;
    public HourRate: number;
    public LastWorkPercentChangeDate: Date;
    public StartDate: Date;
    public SubEntityID: number;
    public TypeOfEmployment: TypeOfEmployment;
    public MonthRate: number;
    public HoursPerWeek: number;
    public RegulativeGroupID: number;
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
    public Description: string;
    public Deleted: boolean;
    public ID: number;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public SubentityID: number;
    public Amount: number;
    public FromDate: Date;
    public AffectsAGA: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class OtpExportWagetype extends UniEntity {
    public static RelativeUrl = 'otpexportwagetypes';
    public static EntityType = 'OtpExportWagetype';

    public CreatedAt: Date;
    public Deleted: boolean;
    public ID: number;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public WageTypeNumber: number;
    public _createguid: string;
    public CustomFields: any;
}


export class PayrollRun extends UniEntity {
    public static RelativeUrl = 'payrollrun';
    public static EntityType = 'PayrollRun';

    public CreatedAt: Date;
    public Description: string;
    public Deleted: boolean;
    public PayDate: Date;
    public ID: number;
    public StatusCode: number;
    public JournalEntryNumber: string;
    public SettlementDate: Date;
    public PaycheckFileID: number;
    public needsRecalc: boolean;
    public UpdatedAt: Date;
    public ExcludeRecurringPosts: boolean;
    public HolidayPayDeduction: boolean;
    public AGAFreeAmount: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public FreeText: string;
    public ToDate: Date;
    public taxdrawfactor: TaxDrawFactor;
    public AGAonRun: number;
    public FromDate: Date;
    public _createguid: string;
    public transactions: Array<SalaryTransaction>;
    public agacalculation: Array<AGACalculation>;
    public CustomFields: any;
}


export class PayrollRunCategoryLink extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'PayrollRunCategoryLink';

    public CreatedAt: Date;
    public Deleted: boolean;
    public ID: number;
    public StatusCode: number;
    public EmployeeCategoryID: number;
    public UpdatedAt: Date;
    public PayrollRunID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public EmployeeCategory: EmployeeCategory;
    public PayrollRun: PayrollRun;
    public CustomFields: any;
}


export class PostingSummaryDraft extends UniEntity {
    public PayrollID: number;
    public ID: number;
    public draftWithDimsOnBalance: string;
    public draftBasic: string;
    public JobInfoID: number;
    public statusTime: Date;
    public status: SummaryJobStatus;
    public draftWithDims: string;
}


export class Regulative extends UniEntity {
    public static RelativeUrl = 'regulatives';
    public static EntityType = 'Regulative';

    public CreatedAt: Date;
    public Deleted: boolean;
    public ID: number;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public StartDate: LocalDate;
    public RegulativeGroupID: number;
    public _createguid: string;
    public Steps: Array<RegulativeStep>;
    public CustomFields: any;
}


export class RegulativeGroup extends UniEntity {
    public static RelativeUrl = 'regulativegroups';
    public static EntityType = 'RegulativeGroup';

    public CreatedAt: Date;
    public Deleted: boolean;
    public ID: number;
    public StatusCode: number;
    public Name: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public Regulatives: Array<Regulative>;
    public CustomFields: any;
}


export class RegulativeStep extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'RegulativeStep';

    public CreatedAt: Date;
    public Deleted: boolean;
    public ID: number;
    public StatusCode: number;
    public UpdatedAt: Date;
    public RegulativeID: number;
    public Step: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Amount: number;
    public _createguid: string;
    public CustomFields: any;
}


export class SalaryBalance extends UniEntity {
    public static RelativeUrl = 'salarybalances';
    public static EntityType = 'SalaryBalance';

    public CreatedAt: Date;
    public CreatePayment: boolean;
    public Deleted: boolean;
    public Source: SalBalSource;
    public ID: number;
    public MaxAmount: number;
    public EmployeeID: number;
    public EmploymentID: number;
    public StatusCode: number;
    public Name: string;
    public SalaryBalanceTemplateID: number;
    public UpdatedAt: Date;
    public MinAmount: number;
    public UpdatedBy: string;
    public InstalmentPercent: number;
    public CreatedBy: string;
    public Instalment: number;
    public ToDate: Date;
    public KID: string;
    public InstalmentType: SalBalType;
    public FromDate: Date;
    public Type: SalBalDrawType;
    public SupplierID: number;
    public WageTypeNumber: number;
    public _createguid: string;
    public Balance: number;
    public CalculatedBalance: number;
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

    public CreatedAt: Date;
    public Description: string;
    public Deleted: boolean;
    public ID: number;
    public StatusCode: number;
    public SalaryBalanceID: number;
    public UpdatedAt: Date;
    public SalaryTransactionID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Date: LocalDate;
    public Amount: number;
    public _createguid: string;
    public SalaryTransaction: SalaryTransaction;
    public SalaryBalance: SalaryBalance;
    public CustomFields: any;
}


export class SalaryBalanceTemplate extends UniEntity {
    public static RelativeUrl = 'salarybalancetemplates';
    public static EntityType = 'SalaryBalanceTemplate';

    public CreatedAt: Date;
    public CreatePayment: boolean;
    public Deleted: boolean;
    public ID: number;
    public MaxAmount: number;
    public StatusCode: number;
    public Name: string;
    public UpdatedAt: Date;
    public MinAmount: number;
    public SalarytransactionDescription: string;
    public Account: number;
    public UpdatedBy: string;
    public InstalmentPercent: number;
    public CreatedBy: string;
    public Instalment: number;
    public KID: string;
    public InstalmentType: SalBalType;
    public SupplierID: number;
    public WageTypeNumber: number;
    public _createguid: string;
    public Supplier: Supplier;
    public SalaryBalances: Array<SalaryBalance>;
    public CustomFields: any;
}


export class SalaryTransaction extends UniEntity {
    public static RelativeUrl = 'salarytrans';
    public static EntityType = 'SalaryTransaction';

    public CreatedAt: Date;
    public ChildSalaryTransactionID: number;
    public calcAGA: number;
    public Sum: number;
    public Deleted: boolean;
    public Text: string;
    public IsRecurringPost: boolean;
    public VatTypeID: number;
    public ID: number;
    public TaxbasisID: number;
    public MunicipalityNo: string;
    public EmployeeID: number;
    public EmploymentID: number;
    public StatusCode: number;
    public Rate: number;
    public EmployeeNumber: number;
    public SystemType: StdSystemType;
    public recurringPostValidTo: Date;
    public DimensionsID: number;
    public SalaryBalanceID: number;
    public UpdatedAt: Date;
    public HolidayPayDeduction: boolean;
    public RecurringID: number;
    public PayrollRunID: number;
    public Account: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public WageTypeID: number;
    public recurringPostValidFrom: Date;
    public ToDate: Date;
    public Amount: number;
    public FromDate: Date;
    public WageTypeNumber: number;
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
    public ValueMoney: number;
    public Deleted: boolean;
    public ID: number;
    public ValueDate: Date;
    public ValueDate2: Date;
    public StatusCode: number;
    public ValueBool: boolean;
    public WageTypeSupplementID: number;
    public UpdatedAt: Date;
    public SalaryTransactionID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public ValueString: string;
    public _createguid: string;
    public WageTypeSupplement: WageTypeSupplement;
    public CustomFields: any;
}


export class SalaryYear extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'SalaryYear';

    public CreatedAt: Date;
    public Deleted: boolean;
    public ID: number;
    public CurrentYear: number;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class SubEntity extends UniEntity {
    public static RelativeUrl = 'subentities';
    public static EntityType = 'SubEntity';

    public CreatedAt: Date;
    public Deleted: boolean;
    public AgaZone: number;
    public ID: number;
    public MunicipalityNo: string;
    public StatusCode: number;
    public UpdatedAt: Date;
    public BusinessRelationID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public SuperiorOrganizationID: number;
    public AgaRule: number;
    public OrgNumber: string;
    public freeAmount: number;
    public _createguid: string;
    public BusinessRelationInfo: BusinessRelation;
    public SuperiorOrganization: SubEntity;
    public CustomFields: any;
}


export class TaxBasis extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'TaxBasis';

    public CreatedAt: Date;
    public Deleted: boolean;
    public ForeignCitizenInsuranceBasis: number;
    public ID: number;
    public DisabilityOtherBasis: number;
    public JanMayenBasis: number;
    public StatusCode: number;
    public SailorBasis: number;
    public UpdatedAt: Date;
    public ForeignBorderCommuterBasis: number;
    public SalaryTransactionID: number;
    public Basis: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public PensionBasis: number;
    public SvalbardBasis: number;
    public PensionSourcetaxBasis: number;
    public _createguid: string;
    public CustomFields: any;
}


export class Travel extends UniEntity {
    public static RelativeUrl = 'travels';
    public static EntityType = 'Travel';

    public CreatedAt: Date;
    public Purpose: string;
    public Description: string;
    public Deleted: boolean;
    public ID: number;
    public StatusCode: number;
    public Name: string;
    public Comment: string;
    public EmployeeNumber: number;
    public TravelIdentificator: string;
    public DimensionsID: number;
    public State: state;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Phone: string;
    public PersonID: string;
    public Email: string;
    public SourceSystem: string;
    public SupplierID: number;
    public AdvanceAmount: number;
    public _createguid: string;
    public TravelLines: Array<TravelLine>;
    public Dimensions: Dimensions;
    public CustomFields: any;
}


export class TravelLine extends UniEntity {
    public static RelativeUrl = 'travellines';
    public static EntityType = 'TravelLine';

    public CreatedAt: Date;
    public Description: string;
    public Deleted: boolean;
    public VatTypeID: number;
    public ID: number;
    public InvoiceAccount: number;
    public From: Date;
    public CostType: costtype;
    public StatusCode: number;
    public Rate: number;
    public AccountNumber: number;
    public TravelIdentificator: string;
    public DimensionsID: number;
    public paytransID: number;
    public UpdatedAt: Date;
    public TravelID: number;
    public To: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public LineState: linestate;
    public TypeID: number;
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

    public CreatedAt: Date;
    public Description: string;
    public Deleted: boolean;
    public ID: number;
    public InvoiceAccount: number;
    public StatusCode: number;
    public UpdatedAt: Date;
    public ForeignTypeID: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public ForeignDescription: string;
    public WageTypeNumber: number;
    public _createguid: string;
    public CustomFields: any;
}


export class VacationPayLine extends UniEntity {
    public static RelativeUrl = 'VacationPayLines';
    public static EntityType = 'VacationPayLine';

    public CreatedAt: Date;
    public Deleted: boolean;
    public ID: number;
    public ManualVacationPayBase: number;
    public EmployeeID: number;
    public StatusCode: number;
    public Year: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public PaidVacationPay: number;
    public _createguid: string;
    public Rate: number;
    public SystemVacationPayBase: number;
    public VacationPay60: number;
    public MissingEarlierVacationPay: number;
    public Age: number;
    public Rate60: number;
    public PaidTaxFreeVacationPay: number;
    public Withdrawal: number;
    public VacationPay: number;
    public Employee: Employee;
    public CustomFields: any;
}


export class VacationRateEmployee extends UniEntity {
    public static RelativeUrl = 'employeevacationrates';
    public static EntityType = 'VacationRateEmployee';

    public CreatedAt: Date;
    public Deleted: boolean;
    public ID: number;
    public EmployeeID: number;
    public StatusCode: number;
    public Rate: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Rate60: number;
    public CreatedBy: string;
    public EndDate: Date;
    public StartDate: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class WageType extends UniEntity {
    public static RelativeUrl = 'wagetypes';
    public static EntityType = 'WageType';

    public CreatedAt: Date;
    public Limit_value: number;
    public Description: string;
    public RateFactor: number;
    public Deleted: boolean;
    public GetRateFrom: GetRateFrom;
    public FixedSalaryHolidayDeduction: boolean;
    public Base_EmploymentTax: boolean;
    public ID: number;
    public IncomeType: string;
    public SpecialAgaRule: SpecialAgaRule;
    public Benefit: string;
    public StatusCode: number;
    public WageTypeName: string;
    public Rate: number;
    public Base_div2: boolean;
    public SupplementPackage: string;
    public Systemtype: string;
    public Postnr: string;
    public AccountNumber: number;
    public Base_Vacation: boolean;
    public UpdatedAt: Date;
    public HideFromPaycheck: boolean;
    public UpdatedBy: string;
    public Limit_type: LimitType;
    public RatetypeColumn: RateTypeColumn;
    public CreatedBy: string;
    public Base_div3: boolean;
    public ValidYear: number;
    public SpecialTaxHandling: string;
    public StandardWageTypeFor: StdWageType;
    public Limit_newRate: number;
    public SpecialTaxAndContributionsRule: SpecialTaxAndContributionsRule;
    public NoNumberOfHours: boolean;
    public taxtype: TaxType;
    public DaysOnBoard: boolean;
    public AccountNumber_balance: number;
    public SystemRequiredWageType: number;
    public Base_Payment: boolean;
    public Limit_WageTypeNumber: number;
    public WageTypeNumber: number;
    public _createguid: string;
    public SupplementaryInformations: Array<WageTypeSupplement>;
    public CustomFields: any;
}


export class WageTypeSupplement extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'WageTypeSupplement';

    public CreatedAt: Date;
    public ameldingType: string;
    public Description: string;
    public Deleted: boolean;
    public ID: number;
    public StatusCode: number;
    public Name: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public GetValueFromTrans: boolean;
    public WageTypeID: number;
    public SuggestedValue: string;
    public ValueType: Valuetype;
    public _createguid: string;
    public CustomFields: any;
}


export class WageTypeTranslation extends UniEntity {
    public static RelativeUrl = 'wagetypetranslations';
    public static EntityType = 'WageTypeTranslation';

    public CreatedAt: Date;
    public Deleted: boolean;
    public ID: number;
    public StatusCode: number;
    public WageTypeName: string;
    public UpdatedAt: Date;
    public EmployeeLanguageID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public WageTypeNumber: number;
    public _createguid: string;
    public EmployeeLanguage: EmployeeLanguage;
    public CustomFields: any;
}


export class PensionScheme extends UniEntity {
    public static RelativeUrl = 'pensionschemes';
    public static EntityType = 'PensionScheme';

    public CreatedAt: Date;
    public Identificator: string;
    public Deleted: boolean;
    public ID: number;
    public StatusCode: number;
    public Year: number;
    public UpdatedAt: Date;
    public Period: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class PensionSchemeSupplier extends UniEntity {
    public static RelativeUrl = 'pensionschemesuppliers';
    public static EntityType = 'PensionSchemeSupplier';

    public CreatedAt: Date;
    public Identificator: string;
    public Deleted: boolean;
    public ID: number;
    public StatusCode: number;
    public Name: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class StandardPensionSchemeSupplier extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'StandardPensionSchemeSupplier';

    public CreatedAt: Date;
    public Identificator: string;
    public Deleted: boolean;
    public ID: number;
    public Name: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class EmployeeLanguage extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'EmployeeLanguage';

    public CreatedAt: Date;
    public Deleted: boolean;
    public ID: number;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public LanguageCode: string;
    public _createguid: string;
    public CustomFields: any;
}


export class ComponentLayout extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ComponentLayout';

    public CreatedAt: Date;
    public Deleted: boolean;
    public ID: number;
    public StatusCode: number;
    public Name: string;
    public UpdatedAt: Date;
    public BaseEntity: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public Fields: Array<FieldLayout>;
    public CustomFields: any;
}


export class FieldLayout extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'FieldLayout';

    public CreatedAt: Date;
    public HelpText: string;
    public LookupField: boolean;
    public Description: string;
    public Deleted: boolean;
    public ReadOnly: boolean;
    public ComponentLayoutID: number;
    public Hidden: boolean;
    public ID: number;
    public EntityType: string;
    public StatusCode: number;
    public Placement: number;
    public Placeholder: string;
    public Width: string;
    public Section: number;
    public Alignment: Alignment;
    public DisplayField: string;
    public UpdatedAt: Date;
    public Label: string;
    public Sectionheader: string;
    public LineBreak: boolean;
    public FieldSet: number;
    public UpdatedBy: string;
    public Property: string;
    public CreatedBy: string;
    public Combo: number;
    public Legend: string;
    public FieldType: FieldType;
    public Options: string;
    public _createguid: string;
    public CustomFields: any;
}


export class CurrencyOverride extends UniEntity {
    public static RelativeUrl = 'currencyoverrides';
    public static EntityType = 'CurrencyOverride';

    public CreatedAt: Date;
    public FromCurrencyCodeID: number;
    public ExchangeRate: number;
    public Deleted: boolean;
    public Source: CurrencySourceEnum;
    public ID: number;
    public ToCurrencyCodeID: number;
    public Factor: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
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

    public CreatedAt: Date;
    public Deleted: boolean;
    public ID: number;
    public FromAccountNumber: number;
    public UpdatedAt: Date;
    public ToAccountNumber: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public AssetGroupCode: string;
    public _createguid: string;
    public CustomFields: any;
}


export class AccountGroupSetup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AccountGroupSetup';

    public CreatedAt: Date;
    public Deleted: boolean;
    public ID: number;
    public ExternalReference: string;
    public PlanType: PlanTypeEnum;
    public Name: string;
    public ParentID: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public Parent: AccountGroupSetup;
    public CustomFields: any;
}


export class AccountSetup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AccountSetup';

    public CreatedAt: Date;
    public Deleted: boolean;
    public ID: number;
    public PlanType: PlanTypeEnum;
    public AccountName: string;
    public AccountGroupSetupID: number;
    public AccountNumber: number;
    public Visible: boolean;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public ExpectedDebitBalance: boolean;
    public VatCode: string;
    public SaftMappingAccountID: number;
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
    public ID: number;
    public Name: string;
    public UpdatedAt: Date;
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

    public CreatedAt: Date;
    public Deleted: boolean;
    public ID: number;
    public AccountVisibilityGroupID: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public AccountSetupID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class AGARate extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AGARate';

    public CreatedAt: Date;
    public Deleted: boolean;
    public RateValidFrom: Date;
    public ID: number;
    public Rate: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public ZoneID: number;
    public _createguid: string;
    public sector: Array<AGASector>;
    public CustomFields: any;
}


export class AGASector extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AGASector';

    public CreatedAt: Date;
    public SectorID: number;
    public Deleted: boolean;
    public ID: number;
    public Rate: number;
    public ValidFrom: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Sector: string;
    public RateID: number;
    public freeAmount: number;
    public _createguid: string;
    public CustomFields: any;
}


export class AGAZone extends UniEntity {
    public static RelativeUrl = 'AGAZones';
    public static EntityType = 'AGAZone';

    public CreatedAt: Date;
    public Deleted: boolean;
    public ID: number;
    public ZoneName: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public rates: Array<AGARate>;
    public municipalsOnZone: Array<MunicipalAGAZone>;
    public CustomFields: any;
}


export class Agreement extends UniEntity {
    public static RelativeUrl = 'agreements';
    public static EntityType = 'Agreement';

    public CreatedAt: Date;
    public Deleted: boolean;
    public ID: number;
    public AppliesTo: number;
    public Name: string;
    public ValidFrom: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Template: string;
    public _createguid: string;
    public CustomFields: any;
}


export class AssetGroup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AssetGroup';

    public CreatedAt: Date;
    public Deleted: boolean;
    public ID: number;
    public DepreciationAccountNumber: number;
    public DepreciationRate: number;
    public Name: string;
    public DepreciationYears: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Code: string;
    public CreatedBy: string;
    public ToDate: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class BankIdentifierCode extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'BankIdentifierCode';

    public CreatedAt: Date;
    public Deleted: boolean;
    public ID: number;
    public Bic: string;
    public BankIdentifier: string;
    public BankName: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class CompanyType extends UniEntity {
    public static RelativeUrl = 'companytypes';
    public static EntityType = 'CompanyType';

    public CreatedAt: Date;
    public Description: string;
    public Deleted: boolean;
    public FullName: string;
    public ID: number;
    public Name: string;
    public DefaultPlanType: PlanTypeEnum;
    public UpdatedAt: Date;
    public DefaultAccountVisibilityGroupID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Priority: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class Confirmation extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Confirmation';

    public CreatedAt: Date;
    public Deleted: boolean;
    public ID: number;
    public StatusCode: number;
    public SignUpReferrer: string;
    public ExpirationDate: Date;
    public DisplayName: string;
    public CompanyName: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public PostalCode: string;
    public Code: string;
    public ContractType: string;
    public CreatedBy: string;
    public Phone: string;
    public Email: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Country extends UniEntity {
    public static RelativeUrl = 'countries';
    public static EntityType = 'Country';

    public CreatedAt: Date;
    public Deleted: boolean;
    public ID: number;
    public Name: string;
    public CountryCode: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CurrencyRateSource: string;
    public CreatedBy: string;
    public DefaultCurrencyCode: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Currency extends UniEntity {
    public static RelativeUrl = 'currencies';
    public static EntityType = 'Currency';

    public CreatedAt: Date;
    public CurrencyDate: LocalDate;
    public FromCurrencyCodeID: number;
    public ExchangeRate: number;
    public Deleted: boolean;
    public Source: CurrencySourceEnum;
    public ID: number;
    public ToCurrencyCodeID: number;
    public Factor: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public FromCurrencyCode: CurrencyCode;
    public ToCurrencyCode: CurrencyCode;
    public CustomFields: any;
}


export class CurrencyCode extends UniEntity {
    public static RelativeUrl = 'currencycodes';
    public static EntityType = 'CurrencyCode';

    public CreatedAt: Date;
    public Description: string;
    public Deleted: boolean;
    public ID: number;
    public Name: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Code: string;
    public CreatedBy: string;
    public ShortCode: string;
    public _createguid: string;
    public CustomFields: any;
}


export class DebtCollectionAutomation extends UniEntity {
    public static RelativeUrl = 'debtcollectionautomation';
    public static EntityType = 'DebtCollectionAutomation';

    public CreatedAt: Date;
    public Description: string;
    public Deleted: boolean;
    public ID: number;
    public Name: string;
    public UpdatedAt: Date;
    public DebtCollectionSettingsID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public DebtCollectionSettings: DebtCollectionSettings;
    public CustomFields: any;
}


export class EmploymentValidValues extends UniEntity {
    public static RelativeUrl = 'employmentvalidvalues';
    public static EntityType = 'EmploymentValidValues';

    public CreatedAt: Date;
    public employment: TypeOfEmployment;
    public PaymentType: RemunerationType;
    public Deleted: boolean;
    public JobName: boolean;
    public ID: number;
    public LastSalaryChangeDate: boolean;
    public TradeArea: boolean;
    public WorkingHoursScheme: boolean;
    public JobCode: boolean;
    public SeniorityDate: boolean;
    public UserDefinedRate: boolean;
    public ShipType: boolean;
    public UpdatedAt: Date;
    public RemunerationType: boolean;
    public WorkPercent: boolean;
    public ShipReg: boolean;
    public UpdatedBy: string;
    public CreatedBy: string;
    public EndDate: boolean;
    public HourRate: boolean;
    public StartDate: boolean;
    public LastWorkPercentChange: boolean;
    public typeOfEmployment: boolean;
    public MonthRate: boolean;
    public HoursPerWeek: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class FinancialDeadline extends UniEntity {
    public static RelativeUrl = 'deadlines';
    public static EntityType = 'FinancialDeadline';

    public CreatedAt: Date;
    public Deleted: boolean;
    public Deadline: LocalDate;
    public ID: number;
    public AdditionalInfo: string;
    public StatusCode: number;
    public Name: string;
    public PassableDueDate: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Type: FinancialDeadlineType;
    public _createguid: string;
    public CustomFields: any;
}


export class LanguageCode extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'LanguageCode';

    public CreatedAt: Date;
    public Deleted: boolean;
    public ID: number;
    public Name: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Code: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Municipal extends UniEntity {
    public static RelativeUrl = 'Municipals';
    public static EntityType = 'Municipal';

    public CreatedAt: Date;
    public Deleted: boolean;
    public ID: number;
    public MunicipalityNo: string;
    public CountyNo: string;
    public Retired: boolean;
    public UpdatedAt: Date;
    public CountyName: string;
    public MunicipalityName: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class MunicipalAGAZone extends UniEntity {
    public static RelativeUrl = 'MunicipalAGAZones';
    public static EntityType = 'MunicipalAGAZone';

    public CreatedAt: Date;
    public Deleted: boolean;
    public ID: number;
    public MunicipalityNo: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Startdate: Date;
    public ZoneID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class PaymentBatchType extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'PaymentBatchType';

    public CreatedAt: Date;
    public Description: string;
    public Deleted: boolean;
    public ID: number;
    public Name: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Code: number;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class PaymentCode extends UniEntity {
    public static RelativeUrl = 'paymentCodes';
    public static EntityType = 'PaymentCode';

    public CreatedAt: Date;
    public Description: string;
    public Deleted: boolean;
    public ID: number;
    public Name: string;
    public PaymentGroup: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Code: number;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class PostalCode extends UniEntity {
    public static RelativeUrl = 'postalcodes';
    public static EntityType = 'PostalCode';

    public CreatedAt: Date;
    public Deleted: boolean;
    public ID: number;
    public StatusCode: number;
    public UpdatedAt: Date;
    public City: string;
    public UpdatedBy: string;
    public Code: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class SaftMappingAccount extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'SaftMappingAccount';

    public CreatedAt: Date;
    public Description: string;
    public Deleted: boolean;
    public ID: number;
    public UpdatedAt: Date;
    public AccountID: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class StaticRegister extends UniEntity {
    public static RelativeUrl = 'StaticRegister';
    public static EntityType = 'StaticRegister';

    public CreatedAt: Date;
    public Registry: string;
    public Deleted: boolean;
    public ID: number;
    public stamp: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class STYRKCode extends UniEntity {
    public static RelativeUrl = 'STYRK';
    public static EntityType = 'STYRKCode';

    public CreatedAt: Date;
    public Deleted: boolean;
    public ID: number;
    public styrk: string;
    public ynr: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public tittel: string;
    public lnr: number;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Language extends UniEntity {
    public static RelativeUrl = 'languages';
    public static EntityType = 'Language';

    public CreatedAt: Date;
    public Deleted: boolean;
    public FallBackLanguageID: number;
    public ID: number;
    public Name: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Code: string;
    public CreatedBy: string;
    public _createguid: string;
    public Translations: Array<Translation>;
    public CustomFields: any;
}


export class Translatable extends UniEntity {
    public static RelativeUrl = 'translatables';
    public static EntityType = 'Translatable';

    public CreatedAt: Date;
    public Description: string;
    public Deleted: boolean;
    public ID: number;
    public Model: string;
    public Meaning: string;
    public Module: i18nModule;
    public Column: string;
    public Static: boolean;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Value: string;
    public _createguid: string;
    public Translations: Array<Translation>;
    public CustomFields: any;
}


export class Translation extends UniEntity {
    public static RelativeUrl = 'translations';
    public static EntityType = 'Translation';

    public CreatedAt: Date;
    public Deleted: boolean;
    public ID: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public LanguageID: number;
    public TranslatableID: number;
    public Value: string;
    public _createguid: string;
    public Language: Language;
    public Translatable: Translatable;
    public CustomFields: any;
}


export class VatCodeGroupSetup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'VatCodeGroupSetup';

    public CreatedAt: Date;
    public No: string;
    public Deleted: boolean;
    public ID: number;
    public Name: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class VatPostSetup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'VatPostSetup';

    public CreatedAt: Date;
    public ReportAsNegativeAmount: boolean;
    public No: string;
    public Deleted: boolean;
    public ID: number;
    public VatCodeGroupSetupNo: string;
    public HasTaxBasis: boolean;
    public Name: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public HasTaxAmount: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class VatReportForm extends UniEntity {
    public static RelativeUrl = 'vatreportforms';
    public static EntityType = 'VatReportForm';

    public CreatedAt: Date;
    public Description: string;
    public Deleted: boolean;
    public ID: number;
    public Name: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class VatReportReferenceSetup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'VatReportReferenceSetup';

    public CreatedAt: Date;
    public Deleted: boolean;
    public ID: number;
    public AccountNumber: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public VatPostNo: string;
    public CreatedBy: string;
    public VatCode: string;
    public _createguid: string;
    public CustomFields: any;
}


export class VatTypeSetup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'VatTypeSetup';

    public CreatedAt: Date;
    public ReversedTaxDutyVat: boolean;
    public Deleted: boolean;
    public DefaultVisible: boolean;
    public ID: number;
    public OutputVat: boolean;
    public Name: string;
    public DirectJournalEntryOnly: boolean;
    public UpdatedAt: Date;
    public IncomingAccountNumber: number;
    public OutgoingAccountNumber: number;
    public VatCodeGroupNo: string;
    public UpdatedBy: string;
    public IsNotVatRegistered: boolean;
    public CreatedBy: string;
    public VatCode: string;
    public IsCompensated: boolean;
    public _createguid: string;
    public VatTypeSetupPercentages: Array<VatTypeSetupPercentage>;
    public CustomFields: any;
}


export class VatTypeSetupPercentage extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'VatTypeSetupPercentage';

    public CreatedAt: Date;
    public Deleted: boolean;
    public ID: number;
    public ValidTo: LocalDate;
    public VatPercent: number;
    public VatTypeSetupID: number;
    public ValidFrom: LocalDate;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class CompanyReport extends UniEntity {
    public static RelativeUrl = 'company-report';
    public static EntityType = 'CompanyReport';

    public CreatedAt: Date;
    public Deleted: boolean;
    public ID: number;
    public CompanyKey: string;
    public ContractId: number;
    public ReportDefinitionID: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class ReportDefinition extends UniEntity {
    public static RelativeUrl = 'report-definitions';
    public static EntityType = 'ReportDefinition';

    public CreatedAt: Date;
    public Description: string;
    public Deleted: boolean;
    public ID: number;
    public CategoryLabel: string;
    public Category: string;
    public IsStandard: boolean;
    public Name: string;
    public TemplateLinkId: string;
    public Visible: boolean;
    public Version: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public ReportSource: string;
    public ReportType: number;
    public UniqueReportID: string;
    public Md5: string;
    public _createguid: string;
    public CustomFields: any;
}


export class ReportDefinitionDataSource extends UniEntity {
    public static RelativeUrl = 'report-definition-data-sources';
    public static EntityType = 'ReportDefinitionDataSource';

    public CreatedAt: Date;
    public Deleted: boolean;
    public ID: number;
    public Name: string;
    public ReportDefinitionId: number;
    public DataSourceUrl: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class ReportDefinitionParameter extends UniEntity {
    public static RelativeUrl = 'report-definition-parameters';
    public static EntityType = 'ReportDefinitionParameter';

    public CreatedAt: Date;
    public DefaultValueSource: string;
    public Deleted: boolean;
    public ID: number;
    public Name: string;
    public ReportDefinitionId: number;
    public DefaultValue: string;
    public Visible: boolean;
    public UpdatedAt: Date;
    public Label: string;
    public DefaultValueList: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Type: string;
    public DefaultValueLookupType: string;
    public _createguid: string;
    public CustomFields: any;
}


export class PeriodSeries extends UniEntity {
    public static RelativeUrl = 'period-series';
    public static EntityType = 'PeriodSeries';

    public CreatedAt: Date;
    public Deleted: boolean;
    public ID: number;
    public Name: string;
    public UpdatedAt: Date;
    public Active: boolean;
    public SeriesType: PeriodSeriesType;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class PeriodTemplate extends UniEntity {
    public static RelativeUrl = 'period-templates';
    public static EntityType = 'PeriodTemplate';

    public CreatedAt: Date;
    public No: number;
    public Deleted: boolean;
    public ID: number;
    public Name: string;
    public UpdatedAt: Date;
    public PeriodSeriesID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public ToDate: LocalDate;
    public FromDate: LocalDate;
    public _createguid: string;
    public PeriodSeries: PeriodSeries;
    public CustomFields: any;
}


export class Model extends UniEntity {
    public static RelativeUrl = 'models';
    public static EntityType = 'Model';

    public CreatedAt: Date;
    public Description: string;
    public Deleted: boolean;
    public ID: number;
    public Name: string;
    public Shared: boolean;
    public UpdatedAt: Date;
    public Label: string;
    public Admin: boolean;
    public UpdatedBy: string;
    public CreatedBy: string;
    public LabelPlural: string;
    public _createguid: string;
    public Fields: Array<Field>;
    public CustomFields: any;
}


export class Field extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Field';

    public CreatedAt: Date;
    public HelpText: string;
    public Description: string;
    public Deleted: boolean;
    public ID: number;
    public Name: string;
    public UpdatedAt: Date;
    public Label: string;
    public UpdatedBy: string;
    public ModelID: number;
    public CreatedBy: string;
    public _createguid: string;
    public Model: Model;
    public CustomFields: any;
}


export class Notification extends UniEntity {
    public static RelativeUrl = 'notifications';
    public static EntityType = 'Notification';

    public CreatedAt: Date;
    public Deleted: boolean;
    public SourceEntityType: string;
    public ID: number;
    public EntityType: string;
    public CompanyKey: string;
    public StatusCode: number;
    public SenderDisplayName: string;
    public CompanyName: string;
    public SourceEntityID: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public RecipientID: string;
    public EntityID: number;
    public Message: string;
    public _createguid: string;
    public CustomFields: any;
}


export class CompanySettings extends UniEntity {
    public static RelativeUrl = 'companysettings';
    public static EntityType = 'CompanySettings';

    public CreatedAt: Date;
    public AutoJournalPayment: string;
    public Localization: string;
    public Deleted: boolean;
    public FactoringNumber: number;
    public IgnorePaymentsWithoutEndToEndID: boolean;
    public PaymentBankIdentification: string;
    public InterrimRemitAccountID: number;
    public PeriodSeriesAccountID: number;
    public SupplierAccountID: number;
    public XtraPaymentOrgXmlTagValue: string;
    public CustomerInvoiceReminderSettingsID: number;
    public APGuid: string;
    public ID: number;
    public SaveCustomersFromQuoteAsLead: boolean;
    public AllowAvtalegiroRegularInvoice: boolean;
    public UseNetsIntegration: boolean;
    public UsePaymentBankValues: boolean;
    public UseOcrInterpretation: boolean;
    public CompanyBankAccountID: number;
    public BaseCurrencyCodeID: number;
    public GLN: string;
    public AccountGroupSetID: number;
    public DefaultCustomerOrderReportID: number;
    public StatusCode: number;
    public HideInActiveSuppliers: boolean;
    public OfficeMunicipalityNo: string;
    public LogoFileID: number;
    public AccountVisibilityGroupID: number;
    public DefaultCustomerQuoteReportID: number;
    public AcceptableDelta4CustomerPayment: number;
    public WebAddress: string;
    public BatchInvoiceMinAmount: number;
    public APIncludeAttachment: boolean;
    public TaxableFromLimit: number;
    public HasAutobank: boolean;
    public VatLockedDate: LocalDate;
    public DefaultEmailID: number;
    public InterrimPaymentAccountID: number;
    public CompanyName: string;
    public SAFTimportAccountID: number;
    public RoundingNumberOfDecimals: number;
    public LogoHideField: number;
    public FactoringEmailID: number;
    public UpdatedAt: Date;
    public PaymentBankAgreementNumber: string;
    public PeriodSeriesVatID: number;
    public CustomerCreditDays: number;
    public APContactID: number;
    public AutoDistributeInvoice: boolean;
    public SalaryBankAccountID: number;
    public AccountingLockedDate: LocalDate;
    public HideInActiveCustomers: boolean;
    public BookCustomerInvoiceOnDeliveryDate: boolean;
    public OrganizationNumber: string;
    public APActivated: boolean;
    public TaxableFromDate: LocalDate;
    public AgioLossAccountID: number;
    public RoundingType: RoundingType;
    public UpdatedBy: string;
    public CustomerAccountID: number;
    public BankChargeAccountID: number;
    public Factoring: number;
    public StoreDistributedInvoice: boolean;
    public CreatedBy: string;
    public DefaultDistributionsID: number;
    public DefaultAddressID: number;
    public ShowNumberOfDecimals: number;
    public SettlementVatAccountID: number;
    public UseAssetRegister: boolean;
    public AcceptableDelta4CustomerPaymentAccountID: number;
    public UseXtraPaymentOrgXmlTag: boolean;
    public UseFinancialDateToCalculateVatPercent: boolean;
    public ShowKIDOnCustomerInvoice: boolean;
    public AgioGainAccountID: number;
    public VatReportFormID: number;
    public TaxMandatory: boolean;
    public ForceSupplierInvoiceApproval: boolean;
    public TaxMandatoryType: number;
    public NetsIntegrationActivated: boolean;
    public DefaultCustomerInvoiceReportID: number;
    public DefaultCustomerInvoiceReminderReportID: number;
    public LogoAlign: number;
    public CompanyRegistered: boolean;
    public DefaultTOFCurrencySettingsID: number;
    public CompanyTypeID: number;
    public DefaultSalesAccountID: number;
    public TaxBankAccountID: number;
    public TwoStageAutobankEnabled: boolean;
    public DefaultPhoneID: number;
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

    public CreatedAt: Date;
    public Deleted: boolean;
    public ID: number;
    public EntityType: string;
    public StatusCode: number;
    public Name: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public Elements: Array<DistributionPlanElement>;
    public CustomFields: any;
}


export class DistributionPlanElement extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'DistributionPlanElement';

    public CreatedAt: Date;
    public Deleted: boolean;
    public DistributionPlanID: number;
    public ID: number;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public DistributionPlanElementTypeID: number;
    public Priority: number;
    public _createguid: string;
    public ElementType: DistributionPlanElementType;
    public CustomFields: any;
}


export class DistributionPlanElementType extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'DistributionPlanElementType';

    public CreatedAt: Date;
    public Deleted: boolean;
    public ID: number;
    public StatusCode: number;
    public Name: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public LegalEntities: Array<DistributionPlanElementTypeLegalEntity>;
    public CustomFields: any;
}


export class DistributionPlanElementTypeLegalEntity extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'DistributionPlanElementTypeLegalEntity';

    public CreatedAt: Date;
    public Deleted: boolean;
    public ID: number;
    public EntityType: string;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public DistributionPlanElementTypeID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class Distributions extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Distributions';

    public CreatedAt: Date;
    public Deleted: boolean;
    public CustomerOrderDistributionPlanID: number;
    public ID: number;
    public CustomerInvoiceReminderDistributionPlanID: number;
    public StatusCode: number;
    public CustomerInvoiceDistributionPlanID: number;
    public AnnualStatementDistributionPlanID: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
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
    public ID: number;
    public StatusCode: number;
    public Name: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class EmailLog extends UniEntity {
    public static RelativeUrl = 'emails';
    public static EntityType = 'EmailLog';

    public CreatedAt: Date;
    public Deleted: boolean;
    public JobRunID: number;
    public ID: number;
    public From: string;
    public EntityType: string;
    public ExternalMessage: string;
    public ExternalReference: string;
    public StatusCode: number;
    public EntityDisplayValue: string;
    public UpdatedAt: Date;
    public To: string;
    public DistributeAt: LocalDate;
    public UpdatedBy: string;
    public JobRunExternalRef: string;
    public CreatedBy: string;
    public EntityID: number;
    public Type: SharingType;
    public Subject: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Eventplan extends UniEntity {
    public static RelativeUrl = 'eventplans';
    public static EntityType = 'Eventplan';

    public CreatedAt: Date;
    public Cargo: string;
    public Deleted: boolean;
    public ID: number;
    public ExpressionFilter: string;
    public StatusCode: number;
    public PlanType: EventplanType;
    public Name: string;
    public SigningKey: string;
    public IsSystemPlan: boolean;
    public UpdatedAt: Date;
    public Active: boolean;
    public UpdatedBy: string;
    public CreatedBy: string;
    public OperationFilter: string;
    public JobNames: string;
    public ModelFilter: string;
    public _createguid: string;
    public Subscribers: Array<EventSubscriber>;
    public CustomFields: any;
}


export class EventSubscriber extends UniEntity {
    public static RelativeUrl = 'eventsubscribers';
    public static EntityType = 'EventSubscriber';

    public CreatedAt: Date;
    public Deleted: boolean;
    public EventplanID: number;
    public ID: number;
    public Authorization: string;
    public StatusCode: number;
    public Name: string;
    public Headers: string;
    public Endpoint: string;
    public UpdatedAt: Date;
    public Active: boolean;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public Eventplan: Eventplan;
    public CustomFields: any;
}


export class Period extends UniEntity {
    public static RelativeUrl = 'periodes';
    public static EntityType = 'Period';

    public CreatedAt: Date;
    public No: number;
    public Deleted: boolean;
    public ID: number;
    public StatusCode: number;
    public Name: string;
    public PeriodTemplateID: number;
    public UpdatedAt: Date;
    public PeriodSeriesID: number;
    public AccountYear: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public ToDate: LocalDate;
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
    public Description: string;
    public Deleted: boolean;
    public ID: number;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Code: string;
    public CreatedBy: string;
    public Type: PredefinedDescriptionType;
    public _createguid: string;
    public CustomFields: any;
}


export class ProductCategory extends UniEntity {
    public static RelativeUrl = 'productcategories';
    public static EntityType = 'ProductCategory';

    public CreatedAt: Date;
    public Lft: number;
    public Description: string;
    public Deleted: boolean;
    public ID: number;
    public Rght: number;
    public StatusCode: number;
    public Name: string;
    public Comment: string;
    public ParentID: number;
    public UpdatedAt: Date;
    public Depth: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Status: number;
    public _createguid: string;
    public CustomFields: any;
}


export class ProductCategoryLink extends UniEntity {
    public static RelativeUrl = 'productcategorylinks';
    public static EntityType = 'ProductCategoryLink';

    public CreatedAt: Date;
    public Deleted: boolean;
    public ID: number;
    public ProductCategoryID: number;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public ProductID: number;
    public _createguid: string;
    public ProductCategory: ProductCategory;
    public CustomFields: any;
}


export class Sharing extends UniEntity {
    public static RelativeUrl = 'sharings';
    public static EntityType = 'Sharing';

    public CreatedAt: Date;
    public Deleted: boolean;
    public JobRunID: number;
    public ID: number;
    public From: string;
    public EntityType: string;
    public ExternalMessage: string;
    public ExternalReference: string;
    public StatusCode: number;
    public EntityDisplayValue: string;
    public UpdatedAt: Date;
    public To: string;
    public DistributeAt: LocalDate;
    public UpdatedBy: string;
    public JobRunExternalRef: string;
    public CreatedBy: string;
    public EntityID: number;
    public Type: SharingType;
    public Subject: string;
    public _createguid: string;
    public CustomFields: any;
}


export class StatusLog extends UniEntity {
    public static RelativeUrl = 'statuslogs';
    public static EntityType = 'StatusLog';

    public CreatedAt: Date;
    public Deleted: boolean;
    public ID: number;
    public EntityType: string;
    public FromStatus: number;
    public UpdatedAt: Date;
    public ToStatus: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public EntityID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class Tracelink extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Tracelink';

    public CreatedAt: Date;
    public Deleted: boolean;
    public ID: number;
    public DestinationInstanceID: number;
    public StatusCode: number;
    public SourceInstanceID: number;
    public DestinationEntityName: string;
    public UpdatedAt: Date;
    public SourceEntityName: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Date: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class User extends UniEntity {
    public static RelativeUrl = 'users';
    public static EntityType = 'User';

    public CreatedAt: Date;
    public Deleted: boolean;
    public ID: number;
    public BankIntegrationUserName: string;
    public IsAutobankAdmin: boolean;
    public LastLogin: Date;
    public StatusCode: number;
    public Protected: boolean;
    public DisplayName: string;
    public GlobalIdentity: string;
    public UpdatedAt: Date;
    public PhoneNumber: string;
    public UserName: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public HasAgreedToImportDisclaimer: boolean;
    public Email: string;
    public TwoFactorEnabled: boolean;
    public _createguid: string;
    public EndDate: Date;
    public AuthPhoneNumber: string;
    public CustomFields: any;
}


export class UniQueryDefinition extends UniEntity {
    public static RelativeUrl = 'uniquerydefinitions';
    public static EntityType = 'UniQueryDefinition';

    public CreatedAt: Date;
    public Description: string;
    public Deleted: boolean;
    public UserID: number;
    public ID: number;
    public Category: string;
    public StatusCode: number;
    public Name: string;
    public SystemGeneratedQuery: boolean;
    public ModuleID: number;
    public MainModelName: string;
    public ClickUrl: string;
    public UpdatedAt: Date;
    public SortIndex: number;
    public UpdatedBy: string;
    public Code: string;
    public CreatedBy: string;
    public IsShared: boolean;
    public ClickParam: string;
    public _createguid: string;
    public UniQueryFilters: Array<UniQueryFilter>;
    public UniQueryFields: Array<UniQueryField>;
    public CustomFields: any;
}


export class UniQueryField extends UniEntity {
    public static RelativeUrl = 'uniqueryfields';
    public static EntityType = 'UniQueryField';

    public CreatedAt: Date;
    public Deleted: boolean;
    public ID: number;
    public StatusCode: number;
    public Width: string;
    public UniQueryDefinitionID: number;
    public Alias: string;
    public UpdatedAt: Date;
    public Header: string;
    public UpdatedBy: string;
    public Path: string;
    public CreatedBy: string;
    public Index: number;
    public FieldType: number;
    public SumFunction: string;
    public Field: string;
    public _createguid: string;
    public CustomFields: any;
}


export class UniQueryFilter extends UniEntity {
    public static RelativeUrl = 'uniqueryfilters';
    public static EntityType = 'UniQueryFilter';

    public CreatedAt: Date;
    public Deleted: boolean;
    public ID: number;
    public Group: number;
    public StatusCode: number;
    public UniQueryDefinitionID: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Operator: string;
    public Field: string;
    public Value: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Team extends UniEntity {
    public static RelativeUrl = 'teams';
    public static EntityType = 'Team';

    public CreatedAt: Date;
    public Lft: number;
    public Deleted: boolean;
    public ID: number;
    public Rght: number;
    public StatusCode: number;
    public Name: string;
    public ParentID: number;
    public DimensionsID: number;
    public UpdatedAt: Date;
    public Depth: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public Dimensions: Dimensions;
    public Positions: Array<TeamPosition>;
    public CustomFields: any;
}


export class TeamPosition extends UniEntity {
    public static RelativeUrl = 'teampositions';
    public static EntityType = 'TeamPosition';

    public CreatedAt: Date;
    public Deleted: boolean;
    public UserID: number;
    public ID: number;
    public Position: TeamPositionEnum;
    public StatusCode: number;
    public TeamID: number;
    public UpdatedAt: Date;
    public RelatedSharedRoleId: number;
    public UpdatedBy: string;
    public ApproveOrder: number;
    public CreatedBy: string;
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
    public Description: string;
    public Deleted: boolean;
    public ID: number;
    public IndustryCodes: string;
    public StatusCode: number;
    public UpdatedAt: Date;
    public RuleType: ApprovalRuleType;
    public Keywords: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public Steps: Array<ApprovalRuleStep>;
    public CustomFields: any;
}


export class ApprovalRuleStep extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ApprovalRuleStep';

    public CreatedAt: Date;
    public Deleted: boolean;
    public UserID: number;
    public ID: number;
    public StatusCode: number;
    public ApprovalRuleID: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Limit: number;
    public StepNumber: number;
    public _createguid: string;
    public ApprovalRule: ApprovalRule;
    public User: User;
    public CustomFields: any;
}


export class ApprovalSubstitute extends UniEntity {
    public static RelativeUrl = 'approvalsubstitutes';
    public static EntityType = 'ApprovalSubstitute';

    public CreatedAt: Date;
    public Deleted: boolean;
    public UserID: number;
    public ID: number;
    public StatusCode: number;
    public UpdatedAt: Date;
    public SubstituteUserID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
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

    public CreatedAt: Date;
    public Deleted: boolean;
    public UserID: number;
    public ID: number;
    public StatusCode: number;
    public ApprovalRuleID: number;
    public Comment: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public ApprovalID: number;
    public TaskID: number;
    public Limit: number;
    public Amount: number;
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

    public CreatedAt: Date;
    public Description: string;
    public Deleted: boolean;
    public IsDepricated: boolean;
    public ID: number;
    public EntityType: string;
    public StatusCategoryID: number;
    public StatusCode: number;
    public Order: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public System: boolean;
    public _createguid: string;
    public StatusCategory: StatusCategory;
    public CustomFields: any;
}


export class StatusCategory extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'StatusCategory';

    public CreatedAt: Date;
    public Deleted: boolean;
    public ID: number;
    public Name: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public StatusCategoryCode: StatusCategoryCode;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class StatusRemark extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'StatusRemark';

    public CreatedAt: Date;
    public Deleted: boolean;
    public ID: number;
    public EntityType: string;
    public Remark: string;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public EntityID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class Transition extends UniEntity {
    public static RelativeUrl = 'transitions';
    public static EntityType = 'Transition';

    public CreatedAt: Date;
    public Deleted: boolean;
    public ID: number;
    public EntityType: string;
    public Controller: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public MethodName: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class TransitionThreshold extends UniEntity {
    public static RelativeUrl = 'thresholds';
    public static EntityType = 'TransitionThreshold';

    public CreatedAt: Date;
    public Deleted: boolean;
    public ID: number;
    public SharedRoleId: number;
    public Operation: OperationType;
    public UpdatedAt: Date;
    public Disabled: boolean;
    public PropertyName: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public SharedRejectTransitionId: number;
    public RejectStatusCode: number;
    public Operator: Operator;
    public SharedApproveTransitionId: number;
    public Value: string;
    public _createguid: string;
    public CustomFields: any;
}


export class TransitionThresholdApproval extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'TransitionThresholdApproval';

    public CreatedAt: Date;
    public Deleted: boolean;
    public ID: number;
    public SharedRoleId: number;
    public Operation: OperationType;
    public UpdatedAt: Date;
    public PropertyName: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public ApprovalID: number;
    public SharedRejectTransitionId: number;
    public RejectStatusCode: number;
    public Operator: Operator;
    public SharedApproveTransitionId: number;
    public Value: string;
    public _createguid: string;
    public Approval: Approval;
    public CustomFields: any;
}


export class Approval extends UniEntity {
    public static RelativeUrl = 'approvals';
    public static EntityType = 'Approval';

    public CreatedAt: Date;
    public Deleted: boolean;
    public UserID: number;
    public ID: number;
    public StatusCode: number;
    public SharedRoleId: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public TaskID: number;
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

    public CreatedAt: Date;
    public Deleted: boolean;
    public UserID: number;
    public ID: number;
    public Title: string;
    public StatusCode: number;
    public SharedRoleId: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public ModelID: number;
    public CreatedBy: string;
    public EntityID: number;
    public SharedRejectTransitionId: number;
    public RejectStatusCode: number;
    public SharedApproveTransitionId: number;
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

    public CreatedAt: Date;
    public Deleted: boolean;
    public IsDepricated: boolean;
    public ID: number;
    public EntityType: string;
    public FromStatusID: number;
    public UpdatedAt: Date;
    public ToStatusID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public ExpiresDate: Date;
    public TransitionID: number;
    public _createguid: string;
    public FromStatus: Status;
    public ToStatus: Status;
    public Transition: Transition;
    public CustomFields: any;
}


export class Project extends UniEntity {
    public static RelativeUrl = 'projects';
    public static EntityType = 'Project';

    public CreatedAt: Date;
    public Description: string;
    public Deleted: boolean;
    public Price: number;
    public ID: number;
    public PlannedStartdate: LocalDate;
    public StatusCode: number;
    public Name: string;
    public WorkPlaceAddressID: number;
    public ProjectNumberSeriesID: number;
    public DimensionsID: number;
    public UpdatedAt: Date;
    public Total: number;
    public ProjectNumberNumeric: number;
    public ProjectCustomerID: number;
    public CostPrice: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public PlannedEnddate: LocalDate;
    public EndDate: LocalDate;
    public StartDate: LocalDate;
    public ProjectLeadName: string;
    public Amount: number;
    public ProjectNumber: string;
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
    public Deleted: boolean;
    public UserID: number;
    public ProjectID: number;
    public ID: number;
    public Responsibility: string;
    public StatusCode: number;
    public Name: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public ProjectUser: User;
    public CustomFields: any;
}


export class ProjectResourceSchedule extends UniEntity {
    public static RelativeUrl = 'projects-schedules-resources';
    public static EntityType = 'ProjectResourceSchedule';

    public CreatedAt: Date;
    public Deleted: boolean;
    public ID: number;
    public StatusCode: number;
    public ProjectTaskID: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public ProjectTaskScheduleID: number;
    public ProjectResourceID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class ProjectTask extends UniEntity {
    public static RelativeUrl = 'projects-tasks';
    public static EntityType = 'ProjectTask';

    public CreatedAt: Date;
    public Description: string;
    public Deleted: boolean;
    public Price: number;
    public ProjectID: number;
    public ID: number;
    public StatusCode: number;
    public Name: string;
    public Number: string;
    public SuggestedNumber: string;
    public UpdatedAt: Date;
    public Total: number;
    public CostPrice: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public EndDate: LocalDate;
    public StartDate: LocalDate;
    public Amount: number;
    public _createguid: string;
    public ProjectTaskSchedules: Array<ProjectTaskSchedule>;
    public ProjectTaskResources: Array<ProjectResourceSchedule>;
    public CustomFields: any;
}


export class ProjectTaskSchedule extends UniEntity {
    public static RelativeUrl = 'projects-tasks-schedules';
    public static EntityType = 'ProjectTaskSchedule';

    public CreatedAt: Date;
    public Deleted: boolean;
    public ID: number;
    public StatusCode: number;
    public ProjectTaskID: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public EndDate: LocalDate;
    public StartDate: LocalDate;
    public _createguid: string;
    public ScheduleResources: Array<ProjectResourceSchedule>;
    public CustomFields: any;
}


export class BarnepassProduct extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'BarnepassProduct';

    public CreatedAt: Date;
    public Deleted: boolean;
    public ID: number;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public ProductID: number;
    public _createguid: string;
    public Product: Product;
    public CustomFields: any;
}


export class Product extends UniEntity {
    public static RelativeUrl = 'products';
    public static EntityType = 'Product';

    public CreatedAt: Date;
    public Unit: string;
    public Description: string;
    public Deleted: boolean;
    public AverageCost: number;
    public ListPrice: number;
    public CalculateGrossPriceBasedOnNetPrice: boolean;
    public VatTypeID: number;
    public ID: number;
    public StatusCode: number;
    public Name: string;
    public PriceExVat: number;
    public DimensionsID: number;
    public UpdatedAt: Date;
    public ImageFileID: number;
    public AccountID: number;
    public CostPrice: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public VariansParentID: number;
    public PartName: string;
    public DefaultProductCategoryID: number;
    public Type: ProductTypeEnum;
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

    public CreatedAt: Date;
    public Deleted: boolean;
    public ID: number;
    public StatusCode: number;
    public ToNumber: number;
    public Name: string;
    public NextNumber: number;
    public UseNumbersFromNumberSeriesID: number;
    public Comment: string;
    public DisplayName: string;
    public MainAccountID: number;
    public UpdatedAt: Date;
    public Disabled: boolean;
    public NumberSeriesTypeID: number;
    public AccountYear: number;
    public FromNumber: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public System: boolean;
    public Empty: boolean;
    public NumberSeriesTaskID: number;
    public NumberLock: boolean;
    public IsDefaultForTask: boolean;
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
    public Deleted: boolean;
    public ID: number;
    public StatusCode: number;
    public NumberSerieTypeAID: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public NumberSerieTypeBID: number;
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
    public ID: number;
    public EntityType: string;
    public StatusCode: number;
    public Name: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public NumberSeries: Array<NumberSeries>;
    public CustomFields: any;
}


export class NumberSeriesType extends UniEntity {
    public static RelativeUrl = 'number-series-types';
    public static EntityType = 'NumberSeriesType';

    public CreatedAt: Date;
    public Yearly: boolean;
    public Deleted: boolean;
    public EntityField: string;
    public EntitySeriesIDField: string;
    public ID: number;
    public EntityType: string;
    public StatusCode: number;
    public Name: string;
    public CanHaveSeveralActiveSeries: boolean;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public System: boolean;
    public _createguid: string;
    public Series: Array<NumberSeries>;
    public CustomFields: any;
}


export class EncryptionInfo extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'EncryptionInfo';

    public CreatedAt: Date;
    public description: string;
    public password: string;
    public Deleted: boolean;
    public ID: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public type: Type;
    public _createguid: string;
    public CustomFields: any;
}


export class File extends UniEntity {
    public static RelativeUrl = 'files/{entitytype}/{entityid}';
    public static EntityType = 'File';

    public CreatedAt: Date;
    public Pages: number;
    public Description: string;
    public Deleted: boolean;
    public ID: number;
    public Size: string;
    public StatusCode: number;
    public Name: string;
    public encryptionID: number;
    public OCRData: string;
    public ContentType: string;
    public UpdatedAt: Date;
    public StorageReference: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public PermaLink: string;
    public Md5: string;
    public _createguid: string;
    public UploadSlot: string;
    public FileTags: Array<FileTag>;
    public EntityLinks: Array<FileEntityLink>;
    public CustomFields: any;
}


export class FileTag extends UniEntity {
    public static RelativeUrl = 'filetags';
    public static EntityType = 'FileTag';

    public CreatedAt: Date;
    public Deleted: boolean;
    public ID: number;
    public TagName: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Status: number;
    public FileID: number;
    public _createguid: string;
    public File: File;
    public CustomFields: any;
}


export class FileEntityLink extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'FileEntityLink';

    public CreatedAt: Date;
    public Deleted: boolean;
    public ID: number;
    public EntityType: string;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public EntityID: number;
    public FileID: number;
    public IsAttachment: boolean;
    public _createguid: string;
    public File: File;
    public CustomFields: any;
}


export class ElsaUsageLog extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ElsaUsageLog';

    public CreatedAt: Date;
    public Deleted: boolean;
    public ID: number;
    public ExternalReference: string;
    public ProductType: string;
    public DateLogged: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Quantity: number;
    public _createguid: string;
    public CustomFields: any;
}


export class AccessPointFormat extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AccessPointFormat';

    public CreatedAt: Date;
    public Deleted: boolean;
    public ID: number;
    public StatusCode: number;
    public Name: string;
    public IncommingID: number;
    public UpdatedAt: Date;
    public Label: string;
    public OutgoingID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public ResourceName: string;
    public _createguid: string;
    public CustomFields: any;
}


export class EHFLog extends UniEntity {
    public static RelativeUrl = 'ehf';
    public static EntityType = 'EHFLog';

    public CreatedAt: Date;
    public Deleted: boolean;
    public JobRunID: number;
    public ID: number;
    public From: string;
    public EntityType: string;
    public ExternalMessage: string;
    public ExternalReference: string;
    public StatusCode: number;
    public EntityDisplayValue: string;
    public UpdatedAt: Date;
    public To: string;
    public DistributeAt: LocalDate;
    public UpdatedBy: string;
    public JobRunExternalRef: string;
    public CreatedBy: string;
    public EntityID: number;
    public Type: SharingType;
    public Subject: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Department extends UniEntity {
    public static RelativeUrl = 'departments';
    public static EntityType = 'Department';

    public CreatedAt: Date;
    public Description: string;
    public Deleted: boolean;
    public ID: number;
    public StatusCode: number;
    public DepartmentNumberNumeric: number;
    public Name: string;
    public DepartmentNumberSeriesID: number;
    public DepartmentNumber: string;
    public UpdatedAt: Date;
    public DepartmentManagerName: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public DepartmentNumberSeries: NumberSeries;
    public CustomFields: any;
}


export class Dimension10 extends UniEntity {
    public static RelativeUrl = 'Dimension10';
    public static EntityType = 'Dimension10';

    public CreatedAt: Date;
    public Description: string;
    public Deleted: boolean;
    public ID: number;
    public StatusCode: number;
    public Name: string;
    public Number: string;
    public UpdatedAt: Date;
    public NumberNumeric: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Dimension5 extends UniEntity {
    public static RelativeUrl = 'Dimension5';
    public static EntityType = 'Dimension5';

    public CreatedAt: Date;
    public Description: string;
    public Deleted: boolean;
    public ID: number;
    public StatusCode: number;
    public Name: string;
    public Number: string;
    public UpdatedAt: Date;
    public NumberNumeric: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Dimension6 extends UniEntity {
    public static RelativeUrl = 'Dimension6';
    public static EntityType = 'Dimension6';

    public CreatedAt: Date;
    public Description: string;
    public Deleted: boolean;
    public ID: number;
    public StatusCode: number;
    public Name: string;
    public Number: string;
    public UpdatedAt: Date;
    public NumberNumeric: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Dimension7 extends UniEntity {
    public static RelativeUrl = 'Dimension7';
    public static EntityType = 'Dimension7';

    public CreatedAt: Date;
    public Description: string;
    public Deleted: boolean;
    public ID: number;
    public StatusCode: number;
    public Name: string;
    public Number: string;
    public UpdatedAt: Date;
    public NumberNumeric: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Dimension8 extends UniEntity {
    public static RelativeUrl = 'Dimension8';
    public static EntityType = 'Dimension8';

    public CreatedAt: Date;
    public Description: string;
    public Deleted: boolean;
    public ID: number;
    public StatusCode: number;
    public Name: string;
    public Number: string;
    public UpdatedAt: Date;
    public NumberNumeric: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Dimension9 extends UniEntity {
    public static RelativeUrl = 'Dimension9';
    public static EntityType = 'Dimension9';

    public CreatedAt: Date;
    public Description: string;
    public Deleted: boolean;
    public ID: number;
    public StatusCode: number;
    public Name: string;
    public Number: string;
    public UpdatedAt: Date;
    public NumberNumeric: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Dimensions extends UniEntity {
    public static RelativeUrl = 'dimensions';
    public static EntityType = 'Dimensions';

    public CreatedAt: Date;
    public RegionID: number;
    public Deleted: boolean;
    public Dimension10ID: number;
    public Dimension6ID: number;
    public ProjectID: number;
    public ID: number;
    public Dimension9ID: number;
    public ResponsibleID: number;
    public StatusCode: number;
    public DepartmentID: number;
    public ProjectTaskID: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Dimension8ID: number;
    public Dimension7ID: number;
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
    public Dimension7Name: string;
    public Dimension5Name: string;
    public ID: number;
    public DepartmentName: string;
    public RegionCode: string;
    public DepartmentNumber: string;
    public ProjectTaskNumber: string;
    public ResponsibleName: string;
    public RegionName: string;
    public Dimension8Number: string;
    public Dimension6Number: string;
    public DimensionsID: number;
    public Dimension9Number: string;
    public Dimension9Name: string;
    public ProjectName: string;
    public Dimension10Name: string;
    public ProjectTaskName: string;
    public Dimension7Number: string;
    public Dimension10Number: string;
    public Dimension6Name: string;
    public Dimension8Name: string;
    public ProjectNumber: string;
    public Dimension5Number: string;
}


export class DimensionSettings extends UniEntity {
    public static RelativeUrl = 'dimensionsettings';
    public static EntityType = 'DimensionSettings';

    public CreatedAt: Date;
    public Deleted: boolean;
    public ID: number;
    public StatusCode: number;
    public IsActive: boolean;
    public Dimension: number;
    public UpdatedAt: Date;
    public Label: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Region extends UniEntity {
    public static RelativeUrl = 'regions';
    public static EntityType = 'Region';

    public CreatedAt: Date;
    public Description: string;
    public Deleted: boolean;
    public ID: number;
    public StatusCode: number;
    public RegionCode: string;
    public Name: string;
    public CountryCode: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Responsible extends UniEntity {
    public static RelativeUrl = 'responsibles';
    public static EntityType = 'Responsible';

    public CreatedAt: Date;
    public Description: string;
    public Deleted: boolean;
    public ID: number;
    public StatusCode: number;
    public Name: string;
    public NameOfResponsible: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Contract extends UniEntity {
    public static RelativeUrl = 'contracts';
    public static EntityType = 'Contract';

    public CreatedAt: Date;
    public Description: string;
    public Deleted: boolean;
    public TeamsUri: string;
    public ID: number;
    public StatusCode: number;
    public Hash: string;
    public ContractCode: string;
    public Name: string;
    public HashTransactionAddress: string;
    public Engine: ContractEngine;
    public UpdatedAt: Date;
    public UpdatedBy: string;
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

    public CreatedAt: Date;
    public Deleted: boolean;
    public ID: number;
    public EntityType: string;
    public ContractID: number;
    public StatusCode: number;
    public AssetAddress: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public EntityID: number;
    public ContractAssetID: number;
    public Address: string;
    public Amount: number;
    public Type: AddressType;
    public _createguid: string;
    public Contract: Contract;
    public ContractAsset: ContractAsset;
    public CustomFields: any;
}


export class ContractAsset extends UniEntity {
    public static RelativeUrl = 'contractassets';
    public static EntityType = 'ContractAsset';

    public CreatedAt: Date;
    public Deleted: boolean;
    public IsCosignedByDefiner: boolean;
    public ID: number;
    public SpenderAttested: boolean;
    public ContractID: number;
    public StatusCode: number;
    public Cap: number;
    public IsFixedDenominations: boolean;
    public IsIssuedByDefinerOnly: boolean;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public IsAutoDestroy: boolean;
    public IsTransferrable: boolean;
    public Type: AddressType;
    public IsPrivate: boolean;
    public _createguid: string;
    public Contract: Contract;
    public CustomFields: any;
}


export class ContractDebugLog extends UniEntity {
    public static RelativeUrl = 'contractdebuglogs';
    public static EntityType = 'ContractDebugLog';

    public CreatedAt: Date;
    public ContractRunLogID: number;
    public Deleted: boolean;
    public ID: number;
    public ContractID: number;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Type: ContractEventType;
    public Message: string;
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
    public ID: number;
    public ContractID: number;
    public StatusCode: number;
    public Name: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Value: string;
    public _createguid: string;
    public Contract: Contract;
    public CustomFields: any;
}


export class ContractRunLog extends UniEntity {
    public static RelativeUrl = 'contractrunlogs';
    public static EntityType = 'ContractRunLog';

    public CreatedAt: Date;
    public Deleted: boolean;
    public ID: number;
    public ContractTriggerID: number;
    public RunTime: string;
    public ContractID: number;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Type: ContractEventType;
    public Message: string;
    public _createguid: string;
    public Contract: Contract;
    public CustomFields: any;
}


export class ContractTransaction extends UniEntity {
    public static RelativeUrl = 'contracttransactions';
    public static EntityType = 'ContractTransaction';

    public CreatedAt: Date;
    public Deleted: boolean;
    public ID: number;
    public ContractAddressID: number;
    public ContractID: number;
    public StatusCode: number;
    public AssetAddress: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public SenderAddress: string;
    public Amount: number;
    public ReceiverAddress: string;
    public _createguid: string;
    public Contract: Contract;
    public ContractAddress: ContractAddress;
    public CustomFields: any;
}


export class ContractTrigger extends UniEntity {
    public static RelativeUrl = 'contracttriggers';
    public static EntityType = 'ContractTrigger';

    public CreatedAt: Date;
    public Deleted: boolean;
    public ID: number;
    public ExpressionFilter: string;
    public ContractID: number;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public OperationFilter: string;
    public Type: ContractEventType;
    public ModelFilter: string;
    public _createguid: string;
    public Contract: Contract;
    public CustomFields: any;
}


export class Comment extends UniEntity {
    public static RelativeUrl = 'comments';
    public static EntityType = 'Comment';

    public CreatedAt: Date;
    public Deleted: boolean;
    public Text: string;
    public ID: number;
    public EntityType: string;
    public StatusCode: number;
    public UpdatedAt: Date;
    public AuthorID: number;
    public UpdatedBy: string;
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

    public CreatedAt: Date;
    public Deleted: boolean;
    public UserID: number;
    public ID: number;
    public StatusCode: number;
    public CommentID: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public User: User;
    public CustomFields: any;
}


export class ApiKey extends UniEntity {
    public static RelativeUrl = 'apikeys';
    public static EntityType = 'ApiKey';

    public CreatedAt: Date;
    public Description: string;
    public Deleted: boolean;
    public ExternalId: string;
    public ID: number;
    public IntegrationType: TypeOfIntegration;
    public Url: string;
    public StatusCode: number;
    public UpdatedAt: Date;
    public IntegrationKey: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Encrypt: boolean;
    public FilterDate: LocalDate;
    public _createguid: string;
    public CustomFields: any;
}


export class Altinn extends UniEntity {
    public static RelativeUrl = 'altinn';
    public static EntityType = 'Altinn';

    public CreatedAt: Date;
    public Deleted: boolean;
    public Language: string;
    public SystemID: string;
    public SystemPw: string;
    public ID: number;
    public StatusCode: number;
    public PreferredLogin: TypeOfLogin;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class AltinnReceipt extends UniEntity {
    public static RelativeUrl = 'altinnreceipts';
    public static EntityType = 'AltinnReceipt';

    public CreatedAt: Date;
    public UserSign: string;
    public Deleted: boolean;
    public ID: number;
    public AltinnResponseData: string;
    public StatusCode: number;
    public UpdatedAt: Date;
    public TimeStamp: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public XmlReceipt: string;
    public ReceiptID: number;
    public ErrorText: string;
    public HasBeenRegistered: boolean;
    public Form: string;
    public _createguid: string;
    public Signings: Array<AltinnSigning>;
    public CustomFields: any;
}


export class AltinnSigning extends UniEntity {
    public static RelativeUrl = 'altinnsigning';
    public static EntityType = 'AltinnSigning';

    public CreatedAt: Date;
    public Deleted: boolean;
    public ID: number;
    public StatusText: string;
    public StatusCode: number;
    public SignatureText: string;
    public DateSigned: Date;
    public UpdatedAt: Date;
    public SignatureReference: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public AltinnReceiptID: number;
    public _createguid: string;
    public AltinnReceipt: AltinnReceipt;
    public CustomFields: any;
}


export class Barnepass extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Barnepass';

    public CreatedAt: Date;
    public Deleted: boolean;
    public ID: number;
    public StatusCode: number;
    public inntektsaar: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public oppgave: Array<BarnepassOppgave>;
    public CustomFields: any;
}


export class BarnepassOppgave extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'BarnepassOppgave';

    public CreatedAt: Date;
    public foedselsnummer: string;
    public Deleted: boolean;
    public ID: number;
    public paaloeptBeloep: number;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public navn: string;
    public BarnepassID: number;
    public email: string;
    public _createguid: string;
    public CustomFields: any;
}


export class UserRole extends UniEntity {
    public static RelativeUrl = 'userroles';
    public static EntityType = 'UserRole';

    public CreatedAt: Date;
    public Deleted: boolean;
    public UserID: number;
    public ID: number;
    public SharedRoleId: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public SharedRoleName: string;
    public _createguid: string;
    public User: User;
    public CustomFields: any;
}


export class Role extends UniEntity {
    public static RelativeUrl = 'roles';
    public static EntityType = 'Role';

    public CreatedAt: Date;
    public Description: string;
    public Deleted: boolean;
    public ID: number;
    public Name: string;
    public UpdatedAt: Date;
    public Label: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public RolePermissions: Array<RolePermission>;
    public CustomFields: any;
}


export class RolePermission extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'RolePermission';

    public CreatedAt: Date;
    public Deleted: boolean;
    public ID: number;
    public RoleID: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
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

    public CreatedAt: Date;
    public Deleted: boolean;
    public ID: number;
    public Name: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public RolePermissions: Array<RolePermission>;
    public CustomFields: any;
}


export class AvtaleGiroAgreement extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AvtaleGiroAgreement';

    public CreatedAt: Date;
    public Description: string;
    public Deleted: boolean;
    public ID: number;
    public NextNumber: number;
    public Thumbprint: string;
    public UpdatedAt: Date;
    public DataSender: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public KeyPath: string;
    public _createguid: string;
    public CustomFields: any;
}


export class AvtaleGiroBankAccount extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AvtaleGiroBankAccount';

    public CreatedAt: Date;
    public CompanyID: number;
    public Deleted: boolean;
    public AvtaleGiroAgreementID: number;
    public ID: number;
    public UpdatedAt: Date;
    public BankAccountNumber: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public Company: Company;
    public CustomFields: any;
}


export class AvtaleGiroFile extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AvtaleGiroFile';

    public CreatedAt: Date;
    public CompanyID: number;
    public Deleted: boolean;
    public AvtaleGiroAgreementID: number;
    public ID: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public AvtaleGiroContent: string;
    public FileID: number;
    public AvtaleGiroMergedFileID: number;
    public _createguid: string;
    public Company: Company;
    public CustomFields: any;
}


export class AvtaleGiroMergedFile extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AvtaleGiroMergedFile';

    public CreatedAt: Date;
    public Deleted: boolean;
    public TransmissionNumber: number;
    public ID: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class BankAgreement extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'BankAgreement';

    public CreatedAt: Date;
    public CompanyID: number;
    public Deleted: boolean;
    public CustomerName: string;
    public CustomerOrgNumber: string;
    public ReceiptDate: Date;
    public ID: number;
    public AccountOwnerName: string;
    public OrderName: string;
    public UpdatedAt: Date;
    public OrderEmail: string;
    public UpdatedBy: string;
    public ServiceAccountID: number;
    public CreatedBy: string;
    public ReceiptID: string;
    public ServiceID: string;
    public AccountOwnerOrgNumber: string;
    public OrderMobile: string;
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
    public FileType: string;
    public KidRule: string;
    public Deleted: boolean;
    public ID: number;
    public ServiceType: number;
    public DivisionID: number;
    public ConfirmInNetbank: boolean;
    public BankAgreementID: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public DivisionName: string;
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
    public ID: number;
    public AccountNumber: string;
    public UpdatedAt: Date;
    public BankServiceID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public BankService: BankService;
    public CustomFields: any;
}


export class Company extends UniEntity {
    public static RelativeUrl = 'companies';
    public static EntityType = 'Company';

    public CreatedAt: Date;
    public Deleted: boolean;
    public ID: number;
    public ClientNumber: number;
    public SchemaName: string;
    public Name: string;
    public LastActivity: Date;
    public FileFlowOrgnrEmail: string;
    public UpdatedAt: Date;
    public ConnectionString: string;
    public OrganizationNumber: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public FileFlowEmail: string;
    public IsGlobalTemplate: boolean;
    public IsTest: boolean;
    public IsTemplate: boolean;
    public WebHookSubscriberId: string;
    public Key: string;
    public _createguid: string;
    public CustomFields: any;
}


export class CompanyAccess extends UniEntity {
    public static RelativeUrl = 'companies-access';
    public static EntityType = 'CompanyAccess';

    public CreatedAt: Date;
    public CompanyID: number;
    public Deleted: boolean;
    public ID: number;
    public Roles: string;
    public StatusCode: number;
    public GlobalIdentity: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public EndDate: Date;
    public StartDate: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class CompanyBackup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'CompanyBackup';

    public CreatedAt: Date;
    public Deleted: boolean;
    public ScheduledForDeleteAt: Date;
    public CustomerName: string;
    public CloudBlobName: string;
    public ID: number;
    public CompanyKey: string;
    public ContractID: number;
    public SchemaName: string;
    public Reason: string;
    public Environment: string;
    public ContainerName: string;
    public CompanyName: string;
    public UpdatedAt: Date;
    public BackupStatus: BackupStatus;
    public UpdatedBy: string;
    public ContractType: number;
    public CreatedBy: string;
    public DeletedAt: Date;
    public CopyFiles: boolean;
    public Message: string;
    public OrgNumber: string;
    public _createguid: string;
    public CustomFields: any;
}


export class ContractCron extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ContractCron';

    public CreatedAt: Date;
    public CompanyID: number;
    public Deleted: boolean;
    public ID: number;
    public ContractTriggerID: number;
    public ContractID: number;
    public UpdatedAt: Date;
    public Expression: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public CompanyKey: string;
    public CompanyDbName: string;
    public CustomFields: any;
}


export class ContractObyte extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ContractObyte';

    public CreatedAt: Date;
    public CompanyID: number;
    public Deleted: boolean;
    public ID: number;
    public ContractAddressID: number;
    public ContractID: number;
    public AssetAddress: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Address: string;
    public _createguid: string;
    public CompanyKey: string;
    public CompanyDbName: string;
    public CustomFields: any;
}


export class DeniedUserAccessLog extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'DeniedUserAccessLog';

    public CreatedAt: Date;
    public CompanyID: number;
    public Deleted: boolean;
    public ID: number;
    public Occurred: Date;
    public CompanyName: string;
    public UpdatedAt: Date;
    public Username: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Email: string;
    public Message: string;
    public _createguid: string;
    public Company: Company;
    public CustomFields: any;
}


export class FailedBankFile extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'FailedBankFile';

    public CreatedAt: Date;
    public FailedReason: FailedReasonEnum;
    public Deleted: boolean;
    public FileName: string;
    public ID: number;
    public CompanyKey: string;
    public FileContent: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class HangfireJob extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'HangfireJob';

    public CreatedAt: Date;
    public CompanyID: number;
    public ID: number;
    public CompanyKey: string;
    public Completed: boolean;
    public HasError: boolean;
    public Year: number;
    public GlobalIdentity: string;
    public UpdatedAt: Date;
    public Status: number;
    public JobId: string;
    public CustomFields: any;
}


export class HangfireJobContext extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'HangfireJobContext';

    public CreatedAt: Date;
    public CompanyID: number;
    public ID: number;
    public CompanyKey: string;
    public SchemaName: string;
    public Completed: boolean;
    public HasError: boolean;
    public Year: number;
    public GlobalIdentity: string;
    public UpdatedAt: Date;
    public Status: number;
    public JobId: string;
    public CustomFields: any;
}


export class HangfireResponse extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'HangfireResponse';

    public CreatedAt: Date;
    public CompanyID: number;
    public ID: number;
    public CompanyKey: string;
    public ProgressUrl: string;
    public Completed: boolean;
    public HasError: boolean;
    public Year: number;
    public GlobalIdentity: string;
    public State: string;
    public UpdatedAt: Date;
    public Status: number;
    public JobId: string;
    public CustomFields: any;
}


export class KpiDefinition extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'KpiDefinition';

    public CreatedAt: Date;
    public CompanyID: number;
    public RoleNames: string;
    public Deleted: boolean;
    public IsPerUser: boolean;
    public ID: number;
    public Application: string;
    public Name: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public SourceType: KpiSourceType;
    public RefreshModels: string;
    public Interval: string;
    public Route: string;
    public ValueType: KpiValueType;
    public _createguid: string;
    public CustomFields: any;
}


export class KpiValue extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'KpiValue';

    public CreatedAt: Date;
    public CompanyID: number;
    public Deleted: boolean;
    public Text: string;
    public Counter: number;
    public ID: number;
    public LastUpdated: Date;
    public KpiName: string;
    public UpdatedAt: Date;
    public ValueStatus: KpiValueStatus;
    public Total: number;
    public KpiDefinitionID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UserIdentity: string;
    public _createguid: string;
    public CustomFields: any;
}


export class OutgoingInvoice extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'OutgoingInvoice';

    public CreatedAt: Date;
    public CompanyID: number;
    public Deleted: boolean;
    public DueDate: Date;
    public ID: number;
    public ExternalReference: string;
    public StatusCode: number;
    public InvoiceType: OutgoingInvoiceType;
    public MetaJson: string;
    public ISPOrganizationNumber: string;
    public RecipientPhoneNumber: string;
    public UpdatedAt: Date;
    public RecipientOrganizationNumber: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public InvoiceID: number;
    public Status: number;
    public Amount: number;
    public _createguid: string;
    public Company: Company;
    public CustomFields: any;
}


export class ProcessFileLog extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ProcessFileLog';

    public CreatedAt: Date;
    public FileType: number;
    public EntityName: string;
    public CompanyID: number;
    public Deleted: boolean;
    public FileName: string;
    public ID: number;
    public CompanyKey: string;
    public StatusCode: number;
    public EntityCount: number;
    public CompanyName: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public FileID: number;
    public EntityInstanceID: string;
    public UserIdentity: string;
    public Message: string;
    public _createguid: string;
    public Company: Company;
    public CustomFields: any;
}


export class ServiceAccount extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ServiceAccount';

    public CreatedAt: Date;
    public Description: string;
    public Deleted: boolean;
    public ID: number;
    public NextNumber: number;
    public Thumbprint: string;
    public UpdatedAt: Date;
    public DataSender: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public KeyPath: string;
    public _createguid: string;
    public CustomFields: any;
}


export class UserVerification extends UniEntity {
    public static RelativeUrl = 'user-verifications';
    public static EntityType = 'UserVerification';

    public CreatedAt: Date;
    public CompanyId: number;
    public Deleted: boolean;
    public UserId: number;
    public ID: number;
    public VerificationCode: string;
    public StatusCode: number;
    public ExpirationDate: Date;
    public DisplayName: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public VerificationDate: Date;
    public Email: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Account extends UniEntity {
    public static RelativeUrl = 'accounts';
    public static EntityType = 'Account';

    public CreatedAt: Date;
    public Description: string;
    public Deleted: boolean;
    public LockManualPosts: boolean;
    public CustomerID: number;
    public VatTypeID: number;
    public ID: number;
    public UseVatDeductionGroupID: number;
    public EmployeeID: number;
    public StatusCode: number;
    public CostAllocationID: number;
    public AccountGroupID: number;
    public AccountName: string;
    public AccountNumber: number;
    public CurrencyCodeID: number;
    public SystemAccount: boolean;
    public DimensionsID: number;
    public Visible: boolean;
    public Locked: boolean;
    public TopLevelAccountGroupID: number;
    public UpdatedAt: Date;
    public Keywords: string;
    public Active: boolean;
    public DoSynchronize: boolean;
    public AccountID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public UsePostPost: boolean;
    public AccountSetupID: number;
    public SupplierID: number;
    public SaftMappingAccountID: number;
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
    public ID: number;
    public StatusCode: number;
    public Name: string;
    public UpdatedAt: Date;
    public AccountID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class AccountGroup extends UniEntity {
    public static RelativeUrl = 'accountgroups';
    public static EntityType = 'AccountGroup';

    public CreatedAt: Date;
    public Deleted: boolean;
    public ID: number;
    public GroupNumber: string;
    public AccountGroupSetID: number;
    public StatusCode: number;
    public Name: string;
    public AccountGroupSetupID: number;
    public MainGroupID: number;
    public UpdatedAt: Date;
    public Summable: boolean;
    public AccountID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public CompatibleAccountID: number;
    public _createguid: string;
    public MainGroup: AccountGroup;
    public AccountGroupSet: AccountGroupSet;
    public CustomFields: any;
}


export class AccountGroupSet extends UniEntity {
    public static RelativeUrl = 'accountgroupsets';
    public static EntityType = 'AccountGroupSet';

    public CreatedAt: Date;
    public Deleted: boolean;
    public SubAccountAllowed: boolean;
    public ID: number;
    public StatusCode: number;
    public Name: string;
    public Shared: boolean;
    public FromAccountNumber: number;
    public UpdatedAt: Date;
    public ToAccountNumber: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public System: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class AccountMandatoryDimension extends UniEntity {
    public static RelativeUrl = 'accountmandatorydimension';
    public static EntityType = 'AccountMandatoryDimension';

    public CreatedAt: Date;
    public Deleted: boolean;
    public ID: number;
    public DimensionNo: number;
    public StatusCode: number;
    public UpdatedAt: Date;
    public AccountID: number;
    public MandatoryType: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Accrual extends UniEntity {
    public static RelativeUrl = 'accruals';
    public static EntityType = 'Accrual';

    public CreatedAt: Date;
    public ResultAccountID: number;
    public Deleted: boolean;
    public ID: number;
    public AccrualJournalEntryMode: number;
    public StatusCode: number;
    public JournalEntryLineDraftID: number;
    public UpdatedAt: Date;
    public AccrualAmount: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public BalanceAccountID: number;
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
    public Deleted: boolean;
    public ID: number;
    public StatusCode: number;
    public AccrualID: number;
    public JournalEntryDraftLineID: number;
    public PeriodNo: number;
    public UpdatedAt: Date;
    public AccountYear: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Amount: number;
    public _createguid: string;
    public Accrual: Accrual;
    public JournalEntryLineDraft: JournalEntryLineDraft;
    public CustomFields: any;
}


export class Asset extends UniEntity {
    public static RelativeUrl = 'assets';
    public static EntityType = 'Asset';

    public CreatedAt: Date;
    public Deleted: boolean;
    public PurchaseDate: LocalDate;
    public ID: number;
    public DepreciationCycle: number;
    public StatusCode: number;
    public Name: string;
    public ScrapValue: number;
    public DepreciationAccountID: number;
    public DimensionsID: number;
    public UpdatedAt: Date;
    public DepreciationStartDate: LocalDate;
    public UpdatedBy: string;
    public AutoDepreciation: boolean;
    public CreatedBy: string;
    public AssetGroupCode: string;
    public BalanceAccountID: number;
    public Lifetime: number;
    public NetFinancialValue: number;
    public PurchaseAmount: number;
    public _createguid: string;
    public CurrentNetFinancialValue: number;
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

    public CreatedAt: Date;
    public PhoneID: number;
    public Deleted: boolean;
    public EmailID: number;
    public ID: number;
    public BIC: string;
    public StatusCode: number;
    public Name: string;
    public Web: string;
    public InitialBIC: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public AddressID: number;
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
    public Deleted: boolean;
    public ID: number;
    public IntegrationSettings: string;
    public StatusCode: number;
    public AccountNumber: string;
    public BankID: number;
    public Locked: boolean;
    public IntegrationStatus: number;
    public UpdatedAt: Date;
    public Label: string;
    public BankAccountType: string;
    public BusinessRelationID: number;
    public AccountID: number;
    public UpdatedBy: string;
    public CompanySettingsID: number;
    public CreatedBy: string;
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

    public CreatedAt: Date;
    public ServiceProvider: number;
    public Deleted: boolean;
    public ID: number;
    public StatusCode: number;
    public IsOutgoing: boolean;
    public Name: string;
    public HasNewAccountInformation: boolean;
    public ServiceTemplateID: string;
    public UpdatedAt: Date;
    public DefaultAgreement: boolean;
    public UpdatedBy: string;
    public BankAcceptance: boolean;
    public CreatedBy: string;
    public HasOrderedIntegrationChange: boolean;
    public ServiceID: string;
    public IsInbound: boolean;
    public BankAccountID: number;
    public Email: string;
    public IsBankBalance: boolean;
    public PropertiesJson: string;
    public Password: string;
    public _createguid: string;
    public BankAccount: BankAccount;
    public CustomFields: any;
}


export class BankRule extends UniEntity {
    public static RelativeUrl = 'bankrules';
    public static EntityType = 'BankRule';

    public CreatedAt: Date;
    public Deleted: boolean;
    public ActionCode: ActionCodeBankRule;
    public ID: number;
    public StatusCode: number;
    public Name: string;
    public Rule: string;
    public IsActive: boolean;
    public UpdatedAt: Date;
    public AccountID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Priority: number;
    public _createguid: string;
    public Account: Account;
    public CustomFields: any;
}


export class BankStatement extends UniEntity {
    public static RelativeUrl = 'bankstatements';
    public static EntityType = 'BankStatement';

    public CreatedAt: Date;
    public AmountCurrency: number;
    public Deleted: boolean;
    public ID: number;
    public EndBalance: number;
    public StatusCode: number;
    public ArchiveReference: string;
    public StartBalance: number;
    public UpdatedAt: Date;
    public AccountID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public FileID: number;
    public BankAccountID: number;
    public ToDate: LocalDate;
    public Amount: number;
    public FromDate: LocalDate;
    public CurrencyCode: string;
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

    public CreatedAt: Date;
    public AmountCurrency: number;
    public Description: string;
    public Deleted: boolean;
    public SenderName: string;
    public ID: number;
    public Category: string;
    public ValueDate: LocalDate;
    public InvoiceNumber: string;
    public ReceiverAccount: string;
    public StatusCode: number;
    public ArchiveReference: string;
    public Receivername: string;
    public CID: string;
    public BookingDate: LocalDate;
    public OpenAmountCurrency: number;
    public UpdatedAt: Date;
    public TransactionId: string;
    public BankStatementID: number;
    public StructuredReference: string;
    public OpenAmount: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public SenderAccount: string;
    public Amount: number;
    public CurrencyCode: string;
    public _createguid: string;
    public BankStatement: BankStatement;
    public CustomFields: any;
}


export class BankStatementMatch extends UniEntity {
    public static RelativeUrl = 'bankstatementmatch';
    public static EntityType = 'BankStatementMatch';

    public CreatedAt: Date;
    public Deleted: boolean;
    public ID: number;
    public Group: string;
    public StatusCode: number;
    public BankStatementEntryID: number;
    public JournalEntryLineID: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Batch: string;
    public Amount: number;
    public _createguid: string;
    public BankStatementEntry: BankStatementEntry;
    public JournalEntryLine: JournalEntryLine;
    public CustomFields: any;
}


export class BankStatementRule extends UniEntity {
    public static RelativeUrl = 'bankstatementrules';
    public static EntityType = 'BankStatementRule';

    public CreatedAt: Date;
    public Deleted: boolean;
    public ID: number;
    public EntryText: string;
    public StatusCode: number;
    public Name: string;
    public Rule: string;
    public IsActive: boolean;
    public DimensionsID: number;
    public UpdatedAt: Date;
    public AccountID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public Priority: number;
    public _createguid: string;
    public Dimensions: Dimensions;
    public Account: Account;
    public CustomFields: any;
}


export class Budget extends UniEntity {
    public static RelativeUrl = 'budgets';
    public static EntityType = 'Budget';

    public CreatedAt: Date;
    public Deleted: boolean;
    public ID: number;
    public AccountingYear: number;
    public StatusCode: number;
    public Name: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public Entries: Array<BudgetEntry>;
    public CustomFields: any;
}


export class BudgetEntry extends UniEntity {
    public static RelativeUrl = 'budgetentries';
    public static EntityType = 'BudgetEntry';

    public CreatedAt: Date;
    public Deleted: boolean;
    public ID: number;
    public StatusCode: number;
    public DimensionsID: number;
    public UpdatedAt: Date;
    public BudgetID: number;
    public AccountID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public PeriodNumber: number;
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

    public CreatedAt: Date;
    public AssetSaleLossNoVatAccountID: number;
    public ReInvoicingCostsharingProductID: number;
    public Deleted: boolean;
    public ID: number;
    public AssetSaleLossVatAccountID: number;
    public AssetWriteoffAccountID: number;
    public AssetSaleProductID: number;
    public StatusCode: number;
    public ReInvoicingMethod: number;
    public AssetSaleLossBalancingAccountID: number;
    public UpdatedAt: Date;
    public AssetSaleProfitNoVatAccountID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public ReInvoicingTurnoverProductID: number;
    public AssetSaleProfitBalancingAccountID: number;
    public AssetSaleProfitVatAccountID: number;
    public _createguid: string;
    public ReInvoicingCostsharingProduct: Product;
    public ReInvoicingTurnoverProduct: Product;
    public CustomFields: any;
}


export class CompanyBankAccount extends UniEntity {
    public static RelativeUrl = 'companybankaccounts';
    public static EntityType = 'CompanyBankAccount';

    public CreatedAt: Date;
    public Deleted: boolean;
    public IsTax: boolean;
    public CreditAmount: number;
    public ID: number;
    public StatusCode: number;
    public IsOutgoing: boolean;
    public Name: string;
    public IsSalary: boolean;
    public UpdatedAt: Date;
    public AccountID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public BankAccountID: number;
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
    public ID: number;
    public StatusCode: number;
    public Name: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public Items: Array<CostAllocationItem>;
    public CustomFields: any;
}


export class CostAllocationItem extends UniEntity {
    public static RelativeUrl = 'costallocationitems';
    public static EntityType = 'CostAllocationItem';

    public CreatedAt: Date;
    public Description: string;
    public Deleted: boolean;
    public VatTypeID: number;
    public ID: number;
    public StatusCode: number;
    public CostAllocationID: number;
    public DimensionsID: number;
    public UpdatedAt: Date;
    public Percent: number;
    public AccountID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
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

    public CreatedAt: Date;
    public AmountCurrency: number;
    public Description: string;
    public Deleted: boolean;
    public CustomLiquidityPaymentType: CustomLiquidityPaymentInterval;
    public DueDate: LocalDate;
    public ID: number;
    public StatusCode: number;
    public CurrencyCodeID: number;
    public IsCustomerPayment: boolean;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public EndDate: LocalDate;
    public Amount: number;
    public _createguid: string;
    public currency: CurrencyCode;
    public CustomFields: any;
}


export class DepreciationLine extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'DepreciationLine';

    public CreatedAt: Date;
    public AssetJELineID: number;
    public Deleted: boolean;
    public ID: number;
    public AssetID: number;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public DepreciationType: number;
    public DepreciationJELineID: number;
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
    public ID: number;
    public ValidTo: LocalDate;
    public StatusCode: number;
    public Year: number;
    public ValidFrom: LocalDate;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class JournalEntry extends UniEntity {
    public static RelativeUrl = 'journalentries';
    public static EntityType = 'JournalEntry';

    public CreatedAt: Date;
    public Description: string;
    public Deleted: boolean;
    public ID: number;
    public StatusCode: number;
    public JournalEntryNumber: string;
    public NumberSeriesID: number;
    public JournalEntryAccrualID: number;
    public JournalEntryNumberNumeric: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public FinancialYearID: number;
    public NumberSeriesTaskID: number;
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

    public CreatedAt: Date;
    public AmountCurrency: number;
    public OriginalJournalEntryPost: number;
    public Description: string;
    public Deleted: boolean;
    public DueDate: LocalDate;
    public VatTypeID: number;
    public CurrencyExchangeRate: number;
    public ID: number;
    public InvoiceNumber: string;
    public VatDeductionPercent: number;
    public RegisteredDate: LocalDate;
    public SubAccountID: number;
    public StatusCode: number;
    public JournalEntryNumber: string;
    public CustomerInvoiceID: number;
    public AccrualID: number;
    public VatPercent: number;
    public JournalEntryLineDraftID: number;
    public CurrencyCodeID: number;
    public VatReportID: number;
    public VatDate: LocalDate;
    public JournalEntryNumberNumeric: number;
    public JournalEntryTypeID: number;
    public ReferenceOriginalPostID: number;
    public PaymentReferenceID: number;
    public DimensionsID: number;
    public CustomerOrderID: number;
    public UpdatedAt: Date;
    public Signature: string;
    public OriginalReferencePostID: number;
    public AccountID: number;
    public TaxBasisAmountCurrency: number;
    public UpdatedBy: string;
    public VatPeriodID: number;
    public CreatedBy: string;
    public JournalEntryID: number;
    public PostPostJournalEntryLineID: number;
    public PeriodID: number;
    public BatchNumber: number;
    public TaxBasisAmount: number;
    public FinancialDate: LocalDate;
    public PaymentInfoTypeID: number;
    public SupplierInvoiceID: number;
    public PaymentID: string;
    public VatJournalEntryPostID: number;
    public RestAmount: number;
    public RestAmountCurrency: number;
    public Amount: number;
    public ReferenceCreditPostID: number;
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
    public AmountCurrency: number;
    public Description: string;
    public Deleted: boolean;
    public DueDate: LocalDate;
    public VatTypeID: number;
    public CurrencyExchangeRate: number;
    public ID: number;
    public InvoiceNumber: string;
    public VatDeductionPercent: number;
    public RegisteredDate: LocalDate;
    public SubAccountID: number;
    public StatusCode: number;
    public JournalEntryNumber: string;
    public CustomerInvoiceID: number;
    public AccrualID: number;
    public VatPercent: number;
    public CurrencyCodeID: number;
    public VatDate: LocalDate;
    public JournalEntryNumberNumeric: number;
    public JournalEntryTypeID: number;
    public PaymentReferenceID: number;
    public DimensionsID: number;
    public CustomerOrderID: number;
    public UpdatedAt: Date;
    public Signature: string;
    public AccountID: number;
    public TaxBasisAmountCurrency: number;
    public UpdatedBy: string;
    public VatPeriodID: number;
    public CreatedBy: string;
    public JournalEntryID: number;
    public PostPostJournalEntryLineID: number;
    public PeriodID: number;
    public BatchNumber: number;
    public TaxBasisAmount: number;
    public FinancialDate: LocalDate;
    public PaymentInfoTypeID: number;
    public SupplierInvoiceID: number;
    public PaymentID: string;
    public Amount: number;
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
    public Deleted: boolean;
    public ID: number;
    public VisibleModules: string;
    public StatusCode: number;
    public Name: string;
    public ColumnSetUp: string;
    public UpdatedAt: Date;
    public TraceLinkTypes: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class JournalEntrySourceSerie extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'JournalEntrySourceSerie';

    public CreatedAt: Date;
    public Deleted: boolean;
    public ID: number;
    public StatusCode: number;
    public JournalEntrySourceID: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public JournalEntrySourceInstanceID: number;
    public JournalEntrySourceEntityName: string;
    public CustomFields: any;
}


export class JournalEntryType extends UniEntity {
    public static RelativeUrl = 'journalentrytypes';
    public static EntityType = 'JournalEntryType';

    public CreatedAt: Date;
    public Deleted: boolean;
    public ID: number;
    public Name: string;
    public Number: number;
    public DisplayName: string;
    public MainName: string;
    public UpdatedAt: Date;
    public ExpectNegativeAmount: boolean;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class LedgerSuggestion extends UniEntity {
    public Source: SuggestionSource;
    public BusinessType: string;
    public ID: number;
    public Name: string;
    public IndustryName: string;
    public IndustryCode: string;
    public OrgNumber: string;
}


export class Payment extends UniEntity {
    public static RelativeUrl = 'payments';
    public static EntityType = 'Payment';

    public CreatedAt: Date;
    public AmountCurrency: number;
    public PaymentCodeID: number;
    public Description: string;
    public Deleted: boolean;
    public DueDate: LocalDate;
    public IsPaymentClaim: boolean;
    public Domain: string;
    public PaymentDate: LocalDate;
    public PaymentStatusReportFileID: number;
    public CurrencyExchangeRate: number;
    public ID: number;
    public StatusText: string;
    public InvoiceNumber: string;
    public ReconcilePayment: boolean;
    public StatusCode: number;
    public XmlTagPmtInfIdReference: string;
    public CustomerInvoiceID: number;
    public Debtor: string;
    public SerialNumberOrAcctSvcrRef: string;
    public InPaymentID: string;
    public CurrencyCodeID: number;
    public CustomerInvoiceReminderID: number;
    public IsCustomerPayment: boolean;
    public IsPaymentCancellationRequest: boolean;
    public BankChargeAmount: number;
    public UpdatedAt: Date;
    public XmlTagEndToEndIdReference: string;
    public BusinessRelationID: number;
    public PaymentBatchID: number;
    public ToBankAccountID: number;
    public IsExternal: boolean;
    public PaymentNotificationReportFileID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public JournalEntryID: number;
    public Proprietary: string;
    public ExternalBankAccountNumber: string;
    public SupplierInvoiceID: number;
    public PaymentID: string;
    public Amount: number;
    public OcrPaymentStrings: string;
    public AutoJournal: boolean;
    public FromBankAccountID: number;
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

    public CreatedAt: Date;
    public Deleted: boolean;
    public PaymentBatchTypeID: number;
    public PaymentStatusReportFileID: number;
    public OcrTransmissionNumber: number;
    public ReceiptDate: Date;
    public ID: number;
    public StatusCode: number;
    public OcrHeadingStrings: string;
    public TransferredDate: Date;
    public PaymentFileID: number;
    public Camt054CMsgId: string;
    public IsCustomerPayment: boolean;
    public NumberOfPayments: number;
    public PaymentReferenceID: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public TotalAmount: number;
    public _createguid: string;
    public Payments: Array<Payment>;
    public PaymentBatchType: PaymentBatchType;
    public CustomFields: any;
}


export class PostPost extends UniEntity {
    public static RelativeUrl = 'postposts';
    public static EntityType = 'PostPost';

    public CreatedAt: Date;
    public AmountCurrency: number;
    public Deleted: boolean;
    public CurrencyExchangeRate: number;
    public ID: number;
    public StatusCode: number;
    public CurrencyCodeID: number;
    public UpdatedAt: Date;
    public JournalEntryLine2ID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public JournalEntryLine1ID: number;
    public Date: LocalDate;
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

    public CreatedAt: Date;
    public TaxExclusiveAmount: number;
    public Deleted: boolean;
    public ID: number;
    public ReInvoicingType: number;
    public StatusCode: number;
    public TaxInclusiveAmount: number;
    public UpdatedAt: Date;
    public OwnCostAmount: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public OwnCostShare: number;
    public SupplierInvoiceID: number;
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

    public CreatedAt: Date;
    public Deleted: boolean;
    public CustomerID: number;
    public ID: number;
    public StatusCode: number;
    public ReInvoiceID: number;
    public Vat: number;
    public Share: number;
    public Surcharge: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public NetAmount: number;
    public GrossAmount: number;
    public _createguid: string;
    public Customer: Customer;
    public CustomFields: any;
}


export class SupplierInvoice extends UniEntity {
    public static RelativeUrl = 'supplierinvoices';
    public static EntityType = 'SupplierInvoice';

    public CreatedAt: Date;
    public InvoiceReferenceID: number;
    public CustomerPerson: string;
    public TaxExclusiveAmount: number;
    public InternalNote: string;
    public Deleted: boolean;
    public CustomerOrgNumber: string;
    public ShippingCountryCode: string;
    public SalesPerson: string;
    public ShippingPostalCode: string;
    public ShippingAddressLine1: string;
    public InvoicePostalCode: string;
    public PaymentTerm: string;
    public CurrencyExchangeRate: number;
    public ProjectID: number;
    public PaymentDueDate: LocalDate;
    public ID: number;
    public InvoiceCity: string;
    public VatTotalsAmount: number;
    public InvoiceNumber: string;
    public DeliveryName: string;
    public Requisition: string;
    public VatTotalsAmountCurrency: number;
    public FreeTxt: string;
    public ShippingAddressLine3: string;
    public StatusCode: number;
    public InvoiceType: number;
    public ShippingCity: string;
    public TaxInclusiveAmount: number;
    public PayableRoundingAmount: number;
    public CreditedAmount: number;
    public ShippingCountry: string;
    public Comment: string;
    public ShippingAddressLine2: string;
    public DeliveryTerm: string;
    public TaxInclusiveAmountCurrency: number;
    public PaymentStatus: number;
    public InvoiceReceiverName: string;
    public CurrencyCodeID: number;
    public InvoiceOriginType: SupplierInvoiceOriginType;
    public SupplierOrgNumber: string;
    public ReInvoiceID: number;
    public Payment: string;
    public PrintStatus: number;
    public InvoiceAddressLine2: string;
    public UpdatedAt: Date;
    public Credited: boolean;
    public YourReference: string;
    public InvoiceDate: LocalDate;
    public PaymentTermsID: number;
    public UpdatedBy: string;
    public InvoiceAddressLine1: string;
    public DefaultDimensionsID: number;
    public CreatedBy: string;
    public CreditDays: number;
    public JournalEntryID: number;
    public IsSentToPayment: boolean;
    public AmountRegards: string;
    public PaymentInformation: string;
    public OurReference: string;
    public DeliveryDate: LocalDate;
    public BankAccountID: number;
    public TaxExclusiveAmountCurrency: number;
    public CreditedAmountCurrency: number;
    public PaymentID: string;
    public PayableRoundingCurrencyAmount: number;
    public DeliveryMethod: string;
    public DeliveryTermsID: number;
    public InvoiceAddressLine3: string;
    public RestAmount: number;
    public RestAmountCurrency: number;
    public InvoiceCountry: string;
    public SupplierID: number;
    public InvoiceCountryCode: string;
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

    public CreatedAt: Date;
    public Unit: string;
    public SumTotalIncVat: number;
    public NumberOfItems: number;
    public Deleted: boolean;
    public DiscountCurrency: number;
    public PriceExVatCurrency: number;
    public SumTotalExVat: number;
    public CalculateGrossPriceBasedOnNetPrice: boolean;
    public VatTypeID: number;
    public CurrencyExchangeRate: number;
    public ID: number;
    public StatusCode: number;
    public ItemText: string;
    public PriceSetByUser: boolean;
    public PriceExVat: number;
    public VatPercent: number;
    public Comment: string;
    public SumVatCurrency: number;
    public CurrencyCodeID: number;
    public AccountingCost: string;
    public DiscountPercent: number;
    public DimensionsID: number;
    public Discount: number;
    public UpdatedAt: Date;
    public SortIndex: number;
    public UpdatedBy: string;
    public CreatedBy: string;
    public SumTotalIncVatCurrency: number;
    public InvoicePeriodEndDate: LocalDate;
    public SumVat: number;
    public SupplierInvoiceID: number;
    public ProductID: number;
    public PriceIncVat: number;
    public SumTotalExVatCurrency: number;
    public InvoicePeriodStartDate: LocalDate;
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

    public CreatedAt: Date;
    public No: string;
    public Deleted: boolean;
    public ID: number;
    public StatusCode: number;
    public Name: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class VatDeduction extends UniEntity {
    public static RelativeUrl = 'vatdeductions';
    public static EntityType = 'VatDeduction';

    public CreatedAt: Date;
    public Deleted: boolean;
    public ID: number;
    public ValidTo: LocalDate;
    public StatusCode: number;
    public ValidFrom: LocalDate;
    public DeductionPercent: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
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
    public ID: number;
    public StatusCode: number;
    public Name: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class VatPost extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'VatPost';

    public CreatedAt: Date;
    public ReportAsNegativeAmount: boolean;
    public No: string;
    public Deleted: boolean;
    public ID: number;
    public HasTaxBasis: boolean;
    public StatusCode: number;
    public Name: string;
    public VatCodeGroupID: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
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
    public Deleted: boolean;
    public ID: number;
    public Title: string;
    public StatusCode: number;
    public Comment: string;
    public TerminPeriodID: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public ReportedDate: Date;
    public JournalEntryID: number;
    public ExternalRefNo: string;
    public VatReportArchivedSummaryID: number;
    public VatReportTypeID: number;
    public ExecutedDate: Date;
    public InternalComment: string;
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

    public CreatedAt: Date;
    public Deleted: boolean;
    public ReportName: string;
    public PaymentToDescription: string;
    public PaymentDueDate: Date;
    public ID: number;
    public PaymentYear: number;
    public StatusCode: number;
    public AmountToBePayed: number;
    public UpdatedAt: Date;
    public SummaryHeader: string;
    public UpdatedBy: string;
    public PaymentPeriod: string;
    public CreatedBy: string;
    public PaymentBankAccountNumber: string;
    public PaymentID: string;
    public AmountToBeReceived: number;
    public _createguid: string;
    public CustomFields: any;
}


export class VatReportReference extends UniEntity {
    public static RelativeUrl = 'vatreportreferences';
    public static EntityType = 'VatReportReference';

    public CreatedAt: Date;
    public Deleted: boolean;
    public VatTypeID: number;
    public ID: number;
    public StatusCode: number;
    public UpdatedAt: Date;
    public AccountID: number;
    public UpdatedBy: string;
    public CreatedBy: string;
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
    public ID: number;
    public StatusCode: number;
    public Name: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class VatType extends UniEntity {
    public static RelativeUrl = 'vattypes';
    public static EntityType = 'VatType';

    public CreatedAt: Date;
    public ReversedTaxDutyVat: boolean;
    public Deleted: boolean;
    public ID: number;
    public OutputVat: boolean;
    public StatusCode: number;
    public Name: string;
    public VatCodeGroupingValue: VatCodeGroupingValueEnum;
    public VatTypeSetupID: number;
    public DirectJournalEntryOnly: boolean;
    public AvailableInModules: boolean;
    public Visible: boolean;
    public VatCodeGroupID: number;
    public Locked: boolean;
    public Alias: string;
    public UpdatedAt: Date;
    public InUse: boolean;
    public UpdatedBy: string;
    public OutgoingAccountID: number;
    public CreatedBy: string;
    public VatCode: string;
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

    public CreatedAt: Date;
    public Deleted: boolean;
    public VatTypeID: number;
    public ID: number;
    public ValidTo: LocalDate;
    public StatusCode: number;
    public VatPercent: number;
    public ValidFrom: LocalDate;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class EntityValidationRule extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'EntityValidationRule';

    public CreatedAt: Date;
    public Deleted: boolean;
    public ID: number;
    public EntityType: string;
    public Operation: OperationType;
    public UpdatedAt: Date;
    public PropertyName: string;
    public Level: ValidationLevel;
    public UpdatedBy: string;
    public CreatedBy: string;
    public SyncKey: string;
    public System: boolean;
    public Operator: Operator;
    public OnConflict: OnConflict;
    public ChangedByCompany: boolean;
    public Message: string;
    public Value: string;
    public _createguid: string;
    public CustomFields: any;
}


export class EntityValidationRuleTemplate extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'EntityValidationRuleTemplate';

    public CreatedAt: Date;
    public Deleted: boolean;
    public ID: number;
    public EntityType: string;
    public Operation: OperationType;
    public UpdatedAt: Date;
    public PropertyName: string;
    public Level: ValidationLevel;
    public UpdatedBy: string;
    public CreatedBy: string;
    public SyncKey: string;
    public System: boolean;
    public Operator: Operator;
    public OnConflict: OnConflict;
    public ChangedByCompany: boolean;
    public Message: string;
    public Value: string;
    public _createguid: string;
    public CustomFields: any;
}


export class ComplexValidationRule extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ComplexValidationRule';

    public CreatedAt: Date;
    public Deleted: boolean;
    public ID: number;
    public EntityType: string;
    public Operation: OperationType;
    public UpdatedAt: Date;
    public ValidationCode: number;
    public Level: ValidationLevel;
    public UpdatedBy: string;
    public CreatedBy: string;
    public SyncKey: string;
    public System: boolean;
    public OnConflict: OnConflict;
    public ChangedByCompany: boolean;
    public Message: string;
    public _createguid: string;
    public CustomFields: any;
}


export class ComplexValidationRuleTemplate extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ComplexValidationRuleTemplate';

    public CreatedAt: Date;
    public Deleted: boolean;
    public ID: number;
    public EntityType: string;
    public Operation: OperationType;
    public UpdatedAt: Date;
    public ValidationCode: number;
    public Level: ValidationLevel;
    public UpdatedBy: string;
    public CreatedBy: string;
    public SyncKey: string;
    public System: boolean;
    public OnConflict: OnConflict;
    public ChangedByCompany: boolean;
    public Message: string;
    public _createguid: string;
    public CustomFields: any;
}


export class CustomField extends UniEntity {
    public static RelativeUrl = 'custom-fields';
    public static EntityType = 'CustomField';

    public CreatedAt: Date;
    public Deleted: boolean;
    public Nullable: boolean;
    public DataType: string;
    public ID: number;
    public StatusCode: number;
    public Name: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public ModelID: number;
    public CreatedBy: string;
    public _createguid: string;
    public CustomFields: any;
}


export class ValueList extends UniEntity {
    public static RelativeUrl = 'valuelists';
    public static EntityType = 'ValueList';

    public CreatedAt: Date;
    public Description: string;
    public Deleted: boolean;
    public ID: number;
    public Name: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Code: string;
    public CreatedBy: string;
    public _createguid: string;
    public Items: Array<ValueItem>;
    public CustomFields: any;
}


export class ValueItem extends UniEntity {
    public static RelativeUrl = 'valueitems';
    public static EntityType = 'ValueItem';

    public CreatedAt: Date;
    public Description: string;
    public Deleted: boolean;
    public ID: number;
    public Name: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Code: string;
    public CreatedBy: string;
    public Index: number;
    public ValueListID: number;
    public Value: string;
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

    public CreatedAt: Date;
    public HelpText: string;
    public LookupField: boolean;
    public Description: string;
    public Deleted: boolean;
    public ValueList: string;
    public ReadOnly: boolean;
    public ComponentLayoutID: number;
    public Hidden: boolean;
    public ID: number;
    public EntityType: string;
    public Url: string;
    public StatusCode: number;
    public Placement: number;
    public Placeholder: string;
    public Width: string;
    public Section: number;
    public Alignment: Alignment;
    public DisplayField: string;
    public UpdatedAt: Date;
    public Label: string;
    public Sectionheader: string;
    public LineBreak: boolean;
    public FieldSet: number;
    public UpdatedBy: string;
    public Property: string;
    public LookupEntityType: string;
    public CreatedBy: string;
    public Combo: number;
    public Legend: string;
    public FieldType: FieldType;
    public Options: string;
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
    public WeekNumber: number;
    public IsWeekend: boolean;
    public Projecttime: number;
    public ExpectedTime: number;
    public StartTime: Date;
    public WeekDay: number;
    public ValidTime: number;
    public TotalTime: number;
    public EndTime: Date;
    public TimeOff: number;
    public Status: WorkStatus;
    public Invoicable: number;
    public Workflow: TimesheetWorkflow;
    public SickTime: number;
    public ValidTimeOff: number;
    public Date: Date;
    public Flextime: number;
    public Overtime: number;
}


export class WorkBalanceDto extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'WorkBalanceDto';

    public CreatedAt: Date;
    public Description: string;
    public Deleted: boolean;
    public Balancetype: WorkBalanceTypeEnum;
    public Days: number;
    public IsStartBalance: boolean;
    public LastDayExpected: number;
    public ID: number;
    public StatusCode: number;
    public ExpectedMinutes: number;
    public ActualMinutes: number;
    public WorkRelationID: number;
    public BalanceFrom: Date;
    public ValidFrom: Date;
    public SumOvertime: number;
    public UpdatedAt: Date;
    public Minutes: number;
    public UpdatedBy: string;
    public BalanceDate: Date;
    public CreatedBy: string;
    public LastDayActual: number;
    public ValidTimeOff: number;
    public _createguid: string;
    public Previous: BalanceInfo;
    public Details: Array<FlexDetail>;
    public WorkRelation: WorkRelation;
    public CustomFields: any;
}


export class BalanceInfo extends UniEntity {
    public Description: string;
    public ID: number;
    public Minutes: number;
    public BalanceDate: Date;
}


export class FlexDetail extends UniEntity {
    public WorkedMinutes: number;
    public IsWeekend: boolean;
    public ExpectedMinutes: number;
    public ValidTimeOff: number;
    public Date: Date;
}


export class ContactSearchServiceResponse extends UniEntity {
    public ErrorMessage: string;
    public ErrorCode: number;
    public Success: boolean;
    public Method: string;
    public ObjectName: string;
}


export class InvoicesAndRemindersReadyToRemind extends UniEntity {
    public CurrencyCodeCode: string;
    public CustomerName: string;
    public DueDate: Date;
    public CustomerID: number;
    public CurrencyExchangeRate: number;
    public InvoiceNumber: number;
    public ExternalReference: string;
    public StatusCode: number;
    public TaxInclusiveAmount: number;
    public CustomerInvoiceID: number;
    public ReminderNumber: number;
    public TaxInclusiveAmountCurrency: number;
    public CurrencyCodeShortCode: string;
    public CurrencyCodeID: number;
    public EmailAddress: string;
    public CustomerInvoiceReminderID: number;
    public InvoiceDate: Date;
    public Fee: number;
    public CustomerNumber: number;
    public DontSendReminders: boolean;
    public RestAmount: number;
    public RestAmountCurrency: number;
    public Interest: number;
}


export class TradeHeaderCalculationSummary extends UniEntity {
    public SumTotalIncVat: number;
    public DecimalRounding: number;
    public SumTotalExVat: number;
    public SumVatBasis: number;
    public SumDiscountCurrency: number;
    public SumVatCurrency: number;
    public SumNoVatBasis: number;
    public SumNoVatBasisCurrency: number;
    public SumTotalIncVatCurrency: number;
    public SumVat: number;
    public SumVatBasisCurrency: number;
    public SumDiscount: number;
    public DecimalRoundingCurrency: number;
    public SumTotalExVatCurrency: number;
}


export class VatCalculationSummary extends UniEntity {
    public SumVatBasis: number;
    public VatPercent: number;
    public SumVatCurrency: number;
    public SumVat: number;
    public SumVatBasisCurrency: number;
}


export class InvoicePaymentData extends UniEntity {
    public AmountCurrency: number;
    public PaymentDate: LocalDate;
    public CurrencyExchangeRate: number;
    public CurrencyCodeID: number;
    public AgioAmount: number;
    public DimensionsID: number;
    public BankChargeAmount: number;
    public AgioAccountID: number;
    public AccountID: number;
    public BankChargeAccountID: number;
    public PaymentID: string;
    public Amount: number;
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
    public ReasonHelpLink: string;
    public ReasonCode: string;
}


export class AmountDetail extends UniEntity {
    public Amount: number;
    public Currency: string;
}


export class Limits extends UniEntity {
    public MaxInvoiceAmount: number;
    public RemainingLimit: number;
    public Limit: number;
}


export class AmeldingAgaAndTaxSums extends UniEntity {
    public DueDate: Date;
    public MessageID: string;
    public FinancialTax: number;
    public TaxDraw: number;
    public AccountNumber: string;
    public KIDEmploymentTax: string;
    public KIDFinancialTax: string;
    public KIDGarnishment: string;
    public KIDTaxDraw: string;
    public period: number;
    public EmploymentTax: number;
    public GarnishmentTax: number;
}


export class PayrollRunInAmeldingPeriod extends UniEntity {
    public PayrollrunPaydate: Date;
    public AmeldingSentdate: Date;
    public PayrollrunID: number;
    public CanGenerateAddition: boolean;
    public PayrollrunDescription: string;
}


export class PayAgaTaxDTO extends UniEntity {
    public payDate: Date;
    public payFinancialTax: boolean;
    public payAga: boolean;
    public payTaxDraw: boolean;
    public payGarnishment: boolean;
    public correctPennyDiff: boolean;
}


export class AmeldingSumUp extends UniEntity {
    public altInnStatus: string;
    public ID: number;
    public generated: Date;
    public year: number;
    public meldingsID: string;
    public period: number;
    public ReplacesAMeldingID: number;
    public Replaces: string;
    public status: AmeldingStatus;
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
    public name: string;
    public employeeNumber: number;
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
    public startdato: Date;
    public beskrivelse: string;
    public permisjonsId: string;
    public sluttdato: Date;
    public permisjonsprosent: string;
}


export class TransactionTypes extends UniEntity {
    public description: string;
    public Base_EmploymentTax: boolean;
    public incomeType: string;
    public benefit: string;
    public amount: number;
    public tax: boolean;
}


export class AGADetails extends UniEntity {
    public zoneName: string;
    public rate: number;
    public sectorName: string;
    public baseAmount: number;
    public type: string;
}


export class Totals extends UniEntity {
    public sumUtleggstrekk: number;
    public sumTax: number;
    public sumAGA: number;
}


export class AnnualStatement extends UniEntity {
    public EmployerOrgNr: string;
    public EmployerTaxMandatory: boolean;
    public EmployeeMunicipalName: string;
    public EmployerAddress: string;
    public EmployeeSSn: string;
    public EmployeeAddress: string;
    public EmployeeName: string;
    public EmployerCountryCode: string;
    public EmployeeNumber: number;
    public EmployerCity: string;
    public EmployeePostCode: string;
    public Year: number;
    public EmployerWebAddress: string;
    public EmployeeMunicipalNumber: string;
    public EmployerCountry: string;
    public EmployerName: string;
    public EmployerPostCode: string;
    public VacationPayBase: number;
    public EmployeeCity: string;
    public EmployerEmail: string;
    public EmployerPhoneNumber: string;
    public Contributions: Array<AnnualStatementLine>;
    public PensionOrBenefits: Array<AnnualStatementLine>;
    public Deductions: Array<AnnualStatementLine>;
    public Draws: Array<AnnualStatementLine>;
}


export class AnnualStatementLine extends UniEntity {
    public Sum: number;
    public Description: string;
    public IsDeduction: boolean;
    public TaxReturnPost: string;
    public LineIndex: number;
    public SupplementPackageName: string;
    public Amount: number;
    public Supplements: Array<SupplementInfo>;
}


export class SupplementInfo extends UniEntity {
    public ValueMoney: number;
    public ValueDate: Date;
    public ValueDate2: Date;
    public ValueBool: boolean;
    public Name: string;
    public WageTypeSupplementID: number;
    public ValueString: string;
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
    public Text: string;
    public mainStatus: string;
    public Title: string;
    public IsJob: boolean;
    public employeestatus: Array<EmployeeStatus>;
}


export class EmployeeStatus extends UniEntity {
    public ssn: string;
    public employeeID: number;
    public info: string;
    public employeeNumber: number;
    public year: number;
    public status: string;
    public changedFields: Array<FieldsChanged>;
}


export class FieldsChanged extends UniEntity {
    public fieldName: string;
    public valFrom: string;
    public valTo: string;
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
    public pension: number;
    public netPayment: number;
    public employeeID: number;
    public grossPayment: number;
    public baseVacation: number;
    public nonTaxableAmount: number;
    public sumTax: number;
    public usedNonTaxableAmount: number;
    public advancePayment: number;
    public taxBase: number;
    public paidHolidaypay: number;
}


export class VacationPayLastYear extends UniEntity {
    public employeeID: number;
    public baseVacation: number;
    public paidHolidayPay: number;
}


export class SalaryTransactionPay extends UniEntity {
    public PaymentDate: Date;
    public Withholding: number;
    public CompanyBankAccountID: number;
    public CompanyAddress: string;
    public CompanyName: string;
    public SalaryBankAccountID: number;
    public CompanyCity: string;
    public CompanyPostalCode: string;
    public TaxBankAccountID: number;
    public PayList: Array<SalaryTransactionPayLine>;
    public SalaryBalancePayList: Array<SalaryBalancePayLine>;
}


export class SalaryTransactionPayLine extends UniEntity {
    public NetPayment: number;
    public EmployeeName: string;
    public EmployeeNumber: number;
    public City: string;
    public Account: string;
    public PostalCode: string;
    public Address: string;
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
    public ReportID: number;
    public GroupByWageType: boolean;
    public Message: string;
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
    public FromPeriod: number;
    public Year: number;
    public BookedPayruns: number;
    public CreatedPayruns: number;
    public ToPeriod: number;
    public Groups: Array<ReconciliationGroup>;
}


export class ReconciliationGroup extends UniEntity {
    public Sum: number;
    public AccountNumber: string;
    public Lines: Array<ReconciliationLine>;
}


export class ReconciliationLine extends UniEntity {
    public HasEmploymentTax: boolean;
    public Sum: number;
    public Description: string;
    public IncomeType: string;
    public Benefit: string;
    public WageTypeName: string;
    public WageTypeNumber: number;
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
    public Ensurance: number;
    public Name: string;
    public UnionDraw: number;
    public OUO: number;
}


export class SalaryTransactionSums extends UniEntity {
    public paidPension: number;
    public Employee: number;
    public calculatedAGA: number;
    public netPayment: number;
    public percentTax: number;
    public baseTableTax: number;
    public paidAdvance: number;
    public manualTax: number;
    public grossPayment: number;
    public basePercentTax: number;
    public baseAGA: number;
    public tableTax: number;
    public baseVacation: number;
    public calculatedFinancialTax: number;
    public Payrun: number;
    public calculatedVacationPay: number;
}


export class SalaryTransactionPeriodSums extends UniEntity {
    public AgaZone: string;
    public FromPeriod: number;
    public Year: number;
    public MunicipalName: string;
    public AgaRate: number;
    public ToPeriod: number;
    public OrgNumber: string;
    public Sums: SalaryTransactionSums;
    public Aga: AGACalculation;
}


export class code extends UniEntity {
    public skatteOgAvgiftregel: string;
    public gmlcode: string;
    public kunfranav: string;
    public uninavn: string;
    public utloeserArbeidsgiveravgift: string;
    public postnr: string;
    public gyldigtil: string;
    public inngaarIGrunnlagForTrekk: string;
    public fordel: string;
    public gyldigfom: string;
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
    public ProductNames: string;
    public ContractID: number;
    public CompanyName: string;
    public TemplateCompanyKey: string;
    public ContractType: number;
    public IsTest: boolean;
    public IsTemplate: boolean;
    public CopyFiles: boolean;
    public CompanySettings: CompanySettings;
}


export class UserDto extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'UserDto';

    public CreatedAt: Date;
    public Deleted: boolean;
    public ID: number;
    public BankIntegrationUserName: string;
    public IsAutobankAdmin: boolean;
    public LastLogin: Date;
    public StatusCode: number;
    public Protected: boolean;
    public DisplayName: string;
    public GlobalIdentity: string;
    public UpdatedAt: Date;
    public PhoneNumber: string;
    public UserName: string;
    public UpdatedBy: string;
    public CreatedBy: string;
    public PermissionHandling: string;
    public HasAgreedToImportDisclaimer: boolean;
    public Email: string;
    public TwoFactorEnabled: boolean;
    public _createguid: string;
    public EndDate: Date;
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
    public AgreementId: number;
    public HasAgreedToLicense: boolean;
    public CanAgreeToLicense: boolean;
}


export class UserLicenseType extends UniEntity {
    public TypeName: string;
    public EndDate: Date;
    public TypeID: number;
}


export class CompanyLicenseInfomation extends UniEntity {
    public ID: number;
    public ContactEmail: string;
    public ContractID: number;
    public StatusCode: LicenseEntityStatus;
    public Name: string;
    public ContactPerson: string;
    public EndDate: Date;
    public Key: string;
    public Agency: Agency;
}


export class Agency extends UniEntity {
    public CompanyKey: string;
    public Name: string;
}


export class ContractLicenseType extends UniEntity {
    public TypeName: string;
    public TrialExpiration: Date;
    public StartDate: Date;
    public TypeID: number;
}


export class LicenseAgreementInfo extends UniEntity {
    public AgreementId: number;
    public HasAgreedToLicense: boolean;
}


export class CreateBankUserDTO extends UniEntity {
    public Password: string;
    public AdminUserId: number;
    public IsAdmin: boolean;
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
    public ValidFrom: Date;
    public Status: ChallengeRequestResult;
    public Message: string;
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
    public FromPeriod: Maaned;
    public Year: number;
    public IncludeIncome: boolean;
    public ReportType: ReportType;
    public IncludeInfoPerPerson: boolean;
    public IncludeEmployments: boolean;
    public ToPeriod: Maaned;
}


export class A07Response extends UniEntity {
    public Text: string;
    public mainStatus: string;
    public DataType: string;
    public Title: string;
    public Data: string;
    public DataName: string;
}


export class SelfEmployed extends UniEntity {
    public year: number;
    public items: Array<SelfEmployedItem>;
}


export class SelfEmployedItem extends UniEntity {
    public name: string;
    public number: string;
    public amount: number;
    public supplierID: number;
}


export class SetIntegrationDataDto extends UniEntity {
    public ExternalId: string;
    public IntegrationKey: string;
}


export class CurrencyRateData extends UniEntity {
    public ExchangeRate: number;
    public IsOverrideRate: boolean;
    public Factor: number;
    public FromCurrencyCode: CurrencyCode;
}


export class EmailDTO extends UniEntity {
    public ReportID: number;
    public FromAddress: string;
    public CopyAddress: string;
    public Format: string;
    public Message: string;
    public Subject: string;
    public Parameters: Array<ReportParameter>;
}


export class ReportParameter extends UniEntity {
    public Name: string;
    public Value: string;
}


export class SendEmail extends UniEntity {
    public ReportID: number;
    public FromAddress: string;
    public Localization: string;
    public CopyAddress: string;
    public ReportName: string;
    public EntityType: string;
    public ExternalReference: string;
    public EntityID: number;
    public Message: string;
    public Subject: string;
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
    public Title: string;
    public Url: string;
    public Items: Array<RssItem>;
}


export class RssItem extends UniEntity {
    public Description: string;
    public Guid: string;
    public Title: string;
    public Category: string;
    public Link: string;
    public PubDate: string;
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
    public MinutesWorked: number;
    public TotalBalance: number;
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
    public orgname: string;
    public orgno: string;
    public contactphone: string;
}


export class ServiceMetadataDto extends UniEntity {
    public SupportEmail: string;
    public ServiceName: string;
}


export class AccountUsageReference extends UniEntity {
    public Info: string;
    public EntityID: number;
    public Entity: string;
}


export class MandatoryDimensionAccountReport extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'MandatoryDimensionAccountReport';

    public CreatedAt: Date;
    public Deleted: boolean;
    public ID: number;
    public StatusCode: number;
    public AccountNumber: string;
    public journalEntryLineDraftID: number;
    public DimensionsID: number;
    public MissingRequiredDimensionsMessage: string;
    public UpdatedAt: Date;
    public AccountID: number;
    public MissingOnlyWarningsDimensionsMessage: string;
    public UpdatedBy: string;
    public CreatedBy: string;
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
    public DepreciationAccountNumber: number;
    public GroupName: string;
    public LastDepreciation: LocalDate;
    public Name: string;
    public Number: number;
    public CurrentValue: number;
    public BalanceAccountNumber: number;
    public BalanceAccountName: string;
    public GroupCode: string;
    public Lifetime: number;
    public Lines: Array<AssetReportLineDTO>;
}


export class AssetReportLineDTO extends UniEntity {
    public TypeID: number;
    public Date: LocalDate;
    public Type: string;
    public Value: number;
}


export class BankData extends UniEntity {
    public AccountNumber: string;
    public IBAN: string;
    public Bank: Bank;
}


export class CreateBankIntegrationDTO extends UniEntity {
    public BankApproval: boolean;
    public Password: string;
    public ServiceProvider: number;
    public Bank: string;
    public RequireTwoStage: boolean;
    public IsBankStatement: boolean;
    public IsOutgoing: boolean;
    public DisplayName: string;
    public UserName: string;
    public BankAcceptance: boolean;
    public Phone: string;
    public IsInbound: boolean;
    public BankAccountID: number;
    public Email: string;
    public IsBankBalance: boolean;
    public TuserName: string;
    public BankAccounts: Array<BankAccountDTO>;
}


export class BankAccountDTO extends UniEntity {
    public IsBankStatement: boolean;
    public Bic: string;
    public BBAN: string;
    public IsOutgoing: boolean;
    public IsInbound: boolean;
    public IsBankBalance: boolean;
    public IBAN: string;
}


export class ZdataUpdateBankProperties extends UniEntity {
    public Password: string;
    public IsBankStatement: boolean;
    public IsOutgoing: boolean;
    public ServiceID: string;
    public IsInbound: boolean;
    public IsBankBalance: boolean;
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
    public NewServiceID: string;
    public ServiceID: string;
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
    public Amount: number;
    public IsBankEntry: boolean;
}


export class MatchSettings extends UniEntity {
    public MaxDayOffset: number;
    public MaxDelta: number;
}


export class ReconciliationStatus extends UniEntity {
    public NumberOfItems: number;
    public TotalUnreconciled: number;
    public NumberOfUnReconciled: number;
    public AccountID: number;
    public IsReconciled: boolean;
    public TotalAmount: number;
    public Todate: Date;
    public FromDate: Date;
}


export class BalanceDto extends UniEntity {
    public BalanceInStatement: number;
    public Balance: number;
    public EndDate: Date;
    public StartDate: Date;
}


export class BankfileFormat extends UniEntity {
    public SkipRows: number;
    public FileExtension: string;
    public LinePrefix: string;
    public Name: string;
    public IsXml: boolean;
    public CustomFormat: BankFileCustomFormat;
    public IsFixed: boolean;
    public Separator: string;
    public Columns: Array<BankfileColumn>;
}


export class BankfileColumn extends UniEntity {
    public DataType: BankfileDataType;
    public Length: number;
    public IsFallBack: boolean;
    public StartPos: number;
    public FieldMapping: BankfileField;
}


export class JournalSuggestion extends UniEntity {
    public Description: string;
    public BankStatementRuleID: number;
    public AccountID: number;
    public FinancialDate: LocalDate;
    public Amount: number;
    public MatchWithEntryID: number;
    public Account: Account;
}


export class ReportRow extends UniEntity {
    public SubGroupName: string;
    public BudPeriod9: number;
    public BudPeriod1: number;
    public Sum: number;
    public BudPeriod7: number;
    public BudPeriod5: number;
    public Period7: number;
    public BudPeriod6: number;
    public ID: number;
    public BudPeriod10: number;
    public Period9: number;
    public GroupName: string;
    public SumPeriod: number;
    public GroupNumber: number;
    public BudPeriod11: number;
    public BudgetSum: number;
    public Period10: number;
    public Period2: number;
    public BudPeriod8: number;
    public Period8: number;
    public Period3: number;
    public AccountName: string;
    public AccountNumber: number;
    public SumLastYear: number;
    public Period6: number;
    public AccountYear: number;
    public BudPeriod3: number;
    public Period5: number;
    public Period11: number;
    public BudgetAccumulated: number;
    public BudPeriod4: number;
    public Period12: number;
    public PrecedingBalance: number;
    public BudPeriod2: number;
    public SubGroupNumber: number;
    public Period4: number;
    public IsSubTotal: boolean;
    public BudPeriod12: number;
    public SumPeriodLastYearAccumulated: number;
    public SumPeriodAccumulated: number;
    public SumPeriodLastYear: number;
    public Period1: number;
}


export class BudgetImport extends UniEntity {
    public Budget: Budget;
}


export class LiquidityTableDTO extends UniEntity {
    public OverdueSupplierInvoices: number;
    public BankBalance: number;
    public OverdueCustomerInvoices: number;
    public BankBalanceRefferance: BankBalanceType;
    public Period: Array<DetailsDTO>;
}


export class DetailsDTO extends UniEntity {
    public Supplier: number;
    public Sum: number;
    public CustomPayments: number;
    public VAT: number;
    public Liquidity: number;
    public Custumer: number;
}


export class JournalEntryData extends UniEntity {
    public AmountCurrency: number;
    public Description: string;
    public DueDate: LocalDate;
    public CreditAccountID: number;
    public SupplierInvoiceNo: string;
    public DebitAccountID: number;
    public DebitVatTypeID: number;
    public CurrencyExchangeRate: number;
    public InvoiceNumber: string;
    public CreditVatTypeID: number;
    public VatDeductionPercent: number;
    public StatusCode: number;
    public CustomerInvoiceID: number;
    public NumberSeriesID: number;
    public VatDate: LocalDate;
    public DebitAccountNumber: number;
    public JournalEntryDataAccrualID: number;
    public CustomerOrderID: number;
    public CurrencyID: number;
    public JournalEntryID: number;
    public PostPostJournalEntryLineID: number;
    public JournalEntryNo: string;
    public FinancialDate: LocalDate;
    public NumberSeriesTaskID: number;
    public SupplierInvoiceID: number;
    public PaymentID: string;
    public CreditAccountNumber: number;
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
    public PeriodName: string;
    public PeriodNo: number;
    public PeriodSumYear2: number;
    public PeriodSumYear1: number;
}


export class JournalEntryLineRequestSummary extends UniEntity {
    public SumTaxBasisAmount: number;
    public SumCredit: number;
    public SumDebit: number;
    public SumLedger: number;
    public SumBalance: number;
}


export class JournalEntryLinePostPostData extends UniEntity {
    public AmountCurrency: number;
    public CurrencyCodeCode: string;
    public Description: string;
    public DueDate: Date;
    public CurrencyExchangeRate: number;
    public ID: number;
    public InvoiceNumber: string;
    public StatusCode: number;
    public JournalEntryNumber: string;
    public SubAccountName: string;
    public CurrencyCodeShortCode: string;
    public CurrencyCodeID: number;
    public JournalEntryNumberNumeric: number;
    public PeriodNo: number;
    public NumberOfPayments: number;
    public MarkedAgainstJournalEntryLineID: number;
    public AccountYear: number;
    public SumPostPostAmountCurrency: number;
    public SubAccountNumber: number;
    public JournalEntryID: number;
    public FinancialDate: Date;
    public MarkedAgainstJournalEntryNumber: string;
    public PaymentID: string;
    public SumPostPostAmount: number;
    public RestAmount: number;
    public RestAmountCurrency: number;
    public JournalEntryTypeName: string;
    public Amount: number;
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
    public ID: number;
    public InvoiceNumber: string;
    public StatusCode: StatusCodeJournalEntryLine;
    public JournalEntryNumber: string;
    public OriginalStatusCode: StatusCodeJournalEntryLine;
    public FinancialDate: Date;
    public RestAmount: number;
    public RestAmountCurrency: number;
    public Amount: number;
    public Markings: Array<MarkingReference>;
}


export class MarkingReference extends UniEntity {
    public ID: number;
    public JournalEntryNumber: string;
}


export class SupplierInvoiceDetail extends UniEntity {
    public AmountCurrency: number;
    public Description: string;
    public VatTypeID: number;
    public InvoiceNumber: string;
    public VatPercent: number;
    public AccountName: string;
    public AccountNumber: number;
    public VatTypeName: string;
    public InvoiceDate: Date;
    public AccountID: number;
    public VatCode: string;
    public DeliveryDate: Date;
    public SupplierInvoiceID: number;
    public Amount: number;
    public SupplierID: number;
}


export class VatReportMessage extends UniEntity {
    public Level: ValidationLevel;
    public Message: string;
}


export class VatReportSummary extends UniEntity {
    public HasTaxBasis: boolean;
    public SumTaxBasisAmount: number;
    public IsHistoricData: boolean;
    public VatCodeGroupName: string;
    public SumVatAmount: number;
    public NumberOfJournalEntryLines: number;
    public VatCodeGroupID: number;
    public VatCodeGroupNo: string;
    public HasTaxAmount: boolean;
}


export class VatReportSummaryPerPost extends UniEntity {
    public VatPostReportAsNegativeAmount: boolean;
    public HasTaxBasis: boolean;
    public SumTaxBasisAmount: number;
    public IsHistoricData: boolean;
    public VatCodeGroupName: string;
    public SumVatAmount: number;
    public NumberOfJournalEntryLines: number;
    public VatCodeGroupID: number;
    public VatCodeGroupNo: string;
    public VatPostNo: string;
    public HasTaxAmount: boolean;
    public VatPostName: string;
    public VatPostID: number;
}


export class VatReportSummaryPerPostPerAccount extends UniEntity {
    public Description: string;
    public VatPostReportAsNegativeAmount: boolean;
    public VatAccountID: number;
    public VatJournalEntryPostAccountNumber: number;
    public HasTaxBasis: boolean;
    public StdVatCode: string;
    public JournalEntryNumber: string;
    public SumTaxBasisAmount: number;
    public IsHistoricData: boolean;
    public VatCodeGroupName: string;
    public SumVatAmount: number;
    public VatDate: Date;
    public NumberOfJournalEntryLines: number;
    public VatCodeGroupID: number;
    public VatJournalEntryPostAccountID: number;
    public VatJournalEntryPostAccountName: string;
    public VatAccountNumber: number;
    public VatCodeGroupNo: string;
    public VatPostNo: string;
    public HasTaxAmount: boolean;
    public VatAccountName: string;
    public VatCode: string;
    public TaxBasisAmount: number;
    public FinancialDate: Date;
    public VatPostName: string;
    public VatPostID: number;
    public Amount: number;
}


export class VatReportNotReportedJournalEntryData extends UniEntity {
    public SumTaxBasisAmount: number;
    public TerminPeriodID: number;
    public SumVatAmount: number;
    public NumberOfJournalEntryLines: number;
}


export class AltinnSigningTextResponse extends UniEntity {
    public SigningText: string;
}


export class AltinnGetVatReportDataFromAltinnResult extends UniEntity {
    public Status: AltinnGetVatReportDataFromAltinnStatus;
    public Message: string;
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


export enum TypeOfPaymentOtp{
    FixedSalary = 0,
    HourlyPay = 1,
    PaidOnCommission = 2,
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


export enum EmploymentType{
    notSet = 0,
    Permanent = 1,
    Temporary = 2,
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


export enum SalBalSource{
    AdvanceRoutine = 1,
    NegativeSalary = 2,
    Loan = 3,
    Other = 4,
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
