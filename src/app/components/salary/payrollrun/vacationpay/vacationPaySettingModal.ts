import {Component, Type, ViewChild} from '@angular/core';
import {UniModal} from '../../../../../framework/modals/modal';
import {VacationpaySettingModalContent} from './vacationpaySettingModalContent';

@Component({
    selector: 'vacationpay-setting-modal',
    directives: [UniModal],
    templateUrl: 'app/components/salary/payrollrun/vacationpay/vacationpaySettingModal.html'
})
export class VacationpaySettingModal {
    @ViewChild(UniModal) private modal: UniModal;
    private type: Type = VacationpaySettingModalContent;
    private modalConfig: {hasCancelButton: boolean, cancel: any};

    constructor() {
        this.modalConfig = {
            hasCancelButton: true,
            cancel: () => {
                this.modal.close();
            }
        };
    }

    public openModal() {
        this.modal.getContent().then((component: VacationpaySettingModalContent) => {
            component.loadData();
            this.modal.open();
        });
        
    }
}
