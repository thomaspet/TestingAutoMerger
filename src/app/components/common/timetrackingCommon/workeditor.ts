import {Component, Input, Output, EventEmitter, ViewChild} from '@angular/core';
import {UniTableConfig, UniTableColumn, UniTableColumnType, UniTable} from '@uni-framework/ui/unitable/index';
import {ToastService, ToastType} from '@uni-framework/uniToast/toastService';
import {safeDec, filterInput, getDeepValue} from '@app/components/common/utils/utils';
import {Observable} from 'rxjs';
import {WorkType, WorkItem, LocalDate} from '@uni-entities';
import {
    ErrorService,
    BrowserStorageService,
    EmploymentService,
    TimesheetService,
    TimeSheet,
    ValueItem
} from '@app/services/services';

import * as moment from 'moment';

@Component({
    selector: 'workeditor',
    template: `
        <uni-table class="compactcells"
            [resource]="timeSheet?.items"
            [config]="tableConfig"
            (rowSelected)="onRowSelected($event)"
            (rowDeleted)="onRowDeleted($event)">
        </uni-table>`
})
export class WorkEditor {
    @Input('timesheet') public set TimeSheetSetter(value: TimeSheet) {
        this.timeSheet = value;
        this.tryInit();
    }
    @Input() order: WorkItem;

    @Output() public valueChanged: EventEmitter<any> = new EventEmitter();
    @Output() public rowDeleted: EventEmitter<any> = new EventEmitter();
    @ViewChild(UniTable, { static: true }) private uniTable: UniTable;
    public tableConfig: UniTableConfig;
    public timeSheet: TimeSheet = new TimeSheet();
    private workTypes: Array<WorkType> = [];
    private visibleColumns: Array<string>;
    private defaultRow: any = { Date: new LocalDate() };

    public get numberOfVisibleColumns(): number {
        return this.visibleColumns.length;
    }

    public get EmptyRowDetails(): { Date: LocalDate, StartTime: Date } {
        return this.defaultRow;
    }

    public getWorkTypes(): Array<WorkType> {
        return this.workTypes;
    }

    constructor(
        private timesheetService: TimesheetService,
        private errorService: ErrorService,
        private toast: ToastService,
        private localStore: BrowserStorageService,
        private employmentService: EmploymentService
        ) {
            this.loadUserSettings();
            this.initLookups();
    }

    public editRow(index: number) {
        this.toast.addToast('Venter på unitable feature...',
        ToastType.good, 3, 'Klikk på nederse rad i tabellen for å begynne å registrere' );
        this.uniTable.focusRow(index);
    }

    public closeEditor() {
        this.uniTable.blur();
    }

