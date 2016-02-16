import {UniFieldBuilder} from './builders/uniFieldBuilder';
import {UniFieldsetBuilder} from './builders/uniFieldsetBuilder';
import {UniGroupBuilder} from './builders/uniGroupBuilder';
import {UniFormBuilder} from './builders/uniFormBuilder';
import {UniComboGroupBuilder} from './builders/uniComboGroupBuilder';

export type IElementBuilder = UniFieldBuilder|UniFieldsetBuilder|UniGroupBuilder|UniComboGroupBuilder;
export type IElementBuilderCollection = Array<IElementBuilder>;
export type IFormBuilder = UniFormBuilder;
export type IFormBuilderCollection = Array<IFormBuilder>;
