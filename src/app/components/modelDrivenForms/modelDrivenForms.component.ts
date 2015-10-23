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

/**
 * Custom validator.
 */
function creditCardValidator(c): {[key: string]: boolean} {
  if (isPresent(c.value) && RegExpWrapper.test(/^\d{16}$/g, c.value)) {
    return null;
  } else {
    return {"invalidCreditCard": true};
  }
}

@Component({selector: 'show-error', inputs: ['controlPath: control', 'errorTypes: errors']})
@View({
  template: `
    <span *ng-if="errorMessage !== null">{{errorMessage}}</span>
  `,
  directives: [NgIf]
})
class ShowError {
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
    var config = {'required': 'is required', 'invalidCreditCard': 'is invalid credit card number'};
    return config[code];
  }
}


@Component({selector: 'model-driven-forms', viewProviders: [FormBuilder]})
@View({
  styles: ['.ng-touched.ng-invalid { border-color: red; }'],
  template: `
    <h1>Checkout Form (Model Driven)</h1>
    <form (ng-submit)="onSubmit()" [ng-form-model]="form" #f="form">
      <p>
        <label for="firstName">First Name</label>
        <input type="text" id="firstName" ng-control="firstName">
        <show-error control="firstName" [errors]="['required']"></show-error>
      </p>
      <p>
        <label for="middleName">Middle Name</label>
        <input type="text" id="middleName" ng-control="middleName">
      </p>
      <p>
        <label for="lastName">Last Name</label>
        <input type="text" id="lastName" ng-control="lastName">
        <show-error control="lastName" [errors]="['required']"></show-error>
      </p>
      <p>
        <label for="country">Country</label>
        <select id="country" ng-control="country">
          <option *ng-for="#c of countries" [value]="c">{{c}}</option>
        </select>
      </p>
      <p>
        <label for="creditCard">Credit Card</label>
        <input type="text" id="creditCard" ng-control="creditCard">
        <show-error control="creditCard" [errors]="['required', 'invalidCreditCard']"></show-error>
      </p>
      <p>
        <label for="amount">Amount</label>
        <input type="number" id="amount" ng-control="amount">
        <show-error control="amount" [errors]="['required']"></show-error>
      </p>
      <p>
        <label for="email">Email</label>
        <input type="email" id="email" ng-control="email">
        <show-error control="email" [errors]="['required']"></show-error>
      </p>
      <p>
        <label for="comments">Comments</label>
        <textarea id="comments" ng-control="comments">
        </textarea>
      </p>
      <button type="submit" [disabled]="!f.form.valid">Submit</button>
    </form>
  `,
  directives: [FORM_DIRECTIVES, NgFor, ShowError]
})
export class ModelDrivenForms {
  form;
  countries = ['US', 'Canada'];

  constructor(fb: FormBuilder) {
    this.form = fb.group({
      "firstName": ["", Validators.required],
      "middleName": [""],
      "lastName": ["", Validators.required],
      "country": ["Canada", Validators.required],
      "creditCard": ["", Validators.compose([Validators.required, creditCardValidator])],
      "amount": [0, Validators.required],
      "email": ["", Validators.required],
      "comments": [""]
    });
  }

  onSubmit(): void {
    print("Submitting:");
    print(this.form.value);
  }
}