import {Component, Input, Output, EventEmitter, Pipe, PipeTransform, ViewChild} from '@angular/core';
import {CdkVirtualScrollViewport} from '@angular/cdk/scrolling';

import PerfectScrollbar from 'perfect-scrollbar';
import {get} from 'lodash';
import {NumberFormat} from '@app/services/services';

@Pipe({name: 'cellValue'})
export class CellValuePipe implements PipeTransform {
    constructor(private numberFormatter: NumberFormat) {}

    transform(row: any, column: {header: string; field: string; format: string; }) {
        const value = get(row, column.field, '');

        if (column.format === 'money') {
            const numeric = parseInt(value, 10);
            if (numeric >= 0) {
                return this.numberFormatter.asMoney(value) || '0';
            }
        } else if (column.format === 'percent') {
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
    styleUrls: ['./list-view.sass']
})
export class ListView {
    @ViewChild('listBody') listBody: CdkVirtualScrollViewport ;

    @Input() orderBy: string;
    @Input() rows: any[];
    @Input() columns: {
        header: string;
        field: string;
        format?: string;
        flex?: string;
    }[];

    @Output() rowClick: EventEmitter<any> = new EventEmitter();

    scrollbar: PerfectScrollbar;
    sortedData: any[];

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

    ngAfterViewInit() {
        this.scrollbar = new PerfectScrollbar(this.listBody.elementRef.nativeElement, {
            suppressScrollX: true
        });
    }

    ngOnDestroy() {
        if (this.scrollbar) {
            this.scrollbar.destroy();
        }
    }
}
