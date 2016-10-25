/* tslint:disable */

export class AuditLog {
    public static RelativeUrl = 'auditlogs';
    public static EntityType = 'AuditLog';

    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public EntityID: number;
    public EntityType: string;
    public Field: string;
    public ID: number;
    public NewValue: string;
    public OldValue: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CustomFields: any;
}


export class Worker {
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


export class WorkItem {
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
    public WorkRelationID: number;
    public WorkTypeID: number;
    public WorkRelation: WorkRelation;
    public Worktype: WorkType;
    public CustomerOrder: CustomerOrder;
    public Dimensions: Dimensions;
    public CustomFields: any;
}


export class WorkProfile {
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


export class WorkRelation {
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
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public WorkerID: number;
    public WorkPercentage: number;
    public WorkProfileID: number;
    public WorkProfile: WorkProfile;
    public Employment: Employment;
    public Items: Array<WorkItem>;
    public CustomFields: any;
}


export class WorkType {
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


export class FieldLayout {
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


export class ComponentLayout {
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


export class UserRole {
    public static RelativeUrl = '';
    public static EntityType = 'UserRole';

    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public ID: number;
    public SharedRoleId: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public UserID: number;
    public User: User;
    public CustomFields: any;
}


export class Role {
    public static RelativeUrl = '';
    public static EntityType = 'Role';

    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public DescriptionKey: string;
    public ID: number;
    public LabelKey: string;
    public Name: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public RolePermissions: Array<RolePermission>;
    public CustomFields: any;
}


export class RolePermission {
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


export class Permission {
    public static RelativeUrl = '';
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


export class AccountVisibilityGroupAccount {
    public static RelativeUrl = '';
    public static EntityType = 'AccountVisibilityGroupAccount';

    public AccountNumber: number;
    public AccountVisibilityGroupID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public ID: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CustomFields: any;
}


export class AccountVisibilityGroup {
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


export class PostalCode {
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


export class UserVerification {
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


export class AccountGroupSetup {
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


export class AccountSetup {
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


export class AGARate {
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


export class AGASector {
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


export class AGAZone {
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


export class bilOgBaat {
    public static RelativeUrl = '';
    public static EntityType = 'bilOgBaat';

    public antallKilometer: string;
    public bilregistreringsnummer: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public erBilPool: string;
    public erBilUtenforStandardregelen: number;
    public heravAntallKilometerMellomHjemOgArbeid: string;
    public ID: number;
    public listeprisForBil: string;
    public nettoloennID: number;
    public personklassifiseringAvBilbruker: string;
    public tilleggsinformasjonID: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public tilleggsinformasjon: tilleggsinformasjon;
    public nettoloenn: nettoloenn;
    public CustomFields: any;
}


export class bonusFraForsvaret {
    public static RelativeUrl = '';
    public static EntityType = 'bonusFraForsvaret';

    public aaretUtbetalingenGjelderFor: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public ID: number;
    public tilleggsinformasjonID: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public tilleggsinformasjon: tilleggsinformasjon;
    public CustomFields: any;
}


export class Company {
    public static RelativeUrl = 'companies';
    public static EntityType = 'Company';

    public ConnectionString: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public ID: number;
    public IsTest: boolean;
    public Key: string;
    public Name: string;
    public SchemaName: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CustomFields: any;
}


export class CompanyAccess {
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


export class CompanyType {
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


export class Country {
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


export class CurrencyEntry {
    public static RelativeUrl = '';
    public static EntityType = 'CurrencyEntry';

    public Code: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Date: Date;
    public Deleted: boolean;
    public ExchangeRate: number;
    public Factor: number;
    public ID: number;
    public Source: CurrencySourceEnum;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CustomFields: any;
}


export class dagmammaIEgenBolig {
    public static RelativeUrl = '';
    public static EntityType = 'dagmammaIEgenBolig';

    public antallBarn: string;
    public antallMaaneder: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public ID: number;
    public tilleggsinformasjonID: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public tilleggsinformasjon: tilleggsinformasjon;
    public CustomFields: any;
}


export class EmploymentValidValues {
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


export class etterbetalingsperiode {
    public static RelativeUrl = '';
    public static EntityType = 'etterbetalingsperiode';

    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public ID: number;
    public sluttdato: string;
    public startdato: string;
    public tilleggsinformasjonID: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public tilleggsinformasjon: tilleggsinformasjon;
    public CustomFields: any;
}


export class Inntekt {
    public static RelativeUrl = '';
    public static EntityType = 'Inntekt';

    public arbeidsforholdID: number;
    public beloep: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public fordel: string;
    public gammelkode: string;
    public gyldigfraogmed: string;
    public gyldigtil: string;
    public ID: number;
    public inngaarIGrunnlagForTrekk: number;
    public KunFraNAV: string;
    public loennsinntektID: number;
    public naeringsinntektID: number;
    public pensjonEllerTrygdID: number;
    public Postnr: string;
    public skatteOgAvgiftsregel: string;
    public sluttdatoOpptjeningsperiode: Date;
    public startdatoOpptjeningsperiode: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public utloeserArbeidsgiveravgift: number;
    public loennsinntekt: loennsinntekt;
    public naeringsinntekt: naeringsinntekt;
    public pensjonEllerTrygd: pensjonEllerTrygd;
    public CustomFields: any;
}


export class inntektPaaNorskKontinentalsokkel {
    public static RelativeUrl = '';
    public static EntityType = 'inntektPaaNorskKontinentalsokkel';

    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public gjelderLoennFoerste60Dager: number;
    public ID: number;
    public sluttdato: string;
    public startdato: string;
    public tidsrom: string;
    public tilleggsinformasjonID: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public tilleggsinformasjon: tilleggsinformasjon;
    public CustomFields: any;
}


export class inntjeningsforhold {
    public static RelativeUrl = '';
    public static EntityType = 'inntjeningsforhold';

    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public ID: number;
    public Inntjeningsforhold: string;
    public tilleggsinformasjonID: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public tilleggsinformasjon: tilleggsinformasjon;
    public CustomFields: any;
}


export class livrente {
    public static RelativeUrl = '';
    public static EntityType = 'livrente';

    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public ID: number;
    public tilleggsinformasjonID: number;
    public totaltUtbetaltBeloep: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public tilleggsinformasjon: tilleggsinformasjon;
    public CustomFields: any;
}


export class loennsinntekt {
    public static RelativeUrl = '';
    public static EntityType = 'loennsinntekt';

