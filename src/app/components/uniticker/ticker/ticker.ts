import {Component, ViewChild, Input, SimpleChanges, Output, EventEmitter, ChangeDetectionStrategy} from '@angular/core';
import {URLSearchParams, Http} from '@angular/http';
import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';
import {UniTabs} from '../../layout/uniTabs/uniTabs';
import {UniQueryDefinition} from '../../../unientities';
import {Router, ActivatedRoute, RouterLink} from '@angular/router';
import {Ticker, TickerGroup, TickerAction, TickerFilter, TickerColumn, IExpressionFilterValue} from '../../../services/common/uniTickerService';
import {StatisticsService, StatusService} from '../../../services/services';
import {UniHttp} from '../../../../framework/core/http/http';
import {ToastService, ToastType, ToastTime} from '../../../../framework/uniToast/toastService';
import {ErrorService, UniTickerService, ApiModelService} from '../../../services/services';
import {UniTable, UniTableColumn, IContextMenuItem, UniTableColumnType, UniTableConfig, ITableFilter} from 'unitable-ng2/main';
import {Observable} from 'rxjs/Observable';
import {ImageModal} from '../../common/modals/ImageModal';
import {UniConfirmModal, ConfirmActions} from '../../../../framework/modals/confirm';
import * as moment from 'moment';
import {saveAs} from 'file-saver';

const PAPERCLIP = '📎'; // It might look empty in your editor, but this is the unicode paperclip

@Component({
    selector: 'uni-ticker',
    templateUrl: './ticker.html'
})
export class UniTicker {
    @Input() private ticker: Ticker;
    @Input() private showActions: boolean;
    @Input() private showFilters: boolean;
    @Input() private showSubTickers: boolean = false;
    @Input() private expanded: boolean = true;
    @Input() private parentModel: any;
    @Input() private selectedFilter: TickerFilter;
    @Input() private header: string;
    @Input() private parentTicker: Ticker;
    @Input() private expressionFilters: Array<IExpressionFilterValue> = [];

    @Output() private rowSelected: EventEmitter<any> = new EventEmitter<any>();
    @ViewChild(UniTable) unitable: UniTable;
    @ViewChild(UniConfirmModal) private confirmModal: UniConfirmModal;
    @ViewChild(ImageModal) private imageModal: ImageModal;

    private model: any;

    private selects: string;
    private tableConfig: UniTableConfig;
    private lookupFunction: (urlParams: URLSearchParams) => Observable<any>;
    private prefetchDataLoaded: boolean = false;

    private selectedRow: any = null;

    private canShowTicker: boolean = true;

    constructor(private uniHttpService: UniHttp,
        private router: Router,
        private route: ActivatedRoute,
        private tabService: TabService,
        private statisticsService: StatisticsService,
        private toastService: ToastService,
        private statusService: StatusService,
        private errorService: ErrorService,
        private uniTickerService: UniTickerService,
        private modelService: ApiModelService,
        private http: Http) {

        this.statusService
            .loadStatusCache()
            .then(() => {
                this.prefetchDataLoaded = true;
            });

        this.lookupFunction = (urlParams: URLSearchParams) => {
                let params = this.getSearchParams(urlParams);

                if (this.ticker.Model) {
                    return this.statisticsService
                        .GetAllByUrlSearchParams(params)
                        .catch((err, obs) => this.errorService.handleRxCatch(err, obs));
                } else if (this.ticker.ApiUrl) {
                    return this.http
                        .get(this.ticker.ApiUrl);
                }
            };
    }

    private checkCanShowTicker() {
        let canShowTicker = true;

        if (this.ticker.ParentFilter && this.parentModel) {
            if (!this.parentModel[this.ticker.ParentFilter.Value.replace('.', '')]) {
                canShowTicker = false;
            }
        }

        this.canShowTicker = canShowTicker;
    }

