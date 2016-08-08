export * from './text';
export * from './numeric';
export * from './password';
export * from './email';
export * from './textarea';
export * from './url';
export * from './hyperlink';
export * from './select';
export * from './masked';
export * from './date/date';
export * from './autocomplete';
export * from './multivalue';
export * from './radiogroup';
export * from './checkboxgroup';
export * from './checkbox';
export * from './radio';
export * from './button';

import {UniTextInput}  from './text';
import {UniNumericInput}  from './numeric';
import {UniPasswordInput}  from './password';
import {UniEmailInput}  from './email';
import {UniTextareaInput}  from './textarea';
import {UniUrlInput}  from './url';
import {UniHyperlinkInput}  from './hyperlink';
import {UniSelectInput}  from './select';
import {UniMaskedInput}  from './masked';
import {UniDateInput}  from './date/date';
import {UniAutocompleteInput}  from './autocomplete';
import {UniMultivalueInput}  from './multivalue';
import {UniRadiogroupInput}  from './radiogroup';
import {UniCheckboxgroupInput}  from './checkboxgroup';
import {UniCheckboxInput}  from './checkbox';
import {UniRadioInput}  from './radio';
import {UniButtonInput}  from './button';

export var CONTROLS = [
    UniAutocompleteInput, // 0 - autocomplete
    UniButtonInput, // 1 - button
    UniDateInput, // 2 -  date
    UniSelectInput, // 3 - select
    UniMaskedInput, // 4 - masked
    UniCheckboxInput, // 5 - checkbox
    UniNumericInput, // 6 - numeric
    UniRadioInput, // 7 - radio
    UniCheckboxgroupInput, // 8 - checkbox group
    UniRadiogroupInput, // 9 - radio group
    UniTextInput, // 10 - text
    UniEmailInput, // 11 - email
    UniPasswordInput, // 12 - password
    UniHyperlinkInput, // 13 - link
    UniMultivalueInput, // 14 - multivalue
    UniUrlInput, // 15 - url
    UniTextareaInput, // 16 - textarea
];

export enum CONTROLS_ENUM {
    AUTOCOMPLETE = 0, // 0 - autocomplete
    BUTTON = 1, // 1 - button
    DATE = 2, // 2 -  date
    SELECT = 3, // 3 - select
    MASKED = 4, // 4 - masked
    CHECKBOX = 5, // 5 - checkbox
    NUMERIC = 6, // 6 - numeric
    RADIO = 7, // 7 - radio
    CHECKBOX_GROUP = 8, // 8 - checkbox group
    RADIO_GROUP = 9, // 9 - radio group
    TEXT = 10, // 10 - text
    EMAIL = 11, // 11 - email
    PASSWORD = 12, // 12 - password
    HYPERLINK = 13, // 13 - link
    MULTIVALUE = 14, // 14 - multivalue
    URL = 15, // 15 - url
    TEXTAREA = 16// 16 - textarea
};