    public antall: string;
    public beskrivelse: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public ID: number;
    public InntektID: number;
    public spesifikasjonID: number;
    public tilleggsinformasjonID: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Inntekt: Inntekt;
    public tilleggsinformasjon: tilleggsinformasjon;
    public spesifikasjon: spesifikasjon;
    public CustomFields: any;
}


export class lottOgPart {
    public static RelativeUrl = '';
    public static EntityType = 'lottOgPart';

    public antallDager: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public ID: number;
    public tilleggsinformasjonID: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public tilleggsinformasjon: tilleggsinformasjon;
    public CustomFields: any;
}


export class Municipal {
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


export class MunicipalAGAZone {
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


export class naeringsinntekt {
    public static RelativeUrl = '';
    public static EntityType = 'naeringsinntekt';

    public beskrivelse: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public ID: number;
    public InntektID: number;
    public tilleggsinformasjonID: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Inntekt: Inntekt;
    public tilleggsinformasjon: tilleggsinformasjon;
    public CustomFields: any;
}


export class nettoloenn {
    public static RelativeUrl = '';
    public static EntityType = 'nettoloenn';

    public betaltSkattebeloepIUtlandet: string;
    public bilOgBaatID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public ID: number;
    public oppgrossingstabellnummer: string;
    public tilleggsinformasjonID: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public tilleggsinformasjon: tilleggsinformasjon;
    public bilOgBaat: bilOgBaat;
    public CustomFields: any;
}


export class PaymentCode {
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


export class pensjon {
    public static RelativeUrl = '';
    public static EntityType = 'pensjon';

    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public grunnpensjonsbeloep: string;
    public heravEtterlattepensjon: string;
    public ID: number;
    public pensjonsgrad: string;
    public tidsrom: string;
    public tilleggsinformasjonID: number;
    public tilleggspensjonbeloep: string;
    public ufoeregrad: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public tilleggsinformasjon: tilleggsinformasjon;
    public CustomFields: any;
}


export class pensjonEllerTrygd {
    public static RelativeUrl = '';
    public static EntityType = 'pensjonEllerTrygd';

    public beskrivelse: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public ID: number;
    public InntektID: number;
    public tilleggsinformasjonID: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Inntekt: Inntekt;
    public tilleggsinformasjon: tilleggsinformasjon;
    public CustomFields: any;
}


export class reiseKostOgLosji {
    public static RelativeUrl = '';
    public static EntityType = 'reiseKostOgLosji';

    public antallreiser: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public ID: number;
    public persontype: string;
    public tilleggsinformasjonID: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public tilleggsinformasjon: tilleggsinformasjon;
    public CustomFields: any;
}


export class tilleggsinformasjon {
    public static RelativeUrl = '';
    public static EntityType = 'tilleggsinformasjon';

    public bilOgBaatID: number;
    public bonusFraForsvaretID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public dagmammaIEgenBoligID: number;
    public Deleted: boolean;
    public etterbetalingsperiodeID: number;
    public ID: number;
    public inntektPaaNorskKontinentalsokkelID: number;
    public inntjeningsforholdID: number;
    public livrenteID: number;
    public loennsinntektID: number;
    public lottOgPartID: number;
    public naeringsinntektID: number;
    public nettoloennID: number;
    public pensjonEllerTrygdID: number;
    public pensjonID: number;
    public reiseKostOgLosjiID: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public utenlandskArtistID: number;
    public loennsinntekt: loennsinntekt;
    public naeringsinntekt: naeringsinntekt;
    public pensjonEllerTrygd: pensjonEllerTrygd;
    public bilOgBaat: bilOgBaat;
    public dagmammaIEgenBolig: dagmammaIEgenBolig;
    public etterbetalingsperiode: etterbetalingsperiode;
    public inntektPaaNorskKontinentalsokkel: inntektPaaNorskKontinentalsokkel;
    public inntjeningsforhold: inntjeningsforhold;
    public livrente: livrente;
    public lottOgPart: lottOgPart;
    public nettoloenn: nettoloenn;
    public pensjon: pensjon;
    public reiseKostOgLosji: reiseKostOgLosji;
    public utenlandskArtist: utenlandskArtist;
    public bonusFraForsvaret: bonusFraForsvaret;
    public CustomFields: any;
}


export class utenlandskArtist {
    public static RelativeUrl = '';
    public static EntityType = 'utenlandskArtist';

    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public ID: number;
    public inntektsaar: string;
    public oppgrossingsgrunnlag: string;
    public tilleggsinformasjonID: number;
    public trukketArtistskatt: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public tilleggsinformasjon: tilleggsinformasjon;
    public CustomFields: any;
}


export class spesifikasjon {
    public static RelativeUrl = '';
    public static EntityType = 'spesifikasjon';

    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public erOpptjentPaaHjelpefartoey: number;
    public erOpptjentPaaKontinentalsokkel: number;
    public ID: number;
    public loennsinntektID: number;
    public opptjeningsland: string;
    public skattemessigBosattILand: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public loennsinntekt: loennsinntekt;
    public CustomFields: any;
}


export class StaticRegister {
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


export class STYRKCode {
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


export class TracelinkType {
    public static RelativeUrl = 'tracelinktypes';
    public static EntityType = 'TracelinkType';

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


export class VatCodeGroupSetup {
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


export class VatPostSetup {
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


export class VatReportForm {
    public static RelativeUrl = 'vatreportforms';
    public static EntityType = 'VatReportForm';

    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public ID: number;
    public Name: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CustomFields: any;
}


export class VatReportReferenceSetup {
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


export class VatTypeSetup {
    public static RelativeUrl = '';
    public static EntityType = 'VatTypeSetup';

    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
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


export class LanguageCode {
    public static RelativeUrl = '';
    public static EntityType = 'LanguageCode';

