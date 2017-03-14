import { Component, ViewChild, Type, Input } from '@angular/core';
import { UniModal } from '../../../../../framework/modals/modal';
import { SalaryBalanceLine, SalaryBalance } from '../../../../unientities';

type ModalContext = {
    salarybalance: SalaryBalance,
    readOnly: boolean
};

type ModalConfig = {
    cancel: () => void,
    submit: (line: SalaryBalanceLine) => void,
    context: ModalContext
};

@Component({
    selector: 'salarybalanceline-modal-content',
    templateUrl: './salarybalancelinemodal.html'
})
export class SalarybalancelineModalContent {
    @Input() public config: any;
    private salarybalance: SalaryBalance;

    constructor() {

    }

    public ngOnInit() {
        this.salarybalance = this.config.context.salarybalance;
    }
}




@Component({
    selector: 'salarybalanceline-modal',
    template: `<uni-modal [type]="type" [config]="modalConfig"></uni-modal>`
})
export class SalarybalancelineModal {
    @ViewChild(UniModal) private modal: UniModal;
    private modalConfig: ModalConfig;
    private context: ModalContext;
    public type: Type<any> = SalarybalancelineModalContent;

    constructor() {
        this.modalConfig = {
            cancel: () => {
                this.modal.close();
            },
            submit: (line: SalaryBalanceLine) => {
                this.modal.close();
            },
            context: this.context
        };
    }

    public openModal(salarybalance: SalaryBalance, readOnly: boolean) {
        this.modalConfig.context = {
            salarybalance: salarybalance,
            readOnly: readOnly
        };
        this.modal.open();
    }
}
