import {Component, ViewChild, Input, SimpleChanges, Output, EventEmitter} from '@angular/core';
import {URLSearchParams} from '@angular/http';
import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';
import {UniTabs} from '../../layout/uniTabs/uniTabs';
import {UniQueryDefinition} from '../../../unientities';
import {Router, ActivatedRoute, RouterLink} from '@angular/router';
import {Ticker, TickerGroup, TickerAction, TickerFilter, TickerColumn} from '../../../services/common/UniTickerService';
import {StatisticsService, StatusService} from '../../../services/services';
import {AuthService} from '../../../../framework/core/authService';
import {UniHttp} from '../../../../framework/core/http/http';
import {ToastService, ToastType, ToastTime} from '../../../../framework/uniToast/toastService';
import {ErrorService} from '../../../services/services';
import {UniTable, UniTableColumn, IContextMenuItem, UniTableColumnType, UniTableConfig, ITableFilter, IExpressionFilterValue} from 'unitable-ng2/main';
import {Observable} from 'rxjs/Observable';

declare const moment;
declare const saveAs; // filsesaver.js

@Component({
    selector: 'uni-ticker',
    templateUrl: 'app/components/uniticker/ticker/ticker.html'
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

    private rowindexToFocusAfterDataLoad: number;

    constructor(private uniHttpService: UniHttp,
        private router: Router,
        private route: ActivatedRoute,
        private tabService: TabService,
        private statisticsService: StatisticsService,
        private toastService: ToastService,
        private authService: AuthService,
        private statusService: StatusService,
        private errorService: ErrorService) {
        let token = this.authService.getTokenDecoded();
        if (token) {
            this.currentUserGlobalIdentity = token.nameid;
        }

        this.lookupFunction = (urlParams: URLSearchParams) => {
            let params = this.getSearchParams(urlParams);

            return this.statisticsService
                .GetAllByUrlSearchParams(params)
                .catch((err, obs) => this.errorService.handleRxCatch(err, obs));
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

        if (this.selectedFilter && this.selectedFilter.Filter && this.selectedFilter.Filter !== '') {
            let newFilter = this.selectedFilter.Filter;
            if (newFilter.indexOf(':currentuserid') >= 0) {
                newFilter = newFilter.replace(':currentuserid', `'${this.currentUserGlobalIdentity}'`);
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
                `${this.parentModel[this.ticker.ParentFilter.Value.replace('.','')]}`;

            if (currentFilter && currentFilter !== '') {
                currentFilter += ' and ' + parentFilter;
            } else {
                currentFilter = parentFilter;
            }

            params.set('filter', currentFilter);
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

    public setSelectedRow(rowindex: number) {
        /*
        TODO: LITT TRØBBEL MED DENNE FORELØPIG, LITT TIMING ISSUES. AVVENT FORELØPIG,
        LØSER SEG KANSKJE AV SEG SELV MED STICKY STATE HVIS VI GÅR FOR DEN LØSNINGEN

        if (this.unitable) {
            console.log('focus row through code ' + rowindex);
            this.unitable.focusRow(rowindex);

            // let unitable do it's thing before asking for the current row
            setTimeout(() => {
                let currentRow = this.unitable.getCurrentRow();

                if (currentRow) {
                    this.rowSelected.emit(currentRow);
                } else {
                    this.rowindexToFocusAfterDataLoad = rowindex;
                }
            });
        }*/
    }

    private onDataLoaded(event) {
        setTimeout(() => {
            if (this.rowindexToFocusAfterDataLoad) {
                this.setSelectedRow(this.rowindexToFocusAfterDataLoad);
                this.rowindexToFocusAfterDataLoad = null;
            }
        });
    }

    private onRowSelected(rowSelectEvent) {
        let selectedObject = rowSelectEvent.rowModel;
        console.log('onRowSelected', selectedObject);
        this.rowSelected.emit(selectedObject);
    }

    private onExecuteAction(action: TickerAction) {
        let selectedRows = [];
        if (this.unitable) {
            selectedRows = this.unitable.getSelectedRows();
        }

        let allowMultipleRows = action.ExecuteWithMultipleSelections ? true : false;

        if (!action.ExecuteWithoutSelection && selectedRows.length === 0) {
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

        alert('TODO. Legg opp logikk for hva som skal gjøres på execute: ' + action.Code);
    }

    private isFunction(field: string): boolean {
        return field.indexOf('(') > -1 && field.indexOf(')') > -1;
    }

    private statusCodeToText(statusCode: number): string {
        let text: string = this.statusService.getStatusText(statusCode);
        return text || (statusCode ? statusCode.toString() : '');
    }

    private setupTableConfig() {
        if (!this.ticker.Columns || this.ticker.Columns.length === 0) {
            // TODO: if no columns are defined, we should probably get some defaults based on the model
            return;
        }

        // Define columns to use in the table
        let columns: Array<UniTableColumn> = [];
        let selects: Array<string> = [];

        for (let i = 0; i < this.ticker.Columns.length; i++) {
            let field = this.ticker.Columns[i];

            let colName = field.Field;
            let aliasColName = '';
            let selectableColName = '';

            if (this.isFunction(field.Field)) {
                // for functions, trust that the user knows what he/she is doing...
                selectableColName = colName;
                aliasColName = this.ticker.Model + colName;
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
                selectableColName = this.ticker.Model + '.' + colName;
                aliasColName = this.ticker.Model + colName;
            }

            if (field.SumFunction && selectableColName.indexOf(field.SumFunction) === -1) {
                selectableColName = `${field.SumFunction}(${selectableColName})`;
            }

            // set the Alias we are using in the query to simplify getting the data later on
            field.Alias = aliasColName;

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
                // console.log('add extra field to select: ' + paramSelect);
                selects.push(paramSelect);
            }
        });

        this.selects = selects.join(',');

        let contextMenuItems: IContextMenuItem[] = [];
        contextMenuItems.push({
            label: 'Sett opp basert på config + hateoas',
            action: (rowModel) => {
                alert('Not implemented');
            }
        });

        // Setup table
        this.tableConfig = new UniTableConfig(false, true, 20)
            .setAllowGroupFilter(true)
            .setAllowConfigChanges(true)
            .setColumnMenuVisible(true)
            .setSearchable(false)
            .setMultiRowSelect(true)
            .setDataMapper((data) => {
                let tmp = data !== null ? data.Data : [];

                if (data !== null && data.Message !== null && data.Message !== '') {
                    this.toastService.addToast('Feil ved henting av data, ' + data.Message, ToastType.bad);
                }

                return tmp;
            })
            .setContextMenu(contextMenuItems, true, false)
            .setColumns(columns);
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
