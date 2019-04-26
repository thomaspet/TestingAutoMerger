import {Component, Input, Output, EventEmitter, ViewChild} from '@angular/core';
import {Observable, of as observableOf} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {TradeItemHelper} from '../salesHelper/tradeItemHelper';
import {UniProductDetailsModal} from '../products/productDetailsModal';
import {UniModalService, ConfirmActions} from '../../../../framework/uni-modal';
import {
    UniTableColumn,
    UniTableColumnType,
    UniTableConfig,
    IRowChangeEvent
} from '@uni-framework/ui/unitable/index';
import {AgGridWrapper} from '@uni-framework/ui/ag-grid/ag-grid-wrapper';
import {
    VatType,
    CompanySettings,
    Project,
    Department,
    Dimensions,
    LocalDate,
} from '../../../unientities';
import {
    ProductService,
    AccountService,
    ProjectService,
    ProjectTaskService,
    DepartmentService,
    ErrorService,
    CompanySettingsService,
    CustomDimensionService
} from '../../../services/services';
import * as moment from 'moment';
import * as _ from 'lodash';

@Component({
    selector: 'uni-tradeitem-table',
    template: `
        <ag-grid-wrapper *ngIf="settings"
            [(resource)]="items"
            [config]="tableConfig"
            (rowChange)="onRowChange($event)"
            (rowDelete)="itemsChange.next(items)">
        </ag-grid-wrapper>
    `
})
export class TradeItemTable {
    @ViewChild(AgGridWrapper) private table: AgGridWrapper;

    @Input() public readonly: boolean;
    @Input() public defaultTradeItem: any;
    @Input() public currencyCodeID: number;
    @Input() public currencyExchangeRate: number;
    @Input() public projects: Project[];
    @Input() public departments: Department[];
    @Input() public configStoreKey: string;
    @Input() public items: any[];
    @Input() public dimensionTypes: any;
    @Input() public vatDate: LocalDate;
    @Output() public itemsChange: EventEmitter<any> = new EventEmitter();

    @Input() public vatTypes: VatType[];
    private foreignVatType: VatType;
    public tableConfig: UniTableConfig;
    public settings: CompanySettings;
    private defaultProject: Project;
    pricingSourceLabels = ['Fast', 'Produkt'];
    priceFactor = [
        { value: 0, label: 'Fast' },
        // { value: 1, label: 'Pr. dag' },
        // { value: 2, label: 'Pr. uke' },
        { value: 3, label: 'Pr måned' },
        { value: 4, label: 'Pr. kvartal' },
        { value: 5, label: 'Pr. år' }
    ];

    constructor(
        private productService: ProductService,
        private accountService: AccountService,
        private tradeItemHelper: TradeItemHelper,
        private departmentService: DepartmentService,
        private projectService: ProjectService,
        private projectTaskService: ProjectTaskService,
        private errorService: ErrorService,
        private companySettingsService: CompanySettingsService,
        private modalService: UniModalService,
        private customDimensionService: CustomDimensionService
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
        this.table.finishEdit();
    }

    public focusFirstRow() {
        this.table.focusRow(0);
    }

