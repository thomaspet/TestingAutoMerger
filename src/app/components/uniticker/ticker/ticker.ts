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
import {HttpParams} from '@angular/common/http';

import {Router} from '@angular/router';
import {
    Ticker,
    TickerAction,
    TickerColumn,
    TickerFilter,
    IExpressionFilterValue,
    ITickerActionOverride,
    ITickerColumnOverride
} from '../../../services/common/uniTickerService';
import {
    UniTableColumn,
    IContextMenuItem,
    UniTableColumnType,
    UniTableConfig,
} from '../../../../framework/ui/unitable/index';
import {AgGridWrapper} from '@uni-framework/ui/ag-grid/ag-grid-wrapper';
import {TableUtils} from '@uni-framework/ui/ag-grid/services/table-utils';
import {
    StatisticsService,
    StatusService,
    FinancialYearService,
    CompanySettingsService,
    ReportDefinitionParameterService,
    CustomDimensionService,
    EmployeeTaxCardService,
} from '../../../services/services';
import {ToastService, ToastType, ToastTime} from '../../../../framework/uniToast/toastService';
import {ErrorService, UniTickerService, ApiModelService, ReportDefinitionService} from '../../../services/services';
import { Observable, empty, forkJoin } from 'rxjs';
import {ImageModal} from '../../common/modals/ImageModal';
import {UniModalService, UniPreviewModal} from '../../../../framework/uni-modal';
import {GetPrintStatusText, GetPaymentStatusText} from '../../../models/printStatus';
import {SharingType, StatusCodeSharing} from '../../../unientities';

import * as moment from 'moment';
import {saveAs} from 'file-saver';
import { map, catchError } from 'rxjs/operators';
const PAPERCLIP = '📎'; // It might look empty in your editor, but this is the unicode paperclip
import * as _ from 'lodash';

import {ColumnTemplateOverrides} from './column-template-overrides';
import {TickerTableConfigOverrides} from './table-config-overrides';
import {FeaturePermissionService} from '@app/featurePermissionService';
import {theme, THEMES} from 'src/themes/theme';

