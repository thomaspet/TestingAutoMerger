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
} from '../interfaces/interfaces';

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
	CurrencyID: number = 0;
	AccountGroupID: number = 0;
	AccountSetupID: number = 0;
	VatTypeID: number = 0;
	CustomerID: number = 0;
	SupplierID: number = 0;
	EmployeeID: number = 0;
	DimensionsID: number = 0;
	SubAccountNumberSeriesID: number = 1;
	UseDeductivePercent: boolean = false;
	UsePostPost: boolean = true;
	StatusID: number = 0;
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