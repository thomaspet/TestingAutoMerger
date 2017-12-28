import { LocalDate, Customer } from '@uni-entities';
import { roundTo } from '@app/components/common/utils/utils';
import { createGuid } from '@app/services/services';

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
    public DefaultDimensions: Dimensions;
    public _expand: boolean;

    private _minDate: LocalDate;
    private _maxDate: LocalDate;

    constructor() {
        this.OrderDate = new LocalDate();
    }

    public insertDateComment(prefix = '', firstRow = true) {
        let item: WorkOrderItem;
        if (this._minDate && this._maxDate) {
            const periodText = this.createPeriodText(this._minDate, this._maxDate);
            item = new WorkOrderItem(undefined, prefix ? prefix + ' ' + periodText : periodText);
        } else {
            item = new WorkOrderItem(undefined, prefix);
        }
        if (firstRow) {
            this.Items.splice(0, 0, item);
            return;
        }
        this.Items.push(item);
    }

    private createPeriodText(d1: LocalDate, d2: LocalDate): string {
        if (d1 && d2) {
            const dt1 = d1.toDate().toLocaleDateString();
            const dt2 = d2.toDate().toLocaleDateString();
            if (d1 === d2) {
                return dt1 + ' :';
            }
            return `${dt1} - ${dt2} :`;
        }
        return '';
    }

    public addItem(item: WorkOrderItem, merge = true, date?: string) {

        if (date) {
            const ld = new LocalDate(date);
            this._maxDate = max(ld, this._maxDate);
            this._minDate = max(ld, this._minDate, true);
        }

        item.calcSum();
        this.TaxExclusiveAmount = (this.TaxExclusiveAmount || 0) + item.SumTotalExVat;

        if (merge) {
            const existing = this.Items.find( x => x.ProductID === item.ProductID
                && x.ItemText === item.ItemText && x.PriceExVat === item.PriceExVat);
            if (existing) {
                existing.merge(item);
                return;
            }
        }

        this.Items.push(item);

    }

    public setCustomer(customer: Customer) {
        if (customer && customer.Info) {
            const info = customer.Info;
            this.CustomerID = customer.ID;
            this.CustomerName = info.Name;
            if (info.InvoiceAddress) {
                this.InvoiceAddressLine1 = info.InvoiceAddress.AddressLine1;
                this.InvoiceAddressLine2 = info.InvoiceAddress.AddressLine2;
                this.InvoiceAddressLine3 = info.InvoiceAddress.AddressLine3;
                this.InvoiceCity = info.InvoiceAddress.City;
                this.InvoicePostalCode = info.InvoiceAddress.PostalCode;
                this.InvoiceCountry = info.InvoiceAddress.Country;
                this.InvoiceCountryCode = info.InvoiceAddress.CountryCode;
            }
        }
    }

    setProject(projectId: number) {
        this.DefaultDimensions = new Dimensions(projectId);
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
    public VatTypeID: number;
    public Dimensions: Dimensions;
    public _createguid: string;
    public constructor(productId?: number, itemText?: string, numberOfItems?: number, priceExVat?: number ) {
        this.ProductID = productId;
        this.ItemText = itemText;
        this.NumberOfItems = numberOfItems;
        this.PriceExVat = priceExVat;
        this.ItemSource = new WorkItemSource();
        this._createguid = createGuid();
    }

    public merge(item: WorkOrderItem) {
        this.ItemSource.Details = this.ItemSource.Details.concat(item.ItemSource.Details);
        this.NumberOfItems = (this.NumberOfItems || 0) + item.NumberOfItems;
        this.calcSum();
    }

    public calcSum() {
        this.SumTotalExVat = roundTo((this.NumberOfItems || 0) * (this.PriceExVat || 0), 2);
    }

    setProject(projectId: number) {
        this.Dimensions = new Dimensions(projectId);
    }

}

export class Dimensions {
    public _createguid: string;
    public ProjectID: number;
    public DepartmentID: number;
    constructor(projectId?: number) {
        this.ProjectID = projectId;
        this._createguid = createGuid();
    }
}

export class WorkItemSource {
    public Details: Array<WorkItemSourceDetail> = [];
    public _createguid: string;
    constructor() {
        this._createguid = createGuid();
    }
}

export class WorkItemSourceDetail {
    public SourceFK: number;
    public SourceType: string = 'WorkItem';
    public Tag: string;
    public Description: string;
    public Amount: number;
    public _createguid: string;
    public constructor(workItemID?: number, amount?: number) {
        this.SourceFK = workItemID || this.SourceFK;
        this.Amount = amount || this.Amount;
        this._createguid = createGuid();
    }
}

    
function max(v1, v2, invert = false) {
    if (!v1) return v2;
    if (!v2) return v1;
    return (invert ? v1 < v2 : v1 > v2) ? v1 : v2;
}