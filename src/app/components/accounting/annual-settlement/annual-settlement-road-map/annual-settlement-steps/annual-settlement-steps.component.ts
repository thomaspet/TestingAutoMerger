import {ChangeDetectionStrategy, Component, Input, ViewEncapsulation} from '@angular/core';

@Component({
    selector: 'annual-settlement-steps-component',
    templateUrl: './annual-settlement-steps.component.html',
    styleUrls: ['./annual-settlement-steps.component.sass'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnnualSettlementStepsComponent {
    @Input() steps: any[];
    runAction(step) {
        step.action();
    }
}
