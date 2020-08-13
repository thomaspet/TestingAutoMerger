import {Component, Input, Output, EventEmitter} from '@angular/core';
import * as moment from 'moment';

@Component({
    selector: 'toolbar-month-selector',
    templateUrl: './month-selector.html',
    styleUrls: ['./month-selector.sass']
})

export class ToolbarMonthSelector {

    @Output()
    monthChange: EventEmitter<Date> = new EventEmitter();

    @Input()
    period: Date = new Date();

    constructor () { }

    onMonthChange(direction: number) {
        this.period = moment(this.period).add(direction, 'months').toDate();
        this.monthChange.emit(this.period);
    }
}
