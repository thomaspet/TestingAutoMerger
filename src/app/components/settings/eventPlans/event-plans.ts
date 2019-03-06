import { Component } from '@angular/core';
import { Eventplan } from '@app/unientities';
import { EventplanService } from '@app/services/common/eventplan.service';

import { ErrorService } from '@app/services/common/errorService';
import { ToastService, ToastTime, ToastType } from '@uni-framework/uniToast/toastService';
import { ConfirmActions, UniModalService } from '@uni-framework/uni-modal';
import { GuidService } from '@app/services/services';

@Component({
    selector: 'event-plans',
    templateUrl: './event-plans.html'
})
export class EventPlans {
    currentEventplan: Eventplan;
    data: Eventplan[];
    areDetailsTouched = false;
    selectedIndex: number;

    constructor(
        public eventplanService: EventplanService,
        public errorService: ErrorService,
        public toast: ToastService,
        public modalService: UniModalService,
        private guidService: GuidService
    ) {
        this.onAddNewEventplan();
        this.requestData();
        this.currentEventplan = new Eventplan();
        this.currentEventplan.Active = true;
        this.currentEventplan.Subscribers = [];
    }

    requestData(result =  null) {
        this.eventplanService.GetAll().subscribe(data => {
            this.data = data;
            if (result) {
                this.currentEventplan = this.data.find(item => item.ID === result.ID);
            }
        });
    }

    onAddNewEventplan() {
        this.currentEventplan = new Eventplan();
        this.currentEventplan = Object.assign(this.currentEventplan, { Active: true});
        this.currentEventplan.Subscribers = [];
        this.areDetailsTouched = false;
    }

    onEventplanSelected(row) {
        if (!this.areDetailsTouched) {
            this.currentEventplan = row;
            this.areDetailsTouched = false;
        } else {
            this.modalService.openUnsavedChangesModal().onClose.subscribe((res: any) => {
                if (res === ConfirmActions.ACCEPT) {
                    this.onSaveEventplan(this.currentEventplan);
                } else {
                    if (res !== ConfirmActions.CANCEL) {
                        this.currentEventplan = row;
                        this.areDetailsTouched = false;
                    }
                }
            });
        }
    }

    onSaveEventplan(eventplan) {
        const subscribers = eventplan.Subscribers && eventplan.Subscribers
            .filter(row => !row['_isEmpty'])
            .map(s => {
                if (!s.ID) {
                    s._createguid = this.guidService.guid();
                }
                if (!s.Active) {
                    s.Active = false;
                }
                return s;
            });
        eventplan.Subscribers = subscribers;

        this.eventplanService.save(eventplan).subscribe(
            (result) => {
                this.areDetailsTouched = false;
                this.requestData(result);
                this.toast.addToast('Flyt lagret', ToastType.good, ToastTime.medium);
            },
            err => this.toast.addToast(err, ToastType.bad, ToastTime.medium)
        );
    }

    onDeleteEventplan(eventplan) {
        this.eventplanService.Remove(eventplan.ID).subscribe(
            () => {
                this.requestData();
                this.currentEventplan = new Eventplan();
                this.currentEventplan.Active = true;
                this.currentEventplan.Subscribers = [];
                this.toast.addToast('Flyt slettet', ToastType.good, ToastTime.medium);
            },
            (error) => this.errorService.handle(error)
        );
    }

    onAddSubscriber() {
        this.areDetailsTouched = true;
    }

    onUpdateSubscriber() {
        this.areDetailsTouched = true;
    }

    onDeleteSubscriber() {
        this.areDetailsTouched = true;
    }

    onDetailsTouched(areTouched) {
        this.areDetailsTouched = areTouched;
    }
}
