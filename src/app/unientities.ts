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

    public _createguid: string;
    public Action: string;
    public ClientID: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public EntityID: number;
    public EntityType: string;
    public Field: string;
    public ID: number;
    public NewValue: string;
    public OldValue: string;
    public Route: string;
    public Transaction: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Verb: string;
    public CustomFields: any;
}


export class WorkBalance extends UniEntity {
    public static RelativeUrl = 'workbalances';
    public static EntityType = 'WorkBalance';

    public _createguid: string;
    public ActualMinutes: number;
    public BalanceDate: Date;
    public BalanceFrom: Date;
    public Balancetype: WorkBalanceTypeEnum;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Days: number;
    public Deleted: boolean;
    public Description: string;
    public ExpectedMinutes: number;
    public ID: number;
    public IsStartBalance: boolean;
    public Minutes: number;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public ValidFrom: Date;
    public ValidTimeOff: number;
    public WorkRelationID: number;
    public CustomFields: any;
}


export class Worker extends UniEntity {
    public static RelativeUrl = 'workers';
    public static EntityType = 'Worker';

    public _createguid: string;
    public BusinessRelationID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public EmployeeID: number;
    public ID: number;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public UserID: number;
    public Info: BusinessRelation;
    public Relations: Array<WorkRelation>;
    public Employee: Employee;
    public CustomFields: any;
}


export class WorkItem extends UniEntity {
    public static RelativeUrl = 'workitems';
    public static EntityType = 'WorkItem';

    public _createguid: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public CustomerID: number;
    public CustomerOrderID: number;
    public Date: Date;
    public Deleted: boolean;
    public Description: string;
    public DimensionsID: number;
    public EndTime: Date;
    public ID: number;
    public Invoiceable: boolean;
    public Label: string;
    public LunchInMinutes: number;
    public Minutes: number;
    public MinutesToOrder: number;
    public OrderItemId: number;
    public PayrollTrackingID: number;
    public PriceExVat: number;
    public StartTime: Date;
    public StatusCode: number;
    public TransferedToOrder: boolean;
    public TransferedToPayroll: boolean;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public WorkItemGroupID: number;
    public WorkRelationID: number;
    public WorkTypeID: number;
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

    public _createguid: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public ID: number;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public WorkRelationID: number;
    public WorkRelation: WorkRelation;
    public Items: Array<WorkItem>;
    public CustomFields: any;
}


export class WorkProfile extends UniEntity {
    public static RelativeUrl = 'workprofiles';
    public static EntityType = 'WorkProfile';

    public _createguid: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public ID: number;
    public IsShared: boolean;
    public LunchIncluded: boolean;
    public MinutesPerMonth: number;
    public MinutesPerWeek: number;
    public MinutesPerYear: number;
    public Name: string;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CustomFields: any;
}


export class WorkRelation extends UniEntity {
    public static RelativeUrl = 'workrelations';
    public static EntityType = 'WorkRelation';

    public _createguid: string;
    public CompanyID: number;
    public CompanyName: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public Description: string;
    public EndTime: Date;
    public ID: number;
    public IsActive: boolean;
    public IsPrivate: boolean;
    public StartDate: Date;
    public StatusCode: number;
    public TeamID: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public WorkerID: number;
    public WorkPercentage: number;
    public WorkProfileID: number;
    public Worker: Worker;
    public WorkProfile: WorkProfile;
    public Items: Array<WorkItem>;
    public Team: Team;
    public CustomFields: any;
}


export class WorkTimeOff extends UniEntity {
    public static RelativeUrl = 'worktimeoff';
    public static EntityType = 'WorkTimeOff';

    public _createguid: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public Description: string;
    public FromDate: Date;
    public ID: number;
    public IsHalfDay: boolean;
    public RegionKey: string;
    public StatusCode: number;
    public SystemKey: string;
    public TimeoffType: number;
    public ToDate: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public WorkRelationID: number;
    public CustomFields: any;
}


export class WorkType extends UniEntity {
    public static RelativeUrl = 'worktypes';
    public static EntityType = 'WorkType';

    public _createguid: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public Description: string;
    public ID: number;
    public Name: string;
    public Price: number;
    public ProductID: number;
    public StatusCode: number;
    public SystemType: WorkTypeEnum;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public WagetypeNumber: number;
    public Product: Product;
    public CustomFields: any;
}


export class BankFile extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'BankFile';

    public _createguid: string;
    public Accountnumber: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public FileID: number;
    public ID: number;
    public ParentFileid: number;
    public StatusCode: number;
    public SubCompanyID: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public File: File;
    public SubCompany: SubCompany;
    public CustomFields: any;
}


export class BatchInvoice extends UniEntity {
    public static RelativeUrl = 'batchinvoices';
    public static EntityType = 'BatchInvoice';

    public _createguid: string;
    public Comment: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public DueDate: LocalDate;
    public ID: number;
    public InvoiceDate: LocalDate;
    public MinAmount: number;
    public Operation: BatchInvoiceOperation;
    public OurRef: string;
    public Processed: number;
    public SellerID: number;
    public StatusCode: number;
    public TotalToProcess: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public YourRef: string;
    public Items: Array<BatchInvoiceItem>;
    public CustomFields: any;
}


export class BatchInvoiceItem extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'BatchInvoiceItem';

    public _createguid: string;
    public BatchInvoiceID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public CustomerInvoiceID: number;
    public CustomerOrderID: number;
    public Deleted: boolean;
    public ID: number;
    public StatusCode: StatusCode;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CustomerOrder: CustomerOrder;
    public CustomerInvoice: CustomerInvoice;
    public CustomFields: any;
}


export class CampaignTemplate extends UniEntity {
    public static RelativeUrl = 'campaigntemplate';
    public static EntityType = 'CampaignTemplate';

    public _createguid: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public EntityName: string;
    public ID: number;
    public StatusCode: number;
    public Template: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CustomFields: any;
}


export class Customer extends UniEntity {
    public static RelativeUrl = 'customers';
    public static EntityType = 'Customer';

    public _createguid: string;
    public AcceptableDelta4CustomerPayment: number;
    public AcceptableDelta4CustomerPaymentAccountID: number;
    public AvtaleGiro: boolean;
    public AvtaleGiroNotification: boolean;
    public BusinessRelationID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public CreditDays: number;
    public CurrencyCodeID: number;
    public CustomerInvoiceReminderSettingsID: number;
    public CustomerNumber: number;
    public CustomerNumberKidAlias: string;
    public DefaultCustomerInvoiceReportID: number;
    public DefaultCustomerOrderReportID: number;
    public DefaultCustomerQuoteReportID: number;
    public DefaultDistributionsID: number;
    public DefaultSellerID: number;
    public Deleted: boolean;
    public DeliveryTermsID: number;
    public DimensionsID: number;
    public DontSendReminders: boolean;
    public EfakturaIdentifier: string;
    public EInvoiceAgreementReference: string;
    public FactoringNumber: number;
    public GLN: string;
    public ID: number;
    public IsPrivate: boolean;
    public Localization: string;
    public OrgNumber: string;
    public PaymentTermsID: number;
    public PeppolAddress: string;
    public ReminderEmailAddress: string;
    public StatusCode: number;
    public SubAccountNumberSeriesID: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public WebUrl: string;
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

    public _createguid: string;
    public AccrualID: number;
    public AmountRegards: string;
    public BankAccountID: number;
    public CollectorStatusCode: number;
    public Comment: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public CreditDays: number;
    public Credited: boolean;
    public CreditedAmount: number;
    public CreditedAmountCurrency: number;
    public CurrencyCodeID: number;
    public CurrencyExchangeRate: number;
    public CustomerID: number;
    public CustomerName: string;
    public CustomerOrgNumber: string;
    public CustomerPerson: string;
    public DefaultDimensionsID: number;
    public DefaultSellerID: number;
    public Deleted: boolean;
    public DeliveryDate: LocalDate;
    public DeliveryMethod: string;
    public DeliveryName: string;
    public DeliveryTerm: string;
    public DeliveryTermsID: number;
    public DistributionPlanID: number;
    public DontSendReminders: boolean;
    public EmailAddress: string;
    public FreeTxt: string;
    public ID: number;
    public InternalNote: string;
    public InvoiceAddressLine1: string;
    public InvoiceAddressLine2: string;
    public InvoiceAddressLine3: string;
    public InvoiceCity: string;
    public InvoiceCountry: string;
    public InvoiceCountryCode: string;
    public InvoiceDate: LocalDate;
    public InvoiceNumber: string;
    public InvoiceNumberSeriesID: number;
    public InvoicePostalCode: string;
    public InvoiceReceiverName: string;
    public InvoiceReferenceID: number;
    public InvoiceType: number;
    public JournalEntryID: number;
    public OurReference: string;
    public PayableRoundingAmount: number;
    public PayableRoundingCurrencyAmount: number;
    public Payment: string;
    public PaymentDueDate: LocalDate;
    public PaymentID: string;
    public PaymentInformation: string;
    public PaymentInfoTypeID: number;
    public PaymentTerm: string;
    public PaymentTermsID: number;
    public PrintStatus: number;
    public Requisition: string;
    public RestAmount: number;
    public RestAmountCurrency: number;
    public SalesPerson: string;
    public ShippingAddressLine1: string;
    public ShippingAddressLine2: string;
    public ShippingAddressLine3: string;
    public ShippingCity: string;
    public ShippingCountry: string;
    public ShippingCountryCode: string;
    public ShippingPostalCode: string;
    public StatusCode: number;
    public SupplierOrgNumber: string;
    public TaxExclusiveAmount: number;
    public TaxExclusiveAmountCurrency: number;
    public TaxInclusiveAmount: number;
    public TaxInclusiveAmountCurrency: number;
    public UpdateCurrencyAmountsOnDateChange: boolean;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public UseReportID: number;
    public VatTotalsAmount: number;
    public VatTotalsAmountCurrency: number;
    public YourReference: string;
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

    public _createguid: string;
    public AccountID: number;
    public AccountingCost: string;
    public CalculateGrossPriceBasedOnNetPrice: boolean;
    public Comment: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public CurrencyCodeID: number;
    public CurrencyExchangeRate: number;
    public CustomerInvoiceID: number;
    public Deleted: boolean;
    public DimensionsID: number;
    public Discount: number;
    public DiscountCurrency: number;
    public DiscountPercent: number;
    public ID: number;
    public InvoicePeriodEndDate: LocalDate;
    public InvoicePeriodStartDate: LocalDate;
    public ItemSourceID: number;
    public ItemText: string;
    public NumberOfItems: number;
    public OrderItemId: number;
    public PriceExVat: number;
    public PriceExVatCurrency: number;
    public PriceIncVat: number;
    public PriceSetByUser: boolean;
    public ProductID: number;
    public SortIndex: number;
    public StatusCode: number;
    public SumTotalExVat: number;
    public SumTotalExVatCurrency: number;
    public SumTotalIncVat: number;
    public SumTotalIncVatCurrency: number;
    public SumVat: number;
    public SumVatCurrency: number;
    public Unit: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public VatDate: LocalDate;
    public VatPercent: number;
    public VatTypeID: number;
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

    public _createguid: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public CreatedByReminderRuleID: number;
    public CurrencyCodeID: number;
    public CurrencyExchangeRate: number;
    public CustomerInvoiceID: number;
    public DebtCollectionFee: number;
    public DebtCollectionFeeCurrency: number;
    public Deleted: boolean;
    public Description: string;
    public DimensionsID: number;
    public DueDate: LocalDate;
    public EmailAddress: string;
    public ID: number;
    public InterestFee: number;
    public InterestFeeCurrency: number;
    public Notified: boolean;
    public RemindedDate: LocalDate;
    public ReminderFee: number;
    public ReminderFeeCurrency: number;
    public ReminderNumber: number;
    public RestAmount: number;
    public RestAmountCurrency: number;
    public RunNumber: number;
    public StatusCode: number;
    public Title: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CurrencyCode: CurrencyCode;
    public CustomerInvoice: CustomerInvoice;
    public CreatedByReminderRule: CustomerInvoiceReminderRule;
    public Payments: Array<Payment>;
    public CustomFields: any;
}


export class CustomerInvoiceReminderRule extends UniEntity {
    public static RelativeUrl = 'invoicereminderrules';
    public static EntityType = 'CustomerInvoiceReminderRule';

    public _createguid: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public CreditDays: number;
    public CustomerInvoiceReminderSettingsID: number;
    public Deleted: boolean;
    public Description: string;
    public ID: number;
    public MinimumDaysFromDueDate: number;
    public ReminderFee: number;
    public ReminderNumber: number;
    public StatusCode: number;
    public Title: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public UseMaximumLegalReminderFee: boolean;
    public CustomerInvoiceReminderSettings: CustomerInvoiceReminderSettings;
    public CustomFields: any;
}


export class CustomerInvoiceReminderSettings extends UniEntity {
    public static RelativeUrl = 'invoiceremindersettings';
    public static EntityType = 'CustomerInvoiceReminderSettings';

    public _createguid: string;
    public AcceptPaymentWithoutReminderFee: boolean;
    public CreatedAt: Date;
    public CreatedBy: string;
    public DebtCollectionSettingsID: number;
    public DefaultReminderFeeAccountID: number;
    public Deleted: boolean;
    public ID: number;
    public MinimumAmountToRemind: number;
    public RemindersBeforeDebtCollection: number;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CustomerInvoiceReminderRules: Array<CustomerInvoiceReminderRule>;
    public DebtCollectionSettings: DebtCollectionSettings;
    public DefaultReminderFeeAccount: Account;
    public CustomFields: any;
}


export class CustomerOrder extends UniEntity {
    public static RelativeUrl = 'orders';
    public static EntityType = 'CustomerOrder';

    public _createguid: string;
    public AccrualID: number;
    public Comment: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public CreditDays: number;
    public CurrencyCodeID: number;
    public CurrencyExchangeRate: number;
    public CustomerID: number;
    public CustomerName: string;
    public CustomerOrgNumber: string;
    public CustomerPerson: string;
    public DefaultDimensionsID: number;
    public DefaultSellerID: number;
    public Deleted: boolean;
    public DeliveryDate: LocalDate;
    public DeliveryMethod: string;
    public DeliveryName: string;
    public DeliveryTerm: string;
    public DeliveryTermsID: number;
    public DistributionPlanID: number;
    public EmailAddress: string;
    public FreeTxt: string;
    public ID: number;
    public InternalNote: string;
    public InvoiceAddressLine1: string;
    public InvoiceAddressLine2: string;
    public InvoiceAddressLine3: string;
    public InvoiceCity: string;
    public InvoiceCountry: string;
    public InvoiceCountryCode: string;
    public InvoicePostalCode: string;
    public InvoiceReceiverName: string;
    public OrderDate: LocalDate;
    public OrderNumber: number;
    public OrderNumberSeriesID: number;
    public OurReference: string;
    public PayableRoundingAmount: number;
    public PayableRoundingCurrencyAmount: number;
    public PaymentInfoTypeID: number;
    public PaymentTerm: string;
    public PaymentTermsID: number;
    public PrintStatus: number;
    public ReadyToInvoice: boolean;
    public Requisition: string;
    public RestAmountCurrency: number;
    public RestExclusiveAmountCurrency: number;
    public SalesPerson: string;
    public ShippingAddressLine1: string;
    public ShippingAddressLine2: string;
    public ShippingAddressLine3: string;
    public ShippingCity: string;
    public ShippingCountry: string;
    public ShippingCountryCode: string;
    public ShippingPostalCode: string;
    public StatusCode: number;
    public SupplierOrgNumber: string;
    public TaxExclusiveAmount: number;
    public TaxExclusiveAmountCurrency: number;
    public TaxInclusiveAmount: number;
    public TaxInclusiveAmountCurrency: number;
    public UpdateCurrencyAmountsOnDateChange: boolean;
    public UpdateCurrencyOnToInvoice: boolean;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public UseReportID: number;
    public VatTotalsAmount: number;
    public VatTotalsAmountCurrency: number;
    public YourReference: string;
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

    public _createguid: string;
    public AccountID: number;
    public CalculateGrossPriceBasedOnNetPrice: boolean;
    public Comment: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public CurrencyCodeID: number;
    public CurrencyExchangeRate: number;
    public CustomerOrderID: number;
    public Deleted: boolean;
    public DimensionsID: number;
    public Discount: number;
    public DiscountCurrency: number;
    public DiscountPercent: number;
    public ID: number;
    public ItemSourceID: number;
    public ItemText: string;
    public NumberOfItems: number;
    public PriceExVat: number;
    public PriceExVatCurrency: number;
    public PriceIncVat: number;
    public PriceSetByUser: boolean;
    public ProductID: number;
    public ReadyToInvoice: boolean;
    public SortIndex: number;
    public StatusCode: number;
    public SumTotalExVat: number;
    public SumTotalExVatCurrency: number;
    public SumTotalIncVat: number;
    public SumTotalIncVatCurrency: number;
    public SumVat: number;
    public SumVatCurrency: number;
    public Unit: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public VatDate: LocalDate;
    public VatPercent: number;
    public VatTypeID: number;
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

    public _createguid: string;
    public Comment: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public CreditDays: number;
    public CurrencyCodeID: number;
    public CurrencyExchangeRate: number;
    public CustomerID: number;
    public CustomerName: string;
    public CustomerOrgNumber: string;
    public CustomerPerson: string;
    public DefaultDimensionsID: number;
    public DefaultSellerID: number;
    public Deleted: boolean;
    public DeliveryDate: LocalDate;
    public DeliveryMethod: string;
    public DeliveryName: string;
    public DeliveryTerm: string;
    public DeliveryTermsID: number;
    public DistributionPlanID: number;
    public EmailAddress: string;
    public FreeTxt: string;
    public ID: number;
    public InquiryReference: number;
    public InternalNote: string;
    public InvoiceAddressLine1: string;
    public InvoiceAddressLine2: string;
    public InvoiceAddressLine3: string;
    public InvoiceCity: string;
    public InvoiceCountry: string;
    public InvoiceCountryCode: string;
    public InvoicePostalCode: string;
    public InvoiceReceiverName: string;
    public OurReference: string;
    public PayableRoundingAmount: number;
    public PayableRoundingCurrencyAmount: number;
    public PaymentInfoTypeID: number;
    public PaymentTerm: string;
    public PaymentTermsID: number;
    public PrintStatus: number;
    public QuoteDate: LocalDate;
    public QuoteNumber: number;
    public QuoteNumberSeriesID: number;
    public Requisition: string;
    public SalesPerson: string;
    public ShippingAddressLine1: string;
    public ShippingAddressLine2: string;
    public ShippingAddressLine3: string;
    public ShippingCity: string;
    public ShippingCountry: string;
    public ShippingCountryCode: string;
    public ShippingPostalCode: string;
    public StatusCode: number;
    public SupplierOrgNumber: string;
    public TaxExclusiveAmount: number;
    public TaxExclusiveAmountCurrency: number;
    public TaxInclusiveAmount: number;
    public TaxInclusiveAmountCurrency: number;
    public UpdateCurrencyAmountsOnDateChange: boolean;
    public UpdateCurrencyOnToInvoice: boolean;
    public UpdateCurrencyOnToOrder: boolean;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public UseReportID: number;
    public ValidUntilDate: LocalDate;
    public VatTotalsAmount: number;
    public VatTotalsAmountCurrency: number;
    public YourReference: string;
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

    public _createguid: string;
    public AccountID: number;
    public CalculateGrossPriceBasedOnNetPrice: boolean;
    public Comment: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public CurrencyCodeID: number;
    public CurrencyExchangeRate: number;
    public CustomerQuoteID: number;
    public Deleted: boolean;
    public DimensionsID: number;
    public Discount: number;
    public DiscountCurrency: number;
    public DiscountPercent: number;
    public ID: number;
    public ItemText: string;
    public NumberOfItems: number;
    public PriceExVat: number;
    public PriceExVatCurrency: number;
    public PriceIncVat: number;
    public PriceSetByUser: boolean;
    public ProductID: number;
    public SortIndex: number;
    public StatusCode: number;
    public SumTotalExVat: number;
    public SumTotalExVatCurrency: number;
    public SumTotalIncVat: number;
    public SumTotalIncVatCurrency: number;
    public SumVat: number;
    public SumVatCurrency: number;
    public Unit: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public VatDate: LocalDate;
    public VatPercent: number;
    public VatTypeID: number;
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

    public _createguid: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public CreditorNumber: number;
    public CustomerInvoiceReminderSettingsID: number;
    public DebtCollectionAutomationID: number;
    public DebtCollectionFormat: number;
    public Deleted: boolean;
    public ID: number;
    public IntegrateWithDebtCollection: boolean;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CustomerInvoiceReminderSettings: CustomerInvoiceReminderSettings;
    public DebtCollectionAutomation: Array<DebtCollectionAutomation>;
    public CustomFields: any;
}


export class ItemSource extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ItemSource';

    public _createguid: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public ID: number;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Details: Array<ItemSourceDetail>;
    public CustomFields: any;
}


