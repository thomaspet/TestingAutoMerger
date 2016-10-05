import {Component, Input} from '@angular/core';
import {Control} from '@angular/common';
import {NgIf} from '@angular/common';

/**
 * Displays error message that is attached to an invalid control
 */
@Component({
    selector: 'show-error',
    template: `
        <small *ngIf="errorMessage !== null">{{errorMessage}}</small>
    `
})
export class ShowError {

    @Input()
    public control: Control;

    @Input()
    public messages: any[];

    constructor() {
    }

    /**
     * Returns the first error message attached to an AbstractControl
     *
     * @returns {any}
     */
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