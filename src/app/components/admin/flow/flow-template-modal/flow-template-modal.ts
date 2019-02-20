import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { cloneDeep } from 'lodash';
import { IModalOptions, IUniModal } from '@uni-framework/uni-modal';
import { FlowInput } from '../templates/template-data';
import { AuthService } from '@app/authService';
import { Eventplan } from '@uni-entities';
import { EventplanService, ErrorService, GuidService } from '@app/services/services';
import { ToastService, ToastType } from '@uni-framework/uniToast/toastService';

@Component({
    selector: 'flow-template-modal',
    templateUrl: './flow-template-modal.html',
    styleUrls: ['./flow-template-modal.sass']
})
export class FlowTemplateModal implements IUniModal, OnInit {
    @Input() options: IModalOptions = {};
    @Output() onClose: EventEmitter<boolean> = new EventEmitter();

    busy: boolean;
    eventPlan: Eventplan;
    flowInputs: FlowInput[];

    constructor(
        private authService: AuthService,
        private toastService: ToastService,
        private errorService: ErrorService,
        private eventPlanService: EventplanService,
        private guidService: GuidService
    ) {}

    ngOnInit() {
        const data = this.options.data || {};
        this.eventPlan = data.eventPlan ? cloneDeep(data.eventPlan) : {};

        if (!this.eventPlan.Subscribers) {
            this.eventPlan.Subscribers = [];
        }

        this.flowInputs = this.mapSubscribersToInputs(this.eventPlan, data.inputs);
    }

    private mapSubscribersToInputs(eventplan: Eventplan, inputs: FlowInput[]): FlowInput[] {
        return (inputs || []).map(input => {
            const subscriber = eventplan.Subscribers.find(sub => sub.Name === input.Name);
            if (subscriber) {
                input.Value = subscriber.Endpoint;
            } else {
                input.Value = input.DefaultValue;
                if (input.Value === '@@user_email') {
                    input.Value = this.authService.currentUser.Email;
                }
            }

            return input;
        });
    }

    private mapInputsToSubscribers(inputs: FlowInput[], eventplan: Eventplan): Eventplan {
        inputs.forEach(input => {
            const subscriber = eventplan.Subscribers.find(sub => sub.Name === input.Name);
            if (subscriber) {
                subscriber.Endpoint = input.Value;
            } else {
                eventplan.Subscribers.push(<any> {
                    Name: input.Name,
                    Endpoint: input.Value,
                    _createguid: this.guidService.guid()
                });
            }
        });

        return eventplan;
    }

    save() {
        const isValid = !this.flowInputs || this.flowInputs.every(i => i.Value);
        if (!this.eventPlan.Name || !isValid) {
            this.toastService.addToast('Alle feltene må være fylt ut', ToastType.warn, 10);
            return;
        }

        if (this.flowInputs) {
            this.eventPlan = this.mapInputsToSubscribers(this.flowInputs, this.eventPlan);
        }

        this.eventPlan.Subscribers.forEach(sub => sub.Active = true);
        this.eventPlan.Active = true;

        this.busy = true;
        this.eventPlanService.save(this.eventPlan).subscribe(
            () => this.onClose.emit(true),
            err => {
                this.errorService.handle(err);
                this.busy = false;
            }
        );
    }
}
