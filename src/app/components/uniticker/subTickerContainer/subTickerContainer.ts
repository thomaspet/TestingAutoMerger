import {
    Component,
    Input,
    Output,
    EventEmitter,
    ChangeDetectionStrategy,
} from '@angular/core';
import {
    Ticker,
    ITickerActionOverride,
    ITickerColumnOverride
} from '../../../services/common/uniTickerService';

@Component({
    selector: 'uni-sub-ticker-container',
    templateUrl: './subTickerContainer.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UniSubTickerContainer {
    @Input() public subTickers: Ticker[];
    @Input() public parentTicker: Ticker;
    @Input() public parentModel: any;
    @Input() public actionOverrides: ITickerActionOverride[];
    @Input() public columnOverrides: ITickerColumnOverride[] = [];

    @Output() public close: EventEmitter<any> = new EventEmitter<any>();

    public closeSubtickers() {
        this.close.emit();
    }
}
