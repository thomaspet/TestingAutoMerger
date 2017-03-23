import {Component, ViewChild, Input, OnInit, OnChanges, SimpleChanges, Output, EventEmitter} from '@angular/core';
import {Ticker, TickerGroup, TickerColumn} from '../../../services/common/uniTickerService';
import {UniTickerService} from '../../../services/services';

@Component({
    selector: 'uni-sub-ticker-container',
    templateUrl: './subTickerContainer.html'
})
export class UniSubTickerContainer implements OnChanges {
    @Input() subTickers: Array<Ticker>;
    @Input() parentTicker: Ticker;
    @Input() parentModel: any;
    @Input() private expanded: boolean = false;

    @Output() close: EventEmitter<any> = new EventEmitter<any>();

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

        this.stopPropagation();

        this.selectedSubTicker = subTicker;
    }

    private stopPropagation() {
        event.stopPropagation();
    }

    private closeSubtickers() {
        this.close.emit();
        this.stopPropagation();
    }

    public getFieldValue(column: TickerColumn, model: any) {
        return this.tickerService.getFieldValue(column, model, this.parentTicker);
    }
}
