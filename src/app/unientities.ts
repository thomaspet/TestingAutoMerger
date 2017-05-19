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

    public BusinessRelationID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public ID: number;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public UserID: number;
    public Info: BusinessRelation;
    public Relations: Array<WorkRelation>;
    public CustomFields: any;
}


export class WorkItem extends UniEntity {
    public static RelativeUrl = 'workitems';
    public static EntityType = 'WorkItem';

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
    public CustomerOrder: CustomerOrder;
    public Dimensions: Dimensions;
    public CustomFields: any;
}


export class WorkItemGroup extends UniEntity {
    public static RelativeUrl = 'workitemgroups';
    public static EntityType = 'WorkItemGroup';

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


export class WorkTimeOff extends UniEntity {
    public static RelativeUrl = 'worktimeoff';
    public static EntityType = 'WorkTimeOff';

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


export class WorkProfile extends UniEntity {
    public static RelativeUrl = 'workprofiles';
    public static EntityType = 'WorkProfile';

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

    public CompanyID: number;
    public CompanyName: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public Description: string;
    public EmploymentID: number;
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
    public WorkProfile: WorkProfile;
    public Worker: Worker;
    public Employment: Employment;
    public Items: Array<WorkItem>;
    public Team: Team;
    public CustomFields: any;
}


export class WorkType extends UniEntity {
    public static RelativeUrl = 'worktypes';
    public static EntityType = 'WorkType';

    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public Description: string;
    public ID: number;
    public Name: string;
    public StatusCode: number;
    public SystemType: WorkTypeEnum;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CustomFields: any;
}


export class FieldLayout extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'FieldLayout';

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


export class ComponentLayout extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ComponentLayout';

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


export class UserRole extends UniEntity {
    public static RelativeUrl = 'userroles';
    public static EntityType = 'UserRole';

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


export class CustomerInvoiceReminderRule extends UniEntity {
    public static RelativeUrl = 'invoicereminderrules';
    public static EntityType = 'CustomerInvoiceReminderRule';

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

    public AcceptPaymentWithoutReminderFee: boolean;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public ID: number;
    public MinimumAmountToRemind: number;
    public RemindersBeforeDebtCollection: number;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CustomerInvoiceReminderRules: Array<CustomerInvoiceReminderRule>;
    public CustomFields: any;
}


export class CustomerInvoiceReminder extends UniEntity {
    public static RelativeUrl = 'invoicereminders';
    public static EntityType = 'CustomerInvoiceReminder';

    public CreatedAt: Date;
    public CreatedBy: string;
    public CreatedByReminderRuleID: number;
    public CurrencyCodeID: number;
    public CurrencyExchangeRate: number;
    public CustomerInvoiceID: number;
    public Deleted: boolean;
    public Description: string;
    public DueDate: LocalDate;
    public EmailAddress: string;
    public ID: number;
    public RemindedDate: LocalDate;
    public ReminderFee: number;
    public ReminderFeeCurrency: number;
    public ReminderNumber: number;
    public RunNumber: number;
    public StatusCode: number;
    public Title: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CurrencyCode: CurrencyCode;
    public CustomerInvoice: CustomerInvoice;
    public CreatedByReminderRule: CustomerInvoiceReminderRule;
    public CustomFields: any;
}


export class Customer extends UniEntity {
    public static RelativeUrl = 'customers';
    public static EntityType = 'Customer';

    public AcceptableDelta4CustomerPayment: number;
    public AcceptableDelta4CustomerPaymentAccountID: number;
    public BusinessRelationID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public CreditDays: number;
    public CurrencyCodeID: number;
    public CustomerInvoiceReminderSettingsID: number;
    public CustomerNumber: number;
    public Deleted: boolean;
    public DimensionsID: number;
    public DontSendReminders: boolean;
    public GLN: string;
    public ID: number;
    public OrgNumber: string;
    public PeppolAddress: string;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public WebUrl: string;
    public Info: BusinessRelation;
    public Dimensions: Dimensions;
    public CustomerInvoiceReminderSettings: CustomerInvoiceReminderSettings;
    public CustomerQuotes: Array<CustomerQuote>;
    public CustomerOrders: Array<CustomerOrder>;
    public CustomerInvoices: Array<CustomerInvoice>;
    public CurrencyCode: CurrencyCode;
    public AcceptableDelta4CustomerPaymentAccount: Account;
    public CustomFields: any;
}


export class CustomerInvoice extends UniEntity {
    public static RelativeUrl = 'invoices';
    public static EntityType = 'CustomerInvoice';

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
    public Deleted: boolean;
    public DeliveryDate: LocalDate;
    public DeliveryMethod: string;
    public DeliveryName: string;
    public DeliveryTerm: string;
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
    public PaymentTerm: string;
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
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public VatTotalsAmount: number;
    public VatTotalsAmountCurrency: number;
    public YourReference: string;
    public BankAccount: BankAccount;
    public JournalEntry: JournalEntry;
    public Customer: Customer;
    public CurrencyCode: CurrencyCode;
    public InvoiceNumberNumberSeries: NumberSeries;
    public Items: Array<CustomerInvoiceItem>;
    public InvoiceReference: CustomerInvoice;
    public CustomFields: any;
}


export class CustomerInvoiceItem extends UniEntity {
    public static RelativeUrl = 'invoiceitems';
    public static EntityType = 'CustomerInvoiceItem';

