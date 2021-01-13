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

    public Verb: string;
    public ID: number;
    public Transaction: string;
    public Field: string;
    public OldValue: string;
    public Action: string;
    public NewValue: string;
    public CreatedBy: string;
    public EntityType: string;
    public CreatedAt: Date;
    public Route: string;
    public UpdatedBy: string;
    public Deleted: boolean;
    public ClientID: string;
    public EntityID: number;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class WorkBalance extends UniEntity {
    public static RelativeUrl = 'workbalances';
    public static EntityType = 'WorkBalance';

    public BalanceDate: Date;
    public Days: number;
    public ValidTimeOff: number;
    public IsStartBalance: boolean;
    public ExpectedMinutes: number;
    public BalanceFrom: Date;
    public ActualMinutes: number;
    public StatusCode: number;
    public ID: number;
    public ValidFrom: Date;
    public Balancetype: WorkBalanceTypeEnum;
    public CreatedBy: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public WorkRelationID: number;
    public Deleted: boolean;
    public Minutes: number;
    public UpdatedAt: Date;
    public Description: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Worker extends UniEntity {
    public static RelativeUrl = 'workers';
    public static EntityType = 'Worker';

    public UserID: number;
    public StatusCode: number;
    public BusinessRelationID: number;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public EmployeeID: number;
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

    public Invoiceable: boolean;
    public WorkTypeID: number;
    public OrderItemId: number;
    public EndTime: Date;
    public TransferedToPayroll: boolean;
    public WorkItemGroupID: number;
    public Date: Date;
    public StartTime: Date;
    public DimensionsID: number;
    public StatusCode: number;
    public ID: number;
    public CustomerID: number;
    public MinutesToOrder: number;
    public CreatedBy: string;
    public PriceExVat: number;
    public CustomerOrderID: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public WorkRelationID: number;
    public Label: string;
    public Deleted: boolean;
    public TransferedToOrder: boolean;
    public PayrollTrackingID: number;
    public LunchInMinutes: number;
    public Minutes: number;
    public UpdatedAt: Date;
    public Description: string;
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
    public CreatedBy: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public WorkRelationID: number;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public _createguid: string;
    public WorkRelation: WorkRelation;
    public Items: Array<WorkItem>;
    public CustomFields: any;
}


export class WorkProfile extends UniEntity {
    public static RelativeUrl = 'workprofiles';
    public static EntityType = 'WorkProfile';

    public MinutesPerYear: number;
    public Name: string;
    public StatusCode: number;
    public ID: number;
    public CreatedBy: string;
    public IsShared: boolean;
    public LunchIncluded: boolean;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public MinutesPerMonth: number;
    public MinutesPerWeek: number;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class WorkRelation extends UniEntity {
    public static RelativeUrl = 'workrelations';
    public static EntityType = 'WorkRelation';

    public WorkerID: number;
    public WorkPercentage: number;
    public EndTime: Date;
    public TeamID: number;
    public StatusCode: number;
    public IsPrivate: boolean;
    public ID: number;
    public StartDate: Date;
    public CreatedBy: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public CompanyName: string;
    public CompanyID: number;
    public IsActive: boolean;
    public UpdatedAt: Date;
    public WorkProfileID: number;
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

    public StatusCode: number;
    public ID: number;
    public RegionKey: string;
    public FromDate: Date;
    public CreatedBy: string;
    public TimeoffType: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public WorkRelationID: number;
    public Deleted: boolean;
    public IsHalfDay: boolean;
    public ToDate: Date;
    public SystemKey: string;
    public UpdatedAt: Date;
    public Description: string;
    public _createguid: string;
    public CustomFields: any;
}


export class WorkType extends UniEntity {
    public static RelativeUrl = 'worktypes';
    public static EntityType = 'WorkType';

    public Name: string;
    public StatusCode: number;
    public ID: number;
    public Price: number;
    public WagetypeNumber: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public SystemType: WorkTypeEnum;
    public UpdatedBy: string;
    public Deleted: boolean;
    public ProductID: number;
    public UpdatedAt: Date;
    public Description: string;
    public _createguid: string;
    public Product: Product;
    public CustomFields: any;
}


export class BankFile extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'BankFile';

    public FileID: number;
    public StatusCode: number;
    public ParentFileid: number;
    public ID: number;
    public SubCompanyID: number;
    public CreatedBy: string;
    public Accountnumber: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public _createguid: string;
    public File: File;
    public SubCompany: SubCompany;
    public CustomFields: any;
}


export class BatchInvoice extends UniEntity {
    public static RelativeUrl = 'batchinvoices';
    public static EntityType = 'BatchInvoice';

    public FreeTxt: string;
    public Processed: number;
    public NotifyEmail: boolean;
    public InvoiceDate: LocalDate;
    public StatusCode: number;
    public TotalToProcess: number;
    public SellerID: number;
    public ID: number;
    public OurRef: string;
    public NumberOfBatches: number;
    public YourRef: string;
    public CopyFromEntityId: number;
    public CreatedBy: string;
    public Comment: string;
    public CreatedAt: Date;
    public MinAmount: number;
    public UpdatedBy: string;
    public DueDate: LocalDate;
    public Deleted: boolean;
    public Operation: BatchInvoiceOperation;
    public UpdatedAt: Date;
    public ProjectID: number;
    public CustomerID: number;
    public _createguid: string;
    public Items: Array<BatchInvoiceItem>;
    public CustomFields: any;
}


export class BatchInvoiceItem extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'BatchInvoiceItem';

    public BatchInvoiceID: number;
    public CustomerInvoiceID: number;
    public StatusCode: StatusCode;
    public CommentID: number;
    public ID: number;
    public CustomerID: number;
    public CreatedBy: string;
    public CustomerOrderID: number;
    public BatchNumber: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public ProjectID: number;
    public _createguid: string;
    public CustomerOrder: CustomerOrder;
    public CustomerInvoice: CustomerInvoice;
    public CustomFields: any;
}


export class CampaignTemplate extends UniEntity {
    public static RelativeUrl = 'campaigntemplate';
    public static EntityType = 'CampaignTemplate';

    public StatusCode: number;
    public ID: number;
    public Template: string;
    public CreatedBy: string;
    public EntityName: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class Customer extends UniEntity {
    public static RelativeUrl = 'customers';
    public static EntityType = 'Customer';

    public CustomerNumber: number;
    public DeliveryTermsID: number;
    public Localization: string;
    public EfakturaIdentifier: string;
    public PaymentTermsID: number;
    public ReminderEmailAddress: string;
    public DefaultCustomerOrderReportID: number;
    public DimensionsID: number;
    public DontSendReminders: boolean;
    public StatusCode: number;
    public BusinessRelationID: number;
    public IsPrivate: boolean;
    public ID: number;
    public DefaultSellerID: number;
    public AvtaleGiro: boolean;
    public PeppolAddress: string;
    public GLN: string;
    public CreatedBy: string;
    public DefaultCustomerInvoiceReportID: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public EInvoiceAgreementReference: string;
    public FactoringNumber: number;
    public DefaultDistributionsID: number;
    public Deleted: boolean;
    public CustomerNumberKidAlias: string;
    public DefaultCustomerQuoteReportID: number;
    public WebUrl: string;
    public AvtaleGiroNotification: boolean;
    public AcceptableDelta4CustomerPayment: number;
    public AcceptableDelta4CustomerPaymentAccountID: number;
    public SocialSecurityNumber: string;
    public OrgNumber: string;
    public SubAccountNumberSeriesID: number;
    public UpdatedAt: Date;
    public CurrencyCodeID: number;
    public CreditDays: number;
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

    public FreeTxt: string;
    public CustomerName: string;
    public DeliveryTerm: string;
    public InvoiceCountryCode: string;
    public TaxExclusiveAmount: number;
    public PaymentInfoTypeID: number;
    public TaxInclusiveAmountCurrency: number;
    public PrintStatus: number;
    public Credited: boolean;
    public CreditedAmount: number;
    public DeliveryTermsID: number;
    public PaymentInformation: string;
    public AmountRegards: string;
    public JournalEntryID: number;
    public YourReference: string;
    public ShippingCity: string;
    public ShippingAddressLine2: string;
    public RestAmountCurrency: number;
    public PayableRoundingCurrencyAmount: number;
    public OurReference: string;
    public ExternalStatus: number;
    public InvoiceReceiverName: string;
    public SalesPerson: string;
    public PaymentTermsID: number;
    public DeliveryName: string;
    public InvoiceAddressLine3: string;
    public ShippingAddressLine3: string;
    public DontSendReminders: boolean;
    public ShippingPostalCode: string;
    public InvoiceDate: LocalDate;
    public ExternalDebtCollectionReference: string;
    public StatusCode: number;
    public InvoicePostalCode: string;
    public ID: number;
    public PaymentID: string;
    public DefaultSellerID: number;
    public ShippingCountry: string;
    public VatTotalsAmountCurrency: number;
    public InvoiceAddressLine1: string;
    public EmailAddress: string;
    public ShippingAddressLine1: string;
    public CustomerID: number;
    public ShippingCountryCode: string;
    public UseReportID: number;
    public PayableRoundingAmount: number;
    public InvoiceType: number;
    public InvoiceNumber: string;
    public VatTotalsAmount: number;
    public CollectorStatusCode: number;
    public InvoiceAddressLine2: string;
    public InvoiceCity: string;
    public AccrualID: number;
    public CreatedBy: string;
    public InvoiceCountry: string;
    public CurrencyExchangeRate: number;
    public PaymentDueDate: LocalDate;
    public SupplierOrgNumber: string;
    public Comment: string;
    public InvoiceNumberSeriesID: number;
    public BankAccountID: number;
    public InternalNote: string;
    public DefaultDimensionsID: number;
    public CreatedAt: Date;
    public InvoiceReferenceID: number;
    public UpdatedBy: string;
    public Requisition: string;
    public Deleted: boolean;
    public CreditedAmountCurrency: number;
    public ExternalDebtCollectionNotes: string;
    public RestAmount: number;
    public DeliveryMethod: string;
    public TaxInclusiveAmount: number;
    public TaxExclusiveAmountCurrency: number;
    public PaymentTerm: string;
    public UpdateCurrencyAmountsOnDateChange: boolean;
    public LastPaymentDate: LocalDate;
    public DeliveryDate: LocalDate;
    public CustomerPerson: string;
    public CustomerOrgNumber: string;
    public DistributionPlanID: number;
    public Payment: string;
    public ExternalReference: string;
    public UpdatedAt: Date;
    public CurrencyCodeID: number;
    public CreditDays: number;
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
    public SortIndex: number;
    public InvoicePeriodEndDate: LocalDate;
    public CustomerInvoiceID: number;
    public SumTotalIncVat: number;
    public SumVatCurrency: number;
    public PriceExVatCurrency: number;
    public Discount: number;
    public InvoicePeriodStartDate: LocalDate;
    public DimensionsID: number;
    public DiscountPercent: number;
    public StatusCode: number;
    public ID: number;
    public SumTotalExVatCurrency: number;
    public ItemSourceID: number;
    public SumTotalIncVatCurrency: number;
    public CostPrice: number;
    public PriceIncVat: number;
    public DiscountCurrency: number;
    public ItemText: string;
    public CreatedBy: string;
    public PriceExVat: number;
    public CurrencyExchangeRate: number;
    public PriceSetByUser: boolean;
    public VatPercent: number;
    public Comment: string;
    public CreatedAt: Date;
    public AccountingCost: string;
    public UpdatedBy: string;
    public Deleted: boolean;
    public ProductID: number;
    public VatTypeID: number;
    public SumVat: number;
    public AccountID: number;
    public CalculateGrossPriceBasedOnNetPrice: boolean;
    public Unit: string;
    public SumTotalExVat: number;
    public UpdatedAt: Date;
    public CurrencyCodeID: number;
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

    public InterestFee: number;
    public CreatedByReminderRuleID: number;
    public DebtCollectionFeeCurrency: number;
    public CustomerInvoiceID: number;
    public Title: string;
    public RestAmountCurrency: number;
    public ReminderFeeCurrency: number;
    public InterestFeeCurrency: number;
    public DimensionsID: number;
    public StatusCode: number;
    public ID: number;
    public EmailAddress: string;
    public RunNumber: number;
    public ReminderFee: number;
    public RemindedDate: LocalDate;
    public DebtCollectionFee: number;
    public CreatedBy: string;
    public CurrencyExchangeRate: number;
    public ReminderNumber: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public DueDate: LocalDate;
    public Deleted: boolean;
    public RestAmount: number;
    public Notified: boolean;
    public UpdatedAt: Date;
    public Description: string;
    public CurrencyCodeID: number;
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

    public Title: string;
    public StatusCode: number;
    public ID: number;
    public UseMaximumLegalReminderFee: boolean;
    public ReminderFee: number;
    public CreatedBy: string;
    public ReminderNumber: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public MinimumDaysFromDueDate: number;
    public CustomerInvoiceReminderSettingsID: number;
    public UpdatedAt: Date;
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
    public UseReminderRuleTextsInEmails: boolean;
    public StatusCode: number;
    public ID: number;
    public MinimumAmountToRemind: number;
    public RemindersBeforeDebtCollection: number;
    public AcceptPaymentWithoutReminderFee: boolean;
    public CreatedBy: string;
    public RuleSetType: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public DefaultReminderFeeAccountID: number;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomerInvoiceReminderRules: Array<CustomerInvoiceReminderRule>;
    public DebtCollectionSettings: DebtCollectionSettings;
    public DefaultReminderFeeAccount: Account;
    public CustomFields: any;
}


export class CustomerOrder extends UniEntity {
    public static RelativeUrl = 'orders';
    public static EntityType = 'CustomerOrder';

    public UpdateCurrencyOnToInvoice: boolean;
    public FreeTxt: string;
    public CustomerName: string;
    public DeliveryTerm: string;
    public InvoiceCountryCode: string;
    public TaxExclusiveAmount: number;
    public PaymentInfoTypeID: number;
    public TaxInclusiveAmountCurrency: number;
    public PrintStatus: number;
    public DeliveryTermsID: number;
    public RestExclusiveAmountCurrency: number;
    public YourReference: string;
    public ShippingCity: string;
    public ShippingAddressLine2: string;
    public OrderNumber: number;
    public RestAmountCurrency: number;
    public PayableRoundingCurrencyAmount: number;
    public OurReference: string;
    public InvoiceReceiverName: string;
    public SalesPerson: string;
    public PaymentTermsID: number;
    public DeliveryName: string;
    public InvoiceAddressLine3: string;
    public ShippingAddressLine3: string;
    public ShippingPostalCode: string;
    public StatusCode: number;
    public InvoicePostalCode: string;
    public ID: number;
    public DefaultSellerID: number;
    public ShippingCountry: string;
    public VatTotalsAmountCurrency: number;
    public InvoiceAddressLine1: string;
    public EmailAddress: string;
    public ShippingAddressLine1: string;
    public CustomerID: number;
    public ShippingCountryCode: string;
    public UseReportID: number;
    public PayableRoundingAmount: number;
    public OrderDate: LocalDate;
    public VatTotalsAmount: number;
    public InvoiceAddressLine2: string;
    public OrderNumberSeriesID: number;
    public InvoiceCity: string;
    public AccrualID: number;
    public CreatedBy: string;
    public InvoiceCountry: string;
    public CurrencyExchangeRate: number;
    public SupplierOrgNumber: string;
    public Comment: string;
    public InternalNote: string;
    public DefaultDimensionsID: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Requisition: string;
    public Deleted: boolean;
    public DeliveryMethod: string;
    public TaxInclusiveAmount: number;
    public TaxExclusiveAmountCurrency: number;
    public PaymentTerm: string;
    public UpdateCurrencyAmountsOnDateChange: boolean;
    public DeliveryDate: LocalDate;
    public CustomerPerson: string;
    public CustomerOrgNumber: string;
    public DistributionPlanID: number;
    public ReadyToInvoice: boolean;
    public UpdatedAt: Date;
    public CurrencyCodeID: number;
    public CreditDays: number;
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
    public SortIndex: number;
    public SumTotalIncVat: number;
    public SumVatCurrency: number;
    public PriceExVatCurrency: number;
    public Discount: number;
    public DimensionsID: number;
    public DiscountPercent: number;
    public StatusCode: number;
    public ID: number;
    public SumTotalExVatCurrency: number;
    public ItemSourceID: number;
    public SumTotalIncVatCurrency: number;
    public CostPrice: number;
    public PriceIncVat: number;
    public DiscountCurrency: number;
    public ItemText: string;
    public CreatedBy: string;
    public PriceExVat: number;
    public CustomerOrderID: number;
    public CurrencyExchangeRate: number;
    public PriceSetByUser: boolean;
    public VatPercent: number;
    public Comment: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public ProductID: number;
    public VatTypeID: number;
    public SumVat: number;
    public AccountID: number;
    public CalculateGrossPriceBasedOnNetPrice: boolean;
    public Unit: string;
    public SumTotalExVat: number;
    public ReadyToInvoice: boolean;
    public UpdatedAt: Date;
    public CurrencyCodeID: number;
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

    public UpdateCurrencyOnToInvoice: boolean;
    public FreeTxt: string;
    public CustomerName: string;
    public DeliveryTerm: string;
    public InvoiceCountryCode: string;
    public TaxExclusiveAmount: number;
    public PaymentInfoTypeID: number;
    public TaxInclusiveAmountCurrency: number;
    public PrintStatus: number;
    public DeliveryTermsID: number;
    public YourReference: string;
    public ShippingCity: string;
    public ShippingAddressLine2: string;
    public PayableRoundingCurrencyAmount: number;
    public OurReference: string;
    public InvoiceReceiverName: string;
    public SalesPerson: string;
    public PaymentTermsID: number;
    public DeliveryName: string;
    public InvoiceAddressLine3: string;
    public ShippingAddressLine3: string;
    public ShippingPostalCode: string;
    public UpdateCurrencyOnToOrder: boolean;
    public StatusCode: number;
    public InvoicePostalCode: string;
    public ID: number;
    public DefaultSellerID: number;
    public ShippingCountry: string;
    public VatTotalsAmountCurrency: number;
    public InvoiceAddressLine1: string;
    public EmailAddress: string;
    public ShippingAddressLine1: string;
    public QuoteDate: LocalDate;
    public CustomerID: number;
    public ShippingCountryCode: string;
    public UseReportID: number;
    public PayableRoundingAmount: number;
    public InquiryReference: number;
    public VatTotalsAmount: number;
    public QuoteNumberSeriesID: number;
    public InvoiceAddressLine2: string;
    public InvoiceCity: string;
    public CreatedBy: string;
    public ValidUntilDate: LocalDate;
    public InvoiceCountry: string;
    public CurrencyExchangeRate: number;
    public SupplierOrgNumber: string;
    public Comment: string;
    public InternalNote: string;
    public DefaultDimensionsID: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Requisition: string;
    public Deleted: boolean;
    public DeliveryMethod: string;
    public TaxInclusiveAmount: number;
    public TaxExclusiveAmountCurrency: number;
    public PaymentTerm: string;
    public UpdateCurrencyAmountsOnDateChange: boolean;
    public DeliveryDate: LocalDate;
    public CustomerPerson: string;
    public CustomerOrgNumber: string;
    public DistributionPlanID: number;
    public QuoteNumber: number;
    public UpdatedAt: Date;
    public CurrencyCodeID: number;
    public CreditDays: number;
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

    public CustomerQuoteID: number;
    public NumberOfItems: number;
    public SortIndex: number;
    public SumTotalIncVat: number;
    public SumVatCurrency: number;
    public PriceExVatCurrency: number;
    public Discount: number;
    public DimensionsID: number;
    public DiscountPercent: number;
    public StatusCode: number;
    public ID: number;
    public SumTotalExVatCurrency: number;
    public SumTotalIncVatCurrency: number;
    public CostPrice: number;
    public PriceIncVat: number;
    public DiscountCurrency: number;
    public ItemText: string;
    public CreatedBy: string;
    public PriceExVat: number;
    public CurrencyExchangeRate: number;
    public PriceSetByUser: boolean;
    public VatPercent: number;
    public Comment: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public ProductID: number;
    public VatTypeID: number;
    public SumVat: number;
    public AccountID: number;
    public CalculateGrossPriceBasedOnNetPrice: boolean;
    public Unit: string;
    public SumTotalExVat: number;
    public UpdatedAt: Date;
    public CurrencyCodeID: number;
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
    public StatusCode: number;
    public ID: number;
    public DebtCollectionAutomationID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public CreditorNumber: number;
    public CustomerInvoiceReminderSettingsID: number;
    public IntegrateWithDebtCollection: boolean;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomerInvoiceReminderSettings: CustomerInvoiceReminderSettings;
    public DebtCollectionAutomation: Array<DebtCollectionAutomation>;
    public CustomFields: any;
}


export class ItemSource extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ItemSource';

    public StatusCode: number;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public _createguid: string;
    public Details: Array<ItemSourceDetail>;
    public CustomFields: any;
}


export class ItemSourceDetail extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ItemSourceDetail';

    public SourceFK: number;
    public StatusCode: number;
    public ID: number;
    public Tag: string;
    public ItemSourceID: number;
    public Amount: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public SourceType: string;
    public UpdatedAt: Date;
    public Description: string;
    public _createguid: string;
    public CustomFields: any;
}


export class PaymentInfoType extends UniEntity {
    public static RelativeUrl = 'paymentinfotype';
    public static EntityType = 'PaymentInfoType';

    public Name: string;
    public Control: Modulus;
    public StatusCode: number;
    public ID: number;
    public Locked: boolean;
    public CreatedBy: string;
    public Length: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public Type: PaymentInfoTypeEnum;
    public UpdatedAt: Date;
    public _createguid: string;
    public PaymentInfoTypeParts: Array<PaymentInfoTypePart>;
    public CustomFields: any;
}


