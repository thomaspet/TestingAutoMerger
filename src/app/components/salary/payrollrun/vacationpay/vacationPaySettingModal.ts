import {Component, Type, ViewChild, AfterViewInit} from '@angular/core';
import {UniModal} from '../../../../../framework/modals/modal';
import {VacationpaySettingModalContent} from './vacationpaySettingModalContent';

@Component({
    selector: 'vacationpay-setting-modal',
    templateUrl: 'app/components/salary/payrollrun/vacationpay/vacationpaySettingModal.html'
})
export class VacationpaySettingModal implements AfterViewInit {
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

    public ngAfterViewInit() {
        this.modal.createContent();
    }

    public openModal() {
        this.modal.getContent().then((component: VacationpaySettingModalContent) => {
            component.loadData();
            this.modal.open();
        });
        
    }
}