    public refreshData() {
        this.tableConfig = this.createTableConfig();
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

    private loadUserSettings() {
        const map = this.localStore.getItem('workeditor.columns');
        if (map) {
            this.visibleColumns = map.split(',');
        }
    }

    private keepUpWithUniTable(originalIndex) {
        for (let i = this.timeSheet.items.length; i < originalIndex; i++) {
            this.timeSheet.addRow();
        }
    }

    public onRowDeleted(event: any) {

        // Make sure UniTable and TimeSheet are up to speed
        if (event.rowModel._originalIndex >= this.timeSheet.items.length) {
            this.keepUpWithUniTable(event.originalIndex);
        }
        const row = event.rowModel;
        const index = row['_originalIndex'];
        if (index === 0 || !!index ) {
            this.timeSheet.removeRow(index);
        }
        if (row.ID) {
            this.rowDeleted.emit(index);
        }
    }

    public onEditChange(event) {

        // Make sure UniTable and TimeSheet are up to speed
        if (event.originalIndex >= this.timeSheet.items.length) {
            this.keepUpWithUniTable(event.originalIndex);
        }

        const rowIndex = event.originalIndex;
        const newRow = event.rowModel;
        const change = new ValueItem(event.field, newRow[event.field], rowIndex);
        change.tag = (event.field === 'Minutes' || event.field === 'MinutesToOrder') ? 'Hours' : null;

        // Copycell? : todo: use CopyCell property from event when UniTable supports this
        if (rowIndex > 0) {
            const rowAbove: WorkItem = this.timeSheet.items[rowIndex - 1];
            const cellAboveValue = getDeepValue(rowAbove, event.field);
            if (change.value === cellAboveValue) {
                change.isParsed = true;
                switch (event.field) {
                    case 'StartTime':
                        if (rowAbove.Date === newRow.Date && rowAbove.EndTime) {
                            change.value = rowAbove.EndTime;
                        }
                        break;
                    case 'LunchInMinutes':
                        if (rowAbove.Date === newRow.Date) {
                            change.value = 0;
                        }
                        break;
                    case 'Dimensions.ProjectID':
                    case 'Dimensions.DepartmentID':
                        const fn = event.field.substr(0, event.field.length - 2);
                        change.lookupValue = getDeepValue(rowAbove, fn) || change.lookupValue;
                        break;
                }
            }
        }

        // Brand new row?
        if (this.timeSheet.items.length <= rowIndex) {
            if (event.field !== 'Date') {
                this.timeSheet.setItemValue(new ValueItem('Date', newRow.Date, rowIndex, undefined, undefined, true));
            }
            if (event.field !== 'StartTime') {
                this.timeSheet.setItemValue(new ValueItem('StartTime', newRow.StartTime, rowIndex
                , undefined, undefined, true));
            }

            if (this.order && event.field !== 'CustomerOrder') {
                this.timeSheet.setItemValue(new ValueItem('CustomerOrder', newRow.CustomerOrder, rowIndex, undefined, undefined, true));
                this.timeSheet.items[rowIndex].CustomerOrder = this.order;
                this.timeSheet.items[rowIndex].CustomerOrderID = this.order.ID;
            }
        }

        if (this.timeSheet.setItemValue(change)) {
            this.valueChanged.emit(change);
            const xRow = this.timeSheet.items[rowIndex];
            xRow.originalIndex = rowIndex;
            xRow._originalIndex = rowIndex;
            return xRow;
        }
    }

    private createTableConfig(): UniTableConfig {
        const cfg = new UniTableConfig('timetracking.workeditor', true, true, 15);
        cfg.columns = [
            new UniTableColumn('ID', 'ID', UniTableColumnType.Number)
                .setVisible(false)
                .setWidth('3rem')
                .setEditable(false),

            new UniTableColumn('Date', 'Dato', UniTableColumnType.LocalDate)
                .setWidth('5rem'),

            new UniTableColumn('Day', 'Ukedag', UniTableColumnType.LocalDate)
                .setDisplayField('Date')
                .setWidth('3rem')
                .setFormat('dddd')
                .setEditable(false)
                .setCls('good'),

            this.createTimeColumn('StartTime', 'Start')
                .setWidth('2.6rem')
                .setAlignment('center'),

            this.createTimeColumn('EndTime', 'Slutt')
                .setWidth('2.6rem')
                .setAlignment('center'),

            this.createLookupColumn('Worktype', 'Timeart', 'Worktype',
                x => this.lookupType(x))
                .setWidth('6rem'),

            new UniTableColumn('LunchInMinutes', 'Lunsj', UniTableColumnType.Number)
                .setWidth('3rem')
                .setAlignment('center'),

            this.createHourColumn('Minutes', 'Timer')
                .setWidth('3rem')
                .setAlignment('center')
                .setCls('ctoa'),

            new UniTableColumn('Description', 'Beskrivelse')
                .setWidth('20%')
                .setMaxLength(500),

            this.createLookupColumn('Dimensions.ProjectID', 'Prosjekt', 'Dimensions.Project',
                x => this.lookupAny(x, 'projects', 'projectnumber'), 'ProjectNumber' )
                .setWidth('6rem'),

            this.createLookupColumn('Dimensions.DepartmentID', 'Avdeling', 'Dimensions.Department',
                x => this.lookupAny(x, 'departments', 'departmentnumber'), 'DepartmentNumber' )
                .setWidth('6rem')
                .setVisible(false),

            this.createHourColumn('MinutesToOrder', 'Timer til ordre')
                .setWidth('6rem')
                .setVisible(false)
                .setAlignment('center'),

            this.createLookupColumn('CustomerOrder', 'Ordre', 'CustomerOrder',
                x => this.lookupAny(x, 'orders', 'ordernumber', 'customername'), 'OrderNumber', 'CustomerName' )
                .setWidth('6rem')
                .setVisible(false)
                .setTemplate((item) => {
                    return (item && item.CustomerOrder)
                        ? item.CustomerOrder.OrderNumber + ' - ' + item.CustomerOrder.CustomerName
                        : '';
                }),

            this.createLookupColumn('Customer', 'Kunde', 'Customer',
                x => this.lookupAny(x, 'customers', 'CustomerNumber', 'Info.Name', 'info'),
                'CustomerNumber', 'Info.Name' )
                .setWidth('6rem')
                .setVisible(false),

            new UniTableColumn('Label', 'Merke/etikett')
                .setWidth('6rem')
                .setCls('good')
                .setVisible(false)

        ];
        cfg.deleteButton = true;
        cfg.autoAddNewRow = true;
        cfg.columnMenuVisible = true;
        cfg.setChangeCallback( x => this.onEditChange(x) );
        cfg.autoScrollIfNewCellCloseToBottom = true;

        cfg.defaultRowData = this.defaultRow;

        cfg.beforeEdit = (event) => {
            // If the tables are not in sync, the line above will not exist, just return
            if (event.rowModel._originalIndex !== 0
                && event.rowModel._originalIndex > this.timeSheet.items.length) {
                    return event;
                }

            // Add a suggested time when user enters empty Start field
            if (event.column.field === 'StartTime' && !event.initValue) {
                if (!event.rowModel._originalIndex) {
                    event.initValue = '08:00';
                    event.initAsDirty = true;
                } else {
                    const rowAbove = this.timeSheet.items[event.rowModel._originalIndex - 1];
                    let isSameDate = moment(rowAbove.Date).month() === moment(event.rowModel.Date).month();
                    isSameDate = isSameDate && moment(rowAbove.Date).day() === moment(event.rowModel.Date).day();
                    if (rowAbove.EndTime && isSameDate) {
                        event.initValue = moment(this.timeSheet.items[event.rowModel._originalIndex - 1].EndTime)
                        .format('HH:mm');
                        event.initAsDirty = true;
                    } else if (!isSameDate) {
                        event.initValue = '08:00';
                        event.initAsDirty = true;
                    } else {
                        event.initValue = '';
                    }
                }
            }
            return event;
        };

        if (!this.visibleColumns) {
            this.visibleColumns = [];
            cfg.columns.filter( x => x.visible ).forEach( y => this.visibleColumns.push(y.field) );
        } else {
            const map = this.visibleColumns;
            cfg.columns.forEach( x => x.visible = map.findIndex( y => y === x.field) >= 0 );
        }

        // Is lunch-column visible?
        const lunchCol = cfg.columns.find( x => x.field === 'LunchInMinutes');
        if (lunchCol && this.timeSheet) {
            // If not, lets turn of lunch-calculations
            this.timeSheet.allowLunchCalculations = lunchCol.visible;
        }

        return cfg;
    }

    public lookupType(txt: string) {
        const list = this.workTypes;
        const lcaseText = txt.toLowerCase();
        const sublist = list.filter((item: WorkType) => {
            return (item.ID.toString() === txt || item.Name.toLowerCase().indexOf(lcaseText) >= 0); } );
        return Observable.from([sublist]);
    }

    public lookupAny(txt: string, route: string = 'projects',
                     visualIdcol: string = 'id', nameCol: string = 'name', expand?: string) {
        let filter = '', orderBy = nameCol;
        const filtered = filterInput(txt);
        let select = 'id,' + nameCol;

        if (filtered.length > 0) {
            const num = parseInt(filtered, 10);
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
            'filter', filter, 'expand', expand);
    }

    public createTimeColumn(name: string, label: string): UniTableColumn {
        return this.createFmtColumn(name, label, x => moment(x).format('HH:mm'));
    }

    public createHourColumn(name: string, label: string): UniTableColumn {
        return this.createFmtColumn(name, label, x => (safeDec(x) / 60).toFixed(1));
    }

    private createFmtColumn(name: string, label: string, fmtFunc: (x) => string): UniTableColumn {
        return new UniTableColumn(name, label, UniTableColumnType.Text)
            .setTemplate((item: any) => {
                const value = item[name];
                if (value) {
                    return fmtFunc(value);
                }
                return '';
            });
    }

    public createLookupColumn(
        name: string, label: string, expandCol: string, lookupFn?: any,
        expandKey = 'ID', expandLabel = 'Name'): UniTableColumn {
        return new UniTableColumn(name, label, UniTableColumnType.Lookup)
            .setDisplayField(`${expandCol}.${expandLabel}`)
            .setOptions({
                itemTemplate: (item) => {
                    return item[expandKey] + ' - ' + getDeepValue(item, expandLabel);
                },
                lookupFunction: lookupFn
        });
    }


}
