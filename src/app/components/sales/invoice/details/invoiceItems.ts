import {Component, Input, Output, EventEmitter} from '@angular/core';
import {UniTableColumn, UniTableColumnType, UniTableConfig} from 'unitable-ng2/main';
import {ProductService, VatTypeService, CustomerInvoiceItemService} from '../../../../services/services';
import {TradeItemHelper} from '../../salesHelper/tradeItemHelper';
import {CustomerInvoice, CustomerInvoiceItem, VatType, StatusCodeCustomerInvoice} from '../../../../unientities';

@Component({
    selector: 'uni-invoice-items',
    template: `
        <uni-table [resource]="tableData"
                   [config]="tableConfig"
                   (rowDeleted)="onRowDeleted($event.rowModel)">
        </uni-table>
    `
})
export class InvoiceItems {
    @Input() public invoice: CustomerInvoice;
    @Input() public projects: any[];
    @Input() public departments: any[];

    @Output() public invoiceChange: EventEmitter<CustomerInvoice>;

    private vatTypes: VatType[] = [];

    private tableConfig: UniTableConfig;
    private tableData: CustomerInvoiceItem[];

    constructor(private customerInvoiceItemService: CustomerInvoiceItemService,
                private productService: ProductService,
                private vatTypeService: VatTypeService,
                private tradeItemHelper: TradeItemHelper) {
        this.invoiceChange = new EventEmitter<CustomerInvoice>();
        this.initDataAndTable();
    }

    public ngOnChanges(changes) {
        if (changes['invoice']) {
            this.tableData = this.invoice.Items.filter(item => !item.Deleted);
        }
    }

    private initDataAndTable() {
        this.vatTypeService.GetAll(null).subscribe((vattypes) => {
            this.vatTypes = vattypes;
            this.initTableConfig();
        });
    }

    private initTableConfig() {
        // Columns
        const productCol = new UniTableColumn('Product', 'Varenr', UniTableColumnType.Lookup)
            .setDisplayField('Product.PartName')
            .setEditorOptions({
                itemTemplate: item => `${item.PartName} - ${item.Name}`,
                lookupFunction: (query: string) => {
                    return this.productService.GetAll(
                        `filter=contains(Name,'${query}') or contains(PartName,'${query}')&top=20`,
                        ['VatType', 'Dimensions', 'Dimensions.Project', 'Dimensions.Department']
                    );
                }
            });

        const itemTextCol = new UniTableColumn('ItemText', 'Tekst').setWidth('20%');
        const numItemsCol = new UniTableColumn('NumberOfItems', 'Antall', UniTableColumnType.Number);
        const unitCol = new UniTableColumn('Unit', 'Enhet');
        const exVatCol = new UniTableColumn('PriceExVat', 'Pris', UniTableColumnType.Money);

        const vatTypeCol = new UniTableColumn('VatType', 'Momskode', UniTableColumnType.Lookup)
            .setWidth('15%')
            .setTemplate((row) => {
                const vatType = row['VatType'];
                return (vatType) ? `${vatType.VatPercent}% - ${vatType.Name}` : '';
            })
            .setEditorOptions({
                itemTemplate: item => `${item.Name} - ${item.VatPercent}%`,
                lookupFunction: (searchValue) => {
                    const query = searchValue.toLowerCase();
                    let filtered = this.vatTypes.filter((vatType) => {
                        return vatType.Name.toLowerCase().indexOf(query) > -1
                               || vatType.VatPercent.toString() === query;
                    });

                    return filtered;
                }
            });

        const discountPercentCol = new UniTableColumn('DiscountPercent', 'Rabatt %', UniTableColumnType.Percent);
        const discountCol = new UniTableColumn('Discount', 'Rabatt', UniTableColumnType.Money, false)
            .setVisible(false);

        const projectCol = new UniTableColumn('Dimensions.Project', 'Prosjekt', UniTableColumnType.Select)
            .setDisplayField('Dimensions.Project.Name')
            .setEditorOptions({
                itemTemplate: item => `${item.ProjectNumber}: ${item.Name}`,
                resource: this.projects.filter(x => !!x)
            })
            .setVisible(false);

        const departmentCol = new UniTableColumn('Dimensions.Department', 'Avdeling', UniTableColumnType.Select)
            .setDisplayField('Dimensions.Department.Name')
            .setEditorOptions({
                itemTemplate: item => `${item.DepartmentNumber}: ${item.Name}`,
                resource: this.departments.filter(x => !!x)
            })
            .setVisible(false);

        const sumTotalExVatCol = new UniTableColumn('SumTotalExVat', 'Netto', UniTableColumnType.Money, false)
            .setVisible(false);

        const sumVatCol = new UniTableColumn('SumVat', 'Mva', UniTableColumnType.Money, false)
            .setVisible(false);

        const sumTotalIncVatCol = new UniTableColumn('SumTotalIncVat', 'Sum', UniTableColumnType.Money, false);

        // Table config
        const editable = !this.invoice.StatusCode || this.invoice.StatusCode === StatusCodeCustomerInvoice.Draft;
        this.tableConfig = new UniTableConfig(editable)
            .setColumns([
                productCol, itemTextCol, numItemsCol, unitCol,
                exVatCol, vatTypeCol, discountPercentCol, discountCol,
                projectCol, departmentCol, sumTotalExVatCol, sumVatCol, sumTotalIncVatCol
            ])
            .setColumnMenuVisible(true)
            .setDefaultRowData(this.tradeItemHelper.getDefaultTradeItemData(this.invoice))
            .setDeleteButton(editable)
            .setChangeCallback((event) => {
                const updatedRow = this.tradeItemHelper.tradeItemChangeCallback(event);
                let index = this.getLocalIndex(updatedRow);
                if (index >= 0) {
                    this.invoice.Items[index] = updatedRow;
                } else {
                    this.invoice.Items.push(updatedRow);
                }
                this.invoiceChange.next(this.invoice);
                return updatedRow;
            });
    }

    public onRowDeleted(row: CustomerInvoiceItem) {
        let index = this.getLocalIndex(row);
        if (row.ID) {
            this.invoice.Items[index].Deleted = true;
        } else if (index > -1) {
            this.invoice.Items.splice(index, 1);
        }

        this.invoiceChange.next(this.invoice);
    }

    public getLocalIndex(rowModel): number {
        if (rowModel.ID) {
            return this.invoice.Items.findIndex(item => item.ID === rowModel.ID);
        } else {
            return this.invoice.Items.findIndex(item => item['_guid'] === rowModel['_guid']);
        }
    }

}
