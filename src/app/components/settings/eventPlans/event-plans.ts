import { Component } from '@angular/core';
import { Eventplan } from '@app/unientities';
import { EventplanService } from '@app/services/common/eventplan.service';

import { ErrorService } from '@app/services/common/errorService';
import { ToastService, ToastTime, ToastType } from '@uni-framework/uniToast/toastService';
import { Observable } from 'rxjs';
import { ConfirmActions, UniModalService } from '@uni-framework/uni-modal';

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
        public modalService: UniModalService
    ) {
        this.onAddNewEventplan();
        this.requestData();
        this.currentEventplan = new Eventplan();
        this.currentEventplan.Active = true;
        this.currentEventplan.Subscribers = [];
    }

    requestData(result =  null) {
        this.eventplanService.getData()
            .subscribe(data => {
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
                    this.eventplanService.save(this.currentEventplan).then((result: any) => {
                        this.areDetailsTouched = false;
                        this.eventplanService.getData()
                            .subscribe(data => {
                                this.toast.addToast('Flyt lagret', ToastType.good, ToastTime.medium);
                                this.currentEventplan = result;
                                this.data = data;
                                this.selectedIndex = this.data.findIndex(item => item.ID === result.ID);
                            });
                    }).catch(reason => {
                        this.toast.addToast(reason, ToastType.bad, ToastTime.medium);
                    });
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
        this.eventplanService.save(eventplan).then((result) => {
            this.areDetailsTouched = false;
            this.requestData(result);
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

    public canDeactivate(): boolean | Observable<boolean> {
        if (this.areDetailsTouched === false) {
            return true;
        }
        return this.openUnsavedChangesModal();
    }

    private openUnsavedChangesModal() {
        return Observable.create(observer => {
            this.modalService.openUnsavedChangesModal().onClose.subscribe(res => {
                if (res === ConfirmActions.ACCEPT) {
                    this.eventplanService.save(this.currentEventplan).then(() => {
                        this.areDetailsTouched = false;
                        this.requestData();
                        this.toast.addToast('Flyt lagret', ToastType.good, ToastTime.medium);
                        observer.next(true);
                        observer.complete();
                    }).catch(reason => {
                        this.toast.addToast(reason, ToastType.bad, ToastTime.medium);
                        observer.next(false);
                        observer.complete();
                    });
                } else {
                    observer.next(res !== ConfirmActions.CANCEL);
                    observer.complete();
                }
            });
        });
    }
}
