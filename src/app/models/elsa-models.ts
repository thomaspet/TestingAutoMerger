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
}

export interface ElsaCompanyLicense {
    ID: number;
    ContractID: number;
    CompanyName: string;
    CompanyKey: string;
    OrgNumber: string;
    StatusCode: ElsaCompanyLicenseStatus;
    EndDate: string;
}

export interface ElsaPurchase {
    ID: number;
    ProductID: number;
    GlobalIdentity?: string;
    Deleted?: boolean;
}

export interface ElsaContract {
    ID: number;
    CustomerID: number;
    ContractType: ElsaContractType;
    StatusCode: number;
    StartDate: Date;
    EndDate?: Date;
    SettledUntil?: Date;
    Note?: any;
    Limit: number;
}

export enum ElsaContractType {
    Demo = 0,
    Internal = 1,
    Partner = 3,
    Pilot = 4,
    Training = 5,
    Standard = 10,
    Bureau = 11,
    NonProfit = 12,
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
    Name: string;
    ParentProducts?: string[];
    Price: number;
    ProductKey: string;
    ProductStatus: ElsaProductStatusCode;
    ProductStatusName: string;
    ProductType: ElsaProductType;
    ProductTypeName: string;
    Tags: string[];
    SubProducts?: ElsaProduct[];
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
    Module = 0,
    Bundle = 1,
    Integration = 2,
    Extension = 3
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