    public Code: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public ID: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CustomFields: any;
}


export class Translation {
    public static RelativeUrl = '';
    public static EntityType = 'Translation';

    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public ID: number;
    public IsTemplate: boolean;
    public Key: string;
    public LanguageCode: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Value: string;
    public CustomFields: any;
}


export class TranslationKey {
    public static RelativeUrl = '';
    public static EntityType = 'TranslationKey';

    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public ID: number;
    public Key: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CustomFields: any;
}


export class PeriodSeries {
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


export class PeriodTemplate {
    public static RelativeUrl = 'period-templates';
    public static EntityType = 'PeriodTemplate';

    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public FromDate: Date;
    public ID: number;
    public Name: string;
    public No: number;
    public PeriodSeriesID: number;
    public ToDate: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public PeriodSeries: PeriodSeries;
    public CustomFields: any;
}


export class ReportDefinition {
    public static RelativeUrl = 'report-definitions';
    public static EntityType = 'ReportDefinition';

    public Category: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public Description: string;
    public ID: number;
    public Name: string;
    public TemplateLinkId: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CustomFields: any;
}


export class ReportDefinitionDataSource {
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


export class ReportDefinitionParameter {
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


export class Customer {
    public static RelativeUrl = 'customers';
    public static EntityType = 'Customer';

    public BusinessRelationID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public CreditDays: number;
    public CustomerNumber: number;
    public DefaultBankAccountID: number;
    public Deleted: boolean;
    public DimensionsID: number;
    public ID: number;
    public OrgNumber: string;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public WebUrl: string;
    public Info: BusinessRelation;
    public DefaultBankAccount: BankAccount;
    public Dimensions: Dimensions;
    public CustomFields: any;
}


export class CustomerInvoice {
    public static RelativeUrl = 'invoices';
    public static EntityType = 'CustomerInvoice';

    public AmountRegards: string;
    public Attachments: string;
    public BankAccount: string;
    public Comment: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public CreditDays: number;
    public Credited: boolean;
    public CreditedAmount: number;
    public CurrencyCode: string;
    public CustomerID: number;
    public CustomerName: string;
    public CustomerOrgNumber: string;
    public CustomerPerson: string;
    public Deleted: boolean;
    public DeliveryDate: Date;
    public DeliveryMethod: string;
    public DeliveryName: string;
    public DeliveryTerm: string;
    public FreeTxt: string;
    public ID: number;
    public InternalNote: string;
    public InvoiceAddressLine1: string;
    public InvoiceAddressLine2: string;
    public InvoiceAddressLine3: string;
    public InvoiceCity: string;
    public InvoiceCountry: string;
    public InvoiceCountryCode: string;
    public InvoiceDate: Date;
    public InvoiceNumber: string;
    public InvoiceNumberSeriesID: number;
    public InvoicePostalCode: string;
    public InvoiceReceiverName: string;
    public InvoiceReferenceID: number;
    public InvoiceType: number;
    public JournalEntryID: number;
    public OurReference: string;
    public Payment: string;
    public PaymentDueDate: Date;
    public PaymentID: string;
    public PaymentInformation: string;
    public PaymentTerm: string;
    public Requisition: string;
    public RestAmount: number;
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
    public TaxExclusiveCurrencyAmount: number;
    public TaxInclusiveAmount: number;
    public TaxInclusiveCurrencyAmount: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public VatTotalsAmount: number;
    public YourReference: string;
    public JournalEntry: JournalEntry;
    public Customer: Customer;
    public InvoiceNumberNumberSeries: NumberSeries;
    public Items: Array<CustomerInvoiceItem>;
    public InvoiceReference: CustomerInvoice;
    public CustomFields: any;
}


export class CustomerInvoiceItem {
    public static RelativeUrl = 'invoiceitems';
    public static EntityType = 'CustomerInvoiceItem';

    public AccountID: number;
    public CalculateGrossPriceBasedOnNetPrice: boolean;
    public Comment: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public CustomerInvoiceID: number;
    public Deleted: boolean;
    public DimensionsID: number;
    public Discount: number;
    public DiscountPercent: number;
    public ID: number;
    public ItemText: string;
    public NumberOfItems: number;
    public PriceExVat: number;
    public PriceIncVat: number;
    public ProductID: number;
    public StatusCode: number;
    public SumTotalExVat: number;
    public SumTotalIncVat: number;
    public SumVat: number;
    public Unit: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public VatTypeID: number;
    public Product: Product;
    public VatType: VatType;
    public Dimensions: Dimensions;
    public Account: Account;
    public CustomFields: any;
}


export class CustomerOrder {
    public static RelativeUrl = 'orders';
    public static EntityType = 'CustomerOrder';

    public Attachments: string;
    public Comment: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public CreditDays: number;
    public CurrencyCode: string;
    public CustomerID: number;
    public CustomerName: string;
    public CustomerOrgNumber: string;
    public CustomerPerson: string;
    public Deleted: boolean;
    public DeliveryDate: Date;
    public DeliveryMethod: string;
    public DeliveryTerm: string;
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
    public OrderDate: Date;
    public OrderNumber: number;
    public OrderNumberSeriesID: number;
    public OurReference: string;
    public PaymentTerm: string;
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
    public TaxExclusiveCurrencyAmount: number;
    public TaxInclusiveAmount: number;
    public TaxInclusiveCurrencyAmount: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public VatTotalsAmount: number;
    public YourReference: string;
    public Customer: Customer;
    public OrderNumberNumberSeries: NumberSeries;
    public Items: Array<CustomerOrderItem>;
    public CustomFields: any;
}


export class CustomerOrderItem {
    public static RelativeUrl = 'orderitems';
    public static EntityType = 'CustomerOrderItem';

    public CalculateGrossPriceBasedOnNetPrice: boolean;
    public Comment: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public CustomerOrderID: number;
    public Deleted: boolean;
    public DimensionsID: number;
    public Discount: number;
    public DiscountPercent: number;
    public ID: number;
    public ItemText: string;
    public NumberOfItems: number;
    public PriceExVat: number;
    public PriceIncVat: number;
    public ProductID: number;
    public StatusCode: number;
    public SumTotalExVat: number;
    public SumTotalIncVat: number;
    public SumVat: number;
    public Unit: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public VatTypeID: number;
    public Product: Product;
    public VatType: VatType;
    public Dimensions: Dimensions;
    public CustomFields: any;
}


export class CustomerQuote {
    public static RelativeUrl = 'quotes';
    public static EntityType = 'CustomerQuote';