export class ItemSourceDetail extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ItemSourceDetail';

    public _createguid: string;
    public Amount: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public Description: string;
    public ID: number;
    public ItemSourceID: number;
    public SourceFK: number;
    public SourceType: string;
    public StatusCode: number;
    public Tag: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CustomFields: any;
}


export class PaymentInfoType extends UniEntity {
    public static RelativeUrl = 'paymentinfotype';
    public static EntityType = 'PaymentInfoType';

    public _createguid: string;
    public Control: Modulus;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public ID: number;
    public Length: number;
    public Locked: boolean;
    public Name: string;
    public StatusCode: number;
    public Type: PaymentInfoTypeEnum;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public PaymentInfoTypeParts: Array<PaymentInfoTypePart>;
    public CustomFields: any;
}


export class PaymentInfoTypePart extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'PaymentInfoTypePart';

    public _createguid: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public ID: number;
    public Length: number;
    public Part: string;
    public PaymentInfoTypeID: number;
    public SortIndex: number;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CustomFields: any;
}


export class RecurringInvoice extends UniEntity {
    public static RelativeUrl = 'recurringinvoices';
    public static EntityType = 'RecurringInvoice';

    public _createguid: string;
    public AmountRegards: string;
    public Comment: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public CreditDays: number;
    public CurrencyCodeID: number;
    public CurrencyExchangeRate: number;
    public CustomerID: number;
    public CustomerName: string;
    public CustomerOrgNumber: string;
    public CustomerPerson: string;
    public DefaultDimensionsID: number;
    public DefaultSellerID: number;
    public Deleted: boolean;
    public DeliveryDate: LocalDate;
    public DeliveryMethod: string;
    public DeliveryName: string;
    public DeliveryTerm: string;
    public DeliveryTermsID: number;
    public DistributionPlanID: number;
    public EmailAddress: string;
    public EndDate: LocalDate;
    public FreeTxt: string;
    public ID: number;
    public InternalNote: string;
    public Interval: number;
    public InvoiceAddressLine1: string;
    public InvoiceAddressLine2: string;
    public InvoiceAddressLine3: string;
    public InvoiceCity: string;
    public InvoiceCountry: string;
    public InvoiceCountryCode: string;
    public InvoiceNumberSeriesID: number;
    public InvoicePostalCode: string;
    public InvoiceReceiverName: string;
    public MaxIterations: number;
    public NextInvoiceDate: LocalDate;
    public NoCreditDays: boolean;
    public NotifyUser: string;
    public NotifyWhenOrdersArePrepared: boolean;
    public NotifyWhenRecurringEnds: boolean;
    public OurReference: string;
    public PayableRoundingAmount: number;
    public PayableRoundingCurrencyAmount: number;
    public Payment: string;
    public PaymentInformation: string;
    public PaymentInfoTypeID: number;
    public PaymentTerm: string;
    public PaymentTermsID: number;
    public PreparationDays: number;
    public PrintStatus: number;
    public ProduceAs: RecurringResult;
    public Requisition: string;
    public SalesPerson: string;
    public ShippingAddressLine1: string;
    public ShippingAddressLine2: string;
    public ShippingAddressLine3: string;
    public ShippingCity: string;
    public ShippingCountry: string;
    public ShippingCountryCode: string;
    public ShippingPostalCode: string;
    public StartDate: LocalDate;
    public StatusCode: number;
    public SupplierOrgNumber: string;
    public TaxExclusiveAmount: number;
    public TaxExclusiveAmountCurrency: number;
    public TaxInclusiveAmount: number;
    public TaxInclusiveAmountCurrency: number;
    public TimePeriod: RecurringPeriod;
    public UpdateCurrencyAmountsOnDateChange: boolean;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public UseReportID: number;
    public VatTotalsAmount: number;
    public VatTotalsAmountCurrency: number;
    public YourReference: string;
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

    public _createguid: string;
    public AccountID: number;
    public CalculateGrossPriceBasedOnNetPrice: boolean;
    public Comment: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public CurrencyCodeID: number;
    public CurrencyExchangeRate: number;
    public Deleted: boolean;
    public DimensionsID: number;
    public Discount: number;
    public DiscountCurrency: number;
    public DiscountPercent: number;
    public ID: number;
    public ItemText: string;
    public NumberOfItems: number;
    public PriceExVat: number;
    public PriceExVatCurrency: number;
    public PriceIncVat: number;
    public PriceSetByUser: boolean;
    public PricingSource: PricingSource;
    public ProductID: number;
    public RecurringInvoiceID: number;
    public ReduceIncompletePeriod: boolean;
    public SortIndex: number;
    public StatusCode: number;
    public SumTotalExVat: number;
    public SumTotalExVatCurrency: number;
    public SumTotalIncVat: number;
    public SumTotalIncVatCurrency: number;
    public SumVat: number;
    public SumVatCurrency: number;
    public TimeFactor: RecurringPeriod;
    public Unit: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public VatDate: LocalDate;
    public VatPercent: number;
    public VatTypeID: number;
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

    public _createguid: string;
    public Comment: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public CreationDate: LocalDate;
    public Deleted: boolean;
    public ID: number;
    public InvoiceDate: LocalDate;
    public InvoiceID: number;
    public IterationNumber: number;
    public NotifiedOrdersPrepared: boolean;
    public NotifiedRecurringEnds: boolean;
    public OrderID: number;
    public RecurringInvoiceID: number;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CustomFields: any;
}


export class Seller extends UniEntity {
    public static RelativeUrl = 'sellers';
    public static EntityType = 'Seller';

    public _createguid: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public DefaultDimensionsID: number;
    public Deleted: boolean;
    public EmployeeID: number;
    public ID: number;
    public Name: string;
    public StatusCode: number;
    public TeamID: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public UserID: number;
    public User: User;
    public Employee: Employee;
    public Team: Team;
    public DefaultDimensions: Dimensions;
    public CustomFields: any;
}


export class SellerLink extends UniEntity {
    public static RelativeUrl = 'sellerlinks';
    public static EntityType = 'SellerLink';

    public _createguid: string;
    public Amount: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public CustomerID: number;
    public CustomerInvoiceID: number;
    public CustomerOrderID: number;
    public CustomerQuoteID: number;
    public Deleted: boolean;
    public ID: number;
    public Percent: number;
    public RecurringInvoiceID: number;
    public SellerID: number;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Seller: Seller;
    public CustomFields: any;
}


export class SubCompany extends UniEntity {
    public static RelativeUrl = 'subcompanies';
    public static EntityType = 'SubCompany';

    public _createguid: string;
    public CompanyID: number;
    public CompanyKey: string;
    public CompanyName: string;
    public CompanyType: CompanyRelation;
    public CreatedAt: Date;
    public CreatedBy: string;
    public CustomerID: number;
    public Deleted: boolean;
    public ID: number;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Customer: Customer;
    public CustomFields: any;
}


export class Supplier extends UniEntity {
    public static RelativeUrl = 'suppliers';
    public static EntityType = 'Supplier';

    public _createguid: string;
    public BusinessRelationID: number;
    public CostAllocationID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public CreditDays: number;
    public CurrencyCodeID: number;
    public Deleted: boolean;
    public DimensionsID: number;
    public GLN: string;
    public ID: number;
    public Localization: string;
    public OrgNumber: string;
    public PeppolAddress: string;
    public SelfEmployed: boolean;
    public StatusCode: number;
    public SubAccountNumberSeriesID: number;
    public SupplierNumber: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public WebUrl: string;
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

    public _createguid: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public CreditDays: number;
    public Deleted: boolean;
    public Description: string;
    public ID: number;
    public Name: string;
    public StatusCode: number;
    public TermsType: TermsType;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CustomFields: any;
}


export class TOFCurrencySettings extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'TOFCurrencySettings';

    public _createguid: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public ID: number;
    public StatusCode: number;
    public UpdateCurrencyAmountsOnInvoicedateChange: boolean;
    public UpdateCurrencyAmountsOnOrderdateChange: boolean;
    public UpdateCurrencyAmountsOnOrderToInvoice: boolean;
    public UpdateCurrencyAmountsOnQuotedateChange: boolean;
    public UpdateCurrencyAmountsOnQuoteToInvoice: boolean;
    public UpdateCurrencyAmountsOnQuoteToOrder: boolean;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CustomFields: any;
}


export class Address extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Address';

    public _createguid: string;
    public AddressLine1: string;
    public AddressLine2: string;
    public AddressLine3: string;
    public BusinessRelationID: number;
    public City: string;
    public Country: string;
    public CountryCode: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public ID: number;
    public PostalCode: string;
    public Region: string;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public BusinessRelation: BusinessRelation;
    public CustomFields: any;
}


export class BusinessRelation extends UniEntity {
    public static RelativeUrl = 'business-relations';
    public static EntityType = 'BusinessRelation';

    public _createguid: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public DefaultBankAccountID: number;
    public DefaultContactID: number;
    public DefaultEmailID: number;
    public DefaultPhoneID: number;
    public Deleted: boolean;
    public ID: number;
    public InvoiceAddressID: number;
    public Name: string;
    public ShippingAddressID: number;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
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

    public _createguid: string;
    public Comment: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public ID: number;
    public InfoID: number;
    public ParentBusinessRelationID: number;
    public Role: string;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public ParentBusinessRelation: BusinessRelation;
    public Info: BusinessRelation;
    public CustomFields: any;
}


export class Email extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Email';

    public _createguid: string;
    public BusinessRelationID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public Description: string;
    public EmailAddress: string;
    public ID: number;
    public StatusCode: number;
    public Type: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CustomFields: any;
}


export class Phone extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Phone';

    public _createguid: string;
    public BusinessRelationID: number;
    public CountryCode: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public Description: string;
    public ID: number;
    public Number: string;
    public StatusCode: number;
    public Type: PhoneTypeEnum;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CustomFields: any;
}


export class AGACalculation extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AGACalculation';

    public _createguid: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public DimensionsID: number;
    public ID: number;
    public PayrollRunID: number;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
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

    public _createguid: string;
    public AGACalculationID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public freeAmount: number;
    public ID: number;
    public StatusCode: number;
    public SubEntityID: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public subEntity: SubEntity;
    public CustomFields: any;
}


export class AGATax extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AGATax';

    public _createguid: string;
    public agaBase: number;
    public AGACalculationID: number;
    public agaRate: number;
    public AGARateID: number;
    public beregningsKode: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public ID: number;
    public municipalityName: string;
    public StatusCode: number;
    public SubEntityID: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public zone: number;
    public zoneName: string;
    public subEntity: SubEntity;
    public CustomFields: any;
}


export class AGAPension extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AGAPension';

    public _createguid: string;
    public agaBase: number;
    public AGACalculationID: number;
    public agaRate: number;
    public AGARateID: number;
    public beregningsKode: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public ID: number;
    public municipalityName: string;
    public StatusCode: number;
    public SubEntityID: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public zone: number;
    public zoneName: string;
    public subEntity: SubEntity;
    public CustomFields: any;
}


export class AGADraw extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AGADraw';

    public _createguid: string;
    public agaBase: number;
    public AGACalculationID: number;
    public agaRate: number;
    public AGARateID: number;
    public beregningsKode: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public ID: number;
    public municipalityName: string;
    public StatusCode: number;
    public SubEntityID: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public zone: number;
    public zoneName: string;
    public subEntity: SubEntity;
    public CustomFields: any;
}


export class ForeignerWithPercent extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ForeignerWithPercent';

    public _createguid: string;
    public agaBase: number;
    public AGACalculationID: number;
    public agaRate: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public ID: number;
    public municipalityName: string;
    public StatusCode: number;
    public SubEntityID: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public zoneName: string;
    public subEntity: SubEntity;
    public CustomFields: any;
}


export class DrawForeignerWithPercent extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'DrawForeignerWithPercent';

    public _createguid: string;
    public agaBase: number;
    public AGACalculationID: number;
    public agaRate: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public ID: number;
    public municipalityName: string;
    public StatusCode: number;
    public SubEntityID: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public zoneName: string;
    public subEntity: SubEntity;
    public CustomFields: any;
}


export class ForeignerWithAmount extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ForeignerWithAmount';

    public _createguid: string;
    public aga: number;
    public AGACalculationID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public ID: number;
    public municipalityName: string;
    public persons: number;
    public StatusCode: number;
    public SubEntityID: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public zoneName: string;
    public subEntity: SubEntity;
    public CustomFields: any;
}


export class TaxAndAgaSums extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'TaxAndAgaSums';

    public _createguid: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public FinancialTax: number;
    public ID: number;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public WithholdingTax: number;
    public CustomFields: any;
}


export class AmeldingData extends UniEntity {
    public static RelativeUrl = 'amelding';
    public static EntityType = 'AmeldingData';

    public _createguid: string;
    public altinnStatus: string;
    public attachmentFileID: number;
    public created: Date;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public feedbackFileID: number;
    public ID: number;
    public initiated: Date;
    public mainFileID: number;
    public messageID: string;
    public OppgaveHash: string;
    public PayrollRunID: number;
    public period: number;
    public receiptID: number;
    public replacesID: number;
    public replaceThis: string;
    public sent: Date;
    public status: number;
    public StatusCode: number;
    public type: AmeldingType;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public xmlValidationErrors: string;
    public year: number;
    public log: Array<AmeldingLog>;
    public CustomFields: any;
}


export class AmeldingLog extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AmeldingLog';

    public _createguid: string;
    public AmeldingsID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public ID: number;
    public key: number;
    public registry: SalaryRegistry;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CustomFields: any;
}


export class BasicAmount extends UniEntity {
    public static RelativeUrl = 'basicamounts';
    public static EntityType = 'BasicAmount';

    public _createguid: string;
    public AveragePrYear: number;
    public BasicAmountPrMonth: number;
    public BasicAmountPrYear: number;
    public ConversionFactor: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public FromDate: Date;
    public ID: number;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CustomFields: any;
}


export class CompanySalary extends UniEntity {
    public static RelativeUrl = 'companysalary';
    public static EntityType = 'CompanySalary';

    public _createguid: string;
    public AllowOver6G: boolean;
    public Base_JanMayenAndBiCountries: boolean;
    public Base_NettoPayment: boolean;
    public Base_NettoPaymentForMaritim: boolean;
    public Base_PayAsYouEarnTaxOnPensions: boolean;
    public Base_SpesialDeductionForMaritim: boolean;
    public Base_Svalbard: boolean;
    public Base_TaxFreeOrganization: boolean;
    public CalculateFinancialTax: boolean;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public FreeAmount: number;
    public HourFTEs: number;
    public HoursPerMonth: number;
    public ID: number;
    public InterrimRemitAccount: number;
    public MainAccountAllocatedAGA: number;
    public MainAccountAllocatedAGAVacation: number;
    public MainAccountAllocatedFinancial: number;
    public MainAccountAllocatedFinancialVacation: number;
    public MainAccountAllocatedVacation: number;
    public MainAccountCostAGA: number;
    public MainAccountCostAGAVacation: number;
    public MainAccountCostFinancial: number;
    public MainAccountCostFinancialVacation: number;
    public MainAccountCostVacation: number;
    public OtpExportActive: boolean;
    public PaycheckZipReportID: number;
    public PaymentInterval: CompanySalaryPaymentInterval;
    public PostToTaxDraw: boolean;
    public RateFinancialTax: number;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public WageDeductionDueToHoliday: WageDeductionDueToHolidayType;
    public WagetypeAdvancePayment: number;
    public WagetypeAdvancePaymentAuto: number;
    public CustomFields: any;
}


export class CompanyVacationRate extends UniEntity {
    public static RelativeUrl = 'companyvacationrates';
    public static EntityType = 'CompanyVacationRate';

    public _createguid: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public FromDate: Date;
    public ID: number;
    public Rate: number;
    public Rate60: number;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CustomFields: any;
}


export class Employee extends UniEntity {
    public static RelativeUrl = 'employees';
    public static EntityType = 'Employee';

    public _createguid: string;
    public Active: boolean;
    public AdvancePaymentAmount: number;
    public BirthDate: Date;
    public BusinessRelationID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public EmployeeNumber: number;
    public EmploymentDate: Date;
    public EmploymentDateOtp: LocalDate;
    public EndDateOtp: LocalDate;
    public ForeignWorker: ForeignWorker;
    public FreeText: string;
    public ID: number;
    public IncludeOtpUntilMonth: number;
    public IncludeOtpUntilYear: number;
    public InternasjonalIDCountry: string;
    public InternasjonalIDType: InternationalIDType;
    public InternationalID: string;
    public MunicipalityNo: string;
    public OtpExport: boolean;
    public OtpStatus: OtpStatus;
    public PaymentInterval: PaymentInterval;
    public PhotoID: number;
    public Sex: GenderEnum;
    public SocialSecurityNumber: string;
    public StatusCode: number;
    public SubEntityID: number;
    public TypeOfPaymentOtp: TypeOfPaymentOtp;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public UserID: number;
    public BusinessRelationInfo: BusinessRelation;
    public Employments: Array<Employment>;
    public VacationRateEmployees: Array<VacationRateEmployee>;
    public SubEntity: SubEntity;
    public TaxCards: Array<EmployeeTaxCard>;
    public CustomFields: any;
}


export class EmployeeCategory extends UniEntity {
    public static RelativeUrl = 'employeecategories';
    public static EntityType = 'EmployeeCategory';

    public _createguid: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public EmployeeCategoryLinkID: number;
    public ID: number;
    public Name: string;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CustomFields: any;
}


export class EmployeeCategoryLink extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'EmployeeCategoryLink';

    public _createguid: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public EmployeeCategoryID: number;
    public EmployeeID: number;
    public EmployeeNumber: number;
    public ID: number;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public EmployeeCategory: EmployeeCategory;
    public Employee: Employee;
    public CustomFields: any;
}


export class EmployeeTaxCard extends UniEntity {
    public static RelativeUrl = 'taxcards';
    public static EntityType = 'EmployeeTaxCard';

    public _createguid: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public EmployeeID: number;
    public EmployeeNumber: number;
    public ID: number;
    public IssueDate: Date;
    public loennFraBiarbeidsgiverID: number;
    public loennFraHovedarbeidsgiverID: number;
    public loennKunTrygdeavgiftTilUtenlandskBorgerID: number;
    public loennKunTrygdeavgiftTilUtenlandskBorgerSomGrensegjengerID: number;
    public loennTilUtenrikstjenestemannID: number;
    public NonTaxableAmount: number;
    public NoRecalc: boolean;
    public NotMainEmployer: boolean;
    public pensjonID: number;
    public Percent: number;
    public ResultatStatus: string;
    public SecondaryPercent: number;
    public SecondaryTable: string;
    public SKDXml: string;
    public StatusCode: number;
    public Table: string;
    public TaxcardId: number;
    public Tilleggsopplysning: string;
    public ufoereYtelserAndreID: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Year: number;
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

    public _createguid: string;
    public AntallMaanederForTrekk: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public freeAmountType: FreeAmountType;
    public ID: number;
    public NonTaxableAmount: number;
    public Percent: number;
    public tabellType: TabellType;
    public Table: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CustomFields: any;
}


export class EmployeeLeave extends UniEntity {
    public static RelativeUrl = 'EmployeeLeave';
    public static EntityType = 'EmployeeLeave';

    public _createguid: string;
    public AffectsOtp: boolean;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public Description: string;
    public EmploymentID: number;
    public FromDate: Date;
    public ID: number;
    public LeavePercent: number;
    public LeaveType: Leavetype;
    public StatusCode: number;
    public ToDate: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Employment: Employment;
    public CustomFields: any;
}


export class Employment extends UniEntity {
    public static RelativeUrl = 'employments';
    public static EntityType = 'Employment';

    public _createguid: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public DimensionsID: number;
    public EmployeeID: number;
    public EmployeeNumber: number;
    public EndDate: Date;
    public HourRate: number;
    public HoursPerWeek: number;
    public ID: number;
    public JobCode: string;
    public JobName: string;
    public LastSalaryChangeDate: Date;
    public LastWorkPercentChangeDate: Date;
    public LedgerAccount: string;
    public MonthRate: number;
    public PayGrade: string;
    public RemunerationType: RemunerationType;
    public SeniorityDate: Date;
    public ShipReg: ShipRegistry;
    public ShipType: ShipTypeOfShip;
    public Standard: boolean;
    public StartDate: Date;
    public StatusCode: number;
    public SubEntityID: number;
    public TradeArea: ShipTradeArea;
    public TypeOfEmployment: TypeOfEmployment;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public UserDefinedRate: number;
    public WorkingHoursScheme: WorkingHoursScheme;
    public WorkPercent: number;
    public Employee: Employee;
    public SubEntity: SubEntity;
    public Dimensions: Dimensions;
    public Leaves: Array<EmployeeLeave>;
    public CustomFields: any;
}


export class Grant extends UniEntity {
    public static RelativeUrl = 'grants';
    public static EntityType = 'Grant';

