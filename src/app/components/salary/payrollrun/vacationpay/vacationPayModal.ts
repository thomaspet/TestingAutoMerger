import {Component, ViewChild, Output, EventEmitter, Type, AfterViewInit} from '@angular/core';
import {UniModal} from '../../../../../framework/modals/modal';
import {VacationpayModalContent} from './vacationPayModalContent';
import {ActivatedRoute} from '@angular/router';
import {ErrorService} from '../../../../services/services';


@Component({
    selector: 'vacationpay-modal',
    templateUrl: './vacationPayModal.html'
})
export class VacationpayModal implements AfterViewInit {
    @ViewChild(UniModal) private modal: UniModal;
    private modalConfig: {
        hasCancelButton: boolean,
        cancel: (dueToHolidayChanged: boolean) => void,
        payrollRunID: number ,
        submit: (dueToHolidayChanged: boolean) => void
    };
    @Output() public recalc: EventEmitter<any> = new EventEmitter<any>(true);
    @Output() public updatePayrollRun: EventEmitter<any> = new EventEmitter<any>(true);
    public type: Type<any> = VacationpayModalContent;

    constructor(private router: ActivatedRoute, private errorService: ErrorService) {
        this.router.params.subscribe((params) => {
            this.modalConfig = {
                hasCancelButton: true,
                cancel: (dueToHolidayChanged: boolean) => {
                    if (dueToHolidayChanged) {
                        this.recalc.emit(true);
                    }
                    this.modal.close();
                },
                submit: (dueToHolidayChanged: boolean) => {
                    if (dueToHolidayChanged) {
                        this.recalc.emit(true);
                    }
                    this.updatePayrollRun.emit(true);
                    this.modal.close();
                },
                payrollRunID: +params['id']
            };
            if (this.modal) {
                this.modal.getContent().then((component: VacationpayModalContent) => {
                component.updateConfig(this.modalConfig);
            });
            }
        });

    }

    public ngAfterViewInit() {
        this.modal.createContent();
    }

    public openModal() {
        this.modal.getContent().then((component: VacationpayModalContent) => {
            this.modal.open();
            component.load();
        }, err => this.errorService.handle(err));
    }
}