    public Attachments: string;
    public Comment: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public CreditDays: number;
    public CurrencyCode: string;
    public CustomerID: number;
    public CustomerName: string;
    public CustomerOrgNumber: string;
    public CustomerPerson: string;
    public Deleted: boolean;
    public DeliveryDate: Date;
    public DeliveryMethod: string;
    public DeliveryTerm: string;
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
    public PaymentTerm: string;
    public QuoteDate: Date;
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
    public TaxExclusiveCurrencyAmount: number;
    public TaxInclusiveAmount: number;
    public TaxInclusiveCurrencyAmount: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public ValidUntilDate: Date;
    public VatTotalsAmount: number;
    public YourReference: string;
    public Customer: Customer;
    public QuoteNumberNumberSeries: NumberSeries;
    public Items: Array<CustomerQuoteItem>;
    public CustomFields: any;
}


export class CustomerQuoteItem {
    public static RelativeUrl = 'quoteitems';
    public static EntityType = 'CustomerQuoteItem';

    public CalculateGrossPriceBasedOnNetPrice: boolean;
    public Comment: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public CustomerQuoteID: number;
    public Deleted: boolean;
    public DimensionsID: number;
    public Discount: number;
    public DiscountPercent: number;
    public ID: number;
    public ItemText: string;
    public NumberOfItems: number;
    public PriceExVat: number;
    public PriceIncVat: number;
    public ProductID: number;
    public StatusCode: number;
    public SumTotalExVat: number;
    public SumTotalIncVat: number;
    public SumVat: number;
    public Unit: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public VatTypeID: number;
    public Product: Product;
    public VatType: VatType;
    public Dimensions: Dimensions;
    public CustomFields: any;
}


export class Supplier {
    public static RelativeUrl = 'suppliers';
    public static EntityType = 'Supplier';

    public BusinessRelationID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public DefaultBankAccountID: number;
    public Deleted: boolean;
    public DimensionsID: number;
    public ID: number;
    public OrgNumber: string;
    public StatusCode: number;
    public SupplierNumber: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public WebUrl: string;
    public Info: BusinessRelation;
    public DefaultBankAccount: BankAccount;
    public Dimensions: Dimensions;
    public CustomFields: any;
}


export class Address {
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


export class Contact {
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


export class BusinessRelation {
    public static RelativeUrl = 'business-relations';
    public static EntityType = 'BusinessRelation';

    public CreatedAt: Date;
    public CreatedBy: string;
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
    public Addresses: Array<Address>;
    public Phones: Array<Phone>;
    public Emails: Array<Email>;
    public InvoiceAddress: Address;
    public ShippingAddress: Address;
    public DefaultPhone: Phone;
    public DefaultEmail: Email;
    public CustomFields: any;
}


export class Email {
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


export class Phone {
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


export class AmeldingData {
    public static RelativeUrl = 'amelding';
    public static EntityType = 'AmeldingData';

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


export class AmeldingLog {
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


export class BasicAmount {
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


export class CompanySalary {
    public static RelativeUrl = 'companysalary';
    public static EntityType = 'CompanySalary';

    public BankAccountSalary: number;
    public BankAccountTaxWithdraw: number;
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
    public PaymentInterval: number;
    public RemitRegularTraits: boolean;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public WageDeductionDueToHoliday: WageDeductionDueToHolidayType;
    public WagetypeAdvancePayment: number;
    public WagetypeAdvancePaymentAuto: number;
    public CustomFields: any;
}


export class CompanyVacationRate {
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


export class EmployeeCategory {
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


export class EmployeeCategoryLink {
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


export class EmployeeLeave {
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


export class Employment {
    public static RelativeUrl = 'employments';
    public static EntityType = 'Employment';

    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
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
    public Employee: Employee;
    public SubEntity: SubEntity;
    public Leaves: Array<EmployeeLeave>;
    public CustomFields: any;
}


export class SubEntity {
    public static RelativeUrl = 'subentities';
    public static EntityType = 'SubEntity';

    public AgaRule: number;
    public AgaZone: number;
    public BusinessRelationID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
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


export class Grant {
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
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CustomFields: any;
}


export class PayrollRun {
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
    public ID: number;
    public needsRecalc: boolean;
    public PayDate: Date;
    public SettlementDate: Date;
    public StatusCode: number;
    public ToDate: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public transactions: Array<SalaryTransaction>;
    public CustomFields: any;
}


export class VacationRateEmployee {
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


export class WageType {
    public static RelativeUrl = 'wagetypes';
    public static EntityType = 'WageType';

    public AccountNumber: number;
    public AccountNumber_balance: number;
    public Aga_nav: boolean;
    public Aga_otp: boolean;
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
    public StandardWageTypeFor: StdWageType;
    public StatusCode: number;
    public SystemRequiredWageType: number;
    public taxtype: TaxType;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public WageTypeName: string;
    public WageTypeNumber: number;
    public SupplementaryInformations: Array<WageTypeSupplement>;
    public CustomFields: any;
}


export class WageTypeSupplement {
    public static RelativeUrl = '';
    public static EntityType = 'WageTypeSupplement';

    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public Description: string;
    public ID: number;
    public Name: string;
    public SalaryTransactionSupplementID: number;
    public StatusCode: number;
    public SuggestedValue: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public ValueType: Valuetype;
    public WageTypeID: number;
    public SalaryTransactionSupplement: SalaryTransactionSupplement;
    public CustomFields: any;
}


export class SalaryTransaction {
    public static RelativeUrl = 'salarytrans';
    public static EntityType = 'SalaryTransaction';

    public Account: number;
    public Amount: number;
    public calcAGA: number;
    public ChildSalaryTransactionID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public EmployeeID: number;
    public EmployeeNumber: number;
    public EmploymentID: number;
    public FromDate: Date;
    public ID: number;
    public IsRecurringPost: boolean;
    public MunicipalityNo: string;
    public PayrollRunID: number;
    public Rate: number;
    public RecurringID: number;
    public recurringPostValidFrom: Date;
    public recurringPostValidTo: Date;
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
    public Supplements: Array<SalaryTransactionSupplement>;
    public CustomFields: any;
}


export class SalaryTransactionSupplement {
    public static RelativeUrl = '';
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
    public ValueMoney: number;
    public ValueString: string;
    public WageTypeSupplementID: number;
    public WageTypeSupplement: WageTypeSupplement;
    public CustomFields: any;
}


export class Employee {
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
    public isPensioner: boolean;
    public MunicipalityNo: string;
    public NonTaxableAmount: number;
    public NotMainEmployer: boolean;
    public PaymentInterval: PaymentInterval;
    public PhotoID: number;
    public Sex: number;
    public SocialSecurityNumber: string;
    public StatusCode: number;
    public SubEntityID: number;
    public TaxPercentage: number;
    public TaxTable: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public VacationRateEmployeeID: number;
    public BusinessRelationInfo: BusinessRelation;
    public Employments: Array<Employment>;
    public BankAccounts: Array<BankAccountSalary>;
    public VacationRateEmployee: VacationRateEmployee;
    public SubEntity: SubEntity;
    public CustomFields: any;
}


export class BankAccountSalary {
    public static RelativeUrl = '';
    public static EntityType = 'BankAccountSalary';

