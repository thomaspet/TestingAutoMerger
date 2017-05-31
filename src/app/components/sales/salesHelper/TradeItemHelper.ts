import {Injectable} from '@angular/core';
import {GuidService} from '../../../services/services';
import {Project, Department, CustomerQuoteItem, CustomerOrderItem, CustomerInvoiceItem, CompanySettings, VatType} from '../../../unientities';
import {TradeHeaderCalculationSummary} from '../../../models/sales/TradeHeaderCalculationSummary';

@Injectable()
export class TradeItemHelper  {

    constructor(private guidService: GuidService) {

    }

    public static IsItemsValid(items: Array<CustomerQuoteItem | CustomerOrderItem | CustomerInvoiceItem>) {
        let invalidItems = items.filter(x => !x.ProductID);

        return invalidItems.length === 0;
    }

    public getDefaultTradeItemData(mainEntity) {
        return {
            ID: 0,
            Product: null,
            ProductID: null,
            ItemText: '',
            Unit: '',
            Dimensions: {
                ID: 0,
                Project: mainEntity.Customer && mainEntity.Customer.Dimensions ? mainEntity.Customer.Dimensions.Project : null,
                ProjectID: mainEntity.Customer && mainEntity.Customer.Dimensions ? mainEntity.Customer.Dimensions.ProjectID : null,
                Department: mainEntity.Customer && mainEntity.Customer.Dimensions ? mainEntity.Customer.Dimensions.Department : null,
                DepartmentID: mainEntity.Customer && mainEntity.Customer.Dimensions ? mainEntity.Customer.Dimensions.DepartmentID : null
            },
            NumberOfItems: null,
            PriceExVat: null,
            Discount: null,
            DiscountPercent: null,
            AccountID: null,
            Account: null
        };
    }

    public tradeItemChangeCallback(event, currencyCodeID: number, currencyExchangeRate: number, companySettings: CompanySettings, foreignVatType: VatType) {
        var newRow = event.rowModel;

        // if not currencyExchangeRate has been defined from the parent component, assume no
        // currency is select - i.e. the currency amounts will be the same as the base currency
        // amounts - this is accomplished by setting the currencyExchangeRate to 1
        if (!currencyExchangeRate || currencyExchangeRate === 0) {
            currencyExchangeRate = 1;
        }

        if (newRow.ID === 0) {
            newRow._createguid = this.guidService.guid();
            newRow.Dimensions._createguid = this.guidService.guid();

            // Default antall for ny rad
            if (newRow.NumberOfItems === null) {
                newRow.NumberOfItems = 1;
            }
        }

        if (event.field === 'Product') {
            if (newRow['Product']) {
                this.mapProductToQuoteItem(newRow, currencyExchangeRate);
                if(currencyCodeID !== companySettings.BaseCurrencyCodeID && foreignVatType) {
                    newRow.VatType = foreignVatType;
                    newRow.VatTypeID = foreignVatType.ID;
                }
            } else {
                newRow['ProductID'] = null;
            }
        }

        if (event.field === 'VatType') {
            this.mapVatTypeToQuoteItem(newRow);
        }

        if (event.field === 'Account') {
            this.mapAccountToQuoteItem(newRow, currencyCodeID !== companySettings.BaseCurrencyCodeID? foreignVatType: null);
        }

        if (event.field === 'Dimensions.Project') {
            this.mapProjectToItem(newRow);
        }

        if (event.field === 'Dimensions.Department') {
            this.mapDepartmentToItem(newRow);
        }

        if (event.field === 'PriceExVatCurrency') {
            newRow.PriceSetByUser = true;
            if (newRow.PriceExVatCurrency) {
                if (currencyExchangeRate) {
                    newRow.PriceExVat = newRow.PriceExVatCurrency * currencyExchangeRate;
                } else {
                    newRow.PriceExVat = newRow.PriceExVatCurrency;
                }
            } else {
                newRow.PriceExVat = 0;
            }
        }

        this.calculatePriceIncVat(newRow);
        this.calculateBaseCurrencyAmounts(newRow, currencyExchangeRate);
        this.calculateDiscount(newRow, currencyExchangeRate);

        // Return the updated row to the table
        return newRow;
    }

    public mapProjectToItem(rowModel) {
        let project: Project = rowModel['Dimensions.Project'];

        if (!project) {
            if (!rowModel.Dimensions) {
                rowModel.Dimensions = {ID: 0};
            }

            rowModel.Dimensions.ProjectID = null;
            rowModel.Dimensions.Project = null;
        } else {
            if (!rowModel.Dimensions) {
                rowModel.Dimensions = {ID: 0};
            }

            rowModel.Dimensions.ProjectID = project.ID;
            rowModel.Dimensions.Project = project;
        }
    }

