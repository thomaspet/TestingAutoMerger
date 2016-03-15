export interface ICustomer {
	BusinessRelationID: number;
	Orgnumber: string;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	Info: IBusinessRelation;
	CustomFields: any;
}


export interface ICustomerInvoice {
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
	ShippingAddressLine1: string;
	ShippingAddressLine2: string;
	ShippingAddressLine3: string;
	ShippingPostalCode: number;
	ShippingCity: string;
	ShippingCountryCode: string;
	ShippingCountry: string;
	CustomerPerson: string;
	InvoiceRecieverName: string;
	InvoiceAddressLine1: string;
	InvoiceAddressLine2: string;
	InvoiceAddressLine3: string;
	InvoicePostalCode: number;
	InvoiceCity: string;
	InvoiceCountryCode: string;
	InvoiceCountry: string;
	OurReference: string;
	YourReference: string;
	SalesPerson: string;
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
	Items: Array<ICustomerInvoiceItem>;
	JournalEntry: IJournalEntry;
	Dimensions: IDimensions;
	CustomFields: any;
}


export interface ICustomerInvoiceItem {
	CustomerInvoiceID: number;
	Comment: string;
	ProductID: number;
	ItemText: string;
	NumberOfItems: number;
	Price: number;
	DiscountPercent: number;
	VatCodeID: number;
	DimensionsID: number;
	SumTotal: number;
	SumVat: number;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	Product: IProduct;
	Dimensions: IDimensions;
	CustomFields: any;
}


export interface ICustomerOrder {
	CustomerID: number;
	OrderDate: Date;
	OrderReference: string;
	ShippingAddressLine1: string;
	ShippingAddressLine2: string;
	ShippingAddressLine3: string;
	ShippingPostalCode: number;
	ShippingCity: string;
	ShippingCountryCode: string;
	ShippingCountry: string;
	CustomerPerson: string;
	InvoiceRecieverName: string;
	InvoiceAddressLine1: string;
	InvoiceAddressLine2: string;
	InvoiceAddressLine3: string;
	InvoicePostalCode: number;
	InvoiceCity: string;
	InvoiceCountryCode: string;
	InvoiceCountry: string;
	OurReference: string;
	YourReference: string;
	SalesPerson: string;
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
	Items: Array<ICustomerOrderItem>;
	Dimensions: IDimensions;
	CustomFields: any;
}


export interface ICustomerOrderItem {
	Code: string;
	CustomerOrderID: number;
	Comment: string;
	ProductID: number;
	ItemText: string;
	NumberOfItems: number;
	Price: number;
	DiscountPercent: number;
	VatCodeID: number;
	DimensionsID: number;
	SumTotal: number;
	SumVat: number;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	Product: IProduct;
	Dimensions: IDimensions;
	CustomFields: any;
}


export interface ICustomerQuote {
	CustomerID: number;
	QuoteDate: Date;
	InquiryReference: number;
	ShippingAddressLine1: string;
	ShippingAddressLine2: string;
	ShippingAddressLine3: string;
	ShippingPostalCode: number;
	ShippingCity: string;
	ShippingCountryCode: string;
	ShippingCountry: string;
	CustomerPerson: string;
	InvoiceRecieverName: string;
	InvoiceAddressLine1: string;
	InvoiceAddressLine2: string;
	InvoiceAddressLine3: string;
	InvoicePostalCode: number;
	InvoiceCity: string;
	InvoiceCountryCode: string;
	InvoiceCountry: string;
	OurReference: string;
	YourReference: string;
	SalesPerson: string;
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
	Items: Array<ICustomerQuoteItem>;
	Dimensions: IDimensions;
	CustomFields: any;
}


export interface ICustomerQuoteItem {
	CustomerQuoteID: number;
	Comment: string;
	ProductID: number;
	ItemText: string;
	NumberOfItems: number;
	Price: number;
	DiscountPercent: number;
	VatCodeID: number;
	DimensionsID: number;
	SumTotal: number;
	SumVat: number;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	Product: IProduct;
	Dimensions: IDimensions;
	CustomFields: any;
}


