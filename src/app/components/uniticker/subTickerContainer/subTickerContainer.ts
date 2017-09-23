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
    @Input() public actionOverrides: ITickerActionOverride[];
    @Input() public columnOverrides: ITickerColumnOverride[] = [];

    @Output() public close: EventEmitter<any> = new EventEmitter<any>();

    constructor(private tickerService: UniTickerService) {}

    public ngOnChanges(changes: SimpleChanges) {}

    public closeSubtickers() {
        this.close.emit();
    }
}
