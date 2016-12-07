import {Component, Input, Output, EventEmitter, ViewChild} from '@angular/core';
import {UniTable, UniTableColumn, UniTableColumnType, UniTableConfig} from 'unitable-ng2/main';
import {TradeItemHelper} from '../salesHelper/tradeItemHelper';
import {VatType} from '../../../unientities';
import {
    ProductService,
    VatTypeService,
    ProjectService,
    DepartmentService,
    ErrorService
} from '../../../services/services';


@Component({
    selector: 'uni-tradeitem-table',
    template: `
        <uni-table [resource]="tableData"
                   [config]="tableConfig"
                   (rowDeleted)="onRowDeleted($event.rowModel)">
        </uni-table>
    `
})
export class TradeItemTable {
    @ViewChild(UniTable) private table: UniTable;
    @Input() public readonly: boolean;
    @Input() public defaultTradeItem: any;
    @Input() public items: any;
    @Output() public itemsChange: EventEmitter<any> = new EventEmitter();

    private vatTypes: VatType[] = [];
    private tableConfig: UniTableConfig;
    private tableData: any[];

    constructor(
        private productService: ProductService,
        private vatTypeService: VatTypeService,
        private tradeItemHelper: TradeItemHelper,
        private departmentService: DepartmentService,
        private projectService: ProjectService,
        private errorService: ErrorService
    ) {}

    public ngOnInit() {
        this.vatTypeService.GetAll('filter=OutputVat eq true').subscribe(
            (vattypes) => {
                this.vatTypes = vattypes;
                this.initTableConfig();
            },
            err => this.errorService.handle(err)
        );
    }

    public ngOnChanges(changes) {
        if (changes['items'] && this.items) {
            this.tableData = this.items.filter(item => !item.Deleted);
        }

        if (changes['readonly'] && this.table) {
            this.initTableConfig();
        }
    }

    public blurTable() {
        this.table.blur();
    }

    public focusFirstRow() {
        this.table.focusRow(0);
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
                        ['VatType', 'Account', 'Dimensions', 'Dimensions.Project', 'Dimensions.Department']
                    ).catch((err, obs) => this.errorService.handleRxCatch(err, obs));
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
                itemTemplate: item => `${item.VatCode}: ${item.VatPercent}% - ${item.Name}`,
                lookupFunction: (searchValue) => {
                    const query = searchValue.toLowerCase();
                    let filtered = this.vatTypes.filter((vatType) => {
                        return vatType.VatCode.toLowerCase().startsWith(query)
                               || vatType.Name.toLowerCase().indexOf(query) > -1
                               || vatType.VatPercent.toString() === query;
                    });

                    return filtered;
                }
            });

        const discountPercentCol = new UniTableColumn('DiscountPercent', 'Rabatt %', UniTableColumnType.Percent);
        const discountCol = new UniTableColumn('Discount', 'Rabatt', UniTableColumnType.Money, false)
            .setVisible(false);

        let projectCol = new UniTableColumn('Dimensions.Project', 'Prosjekt', UniTableColumnType.Lookup)
            .setVisible(false)
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
                lookupFunction: (query) => {
                    return this.projectService.GetAll(
                        `filter=startswith(ProjectNumber,'${query}') or contains(Name,'${query}')&top=30`
                    ).catch((err, obs) => this.errorService.handleRxCatch(err, obs));
                }
            });

        let departmentCol = new UniTableColumn('Dimensions.Department', 'Avdeling', UniTableColumnType.Lookup)
            .setVisible(false)
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
                lookupFunction: (query) => {
                    return this.departmentService.GetAll(
                        `filter=startswith(DepartmentNumber,'${query}') or contains(Name,'${query}')&top=30`
                    ).catch((err, obs) => this.errorService.handleRxCatch(err, obs));
                }
            });


        const sumTotalExVatCol = new UniTableColumn('SumTotalExVat', 'Netto', UniTableColumnType.Money, false)
            .setVisible(false);

        const sumVatCol = new UniTableColumn('SumVat', 'Mva', UniTableColumnType.Money, false)
            .setVisible(false);

        const sumTotalIncVatCol = new UniTableColumn('SumTotalIncVat', 'Sum', UniTableColumnType.Money, false);

        // Table config
        this.tableConfig = new UniTableConfig(!this.readonly)
            .setColumns([
                productCol, itemTextCol, numItemsCol, unitCol,
                exVatCol, vatTypeCol, discountPercentCol, discountCol,
                projectCol, departmentCol, sumTotalExVatCol, sumVatCol, sumTotalIncVatCol
            ])
            .setColumnMenuVisible(true)
            .setDefaultRowData(this.defaultTradeItem)
            .setDeleteButton(!this.readonly)
            .setChangeCallback((rowModel) => {
                const updatedRow = this.tradeItemHelper.tradeItemChangeCallback(rowModel);

                if (updatedRow.VatTypeID && !updatedRow.VatType) {
                    updatedRow.VatType = this.vatTypes.find(vt => vt.ID === updatedRow.VatTypeID);
                }
                const index = updatedRow['_originalIndex'];

                if (index >= 0) {
                    this.items[index] = updatedRow;
                } else {
                    this.items.push(updatedRow);
                }

                this.itemsChange.next(this.items);
                return updatedRow;
            });
    }

    public onRowDeleted(row) {
        if (row.ID) {
            this.items[row['_originalIndex']].Deleted = true;
        } else {
            this.items.splice(row['_originalIndex'], 1);
        }

        this.itemsChange.next(this.items);
    }
}
