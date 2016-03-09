export class Customer {
	static relativeUrl = "customers";

	BusinessRelationID: number;
	Orgnumber: string;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	Info: BusinessRelation;
	CustomFields: any;
}


export class CustomerInvoice {
	static relativeUrl = "invoices";

	CustomerID: number;
	InvoiceDate: Date;
	PaymentDueDate: Date;
	InvoiceType: number;
	PaymentID: string;
	PaymentInformation: string;
	InvoiceID: number;
	Credited: boolean;
	BankAccount: string;
	Payment: string;
	AmountRegards: string;
	DeliveryName: string;
	JournalEntryID: number;
	InvoiceRecieverName: string;
	InvoiceAddressLine1: string;
	InvoiceAddressLine2: string;
	InvoiceAddressLine3: string;
	InvoicePostalCode: number;
	InvoiceCity: string;
	InvoiceCountryCode: string;
	InvoiceCountry: string;
	ShippingAddressLine1: string;
	ShippingAddressLine2: string;
	ShippingAddressLine3: string;
	ShippingPostalCode: number;
	ShippingCity: string;
	ShippingCountryCode: string;
	ShippingCountry: string;
	OurReference: string;
	YourReference: string;
	SalesPerson: string;
	CustomerPerson: string;
	DeliveryMethod: string;
	PaymentTerm: string;
	DeliveryTerm: string;
	DeliveryDate: Date;
	Comment: string;
	InternalNote: string;
	FreeTxt: string;
	TaxInclusiveAmount: number;
	VatTotalsAmount: number;
	Attachments: string;
	DimensionsID: number;
	CurrencyCode: string;
	CreatedBy: string;
	CreatedDate: Date;
	SupplierOrgNumber: string;
	CustomerOrgNumber: string;
	TaxInclusiveCurrencyAmount: number;
	TaxExclusiveCurrencyAmount: number;
	TaxExclusiveAmount: number;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	Items: Array<CustomerInvoiceItem>;
	JournalEntry: JournalEntry;
	Dimensions: Dimensions;
	CustomFields: any;
}


export class CustomerInvoiceItem {
	static relativeUrl = ""

	CustomerInvoiceID: number;
	ProductID: number;
	ItemText: string;
	NumberOfItems: number;
	Price: number;
	DiscountPercent: number;
	VatCodeID: number;
	DimensionsID: number;
	SumTotal: number;
	SumVat: number;
	Comment: string;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	Product: Product;
	Dimensions: Dimensions;
	CustomFields: any;
}


export class CustomerOrder {
	static relativeUrl = "orders";

	CustomerID: number;
	OrderDate: Date;
	OrderReference: string;
	InvoiceRecieverName: string;
	InvoiceAddressLine1: string;
	InvoiceAddressLine2: string;
	InvoiceAddressLine3: string;
	InvoicePostalCode: number;
	InvoiceCity: string;
	InvoiceCountryCode: string;
	InvoiceCountry: string;
	ShippingAddressLine1: string;
	ShippingAddressLine2: string;
	ShippingAddressLine3: string;
	ShippingPostalCode: number;
	ShippingCity: string;
	ShippingCountryCode: string;
	ShippingCountry: string;
	OurReference: string;
	YourReference: string;
	SalesPerson: string;
	CustomerPerson: string;
	DeliveryMethod: string;
	PaymentTerm: string;
	DeliveryTerm: string;
	DeliveryDate: Date;
	Comment: string;
	InternalNote: string;
	FreeTxt: string;
	TaxInclusiveAmount: number;
	VatTotalsAmount: number;
	Attachments: string;
	DimensionsID: number;
	CurrencyCode: string;
	CreatedBy: string;
	CreatedDate: Date;
	SupplierOrgNumber: string;
	CustomerOrgNumber: string;
	TaxInclusiveCurrencyAmount: number;
	TaxExclusiveCurrencyAmount: number;
	TaxExclusiveAmount: number;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	Items: Array<CustomerOrderItem>;
	Dimensions: Dimensions;
	CustomFields: any;
}


export class CustomerOrderItem {
	static relativeUrl = ""

	Code: string;
	CustomerOrderID: number;
	ProductID: number;
	ItemText: string;
	NumberOfItems: number;
	Price: number;
	DiscountPercent: number;
	VatCodeID: number;
	DimensionsID: number;
	SumTotal: number;
	SumVat: number;
	Comment: string;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	Product: Product;
	Dimensions: Dimensions;
	CustomFields: any;
}


export class CustomerQuote {
	static relativeUrl = "quotes";

	CustomerID: number;
	QuoteDate: Date;
	InquiryReference: number;
	InvoiceRecieverName: string;
	InvoiceAddressLine1: string;
	InvoiceAddressLine2: string;
	InvoiceAddressLine3: string;
	InvoicePostalCode: number;
	InvoiceCity: string;
	InvoiceCountryCode: string;
	InvoiceCountry: string;
	ShippingAddressLine1: string;
	ShippingAddressLine2: string;
	ShippingAddressLine3: string;
	ShippingPostalCode: number;
	ShippingCity: string;
	ShippingCountryCode: string;
	ShippingCountry: string;
	OurReference: string;
	YourReference: string;
	SalesPerson: string;
	CustomerPerson: string;
	DeliveryMethod: string;
	PaymentTerm: string;
	DeliveryTerm: string;
	DeliveryDate: Date;
	Comment: string;
	InternalNote: string;
	FreeTxt: string;
	TaxInclusiveAmount: number;
	VatTotalsAmount: number;
	Attachments: string;
	DimensionsID: number;
	CurrencyCode: string;
	CreatedBy: string;
	CreatedDate: Date;
	SupplierOrgNumber: string;
	CustomerOrgNumber: string;
	TaxInclusiveCurrencyAmount: number;
	TaxExclusiveCurrencyAmount: number;
	TaxExclusiveAmount: number;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	Items: Array<CustomerQuoteItem>;
	Dimensions: Dimensions;
	CustomFields: any;
}


export class CustomerQuoteItem {
	static relativeUrl = ""

	CustomerQuoteID: number;
	ProductID: number;
	ItemText: string;
	NumberOfItems: number;
	Price: number;
	DiscountPercent: number;
	VatCodeID: number;
	DimensionsID: number;
	SumTotal: number;
	SumVat: number;
	Comment: string;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	Product: Product;
	Dimensions: Dimensions;
	CustomFields: any;
}


export class Supplier {
	static relativeUrl = "suppliers";

	BusinessRelationID: number;
	OrgNumber: string;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	Info: BusinessRelation;
	CustomFields: any;
}


export class Region {
	static relativeUrl = "regions";

	RegionCode: string;
	CountryCode: string;
	Name: string;
	Description: string;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	CustomFields: any;
}


export class Departement {
	static relativeUrl = "departements";

	DepartementManagerName: string;
	Name: string;
	Description: string;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	CustomFields: any;
}


export class Dimensions {
	static relativeUrl = "dimensions";

	ProjectID: number;
	DepartementID: number;
	ResponsibleID: number;
	RegionID: number;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	Project: Project;
	Departement: Departement;
	Responsible: Responsible;
	Region: Region;
	CustomFields: any;
}


export class Project {
	static relativeUrl = "projects";

	ProjectLeadName: string;
	Name: string;
	Description: string;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	CustomFields: any;
}


export class Responsible {
	static relativeUrl = "responsibles";

	NameOfResponsible: string;
	Name: string;
	Description: string;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	CustomFields: any;
}


export class Address {
	static relativeUrl = ""

	BusinessRelationID: number;
	AddressLine1: string;
	AddressLine2: string;
	AddressLine3: string;
	PostalCode: string;
	City: string;
	Country: string;
	CountryCode: string;
	Region: string;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	CustomFields: any;
}


export class Contact {
	static relativeUrl = "contacts";

	InfoID: number;
	ParentBusinessRelationID: number;
	Role: string;
	Comment: string;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	ParentBusinessRelation: BusinessRelation;
	Info: BusinessRelation;
	CustomFields: any;
}


export class BusinessRelation {
	static relativeUrl = ""

	Name: string;
	InvoiceAddressID: number;
	ShippingAddressID: number;
	DefaultPhoneID: number;
	DefaultEmailID: number;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	Addresses: Array<Address>;
	Phones: Array<Phone>;
	Emails: Array<Email>;
	InvoiceAddress: Address;
	ShippingAddress: Address;
	DefaultPhone: Phone;
	DefaultEmail: Email;
	CustomFields: any;
}


export class Email {
	static relativeUrl = ""

	EmailAddress: string;
	Description: string;
	Type: string;
	BusinessRelationID: number;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	CustomFields: any;
}


export class Phone {
	static relativeUrl = ""

	LandCode: string;
	Number: string;
	Description: string;
	Type: PhoneTypeEnum;
	BusinessRelationID: number;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	CustomFields: any;
}


export class BasicAmount {
	static relativeUrl = "basicamounts";

	BasicAmountPrYear: number;
	BasicAmountPrMonth: number;
	AveragePrYear: number;
	ConversionFactor: number;
	FromDate: Date;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	CustomFields: any;
}


export class CompanySalary {
	static relativeUrl = "companysalary";

	BankAccountSalary: number;
	BankAccountTaxWithdraw: number;
	MainAccountAllocatedAGA: number;
	MainAccountCostAGA: number;
	MainAccountAllocatedAGAVacation: number;
	MainAccountCostAGAVacation: number;
	MainAccountAllocatedVacation: number;
	MainAccountCostVacation: number;
	HoursPerMonth: number;
	PaymentInterval: number;
	WagetypeAdvancePayment: number;
	WagetypeAdvancePaymentAuto: number;
	RemitRegularTraits: boolean;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	CustomFields: any;
}


export class CompanyVacationRate {
	static relativeUrl = "companyvacationrates";

	Rate: number;
	Rate60: number;
	FromDate: Date;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	CustomFields: any;
}


export class EmployeeCategory {
	static relativeUrl = "employeecategories";

	Name: string;
	EmployeeCategoryLinkID: number;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	CustomFields: any;
}


