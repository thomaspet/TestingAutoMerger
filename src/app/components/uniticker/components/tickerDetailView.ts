import {Component, ViewChild, Input, Output, EventEmitter} from '@angular/core';
import {Ticker, TickerAction, TickerFilter, TickerColumn} from '../../../services/common/uniTickerService';
import {UniTickerService} from '../../../services/services';

@Component({
    selector: 'uni-ticker-detail-view',
    templateUrl: './tickerDetailView.html'
})
export class UniTickerDetailView {
    @Input() private ticker: Ticker;
    @Input() private model: any;

    constructor(private tickerService: UniTickerService) {
    }

    private getVisibleColumns() {
        return this.ticker.Columns.filter(x => x.Type !== 'dontdisplay');
    }

    public getFieldValue(column: TickerColumn, model: any) {
        return this.tickerService.getFieldValue(column, model, this.ticker);
    }
}