    public AccountID: number;
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
    public VatTypeID: number;
    public Product: Product;
    public VatType: VatType;
    public Dimensions: Dimensions;
    public Account: Account;
    public CurrencyCode: CurrencyCode;
    public CustomFields: any;
}


export class CustomerOrder extends UniEntity {
    public static RelativeUrl = 'orders';
    public static EntityType = 'CustomerOrder';

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
    public Deleted: boolean;
    public DeliveryDate: LocalDate;
    public DeliveryMethod: string;
    public DeliveryTerm: string;
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
    public PaymentTerm: string;
    public PrintStatus: number;
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
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public VatTotalsAmount: number;
    public VatTotalsAmountCurrency: number;
    public YourReference: string;
    public Customer: Customer;
    public CurrencyCode: CurrencyCode;
    public OrderNumberNumberSeries: NumberSeries;
    public Items: Array<CustomerOrderItem>;
    public CustomFields: any;
}


export class CustomerOrderItem extends UniEntity {
    public static RelativeUrl = 'orderitems';
    public static EntityType = 'CustomerOrderItem';

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
    public VatTypeID: number;
    public Product: Product;
    public VatType: VatType;
    public Dimensions: Dimensions;
    public Account: Account;
    public CurrencyCode: CurrencyCode;
    public CustomFields: any;
}


export class CustomerQuote extends UniEntity {
    public static RelativeUrl = 'quotes';
    public static EntityType = 'CustomerQuote';

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
    public Deleted: boolean;
    public DeliveryDate: LocalDate;
    public DeliveryMethod: string;
    public DeliveryTerm: string;
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
    public PaymentTerm: string;
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
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public ValidUntilDate: LocalDate;
    public VatTotalsAmount: number;
    public VatTotalsAmountCurrency: number;
    public YourReference: string;
    public Customer: Customer;
    public CurrencyCode: CurrencyCode;
    public QuoteNumberNumberSeries: NumberSeries;
    public Items: Array<CustomerQuoteItem>;
    public CustomFields: any;
}


export class CustomerQuoteItem extends UniEntity {
    public static RelativeUrl = 'quoteitems';
    public static EntityType = 'CustomerQuoteItem';

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
    public VatTypeID: number;
    public Product: Product;
    public VatType: VatType;
    public Dimensions: Dimensions;
    public Account: Account;
    public CurrencyCode: CurrencyCode;
    public CustomFields: any;
}


export class Supplier extends UniEntity {
    public static RelativeUrl = 'suppliers';
    public static EntityType = 'Supplier';

    public BusinessRelationID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public CreditDays: number;
    public CurrencyCodeID: number;
    public Deleted: boolean;
    public DimensionsID: number;
    public GLN: string;
    public ID: number;
    public OrgNumber: string;
    public PeppolAddress: string;
    public StatusCode: number;
    public SupplierNumber: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public WebUrl: string;
    public Info: BusinessRelation;
    public Dimensions: Dimensions;
    public CurrencyCode: CurrencyCode;
    public CustomFields: any;
}


export class Address extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Address';

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


export class Contact extends UniEntity {
    public static RelativeUrl = 'contacts';
    public static EntityType = 'Contact';

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


export class BusinessRelation extends UniEntity {
    public static RelativeUrl = 'business-relations';
    public static EntityType = 'BusinessRelation';

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
    public BankAccounts: Array<BankAccount>;
    public DefaultContact: Contact;
    public Contacts: Array<Contact>;
    public Addresses: Array<Address>;
    public Phones: Array<Phone>;
    public Emails: Array<Email>;
    public InvoiceAddress: Address;
    public ShippingAddress: Address;
    public DefaultPhone: Phone;
    public DefaultEmail: Email;
    public DefaultBankAccount: BankAccount;
    public CustomFields: any;
}


export class Email extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Email';

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

    public agaBase: number;
    public AGACalculationID: number;
    public agaRate: number;
    public AGARateID: number;
    public beregningsKode: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public ID: number;
    public StatusCode: number;
    public SubEntityID: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public zone: number;
    public subEntity: SubEntity;
    public CustomFields: any;
}


export class AGAPension extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AGAPension';

    public agaBase: number;
    public AGACalculationID: number;
    public agaRate: number;
    public AGARateID: number;
    public beregningsKode: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public ID: number;
    public StatusCode: number;
    public SubEntityID: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public zone: number;
    public subEntity: SubEntity;
    public CustomFields: any;
}


export class AGADraw extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AGADraw';

    public agaBase: number;
    public AGACalculationID: number;
    public agaRate: number;
    public AGARateID: number;
    public beregningsKode: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public ID: number;
    public StatusCode: number;
    public SubEntityID: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public zone: number;
    public subEntity: SubEntity;
    public CustomFields: any;
}


export class ForeignerWithPercent extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ForeignerWithPercent';

    public agaBase: number;
    public AGACalculationID: number;
    public agaRate: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public ID: number;
    public StatusCode: number;
    public SubEntityID: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public subEntity: SubEntity;
    public CustomFields: any;
}


export class DrawForeignerWithPercent extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'DrawForeignerWithPercent';

    public agaBase: number;
    public AGACalculationID: number;
    public agaRate: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public ID: number;
    public StatusCode: number;
    public SubEntityID: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public subEntity: SubEntity;
    public CustomFields: any;
}


export class ForeignerWithAmount extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'ForeignerWithAmount';

    public aga: number;
    public AGACalculationID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public ID: number;
    public persons: number;
    public StatusCode: number;
    public SubEntityID: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public subEntity: SubEntity;
    public CustomFields: any;
}


export class AmeldingData extends UniEntity {
    public static RelativeUrl = 'amelding';
    public static EntityType = 'AmeldingData';

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
    public period: number;
    public receiptID: number;
    public replacesID: number;
    public sent: Date;
    public status: number;
    public StatusCode: number;
    public type: AmeldingType;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public year: number;
    public log: Array<AmeldingLog>;
    public CustomFields: any;
}


export class AmeldingLog extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AmeldingLog';

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


export class EmployeeTaxCard extends UniEntity {
    public static RelativeUrl = 'taxcards';
    public static EntityType = 'EmployeeTaxCard';

    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public EmployeeID: number;
    public EmployeeNumber: number;
    public ID: number;
    public MunicipalityNo: string;
    public NonTaxableAmount: number;
    public NotMainEmployer: boolean;
    public StatusCode: number;
    public TaxPercentage: number;
    public TaxTable: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Year: number;
    public CustomFields: any;
}


export class PayrollRunCategoryLink extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'PayrollRunCategoryLink';

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


export class SalaryBalance extends UniEntity {
    public static RelativeUrl = 'salarybalances';
    public static EntityType = 'SalaryBalance';

    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public EmployeeID: number;
    public FromDate: Date;
    public ID: number;
    public Instalment: number;
    public InstalmentPercent: number;
    public InstalmentType: SalBalType;
    public KID: string;
    public Name: string;
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


export class SalaryTransactionSupplement extends UniEntity {
    public static RelativeUrl = 'supplements';
    public static EntityType = 'SalaryTransactionSupplement';

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


export class VacationPayLine extends UniEntity {
    public static RelativeUrl = 'VacationPayLines';
    public static EntityType = 'VacationPayLine';

    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public EmployeeID: number;
    public ID: number;
    public ManualVacationPayBase: number;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Year: number;
    public Employee: Employee;
    public CustomFields: any;
    public VacationPay60: number;
    public VacationPay: number;
    public Rate60: number;
    public Rate: number;
    public Age: number;
}


export class WageTypeSupplement extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'WageTypeSupplement';

