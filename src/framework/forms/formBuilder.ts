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
export class UniForm implements OnInit {
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
        config.forEach((c:any) => {
            this.extendControl(c);
        });

        return config;
    }

    onSubmit(value){
        this.uniFormSubmit.next(value);
        return false;
    }




    private extendControl(c) {
        let syncValidators = this.composeSyncValidators(c);
        let asyncValidators = this.composeAsyncValidators(c);
        let messages = this.composeMessages(c);

        let controlArgs = [c.model[c.field],syncValidators,asyncValidators];
        let control = new (Function.prototype.bind.apply(Control, [null].concat(controlArgs)));

        c.control = control;
        c.errorMessages = messages;
    }

    private composeSyncValidators(c){
        let validators = this.joinValidators(c.syncValidators);
        return Validators.compose(validators);
    }

    private composeAsyncValidators(c){
        let validators = this.joinValidators(c.asyncValidators);
        return Validators.composeAsync(validators);
    }

    private joinValidators(validators) {
        let list = [];
        if (validators && isArray(validators)) {
            validators.forEach((validator)=> {
                list.push(validator.validator);

            });
        }
        return list;
    }

    private composeMessages(c) {
        let messages = {};
        this.assignMessages(c.asyncValidators,messages);
        this.assignMessages(c.syncValidators,messages);
        return messages;
    }

    private assignMessages(validators,list) {
        if (validators && isArray(validators)) {
            validators.forEach((validator)=>{
                list[validator.name] = validator.message;
            });
        }
    }
}
