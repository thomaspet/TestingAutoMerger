import {
    Component,
    Input,
    Output,
    ViewChild,
    EventEmitter,
    HostListener
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
    private entityName: string;

    @Input()
    private readonly: boolean;

    @Input()
    private data: any; // type?

    @Output()
    public dataChange: EventEmitter<any> = new EventEmitter();

    private tabs: string[] = ['Detaljer', 'Levering', 'Dokumenter'];
    private activeTabIndex: number = 0;

    public onDataChange(data) {
        this.data = _.cloneDeep(data);
        this.dataChange.next(this.data);
    }

    // TODO: focus handling

    // TODO: key handling?

}