    public _createguid: string;
    public AffectsAGA: boolean;
    public Amount: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public Description: string;
    public FromDate: Date;
    public ID: number;
    public StatusCode: number;
    public SubentityID: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CustomFields: any;
}


export class OtpExportWagetype extends UniEntity {
    public static RelativeUrl = 'otpexportwagetypes';
    public static EntityType = 'OtpExportWagetype';

    public _createguid: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public ID: number;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public WageTypeNumber: number;
    public CustomFields: any;
}


export class PayrollRun extends UniEntity {
    public static RelativeUrl = 'payrollrun';
    public static EntityType = 'PayrollRun';

    public _createguid: string;
    public AGAFreeAmount: number;
    public AGAonRun: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public Description: string;
    public ExcludeRecurringPosts: boolean;
    public FreeText: string;
    public FromDate: Date;
    public HolidayPayDeduction: boolean;
    public ID: number;
    public JournalEntryNumber: string;
    public needsRecalc: boolean;
    public PaycheckFileID: number;
    public PayDate: Date;
    public SettlementDate: Date;
    public StatusCode: number;
    public taxdrawfactor: TaxDrawFactor;
    public ToDate: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public transactions: Array<SalaryTransaction>;
    public agacalculation: Array<AGACalculation>;
    public CustomFields: any;
}


export class PayrollRunCategoryLink extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'PayrollRunCategoryLink';

    public _createguid: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public EmployeeCategoryID: number;
    public ID: number;
    public PayrollRunID: number;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public EmployeeCategory: EmployeeCategory;
    public PayrollRun: PayrollRun;
    public CustomFields: any;
}


export class PostingSummaryDraft extends UniEntity {
    public draftBasic: string;
    public draftWithDims: string;
    public draftWithDimsOnBalance: string;
    public ID: number;
    public JobInfoID: number;
    public PayrollID: number;
    public status: SummaryJobStatus;
    public statusTime: Date;
}


export class SalaryBalance extends UniEntity {
    public static RelativeUrl = 'salarybalances';
    public static EntityType = 'SalaryBalance';

    public _createguid: string;
    public Amount: number;
    public Balance: number;
    public CalculatedBalance: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public CreatePayment: boolean;
    public Deleted: boolean;
    public EmployeeID: number;
    public FromDate: Date;
    public ID: number;
    public Instalment: number;
    public InstalmentPercent: number;
    public InstalmentType: SalBalType;
    public KID: string;
    public MaxAmount: number;
    public MinAmount: number;
    public Name: string;
    public SalaryBalanceTemplateID: number;
    public Source: SalBalSource;
    public StatusCode: number;
    public SupplierID: number;
    public ToDate: Date;
    public Type: SalBalDrawType;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public WageTypeNumber: number;
    public Employee: Employee;
    public Supplier: Supplier;
    public Transactions: Array<SalaryBalanceLine>;
    public CustomFields: any;
}


export class SalaryBalanceLine extends UniEntity {
    public static RelativeUrl = 'salarybalancelines';
    public static EntityType = 'SalaryBalanceLine';

    public _createguid: string;
    public Amount: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Date: LocalDate;
    public Deleted: boolean;
    public Description: string;
    public ID: number;
    public SalaryBalanceID: number;
    public SalaryTransactionID: number;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public SalaryTransaction: SalaryTransaction;
    public SalaryBalance: SalaryBalance;
    public CustomFields: any;
}


export class SalaryBalanceTemplate extends UniEntity {
    public static RelativeUrl = 'salarybalancetemplates';
    public static EntityType = 'SalaryBalanceTemplate';

    public _createguid: string;
    public Account: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public CreatePayment: boolean;
    public Deleted: boolean;
    public ID: number;
    public Instalment: number;
    public InstalmentPercent: number;
    public InstalmentType: SalBalType;
    public KID: string;
    public MaxAmount: number;
    public MinAmount: number;
    public Name: string;
    public SalarytransactionDescription: string;
    public StatusCode: number;
    public SupplierID: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public WageTypeNumber: number;
    public Supplier: Supplier;
    public SalaryBalances: Array<SalaryBalance>;
    public CustomFields: any;
}


export class SalaryTransaction extends UniEntity {
    public static RelativeUrl = 'salarytrans';
    public static EntityType = 'SalaryTransaction';

    public _createguid: string;
    public Account: number;
    public Amount: number;
    public calcAGA: number;
    public ChildSalaryTransactionID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public DimensionsID: number;
    public EmployeeID: number;
    public EmployeeNumber: number;
    public EmploymentID: number;
    public FromDate: Date;
    public HolidayPayDeduction: boolean;
    public ID: number;
    public IsRecurringPost: boolean;
    public MunicipalityNo: string;
    public PayrollRunID: number;
    public Rate: number;
    public RecurringID: number;
    public recurringPostValidFrom: Date;
    public recurringPostValidTo: Date;
    public SalaryBalanceID: number;
    public StatusCode: number;
    public Sum: number;
    public SystemType: StdSystemType;
    public TaxbasisID: number;
    public Text: string;
    public ToDate: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public VatTypeID: number;
    public WageTypeID: number;
    public WageTypeNumber: number;
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

    public _createguid: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public ID: number;
    public SalaryTransactionID: number;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public ValueBool: boolean;
    public ValueDate: Date;
    public ValueDate2: Date;
    public ValueMoney: number;
    public ValueString: string;
    public WageTypeSupplementID: number;
    public WageTypeSupplement: WageTypeSupplement;
    public CustomFields: any;
}


export class SalaryYear extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'SalaryYear';

    public _createguid: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public CurrentYear: number;
    public Deleted: boolean;
    public ID: number;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CustomFields: any;
}


export class SubEntity extends UniEntity {
    public static RelativeUrl = 'subentities';
    public static EntityType = 'SubEntity';

    public _createguid: string;
    public AgaRule: number;
    public AgaZone: number;
    public BusinessRelationID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public freeAmount: number;
    public ID: number;
    public MunicipalityNo: string;
    public OrgNumber: string;
    public StatusCode: number;
    public SuperiorOrganizationID: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public BusinessRelationInfo: BusinessRelation;
    public SuperiorOrganization: SubEntity;
    public CustomFields: any;
}


export class TaxBasis extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'TaxBasis';

    public _createguid: string;
    public Basis: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public DisabilityOtherBasis: number;
    public ForeignBorderCommuterBasis: number;
    public ForeignCitizenInsuranceBasis: number;
    public ID: number;
    public JanMayenBasis: number;
    public PensionBasis: number;
    public PensionSourcetaxBasis: number;
    public SailorBasis: number;
    public SalaryTransactionID: number;
    public StatusCode: number;
    public SvalbardBasis: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CustomFields: any;
}


export class Travel extends UniEntity {
    public static RelativeUrl = 'travels';
    public static EntityType = 'Travel';

    public _createguid: string;
    public Comment: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public Description: string;
    public Email: string;
    public EmployeeNumber: number;
    public ID: number;
    public Name: string;
    public PersonID: string;
    public Phone: string;
    public Purpose: string;
    public SourceSystem: string;
    public State: state;
    public StatusCode: number;
    public SupplierID: number;
    public TravelIdentificator: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public TravelLines: Array<TravelLine>;
    public CustomFields: any;
}


export class TravelLine extends UniEntity {
    public static RelativeUrl = 'travellines';
    public static EntityType = 'TravelLine';

    public _createguid: string;
    public AccountNumber: number;
    public Amount: number;
    public CostType: costtype;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public Description: string;
    public From: Date;
    public ID: number;
    public LineState: linestate;
    public paytransID: number;
    public Rate: number;
    public StatusCode: number;
    public To: Date;
    public TravelID: number;
    public TravelIdentificator: string;
    public TypeID: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public VatTypeID: number;
    public Travel: Travel;
    public VatType: VatType;
    public travelType: TravelType;
    public CustomFields: any;
}


export class TravelType extends UniEntity {
    public static RelativeUrl = 'traveltype';
    public static EntityType = 'TravelType';

    public _createguid: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public Description: string;
    public ForeignDescription: string;
    public ForeignTypeID: string;
    public ID: number;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public WageTypeNumber: number;
    public CustomFields: any;
}


export class VacationPayLine extends UniEntity {
    public static RelativeUrl = 'VacationPayLines';
    public static EntityType = 'VacationPayLine';

    public _createguid: string;
    public Age: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public EmployeeID: number;
    public ID: number;
    public ManualVacationPayBase: number;
    public MissingEarlierVacationPay: number;
    public PaidVacationPay: number;
    public Rate: number;
    public Rate60: number;
    public StatusCode: number;
    public SystemVacationPayBase: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public VacationPay: number;
    public VacationPay60: number;
    public Withdrawal: number;
    public Year: number;
    public Employee: Employee;
    public CustomFields: any;
}


export class VacationRateEmployee extends UniEntity {
    public static RelativeUrl = 'employeevacationrates';
    public static EntityType = 'VacationRateEmployee';

    public _createguid: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public EmployeeID: number;
    public EndDate: Date;
    public ID: number;
    public Rate: number;
    public Rate60: number;
    public StartDate: Date;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CustomFields: any;
}


export class WageType extends UniEntity {
    public static RelativeUrl = 'wagetypes';
    public static EntityType = 'WageType';

    public _createguid: string;
    public AccountNumber: number;
    public AccountNumber_balance: number;
    public Base_div2: boolean;
    public Base_div3: boolean;
    public Base_EmploymentTax: boolean;
    public Base_Payment: boolean;
    public Base_Vacation: boolean;
    public Benefit: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public DaysOnBoard: boolean;
    public Deleted: boolean;
    public Description: string;
    public FixedSalaryHolidayDeduction: boolean;
    public GetRateFrom: GetRateFrom;
    public HideFromPaycheck: boolean;
    public ID: number;
    public IncomeType: string;
    public Limit_newRate: number;
    public Limit_type: LimitType;
    public Limit_value: number;
    public Limit_WageTypeNumber: number;
    public NoNumberOfHours: boolean;
    public Postnr: string;
    public Rate: number;
    public RateFactor: number;
    public RatetypeColumn: RateTypeColumn;
    public SpecialAgaRule: SpecialAgaRule;
    public SpecialTaxAndContributionsRule: SpecialTaxAndContributionsRule;
    public StandardWageTypeFor: StdWageType;
    public StatusCode: number;
    public SupplementPackage: string;
    public SystemRequiredWageType: number;
    public Systemtype: string;
    public taxtype: TaxType;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public ValidYear: number;
    public WageTypeName: string;
    public WageTypeNumber: number;
    public SupplementaryInformations: Array<WageTypeSupplement>;
    public CustomFields: any;
}


export class WageTypeSupplement extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'WageTypeSupplement';

    public _createguid: string;
    public ameldingType: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public Description: string;
    public GetValueFromTrans: boolean;
    public ID: number;
    public Name: string;
    public StatusCode: number;
    public SuggestedValue: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public ValueType: Valuetype;
    public WageTypeID: number;
    public CustomFields: any;
}


export class ComponentLayout extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ComponentLayout';

    public _createguid: string;
    public BaseEntity: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public ID: number;
    public Name: string;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Fields: Array<FieldLayout>;
    public CustomFields: any;
}


export class FieldLayout extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'FieldLayout';

    public _createguid: string;
    public Alignment: Alignment;
    public Combo: number;
    public ComponentLayoutID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public Description: string;
    public DisplayField: string;
    public EntityType: string;
    public FieldSet: number;
    public FieldType: FieldType;
    public HelpText: string;
    public Hidden: boolean;
    public ID: number;
    public Label: string;
    public Legend: string;
    public LineBreak: boolean;
    public LookupField: boolean;
    public Options: string;
    public Placeholder: string;
    public Placement: number;
    public Property: string;
    public ReadOnly: boolean;
    public Section: number;
    public Sectionheader: string;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Width: string;
    public CustomFields: any;
}


export class CurrencyOverride extends UniEntity {
    public static RelativeUrl = 'currencyoverrides';
    public static EntityType = 'CurrencyOverride';

    public _createguid: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public ExchangeRate: number;
    public Factor: number;
    public FromCurrencyCodeID: number;
    public FromDate: LocalDate;
    public ID: number;
    public Source: CurrencySourceEnum;
    public ToCurrencyCodeID: number;
    public ToDate: LocalDate;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public FromCurrencyCode: CurrencyCode;
    public ToCurrencyCode: CurrencyCode;
    public CustomFields: any;
}


export class AccountGroupSetup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AccountGroupSetup';

    public _createguid: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public ExternalReference: string;
    public ID: number;
    public Name: string;
    public ParentID: number;
    public PlanType: PlanTypeEnum;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Parent: AccountGroupSetup;
    public CustomFields: any;
}


export class AccountSetup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AccountSetup';

    public _createguid: string;
    public AccountGroupSetupID: number;
    public AccountName: string;
    public AccountNumber: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public ExpectedDebitBalance: boolean;
    public ID: number;
    public IsAS: boolean;
    public IsENK: boolean;
    public IsMini: boolean;
    public PlanType: PlanTypeEnum;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public VatCode: string;
    public Visible: boolean;
    public AccountGroup: AccountGroupSetup;
    public CustomFields: any;
}


export class AccountVisibilityGroup extends UniEntity {
    public static RelativeUrl = 'accountvisibilitygroups';
    public static EntityType = 'AccountVisibilityGroup';

    public _createguid: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public ID: number;
    public Name: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Accounts: Array<AccountVisibilityGroupAccount>;
    public CompanyTypes: Array<CompanyType>;
    public CustomFields: any;
}


export class AccountVisibilityGroupAccount extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AccountVisibilityGroupAccount';

    public _createguid: string;
    public AccountSetupID: number;
    public AccountVisibilityGroupID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public ID: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CustomFields: any;
}


export class AGARate extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AGARate';

    public _createguid: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public ID: number;
    public Rate: number;
    public RateValidFrom: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public ZoneID: number;
    public sector: Array<AGASector>;
    public CustomFields: any;
}


export class AGASector extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AGASector';

    public _createguid: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public freeAmount: number;
    public ID: number;
    public Rate: number;
    public RateID: number;
    public Sector: string;
    public SectorID: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public ValidFrom: Date;
    public CustomFields: any;
}


export class AGAZone extends UniEntity {
    public static RelativeUrl = 'AGAZones';
    public static EntityType = 'AGAZone';

    public _createguid: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public ID: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public ZoneName: string;
    public rates: Array<AGARate>;
    public municipalsOnZone: Array<MunicipalAGAZone>;
    public CustomFields: any;
}


export class Agreement extends UniEntity {
    public static RelativeUrl = 'agreements';
    public static EntityType = 'Agreement';

    public _createguid: string;
    public AppliesTo: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public ID: number;
    public Name: string;
    public Template: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public ValidFrom: Date;
    public CustomFields: any;
}


export class BankIdentifierCode extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'BankIdentifierCode';

    public _createguid: string;
    public BankIdentifier: string;
    public BankName: string;
    public Bic: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public ID: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CustomFields: any;
}


export class CompanyType extends UniEntity {
    public static RelativeUrl = 'companytypes';
    public static EntityType = 'CompanyType';

    public _createguid: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public DefaultAccountVisibilityGroupID: number;
    public DefaultPlanType: PlanTypeEnum;
    public Deleted: boolean;
    public Description: string;
    public FullName: string;
    public ID: number;
    public Name: string;
    public Priority: boolean;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CustomFields: any;
}


export class Confirmation extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Confirmation';

    public _createguid: string;
    public Code: string;
    public CompanyName: string;
    public ContractType: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public DisplayName: string;
    public Email: string;
    public ExpirationDate: Date;
    public ID: number;
    public Phone: string;
    public PostalCode: string;
    public SignUpReferrer: string;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CustomFields: any;
}


export class Country extends UniEntity {
    public static RelativeUrl = 'countries';
    public static EntityType = 'Country';

    public _createguid: string;
    public CountryCode: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public CurrencyRateSource: string;
    public DefaultCurrencyCode: string;
    public Deleted: boolean;
    public ID: number;
    public Name: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CustomFields: any;
}


export class Currency extends UniEntity {
    public static RelativeUrl = 'currencies';
    public static EntityType = 'Currency';

    public _createguid: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public CurrencyDate: LocalDate;
    public Deleted: boolean;
    public ExchangeRate: number;
    public Factor: number;
    public FromCurrencyCodeID: number;
    public ID: number;
    public Source: CurrencySourceEnum;
    public ToCurrencyCodeID: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public FromCurrencyCode: CurrencyCode;
    public ToCurrencyCode: CurrencyCode;
    public CustomFields: any;
}


export class CurrencyCode extends UniEntity {
    public static RelativeUrl = 'currencycodes';
    public static EntityType = 'CurrencyCode';

    public _createguid: string;
    public Code: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public Description: string;
    public ID: number;
    public Name: string;
    public ShortCode: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CustomFields: any;
}


export class DebtCollectionAutomation extends UniEntity {
    public static RelativeUrl = 'debtcollectionautomation';
    public static EntityType = 'DebtCollectionAutomation';

    public _createguid: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public DebtCollectionSettingsID: number;
    public Deleted: boolean;
    public Description: string;
    public ID: number;
    public Name: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public DebtCollectionSettings: DebtCollectionSettings;
    public CustomFields: any;
}


export class EmploymentValidValues extends UniEntity {
    public static RelativeUrl = 'employmentvalidvalues';
    public static EntityType = 'EmploymentValidValues';

    public _createguid: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public employment: TypeOfEmployment;
    public EndDate: boolean;
    public HourRate: boolean;
    public HoursPerWeek: boolean;
    public ID: number;
    public JobCode: boolean;
    public JobName: boolean;
    public LastSalaryChangeDate: boolean;
    public LastWorkPercentChange: boolean;
    public MonthRate: boolean;
    public PaymentType: RemunerationType;
    public RemunerationType: boolean;
    public SeniorityDate: boolean;
    public ShipReg: boolean;
    public ShipType: boolean;
    public StartDate: boolean;
    public TradeArea: boolean;
    public typeOfEmployment: boolean;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public UserDefinedRate: boolean;
    public WorkingHoursScheme: boolean;
    public WorkPercent: boolean;
    public CustomFields: any;
}


export class FinancialDeadline extends UniEntity {
    public static RelativeUrl = 'deadlines';
    public static EntityType = 'FinancialDeadline';

    public _createguid: string;
    public AdditionalInfo: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deadline: LocalDate;
    public Deleted: boolean;
    public ID: number;
    public Name: string;
    public PassableDueDate: number;
    public StatusCode: number;
    public Type: FinancialDeadlineType;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CustomFields: any;
}


export class Municipal extends UniEntity {
    public static RelativeUrl = 'Municipals';
    public static EntityType = 'Municipal';

    public _createguid: string;
    public CountyName: string;
    public CountyNo: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public ID: number;
    public MunicipalityName: string;
    public MunicipalityNo: string;
    public Retired: boolean;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CustomFields: any;
}


export class MunicipalAGAZone extends UniEntity {
    public static RelativeUrl = 'MunicipalAGAZones';
    public static EntityType = 'MunicipalAGAZone';

    public _createguid: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public ID: number;
    public MunicipalityNo: string;
    public Startdate: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public ZoneID: number;
    public CustomFields: any;
}


export class PaymentBatchType extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'PaymentBatchType';

    public _createguid: string;
    public Code: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public Description: string;
    public ID: number;
    public Name: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CustomFields: any;
}


export class PaymentCode extends UniEntity {
    public static RelativeUrl = 'paymentCodes';
    public static EntityType = 'PaymentCode';

    public _createguid: string;
    public Code: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public Description: string;
    public ID: number;
    public Name: string;
    public PaymentGroup: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CustomFields: any;
}


export class PostalCode extends UniEntity {
    public static RelativeUrl = 'postalcodes';
    public static EntityType = 'PostalCode';

    public _createguid: string;
    public City: string;
    public Code: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public ID: number;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CustomFields: any;
}


export class StaticRegister extends UniEntity {
    public static RelativeUrl = 'StaticRegister';
    public static EntityType = 'StaticRegister';

    public _createguid: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public ID: number;
    public Registry: string;
    public stamp: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CustomFields: any;
}


export class STYRKCode extends UniEntity {
    public static RelativeUrl = 'STYRK';
    public static EntityType = 'STYRKCode';

    public _createguid: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public ID: number;
    public lnr: number;
    public styrk: string;
    public tittel: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public ynr: number;
    public CustomFields: any;
}


export class Language extends UniEntity {
    public static RelativeUrl = 'languages';
    public static EntityType = 'Language';

    public _createguid: string;
    public Code: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public FallBackLanguageID: number;
    public ID: number;
    public Name: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Translations: Array<Translation>;
    public CustomFields: any;
}


export class Translatable extends UniEntity {
    public static RelativeUrl = 'translatables';
    public static EntityType = 'Translatable';

