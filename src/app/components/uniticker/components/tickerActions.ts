import {Component, ViewChild, Input, Output, EventEmitter} from '@angular/core';
import {Ticker, TickerAction, TickerFilter} from '../../../services/common/uniTickerService';

@Component({
    selector: 'uni-ticker-actions',
    templateUrl: './tickerActions.html'
})
export class UniTickerActions {

    @Input() actions: Array<TickerAction>;
    @Output() executeAction: EventEmitter<TickerAction> = new EventEmitter<TickerAction>();

    constructor() {
    }

    public ngOnInit() {

    }

    private onActionClicked(action: TickerAction) {
        this.executeAction.emit(action);
    }
}
