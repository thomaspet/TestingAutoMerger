import {UniFieldBuilder} from './builders/uniFieldBuilder';
import {UniFieldsetBuilder} from './builders/uniFieldsetBuilder';
import {UniGroupBuilder} from './builders/uniGroupBuilder';
import {UniComboGroupBuilder} from './builders/uniComboGroupBuilder';

export type IElementBuilder = UniFieldBuilder|UniFieldsetBuilder|UniGroupBuilder|UniComboGroupBuilder;
export type IElementBuilderCollection = Array<IElementBuilder>;