    public _createguid: string;
    public Column: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public Description: string;
    public ID: number;
    public Meaning: string;
    public Model: string;
    public Module: i18nModule;
    public Static: boolean;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Value: string;
    public Translations: Array<Translation>;
    public CustomFields: any;
}


export class Translation extends UniEntity {
    public static RelativeUrl = 'translations';
    public static EntityType = 'Translation';

    public _createguid: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public ID: number;
    public LanguageID: number;
    public TranslatableID: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Value: string;
    public Language: Language;
    public Translatable: Translatable;
    public CustomFields: any;
}


export class UserVerification extends UniEntity {
    public static RelativeUrl = 'user-verifications';
    public static EntityType = 'UserVerification';

    public _createguid: string;
    public CompanyId: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public DisplayName: string;
    public Email: string;
    public ExpirationDate: Date;
    public ID: number;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public UserId: number;
    public VerificationCode: string;
    public VerificationDate: Date;
    public CustomFields: any;
}


export class VatCodeGroupSetup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'VatCodeGroupSetup';

    public _createguid: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public ID: number;
    public Name: string;
    public No: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CustomFields: any;
}


export class VatPostSetup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'VatPostSetup';

    public _createguid: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public HasTaxAmount: boolean;
    public HasTaxBasis: boolean;
    public ID: number;
    public Name: string;
    public No: string;
    public ReportAsNegativeAmount: boolean;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public VatCodeGroupSetupNo: string;
    public CustomFields: any;
}


export class VatReportForm extends UniEntity {
    public static RelativeUrl = 'vatreportforms';
    public static EntityType = 'VatReportForm';

    public _createguid: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public Description: string;
    public ID: number;
    public Name: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CustomFields: any;
}


export class VatReportReferenceSetup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'VatReportReferenceSetup';

    public _createguid: string;
    public AccountNumber: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public ID: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public VatCode: string;
    public VatPostNo: string;
    public CustomFields: any;
}


export class VatTypeSetup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'VatTypeSetup';

    public _createguid: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public DefaultVisible: boolean;
    public Deleted: boolean;
    public DirectJournalEntryOnly: boolean;
    public ID: number;
    public IncomingAccountNumber: number;
    public IsCompensated: boolean;
    public IsNotVatRegistered: boolean;
    public Name: string;
    public OutgoingAccountNumber: number;
    public OutputVat: boolean;
    public ReversedTaxDutyVat: boolean;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public VatCode: string;
    public VatCodeGroupNo: string;
    public VatTypeSetupPercentages: Array<VatTypeSetupPercentage>;
    public CustomFields: any;
}


export class VatTypeSetupPercentage extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'VatTypeSetupPercentage';

    public _createguid: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public ID: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public ValidFrom: LocalDate;
    public ValidTo: LocalDate;
    public VatPercent: number;
    public VatTypeSetupID: number;
    public CustomFields: any;
}


export class CompanyReport extends UniEntity {
    public static RelativeUrl = 'company-report';
    public static EntityType = 'CompanyReport';

    public _createguid: string;
    public CompanyKey: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public ID: number;
    public ReportDefinitionID: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CustomFields: any;
}


export class ReportDefinition extends UniEntity {
    public static RelativeUrl = 'report-definitions';
    public static EntityType = 'ReportDefinition';

    public _createguid: string;
    public Category: string;
    public CategoryLabel: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public Description: string;
    public ID: number;
    public IsStandard: boolean;
    public Md5: string;
    public Name: string;
    public ReportSource: string;
    public ReportType: number;
    public TemplateLinkId: string;
    public UniqueReportID: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Version: string;
    public Visible: boolean;
    public CustomFields: any;
}


export class ReportDefinitionDataSource extends UniEntity {
    public static RelativeUrl = 'report-definition-data-sources';
    public static EntityType = 'ReportDefinitionDataSource';

    public _createguid: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public DataSourceUrl: string;
    public Deleted: boolean;
    public ID: number;
    public Name: string;
    public ReportDefinitionId: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CustomFields: any;
}


export class ReportDefinitionParameter extends UniEntity {
    public static RelativeUrl = 'report-definition-parameters';
    public static EntityType = 'ReportDefinitionParameter';

    public _createguid: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public DefaultValue: string;
    public DefaultValueList: string;
    public DefaultValueLookupType: string;
    public DefaultValueSource: string;
    public Deleted: boolean;
    public ID: number;
    public Label: string;
    public Name: string;
    public ReportDefinitionId: number;
    public Type: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Visible: boolean;
    public CustomFields: any;
}


export class PeriodSeries extends UniEntity {
    public static RelativeUrl = 'period-series';
    public static EntityType = 'PeriodSeries';

    public _createguid: string;
    public Active: boolean;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public ID: number;
    public Name: string;
    public SeriesType: PeriodSeriesType;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CustomFields: any;
}


export class PeriodTemplate extends UniEntity {
    public static RelativeUrl = 'period-templates';
    public static EntityType = 'PeriodTemplate';

    public _createguid: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public FromDate: LocalDate;
    public ID: number;
    public Name: string;
    public No: number;
    public PeriodSeriesID: number;
    public ToDate: LocalDate;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public PeriodSeries: PeriodSeries;
    public CustomFields: any;
}


export class Model extends UniEntity {
    public static RelativeUrl = 'models';
    public static EntityType = 'Model';

    public _createguid: string;
    public Admin: boolean;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public Description: string;
    public ID: number;
    public Label: string;
    public LabelPlural: string;
    public Name: string;
    public Shared: boolean;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Fields: Array<Field>;
    public CustomFields: any;
}


export class Field extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Field';

    public _createguid: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public Description: string;
    public HelpText: string;
    public ID: number;
    public Label: string;
    public ModelID: number;
    public Name: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Model: Model;
    public CustomFields: any;
}


export class Notification extends UniEntity {
    public static RelativeUrl = 'notifications';
    public static EntityType = 'Notification';

    public _createguid: string;
    public CompanyKey: string;
    public CompanyName: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public EntityID: number;
    public EntityType: string;
    public ID: number;
    public Message: string;
    public RecipientID: string;
    public SenderDisplayName: string;
    public SourceEntityID: number;
    public SourceEntityType: string;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CustomFields: any;
}


export class CompanySettings extends UniEntity {
    public static RelativeUrl = 'companysettings';
    public static EntityType = 'CompanySettings';

    public _createguid: string;
    public AcceptableDelta4CustomerPayment: number;
    public AcceptableDelta4CustomerPaymentAccountID: number;
    public AccountGroupSetID: number;
    public AccountingLockedDate: LocalDate;
    public AccountVisibilityGroupID: number;
    public AgioGainAccountID: number;
    public AgioLossAccountID: number;
    public APActivated: boolean;
    public APContactID: number;
    public APGuid: string;
    public APIncludeAttachment: boolean;
    public AutoDistributeInvoice: boolean;
    public AutoJournalPayment: boolean;
    public BankChargeAccountID: number;
    public BaseCurrencyCodeID: number;
    public BatchInvoiceMinAmount: number;
    public BookCustomerInvoiceOnDeliveryDate: boolean;
    public CompanyBankAccountID: number;
    public CompanyName: string;
    public CompanyRegistered: boolean;
    public CompanyTypeID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public CustomerAccountID: number;
    public CustomerCreditDays: number;
    public CustomerInvoiceReminderSettingsID: number;
    public DefaultAddressID: number;
    public DefaultCustomerInvoiceReportID: number;
    public DefaultCustomerOrderReportID: number;
    public DefaultCustomerQuoteReportID: number;
    public DefaultDistributionsID: number;
    public DefaultEmailID: number;
    public DefaultPhoneID: number;
    public DefaultSalesAccountID: number;
    public DefaultTOFCurrencySettingsID: number;
    public Deleted: boolean;
    public Factoring: number;
    public FactoringEmailID: number;
    public FactoringNumber: number;
    public ForceSupplierInvoiceApproval: boolean;
    public GLN: string;
    public HasAutobank: boolean;
    public HideInActiveCustomers: boolean;
    public HideInActiveSuppliers: boolean;
    public ID: number;
    public IgnorePaymentsWithoutEndToEndID: boolean;
    public InterrimPaymentAccountID: number;
    public InterrimRemitAccountID: number;
    public Localization: string;
    public LogoAlign: number;
    public LogoFileID: number;
    public LogoHideField: number;
    public NetsIntegrationActivated: boolean;
    public OfficeMunicipalityNo: string;
    public OrganizationNumber: string;
    public PaymentBankAgreementNumber: string;
    public PaymentBankIdentification: string;
    public PeriodSeriesAccountID: number;
    public PeriodSeriesVatID: number;
    public RoundingNumberOfDecimals: number;
    public RoundingType: RoundingType;
    public SalaryBankAccountID: number;
    public SaveCustomersFromQuoteAsLead: boolean;
    public SettlementVatAccountID: number;
    public ShowKIDOnCustomerInvoice: boolean;
    public ShowNumberOfDecimals: number;
    public StatusCode: number;
    public SupplierAccountID: number;
    public TaxableFromDate: LocalDate;
    public TaxableFromLimit: number;
    public TaxBankAccountID: number;
    public TaxMandatory: boolean;
    public TaxMandatoryType: number;
    public TwoStageAutobankEnabled: boolean;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public UseNetsIntegration: boolean;
    public UseOcrInterpretation: boolean;
    public UsePaymentBankValues: boolean;
    public UseXtraPaymentOrgXmlTag: boolean;
    public VatLockedDate: LocalDate;
    public VatReportFormID: number;
    public WebAddress: string;
    public XtraPaymentOrgXmlTagValue: string;
    public DefaultAddress: Address;
    public DefaultPhone: Phone;
    public DefaultEmail: Email;
    public SupplierAccount: Account;
    public CustomerAccount: Account;
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

    public _createguid: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public EntityType: string;
    public ID: number;
    public Name: string;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Elements: Array<DistributionPlanElement>;
    public CustomFields: any;
}


export class DistributionPlanElement extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'DistributionPlanElement';

    public _createguid: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public DistributionPlanElementTypeID: number;
    public DistributionPlanID: number;
    public ID: number;
    public Priority: number;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public ElementType: DistributionPlanElementType;
    public CustomFields: any;
}


export class DistributionPlanElementType extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'DistributionPlanElementType';

    public _createguid: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public ID: number;
    public Name: string;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public LegalEntities: Array<DistributionPlanElementTypeLegalEntity>;
    public CustomFields: any;
}


export class DistributionPlanElementTypeLegalEntity extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'DistributionPlanElementTypeLegalEntity';

    public _createguid: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public DistributionPlanElementTypeID: number;
    public EntityType: string;
    public ID: number;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CustomFields: any;
}


export class Distributions extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Distributions';

    public _createguid: string;
    public AnnualStatementDistributionPlanID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public CustomerInvoiceDistributionPlanID: number;
    public CustomerInvoiceReminderDistributionPlanID: number;
    public CustomerOrderDistributionPlanID: number;
    public CustomerQuoteDistributionPlanID: number;
    public Deleted: boolean;
    public ID: number;
    public PayCheckDistributionPlanID: number;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
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

    public _createguid: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public ID: number;
    public Name: string;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CustomFields: any;
}


export class EmailLog extends UniEntity {
    public static RelativeUrl = 'emails';
    public static EntityType = 'EmailLog';

    public _createguid: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public DistributeAt: LocalDate;
    public EntityDisplayValue: string;
    public EntityID: number;
    public EntityType: string;
    public ExternalMessage: string;
    public ExternalReference: string;
    public From: string;
    public ID: number;
    public JobRunExternalRef: string;
    public JobRunID: number;
    public StatusCode: number;
    public Subject: string;
    public To: string;
    public Type: SharingType;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CustomFields: any;
}


export class Eventplan extends UniEntity {
    public static RelativeUrl = 'eventplans';
    public static EntityType = 'Eventplan';

    public _createguid: string;
    public Active: boolean;
    public Cargo: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public ExpressionFilter: string;
    public ID: number;
    public IsSystemPlan: boolean;
    public JobNames: string;
    public ModelFilter: string;
    public Name: string;
    public OperationFilter: string;
    public PlanType: EventplanType;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Subscribers: Array<EventSubscriber>;
    public CustomFields: any;
}


export class EventSubscriber extends UniEntity {
    public static RelativeUrl = 'eventsubscribers';
    public static EntityType = 'EventSubscriber';

    public _createguid: string;
    public Active: boolean;
    public Authorization: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public Endpoint: string;
    public EventplanID: number;
    public Headers: string;
    public ID: number;
    public Name: string;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Eventplan: Eventplan;
    public CustomFields: any;
}


export class Period extends UniEntity {
    public static RelativeUrl = 'periodes';
    public static EntityType = 'Period';

    public _createguid: string;
    public AccountYear: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public FromDate: LocalDate;
    public ID: number;
    public Name: string;
    public No: number;
    public PeriodSeriesID: number;
    public PeriodTemplateID: number;
    public StatusCode: number;
    public ToDate: LocalDate;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public PeriodTemplate: PeriodTemplate;
    public PeriodSeries: PeriodSeries;
    public CustomFields: any;
}


export class PredefinedDescription extends UniEntity {
    public static RelativeUrl = 'predefineddescriptions';
    public static EntityType = 'PredefinedDescription';

    public _createguid: string;
    public Code: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public Description: string;
    public ID: number;
    public StatusCode: number;
    public Type: PredefinedDescriptionType;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CustomFields: any;
}


export class ProductCategory extends UniEntity {
    public static RelativeUrl = 'productcategories';
    public static EntityType = 'ProductCategory';

    public _createguid: string;
    public Comment: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public Depth: number;
    public Description: string;
    public ID: number;
    public Lft: number;
    public Name: string;
    public ParentID: number;
    public Rght: number;
    public Status: number;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CustomFields: any;
}


export class ProductCategoryLink extends UniEntity {
    public static RelativeUrl = 'productcategorylinks';
    public static EntityType = 'ProductCategoryLink';

    public _createguid: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public ID: number;
    public ProductCategoryID: number;
    public ProductID: number;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public ProductCategory: ProductCategory;
    public CustomFields: any;
}


export class Sharing extends UniEntity {
    public static RelativeUrl = 'sharings';
    public static EntityType = 'Sharing';

    public _createguid: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public DistributeAt: LocalDate;
    public EntityDisplayValue: string;
    public EntityID: number;
    public EntityType: string;
    public ExternalMessage: string;
    public ExternalReference: string;
    public From: string;
    public ID: number;
    public JobRunExternalRef: string;
    public JobRunID: number;
    public StatusCode: number;
    public Subject: string;
    public To: string;
    public Type: SharingType;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CustomFields: any;
}


export class StatusLog extends UniEntity {
    public static RelativeUrl = 'statuslogs';
    public static EntityType = 'StatusLog';

    public _createguid: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public EntityID: number;
    public EntityType: string;
    public FromStatus: number;
    public ID: number;
    public ToStatus: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CustomFields: any;
}


export class Tracelink extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Tracelink';

    public _createguid: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Date: Date;
    public Deleted: boolean;
    public DestinationEntityName: string;
    public DestinationInstanceID: number;
    public ID: number;
    public SourceEntityName: string;
    public SourceInstanceID: number;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CustomFields: any;
}


export class User extends UniEntity {
    public static RelativeUrl = 'users';
    public static EntityType = 'User';

    public _createguid: string;
    public BankIntegrationUserName: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public DisplayName: string;
    public Email: string;
    public GlobalIdentity: string;
    public HasAgreedToImportDisclaimer: boolean;
    public ID: number;
    public IsAutobankAdmin: boolean;
    public LastLogin: Date;
    public PhoneNumber: string;
    public Protected: boolean;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public UserName: string;
    public CustomFields: any;
}


export class UniQueryDefinition extends UniEntity {
    public static RelativeUrl = 'uniquerydefinitions';
    public static EntityType = 'UniQueryDefinition';

    public _createguid: string;
    public Category: string;
    public ClickParam: string;
    public ClickUrl: string;
    public Code: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public Description: string;
    public ID: number;
    public IsShared: boolean;
    public MainModelName: string;
    public ModuleID: number;
    public Name: string;
    public SortIndex: number;
    public StatusCode: number;
    public SystemGeneratedQuery: boolean;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public UserID: number;
    public UniQueryFilters: Array<UniQueryFilter>;
    public UniQueryFields: Array<UniQueryField>;
    public CustomFields: any;
}


export class UniQueryField extends UniEntity {
    public static RelativeUrl = 'uniqueryfields';
    public static EntityType = 'UniQueryField';

    public _createguid: string;
    public Alias: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public Field: string;
    public FieldType: number;
    public Header: string;
    public ID: number;
    public Index: number;
    public Path: string;
    public StatusCode: number;
    public SumFunction: string;
    public UniQueryDefinitionID: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Width: string;
    public CustomFields: any;
}


export class UniQueryFilter extends UniEntity {
    public static RelativeUrl = 'uniqueryfilters';
    public static EntityType = 'UniQueryFilter';

    public _createguid: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public Field: string;
    public Group: number;
    public ID: number;
    public Operator: string;
    public StatusCode: number;
    public UniQueryDefinitionID: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Value: string;
    public CustomFields: any;
}


export class Team extends UniEntity {
    public static RelativeUrl = 'teams';
    public static EntityType = 'Team';

    public _createguid: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public Depth: number;
    public DimensionsID: number;
    public ID: number;
    public Lft: number;
    public Name: string;
    public ParentID: number;
    public Rght: number;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Dimensions: Dimensions;
    public Positions: Array<TeamPosition>;
    public CustomFields: any;
}


export class TeamPosition extends UniEntity {
    public static RelativeUrl = 'teampositions';
    public static EntityType = 'TeamPosition';

    public _createguid: string;
    public ApproveOrder: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public FromDate: LocalDate;
    public ID: number;
    public Position: TeamPositionEnum;
    public RelatedSharedRoleId: number;
    public StatusCode: number;
    public TeamID: number;
    public ToDate: LocalDate;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public UserID: number;
    public Team: Team;
    public CustomFields: any;
}


export class ApprovalRule extends UniEntity {
    public static RelativeUrl = 'approvalrules';
    public static EntityType = 'ApprovalRule';

    public _createguid: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public Description: string;
    public ID: number;
    public IndustryCodes: string;
    public Keywords: string;
    public RuleType: ApprovalRuleType;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Steps: Array<ApprovalRuleStep>;
    public CustomFields: any;
}


export class ApprovalRuleStep extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ApprovalRuleStep';

    public _createguid: string;
    public ApprovalRuleID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public ID: number;
    public Limit: number;
    public StatusCode: number;
    public StepNumber: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public UserID: number;
    public ApprovalRule: ApprovalRule;
    public User: User;
    public CustomFields: any;
}


export class ApprovalSubstitute extends UniEntity {
    public static RelativeUrl = 'approvalsubstitutes';
    public static EntityType = 'ApprovalSubstitute';

    public _createguid: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public FromDate: LocalDate;
    public ID: number;
    public StatusCode: number;
    public SubstituteUserID: number;
    public ToDate: LocalDate;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public UserID: number;
    public User: User;
    public SubstituteUser: User;
    public CustomFields: any;
}


export class TaskApprovalPlan extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'TaskApprovalPlan';

    public _createguid: string;
    public Amount: number;
    public ApprovalID: number;
    public ApprovalRuleID: number;
    public Comment: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public ID: number;
    public Limit: number;
    public StatusCode: number;
    public StepNumber: number;
    public TaskID: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public UserID: number;
    public Task: Task;
    public Approval: Approval;
    public ApprovalRule: ApprovalRule;
    public User: User;
    public CustomFields: any;
}


export class Status extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Status';

    public _createguid: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public Description: string;
    public EntityType: string;
    public ID: number;
    public Order: number;
    public StatusCategoryID: number;
    public StatusCode: number;
    public System: boolean;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public StatusCategory: StatusCategory;
    public CustomFields: any;
}


export class StatusCategory extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'StatusCategory';

    public _createguid: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public ID: number;
    public Name: string;
    public StatusCategoryCode: StatusCategoryCode;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CustomFields: any;
}


export class Transition extends UniEntity {
    public static RelativeUrl = 'transitions';
    public static EntityType = 'Transition';

    public _createguid: string;
    public Controller: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public EntityType: string;
    public ID: number;
    public MethodName: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CustomFields: any;
}


export class TransitionThreshold extends UniEntity {
    public static RelativeUrl = 'thresholds';
    public static EntityType = 'TransitionThreshold';

    public _createguid: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public Disabled: boolean;
    public ID: number;
    public Operation: OperationType;
    public Operator: Operator;
    public PropertyName: string;
    public RejectStatusCode: number;
    public SharedApproveTransitionId: number;
    public SharedRejectTransitionId: number;
    public SharedRoleId: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Value: string;
    public CustomFields: any;
}


export class TransitionThresholdApproval extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'TransitionThresholdApproval';

    public _createguid: string;
    public ApprovalID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public ID: number;
    public Operation: OperationType;
    public Operator: Operator;
    public PropertyName: string;
    public RejectStatusCode: number;
    public SharedApproveTransitionId: number;
    public SharedRejectTransitionId: number;
    public SharedRoleId: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Value: string;
    public Approval: Approval;
    public CustomFields: any;
}


