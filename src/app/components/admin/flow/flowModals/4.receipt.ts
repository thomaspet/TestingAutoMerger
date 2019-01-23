import {Component, Output, EventEmitter, Input} from '@angular/core';
import {Eventplan, EventplanType} from '@app/unientities';
import {FlowModalPage} from '@app/components/admin/flow/flowModals/flowModal';

@Component({
    selector: 'flow-custom-modal-receipt',
    template: `
        <section>
            <section class="receipt-item">
                <h2><i class="material-icons">gps_fixed</i>Velg navn</h2>
                <mat-form-field>
                    <input type="text"
                           autofocus
                           name="eventplan-name"
                           [(ngModel)]="eventPlan.Name"
                           placeholder="Navn"
                           aria-label="Text"
                           matInput
                           style="border:none;">
                </mat-form-field>
            </section>
            <section class="receipt-item">
                <h2><i class="material-icons">gps_fixed</i>Entitet</h2>
                <ul>
                    <li>{{eventPlan.ModelFilter}}</li>
                </ul>
            </section>
            <section class="receipt-item">
                <h2><i class="material-icons">touch_app</i>Varsler</h2>
                <ul>
                    <li *ngIf="eventPlan.OperationFilter.includes('C')">Varsle når {{eventPlan.ModelFilter}} blir opprettet</li>
                    <li *ngIf="eventPlan.OperationFilter.includes('U')">Varsle når {{eventPlan.ModelFilter}} blir oppdatert</li>
                    <li *ngIf="eventPlan.OperationFilter.includes('D')">Varsle når {{eventPlan.ModelFilter}} blir slettet</li>
                </ul>
            </section>
            <section class="receipt-item" *ngIf="eventPlan?.PlanType !== undefined">
                <h2><i class="material-icons">flash_on</i>Plan</h2>
                <ul>
                    <li *ngIf="eventPlan.PlanType === PlanType.Webhook">
                        <span>Endepunkter i Webhook plan</span>
                        <div class="receipt-endpoint" *ngFor="let subscriber of eventPlan.Subscribers">
                            <span>{{subscriber.Name}}: </span>
                            <a target="_blank"
                               href="{{subscriber.Endpoint.startsWith('http') ? subscriber.Endpoint: 'http://' + subscriber.Endpoint}}">{{subscriber.Endpoint}}</a>
                        </div>
                    </li>
                    <li *ngIf="eventPlan.PlanType === PlanType.Custom">
                        <span>Job navn for Custom plan</span>
                        Job name: "{{eventPlan.JobNames}}"
                        <span>Verdier til job</span>
                        <div *ngFor="let subscriber of eventPlan.Subscribers">
                            {{subscriber.Name}}: {{subscriber.Endpoint}}
                        </div>
                    </li>
                </ul>
            </section>
        </section>
    `,
})
export class FlowModalReceipt implements FlowModalPage {
    @Input() eventPlan: Eventplan;
    @Output() stepComplete: EventEmitter<boolean> = new EventEmitter();

    PlanType = EventplanType;

    getErrors(): string[] {
        const errors: string[] = [];
        if (!this.eventPlan.Name) {
            errors.push('Sett et navn på flyten før du lagerer den');
        }
        return errors;
    }
}