    public AccountNumber: string;
    public Active: boolean;
    public BankAddress: string;
    public BankName: string;
    public BIC: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public EmployeeID: number;
    public ID: number;
    public LandCode: string;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CustomFields: any;
}


export class Period {
    public static RelativeUrl = 'periodes';
    public static EntityType = 'Period';

    public AccountYear: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public FromDate: Date;
    public ID: number;
    public Name: string;
    public No: number;
    public PeriodSeriesID: number;
    public PeriodTemplateID: number;
    public StatusCode: number;
    public ToDate: Date;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public PeriodTemplate: PeriodTemplate;
    public CustomFields: any;
}


export class CompanySettings {
    public static RelativeUrl = 'companysettings';
    public static EntityType = 'CompanySettings';

    public AccountGroupSetID: number;
    public AccountingLockedDate: Date;
    public AccountVisibilityGroupID: number;
    public AutoJournalPayment: boolean;
    public BaseCurrency: string;
    public CompanyBankAccountID: number;
    public CompanyName: string;
    public CompanyRegistered: boolean;
    public CompanyTypeID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public CustomerAccountID: number;
    public CustomerCreditDays: number;
    public DefaultAddressID: number;
    public DefaultEmailID: number;
    public DefaultPhoneID: number;
    public Deleted: boolean;
    public ForceSupplierInvoiceApproval: boolean;
    public ID: number;
    public LogoFileID: number;
    public OfficeMunicipalityNo: string;
    public OrganizationNumber: string;
    public PeriodSeriesAccountID: number;
    public PeriodSeriesVatID: number;
    public SalaryBankAccountID: number;
    public SettlementVatAccountID: number;
    public StatusCode: number;
    public SupplierAccountID: number;
    public TaxBankAccountID: number;
    public TaxMandatory: boolean;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public VatLockedDate: Date;
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
    public CustomFields: any;
}


export class User {
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
    public CustomFields: any;
}


export class TreeStructure {
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


export class ProductCategory {
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


export class ProductCategoryLink {
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


export class Tracelink {
    public static RelativeUrl = '';
    public static EntityType = 'Tracelink';

    public CreatedAt: Date;
    public CreatedBy: string;
    public Date: Date;
    public Deleted: boolean;
    public DestinationID: number;
    public DestinationTypeID: number;
    public ID: number;
    public RootID: number;
    public RootTypeID: number;
    public SourceID: number;
    public SourceTypeID: number;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CustomFields: any;
}


export class Product {
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


export class Region {
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


export class Department {
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


export class Dimensions {
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


export class Project {
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


export class Responsible {
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


export class Status {
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


export class StatusCategory {
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


export class Transition {
    public static RelativeUrl = '';
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


export class TransitionFlow {
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


export class UniQueryFilter {
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


export class UniQueryField {
    public static RelativeUrl = 'uniqueryfields';
    public static EntityType = 'UniQueryField';

    public Alias: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public Field: string;
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


export class UniQueryDefinition {
    public static RelativeUrl = 'uniquerydefinitions';
    public static EntityType = 'UniQueryDefinition';

    public ClickParam: string;
    public ClickUrl: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public Description: string;
    public ID: number;
    public IsShared: boolean;
    public MainModelName: string;
    public Name: string;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public UserID: number;
    public UniQueryFilters: Array<UniQueryFilter>;
    public UniQueryFields: Array<UniQueryField>;
    public CustomFields: any;
}


export class NumberSeriesInvalidOverlap {
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


export class NumberSeries {
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
    public NumberSeriesTypeID: number;
    public StatusCode: number;
    public ToNumber: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public NumberSeriesType: NumberSeriesType;
    public CustomFields: any;
}


export class NumberSeriesType {
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


export class File {
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
    public Pages: number;
    public PermaLink: string;
    public StatusCode: number;
    public StorageReference: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CustomFields: any;
}


export class FileEntityLink {
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


export class Comment {
    public static RelativeUrl = 'comments';
    public static EntityType = 'Comment';

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
    public CustomFields: any;
}


export class Altinn {
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


export class AltinnSigning {
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


export class AltinnReceipt {
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


export class AltinnCorrespondanceReader {
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


export class Accrual {
    public static RelativeUrl = 'accruals';
    public static EntityType = 'Accrual';

    public BalanceID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public ID: number;
    public JournalEntryLineDraftID: number;
    public Month1: boolean;
    public Month10: boolean;
    public Month11: boolean;
    public Month12: boolean;
    public Month13: boolean;
    public Month14: boolean;
    public Month15: boolean;
    public Month16: boolean;
    public Month17: boolean;
    public Month18: boolean;
    public Month19: boolean;
    public Month2: boolean;
    public Month20: boolean;
    public Month21: boolean;
    public Month22: boolean;
    public Month23: boolean;
    public Month24: boolean;
    public Month3: boolean;
    public Month4: boolean;
    public Month5: boolean;
    public Month6: boolean;
    public Month7: boolean;
    public Month8: boolean;
    public Month9: boolean;
    public NumberOfMonths: number;
    public StartDate: Date;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Balance: Account;
    public Line: JournalEntryLineDraft;
    public CustomFields: any;
}


export class JournalEntryMode {
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


export class JournalEntry {
    public static RelativeUrl = 'journalentries';
    public static EntityType = 'JournalEntry';

    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public FinancialYearID: number;
    public ID: number;
    public JournalEntryNumber: string;
    public JournalEntryNumberNumeric: number;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public FinancialYear: FinancialYear;
    public Lines: Array<JournalEntryLine>;
    public DraftLines: Array<JournalEntryLineDraft>;
    public CustomFields: any;
}


export class JournalEntryLine {
    public static RelativeUrl = 'journalentrylines';
    public static EntityType = 'JournalEntryLine';