export class Approval extends UniEntity {
    public static RelativeUrl = 'approvals';
    public static EntityType = 'Approval';

    public _createguid: string;
    public Amount: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public ID: number;
    public SharedRoleId: number;
    public StatusCode: number;
    public TaskID: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public UserID: number;
    public Thresholds: Array<TransitionThresholdApproval>;
    public Task: Task;
    public User: User;
    public CustomFields: any;
}


export class Task extends UniEntity {
    public static RelativeUrl = 'tasks';
    public static EntityType = 'Task';

    public _createguid: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public EntityID: number;
    public ID: number;
    public ModelID: number;
    public RejectStatusCode: number;
    public SharedApproveTransitionId: number;
    public SharedRejectTransitionId: number;
    public SharedRoleId: number;
    public StatusCode: number;
    public Title: string;
    public Type: TaskType;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public UserID: number;
    public Model: Model;
    public Approvals: Array<Approval>;
    public ApprovalPlan: Array<TaskApprovalPlan>;
    public User: User;
    public CustomFields: any;
}


export class TransitionFlow extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'TransitionFlow';

    public _createguid: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public EntityType: string;
    public FromStatusID: number;
    public ID: number;
    public ToStatusID: number;
    public TransitionID: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public FromStatus: Status;
    public ToStatus: Status;
    public Transition: Transition;
    public CustomFields: any;
}


export class Project extends UniEntity {
    public static RelativeUrl = 'projects';
    public static EntityType = 'Project';

    public _createguid: string;
    public Amount: number;
    public CostPrice: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public Description: string;
    public DimensionsID: number;
    public EndDate: LocalDate;
    public ID: number;
    public IsUsed: boolean;
    public Name: string;
    public PlannedEnddate: LocalDate;
    public PlannedStartdate: LocalDate;
    public Price: number;
    public ProjectCustomerID: number;
    public ProjectLeadName: string;
    public ProjectNumber: string;
    public ProjectNumberNumeric: number;
    public ProjectNumberSeriesID: number;
    public StartDate: LocalDate;
    public StatusCode: number;
    public Total: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public WorkPlaceAddressID: number;
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

    public _createguid: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public ID: number;
    public Name: string;
    public ProjectID: number;
    public Responsibility: string;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public UserID: number;
    public ProjectUser: User;
    public CustomFields: any;
}


export class ProjectResourceSchedule extends UniEntity {
    public static RelativeUrl = 'projects-schedules-resources';
    public static EntityType = 'ProjectResourceSchedule';

    public _createguid: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public ID: number;
    public ProjectResourceID: number;
    public ProjectTaskID: number;
    public ProjectTaskScheduleID: number;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CustomFields: any;
}


export class ProjectTask extends UniEntity {
    public static RelativeUrl = 'projects-tasks';
    public static EntityType = 'ProjectTask';

    public _createguid: string;
    public Amount: number;
    public CostPrice: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public Description: string;
    public EndDate: LocalDate;
    public ID: number;
    public Name: string;
    public Number: string;
    public Price: number;
    public ProjectID: number;
    public StartDate: LocalDate;
    public StatusCode: number;
    public SuggestedNumber: string;
    public Total: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public ProjectTaskSchedules: Array<ProjectTaskSchedule>;
    public ProjectTaskResources: Array<ProjectResourceSchedule>;
    public CustomFields: any;
}


export class ProjectTaskSchedule extends UniEntity {
    public static RelativeUrl = 'projects-tasks-schedules';
    public static EntityType = 'ProjectTaskSchedule';

    public _createguid: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public EndDate: LocalDate;
    public ID: number;
    public ProjectTaskID: number;
    public StartDate: LocalDate;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public ScheduleResources: Array<ProjectResourceSchedule>;
    public CustomFields: any;
}


export class BarnepassProduct extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'BarnepassProduct';

    public _createguid: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public ID: number;
    public ProductID: number;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Product: Product;
    public CustomFields: any;
}


export class Product extends UniEntity {
    public static RelativeUrl = 'products';
    public static EntityType = 'Product';

    public _createguid: string;
    public AccountID: number;
    public AverageCost: number;
    public CalculateGrossPriceBasedOnNetPrice: boolean;
    public CostPrice: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public DefaultProductCategoryID: number;
    public Deleted: boolean;
    public Description: string;
    public DimensionsID: number;
    public ID: number;
    public ImageFileID: number;
    public ListPrice: number;
    public Name: string;
    public PartName: string;
    public PriceExVat: number;
    public PriceIncVat: number;
    public StatusCode: number;
    public Type: ProductTypeEnum;
    public Unit: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public VariansParentID: number;
    public VatTypeID: number;
    public VatType: VatType;
    public Account: Account;
    public ProductCategoryLinks: Array<ProductCategoryLink>;
    public Dimensions: Dimensions;
    public CustomFields: any;
}


export class NumberSeries extends UniEntity {
    public static RelativeUrl = 'number-series';
    public static EntityType = 'NumberSeries';

    public _createguid: string;
    public AccountYear: number;
    public Comment: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public Disabled: boolean;
    public DisplayName: string;
    public Empty: boolean;
    public FromNumber: number;
    public ID: number;
    public IsDefaultForTask: boolean;
    public MainAccountID: number;
    public Name: string;
    public NextNumber: number;
    public NumberLock: boolean;
    public NumberSeriesTaskID: number;
    public NumberSeriesTypeID: number;
    public StatusCode: number;
    public System: boolean;
    public ToNumber: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public UseNumbersFromNumberSeriesID: number;
    public NumberSeriesType: NumberSeriesType;
    public UseNumbersFromNumberSeries: NumberSeries;
    public NumberSeriesTask: NumberSeriesTask;
    public MainAccount: Account;
    public CustomFields: any;
}


export class NumberSeriesInvalidOverlap extends UniEntity {
    public static RelativeUrl = 'number-series-invalid-overlaps';
    public static EntityType = 'NumberSeriesInvalidOverlap';

    public _createguid: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public ID: number;
    public NumberSerieTypeAID: number;
    public NumberSerieTypeBID: number;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public NumberSerieTypeA: NumberSeriesType;
    public NumberSerieTypeB: NumberSeriesType;
    public CustomFields: any;
}


export class NumberSeriesTask extends UniEntity {
    public static RelativeUrl = 'number-series-tasks';
    public static EntityType = 'NumberSeriesTask';

    public _createguid: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public EntityType: string;
    public ID: number;
    public Name: string;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public NumberSeries: Array<NumberSeries>;
    public CustomFields: any;
}


export class NumberSeriesType extends UniEntity {
    public static RelativeUrl = 'number-series-types';
    public static EntityType = 'NumberSeriesType';

    public _createguid: string;
    public CanHaveSeveralActiveSeries: boolean;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public EntityField: string;
    public EntitySeriesIDField: string;
    public EntityType: string;
    public ID: number;
    public Name: string;
    public StatusCode: number;
    public System: boolean;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Yearly: boolean;
    public Series: Array<NumberSeries>;
    public CustomFields: any;
}


export class EncryptionInfo extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'EncryptionInfo';

    public _createguid: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public description: string;
    public ID: number;
    public password: string;
    public type: Type;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CustomFields: any;
}


export class File extends UniEntity {
    public static RelativeUrl = 'files/{entitytype}/{entityid}';
    public static EntityType = 'File';

    public _createguid: string;
    public ContentType: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public Description: string;
    public encryptionID: number;
    public ID: number;
    public Md5: string;
    public Name: string;
    public OCRData: string;
    public Pages: number;
    public PermaLink: string;
    public Size: string;
    public StatusCode: number;
    public StorageReference: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public UploadSlot: string;
    public FileTags: Array<FileTag>;
    public EntityLinks: Array<FileEntityLink>;
    public CustomFields: any;
}


export class FileTag extends UniEntity {
    public static RelativeUrl = 'filetags';
    public static EntityType = 'FileTag';

    public _createguid: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public FileID: number;
    public ID: number;
    public Status: number;
    public TagName: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public File: File;
    public CustomFields: any;
}


export class FileEntityLink extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'FileEntityLink';

    public _createguid: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public EntityID: number;
    public EntityType: string;
    public FileID: number;
    public ID: number;
    public IsAttachment: boolean;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public File: File;
    public CustomFields: any;
}


export class ElsaUsageLog extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ElsaUsageLog';

    public _createguid: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public DateLogged: Date;
    public Deleted: boolean;
    public ExternalReference: string;
    public ID: number;
    public ProductType: string;
    public Quantity: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CustomFields: any;
}


export class AccessPointFormat extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AccessPointFormat';

    public _createguid: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public ID: number;
    public IncommingID: number;
    public Label: string;
    public Name: string;
    public OutgoingID: number;
    public ResourceName: string;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CustomFields: any;
}


export class EHFLog extends UniEntity {
    public static RelativeUrl = 'ehf';
    public static EntityType = 'EHFLog';

    public _createguid: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public DistributeAt: LocalDate;
    public EntityDisplayValue: string;
    public EntityID: number;
    public EntityType: string;
    public ExternalMessage: string;
    public ExternalReference: string;
    public From: string;
    public ID: number;
    public JobRunExternalRef: string;
    public JobRunID: number;
    public StatusCode: number;
    public Subject: string;
    public To: string;
    public Type: SharingType;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CustomFields: any;
}


export class Department extends UniEntity {
    public static RelativeUrl = 'departments';
    public static EntityType = 'Department';

    public _createguid: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public DepartmentManagerName: string;
    public DepartmentNumber: string;
    public DepartmentNumberNumeric: number;
    public DepartmentNumberSeriesID: number;
    public Description: string;
    public ID: number;
    public Name: string;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public DepartmentNumberSeries: NumberSeries;
    public CustomFields: any;
}


export class Dimension10 extends UniEntity {
    public static RelativeUrl = 'Dimension10';
    public static EntityType = 'Dimension10';

    public _createguid: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public Description: string;
    public ID: number;
    public Name: string;
    public Number: string;
    public NumberNumeric: number;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CustomFields: any;
}


export class Dimension5 extends UniEntity {
    public static RelativeUrl = 'Dimension5';
    public static EntityType = 'Dimension5';

    public _createguid: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public Description: string;
    public ID: number;
    public Name: string;
    public Number: string;
    public NumberNumeric: number;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CustomFields: any;
}


export class Dimension6 extends UniEntity {
    public static RelativeUrl = 'Dimension6';
    public static EntityType = 'Dimension6';

    public _createguid: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public Description: string;
    public ID: number;
    public Name: string;
    public Number: string;
    public NumberNumeric: number;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CustomFields: any;
}


export class Dimension7 extends UniEntity {
    public static RelativeUrl = 'Dimension7';
    public static EntityType = 'Dimension7';

    public _createguid: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public Description: string;
    public ID: number;
    public Name: string;
    public Number: string;
    public NumberNumeric: number;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CustomFields: any;
}


export class Dimension8 extends UniEntity {
    public static RelativeUrl = 'Dimension8';
    public static EntityType = 'Dimension8';

    public _createguid: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public Description: string;
    public ID: number;
    public Name: string;
    public Number: string;
    public NumberNumeric: number;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CustomFields: any;
}


export class Dimension9 extends UniEntity {
    public static RelativeUrl = 'Dimension9';
    public static EntityType = 'Dimension9';

    public _createguid: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public Description: string;
    public ID: number;
    public Name: string;
    public Number: string;
    public NumberNumeric: number;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CustomFields: any;
}


export class Dimensions extends UniEntity {
    public static RelativeUrl = 'dimensions';
    public static EntityType = 'Dimensions';

    public _createguid: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public DepartmentID: number;
    public Dimension10ID: number;
    public Dimension5ID: number;
    public Dimension6ID: number;
    public Dimension7ID: number;
    public Dimension8ID: number;
    public Dimension9ID: number;
    public ID: number;
    public ProjectID: number;
    public ProjectTaskID: number;
    public RegionID: number;
    public ResponsibleID: number;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
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
    public DepartmentName: string;
    public DepartmentNumber: string;
    public Dimension10Name: string;
    public Dimension10Number: string;
    public Dimension5Name: string;
    public Dimension5Number: string;
    public Dimension6Name: string;
    public Dimension6Number: string;
    public Dimension7Name: string;
    public Dimension7Number: string;
    public Dimension8Name: string;
    public Dimension8Number: string;
    public Dimension9Name: string;
    public Dimension9Number: string;
    public DimensionsID: number;
    public ID: number;
    public ProjectName: string;
    public ProjectNumber: string;
    public ProjectTaskName: string;
    public ProjectTaskNumber: string;
    public RegionCode: string;
    public RegionName: string;
    public ResponsibleName: string;
}


export class DimensionSettings extends UniEntity {
    public static RelativeUrl = 'dimensionsettings';
    public static EntityType = 'DimensionSettings';

    public _createguid: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public Dimension: number;
    public ID: number;
    public IsActive: boolean;
    public Label: string;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CustomFields: any;
}


export class Region extends UniEntity {
    public static RelativeUrl = 'regions';
    public static EntityType = 'Region';

    public _createguid: string;
    public CountryCode: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public Description: string;
    public ID: number;
    public Name: string;
    public RegionCode: string;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CustomFields: any;
}


export class Responsible extends UniEntity {
    public static RelativeUrl = 'responsibles';
    public static EntityType = 'Responsible';

    public _createguid: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public Description: string;
    public ID: number;
    public Name: string;
    public NameOfResponsible: string;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CustomFields: any;
}


export class Contract extends UniEntity {
    public static RelativeUrl = 'contracts';
    public static EntityType = 'Contract';

    public _createguid: string;
    public ContractCode: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public Description: string;
    public Engine: ContractEngine;
    public Hash: string;
    public HashTransactionAddress: string;
    public ID: number;
    public Name: string;
    public StatusCode: number;
    public TeamsUri: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Parameters: Array<ContractParameter>;
    public Triggers: Array<ContractTrigger>;
    public RunLogs: Array<ContractRunLog>;
    public CustomFields: any;
}


export class ContractAddress extends UniEntity {
    public static RelativeUrl = 'contractaddresses';
    public static EntityType = 'ContractAddress';

    public _createguid: string;
    public Address: string;
    public Amount: number;
    public AssetAddress: string;
    public ContractAssetID: number;
    public ContractID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public EntityID: number;
    public EntityType: string;
    public ID: number;
    public StatusCode: number;
    public Type: AddressType;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Contract: Contract;
    public ContractAsset: ContractAsset;
    public CustomFields: any;
}


export class ContractAsset extends UniEntity {
    public static RelativeUrl = 'contractassets';
    public static EntityType = 'ContractAsset';

    public _createguid: string;
    public Cap: number;
    public ContractID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public ID: number;
    public IsAutoDestroy: boolean;
    public IsCosignedByDefiner: boolean;
    public IsFixedDenominations: boolean;
    public IsIssuedByDefinerOnly: boolean;
    public IsPrivate: boolean;
    public IsTransferrable: boolean;
    public SpenderAttested: boolean;
    public StatusCode: number;
    public Type: AddressType;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Contract: Contract;
    public CustomFields: any;
}


export class ContractDebugLog extends UniEntity {
    public static RelativeUrl = 'contractdebuglogs';
    public static EntityType = 'ContractDebugLog';

    public _createguid: string;
    public ContractID: number;
    public ContractRunLogID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public ID: number;
    public Message: string;
    public StatusCode: number;
    public Type: ContractEventType;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Contract: Contract;
    public ContractRunLog: ContractRunLog;
    public CustomFields: any;
}


export class ContractParameter extends UniEntity {
    public static RelativeUrl = 'contractparameters';
    public static EntityType = 'ContractParameter';

    public _createguid: string;
    public ContractID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public ID: number;
    public Name: string;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Value: string;
    public Contract: Contract;
    public CustomFields: any;
}


export class ContractRunLog extends UniEntity {
    public static RelativeUrl = 'contractrunlogs';
    public static EntityType = 'ContractRunLog';

    public _createguid: string;
    public ContractID: number;
    public ContractTriggerID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public ID: number;
    public Message: string;
    public RunTime: string;
    public StatusCode: number;
    public Type: ContractEventType;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Contract: Contract;
    public CustomFields: any;
}


export class ContractTransaction extends UniEntity {
    public static RelativeUrl = 'contracttransactions';
    public static EntityType = 'ContractTransaction';

    public _createguid: string;
    public Amount: number;
    public AssetAddress: string;
    public ContractAddressID: number;
    public ContractID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public ID: number;
    public ReceiverAddress: string;
    public SenderAddress: string;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Contract: Contract;
    public ContractAddress: ContractAddress;
    public CustomFields: any;
}


export class ContractTrigger extends UniEntity {
    public static RelativeUrl = 'contracttriggers';
    public static EntityType = 'ContractTrigger';

    public _createguid: string;
    public ContractID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public ExpressionFilter: string;
    public ID: number;
    public ModelFilter: string;
    public OperationFilter: string;
    public StatusCode: number;
    public Type: ContractEventType;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Contract: Contract;
    public CustomFields: any;
}


export class Comment extends UniEntity {
    public static RelativeUrl = 'comments';
    public static EntityType = 'Comment';

    public _createguid: string;
    public AuthorID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public EntityID: number;
    public EntityType: string;
    public ID: number;
    public StatusCode: number;
    public Text: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Mentioned: Array<Mentioned>;
    public Author: User;
    public CustomFields: any;
}


export class Mentioned extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Mentioned';

    public _createguid: string;
    public CommentID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public ID: number;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public UserID: number;
    public User: User;
    public CustomFields: any;
}


export class ApiKey extends UniEntity {
    public static RelativeUrl = 'apikeys';
    public static EntityType = 'ApiKey';

    public _createguid: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public Description: string;
    public Encrypt: boolean;
    public ExternalId: string;
    public FilterDate: LocalDate;
    public ID: number;
    public IntegrationKey: string;
    public IntegrationType: TypeOfIntegration;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Url: string;
    public CustomFields: any;
}


export class Altinn extends UniEntity {
    public static RelativeUrl = 'altinn';
    public static EntityType = 'Altinn';

    public _createguid: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public ID: number;
    public Language: string;
    public PreferredLogin: TypeOfLogin;
    public StatusCode: number;
    public SystemID: string;
    public SystemPw: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CustomFields: any;
}


export class AltinnReceipt extends UniEntity {
    public static RelativeUrl = 'altinnreceipts';
    public static EntityType = 'AltinnReceipt';

    public _createguid: string;
    public AltinnResponseData: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public ErrorText: string;
    public Form: string;
    public HasBeenRegistered: boolean;
    public ID: number;
    public ReceiptID: number;
    public StatusCode: number;
    public TimeStamp: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public UserSign: string;
    public XmlReceipt: string;
    public Signings: Array<AltinnSigning>;
    public CustomFields: any;
}


export class AltinnSigning extends UniEntity {
    public static RelativeUrl = 'altinnsigning';
    public static EntityType = 'AltinnSigning';

    public _createguid: string;
    public AltinnReceiptID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public DateSigned: Date;
    public Deleted: boolean;
    public ID: number;
    public SignatureReference: string;
    public SignatureText: string;
    public StatusCode: number;
    public StatusText: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public AltinnReceipt: AltinnReceipt;
    public CustomFields: any;
}


export class Barnepass extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Barnepass';

    public _createguid: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public ID: number;
    public inntektsaar: number;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public oppgave: Array<BarnepassOppgave>;
    public CustomFields: any;
}


export class BarnepassOppgave extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'BarnepassOppgave';

    public _createguid: string;
    public BarnepassID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public email: string;
    public foedselsnummer: string;
    public ID: number;
    public navn: string;
    public paaloeptBeloep: number;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CustomFields: any;
}


export class UserRole extends UniEntity {
    public static RelativeUrl = 'userroles';
    public static EntityType = 'UserRole';

    public _createguid: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public ID: number;
    public SharedRoleId: number;
    public SharedRoleName: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public UserID: number;
    public User: User;
    public CustomFields: any;
}


export class Role extends UniEntity {
    public static RelativeUrl = 'roles';
    public static EntityType = 'Role';

    public _createguid: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public Description: string;
    public ID: number;
    public Label: string;
    public Name: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public RolePermissions: Array<RolePermission>;
    public CustomFields: any;
}


export class RolePermission extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'RolePermission';

    public _createguid: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public ID: number;
    public PermissionID: number;
    public RoleID: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Role: Role;
    public Permission: Permission;
    public CustomFields: any;
}


export class Permission extends UniEntity {
    public static RelativeUrl = 'permissions';
    public static EntityType = 'Permission';

    public _createguid: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public ID: number;
    public Name: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public RolePermissions: Array<RolePermission>;
    public CustomFields: any;
}


