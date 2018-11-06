import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core';
import {FormControl} from '@angular/forms';

/**
 * Displays error message that is attached to an invalid control
 */
@Component({
    selector: 'show-error',
    template: `<small *ngIf="!!errorMessage">{{errorMessage}}</small>`,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ShowErrorComponent {

    @Input() public control: FormControl;

    constructor(private cd: ChangeDetectorRef) {}

    ngOnChanges() {
        if (this.control) {
            this.control.statusChanges.subscribe(x => this.cd.markForCheck());
        }
    }

    get errorMessage(): string {
        for (const key in this.control.errors) {
            switch (key) {
                case 'min':
                    return 'Field should have almost some values';
                case 'max':
                    return 'Field should have almost some values';
                case 'required':
                    return 'Field should have almost some values';
                case 'requiredTrue':
                    return 'Field should have almost some values';
                case 'email':
                    return 'Field should have almost some values';
                case 'minLength':
                    return 'Field should have almost some values';
                case 'maxLength':
                    return 'Field should have almost some values';
                case 'pattern':
                    return 'Field should have almost some values';
                case 'nullValidator':
                    return 'Field should have almost some values';
                default: {
                    const error = this.control.errors[key];
                    if (typeof error === 'string') {
                        return error;
                    }
                    return error.message || null;
                }

            }
        }
        return null;
    }
}