    public AccountID: number;
    public Amount: number;
    public BatchNumber: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public CurrencyAmount: number;
    public CurrencyCode: string;
    public CustomerInvoiceID: number;
    public Deleted: boolean;
    public Description: string;
    public DimensionsID: number;
    public FinancialDate: Date;
    public ID: number;
    public JournalEntryID: number;
    public JournalEntryNumber: string;
    public JournalEntryNumberNumeric: number;
    public OriginalJournalEntryPost: number;
    public OriginalReferencePostID: number;
    public PeriodID: number;
    public ReferenceCreditPostID: number;
    public ReferenceOriginalPostID: number;
    public RegisteredDate: Date;
    public RestAmount: number;
    public Signature: string;
    public StatusCode: number;
    public SubAccountID: number;
    public SupplierInvoiceID: number;
    public TaxBasisAmount: number;
    public TaxBasisCurrencyAmount: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public VatDate: Date;
    public VatDeductionPercent: number;
    public VatJournalEntryPostID: number;
    public VatPercent: number;
    public VatPeriodID: number;
    public VatReportID: number;
    public VatTypeID: number;
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
    public CustomFields: any;
}


export class JournalEntryLineDraft {
    public static RelativeUrl = 'journalentrylinedrafts';
    public static EntityType = 'JournalEntryLineDraft';

    public AccountID: number;
    public AccrualID: number;
    public Amount: number;
    public BatchNumber: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public CurrencyAmount: number;
    public CurrencyCode: string;
    public CustomerInvoiceID: number;
    public Deleted: boolean;
    public Description: string;
    public DimensionsID: number;
    public FinancialDate: Date;
    public ID: number;
    public JournalEntryID: number;
    public JournalEntryNumber: string;
    public JournalEntryNumberNumeric: number;
    public OriginalJournalEntryPost: number;
    public OriginalReferencePostID: number;
    public PeriodID: number;
    public ReferenceCreditPostID: number;
    public ReferenceOriginalPostID: number;
    public RegisteredDate: Date;
    public RestAmount: number;
    public Signature: string;
    public StatusCode: number;
    public SubAccountID: number;
    public SupplierInvoiceID: number;
    public TaxBasisAmount: number;
    public TaxBasisCurrencyAmount: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public VatDate: Date;
    public VatDeductionPercent: number;
    public VatJournalEntryPostID: number;
    public VatPercent: number;
    public VatPeriodID: number;
    public VatReportID: number;
    public VatTypeID: number;
    public Accrual: Accrual;
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
    public CustomFields: any;
}


export class Payment {
    public static RelativeUrl = 'payments';
    public static EntityType = 'Payment';

    public Amount: number;
    public AutoJournal: boolean;
    public BankAccountID: number;
    public BankAccountNumberTarget: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public CurrencyID: number;
    public CustomerID: number;
    public Deleted: boolean;
    public ID: number;
    public InvoiceNumber: string;
    public IsPaymentToSupplier: boolean;
    public PaymentID: string;
    public ReconcilePayment: boolean;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public BankAccount: BankAccount;
    public Customer: Customer;
    public Currency: Currency;
    public CustomFields: any;
}


export class VatCodeGroup {
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


export class VatReportArchivedSummary {
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


export class VatReportType {
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


export class VatReport {
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


export class VatPost {
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


export class VatReportReference {
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


export class PostPost {
    public static RelativeUrl = 'postposts';
    public static EntityType = 'PostPost';

    public Amount: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public CurrencyAmount: number;
    public CurrencyID: number;
    public Date: Date;
    public Deleted: boolean;
    public ID: number;
    public JournalEntryLine1ID: number;
    public JournalEntryLine2ID: number;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public JournalEntryLine1: JournalEntryLine;
    public JournalEntryLine2: JournalEntryLine;
    public Currency: Currency;
    public CustomFields: any;
}


export class SupplierInvoiceItem {
    public static RelativeUrl = '';
    public static EntityType = 'SupplierInvoiceItem';

    public CalculateGrossPriceBasedOnNetPrice: boolean;
    public Comment: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public DimensionsID: number;
    public Discount: number;
    public DiscountPercent: number;
    public ID: number;
    public ItemText: string;
    public NumberOfItems: number;
    public PriceExVat: number;
    public PriceIncVat: number;
    public ProductID: number;
    public StatusCode: number;
    public SumTotalExVat: number;
    public SumTotalIncVat: number;
    public SumVat: number;
    public SupplierInvoiceID: number;
    public Unit: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public VatTypeID: number;
    public Product: Product;
    public VatType: VatType;
    public Dimensions: Dimensions;
    public CustomFields: any;
}


export class SupplierInvoice {
    public static RelativeUrl = 'supplierinvoices';
    public static EntityType = 'SupplierInvoice';

    public AmountRegards: string;
    public Attachments: string;
    public BankAccount: string;
    public Comment: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public CreditDays: number;
    public Credited: boolean;
    public CreditedAmount: number;
    public CurrencyCode: string;
    public CustomerOrgNumber: string;
    public CustomerPerson: string;
    public Deleted: boolean;
    public DeliveryDate: Date;
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
    public InvoiceDate: Date;
    public InvoiceNumber: string;
    public InvoicePostalCode: string;
    public InvoiceReceiverName: string;
    public InvoiceReferenceID: number;
    public InvoiceType: number;
    public JournalEntryID: number;
    public OurReference: string;
    public Payment: string;
    public PaymentDueDate: Date;
    public PaymentID: string;
    public PaymentInformation: string;
    public PaymentTerm: string;
    public Requisition: string;
    public RestAmount: number;
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
    public TaxExclusiveCurrencyAmount: number;
    public TaxInclusiveAmount: number;
    public TaxInclusiveCurrencyAmount: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public VatTotalsAmount: number;
    public YourReference: string;
    public JournalEntry: JournalEntry;
    public Dimensions: Dimensions;
    public Supplier: Supplier;
    public Items: Array<SupplierInvoiceItem>;
    public InvoiceReference: SupplierInvoice;
    public CustomFields: any;
}


export class JournalEntrySourceSerie {
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


export class AccountGroupSet {
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


export class Account {
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
    public CurrencyID: number;
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
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public UseDeductivePercent: boolean;
    public UsePostPost: boolean;
    public VatTypeID: number;
    public Visible: boolean;
    public Currency: Currency;
    public AccountGroup: AccountGroup;
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
    public CustomFields: any;
}


export class AccountAlias {
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


export class AccountGroup {
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


export class Bank {
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


export class BankAccount {
    public static RelativeUrl = 'bankaccounts';
    public static EntityType = 'BankAccount';

