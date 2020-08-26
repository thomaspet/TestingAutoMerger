import {Component, Input, Output, EventEmitter, Pipe, PipeTransform, ViewChild, ChangeDetectionStrategy} from '@angular/core';
import {CdkVirtualScrollViewport} from '@angular/cdk/scrolling';
import {NumberFormat} from '@app/services/services';
import {get} from 'lodash';
import {DatePipe} from '@angular/common';
import {UniModalService} from '@uni-framework/uni-modal';
import {BillingData} from '@app/models/elsa-models';
import {SettlementsModal} from '../settlements-modal/settlements-modal';

export interface ListViewColumn {
    header: string;
    field: string;
    numberFormat?: string;
    flex?: string;
    click?: (row) => void;
    conditionalCls?: (row) => string;
}

@Pipe({name: 'cellValue'})
export class CellValuePipe implements PipeTransform {
    constructor(private numberFormatter: NumberFormat) {}

    transform(row: any, column: ListViewColumn) {
        const value = get(row, column.field, '');
        if (column.field === 'UpdatedAt') {
            if (value) {
                return new DatePipe('en-US').transform(value, 'dd.MM.yyyy');
            }
        } else if (column.numberFormat === 'money') {
            const numeric = parseInt(value, 10);
            if (numeric >= 0) {
                return this.numberFormatter.asMoney(value) || '0';
            }
        } else if (column.numberFormat === 'percent') {
            if (value && value !== '0') {
                return value + '%';
            }
        } else {
            return value;
        }
    }
}

@Component({
    selector: 'license-info-list',
    templateUrl: './list-view.html',
    styleUrls: ['./list-view.sass'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListView {
    @ViewChild('listBody', { static: true }) listBody: CdkVirtualScrollViewport;

    @Input() orderBy: string;
    @Input() rows: any[];
    @Input() columns: ListViewColumn[];
    @Input() contextMenu: {label: string; action: (row) => void; hidden?: (row) => boolean}[];
    @Input() billingData?: BillingData;

    @Output() rowClick = new EventEmitter();

    sortedData: any[];

    constructor (private modalService: UniModalService) {}

    ngOnChanges() {
        if (this.rows && this.orderBy) {
            this.sortedData = this.rows.sort((row1, row2) => {
                const row1Value = get(row1, this.orderBy) || '';
                if (row1Value) {
                    return row1Value.localeCompare(get(row2, this.orderBy, ''));
                } else {
                    return 1;
                }
            });
        }
    }

    onColumnClick(column: ListViewColumn, row) {
        if (column.click) {
            column.click(row);
        }
    }

    getClass(column: ListViewColumn, row) {
        const classList = [];
        if (column.numberFormat) {
            classList.push('align-right');
        }

        if (column.conditionalCls) {
            const cls = column.conditionalCls(row);
            if (cls) {
                classList.push(cls);
            }
        }

        return classList.join(' ');
    }

    openSettlements(order: BillingData) {
        this.modalService.open(SettlementsModal, {
            data: {
                settlement: order,
                header: 'Delavregning'
            }
        });
    }
}
