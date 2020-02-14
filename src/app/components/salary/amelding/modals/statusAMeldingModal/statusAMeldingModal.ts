import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {IModalOptions, IUniModal} from '@uni-framework/uni-modal';

@Component({
    selector: 'status-amelding-modal',
    templateUrl: './statusAMeldingModal.html',
    styleUrls: ['./statusAMeldingModal.sass']
})
export class StatusAMeldingModal implements OnInit, IUniModal {

    public options: IModalOptions;
    public onClose: EventEmitter<any> = new EventEmitter<any>();

    period = 0;
    periodStatus = '';
    withGuidelines = false;
    received = false;

    ngOnInit(): void {
        const options = this.options;
        this.period = options.data.period;
        this.periodStatus = options.data.periodStatus.toLowerCase().includes('øyeblikkelig') ? 'øyeblikkelig' : options.data.periodStatus;
        this.withGuidelines = this.periodStatus.toLowerCase().includes('mottatt')
            && this.periodStatus.toLowerCase().includes('retningslinje');
        this.received = this.periodStatus.toLowerCase().includes('mottatt')
            && !this.periodStatus.toLowerCase().includes('øyeblikkelig')
            && !this.periodStatus.toLowerCase().includes('retningslinje');
    }

    close(makePayment: boolean) {
        this.onClose.next(makePayment);
    }
}
