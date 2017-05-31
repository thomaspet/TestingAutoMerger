// angular
import {Component, Input, ViewChild, OnInit, SimpleChanges} from '@angular/core';

// app
import {UniSelect, ISelectConfig} from 'uniform-ng2/main';
import {Transition, TransitionThreshold, Operator} from '../../../../unientities';
import {ThresholdService, RoleService, ErrorService, ApiModelService, ApiModel} from '../../../../services/services';

@Component({
    selector: 'approval-threshold-rules',
    templateUrl: './approvalThresholdRules.html'
})
export class ApprovalThresholdRules implements OnInit {
    @Input()
    private selectedTransition: any;

    private fieldSelectConfig: ISelectConfig;
    private operatorSelectConfig: ISelectConfig;
    private approverSelectConfig: ISelectConfig;

    private fields: any[] = [];
    private operators: any[] = [];
    private approvers: any[] = [];

    private thresholds: TransitionThreshold[] = [];
    private newThreshold: TransitionThreshold;

    constructor(
        private thresholdService: ThresholdService,
        private roleService: RoleService,
        private errorService: ErrorService,
        private apiModelService: ApiModelService
    ) {}

    public ngOnInit() {
        this.newThreshold = new TransitionThreshold();

        this.fieldSelectConfig = {
            displayProperty: 'Name',
            placeholder: 'Velg',
            searchable: false
        };

        this.operatorSelectConfig = {
            displayProperty: 'name',
            placeholder: 'Velg',
            searchable: false
        };

        this.approverSelectConfig = {
            displayProperty: 'Label',
            placeholder: 'Velg',
            searchable: false
        };

        this.initOperators();
        this.initApprovers();
    }

    public ngOnChanges() {
        if (this.selectedTransition) {
            this.initFields();
            this.newThreshold = new TransitionThreshold();
            this.initThresholds();
        }
    }

    private initThresholds() {
        this.thresholdService.GetAll('filter=SharedApproveTransitionId eq ' + this.selectedTransition.ID).subscribe(
            thresholds => {
                this.thresholds = thresholds;
            },
            err => this.errorService.handle(err)
        );
    }

    private initFields() {
        this.apiModelService.loadModelCache().then(() => {
            var model = this.apiModelService.getModel(this.selectedTransition.EntityType);
            let fields = [];

            // tslint:disable-next-line:forin
            for (let key in model.Fields) {
                fields.push(model.Fields[key].Publicname);
            }
            this.fields = fields;
        });
    }

    private initOperators() {
        this.operators = [
            {
                name: 'Større enn',
                operator: Operator.Max
            },
            {
                name: 'Større eller lik',
                operator: Operator.MaxIncl
            },
            {
                name: 'lik',
                operator: Operator.Equals
            },
            {
                name: 'Mindre eller lik',
                operator: Operator.MinIncl
            },
            {
                name: 'Mindre enn',
                operator: Operator.Min
            },
            {
                name: 'Ikke lik',
                operator: Operator.NotEquals
            }
        ];
    }

    private initApprovers() {
        this.roleService.GetAll('').subscribe(
            roles => this.approvers = roles,
            err => this.errorService.handle(err)
        );
    }

    private onFieldSelect(event, item?: TransitionThreshold) {
        if (item === undefined) {
            this.newThreshold.PropertyName = event;
        } else {
            item.PropertyName = event;
            this.onModifyRule(item);
        }
    }

    private onOperatorSelect(event, item?: TransitionThreshold) {
        this.newThreshold.Operator = event.operator;

        if (item === undefined) {
            this.newThreshold.Operator = event.operator;;
        } else {
            item.Operator = event.operator;
            this.onModifyRule(item);
        }
    }

    private onApproverSelect(event, item?: TransitionThreshold) {
        this.newThreshold.SharedRoleId = event.ID;

        if (item === undefined) {
            this.newThreshold.SharedRoleId = event.ID;
        } else {
            item.SharedRoleId = event.ID;
            this.onModifyRule(item);
        }
    }

    private onModifyRule(item: TransitionThreshold) {
        this.thresholdService.Put(item.ID, item).subscribe(
            x => {},
            err => this.errorService.handle(err)
        );
    }

    private onAddRule() {
        this.newThreshold.SharedApproveTransitionId = this.selectedTransition.ID;

        this.thresholdService.Post(this.newThreshold).subscribe(
            x => {
                this.newThreshold = new TransitionThreshold();
                this.initThresholds();
            },
            err => this.errorService.handle(err)
        );
    }

    private onDeleteRule(threshold: TransitionThreshold) {
        this.thresholdService.Remove(threshold.ID, threshold).subscribe(
            x => {
                this.initThresholds();
            },
            err => this.errorService.handle(err)
        );
    }

    private getField(threshold: TransitionThreshold): string {
        return threshold.PropertyName;
    }

    private getOperator(threshold: TransitionThreshold): any {
        return this.operators.filter(o => o.operator === threshold.Operator)[0];
    }

    private getApprover(threshold: TransitionThreshold): any {
        return this.approvers.filter(a => a.ID === threshold.SharedRoleId)[0];
    }

    private isValid(): boolean {
        return this.isValidField() && this.isValidOperator() && this.isValidValue() && this.isValidApprover();
    }

    private isValidField(): boolean {
        console.log(this.fields.filter(f => f === this.newThreshold.PropertyName)[0]);
        return this.fields.filter(f => f === this.newThreshold.PropertyName)[0];
    }

    private isValidOperator(): boolean {
        console.log(this.operators.filter(o => o.operator === this.newThreshold.Operator)[0]);
        return this.operators.filter(o => o.operator === this.newThreshold.Operator)[0];
    }

    private isValidValue(): boolean {
        console.log(this.newThreshold.Value !== undefined && this.newThreshold.Value.length > 0);
        return this.newThreshold.Value !== undefined && this.newThreshold.Value.length > 0;
    }

    private isValidApprover(): boolean {
        console.log(this.approvers.filter(a => a.ID === this.newThreshold.SharedRoleId)[0]);
        return this.approvers.filter(a => a.ID === this.newThreshold.SharedRoleId)[0];
    }
}