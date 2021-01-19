import {Injectable} from '@angular/core';
import {GuidService, NumberFormat, CustomDimensionService} from '../../../services/services';
import {TradeHeaderCalculationSummary} from '../../../models/sales/TradeHeaderCalculationSummary';
import {
    Product,
    CompanySettings,
    VatType,
    LocalDate,
    StatusCodeCustomerOrderItem
} from '../../../unientities';
import * as _ from 'lodash';
import {FeaturePermissionService} from '@app/featurePermissionService';
import {ITradeItem} from '@uni-framework/interfaces/interfaces';

export interface ISummaryLine {
    label: string;
    value: string | number;
    isTotalSum?: boolean;
}

@Injectable()
export class TradeItemHelper  {
    constructor(
        private guidService: GuidService,
        private numberFormat: NumberFormat,
        private customDimensionService: CustomDimensionService,
        private permissionService: FeaturePermissionService,
    ) {}

    public prepareItemsForSave(items) {
        return items
            .filter(item => !item['_isEmpty'])
            .map((item, index) => {
                item.SortIndex = index + 1;

                if (item.Dimensions && !item.Dimensions.ID) {
                    item.Dimensions['_createguid'] = this.guidService.guid();
                    item.Dimensions.Project = null;
                }

                // ID is enough
                item.VatType = null;
                item.Product = null;
                item.Account = null;

                // Copy paste from old function..
                if (!item.ProductID) {
                    item.AccountID = null;
                    item.Comment = null;
                    item.PriceExVat = 0;
                    item.PriceExVatCurrency = 0;
                    item.PriceIncVat = 0;
                    item.Discount = 0;
                    item.DiscountCurrency = 0;
                    item.NumberOfItems = 0;
                    item.SumTotalExVat = 0;
                    item.SumTotalExVatCurrency = 0;
                    item.SumTotalIncVat = 0;
                    item.SumTotalIncVatCurrency = 0;
                    item.SumVat = 0;
                    item.SumVatCurrency = 0;
                    item.Unit = null;
                    item.VatTypeID = null;
                    item.Dimensions = null;
                }

                if (!item.DiscountPercent) {
                    item.DiscountPercent = 0; // backend doesnt want this to be null
                }

                // Remove objects before save!
                if (item.Dimensions) {
                    item.Dimensions.Project = null;
                    item.Dimensions.Department = null;

                    for (let i = 5; i <= 10; i++) {
                        item.Dimensions[`Dimension${i}`] = null;
                    }
                }

                return item;
            });
    }

    public getDefaultTradeItemData(mainEntity): any {
        return {
            ID: 0,
            Product: null,
            ProductID: null,
            ItemText: '',
            Unit: '',
            Dimensions: mainEntity.DefaultDimensions || { ID: 0 },
            NumberOfItems: 0,
            PriceExVat: 0,
            Discount: 0,
            DiscountPercent: 0,
            AccountID: null,
            Account: null,
            SumVat: 0,
            // Recurring Invoice fields
            PricingSource: null,
            TimeFactor: null,
            ReduceIncompletePeriod: false
        };
    }

