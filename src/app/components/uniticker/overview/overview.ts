import {Component, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';
import {UniTickerService, CustomerInvoiceService} from '../../../services/services';
import {Ticker, TickerGroup} from '../../../services/common/uniTickerService';
import {Router, ActivatedRoute} from '@angular/router';
import {Location} from '@angular/common';
import {IToolbarConfig} from '../../common/toolbar/toolbar';
import {IUniSaveAction} from '../../../../framework/save/save';
import {UniTickerContainer} from '../tickerContainer/tickerContainer';
import { ITickerActionOverride } from '../../../services/common/uniTickerService';

declare const _; // lodash

@Component({
    selector: 'uni-ticker-overview',
    templateUrl: './overview.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UniTickerOverview {
    @ViewChild(UniTickerContainer)
    private tickerContainer: UniTickerContainer;

    private tickers: Ticker[];
    private tickerGroups: TickerGroup[];
    private selectedTicker: Ticker;

    private actionOverrides: Array<ITickerActionOverride>;

    private toolbarConfig: IToolbarConfig = {
        title: 'Oversikt',
        omitFinalCrumb: true,
        contextmenu: []
    };

    public saveactions: IUniSaveAction[] = [{
        label: 'Eksporter til Excel',
        action: (completeEvent) => this.exportToExcel(completeEvent),
        main: true,
        disabled: false
    }];

    constructor(
        private tabService: TabService,
        private uniTickerService: UniTickerService,
        private router: Router,
        private route: ActivatedRoute,
        private location: Location,
        private cdr: ChangeDetectorRef,
        private customerInvoiceService: CustomerInvoiceService
    ) {
        this.tabService.addTab({
            name: 'Oversikt',
            url: '/overview',
            moduleID: UniModules.UniTicker,
            active: true
        });
    }

    public ngAfterViewInit() {
        this.uniTickerService.getTickers().then(tickers => {
            this.tickers = tickers;

            this.tickerGroups = this.uniTickerService.getGroupedTopLevelTickers(tickers);


            this.route.queryParams.subscribe((params) => {
                const tickerCode = params['code'];

                if (!this.selectedTicker || this.selectedTicker.Code !== tickerCode) {
                    if (tickerCode) {
                        this.selectTicker(tickerCode);
                    } else {
                        this.navigateToTicker(this.tickerGroups[0].Tickers[0]);
                    }
                }

                switch (tickerCode || this.tickerGroups[0].Tickers[0].Code) {
                    case 'invoice_list':
                        this.actionOverrides = this.customerInvoiceService.actionOverrides;
                }
            });
        });
    }

    private updateTab() {
        const urlWithParams = this.location.path(false);
        this.tabService.addTab({
            name: 'Oversikt',
            url: urlWithParams,
            moduleID: UniModules.UniTicker,
            active: true
        });
    }

    private updateToolbar() {
        let title = 'Oversikt';
        if (this.selectedTicker) {
            title += ': ' + this.selectedTicker.Name;
        }

        const config: IToolbarConfig = {
            title: title,
            omitFinalCrumb: true,
            contextmenu: []
        };

        if (this.selectedTicker && this.selectedTicker.Actions) {
            const newAction = this.selectedTicker.Actions.find(a => a.Type === 'new');
            if (!!newAction) {
                config.navigation = {
                    add: () => {
                        this.tickerContainer.runAction(newAction);
                    }
                };
            }
        }

        this.toolbarConfig = config;
    }

    private navigateToTicker(ticker: Ticker) {
        this.router.navigate(['/overview'], {
            queryParams: { code: ticker.Code },
            skipLocationChange: false
        });
    }

    private selectTicker(selectedTickerCode: string) {
        this.selectedTicker = this.tickers.find(x => x.Code === selectedTickerCode);

        if (!this.selectedTicker) {
            this.navigateToTicker(this.tickerGroups[0].Tickers[0]);
            return;
        }

        this.updateTab();
        this.updateToolbar();

        this.cdr.markForCheck();
    }

    public onTickerParamsChange(params) {
        this.updateTab();
    }

    private exportToExcel(completeEvent) {
        this.tickerContainer.exportToExcel(completeEvent);
    }
}