export class PaymentInfoTypePart extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'PaymentInfoTypePart';

    public SortIndex: number;
    public PaymentInfoTypeID: number;
    public StatusCode: number;
    public ID: number;
    public Part: string;
    public CreatedBy: string;
    public Length: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class RecurringInvoice extends UniEntity {
    public static RelativeUrl = 'recurringinvoices';
    public static EntityType = 'RecurringInvoice';

    public FreeTxt: string;
    public CustomerName: string;
    public DeliveryTerm: string;
    public InvoiceCountryCode: string;
    public MaxIterations: number;
    public TaxExclusiveAmount: number;
    public PaymentInfoTypeID: number;
    public TaxInclusiveAmountCurrency: number;
    public PrintStatus: number;
    public DeliveryTermsID: number;
    public PaymentInformation: string;
    public AmountRegards: string;
    public YourReference: string;
    public ShippingCity: string;
    public ShippingAddressLine2: string;
    public PayableRoundingCurrencyAmount: number;
    public OurReference: string;
    public InvoiceReceiverName: string;
    public SalesPerson: string;
    public PaymentTermsID: number;
    public DeliveryName: string;
    public InvoiceAddressLine3: string;
    public ShippingAddressLine3: string;
    public ShippingPostalCode: string;
    public StatusCode: number;
    public InvoicePostalCode: string;
    public ID: number;
    public DefaultSellerID: number;
    public ShippingCountry: string;
    public VatTotalsAmountCurrency: number;
    public InvoiceAddressLine1: string;
    public PreparationDays: number;
    public EmailAddress: string;
    public ShippingAddressLine1: string;
    public CustomerID: number;
    public ShippingCountryCode: string;
    public TimePeriod: RecurringPeriod;
    public UseReportID: number;
    public PayableRoundingAmount: number;
    public StartDate: LocalDate;
    public VatTotalsAmount: number;
    public InvoiceAddressLine2: string;
    public InvoiceCity: string;
    public CreatedBy: string;
    public EndDate: LocalDate;
    public Interval: number;
    public InvoiceCountry: string;
    public CurrencyExchangeRate: number;
    public SupplierOrgNumber: string;
    public Comment: string;
    public InvoiceNumberSeriesID: number;
    public InternalNote: string;
    public DefaultDimensionsID: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Requisition: string;
    public Deleted: boolean;
    public DeliveryMethod: string;
    public TaxInclusiveAmount: number;
    public TaxExclusiveAmountCurrency: number;
    public PaymentTerm: string;
    public UpdateCurrencyAmountsOnDateChange: boolean;
    public NextInvoiceDate: LocalDate;
    public NotifyWhenRecurringEnds: boolean;
    public DeliveryDate: LocalDate;
    public CustomerPerson: string;
    public CustomerOrgNumber: string;
    public NoCreditDays: boolean;
    public ProduceAs: RecurringResult;
    public DistributionPlanID: number;
    public Payment: string;
    public UpdatedAt: Date;
    public CurrencyCodeID: number;
    public NotifyUser: string;
    public NotifyWhenOrdersArePrepared: boolean;
    public CreditDays: number;
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
    public SortIndex: number;
    public SumTotalIncVat: number;
    public TimeFactor: RecurringPeriod;
    public SumVatCurrency: number;
    public PriceExVatCurrency: number;
    public Discount: number;
    public DimensionsID: number;
    public DiscountPercent: number;
    public StatusCode: number;
    public ID: number;
    public SumTotalExVatCurrency: number;
    public SumTotalIncVatCurrency: number;
    public PriceIncVat: number;
    public DiscountCurrency: number;
    public ItemText: string;
    public CreatedBy: string;
    public PriceExVat: number;
    public CurrencyExchangeRate: number;
    public PriceSetByUser: boolean;
    public VatPercent: number;
    public Comment: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public ProductID: number;
    public VatTypeID: number;
    public PricingSource: PricingSource;
    public SumVat: number;
    public ReduceIncompletePeriod: boolean;
    public AccountID: number;
    public CalculateGrossPriceBasedOnNetPrice: boolean;
    public Unit: string;
    public SumTotalExVat: number;
    public UpdatedAt: Date;
    public CurrencyCodeID: number;
    public RecurringInvoiceID: number;
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

    public InvoiceDate: LocalDate;
    public StatusCode: number;
    public ID: number;
    public CreationDate: LocalDate;
    public NotifiedRecurringEnds: boolean;
    public IterationNumber: number;
    public CreatedBy: string;
    public Comment: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public NotifiedOrdersPrepared: boolean;
    public Deleted: boolean;
    public InvoiceID: number;
    public OrderID: number;
    public UpdatedAt: Date;
    public RecurringInvoiceID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class Seller extends UniEntity {
    public static RelativeUrl = 'sellers';
    public static EntityType = 'Seller';

    public Name: string;
    public TeamID: number;
    public UserID: number;
    public StatusCode: number;
    public ID: number;
    public CreatedBy: string;
    public DefaultDimensionsID: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public EmployeeID: number;
    public Deleted: boolean;
    public UpdatedAt: Date;
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

    public CustomerQuoteID: number;
    public Percent: number;
    public CustomerInvoiceID: number;
    public StatusCode: number;
    public SellerID: number;
    public ID: number;
    public CustomerID: number;
    public Amount: number;
    public CreatedBy: string;
    public CustomerOrderID: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public RecurringInvoiceID: number;
    public _createguid: string;
    public Seller: Seller;
    public CustomFields: any;
}


export class SubCompany extends UniEntity {
    public static RelativeUrl = 'subcompanies';
    public static EntityType = 'SubCompany';

    public StatusCode: number;
    public CompanyKey: string;
    public ID: number;
    public CustomerID: number;
    public CompanyType: CompanyRelation;
    public CreatedBy: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public CompanyName: string;
    public CompanyID: number;
    public UpdatedAt: Date;
    public _createguid: string;
    public Customer: Customer;
    public CustomFields: any;
}


export class Supplier extends UniEntity {
    public static RelativeUrl = 'suppliers';
    public static EntityType = 'Supplier';

    public Localization: string;
    public CostAllocationID: number;
    public SupplierNumber: number;
    public DimensionsID: number;
    public StatusCode: number;
    public BusinessRelationID: number;
    public ID: number;
    public SelfEmployed: boolean;
    public PeppolAddress: string;
    public GLN: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public WebUrl: string;
    public OrgNumber: string;
    public SubAccountNumberSeriesID: number;
    public UpdatedAt: Date;
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

    public Name: string;
    public StatusCode: number;
    public ID: number;
    public TermsType: TermsType;
    public CreatedBy: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public Description: string;
    public CreditDays: number;
    public _createguid: string;
    public CustomFields: any;
}


export class TOFCurrencySettings extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'TOFCurrencySettings';

    public UpdateCurrencyAmountsOnQuoteToOrder: boolean;
    public UpdateCurrencyAmountsOnQuotedateChange: boolean;
    public StatusCode: number;
    public ID: number;
    public UpdateCurrencyAmountsOnOrderToInvoice: boolean;
    public CreatedBy: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public UpdateCurrencyAmountsOnQuoteToInvoice: boolean;
    public UpdateCurrencyAmountsOnInvoicedateChange: boolean;
    public UpdateCurrencyAmountsOnOrderdateChange: boolean;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class Address extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Address';

    public PostalCode: string;
    public AddressLine1: string;
    public City: string;
    public StatusCode: number;
    public BusinessRelationID: number;
    public ID: number;
    public Region: string;
    public AddressLine3: string;
    public CreatedBy: string;
    public AddressLine2: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public Country: string;
    public CountryCode: string;
    public UpdatedAt: Date;
    public _createguid: string;
    public BusinessRelation: BusinessRelation;
    public CustomFields: any;
}


export class BusinessRelation extends UniEntity {
    public static RelativeUrl = 'business-relations';
    public static EntityType = 'BusinessRelation';

    public Name: string;
    public DefaultEmailID: number;
    public StatusCode: number;
    public ID: number;
    public ShippingAddressID: number;
    public DefaultContactID: number;
    public DefaultBankAccountID: number;
    public CreatedBy: string;
    public InvoiceAddressID: number;
    public CreatedAt: Date;
    public DefaultPhoneID: number;
    public UpdatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
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

    public InfoID: number;
    public StatusCode: number;
    public ID: number;
    public CreatedBy: string;
    public Comment: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public Role: string;
    public UpdatedAt: Date;
    public ParentBusinessRelationID: number;
    public _createguid: string;
    public ParentBusinessRelation: BusinessRelation;
    public Info: BusinessRelation;
    public CustomFields: any;
}


export class Email extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Email';

    public StatusCode: number;
    public BusinessRelationID: number;
    public ID: number;
    public EmailAddress: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public Type: string;
    public UpdatedAt: Date;
    public Description: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Phone extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Phone';

    public StatusCode: number;
    public BusinessRelationID: number;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public Type: PhoneTypeEnum;
    public CountryCode: string;
    public UpdatedAt: Date;
    public Description: string;
    public Number: string;
    public _createguid: string;
    public CustomFields: any;
}


export class AGACalculation extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AGACalculation';

    public DimensionsID: number;
    public StatusCode: number;
    public ID: number;
    public PayrollRunID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
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
    public StatusCode: number;
    public ID: number;
    public CreatedBy: string;
    public freeAmount: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public SubEntityID: number;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public _createguid: string;
    public subEntity: SubEntity;
    public CustomFields: any;
}


export class AGATax extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AGATax';

    public beregningsKode: number;
    public AGACalculationID: number;
    public StatusCode: number;
    public ID: number;
    public AGARateID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public SubEntityID: number;
    public Deleted: boolean;
    public agaRate: number;
    public zone: number;
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

    public beregningsKode: number;
    public AGACalculationID: number;
    public StatusCode: number;
    public ID: number;
    public AGARateID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public SubEntityID: number;
    public Deleted: boolean;
    public agaRate: number;
    public zone: number;
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

    public beregningsKode: number;
    public AGACalculationID: number;
    public StatusCode: number;
    public ID: number;
    public AGARateID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public SubEntityID: number;
    public Deleted: boolean;
    public agaRate: number;
    public zone: number;
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

    public AGACalculationID: number;
    public StatusCode: number;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public SubEntityID: number;
    public Deleted: boolean;
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

    public AGACalculationID: number;
    public StatusCode: number;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public SubEntityID: number;
    public Deleted: boolean;
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

    public aga: number;
    public AGACalculationID: number;
    public persons: number;
    public StatusCode: number;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public SubEntityID: number;
    public Deleted: boolean;
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

    public FinancialTax: number;
    public StatusCode: number;
    public ID: number;
    public CreatedBy: string;
    public WithholdingTax: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public GarnishmentTax: number;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class AmeldingData extends UniEntity {
    public static RelativeUrl = 'amelding';
    public static EntityType = 'AmeldingData';

    public feedbackFileID: number;
    public altinnStatus: string;
    public messageID: string;
    public StatusCode: number;
    public ID: number;
    public PayrollRunID: number;
    public receiptID: number;
    public initiated: Date;
    public CreatedBy: string;
    public OppgaveHash: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public created: Date;
    public Deleted: boolean;
    public mainFileID: number;
    public type: AmeldingType;
    public status: number;
    public sent: Date;
    public replacesID: number;
    public attachmentFileID: number;
    public year: number;
    public period: number;
    public UpdatedAt: Date;
    public xmlValidationErrors: string;
    public replaceThis: string;
    public _createguid: string;
    public log: Array<AmeldingLog>;
    public CustomFields: any;
}


