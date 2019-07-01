import {Component} from '@angular/core';
import {ApprovalRule} from '@uni-entities';
import {UniModalService} from '@uni-framework/uni-modal';
import {ApprovalRuleModal} from '../modals/approval-rule-modal';
import {GlobalApprovalRuleModal} from '../modals/global-rules-modal';
import {ApprovalRuleService, ErrorService} from '@app/services/services';

@Component({
    selector: 'invoice-approval-rules',
    templateUrl: './invoice-approval-rules.html',
    styleUrls: ['./invoice-approval-rules.sass'],
    host: {class: 'uni-redesign'}
})
export class InvoiceApprovalRules {
    globalRuleDisplayCount = 3;

    globalRules: ApprovalRule[];
    optionalRules: ApprovalRule[];

    constructor(
        private errorService: ErrorService,
        private modalService: UniModalService,
        private approvalRuleService: ApprovalRuleService
    ) {
        this.loadData();
    }

    private loadData() {
        this.approvalRuleService.GetAll().subscribe(res => {
            const global = [];
            const optional = [];

            (res || []).forEach((rule: ApprovalRule) => {
                const steps = rule.Steps || [];
                if (steps.length === 1 && steps[0].Limit) {
                    global.push(rule);
                } else {
                    rule['_displayCount'] = 3;
                    optional.push(rule);
                }
            });

            this.globalRules = global;
            this.optionalRules = optional;
        });
    }

    openRuleModal(rule?: ApprovalRule) {
        this.modalService.open(ApprovalRuleModal, {
            data: rule
        }).onClose.subscribe(updatedRule => {
            if (updatedRule) {
                this.loadData();
            }
        });
    }

    openGlobalRuleModal() {
        this.modalService.open(GlobalApprovalRuleModal, {
            data: this.globalRules
        }).onClose.subscribe(didUpdate => {
            if (didUpdate) {
                this.loadData();
            }
        });
    }

    deleteRule(rule: ApprovalRule) {
        rule['_busy'] = true;
        this.approvalRuleService.Remove(rule.ID).subscribe(
            () => {
                this.loadData();
            },
            err => {
                this.errorService.handle(err);
                rule['_busy'] = false;
            }
        );
    }
}
