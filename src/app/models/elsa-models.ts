export interface ElsaAgreement {
    ID: number;
    AgreementText: string;
    AgreementStatus: ElsaAgreementStatus;
    ProductID: number;
    Name: string;
}

export enum ElsaAgreementStatus {
    Draft = 0,
    Active = 5,
    Replaced = 10
}

export interface ElsaCustomer {
    ID: number;
    Name: string;
    OrgNumber: string;
    CompanyKey: string;
    ContactPerson: string;
    ContactEmail: string;
    ContactPhone: string;
    Managers?: any[];
    Contracts?: ElsaContract[];
    CompanyTypeID?: number;
    PersonalNumber?: string;
    IsBankCustomer: boolean;
    SignUpReferrer: string;
    ProspectID?: number;
}

export interface ElsaCompanyLicense {
    ID: number;
    ContractID: number;
    CompanyName: string;
    CompanyKey: string;
    OrgNumber: string;
    StatusCode: ElsaCompanyLicenseStatus;
    EndDate: string;
    IsDeleted: boolean;
    UpdatedAt: Date;
    UpdatedBy: string;
    UpdatedByEmail: string;
    TwoFactorEnabled?: boolean;
    ExternalCustomerID: string;
}

export interface ElsaPurchase {
    ID: number;
    ProductID: number;
    GlobalIdentity?: string;
    Deleted?: boolean;
    PurchaseStatus?: ElsaPurchaseStatus;
}

export enum ElsaPurchaseStatus {
    Accepted = 1,
    Rejected = 5,
    Pending = 10,
}

export interface ElsaContract {
    ID: number;
    CustomerID: number;
    Customer: ElsaCustomer;
    ContractType: ContractType;
    ContractTypes: ElsaContractType;
    StatusCode: number;
    StartDate: Date;
    EndDate?: Date;
    SettledUntil?: Date;
    Note?: any;
    Limit: number;
    AgreementAcceptances: any[];
    TwoFactorEnabled?: boolean;
}

export interface ElsaContractType {
    ContractType: number;
    IsActive: boolean;
    IsDefault: boolean;
    IsPublic: boolean;
    ForceSameBank: boolean;
    Label: string;
    MaxCompanies: number;
    MaxUsers: number;
    Name: string;
    ProductContractTypes?: ElsaProductContractType[];
    ContractTypeFeatures?: ElsaContractTypeFeature[];
    BulletPoints?: { Text: string; }[];
}

export interface ElsaProductContractType {
    ContractType: number;
    ID: number;
    IsDefaultProduct: boolean;
    IsMandatoryProduct: boolean;
    ProductID: 11;
    Product?: ElsaProduct;
}

export interface ElsaContractTypeFeature {
    FeatureID: number;
    Feature: ElsaFeature;
    ContractType: number;
    ContractTypes: ElsaContractType;
}

export interface ElsaCategory {
    ID: number;
    Name: string;
    Features?: ElsaFeature[];
}

export interface ElsaFeature {
    ID: number;
    Text: string;
    CategoryID: number;
    ContainsContractTypes: number[];
    Tooltip?: string;
    Checkmarks: boolean[];
}

export enum ContractType {
    Demo = 0,
    Internal = 1,
    Partner = 3,
    Pilot = 4,
    Training = 5,
    Standard = 10,
    Bureau = 11,
    NonProfit = 12,
    Mini = 21,
    Plus = 22,
    Complete = 23,
}

export interface ElsaProduct {
    ID: number;
    ButtonLabel: string;
    ButtonLink: string;
    CategoryName?: string;
    Description: string;
    HtmlContent?: string;
    MarkdownContent?: string;
    VideoUrl?: string;
    IconBackgroundColor?: string;
    IconReference?: string;
    ImageReference?: string;
    ClientID: string;
    IsBundle: boolean;
    IsBillable: boolean;
    IsMonthly: boolean;
    IsPerTransaction: boolean;
    IsPerUser: boolean;
    Label: string;
    ListOfRoles: string;
    DefaultRoles?: string;
    Name: string;
    ParentProducts?: string[];
    Price: number;
    ProductAgreement: ElsaAgreement;
    ProductKey: string;
    ProductStatus: ElsaProductStatusCode;
    ProductStatusName: string;
    ProductType: ElsaProductType;
    ProductTypeName: string;
    Tags: string[];
    SubProducts?: ElsaProduct[];
    IsMandatoryProduct?: boolean;
    IsDefaultProduct?: boolean;
}

export enum ElsaCompanyLicenseStatus {
    Draft = 0,
    Active = 5,
    Paused = 10,
    Canceled = 11
}

export enum ElsaProductStatusCode {
    Live = 0,
    SoonToBeLaunched = 1,
    DevelopmentCandidate = 2
}

export enum ElsaProductType {
    All = -1,
    Module = 0,
    Bundle = 1,
    Integration = 2,
    Extension = 3,
    BankProduct = 4,
    Package = 6
}

export enum ElsaUserLicenseType {
    Standard = 0,
    Accountant = 1,
    Revision = 2,
    Training = 3,
    Support = 10
}

export interface ElsaUserLicense {
    ID: number;
    CompanyLicenseID: number;
    UserLicenseType: number;
    StatusCode: number;
    UserIdentity: string;
    UserLicenseKey: string;
    UserName: string;
    Email: string;
}

export enum ElsaCustomerAccessRole {
    Read = 0,
    Manage = 1,
    Owner = 2
}

export interface BillingDataItem {
    ProductID: number;
    ProductName: string;
    Days: number;
    Amount: number;
    Unit: string;
    Price: number;
    DiscountPrc: number;
    Sum: number;
    Details: {Name: string; Counter: number, Tags?: string[]}[];
}

export interface BillingData {
    CustomerName: string;
    CustomerID: number;
    ContractID: number;
    ContractType: number;
    FromDate: string;
    ToDate: string;
    Total: number;
    TotalDiscount: number;
    OrderDays: number;
    Items: BillingDataItem[];
    RelatedOrders: BillingData[];
    SettledUntil?: Date;
}

export interface ElsaSupportUserDTO {
    ID: number;
    DisplayName: string;
    Email: string;
    SupportType: number;
    GlobalIdentity: string;
    StatusCode: number;
}