export class EmployeeCategoryLink {
	static relativeUrl = "employeecategorylinks";

	EmployeeCategoryID: number;
	EmployeeID: number;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	EmployeeCategory: EmployeeCategory;
	Employee: Employee;
	CustomFields: any;
}


export class EmployeeLeave {
	static relativeUrl = "EmployeeLeave";

	EmploymentID: number;
	LeaveType: Leavetype;
	FromDate: Date;
	ToDate: Date;
	Description: string;
	LeavePercent: number;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	Employment: Employment;
	CustomFields: any;
}


export class Employment {
	static relativeUrl = "employments";

	EmployeeID: number;
	LocalizationID: number;
	JobCode: string;
	JobName: string;
	Standard: boolean;
	StartDate: Date;
	EndDate: Date;
	SeniorityDate: Date;
	LastSalaryChangeDate: Date;
	LastWorkPercentChangeDate: Date;
	HourRate: number;
	MonthRate: number;
	UserDefinedRate: number;
	TypeOfEmployment: TypeOfEmployment;
	RenumerationType: RenumerationType;
	WorkingHoursScheme: WorkingHoursScheme;
	WorkPercent: number;
	HoursPerWeek: number;
	ShipType: ShipTypeOfShip;
	ShipReg: ShipRegistry;
	TradeArea: ShipTradeArea;
	LedgerAccount: string;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	Localization: Localization;
	Leaves: Array<EmployeeLeave>;
	Leave: Array<EmployeeLeave>;
	CustomFields: any;
}


export class Localization {
	static relativeUrl = "localizations";

	OrgNumber: string;
	BusinessRelationID: number;
	MunicipalityNo: string;
	SuperiorOrganizationID: number;
	AgaZone: number;
	AgaRule: number;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	BusinessRelationInfo: BusinessRelation;
	SuperiorOrganization: Localization;
	CustomFields: any;
}


export class Grant {
	static relativeUrl = "grants";

	Description: string;
	Amount: number;
	FromDate: Date;
	AffectsAGA: boolean;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	CustomFields: any;
}


export class PayrollRun {
	static relativeUrl = "payrollrun";

	PayDate: Date;
	FromDate: Date;
	ToDate: Date;
	SettlementDate: Date;
	Description: string;
	IsDirty: boolean;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	CustomFields: any;
}


export class VacationRateEmployee {
	static relativeUrl = "employeevacationrates";

	Rate: number;
	Rate60: number;
	StartDate: Date;
	EndDate: Date;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	CustomFields: any;
}


export class WageType {
	static relativeUrl = "wagetypes";

	WageTypeId: number;
	SystemRequiredWageType: number;
	Base_EmploymentTax: boolean;
	Base_Vacation: boolean;
	Base_Payment: boolean;
	WageTypeName: string;
	RatetypeColumn: RateTypeColumn;
	taxtype: TaxType;
	HideFromPaycheck: boolean;
	NoNumberOfHours: boolean;
	Aga_otp: boolean;
	Aga_nav: boolean;
	Limit_type: LimitType;
	Limit_value: number;
	Limit_WageTypeID: number;
	Limit_newRate: number;
	StandardWageTypeFor: StdWageType;
	Base_div1: boolean;
	Base_div2: boolean;
	Base_div3: boolean;
	Rate: number;
	RateFactor: number;
	AccountNumber: number;
	AccountNumber_balance: number;
	IncomeType: string;
	Benefit: string;
	Description: string;
	Postnr: string;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	SupplementaryInformations: Array<WageTypeSupplement>;
	CustomFields: any;
}


export class WageTypeSupplement {
	static relativeUrl = ""

	WageTypeID: number;
	SalaryTransactionSupplementID: number;
	Name: string;
	ValueType: Valuetype;
	Description: string;
	SuggestedValue: string;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	SalaryTransactionSupplement: SalaryTransactionSupplement;
	CustomFields: any;
}


export class SalaryTransaction {
	static relativeUrl = "salarytrans";

	PayrollRunID: number;
	runID: number;
	EmployeeNumber: number;
	FromDate: Date;
	ToDate: Date;
	WageTypeID: number;
	WageTypeNumber: number;
	Text: string;
	Amount: number;
	Rate: number;
	Sum: number;
	Account: number;
	EmploymentID: number;
	MunicipalityNo: string;
	SystemType: StdSystemType;
	calcAGA: number;
	IsRecurringPost: boolean;
	recurringPostValidFrom: Date;
	recurringPostValidTo: Date;
	ChildSalaryTransactionID: number;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	payrollrun: PayrollRun;
	Wagetype: WageType;
	Supplements: Array<SalaryTransactionSupplement>;
	CustomFields: any;
}


export class SalaryTransactionSupplement {
	static relativeUrl = ""

	SalaryTransactionID: number;
	WageTypeSupplementID: number;
	ValueString: string;
	ValueDate: Date;
	ValueBool: boolean;
	ValueMoney: number;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	WageTypeSupplement: WageTypeSupplement;
	CustomFields: any;
}


export class Employee {
	static relativeUrl = "employees";

	BusinessRelationID: number;
	PaymentInterval: PaymentInterval;
	EmployeeNumber: number;
	SocialSecurityNumber: string;
	BirthDate: Date;
	TaxTable: string;
	isPensioner: boolean;
	TaxPercentage: number;
	NonTaxableAmount: number;
	MunicipalityNo: string;
	AdvancePaymentAmount: number;
	InternationalID: string;
	InternasjonalIDType: InternationalIDType;
	InternasjonalIDCountry: string;
	ForeignWorker: ForeignWorker;
	VacationRateEmployeeID: number;
	LocalizationID: number;
	Active: boolean;
	PhotoID: number;
	EmploymentDate: Date;
	Sex: number;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	BusinessRelationInfo: BusinessRelation;
	Employments: Array<Employment>;
	BankAccounts: Array<BankAccountSalary>;
	VacationRateEmployee: VacationRateEmployee;
	Localization: Localization;
	CustomFields: any;
}


export class BankAccountSalary {
	static relativeUrl = ""

	EmployeeID: number;
	AccountNumber: string;
	BIC: string;
	BankName: string;
	LandCode: string;
	BankAddress: string;
	Active: boolean;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	CustomFields: any;
}


export class FieldLayout {
	static relativeUrl = ""

	ComponentLayoutID: number;
	EntityType: string;
	Property: string;
	Placement: number;
	Hidden: boolean;
	FieldType: FieldType;
	ReadOnly: boolean;
	LookupField: boolean;
	Label: string;
	Description: string;
	HelpText: string;
	FieldSet: number;
	Section: number;
	Legend: string;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	CustomFields: any;
}


export class ComponentLayout {
	static relativeUrl = ""

	Name: string;
	BaseEntity: string;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	Fields: Array<FieldLayout>;
	CustomFields: any;
}


export class UserAuthorization {
	static relativeUrl = "UserAuthorization";

	userID: number;
	Allow: boolean;
	Model: string;
	fields: string;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	CustomFields: any;
}


export class Company {
	static relativeUrl = "companies";

	Name: string;
	SchemaName: string;
	Key: string;
	ID: number;
	Deleted: boolean;
	CustomFields: any;
}


export class CompanyAccess {
	static relativeUrl = "companies-access";

	GlobalIdentity: string;
	CompanyID: number;
	ID: number;
	Deleted: boolean;
	CustomFields: any;
}


export class PaymentCode {
	static relativeUrl = "paymentCodes";

	Code: number;
	Name: string;
	Description: string;
	PaymentGroup: string;
	ID: number;
	Deleted: boolean;
	CustomFields: any;
}


export class EmploymentValidValues {
	static relativeUrl = "employmentvalidvalues";

	employment: TypeOfEmployment;
	typeOfEmployment: boolean;
	RenumerationType: boolean;
	PaymentType: RenumerationType;
	WorkingHoursScheme: boolean;
	StartDate: boolean;
	EndDate: boolean;
	SeniorityDate: boolean;
	JobCode: boolean;
	JobName: boolean;
	HourRate: boolean;
	MonthRate: boolean;
	UserDefinedRate: boolean;
	HoursPerWeek: boolean;
	LastSalaryChangeDate: boolean;
	LastWorkPercentChange: boolean;
	ShipType: boolean;
	ShipReg: boolean;
	TradeArea: boolean;
	WorkPercent: boolean;
	ID: number;
	Deleted: boolean;
	CustomFields: any;
}


export class TradeHeader {
	static relativeUrl = ""

	InvoiceRecieverName: string;
	InvoiceAddressLine1: string;
	InvoiceAddressLine2: string;
	InvoiceAddressLine3: string;
	InvoicePostalCode: number;
	InvoiceCity: string;
	InvoiceCountryCode: string;
	InvoiceCountry: string;
	ShippingAddressLine1: string;
	ShippingAddressLine2: string;
	ShippingAddressLine3: string;
	ShippingPostalCode: number;
	ShippingCity: string;
	ShippingCountryCode: string;
	ShippingCountry: string;
	OurReference: string;
	YourReference: string;
	SalesPerson: string;
	CustomerPerson: string;
	DeliveryMethod: string;
	PaymentTerm: string;
	DeliveryTerm: string;
	DeliveryDate: Date;
	Comment: string;
	InternalNote: string;
	FreeTxt: string;
	TaxInclusiveAmount: number;
	VatTotalsAmount: number;
	Attachments: string;
	DimensionsID: number;
	CurrencyCode: string;
	CreatedBy: string;
	CreatedDate: Date;
	SupplierOrgNumber: string;
	CustomerOrgNumber: string;
	TaxInclusiveCurrencyAmount: number;
	TaxExclusiveCurrencyAmount: number;
	TaxExclusiveAmount: number;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	Dimensions: Dimensions;
	CustomFields: any;
}


export class InvoiceHeader {
	static relativeUrl = ""

