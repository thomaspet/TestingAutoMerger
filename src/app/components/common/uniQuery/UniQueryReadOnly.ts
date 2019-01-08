import {Component, Input, OnChanges, SimpleChanges, ViewChild} from '@angular/core';
import {
    UniTable,
    UniTableColumn,
    UniTableConfig,
    ITableFilter,
    IExpressionFilterValue
} from '../../../../framework/ui/unitable/index';
import {Router} from '@angular/router';
import {URLSearchParams} from '@angular/http';
import {StatisticsService, UniQueryDefinitionService, StatusService, ErrorService} from '../../../services/services';
import {AuthService} from '../../../authService';
import {UniQueryDefinition, UniQueryField, UniQueryFilter} from '../../../../app/unientities';
import {ToastService, ToastType} from '../../../../framework/uniToast/toastService';
import {UniModules} from '@app/components/layout/navbar/tabstrip/tabService';

declare var _;

@Component({
    selector: 'uni-query-read-only',
    templateUrl: './UniQueryReadOnly.html'
})
export class UniQueryReadOnly implements OnChanges {
    // externalID is used when using this report from another component, e.g. as a sub component
    // in the customerDetails view. This way it is easy to set that the context of the uniquery
    // is a specific ID, this customers ID in this case
    @Input() public externalID: number;
    @Input() public queryDefinitionID: number;
    @Input() public customerID: number;
    @Input() public hidden: boolean;
    @Input() public projectID: number;

    @ViewChild(UniTable) public table: UniTable;

    public tableConfig: UniTableConfig;
    public lookupFunction: (urlParams: URLSearchParams) => any;

    public fields: Array<UniTableColumn>;
    private filters: Array<ITableFilter>;
    private selects: string;
    private expands: string;
    private queryDefinition: UniQueryDefinition;
    private buttonTitle: string;
    private buttonAction: any;

    public currentUserGlobalIdentity: string = '';

    constructor(
        private router: Router,
        private statisticsService: StatisticsService,
        private uniQueryDefinitionService: UniQueryDefinitionService,
        private toastService: ToastService,
        private authService: AuthService,
        private statusService: StatusService,
        private errorService: ErrorService
    ) {
        const token = this.authService.getTokenDecoded();
        if (token) {
            this.currentUserGlobalIdentity = token.nameid;
        }

        this.lookupFunction = (urlParams: URLSearchParams) => {
            let params = urlParams;

            if (params === null) {
                params = new URLSearchParams();
            }

            params.delete('skip'); // Temp workaround since with skip returns duplicate values

            params.set('model', this.queryDefinition.MainModelName);
            params.set('select', this.selects);

            params.set('filter', 'Project.ID eq ' + this.externalID + ' or Dimensions.ProjectID eq ' + this.externalID);

            const mainModelName = this.queryDefinition.MainModelName;

            if (mainModelName === 'SupplierInvoice' || mainModelName === 'CustomerInvoice') {
                params.set('join', mainModelName + `.JournalEntryID eq JournalEntryLineDraft.JournalEntryID `
                + `and JournalEntryLineDraft.DimensionsID eq Dimensions.ID`);
            } else if (mainModelName === 'CustomerOrder' || mainModelName === 'CustomerQuote') {
                params.set('join', mainModelName + `.ID eq ` + mainModelName + `Item.` + mainModelName + `ID and ` +
                mainModelName + `Item.DimensionsID eq Dimensions.ID`);
            }

            if (this.expands) {
                params.set('expand', this.expands);
            }

            return this.statisticsService
                .GetAllByUrlSearchParams(params, true).catch((err, obs) => this.errorService.handleRxCatch(err, obs));
        };
    }

    public ngOnChanges(changes: SimpleChanges) {
        if ((changes['hidden'] && changes['hidden'].currentValue === false) || changes['queryDefinitionID']) {
            if ((!this.queryDefinition || this.queryDefinitionID !== this.queryDefinition.ID)) {
                this.statusService.loadStatusCache().then(x => {
                    this.loadQueryDefinition();
                });
            }
        }

        if (changes['externalID'] && changes['externalID'].currentValue && this.tableConfig) {
            const expressionFilterValues: Array<IExpressionFilterValue> = [
                {
                    expression: 'currentuserid',
                    value: this.currentUserGlobalIdentity
                },
                {
                    expression: 'externalid',
                    value: this.externalID.toString()
                }
            ];

            this.tableConfig.setExpressionFilterValues(expressionFilterValues);
            this.tableConfig = _.cloneDeep(this.tableConfig);
            this.table.refreshTableData();
            this.setupTableConfig();
        }
    }

