import {Component, Input, Output, EventEmitter, ViewChild} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {TradeItemHelper} from '../salesHelper/tradeItemHelper';
import {
    UniTable,
    UniTableColumn,
    UniTableColumnType,
    UniTableConfig,
    IRowChangeEvent
} from '../../../../framework/ui/unitable/index';
import {
    VatType,
    CompanySettings,
    Project,
    Dimensions,
    LocalDate
} from '../../../unientities';
import {
    ProductService,
    VatTypeService,
    AccountService,
    ProjectService,
    ProjectTaskService,
    DepartmentService,
    ErrorService,
    CompanySettingsService
} from '../../../services/services';
import * as moment from 'moment';

@Component({
    selector: 'uni-tradeitem-table',
    template: `
        <uni-table *ngIf="settings"
                   [resource]="tableData"
                   [config]="tableConfig"
                   (rowChanged)="onRowChange($event)"
                   (rowDeleted)="onRowDeleted($event.rowModel)">
        </uni-table>
    `
})
export class TradeItemTable {
    @ViewChild(UniTable) private table: UniTable;

    @Input() public readonly: boolean;
    @Input() public defaultTradeItem: any;
    @Input() public currencyCodeID: number;
    @Input() public currencyExchangeRate: number;
    @Input() public projects: Project[];
    @Input() public configStoreKey: string;
    @Input() public items: any;
    @Input() public vatDate: LocalDate;
    @Output() public itemsChange: EventEmitter<any> = new EventEmitter();

    @Input() public vatTypes: VatType[];
    private foreignVatType: VatType;
    private tableConfig: UniTableConfig;
    private tableData: any[];
    private settings: CompanySettings;
    private defaultProject: Project;

    constructor(
        private productService: ProductService,
        private accountService: AccountService,
        private tradeItemHelper: TradeItemHelper,
        private departmentService: DepartmentService,
        private projectService: ProjectService,
        private projectTaskService: ProjectTaskService,
        private errorService: ErrorService,
        private companySettingsService: CompanySettingsService
    ) {}

    public ngOnInit() {
        Observable.forkJoin(
            this.companySettingsService.Get(1)
        ).subscribe(
            res => {
                this.settings = res[0];
                this.initTableConfig();
            },
            err => this.errorService.handle(err)
        );
    }

    public ngOnChanges(changes) {
        if (changes['items'] && this.items) {
            this.tableData = this.items.filter(item => !item.Deleted);
            this.updateVatPercentsAndItems();
        }

        if (changes['readonly'] && this.table) {
            this.initTableConfig();
        }

        if (changes['vatDate']) {
            this.updateVatPercentsAndItems();
        }

        if (changes['vatTypes']) {
            this.foreignVatType = this.vatTypes.find(vt => vt.VatCode === '52');
            this.updateVatPercentsAndItems();
        }
    }

    public ngOnDestroy() {
    }

    public blurTable() {
        this.table.blur();
    }

    public focusFirstRow() {
        this.table.focusRow(0);
    }

