import {Component, ViewChild, Input, Output, EventEmitter, SimpleChanges, ChangeDetectionStrategy} from '@angular/core';
import {Ticker, TickerAction, ITickerActionOverride} from '../../../services/common/uniTickerService';
import { IContextMenuItem } from 'unitable-ng2/main';

@Component({
    selector: 'uni-ticker-actions',
    templateUrl: './tickerActions.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UniTickerActions {
    @Input() private ticker: Ticker;
    @Input() private model: any;
    @Input() private actions: Array<TickerAction>;
    @Input() private isSubTicker: boolean;
    @Input() private actionOverrides: Array<ITickerActionOverride> = [];

    @Output() executeAction: EventEmitter<TickerAction> = new EventEmitter<TickerAction>();

    public contextmenu: IContextMenuItem[];

    constructor() {
    }

    public ngOnChanges(changes: SimpleChanges) {
        if (this.isSubTicker && this.actions) {
            this.contextmenu = [];
            this.actions.forEach(action => {
                let actionOverride = this.actionOverrides.find(x => action.Code === x.Code);

                if (action.NeedsActionOverride && !actionOverride) {
                    console.log(`Action ${action.Code} needs an ActionOverride to function correctly, and that is not specified`);
                } else if (action.Type === 'action' && !actionOverride) {
                    console.log(`Action ${action.Code} not available because of missing action override`);
                } else {
                    if (this.ticker.Type === 'table' && action.DisplayInActionBar && action.DisplayForSubTickers) {
                        this.contextmenu.push({
                            action: () => {
                                this.onActionClicked(action);
                            },
                            disabled: () => {
                                return false;
                            },
                            label: action.Name
                        });
                    } else if (this.ticker.Type === 'details' && action.DisplayInContextMenu && action.DisplayForSubTickers) {
                        this.contextmenu.push({
                            action: () => {
                                this.onActionClicked(action);
                            },
                            disabled: () => {
                                if (this.model && actionOverride && actionOverride.CheckActionIsDisabled !== undefined) {
                                    return actionOverride.CheckActionIsDisabled([this.model]);
                                }

                                if (action.Type === 'transition' && this.model) {
                                    if (!this.model._links) {
                                        throw Error('Cannot setup transition action, hateoas is not retrieved');
                                    } else {
                                        if (!this.model._links.transitions[action.Options.Transition]) {
                                            return true;
                                        }
                                    }
                                }

                                return false;
                            },
                            label: action.Name
                        });
                    }
                }
            });
        }
    }

    private onActionClicked(action: TickerAction, event) {
        this.executeAction.emit(action);
        if (event) {
            event.stopPropagation();
        }
    }
}
