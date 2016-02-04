import {UniFieldBuilder} from './uniFieldBuilder';
import {UniFieldsetBuilder} from './uniFieldsetBuilder';
import {UniGroupBuilder} from './uniGroupBuilder';

export type IElementBuilder = UniFieldBuilder|UniFieldsetBuilder|UniGroupBuilder;
export type IElementBuilderCollection = Array<IElementBuilder>;
