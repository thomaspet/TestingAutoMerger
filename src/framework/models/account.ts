import {
    IAccount,
    ILocalization,
    ICurrency,
    IAccountGroup,
    IVatType,
    ICustomer,
    ISupplier,
    IEmployee,
    IDimensions,
    INumberSeries,
    IAccountAlias
} from "../interfaces/interfaces";

declare var _;

export class AccountModel implements IAccount {
    AccountName: string = "";
    AccountNumber: number = null;
    LockManualPosts: boolean = false;
    Locked: boolean = false;
    SystemAccount: boolean = false;
    Visible: boolean = true;
    Active: boolean = true;
    AccountID: number = null;
    CurrencyID: number = null;
    AccountGroupID: number = null;
    AccountSetupID: number = null;
    VatTypeID: number = null;
    CustomerID: number = null;
    SupplierID: number = null;
    EmployeeID: number = null;
    DimensionsID: number = null;
    SubAccountNumberSeriesID: number = 1;
    UseDeductivePercent: boolean = false;
    UsePostPost: boolean = true;
    StatusID: number = null;
    ID: number = 0;
    Deleted: boolean = false;
    Currency: ICurrency = null;
    AccountGroup: IAccountGroup = null;
    VatType: IVatType = null;
    MainAccount: IAccount = null;
    Customer: ICustomer = null;
    Supplier: ISupplier = null;
    Employee: IEmployee = null;
    Dimensions: IDimensions = null;
    SubAccountNumberSeries: INumberSeries = null;
    Alias: Array<IAccountAlias> = null;
    CompatibleAccountGroups: Array<IAccountGroup> = null;
    SubAccounts: Array<IAccount> = null;
    CustomFields: any = null;
}