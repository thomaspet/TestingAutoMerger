import {Component} from '@angular/core';
import {UniModalService} from '@uni-framework/uni-modal';
import {EventplanService} from '@app/services/common/eventplan.service';
import {Eventplan, EventSubscriber} from '@app/unientities';
import {FlowModal} from '@app/components/admin/flow/flowModals/flowModal';
import {templates, FlowTemplateInterface} from '@app/components/admin/flow/templates';
import {Router} from '@angular/router';
import * as _ from 'lodash';
import {FlowGenericInputModal} from '@app/components/admin/flow/flowGenericInputModal/flowGenericInputModal';
import {Subject} from 'rxjs';
import {GuidService} from '@app/services/common/guidService';
import {ErrorService} from '@app/services/common/errorService';
import {ToastService, ToastTime, ToastType} from '@uni-framework/uniToast/toastService';
import {FlowStoredEventplansService} from '@app/components/admin/flow/flowStoredEventplansService';

@Component({
    selector: 'flow-prefabricated-tab',
    template: `
    <div class="container">
        <div class="row">
            <div class="col-lg-12 template-search">
                <i class="material-icons">search</i>
                <input placeholder="Search for Templates" type="text">
            </div>
        </div>
    
        <div class="row">
            <div class="col-lg-4" *ngFor="let template of predefinedTemplates">
                <div class="flow-temp-wrapper">
                    <div class="icon-wrap">
                        <i [style.color]="template.Color" class="material-icons not-center-icon">{{template.MaterialIcon1}}</i>
                        <i class="material-icons center-icon">add</i>
                        <i [style.color]="template.Color" class="material-icons not-center-icon">{{template.MaterialIcon2}}</i>
                    </div>
                    <div class="desc">
                        <h3>{{template.Label.no}}</h3>
                        <p>{{template.TemplateComment.no}}</p>
                    </div>
                    <div class="action-block">
                        <a href="#">{{template.TemplateName}}</a>
                        <button class="btn-round" data-toggle="modal" data-target=".flow-activation" (click)="openTemplateModal(template)">Opprett</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `,
    styleUrls: ['./prefabricatedFlowsTab.sass'],
})
export class FlowPrefabricatedTab {

    predefinedTemplates = templates;
    existingFlows: Eventplan[] = [];

    constructor(
        private modalService: UniModalService,
        private eventPlanService: EventplanService,
        private router: Router,
        private guidService: GuidService,
        private errorService: ErrorService,
        private toastService: ToastService,
    ) {}

    ngOnInit() {
        this.eventPlanService.GetAll().subscribe(
            eventPlans => this.existingFlows = eventPlans,
            err => this.errorService.handle(err),
        );
    }

    openTemplateModal(flow: FlowTemplateInterface) {

        flow = _.cloneDeep(flow);
        this.existingFlows
            .filter(exitingFlow => exitingFlow.JobNames === flow.Eventplan.JobNames)
            .forEach(exitingFlow => this.toastService.addToast(
                'Advarsel',
                ToastType.warn,
                ToastTime.medium,
                `Du har allerede laget en flyt med jobben ${exitingFlow.JobNames}`,
            ));

        let subscribers = new Subject<EventSubscriber[]>();
        if (flow.Input && flow.Input.length > 0) {
            this.modalService.open(FlowGenericInputModal, {data: flow.Input, header: `Fyll in feltene til ${flow.TemplateName}:`})
                .onClose
                .takeWhile(inputs => inputs && inputs.length > 0)
                .map(inputs => inputs.map(input => ({
                    _createguid: this.guidService.guid(),
                    Active: true,
                    Name: input.Name,
                    _title: input.Label.no,
                    Endpoint: input.Value,
                })))
                .subscribe(subs => subscribers.next(subs));
        } else {
            setTimeout(() => subscribers.next([]));
        }
        subscribers.subscribe((subs: EventSubscriber[]) => {
            flow.Eventplan.Subscribers = subs;
            const startIndex = subs.length > 0 ? 3 : 2;
            this.modalService
                .open(FlowModal, {data: flow.Eventplan, modalConfig: {startPageIndex: startIndex}}).onClose
                .filter(res => res && res.OperationFilter)
                .map(eventPlan => Object.assign({Active:true}, eventPlan))
                .subscribe(res =>
                    this.eventPlanService.save(res)
                        .then(() => this.router.navigate(['/admin/flow/my-flows']))
                );
        });
    }
}

