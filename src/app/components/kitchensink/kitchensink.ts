/// <reference path="../../../../kendo/typescript/kendo.all.d.ts" />
import {Component} from 'angular2/core';
import {FORM_DIRECTIVES, NgControl, FormBuilder} from 'angular2/common';
import {UniTable, UniTableConfig} from '../../../framework/uniTable';
import {TabService} from '../navbar/tabstrip/tabService';

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


@Component({
	selector: 'kitchensink',
	viewProviders: [FormBuilder],
	templateUrl: 'app/components/kitchensink/kitchensink.html',
	directives: [FORM_DIRECTIVES, UNI_CONTROL_DIRECTIVES, UniTable]
})
export class Kitchensink {	
	tableConfig;
	form;
	
	autocompleteConfig: AutocompleteConfig;
	comboboxConfig: ComboboxConfig;
	datepickerConfig: DatepickerConfig;
	dropdownConfig: DropdownConfig;
	maskedInputConfig: MaskedInputConfig;
	multiselectConfig: MultiSelectConfig;
	numericInputConfig: NumericInputConfig;
	
	
	mockData = [
		{ id: "1", name: 'Felleskomponent' },
		{ id: "2", name: 'Regnskap' },
		{ id: "3", name: 'Faktura' },
		{ id: "4", name: 'Lønn' },
	];
	
	gridData = [
		{id: "1", name: 'Anders', email: 'anders.urrang@unimicro.no'},
		{id: "2", name: 'Jorge', email: 'jorge@unimicro.no'},
		{id: "3", name: 'Jørgen', email: 'jorgen@unimicro.no'},
		{id: "4", name: 'Jon Terje', email: 'jonterje@unimicro.no'},
	];
		
	constructor(private tabService: TabService, fb: FormBuilder) {	
		this.tabService.addTab({ name: 'Kitchensink', url: '/kitchensink' });
		
		this.tableConfig = new UniTableConfig('http://devapi.unieconomy.no/api/biz/orders', true)
		.addColumn('ID', 'OrdreID', 'number')
		.addColumn('CustomerName', 'Kundenavn', 'text')
		.addColumn('OrderDate', 'Ordredato', 'date')
		.addColumn('SumTotal', 'Sum', 'number')
		.setOnSelect(
			function(selectedRow) {
				console.log('Row selected!');
				console.log(selectedRow);
			}
		);
		
		this.form = fb.group({
			"autocomplete": [""],
			"combobox": [""],
			"datepicker": [""],
			"dropdown": [""],
			"maskedInput": [""],
			"multiselect": [[]],
			"numericInput": [0]
		});
		
		
		this.autocompleteConfig = {
			control: this.form.controls.autocomplete,
			kOptions: {
				dataTextField: 'name',
				dataSource: new kendo.data.DataSource({
					data: this.mockData
				})
			}
		}
		
		this.comboboxConfig = {
			control: this.form.controls.combobox,
			kOptions:  {
				delay: 50,
				dataTextField: 'name',
				dataValueField: 'id',
				dataSource: new kendo.data.DataSource({
					data: this.mockData
				}),
				template: '<span>#: data.id # - #: data.name #</span>'
			}
		}
		
		this.datepickerConfig = {
			control: this.form.controls.datepicker,
			kOptions: {}
		}
		
		this.dropdownConfig = {
			control: this.form.controls.dropdown,
			kOptions:  {
				delay: 50,
				dataTextField: 'name',
				dataValueField: 'id',
				dataSource: new kendo.data.DataSource({
					data: this.mockData
				}),
				template: '<span>#: data.id # - #: data.name #</span>'
			}
		}
		
		this.maskedInputConfig = {
			control: this.form.controls.maskedInput,
			kOptions: {
				mask: "0000 00 00000",
        		promptChar: ' '
			}
		}
		
		this.multiselectConfig = {
			control: this.form.controls.multiselect,
			kOptions:  {
				delay: 50,
				dataTextField: 'name',
				dataValueField: 'id',
				dataSource: new kendo.data.DataSource({
					data: this.mockData
				}),
			}
		}
		
		this.numericInputConfig = {
			control: this.form.controls.numericInput,
			kOptions: {
				format: '#', // http://docs.telerik.com/kendo-ui/framework/globalization/numberformatting
				min: 0,
				max: 100,
				step: 10
			}
		}
	
	}
	
	onSubmit(): void {
		console.log("Submitting:");
		console.log(this.form.value);
	}
}