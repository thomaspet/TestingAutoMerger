import { Component } from '@angular/core';
import { of as observableOf } from 'rxjs';
import { catchError } from 'rxjs/operators';
import * as moment from 'moment';

import { EventplanService, UserService, ErrorService } from '@app/services/services';
import { UniModalService, ConfirmActions } from '@uni-framework/uni-modal';
import { User, Eventplan } from '@uni-entities';
import { FLOW_TEMPLATES } from '../templates/template-data';
import { FlowModal } from '../flow-modal/flow-modal';
import { FlowTemplateModal } from '../flow-template-modal/flow-template-modal';

@Component({
    selector: 'flow-list',
    templateUrl: './flow-list.html',
    styleUrls: ['./flow-list.sass']
})
export class FlowList {
    users: User[];
    eventPlans: Eventplan[];

    constructor(
        private eventPlanService: EventplanService,
        private errorService: ErrorService,
        private userService: UserService,
        private modalService: UniModalService,
    ) {
        this.userService.GetAll().pipe(
            catchError(err => {
                this.errorService.handle(err);
                return observableOf([]);
            })
        ).subscribe(users => {
            this.users = users;
            this.getEventPlans();
        });

        this.eventPlanService.saveActions$.next([{
            label: 'Lag ny flyt',
            action: (done) => {
                this.modalService.open(FlowModal).onClose.subscribe(eventPlanCreated => {
                    done();
                    if (eventPlanCreated) {
                        this.getEventPlans();
                    }
                });
            }
        }]);
    }

    getEventPlans() {
        return this.eventPlanService.GetAll().subscribe(
            eventPlans => this.eventPlans = this.setMetadataOnEventPlans(eventPlans),
            err => this.errorService.handle(err)
        );
    }

    editPlan(eventplan: Eventplan) {
        let dialogRef;

        if (eventplan['_template']) {
            dialogRef = this.modalService.open(FlowTemplateModal, {
                data: {
                    eventPlan: eventplan,
                    inputs: eventplan['_template'].Input
                }
            });
        } else {
            dialogRef = this.modalService.open(FlowModal, { data: eventplan });
        }

        dialogRef.onClose.subscribe(planUpdated => {
            if (planUpdated) {
                this.getEventPlans();
            }
        });
    }

    activeStateChange(eventplan: Eventplan) {
        this.eventPlanService.save(eventplan).subscribe(
            () => {},
            err => {
                this.errorService.handle(err);
                // Revert active state on error
                eventplan.Active = !eventplan.Active;
            }
        );
    }

    deletePlan(eventplan: Eventplan) {
        this.modalService.confirm({
            header: 'Bekreft sletting',
            message: 'Er du sikker på at du vil slette flyten? Denne operasjonen kan ikke angres.'
        }).onClose.subscribe(modalResponse => {
            if (modalResponse === ConfirmActions.ACCEPT) {
                this.eventPlanService.Remove(eventplan.ID).subscribe(
                    () => this.eventPlans = this.eventPlans.filter(p => p !== eventplan),
                    err => this.errorService.handle(err)
                );
            }
        });
    }

    private setMetadataOnEventPlans(eventPlans: Eventplan[]): Eventplan[] {
        return eventPlans.map(plan => {
            const updatedAt = moment(plan.UpdatedAt || plan.CreatedAt);
            const updatedBy = plan.UpdatedBy || plan.CreatedBy;

            plan._hidePrivateKey = true;

            if (updatedAt.isValid()) {
                plan['_updatedAt'] = updatedAt.format('DD. MMMM YYYY');
            }

            const user = this.users.find(u => u.GlobalIdentity === updatedBy);
            if (user) {
                plan['_updatedBy'] = user.DisplayName || user.Email;
            }

            const template = FLOW_TEMPLATES.find(t => t.Eventplan.JobNames === plan.JobNames);
            if (template) {
                plan['_template'] = template;
            }

            return plan;
        });
    }
}