	InvoiceDate: Date;
	PaymentDueDate: Date;
	InvoiceType: number;
	PaymentID: string;
	PaymentInformation: string;
	InvoiceID: number;
	Credited: boolean;
	BankAccount: string;
	Payment: string;
	AmountRegards: string;
	DeliveryName: string;
	JournalEntryID: number;
	InvoiceRecieverName: string;
	InvoiceAddressLine1: string;
	InvoiceAddressLine2: string;
	InvoiceAddressLine3: string;
	InvoicePostalCode: number;
	InvoiceCity: string;
	InvoiceCountryCode: string;
	InvoiceCountry: string;
	ShippingAddressLine1: string;
	ShippingAddressLine2: string;
	ShippingAddressLine3: string;
	ShippingPostalCode: number;
	ShippingCity: string;
	ShippingCountryCode: string;
	ShippingCountry: string;
	OurReference: string;
	YourReference: string;
	SalesPerson: string;
	CustomerPerson: string;
	DeliveryMethod: string;
	PaymentTerm: string;
	DeliveryTerm: string;
	DeliveryDate: Date;
	Comment: string;
	InternalNote: string;
	FreeTxt: string;
	TaxInclusiveAmount: number;
	VatTotalsAmount: number;
	Attachments: string;
	DimensionsID: number;
	CurrencyCode: string;
	CreatedBy: string;
	CreatedDate: Date;
	SupplierOrgNumber: string;
	CustomerOrgNumber: string;
	TaxInclusiveCurrencyAmount: number;
	TaxExclusiveCurrencyAmount: number;
	TaxExclusiveAmount: number;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	JournalEntry: JournalEntry;
	Dimensions: Dimensions;
	CustomFields: any;
}


export class MunicipalAGAZone {
	static relativeUrl = "MunicipalAGAZones";

	MunicipalityNo: string;
	ZoneID: number;
	Startdate: Date;
	ID: number;
	Deleted: boolean;
	CustomFields: any;
}


export class PeriodSeries {
	static relativeUrl = "period-series";

	Name: string;
	SeriesType: PeriodSeriesType;
	Active: boolean;
	ID: number;
	Deleted: boolean;
	CustomFields: any;
}


export class Period {
	static relativeUrl = "periodes";

	Name: string;
	FromDate: Date;
	ToDate: Date;
	No: number;
	PeriodTemplateID: number;
	AccountYear: number;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	PeriodTemplate: PeriodTemplate;
	CustomFields: any;
}


export class PeriodTemplate {
	static relativeUrl = "period-templates";

	Name: string;
	FromDate: Date;
	ToDate: Date;
	No: number;
	PeriodSeriesID: number;
	ID: number;
	Deleted: boolean;
	PeriodSeries: PeriodSeries;
	CustomFields: any;
}


export class CurrencyEntry {
	static relativeUrl = ""

	Date: Date;
	Source: CurrencySourceEnum;
	Code: string;
	ExchangeRate: number;
	Factor: number;
	ID: number;
	Deleted: boolean;
	CustomFields: any;
}


export class AGAZone {
	static relativeUrl = "AGAZones";

	ZoneName: string;
	ID: number;
	Deleted: boolean;
	rates: Array<AGARate>;
	municipalsOnZone: Array<MunicipalAGAZone>;
	CustomFields: any;
}


export class AGARate {
	static relativeUrl = ""

	ZoneID: number;
	Rate: number;
	RateValidFrom: Date;
	ID: number;
	Deleted: boolean;
	sector: Array<AGASector>;
	CustomFields: any;
}


export class AGASector {
	static relativeUrl = ""

	RateID: number;
	sector: string;
	freeAmount: number;
	Rate: number;
	ValidFrom: Date;
	ID: number;
	Deleted: boolean;
	CustomFields: any;
}


export class TracelinkType {
	static relativeUrl = "tracelinktypes";

	Name: string;
	Description: string;
	ID: number;
	Deleted: boolean;
	CustomFields: any;
}


export class AccountGroupSetup {
	static relativeUrl = ""

	PlanType: PlanTypeEnum;
	ExternalReference: string;
	Name: string;
	ParentID: number;
	ID: number;
	Deleted: boolean;
	Parent: AccountGroupSetup;
	CustomFields: any;
}


export class AccountSetup {
	static relativeUrl = ""

	PlanType: PlanTypeEnum;
	AccountNumber: number;
	AccountName: string;
	AccountGroupSetupID: number;
	IsAS: boolean;
	IsENK: boolean;
	IsMini: boolean;
	ExpectedDebitBalance: boolean;
	ID: number;
	Deleted: boolean;
	AccountGroup: AccountGroupSetup;
	CustomFields: any;
}


export class CompanySettings {
	static relativeUrl = "companysettings";

	CompanyTypeID: number;
	TaxMandatory: boolean;
	CompanyName: string;
	CompanyRegistered: boolean;
	OrganizationNumber: string;
	BaseCurrency: string;
	PeriodSeriesAccountID: number;
	PeriodSeriesVatID: number;
	ForceSupplierInvoiceApproval: boolean;
	AccountingLockedDate: Date;
	VatLockedDate: Date;
	WebAddress: string;
	AccountGroupSetID: number;
	AutoJournalPayment: boolean;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	Address: Array<Address>;
	Phones: Array<Phone>;
	Emails: Array<Email>;
	CustomFields: any;
}


export class CompanyType {
	static relativeUrl = "companytypes";

	Name: string;
	FullName: string;
	Description: string;
	DefaultPlanType: PlanTypeEnum;
	ID: number;
	Deleted: boolean;
	CustomFields: any;
}


export class Country {
	static relativeUrl = "countries";

	CountryCode: string;
	Name: string;
	DefaultCurrencyCode: string;
	CurrencyRateSource: string;
	ID: number;
	Deleted: boolean;
	CustomFields: any;
}


export class Municipal {
	static relativeUrl = "Municipals";

	MunicipalityNo: string;
	CountyNo: string;
	CountyName: string;
	MunicipalityName: string;
	ID: number;
	Deleted: boolean;
	CustomFields: any;
}


export class Inntekt {
	static relativeUrl = "salaryvalidvalues";

	gammelkode: string;
	gyldigfraogmed: string;
	gyldigtil: string;
	KunFraNAV: string;
	skatteOgAvgiftsregel: string;
	startdatoOpptjeningsperiode: Date;
	sluttdatoOpptjeningsperiode: Date;
	fordel: string;
	utloeserArbeidsgiveravgift: number;
	inngaarIGrunnlagForTrekk: number;
	beloep: string;
	arbeidsforholdID: number;
	Postnr: string;
	loennsinntektID: number;
	naeringsinntektID: number;
	pensjonEllerTrygdID: number;
	ID: number;
	Deleted: boolean;
	loennsinntekt: loennsinntekt;
	naeringsinntekt: naeringsinntekt;
	pensjonEllerTrygd: pensjonEllerTrygd;
	CustomFields: any;
}


export class loennsinntekt {
	static relativeUrl = ""

	InntektID: number;
	beskrivelse: string;
	tilleggsinformasjonID: number;
	spesifikasjonID: number;
	antall: string;
	ID: number;
	Deleted: boolean;
	Inntekt: Inntekt;
	tilleggsinformasjon: tilleggsinformasjon;
	spesifikasjon: spesifikasjon;
	CustomFields: any;
}


export class naeringsinntekt {
	static relativeUrl = ""

	InntektID: number;
	beskrivelse: string;
	tilleggsinformasjonID: number;
	ID: number;
	Deleted: boolean;
	Inntekt: Inntekt;
	tilleggsinformasjon: tilleggsinformasjon;
	CustomFields: any;
}


export class pensjonEllerTrygd {
	static relativeUrl = ""

	InntektID: number;
	beskrivelse: string;
	tilleggsinformasjonID: number;
	ID: number;
	Deleted: boolean;
	Inntekt: Inntekt;
	tilleggsinformasjon: tilleggsinformasjon;
	CustomFields: any;
}


export class spesifikasjon {
	static relativeUrl = ""

	loennsinntektID: number;
	skattemessigBosattILand: string;
	opptjeningsland: string;
	erOpptjentPaaHjelpefartoey: number;
	erOpptjentPaaKontinentalsokkel: number;
	ID: number;
	Deleted: boolean;
	loennsinntekt: loennsinntekt;
	CustomFields: any;
}


export class tilleggsinformasjon {
	static relativeUrl = ""

	loennsinntektID: number;
	naeringsinntektID: number;
	pensjonEllerTrygdID: number;
	bilOgBaatID: number;
	dagmammaIEgenBoligID: number;
	etterbetalingsperiodeID: number;
	inntektPaaNorskKontinentalsokkelID: number;
	inntjeningsforholdID: number;
	livrenteID: number;
	lottOgPartID: number;
	nettoloennID: number;
	pensjonID: number;
	reiseKostOgLosjiID: number;
	utenlandskArtistID: number;
	bonusFraForsvaretID: number;
	ID: number;
	Deleted: boolean;
	loennsinntekt: loennsinntekt;
	naeringsinntekt: naeringsinntekt;
	pensjonEllerTrygd: pensjonEllerTrygd;
	bilOgBaat: bilOgBaat;
	dagmammaIEgenBolig: dagmammaIEgenBolig;
	etterbetalingsperiode: etterbetalingsperiode;
	inntektPaaNorskKontinentalsokkel: inntektPaaNorskKontinentalsokkel;
	inntjeningsforhold: inntjeningsforhold;
	livrente: livrente;
	lottOgPart: lottOgPart;
	nettoloenn: nettoloenn;
	pensjon: pensjon;
	reiseKostOgLosji: reiseKostOgLosji;
	utenlandskArtist: utenlandskArtist;
	bonusFraForsvaret: bonusFraForsvaret;
	CustomFields: any;
}


export class bilOgBaat {
	static relativeUrl = ""

	tilleggsinformasjonID: number;
	nettoloennID: number;
	listeprisForBil: string;
	bilregistreringsnummer: string;
	antallKilometer: string;
	heravAntallKilometerMellomHjemOgArbeid: string;
	erBilUtenforStandardregelen: number;
	personklassifiseringAvBilbruker: string;
	erBilPool: string;
	ID: number;
	Deleted: boolean;
	tilleggsinformasjon: tilleggsinformasjon;
	nettoloenn: nettoloenn;
	CustomFields: any;
}