    private getSearchParams(urlParams: URLSearchParams): URLSearchParams {
        let params = urlParams;

        if (params === null) {
            params = new URLSearchParams();
        }

        if (params.get('model') && params.get('model') !== this.ticker.Model) {
            params.set('orderby', null);
            params.set('expand', null);
            params.set('join', null);
            params.set('filter', null);
        }

        params.set('model', this.ticker.Model);
        params.set('select', this.selects);

        if (!params.get('orderby')) {
            if (this.selectedFilter && this.selectedFilter.OrderBy) {
                params.set('orderby', this.selectedFilter.OrderBy);
            } else if (this.ticker.OrderBy) {
                params.set('orderby', this.ticker.OrderBy);
            }
        }

        if (this.ticker.Expand) {
            params.set('expand', this.ticker.Expand);
        }

        if (this.ticker.Joins) {
            params.set('join', this.ticker.Joins);
        }

        if (this.selectedFilter) {
            let newFilter = '';

            if (this.selectedFilter.Filter && this.selectedFilter.Filter !== '') {
                newFilter = this.selectedFilter.Filter;

                if (newFilter.indexOf(':currentuserid') >= 0) {
                    let expressionFilterValue = this.expressionFilters.find(x => x.Expression === ':currentuserid');
                    if (expressionFilterValue) {
                        newFilter = newFilter.replace(':currentuserid', `'${expressionFilterValue}'`);
                    }
                }
            } else if (this.selectedFilter.FilterGroups && this.selectedFilter.FilterGroups.length > 0) {
                newFilter =
                    this.uniTickerService.getFilterString(
                        this.selectedFilter.FilterGroups,
                        this.expressionFilters,
                        this.selectedFilter.UseAllCriterias,
                        this.ticker.Model
                    );
            }

            params.set('filter', newFilter);
        }

        // if the ticker has a parent filter (i.e. it is running in the context of another ticker),
        // add the extra filter to the query before executing. This could e.g. be adding a
        // invoiceid when showing a list of invoiceitems
        if (this.ticker.ParentFilter && this.parentModel) {
            let currentFilter = params.get('filter');

            let parentFilter =
                `${this.ticker.ParentFilter.Field} ` +
                `${this.ticker.ParentFilter.Operator} ` +
                `${this.parentModel[this.ticker.ParentFilter.Value.replace('.', '')]}`;

            if (currentFilter && currentFilter !== '') {
                currentFilter += ' and ' + parentFilter;
            } else {
                currentFilter = parentFilter;
            }

            params.set('filter', currentFilter);
        }

        // if we have actions that are transitions we need to add hateoas to the data to be able to
        // analyse if a transition is valid
        let actions = this.getTickerActions();
        if (actions.filter(x => x.Type === 'transition').length > 0) {
            params.set('hateoas', 'true');
        }

        return params;
    }

    public ngOnChanges(changes: SimpleChanges) {
        if (changes['ticker']) {
            // if ticker was changed, check that the selectedFilter is
            if (this.selectedFilter) {
                if (!this.ticker.Filters.find(
                        x => x.Code === this.selectedFilter.Code &&
                        x.Filter === this.selectedFilter.Filter)) {
                    this.selectedFilter = null;
                }
            }
        }

        if (changes['selectedFilter'] || (this.selectedFilter && !this.selectedFilter.IsActive)) {
            if (this.selectedFilter) {
                if (this.ticker && this.ticker.Filters && this.ticker.Filters.length > 0) {
                    this.ticker.Filters.forEach(x => {
                        if (x.Code !== this.selectedFilter.Code) {
                            x.IsActive = false;
                        }
                    });
                }

                this.selectedFilter.IsActive = true;
            }
        }

        // if we depend on parent filters or some other parameters, check that we are able to
        // to get data before trying
        this.checkCanShowTicker();

        if (this.canShowTicker && this.ticker) {
            // run this even if it is not a table, because it prepares the query as well.
            // Consider splitting this function to avoid this later
            this.setupTableConfig().then(() => {
                let tickerType = this.ticker.Type;
                if (tickerType === 'table') {
                    // let uni-table get its own data
                } else {
                    // get detaildata using the same lookupfunction as uni-table, but no point in
                    // retrieving more than one row
                    this.loadDetailTickerData();
                }
            });
        }
    }

    private loadDetailTickerData() {
        this.lookupFunction(new URLSearchParams('top=1'))
            .map(data => data.json())
            .map(data => data.Data ? data.Data : [])
            .subscribe(data => {
                if (data && data.length > 0) {
                    this.model = data[0];
                } else {
                    this.model = null;
                }
            });
    }

    private letUniTableHandleIsOwnClicks() {
        event.stopPropagation();
    }

    private getTickerActions() : Array<TickerAction> {
        return this.ticker.UseParentTickerActions && this.parentTicker && this.parentTicker.Actions ?
            this.parentTicker.Actions :
            this.ticker.Actions ? this.ticker.Actions : [];
    }

    private onRowSelected(rowSelectEvent) {
        this.selectedRow = rowSelectEvent.rowModel;
        this.rowSelected.emit(this.selectedRow);
    }

