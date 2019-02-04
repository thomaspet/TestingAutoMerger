import {Component} from '@angular/core';
import {EventplanService} from '@app/services/common/eventplan.service';
import {Eventplan} from '@app/unientities';
import {ErrorService} from '@app/services/common/errorService';
import {UserService} from '@app/services/common/userService';
import {UniModalService, ConfirmActions} from '@uni-framework/uni-modal';
import {FlowModal} from '@app/components/admin/flow/flowModals/flowModal';
import {templates} from './templates';

@Component({
    selector: 'my-flows',
    template: `
        <section [attr.aria-busy]="busy" class="table-container">
            <table>
                <tr *ngIf="storedEventplans?.length === 0"><th>Du har ingen flyter enda</th></tr>
                <tr *ngIf="storedEventplans?.length !== 0">
                    <th></th>
                    <th>Navn</th>
                    <th>Endret</th>
                    <th>Status</th>
                    <th>Laget av</th>
                </tr>
                <tr *ngFor="let eventplan of storedEventplans">
                    <td (click)="editTemplateModal(eventplan)">
                        <section class="icon-wrap">
                            <i [style.color]="eventplan.Color" class="material-icons not-center-icon">{{eventplan.MaterialIcon1}}</i>
                            <!--<i class="material-icons center-icon">add</i>-->
                            <i [style.color]="eventplan.Color" class="material-icons not-center-icon">{{eventplan.MaterialIcon2}}</i>
                        </section>
                    </td>
                    <td (click)="editTemplateModal(eventplan)">{{eventplan.Name}}</td>
                    <td (click)="editTemplateModal(eventplan)">{{prettyPrintDate(eventplan.UpdatedAt || eventplan.CreatedAt)}}</td>
                    <td [ngClass]="{'active':eventplan.Active}" class="toggle-cell" (click)="toggleActive(eventplan)">
                        <mat-slide-toggle [(ngModel)]="eventplan.Active" (change)="sliderChanged(eventplan)" (click)="$event.preventDefault()"></mat-slide-toggle> {{eventplan.Active ? 'Aktiv' : 'Inaktiv'}}
                    </td>
                    <td (click)="editTemplateModal(eventplan)">{{eventplan._createdByEmail}}</td>
                    <td (click)="deleteEventPlan(eventplan)">
                        <i class="material-icons delete-icon">delete_forever</i>
                    </td>
                </tr>
            </table>
        </section>
    `,
    styleUrls: ['./tabMyFlows.sass'],
})
export class FlowMyFlowTab {
    storedEventplans: Eventplan[];
    public busy = true;
    private alive = true;

    constructor(
        private eventPlanService: EventplanService,
        private errorService: ErrorService,
        private userService: UserService,
        private modalService: UniModalService,
        private eventplanService: EventplanService,
    ) {
        
        this.eventPlanService.Notifier
            .takeWhile(() => this.alive)
            .subscribe( x => { if (x.changes) { this.busy = true; this.ngOnInit(); } } );
    }

    ngOnDestroy() {
        this.alive = false;
    }

    ngOnInit() {
        function removeDuplicates(a,b) {
            a.indexOf(b) < 0 && a.push(b);
            return a;
        }

        this.eventplanService.GetAll()
            .switchMap(eventPlans => this.userService
                .getUsersByGUIDs(eventPlans.map(e => e.UpdatedBy || e.CreatedBy).reduce(removeDuplicates, []))
                .map(users => eventPlans.map(eventPlan => {
                    const user = users.find(u => u.GlobalIdentity === (eventPlan.UpdatedBy || eventPlan.CreatedBy));
                    eventPlan['_createdByEmail'] = user && user.Email;
                    const match = <any>templates.find( x => x.Eventplan.JobNames === eventPlan.JobNames) 
                        || { MaterialIcon1: 'report', MaterialIcon2: 'send' };
                    eventPlan['MaterialIcon1'] = match.MaterialIcon1;
                    eventPlan['MaterialIcon2'] = match.MaterialIcon2;
                    eventPlan['Color'] = match.Color;
                    return eventPlan;
                }))
            )
            .finally( () => this.busy = false )
            .subscribe(
                eventPlans => this.storedEventplans = eventPlans,
                err => this.errorService.handle(err),
            );
    }

    prettyPrintDate(date: Date): string {
        date = new Date(date); //In case we get string from backend
        return `${date.getDate()} ${this.dateMonthToString(date.getMonth())} ${date.getFullYear()}`;
    }

    dateMonthToString(monthNumber): string {
        const months = ['Januar', 'Februar', 'Mars', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Desember'];
        return months[monthNumber];
    }

    sliderChanged(eventPlan: Eventplan) {
        this.eventPlanService.save(eventPlan);
    }

    deleteEventPlan(eventPlanToDelete: Eventplan) {
        this.modalService
            .confirm({
                header: 'Slette?',
                message: `Sikker på at du vil slette denne flyten, dette kan ikke gjøres om på!`,
            })
            .onClose
            .filter(response => response === ConfirmActions.ACCEPT)
            .switchMap(() => this.eventPlanService.delete(eventPlanToDelete))
            .subscribe( () =>
                this.storedEventplans = this.storedEventplans.filter(t => t !== eventPlanToDelete),
                err => this.errorService.handle(err),
            );
    }

    toggleActive(eventplan: Eventplan) {
        eventplan.Active = !eventplan.Active;
        this.eventPlanService.save(eventplan);
    }

    editTemplateModal(eventplan: Eventplan) {
        return this.modalService.open(FlowModal, {data: eventplan}).onClose
            .filter(res => res && res.OperationFilter)
            .subscribe(res =>this.eventPlanService.save(res));
    }
}

