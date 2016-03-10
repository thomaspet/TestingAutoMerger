import {
    Account,
    Localization,
    Currency,
    AccountGroup,
    VatType,
    Customer,
    Supplier,
    Employee,
    Dimensions,
    NumberSeries,
    AccountAlias
} from "../unientities";

declare var _;

export class AccountModel implements Account {
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
    Currency: Currency = null;
    AccountGroup: AccountGroup = null;
    VatType: VatType = null;
    MainAccount: Account = null;
    Customer: Customer = null;
    Supplier: Supplier = null;
    Employee: Employee = null;
    Dimensions: Dimensions = null;
    SubAccountNumberSeries: NumberSeries = null;
    Alias: Array<AccountAlias> = null;
    CompatibleAccountGroups: Array<AccountGroup> = null;
    SubAccounts: Array<Account> = null;
    CustomFields: any = null;
}