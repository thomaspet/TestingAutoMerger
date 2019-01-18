import {Component} from '@angular/core';
import {EventplanService} from '@app/services/common/eventplan.service';
import {Eventplan} from '@app/unientities';
import {ErrorService} from '@app/services/common/errorService';
import {UserService} from '@app/services/common/userService';
import {UniModalService, ConfirmActions} from '@uni-framework/uni-modal';
import {FlowModal} from '@app/components/admin/flow/flowModals/flowModal';
import {FlowStoredEventplansService} from '@app/components/admin/flow/flowStoredEventplansService';

@Component({
    selector: 'my-flows',
    template: `
        <section class="table-container">
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
                            <span><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 160 200" style="enable-background:new 0 0 160 160;" xml:space="preserve"><g><path d="M93.778,141.372c-0.09,0-0.169,0.079-0.169,0.169c0,0.18,0.337,0.18,0.337,0C93.946,141.451,93.868,141.372,93.778,141.372   z"/><path d="M80.472,63.125c0.39-1.461,0.68-2.571,0.901-3.412c2.772-0.47,4.973-2.621,5.403-5.433l1.241-7.785   c0.43-2.772-0.75-5.433-2.882-7.004c0.59-2.111,0.901-4.293,0.921-6.504v-0.09c-0.15-7.614-3.452-14.679-9.135-19.642   c-0.01-1.071-0.52-2.081-1.371-2.732C70.896,6.961,65.113,5,59.259,5h-2.491c-4.853,0-9.326,2.241-13.258,4.923   c-1.041-0.28-2.171-0.07-3.042,0.6c-6.114,4.683-10.326,13.678-10.486,22.463c0.02,2.201,0.33,4.363,0.931,6.484   c-2.171,1.591-3.322,4.263-2.902,7.034l1.231,7.785c0.46,2.822,2.662,4.963,5.423,5.423c0.21,0.841,0.5,1.951,0.89,3.412   c1.041,3.943,3.292,7.455,6.374,10.056v7.375l-20.742,5.913C12.752,88.27,6.658,95.874,6.658,104.6v11.267   c0,5.913,4.803,10.726,10.716,10.726h68.411c0.57-0.31,1.161-0.59,1.771-0.841v-6.164H17.374c-2.051,0-3.712-1.671-3.712-3.722   V104.6c0-5.463,3.812-10.216,9.065-11.297c0.08-0.02,0.17-0.04,0.25-0.06l16.12-4.593l1.301,1.621   c4.303,5.383,10.726,8.465,17.621,8.465c6.894,0,13.318-3.082,17.621-8.465l1.291-1.621l10.616,3.022v-7.285l-13.448-3.822v-7.385   C77.18,70.579,79.432,67.067,80.472,63.125z M58.019,93.733c-5.363,0-10.346-2.391-13.698-6.574l0.2-0.06   c2.572-0.58,4.413-2.892,4.413-5.573v-4.112c2.862,1.481,5.974,2.221,9.085,2.221s6.224-0.74,9.075-2.221v4.112   c0,2.682,1.841,4.993,4.403,5.573l0.22,0.06C68.365,91.342,63.372,93.733,58.019,93.733z M73.708,61.344   c-0.9,3.402-3.202,6.314-6.314,7.975l-3.362,1.801c-3.772,2.021-8.265,2.011-12.027,0l-3.372-1.801   c-3.112-1.661-5.403-4.573-6.304-7.985c-1.261-4.753-1.451-5.573-1.471-5.664c-0.3-1.661-1.751-2.872-3.442-2.872h-1.321   l-1.161-7.375c-0.03-0.18,0.1-0.29,0.19-0.34c0.03,0.01,0.07,0.01,0.11,0.01c0.991,0,1.931-0.59,2.321-1.571l5.293-13.278   c3.492,0.3,7.004-0.891,9.586-3.332l2.982,2.041c5.143,3.542,11.407,4.803,17.45,3.582l5.193,10.296v0.01l0.02,0.04   c0.09,0.18,0.2,0.34,0.33,0.48c0.59,0.831,1.431,1.441,2.421,1.691c0.12,0.03,0.3,0.16,0.27,0.35l-1.181,7.395h-1.301   c-1.691,0-3.132,1.161-3.432,2.822C75.159,55.76,74.959,56.581,73.708,61.344z"/><g><path d="M109.554,135.306h36.628c1.105,0,2.001-0.896,2.001-2.001v-43.86c0-1.106-0.896-2.001-2.001-2.001h-16.427v9.958h-11.34    v-9.958h-16.427c-1.065,0-1.928,0.834-1.989,1.884v36.431C104.369,127.478,107.831,130.938,109.554,135.306z"/><path d="M150.47,138.822H106.96c-1.08-5.244-5.22-9.383-10.463-10.463V69.078c0-1.502-1.217-2.719-2.719-2.719h-6.233    c-1.502,0-2.719,1.217-2.719,2.719v0c0,1.502,1.217,2.719,2.719,2.719h3.514v56.562c-6.82,1.405-11.773,7.985-10.555,15.438    c0.915,5.601,5.418,10.104,11.019,11.019c7.453,1.218,14.033-3.736,15.438-10.555h43.663c1.55,0,2.797-1.297,2.715-2.865    C153.261,139.925,151.942,138.822,150.47,138.822z M93.778,145.212c-2.024,0-3.671-1.646-3.671-3.671s1.646-3.671,3.671-3.671    s3.671,1.646,3.671,3.671S95.802,145.212,93.778,145.212z"/></g></g></svg></span>
                            <i class="material-icons">add</i>
                            <span><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" version="1.1" style="shape-rendering:geometricPrecision;text-rendering:geometricPrecision;image-rendering:optimizeQuality;" viewBox="0 0 309 312.5" x="0px" y="0px" fill-rule="evenodd" clip-rule="evenodd"><defs></defs><g><path class="fil0" d="M65 138l133 -132c7,-8 20,-8 27,0l78 78c8,7 8,20 0,27l-132 133c-8,7 -20,7 -28,0l-78 -78c-8,-8 -8,-20 0,-28zm-60 -17c-7,0 -7,-10 0,-10l55 0c7,0 7,10 0,10l-55 0zm0 -93c-7,0 -7,-10 0,-10l147 0c7,0 7,10 0,10l-147 0zm0 31c-7,0 -7,-10 0,-10l117 0c6,0 6,10 0,10l-117 0zm0 31c-7,0 -7,-10 0,-10l86 0c6,0 6,10 0,10l-86 0zm66 54l133 -132c4,-5 11,-5 15,0l78 77c5,5 5,12 0,16l-132 133c-5,4 -12,4 -16,0l-78 -78c-4,-4 -4,-11 0,-16zm103 -1l-18 87 -8 -2 17 -83 -84 16 -2 -9 112 -21 21 -111 8 1 -16 85 83 -17 2 8 -86 18 -5 24 -24 4z"/></g></svg></span>
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

    constructor(
        private eventPlanService: EventplanService,
        private errorService: ErrorService,
        private userService: UserService,
        private modalService: UniModalService,
        private flowStoredEventplansService: FlowStoredEventplansService,
    ) {}

    ngOnInit() {
        function removeDuplicates(a,b) {
            a.indexOf(b) < 0 && a.push(b);
            return a;
        }

        this.flowStoredEventplansService.getEventplans()
            .switchMap(eventPlans => this.userService
                .getUsersByGUIDs(eventPlans.map(e => e.UpdatedBy || e.CreatedBy).reduce(removeDuplicates, []))
                .map(users => eventPlans.map(eventPlan => {
                    const user = users.find(u => u.GlobalIdentity === (eventPlan.UpdatedBy || eventPlan.CreatedBy));
                    console.log("user:", user)
                    eventPlan['_createdByEmail'] = user && user.Email;
                    return eventPlan;
                }))
            )
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
            .subscribe(
                () => this.flowStoredEventplansService.setEventplans(
                    this.storedEventplans = this.storedEventplans.filter(t => t !== eventPlanToDelete)
                ),
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