export class AvtaleGiroAgreement extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AvtaleGiroAgreement';

    public _createguid: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public DataSender: string;
    public Deleted: boolean;
    public Description: string;
    public ID: number;
    public KeyPath: string;
    public NextNumber: number;
    public Thumbprint: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CustomFields: any;
}


export class AvtaleGiroBankAccount extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AvtaleGiroBankAccount';

    public _createguid: string;
    public AvtaleGiroAgreementID: number;
    public BankAccountNumber: string;
    public CompanyID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public ID: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Company: Company;
    public CustomFields: any;
}


export class AvtaleGiroFile extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AvtaleGiroFile';

    public _createguid: string;
    public AvtaleGiroAgreementID: number;
    public AvtaleGiroContent: string;
    public CompanyID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public FileID: number;
    public ID: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Company: Company;
    public CustomFields: any;
}


export class Company extends UniEntity {
    public static RelativeUrl = 'companies';
    public static EntityType = 'Company';

    public _createguid: string;
    public ClientNumber: number;
    public ConnectionString: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public FileFlowEmail: string;
    public FileFlowOrgnrEmail: string;
    public ID: number;
    public IsGlobalTemplate: boolean;
    public IsTemplate: boolean;
    public IsTest: boolean;
    public Key: string;
    public LastActivity: Date;
    public Name: string;
    public OrganizationNumber: string;
    public SchemaName: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public WebHookSubscriberId: string;
    public CustomFields: any;
}


export class CompanyAccess extends UniEntity {
    public static RelativeUrl = 'companies-access';
    public static EntityType = 'CompanyAccess';

    public _createguid: string;
    public CompanyID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public GlobalIdentity: string;
    public ID: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CustomFields: any;
}


export class ContractCron extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ContractCron';

    public _createguid: string;
    public CompanyDbName: string;
    public CompanyID: number;
    public CompanyKey: string;
    public ContractID: number;
    public ContractTriggerID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public Expression: string;
    public ID: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CustomFields: any;
}


export class ContractObyte extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ContractObyte';

    public _createguid: string;
    public Address: string;
    public AssetAddress: string;
    public CompanyDbName: string;
    public CompanyID: number;
    public CompanyKey: string;
    public ContractAddressID: number;
    public ContractID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public ID: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CustomFields: any;
}


export class DeniedUserAccessLog extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'DeniedUserAccessLog';

    public _createguid: string;
    public CompanyID: number;
    public CompanyName: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public Email: string;
    public ID: number;
    public Message: string;
    public Occurred: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Username: string;
    public Company: Company;
    public CustomFields: any;
}


export class HangfireJob extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'HangfireJob';

    public CompanyID: number;
    public CompanyKey: string;
    public Completed: boolean;
    public CreatedAt: Date;
    public GlobalIdentity: string;
    public HasError: boolean;
    public ID: number;
    public JobId: string;
    public Status: number;
    public UpdatedAt: Date;
    public Year: number;
    public CustomFields: any;
}


export class HangfireJobContext extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'HangfireJobContext';

    public CompanyID: number;
    public CompanyKey: string;
    public Completed: boolean;
    public CreatedAt: Date;
    public GlobalIdentity: string;
    public HasError: boolean;
    public ID: number;
    public JobId: string;
    public SchemaName: string;
    public Status: number;
    public UpdatedAt: Date;
    public Year: number;
    public CustomFields: any;
}


export class HangfireResponse extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'HangfireResponse';

    public CompanyID: number;
    public CompanyKey: string;
    public Completed: boolean;
    public CreatedAt: Date;
    public GlobalIdentity: string;
    public HasError: boolean;
    public ID: number;
    public JobId: string;
    public ProgressUrl: string;
    public State: string;
    public Status: number;
    public UpdatedAt: Date;
    public Year: number;
    public CustomFields: any;
}


export class KpiDefinition extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'KpiDefinition';

    public _createguid: string;
    public Application: string;
    public CompanyID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public ID: number;
    public Interval: string;
    public IsPerUser: boolean;
    public Name: string;
    public RefreshModels: string;
    public RoleNames: string;
    public Route: string;
    public SourceType: KpiSourceType;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public ValueType: KpiValueType;
    public CustomFields: any;
}


export class KpiValue extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'KpiValue';

    public _createguid: string;
    public CompanyID: number;
    public Counter: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public ID: number;
    public KpiDefinitionID: number;
    public KpiName: string;
    public LastUpdated: Date;
    public Text: string;
    public Total: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public UserIdentity: string;
    public ValueStatus: KpiValueStatus;
    public CustomFields: any;
}


export class ProcessFileLog extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ProcessFileLog';

    public _createguid: string;
    public CompanyID: number;
    public CompanyKey: string;
    public CompanyName: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public EntityCount: number;
    public EntityInstanceID: string;
    public EntityName: string;
    public FileID: number;
    public FileName: string;
    public FileType: number;
    public ID: number;
    public Message: string;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public UserIdentity: string;
    public Company: Company;
    public CustomFields: any;
}


export class Account extends UniEntity {
    public static RelativeUrl = 'accounts';
    public static EntityType = 'Account';

    public _createguid: string;
    public AccountGroupID: number;
    public AccountID: number;
    public AccountName: string;
    public AccountNumber: number;
    public AccountSetupID: number;
    public Active: boolean;
    public CostAllocationID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public CurrencyCodeID: number;
    public CustomerID: number;
    public Deleted: boolean;
    public Description: string;
    public DimensionsID: number;
    public DoSynchronize: boolean;
    public EmployeeID: number;
    public ID: number;
    public Keywords: string;
    public Locked: boolean;
    public LockManualPosts: boolean;
    public StatusCode: number;
    public SupplierID: number;
    public SystemAccount: boolean;
    public TopLevelAccountGroupID: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public UsePostPost: boolean;
    public UseVatDeductionGroupID: number;
    public VatTypeID: number;
    public Visible: boolean;
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
    public CustomFields: any;
}


export class AccountAlias extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AccountAlias';

    public _createguid: string;
    public AccountID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public ID: number;
    public Name: string;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CustomFields: any;
}


export class AccountGroup extends UniEntity {
    public static RelativeUrl = 'accountgroups';
    public static EntityType = 'AccountGroup';

    public _createguid: string;
    public AccountGroupSetID: number;
    public AccountGroupSetupID: number;
    public AccountID: number;
    public CompatibleAccountID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public GroupNumber: string;
    public ID: number;
    public MainGroupID: number;
    public Name: string;
    public StatusCode: number;
    public Summable: boolean;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public MainGroup: AccountGroup;
    public AccountGroupSet: AccountGroupSet;
    public CustomFields: any;
}


export class AccountGroupSet extends UniEntity {
    public static RelativeUrl = 'accountgroupsets';
    public static EntityType = 'AccountGroupSet';

    public _createguid: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public FromAccountNumber: number;
    public ID: number;
    public Name: string;
    public Shared: boolean;
    public StatusCode: number;
    public SubAccountAllowed: boolean;
    public System: boolean;
    public ToAccountNumber: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CustomFields: any;
}


export class AccountMandatoryDimension extends UniEntity {
    public static RelativeUrl = 'accountmandatorydimension';
    public static EntityType = 'AccountMandatoryDimension';

    public _createguid: string;
    public AccountID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public DimensionNo: number;
    public ID: number;
    public MandatoryType: number;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CustomFields: any;
}


export class Accrual extends UniEntity {
    public static RelativeUrl = 'accruals';
    public static EntityType = 'Accrual';

    public _createguid: string;
    public AccrualAmount: number;
    public AccrualJournalEntryMode: number;
    public BalanceAccountID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public ID: number;
    public JournalEntryLineDraftID: number;
    public ResultAccountID: number;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
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

    public _createguid: string;
    public AccountYear: number;
    public AccrualID: number;
    public Amount: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public ID: number;
    public JournalEntryDraftLineID: number;
    public PeriodNo: number;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Accrual: Accrual;
    public JournalEntryLineDraft: JournalEntryLineDraft;
    public CustomFields: any;
}


export class Bank extends UniEntity {
    public static RelativeUrl = 'banks';
    public static EntityType = 'Bank';

    public _createguid: string;
    public AddressID: number;
    public BIC: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public EmailID: number;
    public ID: number;
    public InitialBIC: string;
    public Name: string;
    public PhoneID: number;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Web: string;
    public Address: Address;
    public Phone: Phone;
    public Email: Email;
    public CustomFields: any;
}


export class BankAccount extends UniEntity {
    public static RelativeUrl = 'bankaccounts';
    public static EntityType = 'BankAccount';

    public _createguid: string;
    public AccountID: number;
    public AccountNumber: string;
    public BankAccountType: string;
    public BankID: number;
    public BusinessRelationID: number;
    public CompanySettingsID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public IBAN: string;
    public ID: number;
    public Locked: boolean;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Account: Account;
    public Bank: Bank;
    public BusinessRelation: BusinessRelation;
    public CompanySettings: CompanySettings;
    public CustomFields: any;
}


export class BankIntegrationAgreement extends UniEntity {
    public static RelativeUrl = 'bank-agreements';
    public static EntityType = 'BankIntegrationAgreement';

    public _createguid: string;
    public BankAcceptance: boolean;
    public BankAccountID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public DefaultAgreement: boolean;
    public Deleted: boolean;
    public Email: string;
    public ID: number;
    public IsBankBalance: boolean;
    public IsInbound: boolean;
    public IsOutgoing: boolean;
    public Name: string;
    public Password: string;
    public PropertiesJson: string;
    public ServiceID: string;
    public ServiceTemplateID: string;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public BankAccount: BankAccount;
    public CustomFields: any;
}


export class BankRule extends UniEntity {
    public static RelativeUrl = 'bankrules';
    public static EntityType = 'BankRule';

    public _createguid: string;
    public AccountID: number;
    public ActionCode: ActionCodeBankRule;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public ID: number;
    public IsActive: boolean;
    public Name: string;
    public Priority: number;
    public Rule: string;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Account: Account;
    public CustomFields: any;
}


export class BankStatement extends UniEntity {
    public static RelativeUrl = 'bankstatements';
    public static EntityType = 'BankStatement';

    public _createguid: string;
    public AccountID: number;
    public Amount: number;
    public AmountCurrency: number;
    public ArchiveReference: string;
    public BankAccountID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public CurrencyCode: string;
    public Deleted: boolean;
    public EndBalance: number;
    public FileID: number;
    public FromDate: LocalDate;
    public ID: number;
    public StartBalance: number;
    public StatusCode: number;
    public ToDate: LocalDate;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Account: Account;
    public BankAccount: BankAccount;
    public Entries: Array<BankStatementEntry>;
    public File: File;
    public CustomFields: any;
}


export class BankStatementEntry extends UniEntity {
    public static RelativeUrl = 'bankstatemententries';
    public static EntityType = 'BankStatementEntry';

    public _createguid: string;
    public Amount: number;
    public AmountCurrency: number;
    public ArchiveReference: string;
    public BankStatementID: number;
    public BookingDate: LocalDate;
    public Category: string;
    public CID: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public CurrencyCode: string;
    public Deleted: boolean;
    public Description: string;
    public ID: number;
    public InvoiceNumber: string;
    public OpenAmount: number;
    public OpenAmountCurrency: number;
    public ReceiverAccount: string;
    public Receivername: string;
    public SenderAccount: string;
    public SenderName: string;
    public StatusCode: number;
    public StructuredReference: string;
    public TransactionId: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public ValueDate: LocalDate;
    public BankStatement: BankStatement;
    public CustomFields: any;
}


export class BankStatementMatch extends UniEntity {
    public static RelativeUrl = 'bankstatementmatch';
    public static EntityType = 'BankStatementMatch';

    public _createguid: string;
    public Amount: number;
    public BankStatementEntryID: number;
    public Batch: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public Group: string;
    public ID: number;
    public JournalEntryLineID: number;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public BankStatementEntry: BankStatementEntry;
    public JournalEntryLine: JournalEntryLine;
    public CustomFields: any;
}


export class Budget extends UniEntity {
    public static RelativeUrl = 'budgets';
    public static EntityType = 'Budget';

    public _createguid: string;
    public AccountingYear: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public ID: number;
    public Name: string;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Entries: Array<BudgetEntry>;
    public CustomFields: any;
}


export class BudgetEntry extends UniEntity {
    public static RelativeUrl = 'budgetentries';
    public static EntityType = 'BudgetEntry';

    public _createguid: string;
    public AccountID: number;
    public Amount: number;
    public BudgetID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public DimensionsID: number;
    public ID: number;
    public PeriodNumber: number;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Budget: Budget;
    public Account: Account;
    public Dimensions: Dimensions;
    public CustomFields: any;
}


export class CompanyAccountingSettings extends UniEntity {
    public static RelativeUrl = 'companyaccountingsettings';
    public static EntityType = 'CompanyAccountingSettings';

    public _createguid: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public ID: number;
    public ReInvoicingCostsharingProductID: number;
    public ReInvoicingMethod: number;
    public ReInvoicingTurnoverProductID: number;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public ReInvoicingCostsharingProduct: Product;
    public ReInvoicingTurnoverProduct: Product;
    public CustomFields: any;
}


export class CompanyBankAccount extends UniEntity {
    public static RelativeUrl = 'companybankaccounts';
    public static EntityType = 'CompanyBankAccount';

    public _createguid: string;
    public AccountID: number;
    public BankAccountID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public CreditAmount: number;
    public Deleted: boolean;
    public ID: number;
    public IsIncomming: boolean;
    public IsOutgoing: boolean;
    public IsSalary: boolean;
    public IsTax: boolean;
    public Name: string;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public BankAccount: BankAccount;
    public Account: Account;
    public CustomFields: any;
}


export class CostAllocation extends UniEntity {
    public static RelativeUrl = 'costallocations';
    public static EntityType = 'CostAllocation';

    public _createguid: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public ID: number;
    public Name: string;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Items: Array<CostAllocationItem>;
    public CustomFields: any;
}


export class CostAllocationItem extends UniEntity {
    public static RelativeUrl = 'costallocationitems';
    public static EntityType = 'CostAllocationItem';

    public _createguid: string;
    public AccountID: number;
    public Amount: number;
    public CostAllocationID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public Description: string;
    public DimensionsID: number;
    public ID: number;
    public Percent: number;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public VatTypeID: number;
    public Account: Account;
    public VatType: VatType;
    public Dimensions: Dimensions;
    public CustomFields: any;
}


export class CustomLiquidityPayment extends UniEntity {
    public static RelativeUrl = 'liquiditypayment';
    public static EntityType = 'CustomLiquidityPayment';

    public _createguid: string;
    public Amount: number;
    public AmountCurrency: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public CurrencyCodeID: number;
    public CustomLiquidityPaymentType: number;
    public Deleted: boolean;
    public Description: string;
    public DueDate: LocalDate;
    public EndDate: LocalDate;
    public ID: number;
    public IsCustomerPayment: boolean;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public currency: CurrencyCode;
    public CustomFields: any;
}


export class FinancialYear extends UniEntity {
    public static RelativeUrl = 'financialyears';
    public static EntityType = 'FinancialYear';

    public _createguid: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public ID: number;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public ValidFrom: LocalDate;
    public ValidTo: LocalDate;
    public Year: number;
    public CustomFields: any;
}


export class JournalEntry extends UniEntity {
    public static RelativeUrl = 'journalentries';
    public static EntityType = 'JournalEntry';

    public _createguid: string;
    public CanSkipMandatoryDimension: boolean;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public Description: string;
    public FinancialYearID: number;
    public ID: number;
    public JournalEntryAccrualID: number;
    public JournalEntryDraftGroup: string;
    public JournalEntryNumber: string;
    public JournalEntryNumberNumeric: number;
    public NumberSeriesID: number;
    public NumberSeriesTaskID: number;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
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

    public _createguid: string;
    public AccountID: number;
    public AccrualID: number;
    public Amount: number;
    public AmountCurrency: number;
    public BatchNumber: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public CurrencyCodeID: number;
    public CurrencyExchangeRate: number;
    public CustomerInvoiceID: number;
    public CustomerOrderID: number;
    public Deleted: boolean;
    public Description: string;
    public DimensionsID: number;
    public DueDate: LocalDate;
    public FinancialDate: LocalDate;
    public ID: number;
    public InvoiceNumber: string;
    public JournalEntryID: number;
    public JournalEntryLineDraftID: number;
    public JournalEntryNumber: string;
    public JournalEntryNumberNumeric: number;
    public JournalEntryTypeID: number;
    public OriginalJournalEntryPost: number;
    public OriginalReferencePostID: number;
    public PaymentID: string;
    public PaymentInfoTypeID: number;
    public PaymentReferenceID: number;
    public PeriodID: number;
    public PostPostJournalEntryLineID: number;
    public ReferenceCreditPostID: number;
    public ReferenceOriginalPostID: number;
    public RegisteredDate: LocalDate;
    public RestAmount: number;
    public RestAmountCurrency: number;
    public Signature: string;
    public StatusCode: number;
    public SubAccountID: number;
    public SupplierInvoiceID: number;
    public TaxBasisAmount: number;
    public TaxBasisAmountCurrency: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public VatDate: LocalDate;
    public VatDeductionPercent: number;
    public VatJournalEntryPostID: number;
    public VatPercent: number;
    public VatPeriodID: number;
    public VatReportID: number;
    public VatTypeID: number;
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

    public _createguid: string;
    public AccountID: number;
    public AccrualID: number;
    public Amount: number;
    public AmountCurrency: number;
    public BatchNumber: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public CurrencyCodeID: number;
    public CurrencyExchangeRate: number;
    public CustomerInvoiceID: number;
    public CustomerOrderID: number;
    public Deleted: boolean;
    public Description: string;
    public DimensionsID: number;
    public DueDate: LocalDate;
    public FinancialDate: LocalDate;
    public ID: number;
    public InvoiceNumber: string;
    public JournalEntryID: number;
    public JournalEntryNumber: string;
    public JournalEntryNumberNumeric: number;
    public JournalEntryTypeID: number;
    public PaymentID: string;
    public PaymentInfoTypeID: number;
    public PaymentReferenceID: number;
    public PeriodID: number;
    public PostPostJournalEntryLineID: number;
    public RegisteredDate: LocalDate;
    public Signature: string;
    public StatusCode: number;
    public SubAccountID: number;
    public SupplierInvoiceID: number;
    public TaxBasisAmount: number;
    public TaxBasisAmountCurrency: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public VatDate: LocalDate;
    public VatDeductionPercent: number;
    public VatPercent: number;
    public VatPeriodID: number;
    public VatTypeID: number;
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

    public _createguid: string;
    public ColumnSetUp: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public ID: number;
    public Name: string;
    public StatusCode: number;
    public TraceLinkTypes: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public VisibleModules: string;
    public CustomFields: any;
}


export class JournalEntrySourceSerie extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'JournalEntrySourceSerie';

    public _createguid: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public ID: number;
    public JournalEntrySourceEntityName: string;
    public JournalEntrySourceID: number;
    public JournalEntrySourceInstanceID: number;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CustomFields: any;
}


export class JournalEntryType extends UniEntity {
    public static RelativeUrl = 'journalentrytypes';
    public static EntityType = 'JournalEntryType';

    public _createguid: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public DisplayName: string;
    public ExpectNegativeAmount: boolean;
    public ID: number;
    public Name: string;
    public Number: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CustomFields: any;
}


export class LedgerSuggestion extends UniEntity {
    public BusinessType: string;
    public ID: number;
    public IndustryCode: string;
    public IndustryName: string;
    public Name: string;
    public OrgNumber: string;
    public Source: SuggestionSource;
}


export class Payment extends UniEntity {
    public static RelativeUrl = 'payments';
    public static EntityType = 'Payment';

    public _createguid: string;
    public Amount: number;
    public AmountCurrency: number;
    public AutoJournal: boolean;
    public BankChargeAmount: number;
    public BusinessRelationID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public CurrencyCodeID: number;
    public CurrencyExchangeRate: number;
    public CustomerInvoiceID: number;
    public CustomerInvoiceReminderID: number;
    public Debtor: string;
    public Deleted: boolean;
    public Description: string;
    public DimensionsID: number;
    public Domain: string;
    public DueDate: LocalDate;
    public ExternalBankAccountNumber: string;
    public FromBankAccountID: number;
    public ID: number;
    public InPaymentID: string;
    public InvoiceNumber: string;
    public IsCustomerPayment: boolean;
    public IsExternal: boolean;
    public IsPaymentCancellationRequest: boolean;
    public IsPaymentClaim: boolean;
    public JournalEntryID: number;
    public OcrPaymentStrings: string;
    public PaymentBatchID: number;
    public PaymentCodeID: number;
    public PaymentDate: LocalDate;
    public PaymentID: string;
    public PaymentNotificationReportFileID: number;
    public PaymentStatusReportFileID: number;
    public Proprietary: string;
    public ReconcilePayment: boolean;
    public SerialNumberOrAcctSvcrRef: string;
    public StatusCode: number;
    public StatusText: string;
    public SupplierInvoiceID: number;
    public ToBankAccountID: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public XmlTagEndToEndIdReference: string;
    public XmlTagPmtInfIdReference: string;
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

