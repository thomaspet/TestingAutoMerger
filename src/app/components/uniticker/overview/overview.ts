import {Component, ViewChild} from '@angular/core';
import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';
import {UniTabs} from '../../layout/uniTabs/uniTabs';
import {UniTickerService, PageStateService} from '../../../services/services';
import {Ticker, TickerGroup} from '../../../services/common/uniTickerService';
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
            console.log('this.route.params endret ' + this.router.url);
            this.setupView(params['code']);
        });
    }

    public ngOnInit() {

    }

    private onUrlChanged() {
        this.updateTabService();
    }

    private updateTabService() {
        let path = this.location.path(false);
        this.tabService.addTab({
                name: this.selectedTicker ? this.selectedTicker.Name : 'Oversikt',
                url: path,
                moduleID: UniModules.UniQuery,
                active: true
            });
    }

    private setupView(selectedTickerCode: string = null) {
        if (!this.tickers) {
            this.uniTickerService.getTickers()
                .subscribe(tickers => {
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
        this.selectedTicker = this.tickers.find(x => x.Code === selectedTickerCode);
        this.updateTabService();
    }

    private exportToExcel(completeEvent) {
        this.tickerContainer.exportToExcel(completeEvent);
    }

    private showHistoricSearch() {
        alert('Ikke implementert - må sende inn info om søket og oppdatere visningen');
    }
}