    public updateVatPercentsAndItems() {
        if (this.vatTypes && this.items) {
            let vatTypes = this.vatTypes;

            // find the correct vatpercentage based on the either vatdate or current date,
            // in that order. VatPercent may change between years, so this needs to be checked each time
            // the date changes
            let vatDate =
                this.vatDate ?
                    moment(this.vatDate) :
                    moment(Date());

            let changedVatTypeIDs: Array<number> = [];

            vatTypes.forEach(vatType => {

                let validPercentageForVatType =
                    vatType.VatTypePercentages.find(y =>
                            (moment(y.ValidFrom) <= vatDate && y.ValidTo && moment(y.ValidTo) >= vatDate)
                            || (moment(y.ValidFrom) <= vatDate && !y.ValidTo));

                let vatPercent = validPercentageForVatType ? validPercentageForVatType.VatPercent : 0;

                // set the correct percentage on the VatType also, this is done to reflect it properly in
                // the UI if changing a date leads to using a different vatpercent
                if (vatType.VatPercent !== vatPercent) {
                    vatType.VatPercent = vatPercent;
                    changedVatTypeIDs.push(vatType.ID);
                }
            });

            if (changedVatTypeIDs.length > 0 || this.items.filter(x => x.VatType && !x.VatType.VatPercent).length > 0) {
                this.vatTypes = vatTypes;

                // just because some vattypes might have changed by changing the dates, it doesnt mean
                // any of the items actually use this vattype - so keep track of any real changes
                let didAnythingReallyChange = false;

                let itemsWithoutVatPercent = this.items.filter(x => x.VatType && !x.VatType.VatPercent);
                let items = itemsWithoutVatPercent.length > 0 ?
                    itemsWithoutVatPercent :
                    this.items.filter(x => x.VatType && changedVatTypeIDs.indexOf(x.VatType.ID) !== -1);

                items.forEach(item => {
                    if (item.VatType) {
                        let newVatType = this.vatTypes.find(x => x.ID === item.VatType.ID);
                        item.VatType = newVatType;

                        this.tradeItemHelper.calculatePriceIncVat(item);
                        this.tradeItemHelper.calculateBaseCurrencyAmounts(item, this.currencyExchangeRate);
                        this.tradeItemHelper.calculateDiscount(item, this.currencyExchangeRate);

                        didAnythingReallyChange = true;
                    }
                });

                if (didAnythingReallyChange) {
                    this.tableData = this.items.filter(item => !item.Deleted);
                    this.itemsChange.emit(this.items);
                }
            }
        }
    }

    public updateAllItemVatCodes(currencyCodeID) {
        if (this.foreignVatType) {
            let isBaseCurrencyUsed: Boolean = (currencyCodeID === this.settings.BaseCurrencyCodeID) ? true : false;
            this.items.forEach(item => {
                item.VatTypeID = isBaseCurrencyUsed ? item.Product.VatTypeID : this.foreignVatType.ID;
                item.VatType = isBaseCurrencyUsed ? item.Product.VatType : this.foreignVatType;
            });
        }
    }

    public setDefaultProjectAndRefreshItems(projectID: number, replaceItemsProject: boolean) {
        if (this.projects) {
            this.defaultProject = this.projects.find(project => project.ID === projectID);
        }
        this.defaultTradeItem.Dimensions.ProjectID = projectID;
        this.defaultTradeItem.Dimensions.Project = this.defaultProject;
        this.tableConfig = this.tableConfig.setDefaultRowData(this.defaultTradeItem);
        if (replaceItemsProject) {
            this.tableData = this.items.map(item => {
                item.Dimensions = item.Dimensions || new Dimensions();
                item.Dimensions.ProjectID = projectID;
                item.Dimensions.Project = this.defaultProject;
                return item;
            });
        }
    }

