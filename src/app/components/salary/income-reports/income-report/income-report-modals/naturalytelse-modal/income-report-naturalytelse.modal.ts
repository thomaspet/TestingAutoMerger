import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CodeListRowsCodeListRow } from '@uni-entities';
import { IModalOptions, IUniModal } from '@uni-framework/uni-modal';
import * as moment from 'moment';
import { IncomeReportHelperService, Ytelse } from '../../../shared/shared-services/incomeReportHelperService';


@Component({
    selector: 'income-report-naturalytelse-modal',
    templateUrl: './income-report-naturalytelse.modal.html',

})

export class IncomeReportNaturalytelseModal implements IUniModal {
    @Input() options: IModalOptions = {};

    @Output()public onClose: EventEmitter<any> = new EventEmitter();

    public ytelse: Ytelse = new Ytelse();

    ytelseConfig = {
        template: (item: CodeListRowsCodeListRow) => item.Value2,
        searchable: false,
        hideDeleteButton: true
    };


    constructor(
        private helperService: IncomeReportHelperService,
    ) { }

    ngOnInit() {

    }

    onYtelseChange(item) {
        this.ytelse.naturalytelseType = item.Code;
        this.helperService
            .getNaturalytelseAmount(item.Code, this.options.data.employmentID)
            .subscribe(amount => this.ytelse.beloepPrMnd = amount);
    }

    update() {
        this.onClose.emit({ ...this.ytelse, fom: moment(this.ytelse.fom).format('YYYY-MM-DD')});
    }
}
