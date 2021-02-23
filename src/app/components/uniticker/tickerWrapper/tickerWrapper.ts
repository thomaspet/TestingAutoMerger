import {
    Component,
    Input,
    SimpleChanges,
    ChangeDetectionStrategy,
    ChangeDetectorRef, ViewChild, Output, EventEmitter
} from '@angular/core';
import {
    Ticker,
    ITickerActionOverride,
    ITickerColumnOverride,
} from '../../../services/common/uniTickerService';
import {UniTickerService} from '../../../services/services';
import { UniTickerContainer } from '@app/components/uniticker/tickerContainer/tickerContainer';
import {ITableFilter} from '@uni-framework/ui/unitable';
declare const _; // lodash

@Component({
    selector: 'uni-ticker-wrapper',
    templateUrl: './tickerWrapper.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UniTickerWrapper {
    @Input() public tickerCode: string;
    @Input() public showFiltersAsNavbar: boolean = false;
    @Input() public actionOverrides: Array<ITickerActionOverride> = [];
    @Input() public columnOverrides: Array<ITickerColumnOverride> = [];
    @Input() public disableSubTickers = false;
    @Input() public tableFilters: ITableFilter[];
    @Output() public rowSelected: EventEmitter<any> = new EventEmitter<any>();
    private tickers: Array<Ticker>;
    public selectedTicker: Ticker;
    @ViewChild(UniTickerContainer, { static: true }) public tickerContainer: UniTickerContainer;
    constructor(
        private uniTickerService: UniTickerService,
        private cdr: ChangeDetectorRef
    ) {}

    public ngOnChanges(changes: SimpleChanges) {
        if (changes['tickerCode'] && this.tickerCode) {
            this.setupView(this.tickerCode);
        }
    }

    public refreshTicker() {
        this.showTicker(this.selectedTicker.Code);
    }

    private setupView(selectedTickerCode: string = null) {
        if (!this.tickers) {
            this.uniTickerService.getTickers()
                .then(tickers => {
                    this.tickers = tickers;

                    if (selectedTickerCode) {
                        this.showTicker(selectedTickerCode);
                    }
                })
                .catch(err => {
                    console.log(err);
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
        this.cdr.markForCheck();
    }
}