export class dagmammaIEgenBolig {
	static relativeUrl = ""

	tilleggsinformasjonID: number;
	antallBarn: string;
	antallMaaneder: string;
	ID: number;
	Deleted: boolean;
	tilleggsinformasjon: tilleggsinformasjon;
	CustomFields: any;
}


export class etterbetalingsperiode {
	static relativeUrl = ""

	tilleggsinformasjonID: number;
	startdato: string;
	sluttdato: string;
	ID: number;
	Deleted: boolean;
	tilleggsinformasjon: tilleggsinformasjon;
	CustomFields: any;
}


export class inntektPaaNorskKontinentalsokkel {
	static relativeUrl = ""

	tilleggsinformasjonID: number;
	tidsrom: string;
	gjelderLoennFoerste60Dager: number;
	startdato: string;
	sluttdato: string;
	ID: number;
	Deleted: boolean;
	tilleggsinformasjon: tilleggsinformasjon;
	CustomFields: any;
}


export class inntjeningsforhold {
	static relativeUrl = ""

	tilleggsinformasjonID: number;
	Inntjeningsforhold: string;
	ID: number;
	Deleted: boolean;
	tilleggsinformasjon: tilleggsinformasjon;
	CustomFields: any;
}


export class livrente {
	static relativeUrl = ""

	tilleggsinformasjonID: number;
	totaltUtbetaltBeloep: string;
	ID: number;
	Deleted: boolean;
	tilleggsinformasjon: tilleggsinformasjon;
	CustomFields: any;
}


export class lottOgPart {
	static relativeUrl = ""

	tilleggsinformasjonID: number;
	antallDager: string;
	ID: number;
	Deleted: boolean;
	tilleggsinformasjon: tilleggsinformasjon;
	CustomFields: any;
}


export class nettoloenn {
	static relativeUrl = ""

	tilleggsinformasjonID: number;
	oppgrossingstabellnummer: string;
	bilOgBaatID: number;
	betaltSkattebeloepIUtlandet: string;
	ID: number;
	Deleted: boolean;
	tilleggsinformasjon: tilleggsinformasjon;
	bilOgBaat: bilOgBaat;
	CustomFields: any;
}


export class pensjon {
	static relativeUrl = ""

	tilleggsinformasjonID: number;
	grunnpensjonsbeloep: string;
	tilleggspensjonbeloep: string;
	ufoeregrad: string;
	pensjonsgrad: string;
	heravEtterlattepensjon: string;
	tidsrom: string;
	ID: number;
	Deleted: boolean;
	tilleggsinformasjon: tilleggsinformasjon;
	CustomFields: any;
}


export class reiseKostOgLosji {
	static relativeUrl = ""

	tilleggsinformasjonID: number;
	persontype: string;
	antallreiser: string;
	ID: number;
	Deleted: boolean;
	tilleggsinformasjon: tilleggsinformasjon;
	CustomFields: any;
}


export class utenlandskArtist {
	static relativeUrl = ""

	tilleggsinformasjonID: number;
	inntektsaar: string;
	oppgrossingsgrunnlag: string;
	trukketArtistskatt: string;
	ID: number;
	Deleted: boolean;
	tilleggsinformasjon: tilleggsinformasjon;
	CustomFields: any;
}


export class bonusFraForsvaret {
	static relativeUrl = ""

	tilleggsinformasjonID: number;
	aaretUtbetalingenGjelderFor: string;
	ID: number;
	Deleted: boolean;
	tilleggsinformasjon: tilleggsinformasjon;
	CustomFields: any;
}


export class STYRKCode {
	static relativeUrl = "STYRK";

	ynr: number;
	lnr: number;
	styrk: string;
	tittel: string;
	ID: number;
	Deleted: boolean;
	CustomFields: any;
}


export class TaxTable {
	static relativeUrl = "taxtable";

	year: number;
	TableNumber: string;
	DrawPeriod: Drawperiod;
	TableType: Tabletype;
	DrawBasis: number;
	Draw: number;
	ID: number;
	Deleted: boolean;
	CustomFields: any;
}


export class VatCodeGroupSetup {
	static relativeUrl = ""

	No: number;
	Name: string;
	ID: number;
	Deleted: boolean;
	CustomFields: any;
}


export class VatPostSetup {
	static relativeUrl = ""

	Name: string;
	ID: number;
	Deleted: boolean;
	CustomFields: any;
}


export class VatReportReferenceSetup {
	static relativeUrl = ""

	VatCode: string;
	VatPostName: string;
	ID: number;
	Deleted: boolean;
	CustomFields: any;
}


export class VatTypeSetup {
	static relativeUrl = ""

	VatCode: string;
	Name: string;
	VatPercent: number;
	ValidFrom: Date;
	ValidTo: Date;
	OutputVat: boolean;
	IsNotVatRegistered: boolean;
	IsCompensated: boolean;
	IncomingAccountNumber: number;
	OutgoingAccountNumber: number;
	VatCodeGroupNo: number;
	ID: number;
	Deleted: boolean;
	CustomFields: any;
}


export class User {
	static relativeUrl = "users";

	DisplayName: string;
	Email: string;
	GlobalIdentity: string;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	Status: Status;
	CustomFields: any;
}


export class TreeStructure {
	static relativeUrl = ""

	ParentID: number;
	Lft: number;
	Rght: number;
	Depth: number;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	CustomFields: any;
}


export class Product {
	static relativeUrl = "products";

	PartName: string;
	Name: string;
	Price: number;
	ListPrice: number;
	AverageCost: number;
	Description: string;
	VatCodeID: number;
	VariansParentID: number;
	Type: ProductTypeEnum;
	Unit: string;
	DefaultProductCategoryID: number;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	ProductCategoryLinks: Array<ProductCategoryLink>;
	CustomFields: any;
}


export class TradeItem {
	static relativeUrl = ""

	ProductID: number;
	ItemText: string;
	NumberOfItems: number;
	Price: number;
	DiscountPercent: number;
	VatCodeID: number;
	DimensionsID: number;
	SumTotal: number;
	SumVat: number;
	Comment: string;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	Product: Product;
	Dimensions: Dimensions;
	CustomFields: any;
}


export class ProductCategory {
	static relativeUrl = "productcategories";

	Name: string;
	Description: string;
	Status: number;
	Comment: string;
	ParentID: number;
	Lft: number;
	Rght: number;
	Depth: number;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	CustomFields: any;
}


export class ProductCategoryLink {
	static relativeUrl = "productcategorylinks";

	ProductID: number;
	ProductCategoryID: number;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	ProductCategory: ProductCategory;
	CustomFields: any;
}


export class Tracelink {
	static relativeUrl = ""

	Date: Date;
	RootID: number;
	RootTypeID: number;
	SourceID: number;
	SourceTypeID: number;
	DestinationID: number;
	DestinationTypeID: number;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	RootType: TracelinkType;
	SourceType: TracelinkType;
	DestinationType: TracelinkType;
	CustomFields: any;
}


export class UserVerification {
	static relativeUrl = "user-verifications";

	VerificationCode: string;
	ExpirationDate: Date;
	VerificationDate: Date;
	Email: string;
	DisplayName: string;
	CompanyId: number;
	UserId: number;
	StatusCode: number;
	ID: number;
	Deleted: boolean;
	CustomFields: any;
}


export class Status {
	static relativeUrl = ""

	StatusCategoryID: number;
	StatusCode: number;
	System: boolean;
	Description: string;
	Order: number;
	EntityType: string;
	ID: number;
	Deleted: boolean;
	StatusCategory: StatusCategory;
	CustomFields: any;
}


export class StatusCategory {
	static relativeUrl = ""

	Name: string;
	StatusCategoryCode: StatusCategoryCode;
	ID: number;
	Deleted: boolean;
	CustomFields: any;
}


export class Transition {
	static relativeUrl = ""

	MethodName: string;
	EntityType: string;
	Controller: string;
	ID: number;
	Deleted: boolean;
	CustomFields: any;
}


export class TransitionFlow {
	static relativeUrl = ""

	FromStatusID: number;
	ToStatusID: number;
	TransitionID: number;
	EntityType: string;
	ID: number;
	Deleted: boolean;
	FromStatus: Status;
	ToStatus: Status;
	Transition: Transition;
	CustomFields: any;
}


export class NumberSeriesInvalidOverlap {
	static relativeUrl = "number-series-invalid-overlaps";

	NumberSerieTypeAID: number;
	NumberSerieTypeBID: number;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	NumberSerieTypeA: NumberSeriesType;
	NumberSerieTypeB: NumberSeriesType;
	CustomFields: any;
}


export class NumberSeries {
	static relativeUrl = "number-series";

	Name: string;
	FromNumber: number;
	ToNumber: number;
	NextNumber: number;
	AccountYear: number;
	NumberSeriesTypeID: number;
	NumberLock: boolean;
	Empty: boolean;
	Disabled: boolean;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	NumberSeriesType: NumberSeriesType;
	CustomFields: any;
}


export class NumberSeriesType {
	static relativeUrl = "number-series-types";

	Name: string;
	EntityType: string;
	Yearly: boolean;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	CustomFields: any;
}


export class Accrual {
	static relativeUrl = "accruals";

	BalanceID: number;
	StartDate: Date;
	NumberOfMonths: number;
	Month1: boolean;
	Month2: boolean;
	Month3: boolean;
	Month4: boolean;
	Month5: boolean;
	Month6: boolean;
	Month7: boolean;
	Month8: boolean;
	Month9: boolean;
	Month10: boolean;
	Month11: boolean;
	Month12: boolean;
	Month13: boolean;
	Month14: boolean;
	Month15: boolean;
	Month16: boolean;
	Month17: boolean;
	Month18: boolean;
	Month19: boolean;
	Month20: boolean;
	Month21: boolean;
	Month22: boolean;
	Month23: boolean;
	Month24: boolean;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	Balance: Account;
	Line: JournalEntryLineDraft;
	CustomFields: any;
}


