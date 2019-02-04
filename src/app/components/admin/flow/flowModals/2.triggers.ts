import {Component, Output, EventEmitter, Input} from '@angular/core';
import {Eventplan} from '@app/unientities';
import {FlowModalPage} from '@app/components/admin/flow/flowModals/flowModal';

@Component({
    selector: 'flow-custom-modal-triggers',
    template: `
        <section>
            <h2><i class="material-icons">touch_app</i>Varsle når</h2>
            <ul>
                <li [ngClass]="{'active': eventPlan?.OperationFilter?.includes('C')}"
                    (click)="toggleOperationFilter('C')">
                    <input type="checkbox"
                           (click)="toggleOperationFilter('C')"
                           class="checkbox-round"
                           (click)="toggleOperationFilter('C')"
                           [checked]="eventPlan?.OperationFilter?.includes('C')" />
                    <span>Opprett {{eventPlan.ModelFilter}}</span>
                    Varsle når {{eventPlan.ModelFilter}} blir opprettet
                </li>
                <li [ngClass]="{'active': eventPlan?.OperationFilter?.includes('U')}"
                    (click)="toggleOperationFilter('U')">
                    <input type="checkbox"
                           (click)="toggleOperationFilter('U')"
                           class="checkbox-round"
                           (click)="toggleOperationFilter('U')"
                           [checked]="eventPlan?.OperationFilter?.includes('U')" />
                    <span>Oppdater {{eventPlan.ModelFilter}}</span>
                    Varsle når {{eventPlan.ModelFilter}} blir oppdatert
                </li>
                <li [ngClass]="{'active': eventPlan?.OperationFilter?.includes('D')}"
                    (click)="toggleOperationFilter('D')">
                    <input type="checkbox"
                           (click)="toggleOperationFilter('D')"
                           class="checkbox-round"
                           (click)="toggleOperationFilter('D')"
                           [checked]="eventPlan?.OperationFilter?.includes('D')" />
                    <span>Slett {{eventPlan.ModelFilter}}</span>
                    Varsle når {{eventPlan.ModelFilter}} blir slettet
                </li>
            </ul>
        </section>
    `,
})
export class FlowModalTriggers implements FlowModalPage {
    @Input() eventPlan: Eventplan;
    @Output() stepComplete: EventEmitter<boolean> = new EventEmitter();

    toggleOperationFilter(operation: string) {
        this.eventPlan.OperationFilter = this.eventPlan.OperationFilter || '';
        if (this.eventPlan.OperationFilter.includes(operation)) {
            this.eventPlan.OperationFilter = this.eventPlan.OperationFilter.replace(operation, '');
        } else {
            this.eventPlan.OperationFilter += operation;
        }
    }

    getErrors(): string[] {
        const errors: string[] = [];
        if (!this.eventPlan.OperationFilter) {
            errors.push('Velg minst et varsel før du går videre')
        }
        return errors;
    }
}