    public tradeItemChangeCallback(
        event, currencyCodeID: number, currencyExchangeRate: number,
        companySettings: CompanySettings, vatTypes: Array<VatType>, foreignVatType: VatType,
        pricingSourceLabels, priceFactor
    ) {
        const newRow = event.rowModel;
        newRow.SumVat = newRow.SumVat || 0;
        newRow.SumVatCurrency = newRow.SumVatCurrency || 0;

        // if not currencyExchangeRate has been defined from the parent component, assume no
        // currency is select - i.e. the currency amounts will be the same as the base currency
        // amounts - this is accomplished by setting the currencyExchangeRate to 1
        if (!currencyExchangeRate || currencyExchangeRate === 0) {
            currencyExchangeRate = 1;
        }

        if (!newRow.Dimensions) {
            newRow.Dimensions = {};
        }

        if (newRow.ID === 0) {
            newRow._createguid = this.guidService.guid();
            newRow.Dimensions._createguid = this.guidService.guid();
        }

        if (event.field === 'Product') {
            newRow.CostPrice = null;
            if (newRow['Product']) {
                newRow.NumberOfItems = 1;

                let overrideVatType: VatType;

                if (currencyCodeID !== companySettings.BaseCurrencyCodeID && foreignVatType) {
                    newRow.VatType = foreignVatType;
                    newRow.VatTypeID = foreignVatType.ID;
                    overrideVatType = foreignVatType;
                }

                this.mapProductToTradeItem(newRow, currencyExchangeRate, vatTypes, companySettings, overrideVatType, companySettings);

            } else {
                newRow['ProductID'] = null;
            }
        }

        if (event.field === 'VatType') {
            newRow.VatTypeID = !!newRow.VatType ? newRow.VatType.ID : null;
        }

        if (event.field === 'PricingSource') {
            newRow.PricingSource = pricingSourceLabels.findIndex(res => res === event.newValue);
        }

        if (event.field === 'TimeFactor') {
            newRow.TimeFactor = event.newValue.value;
        }

        if (newRow.VatTypeID && !newRow.VatType) {
            newRow.VatType = vatTypes.find(vt => vt.ID === newRow.VatTypeID);
        }

        if (newRow.VatType && newRow.VatType.VatPercent) {
            newRow.VatPercent = newRow.VatType.VatPercent;
        } else {
            const vattype = vatTypes.find(vt => vt.ID === newRow.VatTypeID);
            newRow.VatPercent = vattype ? vattype.VatPercent : 0;
        }
        if (event.field === 'Account') {
            this.mapAccountToQuoteItem(
                newRow,
                currencyCodeID !== companySettings.BaseCurrencyCodeID ? foreignVatType : null
            );
        }

        if (event.field === 'Dimensions.Project') {
            newRow.Dimensions.ProjectID = !!newRow.Dimensions.Project
                ? newRow.Dimensions.Project.ID
                : null;
        }

        if (event.field === 'Dimensions.ProjectTask') {
            newRow.Dimensions.ProjectTaskID = !!newRow.Dimensions.ProjectTask
                ? newRow.Dimensions.ProjectTask.ID
                : null;
        }

        if (event.field === 'Dimensions.Department') {
            newRow.Dimensions.DepartmentID = !!newRow.Dimensions.Department
                ? newRow.Dimensions.Department.ID
                : null;
        }

        if (event.field.indexOf('Dimensions.Dimension') !== -1) {
            const dimensionString = 'Dimension' + event.field.match(/\d+/)[0];

            newRow.Dimensions[dimensionString + 'ID'] = !!newRow.Dimensions[dimensionString]
                ? newRow.Dimensions[dimensionString].ID
                : null;
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
            this.calculatePriceIncVat(newRow, currencyExchangeRate);
        }

        if (event.field === 'PriceIncVatCurrency') {
            newRow.PriceSetByUser = true;
            if (newRow.PriceIncVatCurrency) {
                if (currencyExchangeRate) {
                    newRow.PriceIncVat = newRow.PriceIncVatCurrency * currencyExchangeRate;
                } else {
                    newRow.PriceIncVat = newRow.PriceIncVatCurrency;
                }
            } else {
                newRow.PriceIncVat = 0;
            }
            this.calculatePriceExVat(newRow, currencyExchangeRate);
        }

        if (event.field === 'VatType') {
            this.calculatePriceIncVat(newRow, currencyExchangeRate);
        }

        if (event.field === 'SumTotalIncVatCurrency') {
            const total = newRow.SumTotalIncVatCurrency;
            const theoricalTotal = newRow.NumberOfItems * newRow.PriceIncVatCurrency;
            const difference = theoricalTotal - total;
            const discount = difference / theoricalTotal;
            const normalizedDisccount = this.round(discount * 100, 4);
            newRow['DiscountPercent'] = normalizedDisccount || 0;
        }

        if (!newRow.PriceIncVatCurrency) {
            newRow.PriceIncVatCurrency = 0;
        }
        if (!newRow.PriceExVatCurrency) {
            newRow.PriceExVatCurrency = 0;
        }
        if (!newRow.NumberOfItems) {
            newRow.NumberOfItems = 0;
        }

        this.calculateBaseCurrencyAmounts(newRow, currencyExchangeRate);
        this.calculateDiscount(newRow, currencyExchangeRate);

        // Return the updated row to the table
        return newRow;
    }



