import { ChangeDetectionStrategy, Component, EventEmitter, HostBinding, Input, Output, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import * as _ from 'lodash';

@Component({
    selector: 'uni-field',
    templateUrl: 'uni-field.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UniField2 {
    @Input() control: FormGroup;
    @Input() field: any;

    @Output() focusEvent: EventEmitter<any> = new EventEmitter();
    @Output() blurEvent: EventEmitter<any> = new EventEmitter();
    @Output() sourceChange: EventEmitter<any> = new EventEmitter();
    @Output() changeEvent: EventEmitter<any> = new EventEmitter();
    @Output() errorEvent: EventEmitter<any> = new EventEmitter();

    @ViewChild('component') component;

    @HostBinding('hidden')
    get Hidden() {
        return (this.field && this.field.hidden) || false;
    }

    @HostBinding('class.error')
    get hasError() {
        let hasError = false;
        _.each(this.control.errors, error => {
            if (typeof error === 'object') {
                hasError = error['error'] || false;
                return;
            } else if (typeof error === 'string') {
                hasError = true;
                return;
            }
            hasError = this.control.invalid;
        });
        return hasError;
    }

    @HostBinding('class.warn')
    get hasWarning() {
        let hasWarn = false;
        _.each(this.control.errors, error => {
            if (typeof error === 'object') {
                hasWarn = error['warning'] || false;
            }
        });
        return hasWarn;
    }

    constructor() {}

    onFocus(event) {
        this.focusEvent.emit(event);
    }

    onBlur(event) {
        this.blurEvent.emit(event);
    }

    onSourceChange(event) {
        this.sourceChange.emit(event);
    }

    onChange(event) {
        this.changeEvent.emit(event);
    }

    focusInput() {
        this.component.focusInput();
    }
}
