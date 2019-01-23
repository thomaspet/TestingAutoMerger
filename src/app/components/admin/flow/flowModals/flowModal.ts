import {Component, ViewChild, Input, Output, EventEmitter, AfterViewInit} from '@angular/core';
import {IModalOptions, IUniModal} from '@uni-framework/uni-modal';
import {ToastService, ToastType} from '@uni-framework/uniToast/toastService';
import {FlowModalEntity} from '@app/components/admin/flow/flowModals/1.entitiy';
import {FlowModalTriggers} from '@app/components/admin/flow/flowModals/2.triggers';
import {FlowModalPlan} from '@app/components/admin/flow/flowModals/3.plan';
import {FlowModalReceipt} from '@app/components/admin/flow/flowModals/4.receipt';
import {Eventplan} from '@app/unientities';

export const FLOW_MODAL_PAGES = [
    FlowModalEntity,
    FlowModalTriggers,
    FlowModalPlan,
    FlowModalReceipt,
];

export interface FlowModalPage {
    getErrors(): string[]
}

@Component({
    selector: 'flow-template-modal',
    templateUrl: './flowModal.html',
    styleUrls: ['./flowModal.sass']
})
export class FlowModal implements IUniModal, AfterViewInit {
    @ViewChild(FlowModalEntity) entityView: FlowModalEntity;
    @ViewChild(FlowModalTriggers) triggersView: FlowModalTriggers;
    @ViewChild(FlowModalPlan) planView: FlowModalPlan;
    @ViewChild(FlowModalReceipt) receiptView: FlowModalReceipt;
    currentPageIndex = 0;

    @Input()
    options: IModalOptions = {};

    @Output()
    onClose: EventEmitter<Eventplan> = new EventEmitter<Eventplan>();

    eventPlan: Eventplan = <Eventplan>{};

    constructor(
        private toastService: ToastService,
    ) {}

    ngAfterViewInit() {
    }

    ngOnInit() {
        if (this.options.data) {
            this.eventPlan = this.options.data;
        } else {
            this.eventPlan = <Eventplan>{Active: true};
        }
        if (this.options.modalConfig && this.options.modalConfig.startPageIndex) {
            this.currentPageIndex = this.options.modalConfig.startPageIndex;
        }
    }

    findCurrentPage(): FlowModalPage {
        switch (this.currentPageIndex) {
            case 0: return this.entityView;
            case 1: return this.triggersView;
            case 2: return this.planView;
            case 3: return this.receiptView;
        }
    }

    close() {
        if (!this.canNavigateNext()) {
            const errors = this.findCurrentPage().getErrors();
            errors.forEach(error => this.toastService.addToast(
                'Advarsel',
                ToastType.warn,
                5,
                error,
                null,
                true,
            ));
        } else {
            this.onClose.emit(this.eventPlan);
        }
    }

    canNavigateNext(): boolean {
        const currentPage = this.findCurrentPage();
        if (currentPage) {
            const errors = this.findCurrentPage().getErrors();
            return errors.length == 0;
        }
        return false;
    }

    navigateNext() {
        if (!this.canNavigateNext()) {
            const errors = this.findCurrentPage().getErrors();
            errors.forEach(error => this.toastService.addToast(
                'Advarsel',
                ToastType.warn,
                5,
                error,
                null,
                true,
            ));
        } else {
            this.currentPageIndex++;
        }
    }

    navigateBack() {
        this.currentPageIndex--;
    }
}
