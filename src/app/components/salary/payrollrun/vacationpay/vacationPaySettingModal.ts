import {Component, Type, ViewChild, AfterViewInit, EventEmitter, Output} from '@angular/core';
import {UniModal} from '../../../../../framework/modals/modal';
import {VacationpaySettingModalContent} from './vacationpaySettingModalContent';

@Component({
    selector: 'vacationpay-setting-modal',
    templateUrl: './vacationpaySettingModal.html'
})
export class VacationpaySettingModal implements AfterViewInit {
    @ViewChild(UniModal) private modal: UniModal;
    private type: Type<any> = VacationpaySettingModalContent;
    private modalConfig: {hasCancelButton: boolean, cancel: any};
    public dueToHolidayChanged: boolean;
    @Output() public recalc: EventEmitter<any> = new EventEmitter<any>(true);

    constructor() {
        this.modalConfig = {
            hasCancelButton: true,
            cancel: () => {
                this.modal.getContent().then((component: VacationpaySettingModalContent) => {
                    this.dueToHolidayChanged = component.dueToHolidayChanged;
                    if (this.dueToHolidayChanged) {
                        this.recalc.emit(true);
                    }
                    this.modal.close();
                });
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