    public ameldingType: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public Description: string;
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


export class BasicAmount extends UniEntity {
    public static RelativeUrl = 'basicamounts';
    public static EntityType = 'BasicAmount';

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

    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public FreeAmount: number;
    public HoursPerMonth: number;
    public ID: number;
    public InterrimRemitAccount: number;
    public MainAccountAllocatedAGA: number;
    public MainAccountAllocatedAGAVacation: number;
    public MainAccountAllocatedVacation: number;
    public MainAccountCostAGA: number;
    public MainAccountCostAGAVacation: number;
    public MainAccountCostVacation: number;
    public PaymentInterval: CompanySalaryPaymentInterval;
    public PostToTaxDraw: boolean;
    public RemitRegularTraits: boolean;
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


export class EmployeeCategory extends UniEntity {
    public static RelativeUrl = 'employeecategories';
    public static EntityType = 'EmployeeCategory';

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


export class EmployeeLeave extends UniEntity {
    public static RelativeUrl = 'EmployeeLeave';
    public static EntityType = 'EmployeeLeave';

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
    public RenumerationType: RenumerationType;
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
    public Dimensions: Dimensions;
    public Employee: Employee;
    public SubEntity: SubEntity;
    public Leaves: Array<EmployeeLeave>;
    public CustomFields: any;
}


export class SubEntity extends UniEntity {
    public static RelativeUrl = 'subentities';
    public static EntityType = 'SubEntity';

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


export class Grant extends UniEntity {
    public static RelativeUrl = 'grants';
    public static EntityType = 'Grant';

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


export class PayrollRun extends UniEntity {
    public static RelativeUrl = 'payrollrun';
    public static EntityType = 'PayrollRun';

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


export class VacationRateEmployee extends UniEntity {
    public static RelativeUrl = 'employeevacationrates';
    public static EntityType = 'VacationRateEmployee';

    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
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

    public AccountNumber: number;
    public AccountNumber_balance: number;
    public Base_div1: boolean;
    public Base_div2: boolean;
    public Base_div3: boolean;
    public Base_EmploymentTax: boolean;
    public Base_Payment: boolean;
    public Base_Vacation: boolean;
    public Benefit: string;
    public CreatedAt: Date;
    public CreatedBy: string;
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
    public taxtype: TaxType;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public ValidYear: number;
    public WageTypeName: string;
    public WageTypeNumber: number;
    public SupplementaryInformations: Array<WageTypeSupplement>;
    public CustomFields: any;
}


export class SalaryTransaction extends UniEntity {
    public static RelativeUrl = 'salarytrans';
    public static EntityType = 'SalaryTransaction';

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
    public Text: string;
    public ToDate: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public WageTypeID: number;
    public WageTypeNumber: number;
    public payrollrun: PayrollRun;
    public Employee: Employee;
    public Wagetype: WageType;
    public employment: Employment;
    public Dimensions: Dimensions;
    public Supplements: Array<SalaryTransactionSupplement>;
    public CustomFields: any;
}


export class Employee extends UniEntity {
    public static RelativeUrl = 'employees';
    public static EntityType = 'Employee';

    public Active: boolean;
    public AdvancePaymentAmount: number;
    public BirthDate: Date;
    public BusinessRelationID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public EmployeeNumber: number;
    public EmploymentDate: Date;
    public ForeignWorker: ForeignWorker;
    public ID: number;
    public InternasjonalIDCountry: string;
    public InternasjonalIDType: InternationalIDType;
    public InternationalID: string;
    public PaymentInterval: PaymentInterval;
    public PhotoID: number;
    public Sex: number;
    public SocialSecurityNumber: string;
    public StatusCode: number;
    public SubEntityID: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public VacationRateEmployeeID: number;
    public SubEntity: SubEntity;
    public Employments: Array<Employment>;
    public BusinessRelationInfo: BusinessRelation;
    public VacationRateEmployee: VacationRateEmployee;
    public TaxCards: Array<EmployeeTaxCard>;
    public CustomFields: any;
}


export class EHFLog extends UniEntity {
    public static RelativeUrl = 'ehf';
    public static EntityType = 'EHFLog';

    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public EntityID: number;
    public EntityType: string;
    public Guid: string;
    public ID: number;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CustomFields: any;
}


export class StatusLog extends UniEntity {
    public static RelativeUrl = 'statuslogs';
    public static EntityType = 'StatusLog';

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


export class EmailLog extends UniEntity {
    public static RelativeUrl = 'emails';
    public static EntityType = 'EmailLog';

    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public EntityID: number;
    public EntityType: string;
    public From: string;
    public ID: number;
    public StatusCode: number;
    public Subject: string;
    public To: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CustomFields: any;
}


export class PredefinedDescription extends UniEntity {
    public static RelativeUrl = 'predefineddescriptions';
    public static EntityType = 'PredefinedDescription';

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


export class Period extends UniEntity {
    public static RelativeUrl = 'periodes';
    public static EntityType = 'Period';

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


export class CompanySettings extends UniEntity {
    public static RelativeUrl = 'companysettings';
    public static EntityType = 'CompanySettings';

