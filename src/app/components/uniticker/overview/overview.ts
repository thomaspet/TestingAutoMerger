import {Component, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';
import {UniTickerService, CustomerInvoiceService, CustomerOrderService, CustomerQuoteService} from '../../../services/services';
import {Ticker, TickerGroup, TickerAction} from '../../../services/common/uniTickerService';
import {Router, ActivatedRoute} from '@angular/router';
import {Location} from '@angular/common';
import {IToolbarConfig} from '../../common/toolbar/toolbar';
import {IUniSaveAction} from '../../../../framework/save/save';
import {UniTickerContainer} from '../tickerContainer/tickerContainer';
import {ITickerActionOverride} from '../../../services/common/uniTickerService';

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

    public tickerTitle: string;
    public createNewAction: TickerAction;
    public exportBusy: boolean;

    constructor(
        private tabService: TabService,
        private uniTickerService: UniTickerService,
        private router: Router,
        private route: ActivatedRoute,
        private location: Location,
        private cdr: ChangeDetectorRef,
        private customerInvoiceService: CustomerInvoiceService,
        private customerOrderService: CustomerOrderService,
        private customerQuoteService: CustomerQuoteService,
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
                        break;
                    case 'order_list':
                        this.actionOverrides = this.customerOrderService.actionOverrides;
                        break;
                    case 'quote_list':
                        this.actionOverrides = this.customerQuoteService.actionOverrides;
                        break;
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

    public navigateToTicker(ticker: Ticker) {
        this.router.navigate(['/overview'], {
            queryParams: { code: ticker.Code },
            skipLocationChange: false
        });
    }

    public onCreateNewClick() {
        if (this.tickerContainer && this.createNewAction) {
            this.tickerContainer.runAction(this.createNewAction);
        }
    }

    private selectTicker(selectedTickerCode: string) {
        this.selectedTicker = this.tickers.find(x => x.Code === selectedTickerCode);

        if (!this.selectedTicker) {
            this.navigateToTicker(this.tickerGroups[0].Tickers[0]);
            return;
        }

        this.updateTab();

        if (this.selectedTicker) {
            this.tickerTitle = this.selectedTicker.Name;
            this.createNewAction = undefined;
            if (this.selectedTicker.Actions) {
                this.createNewAction = this.selectedTicker.Actions.find(a => a.Type === 'new');
            }
        } else {
            this.tickerTitle = undefined;
            this.createNewAction = undefined;
        }

        this.cdr.markForCheck();
    }

    public onTickerParamsChange(params) {
        this.updateTab();
    }

    public exportToExcel() {
        if (this.exportBusy) {
            return;
        }

        this.exportBusy = true;
        this.tickerContainer.exportToExcel(() => {
            this.exportBusy = false;
        });
    }
}
