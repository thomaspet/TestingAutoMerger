import {Component, FORM_DIRECTIVES, FORM_PROVIDERS, Control, FormBuilder, Validators, OnInit} from 'angular2/angular2';
import {EventEmitter, NgSwitchWhen, NgSwitch, NgSwitchDefault, NgIf} from "angular2/core";
import {isArray} from 'angular2/src/facade/lang';
import {UNI_CONTROL_DIRECTIVES} from '../controls';
import {ShowError} from "./showError";

@Component({
    selector: 'uni-form',
    directives: [FORM_DIRECTIVES, UNI_CONTROL_DIRECTIVES, NgSwitchWhen, NgSwitch, NgSwitchDefault, NgIf, ShowError],
    providers: [FORM_PROVIDERS],
    inputs: ['config'],
    outputs:['uniFormSubmit'],
    templateUrl: "framework/forms/formBuilder.html"
})
export class UniForm implements OnInit{
    private config;
    private form;
    private controls;
    private uniFormSubmit: EventEmitter<any> = new EventEmitter<any>(true);
    constructor(public fb: FormBuilder) {

    }

    onInit() {
        this.controls = this.buildControls(this.config);

        let fbControls = {};
        for(let i=0;i<this.config.length;i++) {
            fbControls[this.config[i].field] = this.config[i].control;
        }
        this.form = this.fb.group(fbControls);
    }

    buildControls(config) {
        let controls = [];

        config.forEach((c:any) => {
            let control;
            let controlArgs = [c.model[c.field]];
            let validators = [];
            let messages = {};

            if (c.syncValidators && isArray(c.syncValidators)) {
                c.syncValidators.forEach((validator)=>{
                    validators.push(validator.validator);
                    messages[validator.name] = validator.message;
                });
                controlArgs.push(Validators.compose(validators));
            } else {
                controlArgs.push(undefined);
            }
            validators = [];

            if (c.asyncValidators && isArray(c.asyncValidators)) {
                c.asyncValidators.forEach((validator)=>{
                    validators.push(validator.validator);
                    messages[validator.name] = validator.message;
                });
                controlArgs.push(Validators.composeAsync(validators));
            } else {
                controlArgs.push(undefined);
            }

            control = new (Function.prototype.bind.apply(Control, [null].concat(controlArgs)));
            c.control = control;
            c.errorMessages = messages;
        });

        return config;
    }

    onSubmit(value){
        console.log(this.form);
        this.uniFormSubmit.next(value);
        return false;
    }
}
