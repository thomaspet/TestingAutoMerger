import {Component, FORM_DIRECTIVES, FORM_PROVIDERS, Control, FormBuilder} from 'angular2/angular2';
import {EventEmitter} from "angular2/core";

@Component({
    selector: 'uni-form',
    directives: [FORM_DIRECTIVES],
    providers: [FORM_PROVIDERS],
    outputs:['uniFormSubmit'],
    template: `
        <form (submit)="onSubmit(form.value)" no-validate [ng-form-model]="form">
            <input ng-control="name" type="text" />
            <button type="submit">submit</button>
        </form>
    `
})
export class UniForm {

    private uniFormSubmit: EventEmitter<any> = new EventEmitter<any>(true);
    private form;

    constructor(fb: FormBuilder) {
        var nameControl = new Control("Jorge");
        this.form = fb.group({"name":nameControl});
    }

    onSubmit(value){
        this.uniFormSubmit.next(value);
        return false;
    }
}
