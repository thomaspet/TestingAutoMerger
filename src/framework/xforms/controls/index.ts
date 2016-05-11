export * from './text';
export * from './numeric';
export * from './password';
export * from './email';
export * from './textarea';
export * from './url';
export * from './hyperlink';
export * from './select';
export * from './masked';
export * from './date';
export * from './autocomplete'

import {UniTextInput}  from './text';
import {UniNumericInput}  from './numeric';
import {UniPasswordInput}  from './password';
import {UniEmailInput}  from './email';
import {UniTextareaInput}  from './textarea';
import {UniUrlInput}  from './url';
import {UniHyperlinkInput}  from './hyperlink';
import {UniSelectInput}  from './select';
import {UniMaskedInput}  from './masked';
import {UniDateInput}  from './date';
import {UniAutocompleteInput}  from './autocomplete';

export var CONTROLS = [
    UniAutocompleteInput, // 0 - autocomplete
    undefined, // 1 - combobox - deprecated
    UniDateInput, // 2
    UniSelectInput, // 3 - dropdown - deprecated
    UniMaskedInput, // 4
    undefined, // 5 - multiselect - deprecated use multivalue 
    UniNumericInput, // 6 - numeric
    undefined, // 7 - radio 
    undefined, // 8 - checkbox
    undefined, // 9 - radio group
    UniTextInput, // 10 - text
    UniEmailInput, // 11 - email
    UniPasswordInput, // 12 - password
    UniHyperlinkInput, // 13 - link 
    undefined, // 14 - multivalue
    UniUrlInput, // 15 -url
    UniTextareaInput, // 16 - textarea            
];
