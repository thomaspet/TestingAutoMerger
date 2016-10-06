import {Component, ViewChild} from '@angular/core';
import {UniTable, UniTableColumn, UniTableColumnType, UniTableConfig, ITableFilter} from 'unitable-ng2/main';
import {Router, ActivatedRoute, RouterLink} from '@angular/router';
import {URLSearchParams} from '@angular/http';
import {UniHttp} from '../../../../framework/core/http/http';
import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';
import {UniSave, IUniSaveAction} from '../../../../framework/save/save';
import {StatisticsService, UniQueryDefinitionService} from '../../../services/services';
import {RelationNode} from './relationNode';
import {SaveQueryDefinitionModal} from './saveQueryDefinitionModal';
import {UniQueryDefinition, UniQueryField, UniQueryFilter} from '../../../../app/unientities';
import {ContextMenu} from '../../common/contextMenu/contextMenu';
import {IContextMenuItem} from 'unitable-ng2/main';
import {ToastService, ToastType} from '../../../../framework/uniToast/toastService';


declare const saveAs;
declare const _; // lodash

@Component({
    selector: 'uni-query-details',
    templateUrl: 'app/components/uniquery/details/uniQueryDetails.html'
})
export class UniQueryDetails {
    @ViewChild(UniTable) table: UniTable;
    @ViewChild(SaveQueryDefinitionModal) saveQueryDefinitionModal: SaveQueryDefinitionModal;

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

    private contextMenuItems: IContextMenuItem[] = [];
    private saveactions: IUniSaveAction[] = [];

    constructor(private uniHttpService: UniHttp,
                private router: Router,
                private route: ActivatedRoute,
                private tabService: TabService,
                private statisticsService: StatisticsService,
                private uniQueryDefinitionService: UniQueryDefinitionService,
                private toastService: ToastService) {

        this.route.params.subscribe(params => {
            this.queryDefinitionID = +params['id'];
            this.setupModelData();
            this.loadQueryDefinition();
        });

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
                .GetAllByUrlSearchParams(params);
        };
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
                    err => {
                        console.log('Error deleting query', err);
                    }
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
                    this.tabService.addTab({ name: 'Uttrekk', url: '/uniqueries/details/' + this.queryDefinitionID, moduleID: UniModules.UniQuery, active: true });
                    this.queryDefinition = res;

