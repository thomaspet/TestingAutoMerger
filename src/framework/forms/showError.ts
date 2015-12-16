import {Component,View, Host} from 'angular2/core';
import {NgIf, NgForm, ControlGroup} from 'angular2/common';

@Component({selector: 'show-error', inputs: ['control','messages']})
@View({
    template: `
    <small *ngIf="errorMessage !== null">{{errorMessage}}</small>
  `,
    directives: [NgIf]
})
export class ShowError {
    control;
    messages;

    constructor() {  }

    get errorMessage(): string {
        if (this.control && this.control.touched) {
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