    public _createguid: string;
    public Camt054CMsgId: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public ID: number;
    public IsCustomerPayment: boolean;
    public NumberOfPayments: number;
    public OcrHeadingStrings: string;
    public OcrTransmissionNumber: number;
    public PaymentBatchTypeID: number;
    public PaymentFileID: number;
    public PaymentReferenceID: string;
    public PaymentStatusReportFileID: number;
    public ReceiptDate: Date;
    public StatusCode: number;
    public TotalAmount: number;
    public TransferredDate: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Payments: Array<Payment>;
    public PaymentBatchType: PaymentBatchType;
    public CustomFields: any;
}


export class PostPost extends UniEntity {
    public static RelativeUrl = 'postposts';
    public static EntityType = 'PostPost';

    public _createguid: string;
    public Amount: number;
    public AmountCurrency: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public CurrencyCodeID: number;
    public CurrencyExchangeRate: number;
    public Date: LocalDate;
    public Deleted: boolean;
    public ID: number;
    public JournalEntryLine1ID: number;
    public JournalEntryLine2ID: number;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public JournalEntryLine1: JournalEntryLine;
    public JournalEntryLine2: JournalEntryLine;
    public CurrencyCode: CurrencyCode;
    public CustomFields: any;
}


export class ReInvoice extends UniEntity {
    public static RelativeUrl = 'reinvoicing';
    public static EntityType = 'ReInvoice';

    public _createguid: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public ID: number;
    public OwnCostAmount: number;
    public OwnCostShare: number;
    public ProductID: number;
    public ReInvoicingType: number;
    public StatusCode: number;
    public SupplierInvoiceID: number;
    public TaxExclusiveAmount: number;
    public TaxInclusiveAmount: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public SupplierInvoice: SupplierInvoice;
    public Product: Product;
    public Items: Array<ReInvoiceItem>;
    public CustomFields: any;
}


export class ReInvoiceItem extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ReInvoiceItem';

    public _createguid: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public CustomerID: number;
    public Deleted: boolean;
    public GrossAmount: number;
    public ID: number;
    public NetAmount: number;
    public ReInvoiceID: number;
    public Share: number;
    public StatusCode: number;
    public Surcharge: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Vat: number;
    public Customer: Customer;
    public CustomFields: any;
}


export class SupplierInvoice extends UniEntity {
    public static RelativeUrl = 'supplierinvoices';
    public static EntityType = 'SupplierInvoice';

    public _createguid: string;
    public AmountRegards: string;
    public BankAccountID: number;
    public Comment: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public CreditDays: number;
    public Credited: boolean;
    public CreditedAmount: number;
    public CreditedAmountCurrency: number;
    public CurrencyCodeID: number;
    public CurrencyExchangeRate: number;
    public CustomerOrgNumber: string;
    public CustomerPerson: string;
    public DefaultDimensionsID: number;
    public Deleted: boolean;
    public DeliveryDate: LocalDate;
    public DeliveryMethod: string;
    public DeliveryName: string;
    public DeliveryTerm: string;
    public DeliveryTermsID: number;
    public FreeTxt: string;
    public ID: number;
    public InternalNote: string;
    public InvoiceAddressLine1: string;
    public InvoiceAddressLine2: string;
    public InvoiceAddressLine3: string;
    public InvoiceCity: string;
    public InvoiceCountry: string;
    public InvoiceCountryCode: string;
    public InvoiceDate: LocalDate;
    public InvoiceNumber: string;
    public InvoicePostalCode: string;
    public InvoiceReceiverName: string;
    public InvoiceReferenceID: number;
    public InvoiceType: number;
    public IsSentToPayment: boolean;
    public JournalEntryID: number;
    public OurReference: string;
    public PayableRoundingAmount: number;
    public PayableRoundingCurrencyAmount: number;
    public Payment: string;
    public PaymentDueDate: LocalDate;
    public PaymentID: string;
    public PaymentInformation: string;
    public PaymentTerm: string;
    public PaymentTermsID: number;
    public PrintStatus: number;
    public ProjectID: number;
    public ReInvoiced: boolean;
    public ReInvoiceID: number;
    public Requisition: string;
    public RestAmount: number;
    public RestAmountCurrency: number;
    public SalesPerson: string;
    public ShippingAddressLine1: string;
    public ShippingAddressLine2: string;
    public ShippingAddressLine3: string;
    public ShippingCity: string;
    public ShippingCountry: string;
    public ShippingCountryCode: string;
    public ShippingPostalCode: string;
    public StatusCode: number;
    public SupplierID: number;
    public SupplierOrgNumber: string;
    public TaxExclusiveAmount: number;
    public TaxExclusiveAmountCurrency: number;
    public TaxInclusiveAmount: number;
    public TaxInclusiveAmountCurrency: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public VatTotalsAmount: number;
    public VatTotalsAmountCurrency: number;
    public YourReference: string;
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

    public _createguid: string;
    public AccountingCost: string;
    public CalculateGrossPriceBasedOnNetPrice: boolean;
    public Comment: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public CurrencyCodeID: number;
    public CurrencyExchangeRate: number;
    public Deleted: boolean;
    public DimensionsID: number;
    public Discount: number;
    public DiscountCurrency: number;
    public DiscountPercent: number;
    public ID: number;
    public InvoicePeriodEndDate: LocalDate;
    public InvoicePeriodStartDate: LocalDate;
    public ItemText: string;
    public NumberOfItems: number;
    public PriceExVat: number;
    public PriceExVatCurrency: number;
    public PriceIncVat: number;
    public PriceSetByUser: boolean;
    public ProductID: number;
    public SortIndex: number;
    public StatusCode: number;
    public SumTotalExVat: number;
    public SumTotalExVatCurrency: number;
    public SumTotalIncVat: number;
    public SumTotalIncVatCurrency: number;
    public SumVat: number;
    public SumVatCurrency: number;
    public SupplierInvoiceID: number;
    public Unit: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public VatDate: LocalDate;
    public VatPercent: number;
    public VatTypeID: number;
    public Product: Product;
    public VatType: VatType;
    public Dimensions: Dimensions;
    public CurrencyCode: CurrencyCode;
    public CustomFields: any;
}


export class VatCodeGroup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'VatCodeGroup';

    public _createguid: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public ID: number;
    public Name: string;
    public No: string;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CustomFields: any;
}


export class VatDeduction extends UniEntity {
    public static RelativeUrl = 'vatdeductions';
    public static EntityType = 'VatDeduction';

    public _createguid: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public DeductionPercent: number;
    public Deleted: boolean;
    public ID: number;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public ValidFrom: LocalDate;
    public ValidTo: LocalDate;
    public VatDeductionGroupID: number;
    public VatDeductionGroup: VatDeductionGroup;
    public CustomFields: any;
}


export class VatDeductionGroup extends UniEntity {
    public static RelativeUrl = 'vatdeductiongroups';
    public static EntityType = 'VatDeductionGroup';

    public _createguid: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public ID: number;
    public Name: string;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CustomFields: any;
}


export class VatPost extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'VatPost';

    public _createguid: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public HasTaxAmount: boolean;
    public HasTaxBasis: boolean;
    public ID: number;
    public Name: string;
    public No: string;
    public ReportAsNegativeAmount: boolean;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public VatCodeGroupID: number;
    public VatCodeGroup: VatCodeGroup;
    public VatReportReferences: Array<VatReportReference>;
    public CustomFields: any;
}


export class VatReport extends UniEntity {
    public static RelativeUrl = 'vatreports';
    public static EntityType = 'VatReport';

    public _createguid: string;
    public Comment: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public ExecutedDate: Date;
    public ExternalRefNo: string;
    public ID: number;
    public InternalComment: string;
    public JournalEntryID: number;
    public ReportedDate: Date;
    public StatusCode: number;
    public TerminPeriodID: number;
    public Title: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public VatReportArchivedSummaryID: number;
    public VatReportTypeID: number;
    public TerminPeriod: Period;
    public VatReportType: VatReportType;
    public JournalEntry: JournalEntry;
    public VatReportArchivedSummary: VatReportArchivedSummary;
    public CustomFields: any;
}


export class VatReportArchivedSummary extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'VatReportArchivedSummary';

    public _createguid: string;
    public AmountToBePayed: number;
    public AmountToBeReceived: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public ID: number;
    public PaymentBankAccountNumber: string;
    public PaymentDueDate: Date;
    public PaymentID: string;
    public PaymentPeriod: string;
    public PaymentToDescription: string;
    public PaymentYear: number;
    public ReportName: string;
    public StatusCode: number;
    public SummaryHeader: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CustomFields: any;
}


export class VatReportReference extends UniEntity {
    public static RelativeUrl = 'vatreportreferences';
    public static EntityType = 'VatReportReference';

    public _createguid: string;
    public AccountID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public ID: number;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public VatPostID: number;
    public VatTypeID: number;
    public VatType: VatType;
    public VatPost: VatPost;
    public Account: Account;
    public CustomFields: any;
}


export class VatReportType extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'VatReportType';

    public _createguid: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public ID: number;
    public Name: string;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CustomFields: any;
}


export class VatType extends UniEntity {
    public static RelativeUrl = 'vattypes';
    public static EntityType = 'VatType';

    public _createguid: string;
    public Alias: string;
    public AvailableInModules: boolean;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public DirectJournalEntryOnly: boolean;
    public ID: number;
    public IncomingAccountID: number;
    public InUse: boolean;
    public Locked: boolean;
    public Name: string;
    public OutgoingAccountID: number;
    public OutputVat: boolean;
    public ReversedTaxDutyVat: boolean;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public VatCode: string;
    public VatCodeGroupID: number;
    public VatCodeGroupingValue: VatCodeGroupingValueEnum;
    public VatPercent: number;
    public VatTypeSetupID: number;
    public Visible: boolean;
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

    public _createguid: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public ID: number;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public ValidFrom: LocalDate;
    public ValidTo: LocalDate;
    public VatPercent: number;
    public VatTypeID: number;
    public CustomFields: any;
}


export class VippsInvoice extends UniEntity {
    public static RelativeUrl = 'vipps-invoices';
    public static EntityType = 'VippsInvoice';

    public _createguid: string;
    public Amount: number;
    public BankAccountNumber: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public Due: string;
    public ID: number;
    public InvoiceID: string;
    public InvoiceRef: string;
    public MobileNumber: string;
    public StatusCode: number;
    public Subject: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CustomFields: any;
}


export class EntityValidationRule extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'EntityValidationRule';

    public _createguid: string;
    public ChangedByCompany: boolean;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public EntityType: string;
    public ID: number;
    public Level: ValidationLevel;
    public Message: string;
    public OnConflict: OnConflict;
    public Operation: OperationType;
    public Operator: Operator;
    public PropertyName: string;
    public SyncKey: string;
    public System: boolean;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Value: string;
    public CustomFields: any;
}


export class EntityValidationRuleTemplate extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'EntityValidationRuleTemplate';

    public _createguid: string;
    public ChangedByCompany: boolean;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public EntityType: string;
    public ID: number;
    public Level: ValidationLevel;
    public Message: string;
    public OnConflict: OnConflict;
    public Operation: OperationType;
    public Operator: Operator;
    public PropertyName: string;
    public SyncKey: string;
    public System: boolean;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Value: string;
    public CustomFields: any;
}


export class ComplexValidationRule extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ComplexValidationRule';

    public _createguid: string;
    public ChangedByCompany: boolean;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public EntityType: string;
    public ID: number;
    public Level: ValidationLevel;
    public Message: string;
    public OnConflict: OnConflict;
    public Operation: OperationType;
    public SyncKey: string;
    public System: boolean;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public ValidationCode: number;
    public CustomFields: any;
}


export class ComplexValidationRuleTemplate extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ComplexValidationRuleTemplate';

    public _createguid: string;
    public ChangedByCompany: boolean;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public EntityType: string;
    public ID: number;
    public Level: ValidationLevel;
    public Message: string;
    public OnConflict: OnConflict;
    public Operation: OperationType;
    public SyncKey: string;
    public System: boolean;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public ValidationCode: number;
    public CustomFields: any;
}


export class CustomField extends UniEntity {
    public static RelativeUrl = 'custom-fields';
    public static EntityType = 'CustomField';

    public _createguid: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public DataType: string;
    public Deleted: boolean;
    public ID: number;
    public ModelID: number;
    public Name: string;
    public Nullable: boolean;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CustomFields: any;
}


export class ValueList extends UniEntity {
    public static RelativeUrl = 'valuelists';
    public static EntityType = 'ValueList';

    public _createguid: string;
    public Code: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public Description: string;
    public ID: number;
    public Name: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Items: Array<ValueItem>;
    public CustomFields: any;
}


export class ValueItem extends UniEntity {
    public static RelativeUrl = 'valueitems';
    public static EntityType = 'ValueItem';

    public _createguid: string;
    public Code: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public Description: string;
    public ID: number;
    public Index: number;
    public Name: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Value: string;
    public ValueListID: number;
    public ValueList: ValueList;
    public CustomFields: any;
}


export class ComponentLayoutDto extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ComponentLayoutDto';

    public BaseEntity: string;
    public Name: string;
    public Url: string;
    public Fields: Array<FieldLayoutDto>;
    public CustomFields: any;
}


export class FieldLayoutDto extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'FieldLayoutDto';

    public Alignment: Alignment;
    public Combo: number;
    public ComponentLayoutID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public Description: string;
    public DisplayField: string;
    public EntityType: string;
    public FieldSet: number;
    public FieldType: FieldType;
    public HelpText: string;
    public Hidden: boolean;
    public ID: number;
    public Label: string;
    public Legend: string;
    public LineBreak: boolean;
    public LookupEntityType: string;
    public LookupField: boolean;
    public Options: string;
    public Placeholder: string;
    public Placement: number;
    public Property: string;
    public ReadOnly: boolean;
    public Section: number;
    public Sectionheader: string;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Url: string;
    public ValueList: string;
    public Width: string;
    public Validations: Array<EntityValidationRule>;
    public CustomFields: any;
}


export class AssignmentDetails extends UniEntity {
    public Message: string;
    public TeamIDs: string;
    public UserIDs: string;
}


export class TimeSheet extends UniEntity {
    public FromDate: Date;
    public ToDate: Date;
    public Workflow: TimesheetWorkflow;
    public Relation: WorkRelation;
    public Items: Array<TimeSheetItem>;
}


export class TimeSheetItem extends UniEntity {
    public Date: Date;
    public EndTime: Date;
    public ExpectedTime: number;
    public Flextime: number;
    public Invoicable: number;
    public IsWeekend: boolean;
    public Overtime: number;
    public Projecttime: number;
    public SickTime: number;
    public StartTime: Date;
    public Status: WorkStatus;
    public TimeOff: number;
    public TotalTime: number;
    public ValidTime: number;
    public ValidTimeOff: number;
    public WeekDay: number;
    public WeekNumber: number;
    public Workflow: TimesheetWorkflow;
}


export class WorkBalanceDto extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'WorkBalanceDto';

    public ActualMinutes: number;
    public BalanceDate: Date;
    public BalanceFrom: Date;
    public Balancetype: WorkBalanceTypeEnum;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Days: number;
    public Deleted: boolean;
    public Description: string;
    public ExpectedMinutes: number;
    public ID: number;
    public IsStartBalance: boolean;
    public LastDayActual: number;
    public LastDayExpected: number;
    public Minutes: number;
    public StatusCode: number;
    public SumOvertime: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public ValidFrom: Date;
    public ValidTimeOff: number;
    public WorkRelationID: number;
    public WorkRelation: WorkRelation;
    public Previous: BalanceInfo;
    public Details: Array<FlexDetail>;
    public CustomFields: any;
}


export class BalanceInfo extends UniEntity {
    public BalanceDate: Date;
    public Description: string;
    public ID: number;
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
    public ErrorCode: number;
    public ErrorMessage: string;
    public Method: string;
    public ObjectName: string;
    public Success: boolean;
}


export class InvoicesAndRemindersReadyToRemind extends UniEntity {
    public CurrencyCodeCode: string;
    public CurrencyCodeID: number;
    public CurrencyCodeShortCode: string;
    public CurrencyExchangeRate: number;
    public CustomerID: number;
    public CustomerInvoiceID: number;
    public CustomerInvoiceReminderID: number;
    public CustomerName: string;
    public CustomerNumber: number;
    public DontSendReminders: boolean;
    public DueDate: Date;
    public EmailAddress: string;
    public Fee: number;
    public Interest: number;
    public InvoiceDate: Date;
    public InvoiceNumber: number;
    public ReminderNumber: number;
    public RestAmount: number;
    public RestAmountCurrency: number;
    public StatusCode: number;
    public TaxInclusiveAmount: number;
    public TaxInclusiveAmountCurrency: number;
}


export class TradeHeaderCalculationSummary extends UniEntity {
    public DecimalRounding: number;
    public DecimalRoundingCurrency: number;
    public SumDiscount: number;
    public SumDiscountCurrency: number;
    public SumNoVatBasis: number;
    public SumNoVatBasisCurrency: number;
    public SumTotalExVat: number;
    public SumTotalExVatCurrency: number;
    public SumTotalIncVat: number;
    public SumTotalIncVatCurrency: number;
    public SumVat: number;
    public SumVatBasis: number;
    public SumVatBasisCurrency: number;
    public SumVatCurrency: number;
}


export class VatCalculationSummary extends UniEntity {
    public SumVat: number;
    public SumVatBasis: number;
    public SumVatBasisCurrency: number;
    public SumVatCurrency: number;
    public VatPercent: number;
}


export class InvoicePaymentData extends UniEntity {
    public AccountID: number;
    public AgioAccountID: number;
    public AgioAmount: number;
    public Amount: number;
    public AmountCurrency: number;
    public BankChargeAccountID: number;
    public BankChargeAmount: number;
    public CurrencyCodeID: number;
    public CurrencyExchangeRate: number;
    public DimensionsID: number;
    public PaymentDate: LocalDate;
    public PaymentID: string;
}


export class InvoiceSummary extends UniEntity {
    public SumCreditedAmount: number;
    public SumRestAmount: number;
    public SumTotalAmount: number;
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
    public MaxInvoiceAmount: number;
    public RemainingLimit: number;
}


export class AmeldingAgaAndTaxSums extends UniEntity {
    public AccountNumber: string;
    public DueDate: Date;
    public EmploymentTax: number;
    public FinancialTax: number;
    public KIDEmploymentTax: string;
    public KIDFinancialTax: string;
    public KIDTaxDraw: string;
    public MessageID: string;
    public period: number;
    public TaxDraw: number;
}


export class PayrollRunInAmeldingPeriod extends UniEntity {
    public AmeldingSentdate: Date;
    public CanGenerateAddition: boolean;
    public PayrollrunDescription: string;
    public PayrollrunID: number;
    public PayrollrunPaydate: Date;
}


export class AmeldingSumUp extends UniEntity {
    public entities: Array<AmeldingEntity>;
    public agadetails: Array<AGADetails>;
    public totals: Totals;
}


export class AmeldingEntity extends UniEntity {
    public sums: Sums;
    public employees: Array<Employees>;
    public transactionTypes: Array<TransactionTypes>;
}


export class Sums extends UniEntity {
}


export class Employees extends UniEntity {
    public arbeidsforhold: Array<Employments>;
}


export class Employments extends UniEntity {
    public permisjon: Array<EmploymentLeaves>;
}


export class EmploymentLeaves extends UniEntity {
}


export class TransactionTypes extends UniEntity {
}


export class AGADetails extends UniEntity {
    public baseAmount: number;
    public rate: number;
    public sectorName: string;
    public type: string;
    public zoneName: string;
}


export class Totals extends UniEntity {
}


export class AnnualStatement extends UniEntity {
    public EmployeeAddress: string;
    public EmployeeCity: string;
    public EmployeeMunicipalName: string;
    public EmployeeMunicipalNumber: string;
    public EmployeeName: string;
    public EmployeeNumber: number;
    public EmployeePostCode: string;
    public EmployeeSSn: string;
    public EmployerAddress: string;
    public EmployerCity: string;
    public EmployerCountry: string;
    public EmployerCountryCode: string;
    public EmployerEmail: string;
    public EmployerName: string;
    public EmployerOrgNr: string;
    public EmployerPhoneNumber: string;
    public EmployerPostCode: string;
    public EmployerTaxMandatory: boolean;
    public EmployerWebAddress: string;
    public VacationPayBase: number;
    public Year: number;
    public Contributions: Array<AnnualStatementLine>;
    public PensionOrBenefits: Array<AnnualStatementLine>;
    public Deductions: Array<AnnualStatementLine>;
    public Draws: Array<AnnualStatementLine>;
}


export class AnnualStatementLine extends UniEntity {
    public Amount: number;
    public Description: string;
    public IsDeduction: boolean;
    public LineIndex: number;
    public Sum: number;
    public SupplementPackageName: string;
    public TaxReturnPost: string;
    public Supplements: Array<SupplementInfo>;
}


