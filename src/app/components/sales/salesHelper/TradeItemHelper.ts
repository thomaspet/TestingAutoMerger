import {Injectable} from '@angular/core';
import {GuidService} from '../../../services/services';
import {Project, Department} from '../../../unientities';
import {TradeHeaderCalculationSummary} from '../../../models/sales/TradeHeaderCalculationSummary';

@Injectable()
export class TradeItemHelper  {

    constructor(private guidService: GuidService) {

    }

    public static IsItemsValid(items: any) {
        let numberFailed: number = 0;

        for (let i = 0; i < items.length; i++) {
            let line: any = items[i];

            if (line.ProductID === null) {
                numberFailed++;
            }
        }
        if (numberFailed > 0) {
            let line: string = (numberFailed > 1) ? 'linjer' : 'linje'
            alert('Det er ' + numberFailed + ' ' + line + ' du ikke har valgt produkt på. Velg produkt og forsøk å lagre på nytt');
            return false;
        }
        return true;
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
        };
    }

    public tradeItemChangeCallback(event) {
        var newRow = event.rowModel;

        if (newRow.ID === 0) {
            newRow._createguid = this.guidService.guid();
            newRow.Dimensions._createguid = this.guidService.guid();

            // Default antall for ny rad
            if (newRow.NumberOfItems === null) {
                newRow.NumberOfItems = 1;
            }
        }

        if (event.field === 'Product') {
            this.mapProductToQuoteItem(newRow);
        }

        if (event.field === 'VatType') {
            this.mapVatTypeToQuoteItem(newRow);
        }

        if (event.field === 'Dimensions.Project') {
            this.mapProjectToItem(newRow);
        }

        if (event.field === 'Dimensions.Department') {
            this.mapDepartmentToItem(newRow);
        }

        this.calculatePriceIncVat(newRow);
        this.calculateDiscount(newRow);

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

    public mapProductToQuoteItem(rowModel) {
        let product = rowModel['Product'];
        if (!product) {
            return;
        }

        rowModel.ProductID = product.ID;
        rowModel.ItemText = product.Name;
        rowModel.Unit = product.Unit;
        rowModel.VatTypeID = product.VatTypeID;
        rowModel.VatType = product.VatType;
        rowModel.PriceExVat = product.PriceExVat;
        rowModel.PriceIncVat = product.PriceIncVat;

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

    public calculatePriceIncVat(rowModel) {
        let vatType = rowModel['VatType'] || {VatPercent: 0};
        let priceExVat = rowModel['PriceExVat'] || 0;
        rowModel['PriceIncVat'] = (priceExVat * (100 + vatType.VatPercent)) / 100;
    }

    public calculateDiscount(rowModel) {
        const discountExVat  = (rowModel['NumberOfItems'] * rowModel['PriceExVat'] * rowModel['DiscountPercent']) / 100;
        const discountIncVat = (rowModel['NumberOfItems'] * rowModel['PriceIncVat'] * rowModel['DiscountPercent']) / 100;

        rowModel.Discount = discountExVat || 0;
        rowModel.SumTotalExVat = (rowModel.NumberOfItems * rowModel.PriceExVat) - discountExVat;
        rowModel.SumTotalIncVat = (rowModel.NumberOfItems * rowModel.PriceIncVat) - discountIncVat;
        rowModel.SumVat = rowModel.SumTotalIncVat - rowModel.SumTotalExVat;
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

        items.forEach((x) => {
                x.PriceIncVat = x.PriceIncVat ? x.PriceIncVat : 0;
                x.PriceExVat = x.PriceExVat ? x.PriceExVat : 0;
                x.CalculateGrossPriceBasedOnNetPrice = x.CalculateGrossPriceBasedOnNetPrice ? x.CalculateGrossPriceBasedOnNetPrice : false;
                x.Discount = x.Discount ? x.Discount : 0;
                x.DiscountPercent = x.DiscountPercent ? x.DiscountPercent : 0;
                x.NumberOfItems = x.NumberOfItems ? x.NumberOfItems : 0;
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
            });

            let roundedAmount = Math.round(sum.SumTotalIncVat);
            sum.DecimalRounding = sum.SumTotalIncVat - roundedAmount;
            sum.SumTotalIncVat = roundedAmount;
        }

        return sum;
    }
}