    public mapDepartmentToItem(rowModel) {
        let dep: Department = rowModel['Dimensions.Department'];

        if (!dep) {
            if (!rowModel.Dimensions) {
                rowModel.Dimensions = {ID: 0};
            }

            rowModel.Dimensions.DepartmentID = null;
            rowModel.Dimensions.Department = null;
        } else {
            if (!rowModel.Dimensions) {
                rowModel.Dimensions = {ID: 0};
            }

            rowModel.Dimensions.DepartmentID = dep.ID;
            rowModel.Dimensions.Department = dep;
        }
    }

    public mapVatTypeToQuoteItem(rowModel) {
        let vatType = rowModel['VatType'];

        if (!vatType) {
            rowModel.VatTypeID = null;
        } else {
            rowModel.VatTypeID = vatType.ID;
        }
    }

    public mapAccountToQuoteItem(rowModel, overrideWithVatType:VatType) {
        let account = rowModel['Account'];

        if (!account) {
            rowModel.AccountID = null;
        } else {
            rowModel.AccountID = account.ID;
            if(!overrideWithVatType) {
                rowModel.VatTypeID = account.VatTypeID;
                rowModel.VatType = account.VatType;
            } else {
                rowModel.VatTypeID = overrideWithVatType.ID;
                rowModel.VatType = overrideWithVatType;
            }
        }
    }

    public mapProductToQuoteItem(rowModel, currencyExchangeRate: number) {
        let product = rowModel['Product'];

        rowModel.AccountID = product.AccountID;
        rowModel.Account = product.Account;
        rowModel.ProductID = product.ID;
        rowModel.ItemText = product.Name;
        rowModel.Unit = product.Unit;
        rowModel.VatTypeID = product.VatTypeID;
        rowModel.VatType = product.VatType;
        rowModel.PriceExVat = product.PriceExVat;
        rowModel.PriceIncVat = product.PriceIncVat;

        if (currencyExchangeRate) {
            rowModel.PriceExVatCurrency = this.round(product.PriceExVat / currencyExchangeRate, 4);
            rowModel.PriceIncVatCurrency = this.round(product.PriceIncVat / currencyExchangeRate, 4);
        } else {
            rowModel.PriceExVatCurrency = product.PriceExVat;
            rowModel.PriceIncVatCurrency = product.PriceIncVat;
        }

        rowModel.PriceSetByUser = false;

        if (!rowModel.VatTypeID && product.Account) {
            rowModel.VatTypeID = product.Account.VatTypeID;
        }

        if (!rowModel.Dimensions.ProjectID) {
            if (product.Dimensions && product.Dimensions.ProjectID) {
                rowModel.Dimensions.ProjectID = product.Dimensions.ProjectID;
                rowModel.Dimensions.Project = product.Dimensions.Project;
            }
        }

        if (!rowModel.Dimensions.DepartmentID) {
            if (product.Dimensions && product.Dimensions.DepartmentID) {
                rowModel.Dimensions.DepartmentID = product.Dimensions.DepartmentID;
                rowModel.Dimensions.Department = product.Dimensions.Department;
            }
        }
    }

    public calculateBaseCurrencyAmounts(rowModel, currencyExchangeRate: number) {
        if (currencyExchangeRate && currencyExchangeRate !== 0) {
            rowModel.PriceExVat = rowModel.PriceExVatCurrency * currencyExchangeRate;
            rowModel.PriceIncVat = rowModel.PriceIncVatCurrency * currencyExchangeRate;
        } else {
            rowModel.PriceExVat = rowModel.PriceExVatCurrency;
            rowModel.PriceIncVat = rowModel.PriceIncVatCurrency;
        }
    }

    public calculatePriceIncVat(rowModel) {
        let vatType = rowModel['VatType'] || {VatPercent: 0};
        let priceExVatCurrency = rowModel['PriceExVatCurrency'] || 0;
        rowModel['PriceIncVatCurrency'] = this.round((priceExVatCurrency * (100 + vatType.VatPercent)) / 100, 4);
    }