export interface ISupplier {
	BusinessRelationID: number;
	OrgNumber: string;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	Info: IBusinessRelation;
	CustomFields: any;
}


export interface IRegion {
	RegionCode: string;
	CountryCode: string;
	Name: string;
	Description: string;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	CustomFields: any;
}


export interface IDepartement {
	DepartementManagerName: string;
	Name: string;
	Description: string;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	CustomFields: any;
}


export interface IDimensions {
	ProjectID: number;
	DepartementID: number;
	ResponsibleID: number;
	RegionID: number;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	Project: IProject;
	Departement: IDepartement;
	Responsible: IResponsible;
	Region: IRegion;
	CustomFields: any;
}


export interface IProject {
	ProjectLeadName: string;
	Name: string;
	Description: string;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	CustomFields: any;
}


export interface IResponsible {
	NameOfResponsible: string;
	Name: string;
	Description: string;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	CustomFields: any;
}


export interface IAddress {
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
	BusinessRelation: IBusinessRelation;
	CustomFields: any;
}


export interface IContact {
	InfoID: number;
	ParentBusinessRelationID: number;
	Role: string;
	Comment: string;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	ParentBusinessRelation: IBusinessRelation;
	Info: IBusinessRelation;
	CustomFields: any;
}


export interface IBusinessRelation {
	Name: string;
	InvoiceAddressID: number;
	ShippingAddressID: number;
	DefaultPhoneID: number;
	DefaultEmailID: number;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	Addresses: Array<IAddress>;
	Phones: Array<IPhone>;
	Emails: Array<IEmail>;
	InvoiceAddress: IAddress;
	ShippingAddress: IAddress;
	DefaultPhone: IPhone;
	DefaultEmail: IEmail;
	CustomFields: any;
}


export interface IEmail {
	EmailAddress: string;
	Description: string;
	Type: string;
	BusinessRelationID: number;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	CustomFields: any;
}


