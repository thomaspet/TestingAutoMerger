import {Component, Input, Output, EventEmitter} from '@angular/core';
import {UniTableConfig, UniTableColumn, UniTableColumnType} from 'unitable-ng2/main';
import {TimesheetService, TimeSheet, ValueItem} from '../../../services/timetracking/timesheetservice';
import {ToastService, ToastType} from '../../../../framework/unitoast/toastservice';
import {ErrorService, BrowserStorageService} from '../../../services/services';
import {safeDec, filterInput} from './utils';
import {Observable} from 'rxjs/Observable';
import {WorkType} from '../../../unientities';

declare var moment;

interface ICurrent {
    workerID?: number;
    workRelationID?: number;
    startDate?: Date;
    endDate?: Date;
    isInitialized: boolean;
}

@Component({
    selector: 'workeditor',
    template: `<uni-table class="compactcells" [resource]="timeSheet?.items" [config]="tableConfig"
        (rowSelected)="onRowSelected($event)" (rowDeleted)="onRowDeleted($event)"
        (columnVisibilityChange)="oncolumnVisibilityChange($event)">
    </uni-table>`
})
export class WorkEditor {
    @Input('timesheet') public set TimeSheetSetter(value: TimeSheet) {
        this.timeSheet = value;
        this.tryInit();
    }
    @Output() public valueChanged: EventEmitter<any> = new EventEmitter();
    @Output() public rowDeleted: EventEmitter<any> = new EventEmitter();
    // @ViewChild(UniTable) private uniTable: UniTable;
    private tableConfig: UniTableConfig;
    private timeSheet: TimeSheet = new TimeSheet();
    private workTypes: Array<WorkType> = [];
    private visibleColumns: Array<string>;

    public get numberOfVisibleColumns(): number {
        return this.visibleColumns.length;
    }

    constructor(
        private timesheetService: TimesheetService, 
        private errorService: ErrorService,
        private toast: ToastService,
        private localStore: BrowserStorageService) {
            this.loadUserSettings();
            // this.tableConfig = this.createTableConfig();
            this.initLookups();
    }

    public editRow(index: number) {
        this.toast.addToast('Venter på unitable feature...', 
        ToastType.good, 3, 'Klikk på nederse rad i tabellen for å begynne å registrere' );
        // this.uniTable.editRow( index );
    }

    private tryInit() {
        this.tableConfig = this.createTableConfig();
    }

    private initLookups() {
        this.timesheetService.workerService.query('worktypes', 'select', 'id,name').subscribe( 
            x => this.workTypes = x,
            err => this.errorService.handle(err));
    }

    public onRowSelected(event: any) {

    }

    public oncolumnVisibilityChange(cols: Array<UniTableColumn>) {
        var map = '';
        cols.filter( c => c.visible ).forEach( x => map += (map ? ',' : '') + x.field );
        this.visibleColumns = map.split(',');
        this.localStore.save('workeditor.columns', map, true);
        // todo: remove when unitable handles refresh without column-reset
        this.tableConfig = this.createTableConfig(); 
    }

    private loadUserSettings() {
        var map = this.localStore.get('workeditor.columns', true);
        if (map) {
            this.visibleColumns = map.split(',');
        }
    }

    public onRowDeleted(event: any) {
        var row = event.rowModel;
        var index = row['_originalIndex'];
        if (index === 0 || !!index ) {
            this.timeSheet.removeRow(index);
        }
        if (row.ID) {
            this.rowDeleted.emit(index);
        }
    }

    public onEditChange(event) {

        // this.toast.addToast('change:' + event.rowModel[event.field], 2, 2);

        var rowIndex = event.originalIndex;
        var newRow = event.rowModel;
        var change = new ValueItem(event.field, newRow[event.field], rowIndex);
        change.tag = (event.field === 'Minutes' || event.field === 'MinutesToOrder') ? 'Hours' : null;

        // Copycell ?
        if (rowIndex > 0) {
            let cellAboveValue = this.timeSheet.items[rowIndex - 1][event.field];
            if (change.value === cellAboveValue) {                
                change.isParsed = true;
            }
        }

        if (this.timeSheet.setItemValue(change)) {
            // debugger;
            this.valueChanged.emit(change);
            let xRow = this.timeSheet.items[rowIndex];
            xRow.originalIndex = rowIndex;
            xRow._originalIndex = rowIndex;
            return xRow;
        }
    }    