    public calculateDiscount(rowModel, currencyExchangeRate) {
        const discountExVat  = this.round((rowModel['NumberOfItems'] * rowModel['PriceExVat'] * rowModel['DiscountPercent']) / 100, 4);
        const discountIncVat = this.round((rowModel['NumberOfItems'] * rowModel['PriceIncVat'] * rowModel['DiscountPercent']) / 100, 4);

        rowModel.Discount = discountExVat || 0;
        rowModel.SumTotalExVat = (rowModel.NumberOfItems * rowModel.PriceExVat) - discountExVat;
        rowModel.SumTotalIncVat = (rowModel.NumberOfItems * rowModel.PriceIncVat) - discountIncVat;
        rowModel.SumVat = rowModel.SumTotalIncVat - rowModel.SumTotalExVat;

        let discountExVatCurrency = discountExVat / currencyExchangeRate;
        let discountIncVatCurrency = discountIncVat / currencyExchangeRate;
        rowModel.DiscountCurrency = discountExVatCurrency || 0;
        rowModel.SumTotalExVatCurrency = ((rowModel.NumberOfItems * rowModel.PriceExVatCurrency) - discountExVatCurrency) ;
        rowModel.SumTotalIncVatCurrency = ((rowModel.NumberOfItems * rowModel.PriceIncVatCurrency) - discountIncVatCurrency);
        rowModel.SumVatCurrency = rowModel.SumTotalIncVatCurrency - rowModel.SumTotalExVatCurrency;
    }

    public calculateTradeItemSummaryLocal(items: Array<any>): TradeHeaderCalculationSummary {
        let sum: TradeHeaderCalculationSummary = new TradeHeaderCalculationSummary();
        sum.SumTotalExVat = 0;
        sum.SumTotalIncVat = 0;
        sum.SumVat = 0;
        sum.SumVatBasis = 0;
        sum.SumNoVatBasis = 0;
        sum.SumDiscount = 0;
        sum.DecimalRounding = 0;

        sum.SumTotalExVatCurrency = 0;
        sum.SumTotalIncVatCurrency = 0;
        sum.SumVatCurrency = 0;
        sum.SumVatBasisCurrency = 0;
        sum.SumNoVatBasisCurrency = 0;
        sum.SumDiscountCurrency = 0;
        sum.DecimalRoundingCurrency = 0;

        items.forEach((x) => {
                x.DiscountPercent = x.DiscountPercent ? x.DiscountPercent : 0;
                x.NumberOfItems = x.NumberOfItems ? x.NumberOfItems : 0;
                x.CalculateGrossPriceBasedOnNetPrice =
                    x.CalculateGrossPriceBasedOnNetPrice ? x.CalculateGrossPriceBasedOnNetPrice : false;

                x.PriceIncVatCurrency = x.PriceIncVatCurrency ? x.PriceIncVatCurrency : 0;
                x.PriceExVatCurrency = x.PriceExVatCurrency ? x.PriceExVatCurrency : 0;
                x.DiscountCurrency = x.DiscountCurrency ? x.DiscountCurrency : 0;
                x.SumTotalExVatCurrency = x.SumTotalExVatCurrency ? x.SumTotalExVatCurrency : 0;
                x.SumTotalIncVatCurrency = x.SumTotalIncVatCurrency ? x.SumTotalIncVatCurrency : 0;

                x.PriceIncVat = x.PriceIncVat ? x.PriceIncVat : 0;
                x.PriceExVat = x.PriceExVat ? x.PriceExVat : 0;
                x.Discount = x.Discount ? x.Discount : 0;
                x.SumTotalExVat = x.SumTotalExVat ? x.SumTotalExVat : 0;
                x.SumTotalIncVat = x.SumTotalIncVat ? x.SumTotalIncVat : 0;
            });

        if (items) {
            items.forEach((item) => {
                sum.SumDiscount += item.Discount;
                sum.SumTotalExVat += item.SumTotalExVat;
                sum.SumTotalIncVat += item.SumTotalIncVat;
                sum.SumVat += item.SumVat;
                sum.SumVatBasis += item.SumVat !== 0 ? item.SumTotalExVat : 0;
                sum.SumNoVatBasis += item.SumVat === 0 ? item.SumTotalExVat : 0;

                sum.SumDiscountCurrency += item.DiscountCurrency;
                sum.SumTotalExVatCurrency += item.SumTotalExVatCurrency;
                sum.SumTotalIncVatCurrency += item.SumTotalIncVatCurrency;
                sum.SumVatCurrency += item.SumVatCurrency;
                sum.SumVatBasisCurrency += item.SumVatCurrency !== 0 ? item.SumTotalExVatCurrency : 0;
                sum.SumNoVatBasisCurrency += item.SumVatCurrency === 0 ? item.SumTotalExVatCurrency : 0;
            });

            let roundedAmount = Math.round(sum.SumTotalIncVat);
            sum.DecimalRounding = sum.SumTotalIncVat - roundedAmount;

            roundedAmount = Math.round(sum.SumTotalIncVatCurrency);
            sum.DecimalRoundingCurrency = sum.SumTotalIncVatCurrency - roundedAmount;
            sum.SumTotalIncVatCurrency = roundedAmount;
        }

        return sum;
    }

    public round(value, decimals) {
        return Number(Math.round(Number.parseFloat(value + 'e' + decimals)) + 'e-' + decimals);
    }
}
