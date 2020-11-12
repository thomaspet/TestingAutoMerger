import {Component, Input} from '@angular/core';

@Component({
    selector: 'annual-settlement-steps-component',
    templateUrl: './annual-settlement-steps.component.html'
})
export class AnnualSettlementStepsComponent {
    @Input() steps: any[];
    runAction(step) {
        console.log('Action for: ' + JSON.stringify(step));
    }
}
