import {Component, EventEmitter, ViewChild} from '@angular/core';
import {IModalOptions, IUniModal} from '@uni-framework/uni-modal/interfaces';
import {UserService, ErrorService, TeamService, ApprovalRuleService, AssignmentDetails} from '@app/services/services';
import {User, Team, ApprovalRule} from '@app/unientities';
import {forkJoin, of} from 'rxjs';
import {NgSelectComponent} from '@ng-select/ng-select';
import {catchError} from 'rxjs/operators';

@Component({
    selector: 'assignment-modal',
    templateUrl: './assignment-modal.html',
    styleUrls: ['./assignment-modal.sass']
})
export class BillAssignmentModal implements IUniModal {
    // Override tab handling on ng-select
    // Should probably make a wrapper component for this
    @ViewChild(NgSelectComponent) set ngSelect(ngSelect: NgSelectComponent) {
        if (ngSelect) {
            (<any> ngSelect)._handleTab = function() {
                if (this.isOpen) {
                    if (this.itemsList.markedItem) {
                        ngSelect.close();
                    } else if (this.addTag) {
                        this.selectTag();
                    } else {
                        ngSelect.close();
                    }
                }
            };
        }
    }

    options: IModalOptions = {};
    onClose = new EventEmitter<AssignmentDetails>();

    busy: boolean;
    users: User[] = [];
    teams: Team[] = [];
    approvalRules: ApprovalRule[] = [];

    message: string;
    userIDs: number[] = [];
    teamID: number;
    approvalRule: ApprovalRule;

    validationMessage: string;
    assignmentMode: 'user' | 'team' | 'rule';

    constructor(
        private userService: UserService,
        private teamService: TeamService,
        private approvalRuleService: ApprovalRuleService
    ) {
        this.assignmentMode = <any> sessionStorage.getItem('bill_assignment_mode') || 'user';

        this.busy = true;
        forkJoin(
            this.userService.GetAll().pipe(catchError(() => of([]))),
            this.teamService.GetAll().pipe(catchError(() => of([]))),
            this.approvalRuleService.GetAll().pipe(catchError(() => of([])))
        ).subscribe(res => {
            this.users = (res[0] || []).filter(u => u.StatusCode === 110001);
            this.teams = res[1] || [];
            this.approvalRules = (res[2] || []).filter(rule => {
                const steps = rule.Steps || [];

                // Rules that only have one step with a limit are considered
                // global rules, and does not make sense to select here
                return (steps.length !== 1 || !steps[0].Limit);
            });

            this.busy = false;
        });
    }

    submit() {
        this.validationMessage = '';
        const assignmentDetails: AssignmentDetails = {
            Message: this.message
        };

        if (this.assignmentMode === 'user' && this.userIDs.length) {
            assignmentDetails.UserIDs = this.userIDs;
        } else if (this.assignmentMode === 'team' && this.teamID) {
            assignmentDetails.TeamIDs = [this.teamID];
        } else if (this.assignmentMode === 'rule' && this.approvalRule) {
            assignmentDetails.ApprovalRuleID = this.approvalRule.ID;
        } else {
            this.validationMessage = 'Minimum en bruker/regel/team må være valgt.';
            return;
        }

        sessionStorage.setItem('bill_assignment_mode', this.assignmentMode);
        this.onClose.emit(assignmentDetails);
    }
}
