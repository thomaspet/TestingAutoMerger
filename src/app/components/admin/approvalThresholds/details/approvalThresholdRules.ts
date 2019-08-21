// angular
import {Component, Input, OnInit} from '@angular/core';

// app
import {ISelectConfig} from '../../../../../framework/ui/uniform/index';
import {TransitionThreshold, Operator} from '../../../../unientities';
import {ThresholdService, RoleService, ErrorService, ApiModelService} from '../../../../services/services';

@Component({
    selector: 'approval-threshold-rules',
    templateUrl: './approvalThresholdRules.html'
})
export class ApprovalThresholdRules implements OnInit {
    @Input()
    public selectedTransition: any;

    public fieldSelectConfig: ISelectConfig;
    public operatorSelectConfig: ISelectConfig;
    public approverSelectConfig: ISelectConfig;

    public fields: any[] = [];
    public operators: any[] = [];
    public approvers: any[] = [];

    public thresholds: TransitionThreshold[] = [];
    public newThreshold: TransitionThreshold;

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

    public onFieldSelect(event, item?: TransitionThreshold) {
        if (item === undefined) {
            this.newThreshold.PropertyName = event;
        } else {
            item.PropertyName = event;
            this.onModifyRule(item);
        }
    }

    public onOperatorSelect(event, item?: TransitionThreshold) {
        this.newThreshold.Operator = event ? event.operator : null;

        if (item) {
            item.Operator = event.operator;
            this.onModifyRule(item);
        }
    }

    public onApproverSelect(event, item?: TransitionThreshold) {
        this.newThreshold.SharedRoleId = event ? event.ID : null;

        if (item) {
            item.SharedRoleId = event.ID;
            this.onModifyRule(item);
        }
    }

    public onModifyRule(item: TransitionThreshold) {
        this.thresholdService.Put(item.ID, item).subscribe(
            x => {},
            err => this.errorService.handle(err)
        );
    }

    public onAddRule() {
        this.newThreshold.SharedApproveTransitionId = this.selectedTransition.ID;

        this.thresholdService.Post(this.newThreshold).subscribe(
            x => {
                this.newThreshold = new TransitionThreshold();
                this.initThresholds();
            },
            err => this.errorService.handle(err)
        );
    }

    public onDeleteRule(threshold: TransitionThreshold) {
        this.thresholdService.Remove(threshold.ID, threshold).subscribe(
            x => {
                this.initThresholds();
            },
            err => this.errorService.handle(err)
        );
    }

    public getField(threshold: TransitionThreshold): string {
        return threshold.PropertyName;
    }

    public getOperator(threshold: TransitionThreshold): any {
        return this.operators.filter(o => o.operator === threshold.Operator)[0];
    }

    public getApprover(threshold: TransitionThreshold): any {
        return this.approvers.filter(a => a.ID === threshold.SharedRoleId)[0];
    }

    public isValid(): boolean {
        return this.isValidField() && this.isValidOperator() && this.isValidValue() && this.isValidApprover();
    }

    private isValidField(): boolean {
        return this.fields.filter(f => f === this.newThreshold.PropertyName)[0];
    }

    private isValidOperator(): boolean {
        return this.operators.filter(o => o.operator === this.newThreshold.Operator)[0];
    }

    private isValidValue(): boolean {
        return this.newThreshold.Value !== undefined && this.newThreshold.Value.length > 0;
    }

    private isValidApprover(): boolean {
        return this.approvers.filter(a => a.ID === this.newThreshold.SharedRoleId)[0];
    }
}
