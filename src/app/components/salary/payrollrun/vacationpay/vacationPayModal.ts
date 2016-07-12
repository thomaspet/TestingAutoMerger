import { Component, ViewChildren, QueryList, Output, EventEmitter, AfterViewInit, Type } from '@angular/core';
import { UniModal } from '../../../../../framework/modals/modal';
import { VacationpayModalContent } from './vacationPayModalContent';
import {RootRouteParamsService} from '../../../../services/rootRouteParams';

@Component({
    selector: 'vacationpay-modal',
    templateUrl: 'app/components/salary/payrollrun/vacationpay/vacationPayModal.html',
    directives: [UniModal]
})
export class VacationpayModal implements AfterViewInit {
    @ViewChildren(UniModal) private modalElements: QueryList<UniModal>;
    private modalConfig: {hasCancelButton: boolean, cancel: any, payrollRunID: number};
    private payrollRunID: number;
    private modals: UniModal[];
    @Output() public updatePayrollRun: EventEmitter<any> = new EventEmitter<any>(true);
    public type: Type = VacationpayModalContent;

    constructor(private rootRouteParams: RootRouteParamsService) {
        if (!this.payrollRunID) {
            this.payrollRunID = +rootRouteParams.params.get('id');
        }
        this.modalConfig = {
            hasCancelButton: true,
            cancel: () => {
                this.modals[0].close();
            },
            payrollRunID: this.payrollRunID
        };
    }

    public ngAfterViewInit() {
        this.modals = this.modalElements.toArray();
    }

    public openModal() {
        this.modals[0].getContent().then((component: VacationpayModalContent) => {
            this.modals[0].open();
        }, (error) => console.log('error: ' + error));
    }
}
