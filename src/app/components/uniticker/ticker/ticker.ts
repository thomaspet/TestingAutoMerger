import {Component, ViewChild, Input, SimpleChanges, Output, EventEmitter} from '@angular/core';
import {URLSearchParams, Http} from '@angular/http';
import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';
import {UniTabs} from '../../layout/uniTabs/uniTabs';
import {UniQueryDefinition} from '../../../unientities';
import {Router, ActivatedRoute, RouterLink} from '@angular/router';
import {Ticker, TickerGroup, TickerAction, TickerFilter, TickerColumn, IExpressionFilterValue} from '../../../services/common/uniTickerService';
import {StatisticsService, StatusService} from '../../../services/services';
import {AuthService} from '../../../../framework/core/authService';
import {UniHttp} from '../../../../framework/core/http/http';
import {ToastService, ToastType, ToastTime} from '../../../../framework/uniToast/toastService';
import {ErrorService, UniTickerService, ModelService} from '../../../services/services';
import {UniTable, UniTableColumn, IContextMenuItem, UniTableColumnType, UniTableConfig, ITableFilter} from 'unitable-ng2/main';
import {Observable} from 'rxjs/Observable';
import * as moment from 'moment';
import {saveAs} from 'file-saver';

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

    @Output() private rowSelected: EventEmitter<any> = new EventEmitter<any>();
    @ViewChild(UniTable) unitable: UniTable;

    private model: any;

    private currentUserGlobalIdentity: string;
    private selects: string;
    private tableConfig: UniTableConfig;
    private lookupFunction: (urlParams: URLSearchParams) => Observable<any>;
    private prefetchDataLoaded: boolean = false;

    private expressionFilters: Array<IExpressionFilterValue> = [];
    private selectedRow: any = null;

    constructor(private uniHttpService: UniHttp,
        private router: Router,
        private route: ActivatedRoute,
        private tabService: TabService,
        private statisticsService: StatisticsService,
        private toastService: ToastService,
        private authService: AuthService,
        private statusService: StatusService,
        private errorService: ErrorService,
        private uniTickerService: UniTickerService,
        private modelService: ModelService,
        private http: Http) {
        let token = this.authService.getTokenDecoded();
        if (token) {
            this.currentUserGlobalIdentity = token.nameid;

            this.expressionFilters = [];
            this.expressionFilters.push({
                Expression: 'currentuserid',
                Value: this.currentUserGlobalIdentity
            });
        }

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

    private getSearchParams(urlParams: URLSearchParams): URLSearchParams {
        let params = urlParams;

        if (params === null) {
            params = new URLSearchParams();
        }

        params.set('model', this.ticker.Model);
        params.set('select', this.selects);

        if (this.ticker.Expand) {
            params.set('expand', this.ticker.Expand);
        }

        if (this.selectedFilter) {
            let newFilter = '';

            if (this.selectedFilter.Filter && this.selectedFilter.Filter !== '') {
                newFilter = this.selectedFilter.Filter;

                if (newFilter.indexOf(':currentuserid') >= 0) {
                    newFilter = newFilter.replace(':currentuserid', `'${this.currentUserGlobalIdentity}'`);
                }
            } else if (this.selectedFilter.FilterGroups && this.selectedFilter.FilterGroups.length > 0) {
                newFilter =
                    this.uniTickerService.getFilterString(
                        this.selectedFilter.FilterGroups,
                        this.expressionFilters,
                        this.selectedFilter.UseAllCriterias
                    );
            }

            params.set('filter', newFilter);
        }

        // if the ticker has a parent filter (i.e. it is running in the context of another ticker),
        // add the extra filter to the query before executing. This could e.g. be adding a
        // invoiceid when showing a list of invoiceitems
        if (this.ticker.ParentFilter) {
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
        if (this.ticker.Actions
            && this.ticker.Actions.filter(x => x.Type && x.Type.toLowerCase() === 'transition').length > 0) {
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

        if (this.ticker) {
            // run this even if it is not a table, because it prepares the query as well.
            // Consider splitting this function to avoid this later
            this.setupTableConfig();

            let tickerType = this.ticker.Type.toLowerCase();
            if (tickerType === 'table') {
                // let uni-table get its own data
            } else {
                // get detaildata using the same lookupfunction as uni-table, but no point in
                // retrieving more than one row
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
        }
    }

    private letUniTableHandleIsOwnClicks() {
        event.stopPropagation();
    }

    private onDataLoaded(event) {

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

        let allowMultipleRows = action.ExecuteWithMultipleSelections ? true : false;

        if (!action.ExecuteWithoutSelection && selectedRows.length === 0 && !this.selectedRow) {
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

        this.uniTickerService
            .executeAction(
                action,
                this.ticker,
                selectedRows && selectedRows.length > 0 ? selectedRows : [this.selectedRow]
            ).then(() => {
                if (action.Type
                    && (action.Type.toLowerCase() === 'transition' || action.Type.toLowerCase() === 'action')) {
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
    }

    private isFunction(field: string): boolean {
        return field.indexOf('(') > -1 && field.indexOf(')') > -1;
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
                    this.selectedFilter.UseAllCriterias
                );
            } else if (this.selectedFilter.Filter && this.selectedFilter.Filter !== '') {
                return this.selectedFilter.Filter;
            }
        }

        return '';
    }

    private setupTableConfig() {
        this.modelService
            .loadModelCache()
            .then(() => {
                let model = this.modelService.getModel(this.ticker.Model);

                if (!this.ticker.Columns) {
                    // TODO: if no columns are defined, we should get defaults based on the model
                    this.ticker.Columns = [];
                    this.ticker.Columns.push({
                        Field: 'ID',
                        Alias: 'ID',
                        Header: 'ID',
                        CssClass: null,
                        Format: null,
                        SumFunction: null,
                        Type: 'number',
                        Width: null
                    });
                }

                // Define columns to use in the table
                let columns: Array<UniTableColumn> = [];
                let selects: Array<string> = [];

                for (let i = 0; i < this.ticker.Columns.length; i++) {
                    let field = this.ticker.Columns[i];

                    let colName = field.Field;
                    let aliasColName = '';
                    let selectableColName = '';

                    let modelname = (this.ticker.Model ? this.ticker.Model : '');

                    if (this.isFunction(field.Field)) {
                        // for functions, trust that the user knows what he/she is doing...
                        selectableColName = colName;
                        aliasColName = modelname + colName;
                    } else if (field.Field.indexOf('.') > 0) {
                        // get last part of path, e.g. field.Field = Customer.Info.Name, gets "Info" and "Name"
                        let lastIndex = field.Field.lastIndexOf('.');
                        let path = field.Field.substring(0, lastIndex);
                        if (path.indexOf('.') > 0) {
                            lastIndex = path.lastIndexOf('.');
                            path = path.substring(lastIndex + 1);
                        }

                        colName = field.Field.substring(field.Field.lastIndexOf('.') + 1);

                        selectableColName = path + '.' + colName;
                        aliasColName = path + colName;
                    } else {
                        selectableColName = modelname + '.' + colName;
                        aliasColName = modelname + colName;
                    }

                    if (field.SumFunction && selectableColName.indexOf(field.SumFunction) === -1) {
                        selectableColName = `${field.SumFunction}(${selectableColName})`;
                    }

                    // set the Alias we are using in the query to simplify getting the data later on
                    field.Alias = aliasColName;

                    // if not fieldtype is configured for the ticker column, try to find type based on the model
                    // that is retrieved from the API
                    if (model &&  (!field.Type || field.Type === '')) {
                        // TODO: tar ikke hensyn til f.eks. Customer.CustomerNumber her - sjekker bare på hoved nivå.
                        // Må utvide til å også sjekke path og finne modell basert på den
                        let modelField = this.modelService.getField(model, colName);

                        if (modelField) {
                            if (modelField.Type.toString().indexOf('System.Int32') !== -1) {
                                field.Type = 'number';
                            } else if (modelField.Type.toString().indexOf('System.Decimal') !== -1) {
                                field.Type = 'money';
                            } else if (modelField.Type.toString().indexOf('System.DateTime') !== -1
                                        || modelField.Type.toString().indexOf('NodaTime.LocalDate') !== -1) {
                                field.Type = 'date';
                            }
                        }
                    }

                    let colType = UniTableColumnType.Text;

                    if (field.Type && field.Type !== '') {
                        switch (field.Type.toLowerCase()) {
                            case 'number':
                                colType = UniTableColumnType.Number;
                                break;
                            case 'money':
                                colType = UniTableColumnType.Money;
                                break;
                            case 'percent':
                                colType = UniTableColumnType.Percent;
                                break;
                            case 'date':
                            case 'datetime':
                            case 'localdate':
                                colType = UniTableColumnType.LocalDate;
                                break;
                        }
                    }

                    let col = new UniTableColumn(selectableColName, field.Header, colType);
                    col.alias = aliasColName;
                    col.width = field.Width;
                    col.sumFunction = field.SumFunction;

                    if (selectableColName.toLowerCase().endsWith('statuscode')) {
                        col.template = (rowModel) => this.statusCodeToText(rowModel[aliasColName]);
                    }

                    if (field.Type && field.Type.toLowerCase() === 'external-link') {
                        col.setTemplate(row => `<a href="${row[col.alias]}" target="_blank">${row[col.alias]}</a>`);
                    }

                    if (field.Format && field.Format !== '') {
                        // TODO Sett opp flere fornuftige ferdigformater her - f.eks. "NumberPositiveNegative", etc
                        switch (field.Format) {
                            case 'NumberPositiveNegative':
                                col.setConditionalCls(model => model[aliasColName] >= 0 ?
                                    'number-good'
                                    : 'number-bad'
                                );
                                break;
                            case 'DatePassed':
                                col.setConditionalCls(model =>
                                    moment(model[aliasColName]).isBefore(moment()) ?
                                        'date-bad'
                                        : 'date-good'
                                );
                                break;
                            case 'json':
                                col.setTemplate(model => JSON.stringify(model));
                                break;
                        }
                    }



                    columns.push(col);

                    selects.push(selectableColName + ' as ' + aliasColName);
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

                let actionsWithDetailNavigation =
                    !this.ticker.Actions ?
                        []
                        : this.ticker.Actions.filter(st => st.Type
                            && (st.Type.toLowerCase() === 'details'
                                || st.Type.toLowerCase() === 'action'
                                || st.Type.toLowerCase() === 'transition')
                        );

                actionsWithDetailNavigation.forEach(st => {
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

                            if (action.Type.toLowerCase() === 'transition' && !action.Transition) {
                                throw Error('Cannot add action with Type = transition without specifying which Transition to execute');
                            }

                            contextMenuItems.push({
                                label: action.Name,
                                action: (rowModel) => {
                                    this.uniTickerService.executeAction(action, this.ticker, [rowModel]);
                                },
                                disabled: (rowModel) => {
                                    if (action.Type.toLocaleLowerCase() === 'transition') {
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
        let headers = this.ticker.Columns.map(x => x.Header).join(',');
        let params = this.getSearchParams(new URLSearchParams());

        // execute request to create Excel file
        this.statisticsService
            .GetExportedExcelFile(this.ticker.Model, this.selects, params.get('filter'), this.ticker.Expand, headers)
                .subscribe((blob) => {
                    // download file so the user can open it
                    saveAs(blob, 'export.csv');
                },
                err => this.errorService.handle(err));

        completeEvent('Eksport kjørt');
    }
}
