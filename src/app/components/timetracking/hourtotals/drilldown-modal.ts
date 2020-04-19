import { Component, Input, Output, EventEmitter } from '@angular/core';
import { IUniModal, IModalOptions } from '@uni-framework/uni-modal';

@Component({
    selector: 'hourtotals-drilldown-modal',
    template: `<h3>Hello modal!</h3>`
})
export class HourTotalsDrilldownModal implements IUniModal {
    @Input() options: IModalOptions = {};
    @Output() onClose = new EventEmitter();

}
