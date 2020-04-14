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
    StatusCodeProduct,
    Product
} from '../../../unientities';
import {
    ProductService,
    AccountService,
    ProjectService,
    ProjectTaskService,
    DepartmentService,
    ErrorService,
    CompanySettingsService,
    CustomDimensionService,
    AccountMandatoryDimensionService,
    NumberFormat
} from '../../../services/services';
import * as moment from 'moment';
import {cloneDeep} from 'lodash';
import {ToastType, ToastService} from '@uni-framework/uniToast/toastService';

@Component({
    selector: 'uni-tradeitem-table',
    template: `
        <ag-grid-wrapper *ngIf="showTable && settings"
            class="selection-disabled"
            [(resource)]="items"
            [config]="tableConfig"
            (rowChange)="onRowChange($event)"
            (rowDelete)="itemsChange.next(items)">
        </ag-grid-wrapper>
    `
})
export class TradeItemTable {
    @ViewChild(AgGridWrapper, { static: false }) private table: AgGridWrapper;

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

    showTable: boolean = true; // used for hard re-draw

    private foreignVatType: VatType;
    public tableConfig: UniTableConfig;
    public settings: CompanySettings;
    pricingSourceLabels = ['Fast', 'Produkt'];
    priceFactor = [
        { value: 0, label: 'Fast' },
        // { value: 1, label: 'Pr. dag' },
        // { value: 2, label: 'Pr. uke' },
        { value: 3, label: 'Pr måned' },
        { value: 4, label: 'Pr. kvartal' },
        { value: 5, label: 'Pr. år' }
    ];
    itemsWithReport: any[] = [];
    showMandatoryDimensionsColumn = false;
    accountsWithMandatoryDimensionsIsUsed = true;
    productExpands = [
        'Account',
        'Account.MandatoryDimensions',
        'Dimensions.Info'
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
        private customDimensionService: CustomDimensionService,
        private accountMandatoryDimensionService: AccountMandatoryDimensionService,
        private toastService: ToastService,
        private numberFormatter: NumberFormat
    ) {}

    public ngOnInit() {
        this.companySettingsService.Get(1).subscribe(settings => {
            this.settings = settings;
            this.initTableConfig();
        });

        this.accountMandatoryDimensionService.GetNumberOfAccountsWithMandatoryDimensions().subscribe(
            count => {
                this.accountsWithMandatoryDimensionsIsUsed = count > 0;

                if (this.accountsWithMandatoryDimensionsIsUsed &&
                    this.configStoreKey === 'sales.invoice.tradeitemTable' ||
                    this.configStoreKey === 'sales.order.tradeitemTable' ||
                    this.configStoreKey === 'sales.recurringinvoice.tradeitemTable') {
                    this.showMandatoryDimensionsColumn = true;
                    this.itemsWithReport = [];
                }

                if (this.showMandatoryDimensionsColumn && this.items && this.items.length > 0) {
                    this.getMandatoryDimensionsReports();
                }
            },
            err => this.errorService.handle(err)
        );
    }