export class JournalEntryMode {
	static relativeUrl = "journalEntryModes";

	Name: string;
	ColumnSetUp: string;
	VisibleModules: string;
	TraceLinkTypes: string;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	CustomFields: any;
}


export class JournalEntry {
	static relativeUrl = "journalentries";

	JournalEntryNumber: string;
	FinancialYearID: number;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	FinancialYear: FinancialYear;
	Lines: Array<JournalEntryLine>;
	DraftLines: Array<JournalEntryLineDraft>;
	CustomFields: any;
}


export class JournalEntryLine {
	static relativeUrl = "journalentrylines";

	JournalEntryID: number;
	JournalEntryNumber: string;
	FinancialDate: Date;
	VatDate: Date;
	RegisteredDate: Date;
	Signature: string;
	Amount: number;
	TaxBasisAmount: number;
	CurrencyAmount: number;
	TaxBasisCurrencyAmount: number;
	CurrencyCode: string;
	VatTypeID: number;
	VatJournalEntryPostID: number;
	AccountID: number;
	SubAccountID: number;
	BatchNumber: number;
	OriginalJournalEntryPost: number;
	Description: string;
	VatDeductionPercent: number;
	ReferenceCreditPostID: number;
	OriginalReferencePostID: number;
	ReferenceOriginalPostID: number;
	DimensionsID: number;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	VatType: VatType;
	Account: Account;
	SubAccount: Account;
	ReferenceCreditPost: JournalEntryLine;
	OriginalReferencePost: JournalEntryLine;
	ReferenceOriginalPost: JournalEntryLine;
	Dimensions: Dimensions;
	CustomFields: any;
}


export class JournalEntryLineDraft {
	static relativeUrl = "journalentrylinedrafts";

	AccrualID: number;
	JournalEntryID: number;
	JournalEntryNumber: string;
	FinancialDate: Date;
	VatDate: Date;
	RegisteredDate: Date;
	Signature: string;
	Amount: number;
	TaxBasisAmount: number;
	CurrencyAmount: number;
	TaxBasisCurrencyAmount: number;
	CurrencyCode: string;
	VatTypeID: number;
	VatJournalEntryPostID: number;
	AccountID: number;
	SubAccountID: number;
	BatchNumber: number;
	OriginalJournalEntryPost: number;
	Description: string;
	VatDeductionPercent: number;
	ReferenceCreditPostID: number;
	OriginalReferencePostID: number;
	ReferenceOriginalPostID: number;
	DimensionsID: number;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	Accrual: Accrual;
	VatType: VatType;
	Account: Account;
	SubAccount: Account;
	ReferenceCreditPost: JournalEntryLine;
	OriginalReferencePost: JournalEntryLine;
	ReferenceOriginalPost: JournalEntryLine;
	Dimensions: Dimensions;
	CustomFields: any;
}


export class Payment {
	static relativeUrl = "payments";

	IsPaymentToSupplier: boolean;
	BankAccountID: number;
	CustomerID: number;
	PaymentID: string;
	Amount: number;
	CurrencyID: number;
	InvoiceNumber: string;
	BankAccountNumberTarget: string;
	ReconcilePayment: boolean;
	AutoJournal: boolean;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	BankAccount: BankAccount;
	Customer: Customer;
	Currency: Currency;
	CustomFields: any;
}


export class VatCodeGroup {
	static relativeUrl = ""

	No: number;
	Name: string;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	CustomFields: any;
}


export class VatPost {
	static relativeUrl = ""

	Name: string;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	CustomFields: any;
}


export class VatReportReference {
	static relativeUrl = "vatreportreferences";

	VatTypeID: number;
	VatPostID: number;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	VatType: VatType;
	VatPost: VatPost;
	CustomFields: any;
}


export class PostPost {
	static relativeUrl = "postposts";

	JournalEntryInvoiceID: number;
	JournalEntryBankID: number;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	JournalEntryInvoice: JournalEntry;
	JournalEntryBank: JournalEntry;
	CustomFields: any;
}


export class SupplierInvoiceItem {
	static relativeUrl = ""

	SupplierInvoiceID: number;
	ProductID: number;
	ItemText: string;
	NumberOfItems: number;
	Price: number;
	DiscountPercent: number;
	VatCodeID: number;
	DimensionsID: number;
	SumTotal: number;
	SumVat: number;
	Comment: string;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	Product: Product;
	Dimensions: Dimensions;
	CustomFields: any;
}


export class SupplierInvoice {
	static relativeUrl = "supplierinvoices";

	SupplierID: number;
	InvoiceDate: Date;
	PaymentDueDate: Date;
	InvoiceType: number;
	PaymentID: string;
	PaymentInformation: string;
	InvoiceID: number;
	Credited: boolean;
	BankAccount: string;
	Payment: string;
	AmountRegards: string;
	DeliveryName: string;
	JournalEntryID: number;
	InvoiceRecieverName: string;
	InvoiceAddressLine1: string;
	InvoiceAddressLine2: string;
	InvoiceAddressLine3: string;
	InvoicePostalCode: number;
	InvoiceCity: string;
	InvoiceCountryCode: string;
	InvoiceCountry: string;
	ShippingAddressLine1: string;
	ShippingAddressLine2: string;
	ShippingAddressLine3: string;
	ShippingPostalCode: number;
	ShippingCity: string;
	ShippingCountryCode: string;
	ShippingCountry: string;
	OurReference: string;
	YourReference: string;
	SalesPerson: string;
	CustomerPerson: string;
	DeliveryMethod: string;
	PaymentTerm: string;
	DeliveryTerm: string;
	DeliveryDate: Date;
	Comment: string;
	InternalNote: string;
	FreeTxt: string;
	TaxInclusiveAmount: number;
	VatTotalsAmount: number;
	Attachments: string;
	DimensionsID: number;
	CurrencyCode: string;
	CreatedBy: string;
	CreatedDate: Date;
	SupplierOrgNumber: string;
	CustomerOrgNumber: string;
	TaxInclusiveCurrencyAmount: number;
	TaxExclusiveCurrencyAmount: number;
	TaxExclusiveAmount: number;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	Supplier: Supplier;
	Items: Array<SupplierInvoiceItem>;
	JournalEntry: JournalEntry;
	Dimensions: Dimensions;
	CustomFields: any;
}


export class JournalEntrySourceSerie {
	static relativeUrl = ""

	JournalEntrySourceID: number;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	CustomFields: any;
}


export class AccountGroupSet {
	static relativeUrl = "accountgroupsets";

	Name: string;
	System: boolean;
	Shared: boolean;
	ToAccountNumber: number;
	FromAccountNumber: number;
	SubAccountAllowed: boolean;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	CustomFields: any;
}


export class Account {
	static relativeUrl = "accounts";

	AccountName: string;
	AccountNumber: number;
	LockManualPosts: boolean;
	Locked: boolean;
	SystemAccount: boolean;
	Visible: boolean;
	Active: boolean;
	AccountID: number;
	CurrencyID: number;
	AccountGroupID: number;
	AccountSetupID: number;
	VatTypeID: number;
	CustomerID: number;
	SupplierID: number;
	EmployeeID: number;
	DimensionsID: number;
	SubAccountNumberSeriesID: number;
	UseDeductivePercent: boolean;
	UsePostPost: boolean;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	Currency: Currency;
	AccountGroup: AccountGroup;
	VatType: VatType;
	MainAccount: Account;
	Customer: Customer;
	Supplier: Supplier;
	Employee: Employee;
	Dimensions: Dimensions;
	SubAccountNumberSeries: NumberSeries;
	Alias: Array<AccountAlias>;
	CompatibleAccountGroups: Array<AccountGroup>;
	SubAccounts: Array<Account>;
	CustomFields: any;
}


export class AccountAlias {
	static relativeUrl = ""

	Name: string;
	AccountID: number;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	CustomFields: any;
}


export class AccountGroup {
	static relativeUrl = "accountgroups";

	Name: string;
	AccountGroupSetupID: number;
	MainGroupID: number;
	CompatibleAccountID: number;
	Summable: boolean;
	AccountGroupSetID: number;
	AccountID: number;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	MainGroup: AccountGroup;
	AccountGroupSet: AccountGroupSet;
	CustomFields: any;
}


export class Bank {
	static relativeUrl = "banks";

	Name: string;
	Web: string;
	BIC: string;
	AddressID: number;
	PhoneID: number;
	EmailID: number;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	CustomFields: any;
}


export class BankAccount {
	static relativeUrl = "bankaccounts";

	AccountNumber: string;
	BankID: number;
	AccountID: number;
	BankAccountType: string;
	IBAN: string;
	Locked: boolean;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	CustomFields: any;
}


export class Currency {
	static relativeUrl = "currencies";

	Date: Date;
	Source: CurrencySourceEnum;
	Code: string;
	Name: string;
	ExchangeRate: number;
	Factor: number;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	CustomFields: any;
}


export class FinancialYear {
	static relativeUrl = ""

	Year: number;
	ValidFrom: Date;
	ValidTo: Date;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	CustomFields: any;
}


export class VatCodeDeduction {
	static relativeUrl = "vatcodedeductions";

	DeductionPercent: number;
	ValidFrom: Date;
	ValidTo: Date;
	VatTypeID: number;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	VatType: VatType;
	CustomFields: any;
}


export class VatType {
	static relativeUrl = "vattypes";

	VatCode: string;
	Name: string;
	Alias: string;
	VatPercent: number;
	AvailableInModules: boolean;
	VatTypeSetupID: number;
	ValidFrom: Date;
	ValidTo: Date;
	Visible: boolean;
	Locked: boolean;
	OutputVat: boolean;
	IncomingAccountID: number;
	OutgoingAccountID: number;
	InUse: boolean;
	VatCodeGroupID: number;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	IncomingAccount: Account;
	OutgoingAccount: Account;
	Deductions: Array<VatCodeDeduction>;
	VatCodeGroup: VatCodeGroup;
	VatReportReferences: Array<VatReportReference>;
	CustomFields: any;
}


