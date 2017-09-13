import {
    Component,
    Input,
    OnChanges,
    SimpleChanges,
    Output,
    EventEmitter,
    ChangeDetectionStrategy
} from '@angular/core';
import {
    Ticker,
    TickerColumn,
    ITickerActionOverride,
    ITickerColumnOverride
} from '../../../services/common/uniTickerService';
import {UniTickerService} from '../../../services/services';

@Component({
    selector: 'uni-sub-ticker-container',
    templateUrl: './subTickerContainer.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UniSubTickerContainer implements OnChanges {
    @Input() public subTickers: Ticker[];
    @Input() public parentTicker: Ticker;
    @Input() public parentModel: any;
    // @Input() public expanded: boolean = false;
    @Input() public actionOverrides: ITickerActionOverride[];
    @Input() public columnOverrides: ITickerColumnOverride[] = [];

    @Output() public close: EventEmitter<any> = new EventEmitter<any>();

    private selectedSubTicker: Ticker;

    constructor(private tickerService: UniTickerService) {}

    public ngOnChanges(changes: SimpleChanges) {
        if (changes['subTickers']) {
            if (this.subTickers && this.subTickers.length > 0) {
                this.selectedSubTicker = this.subTickers[0];
            }
        }
    }

    private getParentTickerColumns() {
        return this.parentTicker.Columns.filter(x => x.Type !== 'dontdisplay');
    }

    private stopPropagation(event) {
        if (event) {
            event.stopPropagation();
        }
    }

    private closeSubtickers(event) {
        this.close.emit();

        if (event) {
            event.stopPropagation();
        }
    }

    public getFieldValue(column: TickerColumn, model: any) {
        return this.tickerService.getFieldValue(column, model, this.parentTicker, this.columnOverrides);
    }
}
