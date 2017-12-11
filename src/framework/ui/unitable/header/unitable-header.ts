import {Component, Input, Output, EventEmitter} from '@angular/core';
import {UniTableConfig, ISortInfo} from '../config/unitableConfig';
import {UniTableColumn} from '../config/unitableColumn';
import {UniTableUtils} from '../unitableUtils';
import * as Immutable from 'immutable';

@Component({
    selector: '[unitable-header]',
    templateUrl: './unitable-header.html'
})
export class UniTableHeader {
    @Input() config: UniTableConfig;
    @Input() columns: Immutable.List<any>;
    @Input() sortInfo: ISortInfo;

    @Output() columnsChange: EventEmitter<Immutable.List<any>> = new EventEmitter(false);
    @Output() sortInfoChange: EventEmitter<ISortInfo> = new EventEmitter(false);
    @Output() selectAllRows: EventEmitter<boolean> = new EventEmitter(false);

    constructor(private utils: UniTableUtils)  {}

    public multiRowSelectChange(event): void {
        const checked = event && event.target.checked;
        this.selectAllRows.emit(checked);
    }

    public sortByColumn(column): void {
        // REVISIT: the whole sort logic with css class binding in template
        // etc could probably benefit from a rewrite
        if (!this.config.sortable) {
            return;
        }

        const field = column.get('displayField') || column.get('field');
        let direction = 1;

        // If column is aleady part of oderBy just switch direction
        if (this.sortInfo && this.sortInfo.field === field) {
            if (this.sortInfo.direction === -1) {
                direction = 0;
            } else if (this.sortInfo.direction === 1) {
                direction = -1;
            }
        }

        this.sortInfo = {
            field: field,
            direction: direction,
            type: column.get('type'),
            mode: column.get('sortMode')
        };

        this.sortInfoChange.emit(this.sortInfo);
    }

    public columnSetupChange(columns) {
        this.columns = columns;

        if (this.config.configStoreKey) {
            this.utils.saveColumnSetup(
                this.config.configStoreKey,
                this.columns.toJS()
            );
        }

        this.columnsChange.emit(this.columns);
    }

    public resetColumnSetup() {
        if (this.config.configStoreKey) {
            this.utils.removeColumnSetup(this.config.configStoreKey);
        }

        this.columns = this.utils.makeColumnsImmutable(this.config.columns);
        this.columnsChange.emit(this.columns);
    }
}