export class ClientValidationRule {
	static relativeUrl = ""

	EntityType: string;
	PropertyName: string;
	Operator: Operator;
	Operation: OperationType;
	Level: ValidationLevel;
	Value: string;
	ErrorMessage: string;
	ID: number;
	Deleted: boolean;
	CustomFields: any;
}


export class ComplexValidationRule {
	static relativeUrl = ""

	EntityType: string;
	ValidationCode: number;
	Message: string;
	Operation: OperationType;
	Level: ValidationLevel;
	ID: number;
	Deleted: boolean;
	CustomFields: any;
}


export class ComponentLayoutDto {
	static relativeUrl = ""

	Name: string;
	BaseEntity: string;
	Url: string;
	Fields: Array<FieldLayoutDto>;
	CustomFields: any;
}


export class FieldLayoutDto {
	static relativeUrl = ""

	Url: string;
	LookupEntityType: string;
	ComponentLayoutID: number;
	EntityType: string;
	Property: string;
	Placement: number;
	Hidden: boolean;
	FieldType: FieldType;
	ReadOnly: boolean;
	LookupField: boolean;
	Label: string;
	Description: string;
	HelpText: string;
	FieldSet: number;
	Section: number;
	Legend: string;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	Validations: Array<ClientValidationRule>;
	CustomFields: any;
}


export class ComponentLayoutDto {
	static relativeUrl = ""

	Name: string;
	BaseEntity: string;
	Url: string;
	Fields: Array<FieldLayoutDto>;
	CustomFields: any;
}


export class FieldLayoutDto {
	static relativeUrl = ""

	Url: string;
	LookupEntityType: string;
	ComponentLayoutID: number;
	EntityType: string;
	Property: string;
	Placement: number;
	Hidden: boolean;
	FieldType: FieldType;
	ReadOnly: boolean;
	LookupField: boolean;
	Label: string;
	Description: string;
	HelpText: string;
	FieldSet: number;
	Section: number;
	Legend: string;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	Validations: Array<ClientValidationRule>;
	CustomFields: any;
}


export class ComponentLayoutDto {
	static relativeUrl = ""

	Name: string;
	BaseEntity: string;
	Url: string;
	Fields: Array<FieldLayoutDto>;
	CustomFields: any;
}


export class FieldLayoutDto {
	static relativeUrl = ""

	Url: string;
	LookupEntityType: string;
	ComponentLayoutID: number;
	EntityType: string;
	Property: string;
	Placement: number;
	Hidden: boolean;
	FieldType: FieldType;
	ReadOnly: boolean;
	LookupField: boolean;
	Label: string;
	Description: string;
	HelpText: string;
	FieldSet: number;
	Section: number;
	Legend: string;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	Validations: Array<ClientValidationRule>;
	CustomFields: any;
}


export class ComponentLayoutDto {
	static relativeUrl = ""

	Name: string;
	BaseEntity: string;
	Url: string;
	Fields: Array<FieldLayoutDto>;
	CustomFields: any;
}


export class FieldLayoutDto {
	static relativeUrl = ""

	Url: string;
	LookupEntityType: string;
	ComponentLayoutID: number;
	EntityType: string;
	Property: string;
	Placement: number;
	Hidden: boolean;
	FieldType: FieldType;
	ReadOnly: boolean;
	LookupField: boolean;
	Label: string;
	Description: string;
	HelpText: string;
	FieldSet: number;
	Section: number;
	Legend: string;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	Validations: Array<ClientValidationRule>;
	CustomFields: any;
}


export class ComponentLayoutDto {
	static relativeUrl = ""

	Name: string;
	BaseEntity: string;
	Url: string;
	Fields: Array<FieldLayoutDto>;
	CustomFields: any;
}


export class FieldLayoutDto {
	static relativeUrl = ""

	Url: string;
	LookupEntityType: string;
	ComponentLayoutID: number;
	EntityType: string;
	Property: string;
	Placement: number;
	Hidden: boolean;
	FieldType: FieldType;
	ReadOnly: boolean;
	LookupField: boolean;
	Label: string;
	Description: string;
	HelpText: string;
	FieldSet: number;
	Section: number;
	Legend: string;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	Validations: Array<ClientValidationRule>;
	CustomFields: any;
}


export class ComponentLayoutDto {
	static relativeUrl = ""

	Name: string;
	BaseEntity: string;
	Url: string;
	Fields: Array<FieldLayoutDto>;
	CustomFields: any;
}


export class FieldLayoutDto {
	static relativeUrl = ""

	Url: string;
	LookupEntityType: string;
	ComponentLayoutID: number;
	EntityType: string;
	Property: string;
	Placement: number;
	Hidden: boolean;
	FieldType: FieldType;
	ReadOnly: boolean;
	LookupField: boolean;
	Label: string;
	Description: string;
	HelpText: string;
	FieldSet: number;
	Section: number;
	Legend: string;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	Validations: Array<ClientValidationRule>;
	CustomFields: any;
}


export class ComponentLayoutDto {
	static relativeUrl = ""

	Name: string;
	BaseEntity: string;
	Url: string;
	Fields: Array<FieldLayoutDto>;
	CustomFields: any;
}


export class FieldLayoutDto {
	static relativeUrl = ""

	Url: string;
	LookupEntityType: string;
	ComponentLayoutID: number;
	EntityType: string;
	Property: string;
	Placement: number;
	Hidden: boolean;
	FieldType: FieldType;
	ReadOnly: boolean;
	LookupField: boolean;
	Label: string;
	Description: string;
	HelpText: string;
	FieldSet: number;
	Section: number;
	Legend: string;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	Validations: Array<ClientValidationRule>;
	CustomFields: any;
}


export class ComponentLayoutDto {
	static relativeUrl = ""

	Name: string;
	BaseEntity: string;
	Url: string;
	Fields: Array<FieldLayoutDto>;
	CustomFields: any;
}


export class FieldLayoutDto {
	static relativeUrl = ""

	Url: string;
	LookupEntityType: string;
	ComponentLayoutID: number;
	EntityType: string;
	Property: string;
	Placement: number;
	Hidden: boolean;
	FieldType: FieldType;
	ReadOnly: boolean;
	LookupField: boolean;
	Label: string;
	Description: string;
	HelpText: string;
	FieldSet: number;
	Section: number;
	Legend: string;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	Validations: Array<ClientValidationRule>;
	CustomFields: any;
}


export class ComponentLayoutDto {
	static relativeUrl = ""

	Name: string;
	BaseEntity: string;
	Url: string;
	Fields: Array<FieldLayoutDto>;
	CustomFields: any;
}


export class FieldLayoutDto {
	static relativeUrl = ""

	Url: string;
	LookupEntityType: string;
	ComponentLayoutID: number;
	EntityType: string;
	Property: string;
	Placement: number;
	Hidden: boolean;
	FieldType: FieldType;
	ReadOnly: boolean;
	LookupField: boolean;
	Label: string;
	Description: string;
	HelpText: string;
	FieldSet: number;
	Section: number;
	Legend: string;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	Validations: Array<ClientValidationRule>;
	CustomFields: any;
}


export class ComponentLayoutDto {
	static relativeUrl = ""

	Name: string;
	BaseEntity: string;
	Url: string;
	Fields: Array<FieldLayoutDto>;
	CustomFields: any;
}


export class FieldLayoutDto {
	static relativeUrl = ""

	Url: string;
	LookupEntityType: string;
	ComponentLayoutID: number;
	EntityType: string;
	Property: string;
	Placement: number;
	Hidden: boolean;
	FieldType: FieldType;
	ReadOnly: boolean;
	LookupField: boolean;
	Label: string;
	Description: string;
	HelpText: string;
	FieldSet: number;
	Section: number;
	Legend: string;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	Validations: Array<ClientValidationRule>;
	CustomFields: any;
}


export class ComponentLayoutDto {
	static relativeUrl = ""

	Name: string;
	BaseEntity: string;
	Url: string;
	Fields: Array<FieldLayoutDto>;
	CustomFields: any;
}


export class FieldLayoutDto {
	static relativeUrl = ""

	Url: string;
	LookupEntityType: string;
	ComponentLayoutID: number;
	EntityType: string;
	Property: string;
	Placement: number;
	Hidden: boolean;
	FieldType: FieldType;
	ReadOnly: boolean;
	LookupField: boolean;
	Label: string;
	Description: string;
	HelpText: string;
	FieldSet: number;
	Section: number;
	Legend: string;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	Validations: Array<ClientValidationRule>;
	CustomFields: any;
}


export class ComponentLayoutDto {
	static relativeUrl = ""

	Name: string;
	BaseEntity: string;
	Url: string;
	Fields: Array<FieldLayoutDto>;
	CustomFields: any;
}


export class FieldLayoutDto {
	static relativeUrl = ""

	Url: string;
	LookupEntityType: string;
	ComponentLayoutID: number;
	EntityType: string;
	Property: string;
	Placement: number;
	Hidden: boolean;
	FieldType: FieldType;
	ReadOnly: boolean;
	LookupField: boolean;
	Label: string;
	Description: string;
	HelpText: string;
	FieldSet: number;
	Section: number;
	Legend: string;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	Validations: Array<ClientValidationRule>;
	CustomFields: any;
}


export class ComponentLayoutDto {
	static relativeUrl = ""

	Name: string;
	BaseEntity: string;
	Url: string;
	Fields: Array<FieldLayoutDto>;
	CustomFields: any;
}


export class FieldLayoutDto {
	static relativeUrl = ""

	Url: string;
	LookupEntityType: string;
	ComponentLayoutID: number;
	EntityType: string;
	Property: string;
	Placement: number;
	Hidden: boolean;
	FieldType: FieldType;
	ReadOnly: boolean;
	LookupField: boolean;
	Label: string;
	Description: string;
	HelpText: string;
	FieldSet: number;
	Section: number;
	Legend: string;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	Validations: Array<ClientValidationRule>;
	CustomFields: any;
}


export class ComponentLayoutDto {
	static relativeUrl = ""

