import {Component, EventEmitter, Input, Output, ChangeDetectionStrategy} from "angular2/core";
import {FORM_DIRECTIVES, FORM_PROVIDERS, ControlGroup, FormBuilder} from "angular2/common";
import {FieldLayout} from "../../app/unientities";
declare var _; //lodash

@Component({
    selector:'uni-field',
    template: `
        <p>I am an uni-field</p>
    `,
    directives: [FORM_DIRECTIVES],
    providers: [FORM_PROVIDERS],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UniField {
    constructor(){}
}

