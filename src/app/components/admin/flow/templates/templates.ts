import {Component} from '@angular/core';
import {Router} from '@angular/router';

import {EventplanService, ErrorService} from '@app/services/services';
import {Eventplan} from '@app/unientities';
import {UniModalService} from '@uni-framework/uni-modal';
import {ToastService, ToastType} from '@uni-framework/uniToast/toastService';

import {FlowTemplateModal} from '../flow-template-modal/flow-template-modal';
import {FLOW_TEMPLATES, FlowTemplate} from './template-data';
import { FlowModal } from '../flow-modal/flow-modal';

@Component({
    selector: 'flow-templates',
    templateUrl: './templates.html',
    styleUrls: ['./templates.sass']
})
export class FlowTemplates {
    templates = FLOW_TEMPLATES;
    existingFlows: Eventplan[];

    constructor(
        private modalService: UniModalService,
        private eventPlanService: EventplanService,
        private router: Router,
        private errorService: ErrorService,
        private toastService: ToastService,
    ) {
        this.eventPlanService.saveActions$.next([{
            label: 'Lag ny flyt',
            action: (done) => {
                this.modalService.open(FlowModal).onClose.subscribe(eventPlanCreated => {
                    done();
                    if (eventPlanCreated) {
                        this.router.navigate(['/admin/flow/flows']);
                    }
                });
            }
        }]);
    }

    ngOnInit() {
        this.eventPlanService.GetAll().subscribe(
            eventPlans => this.existingFlows = eventPlans,
            err => this.errorService.handle(err)
        );
    }

    createFlow(template: FlowTemplate) {
        const flowAlreadyCreated = this.existingFlows && this.existingFlows.some(flow => {
            return flow.JobNames === template.Eventplan.JobNames;
        });

        if (flowAlreadyCreated) {
            this.toastService.addToast(
                'Advarsel',
                ToastType.warn, 10,
                `Du har allerede laget en flyt med jobben ${template.Eventplan.JobNames}`
            );
        }

        this.modalService.open(FlowTemplateModal, {
            data: {
                eventPlan: template.Eventplan,
                inputs: template.Input
            }
        }).onClose.subscribe(planCreated => {
            if (planCreated) {
                this.router.navigate(['/admin/flow/flows']);
            }
        });
    }

}
