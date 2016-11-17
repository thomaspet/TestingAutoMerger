import {Component, ViewChild, Input, OnChanges, SimpleChanges} from '@angular/core';
import {UniTable, UniTableColumn, UniTableConfig, ITableFilter, IExpressionFilterValue} from 'unitable-ng2/main';
import {Router} from '@angular/router';
import {URLSearchParams} from '@angular/http';
import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';
import {StatisticsService, UniQueryDefinitionService, StatusService} from '../../../services/services';
import {AuthService} from '../../../../framework/core/authService';
import {UniQueryDefinition, UniQueryField, UniQueryFilter} from '../../../../app/unientities';
import {ToastService, ToastType} from '../../../../framework/uniToast/toastService';
import {ErrorService} from '../../../services/common/ErrorService';

@Component({
    selector: 'uni-query-read-only',
    templateUrl: 'app/components/common/uniQuery/UniQueryReadOnly.html'
})
export class UniQueryReadOnly implements OnChanges {
    // externalID is used when using this report from another component, e.g. as a sub component
    // in the customerDetails view. This way it is easy to set that the context of the uniquery
    // is a specific ID, this customers ID in this case
    @Input() public externalID: number;
    @Input() public queryDefinitionID: number;
    @Input() public hidden: boolean;

    private tableConfig: UniTableConfig;
    private lookupFunction: (urlParams: URLSearchParams) => any;

    private fields: Array<UniTableColumn>;
    private filters: Array<ITableFilter>;
    private selects: string;
    private expands: string;
    private queryDefinition: UniQueryDefinition;
    private buttonTitle: string;
    private buttonAction: any;

    private currentUserGlobalIdentity: string = '';

    constructor(
        private router: Router,
        private statisticsService: StatisticsService,
        private uniQueryDefinitionService: UniQueryDefinitionService,
        private toastService: ToastService,
        private authService: AuthService,
        private statusService: StatusService,
        private errorService: ErrorService
    ) {
        let token = this.authService.getTokenDecoded();
        if (token) {
            this.currentUserGlobalIdentity = token.nameid;
        }

        this.lookupFunction = (urlParams: URLSearchParams) => {
            let params = urlParams;

            if (params === null) {
                params = new URLSearchParams();
            }

            params.set('model', this.queryDefinition.MainModelName);
            params.set('select', this.selects);

            if (this.expands) {
                params.set('expand', this.expands);
            }

            return this.statisticsService
                .GetAllByUrlSearchParams(params).catch(this.errorService.handleRxCatch);
        };
    }

    public ngOnChanges(changes: SimpleChanges) {
        if (changes['hidden'] && changes['hidden'].currentValue === false) {
            if (!this.queryDefinition || this.queryDefinitionID !== this.queryDefinition.ID) {
                this.statusService.loadStatusCache().then(x => {
                    this.loadQueryDefinition();
                });
            }
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

                        this.queryDefinition.UniQueryFields.forEach((field: UniQueryField) => {
                            let f: UniTableColumn = new UniTableColumn();
                            f.field = field.Field;
                            f.header = field.Header;
                            f.type = field.FieldType;
                            f.alias = field.Alias;
                            f.path = field.Path;
                            f.sumFunction = field.SumFunction;
                            f.width = field.Width;
                            f.index = field.Index;

                            this.fields.push(f);
                        });

                        this.queryDefinition.UniQueryFilters.forEach((field: UniQueryFilter) => {
                            let f: ITableFilter = {
                                field: field.Field,
                                operator: field.Operator,
                                value: field.Value,
                                group: field.Group
                            };

                            this.filters.push(f);
                        });

                        this.setupTableConfig();
                    },
                    this.errorService.handle);
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
        let columns: Array<UniTableColumn> = [];
        let expands: Array<string> = [];
        let selects: Array<string> = [];

        if (this.queryDefinition.MainModelName.startsWith('Customer')) {
            var title = this.queryDefinition.MainModelName.slice(8, this.queryDefinition.MainModelName.length);
            if (title === 'Quote') {
                this.buttonTitle = 'Nytt tilbud';
                this.buttonAction = () => { this.router.navigateByUrl(`/sales/quotes/0;customerID=${this.externalID}`) }
            } else if (title === 'Order') {
                this.buttonTitle = 'Ny ordre';
                this.buttonAction = () => { this.router.navigateByUrl(`/sales/orders/0;customerID=${this.externalID}`) }
            } else if (title === 'Invoice') {
                this.buttonTitle = 'Ny faktura';
                this.buttonAction = () => { this.router.navigateByUrl(`/sales/invoices/0;customerID=${this.externalID}`) }
            }
        }

        for (let i = 0; i < this.fields.length; i++) {
            let field = this.fields[i];

            let colName = field.field;
            let aliasColName = '';
            let selectableColName = '';

            if (this.isFunction(field.field)) {
                // for functions, trust that the user knows what he/she is doing...
                selectableColName = colName;
                aliasColName = field.alias ? field.alias : this.queryDefinition.MainModelName + colName;

            } else if (field.path && field.path !== undefined && field.path !== '' ? field.path + '.' : '') {
                let prefix = field.path;

                if (field.path.indexOf('.') > 0) {
                    let lastIndex = field.path.lastIndexOf('.');
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
            let col = new UniTableColumn(selectableColName, field.header, field.type);
            col.alias = aliasColName;
            col.path = field.path;
            col.width = field.width;
            col.sumFunction = field.sumFunction;

            if (selectableColName.toLowerCase().endsWith('statuscode')) {
                col.template = (rowModel) => this.statusCodeToText(rowModel[aliasColName]);
            }

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
            let params: Array<string> = this.queryDefinition.ClickParam.split(',');

            params.forEach(param => {
                let paramAlias = param.replace('.', '');
                let paramSelect = param + ' as ' + paramAlias;

                if (!selects.find(x => x === paramSelect)) {
                    console.log('add extra field to select: ' + paramSelect);
                    selects.push(paramSelect);
                }
            });
        }

        this.selects = selects.join(',');
        this.expands = expands.join(',');

        let expressionFilterValues: Array<IExpressionFilterValue> = [
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
        this.tableConfig = new UniTableConfig(false, true, 50)
            .setSearchable(true)
            .setAllowGroupFilter(true)
            .setColumnMenuVisible(true)
            .setExpressionFilterValues(expressionFilterValues)
            .setFilters(this.filters)
            .setDataMapper((data) => {
                let tmp = data !== null ? data.Data : [];

                if (data !== null && data.Message !== null && data.Message !== '') {
                    this.toastService.addToast('Feil ved henting av data, ' + data.Message, ToastType.bad);
                }

                return tmp;
            })
            .setColumns(columns);
    }

    private statusCodeToText(statusCode: number): string {
        let text: string = this.statusService.getStatusText(statusCode);
        return text || (statusCode ? statusCode.toString() : '');
    }

    private isFunction(field: string): boolean {
        return field.indexOf('(') > -1 && field.indexOf(')') > -1;
    }

    public onRowSelected(event) {
        let selectedObject = event.rowModel;

        if (this.queryDefinition.ClickUrl) {
            let url = this.queryDefinition.ClickUrl;

            // replace values in parameters with values from the selected row before navigating
            if (this.queryDefinition.ClickParam) {
                let params: Array<string> = this.queryDefinition.ClickParam.split(',');

                params.forEach(param => {
                    let paramAlias = param.replace('.', '');
                    url = url.replace(`:${param}`, selectedObject[paramAlias]);
                });
            }

            this.router.navigateByUrl(url);
        }
    }
}
