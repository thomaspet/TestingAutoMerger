import {Type, CONST_EXPR} from "angular2/src/facade/lang";

import {UniAutocomplete} from "./controls/autocomplete/autocomplete";
import {UniCheckboxInput} from "./controls/checkbox/checkbox";
import {UniCombobox} from "./controls/combobox/combobox";
import {UniDatepicker} from "./controls/datepicker/datepicker";
import {UniDropdown} from "./controls/dropdown/dropdown";
import {UniEmailInput} from "./controls/email/email";
import {UniMaskedInput} from "./controls/maskedInput/maskedInput";
import {UniMultiSelect} from "./controls/multiselect/multiselect";
import {UniNumericInput} from "./controls/numeric/numericInput";
import {UniPasswordInput} from "./controls/password/password";
import {UniTextInput} from "./controls/text/text";
import {UniHyperlink} from "./controls/hyperlink/hyperlink";
import {UniRadioGroup} from "./controls/radioGroup/uniRadioGroup";
import {UniRadioInput} from "./controls/radio/radio";

/**
 * !!!!!!!!!   IMPORTANT  !!!!!!!!
 *
 * This array should have the same order as enum FieldType in app/unientities.ts
 */
export const UNI_CONTROL_DIRECTIVES: Type[] = CONST_EXPR([
    UniAutocomplete,
    UniCombobox,
    UniDatepicker,
    UniDropdown,
    UniMaskedInput,
    UniMultiSelect,
    UniNumericInput,
    UniRadioInput,// uniRadio
    UniCheckboxInput,
    UniRadioGroup,// uniRadioGroup
    UniTextInput,
    UniEmailInput,
    UniPasswordInput,
    UniHyperlink
]);