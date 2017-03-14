import {Component, Input, SimpleChanges, Output, EventEmitter} from '@angular/core';
import {Ticker, TickerAction, TickerHistory, TickerFilter, UniTickerService} from '../../../services/common/uniTickerService';
import {Router, ActivatedRoute} from '@angular/router';


@Component({
    selector: 'uni-ticker-search-history',
    templateUrl: './searchHistory.html'
})
export class UniTickerSearchHistory {
    @Input() private lastSearch: TickerHistory;
    @Output() private showSearch: EventEmitter<TickerHistory> = new EventEmitter<TickerHistory>();

    private lastSearches: Array<TickerHistory> = [];

    constructor(private uniTickerService: UniTickerService, private router: Router) {
    }

    public ngOnInit() {
        this.refreshSearches();
    }

    public ngOnChanges(changes: SimpleChanges) {
        if (changes['lastSearch']) {
            this.refreshSearches();
        }
    }

    private refreshSearches() {
        this.lastSearches = this.uniTickerService.getSearchHistoryItems();
    }

    private showHistoricSearch(search: TickerHistory) {
        this.showSearch.emit(search);
    }

    private getSearchText(search: TickerHistory) {
        return search.Ticker.Name + (search.TickerFilter ? ': ' + search.TickerFilter.Name : '');
    }
}

