import {Type, CONST_EXPR} from 'angular2/src/facade/lang';

import {UniAutocomplete, AutocompleteConfig} from './controls/autocomplete/autocomplete';
import {UniCheckboxInput} from './controls/checkbox/checkbox';
import {UniCombobox, ComboboxConfig} from './controls/combobox/combobox';
import {UniDatepicker, DatepickerConfig} from './controls/datepicker/datepicker';
import {UniDropdown, DropdownConfig} from './controls/dropdown/dropdown';
import {UniEmailInput} from './controls/email/email';
import {UniMaskedInput, MaskedInputConfig} from './controls/maskedInput/maskedInput';
import {UniMultiSelect, MultiSelectConfig} from './controls/multiselect/multiselect';
import {UniNumericInput, NumericInputConfig} from './controls/numeric/numericInput';
import {UniPasswordInput} from './controls/password/password';
import {UniTextInput} from './controls/text/text';
import {UniHyperlink} from './controls/hyperlink/hyperlink';

export {
	AutocompleteConfig,
	DatepickerConfig,
	NumericInputConfig,
	MaskedInputConfig,
	MultiSelectConfig,
	DropdownConfig,
	ComboboxConfig
}

/**
 * !!!!!!!!!   IMPORTANT  !!!!!!!!
 *
 * This array should have the same order as enum FieldType in interfaces/interfaces.ts
 */
export const UNI_CONTROL_DIRECTIVES: Type[] = CONST_EXPR([
    UniAutocomplete,
    UniCombobox,
    UniDatepicker,
    UniDropdown,
    UniMaskedInput,
    UniMultiSelect,
    UniNumericInput,
    UniCheckboxInput,//UniRadio
    UniCheckboxInput,
    UniCheckboxInput,//UniRadioGroup
    UniTextInput,
    UniEmailInput,
    UniPasswordInput,
    UniHyperlink
]);