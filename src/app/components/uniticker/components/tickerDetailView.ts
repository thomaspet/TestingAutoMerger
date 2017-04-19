import {Component, ViewChild, Input, Output, EventEmitter, ChangeDetectionStrategy} from '@angular/core';
import {Ticker, TickerAction, TickerFilter, TickerColumn, ITickerColumnOverride} from '../../../services/common/uniTickerService';
import {UniTickerService} from '../../../services/services';

@Component({
    selector: 'uni-ticker-detail-view',
    templateUrl: './tickerDetailView.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UniTickerDetailView {
    @Input() private ticker: Ticker;
    @Input() private model: any;
    @Input() public columnOverrides: Array<ITickerColumnOverride> = [];

    constructor(private tickerService: UniTickerService) {
    }

    private getVisibleColumns() {
        return this.ticker.Columns.filter(x => x.Type !== 'dontdisplay');
    }

    public getFieldValue(column: TickerColumn, model: any) {
        return this.tickerService.getFieldValue(column, model, this.ticker, this.columnOverrides);
    }
}
