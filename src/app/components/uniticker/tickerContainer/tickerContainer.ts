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
import {UniTicker} from '../ticker/ticker';
import {YearService, StatisticsService} from '@app/services/services';
import {AuthService} from '@app/authService';
import {
    UniTickerService,
    Ticker,
    TickerFilter,
    IExpressionFilterValue,
    ITickerActionOverride,
    ITickerColumnOverride
} from '@app/services/common/uniTickerService';

@Component({
    selector: 'uni-ticker-container',
    templateUrl: './tickerContainer.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UniTickerContainer {
    @ViewChild(UniTicker) public mainTicker: UniTicker;

    @Input() public ticker: Ticker;
    @Input() public showActions: boolean;
    @Input() public showFilters: boolean = true;
    @Input() public filtersAsNavbar: boolean;
    @Input() public actionOverrides: Array<ITickerActionOverride> = [];
    @Input() public columnOverrides: Array<ITickerColumnOverride> = [];

    @Output() public urlParamsChange: EventEmitter<ParamMap> = new EventEmitter();
    @Output() public rowSelectionChange: EventEmitter<any[]> = new EventEmitter();

    public showSubTickers: boolean;
    public filters: TickerFilter[];
    public selectedFilter: TickerFilter;
    public selectedFilterIndex: number;

    private selectedRow: any;
    private expressionFilters: Array<IExpressionFilterValue> = [];
    private currentUserGlobalIdentity: string;
    private currentAccountingYear: string;

    constructor(
        private authService: AuthService,
        private yearService: YearService,
        private statisticsService: StatisticsService,
        private tickerService: UniTickerService,
        private router: Router,
        private route: ActivatedRoute,
        private cdr: ChangeDetectorRef
    ) {
        const token = this.authService.getTokenDecoded();
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

            const previousTicker = changes['ticker'].previousValue;
            if (!previousTicker || previousTicker.Code !== this.ticker.Code) {
                this.filters = (this.ticker && this.ticker.Filters) || [];
                this.selectedFilter = this.ticker.Filters[0];
                this.selectedFilterIndex = 0;
                this.getFilterCounts();
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
            this.selectedFilterIndex = this.ticker.Filters.findIndex(f => f.Code === filterCode);
            this.selectedFilter = this.ticker.Filters[this.selectedFilterIndex];

            this.cdr.markForCheck();
        } else if (retryCount <= 5) {
            setTimeout(() => {
                this.setFilterFromFilterCode(filterCode, retryCount++);
            }, 100);
        }
    }

    public updateQueryParams() {
        const url = this.router.url.split('?')[0];
        const currentParams = this.route.snapshot.queryParamMap;

        this.router.navigate([url], {
            queryParams: {
                code: currentParams.get('code'),
                filter: this.selectedFilter && this.selectedFilter.Code,
            },
            skipLocationChange: false
        });
    }

    public hideSubTickers() {
        this.showSubTickers = false;
    }

    public onRowSelected(row) {
        this.selectedRow = row;
        this.showSubTickers = !row._editable;
    }

    public editModeChanged(event) {
        if (event) {
            this.showSubTickers = false;
        }
    }

    public onFilterSelected(index: number) {
        const filter = this.filters && this.filters[index];
        if (filter && filter !== this.selectedFilter) {
            this.selectedFilter = filter;
            this.selectedRow = null;
            this.showSubTickers = false;
            this.updateQueryParams();
        }
    }

    public getFilterCounts() {
        if (!this.ticker || !this.ticker.Filters) {
            return;
        }

        const filters = this.ticker.Filters;
        const selectQueries = filters.map((filter, index) => {
            let filterString;
            if (filter.FilterGroups && filter.FilterGroups.length) {
                filterString = this.tickerService.getFilterString(
                    filter.FilterGroups,
                    this.expressionFilters,
                    filter.UseAllCriterias,
                    this.ticker.Model
                );
            }

            if (!filterString) {
                filterString = filter.Filter  || 'ID gt 0';
            }

            return `sum(casewhen(${filterString}\\,1\\,0)) as FilterCount${index}`;
        });


        if (selectQueries.length) {
            const query = `model=${this.ticker.Model}`
                + `&select=${selectQueries.join(',')}`
                + `&expand=${this.ticker.CountExpand || this.ticker.Expand}`;

            this.statisticsService.GetAll(query).subscribe(
                res => {
                    if (res.Data && res.Data.length > 0) {
                        const counters = res.Data[0];
                        for (let i = 0; i < filters.length; i++) {
                            const filter = filters[i];
                            filter.CurrentCount = counters['FilterCount' + i];
                        }

                        this.cdr.markForCheck();
                    }
                },
                err => {/* fail silently */}
            );
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
