export * from './text';
export * from './numeric';
export * from './password';
export * from './email';
export * from './textarea';
export * from './url';
export * from './hyperlink';
export * from './select';
export * from './masked';

import {UniTextInput}  from './text';
import {UniNumericInput}  from './numeric';
import {UniPasswordInput}  from './password';
import {UniEmailInput}  from './email';
import {UniTextareaInput}  from './textarea';
import {UniUrlInput}  from './url';
import {UniHyperlinkInput}  from './hyperlink';
import {UniSelectInput}  from './select';
import {UniMaskedInput}  from './masked';

export var CONTROLS = [
    undefined, // 0
    undefined, // 1
    undefined, // 2
    undefined, // 3
    UniMaskedInput, // 4
    UniSelectInput, // 5
    UniNumericInput, // 6
    undefined, // 7
    undefined, // 8
    undefined, // 9
    UniTextInput, // 10
    UniEmailInput, // 11
    UniPasswordInput, // 12
    UniHyperlinkInput, // 13
    undefined, // 14    
    UniUrlInput, // 15    
    UniTextareaInput, // 16            
];
