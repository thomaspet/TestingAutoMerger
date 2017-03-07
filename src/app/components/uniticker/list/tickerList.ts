import {Component, ViewChild, Input, Output, EventEmitter} from '@angular/core';
import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';
import {UniTabs} from '../../layout/uniTabs/uniTabs';
import {Router, ActivatedRoute, RouterLink} from '@angular/router';
import {Ticker, TickerGroup} from '../../../services/common/UniTickerService';

@Component({
    selector: 'uni-ticker-list',
    templateUrl: 'app/components/uniticker/list/tickerList.html'
})
export class UniTickerList {
    @Input() private tickerGroups: Array<TickerGroup> = [];
    @Output() private tickerSelected: EventEmitter<Ticker> = new EventEmitter<Ticker>();

    constructor() {
    }

    public ngOnInit() {

    }

    private selectTicker(ticker) {
        this.tickerSelected.emit(ticker);
    }
}
