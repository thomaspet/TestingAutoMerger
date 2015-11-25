import {Component,View, Host, NgIf, NgForm, ControlGroup} from 'angular2/angular2';
import {isPresent} from 'angular2/src/facade/lang';

@Component({selector: 'show-error', inputs: ['control','messages']})
@View({
    template: `
    <small *ng-if="errorMessage !== null">{{errorMessage}}</small>
  `,
    directives: [NgIf]
})
export class ShowError {
    control;
    messages;

    constructor() {  }

    get errorMessage(): string {
        if (isPresent(this.control) && this.control.touched) {
            let em = this.messages;
            for (let key in em) {
                if (em.hasOwnProperty(key)) {
                    if (this.control.hasError(key)) {
                        return em[key];
                    }
                }
            }
        }
        return null;
    }
}