	Name: string;
	BaseEntity: string;
	Url: string;
	Fields: Array<FieldLayoutDto>;
	CustomFields: any;
}


export class FieldLayoutDto {
	static relativeUrl = ""

	Url: string;
	LookupEntityType: string;
	ComponentLayoutID: number;
	EntityType: string;
	Property: string;
	Placement: number;
	Hidden: boolean;
	FieldType: FieldType;
	ReadOnly: boolean;
	LookupField: boolean;
	Label: string;
	Description: string;
	HelpText: string;
	FieldSet: number;
	Section: number;
	Legend: string;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	Validations: Array<ClientValidationRule>;
	CustomFields: any;
}


export class ComponentLayoutDto {
	static relativeUrl = ""

	Name: string;
	BaseEntity: string;
	Url: string;
	Fields: Array<FieldLayoutDto>;
	CustomFields: any;
}


export class FieldLayoutDto {
	static relativeUrl = ""

	Url: string;
	LookupEntityType: string;
	ComponentLayoutID: number;
	EntityType: string;
	Property: string;
	Placement: number;
	Hidden: boolean;
	FieldType: FieldType;
	ReadOnly: boolean;
	LookupField: boolean;
	Label: string;
	Description: string;
	HelpText: string;
	FieldSet: number;
	Section: number;
	Legend: string;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	Validations: Array<ClientValidationRule>;
	CustomFields: any;
}


export class ComponentLayoutDto {
	static relativeUrl = ""

	Name: string;
	BaseEntity: string;
	Url: string;
	Fields: Array<FieldLayoutDto>;
	CustomFields: any;
}


export class FieldLayoutDto {
	static relativeUrl = ""

	Url: string;
	LookupEntityType: string;
	ComponentLayoutID: number;
	EntityType: string;
	Property: string;
	Placement: number;
	Hidden: boolean;
	FieldType: FieldType;
	ReadOnly: boolean;
	LookupField: boolean;
	Label: string;
	Description: string;
	HelpText: string;
	FieldSet: number;
	Section: number;
	Legend: string;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	Validations: Array<ClientValidationRule>;
	CustomFields: any;
}


export class ComponentLayoutDto {
	static relativeUrl = ""

	Name: string;
	BaseEntity: string;
	Url: string;
	Fields: Array<FieldLayoutDto>;
	CustomFields: any;
}


export class FieldLayoutDto {
	static relativeUrl = ""

	Url: string;
	LookupEntityType: string;
	ComponentLayoutID: number;
	EntityType: string;
	Property: string;
	Placement: number;
	Hidden: boolean;
	FieldType: FieldType;
	ReadOnly: boolean;
	LookupField: boolean;
	Label: string;
	Description: string;
	HelpText: string;
	FieldSet: number;
	Section: number;
	Legend: string;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	Validations: Array<ClientValidationRule>;
	CustomFields: any;
}


export class ComponentLayoutDto {
	static relativeUrl = ""

	Name: string;
	BaseEntity: string;
	Url: string;
	Fields: Array<FieldLayoutDto>;
	CustomFields: any;
}


export class FieldLayoutDto {
	static relativeUrl = ""

	Url: string;
	LookupEntityType: string;
	ComponentLayoutID: number;
	EntityType: string;
	Property: string;
	Placement: number;
	Hidden: boolean;
	FieldType: FieldType;
	ReadOnly: boolean;
	LookupField: boolean;
	Label: string;
	Description: string;
	HelpText: string;
	FieldSet: number;
	Section: number;
	Legend: string;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	Validations: Array<ClientValidationRule>;
	CustomFields: any;
}


export class ComponentLayoutDto {
	static relativeUrl = ""

	Name: string;
	BaseEntity: string;
	Url: string;
	Fields: Array<FieldLayoutDto>;
	CustomFields: any;
}


export class FieldLayoutDto {
	static relativeUrl = ""

	Url: string;
	LookupEntityType: string;
	ComponentLayoutID: number;
	EntityType: string;
	Property: string;
	Placement: number;
	Hidden: boolean;
	FieldType: FieldType;
	ReadOnly: boolean;
	LookupField: boolean;
	Label: string;
	Description: string;
	HelpText: string;
	FieldSet: number;
	Section: number;
	Legend: string;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	Validations: Array<ClientValidationRule>;
	CustomFields: any;
}


export class ComponentLayoutDto {
	static relativeUrl = ""

	Name: string;
	BaseEntity: string;
	Url: string;
	Fields: Array<FieldLayoutDto>;
	CustomFields: any;
}


export class FieldLayoutDto {
	static relativeUrl = ""

	Url: string;
	LookupEntityType: string;
	ComponentLayoutID: number;
	EntityType: string;
	Property: string;
	Placement: number;
	Hidden: boolean;
	FieldType: FieldType;
	ReadOnly: boolean;
	LookupField: boolean;
	Label: string;
	Description: string;
	HelpText: string;
	FieldSet: number;
	Section: number;
	Legend: string;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	Validations: Array<ClientValidationRule>;
	CustomFields: any;
}


export class ComponentLayoutDto {
	static relativeUrl = ""

	Name: string;
	BaseEntity: string;
	Url: string;
	Fields: Array<FieldLayoutDto>;
	CustomFields: any;
}


export class FieldLayoutDto {
	static relativeUrl = ""

	Url: string;
	LookupEntityType: string;
	ComponentLayoutID: number;
	EntityType: string;
	Property: string;
	Placement: number;
	Hidden: boolean;
	FieldType: FieldType;
	ReadOnly: boolean;
	LookupField: boolean;
	Label: string;
	Description: string;
	HelpText: string;
	FieldSet: number;
	Section: number;
	Legend: string;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	Validations: Array<ClientValidationRule>;
	CustomFields: any;
}


export class ComponentLayoutDto {
	static relativeUrl = ""

	Name: string;
	BaseEntity: string;
	Url: string;
	Fields: Array<FieldLayoutDto>;
	CustomFields: any;
}


export class FieldLayoutDto {
	static relativeUrl = ""

	Url: string;
	LookupEntityType: string;
	ComponentLayoutID: number;
	EntityType: string;
	Property: string;
	Placement: number;
	Hidden: boolean;
	FieldType: FieldType;
	ReadOnly: boolean;
	LookupField: boolean;
	Label: string;
	Description: string;
	HelpText: string;
	FieldSet: number;
	Section: number;
	Legend: string;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	Validations: Array<ClientValidationRule>;
	CustomFields: any;
}


export class ComponentLayoutDto {
	static relativeUrl = ""

	Name: string;
	BaseEntity: string;
	Url: string;
	Fields: Array<FieldLayoutDto>;
	CustomFields: any;
}


export class FieldLayoutDto {
	static relativeUrl = ""

	Url: string;
	LookupEntityType: string;
	ComponentLayoutID: number;
	EntityType: string;
	Property: string;
	Placement: number;
	Hidden: boolean;
	FieldType: FieldType;
	ReadOnly: boolean;
	LookupField: boolean;
	Label: string;
	Description: string;
	HelpText: string;
	FieldSet: number;
	Section: number;
	Legend: string;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	Validations: Array<ClientValidationRule>;
	CustomFields: any;
}


export class ComponentLayoutDto {
	static relativeUrl = ""

	Name: string;
	BaseEntity: string;
	Url: string;
	Fields: Array<FieldLayoutDto>;
	CustomFields: any;
}


export class FieldLayoutDto {
	static relativeUrl = ""

	Url: string;
	LookupEntityType: string;
	ComponentLayoutID: number;
	EntityType: string;
	Property: string;
	Placement: number;
	Hidden: boolean;
	FieldType: FieldType;
	ReadOnly: boolean;
	LookupField: boolean;
	Label: string;
	Description: string;
	HelpText: string;
	FieldSet: number;
	Section: number;
	Legend: string;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	Validations: Array<ClientValidationRule>;
	CustomFields: any;
}


export class ComponentLayoutDto {
	static relativeUrl = ""

	Name: string;
	BaseEntity: string;
	Url: string;
	Fields: Array<FieldLayoutDto>;
	CustomFields: any;
}


export class FieldLayoutDto {
	static relativeUrl = ""

	Url: string;
	LookupEntityType: string;
	ComponentLayoutID: number;
	EntityType: string;
	Property: string;
	Placement: number;
	Hidden: boolean;
	FieldType: FieldType;
	ReadOnly: boolean;
	LookupField: boolean;
	Label: string;
	Description: string;
	HelpText: string;
	FieldSet: number;
	Section: number;
	Legend: string;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	Validations: Array<ClientValidationRule>;
	CustomFields: any;
}


export class ComponentLayoutDto {
	static relativeUrl = ""

	Name: string;
	BaseEntity: string;
	Url: string;
	Fields: Array<FieldLayoutDto>;
	CustomFields: any;
}


export class FieldLayoutDto {
	static relativeUrl = ""

	Url: string;
	LookupEntityType: string;
	ComponentLayoutID: number;
	EntityType: string;
	Property: string;
	Placement: number;
	Hidden: boolean;
	FieldType: FieldType;
	ReadOnly: boolean;
	LookupField: boolean;
	Label: string;
	Description: string;
	HelpText: string;
	FieldSet: number;
	Section: number;
	Legend: string;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	Validations: Array<ClientValidationRule>;
	CustomFields: any;
}


export class ComponentLayoutDto {
	static relativeUrl = ""

	Name: string;
	BaseEntity: string;
	Url: string;
	Fields: Array<FieldLayoutDto>;
	CustomFields: any;
}


export class FieldLayoutDto {
	static relativeUrl = ""

	Url: string;
	LookupEntityType: string;
	ComponentLayoutID: number;
	EntityType: string;
	Property: string;
	Placement: number;
	Hidden: boolean;
	FieldType: FieldType;
	ReadOnly: boolean;
	LookupField: boolean;
	Label: string;
	Description: string;
	HelpText: string;
	FieldSet: number;
	Section: number;
	Legend: string;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	Validations: Array<ClientValidationRule>;
	CustomFields: any;
}