    public ngOnChanges(changes) {
        if (changes['readonly'] && this.table) {
            this.showTable = false;
            setTimeout(() => {
                this.initTableConfig();
                this.showTable = true;
            });
        }

        if (changes['vatDate']) {
            const prev = changes['vatDate'].previousValue;
            const curr = changes['vatDate'].currentValue;

            if (!prev || moment(prev).diff(moment(curr), 'days') !== 0) {
                this.updateVatPercentsAndItems();
            }
        }

        if (changes['vatTypes']) {
            this.foreignVatType = this.vatTypes.find(vt => vt.VatCode === '52');
            this.updateVatPercentsAndItems();
        }

        if (changes['items'] && this.items) {
            this.items.forEach(item => {
                item['_dekningsGrad'] = item['_dekningsGrad'] || this.getDekningsGrad(item);
            });
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
            const vatDate = this.vatDate ? moment(this.vatDate) : moment(Date());
            const changedVatTypeIDs: Array<number> = [];

            vatTypes.forEach(vatType => {
                const validPercentageForVatType = vatType.VatTypePercentages.find(vatPercentage => {
                    return moment(vatPercentage.ValidFrom) <= vatDate
                        && (!vatPercentage.ValidTo || moment(vatPercentage.ValidTo) >= vatDate);
                });

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
                this.items = this.items.map(item => {
                    if (item.VatType) {
                        item.VatType = this.vatTypes.find(vt => vt.ID === item.VatType.ID);
                        if (item.VatType) {
                            item.VatPercent = item.VatType.VatPercent;
                        }

                        this.tradeItemHelper.calculatePriceIncVat(item, this.currencyExchangeRate);
                        this.tradeItemHelper.calculateBaseCurrencyAmounts(item, this.currencyExchangeRate);
                        this.tradeItemHelper.calculateDiscount(item, this.currencyExchangeRate);
                    }

                    return item;
                });

                setTimeout(() => this.itemsChange.emit(this.items));
            }
        }
    }

    public updateAllItemVatCodes(currencyCodeID) {
        if (this.foreignVatType) {
            const isBaseCurrencyUsed: Boolean = (currencyCodeID === this.settings.BaseCurrencyCodeID) ? true : false;
            this.items.forEach(item => {
                if (!item['_isEmpty']) {
                    if (isBaseCurrencyUsed) {
                        item.VatTypeID = (item.Product && item.Product.VatTypeID) || null;
                        item.VatType = (item.Product && item.Product.VatType) || null;
                        if (item.VatTypeID && !item.VatType && this.vatTypes) {
                            item.VatType = this.vatTypes.find(vt => vt.ID === item.VatTypeID);
                        }
                    } else {
                        item.VatTypeID = this.foreignVatType.ID;
                        item.VatType = this.foreignVatType;
                    }

                    if (item.VatType) {
                        item.VatPercent = item.VatType.VatPercent || 0;
                    }
                }
            });

            this.updateVatPercentsAndItems();
        }
    }

    public setDefaultProjectAndRefreshItems(dims: any, updateTableData: boolean) {
        this.mapDimensionsToEntity(dims, this.defaultTradeItem);
        this.tableConfig = this.tableConfig.setDefaultRowData(this.defaultTradeItem);

        this.items = this.items.map(item => {
            if ((updateTableData && item.Product) || (!updateTableData && !item.Product)) {
                this.mapDimensionsToEntity(dims, item);
            }
            return item;
        });
    }

    public mapDimensionsToEntity(dimensions: any, entity: any) {
        entity.Dimensions = entity.Dimensions || {};
        // Project
        entity.Dimensions.ProjectID = dimensions.ProjectID;
        entity.Dimensions.Project = dimensions.Project;
        // Department
        entity.Dimensions.DepartmentID = dimensions.DepartmentID;
        entity.Dimensions.Department = dimensions.Department;
        // Custom Dimensions
        for (let i = 5; i <= 10; i++) {
            entity.Dimensions[`Dimension${i}ID`] = dimensions[`Dimension${i}ID`];
            entity.Dimensions[`Dimension${i}`] = dimensions[`Dimension${i}`];
        }
    }

    public setNonCustomDimsOnTradeItems(entity: string, id: number, alreadyAskedDimensionChange: boolean = false) {
        let shouldAskBeforeChange: boolean = false;
        this.items.forEach((item) => {
            if (item.Dimensions
                && item.Dimensions[entity]
                && item.Dimensions[entity] !== id) {
                    shouldAskBeforeChange = true;
                }
        });

        const defaultDim = entity === 'ProjectID'
            ? this.projects.find(project => project.ID === id)
            : this.departments.find(dep => dep.ID === id);

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
                    item.DimensionsID = null;
                }
                return item;
            });

            this.itemsChange.emit(this.items);
            this.getMandatoryDimensionsReports();
        };
        if (shouldAskBeforeChange && !alreadyAskedDimensionChange) {
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

    public setDimensionOnTradeItems(dimension: number, dimensionID: number, alreadyAskedDimensionChange: boolean = false) {
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
        if (shouldAskBeforeChange && !alreadyAskedDimensionChange) {
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
                        item.DimensionsID = null;
                        return item;
                    });

                    this.itemsChange.emit(this.items);
                    this.getMandatoryDimensionsReports();
                }
            });
        } else {
            this.items = this.items.map(item => {
                item.Dimensions = item.Dimensions || new Dimensions();
                item.Dimensions['Dimension' + dimension + 'ID'] = dimensionID;
                item.Dimensions['Dimension' + dimension] = dim;
                item.DimensionsID = null;
                return item;
            });

            this.itemsChange.emit(this.items);
            this.getMandatoryDimensionsReports();
        }
    }

    private initTableConfig() {
        const sortIndexCol = new UniTableColumn('SortIndex', 'Nr', UniTableColumnType.Number).setWidth('50px')
            .setVisible(false);

        // Columns
        const productCol = new UniTableColumn('Product', 'Produkt', UniTableColumnType.Lookup)
            .setDisplayField('Product.PartName')
            .setJumpToColumn('NumberOfItems')
            .setMaxWidth(200)
            .setPlaceholder(row => row && !row.ItemText ? 'Velg produkt' : '')
            .setOptions({
                itemTemplate: item => item.Name ? `${item.PartName} - ${item.Name}` : item.PartName,
                lookupFunction: (input: string) => {
                    let filter = `statuscode eq '${StatusCodeProduct.Active}' and (contains(Name,'${input}') or startswith(PartName,'${input}'))`;

                    // Search for specific PartName with prefix =
                    if (input && input.charAt(0) === '=') {
                        const searchText = input.split('=')[1];
                        if (searchText) {
                            filter = `PartName eq '${searchText.trim()}'`;
                        }
                    }

                    return this.productService.GetAll(
                        `filter=${filter}&top=100&orderby=PartName`,
                        this.productExpands
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
                },
                addNewButton: {
                    label: 'Nytt produkt',
                    action: () => {
                        return new Promise(resolve => {
                            this.modalService.open(UniProductDetailsModal, {}).onClose.subscribe(item => {
                                if (item) {
                                    this.productService.GetAll(`filter=ID eq ${item.ID}`, this.productExpands).subscribe(
                                        product => resolve(product && product[0]),
                                        err => {
                                            this.errorService.handle(err);
                                            resolve(null);
                                        }
                                    );
                                } else {
                                    resolve(null);
                                }
                            });
                        });
                    }
                }
            });

        const itemTextCol = new UniTableColumn('ItemText', 'Tekst');

        const unitCol = new UniTableColumn('Unit', 'Enhet')
            .setWidth(120, true, false);

        const numItemsCol = new UniTableColumn('NumberOfItems', 'Antall', UniTableColumnType.Number)
            .setMaxWidth(120)
            .setNumberFormat({
                thousandSeparator: ' ',
                decimalSeparator: ',',
                decimalLength: this.settings.ShowNumberOfDecimals,
                postfix: undefined
            });

        const exVatCol = new UniTableColumn('PriceExVatCurrency', 'Pris eks. mva', UniTableColumnType.Money)
            .setMaxWidth(160)
            .setNumberFormat({
                thousandSeparator: ' ',
                decimalSeparator: ',',
                decimalLength: this.settings.ShowNumberOfDecimals,
                postfix: undefined
            });
        const incVatCol = new UniTableColumn('PriceIncVatCurrency', 'Pris ink. mva', UniTableColumnType.Money)
            .setMaxWidth(160)
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
            .setMaxWidth(300)
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
            .setMaxWidth(100)
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
        ).setMaxWidth(160);


        const dekningsGradCol = new UniTableColumn('_dekningsGrad', 'Dekningsgrad', UniTableColumnType.Percent, false)
            .setMaxWidth(140)
            .setVisible(false);

        const costPriceCol = new UniTableColumn('CostPrice', 'Kostpris', UniTableColumnType.Money)
            .setMaxWidth(140)
            .setVisible(false)
            .setTemplate(row => row.CostPrice || row.Product && row.Product.CostPrice);

        const allCols = [
            sortIndexCol, productCol, itemTextCol, unitCol, numItemsCol,
            exVatCol, incVatCol, accountCol, vatTypeCol, discountPercentCol, discountCol,
            projectCol, departmentCol, sumTotalExVatCol, sumVatCol, sumTotalIncVatCol, projectTaskCol,
            costPriceCol, dekningsGradCol
        ].concat(dimensionCols);

        allCols.push(this.createMandatoryDimensionsCol());

        if (this.configStoreKey === 'sales.recurringinvoice.tradeitemTable') {
            allCols.splice(6, 0, pricingSourceCol, timefactorCol);
        }

        this.tableConfig = new UniTableConfig(this.configStoreKey, !this.readonly)
            .setColumns(allCols)
            .setColumnMenuVisible(true)
            .setDefaultRowData(this.defaultTradeItem)
            .setDeleteButton(!this.readonly, true)
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

                updatedRow['_dekningsGrad'] = this.getDekningsGrad(updatedRow);

                return updatedRow;
                // Splitting text larger than 250 characters and emitting
                // item change is handled in rowChange event hook (onRowChange)
                // because this should happen after changeCallback has finished
            })
            .setInsertRowHandler((index) => {
                this.items.splice(index, 0, this.getEmptyRow());
                this.items = cloneDeep(this.items); // trigger change detection
                this.itemsChange.emit(this.items);
            });
    }

    private getDekningsGrad(item) {
        if (item.Product && item.SumTotalExVat) {
            const costPrice = item.CostPrice || (item.Product && item.Product.CostPrice) || 0;
            const dekningsBidrag = item.SumTotalExVat - (costPrice * item.NumberOfItems);
            const dekningsGrad = (dekningsBidrag * 100) / item.SumTotalExVat;

            return this.numberFormatter.asNumber(dekningsGrad);
        }
    }

    private createMandatoryDimensionsCol(): UniTableColumn {
        return new UniTableColumn('MandatoryDimensions', 'Påkrevde dimensjoner', UniTableColumnType.Text, false)
        .setVisible(false)
        .setWidth(40, false)
        .setTemplate(() => '')
        .setTooltipResolver((row: any) => {
            if (row.ProductID && row.AccountID) {
                let hasRequiredDims, hasWarnDims;
                let text = 'Påkrevde dimensjoner registrert ok';

                let itemReport = this.getItemWithReport(row);
                if (!itemReport && row.ID === 0) {
                    itemReport = this.itemsWithReport.find(x => x.itemID === row.ID);
                }

                if (itemReport && itemReport.report) {
                    const rep = itemReport.report;

                    if ((!rep.RequiredDimensions || Object.keys(rep.RequiredDimensions).length === 0)
                        && (!rep.WarningDimensions || Object.keys(rep.WarningDimensions).length === 0)) {
                        return;
                    }

                    const reqDims = rep.MissingRequiredDimensions || [];
                    const warnDims = rep.MissingWarningDimensions || [];

                    if (reqDims.length) {
                        hasRequiredDims = true;
                        text = rep.MissingRequiredDimensionsMessage;
                    }

                    if (warnDims.length) {
                        hasWarnDims = true;
                        if (hasRequiredDims) {
                            text += '\n' + rep.MissingOnlyWarningsDimensionsMessage;
                        } else {
                            text = rep.MissingOnlyWarningsDimensionsMessage;
                        }
                    }
                    const type = hasRequiredDims ? 'bad' : hasWarnDims ? 'warn' : 'good';
                    return {
                        type: type,
                        text: text
                    };
                }
            }
        });
    }

    private updateDimensions(event: IRowChangeEvent, updatedRow: any) {
        let triggerChangeDetection = false;
        let noProduct = false;


        if (event.field === 'Product') {
            if (!event.newValue) {
                noProduct = true;
            } else if (updatedRow.Product && updatedRow.Product.Dimensions && updatedRow.Product.Dimensions.Info) {
                // Set row to use product dimensions and reset ID
                updatedRow.Dimensions = updatedRow.Product.Dimensions;
                updatedRow.DimensionsID = 0;
                updatedRow.Dimensions = this.customDimensionService.mapDimensions(updatedRow.Dimensions);
                triggerChangeDetection = true;
            } else if (updatedRow.Product && !updatedRow.Product.Dimensions) {
                updatedRow.Dimensions = this.defaultTradeItem.Dimensions;
                updatedRow.Dimensions.ProjectID = this.defaultTradeItem.Dimensions.ProjectID;
                triggerChangeDetection = true;
            } else if (updatedRow.Product) {
                triggerChangeDetection = true;
            }
        } else if (event.field === 'ItemText') {
            if (!updatedRow.Product) {
                noProduct = true;
            }
        } else if (event.field.startsWith('Dimensions.')) {
            updatedRow.DimensionsID = 0;
            triggerChangeDetection = true;
        } else if (event.field === 'Account') {
            triggerChangeDetection = true;
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
            if (this.showMandatoryDimensionsColumn) {
                this.updateItemMandatoryDimensions(updatedRow);
            } else {
                this.items = cloneDeep(this.items); // trigger change detection
            }
        }

        this.itemsChange.next(this.items);
    }

    private getItemWithReport(item: any) {
        return item.ID !== 0
        ? this.itemsWithReport.find(x => x.itemID === item.ID)
        : this.itemsWithReport.find(x => x.createguid === item._createguid);
    }

    private updateItemMandatoryDimensions(item: any) {
        this.accountMandatoryDimensionService.getMandatoryDimensionsReportByDimension(item.AccountID, item.Dimensions).subscribe(rep => {
            const itemRep = this.getItemWithReport(item);
            if (itemRep) {
                itemRep.report = rep;
            } else {
                this.itemsWithReport.push({
                    createguid: item._createguid || item.ID,
                    itemID: item.ID,
                    report: rep
                });
            }
            this.items = cloneDeep(this.items); // trigger change detection
        },
        err => {
            this.errorService.handle(err);
            this.items = cloneDeep(this.items);
        });
    }

    public getMandatoryDimensionsReports() {
        if (this.accountsWithMandatoryDimensionsIsUsed) {
            this.accountMandatoryDimensionService.getMandatoryDimensionsReports(this.items).subscribe(
                reports => {
                    this.itemsWithReport = [];
                    this.items.forEach((item, index) => {
                        this.itemsWithReport.push({
                            createguid: item._createguid || item.ID,
                            itemID: item.ID,
                            report: reports[index]
                        });
                    });

                    if (this.itemsWithReport.length) {
                        this.items = cloneDeep(this.items);
                    }
                },
                err => this.errorService.handle(err)
            );
        }
    }

    public showWarningIfMissingMandatoryDimensions(items: any[]) {
        const mdCol = this.table.columns.find(x => x.field === 'MandatoryDimensions');
        if (mdCol && !mdCol.visible) {
            if (this.accountsWithMandatoryDimensionsIsUsed && items) {
                let msg: string = '';
                this.items.forEach(item => {
                    const itemWithReport = this.getItemWithReport(item);
                    if (itemWithReport) {
                        const report = itemWithReport.report;
                        if (report) {
                            if (report.MissingRequiredDimensionsMessage !== '') {
                                if (!msg.includes(report.MissingRequiredDimensionsMessage)) {
                                    msg += '! ' +  report.MissingRequiredDimensionsMessage + '<br/>';
                                }
                            }
                            if (report.MissingOnlyWarningsDimensionsMessage) {
                                if (!msg.includes(report.MissingOnlyWarningsDimensionsMessage)) {
                                    msg += report.MissingOnlyWarningsDimensionsMessage + '<br/>';
                                }
                            }
                        }
                    }
                });
                if (msg !== '') {
                    this.toastService.toast({
                        title: 'Dimensjon(er) mangler',
                        message: msg + '<br/>Legg til kolonnen Påkrevde dimensjoner for å se mer informasjon.',
                        type: ToastType.warn,
                        duration: 3
                    });
                }
            }
        }
    }

    private getEmptyRow() {
        // Clone to make sure the row is a copy, not a reference
        const row: any = cloneDeep(this.defaultTradeItem);
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
