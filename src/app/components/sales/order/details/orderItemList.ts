import {Component, ViewChild, Input, Output, EventEmitter} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';
import {Router} from '@angular/router';

import {UniTable, UniTableColumn, UniTableColumnType, UniTableConfig} from 'unitable-ng2/main';

import {ProductService, VatTypeService, CustomerOrderItemService, ErrorService} from '../../../../services/services';
import {CustomerOrder, CustomerOrderItem, Product, VatType, StatusCodeCustomerOrderItem} from '../../../../unientities';
import {TradeItemHelper} from '../../salesHelper/tradeItemHelper';

@Component({
    selector: 'order-item-list',
    templateUrl: './orderItemList.html'
})
export class OrderItemList {
    @Input() public order: CustomerOrder;
    @ViewChild(UniTable) public table: UniTable;
    @Output() public itemsUpdated: EventEmitter<any> = new EventEmitter<any>();
    @Output() public itemDeleted: EventEmitter<any> = new EventEmitter<any>();
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
        private tradeItemHelper: TradeItemHelper,
        private errorService: ErrorService
    ) {
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
                this.vatTypeService.GetAll('filter=OutputVat eq true')
            ).subscribe(
                (data) => {
                    this.products = data[0];
                    this.vatTypes = data[1];

                    this.setupUniTable();

                    this.itemsLoaded.emit(this.items);
                },
                err => this.errorService.handle(err)
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
                lookupFunction: (query: string) => {
                    return this.productService.GetAll(
                        `filter=contains(Name,'${query}') or contains(PartName,'${query}')&top=20`,
                        ['VatType', 'Account', 'Dimensions', 'Dimensions.Project', 'Dimensions.Department']
                    );
                }
            });

        let itemTextCol = new UniTableColumn('ItemText', 'Tekst');
        let unitCol = new UniTableColumn('Unit', 'Enhet');
        let numItemsCol = new UniTableColumn('NumberOfItems', 'Antall', UniTableColumnType.Number);
        let exVatCol = new UniTableColumn('PriceExVat', 'Pris eks mva', UniTableColumnType.Money);
        let discountPercentCol = new UniTableColumn('DiscountPercent', 'Rabatt %', UniTableColumnType.Number);
        let discountCol = new UniTableColumn('Discount', 'Rabatt', UniTableColumnType.Money, false);

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

        let projectCol = new UniTableColumn('Dimensions.Project', 'Prosjekt', UniTableColumnType.Lookup)
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
                searchPlaceholder: 'Velg prosjekt',
                lookupFunction: (searchValue) => {
                    return Observable.from([this.projects.filter((project) => project.ProjectNumber.toString().startsWith(searchValue) ||
                                                                              project.Name.toLowerCase().indexOf(searchValue.toLowerCase()) !== -1)]);
                }
            });

        let departmentCol = new UniTableColumn('Dimensions.Department', 'Avdeling', UniTableColumnType.Lookup)
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
                searchPlaceholder: 'Velg avdeling',
                lookupFunction: (searchValue) => {
                    return Observable.from([this.departments.filter((department) => department.DepartmentNumber.toString().startsWith(searchValue) ||
                                                                                    department.Name.toLowerCase().indexOf(searchValue.toLowerCase()) !== -1)]);
                }
            });

        let sumTotalExVatCol = new UniTableColumn('SumTotalExVat', 'Netto', UniTableColumnType.Money, false);
        let sumVatCol = new UniTableColumn('SumVat', 'Mva', UniTableColumnType.Money, false);
        let sumTotalIncVatCol = new UniTableColumn('SumTotalIncVat', 'Sum ink. mva', UniTableColumnType.Money, false);

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
            })
            .setIsRowReadOnly((item: CustomerOrderItem) => {
                return item.StatusCode != null && item.StatusCode !== StatusCodeCustomerOrderItem.Draft && item.StatusCode !== StatusCodeCustomerOrderItem.Registered;
            })
            .setDeleteButton({
                deleteHandler: (rowModel) => {
                    this.deleteRow(rowModel);
                    return true;
                },
                disableOnReadonlyRows: true
            });

    }

    public rowChanged(event) {
        var tableData = this.table.getTableData();
        this.itemsUpdated.emit(tableData);
    }

    public deleteRow(item: CustomerOrderItem) {
        this.itemDeleted.emit(item);

        // emit rowChanged also to make the parent component update it's collection
        this.rowChanged(null);
    }
}
