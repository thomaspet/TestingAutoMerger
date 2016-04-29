//import {CONST_EXPR} from "angular2/src/facade/lang";
import {Type} from "angular2/core";
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
import {UniMultiValue} from "./controls/multivalue/multivalue";
import {UniUrlInput} from "./controls/url/url";
import {UniTextAreaInput} from "./controls/textarea/textarea";

/**
 * !!!!!!!!!   IMPORTANT  !!!!!!!!
 *
 * This array should have the same order as enum FieldType in app/unientities.ts
 */
export const UNI_CONTROL_DIRECTIVES: Type[] = [
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
    UniHyperlink,
    UniMultiValue,
    UniUrlInput,
    UniTextAreaInput
];
