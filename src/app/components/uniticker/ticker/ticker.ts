import {
    Component,
    ViewChild,
    Input,
    SimpleChanges,
    Output,
    EventEmitter,
    ChangeDetectorRef,
    ChangeDetectionStrategy
} from '@angular/core';
import {URLSearchParams, Http} from '@angular/http';
import {TabService} from '../../layout/navbar/tabstrip/tabService';
import {Router, ActivatedRoute} from '@angular/router';
import {
    Ticker,
    TickerAction,
    TickerFilter,
    IExpressionFilterValue,
    ITickerActionOverride,
    ITickerColumnOverride
} from '../../../services/common/uniTickerService';
import {
    UniTable,
    UniTableColumn,
    IContextMenuItem,
    UniTableColumnType,
    UniTableConfig
} from '../../../../framework/ui/unitable/index';
import {StatisticsService, StatusService} from '../../../services/services';
import {UniHttp} from '../../../../framework/core/http/http';
import {ToastService, ToastType, ToastTime} from '../../../../framework/uniToast/toastService';
import {ErrorService, UniTickerService, ApiModelService, ReportDefinitionService} from '../../../services/services';
import {Observable} from 'rxjs/Observable';
import {ImageModal} from '../../common/modals/ImageModal';
import {BrowserStorageService} from '../../../services/common/browserStorageService';
import {UniModalService} from '../../../../framework/uniModal/barrel';
import {UniPreviewModal} from '../../reports/modals/preview/previewModal';

import * as moment from 'moment';
import {saveAs} from 'file-saver';

const PAPERCLIP = '📎'; // It might look empty in your editor, but this is the unicode paperclip

