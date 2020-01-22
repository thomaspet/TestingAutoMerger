import {Component, Input, OnChanges, SimpleChanges, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {HttpParams} from '@angular/common/http';

import {UniTableColumn, UniTableConfig} from '@uni-framework/ui/unitable';
import {AgGridWrapper} from '@uni-framework/ui/ag-grid/ag-grid-wrapper';
import {AuthService} from '@app/authService';
import {UniQueryDefinition, UniQueryField} from '@uni-entities';
import {ToastService, ToastType} from '@uni-framework/uniToast/toastService';
import {
    StatisticsService,
    UniQueryDefinitionService,
    StatusService,
    ErrorService
} from '@app/services/services';

@Component({
    selector: 'uni-query-read-only',
    templateUrl: './UniQueryReadOnly.html'
})
export class UniQueryReadOnly implements OnChanges {
    @Input() queryDefinitionID: number;
    @Input() filterValue: number;
    @Input() customerID: number;
    @Input() supplierID: number;
    @Input() projectID: number;

    @ViewChild(AgGridWrapper)
    public table: AgGridWrapper;

    public tableConfig: UniTableConfig;
    public lookupFunction: (urlParams: HttpParams) => any;

    public fields: Array<UniTableColumn>;
    private selects: string;
    private expands: string;
    private queryDefinition: UniQueryDefinition;

    addNewAction: () => void;

    constructor(
        private router: Router,
        private statisticsService: StatisticsService,
        private uniQueryDefinitionService: UniQueryDefinitionService,
        private toastService: ToastService,
        private authService: AuthService,
        private statusService: StatusService,
        private errorService: ErrorService
    ) {
        this.lookupFunction = (urlParams: HttpParams) => {
            let params = urlParams;

            if (params === null) {
                params = new HttpParams();
            }

            params = params.delete('skip'); // Temp workaround since with skip returns duplicate values

            params = params.set('model', this.queryDefinition.MainModelName)
                .set('select', this.selects)
                .set('filter', this.getFilterString(params, this.queryDefinition));

            if (this.projectID) {
                const mainModelName = this.queryDefinition.MainModelName;
                if (mainModelName === 'SupplierInvoice' || mainModelName === 'CustomerInvoice') {
                    params = params.set('join', mainModelName + `.JournalEntryID eq JournalEntryLineDraft.JournalEntryID `
                    + `and JournalEntryLineDraft.DimensionsID eq Dimensions.ID`);
                } else if (mainModelName === 'CustomerOrder' || mainModelName === 'CustomerQuote') {
                    params = params.set('join', mainModelName + `.ID eq ` + mainModelName + `Item.` + mainModelName + `ID and ` +
                    mainModelName + `Item.DimensionsID eq Dimensions.ID`);
                }
            }

            if (this.expands) {
                params = params.set('expand', this.expands);
            }

            return this.statisticsService
                .GetAllByHttpParams(params, true)
                .catch((err, obs) => this.errorService.handleRxCatch(err, obs));
        };
    }

    public ngOnChanges(changes: SimpleChanges) {
        if (changes['queryDefinitionID']) {
            if (!this.queryDefinition || this.queryDefinitionID !== this.queryDefinition.ID) {
                this.statusService.loadStatusCache().then(() => {
                    this.loadQueryDefinition();
                });
            }
        } else {
            this.updateAddNewAction();
            if (this.table) {
                this.table.refreshTableData();
            }
        }
    }

    getFilterString(params: HttpParams, queryDefinition: UniQueryDefinition): string {
        const filterStrings = [];

        // QueryDefinition filters
        if (queryDefinition && queryDefinition.UniQueryFilters) {
            const generateFilterString = (filter) => {
                if (filter.operator === 'contains' || filter.operator === 'startswith' || filter.operator === 'endswith') {
                    return `${filter.operator}(${filter.field},'${filter.value}')`;
                } else {
                    return `${filter.field} ${filter.operator} '${filter.value}'`;
                }
            };

            queryDefinition.UniQueryFilters.forEach(filter => {
                if (filter.Value === ':externalid') {
                    if (this.filterValue) {
                        filterStrings.push(generateFilterString({
                            field: filter.Field,
                            operator: filter.Operator,
                            value: this.filterValue,
                        }));
                    }
                } else {
                    filterStrings.push(generateFilterString({
                        field: filter.Field,
                        operator: filter.Operator,
                        value: filter.Value,
                    }));
                }
            });
        }

        if (this.projectID) {
            filterStrings.push(`(Project.ID eq ${this.projectID} or Dimensions.ProjectID eq ${this.projectID})`);
        }

        // Table filter
        if (params.get('filter')) {
            filterStrings.push(params.get('filter'));
        }

        return filterStrings.length ? filterStrings.join(' and ') : '';
    }

    private loadQueryDefinition() {
        this.fields = [];
        this.selects = '';
        this.expands = '';

        if (this.queryDefinitionID > 0) {
            this.uniQueryDefinitionService.Get(this.queryDefinitionID, ['UniQueryFilters', 'UniQueryFields'])
                .subscribe(res => {
                        this.queryDefinition = res;
                        this.updateAddNewAction();

                        if (this.queryDefinition.UniQueryFields.filter(x => x.Index).length > 0) {
                            // Index is specified for the fields, the fields to reflect this
                            this.queryDefinition.UniQueryFields.sort(
                                (a, b) => (a.Index ? a.Index : 0) - (b.Index ? b.Index : 0)
                            );
                        }

                        this.fields = this.queryDefinition.UniQueryFields.map((field: UniQueryField) => {
                            const f: UniTableColumn = new UniTableColumn();
                            f.field = field.Field;
                            f.header = field.Header;
                            f.type = field.FieldType;
                            f.alias = field.Alias;
                            f.path = field.Path;
                            f.sumFunction = field.SumFunction;
                            f.width = field.Width;
                            f.index = field.Index;

                            if (f.field.toLowerCase().endsWith('statuscode')) {
                                const statusCodes = this.statusService
                                    .getStatusCodesForEntity(this.queryDefinition.MainModelName);
                                if (statusCodes && statusCodes.length > 0) {
                                    f.filterSelectConfig = {
                                        options: statusCodes,
                                        displayField: 'name',
                                        valueField: 'statusCode'
                                    };
                                }
                            }

                            return f;
                        });

                        this.setupTableConfig();
                    },
                    err => this.errorService.handle(err));
        } else {
            this.queryDefinition = new UniQueryDefinition();
            this.queryDefinition.ID = 0;
            this.queryDefinition.IsShared = true;
            this.queryDefinition.UniQueryFields = [];
            this.queryDefinition.UniQueryFilters = [];
        }
    }

    private updateAddNewAction() {
        this.addNewAction = undefined;

        if (this.queryDefinition && this.queryDefinition.ClickUrl) {
            let url = this.queryDefinition.ClickUrl.split(':')[0];
            url += '0';

            if (this.customerID) {
                url += `;customerID=${this.customerID}`;
            }

            if (this.supplierID) {
                url += `;supplierID=${this.supplierID}`;
            }

            if (this.projectID) {
                url += `;projectID=${this.projectID}`;
            }

            this.addNewAction = () => this.router.navigateByUrl(url);
        }
    }

    private setupTableConfig() {
        const columns: UniTableColumn[] = [];
        const expands: string[] = [];
        const selects: string[] = [];

        this.fields.forEach(field => {
            const colName = field.field;
            let aliasColName = '';
            let selectableColName = '';

            if (this.isFunction(field.field)) {
                // for functions, trust that the user knows what he/she is doing...
                selectableColName = colName;
                aliasColName = field.alias ? field.alias : this.queryDefinition.MainModelName + colName;

            } else if (field.path && field.path !== undefined && field.path !== '' ? field.path + '.' : '') {
                let prefix = field.path;

                if (field.path.indexOf('.') > 0) {
                    const lastIndex = field.path.lastIndexOf('.');
                    prefix = field.path.substring(lastIndex + 1);
                }

                selectableColName = prefix + '.' + colName;
                aliasColName = field.alias ? field.alias : prefix + colName;

            } else {
                selectableColName = this.queryDefinition.MainModelName + '.' + colName;
                aliasColName = field.alias ? field.alias : this.queryDefinition.MainModelName + colName;
            }

            if (field.sumFunction && selectableColName.indexOf(field.sumFunction) === -1) {
                selectableColName = `${field.sumFunction}(${selectableColName})`;
            }
            const col = new UniTableColumn(selectableColName, field.header, field.type);
            col.alias = aliasColName;
            col.path = field.path;
            col.width = field.width;
            col.sumFunction = field.sumFunction;

            if (selectableColName.toLowerCase().endsWith('statuscode')) {
                col.template = (rowModel) => this.statusCodeToText(rowModel[aliasColName]);
            }

            col.filterSelectConfig = field.filterSelectConfig;

            columns.push(col);

            if (field.path && field.path !== '') {
                if (field.path.indexOf('(') === -1) {
                    if (!expands.find(x => field.path === x)) {
                        expands.push(field.path);
                    }
                }
            }

            selects.push(selectableColName + ' as ' + aliasColName);
        });

        if (this.queryDefinition.ClickUrl && this.queryDefinition.ClickParam) {
            const params: Array<string> = this.queryDefinition.ClickParam.split(',');

            params.forEach(param => {
                const paramAlias = param.replace('.', '');
                const paramSelect = param + ' as ' + paramAlias;

                if (!selects.find(x => x === paramSelect)) {
                    selects.push(paramSelect);
                }
            });
        }

        this.selects = selects.join(',');
        this.expands = expands.join(',');


        const companyKey = this.authService.getCompanyKey();
        const configStoreKey = `uniQueryReadonly.${companyKey}.${this.queryDefinitionID}`;

        this.tableConfig = new UniTableConfig(configStoreKey, false, false)
            .setSearchable(true)
            .setVirtualScroll(true)
            .setHideRowCount(true)
            .setAllowGroupFilter(true)
            .setColumnMenuVisible(true)
            .setColumns(columns);
    }

    private statusCodeToText(statusCode: number): string {
        const text: string = this.statusService.getStatusText(statusCode);
        return text || (statusCode ? statusCode.toString() : '');
    }

    private isFunction(field: string): boolean {
        return field.indexOf('(') > -1 && field.indexOf(')') > -1;
    }

    public onRowSelected(event) {
        const selectedObject = event;

        if (this.queryDefinition.ClickUrl) {
            let url = this.queryDefinition.ClickUrl;

            // replace values in parameters with values from the selected row before navigating
            if (this.queryDefinition.ClickParam) {
                const params: Array<string> = this.queryDefinition.ClickParam.split(',');

                params.forEach(param => {
                    const paramAlias = param.replace('.', '');
                    url = url.replace(`:${param}`, selectedObject[paramAlias]);
                });
            }

            this.router.navigateByUrl(url);
        }
    }
}
