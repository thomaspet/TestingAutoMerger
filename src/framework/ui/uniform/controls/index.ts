import { UniTypeaheadInput } from '@uni-framework/ui/uniform/controls/typeahead/typeahead';
export * from './text/text';
export * from './numeric/numeric';
export * from './password/password';
export * from './email/email';
export * from './textarea/textarea';
export * from './url/url';
export * from './hyperlink/hyperlink';
export * from './select/select-wrapper';
export * from './autocomplete/uniform-autocomplete';
export * from './multivalue/multivalue';
export * from './radio-group/radio-group';
export * from './checkbox-group/checkbox-group';
export * from './checkbox/checkbox';
export * from './button/button';
export * from './local-date-picker/local-date-picker';
export * from './uni-search-wrapper/uni-search-wrapper';
export * from './month-picker/month-picker';

import {UniTextInput} from './text/text';
import {UniNumericInput} from './numeric/numeric';
import {UniPasswordInput} from './password/password';
import {UniEmailInput} from './email/email';
import {UniTextareaInput} from './textarea/textarea';
import {UniUrlInput} from './url/url';
import {UniHyperlinkInput} from './hyperlink/hyperlink';
import {UniSelectInput} from './select/select-wrapper';
import {UniFormAutocomplete} from './autocomplete/uniform-autocomplete';
import {UniMultivalueInput} from './multivalue/multivalue';
import {UniRadiogroupInput} from './radio-group/radio-group';
import {UniCheckboxgroupInput} from './checkbox-group/checkbox-group';
import {UniCheckboxInput} from './checkbox/checkbox';
import {UniButtonInput} from './button/button';
import {LocalDatePickerInput} from './local-date-picker/local-date-picker';
import {UniSearchWrapper} from './uni-search-wrapper/uni-search-wrapper';
import { UniStaticTextInput } from '@uni-framework/ui/uniform/controls/static-text/static-text';
import { UniMultiSelectInput } from '@uni-framework/ui/uniform/controls/multiselect/multiselect';
import {MonthPickerInput} from './month-picker/month-picker';

export const CONTROLS = [
    UniFormAutocomplete, // 0 - autocomplete
    UniButtonInput, // 1 - button
    UniSelectInput, // 3 - select
    UniSelectInput, // UniMaskedInput, // 4 - masked
    UniCheckboxInput, // 5 - checkbox
    UniNumericInput, // 6 - numeric
    UniCheckboxgroupInput, // 8 - checkbox group
    UniRadiogroupInput, // 9 - radio group
    UniTextInput, // 10 - text
    UniEmailInput, // 11 - email
    UniPasswordInput, // 12 - password
    UniHyperlinkInput, // 13 - link
    UniMultivalueInput, // 14 - multivalue
    UniUrlInput, // 15 - url
    UniTextareaInput, // 16 - textarea
    LocalDatePickerInput, // 17 - unidate
    UniSearchWrapper, // 18 - uni search wrapper
    UniMultiSelectInput, // 19 - uni multy select
    UniStaticTextInput, // 20 - uni static text
    UniTypeaheadInput, // 21 - uni typeahead
    MonthPickerInput // 22 - uni monthpicker
];

export enum CONTROLS_ENUM {
    AUTOCOMPLETE = 0, // 0 - autocomplete
    BUTTON = 1, // 1 - button
    SELECT = 3, // 3 - select
    MASKED = 4, // 4 - masked
    CHECKBOX = 5, // 5 - checkbox
    NUMERIC = 6, // 6 - numeric
    CHECKBOX_GROUP = 8, // 8 - checkbox group
    RADIO_GROUP = 9, // 9 - radio group
    TEXT = 10, // 10 - text
    EMAIL = 11, // 11 - email
    PASSWORD = 12, // 12 - password
    HYPERLINK = 13, // 13 - link
    MULTIVALUE = 14, // 14 - multivalue
    URL = 15, // 15 - url
    TEXTAREA = 16, // 16 - textarea
    LOCAL_DATE = 17, // 17 - unidate
    UNI_SEARCH = 18, // 18 - unisearch wrapper
    UNI_MULTISELECT = 19, // 19 - multisearch
    UNI_STATIC_TEXT = 20, // 20 - static text
    UNI_TYPEAHEAD = 21, // 21 - typeahead
    MONTH_PICKER = 22  // 22 - MONTH_PICKER
}
