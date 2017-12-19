import { LocalDate } from '@uni-entities';
import { roundTo } from '@app/components/common/utils/utils';

export class WorkOrder {
    public ID: number;
    public CustomerID: number;
    public OrderDate: LocalDate;
    public CustomerName: string;
    public Items: Array<WorkOrderItem> = [];
    public TaxExclusiveAmount: number;
    public OurReference: string;
    public InvoiceAddressLine1: string;
    public InvoiceAddressLine2: string;
    public InvoiceAddressLine3: string;
    public InvoiceCity: string;
    public InvoicePostalCode: string;
    public InvoiceCountry: string;
    public InvoiceCountryCode: string;

    public addItem(item: WorkOrderItem) {
        item.SumTotalExVat = roundTo((item.NumberOfItems || 0) * (item.PriceExVat || 0), 2);
        this.Items.push(item);
        this.TaxExclusiveAmount = (this.TaxExclusiveAmount || 0) + item.SumTotalExVat;
    }
}

export class WorkOrderItem {
    public ProductID: number;
    public ItemText: string;
    public Unit: string;
    public ItemSource: WorkItemSource;
    public NumberOfItems: number;
    public PriceExVat: number;
    public SumTotalExVat: number;
    public constructor(productId?: number, itemText?: string, numberOfItems?: number, priceExVat?: number ) {
        this.ProductID = productId;
        this.ItemText = itemText;
        this.NumberOfItems = numberOfItems;
        this.PriceExVat = priceExVat;
    }
}

export class WorkItemSource {
    public Details: Array<WorkItemSourceDetail> = [];
}

export class WorkItemSourceDetail {
    public SourceFK: number;
    public SourceType: string = 'WorkItem';
    public Tag: string;
    public Description: string;
    public Amount: number;
    public constructor(workItemID?: number, amount?: number) {
        this.SourceFK = workItemID || this.SourceFK;
        this.Amount = amount || this.Amount;
    }
}