                    this.queryDefinition.UniQueryFields.forEach((field: UniQueryField) => {
                       let f: UniTableColumn = new UniTableColumn();
                       f.alias = field.Alias;
                       f.field = field.Field;
                       f.header = field.Header;
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

                    this.editMode = false;
                    this.hideModel = true;

                    this.setDefaultExpandedModels();
                    this.updateSaveActions();
                    this.updateContextMenu();
                },
                err => {
                    console.log('error loading querydef', err);
                    this.toastService.addToast('Feil ved henting av uttrekk, se logg for mer informasjon', ToastType.bad);
                });
        } else {
            this.queryDefinition = new UniQueryDefinition();
            this.queryDefinition.ID = 0;
            this.queryDefinition.IsShared = true;
            this.queryDefinition.UniQueryFields = [];
            this.queryDefinition.UniQueryFilters = [];

            this.editQuery(() => {});
        }
    }

    private setupModelData() {
        this.uniHttpService
            .usingMetadataDomain()
            .asGET()
            .withEndPoint('allmodels')
            .send()
            .map(response => response.json())
            .subscribe((models) => {
                this.models = models;
                this.setDefaultExpandedModels();
                this.filterModels();
            },
            err => console.log('Error getting models:', err)
        );
    }

    private setDefaultExpandedModels() {
        if (this.queryDefinition && this.queryDefinition.MainModelName && this.models) {
            let mainModel = this.models.find(x => x.Name === this.queryDefinition.MainModelName);

            if (mainModel) {
                mainModel.Expanded = true;
                mainModel.Selected = true;

                // place the active mainmodel at top of the treeview
                this.models = this.models.filter(x => x !== mainModel);
                this.models.unshift(mainModel);
            }
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
            console.log('setupTableConfig, add column. colName: ' + colName + ', selectableColName: ' + selectableColName + ', aliasColName: ' + aliasColName);

            let col = new UniTableColumn(selectableColName, field.header);
            col.alias = aliasColName;
            col.path = field.path;
            col.width = field.width;
            col.sumFunction = field.sumFunction;

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

        this.selects = selects.join(',');
        this.expands = expands.join(',');

        // Setup table
        this.tableConfig = new UniTableConfig(false, true, 50)
            .setSearchable(true)
            .setAllowGroupFilter(true)
            .setAllowConfigChanges(this.editMode)
            .setColumnMenuVisible(true)
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
            console.log('exportReportToExcel, add column. colName: ' + colName + ', selectableColName: ' + selectableColName + ', aliasColName: ' + aliasColName);

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
            .GetExportedExcelFile(this.queryDefinition.MainModelName, this.selects, this.filterObject.filter, this.expands, headers)
                .subscribe((blob) => {
                    // download file so the user can open it
                    saveAs(blob, 'export.csv');
                },
                err => {
                    console.log('Error exporting data', err);
                });

        completeEvent('Eksport kjørt');
    }

    private isFunction(field: string): boolean {
        return field.indexOf('(') > -1 && field.indexOf(')') > -1;
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
            }
        });
    }

    private editQuery(completeEvent) {
        this.editMode = true;
        this.hideModel = false;

        this.updateSaveActions();
        this.updateContextMenu();
        this.setupTableConfig();

        completeEvent('');
    }

    private showHideModel() {
        this.hideModel = !this.hideModel;
        this.updateContextMenu();
    }

    private showHideAllModels() {
        this.showAllModels = !this.showAllModels;

        // trick to make angular redraw model tree
        this.models = _.cloneDeep(this.models);
    }

    private showHideAllFields() {
        this.showAllFields = !this.showAllFields;

        // trick to make angular redraw model tree
        this.models = _.cloneDeep(this.models);
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

    private filterModels() {
        let models = this.models.filter(x => this.showAllModels || this.statisticsService.checkShouldShowEntity(x.Name));

        models.forEach(model => {
            model.fieldArray = Object.keys(model.Fields).filter(x => this.showAllFields || this.statisticsService.checkShouldShowField(x));

            let fieldsOnTopLevelModels = this.fields
                .filter((field: UniTableColumn) => field.path === null || field.path === '' || field.path === this.queryDefinition.MainModelName);

            fieldsOnTopLevelModels.forEach((field: UniTableColumn) => {
                let selectedField = model.fieldArray.find(x => x === field.field.toLowerCase());

                if (selectedField !== undefined) {
                    model.Fields[field.field.toLowerCase()].Selected = true;
                }
            });
        });

        this.visibleModels = models;
    }

    private expandModel(model) {
        if (model.Expanded === null) {
            model.Expanded = true;
        } else {
            model.Expanded = !model.Expanded;
        }
    }

    private expandRelation(relation) {
        if (relation.Expanded === null) {
            relation.Expanded = true;
        } else {
            relation.Expanded = !relation.Expanded;
        }
    }

    private addOrRemoveFieldFromChild(model, event){
        this.addOrRemoveField(model, event.fieldname, event.field, event.path);
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
            alert(`Du kan ikke legge til felter fra ${model.Name}, du har valgt ${this.queryDefinition.MainModelName} som hovedmodellen din\n\n
Hvis du vil hente felter som ligger under ${model.Name} må dette enten hentes ut via relasjoner til ${this.queryDefinition.MainModelName}
eller du må velge ${model.Name} som hovedmodell ved å kun hente felter som ligger under den modellen`);

            return;
        } else {
            model.Selected = true;
        }

        field.Selected = true;

        let newCol = new UniTableColumn();
        newCol.field = field.Publicname;
        newCol.header = field.Publicname;
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
