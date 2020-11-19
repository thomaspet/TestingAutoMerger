import {Component, ContentChild, Input, TemplateRef} from '@angular/core';

@Component({
    selector: 'uni-step',
    templateUrl: './step.component.html'
})
export class UniStepComponent {
    @Input() step: any;
    @ContentChild('stepButtonTemplate') public stepButtonTemplate: TemplateRef<any>;
    @ContentChild('stepCardTemplate') public stepCardTemplate: TemplateRef<any>;
}
