import {
  FORM_DIRECTIVES,
  NgControl,
  Validators,
  NgFormModel,
  FormBuilder,
  NgIf,
  NgFor,
  Component,
  Directive,
  View,
  Host
} from 'angular2/core';

import {RegExpWrapper, print, isPresent} from 'angular2/src/core/facade/lang';

import {Autocomplete} from '../autocomplete/autocomplete.component';
import {Datepicker, DatepickerConfig} from '../datepicker/datepicker';

/**
 * Custom validator.
 * FORM BUILDER DOESN'T SUPPOR ASYNC VALIDATOR BUT IT WILL.
 */
export function creditCardValidator(c): {[key: string]: boolean} {
  if (isPresent(c.value) && RegExpWrapper.test(/^\d{16}$/g, c.value)) {
    return null;
  } else {
    return {"invalidCreditCard": true};
  }
}

var emailRegex = /\S+@\S+\.\S+/;
export function emailValidator(c): {[key: string]: boolean} {
  if (isPresent(c.value) && RegExpWrapper.test(emailRegex, c.value)) {
    return null;
  } else {
    return {"invalidEmail": true};
  }
}

@Component({
  selector: 'show-error', 
  inputs: ['controlPath: control', 'errorTypes: errors']
})
@View({
  template: `
    <small *ng-if="errorMessage !== null">{{errorMessage}}</small>
  `,
  directives: [NgIf]
})
export class ShowError {
  formDir;
  controlPath: string;
  errorTypes: string[];

  constructor(@Host() formDir: NgFormModel) { this.formDir = formDir; }

  get errorMessage(): string {
    var control = this.formDir.form.find(this.controlPath);
    if (isPresent(control) && control.touched) {
      for (var i = 0; i < this.errorTypes.length; ++i) {
        if (control.hasError(this.errorTypes[i])) {
          return this._errorMessage(this.errorTypes[i]);
        }
      }
    }
    return null;
  }

  _errorMessage(code: string): string {
    var config = {
      'required': 'is required', 
      'invalidCreditCard': 'is invalid credit card number',
      'invalidEmail': 'is invalid email'
    };
    return config[code];
  }
}

@Component({selector: 'model-driven-forms', viewProviders: [FormBuilder]})
@View({
  styles: ['.ng-touched.ng-invalid { border-color: red; }'],
  templateUrl: 'app/components/modelDrivenForms/modelDrivenForms.component.html',
  directives: [FORM_DIRECTIVES, NgFor, ShowError, Autocomplete, Datepicker]
})
export class ModelDrivenForms {
  form;
  countries = ['US', 'Canada'];
  
  datepickerConfig: DatepickerConfig;

  constructor(fb: FormBuilder) {
    this.form = fb.group({
      "firstName": ["", Validators.required],
      "middleName": [""],
      "lastName": ["", Validators.required],
      "country": ["Canada", Validators.required],
      "creditCard": ["", Validators.compose([Validators.required, creditCardValidator])],
      "amount": [0, Validators.required],
      "email": ["", Validators.compose([Validators.required,emailValidator])],
      "comments": [""],
      "autocomplete": [""],
      "date": ["2015-11-04T23:00:00.000Z"],
    });
    
    this.datepickerConfig = {
      control: this.form.controls.date,
      kOptions: {}
    }
  }

  onSubmit(): void {
    print("Submitting:");
    print(this.form.value);
  }
}