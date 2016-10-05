import {Component, ViewChild, Input, Output, EventEmitter, OnInit} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';
import {Router} from '@angular/router';
import {UniTable, UniTableColumn, UniTableColumnType, UniTableConfig} from 'unitable-ng2/main';

import {ProductService, VatTypeService, CustomerInvoiceItemService} from '../../../../services/services';
import {CustomerInvoice, CustomerInvoiceItem, Product, VatType, StatusCodeCustomerInvoice} from '../../../../unientities';
import {TradeItemHelper} from '../../salesHelper/tradeItemHelper';

declare var jQuery;

@Component({
    selector: 'invoice-item-list',
    templateUrl: 'app/components/sales/invoice/details/invoiceItemList.html'
})
export class InvoiceItemList implements OnInit {
    @Input() public invoice: CustomerInvoice;
    @ViewChild(UniTable) public table: UniTable;
    @Output() public itemsUpdated: EventEmitter<any> = new EventEmitter<any>();
    @Output() public itemsLoaded: EventEmitter<any> = new EventEmitter<any>();
    @Input() public departments: Array<any> = [];
    @Input() public projects: Array<any> = [];

    public invoiceItemTable: UniTableConfig;

    public products: Product[];
    public vatTypes: VatType[];
    public items: CustomerInvoiceItem[];

    constructor(
        private router: Router,
        private customerInvoiceItemService: CustomerInvoiceItemService,
        private productService: ProductService,
        private vatTypeService: VatTypeService,
        private tradeItemHelper: TradeItemHelper) {
    }

    public ngOnInit() {
        this.setupInvoiceItemTable();
    }

    public ngOnChanges() {
        this.setupInvoiceItemTable();
    }

    private setupInvoiceItemTable() {
        if (this.invoice) {
            this.items = this.invoice.Items;

            Observable.forkJoin(
                this.productService.GetAll(null, ['VatType', 'Dimensions', 'Dimensions.Project', 'Dimensions.Department']),
                this.vatTypeService.GetAll(null)
            ).subscribe(
                (data) => {
                    this.products = data[0];
                    this.vatTypes = data[1];
                    // Add a blank item in the dropdown controls

                    this.setupUniTable();

                    this.itemsLoaded.emit(this.items);
                },
                (err) => console.log('Error retrieving data: ', err)
                );
        }
    }

    private setupUniTable() {
        let productCol = new UniTableColumn('Product', 'Produkt', UniTableColumnType.Lookup)
            .setDisplayField('Product.PartName')
            .setEditorOptions({
                itemTemplate: (selectedItem) => {
                    return (selectedItem.PartName + ' - ' + selectedItem.Name);
                },
                lookupFunction: (searchValue: string) => {
                    return Observable.from([this.products.filter((product: Product) => product.PartName.toLowerCase().indexOf(searchValue.toLowerCase()) > -1 || product.Name.toLowerCase().indexOf(searchValue.toLowerCase()) > -1)]);
                }
            });

        let itemTextCol = new UniTableColumn('ItemText', 'Tekst');
        let unitCol = new UniTableColumn('Unit', 'Enhet');
        let numItemsCol = new UniTableColumn('NumberOfItems', 'Antall', UniTableColumnType.Number);
        let exVatCol = new UniTableColumn('PriceExVat', 'Pris eks mva', UniTableColumnType.Number);
        let discountPercentCol = new UniTableColumn('DiscountPercent', 'Rabatt %', UniTableColumnType.Number);
        let discountCol = new UniTableColumn('Discount', 'Rabatt', UniTableColumnType.Number, false);

        let vatTypeCol = new UniTableColumn('VatType', 'MVA %', UniTableColumnType.Lookup)
            .setTemplate((rowModel) => {
                if (rowModel['VatType']) {
                    let vatType = rowModel['VatType'];
                    return vatType['VatCode'] + ': ' + vatType['VatPercent'] + '%';
                }

                return '';
            })
            .setDisplayField('VatType.VatPercent')
            .setEditorOptions({
                itemTemplate: (item) => {
                    return (item.VatCode + ': ' + item.Name + ' - ' + item.VatPercent + '%');
                },
                lookupFunction: (searchValue) => {
                    return Observable.from([this.vatTypes.filter((vattype) => vattype.VatCode === searchValue || vattype.VatPercent === searchValue)]);
                }
            });

        let projectCol = new UniTableColumn('Dimensions.Project', 'Prosjekt', UniTableColumnType.Select)
            .setTemplate((rowModel) => {
                if (!rowModel['_isEmpty'] && rowModel.Dimensions && rowModel.Dimensions.Project) {
                    let project = rowModel.Dimensions.Project;
                    return project.ProjectNumber + ': ' + project.Name;
                }

                return '';
            })
            .setDisplayField('Dimensions.Project.Name')
            .setEditorOptions({
                itemTemplate: (item) => {
                    return (item.ProjectNumber + ': ' + item.Name);
                },
                resource: this.projects.filter(x => x !== null),
                searchPlaceholder: 'Velg prosjekt'
            });

        let departmentCol = new UniTableColumn('Dimensions.Department', 'Avdeling', UniTableColumnType.Select)
            .setTemplate((rowModel) => {
                if (!rowModel['_isEmpty'] && rowModel.Dimensions && rowModel.Dimensions.Department) {
                    let dep = rowModel.Dimensions.Department;
                    return dep.DepartmentNumber + ': ' + dep.Name;
                }

                return '';
            })
            .setDisplayField('Dimensions.Department.Name')
            .setEditorOptions({
                itemTemplate: (item) => {
                    return (item.DepartmentNumber + ': ' + item.Name);
                },
                resource: this.departments.filter(x => x !== null),
                searchPlaceholder: 'Velg avdeling'
            });

        let sumTotalExVatCol = new UniTableColumn('SumTotalExVat', 'Netto', UniTableColumnType.Number, false);
        let sumVatCol = new UniTableColumn('SumVat', 'Mva', UniTableColumnType.Number, false);
        let sumTotalIncVatCol = new UniTableColumn('SumTotalIncVat', 'Sum ink. mva', UniTableColumnType.Number, false);

        let editable = this.invoice.StatusCode === StatusCodeCustomerInvoice.Draft;


        // Table
        this.invoiceItemTable = new UniTableConfig(editable)
            .setColumns([
                productCol, itemTextCol, unitCol, numItemsCol,
                exVatCol, discountPercentCol, discountCol, vatTypeCol,
                projectCol, departmentCol, sumTotalExVatCol, sumVatCol, sumTotalIncVatCol
            ])
            .setDefaultRowData(this.tradeItemHelper.getDefaultTradeItemData(this.invoice))
            .setChangeCallback((event) => {
                return this.tradeItemHelper.tradeItemChangeCallback(event);
            });
    }

    public rowChanged(event) {
        console.log('row changed, calculate sums');
        var tableData = this.table.getTableData();
        this.itemsUpdated.emit(tableData);
    }
}
