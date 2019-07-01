import {Component, Input, Output, EventEmitter} from '@angular/core';
import {IModalOptions, IUniModal, ConfirmActions} from '@uni-framework/uni-modal/interfaces';
import {ApprovalRule, User, ApprovalRuleStep} from '@uni-entities';
import {ApprovalRuleService, UserService, ErrorService} from '@app/services/services';
import {UniModalService} from '@uni-framework/uni-modal/modalService';
import {cloneDeep} from 'lodash';

@Component({
    selector: 'approval-rule-modal',
    templateUrl: './approval-rule-modal.html',
    styleUrls: ['./approval-rule-modal.sass']
})
export class ApprovalRuleModal implements IUniModal {
    @Input() options: IModalOptions;
    @Output() onClose = new EventEmitter();

    rule: ApprovalRule;
    users: User[];
    busy: boolean = true;

    constructor(
        private modalService: UniModalService,
        private errorService: ErrorService,
        private userService: UserService,
        private approvalRuleService: ApprovalRuleService
    ) {}

    ngOnInit() {
        const rule = cloneDeep(this.options.data || <ApprovalRule> {});

        if (!rule.Steps || !rule.Steps.length) {
            rule.Steps = [<ApprovalRuleStep> {
                StepNumber: 1,
                _createguid: this.approvalRuleService.getNewGuid()
            }];
        }

        // Map temp variable useLimit to all steps (used in html)
        rule.Steps = rule.Steps.map(step => {
            step['_useLimit'] = step.Limit > 0;
            return step;
        });

        this.rule = rule;

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

    removeStep(index: number) {
        if (this.rule.Steps[index].ID) {
            this.rule.Steps[index].Deleted = true;
        } else {
            this.rule.Steps.splice(index, 1);
        }
    }

    addStep() {
        this.rule.Steps.push(<ApprovalRuleStep> {
            StepNumber: this.rule.Steps.length + 1,
            _createguid: this.approvalRuleService.getNewGuid()
        });
    }

    submit() {
        if (!this.rule.Steps || !this.rule.Steps.length) {
            this.onClose.emit();
        }

        // Filter out new steps that doesn't have a user
        this.rule.Steps = this.rule.Steps.filter(step => step.ID || step.UserID);

        // Re-assign step numbers on non-deleted steps
        this.rule.Steps.filter(step => !step.Deleted).forEach((step, index) => {
            step.StepNumber = index + 1;
        });

        if (this.rule.Steps.length === 1 && this.rule.Steps[0].Limit) {
            this.modalService.confirm({
                header: 'Lagre som global regel?',
                message: 'Regler som kun inneholder ett steg og der steget har grenseverdi'
                    + ' vil tolkes som en global regel, og blir kjørt på alle fakturaer',
                buttonLabels: {
                    accept: 'Lagre som global regel',
                    cancel: 'Avbryt'
                },
            }).onClose.subscribe(response => {
                if (response === ConfirmActions.ACCEPT) {
                    this.saveAndEmit();
                }
            });
        } else {
            this.saveAndEmit();
        }

    }

    private saveAndEmit() {
        const request = !!this.rule.ID
            ? this.approvalRuleService.Put(this.rule.ID, this.rule)
            : this.approvalRuleService.Post(this.rule);

        this.busy = true;
        request.subscribe(
            res => this.onClose.emit(res),
            err => {
                this.errorService.handle(err);
                this.busy = false;
            }
        );
    }
}