export class SupplementInfo extends UniEntity {
    public Name: string;
    public ValueBool: boolean;
    public ValueDate: Date;
    public ValueDate2: Date;
    public ValueMoney: number;
    public ValueString: string;
    public ValueType: Valuetype;
    public WageTypeSupplementID: number;
}


export class AnnualStatementReportSetup extends UniEntity {
    public EmpIDs: string;
    public Mail: AnnualStatementEmailInfo;
}


export class AnnualStatementEmailInfo extends UniEntity {
    public Message: string;
    public Subject: string;
}


export class TaxCardReadStatus extends UniEntity {
    public IsJob: boolean;
    public mainStatus: string;
    public Text: string;
    public Title: string;
    public employeestatus: Array<EmployeeStatus>;
}


export class EmployeeStatus extends UniEntity {
    public employeeID: number;
    public info: string;
    public ssn: string;
    public status: string;
    public year: number;
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
    public employeeID: number;
    public netPayment: number;
    public tax: number;
}


export class SumOnYear extends UniEntity {
}


export class VacationPayLastYear extends UniEntity {
    public baseVacation: number;
    public employeeID: number;
    public paidHolidayPay: number;
}


export class SalaryTransactionPay extends UniEntity {
    public CompanyAddress: string;
    public CompanyBankAccountID: number;
    public CompanyCity: string;
    public CompanyName: string;
    public CompanyPostalCode: string;
    public PaymentDate: Date;
    public SalaryBankAccountID: number;
    public TaxBankAccountID: number;
    public Withholding: number;
    public PayList: Array<SalaryTransactionPayLine>;
    public SalaryBalancePayList: Array<SalaryBalancePayLine>;
}


export class SalaryTransactionPayLine extends UniEntity {
    public Account: string;
    public Address: string;
    public City: string;
    public EmployeeName: string;
    public EmployeeNumber: number;
    public NetPayment: number;
    public PostalCode: string;
    public Tax: number;
}


export class SalaryBalancePayLine extends UniEntity {
    public Account: string;
    public Kid: string;
    public Sum: number;
    public Text: string;
}


export class PostingSummary extends UniEntity {
    public SubEntity: SubEntity;
    public PayrollRun: PayrollRun;
    public PostList: Array<JournalEntryLine>;
}


export class PaycheckReportSetup extends UniEntity {
    public EmpIDs: string;
    public Mail: PaycheckEmailInfo;
}


export class PaycheckEmailInfo extends UniEntity {
    public GroupByWageType: boolean;
    public Message: string;
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
    public BookedPayruns: number;
    public CalculatedPayruns: number;
    public CreatedPayruns: number;
    public FromPeriod: number;
    public ToPeriod: number;
    public Year: number;
    public Groups: Array<ReconciliationGroup>;
}


export class ReconciliationGroup extends UniEntity {
    public AccountNumber: string;
    public Sum: number;
    public Lines: Array<ReconciliationLine>;
}


export class ReconciliationLine extends UniEntity {
    public Benefit: string;
    public Description: string;
    public HasEmploymentTax: boolean;
    public IncomeType: string;
    public Sum: number;
    public WageTypeName: string;
    public WageTypeNumber: number;
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
    public Name: string;
    public OUO: number;
    public UnionDraw: number;
}


export class SalaryTransactionSums extends UniEntity {
    public baseAGA: number;
    public basePercentTax: number;
    public baseTableTax: number;
    public baseVacation: number;
    public calculatedAGA: number;
    public calculatedFinancialTax: number;
    public calculatedVacationPay: number;
    public Employee: number;
    public grossPayment: number;
    public manualTax: number;
    public netPayment: number;
    public paidAdvance: number;
    public paidPension: number;
    public Payrun: number;
    public percentTax: number;
    public tableTax: number;
}


export class SalaryTransactionPeriodSums extends UniEntity {
    public AgaRate: number;
    public AgaZone: string;
    public FromPeriod: number;
    public MunicipalName: string;
    public OrgNumber: string;
    public ToPeriod: number;
    public Year: number;
    public Sums: SalaryTransactionSums;
    public Aga: AGACalculation;
}


export class code extends UniEntity {
    public fordel: string;
    public gmlcode: string;
    public gyldigfom: string;
    public gyldigtil: string;
    public inngaarIGrunnlagForTrekk: string;
    public kunfranav: string;
    public postnr: string;
    public skatteOgAvgiftregel: string;
    public uninavn: string;
    public utloeserArbeidsgiveravgift: string;
    public loennsinntekt: Loennsinntekt;
    public ytelseFraOffentlige: YtelseFraOffentlige;
    public pensjonEllerTrygd: PensjonEllerTrygd;
    public naeringsinntekt: Naeringsinntekt;
    public fradrag: Fradrag;
    public forskuddstrekk: Forskuddstrekk;
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


export class CreateCompanyDetails extends UniEntity {
    public CompanyName: string;
    public ContractID: number;
    public CopyFiles: boolean;
    public IsTemplate: boolean;
    public LicenseKey: string;
    public ProductNames: string;
    public TemplateCompanyKey: string;
    public CompanySettings: CompanySettings;
}


export class UserDto extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'UserDto';

    public BankIntegrationUserName: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public DisplayName: string;
    public Email: string;
    public GlobalIdentity: string;
    public HasAgreedToImportDisclaimer: boolean;
    public ID: number;
    public IsAutobankAdmin: boolean;
    public LastLogin: Date;
    public PhoneNumber: string;
    public Protected: boolean;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public UserName: string;
    public License: ElsaUserLicenseInfo;
    public CustomFields: any;
}


export class ElsaUserLicenseInfo extends UniEntity {
    public Comment: string;
    public GlobalIdentity: string;
    public Name: string;
    public UserLicenseKey: string;
    public CustomerAgreement: CustomerLicenseAgreementInfo;
    public UserType: UserLicenseType;
    public Company: ElsaCompanyLicenseInfo;
    public ContractType: ContractLicenseType;
    public UserLicenseAgreement: LicenseAgreementInfo;
}


export class CustomerLicenseAgreementInfo extends UniEntity {
    public AgreementId: number;
    public CanAgreeToLicense: boolean;
    public HasAgreedToLicense: boolean;
}


export class UserLicenseType extends UniEntity {
    public EndDate: Date;
    public TypeID: number;
    public TypeName: string;
}


export class ElsaCompanyLicenseInfo extends UniEntity {
    public ContactEmail: string;
    public ContactPerson: string;
    public ContractID: number;
    public EndDate: Date;
    public ID: number;
    public Key: string;
    public Name: string;
    public StatusCode: LicenseStatus;
    public Agency: Agency;
}


export class Agency extends UniEntity {
    public CompanyKey: string;
    public Name: string;
}


export class ContractLicenseType extends UniEntity {
    public StartDate: Date;
    public TrialExpiration: Date;
    public TypeID: number;
    public TypeName: string;
}


export class LicenseAgreementInfo extends UniEntity {
    public AgreementId: number;
    public HasAgreedToLicense: boolean;
}


export class CreateBankUserDTO extends UniEntity {
    public AdminPassword: string;
    public AdminUserId: number;
    public IsAdmin: boolean;
    public Password: string;
    public Phone: string;
}


export class ResetAutobankPasswordDTO extends UniEntity {
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
    public GrantSum: number;
    public MaxFreeAmount: number;
    public UsedFreeAmount: number;
}


export class AuthenticationChallengeBE extends UniEntity {
    public Message: string;
    public Status: ChallengeRequestResult;
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
    public FromPeriod: Maaned;
    public IncludeEmployments: boolean;
    public IncludeIncome: boolean;
    public IncludeInfoPerPerson: boolean;
    public ReportType: ReportType;
    public ToPeriod: Maaned;
    public Year: number;
}


export class A07Response extends UniEntity {
    public Data: string;
    public DataName: string;
    public DataType: string;
    public mainStatus: string;
    public Text: string;
    public Title: string;
}


export class SetIntegrationDataDto extends UniEntity {
    public ExternalId: string;
    public IntegrationKey: string;
}


export class CurrencyRateData extends UniEntity {
    public ExchangeRate: number;
    public Factor: number;
    public IsOverrideRate: boolean;
    public FromCurrencyCode: CurrencyCode;
}


export class EmailDTO extends UniEntity {
    public CopyAddress: string;
    public Format: string;
    public FromAddress: string;
    public Message: string;
    public ReportID: number;
    public Subject: string;
    public Parameters: Array<ReportParameter>;
}


export class ReportParameter extends UniEntity {
    public Name: string;
    public Value: string;
}


export class SendEmail extends UniEntity {
    public CopyAddress: string;
    public EntityID: number;
    public EntityType: string;
    public ExternalReference: string;
    public FromAddress: string;
    public Localization: string;
    public Message: string;
    public ReportID: number;
    public ReportName: string;
    public Subject: string;
    public Attachments: Array<SendEmailAttachment>;
    public Parameters: Array<ReportParameter>;
}


export class SendEmailAttachment extends UniEntity {
    public Attachment: string;
    public FileID: number;
    public FileName: string;
}


export class RssList extends UniEntity {
    public Description: string;
    public Title: string;
    public Url: string;
    public Items: Array<RssItem>;
}


export class RssItem extends UniEntity {
    public Category: string;
    public Description: string;
    public Guid: string;
    public Link: string;
    public PubDate: string;
    public Title: string;
    public Enclosure: Enclosure;
}


export class Enclosure extends UniEntity {
    public Length: string;
    public Type: string;
    public Url: string;
}


export class TeamReport extends UniEntity {
    public FromDate: LocalDate;
    public ToDate: LocalDate;
    public Team: Team;
    public Members: Array<MemberDetails>;
}


export class MemberDetails extends UniEntity {
    public ExpectedMinutes: number;
    public MinutesWorked: number;
    public Name: string;
    public ReportBalance: number;
    public TotalBalance: number;
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
    public contactphone: string;
    public orgname: string;
    public orgno: string;
}


export class AccountUsageReference extends UniEntity {
    public Entity: string;
    public EntityID: number;
    public Info: string;
}


export class MandatoryDimensionAccountReport extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'MandatoryDimensionAccountReport';

    public AccountID: number;
    public AccountNumber: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public DimensionsID: number;
    public ID: number;
    public journalEntryLineDraftID: number;
    public MissingOnlyWarningsDimensionsMessage: string;
    public MissingRequiredDimensionsMessage: string;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CustomFields: any;
}


export class AccountDimension extends UniEntity {
    public AccountID: number;
    public AccountNumber: number;
    public DimensionsID: number;
    public Dimensions: Dimensions;
}


export class BankData extends UniEntity {
    public AccountNumber: string;
    public IBAN: string;
    public Bank: Bank;
}


export class CreateBankIntegrationDTO extends UniEntity {
    public Bank: string;
    public BankAcceptance: boolean;
    public BankAccountID: number;
    public BankApproval: boolean;
    public DisplayName: string;
    public Email: string;
    public IsBankBalance: boolean;
    public IsBankStatement: boolean;
    public IsInbound: boolean;
    public IsOutgoing: boolean;
    public Password: string;
    public Phone: string;
    public RequireTwoStage: boolean;
    public UserName: string;
    public BankAccounts: Array<BankAccountDTO>;
}


export class BankAccountDTO extends UniEntity {
    public BBAN: string;
    public Bic: string;
    public IBAN: string;
    public IsBankBalance: boolean;
    public IsBankStatement: boolean;
    public IsInbound: boolean;
    public IsOutgoing: boolean;
}


export class AutobankUserDTO extends UniEntity {
    public IsAdmin: boolean;
    public Password: string;
    public Phone: string;
    public UserID: number;
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
    public Closed: boolean;
    public Date: Date;
    public ID: number;
    public IsBankEntry: boolean;
}


export class MatchSettings extends UniEntity {
    public MaxDayOffset: number;
    public MaxDelta: number;
}


export class ReconciliationStatus extends UniEntity {
    public AccountID: number;
    public FromDate: Date;
    public IsReconciled: boolean;
    public NumberOfItems: number;
    public NumberOfUnReconciled: number;
    public Todate: Date;
    public TotalAmount: number;
    public TotalUnreconciled: number;
}


export class BalanceDto extends UniEntity {
    public Balance: number;
    public EndDate: Date;
    public StartDate: Date;
}


export class BankfileFormat extends UniEntity {
    public FileExtension: string;
    public IsFixed: boolean;
    public IsXml: boolean;
    public LinePrefix: string;
    public Name: string;
    public Separator: string;
    public SkipRows: number;
    public Columns: Array<BankfileColumn>;
}


export class BankfileColumn extends UniEntity {
    public DataType: BankfileDataType;
    public FieldMapping: BankfileField;
    public Length: number;
    public StartPos: number;
}


export class ReportRow extends UniEntity {
    public AccountName: string;
    public AccountNumber: number;
    public AccountYear: number;
    public BudgetAccumulated: number;
    public BudgetSum: number;
    public BudPeriod1: number;
    public BudPeriod10: number;
    public BudPeriod11: number;
    public BudPeriod12: number;
    public BudPeriod2: number;
    public BudPeriod3: number;
    public BudPeriod4: number;
    public BudPeriod5: number;
    public BudPeriod6: number;
    public BudPeriod7: number;
    public BudPeriod8: number;
    public BudPeriod9: number;
    public GroupName: string;
    public GroupNumber: number;
    public ID: number;
    public IsSubTotal: boolean;
    public Period1: number;
    public Period10: number;
    public Period11: number;
    public Period12: number;
    public Period2: number;
    public Period3: number;
    public Period4: number;
    public Period5: number;
    public Period6: number;
    public Period7: number;
    public Period8: number;
    public Period9: number;
    public PrecedingBalance: number;
    public SubGroupName: string;
    public SubGroupNumber: number;
    public Sum: number;
    public SumLastYear: number;
    public SumPeriod: number;
    public SumPeriodAccumulated: number;
    public SumPeriodLastYear: number;
    public SumPeriodLastYearAccumulated: number;
}


export class BudgetImport extends UniEntity {
    public Budget: Budget;
}


export class IActionResult extends UniEntity {
}


export class JournalEntryData extends UniEntity {
    public Amount: number;
    public AmountCurrency: number;
    public CreditAccountID: number;
    public CreditAccountNumber: number;
    public CreditVatTypeID: number;
    public CurrencyExchangeRate: number;
    public CurrencyID: number;
    public CustomerInvoiceID: number;
    public CustomerOrderID: number;
    public DebitAccountID: number;
    public DebitAccountNumber: number;
    public DebitVatTypeID: number;
    public Description: string;
    public DueDate: LocalDate;
    public FinancialDate: LocalDate;
    public InvoiceNumber: string;
    public JournalEntryDataAccrualID: number;
    public JournalEntryID: number;
    public JournalEntryNo: string;
    public NumberSeriesID: number;
    public NumberSeriesTaskID: number;
    public PaymentID: string;
    public PostPostJournalEntryLineID: number;
    public StatusCode: number;
    public SupplierInvoiceID: number;
    public SupplierInvoiceNo: string;
    public VatDate: LocalDate;
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
    public PeriodName: string;
    public PeriodNo: number;
    public PeriodSumYear1: number;
    public PeriodSumYear2: number;
}


export class JournalEntryLineRequestSummary extends UniEntity {
    public SumBalance: number;
    public SumCredit: number;
    public SumDebit: number;
    public SumLedger: number;
    public SumTaxBasisAmount: number;
}


export class JournalEntryLinePostPostData extends UniEntity {
    public AccountYear: number;
    public Amount: number;
    public AmountCurrency: number;
    public CurrencyCodeCode: string;
    public CurrencyCodeID: number;
    public CurrencyCodeShortCode: string;
    public CurrencyExchangeRate: number;
    public Description: string;
    public DueDate: Date;
    public FinancialDate: Date;
    public ID: number;
    public InvoiceNumber: string;
    public JournalEntryID: number;
    public JournalEntryNumber: string;
    public JournalEntryNumberNumeric: number;
    public JournalEntryTypeName: string;
    public MarkedAgainstJournalEntryLineID: number;
    public MarkedAgainstJournalEntryNumber: string;
    public NumberOfPayments: number;
    public PaymentID: string;
    public PeriodNo: number;
    public RestAmount: number;
    public RestAmountCurrency: number;
    public StatusCode: number;
    public SubAccountName: string;
    public SubAccountNumber: number;
    public SumPostPostAmount: number;
    public SumPostPostAmountCurrency: number;
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
    public AmountCurrency: number;
    public FinancialDate: Date;
    public ID: number;
    public InvoiceNumber: string;
    public JournalEntryNumber: string;
    public OriginalRestAmount: number;
    public OriginalStatusCode: StatusCodeJournalEntryLine;
    public RestAmount: number;
    public RestAmountCurrency: number;
    public StatusCode: StatusCodeJournalEntryLine;
    public Markings: Array<MarkingReference>;
}


export class MarkingReference extends UniEntity {
    public ID: number;
    public JournalEntryNumber: string;
}


export class VatReportMessage extends UniEntity {
    public Level: ValidationLevel;
    public Message: string;
}


export class VatReportSummary extends UniEntity {
    public HasTaxAmount: boolean;
    public HasTaxBasis: boolean;
    public IsHistoricData: boolean;
    public NumberOfJournalEntryLines: number;
    public SumTaxBasisAmount: number;
    public SumVatAmount: number;
    public VatCodeGroupID: number;
    public VatCodeGroupName: string;
    public VatCodeGroupNo: string;
}


export class VatReportSummaryPerPost extends UniEntity {
    public HasTaxAmount: boolean;
    public HasTaxBasis: boolean;
    public IsHistoricData: boolean;
    public NumberOfJournalEntryLines: number;
    public SumTaxBasisAmount: number;
    public SumVatAmount: number;
    public VatCodeGroupID: number;
    public VatCodeGroupName: string;
    public VatCodeGroupNo: string;
    public VatPostID: number;
    public VatPostName: string;
    public VatPostNo: string;
    public VatPostReportAsNegativeAmount: boolean;
}


export class VatReportSummaryPerPostPerAccount extends UniEntity {
    public Amount: number;
    public Description: string;
    public FinancialDate: Date;
    public HasTaxAmount: boolean;
    public HasTaxBasis: boolean;
    public IsHistoricData: boolean;
    public JournalEntryNumber: string;
    public NumberOfJournalEntryLines: number;
    public StdVatCode: string;
    public SumTaxBasisAmount: number;
    public SumVatAmount: number;
    public TaxBasisAmount: number;
    public VatAccountID: number;
    public VatAccountName: string;
    public VatAccountNumber: number;
    public VatCode: string;
    public VatCodeGroupID: number;
    public VatCodeGroupName: string;
    public VatCodeGroupNo: string;
    public VatDate: Date;
    public VatJournalEntryPostAccountID: number;
    public VatJournalEntryPostAccountName: string;
    public VatJournalEntryPostAccountNumber: number;
    public VatPostID: number;
    public VatPostName: string;
    public VatPostNo: string;
    public VatPostReportAsNegativeAmount: boolean;
}


export class VatReportNotReportedJournalEntryData extends UniEntity {
    public NumberOfJournalEntryLines: number;
    public SumTaxBasisAmount: number;
    public SumVatAmount: number;
    public TerminPeriodID: number;
}


export class AltinnSigningTextResponse extends UniEntity {
    public SigningText: string;
}


export class AltinnGetVatReportDataFromAltinnResult extends UniEntity {
    public Message: string;
    public Status: AltinnGetVatReportDataFromAltinnStatus;
}


export class VippsUpdateStatus extends UniEntity {
    public InvoiceID: string;
    public StatusCode: number;
}


export class VippsUser extends UniEntity {
    public PhoneNumber: string;
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


export enum ActionCodeBankRule{
    JournalWithoutMatch = 1,
    DoNotJournal = 2,
    IgnorePayment = 3,
    BookToAccount = 4,
}


export enum SuggestionSource{
    InternalCompanyHistory = 1,
    CommonSupplierHistory = 2,
    CommonIndustryHistory = 3,
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


export enum LicenseStatus{
    Draft = 0,
    Pending = 3,
    Active = 5,
    Paused = 10,
    Canceled = 11,
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


export enum StatusCodeBankIntegrationAgreement{
    Pending = 700001,
    WaitForSigning = 700002,
    WaitForBankApprove = 700003,
    WaitForZDataApprove = 700004,
    Active = 700005,
    Canceled = 700006,
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


export enum StatusCodeSharing{
    Pending = 70000,
    InProgress = 70001,
    Failed = 70002,
    Completed = 70003,
    Cancelled = 70004,
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


export enum VippsProcessStatus{
    Created = 41000,
    Rejected = 42000,
    Pending = 43000,
    Expired = 44000,
    Approved = 45000,
    Deleted = 46000,
    Revoked = 47000,
}


export enum CustomFieldStatus{
    Draft = 110100,
    Active = 110101,
}