    private loadQueryDefinition() {
        this.fields = [];
        this.filters = [];
        this.selects = '';
        this.expands = '';

        if (this.queryDefinitionID > 0) {
            this.uniQueryDefinitionService.Get(this.queryDefinitionID, ['UniQueryFilters', 'UniQueryFields'])
                .subscribe(res => {
                        this.queryDefinition = res;

                        if (this.queryDefinition.UniQueryFields.filter(x => x.Index).length > 0) {
                            // Index is specified for the fields, the fields to reflect this
                            this.queryDefinition.UniQueryFields.sort(
                                (a, b) => (a.Index ? a.Index : 0) - (b.Index ? b.Index : 0)
                            );
                        }

                        this.queryDefinition.UniQueryFields.forEach((field: UniQueryField) => {
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
                                    f.selectConfig = {
                                        options: statusCodes,
                                        displayField: 'name',
                                        valueField: 'statusCode'
                                    };
                                }
                            }

                            this.fields.push(f);
                        });

                        this.queryDefinition.UniQueryFilters.forEach((field: UniQueryFilter) => {
                            const f: ITableFilter = {
                                field: field.Field,
                                operator: field.Operator,
                                value: field.Value,
                                group: field.Group,
                                selectConfig: null
                            };

                            this.filters.push(f);
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

    private setupTableConfig() {
        // Define columns to use in the table
        const columns: Array<UniTableColumn> = [];
        const expands: Array<string> = [];
        const selects: Array<string> = [];
        let navigateURL: string;
        const title = this.queryDefinition.MainModelName.slice(8, this.queryDefinition.MainModelName.length);

        if (this.queryDefinition.MainModelName.startsWith('Customer')) {
            if (title === 'Quote') {
                this.buttonTitle = 'Nytt tilbud';
                navigateURL = `/sales/quotes/0;customerID=${this.customerID}`;
            } else if (title === 'Order') {
                this.buttonTitle = 'Ny ordre';
                navigateURL = `/sales/orders/0;customerID=${this.customerID}`;
            } else if (title === 'Invoice') {
                this.buttonTitle = 'Ny faktura';
                navigateURL = `/sales/invoices/0;customerID=${this.customerID}`;
            }

            if (this.projectID > 0) {
                navigateURL += `;projectID=${this.projectID}`;
            }

            this.buttonAction = () => this.router.navigateByUrl(navigateURL);
        } else if (this.queryDefinition.MainModelName.startsWith('Supplier')) {
            if (title === 'Invoice') {
                this.buttonTitle = 'Nytt fakturamottak';
                navigateURL = `/accounting/bills/0`;
            }

            if (this.queryDefinition.ModuleID === UniModules.Projects) {
                navigateURL += `;projectID=${this.externalID}`;
            } else {
                navigateURL += `;supplierID=${this.externalID}`;
            }

            this.buttonAction = () => this.router.navigateByUrl(navigateURL);
        } else {
            this.buttonTitle = '';
            this.buttonAction = () => {};
        }

        for (let i = 0; i < this.fields.length; i++) {
            const field = this.fields[i];

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

            col.selectConfig = field.selectConfig;

            columns.push(col);

            if (field.path && field.path !== '') {
                if (field.path.indexOf('(') === -1) {
                    if (!expands.find(x => field.path === x)) {
                        expands.push(field.path);
                    }
                }
            }

            selects.push(selectableColName + ' as ' + aliasColName);
        }

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

        const expressionFilterValues: Array<IExpressionFilterValue> = [
            {
                expression: 'currentuserid',
                value: this.currentUserGlobalIdentity
            }
        ];

        // if externalID is supplied (when using uniquery as a sub component), send the expressionfiltervalue
        if (this.externalID) {
            expressionFilterValues.push(
                {
                    expression: 'externalid',
                    value: this.externalID.toString()
                }
            );
        } else {
            this.filters = this.filters.filter(filter => filter.value !== ':externalid');
        }

        // Setup table
        const companyKey = this.authService.getCompanyKey();
        const configStoreKey = `uniQueryReadonly.${companyKey}.${this.queryDefinitionID}`;

        this.tableConfig = new UniTableConfig(configStoreKey, false, true, 50)
            .setSearchable(true)
            .setAllowGroupFilter(true)
            .setColumnMenuVisible(true)
            .setExpressionFilterValues(expressionFilterValues)
            .setFilters(this.filters)
            .setDataMapper((data) => {
                const tmp = data !== null ? data.Data : [];

                if (data !== null && data.Message !== null && data.Message !== '') {
                    this.toastService.addToast('Feil ved henting av data, ' + data.Message, ToastType.bad);
                }

                return tmp;
            })
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
        const selectedObject = event.rowModel;

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