    public mapAccountToQuoteItem(rowModel, overrideWithVatType: VatType) {
        const account = rowModel['Account'];

        if (!account) {
            rowModel.AccountID = null;
        } else {
            rowModel.AccountID = account.ID;
            if (!overrideWithVatType) {
                rowModel.VatTypeID = account.VatTypeID;
                rowModel.VatType = account.VatType;
            } else {
                rowModel.VatTypeID = overrideWithVatType.ID;
                rowModel.VatType = overrideWithVatType;
            }
        }
    }

    public mapProductToTradeItem(
        rowModel,
        currencyExchangeRate: number,
        vatTypes: Array<VatType>,
        settings: CompanySettings,
        overrideVatType: VatType,
        companySettings: CompanySettings
    ) {
        const product: Product = rowModel['Product'];

        rowModel.AccountID = product.AccountID;
        rowModel.Account = product.Account;
        rowModel.ProductID = product.ID;
        rowModel.ItemText = product.Name;
        rowModel.Unit = product.Unit;
        rowModel.PriceExVatCurrency = product.PriceExVat;
        rowModel.PriceIncVatCurrency = product.PriceIncVat;

        // Set recurring invoice item defaults when selecting item..
        rowModel.PricingSource = 0;
        rowModel.TimeFactor = 0;

        let productVatType = product.VatTypeID
            ? vatTypes.find(x => x.ID === product.VatTypeID)
            : vatTypes.find(x => x.ID === companySettings?.DefaultSalesAccount?.VatTypeID);

        product.Account = product.Account || companySettings.DefaultSalesAccount;

        if (overrideVatType) {
            productVatType = overrideVatType;
        }

        if (settings.TaxMandatoryType === 1) {
            // company does not use VAT/MVA
            rowModel.VatTypeID = null;
            rowModel.VatType = null;
            rowModel.Account = product.Account;
        } else if (settings.TaxMandatoryType === 2) {
            // company will use VAT when configured limit is passed - validations will be run
            // when saving the invoice to see
            if (productVatType) {

                const overrideVatCodes = ['3', '31', '32', '33'];
                if (overrideVatCodes.indexOf(productVatType.VatCode) !== -1) {
                    const vatType6 = vatTypes.find(x => x.VatCode === '6');
                    rowModel.VatType = vatType6;
                    rowModel.VatTypeID = vatType6.ID;
                    rowModel.Account = product.Account;
                } else {
                    rowModel.VatTypeID = productVatType.ID;
                    rowModel.VatType = productVatType;
                    rowModel.Account = product.Account;
                }
            }
        } else {
            rowModel.VatTypeID = productVatType ? productVatType.ID : product.VatTypeID;
            rowModel.VatType = productVatType || product.VatType;
            rowModel.Account = product.Account;
        }


        if (product.CalculateGrossPriceBasedOnNetPrice) {
            rowModel.PriceIncVat = product.PriceIncVat;
            rowModel.PriceIncVatCurrency = this.round(rowModel.PriceIncVat / currencyExchangeRate, 4);
            this.calculatePriceExVat(rowModel, currencyExchangeRate);
        } else {
            rowModel.PriceExVat = product.PriceExVat;
            rowModel.PriceExVatCurrency = this.round(product.PriceExVat / currencyExchangeRate, 4);
            this.calculatePriceIncVat(rowModel, currencyExchangeRate);
        }

        rowModel.PriceSetByUser = false;

        if (!rowModel.Dimensions) {
            rowModel.Dimensions = {};
        }

        this.mapProductDimensionsToItem(rowModel);
    }