    private initTableConfig() {
        const sortIndexCol = new UniTableColumn('SortIndex', 'Nr', UniTableColumnType.Number).setWidth('50px')
            .setVisible(false);

        // Columns
        const productCol = new UniTableColumn('Product', 'Varenr', UniTableColumnType.Lookup)
            .setDisplayField('Product.PartName')
            .setOptions({
                itemTemplate: item => item.Name ? `${item.PartName} - ${item.Name}` : item.PartName,
                lookupFunction: (query: string) => {
                    return this.productService.GetAll(
                        `filter=contains(Name,'${query}') or contains(PartName,'${query}')&top=20`,
                        ['Account', 'Dimensions', 'Dimensions.Project', 'Dimensions.Department']
                    )

                    .catch((err, obs) => this.errorService.handleRxCatch(err, obs));
                }
            });

        const itemTextCol = new UniTableColumn('ItemText', 'Tekst')
            .setWidth('20%');

        const numItemsCol = new UniTableColumn('NumberOfItems', 'Antall', UniTableColumnType.Number)
            .setNumberFormat({
                thousandSeparator: ' ',
                decimalSeparator: ',',
                decimalLength: this.settings.ShowNumberOfDecimals,
                postfix: undefined
            });

        const unitCol = new UniTableColumn('Unit', 'Enhet');

        const exVatCol = new UniTableColumn('PriceExVatCurrency', 'Pris', UniTableColumnType.Money)
            .setNumberFormat({
                thousandSeparator: ' ',
                decimalSeparator: ',',
                decimalLength: this.settings.ShowNumberOfDecimals,
                postfix: undefined
            });

        const accountCol = new UniTableColumn('Account', 'Konto', UniTableColumnType.Lookup)
            .setWidth('15%')
            .setTemplate((row) => {
                const account = row['Account'];
                return (account) ? `${account.AccountNumber} : ${account.AccountName}` : '';
            })
            .setVisible(false)
            .setOptions({
                itemTemplate: item => `${item.AccountNumber} : ${item.AccountName}`,
                lookupFunction: (searchValue) => {
                    return this.accountSearch(searchValue);
                }
            });

        const vatTypeCol = new UniTableColumn('VatType', 'Momskode', UniTableColumnType.Lookup)
            .setWidth('15%')
            .setTemplate((row) => {
                const vatType = row['VatType'];
                return (vatType) ? `${vatType.VatPercent}% - ${vatType.Name}` : '';
            })
            .setOptions({
                itemTemplate: item => `${item.VatCode}: ${item.VatPercent}% - ${item.Name}`,
                lookupFunction: (searchValue) => {
                    const query = searchValue.toLowerCase();
                    let filtered = this.vatTypes.filter((vatType) => {
                        return vatType.VatCode.toLowerCase().startsWith(query)
                            || vatType.Name.toLowerCase().indexOf(query) > -1
                            || vatType.VatPercent.toString() === query;
                    });

                    return filtered;
                },
                groupConfig:  {
                    groupKey: 'VatCodeGroupingValue',
                    visibleValueKey: 'Visible',
                    groups: [
                        {
                            key: 4,
                            header: 'Salg/inntekter'
                        },
                        {
                            key: 5,
                            header: 'Salg uten mva.'
                        },
                        {
                            key: 7,
                            header: 'Egendefinerte koder'
                        }

                    ]
                }
            });

        const projectTaskCol = new UniTableColumn('Dimensions.ProjectTask', 'Oppgave', UniTableColumnType.Lookup)
            .setDisplayField('Dimensions.ProjectTask.Name')
            .setVisible(false)
            .setOptions({
                itemTemplate: (item) => {
                    return (item.Number + ': ' + item.Name);
                },
                lookupFunction: (query) => {
                    let filter = `filter=contains(Name,'${query}') or contains(ID,'${query}') `
                        + `or contains(Number,'${query}')&groupby=ProjectID`;

                    if (typeof query === 'string' && query !== '') {
                        if (query.indexOf(',') !== -1 || query.indexOf('.') !== -1) {
                            let querySplit = query.split(/[,.]/) ;
                            filter = `filter=startswith(Number,'${querySplit[0]}') and `
                                + `(contains(Name,'${querySplit[1]}') or `
                                + `contains(ID,'${querySplit[1]}'))&groupby=ProjectID`;
                        }
                    }

                    return this.projectTaskService.GetAll(filter)
                        .catch((err, obs) => this.errorService.handleRxCatch(err, obs));
                }
            });

        const discountPercentCol = new UniTableColumn('DiscountPercent', 'Rabatt %', UniTableColumnType.Percent);

        const discountCol = new UniTableColumn('DiscountCurrency', 'Rabatt', UniTableColumnType.Money, false)
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
            .setOptions({
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
            .setOptions({
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


        const sumTotalExVatCol = new UniTableColumn('SumTotalExVatCurrency', 'Netto', UniTableColumnType.Money, false)
            .setVisible(false);

        const sumVatCol = new UniTableColumn('SumVatCurrency', 'Mva', UniTableColumnType.Money, false)
            .setVisible(false);

        const sumTotalIncVatCol = new UniTableColumn(
            'SumTotalIncVatCurrency', 'Sum', UniTableColumnType.Money, false
        );


        this.tableConfig = new UniTableConfig(this.configStoreKey, !this.readonly)
            .setColumns([
                sortIndexCol, productCol, itemTextCol, numItemsCol, unitCol,
                exVatCol, accountCol, vatTypeCol, discountPercentCol, discountCol,
                projectCol, departmentCol, sumTotalExVatCol, sumVatCol, sumTotalIncVatCol, projectTaskCol
            ])
            .setColumnMenuVisible(true)
            .setDefaultRowData(this.defaultTradeItem)
            .setDeleteButton(!this.readonly)
            .setCopyFromCellAbove(false)
            .setIsRowReadOnly(row => row.StatusCode === 41103)
            .setChangeCallback((event) => {
                const updatedRow = this.tradeItemHelper.tradeItemChangeCallback(
                    event,
                    this.currencyCodeID,
                    this.currencyExchangeRate,
                    this.settings,
                    this.vatTypes,
                    this.foreignVatType,
                    this.vatDate
                );

                updatedRow['_isDirty'] = true;

                if (updatedRow.VatTypeID && !updatedRow.VatType) {
                    updatedRow.VatType = this.vatTypes.find(vt => vt.ID === updatedRow.VatTypeID);
                }

                if (updatedRow.Dimensions && updatedRow.Dimensions.ProjectTask) {
                    let projectId = updatedRow.Dimensions.ProjectTask.ProjectID;
                    let project = this.projects.find(p => p.ID === projectId);

                    if (project) {
                      updatedRow.Dimensions.Project = project;
                      updatedRow.Dimensions.ProjectID = project.ID;
                    }
                }

                const updatedIndex = updatedRow['_originalIndex'];
                if (updatedIndex >= 0) {
                    this.items[updatedIndex] = updatedRow;
                }

                return updatedRow;
                // Splitting text larger than 250 characters and emitting
                // item change is handled in rowChange event hook (onRowChange)
                // because this should happen after changeCallback has finished
            })
            .setInsertRowHandler((index) => {
                this.items.splice(index, 0, this.getEmptyRow());
                this.itemsChange.emit(this.items);

                this.tableData = this.items.filter(row => !row.Deleted); // trigger change detection
            });
    }

    public onRowChange(event: IRowChangeEvent) {
        let updatedRow = event.rowModel;
        let updatedIndex = event.originalIndex;

        // If freetext on row is more than 250 characters we need
        // to split it into multiple rows
        if (updatedRow.ItemText && updatedRow.ItemText.length > 250) {
            // Split the text into parts of 250 characters
            let stringParts = updatedRow.ItemText.match(/.{1,250}/g);

            updatedRow.ItemText = stringParts.shift();

            // Add the remaining string parts to new rows below
            stringParts.forEach((text, extraRowCounter) => {
                let newRow = this.getEmptyRow();
                newRow.ItemText = text;

                const insertIndex = updatedIndex + extraRowCounter + 1;
                this.items.splice(insertIndex, 0, newRow);
            });

            this.items[updatedIndex] = updatedRow;

            // Trigger change in table
            this.tableData = this.items.filter(row => !row.Deleted);
        }

        // Emit change event
        this.itemsChange.next(this.items);
    }

    private getEmptyRow() {
        // Object.assign to make sure the row is a copy, not a reference
        let row: any = Object.assign({}, this.defaultTradeItem);
        row['_isEmpty'] = false; // avoid unitable filtering it out
        row['_createguid'] = this.productService.getNewGuid();
        row.Dimensions = null;

        return row;
    }

    public onRowDeleted(row) {
        let deleteIndex = this.items.findIndex(item => {
            if (row.ID) {
                return item.ID === row.ID;
            } else if (row['_createguid']) {
                return item['_createguid'] === row['_createguid'];
            }
        });

        if (deleteIndex >= 0) {
            if (this.items[deleteIndex].ID) {
                this.items[deleteIndex].Deleted = true;
            } else {
                this.items.splice(deleteIndex, 1);
            }
        }

        this.itemsChange.next(this.items);
    }

    private accountSearch(searchValue: string): Observable<any> {

        let filter = '';
        if (searchValue === '') {
            filter = `Visible eq 'true' and isnull(AccountID,0) eq 0`;
        } else {
            let copyPasteFilter = '';

            if (searchValue.indexOf(':') > 0) {
                let accountNumberPart = searchValue.split(':')[0].trim();
                let accountNamePart =  searchValue.split(':')[1].trim();
                copyPasteFilter = ` or (AccountNumber eq '${accountNumberPart}' `
                    + `and AccountName eq '${accountNamePart}')`;
            }
            filter = `Visible eq 'true' and (startswith(AccountNumber\,'${searchValue}') `
                + `or contains(AccountName\,'${searchValue}')${copyPasteFilter} )`;
        }

        return this.accountService.searchAccounts(filter, searchValue !== '' ? 100 : 500);
    }
}