    private onExecuteAction(action: TickerAction) {
        let selectedRows = [];
        if (this.unitable) {
            selectedRows = this.unitable.getSelectedRows();
        }

        if (!action.Type || action.Type === '') {
            throw Error(`No Type defined for action ${action.Name}`);
        }

        let actionType = action.Type;

        let allowMultipleRows =
            action.ExecuteWithMultipleSelections !== undefined ? action.ExecuteWithMultipleSelections : false;
        let allowNoRows =
            action.ExecuteWithoutSelection !== undefined ?  action.ExecuteWithoutSelection : false;

        if (this.ticker.Type === 'details') {
           if (this.model) {
               this.selectedRow = this.model;
           }
        }

        if (!allowNoRows && selectedRows.length === 0 && !this.selectedRow) {
            if (this.unitable) {
                let allRows: Array<any> = this.unitable.getTableData();
                let hasMultipleIDs = false;
                let lastID = null;

                let rowIdentifier = 'ID';
                if (action.Type === 'details' && action.ParameterProperty !== '') {
                    rowIdentifier = action.ParameterProperty;
                }

                for (let i = 0; i < allRows.length && !hasMultipleIDs; i++) {
                    let row = allRows[i];

                    if (lastID && row[rowIdentifier] !== lastID) {
                        hasMultipleIDs = true;
                    }

                    lastID = row[rowIdentifier];

                    if (hasMultipleIDs) {
                        alert(`Du må velge ${allowMultipleRows ? 'minst en' : 'en'} rad før du trykker ${action.Name}`);
                        return;
                    }
                }

                // we havent selected any rows, but all rows have the same identifier (normally ID, but this
                // can be overridden), so we just create a simulated selectedRow and run the action - this will
                // normally just occur if you only have one row in the table, or if we are using a list ticker
                // as a subticker with filter for the identifier property
                let selectedRow = {};
                selectedRow[rowIdentifier] = lastID;
                this.selectedRow = selectedRow;
            } else {
                alert(`Du må velge ${allowMultipleRows ? 'minst en' : 'en'} rad før du trykker ${action.Name}`);
                return;
            }
        }

        if (!allowMultipleRows && selectedRows.length > 1) {
            alert(`Du kan ikke velge flere rader når du trykker ${action.Name}`);
            return;
        }

        if (action.ConfirmBeforeExecuteMessage && action.ConfirmBeforeExecuteMessage !== '') {
            if (!confirm(action.ConfirmBeforeExecuteMessage)) {
                return;
            }
        }

        if (actionType === 'export') {
            this.exportToExcel(() => {});
        } else {
            this.uniTickerService
                .executeAction(
                    action,
                    this.ticker,
                    selectedRows && selectedRows.length > 0 ? selectedRows : [this.selectedRow]
                ).then(() => {
                    if (action.Type
                        && (action.Type === 'transition' || action.Type === 'action')) {
                        this.toastService.addToast(
                            `Ferdig med å kjøre oppgaven ${action.Name}`,
                            ToastType.good,
                            ToastTime.short,
                            '');

                        // refresh table data after actions/transitions are executed
                        if (this.unitable) {
                            this.unitable.refreshTableData();
                        } else {
                            this.loadDetailTickerData();
                        }
                    }
                })
                .catch((err) => {
                    this.errorService.handle(err);
                });
        }
    }

    private statusCodeToText(statusCode: number): string {
        let text: string = this.statusService.getStatusText(statusCode);
        return text || (statusCode ? statusCode.toString() : '');
    }

    private getFilterText() {
        if (this.selectedFilter) {
            if (this.selectedFilter.FilterGroups && this.selectedFilter.FilterGroups.length > 0) {
                return this.uniTickerService.getFilterString(
                    this.selectedFilter.FilterGroups,
                    [],
                    this.selectedFilter.UseAllCriterias,
                    this.ticker.Model
                );
            } else if (this.selectedFilter.Filter && this.selectedFilter.Filter !== '') {
                return this.selectedFilter.Filter;
            }
        }

        return '';
    }

