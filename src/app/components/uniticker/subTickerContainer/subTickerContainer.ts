import {Component, ViewChild, Input, OnInit, OnChanges, SimpleChanges} from '@angular/core';
import {Ticker, TickerGroup, TickerColumn} from '../../../services/common/UniTickerService';
import {UniTickerService} from '../../../services/services';

@Component({
    selector: 'uni-sub-ticker-container',
    templateUrl: 'app/components/uniticker/subTickerContainer/subTickerContainer.html'
})
export class UniSubTickerContainer implements OnChanges {
    @Input() subTickers: Array<Ticker>;
    @Input() parentTicker: Ticker;
    @Input() parentModel: any;
    @Input() private expanded: boolean = false;
    private selectedSubTicker: Ticker;

    constructor(private tickerService: UniTickerService) {

    }

    public ngOnChanges(changes: SimpleChanges) {
        if (changes['subTickers']) {
            if (this.subTickers && this.subTickers.length > 0) {
                this.selectedSubTicker = this.subTickers[0];
            }
        }

        if (changes['parentModel'] && this.parentModel) {

        }
    }

    private onSelectSubTicker(subTicker: Ticker) {
        this.subTickers.forEach(x => {
            x.IsActive = false;
        });

        subTicker.IsActive = true;

        event.stopPropagation();

        this.selectedSubTicker = subTicker;
    }

    public getFieldValue(column: TickerColumn, model: any) {
        return this.tickerService.getFieldValue(column, model);
    }
}
