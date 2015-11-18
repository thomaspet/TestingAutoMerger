import {Component} from 'angular2/angular2';
import {UniForm} from '../../../framework/forms/formBuilder';

@Component({
    selector: 'uni-form-demo',
    directives: [UniForm],
    template: "<uni-form (uni-form-submit)='onSubmit($event)'></uni-form>"
})
export class UniFormDemo {
    constructor() {}

    onSubmit(value) {
        console.log("Form:", value);
    }
}