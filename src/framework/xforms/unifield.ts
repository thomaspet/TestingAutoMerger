import {Component, Input, ChangeDetectionStrategy} from 'angular2/core';
import {FORM_DIRECTIVES, FORM_PROVIDERS, ControlGroup} from 'angular2/common';
import {FieldLayout} from '../../app/unientities';
declare var _; // lodash

@Component({
    selector: 'uni-field',
    template: `
        <label ngForm *ngIf="isInput()" [class.error]="hasError()" [class]="buildClassString()" [class.-has-linebreak]="hasLineBreak()">
            <span>{{field.Label}}</span>
            <uni-component-loader [type]="field.FieldType" [config]="field"></uni-component-loader>
        </label>
    `,
    directives: [FORM_DIRECTIVES],
    providers: [FORM_PROVIDERS],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UniField {
    @Input()
    protected controls: ControlGroup;
    
    @Input()
    protected field: FieldLayout;  
    
    private classes: (string|Function)[] = [];
    
    constructor() { }
    
    private isInput() {
        return !this.isCheckbox() && !this.isRadioGroup();
    }
    private isCheckbox() {
        return this.field.FieldType === 8;
    }
    private isRadioGroup() {
        return this.field.FieldType === 9;
    }
    private hasError() {
        // TODO: Should access to the component and check the control
    }
    private buildClassString() {
        // TODO: add classess
        var classes = [];
        var cls = this.classes;
        for (var cl in cls) {
            if (cls.hasOwnProperty(cl)) {
                var value = undefined;
                if (_.isFunction(cls[cl])) {
                    value = (<Function>cls[cl])();
                } else {
                    value = cls[cl];
                }
                if (value === true) {
                    classes.push(cl);
                }
            }
        }
        return classes.join(' ');
    }
    private hasLineBreak() {
        return this.field.LineBreak;
    }
}

