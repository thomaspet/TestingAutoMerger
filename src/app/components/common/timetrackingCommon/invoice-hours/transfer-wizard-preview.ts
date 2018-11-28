import { Component, Input } from '@angular/core';

import { ErrorService, InvoiceHourService, IWorkHours } from '@app/services/services';
import { IWizardOptions } from './wizardoptions';
import { WorkOrder } from './workorder';

@Component({
    selector: 'workitem-transfer-wizard-preview',
    templateUrl: './transfer-wizard-preview.html'
})
export class WorkitemTransferWizardPreview {
    @Input() options: IWizardOptions;

    busy = true;
    computing = true;
    mergeOption: string;
    orderList: Array<WorkOrder> = [];

    private baseList: Array<IWorkHours>;

    constructor(
        private errorService: ErrorService,
        private invoiceHourService: InvoiceHourService,
    ) {}

    onMergeOptionChange() {
        if (this.baseList) {
            this.options.mergeBy = parseInt(this.mergeOption, 10);
            this.orderList.length = 0;
            this.invoiceHourService.processList(this.baseList, this.options).then(result => {
                this.orderList = result;
            });
            return;
        }
        this.refresh();
    }

    refresh() {
        this.busy = true;
        this.orderList.length = 0;
        this.mergeOption = '' + this.options.mergeBy;
        this.fetchData().subscribe(list => {
            this.baseList = list;
            this.invoiceHourService.processList(list, this.options).then(result => {
                this.orderList = result;
                this.busy = false;
                this.computing = false;
            });
        });
    }

    private fetchData() {
        this.busy = true;
        return this.invoiceHourService.getOrderLineBaseData(this.options)
        .finally(() => this.busy = false)
        .catch((err, obs) => this.errorService.handleRxCatch(err, obs));
    }
}
