import { Component } from '@angular/core';
import { Eventplan } from '@app/unientities';
import { EventplanService } from '@app/components/settings/eventPlans/eventplan.service';

import { ErrorService } from '@app/services/common/errorService';
import { ToastService, ToastTime, ToastType } from '@uni-framework/uniToast/toastService';

@Component({
    selector: 'event-plans',
    templateUrl: './event-plans.html'
})
export class EventPlans {
    currentEventplan: Eventplan;
    data: Eventplan[];
    areDetailsTouched = false;

    constructor(
        public eventplanService: EventplanService,
        public errorService: ErrorService,
        public toast: ToastService
    ) {
        this.onAddNewEventplan();
        this.requestData();
        this.currentEventplan = new Eventplan();
        this.currentEventplan.Active = true;
        this.currentEventplan.Subscribers = [];
    }

    requestData() {
        this.eventplanService.getData()
            .subscribe(data => this.data = data);
    }

    onAddNewEventplan() {
        this.currentEventplan = new Eventplan();
        this.currentEventplan = Object.assign(this.currentEventplan, { Active: true});
        this.currentEventplan.Subscribers = [];
        this.areDetailsTouched = false;
    }

    onEventplanSelected(row) {
        this.currentEventplan = row;
    }

    onSaveEventplan(eventplan) {
        this.eventplanService.save(eventplan).then(() => {
            this.areDetailsTouched = false;
            this.requestData();
            this.toast.addToast('Flyt lagret', ToastType.good, ToastTime.medium);
        }).catch(reason => this.toast.addToast(reason, ToastType.bad, ToastTime.medium));
    }

    onDeleteEventplan(eventplan) {
        this.eventplanService.delete(eventplan)
            .subscribe(
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