export class ComponentLayoutDto {
	static relativeUrl = ""

	Name: string;
	BaseEntity: string;
	Url: string;
	Fields: Array<FieldLayoutDto>;
	CustomFields: any;
}


export class FieldLayoutDto {
	static relativeUrl = ""

	Url: string;
	LookupEntityType: string;
	ComponentLayoutID: number;
	EntityType: string;
	Property: string;
	Placement: number;
	Hidden: boolean;
	FieldType: FieldType;
	ReadOnly: boolean;
	LookupField: boolean;
	Label: string;
	Description: string;
	HelpText: string;
	FieldSet: number;
	Section: number;
	Legend: string;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	Validations: Array<ClientValidationRule>;
	CustomFields: any;
}


export class ComponentLayoutDto {
	static relativeUrl = ""

	Name: string;
	BaseEntity: string;
	Url: string;
	Fields: Array<FieldLayoutDto>;
	CustomFields: any;
}


export class FieldLayoutDto {
	static relativeUrl = ""

	Url: string;
	LookupEntityType: string;
	ComponentLayoutID: number;
	EntityType: string;
	Property: string;
	Placement: number;
	Hidden: boolean;
	FieldType: FieldType;
	ReadOnly: boolean;
	LookupField: boolean;
	Label: string;
	Description: string;
	HelpText: string;
	FieldSet: number;
	Section: number;
	Legend: string;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	Validations: Array<ClientValidationRule>;
	CustomFields: any;
}


export class ComponentLayoutDto {
	static relativeUrl = ""

	Name: string;
	BaseEntity: string;
	Url: string;
	Fields: Array<FieldLayoutDto>;
	CustomFields: any;
}


export class FieldLayoutDto {
	static relativeUrl = ""

	Url: string;
	LookupEntityType: string;
	ComponentLayoutID: number;
	EntityType: string;
	Property: string;
	Placement: number;
	Hidden: boolean;
	FieldType: FieldType;
	ReadOnly: boolean;
	LookupField: boolean;
	Label: string;
	Description: string;
	HelpText: string;
	FieldSet: number;
	Section: number;
	Legend: string;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	Validations: Array<ClientValidationRule>;
	CustomFields: any;
}


export class ComponentLayoutDto {
	static relativeUrl = ""

	Name: string;
	BaseEntity: string;
	Url: string;
	Fields: Array<FieldLayoutDto>;
	CustomFields: any;
}


export class FieldLayoutDto {
	static relativeUrl = ""

	Url: string;
	LookupEntityType: string;
	ComponentLayoutID: number;
	EntityType: string;
	Property: string;
	Placement: number;
	Hidden: boolean;
	FieldType: FieldType;
	ReadOnly: boolean;
	LookupField: boolean;
	Label: string;
	Description: string;
	HelpText: string;
	FieldSet: number;
	Section: number;
	Legend: string;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	Validations: Array<ClientValidationRule>;
	CustomFields: any;
}


export class ComponentLayoutDto {
	static relativeUrl = ""

	Name: string;
	BaseEntity: string;
	Url: string;
	Fields: Array<FieldLayoutDto>;
	CustomFields: any;
}


export class FieldLayoutDto {
	static relativeUrl = ""

	Url: string;
	LookupEntityType: string;
	ComponentLayoutID: number;
	EntityType: string;
	Property: string;
	Placement: number;
	Hidden: boolean;
	FieldType: FieldType;
	ReadOnly: boolean;
	LookupField: boolean;
	Label: string;
	Description: string;
	HelpText: string;
	FieldSet: number;
	Section: number;
	Legend: string;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	Validations: Array<ClientValidationRule>;
	CustomFields: any;
}


export class ComponentLayoutDto {
	static relativeUrl = ""

	Name: string;
	BaseEntity: string;
	Url: string;
	Fields: Array<FieldLayoutDto>;
	CustomFields: any;
}


export class FieldLayoutDto {
	static relativeUrl = ""

	Url: string;
	LookupEntityType: string;
	ComponentLayoutID: number;
	EntityType: string;
	Property: string;
	Placement: number;
	Hidden: boolean;
	FieldType: FieldType;
	ReadOnly: boolean;
	LookupField: boolean;
	Label: string;
	Description: string;
	HelpText: string;
	FieldSet: number;
	Section: number;
	Legend: string;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	Validations: Array<ClientValidationRule>;
	CustomFields: any;
}


export class ComponentLayoutDto {
	static relativeUrl = ""

	Name: string;
	BaseEntity: string;
	Url: string;
	Fields: Array<FieldLayoutDto>;
	CustomFields: any;
}


export class FieldLayoutDto {
	static relativeUrl = ""

	Url: string;
	LookupEntityType: string;
	ComponentLayoutID: number;
	EntityType: string;
	Property: string;
	Placement: number;
	Hidden: boolean;
	FieldType: FieldType;
	ReadOnly: boolean;
	LookupField: boolean;
	Label: string;
	Description: string;
	HelpText: string;
	FieldSet: number;
	Section: number;
	Legend: string;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	Validations: Array<ClientValidationRule>;
	CustomFields: any;
}


export class ComponentLayoutDto {
	static relativeUrl = ""

	Name: string;
	BaseEntity: string;
	Url: string;
	Fields: Array<FieldLayoutDto>;
	CustomFields: any;
}


export class FieldLayoutDto {
	static relativeUrl = ""

	Url: string;
	LookupEntityType: string;
	ComponentLayoutID: number;
	EntityType: string;
	Property: string;
	Placement: number;
	Hidden: boolean;
	FieldType: FieldType;
	ReadOnly: boolean;
	LookupField: boolean;
	Label: string;
	Description: string;
	HelpText: string;
	FieldSet: number;
	Section: number;
	Legend: string;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	Validations: Array<ClientValidationRule>;
	CustomFields: any;
}


export class ComponentLayoutDto {
	static relativeUrl = ""

	Name: string;
	BaseEntity: string;
	Url: string;
	Fields: Array<FieldLayoutDto>;
	CustomFields: any;
}


export class FieldLayoutDto {
	static relativeUrl = ""

	Url: string;
	LookupEntityType: string;
	ComponentLayoutID: number;
	EntityType: string;
	Property: string;
	Placement: number;
	Hidden: boolean;
	FieldType: FieldType;
	ReadOnly: boolean;
	LookupField: boolean;
	Label: string;
	Description: string;
	HelpText: string;
	FieldSet: number;
	Section: number;
	Legend: string;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	Validations: Array<ClientValidationRule>;
	CustomFields: any;
}


export class ComponentLayoutDto {
	static relativeUrl = ""

	Name: string;
	BaseEntity: string;
	Url: string;
	Fields: Array<FieldLayoutDto>;
	CustomFields: any;
}


export class FieldLayoutDto {
	static relativeUrl = ""

	Url: string;
	LookupEntityType: string;
	ComponentLayoutID: number;
	EntityType: string;
	Property: string;
	Placement: number;
	Hidden: boolean;
	FieldType: FieldType;
	ReadOnly: boolean;
	LookupField: boolean;
	Label: string;
	Description: string;
	HelpText: string;
	FieldSet: number;
	Section: number;
	Legend: string;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	Validations: Array<ClientValidationRule>;
	CustomFields: any;
}


export enum PhoneTypeEnum{
	PtPhone = 150101,
	PtMobile = 150102,
	PtFax = 150103,
}


export enum Leavetype{
	NotSet = 0,
	Leave = 1,
	LayOff = 2,
}


export enum TypeOfEmployment{
	notSet = 0,
	OrdinaryEmployment = 1,
	MaritimeEmployment = 2,
	FrilancerContratorFeeRecipient = 3,
	PensionOrOtherNonEmployedBenefits = 4,
}


export enum RenumerationType{
	notSet = 0,
	Salaried = 1,
	HourlyPaid = 2,
	PaidOnCommission = 3,
	Fees = 4,
	Piecework = 5,
}


export enum WorkingHoursScheme{
	notSet = 0,
	NonShift = 1,
	OffshoreWork = 2,
	SemiContinousShiftAndRotaWork = 3,
	ContinuousShiftAndOtherSchemes = 4,
	ShiftWork = 5,
}


export enum ShipTypeOfShip{
	notSet = 0,
	Other = 1,
	DrillingPlatform = 2,
	Tourist = 3,
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


export enum RateTypeColumn{
	none = 0,
	Employment = 1,
	Employee = 2,
	Salary_scale = 3,
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


export enum StdWageType{
	None = 0,
	TaxDrawTable = 1,
	TaxDrawPercent = 2,
	HolidayPayThisYear = 3,
	HolidayPayLastYear = 4,
	HolidayPayWithTaxDeduction = 5,
}


export enum Valuetype{
	IsString = 1,
	IsDate = 2,
	IsBool = 3,
	IsMoney = 4,
}


export enum StdSystemType{
	None = 0,
	PercentTaxDeduction = 1,
	HolidayPayBasisLastYear = 2,
	ResidualHolidayPay = 3,
	TableTaxDeduction = 4,
	Holidaypay = 5,
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


export enum ForeignWorker{
	notSet = 0,
	ForeignWorkerUSA_Canada = 1,
	ForeignWorkerFixedAga = 2,
}


export enum FieldType{
	AUTOCOMPLETE = 0,
	COMBOBOX = 1,
	DATEPICKER = 2,
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
}


export enum PeriodSeriesType{
	m = 0,
	r = 1,
}


export enum CurrencySourceEnum{
	NORGESBANK = 1,
}


export enum PlanTypeEnum{
	NS4102 = 1,
}


export enum Drawperiod{
	month = 1,
	forthnight = 2,
	week = 3,
	fourdays = 4,
	threedays = 5,
	twodays = 6,
	oneday = 7,
}


export enum Tabletype{
	wage = 0,
	pension = 1,
}


export enum ProductTypeEnum{
	PStorage = 1,
	PNoStorage = 2,
	PHour = 3,
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


export enum ValidationLevel{
	Info = 1,
	Warning = 20,
	Error = 30,
}
