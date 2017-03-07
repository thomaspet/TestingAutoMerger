import {Component, ViewChild, Input, Output, EventEmitter} from '@angular/core';
import {Ticker, TickerAction, TickerFilter, TickerColumn} from '../../../services/common/UniTickerService';
import {UniTickerService} from '../../../services/services';

@Component({
    selector: 'uni-ticker-detail-view',
    templateUrl: 'app/components/uniticker/components/tickerDetailView.html'
})
export class UniTickerDetailView {
    @Input() private ticker: Ticker;
    @Input() private model: any;

    constructor(private tickerService: UniTickerService) {
    }

    public getFieldValue(column: TickerColumn, model: any) {
        return this.tickerService.getFieldValue(column, model);
    }
}
