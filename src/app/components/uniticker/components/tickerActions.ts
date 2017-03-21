import {Component, ViewChild, Input, Output, EventEmitter, SimpleChanges} from '@angular/core';
import {Ticker, TickerAction, TickerFilter} from '../../../services/common/uniTickerService';
import { IContextMenuItem } from 'unitable-ng2/main';

@Component({
    selector: 'uni-ticker-actions',
    templateUrl: './tickerActions.html'
})
export class UniTickerActions {

    @Input() actions: Array<TickerAction>;
    @Input() isSubTicker: boolean;
    @Output() executeAction: EventEmitter<TickerAction> = new EventEmitter<TickerAction>();

    public contextmenu: IContextMenuItem[];

    constructor() {
    }

    public ngOnChanges(changes: SimpleChanges) {
        if (this.isSubTicker && this.actions) {
            this.contextmenu = [];

            this.actions.forEach(action => {
                this.contextmenu.push({
                    action: () => {
                        this.onActionClicked(action);
                    },
                    disabled: () => {
                        return action.DisplayInActionBar != null && !action.DisplayInActionBar;
                    },
                    label: action.Name
                });
            });
        }
    }

    private onActionClicked(action: TickerAction) {
        this.executeAction.emit(action);
        event.stopPropagation();
    }
}
