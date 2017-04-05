import {Component, ViewChild, Input, SimpleChanges} from '@angular/core';
import {UniTickerService} from '../../../services/services';
import {Ticker, TickerGroup, TickerHistory, ITickerActionOverride, TickerAction, TickerActionOptions} from '../../../services/common/uniTickerService';
import {UniTickerContainer} from '../tickerContainer/tickerContainer';

declare const _; // lodash

@Component({
    selector: 'uni-ticker-wrapper',
    templateUrl: './tickerWrapper.html'
})
export class UniTickerWrapper {
    @ViewChild(UniTickerContainer) private tickerContainer: UniTickerContainer;
    @Input() public tickerCode: string;
    @Input() public showFiltersAsNavbar: boolean = false;
    @Input() public actionOverrides: Array<ITickerActionOverride> = [];

    private tickers: Array<Ticker>;
    private selectedTicker: Ticker;
    private showSubTickers: boolean = true;

    constructor(private uniTickerService: UniTickerService) {
    }

    public ngOnChanges(changes: SimpleChanges) {
        if (changes['tickerCode'] && this.tickerCode) {
            this.setupView(this.tickerCode);
        }
    }

    private setupView(selectedTickerCode: string = null) {
        if (!this.tickers) {
            this.uniTickerService.getTickers()
                .then(tickers => {
                    this.tickers = tickers;

                    if (selectedTickerCode) {
                        this.showTicker(selectedTickerCode);
                    }
                });
        } else {
            if (selectedTickerCode) {
                if (!this.selectedTicker || this.selectedTicker.Code !== selectedTickerCode) {
                    this.showTicker(selectedTickerCode);
                }
            }
        }
    }

    private showTicker(selectedTickerCode: string) {
        this.selectedTicker = _.cloneDeep(this.tickers.find(x => x.Code === selectedTickerCode));
    }
}
