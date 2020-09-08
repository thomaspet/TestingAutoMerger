import {Component, Input, Output, EventEmitter, OnInit} from '@angular/core';
import {IModalOptions, IUniModal} from '@uni-framework/uni-modal/interfaces';
import {DistributionPlanService} from '@app/services/services';
import {Distributions} from '../../../../unientities';
import * as _ from 'lodash';

@Component({
    selector: 'select-distribution-plan-modal',
    templateUrl: './select-distribution-plan-modal.html',
    styleUrls: ['./select-distribution-plan-modal.sass']
})

export class SelectDistributionPlanModal implements OnInit, IUniModal {
    @Input()
    public options: IModalOptions = {};

    @Output()
    public onClose: EventEmitter<Distributions> = new EventEmitter();

    currentPlan: any;
    type: any;
    distribution: Distributions;
    showDropdown: boolean = false;
    busy: boolean = false;

    constructor (
        private distributionPlanService: DistributionPlanService
    ) { }

    public ngOnInit() {
        this.type = _.cloneDeep(this.options.data.type);
        this.distribution = this.options.data.distribution;
        this.currentPlan = this.type.defaultPlan;

        this.type.plans.map((plan) => {
            plan.text = plan.Elements.map((p, index) => (index + 1) + '. ' + p.ElementType._label).join(' - ');
        });
    }

    public planSelect(plan: any) {
        this.type.defaultPlan = plan;
        this.showDropdown = false;
    }

    public close() {
        this.onClose.emit(null);
    }

    public save() {
        // If no changes, just close with null
        if (this.currentPlan && this.currentPlan.ID === this.type.defaultPlan.ID) {
            this.close();
        } else {
            if (!this.distribution) {
                this.distribution = new Distributions();
                this.distribution._createguid = this.distributionPlanService.getNewGuid();
            }

            this.distribution[this.type.keyValue] = this.type.defaultPlan.ID;

            this.onClose.emit(this.distribution);
        }
    }
}