    public AcceptableDelta4CustomerPayment: number;
    public AcceptableDelta4CustomerPaymentAccountID: number;
    public AccountGroupSetID: number;
    public AccountingLockedDate: LocalDate;
    public AccountVisibilityGroupID: number;
    public AgioGainAccountID: number;
    public AgioLossAccountID: number;
    public APActivated: boolean;
    public APGuid: string;
    public AutoJournalPayment: boolean;
    public BankChargeAccountID: number;
    public BaseCurrencyCodeID: number;
    public CompanyBankAccountID: number;
    public CompanyName: string;
    public CompanyRegistered: boolean;
    public CompanyTypeID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public CurrentAccountingYear: number;
    public CustomerAccountID: number;
    public CustomerCreditDays: number;
    public CustomerInvoiceReminderSettingsID: number;
    public DefaultAddressID: number;
    public DefaultEmailID: number;
    public DefaultPhoneID: number;
    public DefaultProductInvoiceReminderID: number;
    public DefaultSalesAccountID: number;
    public Deleted: boolean;
    public ForceSupplierInvoiceApproval: boolean;
    public GLN: string;
    public ID: number;
    public LogoFileID: number;
    public OfficeMunicipalityNo: string;
    public OrganizationNumber: string;
    public PaymentBankIdentification: string;
    public PeriodSeriesAccountID: number;
    public PeriodSeriesVatID: number;
    public RoundingNumberOfDecimals: number;
    public RoundingType: RoundingType;
    public SalaryBankAccountID: number;
    public SettlementVatAccountID: number;
    public ShowNumberOfDecimals: number;
    public StatusCode: number;
    public SupplierAccountID: number;
    public TaxBankAccountID: number;
    public TaxMandatory: boolean;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public UseXtraPaymentOrgXmlTag: boolean;
    public VatLockedDate: LocalDate;
    public VatReportFormID: number;
    public WebAddress: string;
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
    public CustomerInvoiceReminderSettings: CustomerInvoiceReminderSettings;
    public DefaultProductInvoiceReminder: Product;
    public BaseCurrencyCode: CurrencyCode;
    public AgioGainAccount: Account;
    public AgioLossAccount: Account;
    public BankChargeAccount: Account;
    public AcceptableDelta4CustomerPaymentAccount: Account;
    public CustomFields: any;
}


export class User extends UniEntity {
    public static RelativeUrl = 'users';
    public static EntityType = 'User';

    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public DisplayName: string;
    public Email: string;
    public GlobalIdentity: string;
    public ID: number;
    public LastLogin: Date;
    public PhoneNumber: string;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public UserName: string;
    public CustomFields: any;
}


export class TreeStructure extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'TreeStructure';

    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public Depth: number;
    public ID: number;
    public Lft: number;
    public ParentID: number;
    public Rght: number;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CustomFields: any;
}


export class ProductCategory extends UniEntity {
    public static RelativeUrl = 'productcategories';
    public static EntityType = 'ProductCategory';

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


export class Tracelink extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Tracelink';

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


export class Product extends UniEntity {
    public static RelativeUrl = 'products';
    public static EntityType = 'Product';

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


export class Region extends UniEntity {
    public static RelativeUrl = 'regions';
    public static EntityType = 'Region';

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


export class Department extends UniEntity {
    public static RelativeUrl = 'departments';
    public static EntityType = 'Department';

    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public DepartmentManagerName: string;
    public DepartmentNumber: number;
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


export class Dimensions extends UniEntity {
    public static RelativeUrl = 'dimensions';
    public static EntityType = 'Dimensions';

    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public DepartmentID: number;
    public ID: number;
    public ProjectID: number;
    public RegionID: number;
    public ResponsibleID: number;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Project: Project;
    public Department: Department;
    public Responsible: Responsible;
    public Region: Region;
    public CustomFields: any;
}


export class Project extends UniEntity {
    public static RelativeUrl = 'projects';
    public static EntityType = 'Project';

    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public Description: string;
    public ID: number;
    public Name: string;
    public ProjectLeadName: string;
    public ProjectNumber: number;
    public ProjectNumberSeriesID: number;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public ProjectNumberSeries: NumberSeries;
    public CustomFields: any;
}


export class Responsible extends UniEntity {
    public static RelativeUrl = 'responsibles';
    public static EntityType = 'Responsible';

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


export class Status extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'Status';

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

    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public EntityID: number;
    public EntityType: string;
    public ID: number;
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
    public Approvals: Array<Approval>;
    public User: User;
    public CustomFields: any;
}


export class TransitionFlow extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'TransitionFlow';

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


export class UniQueryFilter extends UniEntity {
    public static RelativeUrl = 'uniqueryfilters';
    public static EntityType = 'UniQueryFilter';

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


export class UniQueryField extends UniEntity {
    public static RelativeUrl = 'uniqueryfields';
    public static EntityType = 'UniQueryField';

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


export class UniQueryDefinition extends UniEntity {
    public static RelativeUrl = 'uniquerydefinitions';
    public static EntityType = 'UniQueryDefinition';

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


export class Team extends UniEntity {
    public static RelativeUrl = 'teams';
    public static EntityType = 'Team';

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


export class File extends UniEntity {
    public static RelativeUrl = 'files/{entitytype}/{entityid}';
    public static EntityType = 'File';

    public ContentType: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public Description: string;
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
    public FileTags: Array<FileTag>;
    public CustomFields: any;
}


export class FileTag extends UniEntity {
    public static RelativeUrl = 'filetags';
    public static EntityType = 'FileTag';

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

    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public EntityID: number;
    public EntityType: string;
    public FileID: number;
    public ID: number;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public File: File;
    public CustomFields: any;
}


export class Comment extends UniEntity {
    public static RelativeUrl = 'comments';
    public static EntityType = 'Comment';

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


export class Altinn extends UniEntity {
    public static RelativeUrl = 'altinn';
    public static EntityType = 'Altinn';

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


export class AltinnSigning extends UniEntity {
    public static RelativeUrl = 'altinnsigning';
    public static EntityType = 'AltinnSigning';

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


export class AltinnReceipt extends UniEntity {
    public static RelativeUrl = 'altinnreceipts';
    public static EntityType = 'AltinnReceipt';

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


export class AltinnCorrespondanceReader extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AltinnCorrespondanceReader';

    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public ID: number;
    public Pin: string;
    public PreferredLogin: string;
    public ReceiptID: number;
    public ResponseMessage: string;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public UserID: string;
    public UserPassword: string;
    public CustomFields: any;
}


export class NumberSeriesTask extends UniEntity {
    public static RelativeUrl = 'number-series-tasks';
    public static EntityType = 'NumberSeriesTask';

    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public EntityType: string;
    public ID: number;
    public Name: string;
    public NumberSeriesTaskType: NumberSeriesTaskType;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CustomFields: any;
}

export class PredefinedDescription extends UniEntity {
    public static RelativeUrl = 'predefineddescriptions';
    public static EntityType = 'PredefinedDescription';

    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public ID: number;

    public Code: string;
    public Description: string;
    public Type: number;
}

export class NumberSeriesInvalidOverlap extends UniEntity {
    public static RelativeUrl = 'number-series-invalid-overlaps';
    public static EntityType = 'NumberSeriesInvalidOverlap';

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


export class NumberSeries extends UniEntity {
    public static RelativeUrl = 'number-series';
    public static EntityType = 'NumberSeries';

