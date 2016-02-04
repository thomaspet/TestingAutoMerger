import {UniFieldBuilder} from './builders/uniFieldBuilder';
import {UniFieldsetBuilder} from './builders/uniFieldsetBuilder';
import {UniGroupBuilder} from './builders/uniGroupBuilder';

export type IElementBuilder = UniFieldBuilder|UniFieldsetBuilder|UniGroupBuilder;
export type IElementBuilderCollection = Array<IElementBuilder>;