export interface IPhone {
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


export interface IBasicAmount {
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


export interface ICompanySalary {
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


export interface ICompanyVacationRate {
	Rate: number;
	Rate60: number;
	FromDate: Date;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	CustomFields: any;
}


export interface IEmployeeCategory {
	Name: string;
	EmployeeCategoryLinkID: number;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	CustomFields: any;
}


export interface IEmployeeCategoryLink {
	EmployeeCategoryID: number;
	EmployeeID: number;
	EmployeeNumber: number;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	EmployeeCategory: IEmployeeCategory;
	Employee: IEmployee;
	CustomFields: any;
}


export interface IEmployeeLeave {
	EmploymentID: number;
	LeaveType: Leavetype;
	FromDate: Date;
	ToDate: Date;
	Description: string;
	LeavePercent: number;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	Employment: IEmployment;
	CustomFields: any;
}


export interface IEmployment {
	EmployeeNumber: number;
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
	LedgerAccount: string;
	ShipType: ShipTypeOfShip;
	ShipReg: ShipRegistry;
	TradeArea: ShipTradeArea;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	Employee: IEmployee;
	Localization: ILocalization;
	Leaves: Array<IEmployeeLeave>;
	Leave: Array<IEmployeeLeave>;
	CustomFields: any;
}


export interface ILocalization {
	OrgNumber: string;
	BusinessRelationID: number;
	MunicipalityNo: string;
	SuperiorOrganizationID: number;
	AgaZone: number;
	AgaRule: number;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	BusinessRelationInfo: IBusinessRelation;
	SuperiorOrganization: ILocalization;
	CustomFields: any;
}


export interface IGrant {
	Description: string;
	Amount: number;
	FromDate: Date;
	AffectsAGA: boolean;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	CustomFields: any;
}


export interface IPayrollRun {
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


export interface IVacationRateEmployee {
	Rate: number;
	Rate60: number;
	StartDate: Date;
	EndDate: Date;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	CustomFields: any;
}


export interface IWageType {
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
	SupplementaryInformations: Array<IWageTypeSupplement>;
	CustomFields: any;
}


export interface IWageTypeSupplement {
	WageTypeID: number;
	SalaryTransactionSupplementID: number;
	Name: string;
	ValueType: Valuetype;
	Description: string;
	SuggestedValue: string;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	SalaryTransactionSupplement: ISalaryTransactionSupplement;
	CustomFields: any;
}


export interface ISalaryTransaction {
	PayrollRunID: number;
	runID: number;
	EmployeeID: number;
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
	payrollrun: IPayrollRun;
	Employee: IEmployee;
	Wagetype: IWageType;
	Supplements: Array<ISalaryTransactionSupplement>;
	CustomFields: any;
}


export interface ISalaryTransactionSupplement {
	SalaryTransactionID: number;
	WageTypeSupplementID: number;
	ValueString: string;
	ValueDate: Date;
	ValueBool: boolean;
	ValueMoney: number;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	WageTypeSupplement: IWageTypeSupplement;
	CustomFields: any;
}


export interface IEmployee {
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
	NotMainEmployer: boolean;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	BusinessRelationInfo: IBusinessRelation;
	Employments: Array<IEmployment>;
	BankAccounts: Array<IBankAccountSalary>;
	VacationRateEmployee: IVacationRateEmployee;
	Localization: ILocalization;
	CustomFields: any;
}


export interface IBankAccountSalary {
	EmployeeID: number;
	AccountNumber: string;
	Active: boolean;
	BIC: string;
	BankName: string;
	LandCode: string;
	BankAddress: string;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	CustomFields: any;
}


export interface IFieldLayout {
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


export interface IComponentLayout {
	Name: string;
	BaseEntity: string;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	Fields: Array<IFieldLayout>;
	CustomFields: any;
}


export interface IUserAuthorization {
	userID: number;
	Allow: boolean;
	Model: string;
	fields: string;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	CustomFields: any;
}


export interface ICompany {
	Name: string;
	SchemaName: string;
	Key: string;
	ID: number;
	Deleted: boolean;
	CustomFields: any;
}


export interface ICompanyAccess {
	GlobalIdentity: string;
	CompanyID: number;
	ID: number;
	Deleted: boolean;
	CustomFields: any;
}


export interface IPaymentCode {
	Code: number;
	Name: string;
	Description: string;
	PaymentGroup: string;
	ID: number;
	Deleted: boolean;
	CustomFields: any;
}


export interface IEmploymentValidValues {
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


export interface IStaticRegister {
	Registry: string;
	stamp: Date;
	ID: number;
	Deleted: boolean;
	CustomFields: any;
}


export interface IMunicipalAGAZone {
	MunicipalityNo: string;
	ZoneID: number;
	Startdate: Date;
	ID: number;
	Deleted: boolean;
	CustomFields: any;
}


export interface IPeriodSeries {
	Name: string;
	SeriesType: PeriodSeriesType;
	Active: boolean;
	ID: number;
	Deleted: boolean;
	CustomFields: any;
}


export interface IPeriod {
	Name: string;
	FromDate: Date;
	ToDate: Date;
	No: number;
	PeriodTemplateID: number;
	AccountYear: number;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	PeriodTemplate: IPeriodTemplate;
	CustomFields: any;
}


export interface IPeriodTemplate {
	Name: string;
	FromDate: Date;
	ToDate: Date;
	No: number;
	PeriodSeriesID: number;
	ID: number;
	Deleted: boolean;
	PeriodSeries: IPeriodSeries;
	CustomFields: any;
}


export interface ICurrencyEntry {
	Date: Date;
	Source: CurrencySourceEnum;
	Code: string;
	ExchangeRate: number;
	Factor: number;
	ID: number;
	Deleted: boolean;
	CustomFields: any;
}


export interface IAGAZone {
	ZoneName: string;
	ID: number;
	Deleted: boolean;
	rates: Array<IAGARate>;
	municipalsOnZone: Array<IMunicipalAGAZone>;
	CustomFields: any;
}


export interface IAGARate {
	ZoneID: number;
	Rate: number;
	RateValidFrom: Date;
	ID: number;
	Deleted: boolean;
	sector: Array<IAGASector>;
	CustomFields: any;
}


export interface IAGASector {
	RateID: number;
	sector: string;
	freeAmount: number;
	Rate: number;
	ValidFrom: Date;
	ID: number;
	Deleted: boolean;
	CustomFields: any;
}


export interface ITracelinkType {
	Name: string;
	Description: string;
	ID: number;
	Deleted: boolean;
	CustomFields: any;
}


export interface IAccountGroupSetup {
	PlanType: PlanTypeEnum;
	ExternalReference: string;
	Name: string;
	ParentID: number;
	ID: number;
	Deleted: boolean;
	Parent: IAccountGroupSetup;
	CustomFields: any;
}


export interface IAccountSetup {
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
	AccountGroup: IAccountGroupSetup;
	CustomFields: any;
}


export interface ICompanySettings {
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
	Address: Array<IAddress>;
	Phones: Array<IPhone>;
	Emails: Array<IEmail>;
	CustomFields: any;
}


export interface ICompanyType {
	Name: string;
	FullName: string;
	Description: string;
	DefaultPlanType: PlanTypeEnum;
	ID: number;
	Deleted: boolean;
	CustomFields: any;
}


export interface ICountry {
	CountryCode: string;
	Name: string;
	DefaultCurrencyCode: string;
	CurrencyRateSource: string;
	ID: number;
	Deleted: boolean;
	CustomFields: any;
}


export interface IMunicipal {
	MunicipalityNo: string;
	CountyNo: string;
	CountyName: string;
	MunicipalityName: string;
	ID: number;
	Deleted: boolean;
	CustomFields: any;
}


export interface IInntekt {
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
	loennsinntekt: Iloennsinntekt;
	naeringsinntekt: Inaeringsinntekt;
	pensjonEllerTrygd: IpensjonEllerTrygd;
	CustomFields: any;
}


export interface Iloennsinntekt {
	InntektID: number;
	beskrivelse: string;
	tilleggsinformasjonID: number;
	spesifikasjonID: number;
	antall: string;
	ID: number;
	Deleted: boolean;
	Inntekt: IInntekt;
	tilleggsinformasjon: Itilleggsinformasjon;
	spesifikasjon: Ispesifikasjon;
	CustomFields: any;
}


export interface Inaeringsinntekt {
	InntektID: number;
	beskrivelse: string;
	tilleggsinformasjonID: number;
	ID: number;
	Deleted: boolean;
	Inntekt: IInntekt;
	tilleggsinformasjon: Itilleggsinformasjon;
	CustomFields: any;
}


export interface IpensjonEllerTrygd {
	InntektID: number;
	beskrivelse: string;
	tilleggsinformasjonID: number;
	ID: number;
	Deleted: boolean;
	Inntekt: IInntekt;
	tilleggsinformasjon: Itilleggsinformasjon;
	CustomFields: any;
}


export interface Ispesifikasjon {
	loennsinntektID: number;
	skattemessigBosattILand: string;
	opptjeningsland: string;
	erOpptjentPaaHjelpefartoey: number;
	erOpptjentPaaKontinentalsokkel: number;
	ID: number;
	Deleted: boolean;
	loennsinntekt: Iloennsinntekt;
	CustomFields: any;
}


export interface Itilleggsinformasjon {
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
	loennsinntekt: Iloennsinntekt;
	naeringsinntekt: Inaeringsinntekt;
	pensjonEllerTrygd: IpensjonEllerTrygd;
	bilOgBaat: IbilOgBaat;
	dagmammaIEgenBolig: IdagmammaIEgenBolig;
	etterbetalingsperiode: Ietterbetalingsperiode;
	inntektPaaNorskKontinentalsokkel: IinntektPaaNorskKontinentalsokkel;
	inntjeningsforhold: Iinntjeningsforhold;
	livrente: Ilivrente;
	lottOgPart: IlottOgPart;
	nettoloenn: Inettoloenn;
	pensjon: Ipensjon;
	reiseKostOgLosji: IreiseKostOgLosji;
	utenlandskArtist: IutenlandskArtist;
	bonusFraForsvaret: IbonusFraForsvaret;
	CustomFields: any;
}


export interface IbilOgBaat {
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
	tilleggsinformasjon: Itilleggsinformasjon;
	nettoloenn: Inettoloenn;
	CustomFields: any;
}


export interface IdagmammaIEgenBolig {
	tilleggsinformasjonID: number;
	antallBarn: string;
	antallMaaneder: string;
	ID: number;
	Deleted: boolean;
	tilleggsinformasjon: Itilleggsinformasjon;
	CustomFields: any;
}


export interface Ietterbetalingsperiode {
	tilleggsinformasjonID: number;
	startdato: string;
	sluttdato: string;
	ID: number;
	Deleted: boolean;
	tilleggsinformasjon: Itilleggsinformasjon;
	CustomFields: any;
}


export interface IinntektPaaNorskKontinentalsokkel {
	tilleggsinformasjonID: number;
	tidsrom: string;
	gjelderLoennFoerste60Dager: number;
	startdato: string;
	sluttdato: string;
	ID: number;
	Deleted: boolean;
	tilleggsinformasjon: Itilleggsinformasjon;
	CustomFields: any;
}


export interface Iinntjeningsforhold {
	tilleggsinformasjonID: number;
	Inntjeningsforhold: string;
	ID: number;
	Deleted: boolean;
	tilleggsinformasjon: Itilleggsinformasjon;
	CustomFields: any;
}


export interface Ilivrente {
	tilleggsinformasjonID: number;
	totaltUtbetaltBeloep: string;
	ID: number;
	Deleted: boolean;
	tilleggsinformasjon: Itilleggsinformasjon;
	CustomFields: any;
}


export interface IlottOgPart {
	tilleggsinformasjonID: number;
	antallDager: string;
	ID: number;
	Deleted: boolean;
	tilleggsinformasjon: Itilleggsinformasjon;
	CustomFields: any;
}


export interface Inettoloenn {
	tilleggsinformasjonID: number;
	oppgrossingstabellnummer: string;
	bilOgBaatID: number;
	betaltSkattebeloepIUtlandet: string;
	ID: number;
	Deleted: boolean;
	tilleggsinformasjon: Itilleggsinformasjon;
	bilOgBaat: IbilOgBaat;
	CustomFields: any;
}


export interface Ipensjon {
	tilleggsinformasjonID: number;
	grunnpensjonsbeloep: string;
	tilleggspensjonbeloep: string;
	ufoeregrad: string;
	pensjonsgrad: string;
	heravEtterlattepensjon: string;
	tidsrom: string;
	ID: number;
	Deleted: boolean;
	tilleggsinformasjon: Itilleggsinformasjon;
	CustomFields: any;
}


export interface IreiseKostOgLosji {
	tilleggsinformasjonID: number;
	persontype: string;
	antallreiser: string;
	ID: number;
	Deleted: boolean;
	tilleggsinformasjon: Itilleggsinformasjon;
	CustomFields: any;
}


export interface IutenlandskArtist {
	tilleggsinformasjonID: number;
	inntektsaar: string;
	oppgrossingsgrunnlag: string;
	trukketArtistskatt: string;
	ID: number;
	Deleted: boolean;
	tilleggsinformasjon: Itilleggsinformasjon;
	CustomFields: any;
}


export interface IbonusFraForsvaret {
	tilleggsinformasjonID: number;
	aaretUtbetalingenGjelderFor: string;
	ID: number;
	Deleted: boolean;
	tilleggsinformasjon: Itilleggsinformasjon;
	CustomFields: any;
}


export interface ISTYRKCode {
	ynr: number;
	lnr: number;
	styrk: string;
	tittel: string;
	ID: number;
	Deleted: boolean;
	CustomFields: any;
}


export interface ITaxTable {
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


export interface IVatCodeGroupSetup {
	No: number;
	Name: string;
	ID: number;
	Deleted: boolean;
	CustomFields: any;
}


export interface IVatPostSetup {
	Name: string;
	ID: number;
	Deleted: boolean;
	CustomFields: any;
}


export interface IVatReportReferenceSetup {
	VatCode: string;
	VatPostName: string;
	ID: number;
	Deleted: boolean;
	CustomFields: any;
}


export interface IVatTypeSetup {
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


export interface IUser {
	DisplayName: string;
	Email: string;
	GlobalIdentity: string;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	Status: IStatus;
	CustomFields: any;
}


export interface ITreeStructure {
	ParentID: number;
	Lft: number;
	Rght: number;
	Depth: number;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	CustomFields: any;
}


export interface IProduct {
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
	ProductCategoryLinks: Array<IProductCategoryLink>;
	CustomFields: any;
}


export interface ITradeItem {
	Comment: string;
	ProductID: number;
	ItemText: string;
	NumberOfItems: number;
	Price: number;
	DiscountPercent: number;
	VatCodeID: number;
	DimensionsID: number;
	SumTotal: number;
	SumVat: number;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	Product: IProduct;
	Dimensions: IDimensions;
	CustomFields: any;
}


export interface IProductCategory {
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


export interface IProductCategoryLink {
	ProductID: number;
	ProductCategoryID: number;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	ProductCategory: IProductCategory;
	CustomFields: any;
}


export interface ITracelink {
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
	RootType: ITracelinkType;
	SourceType: ITracelinkType;
	DestinationType: ITracelinkType;
	CustomFields: any;
}


export interface IUserVerification {
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


export interface IStatus {
	StatusCategoryID: number;
	StatusCode: number;
	System: boolean;
	Description: string;
	Order: number;
	EntityType: string;
	ID: number;
	Deleted: boolean;
	StatusCategory: IStatusCategory;
	CustomFields: any;
}


export interface IStatusCategory {
	Name: string;
	StatusCategoryCode: StatusCategoryCode;
	ID: number;
	Deleted: boolean;
	CustomFields: any;
}


export interface ITransition {
	MethodName: string;
	EntityType: string;
	Controller: string;
	ID: number;
	Deleted: boolean;
	CustomFields: any;
}


export interface ITransitionFlow {
	FromStatusID: number;
	ToStatusID: number;
	TransitionID: number;
	EntityType: string;
	ID: number;
	Deleted: boolean;
	FromStatus: IStatus;
	ToStatus: IStatus;
	Transition: ITransition;
	CustomFields: any;
}


export interface INumberSeriesInvalidOverlap {
	NumberSerieTypeAID: number;
	NumberSerieTypeBID: number;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	NumberSerieTypeA: INumberSeriesType;
	NumberSerieTypeB: INumberSeriesType;
	CustomFields: any;
}


export interface INumberSeries {
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
	NumberSeriesType: INumberSeriesType;
	CustomFields: any;
}


export interface INumberSeriesType {
	Name: string;
	EntityType: string;
	Yearly: boolean;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	CustomFields: any;
}


export interface IAccrual {
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
	Balance: IAccount;
	Line: IJournalEntryLineDraft;
	CustomFields: any;
}


export interface IJournalEntryMode {
	Name: string;
	ColumnSetUp: string;
	VisibleModules: string;
	TraceLinkTypes: string;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	CustomFields: any;
}


export interface IJournalEntry {
	JournalEntryNumber: string;
	FinancialYearID: number;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	FinancialYear: IFinancialYear;
	Lines: Array<IJournalEntryLine>;
	DraftLines: Array<IJournalEntryLineDraft>;
	CustomFields: any;
}


export interface IJournalEntryLine {
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
	VatType: IVatType;
	Account: IAccount;
	SubAccount: IAccount;
	ReferenceCreditPost: IJournalEntryLine;
	OriginalReferencePost: IJournalEntryLine;
	ReferenceOriginalPost: IJournalEntryLine;
	Dimensions: IDimensions;
	CustomFields: any;
}


export interface IJournalEntryLineDraft {
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
	Accrual: IAccrual;
	VatType: IVatType;
	Account: IAccount;
	SubAccount: IAccount;
	ReferenceCreditPost: IJournalEntryLine;
	OriginalReferencePost: IJournalEntryLine;
	ReferenceOriginalPost: IJournalEntryLine;
	Dimensions: IDimensions;
	CustomFields: any;
}


export interface IPayment {
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
	BankAccount: IBankAccount;
	Customer: ICustomer;
	Currency: ICurrency;
	CustomFields: any;
}


export interface IVatCodeGroup {
	No: number;
	Name: string;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	CustomFields: any;
}


export interface IVatPost {
	Name: string;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	CustomFields: any;
}


export interface IVatReportReference {
	VatTypeID: number;
	VatPostID: number;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	VatType: IVatType;
	VatPost: IVatPost;
	CustomFields: any;
}


export interface IPostPost {
	JournalEntryInvoiceID: number;
	JournalEntryBankID: number;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	JournalEntryInvoice: IJournalEntry;
	JournalEntryBank: IJournalEntry;
	CustomFields: any;
}


export interface ISupplierInvoiceItem {
	SupplierInvoiceID: number;
	Comment: string;
	ProductID: number;
	ItemText: string;
	NumberOfItems: number;
	Price: number;
	DiscountPercent: number;
	VatCodeID: number;
	DimensionsID: number;
	SumTotal: number;
	SumVat: number;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	Product: IProduct;
	Dimensions: IDimensions;
	CustomFields: any;
}


export interface ISupplierInvoice {
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
	ShippingAddressLine1: string;
	ShippingAddressLine2: string;
	ShippingAddressLine3: string;
	ShippingPostalCode: number;
	ShippingCity: string;
	ShippingCountryCode: string;
	ShippingCountry: string;
	CustomerPerson: string;
	InvoiceRecieverName: string;
	InvoiceAddressLine1: string;
	InvoiceAddressLine2: string;
	InvoiceAddressLine3: string;
	InvoicePostalCode: number;
	InvoiceCity: string;
	InvoiceCountryCode: string;
	InvoiceCountry: string;
	OurReference: string;
	YourReference: string;
	SalesPerson: string;
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
	Supplier: ISupplier;
	Items: Array<ISupplierInvoiceItem>;
	JournalEntry: IJournalEntry;
	Dimensions: IDimensions;
	CustomFields: any;
}


export interface IJournalEntrySourceSerie {
	JournalEntrySourceID: number;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	CustomFields: any;
}


export interface IAccountGroupSet {
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


export interface IAccount {
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
	Currency: ICurrency;
	AccountGroup: IAccountGroup;
	VatType: IVatType;
	MainAccount: IAccount;
	Customer: ICustomer;
	Supplier: ISupplier;
	Employee: IEmployee;
	Dimensions: IDimensions;
	SubAccountNumberSeries: INumberSeries;
	Alias: Array<IAccountAlias>;
	CompatibleAccountGroups: Array<IAccountGroup>;
	SubAccounts: Array<IAccount>;
	CustomFields: any;
}


export interface IAccountAlias {
	Name: string;
	AccountID: number;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	CustomFields: any;
}


export interface IAccountGroup {
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
	MainGroup: IAccountGroup;
	AccountGroupSet: IAccountGroupSet;
	CustomFields: any;
}


export interface IBank {
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


export interface IBankAccount {
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


export interface ICurrency {
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


export interface IFinancialYear {
	Year: number;
	ValidFrom: Date;
	ValidTo: Date;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	CustomFields: any;
}


export interface IVatCodeDeduction {
	DeductionPercent: number;
	ValidFrom: Date;
	ValidTo: Date;
	VatTypeID: number;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	VatType: IVatType;
	CustomFields: any;
}


export interface IVatType {
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
	IncomingAccount: IAccount;
	OutgoingAccount: IAccount;
	Deductions: Array<IVatCodeDeduction>;
	VatCodeGroup: IVatCodeGroup;
	VatReportReferences: Array<IVatReportReference>;
	CustomFields: any;
}


export interface IClientValidationRule {
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


export interface IComplexValidationRule {
	EntityType: string;
	ValidationCode: number;
	Message: string;
	Operation: OperationType;
	Level: ValidationLevel;
	ID: number;
	Deleted: boolean;
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
