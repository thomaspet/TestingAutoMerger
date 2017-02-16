import {Component, Input, Output, ViewChild, EventEmitter, OnChanges, SimpleChanges} from '@angular/core';
import {TofCustomerCard} from './customerCard';
declare var _;

@Component({
    selector: 'uni-tof-head',
    templateUrl: './tofHead.html'
})
export class TofHead extends OnChanges {
    @ViewChild(TofCustomerCard) private customerCard: TofCustomerCard;

    @Input() public entityName: string;
    @Input() public readonly: boolean;
    @Input() private data: any; // type?

    @Output() public dataChange: EventEmitter<any> = new EventEmitter();

    public tabs: string[] = ['Detaljer', 'Levering', 'Dokumenter'];
    public activeTabIndex: number = 0;

    public onDataChange(data) {
        this.dataChange.emit(data);
    }

    public ngOnChanges(changes: SimpleChanges) {
        if (changes['data']) {
            this.data = _.cloneDeep(this.data);
        }
    }

    public ngOnInit() {
        if (this.entityName === 'CustomerInvoice') {
            this.tabs.push('Purringer');
        }
    }

    public focus() {
        if (this.customerCard) {
            this.customerCard.focus();
        }
    }
    // TODO: focus handling

    // TODO: key handling?

}
