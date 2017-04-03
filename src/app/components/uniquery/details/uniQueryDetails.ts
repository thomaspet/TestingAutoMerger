import {Component, ViewChild, Input} from '@angular/core';
import {UniTable, UniTableColumn, UniTableColumnType, UniTableConfig, ITableFilter, IExpressionFilterValue} from 'unitable-ng2/main';
import {Router, ActivatedRoute, RouterLink} from '@angular/router';
import {URLSearchParams} from '@angular/http';
import {UniHttp} from '../../../../framework/core/http/http';
import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';
import {UniSave, IUniSaveAction} from '../../../../framework/save/save';
import {StatisticsService, UniQueryDefinitionService, StatusService} from '../../../services/services';
import {AuthService} from '../../../../framework/core/authService';
import {SaveQueryDefinitionModal} from './saveQueryDefinitionModal';
import {UniQueryDefinition, UniQueryField, UniQueryFilter} from '../../../../app/unientities';
import {ContextMenu} from '../../common/contextMenu/contextMenu';
import {IContextMenuItem} from 'unitable-ng2/main';
import {ToastService, ToastType} from '../../../../framework/uniToast/toastService';
import {ErrorService} from '../../../services/services';
import {IToolbarConfig} from './../../common/toolbar/toolbar';
declare var _;

import {saveAs} from 'file-saver';

@Component({
    selector: 'uni-query-details',
    templateUrl: './uniQueryDetails.html'
})
export class UniQueryDetails {
    @ViewChild(UniTable) table: UniTable;
    @ViewChild(SaveQueryDefinitionModal) saveQueryDefinitionModal: SaveQueryDefinitionModal;

    // externalID is used when using this report from another component, e.g. as a sub component
    // in the customerDetails view. This way it is easy to set that the context of the uniquery
    // is a specific ID, this customers ID in this case
    @Input() public externalID: string;

    private models: any;
    private visibleModels: any;
    private tableConfig: UniTableConfig;
    private lookupFunction: (urlParams: URLSearchParams) => any;

    private fields: Array<UniTableColumn> = [];
    private filters: Array<ITableFilter> = [];
    private selects: string;
    private expands: string;
    private filterObject: { filter: string } ;

    private showAllFields: boolean = false;
    private showAllModels: boolean = false;
    private queryDefinition: UniQueryDefinition;
    private queryDefinitionID: number;
    private editMode: boolean = false;
    private hideModel: boolean = true;
    private showExternalID: boolean = false;
    private customExternalID: string;

    private currentUserGlobalIdentity: string = '';

    private toolbarconfig: IToolbarConfig = {};

    private contextMenuItems: IContextMenuItem[] = [];
    private saveactions: IUniSaveAction[] = [];