    public updateVatPercentsAndItems() {
        if (this.vatTypes && this.items) {
            const vatTypes = this.vatTypes;

            // find the correct vatpercentage based on the either vatdate or current date,
            // in that order. VatPercent may change between years, so this needs to be checked each time
            // the date changes
            const vatDate =
                this.vatDate ?
                    moment(this.vatDate) :
                    moment(Date());

            const changedVatTypeIDs: Array<number> = [];

            vatTypes.forEach(vatType => {

                const validPercentageForVatType =
                    vatType.VatTypePercentages.find(y =>
                            (moment(y.ValidFrom) <= vatDate && y.ValidTo && moment(y.ValidTo) >= vatDate)
                            || (moment(y.ValidFrom) <= vatDate && !y.ValidTo));

                            const vatPercent = validPercentageForVatType ? validPercentageForVatType.VatPercent : 0;

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

                const itemsWithoutVatPercent = this.items.filter(x => x.VatType && !x.VatType.VatPercent);
                const items = itemsWithoutVatPercent.length > 0 ?
                    itemsWithoutVatPercent :
                    this.items.filter(x => x.VatType && changedVatTypeIDs.indexOf(x.VatType.ID) !== -1);

                items.forEach(item => {
                    if (item.VatType) {
                        const newVatType = this.vatTypes.find(x => x.ID === item.VatType.ID);
                        item.VatType = newVatType;

                        didAnythingReallyChange = true;
                    }

                    item.VatPercent = item.VatType ? item.VatType.VatPercent : 0;

                    this.tradeItemHelper.calculatePriceIncVat(item, this.currencyExchangeRate);
                    this.tradeItemHelper.calculateBaseCurrencyAmounts(item, this.currencyExchangeRate);
                    this.tradeItemHelper.calculateDiscount(item, this.currencyExchangeRate);
                });

                if (didAnythingReallyChange) {
                    this.itemsChange.emit(this.items);
                }
            }
        }
    }

    public updateAllItemVatCodes(currencyCodeID) {
        if (this.foreignVatType) {
            const isBaseCurrencyUsed: Boolean = (currencyCodeID === this.settings.BaseCurrencyCodeID) ? true : false;
            this.items.forEach(item => {
                if (isBaseCurrencyUsed) {
                    item.VatTypeID = (item.Product && item.Product.VatTypeID) || null;
                    item.VatType = (item.Product && item.Product.VatType) || null;
                } else {
                    item.VatTypeID = this.foreignVatType.ID;
                    item.VatType = this.foreignVatType;
                }
            });
        }
    }

    public setDefaultProjectAndRefreshItems(projectID: number, updateTableData: boolean) {
        if (this.projects) {
            this.defaultProject = this.projects.find(project => project.ID === projectID);
        }

        this.defaultTradeItem.Dimensions.ProjectID = projectID;
        this.defaultTradeItem.Dimensions.Project = this.defaultProject;
        this.tableConfig = this.tableConfig.setDefaultRowData(this.defaultTradeItem);

        if (updateTableData) {
            this.items = this.items.map(item => {
                if (item.Product) {
                    item.Dimensions = item.Dimensions || new Dimensions();
                    item.Dimensions.ProjectID = projectID;
                    item.Dimensions.Project = this.defaultProject;
                }
                return item;
            });
        }
    }

    public setNonCustomDimsOnTradeItems(entity: string, id: number) {
        let shouldAskBeforeChange: boolean = false;

        this.items.forEach((item) => {
            if (item.Dimensions
                && item.Dimensions[entity]
                && item.Dimensions[entity] !== id) {
                    shouldAskBeforeChange = true;
                }
        });

        // let currentDimArray = entity.substr(0, entity.length - 2) === '' ? this.departments : []; // [] to be replaced with regions
        // currentDimArray = entity.substr(0, entity.length - 2) === 'Region'
        // ? currentDimArray : []; // [] to be replaced with this.responsibilities

        // Should get from departments, regions or responsibilities!
        const defaultDim = this.departments.find(dep => dep.ID === id);

        // Change default trade item when dimension is changed
        this.defaultTradeItem.Dimensions[entity] = id;
        this.defaultTradeItem.Dimensions[entity.substr(0, entity.length - 2)] = defaultDim;
        this.tableConfig = this.tableConfig.setDefaultRowData(this.defaultTradeItem);

        const func = () => {
            // Set up query to match entity!
            this.items = this.items.map(item => {
                if (item.Product) {
                    item.Dimensions = item.Dimensions || new Dimensions();
                    item.Dimensions[entity] = id;
                    item.Dimensions[entity.substr(0, entity.length - 2)] = defaultDim;
                }
                return item;
            });
        };

        if (shouldAskBeforeChange) {
            this.modalService.confirm({
                header: `Endre dimensjon på alle varelinjer?`,
                message: `Vil du endre til denne dimensjonen på alle eksisterende varelinjer?`,
                buttonLabels: {
                    accept: 'Ja',
                    reject: 'Nei'
                }
            }).onClose.subscribe(response => {
                if (response === ConfirmActions.ACCEPT) {
                    func();
                }
            });
        } else {
            func();
        }
    }

    public setDimensionOnTradeItems(dimension: number, dimensionID: number) {
        const dim = this.dimensionTypes.find(dimType => dimType.Dimension === dimension).Data.find(item => item.ID === dimensionID);
        let shouldAskBeforeChange: boolean = false;

        // Change default trade item when dimension is changed
        this.defaultTradeItem.Dimensions['Dimension' + dimension + 'ID'] = dimensionID;
        this.defaultTradeItem.Dimensions['Dimension' + dimension] = dim;
        this.tableConfig = this.tableConfig.setDefaultRowData(this.defaultTradeItem);

        // Loop items to see if we need to ask before changing dimensions on line level
        this.items.forEach((item) => {
            if (item.Dimensions
                && item.Dimensions['Dimension' + dimension + 'ID']
                && item.Dimensions['Dimension' + dimension + 'ID'] !== dimensionID) {
                    shouldAskBeforeChange = true;
                }
        });

        if (shouldAskBeforeChange) {
            this.modalService.confirm({
                header: `Endre dimensjon på alle varelinjer?`,
                message: `Vil du endre til denne dimensjonen på alle eksisterende varelinjer?`,
                buttonLabels: {
                    accept: 'Ja',
                    reject: 'Nei'
                }
            }).onClose.subscribe(response => {
                if (response === ConfirmActions.ACCEPT) {
                    this.items = this.items.map(item => {
                        item.Dimensions = item.Dimensions || new Dimensions();
                        item.Dimensions['Dimension' + dimension + 'ID'] = dimensionID;
                        item.Dimensions['Dimension' + dimension] = dim;
                        return item;
                    });
                }
            });
        } else {
            this.items = this.items.map(item => {
                item.Dimensions = item.Dimensions || new Dimensions();
                item.Dimensions['Dimension' + dimension + 'ID'] = dimensionID;
                item.Dimensions['Dimension' + dimension] = dim;
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
            .setJumpToColumn('NumberOfItems')
            .setOptions({
                itemTemplate: item => item.Name ? `${item.PartName} - ${item.Name}` : item.PartName,
                lookupFunction: (input: string) => {
                    let filter = `contains(Name,'${input}') or startswith(PartName,'${input}')`;

                    // Search for specific PartName with prefix =
                    if (input && input.charAt(0) === '=') {
                        const searchText = input.split('=')[1];
                        if (searchText) {
                            filter = `PartName eq '${searchText.trim()}'`;
                        }
                    }

                    return this.productService.GetAll(
                        `filter=${filter}&top=100&orderby=PartName`,
                        [
                            'Account',
                            'Dimensions',
                            'Dimensions.Project',
                            'Dimensions.Department',
                            'Dimensions.Dimension5',
                            'Dimensions.Dimension6',
                            'Dimensions.Dimension7',
                            'Dimensions.Dimension8',
                            'Dimensions.Dimension9',
                            'Dimensions.Dimension10'
                        ]
                    ).pipe(
                        catchError(err => {
                            this.errorService.handle(err);
                            return observableOf([]);
                        }),
                        map(res => {
                            const sorted = (res || []).sort((item1, item2) => {
                                const item1PartName = item1.PartName || '';
                                const item2PartName = item2.PartName || '';

                                if (+item1PartName && +item2PartName) {
                                    return +item1PartName - +item2PartName;
                                }

                                return item1PartName.localeCompare(item2PartName);
                            });

                            return sorted;
                        })
                    );
                },
                showResultAsTable: true,
                resultTableConfig: {
                    fields: [
                        {
                            header: 'Nr',
                            key: 'PartName',
                            class: '',
                            width: '100px'
                        },
                        {
                            header: 'Navn',
                            key: 'Name',
                            class: '',
                            width: ''
                        },
                        {
                            header: 'Pris',
                            key: 'PriceIncVat',
                            class: '',
                            width: '100px',
                            isMoneyField: true
                        }
                    ],
                    createNewButton: {
                        buttonText: 'Nytt produkt',
                        action: () => {
                            return this.modalService.open(UniProductDetailsModal, {  }).onClose;
                        },
                        getAction: (item) => {
                            return this.productService.Get(item.ID);
                        },
                        errorAction: (msg: string) => {
                            this.errorService.handle(msg);
                        }
                    }
                },
            });

        const itemTextCol = new UniTableColumn('ItemText', 'Tekst')
            .setMaxLength(255)
            .setWidth('20%');

        const unitCol = new UniTableColumn('Unit', 'Enhet')
            .setMaxLength(100);

        const numItemsCol = new UniTableColumn('NumberOfItems', 'Antall', UniTableColumnType.Number)
            .setNumberFormat({
                thousandSeparator: ' ',
                decimalSeparator: ',',
                decimalLength: this.settings.ShowNumberOfDecimals,
                postfix: undefined
            });

        const exVatCol = new UniTableColumn('PriceExVatCurrency', 'Pris eks. mva', UniTableColumnType.Money)
            .setNumberFormat({
                thousandSeparator: ' ',
                decimalSeparator: ',',
                decimalLength: this.settings.ShowNumberOfDecimals,
                postfix: undefined
            });
        const incVatCol = new UniTableColumn('PriceIncVatCurrency', 'Pris ink. mva', UniTableColumnType.Money)
            .setVisible(false)
            .setNumberFormat({
                thousandSeparator: ' ',
                decimalSeparator: ',',
                decimalLength: this.settings.ShowNumberOfDecimals,
                postfix: undefined
            });

        const pricingSourceCol = new UniTableColumn('PricingSource', 'Priskilde.')
            .setType(UniTableColumnType.Select)
            .setWidth('15%')
            .setTemplate((row) => {
                if (row && (row.PricingSource || row.PricingSource === 0)) {
                    return this.pricingSourceLabels[row.PricingSource];
                } else {
                    return '';
                }
            })
            .setOptions({
                itemTemplate: rowModel => rowModel,
                resource: this.pricingSourceLabels
            });

        // const reduceCol = new UniTableColumn('ReduceIncompletePeriod', 'Reduser ufullstendig periode', UniTableColumnType.Boolean);

        const timefactorCol = new UniTableColumn('TimeFactor', 'Prisfaktor')
            .setType(UniTableColumnType.Select)
            .setWidth('15%')
            .setTemplate((row) => {
                if (row && (row.TimeFactor || row.TimeFactor === 0)) {
                    // Find factor in array and display label. Make sure factor exists just in case
                    const factor = this.priceFactor.find(fac => fac.value === row.TimeFactor);
                    return factor ? factor.label : '';
                } else {
                    return '';
                }
            })
            .setOptions({
                itemTemplate: rowModel => rowModel.label,
                resource: this.priceFactor
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
                return (vatType) ? `${row.VatPercent}% - ${vatType.Name}` : '';
            })
            .setOptions({
                itemTemplate: item => `${item.VatCode}: ${item.VatPercent}% - ${item.Name}`,
                lookupFunction: (searchValue) => {
                    const query = searchValue.toLowerCase();
                    const filtered = this.vatTypes.filter((vatType) => {
                        return vatType.VatCode.toLowerCase().startsWith(query)
                            || vatType.Name.toLowerCase().indexOf(query) > -1
                            || vatType.VatPercent.toString().indexOf(query) > -1;
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
                            const querySplit = query.split(/[,.]/) ;
                            filter = `filter=startswith(Number,'${querySplit[0]}') and `
                                + `(contains(Name,'${querySplit[1]}') or `
                                + `contains(ID,'${querySplit[1]}'))&groupby=ProjectID`;
                        }
                    }

                    return this.projectTaskService.GetAll(filter)
                        .catch((err, obs) => this.errorService.handleRxCatch(err, obs));
                }
            });

        const discountPercentCol = new UniTableColumn('DiscountPercent', 'Rabatt %', UniTableColumnType.Percent)
            .setTemplate(row => {
                return row.DiscountPercent > 0 ? this.tradeItemHelper.round(row.DiscountPercent, 2).toString() : null;
            });

        const discountCol = new UniTableColumn('DiscountCurrency', 'Rabatt', UniTableColumnType.Money, false)
            .setVisible(false);

            const projectCol = new UniTableColumn('Dimensions.Project', 'Prosjekt', UniTableColumnType.Lookup)
            .setVisible(false)
            .setTemplate((rowModel) => {
                if (!rowModel['_isEmpty'] && rowModel.Dimensions && rowModel.Dimensions.Project) {
                    const project = rowModel.Dimensions.Project;
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

            const departmentCol = new UniTableColumn('Dimensions.Department', 'Avdeling', UniTableColumnType.Lookup)
            .setVisible(false)
            .setTemplate((rowModel) => {
                if (!rowModel['_isEmpty'] && rowModel.Dimensions && rowModel.Dimensions.Department) {
                    const dep = rowModel.Dimensions.Department;
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

        const dimensionCols = [];

        this.dimensionTypes.forEach((type, index) => {
            if (type.Label === 'Avdeling' || type.Dimension < 4) {
                return;
            }
            const dimCol = new UniTableColumn('Dimensions.Dimension' + type.Dimension, type.Label, UniTableColumnType.Lookup)
            .setVisible(false)
            .setTemplate((rowModel) => {
                if (!rowModel['_isEmpty'] && rowModel.Dimensions && rowModel.Dimensions['Dimension' + type.Dimension]) {
                    const dim = rowModel.Dimensions['Dimension' + type.Dimension];
                    return dim.Number + ': ' + dim.Name;
                }

                return '';
            })
            .setDisplayField('Dimensions.Dimension' + type.Dimension + '.Name')
            .setEditable(type.IsActive)
            .setOptions({
                itemTemplate: (item) => {
                    return (item.Number + ': ' + item.Name);
                },
                searchPlaceholder: 'Velg avdeling',
                lookupFunction: (query) => {

                    return this.customDimensionService.getCustomDimensionList(
                        type.Dimension,
                        `?filter=startswith(Number,'${query}') or contains(Name,'${query}')&top=30`
                    ).catch((err, obs) => this.errorService.handleRxCatch(err, obs));
                }
            });

            dimensionCols.push(dimCol);
        });

        const sumTotalExVatCol = new UniTableColumn('SumTotalExVatCurrency', 'Netto', UniTableColumnType.Money, false)
            .setVisible(false);

        const sumVatCol = new UniTableColumn('SumVatCurrency', 'Mva', UniTableColumnType.Money, false)
            .setVisible(false);

        const sumTotalIncVatCol = new UniTableColumn(
            'SumTotalIncVatCurrency', 'Sum', UniTableColumnType.Money, true
        );

        const allCols = [
            sortIndexCol, productCol, itemTextCol, unitCol, numItemsCol,
            exVatCol, incVatCol, accountCol, vatTypeCol, discountPercentCol, discountCol,
            projectCol, departmentCol, sumTotalExVatCol, sumVatCol, sumTotalIncVatCol, projectTaskCol
        ].concat(dimensionCols);

        if (this.configStoreKey === 'sales.recurringinvoice.tradeitemTable') {
            allCols.splice(6, 0, pricingSourceCol, timefactorCol);
        }

        this.tableConfig = new UniTableConfig(this.configStoreKey, !this.readonly)
            .setColumns(allCols)
            .setColumnMenuVisible(true)
            .setDefaultRowData(this.defaultTradeItem)
            .setDeleteButton(!this.readonly)
            .setIsRowReadOnly(row => row.StatusCode === 41103)
            .setChangeCallback((event) => {
                const updatedRow = this.tradeItemHelper.tradeItemChangeCallback(
                    event,
                    this.currencyCodeID,
                    this.currencyExchangeRate,
                    this.settings,
                    this.vatTypes,
                    this.foreignVatType,
                    this.vatDate,
                    this.pricingSourceLabels,
                    this.priceFactor
                );

                updatedRow['_isDirty'] = true;

                if (updatedRow.Dimensions && updatedRow.Dimensions.ProjectTask) {
                    const projectId = updatedRow.Dimensions.ProjectTask.ProjectID;
                    const project = this.projects.find(p => p.ID === projectId);

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
                this.items = _.cloneDeep(this.items); // trigger change detection
                this.itemsChange.emit(this.items);
            });
    }

    private updateDimensions(event: IRowChangeEvent, updatedRow: any) {
        let triggerChangeDetection = false;
        let noProduct = false;

        if (event.field == 'Product') {
            if (!event.newValue) {
                noProduct = true;
            }
            else if (updatedRow.Product && !updatedRow.Product.Dimensions) {
                updatedRow.Dimensions = this.defaultTradeItem.Dimensions;
                updatedRow.Dimensions.ProjectID = this.defaultTradeItem.Dimensions.ProjectID;
                triggerChangeDetection = true;
            }
        } else if (event.field == 'ItemText') {
            if (!updatedRow.Product) {
                noProduct = true;
            }
        }
        if (noProduct) {
            updatedRow.Dimensions = null;
            triggerChangeDetection = true;
        }
        return triggerChangeDetection;
    }

    public onRowChange(event: IRowChangeEvent) {
        const updatedRow = event.rowModel;
        const updatedIndex = event.originalIndex;

        let triggerChangeDetection = this.updateDimensions(event, updatedRow);

        // If freetext on row is more than 250 characters we need
        // to split it into multiple rows
        if (updatedRow.ItemText && updatedRow.ItemText.length > 250) {
            // Split the text into parts of 250 characters
            const stringParts = updatedRow.ItemText.match(/.{1,250}/g);

            updatedRow.ItemText = stringParts.shift();

            // Add the remaining string parts to new rows below
            stringParts.forEach((text, extraRowCounter) => {
                const newRow = this.getEmptyRow();
                newRow.ItemText = text;

                const insertIndex = updatedIndex + extraRowCounter + 1;
                this.items.splice(insertIndex, 0, newRow);
            });

            triggerChangeDetection = true;
        }
        if (triggerChangeDetection) {
            this.items[updatedIndex] = updatedRow;
            this.items = _.cloneDeep(this.items); // trigger change detection
        }

        this.itemsChange.next(this.items);
    }

    private getEmptyRow() {
        // Clone to make sure the row is a copy, not a reference
        const row: any = _.cloneDeep(this.defaultTradeItem);
        row['_isEmpty'] = false;
        row['_createguid'] = this.productService.getNewGuid();
        row.Dimensions = null;

        return row;
    }

    public onRowDeleted(row) {
        this.itemsChange.next(this.items);
    }

    private accountSearch(searchValue: string): Observable<any> {

        let filter = '';
        if (searchValue === '') {
            filter = `Visible eq 'true' and isnull(AccountID,0) eq 0`;
        } else {
            let copyPasteFilter = '';

            if (searchValue.indexOf(':') > 0) {
                const accountNumberPart = searchValue.split(':')[0].trim();
                const accountNamePart =  searchValue.split(':')[1].trim();
                copyPasteFilter = ` or (AccountNumber eq '${accountNumberPart}' `
                    + `and AccountName eq '${accountNamePart}')`;
            }
            filter = `Visible eq 'true' and (startswith(AccountNumber\,'${searchValue}') `
                + `or contains(AccountName\,'${searchValue}')${copyPasteFilter} )`;
        }

        return this.accountService.searchAccounts(filter, searchValue !== '' ? 100 : 500);
    }
}
