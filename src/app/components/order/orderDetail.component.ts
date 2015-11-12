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
  Host,
  Inject
} from 'angular2/core';

import {RouteParams} from 'angular2/router';
import {Http, HTTP_PROVIDERS} from 'angular2/http';
import {RegExpWrapper, print, isPresent} from 'angular2/src/facade/lang';
import {JsonPipe} from 'angular2/angular2';
import {OrderSvc} from "./orderSvc";

@Component({
  selector: 'model-driven-forms', 
  viewProviders: [FormBuilder, HTTP_PROVIDERS],
})
@View({
  styles: ['.ng-touched.ng-invalid { border-color: red; }'],
  templateUrl: 'app/components/order/orderDetail.component.html',
  directives: [FORM_DIRECTIVES, NgFor],
  pipes: [JsonPipe]
})
export class OrderDetail {
  form;
  order;

  constructor(public orderSvc:OrderSvc, public params:RouteParams) {
    var id = params.get('id');
    this.orderSvc.getOrder(id).subscribe(response => this.order = response);
  }

  onSubmit(): void {
    print("Submitting:");
    print(this.form.value);
  }
}