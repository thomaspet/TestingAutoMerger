import {Component, Input, Output, ViewChild, EventEmitter, OnChanges, SimpleChanges} from '@angular/core';
import {FormControl} from '@angular/forms';
import {CurrencyCode} from '../../../unientities';
import {TofCustomerCard} from './customerCard';
import {TofDetailsForm} from './detailsForm';
declare var _;

@Component({
    selector: 'uni-tof-head',
    templateUrl: './tofHead.html'
})
export class TofHead implements OnChanges {
    @ViewChild(TofCustomerCard) private customerCard: TofCustomerCard;
    @ViewChild(TofDetailsForm) public detailsForm: TofDetailsForm;
    @Input() public entityName: string;
    @Input() public readonly: boolean;
    @Input() private data: any; // type?
    @Input() private currencyCodes: Array<CurrencyCode>;

    @Output() public dataChange: EventEmitter<any> = new EventEmitter();

    public tabs: string[] = ['Detaljer', 'Levering', 'Fritekst', 'Dokumenter'];
    public activeTabIndex: number = 0;
    private freeTextControl: FormControl = new FormControl('');

    public ngOnChanges(changes: SimpleChanges) {
        if (this.data) {
            this.freeTextControl.setValue(this.data.FreeTxt, {emitEvent: false});
        }
    }

    public onDataChange(data?: any) {
        let updatedEntity = data || this.data;
        updatedEntity.FreeTxt = this.freeTextControl.value;

        this.dataChange.emit(updatedEntity);
        this.data = _.cloneDeep(updatedEntity);
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
