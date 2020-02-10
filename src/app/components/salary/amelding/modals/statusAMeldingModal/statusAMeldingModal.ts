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
    altinnStatus = '';
    withGuidelines = false;
    received = false;

    ngOnInit(): void {
        const options = this.options;
        this.period = options.data.period;
        this.altinnStatus = options.data.altinnStatus;
        this.withGuidelines = this.altinnStatus.toLowerCase().includes('mottatt')
            && this.altinnStatus.toLowerCase().includes('retningslinje');
        this.received = this.altinnStatus.toLowerCase().includes('mottatt')
            && !this.altinnStatus.toLowerCase().includes('retningslinje');
    }

    close(makePayment: boolean) {
        this.onClose.next(makePayment);
    }
}