export class AmeldingLog extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AmeldingLog';

    public key: number;
    public StatusCode: number;
    public ID: number;
    public AmeldingsID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public registry: SalaryRegistry;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class BasicAmount extends UniEntity {
    public static RelativeUrl = 'basicamounts';
    public static EntityType = 'BasicAmount';

    public AveragePrYear: number;
    public ConversionFactor: number;
    public StatusCode: number;
    public ID: number;
    public BasicAmountPrMonth: number;
    public FromDate: Date;
    public CreatedBy: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public BasicAmountPrYear: number;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class CompanySalary extends UniEntity {
    public static RelativeUrl = 'companysalary';
    public static EntityType = 'CompanySalary';

    public PostGarnishmentToTaxAccount: boolean;
    public Base_NettoPaymentForMaritim: boolean;
    public Base_SpesialDeductionForMaritim: boolean;
    public MainAccountAllocatedVacation: number;
    public MainAccountCostVacation: number;
    public HoursPerMonth: number;
    public Base_NettoPayment: boolean;
    public WagetypeAdvancePaymentAuto: number;
    public HourFTEs: number;
    public MainAccountCostFinancialVacation: number;
    public PostToTaxDraw: boolean;
    public StatusCode: number;
    public WageDeductionDueToHoliday: WageDeductionDueToHolidayType;
    public ID: number;
    public MainAccountAllocatedAGAVacation: number;
    public AllowOver6G: boolean;
    public CalculateFinancialTax: boolean;
    public Base_Svalbard: boolean;
    public CreatedBy: string;
    public MainAccountCostFinancial: number;
    public FreeAmount: number;
    public RateFinancialTax: number;
    public AnnualStatementZipReportID: number;
    public CreatedAt: Date;
    public Base_JanMayenAndBiCountries: boolean;
    public MainAccountAllocatedAGA: number;
    public UpdatedBy: string;
    public Base_TaxFreeOrganization: boolean;
    public InterrimRemitAccount: number;
    public MainAccountAllocatedFinancialVacation: number;
    public MainAccountAllocatedFinancial: number;
    public PaymentInterval: CompanySalaryPaymentInterval;
    public Deleted: boolean;
    public WagetypeAdvancePayment: number;
    public PaycheckZipReportID: number;
    public OtpExportActive: boolean;
    public MainAccountCostAGA: number;
    public Base_PayAsYouEarnTaxOnPensions: boolean;
    public MainAccountCostAGAVacation: number;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class CompanyVacationRate extends UniEntity {
    public static RelativeUrl = 'companyvacationrates';
    public static EntityType = 'CompanyVacationRate';

    public StatusCode: number;
    public ID: number;
    public FromDate: Date;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Rate: number;
    public UpdatedBy: string;
    public Deleted: boolean;
    public Rate60: number;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class EmployeeCategory extends UniEntity {
    public static RelativeUrl = 'employeecategories';
    public static EntityType = 'EmployeeCategory';

    public Name: string;
    public StatusCode: number;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public EmployeeCategoryLinkID: number;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class EmployeeCategoryLink extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'EmployeeCategoryLink';

    public StatusCode: number;
    public ID: number;
    public CreatedBy: string;
    public EmployeeNumber: number;
    public CreatedAt: Date;
    public EmployeeCategoryID: number;
    public UpdatedBy: string;
    public EmployeeID: number;
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

    public IncludeOtpUntilYear: number;
    public Sex: GenderEnum;
    public InternasjonalIDCountry: string;
    public PhotoID: number;
    public Active: boolean;
    public EmploymentDate: Date;
    public InternasjonalIDType: InternationalIDType;
    public AdvancePaymentAmount: number;
    public UserID: number;
    public IncludeOtpUntilMonth: number;
    public StatusCode: number;
    public BusinessRelationID: number;
    public MunicipalityNo: string;
    public ID: number;
    public EndDateOtp: LocalDate;
    public InternationalID: string;
    public OtpStatus: OtpStatus;
    public EmployeeLanguageID: number;
    public ForeignWorker: ForeignWorker;
    public FreeText: string;
    public OtpExport: boolean;
    public CreatedBy: string;
    public BirthDate: Date;
    public TypeOfPaymentOtp: TypeOfPaymentOtp;
    public EmployeeNumber: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public SubEntityID: number;
    public PaymentInterval: PaymentInterval;
    public Deleted: boolean;
    public EmploymentDateOtp: LocalDate;
    public SocialSecurityNumber: string;
    public UpdatedAt: Date;
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

    public Percent: number;
    public loennTilUtenrikstjenestemannID: number;
    public ufoereYtelserAndreID: number;
    public IssueDate: Date;
    public TaxcardId: number;
    public StatusCode: number;
    public SecondaryTable: string;
    public ID: number;
    public loennFraBiarbeidsgiverID: number;
    public pensjonID: number;
    public NonTaxableAmount: number;
    public SKDXml: string;
    public Tilleggsopplysning: string;
    public Table: string;
    public loennKunTrygdeavgiftTilUtenlandskBorgerSomGrensegjengerID: number;
    public CreatedBy: string;
    public EmployeeNumber: number;
    public loennKunTrygdeavgiftTilUtenlandskBorgerID: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public EmployeeID: number;
    public Deleted: boolean;
    public NotMainEmployer: boolean;
    public SecondaryPercent: number;
    public loennFraHovedarbeidsgiverID: number;
    public ResultatStatus: string;
    public Year: number;
    public UpdatedAt: Date;
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

    public Percent: number;
    public AntallMaanederForTrekk: number;
    public ID: number;
    public NonTaxableAmount: number;
    public tabellType: TabellType;
    public Table: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public freeAmountType: FreeAmountType;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class EmployeeLeave extends UniEntity {
    public static RelativeUrl = 'EmployeeLeave';
    public static EntityType = 'EmployeeLeave';

    public LeavePercent: number;
    public StatusCode: number;
    public ID: number;
    public FromDate: Date;
    public CreatedBy: string;
    public LeaveType: Leavetype;
    public AffectsOtp: boolean;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public EmploymentID: number;
    public ToDate: Date;
    public UpdatedAt: Date;
    public Description: string;
    public _createguid: string;
    public Employment: Employment;
    public CustomFields: any;
}


export class Employment extends UniEntity {
    public static RelativeUrl = 'employments';
    public static EntityType = 'Employment';

    public JobCode: string;
    public RegulativeStepNr: number;
    public WorkingHoursScheme: WorkingHoursScheme;
    public DimensionsID: number;
    public EmploymentType: EmploymentType;
    public StatusCode: number;
    public TradeArea: ShipTradeArea;
    public ShipReg: ShipRegistry;
    public ID: number;
    public UserDefinedRate: number;
    public HoursPerWeek: number;
    public LastSalaryChangeDate: Date;
    public ShipType: ShipTypeOfShip;
    public StartDate: Date;
    public WorkPercent: number;
    public SeniorityDate: Date;
    public CreatedBy: string;
    public EndDate: Date;
    public MonthRate: number;
    public RemunerationType: RemunerationType;
    public TypeOfEmployment: TypeOfEmployment;
    public LedgerAccount: string;
    public RegulativeGroupID: number;
    public EmployeeNumber: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public SubEntityID: number;
    public EmployeeID: number;
    public Deleted: boolean;
    public JobName: string;
    public EndDateReason: EndDateReason;
    public LastWorkPercentChangeDate: Date;
    public PayGrade: string;
    public HourRate: number;
    public Standard: boolean;
    public UpdatedAt: Date;
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
    public StatusCode: number;
    public ID: number;
    public Amount: number;
    public FromDate: Date;
    public CreatedBy: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public SubentityID: number;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public Description: string;
    public _createguid: string;
    public CustomFields: any;
}


export class IncomeReportData extends UniEntity {
    public static RelativeUrl = 'income-reports';
    public static EntityType = 'IncomeReportData';

    public StatusCode: number;
    public ID: number;
    public AltinnReceiptID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public EmploymentID: number;
    public Type: string;
    public Xml: string;
    public MonthlyRefund: number;
    public UpdatedAt: Date;
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
    public WageTypeNumber: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class PayrollRun extends UniEntity {
    public static RelativeUrl = 'payrollrun';
    public static EntityType = 'PayrollRun';

    public PayDate: Date;
    public needsRecalc: boolean;
    public AGAonRun: number;
    public StatusCode: number;
    public ID: number;
    public JournalEntryNumber: string;
    public FromDate: Date;
    public FreeText: string;
    public CreatedBy: string;
    public taxdrawfactor: TaxDrawFactor;
    public PaycheckFileID: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public ToDate: Date;
    public AGAFreeAmount: number;
    public SettlementDate: Date;
    public HolidayPayDeduction: boolean;
    public ExcludeRecurringPosts: boolean;
    public UpdatedAt: Date;
    public Description: string;
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
    public PayrollRunID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public EmployeeCategoryID: number;
    public UpdatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public _createguid: string;
    public EmployeeCategory: EmployeeCategory;
    public PayrollRun: PayrollRun;
    public CustomFields: any;
}


export class PostingSummaryDraft extends UniEntity {
    public PayrollID: number;
    public JobInfoID: number;
    public ID: number;
    public draftBasic: string;
    public draftWithDims: string;
    public statusTime: Date;
    public status: SummaryJobStatus;
    public draftWithDimsOnBalance: string;
}


export class Regulative extends UniEntity {
    public static RelativeUrl = 'regulatives';
    public static EntityType = 'Regulative';

    public StatusCode: number;
    public ID: number;
    public StartDate: LocalDate;
    public CreatedBy: string;
    public RegulativeGroupID: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public _createguid: string;
    public Steps: Array<RegulativeStep>;
    public CustomFields: any;
}


export class RegulativeGroup extends UniEntity {
    public static RelativeUrl = 'regulativegroups';
    public static EntityType = 'RegulativeGroup';

    public Name: string;
    public StatusCode: number;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public _createguid: string;
    public Regulatives: Array<Regulative>;
    public CustomFields: any;
}


export class RegulativeStep extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'RegulativeStep';

    public StatusCode: number;
    public ID: number;
    public Amount: number;
    public CreatedBy: string;
    public Step: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public RegulativeID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class SalaryBalance extends UniEntity {
    public static RelativeUrl = 'salarybalances';
    public static EntityType = 'SalaryBalance';

    public Name: string;
    public SupplierID: number;
    public MaxAmount: number;
    public Source: SalBalSource;
    public InstalmentType: SalBalType;
    public KID: string;
    public StatusCode: number;
    public ID: number;
    public Instalment: number;
    public CreatePayment: boolean;
    public WageTypeNumber: number;
    public FromDate: Date;
    public CreatedBy: string;
    public CreatedAt: Date;
    public MinAmount: number;
    public UpdatedBy: string;
    public EmployeeID: number;
    public Deleted: boolean;
    public SalaryBalanceTemplateID: number;
    public EmploymentID: number;
    public Type: SalBalDrawType;
    public InstalmentPercent: number;
    public ToDate: Date;
    public UpdatedAt: Date;
    public Amount: number;
    public _createguid: string;
    public CalculatedBalance: number;
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

    public Date: LocalDate;
    public StatusCode: number;
    public ID: number;
    public SalaryTransactionID: number;
    public Amount: number;
    public CreatedBy: string;
    public SalaryBalanceID: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public Description: string;
    public _createguid: string;
    public SalaryTransaction: SalaryTransaction;
    public SalaryBalance: SalaryBalance;
    public CustomFields: any;
}


export class SalaryBalanceTemplate extends UniEntity {
    public static RelativeUrl = 'salarybalancetemplates';
    public static EntityType = 'SalaryBalanceTemplate';

    public Name: string;
    public SupplierID: number;
    public MaxAmount: number;
    public InstalmentType: SalBalType;
    public KID: string;
    public StatusCode: number;
    public ID: number;
    public Instalment: number;
    public CreatePayment: boolean;
    public WageTypeNumber: number;
    public CreatedBy: string;
    public Account: number;
    public CreatedAt: Date;
    public MinAmount: number;
    public UpdatedBy: string;
    public Deleted: boolean;
    public InstalmentPercent: number;
    public SalarytransactionDescription: string;
    public UpdatedAt: Date;
    public _createguid: string;
    public Supplier: Supplier;
    public SalaryBalances: Array<SalaryBalance>;
    public CustomFields: any;
}


export class SalaryTransaction extends UniEntity {
    public static RelativeUrl = 'salarytrans';
    public static EntityType = 'SalaryTransaction';

    public Text: string;
    public recurringPostValidFrom: Date;
    public calcAGA: number;
    public DimensionsID: number;
    public StatusCode: number;
    public MunicipalityNo: string;
    public ID: number;
    public SalaryTransactionCarInfoID: number;
    public TaxbasisID: number;
    public Sum: number;
    public PayrollRunID: number;
    public WageTypeID: number;
    public WageTypeNumber: number;
    public Amount: number;
    public FromDate: Date;
    public CreatedBy: string;
    public RecurringID: number;
    public Account: number;
    public SalaryBalanceID: number;
    public EmployeeNumber: number;
    public CreatedAt: Date;
    public SystemType: StdSystemType;
    public Rate: number;
    public UpdatedBy: string;
    public EmployeeID: number;
    public recurringPostValidTo: Date;
    public Deleted: boolean;
    public VatTypeID: number;
    public EmploymentID: number;
    public ToDate: Date;
    public IsRecurringPost: boolean;
    public HolidayPayDeduction: boolean;
    public UpdatedAt: Date;
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

    public IsLongRange: boolean;
    public StatusCode: number;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public RegistrationYear: number;
    public IsElectric: boolean;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class SalaryTransactionSupplement extends UniEntity {
    public static RelativeUrl = 'supplements';
    public static EntityType = 'SalaryTransactionSupplement';

    public WageTypeSupplementID: number;
    public StatusCode: number;
    public ID: number;
    public ValueDate2: Date;
    public SalaryTransactionID: number;
    public CreatedBy: string;
    public ValueMoney: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public ValueBool: boolean;
    public Deleted: boolean;
    public ValueString: string;
    public ValueDate: Date;
    public UpdatedAt: Date;
    public _createguid: string;
    public WageTypeSupplement: WageTypeSupplement;
    public CustomFields: any;
}


export class SalaryYear extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'SalaryYear';

    public CurrentYear: number;
    public StatusCode: number;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class SubEntity extends UniEntity {
    public static RelativeUrl = 'subentities';
    public static EntityType = 'SubEntity';

    public SuperiorOrganizationID: number;
    public StatusCode: number;
    public BusinessRelationID: number;
    public MunicipalityNo: string;
    public ID: number;
    public CreatedBy: string;
    public freeAmount: number;
    public AgaRule: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public AgaZone: number;
    public OrgNumber: string;
    public UpdatedAt: Date;
    public _createguid: string;
    public BusinessRelationInfo: BusinessRelation;
    public SuperiorOrganization: SubEntity;
    public CustomFields: any;
}


export class TaxBasis extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'TaxBasis';

    public JanMayenBasis: number;
    public PensionBasis: number;
    public PensionSourcetaxBasis: number;
    public StatusCode: number;
    public ID: number;
    public DisabilityOtherBasis: number;
    public SalaryTransactionID: number;
    public ForeignBorderCommuterBasis: number;
    public CreatedBy: string;
    public SailorBasis: number;
    public CreatedAt: Date;
    public ForeignCitizenInsuranceBasis: number;
    public Basis: number;
    public UpdatedBy: string;
    public Deleted: boolean;
    public SvalbardBasis: number;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class Travel extends UniEntity {
    public static RelativeUrl = 'travels';
    public static EntityType = 'Travel';

    public Name: string;
    public SupplierID: number;
    public Email: string;
    public PersonID: string;
    public SourceSystem: string;
    public DimensionsID: number;
    public StatusCode: number;
    public ID: number;
    public Phone: string;
    public CreatedBy: string;
    public Comment: string;
    public EmployeeNumber: number;
    public State: state;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public TravelIdentificator: string;
    public Deleted: boolean;
    public Purpose: string;
    public UpdatedAt: Date;
    public Description: string;
    public AdvanceAmount: number;
    public _createguid: string;
    public TravelLines: Array<TravelLine>;
    public Dimensions: Dimensions;
    public CustomFields: any;
}


export class TravelLine extends UniEntity {
    public static RelativeUrl = 'travellines';
    public static EntityType = 'TravelLine';

    public paytransID: number;
    public DimensionsID: number;
    public StatusCode: number;
    public ID: number;
    public From: Date;
    public LineState: linestate;
    public TypeID: number;
    public Amount: number;
    public CreatedBy: string;
    public TravelID: number;
    public InvoiceAccount: number;
    public AccountNumber: number;
    public CreatedAt: Date;
    public Rate: number;
    public UpdatedBy: string;
    public TravelIdentificator: string;
    public Deleted: boolean;
    public VatTypeID: number;
    public To: Date;
    public CostType: costtype;
    public UpdatedAt: Date;
    public Description: string;
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
    public StatusCode: number;
    public ID: number;
    public ForeignTypeID: string;
    public WageTypeNumber: number;
    public CreatedBy: string;
    public InvoiceAccount: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public Description: string;
    public _createguid: string;
    public CustomFields: any;
}


export class VacationPayLine extends UniEntity {
    public static RelativeUrl = 'VacationPayLines';
    public static EntityType = 'VacationPayLine';

    public StatusCode: number;
    public ID: number;
    public CreatedBy: string;
    public ManualVacationPayBase: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public EmployeeID: number;
    public Deleted: boolean;
    public Year: number;
    public UpdatedAt: Date;
    public VacationPay: number;
    public VacationPay60: number;
    public SystemVacationPayBase: number;
    public PaidTaxFreeVacationPay: number;
    public _createguid: string;
    public Rate: number;
    public MissingEarlierVacationPay: number;
    public Withdrawal: number;
    public Age: number;
    public Rate60: number;
    public PaidVacationPay: number;
    public Employee: Employee;
    public CustomFields: any;
}


export class VacationRateEmployee extends UniEntity {
    public static RelativeUrl = 'employeevacationrates';
    public static EntityType = 'VacationRateEmployee';

    public StatusCode: number;
    public ID: number;
    public StartDate: Date;
    public CreatedBy: string;
    public EndDate: Date;
    public CreatedAt: Date;
    public Rate: number;
    public UpdatedBy: string;
    public EmployeeID: number;
    public Deleted: boolean;
    public Rate60: number;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class WageType extends UniEntity {
    public static RelativeUrl = 'wagetypes';
    public static EntityType = 'WageType';

    public ValidYear: number;
    public SupplementPackage: string;
    public IncomeType: string;
    public SpecialTaxHandling: string;
    public Base_div3: boolean;
    public FixedSalaryHolidayDeduction: boolean;
    public taxtype: TaxType;
    public NoNumberOfHours: boolean;
    public StatusCode: number;
    public SpecialTaxAndContributionsRule: SpecialTaxAndContributionsRule;
    public Postnr: string;
    public ID: number;
    public GetRateFrom: GetRateFrom;
    public Base_div2: boolean;
    public Limit_type: LimitType;
    public WageTypeName: string;
    public WageTypeNumber: number;
    public RatetypeColumn: RateTypeColumn;
    public CreatedBy: string;
    public SpecialAgaRule: SpecialAgaRule;
    public AccountNumber: number;
    public CreatedAt: Date;
    public Systemtype: string;
    public RateFactor: number;
    public Rate: number;
    public UpdatedBy: string;
    public Limit_value: number;
    public Deleted: boolean;
    public HideFromPaycheck: boolean;
    public AccountNumber_balance: number;
    public Benefit: string;
    public SystemRequiredWageType: number;
    public Base_Vacation: boolean;
    public DaysOnBoard: boolean;
    public Limit_WageTypeNumber: number;
    public Limit_newRate: number;
    public Base_EmploymentTax: boolean;
    public StandardWageTypeFor: StdWageType;
    public UpdatedAt: Date;
    public Base_Payment: boolean;
    public Description: string;
    public _createguid: string;
    public SupplementaryInformations: Array<WageTypeSupplement>;
    public CustomFields: any;
}


export class WageTypeSupplement extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'WageTypeSupplement';

    public Name: string;
    public StatusCode: number;
    public ID: number;
    public ValueType: Valuetype;
    public ameldingType: string;
    public WageTypeID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public GetValueFromTrans: boolean;
    public SuggestedValue: string;
    public UpdatedAt: Date;
    public Description: string;
    public _createguid: string;
    public CustomFields: any;
}


export class WageTypeTranslation extends UniEntity {
    public static RelativeUrl = 'wagetypetranslations';
    public static EntityType = 'WageTypeTranslation';

    public StatusCode: number;
    public ID: number;
    public WageTypeName: string;
    public WageTypeNumber: number;
    public EmployeeLanguageID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public _createguid: string;
    public EmployeeLanguage: EmployeeLanguage;
    public CustomFields: any;
}


export class PensionScheme extends UniEntity {
    public static RelativeUrl = 'pensionschemes';
    public static EntityType = 'PensionScheme';

    public StatusCode: number;
    public ID: number;
    public Identificator: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public Year: number;
    public Period: number;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class PensionSchemeSupplier extends UniEntity {
    public static RelativeUrl = 'pensionschemesuppliers';
    public static EntityType = 'PensionSchemeSupplier';

    public Name: string;
    public StatusCode: number;
    public ID: number;
    public Identificator: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class StandardPensionSchemeSupplier extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'StandardPensionSchemeSupplier';

    public Name: string;
    public ID: number;
    public Identificator: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class EmployeeLanguage extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'EmployeeLanguage';

    public StatusCode: number;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public LanguageCode: string;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class ComponentLayout extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ComponentLayout';

    public Name: string;
    public BaseEntity: string;
    public StatusCode: number;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public _createguid: string;
    public Fields: Array<FieldLayout>;
    public CustomFields: any;
}


export class FieldLayout extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'FieldLayout';

    public Sectionheader: string;
    public FieldType: FieldType;
    public Hidden: boolean;
    public Combo: number;
    public StatusCode: number;
    public DisplayField: string;
    public ID: number;
    public FieldSet: number;
    public Alignment: Alignment;
    public LineBreak: boolean;
    public Section: number;
    public Legend: string;
    public CreatedBy: string;
    public Property: string;
    public EntityType: string;
    public Width: string;
    public Placeholder: string;
    public ComponentLayoutID: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public ReadOnly: boolean;
    public Label: string;
    public Deleted: boolean;
    public Options: string;
    public HelpText: string;
    public Placement: number;
    public UpdatedAt: Date;
    public LookupField: boolean;
    public Description: string;
    public _createguid: string;
    public CustomFields: any;
}


export class CurrencyOverride extends UniEntity {
    public static RelativeUrl = 'currencyoverrides';
    public static EntityType = 'CurrencyOverride';

    public Source: CurrencySourceEnum;
    public ExchangeRate: number;
    public ID: number;
    public ToCurrencyCodeID: number;
    public FromDate: LocalDate;
    public CreatedBy: string;
    public FromCurrencyCodeID: number;
    public CreatedAt: Date;
    public Factor: number;
    public UpdatedBy: string;
    public Deleted: boolean;
    public ToDate: LocalDate;
    public UpdatedAt: Date;
    public _createguid: string;
    public FromCurrencyCode: CurrencyCode;
    public ToCurrencyCode: CurrencyCode;
    public CustomFields: any;
}


export class AccountAssetGroup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AccountAssetGroup';

    public FromAccountNumber: number;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public AssetGroupCode: string;
    public ToAccountNumber: number;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class AccountGroupSetup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AccountGroupSetup';

    public Name: string;
    public PlanType: PlanTypeEnum;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public ParentID: number;
    public ExternalReference: string;
    public UpdatedAt: Date;
    public _createguid: string;
    public Parent: AccountGroupSetup;
    public CustomFields: any;
}


export class AccountSetup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AccountSetup';

    public AccountName: string;
    public VatCode: string;
    public PlanType: PlanTypeEnum;
    public ID: number;
    public AccountGroupSetupID: number;
    public Visible: boolean;
    public CreatedBy: string;
    public SaftMappingAccountID: number;
    public ExpectedDebitBalance: boolean;
    public AccountNumber: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public _createguid: string;
    public AccountGroup: AccountGroupSetup;
    public SaftMappingAccount: SaftMappingAccount;
    public CustomFields: any;
}


export class AccountVisibilityGroup extends UniEntity {
    public static RelativeUrl = 'accountvisibilitygroups';
    public static EntityType = 'AccountVisibilityGroup';

    public Name: string;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
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

    public AccountVisibilityGroupID: number;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public AccountSetupID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class AGARate extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AGARate';

    public ZoneID: number;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Rate: number;
    public UpdatedBy: string;
    public RateValidFrom: Date;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public _createguid: string;
    public sector: Array<AGASector>;
    public CustomFields: any;
}


export class AGASector extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AGASector';

    public RateID: number;
    public ID: number;
    public ValidFrom: Date;
    public CreatedBy: string;
    public Sector: string;
    public freeAmount: number;
    public CreatedAt: Date;
    public Rate: number;
    public UpdatedBy: string;
    public Deleted: boolean;
    public SectorID: number;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class AGAZone extends UniEntity {
    public static RelativeUrl = 'AGAZones';
    public static EntityType = 'AGAZone';

    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public ZoneName: string;
    public UpdatedAt: Date;
    public _createguid: string;
    public rates: Array<AGARate>;
    public municipalsOnZone: Array<MunicipalAGAZone>;
    public CustomFields: any;
}


export class Agreement extends UniEntity {
    public static RelativeUrl = 'agreements';
    public static EntityType = 'Agreement';

    public AppliesTo: number;
    public Name: string;
    public ID: number;
    public Template: string;
    public ValidFrom: Date;
    public CreatedBy: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class AssetGroup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AssetGroup';

    public Name: string;
    public DepreciationAccountNumber: number;
    public DepreciationYears: number;
    public ID: number;
    public CreatedBy: string;
    public Code: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public DepreciationRate: number;
    public ToDate: Date;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class BankIdentifierCode extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'BankIdentifierCode';

    public ID: number;
    public BankIdentifier: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Bic: string;
    public Deleted: boolean;
    public BankName: string;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class CompanyType extends UniEntity {
    public static RelativeUrl = 'companytypes';
    public static EntityType = 'CompanyType';

    public Name: string;
    public Priority: boolean;
    public DefaultAccountVisibilityGroupID: number;
    public ID: number;
    public FullName: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public DefaultPlanType: PlanTypeEnum;
    public UpdatedAt: Date;
    public Description: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Confirmation extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Confirmation';

    public Email: string;
    public ExpirationDate: Date;
    public PostalCode: string;
    public StatusCode: number;
    public ID: number;
    public DisplayName: string;
    public Phone: string;
    public CreatedBy: string;
    public Code: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public ContractType: string;
    public Deleted: boolean;
    public CompanyName: string;
    public SignUpReferrer: string;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class Country extends UniEntity {
    public static RelativeUrl = 'countries';
    public static EntityType = 'Country';

    public Name: string;
    public CurrencyRateSource: string;
    public ID: number;
    public DefaultCurrencyCode: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public CountryCode: string;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class Currency extends UniEntity {
    public static RelativeUrl = 'currencies';
    public static EntityType = 'Currency';

    public CurrencyDate: LocalDate;
    public Source: CurrencySourceEnum;
    public ExchangeRate: number;
    public ID: number;
    public ToCurrencyCodeID: number;
    public CreatedBy: string;
    public FromCurrencyCodeID: number;
    public CreatedAt: Date;
    public Factor: number;
    public UpdatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public _createguid: string;
    public FromCurrencyCode: CurrencyCode;
    public ToCurrencyCode: CurrencyCode;
    public CustomFields: any;
}


export class CurrencyCode extends UniEntity {
    public static RelativeUrl = 'currencycodes';
    public static EntityType = 'CurrencyCode';

    public Name: string;
    public ID: number;
    public ShortCode: string;
    public CreatedBy: string;
    public Code: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public Description: string;
    public _createguid: string;
    public CustomFields: any;
}


export class DebtCollectionAutomation extends UniEntity {
    public static RelativeUrl = 'debtcollectionautomation';
    public static EntityType = 'DebtCollectionAutomation';

    public Name: string;
    public DebtCollectionSettingsID: number;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public Description: string;
    public _createguid: string;
    public DebtCollectionSettings: DebtCollectionSettings;
    public CustomFields: any;
}


export class EmploymentValidValues extends UniEntity {
    public static RelativeUrl = 'employmentvalidvalues';
    public static EntityType = 'EmploymentValidValues';

    public JobCode: boolean;
    public LastWorkPercentChange: boolean;
    public WorkingHoursScheme: boolean;
    public TradeArea: boolean;
    public ShipReg: boolean;
    public ID: number;
    public UserDefinedRate: boolean;
    public HoursPerWeek: boolean;
    public LastSalaryChangeDate: boolean;
    public ShipType: boolean;
    public StartDate: boolean;
    public WorkPercent: boolean;
    public SeniorityDate: boolean;
    public CreatedBy: string;
    public EndDate: boolean;
    public MonthRate: boolean;
    public RemunerationType: boolean;
    public typeOfEmployment: boolean;
    public PaymentType: RemunerationType;
    public CreatedAt: Date;
    public employment: TypeOfEmployment;
    public UpdatedBy: string;
    public Deleted: boolean;
    public JobName: boolean;
    public HourRate: boolean;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class FinancialDeadline extends UniEntity {
    public static RelativeUrl = 'deadlines';
    public static EntityType = 'FinancialDeadline';

    public Name: string;
    public PassableDueDate: number;
    public StatusCode: number;
    public ID: number;
    public AdditionalInfo: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public Type: FinancialDeadlineType;
    public Deadline: LocalDate;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class JobTicket extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'JobTicket';

    public GlobalIdentity: string;
    public JobId: string;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public JobStatus: string;
    public JobName: string;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class LanguageCode extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'LanguageCode';

    public Name: string;
    public ID: number;
    public CreatedBy: string;
    public Code: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class Municipal extends UniEntity {
    public static RelativeUrl = 'Municipals';
    public static EntityType = 'Municipal';

    public CountyNo: string;
    public MunicipalityNo: string;
    public ID: number;
    public CountyName: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public MunicipalityName: string;
    public Retired: boolean;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class MunicipalAGAZone extends UniEntity {
    public static RelativeUrl = 'MunicipalAGAZones';
    public static EntityType = 'MunicipalAGAZone';

    public ZoneID: number;
    public MunicipalityNo: string;
    public ID: number;
    public Startdate: Date;
    public CreatedBy: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class PaymentBatchType extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'PaymentBatchType';

    public Name: string;
    public ID: number;
    public CreatedBy: string;
    public Code: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public Description: string;
    public _createguid: string;
    public CustomFields: any;
}


export class PaymentCode extends UniEntity {
    public static RelativeUrl = 'paymentCodes';
    public static EntityType = 'PaymentCode';

    public Name: string;
    public ID: number;
    public CreatedBy: string;
    public PaymentGroup: string;
    public Code: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public Description: string;
    public _createguid: string;
    public CustomFields: any;
}


export class PostalCode extends UniEntity {
    public static RelativeUrl = 'postalcodes';
    public static EntityType = 'PostalCode';

    public City: string;
    public StatusCode: number;
    public ID: number;
    public CreatedBy: string;
    public Code: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class SaftMappingAccount extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'SaftMappingAccount';

    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public AccountID: string;
    public UpdatedAt: Date;
    public Description: string;
    public _createguid: string;
    public CustomFields: any;
}


export class StaticRegister extends UniEntity {
    public static RelativeUrl = 'StaticRegister';
    public static EntityType = 'StaticRegister';

    public stamp: Date;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public Registry: string;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class STYRKCode extends UniEntity {
    public static RelativeUrl = 'STYRK';
    public static EntityType = 'STYRKCode';

    public lnr: number;
    public ID: number;
    public CreatedBy: string;
    public tittel: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public styrk: string;
    public Deleted: boolean;
    public ynr: number;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class Language extends UniEntity {
    public static RelativeUrl = 'languages';
    public static EntityType = 'Language';

    public Name: string;
    public FallBackLanguageID: number;
    public ID: number;
    public CreatedBy: string;
    public Code: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public _createguid: string;
    public Translations: Array<Translation>;
    public CustomFields: any;
}


export class Translatable extends UniEntity {
    public static RelativeUrl = 'translatables';
    public static EntityType = 'Translatable';

    public Meaning: string;
    public ID: number;
    public Static: boolean;
    public CreatedBy: string;
    public Column: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public Value: string;
    public Model: string;
    public Module: i18nModule;
    public UpdatedAt: Date;
    public Description: string;
    public _createguid: string;
    public Translations: Array<Translation>;
    public CustomFields: any;
}


export class Translation extends UniEntity {
    public static RelativeUrl = 'translations';
    public static EntityType = 'Translation';

    public ID: number;
    public TranslatableID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public Value: string;
    public LanguageID: number;
    public UpdatedAt: Date;
    public _createguid: string;
    public Language: Language;
    public Translatable: Translatable;
    public CustomFields: any;
}


export class VatCodeGroupSetup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'VatCodeGroupSetup';

    public Name: string;
    public No: string;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class VatPostSetup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'VatPostSetup';

    public Name: string;
    public ReportAsNegativeAmount: boolean;
    public No: string;
    public VatCodeGroupSetupNo: string;
    public ID: number;
    public HasTaxBasis: boolean;
    public CreatedBy: string;
    public HasTaxAmount: boolean;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class VatReportForm extends UniEntity {
    public static RelativeUrl = 'vatreportforms';
    public static EntityType = 'VatReportForm';

    public Name: string;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public Description: string;
    public _createguid: string;
    public CustomFields: any;
}


export class VatReportReferenceSetup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'VatReportReferenceSetup';

    public VatPostNo: string;
    public VatCode: string;
    public ID: number;
    public CreatedBy: string;
    public AccountNumber: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class VatTypeSetup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'VatTypeSetup';

    public Name: string;
    public DirectJournalEntryOnly: boolean;
    public VatCode: string;
    public ID: number;
    public OutgoingAccountNumber: number;
    public DefaultVisible: boolean;
    public CreatedBy: string;
    public OutputVat: boolean;
    public ReversedTaxDutyVat: boolean;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public IsNotVatRegistered: boolean;
    public IncomingAccountNumber: number;
    public IsCompensated: boolean;
    public VatCodeGroupNo: string;
    public UpdatedAt: Date;
    public _createguid: string;
    public VatTypeSetupPercentages: Array<VatTypeSetupPercentage>;
    public CustomFields: any;
}


export class VatTypeSetupPercentage extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'VatTypeSetupPercentage';

    public VatTypeSetupID: number;
    public ID: number;
    public ValidFrom: LocalDate;
    public CreatedBy: string;
    public VatPercent: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public ValidTo: LocalDate;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class CompanyReport extends UniEntity {
    public static RelativeUrl = 'company-report';
    public static EntityType = 'CompanyReport';

    public ContractId: number;
    public CompanyKey: string;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public ReportDefinitionID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class ReportDefinition extends UniEntity {
    public static RelativeUrl = 'report-definitions';
    public static EntityType = 'ReportDefinition';

    public Name: string;
    public UniqueReportID: string;
    public ReportSource: string;
    public CategoryLabel: string;
    public ID: number;
    public TemplateLinkId: string;
    public Visible: boolean;
    public Version: string;
    public Category: string;
    public CreatedBy: string;
    public ReportType: number;
    public IsStandard: boolean;
    public Md5: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public Description: string;
    public _createguid: string;
    public CustomFields: any;
}


export class ReportDefinitionDataSource extends UniEntity {
    public static RelativeUrl = 'report-definition-data-sources';
    public static EntityType = 'ReportDefinitionDataSource';

    public DataSourceUrl: string;
    public Name: string;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public ReportDefinitionId: number;
    public _createguid: string;
    public CustomFields: any;
}


export class ReportDefinitionParameter extends UniEntity {
    public static RelativeUrl = 'report-definition-parameters';
    public static EntityType = 'ReportDefinitionParameter';

    public Name: string;
    public SortIndex: number;
    public DefaultValueSource: string;
    public DefaultValue: string;
    public ID: number;
    public DefaultValueLookupType: string;
    public Visible: boolean;
    public CreatedBy: string;
    public CreatedAt: Date;
    public DefaultValueList: string;
    public UpdatedBy: string;
    public Label: string;
    public Deleted: boolean;
    public Type: string;
    public UpdatedAt: Date;
    public ReportDefinitionId: number;
    public _createguid: string;
    public CustomFields: any;
}


export class PeriodSeries extends UniEntity {
    public static RelativeUrl = 'period-series';
    public static EntityType = 'PeriodSeries';

    public Name: string;
    public Active: boolean;
    public ID: number;
    public CreatedBy: string;
    public SeriesType: PeriodSeriesType;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class PeriodTemplate extends UniEntity {
    public static RelativeUrl = 'period-templates';
    public static EntityType = 'PeriodTemplate';

    public Name: string;
    public No: number;
    public ID: number;
    public FromDate: LocalDate;
    public CreatedBy: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public ToDate: LocalDate;
    public PeriodSeriesID: number;
    public UpdatedAt: Date;
    public _createguid: string;
    public PeriodSeries: PeriodSeries;
    public CustomFields: any;
}


export class Model extends UniEntity {
    public static RelativeUrl = 'models';
    public static EntityType = 'Model';

    public Name: string;
    public Admin: boolean;
    public ID: number;
    public LabelPlural: string;
    public Shared: boolean;
    public CreatedBy: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Label: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public Description: string;
    public _createguid: string;
    public Fields: Array<Field>;
    public CustomFields: any;
}


export class Field extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Field';

    public Name: string;
    public ID: number;
    public CreatedBy: string;
    public ModelID: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Label: string;
    public Deleted: boolean;
    public HelpText: string;
    public UpdatedAt: Date;
    public Description: string;
    public _createguid: string;
    public Model: Model;
    public CustomFields: any;
}


export class Notification extends UniEntity {
    public static RelativeUrl = 'notifications';
    public static EntityType = 'Notification';

    public SenderDisplayName: string;
    public SourceEntityType: string;
    public StatusCode: number;
    public CompanyKey: string;
    public ID: number;
    public CreatedBy: string;
    public EntityType: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public SourceEntityID: number;
    public CompanyName: string;
    public Message: string;
    public RecipientID: string;
    public EntityID: number;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class CompanySettings extends UniEntity {
    public static RelativeUrl = 'companysettings';
    public static EntityType = 'CompanySettings';

    public AgioGainAccountID: number;
    public AutoJournalPayment: string;
    public InterrimPaymentAccountID: number;
    public AccountingLockedDate: LocalDate;
    public CompanyTypeID: number;
    public APIncludeAttachment: boolean;
    public BaseCurrencyCodeID: number;
    public UsePaymentBankValues: boolean;
    public DefaultEmailID: number;
    public DefaultAccrualAccountID: number;
    public RoundingNumberOfDecimals: number;
    public UseXtraPaymentOrgXmlTag: boolean;
    public TaxableFromDate: LocalDate;
    public UseFinancialDateToCalculateVatPercent: boolean;
    public DefaultAddressID: number;
    public SalaryBankAccountID: number;
    public Localization: string;
    public AccountVisibilityGroupID: number;
    public FactoringEmailID: number;
    public DefaultCustomerOrderReportID: number;
    public BankChargeAccountID: number;
    public CompanyRegistered: boolean;
    public StatusCode: number;
    public PaymentBankIdentification: string;
    public APGuid: string;
    public ID: number;
    public TaxBankAccountID: number;
    public EnableCheckboxesForSupplierInvoiceList: boolean;
    public ShowNumberOfDecimals: number;
    public CustomerAccountID: number;
    public DefaultCustomerInvoiceReminderReportID: number;
    public AutoDistributeInvoice: boolean;
    public APContactID: number;
    public NetsIntegrationActivated: boolean;
    public HasAutobank: boolean;
    public AccountGroupSetID: number;
    public VatReportFormID: number;
    public SAFTimportAccountID: number;
    public ShowKIDOnCustomerInvoice: boolean;
    public SettlementVatAccountID: number;
    public RoundingType: RoundingType;
    public InterrimRemitAccountID: number;
    public OrganizationNumber: string;
    public BatchInvoiceMinAmount: number;
    public DefaultTOFCurrencySettingsID: number;
    public GLN: string;
    public UseOcrInterpretation: boolean;
    public CreatedBy: string;
    public LogoFileID: number;
    public UseNetsIntegration: boolean;
    public DefaultCustomerInvoiceReportID: number;
    public BookCustomerInvoiceOnDeliveryDate: boolean;
    public APActivated: boolean;
    public PeriodSeriesAccountID: number;
    public CustomerCreditDays: number;
    public EnableSendPaymentBeforeJournaled: boolean;
    public CreatedAt: Date;
    public DefaultPhoneID: number;
    public TwoStageAutobankEnabled: boolean;
    public UpdatedBy: string;
    public FactoringNumber: number;
    public DefaultDistributionsID: number;
    public LogoHideField: number;
    public SaveCustomersFromQuoteAsLead: boolean;
    public TaxMandatory: boolean;
    public EnableAdvancedJournalEntry: boolean;
    public Deleted: boolean;
    public Factoring: number;
    public PeriodSeriesVatID: number;
    public ForceSupplierInvoiceApproval: boolean;
    public DefaultCustomerQuoteReportID: number;
    public CompanyName: string;
    public CustomerInvoiceReminderSettingsID: number;
    public LogoAlign: number;
    public XtraPaymentOrgXmlTagValue: string;
    public EnableApprovalFlow: boolean;
    public UseAssetRegister: boolean;
    public EnableArchiveSupplierInvoice: boolean;
    public AcceptableDelta4CustomerPayment: number;
    public HideInActiveCustomers: boolean;
    public CompanyBankAccountID: number;
    public AllowAvtalegiroRegularInvoice: boolean;
    public PaymentBankAgreementNumber: string;
    public AcceptableDelta4CustomerPaymentAccountID: number;
    public AgioLossAccountID: number;
    public WebAddress: string;
    public StoreDistributedInvoice: boolean;
    public OnlyJournalMatchedPayments: boolean;
    public HideInActiveSuppliers: boolean;
    public OfficeMunicipalityNo: string;
    public TaxableFromLimit: number;
    public VatLockedDate: LocalDate;
    public IgnorePaymentsWithoutEndToEndID: boolean;
    public DefaultSalesAccountID: number;
    public UpdatedAt: Date;
    public TaxMandatoryType: number;
    public SupplierAccountID: number;
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

    public Name: string;
    public StatusCode: number;
    public ID: number;
    public CreatedBy: string;
    public EntityType: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public _createguid: string;
    public Elements: Array<DistributionPlanElement>;
    public CustomFields: any;
}


export class DistributionPlanElement extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'DistributionPlanElement';

    public Priority: number;
    public StatusCode: number;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public DistributionPlanID: number;
    public DistributionPlanElementTypeID: number;
    public UpdatedAt: Date;
    public _createguid: string;
    public ElementType: DistributionPlanElementType;
    public CustomFields: any;
}


export class DistributionPlanElementType extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'DistributionPlanElementType';

    public Name: string;
    public StatusCode: number;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public _createguid: string;
    public LegalEntities: Array<DistributionPlanElementTypeLegalEntity>;
    public CustomFields: any;
}


export class DistributionPlanElementTypeLegalEntity extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'DistributionPlanElementTypeLegalEntity';

    public StatusCode: number;
    public ID: number;
    public CreatedBy: string;
    public EntityType: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public DistributionPlanElementTypeID: number;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class Distributions extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Distributions';

    public CustomerOrderDistributionPlanID: number;
    public AnnualStatementDistributionPlanID: number;
    public PayCheckDistributionPlanID: number;
    public StatusCode: number;
    public ID: number;
    public CustomerInvoiceDistributionPlanID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public CustomerInvoiceReminderDistributionPlanID: number;
    public CustomerQuoteDistributionPlanID: number;
    public UpdatedAt: Date;
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

    public Name: string;
    public StatusCode: number;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class EmailLog extends UniEntity {
    public static RelativeUrl = 'emails';
    public static EntityType = 'EmailLog';

    public JobRunExternalRef: string;
    public StatusCode: number;
    public ID: number;
    public From: string;
    public Subject: string;
    public CreatedBy: string;
    public DistributeAt: LocalDate;
    public EntityType: string;
    public JobRunID: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public ExternalMessage: string;
    public Deleted: boolean;
    public Type: SharingType;
    public To: string;
    public EntityID: number;
    public EntityDisplayValue: string;
    public ExternalReference: string;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class Eventplan extends UniEntity {
    public static RelativeUrl = 'eventplans';
    public static EntityType = 'Eventplan';

    public Name: string;
    public ModelFilter: string;
    public Active: boolean;
    public PlanType: EventplanType;
    public StatusCode: number;
    public ID: number;
    public CreatedBy: string;
    public SigningKey: string;
    public IsSystemPlan: boolean;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public Cargo: string;
    public JobNames: string;
    public OperationFilter: string;
    public UpdatedAt: Date;
    public _createguid: string;
    public ExpressionFilters: Array<ExpressionFilter>;
    public Subscribers: Array<EventSubscriber>;
    public CustomFields: any;
}


export class EventSubscriber extends UniEntity {
    public static RelativeUrl = 'eventsubscribers';
    public static EntityType = 'EventSubscriber';

    public Name: string;
    public Headers: string;
    public Active: boolean;
    public StatusCode: number;
    public ID: number;
    public CreatedBy: string;
    public EventplanID: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public Authorization: string;
    public UpdatedAt: Date;
    public Endpoint: string;
    public _createguid: string;
    public Eventplan: Eventplan;
    public CustomFields: any;
}


export class ExpressionFilter extends UniEntity {
    public static RelativeUrl = 'expressionfilters';
    public static EntityType = 'ExpressionFilter';

    public StatusCode: number;
    public ID: number;
    public CreatedBy: string;
    public EntityName: string;
    public EventplanID: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public Expression: string;
    public UpdatedAt: Date;
    public _createguid: string;
    public Eventplan: Eventplan;
    public CustomFields: any;
}


export class Period extends UniEntity {
    public static RelativeUrl = 'periodes';
    public static EntityType = 'Period';

    public Name: string;
    public AccountYear: number;
    public No: number;
    public PeriodTemplateID: number;
    public StatusCode: number;
    public ID: number;
    public FromDate: LocalDate;
    public CreatedBy: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public ToDate: LocalDate;
    public PeriodSeriesID: number;
    public UpdatedAt: Date;
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
    public CreatedBy: string;
    public Code: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public Type: PredefinedDescriptionType;
    public UpdatedAt: Date;
    public Description: string;
    public _createguid: string;
    public CustomFields: any;
}


export class ProductCategory extends UniEntity {
    public static RelativeUrl = 'productcategories';
    public static EntityType = 'ProductCategory';

    public Name: string;
    public Depth: number;
    public StatusCode: number;
    public ID: number;
    public Lft: number;
    public CreatedBy: string;
    public Comment: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public Status: number;
    public Rght: number;
    public ParentID: number;
    public UpdatedAt: Date;
    public Description: string;
    public _createguid: string;
    public CustomFields: any;
}


export class ProductCategoryLink extends UniEntity {
    public static RelativeUrl = 'productcategorylinks';
    public static EntityType = 'ProductCategoryLink';

    public ProductCategoryID: number;
    public StatusCode: number;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public ProductID: number;
    public UpdatedAt: Date;
    public _createguid: string;
    public ProductCategory: ProductCategory;
    public CustomFields: any;
}


export class Sharing extends UniEntity {
    public static RelativeUrl = 'sharings';
    public static EntityType = 'Sharing';

    public JobRunExternalRef: string;
    public StatusCode: number;
    public ID: number;
    public From: string;
    public Subject: string;
    public CreatedBy: string;
    public DistributeAt: LocalDate;
    public EntityType: string;
    public JobRunID: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public ExternalMessage: string;
    public Deleted: boolean;
    public Type: SharingType;
    public To: string;
    public EntityID: number;
    public EntityDisplayValue: string;
    public ExternalReference: string;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class StatusLog extends UniEntity {
    public static RelativeUrl = 'statuslogs';
    public static EntityType = 'StatusLog';

    public FromStatus: number;
    public ID: number;
    public CreatedBy: string;
    public EntityType: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public ToStatus: number;
    public EntityID: number;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class Tracelink extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Tracelink';

    public Date: Date;
    public DestinationInstanceID: number;
    public StatusCode: number;
    public ID: number;
    public CreatedBy: string;
    public SourceInstanceID: number;
    public CreatedAt: Date;
    public DestinationEntityName: string;
    public UpdatedBy: string;
    public Deleted: boolean;
    public SourceEntityName: string;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class User extends UniEntity {
    public static RelativeUrl = 'users';
    public static EntityType = 'User';

    public PhoneNumber: string;
    public Email: string;
    public GlobalIdentity: string;
    public BankIntegrationUserName: string;
    public StatusCode: number;
    public ID: number;
    public UserName: string;
    public DisplayName: string;
    public Protected: boolean;
    public CreatedBy: string;
    public LastLogin: Date;
    public IsAutobankAdmin: boolean;
    public HasAgreedToImportDisclaimer: boolean;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public AuthPhoneNumber: string;
    public TwoFactorEnabled: boolean;
    public EndDate: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class UniQueryDefinition extends UniEntity {
    public static RelativeUrl = 'uniquerydefinitions';
    public static EntityType = 'UniQueryDefinition';

    public Name: string;
    public ClickParam: string;
    public SortIndex: number;
    public SystemGeneratedQuery: boolean;
    public UserID: number;
    public StatusCode: number;
    public ID: number;
    public Category: string;
    public ClickUrl: string;
    public CreatedBy: string;
    public IsShared: boolean;
    public Code: string;
    public MainModelName: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public ModuleID: number;
    public UpdatedAt: Date;
    public Description: string;
    public _createguid: string;
    public UniQueryFilters: Array<UniQueryFilter>;
    public UniQueryFields: Array<UniQueryField>;
    public CustomFields: any;
}


export class UniQueryField extends UniEntity {
    public static RelativeUrl = 'uniqueryfields';
    public static EntityType = 'UniQueryField';

    public Alias: string;
    public FieldType: number;
    public StatusCode: number;
    public ID: number;
    public Field: string;
    public UniQueryDefinitionID: number;
    public CreatedBy: string;
    public Index: number;
    public Path: string;
    public Width: string;
    public Header: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public SumFunction: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class UniQueryFilter extends UniEntity {
    public static RelativeUrl = 'uniqueryfilters';
    public static EntityType = 'UniQueryFilter';

    public Group: number;
    public StatusCode: number;
    public ID: number;
    public Field: string;
    public UniQueryDefinitionID: number;
    public CreatedBy: string;
    public Operator: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public Value: string;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class Team extends UniEntity {
    public static RelativeUrl = 'teams';
    public static EntityType = 'Team';

    public Name: string;
    public Depth: number;
    public DimensionsID: number;
    public StatusCode: number;
    public ID: number;
    public Lft: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public Rght: number;
    public ParentID: number;
    public UpdatedAt: Date;
    public _createguid: string;
    public Dimensions: Dimensions;
    public Positions: Array<TeamPosition>;
    public CustomFields: any;
}


export class TeamPosition extends UniEntity {
    public static RelativeUrl = 'teampositions';
    public static EntityType = 'TeamPosition';

    public ApproveOrder: number;
    public TeamID: number;
    public UserID: number;
    public StatusCode: number;
    public ID: number;
    public Position: TeamPositionEnum;
    public FromDate: LocalDate;
    public CreatedBy: string;
    public RelatedSharedRoleId: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public ToDate: LocalDate;
    public UpdatedAt: Date;
    public _createguid: string;
    public Team: Team;
    public CustomFields: any;
}


export class ApprovalRule extends UniEntity {
    public static RelativeUrl = 'approvalrules';
    public static EntityType = 'ApprovalRule';

    public IndustryCodes: string;
    public StatusCode: number;
    public ID: number;
    public RuleType: ApprovalRuleType;
    public CreatedBy: string;
    public Keywords: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public Description: string;
    public _createguid: string;
    public Steps: Array<ApprovalRuleStep>;
    public CustomFields: any;
}


export class ApprovalRuleStep extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ApprovalRuleStep';

    public UserID: number;
    public ApprovalRuleID: number;
    public StatusCode: number;
    public ID: number;
    public Limit: number;
    public CreatedBy: string;
    public StepNumber: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public _createguid: string;
    public ApprovalRule: ApprovalRule;
    public User: User;
    public CustomFields: any;
}


export class ApprovalSubstitute extends UniEntity {
    public static RelativeUrl = 'approvalsubstitutes';
    public static EntityType = 'ApprovalSubstitute';

    public UserID: number;
    public StatusCode: number;
    public ID: number;
    public FromDate: LocalDate;
    public CreatedBy: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public ToDate: LocalDate;
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

    public UserID: number;
    public ApprovalRuleID: number;
    public StatusCode: number;
    public ID: number;
    public Limit: number;
    public TaskID: number;
    public ApprovalID: number;
    public Amount: number;
    public CreatedBy: string;
    public StepNumber: number;
    public Comment: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
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
    public StatusCategoryID: number;
    public StatusCode: number;
    public ID: number;
    public Order: number;
    public System: boolean;
    public CreatedBy: string;
    public EntityType: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public Description: string;
    public _createguid: string;
    public StatusCategory: StatusCategory;
    public CustomFields: any;
}


export class StatusCategory extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'StatusCategory';

    public Name: string;
    public StatusCategoryCode: StatusCategoryCode;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class StatusRemark extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'StatusRemark';

    public StatusCode: number;
    public ID: number;
    public CreatedBy: string;
    public EntityType: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public Remark: string;
    public EntityID: number;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class Transition extends UniEntity {
    public static RelativeUrl = 'transitions';
    public static EntityType = 'Transition';

    public MethodName: string;
    public ID: number;
    public Controller: string;
    public CreatedBy: string;
    public EntityType: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class TransitionThreshold extends UniEntity {
    public static RelativeUrl = 'thresholds';
    public static EntityType = 'TransitionThreshold';

    public SharedRejectTransitionId: number;
    public Disabled: boolean;
    public SharedRoleId: number;
    public ID: number;
    public CreatedBy: string;
    public Operator: Operator;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public SharedApproveTransitionId: number;
    public PropertyName: string;
    public Value: string;
    public RejectStatusCode: number;
    public Operation: OperationType;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class TransitionThresholdApproval extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'TransitionThresholdApproval';

    public SharedRejectTransitionId: number;
    public SharedRoleId: number;
    public ID: number;
    public ApprovalID: number;
    public CreatedBy: string;
    public Operator: Operator;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public SharedApproveTransitionId: number;
    public PropertyName: string;
    public Value: string;
    public RejectStatusCode: number;
    public Operation: OperationType;
    public UpdatedAt: Date;
    public _createguid: string;
    public Approval: Approval;
    public CustomFields: any;
}


export class Approval extends UniEntity {
    public static RelativeUrl = 'approvals';
    public static EntityType = 'Approval';

    public UserID: number;
    public StatusCode: number;
    public SharedRoleId: number;
    public ID: number;
    public TaskID: number;
    public Amount: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
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

    public SharedRejectTransitionId: number;
    public Title: string;
    public UserID: number;
    public StatusCode: number;
    public SharedRoleId: number;
    public ID: number;
    public CreatedBy: string;
    public ModelID: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public SharedApproveTransitionId: number;
    public Type: TaskType;
    public RejectStatusCode: number;
    public EntityID: number;
    public UpdatedAt: Date;
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
    public ID: number;
    public TransitionID: number;
    public ExpiresDate: Date;
    public FromStatusID: number;
    public CreatedBy: string;
    public EntityType: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
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

    public ProjectNumberSeriesID: number;
    public ProjectLeadName: string;
    public Name: string;
    public PlannedEnddate: LocalDate;
    public DimensionsID: number;
    public StatusCode: number;
    public ID: number;
    public Price: number;
    public StartDate: LocalDate;
    public CostPrice: number;
    public ProjectCustomerID: number;
    public Amount: number;
    public ProjectNumberNumeric: number;
    public CreatedBy: string;
    public EndDate: LocalDate;
    public Total: number;
    public CreatedAt: Date;
    public ProjectNumber: string;
    public PlannedStartdate: LocalDate;
    public UpdatedBy: string;
    public Deleted: boolean;
    public WorkPlaceAddressID: number;
    public UpdatedAt: Date;
    public Description: string;
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

    public ProjectID: number;
    public Name: string;
    public Responsibility: string;
    public UserID: number;
    public StatusCode: number;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public _createguid: string;
    public ProjectUser: User;
    public CustomFields: any;
}


export class ProjectResourceSchedule extends UniEntity {
    public static RelativeUrl = 'projects-schedules-resources';
    public static EntityType = 'ProjectResourceSchedule';

    public ProjectTaskScheduleID: number;
    public StatusCode: number;
    public ID: number;
    public ProjectTaskID: number;
    public ProjectResourceID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class ProjectTask extends UniEntity {
    public static RelativeUrl = 'projects-tasks';
    public static EntityType = 'ProjectTask';

    public ProjectID: number;
    public Name: string;
    public StatusCode: number;
    public SuggestedNumber: string;
    public ID: number;
    public Price: number;
    public StartDate: LocalDate;
    public CostPrice: number;
    public Amount: number;
    public CreatedBy: string;
    public EndDate: LocalDate;
    public Total: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public Description: string;
    public Number: string;
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
    public ProjectTaskID: number;
    public StartDate: LocalDate;
    public CreatedBy: string;
    public EndDate: LocalDate;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public _createguid: string;
    public ScheduleResources: Array<ProjectResourceSchedule>;
    public CustomFields: any;
}


export class BarnepassProduct extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'BarnepassProduct';

    public StatusCode: number;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public ProductID: number;
    public UpdatedAt: Date;
    public _createguid: string;
    public Product: Product;
    public CustomFields: any;
}


export class Product extends UniEntity {
    public static RelativeUrl = 'products';
    public static EntityType = 'Product';

    public Name: string;
    public ListPrice: number;
    public PartName: string;
    public DimensionsID: number;
    public StatusCode: number;
    public ID: number;
    public CostPrice: number;
    public PriceIncVat: number;
    public CreatedBy: string;
    public PriceExVat: number;
    public AverageCost: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public VariansParentID: number;
    public VatTypeID: number;
    public Type: ProductTypeEnum;
    public AccountID: number;
    public CalculateGrossPriceBasedOnNetPrice: boolean;
    public Unit: string;
    public ImageFileID: number;
    public UpdatedAt: Date;
    public DefaultProductCategoryID: number;
    public Description: string;
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

    public MainAccountID: number;
    public Name: string;
    public AccountYear: number;
    public NumberSeriesTaskID: number;
    public Disabled: boolean;
    public StatusCode: number;
    public UseNumbersFromNumberSeriesID: number;
    public ID: number;
    public DisplayName: string;
    public ToNumber: number;
    public IsDefaultForTask: boolean;
    public System: boolean;
    public CreatedBy: string;
    public Comment: string;
    public FromNumber: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public NextNumber: number;
    public Empty: boolean;
    public NumberSeriesTypeID: number;
    public NumberLock: boolean;
    public UpdatedAt: Date;
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
    public StatusCode: number;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public _createguid: string;
    public NumberSerieTypeA: NumberSeriesType;
    public NumberSerieTypeB: NumberSeriesType;
    public CustomFields: any;
}


export class NumberSeriesTask extends UniEntity {
    public static RelativeUrl = 'number-series-tasks';
    public static EntityType = 'NumberSeriesTask';

    public Name: string;
    public StatusCode: number;
    public ID: number;
    public CreatedBy: string;
    public EntityType: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public _createguid: string;
    public NumberSeries: Array<NumberSeries>;
    public CustomFields: any;
}


export class NumberSeriesType extends UniEntity {
    public static RelativeUrl = 'number-series-types';
    public static EntityType = 'NumberSeriesType';

    public Yearly: boolean;
    public Name: string;
    public CanHaveSeveralActiveSeries: boolean;
    public StatusCode: number;
    public ID: number;
    public System: boolean;
    public CreatedBy: string;
    public EntitySeriesIDField: string;
    public EntityType: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public EntityField: string;
    public UpdatedAt: Date;
    public _createguid: string;
    public Series: Array<NumberSeries>;
    public CustomFields: any;
}


export class EncryptionInfo extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'EncryptionInfo';

    public password: string;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public type: Type;
    public UpdatedAt: Date;
    public description: string;
    public _createguid: string;
    public CustomFields: any;
}


export class File extends UniEntity {
    public static RelativeUrl = 'files/{entitytype}/{entityid}';
    public static EntityType = 'File';

    public Name: string;
    public OCRData: string;
    public encryptionID: number;
    public StatusCode: number;
    public ID: number;
    public ContentType: string;
    public CreatedBy: string;
    public Md5: string;
    public CreatedAt: Date;
    public Size: string;
    public UpdatedBy: string;
    public Deleted: boolean;
    public Pages: number;
    public PermaLink: string;
    public UpdatedAt: Date;
    public Description: string;
    public StorageReference: string;
    public _createguid: string;
    public UploadSlot: string;
    public FileTags: Array<FileTag>;
    public EntityLinks: Array<FileEntityLink>;
    public CustomFields: any;
}


export class FileTag extends UniEntity {
    public static RelativeUrl = 'filetags';
    public static EntityType = 'FileTag';

    public FileID: number;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public TagName: string;
    public Status: number;
    public UpdatedAt: Date;
    public _createguid: string;
    public File: File;
    public CustomFields: any;
}


export class FileEntityLink extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'FileEntityLink';

    public FileID: number;
    public StatusCode: number;
    public ID: number;
    public IsAttachment: boolean;
    public CreatedBy: string;
    public EntityType: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public EntityID: number;
    public UpdatedAt: Date;
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
    public DateLogged: Date;
    public ProductType: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public ExternalReference: string;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class AccessPointFormat extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AccessPointFormat';

    public Name: string;
    public OutgoingID: number;
    public StatusCode: number;
    public ID: number;
    public IncommingID: number;
    public ResourceName: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Label: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class EHFLog extends UniEntity {
    public static RelativeUrl = 'ehf';
    public static EntityType = 'EHFLog';

    public JobRunExternalRef: string;
    public StatusCode: number;
    public ID: number;
    public From: string;
    public Subject: string;
    public CreatedBy: string;
    public DistributeAt: LocalDate;
    public EntityType: string;
    public JobRunID: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public ExternalMessage: string;
    public Deleted: boolean;
    public Type: SharingType;
    public To: string;
    public EntityID: number;
    public EntityDisplayValue: string;
    public ExternalReference: string;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class Department extends UniEntity {
    public static RelativeUrl = 'departments';
    public static EntityType = 'Department';

    public Name: string;
    public DepartmentNumber: string;
    public DepartmentNumberNumeric: number;
    public StatusCode: number;
    public ID: number;
    public DepartmentNumberSeriesID: number;
    public DepartmentManagerName: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public Description: string;
    public _createguid: string;
    public DepartmentNumberSeries: NumberSeries;
    public CustomFields: any;
}


export class Dimension10 extends UniEntity {
    public static RelativeUrl = 'Dimension10';
    public static EntityType = 'Dimension10';

    public Name: string;
    public NumberNumeric: number;
    public StatusCode: number;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public Description: string;
    public Number: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Dimension5 extends UniEntity {
    public static RelativeUrl = 'Dimension5';
    public static EntityType = 'Dimension5';

    public Name: string;
    public NumberNumeric: number;
    public StatusCode: number;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public Description: string;
    public Number: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Dimension6 extends UniEntity {
    public static RelativeUrl = 'Dimension6';
    public static EntityType = 'Dimension6';

    public Name: string;
    public NumberNumeric: number;
    public StatusCode: number;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public Description: string;
    public Number: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Dimension7 extends UniEntity {
    public static RelativeUrl = 'Dimension7';
    public static EntityType = 'Dimension7';

    public Name: string;
    public NumberNumeric: number;
    public StatusCode: number;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public Description: string;
    public Number: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Dimension8 extends UniEntity {
    public static RelativeUrl = 'Dimension8';
    public static EntityType = 'Dimension8';

    public Name: string;
    public NumberNumeric: number;
    public StatusCode: number;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public Description: string;
    public Number: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Dimension9 extends UniEntity {
    public static RelativeUrl = 'Dimension9';
    public static EntityType = 'Dimension9';

    public Name: string;
    public NumberNumeric: number;
    public StatusCode: number;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public Description: string;
    public Number: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Dimensions extends UniEntity {
    public static RelativeUrl = 'dimensions';
    public static EntityType = 'Dimensions';

    public ProjectID: number;
    public Dimension9ID: number;
    public StatusCode: number;
    public ID: number;
    public ProjectTaskID: number;
    public Dimension5ID: number;
    public Dimension10ID: number;
    public ResponsibleID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Dimension7ID: number;
    public Deleted: boolean;
    public DepartmentID: number;
    public RegionID: number;
    public Dimension8ID: number;
    public Dimension6ID: number;
    public UpdatedAt: Date;
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
    public DepartmentNumber: string;
    public Dimension7Name: string;
    public Dimension6Name: string;
    public ProjectName: string;
    public Dimension9Name: string;
    public Dimension10Name: string;
    public Dimension5Name: string;
    public Dimension8Name: string;
    public DimensionsID: number;
    public Dimension10Number: string;
    public ID: number;
    public DepartmentName: string;
    public Dimension6Number: string;
    public RegionCode: string;
    public Dimension8Number: string;
    public Dimension5Number: string;
    public Dimension9Number: string;
    public ProjectTaskName: string;
    public ProjectNumber: string;
    public ProjectTaskNumber: string;
    public RegionName: string;
    public ResponsibleName: string;
    public Dimension7Number: string;
}


export class DimensionSettings extends UniEntity {
    public static RelativeUrl = 'dimensionsettings';
    public static EntityType = 'DimensionSettings';

    public StatusCode: number;
    public ID: number;
    public Dimension: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Label: string;
    public Deleted: boolean;
    public IsActive: boolean;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class Region extends UniEntity {
    public static RelativeUrl = 'regions';
    public static EntityType = 'Region';

    public Name: string;
    public StatusCode: number;
    public ID: number;
    public RegionCode: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public CountryCode: string;
    public UpdatedAt: Date;
    public Description: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Responsible extends UniEntity {
    public static RelativeUrl = 'responsibles';
    public static EntityType = 'Responsible';

    public Name: string;
    public StatusCode: number;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public NameOfResponsible: string;
    public Description: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Contract extends UniEntity {
    public static RelativeUrl = 'contracts';
    public static EntityType = 'Contract';

    public Name: string;
    public ContractCode: string;
    public StatusCode: number;
    public ID: number;
    public TeamsUri: string;
    public CreatedBy: string;
    public Engine: ContractEngine;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public Hash: string;
    public HashTransactionAddress: string;
    public UpdatedAt: Date;
    public Description: string;
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
    public AssetAddress: string;
    public ContractAssetID: number;
    public StatusCode: number;
    public ID: number;
    public Amount: number;
    public CreatedBy: string;
    public EntityType: string;
    public CreatedAt: Date;
    public Address: string;
    public UpdatedBy: string;
    public Deleted: boolean;
    public Type: AddressType;
    public EntityID: number;
    public UpdatedAt: Date;
    public _createguid: string;
    public Contract: Contract;
    public ContractAsset: ContractAsset;
    public CustomFields: any;
}


export class ContractAsset extends UniEntity {
    public static RelativeUrl = 'contractassets';
    public static EntityType = 'ContractAsset';

    public ContractID: number;
    public IsFixedDenominations: boolean;
    public SpenderAttested: boolean;
    public StatusCode: number;
    public IsPrivate: boolean;
    public ID: number;
    public IsIssuedByDefinerOnly: boolean;
    public IsTransferrable: boolean;
    public CreatedBy: string;
    public Cap: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public Type: AddressType;
    public IsAutoDestroy: boolean;
    public IsCosignedByDefiner: boolean;
    public UpdatedAt: Date;
    public _createguid: string;
    public Contract: Contract;
    public CustomFields: any;
}


export class ContractDebugLog extends UniEntity {
    public static RelativeUrl = 'contractdebuglogs';
    public static EntityType = 'ContractDebugLog';

    public ContractID: number;
    public StatusCode: number;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public Type: ContractEventType;
    public Message: string;
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

    public ContractID: number;
    public Name: string;
    public StatusCode: number;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public Value: string;
    public UpdatedAt: Date;
    public _createguid: string;
    public Contract: Contract;
    public CustomFields: any;
}


export class ContractRunLog extends UniEntity {
    public static RelativeUrl = 'contractrunlogs';
    public static EntityType = 'ContractRunLog';

    public ContractID: number;
    public ContractTriggerID: number;
    public StatusCode: number;
    public ID: number;
    public CreatedBy: string;
    public RunTime: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public Type: ContractEventType;
    public Message: string;
    public UpdatedAt: Date;
    public _createguid: string;
    public Contract: Contract;
    public CustomFields: any;
}


export class ContractTransaction extends UniEntity {
    public static RelativeUrl = 'contracttransactions';
    public static EntityType = 'ContractTransaction';

    public ContractID: number;
    public SenderAddress: string;
    public AssetAddress: string;
    public StatusCode: number;
    public ID: number;
    public ReceiverAddress: string;
    public Amount: number;
    public CreatedBy: string;
    public ContractAddressID: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
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
    public ExpressionFilter: string;
    public StatusCode: number;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public Type: ContractEventType;
    public OperationFilter: string;
    public UpdatedAt: Date;
    public _createguid: string;
    public Contract: Contract;
    public CustomFields: any;
}


export class Comment extends UniEntity {
    public static RelativeUrl = 'comments';
    public static EntityType = 'Comment';

    public Text: string;
    public StatusCode: number;
    public ID: number;
    public CreatedBy: string;
    public AuthorID: number;
    public EntityType: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public EntityID: number;
    public UpdatedAt: Date;
    public _createguid: string;
    public Mentioned: Array<Mentioned>;
    public Author: User;
    public CustomFields: any;
}


export class Mentioned extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Mentioned';

    public UserID: number;
    public StatusCode: number;
    public CommentID: number;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public _createguid: string;
    public User: User;
    public CustomFields: any;
}


export class ApiKey extends UniEntity {
    public static RelativeUrl = 'apikeys';
    public static EntityType = 'ApiKey';

    public IntegrationKey: string;
    public Url: string;
    public ExternalId: string;
    public StatusCode: number;
    public ID: number;
    public CreatedBy: string;
    public Encrypt: boolean;
    public CreatedAt: Date;
    public IntegrationType: TypeOfIntegration;
    public UpdatedBy: string;
    public Deleted: boolean;
    public FilterDate: LocalDate;
    public UpdatedAt: Date;
    public Description: string;
    public _createguid: string;
    public CustomFields: any;
}


export class Altinn extends UniEntity {
    public static RelativeUrl = 'altinn';
    public static EntityType = 'Altinn';

    public SystemPw: string;
    public PreferredLogin: TypeOfLogin;
    public StatusCode: number;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public Language: string;
    public UpdatedBy: string;
    public Deleted: boolean;
    public SystemID: string;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class AltinnReceipt extends UniEntity {
    public static RelativeUrl = 'altinnreceipts';
    public static EntityType = 'AltinnReceipt';

    public ErrorText: string;
    public UserSign: string;
    public Form: string;
    public StatusCode: number;
    public TimeStamp: Date;
    public ID: number;
    public ReceiptID: number;
    public AltinnResponseData: string;
    public CreatedBy: string;
    public XmlReceipt: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public HasBeenRegistered: boolean;
    public UpdatedAt: Date;
    public _createguid: string;
    public Signings: Array<AltinnSigning>;
    public CustomFields: any;
}


export class AltinnSigning extends UniEntity {
    public static RelativeUrl = 'altinnsigning';
    public static EntityType = 'AltinnSigning';

    public StatusCode: number;
    public ID: number;
    public DateSigned: Date;
    public AltinnReceiptID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public StatusText: string;
    public SignatureReference: string;
    public SignatureText: string;
    public UpdatedAt: Date;
    public _createguid: string;
    public AltinnReceipt: AltinnReceipt;
    public CustomFields: any;
}


export class Barnepass extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Barnepass';

    public StatusCode: number;
    public ID: number;
    public inntektsaar: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public _createguid: string;
    public oppgave: Array<BarnepassOppgave>;
    public CustomFields: any;
}


export class BarnepassOppgave extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'BarnepassOppgave';

    public email: string;
    public foedselsnummer: string;
    public navn: string;
    public StatusCode: number;
    public ID: number;
    public paaloeptBeloep: number;
    public BarnepassID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class UserRole extends UniEntity {
    public static RelativeUrl = 'userroles';
    public static EntityType = 'UserRole';

    public UserID: number;
    public SharedRoleId: number;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public SharedRoleName: string;
    public UpdatedAt: Date;
    public _createguid: string;
    public User: User;
    public CustomFields: any;
}


export class Role extends UniEntity {
    public static RelativeUrl = 'roles';
    public static EntityType = 'Role';

    public Name: string;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Label: string;
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

    public RoleID: number;
    public ID: number;
    public PermissionID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public _createguid: string;
    public Role: Role;
    public Permission: Permission;
    public CustomFields: any;
}


export class Permission extends UniEntity {
    public static RelativeUrl = 'permissions';
    public static EntityType = 'Permission';

    public Name: string;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public _createguid: string;
    public RolePermissions: Array<RolePermission>;
    public CustomFields: any;
}


export class ApiMessage extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ApiMessage';

    public Service: string;
    public StatusCode: number;
    public ID: number;
    public FromDate: Date;
    public CreatedBy: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public Type: ApiMessageType;
    public Message: string;
    public ToDate: Date;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class AvtaleGiroAgreement extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AvtaleGiroAgreement';

    public KeyPath: string;
    public Thumbprint: string;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public NextNumber: number;
    public DataSender: string;
    public UpdatedAt: Date;
    public Description: string;
    public _createguid: string;
    public CustomFields: any;
}


export class AvtaleGiroBankAccount extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AvtaleGiroBankAccount';

    public AvtaleGiroAgreementID: number;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public BankAccountNumber: string;
    public UpdatedBy: string;
    public Deleted: boolean;
    public CompanyID: number;
    public UpdatedAt: Date;
    public _createguid: string;
    public Company: Company;
    public CustomFields: any;
}


export class AvtaleGiroFile extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AvtaleGiroFile';

    public FileID: number;
    public AvtaleGiroAgreementID: number;
    public ID: number;
    public CreatedBy: string;
    public AvtaleGiroContent: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public CompanyID: number;
    public AvtaleGiroMergedFileID: number;
    public UpdatedAt: Date;
    public _createguid: string;
    public Company: Company;
    public CustomFields: any;
}


export class AvtaleGiroMergedFile extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AvtaleGiroMergedFile';

    public TransmissionNumber: number;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class BankAgreement extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'BankAgreement';

    public CustomerName: string;
    public ServiceID: string;
    public OrderName: string;
    public ID: number;
    public AccountOwnerName: string;
    public ReceiptDate: Date;
    public ReceiptID: string;
    public ServiceAccountID: number;
    public CreatedBy: string;
    public OrderEmail: string;
    public AccountOwnerOrgNumber: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public CustomerOrgNumber: string;
    public OrderMobile: string;
    public CompanyID: number;
    public UpdatedAt: Date;
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
    public ServiceType: number;
    public BankAgreementID: number;
    public KidRule: string;
    public ID: number;
    public DivisionName: string;
    public FileType: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public ConfirmInNetbank: boolean;
    public UpdatedAt: Date;
    public _createguid: string;
    public BankAgreement: BankAgreement;
    public BankAccounts: Array<BankServiceBankAccount>;
    public CustomFields: any;
}


export class BankServiceBankAccount extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'BankServiceBankAccount';

    public BankServiceID: number;
    public ID: number;
    public CreatedBy: string;
    public AccountNumber: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public _createguid: string;
    public BankService: BankService;
    public CustomFields: any;
}


export class Company extends UniEntity {
    public static RelativeUrl = 'companies';
    public static EntityType = 'Company';

    public Key: string;
    public Name: string;
    public ConnectionString: string;
    public WebHookSubscriberId: string;
    public IsTest: boolean;
    public StatusCode: CompanyStatusCode;
    public ID: number;
    public IsGlobalTemplate: boolean;
    public OrganizationNumber: string;
    public CreatedBy: string;
    public SchemaName: string;
    public IsTemplate: boolean;
    public FileFlowOrgnrEmail: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public ClientNumber: number;
    public MigrationVersion: string;
    public LastActivity: Date;
    public UpdatedAt: Date;
    public FileFlowEmail: string;
    public _createguid: string;
    public CustomFields: any;
}


export class CompanyAccess extends UniEntity {
    public static RelativeUrl = 'companies-access';
    public static EntityType = 'CompanyAccess';

    public GlobalIdentity: string;
    public StatusCode: number;
    public ID: number;
    public StartDate: Date;
    public Roles: string;
    public CreatedBy: string;
    public EndDate: Date;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public CompanyID: number;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class CompanyBackup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'CompanyBackup';

    public ScheduledForDeleteAt: Date;
    public ContractID: number;
    public CustomerName: string;
    public Environment: string;
    public Reason: string;
    public DeletedAt: Date;
    public CompanyKey: string;
    public ID: number;
    public BackupStatus: BackupStatus;
    public CreatedBy: string;
    public SchemaName: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public ContractType: number;
    public Deleted: boolean;
    public CompanyName: string;
    public Message: string;
    public CopyFiles: boolean;
    public ContainerName: string;
    public OrgNumber: string;
    public CloudBlobName: string;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class ContractCron extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ContractCron';

    public ContractID: number;
    public ContractTriggerID: number;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public Expression: string;
    public CompanyID: number;
    public UpdatedAt: Date;
    public CompanyDbName: string;
    public CompanyKey: string;
    public _createguid: string;
    public CustomFields: any;
}


export class ContractObyte extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ContractObyte';

    public ContractID: number;
    public AssetAddress: string;
    public ID: number;
    public CreatedBy: string;
    public ContractAddressID: number;
    public CreatedAt: Date;
    public Address: string;
    public UpdatedBy: string;
    public Deleted: boolean;
    public CompanyID: number;
    public UpdatedAt: Date;
    public CompanyDbName: string;
    public CompanyKey: string;
    public _createguid: string;
    public CustomFields: any;
}


export class DeniedUserAccessLog extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'DeniedUserAccessLog';

    public Email: string;
    public Occurred: Date;
    public ID: number;
    public Username: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public CompanyName: string;
    public Message: string;
    public CompanyID: number;
    public UpdatedAt: Date;
    public _createguid: string;
    public Company: Company;
    public CustomFields: any;
}


export class FailedBankFile extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'FailedBankFile';

    public CompanyKey: string;
    public ID: number;
    public CreatedBy: string;
    public FileContent: string;
    public FailedReason: FailedReasonEnum;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public FileName: string;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class HangfireJob extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'HangfireJob';

    public GlobalIdentity: string;
    public HasError: boolean;
    public JobId: string;
    public CompanyKey: string;
    public ID: number;
    public Completed: boolean;
    public CreatedAt: Date;
    public Status: number;
    public CompanyID: number;
    public Year: number;
    public UpdatedAt: Date;
    public CustomFields: any;
}


export class HangfireJobContext extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'HangfireJobContext';

    public GlobalIdentity: string;
    public HasError: boolean;
    public JobId: string;
    public CompanyKey: string;
    public ID: number;
    public Completed: boolean;
    public SchemaName: string;
    public CreatedAt: Date;
    public Status: number;
    public CompanyID: number;
    public Year: number;
    public UpdatedAt: Date;
    public CustomFields: any;
}


export class HangfireResponse extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'HangfireResponse';

    public GlobalIdentity: string;
    public HasError: boolean;
    public JobId: string;
    public CompanyKey: string;
    public ID: number;
    public Completed: boolean;
    public ProgressUrl: string;
    public State: string;
    public CreatedAt: Date;
    public Status: number;
    public CompanyID: number;
    public Year: number;
    public UpdatedAt: Date;
    public CustomFields: any;
}


export class KpiDefinition extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'KpiDefinition';

    public Name: string;
    public RefreshModels: string;
    public ID: number;
    public ValueType: KpiValueType;
    public RoleNames: string;
    public IsPerUser: boolean;
    public CreatedBy: string;
    public Interval: string;
    public CreatedAt: Date;
    public Route: string;
    public UpdatedBy: string;
    public Deleted: boolean;
    public SourceType: KpiSourceType;
    public CompanyID: number;
    public Application: string;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class KpiValue extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'KpiValue';

    public Text: string;
    public KpiName: string;
    public LastUpdated: Date;
    public UserIdentity: string;
    public ID: number;
    public ValueStatus: KpiValueStatus;
    public CreatedBy: string;
    public KpiDefinitionID: number;
    public Counter: number;
    public Total: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public CompanyID: number;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class OutgoingInvoice extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'OutgoingInvoice';

    public RecipientOrganizationNumber: string;
    public RecipientPhoneNumber: string;
    public StatusCode: number;
    public MetaJson: string;
    public ID: number;
    public InvoiceType: OutgoingInvoiceType;
    public Amount: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public DueDate: Date;
    public Deleted: boolean;
    public Status: number;
    public CompanyID: number;
    public InvoiceID: number;
    public ISPOrganizationNumber: string;
    public ExternalReference: string;
    public UpdatedAt: Date;
    public _createguid: string;
    public Company: Company;
    public CustomFields: any;
}


export class ProcessFileLog extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ProcessFileLog';

    public FileID: number;
    public UserIdentity: string;
    public StatusCode: number;
    public CompanyKey: string;
    public ID: number;
    public FileType: number;
    public CreatedBy: string;
    public EntityInstanceID: string;
    public EntityName: string;
    public CreatedAt: Date;
    public EntityCount: number;
    public UpdatedBy: string;
    public Deleted: boolean;
    public CompanyName: string;
    public Message: string;
    public FileName: string;
    public CompanyID: number;
    public UpdatedAt: Date;
    public _createguid: string;
    public Company: Company;
    public CustomFields: any;
}


export class ServiceAccount extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ServiceAccount';

    public KeyPath: string;
    public Thumbprint: string;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public NextNumber: number;
    public DataSender: string;
    public UpdatedAt: Date;
    public Description: string;
    public _createguid: string;
    public CustomFields: any;
}


export class UserVerification extends UniEntity {
    public static RelativeUrl = 'user-verifications';
    public static EntityType = 'UserVerification';

    public Email: string;
    public ExpirationDate: Date;
    public RequestOrigin: UserVerificationRequestOrigin;
    public UserType: UserVerificationUserType;
    public UserId: number;
    public StatusCode: number;
    public ID: number;
    public DisplayName: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public VerificationCode: string;
    public Deleted: boolean;
    public CompanyId: number;
    public UpdatedAt: Date;
    public VerificationDate: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class Account extends UniEntity {
    public static RelativeUrl = 'accounts';
    public static EntityType = 'Account';

    public SupplierID: number;
    public DoSynchronize: boolean;
    public AccountGroupID: number;
    public SystemAccount: boolean;
    public AccountName: string;
    public Active: boolean;
    public CostAllocationID: number;
    public DimensionsID: number;
    public StatusCode: number;
    public ID: number;
    public TopLevelAccountGroupID: number;
    public CustomerID: number;
    public LockManualPosts: boolean;
    public Visible: boolean;
    public Locked: boolean;
    public UsePostPost: boolean;
    public CreatedBy: string;
    public SaftMappingAccountID: number;
    public Keywords: string;
    public AccountNumber: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public EmployeeID: number;
    public Deleted: boolean;
    public VatTypeID: number;
    public AccountID: number;
    public UseVatDeductionGroupID: number;
    public UpdatedAt: Date;
    public Description: string;
    public AccountSetupID: number;
    public CurrencyCodeID: number;
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

    public Name: string;
    public StatusCode: number;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public AccountID: number;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class AccountGroup extends UniEntity {
    public static RelativeUrl = 'accountgroups';
    public static EntityType = 'AccountGroup';

    public Name: string;
    public MainGroupID: number;
    public StatusCode: number;
    public ID: number;
    public AccountGroupSetID: number;
    public AccountGroupSetupID: number;
    public CreatedBy: string;
    public Summable: boolean;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public GroupNumber: string;
    public AccountID: number;
    public UpdatedAt: Date;
    public CompatibleAccountID: number;
    public _createguid: string;
    public MainGroup: AccountGroup;
    public AccountGroupSet: AccountGroupSet;
    public CustomFields: any;
}


export class AccountGroupSet extends UniEntity {
    public static RelativeUrl = 'accountgroupsets';
    public static EntityType = 'AccountGroupSet';

    public FromAccountNumber: number;
    public Name: string;
    public StatusCode: number;
    public ID: number;
    public Shared: boolean;
    public SubAccountAllowed: boolean;
    public System: boolean;
    public CreatedBy: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public ToAccountNumber: number;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class AccountMandatoryDimension extends UniEntity {
    public static RelativeUrl = 'accountmandatorydimension';
    public static EntityType = 'AccountMandatoryDimension';

    public DimensionNo: number;
    public StatusCode: number;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public AccountID: number;
    public UpdatedAt: Date;
    public MandatoryType: number;
    public _createguid: string;
    public CustomFields: any;
}


export class Accrual extends UniEntity {
    public static RelativeUrl = 'accruals';
    public static EntityType = 'Accrual';

    public AccrualAmount: number;
    public ResultAccountID: number;
    public StatusCode: number;
    public ID: number;
    public CreatedBy: string;
    public AccrualJournalEntryMode: number;
    public CreatedAt: Date;
    public BalanceAccountID: number;
    public UpdatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
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

    public AccountYear: number;
    public StatusCode: number;
    public ID: number;
    public JournalEntryDraftLineID: number;
    public Amount: number;
    public AccrualID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public PeriodNo: number;
    public UpdatedAt: Date;
    public _createguid: string;
    public Accrual: Accrual;
    public JournalEntryLineDraft: JournalEntryLineDraft;
    public CustomFields: any;
}


export class ApprovalData extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ApprovalData';

    public EntityReference: string;
    public ID: number;
    public VerificationMethod: string;
    public CreatedBy: string;
    public EntityName: string;
    public CreatedAt: Date;
    public EntityCount: number;
    public UpdatedBy: string;
    public Deleted: boolean;
    public EntityHash: string;
    public EntityID: number;
    public VerificationReference: string;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class Asset extends UniEntity {
    public static RelativeUrl = 'assets';
    public static EntityType = 'Asset';

    public Name: string;
    public Lifetime: number;
    public ScrapValue: number;
    public DimensionsID: number;
    public StatusCode: number;
    public ID: number;
    public AutoDepreciation: boolean;
    public CreatedBy: string;
    public PurchaseAmount: number;
    public DepreciationCycle: number;
    public CreatedAt: Date;
    public BalanceAccountID: number;
    public DepreciationStartDate: LocalDate;
    public PurchaseDate: LocalDate;
    public UpdatedBy: string;
    public Deleted: boolean;
    public DepreciationAccountID: number;
    public AssetGroupCode: string;
    public NetFinancialValue: number;
    public UpdatedAt: Date;
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

    public Name: string;
    public AddressID: number;
    public StatusCode: number;
    public ID: number;
    public InitialBIC: string;
    public CreatedBy: string;
    public PhoneID: number;
    public EmailID: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public BIC: string;
    public Deleted: boolean;
    public Web: string;
    public UpdatedAt: Date;
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
    public StatusCode: number;
    public BusinessRelationID: number;
    public IntegrationSettings: string;
    public ID: number;
    public IBAN: string;
    public CompanySettingsID: number;
    public Locked: boolean;
    public BankID: number;
    public CreatedBy: string;
    public AccountNumber: string;
    public CreatedAt: Date;
    public BankAccountType: string;
    public UpdatedBy: string;
    public Label: string;
    public Deleted: boolean;
    public AccountID: number;
    public UpdatedAt: Date;
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

    public HasNewAccountInformation: boolean;
    public Name: string;
    public Email: string;
    public PropertiesJson: string;
    public IsBankBalance: boolean;
    public ServiceProvider: number;
    public ServiceTemplateID: string;
    public ServiceID: string;
    public IsInbound: boolean;
    public BankAcceptance: boolean;
    public StatusCode: number;
    public ID: number;
    public IsOutgoing: boolean;
    public HasOrderedIntegrationChange: boolean;
    public CreatedBy: string;
    public BankAccountID: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public PreApprovedBankPayments: PreApprovedBankPayments;
    public DefaultAgreement: boolean;
    public UpdatedAt: Date;
    public Password: string;
    public _createguid: string;
    public BankAccount: BankAccount;
    public CustomFields: any;
}


export class BankRule extends UniEntity {
    public static RelativeUrl = 'bankrules';
    public static EntityType = 'BankRule';

    public Name: string;
    public Priority: number;
    public Rule: string;
    public ActionCode: ActionCodeBankRule;
    public StatusCode: number;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public AccountID: number;
    public IsActive: boolean;
    public UpdatedAt: Date;
    public _createguid: string;
    public Account: Account;
    public CustomFields: any;
}


export class BankStatement extends UniEntity {
    public static RelativeUrl = 'bankstatements';
    public static EntityType = 'BankStatement';

    public FileID: number;
    public StatusCode: number;
    public ID: number;
    public ArchiveReference: string;
    public Amount: number;
    public FromDate: LocalDate;
    public CreatedBy: string;
    public EndBalance: number;
    public CurrencyCode: string;
    public BankAccountID: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public AmountCurrency: number;
    public Deleted: boolean;
    public AccountID: number;
    public ToDate: LocalDate;
    public StartBalance: number;
    public UpdatedAt: Date;
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

    public ReceiverAccount: string;
    public TransactionId: string;
    public StructuredReference: string;
    public OpenAmount: number;
    public SenderName: string;
    public StatusCode: number;
    public ID: number;
    public InvoiceNumber: string;
    public ArchiveReference: string;
    public Category: string;
    public Amount: number;
    public CID: string;
    public BookingDate: LocalDate;
    public CreatedBy: string;
    public CurrencyCode: string;
    public SenderAccount: string;
    public Receivername: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public AmountCurrency: number;
    public Deleted: boolean;
    public BankStatementID: number;
    public ValueDate: LocalDate;
    public UpdatedAt: Date;
    public Description: string;
    public OpenAmountCurrency: number;
    public _createguid: string;
    public BankStatement: BankStatement;
    public CustomFields: any;
}


export class BankStatementMatch extends UniEntity {
    public static RelativeUrl = 'bankstatementmatch';
    public static EntityType = 'BankStatementMatch';

    public Group: string;
    public Batch: string;
    public StatusCode: number;
    public ID: number;
    public Amount: number;
    public BankStatementEntryID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public JournalEntryLineID: number;
    public UpdatedAt: Date;
    public _createguid: string;
    public BankStatementEntry: BankStatementEntry;
    public JournalEntryLine: JournalEntryLine;
    public CustomFields: any;
}


export class BankStatementRule extends UniEntity {
    public static RelativeUrl = 'bankstatementrules';
    public static EntityType = 'BankStatementRule';

    public Name: string;
    public EntryText: string;
    public Priority: number;
    public Rule: string;
    public DimensionsID: number;
    public StatusCode: number;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public AccountID: number;
    public IsActive: boolean;
    public UpdatedAt: Date;
    public _createguid: string;
    public Dimensions: Dimensions;
    public Account: Account;
    public CustomFields: any;
}


export class Budget extends UniEntity {
    public static RelativeUrl = 'budgets';
    public static EntityType = 'Budget';

    public Name: string;
    public StatusCode: number;
    public ID: number;
    public AccountingYear: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public _createguid: string;
    public Entries: Array<BudgetEntry>;
    public CustomFields: any;
}


export class BudgetEntry extends UniEntity {
    public static RelativeUrl = 'budgetentries';
    public static EntityType = 'BudgetEntry';

    public BudgetID: number;
    public DimensionsID: number;
    public StatusCode: number;
    public ID: number;
    public Amount: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public AccountID: number;
    public UpdatedAt: Date;
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

    public AssetWriteoffAccountID: number;
    public AssetSaleProductID: number;
    public AssetSaleProfitVatAccountID: number;
    public AssetSaleProfitNoVatAccountID: number;
    public ReInvoicingMethod: number;
    public StatusCode: number;
    public ReInvoicingCostsharingProductID: number;
    public ID: number;
    public AssetSaleProfitBalancingAccountID: number;
    public AssetSaleLossBalancingAccountID: number;
    public CreatedBy: string;
    public AssetSaleLossVatAccountID: number;
    public ReInvoicingTurnoverProductID: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public AssetSaleLossNoVatAccountID: number;
    public UpdatedAt: Date;
    public _createguid: string;
    public ReInvoicingCostsharingProduct: Product;
    public ReInvoicingTurnoverProduct: Product;
    public CustomFields: any;
}


export class CompanyBankAccount extends UniEntity {
    public static RelativeUrl = 'companybankaccounts';
    public static EntityType = 'CompanyBankAccount';

    public Name: string;
    public IsIncomming: boolean;
    public CreditAmount: number;
    public StatusCode: number;
    public ID: number;
    public IsOutgoing: boolean;
    public IsSalary: boolean;
    public CreatedBy: string;
    public BankAccountID: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public IsTax: boolean;
    public AccountID: number;
    public UpdatedAt: Date;
    public _createguid: string;
    public BankAccount: BankAccount;
    public Account: Account;
    public CustomFields: any;
}


export class CostAllocation extends UniEntity {
    public static RelativeUrl = 'costallocations';
    public static EntityType = 'CostAllocation';

    public Name: string;
    public StatusCode: number;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public _createguid: string;
    public Items: Array<CostAllocationItem>;
    public CustomFields: any;
}


export class CostAllocationItem extends UniEntity {
    public static RelativeUrl = 'costallocationitems';
    public static EntityType = 'CostAllocationItem';

    public Percent: number;
    public CostAllocationID: number;
    public DimensionsID: number;
    public StatusCode: number;
    public ID: number;
    public Amount: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public VatTypeID: number;
    public AccountID: number;
    public UpdatedAt: Date;
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

    public StatusCode: number;
    public ID: number;
    public Amount: number;
    public CreatedBy: string;
    public EndDate: LocalDate;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public DueDate: LocalDate;
    public AmountCurrency: number;
    public Deleted: boolean;
    public IsCustomerPayment: boolean;
    public CustomLiquidityPaymentType: CustomLiquidityPaymentInterval;
    public UpdatedAt: Date;
    public Description: string;
    public CurrencyCodeID: number;
    public _createguid: string;
    public currency: CurrencyCode;
    public CustomFields: any;
}


export class DepreciationLine extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'DepreciationLine';

    public AssetID: number;
    public StatusCode: number;
    public ID: number;
    public CreatedBy: string;
    public DepreciationType: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public DepreciationJELineID: number;
    public AssetJELineID: number;
    public UpdatedAt: Date;
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
    public ValidFrom: LocalDate;
    public CreatedBy: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public ValidTo: LocalDate;
    public Year: number;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class JournalEntry extends UniEntity {
    public static RelativeUrl = 'journalentries';
    public static EntityType = 'JournalEntry';

    public NumberSeriesTaskID: number;
    public JournalEntryNumberNumeric: number;
    public StatusCode: number;
    public ID: number;
    public JournalEntryNumber: string;
    public JournalEntryDraftGroup: string;
    public NumberSeriesID: number;
    public FinancialYearID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public JournalEntryAccrualID: number;
    public UpdatedAt: Date;
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

    public PaymentReferenceID: number;
    public VatDate: LocalDate;
    public RegisteredDate: LocalDate;
    public PaymentInfoTypeID: number;
    public JournalEntryID: number;
    public CustomerInvoiceID: number;
    public VatPeriodID: number;
    public TaxBasisAmountCurrency: number;
    public RestAmountCurrency: number;
    public JournalEntryTypeID: number;
    public JournalEntryNumberNumeric: number;
    public SubAccountID: number;
    public PeriodID: number;
    public OriginalJournalEntryPost: number;
    public DimensionsID: number;
    public StatusCode: number;
    public PostPostJournalEntryLineID: number;
    public OriginalReferencePostID: number;
    public ID: number;
    public PaymentID: string;
    public JournalEntryNumber: string;
    public VatDeductionPercent: number;
    public InvoiceNumber: string;
    public TaxBasisAmount: number;
    public Amount: number;
    public AccrualID: number;
    public VatJournalEntryPostID: number;
    public CreatedBy: string;
    public CustomerOrderID: number;
    public FinancialDate: LocalDate;
    public CurrencyExchangeRate: number;
    public Signature: string;
    public VatPercent: number;
    public BatchNumber: number;
    public VatReportID: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public DueDate: LocalDate;
    public AmountCurrency: number;
    public Deleted: boolean;
    public VatTypeID: number;
    public RestAmount: number;
    public ReferenceCreditPostID: number;
    public AccountID: number;
    public SupplierInvoiceID: number;
    public ReferenceOriginalPostID: number;
    public UpdatedAt: Date;
    public JournalEntryLineDraftID: number;
    public Description: string;
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

    public PaymentReferenceID: number;
    public VatDate: LocalDate;
    public RegisteredDate: LocalDate;
    public PaymentInfoTypeID: number;
    public JournalEntryID: number;
    public CustomerInvoiceID: number;
    public VatPeriodID: number;
    public TaxBasisAmountCurrency: number;
    public JournalEntryTypeID: number;
    public JournalEntryNumberNumeric: number;
    public SubAccountID: number;
    public PeriodID: number;
    public DimensionsID: number;
    public StatusCode: number;
    public PostPostJournalEntryLineID: number;
    public ID: number;
    public PaymentID: string;
    public JournalEntryNumber: string;
    public VatDeductionPercent: number;
    public InvoiceNumber: string;
    public TaxBasisAmount: number;
    public Amount: number;
    public AccrualID: number;
    public CreatedBy: string;
    public CustomerOrderID: number;
    public FinancialDate: LocalDate;
    public CurrencyExchangeRate: number;
    public Signature: string;
    public VatPercent: number;
    public BatchNumber: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public DueDate: LocalDate;
    public AmountCurrency: number;
    public Deleted: boolean;
    public VatTypeID: number;
    public AccountID: number;
    public SupplierInvoiceID: number;
    public UpdatedAt: Date;
    public Description: string;
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

    public Name: string;
    public TraceLinkTypes: string;
    public VisibleModules: string;
    public StatusCode: number;
    public ID: number;
    public ColumnSetUp: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class JournalEntrySourceSerie extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'JournalEntrySourceSerie';

    public StatusCode: number;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public JournalEntrySourceID: number;
    public UpdatedAt: Date;
    public JournalEntrySourceEntityName: string;
    public _createguid: string;
    public JournalEntrySourceInstanceID: number;
    public CustomFields: any;
}


export class JournalEntryType extends UniEntity {
    public static RelativeUrl = 'journalentrytypes';
    public static EntityType = 'JournalEntryType';

    public Name: string;
    public MainName: string;
    public ID: number;
    public ExpectNegativeAmount: boolean;
    public DisplayName: string;
    public CreatedBy: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public Number: number;
    public _createguid: string;
    public CustomFields: any;
}


export class LedgerSuggestion extends UniEntity {
    public Name: string;
    public Source: SuggestionSource;
    public IndustryCode: string;
    public ID: number;
    public IndustryName: string;
    public BusinessType: string;
    public OrgNumber: string;
}


export class Payment extends UniEntity {
    public static RelativeUrl = 'payments';
    public static EntityType = 'Payment';

    public XmlTagEndToEndIdReference: string;
    public PaymentStatusReportFileID: number;
    public IsExternal: boolean;
    public ExternalBankAccountNumber: string;
    public PaymentDate: LocalDate;
    public JournalEntryID: number;
    public InPaymentID: string;
    public CustomerInvoiceID: number;
    public PaymentNotificationReportFileID: number;
    public Proprietary: string;
    public OcrPaymentStrings: string;
    public CustomerInvoiceReminderID: number;
    public XmlTagPmtInfIdReference: string;
    public StatusCode: number;
    public BusinessRelationID: number;
    public ID: number;
    public PaymentID: string;
    public PaymentBatchID: number;
    public Debtor: string;
    public ToBankAccountID: number;
    public InvoiceNumber: string;
    public Domain: string;
    public BankChargeAmount: number;
    public Amount: number;
    public CreatedBy: string;
    public CurrencyExchangeRate: number;
    public IsPaymentCancellationRequest: boolean;
    public FromBankAccountID: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public DueDate: LocalDate;
    public AmountCurrency: number;
    public Deleted: boolean;
    public StatusText: string;
    public PaymentCodeID: number;
    public ReconcilePayment: boolean;
    public SupplierInvoiceID: number;
    public IsCustomerPayment: boolean;
    public AutoJournal: boolean;
    public IsPaymentClaim: boolean;
    public SerialNumberOrAcctSvcrRef: string;
    public UpdatedAt: Date;
    public Description: string;
    public CurrencyCodeID: number;
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

    public PaymentBatchTypeID: number;
    public PaymentReferenceID: string;
    public PaymentStatusReportFileID: number;
    public OcrTransmissionNumber: number;
    public TransferredDate: Date;
    public HashValue: string;
    public PaymentFileID: number;
    public TotalAmount: number;
    public StatusCode: number;
    public ID: number;
    public NumberOfPayments: number;
    public ReceiptDate: Date;
    public CreatedBy: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public Camt054CMsgId: string;
    public IsCustomerPayment: boolean;
    public OcrHeadingStrings: string;
    public UpdatedAt: Date;
    public _createguid: string;
    public Payments: Array<Payment>;
    public PaymentBatchType: PaymentBatchType;
    public CustomFields: any;
}


export class PostPost extends UniEntity {
    public static RelativeUrl = 'postposts';
    public static EntityType = 'PostPost';

    public JournalEntryLine1ID: number;
    public Date: LocalDate;
    public JournalEntryLine2ID: number;
    public StatusCode: number;
    public ID: number;
    public Amount: number;
    public CreatedBy: string;
    public CurrencyExchangeRate: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public AmountCurrency: number;
    public Deleted: boolean;
    public UpdatedAt: Date;
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

    public TaxExclusiveAmount: number;
    public OwnCostShare: number;
    public StatusCode: number;
    public ID: number;
    public OwnCostAmount: number;
    public CreatedBy: string;
    public ReInvoicingType: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public ProductID: number;
    public TaxInclusiveAmount: number;
    public SupplierInvoiceID: number;
    public UpdatedAt: Date;
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
    public NetAmount: number;
    public CustomerID: number;
    public Share: number;
    public CreatedBy: string;
    public GrossAmount: number;
    public CreatedAt: Date;
    public ReInvoiceID: number;
    public UpdatedBy: string;
    public Vat: number;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public _createguid: string;
    public Customer: Customer;
    public CustomFields: any;
}


export class SupplierInvoice extends UniEntity {
    public static RelativeUrl = 'supplierinvoices';
    public static EntityType = 'SupplierInvoice';

    public FreeTxt: string;
    public ProjectID: number;
    public SupplierID: number;
    public DeliveryTerm: string;
    public InvoiceCountryCode: string;
    public TaxExclusiveAmount: number;
    public TaxInclusiveAmountCurrency: number;
    public PrintStatus: number;
    public Credited: boolean;
    public CreditedAmount: number;
    public DeliveryTermsID: number;
    public PaymentInformation: string;
    public AmountRegards: string;
    public JournalEntryID: number;
    public YourReference: string;
    public ShippingCity: string;
    public ShippingAddressLine2: string;
    public RestAmountCurrency: number;
    public PayableRoundingCurrencyAmount: number;
    public OurReference: string;
    public InvoiceReceiverName: string;
    public SalesPerson: string;
    public PaymentTermsID: number;
    public IsSentToPayment: boolean;
    public DeliveryName: string;
    public InvoiceAddressLine3: string;
    public ShippingAddressLine3: string;
    public ShippingPostalCode: string;
    public InvoiceDate: LocalDate;
    public StatusCode: number;
    public InvoicePostalCode: string;
    public ID: number;
    public PaymentID: string;
    public ShippingCountry: string;
    public VatTotalsAmountCurrency: number;
    public InvoiceAddressLine1: string;
    public ShippingAddressLine1: string;
    public ShippingCountryCode: string;
    public PayableRoundingAmount: number;
    public InvoiceType: number;
    public InvoiceNumber: string;
    public VatTotalsAmount: number;
    public InvoiceAddressLine2: string;
    public InvoiceCity: string;
    public PaymentStatus: number;
    public CreatedBy: string;
    public InvoiceCountry: string;
    public CurrencyExchangeRate: number;
    public PaymentDueDate: LocalDate;
    public SupplierOrgNumber: string;
    public Comment: string;
    public InvoiceOriginType: SupplierInvoiceOriginType;
    public BankAccountID: number;
    public InternalNote: string;
    public DefaultDimensionsID: number;
    public CreatedAt: Date;
    public InvoiceReferenceID: number;
    public ReInvoiceID: number;
    public UpdatedBy: string;
    public Requisition: string;
    public Deleted: boolean;
    public CreditedAmountCurrency: number;
    public RestAmount: number;
    public DeliveryMethod: string;
    public TaxInclusiveAmount: number;
    public TaxExclusiveAmountCurrency: number;
    public PaymentTerm: string;
    public DeliveryDate: LocalDate;
    public CustomerPerson: string;
    public CustomerOrgNumber: string;
    public ReInvoiced: boolean;
    public Payment: string;
    public UpdatedAt: Date;
    public CurrencyCodeID: number;
    public CreditDays: number;
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
    public SortIndex: number;
    public InvoicePeriodEndDate: LocalDate;
    public SumTotalIncVat: number;
    public SumVatCurrency: number;
    public PriceExVatCurrency: number;
    public Discount: number;
    public InvoicePeriodStartDate: LocalDate;
    public DimensionsID: number;
    public DiscountPercent: number;
    public StatusCode: number;
    public ID: number;
    public SumTotalExVatCurrency: number;
    public SumTotalIncVatCurrency: number;
    public PriceIncVat: number;
    public DiscountCurrency: number;
    public ItemText: string;
    public CreatedBy: string;
    public PriceExVat: number;
    public CurrencyExchangeRate: number;
    public PriceSetByUser: boolean;
    public VatPercent: number;
    public Comment: string;
    public CreatedAt: Date;
    public AccountingCost: string;
    public UpdatedBy: string;
    public Deleted: boolean;
    public ProductID: number;
    public VatTypeID: number;
    public SumVat: number;
    public SupplierInvoiceID: number;
    public CalculateGrossPriceBasedOnNetPrice: boolean;
    public Unit: string;
    public SumTotalExVat: number;
    public UpdatedAt: Date;
    public CurrencyCodeID: number;
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

    public Name: string;
    public No: string;
    public StatusCode: number;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class VatDeduction extends UniEntity {
    public static RelativeUrl = 'vatdeductions';
    public static EntityType = 'VatDeduction';

    public StatusCode: number;
    public ID: number;
    public VatDeductionGroupID: number;
    public ValidFrom: LocalDate;
    public DeductionPercent: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public ValidTo: LocalDate;
    public UpdatedAt: Date;
    public _createguid: string;
    public VatDeductionGroup: VatDeductionGroup;
    public CustomFields: any;
}


export class VatDeductionGroup extends UniEntity {
    public static RelativeUrl = 'vatdeductiongroups';
    public static EntityType = 'VatDeductionGroup';

    public Name: string;
    public StatusCode: number;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class VatPost extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'VatPost';

    public Name: string;
    public ReportAsNegativeAmount: boolean;
    public VatCodeGroupID: number;
    public No: string;
    public StatusCode: number;
    public ID: number;
    public HasTaxBasis: boolean;
    public CreatedBy: string;
    public HasTaxAmount: boolean;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public _createguid: string;
    public VatCodeGroup: VatCodeGroup;
    public VatReportReferences: Array<VatReportReference>;
    public CustomFields: any;
}


export class VatReport extends UniEntity {
    public static RelativeUrl = 'vatreports';
    public static EntityType = 'VatReport';

    public JournalEntryID: number;
    public Title: string;
    public ExecutedDate: Date;
    public TerminPeriodID: number;
    public StatusCode: number;
    public ID: number;
    public ExternalRefNo: string;
    public InternalComment: string;
    public CreatedBy: string;
    public VatReportArchivedSummaryID: number;
    public Comment: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public ReportedDate: Date;
    public VatReportTypeID: number;
    public UpdatedAt: Date;
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
    public StatusCode: number;
    public ID: number;
    public PaymentID: string;
    public PaymentBankAccountNumber: string;
    public PaymentToDescription: string;
    public AmountToBePayed: number;
    public PaymentYear: number;
    public CreatedBy: string;
    public PaymentDueDate: Date;
    public SummaryHeader: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public AmountToBeReceived: number;
    public ReportName: string;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class VatReportReference extends UniEntity {
    public static RelativeUrl = 'vatreportreferences';
    public static EntityType = 'VatReportReference';

    public StatusCode: number;
    public ID: number;
    public CreatedBy: string;
    public VatPostID: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public VatTypeID: number;
    public AccountID: number;
    public UpdatedAt: Date;
    public _createguid: string;
    public VatType: VatType;
    public VatPost: VatPost;
    public Account: Account;
    public CustomFields: any;
}


export class VatReportType extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'VatReportType';

    public Name: string;
    public StatusCode: number;
    public ID: number;
    public CreatedBy: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class VatType extends UniEntity {
    public static RelativeUrl = 'vattypes';
    public static EntityType = 'VatType';

    public Name: string;
    public DirectJournalEntryOnly: boolean;
    public OutgoingAccountID: number;
    public Alias: string;
    public VatCodeGroupID: number;
    public VatTypeSetupID: number;
    public VatCodeGroupingValue: VatCodeGroupingValueEnum;
    public VatCode: string;
    public StatusCode: number;
    public InUse: boolean;
    public ID: number;
    public Visible: boolean;
    public Locked: boolean;
    public CreatedBy: string;
    public OutputVat: boolean;
    public AvailableInModules: boolean;
    public ReversedTaxDutyVat: boolean;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public IncomingAccountID: number;
    public UpdatedAt: Date;
    public VatPercent: number;
    public _createguid: string;
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

    public StatusCode: number;
    public ID: number;
    public ValidFrom: LocalDate;
    public CreatedBy: string;
    public VatPercent: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public VatTypeID: number;
    public ValidTo: LocalDate;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class EntityValidationRule extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'EntityValidationRule';

    public ChangedByCompany: boolean;
    public OnConflict: OnConflict;
    public ID: number;
    public SyncKey: string;
    public System: boolean;
    public CreatedBy: string;
    public Operator: Operator;
    public EntityType: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public PropertyName: string;
    public Message: string;
    public Level: ValidationLevel;
    public Value: string;
    public Operation: OperationType;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class EntityValidationRuleTemplate extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'EntityValidationRuleTemplate';

    public ChangedByCompany: boolean;
    public OnConflict: OnConflict;
    public ID: number;
    public SyncKey: string;
    public System: boolean;
    public CreatedBy: string;
    public Operator: Operator;
    public EntityType: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public PropertyName: string;
    public Message: string;
    public Level: ValidationLevel;
    public Value: string;
    public Operation: OperationType;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class ComplexValidationRule extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ComplexValidationRule';

    public ChangedByCompany: boolean;
    public OnConflict: OnConflict;
    public ID: number;
    public SyncKey: string;
    public ValidationCode: number;
    public System: boolean;
    public CreatedBy: string;
    public EntityType: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public Message: string;
    public Level: ValidationLevel;
    public Operation: OperationType;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class ComplexValidationRuleTemplate extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ComplexValidationRuleTemplate';

    public ChangedByCompany: boolean;
    public OnConflict: OnConflict;
    public ID: number;
    public SyncKey: string;
    public ValidationCode: number;
    public System: boolean;
    public CreatedBy: string;
    public EntityType: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public Message: string;
    public Level: ValidationLevel;
    public Operation: OperationType;
    public UpdatedAt: Date;
    public _createguid: string;
    public CustomFields: any;
}


export class CustomField extends UniEntity {
    public static RelativeUrl = 'custom-fields';
    public static EntityType = 'CustomField';

    public Name: string;
    public StatusCode: number;
    public ID: number;
    public CreatedBy: string;
    public ModelID: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public DataType: string;
    public UpdatedAt: Date;
    public Nullable: boolean;
    public _createguid: string;
    public CustomFields: any;
}


export class ValueList extends UniEntity {
    public static RelativeUrl = 'valuelists';
    public static EntityType = 'ValueList';

    public Name: string;
    public ID: number;
    public CreatedBy: string;
    public Code: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public Description: string;
    public _createguid: string;
    public Items: Array<ValueItem>;
    public CustomFields: any;
}


export class ValueItem extends UniEntity {
    public static RelativeUrl = 'valueitems';
    public static EntityType = 'ValueItem';

    public Name: string;
    public ValueListID: number;
    public ID: number;
    public CreatedBy: string;
    public Index: number;
    public Code: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public Value: string;
    public UpdatedAt: Date;
    public Description: string;
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

    public Sectionheader: string;
    public FieldType: FieldType;
    public Url: string;
    public Hidden: boolean;
    public Combo: number;
    public StatusCode: number;
    public DisplayField: string;
    public ID: number;
    public FieldSet: number;
    public Alignment: Alignment;
    public LineBreak: boolean;
    public Section: number;
    public Legend: string;
    public LookupEntityType: string;
    public CreatedBy: string;
    public Property: string;
    public EntityType: string;
    public Width: string;
    public Placeholder: string;
    public ComponentLayoutID: number;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public ReadOnly: boolean;
    public Label: string;
    public Deleted: boolean;
    public Options: string;
    public HelpText: string;
    public ValueList: string;
    public Placement: number;
    public UpdatedAt: Date;
    public LookupField: boolean;
    public Description: string;
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
    public Overtime: number;
    public TotalTime: number;
    public EndTime: Date;
    public ValidTimeOff: number;
    public Date: Date;
    public Projecttime: number;
    public Workflow: TimesheetWorkflow;
    public StartTime: Date;
    public Flextime: number;
    public SickTime: number;
    public TimeOff: number;
    public ExpectedTime: number;
    public IsWeekend: boolean;
    public Invoicable: number;
    public WeekNumber: number;
    public WeekDay: number;
    public Status: WorkStatus;
    public ValidTime: number;
}


export class WorkBalanceDto extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'WorkBalanceDto';

    public BalanceDate: Date;
    public Days: number;
    public ValidTimeOff: number;
    public LastDayExpected: number;
    public IsStartBalance: boolean;
    public ExpectedMinutes: number;
    public BalanceFrom: Date;
    public ActualMinutes: number;
    public StatusCode: number;
    public ID: number;
    public ValidFrom: Date;
    public Balancetype: WorkBalanceTypeEnum;
    public CreatedBy: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public WorkRelationID: number;
    public LastDayActual: number;
    public Deleted: boolean;
    public SumOvertime: number;
    public Minutes: number;
    public UpdatedAt: Date;
    public Description: string;
    public _createguid: string;
    public Previous: BalanceInfo;
    public Details: Array<FlexDetail>;
    public WorkRelation: WorkRelation;
    public CustomFields: any;
}


export class BalanceInfo extends UniEntity {
    public BalanceDate: Date;
    public ID: number;
    public Minutes: number;
    public Description: string;
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
    public Method: string;
    public Success: boolean;
    public ErrorMessage: string;
    public ObjectName: string;
}


export class InvoicesAndRemindersReadyToRemind extends UniEntity {
    public CustomerName: string;
    public CustomerNumber: number;
    public TaxInclusiveAmountCurrency: number;
    public CustomerInvoiceID: number;
    public RestAmountCurrency: number;
    public CurrencyCodeCode: string;
    public CustomerInvoiceReminderID: number;
    public DontSendReminders: boolean;
    public InvoiceDate: Date;
    public StatusCode: number;
    public EmailAddress: string;
    public CustomerID: number;
    public InvoiceNumber: number;
    public Interest: number;
    public CurrencyExchangeRate: number;
    public ReminderNumber: number;
    public DueDate: Date;
    public RestAmount: number;
    public TaxInclusiveAmount: number;
    public CurrencyCodeShortCode: string;
    public Fee: number;
    public ExternalReference: string;
    public CurrencyCodeID: number;
}


export class CanDistributeReminderResult extends UniEntity {
    public HasPrintService: boolean;
    public CanDistributeAllRemindersUsingPlan: boolean;
    public AlreadySentCount: number;
    public RemindersWithEmail: number;
    public RemindersWithPrint: number;
    public RemindersWithDistributionPlan: number;
}


export class DistributeInvoiceReminderInput extends UniEntity {
    public CasehandlerEmail: string;
    public SendByPrintServiceIfPossible: boolean;
    public SendRemainingToCasehandler: boolean;
    public SendByDistributionPlanFirst: boolean;
    public SendByEmailIfPossible: boolean;
}


export class TradeHeaderCalculationSummary extends UniEntity {
    public SumTotalIncVat: number;
    public SumDiscount: number;
    public SumVatBasis: number;
    public SumVatCurrency: number;
    public DecimalRounding: number;
    public SumTotalExVatCurrency: number;
    public SumDiscountCurrency: number;
    public SumTotalIncVatCurrency: number;
    public SumNoVatBasis: number;
    public SumVatBasisCurrency: number;
    public SumNoVatBasisCurrency: number;
    public DecimalRoundingCurrency: number;
    public SumVat: number;
    public SumTotalExVat: number;
}


export class VatCalculationSummary extends UniEntity {
    public SumVatBasis: number;
    public SumVatCurrency: number;
    public VatPercent: number;
    public SumVatBasisCurrency: number;
    public SumVat: number;
}


export class InvoicePaymentData extends UniEntity {
    public PaymentDate: LocalDate;
    public AgioAccountID: number;
    public BankChargeAccountID: number;
    public DimensionsID: number;
    public PaymentID: string;
    public AgioAmount: number;
    public BankChargeAmount: number;
    public Amount: number;
    public CurrencyExchangeRate: number;
    public FromBankAccountID: number;
    public AmountCurrency: number;
    public AccountID: number;
    public CurrencyCodeID: number;
}


export class InvoiceSummary extends UniEntity {
    public SumRestAmount: number;
    public SumTotalAmount: number;
    public SumCreditedAmount: number;
}


export class CustomerNoAndName extends UniEntity {
    public Name: string;
    public Number: string;
}


export class InvoicePayment extends UniEntity {
    public JournalEntryID: number;
    public JournalEntryNumber: string;
    public Amount: number;
    public FinancialDate: LocalDate;
    public AmountCurrency: number;
    public JournalEntryLineID: number;
    public Description: string;
}


export class OrderOffer extends UniEntity {
    public CostPercentage: number;
    public Message: string;
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
    public ReasonCode: string;
    public ReasonDescription: string;
    public ReasonHelpLink: string;
}


export class AmountDetail extends UniEntity {
    public Currency: string;
    public Amount: number;
}


export class Limits extends UniEntity {
    public RemainingLimit: number;
    public MaxInvoiceAmount: number;
    public Limit: number;
}


export class AmeldingAgaAndTaxSums extends UniEntity {
    public FinancialTax: number;
    public KIDFinancialTax: string;
    public EmploymentTax: number;
    public MessageID: string;
    public KIDEmploymentTax: string;
    public KIDGarnishment: string;
    public AccountNumber: string;
    public DueDate: Date;
    public KIDTaxDraw: string;
    public TaxDraw: number;
    public GarnishmentTax: number;
    public period: number;
}


export class PayrollRunInAmeldingPeriod extends UniEntity {
    public PayrollrunDescription: string;
    public PayrollrunPaydate: Date;
    public AmeldingSentdate: Date;
    public PayrollrunID: number;
    public CanGenerateAddition: boolean;
}


export class PayAgaTaxDTO extends UniEntity {
    public payDate: Date;
    public correctPennyDiff: boolean;
    public payTaxDraw: boolean;
    public payGarnishment: boolean;
    public payAga: boolean;
    public payFinancialTax: boolean;
}


export class AmeldingSumUp extends UniEntity {
    public meldingsID: string;
    public generated: Date;
    public altInnStatus: string;
    public LegalEntityNo: string;
    public ReplacesAMeldingID: number;
    public ID: number;
    public Replaces: string;
    public type: AmeldingType;
    public status: AmeldingStatus;
    public sent: Date;
    public year: number;
    public period: number;
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
    public startDate: Date;
    public endDate: Date;
    public type: string;
    public arbeidsforholdId: string;
    public permisjon: Array<EmploymentLeaves>;
}


export class EmploymentLeaves extends UniEntity {
    public beskrivelse: string;
    public sluttdato: Date;
    public permisjonsId: string;
    public startdato: Date;
    public permisjonsprosent: string;
}


export class TransactionTypes extends UniEntity {
    public incomeType: string;
    public amount: number;
    public benefit: string;
    public tax: boolean;
    public Base_EmploymentTax: boolean;
    public description: string;
}


export class AGADetails extends UniEntity {
    public baseAmount: number;
    public rate: number;
    public type: string;
    public zoneName: string;
    public sectorName: string;
}


export class Totals extends UniEntity {
    public sumUtleggstrekk: number;
    public sumAGA: number;
    public sumTax: number;
}


export class AnnualStatement extends UniEntity {
    public EmployerPostCode: string;
    public EmployeeMunicipalName: string;
    public EmployerEmail: string;
    public EmployerCity: string;
    public EmployeeAddress: string;
    public EmployerCountryCode: string;
    public EmployerTaxMandatory: boolean;
    public EmployerPhoneNumber: string;
    public EmployeeSSn: string;
    public EmployerName: string;
    public EmployerCountry: string;
    public EmployeeNumber: number;
    public EmployeeMunicipalNumber: string;
    public EmployeePostCode: string;
    public EmployeeName: string;
    public VacationPayBase: number;
    public EmployerOrgNr: string;
    public EmployerAddress: string;
    public EmployeeCity: string;
    public EmployerWebAddress: string;
    public Year: number;
    public Contributions: Array<AnnualStatementLine>;
    public PensionOrBenefits: Array<AnnualStatementLine>;
    public Deductions: Array<AnnualStatementLine>;
    public Draws: Array<AnnualStatementLine>;
}


export class AnnualStatementLine extends UniEntity {
    public TaxReturnPost: string;
    public IsDeduction: boolean;
    public Sum: number;
    public LineIndex: number;
    public Amount: number;
    public SupplementPackageName: string;
    public Description: string;
    public Supplements: Array<SupplementInfo>;
}


export class SupplementInfo extends UniEntity {
    public Name: string;
    public WageTypeSupplementID: number;
    public ValueType: Valuetype;
    public ValueDate2: Date;
    public ValueMoney: number;
    public ValueBool: boolean;
    public ValueString: string;
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
    public Text: string;
    public Title: string;
    public IsJob: boolean;
    public mainStatus: string;
    public employeestatus: Array<EmployeeStatus>;
}


export class EmployeeStatus extends UniEntity {
    public employeeNumber: number;
    public employeeID: number;
    public status: string;
    public ssn: string;
    public info: string;
    public year: number;
    public changedFields: Array<FieldsChanged>;
}


export class FieldsChanged extends UniEntity {
    public valFrom: string;
    public valTo: string;
    public fieldName: string;
}


export class EmploymentHistoryRecord extends UniEntity {
    public RegulativeStepNr: number;
    public WorkPercent: number;
    public ChangedAt: Date;
    public MonthRate: number;
    public RegulativeGroupID: number;
    public HourRate: number;
}


export class CodeListRowsCodeListRow extends UniEntity {
    public Value1: string;
    public Code: string;
    public Value3: string;
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
    public netPayment: number;
    public grossPayment: number;
    public employeeID: number;
    public tax: number;
}


export class SumOnYear extends UniEntity {
    public baseVacation: number;
    public advancePayment: number;
    public nonTaxableAmount: number;
    public netPayment: number;
    public grossPayment: number;
    public sumTax: number;
    public taxBase: number;
    public employeeID: number;
    public pension: number;
    public paidHolidaypay: number;
    public usedNonTaxableAmount: number;
}


export class VacationPayLastYear extends UniEntity {
    public baseVacation: number;
    public employeeID: number;
    public paidHolidayPay: number;
}


export class SalaryTransactionPay extends UniEntity {
    public CompanyCity: string;
    public PaymentDate: Date;
    public SalaryBankAccountID: number;
    public CompanyAddress: string;
    public TaxBankAccountID: number;
    public CompanyPostalCode: string;
    public Withholding: number;
    public CompanyName: string;
    public CompanyBankAccountID: number;
    public PayList: Array<SalaryTransactionPayLine>;
    public SalaryBalancePayList: Array<SalaryBalancePayLine>;
}


export class SalaryTransactionPayLine extends UniEntity {
    public PostalCode: string;
    public City: string;
    public NetPayment: number;
    public Account: string;
    public EmployeeNumber: number;
    public Address: string;
    public EmployeeName: string;
    public Tax: number;
}


export class SalaryBalancePayLine extends UniEntity {
    public Text: string;
    public Kid: string;
    public Sum: number;
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
    public GroupByWageType: boolean;
    public Subject: string;
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
    public CreatedPayruns: number;
    public ToPeriod: number;
    public BookedPayruns: number;
    public CalculatedPayruns: number;
    public Year: number;
    public FromPeriod: number;
    public Groups: Array<ReconciliationGroup>;
}


export class ReconciliationGroup extends UniEntity {
    public Sum: number;
    public AccountNumber: string;
    public Lines: Array<ReconciliationLine>;
}


export class ReconciliationLine extends UniEntity {
    public IncomeType: string;
    public WageTypeName: string;
    public Sum: number;
    public WageTypeNumber: number;
    public HasEmploymentTax: boolean;
    public Benefit: string;
    public Description: string;
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
    public Name: string;
    public UnionDraw: number;
    public MemberNumber: string;
    public Ensurance: number;
    public OUO: number;
}


export class SalaryTransactionSums extends UniEntity {
    public manualTax: number;
    public Employee: number;
    public baseVacation: number;
    public baseTableTax: number;
    public percentTax: number;
    public calculatedVacationPay: number;
    public tableTax: number;
    public netPayment: number;
    public baseAGA: number;
    public paidAdvance: number;
    public Payrun: number;
    public grossPayment: number;
    public calculatedFinancialTax: number;
    public paidPension: number;
    public basePercentTax: number;
    public calculatedAGA: number;
}


export class SalaryTransactionPeriodSums extends UniEntity {
    public ToPeriod: number;
    public AgaZone: string;
    public AgaRate: number;
    public MunicipalName: string;
    public Year: number;
    public OrgNumber: string;
    public FromPeriod: number;
    public Sums: SalaryTransactionSums;
    public Aga: AGACalculation;
}


export class code extends UniEntity {
    public postnr: string;
    public inngaarIGrunnlagForTrekk: string;
    public fordel: string;
    public skatteOgAvgiftregel: string;
    public gyldigtil: string;
    public gyldigfom: string;
    public gmlcode: string;
    public kunfranav: string;
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
    public ContractID: number;
    public IsTest: boolean;
    public LicenseKey: string;
    public ProductNames: string;
    public IsTemplate: boolean;
    public ContractType: number;
    public CompanyName: string;
    public CopyFiles: boolean;
    public TemplateCompanyKey: string;
    public CompanySettings: CompanySettings;
}


export class UserDto extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'UserDto';

    public PhoneNumber: string;
    public Email: string;
    public GlobalIdentity: string;
    public BankIntegrationUserName: string;
    public StatusCode: number;
    public ID: number;
    public PermissionHandling: string;
    public UserName: string;
    public DisplayName: string;
    public Protected: boolean;
    public CreatedBy: string;
    public LastLogin: Date;
    public IsAutobankAdmin: boolean;
    public HasAgreedToImportDisclaimer: boolean;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public UpdatedAt: Date;
    public AuthPhoneNumber: string;
    public TwoFactorEnabled: boolean;
    public EndDate: Date;
    public _createguid: string;
    public License: UserLicenseInformation;
    public CustomFields: any;
}


export class UserLicenseInformation extends UniEntity {
    public Name: string;
    public GlobalIdentity: string;
    public Comment: string;
    public UserLicenseKey: string;
    public UserLicenseEndDate: Date;
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
    public CanAgreeToLicense: boolean;
    public AgreementId: number;
    public HasAgreedToLicense: boolean;
}


export class UserLicenseType extends UniEntity {
    public TypeName: string;
    public TypeID: number;
    public EndDate: Date;
}


export class CompanyLicenseInfomation extends UniEntity {
    public Key: string;
    public ContractID: number;
    public Name: string;
    public StatusCode: LicenseEntityStatus;
    public ID: number;
    public ContactEmail: string;
    public EndDate: Date;
    public ContactPerson: string;
    public Agency: Agency;
}


export class Agency extends UniEntity {
    public Name: string;
    public CompanyKey: string;
}


export class ContractLicenseType extends UniEntity {
    public TrialExpiration: Date;
    public TypeName: string;
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
    public AdminPassword: string;
    public Phone: string;
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
    public Message: string;
    public Status: ChallengeRequestResult;
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
    public ToPeriod: Maaned;
    public ReportType: ReportType;
    public IncludeIncome: boolean;
    public Year: number;
    public FromPeriod: Maaned;
    public IncludeEmployments: boolean;
}


export class A07Response extends UniEntity {
    public Data: string;
    public Text: string;
    public Title: string;
    public DataName: string;
    public DataType: string;
    public mainStatus: string;
}


export class SelfEmployed extends UniEntity {
    public year: number;
    public items: Array<SelfEmployedItem>;
}


export class SelfEmployedItem extends UniEntity {
    public name: string;
    public supplierID: number;
    public amount: number;
    public number: string;
}


export class SetIntegrationDataDto extends UniEntity {
    public IntegrationKey: string;
    public ExternalId: string;
}


export class CurrencyRateData extends UniEntity {
    public RateDateOld: LocalDate;
    public ExchangeRate: number;
    public IsOverrideRate: boolean;
    public RateDate: LocalDate;
    public Factor: number;
    public ExchangeRateOld: number;
    public FromCurrencyCode: CurrencyCode;
}


export class EmailDTO extends UniEntity {
    public FromAddress: string;
    public Subject: string;
    public Format: string;
    public Message: string;
    public CopyAddress: string;
    public ReportID: number;
    public Parameters: Array<ReportParameter>;
}


export class ReportParameter extends UniEntity {
    public Name: string;
    public Value: string;
}


export class DistributionPlanElementValidation extends UniEntity {
    public Priority: number;
    public ElementTypeName: string;
    public IsValid: boolean;
    public ElementType: DistributionPlanElementTypes;
    public PlanElement: DistributionPlanElement;
}


export class SendEmail extends UniEntity {
    public FromAddress: string;
    public Localization: string;
    public Subject: string;
    public EntityType: string;
    public Message: string;
    public ReportName: string;
    public CopyAddress: string;
    public EntityID: number;
    public ReportID: number;
    public ExternalReference: string;
    public Attachments: Array<SendEmailAttachment>;
    public Parameters: Array<ReportParameter>;
}


export class SendEmailAttachment extends UniEntity {
    public FileID: number;
    public FileName: string;
    public Attachment: string;
}


export class RssList extends UniEntity {
    public Title: string;
    public Url: string;
    public Description: string;
    public Items: Array<RssItem>;
}


export class RssItem extends UniEntity {
    public Link: string;
    public Title: string;
    public Category: string;
    public Guid: string;
    public PubDate: string;
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
    public Name: string;
    public TotalBalance: number;
    public ExpectedMinutes: number;
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
    public orgname: string;
    public orgno: string;
    public contactemail: string;
    public contactname: string;
    public contactphone: string;
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

    public MissingRequiredDimensionsMessage: string;
    public DimensionsID: number;
    public StatusCode: number;
    public ID: number;
    public CreatedBy: string;
    public MissingOnlyWarningsDimensionsMessage: string;
    public AccountNumber: string;
    public CreatedAt: Date;
    public UpdatedBy: string;
    public Deleted: boolean;
    public AccountID: number;
    public UpdatedAt: Date;
    public journalEntryLineDraftID: number;
    public _createguid: string;
    public CustomFields: any;
}


export class AccountDimension extends UniEntity {
    public DimensionsID: number;
    public AccountNumber: number;
    public AccountID: number;
    public Dimensions: Dimensions;
}


export class AssetReportDTO extends UniEntity {
    public Name: string;
    public DepreciationAccountNumber: number;
    public Lifetime: number;
    public GroupName: string;
    public CurrentValue: number;
    public BalanceAccountNumber: number;
    public BalanceAccountName: string;
    public LastDepreciation: LocalDate;
    public GroupCode: string;
    public Number: number;
    public Lines: Array<AssetReportLineDTO>;
}


export class AssetReportLineDTO extends UniEntity {
    public Date: LocalDate;
    public TypeID: number;
    public Type: string;
    public Value: number;
}


export class BankBalanceDto extends UniEntity {
    public BalanceAvailable: number;
    public Date: Date;
    public IsMainAccountBalance: boolean;
    public BalanceBooked: number;
    public Comment: string;
    public AccountNumber: string;
    public IsTestData: boolean;
}


export class BankData extends UniEntity {
    public IBAN: string;
    public AccountNumber: string;
    public Bank: Bank;
}


export class CreateBankIntegrationDTO extends UniEntity {
    public Password: string;
    public Email: string;
    public IsBankBalance: boolean;
    public ServiceProvider: number;
    public RequireTwoStage: boolean;
    public IsInbound: boolean;
    public BankAcceptance: boolean;
    public IsOutgoing: boolean;
    public UserName: string;
    public DisplayName: string;
    public Phone: string;
    public BankAccountID: number;
    public IsBankStatement: boolean;
    public TuserName: string;
    public Bank: string;
    public BankApproval: boolean;
    public BankAccounts: Array<BankAccountDTO>;
}


export class BankAccountDTO extends UniEntity {
    public IsBankBalance: boolean;
    public IsInbound: boolean;
    public IsOutgoing: boolean;
    public IBAN: string;
    public Bic: string;
    public IsBankStatement: boolean;
    public BBAN: string;
}


export class ZdataUpdateBankProperties extends UniEntity {
    public Password: string;
    public IsBankBalance: boolean;
    public ServiceID: string;
    public IsInbound: boolean;
    public IsOutgoing: boolean;
    public IsBankStatement: boolean;
}


export class AutobankUserDTO extends UniEntity {
    public Password: string;
    public UserID: number;
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
    public Group: string;
    public Amount: number;
    public BankStatementEntryID: number;
    public JournalEntryLineID: number;
}


export class MatchRequest extends UniEntity {
    public JournalEntries: Array<MatchCandidate>;
    public BankEntries: Array<MatchCandidate>;
    public Settings: MatchSettings;
}


export class MatchCandidate extends UniEntity {
    public IsBankEntry: boolean;
    public Closed: boolean;
    public Date: Date;
    public ID: number;
    public Amount: number;
}


export class MatchSettings extends UniEntity {
    public MaxDayOffset: number;
    public MaxDelta: number;
}


export class ReconciliationStatus extends UniEntity {
    public NumberOfItems: number;
    public TotalAmount: number;
    public FromDate: Date;
    public AccountID: number;
    public Todate: Date;
    public NumberOfUnReconciled: number;
    public IsReconciled: boolean;
    public TotalUnreconciled: number;
}


export class BalanceDto extends UniEntity {
    public BalanceInStatement: number;
    public StartDate: Date;
    public EndDate: Date;
    public Balance: number;
}


export class BankfileFormat extends UniEntity {
    public Name: string;
    public SkipRows: number;
    public Separator: string;
    public FileExtension: string;
    public CustomFormat: BankFileCustomFormat;
    public LinePrefix: string;
    public IsXml: boolean;
    public IsFixed: boolean;
    public Columns: Array<BankfileColumn>;
}


export class BankfileColumn extends UniEntity {
    public IsFallBack: boolean;
    public Length: number;
    public StartPos: number;
    public FieldMapping: BankfileField;
    public DataType: BankfileDataType;
}


export class JournalSuggestion extends UniEntity {
    public Amount: number;
    public FinancialDate: LocalDate;
    public MatchWithEntryID: number;
    public AccountID: number;
    public BankStatementRuleID: number;
    public Description: string;
    public Account: Account;
}


export class ReportRow extends UniEntity {
    public AccountYear: number;
    public BudPeriod3: number;
    public Period3: number;
    public AccountName: string;
    public Period11: number;
    public BudPeriod9: number;
    public Period10: number;
    public SubGroupName: string;
    public SumPeriodLastYearAccumulated: number;
    public Period12: number;
    public ID: number;
    public BudPeriod10: number;
    public Period2: number;
    public BudgetSum: number;
    public IsSubTotal: boolean;
    public Sum: number;
    public GroupName: string;
    public SumLastYear: number;
    public Period6: number;
    public Period8: number;
    public Period4: number;
    public SumPeriodAccumulated: number;
    public PrecedingBalance: number;
    public Period9: number;
    public BudPeriod11: number;
    public Period5: number;
    public Period7: number;
    public SubGroupNumber: number;
    public AccountNumber: number;
    public BudPeriod12: number;
    public Period1: number;
    public BudPeriod8: number;
    public SumPeriod: number;
    public BudPeriod4: number;
    public GroupNumber: number;
    public BudPeriod5: number;
    public BudPeriod7: number;
    public BudPeriod1: number;
    public BudgetAccumulated: number;
    public SumPeriodLastYear: number;
    public BudPeriod2: number;
    public BudPeriod6: number;
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
    public CustomPayments: number;
    public Supplier: number;
    public Custumer: number;
    public Sum: number;
    public VAT: number;
}


export class JournalEntryData extends UniEntity {
    public VatDate: LocalDate;
    public JournalEntryNo: string;
    public JournalEntryID: number;
    public CustomerInvoiceID: number;
    public NumberSeriesTaskID: number;
    public SupplierInvoiceNo: string;
    public StatusCode: number;
    public PostPostJournalEntryLineID: number;
    public PaymentID: string;
    public VatDeductionPercent: number;
    public NumberSeriesID: number;
    public CreditAccountID: number;
    public InvoiceNumber: string;
    public Amount: number;
    public CustomerOrderID: number;
    public FinancialDate: LocalDate;
    public CurrencyExchangeRate: number;
    public JournalEntryDataAccrualID: number;
    public DebitAccountID: number;
    public CurrencyID: number;
    public CreditVatTypeID: number;
    public DueDate: LocalDate;
    public AmountCurrency: number;
    public DebitAccountNumber: number;
    public SupplierInvoiceID: number;
    public CreditAccountNumber: number;
    public DebitVatTypeID: number;
    public Description: string;
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
    public PeriodSumYear1: number;
    public PeriodNo: number;
}


export class JournalEntryLineRequestSummary extends UniEntity {
    public SumDebit: number;
    public SumTaxBasisAmount: number;
    public SumLedger: number;
    public SumCredit: number;
    public SumBalance: number;
}


export class JournalEntryLinePostPostData extends UniEntity {
    public AccountYear: number;
    public JournalEntryID: number;
    public RestAmountCurrency: number;
    public CurrencyCodeCode: string;
    public JournalEntryNumberNumeric: number;
    public StatusCode: number;
    public ID: number;
    public PaymentID: string;
    public JournalEntryTypeName: string;
    public NumberOfPayments: number;
    public JournalEntryNumber: string;
    public MarkedAgainstJournalEntryNumber: string;
    public InvoiceNumber: string;
    public Amount: number;
    public FinancialDate: Date;
    public CurrencyExchangeRate: number;
    public MarkedAgainstJournalEntryLineID: number;
    public SubAccountNumber: number;
    public SumPostPostAmount: number;
    public DueDate: Date;
    public AmountCurrency: number;
    public SumPostPostAmountCurrency: number;
    public RestAmount: number;
    public PeriodNo: number;
    public CurrencyCodeShortCode: string;
    public SubAccountName: string;
    public Description: string;
    public CurrencyCodeID: number;
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
    public RestAmountCurrency: number;
    public OriginalStatusCode: StatusCodeJournalEntryLine;
    public StatusCode: StatusCodeJournalEntryLine;
    public ID: number;
    public OriginalRestAmount: number;
    public JournalEntryNumber: string;
    public InvoiceNumber: string;
    public Amount: number;
    public FinancialDate: Date;
    public AmountCurrency: number;
    public RestAmount: number;
    public Markings: Array<MarkingReference>;
}


export class MarkingReference extends UniEntity {
    public ID: number;
    public JournalEntryNumber: string;
}


export class SupplierInvoiceDetail extends UniEntity {
    public SupplierID: number;
    public AccountName: string;
    public VatCode: string;
    public InvoiceDate: Date;
    public InvoiceNumber: string;
    public Amount: number;
    public VatTypeName: string;
    public VatPercent: number;
    public AccountNumber: number;
    public AmountCurrency: number;
    public VatTypeID: number;
    public AccountID: number;
    public SupplierInvoiceID: number;
    public DeliveryDate: Date;
    public Description: string;
}


export class VatReportMessage extends UniEntity {
    public Message: string;
    public Level: ValidationLevel;
}


export class VatReportSummary extends UniEntity {
    public VatCodeGroupName: string;
    public VatCodeGroupID: number;
    public IsHistoricData: boolean;
    public NumberOfJournalEntryLines: number;
    public HasTaxBasis: boolean;
    public SumTaxBasisAmount: number;
    public HasTaxAmount: boolean;
    public SumVatAmount: number;
    public VatCodeGroupNo: string;
}


export class VatReportSummaryPerPost extends UniEntity {
    public VatCodeGroupName: string;
    public VatPostNo: string;
    public VatCodeGroupID: number;
    public IsHistoricData: boolean;
    public NumberOfJournalEntryLines: number;
    public HasTaxBasis: boolean;
    public SumTaxBasisAmount: number;
    public VatPostReportAsNegativeAmount: boolean;
    public VatPostName: string;
    public VatPostID: number;
    public HasTaxAmount: boolean;
    public SumVatAmount: number;
    public VatCodeGroupNo: string;
}


export class VatReportSummaryPerPostPerAccount extends UniEntity {
    public VatDate: Date;
    public VatCodeGroupName: string;
    public VatPostNo: string;
    public VatAccountNumber: number;
    public VatCodeGroupID: number;
    public VatAccountName: string;
    public VatCode: string;
    public IsHistoricData: boolean;
    public VatJournalEntryPostAccountID: number;
    public NumberOfJournalEntryLines: number;
    public HasTaxBasis: boolean;
    public JournalEntryNumber: string;
    public SumTaxBasisAmount: number;
    public VatAccountID: number;
    public StdVatCode: string;
    public VatJournalEntryPostAccountNumber: number;
    public VatPostReportAsNegativeAmount: boolean;
    public VatPostName: string;
    public TaxBasisAmount: number;
    public Amount: number;
    public VatPostID: number;
    public VatJournalEntryPostAccountName: string;
    public FinancialDate: Date;
    public HasTaxAmount: boolean;
    public SumVatAmount: number;
    public VatCodeGroupNo: string;
    public Description: string;
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


export enum ShipTradeArea{
    notSet = 0,
    Domestic = 1,
    Foreign = 2,
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


export enum GetRateFrom{
    WageType = 0,
    MonthlyPayEmployee = 1,
    HourlyPayEmployee = 2,
    FreeRateEmployee = 3,
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
