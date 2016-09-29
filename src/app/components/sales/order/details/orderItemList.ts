import {Component, ViewChild, Input, Output, EventEmitter} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';
import {Router} from '@angular/router';

import {UniTable, UniTableColumn, UniTableColumnType, UniTableConfig} from 'unitable-ng2/main';

import {ProductService, VatTypeService, CustomerOrderItemService} from '../../../../services/services';
import {CustomerOrder, CustomerOrderItem, Product, VatType} from '../../../../unientities';
import {TradeItemHelper} from '../../salesHelper/tradeItemHelper';

declare var jQuery;

@Component({
    selector: 'order-item-list',
    templateUrl: 'app/components/sales/order/details/orderItemList.html',
    directives: [UniTable],
    providers: [ProductService, VatTypeService, CustomerOrderItemService, TradeItemHelper]
})
export class OrderItemList {
    @Input() public order: CustomerOrder;
    @ViewChild(UniTable) public table: UniTable;
    @Output() public itemsUpdated: EventEmitter<any> = new EventEmitter<any>();
    @Output() public itemsLoaded: EventEmitter<any> = new EventEmitter<any>();
    @Input() public departments: Array<any> = [];
    @Input() public projects: Array<any> = [];

    public orderItemTable: UniTableConfig;

    public products: Product[];
    public vatTypes: VatType[];
    public items: CustomerOrderItem[];

    constructor(
        private router: Router,
        private productService: ProductService,
        private vatTypeService: VatTypeService,
        private customerOrderItemService: CustomerOrderItemService,
        private tradeItemHelper: TradeItemHelper) {
    }

    public ngOnInit() {
        this.setupOrderItemTable();
    }

    public ngOnChanges() {
        this.setupOrderItemTable();
    }

    private setupOrderItemTable() {
        if (this.order) {
            this.items = this.order.Items;

            Observable.forkJoin(
                this.productService.GetAll(null, ['VatType', 'Dimensions', 'Dimensions.Project', 'Dimensions.Department']),
                this.vatTypeService.GetAll(null)
            ).subscribe(
                (data) => {
                    this.products = data[0];
                    this.vatTypes = data[1];

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

        var statusCol = new UniTableColumn('StatusCode', 'Status', UniTableColumnType.Number, false)
            .setWidth('10%')
            .setTemplate((dataItem) => {
                return this.customerOrderItemService.getStatusText(dataItem.StatusCode);
            });

        // Setup table
        this.orderItemTable = new UniTableConfig()
            .setColumns([
                productCol, itemTextCol, unitCol, numItemsCol,
                exVatCol, discountPercentCol, discountCol, vatTypeCol,
                projectCol, departmentCol, sumTotalExVatCol, sumVatCol, sumTotalIncVatCol,
                statusCol
            ])
            .setDefaultRowData(this.tradeItemHelper.getDefaultTradeItemData(this.order))
            .setChangeCallback((event) => {
                return this.tradeItemHelper.tradeItemChangeCallback(event);
            });

    }

    public rowChanged(event) {
        var tableData = this.table.getTableData();
        this.itemsUpdated.emit(tableData);
    }
}
