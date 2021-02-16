import { Component, EventEmitter, Output } from '@angular/core';
import { IUniModal } from '@uni-framework/uni-modal';
import * as moment from 'moment';
import { EndringIRefusjon } from '../../../shared/shared-services/incomeReportHelperService';


@Component({
    selector: 'income-report-changeincome-modal',
    templateUrl: './income-report-changeincome.modal.html',
})

export class IncomeReportChangeIncomeModal implements IUniModal {
    @Output()
    public onClose: EventEmitter<any> = new EventEmitter();

    public endring: EndringIRefusjon = new EndringIRefusjon();

    constructor() { }

    update() {
        this.onClose.emit({ ...this.endring, endringsdato: moment(this.endring.endringsdato).format('YYYY-MM-DD') });
    }
}
