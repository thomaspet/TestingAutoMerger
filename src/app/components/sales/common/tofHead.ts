import {
    Component,
    Input,
    Output,
    ViewChild,
    EventEmitter,
} from '@angular/core';
import {TofCustomerCard} from './customerCard';
declare const _;
@Component({
    selector: 'uni-tof-head',
    templateUrl: 'app/components/sales/common/tofHead.html'
})
export class TofHead {
    @ViewChild(TofCustomerCard)
    private customerCard: TofCustomerCard;

    @Input()
    public entityName: string;

    @Input()
    public readonly: boolean;

    @Input()
    private data: any; // type?

    @Output()
    public dataChange: EventEmitter<any> = new EventEmitter();

    public tabs: string[] = ['Detaljer', 'Levering', 'Dokumenter'];
    public activeTabIndex: number = 0;

    public onDataChange(data) {
        this.data = _.cloneDeep(data);
        this.dataChange.next(this.data);
    }

    public focus() {
        if (this.customerCard) {
            this.customerCard.focus();
        }
    }
    // TODO: focus handling

    // TODO: key handling?

}