@Component({
    selector: 'uni-ticker',
    templateUrl: './ticker.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UniTicker {
    @Input() public ticker: Ticker;
    @Input() public parentModel: any;
    @Input() public selectedFilter: TickerFilter;
    @Input() public parentTicker: Ticker;
    @Input() public expressionFilters: Array<IExpressionFilterValue> = [];
    @Input() public actionOverrides: Array<ITickerActionOverride> = [];
    @Input() public columnOverrides: Array<ITickerColumnOverride> = [];
    @Input() public unitableSearchVisible: boolean;

    @Output() public rowSelected: EventEmitter<any> = new EventEmitter<any>();
    @Output() public contextMenuItemsChange: EventEmitter<any[]> = new EventEmitter();

    @ViewChild(UniTable) public unitable: UniTable;

    private model: any;

    private selects: string;
    private tableConfig: UniTableConfig;
    private lookupFunction: (urlParams: URLSearchParams) => Observable<any>;
    private prefetchDataLoaded: boolean = false;

    private selectedRow: any = null;
    private canShowTicker: boolean = true;

    private contextMenuItems: any[];
    private openAction: TickerAction;

    private unitableFilter: string;

    constructor(
        private uniHttpService: UniHttp,
        private router: Router,
        private route: ActivatedRoute,
        private tabService: TabService,
        private statisticsService: StatisticsService,
        private toastService: ToastService,
        private statusService: StatusService,
        private errorService: ErrorService,
        private uniTickerService: UniTickerService,
        private modelService: ApiModelService,
        private http: Http,
        private reportDefinitionService: ReportDefinitionService,
        private storageService: BrowserStorageService,
        private cdr: ChangeDetectorRef,
        private modalService: UniModalService
    ) {

        this.statusService
            .loadStatusCache()
            .then(() => {
                this.prefetchDataLoaded = true;
                this.cdr.markForCheck();
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
            let actions = this.getTickerActions();
            this.contextMenuItems = this.actionsToContextMenuItems(actions);

            this.openAction = actions && actions.find(action => {
                return action.Type === 'details' && action.ExecuteWithoutSelection;
            });

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

                this.cdr.markForCheck();
            });

            this.cdr.markForCheck();
        }
    }

    private actionsToContextMenuItems(actions) {
        if (!actions || !actions.length) {
            return;
        }

        let contextMenuItems = actions.map(action => {
            let override = this.actionOverrides.find(x => action.Code === x.Code);
            if ((action.NeedsActionOverride || action.Type === 'action') && !override) {
                console.warn(`Ticker action ${action.Code} not available because of missing action override`);
                return;
            }

            return {
                label: action.Name,
                disabled: () => {
                    if (this.model && override && override.CheckActionIsDisabled !== undefined) {
                        return override.CheckActionIsDisabled([this.model]);
                    }

                    if (action.Type === 'transition' && this.model) {
                        if (!this.model._links) {
                            throw Error('Cannot setup transition action, hateoas is not retrieved');
                        } else if (this.model._links.transitions[action.Options.Transition]) {
                            return true;
                        }
                    }

                    return false;
                },
                action: () => {
                    this.onExecuteAction(action);
                }
            };
        });

        // Filter out undefined items (actions missing override)
        return contextMenuItems.filter(item => !!item);
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
            let uniTableFilter = urlParams.get('filter');
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

            let filter = null;

            if (newFilter && newFilter !== '' && uniTableFilter && uniTableFilter !== '') {
                filter = '(' + uniTableFilter + ' ) and (' + newFilter + ' )';
            } else if (newFilter && newFilter !== '') {
                filter = newFilter;
            } else if (uniTableFilter && uniTableFilter !== '') {
                filter = uniTableFilter;
            }
            params.set('filter', filter);
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

                this.cdr.markForCheck();
            });
    }

    private getTickerActions(): Array<TickerAction> {
        return this.ticker.UseParentTickerActions && this.parentTicker && this.parentTicker.Actions ?
            this.parentTicker.Actions :
            this.ticker.Actions ? this.ticker.Actions : [];
    }

    private onRowSelected(rowSelectEvent) {
        this.selectedRow = rowSelectEvent.rowModel;
        this.rowSelected.emit(this.selectedRow);
    }

    private onFilterChange(filterChangeEvent) {
        this.unitableFilter = filterChangeEvent.filter;
    }

    public onExecuteAction(action: TickerAction) {
        let selectedRows = [];
        if (this.unitable) {
            selectedRows = this.unitable.getSelectedRows();
        }

        if (!action.Type || action.Type === '') {
            throw Error(`No Type defined for action ${action.Name}`);
        }

        let allowMultipleRows =
            action.ExecuteWithMultipleSelections !== undefined ? action.ExecuteWithMultipleSelections : false;
        let allowNoRows =
            action.ExecuteWithoutSelection !== undefined ?  action.ExecuteWithoutSelection : false;

        if (this.ticker.Type === 'details') {
           if (this.model) {
               // if this is a detailticker, "simulate" that the user has selected a row
               // or used the contextmenu in the table to simplify the code below
               this.selectedRow = this.model;
               selectedRows.push(this.model);
           }
        }

        let rowIdentifier = 'ID';
        if ((action.Type === 'details' || action.Type === 'print') && action.Options.ParameterProperty) {
            rowIdentifier = action.Options.ParameterProperty;
        }

        if (!allowNoRows && !selectedRows.length && !this.selectedRow) {
            alert(`Du må velge ${allowMultipleRows ? 'minst en' : 'en'} rad før du trykker ${action.Name}`);
            return;
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

        this.startExecuteAction(action, selectedRows);
    }

    private startExecuteAction(action: TickerAction, selectedRows: Array<any> ) {

        let actionOverride = this.actionOverrides.find(x => x.Code === action.Code);

        if (actionOverride) {
            if (actionOverride.BeforeExecuteActionHandler !== undefined) {
                // if BeforeExecuteActionHandler is specified, check that it returns true
                // or a promise that resolves to true before executing the action
                Promise.resolve(actionOverride.BeforeExecuteActionHandler(selectedRows))
                    .then((result: boolean) => {
                       if (result) {
                           this.executeAction(action, actionOverride, selectedRows);
                       }
                    });
            } else {
                this.executeAction(action, actionOverride, selectedRows);
            }
        } else {
            this.executeAction(action, null, selectedRows);
        }
    }

    private executeAction (action: TickerAction, actionOverride: ITickerActionOverride, selectedRows: Array<any> ) {

        if (actionOverride && actionOverride.ExecuteActionHandler !== undefined) {
            // execute overridden executionhandler instead of the standard actionhandling
            actionOverride.ExecuteActionHandler(selectedRows)
                .then(() => {
                    // refresh table data after actions/transitions are executed
                    this.reloadData();

                    // execute AfterExecuteActionHandler if it is specified
                    this.afterExecuteAction(action, actionOverride, selectedRows);
                });
        } else {
            let actionType = action.Type;
            let rowIdentifier = 'ID';
            if ((action.Type === 'details' || action.Type === 'print') && action.Options.ParameterProperty !== '') {
                rowIdentifier = action.Options.ParameterProperty;
            }

            if (actionType === 'export') {
                this.exportToExcel(() => {});
            } else if (actionType === 'print') {
                if (!action.Options.ReportName) {
                    throw Error('Cannot use action print without specifying Options.ReportName in action ' + action.Name);
                }

                this.reportDefinitionService.getReportByName(action.Options.ReportName).subscribe((report) => {
                    if (report) {
                        let id = this.ticker.Type === 'details'
                            ? this.selectedRow[rowIdentifier]
                            : selectedRows[0][rowIdentifier];
                        report.parameters = [{Name: 'Id', value: id}];

                        this.modalService.open(UniPreviewModal, {
                            data: report
                        });

                        // execute AfterExecuteActionHandler if it is specified
                        this.afterExecuteAction(action, actionOverride, selectedRows);
                    }
                });
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
                            this.reloadData();

                            // execute AfterExecuteActionHandler if it is specified
                            this.afterExecuteAction(action, actionOverride, selectedRows);
                        }
                    })
                    .catch((err) => {
                        this.errorService.handle(err);
                    });
            }
        }
    }

    private reloadData() {
        if (this.unitable) {
            this.unitable.refreshTableData();
        } else {
            this.loadDetailTickerData();
        }
    }

    private afterExecuteAction(action: TickerAction, actionOverride: ITickerActionOverride, selectedRows: Array<any>) {
        if (actionOverride && actionOverride.AfterExecuteActionHandler !== undefined) {
            actionOverride.AfterExecuteActionHandler(selectedRows);
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
                let columns: UniTableColumn[] = [];
                let selects: string[] = [];

                for (let i = 0; i < this.ticker.Columns.length; i++) {
                    let field = this.ticker.Columns[i];

                    selects.push(field.SelectableFieldName + ' as ' + field.Alias);

                    if (field.SubFields) {
                        field.SubFields.forEach(subField => {
                            selects.push(subField.SelectableFieldName + ' as ' + subField.Alias);
                        });
                    }

                    if (field.Type !== 'dontdisplay') {
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
                                    colType = UniTableColumnType.DateTime;
                                    break;
                                case 'attachment':
                                    colType = UniTableColumnType.Text;
                            }
                        }

                        let col = new UniTableColumn(field.SelectableFieldName, field.Header, colType);
                        col.alias = field.Alias;
                        col.width = field.Width;
                        col.isSumColumn = field.SumColumn;
                        col.sumFunction = field.SumFunction;

                        if (field.Type === 'link') {
                            col.headerCls = 'ticker-link-col';
                        }

                        if (field.CssClass) {
                            col.cls = field.CssClass;
                        }

                        let columnOverride = this.columnOverrides.find(x => x.Field === field.Field);
                        if (columnOverride) {
                            col.setTemplate(row => {
                                // use the tickerservice to get and format value based on override template
                                return this.uniTickerService.getFieldValue(field, row, this.ticker, this.columnOverrides);
                            });
                        } else {
                            // set up templates based on rules for e.g. fieldname
                            if (field.SelectableFieldName.toLowerCase().endsWith('statuscode')) {
                                col.template = (rowModel) => this.statusCodeToText(rowModel[field.Alias]);
                            }
                        }

                        if (field.Type === 'external-link') {
                            col.setTemplate(row => {
                                if (row[col.alias] && row[col.alias] !== '') {
                                    return `<a href="${row[col.alias]}" target="_blank">${row[col.alias]}</a>`;
                                }
                                return '';
                            });
                        } else if (field.Type === 'attachment') {
                            col.setTemplate(line => line.Attachments ? PAPERCLIP : '');
                            col.setOnCellClick(row => {
                                if (row.Attachments) {
                                    const entity = field.ExternalModel ? field.ExternalModel : this.ticker.Model;
                                    let data = {
                                        entity: entity,
                                        entityID: row.JournalEntryID
                                    };

                                    this.modalService.open(ImageModal, { data: data });
                                }
                            });
                        }

                        if (field.Type === 'link' || field.Type === 'mailto' || (field.SubFields && field.SubFields.length > 0)) {
                            col.setTemplate(row => {
                                // use the tickerservice to get and format value and subfield values
                                return this.uniTickerService.getFieldValue(field, row, this.ticker, this.columnOverrides);
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
                                    col.setConditionalCls(row => {
                                        return moment(row[field.Alias]).isBefore(moment())
                                            ? 'date-bad'
                                            : 'date-good';
                                    });
                                    break;
                                case 'json':
                                    col.setTemplate(row => JSON.stringify(row));
                                    break;
                            }
                        }

                        if (field.DefaultHidden) {
                            col.setVisible(false);
                        }

                        if(field.FilterOperator === 'startswith' || field.FilterOperator === 'eq' || field.FilterOperator ==='contains') {
                            col.setFilterOperator(field.FilterOperator);
                        } else {
                            col.filterable = false;
                        }

                        if (field.SelectableFieldName.toLowerCase().endsWith('statuscode')) {
                            let statusCodes = this.statusService.getStatusCodesForEntity(this.ticker.Model);
                            if (statusCodes && statusCodes.length > 0) {
                                col.selectConfig = {
                                    options: statusCodes,
                                    dislayField: 'name',
                                    valueField: 'statusCode'
                                };
                            }
                        }

                        columns.push(col);
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
                        || st.Type === 'print'
                    );

                actionsWithDetailNavigation.forEach(st => {
                    let paramSelects = ['ID as ID'];
                    if (st.Options.ParameterProperty !== '') {
                        paramSelects =
                            [`${st.Options.ParameterProperty} as ${st.Options.ParameterProperty.replace('.', '')}`];
                    } else if (st.Options.ParameterProperties && st.Options.ParameterProperties.length) {
                        paramSelects = st.Options.ParameterProperties.map(prop => {
                            return `${prop} as ${prop.replace('.', '')}`;
                        });
                    }

                    selects = [...selects, ...paramSelects.filter(param => !selects.some(x => x === param))];
                });

                let linkFieldsWithNavigationProperty =
                    this.ticker.Columns.filter(x => x.Type === 'link' && x.LinkNavigationProperty);

                linkFieldsWithNavigationProperty.forEach(field => {
                    let paramSelect = `${field.LinkNavigationProperty} as ${field.LinkNavigationProperty.replace('.', '')}`;
                    if (!selects.find(x => x === paramSelect)) {
                        selects.push(paramSelect);
                    }
                });

                let linkFieldWithNavigationProprties = this.ticker.Columns
                    .filter(x => x.Type === 'link'
                        && x.LinkNavigationProperties
                        && x.LinkNavigationProperties.length);

                linkFieldWithNavigationProprties.forEach(field => {
                    let paramSelects = field.LinkNavigationProperties.map(prop => {
                        return `${prop} as ${prop.replace('.', '')}`;
                    });
                    selects = [...selects, ...paramSelects.filter(param => !selects.some(x => x === param))];
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
                            if (action.Type === 'transition' && !action.Options.Transition) {
                                throw Error('Cannot add action with Type = transition without specifying which Transition to execute, action: ' + action.Code);
                            }

                            let actionOverride = this.actionOverrides.find(x => action.Code === x.Code);
                            if (action.NeedsActionOverride && !actionOverride) {
                                // console.log(`Action ${action.Code} needs an ActionOverride to function correctly, and that is not specified`);
                            } else if (action.Type === 'action' && !actionOverride) {
                                // console.log(`Action ${action.Code} not available because of missing action override`);
                            } else {
                                contextMenuItems.push({
                                    label: action.Name,
                                    action: (rowModel) => {
                                        this.startExecuteAction(action, [rowModel]);
                                    },
                                    disabled: (rowModel) => {

                                        if (actionOverride && actionOverride.CheckActionIsDisabled !== undefined) {
                                            return actionOverride.CheckActionIsDisabled([rowModel]);
                                        }

                                        if (action.Type === 'transition') {
                                            if (!rowModel._links) {
                                                throw Error('Cannot setup transition action, hateoas is not retrieved');
                                            } else {
                                                if (!rowModel._links.transitions[action.Options.Transition]) {
                                                    return true;
                                                }
                                            }
                                        }

                                        return false;
                                    }
                                });
                            }
                        }
                    });
                }

                // Setup table
                const configStoreKey = `uniTicker.${this.ticker.Code}`;
                this.tableConfig = new UniTableConfig(configStoreKey, false, true, 20)
                    .setColumns(columns)
                    .setEntityType(this.ticker.Model)
                    .setAllowGroupFilter(true)
                    .setColumnMenuVisible(true)
                    .setSearchable(this.unitableSearchVisible)
                    .setMultiRowSelect(false)
                    .setSearchListVisible(true)
                    .setContextMenu(contextMenuItems, true, false)
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
                    });
        });
    }

    // this function assumes that the unitablesetup has already been run, so that all needed
    // fields are already initialized and configured correctly
    public exportToExcel(completeEvent) {
        let headers = this.ticker.Columns.map(x => x.Header !== PAPERCLIP ? x.Header : 'Vedlegg').join(',');

        // use both predefined filters and additional unitable filters if applicable
        let params = new URLSearchParams();
        if (this.unitableFilter) {
            params.set('filter', this.unitableFilter);
        }

        params = this.getSearchParams(params);
        console.log('filter:', params.get('filter'));
        // execute request to create Excel file
        this.statisticsService
            .GetExportedExcelFile(this.ticker.Model, this.selects, params.get('filter'), this.ticker.Expand, headers, this.ticker.Joins)
                .subscribe((blob) => {
                    // download file so the user can open it
                    saveAs(blob, 'export.xlsx');
                },
                err => this.errorService.handle(err));

        completeEvent('Eksport kjørt');
    }
}
