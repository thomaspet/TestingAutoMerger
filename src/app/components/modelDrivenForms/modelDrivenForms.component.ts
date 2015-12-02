/// <reference path="../../../../kendo/typescript/kendo.all.d.ts" />

import {
    FORM_DIRECTIVES,
    NgControl,
    Validators,
    NgFormModel,
    FormBuilder,
    NgIf,
    NgFor
} from 'angular2/common';

import {
  Component,
  Directive,
  View,
  Host
} from 'angular2/core';
import {RegExpWrapper, print, isPresent} from 'angular2/src/facade/lang';

import {
  AutocompleteConfig,
  DatepickerConfig,
  NumericInputConfig,
  MaskedInputConfig,
  MultiSelectConfig,
  DropdownConfig,
  ComboboxConfig,
  UNI_CONTROL_DIRECTIVES
} from '../../../framework/controls';

import {creditCardValidator, emailValidator} from '../../../framework/validators';

@Component({selector: 'model-driven-forms', viewProviders: [FormBuilder]})
@View({
  styles: ['.ng-touched.ng-invalid { border-color: red; }'],
  templateUrl: 'app/components/modelDrivenForms/modelDrivenForms.component.html',
  directives: [FORM_DIRECTIVES, UNI_CONTROL_DIRECTIVES, NgFor]
})
export class ModelDrivenForms {
  form;
  countries = ['US', 'Canada'];
  
  datepickerConfig: DatepickerConfig;
  numericInputConfig: NumericInputConfig;
  multiSelectConfig: MultiSelectConfig;
  dropdownConfig: DropdownConfig;
  comboboxConfig: ComboboxConfig;
  maskedInputConfig: MaskedInputConfig;
  autocompleteConfig: AutocompleteConfig;

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
      "number": [50],
      "creditCardMasked": ["33302341651"],
      "multiSelect": [[1, 4]],
      "project" : [""],
      "projectCombo": [""],
    });
    
    this.autocompleteConfig = {
      control: this.form.controls.autocomplete,
      kOptions: {
        dataSource: this.countries
      }
    }
    
    this.datepickerConfig = {
      control: this.form.controls.date,
      kOptions: {}
	}

    this.numericInputConfig = {
      control: this.form.controls.number,
      kOptions: {
        format: '#', // http://docs.telerik.com/kendo-ui/framework/globalization/numberformatting
        min: 0,
        max: 100,
        step: 10
      }
    }
    this.multiSelectConfig = {
      control: this.form.controls.multiSelect,
      kOptions: {
        delay: 50,
        dataTextField: 'name',
        dataValueField: 'id',
        dataSource: new kendo.data.DataSource(<kendo.data.DataSourceOptions> {
          data: [
            { id: "1", name: 'Felleskomponent' },
            { id: "2", name: 'Regnskap' },
            { id: "3", name: 'Faktura' },
            { id: "4", name: 'Lønn' },
          ]
        }),
      }
    }
    
    this.dropdownConfig = {
      control: this.form.controls.project,
      kOptions:  {
        dataTextField: 'name',
        dataValueField: 'id',
        dataSource: new kendo.data.DataSource(<kendo.data.DataSourceOptions> {
          data: [
            { id: "1", name: 'Felleskomponent' },
            { id: "2", name: 'Regnskap' },
            { id: "3", name: 'Faktura' },
            { id: "4", name: 'Lønn' },
          ]
        }),
        template: '<span>#: data.id # - #: data.name #</span>'  
      }
    }
    
    this.comboboxConfig = {
      control: this.form.controls.projectCombo,
      kOptions:  {
        delay: 50,
        dataTextField: 'name',
        dataValueField: 'id',
        dataSource: new kendo.data.DataSource(<kendo.data.DataSourceOptions> {
          data: [
            { id: "1", name: 'Felleskomponent' },
            { id: "2", name: 'Regnskap' },
            { id: "3", name: 'Faktura' },
            { id: "4", name: 'Lønn' },
          ]
        }),
        template: '<span>#: data.id # - #: data.name #</span>'
      }
    }
    
    this.maskedInputConfig = {
      control: this.form.controls.creditCardMasked,
      kOptions: {
        mask: "0000 00 00000",
        promptChar: ' '
      }
    }
  }

  onSubmit(): void {
    print("Submitting:");
    print(this.form.value);
  }
}