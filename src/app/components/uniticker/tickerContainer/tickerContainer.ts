import {
    Component,
    ViewChild,
    Input,
    Output,
    EventEmitter
} from '@angular/core';
import {
    Ticker,
    // TickerGroup,
    // TickerAction,
    TickerFilter,
    // TickerColumn,
    IExpressionFilterValue,
    ITickerActionOverride,
    ITickerColumnOverride
} from '../../../services/common/uniTickerService';
import {UniTicker} from '../ticker/ticker';
import {YearService} from '../../../services/services';
import {AuthService} from '../../../../framework/core/authService';

@Component({
    selector: 'uni-ticker-container',
    templateUrl: './tickerContainer.html'
})
export class UniTickerContainer {
    @ViewChild(UniTicker) private uniTicker: UniTicker;

    @Input() public ticker: Ticker;
    @Input() public showActions: boolean;
    @Input() public showFilters: boolean = true;
    @Input() public useUniTableFilter: boolean = false;
    @Input() public actionOverrides: Array<ITickerActionOverride> = [];
    @Input() public columnOverrides: Array<ITickerColumnOverride> = [];

    public showSubTickers: boolean;
    public selectedFilter: TickerFilter;

    private selectedRow: any;
    private expressionFilters: Array<IExpressionFilterValue> = [];
    private currentUserGlobalIdentity: string;
    private currentAccountingYear: string;

    constructor(
        private authService: AuthService,
        private yearService: YearService
    ) {
        let token = this.authService.getTokenDecoded();
        if (token) {
            this.currentUserGlobalIdentity = token.nameid;

            this.yearService.getActiveYear().subscribe(activeyear => {
                this.currentAccountingYear = activeyear.toString();

                this.expressionFilters = [];
                this.expressionFilters.push({
                    Expression: 'currentuserid',
                    Value: this.currentUserGlobalIdentity
                });

                this.expressionFilters.push({
                    Expression: 'currentaccountingyear',
                    Value: this.currentAccountingYear
                });
            });
        }
    }

    public ngOnChanges(changes) {
        if (changes['ticker'] && this.ticker && this.ticker.Filters) {
            this.selectedFilter = this.ticker.Filters[0];
        }
    }

    public onRowSelected(selectedRow: any) {
        this.selectedRow = selectedRow;
        this.showSubTickers = true;
    }

    public onFilterSelected(filter: TickerFilter) {
        if (filter !== this.selectedFilter) {
            this.selectedFilter = filter;
            this.selectedRow = null;
        }
    }

    public exportToExcel(completeEvent) {
        this.uniTicker.exportToExcel(completeEvent);
    }
}
