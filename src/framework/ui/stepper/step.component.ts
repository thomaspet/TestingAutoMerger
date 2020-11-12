import {Component, ContentChild, Input, TemplateRef} from '@angular/core';

@Component({
    selector: 'uni-step',
    templateUrl: './step.component.html'
})
export class UniStepComponent {
    @Input() step: any;
    @ContentChild('stepButtonTemplate') private stepButtonTemplate: TemplateRef<any>;
    @ContentChild('stepCardTemplate') private stepCardTemplate: TemplateRef<any>;
}
