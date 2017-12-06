import {
    Component,
    ViewChild,
    Input,
    Output,
    EventEmitter,
    ChangeDetectionStrategy,
    ChangeDetectorRef
} from '@angular/core';
import {Router, ActivatedRoute, ParamMap} from '@angular/router';
import {
    Ticker,
    TickerFilter,
    IExpressionFilterValue,
    ITickerActionOverride,
    ITickerColumnOverride
} from '../../../services/common/uniTickerService';
import {UniTicker} from '../ticker/ticker';
import {UniTickerPredefinedFilters} from '../filters/predefinedFilters';
import {YearService} from '../../../services/services';
import {AuthService} from '../../../authService';

@Component({
    selector: 'uni-ticker-container',
    templateUrl: './tickerContainer.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UniTickerContainer {
    @ViewChild(UniTicker) public mainTicker: UniTicker;
    @ViewChild(UniTickerPredefinedFilters) public tickerFilters: UniTickerPredefinedFilters;

    @Input() public ticker: Ticker;
    @Input() public showActions: boolean;
    @Input() public showFilters: boolean = true;
    @Input() public filtersAsNavbar: boolean;
    @Input() public actionOverrides: Array<ITickerActionOverride> = [];
    @Input() public columnOverrides: Array<ITickerColumnOverride> = [];

    @Output() public urlParamsChange: EventEmitter<ParamMap> = new EventEmitter();
    @Output() public rowSelectionChanged: EventEmitter<any> = new EventEmitter();

    public showSubTickers: boolean;
    public selectedFilter: TickerFilter;

    private selectedRow: any;
    private expressionFilters: Array<IExpressionFilterValue> = [];
    private currentUserGlobalIdentity: string;
    private currentAccountingYear: string;

    constructor(
        private authService: AuthService,
        private yearService: YearService,
        private router: Router,
        private route: ActivatedRoute,
        private cdr: ChangeDetectorRef
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
        if (changes['ticker'] && this.ticker) {
            this.selectedRow = undefined;
            this.showSubTickers = false;
            if (this.ticker.Filters) {
                this.selectedFilter = this.ticker.Filters[0];
            }
        }
    }

    public ngAfterViewInit() {
        this.route.queryParamMap.subscribe(params => {
            const filterCode = params.get('filter');
            if (filterCode && (!this.selectedFilter || this.selectedFilter.Code !== filterCode)) {
                this.setFilterFromFilterCode(filterCode, 0);
            }

            this.urlParamsChange.next(params);
            this.cdr.markForCheck();
        });
    }

    private setFilterFromFilterCode(filterCode: string, retryCount: number) {
        if (this.ticker) {
            this.selectedFilter = this.ticker.Filters.find(f => f.Code === filterCode);
            this.cdr.markForCheck();
        } else if (retryCount <= 5) {
            setTimeout(() => {
                this.setFilterFromFilterCode(filterCode, retryCount++);
            }, 100);
        }
    }

    public updateQueryParams() {
        const url = this.router.url.split('?')[0];

        this.router.navigate([url], {
            queryParams: {
                filter: this.selectedFilter && this.selectedFilter.Code,
                rowIndex: this.selectedRow ? this.selectedRow['_originalIndex'] : undefined
            },
            skipLocationChange: false
        });
    }

    public onRowSelected(row) {
        this.selectedRow = row;
        this.showSubTickers = !row._editable;
    }

    public onRowSelectionChanged(row) {
        this.rowSelectionChanged.emit(row);
    }

    public editModeChanged(event) {
        if (event) {
            this.showSubTickers = false;
        }
    }

    public onFilterSelected(filter: TickerFilter) {
        if (filter !== this.selectedFilter) {
            this.selectedFilter = filter;
            this.selectedRow = null;
            this.showSubTickers = false;
            this.updateQueryParams();
        }
    }

    public exportToExcel(completeEvent) {
        this.mainTicker.exportToExcel(completeEvent);
    }

    public runAction(action) {
        if (this.mainTicker) {
            this.mainTicker.onExecuteAction(action);
        }
    }
}