    private mapProductDimensionsToItem(item) {
        if (!item.Product?.Dimensions) {
            return item;
        }

        const itemDims = item.Dimensions;
        const productDims = this.customDimensionService.mapDimensionInfoToDimensionObject(item.Product?.Dimensions);

        if (!itemDims.ProjectID && productDims.ProjectID) {
            itemDims.ProjectID = productDims.ProjectID;
            itemDims.Project = productDims.Project;
        }

        if (!itemDims.DepartmentID && productDims.DepartmentID) {
            itemDims.DepartmentID = productDims.DepartmentID;
            itemDims.Department = productDims.Department;
        }

        for (let i = 5; i < 10; i++) {
            const idKey = `Dimension${i}ID`;
            const valueKey = `Dimension${i}`;
            if (!itemDims[idKey] && productDims[idKey]) {
                itemDims[idKey] = productDims[idKey];
                itemDims[valueKey] = productDims[valueKey];
            }
        }

        item.Dimensions = itemDims;
        return item;
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

    public calculatePriceExVat(rowModel, currencyExchangeRate) {
        const vatPercent = rowModel.VatType?.VatPercent || 0;
        let priceIncVatCurrency = rowModel['PriceIncVatCurrency'] || 0;
        if (!priceIncVatCurrency) {
            priceIncVatCurrency = (rowModel.PriceIncVat * currencyExchangeRate) || 0;
        }
        const taxPercentage = (100 + vatPercent) / 100;
        const price = priceIncVatCurrency / taxPercentage;
        rowModel['PriceExVatCurrency'] = this.round(price, 4);
        rowModel['PriceExVat'] = rowModel['PriceExVatCurrency'] * currencyExchangeRate;
    }

    public calculatePriceIncVat(rowModel, currencyExchangeRate) {
        const vatPercent = rowModel.VatType?.VatPercent || 0;
        let priceExVatCurrency = rowModel['PriceExVatCurrency'] || 0;
        if (!priceExVatCurrency) {
            priceExVatCurrency = (rowModel.PriceExVat * currencyExchangeRate) || 0;
        }
        const taxPercentage = (100 + vatPercent) / 100;
        const price = priceExVatCurrency * taxPercentage;
        rowModel['PriceIncVatCurrency'] = this.round(price, 4);
        rowModel['PriceIncVat'] = rowModel['PriceIncVatCurrency'] * currencyExchangeRate;
    }

    public calculateDiscount(rowModel, currencyExchangeRate) {
        if (rowModel.StatusCode === StatusCodeCustomerOrderItem.TransferredToInvoice) {
            return;
            /*
            Quick-fix: SumTotalExVat m.fl. avrundes til 2 desimaler backend.
            Dersom man endrer Ordre (legger til Item) etter at Item er overført, får man feilmelding dersom beløpet har >2 desimaler med verdi
            ettersom dette tolkes som en endring, og backend tillater ikke endring på overførte orderitems (kun tekst og status)
            */
        }
        const discountExVat  = this.round(
            (rowModel['NumberOfItems'] * rowModel['PriceExVat'] * rowModel['DiscountPercent']) / 100, 4
        );
        const discountIncVat = this.round(
            (rowModel['NumberOfItems'] * rowModel['PriceIncVat'] * rowModel['DiscountPercent']) / 100, 4
        );

        rowModel.Discount = discountExVat || 0;
        rowModel.SumTotalExVat = (rowModel.NumberOfItems * rowModel.PriceExVat) - discountExVat;
        rowModel.SumTotalIncVat = (rowModel.NumberOfItems * rowModel.PriceIncVat) - discountIncVat;
        rowModel.SumVat = (rowModel.SumTotalIncVat - rowModel.SumTotalExVat) || 0;

        const discountExVatCurrency = discountExVat / currencyExchangeRate;
        const discountIncVatCurrency = discountIncVat / currencyExchangeRate;
        rowModel.DiscountCurrency = discountExVatCurrency || 0;
        rowModel.SumTotalExVatCurrency = ((
            rowModel.NumberOfItems
            * rowModel.PriceExVatCurrency)
            - discountExVatCurrency
        ) ;
        rowModel.SumTotalIncVatCurrency = (
            (rowModel.NumberOfItems * rowModel.PriceIncVatCurrency)
            - discountIncVatCurrency
        );
        rowModel.SumVatCurrency = (rowModel.SumTotalIncVatCurrency - rowModel.SumTotalExVatCurrency) || 0;
    }


    public getSummaryLines(items: any[], sums: TradeHeaderCalculationSummary, showVat: boolean = true): ISummaryLine[] {
        const summaryLines: ISummaryLine[] = [];

        // if (sums.SumTotalExVat) {
            summaryLines.push({
                label: 'Nettosum',
                value: sums.SumTotalExVat ? this.numberFormat.asMoney(sums.SumTotalExVatCurrency || 0) : 0
            });
        // }

        let vatPercentText;
        if (sums.SumVatCurrency) {
            let vatPercents = items.map(item => {
                return item.VatPercent ? item.VatPercent + '%' : '';
            });

            vatPercents = _.uniq(vatPercents.filter(vatPercent => !!vatPercent));
            vatPercentText = `(${vatPercents.join(', ')})`;

            // summaryLines.push({
            //     label: `Mva (${vatPercents.join(', ')})`,
            //     value: this.numberFormat.asMoney(sums.SumVatCurrency)
            // });
        }

        if (showVat || sums.SumVatCurrency > 0) {
            summaryLines.push({
                label: 'Mva ' + (vatPercentText || ''),
                value: sums.SumVatCurrency ? this.numberFormat.asMoney(sums.SumVatCurrency) : 0
            });
        }

        if (sums.DecimalRoundingCurrency &&
            ((this.round(sums.DecimalRoundingCurrency, 2) > 0.00) || (this.round(sums.DecimalRoundingCurrency, 2) < 0.00))) {
            summaryLines.push({
                label: 'Øreavrunding',
                value: this.numberFormat.asMoney(sums.DecimalRoundingCurrency)
            });
        }

        // if (sums.SumTotalIncVatCurrency) {
            summaryLines.push({
                label: 'Totalsum',
                value: sums.SumTotalIncVatCurrency ? this.numberFormat.asMoney(sums.SumTotalIncVatCurrency) : 0,
                isTotalSum: true
            });
        // }

        return summaryLines;
    }

    public calculateTradeItemSummaryLocal(items: Array<any>, decimals: number): TradeHeaderCalculationSummary {
        const sum: TradeHeaderCalculationSummary = new TradeHeaderCalculationSummary();
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

        sum.DekningsGrad = 0;

        if (items) {
            let totalCostPrice = 0;

            items.forEach((item) => {
                totalCostPrice += ((item.CostPrice || item.Product && item.Product.CostPrice) || 0) * item.NumberOfItems;

                sum.SumDiscount += item.Discount || 0;
                sum.SumTotalExVat += item.SumTotalExVat || 0;
                sum.SumTotalIncVat += item.SumTotalIncVat || 0;
                sum.SumVat += item.SumVat || 0;
                sum.SumVatBasis += item.SumVat !== 0 ? (item.SumTotalExVat || 0) : 0;
                sum.SumNoVatBasis += item.SumVat === 0 ? (item.SumTotalExVat || 0) : 0;

                sum.SumDiscountCurrency += item.DiscountCurrency || 0;
                sum.SumTotalExVatCurrency += item.SumTotalExVatCurrency || 0;
                sum.SumTotalIncVatCurrency += item.SumTotalIncVatCurrency || 0;
                sum.SumVatCurrency += item.SumVatCurrency || 0;
                sum.SumVatBasisCurrency += item.SumVatCurrency !== 0 ? (item.SumTotalExVatCurrency || 0) : 0;
                sum.SumNoVatBasisCurrency += item.SumVatCurrency === 0 ? (item.SumTotalExVatCurrency || 0) : 0;
            });
            
            let sign = sum.SumTotalIncVat < 0 ? -1 : 1;
            let roundedAmount = this.round(Math.abs(sum.SumTotalIncVat), decimals) * sign;
            sum.DecimalRounding = roundedAmount - sum.SumTotalIncVat;

            sign = sum.SumTotalIncVatCurrency < 0 ? -1 : 1;
            roundedAmount = this.round(Math.abs(sum.SumTotalIncVatCurrency), decimals) * sign;
            sum.DecimalRoundingCurrency = roundedAmount - sum.SumTotalIncVatCurrency;
            sum.SumTotalIncVatCurrency = roundedAmount;

            if (this.permissionService.canShowUiFeature('ui.sales.contribution-margin')) {
                sum.DekningsGrad = ((sum.SumTotalExVat - totalCostPrice) * 100) / sum.SumTotalExVat;
            }
        }

        return sum;
    }

    public round(value, decimals) {
        return Number(Math.round(Number.parseFloat(value + 'e' + decimals)) + 'e-' + decimals);
    }

    public getCompanySettingsNumberOfDecimals(companySettings: CompanySettings, currencyCodeID: number): number {
        if (currencyCodeID && currencyCodeID !== 1) {
            return 2;
        }
        return companySettings && companySettings.RoundingNumberOfDecimals;
    }

}
