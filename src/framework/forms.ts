import {Type, CONST_EXPR} from 'angular2/src/facade/lang';
import {UniForm} from './forms/uniForm';
import {UniFormBuilder} from './forms/builders/uniFormBuilder';
import {UniFieldsetBuilder} from './forms/builders/uniFieldsetBuilder';
import {UniFieldBuilder} from './forms/builders/uniFieldBuilder';
import {UniComboGroupBuilder} from './forms/builders/uniComboGroupBuilder';
import {UniGroupBuilder} from './forms/builders/uniGroupBuilder';

export * from './forms/builders/controlBuilder';
export * from './forms/composers/messageComposer';
export * from './forms/showError';
export * from './forms/uniField';
export * from './forms/builders/uniFieldBuilder';
export * from './forms/uniFieldset';
export * from './forms/builders/uniFieldsetBuilder';
export * from './forms/uniForm';
export * from './forms/builders/uniFormBuilder';
export * from './forms/uniGroup';
export * from './forms/builders/uniGroupBuilder';
export * from './forms/builders/uniFormLayoutBuilder';
export * from './forms/composers/validatorsComposer';
export * from './forms/builders/uniCardFormBuilder';
export * from './forms/cardForm'; 
export * from './forms/uniComboGroup';
export * from './forms/builders/uniComboGroupBuilder';

export const UNIFORM_COMPONENTS: Type[] = CONST_EXPR([
  UniForm, 
  UniFormBuilder, 
  UniFieldsetBuilder, 
  UniFieldBuilder, 
  UniComboGroupBuilder, 
  UniGroupBuilder
]);