    private createTableConfig(): UniTableConfig {
        var cfg = new UniTableConfig(true, false, 50);
        cfg.columns = [ 
            new UniTableColumn('ID', 'ID', UniTableColumnType.Number).setVisible(false).setWidth('3rem')
                .setEditable(false),
            new UniTableColumn('Date', 'Dato', UniTableColumnType.LocalDate).setWidth('5rem'),
            this.createTimeColumn('StartTime', 'Start').setWidth('2.6rem').setAlignment('center'),
            this.createTimeColumn('EndTime', 'Slutt').setWidth('2.6rem').setAlignment('center'),
            this.createLookupColumn('Worktype', 'Timeart', 'Worktype', x => this.lookupType(x)).setWidth('6rem'),
            new UniTableColumn('LunchInMinutes', 'Lunsj', UniTableColumnType.Number)
                .setWidth('3rem').setAlignment('center'),
            this.createHourColumn('Minutes', 'Timer')
                .setWidth('3rem').setAlignment('center').setCls('ctoa'),

            new UniTableColumn('Description', 'Beskrivelse', UniTableColumnType.Text).setWidth('20%'),
            
            this.createLookupColumn('Dimensions.ProjectID', 'Prosjekt', 
                'Dimensions.Project', x => this.lookupAny(x, 'projects', 'projectnumber'), 'ProjectNumber' )
                .setWidth('6rem'),
            
            this.createLookupColumn('Dimensions.DepartmentID', 'Avdeling', 
                'Dimensions.Department', 
                x => this.lookupAny(x, 'departments', 'departmentnumber'), 'DepartmentNumber' )
                .setWidth('6rem')
                .setVisible(false),

            this.createHourColumn('MinutesToOrder', 'Timer til ordre').setWidth('6rem')
                .setVisible(false).setAlignment('center'),

            this.createLookupColumn('CustomerOrder', 'Ordre', 
                'CustomerOrder', 
                x => this.lookupAny(x, 'orders', 'ordernumber', 'customername'), 'OrderNumber', 'CustomerName' )
                .setWidth('6rem')
                .setVisible(false),

            new UniTableColumn('Label', 'Merke/etikett').setWidth('6rem').setCls('good')
                .setVisible(false)
                
        ];   
        cfg.deleteButton = true;
        cfg.autoAddNewRow = true;
        cfg.columnMenuVisible = true;
        cfg.allowConfigChanges = false;
        cfg.setChangeCallback( x => this.onEditChange(x) );        
        cfg.autoScrollIfNewCellCloseToBottom = true;

        if (!this.visibleColumns) {
            this.visibleColumns = [];
            cfg.columns.filter( x => x.visible ).forEach( y => this.visibleColumns.push(y.field) );
        } else {
            var map = this.visibleColumns;
            cfg.columns.forEach( x => x.visible = map.findIndex( y => y === x.field) >= 0 );
        }
        
        return cfg;     
    }

    public lookupType(txt: string) {
        debugger;
        var list = this.workTypes;
        var lcaseText = txt.toLowerCase();
        var sublist = list.filter((item: WorkType) => {
            return (item.ID.toString() === txt || item.Name.toLowerCase().indexOf(lcaseText) >= 0); } );
        return Observable.from([sublist]);        
    }

    public lookupAny(txt: string, route: string = 'projects', visualIdcol: string = 'id', nameCol: string = 'name') {
        var filter = '', orderBy = nameCol;
        var filtered = filterInput(txt);
        var select = 'id,' + nameCol;
        
        if (filtered.length > 0) {
            let num = parseInt(filtered);
            if (num > 0) {
                filter = `startswith(${visualIdcol}, '${num}')`;
                orderBy = visualIdcol;
            } else {
                filter = `contains(${nameCol},'${filtered}')`;
            }
        }
        select = visualIdcol === 'id' ? select : select + ',' + visualIdcol;

        return this.timesheetService.workerService.query(route, 
            'select', select, 
            'orderby', orderBy, 
            'top', '50',
            'filter', filter);
    }

    private createTimeColumn(name: string, label: string): UniTableColumn {
        return this.createFmtColumn(name, label, x => moment(x).format('HH:mm'));
    }

    private createHourColumn(name: string, label: string): UniTableColumn {
        return this.createFmtColumn(name, label, x => (safeDec(x) / 60).toFixed(1));
    }

    private createFmtColumn(name: string, label: string, fmtFunc: (x) => string): UniTableColumn {
        return new UniTableColumn(name, label, UniTableColumnType.Text)
            .setTemplate((item: any) => {
                var value = item[name];
                if (value) {
                    return fmtFunc(value);
                }
                return '';
            });        
    }    

    private createLookupColumn(
        name: string, label: string, expandCol: string, lookupFn?: any, 
        expandKey = 'ID', expandLabel = 'Name'): UniTableColumn {
        return new UniTableColumn(name, label, UniTableColumnType.Lookup)
            .setDisplayField(`${expandCol}.${expandLabel}`)
            .setEditorOptions({
                itemTemplate: (item) => {
                    return item[expandKey] + ' - ' + item[expandLabel];
                },
                lookupFunction: lookupFn
        });
    }


}