    public AccountYear: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public Disabled: boolean;
    public Empty: boolean;
    public FromNumber: number;
    public ID: number;
    public Name: string;
    public NextNumber: number;
    public NumberLock: boolean;
    public NumberSeriesTaskID: number;
    public NumberSeriesTypeID: number;
    public StatusCode: number;
    public ToNumber: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public UseNumbersFromNumberSeriesID: number;
    public NumberSeriesType: NumberSeriesType;
    public UseNumbersFromNumberSeries: NumberSeries;
    public NumberSeriesTask: NumberSeriesTask;
    public CustomFields: any;
}


export class NumberSeriesType extends UniEntity {
    public static RelativeUrl = 'number-series-types';
    public static EntityType = 'NumberSeriesType';

    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public EntityType: string;
    public ID: number;
    public Name: string;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Yearly: boolean;
    public CustomFields: any;
}



export class NumberSeriesInvalidOverlap extends UniEntity {
    public static RelativeUrl = 'number-series-invalid-overlaps';
    public static EntityType = 'NumberSeriesInvalidOverlap';

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


export class NumberSeries extends UniEntity {
    public static RelativeUrl = 'number-series';
    public static EntityType = 'NumberSeries';

    public AccountYear: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public Disabled: boolean;
    public Empty: boolean;
    public FromNumber: number;
    public ID: number;
    public Name: string;
    public NextNumber: number;
    public NumberLock: boolean;
    public NumberSeriesTaskID: number;
    public NumberSeriesTypeID: number;
    public StatusCode: number;
    public ToNumber: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public UseNumbersFromNumberSeriesID: number;
    public NumberSeriesType: NumberSeriesType;
    public UseNumbersFromNumberSeries: NumberSeries;
    public NumberSeriesTask: NumberSeriesTask;
    public CustomFields: any;
}


export class NumberSeriesType extends UniEntity {
    public static RelativeUrl = 'number-series-types';
    public static EntityType = 'NumberSeriesType';

    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public EntityType: string;
    public ID: number;
    public Name: string;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Yearly: boolean;
    public CustomFields: any;
}


export class CurrencyOverride extends UniEntity {
    public static RelativeUrl = 'currencyoverrides';
    public static EntityType = 'CurrencyOverride';

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


export class AccountVisibilityGroupAccount extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AccountVisibilityGroupAccount';

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


export class AccountVisibilityGroup extends UniEntity {
    public static RelativeUrl = 'accountvisibilitygroups';
    public static EntityType = 'AccountVisibilityGroup';

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


export class Agreement extends UniEntity {
    public static RelativeUrl = 'agreements';
    public static EntityType = 'Agreement';

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


export class CurrencyCode extends UniEntity {
    public static RelativeUrl = 'currencycodes';
    public static EntityType = 'CurrencyCode';

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


export class PaymentBatchType extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'PaymentBatchType';

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


export class Currency extends UniEntity {
    public static RelativeUrl = 'currencies';
    public static EntityType = 'Currency';

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


export class PostalCode extends UniEntity {
    public static RelativeUrl = 'postalcodes';
    public static EntityType = 'PostalCode';

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


export class Language extends UniEntity {
    public static RelativeUrl = 'languages';
    public static EntityType = 'Language';

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


export class AccountGroupSetup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AccountGroupSetup';

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
    public AccountGroup: AccountGroupSetup;
    public CustomFields: any;
}


export class AGARate extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AGARate';

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


export class Company extends UniEntity {
    public static RelativeUrl = 'companies';
    public static EntityType = 'Company';

    public ConnectionString: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public FileFlowEmail: string;
    public ID: number;
    public IsTest: boolean;
    public Key: string;
    public Name: string;
    public SchemaName: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public WebHookSubscriberId: string;
    public CustomFields: any;
}


export class CompanyAccess extends UniEntity {
    public static RelativeUrl = 'companies-access';
    public static EntityType = 'CompanyAccess';

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


export class CompanyType extends UniEntity {
    public static RelativeUrl = 'companytypes';
    public static EntityType = 'CompanyType';

    public CreatedAt: Date;
    public CreatedBy: string;
    public DefaultAccountVisibilityGroupID: number;
    public DefaultPlanType: PlanTypeEnum;
    public Deleted: boolean;
    public Description: string;
    public FullName: string;
    public ID: number;
    public Name: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CustomFields: any;
}


export class Country extends UniEntity {
    public static RelativeUrl = 'countries';
    public static EntityType = 'Country';

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


export class EmploymentValidValues extends UniEntity {
    public static RelativeUrl = 'employmentvalidvalues';
    public static EntityType = 'EmploymentValidValues';

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
    public PaymentType: RenumerationType;
    public RenumerationType: boolean;
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


export class Municipal extends UniEntity {
    public static RelativeUrl = 'Municipals';
    public static EntityType = 'Municipal';

    public CountyName: string;
    public CountyNo: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public ID: number;
    public MunicipalityName: string;
    public MunicipalityNo: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CustomFields: any;
}


export class MunicipalAGAZone extends UniEntity {
    public static RelativeUrl = 'MunicipalAGAZones';
    public static EntityType = 'MunicipalAGAZone';

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


export class PaymentCode extends UniEntity {
    public static RelativeUrl = 'paymentCodes';
    public static EntityType = 'PaymentCode';

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


export class StaticRegister extends UniEntity {
    public static RelativeUrl = 'StaticRegister';
    public static EntityType = 'StaticRegister';

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


export class VatCodeGroupSetup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'VatCodeGroupSetup';

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

    public CreatedAt: Date;
    public CreatedBy: string;
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
    public ValidFrom: Date;
    public ValidTo: Date;
    public VatCode: string;
    public VatCodeGroupNo: string;
    public VatPercent: number;
    public CustomFields: any;
}


export class PeriodSeries extends UniEntity {
    public static RelativeUrl = 'period-series';
    public static EntityType = 'PeriodSeries';

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


export class ReportDefinition extends UniEntity {
    public static RelativeUrl = 'report-definitions';
    public static EntityType = 'ReportDefinition';

    public Category: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public Description: string;
    public ID: number;
    public Md5: string;
    public Name: string;
    public TemplateLinkId: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Visible: boolean;
    public CustomFields: any;
}


export class ReportDefinitionDataSource extends UniEntity {
    public static RelativeUrl = 'report-definition-data-sources';
    public static EntityType = 'ReportDefinitionDataSource';

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

    public CreatedAt: Date;
    public CreatedBy: string;
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


export class Model extends UniEntity {
    public static RelativeUrl = 'models';
    public static EntityType = 'Model';

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


export class AccrualPeriod extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AccrualPeriod';

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


export class Accrual extends UniEntity {
    public static RelativeUrl = 'accruals';
    public static EntityType = 'Accrual';

