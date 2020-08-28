import {Component, EventEmitter} from '@angular/core';
import {IModalOptions, IUniModal} from '@uni-framework/uni-modal/interfaces';
import {BillingData} from '@app/models/elsa-models';

@Component({
    selector: 'settlements-modal',
    templateUrl: './settlements-modal.html',
    styleUrls: ['./settlements-modal.sass']
})
export class SettlementsModal implements IUniModal {
    options: IModalOptions = {};
    onClose: EventEmitter<any> = new EventEmitter();
    headerText: string;

    settlement: BillingData;

    constructor() {}

    ngOnInit() {
        this.settlement = this.options.data.settlement || {};
        this.headerText = this.options.data.header || 'Delavregning';
        this.settlement['_periodText'] = this.settlement['_period'].replace('Delavregning', 'Periode');
    }
}
