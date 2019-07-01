import {Component, Input, Output, EventEmitter} from '@angular/core';
import {IModalOptions, IUniModal} from '@uni-framework/uni-modal/interfaces';
import {ApprovalRule, User} from '@uni-entities';
import {ApprovalRuleService, UserService, ErrorService} from '@app/services/services';
import {cloneDeep} from 'lodash';
import {forkJoin} from 'rxjs';

@Component({
    selector: 'global-rules-modal',
    templateUrl: './global-rules-modal.html',
    styleUrls: ['./approval-rule-modal.sass']
})
export class GlobalApprovalRuleModal implements IUniModal {
    @Input() options: IModalOptions;
    @Output() onClose = new EventEmitter();

    rules: ApprovalRule[];
    users: User[];
    busy: boolean = true;
    hasDeletedRules: boolean;
    validationError: string;

    constructor(
        private errorService: ErrorService,
        private userService: UserService,
        private approvalRuleService: ApprovalRuleService
    ) {}

    ngOnInit() {
        let rules = this.options.data || [];
        if (!rules.length) {
            rules = [{
                Steps: [{
                    StepNumber: 1,
                    _createguid: this.approvalRuleService.getNewGuid()
                }]
            }];
        }

        this.rules = cloneDeep(rules);

        this.userService.getActiveUsers().subscribe(
            res => {
                this.users = res;
                this.busy = false;
            },
            err => {
                this.errorService.handle(err);
                this.onClose.emit();
            }
        );
    }

    removeRule(index) {
        const rule = this.rules[index];

        if (rule.ID) {
            this.hasDeletedRules = true;
            rule['_busy'] = true;

            this.approvalRuleService.Remove(rule.ID).subscribe(
                () => this.rules.splice(index, 1),
                err => {
                    this.errorService.handle(err);
                    rule['_busy'] = false;
                }
            );
        } else {
            this.rules.splice(index, 1);
        }
    }

    addRule() {
        this.rules.push(<ApprovalRule> {
            Steps: [{
                StepNumber: 1,
                _createguid: this.approvalRuleService.getNewGuid()
            }]
        });
    }

    submit() {
        // Make sure we only save edited rules, and that they have both user and limit
        let rulesToUpdate = this.rules.filter(rule => {
            return rule['_isDirty']
                && rule.Steps[0].UserID
                && rule.Steps[0].Limit;
        });

        if (rulesToUpdate.length) {
            rulesToUpdate = rulesToUpdate.map(rule => {
                // Html select only works with strings..
                rule.Steps[0].UserID = +rule.Steps[0].UserID;

                // Description doesn't really matter for global rules currently,
                // but just in case we'll set it to the name of the approver
                const user = this.users.find(u => u.ID === rule.Steps[0].UserID);
                rule.Description = user.DisplayName || user.Email;

                return rule;
            });

            const requests = rulesToUpdate.map(rule => {
                return rule.ID
                    ? this.approvalRuleService.Put(rule.ID, rule)
                    : this.approvalRuleService.Post(rule);
            });

            this.busy = true;
            forkJoin(requests).subscribe(
                () => this.onClose.emit(true),
                err => {
                    this.errorService.handle(err);
                    this.busy = false;
                }
            );
        } else {
            this.onClose.emit(this.hasDeletedRules);
        }
    }
}