    public AccrualAmount: number;
    public AccrualJournalEntryMode: number;
    public BalanceAccountID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public ID: number;
    public JournalEntryLineDraftID: number;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public BalanceAccount: Account;
    public JournalEntryLineDraft: JournalEntryLineDraft;
    public JournalEntryLines: Array<JournalEntryLine>;
    public Periods: Array<AccrualPeriod>;
    public CustomFields: any;
}


export class JournalEntryType extends UniEntity {
    public static RelativeUrl = 'journalentrytypes';
    public static EntityType = 'JournalEntryType';

    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public ExpectNegativeAmount: boolean;
    public ID: number;
    public Name: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CustomFields: any;
}


export class JournalEntryMode extends UniEntity {
    public static RelativeUrl = 'journalEntryModes';
    public static EntityType = 'JournalEntryMode';

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


export class JournalEntry extends UniEntity {
    public static RelativeUrl = 'journalentries';
    public static EntityType = 'JournalEntry';

    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public FinancialYearID: number;
    public ID: number;
    public JournalEntryNumber: string;
    public JournalEntryNumberNumeric: number;
    public NumberSeriesTaskType: NumberSeriesTaskType;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public FinancialYear: FinancialYear;
    public Lines: Array<JournalEntryLine>;
    public DraftLines: Array<JournalEntryLineDraft>;
    public CustomFields: any;
    public NumberSeriesTaskID: number;
}


export class JournalEntryLine extends UniEntity {
    public static RelativeUrl = 'journalentrylines';
    public static EntityType = 'JournalEntryLine';

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


export class PaymentBatch extends UniEntity {
    public static RelativeUrl = 'paymentbatches';
    public static EntityType = 'PaymentBatch';

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


export class Payment extends UniEntity {
    public static RelativeUrl = 'payments';
    public static EntityType = 'Payment';

    public Amount: number;
    public AmountCurrency: number;
    public AutoJournal: boolean;
    public BankChargeAmount: number;
    public BusinessRelationID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public CurrencyCodeID: number;
    public CurrencyExchangeRate: number;
    public Deleted: boolean;
    public Description: string;
    public DueDate: LocalDate;
    public FromBankAccountID: number;
    public ID: number;
    public InvoiceNumber: string;
    public IsCustomerPayment: boolean;
    public OcrPaymentStrings: string;
    public PaymentBatchID: number;
    public PaymentCodeID: number;
    public PaymentDate: LocalDate;
    public PaymentID: string;
    public PaymentNotificationReportFileID: number;
    public ReconcilePayment: boolean;
    public StatusCode: number;
    public StatusText: string;
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
    public CustomFields: any;
}


export class VatCodeGroup extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'VatCodeGroup';

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


export class VatReportArchivedSummary extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'VatReportArchivedSummary';

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


export class VatReportType extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'VatReportType';

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


export class VatReport extends UniEntity {
    public static RelativeUrl = 'vatreports';
    public static EntityType = 'VatReport';

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


export class VatPost extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'VatPost';

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
    public CustomFields: any;
}


export class VatReportReference extends UniEntity {
    public static RelativeUrl = 'vatreportreferences';
    public static EntityType = 'VatReportReference';

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


export class PostPost extends UniEntity {
    public static RelativeUrl = 'postposts';
    public static EntityType = 'PostPost';

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


export class SupplierInvoiceItem extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'SupplierInvoiceItem';

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
    public VatTypeID: number;
    public Product: Product;
    public VatType: VatType;
    public Dimensions: Dimensions;
    public CurrencyCode: CurrencyCode;
    public CustomFields: any;
}


export class SupplierInvoice extends UniEntity {
    public static RelativeUrl = 'supplierinvoices';
    public static EntityType = 'SupplierInvoice';

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
    public Deleted: boolean;
    public DeliveryDate: LocalDate;
    public DeliveryMethod: string;
    public DeliveryName: string;
    public DeliveryTerm: string;
    public DimensionsID: number;
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
    public JournalEntryID: number;
    public OurReference: string;
    public PayableRoundingAmount: number;
    public PayableRoundingCurrencyAmount: number;
    public Payment: string;
    public PaymentDueDate: LocalDate;
    public PaymentID: string;
    public PaymentInformation: string;
    public PaymentTerm: string;
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
    public CurrencyCode: CurrencyCode;
    public BankAccount: BankAccount;
    public Supplier: Supplier;
    public Items: Array<SupplierInvoiceItem>;
    public JournalEntry: JournalEntry;
    public Dimensions: Dimensions;
    public InvoiceReference: SupplierInvoice;
    public CustomFields: any;
}


export class JournalEntrySourceSerie extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'JournalEntrySourceSerie';

    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public ID: number;
    public JournalEntrySourceID: number;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CustomFields: any;
}


export class AccountGroupSet extends UniEntity {
    public static RelativeUrl = 'accountgroupsets';
    public static EntityType = 'AccountGroupSet';

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


export class Account extends UniEntity {
    public static RelativeUrl = 'accounts';
    public static EntityType = 'Account';

    public AccountGroupID: number;
    public AccountID: number;
    public AccountName: string;
    public AccountNumber: number;
    public AccountSetupID: number;
    public Active: boolean;
    public CreatedAt: Date;
    public CreatedBy: string;
    public CurrencyCodeID: number;
    public CustomerID: number;
    public Deleted: boolean;
    public DimensionsID: number;
    public EmployeeID: number;
    public ID: number;
    public Locked: boolean;
    public LockManualPosts: boolean;
    public StatusCode: number;
    public SubAccountNumberSeriesID: number;
    public SupplierID: number;
    public SystemAccount: boolean;
    public TopLevelAccountGroupID: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public UseDeductivePercent: boolean;
    public UsePostPost: boolean;
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
    public SubAccountNumberSeries: NumberSeries;
    public Alias: Array<AccountAlias>;
    public CompatibleAccountGroups: Array<AccountGroup>;
    public SubAccounts: Array<Account>;
    public CurrencyCode: CurrencyCode;
    public CustomFields: any;
}


export class AccountAlias extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'AccountAlias';

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


export class Bank extends UniEntity {
    public static RelativeUrl = 'banks';
    public static EntityType = 'Bank';