    constructor(
        private uniHttpService: UniHttp,
        private router: Router,
        private route: ActivatedRoute,
        private tabService: TabService,
        private statisticsService: StatisticsService,
        private uniQueryDefinitionService: UniQueryDefinitionService,
        private toastService: ToastService,
        private authService: AuthService,
        private statusService: StatusService,
        private errorService: ErrorService
    ) {

        this.route.params.subscribe(params => {
            this.queryDefinitionID = +params['id'];

            // a lot of queries depend on the status cache being ready, load before loading the query
            this.statusService.loadStatusCache().then(x => {
                this.loadQueryDefinition();
            });
        });

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
                .GetAllByUrlSearchParams(params)
                .catch((err, obs) => this.errorService.handleRxCatch(err, obs));
        };
    }

    private updateToolbarConfig() {
        if (this.queryDefinition) {
            this.toolbarconfig = {
                title: this.queryDefinition.ID > 0 ? this.queryDefinition.Name : 'Nytt uttrekk',
                subheads: [{title: this.queryDefinition.ID > 0 ? this.queryDefinition.Description : ''}],
                navigation: {
                    add: () => this.newUniQuery()
                },
                contextmenu: this.contextMenuItems
            };
        }
    }

    private newUniQuery() {
        this.router.navigateByUrl('/uniqueries/details/0');
    }

    private deleteQuery() {
        if (confirm('Er du sikker på at du vil slette dette uttrekket?')) {

            if (this.queryDefinitionID > 0) {
                this.uniQueryDefinitionService
                    .Remove(this.queryDefinitionID, this.queryDefinition)
                    .subscribe((res) => {
                        // query was deleted, navigate to overview
                        this.router.navigateByUrl('/uniqueries/overview');
                    },
                        err => this.errorService.handle(err)
                );
            } else {
                // query has never been saved, so just redirect to overview without doing anything
                this.router.navigateByUrl('/uniqueries/overview');
            }
        }
    }

    private getIsEditMode() {
        return this.editMode;
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

                    this.tabService.addTab({ name: this.queryDefinition.Name, url: '/uniqueries/details/' + this.queryDefinitionID, moduleID: UniModules.UniQuery, active: true });

                    if (this.queryDefinition.UniQueryFields.filter(x => x.Index).length > 0) {
                        // Index is specified for the fields, sort the fields to reflect this
                        this.queryDefinition.UniQueryFields.sort((a, b) => (a.Index ? a.Index : 0) - (b.Index ? b.Index : 0));
                    }

                    this.queryDefinition.UniQueryFields.forEach((field: UniQueryField) => {
                       let f: UniTableColumn = new UniTableColumn();
                       f.alias = field.Alias;
                       f.field = field.Field;
                       f.header = field.Header;
                       f.path = field.Path;
                       f.sumFunction = field.SumFunction;
                       f.width = field.Width;
                       f.index = field.Index;
                       f.type = field.FieldType;

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

                    this.editMode = false;
                    this.hideModel = true;

                    this.updateSaveActions();
                    this.updateContextMenu();
                    this.updateToolbarConfig();
                },
                err => this.errorService.handle(err));
        } else {
            this.tabService.addTab({ name: 'Nytt uttrekk', url: '/uniqueries/details/0', moduleID: UniModules.UniQuery, active: true });

            this.queryDefinition = new UniQueryDefinition();
            this.queryDefinition.ID = 0;
            this.queryDefinition.IsShared = true;
            this.queryDefinition.UniQueryFields = [];
            this.queryDefinition.UniQueryFilters = [];

            this.editQuery(() => {});
        }
    }

    private setupTableConfig() {

        // Define columns to use in the table
        let columns: Array<UniTableColumn> = [];
        let expands: Array<string> = [];
        let selects: Array<string> = [];

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

            // keep this for debugging for now
            // console.log('setupTableConfig, add column. colName: ' + colName + ', selectableColName: ' + selectableColName + ', aliasColName: ' + aliasColName);

            let col = new UniTableColumn(selectableColName, field.header, field.type || UniTableColumnType.Text);
            col.alias = aliasColName;
            col.path = field.path;
            col.width = field.width;
            col.sumFunction = field.sumFunction;
            col.type = field.type;

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

        // show editor for externalid if externalID is not set and a filter using :externalid is specified
        if (!this.externalID && this.filters.find(x => x.value === ':externalid')) {
            this.showExternalID = true;
            if (!this.customExternalID) {
                this.customExternalID = '1';
            }
        }

        // if externalID is supplied (when using uniquery as a sub component), send the expressionfiltervalue
        if (this.externalID) {
            expressionFilterValues.push(
                {
                    expression: 'externalid',
                    value: this.externalID.toString()
                }
            );
        } else if (this.customExternalID) {
            expressionFilterValues.push(
                {
                    expression: 'externalid',
                    value: this.customExternalID.toString()
                }
            );
        } else {
            expressionFilterValues.push(
                {
                    expression: 'externalid',
                    value: '1'
                }
            );
        }

        // Setup table
        this.tableConfig = new UniTableConfig(false, true, 50)
            .setSearchable(true)
            .setAllowGroupFilter(true)
            .setAllowConfigChanges(this.editMode)
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

    private exportReportToExcel(completeEvent) {
        let expands: Array<string> = [];
        let selects: Array<string> = [];

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

            // keep this for debugging for now
            // console.log('exportReportToExcel, add column. colName: ' + colName + ', selectableColName: ' + selectableColName + ', aliasColName: ' + aliasColName);

            if (field.path && field.path !== '') {
                if (field.path.indexOf('(') === -1) {
                    if (!expands.find(x => field.path === x)) {
                        expands.push(field.path);
                    }
                }
            }

            selects.push(selectableColName + ' as ' + aliasColName);
        }

        this.selects = selects.join(',');
        this.expands = expands.join(',');
        let headers = this.fields.map(x => x.header).join(',');

        // execute request to create Excel file
        this.statisticsService
            .GetExportedExcelFile(this.queryDefinition.MainModelName, this.selects, this.filterObject.filter, this.expands, headers, null)
                .subscribe((blob) => {
                    // download file so the user can open it
                    saveAs(blob, 'export.csv');
                },
                err => this.errorService.handle(err));

        completeEvent('Eksport kjørt');
    }

    private isFunction(field: string): boolean {
        return field.indexOf('(') > -1 && field.indexOf(')') > -1;
    }

    private onRowSelected(event) {
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

    private onColumnsChange(newColumns: Array<UniTableColumn>) {
        let newColumnSetup: Array<UniTableColumn> = [];

        newColumns.forEach((column: UniTableColumn) => {
            let newCol: UniTableColumn = column;

            if (this.isFunction(column.field)) {
                // this is a function, dont analyze this field. Users can add crazy expressions such
                // as "sum(casewhen(JournalEntryLine.Amount gt 1000\,JournalEntryLine.Amount\,0))" and this
                // will be quite complex to analyze here (also, it is analyzed in the api either way)
            } else {
                // if no path is set, try to extract it from the field name, e.g Account.AccountName --> Account
                if (!newCol.path || newCol.path === '') {
                    newCol.path = column.field.substring(0, column.field.lastIndexOf('.'));
                }

                newCol.field = column.field.substring(column.field.lastIndexOf('.') + 1);
            }

            // assume user wants % width if nothing else is specified (i.e. allow also)
            if (column.width != null && !isNaN(Number(column.width))) {
                column.width = column.width + '%';
            }

            newColumnSetup.push(newCol);
        });

        this.fields = newColumnSetup;

        this.setupTableConfig();
    }

    private onFiltersChange(newFilters) {
        this.filterObject = newFilters;

        // table may not be fully initialized yet, so run on next cycle to make sure this.table exists
        setTimeout(() => {
            if (this.table) {
                this.filters = this.table.getAdvancedSearchFilters();

                // show editor for externalid if externalID is not set and a filter using :externalid is specified
                if (!this.externalID && this.filters.find(x => x.value === ':externalid')) {
                    this.showExternalID = true;
                    if (!this.customExternalID) {
                        this.customExternalID = '1';
                    }
                }
            }
        });
    }

    private customExternalIdChanged() {
        this.setupTableConfig();
    }

    private editQuery(completeEvent) {
        this.editMode = true;
        this.hideModel = false;

        this.updateSaveActions();
        this.updateContextMenu();
        this.updateToolbarConfig();
        this.setupTableConfig();

        completeEvent('');
    }

    private showHideModel() {
        this.hideModel = !this.hideModel;
        this.updateContextMenu();
        this.updateToolbarConfig();
    }

    private showHideAllModels() {
        this.showAllModels = !this.showAllModels;
    }

    private showHideAllFields() {
        this.showAllFields = !this.showAllFields;
    }

    private saveQuery(saveAsNewQuery: boolean, completeEvent) {
        // work on a cloned queryDefinition, this is done to avoid potential problems
        // if the user aborts without clicking save in the modal
        let definition = _.cloneDeep(this.queryDefinition);

        if (saveAsNewQuery) {
            definition.ID = 0;
        }

        // Keep track of the existing fields/filters, we need to set these as deleted if they are no longer used.
        // If we are saving as a new query, this does not matter
        let oldQueryFields = saveAsNewQuery ? [] : definition.UniQueryFields;
        let oldQueryFilters = saveAsNewQuery ? [] : definition.UniQueryFilters;

        definition.UniQueryFields = new Array<UniQueryField>();
        definition.UniQueryFilters = new Array<UniQueryFilter>();

        // map fields to backend structure
        if (this.fields) {
            this.fields.forEach((field: UniTableColumn) => {

                let f: UniQueryField = null;

                if (!saveAsNewQuery) {
                    // check if field already exists, i.e. this is a saved query we are editing
                    f = oldQueryFields.find(x => x.Field === field.field && x.Path === field.path);

                    // if the field existed before, remove it from "oldQueryFields" to keep track of which fields we are still using
                    if (f) {
                        oldQueryFields = oldQueryFields.filter(x => x !== f);
                    }
                }

                if (f === null || f === undefined) {
                    f = new UniQueryField();
                    f.ID = 0;
                    f.Field = field.field;
                    f.Path = field.path;

                    f['_createguid'] = this.uniQueryDefinitionService.getNewGuid();
                }

                f.Alias = field.alias;
                f.Header = field.header;
                f.SumFunction = field.sumFunction;
                f.Width = field.width;
                f.Index = field.index;
                f.FieldType = field.type;

                definition.UniQueryFields.push(f);
            });
        }

        // set old fields that are no longer used as deleted (utilize complex put in the API)
        oldQueryFields.forEach(f => {
            if (f.ID > 0) {
                f.Deleted = true;
                definition.UniQueryFields.push(f);
            }
        });

        // map filters to backend structure
        if (this.filters) {
            this.filters.forEach((filter: ITableFilter) => {

                let f: UniQueryFilter = null;

                if (!saveAsNewQuery) {
                    // check if filter already exists, i.e. this is a saved query we are editing
                    f = oldQueryFilters.find(x => x.Field === filter.field);

                    // if the field existed before, remove it from "oldQueryFilters" to keep track of which filters we are still using
                    if (f) {
                        oldQueryFilters = oldQueryFilters.filter(x => x !== f);
                    }
                }

                if (f === null || f === undefined) {
                    f = new UniQueryFilter();
                    f.ID = 0;
                    f.Field = filter.field;

                    f['_createguid'] = this.uniQueryDefinitionService.getNewGuid();
                }

                f.Field = filter.field;
                f.Operator = filter.operator;
                f.Value = filter.value.toString();
                f.Group = filter.group;

                definition.UniQueryFilters.push(f);
            });
        }

        // set old filters that are no longer used as deleted (utilize complex put in the API)
        oldQueryFilters.forEach(f => {
            if (f.ID > 0) {
                f.Deleted = true;
                definition.UniQueryFilters.push(f);
            }
        });

        this.saveQueryDefinitionModal.openModal(definition, saveAsNewQuery);
        completeEvent('');
    }

    private onSaved(savedQueryDefinition: UniQueryDefinition) {
        if (this.queryDefinitionID !== savedQueryDefinition.ID) {
            this.router.navigateByUrl('/uniqueries/details/' + savedQueryDefinition.ID);
        } else {
            this.loadQueryDefinition();
        }
    }

    private addOrRemoveFieldFromChild(event){
        this.addOrRemoveField(event.model, event.fieldname, event.field, event.path);
    }

    private addOrRemoveField(model, fieldname, field, path) {
        if (!this.editMode) {
            alert('Du kan ikke legge til eller fjerne felter uten å først velge "Endre uttrekk" i knappen nederst i skjermbildet');
            return;
        }

        let existingField = this.fields.find(x => (x.field === fieldname && x.path === path) || (x.field === fieldname && x.path === undefined) || (x.field === fieldname && x.path === this.queryDefinition.MainModelName));

        if (existingField) {
            this.fields = this.fields.filter(x => x !== existingField);
            field.Selected = false;

            this.setupTableConfig();
            return;
        }

        if (this.fields.length === 0) {
            this.queryDefinition.MainModelName = model.Name;
        }

        if (model.Name !== this.queryDefinition.MainModelName) {
            alert(`Du kan ikke legge til felter fra ${model.Name}, du har valgt ${this.queryDefinition.MainModelName} som hovedmodellen din

Hvis du vil hente felter som ligger under ${model.Name} må dette enten hentes ut via relasjoner til ${this.queryDefinition.MainModelName} eller du må velge ${model.Name} som hovedmodell ved å kun hente felter som ligger under den modellen`);
            return;
        } else {
            model.Selected = true;
        }

        field.Selected = true;

        let colType: UniTableColumnType;
        if (field.Type.toString().indexOf('System.Int32') !== -1) {
            colType = UniTableColumnType.Number;
        } else if (field.Type.toString().indexOf('System.Decimal') !== -1) {
            colType = UniTableColumnType.Money;
        } else if (field.Type.toString().indexOf('System.Boolean') !== -1) {
            colType = UniTableColumnType.Boolean;
        } else if (field.Type.toString().indexOf('System.DateTime') !== -1
                    || field.Type.toString().indexOf('NodaTime.LocalDate') !== -1) {
            colType = UniTableColumnType.LocalDate;
        } else {
            colType = UniTableColumnType.Text;
        }

        let newCol = new UniTableColumn(field.Publicname, field.Publicname, colType);
        newCol.path = path;

        this.fields.push(newCol);

        this.setupTableConfig();
    }

    private updateSaveActions() {
        this.saveactions = [];

        this.saveactions.push(
            {
                label: 'Eksporter til Excel',
                action: (completeEvent) => this.exportReportToExcel(completeEvent),
                main: true,
                disabled: false
            }
         );

         this.saveactions.push(
            {
                label: 'Lagre uttrekk..',
                action: (completeEvent) => this.saveQuery(false, completeEvent),
                main: false,
                disabled: !this.editMode
            }
         );

         this.saveactions.push(
            {
                label: 'Lagre som nytt uttrekk..',
                action: (completeEvent) => this.saveQuery(true, completeEvent),
                main: false,
                disabled: !this.editMode
            }
         );

         this.saveactions.push(
            {
                label: 'Endre uttrekk..',
                action: (completeEvent) => this.editQuery(completeEvent),
                main: false,
                disabled: this.editMode
            }
         );
    }

    private updateContextMenu() {
        this.contextMenuItems = [];
        this.contextMenuItems.push(
            {
                label: 'Vis/skjul modelltre',
                action: () => this.showHideModel(),
                disabled: () => !this.editMode
            }
        );

        if (!this.hideModel) {
            this.contextMenuItems.push(
                {
                    label: 'Vis/skjul lite brukte modeller',
                    action: () => this.showHideAllModels(),
                    disabled: () => this.hideModel
                }
            );
            this.contextMenuItems.push(
                {
                    label: 'Vis/skjul lite brukte felter',
                    action: () => this.showHideAllFields(),
                    disabled: () => this.hideModel
                }
            );
        }

        this.contextMenuItems.push(
            {
                label: 'Slett uttrekk',
                action: () => this.deleteQuery(),
                disabled: () => false
            }
        );
    }
}
