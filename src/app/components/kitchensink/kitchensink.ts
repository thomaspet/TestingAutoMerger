/// <reference path="../../../../kendo/typescript/kendo.all.d.ts" />
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

import {UniTableComponent, ITableConfig} from '../../../framework/uniTable/uniTable.component'
import {UniTable} from '../../../framework/uniTable/uniTable'

@Component({
	selector: 'kitchensink',
	viewProviders: [FormBuilder]
})
@View({
	templateUrl: 'app/components/kitchensink/kitchensink.html',
	directives: [FORM_DIRECTIVES, UNI_CONTROL_DIRECTIVES, UniTableComponent]
})
export class Kitchensink {	
	tableConfig: ITableConfig;
	
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
		
	constructor(fb: FormBuilder) {	
		
		
		var table = new UniTable('http://devapi.unieconomy.no/api/biz/orders', true, true);
		
		// Add columns to the grid. This adds the item to both grid column array and the grid datasource model
		table.addColumn('ID', 'ID', 'number');
		table.addColumn('CustomerName', 'Kundenavn', 'text');
		table.addColumn('OrderDate', 'Ordredato', 'date');
		table.addColumn('SumTotal', 'Total', 'number');	
		
		table.setSelect((selectedRow) => {
			console.log('Row selected!');
			console.log(selectedRow);
		});
		this.tableConfig = table.getConfig();
		
		
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