    private setupTableConfig(): Promise<any> {
        return this.modelService
            .loadModelCache()
            .then(() => {
                let model = this.modelService.getModel(this.ticker.Model);

                if (!this.ticker.Columns) {
                    // TODO: if no columns are defined, we should get defaults based on the model
                    this.ticker.Columns = [];
                    this.ticker.Columns.push({
                        Field: 'ID',
                        SelectableFieldName: 'ID',
                        Alias: 'ID',
                        Header: 'ID',
                        CssClass: null,
                        Format: null,
                        SumFunction: null,
                        Type: 'number',
                        Width: null,
                        ExternalModel: null,
                        SubFields: null
                    });
                }

                // Define columns to use in the table
                let columns: Array<UniTableColumn> = [];
                let selects: Array<string> = [];

                for (let i = 0; i < this.ticker.Columns.length; i++) {
                    let field = this.ticker.Columns[i];

                    let colType = UniTableColumnType.Text;

                    if (field.Type !== '') {
                        switch (field.Type) {
                            case 'number':
                                colType = UniTableColumnType.Number;
                                break;
                            case 'money':
                                colType = UniTableColumnType.Money;
                                break;
                            case 'percent':
                                colType = UniTableColumnType.Percent;
                                break;
                            case 'boolean':
                                colType = UniTableColumnType.Boolean;
                                break;
                            case 'date':
                            case 'datetime':
                            case 'localdate':
                                colType = UniTableColumnType.LocalDate;
                                break;
                            case 'attachment':
                                colType = UniTableColumnType.Text;
                        }
                    }

                    let col = new UniTableColumn(field.SelectableFieldName, field.Header, colType);
                    col.alias = field.Alias;
                    col.width = field.Width;
                    col.sumFunction = field.SumFunction;

                    if (field.SelectableFieldName.toLowerCase().endsWith('statuscode')) {
                        col.template = (rowModel) => this.statusCodeToText(rowModel[field.Alias]);
                    }

                    if (field.Type === 'external-link') {
                        col.setTemplate(row => {
                            if (row[col.alias] && row[col.alias] !== '') {
                                return `<a href="${row[col.alias]}" target="_blank">${row[col.alias]}</a>`;
                            }
                            return '';
                        });
                    } else if (field.Type === 'attachment') {
                        col.setTemplate(line => line.Attachments ? PAPERCLIP : '')
                            .setOnCellClick(line =>
                                this.imageModal.open(
                                    field.ExternalModel ? field.ExternalModel : this.ticker.Model,
                                    line.JournalEntryID)
                            );
                    }

                    if (field.Type === 'link' || field.Type === 'mailto' || (field.SubFields && field.SubFields.length > 0)) {
                        col.setTemplate(row => {
                            // use the tickerservice to get and format value and subfield values
                            return this.uniTickerService.getFieldValue(field, row, this.ticker);
                        });
                    }

                    if (field.Format && field.Format !== '') {
                        // TODO Sett opp flere fornuftige ferdigformater her - f.eks. "NumberPositiveNegative", etc
                        switch (field.Format) {
                            case 'NumberPositiveNegative':
                                col.setConditionalCls(row => row[field.Alias] >= 0 ?
                                    'number-good'
                                    : 'number-bad'
                                );
                                break;
                            case 'DatePassed':
                                col.setConditionalCls(row =>
                                    moment(row[field.Alias]).isBefore(moment()) ?
                                        'date-bad'
                                        : 'date-good'
                                );
                                break;
                            case 'json':
                                col.setTemplate(row => JSON.stringify(row));
                                break;
                        }
                    }

                    if (field.DefaultHidden) {
                        col.setVisible(false);
                    }

                    columns.push(col);
                    selects.push(field.SelectableFieldName + ' as ' + field.Alias);

                    if (field.SubFields) {
                        field.SubFields.forEach(subField => {
                            selects.push(subField.SelectableFieldName + ' as ' + subField.Alias);
                        });
                    }
                }

                // if any subtickers exists, and any of them need info from the parent (i.e. this component),
                // make sure we have this data available in the query. This means that we e.g. add a select
                // for ID, even though that does not exist in the ticker
                let subTickersWithParentFilter =
                    !this.ticker.SubTickers ?
                        []
                        : this.ticker.SubTickers.filter(st => st.ParentFilter && st.ParentFilter.Value);

                subTickersWithParentFilter.forEach(st => {
                    let paramAlias = st.ParentFilter.Value.replace('.', '');
                    let paramSelect = st.ParentFilter.Value + ' as ' + paramAlias;

                    if (!selects.find(x => x === paramSelect)) {
                        selects.push(paramSelect);
                    }
                });

                let actionsWithDetailNavigation: Array<TickerAction> = [];
                actionsWithDetailNavigation =
                    this.getTickerActions().filter(st =>
                        st.Type === 'details'
                        || st.Type === 'action'
                        || st.Type === 'transition'
                    );

                actionsWithDetailNavigation.forEach(st => {
                    let paramSelect = 'ID as ID';
                    if (st.ParameterProperty !== '') {
                        paramSelect = `${st.ParameterProperty} as ${st.ParameterProperty.replace('.', '')}`;
                    }

                    if (!selects.find(x => x === paramSelect)) {
                        selects.push(paramSelect);
                    }
                });

                let linkFieldsWithNavigationProperty =
                    this.ticker.Columns.filter(x => x.Type === 'link' && x.LinkNavigationProperty);

                linkFieldsWithNavigationProperty.forEach(field => {
                    let paramSelect = `${field.LinkNavigationProperty} as ${field.LinkNavigationProperty.replace('.', '')}`;
                    if (!selects.find(x => x === paramSelect)) {
                        selects.push(paramSelect);
                    }
                });

                let linkFieldsWithoutNavigationProperty =
                    this.ticker.Columns.filter(x => x.Type === 'link' && !x.LinkNavigationProperty);

                linkFieldsWithoutNavigationProperty.forEach(field => {
                    let paramSelect = 'ID as ID';
                    if (!selects.find(x => x === paramSelect)) {
                        selects.push(paramSelect);
                    }
                });

                this.selects = selects.join(',');

                let contextMenuItems: IContextMenuItem[] = [];
                if (this.ticker.Actions) {
                    this.ticker.Actions.forEach(action => {
                        if (action.DisplayInContextMenu) {

                            if (action.Type === 'transition' && !action.Transition) {
                                throw Error('Cannot add action with Type = transition without specifying which Transition to execute');
                            }

                            contextMenuItems.push({
                                label: action.Name,
                                action: (rowModel) => {
                                    this.uniTickerService
                                        .executeAction(action, this.ticker, [rowModel])
                                        .then(() => {
                                            if (action.Type === 'transition' || action.Type === 'action') {
                                                this.toastService.addToast(
                                                    `Ferdig med å kjøre oppgaven ${action.Name}`,
                                                    ToastType.good,
                                                    ToastTime.short,
                                                    '');

                                                // refresh table data after actions/transitions are executed
                                                if (this.unitable) {
                                                    this.unitable.refreshTableData();
                                                }
                                            }
                                        })
                                        .catch((err) => {
                                            this.errorService.handle(err);
                                        });
                                },
                                disabled: (rowModel) => {
                                    if (action.Type === 'transition') {
                                        if (!rowModel._links) {
                                            throw Error('Cannot setup transition action, hateoas is not retrieved');
                                        } else {
                                            if (!rowModel._links.transitions[action.Transition]) {
                                                return true;
                                            }
                                        }
                                    }

                                    return false;
                                }
                            });
                        }
                    });
                }

                // Setup table
                this.tableConfig = new UniTableConfig(false, true, 20)
                    .setAllowGroupFilter(true)
                    .setAllowConfigChanges(true)
                    .setColumnMenuVisible(true)
                    .setSearchable(false)
                    .setMultiRowSelect(true)
                    .setDataMapper((data) => {
                        if (this.ticker.Model) {
                            let tmp = data !== null ? data.Data : [];

                            if (data !== null && data.Message !== null && data.Message !== '') {
                                this.toastService.addToast('Feil ved henting av data, ' + data.Message, ToastType.bad);
                            }

                            return tmp;
                        } else {
                            if (this.ticker.ListObject && this.ticker.ListObject !== '') {
                                return data[this.ticker.ListObject];
                            }

                            return data;
                        }
                    })
                    .setContextMenu(contextMenuItems, true, false)
                    .setColumns(columns);

        });
    }

    // this function assumes that the unitablesetup has already been run, so that all needed
    // fields are already initialized and configured correctly
    public exportToExcel(completeEvent) {
        let headers = this.ticker.Columns.map(x => x.Header !== PAPERCLIP ? x.Header : 'Vedlegg').join(',');
        let params = this.getSearchParams(new URLSearchParams());

        // execute request to create Excel file
        this.statisticsService
            .GetExportedExcelFile(this.ticker.Model, this.selects, params.get('filter'), this.ticker.Expand, headers, this.ticker.Joins)
                .subscribe((blob) => {
                    // download file so the user can open it
                    saveAs(blob, 'export.csv');
                },
                err => this.errorService.handle(err));

        completeEvent('Eksport kjørt');
    }
}
