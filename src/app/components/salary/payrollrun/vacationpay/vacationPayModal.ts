import {Component, ViewChild, Output, EventEmitter, Type, AfterViewInit} from '@angular/core';
import {UniModal} from '../../../../../framework/modals/modal';
import {VacationpayModalContent} from './vacationPayModalContent';
import {ActivatedRoute} from '@angular/router';
declare var _;

@Component({
    selector: 'vacationpay-modal',
    templateUrl: 'app/components/salary/payrollrun/vacationpay/vacationPayModal.html'
})
export class VacationpayModal implements AfterViewInit {
    @ViewChild(UniModal) private modal: UniModal;
    private modalConfig: { hasCancelButton: boolean, cancel: any, payrollRunID: number };
    
    @Output() public updatePayrollRun: EventEmitter<any> = new EventEmitter<any>(true);
    public type: Type = VacationpayModalContent;

    constructor(private router: ActivatedRoute) {
        this.router.params.subscribe((params) => {
            this.modalConfig = {
                hasCancelButton: true,
                cancel: () => {
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
        }, (error) => console.log('error: ' + error));
    }
}
