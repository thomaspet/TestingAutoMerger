import {Component, Type, AfterViewInit, ViewChildren, QueryList} from '@angular/core';
import {UniModal} from '../../../../../framework/modals/modal';
import {VacationpaySettingModalContent} from './vacationpaySettingModalContent';

@Component({
    selector: 'vacationpay-setting-modal',
    directives: [UniModal],
    templateUrl: 'app/components/salary/payrollrun/vacationpay/vacationpaySettingModal.html'
})
export class VacationpaySettingModal implements AfterViewInit {
    @ViewChildren(UniModal) private modalElements: QueryList<UniModal>;
    private type: Type = VacationpaySettingModalContent;
    private modalConfig: {hasCancelButton: boolean, cancel: any};
    private modals: UniModal[];

    constructor() {
        this.modalConfig = {
            hasCancelButton: true,
            cancel: () => {
                this.modals[0].close();
            }
        };
    }

    public ngAfterViewInit() {
        this.modals = this.modalElements.toArray();
    }

    public openModal() {
        this.modals[0].open();
    }
}