    public AddressID: number;
    public BIC: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public EmailID: number;
    public ID: number;
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
    public Bank: Bank;
    public Account: Account;
    public BusinessRelation: BusinessRelation;
    public CompanySettings: CompanySettings;
    public CustomFields: any;
}


export class FinancialYear extends UniEntity {
    public static RelativeUrl = 'financialyears';
    public static EntityType = 'FinancialYear';

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


export class VatDeduction extends UniEntity {
    public static RelativeUrl = 'vatdeductions';
    public static EntityType = 'VatDeduction';

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
    public CustomFields: any;
}


export class VatType extends UniEntity {
    public static RelativeUrl = 'vattypes';
    public static EntityType = 'VatType';

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
    public ValidFrom: Date;
    public ValidTo: Date;
    public VatCode: string;
    public VatCodeGroupID: number;
    public VatPercent: number;
    public VatTypeSetupID: number;
    public Visible: boolean;
    public IncomingAccount: Account;
    public OutgoingAccount: Account;
    public VatCodeGroup: VatCodeGroup;
    public VatReportReferences: Array<VatReportReference>;
    public CustomFields: any;
}


export class EntityValidationRule extends UniEntity {
    public static RelativeUrl = '';
    public static EntityType = 'EntityValidationRule';

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

    public CreatedAt: Date;
    public CreatedBy: string;
    public DataType: string;
    public Deleted: boolean;
    public EntityType: string;
    public ID: number;
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
    public InvoiceDate: Date;
    public InvoiceNumber: number;
    public ReminderNumber: number;
    public RestAmount: number;
    public RestAmountCurrency: number;
    public StatusCode: number;
    public TaxInclusiveAmount: number;
    public TaxInclusiveAmountCurrency: number;
}


export class CustomerBalanceReportData extends UniEntity {
    public AccountNumber: number;
    public CustomerID: number;
    public Name: string;
    public SumCredit: number;
    public SumDebit: number;
    public SumTotal: number;
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
    public AgioAccountID: number;
    public AgioAmount: number;
    public Amount: number;
    public AmountCurrency: number;
    public BankChargeAccountID: number;
    public BankChargeAmount: number;
    public CurrencyCodeID: number;
    public CurrencyExchangeRate: number;
    public PaymentDate: LocalDate;
}


export class InvoiceSummary extends UniEntity {
    public SumCreditedAmount: number;
    public SumRestAmount: number;
    public SumTotalAmount: number;
}


export class SupplierBalanceReportData extends UniEntity {
    public AccountNumber: number;
    public Name: string;
    public SumCredit: number;
    public SumDebit: number;
    public SumTotal: number;
    public SupplierID: number;
}


export class AmeldingAgaAndTaxSums extends UniEntity {
    public AccountNumber: string;
    public DueDate: Date;
    public EmploymentTax: number;
    public KIDEmploymentTax: string;
    public KIDTaxDraw: string;
    public MessageID: string;
    public period: number;
    public TaxDraw: number;
}


export class SalaryTransactionSums extends UniEntity {
    public baseAGA: number;
    public basePercentTax: number;
    public baseTableTax: number;
    public baseVacation: number;
    public calculatedAGA: number;
    public calculatedVacationPay: number;
    public Employee: number;
    public grossPayment: number;
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
}


export class VacationPayList extends UniEntity {
    public VacationPay: Array<VacationPayLine>;
}


export class VacationPayInfo extends UniEntity {
    public EmployeeID: number;
    public ManualVacationPayBase: number;
    public Withdrawal: number;
    public employee: Employee;
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
}


export class SalaryTransactionPayLine extends UniEntity {
    public Account: string;
    public Address: string;
    public City: string;
    public EmployeeName: string;
    public EmployeeNumber: number;
    public HasTaxInformation: boolean;
    public NetPayment: number;
    public PostalCode: string;
}


export class PostingSummary extends UniEntity {
    public SubEntity: SubEntity;
    public PayrollRun: PayrollRun;
    public PostList: Array<JournalEntryLine>;
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


export class OcrResult extends UniEntity {
    public language: string;
    public MaxTop: number;
    public MaxWidth: number;
    public orientation: string;
    public textAngle: string;
    public regions: Array<Region>;
    public OcrInvoiceReport: OcrInvoiceReport;
}


export class OcrInvoiceReport extends UniEntity {
    public SupplierID: number;
    public Orgno: SuggestedValue;
    public Kid: SuggestedValue;
    public BankAccount: SuggestedValue;
    public InvoiceDate: SuggestedValue;
    public DueDate: SuggestedValue;
    public DeliveryDate: SuggestedValue;
    public Amount: SuggestedValue;
    public InvoiceNumber: SuggestedValue;
}


export class SuggestedValue extends UniEntity {
    public Candidates: Array<HitWord>;
    public Value: HitWord;
}


export class HitWord extends UniEntity {
    public boundingBox: string;
    public DateValue: Date;
    public Hit: string;
    public text: string;
    public value: string;
}


export class AltinnAuthChallenge extends UniEntity {
    public Message: string;
    public Status: string;
    public ValidFrom: Date;
    public ValidTo: Date;
}


export class AltinnAuthRequest extends UniEntity {
    public PreferredLogin: string;
    public UserID: string;
    public UserPassword: string;
}


export class SendEmail extends UniEntity {
    public CopyAddress: string;
    public EmailLogID: number;
    public EntityID: number;
    public EntityType: string;
    public FromAddress: string;
    public Message: string;
    public Subject: string;
    public Attachments: Array<SendEmailAttachment>;
}


export class SendEmailAttachment extends UniEntity {
    public Attachment: string;
    public FileName: string;
}


export class CurrencyRateData extends UniEntity {
    public ExchangeRate: number;
    public Factor: number;
    public IsOverrideRate: boolean;
    public FromCurrencyCode: CurrencyCode;
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


export class IEnumerable extends UniEntity {
}


export class EHFActivate extends UniEntity {
    public contactemail: string;
    public contactname: string;
    public contactphone: string;
    public incommingInvoice: boolean;
    public outgoingInvoice: boolean;
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
    public PeriodNo: number;
    public RestAmount: number;
    public RestAmountCurrency: number;
    public StatusCode: number;
    public SumPostPostAmount: number;
    public SumPostPostAmountCurrency: number;
    public Markings: Array<JournalEntryLinePostPostData>;
}


export class JournalEntryLineCouple extends UniEntity {
}


export class AssignmentDetails extends UniEntity {
    public Message: string;
    public TeamIDs: string;
    public UserIDs: string;
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


export class VatReportNotReportedJournalEntryData extends UniEntity {
    public NumberOfJournalEntryLines: number;
    public SumTaxBasisAmount: number;
    public SumVatAmount: number;
    public TerminPeriodID: number;
}


export class AltinnGetVatReportDataFromAltinnResult extends UniEntity {
    public Message: string;
    public Status: AltinnGetVatReportDataFromAltinnStatus;
}


export class BankData extends UniEntity {
    public IBAN: string;
    public Bank: Bank;
}


export class JournalEntryData extends UniEntity {
    public Amount: number;
    public CreditAccountID: number;
    public CreditAccountNumber: number;
    public CreditVatTypeID: number;
    public CustomerInvoiceID: number;
    public CustomerOrderID: number;
    public DebitAccountID: number;
    public DebitAccountNumber: number;
    public DebitVatTypeID: number;
    public Description: string;
    public FinancialDate: LocalDate;
    public InvoiceNumber: string;
    public JournalEntryDataAccrualID: number;
    public JournalEntryID: number;
    public JournalEntryNo: string;
    public StatusCode: number;
    public SupplierInvoiceID: number;
    public SupplierInvoiceNo: string;
    public VatDeductionPercent: number;
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


export class RssList extends UniEntity {
    public Items: string;
    public Url: string;
    public Items: Array<RssItem>;
}


export class RssItem extends UniEntity {
    public Description: string;
    public Link: string;
    public PubDate: string;
    public Title: string;
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


export enum PhoneTypeEnum{
    PtPhone = 150101,
    PtMobile = 150102,
    PtFax = 150103,
}


export enum AmeldingType{
    Standard = 0,
    Employments = 1,
    Nullstilling = 2,
}


export enum SalaryRegistry{
    Employee = 0,
    Employment = 1,
    Trans = 2,
    Svalbard = 3,
    Permisjon = 4,
}


export enum SalBalType{
    Advance = 1,
    Contribution = 2,
    Outlay = 3,
    Garnishment = 4,
    Other = 5,
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
    Balance = 2,
}


export enum Valuetype{
    IsString = 1,
    IsDate = 2,
    IsBool = 3,
    IsMoney = 4,
    Period = 5,
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


export enum Leavetype{
    NotSet = 0,
    Leave = 1,
    LayOff = 2,
}


export enum RenumerationType{
    notSet = 0,
    Salaried = 1,
    HourlyPaid = 2,
    PaidOnCommission = 3,
    Fees = 4,
    Piecework = 5,
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
    SemiContinousShiftAndRotaWork = 3,
    ContinuousShiftAndOtherSchemes = 4,
    ShiftWork = 5,
}


export enum TaxDrawFactor{
    Standard = 1,
    Half = 2,
    None = 3,
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
}


export enum TaxType{
    Tax_None = 0,
    Tax_Table = 1,
    Tax_Percent = 2,
    Tax_0 = 3,
}


export enum StdSystemType{
    None = 0,
    PercentTaxDeduction = 1,
    HolidayPayBasisLastYear = 2,
    TableTaxDeduction = 4,
    Holidaypay = 5,
    AutoAdvance = 6,
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


export enum PredefinedDescriptionType{
    JournalEntryText = 1,
}


export enum RoundingType{
    Up = 0,
    Down = 1,
    Integer = 2,
    Half = 3,
}


export enum ProductTypeEnum{
    PStorage = 1,
    PHour = 2,
    POther = 3,
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


export enum TeamPositionEnum{
    NoPosition = 0,
    Member = 1,
    ReadAll = 10,
    WriteAll = 11,
    Approve = 12,
    Manager = 20,
}


export enum TypeOfLogin{
    none = 0,
    AltinnPin = 1,
    SMSPin = 2,
    TaxPin = 3,
}


export enum NumberSeriesTaskType{
    Journal = 1,
    CustomerInvoice = 2,
    SupplierInvoice = 3,
    Salary = 4,
    Bank = 5,
    VatReport = 6,
    Asset = 7,
}


export enum CurrencySourceEnum{
    NORGESBANK = 1,
}


export enum i18nModule{
    System = 0,
    Common = 1,
    Sales = 2,
    Salary = 3,
    TimeTracking = 4,
    Accounting = 5,
}


export enum PlanTypeEnum{
    NS4102 = 1,
}


export enum PeriodSeriesType{
    m = 0,
    r = 1,
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


export enum AltinnGetVatReportDataFromAltinnStatus{
    WaitingForAltinnResponse = 1,
    RejectedByAltinn = 2,
    ReportReceived = 3,
}


export enum StatusCodeCustomerInvoiceReminder{
    Registered = 42101,
    Sent = 42102,
    Paid = 42103,
    Completed = 42104,
    Failed = 42105,
    SentToDebtCollection = 42106,
}


export enum StatusCodeCustomerInvoice{
    Draft = 42001,
    Invoiced = 42002,
    PartlyPaid = 42003,
    Paid = 42004,
}


export enum StatusCodeCustomerInvoiceItem{
    Draft = 41301,
    Invoiced = 41302,
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


export enum InternalAmeldingStatus{
    IN_PROGRESS = 0,
    GENERATED = 1,
    SENT = 2,
    STATUS_FROM_ALTINN_RECEIVED = 3,
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


export enum StatusCodeAltinnSigning{
    NotSigned = 43001,
    PartialSigned = 43002,
    Signed = 43003,
    AlreadySigned = 43004,
    Failed = 43005,
}


export enum NotificationStatus{
    New = 900010,
    Read = 900020,
    Marked = 900030,
}


export enum StatusCodeAccrualPeriod{
    Registered = 33001,
    Accrued = 33002,
}


export enum StatusCodeJournalEntryLine{
    Open = 31001,
    PartlyMarked = 31002,
    Marked = 31003,
    Credited = 31004,
}


export enum StatusCodeJournalEntryLineDraft{
    Journaled = 34001,
    Credited = 34002,
}


export enum StatusCodeVatReport{
    Executed = 32001,
    Submitted = 32002,
    Rejected = 32003,
    Approved = 32004,
    Adjusted = 32005,
}


export enum StatusCodeSupplierInvoice{
    Draft = 30101,
    ForApproval = 30102,
    Approved = 30103,
    Journaled = 30104,
    ToPayment = 30105,
    PartlyPayed = 30106,
    Payed = 30107,
}


export enum CustomFieldStatus{
    Draft = 110100,
    Active = 110101,
}
