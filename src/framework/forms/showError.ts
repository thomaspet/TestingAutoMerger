import {Component, Input} from 'angular2/core';
import {NgIf} from 'angular2/common';

@Component({
    selector: 'show-error',
    template: `
        <small *ngIf="errorMessage !== null">{{errorMessage}}</small>
    `,
    directives: [NgIf]
})
export class ShowError {

    @Input()
    control;

    @Input()
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