    public AccountID: number;
    public AccountNumber: string;
    public BankAccountType: string;
    public BankID: number;
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
    public CustomFields: any;
}


export class Currency {
    public static RelativeUrl = 'currencies';
    public static EntityType = 'Currency';

    public Code: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Date: Date;
    public Deleted: boolean;
    public ExchangeRate: number;
    public Factor: number;
    public ID: number;
    public Name: string;
    public Source: CurrencySourceEnum;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public CustomFields: any;
}


export class FinancialYear {
    public static RelativeUrl = '';
    public static EntityType = 'FinancialYear';

    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public ID: number;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public ValidFrom: Date;
    public ValidTo: Date;
    public Year: number;
    public CustomFields: any;
}


export class VatCodeDeduction {
    public static RelativeUrl = 'vatcodedeductions';
    public static EntityType = 'VatCodeDeduction';

    public CreatedAt: Date;
    public CreatedBy: string;
    public DeductionPercent: number;
    public Deleted: boolean;
    public ID: number;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public ValidFrom: Date;
    public ValidTo: Date;
    public VatTypeID: number;
    public VatType: VatType;
    public CustomFields: any;
}


export class VatType {
    public static RelativeUrl = 'vattypes';
    public static EntityType = 'VatType';

    public Alias: string;
    public AvailableInModules: boolean;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
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
    public Deductions: Array<VatCodeDeduction>;
    public VatCodeGroup: VatCodeGroup;
    public VatReportReferences: Array<VatReportReference>;
    public CustomFields: any;
}


export class EntityValidationRule {
    public static RelativeUrl = '';
    public static EntityType = 'EntityValidationRule';

    public ChangedByCompany: boolean;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public EntityType: string;
    public ID: number;
    public Level: ValidationLevel;
    public OnConflict: OnConflict;
    public Operation: OperationType;
    public Operator: Operator;
    public PropertyName: string;
    public SyncKey: string;
    public System: boolean;
    public TranslationKey: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Value: string;
    public CustomFields: any;
}


export class EntityValidationRuleTemplate {
    public static RelativeUrl = '';
    public static EntityType = 'EntityValidationRuleTemplate';

    public ChangedByCompany: boolean;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public EntityType: string;
    public ID: number;
    public Level: ValidationLevel;
    public OnConflict: OnConflict;
    public Operation: OperationType;
    public Operator: Operator;
    public PropertyName: string;
    public SyncKey: string;
    public System: boolean;
    public TranslationKey: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Value: string;
    public CustomFields: any;
}


export class ComplexValidationRule {
    public static RelativeUrl = '';
    public static EntityType = 'ComplexValidationRule';

    public ChangedByCompany: boolean;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public EntityType: string;
    public ID: number;
    public Level: ValidationLevel;
    public OnConflict: OnConflict;
    public Operation: OperationType;
    public SyncKey: string;
    public System: boolean;
    public TranslationKey: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public ValidationCode: number;
    public CustomFields: any;
}


export class ComplexValidationRuleTemplate {
    public static RelativeUrl = '';
    public static EntityType = 'ComplexValidationRuleTemplate';

    public ChangedByCompany: boolean;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public EntityType: string;
    public ID: number;
    public Level: ValidationLevel;
    public OnConflict: OnConflict;
    public Operation: OperationType;
    public SyncKey: string;
    public System: boolean;
    public TranslationKey: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public ValidationCode: number;
    public CustomFields: any;
}


export class CustomField {
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


export class ValueList {
    public static RelativeUrl = 'valuelists';
    public static EntityType = 'ValueList';

    public Code: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public DescriptionKey: string;
    public ID: number;
    public NameKey: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Items: Array<ValueItem>;
    public CustomFields: any;
}


export class ValueItem {
    public static RelativeUrl = 'valueitems';
    public static EntityType = 'ValueItem';

    public Code: string;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public DescriptionKey: string;
    public ID: number;
    public Index: number;
    public NameKey: string;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Value: string;
    public ValueListID: number;
    public ValueList: ValueList;
    public CustomFields: any;
}


export class ComponentLayoutDto {
    public static RelativeUrl = '';
    public static EntityType = 'ComponentLayoutDto';

