import {Component, ViewChild} from '@angular/core';
import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';
import {UniTabs} from '../../layout/uniTabs/uniTabs';
import {UniTickerService, PageStateService} from '../../../services/services';
import {Ticker, TickerGroup, TickerHistory} from '../../../services/common/uniTickerService';
import {Router, ActivatedRoute} from '@angular/router';
import {Location} from '@angular/common';
import {IToolbarConfig} from '../../common/toolbar/toolbar';
import {IUniSaveAction} from '../../../../framework/save/save';
import {UniTickerContainer} from '../tickerContainer/tickerContainer';

declare const _; // lodash

@Component({
    selector: 'uni-ticker-overview',
    templateUrl: './overview.html'
})
export class UniTickerOverview {
    @ViewChild(UniTickerContainer) private tickerContainer: UniTickerContainer;
    private tickers: Array<Ticker>;
    private tickerGroups: Array<TickerGroup>;
    private selectedTicker: Ticker;

    private showSubTickers: boolean = true;
    private lastSearch: TickerHistory;


    private toolbarConfig: IToolbarConfig = {
        title: 'Oversikt',
        omitFinalCrumb: true,
        contextmenu: [
        ]
    };

    private saveactions: IUniSaveAction[] = [
         {
             label: 'Eksporter til Excel',
             action: (completeEvent) => this.exportToExcel(completeEvent),
             main: true,
             disabled: false
         }
    ];

    constructor(private tabService: TabService,
        private uniTickerService: UniTickerService,
        private router: Router,
        private route: ActivatedRoute,
        private pageStateService: PageStateService,
        private location: Location) {

        this.tabService.addTab({ name: 'Oversikt', url: '/tickers/overview', moduleID: UniModules.UniQuery, active: true });

        this.route.params.subscribe((params) => {
            this.setupView(params['code']);
        });
    }

    public ngOnInit() {

    }

    private onUrlChanged() {
        let url = this.location.path(false);

        this.updateTabService(url);

        if (this.selectedTicker) {
            setTimeout(() => {
                this.lastSearch =
                    this.uniTickerService.addSearchHistoryItem(
                        this.selectedTicker,
                        this.tickerContainer.selectedFilter,
                        url
                    );
            });
        }
    }

    private onShowSearch(search: TickerHistory) {
        // navigate - this is done to set the URL props - but it will not actually do
        // much unless the ticker changes - so set the ticker manually afterwards to
        // force the view to update itself if the ticker is the same (but another
        // filter is used)
        this.router.navigateByUrl(search.Url);

        if (this.selectedTicker && this.selectedTicker.Code === search.Ticker.Code) {
            setTimeout(() => {
                this.showTicker(search.Ticker.Code);
            });
        }
    }

    private updateTabService(url: string) {
        this.tabService.addTab({
                name: this.selectedTicker ? 'Utvalg: ' + this.selectedTicker.Name : 'Utvalg',
                url: url,
                moduleID: UniModules.UniQuery,
                active: true
            });
    }

    private setupView(selectedTickerCode: string = null) {
        if (!this.tickers) {
            this.uniTickerService.getTickers()
                .then(tickers => {
                    this.tickers = tickers;
                    this.tickerGroups = this.uniTickerService.getGroupedTopLevelTickers(tickers);

                    if (selectedTickerCode) {
                        this.showTicker(selectedTickerCode);
                    }

                    if (!this.selectedTicker) {
                        this.navigateToTicker(this.tickerGroups[0].Tickers[0]);
                    }

                    let contextMenuItems = [];
                    this.tickerGroups.forEach((tickerGroup: TickerGroup) => {
                        tickerGroup.Tickers.forEach((ticker: Ticker) => {
                            contextMenuItems.push({
                                label: `${tickerGroup.Name}: ${ticker.Name}`,
                                action: () => {
                                    this.navigateToTicker(ticker);
                                }
                            });
                        });
                    });

                    this.toolbarConfig.contextmenu = contextMenuItems;
                    this.toolbarConfig = _.cloneDeep(this.toolbarConfig);
                });
        } else {
            if (selectedTickerCode) {
                if (!this.selectedTicker || this.selectedTicker.Code !== selectedTickerCode) {
                    this.showTicker(selectedTickerCode);
                }
            }
        }
    }

    private navigateToTicker(ticker: Ticker) {
        this.router.navigateByUrl('/tickers/ticker/' + ticker.Code);
    }

    private showTicker(selectedTickerCode: string) {
        this.selectedTicker = _.cloneDeep(this.tickers.find(x => x.Code === selectedTickerCode));

        let url = this.location.path(false);
        this.updateTabService(url);
    }

    private exportToExcel(completeEvent) {
        this.tickerContainer.exportToExcel(completeEvent);
    }
}