export const SharingTypeText = [
    {ID: 0, Title: 'Bruk utsendelsesplan'},
    {ID: SharingType.AP, Title: 'Aksesspunkt'},
    {ID: SharingType.Email, Title: 'E-post'},
    {ID: SharingType.Export, Title: 'Eksport'},
    {ID: SharingType.Vipps, Title: 'Vipps faktura'},
    {ID: SharingType.Print, Title: 'Utskrift'},
    {ID: SharingType.InvoicePrint, Title: 'Fakturaprint (fra Nets)'},
    {ID: SharingType.Factoring, Title: 'Factoring'},
    {ID: SharingType.Efaktura, Title: 'Efaktura'},
    {ID: SharingType.Avtalegiro, Title: 'Avtalegiro'}
];

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

    @Output() public rowSelected: EventEmitter<any> = new EventEmitter<any>();
    @Output() public rowSelectionChange: EventEmitter<any> = new EventEmitter();
    @Output() public contextMenuItemsChange: EventEmitter<any[]> = new EventEmitter();
    @Output() public editModeToggled: EventEmitter<boolean> = new EventEmitter();

    @ViewChild(AgGridWrapper) public table: AgGridWrapper;

    public model: any;

    private selects: string;
    private headers: string;
    private defaultExpand: string;
    public tableConfig: UniTableConfig;
    public prefetchDataLoaded: boolean = false;
    public resource: any;
    public lookupFunction: (urlParams: HttpParams) => Observable<any>;
    public columnSumResolver: (urlParams: HttpParams) => Observable<{[field: string]: number}>;

    private selectedRow: any = null;
    public canShowTicker: boolean = true;

    public contextMenuItems: any[];
    public openAction: TickerAction;
    public newWithEntityAction: TickerAction;

    public unitableFilter: string;
    public publicParams: HttpParams;
    public groupingIsOn: boolean = false;
    public groupFilter: string = '';

    public busy: boolean = false;
    public customDimensionsMetadata = [];
    public lastFilterParams = null;

    constructor(
        private permissionService: FeaturePermissionService,
        private router: Router,
        private statisticsService: StatisticsService,
        private toastService: ToastService,
        private statusService: StatusService,
        private errorService: ErrorService,
        private uniTickerService: UniTickerService,
        private modelService: ApiModelService,
        private reportDefinitionService: ReportDefinitionService,
        private cdr: ChangeDetectorRef,
        private modalService: UniModalService,
        private tableUtils: TableUtils,
        private financialYearService: FinancialYearService,
        private companySettingsService: CompanySettingsService,
        private reportDefinitionParameterService: ReportDefinitionParameterService,
        private customDimensionService: CustomDimensionService,
        private taxService: EmployeeTaxCardService,
    ) {
        this.lookupFunction = (urlParams: HttpParams) => {
            this.publicParams = urlParams;
            this.groupFilter = urlParams.get('filter');
            const params = this.getSearchParams(urlParams);
            if (this.ticker.Model) {
                this.lastFilterParams = params;
                return this.statisticsService
                    .GetAllByHttpParams(params, this.ticker.Distinct || false)
                    .pipe(
                        catchError(() => empty()), // fail silently
                        map(response => {
                            if (this.ticker.Expand.indexOf('MandatoryDimensions') > -1) {
                                const body = response.body;
                                const list = body.Data;
                                const grouppedList = this.groupMandatoryDimensions(list);
                                response = response.clone({ body: grouppedList });
                            }

                            return response;
                        })
                    );
            }
        };

        this.columnSumResolver = (urlParams) => {
            if (!this.ticker || !this.ticker.Columns) {
                return;
            }

            // Build sum selects based on ticker columns with SumColumn = true
            const sumColumns = this.ticker.Columns.filter(col => col.SumColumn);
            if (!sumColumns || !sumColumns.length) {
                return Observable.of(undefined);
            }

            const selects = sumColumns.map(sumCol => {
                return `sum(${sumCol.SelectableFieldName}) as ${sumCol.DisplayField || sumCol.Alias || sumCol.Field}`;
            });

            const tickerParams = this.getSearchParams(urlParams);
            let sumParams = new HttpParams()
                .set('model', tickerParams.get('model'))
                .set('filter', tickerParams.get('filter') || '')
                .set('expand', tickerParams.get('expand') || '')
                .set('select', selects.join(','));

            if (this.ticker.Code !== 'supplierinvoice_list' && this.ticker.Code !== 'new_supplierinvoice_list') {
                sumParams = sumParams.set('join', tickerParams.get('join') || '');
            }

            return this.statisticsService.GetAllByHttpParams(sumParams)
                .map(res => res.body)
                .map(res => (res.Data && res.Data[0]) || []);
        };
    }

    public groupMandatoryDimensions(list: any[]) {
        const data = [];
        for (let i = 0; i < list.length; i++) {
            const item = data.find(x => x.ID === list[i].ID);
            if (item) {
                // add mandatory dimension
                item.MandatoryDimensions.push({
                    DimensionNo: list[i].MandatoryDimensionsDimensionNo,
                    MandatoryType: list[i].MandatoryDimensionsMandatoryType
                });
            } else {
                // push new item to data and add mandatory dimension
                data.push(list[i]);
                list[i].MandatoryDimensions = [];
                list[i].MandatoryDimensions.push({
                    DimensionNo: list[i].MandatoryDimensionsDimensionNo,
                    MandatoryType: list[i].MandatoryDimensionsMandatoryType
                });
            }
        }
        return data;
    }

    public turnGroupingOnOff() {
        this.groupingIsOn = !this.groupingIsOn;
        this.tableConfig = this.buildTableConfig();
        if (this.groupingIsOn) {
            this.getGroupingData();
        }

        this.cdr.markForCheck();
    }

    public getGroupingData() {
        let searchParams = this.publicParams || new HttpParams();
        const TOP: number = 5000;

        searchParams = searchParams.set('top', TOP.toString());
        searchParams = searchParams.delete('hateoas');

        if (this.groupFilter) {
            searchParams = searchParams.set('filter', this.groupFilter);
        } else {
            searchParams = searchParams.delete('filter');
        }

        searchParams = this.getSearchParams(searchParams);

        const countSearchParams = new HttpParams()
            .set('select', 'count(ID) as count')
            .set('filter', searchParams.get('filter') || '')
            .set('model', searchParams.get('model') || '')
            .set('join', searchParams.get('join') || '')
            .set('expand', searchParams.get('expand') || '');

        Observable.forkJoin(
            this.statisticsService.GetAllByHttpParams(searchParams),
            this.statisticsService.GetAllByHttpParams(countSearchParams)
        ).subscribe((res: any) => {
            const result = res[0].body;
            const counter = res[1].body;
            if (counter && counter.Data && counter.Data[0].count > TOP) {
                this.toastService.addToast('For mye data', ToastType.warn, 8,
                `Du har prøvd å hente ut for mye data. Vi har returnert de ${TOP} første linjene. ` +
                `Tilpass søket ditt for å bedre datasettet`);
            }
            this.resource = result.Data;
            this.cdr.markForCheck();
        });
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

        if (changes['parentModel'] && this.parentModel && this.table) {
            this.table.refreshTableData();
        }

        // if we depend on parent filters or some other parameters, check that we are able to
        // to get data before trying
        this.checkCanShowTicker();

        if (this.canShowTicker && this.ticker) {
            const actions = this.getTickerActions();
            this.contextMenuItems = this.actionsToContextMenuItems(actions);

            this.openAction = actions && actions.find(action => {
                return action.Type === 'details' && action.ExecuteWithoutSelection;
            });

            this.newWithEntityAction = actions && actions.find(action => {
                return action.Type === 'newwithentityaction';
            });

            // locally store the default expand from .json to revert to it when user changes column setup
            this.defaultExpand = this.ticker.Expand;
            this.headers = '';

            // run this even if it is not a table, because it prepares the query as well.
            // Consider splitting this function to avoid this later
            this.busy = true;
            this.statusService.loadStatusCache().then(() => {
                this.prefetchDataLoaded = true;

                this.setupTableConfig().then(() => {
                    const tickerType = this.ticker.Type;
                    if (tickerType === 'table') {
                        if (this.tableConfig) {
                            const customerNrCol = this.tableConfig.columns.find(x => x.header === 'Kundenr.');
                            if (customerNrCol) {
                                customerNrCol.setTemplate(x => {
                                    if (x.CustomerStatusCode === 20001) {
                                        return 'Potensiell kunde';
                                    }
                                    return x.CustomerCustomerNumber;
                                });
                            }
                        }
                        if (this.groupingIsOn) {
                            this.getGroupingData();
                        }
                        // else let uni-table get its own data
                    } else {
                        // get detaildata using the same lookupfunction as uni-table, but no point in
                        // retrieving more than one row
                        this.loadDetailTickerData();
                    }

                    this.cdr.markForCheck();
                });
            });

            this.cdr.markForCheck();
        }
    }

    public onTableReady() {
        this.busy = false;
    }

    public openNewWithEntity(action) {
        if (action && this.parentModel) {
            let url = action.Route + this.parentModel.ID;
            url += this.parentModel.ProjectID ? ';projectID=' + this.parentModel.ProjectID : '';
            this.router.navigateByUrl(url);
        }
    }

    public actionsToContextMenuItems(actions) {
        if (!actions || !actions.length) {
            return;
        }

        const contextMenuItems = actions.map(action => {
            const override = this.actionOverrides && this.actionOverrides.find(x => action.Code === x.Code);
            if ((action.NeedsActionOverride || action.Type === 'action') && !override) {
                console.warn(`Ticker action ${action.Code} not available because of missing action override`);
                return;
            }

            return {
                label: action.Name,
                disabled: () => {
                    if (this.model && override && override.CheckActionIsDisabled) {
                        return override.CheckActionIsDisabled(this.model);
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

    private getSearchParams(urlParams: HttpParams): HttpParams {
        let params = urlParams || new HttpParams;

        if (params.get('model') && params.get('model') !== this.ticker.Model) {
            params = params
                .delete('orderby')
                .delete('expand')
                .delete('join')
                .delete('filter');
        }


        params = params.set('model', this.ticker.Model);
        params = params.set('select', this.ticker.Select || this.selects);

        if (!params.get('orderby')) {
            if (this.selectedFilter && this.selectedFilter.OrderBy) {
                params = params.set('orderby', this.selectedFilter.OrderBy);
            } else if (this.ticker.OrderBy) {
                params = params.set('orderby', this.ticker.OrderBy);
            }
        } else { // Hack for MandatoryDimensions
            const orderbyParams: string = params.get('orderby');
            if (orderbyParams.includes('MandatoryDimensions')) {
                const direction = orderbyParams.includes('asc') ? 'asc' : 'desc';
                const newOrderByMandatoryType = 'MandatoryDimensions.MandatoryType '
                    + (orderbyParams.includes('MandatoryType') ? 'desc' : 'asc');
                const newOrderByDimension = 'MandatoryDimensions.DimensionNo ' + direction;
                params = params.set('orderby', [newOrderByDimension, newOrderByMandatoryType].join(','));
            }
        }

        if (this.ticker.Expand) {
            if (this.ticker.AvoidAutoExpand) {
                this.ticker.Expand = this.defaultExpand;
            }
            params = params.set('expand', this.ticker.Expand);
        }

        if (this.ticker.Joins) {
            params = params.set('join', this.ticker.Joins);
        }

        if (this.ticker.Filter) {
            let filter = urlParams.get('filter');
            if (filter && filter !== '') {
                filter += ' and ' + this.ticker.Filter;
            } else {
                filter = this.ticker.Filter;
            }

            if (filter.indexOf(':currentaccountingyear') >= 0) {
                this.setCurrentAccountingYearInFilter(filter, params);
            } else {
                params = params.set('filter', filter);
            }
        }

        if (this.selectedFilter) {
            const uniTableFilter = params.get('filter');
            let tickerFilter = this.ticker.Filter;

            if (this.selectedFilter.Filter) {
                tickerFilter = this.selectedFilter.Filter || this.ticker.Filter;

                if (tickerFilter.indexOf(':currentuserid') >= 0) {
                    const expressionFilterValue = this.expressionFilters.find(x => x.Expression === ':currentuserid');
                    if (expressionFilterValue) {
                        tickerFilter = tickerFilter.replace(':currentuserid', `'${expressionFilterValue}'`);
                    }
                }
            } else if (this.selectedFilter.FilterGroups && this.selectedFilter.FilterGroups.length > 0) {
                tickerFilter =
                    this.uniTickerService.getFilterString(
                        this.selectedFilter.FilterGroups,
                        this.expressionFilters,
                        this.selectedFilter.UseAllCriterias,
                        this.ticker.Model
                    );
            }

            let filter = null;

            if (uniTableFilter && typeof uniTableFilter === 'string') {
                if (tickerFilter && !uniTableFilter.includes(tickerFilter)) {
                    filter = `(${uniTableFilter} ) and (${tickerFilter} )`;
                } else {
                    filter = uniTableFilter;
                }
            } else if (tickerFilter) {
                filter = tickerFilter;
            }

            if (filter) {
                params = params.set('filter', filter);
            }
        }

        // if the ticker has a parent filter (i.e. it is running in the context of another ticker),
        // add the extra filter to the query before executing. This could e.g. be adding a
        // invoiceid when showing a list of invoiceitems
        if (this.ticker.ParentFilter && this.parentModel) {
            let currentFilter = params.get('filter');

            // Parent filter
            const parentFilter =
                `${this.ticker.ParentFilter.Field} ` +
                `${this.ticker.ParentFilter.Operator} ` +
                `${this.parentModel[this.ticker.ParentFilter.Value.replace('.', '')]}`;

            if (currentFilter && currentFilter !== '') {
                currentFilter += ' and ' + parentFilter;
            } else {
                currentFilter = parentFilter;
            }

            params = params.set('filter', currentFilter);
        }

        // if we have actions that are transitions we need to add hateoas to the data to be able to
        // analyse if a transition is valid
        const actions = this.getTickerActions();
        if (actions.filter(x => x.Type === 'transition').length > 0) {
            params = params.set('hateoas', 'true');
        }

        return params;
    }

    private setCurrentAccountingYearInFilter(filter: string, urlParams: HttpParams)  {
        let params = urlParams;
        const expFilterVal = this.expressionFilters.find(x => x.Expression === 'currentaccountingyear');
        if (expFilterVal) {
            filter = filter.replace(':currentaccountingyear', `${expFilterVal.Value}`);
            params = params.set('filter', filter);
        } else {
            const currentAccountingYear = this.financialYearService.getActiveYear().toString();
            this.expressionFilters.push({
                Expression: 'currentaccountingyear',
                Value: currentAccountingYear
            });
            filter = filter.replace(':currentaccountingyear', currentAccountingYear);
            params = params.set('filter', filter);
        }
    }

    private loadDetailTickerData() {
        const params = new HttpParams().set('top', '1');
        this.lookupFunction(params)
            .map(data => data.body)
            .map(data => data.Data ? data.Data : [])
            .subscribe(data => {
                if (data && data.length > 0) {
                    this.model = data[0];
                } else {
                    this.model = null;
                }
                this.busy = false;
                this.cdr.markForCheck();
            });
    }

    private getTickerActions(): Array<TickerAction> {
        return this.ticker.UseParentTickerActions && this.parentTicker && this.parentTicker.Actions ?
            this.parentTicker.Actions :
            this.ticker.Actions ? this.ticker.Actions : [];
    }

    public onRowClick(row) {
        this.selectedRow = row;
        this.selectedRow._editable = this.tableConfig.editable;
        this.rowSelected.emit(this.selectedRow);
    }

    public onRowSelectionChange(selection) {
        if (Array.isArray(selection)) {
            this.rowSelectionChange.emit(selection);
        }
    }

    public filtersChangeWhileGroup(event) {
        this.groupFilter = event ? event.filter : '';
        this.getGroupingData();
    }

    public editModeChanged(event) {
        this.editModeToggled.emit(event);
    }

    public onColumnsChange(columnsChangeEvent) {
        this.ticker.Expand = this.defaultExpand;
        this.setupTableConfig();
    }

    public onExecuteAction(action: TickerAction) {
        let selectedRows = [];
        if (this.table) {
            selectedRows = this.table.getSelectedRows();
        }

        if (!action.Type || action.Type === '') {
            throw Error(`No Type defined for action ${action.Name}`);
        }

        const allowMultipleRows =
            action.ExecuteWithMultipleSelections !== undefined ? action.ExecuteWithMultipleSelections : false;
        const allowNoRows =
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

        const actionOverride = this.actionOverrides && this.actionOverrides.find(x => x.Code === action.Code);

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

            // Send parentmodel to executecunftion if so specified in the json config. If not, send selectedRows
            const params = action.SendParentModel ? this.parentModel : selectedRows;
            actionOverride.ExecuteActionHandler(params).then(() => {
                    // refresh table data after actions/transitions are executed
                    this.reloadData();

                    // execute AfterExecuteActionHandler if it is specified
                    this.afterExecuteAction(action, actionOverride, selectedRows);
                });
        } else {
            const actionType = action.Type;
            let rowIdentifier = 'ID';
            if ((action.Type === 'details' || action.Type === 'print') && action.Options.ParameterProperty !== '') {
                rowIdentifier = action.Options.ParameterProperty;
            }

            if (actionType === 'export') {
                this.exportToExcel(() => {});
            } else if (actionType === 'print') {
                this.companySettingsService.Get(1).subscribe(
                    companySettings => {
                        Observable.forkJoin(
                            this.reportDefinitionService.getReportByID(
                                companySettings[`Default${this.ticker.Model}ReportID`]
                            ),
                            this.reportDefinitionParameterService.GetAll(
                                'filter=ReportDefinitionId eq ' + companySettings[`Default${this.ticker.Model}ReportID`]
                            )
                        )
                        .subscribe(data => {
                            if (data[0] && data[1]) {
                                const reportForm = data[0];
                                const formParameterName = data[1][0].Name;
                                const selectedRow = this.selectedRow || selectedRows[0];
                                const value = formParameterName === 'Id'
                                    ? selectedRow[formParameterName.toUpperCase()]
                                    : selectedRow[formParameterName];
                                reportForm.parameters = [{Name: formParameterName, value: value}];

                                this.modalService.open(UniPreviewModal, {
                                    data: reportForm
                                });

                                // execute AfterExecuteActionHandler if it is specified
                                this.afterExecuteAction(action, actionOverride, selectedRows);
                            }
                        });
                    }, err => this.errorService.handle(err)
                );
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

    public reloadData() {
        if (this.table) {
            this.table.refreshTableData();
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
        const text: string = this.statusService.getStatusText(statusCode);
        return text || (statusCode ? statusCode.toString() : '');
    }

    private sharingTypeToText(type: SharingType): string {
        const sharingType = SharingTypeText.find(st => st.ID === type);
        return (sharingType && sharingType.Title) || '';
        // return SharingTypeText.find(sharingType => sharingType.ID === type).Title || '';
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
        return new Promise(resolve => {
            this.modelService.loadModelCache().then(() => {
                if (!this.ticker.Columns) {
                    this.ticker.Columns = [{
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
                    }];
                }

                /*
                    Hacky solution to getting custom dimensions on journalentry ticker.
                    We're going to want to do this in a more robust way, and probably add it to
                    more tickers, but I don't really have time for that before the exedra deadline..
                */
                const getDimensionColumns = this.ticker.Code === 'journalentryline_list'
                    ? this.customDimensionService.getMetadata()
                    : Observable.of([]);

                forkJoin(
                    this.customDimensionService.getMetadata(),
                    getDimensionColumns
                ).subscribe((data: any) => {
                    this.customDimensionsMetadata = data[0];
                    const res = data[1];
                    if (res && res.length) {
                        res.forEach(customDimension => {
                            const dimFieldNo = `Dimension${customDimension.Dimension}.Number`;
                            const colNoIndex = this.ticker.Columns.findIndex(col => col.Field.includes(dimFieldNo));
                            if (colNoIndex >= 0) {
                                this.ticker.Columns[colNoIndex].Header = customDimension.Label + 'nr.';
                                this.ticker.Columns[colNoIndex].DefaultHidden = !customDimension.IsActive;
                            }

                            const dimField = `Dimension${customDimension.Dimension}.Name`;
                            const colIndex = this.ticker.Columns.findIndex(col => col.Field.includes(dimField));
                            if (colIndex >= 0) {
                                this.ticker.Columns[colIndex].Header = customDimension.Label;
                            }
                        });
                    }

                    this.tableConfig = this.buildTableConfig();
                    this.cdr.markForCheck();
                    resolve();
                });
            });
        });
    }


    private removeDisabledDimensionAndUpdatenHeaders() {
        if (this.ticker.Code === 'sold_products') {
            const columnsToDelete = [];
            this.ticker.Columns.forEach((col) => {
                if (col.Header.includes('Dimension')) {
                    let found = false;
                    this.customDimensionsMetadata.forEach(dim => {
                        if (col.Field.includes(dim.Dimension + '')) {
                            col.Header = dim.Label;
                            found = true;
                        }
                    });
                    if (!found) {
                        const index = this.ticker.Columns.indexOf(col);
                        columnsToDelete.push(index);
                    }
                }
            });
            while (columnsToDelete.length) {
                this.ticker.Columns.splice(columnsToDelete.pop(), 1);
            }
        }
    }

    private buildTableConfig() {
        // Define configStoreKey
        const configStoreKey = `uniTicker.${this.ticker.Code}`;

        this.removeDisabledDimensionAndUpdatenHeaders();

        // Define columns to use in the table
        const columns: UniTableColumn[] = [];
        let selects: string[] = [];
        const customColumnSetup = this.tableUtils.getColumnSetupMap(configStoreKey) || [];
        this.headers = '';

        this.ticker.Columns = this.ticker.Columns.filter(col => !col.ExcludeFromEnvironments
            || col.ExcludeFromEnvironments.findIndex(t => t !== theme.theme) !== -1);

        for (let i = 0; i < this.ticker.Columns.length; i++) {
            const column = this.ticker.Columns[i];

            const whitelabelOverrides = theme.tableColumnOverrides && theme.tableColumnOverrides[configStoreKey];
            const columnOverride = whitelabelOverrides?.find(override => override.field === column.SelectableFieldName);
            if (columnOverride && typeof columnOverride.visible === 'boolean') {
                column.DefaultHidden = !columnOverride.visible;
            }

            // If field/column is hidden in the table, don't expand it
            const tableColumn = customColumnSetup.find(customField => {
                return customField.field === column.SelectableFieldName;
            });
            if (this.shouldAddColumnToQuery(column, tableColumn)) {
                // Set the expand needed for selected columns
                this.setExpand(column);

                if (column.Field.includes('MandatoryDimensions')) {
                    selects.push('MandatoryDimensions.MandatoryType');
                    selects.push('MandatoryDimensions.DimensionNo');
                } else {
                    if (column.Stuff) {
                        selects.push('stuff(' + column.SelectableFieldName + ') as ' + column.Alias);
                    } else {
                        selects.push(column.SelectableFieldName + ' as ' + column.Alias);
                    }
                }

                if (this.ticker.Name === 'Utsendelse' && column.Field === 'EntityDisplayValue') {
                    selects.push('EntityType');
                }
                if (column.SubFields) {
                    column.SubFields.forEach(subColumn => {
                        if (this.shouldAddColumnToQuery(subColumn, tableColumn)) {
                            this.setExpand(subColumn);
                            if (subColumn.Stuff) {
                                selects.push('stuff(' + subColumn.SelectableFieldName + ') as ' + subColumn.Alias);
                            } else {
                                selects.push(subColumn.SelectableFieldName + ' as ' + subColumn.Alias);
                            }
                        }
                    });
                }

                if (!this.headers || this.headers === '') {
                    this.headers = column.Header;
                } else {
                    this.headers = this.headers.concat(',', column.Header);
                }
            }

            if (column.Type !== 'dontdisplay') {
                let colType = UniTableColumnType.Text;

                if (column.Type !== '') {
                    switch (column.Type) {
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

                const col = new UniTableColumn(column.SelectableFieldName, column.Header, colType);
                col.alias = column.Alias;
                col.width = column.Width;
                col.isSumColumn = column.SumColumn;
                col.markedRowsSumCol = column.MarkedRowsSumCol;
                col.sumFunction = column.SumFunction;
                col.enableRowGroup = this.groupingIsOn;

                if (column.FeaturePermission) {
                    col.featurePermission = column.FeaturePermission;
                }

                if (column.Resizeable === false) {
                    col.resizeable = false;
                }

                if (column.CssClass) {
                    col.cls = column.CssClass;
                }

                if (column.Type === 'link') {
                    col.headerCls = 'ticker-link-col';
                    col.cls = 'ticker-link-col';
                }

                if (column.DisplayField) {
                    col.displayField = column.DisplayField;
                }

                const columnOverride = this.columnOverrides.find(x => x.Field === column.Field);
                const templateOverrides = ColumnTemplateOverrides[this.ticker.Code] || {};
                if (columnOverride || templateOverrides[column.Field]) {
                    col.setTemplate(row => {
                        // use the tickerservice to get and format value based on override template
                        return this.uniTickerService
                            .getFieldValue(column, row, this.ticker, this.columnOverrides);
                    });
                } else {
                    // set up templates based on rules for e.g. fieldname
                    if (column.SelectableFieldName.toLowerCase().endsWith('statuscode')
                        || column.SelectableFieldName.toLowerCase().endsWith('tostatus')
                        || column.SelectableFieldName.toLowerCase().endsWith('fromstatus')
                        || (column.Alias && column.Alias.toLocaleLowerCase().endsWith('statuscode'))) {
                        col.template = (rowModel) => this.statusCodeToText(rowModel[column.Alias]);
                    }

                    if (column.SelectableFieldName.toLowerCase().endsWith('printstatus')) {
                        col.template = (rowModel) => GetPrintStatusText(rowModel[column.Alias]);
                    }

                    if (column.SelectableFieldName.toLowerCase().endsWith('paymentstatus')) {
                        col.template = (rowModel) => GetPaymentStatusText(rowModel[column.Alias]);
                    }

                    if (column.SelectableFieldName.toLocaleLowerCase().endsWith('sharing.type')
                        || (column.Alias && column.Alias.toLocaleLowerCase() === 'sharingtype')) {
                        col.template = (rowModel) => this.sharingTypeToText(rowModel[column.Alias]);
                    }

                    if (column.SelectableFieldName.toLocaleLowerCase().endsWith('worktype.systemtype')) {
                        col.template = (rowModel) => {
                            const list = <Array<{ ID: number, Name: string }>>this.uniTickerService
                                .getSelectConfigOptions('WorkTypeSystemType');
                            const match = list.find(x => x.ID === rowModel[column.Alias]);
                            return match ? match.Name : '';
                        };
                    }

                    if (column.SelectableFieldName.toLocaleLowerCase().endsWith('.freeamounttype')) {
                        col.template = (rowModel) => this.taxService.getNameFromFreeAmountType(rowModel[column.Alias]);
                    }
                }

                if (column.Type === 'attachment') {
                    col.setTemplate(line => line.Attachments ? PAPERCLIP : '');
                    col.setOnCellClick(row => {
                        if (row.Attachments) {
                            const entity = column.ExternalModel ? column.ExternalModel : this.ticker.Model;
                            this.modalService.open(ImageModal, { data: {
                                entity: entity,
                                entityID: row.JournalEntryID
                            }});
                        }
                    });
                } else if (column.Type === 'link' || column.Type === 'external-link' || column.Type === 'mailto') {
                    col.setType(13);
                    col.setLinkResolver(row => this.uniTickerService.linkColUrlResolver(column, row, this.ticker));
                    col.setTemplate(row => this.uniTickerService.getFieldValue(column, row, this.ticker, this.columnOverrides));

                    if (column.Type === 'mailto') {
                        col.cls = (col.cls || '') + ' ticker-mailto-col';
                    }


                } else if (column.SubFields && column.SubFields.length > 0) {
                    col.setTemplate(row => {
                        return this.uniTickerService.getFieldValue(
                            column, row, this.ticker, this.columnOverrides
                        );
                    });
                }

                if (column.Format && column.Format !== '') {
                    // TODO Sett opp flere fornuftige ferdigformater her - f.eks. "NumberPositiveNegative" etc
                    switch (column.Format) {
                        case 'DateWithTime':
                            col.setType(UniTableColumnType.Text);
                            col.setTemplate(row => row[col.alias] ? moment(row[col.alias]).format('DD.MM.YYYY HH:mm') : '');
                            break;
                        case 'DateMonth':
                            col.setType(UniTableColumnType.Text);
                            col.setTemplate(row =>  {
                                const month = row[col.alias] ? moment(row[col.alias]).format('MM') : '';
                                return month.startsWith('0') ? month.slice(1, 2) : month;
                            });
                            col.setAlignment('right');
                            break;
                        case 'DateYear':
                            col.setType(UniTableColumnType.Text);
                            col.setTemplate(row =>  {
                                const year = row[col.alias] ? moment(row[col.alias]).format('YYYY') : '';
                                return year;
                            });
                            col.setAlignment('right');
                            break;
                        case 'NumberPositiveNegative':
                            col.setType(UniTableColumnType.Number);
                            col.setConditionalCls(row => {
                                let value = +row[column.Alias || column.Field];

                                if (!!row.value) {
                                    value = parseInt(row.value.toString().replace('\u2009', '').replace(' ', ''), 10);
                                }
                                return  value >= 0 ?
                                'number-good'
                                : 'number-bad';
                            }

                            );
                            break;
                        case 'DatePassed':
                            col.setConditionalCls(row => {
                                return moment(row[column.Alias || column.Field]).isBefore(moment())
                                    ? 'date-bad'
                                    : 'date-good';
                            });
                            break;
                        case 'DueDate':
                            col.setConditionalCls(row => {
                                const isBefore = moment(row[column.Alias || column.Field]).isBefore(moment().subtract({days: 1}));
                                const isPayed = row['CustomerInvoiceStatusCode'] === 42004;
                                return isBefore && !isPayed ? 'date-bad' : 'date-good';
                            });
                            break;
                        case 'SharingStatus':
                            col.setConditionalCls(row => {
                                switch (row[column.Alias]) {
                                    case StatusCodeSharing.Completed:
                                        return 'status-good';
                                    case StatusCodeSharing.Failed:
                                        return 'status-bad';
                                    case StatusCodeSharing.InProgress:
                                        return 'status-waiting';
                                }
                            });
                            break;
                        case 'json':
                            col.setTemplate(row => JSON.stringify(row));
                            break;
                    }
                }

                if (column.Alignment) {
                    col.setAlignment(column.Alignment);
                }

                if (column.DefaultHidden || (column.DefaultHiddenOnGivenFilters
                    && column.DefaultHiddenOnGivenFilters.includes(this.selectedFilter.Code))) {
                    col.setVisible(false);
                }

                if (column.FilterOperator === 'startswith' || column.FilterOperator === 'eq'
                    || column.FilterOperator === 'contains') {
                        col.setFilterOperator(column.FilterOperator);
                } else {
                    col.filterable = false;
                }

                if (column.SelectableFieldName.toLowerCase().endsWith('statuscode')) {
                    const statusCodes = this.statusService.getStatusCodesForEntity(this.ticker.Model);
                    if (statusCodes && statusCodes.length > 0) {
                        col.filterSelectConfig = {
                            options: statusCodes,
                            displayField: 'name',
                            valueField: 'statusCode'
                        };
                    }
                }

                if (column.FilterSelectConfigKey) {
                    col.filterSelectConfig = {
                        options: this.uniTickerService.getSelectConfigOptions(column.FilterSelectConfigKey),
                        displayField: 'Name',
                        valueField: 'ID'
                    };
                }

                // update column template to display mandatory and optional dimensions
                if (this.ticker.Code === 'accounts_list' && col.field.includes('MandatoryDimensions')) {
                    let mandatoryType = 0;
                    if (col.header.includes('Påkrevde')) {
                        mandatoryType = 1;
                    }
                    if (col.header.includes('Advarsel')) {
                        mandatoryType = 2;
                    }

                    col.setTemplate(rowModel => {
                        const dimensions = rowModel.MandatoryDimensions;
                        const result = [];
                        dimensions.forEach(dim => {
                            if (dim.MandatoryType === mandatoryType) {
                                if (dim.DimensionNo !== 1 && dim.DimensionNo !== 2) {
                                    this.customDimensionsMetadata.forEach(dimMetaData => {
                                        if (dim.DimensionNo === dimMetaData.Dimension) {
                                            result.push(dimMetaData.Label);
                                        }
                                    });
                                }
                                if (dim.DimensionNo === 1) {
                                    result.push('Prosjekt');
                                }
                                if (dim.DimensionNo === 2) {
                                    result.push('Avdeling');
                                }
                            }
                        });
                        return result.join(', ');
                    });
                }

                // Add functionality to only show fields on given Filters
                // Dont add columns that have filter lock and is not visible (filter is not correct)
                if (!column.ShowOnlyOnThisFilter || (column.ShowOnlyOnThisFilter &&
                    this.ticker.Filters.length > column.ShowOnlyOnThisFilter
                    && this.ticker.Filters[column.ShowOnlyOnThisFilter].IsActive)) {
                    columns.push(col);
                }

            }
        }

        // if any subtickers exists, and any of them need info from the parent (i.e. this component),
        // make sure we have this data available in the query. This means that we e.g. add a select
        // for ID, even though that does not exist in the ticker
        const subTickersWithParentFilter =
            !this.ticker.SubTickers ?
                []
                : this.ticker.SubTickers.filter(st => st.ParentFilter && st.ParentFilter.Value);

        subTickersWithParentFilter.forEach(st => {
            const paramAlias = st.ParentFilter.Value.replace('.', '');
            const paramSelect = st.ParentFilter.Value + ' as ' + paramAlias;

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

        const linkFieldsWithNavigationProperty =
            this.ticker.Columns.filter(x => x.Type === 'link' && x.LinkNavigationProperty);

        linkFieldsWithNavigationProperty.forEach(field => {
            const paramSelect = `${field.LinkNavigationProperty} as ${field.LinkNavigationProperty.replace('.', '')}`;
            if (!selects.find(x => x === paramSelect)) {
                selects.push(paramSelect);
            }
        });

        const linkFieldWithNavigationProprties = this.ticker.Columns
            .filter(x => x.Type === 'link'
                && x.LinkNavigationProperties
                && x.LinkNavigationProperties.length);

        linkFieldWithNavigationProprties.forEach(field => {
            const paramSelects = field.LinkNavigationProperties.map(prop => {
                return `${prop} as ${prop.replace('.', '')}`;
            });
            selects = [...selects, ...paramSelects.filter(param => !selects.some(x => x === param))];
        });

        const linkFieldsWithoutNavigationProperty =
            this.ticker.Columns.filter(x => x.Type === 'link' && !x.LinkNavigationProperty);

        linkFieldsWithoutNavigationProperty.forEach(field => {
            const paramSelect = 'ID as ID';
            if (!selects.find(x => x === paramSelect)) {
                selects.push(paramSelect);
            }
        });

        this.selects = selects.join(',');

        const contextMenuItems: IContextMenuItem[] = [];
        if (this.ticker.Actions) {
            this.ticker.Actions.filter(action => {
                return !action.FeaturePermission || this.permissionService.canShowUiFeature(action.FeaturePermission)
            }).forEach(action => {
                if (action.DisplayInContextMenu) {
                    if (action.Type === 'transition' && !action.Options.Transition) {
                        throw Error(
                            `Cannot add action with Type = transition without` +
                            ` specifying which Transition to execute, action: ${action.Code}`
                        );
                    }

                    const actionOverride = this.actionOverrides && this.actionOverrides.find(x => action.Code === x.Code);
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

                                if (actionOverride && actionOverride.CheckActionIsDisabled) {
                                    return actionOverride.CheckActionIsDisabled(rowModel);
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

        let config = new UniTableConfig(configStoreKey, false, false, this.parentModel ? 5 : 30)
            .setColumns(columns)
            .setEntityType(this.ticker.Model)
            .setAllowGroupFilter(true)
            .setColumnMenuVisible(true)
            .setMultiRowSelect(this.isMultiRowSelect())
            .setContextMenu(contextMenuItems, true, false)
            .setShowTotalRowCount(true)
            .setSearchable(true)
            .setIsRowReadOnly(row => {
                if (!this.ticker.ReadOnlyCases) {
                    return false;
                }
                return this.ticker.ReadOnlyCases
                    .some(readOnlyField => row[readOnlyField.Key] === readOnlyField.Value);
            });


        const overrideFn = TickerTableConfigOverrides[this.ticker.Code];
        if (overrideFn) {
            config = overrideFn(config, this.ticker, !!this.parentTicker);
        }

        if (this.groupingIsOn && this.ticker.IsTopLevelTicker) {
            config.setRowGroupPanelShow('always')
                .setGroupsDefaultExpanded(true)
                .setSuppressMakeColumnVisibleAfterUnGroup(true)
                .setSuppressDragLeaveHidesColumns(true)
                .setAutoGroupColumnDef({
                    headerName: 'Gruppering',
                    suppressMenu: true,
                    minWidth: 150
                });
        }

        config.isGroupingTicker = this.groupingIsOn;
        return config;
    }

    private isMultiRowSelect(): boolean {
        return this.ticker.MultiRowSelect && this.selectedFilter && this.selectedFilter.IsMultiRowSelect;
    }

    private shouldAddColumnToQuery(column: TickerColumn, userColumnSetup: UniTableColumn): boolean {
        if (column.SelectRequired || column.Field === 'ID' || column.Field === 'StatusCode' || column.Type === 'link') {
            return true;
        }

        return (userColumnSetup && userColumnSetup.visible) || !column.DefaultHidden;
    }

    private setExpand(column: TickerColumn) {
        if (column.Field.includes('MandatoryDimensions')) {
            this.ticker.Expand += ',MandatoryDimensions';
        }
        let field = column.Field;

        // if no field, or column is overwritten to not expand, don't expand
        if (!field || column.Expand === '') {
            return;
        }

        // if field is a function with fields as params, run through all its fields
        if (field.includes('(')) {
            const fields = field.slice(field.lastIndexOf('(') + 1, field.indexOf(')') - 1).split(',');
            fields.forEach(x => {
                column.Field = x;
                this.setExpand(column);
            });
            return;
        }

        // if field includes '.' it needs to expand something
        if (field.includes('.')) {
            const fieldSplit = field.split('.');
            const expandSplit = this.ticker.Expand && this.ticker.Expand.split(',');
            this.ticker.Expand = this.ticker.Expand || '';
            let expand = '';
            let isExpandExisting: boolean;
            const joinSplit = this.ticker.Joins && this.ticker.Joins.split(/[\s.]+/);

            // if field is nested/has parents, expand all parents too
            for (let k = 0; k < fieldSplit.length - 1; k++) {
                if (k === 0) {
                    // if first part of field is the model name, don't expand it
                    if (fieldSplit[k] === this.ticker.Model) {
                        k++;
                        if (fieldSplit.length < 3) { return; }
                    }
                    expand = expand.concat(fieldSplit[k]);
                } else {
                    expand = expand.concat('.', fieldSplit[k]);
                }

                // check if column has an own expand that should override parent's expand
                if (column.Expand && column.Expand !== '') { expand = column.Expand; }

                // don't expand joined fields, check if any parts of field is equal to any parts of join
                if (joinSplit) {
                    const fieldHasJoin = fieldSplit.some(fieldPart =>
                        joinSplit.some(joinPart => joinPart === fieldPart)
                    );
                    if (fieldHasJoin) { return; }
                }
            }

            // check if the expand don't already exists in ticker.expand
            if (expandSplit) {
                isExpandExisting = expandSplit.some(existingExpand => existingExpand === expand);
            }
            if (!isExpandExisting) {
                if (!this.ticker.Expand || this.ticker.Expand === '') {
                    this.ticker.Expand = expand;
                } else {
                    this.ticker.Expand = this.ticker.Expand.concat(',', expand);
                }
            }

            // Query can only include 1 '.' (2 chained properties) and must therefore be shortened
            if (fieldSplit.length > 2) {
                field = fieldSplit[fieldSplit.length - 2] + fieldSplit[fieldSplit.length - 1];
            }
        }
    }

    // this function assumes that the unitablesetup has already been run, so that all needed
    // fields are already initialized and configured correctly
    public exportToExcel(completeEvent) {

        // If grouping is on, use AG-Grids own export!
        if (this.groupingIsOn) {
            this.table.exportFromGrid();
            completeEvent('Eksport kjørt');
            return;
        }

        // Remove ID and CustomerID from select if they exist, so it doesn't create columns for them
        // Remove code from here after test!!
        const selectSplit = this.selects.split(',');

        const idIndex = selectSplit.indexOf('ID as ID');
        if (idIndex >= 0) {
            selectSplit.splice(idIndex, 1);
        }

        const customerIDIndex = selectSplit.indexOf('Customer.ID as CustomerID');
        if (customerIDIndex >= 0) {
            selectSplit.splice(customerIDIndex, 1);
        }

        this.selects = selectSplit.join(','); // Remove to here

        const stringSelect = [];
        const headers = [];

        const tableColumns = this.table && this.table.columns;
        if (tableColumns && tableColumns.length) {
            tableColumns.forEach(col => {
                if (col.visible) {
                    if (!col.field.includes('MandatoryDimensions')) {
                        stringSelect.push(col.field + ' as ' + col.alias);
                        headers.push(col.header);
                    } else {
                        stringSelect.push('MandatoryDimensions.DimensionNo,MandatoryDimensions.MandatoryType');
                        headers.push('MandatoryDimensionsDimensionNo', 'MandatoryDimensionsMandatoryType');
                    }
                }
            });
        } else {
            this.ticker.Columns.forEach((col)  => {
                if (!col.DefaultHidden) {
                    if (col.Field.includes('MandatoryDimensions')) {
                        stringSelect.push('MandatoryDimensions.DimensionNo,MandatoryDimensions.MandatoryType');
                        headers.push('MandatoryDimensionsDimensionNo', 'MandatoryDimensionsMandatoryType');
                    } else {
                        if (col.Stuff) {
                            stringSelect.push('stuff(' + col.SelectableFieldName + ') as ' + col.Alias);
                        } else {
                            stringSelect.push(col.SelectableFieldName + ' as ' + col.Alias);
                        }
                        headers.push(col.Header);
                    }
                }
            });
        }
        // add "dontdisplay" columns to query as well, needed to make some of the
        // lists distinct if sum is used
        this.ticker.Columns.forEach((col)  => {
            if (col.Type === 'dontdisplay') {
                if (col.Field.includes('MandatoryDimensions')) {
                    stringSelect.push('MandatoryDimensions.DimensionNo,MandatoryDimensions.MandatoryType');
                    headers.push('MandatoryDimensionsDimensionNo', 'MandatoryDimensionsMandatoryType');
                } else {
                    if (col.Stuff) {
                        stringSelect.push('stuff(' + col.SelectableFieldName + ') as ' + col.Alias);
                    } else {
                        stringSelect.push(col.SelectableFieldName + ' as ' + col.Alias);
                    }
                    headers.push(col.Header);
                }
            }
        });

        const selectedFieldString = _.uniq(stringSelect).join(',');

        // Remove code after test!
        this.headers = this.headers
            || this.ticker.Columns.map(x => x.Header !== PAPERCLIP ? x.Header : 'Vedlegg').join(',');

        // use both predefined filters and additional unitable filters if applicable
        let params = this.publicParams;
        if (this.unitableFilter) {
            params.set('filter', this.unitableFilter);
        }

        params = this.getSearchParams(params);
        // execute request to create Excel file
        this.statisticsService
            .GetExportedExcelFile(this.ticker.Model, selectedFieldString, params.get('filter'),
                this.ticker.Expand, _.uniq(headers).join(','), this.ticker.Joins, this.ticker.Distinct)
                    .subscribe((result) => {
                        let filename = '';
                        // Get filename with filetype from headers
                        if (result.headers) {
                            const fromHeader = result.headers.get('content-disposition');
                            if (fromHeader) {
                                filename = fromHeader.split('=')[1];
                            }
                        }

                        if (!filename || filename === '') {
                            filename = 'export.xlsx';
                        }

                        const blob = new Blob([result.body], { type: 'text/csv' });
                        // download file so the user can open it
                        saveAs(blob, filename);
                    },
                    err => this.errorService.handle(err));

        completeEvent('Eksport kjørt');
    }
}
