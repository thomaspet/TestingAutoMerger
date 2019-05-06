import {Component, Input, Output, EventEmitter} from '@angular/core';
import {UniModalService} from '../../../uni-modal';
import {ColumnMenuModal} from './columnMenuModal';
import {UniTableConfig} from '../config/unitableConfig';
import * as Immutable from 'immutable';

@Component({
    selector: 'unitable-column-menu',
    template: `
        <i role="button" class="material-icons" (click)="openMenu()" tabindex="-1">settings</i>
    `,
})
export class UniTableColumnMenu {
    @Input()
    public columns: Immutable.List<any>;

    @Input()
    public tableConfig: UniTableConfig;

    @Output()
    public columnsChange: EventEmitter<Immutable.List<any>> = new EventEmitter();

    @Output()
    public resetAll: EventEmitter<any> = new EventEmitter();

    constructor(private modalService: UniModalService) {}

    public openMenu() {
        this.modalService.open(ColumnMenuModal, {
            data: {
                columns: this.columns,
                tableConfig: this.tableConfig
            }
        }).onClose.subscribe(res => {
            if (!res) {
                return;
            }

            if (res.resetAll) {
                this.resetAll.emit(true);
            } else {
                this.columns = res.columns.map((col, index) => {
                    return col.set('index', index);
                });

                this.columnsChange.emit(this.columns);
            }
        });
    }

}
