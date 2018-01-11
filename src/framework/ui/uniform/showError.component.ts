import {Component, Input} from '@angular/core';
import {FormControl} from '@angular/forms';

/**
 * Displays error message that is attached to an invalid control
 */
@Component({
    selector: 'show-error',
    template: `<small *ngIf="!!errorMessage">{{errorMessage}}</small>`
})
export class ShowError {

    @Input() public control: FormControl;
    @Input() public messages: any[];

    constructor() {}

    get errorMessage(): string {
        if (this.control && this.control.touched) {
            const em = this.messages;
            for (const key in em) {
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
