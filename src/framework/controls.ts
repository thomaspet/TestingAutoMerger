import {Type, CONST_EXPR} from 'angular2/src/facade/lang';

import {Autocomplete, AutocompleteConfig} from './controls/autocomplete/autocomplete';
import {Datepicker, DatepickerConfig} from './controls/datepicker/datepicker';
import {NumericInput, NumericInputConfig} from './controls/numeric/numericInput';
import {MaskedInput, MaskedInputConfig} from './controls/maskedInput/maskedInput';
import {MultiSelect, MultiSelectConfig} from './controls/multiselect/multiselect';
import {Dropdown, DropdownConfig} from './controls/dropdown/dropdown';
import {Combobox, ComboboxConfig} from './controls/combobox/combobox';

export {
	AutocompleteConfig,
	DatepickerConfig,
	NumericInputConfig,
	MaskedInputConfig,
	MultiSelectConfig,
	DropdownConfig,
	ComboboxConfig
}

export const CONTROL_DIRECTIVES: Type[] = CONST_EXPR([
  Autocomplete,
  Datepicker,
  NumericInput,
  MaskedInput,
  MultiSelect,
  Dropdown,
  Combobox
]);