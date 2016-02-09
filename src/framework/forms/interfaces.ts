import {UniFieldBuilder} from './builders/uniFieldBuilder';
import {UniFieldsetBuilder} from './builders/uniFieldsetBuilder';
import {UniGroupBuilder} from './builders/uniGroupBuilder';
import {UniFormBuilder} from './builders/uniFormBuilder';

export type IElementBuilder = UniFieldBuilder|UniFieldsetBuilder|UniGroupBuilder;
export type IElementBuilderCollection = Array<IElementBuilder>;
export type IFormBuilder = UniFormBuilder;
export type IFormBuilderCollection = Array<IFormBuilder>;
