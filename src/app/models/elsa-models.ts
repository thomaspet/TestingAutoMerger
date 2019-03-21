export interface ElsaCustomer {
    id: number;
    name: string;
    orgNumber: string;
    contactPerson: string;
    contactEmail: string;
    contactPhone: string;
    contracts: ElsaContract[];
    managers?: any;
    companyKey: string;
}

export interface ElsaCompanyLicense {
    ID: number;
    ContractID: number;
    CompanyName: string;
    CompanyKey: string;
    OrgNumber: string;
    StatusCode: ElsaCompanyLicenseStatus;
}

export interface ElsaPurchase {
    ID: number;
    ProductID: number;
    GlobalIdentity?: string;
    Deleted?: boolean;
}

export interface ElsaContract {
    id: number;
    customer?: ElsaCustomer;
    customerID: number;
    contractType: ElsaContractType;
    statusCode: number;
    startDate: Date;
    endDate?: Date;
    settledUntil?: Date;
    note?: any;
    limit: number;
    key: string;
    purchases: any[];
    companyLicenses?: ElsaPurchaseForLicense[];
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

export interface ElsaPurchasesForUserLicenseByCompany {
    productName: string;
    productID: number;
    username: string;
    userIdentity: string;
    userLicenseID: number;
    purchaseForCompanyID: number;
    contractID: number;
    isAssigned: boolean;
}

export interface ElsaProduct {
    bundles: ElsaBundle[];
    buttonLabel: string;
    buttonLink: string;
    categoryName?: string;
    description: string;
    htmlContent?: string;
    iconBackgroundColor?: string;
    iconReference?: string;
    id: number;
    imageReference?: string;
    isBundle: boolean;
    isMonthly: boolean;
    isPerTransaction: boolean;
    isPerUser: boolean;
    label: string;
    listOfRoles: string;
    name: string;
    parentProducts?: string[];
    price: number;
    productKey: string;
    productStatus: ElsaProductStatusCode;
    productStatusName: string;
    productType: ElsaProductType;
    productTypeName: string;
    tags: string[];
    subProducts?: ElsaProduct[];
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

export interface ElsaPurchaseForLicense {
    id: number;
    contractID: number;
    startDate: Date;
    endDate?: Date;
    licenseKey: string;
    companyName: string;
    companyKey: string;
    statusCode: number;
    orgNumber?: string;
    customerID: number;
    customerName: string;
    contractType: number;
}

export interface ElsaUserLicense {
    id: number;
    companyLicense?: any;
    companyLicenseID: number;
    startDate: Date;
    endDate?: Date;
    userLicenseKey: string;
    userName: string;
    userIdentity: string;
    statusCode: number;
    userLicenseType: number;
    purchases?: any[];
    agreementAcceptances?: any;
}

export interface ElsaBundle {
    id: number;
    name: string;
    created: Date;
    end: Date;
    bundlePrice: number;
    products: ElsaProduct[];
}

export enum ElsaCustomerAccessRole {
    Read = 0,
    Manage = 1,
    Owner = 2
}