    public BaseEntity: string;
    public Name: string;
    public Url: string;
    public Fields: Array<FieldLayoutDto>;
    public CustomFields: any;
}


export class FieldLayoutDto {
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


export class ContactSearchServiceResponse {
    public ErrorCode: number;
    public ErrorMessage: string;
    public Method: string;
    public ObjectName: string;
    public Success: boolean;
}


export class CustomerBalanceReportData {
    public AccountNumber: number;
    public CustomerID: number;
    public Name: string;
    public SumCredit: number;
    public SumDebit: number;
    public SumTotal: number;
}


export class TradeHeaderCalculationSummary {
    public DecimalRounding: number;
    public SumDiscount: number;
    public SumNoVatBasis: number;
    public SumTotalExVat: number;
    public SumTotalIncVat: number;
    public SumVat: number;
    public SumVatBasis: number;
}


export class VatCalculationSummary {
    public SumVat: number;
    public SumVatBasis: number;
    public VatPercent: number;
}


export class InvoicePaymentData {
    public Amount: number;
    public PaymentDate: Date;
}


export class InvoiceSummary {
    public SumCreditedAmount: number;
    public SumRestAmount: number;
    public SumTotalAmount: number;
}


export class SupplierBalanceReportData {
    public AccountNumber: number;
    public Name: string;
    public SumCredit: number;
    public SumDebit: number;
    public SumTotal: number;
    public SupplierID: number;
}


export class SalaryTransactionPay {
    public CompanyAccount: string;
    public CompanyAddress: string;
    public CompanyCity: string;
    public CompanyName: string;
    public CompanyPostalCode: string;
    public PaymentDate: Date;
    public TaxAccount: string;
    public Withholding: number;
    public PayList: Array<SalaryTransactionPayLine>;
}


export class SalaryTransactionPayLine {
    public Account: string;
    public Address: string;
    public City: string;
    public EmployeeName: string;
    public EmployeeNumber: number;
    public HasTaxInformation: boolean;
    public NetPayment: number;
    public PostalCode: string;
}


export class PostingSummary {
    public SubEntity: SubEntity;
    public PayrollRun: PayrollRun;
    public PostList: Array<JournalEntryLine>;
}


export class VacationPayList {
    public VacationPay: Array<VacationPayLine>;
}


export class VacationPayLine {
    public IsInCollection: boolean;
    public ManualVacationPayBase: number;
    public PaidVacationPay: number;
    public Rate: number;
    public SystemVacationPayBase: number;
    public VacationPay: number;
    public Withdrawal: number;
    public Employee: Employee;
}


export class VacationPayInfo {
    public EmployeeID: number;
    public ManualVacationPayBase: number;
    public Withdrawal: number;
}


export class code {
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


export class Loennsinntekt {
    public antall: number;
    public antallSpecified: boolean;
}


export class YtelseFraOffentlige {
}


export class PensjonEllerTrygd {
}


export class Naeringsinntekt {
}


export class Fradrag {
}


export class Forskuddstrekk {
}


export class SalaryTransactionSums {
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


export class SalaryTransactionPeriodSums {
    public AgaRate: number;
    public AgaZone: string;
    public FromPeriod: number;
    public MunicipalName: string;
    public OrgNumber: string;
    public ToPeriod: number;
    public Year: number;
    public Sums: SalaryTransactionSums;
}


export class AltinnAuthChallenge {
    public Message: string;
    public Status: string;
    public ValidFrom: Date;
    public ValidTo: Date;
}


export class AltinnAuthRequest {
    public PreferredLogin: string;
    public UserID: string;
    public UserPassword: string;
}


export class JournalEntryLineRequestSummary {
    public SumBalance: number;
    public SumCredit: number;
    public SumDebit: number;
    public SumLedger: number;
    public SumTaxBasisAmount: number;
}


export class VatReportMessage {
    public Level: ValidationLevel;
    public Message: string;
}


export class VatReportSummary {
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


export class VatReportSummaryPerPost {
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


export class VatReportNotReportedJournalEntryData {
    public NumberOfJournalEntryLines: number;
    public SumTaxBasisAmount: number;
    public SumVatAmount: number;
    public TerminPeriodID: number;
}


export class AltinnGetVatReportDataFromAltinnResult {
    public Message: string;
    public Status: AltinnGetVatReportDataFromAltinnStatus;
}


export class BankData {
    public IBAN: string;
    public Bank: Bank;
}


export class JournalEntryData {
    public Amount: number;
    public CreditAccountID: number;
    public CreditAccountNumber: number;
    public CreditVatTypeID: number;
    public CustomerInvoiceID: number;
    public DebitAccountID: number;
    public DebitAccountNumber: number;
    public DebitVatTypeID: number;
    public Description: string;
    public FinancialDate: Date;
    public InvoiceNumber: string;
    public JournalEntryID: number;
    public JournalEntryNo: string;
    public SupplierInvoiceID: number;
    public SupplierInvoiceNo: string;
    public DebitAccount: Account;
    public DebitVatType: VatType;
    public CreditAccount: Account;
    public CreditVatType: VatType;
    public Dimensions: Dimensions;
}


export class ValidationResult {
    public Messages: Array<ValidationMessage>;
}


export class ValidationMessage {
    public EntityID: number;
    public EntityType: string;
    public ID: number;
    public Level: ValidationLevel;
    public Message: string;
    public PropertyName: string;
    public TranslationKey: string;
    public EntityValidationRule: EntityValidationRule;
    public ComplexValidationRule: ComplexValidationRule;
}


export class JournalEntryCalculationSummary {
    public Differance: number;
    public IncomingVat: number;
    public OutgoingVat: number;
    public SumCredit: number;
    public SumDebet: number;
}


export class JournalEntryPeriodData {
    public PeriodName: string;
    public PeriodNo: number;
    public PeriodSumYear1: number;
    public PeriodSumYear2: number;
}


export class AmeldingSumUp {
    public entities: Array<AmeldingEntity>;
    public agadetails: Array<AGADetails>;
    public totals: Totals;
}


export class AmeldingEntity {
    public sums: Sums;
    public employees: Array<Employees>;
    public transactionTypes: Array<TransactionTypes>;
}


export class Sums {
}


export class Employees {
}


export class TransactionTypes {
}


export class AGADetails {
    public baseAmount: number;
    public rate: number;
    public sectorName: string;
    public type: string;
    public zoneName: string;
}


export class Totals {
}


export enum WorkTypeEnum{
	IsHours = 1,
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
	MULTIVALUE = 14,
	URL = 15,
	TEXTAREA = 16,
}


export enum PlanTypeEnum{
	NS4102 = 1,
}


export enum CurrencySourceEnum{
	NORGESBANK = 1,
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


export enum PeriodSeriesType{
	m = 0,
	r = 1,
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


export enum WorkingHoursScheme{
	notSet = 0,
	NonShift = 1,
	OffshoreWork = 2,
	SemiContinousShiftAndRotaWork = 3,
	ContinuousShiftAndOtherSchemes = 4,
	ShiftWork = 5,
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
}


export enum StdSystemType{
	None = 0,
	PercentTaxDeduction = 1,
	HolidayPayBasisLastYear = 2,
	ResidualHolidayPay = 3,
	TableTaxDeduction = 4,
	Holidaypay = 5,
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


export enum TypeOfLogin{
	none = 0,
	AltinnPin = 1,
	SMSPin = 2,
	TaxPin = 3,
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


export enum StatusCodeAltinnSigning{
	NotSigned = 43001,
	PartialSigned = 43002,
	Signed = 43003,
	AlreadySigned = 43004,
	Failed = 43005,
}


export enum StatusCodeJournalEntryLine{
	Open = 31001,
	PartlyMarked = 31002,
	Marked = 31003,
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
